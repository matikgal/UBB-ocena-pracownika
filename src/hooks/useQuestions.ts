import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useUserResponses } from './useUserResponses'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

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
          // Always force refresh responses when category changes by adding timestamp
          // This ensures we bypass any caching mechanism in useUserResponses
          await loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`);
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
      } else {
        // Reset status if no existing response is found
        question.status = undefined;
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
    // Get the current state before updating
    const isCurrentlyChecked = questionStates[questionId]?.checked;
    
    // Update the question state
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        checked: !isCurrentlyChecked,
      },
    }));
  
    // If it's being checked, we'll save it when the user clicks save
    // or when they change categories (already implemented in saveResponsesAutomatically)
  };

  // Modify the saveResponsesAutomatically function to be more robust
  const saveResponsesAutomatically = async () => {
    if (!userData || !userData.email) return;
    
    try {
      // Get all checked questions
      const checkedQuestions = Object.entries(questionStates)
        .filter(([_, state]) => state.checked)
        .map(([id, state]) => ({
          id,
          // Replace commas with dots before parsing to handle different number formats
          points: parseFloat(state.value.replace(',', '.')),
        }));
  
      if (checkedQuestions.length === 0) return;
  
      // Save each response
      for (const item of checkedQuestions) {
        const question = questions.find(q => q.id === item.id);
        if (question) {
          // Skip questions with approved status
          if (question.status === 'approved') {
            continue;
          }
          await saveResponse(question.id, question.title, item.points, previousCategoryRef.current, question.status);
        }
      }
      console.log('Responses auto-saved successfully');
    } catch (err) {
      console.error('Error auto-saving responses:', err);
    }
  };

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
  // Show toast when error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Clear error after showing toast
      setTimeout(() => setError(null), 100);
    }
  }, [error]);

  // Show toast when success message changes
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      // Clear success message after showing toast
      setTimeout(() => setSuccessMessage(null), 100);
    }
  }, [successMessage]);

  const handleSaveResponses = async () => {
    if (!userData?.email) {
      toast.error('Musisz być zalogowany, aby zapisać odpowiedzi');
      return;
    }
  
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
        toast.error('Nie wybrano żadnych pytań');
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
  
      // Show success toast
      const hasUncheckedResponses = Object.entries(questionStates).some(([_, state]) => !state.checked);
      toast.success(
        hasUncheckedResponses
          ? 'Odpowiedzi zostały zapisane, a odznaczone pytania usunięte' 
          : 'Odpowiedzi zostały zapisane'
      );
    } catch (err) {
      console.error('Error saving responses:', err);
      toast.error('Nie udało się zapisać odpowiedzi');
    }
  };

  const handleDeleteResponse = async (questionId: string) => {
    if (!userData?.email) {
      toast.error('Musisz być zalogowany, aby usunąć odpowiedź');
      return false;
    }
  
    try {
      // Find the response for this question
      const existingResponse = responses.find(r => r.questionId === questionId);
      
      if (existingResponse && existingResponse.id) {
        // Delete the response but don't change the checkbox state
        await deleteResponse(existingResponse.id);
        
        // Set success message
        setSuccessMessage('Odpowiedź została usunięta');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        // Important: Don't modify the checkbox state here
        // We're removing this line:
        // setQuestionStates(prev => ({
        //   ...prev,
        //   [questionId]: {
        //     ...prev[questionId],
        //     checked: false,
        //   },
        // }));
      }
    } catch (err) {
      console.error('Error deleting response:', err);
      setError('Nie udało się usunąć odpowiedzi');
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  // Add a ref to track the previous category
  const previousCategoryRef = useRef<string>(selectedCategory);
  
  // Add effect to handle category changes
  useEffect(() => {
    // If this is not the initial render and category has changed
    if (previousCategoryRef.current !== selectedCategory && previousCategoryRef.current) {
      // We'll skip the automatic save here since it will be handled by the event listener
      // saveResponsesAutomatically(); <- Comment this out or remove it
      
      // Also handle unchecked questions by removing their responses
      const uncheckedQuestions = Object.entries(questionStates)
        .filter(([_, state]) => !state.checked)
        .map(([id]) => id);
        
      // Delete responses for unchecked questions
      uncheckedQuestions.forEach(questionId => {
        const existingResponse = responses.find(r => r.questionId === questionId);
        if (existingResponse && existingResponse.id) {
          deleteResponse(existingResponse.id);
        }
      });
    }
    
    // Update the ref with current category
    previousCategoryRef.current = selectedCategory;
  }, [selectedCategory]);
  
  // Add this effect to listen for the saveResponses event
  useEffect(() => {
    const handleSaveEvent = (event: CustomEvent) => {
      // Call the same function that's used by the Save button
      handleSaveResponses();
    };
  
    // Add event listener
    window.addEventListener('saveResponses', handleSaveEvent as EventListener);
  
    // Cleanup
    return () => {
      window.removeEventListener('saveResponses', handleSaveEvent as EventListener);
    };
  }, [questionStates, questions, userData?.email]); // Add dependencies that handleSaveResponses uses

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