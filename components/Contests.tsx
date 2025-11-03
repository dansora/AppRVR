import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { useProfile } from '../contexts/ProfileContext';
import { TrophyIcon } from './Icons';

interface Contest {
  id: number;
  title: string;
  description: string;
  prizes: string;
  image_url: string;
  end_date: string;
  winner_id: string | null;
}

const Contests: React.FC = () => {
  const { t } = useLanguage();
  const { session, profile } = useProfile();
  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [pastContests, setPastContests] = useState<Contest[]>([]);
  const [participations, setParticipations] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ contestId: number, type: 'success' | 'error', text: string } | null>(null);

  const fetchContests = useCallback(async () => {
    setLoading(true);
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('contests')
      .select('id, title, description, prizes, image_url, end_date, winner_id')
      .eq('is_active', true)
      .order('end_date', { ascending: false });

    if (error) {
      console.error("Error fetching contests:", error);
    } else if (data) {
      const active = data.filter(c => new Date(c.end_date) > new Date());
      const past = data.filter(c => new Date(c.end_date) <= new Date() && c.winner_id);
      setActiveContests(active);
      setPastContests(past.slice(0, 3)); // Show latest 3 past contests
    }

    if (session?.user) {
      const { data: participationData, error: participationError } = await supabase
        .from('contest_participants')
        .select('contest_id')
        .eq('user_id', session.user.id);

      if (participationError) {
        console.error("Error fetching participations:", participationError);
      } else if (participationData) {
        setParticipations(new Set(participationData.map(p => p.contest_id)));
      }
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleParticipate = async (contestId: number) => {
    if (!session?.user) return;
    setMessage(null);

    const { error } = await supabase.from('contest_participants').insert({
      contest_id: contestId,
      user_id: session.user.id,
    });

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        setMessage({ contestId, type: 'error', text: t('alreadyParticipated') });
      } else {
        setMessage({ contestId, type: 'error', text: t('participationError') });
      }
    } else {
      setMessage({ contestId, type: 'success', text: t('participationSuccess') });
      fetchContests(); // Refresh participation status
    }
  };

  const renderContestCard = (contest: Contest, isPast = false) => (
    <div key={contest.id} className="bg-marine-blue-darkest/50 p-4 rounded-lg shadow-md border-l-4 border-golden-yellow">
      <h3 className="text-xl font-montserrat text-white mb-2">{contest.title}</h3>
      {contest.image_url && <img src={contest.image_url} alt={contest.title} className="w-full h-40 object-cover rounded-md mb-4" />}
      <p className="text-white/80 text-sm mb-2">{contest.description}</p>
      <p className="text-sm font-bold text-golden-yellow mb-4"><span className="font-semibold text-white">{t('prizes')}:</span> {contest.prizes}</p>
      
      {!isPast && (
        <>
            <button
            onClick={() => handleParticipate(contest.id)}
            disabled={participations.has(contest.id)}
            className="w-full bg-golden-yellow text-marine-blue font-bold py-2 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
            {participations.has(contest.id) ? t('alreadyParticipated') : t('participate')}
            </button>
            <p className="text-xs text-white/60 mt-2 text-right">{t('contestEndsOn', { date: new Date(contest.end_date).toLocaleString() })}</p>
        </>
      )}

      {isPast && (
        <div className="bg-green-500/10 p-2 rounded-md text-center">
            <p className="text-sm text-green-300">{t('contestEnded')}</p>
            {/* Future: Display winner info here */}
        </div>
      )}

      {message && message.contestId === contest.id && (
        <p className={`mt-2 text-sm text-center ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message.text}</p>
      )}
    </div>
  );

  if (loading) {
    return <div className="text-center p-4">{t('newsLoading')}</div>;
  }
  
  if (activeContests.length === 0 && pastContests.length === 0) {
      return null; // Don't show the section if no contests are available
  }

  return (
    <div className="bg-marine-blue-darker p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-montserrat text-golden-yellow mb-4 flex items-center gap-2">
        <TrophyIcon className="w-6 h-6" />
        {t('contestsTitle')}
      </h2>
      
      {activeContests.length > 0 ? (
        <div className="space-y-4">
          {activeContests.map(contest => renderContestCard(contest))}
        </div>
      ) : (
        <p className="text-white/70 text-center py-4">{t('noActiveContests')}</p>
      )}

      {pastContests.length > 0 && (
          <div className="mt-8">
              <h3 className="text-lg font-montserrat text-white/80 mb-4">{t('pastContests')}</h3>
               <div className="space-y-4">
                  {pastContests.map(contest => renderContestCard(contest, true))}
              </div>
          </div>
      )}
    </div>
  );
};

export default Contests;