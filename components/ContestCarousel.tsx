import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { useProfile } from '../contexts/ProfileContext';
import { Page } from '../types';
import { TrophyIcon } from './Icons';

interface Contest {
  id: number;
  title: string;
  prizes: string | null;
  image_url: string | null;
}

interface Winner {
    username: string;
}

interface ContestCarouselProps {
    setActivePage: (page: Page) => void;
    openAuthModal: () => void;
}

const ContestCarousel: React.FC<ContestCarouselProps> = ({ setActivePage, openAuthModal }) => {
  const { t } = useLanguage();
  const { session } = useProfile();
  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [latestWinners, setLatestWinners] = useState<Winner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContestData = async () => {
      setLoading(true);
      const now = new Date().toISOString();

      // Fetch active contests
      const { data: activeData, error: activeError } = await supabase
        .from('contests')
        .select('id, title, prizes, image_url')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true });
        
      if (activeError) {
        console.error("Error fetching active contests:", activeError.message);
      } else {
        setActiveContests(activeData || []);
      }

      // Fetch the most recent contest that has ended
      const { data: pastContest, error: pastError } = await supabase
        .from('contests')
        .select('id')
        .lt('end_date', now)
        .order('end_date', { ascending: false })
        .limit(1)
        .single();
      
      if (pastContest) {
          const { data: winnersData, error: winnersError } = await supabase
            .from('contest_participants')
            .select('profiles(username)')
            .eq('contest_id', pastContest.id)
            .eq('is_winner', true);

          if (winnersData && winnersData.length > 0) {
              const winners = winnersData.map(w => ({ username: w.profiles?.username || 'N/A' }));
              setLatestWinners(winners);
          } else if (winnersError) {
               console.error("Error fetching winners:", winnersError.message);
          }
      } else if (pastError && pastError.code !== 'PGRST116') { // Ignore "No rows found"
          console.error("Error fetching past contest:", pastError.message);
      }

      setLoading(false);
    };

    fetchContestData();
  }, []);

  const slides = [...activeContests, ...(latestWinners.length > 0 ? [latestWinners] : [])];

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [currentIndex, slides.length]);

  const handleParticipateClick = () => {
      if (session) {
          setActivePage(Page.Upload); // The 'Social' page
      } else {
          openAuthModal();
      }
  }

  if (loading) {
    return null;
  }

  if (slides.length === 0) {
    return null;
  }

  const isWinnerSlide = (slide: Contest | Winner[]): slide is Winner[] => {
    return Array.isArray(slide);
  };

  return (
    <div>
      <h3 className="text-xl font-montserrat text-white mb-4">{t('contestsCarouselTitle')}</h3>
      <div className="relative w-full rounded-lg shadow-lg overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
                { !isWinnerSlide(slide) ? ( // It's a Contest
                    <div className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow">
                        <div className="flex items-start gap-4">
                            {slide.image_url && 
                                <div className="w-1/4 flex-shrink-0">
                                    <img src={slide.image_url} alt={slide.title} className="w-full rounded-md object-cover aspect-square" />
                                </div>
                            }
                            <div className="flex-1">
                                <h3 className="text-lg font-bold font-montserrat text-golden-yellow mb-2">{slide.title}</h3>
                                {slide.prizes && (
                                    <p className="text-white/80 text-sm whitespace-pre-wrap mb-4"><span className="font-semibold">{t('prizes')}:</span> {slide.prizes}</p>
                                )}
                                <button
                                    onClick={handleParticipateClick}
                                    className="bg-golden-yellow text-marine-blue font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors text-sm"
                                >
                                    {t('participateNow')}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : ( // It's a Winner array
                    <div className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow">
                        <div className="flex flex-col items-center justify-center text-center h-[172px]">
                           <TrophyIcon className="w-16 h-16 text-golden-yellow mb-2"/>
                           <h3 className="text-lg font-bold font-montserrat text-white mb-2">{t('winnerCardTitle')}</h3>
                           <p className="text-white/90 text-md">{t('lastContestWinners', { usernames: slide.map(w => w.username).join(', ') })}</p>
                        </div>
                    </div>
                )}
            </div>
          ))}
        </div>

        {slides.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
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

export default ContestCarousel;