import { useState } from 'react'

interface AuthenticationHookResult {
  isLoggedIn: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

export function useAuthentication(): AuthenticationHookResult {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const login = () => {
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