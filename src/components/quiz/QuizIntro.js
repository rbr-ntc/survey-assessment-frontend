'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useQuiz } from '@/context/QuizContext'
import TestRulesModal from '../TestRulesModal'

export default function QuizIntro() {
	const { user } = useAuth()
	const { quiz, startQuiz, isLoading } = useQuiz()
	const [showRulesModal, setShowRulesModal] = useState(false)

	if (!quiz) {
		return (
			<div className="auth-bg flex items-center justify-center min-h-screen">
				<div className="glass-card p-8">
					<p className="text-white text-center">Загрузка теста...</p>
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

	return (
		<div className="auth-bg min-h-screen flex items-center justify-center p-4">
			<div className="glass-card p-8 max-w-2xl w-full">
				<h1 className="text-3xl font-bold text-white mb-4">{quiz.title}</h1>
				<p className="text-white/80 mb-6 text-lg">{quiz.description}</p>

				{/* User info (from AuthContext - no form!) */}
				<div className="glass-card p-4 mb-6 bg-white/5">
					<h3 className="text-white font-semibold mb-2">Информация о пользователе:</h3>
					<p className="text-white/70">Имя: {user?.name || 'Не указано'}</p>
					<p className="text-white/70">Email: {user?.email || 'Не указано'}</p>
				</div>

				{/* Quiz settings */}
				<div className="mb-6 space-y-2">
					<div className="flex items-center justify-between text-white/70">
						<span>Количество вопросов:</span>
						<span className="font-semibold text-white">{quiz.question_count}</span>
					</div>
					{quiz.duration_minutes && (
						<div className="flex items-center justify-between text-white/70">
							<span>Время на прохождение:</span>
							<span className="font-semibold text-white">{quiz.duration_minutes} минут</span>
						</div>
					)}
					<div className="flex items-center justify-between text-white/70">
						<span>Проходной балл:</span>
						<span className="font-semibold text-white">{quiz.passing_score}%</span>
					</div>
				</div>

				<button
					onClick={handleStartClick}
					disabled={isLoading}
					className="glass-button w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isLoading ? 'Загрузка...' : 'Начать тест'}
				</button>
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

