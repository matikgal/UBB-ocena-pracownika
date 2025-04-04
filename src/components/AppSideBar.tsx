import { BookOpen, LogOut, Edit, Users } from 'lucide-react'
import logo from '../assets/Logo.svg'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'

import {
	publikacjeDydaktyczne,
	podniesienieJakosciNauczania,
	zajeciaJezykObcy,
	funkcjeDydaktyczne,
	nagrodyWyroznienia,
} from '../lib/questions'

interface MenuItem {
	title: string
	url: string
	icon: React.ElementType
	subcategories: Array<{ id: string; title: string; points: number | string; tooltip: string[] }>
}

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
}

export function AppSidebar({
	setSelectedCategory,
	selectedCategory,
	userData = { name: 'Użytkownik', email: 'brak@email.com' },
	onLogout = () => {},
	onEditQuestions = () => {},
	onManageUsers = () => {},
	onManageLibrary = () => {},
}: AppSidebarProps) {
	const { hasRole } = useAuth()
	const canEditQuestions = hasRole('admin') || hasRole('dziekan')
	const canManageLibrary = hasRole('admin') || hasRole('biblioteka') || hasRole('library')

	console.log(
		'User has library access:',
		canManageLibrary,
		'Admin:',
		hasRole('admin'),
		'Biblioteka:',
		hasRole('biblioteka'),
		'Library:',
		hasRole('library')
	)

	// Function to handle library management
	const handleLibraryManagement = () => {
		console.log('Library management button clicked')
		// Force the function call even if it's undefined
		if (typeof onManageLibrary === 'function') {
			onManageLibrary()
		} else {
			console.error('onManageLibrary is not a function:', onManageLibrary)
		}
	}

	return (
		<div className="w-80 h-full bg-gray-50 border-r border-gray-200 flex flex-col shadow-sm">
			<div className="p-2 flex justify-center border-b border-gray-200">
				<img src={logo} alt="UBB Logo" className="h-20" />
			</div>

			<div className="flex-1 overflow-auto px-4 py-5">
				<h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3 ml-2">Kategorie</h2>
				<nav className="space-y-1.5">
					{categories.map(category => {
						const Icon = category.icon
						return (
							<button
								key={category.title}
								onClick={() => setSelectedCategory(category.title)}
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

			<div className="p-4 space-y-3 border-t border-gray-200 bg-gray-100">
				{/* Admin actions */}
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
					</div>
				)}

				{/* Library management button */}
				{canManageLibrary && (
					<Button
						variant="outline"
						className="w-full cursor-pointer border-gray-300 text-gray-700 hover:bg-white hover:text-blue-700 transition-colors"
						onClick={handleLibraryManagement}>
						<BookOpen className="h-4 w-4 mr-2" />
						Ocena publikacji
					</Button>
				)}

				{/* User profile */}
				<div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
					<div className="flex items-center space-x-3">
						<Avatar className="h-10 w-10 border-2 border-gray-100">
							<AvatarImage src={userData.avatar} />
							<AvatarFallback className="bg-blue-100 text-blue-800">
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
						<Button
							variant="ghost"
							size="icon"
							onClick={onLogout}
							className="h-8 w-8 cursor-pointer rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
							<LogOut className="h-4 w-4 text-gray-700" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
