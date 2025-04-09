import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface DeanRouteProps {
  children: React.ReactNode;
}

export const DeanRoute: React.FC<DeanRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  
  // Wyświetlanie stanu ładowania
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }
  
  // Przekierowanie do logowania jeśli użytkownik nie jest uwierzytelniony
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Sprawdzenie czy użytkownik ma rolę dziekana
  const isDean = hasRole('dziekan');
  
  // Wyświetlanie komunikatu o braku dostępu
  if (!isDean) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Brak dostępu</h2>
        <p className="text-gray-600">Tylko użytkownicy z rolą dziekana mają dostęp do tej strony.</p>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Wróć
        </button>
      </div>
    );
  }
  
  // Jeśli użytkownik ma rolę dziekana, renderuj komponenty potomne
  return <>{children}</>;
};