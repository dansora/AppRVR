import React, { useState } from 'react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { BackIcon } from './Icons';

interface AuthPageProps {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setActivePage: (page: Page) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ setIsLoggedIn, setActivePage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setActivePage(Page.Home);
  };

  return (
    <div className="p-4 text-white font-roboto flex flex-col justify-center h-full">
      <div className="w-full max-w-md mx-auto bg-marine-blue-darker p-8 rounded-lg">
        <h1 className="text-3xl font-montserrat text-golden-yellow mb-6 text-center">
          {isLogin ? t('authWelcomeBack') : t('authCreateAccount')}
        </h1>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">{t('authFullNameLabel')}</label>
              <input type="text" required className="w-full bg-marine-blue-darkest/50 rounded-md p-3 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">{t('authEmailLabel')}</label>
            <input type="email" required className="w-full bg-marine-blue-darkest/50 rounded-md p-3 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">{t('authPasswordLabel')}</label>
            <input type="password" required className="w-full bg-marine-blue-darkest/50 rounded-md p-3 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
          </div>
          
          <button
            type="submit"
            className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors"
          >
            {isLogin ? t('authLoginButton') : t('authRegisterButton')}
          </button>
        </form>

        <p className="text-center text-sm text-white/70 mt-6">
          {isLogin ? t('authNoAccount') : t('authHaveAccount')}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-golden-yellow hover:text-yellow-400 ml-2">
            {isLogin ? t('authRegisterButton') : t('authLoginButton')}
          </button>
        </p>
      </div>
      <button
        onClick={() => setActivePage(Page.Home)}
        className="mt-8 mx-auto flex items-center gap-2 bg-golden-yellow text-marine-blue font-bold py-3 px-6 rounded-full hover:bg-yellow-400 transition-colors duration-300"
      >
        <BackIcon className="w-5 h-5" />
        {t('authBackButton')}
      </button>
    </div>
  );
};

export default AuthPage;