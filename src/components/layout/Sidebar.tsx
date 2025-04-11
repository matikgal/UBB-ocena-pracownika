import { BookOpen, LogOut, Edit, Users, Database } from 'lucide-react'
import logo from '../../assets/Logo.svg'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import {
	funkcjeDydaktyczne,
	nagrodyWyroznienia,
	podniesienieJakosciNauczania,
	publikacjeDydaktyczne,
	zajeciaJezykObcy,
} from '../../lib/questions'
import { useUserResponses } from '../../services/firebase/useUserResponses'
import { useRecordsImport } from '../../services/firebase/useRecordsImport'

interface MenuItem {
	title: string
	url: string
	icon: React.ElementType
	subcategories: Array<{ id: string; title: string; points: number | string; tooltip: string[] }>
}

// Definicja dostępnych kategorii pytań
const categories: MenuItem[] = [
	{ title: 'Publikacje dydaktyczne', url: '#', icon: BookOpen, subcategories: publikacjeDydaktyczne },
	{ title: 'Podniesienie jakości nauczania', url: '#', icon: BookOpen, subcategories: podniesienieJakosciNauczania },
	{ title: 'Zajęcia w języku obcym, wykłady za granicą', url: '#', icon: BookOpen, subcategories: zajeciaJezykObcy },
	{
		title: 'Pełnienie funkcji dydaktycznej (za każdy rok)',
		url: '#',
		icon: BookOpen,
		subcategories: funkcjeDydaktyczne,
	},
	{
		title: 'Nagrody i wyróznienia',
		url: '#',
		icon: BookOpen,
		subcategories: nagrodyWyroznienia,
	},
]

interface UserData {
	name: string
	lastName?: string
	email: string
	avatar?: string
	username?: string
}

interface AppSidebarProps {
	setSelectedCategory: (category: string) => void
	selectedCategory: string
	userData?: UserData
	onLogout?: () => void
	onEditQuestions?: () => void
	onManageUsers?: () => void
	onManageLibrary?: () => void
	onViewProfile: () => void
	onCloseOtherComponents?: () => void
}

export function AppSidebar({
	setSelectedCategory,
	selectedCategory,
	userData = { name: 'Użytkownik', email: 'brak@email.com' },
	onLogout = () => {},
	onEditQuestions = () => {},
	onManageUsers = () => {},
	onManageLibrary = () => {},
	onViewProfile = () => {},
	onCloseOtherComponents = () => {},
}: AppSidebarProps) {
	const { hasRole } = useAuth()
	const { loadResponses } = useUserResponses()
	const { importRecords, loading: importLoading } = useRecordsImport()

	// Sprawdzenie uprawnień użytkownika
	const canEditQuestions = hasRole('admin') || hasRole('dziekan')
	// Remove library role check - make it available to everyone
	const canManageLibrary = true
	const isAdmin = hasRole('admin')

	// Funkcja obsługująca wybór kategorii z odświeżeniem odpowiedzi
	const handleCategorySelect = (category: string) => {
		// Najpierw zamknij wszystkie otwarte komponenty
		onCloseOtherComponents()

		// Następnie wyślij zdarzenie zapisania odpowiedzi
		const saveEvent = new CustomEvent('saveResponses', {
			detail: { fromCategory: selectedCategory, toCategory: category },
		})
		window.dispatchEvent(saveEvent)

		// Ustaw wybraną kategorię
		setSelectedCategory(category)

		// Wymuś odświeżenie odpowiedzi przy zmianie kategorii
		loadResponses(`${category}?refresh=${new Date().getTime()}`)
	}

	// Funkcja obsługująca zarządzanie biblioteką
	const handleLibraryManagement = () => {
		if (typeof onManageLibrary === 'function') {
			onManageLibrary()
		} else {
			console.error('onManageLibrary is not a function:', onManageLibrary)
		}
	}

	const handleImportRecords = async () => {
		if (importLoading) return;
		
		if (confirm('Czy na pewno chcesz zaimportować rekordy z pliku records.json do bazy danych Firebase?')) {
			await importRecords();
		}
	}

	return (
		<div className="h-full w-80 bg-white border-r border-gray-200 flex flex-col">
			{/* Logo aplikacji */}
			<div className="p-2 flex justify-center border-b border-gray-200">
				<img src={logo} alt="UBB Logo" className="h-20" />
			</div>

			{/* Lista kategorii */}
			<div className="flex-1 overflow-auto px-4 py-5">
				<div className="mb-3">
					<h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider ml-2">Kategorie</h2>
				</div>
				<nav className="space-y-1.5">
					{categories.map(category => {
						const Icon = category.icon
						return (
							<button
								key={category.title}
								onClick={() => handleCategorySelect(category.title)}
								className={`w-full cursor-pointer flex items-start px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
									selectedCategory === category.title
										? 'bg-blue-100 text-blue-800 shadow-sm'
										: 'text-gray-700 hover:bg-gray-100'
								}`}>
								<Icon
									className={`mt-0.5 flex-shrink-0 mr-3 h-5 w-5 ${
										selectedCategory === category.title ? 'text-blue-600' : 'text-gray-500'
									}`}
								/>
								<span className="break-words text-left w-full">{category.title}</span>
							</button>
						)
					})}
				</nav>
			</div>

			{/* Sekcja dolna z przyciskami akcji i profilem użytkownika */}
			<div className="p-4 space-y-3 border-t border-gray-200 bg-gray-100">
				{/* Przyciski administracyjne */}
				{canEditQuestions && (
					<div className="space-y-2">
						<Button
							variant="outline"
							className="w-full cursor-pointer border-gray-300 text-gray-700 hover:bg-white hover:text-blue-700 transition-colors"
							onClick={onEditQuestions}>
							<Edit className="h-4 w-4 mr-2" />
							Edytuj pytania
						</Button>

						<Button
							variant="outline"
							className="w-full cursor-pointer border-gray-300 text-gray-700 hover:bg-white hover:text-blue-700 transition-colors"
							onClick={onManageUsers}>
							<Users className="h-4 w-4 mr-2" />
							Zarządzaj użytkownikami
						</Button>
						
						{isAdmin && (
							<Button
								variant="outline"
								className="w-full cursor-pointer border-gray-300 text-gray-700 hover:bg-white hover:text-blue-700 transition-colors"
								onClick={handleImportRecords}
								disabled={importLoading}>
								<Database className="h-4 w-4 mr-2" />
								{importLoading ? 'Importowanie...' : 'Importuj rekordy'}
							</Button>
						)}
					</div>
				)}

				{/* Przycisk zarządzania biblioteką */}
				{canManageLibrary && (
					<Button
						variant="outline"
						className="w-full cursor-pointer border-gray-300 text-gray-700 hover:bg-white hover:text-blue-700 transition-colors"
						onClick={handleLibraryManagement}>
						<BookOpen className="h-4 w-4 mr-2" />
						Ocena publikacji
					</Button>
				)}

				{/* Profil użytkownika z możliwością kliknięcia */}
				<div
					className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-blue-50 transition-colors"
					onClick={onViewProfile}>
					<div className="flex items-center space-x-3">
						<Avatar className="h-12 w-12 rounded-full overflow-hidden shadow-md border-2 border-blue-100 flex items-center justify-center">
							<AvatarImage src={userData.avatar} className="object-cover w-full h-full" />
							<AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 font-medium text-sm flex items-center justify-center w-full h-full">
								{userData.name
									.split(' ')
									.map(n => n[0])
									.join('')}
							</AvatarFallback>
						</Avatar>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-gray-900 truncate">{userData.name}</p>
							<p className="text-xs text-gray-500 truncate">{userData.email}</p>
						</div>
						{/* Przycisk wylogowania z zatrzymaniem propagacji kliknięcia */}
						<Button
							variant="ghost"
							size="icon"
							onClick={e => {
								e.stopPropagation()
								onLogout()
							}}
							className="h-8 w-8 cursor-pointer rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
							<LogOut className="h-4 w-4 text-gray-700" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
