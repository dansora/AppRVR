import React, { useState } from 'react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { NewsIcon, SportIcon, WeatherIcon, ChevronRightIcon, FacebookIcon, WhatsAppIcon, YouTubeIcon, LinkedInIcon, MailIcon, DonateIcon, StoreIcon } from './Icons';
import ContactModal from './ContactModal';
import DonationModal from './DonationModal';

interface HomePageProps {
  setActivePage: (page: Page) => void;
  isLoggedIn: boolean;
  username: string;
}

const HomePage: React.FC<HomePageProps> = ({ setActivePage, isLoggedIn, username }) => {
  const { t } = useLanguage();
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isDonationModalOpen, setDonationModalOpen] = useState(false);

  const quickLinks = [
    { page: Page.News, icon: NewsIcon, title: t('navNews') },
    { page: Page.Sport, icon: SportIcon, title: t('navSport') },
    { page: Page.Weather, icon: WeatherIcon, title: t('homeWeatherTitle') }
  ];

  const socialLinks = [
    { href: "https://www.facebook.com/groups/1331920294319593", icon: FacebookIcon },
    { href: "https://web.whatsapp.com/", icon: WhatsAppIcon },
    { href: "https://www.youtube.com/@radiovocearomanilor8992", icon: YouTubeIcon },
    { href: "https://www.linkedin.com/", icon: LinkedInIcon },
  ];

  return (
    <div className="p-4 text-white font-roboto pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-montserrat text-white/90">{t('homeWelcome_line1')}</h1>
        <h2 className="text-3xl font-bold font-montserrat text-golden-yellow">{t('homeWelcome_line2')}</h2>
      </header>

      <div className="space-y-4">
        
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
        
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
                href="https://radio-vocea-romanilor-1.sumupstore.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-2"
            >
                <StoreIcon className="w-5 h-5" />
                {t('homeRvrStore')}
            </a>
            <button
                onClick={() => setDonationModalOpen(true)}
                className="w-full sm:w-auto bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-2"
            >
                <DonateIcon className="w-5 h-5" />
                {t('homeDonateButton')}
            </button>
            <button 
                onClick={() => setContactModalOpen(true)}
                className="w-full sm:w-auto bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-2"
            >
                <MailIcon className="w-5 h-5" />
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
      {isDonationModalOpen && <DonationModal onClose={() => setDonationModalOpen(false)} />}
    </div>
  );
};

export default HomePage;