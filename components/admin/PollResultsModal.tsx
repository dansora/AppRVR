import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../services/supabaseClient';
import { BarChartIcon, CloseIcon } from '../Icons';

interface Poll {
    id: number;
    title: string;
    question: string;
    is_published: boolean;
}

interface PollOption {
  id: number;
  option_text: string;
}

interface Result {
    option_id: number;
    text: string;
    count: number;
}

interface PollResultsModalProps {
  poll: Poll;
  onClose: () => void;
  onUpdate: () => void;
}

const PollResultsModal: React.FC<PollResultsModalProps> = ({ poll, onClose, onUpdate }) => {
    const { t } = useLanguage();
    const [results, setResults] = useState<Result[]>([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPublished, setIsPublished] = useState(poll.is_published);
    const [message, setMessage] = useState<{type:'success'|'error', text:string}|null>(null);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        // Fetch options
        const { data: optionsData, error: optionsError } = await supabase
            .from('poll_options').select('*').eq('poll_id', poll.id);
        
        if (optionsError || !optionsData) {
            setLoading(false);
            return;
        }

        // Fetch votes
        const { data: votesData, error: votesError } = await supabase
            .from('poll_votes').select('poll_option_id').eq('poll_id', poll.id);

        if (votesError) {
            setLoading(false);
            return;
        }

        setTotalVotes(votesData.length);

        const calculatedResults = optionsData.map(option => ({
            option_id: option.id,
            text: option.option_text,
            count: votesData.filter(vote => vote.poll_option_id === option.id).length
        }));

        setResults(calculatedResults);
        setLoading(false);
    }, [poll.id]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const handlePublishToggle = async () => {
        setMessage(null);
        const newPublishedState = !isPublished;
        const { error } = await supabase
            .from('polls')
            .update({ is_published: newPublishedState })
            .eq('id', poll.id);

        if (error) {
            setMessage({type: 'error', text: t('resultsPublishedError')});
        } else {
            setIsPublished(newPublishedState);
            setMessage({type: 'success', text: t('resultsPublishedSuccess')});
            onUpdate(); // Re-fetch polls list in parent
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-marine-blue-darkest w-full max-w-lg rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-white/20">
                    <h2 className="text-2xl font-montserrat text-golden-yellow">{t('pollResultsTitle')}</h2>
                    <button onClick={onClose}><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 overflow-y-auto">
                    <h3 className="text-xl font-bold mb-1">{poll.title}</h3>
                    <p className="text-white/80 mb-4">{poll.question}</p>
                    
                    {loading ? <p>{t('newsLoading')}</p> : (
                        <>
                            <div className="flex items-center gap-2 mb-4 text-golden-yellow">
                                <BarChartIcon className="w-5 h-5"/>
                                <span className="font-bold">{t('totalVotes')}: {totalVotes}</span>
                            </div>
                            <div className="space-y-3">
                                {results.map(res => (
                                    <div key={res.option_id}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{res.text} ({res.count})</span>
                                            <span>{totalVotes > 0 ? ((res.count / totalVotes) * 100).toFixed(1) : 0}%</span>
                                        </div>
                                        <div className="w-full bg-marine-blue-darker/50 rounded-full h-4">
                                            <div className="bg-golden-yellow h-4 rounded-full" style={{ width: `${totalVotes > 0 ? (res.count / totalVotes) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                     {message && <p className={`p-2 rounded-md my-4 text-sm text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</p>}
                    <button onClick={handlePublishToggle} className={`w-full mt-6 font-bold py-3 rounded-full transition-colors ${isPublished ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                        {isPublished ? t('unpublishResults') : t('publishResults')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PollResultsModal;
