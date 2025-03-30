import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

interface Question {
  id: string;
  title: string;
  points: number | string;
  tooltip: string[];
  categoryId: string;
}

export function useFirestoreQuestions(categoryTitle: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        
        // Query questions by category title
        const q = query(
          collection(db, 'questions'),
          where('categoryId', '==', categoryTitle),
          orderBy('createdAt', 'asc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedQuestions: Question[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedQuestions.push({
            id: doc.id,
            ...doc.data()
          } as Question);
        });
        
        setQuestions(fetchedQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [categoryTitle]);

  return { questions, loading, error };
}