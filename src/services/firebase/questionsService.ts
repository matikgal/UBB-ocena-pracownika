import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Question } from '../../types';

// Pobiera pytania dla danej kategorii
export async function fetchQuestionsByCategory(categoryName: string): Promise<Question[]> {
  try {
    const q = query(
      collection(db, 'Questions'),
      where('category', '==', categoryName)
    );
    
    const querySnapshot = await getDocs(q);
    const questions: Question[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Konwersja tooltip na tablicę, jeśli to string
      const tooltip = typeof data.tooltip === 'string' 
        ? data.tooltip.split(',') 
        : (Array.isArray(data.tooltip) ? data.tooltip : []);
      
      // Sprawdzenie czy to pytanie oceniane przez bibliotekę
      const isLibraryEvaluated = 
        data.title === "Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)" ||
        data.isLibraryEvaluated === true;
      
      questions.push({
        id: doc.id,
        title: data.title,
        points: data.points,
        tooltip: tooltip,
        category: data.category,
        status: data.status,
        isLibraryEvaluated: isLibraryEvaluated
      });
    });
    
    return questions;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

// Dodaje nowe pytanie do bazy danych
export async function addQuestion(question: Omit<Question, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'Questions'), {
      ...question,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding question:', error);
    throw error;
  }
}

// Aktualizuje istniejące pytanie
export async function updateQuestion(id: string, question: Partial<Question>): Promise<void> {
  try {
    await updateDoc(doc(db, 'Questions', id), {
      ...question,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
}

// Usuwa pytanie z bazy danych
export async function deleteQuestion(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'Questions', id));
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
}