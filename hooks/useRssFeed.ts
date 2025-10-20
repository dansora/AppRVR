import { useState, useEffect } from 'react';

export interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content: string;
  imageUrl?: string;
}

interface RssFeedState {
  items: RssItem[];
  loading: boolean;
  error: Error | null;
}

const CORS_PROXY = "https://cors.eu.org/";

const useRssFeed = (feedUrl: string, limit: number = 10): RssFeedState => {
  const [state, setState] = useState<RssFeedState>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchFeed = async () => {
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        const response = await fetch(`${CORS_PROXY}${feedUrl}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const items = Array.from(xml.querySelectorAll('item')).slice(0, limit).map(item => {
          
          const description = item.querySelector('description')?.textContent || '';
          const doc = parser.parseFromString(`<!doctype html><body>${description}`, 'text/html');
          const imageUrl = doc.querySelector('img')?.src;

          return {
            title: item.querySelector('title')?.textContent || '',
            link: item.querySelector('link')?.textContent || '',
            pubDate: item.querySelector('pubDate')?.textContent || '',
            description: doc.body.textContent?.trim() || '',
            content: item.querySelector('content\\:encoded, encoded')?.textContent || '',
            imageUrl: imageUrl,
          };
        });
        setState({ items, loading: false, error: null });
      } catch (error) {
        console.error("Failed to fetch RSS feed:", error);
        setState({ items: [], loading: false, error: error as Error });
      }
    };

    if (feedUrl) {
        fetchFeed();
    }
  }, [feedUrl, limit]);

  return state;
};

export default useRssFeed;