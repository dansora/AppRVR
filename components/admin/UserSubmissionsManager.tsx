import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon } from '../Icons';

interface Submission {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  file_url: string | null;
  user_id: string | null;
}

interface UserSubmissionsManagerProps {
    onBack: () => void;
}

const UserSubmissionsManager: React.FC<UserSubmissionsManagerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: queryError } = await supabase
          .from('user_submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryError) {
          throw queryError;
        }
        setSubmissions(data || []);
      } catch (err: any) {
        console.error("Error fetching submissions:", err);
        setError(`${t('newsError')}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [t]);

  const handleDownload = async (url: string) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      // Extract filename from URL
      const filename = url.substring(url.lastIndexOf('/') + 1).split('?')[0];
      link.download = filename || 'download';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Download failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const renderMedia = (url: string) => {
    const isImage = url.includes('app-images');
    const isVideo = url.includes('app-videos');

    if (isImage) {
      return <img src={url} alt="User submission" className="max-w-full h-auto max-h-80 rounded-md object-contain" />;
    }
    if (isVideo) {
      return <video src={url} controls className="max-w-full h-auto max-h-80 rounded-md" />;
    }
    return <p className="text-sm text-white/50">Unsupported file type.</p>;
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline">
        <BackIcon className="w-5 h-5" />
        {t('backToDashboard')}
      </button>
      
      {loading && <p>{t('newsLoading')}</p>}
      {error && <p className="text-red-400">{error}</p>}
      
      {!loading && !error && submissions.length === 0 && (
        <div className="text-center py-10 bg-marine-blue-darker rounded-lg">
            <p className="text-white/70">{t('noUserSubmissions')}</p>
        </div>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-marine-blue-darker p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-montserrat text-golden-yellow">{t('userDetails')}</h3>
                <p className="text-sm"><strong>{t('uploadFormName')}:</strong> {sub.name || 'N/A'}</p>
                <p className="text-sm"><strong>{t('uploadFormEmail')}:</strong> {sub.email || 'N/A'}</p>
                <p className="text-sm"><strong>{t('uploadFormPhone')}:</strong> {sub.phone || 'N/A'}</p>
                <p className="text-xs text-white/50 mt-1">{t('submittedOn', { date: new Date(sub.created_at).toLocaleString() })}</p>

                <h3 className="text-lg font-montserrat text-golden-yellow mt-4">{t('userMessage')}</h3>
                <p className="text-sm whitespace-pre-wrap bg-marine-blue-darkest/50 p-2 rounded-md">{sub.message || '(No message)'}</p>
              </div>
              
              {sub.file_url && (
                <div className="w-full md:w-1/2">
                  <h3 className="text-lg font-montserrat text-golden-yellow mb-2">{t('attachedFile')}</h3>
                  <div className="mb-2">
                    {renderMedia(sub.file_url)}
                  </div>
                  <button
                    onClick={() => handleDownload(sub.file_url!)}
                    className="w-full bg-golden-yellow text-marine-blue font-bold py-2 rounded-full hover:bg-yellow-400 transition-colors"
                  >
                    {t('download')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSubmissionsManager;
