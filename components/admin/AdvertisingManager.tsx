import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon, UploadIcon, ChevronRightIcon } from '../Icons';

interface Advertisement {
  id: number;
  created_at: string;
  title: string;
  text: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  link_url: string;
  is_active: boolean;
}

interface AdvertisingManagerProps {
    onBack: () => void;
}

const AdvertisingManager: React.FC<AdvertisingManagerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newMediaFile, setNewMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('advertisements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') { // "undefined_table" error code
        setTableExists(false);
      } else {
        setMessage({ type: 'error', text: `${t('newsError')}: ${error.message}` });
      }
    } else {
      setTableExists(true);
      setAds(data || []);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setNewMediaFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setMediaPreview(reader.result as string);
        reader.readAsDataURL(file);
    } else {
        setNewMediaFile(null);
        setMediaPreview(null);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMediaFile) {
        setMessage({ type: 'error', text: 'Media file is required.' });
        return;
    }
    setIsUploading(true);
    setMessage(null);

    try {
        const fileExt = newMediaFile.name.split('.').pop();
        const mediaType = newMediaFile.type.startsWith('image/') ? 'image' : 'video';
        const filePath = `public/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('advertisements-media')
            .upload(filePath, newMediaFile);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('advertisements-media').getPublicUrl(filePath);
        const mediaUrl = data.publicUrl;

        const { error: insertError } = await supabase.from('advertisements').insert({
            title: newTitle,
            text: newText || null,
            link_url: newLink,
            media_url: mediaUrl,
            media_type: mediaType,
            is_active: true,
        });
        if (insertError) throw insertError;
        
        setMessage({ type: 'success', text: t('adCreatedSuccess') });
        setNewTitle(''); setNewText(''); setNewLink(''); setNewMediaFile(null); setMediaPreview(null);
        fetchAds();
    } catch (err: any) {
        setMessage({ type: 'error', text: `${t('adCreatedError')}: ${err.message}` });
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteAd = async (ad: Advertisement) => {
    if (window.confirm(t('confirmAdDelete'))) {
        const { error: deleteError } = await supabase.from('advertisements').delete().eq('id', ad.id);

        if (deleteError) {
            setMessage({ type: 'error', text: `${t('adDeletedError')}: ${deleteError.message}` });
        } else {
            const filePathParts = ad.media_url.split('/');
            const fileName = filePathParts[filePathParts.length - 1];
            if (fileName) {
                 await supabase.storage.from('advertisements-media').remove([`public/${fileName}`]);
            }
            setMessage({ type: 'success', text: t('adDeletedSuccess') });
            fetchAds();
        }
    }
  };
  
  const handleToggleActive = async (ad: Advertisement) => {
    const { error } = await supabase
        .from('advertisements')
        .update({ is_active: !ad.is_active })
        .eq('id', ad.id);

    if (error) {
        setMessage({ type: 'error', text: `${t('adUpdatedError')}: ${error.message}` });
    } else {
        setMessage({ type: 'success', text: t('adUpdatedSuccess')});
        fetchAds();
    }
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

        {/* Create Ad Section */}
        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('createAd')}</h2>
          <form onSubmit={handleCreateAd} className="space-y-4">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder={t('adTitleLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2" />
            <textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={2} placeholder={t('adTextLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2"></textarea>
            <input type="url" value={newLink} onChange={(e) => setNewLink(e.target.value)} required placeholder={t('adLinkLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2" />
            
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('adMediaLabel')}</label>
                <div className="relative">
                    <input type="file" id="media-upload" accept="image/*,video/*" className="absolute w-0 h-0 opacity-0" onChange={handleMediaChange} />
                    <label htmlFor="media-upload" className="cursor-pointer w-full flex justify-between items-center bg-marine-blue-darkest/80 rounded-md p-2 text-white/70 hover:bg-marine-blue-darkest">
                        <span>{newMediaFile?.name || t('uploadFormFilePlaceholder')}</span>
                        <UploadIcon className="w-5 h-5" />
                    </label>
                </div>
                {mediaPreview && (newMediaFile?.type.startsWith('image') ? 
                    <img src={mediaPreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" /> :
                    <video src={mediaPreview} controls className="mt-2 w-32 object-contain rounded-md" />
                )}
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50 flex justify-center items-center">
             {isUploading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {t('createAd')}
            </button>
          </form>
        </div>

        {/* List Ads Section */}
        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('allAds')}</h2>
          {loading ? <p>{t('newsLoading')}</p> : ads.length === 0 ? <p>{t('noAds')}</p> : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {ads.map(ad => (
                <div key={ad.id} className="bg-marine-blue-darkest/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start">
                  {ad.media_type === 'image' ? 
                    <img src={ad.media_url} className="w-full md:w-32 h-auto md:h-20 object-cover rounded-md" /> :
                    <video src={ad.media_url} className="w-full md:w-32 h-auto md:h-20 object-cover rounded-md" />
                  }
                  <div className="flex-1">
                    <p className="font-bold text-white">{ad.title}</p>
                    <p className="text-sm text-white/80 line-clamp-2">{ad.text}</p>
                    <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-golden-yellow hover:underline truncate flex items-center">{ad.link_url} <ChevronRightIcon className="w-4 h-4" /></a>
                  </div>
                  <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-end gap-2">
                    <button onClick={() => handleToggleActive(ad)} className={`font-bold py-1 px-3 rounded-full text-sm w-24 text-center ${ad.is_active ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
                      {ad.is_active ? t('adStatusActive') : t('adStatusInactive')}
                    </button>
                    <button onClick={() => handleDeleteAd(ad)} className="bg-red-600 hover:bg-red-700 font-bold py-1 px-3 rounded-full text-sm w-24 text-center">
                      {t('adminDeleteButton')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

const DatabaseSetupInstructions: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const sqlScript = `-- 1. Create the table for storing advertisement data
CREATE TABLE public.advertisements (
  id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title text NOT NULL,
  text text NULL,
  media_url text NOT NULL,
  media_type text NOT NULL, -- Should be 'image' or 'video'
  link_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT advertisements_pkey PRIMARY KEY (id)
);

-- 2. Enable Row Level Security (RLS) on the new table
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy to allow public read access to active ads
CREATE POLICY "Allow public read access to active ads"
ON public.advertisements
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- 4. Create a policy to allow admin users full access to manage ads
CREATE POLICY "Allow admins full access to manage advertisements"
ON public.advertisements
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
                <h2 className="text-xl font-montserrat text-yellow-400">Database Setup Required</h2>
                <p>The advertising feature requires a new database table and storage bucket. Please follow these steps:</p>
                
                <div className="space-y-2">
                    <h3 className="font-bold text-lg">Step 1: Create Storage Bucket</h3>
                    <ul className="list-disc list-inside text-white/80 space-y-1">
                        <li>Go to your Supabase project dashboard and navigate to 'Storage'.</li>
                        <li>Click 'New bucket'.</li>
                        <li>Enter bucket name: <code className="bg-marine-blue-darkest px-1 rounded">advertisements-media</code></li>
                        <li><strong>Important:</strong> Toggle 'Public bucket' to ON.</li>
                        <li>Click 'Create bucket'.</li>
                    </ul>
                </div>

                <div className="space-y-2">
                    <h3 className="font-bold text-lg">Step 2: Run SQL Script</h3>
                    <p>In your Supabase dashboard, navigate to the 'SQL Editor', create a new query, paste the following code, and click 'RUN'.</p>
                    <pre className="bg-marine-blue-darkest p-4 rounded-md text-sm text-white/90 overflow-x-auto">
                        <code>{sqlScript}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default AdvertisingManager;