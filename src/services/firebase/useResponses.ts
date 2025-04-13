import { getDocs, collection, query, where, doc, updateDoc, deleteDoc, serverTimestamp } from "@firebase/firestore"
import { db } from "../../../firebase"
import { useState, useCallback } from "react"
import { toast } from '../../components/common/Toast';
import { useAuth } from "../../contexts/AuthContext"
import { Article, UserResponse } from "../../types"


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
            userId: userDoc.id,
            userName: userData.name || '',
            userEmail: userEmail,
            questionId: responseData.questionId || '',
            questionTitle: responseData.questionTitle || '',
            points: responseData.points || 0,
            category: responseData.category || '',
            status: responseData.status || 'pending',
            articles: responseData.articles || [],
            createdAt: responseData.createdAt?.toDate() || new Date(),
            updatedAt: responseData.updatedAt?.toDate() || new Date(),
            verifiedBy: responseData.verifiedBy || null,
            verifiedAt: responseData.verifiedAt?.toDate() || null,
            rejectionReason: responseData.rejectionReason || null,
          })
        })
      }


      setResponses(allResponses)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching responses:', err)
      setError('Failed to fetch responses')
      setLoading(false)
    }
  }, [])


  const approveResponse = useCallback(async (responseId: string, userEmail: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const responseRef = doc(db, 'Users', userEmail, 'responses', responseId)
      
      await updateDoc(responseRef, {
        status: 'approved',
        verifiedBy: userData?.email || 'unknown',
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      setResponses(prev => 
        prev.map(response => 
          response.id === responseId && response.userEmail === userEmail
            ? {
                ...response,
                status: 'approved',
                verifiedBy: userData?.email || 'unknown',
                verifiedAt: new Date(),
                updatedAt: new Date()
              }
            : response
        )
      )
      
      toast.success('Response approved successfully')
      setSuccessMessage('Response approved successfully')
      setLoading(false)
    } catch (err) {
      console.error('Error approving response:', err)
      setError('Failed to approve response')
      setLoading(false)
      toast.error('Failed to approve response')
    }
  }, [userData])


  const rejectResponse = useCallback(async (responseId: string, userEmail: string, rejectionReason: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const responseRef = doc(db, 'Users', userEmail, 'responses', responseId)
      
      await updateDoc(responseRef, {
        status: 'rejected',
        verifiedBy: userData?.email || 'unknown',
        verifiedAt: serverTimestamp(),
        rejectionReason: rejectionReason,
        updatedAt: serverTimestamp()
      })
      
      setResponses(prev => 
        prev.map(response => 
          response.id === responseId && response.userEmail === userEmail
            ? {
                ...response,
                status: 'rejected',
                verifiedBy: userData?.email || 'unknown',
                verifiedAt: new Date(),
                rejectionReason: rejectionReason,
                updatedAt: new Date()
              }
            : response
        )
      )
      
      toast.success('Response rejected successfully')
      setSuccessMessage('Response rejected successfully')
      setLoading(false)
    } catch (err) {
      console.error('Error rejecting response:', err)
      setError('Failed to reject response')
      setLoading(false)
      toast.error('Failed to reject response')
    }
  }, [userData])


  const addArticleToResponse = useCallback(async (responseId: string, userEmail: string, article: Article) => {
    try {
      setLoading(true)
      setError(null)
      
      const responseRef = doc(db, 'Users', userEmail, 'responses', responseId)
      const response = responses.find(r => r.id === responseId && r.userEmail === userEmail)
      
      if (!response) {
        throw new Error('Response not found')
      }
      
      const updatedArticles = [...(response.articles || []), article]
      
      await updateDoc(responseRef, {
        articles: updatedArticles,
        updatedAt: serverTimestamp()
      })
      
      setResponses(prev => 
        prev.map(r => 
          r.id === responseId && r.userEmail === userEmail
            ? {
                ...r,
                articles: updatedArticles,
                updatedAt: new Date()
              }
            : r
        )
      )
      
      toast.success('Article added successfully')
      setSuccessMessage('Article added successfully')
      setLoading(false)
    } catch (err) {
      console.error('Error adding article:', err)
      setError('Failed to add article')
      setLoading(false)
      toast.error('Failed to add article')
    }
  }, [responses])


  const removeArticleFromResponse = useCallback(async (responseId: string, userEmail: string, articleIndex: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const responseRef = doc(db, 'Users', userEmail, 'responses', responseId)
      const response = responses.find(r => r.id === responseId && r.userEmail === userEmail)
      
      if (!response || !response.articles) {
        throw new Error('Response or articles not found')
      }
      
      const updatedArticles = [...response.articles]
      updatedArticles.splice(articleIndex, 1)
      
      await updateDoc(responseRef, {
        articles: updatedArticles,
        updatedAt: serverTimestamp()
      })
      
      setResponses(prev => 
        prev.map(r => 
          r.id === responseId && r.userEmail === userEmail
            ? {
                ...r,
                articles: updatedArticles,
                updatedAt: new Date()
              }
            : r
        )
      )
      
      toast.success('Article removed successfully')
      setSuccessMessage('Article removed successfully')
      setLoading(false)
    } catch (err) {
      console.error('Error removing article:', err)
      setError('Failed to remove article')
      setLoading(false)
      toast.error('Failed to remove article')
    }
  }, [responses])


  const deleteResponse = useCallback(async (responseId: string, userEmail: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const responseRef = doc(db, 'Users', userEmail, 'responses', responseId)
      
      await deleteDoc(responseRef)
      
      setResponses(prev => prev.filter(r => !(r.id === responseId && r.userEmail === userEmail)))
      
      toast.success('Response deleted successfully')
      setSuccessMessage('Response deleted successfully')
      setLoading(false)
    } catch (err) {
      console.error('Error deleting response:', err)
      setError('Failed to delete response')
      setLoading(false)
      toast.error('Failed to delete response')
    }
  }, [])


  return {
    responses,
    loading,
    error,
    successMessage,
    fetchResponses,
    approveResponse,
    rejectResponse,
    addArticleToResponse,
    removeArticleFromResponse,
    deleteResponse
  }
}