import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon, UploadIcon } from '../Icons';

interface Contest {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  prizes: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  number_of_prizes: number;
  contest_participants: { is_winner: boolean }[];
}

interface EditContestModalProps {
  contest: Contest;
  onClose: () => void;
  onSuccess: () => void;
}

const EditContestModal: React.FC<EditContestModalProps> = ({ contest, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [title, setTitle] = useState(contest.title);
  const [description, setDescription] = useState(contest.description || '');
  const [prizes, setPrizes] = useState(contest.prizes || '');
  const [numberOfPrizes, setNumberOfPrizes] = useState(contest.number_of_prizes || 1);
  const [isActive, setIsActive] = useState(contest.is_active);

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  const [startDate, setStartDate] = useState(formatDateForInput(contest.start_date));
  const [endDate, setEndDate] = useState(formatDateForInput(contest.end_date));

  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(contest.image_url);

  const getContestStatus = (c: Contest) => {
    const now = new Date();
    const start = new Date(c.start_date);
    const end = new Date(c.end_date);
    const winnerCount = c.contest_participants?.filter(p => p.is_winner).length || 0;

    if (!c.is_active) {
        return { text: t('contestStatusInactive'), color: 'bg-gray-500' };
    }
    if (end < now) {
        if (winnerCount > 0) {
             return { text: t('contestStatusWinnerSelected'), color: 'bg-purple-600' };
        }
        return { text: t('contestStatusExpired'), color: 'bg-red-600' };
    }
    if (start > now) {
        return { text: t('contestStatusScheduled'), color: 'bg-blue-600' };
    }
    
    return { text: t('contestStatusActive'), color: 'bg-green-600' };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setNewImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
        setMessage({ type: 'error', text: t('pollEndDateAfterStart') });
        setLoading(false);
        return;
    }

    try {
        let imageUrl = contest.image_url;
        if (newImageFile) {
            // Delete old image if it exists
            if (contest.image_url) {
                const oldFilePathParts = contest.image_url.split('/');
                const oldFileName = oldFilePathParts[oldFilePathParts.length - 1];
                if (oldFileName) {
                    await supabase.storage.from('contests-images').remove([`public/${oldFileName}`]);
                }
            }
            // Upload new image
            const filePath = `public/${Date.now()}-${newImageFile.name}`;
            const { error: uploadError } = await supabase.storage.from('contests-images').upload(filePath, newImageFile);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('contests-images').getPublicUrl(filePath);
            imageUrl = data.publicUrl;
        }

        const updates = {
            title,
            description: description || null,
            prizes: prizes || null,
            number_of_prizes: numberOfPrizes,
            start_date: startDate || null,
            end_date: endDate || null,
            is_active: isActive,
            image_url: imageUrl,
        };

        const { error } = await supabase.from('contests').update(updates).eq('id', contest.id);
        if (error) throw error;
        
        setMessage({type: 'success', text: t('contestUpdatedSuccess')});
        onSuccess();
        setTimeout(onClose, 1000);

    } catch (err: any) {
        setMessage({type: 'error', text: `${t('contestUpdatedError')}: ${err.message}`});
    } finally {
        setLoading(false);
    }
  };

  const status = getContestStatus(contest);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-2xl font-montserrat text-golden-yellow">{t('editContest')}</h2>
                <button onClick={onClose}><CloseIcon className="w-6 h-6"/></button>
            </header>
            <div className="p-6 overflow-y-auto">
                {message && <div className={`p-3 rounded-md text-center mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={t('contestNameLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={t('contestDescLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2"></textarea>
                    <textarea value={prizes} onChange={(e) => setPrizes(e.target.value)} rows={2} placeholder={t('contestPrizesLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2"></textarea>
                    
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('contestNumberOfPrizesLabel')}</label>
                        <input type="number" min="1" value={numberOfPrizes} onChange={(e) => setNumberOfPrizes(parseInt(e.target.value, 10) || 1)} required className="w-full bg-marine-blue-darker/80 rounded-md p-2"/>
                    </div>

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
                    
                    <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('contestImageLabel')}</label>
                        <div className="relative">
                            <input type="file" id="image-edit-upload" accept="image/*" className="absolute w-0 h-0 opacity-0" onChange={handleImageChange} />
                            <label htmlFor="image-edit-upload" className="cursor-pointer w-full flex justify-between items-center bg-marine-blue-darkest/80 rounded-md p-2 text-white/70 hover:bg-marine-blue-darkest">
                                <span>{newImageFile?.name || t('uploadFormFilePlaceholder')}</span>
                                <UploadIcon className="w-5 h-5" />
                            </label>
                        </div>
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />}
                    </div>
                    
                    <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                        <label className="block text-sm font-medium text-white/80">Status:</label>
                         <span className={`font-bold py-1 px-3 rounded-full text-white text-sm w-32 text-center ${status.color}`}>
                            {status.text}
                        </span>
                        <div className="flex-grow"></div>
                        <label htmlFor="is_active_toggle" className="text-sm font-medium text-white/80">Manual:</label>
                        <button type="button" onClick={() => setIsActive(!isActive)} className={`font-bold py-1 px-3 rounded-full text-sm w-28 text-center transition-colors ${isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}>
                            {isActive ? t('adStatusActive') : t('adStatusInactive')}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50">
                        {loading ? t('newsLoading') : t('contestUpdate')}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

export default EditContestModal;