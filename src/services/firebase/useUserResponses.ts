import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, getDoc,  } from 'firebase/firestore';
import { db } from '../../../firebase';

export interface UserResponse {
  id?: string;
  questionId: string;
  questionTitle: string;
  points: number;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'pending' | 'approved' | 'rejected'; // New status field
  verifiedBy?: string; // Track who verified the response
  verifiedAt?: Date; // When it was verified
  rejectionReason?: string | null; // Optional reason for rejection - add null to the type
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
      // Check if this is a refresh request (category contains '?refresh=')
      const isRefreshRequest = category && category.includes('?refresh=');
      
      // Extract the actual category name if it's a refresh request
      const actualCategory = isRefreshRequest 
        ? category.split('?')[0] 
        : category;
      
      // Prevent duplicate fetches for the same category (unless it's a refresh request)
      if (!isRefreshRequest && actualCategory && loadingRef.current[actualCategory]) {
        console.log(`Using in-progress fetch for category: ${actualCategory}`);
        return responsesByCategory[actualCategory] || [];
      }
      
      // Use cache only if it's not a refresh request
      if (!isRefreshRequest && actualCategory && responsesByCategory[actualCategory] && responsesByCategory[actualCategory].length > 0) {
        console.log(`Using cached responses for category: ${actualCategory}, count: ${responsesByCategory[actualCategory].length}`);
        setResponses(responsesByCategory[actualCategory]);
        return responsesByCategory[actualCategory];
      }

      // Mark this category as loading
      if (actualCategory) {
        loadingRef.current[actualCategory] = true;
      }
      
      setLoading(true);
      setError(null);
      
      const userEmail = userData.email;
      const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
      
      let q;
      if (actualCategory) {
        // Fix: Use only where clause without orderBy which might cause issues
        q = query(
          responsesCollectionRef,
          where('category', '==', actualCategory)
        );
      } else {
        // Fix: Remove orderBy to avoid potential index issues
        q = query(responsesCollectionRef);
      }
      
      const querySnapshot = await getDocs(q);
      const fetchedResponses: UserResponse[] = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Fix: Handle potential missing or invalid date fields
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
      
      // Fix: Sort responses by createdAt date if available (client-side sorting)
      const sortedResponses = fetchedResponses.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      setResponses(sortedResponses);
      
      // Update cache with fresh data
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
      // Mark this category as no longer loading
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

  // Save a user response
  const saveResponse = async (questionId: string, questionTitle: string, points: number, category: string, questionStatus?: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return null;
    }
  
    // Prevent saving if the question is already approved
    if (questionStatus === 'approved') {
      setError('Nie można edytować zatwierdzonych odpowiedzi');
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
        const existingData = existingResponseDoc.data();
        
        // Check if the existing response is approved
        if (existingData.status === 'approved') {
          setError('Nie można edytować zatwierdzonych odpowiedzi');
          return null;
        }
        
        // Update existing response
        await updateDoc(doc(db, 'Users', userEmail, 'responses', existingResponseDoc.id), {
          points: points,
          updatedAt: new Date(),
          status: 'pending', // Reset status to pending when updated
          verifiedBy: null,
          verifiedAt: null,
          rejectionReason: null
        });
        responseId = existingResponseDoc.id;
      } else {
        // Add new response
        const response: UserResponse = {
          questionId,
          questionTitle,
          points,
          category,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'pending' // Set initial status to pending
        };
        
        const docRef = await addDoc(responsesCollectionRef, response);
        responseId = docRef.id;
      }
      
      // Force refresh responses for this category to update the cache
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

  // Delete a user response
  const deleteResponse = async (responseId: string) => {
    if (!userData?.email) {
      setError('User not authenticated');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userEmail = userData.email;
      
      // Get the response before deleting to know which category to refresh
      const responseDoc = await getDoc(doc(db, 'Users', userEmail, 'responses', responseId));
      
      if (!responseDoc.exists()) {
        setError('Response not found');
        return false;
      }
      
      const responseData = responseDoc.data();
      const category = responseData.category;
      
      await deleteDoc(doc(db, 'Users', userEmail, 'responses', responseId));
      
      // Update local state
      setResponses(prev => prev.filter(r => r.id !== responseId));
      
      // Force refresh responses for this category to update the cache
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

  // Verify a user response (approve or reject)
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
      
      // Create update object with proper types
      const updateData: Record<string, any> = {
        status: status,
        verifiedBy: verifierEmail,
        verifiedAt: new Date()
      };
      
      // Only add rejectionReason for rejected status and ensure it's null instead of undefined
      if (status === 'rejected') {
        updateData.rejectionReason = rejectionReason || null; // Use null instead of undefined
      } else {
        updateData.rejectionReason = null; // Always use null instead of undefined
      }
      
      await updateDoc(doc(db, 'Users', userEmail, 'responses', responseId), updateData);
      
      // If we're viewing this user's responses, update the local state
      if (responses.some(r => r.id === responseId)) {
        setResponses(prev => prev.map(r => {
          if (r.id === responseId) {
            // Create a properly typed object
            const updatedResponse: UserResponse = {
              ...r,
              status,
              verifiedBy: verifierEmail,
              verifiedAt: new Date(),
              // Use null instead of undefined
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
  
  // Include the new function in the return value
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