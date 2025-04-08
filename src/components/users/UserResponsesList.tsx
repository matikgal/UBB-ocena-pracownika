// Fix the imports to include orderBy
import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../../firebase'
import { Separator } from '../ui/separator'
import { Button } from '../ui/button'
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { useAuth } from '../../contexts/AuthContext'
import { useUserResponses } from '../../services/firebase/useUserResponses'


interface UserResponse {
  id: string
  questionId: string
  questionTitle: string
  points: number
  category: string
  createdAt?: Date
  updatedAt?: Date
  status?: 'pending' | 'approved' | 'rejected'
  verifiedBy?: string
  verifiedAt?: Date
  rejectionReason?: string
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
  const [rejectionReason, setRejectionReason] = useState('')
  const [selectedResponseId, setSelectedResponseId] = useState<string | null>(null)
  const { hasRole } = useAuth()
  const { verifyResponse } = useUserResponses() // This is correct, but we need to ensure it's used properly
  const canVerify = hasRole('admin') || hasRole('dziekan')

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
          updatedAt: data.updatedAt?.toDate(),
          status: data.status || 'pending',
          verifiedBy: data.verifiedBy,
          verifiedAt: data.verifiedAt?.toDate(),
          rejectionReason: data.rejectionReason
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
        // Only count approved responses or pending ones if we're not verifying
        if (response.status === 'approved' || (response.status === 'pending' && !canVerify)) {
          total += response.points
        }
      })
      
      const summaries: CategorySummary[] = Object.keys(categories).map(category => {
        const categoryResponses = categories[category]
        // Only count approved responses or pending ones if we're not verifying
        const categoryTotal = categoryResponses.reduce((sum, r) => {
          if (r.status === 'approved' || (r.status === 'pending' && !canVerify)) {
            return sum + r.points
          }
          return sum
        }, 0)
        
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

  const handleApproveResponse = async (responseId: string) => {
    try {
      if (await verifyResponse(userEmail, responseId, 'approved')) {
        // Update the local state to reflect the change
        const updatedResponses = responses.map(response => {
          if (response.id === responseId) {
            return { 
              ...response, 
              status: 'approved' as const 
            }
          }
          return response
        })
        setResponses(updatedResponses)
        
        // Recalculate totals
        fetchUserResponses()
      }
    } catch (err) {
      console.error('Error approving response:', err)
      setError('Nie udało się zatwierdzić odpowiedzi')
    }
  }

  const handleRejectResponse = async () => {
    if (!selectedResponseId) return
    
    try {
      if (await verifyResponse(userEmail, selectedResponseId, 'rejected', rejectionReason)) {
        // Update the local state to reflect the change
        const updatedResponses = responses.map(response => {
          if (response.id === selectedResponseId) {
            return { 
              ...response, 
              status: 'rejected' as const,
              rejectionReason 
            }
          }
          return response
        })
        setResponses(updatedResponses)
        
        // Reset the dialog state
        setSelectedResponseId(null)
        setRejectionReason('')
        
        // Recalculate totals
        fetchUserResponses()
      }
    } catch (err) {
      console.error('Error rejecting response:', err)
      setError('Nie udało się odrzucić odpowiedzi')
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
      default:
        return <HelpCircle className="h-5 w-5 text-amber-500" />
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'Zatwierdzona'
      case 'rejected':
        return 'Odrzucona'
      case 'pending':
      default:
        return 'Oczekująca'
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
        {canVerify && (
          <p className="text-sm text-blue-600 mt-1">
            Uwaga: Wyświetlane są tylko punkty z zatwierdzonych odpowiedzi.
          </p>
        )}
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
              <div key={response.id} className={`p-3 rounded-md ${
                response.status === 'approved' ? 'bg-green-50 border border-green-100' :
                response.status === 'rejected' ? 'bg-red-50 border border-red-100' :
                'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex justify-between text-black">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(response.status)}
                      <p className="text-gray-800">{response.questionTitle}</p>
                    </div>
                    
                    {response.status === 'rejected' && response.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-100 text-red-800 text-sm rounded">
                        <p className="font-medium text-black">Powód odrzucenia:</p>
                        <p className=''>{response.rejectionReason}</p>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      {response.updatedAt && (
                        <span>
                          Aktualizacja: {response.updatedAt.toLocaleDateString()}
                        </span>
                      )}
                      {response.status !== 'pending' && response.verifiedAt && (
                        <span>
                          Weryfikacja: {response.verifiedAt.toLocaleDateString()}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full ${
                        response.status === 'approved' ? 'bg-green-100 text-green-800' :
                        response.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {getStatusText(response.status)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 flex flex-col items-end">
                    <div className="font-medium text-gray-800">
                      {response.points} pkt
                    </div>
                    
                    {canVerify && response.status === 'pending' && (
                      <div className="flex gap-2 mt-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleApproveResponse(response.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Zatwierdź
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setSelectedResponseId(response.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Odrzuć
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className='text-black'>Odrzuć odpowiedź</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                              <p className="mb-2 text-gray-700">Podaj powód odrzucenia odpowiedzi:</p>
                              <Textarea
                             
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Powód odrzucenia..."
                                className="min-h-[100px] text-black"
                              />
                            </div>
                            <DialogFooter>
                              <Button 
                                className='text-black'
                                variant="outline" 
                                onClick={() => {
                                  setSelectedResponseId(null);
                                  setRejectionReason('');
                                }}
                              >
                                Anuluj
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={handleRejectResponse}
                                disabled={!rejectionReason.trim()}
                              >
                                Odrzuć odpowiedź
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
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