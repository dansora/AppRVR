import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../types';
import { BackIcon } from './Icons';

interface WeatherPageProps {
  setActivePage: (page: Page) => void;
}

const WeatherPage: React.FC<WeatherPageProps> = ({ setActivePage }) => {
  const { t } = useLanguage();

  const weatherLinks = [
    {
      title: t('weatherRoLinkText'),
      href: 'https://www.meteoromania.ro/buletin-meteo/',
    },
    {
      title: t('weatherUkLinkText'),
      href: 'https://www.metoffice.gov.uk/',
    },
  ];

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('weatherTitle')}</h1>
      
      <div className="space-y-4">
        {weatherLinks.map(link => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-marine-blue-darker p-6 rounded-lg hover:bg-marine-blue-darkest transition-colors shadow-md text-center"
          >
            <h2 className="text-xl font-montserrat text-white">{link.title}</h2>
          </a>
        ))}
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

export default WeatherPage;