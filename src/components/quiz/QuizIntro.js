'use client'

import { useAuth } from '@/context/AuthContext'
import { useQuiz } from '@/context/QuizContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import TestRulesModal from '../TestRulesModal'

export default function QuizIntro() {
	const router = useRouter()
	const { user } = useAuth()
	const { quiz, startQuiz, isLoading } = useQuiz()
	const [showRulesModal, setShowRulesModal] = useState(false)
	const [isQuickTestLoading, setIsQuickTestLoading] = useState(false)

	// Проверяем, включены ли quick-test
	const isQuickTestEnabled =
		process.env.NEXT_PUBLIC_ENABLE_QUICK_TEST === 'true'

	if (!quiz) {
		return (
			<div className='auth-bg flex items-center justify-center min-h-screen'>
				<div className='glass-card p-8'>
					<p className='text-white text-center'>Загрузка теста...</p>
				</div>
			</div>
		)
	}

	const handleStartClick = () => {
		setShowRulesModal(true)
	}

	const handleConfirmStart = async () => {
		setShowRulesModal(false)
		try {
			await startQuiz(quiz.id)
		} catch (error) {
			console.error('Error starting quiz:', error)
			alert('Ошибка запуска теста. Попробуйте позже.')
		}
	}

	const handleQuickTest = async testType => {
		setIsQuickTestLoading(true)
		try {
			const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
			const API_KEY =
				process.env.NEXT_PUBLIC_API_KEY || 'MY_SUPER_SECRET_API_KEY'

			const res = await fetch(`${API_URL}/quick-test`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': API_KEY,
				},
				body: JSON.stringify({ test_type: testType }),
			})
			if (!res.ok) throw new Error('Ошибка запуска быстрого теста')
			const data = await res.json()
			// Перенаправляем на страницу результатов
			router.push(`/result/${data.test_id}`)
		} catch (error) {
			console.error('Error starting quick test:', error)
			alert('Ошибка при запуске быстрого теста')
		} finally {
			setIsQuickTestLoading(false)
		}
	}

	return (
		<div className='auth-bg min-h-screen flex items-center justify-center p-4'>
			<div className='glass-card p-8 max-w-2xl w-full'>
				<h1 className='text-3xl font-bold text-white mb-4'>{quiz.title}</h1>
				<p className='text-white/80 mb-6 text-lg'>{quiz.description}</p>

				{/* User info (from AuthContext - no form!) */}
				<div className='glass-card p-4 mb-6 bg-white/5'>
					<h3 className='text-white font-semibold mb-2'>
						Информация о пользователе:
					</h3>
					<p className='text-white/70'>Имя: {user?.name || 'Не указано'}</p>
					<p className='text-white/70'>Email: {user?.email || 'Не указано'}</p>
				</div>

				{/* Quiz settings */}
				<div className='mb-6 space-y-2'>
					<div className='flex items-center justify-between text-white/70'>
						<span>Количество вопросов:</span>
						<span className='font-semibold text-white'>
							{quiz.question_count}
						</span>
					</div>
					{quiz.duration_minutes && (
						<div className='flex items-center justify-between text-white/70'>
							<span>Время на прохождение:</span>
							<span className='font-semibold text-white'>
								{quiz.duration_minutes} минут
							</span>
						</div>
					)}
					<div className='flex items-center justify-between text-white/70'>
						<span>Проходной балл:</span>
						<span className='font-semibold text-white'>
							{quiz.passing_score}%
						</span>
					</div>
				</div>

				<button
					onClick={handleStartClick}
					disabled={isLoading}
					className='glass-button w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isLoading ? 'Загрузка...' : 'Начать тест'}
				</button>

				{/* Quick Test Dev Tools */}
				{isQuickTestEnabled && (
					<div className='border-t border-white/10 pt-6 mt-6 relative z-10'>
						<h3 className='text-xs font-semibold text-center mb-3 text-white/50 uppercase tracking-widest'>
							Dev Mode
						</h3>
						<div className='grid grid-cols-2 gap-2'>
							{['expert', 'intermediate', 'beginner', 'random'].map(type => (
								<button
									key={type}
									type='button'
									onClick={async e => {
										e.preventDefault()
										e.stopPropagation()
										console.log('[QuizIntro] Quick test button clicked:', type)
										await handleQuickTest(type)
									}}
									onMouseDown={e => {
										e.preventDefault()
										e.stopPropagation()
									}}
									disabled={isQuickTestLoading}
									className='px-3 py-2 text-xs font-medium rounded-lg bg-white/10 text-white/80 hover:bg-white/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer relative z-10'
									style={{ WebkitTapHighlightColor: 'transparent' }}
								>
									{isQuickTestLoading
										? '...'
										: type.charAt(0).toUpperCase() + type.slice(1)}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Rules Modal */}
			<TestRulesModal
				isOpen={showRulesModal}
				onClose={() => setShowRulesModal(false)}
				onConfirm={handleConfirmStart}
			/>
		</div>
	)
}
