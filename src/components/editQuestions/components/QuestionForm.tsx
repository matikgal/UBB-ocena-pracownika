import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Plus, Trash } from "lucide-react"
import { Question } from "../../../types"

// First, update the QuestionForm component to accept ReactNode instead of string
interface QuestionFormProps {
  question: Question
  isEditing: boolean
  onQuestionChange: (field: string, value: any) => void
  onTooltipAdd: () => void
  onTooltipChange: (index: number, value: string) => void
  onTooltipRemove: (index: number) => void
  onSave: () => void
  onCancel?: () => void
  saveButtonText?: React.ReactNode // Change from string to ReactNode
}

export function QuestionForm({
  question,
  isEditing,
  onQuestionChange,
  onTooltipAdd,
  onTooltipChange,
  onTooltipRemove,
  onSave,
  onCancel,
  saveButtonText = "Zapisz"
}: QuestionFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tytuł pytania</label>
        <Input
          value={question.title}
          onChange={(e) => onQuestionChange("title", e.target.value)}
          placeholder="Wprowadź tytuł pytania"
          className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Punkty</label>
        <Input
          type="number"
          value={typeof question.points === 'string' ? 0 : question.points}
          onChange={(e) => onQuestionChange("points", Number(e.target.value))}
          placeholder="Wprowadź liczbę punktów"
          className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-32"
          min="0"
          step="0.5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Podpowiedzi</label>
        {question.tooltip.map((tip, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Textarea
              value={tip}
              onChange={(e) => onTooltipChange(index, e.target.value)}
              placeholder="Wprowadź tekst podpowiedzi"
              className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTooltipRemove(index)}
              disabled={question.tooltip.length <= 1}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={onTooltipAdd}
          className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Plus className="h-4 w-4 mr-2" /> Dodaj podpowiedź
        </Button>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            Anuluj
          </Button>
        )}
       
        <Button 
          onClick={onSave} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!question.title.trim()}
        >
          {saveButtonText === "Dodaj pytanie" ? (
            <><Plus className="h-4 w-4 mr-2" /> {saveButtonText}</>
          ) : (
            saveButtonText
          )}
        </Button>
      </div>
    </div>
  )
}