'use client'

import { useQuiz } from '@/context/QuizContext'

export default function QuizQuestion() {
	const {
		currentQuestion,
		questions,
		currentQuestionIndex,
		answers,
		progress,
		isFirstQuestion,
		isLastQuestion,
		submitAnswer,
		nextQuestion,
		prevQuestion,
		finishQuiz,
		isLoading,
	} = useQuiz()

	if (!currentQuestion) {
		return (
			<div className="auth-bg flex items-center justify-center min-h-screen">
				<div className="glass-card p-8">
					<p className="text-white text-center">Загрузка вопроса...</p>
				</div>
			</div>
		)
	}

	const handleAnswer = (value) => {
		console.log('Answer clicked:', value, 'Question ID:', currentQuestion.id)
		submitAnswer(currentQuestion.id, value)
	}

	const handleNext = () => {
		if (isLastQuestion) {
			finishQuiz()
		} else {
			nextQuestion()
		}
	}

	const selectedAnswer = answers[currentQuestion.id]

	return (
		<div className="auth-bg min-h-screen p-4">
			<div className="max-w-4xl mx-auto">
				{/* Progress bar */}
				<div className="glass-card p-4 mb-6">
					<div className="flex items-center justify-between text-white mb-2">
						<span className="text-sm">
							Вопрос {currentQuestionIndex + 1} из {questions.length}
						</span>
						<span className="text-sm">{Math.round(progress)}%</span>
					</div>
					<div className="w-full bg-white/10 rounded-full h-2">
						<div
							className="bg-white/30 h-2 rounded-full transition-all duration-300"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Question */}
				<div className="glass-card p-8 mb-6">
					<h2 className="text-2xl font-bold text-white mb-6">{currentQuestion.question}</h2>

					{/* Options */}
					<div className="space-y-3" onClick={(e) => e.stopPropagation()}>
						{currentQuestion.options?.map((option) => {
							const isSelected = selectedAnswer === option.value
							return (
								<button
									key={option.value}
									type="button"
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										console.log('[QuizQuestion] Answer clicked:', option.value, 'Question:', currentQuestion.id)
										handleAnswer(option.value)
									}}
									onMouseDown={(e) => {
										e.preventDefault()
										e.stopPropagation()
									}}
									className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer select-none active:scale-[0.98] ${
										isSelected
											? 'bg-white/20 border-2 border-white/40 shadow-lg'
											: 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
									} backdrop-blur-sm`}
									style={{ WebkitTapHighlightColor: 'transparent' }}
								>
									<div className="flex items-start gap-4 pointer-events-none">
										{/* Radio button */}
										<div className="flex-shrink-0 mt-0.5">
											<div
												className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
													isSelected
														? 'border-white bg-white/30 shadow-inner'
														: 'border-white/50 bg-transparent'
												}`}
											>
												{isSelected && (
													<div className="w-3 h-3 rounded-full bg-white shadow-sm" />
												)}
											</div>
										</div>
										{/* Option text */}
										<span className="text-white flex-1 leading-relaxed">{option.text}</span>
									</div>
								</button>
							)
						})}
					</div>
				</div>

				{/* Navigation */}
				<div className="flex justify-between gap-4">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							prevQuestion()
						}}
						disabled={isFirstQuestion}
						className="glass-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						Назад
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							handleNext()
						}}
						disabled={!selectedAnswer || isLoading}
						className="glass-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					>
						{isLoading ? 'Отправка...' : isLastQuestion ? 'Завершить тест' : 'Далее'}
					</button>
				</div>
			</div>
		</div>
	)
}


