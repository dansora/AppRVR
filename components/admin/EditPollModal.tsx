import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon } from '../Icons';
import { useModal } from '../../contexts/ModalContext';

interface PollOption {
  id: number;
  option_text: string;
}

interface Poll {
  id: number;
  title: string;
  question: string;
  target_audience: 'all' | 'registered';
  start_date: string;
  end_date: string;
  poll_options: PollOption[];
}

interface EditPollModalProps {
  poll: Poll;
  mode: 'update' | 'republish';
  onClose: () => void;
  onSuccess: () => void;
}

type OptionState = { id?: number; option_text: string };

const EditPollModal: React.FC<EditPollModalProps> = ({ poll, mode, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { registerModal, unregisterModal } = useModal();

  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<OptionState[]>([]);
  const [target, setTarget] = useState<'all' | 'registered'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

  useEffect(() => {
    if (poll) {
        setTitle(poll.title);
        setQuestion(poll.question);
        setOptions(poll.poll_options.map(o => ({ id: o.id, option_text: o.option_text })));
        setTarget(poll.target_audience);
        if (mode === 'update') {
            setStartDate(formatDateForInput(poll.start_date));
            setEndDate(formatDateForInput(poll.end_date));
        } else {
            setStartDate('');
            setEndDate('');
        }
    }
  }, [poll, mode]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].option_text = value;
    setOptions(newOptions);
  };

  const addOption = () => setOptions([...options, { option_text: '' }]);
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

    const filledOptions = options.filter(opt => opt.option_text.trim() !== '');
    if (filledOptions.length < 2) {
      setMessage({ type: 'error', text: 'Please provide at least two options.' });
      setLoading(false);
      return;
    }

    if (mode === 'update') {
        try {
            const { error: pollUpdateError } = await supabase
                .from('polls')
                .update({ title, question, target_audience: target, start_date: startDate, end_date: endDate })
                .eq('id', poll.id);

            if (pollUpdateError) throw pollUpdateError;

            const optionsToUpsert = filledOptions.map(o => ({
                id: o.id,
                poll_id: poll.id,
                option_text: o.option_text
            }));
            const { error: optionsUpsertError } = await supabase.from('poll_options').upsert(optionsToUpsert);

            if (optionsUpsertError) throw optionsUpsertError;

            setMessage({ type: 'success', text: t('pollUpdatedSuccess') });
            onSuccess();
            setTimeout(onClose, 1000);
        } catch (err: any) {
            setMessage({ type: 'error', text: `${t('pollUpdatedError')}: ${err.message}` });
        }
    } else { // republish mode
        try {
            const { data: newPollData, error: pollError } = await supabase
                .from('polls')
                .insert({ title, question, target_audience: target, start_date: startDate, end_date: endDate })
                .select().single();
            
            if (pollError) throw pollError;

            const optionsToInsert = filledOptions.map(opt => ({
                poll_id: newPollData.id,
                option_text: opt.option_text
            }));
            const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);

            if (optionsError) throw optionsError;

            setMessage({ type: 'success', text: t('pollCreatedSuccess') });
            onSuccess();
            setTimeout(onClose, 1000);

        } catch (err: any) {
            setMessage({ type: 'error', text: `${t('pollCreatedError')}: ${err.message}` });
        }
    }

    setLoading(false);
  };
  
  const modalTitle = mode === 'update' ? t('editPoll') : t('republishPoll');
  const submitButtonText = mode === 'update' ? t('adUpdate') : t('republish');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-2xl font-montserrat text-golden-yellow">{modalTitle}</h2>
                <button onClick={onClose}><CloseIcon className="w-6 h-6"/></button>
            </header>
            <div className="p-6 overflow-y-auto">
                {message && <p className={`p-3 rounded-md mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder={t('pollTitleLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2" />
                    <input type="text" value={question} onChange={e => setQuestion(e.target.value)} required placeholder={t('pollQuestionLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2" />
                    
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('pollOptionsLabel')}</label>
                        {options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input type="text" value={opt.option_text} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`${t('optionPlaceholder')} ${index+1}`} required className="flex-grow bg-marine-blue-darkest/80 rounded-md p-2"/>
                                {mode === 'republish' && options.length > 2 && <button type="button" onClick={() => removeOption(index)} className="p-2 bg-red-600 rounded-full"><CloseIcon className="w-4 h-4"/></button>}
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

                    <button type="submit" disabled={loading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50">
                        {loading ? t('newsLoading') : submitButtonText}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default EditPollModal;