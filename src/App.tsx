import { BrowserRouter as Router } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import AppHeader from './components/AppHeader'
import QuestionsComponent from './components/QuestionsComponent'
import { useState } from 'react'
import { AppSidebar } from './components/AppSideBar'
import { SidebarProvider } from './components/ui/sidebar'
import LoginComponent from './components/LoginComponent'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('Publikacje dydaktyczne')
  const { isAuthenticated, isLoading, logout, userData, error } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginComponent error={error} />;
  }

  // Show main application if authenticated
  return (
    <div className="w-screen overflow-hidden max-h-screen bg-gray-200">
      <main>
        <div className="flex w-full ">
          <div className="">
            <SidebarProvider>
              <AppSidebar
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory} 
                onLogout={logout}
                userData={userData}
              />
            </SidebarProvider>
          </div>
          <div className="h-screen w-full">
            <AppHeader />
            <QuestionsComponent 
              selectedCategory={selectedCategory}
              onPreviousCategory={() => {
                // Get the current category index and set the previous one
                const categories = ['Publikacje dydaktyczne', 'Osiągnięcia dydaktyczne', 'Działalność organizacyjna'];
                const currentIndex = categories.indexOf(selectedCategory);
                const previousIndex = (currentIndex - 1 + categories.length) % categories.length;
                setSelectedCategory(categories[previousIndex]);
              }}
              onNextCategory={() => {
                // Get the current category index and set the next one
                const categories = ['Publikacje dydaktyczne', 'Osiągnięcia dydaktyczne', 'Działalność organizacyjna'];
                const currentIndex = categories.indexOf(selectedCategory);
                const nextIndex = (currentIndex + 1) % categories.length;
                setSelectedCategory(categories[nextIndex]);
              }}
              categories={['Publikacje dydaktyczne', 'Osiągnięcia dydaktyczne', 'Działalność organizacyjna']}
            />
          </div>
        </div>
      </main>
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
