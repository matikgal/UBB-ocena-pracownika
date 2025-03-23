// AppSidebar.tsx
import { BookOpen, Home } from 'lucide-react'
import logo from '../assets/Logo.svg'
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
} from '../components/ui/sidebar'

// Define the shape of a menu item
interface MenuItem {
	title: string
	url: string
	icon: React.ElementType
}

// Menu items
const items: MenuItem[] = [
	{
		title: 'Ocena',
		url: '#',
		icon: Home,
	},
]

const categories: MenuItem[] = [
	{ title: 'Publikacje dykaktyczne', url: '#', icon: BookOpen },
	{ title: 'Podniesienie jakości nauczania', url: '#', icon: BookOpen },
	{
		title: 'Zajęcia w języku obcym, wykłady za granicą',
		url: '#',
		icon: BookOpen,
	},
	{
		title: 'Pełnienie funkcji dydaktycznej (za każdy rok)',
		url: '#',
		icon: BookOpen,
	},
	{ title: 'Nagrody i wyróznienia', url: '#', icon: BookOpen },
]

interface AppSidebarProps {
	setSelectedCategory: (category: string) => void
}

export function AppSidebar({ setSelectedCategory }: AppSidebarProps) {
	return (
		<Sidebar className="">
			<SidebarContent className="bg-gray-200">
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<div>
								<img src={logo} alt="Godło" className="w-auto h-full object-cover" />
								<h2 className="font-bold text-2xl text-ubbsecondary mt-16 ml-2 border-b-2 border-white w-3/4">
									Kategorie
								</h2>
							</div>
							{items.map(item => (
								<SidebarMenuItem key={item.title} className="mt-4">
									{categories.map(category => (
										<div
											key={category.title}
											onClick={() => setSelectedCategory(category.title)}
											className="text-gray-700 text-sm px-4 py-2 hover:bg-gray-300 hover:text-gray-900 cursor-pointer rounded-md transition-all duration-200">
											{category.title}
										</div>
									))}
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	)
}
