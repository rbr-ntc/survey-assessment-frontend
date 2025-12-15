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
					<div className="space-y-3">
						{currentQuestion.options?.map((option) => (
							<button
								key={option.value}
								onClick={() => handleAnswer(option.value)}
								className={`w-full text-left glass-card p-4 transition-all ${
									selectedAnswer === option.value
										? 'bg-white/20 border-2 border-white/40'
										: 'bg-white/5 hover:bg-white/10'
								}`}
							>
								<div className="flex items-center">
									<div
										className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
											selectedAnswer === option.value
												? 'border-white bg-white/20'
												: 'border-white/40'
										}`}
									>
										{selectedAnswer === option.value && (
											<div className="w-3 h-3 rounded-full bg-white" />
										)}
									</div>
									<span className="text-white">{option.text}</span>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Navigation */}
				<div className="flex justify-between">
					<button
						onClick={prevQuestion}
						disabled={isFirstQuestion}
						className="glass-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Назад
					</button>
					<button
						onClick={handleNext}
						disabled={!selectedAnswer || isLoading}
						className="glass-button px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? 'Отправка...' : isLastQuestion ? 'Завершить тест' : 'Далее'}
					</button>
				</div>
			</div>
		</div>
	)
}

