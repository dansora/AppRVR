import React, { useState, useEffect } from 'react';
import { Page } from './types';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import HomePage from './components/HomePage';
import RadioPlayer from './components/RadioPlayer';
import NewsFeed from './components/NewsFeed';
import UploadContent from './components/UploadContent';
import Polls from './components/Polls';
import SettingsPage from './components/FeedbackForm';
import AuthPage from './components/AuthPage';
import WeatherPage from './components/WeatherPage';
import { useSettings } from './contexts/SettingsContext';
import { useLanguage } from './contexts/LanguageContext';
import { FlagUkIcon, FlagRoIcon, UserIcon } from './components/Icons';

const RVRLogo = () => (
  <img src="https://storage.googleapis.com/aistudio-hosting/44422b8214f44043/versions/3a232c44365b2639/app/assets/image.png" alt="RVR Logo" className="h-12" />
);


const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activePage, setActivePage] = useState<Page>(Page.Home);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Guest');
  const { fontSize } = useSettings();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setShowOnboarding(false), 2000); // Onboarding for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case Page.Home:
        return <HomePage setActivePage={setActivePage} isLoggedIn={isLoggedIn} username={username} />;
      case Page.Radio:
        return <RadioPlayer setActivePage={setActivePage} />;
      case Page.News:
        return <NewsFeed category='news' />;
      case Page.Sport:
          return <NewsFeed category='sport' />;
      case Page.Upload:
        return <UploadContent isLoggedIn={isLoggedIn} setActivePage={setActivePage} />;
      case Page.Polls:
        return <Polls />;
      case Page.Settings:
        return <SettingsPage />;
      case Page.Login:
        return <AuthPage setIsLoggedIn={(status) => {
            setIsLoggedIn(status);
            if (status) setUsername("Demo User");
            else setUsername("Guest");
        }} setActivePage={setActivePage} />;
      case Page.Weather:
        return <WeatherPage setActivePage={setActivePage} />;
      default:
        return <HomePage setActivePage={setActivePage} isLoggedIn={isLoggedIn} username={username} />;
    }
  };

  if (showOnboarding) {
    return <Onboarding />;
  }

  const pagesWithoutNav = [Page.Login, Page.Radio, Page.Weather];
  const pagesWithoutHeader = [Page.Login, Page.Radio, Page.Weather];

  return (
    <div className={`bg-marine-blue min-h-screen ${getFontSizeClass()}`}>
       {!pagesWithoutHeader.includes(activePage) && (
         <header className="sticky top-0 z-40 bg-gradient-to-r from-marine-blue-darker to-marine-blue-darkest p-4 flex justify-between items-center text-white shadow-lg">
            <RVRLogo />
            <div className="flex items-center space-x-4">
                <button onClick={() => setLanguage(language === 'en' ? 'ro' : 'en')} className="focus:outline-none">
                    {language === 'en' ? <FlagRoIcon className="w-8 h-8 rounded-full" /> : <FlagUkIcon className="w-8 h-8 rounded-full" />}
                </button>
                <button onClick={() => setActivePage(Page.Login)}>
                    <UserIcon className="w-8 h-8 text-golden-yellow" />
                </button>
            </div>
        </header>
       )}
      <main className="pb-16">
        {renderPage()}
      </main>
      {!pagesWithoutNav.includes(activePage) && (
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      )}
    </div>
  );
};

export default App;