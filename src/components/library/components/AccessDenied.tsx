import { ShieldAlert } from 'lucide-react'

export function AccessDenied() {
  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
      <div className="flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Brak dostępu</h3>
        <p className="text-gray-600 max-w-md">
          Tylko użytkownicy z rolą bibliotekarza mają dostęp do oceny publikacji.
        </p>
      </div>
    </div>
  )
}