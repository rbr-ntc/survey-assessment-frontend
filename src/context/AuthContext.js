'use client'

import { apiClient } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

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

	const checkAuth = useCallback(async () => {
		try {
			// Try to get current user - if fails, user is not authenticated
			const userData = await apiClient.getCurrentUser()
			setUser(userData)
			setError(null)
		} catch (err) {
			// User is not authenticated - this is normal, don't show error
			// Only log if it's not a "Not authenticated" error
			if (!err.message || !err.message.includes('Not authenticated')) {
				console.error('Auth check error:', err)
			}
			setUser(null)
			setError(null)
		} finally {
			setLoading(false)
		}
	}, [])

	const login = useCallback(async (email, password) => {
		try {
			setError(null)
			const data = await apiClient.login(email, password)
			// Tokens are saved synchronously to localStorage, so we can check auth immediately
			// Small delay to ensure any async operations complete
			await new Promise(resolve => setTimeout(resolve, 50))
			await checkAuth() // Refresh user data
			return data
		} catch (err) {
			setError(err.message)
			throw err
		}
	}, [checkAuth])

	const register = useCallback(async (email, password, password_confirm, name) => {
		try {
			setError(null)
			const data = await apiClient.register(
				email,
				password,
				password_confirm,
				name
			)
			return data
		} catch (err) {
			const errorMessage =
				typeof err.message === 'string'
					? err.message
					: typeof err === 'string'
					? err
					: 'Ошибка регистрации'
			setError(errorMessage)
			throw err
		}
	}, [])

	const logout = useCallback(async () => {
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
	}, [router])

	const verifyEmail = useCallback(async (email, code) => {
		try {
			setError(null)
			const data = await apiClient.verifyEmail(email, code)
			await checkAuth() // Refresh user data after verification
			return data
		} catch (err) {
			setError(err.message)
			throw err
		}
	}, [checkAuth])

	const resendVerificationCode = useCallback(async email => {
		try {
			setError(null)
			return await apiClient.resendVerificationCode(email)
		} catch (err) {
			setError(err.message)
			throw err
		}
	}, [])

	const forgotPassword = useCallback(async email => {
		try {
			setError(null)
			return await apiClient.forgotPassword(email)
		} catch (err) {
			setError(err.message)
			throw err
		}
	}, [])

	const resetPassword = useCallback(async (email, code, newPassword) => {
		try {
			setError(null)
			const data = await apiClient.resetPassword(email, code, newPassword)
			return data
		} catch (err) {
			setError(err.message)
			throw err
		}
	}, [])

	// Memoize value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({
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
		}),
		[user, loading, error, login, register, logout, verifyEmail, resendVerificationCode, forgotPassword, resetPassword, checkAuth]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
