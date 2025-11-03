import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useLanguage } from '../contexts/LanguageContext';
import { Page } from '../types';
import Avatar from './Avatar';
import Announcements from './Announcements';
import { useProfile } from '../contexts/ProfileContext';
import { CheckCircleIcon, InfoIcon } from './Icons';
import AdCarousel from './AdCarousel';
import ContestCarousel from './ContestCarousel';

interface ProfilePageProps {
  setActivePage: (page: Page) => void;
  openAuthModal: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setActivePage, openAuthModal }) => {
  const { t } = useLanguage();
  const { session, profile, loadingProfile, refetchProfile, profileError } = useProfile();
  
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Clear previous messages when component loads or user changes
    setMessage(null);
  }, [session]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
      setCity(profile.city);
      setCountry(profile.country);
      setPhoneNumber(profile.phone_number);
      setAvatarUrl(profile.avatar_url);
    } else if (session?.user?.email) {
        // Pre-fill username for users with a newly created (but still empty) profile
        setUsername(username => username || session.user!.email!.split('@')[0]);
    }
  }, [profile, session]);

  useEffect(() => {
    if (profileError) {
        setMessage({ type: 'error', text: `${t('profileUpdateError')}. (${profileError})` });
    } else if (!loadingProfile && !profile && session) {
        // This case indicates the trigger might have failed for this user.
        setMessage({ type: 'error', text: t('profileErrorTrigger') });
    }
  }, [profileError, loadingProfile, profile, session, t]);

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.user) return;

    setLoading(true);
    setMessage(null);
    const { user } = session;

    const updates = {
      id: user.id,
      username,
      first_name: firstName,
      last_name: lastName,
      city,
      country,
      phone_number: phoneNumber,
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);

    if (error) {
       if (error.code === '23505') { // unique_violation (e.g., username)
        setMessage({ type: 'error', text: t('profileUpdateErrorUnique') });
      } else {
        setMessage({ type: 'error', text: `${t('profileUpdateError')} (${error.message})` });
      }
      console.error('Supabase Profile Error:', error);
    } else {
      setMessage({ type: 'success', text: t('profileUpdateSuccess') });
      refetchProfile(); // Re-fetch profile data for the context
    }
    setLoading(false);
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!session?.user) {
        throw new Error('You must be logged in to upload an avatar.');
      }
      setUploading(true);
      setMessage(null);

      if (!event.target.files || event.target.files.length === 0) {
        // Don't throw error if user cancels file selection, just exit.
        setUploading(false);
        return;
      }

      const user = session.user;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath, updated_at: new Date() })
        .eq('id', user.id);

      if (updateError) {
          throw updateError;
      }

      setAvatarUrl(filePath);
      setMessage({ type: 'success', text: t('profileAvatarUpdateSuccess') });
      refetchProfile(); // Re-fetch profile data for the context

    } catch (error: any) {
      const errorMessage = error.message || (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setUploading(false);
    }
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
            const errorMessage = error.message || (typeof error === 'object' && error !== null ? JSON.stringify(error) : String(error));
            setMessage({ type: 'error', text: `${t('deleteAccountError')} (${errorMessage})` });
        } finally {
            setIsDeleting(false);
        }
    }
  };

  if (loadingProfile && !profileError) {
    return <div className="p-4 text-center text-white">{t('newsLoading')}</div>;
  }
  
  if (!session) {
    return (
        <div className="p-4 text-center text-white">
            <p>{t('authRequiredTitle')}</p>
        </div>
    );
  }

  return (
    <div className="p-4 text-white font-roboto pb-20 max-w-2xl mx-auto">
        <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('profileTitle')}</h1>

        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md space-y-8">
            <Avatar
              path={avatarUrl}
              onUpload={uploadAvatar}
              uploading={uploading}
            />
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-4 ${
                    message.type === 'success' 
                        ? 'bg-green-500/20 text-green-300 border-l-4 border-green-500' 
                        : 'bg-red-500/20 text-red-300 border-l-4 border-red-500'
                }`}>
                    {message.type === 'success' 
                        ? <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
                        : <InfoIcon className="w-6 h-6 flex-shrink-0" />
                    }
                    <span className="font-medium">{message.text}</span>
                </div>
            )}
            <form onSubmit={updateProfile} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">{t('profileEmailLabel')}</label>
                    <input id="email" type="text" value={session.user.email || ''} disabled className="w-full bg-marine-blue-darkest/50 rounded-md p-2 text-white/70 cursor-not-allowed border-transparent" />
                </div>
                
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-1">{t('profileUsernameLabel')}</label>
                    <input id="username" type="text" value={username || ''} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-1">{t('profileFirstNameLabel')}</label>
                        <input id="firstName" type="text" value={firstName || ''} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-white/80 mb-1">{t('profileLastNameLabel')}</label>
                        <input id="lastName" type="text" value={lastName || ''} onChange={(e) => setLastName(e.target.value)} className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-white/80 mb-1">{t('profileCityLabel')}</label>
                        <input id="city" type="text" value={city || ''} onChange={(e) => setCity(e.target.value)} className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-white/80 mb-1">{t('profileCountryLabel')}</label>
                        <input id="country" type="text" value={country || ''} onChange={(e) => setCountry(e.target.value)} className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                    </div>
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-white/80 mb-1">{t('profilePhoneLabel')}</label>
                    <input id="phoneNumber" type="tel" value={phoneNumber || ''} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
                </div>


                <div className="space-y-4 pt-2">
                    <button type="submit" disabled={loading || isDeleting || uploading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
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
                    disabled={isDeleting || uploading}
                    className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isDeleting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    {t('deleteAccountButton')}
                </button>
            </div>
        </div>

        <div className="my-8">
            <AdCarousel />
        </div>

        <div className="mt-8">
            <Announcements userId={session.user.id} />
        </div>
        
        <div className="mt-8">
            <ContestCarousel setActivePage={setActivePage} openAuthModal={openAuthModal} />
        </div>
    </div>
  );
};

export default ProfilePage;