import { X } from "lucide-react"
import { Button } from "../ui/button"

interface LoadingStateProps {
  title: string
  message: string
  onClose?: () => void
}

export function LoadingState({ title, message, onClose }: LoadingStateProps) {
  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-0 my-0 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
          <span>{message}</span>
        </div>
      </div>
    </div>
  )
}