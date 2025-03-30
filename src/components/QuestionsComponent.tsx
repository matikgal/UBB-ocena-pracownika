// Fix the import statement to properly include useRef
import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { QuestionItem } from './QuestionItem'
import { useUserResponses } from '../hooks/useUserResponses'
import { useAuth } from '../contexts/AuthContext'

interface Question {
	id: string
	title: string
	points: number | string
	tooltip: string[]
}

interface QuestionsComponentProps {
	selectedCategory: string
	onPreviousCategory: () => void
	onNextCategory: () => void
	categories: string[]
}

interface QuestionState {
	checked: boolean
	value: string
}

export default function QuestionsComponent({
	selectedCategory,
	onPreviousCategory,
	onNextCategory,
	categories,
}: QuestionsComponentProps) {
	const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})
	const [questions, setQuestions] = useState<Question[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	// Add user responses hook
	const { saveResponse, loadResponses, responses } = useUserResponses()
	const { userData } = useAuth()

	// Use a ref to track if we've already loaded data for this category
	const dataLoadedRef = useRef<Record<string, boolean>>({})

	// Make sure responses are loaded when component mounts or category changes
	useEffect(() => {
		// Prevent duplicate data loading for the same category
		if (dataLoadedRef.current[selectedCategory]) {
			return
		}

		const loadData = async () => {
			setLoading(true)
			try {
				dataLoadedRef.current[selectedCategory] = true

				if (userData?.email) {
					// Load responses first
					await loadResponses(selectedCategory)
				}
				// Then fetch questions
				await fetchQuestions()
			} catch (err) {
				console.error('Error loading data:', err)
				setError('Nie udało się załadować danych')
				// Reset the loading flag on error
				dataLoadedRef.current[selectedCategory] = false
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [selectedCategory, userData?.email])

	const fetchQuestions = async () => {
		try {
			console.log('Fetching questions for category:', selectedCategory)

			const q = query(collection(db, 'Questions'), where('category', '==', selectedCategory))

			const querySnapshot = await getDocs(q)
			const fetchedQuestions: Question[] = []

			querySnapshot.forEach(doc => {
				const data = doc.data()

				// Parse tooltip string into array if it's a string
				const tooltip =
					typeof data.tooltip === 'string' ? data.tooltip.split(',') : Array.isArray(data.tooltip) ? data.tooltip : []

				fetchedQuestions.push({
					id: doc.id,
					...data,
					tooltip: tooltip,
				} as Question)
			})

			setQuestions(fetchedQuestions)
			initializeQuestionStates(fetchedQuestions)
		} catch (err) {
			console.error('Error fetching questions:', err)
			setError('Nie udało się pobrać pytań')
		} finally {
			setLoading(false)
		}
	}

	// Update when responses change to properly initialize question states
	useEffect(() => {
		if (questions.length > 0 && responses) {
			initializeQuestionStates(questions)
		}
	}, [responses, questions])

	// Update initializeQuestionStates to properly handle existing responses
	const initializeQuestionStates = (fetchedQuestions: Question[]) => {
		const initialStates: Record<string, QuestionState> = {}

		fetchedQuestions.forEach(question => {
			// Find if there's an existing response for this question
			const existingResponse = responses.find(r => r.questionId === question.id)

			initialStates[question.id] = {
				checked: existingResponse ? true : false,
				value: existingResponse
					? existingResponse.points.toString()
					: typeof question.points === 'number'
					? question.points.toString()
					: '0',
			}
		})

		setQuestionStates(initialStates)
	}

	const handleCheckboxChange = (questionId: string) => {
		setQuestionStates(prev => ({
			...prev,
			[questionId]: {
				...prev[questionId],
				checked: !prev[questionId]?.checked,
			},
		}))
	}

	const handleValueChange = (questionId: string, value: string) => {
		setQuestionStates(prev => ({
			...prev,
			[questionId]: {
				...prev[questionId],
				value,
			},
		}))
	}

	// Add function to save responses
	const handleSaveResponses = async () => {
		if (!userData?.email) {
			setError('Musisz być zalogowany, aby zapisać odpowiedzi')
			return
		}

		setError(null)
		setSuccessMessage(null)

		try {
			// Get all checked questions
			const checkedQuestions = Object.entries(questionStates)
				.filter(([_, state]) => state.checked)
				.map(([id, state]) => ({
					id,
					points: parseInt(state.value),
				}))

			if (checkedQuestions.length === 0) {
				setError('Nie wybrano żadnych pytań')
				return
			}

			// Save each response
			for (const item of checkedQuestions) {
				const question = questions.find(q => q.id === item.id)
				if (question) {
					await saveResponse(question.id, question.title, item.points, selectedCategory)
				}
			}

			setSuccessMessage('Odpowiedzi zostały zapisane')

			// Clear success message after 3 seconds
			setTimeout(() => {
				setSuccessMessage(null)
			}, 3000)
		} catch (err) {
			console.error('Error saving responses:', err)
			setError('Nie udało się zapisać odpowiedzi')
		}
	}

	if (loading) {
		return <LoadingState />
	}

	if (error) {
		return <ErrorState message={error} />
	}

	if (questions.length === 0) {
		return <EmptyState category={selectedCategory} />
	}

	const currentIndex = categories?.indexOf(selectedCategory) ?? -1
	const isFirstCategory = currentIndex === 0 || !categories
	const isLastCategory = currentIndex === categories?.length - 1 || !categories

	return (
		<div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-100 mx-2">
			<h2 className="text-2xl font-semibold mb-4 px-6 pt-6 text-gray-800">{selectedCategory}</h2>

			{error && <div className="bg-red-50 text-red-600 p-3 mx-6 mb-4 rounded-md border border-red-100">{error}</div>}

			{successMessage && (
				<div className="bg-green-50 text-green-600 p-3 mx-6 mb-4 rounded-md border border-green-100">
					{successMessage}
				</div>
			)}

			<div className="flex-1 overflow-y-auto px-6 pb-4">
				<div className="space-y-5">
					{questions.map(question => (
						<QuestionItem
							key={question.id}
							question={question}
							checked={questionStates[question.id]?.checked || false}
							value={questionStates[question.id]?.value || '0'}
							onCheckChange={() => handleCheckboxChange(question.id)}
							onValueChange={value => handleValueChange(question.id, value)}
						/>
					))}
				</div>
			</div>

			<div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-lg">
				<CategoryNavigation
					onPrevious={onPreviousCategory}
					onNext={onNextCategory}
					isFirstCategory={isFirstCategory}
					isLastCategory={isLastCategory}
				/>

				<Button 
					onClick={handleSaveResponses} 
					className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 px-5 py-2 rounded-md"
				>
					Zapisz odpowiedzi
				</Button>
			</div>
		</div>
	)
}

function CategoryNavigation({
	onPrevious,
	onNext,
	isFirstCategory,
	isLastCategory,
}: {
	onPrevious: () => void
	onNext: () => void
	isFirstCategory: boolean
	isLastCategory: boolean
}) {
	return (
		<div className="flex gap-3 text-gray-700">
			<Button 
				onClick={onPrevious} 
				disabled={isFirstCategory} 
				variant="outline" 
				className={`flex items-center gap-2 border-gray-200 ${isFirstCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
			>
				<ChevronLeft className="h-4 w-4" />
				Poprzednia
			</Button>

			<Button 
				onClick={onNext} 
				disabled={isLastCategory} 
				variant="outline" 
				className={`flex items-center gap-2 border-gray-200 ${isLastCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
			>
				Następna
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	)
}

function LoadingState() {
	return (
		<div className="p-6 flex justify-center items-center h-full">
			<div className="text-gray-500 flex flex-col items-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
				<span>Ładowanie pytań...</span>
			</div>
		</div>
	)
}

function ErrorState({ message }: { message: string }) {
	return <div className="p-6 text-red-500 bg-red-50 rounded-md border border-red-100 m-4">{message}</div>
}

function EmptyState({ category }: { category: string }) {
	return (
		<div className="p-6 text-gray-500 flex flex-col items-center justify-center h-64">
			<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
			</svg>
			<p className="text-center">Brak pytań dla kategorii: <span className="font-medium">{category}</span></p>
		</div>
	)
}
