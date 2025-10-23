import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './Icons';

interface InfoModalProps {
  onClose: () => void;
  title: string;
  url: string;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose, title, url }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-marine-blue-darkest w-full max-w-4xl rounded-lg shadow-xl text-white flex flex-col h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/20 flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-montserrat text-golden-yellow truncate pr-4">{title}</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white">
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>
        
        <div className="overflow-y-auto flex-1 relative bg-white">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <svg className="animate-spin h-10 w-10 text-marine-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          <iframe
            src={url}
            className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
            onLoad={() => setIsLoading(false)}
            title={title}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;
