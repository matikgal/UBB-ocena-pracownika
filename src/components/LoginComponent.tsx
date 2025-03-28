import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import logo from '../assets/Logo.svg'

interface LoginProps {
  onLogin: (email: string, password: string) => void
  isLoading?: boolean
}

export default function LoginComponent({ onLogin, isLoading = false }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="UBB Logo" className="h-16 mb-4" />
          <h1 className="text-2xl font-bold text-ubbprimary">System oceny pracowników</h1>
          <p className="text-gray-600 mt-2">Uniwersytet Bielsko-Bialski</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="twoj@email.com"
              required
              className="w-full text-gray-900"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Hasło
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-gray-900"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-ubbprimary hover:bg-ubbprimary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Logowanie...' : 'Zaloguj się'}
          </Button>
        </form>
      </div>
    </div>
  )
}