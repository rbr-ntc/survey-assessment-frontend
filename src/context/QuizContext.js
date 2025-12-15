'use client'

import { apiClient } from '@/lib/api'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const QuizContext = createContext()

export function QuizProvider({ children }) {
	const [quiz, setQuiz] = useState(null)
	const [questions, setQuestions] = useState([])
	const [attempt, setAttempt] = useState(null)
	const [answers, setAnswers] = useState({})
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
	const [status, setStatus] = useState('loading') // loading | intro | in_progress | completed | error
	const [error, setError] = useState(null)
	const [isLoading, setIsLoading] = useState(false)

	/**
	 * Load quiz configuration and questions
	 */
	const loadQuiz = useCallback(async (quizId) => {
		try {
			setStatus('loading')
			setError(null)
			setIsLoading(true)

			// Load quiz config and questions in parallel
			const [quizData, questionsData] = await Promise.all([
				apiClient.getQuiz(quizId),
				apiClient.getQuizQuestions(quizId),
			])

			setQuiz(quizData)
			setQuestions(questionsData)
			setStatus('intro')
		} catch (err) {
			console.error('Error loading quiz:', err)
			setError(err.message || 'Ошибка загрузки теста')
			setStatus('error')
		} finally {
			setIsLoading(false)
		}
	}, [])

	/**
	 * Start a new quiz attempt
	 */
	const startQuiz = useCallback(async (quizId) => {
		try {
			setError(null)
			setIsLoading(true)

			const attemptData = await apiClient.startQuiz(quizId)
			setAttempt(attemptData)
			setAnswers({})
			setCurrentQuestionIndex(0)
			setStatus('in_progress')
		} catch (err) {
			console.error('Error starting quiz:', err)
			setError(err.message || 'Ошибка запуска теста')
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [])

	/**
	 * Submit answer for current question
	 */
	const submitAnswer = useCallback((questionId, answer) => {
		setAnswers((prev) => ({
			...prev,
			[questionId]: answer,
		}))
	}, [])

	/**
	 * Go to next question
	 */
	const nextQuestion = useCallback(() => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex((prev) => prev + 1)
		}
	}, [currentQuestionIndex, questions.length])

	/**
	 * Go to previous question
	 */
	const prevQuestion = useCallback(() => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex((prev) => prev - 1)
		}
	}, [currentQuestionIndex])

	/**
	 * Finish quiz and submit answers
	 */
	const finishQuiz = useCallback(async () => {
		if (!quiz || !attempt) {
			throw new Error('Quiz or attempt not initialized')
		}

		try {
			setError(null)
			setIsLoading(true)

			const result = await apiClient.submitQuiz(quiz.id, attempt.attempt_id, answers)
			setAttempt((prev) => ({
				...prev,
				...result,
			}))
			setStatus('completed')
		} catch (err) {
			console.error('Error finishing quiz:', err)
			setError(err.message || 'Ошибка отправки ответов')
			throw err
		} finally {
			setIsLoading(false)
		}
	}, [quiz, attempt, answers])

	/**
	 * Reset quiz state
	 */
	const resetQuiz = useCallback(() => {
		setQuiz(null)
		setQuestions([])
		setAttempt(null)
		setAnswers({})
		setCurrentQuestionIndex(0)
		setStatus('loading')
		setError(null)
	}, [])

	// Memoize value to prevent unnecessary re-renders
	const value = useMemo(
		() => ({
			quiz,
			questions,
			attempt,
			answers,
			currentQuestionIndex,
			currentQuestion: questions && questions.length > 0 && questions[currentQuestionIndex] ? questions[currentQuestionIndex] : null,
			status,
			error,
			isLoading,
			loadQuiz,
			startQuiz,
			submitAnswer,
			nextQuestion,
			prevQuestion,
			finishQuiz,
			resetQuiz,
			progress: questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0,
			isLastQuestion: currentQuestionIndex === questions.length - 1,
			isFirstQuestion: currentQuestionIndex === 0,
		}),
		[
			quiz,
			questions,
			attempt,
			answers,
			currentQuestionIndex,
			status,
			error,
			isLoading,
			loadQuiz,
			startQuiz,
			submitAnswer,
			nextQuestion,
			prevQuestion,
			finishQuiz,
			resetQuiz,
		]
	)

	return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

export function useQuiz() {
	const context = useContext(QuizContext)
	if (!context) {
		throw new Error('useQuiz must be used within QuizProvider')
	}
	return context
}

