import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';

interface Advertisement {
  id: number;
  title: string;
  text: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  link_url: string;
}

const AdCarousel: React.FC = () => {
  const { t } = useLanguage();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('advertisements')
        .select('id, title, text, media_url, media_type, link_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // Log the error for debugging but don't show it to the user.
        // The component will just not render if there's an issue.
        console.error('Error fetching ads:', error.message);
      } else {
        setAds(data || []);
      }
      setLoading(false);
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [currentIndex, ads.length]);

  if (loading) {
    return (
      <div className="bg-marine-blue-darker p-4 rounded-lg text-center">
        <p className="text-white/70">{t('newsLoading')}</p>
      </div>
    );
  }

  if (ads.length === 0) {
    return null; // Don't render anything if there are no active ads
  }

  return (
    <div>
      <h3 className="text-xl font-montserrat text-white mb-4">{t('advertisingSectionTitle')}</h3>
      <div className="relative w-full rounded-lg shadow-lg overflow-hidden">
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {ads.map((ad) => (
            <div key={ad.id} className="w-full flex-shrink-0">
                <a
                    href={ad.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-1/4 flex-shrink-0">
                        {ad.media_type === 'image' ? (
                            <img src={ad.media_url} alt={ad.title} className="w-full rounded-md object-cover aspect-square" />
                        ) : (
                            <video src={ad.media_url} className="w-full rounded-md object-cover aspect-square" autoPlay loop muted playsInline />
                        )}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold font-montserrat text-golden-yellow mb-2">{ad.title}</h3>
                            {ad.text && (
                                <p className="text-white/80 text-sm whitespace-pre-wrap">{ad.text}</p>
                            )}
                        </div>
                    </div>
                </a>
            </div>
          ))}
        </div>

        {/* Dots */}
        {ads.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
            {ads.map((_, index) => (
                <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                    currentIndex === index ? 'bg-golden-yellow' : 'bg-white/50 hover:bg-white'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdCarousel;
