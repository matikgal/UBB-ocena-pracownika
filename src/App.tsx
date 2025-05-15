
import LoginComponent from "./components/auth/LoginComponent"
import { EditQuestionsComponent } from "./components/editQuestions/EditQuestionsComponent"
import { AppSidebar } from "./components/layout/Sidebar"
import LibraryEvaluationComponent from "./components/library/LibraryEvaluationComponent"
import QuestionsComponent from "./components/questions/QuestionsComponent"
import { UserManagementComponent } from "./components/users/UserManagementComponent"
import { useAuth, AuthProvider } from "./contexts/AuthContext"
import { useResponses } from "./services/firebase/responses/useResponses"
import Header from "./components/layout/Header" 
import { useState, useEffect } from "react"
import { Toaster } from "sonner"
import { ProfileComponent } from "./components/profile/ProfileComponent"


function AppContent() {
	// Inicjalizacja stanów aplikacji
	const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
	const [isEditingQuestions, setIsEditingQuestions] = useState<boolean>(false)
	const [isManagingUsers, setIsManagingUsers] = useState<boolean>(false)
	const [isManagingLibrary, setIsManagingLibrary] = useState<boolean>(false)
	const [isViewingProfile, setIsViewingProfile] = useState<boolean>(false)
	
	// Pobieranie funkcji i danych z kontekstu uwierzytelniania
	const { isAuthenticated, isLoading, logout, userData, hasRole } = useAuth()
	const { loadResponses } = useResponses()
	
	// Sprawdzanie uprawnień użytkownika
	const canEditQuestions = hasRole('admin') || hasRole('dziekan')

	// Lista dostępnych kategorii
	const categories = [
		'Publikacje dydaktyczne',
		'Podniesienie jakości nauczania',
		'Zajęcia w języku obcym, wykłady za granicą',
		'Pełnienie funkcji dydaktycznej (za każdy rok)',
		'Nagrody i wyróznienia',
	]

	// Ładowanie odpowiedzi przy zmianie kategorii
	useEffect(() => {
		if (isAuthenticated && userData?.email && !isEditingQuestions && !isManagingUsers && !isManagingLibrary) {
			loadResponses(`${selectedCategory}?refresh=${new Date().getTime()}`)
		}
	}, [selectedCategory, isAuthenticated, userData?.email, isEditingQuestions, isManagingUsers, isManagingLibrary])

	// Wyświetlanie stanu ładowania
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Ładowanie...</p>
			</div>
		)
	}

	// Wyświetlanie ekranu logowania jeśli użytkownik nie jest uwierzytelniony
	if (!isAuthenticated) {
		return <LoginComponent />
	}

	// Obsługa nawigacji między kategoriami
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
		if (canEditQuestions) {
			setIsEditingQuestions(true)
			setIsManagingUsers(false)
			setIsManagingLibrary(false)
		}
	}

	const handleManageUsers = () => {
		if (canEditQuestions) {
			setIsManagingUsers(true)
			setIsEditingQuestions(false)
			setIsManagingLibrary(false)
		}
	}

	const handleManageLibrary = () => {
		
		console.log('Setting isManagingLibrary to true')
		setIsManagingLibrary(true)
		setIsManagingUsers(false)
		setIsEditingQuestions(false)
	}

	// Funkcje zamykające poszczególne widoki
	const handleCloseEdit = () => {
		setIsEditingQuestions(false)
	}

	const handleCloseUserManagement = () => {
		setIsManagingUsers(false)
	}


	const handleSaveQuestions = (updatedQuestions: any) => {
		console.log('Updated questions:', updatedQuestions)
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

	// Funkcja zamykająca wszystkie komponenty
	const handleCloseOtherComponents = () => {
		setIsViewingProfile(false);
		setIsManagingUsers(false);
		setIsEditingQuestions(false);
		setIsManagingLibrary(false);
	}

	// Główny układ aplikacji
	return (
		<div className="h-screen overflow-hidden bg-gray-100">
			<div className="flex h-full">
				<div className="flex w-full">
					{/* Pasek boczny aplikacji */}
					<AppSidebar
						selectedCategory={selectedCategory}
						setSelectedCategory={setSelectedCategory}
						onLogout={logout}
						userData={userData || undefined}
						onEditQuestions={handleEditQuestions}
						onManageUsers={handleManageUsers}
						onManageLibrary={handleManageLibrary}
						onViewProfile={handleViewProfile}
						onCloseOtherComponents={handleCloseOtherComponents}
					/>
					<div className="flex-1 flex flex-col pl-1 ">
						{/* Nagłówek aplikacji */}
						<div className="mb-2">
							<Header onViewProfile={handleViewProfile} />
						</div>
						{/* Główna zawartość aplikacji */}
						<main className="flex-1 overflow-hidden pb-4 px-2">
							{/* Warunkowe renderowanie komponentów w zależności od wybranego widoku */}
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
			{/* Komponent wyświetlający powiadomienia */}
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
