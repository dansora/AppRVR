import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../services/supabaseClient';
import { BackIcon, ChevronRightIcon, CloseIcon } from '../Icons';
import PollResultsModal from './PollResultsModal';

type SubView = 'dashboard' | 'create' | 'active' | 'completed';

interface Poll {
    id: number;
    title: string;
    question: string;
    target_audience: 'all' | 'registered';
    start_date: string;
    end_date: string;
    is_published: boolean;
}

interface PollsManagerProps {
    onBack: () => void;
}

const PollsManager: React.FC<PollsManagerProps> = ({ onBack }) => {
    const { t } = useLanguage();
    const [subView, setSubView] = useState<SubView>('dashboard');

    const renderSubView = () => {
        switch(subView) {
            case 'create':
                return <CreatePollPage onBack={() => setSubView('dashboard')} />;
            case 'active':
                return <ActivePollsPage onBack={() => setSubView('dashboard')} />;
            case 'completed':
                return <CompletedPollsPage onBack={() => setSubView('dashboard')} />;
            case 'dashboard':
            default:
                return <PollsDashboard setSubView={setSubView} />;
        }
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline mb-4">
                <BackIcon className="w-5 h-5" />
                {t('backToDashboard')}
            </button>
            {renderSubView()}
        </div>
    );
};


const PollsDashboard: React.FC<{setSubView: (view: SubView) => void}> = ({ setSubView }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-4">
            <button onClick={() => setSubView('create')} className="w-full bg-marine-blue-darker p-4 rounded-lg flex items-center text-left hover:bg-marine-blue-darkest transition-colors shadow-md">
                <span className="flex-1 font-bold text-white font-montserrat">{t('adminCreateNewPoll')}</span>
                <ChevronRightIcon className="w-6 h-6 text-white/50" />
            </button>
            <button onClick={() => setSubView('active')} className="w-full bg-marine-blue-darker p-4 rounded-lg flex items-center text-left hover:bg-marine-blue-darkest transition-colors shadow-md">
                <span className="flex-1 font-bold text-white font-montserrat">{t('adminActivePolls')}</span>
                <ChevronRightIcon className="w-6 h-6 text-white/50" />
            </button>
            <button onClick={() => setSubView('completed')} className="w-full bg-marine-blue-darker p-4 rounded-lg flex items-center text-left hover:bg-marine-blue-darkest transition-colors shadow-md">
                <span className="flex-1 font-bold text-white font-montserrat">{t('adminCompletedPolls')}</span>
                <ChevronRightIcon className="w-6 h-6 text-white/50" />
            </button>
        </div>
    );
};

const CreatePollPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const { t } = useLanguage();
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [target, setTarget] = useState<'all' | 'registered'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [loading, setLoading] = useState(false);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (new Date(endDate) <= new Date(startDate)) {
            setMessage({ type: 'error', text: t('pollEndDateAfterStart') });
            setLoading(false);
            return;
        }

        const filledOptions = options.filter(opt => opt.trim() !== '');
        if (filledOptions.length < 2) {
            setMessage({type: 'error', text: 'Please provide at least two options.'});
            setLoading(false);
            return;
        }

        const { data: pollData, error: pollError } = await supabase
            .from('polls')
            .insert({
                title,
                question,
                target_audience: target,
                start_date: startDate,
                end_date: endDate
            })
            .select()
            .single();

        if (pollError || !pollData) {
            setMessage({type: 'error', text: `${t('pollCreatedError')}: ${pollError?.message}`});
            setLoading(false);
            return;
        }

        const optionsToInsert = filledOptions.map(opt => ({
            poll_id: pollData.id,
            option_text: opt
        }));

        const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);

        if (optionsError) {
             setMessage({type: 'error', text: `${t('pollCreatedError')}: ${optionsError?.message}`});
        } else {
             setMessage({type: 'success', text: t('pollCreatedSuccess')});
             // Reset form
             setTitle(''); setQuestion(''); setOptions(['', '']); setTarget('all'); setStartDate(''); setEndDate('');
        }
        setLoading(false);
    };

    return (
        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('createPollPageTitle')}</h2>
            {message && <p className={`p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollTitleLabel')}</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollQuestionLabel')}</label>
                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollOptionsLabel')}</label>
                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input type="text" value={opt} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`${t('optionPlaceholder')} ${index+1}`} required className="flex-grow bg-marine-blue-darkest/80 rounded-md p-2"/>
                            {options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="p-2 bg-red-600 rounded-full"><CloseIcon className="w-4 h-4"/></button>}
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="text-sm text-golden-yellow hover:underline">{t('addOption')}</button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollTargetAudience')}</label>
                    <div className="flex gap-4">
                        <label><input type="radio" name="target" checked={target === 'all'} onChange={() => setTarget('all')} /> {t('pollTargetAll')}</label>
                        <label><input type="radio" name="target" checked={target === 'registered'} onChange={() => setTarget('registered')} /> {t('pollTargetRegistered')}</label>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('pollStartDate')}</label>
                        <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('pollEndDate')}</label>
                        <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2"/>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50">{loading ? t('newsLoading') : t('createPoll')}</button>
            </form>
        </div>
    );
};

const ActivePollsPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const {t} = useLanguage();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPolls = async () => {
            setLoading(true);
            setError(null);
            const now = new Date().toISOString();
            const { data, error } = await supabase.from('polls').select('*').gte('end_date', now).order('end_date');
            if (error) {
                setError(error.message);
                console.error(error);
            } else {
                setPolls(data);
            }
            setLoading(false);
        };
        fetchPolls();
    }, []);

    return (
         <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('activePollsPageTitle')}</h2>
            {loading ? <p>{t('newsLoading')}</p> : error ? <p className="text-red-400">{t('newsError')}: {error}</p> : polls.length === 0 ? <p>{t('noActivePolls')}</p> : (
                <div className="space-y-3">
                    {polls.map(poll => (
                        <div key={poll.id} className="p-4 bg-marine-blue-darkest/50 rounded-md">
                            <p className="font-bold">{poll.title}</p>
                            <p className="text-sm text-white/80">{poll.question}</p>
                            <p className="text-xs text-white/50 mt-1">{t('pollEndsOn', {date: new Date(poll.end_date).toLocaleString()})}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompletedPollsPage: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const {t} = useLanguage();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

    const fetchPolls = useCallback(async () => {
        setLoading(true);
        setError(null);
        const now = new Date().toISOString();
        const { data, error } = await supabase.from('polls').select('*').lt('end_date', now).order('end_date', {ascending: false});
        if (error) {
            setError(error.message);
            console.error(error);
        } else {
            setPolls(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPolls();
    }, [fetchPolls]);

    return (
         <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('completedPollsPageTitle')}</h2>
            {loading ? <p>{t('newsLoading')}</p> : error ? <p className="text-red-400">{t('newsError')}: {error}</p> : polls.length === 0 ? <p>{t('noCompletedPolls')}</p> : (
                <div className="space-y-3">
                    {polls.map(poll => (
                        <div key={poll.id} className="p-4 bg-marine-blue-darkest/50 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-bold">{poll.title}</p>
                                <p className="text-xs text-white/50 mt-1">{t('pollEndedOn', {date: new Date(poll.end_date).toLocaleString()})}</p>
                            </div>
                            <button onClick={() => setSelectedPoll(poll)} className="bg-golden-yellow text-marine-blue font-bold py-1 px-3 rounded-full text-sm">{t('viewResults')}</button>
                        </div>
                    ))}
                </div>
            )}
            {selectedPoll && <PollResultsModal poll={selectedPoll} onClose={() => setSelectedPoll(null)} onUpdate={fetchPolls} />}
        </div>
    );
};

export default PollsManager;