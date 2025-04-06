import { Button } from "../../ui/button"
import { Trash } from "lucide-react"
import { Question } from "../../../types"

interface QuestionDisplayProps {
  question: Question
  onEdit: () => void
  onDelete: (id: string) => void
}

export function QuestionDisplay({ question, onEdit, onDelete }: QuestionDisplayProps) {
  return (
    <div>
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-800">{question.title}</h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            Edytuj
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(question.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">Punkty: {question.points}</p>
      {question.tooltip.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-700">Podpowiedzi:</p>
          <ul className="list-disc pl-5 text-sm text-gray-600 mt-1">
            {question.tooltip.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}