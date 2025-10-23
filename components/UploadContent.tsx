import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { UploadIcon, UserIcon, WhatsAppIcon } from './Icons';

interface UploadContentProps {
    isLoggedIn: boolean;
    openAuthModal: () => void;
}

const UploadContent: React.FC<UploadContentProps> = ({ isLoggedIn, openAuthModal }) => {
  const { t } = useLanguage();
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Mock submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate success/error
    if (Math.random() > 0.2) {
      setSubmitStatus('success');
    } else {
      setSubmitStatus('error');
    }

    setIsSubmitting(false);
  };
  
  if (!isLoggedIn) {
    return (
        <div className="p-4 text-white font-roboto pb-20 text-center flex flex-col items-center justify-center h-[calc(100vh-200px)]">
            <UserIcon className="w-16 h-16 text-golden-yellow/50 mb-4" />
            <h1 className="text-2xl font-montserrat text-golden-yellow mb-4">{t('authRequiredTitle')}</h1>
            <p className="text-white/80 mb-6 max-w-md">{t('authRequiredUpload')}</p>
            <button
                onClick={openAuthModal}
                className="bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors"
            >
                {t('navLogin')}
            </button>
        </div>
    );
  }

  return (
    <div className="p-4 text-white font-roboto pb-20">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-montserrat text-golden-yellow">{t('uploadTitle')}</h1>
        <p className="mt-2 text-white/80 max-w-2xl mx-auto">{t('uploadDesc')}</p>
      </div>

      <div className="max-w-xl mx-auto bg-marine-blue-darker p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-montserrat text-white mb-4 text-center">{t('uploadFormTitle')}</h2>
        {submitStatus === 'success' ? (
          <div className="text-center p-4 bg-green-500/20 text-green-300 rounded-md">
            {t('uploadSuccess')}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
             {submitStatus === 'error' && (
                <div className="text-center p-3 bg-red-500/20 text-red-300 rounded-md">
                    {t('uploadError')}
                </div>
             )}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">{t('uploadFormName')}</label>
              <input type="text" name="name" required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">{t('uploadFormEmail')}</label>
              <input type="email" name="email" required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">{t('uploadFormPhone')}</label>
              <input type="tel" name="phone" className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">{t('uploadFormMessage')}</label>
              <textarea name="message" rows={5} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent"></textarea>
            </div>
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('uploadFormFile')}</label>
                <div className="relative">
                    <input type="file" id="file-upload" className="absolute w-0 h-0 opacity-0" onChange={handleFileChange} />
                    <label htmlFor="file-upload" className="cursor-pointer w-full flex justify-between items-center bg-marine-blue-darkest/80 rounded-md p-2 text-white/70 hover:bg-marine-blue-darkest">
                        <span>{fileName || t('uploadFormFilePlaceholder')}</span>
                        <UploadIcon className="w-5 h-5" />
                    </label>
                </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
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
  );
};

export default UploadContent;