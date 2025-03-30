import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export interface UserResponse {
  id?: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useUserResponses() {
  const { userData } = useAuth();
  const [responses, setResponses] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [responsesByCategory, setResponsesByCategory] = useState<Record<string, UserResponse[]>>({});
  // Add a ref to track if responses are already being loaded
  const loadingRef = useRef<Record<string, boolean>>({});

  // Fetch user responses with caching
  const loadResponses = async (category?: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return [];
    }
  
    try {
      // Prevent duplicate fetches for the same category
      if (category && loadingRef.current[category]) {
        return responsesByCategory[category] || [];
      }
      
      // Check if we already have responses for this category cached
      if (category && responsesByCategory[category] && responsesByCategory[category].length > 0) {
        setResponses(responsesByCategory[category]);
        return responsesByCategory[category];
      }

      // Mark this category as loading
      if (category) {
        loadingRef.current[category] = true;
      }
      
      setLoading(true);
      setError(null);
      
      const userEmail = userData.email;
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
      const fetchedResponses: UserResponse[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedResponses.push({
          id: doc.id,
          questionId: data.questionId,
          questionTitle: data.questionTitle,
          points: data.points,
          category: data.category,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as UserResponse);
      });
      
      setResponses(fetchedResponses);
      
      // Update cache
      if (category) {
        setResponsesByCategory(prev => ({
          ...prev,
          [category]: fetchedResponses
        }));
      }
      
      return fetchedResponses;
    } catch (err) {
      console.error('Error loading responses:', err);
      setError('Nie udało się pobrać odpowiedzi');
      return [];
    } finally {
      setLoading(false);
      // Mark this category as no longer loading
      if (category) {
        loadingRef.current[category] = false;
      }
    }
  };

  // Save a user response
  const saveResponse = async (questionId: string, questionTitle: string, points: number, category: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userEmail = userData.email;
      const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
      
      // Check if response for this question already exists
      const q = query(
        responsesCollectionRef,
        where('questionId', '==', questionId)
      );
      
      const querySnapshot = await getDocs(q);
      
      let responseId: string;
      
      if (!querySnapshot.empty) {
        // Update existing response
        const existingResponseDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'Users', userEmail, 'responses', existingResponseDoc.id), {
          points: points,
          updatedAt: new Date()
        });
        responseId = existingResponseDoc.id;
      } else {
        // Add new response
        const response: UserResponse = {
          questionId,
          questionTitle,
          points,
          category,
          createdAt: new Date()
        };
        
        const docRef = await addDoc(responsesCollectionRef, response);
        responseId = docRef.id;
      }
      
      // Update local state by reloading responses for this category
      await loadResponses(category);
      
      return responseId;
    } catch (err) {
      console.error('Error saving response:', err);
      setError('Nie udało się zapisać odpowiedzi');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a user response
  const deleteResponse = async (responseId: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      await deleteDoc(doc(db, 'Users', userData.email, 'responses', responseId));
      
      // Update local state
      setResponses(prev => prev.filter(r => r.id !== responseId));
      return true;
    } catch (err) {
      console.error('Error deleting response:', err);
      setError('Nie udało się usunąć odpowiedzi');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    responses,
    loading,
    error,
    saveResponse,
    loadResponses,
    deleteResponse
  };
}