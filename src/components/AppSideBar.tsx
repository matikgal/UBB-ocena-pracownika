import { BookOpen, LogOut, Menu, Edit } from 'lucide-react'
import logo from '../assets/Logo.svg'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarProvider, // Add this import
} from '../components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'
import { useState } from 'react'

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
		title: 'Nagrody i wyróznienia', // Make sure this matches exactly what's in your categories array
		url: '#',
		icon: BookOpen,
		subcategories: nagrodyWyroznienia,
	},
]

// Update the UserData interface to match Keycloak data
interface UserData {
	name: string
	lastName?: string
	email: string
	avatar?: string
	username?: string
}

// Update the AppSidebarProps interface to include selectedCategory
interface AppSidebarProps {
	setSelectedCategory: (category: string) => void
	selectedCategory: string
	userData?: UserData
	onLogout?: () => void
	onEditQuestions?: () => void // Add this line
}

export function AppSidebar({
	setSelectedCategory,
	selectedCategory,
	userData = { name: 'Użytkownik', email: 'brak@email.com' },
	onLogout = () => {},
	onEditQuestions = () => {}, // Add default function
}: AppSidebarProps) {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				className="lg:hidden fixed top-4 left-4 z-50"
				onClick={() => setIsOpen(!isOpen)}>
				<Menu className="h-6 w-6" />
			</Button>
			<div
				className={`fixed lg:relative lg:block transition-transform duration-300 h-full ${
					isOpen ? 'translate-x-0' : '-translate-x-full'
				} lg:translate-x-0 z-40 w-64 shadow-lg`}>
				<SidebarProvider>
					<Sidebar className="h-full border-0">
						<SidebarContent className="bg-gray-200 flex flex-col w-full h-full">
							<SidebarGroup>
								<SidebarGroupContent>
									<SidebarMenu>
										<div>
											<img src={logo} alt="Godło" className="w-auto h-full object-cover" />
											<div className="mt-16 ml-2">
												<h2 className="text-2xl font-semibold text-ubbsecondary">Menu główne</h2>
												<p className="text-sm text-gray-500 mt-1">Wybierz kategorię do oceny</p>
											</div>
										</div>
										<div className="space-y-2 mt-6">
											{categories.map(category => {
												// Check if this category is the selected one
												const isSelected = category.title === selectedCategory

												return (
													<SidebarMenuItem key={category.title} className="group relative">
														<div
															className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ease-in-out cursor-pointer ${
																isSelected
																	? 'bg-white text-ubbprimary font-medium'
																	: 'text-gray-700 hover:text-ubbprimary hover:bg-white/80'
															}`}
															onClick={() => {
																setSelectedCategory(category.title)
																setIsOpen(false)
															}}>
															<div className="flex items-center space-x-3">
																<category.icon
																	className={`w-5 h-5 ${
																		isSelected ? 'text-ubbprimary' : 'text-gray-400 group-hover:text-ubbprimary'
																	} transition-colors duration-200`}
																/>
																<p className="text-sm font-medium">{category.title}</p>
															</div>
															{isSelected && (
																<div className="absolute right-4">
																	<svg
																		className="w-4 h-4 text-ubbprimary"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24">
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M9 5l7 7-7 7"
																		/>
																	</svg>
																</div>
															)}
															{!isSelected && (
																<div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
																	<svg
																		className="w-4 h-4 text-ubbprimary"
																		fill="none"
																		stroke="currentColor"
																		viewBox="0 0 24 24">
																		<path
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth={2}
																			d="M9 5l7 7-7 7"
																		/>
																	</svg>
																</div>
															)}
														</div>
													</SidebarMenuItem>
												)
											})}
										</div>
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>

							{/* Add Edit Questions Button */}
							<div className="px-4 mt-8">
								<Button
									onClick={onEditQuestions}
									className="w-full bg-ubbprimary hover:bg-ubbprimary/90 text-white flex items-center justify-center gap-2 py-2  cursor-pointer">
									<Edit className="h-4 w-4" />
									<span>Edytuj pytania</span>
								</Button>
							</div>

							<div className="mt-auto p-4">
								<UserTile userData={userData} onLogout={onLogout} />
							</div>
						</SidebarContent>
					</Sidebar>
				</SidebarProvider>
			</div>
		</>
	)
}

function UserTile({
	userData = { name: 'Użytkownik', email: 'brak@email.com' },
	onLogout = () => {},
}: {
	userData?: UserData
	onLogout?: () => void
}) {
	return (
		<div className="mt-auto p-4 bg-white rounded-lg shadow-lg border-none">
			<div className="flex items-center space-x-4">
				<Avatar className="h-12 w-12">
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
					<p className="text-sm text-gray-500 truncate">{userData.email}</p>
				</div>
				<Button variant="ghost" size="icon" onClick={onLogout} className="h-8 w-8 cursor-pointer">
					<LogOut className="h-4 w-4" />
				</Button>
			</div>
		</div>
	)
}
