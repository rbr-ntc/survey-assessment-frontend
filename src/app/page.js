'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Page() {
	const { loading, isAuthenticated } = useAuth()
	const router = useRouter()

	useEffect(() => {
		// Redirect based on authentication status
		if (!loading) {
			if (isAuthenticated) {
				// If authenticated, redirect to dashboard
				router.push('/dashboard')
			} else {
				// If not authenticated, redirect to login
				router.push('/login')
			}
		}
	}, [loading, isAuthenticated, router])

	// Show loading state while checking auth
	return (
		<div className="auth-bg flex items-center justify-center min-h-screen">
			<div className="glass-card p-8">
				<p className="text-white text-center">Загрузка...</p>
			</div>
		</div>
	)
}
