import { useState, useEffect, useCallback } from 'react';

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
  refetch: () => Promise<void>;
}

const CORS_PROXY_URL = "https://api.allorigins.win/raw?url=";

const useRssFeed = (feedUrl: string, limit: number = 10): RssFeedState => {
  const [items, setItems] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${CORS_PROXY_URL}${encodeURIComponent(feedUrl)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      
      const errorNode = xml.querySelector('parsererror');
      if (errorNode) {
          throw new Error('Failed to parse XML');
      }

      const newItems = Array.from(xml.querySelectorAll('item')).slice(0, limit).map(item => {
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
      setItems(newItems);
    } catch (err) {
      console.error("Failed to fetch RSS feed:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [feedUrl, limit]);

  useEffect(() => {
    if (feedUrl) {
      fetchFeed();
    }
  }, [feedUrl, fetchFeed]);

  return { items, loading, error, refetch: fetchFeed };
};

export default useRssFeed;