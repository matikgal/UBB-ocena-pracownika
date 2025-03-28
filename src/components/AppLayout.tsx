import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useState } from 'react'
import AppHeader from './AppHeader'
import { AppSidebar } from './AppSideBar'
import QuestionsComponent from './QuestionsComponent'
import LoginComponent from './LoginComponent'

export default function AppLayout() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	// Define categories array to match the sidebar categories
	const categories = [
		'Publikacje dydaktyczne',
		'Podniesienie jakości nauczania',
		'Zajęcia w języku obcym, wykłady za granicą',
		'Pełnienie funkcji dydaktycznej (za każdy rok)',
		'Nagrody i wyróznienia',
	]

	const handleLogin = (email: string, password: string) => {
		// Here you would typically validate credentials with an API
		// For now, we'll just set logged in to true
		setIsLoggedIn(true)
	}

	const handleLogout = () => {
		setIsLoggedIn(false)
	}

	if (!isLoggedIn) {
		return <LoginComponent onLogin={handleLogin} />
	}

	return (
		<div className="h-screen overflow-hidden bg-gray-100">
			<div className="flex h-full">
				<Routes>
					<Route path="/" element={<Navigate to="/kategoria/publikacje-dydaktyczne" replace />} />
					<Route
						path="/kategoria/:categorySlug"
						element={<CategoryLayout categories={categories} onLogout={handleLogout} />}
					/>
				</Routes>
			</div>
		</div>
	)
}

// Helper function to convert category name to URL slug
function categoryToSlug(category: string): string {
	return category
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\-]+/g, '')
}

// The issue is in the slugToCategory function and the categories array

// Helper function to convert URL slug to category name
function slugToCategory(slug: string, categories: string[]): string {
  // Check for the specific case of "nagrody-i-wyroznienia"
  if (slug === 'nagrody-i-wyroznienia') {
    return 'Nagrody i wyróznienia';
  }
  
  return categories.find(category => categoryToSlug(category) === slug) || categories[0];
}

function CategoryLayout({ categories, onLogout }: { categories: string[]; onLogout: () => void }) {
	const { categorySlug } = useParams<{ categorySlug: string }>()
	const navigate = useNavigate()

	const selectedCategory = slugToCategory(categorySlug || '', categories)

	// Handle navigation between categories
	const handlePreviousCategory = () => {
		const currentIndex = categories.indexOf(selectedCategory)
		if (currentIndex > 0) {
			navigate(`/kategoria/${categoryToSlug(categories[currentIndex - 1])}`)
		}
	}

	const handleNextCategory = () => {
		const currentIndex = categories.indexOf(selectedCategory)
		if (currentIndex < categories.length - 1) {
			navigate(`/kategoria/${categoryToSlug(categories[currentIndex + 1])}`)
		}
	}

	const setSelectedCategory = (category: string) => {
		navigate(`/kategoria/${categoryToSlug(category)}`)
	}

	return (
		<>
			<AppSidebar
				setSelectedCategory={setSelectedCategory}
				selectedCategory={selectedCategory}
				onLogout={onLogout}
				userData={{ name: 'Jakub Gałosz', email: 'jakub.galosz@example.com' }}
			/>
			<div className="flex-1 flex flex-col ml-18 mr-2">
				<div className="mb-2">
					<AppHeader />
				</div>
				<main className="flex-1 overflow-hidden">
					<QuestionsComponent
						selectedCategory={selectedCategory}
						onPreviousCategory={handlePreviousCategory}
						onNextCategory={handleNextCategory}
						categories={categories}
					/>
				</main>
			</div>
		</>
	)
}
