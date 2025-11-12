import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './Icons';
import { useModal } from '../contexts/ModalContext';

interface Announcement {
  id: number;
  title: string;
  content: string;
  user_id: string | null;
}

interface ResendAnnouncementModalProps {
  announcement: Announcement | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ResendAnnouncementModal: React.FC<ResendAnnouncementModalProps> = ({ announcement, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registerModal, unregisterModal } = useModal();

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

  // Form state, initialized from the announcement prop
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || '');
      setContent(announcement.content || '');
      setUserId(announcement.user_id || '');
    }
  }, [announcement]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        user_id: userId || null,
      });

    if (insertError) {
      setError(`${t('adminResendError')}: ${insertError.message}`);
    } else {
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  if (!announcement) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/20">
          <h2 className="text-2xl font-montserrat text-golden-yellow">{t('adminResendModalTitle')}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
          {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-center mb-4">{error}</div>}
          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label htmlFor="resend-title" className="block text-sm font-medium text-white/80 mb-1">{t('adminTitleLabel')}</label>
              <input id="resend-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <div>
              <label htmlFor="resend-content" className="block text-sm font-medium text-white/80 mb-1">{t('adminContentLabel')}</label>
              <textarea id="resend-content" value={content} onChange={(e) => setContent(e.target.value)} rows={4} required className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent"></textarea>
            </div>
            <div>
              <label htmlFor="resend-user_id" className="block text-sm font-medium text-white/80 mb-1">{t('adminTargetUserLabel')}</label>
              <input id="resend-user_id" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={t('adminTargetUserPlaceholder')} className="w-full bg-marine-blue-darker/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-gray-500 flex items-center justify-center"
            >
              {loading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {t('adminResendButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResendAnnouncementModal;