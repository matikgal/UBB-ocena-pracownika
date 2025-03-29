import { useState } from 'react'
import { Button } from './ui/button'
import logo from '../assets/Logo.svg'
import { useAuth } from '../contexts/AuthContext'

interface LoginProps {
  error?: string | null;
}

export default function LoginComponent({ error: propError }: LoginProps) {
  const { login, isLoading, error: authError } = useAuth();
  
  // Use error from props or from auth context
  const error = propError || authError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="UBB Logo" className="h-16 mb-4" />
          <h1 className="text-2xl font-bold text-ubbprimary">System oceny pracowników</h1>
          <p className="text-gray-600 mt-2">Uniwersytet Bielsko-Bialski</p>
        </div>

        <div className="space-y-6">
         
          
          <Button
            onClick={login}
            className="w-full bg-ubbprimary hover:bg-ubbprimary/90 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Ładowanie...' : 'Zaloguj się przez Keycloak'}
          </Button>
        </div>
      </div>
    </div>
  )
}