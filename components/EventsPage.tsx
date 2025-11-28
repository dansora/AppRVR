
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronRightIcon } from './Icons';
import DetailModal from './DetailModal';

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  start_date: string;
  end_date: string;
}

const EventsPage: React.FC = () => {
  const { t } = useLanguage();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      const now = new Date();

      try {
        const { data, error: queryError } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .order('start_date', { ascending: true });

        if (queryError) throw queryError;
        
        const allEvents = data || [];
        const upcoming = allEvents.filter(event => new Date(event.end_date) >= now);
        const past = allEvents.filter(event => new Date(event.end_date) < now).reverse();

        setUpcomingEvents(upcoming);
        setPastEvents(past);

      } catch (err: any) {
        const errorMessage = err.message || (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err));
        setError(`${t('newsError')}: ${errorMessage}`);
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [t]);

  const EventCard: React.FC<{ event: Event }> = ({ event }) => (
    <div 
        onClick={() => setSelectedEvent(event)}
        className="bg-marine-blue-darker p-4 rounded-lg shadow-lg border-l-4 border-golden-yellow flex items-center gap-4 cursor-pointer hover:bg-marine-blue-darkest transition-colors min-h-[172px]"
    >
      {event.image_url && (
        <div className="w-1/3 flex-shrink-0">
            <img src={event.image_url} alt={event.title} className="w-full rounded-md object-cover aspect-square" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-xl font-bold font-montserrat text-golden-yellow mb-2 line-clamp-2">{event.title}</h3>
        <div className="text-xs text-white/70 mb-2">
            <span>{new Date(event.start_date).toLocaleDateString()}</span> - <span>{new Date(event.end_date).toLocaleDateString()}</span>
        </div>
        {event.description && <p className="text-white/80 text-sm line-clamp-3">{event.description}</p>}
        <div className="mt-2 text-golden-yellow text-xs font-bold flex items-center gap-1">
            {t('viewEvent')} <ChevronRightIcon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('eventsPageTitle')}</h1>
      
      {loading ? <p>{t('newsLoading')}</p> : error ? <p className="text-red-400">{error}</p> : (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-montserrat text-white mb-4">{t('upcomingEvents')}</h2>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            ) : <p className="text-white/70">{t('noUpcomingEvents')}</p>}
          </div>

          <div>
            <h2 className="text-2xl font-montserrat text-white mb-4">{t('pastEvents')}</h2>
            {pastEvents.length > 0 ? (
              <div className="space-y-4">
                {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
              </div>
            ) : <p className="text-white/70">{t('noPastEvents')}</p>}
          </div>
        </div>
      )}

      {selectedEvent && (
        <DetailModal
            title={selectedEvent.title}
            content={selectedEvent.description}
            imageUrl={selectedEvent.image_url}
            date={`${new Date(selectedEvent.start_date).toLocaleString()} - ${new Date(selectedEvent.end_date).toLocaleString()}`}
            actionLabel={selectedEvent.link_url ? t('viewEvent') : undefined}
            onAction={selectedEvent.link_url ? () => window.open(selectedEvent.link_url!, '_blank') : undefined}
            onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
};

export default EventsPage;
