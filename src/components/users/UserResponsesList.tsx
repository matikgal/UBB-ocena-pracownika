import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase'
import { Separator } from '../ui/separator'

interface UserResponse {
  id: string
  questionId: string
  questionTitle: string
  points: number
  category: string
  createdAt?: Date
  updatedAt?: Date
}

interface CategorySummary {
  category: string
  responses: UserResponse[]
  totalPoints: number
}

export default function UserResponsesList({ userEmail }: { userEmail: string }) {
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([])
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    fetchUserResponses()
  }, [userEmail])

  const fetchUserResponses = async () => {
    try {
      setLoading(true)
      const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses')
      const q = query(responsesCollectionRef, orderBy('category'))
      
      const querySnapshot = await getDocs(q)
      const fetchedResponses: UserResponse[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedResponses.push({
          id: doc.id,
          questionId: data.questionId,
          questionTitle: data.questionTitle,
          points: data.points,
          category: data.category,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as UserResponse)
      })
      
      setResponses(fetchedResponses)
      
      // Group responses by category and calculate totals
      const categories: Record<string, UserResponse[]> = {}
      let total = 0
      
      fetchedResponses.forEach(response => {
        if (!categories[response.category]) {
          categories[response.category] = []
        }
        categories[response.category].push(response)
        total += response.points
      })
      
      const summaries: CategorySummary[] = Object.keys(categories).map(category => {
        const categoryResponses = categories[category]
        const categoryTotal = categoryResponses.reduce((sum, r) => sum + r.points, 0)
        
        return {
          category,
          responses: categoryResponses,
          totalPoints: categoryTotal
        }
      })
      
      setCategorySummaries(summaries)
      setTotalPoints(total)
    } catch (err) {
      console.error('Error fetching user responses:', err)
      setError('Nie udało się pobrać odpowiedzi użytkownika')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
          <span>Ładowanie odpowiedzi...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-md">
        {error}
      </div>
    )
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Użytkownik nie ma żadnych odpowiedzi
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-blue-800">Podsumowanie punktów</h3>
          <span className="text-lg font-bold text-blue-800">{totalPoints} pkt</span>
        </div>
      </div>
      
      {categorySummaries.map((summary) => (
        <div key={summary.category} className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800">{summary.category}</h3>
            <span className="font-medium text-gray-800">{summary.totalPoints} pkt</span>
          </div>
          <Separator className="mb-3" />
          
          <div className="space-y-3">
            {summary.responses.map((response) => (
              <div key={response.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-gray-800">{response.questionTitle}</p>
                    {response.updatedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ostatnia aktualizacja: {response.updatedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 font-medium text-gray-800">
                    {response.points} pkt
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}