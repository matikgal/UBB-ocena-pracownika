<<<<<<< Updated upstream
import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/QuestionsComponent'
import { useState } from 'react'
import { AppSidebar } from './components/AppSideBar'
import { SidebarProvider } from './components/ui/sidebar'

function App() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
	return (
		<div className="w-screen overflow-hidden max-h-screen bg-gray-200">
			<main>
				<div className="flex w-full ">
					<div className="">
						{/* <AppNavbar setSelectedCategory={setSelectedCategory} /> */}
						<SidebarProvider>
							<AppSidebar setSelectedCategory={setSelectedCategory} />
						</SidebarProvider>
					</div>
					<div className="h-screen w-full">
						<AppHeader />
						<QuestionsComponent selectedCategory={selectedCategory} />
					</div>
				</div>
			</main>
		</div>
=======
import { SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { AppSidebar } from './components/AppSideBar'
import AppHeader from './components/AppHeader'

function App() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="w-screen">
				<AppHeader />
				<SidebarTrigger />
			</main>
		</SidebarProvider>
>>>>>>> Stashed changes
	)
}

export default App
