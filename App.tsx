import React, { useState, useEffect, useRef } from 'react';
import { Page } from './types';
import Onboarding from './components/Onboarding';
import BottomNav from './components/BottomNav';
import HomePage from './components/HomePage';
import RadioPlayer from './components/RadioPlayer';
import NewsFeed from './components/NewsFeed';
import UploadContent from './components/UploadContent';
import Polls from './components/Polls';
import SettingsPage from './components/FeedbackForm';
import SportPage from './components/SportPage';
import WeatherPage from './components/WeatherPage';
import { useSettings } from './contexts/SettingsContext';
import ScrollToTopButton from './components/ScrollToTopButton';
import AuthModal from './components/AuthModal';
import { UserIcon, FlagUkIcon, FlagRoIcon, SettingsIcon, AdminIcon } from './components/Icons';
import { useLanguage } from './contexts/LanguageContext';
import TermsModal from './components/TermsModal';
import StickyRadioPlayer from './components/StickyRadioPlayer';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import ProfilePage from './components/ProfilePage';
import { useProfile } from './contexts/ProfileContext';
import AdminPage from './components/AdminPage';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

interface Announcement {
  id: number;
}

const App: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activePage, setActivePage] = useState<Page>(Page.Home);
  const { fontSize } = useSettings();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { session, profile, loadingProfile } = useProfile();

  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOnboarding(false);
    }, 2500);

    const storedConsent = localStorage.getItem('rvr-terms-consent') as ConsentStatus | null;
    if (storedConsent) {
      setConsentStatus(storedConsent);
    } else {
      setConsentStatus('pending');
      // Only show the modal after onboarding is done
      if (!showOnboarding) {
        setIsConsentModalOpen(true);
      }
    }

    return () => clearTimeout(timer);
  }, [showOnboarding]);
  
  useEffect(() => {
    if (!showOnboarding && consentStatus === 'pending') {
      setIsConsentModalOpen(true);
    }
  }, [showOnboarding, consentStatus]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setUserMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuRef]);

    useEffect(() => {
    const fetchAndCountAnnouncements = async () => {
        try {
            let query = supabase.from('announcements').select('id');

            if (session?.user) {
                query = query.or(`user_id.is.null,user_id.eq.${session.user.id}`);
            } else {
                query = query.is('user_id', null);
            }
            
            const { data, error } = await query;
            if (error) throw error;

            if (data) {
                setAllAnnouncements(data);
                const seenAnnouncementsRaw = localStorage.getItem('rvr-seen-announcements');
                const seenIds = seenAnnouncementsRaw ? JSON.parse(seenAnnouncementsRaw) : [];
                const newCount = data.filter(ann => !seenIds.includes(ann.id)).length;
                setAnnouncementCount(newCount);
            }
        } catch (error) {
            console.error("Error counting announcements:", error);
        }
    };

    fetchAndCountAnnouncements();
  }, [session]);

  const markAnnouncementsAsSeen = () => {
    if (allAnnouncements.length > 0 && announcementCount > 0) {
        const announcementIds = allAnnouncements.map(ann => ann.id);
        localStorage.setItem('rvr-seen-announcements', JSON.stringify(announcementIds));
        setAnnouncementCount(0);
    }
  };

  const handleAcceptTerms = () => {
    localStorage.setItem('rvr-terms-consent', 'accepted');
    setConsentStatus('accepted');
    setIsConsentModalOpen(false);
    setActivePage(Page.Home);
  };

  const handleDeclineTerms = () => {
    localStorage.setItem('rvr-terms-consent', 'declined');
    setConsentStatus('declined');
    setIsConsentModalOpen(false);
    setActivePage(Page.Radio);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setActivePage(Page.Home);
  }
  
  const getUsername = () => {
      if (loadingProfile) return '...';
      return profile?.username || session?.user?.email?.split('@')[0] || 'User';
  }

  const RestrictedModeBanner = () => (
    <div className="bg-yellow-500 text-black text-center p-2 text-sm font-semibold">
      {t('restrictedAccessMessage')}{' '}
      <button onClick={() => setActivePage(Page.Settings)} className="underline font-bold">
        {t('navSettings')}
      </button>
    </div>
  );

  const renderPage = () => {
    const isLoggedIn = !!session;
    // If access is restricted, only allow Radio and Settings pages
    if (consentStatus === 'declined' && activePage !== Page.Settings) {
        return <RadioPlayer setActivePage={setActivePage} />;
    }

    switch (activePage) {
      case Page.Home:
        return <HomePage setActivePage={setActivePage} isLoggedIn={isLoggedIn} openAuthModal={() => setAuthModalOpen(true)} />;
      case Page.Radio:
        return <RadioPlayer setActivePage={setActivePage} />;
      case Page.News:
        return <NewsFeed setActivePage={setActivePage} />;
      case Page.Sport:
        return <SportPage setActivePage={setActivePage} />;
      case Page.Weather:
        return <WeatherPage setActivePage={setActivePage} />;
      case Page.Upload:
        return <UploadContent isLoggedIn={isLoggedIn} openAuthModal={() => setAuthModalOpen(true)} setActivePage={setActivePage} />;
      case Page.Polls:
        return <Polls />;
      case Page.Settings:
        return <SettingsPage onReviewTerms={() => setIsConsentModalOpen(true)} isLoggedIn={isLoggedIn} />;
      case Page.Profile:
        return <ProfilePage setActivePage={setActivePage} openAuthModal={() => setAuthModalOpen(true)} />;
      case Page.Admin:
        // Secure this page view
        return profile?.role === 'admin' ? <AdminPage /> : <HomePage setActivePage={setActivePage} isLoggedIn={isLoggedIn} openAuthModal={() => setAuthModalOpen(true)} />;
      default:
        return <HomePage setActivePage={setActivePage} isLoggedIn={isLoggedIn} openAuthModal={() => setAuthModalOpen(true)} />;
    }
  };
  
  const getFontSizeClass = () => {
    switch(fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      case 'medium':
      default:
        return 'text-base';
    }
  }

  if (showOnboarding) {
    return <Onboarding />;
  }

  return (
    <div className={`bg-marine-blue min-h-screen ${getFontSizeClass()}`}>
        <header className="sticky top-0 z-40 bg-marine-blue-darkest/80 backdrop-blur-sm shadow-md p-3 flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-golden-yellow font-montserrat">RVR</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setLanguage('en')} className={`p-1 rounded-full ${language === 'en' ? 'bg-golden-yellow' : ''}`}>
                  <FlagUkIcon className="w-6 h-6"/>
                </button>
                <button onClick={() => setLanguage('ro')} className={`p-1 rounded-full ${language === 'ro' ? 'bg-golden-yellow' : ''}`}>
                  <FlagRoIcon className="w-6 h-6"/>
                </button>
              </div>

              {session ? (
                  <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 text-white cursor-pointer relative">
                      <UserIcon className="w-6 h-6" />
                      {announcementCount > 0 && (
                          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md">
                            {announcementCount}
                          </span>
                      )}
                      <span className="hidden sm:inline">{t('authLoggedInAs', { username: getUsername() })}</span>
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-marine-blue-darker rounded-md shadow-lg py-1 z-50">
                            {profile?.role === 'admin' && (
                                <button
                                  onClick={() => { markAnnouncementsAsSeen(); setActivePage(Page.Admin); setUserMenuOpen(false); }}
                                  className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-white hover:bg-marine-blue-darkest"
                                >
                                  <AdminIcon className="w-5 h-5" />
                                  {t('adminNav')}
                                </button>
                            )}
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-marine-blue-darkest"
                            >
                              {t('authLogout')}
                            </button>
                        </div>
                    )}
                  </div>
              ) : (
                <button onClick={() => { markAnnouncementsAsSeen(); setAuthModalOpen(true); }} className="relative flex items-center gap-2 text-white">
                  <UserIcon className="w-6 h-6" />
                  {announcementCount > 0 && (
                      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md">
                        {announcementCount}
                      </span>
                  )}
                  <span className="hidden sm:inline">{t('navLogin')}</span>
                </button>
              )}
               <button onClick={() => { markAnnouncementsAsSeen(); setActivePage(Page.Settings); }} className="text-white">
                  <SettingsIcon className="w-6 h-6" />
               </button>
            </div>
        </header>

        {consentStatus === 'declined' && <RestrictedModeBanner />}
        
        <main className="pb-32">
            {renderPage()}
        </main>

        <ScrollToTopButton />

        {consentStatus === 'accepted' && activePage !== Page.Radio && <StickyRadioPlayer setActivePage={setActivePage} />}
        {consentStatus === 'accepted' && <BottomNav activePage={activePage} setActivePage={setActivePage} isLoggedIn={!!session} markAnnouncementsAsSeen={markAnnouncementsAsSeen} />}
        
        {isAuthModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
        
        {isConsentModalOpen && <TermsModal mode="consent" onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />}
    </div>
  );
};

export default App;