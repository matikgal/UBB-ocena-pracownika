import { Button } from "../ui/button"
import { X, Database, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "../../contexts/AuthContext"
import { ConfirmDialog } from "../common/ConfirmDialog"
import { AlertTriangle } from "lucide-react"
import { AccessDenied } from "../common/AccessDenied"
import { LoadingState } from "../common/LoadingState"
import { QuestionForm } from "./components/QuestionForm"
import { QuestionDisplay } from "./components/QuestionDisplay"
import { Question } from "../../types"
import { useQuestionsManager } from "../../services/firebase/useQuestionsManager"


interface EditQuestionsComponentProps {
  onClose: () => void
  onSave: (updatedQuestions: Question[]) => void
}

// Lista dostępnych kategorii pytań
const CATEGORIES = [
  'Publikacje dydaktyczne',
  'Podniesienie jakości nauczania',
  'Zajęcia w języku obcym, wykłady za granicą',
  'Pełnienie funkcji dydaktycznej (za każdy rok)',
  'Nagrody i wyróznienia',
]

export function EditQuestionsComponent({ onClose, onSave }: EditQuestionsComponentProps) {
  // Sprawdzenie uprawnień użytkownika
  const { hasRole } = useAuth()
  const hasAccess = hasRole('admin') || hasRole('dziekan')

  // Inicjalizacja stanów komponentu
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0])
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: '',
    title: '',
    points: 0,
    tooltip: [''],
  })

  // Pobranie funkcji do zarządzania pytaniami z hooka
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

  // Obsługa błędów
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Blokada dostępu dla nieuprawnionych użytkowników
  if (!hasAccess) {
    return (
      <AccessDenied
        title="Edycja pytań"
        message="Tylko użytkownicy z rolą dziekana lub administratora mają dostęp do edycji pytań."
        onClose={onClose}
      />
    )
  }

  // Wyświetlanie stanu ładowania
  if (loading && questions.length === 0) {
    return (
      <LoadingState
        title="Edycja pytań"
        message="Ładowanie pytań..."
        onClose={onClose}
      />
    )
  }

  // Zmiana wybranej kategorii
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchQuestions(category)
  }

  // Zapisanie wszystkich zmian i zamknięcie komponentu
  const handleSaveChanges = () => {
    onSave(questions)
    onClose()
  }

  // Dodawanie nowego pytania
  const handleAddQuestion = async () => {
    if (newQuestion.title.trim() === '') return

    const questionWithCategory = {
      ...newQuestion,
      category: selectedCategory
    }
    
    const result = await addNewQuestion(
      questionWithCategory,
      selectedCategory
    )
    
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

  // Aktualizacja istniejącego pytania
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return
    
    const questionWithCategory = {
      ...editingQuestion,
      category: selectedCategory
    }
    
    const result = await updateExistingQuestion(
      questionWithCategory
    )
    
    if (result) {
      toast.success('Pytanie zostało zaktualizowane pomyślnie')
      setEditingQuestion(null)
    }
  }

  // Usuwanie pytania z potwierdzeniem
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

  // Obsługa zmiany pól pytania
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

  // Dodawanie nowej podpowiedzi
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

  // Zmiana treści podpowiedzi
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

  // Usuwanie podpowiedzi
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

  // Renderowanie interfejsu użytkownika
  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-0 my-0 text-gray-800">
      {/* Nagłówek z tytułem i przyciskiem zamknięcia */}
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

      {/* Wybór kategorii pytań */}
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

      {/* Lista istniejących pytań i formularz dodawania nowego */}
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

        {/* Formularz dodawania nowego pytania */}
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

      {/* Przyciski akcji na dole komponentu */}
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
