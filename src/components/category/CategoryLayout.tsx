import { useParams, useNavigate } from 'react-router-dom'
import CategoryContent from './CategoryContent.tsx'
import { categoryToSlug, slugToCategory } from '../../utils/categoryUtils'
import { AppSidebar } from '../../components/layout/Sidebar.tsx'
import Header from '../../components/layout/Header.tsx'

interface CategoryLayoutProps {
  categories: string[];
  onLogout: () => void;
  userData: any;
}

export default function CategoryLayout({ categories, onLogout, userData }: CategoryLayoutProps) {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const navigate = useNavigate()

  const selectedCategory = slugToCategory(categorySlug || '', categories)

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

  const handleViewProfile = () => {
    navigate('/profil')
  }

  // Add a function to close other components
  const handleCloseOtherComponents = () => {
  // If you have state for other components in this file, reset them here
  // For example, if you had profile viewing state:
  // setIsViewingProfile(false);
  }

  return (
    <div className="flex w-full">
      <AppSidebar
        onViewProfile={handleViewProfile}
        setSelectedCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        onLogout={onLogout}
        userData={userData}
        onCloseOtherComponents={handleCloseOtherComponents}  // Add this new prop
      />
      <div className="flex-1 flex flex-col pl-8 pr-4 pt-2">
        <div className="mb-4">
          <Header />
        </div>
        <main className="flex-1 overflow-hidden pb-4">
          <CategoryContent
            selectedCategory={selectedCategory}
            onPreviousCategory={handlePreviousCategory}
            onNextCategory={handleNextCategory}
            categories={categories}
          />
        </main>
      </div>
    </div>
  )
}