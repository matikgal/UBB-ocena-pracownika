import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Article } from '../../types';

export async function getArticlesByAuthor(authorName: string): Promise<Article[]> {
  try {
    const articlesRef = collection(db, 'Articles');
    const articlesSnapshot = await getDocs(articlesRef);
    
   
    const nameParts = authorName.toLowerCase().split(' ').filter(part => part.length > 1);
    
  
    const authorArticles = articlesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Article))
      .filter(article => {
        if (!article.authors || !Array.isArray(article.authors)) {
          return false;
        }
        
       
        return article.authors.some(author => {
          const authorLower = author.toLowerCase();
      
          return nameParts.every(part => authorLower.includes(part));
        });
      });
    
    return authorArticles;
  } catch (error) {
    console.error('Error fetching articles by author:', error);
    return [];
  }
}