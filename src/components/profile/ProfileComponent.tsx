import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUserResponses } from '../../services/firebase/useUserResponses'
import { PageHeader } from '../common/PageHeader'
import { Separator } from '../ui/separator'
import { User, Mail, Award, BookOpen } from 'lucide-react'
import { UserResponse } from '../../types'
import { Button } from '../ui/button'
import { ArticlesCarousel } from './ArticlesCarousel'

interface ProfileComponentProps {
	userEmail?: string
	onClose?: () => void
}

export function ProfileComponent({ userEmail, onClose }: ProfileComponentProps) {
	// Inicjalizacja stanów i pobieranie danych
	const { userData } = useAuth()
	const { loadResponses } = useUserResponses()
	const [responses, setResponses] = useState<UserResponse[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [profileData, setProfileData] = useState<any>(null)
	const dataFetchedRef = useRef(false)
	const [visibleResponses, setVisibleResponses] = useState(5)

	const targetEmail = userEmail || userData?.email

	// Obliczanie statystyk odpowiedzi
	const totalPoints = responses.reduce((sum, response) => sum + response.points, 0)
	const approvedResponses = responses.filter(r => r.status === 'approved')
	const approvedPoints = approvedResponses.reduce((sum, response) => sum + response.points, 0)
	const pendingResponses = responses.filter(r => r.status === 'pending')
	const rejectedResponses = responses.filter(r => r.status === 'rejected')

	// Podsumowanie kategorii
	const categorySummary = responses.reduce((acc, response) => {
		if (!acc[response.category]) {
			acc[response.category] = {
				total: 0,
				approved: 0,
				count: 0,
			}
		}
		acc[response.category].total += response.points
		acc[response.category].count += 1
		if (response.status === 'approved') {
			acc[response.category].approved += response.points
		}
		return acc
	}, {} as Record<string, { total: number; approved: number; count: number }>)

	// Pobieranie danych użytkownika i odpowiedzi
	useEffect(() => {
		if (dataFetchedRef.current) return

		const fetchUserData = async () => {
			if (!targetEmail) return

			try {
				setLoading(true)
				setError(null)

				// Ładowanie wszystkich odpowiedzi użytkownika
				const allResponses = await loadResponses()

				dataFetchedRef.current = true

				// Filtrowanie odpowiedzi z niezdefiniowanymi ID
				setResponses(allResponses.filter(response => response.id !== undefined) as UserResponse[])

				// Ustawienie danych profilu
				setProfileData({
					email: targetEmail,
					name: userData?.name || 'Użytkownik',
					lastName: userData?.lastName || '',
					roles: userData?.roles || [],
					avatar: userData?.avatar,
				})
			} catch (err) {
				console.error('Error loading profile data:', err)
				setError('Nie udało się załadować danych profilu')
			} finally {
				setLoading(false)
			}
		}

		fetchUserData()

		return () => {
			dataFetchedRef.current = false
		}
	}, [targetEmail, userData])

	// Wyświetlanie stanu ładowania
	if (loading) {
		return (
			<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
				<PageHeader title="Profil użytkownika" onClose={onClose} />
				<div className="flex items-center justify-center h-64">
					<div className="text-gray-500 flex flex-col items-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
						<span>Ładowanie profilu...</span>
					</div>
				</div>
			</div>
		)
	}

	// Wyświetlanie błędu
	if (error) {
		return (
			<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col  overflow-auto">
				<PageHeader title="Profil użytkownika" onClose={onClose} />
				<div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-100">{error}</div>
			</div>
		)
	}

	// Funkcja pokazująca wszystkie odpowiedzi
	const handleShowAllResponses = () => {
		setVisibleResponses(responses.length)
	}

	return (
		<div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col  overflow-y-auto">
			<PageHeader title="Profil użytkownika" onClose={onClose} />

			{/* Sekcja informacji o użytkowniku */}
			<div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
				<div className="w-24 h-24 rounded-full bg-ubbprimary text-white flex items-center justify-center text-3xl font-semibold">
					{profileData?.avatar ? (
						<img src={profileData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
					) : (
						profileData?.name?.charAt(0) || 'U'
					)}
				</div>

				<div className="flex-1">
					<h2 className="text-2xl font-semibold text-gray-900">{profileData?.name}</h2>

					<div className="flex items-center mt-1 text-gray-700">
						<Mail className="h-4 w-4 mr-2" />
						<span>{profileData?.email}</span>
					</div>
				</div>
			</div>

			<Separator className="mb-6" />

			{/* Add the ArticlesCarousel component here */}
			<ArticlesCarousel userName={profileData?.name || userData?.name || ''} />

			{/* Sekcja statystyk */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
					<div className="flex items-center text-blue-900 mb-2">
						<Award className="h-5 w-5 mr-2" />
						<h3 className="font-medium">Punkty zatwierdzone</h3>
					</div>
					<p className="text-2xl font-bold text-blue-900">{approvedPoints}</p>
					<p className="text-sm text-blue-800 mt-1">{approvedResponses.length} zatwierdzonych odpowiedzi</p>
				</div>

				<div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
					<div className="flex items-center text-amber-900 mb-2">
						<BookOpen className="h-5 w-5 mr-2" />
						<h3 className="font-medium">Punkty całkowite</h3>
					</div>
					<p className="text-2xl font-bold text-amber-900">{totalPoints}</p>
					<p className="text-sm text-amber-800 mt-1">{responses.length} wszystkich odpowiedzi</p>
				</div>

				<div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
					<div className="flex items-center text-gray-900 mb-2">
						<User className="h-5 w-5 mr-2" />
						<h3 className="font-medium">Status odpowiedzi</h3>
					</div>
					<div className="flex gap-3 mt-2 text-black">
						<div>
							<span className="text-sm text-green-700">Zatwierdzone:</span>
							<p className="font-semibold">{approvedResponses.length}</p>
						</div>
						<div>
							<span className="text-sm text-amber-700">Oczekujące:</span>
							<p className="font-semibold">{pendingResponses.length}</p>
						</div>
						<div>
							<span className="text-sm text-red-700">Odrzucone:</span>
							<p className="font-semibold">{rejectedResponses.length}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Sekcja kategorii */}
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Punkty według kategorii</h3>

			{Object.keys(categorySummary).length === 0 ? (
				<p className="text-gray-500 italic">Brak danych dla kategorii</p>
			) : (
				<div className="space-y-4 text-black">
					{Object.entries(categorySummary).map(([category, data]) => (
						<div key={category} className="border border-gray-200 rounded-lg p-4">
							<h4 className="font-medium text-gray-800">{category}</h4>
							<div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
								<div>
									<span className="text-sm text-gray-500">Liczba odpowiedzi:</span>
									<p className="font-semibold">{data.count}</p>
								</div>
								<div>
									<span className="text-sm text-gray-500">Punkty całkowite:</span>
									<p className="font-semibold">{data.total}</p>
								</div>
								<div>
									<span className="text-sm text-green-600">Punkty zatwierdzone:</span>
									<p className="font-semibold">{data.approved}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Sekcja ostatnich odpowiedzi */}
			<h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">Ostatnie odpowiedzi</h3>

			{responses.length === 0 ? (
				<p className="text-gray-500 italic">Brak odpowiedzi</p>
			) : (
				<div className="space-y-3 pb-4">
					{responses.slice(0, visibleResponses).map(response => (
						<div
							key={response.id}
							className={`border rounded-lg p-4 ${
								response.status === 'approved'
									? 'border-green-200 bg-green-50'
									: response.status === 'rejected'
									? 'border-red-200 bg-red-50'
									: 'border-gray-200 bg-gray-50'
							}`}>
							<div className="flex justify-between">
								<h4 className="font-medium text-gray-800">{response.questionTitle}</h4>
								<span
									className={`px-2 py-1 text-xs rounded-full ${
										response.status === 'approved'
											? 'bg-green-100 text-green-800'
											: response.status === 'rejected'
											? 'bg-red-100 text-red-800'
											: 'bg-gray-100 text-gray-800'
									}`}>
									{response.status === 'approved'
										? 'Zatwierdzone'
										: response.status === 'rejected'
										? 'Odrzucone'
										: 'Oczekujące'}
								</span>
							</div>
							<div className="mt-2 flex justify-between">
								<span className="text-sm text-gray-600">{response.category}</span>
								<span className="font-semibold text-black">{response.points} pkt</span>
							</div>
							{response.status === 'rejected' && response.rejectionReason && (
								<div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
									Powód odrzucenia: {response.rejectionReason}
								</div>
							)}
						</div>
					))}

					{/* Przycisk do wyświetlenia wszystkich odpowiedzi */}
					{responses.length > visibleResponses && (
						<div className="text-center mt-2">
							<Button variant="ghost" className="text-blue-600" onClick={handleShowAllResponses}>
								Zobacz pozostałe ({responses.length - visibleResponses})
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
