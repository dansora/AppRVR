import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronRightIcon } from './Icons';

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
    <div className="bg-marine-blue-darker rounded-lg shadow-lg overflow-hidden">
      {event.image_url && (
        <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-xl font-bold font-montserrat text-golden-yellow mb-2">{event.title}</h3>
        <div className="text-xs text-white/70 mb-2">
            <span>{new Date(event.start_date).toLocaleString()}</span> - <span>{new Date(event.end_date).toLocaleString()}</span>
        </div>
        {event.description && <p className="text-white/80 text-sm mb-4 whitespace-pre-wrap">{event.description}</p>}
        {event.link_url && (
          <a
            href={event.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-golden-yellow text-marine-blue font-bold py-2 px-4 rounded-full hover:bg-yellow-400 transition-colors text-sm"
          >
            {t('viewEvent')}
            <ChevronRightIcon className="w-5 h-5" />
          </a>
        )}
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
    </div>
  );
};

export default EventsPage;