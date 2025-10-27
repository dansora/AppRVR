import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/supabaseClient';
import { useProfile } from '../contexts/ProfileContext';
import { BarChartIcon } from './Icons';

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
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
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

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      setError(null);
      try {
        const now = new Date().toISOString();
        
        // Fetch active polls with their options
        const { data: activeData, error: activeError } = await supabase
          .from('polls')
          .select('*, poll_options(*)')
          .lte('start_date', now)
          .gte('end_date', now)
          .order('end_date', { ascending: true });

        if (activeError) throw activeError;
        setActivePolls(activeData || []);

        // Fetch last 3 completed and published polls
        const { data: completedData, error: completedError } = await supabase
          .from('polls')
          .select('*, poll_options(*)')
          .eq('is_published', true)
          .lte('end_date', now)
          .order('end_date', { ascending: false })
          .limit(3);

        if (completedError) throw completedError;

        // Fetch results for completed polls
        const completedWithResults: PollResult[] = await Promise.all(
          (completedData || []).map(async (poll) => {
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
        setCompletedPolls(completedWithResults);

      } catch (err: any) {
        setError(t('newsError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [t]);

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
            // Sync state in case of race condition (e.g., voted in another tab)
            setVotedPolls(prev => new Set(prev).add(pollId));
        } else {
            setMessage({ pollId, text: t('newsError') });
            console.error(error);
        }
    } else {
        const newVotedPolls = new Set(votedPolls).add(pollId);
        setVotedPolls(newVotedPolls);
        setMessage({ pollId, text: t('voteSubmitted') });

        if(!session) { // Only use local storage for anonymous
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

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('navPolls')}</h1>
      
      {loading ? <p>{t('newsLoading')}</p> : error ? <p className="text-red-400">{error}</p> : (
        <div className="space-y-8">
            {/* Active Public Polls */}
            <div>
                <h2 className="text-2xl font-montserrat text-white mb-4">{t('publicPolls')}</h2>
                {publicPolls.length > 0 ? publicPolls.map(poll => (
                    <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md mb-4">
                        <h3 className="text-xl font-montserrat text-white mb-4">{poll.question}</h3>
                        {votedPolls.has(poll.id) ? (
                            <p className="text-sm text-golden-yellow mt-4 text-center">{message?.pollId === poll.id ? message.text : t('alreadyVoted')}</p>
                        ) : (
                            <div className="space-y-3">
                                {poll.poll_options.map(option => (
                                    <button key={option.id} onClick={() => handleVote(poll.id, option.id)} className="w-full bg-marine-blue-darkest/50 p-3 rounded-md text-left text-white hover:bg-marine-blue-darkest transition-colors">
                                        {option.option_text}
                                    </button>
                                ))}
                                {message && message.pollId === poll.id && <p className="text-sm text-golden-yellow mt-2 text-center">{message.text}</p>}
                            </div>
                        )}
                        <p className="text-xs text-white/50 mt-4 text-right">{t('pollEndsOn', { date: new Date(poll.end_date).toLocaleDateString() })}</p>
                    </div>
                )) : <p className="text-white/70">{t('noActivePollsPublic')}</p>}
            </div>

            {/* Active Member Polls */}
            {session && memberPolls.length > 0 && (
                <div>
                    <h2 className="text-2xl font-montserrat text-white mb-4">{t('memberPolls')}</h2>
                    {memberPolls.map(poll => (
                        <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md mb-4 border-l-4 border-golden-yellow">
                            <h3 className="text-xl font-montserrat text-white mb-4">{poll.question}</h3>
                            {votedPolls.has(poll.id) ? (
                                <p className="text-sm text-golden-yellow mt-4 text-center">{message?.pollId === poll.id ? message.text : t('alreadyVoted')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {poll.poll_options.map(option => (
                                        <button key={option.id} onClick={() => handleVote(poll.id, option.id)} className="w-full bg-marine-blue-darkest/50 p-3 rounded-md text-left text-white hover:bg-marine-blue-darkest transition-colors">
                                            {option.option_text}
                                        </button>
                                    ))}
                                    {message && message.pollId === poll.id && <p className="text-sm text-golden-yellow mt-2 text-center">{message.text}</p>}
                                </div>
                            )}
                            <p className="text-xs text-white/50 mt-4 text-right">{t('pollEndsOn', { date: new Date(poll.end_date).toLocaleDateString() })}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Recent Results */}
            <div>
                <h2 className="text-2xl font-montserrat text-white mb-4 flex items-center gap-2">
                    <BarChartIcon className="w-6 h-6" />
                    {t('recentResults')}
                </h2>
                {completedPolls.length > 0 ? (
                    <div className="space-y-6">
                        {completedPolls.map(poll => (
                            <div key={poll.id} className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
                                <h3 className="text-xl font-montserrat text-white mb-1">{poll.question}</h3>
                                <p className="text-xs text-white/60 mb-4">{t('totalVotes')}: {poll.total_votes}</p>
                                <div className="space-y-2">
                                    {poll.results.map((res) => (
                                        <div key={res.option_id}>
                                            <div className="flex justify-between text-white/90 mb-1 text-sm">
                                                <span>{res.text}</span>
                                                <span>{poll.total_votes > 0 ? ((res.count / poll.total_votes) * 100).toFixed(0) : 0}%</span>
                                            </div>
                                            <div className="w-full bg-marine-blue-darkest/50 rounded-full h-2.5">
                                                <div className="bg-golden-yellow h-2.5 rounded-full" style={{ width: `${poll.total_votes > 0 ? (res.count / poll.total_votes) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-white/70">{t('noPollResultsPublic')}</p>}
            </div>
        </div>
      )}
    </div>
  );
};

export default Polls;
