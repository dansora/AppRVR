
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { useProfile } from '../contexts/ProfileContext';
import { Page } from '../types';
import { TrophyIcon } from './Icons';
import DetailModal from './DetailModal';

interface ActiveContestSlide {
  type: 'active';
  id: number;
  title: string;
  prizes: string | null;
  image_url: string | null;
  description?: string;
  end_date?: string;
}

interface UpcomingContestSlide {
  type: 'upcoming';
  id: number;
  title: string;
  prizes: string | null;
  image_url: string | null;
  start_date: string;
  description?: string;
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
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null);

  useEffect(() => {
    const fetchContestData = async () => {
      setLoading(true);
      const now = new Date().toISOString();
      const finalSlides: CarouselSlide[] = [];

      const { data: futureContests, error: futureError } = await supabase
        .from('contests')
        .select('id, title, prizes, image_url, start_date, end_date, description')
        .eq('is_active', true)
        .gte('end_date', now)
        .order('start_date', { ascending: true });

      if (futureError) console.error("Error fetching active/upcoming contests:", futureError);

      const activeContests = futureContests?.filter(c => c.start_date <= now) || [];
      const upcomingContests = futureContests?.filter(c => c.start_date > now) || [];

      if (activeContests.length > 0) {
        finalSlides.push(...activeContests.map(c => ({ ...c, type: 'active' as const })));
      } 
      else if (upcomingContests.length > 0) {
        finalSlides.push({ ...upcomingContests[0], type: 'upcoming' as const });
      }

      const { data: pastContests, error: pastError } = await supabase
        .from('contests')
        .select('id, title')
        .eq('is_active', true)
        .lte('end_date', now)
        .order('end_date', { ascending: false })
        .limit(3);

      if (pastError) console.error("Error fetching past contests:", pastError);

      if (pastContests) {
          for (const contest of pastContests) {
              const { data: winnersData, error: winnersError } = await supabase
                .from('contest_participants')
                .select('profiles!left(username)')
                .eq('contest_id', contest.id)
                .eq('is_winner', true);
              
              if (winnersError) continue;

              if (winnersData && winnersData.length > 0) {
                finalSlides.push({
                    type: 'past' as const,
                    contestTitle: contest.title,
                    winners: winnersData.map(w => ({ username: w.profiles?.username || 'N/A' })).filter(w => w.username !== 'N/A'),
                });
              }
          }
      }
      
      setSlides(finalSlides.filter(s => s.type !== 'past' || (s.type === 'past' && s.winners.length > 0)));
      setLoading(false);
    };

    fetchContestData();
  }, []);

  useEffect(() => {
    if (slides.length > 1 && !selectedSlide) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 10000); 

      return () => clearTimeout(timer);
    }
  }, [currentIndex, slides.length, selectedSlide]);

  const handleParticipateClick = () => {
      setSelectedSlide(null); // Close modal first
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
                        <div className="w-1/3 flex-shrink-0">
                            <img src={slide.image_url} alt={slide.title} className="w-full rounded-md object-cover aspect-square" />
                        </div>
                    }
                    <div className="flex-1">
                        <h3 className="text-lg font-bold font-montserrat text-golden-yellow mb-2 line-clamp-2">{slide.title}</h3>
                        {slide.prizes && (
                            <p className="text-white/80 text-sm mb-4 line-clamp-2"><span className="font-semibold">{t('prizes')}:</span> {slide.prizes}</p>
                        )}
                        <button className="text-golden-yellow text-sm font-bold underline">
                            {t('participateNow')}
                        </button>
                    </div>
                </div>
            );
          case 'upcoming':
            return (
                <div className="flex items-center gap-4">
                    {slide.image_url && 
                        <div className="w-1/3 flex-shrink-0">
                            <img src={slide.image_url} alt={slide.title} className="w-full rounded-md object-cover aspect-square" />
                        </div>
                    }
                    <div className="flex-1">
                        <p className="text-sm font-bold text-golden-yellow mb-2">{t('comingSoon')}</p>
                        <h3 className="text-lg font-bold font-montserrat text-white mb-2 line-clamp-2">{slide.title}</h3>
                        <p className="text-white/80 text-xs">{t('pollStartsOn', { date: new Date(slide.start_date).toLocaleDateString() })}</p>
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

  const getModalContent = () => {
      if (!selectedSlide) return null;
      if (selectedSlide.type === 'past') return null; // No modal for past winners

      return (
          <DetailModal
            title={selectedSlide.title}
            content={selectedSlide.description}
            imageUrl={selectedSlide.image_url}
            actionLabel={selectedSlide.type === 'active' ? t('participateNow') : undefined}
            onAction={selectedSlide.type === 'active' ? handleParticipateClick : undefined}
            onClose={() => setSelectedSlide(null)}
            extraInfo={selectedSlide.prizes ? <p className="font-bold text-golden-yellow">{t('prizes')}: <span className="text-white font-normal">{selectedSlide.prizes}</span></p> : null}
            date={selectedSlide.type === 'upcoming' ? t('pollStartsOn', { date: new Date(selectedSlide.start_date).toLocaleString() }) : t('contestEndsOn', { date: new Date(selectedSlide.end_date!).toLocaleString() })}
          />
      );
  };

  return (
    <>
        <div>
        <h3 className="text-xl font-montserrat text-white mb-4">{t('contestsCarouselTitle')}</h3>
        <div className="relative w-full rounded-lg shadow-lg overflow-hidden">
            <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
            {slides.map((slide, index) => (
                <div key={index} className="w-full flex-shrink-0">
                    <div 
                        onClick={() => slide.type !== 'past' && setSelectedSlide(slide)}
                        className={`bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow min-h-[172px] flex flex-col justify-center transition-colors ${slide.type !== 'past' ? 'cursor-pointer hover:bg-marine-blue-darkest' : ''}`}
                    >
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
        {getModalContent()}
    </>
  );
};

export default ContestCarousel;
