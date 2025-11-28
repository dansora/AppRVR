
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { EventsIcon, ChevronRightIcon } from './Icons';
import { Page } from '../types';

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
}

interface EventsCarouselProps {
    setActivePage: (page: Page) => void;
}

const EventsCarousel: React.FC<EventsCarouselProps> = ({ setActivePage }) => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const now = new Date().toISOString();

      // Fetch events that are active and not ended yet
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, image_url, start_date, end_date')
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
    if (events.length > 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
      }, 8000); // 8 seconds per slide

      return () => clearTimeout(timer);
    }
  }, [currentIndex, events.length]);

  if (loading || events.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-xl font-montserrat text-white mb-4 flex items-center gap-2">
          <EventsIcon className="w-6 h-6 text-golden-yellow" />
          {t('homeEventsTitle')}
      </h3>
      <div 
        className="relative w-full rounded-lg shadow-lg overflow-hidden cursor-pointer group"
        onClick={() => setActivePage(Page.Events)}
      >
        {/* Slides Container */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {events.map((event) => (
            <div key={event.id} className="w-full flex-shrink-0">
                <div className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow min-h-[172px] flex items-center gap-4">
                    {event.image_url && (
                        <div className="w-1/4 flex-shrink-0">
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

        {/* Dots */}
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
    </div>
  );
};

export default EventsCarousel;
