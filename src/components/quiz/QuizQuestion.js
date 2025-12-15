'use client'

import { useQuiz } from '@/context/QuizContext'
import categories from '@/lib/categories'
import QuestionTypeBadge from './QuestionTypeBadge'

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

	const handleNext = async () => {
		if (isLastQuestion) {
			try {
				await finishQuiz()
			} catch (error) {
				console.error('Error finishing quiz:', error)
				alert(error.message || 'Ошибка завершения теста')
			}
		} else {
			nextQuestion()
		}
	}

	const selectedAnswer = answers[currentQuestion.id]

	const category = currentQuestion.category ? categories[currentQuestion.category] : null

	return (
		<div className="auth-bg min-h-screen p-4 md:py-8">
			<div className="max-w-3xl mx-auto">
				{/* Header / Progress */}
				<div className="mb-6 flex flex-col gap-4">
					<div className="flex items-center justify-between">
						{category && (
							<div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
								<span className="text-lg" aria-hidden="true">{category.icon}</span>
								<span className="text-sm font-medium text-white/90">{category.name}</span>
							</div>
						)}
						{!category && <div></div>}
						<div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
							<span className="text-sm font-medium text-white/90">
								{currentQuestionIndex + 1} / {questions.length}
							</span>
						</div>
					</div>
					<div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
						<div
							className="h-full rounded-full bg-white/40 transition-all duration-500 ease-out shadow-sm"
							style={{ width: `${progress}%` }}
						/>
					</div>
				</div>

				{/* Question Card */}
				<div className="glass-card p-6 md:p-10 mb-6 transition-all">
					{/* Question Type Badge */}
					{currentQuestion.type && (
						<div className="mb-5">
							<QuestionTypeBadge type={currentQuestion.type} />
						</div>
					)}

					{/* Question Text */}
					<h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-8">
						{currentQuestion.question}
					</h2>

					{/* Options */}
					<div className="flex flex-col gap-3">
						{currentQuestion.options?.map((option) => {
							const isSelected = selectedAnswer === option.value
							return (
								<label
									key={option.value}
									className={`
										group relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-200
										${
											isSelected
												? 'border-white/60 bg-white/20 ring-2 ring-white/30 shadow-lg z-10'
												: 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
										}
									`}
								>
									<input
										type="radio"
										name={currentQuestion.id}
										value={option.value}
										checked={isSelected}
										onChange={() => {
											console.log('[QuizQuestion] Answer selected:', option.value)
											handleAnswer(option.value)
										}}
										className="sr-only"
									/>

									{/* Radio Circle */}
									<span
										className={`
											flex items-center justify-center w-5 h-5 mt-0.5 rounded-full border transition-all shrink-0
											${
												isSelected
													? 'border-white bg-white/40'
													: 'border-white/40 bg-white/5 group-hover:border-white/60'
											}
										`}
									>
										<span
											className="w-2.5 h-2.5 rounded-full bg-white opacity-0 transition-opacity duration-200"
											style={{ opacity: isSelected ? 1 : 0 }}
										/>
									</span>

									{/* Option text */}
									<span
										className={`text-base leading-relaxed transition-colors flex-1 ${
											isSelected
												? 'text-white font-medium'
												: 'text-white/90'
										}`}
									>
										{option.text}
									</span>
								</label>
							)
						})}
					</div>
				</div>

				{/* Footer Navigation */}
				<div className="flex items-center justify-between pt-6 border-t border-white/10">
					<button
						type="button"
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							console.log('[QuizQuestion] Prev button clicked')
							prevQuestion()
						}}
						disabled={isFirstQuestion}
						className="px-6 py-2.5 text-white/70 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-medium cursor-pointer active:scale-95"
					>
						Назад
					</button>
					<button
						type="button"
						onClick={async (e) => {
							e.preventDefault()
							e.stopPropagation()
							console.log('[QuizQuestion] Next button clicked, isLastQuestion:', isLastQuestion)
							await handleNext()
						}}
						disabled={!selectedAnswer || isLoading}
						className={`
							px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-lg cursor-pointer
							${
								isLastQuestion
									? 'bg-white/20 hover:bg-white/30 shadow-white/20 active:scale-95'
									: 'bg-white/15 hover:bg-white/25 shadow-white/10 active:scale-95'
							}
							disabled:opacity-50 disabled:cursor-not-allowed
						`}
					>
						{isLoading ? 'Отправка...' : isLastQuestion ? 'Завершить тест' : 'Далее'}
					</button>
				</div>
			</div>
		</div>
	)
}


