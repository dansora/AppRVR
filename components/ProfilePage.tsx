import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import type { Session } from '@supabase/supabase-js';
import { Page } from '../types';

interface ProfilePageProps {
  setActivePage: (page: Page) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setActivePage }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      if (!session?.user) return;

      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from('profiles')
        .select(`username`)
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error && error.code === 'PGRST116') { // 'exact one row not found'
            console.error("Profile not found, trigger may have failed:", error);
            setMessage({ type: 'error', text: t('profileErrorTrigger') });
        } else if (error) {
          console.warn('Error fetching profile:', error);
          setMessage({ type: 'error', text: `${t('profileUpdateError')} (${error.message})` });
        } else if (data) {
          setUsername(data.username);
        }
      }

      setLoading(false);
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, [session, t]);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.user) return;

    setLoading(true);
    setMessage(null);
    const { user } = session;

    const updates = {
      id: user.id,
      username,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
      if (error.code === '42501') { 
        setMessage({ type: 'error', text: t('profileUpdateErrorRLS') });
      } else {
        setMessage({ type: 'error', text: `${t('profileUpdateError')} (${error.message})` });
      }
      console.error('Supabase Profile Error:', error);
    } else {
      setMessage({ type: 'success', text: t('profileUpdateSuccess') });
    }
    setLoading(false);
  }
  
  const handleLogout = async () => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
        setMessage({ type: 'error', text: `Logout failed: ${error.message}` });
        setLoading(false);
    } else {
        setActivePage(Page.Home);
    }
  };

  const handleDeleteAccount = async () => {
    setMessage(null);
    if (window.confirm(t('deleteAccountConfirmation'))) {
        setIsDeleting(true);
        try {
            const { error } = await supabase.functions.invoke('delete-user');
            if (error) throw error;
            await supabase.auth.signOut();
            window.location.reload();
        } catch (error: any) {
            console.error("Error deleting account:", error);
            setMessage({ type: 'error', text: `${t('deleteAccountError')} (${error.message})` });
        } finally {
            setIsDeleting(false);
        }
    }
  };

  if (!session) {
    return <div className="p-4 text-center text-white">{t('newsLoading')}</div>;
  }

  return (
    <div className="p-4 text-white font-roboto pb-20 max-w-2xl mx-auto">
        <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('profileTitle')}</h1>

        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md space-y-8">
            {message && (
                <div className={`p-3 rounded-md text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={updateProfile} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">{t('profileEmailLabel')}</label>
                    <input id="email" type="text" value={session.user.email || ''} disabled className="w-full bg-marine-blue-darkest/50 rounded-md p-2 text-white/70 cursor-not-allowed border-transparent" />
                </div>
                
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-1">{t('profileUsernameLabel')}</label>
                    <input id="username" type="text" value={username || ''} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                </div>

                <div className="space-y-4 pt-2">
                    <button type="submit" disabled={loading || isDeleting} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                        {loading ? t('newsLoading') : t('profileUpdateButton')}
                    </button>
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loading || isDeleting}
                        className="w-full bg-white/10 text-white font-bold py-3 rounded-full hover:bg-white/20 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                        {t('authLogout')}
                    </button>
                </div>
            </form>

            <div className="border-t border-white/10 pt-6">
                <h2 className="text-xl font-montserrat mb-4 text-red-400">{t('accountManagement')}</h2>
                <p className="text-white/80 mb-4">{t('deleteAccountWarning')}</p>
                <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isDeleting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {t('deleteAccountButton')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default ProfilePage;