'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SystemAnalystAssessment from '../components/SystemAnalystAssessment'

export default function Page() {
	const { user, loading, isAuthenticated } = useAuth()
	const router = useRouter()

	useEffect(() => {
		// Only redirect if we're sure user is not authenticated (not just loading)
		// Use a ref or check to prevent multiple redirects
		if (loading === false && !isAuthenticated) {
			router.push('/login')
		}
	}, [loading, isAuthenticated, router])

	// Show loading state while checking auth
	if (loading) {
		return (
			<div className="auth-bg flex items-center justify-center min-h-screen">
				<div className="glass-card p-8">
					<p className="text-white text-center">Загрузка...</p>
				</div>
			</div>
		)
	}

	// If not authenticated, don't render (redirect will happen)
	if (!isAuthenticated) {
		return null
	}

	// If authenticated, show the assessment
	return (
		<div>
			<SystemAnalystAssessment />
		</div>
	)
}
