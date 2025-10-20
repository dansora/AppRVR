import React, { useState } from 'react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAudio } from '../contexts/AudioContext';
import { PlayIcon, PauseIcon, NewsIcon, SportIcon, WeatherIcon, ChevronRightIcon, FacebookIcon, WhatsAppIcon, YouTubeIcon, LinkedInIcon } from './Icons';
import ContactModal from './ContactModal';

interface HomePageProps {
  setActivePage: (page: Page) => void;
  isLoggedIn: boolean;
  username: string;
}

const HomePage: React.FC<HomePageProps> = ({ setActivePage, isLoggedIn, username }) => {
  const { t } = useLanguage();
  const { isPlaying, togglePlay, trackTitle } = useAudio();
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  const quickLinks = [
    { page: Page.News, icon: NewsIcon, title: t('navNews') },
    { page: Page.Sport, icon: SportIcon, title: t('navSport') },
    { page: Page.Weather, icon: WeatherIcon, title: t('homeWeatherTitle') }
  ];

  const socialLinks = [
    { href: "https://www.facebook.com/groups/1331920294319593", icon: FacebookIcon },
    { href: "https://wa.me/your-number", icon: WhatsAppIcon },
    { href: "https://www.youtube.com/@radiovocearomanilor8992", icon: YouTubeIcon },
    { href: "#", icon: LinkedInIcon },
  ];

  return (
    <div className="p-4 text-white font-roboto pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-montserrat text-white/90">{t('homeWelcome_line1')}</h1>
        <h2 className="text-3xl font-bold font-montserrat text-golden-yellow">{t('homeWelcome_line2')}</h2>
      </header>

      <div className="space-y-4">
        <div 
            onClick={() => setActivePage(Page.Radio)}
            className="bg-marine-blue-darker p-4 rounded-lg flex items-center justify-between cursor-pointer hover:bg-marine-blue-darkest transition-colors shadow-md"
        >
            <div className="flex-1 mr-4">
                <h3 className="font-bold text-lg text-white font-montserrat">{t('radioNowPlaying')}</h3>
                <p className="text-golden-yellow truncate">{trackTitle}</p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                className="bg-golden-yellow text-marine-blue rounded-full p-3 hover:bg-yellow-400 transition-transform transform hover:scale-110"
            >
                {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
            </button>
        </div>

        <h3 className="text-xl font-montserrat text-white pt-4">{t('homeQuickLinks')}</h3>
        <div className="space-y-3">
             {quickLinks.map(link => (
                 <button key={link.title} onClick={() => setActivePage(link.page)} className="w-full bg-marine-blue-darker p-4 rounded-lg flex items-center text-left hover:bg-marine-blue-darkest transition-colors shadow-md">
                     <link.icon className="w-6 h-6 text-golden-yellow mr-4" />
                     <span className="flex-1 font-bold text-white font-montserrat">{link.title}</span>
                     <ChevronRightIcon className="w-6 h-6 text-white/50" />
                 </button>
             ))}
        </div>
        
        <div className="pt-6 text-center">
            <button 
                onClick={() => setContactModalOpen(true)}
                className="bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300"
            >
                {t('homeContact')}
            </button>
        </div>

        <div className="pt-6">
            <h3 className="text-xl font-montserrat text-white text-center mb-4">{t('homeFollowUs')}</h3>
            <div className="flex justify-center items-center space-x-6">
                {socialLinks.map(({ href, icon: Icon }) => (
                    <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8"/>
                    </a>
                ))}
            </div>
        </div>

      </div>

      {isContactModalOpen && <ContactModal onClose={() => setContactModalOpen(false)} />}
    </div>
  );
};

export default HomePage;