'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SystemAnalystAssessment from '../../components/SystemAnalystAssessment'

export default function TestPage() {
	const { user, loading, isAuthenticated } = useAuth()
	const router = useRouter()

	useEffect(() => {
		// Redirect to login if not authenticated
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

