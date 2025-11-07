import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { useProfile } from '../contexts/ProfileContext';
import { Page } from '../types';
import { TrophyIcon } from './Icons';

interface ActiveContestSlide {
  type: 'active';
  id: number;
  title: string;
  prizes: string | null;
  image_url: string | null;
}

interface UpcomingContestSlide {
  type: 'upcoming';
  id: number;
  title: string;
  prizes: string | null;
  image_url: string | null;
  start_date: string;
}

interface Winner {
    username: string;
}

interface PastContestSlide {
    type: 'past';
    contestTitle: string;
    winners: Winner[];
}

type CarouselSlide = ActiveContestSlide | UpcomingContestSlide | PastContestSlide;

interface ContestCarouselProps {
    setActivePage: (page: Page) => void;
    openAuthModal: () => void;
}

const ContestCarousel: React.FC<ContestCarouselProps> = ({ setActivePage, openAuthModal }) => {
  const { t } = useLanguage();
  const { session } = useProfile();
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContestData = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      let finalSlides: CarouselSlide[] = [];

      // 1. Fetch active contests
      const { data: activeData } = await supabase
        .from('contests')
        .select('id, title, prizes, image_url')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true });
        
      if (activeData && activeData.length > 0) {
        finalSlides.push(...activeData.map(c => ({ ...c, type: 'active' as const })));
      } else {
        // 2. If no active contests, fetch the next upcoming one
        const { data: upcomingData } = await supabase
          .from('contests')
          .select('id, title, prizes, image_url, start_date')
          .eq('is_active', true)
          .gt('start_date', now)
          .order('start_date', { ascending: true })
          .limit(1);
        
        if (upcomingData && upcomingData.length > 0) {
          finalSlides.push(...upcomingData.map(c => ({ ...c, type: 'upcoming' as const })));
        }
      }

      // 3. Fetch up to 3 most recent contests that have winners
      const { data: pastContests } = await supabase
        .from('contests')
        .select('id, title, prizes, image_url')
        .lt('end_date', now)
        .order('end_date', { ascending: false })
        .limit(3);
      
      if (pastContests) {
          const pastContestPromises = pastContests.map(async (contest) => {
              const { data: winnersData } = await supabase
                .from('contest_participants')
                .select('profiles!left(username)')
                .eq('contest_id', contest.id)
                .eq('is_winner', true);
              
              if (winnersData && winnersData.length > 0) {
                return {
                    type: 'past' as const,
                    contestTitle: contest.title,
                    winners: winnersData.map(w => ({ username: w.profiles?.username || 'N/A' })),
                };
              }
              return null;
          });
          
          const pastSlides = (await Promise.all(pastContestPromises)).filter(Boolean) as PastContestSlide[];
          finalSlides.push(...pastSlides);
      }
      
      setSlides(finalSlides);
      setLoading(false);
    };

    fetchContestData();
  }, []);

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
          setActivePage(Page.Upload);
      } else {
          openAuthModal();
      }
  }

  if (loading || slides.length === 0) {
    return null;
  }

  const renderSlide = (slide: CarouselSlide) => {
      switch(slide.type) {
          case 'active':
            return (
                <div className="flex items-center gap-4">
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
            );
          case 'upcoming':
            return (
                <div className="flex items-center gap-4">
                    {slide.image_url && 
                        <div className="w-1/4 flex-shrink-0">
                            <img src={slide.image_url} alt={slide.title} className="w-full rounded-md object-cover aspect-square" />
                        </div>
                    }
                    <div className="flex-1">
                        <p className="text-sm font-bold text-golden-yellow mb-2">{t('comingSoon')}</p>
                        <h3 className="text-lg font-bold font-montserrat text-white mb-2">{slide.title}</h3>
                        <p className="text-white/80 text-xs">{t('pollStartsOn', { date: new Date(slide.start_date).toLocaleString() })}</p>
                    </div>
                </div>
            );
          case 'past':
            return (
                <div className="flex flex-col items-center justify-center text-center py-4">
                    <TrophyIcon className="w-12 h-12 text-golden-yellow mb-2"/>
                    <h3 className="text-lg font-bold font-montserrat text-white mb-2">{t('winnerCardTitle')}</h3>
                    <p className="text-sm text-white/80 mb-1 font-semibold">{slide.contestTitle}</p>
                    <p className="text-white/90 text-md line-clamp-2">{slide.winners.map(w => w.username).join(', ')}</p>
                </div>
            );
      }
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
                <div className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow min-h-[172px] flex flex-col justify-center">
                    {renderSlide(slide)}
                </div>
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