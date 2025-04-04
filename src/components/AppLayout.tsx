import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthentication } from '../hooks/useAuthentication'
import LoginComponent from './auth/LoginComponent'
import CategoryLayout from './category/CategoryLayout'
import { categories } from '../utils/categoryUtils'

export default function AppLayout() {
	const { isLoggedIn, login, logout } = useAuthentication()

	if (!isLoggedIn) {
		return <LoginComponent onLogin={login} />
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
		</div>
	)
}
