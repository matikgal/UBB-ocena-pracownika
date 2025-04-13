import { Button } from "../ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationProps {
  t: any
  userName: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmation({  userName, onCancel, onConfirm }: DeleteConfirmationProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-red-100 p-2 rounded-full">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Potwierdź usunięcie</h3>
      </div>
      
      <p className="text-gray-700 mb-6">
        Czy na pewno chcesz usunąć <span className="font-medium">{userName}</span>? 
        Tej operacji nie można cofnąć.
      </p>
      
      <div className="flex justify-end gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="border-gray-200 hover:bg-gray-50 text-gray-700"
        >
          Anuluj
        </Button>
        <Button 
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Usuń
        </Button>
      </div>
    </div>
  )
}