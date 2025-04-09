import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '../ui/button'
import { useAuth } from '../../contexts/AuthContext'
import { Check, X, AlertTriangle } from 'lucide-react'
import { toast } from '../common/Toast';
import { AccessDenied } from './components/AccessDenied'
import { ResponseList } from './components/ResponseList'
import { FilterBar } from './components/FilterBar'

import { ConfirmDialog } from '../common/ConfirmDialog'
import { usePagination } from '../../hooks/usePagination'
import { useResponses } from '../../services/firebase/useResponses'
import { ArticleEditor } from './components/ArticleEditor'
import { Article } from '../../types/index'

interface LibraryEvaluationComponentProps {
  onClose?: () => void
}

export default function LibraryEvaluationComponent({ onClose }: LibraryEvaluationComponentProps) {

	// Pobieranie funkcji i danych z hooka useResponses
	const { 
		responses, 
		loading, 
		error, 
		successMessage,
		fetchResponses,
		updateResponse,
		deleteResponse,
		approveResponse,
		batchApproveResponses
	} = useResponses();
	
	// Stany komponentu
	const [editingResponse, setEditingResponse] = useState<string | null>(null)
	const [articles, setArticles] = useState<Article[]>([])
	const [newArticle, setNewArticle] = useState<Article>({ title: '', points: 0 })
	const [showConfirmation, setShowConfirmation] = useState(false)
	
	// Stany filtrowania i sortowania
	const [sortField, setSortField] = useState<'userName' | 'points' | 'status'>('userName')
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
	const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedResponses, setSelectedResponses] = useState<string[]>([])
	
	const { hasRole } = useAuth()
	
	// Sprawdzenie uprawnień dostępu do biblioteki
	const hasLibraryAccess = hasRole('library') || hasRole('admin') || hasRole('biblioteka')

	
	// Obsługa komunikatów sukcesu
	useEffect(() => {
		if (successMessage) {
			toast.success(successMessage);
		}
	}, [successMessage]);

	// Obsługa błędów
	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	// Pobieranie odpowiedzi przy montowaniu komponentu
	useEffect(() => {
		if (hasLibraryAccess) {
			fetchResponses()
		}
	}, [hasLibraryAccess, fetchResponses])

	// Funkcja filtrująca i sortująca odpowiedzi
	const getFilteredResponses = useCallback(() => {
		return responses
			.filter(response => {
				// Filtrowanie według statusu
				if (filterStatus !== 'all' && response.status !== filterStatus) {
					return false;
				}
				
				// Filtrowanie według wyszukiwanego tekstu
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
				// Sortowanie wyników
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
	}, [responses, filterStatus, searchTerm, sortField, sortDirection]);

	// Użycie hooka paginacji z zapamiętanymi przefiltrowanymi odpowiedziami
	const filteredResponses = useMemo(() => getFilteredResponses(), [getFilteredResponses]);
	const { 
		currentPage, 
		setCurrentPage, 
		currentItems, 
		totalPages 
	} = usePagination(filteredResponses, 5);

	// Rozpoczęcie edycji odpowiedzi
	const handleStartEditing = useCallback((responseId: string, existingArticles: Article[] = []) => {
		setEditingResponse(responseId)
		setArticles(existingArticles)
		setNewArticle({ title: '', points: 0 })
	}, []);

	// Zapisanie oceny publikacji
	const handleSaveEvaluation = useCallback(async () => {
		if (!editingResponse) return;

		const response = responses.find(r => r.id === editingResponse);
		if (!response) return;

		// Obliczanie sumy punktów
		const totalPoints = articles.reduce((sum, article) => sum + article.points, 0);

		await updateResponse(
			response.id, 
			response.userEmail, 
			totalPoints, 
			articles, 
			response.status
		);

		setEditingResponse(null);
		setShowConfirmation(false);
	}, [editingResponse, responses, articles, updateResponse]);

	// Anulowanie edycji
	const handleCancelEditing = useCallback(() => {
		setEditingResponse(null)
		setArticles([])
		setShowConfirmation(false)
	}, []);

	// Potwierdzenie zapisu
	const handleConfirmSave = useCallback(() => {
		setShowConfirmation(true);
	}, []);

	// Usuwanie odpowiedzi z potwierdzeniem
	const handleDeleteResponse = (responseId: string, userName: string) => {
		toast.custom((t) => (
			<ConfirmDialog
				title="Potwierdź usunięcie"
				message={`Czy na pewno chcesz usunąć odpowiedź użytkownika ${userName}? Tej operacji nie można cofnąć.`}
				confirmLabel="Usuń"
				cancelLabel="Anuluj"
				variant="danger"
				icon={<AlertTriangle className="h-6 w-6" />}
				onCancel={() => toast.dismiss(t)}
				onConfirm={async () => {
					toast.dismiss(t)
					await deleteResponse(responseId, userName)
				}}
			/>
		), { duration: 10000 })
	}

	// Przełączanie zaznaczenia odpowiedzi
	const toggleResponseSelection = useCallback((responseId: string) => {
		setSelectedResponses(prev => 
			prev.includes(responseId)
				? prev.filter(id => id !== responseId)
				: [...prev, responseId]
		);
	}, []);

	// Przełączanie zaznaczenia wszystkich odpowiedzi
	const toggleAllResponses = useCallback(() => {
		const filteredResponses = getFilteredResponses();
		if (selectedResponses.length === filteredResponses.length) {
			setSelectedResponses([]);
		} else {
			setSelectedResponses(filteredResponses.map(r => r.id));
		}
	}, [selectedResponses, getFilteredResponses]);

	// Obsługa zbiorczego zatwierdzania
	const handleBatchApprove = useCallback(async () => {
		if (selectedResponses.length === 0) {
			toast.error('Nie wybrano żadnych odpowiedzi do zatwierdzenia');
			return;
		}

		await batchApproveResponses(selectedResponses);
		setSelectedResponses([]);
	}, [selectedResponses, batchApproveResponses]);

	// Blokada dostępu dla nieuprawnionych użytkowników
	if (!hasLibraryAccess) {
		return <AccessDenied />;
	}

	return (
		<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-auto">
			{/* Nagłówek komponentu */}
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold text-gray-800">Ocena publikacji przez bibliotekę</h2>
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

			{/* Wyświetlanie błędów */}
			{error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-100">{error}</div>}

			{/* Wyświetlanie komunikatów sukcesu */}
			{successMessage && (
				<div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-100">{successMessage}</div>
			)}

			{/* Stan ładowania */}
			{loading && !editingResponse ? (
				<div className="flex items-center justify-center h-40">
					<p>Ładowanie...</p>
				</div>
			) : (
				<>
					{/* Tryb edycji publikacji */}
					{editingResponse ? (
						<ArticleEditor 
							response={responses.find(r => r.id === editingResponse)}
							articles={articles}
							setArticles={setArticles}
							newArticle={newArticle}
							setNewArticle={setNewArticle}
							showConfirmation={showConfirmation}
							onSave={handleSaveEvaluation}
							onCancel={handleCancelEditing}
							onConfirm={handleConfirmSave}
							setShowConfirmation={setShowConfirmation}
						/>
					) : (
						<div className="flex-1 overflow-y-auto">
							{/* Pasek filtrowania i wyszukiwania */}
							<FilterBar 
								searchTerm={searchTerm}
								setSearchTerm={setSearchTerm}
								filterStatus={filterStatus}
								setFilterStatus={setFilterStatus}
								sortField={sortField}
								setSortField={setSortField}
								sortDirection={sortDirection}
								setSortDirection={setSortDirection}
							/>
							
							{/* Akcje zbiorcze dla zaznaczonych odpowiedzi */}
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

							{/* Lista odpowiedzi */}
							<ResponseList 
								items={currentItems}
								selectedResponses={selectedResponses}
								toggleResponseSelection={toggleResponseSelection}
								toggleAllResponses={toggleAllResponses}
								onStartEditing={handleStartEditing}
								onApprove={approveResponse}
								onDelete={handleDeleteResponse}
								filteredCount={getFilteredResponses().length}
							/>
							
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
						</div>
					)}
				</>
			)}

			{/* Przycisk odświeżania listy */}
			<div className="mt-4">
				<Button onClick={fetchResponses} variant="default" className="w-full bg-blue-600 hover:bg-blue-700">
					Odśwież listę
				</Button>
			</div>
		</div>
	)
}
