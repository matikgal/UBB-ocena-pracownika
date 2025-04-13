import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { X, ExternalLink } from 'lucide-react'
import { usePagination } from '../../hooks/usePagination'
import { Article } from '../../types/index'
import { getArticlesByAuthor } from '../../services/firebase/articlesService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface LibraryEvaluationComponentProps {
  onClose?: () => void
}

export default function LibraryEvaluationComponent({ onClose }: LibraryEvaluationComponentProps) {
	// Stany komponentu
	const [articles, setArticles] = useState<Article[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	
	const { userData } = useAuth()
	
	
	useEffect(() => {
		const fetchArticles = async () => {
			try {
				setLoading(true);
				setError(null);
				
				if (userData?.name) {
					
					const authorName = userData.name.trim();
					if (authorName) {
						const fetchedArticles = await getArticlesByAuthor(authorName);
						setArticles(fetchedArticles);
					} else {
						setArticles([]);
					}
				} else {
					setArticles([]);
				}
			} catch (err) {
				console.error('Error fetching articles:', err);
				setError('Nie udało się pobrać artykułów');
			} finally {
				setLoading(false);
			}
		};
		
		fetchArticles();
	}, [userData?.name]);

	
	const { 
		currentPage, 
		setCurrentPage, 
		currentItems, 
		totalPages 
	} = usePagination(articles, 10);

	return (
		<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-auto">
			
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold text-gray-800">Moje artykuły naukowe</h2>
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

			{error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">{error}</div>}

		
			{loading ? (
				<div className="flex items-center justify-center h-40">
					<p>Ładowanie artykułów...</p>
				</div>
			) : (
				<>
				
					<div className="flex-1 overflow-y-auto">
						{articles.length === 0 ? (
							<div className="text-center py-10 text-gray-500">
								Nie znaleziono artykułów
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{currentItems.map((article, index) => (
									<Card key={article.id || index} className="h-full">
										<CardHeader>
											<CardTitle className="line-clamp-2 text-base">{article.title}</CardTitle>
											{article.authors && article.authors.length > 0 && (
												<CardDescription>
													<div className="flex flex-wrap gap-1 mt-2">
														{article.authors.slice(0, 3).map((author, idx) => (
															<Badge key={idx} variant="outline" className="text-xs">
																{author}
															</Badge>
														))}
														{article.authors.length > 3 && (
															<Badge variant="outline" className="text-xs">
																+{article.authors.length - 3}
															</Badge>
														)}
													</div>
												</CardDescription>
											)}
										</CardHeader>
										<CardContent>
											<div className="flex flex-col gap-2">
												{article.oa_info && (
													<div className="text-sm">
														<span className="font-medium">Open Access: </span>
														{article.oa_info}
													</div>
												)}
												{/* Display points from either pk or points field */}
												<div className="text-sm">
													<span className="font-medium text-green-700">Punkty: </span>
													{article.pk || article.points || 0}
												</div>
												{/* Display publisher from either ww or journal field */}
												{(article.ww || article.journal) && (
													<div className="text-sm flex items-center">
														<span className="font-medium">Wydawnictwo: </span>
														<span className="ml-1">{article.ww || article.journal}</span>
														{article.ww && (
															<a 
																href={article.ww.startsWith('http') ? article.ww : `https://${article.ww}`}
																target="_blank" 
																rel="noopener noreferrer"
																className="ml-2 text-blue-600 hover:text-blue-800"
																title="Otwórz artykuł"
															>
																<ExternalLink className="h-4 w-4" />
															</a>
														)}
													</div>
												)}
												{/* Display year if available */}
												{article.year && (
													<div className="text-sm">
														<span className="font-medium">Rok: </span>
														{article.year}
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>
					
					{/* Kontrolki paginacji */}
					{totalPages > 1 && (
						<div className="flex justify-between items-center mt-4">
							<Button
								variant="outline"
								onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
							>
								Poprzednia
							</Button>
							
							<div className="text-sm text-gray-600">
								Strona {currentPage} z {totalPages}
							</div>
							
							<Button
								variant="outline"
								onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))}
								disabled={currentPage === totalPages}
							>
								Następna
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	)
}
