import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { X, ExternalLink, Plus, Check, Trash2 } from 'lucide-react'
import { usePagination } from '../../hooks/usePagination'
import { Article } from '../../types/index'
import { getArticlesByAuthor } from '../../services/firebase/articles/articlesService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card'
import { Badge } from '../ui/badge'

import { useResponses } from '../../services/firebase/responses/useResponses'
import { toast } from '../common/Toast'

interface LibraryEvaluationComponentProps {
	onClose?: () => void
}

export default function LibraryEvaluationComponent({ onClose }: LibraryEvaluationComponentProps) {
	const [articles, setArticles] = useState<Article[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [addingArticle, setAddingArticle] = useState<Record<string, boolean>>({})
	const [deletingArticle, setDeletingArticle] = useState<Record<string, boolean>>({})

	const { userData } = useAuth()
	const { loadResponses, saveResponse, deleteResponse } = useResponses()


	useEffect(() => {
		const fetchArticles = async () => {
			try {
				setLoading(true)
				setError(null)

				if (userData?.name) {
					const authorName = userData.name.trim()
					if (authorName) {
					
						const fetchedArticles = await getArticlesByAuthor(authorName)
						setArticles(fetchedArticles)
					} else {
						setArticles([])
					}
				} else {
					setArticles([])
				}
			} catch (err) {
				console.error('Error fetching articles:', err)
				setError('Nie udało się pobrać artykułów')
			} finally {
				setLoading(false)
			}
		}

		fetchArticles()
	}, [userData?.name])

	
	const { currentPage, setCurrentPage, currentItems, totalPages } = usePagination(articles, 10)


	const [userResponses, setUserResponses] = useState<any[]>([])


	useEffect(() => {
		const fetchUserResponses = async () => {
			if (!userData?.email) return

			try {
				const responses = await loadResponses('Artykuły naukowe')
				setUserResponses(responses)
			} catch (err) {
				console.error('Error loading user responses:', err)
			}
		}

		fetchUserResponses()
	}, [userData?.email]) 


	const getCardStyle = (article: Article) => {
	
		const response = userResponses.find(
			resp => resp.questionTitle && resp.questionTitle.toLowerCase() === article.title.toLowerCase()
		)

		if (response && response.status) {
			switch (response.status) {
				case 'approved':
					return 'border-green-500 bg-green-50'
				case 'rejected':
					return 'border-red-500 bg-red-50'
				case 'pending':
					return 'border-amber-500 bg-amber-50'
			}
		}

		
		return 'border-gray-100'
	}


	const getArticleResponseStatus = (article: Article) => {
	
		return userResponses.find(
			resp => resp.questionTitle && resp.questionTitle.toLowerCase().trim() === article.title.toLowerCase().trim()
		)
	}
	const handleAddArticleToResponse = async (article: Article) => {
		if (!userData?.email) {
			toast.error('Musisz być zalogowany, aby dodać artykuł')
			return
		}

		try {
			
			const normalizedTitle = article.title.toLowerCase().trim()
			const existingResponse = userResponses.some(
				response => response.questionTitle && response.questionTitle.toLowerCase().trim() === normalizedTitle
			)

			if (existingResponse) {
				toast.info('Ten artykuł jest już dodany do Twoich publikacji')
				return
			}
			const allResponses = await loadResponses('Artykuły naukowe')
			const alreadyExists = allResponses.some(
				response => response.questionTitle && response.questionTitle.toLowerCase().trim() === normalizedTitle
			)

			if (alreadyExists) {
				toast.info('Ten artykuł jest już dodany do Twoich publikacji')
				setUserResponses(allResponses) 
				return
			}

			setAddingArticle(prev => ({ ...prev, [article.id || article.title]: true }))

			const questionId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

		
			let points = 0;
			const parseValue = (value: any): number => {
				if (value === null || value === undefined) return 0;
				if (typeof value === 'number') return isNaN(value) ? 0 : value;
				const numericString = String(value).replace(/[^\d.]/g, '');
				const parsed = parseFloat(numericString);
				return isNaN(parsed) ? 0 : parsed;
			};

		
			if (article.pk) {
				points = parseValue(article.pk);
			}
		
			if (points === 0 && article.points !== undefined && article.points !== null) {
				points = parseValue(article.points);
			}	
			const POINT_THRESHOLD = 110; 
			const numberOfAuthors = article.authors?.length || 0;

			if (points < POINT_THRESHOLD && numberOfAuthors > 0) {
				points = Math.ceil(points / numberOfAuthors); 
				
			}
			


			const newResponse = {
				id: questionId,
				questionTitle: article.title,
				points: points,
				category: 'Artykuły naukowe',
				status: 'pending',
				createdAt: new Date().toISOString(),
			}

	
			setUserResponses(prev => [...prev, newResponse])


			await saveResponse(
				questionId,
				article.title, 
				points,
				'Artykuły naukowe',
				'pending'
			)

			toast.success('Artykuł został dodany do Twoich publikacji')

		
		} catch (err) {
			console.error('Error adding article to response:', err)
			toast.error('Nie udało się dodać artykułu')
		} finally {
			setAddingArticle(prev => ({ ...prev, [article.id || article.title]: false }))
		}
	}

	const handleDeleteArticle = async (responseId: string) => {
		if (!userData?.email) {
			toast.error('Musisz być zalogowany, aby usunąć artykuł')
			return
		}

		try {
			setDeletingArticle(prev => ({ ...prev, [responseId]: true }))

			const success = await deleteResponse(responseId)
			
			if (success) {
			
				setUserResponses(prev => prev.filter(response => response.id !== responseId))
				toast.success('Artykuł został usunięty z Twoich publikacji')
			} else {
				toast.error('Nie udało się usunąć artykułu')
			}
		} catch (err) {
			console.error('Error deleting article:', err)
			toast.error('Nie udało się usunąć artykułu')
		} finally {
			setDeletingArticle(prev => ({ ...prev, [responseId]: false }))
		}
	}


	return (
		<div className="h-full p-6 pb-1 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
	
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold text-gray-800">Moje publikacje naukowe</h2>
				{onClose && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
						<X className="h-5 w-5" />
					</Button>
				)}
			</div>

	
			{error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">{error}</div>}

			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
						<p className="text-gray-600">Ładowanie publikacji...</p>
					</div>
				</div>
			) : (
				<>
		
					{articles.length === 0 ? (
						<div className="flex-1 flex items-center justify-center">
							<div className="text-center max-w-md">
								<h3 className="text-xl font-medium text-gray-700 mb-2">Brak publikacji</h3>
								<p className="text-gray-500">
									Nie znaleziono żadnych publikacji dla Twojego nazwiska. Jeśli masz publikacje, które nie zostały
									znalezione, skontaktuj się z administratorem.
								</p>
							</div>
						</div>
					) : (
						<>
						
							<div className="flex-1 overflow-y-auto pr-2 mb-4">
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{currentItems.map((article, index) => (
										<Card
											key={article.id || index}
											className={`shadow-sm hover:shadow transition-all h-full flex flex-col ${getCardStyle(article)}`}>
											<CardHeader className="pb-2">
												<div className="flex justify-between items-start">
													<CardTitle className="text-lg font-medium">{article.title}</CardTitle>
													{article.url && (
														<Button
															variant="ghost"
															size="icon"
															className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 -mt-1 -mr-2"
															onClick={() => window.open(article.url, '_blank')}>
															<ExternalLink className="h-4 w-4" />
														</Button>
													)}
												</div>
												<CardDescription>
													{article.journal && <span className="block">Czasopismo: {article.journal}</span>}
													{article.year && <span className="block">Rok: {article.year}</span>}
												</CardDescription>
											</CardHeader>
											<CardContent className="pb-2">
												<div className="space-y-3">
													{/* Informacje o artykule */}
													<div className="grid grid-cols-1 gap-2 text-sm">
														{article.authors && article.authors.length > 0 && (
															<div className="flex items-start">
																<span className="font-medium text-gray-700 mr-2">Autorzy:</span>
																<span className="text-gray-600">{article.authors.join(', ')}</span>
															</div>
														)}

														{article.year && (
															<div className="flex items-start">
																<span className="font-medium text-gray-700 mr-2">Rok:</span>
																<span className="text-gray-600">{article.year}</span>
															</div>
														)}

														{article.journal && (
															<div className="flex items-start">
																<span className="font-medium text-gray-700 mr-2">Czasopismo:</span>
																<span className="text-gray-600">{article.journal}</span>
															</div>
														)}

														{article.oa_info && (
															<div className="flex items-start">
																<span className="font-medium text-gray-700 mr-2">Informacje OA:</span>
																<span className="text-gray-600">{article.oa_info}</span>
															</div>
														)}
													</div>

												
													<div className="flex flex-wrap gap-2 mt-2">
														{article.pk && (
															<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
																{article.pk} pkt
															</Badge>
														)}

														{article.points && !article.pk && (
															<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
																{article.points} pkt
															</Badge>
														)}

														{article.id && (
															<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
																ID: {article.id}
															</Badge>
														)}
													</div>

													{article.ww && (
														<div className="mt-2">
															<a
																href={article.ww}
																target="_blank"
																rel="noopener noreferrer"
																className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center">
																<ExternalLink className="h-3 w-3 mr-1" />
																Pełny tekst
															</a>
														</div>
													)}
												</div>
											</CardContent>
											<CardFooter className="pt-2 border-t mt-auto">
												<div className="flex w-full gap-2">
													<Button
														variant="outline"
														size="sm"
														className="flex-1 text-green-700 border-green-200 hover:bg-green-50"
														onClick={() => handleAddArticleToResponse(article)}
														disabled={addingArticle[article.id || article.title] || !!getArticleResponseStatus(article)}>
														{addingArticle[article.id || article.title] ? (
															<>
																<Check className="h-4 w-4 mr-2" />
																Dodawanie...
															</>
														) : getArticleResponseStatus(article) ? (
															<>
																<Check className="h-4 w-4 mr-2" />
																{getArticleResponseStatus(article).status === 'approved'
																	? 'Zatwierdzona'
																	: getArticleResponseStatus(article).status === 'rejected'
																	? 'Odrzucona'
																	: 'Oczekująca'}
															</>
														) : (
															<>
																<Plus className="h-4 w-4 mr-2" />
																Dodaj do moich publikacji
															</>
														)}
													</Button>
												
										
													{getArticleResponseStatus(article) && 
													(getArticleResponseStatus(article).status === 'pending' || 
													getArticleResponseStatus(article).status === 'rejected') && (
														<Button
															variant="outline"
															size="sm"
															className="text-red-700 border-red-200 hover:bg-red-50"
															onClick={() => handleDeleteArticle(getArticleResponseStatus(article).id)}
															disabled={deletingArticle[getArticleResponseStatus(article).id]}>
															{deletingArticle[getArticleResponseStatus(article).id] ? (
																<>
																	<span className="animate-spin h-4 w-4 mr-2 border-b-2 border-red-700 rounded-full"></span>
																	Usuwanie...
																</>
															) : (
																<>
																	<Trash2 className="h-4 w-4 mr-2" />
																	Usuń
																</>
															)}
														</Button>
													)}
												</div>
											</CardFooter>
										</Card>
										
								))}
							</div>
						</div>

				
						{totalPages > 1 && (
							<div className="flex justify-center mt-4 border-t border-gray-100 pt-4">
								<div className="flex space-x-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
										disabled={currentPage === 1}>
										Poprzednia
									</Button>
									<div className="flex items-center space-x-1">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
											<Button
												key={page}
												variant={currentPage === page ? 'default' : 'outline'}
												size="sm"
												className="w-8 h-8 p-0"
												onClick={() => setCurrentPage(page)}>
												{page}
											</Button>
										))}
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
										disabled={currentPage === totalPages}>
										Następna
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</>
		)}
	</div>
)}
