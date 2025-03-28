import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/QuestionsComponent'
import { useState } from 'react'
import { AppSidebar } from './components/AppSideBar'
import { SidebarProvider } from './components/ui/sidebar'
import LoginComponent from './components/LoginComponent'

function App() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	const handleLogin = (email: string, password: string) => {
		// For now, just navigate to main page without actual authentication
		console.log('Login attempt with:', email, password)
		setIsLoggedIn(true)
	}

	// Show login screen if not logged in
	if (!isLoggedIn) {
		return <LoginComponent onLogin={handleLogin} />
	}

	// Show main application if logged in
	return (
		<div className="w-screen overflow-hidden max-h-screen bg-gray-200">
			<main>
				<div className="flex w-full ">
					<div className="">
						{/* <AppNavbar setSelectedCategory={setSelectedCategory} /> */}
						<SidebarProvider>
							<AppSidebar 
								setSelectedCategory={setSelectedCategory} 
								onLogout={() => setIsLoggedIn(false)}
							/>
						</SidebarProvider>
					</div>
					<div className="h-screen w-full">
						<AppHeader />
						<QuestionsComponent 
							selectedCategory={selectedCategory}
							onPreviousCategory={() => {/* Add previous category logic */}}
							onNextCategory={() => {/* Add next category logic */}}
							categories={[/* Add your categories array here */]}
						/>
					</div>
				</div>
			</main>
		</div>
	)
}

export default App
