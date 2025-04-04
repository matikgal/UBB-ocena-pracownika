import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface DeanRouteProps {
  children: React.ReactNode;
}

export const DeanRoute: React.FC<DeanRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Check if user has dean role
  const isDean = hasRole('dziekan');
  
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
  
  // If user has dean role, render the children
  return <>{children}</>;
};