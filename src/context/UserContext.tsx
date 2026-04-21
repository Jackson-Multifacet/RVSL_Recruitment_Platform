import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, FirestoreError, AuthState } from '../types';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

interface UserContextType extends AuthState {
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export interface UserProviderProps {
  children: ReactNode;
}

/**
 * UserProvider - Centralized authentication state management
 * Eliminates prop drilling by making user accessible throughout app
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is logged in
          // In production, fetch detailed profile from Firestore
          // For now, use basic auth info
          const userRole: UserRole = firebaseUser.email === 'faithjohnjackson@gmail.com' 
            ? 'staff'
            : 'candidate';
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: userRole,
          } as any);
          
          setRole(userRole);
        } else {
          // User is logged out
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        const error = err as any;
        setError({
          code: error.code || 'AUTH_ERROR',
          message: error.message || 'Failed to load user profile',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
      setRole(null);
      setError(null);
    } catch (err) {
      const error = err as any;
      setError({
        code: error.code || 'LOGOUT_ERROR',
        message: 'Failed to logout',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setRole(updatedUser.role);
  };

  const clearError = () => {
    setError(null);
  };

  const value: UserContextType = {
    user,
    role,
    isLoading,
    error,
    logout,
    updateUser,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * useUser - Hook to access user context
 * Replaces prop drilling for user and auth state
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within <UserProvider>');
  }
  return context;
};

/**
 * useAuth - Hook to check if user is authenticated
 */
export const useAuth = () => {
  const { user, isLoading } = useUser();
  return { isAuthenticated: !!user, isLoading };
};

/**
 * useUserRole - Hook to get current user's role
 */
export const useUserRole = (): UserRole | null => {
  const { role } = useUser();
  return role;
};

/**
 * useIsStaff - Type guard hook for staff role
 */
export const useIsStaff = (): boolean => {
  const role = useUserRole();
  return role === 'staff' || role === 'admin';
};

/**
 * useIsClient - Type guard hook for client role
 */
export const useIsClient = (): boolean => {
  const role = useUserRole();
  return role === 'client';
};

/**
 * useIsCandidate - Type guard hook for candidate role
 */
export const useIsCandidate = (): boolean => {
  const role = useUserRole();
  return role === 'candidate';
};
