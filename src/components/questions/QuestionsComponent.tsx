import { useQuestions } from '../../hooks/useQuestions'
import { Button } from '../ui/button'
import { QuestionItem } from './QuestionItem'  // Changed from default to named import
import LoadingState from './ui/LoadingState'
import ErrorState from './ui/ErrorState'
import EmptyState from './ui/EmptyState'
import CategoryNavigation from './ui/CategoryNavigation'

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
  categories,
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
    handleDeleteResponse, // Add the new function
  } = useQuestions(selectedCategory)

  // Determine if this is the first or last category
  const currentIndex = categories.indexOf(selectedCategory)
  const isFirstCategory = currentIndex === 0
  const isLastCategory = currentIndex === categories.length - 1

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  if (questions.length === 0) {
    return <EmptyState category={selectedCategory} />
  }

  return (
    <div className="h-full flex flex-col">
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
              onDelete={handleDeleteResponse} // Pass the delete handler
            />
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-100">
            {successMessage}
          </div>
        )}
        <Button 
          onClick={handleSaveResponses} 
          className="w-full bg-ubbprimary hover:bg-ubbprimary/90"
        >
          Zapisz odpowiedzi
        </Button>
      </div>
    </div>
  )
}