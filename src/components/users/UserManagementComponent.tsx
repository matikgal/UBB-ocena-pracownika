import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../../firebase'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { X, User, Search } from 'lucide-react'
import { Input } from '../ui/input'
import { Separator } from '../ui/separator'
import UserResponsesList from './UserResponsesList'

export interface UserData {
  email: string
  name: string
  lastName?: string
  roles?: string[]
  responses?: number
}

export function UserManagementComponent({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const { hasRole } = useAuth()
  const hasAccess = hasRole('admin') || hasRole('dziekan')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    if (!hasAccess) return

    try {
      setLoading(true)
      const usersCollection = collection(db, 'Users')
      const userSnapshot = await getDocs(usersCollection)
      
      const usersData: UserData[] = []
      
      for (const userDoc of userSnapshot.docs) {
        const userData = userDoc.data() as UserData
        
        // Count responses for each user
        const responsesCollection = collection(db, 'Users', userDoc.id, 'responses')
        const responsesSnapshot = await getDocs(responsesCollection)
        
        usersData.push({
          email: userDoc.id,
          name: userData.name || 'Nieznany użytkownik',
          lastName: userData.lastName,
          roles: userData.roles || [],
          responses: responsesSnapshot.size
        })
      }
      
      setUsers(usersData)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Nie udało się pobrać listy użytkowników')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // If user doesn't have access, show access denied component
  if (!hasAccess) {
    return (
      <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Zarządzanie użytkownikami</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <User className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Brak dostępu</h3>
          <p className="text-gray-600 max-w-md">
            Tylko użytkownicy z rolą dziekana lub administratora mają dostęp do zarządzania użytkownikami.
          </p>
          <Button 
            onClick={onClose} 
            className="mt-6 bg-gray-100 text-gray-800 hover:bg-gray-200"
          >
            Powrót
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col mx-2 my-2 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Zarządzanie użytkownikami</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-md">
          {error}
        </div>
      )}

      {selectedUser ? (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              onClick={() => setSelectedUser(null)}
              className="text-gray-600"
            >
              &larr; Powrót do listy
            </Button>
            <div className="text-lg font-medium text-black">
              {selectedUser.name} ({selectedUser.email})
            </div>
          </div>
          <Separator className="mb-4" />
          <UserResponsesList userEmail={selectedUser.email} />
        </div>
      ) : (
        <>
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-black-400" />
            </div>
            <Input
              type="text"
              placeholder="Szukaj użytkownika..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-black"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500 flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                <span>Ładowanie użytkowników...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Nie znaleziono użytkowników
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.email}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-800">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {user.responses} odpowiedzi
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                          >
                            Szczegóły
                          </Button>
                        </div>
                      </div>
                      {user.roles && user.roles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.roles.map(role => (
                            <span 
                              key={role} 
                              className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}