/**
 * Bazowy serwis do zarządzania odpowiedziami użytkowników w bazie Firestore.
 * Zapewnia operacje CRUD oraz weryfikację odpowiedzi.
 */
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { UserResponse, Question } from '../../../types';

// Eksportujemy UserResponse jako Response dla zachowania kompatybilności wstecznej
export type Response = UserResponse;

export const responseService = {
  async fetchUserResponses(userEmail: string, category?: string): Promise<Response[]> {
    try {
      const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
      
      let q;
      if (category) {
        q = query(
          responsesCollectionRef,
          where('category', '==', category)
        );
      } else {
        q = query(responsesCollectionRef);
      }
      
      const querySnapshot = await getDocs(q);
      const responses: Response[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        responses.push({
          id: doc.id,
          questionId: data.questionId,
          questionTitle: data.questionTitle,
          points: data.points,
          category: data.category,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          status: data.status || 'pending',
          verifiedBy: data.verifiedBy,
          verifiedAt: data.verifiedAt?.toDate(),
          rejectionReason: data.rejectionReason
        });
      });
      
      return responses;
    } catch (err) {
      console.error('Error fetching responses:', err);
      throw err;
    }
  },
  

  async saveUserResponse(userEmail: string, response: Response): Promise<string> {
    try {
      const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
      
      
      const q = query(
        responsesCollectionRef,
        where('questionId', '==', response.questionId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
     
        const existingResponseDoc = querySnapshot.docs[0];
        const existingData = existingResponseDoc.data();
        
      
        if (existingData.status === 'approved') {
          throw new Error('Nie można edytować zatwierdzonych odpowiedzi');
        }
        
        await updateDoc(doc(db, 'Users', userEmail, 'responses', existingResponseDoc.id), {
          points: response.points,
          updatedAt: new Date(),
          status: 'pending',
          verifiedBy: null,
          verifiedAt: null,
          rejectionReason: null
        });
        
        return existingResponseDoc.id;
      } else {
      
        const newResponse = {
          ...response,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'pending'
        };
        
        const docRef = await addDoc(responsesCollectionRef, newResponse);
        return docRef.id;
      }
    } catch (err) {
      console.error('Error saving response:', err);
      throw err;
    }
  },

  async verifyResponse(userEmail: string, responseId: string, verifierEmail: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<boolean> {
    try {
      const updateData: Record<string, any> = {
        status: status,
        verifiedBy: verifierEmail,
        verifiedAt: new Date()
      };
      
      if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason || null;
      } else {
        updateData.rejectionReason = null;
      }
      
      await updateDoc(doc(db, 'Users', userEmail, 'responses', responseId), updateData);
      return true;
    } catch (err) {
      console.error('Error verifying response:', err);
      throw err;
    }
  },
  
  
  async deleteResponse(userEmail: string, responseId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'Users', userEmail, 'responses', responseId));
      return true;
    } catch (err) {
      console.error('Error deleting response:', err);
      throw err;
    }
  },

  async fetchResponsesByQuestion(questionTitle: string): Promise<Response[]> {
    try {
      const allResponses: Response[] = [];
      const usersSnapshot = await getDocs(collection(db, 'Users'));
      
      for (const userDoc of usersSnapshot.docs) {
        const userEmail = userDoc.id;
        const userData = userDoc.data();
        
        const responsesRef = collection(db, 'Users', userEmail, 'responses');
        const q = query(
          responsesRef,
          where('questionTitle', '==', questionTitle)
        );
        
        const responseSnapshot = await getDocs(q);
        
        responseSnapshot.forEach(responseDoc => {
          const responseData = responseDoc.data();
          
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
            createdAt: responseData.createdAt?.toDate(),
            updatedAt: responseData.updatedAt?.toDate(),
            verifiedBy: responseData.verifiedBy,
            verifiedAt: responseData.verifiedAt?.toDate(),
            rejectionReason: responseData.rejectionReason
          });
        });
      }
      
      return allResponses;
    } catch (err) {
      console.error('Error fetching responses by question:', err);
      throw err;
    }
  },
  
  async fetchQuestions(category: string): Promise<Question[]> {
    try {
      const questionsCollectionRef = collection(db, 'Questions');
      
      let q;
      if (category) {
        q = query(
          questionsCollectionRef,
          where('category', '==', category)
        );
      } else {
        q = query(questionsCollectionRef);
      }
      
      const querySnapshot = await getDocs(q);
      const questions: Question[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        questions.push({
          id: doc.id,
          title: data.title,
          points: data.points || 0,
          category: data.category,
          status: data.status,
          tooltip: []
        });
      });
      
      return questions;
    } catch (err) {
      console.error('Error fetching questions:', err);
      throw err;
    }
  },
};