/**
 * Hook do zarządzania odpowiedziami użytkowników.
 * Obsługuje pobieranie, zapisywanie, usuwanie i weryfikację odpowiedzi.
 */
import { useState, useCallback, useRef } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from 'sonner';
import { responseService, Response } from "./responseService";
import { Article } from "../../../types";

export type UserResponse = Response;

export function useResponses() {
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { userData } = useAuth();
  const loadingRef = useRef<Record<string, boolean>>({});

  // Funkcja do ładowania odpowiedzi użytkownika
  const loadResponses = useCallback(async (category?: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return [];
    }
  
    try {
      const isRefreshRequest = category && category.includes('?refresh=');
      const actualCategory = isRefreshRequest ? category.split('?')[0] : category;
      
      if (!isRefreshRequest && actualCategory && loadingRef.current[actualCategory]) {
        console.log(`Używanie trwającego zapytania dla kategorii: ${actualCategory}`);
        return [];
      }
      
      if (actualCategory) {
        loadingRef.current[actualCategory] = true;
      }
      
      setLoading(true);
      setError(null);
      
      const fetchedResponses = await responseService.fetchUserResponses(userData.email, actualCategory);
      setResponses(fetchedResponses);
      
      return fetchedResponses;
    } catch (err) {
      console.error('Error loading responses:', err);
      setError('Nie udało się pobrać odpowiedzi');
      return [];
    } finally {
      setLoading(false);
      
      if (category) {
        const actualCategory = category.includes('?refresh=') ? category.split('?')[0] : category;
        if (actualCategory) {
          loadingRef.current[actualCategory] = false;
        }
      }
    }
  }, [userData?.email]);

  // Funkcja do ładowania odpowiedzi według pytania
  const fetchResponsesByQuestion = useCallback(async (questionTitle: string = 'Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)') => {
    try {
      setLoading(true);
      setError(null);
      
      const allResponses = await responseService.fetchResponsesByQuestion(questionTitle);
      setResponses(allResponses);
      return allResponses;
    } catch (err) {
      console.error('Error fetching responses:', err);
      setError('Failed to fetch responses');
      toast.error('Nie udało się pobrać odpowiedzi');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Funkcja do zapisywania odpowiedzi użytkownika
  const saveResponse = async (questionId: string, questionTitle: string, points: number, category: string, questionStatus?: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return null;
    }
  
    if (questionStatus === 'approved') {
      setError('Nie można edytować zatwierdzonych odpowiedzi');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response: UserResponse = {
        questionId,
        questionTitle,
        points,
        category,
        status: 'pending' 
      };
      
      const responseId = await responseService.saveUserResponse(userData.email, response);
      response.id = responseId;
      
      return responseId;
    } catch (err) {
      console.error('Error saving response:', err);
      setError('Nie udało się zapisać odpowiedzi');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do usuwania odpowiedzi
  const deleteResponse = useCallback(async (responseId: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await responseService.deleteResponse(userData.email, responseId);
      
      // Aktualizuj lokalny stan
      setResponses(prev => prev.filter(r => r.id !== responseId));
      
      return true;
    } catch (err) {
      console.error('Error deleting response:', err);
      setError('Nie udało się usunąć odpowiedzi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userData?.email]);

  // Funkcja do usuwania odpowiedzi innego użytkownika (dla administratora)
  const deleteUserResponse = useCallback(async (userEmail: string, responseId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await responseService.deleteResponse(userEmail, responseId);
      
      // Aktualizuj lokalny stan
      setResponses(prev => prev.filter(r => !(r.id === responseId && r.userEmail === userEmail)));
      toast.success('Odpowiedź została usunięta');
      setSuccessMessage('Odpowiedź została usunięta');
      
      return true;
    } catch (err) {
      console.error('Error deleting response:', err);
      setError('Nie udało się usunąć odpowiedzi');
      toast.error('Nie udało się usunąć odpowiedzi');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Funkcja do weryfikacji odpowiedzi
  const verifyResponse = useCallback(async (
    userEmail: string, 
    responseId: string, 
    status: 'approved' | 'rejected', 
    rejectionReason?: string
  ) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return false;
    }
  
    try {
      setLoading(true);
      setError(null);
    
      await responseService.verifyResponse(userEmail, responseId, userData.email, status, rejectionReason);
      
      // Aktualizuj lokalny stan
      setResponses(prev => prev.map(r => {
        if (r.id === responseId && r.userEmail === userEmail) {
          return {
            ...r,
            status,
            verifiedBy: userData.email,
            verifiedAt: new Date(),
            rejectionReason: status === 'rejected' ? (rejectionReason || null) : null,
            updatedAt: new Date()
          };
        }
        return r;
      }));
      
      toast.success(status === 'approved' ? 'Odpowiedź została zatwierdzona' : 'Odpowiedź została odrzucona');
      setSuccessMessage(status === 'approved' ? 'Odpowiedź została zatwierdzona' : 'Odpowiedź została odrzucona');
      
      return true;
    } catch (err) {
      console.error('Error verifying response:', err);
      setError('Nie udało się zweryfikować odpowiedzi');
      toast.error('Nie udało się zweryfikować odpowiedzi');
      return false;
    } finally {
      setLoading(false);
    }
  }, [userData?.email]);

  // Funkcje pomocnicze dla administratora
  const approveResponse = useCallback((userEmail: string, responseId: string) => 
    verifyResponse(userEmail, responseId, 'approved'), [verifyResponse]);
    
  const rejectResponse = useCallback((userEmail: string, responseId: string, rejectionReason: string) => 
    verifyResponse(userEmail, responseId, 'rejected', rejectionReason), [verifyResponse]);

  // Funkcje do zarządzania artykułami
  const addArticleToResponse = useCallback(async (responseId: string, userEmail: string, article: Article) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = responses.find(r => r.id === responseId && r.userEmail === userEmail);
      
      if (!response) {
        throw new Error('Response not found');
      }
      
      const updatedArticles = [...(response.articles || []), article];
      
      await responseService.saveUserResponse(userEmail, {
        ...response,
        articles: updatedArticles
      });
      
      // Aktualizuj lokalny stan
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
      );
      
      toast.success('Artykuł został dodany');
      setSuccessMessage('Artykuł został dodany');
      return true;
    } catch (err) {
      console.error('Error adding article:', err);
      setError('Nie udało się dodać artykułu');
      toast.error('Nie udało się dodać artykułu');
      return false;
    } finally {
      setLoading(false);
    }
  }, [responses]);

  const removeArticleFromResponse = useCallback(async (responseId: string, userEmail: string, articleIndex: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = responses.find(r => r.id === responseId && r.userEmail === userEmail);
      
      if (!response || !response.articles) {
        throw new Error('Response or articles not found');
      }
      
      const updatedArticles = [...response.articles];
      updatedArticles.splice(articleIndex, 1);
      
      await responseService.saveUserResponse(userEmail, {
        ...response,
        articles: updatedArticles
      });
      
      // Aktualizuj lokalny stan
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
      );
      
      toast.success('Artykuł został usunięty');
      setSuccessMessage('Artykuł został usunięty');
      return true;
    } catch (err) {
      console.error('Error removing article:', err);
      setError('Nie udało się usunąć artykułu');
      toast.error('Nie udało się usunąć artykułu');
      return false;
    } finally {
      setLoading(false);
    }
  }, [responses]);

  return {
    responses,
    loading,
    error,
    successMessage,
    // Funkcje dla użytkownika
    loadResponses,
    saveResponse,
    deleteResponse,
    // Funkcje dla administratora
    fetchResponses: fetchResponsesByQuestion,
    approveResponse,
    rejectResponse,
    deleteUserResponse,
    addArticleToResponse,
    removeArticleFromResponse,
    verifyResponse
  };
}