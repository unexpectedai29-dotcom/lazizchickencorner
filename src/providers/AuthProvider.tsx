import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  authActions, 
  isFirebaseSandbox, 
  auth, 
  dbService 
} from '../firebase';
import { setPersistence, browserLocalPersistence } from 'firebase/auth';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, displayName?: string, phoneNumber?: string) => Promise<any>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup' | 'phone';
  openAuthModal: (mode?: 'login' | 'signup' | 'phone') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(() => {
    try {
      if (isFirebaseSandbox) {
        const stored = localStorage.getItem('laziz_sandbox_user');
        return stored ? JSON.parse(stored) : null;
      } else {
        const cached = localStorage.getItem('laziz_last_known_user');
        return cached ? JSON.parse(cached) : null;
      }
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      if (isFirebaseSandbox) {
        const stored = localStorage.getItem('laziz_sandbox_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed?.email ? dbService.isAdminEmail(parsed.email) : false;
        }
        return false;
      } else {
        return localStorage.getItem('laziz_last_known_is_admin') === 'true';
      }
    } catch {
      return false;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'phone'>('login');

  // Configure Firebase persistence on startup
  useEffect(() => {
    if (!isFirebaseSandbox && auth) {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log("Firebase persistent session initialized successfully in local storage.");
        })
        .catch((error) => {
          console.error("Firebase persistence error during launch configuration:", error);
        });
    }
  }, []);

  // Listen to Auth state changes
  useEffect(() => {
    const unsubscribe = authActions.subscribeToAuth((currentUser) => {
      setUser(currentUser);
      
      // Determine if this user is strictly the authorized admin
      if (currentUser) {
        localStorage.setItem(isFirebaseSandbox ? 'laziz_sandbox_user' : 'laziz_last_known_user', JSON.stringify(currentUser));
        const isAuthorizedAdmin = currentUser.email ? dbService.isAdminEmail(currentUser.email) : false;
        setIsAdmin(isAuthorizedAdmin);
        localStorage.setItem('laziz_last_known_is_admin', isAuthorizedAdmin ? 'true' : 'false');
        
        // Ensure user record is written/valid in Firestore database collection
        dbService.ensureUserProfile(
          currentUser.uid,
          currentUser.email || 'customer@laziz.in',
          currentUser.displayName || currentUser.email?.split('@')[0] || 'Customer'
        ).catch((err) => {
          console.warn("Could not synchronize user record in Firestore:", err);
        });
      } else {
        setIsAdmin(false);
        localStorage.removeItem('laziz_last_known_user');
        localStorage.removeItem('laziz_last_known_is_admin');
        if (isFirebaseSandbox) {
          localStorage.removeItem('laziz_sandbox_user');
        }
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = (email: string, password: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      authActions.loginWithEmail(
        email,
        password,
        (loggedInUser) => {
          setUser(loggedInUser);
          const isAuthorizedAdmin = dbService.isAdminEmail(loggedInUser.email);
          setIsAdmin(isAuthorizedAdmin);
          localStorage.setItem(isFirebaseSandbox ? 'laziz_sandbox_user' : 'laziz_last_known_user', JSON.stringify(loggedInUser));
          localStorage.setItem('laziz_last_known_is_admin', isAuthorizedAdmin ? 'true' : 'false');
          resolve(loggedInUser);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const signUp = (email: string, password: string, displayName?: string, phoneNumber?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      authActions.signUpWithEmail(
        email,
        password,
        displayName || email.split('@')[0], // Generate simple display name from email prefix if empty
        (registeredUser) => {
          if (registeredUser && registeredUser.isUnverifiedSignUp) {
            resolve(registeredUser);
          } else {
            setUser(registeredUser);
            const isAuthorizedAdmin = dbService.isAdminEmail(registeredUser.email);
            setIsAdmin(isAuthorizedAdmin);
            localStorage.setItem(isFirebaseSandbox ? 'laziz_sandbox_user' : 'laziz_last_known_user', JSON.stringify(registeredUser));
            localStorage.setItem('laziz_last_known_is_admin', isAuthorizedAdmin ? 'true' : 'false');
            resolve(registeredUser);
          }
        },
        (error) => {
          reject(error);
        },
        phoneNumber
      );
    });
  };

  const logout = (): Promise<void> => {
    return new Promise((resolve) => {
      authActions.logout(() => {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('laziz_last_known_user');
        localStorage.removeItem('laziz_last_known_is_admin');
        if (isFirebaseSandbox) {
          localStorage.removeItem('laziz_sandbox_user');
        }
        resolve();
      });
    });
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'phone' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        signUp,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
