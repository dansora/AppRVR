import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { CloseIcon, UploadIcon } from '../Icons';
import { useModal } from '../../contexts/ModalContext';

interface Event {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface EditEventModalProps {
  event: Event;
  onClose: () => void;
  onSuccess: () => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ event, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { registerModal, unregisterModal } = useModal();

  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [linkUrl, setLinkUrl] = useState(event.link_url || '');
  const [isActive, setIsActive] = useState(event.is_active);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(event.image_url);
  
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);
    return localDate.toISOString().slice(0, 16);
  };

  const [startDate, setStartDate] = useState(formatDateForInput(event.start_date));
  const [endDate, setEndDate] = useState(formatDateForInput(event.end_date));

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

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
        let imageUrl = event.image_url;
        if (newImageFile) {
            if (event.image_url) {
                const oldFilePath = event.image_url.split('/').pop()?.split('?')[0];
                if(oldFilePath) await supabase.storage.from('events-images').remove([`public/${oldFilePath}`]);
            }
            const newFilePath = `public/${Date.now()}-${newImageFile.name}`;
            const { error: uploadError } = await supabase.storage.from('events-images').upload(newFilePath, newImageFile);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('events-images').getPublicUrl(newFilePath);
            imageUrl = data.publicUrl;
        }

        const updates = {
            title,
            description: description || null,
            link_url: linkUrl || null,
            start_date: startDate || null,
            end_date: endDate || null,
            is_active: isActive,
            image_url: imageUrl,
        };

        const { error } = await supabase.from('events').update(updates).eq('id', event.id);
        if (error) throw error;
        
        setMessage({type: 'success', text: t('eventUpdatedSuccess')});
        onSuccess();
        setTimeout(onClose, 1000);
    } catch (err: any) {
        setMessage({type: 'error', text: `${t('eventUpdatedError')}: ${err.message}`});
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('confirmEventDelete'))) {
        setLoading(true);
        const { error } = await supabase.from('events').delete().eq('id', event.id);
        if (error) {
            setMessage({ type: 'error', text: `${t('eventDeletedError')}: ${error.message}` });
        } else {
            if (event.image_url) {
                const oldFilePath = event.image_url.split('/').pop()?.split('?')[0];
                if(oldFilePath) await supabase.storage.from('events-images').remove([`public/${oldFilePath}`]);
            }
            setMessage({ type: 'success', text: t('eventDeletedSuccess') });
            onSuccess();
            setTimeout(onClose, 1000);
        }
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <header className="flex items-center justify-between p-4 border-b border-white/20">
                <h2 className="text-2xl font-montserrat text-golden-yellow">{t('editEvent')}</h2>
                <button onClick={onClose}><CloseIcon className="w-6 h-6"/></button>
            </header>
            <div className="p-6 overflow-y-auto">
                {message && <div className={`p-3 rounded-md text-center mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{message.text}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder={t('eventTitleLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={t('eventDescLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2"></textarea>
                    <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder={t('eventLinkLabel')} className="w-full bg-marine-blue-darker/80 rounded-md p-2" />

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
                        <label className="block text-sm font-medium text-white/80 mb-1">{t('eventImageLabel')}</label>
                        <div className="relative">
                            <input type="file" id="media-edit-upload" accept="image/*" className="absolute w-0 h-0 opacity-0" onChange={handleImageChange} />
                            <label htmlFor="media-edit-upload" className="cursor-pointer w-full flex justify-between items-center bg-marine-blue-darkest/80 rounded-md p-2 text-white/70 hover:bg-marine-blue-darkest">
                                <span>{newImageFile?.name || t('uploadFormFilePlaceholder')}</span>
                                <UploadIcon className="w-5 h-5" />
                            </label>
                        </div>
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />}
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <label className="block text-sm font-medium text-white/80">Status</label>
                        <button type="button" onClick={() => setIsActive(!isActive)} className={`font-bold py-1 px-3 rounded-full text-sm w-24 text-center transition-colors ${isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}>
                            {isActive ? t('adStatusActive') : t('adStatusInactive')}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                        <button type="button" onClick={handleDelete} disabled={loading} className="w-full sm:w-auto bg-red-600 text-white font-bold py-3 px-6 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50">
                            {t('adminDeleteButton')}
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50">
                            {loading ? t('newsLoading') : t('adUpdate')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default EditEventModal;