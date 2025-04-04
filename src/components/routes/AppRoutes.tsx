import { Routes, Route, Navigate } from 'react-router-dom'
import CategoryLayout from '../category/CategoryLayout'
import { categories } from '../../utils/categoryUtils'

interface AppRoutesProps {
  userData: any;
  onLogout: () => void;
}

export default function AppRoutes({ userData, onLogout }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/kategoria/publikacje-dydaktyczne" replace />} />
      <Route
        path="/kategoria/:categorySlug"
        element={<CategoryLayout categories={categories} onLogout={onLogout} userData={userData} />}
      />
    </Routes>
  )
}