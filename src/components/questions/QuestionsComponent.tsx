import { useQuestions } from '../../services/firebase/useQuestions'
import { Button } from '../ui/button'
import { QuestionItem } from './QuestionItem'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import CategoryNavigation from './components/CategoryNavigation'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { FolderOpen } from 'lucide-react'

interface QuestionsComponentProps {
	selectedCategory: string
	onPreviousCategory: () => void
	onNextCategory: () => void
	categories: string[]
}

export default function QuestionsComponent({
	selectedCategory,
	onPreviousCategory,
	onNextCategory,
	categories
}: QuestionsComponentProps) {
	const {
		questions,
		questionStates,
		loading,
		error,
		successMessage,
		handleCheckboxChange,
		handleValueChange,
		handleSaveResponses,
		handleDeleteResponse 
	} = useQuestions(selectedCategory)

	// Show toast when success message changes
	useEffect(() => {
		if (successMessage) {
			toast.success(successMessage);
		}
	}, [successMessage]);

	// Show toast when error changes
	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	// Determine if this is the first or last category
	const currentIndex = categories.indexOf(selectedCategory)
	const isFirstCategory = currentIndex === 0
	const isLastCategory = currentIndex === categories.length - 1

	if (loading) {
		return <LoadingState 
			title="Ładowanie pytań"
			message="Proszę czekać, trwa ładowanie pytań..."
		/>
	}

	if (questions.length === 0) {
		// Show toast for empty state and still render the EmptyState component
		toast.info(`Brak pytań w kategorii: ${selectedCategory}`);
		return (
			<EmptyState 
				title={`Brak pytań w kategorii: ${selectedCategory}`}
				message="W tej kategorii nie ma jeszcze żadnych pytań."
				icon={<FolderOpen className="h-8 w-8 text-gray-500" />}
			/>
		)
	}

	return (
		<div className="bg-white rounded-lg shadow-sm p-6 h-full flex flex-col">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold text-gray-800">{selectedCategory}</h2>
				<CategoryNavigation
					onPrevious={onPreviousCategory}
					onNext={onNextCategory}
					isFirstCategory={isFirstCategory}
					isLastCategory={isLastCategory}
				/>
			</div>

			<div className="flex-1 overflow-y-auto pr-2">
				<div className="space-y-4">
					{questions.map(question => (
						<QuestionItem
							key={question.id}
							question={question}
							checked={questionStates[question.id]?.checked || false}
							value={questionStates[question.id]?.value || '0'}
							onCheckChange={() => handleCheckboxChange(question.id)}
							onValueChange={(value) => handleValueChange(question.id, value)}
							onDelete={handleDeleteResponse}
						/>
					))}
				</div>
			</div>

			<div className="mt-6 pt-4 border-t border-gray-200">
				<Button onClick={handleSaveResponses} className="w-full">
					Zapisz odpowiedzi
				</Button>
			</div>
		</div>
	)
}
