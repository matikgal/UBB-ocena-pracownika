// Update imports
import { CheckSquare, Trash } from 'lucide-react'
import { Button } from '../../ui/button'
import { Checkbox } from '../../ui/checkbox'

interface Article {
  title: string
  journal?: string
  year?: number
  points: number
}

interface UserResponse {
  id: string
  userId: string
  userName: string
  userEmail: string
  questionId: string
  questionTitle: string
  points: number
  category: string
  status: 'pending' | 'approved' | 'rejected'
  articles?: Article[]
}

interface ResponseListProps {
  items: UserResponse[]
  selectedResponses: string[]
  toggleResponseSelection: (id: string) => void
  toggleAllResponses: () => void
  onStartEditing: (id: string, articles?: Article[]) => void
  onApprove: (id: string) => void
  onDelete: (id: string, email: string) => void
  filteredCount: number
}

export function ResponseList({
  items,
  selectedResponses,
  toggleResponseSelection,
  toggleAllResponses,
  onStartEditing,
  onApprove,
  onDelete,
  filteredCount
}: ResponseListProps) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Brak zgłoszonych publikacji do oceny</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-black">
      <div className="flex items-center mb-2 px-4">
        <Checkbox 
          id="select-all"
          checked={selectedResponses.length === filteredCount && filteredCount > 0}
          onCheckedChange={toggleAllResponses}
          className="mr-2"
        />
        <label htmlFor="select-all" className="text-sm text-gray-600 cursor-pointer">
          Zaznacz wszystkie
        </label>
      </div>
      
      {items.map(response => (
        <ResponseItem 
          key={response.id}
          response={response}
          isSelected={selectedResponses.includes(response.id)}
          onToggleSelection={toggleResponseSelection}
          onStartEditing={onStartEditing}
          onApprove={onApprove}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

interface ResponseItemProps {
  response: UserResponse
  isSelected: boolean
  onToggleSelection: (id: string) => void
  onStartEditing: (id: string, articles?: Article[]) => void
  onApprove: (id: string) => void
  onDelete: (id: string, email: string) => void
}

function ResponseItem({
  response,
  isSelected,
  onToggleSelection,
  onStartEditing,
  onApprove,
  onDelete
}: ResponseItemProps) {
  return (
    <div
      className={`p-4 rounded-lg shadow border-2 ${
        response.status === 'approved'
          ? 'border-green-500 bg-green-50'
          : response.status === 'rejected'
          ? 'border-red-500 bg-red-50'
          : 'border-amber-500 bg-amber-50'
      }`}>
      <div className="flex items-start gap-2">
        <Checkbox 
          id={`select-${response.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(response.id)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{response.userName}</h4>
              <p className="text-sm text-gray-600">{response.userEmail}</p>
              <p className="text-sm mt-1">
                <span className="font-medium">Kategoria:</span> {response.category}
              </p>
            </div>
            <div className="flex space-x-2 items-center">
              <span
                className={`text-xs text-center px-2 py-0.5 rounded-full ${
                  response.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : response.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                {response.status === 'approved'
                  ? 'Ocenione'
                  : response.status === 'rejected'
                  ? 'Odrzucone'
                  : 'Oczekujące'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(response.id, response.userEmail)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {response.articles && response.articles.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium mb-2">Ocenione publikacje:</h5>
              <div className="space-y-2">
                {response.articles.map((article, index) => (
                  <div key={index} className="text-sm bg-white p-2 rounded border border-gray-200">
                    <p className="font-medium">{article.title}</p>
                    {article.journal && <p className="text-gray-600">Czasopismo: {article.journal}</p>}
                    {article.year && <p className="text-gray-600">Rok: {article.year}</p>}
                    <p className="text-green-700 mt-1">Punkty: {article.points}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => onStartEditing(response.id, response.articles)}
              className="mr-2"
            >
              Edytuj publikacje
            </Button>
            
            {response.status !== 'approved' && (
              <Button
                onClick={() => onApprove(response.id)}
                disabled={!response.articles || response.articles.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                Zatwierdź ocenę
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}