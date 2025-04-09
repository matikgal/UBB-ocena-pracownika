import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../firebase'
import { useUserResponses } from './useUserResponses'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner'
import { Question, QuestionState } from '../../types'

export function useQuestions(selectedCategory: string) {
  // Inicjalizacja stanów
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Pobieranie funkcji i danych z innych hooków
  const { saveResponse, loadResponses, responses, deleteResponse } = useUserResponses()
  const { userData } = useAuth()
  
  // Referencja do śledzenia, czy dane zostały już załadowane dla tej kategorii
  const dataLoadedRef = useRef<Record<string, boolean>>({});
  
  // Ładowanie danych przy montowaniu komponentu lub zmianie kategorii
  useEffect(() => {
    // Resetowanie pytań przy zmianie kategorii
    setQuestions([]);
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Oznaczenie kategorii jako załadowanej
        dataLoadedRef.current[selectedCategory] = true;
        
        // Najpierw pobierz pytania
        await fetchQuestions();
        
        if (userData?.email) {
          // Wymuszenie odświeżenia odpowiedzi przy zmianie kategorii
          await loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Nie udało się załadować danych');
        // Resetowanie flagi ładowania w przypadku błędu
        dataLoadedRef.current[selectedCategory] = false;
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [selectedCategory, userData?.email]);

  // Pobieranie pytań dla wybranej kategorii
  const fetchQuestions = async () => {
    try {
      console.log('Fetching questions for category:', selectedCategory)
  
      const q = query(collection(db, 'Questions'), where('category', '==', selectedCategory))
  
      const querySnapshot = await getDocs(q)
      const fetchedQuestions: Question[] = []
  
      querySnapshot.forEach(doc => {
        const data = doc.data()
  
        // Parsowanie podpowiedzi ze stringa do tablicy
        const tooltip =
          typeof data.tooltip === 'string' ? data.tooltip.split(',') : Array.isArray(data.tooltip) ? data.tooltip : []
  
        // Sprawdzenie czy to pytanie oceniane przez bibliotekę
        const isLibraryEvaluated = 
          data.title === "Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)" ||
          data.isLibraryEvaluated === true;
  
        fetchedQuestions.push({
          id: doc.id,
          ...data,
          tooltip: tooltip,
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

  // Aktualizacja stanów pytań przy zmianie odpowiedzi
  useEffect(() => {
    if (questions.length > 0 && responses) {
      initializeQuestionStates(questions)
    }
  }, [responses, questions])

  // Inicjalizacja stanów pytań na podstawie istniejących odpowiedzi
  const initializeQuestionStates = (fetchedQuestions: Question[]) => {
    const initialStates: Record<string, QuestionState> = {}
  
    fetchedQuestions.forEach(question => {
      const existingResponse = responses.find(r => r.questionId === question.id)
  
      if (existingResponse) {
        question.status = existingResponse.status;
      } else {
        // Resetowanie statusu jeśli nie znaleziono odpowiedzi
        question.status = undefined;
      }
  
      initialStates[question.id] = {
        // Zaznaczenie checkboxa jeśli istnieje odpowiedź LUB pytanie jest zatwierdzone
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

  // Obsługa zmiany stanu checkboxa
  const handleCheckboxChange = (questionId: string) => {
    // Pobranie aktualnego stanu przed aktualizacją
    const isCurrentlyChecked = questionStates[questionId]?.checked;
    
    // Aktualizacja stanu pytania
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        checked: !isCurrentlyChecked,
      },
    }));
  };

  // Automatyczne zapisywanie odpowiedzi
  const saveResponsesAutomatically = async () => {
    if (!userData || !userData.email) return;
    
    try {
      // Pobierz wszystkie zaznaczone pytania
      const checkedQuestions = Object.entries(questionStates)
        .filter(([_, state]) => state.checked)
        .map(([id, state]) => ({
          id,
          // Zamiana przecinków na kropki przed parsowaniem
          points: parseFloat(state.value.replace(',', '.')),
        }));
  
      if (checkedQuestions.length === 0) return;
  
      // Zapisz każdą odpowiedź
      for (const item of checkedQuestions) {
        const question = questions.find(q => q.id === item.id);
        if (question) {
          // Pomiń pytania o statusie "zatwierdzone"
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

  // Obsługa zmiany wartości punktów
  const handleValueChange = (questionId: string, value: string) => {
    setQuestionStates(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        value,
      },
    }))
  }

  // Wyświetlanie powiadomień o błędach
  useEffect(() => {
    if (error) {
      toast.error(error);
      // Czyszczenie błędu po wyświetleniu powiadomienia
      setTimeout(() => setError(null), 100);
    }
  }, [error]);

  // Wyświetlanie powiadomień o sukcesie
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      // Czyszczenie komunikatu po wyświetleniu powiadomienia
      setTimeout(() => setSuccessMessage(null), 100);
    }
  }, [successMessage]);

  // Obsługa zapisywania odpowiedzi
  const handleSaveResponses = async () => {
    if (!userData?.email) {
      toast.error('Musisz być zalogowany, aby zapisać odpowiedzi');
      return;
    }
  
    try {
      setLoading(true);
      
      // Pobierz wszystkie zaznaczone pytania
      const checkedQuestions = Object.entries(questionStates)
        .filter(([_, state]) => state.checked)
        .map(([id, state]) => ({
          id,
          // Zamiana przecinków na kropki przed parsowaniem
          points: parseFloat(state.value.replace(',', '.')),
        }));
      
      if (checkedQuestions.length === 0) {
        setError('Nie wybrano żadnych pytań');
        setLoading(false);
        return;
      }
      
      // Zapisz każdą odpowiedź
      for (const item of checkedQuestions) {
        const question = questions.find(q => q.id === item.id);
        if (question) {
          // Pomiń pytania o statusie "zatwierdzone"
          if (question.status === 'approved') {
            continue;
          }
          await saveResponse(question.id, question.title, item.points, selectedCategory, question.status);
        }
      }
      
      // Odśwież odpowiedzi po zapisaniu
      await loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`);
      
      setSuccessMessage('Odpowiedzi zostały zapisane');
    } catch (err) {
      console.error('Error saving responses:', err);
      setError('Nie udało się zapisać odpowiedzi');
    } finally {
      setLoading(false);
    }
  };

  // Obsługa usuwania odpowiedzi
  const handleDeleteResponse = async (questionId: string) => {
    if (!userData?.email) {
      toast.error('Musisz być zalogowany, aby usunąć odpowiedź');
      return;
    }
    
    try {
      setLoading(true);
      
      // Znajdź odpowiedź dla tego pytania
      const response = responses.find(r => r.questionId === questionId);
      
      if (!response || !response.id) {
        setError('Nie znaleziono odpowiedzi do usunięcia');
        setLoading(false);
        return;
      }
      
      // Nie można usunąć zatwierdzonych odpowiedzi
      if (response.status === 'approved') {
        setError('Nie można usunąć zatwierdzonych odpowiedzi');
        setLoading(false);
        return;
      }
      
      // Usuń odpowiedź
      await deleteResponse(response.id);
      
      // Odśwież odpowiedzi po usunięciu
      await loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`);
      
      // Zaktualizuj stan pytania
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