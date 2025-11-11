import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import logoImage from 'figma:asset/88f9fb54f06bdddc900357dfa9aed256720e2d56.png';

interface AuthScreenProps {
  onClose?: () => void;
}

type AuthMode = 'login' | 'signup';

export function AuthScreen({ onClose }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        if (!displayName.trim()) {
          toast.error('Please enter your display name');
          setIsLoading(false);
          return;
        }
        await signup(email, password, displayName, username || undefined);
        toast.success('Account created successfully!');
      }
      onClose?.();
    } catch (error: any) {
      toast.error(error.message || `${mode === 'login' ? 'Login' : 'Signup'} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setDisplayName('');
    setUsername('');
    setShowPassword(false);
  };

  // Quick fill for testing
  const fillTestAccount = () => {
    setEmail('alex@dorphin.app');
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md bg-card rounded-3xl shadow-2xl overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-center">
          <motion.img
            src={logoImage}
            alt="Dorphin"
            className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
          />
          <motion.h1
            className="text-white text-2xl font-bold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Join Dorphin'}
          </motion.h1>
          <motion.p
            className="text-white/80"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {mode === 'login' ? 'Log in to continue' : 'Create your account'}
          </motion.p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="signup-fields"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="John Doe"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required={mode === 'signup'}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username (optional)</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="johndoe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Account Helper (Development Only) */}
          {process.env.NODE_ENV === 'development' && mode === 'login' && (
            <button
              type="button"
              onClick={fillTestAccount}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Fill test account
            </button>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {mode === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'login' ? 'Log In' : 'Sign Up'
            )}
          </Button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === 'login' ? (
                <>
                  Don't have an account? <span className="text-purple-500 font-medium">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="text-purple-500 font-medium">Log in</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
