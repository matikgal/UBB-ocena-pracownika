import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, setDoc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';

// Interfejs definiujący strukturę odpowiedzi użytkownika z dodatkowymi polami do weryfikacji
export interface UserResponse {
  id?: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'pending' | 'approved' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string | null;
}

export function useUserResponses() {
  // Pobieranie danych użytkownika z kontekstu uwierzytelniania
  const { userData } = useAuth();
  // Inicjalizacja stanów
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [responsesByCategory, setResponsesByCategory] = useState<Record<string, UserResponse[]>>({});
  // Referencja do śledzenia, czy odpowiedzi są już ładowane
  const loadingRef = useRef<Record<string, boolean>>({});

  // Funkcja pobierająca odpowiedzi użytkownika z mechanizmem buforowania
  const loadResponses = async (category?: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return [];
    }
  
    try {
      // Sprawdzenie czy to żądanie odświeżenia (kategoria zawiera '?refresh=')
      const isRefreshRequest = category && category.includes('?refresh=');
      
      // Wyodrębnienie właściwej nazwy kategorii jeśli to żądanie odświeżenia
      const actualCategory = isRefreshRequest 
        ? category.split('?')[0] 
        : category;
      
      // Zapobieganie duplikatom zapytań dla tej samej kategorii (chyba że to odświeżenie)
      if (!isRefreshRequest && actualCategory && loadingRef.current[actualCategory]) {
        console.log(`Using in-progress fetch for category: ${actualCategory}`);
        return responsesByCategory[actualCategory] || [];
      }
      
      // Użycie bufora tylko jeśli to nie jest żądanie odświeżenia
      if (!isRefreshRequest && actualCategory && responsesByCategory[actualCategory] && responsesByCategory[actualCategory].length > 0) {
        console.log(`Using cached responses for category: ${actualCategory}, count: ${responsesByCategory[actualCategory].length}`);
        setResponses(responsesByCategory[actualCategory]);
        return responsesByCategory[actualCategory];
      }

      // Oznaczenie tej kategorii jako ładowanej
      if (actualCategory) {
        loadingRef.current[actualCategory] = true;
      }
      
      setLoading(true);
      setError(null);
      
      const userEmail = userData.email;
      const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
      
      let q;
      if (actualCategory) {
        // Zapytanie tylko z klauzulą where, bez orderBy które może powodować problemy
        q = query(
          responsesCollectionRef,
          where('category', '==', actualCategory)
        );
      } else {
        // Zapytanie bez orderBy, aby uniknąć potencjalnych problemów z indeksami
        q = query(responsesCollectionRef);
      }
      
      const querySnapshot = await getDocs(q);
      const fetchedResponses: UserResponse[] = [];
  
      // Przetwarzanie wyników zapytania
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Obsługa potencjalnie brakujących lub nieprawidłowych pól daty
        const createdAt = data.createdAt ? 
          (data.createdAt instanceof Date ? data.createdAt : data.createdAt.toDate()) : 
          undefined;
        const updatedAt = data.updatedAt ? 
          (data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt.toDate()) : 
          undefined;
        const verifiedAt = data.verifiedAt ? 
          (data.verifiedAt instanceof Date ? data.verifiedAt : data.verifiedAt.toDate()) : 
          undefined;
          
        fetchedResponses.push({
          id: doc.id,
          questionId: data.questionId,
          questionTitle: data.questionTitle,
          points: data.points,
          category: data.category,
          createdAt: createdAt,
          updatedAt: updatedAt,
          status: data.status || 'pending',
          verifiedBy: data.verifiedBy,
          verifiedAt: verifiedAt,
          rejectionReason: data.rejectionReason
        } as UserResponse);
      });
      
      console.log(`Fetched ${fetchedResponses.length} responses for category: ${actualCategory || 'all'}`);
      
      // Sortowanie odpowiedzi według daty utworzenia (sortowanie po stronie klienta)
      const sortedResponses = fetchedResponses.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      setResponses(sortedResponses);
      
      // Aktualizacja bufora świeżymi danymi
      if (actualCategory) {
        setResponsesByCategory(prev => ({
          ...prev,
          [actualCategory]: sortedResponses
        }));
      }
      
      return sortedResponses;
    } catch (err) {
      console.error('Error loading responses:', err);
      setError('Nie udało się pobrać odpowiedzi');
      return [];
    } finally {
      setLoading(false);
      // Oznaczenie tej kategorii jako już nie ładowanej
      if (category) {
        const actualCategory = category && category.includes('?refresh=') 
          ? category.split('?')[0] 
          : category;
        if (actualCategory) {
          loadingRef.current[actualCategory] = false;
        }
      }
    }
  };

  // Funkcja zapisująca odpowiedź użytkownika
  const saveResponse = async (questionId: string, questionTitle: string, points: number, category: string, questionStatus?: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return null;
    }
  
    // Zapobieganie zapisowi jeśli pytanie jest już zatwierdzone
    if (questionStatus === 'approved') {
      setError('Nie można edytować zatwierdzonych odpowiedzi');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userEmail = userData.email;
      const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
      
      // Sprawdzenie czy odpowiedź na to pytanie już istnieje
      const q = query(
        responsesCollectionRef,
        where('questionId', '==', questionId)
      );
      
      const querySnapshot = await getDocs(q);
      
      let responseId: string;
      
      if (!querySnapshot.empty) {
        // Aktualizacja istniejącej odpowiedzi
        const existingResponseDoc = querySnapshot.docs[0];
        const existingData = existingResponseDoc.data();
        
        // Sprawdzenie czy istniejąca odpowiedź jest zatwierdzona
        if (existingData.status === 'approved') {
          setError('Nie można edytować zatwierdzonych odpowiedzi');
          return null;
        }
        
        // Aktualizacja istniejącej odpowiedzi
        await updateDoc(doc(db, 'Users', userEmail, 'responses', existingResponseDoc.id), {
          points: points,
          updatedAt: new Date(),
          status: 'pending', // Resetowanie statusu do "oczekujące" po aktualizacji
          verifiedBy: null,
          verifiedAt: null,
          rejectionReason: null
        });
        responseId = existingResponseDoc.id;
      } else {
        // Dodanie nowej odpowiedzi
        const response: UserResponse = {
          questionId,
          questionTitle,
          points,
          category,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'pending' // Ustawienie początkowego statusu na "oczekujące"
        };
        
        const docRef = await addDoc(responsesCollectionRef, response);
        responseId = docRef.id;
      }
      
      // Wymuszenie odświeżenia odpowiedzi dla tej kategorii, aby zaktualizować bufor
      await loadResponses(`${category}?refresh=${new Date().getTime()}`);
      
      return responseId;
    } catch (err) {
      console.error('Error saving response:', err);
      setError('Nie udało się zapisać odpowiedzi');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Funkcja usuwająca odpowiedź użytkownika
  const deleteResponse = async (responseId: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userEmail = userData.email;
      
      // Pobranie odpowiedzi przed usunięciem, aby wiedzieć którą kategorię odświeżyć
      const responseDoc = await getDoc(doc(db, 'Users', userEmail, 'responses', responseId));
      
      if (!responseDoc.exists()) {
        setError('Response not found');
        return false;
      }
      
      const responseData = responseDoc.data();
      const category = responseData.category;
      
      // Usunięcie odpowiedzi z bazy danych
      await deleteDoc(doc(db, 'Users', userEmail, 'responses', responseId));
      
      // Aktualizacja stanu lokalnego
      setResponses(prev => prev.filter(r => r.id !== responseId));
      
      // Wymuszenie odświeżenia odpowiedzi dla tej kategorii, aby zaktualizować bufor
      if (category) {
        await loadResponses(`${category}?refresh=${new Date().getTime()}`);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting response:', err);
      setError('Nie udało się usunąć odpowiedzi');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funkcja weryfikująca odpowiedź użytkownika (zatwierdzenie lub odrzucenie)
  const verifyResponse = async (
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
      
      const verifierEmail = userData.email;
      
      // Utworzenie obiektu aktualizacji z odpowiednimi typami
      const updateData: Record<string, any> = {
        status: status,
        verifiedBy: verifierEmail,
        verifiedAt: new Date()
      };
      
      // Dodanie powodu odrzucenia tylko dla statusu "odrzucone" i upewnienie się, że to null zamiast undefined
      if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason || null;
      } else {
        updateData.rejectionReason = null;
      }
      
      // Aktualizacja dokumentu w bazie danych
      await updateDoc(doc(db, 'Users', userEmail, 'responses', responseId), updateData);
      
      // Jeśli przeglądamy odpowiedzi tego użytkownika, aktualizujemy stan lokalny
      if (responses.some(r => r.id === responseId)) {
        setResponses(prev => prev.map(r => {
          if (r.id === responseId) {
            // Utworzenie obiektu z odpowiednimi typami
            const updatedResponse: UserResponse = {
              ...r,
              status,
              verifiedBy: verifierEmail,
              verifiedAt: new Date(),
              rejectionReason: status === 'rejected' ? (rejectionReason || null) : null
            };
            return updatedResponse;
          }
          return r;
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error verifying response:', err);
      setError('Nie udało się zweryfikować odpowiedzi');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Zwracanie funkcji i stanów do użycia w komponentach
  return {
    responses,
    loading,
    error,
    saveResponse,
    loadResponses,
    deleteResponse,
    verifyResponse
  };
}