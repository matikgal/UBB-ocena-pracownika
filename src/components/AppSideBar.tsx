import { BookOpen, LogOut, Edit, Users } from 'lucide-react'
import logo from '../assets/Logo.svg'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarProvider,
} from '../components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { useState } from 'react'
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
	const { hasRole } = useAuth();
	const canEditQuestions = hasRole('admin') || hasRole('dziekan');
	const canManageLibrary = hasRole('admin') || hasRole('biblioteka') || hasRole('library');
	
	console.log('User has library access:', canManageLibrary, 'Admin:', hasRole('admin'), 'Biblioteka:', hasRole('biblioteka'), 'Library:', hasRole('library'));

	// Function to handle library management
	const handleLibraryManagement = () => {
		console.log('Library management button clicked');
		// Force the function call even if it's undefined
		if (typeof onManageLibrary === 'function') {
			onManageLibrary();
		} else {
			console.error('onManageLibrary is not a function:', onManageLibrary);
		}
	};

	return (
		<div className="w-72 h-full bg-white border-r border-gray-200 flex flex-col">
			<div className="p-4 flex justify-center">
				<img src={logo} alt="UBB Logo" className="h-12" />
			</div>
			
			<div className="flex-1 overflow-auto">
				<div className="px-3 py-2"> 
					<h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategorie</h2>
					<nav className="mt-2 space-y-1">
						{categories.map((category) => {
							const Icon = category.icon;
							return (
								<button
									key={category.title}
									onClick={() => setSelectedCategory(category.title)}
									className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
										selectedCategory === category.title
											? 'bg-blue-50 text-blue-700'
											: 'text-gray-700 hover:bg-gray-100'
									}`}
								>
									<Icon className="mr-3 h-5 w-5 text-gray-500" />
									<span className="truncate">{category.title}</span>
								</button>
							);
						})}
					</nav>
				</div>
			</div>
			
			<div className="p-4 space-y-3 border-t border-gray-200">
				{/* Admin actions */}
				{canEditQuestions && (
					<>
						<Button
							variant="outline"
							className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
							onClick={onEditQuestions}>
							<Edit className="h-4 w-4 mr-2" />
							Edytuj pytania
						</Button>
						
						<Button
							variant="outline"
							className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
							onClick={onManageUsers}>
							<Users className="h-4 w-4 mr-2" />
							Zarządzaj użytkownikami
						</Button>
					</>
				)}
				
				{/* Library management button */}
				{canManageLibrary && (
					<Button
						variant="outline"
						className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
						onClick={handleLibraryManagement}>
						<BookOpen className="h-4 w-4 mr-2" />
						Ocena publikacji
					</Button>
				)}
				
				{/* User profile */}
				<div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
					<div className="flex items-center space-x-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={userData.avatar} />
							<AvatarFallback>
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
						<Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8">
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
