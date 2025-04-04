import { BrowserRouter as Router } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/questions/QuestionsComponent'
import { useState } from 'react'
import { AppSidebar } from './components/AppSideBar'
import LoginComponent from './components/auth/LoginComponent'  // Updated import path
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { EditQuestionsComponent } from './components/EditQuestionsComponent'
import { UserManagementComponent } from './components/users/UserManagementComponent'

function AppContent() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
	const [isEditingQuestions, setIsEditingQuestions] = useState<boolean>(false)
	const [isManagingUsers, setIsManagingUsers] = useState<boolean>(false)
	const { isAuthenticated, isLoading, logout, userData, hasRole } = useAuth()
	const canEditQuestions = hasRole('admin') || hasRole('dziekan')

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
		return <LoginComponent />
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

	const handleEditQuestions = () => {
		// Only allow users with appropriate roles to edit questions
		if (canEditQuestions) {
			setIsEditingQuestions(true)
			setIsManagingUsers(false)
		}
	}

	const handleManageUsers = () => {
		// Only allow users with appropriate roles to manage users
		if (canEditQuestions) {
			setIsManagingUsers(true)
			setIsEditingQuestions(false)
		}
	}

	const handleCloseEdit = () => {
		setIsEditingQuestions(false)
	}

	const handleCloseUserManagement = () => {
		setIsManagingUsers(false)
	}

	const handleSaveQuestions = (updatedQuestions: any) => {
		// Here you would typically save the updated questions to your backend
		console.log('Updated questions:', updatedQuestions)
		// You might need to update your state or refresh data from the server
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
						onEditQuestions={handleEditQuestions}
						onManageUsers={handleManageUsers}
					/>
					<div className="flex-1 flex flex-col pl-8 pr-2 ml-18">
						<div className="mb-2">
							<AppHeader />
						</div>
						<main className="flex-1 overflow-hidden pb-4">
							{isEditingQuestions ? (
								<EditQuestionsComponent 
									onClose={handleCloseEdit}
									onSave={handleSaveQuestions}
								/>
							) : isManagingUsers ? (
								<UserManagementComponent 
									onClose={handleCloseUserManagement}
								/>
							) : (
								<QuestionsComponent
									selectedCategory={selectedCategory}
									onPreviousCategory={handlePreviousCategory}
									onNextCategory={handleNextCategory}
									categories={categories}
								/>
							)}
						</main>
					</div>
				</div>
			</div>
		</div>
	)
}

function App() {
	return (
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	)
}

export default App
