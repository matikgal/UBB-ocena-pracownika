import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import keycloak from '../lib/keycloak';
import initKeycloak from '../lib/keycloak';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Definicja typów dla kontekstu uwierzytelniania
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  userData: any;
  error: string | null;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Inicjalizacja stanów kontekstu
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Funkcja inicjalizująca Keycloak
    const setupKeycloak = async () => {
      try {
        setError(null);
        
        // Inicjalizacja klienta Keycloak
        await initKeycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          checkLoginIframe: false
        });
        
        setIsAuthenticated(keycloak.authenticated ?? false);
        
        if (keycloak.authenticated) {
          setToken(keycloak.token);
          
          // Wyodrębnienie danych użytkownika z tokenu Keycloak
          const userData = {
            name: keycloak.tokenParsed?.name || keycloak.tokenParsed?.given_name || '',
            lastName: keycloak.tokenParsed?.family_name || '',
            email: keycloak.tokenParsed?.email || '',
            username: keycloak.tokenParsed?.preferred_username || '',
            roles: keycloak.tokenParsed?.realm_access?.roles || [],
          };
          
          console.log('Extracted user data:', userData);
          
          setUserData(userData);
          
          // Zapisanie danych użytkownika w Firestore
          await saveUserToFirestore(userData);
          
          // Konfiguracja odświeżania tokenu
          keycloak.onTokenExpired = () => {
            keycloak.updateToken(30).catch(() => {
              setIsAuthenticated(false);
            });
          };
        }
      } catch (err) {
        setError('Nie można połączyć się z serwerem uwierzytelniania. Sprawdź konfigurację Keycloak.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Funkcja zapisująca dane użytkownika do Firestore
    const saveUserToFirestore = async (userData: any) => {
      try {
        const userEmail = userData.email;
        if (!userEmail) {
          console.error('No email found in user data');
          return;
        }
        
        // Sprawdzenie czy użytkownik już istnieje w bazie
        const userDocRef = doc(db, 'Users', userEmail);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Tworzenie nowego dokumentu użytkownika
          await setDoc(userDocRef, {
            ...userData,
            createdAt: new Date(),
            lastLogin: new Date()
          });
          console.log('User added to Firestore');
        } else {
          // Aktualizacja istniejącego dokumentu
          await setDoc(userDocRef, {
            lastLogin: new Date()
          }, { merge: true });
          console.log('User already exists, updated lastLogin');
        }
      } catch (error) {
        console.error('Error saving user to Firestore:', error);
      }
    };
    
    setupKeycloak();
  }, []);

  // Funkcja logowania użytkownika
  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin
    });
  };

  // Funkcja wylogowania użytkownika
  const logout = () => {
    setIsAuthenticated(false);
    setToken(undefined);
    setUserData(null);
    keycloak.logout({ redirectUri: window.location.origin });
  };

  // Funkcja sprawdzająca czy użytkownik ma określoną rolę
  const hasRole = (role: string): boolean => {
    if (!userData || !userData.roles) {
      return false;
    }
    return userData.roles.includes(role);
  };

  // Dostarczenie kontekstu uwierzytelniania do komponentów potomnych
  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      token, 
      login, 
      logout, 
      userData, 
      error,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook umożliwiający korzystanie z kontekstu uwierzytelniania
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};