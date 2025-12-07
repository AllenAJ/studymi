import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthPageProps {
  onComplete: () => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onComplete, onBack }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in relative">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 p-3 rounded-full hover:bg-iceGray transition-colors"
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

        <div className="space-y-4">
          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-steelGray mb-2 ml-4">email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-iceGray rounded-[20px] border border-transparent focus:border-primaryGold focus:bg-white outline-none transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider text-steelGray mb-2 ml-4">password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-iceGray rounded-[20px] border border-transparent focus:border-primaryGold focus:bg-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button 
          onClick={onComplete}
          className="w-full mt-10 bg-deepNavy text-white py-4 rounded-full font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-deepNavy/20"
        >
          {mode === 'signin' ? 'log in' : 'sign up'} <ArrowRight className="w-5 h-5" />
        </button>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-softBorder"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-steelGray">or continue with</span>
            </div>
          </div>

          <button onClick={onComplete} className="mt-6 flex items-center justify-center gap-3 w-full border border-softBorder hover:border-steelGray py-3.5 rounded-full transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span className="font-medium text-deepNavy">Google</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-steelGray">
          {mode === 'signin' ? "don't have an account?" : "already have an account?"}
          <button 
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="ml-2 font-bold text-primaryGold hover:underline"
          >
            {mode === 'signin' ? 'sign up free' : 'log in'}
          </button>
        </p>
      </div>
    </div>
  );
};