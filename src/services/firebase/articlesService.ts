import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { Article } from '../../types';

export async function getArticlesByAuthor(authorName: string): Promise<Article[]> {
  try {
    const articlesRef = collection(db, 'Articles');
    const articlesSnapshot = await getDocs(articlesRef);
    
    // Filter articles where the author name is in the authors array
    const authorArticles = articlesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Article))
      .filter(article => 
        article.authors && 
        article.authors.some(author => 
          author.toLowerCase().includes(authorName.toLowerCase())
        )
      );
    
    return authorArticles;
  } catch (error) {
    console.error('Error fetching articles by author:', error);
    return [];
  }
}