import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon, TrophyIcon, MailIcon, UserIcon } from '../Icons';

interface Contest {
  id: number;
  title: string;
  end_date: string;
  number_of_prizes: number;
}

interface Participant {
  user_id: string;
  is_winner: boolean;
  email?: string | null; // Made optional
  profiles: {
    username: string;
  } | null;
}

interface ContestDetailsModalProps {
  contest: Contest;
  onClose: () => void;
  onUpdate: () => void;
}

const ContestDetailsModal: React.FC<ContestDetailsModalProps> = ({ contest, onClose, onUpdate }) => {
  const { t } = useLanguage();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [emailColumnExists, setEmailColumnExists] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    setEmailColumnExists(true); // Assume it exists initially
    
    // Attempt to fetch with email
    const { data: participantsData, error: participantsError } = await supabase
      .from('contest_participants')
      .select('user_id, is_winner, email, profiles!left(username)')
      .eq('contest_id', contest.id);

    if (participantsError) {
        if (participantsError.code === '42703') { // undefined column 'email'
            console.warn("Fetching contest participants without email column.");
            setEmailColumnExists(false);
            // Fallback: fetch without email
            const { data: retryData, error: retryError } = await supabase
                .from('contest_participants')
                .select('user_id, is_winner, profiles!left(username)')
                .eq('contest_id', contest.id);
            
            if (retryError) {
                 setMessage({ type: 'error', text: retryError.message });
            } else {
                 setParticipants(retryData as Participant[] || []);
            }
        } else {
            setMessage({ type: 'error', text: participantsError.message });
        }
    } else {
      setParticipants(participantsData as Participant[] || []);
    }

    setLoading(false);
  }, [contest.id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSelectWinners = async () => {
    setMessage(null);
    const winners = participants.filter(p => p.is_winner);
    const nonWinners = participants.filter(p => !p.is_winner);
    const prizesToAward = contest.number_of_prizes - winners.length;

    if (nonWinners.length === 0 || prizesToAward <= 0) return;
    if (window.confirm(t('confirmWinnerSelection'))) {
      
      const shuffled = nonWinners.sort(() => 0.5 - Math.random());
      const newWinners = shuffled.slice(0, prizesToAward);
      const newWinnerIds = newWinners.map(w => w.user_id);

      const { error } = await supabase
        .from('contest_participants')
        .update({ is_winner: true })
        .in('user_id', newWinnerIds)
        .eq('contest_id', contest.id);

      if (error) {
        setMessage({ type: 'error', text: t('winnerSelectedError') });
      } else {
        setMessage({ type: 'success', text: t('winnerSelectedSuccess') });
        onUpdate(); // Update the main list
        fetchDetails(); // Refresh this modal's data
      }
    }
  };

  const isContestEnded = new Date(contest.end_date) < new Date();
  const winners = participants.filter(p => p.is_winner);
  const allPrizesAwarded = winners.length >= contest.number_of_prizes;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-2xl font-montserrat text-golden-yellow">{t('contestDetails')}</h2>
                <button onClick={onClose}><CloseIcon className="w-6 h-6"/></button>
            </header>
            <div className="p-6 overflow-y-auto">
                <h3 className="text-lg font-bold mb-4">{contest.title}</h3>
                
                {message && <p className={`p-2 rounded-md mb-4 text-sm text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</p>}

                {!emailColumnExists && (
                    <div className="bg-blue-900/50 border border-blue-600 p-4 rounded-lg mb-4 text-sm">
                        <p className="font-bold text-blue-300 mb-2">{t('adminContestEmailFeatureTitle')}</p>
                        <p className="text-blue-300/90 mb-3">{t('adminContestEmailFeatureDesc')}</p>
                        <p className="text-blue-300/90 mb-2">{t('adminContestEmailFeatureHowTo')}</p>
                        <pre className="bg-marine-blue-darkest p-2 rounded-md text-xs text-white/90 overflow-x-auto">
                            <code>
                                ALTER TABLE public.contest_participants<br/>
                                ADD COLUMN IF NOT EXISTS email text;
                            </code>
                        </pre>
                    </div>
                )}

                {loading ? <p>{t('newsLoading')}</p> : (
                    <>
                        {/* Winner Section */}
                        <div className="bg-marine-blue-darker/50 p-4 rounded-lg mb-4">
                            <h4 className="font-bold text-lg text-golden-yellow flex items-center gap-2">
                                <TrophyIcon className="w-5 h-5"/> {t('winners')}
                            </h4>
                            <p className="text-white/80 mb-4">{t('contestWinnersCount', { count: String(winners.length), total: String(contest.number_of_prizes) })}</p>

                            {winners.length > 0 && (
                                <div className="space-y-2">
                                    {winners.map(w => (
                                        <div key={w.user_id} className="flex items-center justify-between gap-2 bg-green-900/50 p-2 rounded">
                                            <div className="flex items-center gap-2 text-green-300">
                                                <TrophyIcon className="w-4 h-4" />
                                                <p className="font-semibold">{w.profiles?.username || 'N/A'}</p>
                                            </div>
                                            {w.email && (
                                                <a href={`mailto:${w.email}?subject=Congratulations! You won the RVR contest: ${contest.title}&body=Hello ${w.profiles?.username || ''},%0D%0A%0D%0APlease reply to this email with your full name and shipping address to receive your prize.%0D%0A%0D%0AThank you,%0D%0ARVR Team`}
                                                   className="p-1.5 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
                                                   title={`${t('emailWinner')}: ${w.email}`}>
                                                    <MailIcon className="w-4 h-4 text-white" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isContestEnded && !allPrizesAwarded && (
                                <button
                                    onClick={handleSelectWinners}
                                    disabled={participants.filter(p => !p.is_winner).length === 0}
                                    className="w-full mt-4 bg-golden-yellow text-marine-blue font-bold py-2 rounded-full disabled:opacity-50"
                                >
                                    {t('selectRemainingWinners')}
                                </button>
                            )}

                            {isContestEnded && allPrizesAwarded && (
                                <p className="text-sm text-center font-semibold text-green-400 mt-4">{t('allPrizesAwarded')}</p>
                            )}
                             {!isContestEnded && <p className="text-sm text-center text-white/70 mt-4">Câștigătorii pot fi aleși după încheierea concursului.</p>}
                        </div>
                        
                        {/* Participants List */}
                        <div>
                            <h4 className="font-bold text-lg mb-2">{t('participants')} ({participants.length})</h4>
                            {participants.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {participants.map(p => (
                                        <div key={p.user_id} className={`p-2 rounded-md flex items-center gap-2 ${p.is_winner ? 'bg-green-500/20' : 'bg-marine-blue-darker/50'}`}>
                                            {p.is_winner ? <TrophyIcon className="w-5 h-5 text-golden-yellow" /> : <UserIcon className="w-5 h-5 text-white/70" />}
                                            <p className="text-sm font-semibold">{p.profiles?.username || 'N/A'}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/70">{t('noParticipants')}</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default ContestDetailsModal;