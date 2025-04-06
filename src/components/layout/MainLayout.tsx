import LoginComponent from "../auth/LoginComponent"
import CategoryLayout from "../category/CategoryLayout"
import { useAuthentication } from "../../hooks/useAuthentication"
import { categories } from "../../utils/categoryUtils"
import { Route } from "react-router-dom"  
import { Routes, Navigate } from "react-router-dom"
import { Toaster } from "sonner"

export default function AppLayout() {
	const { isLoggedIn, logout } = useAuthentication()

	if (!isLoggedIn) {
		return <LoginComponent />
	}

	return (
		<div className="h-screen overflow-hidden bg-gray-100">
			<div className="flex h-full">
				<Routes>
					<Route path="/" element={<Navigate to="/kategoria/publikacje-dydaktyczne" replace />} />
					<Route
						path="/kategoria/:categorySlug"
						element={
							<CategoryLayout
								categories={categories}
								onLogout={logout}
								userData={{ name: 'User', email: 'user@example.com' }}
							/>
						}
					/>
				</Routes>
			</div>
			<Toaster />
		</div>
	)
}
