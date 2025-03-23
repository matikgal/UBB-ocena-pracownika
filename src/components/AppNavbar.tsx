import { BookOpen, Home } from 'lucide-react'

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

export default function AppNavbar({ setSelectedCategory }: AppSidebarProps) {
	return (
		<div className="p-6 bg-ubbgray rounded-b-3xl shadow-md mx-auto min-h-full  overflow-hidden w-[20vw]">
			<h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b-2 border-ubbaccent">Kategorie</h2>
			<div className="">
				{items.map(item => (
					<div key={item.title} className="flex flex-col">
						{categories.map(category => (
							<div
								key={category.title}
								onClick={() => setSelectedCategory(category.title)}
								className="text-black text-wrap max-w-[16rem] m-2 hover:underline cursor-pointer font-semibold">
								{category.title}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
