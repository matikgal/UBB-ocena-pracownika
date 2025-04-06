import { useAuth } from "../contexts/AuthContext"
import { getDocs, collection, query, where, doc, updateDoc, deleteDoc } from "@firebase/firestore"
import { db } from "../../firebase"

import { useState, useCallback } from "react"
import { toast } from "sonner"

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

export function useResponses() {
  const [responses, setResponses] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { userData } = useAuth()

  const fetchResponses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Query all users' responses for the specific question
      const allResponses: UserResponse[] = []

      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'Users'))

      for (const userDoc of usersSnapshot.docs) {
        const userEmail = userDoc.id
        const userData = userDoc.data()

        // Query responses for this user
        const responsesRef = collection(db, 'Users', userEmail, 'responses')
        const q = query(
          responsesRef,
          where('questionTitle', '==', 'Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)')
        )

        const responseSnapshot = await getDocs(q)

        responseSnapshot.forEach(responseDoc => {
          const responseData = responseDoc.data()

          allResponses.push({
            id: responseDoc.id,
            userId: userEmail,
            userName: userData.name || 'Unknown User',
            userEmail: userEmail,
            questionId: responseData.questionId,
            questionTitle: responseData.questionTitle,
            points: responseData.points || 0,
            category: responseData.category,
            status: responseData.status || 'pending',
            articles: responseData.articles || [],
          })
        })
      }

      setResponses(allResponses)
    } catch (err) {
      console.error('Error fetching responses:', err)
      setError('Nie udało się pobrać odpowiedzi')
    } finally {
      setLoading(false)
    }
  }, [])

  const updateResponse = useCallback(async (
    responseId: string, 
    userEmail: string, 
    totalPoints: number, 
    articles: Article[], 
    status: 'pending' | 'approved' | 'rejected'
  ) => {
    try {
      setLoading(true)

      // Update the response in Firestore
      const responseRef = doc(db, 'Users', userEmail, 'responses', responseId)
      await updateDoc(responseRef, {
        points: totalPoints,
        articles: articles,
        status: status,
        verifiedBy: userData?.email,
        verifiedAt: new Date(),
      })

      // Update local state
      setResponses(
        responses.map(r =>
          r.id === responseId ? { ...r, points: totalPoints, articles: articles } : r
        )
      )

      const response = responses.find(r => r.id === responseId)
      setSuccessMessage(`Publikacje dla ${response?.userName} zostały zapisane`)
    } catch (err) {
      console.error('Error saving evaluation:', err)
      setError('Nie udało się zapisać oceny')
    } finally {
      setLoading(false)
    }
  }, [responses, userData?.email])

  const approveResponse = useCallback(async (responseId: string) => {
    try {
      setLoading(true)
      
      // Find the response
      const response = responses.find(r => r.id === responseId)
      if (!response) return
      
      // Update the response status in Firestore
      const responseRef = doc(db, 'Users', response.userEmail, 'responses', response.id)
      await updateDoc(responseRef, {
        status: 'approved',
        verifiedBy: userData?.email,
        verifiedAt: new Date(),
      })
      
      // Update local state
      setResponses(
        responses.map(r =>
          r.id === responseId ? { ...r, status: 'approved' } : r
        )
      )
      
      setSuccessMessage(`Ocena dla ${response.userName} została zatwierdzona`)
    } catch (err) {
      console.error('Error approving response:', err)
      setError('Nie udało się zatwierdzić oceny')
    } finally {
      setLoading(false)
    }
  }, [responses, userData?.email])

  const deleteResponse = useCallback(async (responseId: string, userEmail: string) => {
    try {
      setLoading(true)

      // Delete the response from Firestore
      const responseRef = doc(db, 'Users', userEmail, 'responses', responseId)
      await deleteDoc(responseRef)

      // Update local state
      setResponses(responses.filter(r => r.id !== responseId))

      // Show success message after deletion
      toast.success('Odpowiedź została usunięta')
    } catch (err) {
      console.error('Error deleting response:', err)
      toast.error('Nie udało się usunąć odpowiedzi')
    } finally {
      setLoading(false)
    }
  }, [responses])

  const batchApproveResponses = useCallback(async (selectedResponseIds: string[]) => {
    try {
      setLoading(true)
      let successCount = 0

      for (const responseId of selectedResponseIds) {
        const response = responses.find(r => r.id === responseId)
        if (!response || response.status === 'approved') continue

        // Skip responses that don't have articles
        if (!response.articles || response.articles.length === 0) continue

        // Calculate total points
        const totalPoints = response.articles.reduce((sum, article) => sum + article.points, 0)

        // Update the response in Firestore
        const responseRef = doc(db, 'Users', response.userEmail, 'responses', response.id)
        await updateDoc(responseRef, {
          points: totalPoints,
          status: 'approved',
          verifiedBy: userData?.email,
          verifiedAt: new Date(),
        })

        successCount++
      }

      // Update local state
      setResponses(
        responses.map(r =>
          selectedResponseIds.includes(r.id) && r.articles && r.articles.length > 0
            ? { ...r, status: 'approved' }
            : r
        )
      )

      setSuccessMessage(`Zatwierdzono ${successCount} odpowiedzi`)
    } catch (err) {
      console.error('Error batch approving responses:', err)
      setError('Nie udało się zatwierdzić odpowiedzi')
    } finally {
      setLoading(false)
    }
  }, [responses, userData?.email])

  return {
    responses,
    loading,
    error,
    successMessage,
    fetchResponses,
    updateResponse,
    approveResponse,
    deleteResponse,
    batchApproveResponses,
    setError,
    setSuccessMessage
  }
}