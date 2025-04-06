import { Button } from "../ui/button"
import { ShieldAlert, X } from "lucide-react"

interface AccessDeniedProps {
  title: string
  message: string
  onClose: () => void
}

export function AccessDenied({ title, message, onClose }: AccessDeniedProps) {
  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Brak dostępu</h3>
        <p className="text-gray-600 max-w-md">{message}</p>
        <Button onClick={onClose} className="mt-6 bg-gray-100 text-gray-800 hover:bg-gray-200">
          Powrót
        </Button>
      </div>
    </div>
  )
}