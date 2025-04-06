import { FolderOpen } from "lucide-react"
import { Button } from "../ui/button"

interface EmptyStateProps {
  title?: string
  message: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ 
  title = "Brak danych", 
  message, 
  icon, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">
        {icon || <FolderOpen className="h-8 w-8 text-gray-500" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-6">{message}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}