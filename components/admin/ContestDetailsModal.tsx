import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon, TrophyIcon, MailIcon, UserIcon } from '../Icons';
import { Profile } from '../../contexts/ProfileContext';

interface Contest {
  id: number;
  title: string;
  end_date: string;
  winner_id: string | null;
}

// Fix: The profiles table does not contain an email. This must be joined from the auth.users table.
// The Supabase query will return a nested 'users' object.
interface Participant {
  user_id: string;
  profiles: {
    username: string;
    // Fix: Changed structure to match query result
    users: {
        email: string;
    } | null;
  } | null;
}

// Fix: The Profile type doesn't include an email. We'll create a local extended type for the winner.
interface WinnerProfile extends Profile {
    users: {
        email: string;
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
  // Fix: Use the extended WinnerProfile type for the state.
  const [winner, setWinner] = useState<WinnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    
    // Fetch participants
    const { data: participantsData, error: participantsError } = await supabase
      .from('contest_participants')
      // Fix: Corrected Supabase query to join users table for email.
      .select('user_id, profiles!inner(username, users!inner(email))')
      .eq('contest_id', contest.id);

    if (participantsError) {
      setMessage({ type: 'error', text: participantsError.message });
    } else {
      setParticipants(participantsData || []);
    }

    // Fetch winner if exists
    if (contest.winner_id) {
      const { data: winnerData, error: winnerError } = await supabase
        .from('profiles')
        // Fix: Corrected Supabase query to join users table for email.
        .select('*, users(email)')
        .eq('id', contest.winner_id)
        .single();
      if (winnerError) {
        console.error("Error fetching winner", winnerError);
      } else {
        // Fix: Cast the result to our extended WinnerProfile type.
        setWinner(winnerData as WinnerProfile);
      }
    }

    setLoading(false);
  }, [contest.id, contest.winner_id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSelectWinner = async () => {
    if (participants.length === 0) return;
    if (window.confirm(t('confirmWinnerSelection'))) {
      const winnerParticipant = participants[Math.floor(Math.random() * participants.length)];
      const winnerId = winnerParticipant.user_id;

      const { error } = await supabase
        .from('contests')
        .update({ winner_id: winnerId })
        .eq('id', contest.id);

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

                {loading ? <p>{t('newsLoading')}</p> : (
                    <>
                        {/* Winner Section */}
                        {winner ? (
                            <div className="bg-green-500/10 p-4 rounded-lg mb-4">
                                <h4 className="font-bold text-lg text-green-300 flex items-center gap-2"><TrophyIcon className="w-5 h-5"/> {t('winner')}</h4>
                                {/* Fix: Access email via the nested 'users' object. */}
                                <p>{winner.username} ({winner.users?.email})</p>
                                <a href={`mailto:${winner.users?.email}`} className="mt-2 inline-flex items-center gap-2 bg-golden-yellow text-marine-blue font-bold text-sm py-1 px-3 rounded-full">
                                    <MailIcon className="w-4 h-4"/> {t('emailWinner')}
                                </a>
                            </div>
                        ) : isContestEnded ? (
                            <button
                                onClick={handleSelectWinner}
                                disabled={participants.length === 0}
                                className="w-full bg-golden-yellow text-marine-blue font-bold py-2 rounded-full mb-4 disabled:opacity-50"
                            >
                                {t('selectWinner')}
                            </button>
                        ) : <p className="text-sm text-center text-white/70 mb-4">Winner can be selected after the contest ends.</p>}
                        
                        {/* Participants List */}
                        <div>
                            <h4 className="font-bold text-lg mb-2">{t('participants')} ({participants.length})</h4>
                            {participants.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {participants.map(p => (
                                        <div key={p.user_id} className="bg-marine-blue-darker/50 p-2 rounded-md flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-white/70" />
                                            <div>
                                                <p className="text-sm font-semibold">{p.profiles?.username || 'N/A'}</p>
                                                {/* Fix: Access email via the nested 'users' object. */}
                                                <p className="text-xs text-white/60">{p.profiles?.users?.email || 'N/A'}</p>
                                            </div>
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
