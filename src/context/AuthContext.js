'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const router = useRouter()

	// Check if user is authenticated on mount
	useEffect(() => {
		checkAuth()
	}, [])

	const checkAuth = async () => {
		try {
			// Try to get current user - if fails, user is not authenticated
			const userData = await apiClient.getCurrentUser()
			setUser(userData)
			setError(null)
		} catch (err) {
			// User is not authenticated - this is normal, don't show error
			setUser(null)
			setError(null)
		} finally {
			setLoading(false)
		}
	}

	const login = async (email, password) => {
		try {
			setError(null)
			const data = await apiClient.login(email, password)
			// Wait a bit for cookies to be set before checking auth
			await new Promise(resolve => setTimeout(resolve, 100))
			await checkAuth() // Refresh user data
			return data
		} catch (err) {
			setError(err.message)
			throw err
		}
	}

	const register = async (email, password, password_confirm, name) => {
		try {
			setError(null)
			const data = await apiClient.register(email, password, password_confirm, name)
			return data
		} catch (err) {
			const errorMessage = typeof err.message === 'string' 
				? err.message 
				: typeof err === 'string' 
					? err 
					: 'Ошибка регистрации'
			setError(errorMessage)
			throw err
		}
	}

	const logout = async () => {
		try {
			await apiClient.logout()
			setUser(null)
			router.push('/login')
		} catch (err) {
			console.error('Logout error:', err)
			// Still clear user state even if API call fails
			setUser(null)
			router.push('/login')
		}
	}

	const verifyEmail = async (email, code) => {
		try {
			setError(null)
			const data = await apiClient.verifyEmail(email, code)
			await checkAuth() // Refresh user data after verification
			return data
		} catch (err) {
			setError(err.message)
			throw err
		}
	}

	const resendVerificationCode = async (email) => {
		try {
			setError(null)
			return await apiClient.resendVerificationCode(email)
		} catch (err) {
			setError(err.message)
			throw err
		}
	}

	const forgotPassword = async (email) => {
		try {
			setError(null)
			return await apiClient.forgotPassword(email)
		} catch (err) {
			setError(err.message)
			throw err
		}
	}

	const resetPassword = async (email, code, newPassword) => {
		try {
			setError(null)
			const data = await apiClient.resetPassword(email, code, newPassword)
			return data
		} catch (err) {
			setError(err.message)
			throw err
		}
	}

	const value = {
		user,
		loading,
		error,
		login,
		register,
		logout,
		verifyEmail,
		resendVerificationCode,
		forgotPassword,
		resetPassword,
		checkAuth,
		isAuthenticated: !!user,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
