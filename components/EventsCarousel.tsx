
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { EventsIcon, ChevronRightIcon } from './Icons';
import { Page } from '../types';
import DetailModal from './DetailModal';

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  link_url?: string | null;
}

interface EventsCarouselProps {
    setActivePage: (page: Page) => void;
}

const EventsCarousel: React.FC<EventsCarouselProps> = ({ setActivePage }) => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, image_url, start_date, end_date, link_url')
        .eq('is_active', true)
        .gte('end_date', now)
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error("Error fetching events for carousel:", error);
      } else {
        setEvents(data || []);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 1 && !selectedEvent) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
      }, 8000); 

      return () => clearTimeout(timer);
    }
  }, [currentIndex, events.length, selectedEvent]);

  if (loading || events.length === 0) {
    return null;
  }

  const handleCloseModal = () => {
      setSelectedEvent(null);
  };

  const handleModalAction = () => {
      if (selectedEvent?.link_url) {
          window.open(selectedEvent.link_url, '_blank');
      } else {
          setActivePage(Page.Events);
      }
      handleCloseModal();
  };

  return (
    <>
        <div onClick={() => setActivePage(Page.Events)} className="cursor-pointer">
            <h3 className="text-xl font-montserrat text-white mb-4 flex items-center gap-2">
                <EventsIcon className="w-6 h-6 text-golden-yellow" />
                {t('homeEventsTitle')}
            </h3>
        </div>
        
        <div className="relative w-full rounded-lg shadow-lg overflow-hidden group">
            <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
            {events.map((event) => (
                <div key={event.id} className="w-full flex-shrink-0">
                    <div 
                        onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                        className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow min-h-[172px] flex items-center gap-4 cursor-pointer hover:bg-marine-blue-darkest transition-colors"
                    >
                        {event.image_url && (
                            <div className="w-1/3 flex-shrink-0">
                                <img src={event.image_url} alt={event.title} className="w-full rounded-md object-cover aspect-square" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h4 className="text-lg font-bold font-montserrat text-white mb-1 line-clamp-2">{event.title}</h4>
                            <p className="text-xs text-white/80 line-clamp-3">
                                {event.description}
                            </p>
                            <div className="mt-2 text-golden-yellow text-xs font-bold flex items-center gap-1 group-hover:underline">
                                {t('viewEvent')} <ChevronRightIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>

            {events.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                {events.map((_, index) => (
                    <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                    className={`w-2 h-2 rounded-full transition-colors ${
                        currentIndex === index ? 'bg-golden-yellow' : 'bg-white/50 hover:bg-white'
                    }`}
                    aria-label={`Go to event slide ${index + 1}`}
                    />
                ))}
                </div>
            )}
        </div>

        {selectedEvent && (
            <DetailModal
                title={selectedEvent.title}
                content={selectedEvent.description}
                imageUrl={selectedEvent.image_url}
                date={`${new Date(selectedEvent.start_date).toLocaleDateString()} - ${new Date(selectedEvent.end_date).toLocaleDateString()}`}
                actionLabel={selectedEvent.link_url ? t('viewEvent') : t('allEvents')}
                onAction={handleModalAction}
                onClose={handleCloseModal}
            />
        )}
    </>
  );
};

export default EventsCarousel;
