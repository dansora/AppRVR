import React from 'react';
import useRssFeed, { RssItem } from '../hooks/useRssFeed';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings } from '../contexts/SettingsContext';

const NEWS_FEED_URL = "https://www.digi24.ro/rss";
const SPORT_FEED_URL = "https://www.digisport.ro/rss";

interface NewsFeedProps {
    category: 'news' | 'sport';
}

const NewsFeed: React.FC<NewsFeedProps> = ({ category }) => {
  const { t } = useLanguage();
  const { fontSize } = useSettings();
  const feedUrl = category === 'news' ? NEWS_FEED_URL : SPORT_FEED_URL;
  const { items, loading, error } = useRssFeed(feedUrl, 10); // Limit to 10 news items

  const getFontSizeClass = () => {
    if (fontSize === 'small') return 'text-sm';
    if (fontSize === 'large') return 'text-base';
    return 'text-base';
  };
  
  const getTitleFontSizeClass = () => {
    if (fontSize === 'small') return 'text-lg';
    if (fontSize === 'large') return 'text-xl';
    return 'text-xl';
  }

  const NewsItem: React.FC<{ item: RssItem }> = ({ item }) => (
    <a 
      href={item.link} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="block bg-marine-blue-darker p-4 rounded-lg hover:bg-marine-blue-darkest transition-colors shadow-md"
    >
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded-md mb-4" />
      )}
      <h3 className={`${getTitleFontSizeClass()} font-montserrat text-golden-yellow mb-2`}>{item.title}</h3>
      <p className={`text-white/80 ${getFontSizeClass()} line-clamp-3`}>{item.description}</p>
      <span className="text-xs text-white/50 mt-2 block">{new Date(item.pubDate).toLocaleString()}</span>
    </a>
  );

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">
        {category === 'news' ? t('navNews') : t('navSport')}
      </h1>
      {loading && <p className="text-center">{t('newsLoading')}</p>}
      {error && <p className="text-center text-red-400">{t('newsError')}</p>}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-6">
          {items.map((item, index) => (
            <NewsItem key={item.link + index} item={item} />
          ))}
        </div>
      )}
       {!loading && !error && items.length === 0 && (
        <p className="text-center text-white/70">{t('newsNoItems')}</p>
      )}
    </div>
  );
};

export default NewsFeed;