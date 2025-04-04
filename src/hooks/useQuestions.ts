import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useUserResponses } from './useUserResponses'
import { useAuth } from '../contexts/AuthContext'

interface Question {
  id: string
  title: string
  points: number | string
  tooltip: string[]
  status?: 'pending' | 'approved' | 'rejected' // Add status field
  isLibraryEvaluated?: boolean // Add this property
}

interface QuestionState {
  checked: boolean
  value: string
}

export function useQuestions(selectedCategory: string) {
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Update this line to include deleteResponse
  const { saveResponse, loadResponses, responses, deleteResponse } = useUserResponses()
  const { userData } = useAuth()
  
  // Use a ref to track if we've already loaded data for this category
  const dataLoadedRef = useRef<Record<string, boolean>>({});
  
  // Make sure responses are loaded when component mounts or category changes
  useEffect(() => {
    // Always reset questions when category changes
    setQuestions([]);
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Mark this category as loaded
        dataLoadedRef.current[selectedCategory] = true;
        
        // Fetch questions first
        await fetchQuestions();
        
        if (userData?.email) {
          // Then load responses
          await loadResponses(selectedCategory);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Nie udało się załadować danych');
        // Reset the loading flag on error
        dataLoadedRef.current[selectedCategory] = false;
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedCategory, userData?.email]);

  // Inside the fetchQuestions function, modify the part where questions are processed:
  
  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions for category:', selectedCategory)
  
      const q = query(collection(db, 'Questions'), where('category', '==', selectedCategory))
  
      const querySnapshot = await getDocs(q)
      const fetchedQuestions: Question[] = []
  
      querySnapshot.forEach(doc => {
        const data = doc.data()
  
        // Parse tooltip string into array if it's a string
        const tooltip =
          typeof data.tooltip === 'string' ? data.tooltip.split(',') : Array.isArray(data.tooltip) ? data.tooltip : []
  
        // Check if this is the library-evaluated question
        const isLibraryEvaluated = 
          data.title === "Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)" ||
          data.isLibraryEvaluated === true;
  
        fetchedQuestions.push({
          id: doc.id,
          ...data,
          tooltip: tooltip,
          // Only include status if it exists in the database
          status: data.status,
          isLibraryEvaluated: isLibraryEvaluated
        } as Question)
      })
  
      setQuestions(fetchedQuestions)
      initializeQuestionStates(fetchedQuestions)
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Nie udało się pobrać pytań')
    } finally {
      setLoading(false)
    }
  }

  // Update when responses change to properly initialize question states
  useEffect(() => {
    if (questions.length > 0 && responses) {
      initializeQuestionStates(questions)
    }
  }, [responses, questions])

  // Update initializeQuestionStates to properly handle existing responses
  const initializeQuestionStates = (fetchedQuestions: Question[]) => {
    const initialStates: Record<string, QuestionState> = {}
  
    fetchedQuestions.forEach(question => {
      const existingResponse = responses.find(r => r.questionId === question.id)
  
      if (existingResponse) {
        question.status = existingResponse.status;
      }
  
      initialStates[question.id] = {
        // Set checked to true if there's an existing response OR if the question is approved
        checked: existingResponse ? true : question.status === 'approved',
        value: existingResponse
          ? existingResponse.points.toString()
          : typeof question.points === 'number'
          ? question.points.toString()
          : '0',
      }
    })
  
    setQuestionStates(initialStates)
  }

  const handleCheckboxChange = (questionId: string) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        checked: !prev[questionId]?.checked,
      },
    }))
  }

  const handleValueChange = (questionId: string, value: string) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        value,
      },
    }))
  }

  // Add function to save responses
  const handleSaveResponses = async () => {
    if (!userData?.email) {
      setError('Musisz być zalogowany, aby zapisać odpowiedzi');
      return;
    }
  
    setError(null);
    setSuccessMessage(null);
  
    try {
      // Get all checked questions
      const checkedQuestions = Object.entries(questionStates)
        .filter(([_, state]) => state.checked)
        .map(([id, state]) => ({
          id,
          // Replace commas with dots before parsing
          points: parseFloat(state.value.replace(',', '.')),
        }));
  
      if (checkedQuestions.length === 0) {
        setError('Nie wybrano żadnych pytań');
        return;
      }
  
      // Save each response
      for (const item of checkedQuestions) {
        const question = questions.find(q => q.id === item.id);
        if (question) {
          // Skip questions with approved status
          if (question.status === 'approved') {
            continue;
          }
          await saveResponse(question.id, question.title, item.points, selectedCategory, question.status);
        }
      }
  
      setSuccessMessage('Odpowiedzi zostały zapisane');
  
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving responses:', err);
      setError('Nie udało się zapisać odpowiedzi');
    }
  }

  // Add function to delete a response
  const handleDeleteResponse = async (questionId: string) => {
    if (!userData?.email) {
      setError('Musisz być zalogowany, aby usunąć odpowiedź')
      return false
    }

    setError(null)
    setSuccessMessage(null)

    try {
      // Find the response for this question
      const existingResponse = responses.find(r => r.questionId === questionId)
      
      if (!existingResponse || !existingResponse.id) {
        setError('Nie znaleziono odpowiedzi do usunięcia')
        return false
      }

      // Delete the response
      await deleteResponse(existingResponse.id)

      // Update question state to uncheck the deleted question
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          checked: false,
        },
      }))

      setSuccessMessage('Odpowiedź została usunięta')

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      return true
    } catch (err) {
      console.error('Error deleting response:', err)
      setError('Nie udało się usunąć odpowiedzi')
      return false
    }
  }

  // Add a ref to track the previous category
  const previousCategoryRef = useRef<string>(selectedCategory);
  
  // Add a function to save responses automatically
  const saveResponsesAutomatically = async () => {
    if (!userData?.email) return;
  
    // Get all checked questions
    const checkedQuestions = Object.entries(questionStates)
      .filter(([_, state]) => state.checked)
      .map(([id, state]) => ({
        id,
        points: parseInt(state.value),
      }));
  
    if (checkedQuestions.length === 0) return;
  
    try {
      // Save each response
      for (const item of checkedQuestions) {
        const question = questions.find(q => q.id === item.id);
        if (question) {
          await saveResponse(question.id, question.title, item.points, previousCategoryRef.current);
        }
      }
      console.log('Responses auto-saved successfully');
    } catch (err) {
      console.error('Error auto-saving responses:', err);
    }
  };
  
  // Add effect to handle category changes
  useEffect(() => {
    // If this is not the initial render and category has changed
    if (previousCategoryRef.current !== selectedCategory && previousCategoryRef.current) {
      // Save responses for the previous category
      saveResponsesAutomatically();
    }
    
    // Update the ref with current category
    previousCategoryRef.current = selectedCategory;
  }, [selectedCategory]);
  
  // Add effect to handle page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Trigger save
      saveResponsesAutomatically();
      
      // Show confirmation dialog
      event.preventDefault();
      event.returnValue = 'Czy na pewno chcesz opuścić stronę? Twoje odpowiedzi zostaną zapisane.';
      return event.returnValue;
    };
  
    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [questionStates, questions, userData?.email]);

  return {
    questions,
    questionStates,
    loading,
    error,
    successMessage,
    handleCheckboxChange,
    handleValueChange,
    handleSaveResponses,
    handleDeleteResponse,
  };
}