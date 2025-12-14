/**
 * API Client for LearnHub LMS
 * Handles all API requests with token management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const API_PREFIX = '/api/v1'

class ApiClient {
	constructor() {
		this.baseURL = `${API_BASE_URL}${API_PREFIX}`
	}

	/**
	 * Set tokens in localStorage (for cross-origin support) and cookies (fallback)
	 */
	async setTokens(accessToken, refreshToken) {
		// Store tokens in localStorage for cross-origin support
		if (typeof window !== 'undefined') {
			localStorage.setItem('access_token', accessToken)
			localStorage.setItem('refresh_token', refreshToken)
			console.log('[API] Tokens saved to localStorage')
		} else {
			console.warn('[API] Cannot save tokens - not in browser environment')
		}
		
		// Also set in httpOnly cookies via API route (for same-origin fallback)
		try {
			await fetch('/api/auth/set-tokens', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ accessToken, refreshToken }),
			})
		} catch (error) {
			// If cookie setting fails, that's okay - we have localStorage
			console.warn('[API] Failed to set tokens in cookies:', error)
		}
	}

	/**
	 * Clear tokens from localStorage and cookies
	 */
	async clearTokens() {
		// Clear tokens from localStorage
		if (typeof window !== 'undefined') {
			localStorage.removeItem('access_token')
			localStorage.removeItem('refresh_token')
		}
		
		// Also clear httpOnly cookies via API route
		try {
			await fetch('/api/auth/clear-tokens', { method: 'POST' })
		} catch (error) {
			// If cookie clearing fails, that's okay
			console.warn('Failed to clear tokens from cookies:', error)
		}
	}

	/**
	 * Refresh access token (uses localStorage refresh_token or API route)
	 */
	async refreshToken() {
		try {
			// Try to get refresh token from localStorage first
			const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null
			
			if (refreshToken) {
				// Use localStorage token directly
				const response = await fetch(`${this.baseURL}/auth/refresh`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ refresh_token: refreshToken }),
				})
				
				if (!response.ok) throw new Error('Token refresh failed')
				const data = await response.json()
				
				// Update tokens
				if (data.access_token && data.refresh_token) {
					await this.setTokens(data.access_token, data.refresh_token)
				}
				
				return data
			} else {
				// Fallback to API route (reads from httpOnly cookie)
				const response = await fetch('/api/auth/refresh', {
					method: 'POST',
					credentials: 'include',
				})
				if (!response.ok) throw new Error('Token refresh failed')
				const data = await response.json()
				
				// Update tokens
				if (data.access_token && data.refresh_token) {
					await this.setTokens(data.access_token, data.refresh_token)
				}
				
				return data
			}
		} catch (error) {
			await this.clearTokens()
			throw error
		}
	}

	/**
	 * Make authenticated request with automatic token refresh
	 * Uses localStorage for tokens and sends in Authorization header (for cross-origin support)
	 */
	async request(endpoint, options = {}) {
		const url = `${this.baseURL}${endpoint}`

		// Get access token from localStorage (only in browser)
		let accessToken = null
		if (typeof window !== 'undefined') {
			accessToken = localStorage.getItem('access_token')
		}
		
		const headers = {
			'Content-Type': 'application/json',
			...options.headers,
		}

		// Add Authorization header if token exists
		if (accessToken) {
			headers['Authorization'] = `Bearer ${accessToken}`
		} else {
			// Log for debugging
			console.warn('[API] No access token found in localStorage for request:', endpoint)
		}

		let response = await fetch(url, {
			...options,
			headers,
			credentials: 'include', // Still include cookies for refresh token
		})

		// If 401, try to refresh token
		if (response.status === 401) {
			try {
				await this.refreshToken()
				// Get new access token from localStorage
				const newAccessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
				if (newAccessToken) {
					headers['Authorization'] = `Bearer ${newAccessToken}`
				}
				// Retry request with new token
				response = await fetch(url, {
					...options,
					headers,
					credentials: 'include',
				})
			} catch (error) {
				// Refresh failed, clear tokens
				await this.clearTokens()
				throw new Error('Session expired')
			}
		}

		if (!response.ok) {
			const error = await response.json().catch(() => ({ message: 'Request failed' }))
			throw new Error(error.detail || error.message || 'Request failed')
		}

		return response.json()
	}

	// Auth endpoints
	async register(email, password, password_confirm, name) {
		const response = await fetch(`${this.baseURL}/auth/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password, password_confirm, name }),
		})
		const data = await response.json()
		if (!response.ok) {
			// Handle Pydantic validation errors
			if (Array.isArray(data.detail)) {
				const errors = data.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
				throw new Error(errors)
			}
			throw new Error(data.detail || 'Registration failed')
		}
		return data
	}

	async login(email, password) {
		const response = await fetch(`${this.baseURL}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ email, password }),
		})
		const data = await response.json()
		if (!response.ok) {
			// Handle Pydantic validation errors
			if (Array.isArray(data.detail)) {
				const errors = data.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
				throw new Error(errors)
			}
			throw new Error(data.detail || 'Login failed')
		}
		
		// Set tokens in localStorage and cookies
		if (data.access_token && data.refresh_token) {
			console.log('[API] Login successful, saving tokens...')
			await this.setTokens(data.access_token, data.refresh_token)
			
			// Verify tokens were saved
			if (typeof window !== 'undefined') {
				const savedAccess = localStorage.getItem('access_token')
				const savedRefresh = localStorage.getItem('refresh_token')
				console.log('[API] Tokens verification:', {
					accessTokenSaved: !!savedAccess,
					refreshTokenSaved: !!savedRefresh,
					accessTokenLength: savedAccess?.length || 0,
				})
			}
		} else {
			console.warn('[API] No tokens in login response:', data)
		}
		
		return data
	}

	async logout() {
		try {
			await this.request('/auth/logout', { method: 'POST' })
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			await this.clearTokens()
		}
	}

	async verifyEmail(email, code) {
		const response = await fetch(`${this.baseURL}/auth/verify-email`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ code }), // Backend expects only code, not email
		})
		const data = await response.json()
		if (!response.ok) {
			if (Array.isArray(data.detail)) {
				const errors = data.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
				throw new Error(errors)
			}
			throw new Error(data.detail || 'Verification failed')
		}
		return data
	}

	async resendVerificationCode(email) {
		const response = await fetch(`${this.baseURL}/auth/resend-verification-code`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		})
		const data = await response.json()
		if (!response.ok) {
			if (Array.isArray(data.detail)) {
				const errors = data.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
				throw new Error(errors)
			}
			throw new Error(data.detail || 'Failed to resend code')
		}
		return data
	}

	async forgotPassword(email) {
		const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email }),
		})
		const data = await response.json()
		if (!response.ok) throw new Error(data.detail || 'Failed to send reset code')
		return data
	}

	async resetPassword(email, code, newPassword, newPasswordConfirm) {
		const response = await fetch(`${this.baseURL}/auth/reset-password`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ 
				email, 
				code, 
				new_password: newPassword,
				new_password_confirm: newPasswordConfirm 
			}),
		})
		const data = await response.json()
		if (!response.ok) {
			if (Array.isArray(data.detail)) {
				const errors = data.detail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ')
				throw new Error(errors)
			}
			throw new Error(data.detail || 'Password reset failed')
		}
		return data
	}

	async getCurrentUser() {
		// Make request - if fails with 401, user is not authenticated
		// This is expected for unauthenticated users, so we handle it gracefully
		try {
			return await this.request('/auth/me')
		} catch (error) {
			// If it's a 401 or "Session expired", user is not authenticated
			if (error.message.includes('401') || error.message.includes('Session expired') || error.message.includes('Not authenticated')) {
				throw new Error('Not authenticated')
			}
			throw error
		}
	}
}

export const apiClient = new ApiClient()
