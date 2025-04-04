import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, orderBy, setDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface UserResponse {
  id?: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Saves a user's response to a question
 */
export async function saveUserResponse(userEmail: string, response: UserResponse): Promise<string> {
  try {
    // Create a reference to the user's responses subcollection
    const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
    
    // Check if response for this question already exists
    const q = query(
      responsesCollectionRef,
      where('questionId', '==', response.questionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Convert points value - replace commas with dots if it's a string
    let pointsValue = response.points;
    if (typeof pointsValue === 'string') {
      pointsValue = parseFloat(String(pointsValue).replace(',', '.'));
    }
    
    if (!querySnapshot.empty) {
      // Update existing response
      const existingResponseDoc = querySnapshot.docs[0];
      console.log(pointsValue),
      await updateDoc(doc(db, 'Users', userEmail, 'responses', existingResponseDoc.id), {
        
        points: pointsValue,
        updatedAt: new Date()
      });
      return existingResponseDoc.id;
    } else {
      // Add new response
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

/**
 * Fetches all responses for a user
 */
export async function fetchUserResponses(userEmail: string, category?: string): Promise<UserResponse[]> {
  try {
    const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
    
    let q;
    if (category) {
      q = query(
        responsesCollectionRef,
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(
        responsesCollectionRef,
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const responses: UserResponse[] = [];
    
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

/**
 * Deletes a user response
 */
export async function deleteUserResponse(userEmail: string, responseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'Users', userEmail, 'responses', responseId));
  } catch (error) {
    console.error('Error deleting user response:', error);
    throw error;
  }
}