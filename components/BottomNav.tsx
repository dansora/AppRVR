import React from 'react';
import { Page } from '../types';
import { HomeIcon, NewsIcon, UploadIcon, PollIcon, EventsIcon } from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  page: Page;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
  const activeClass = 'text-golden-yellow';
  const inactiveClass = 'text-white/70 hover:text-white';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs mt-1 font-roboto">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { t } = useLanguage();
  
  const navItems = [
    { icon: HomeIcon, label: t('navHome'), page: Page.Home },
    { icon: NewsIcon, label: t('navNews'), page: Page.News },
    { icon: UploadIcon, label: t('navSocial'), page: Page.Upload },
    { icon: PollIcon, label: t('navPolls'), page: Page.Polls },
    { icon: EventsIcon, label: t('navEvents'), page: Page.Events },
  ];

  const newsPages = [Page.News, Page.Sport, Page.Weather];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-r from-marine-blue-darker to-marine-blue-darkest border-t border-white/20 flex z-50">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          page={item.page}
          isActive={
            item.page === Page.News 
              ? newsPages.includes(activePage) 
              : activePage === item.page
          }
          onClick={() => {
            setActivePage(item.page);
          }}
        />
      ))}
    </nav>
  );
};

export default BottomNav;