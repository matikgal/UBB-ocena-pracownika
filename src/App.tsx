import { BrowserRouter as Router } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/questions/QuestionsComponent'
import { useState, useEffect } from 'react'
import { AppSidebar } from './components/AppSideBar'
import LoginComponent from './components/auth/LoginComponent'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { EditQuestionsComponent } from './components/EditQuestionsComponent'
import { UserManagementComponent } from './components/users/UserManagementComponent'
import LibraryEvaluationComponent from './components/library/LibraryEvaluationComponent'
import { Toaster } from 'sonner'
import { useUserResponses } from './hooks/useUserResponses'

function AppContent() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
	const [isEditingQuestions, setIsEditingQuestions] = useState<boolean>(false)
	const [isManagingUsers, setIsManagingUsers] = useState<boolean>(false)
	const [isManagingLibrary, setIsManagingLibrary] = useState<boolean>(false)
	const { isAuthenticated, isLoading, logout, userData, hasRole } = useAuth()
	const { loadResponses } = useUserResponses()
	const canEditQuestions = hasRole('admin') || hasRole('dziekan')
	// Update this line to match the role name in the database
	const canManageLibrary = hasRole('admin') || hasRole('library') || hasRole('biblioteka')

	// Define categories array to match the sidebar categories
	const categories = [
		'Publikacje dydaktyczne',
		'Podniesienie jakości nauczania',
		'Zajęcia w języku obcym, wykłady za granicą',
		'Pełnienie funkcji dydaktycznej (za każdy rok)',
		'Nagrody i wyróznienia',
	]

	// Load responses when category changes
	useEffect(() => {
		if (isAuthenticated && userData?.email && !isEditingQuestions && !isManagingUsers && !isManagingLibrary) {
			// Force refresh by adding a timestamp parameter
			loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`)
		}
	}, [selectedCategory, isAuthenticated, userData?.email, isEditingQuestions, isManagingUsers, isManagingLibrary])

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
			setIsManagingLibrary(false)
		}
	}

	const handleManageUsers = () => {
		// Only allow users with appropriate roles to manage users
		if (canEditQuestions) {
			setIsManagingUsers(true)
			setIsEditingQuestions(false)
			setIsManagingLibrary(false)
		}
	}

	const handleManageLibrary = () => {
		// Only allow users with appropriate roles to manage library evaluations
		// Update this condition to match the role check above
		if (canManageLibrary) {
			console.log('Setting isManagingLibrary to true')
			setIsManagingLibrary(true)
			setIsManagingUsers(false)
			setIsEditingQuestions(false)
		} else {
			console.log('User does not have library access')
		}
	}

	const handleCloseEdit = () => {
		setIsEditingQuestions(false)
	}

	const handleCloseUserManagement = () => {
		setIsManagingUsers(false)
	}

	const handleCloseLibraryManagement = () => {
		setIsManagingLibrary(false)
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
						onManageLibrary={handleManageLibrary}
					/>
					<div className="flex-1 flex flex-col pl-1 ">
						<div className="mb-2">
							<AppHeader />
						</div>
						<main className="flex-1 overflow-hidden pb-4 px-2">
							{isEditingQuestions ? (
								<EditQuestionsComponent onClose={handleCloseEdit} onSave={handleSaveQuestions} />
							) : isManagingUsers ? (
								<UserManagementComponent onClose={handleCloseUserManagement} />
							) : isManagingLibrary ? (
								<LibraryEvaluationComponent />
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
			<Toaster position="top-right" />
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
