import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import keycloak from '../lib/keycloak';
import initKeycloak from '../lib/keycloak';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  userData: any;
  error: string | null;
  hasRole: (role: string) => boolean; // Add this line
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupKeycloak = async () => {
      try {
        setError(null);
        
        await initKeycloak.init({
          onLoad: 'check-sso',
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          pkceMethod: 'S256',
          checkLoginIframe: false
        });
        
        setIsAuthenticated(keycloak.authenticated ?? false);
        
        if (keycloak.authenticated) {
          setToken(keycloak.token);
          
          // Extract user data from Keycloak token
          const userData = {
            name: keycloak.tokenParsed?.name || keycloak.tokenParsed?.given_name || '',
            lastName: keycloak.tokenParsed?.family_name || '',
            email: keycloak.tokenParsed?.email || '',
            username: keycloak.tokenParsed?.preferred_username || '',
            roles: keycloak.tokenParsed?.realm_access?.roles || [], // Extract roles
          };
          
          console.log('Extracted user data:', userData); // Log user data
          
          setUserData(userData);
          
          // Save user data to Firestore if they don't exist yet
          await saveUserToFirestore(userData);
          
          // Set up token refresh
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
    
    const saveUserToFirestore = async (userData: any) => {
      try {
        const userEmail = userData.email;
        if (!userEmail) {
          console.error('No email found in user data');
          return;
        }
        
        const userDocRef = doc(db, 'Users', userEmail);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            ...userData,
            createdAt: new Date(),
            lastLogin: new Date()
          });
          console.log('User added to Firestore');
        } else {
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

  const login = () => {
    keycloak.login({
      redirectUri: window.location.origin
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(undefined);
    setUserData(null);
    keycloak.logout({ redirectUri: window.location.origin });
  };

  // Add this function to check if user has a specific role
  const hasRole = (role: string): boolean => {
    if (!userData || !userData.roles) {
      return false;
    }
    return userData.roles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      token, 
      login, 
      logout, 
      userData, 
      error,
      hasRole // Add this to the context value
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};