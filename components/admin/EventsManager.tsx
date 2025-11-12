import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon, UploadIcon, EditIcon } from '../Icons';
import EditEventModal from './EditEventModal';

interface Event {
  id: number;
  created_at: string;
  title: string;
  description: string | null;
  image_url: string | null;
  link_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface EventsManagerProps {
    onBack: () => void;
}

const EventsManager: React.FC<EventsManagerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      if (error.code === '42P01') {
        setTableExists(false);
      } else {
        setMessage({ type: 'error', text: `${t('newsError')}: ${error.message}` });
      }
    } else {
      setTableExists(true);
      setEvents(data || []);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setNewImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    } else {
        setNewImageFile(null);
        setImagePreview(null);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate) return;
    if (new Date(newEndDate) <= new Date(newStartDate)) {
        setMessage({ type: 'error', text: t('pollEndDateAfterStart') });
        return;
    }
    setIsUploading(true);
    setMessage(null);

    try {
        let imageUrl: string | null = null;
        if (newImageFile) {
            const filePath = `public/${Date.now()}-${newImageFile.name}`;
            const { error: uploadError } = await supabase.storage.from('events-images').upload(filePath, newImageFile);
            if (uploadError) throw uploadError;
            const { data } = supabase.storage.from('events-images').getPublicUrl(filePath);
            imageUrl = data.publicUrl;
        }

        const { error: insertError } = await supabase.from('events').insert({
            title: newTitle,
            description: newDescription || null,
            link_url: newLink || null,
            image_url: imageUrl,
            start_date: newStartDate,
            end_date: newEndDate,
        });
        if (insertError) throw insertError;
        
        setMessage({ type: 'success', text: t('eventCreatedSuccess') });
        setNewTitle(''); setNewDescription(''); setNewLink(''); setNewImageFile(null); setImagePreview(null); setNewStartDate(''); setNewEndDate('');
        fetchEvents();
    } catch (err: any) {
        setMessage({ type: 'error', text: `${t('eventCreatedError')}: ${err.message}` });
    } finally {
        setIsUploading(false);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);

    if (!event.is_active) return { text: t('adStatusInactive'), color: 'bg-gray-500' };
    if (end < now) return { text: t('adStatusExpired'), color: 'bg-red-600' };
    if (start > now) return { text: t('adStatusScheduled'), color: 'bg-blue-600' };
    return { text: t('adStatusActive'), color: 'bg-green-600' };
  };

  if (tableExists === false) {
    return <DatabaseSetupInstructions onBack={onBack} />;
  }

  return (
    <div className="space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline mb-4">
            <BackIcon className="w-5 h-5" />
            {t('backToDashboard')}
        </button>

        {message && (
             <div className={`p-3 rounded-md text-center mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
             </div>
        )}

        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('createEvent')}</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder={t('eventTitleLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2" />
            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} placeholder={t('eventDescLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2"></textarea>
            <input type="url" value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder={t('eventLinkLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2" />
            
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollStartDate')}</label>
                    <input type="datetime-local" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollEndDate')}</label>
                    <input type="datetime-local" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2"/>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('eventImageLabel')}</label>
                <div className="relative">
                    <input type="file" id="media-upload" accept="image/*" className="absolute w-0 h-0 opacity-0" onChange={handleImageChange} />
                    <label htmlFor="media-upload" className="cursor-pointer w-full flex justify-between items-center bg-marine-blue-darkest/80 rounded-md p-2 text-white/70 hover:bg-marine-blue-darkest">
                        <span>{newImageFile?.name || t('uploadFormFilePlaceholder')}</span>
                        <UploadIcon className="w-5 h-5" />
                    </label>
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />}
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50 flex justify-center items-center">
             {isUploading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {t('createEvent')}
            </button>
          </form>
        </div>

        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('allEvents')}</h2>
          {loading ? <p>{t('newsLoading')}</p> : events.length === 0 ? <p>{t('noEvents')}</p> : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {events.map(event => {
                const status = getEventStatus(event);
                return (
                    <div key={event.id} className="bg-marine-blue-darkest/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start">
                        {event.image_url && <img src={event.image_url} className="w-full md:w-32 h-auto md:h-20 object-cover rounded-md" alt={event.title} />}
                        <div className="flex-1">
                            <p className="font-bold text-white">{event.title}</p>
                            <p className="text-sm text-white/80 line-clamp-2">{event.description}</p>
                            <div className="text-xs text-white/70 mt-2">
                                <p>Start: {new Date(event.start_date).toLocaleString()}</p>
                                <p>End: {new Date(event.end_date).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-end gap-2">
                            <span className={`font-bold py-1 px-3 rounded-full text-white text-sm w-28 text-center ${status.color}`}>
                                {status.text}
                            </span>
                            <button onClick={() => setEditingEvent(event)} className="bg-blue-600 hover:bg-blue-700 font-bold py-1 px-3 rounded-full text-sm w-28 text-center flex items-center justify-center gap-1">
                                <EditIcon className="w-4 h-4" /> {t('editEvent')}
                            </button>
                        </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>
        {editingEvent && <EditEventModal event={editingEvent} onClose={() => setEditingEvent(null)} onSuccess={fetchEvents} />}
    </div>
  );
};

const DatabaseSetupInstructions: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const createTableScript = `-- 1. Create the table for storing event data
CREATE TABLE public.events (
  id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text NULL,
  image_url text NULL,
  link_url text NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- 2. Enable Row Level Security (RLS) on the new table
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow public read access
CREATE POLICY "Allow public read access to events"
ON public.events
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. Create a policy to allow admin users full access
CREATE POLICY "Allow admins full access to events"
ON public.events
FOR ALL
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text)
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text);`;

    return (
        <div>
             <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline mb-4">
                <BackIcon className="w-5 h-5" />
                Back to Dashboard
            </button>
            <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md space-y-4">
                <h2 className="text-xl font-montserrat text-yellow-400">Database Setup Required for Events</h2>
                <p>The events feature requires a new table and storage bucket in your database. Please follow these steps:</p>
                
                <div className="space-y-2">
                    <h4 className="font-semibold mt-2">Step 1: Create Storage Bucket</h4>
                    <ul className="list-disc list-inside text-white/80 space-y-1">
                        <li>Go to your Supabase project and navigate to 'Storage'.</li>
                        <li>Click 'New bucket'.</li>
                        <li>Enter bucket name: <code className="bg-marine-blue-darkest px-1 rounded">events-images</code></li>
                        <li><strong>Important:</strong> Toggle 'Public bucket' to ON.</li>
                        <li>Click 'Create bucket'.</li>
                    </ul>
                    <h4 className="font-semibold mt-2">Step 2: Run SQL Script</h4>
                    <p>In your Supabase project, go to the 'SQL Editor', create a new query, paste the following code, and click 'RUN'.</p>
                    <pre className="bg-marine-blue-darkest p-4 rounded-md text-sm text-white/90 overflow-x-auto">
                        <code>{createTableScript}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default EventsManager;