'use client'

import { useRouter } from 'next/navigation'
import { useQuiz } from '@/context/QuizContext'

export default function QuizResults() {
	const router = useRouter()
	const { attempt, quiz } = useQuiz()

	if (!attempt) {
		return (
			<div className="auth-bg flex items-center justify-center min-h-screen">
				<div className="glass-card p-8">
					<p className="text-white text-center">Загрузка результатов...</p>
				</div>
			</div>
		)
	}

	const handleRestart = () => {
		router.push(`/test/${quiz?.id?.replace('quiz:', '') || 'system-analyst-assessment'}`)
	}

	const handleDashboard = () => {
		router.push('/dashboard')
	}

	const getScoreColor = (score) => {
		if (score >= 80) return '#059669' // green
		if (score >= 60) return '#2563eb' // blue
		if (score >= 40) return '#f59e0b' // orange
		return '#ef4444' // red
	}

	return (
		<div className="auth-bg min-h-screen p-4">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="glass-card p-8 mb-6 text-center">
					<h1 className="text-4xl font-bold text-white mb-4">Результаты теста</h1>
					<div className="text-6xl mb-4">
						{attempt.passed ? '✅' : '📊'}
					</div>
					<p className="text-2xl text-white/80 mb-2">
						{attempt.passed ? 'Тест пройден!' : 'Тест не пройден'}
					</p>
					<div
						className="text-5xl font-bold mb-2"
						style={{ color: getScoreColor(attempt.score || 0) }}
					>
						{attempt.score || 0}%
					</div>
					{attempt.level && (
						<p className="text-xl text-white/70">Уровень: {attempt.level}</p>
					)}
				</div>

				{/* Category scores */}
				{attempt.category_scores && (
					<div className="glass-card p-6 mb-6">
						<h2 className="text-2xl font-bold text-white mb-4">Результаты по категориям</h2>
						<div className="space-y-4">
							{Object.entries(attempt.category_scores).map(([category, score]) => (
								<div key={category}>
									<div className="flex items-center justify-between mb-2">
										<span className="text-white font-semibold">{category}</span>
										<span
											className="text-lg font-bold"
											style={{ color: getScoreColor(score) }}
										>
											{score}%
										</span>
									</div>
									<div className="w-full bg-white/10 rounded-full h-2">
										<div
											className="h-2 rounded-full transition-all duration-300"
											style={{
												width: `${score}%`,
												backgroundColor: getScoreColor(score),
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Strengths and weaknesses */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
					{attempt.strengths && attempt.strengths.length > 0 && (
						<div className="glass-card p-6">
							<h3 className="text-xl font-bold text-white mb-4">Сильные стороны</h3>
							<ul className="space-y-2">
								{attempt.strengths.map((strength, index) => (
									<li key={index} className="text-white/80">
										✅ {strength.name || strength} ({strength.score || ''}%)
									</li>
								))}
							</ul>
						</div>
					)}
					{attempt.weaknesses && attempt.weaknesses.length > 0 && (
						<div className="glass-card p-6">
							<h3 className="text-xl font-bold text-white mb-4">Зоны развития</h3>
							<ul className="space-y-2">
								{attempt.weaknesses.map((weakness, index) => (
									<li key={index} className="text-white/80">
										📈 {weakness.name || weakness} ({weakness.score || ''}%)
									</li>
								))}
							</ul>
						</div>
					)}
				</div>

				{/* Recommendations */}
				{attempt.recommendations && (
					<div className="glass-card p-6 mb-6">
						<h3 className="text-xl font-bold text-white mb-4">Рекомендации</h3>
						<div
							className="text-white/80 prose prose-invert max-w-none"
							dangerouslySetInnerHTML={{
								__html: attempt.recommendations.replace(/\n/g, '<br />'),
							}}
						/>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-4 justify-center">
					<button onClick={handleRestart} className="glass-button px-6 py-3">
						Пройти снова
					</button>
					<button onClick={handleDashboard} className="glass-button px-6 py-3">
						На главную
					</button>
				</div>
			</div>
		</div>
	)
}

