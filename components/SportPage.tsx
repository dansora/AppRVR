import React, { useState } from 'react';
import useRssFeed from '../hooks/useRssFeed';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../types';
import { RefreshIcon } from './Icons';

interface SportPageProps {
  setActivePage: (page: Page) => void;
}

const SPORT_FEED_URL = "https://www.digisport.ro/rss";
const REFRESH_THRESHOLD = 80; // pixels

const SportPage: React.FC<SportPageProps> = ({ setActivePage }) => {
  const { items, loading, error, refetch } = useRssFeed(SPORT_FEED_URL, 10);
  const { t } = useLanguage();

  const [touchStartY, setTouchStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === 0) return;

    const currentY = e.touches[0].clientY;
    let distance = currentY - touchStartY;
    
    if (distance > 0) {
       e.preventDefault();
       setPullDistance(Math.min(distance, REFRESH_THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= REFRESH_THRESHOLD) {
      setIsRefreshing(true);
      await refetch();
      setIsRefreshing(false);
    }
    setTouchStartY(0);
    setPullDistance(0);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderContent = () => {
    if (loading && items.length === 0) {
      return <div className="text-center p-10">{t('newsLoading')}</div>;
    }
    if (error) {
      return <div className="text-center p-10 text-red-400">{t('newsError')}</div>;
    }
    if (items.length === 0) {
      return <div className="text-center p-10">{t('newsNoItems')}</div>;
    }
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <a
            key={item.link || index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-marine-blue-darker p-4 rounded-lg hover:bg-marine-blue-darkest transition-colors shadow-md"
          >
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-md mb-4" />
            )}
            <h3 className="text-lg font-bold font-montserrat text-golden-yellow">{item.title}</h3>
            <p className="text-xs text-white/60 mt-1 mb-2">{formatDate(item.pubDate)}</p>
            <p className="text-white/80 text-sm leading-relaxed">{item.description}</p>
          </a>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="p-4 text-white font-roboto pb-20 relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
        <div 
            className="absolute top-0 left-0 right-0 flex justify-center items-center transition-opacity"
            style={{ height: `${REFRESH_THRESHOLD}px`, opacity: pullDistance / REFRESH_THRESHOLD, transform: `translateY(${Math.min(pullDistance, REFRESH_THRESHOLD)}px)` }}
        >
            {isRefreshing ? (
                <RefreshIcon className="w-8 h-8 text-golden-yellow animate-spin" />
            ) : (
                <div className="text-center text-golden-yellow">
                    <RefreshIcon 
                        className="w-8 h-8 mx-auto transition-transform" 
                        style={{ transform: `rotate(${pullDistance * 2}deg)` }}
                    />
                    <p className="text-sm mt-1">{pullDistance >= REFRESH_THRESHOLD ? t('releaseToRefresh') : t('pullToRefresh')}</p>
                </div>
            )}
        </div>
        
        <div style={{ transform: `translateY(${pullDistance}px)` }} className="transition-transform">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-montserrat text-golden-yellow">{t('navSport')}</h1>
            </div>
            <div className="flex gap-4 mb-6">
                <button onClick={() => setActivePage(Page.News)} className="flex-1 bg-marine-blue-darker text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-marine-blue-darkest transition-colors">
                    {t('navNews')}
                </button>
                <button onClick={() => setActivePage(Page.Weather)} className="flex-1 bg-marine-blue-darker text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-marine-blue-darkest transition-colors">
                    {t('homeWeatherTitle')}
                </button>
            </div>
          {renderContent()}
        </div>
    </div>
  );
};

export default SportPage;