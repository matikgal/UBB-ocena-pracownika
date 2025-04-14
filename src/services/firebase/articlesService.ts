import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../firebase'
import { Article } from '../../types'

export async function getArticlesByAuthor(authorName: string): Promise<Article[]> {
	try {
		if (!authorName || authorName.trim() === '') {
			return []
		}

		// Create search terms for the author (full name and individual parts)
		const authorNameLower = authorName.toLowerCase().trim()
		const nameParts = authorNameLower.split(' ').filter(part => part.length > 1)

		// Try exact match first using the authors array
		const articlesRef = collection(db, 'Articles')
		const exactMatchQuery = query(articlesRef, where('authors', 'array-contains', authorName))

		const articlesSnapshot = await getDocs(exactMatchQuery)
		let articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article))

	
		if (articles.length === 0) {
			
			const allArticlesSnapshot = await getDocs(articlesRef)

			articles = allArticlesSnapshot.docs
				.map(doc => ({ id: doc.id, ...doc.data() } as Article))
				.filter(article => {
					if (!article.authors || !Array.isArray(article.authors)) {
						return false
					}

					return article.authors.some(author => {
						const authorLower = author.toLowerCase()
						return nameParts.every(part => authorLower.includes(part))
					})
				})
		}

	

		return articles
	} catch (error) {
		console.error('Error fetching articles by author:', error)
		return []
	}
}

// Add a function to add articles with proper indexing
export async function addArticleWithIndexing(article: Article): Promise<string> {
	try {
		// Create searchable terms from authors
		const authorSearchTerms: string[] = []

		if (article.authors && Array.isArray(article.authors)) {
			// Add full author names in lowercase
			article.authors.forEach(author => {
				authorSearchTerms.push(author.toLowerCase())

				// Add individual name parts for partial matching
				const parts = author
					.toLowerCase()
					.split(' ')
					.filter(part => part.length > 1)
				authorSearchTerms.push(...parts)
			})
		}

		// Add the article with search terms
		const articlesRef = collection(db, 'Articles')
		const articleWithSearchTerms = {
			...article,
			authorSearchTerms: [...new Set(authorSearchTerms)], // Remove duplicates
			createdAt: new Date(),
		}

		const docRef = await addDoc(articlesRef, articleWithSearchTerms)
		return docRef.id
	} catch (error) {
		console.error('Error adding article with indexing:', error)
		throw error
	}
}
