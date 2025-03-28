import { BrowserRouter as Router } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/QuestionsComponent'
import { useState } from 'react'
import { AppSidebar } from './components/AppSideBar'
import LoginComponent from './components/LoginComponent'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
	const { isAuthenticated, isLoading, logout, userData, error } = useAuth()

	// Define categories array to match the sidebar categories
	const categories = [
		'Publikacje dydaktyczne',
		'Podniesienie jakości nauczania',
		'Zajęcia w języku obcym, wykłady za granicą',
		'Pełnienie funkcji dydaktycznej (za każdy rok)',
		'Nagrody i wyróznienia',
	]

	// Show loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Ładowanie...</p>
			</div>
		)
	}

	// Show login screen if not authenticated
	if (!isAuthenticated) {
		return <LoginComponent error={error} />
	}

	// Handle navigation between categories
	const handlePreviousCategory = () => {
		const currentIndex = categories.indexOf(selectedCategory)
		if (currentIndex > 0) {
			setSelectedCategory(categories[currentIndex - 1])
		}
	}

	const handleNextCategory = () => {
		const currentIndex = categories.indexOf(selectedCategory)
		if (currentIndex < categories.length - 1) {
			setSelectedCategory(categories[currentIndex + 1])
		}
	}

	// Show main application if authenticated
	return (
		<div className="h-screen overflow-hidden bg-gray-100">
			<div className="flex h-full">
				<div className="flex w-full">
					<AppSidebar
						selectedCategory={selectedCategory}
						setSelectedCategory={setSelectedCategory}
						onLogout={logout}
						userData={userData}
					/>
					<div className="flex-1 flex flex-col pl-8 pr-2  ml-18">
						<div className="mb-2">
							<AppHeader />
						</div>
						<main className="flex-1 overflow-hidden pb-4">
							<QuestionsComponent
								selectedCategory={selectedCategory}
								onPreviousCategory={handlePreviousCategory}
								onNextCategory={handleNextCategory}
								categories={categories}
							/>
						</main>
					</div>
				</div>
			</div>
		</div>
	)
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</Router>
	)
}

export default App
