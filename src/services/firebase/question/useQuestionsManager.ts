
/**
 * Uniwersalny hook do zarządzania pytaniami i odpowiedziami.
 * Zapewnia funkcje do pobierania, dodawania, aktualizacji i usuwania pytań
 * oraz zarządzania odpowiedziami użytkownika.
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { fetchQuestionsByCategory, addQuestion, updateQuestion, deleteQuestion } from './questionsService'
import { allQuestions } from '../../../lib/questions'
import { useResponses } from '../responses/useResponses'
import { useAuth } from '../../../contexts/AuthContext'
import { toast } from 'sonner'
import { Question, QuestionState } from '../../../types'

export function useQuestionsManager(initialCategory: string) {
  // Stany
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})
  
  // Hooki i referencje
  const { saveResponse, loadResponses, responses, deleteResponse } = useResponses()
  const { userData } = useAuth()
  const dataLoadedRef = useRef<Record<string, boolean>>({});
  
  // Pobieranie pytań przy montowaniu komponentu lub zmianie kategorii
  useEffect(() => {
    fetchQuestions(initialCategory)
  }, [initialCategory])
  
  // Pobieranie pytań dla danej kategorii
  const fetchQuestions = async (category: string) => {
    try {
      setLoading(true)
      const fetchedQuestions = await fetchQuestionsByCategory(category)
      setQuestions(fetchedQuestions)
      setError(null)
      
      // Jeśli mamy zalogowanego użytkownika, ładujemy również odpowiedzi
      if (userData?.email) {
        await loadResponses(`${category}?refresh=${new Date().getTime()}`);
      }
      
      // Inicjalizacja stanów pytań
      initializeQuestionStates(fetchedQuestions)
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError('Nie udało się pobrać pytań')
    } finally {
      setLoading(false)
    }
  }
  
  // Inicjalizacja stanów pytań
  const initializeQuestionStates = useCallback((fetchedQuestions: Question[]) => {
    const initialStates: Record<string, QuestionState> = {}
  
    fetchedQuestions.forEach(question => {
      const existingResponse = responses?.find(r => r.questionId === question.id)
  
      if (existingResponse) {
        question.status = existingResponse.status;
      }
  
      initialStates[question.id] = {
        checked: existingResponse ? true : question.status === 'approved',
        value: existingResponse
          ? existingResponse.points.toString()
          : typeof question.points === 'number'
          ? question.points.toString()
          : '0',
      }
    })
  
    setQuestionStates(initialStates)
  }, [responses])
  
  // Aktualizacja stanów pytań przy zmianie odpowiedzi
  useEffect(() => {
    if (questions.length > 0 && responses) {
      initializeQuestionStates(questions)
    }
  }, [responses, questions, initializeQuestionStates])
  
  // Obsługa błędów i komunikatów
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
  
  // Funkcje do zarządzania odpowiedziami użytkownika
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
    }))
  }
  
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
          await saveResponse(question.id, question.title, item.points, initialCategory, question.status);
        }
      }
      
      await loadResponses(`${initialCategory}?refresh=${new Date().getTime()}`);
      
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
      
      const response = responses?.find(r => r.questionId === questionId);
      
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
      
      await loadResponses(`${initialCategory}?refresh=${new Date().getTime()}`);
      
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
  
  // Funkcje do zarządzania pytaniami (dla administratora)
  const addNewQuestion = async (question: Question, category: string) => {
    if (question.title.trim() === '') return null

    try {
      const questionToAdd = {
        title: question.title,
        points: question.points,
        tooltip: question.tooltip,
        category: category
      }

      const newId = await addQuestion(questionToAdd)
      
      // Aktualizacja stanu lokalnego
      setQuestions([...questions, { ...question, id: newId }])
      return newId
    } catch (err) {
      console.error('Error adding question:', err)
      setError('Nie udało się dodać pytania')
      return null
    }
  }

  const updateExistingQuestion = async (question: Question) => {
    try {
      const questionToUpdate = {
        title: question.title,
        points: question.points,
        tooltip: question.tooltip
      }

      await updateQuestion(question.id, questionToUpdate)
      
      // Aktualizacja stanu lokalnego
      setQuestions(questions.map(q => 
        q.id === question.id ? question : q
      ))
      
      return true
    } catch (err) {
      console.error('Error updating question:', err)
      setError('Nie udało się zaktualizować pytania')
      return false
    }
  }

  const deleteExistingQuestion = async (id: string) => {
    try {
      await deleteQuestion(id)
      // Aktualizacja stanu lokalnego
      setQuestions(questions.filter(q => q.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting question:', err)
      setError('Nie udało się usunąć pytania')
      return false
    }
  }

  const addAllQuestionsFromFile = async (category: string) => {
    try {
      setLoading(true)
      setError(null)
      
      // Filtrowanie pytań dla bieżącej kategorii
      const questionsToAdd = allQuestions.filter(q => q.category === category)
      
      // Sprawdzanie duplikatów
      const existingTitles = questions.map(q => q.title)
      const newQuestions = questionsToAdd.filter(q => !existingTitles.includes(q.title))
      
      if (newQuestions.length === 0) {
        setError('Wszystkie pytania z tej kategorii już istnieją w bazie danych')
        setLoading(false)
        return
      }
      
      // Dodawanie każdego pytania do Firebase
      const addedQuestions = []
      for (const question of newQuestions) {
        const questionToAdd = {
          title: question.title,
          points: question.points,
          tooltip: question.tooltip,
          category: question.category
        }
        
        const newId = await addQuestion(questionToAdd)
        addedQuestions.push({ ...question, id: newId })
      }
      
      // Aktualizacja stanu lokalnego
      setQuestions([...questions, ...addedQuestions])
      
      // Wyświetlanie komunikatu o sukcesie
      setError(`Dodano ${addedQuestions.length} nowych pytań do kategorii ${category}`)
    } catch (err) {
      console.error('Error adding all questions:', err)
      setError('Nie udało się dodać wszystkich pytań')
    } finally {
      setLoading(false)
    }
  }

  // Zwracanie wszystkich funkcji i stanów
  return {
    // Stany
    questions,
    questionStates,
    loading,
    error,
    successMessage,
    
    // Funkcje do zarządzania pytaniami
    fetchQuestions,
    addNewQuestion,
    updateExistingQuestion,
    deleteExistingQuestion,
    addAllQuestionsFromFile,
    
    // Funkcje do zarządzania odpowiedziami
    handleCheckboxChange,
    handleValueChange,
    handleSaveResponses,
    handleDeleteResponse
  }
}