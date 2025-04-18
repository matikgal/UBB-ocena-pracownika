// src/components/layout/Header.tsx
import { useAuth } from '../../contexts/AuthContext'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

interface HeaderProps {
  onViewProfile?: () => void
}

export default function Header({ onViewProfile }: HeaderProps) {
  const { userData } = useAuth()
  return (
    <div className="w-full">
      <div className="bg-ubbprimary h-24 overflow-hidden flex items-center justify-between rounded-b-lg mx-2 shadow-lg">
        <div className="ml-4 lg:ml-8">
          <h2 className="text-xl lg:text-3xl font-semibold text-white">System oceny pracowników</h2>
          <p className="text-white/80 text-xs lg:text-sm mt-1">Uniwersytet Bielsko-Bialski</p>
        </div>
        <div className="flex items-center space-x-4 lg:space-x-6 mr-4 lg:mr-8">
          <div 
            className="text-right hidden sm:block cursor-pointer hover:text-white/90 transition-colors"
            onClick={onViewProfile}
          >
            <p className="text-sm font-medium text-white">{userData?.name || 'Użytkownik'}</p>
            <p className="text-xs text-white/70">{userData?.email || 'brak@email.com'}</p>
          </div>
          <Avatar 
            className="h-10 w-10 lg:h-12 lg:w-12 border-2 border-white/20 cursor-pointer"
            onClick={onViewProfile}
          >
            <AvatarImage src={userData?.avatar} />
            <AvatarFallback className="bg-white/10 text-white">
              {userData?.name
                ? userData.name
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
