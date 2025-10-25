import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { InfoIcon } from './Icons';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface AnnouncementsProps {
  userId?: string;
}

const Announcements: React.FC<AnnouncementsProps> = ({ userId }) => {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('announcements')
          .select('id, title, content, created_at');

        if (userId) {
          // Logged-in user: fetch public AND user-specific announcements
          query = query.or(`user_id.is.null,user_id.eq.${userId}`);
        } else {
          // Not logged-in: fetch only public announcements
          query = query.is('user_id', null);
        }
        
        query = query.order('created_at', { ascending: false });

        const { data, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        if (data) {
          setAnnouncements(data as Announcement[]);
        }
      } catch (err: any) {
        console.error('Error fetching announcements:', err);
        let specificError = 'An unknown error occurred.';
        if (typeof err === 'object' && err !== null) {
            specificError = (err as any).message || JSON.stringify(err);
        } else if (err) {
            specificError = String(err);
        }
        setError(`${t('newsError')}: ${specificError}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [userId, t]);

  if (loading) {
    return (
      <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('announcementsTitle')}</h2>
        <p className="text-white/70">{t('newsLoading')}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-montserrat mb-4 text-golden-yellow flex items-center gap-2">
            <InfoIcon className="w-6 h-6" />
            {t('announcementsTitle')}
        </h2>
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (announcements.length === 0) {
    // Don't show anything if there are no announcements
    return null;
  }

  return (
    <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-montserrat mb-4 text-golden-yellow flex items-center gap-2">
        <InfoIcon className="w-6 h-6" />
        {t('announcementsTitle')}
      </h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {announcements.map(ann => (
          <div key={ann.id} className="p-4 bg-marine-blue-darkest/50 rounded-md">
            <h3 className="font-bold text-white mb-1">{ann.title}</h3>
            <p className="text-white/80 text-sm whitespace-pre-wrap">{ann.content}</p>
            <p className="text-xs text-white/50 mt-2 text-right">
              {new Date(ann.created_at).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;