'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useQuiz } from '@/context/QuizContext'
import QuizIntro from './QuizIntro'
import QuizQuestion from './QuizQuestion'
import QuizResults from './QuizResults'
import AILoader from '../AILoader'

export default function QuizRunner({ quizId }) {
	const router = useRouter()
	const { user, loading: authLoading, isAuthenticated } = useAuth()
	const { status, loadQuiz, quiz, isLoading } = useQuiz()

	// Normalize quizId (add 'quiz:' prefix if not present, but remove for API call)
	const normalizedQuizId = quizId?.startsWith('quiz:') ? quizId : `quiz:${quizId}`

	// Load quiz on mount
	useEffect(() => {
		if (normalizedQuizId && !quiz) {
			loadQuiz(normalizedQuizId)
		}
	}, [normalizedQuizId, quiz, loadQuiz])

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!authLoading && !isAuthenticated) {
			router.push('/login')
		}
	}, [authLoading, isAuthenticated, router])

	// Show loading while checking auth or loading quiz
	if (authLoading || (status === 'loading' && !quiz)) {
		return (
			<div className="auth-bg flex items-center justify-center min-h-screen">
				<div className="glass-card p-8">
					<p className="text-white text-center">Загрузка...</p>
				</div>
			</div>
		)
	}

	// Show error state
	if (status === 'error') {
		return (
			<div className="auth-bg flex items-center justify-center min-h-screen">
				<div className="glass-card p-8 max-w-md">
					<h2 className="text-2xl font-bold text-white mb-4">Ошибка</h2>
					<p className="text-white/80 mb-4">
						Не удалось загрузить тест. Проверьте, что тест существует.
					</p>
					<button
						onClick={() => router.push('/dashboard')}
						className="glass-button w-full py-2"
					>
						Вернуться на главную
					</button>
				</div>
			</div>
		)
	}

	// Show intro screen
	if (status === 'intro') {
		return <QuizIntro />
	}

	// Show question screen
	if (status === 'in_progress') {
		return <QuizQuestion />
	}

	// Show results screen
	if (status === 'completed') {
		return <QuizResults />
	}

	// Show loading during submission
	if (isLoading) {
		return (
			<div className="auth-bg flex items-center justify-center min-h-screen">
				<AILoader message="Обрабатываем ваши ответы и рассчитываем результаты..." />
			</div>
		)
	}

	// Default fallback
	return (
		<div className="auth-bg flex items-center justify-center min-h-screen">
			<div className="glass-card p-8">
				<p className="text-white text-center">Загрузка...</p>
			</div>
		</div>
	)
}

