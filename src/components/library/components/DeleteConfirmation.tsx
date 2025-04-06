import { Trash } from 'lucide-react'
// Update imports
import { Button } from '../../ui/button'

interface DeleteConfirmationProps {
  t: any
  userName: string
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function DeleteConfirmation({ t, userName, onCancel, onConfirm }: DeleteConfirmationProps) {
  return (
    <div className={`${t ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 text-red-500">
            <Trash className="h-6 w-6" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">
              Usunąć odpowiedź?
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Czy na pewno chcesz usunąć odpowiedź użytkownika {userName}? Ta operacja jest nieodwracalna.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <Button 
                className='text-black'
                variant="outline" 
                size="sm" 
                onClick={onCancel}
              >
                Anuluj
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onConfirm}
              >
                Usuń
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}