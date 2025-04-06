// Update imports
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'

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

interface ArticleEditorProps {
  response: UserResponse | undefined
  articles: Article[]
  setArticles: (articles: Article[]) => void
  newArticle: Article
  setNewArticle: (article: Article) => void
  showConfirmation: boolean
  onSave: () => void
  onCancel: () => void
  onConfirm: () => void
  setShowConfirmation: (show: boolean) => void
}

export function ArticleEditor({
  response,
  articles,
  setArticles,
  newArticle,
  setNewArticle,
  showConfirmation,
  onSave,
  onCancel,
  onConfirm,
  setShowConfirmation
}: ArticleEditorProps) {
  const handleAddArticle = () => {
    if (newArticle.title.trim() === '') return

    setArticles([...articles, { ...newArticle }])
    setNewArticle({ title: '', points: 0 })
  }

  const handleRemoveArticle = (index: number) => {
    const updatedArticles = [...articles]
    updatedArticles.splice(index, 1)
    setArticles(updatedArticles)
  }

  if (!response) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-black">
      <h3 className="text-lg font-medium mb-4">
        Ocena publikacji dla: {response.userName}
      </h3>

      <div className="space-y-4 mb-6">
        <h4 className="font-medium">Dodane publikacje:</h4>

        {articles.length === 0 ? (
          <p className="text-gray-500 italic">Brak dodanych publikacji</p>
        ) : (
          <div className="space-y-3">
            {articles.map((article, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-white rounded border border-gray-200">
                <div className="flex-1">
                  <p className="font-medium">{article.title}</p>
                  {article.journal && <p className="text-sm text-gray-600">Czasopismo: {article.journal}</p>}
                  {article.year && <p className="text-sm text-gray-600">Rok: {article.year}</p>}
                  <p className="text-sm font-medium text-green-700 mt-1">Punkty: {article.points}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveArticle(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  Usuń
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded border border-gray-200 mb-4">
        <h4 className="font-medium mb-3">Dodaj nową publikację</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tytuł publikacji</label>
            <Input
              value={newArticle.title}
              onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
              placeholder="Wprowadź tytuł publikacji"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Czasopismo (opcjonalnie)</label>
            <Input
              value={newArticle.journal || ''}
              onChange={e => setNewArticle({ ...newArticle, journal: e.target.value })}
              placeholder="Wprowadź nazwę czasopisma"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Rok (opcjonalnie)</label>
            <Input
              type="number"
              value={newArticle.year || ''}
              onChange={e => setNewArticle({ ...newArticle, year: parseInt(e.target.value) || undefined })}
              placeholder="Wprowadź rok publikacji"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Punkty</label>
            <Input
              type="number"
              value={newArticle.points}
              onChange={e => setNewArticle({ ...newArticle, points: parseFloat(e.target.value) || 0 })}
              placeholder="Wprowadź liczbę punktów"
              min={0}
              step={0.5}
            />
          </div>

          <Button onClick={handleAddArticle} disabled={!newArticle.title.trim()} className="w-full">
            Dodaj publikację
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        {showConfirmation ? (
          <div className="bg-yellow-50 p-3 rounded border border-yellow-200 flex flex-col gap-2">
            <p className="text-sm text-yellow-800">Czy na pewno chcesz zapisać ocenę?</p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowConfirmation(false)}
              >
                Anuluj
              </Button>
              <Button 
                size="sm" 
                onClick={onSave}
              >
                Potwierdź
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={onConfirm} 
            disabled={articles.length === 0}
          >
            Zapisz ocenę
          </Button>
        )}
      </div>
    </div>
  )
}