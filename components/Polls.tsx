import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabaseClient';
import { useProfile } from '../contexts/ProfileContext';
import { BarChartIcon } from './Icons';
import PollResults from './PollResults';

interface PollOption {
  id: number;
  option_text: string;
}

interface Poll {
  id: number;
  title: string;
  question: string;
  target_audience: 'all' | 'registered';
  end_date: string;
  is_published: boolean;
  poll_options: PollOption[];
}

interface PollResult extends Poll {
    results: { option_id: number, count: number, text: string }[];
    total_votes: number;
}

const Polls: React.FC = () => {
  const { t } = useLanguage();
  const { session } = useProfile();
  const [activePolls, setActivePolls] = useState<PollResult[]>([]);
  const [completedPolls, setCompletedPolls] = useState<PollResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedPolls, setVotedPolls] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<{ pollId: number, text: string } | null>(null);

  useEffect(() => {
    const loadVotedPolls = async () => {
        const locallyVoted = localStorage.getItem('rvr-voted-polls');
        const votedPollIds = new Set<number>(locallyVoted ? JSON.parse(locallyVoted) : []);

        if (session) {
            const { data, error } = await supabase
                .from('poll_votes')
                .select('poll_id')
                .eq('user_id', session.user.id);

            if (error) {
                console.error("Error fetching user votes:", error);
            } else if (data) {
                data.forEach(vote => votedPollIds.add(vote.poll_id));
            }
        }
        setVotedPolls(votedPollIds);
    };
    loadVotedPolls();
  }, [session]);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString();
      
      const processPolls = async (polls: Poll[] | null): Promise<PollResult[]> => {
          if (!polls) return [];
          return Promise.all(
              polls.map(async (poll) => {
                  const { data: votes, error: votesError } = await supabase
                      .from('poll_votes')
                      .select('poll_option_id')
                      .eq('poll_id', poll.id);

                  if (votesError) throw votesError;

                  const total_votes = votes.length;
                  const results = poll.poll_options.map(option => {
                      const count = votes.filter(v => v.poll_option_id === option.id).length;
                      return { option_id: option.id, count, text: option.option_text };
                  });
                  return { ...poll, results, total_votes };
              })
          );
      };

      // Fetch active polls
      const { data: activeData, error: activeError } = await supabase
        .from('polls')
        .select('*, poll_options(*)')
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true });
      if (activeError) throw activeError;

      // Fetch completed and published polls
      const { data: completedData, error: completedError } = await supabase
        .from('polls')
        .select('*, poll_options(*)')
        .eq('is_published', true)
        .lte('end_date', now)
        .order('end_date', { ascending: false })
        .limit(5);
      if (completedError) throw completedError;

      const [activeWithResults, completedWithResults] = await Promise.all([
          processPolls(activeData),
          processPolls(completedData)
      ]);

      setActivePolls(activeWithResults);
      setCompletedPolls(completedWithResults);

    } catch (err: any) {
      setError(t('newsError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPolls();
  }, [session, fetchPolls]);


  const handleVote = async (pollId: number, optionId: number) => {
    setMessage(null);
    const poll = activePolls.find(p => p.id === pollId);
    if (!poll) return;

    if (poll.target_audience === 'registered' && !session) {
      setMessage({ pollId, text: t('mustBeLoggedInToVote') });
      return;
    }

    if (votedPolls.has(pollId)) {
      setMessage({ pollId, text: t('alreadyVoted') });
      return;
    }
    
    const voteData: { poll_id: number; poll_option_id: number; user_id?: string; anonymous_voter_id?: string } = {
        poll_id: pollId,
        poll_option_id: optionId,
    };

    if (session) {
        voteData.user_id = session.user.id;
    } else {
        let anonId = localStorage.getItem('rvr-anonymous-id');
        if (!anonId) {
            anonId = crypto.randomUUID();
            localStorage.setItem('rvr-anonymous-id', anonId);
        }
        voteData.anonymous_voter_id = anonId;
    }

    const { error } = await supabase.from('poll_votes').insert(voteData);

    if (error) {
        if (error.code === '23505') { // unique_violation code
            setMessage({ pollId, text: t('alreadyVoted') });
        } else {
            setMessage({ pollId, text: t('newsError') });
            console.error(error);
        }
    } else {
        const newVotedPolls = new Set(votedPolls).add(pollId);
        setVotedPolls(newVotedPolls);
        fetchPolls(); // Refresh to show results

        if(!session) {
            const locallyVotedRaw = localStorage.getItem('rvr-voted-polls');
            const locallyVoted = locallyVotedRaw ? JSON.parse(locallyVotedRaw) : [];
            if (!locallyVoted.includes(pollId)) {
                locallyVoted.push(pollId);
                localStorage.setItem('rvr-voted-polls', JSON.stringify(locallyVoted));
            }
        }
    }
  };

  const publicPolls = activePolls.filter(p => p.target_audience === 'all');
  const memberPolls = activePolls.filter(p => p.target_audience === 'registered');

  const publicCompletedPolls = completedPolls.filter(p => p.target_audience === 'all');
  const memberCompletedPolls = completedPolls.filter(p => p.target_audience === 'registered');

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('navPolls')}</h1>
      
      {loading ? <p>{t('newsLoading')}</p> : error ? <p className="text-red-400">{error}</p> : (
        <div className="space-y-8">
            {/* Active Polls Section */}
            <div>
                {publicPolls.length > 0 && <h2 className="text-2xl font-montserrat text-white mb-4">{t('publicPolls')}</h2>}
                {publicPolls.length > 0 ? publicPolls.map(poll => (
                    <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md mb-4">
                        <h3 className="text-xl font-montserrat text-white mb-4">{poll.question}</h3>
                        {votedPolls.has(poll.id) ? (
                           <PollResults poll={poll} />
                        ) : (
                            <div className="space-y-3">
                                {poll.poll_options.map(option => (
                                    <button key={option.id} onClick={() => handleVote(poll.id, option.id)} className="w-full bg-marine-blue-darkest/50 p-3 rounded-md text-left text-white hover:bg-marine-blue-darkest transition-colors">
                                        {option.option_text}
                                    </button>
                                ))}
                                <p className="text-xs text-center text-white/70 pt-2">{t('voteToSeeResults')}</p>
                                {message && message.pollId === poll.id && <p className="text-sm text-golden-yellow mt-2 text-center">{message.text}</p>}
                            </div>
                        )}
                        <p className="text-xs text-white/50 mt-4 text-right">{t('pollEndsOn', { date: new Date(poll.end_date).toLocaleDateString() })}</p>
                    </div>
                )) : <p className="text-white/70">{t('noActivePollsPublic')}</p>}

                {session && memberPolls.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-montserrat text-white mb-4">{t('memberPolls')}</h2>
                        {memberPolls.map(poll => (
                            <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md mb-4 border-l-4 border-golden-yellow">
                                <h3 className="text-xl font-montserrat text-white mb-4">{poll.question}</h3>
                                {votedPolls.has(poll.id) ? (
                                    <PollResults poll={poll} />
                                ) : (
                                    <div className="space-y-3">
                                        {poll.poll_options.map(option => (
                                            <button key={option.id} onClick={() => handleVote(poll.id, option.id)} className="w-full bg-marine-blue-darkest/50 p-3 rounded-md text-left text-white hover:bg-marine-blue-darkest transition-colors">
                                                {option.option_text}
                                            </button>
                                        ))}
                                        <p className="text-xs text-center text-white/70 pt-2">{t('voteToSeeResults')}</p>
                                        {message && message.pollId === poll.id && <p className="text-sm text-golden-yellow mt-2 text-center">{message.text}</p>}
                                    </div>
                                )}
                                <p className="text-xs text-white/50 mt-4 text-right">{t('pollEndsOn', { date: new Date(poll.end_date).toLocaleDateString() })}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completed Polls Section */}
            <div>
                <h2 className="text-2xl font-montserrat text-white mb-4 flex items-center gap-2">
                    <BarChartIcon className="w-6 h-6" />
                    {t('recentResults')}
                </h2>
                {publicCompletedPolls.length > 0 && publicCompletedPolls.map(poll => (
                    <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md mb-4">
                        <h3 className="text-xl font-montserrat text-white mb-1">{poll.question}</h3>
                        <p className="text-xs text-white/60 mb-4">{t('pollEndedOn', { date: new Date(poll.end_date).toLocaleDateString() })} - {t('finalResults')}</p>
                        <PollResults poll={poll} />
                    </div>
                ))}
                
                {session && memberCompletedPolls.length > 0 && memberCompletedPolls.map(poll => (
                    <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md mb-4 border-l-4 border-golden-yellow">
                        <h3 className="text-xl font-montserrat text-white mb-1">{poll.question}</h3>
                        <p className="text-xs text-white/60 mb-4">{t('pollEndedOn', { date: new Date(poll.end_date).toLocaleDateString() })} - {t('finalResults')}</p>
                        <PollResults poll={poll} />
                    </div>
                ))}

                {!session && memberCompletedPolls.length > 0 && (
                    <div className="bg-marine-blue-darker p-4 rounded-lg text-center text-sm text-white/80">
                        <p>{t('memberPollsResultsInfo')}</p>
                    </div>
                )}

                {publicCompletedPolls.length === 0 && memberCompletedPolls.length === 0 && (
                    <p className="text-white/70">{t('noPollResultsPublic')}</p>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Polls;