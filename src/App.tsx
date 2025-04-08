
import LoginComponent from "./components/auth/LoginComponent"
import { EditQuestionsComponent } from "./components/editQuestions/EditQuestionsComponent"
import { AppSidebar } from "./components/layout/Sidebar"
import LibraryEvaluationComponent from "./components/library/LibraryEvaluationComponent"
import QuestionsComponent from "./components/questions/QuestionsComponent"
import { UserManagementComponent } from "./components/users/UserManagementComponent"
import { useAuth, AuthProvider } from "./contexts/AuthContext"
import { useUserResponses } from "./services/firebase/useUserResponses"
import Header from "./components/layout/Header" 
import { useState, useEffect } from "react"
import { Toaster } from "sonner"
import { ProfileComponent } from "./components/profile/ProfileComponent"
import { ProfileRoute } from "./components/profile/ProfileRoute"

function AppContent() {
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
	const [isEditingQuestions, setIsEditingQuestions] = useState<boolean>(false)
	const [isManagingUsers, setIsManagingUsers] = useState<boolean>(false)
	const [isManagingLibrary, setIsManagingLibrary] = useState<boolean>(false)
	const [isViewingProfile, setIsViewingProfile] = useState<boolean>(false)
	const { isAuthenticated, isLoading, logout, userData, hasRole } = useAuth()
	const { loadResponses } = useUserResponses()
	const canEditQuestions = hasRole('admin') || hasRole('dziekan')
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

	const handleViewProfile = () => {
		setIsViewingProfile(true)
		setIsManagingUsers(false)
		setIsEditingQuestions(false)
		setIsManagingLibrary(false)
	}

	const handleCloseProfile = () => {
		setIsViewingProfile(false)
	}

	// Add a function to close all other components
	const handleCloseOtherComponents = () => {
		setIsViewingProfile(false);
		setIsManagingUsers(false);
		setIsEditingQuestions(false);
		setIsManagingLibrary(false);
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
						onViewProfile={handleViewProfile}
						onCloseOtherComponents={handleCloseOtherComponents}  // Add this new prop
					/>
					<div className="flex-1 flex flex-col pl-1 ">
						<div className="mb-2">
							<Header onViewProfile={handleViewProfile} />
						</div>
						<main className="flex-1 overflow-hidden pb-4 px-2">
							{isEditingQuestions ? (
								<EditQuestionsComponent onClose={handleCloseEdit} onSave={handleSaveQuestions} />
							) : isManagingUsers ? (
								<UserManagementComponent onClose={handleCloseUserManagement} />
							) : isManagingLibrary ? (
								<LibraryEvaluationComponent onClose={() => setIsManagingLibrary(false)} />
							) : isViewingProfile ? (
								<ProfileComponent onClose={handleCloseProfile} />
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
