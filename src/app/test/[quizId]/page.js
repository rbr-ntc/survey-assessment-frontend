'use client'

import { use } from 'react'
import { QuizProvider } from '@/context/QuizContext'
import QuizRunner from '@/components/quiz/QuizRunner'

export default function QuizPage({ params }) {
	const { quizId } = use(params)

	return (
		<QuizProvider>
			<QuizRunner quizId={quizId} />
		</QuizProvider>
	)
}

