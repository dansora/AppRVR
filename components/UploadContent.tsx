import React from 'react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface UploadContentProps {
  isLoggedIn: boolean;
  setActivePage: (page: Page) => void;
}

const UploadContent: React.FC<UploadContentProps> = ({ isLoggedIn, setActivePage }) => {
  const { t } = useLanguage();
  if (!isLoggedIn) {
    return (
      <div className="p-4 text-white text-center h-full flex flex-col justify-center items-center">
        <h2 className="text-2xl font-montserrat mb-4 text-golden-yellow">{t('uploadLoginPrompt')}</h2>
        <p className="mb-6 text-white/80">{t('uploadLoginMessage')}</p>
        <button
          onClick={() => setActivePage(Page.Login)}
          className="bg-golden-yellow text-marine-blue font-bold py-2 px-6 rounded-full hover:bg-yellow-400 transition-colors"
        >
          {t('uploadLoginButton')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 text-white font-roboto">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('uploadTitle')}</h1>
      <form className="space-y-6">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-white/80 mb-2">
            {t('uploadFileLabel')}
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-white/30 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-white/50" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-white/60">
                <label htmlFor="file-input" className="relative cursor-pointer bg-marine-blue-darker rounded-md font-medium text-golden-yellow hover:text-yellow-400 focus-within:outline-none px-1">
                  <span>{t('uploadFilePrompt')}</span>
                  <input id="file-input" name="file-input" type="file" className="sr-only" />
                </label>
                <p className="pl-1">{t('uploadFileDragDrop')}</p>
              </div>
              <p className="text-xs text-white/50">{t('uploadFileFormats')}</p>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-2">
            {t('uploadDescriptionLabel')}
          </label>
          <textarea
            id="description"
            rows={4}
            className="w-full bg-marine-blue-darker rounded-md p-2 text-white focus:ring-golden-yellow focus:border-golden-yellow border-transparent"
            placeholder={t('uploadDescriptionPlaceholder')}
          ></textarea>
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-golden-yellow text-marine-blue font-bold py-3 px-4 rounded-full hover:bg-yellow-400 transition-colors"
          >
            {t('uploadSubmitButton')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadContent;