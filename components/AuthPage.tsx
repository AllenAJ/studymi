import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { signIn, signUp, signInWithGoogle } from '../services/supabase';
import { DISPOSABLE_DOMAINS } from '../utils/disposableDomains';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup';
  onComplete: (userId: string, email: string) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'signin', onComplete, onBack }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security States
  const [honeyPot, setHoneyPot] = useState('');
  const [lastAttemptTime, setLastAttemptTime] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const validateEmail = (email: string) => {
    const domain = email.split('@')[1];
    if (DISPOSABLE_DOMAINS.includes(domain)) {
      return false;
    }
    // Basic regex for format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastAttemptTime;

    // Block if less than 3 seconds since last attempt
    if (timeSinceLastAttempt < 3000) {
      return false;
    }

    // Reset count if more than 1 minute passed
    if (now - lastAttemptTime > 60000) {
      setAttemptCount(1);
    } else {
      setAttemptCount(prev => prev + 1);
    }

    setLastAttemptTime(now);

    // Hard block if > 5 attempts in 1 minute
    if (attemptCount > 5) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Honeypot Check
    if (honeyPot) {
      // Silently fail (simulate loading then do nothing or show error)
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Optional: show generic error to prompt bot to retry and waste time
        setError('Unable to process request.');
      }, 1500);
      return;
    }

    // 2. Validate Email
    if (!validateEmail(email)) {
      setError('Please use a valid, permanent email address.');
      return;
    }

    // 3. Rate Limiting
    if (!checkRateLimit()) {
      setError('Too many attempts. Please wait a moment.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await signUp(email, password);
        if (error) throw error;
        if (data.user) {
          // For email confirmation flow, show message
          if (!data.session) {
            setError('Check your email to confirm your account!');
            setIsLoading(false);
            return;
          }
          onComplete(data.user.id, data.user.email || '');
        }
      } else {
        const { data, error } = await signIn(email, password);
        if (error) throw error;
        if (data.user) {
          onComplete(data.user.id, data.user.email || '');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // OAuth will redirect, so we don't need to call onComplete here
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in relative">
      <button
        onClick={onBack}
        className="absolute left-8 p-3 rounded-none hover:bg-iceGray transition-colors"
        style={{ top: 'calc(2rem + env(safe-area-inset-top))' }}
      >
        <ArrowLeft className="w-6 h-6 text-deepNavy" />
      </button>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-deepNavy mb-2">
            {mode === 'signin' ? 'welcome back' : 'create account'}
          </h2>
          <p className="text-steelGray">
            {mode === 'signin'
              ? 'enter your details to continue learning'
              : 'join 120,000+ students mastering topics'}
          </p>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-none text-sm font-medium ${error.includes('Check your email')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Honeypot Field - Hidden from users, visible to bots */}
          <div className="absolute opacity-0 -z-50 pointer-events-none" aria-hidden="true">
            <label htmlFor="confirm_email">Confirm Email</label>
            <input
              type="text"
              name="confirm_email"
              id="confirm_email"
              tabIndex={-1}
              autoComplete="off"
              value={honeyPot}
              onChange={(e) => setHoneyPot(e.target.value)}
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-steelGray mb-2 ml-4">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-iceGray rounded-none border border-transparent focus:border-primaryGold focus:bg-white outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-steelGray mb-2 ml-4">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-iceGray rounded-none border border-transparent focus:border-primaryGold focus:bg-white outline-none transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-10 bg-deepNavy text-white py-4 rounded-none font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-deepNavy/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === 'signin' ? 'log in' : 'sign up'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-softBorder"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-steelGray">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="mt-6 flex items-center justify-center gap-3 w-full border border-softBorder hover:border-steelGray py-3.5 rounded-none transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="font-medium text-deepNavy">Google</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-steelGray">
          {mode === 'signin' ? "don't have an account?" : "already have an account?"}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            className="ml-2 font-bold text-primaryGold hover:underline"
          >
            {mode === 'signin' ? 'sign up free' : 'log in'}
          </button>
        </p>
      </div>
    </div>
  );
};
