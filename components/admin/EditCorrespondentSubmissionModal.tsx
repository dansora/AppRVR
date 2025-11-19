
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon } from '../Icons';
import { useModal } from '../../contexts/ModalContext';

interface CorrespondentSubmission {
  id: number;
  title: string | null;
  message: string | null;
}

interface EditCorrespondentSubmissionModalProps {
  submission: CorrespondentSubmission;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCorrespondentSubmissionModal: React.FC<EditCorrespondentSubmissionModalProps> = ({ submission, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registerModal, unregisterModal } = useModal();

  const [title, setTitle] = useState(submission.title || '');
  const [message, setMessage] = useState(submission.message || '');

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
        const { error } = await supabase
            .from('correspondent_submissions')
            .update({ title, message })
            .eq('id', submission.id);

        if (error) throw error;
        onSuccess();
    } catch (err: any) {
        setError(`${t('submissionUpdatedError')}: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-marine-blue-darkest w-full max-w-lg rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-2xl font-montserrat text-golden-yellow">{t('editSubmission')}</h2>
                <button onClick={onClose}><CloseIcon className="w-6 h-6"/></button>
            </header>
            <div className="p-6 overflow-y-auto">
                {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-center mb-4">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('materialTitleLabel')}</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-marine-blue-darker/80 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('materialTextLabel')}</label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="w-full bg-marine-blue-darker/80 rounded-md p-2"></textarea>
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

export default EditCorrespondentSubmissionModal;
