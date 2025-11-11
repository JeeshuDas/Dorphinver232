import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  displayName: string;
  username: string;
  avatar?: string;
  bio?: string;
  followers?: number;
  following?: number;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string, username?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock user for demo
const MOCK_USER: User = {
  id: 'mock-user-1',
  email: 'demo@dorphin.com',
  displayName: 'Demo User',
  username: 'demo_user',
  avatar: '#FF6B9D',
  bio: 'Welcome to Dorphin!',
  followers: 12500,
  following: 384,
  isVerified: true,
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [isLoading] = useState(false);

  const login = async (email: string, password: string) => {
    // Mock login - always succeeds
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(MOCK_USER);
  };

  const signup = async (email: string, password: string, displayName: string, username?: string) => {
    // Mock signup - always succeeds
    await new Promise(resolve => setTimeout(resolve, 500));
    const newUser: User = {
      id: 'mock-user-' + Date.now(),
      email,
      displayName,
      username: username || email.split('@')[0],
      avatar: '#FF6B9D',
      followers: 0,
      following: 0,
      isVerified: false,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    // Mock update
    await new Promise(resolve => setTimeout(resolve, 500));
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
