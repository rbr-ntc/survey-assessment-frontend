'use client'

import { Suspense } from 'react'
import VerifyEmailForm from './VerifyEmailForm'

function LoadingFallback() {
	return (
		<div className="auth-bg flex items-center justify-center min-h-screen p-4">
			<div className="glass-card w-full max-w-md p-8 relative z-10">
				<p className="text-white text-center">Загрузка...</p>
			</div>
		</div>
	)
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<LoadingFallback />}>
			<VerifyEmailForm />
		</Suspense>
	)
}
