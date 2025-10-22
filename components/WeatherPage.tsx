import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../types';

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

  const warningLinks = [
    {
      title: t('weatherRoWarningsLinkText'),
      href: 'https://www.meteoromania.ro/avertizari-nowcasting/',
    },
    {
      title: t('weatherUkWarningsLinkText'),
      href: 'https://www.metoffice.gov.uk/weather/warnings-and-advice/uk-warnings',
    },
  ];


  return (
    <div className="p-4 text-white font-roboto pb-20">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-4">{t('weatherTitle')}</h1>
        <div className="flex gap-4 mb-6">
            <button onClick={() => setActivePage(Page.News)} className="flex-1 bg-marine-blue-darker text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-marine-blue-darkest transition-colors">
                {t('navNews')}
            </button>
            <button onClick={() => setActivePage(Page.Sport)} className="flex-1 bg-marine-blue-darker text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-marine-blue-darkest transition-colors">
                {t('navSport')}
            </button>
        </div>
      
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

      <h2 className="text-2xl font-montserrat text-golden-yellow mt-8 mb-4">{t('weatherWarningsTitle')}</h2>
      <div className="space-y-4">
        {warningLinks.map(link => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-marine-blue-darker p-6 rounded-lg hover:bg-marine-blue-darkest transition-colors shadow-md text-center border-l-4 border-golden-yellow"
          >
            <h2 className="text-xl font-montserrat text-white">{link.title}</h2>
          </a>
        ))}
      </div>

    </div>
  );
};

export default WeatherPage;