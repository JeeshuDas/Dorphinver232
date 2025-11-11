import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../utils/supabase/client';
import { authApi } from '../services/api';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('🔄 AuthContext: Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('🔄 AuthContext: Session found, fetching user profile...');
          try {
            const userProfile = await authApi.getCurrentUser();
            setUser(userProfile);
            console.log('✅ AuthContext: User profile loaded:', userProfile);
          } catch (error) {
            console.warn('⚠️ AuthContext: Failed to fetch user profile, clearing session:', error);
            await supabase.auth.signOut();
          }
        } else {
          console.log('ℹ️ AuthContext: No existing session found');
        }
      } catch (error) {
        console.error('❌ AuthContext: Error initializing auth:', error);
      } finally {
        setIsLoading(false);
        console.log('✅ AuthContext: Initialization complete');
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthContext: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const userProfile = await authApi.getCurrentUser();
          setUser(userProfile);
          console.log('✅ AuthContext: User signed in:', userProfile);
        } catch (error) {
          console.error('❌ AuthContext: Error getting user profile on sign in:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        console.log('✅ AuthContext: User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 AuthContext: Token refreshed');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 AuthContext: Logging in...');
    const response = await authApi.signin(email, password);
    setUser(response.user);
    console.log('✅ AuthContext: Login successful');
  };

  const signup = async (email: string, password: string, username: string, displayName?: string) => {
    console.log('📝 AuthContext: Signing up...');
    const response = await authApi.signup(email, password, username, displayName);
    setUser(response.user);
    console.log('✅ AuthContext: Signup successful');
  };

  const logout = async () => {
    console.log('🚪 AuthContext: Logging out...');
    try {
      // Try to call API signout, but don't fail if it errors
      await authApi.signout();
    } catch (error) {
      console.warn('⚠️ AuthContext: API signout failed (expected if token expired):', error);
    }
    
    // Always sign out from Supabase and clear local state
    await supabase.auth.signOut();
    setUser(null);
    console.log('✅ AuthContext: Logout successful');
  };

  const signInWithGoogle = async () => {
    console.log('🔐 AuthContext: Signing in with Google...');
    await authApi.signInWithOAuth('google');
  };

  const signInWithApple = async () => {
    console.log('🔐 AuthContext: Signing in with Apple...');
    await authApi.signInWithOAuth('apple');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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