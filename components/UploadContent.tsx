import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UploadIcon, UserIcon, WhatsAppIcon, CheckCircleIcon, EditIcon } from './Icons';
import { useProfile } from '../contexts/ProfileContext';
import { supabase } from '../services/supabaseClient';
import { Page } from '../types';
import Contests from './Contests';

interface UploadContentProps {
    isLoggedIn: boolean;
    openAuthModal: () => void;
    setActivePage: (page: Page) => void;
}

const UploadContent: React.FC<UploadContentProps> = ({ isLoggedIn, openAuthModal, setActivePage }) => {
  const { t } = useLanguage();
  const { session, profile, loadingProfile } = useProfile();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !profile) {
        openAuthModal();
        return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const message = formData.get('message') as string;

    const name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username || 'N/A';
    const email = session.user.email || 'N/A';
    const phone = profile.phone_number || '';

    let fileUrl: string | null = null;

    try {
      if (file) {
        let bucket = '';
        if (file.type.startsWith('image/')) {
          bucket = 'app-images';
        } else if (file.type.startsWith('video/')) {
          bucket = 'app-videos';
        } else {
          throw new Error(t('uploadErrorFileType'));
        }

        const filePath = `${session.user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        fileUrl = data.publicUrl;
      }
      
      const { error: insertError } = await supabase.from('user_submissions').insert({
        name,
        email,
        phone,
        message,
        file_url: fileUrl,
        user_id: session.user.id,
      });

      if (insertError) {
        throw insertError;
      }
      
      setSubmitStatus('success');
      setSubmitMessage(t('uploadSuccess'));
      setFile(null);
      (e.target as HTMLFormElement).reset();

    } catch (err: any) {
      console.error('Submission error:', err);
      let errorMessage = err.message || (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err));
      if (typeof errorMessage === 'string' && errorMessage.includes("user_submissions")) {
        errorMessage = t('uploadErrorFeatureUnavailable');
      }
      setSubmitStatus('error');
      setSubmitMessage(errorMessage || t('uploadError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoggedIn) {
    return (
        <div className="p-4 text-white font-roboto pb-20 text-center flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <UserIcon className="w-16 h-16 text-golden-yellow/50 mb-4" />
            <h1 className="text-2xl font-montserrat text-golden-yellow mb-4">{t('authRequiredTitle')}</h1>
            <p className="text-white/80 mb-6 max-w-md">{t('authRequiredSocial')}</p>
            <button
                onClick={openAuthModal}
                className="bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors"
            >
                {t('navLogin')}
            </button>
        </div>
    );
  }

  if (loadingProfile) {
    return (
        <div className="p-4 text-white font-roboto pb-20 text-center flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <p>{t('newsLoading')}</p>
        </div>
    );
  }

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-montserrat text-golden-yellow">{t('socialTitle')}</h1>
      </div>

      <div className="space-y-8 max-w-xl mx-auto">
        <Contests />

        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat text-white mb-2 text-center">{t('contributeTitle')}</h2>
          <p className="mt-2 text-white/80 max-w-2xl mx-auto text-center text-sm mb-4">{t('uploadDesc')}</p>

          {submitStatus === 'success' ? (
              <div className="text-center p-4 bg-green-500/20 text-green-300 rounded-lg border-l-4 border-green-500 flex flex-col items-center gap-4">
                  <CheckCircleIcon className="w-12 h-12 text-green-400" />
                  <p className="font-semibold text-lg">{submitMessage}</p>
                  <button
                      onClick={() => { setSubmitStatus(null); setSubmitMessage(null); }}
                      className="mt-2 bg-golden-yellow/80 text-marine-blue-darkest font-bold py-2 px-6 rounded-full hover:bg-golden-yellow"
                  >
                      {t('uploadAnother')}
                  </button>
              </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitStatus === 'error' && (
                  <div className="text-center p-3 bg-red-500/20 text-red-300 rounded-md">
                      {submitMessage}
                  </div>
              )}

              <button
                  type="button"
                  onClick={() => setActivePage(Page.Profile)}
                  className="w-full p-4 bg-marine-blue-darkest/50 rounded-md border-l-4 border-golden-yellow text-left hover:bg-marine-blue-darkest transition-colors flex justify-between items-center"
              >
                  <div>
                      <p className="text-sm font-medium text-white/80 mb-1">{t('uploadSubmittingAs')}:</p>
                      <p className="font-bold text-white text-lg">{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.username}</p>
                      <p className="text-xs text-white/70">{session?.user?.email}</p>
                      {profile?.phone_number && <p className="text-xs text-white/70 mt-1">{profile.phone_number}</p>}
                  </div>
                  <EditIcon className="w-6 h-6 text-white/70 flex-shrink-0 ml-4" />
              </button>


              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('uploadFormMessage')}</label>
                <textarea name="message" rows={5} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent"></textarea>
              </div>
              <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">{t('uploadFormFile')}</label>
                  <div className="relative">
                      <input type="file" id="file-upload" accept="image/*,video/*" className="absolute w-0 h-0 opacity-0" onChange={handleFileChange} />
                      <label htmlFor="file-upload" className="cursor-pointer w-full flex justify-between items-center bg-marine-blue-darkest/80 rounded-md p-2 text-white/70 hover:bg-marine-blue-darkest">
                          <span>{file?.name || t('uploadFormFilePlaceholder')}</span>
                          <UploadIcon className="w-5 h-5" />
                      </label>
                  </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || loadingProfile}
                  className="w-full mt-2 bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {t('uploadSubmit')}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://chat.whatsapp.com/DZzIOARyfbwIq3LUPAiP1G?mode=wwc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition-colors duration-300"
          >
            <WhatsAppIcon className="w-6 h-6" />
            {t('uploadWhatsappChat')}
          </a>
        </div>
      </div>

    </div>
  );
};

export default UploadContent;