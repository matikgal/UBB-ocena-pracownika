import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../../firebase'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from '../../contexts/AuthContext'
import { ShieldAlert, Trash, Search, Filter, SortAsc, SortDesc, Check, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Checkbox } from '../ui/checkbox'

interface UserResponse {
	id: string
	userId: string
	userName: string
	userEmail: string
	questionId: string
	questionTitle: string
	points: number
	category: string
	status: 'pending' | 'approved' | 'rejected'
	articles?: Article[]
}

interface Article {
	title: string
	journal?: string
	year?: number
	points: number
}

export default function LibraryEvaluationComponent() {
	const [responses, setResponses] = useState<UserResponse[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)
	const { userData, hasRole } = useAuth()
	const [editingResponse, setEditingResponse] = useState<string | null>(null)
	const [articles, setArticles] = useState<Article[]>([])
	const [newArticle, setNewArticle] = useState<Article>({ title: '', points: 0 })
	
	// New state variables for enhanced functionality
	const [sortField, setSortField] = useState<'userName' | 'points' | 'status'>('userName')
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
	const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedResponses, setSelectedResponses] = useState<string[]>([])
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(5)
	const [showConfirmation, setShowConfirmation] = useState(false)

	// Update this line to include 'biblioteka' role
	const hasLibraryAccess = hasRole('library') || hasRole('admin') || hasRole('biblioteka')

	// Show toast when success message changes
	useEffect(() => {
		if (successMessage) {
			toast.success(successMessage);
		}
	}, [successMessage]);

	// Show toast when error changes
	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	useEffect(() => {
		if (hasLibraryAccess) {
			fetchPendingResponses()
		}
	}, [hasLibraryAccess])

	const fetchPendingResponses = async () => {
		try {
			setLoading(true)
			setError(null)

			// Query all users' responses for the specific question
			const allResponses: UserResponse[] = []

			// Get all users
			const usersSnapshot = await getDocs(collection(db, 'Users'))

			for (const userDoc of usersSnapshot.docs) {
				const userEmail = userDoc.id
				const userData = userDoc.data()

				// Query responses for this user
				const responsesRef = collection(db, 'Users', userEmail, 'responses')
				const q = query(
					responsesRef,
					where('questionTitle', '==', 'Autorstwo artykułu/monografii (dotyczy pracowników dydaktycznych)')
				)

				const responseSnapshot = await getDocs(q)

				responseSnapshot.forEach(responseDoc => {
					const responseData = responseDoc.data()

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
					})
				})
			}

			setResponses(allResponses)
			// Reset selected responses when fetching new data
			setSelectedResponses([])
		} catch (err) {
			console.error('Error fetching responses:', err)
			setError('Nie udało się pobrać odpowiedzi')
		} finally {
			setLoading(false)
		}
	}

	const handleStartEditing = (responseId: string, existingArticles: Article[] = []) => {
		setEditingResponse(responseId)
		setArticles(existingArticles)
		setNewArticle({ title: '', points: 0 })
	}

	const handleAddArticle = () => {
		if (newArticle.title.trim() === '') return

		setArticles([...articles, { ...newArticle }])
		setNewArticle({ title: '', points: 0 })
	}

	const handleRemoveArticle = (index: number) => {
		const updatedArticles = [...articles]
		updatedArticles.splice(index, 1)
		setArticles(updatedArticles)
	}

	const handleSaveEvaluation = async () => {
		if (!editingResponse) return

		try {
			setLoading(true)

			// Find the response we're editing
			const response = responses.find(r => r.id === editingResponse)
			if (!response) return

			// Calculate total points
			const totalPoints = articles.reduce((sum, article) => sum + article.points, 0)

			// Update the response in Firestore but keep status as pending
			// unless it's already approved
			const responseRef = doc(db, 'Users', response.userEmail, 'responses', response.id)
			await updateDoc(responseRef, {
				points: totalPoints,
				articles: articles,
				// Keep the existing status instead of forcing 'approved'
				status: response.status,
				verifiedBy: userData?.email,
				verifiedAt: new Date(),
			})

			// Update local state while preserving the status
			setResponses(
				responses.map(r =>
					r.id === editingResponse ? { ...r, points: totalPoints, articles: articles } : r
				)
			)

			setSuccessMessage(`Publikacje dla ${response.userName} zostały zapisane`)
			setEditingResponse(null)
			setShowConfirmation(false)
		} catch (err) {
			console.error('Error saving evaluation:', err)
			setError('Nie udało się zapisać oceny')
		} finally {
			setLoading(false)
		}
	}

	const handleCancelEditing = () => {
		setEditingResponse(null)
		setArticles([])
		setShowConfirmation(false)
	}

	// Add the handleApproveResponse function here with the other handler functions
	const handleApproveResponse = async (responseId: string) => {
		try {
			setLoading(true);
			
			// Find the response
			const response = responses.find(r => r.id === responseId);
			if (!response) return;
			
			// Update the response status in Firestore
			const responseRef = doc(db, 'Users', response.userEmail, 'responses', response.id);
			await updateDoc(responseRef, {
				status: 'approved',
				verifiedBy: userData?.email,
				verifiedAt: new Date(),
			});
			
			// Update local state
			setResponses(
				responses.map(r =>
					r.id === responseId ? { ...r, status: 'approved' } : r
				)
			);
			
			setSuccessMessage(`Ocena dla ${response.userName} została zatwierdzona`);
		} catch (err) {
			console.error('Error approving response:', err);
			setError('Nie udało się zatwierdzić oceny');
		} finally {
			setLoading(false);
		}
	};

	// Update the handleDeleteResponse function to use a better confirmation
	const handleDeleteResponse = async (responseId: string, userEmail: string) => {
		if (!hasLibraryAccess) return;
		
		// Get the response name for the confirmation message
		const responseToDelete = responses.find(r => r.id === responseId);
		if (!responseToDelete) return;
		
		// Use custom toast confirmation without the loading state
		toast.custom((t) => (
			<div className={`${t ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col`}>
				<div className="p-4">
					<div className="flex items-start">
						<div className="flex-shrink-0 text-red-500">
							<Trash className="h-6 w-6" />
						</div>
						<div className="ml-3 flex-1">
							<p className="text-sm font-medium text-gray-900">
								Usunąć odpowiedź?
							</p>
							<p className="mt-1 text-sm text-gray-500">
								Czy na pewno chcesz usunąć odpowiedź użytkownika {responseToDelete.userName}? Ta operacja jest nieodwracalna.
							</p>
							<div className="mt-4 flex justify-end space-x-3 " >
								<Button 
								className='text-black'
									variant="outline" 
									size="sm" 
									onClick={() => {
										toast.dismiss(t);
									}}
								>
									Anuluj
								</Button>
								<Button 
									variant="destructive" 
									size="sm" 
									onClick={async () => {
										toast.dismiss(t);

										try {
											setLoading(true);

											// Delete the response from Firestore
											const responseRef = doc(db, 'Users', userEmail, 'responses', responseId);
											await deleteDoc(responseRef);

											// Update local state
											setResponses(responses.filter(r => r.id !== responseId));

											// Show success message after deletion
											toast.success('Odpowiedź została usunięta');
										} catch (err) {
											console.error('Error deleting response:', err);
											toast.error('Nie udało się usunąć odpowiedzi');
										} finally {
											setLoading(false);
										}
									}}
								>
									Usuń
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>
		), { duration: 10000 }); // 10 seconds duration
	};

	// New function to handle batch approval of selected responses
	const handleBatchApprove = async () => {
		if (selectedResponses.length === 0) {
			toast.error('Nie wybrano żadnych odpowiedzi do zatwierdzenia');
			return;
		}

		try {
			setLoading(true);
			let successCount = 0;

			for (const responseId of selectedResponses) {
				const response = responses.find(r => r.id === responseId);
				if (!response || response.status === 'approved') continue;

				// Skip responses that don't have articles
				if (!response.articles || response.articles.length === 0) continue;

				// Calculate total points
				const totalPoints = response.articles.reduce((sum, article) => sum + article.points, 0);

				// Update the response in Firestore
				const responseRef = doc(db, 'Users', response.userEmail, 'responses', response.id);
				await updateDoc(responseRef, {
					points: totalPoints,
					status: 'approved',
					verifiedBy: userData?.email,
					verifiedAt: new Date(),
				});

				successCount++;
			}

			// Update local state
			setResponses(
				responses.map(r =>
					selectedResponses.includes(r.id) && r.articles && r.articles.length > 0
						? { ...r, status: 'approved' }
						: r
				)
			);

			setSelectedResponses([]);
			setSuccessMessage(`Zatwierdzono ${successCount} odpowiedzi`);
		} catch (err) {
			console.error('Error batch approving responses:', err);
			setError('Nie udało się zatwierdzić odpowiedzi');
		} finally {
			setLoading(false);
		}
	};

	// Function to toggle response selection
	const toggleResponseSelection = (responseId: string) => {
		setSelectedResponses(prev => 
			prev.includes(responseId)
				? prev.filter(id => id !== responseId)
				: [...prev, responseId]
		);
	};

	// Function to toggle all responses selection
	const toggleAllResponses = () => {
		if (selectedResponses.length === filteredResponses.length) {
			setSelectedResponses([]);
		} else {
			setSelectedResponses(filteredResponses.map(r => r.id));
		}
	};

	// Function to handle confirmation before saving
	const handleConfirmSave = () => {
		setShowConfirmation(true);
	};

	// Apply sorting, filtering, and search to responses
	const filteredResponses = responses
		.filter(response => {
			// Apply status filter
			if (filterStatus !== 'all' && response.status !== filterStatus) {
				return false;
			}
			
			// Apply search term
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				return (
					response.userName.toLowerCase().includes(searchLower) ||
					response.userEmail.toLowerCase().includes(searchLower) ||
					(response.articles?.some(article => 
						article.title.toLowerCase().includes(searchLower) ||
						(article.journal && article.journal.toLowerCase().includes(searchLower))
					) ?? false)
				);
			}
			
			return true;
		})
		.sort((a, b) => {
			// Apply sorting
			if (sortField === 'userName') {
				return sortDirection === 'asc' 
					? a.userName.localeCompare(b.userName)
					: b.userName.localeCompare(a.userName);
			} else if (sortField === 'points') {
				return sortDirection === 'asc'
					? a.points - b.points
					: b.points - a.points;
			} else if (sortField === 'status') {
				const statusOrder = { approved: 0, pending: 1, rejected: 2 };
				return sortDirection === 'asc'
					? statusOrder[a.status] - statusOrder[b.status]
					: statusOrder[b.status] - statusOrder[a.status];
			}
			return 0;
		});

	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredResponses.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);

	// If user doesn't have library access, show access denied
	if (!hasLibraryAccess) {
		return (
			<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
				<div className="flex flex-col items-center justify-center h-full text-center">
					<ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
					<h3 className="text-xl font-semibold text-gray-800 mb-2">Brak dostępu</h3>
					<p className="text-gray-600 max-w-md">
						Tylko użytkownicy z rolą bibliotekarza mają dostęp do oceny publikacji.
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-auto">
			<div className="mb-6">
				<h2 className="text-2xl font-semibold text-gray-800">Ocena publikacji przez bibliotekę</h2>
			</div>

			{error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">{error}</div>}

			{successMessage && (
				<div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-100">{successMessage}</div>
			)}

			{loading && !editingResponse ? (
				<div className="flex items-center justify-center h-40">
					<p>Ładowanie...</p>
				</div>
			) : (
				<>
					{editingResponse ? (
						<div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-black">
							<h3 className="text-lg font-medium mb-4">
								Ocena publikacji dla: {responses.find(r => r.id === editingResponse)?.userName}
							</h3>

							<div className="space-y-4 mb-6">
								<h4 className="font-medium">Dodane publikacje:</h4>

								{articles.length === 0 ? (
									<p className="text-gray-500 italic">Brak dodanych publikacji</p>
								) : (
									<div className="space-y-3">
										{articles.map((article, index) => (
											<div key={index} className="flex items-start gap-2 p-3 bg-white rounded border border-gray-200">
												<div className="flex-1">
													<p className="font-medium">{article.title}</p>
													{article.journal && <p className="text-sm text-gray-600">Czasopismo: {article.journal}</p>}
													{article.year && <p className="text-sm text-gray-600">Rok: {article.year}</p>}
													<p className="text-sm font-medium text-green-700 mt-1">Punkty: {article.points}</p>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleRemoveArticle(index)}
													className="text-red-500 hover:text-red-700 hover:bg-red-50">
													Usuń
												</Button>
											</div>
										))}
									</div>
								)}
							</div>

							<div className="bg-white p-4 rounded border border-gray-200 mb-4">
								<h4 className="font-medium mb-3">Dodaj nową publikację</h4>
								<div className="space-y-3">
									<div>
										<label className="block text-sm font-medium mb-1">Tytuł publikacji</label>
										<Input
											value={newArticle.title}
											onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
											placeholder="Wprowadź tytuł publikacji"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium mb-1">Czasopismo (opcjonalnie)</label>
										<Input
											value={newArticle.journal || ''}
											onChange={e => setNewArticle({ ...newArticle, journal: e.target.value })}
											placeholder="Wprowadź nazwę czasopisma"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium mb-1">Rok (opcjonalnie)</label>
										<Input
											type="number"
											value={newArticle.year || ''}
											onChange={e => setNewArticle({ ...newArticle, year: parseInt(e.target.value) || undefined })}
											placeholder="Wprowadź rok publikacji"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium mb-1">Punkty</label>
										<Input
											type="number"
											value={newArticle.points}
											onChange={e => setNewArticle({ ...newArticle, points: parseFloat(e.target.value) || 0 })}
											placeholder="Wprowadź liczbę punktów"
											min={0}
											step={0.5}
										/>
									</div>

									<Button onClick={handleAddArticle} disabled={!newArticle.title.trim()} className="w-full">
										Dodaj publikację
									</Button>
								</div>
							</div>

							<div className="flex justify-end gap-3 mt-4">
								<Button variant="outline" onClick={handleCancelEditing}>
									Anuluj
								</Button>
								{showConfirmation ? (
									<div className="bg-yellow-50 p-3 rounded border border-yellow-200 flex flex-col gap-2">
										<p className="text-sm text-yellow-800">Czy na pewno chcesz zapisać ocenę?</p>
										<div className="flex justify-end gap-2">
											<Button 
												variant="outline" 
												size="sm" 
												onClick={() => setShowConfirmation(false)}
											>
												Anuluj
											</Button>
											<Button 
												size="sm" 
												onClick={handleSaveEvaluation}
											>
												Potwierdź
											</Button>
										</div>
									</div>
								) : (
									<Button 
										onClick={handleConfirmSave} 
										disabled={articles.length === 0}
									>
										Zapisz ocenę
									</Button>
								)}
							</div>
						</div>
					) : (
						<div className="flex-1 overflow-y-auto">
							<div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<h3 className="text-lg text-black font-medium">Lista zgłoszonych publikacji do oceny</h3>
								
								{/* Search and filter controls */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<div className="relative">
										<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
										<Input
											placeholder="Szukaj..."
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className="pl-8 w-full md:w-64"
										/>
									</div>
									
									<div className="flex items-center gap-2">
										<Select
											value={filterStatus}
											onValueChange={(value) => setFilterStatus(value as any)}
										>
											<SelectTrigger className="w-[130px]">
												<Filter className="h-4 w-4 mr-2" />
												<SelectValue placeholder="Status" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">Wszystkie</SelectItem>
												<SelectItem value="pending">Oczekujące</SelectItem>
												<SelectItem value="approved">Ocenione</SelectItem>
												<SelectItem value="rejected">Odrzucone</SelectItem>
											</SelectContent>
										</Select>
										
										<Select
											value={sortField}
											onValueChange={(value) => setSortField(value as any)}
										>
											<SelectTrigger className="w-[130px]">
												{sortDirection === 'asc' ? (
													<SortAsc className="h-4 w-4 mr-2" />
												) : (
													<SortDesc className="h-4 w-4 mr-2" />
												)}
												<SelectValue placeholder="Sortuj" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="userName">Nazwa użytkownika</SelectItem>
												<SelectItem value="points">Punkty</SelectItem>
												<SelectItem value="status">Status</SelectItem>
											</SelectContent>
										</Select>
										
										<Button
											variant="outline"
											size="icon"
											onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
											title={`Sortuj ${sortDirection === 'asc' ? 'malejąco' : 'rosnąco'}`}
										>
											{sortDirection === 'asc' ? (
												<SortAsc className="h-4 w-4" />
											) : (
												<SortDesc className="h-4 w-4" />
											)}
										</Button>
									</div>
								</div>
							</div>
							
							{/* Batch actions */}
							{selectedResponses.length > 0 && (
								<div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex justify-between items-center">
									<p className="text-sm text-blue-700">
										Wybrano {selectedResponses.length} {selectedResponses.length === 1 ? 'odpowiedź' : 'odpowiedzi'}
									</p>
									<Button 
										size="sm" 
										onClick={handleBatchApprove}
										className="bg-blue-600 hover:bg-blue-700"
									>
										<Check className="h-4 w-4 mr-1" />
										Zatwierdź wybrane
									</Button>
								</div>
							)}

							{currentItems.length === 0 ? (
								<div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
									<p className="text-gray-500">Brak zgłoszonych publikacji do oceny</p>
								</div>
							) : (
								<div className="space-y-4 text-black">
									<div className="flex items-center mb-2 px-4">
										<Checkbox 
											id="select-all"
											checked={selectedResponses.length === filteredResponses.length && filteredResponses.length > 0}
											onCheckedChange={toggleAllResponses}
											className="mr-2"
										/>
										<label htmlFor="select-all" className="text-sm text-gray-600 cursor-pointer">
											Zaznacz wszystkie
										</label>
									</div>
									
									{currentItems.map(response => (
                                        <div
                                            key={response.id}
                                            className={`p-4 rounded-lg shadow border-2 ${
                                                response.status === 'approved'
                                                    ? 'border-green-500 bg-green-50'
                                                    : response.status === 'rejected'
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-amber-500 bg-amber-50'
                                            }`}>
                                            <div className="flex items-start gap-2">
                                                <Checkbox 
                                                    id={`select-${response.id}`}
                                                    checked={selectedResponses.includes(response.id)}
                                                    onCheckedChange={() => toggleResponseSelection(response.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium">{response.userName}</h4>
                                                            <p className="text-sm text-gray-600">{response.userEmail}</p>
                                                            <p className="text-sm mt-1">
                                                                <span className="font-medium">Kategoria:</span> {response.category}
                                                            </p>
                                                        </div>
                                                        <div className="flex space-x-2 items-center">
                                                            <span
                                                                className={`text-xs text-center px-2 py-0.5 rounded-full ${
                                                                    response.status === 'approved'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : response.status === 'rejected'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                {response.status === 'approved'
                                                                    ? 'Ocenione'
                                                                    : response.status === 'rejected'
                                                                    ? 'Odrzucone'
                                                                    : 'Oczekujące'}
                                                            </span>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => handleDeleteResponse(response.id, response.userEmail)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {response.articles && response.articles.length > 0 && (
                                                        <div className="mt-3">
                                                            <h5 className="text-sm font-medium mb-2">Ocenione publikacje:</h5>
                                                            <div className="space-y-2">
                                                                {response.articles.map((article, index) => (
                                                                    <div key={index} className="text-sm bg-white p-2 rounded border border-gray-200">
                                                                        <p className="font-medium">{article.title}</p>
                                                                        {article.journal && <p className="text-gray-600">Czasopismo: {article.journal}</p>}
                                                                        {article.year && <p className="text-gray-600">Rok: {article.year}</p>}
                                                                        <p className="text-green-700 mt-1">Punkty: {article.points}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    
                                                    <div className="mt-3 flex justify-between items-center">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => handleStartEditing(response.id, response.articles)}
                                                            className="mr-2"
                                                        >
                                                            Edytuj publikacje
                                                        </Button>
                                                        
                                                        {response.status !== 'approved' && (
                                                            <Button
                                                                onClick={() => handleApproveResponse(response.id)}
                                                                disabled={!response.articles || response.articles.length === 0}
                                                                className="bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckSquare className="h-4 w-4 mr-1" />
                                                                Zatwierdź ocenę
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Pagination controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Poprzednia
                                    </Button>
                                    
                                    <div className="text-sm text-gray-600">
                                        Strona {currentPage} z {totalPages}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Następna
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <div className="mt-4">
                <Button onClick={fetchPendingResponses} variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
                    Odśwież listę
                </Button>
            </div>
        </div>
    )
}
