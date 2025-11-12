import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon } from '../Icons';
import { useModal } from '../../contexts/ModalContext';

interface Advertisement {
  id: number;
  created_at: string;
  title: string;
  text: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  link_url: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface EditAdModalProps {
  ad: Advertisement;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAdModal: React.FC<EditAdModalProps> = ({ ad, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { registerModal, unregisterModal } = useModal();

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

  const [title, setTitle] = useState(ad.title);
  const [text, setText] = useState(ad.text || '');
  const [linkUrl, setLinkUrl] = useState(ad.link_url);
  
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  const [startDate, setStartDate] = useState(formatDateForInput(ad.start_date));
  const [endDate, setEndDate] = useState(formatDateForInput(ad.end_date));
  const [isActive, setIsActive] = useState(ad.is_active);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        setMessage({ type: 'error', text: t('pollEndDateAfterStart') });
        setLoading(false);
        return;
    }

    const updates = {
        title,
        text: text || null,
        link_url: linkUrl,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: isActive,
    };

    const { error } = await supabase.from('advertisements').update(updates).eq('id', ad.id);
    if (error) {
        setMessage({type: 'error', text: `${t('adUpdatedError')}: ${error.message}`});
    } else {
        setMessage({type: 'success', text: t('adUpdatedSuccess')});
        onSuccess();
        setTimeout(onClose, 1000); // Close after showing success message
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-2xl font-montserrat text-golden-yellow">{t('editAd')}</h2>
                <button onClick={onClose}><CloseIcon className="w-6 h-6"/></button>
            </header>
            <div className="p-6 overflow-y-auto">
                {message && <div className={`p-3 rounded-md text-center mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={t('adTitleLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2" />
                    <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={t('adTextLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2"></textarea>
                    <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required placeholder={t('adLinkLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2" />

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">{t('pollStartDate')}</label>
                            <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className="w-full bg-marine-blue-darker/80 rounded-md p-2"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">{t('pollEndDate')}</label>
                            <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="w-full bg-marine-blue-darker/80 rounded-md p-2"/>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <label className="block text-sm font-medium text-white/80">Status</label>
                        <button type="button" onClick={() => setIsActive(!isActive)} className={`font-bold py-1 px-3 rounded-full text-sm w-24 text-center transition-colors ${isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}>
                            {isActive ? t('adStatusActive') : t('adStatusInactive')}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50">
                        {loading ? t('newsLoading') : t('adUpdate')}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default EditAdModal;