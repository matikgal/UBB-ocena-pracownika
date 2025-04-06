import { Button } from "../ui/button"
import { X, Database, Save, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "../../contexts/AuthContext"
import { useQuestionsManager } from "../../hooks/useQuestionsManager"
// Replace this import
// import { DeleteConfirmation } from "../library/components/DeleteConfirmation"
import { ConfirmDialog } from "../common/ConfirmDialog"
import { AlertTriangle } from "lucide-react"
import { AccessDenied } from "../common/AccessDenied"
import { LoadingState } from "../common/LoadingState"
import { QuestionForm } from "./components/QuestionForm"
import { QuestionDisplay } from "./components/QuestionDisplay"
import { Question } from "../../types"

interface EditQuestionsComponentProps {
  onClose: () => void
  onSave: (updatedQuestions: Question[]) => void
}

const CATEGORIES = [
  'Publikacje dydaktyczne',
  'Podniesienie jakości nauczania',
  'Zajęcia w języku obcym, wykłady za granicą',
  'Pełnienie funkcji dydaktycznej (za każdy rok)',
  'Nagrody i wyróznienia',
]

export function EditQuestionsComponent({ onClose, onSave }: EditQuestionsComponentProps) {
  const { hasRole } = useAuth()
  const hasAccess = hasRole('admin') || hasRole('dziekan')

  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0])
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: '',
    title: '',
    points: 0,
    tooltip: [''],
  })

  const {
    questions,
    loading,
    error,
    fetchQuestions,
    addNewQuestion,
    updateExistingQuestion,
    deleteExistingQuestion,
    addAllQuestionsFromFile,
  } = useQuestionsManager(selectedCategory)

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  if (!hasAccess) {
    return (
      <AccessDenied
        title="Edycja pytań"
        message="Tylko użytkownicy z rolą dziekana lub administratora mają dostęp do edycji pytań."
        onClose={onClose}
      />
    )
  }

  if (loading && questions.length === 0) {
    return (
      <LoadingState
        title="Edycja pytań"
        message="Ładowanie pytań..."
        onClose={onClose}
      />
    )
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchQuestions(category)
  }

  const handleSaveChanges = () => {
    onSave(questions)
    onClose()
  }

  const handleAddQuestion = async () => {
    if (newQuestion.title.trim() === '') return

    const result = await addNewQuestion(newQuestion, selectedCategory)
    if (result) {
      toast.success('Pytanie zostało dodane pomyślnie')
      setNewQuestion({
        id: '',
        title: '',
        points: 0,
        tooltip: [''],
      })
    }
  }

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return
    const result = await updateExistingQuestion(editingQuestion)
    if (result) {
      toast.success('Pytanie zostało zaktualizowane pomyślnie')
      setEditingQuestion(null)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!questionId) return

    const questionToDelete = questions.find(q => q.id === questionId)
    if (!questionToDelete) return

    toast.custom((t) => (
      <ConfirmDialog
        title="Potwierdź usunięcie"
        message={`Czy na pewno chcesz usunąć "${questionToDelete.title}"? Tej operacji nie można cofnąć.`}
        confirmLabel="Usuń"
        cancelLabel="Anuluj"
        variant="danger"
        icon={<AlertTriangle className="h-6 w-6" />}
        onCancel={() => toast.dismiss(t)}
        onConfirm={async () => {
          toast.dismiss(t)
          const result = await deleteExistingQuestion(questionId)
          if (result) {
            toast.success('Pytanie zostało usunięte pomyślnie')
          }
        }}
      />
    ), { duration: 10000 })
  }

  const handleQuestionChange = (field: string, value: any, isEditing: boolean) => {
    if (isEditing && editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        [field]: value,
      })
    } else {
      setNewQuestion({
        ...newQuestion,
        [field]: value,
      })
    }
  }

  const handleTooltipAdd = (isEditing: boolean) => {
    if (isEditing && editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        tooltip: [...editingQuestion.tooltip, ''],
      })
    } else {
      setNewQuestion({
        ...newQuestion,
        tooltip: [...newQuestion.tooltip, ''],
      })
    }
  }

  const handleTooltipChange = (index: number, value: string, isEditing: boolean) => {
    if (isEditing && editingQuestion) {
      const updatedTooltips = [...editingQuestion.tooltip]
      updatedTooltips[index] = value
      setEditingQuestion({
        ...editingQuestion,
        tooltip: updatedTooltips,
      })
    } else {
      const updatedTooltips = [...newQuestion.tooltip]
      updatedTooltips[index] = value
      setNewQuestion({
        ...newQuestion,
        tooltip: updatedTooltips,
      })
    }
  }

  const handleTooltipRemove = (index: number, isEditing: boolean) => {
    if (isEditing && editingQuestion) {
      const updatedTooltips = [...editingQuestion.tooltip]
      updatedTooltips.splice(index, 1)
      setEditingQuestion({
        ...editingQuestion,
        tooltip: updatedTooltips,
      })
    } else {
      const updatedTooltips = [...newQuestion.tooltip]
      updatedTooltips.splice(index, 1)
      setNewQuestion({
        ...newQuestion,
        tooltip: updatedTooltips,
      })
    }
  }

  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-0 my-0 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Edycja pytań</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Wybierz kategorię</label>
        <select
          className="w-full p-2 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700"
          value={selectedCategory}
          onChange={e => handleCategoryChange(e.target.value)}
        >
          {CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <h3 className="text-lg font-semibold mb-4 text-gray-700">Pytania w kategorii: {selectedCategory}</h3>

      <div className="flex-1 overflow-y-auto mb-4 pr-1">
        <div className="space-y-4 mb-8">
          {questions.map(question => (
            <div
              key={question.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              {editingQuestion?.id === question.id ? (
                <QuestionForm
                  question={editingQuestion}
                  isEditing={true}
                  onQuestionChange={(field, value) => handleQuestionChange(field, value, true)}
                  onTooltipAdd={() => handleTooltipAdd(true)}
                  onTooltipChange={(index, value) => handleTooltipChange(index, value, true)}
                  onTooltipRemove={(index) => handleTooltipRemove(index, true)}
                  onSave={handleUpdateQuestion}
                  onCancel={() => setEditingQuestion(null)}
                  saveButtonText="Zapisz zmiany"
                />
              ) : (
                <QuestionDisplay
                  question={question}
                  onEdit={() => setEditingQuestion(question)}
                  onDelete={handleDeleteQuestion}
                />
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Dodaj nowe pytanie</h3>
          <QuestionForm
            question={newQuestion}
            isEditing={false}
            onQuestionChange={(field, value) => handleQuestionChange(field, value, false)}
            onTooltipAdd={() => handleTooltipAdd(false)}
            onTooltipChange={(index, value) => handleTooltipChange(index, value, false)}
            onTooltipRemove={(index) => handleTooltipRemove(index, false)}
            onSave={handleAddQuestion}
            saveButtonText="Dodaj pytanie"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4 border-t border-gray-100 pt-4">
        <Button
          onClick={() => addAllQuestionsFromFile(selectedCategory)}
          disabled={loading}
          className="mr-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
        >
          <Database className="h-4 w-4 mr-2" />
          {loading ? 'Dodawanie pytań...' : 'Dodaj wszystkie pytania z pliku'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          Anuluj
        </Button>
        <Button
          onClick={handleSaveChanges}
          className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
        >
          <Save className="h-4 w-4 mr-2" /> Zapisz wszystkie zmiany
        </Button>
      </div>
    </div>
  )
}
