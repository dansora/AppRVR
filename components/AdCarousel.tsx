
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import DetailModal from './DetailModal';

interface Advertisement {
  id: number;
  title: string;
  text: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  link_url: string;
  start_date?: string | null;
  end_date?: string | null;
}

const AdCarousel: React.FC = () => {
  const { t } = useLanguage();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      let finalAds: Advertisement[] = [];

      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42703') { 
          const { data: fallbackData } = await supabase
            .from('advertisements')
            .select('id, title, text, media_url, media_type, link_url')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
          finalAds = fallbackData || [];
        } else {
          console.error('Eroare la preluarea reclamelor:', error.message);
        }
      } else {
        finalAds = data || [];
      }
      
      setAds(finalAds);
      setLoading(false);
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 1 && !selectedAd) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 15000); 

      return () => clearTimeout(timer);
    }
  }, [currentIndex, ads.length, selectedAd]);

  if (loading) {
    return (
      <div className="bg-marine-blue-darker p-4 rounded-lg text-center">
        <p className="text-white/70">{t('newsLoading')}</p>
      </div>
    );
  }

  if (ads.length === 0) {
    return null;
  }

  return (
    <>
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
                    <div
                        onClick={() => setSelectedAd(ad)}
                        className="block bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow cursor-pointer hover:bg-marine-blue-darkest transition-colors min-h-[172px]"
                    >
                        <div className="flex items-center gap-4 h-full">
                            <div className="w-1/3 flex-shrink-0">
                            {ad.media_type === 'image' ? (
                                <img src={ad.media_url} alt={ad.title} className="w-full rounded-md object-cover aspect-square" />
                            ) : (
                                <video src={ad.media_url} className="w-full rounded-md object-cover aspect-square" muted playsInline />
                            )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold font-montserrat text-golden-yellow mb-2 line-clamp-2">{ad.title}</h3>
                                {ad.text && (
                                    <p className="text-white/80 text-sm line-clamp-3">{ad.text}</p>
                                )}
                            </div>
                        </div>
                    </div>
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

        {selectedAd && (
            <DetailModal
                title={selectedAd.title}
                content={selectedAd.text}
                imageUrl={selectedAd.media_type === 'image' ? selectedAd.media_url : null}
                videoUrl={selectedAd.media_type === 'video' ? selectedAd.media_url : null}
                actionLabel="Vizitează Link-ul"
                onAction={() => window.open(selectedAd.link_url, '_blank')}
                onClose={() => setSelectedAd(null)}
            />
        )}
    </>
  );
};

export default AdCarousel;
