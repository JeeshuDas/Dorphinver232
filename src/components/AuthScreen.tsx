import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import logoImage from 'figma:asset/88f9fb54f06bdddc900357dfa9aed256720e2d56.png';
import { healthCheck } from '../services/api';

interface AuthScreenProps {
  onClose?: () => void;
}

export function AuthScreen({ onClose }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup, signInWithGoogle } = useAuth();

  const handleTestConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      toast.loading('Testing connection...');
      const result = await healthCheck();
      console.log('✅ Backend is reachable:', result);
      toast.success('Backend connected! ✓');
    } catch (error: any) {
      console.error('❌ Backend connection failed:', error);
      toast.error(`Backend connection failed: ${error.message}`);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@dorphin.app');
    setPassword('demo123456');
    
    setTimeout(async () => {
      try {
        setIsLoading(true);
        await login('demo@dorphin.app', 'demo123456');
        toast.success('Welcome to Dorphin!');
        onClose?.();
      } catch (error: any) {
        toast.error(error.message || 'Demo login failed');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    if (mode === 'signup') {
      if (!username.trim()) {
        toast.error('Please enter a username');
        return;
      }
      
      // Username validation
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username) || username.length < 3 || username.length > 30) {
        toast.error('Username must be 3-30 characters (letters, numbers, underscores only)');
        return;
      }
    }

    // Password validation
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        console.log('🔐 Attempting login for:', email);
        await login(email, password);
        console.log('✅ Login successful!');
        toast.success('Welcome back!');
        onClose?.();
      } else {
        console.log('📝 Attempting signup for:', email);
        await signup(email, password, username, displayName || username);
        console.log('✅ Signup successful!');
        toast.success('Account created successfully!');
        onClose?.();
      }
    } catch (error: any) {
      console.error('❌ Authentication error:', error);
      const errorMessage = error.message || `${mode === 'login' ? 'Login' : 'Signup'} failed`;
      
      if (mode === 'login' && errorMessage.includes('Invalid')) {
        toast.error('Invalid email or password');
      } else if (errorMessage.includes('already')) {
        toast.error('Email or username already exists');
      } else if (errorMessage.includes('timeout')) {
        toast.error('Connection timeout. Please check your internet and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // User will be redirected to Google OAuth
    } catch (error: any) {
      console.error('❌ Google sign in error:', error);
      toast.error('Google sign in failed. Please ensure Google OAuth is configured in Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-8 text-center">
          <motion.img
            src={logoImage}
            alt="Dorphin"
            className="w-20 h-20 mx-auto rounded-full shadow-xl mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          />
          <h1 className="text-3xl text-white mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Join Dorphin'}
          </h1>
          <p className="text-white/90 text-sm">
            {mode === 'login' 
              ? 'Sign in to continue your journey' 
              : 'Create your account to get started'
            }
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {/* Demo Account Notice */}
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
              💡 Try the demo account:
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                Use Demo Account
              </button>
              <button
                onClick={handleTestConnection}
                disabled={isLoading}
                className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                title="Test backend connection"
              >
                Test
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              demo@dorphin.app / demo123456
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm mb-2 text-muted-foreground">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="username"
                      className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    3-30 characters, letters, numbers, and underscores only
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Display Name (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm mb-2 text-muted-foreground">Display Name (Optional)</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div>
              <label className="block text-sm mb-2 text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-muted rounded-xl border border-border focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-muted hover:bg-accent rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-3 border border-border"
          >
            <Chrome className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>

          {/* Toggle mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {mode === 'login' ? (
                <>Don't have an account? <span className="text-purple-500 font-medium">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-purple-500 font-medium">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}