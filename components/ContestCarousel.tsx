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

interface WinnerSlide {
    contestTitle: string;
    winners: Winner[];
}

interface ContestCarouselProps {
    setActivePage: (page: Page) => void;
    openAuthModal: () => void;
}

const ContestCarousel: React.FC<ContestCarouselProps> = ({ setActivePage, openAuthModal }) => {
  const { t } = useLanguage();
  const { session } = useProfile();
  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [winnerSlides, setWinnerSlides] = useState<WinnerSlide[]>([]);
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

      // Fetch up to 3 most recent contests that have ended
      const { data: pastContests, error: pastError } = await supabase
        .from('contests')
        .select('id, title')
        .lt('end_date', now)
        .order('end_date', { ascending: false })
        .limit(3);
      
      if (pastContests) {
          const winnerPromises = pastContests.map(async (contest) => {
              const { data: winnersData, error: winnersError } = await supabase
                .from('contest_participants')
                .select('profiles(username)')
                .eq('contest_id', contest.id)
                .eq('is_winner', true);
              
              if (winnersError) {
                  console.error(`Error fetching winners for contest ${contest.id}:`, winnersError.message);
                  return null;
              }

              if (winnersData && winnersData.length > 0) {
                  return {
                      contestTitle: contest.title,
                      winners: winnersData.map(w => ({ username: w.profiles?.username || 'N/A' }))
                  };
              }
              return null;
          });
          
          const results = await Promise.all(winnerPromises);
          const validWinnerSlides = results.filter((r): r is WinnerSlide => r !== null);
          setWinnerSlides(validWinnerSlides);

      } else if (pastError && pastError.code !== 'PGRST116') { // Ignore "No rows found"
          console.error("Error fetching past contests:", pastError.message);
      }

      setLoading(false);
    };

    fetchContestData();
  }, []);

  const slides = [...activeContests, ...winnerSlides];

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

  const isWinnerSlide = (slide: Contest | WinnerSlide): slide is WinnerSlide => {
    return 'contestTitle' in slide;
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
                ) : ( // It's a WinnerSlide
                    <div className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow">
                        <div className="flex flex-col items-center justify-center text-center min-h-[172px] py-4">
                           <TrophyIcon className="w-12 h-12 text-golden-yellow mb-2"/>
                           <h3 className="text-lg font-bold font-montserrat text-white mb-2">{t('winnerCardTitle')}</h3>
                           <p className="text-sm text-white/80 mb-1 font-semibold">{slide.contestTitle}</p>
                           <p className="text-white/90 text-md line-clamp-2">{slide.winners.map(w => w.username).join(', ')}</p>
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