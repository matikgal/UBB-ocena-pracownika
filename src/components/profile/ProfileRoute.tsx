import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProfileRouteProps {
  children: React.ReactNode;
}

export const ProfileRoute: React.FC<ProfileRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Wyświetlanie stanu ładowania
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }
  
  // Przekierowanie do strony logowania jeśli użytkownik nie jest uwierzytelniony
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Jeśli użytkownik jest uwierzytelniony, renderuj komponenty potomne
  return <>{children}</>;
};