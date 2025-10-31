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

// Array of CORS proxies to try in order.
const CORS_PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?", // Fallback proxy
];
const FETCH_TIMEOUT = 15000; // 15 seconds

const useRssFeed = (feedUrl: string, limit: number = 10): RssFeedState => {
  const cacheKey = `rvr-rss-cache-${feedUrl}`;
  
  const [items, setItems] = useState<RssItem[]>(() => {
    try {
        const cachedItems = localStorage.getItem(cacheKey);
        return cachedItems ? JSON.parse(cachedItems) : [];
    } catch (error) {
        console.error("Failed to parse cached RSS feed:", error);
        return [];
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    let lastError: Error | null = null;

    for (const proxyUrl of CORS_PROXIES) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            const fetchUrl = `${proxyUrl}${encodeURIComponent(feedUrl)}`;
            const response = await fetch(fetchUrl, {
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, 'text/xml');
            
            const errorNode = xml.querySelector('parsererror');
            if (errorNode) {
                throw new Error('Failed to parse XML. Proxy might be down or blocked.');
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
            
            if (newItems.length > 0) {
                setItems(newItems);
                try {
                    localStorage.setItem(cacheKey, JSON.stringify(newItems));
                } catch (cacheError) {
                    console.error("Failed to cache RSS feed:", cacheError);
                }
                
                // Success, break the loop
                setLoading(false);
                return;
            } else {
                 throw new Error("No items found in RSS feed response.");
            }

        } catch (err) {
            if ((err as Error).name === 'AbortError') {
                lastError = new Error('Request timed out. The server took too long to respond.');
            } else {
                lastError = err as Error;
            }
            console.warn(`Failed to fetch via ${proxyUrl}. Trying next...`, lastError);
        } finally {
            clearTimeout(timeoutId);
        }
    }

    // If all proxies failed, set the final error
    console.error("Failed to fetch RSS feed from all proxies:", lastError);
    setError(lastError);
    setLoading(false);
  }, [feedUrl, limit, cacheKey]);

  useEffect(() => {
    if (feedUrl) {
      fetchFeed();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedUrl]);

  return { items, loading, error, refetch: fetchFeed };
};

export default useRssFeed;