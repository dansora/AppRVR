import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { NewsIcon, SportIcon, WeatherIcon, ChevronRightIcon, FacebookIcon, WhatsAppIcon, YouTubeIcon, LinkedInIcon, MailIcon, DonateIcon, StoreIcon, EventsIcon, InfoIcon, AdvertisingIcon } from './Icons';
import ContactModal from './ContactModal';
import DonationModal from './DonationModal';
import RedirectModal from './RedirectModal';
import { supabase } from '../services/supabaseClient';
import AnnouncementCard from './AnnouncementCard';

interface HomePageProps {
  setActivePage: (page: Page) => void;
  isLoggedIn: boolean;
  openAuthModal: () => void;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url: string | null;
}

const HomePage: React.FC<HomePageProps> = ({ setActivePage, isLoggedIn, openAuthModal }) => {
  const { t } = useLanguage();
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isDonationModalOpen, setDonationModalOpen] = useState(false);
  const [redirectInfo, setRedirectInfo] = useState<{ title: string; url: string } | null>(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .is('user_id', null) // Only public
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
            console.error("Error fetching latest announcement:", error);
        } else if (data) {
            setLatestAnnouncement(data);
        }
    };
    fetchLatestAnnouncement();
  }, []);

  const urls = {
    events: "https://radiovocearomanilor.com/wp/informatii-utile/evenimente-rvr/",
    usefulInfo: "https://radiovocearomanilor.com/wp/informatii-utile/",
    advertising: "https://radiovocearomanilor.com/wp/informatii-utile/publicitate-rvr/",
    store: "https://radio-vocea-romanilor-1.sumupstore.com/"
  };

  const quickLinks = [
    { key: Page.News, icon: NewsIcon, title: t('navNews'), action: () => setActivePage(Page.News) },
    { key: Page.Sport, icon: SportIcon, title: t('navSport'), action: () => setActivePage(Page.Sport) },
    { key: Page.Weather, icon: WeatherIcon, title: t('homeWeatherTitle'), action: () => setActivePage(Page.Weather) },
    { key: Page.Events, icon: EventsIcon, title: t('navEvents'), action: () => setRedirectInfo({ title: t('navEvents'), url: urls.events }) },
    { key: Page.UsefulInfo, icon: InfoIcon, title: t('navUsefulInfo'), action: () => setRedirectInfo({ title: t('navUsefulInfo'), url: urls.usefulInfo }) },
    { key: Page.Advertising, icon: AdvertisingIcon, title: t('navAdvertising'), action: () => setRedirectInfo({ title: t('navAdvertising'), url: urls.advertising }) },
  ];

  const socialLinks = [
    { href: "https://www.facebook.com/groups/1331920294319593", icon: FacebookIcon },
    { href: "https://chat.whatsapp.com/DZzIOARyfbwIq3LUPAiP1G?mode=wwc", icon: WhatsAppIcon },
    { href: "https://www.youtube.com/@radiovocearomanilor8992", icon: YouTubeIcon },
    { href: "https://www.linkedin.com/", icon: LinkedInIcon },
  ];

  return (
    <div className="p-4 text-white font-roboto pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-montserrat text-white/90">{t('homeWelcome_line1')}</h1>
        <h2 className="text-3xl font-bold font-montserrat text-golden-yellow">{t('homeWelcome_line2')}</h2>
      </header>
      
      {latestAnnouncement && (
        <div className="mb-8">
            <AnnouncementCard announcement={latestAnnouncement}>
                <button
                    onClick={() => isLoggedIn ? setActivePage(Page.Profile) : openAuthModal()}
                    className="mt-4 self-end bg-golden-yellow/20 text-golden-yellow font-bold py-2 px-4 rounded-full hover:bg-golden-yellow/30 transition-colors text-sm flex items-center gap-2"
                >
                    {isLoggedIn ? t('homeSeeAllAnnouncements') : t('homeSeeMoreLogin')}
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </AnnouncementCard>
        </div>
      )}

      <div className="space-y-4">
        
        <h3 className="text-xl font-montserrat text-white pt-4">{t('homeQuickLinks')}</h3>
        <div className="space-y-3">
             {quickLinks.map(link => (
                 <button key={link.key} onClick={link.action} className="w-full bg-marine-blue-darker p-4 rounded-lg flex items-center text-left hover:bg-marine-blue-darkest transition-colors shadow-md">
                     <link.icon className="w-6 h-6 text-golden-yellow mr-4" />
                     <span className="flex-1 font-bold text-white font-montserrat">{link.title}</span>
                     <ChevronRightIcon className="w-6 h-6 text-white/50" />
                 </button>
             ))}
        </div>
        
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
                onClick={() => setRedirectInfo({ title: t('homeRvrStore'), url: urls.store })}
                className="w-full sm:w-auto bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-2"
            >
                <StoreIcon className="w-5 h-5" />
                {t('homeRvrStore')}
            </button>
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
      {redirectInfo && <RedirectModal title={redirectInfo.title} url={redirectInfo.url} onClose={() => setRedirectInfo(null)} />}
    </div>
  );
};

export default HomePage;
