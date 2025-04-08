import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Article, UserResponse } from '../../types';

/**
 * Fetches responses for a specific user and category
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
        rejectionReason: data.rejectionReason,
        articles: data.articles || []
      });
    });
    
    return responses;
  } catch (error) {
    console.error('Error fetching user responses:', error);
    throw error;
  }
}

/**
 * Fetches responses for all users with a specific question title
 */
export async function fetchAllUserResponses(questionTitle: string): Promise<UserResponse[]> {
  try {
    const allResponses: UserResponse[] = [];
    const usersSnapshot = await getDocs(collection(db, 'Users'));
    
    for (const userDoc of usersSnapshot.docs) {
      const userEmail = userDoc.id;
      const userData = userDoc.data();
      
      const responsesRef = collection(db, 'Users', userEmail, 'responses');
      const q = query(
        responsesRef,
        where('questionTitle', '==', questionTitle),
        orderBy('createdAt', 'desc')
      );
      
      const responseSnapshot = await getDocs(q);
      
      responseSnapshot.forEach(responseDoc => {
        const responseData = responseDoc.data();
        
        allResponses.push({
          id: responseDoc.id,
          userId: userEmail,
          userName: userData.name || 'Unknown User',
          userEmail: userEmail,
          questionId: responseData.questionId,
          questionTitle: responseData.questionTitle,
          points: responseData.points || 0,
          category: responseData.category,
          status: responseData.status || 'pending',
          articles: responseData.articles || [],
          createdAt: responseData.createdAt?.toDate(),
          updatedAt: responseData.updatedAt?.toDate(),
          verifiedAt: responseData.verifiedAt?.toDate(),
          verifiedBy: responseData.verifiedBy
        });
      });
    }
    
    return allResponses;
  } catch (error) {
    console.error('Error fetching all user responses:', error);
    throw error;
  }
}

/**
 * Saves or updates a user response
 */
export async function saveUserResponse(
  userEmail: string,
  response: Omit<UserResponse, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    // Convert points value - replace commas with dots if it's a string
    let pointsValue = response.points;
    if (typeof pointsValue === 'string') {
      pointsValue = parseFloat(String(pointsValue).replace(',', '.'));
    }
    
    const responsesCollectionRef = collection(db, 'Users', userEmail, 'responses');
    
    const q = query(
      responsesCollectionRef,
      where('questionId', '==', response.questionId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingResponseDoc = querySnapshot.docs[0];
      
      await updateDoc(doc(db, 'Users', userEmail, 'responses', existingResponseDoc.id), {
        ...response,
        points: pointsValue,
        updatedAt: new Date(),
        status: 'pending',
        verifiedBy: null,
        verifiedAt: null,
        rejectionReason: null
      });
      
      return existingResponseDoc.id;
    } else {
      const docRef = await addDoc(responsesCollectionRef, {
        ...response,
        points: pointsValue,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'pending'
      });
      
      return docRef.id;
    }
  } catch (error) {
    console.error('Error saving user response:', error);
    throw error;
  }
}

/**
 * Updates a response with articles and verification
 */
export async function updateResponseWithArticles(
  userEmail: string,
  responseId: string,
  totalPoints: number,
  articles: Article[],
  status: 'pending' | 'approved' | 'rejected',
  verifierEmail: string
): Promise<void> {
  try {
    const responseRef = doc(db, 'Users', userEmail, 'responses', responseId);
    
    await updateDoc(responseRef, {
      points: totalPoints,
      articles: articles,
      status: status,
      verifiedBy: verifierEmail,
      verifiedAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating response with articles:', error);
    throw error;
  }
}

/**
 * Verifies a response (approve or reject)
 */
export async function verifyResponse(
  userEmail: string,
  responseId: string,
  status: 'approved' | 'rejected',
  verifierEmail: string,
  rejectionReason?: string
): Promise<void> {
  try {
    const updateData: Record<string, any> = {
      status: status,
      verifiedBy: verifierEmail,
      verifiedAt: new Date(),
      updatedAt: new Date()
    };
    
    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || null;
    } else {
      updateData.rejectionReason = null;
    }
    
    await updateDoc(doc(db, 'Users', userEmail, 'responses', responseId), updateData);
  } catch (error) {
    console.error('Error verifying response:', error);
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