import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import keycloak from '../lib/keycloak';
import initKeycloak from '../lib/keycloak';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData { // Define a more specific type for userData
  name: string;
  lastName: string;
  email: string;
  username: string;
  roles: string[]; // Add roles array
  avatar?: string; // Keep avatar optional
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  login: () => void;
  logout: () => void;
  userData: UserData | null; // Use the UserData type
  error: string | null;
  hasRole: (role: string) => boolean; // Add hasRole function signature
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [userData, setUserData] = useState<UserData | null>(null); // Use UserData type
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

          // Extract user data including roles
          const keycloakRoles = keycloak.tokenParsed?.realm_access?.roles || [];
          const profileData: UserData = { // Use UserData type
            name: keycloak.tokenParsed?.name || keycloak.tokenParsed?.given_name || '',
            lastName: keycloak.tokenParsed?.family_name || '',
            email: keycloak.tokenParsed?.email || '',
            username: keycloak.tokenParsed?.preferred_username || '',
            roles: keycloakRoles, // Store roles
            // avatar: keycloak.tokenParsed?.picture // If you have avatar in token
          };

          setUserData(profileData); // Set the full user data with roles

          // Save user data to Firestore if they don't exist yet
          await saveUserToFirestore(profileData); // Pass the full profileData

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
    const saveUserToFirestore = async (profileData: UserData) => { // Use UserData type
      try {
        // Use email as document ID since it's unique for each user
        const userEmail = profileData.email;
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
            ...profileData, // Save all profile data including roles
            createdAt: new Date(),
            lastLogin: new Date()
          });
          console.log('User added to Firestore');
        } else {
          // Optionally update lastLogin time and roles
          await setDoc(userDocRef, {
            lastLogin: new Date(),
            roles: profileData.roles // Ensure roles are updated on login
          }, { merge: true });
          console.log('User already exists, updated lastLogin and roles');
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

  // Implement the hasRole function
  const hasRole = useCallback((role: string): boolean => {
    return !!userData?.roles?.includes(role);
  }, [userData]); // Depend on userData

  return (
    // Add hasRole to the provider value
    <AuthContext.Provider value={{ isAuthenticated, isLoading, token, login, logout, userData, error, hasRole }}>
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