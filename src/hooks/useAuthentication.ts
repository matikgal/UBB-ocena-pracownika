import { useState } from 'react'

interface AuthenticationHookResult {
  isLoggedIn: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

export function useAuthentication(): AuthenticationHookResult {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = (email: string, password: string) => {
    // Here you would typically validate credentials with an API
    // For now, we'll just set logged in to true
    setIsLoggedIn(true)
  }

  const logout = () => {
    setIsLoggedIn(false)
  }

  return {
    isLoggedIn,
    login,
    logout
  }
}