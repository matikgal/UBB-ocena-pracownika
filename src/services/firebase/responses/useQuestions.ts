/**
 * Hook zarządzający pytaniami i odpowiedziami użytkownika.
 * Obsługuje pobieranie pytań dla wybranej kategorii, zarządzanie stanem odpowiedzi,
 * zapisywanie, aktualizację i usuwanie odpowiedzi użytkownika.
 */
import { useState, useEffect, useRef } from 'react'
import { useResponses } from './useResponses'
import { useAuth } from '../../../contexts/AuthContext'
import { toast } from 'sonner'
import { Question, QuestionState } from '../../../types'
import { responseService } from './responseService'

export function useQuestions(selectedCategory: string) {
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const { saveResponse, loadResponses, responses, deleteResponse } = useResponses()
  const { userData } = useAuth()
  
  const dataLoadedRef = useRef<Record<string, boolean>>({});
  
  useEffect(() => {
    setQuestions([]);
    
    const loadData = async () => {
      setLoading(true);
      try {
        dataLoadedRef.current[selectedCategory] = true;
        
        await fetchQuestions();
        
        if (userData?.email) {
          await loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Nie udało się załadować danych');
        dataLoadedRef.current[selectedCategory] = false;
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedCategory, userData?.email]);

  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions for category:', selectedCategory);
      
      const fetchedQuestions = await responseService.fetchQuestions(selectedCategory);
      
      setQuestions(fetchedQuestions);
      initializeQuestionStates(fetchedQuestions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Nie udało się pobrać pytań');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && responses) {
      initializeQuestionStates(questions);
    }
  }, [responses, questions]);

  const initializeQuestionStates = (fetchedQuestions: Question[]) => {
    const initialStates: Record<string, QuestionState> = {};
  
    fetchedQuestions.forEach(question => {
      const existingResponse = responses.find((r: { questionId: string }) => r.questionId === question.id);
  
      if (existingResponse) {
        question.status = existingResponse.status;
      } else {
        question.status = undefined;
      }
  
      initialStates[question.id] = {
        checked: existingResponse ? true : question.status === 'approved',
        value: existingResponse
          ? existingResponse.points.toString()
          : typeof question.points === 'number'
          ? question.points.toString()
          : '0',
      };
    });
  
    setQuestionStates(initialStates);
  };

  const handleCheckboxChange = (questionId: string) => {
    const isCurrentlyChecked = questionStates[questionId]?.checked;
    
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        checked: !isCurrentlyChecked,
      },
    }));
  };

  const handleValueChange = (questionId: string, value: string) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        value,
      },
    }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      setTimeout(() => setError(null), 100);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      setTimeout(() => setSuccessMessage(null), 100);
    }
  }, [successMessage]);

  const handleSaveResponses = async () => {
    if (!userData?.email) {
      toast.error('Musisz być zalogowany, aby zapisać odpowiedzi');
      return;
    }
  
    try {
      setLoading(true);
      
      const checkedQuestions = Object.entries(questionStates)
        .filter(([_, state]) => state.checked)
        .map(([id, state]) => ({
          id,
          points: parseFloat(state.value.replace(',', '.')),
        }));
      
      if (checkedQuestions.length === 0) {
        setError('Nie wybrano żadnych pytań');
        setLoading(false);
        return;
      }
      
      for (const item of checkedQuestions) {
        const question = questions.find(q => q.id === item.id);
        if (question) {
          if (question.status === 'approved') {
            continue;
          }
          await saveResponse(question.id, question.title, item.points, selectedCategory, question.status);
        }
      }
      
      await loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`);
      
      setSuccessMessage('Odpowiedzi zostały zapisane');
    } catch (err) {
      console.error('Error saving responses:', err);
      setError('Nie udało się zapisać odpowiedzi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async (questionId: string) => {
    if (!userData?.email) {
      toast.error('Musisz być zalogowany, aby usunąć odpowiedź');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = responses.find((r: { questionId: string }) => r.questionId === questionId);
      
      if (!response || !response.id) {
        setError('Nie znaleziono odpowiedzi do usunięcia');
        setLoading(false);
        return;
      }
      
      if (response.status === 'approved') {
        setError('Nie można usunąć zatwierdzonych odpowiedzi');
        setLoading(false);
        return;
      }
      
      await deleteResponse(response.id);
      
      await loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`);
      
      setQuestionStates(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          checked: false,
          value: typeof questions.find(q => q.id === questionId)?.points === 'number' 
            ? questions.find(q => q.id === questionId)?.points.toString() || '0'
            : '0',
        },
      }));
      
      setSuccessMessage('Odpowiedź została usunięta');
    } catch (err) {
      console.error('Error deleting response:', err);
      setError('Nie udało się usunąć odpowiedzi');
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    questionStates,
    loading,
    error,
    successMessage,
    handleCheckboxChange,
    handleValueChange,
    handleSaveResponses,
    handleDeleteResponse
  }
}