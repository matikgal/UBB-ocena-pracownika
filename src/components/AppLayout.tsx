import { useState } from 'react'
import AppHeader from './AppHeader'
import { AppSidebar } from './AppSideBar'
import QuestionsComponent from './QuestionsComponent'

export default function AppLayout() {
	const [selectedCategory, setSelectedCategory] = useState('Publikacje dydaktyczne')

	return (
		<div className="min-h-screen bg-gray-100">
			<AppHeader />
			<div className="flex">
				<AppSidebar setSelectedCategory={setSelectedCategory} />
				<main className="flex-1 lg:ml-72">
					<QuestionsComponent selectedCategory={selectedCategory} />
				</main>
			</div>
		</div>
	)
}
