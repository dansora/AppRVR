import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon, UserIcon, GitHubIcon, GoogleIcon, FacebookIcon, AppleIcon } from './Icons';
import { supabase } from '../services/supabaseClient';
import type { Provider } from '@supabase/supabase-js';
import { useModal } from '../contexts/ModalContext';

interface AuthModalProps {
  onClose: () => void;
}

type AuthMode = 'login' | 'signup';

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { registerModal, unregisterModal } = useModal();

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            onClose(); // Close modal on successful login
        } else {
            const { error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    data: {
                        // You can add additional user metadata here
                        username: email.split('@')[0]
                    }
                }
            });
            if (error) throw error;
            setMessage(t('authSuccessSignUp'));
        }
    } catch (err: any) {
        const message = err.error_description || err.message || (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err));
        setError(t('authError', { message }));
    } finally {
        setLoading(false);
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
        const { error } = await supabase.auth.signInWithOAuth({ provider });
        if (error) throw error;
        // Supabase handles the redirect
    } catch (err: any) {
        const message = err.error_description || err.message || (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err));
        setError(t('authError', { message }));
        setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => (prev === 'login' ? 'signup' : 'login'));
    setError(null);
    setMessage(null);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-marine-blue-darkest w-full max-w-lg rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-center p-4 border-b border-white/20 flex-shrink-0 relative">
          <h2 className="text-2xl font-montserrat text-golden-yellow text-center">
              {mode === 'login' ? t('authModalTitleLogin') : t('authModalTitleSignUp')}
          </h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
            <div className="flex flex-col items-center mb-6">
                <div className="bg-golden-yellow p-3 rounded-full mb-2">
                    <UserIcon className="w-8 h-8 text-marine-blue"/>
                </div>
            </div>

            {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-center mb-4">{error}</div>}
            {message && <div className="bg-green-500/20 text-green-300 p-3 rounded-md text-center mb-4">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('authEmailLabel')}</label>
                    <input type="email" name="email" required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('authPasswordLabel')}</label>
                    <input type="password" name="password" required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                </div>
                <div>
                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-gray-500 flex items-center justify-center"
                    >
                    {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {mode === 'login' ? t('authLoginButton') : t('authSignUpButton')}
                    </button>
                </div>
            </form>

            <div className="relative flex py-4 items-center">
                <div className="flex-grow border-t border-white/20"></div>
                <span className="flex-shrink mx-4 text-white/70 text-sm">{t('authOr')}</span>
                <div className="flex-grow border-t border-white/20"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => signInWithProvider('google')}
                    disabled={loading}
                    className="w-full bg-white text-gray-700 font-bold py-3 rounded-full hover:bg-gray-200 transition-colors disabled:bg-gray-500 flex items-center justify-center gap-3 shadow"
                >
                    <GoogleIcon className="w-5 h-5" />
                    {t('authSignInWithGoogle')}
                </button>
                <button
                    type="button"
                    onClick={() => signInWithProvider('facebook')}
                    disabled={loading}
                    className="w-full bg-[#1877F2] text-white font-bold py-3 rounded-full hover:bg-[#166FE5] transition-colors disabled:bg-gray-500 flex items-center justify-center gap-3 shadow"
                >
                    <FacebookIcon className="w-5 h-5" />
                    {t('authSignInWithFacebook')}
                </button>
                <button
                    type="button"
                    onClick={() => signInWithProvider('apple')}
                    disabled={loading}
                    className="w-full bg-black text-white font-bold py-3 rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-500 flex items-center justify-center gap-3 shadow"
                >
                    <AppleIcon className="w-5 h-5" />
                    {t('authSignInWithApple')}
                </button>
                <button
                    type="button"
                    onClick={() => signInWithProvider('github')}
                    disabled={loading}
                    className="w-full bg-[#333] text-white font-bold py-3 rounded-full hover:bg-[#444] transition-colors disabled:bg-gray-500 flex items-center justify-center gap-3 shadow"
                >
                    <GitHubIcon className="w-5 h-5" />
                    {t('authSignInWithGitHub')}
                </button>
            </div>
            
            <div className="text-center text-sm text-white/70 mt-4">
                {mode === 'login' ? t('authNoAccount') : t('authHaveAccount')}{' '}
                <button type="button" onClick={toggleMode} className="font-medium text-golden-yellow hover:underline">
                    {mode === 'login' ? t('authSignUp') : t('authLogin')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;