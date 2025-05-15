/**
 * Serwis do zarządzania artykułami naukowymi w bazie Firestore.
 * Umożliwia dodawanie i wyszukiwanie artykułów z indeksowaniem autorów.
 */
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../../firebase'
import { Article } from '../../../types'

export async function getArticlesByAuthor(authorName: string): Promise<Article[]> {
	try {
		if (!authorName || authorName.trim() === '') {
			return []
		}

		const nameParts = authorName.trim().split(' ')

	
		if (nameParts.length < 2) {
			return []
		}
		
		const reorderedName = `${nameParts.slice(-1)[0]} ${nameParts.slice(0, -1).join(' ')}`

	
		const articlesRef = collection(db, 'Articles')
		const exactMatchQuery = query(articlesRef, where('authors', 'array-contains', reorderedName))

		const articlesSnapshot = await getDocs(exactMatchQuery)
		const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))

		return articles
	} catch (error) {
		console.error('Error fetching articles by author:', error)
		return []
	}
}

export async function addArticleWithIndexing(article: Article): Promise<string> {
	try {

		const authorSearchTerms: string[] = []

		if (article.authors && Array.isArray(article.authors)) {
		
			article.authors.forEach(author => {
				authorSearchTerms.push(author.toLowerCase())

			
				const parts = author
					.toLowerCase()
					.split(' ')
					.filter(part => part.length > 1)
				authorSearchTerms.push(...parts)
			})
		}

	
		const articlesRef = collection(db, 'Articles')
		const articleWithSearchTerms = {
			...article,
			authorSearchTerms: [...new Set(authorSearchTerms)], 
			createdAt: new Date(),
		}

		const docRef = await addDoc(articlesRef, articleWithSearchTerms)
		return docRef.id
	} catch (error) {
		console.error('Error adding article with indexing:', error)
		throw error
	}
}
