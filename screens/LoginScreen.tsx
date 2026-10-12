import React, { useState } from 'react';
import { User } from '../types';
import GoogleIcon from '../components/icons/GoogleIcon';
import EyeIcon from '../components/icons/EyeIcon';
import EyeSlashIcon from '../components/icons/EyeSlashIcon';
import { useGoogleLogin } from '@react-oauth/google';
import { getSupabase } from '../src/supabase';
import { isNative } from '../utils/nativeUtils';
import { Browser } from '@capacitor/browser';

export interface LocalCredentials {
  email: string;
  name?: string;
  password?: string;
}

interface LoginScreenProps {
  onLocalLogin: (credentials: LocalCredentials) => Promise<{ user: User } | { error: string }>;
  onLocalSignUp: (credentials: LocalCredentials) => Promise<{ user: User } | { error: string }>;
  onGoogleSignInClick: () => void;
  onLoginComplete: (user: User) => void;
  onSignUpComplete: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLocalLogin, onLocalSignUp, onGoogleSignInClick, onLoginComplete, onSignUpComplete }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = isSignUp 
      ? await onLocalSignUp({ email, name, password })
      : await onLocalLogin({ email, password });

    setLoading(false);

    if ('error' in result) {
      setError(result.error);
    } else {
      if (isSignUp) onSignUpComplete(result.user);
      else onLoginComplete(result.user);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.");
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (isNative()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            redirectTo: 'com.obpro.app://google-auth',
            skipBrowserRedirect: true
          }
        });
        if (error) throw error;
        if (data?.url) {
          await Browser.open({ url: data.url });
        }
      } else {
        const redirectUrl = (import.meta as any).env.VITE_APP_URL || window.location.origin;
        console.log(`[Supabase Auth] Redirecting to: ${redirectUrl}`);
        
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
            redirectTo: redirectUrl
          }
        });
        if (error) throw error;
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to start Google login. Please check your Supabase configuration.");
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-white dark:bg-gray-900 transition-colors relative overflow-hidden">
      {/* Header Branding */}
      <header className="flex justify-between items-center pt-10 px-8 shrink-0 z-20">
          <div className="flex items-center gap-1.5 animate-fade-in">
              <h1 className="text-3xl font-black text-black dark:text-white tracking-tighter leading-none italic">OB</h1>
              <span className="bg-black dark:bg-white text-white dark:text-black text-[7px] font-black px-1 py-0.5 rounded italic uppercase tracking-tighter">Pro</span>
          </div>
      </header>

      <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full p-6">
        <header className="mb-12 text-center">
            <h2 className="text-4xl font-black text-black dark:text-white tracking-tight mb-2 italic">
                {isSignUp ? 'Create Account' : 'Welcome Boss'}
            </h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">
                {isSignUp ? 'Empower your empire today.' : 'Please Login to proceed.'}
            </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
           {isSignUp && (
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Business Name" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="input-field pl-14"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                </div>
             </div>
           )}
           <div className="relative">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="input-field pl-14"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
           </div>
           <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="input-field pl-14 pr-12"
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 p-2 active:scale-90 transition-transform z-10"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
           </div>

           {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
           
            <button type="submit" disabled={loading} className="primary-button mt-4 py-5 shadow-2xl">
                {loading ? 'Authenticating...' : (isSignUp ? 'Create My Account' : 'Sign In Now')}
                {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>}
            </button>

            <p className="text-center text-gray-400 font-medium mt-4">
                {isSignUp ? "Already have an account? " : "New to OB? "}
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-black dark:text-white font-black hover:underline underline-offset-4">
                  {isSignUp ? 'Sign In' : 'Join Now'}
                </button>
            </p>
        </form>
        
        <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
            <span className="flex-shrink mx-4 text-gray-300 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.4em]">Or continue with</span>
            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center">
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/60 active:scale-[0.98] transition-all shadow-sm group disabled:opacity-50"
                    aria-label="Sign in with Google"
                >
                    <GoogleIcon className="w-6 h-6 shrink-0" />
                    <span className="font-bold text-sm text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                        Continue with Google
                    </span>
                </button>
            </div>
            
            <footer className="mt-4 text-center space-x-4">
                <a 
                    href="/privacy"
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
                >
                    Privacy Policy
                </a>
                <a 
                    href="/terms"
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
                >
                    Terms of Service
                </a>
            </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;