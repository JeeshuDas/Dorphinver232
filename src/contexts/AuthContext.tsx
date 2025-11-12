import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo purposes (no authentication required)
const mockUser: User = {
  id: 'demo-user-id',
  username: 'demo_user',
  displayName: 'Demo User',
  email: 'demo@dorphin.app',
  avatar: '#8b5cf6',
  bio: 'Exploring amazing content on Dorphin',
  followers: 0,
  following: 0,
  isVerified: false,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    // No-op for now
    console.log('Login disabled');
  };

  const signup = async (email: string, password: string, username: string, displayName?: string) => {
    // No-op for now
    console.log('Signup disabled');
  };

  const logout = async () => {
    // No-op for now
    console.log('Logout disabled');
  };

  const signInWithGoogle = async () => {
    // No-op for now
    console.log('Google sign-in disabled');
  };

  const signInWithApple = async () => {
    // No-op for now
    console.log('Apple sign-in disabled');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: true, // Always authenticated with mock user
        login,
        signup,
        logout,
        signInWithGoogle,
        signInWithApple,
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