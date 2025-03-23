import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/QuestionsComponent'
import { useState } from 'react'
import AppNavbar from './components/AppNavbar'
import { AppSidebar } from './components/AppSideBar'
import { SidebarProvider } from './components/ui/sidebar'

function App() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dykaktyczne')
	return (
		<div className="w-screen overflow-hidden max-h-screen">
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
	)
}

export default App
