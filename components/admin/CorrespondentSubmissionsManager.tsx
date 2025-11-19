
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon, MicIcon, VideoCameraIcon, TrashIcon, EditIcon } from '../Icons';
import EditCorrespondentSubmissionModal from './EditCorrespondentSubmissionModal';

interface CorrespondentSubmission {
  id: number;
  created_at: string;
  date_time: string;
  title: string | null;
  message: string | null;
  audio: string | null;
  video: string | null;
  user_name: string | null;
  email: string | null;
}

interface CorrespondentSubmissionsManagerProps {
    onBack: () => void;
}

const CorrespondentSubmissionsManager: React.FC<CorrespondentSubmissionsManagerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [submissions, setSubmissions] = useState<CorrespondentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<CorrespondentSubmission | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('correspondent_submissions')
        .select('*')
        .order('date_time', { ascending: false });

      if (queryError) throw queryError;
      setSubmissions(data || []);
    } catch (err: any) {
      console.error("Error fetching submissions:", err);
      setError(`${t('newsError')}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [t]);

  const handleDelete = async (submission: CorrespondentSubmission) => {
    if (window.confirm(t('confirmDeleteSubmission'))) {
        setMessage(null);
        try {
            // 1. Delete file from storage if exists
            const fileUrl = submission.audio || submission.video;
            if (fileUrl) {
                 const path = fileUrl.split('/correspondent-materials/')[1];
                 if (path) {
                    // Need to decode the path in case of URL encoding
                    const decodedPath = decodeURIComponent(path);
                    const { error: storageError } = await supabase.storage
                        .from('correspondent-materials')
                        .remove([decodedPath]);
                    
                    if (storageError) console.warn("Storage deletion warning:", storageError);
                 }
            }

            // 2. Delete record from DB
            const { error: dbError } = await supabase
                .from('correspondent_submissions')
                .delete()
                .eq('id', submission.id);
            
            if (dbError) throw dbError;

            setMessage({ type: 'success', text: t('deleteSubmissionSuccess') });
            fetchSubmissions();
        } catch (err: any) {
            console.error("Delete error:", err);
            setMessage({ type: 'error', text: `${t('deleteSubmissionError')}: ${err.message}` });
        }
    }
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      // Extract extension
      const ext = url.split('.').pop()?.split('?')[0] || 'media';
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.${ext}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Download error:", err);
      alert("Download failed. Please check console.");
    }
  };

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline">
        <BackIcon className="w-5 h-5" />
        {t('backToDashboard')}
      </button>
      
      {message && (
         <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.text}
         </div>
      )}

      {loading && <p>{t('newsLoading')}</p>}
      {error && <p className="text-red-400">{error}</p>}
      
      {!loading && !error && submissions.length === 0 && (
        <div className="text-center py-10 bg-marine-blue-darker rounded-lg">
            <p className="text-white/70">{t('noCorrespondentSubmissions')}</p>
        </div>
      )}

      {!loading && !error && submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map(sub => (
            <div key={sub.id} className="bg-marine-blue-darker p-4 rounded-lg shadow-md flex flex-col gap-4 border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-montserrat text-golden-yellow font-bold">{sub.title || '(No Title)'}</h3>
                    <p className="text-xs text-white/50">
                        {t('sender')}: <span className="text-white/80">{sub.user_name}</span> ({sub.email})
                    </p>
                    <p className="text-xs text-white/50">
                        {t('receivedOn')}: <span className="text-white/80">{new Date(sub.date_time || sub.created_at).toLocaleString()}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setEditingSubmission(sub)}
                        className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 text-white transition-colors"
                        title={t('edit')}
                    >
                        <EditIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => handleDelete(sub)}
                        className="p-2 bg-red-600 rounded-full hover:bg-red-700 text-white transition-colors"
                        title={t('adminDeleteButton')}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
              </div>

              {sub.message && (
                  <div className="bg-marine-blue-darkest/30 p-3 rounded text-sm text-white/90 italic">
                      "{sub.message}"
                  </div>
              )}
              
              <div className="bg-black/20 p-4 rounded-lg flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 text-white/70 font-bold text-sm bg-black/40 px-3 py-1 rounded-full">
                      {sub.video ? <VideoCameraIcon className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
                      {sub.video ? "VIDEO" : "AUDIO"}
                  </div>
                  
                  <div className="flex-grow w-full">
                      {sub.video ? (
                          <video src={sub.video} controls className="w-full max-h-[200px] rounded bg-black" />
                      ) : (sub.audio ? (
                          <audio src={sub.audio} controls className="w-full" />
                      ) : <p className="text-red-400 text-sm">Media file missing</p>)}
                  </div>

                  <button
                    onClick={() => handleDownload(sub.video || sub.audio || '', sub.title || 'submission')}
                    className="w-full sm:w-auto bg-golden-yellow text-marine-blue font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors text-sm"
                  >
                    {t('download')}
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingSubmission && (
          <EditCorrespondentSubmissionModal 
            submission={editingSubmission} 
            onClose={() => setEditingSubmission(null)} 
            onSuccess={() => { fetchSubmissions(); setEditingSubmission(null); }} 
          />
      )}
    </div>
  );
};

export default CorrespondentSubmissionsManager;
