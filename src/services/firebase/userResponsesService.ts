import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

// Interfejs definiujący strukturę odpowiedzi użytkownika
export interface UserResponse {
  id?: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function saveUserResponse(userEmail: string, response: UserResponse): Promise<string> {
  try {
    // Utworzenie referencji do podkolekcji odpowiedzi użytkownika
    const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
    
    // Sprawdzenie czy odpowiedź na to pytanie już istnieje
    const q = query(
      responsesCollectionRef,
      where('questionId', '==', response.questionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Konwersja wartości punktów - zamiana przecinków na kropki jeśli to string
    let pointsValue = response.points;
    if (typeof pointsValue === 'string') {
      pointsValue = parseFloat(String(pointsValue).replace(',', '.'));
    }
    
    if (!querySnapshot.empty) {
      // Aktualizacja istniejącej odpowiedzi
      const existingResponseDoc = querySnapshot.docs[0];
      console.log(pointsValue),
      await updateDoc(doc(db, 'Users', userEmail, 'responses', existingResponseDoc.id), {
        
        points: pointsValue,
        updatedAt: new Date()
      });
      return existingResponseDoc.id;
    } else {
      // Dodanie nowej odpowiedzi
      const docRef = await addDoc(responsesCollectionRef, {
        ...response,
        points: pointsValue,
        createdAt: new Date()
      });
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving user response:', error);
    throw error;
  }
}

export async function fetchUserResponses(userEmail: string, category?: string): Promise<UserResponse[]> {
  try {
    // Referencja do kolekcji odpowiedzi użytkownika
    const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
    
    let q;
    if (category) {
      // Zapytanie filtrujące odpowiedzi według kategorii
      q = query(
        responsesCollectionRef,
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Zapytanie pobierające wszystkie odpowiedzi użytkownika
      q = query(
        responsesCollectionRef,
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const responses: UserResponse[] = [];
    
    // Przetwarzanie wyników zapytania
    querySnapshot.forEach((doc) => {
      responses.push({
        id: doc.id,
        ...doc.data()
      } as UserResponse);
    });
    
    return responses;
  } catch (error) {
    console.error('Error fetching user responses:', error);
    throw error;
  }
}

export async function deleteUserResponse(userEmail: string, responseId: string): Promise<void> {
  try {
    // Usunięcie odpowiedzi użytkownika z bazy danych
    await deleteDoc(doc(db, 'Users', userEmail, 'responses', responseId));
  } catch (error) {
    console.error('Error deleting user response:', error);
    throw error;
  }
}