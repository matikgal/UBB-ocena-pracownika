import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'

export default function LoginComponent() {
  const { login } = useAuth() 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6 text-ubbprimary">System oceny pracowników</h1>
        <p className="text-gray-700 mb-8 text-lg">Uniwersytet Bielsko-Bialski</p>
        
       
        
        <Button 
          onClick={login} 
          className="w-full py-6 text-lg font-medium"
          size="lg"
        >
          Zaloguj się
        </Button>
      </div>
    </div>
  )
}