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
            // Include any other fields you need
          };
          
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
    
    // Add this new function to save user data to Firestore
    const saveUserToFirestore = async (userData: any) => {
      try {
        // Use email as document ID since it's unique for each user
        const userEmail = userData.email;
        if (!userEmail) {
          console.error('No email found in user data');
          return;
        }
        
        // Check if user already exists in Firestore
        const userDocRef = doc(db, 'Users', userEmail);
        const userDoc = await getDoc(userDocRef);
        
        // Only create/update if user doesn't exist
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            ...userData,
            createdAt: new Date(),
            lastLogin: new Date()
          });
          console.log('User added to Firestore');
        } else {
          // Optionally update lastLogin time
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token, login, logout, userData, error }}>
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