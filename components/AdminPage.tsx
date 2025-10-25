import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import ResendAnnouncementModal from './ResendAnnouncementModal';

interface Announcement {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user_id: string | null;
}

const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isResendModalOpen, setIsResendModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newUserId, setNewUserId] = useState('');

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }
      setAnnouncements(data || []);
    } catch (err: any) {
        console.error("Error fetching announcements:", err);
        let specificError = 'An unknown error occurred.';
        if (typeof err === 'object' && err !== null) {
            specificError = (err as any).message || JSON.stringify(err);
        } else if (err) {
            specificError = String(err);
        }
        setError(`${t('newsError')}: ${specificError}`);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [t]);
  
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newContent) {
        setMessage({ type: 'error', text: 'Content cannot be empty.' });
        return;
    }
    
    const { error: insertError } = await supabase
        .from('announcements')
        .insert({
            title: newTitle,
            content: newContent,
            user_id: newUserId || null,
        });
    
    if (insertError) {
        setMessage({ type: 'error', text: `${t('adminAnnouncementError')}: ${insertError.message}` });
        console.error(insertError);
    } else {
        setMessage({ type: 'success', text: t('adminAnnouncementSuccess') });
        setNewTitle('');
        setNewContent('');
        setNewUserId('');
        fetchAnnouncements(); // Refresh list
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (window.confirm(t('adminConfirmDelete'))) {
        const { error: deleteError } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (deleteError) {
            setMessage({ type: 'error', text: `${t('adminDeleteError')}: ${deleteError.message}` });
            console.error(deleteError);
        } else {
            setMessage({ type: 'success', text: t('adminDeleteSuccess') });
            fetchAnnouncements(); // Refresh list
        }
    }
  };
  
  const handleOpenResendModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsResendModalOpen(true);
  };

  const handleResendSuccess = () => {
    setMessage({ type: 'success', text: t('adminResendSuccess') });
    fetchAnnouncements(); // Refresh the list
  };


  return (
    <div className="p-4 text-white font-roboto pb-20 max-w-4xl mx-auto">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('adminPanelTitle')}</h1>

      <div className="space-y-8">
        {/* Create Announcement Section */}
        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('adminCreateAnnouncement')}</h2>
          {message && (
             <div className={`p-3 rounded-md text-center mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
             </div>
          )}
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1">{t('adminTitleLabel')}</label>
              <input id="title" type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-white/80 mb-1">{t('adminContentLabel')}</label>
              <textarea id="content" value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent"></textarea>
            </div>
            <div>
              <label htmlFor="user_id" className="block text-sm font-medium text-white/80 mb-1">{t('adminTargetUserLabel')}</label>
              <input id="user_id" type="text" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} placeholder={t('adminTargetUserPlaceholder')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <button type="submit" className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors">
              {t('adminCreateButton')}
            </button>
          </form>
        </div>

        {/* List Announcements Section */}
        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('adminAllAnnouncements')}</h2>
          {loading && <p>{t('newsLoading')}</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && announcements.length === 0 && <p>{t('adminNoAnnouncements')}</p>}
          <div className="space-y-4 max-h-screen overflow-y-auto pr-2">
            {announcements.map(ann => (
              <div key={ann.id} className="p-4 bg-marine-blue-darkest/50 rounded-md flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-bold text-white mb-1">{ann.title}</h3>
                  <p className="text-white/80 text-sm whitespace-pre-wrap">{ann.content}</p>
                  <div className="text-xs text-white/50 mt-2">
                    <span>
                      {new Date(ann.created_at).toLocaleString()}
                    </span>
                    {ann.user_id ? (
                      <span className="ml-4 pl-4 border-l border-white/20">
                        Target: {ann.user_id}
                      </span>
                    ) : (
                      <span className="ml-4 pl-4 border-l border-white/20 font-semibold text-golden-yellow/80">
                        PUBLIC
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleOpenResendModal(ann)}
                      className="bg-blue-600 text-white font-bold py-1 px-3 rounded-full hover:bg-blue-700 transition-colors text-sm"
                    >
                      {t('adminResendButton')}
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="bg-red-600 text-white font-bold py-1 px-3 rounded-full hover:bg-red-700 transition-colors text-sm"
                    >
                      {t('adminDeleteButton')}
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {isResendModalOpen && (
        <ResendAnnouncementModal 
            announcement={selectedAnnouncement}
            onClose={() => setIsResendModalOpen(false)}
            onSuccess={handleResendSuccess}
        />
      )}
    </div>
  );
};

export default AdminPage;