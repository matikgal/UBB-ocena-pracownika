import { Button } from "../ui/button"
import { X } from "lucide-react"

interface PageHeaderProps {
  title: string
  onClose?: () => void
  actions?: React.ReactNode
}

export function PageHeader({ title, onClose, actions }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-2">
        {actions}
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
    </div>
  )
}