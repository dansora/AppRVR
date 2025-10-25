import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './Icons';

interface PrivacyPolicyModalProps {
    onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-marine-blue-darkest w-full max-w-lg rounded-lg shadow-xl text-white flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-2xl font-montserrat text-golden-yellow">{t('privacyTitle')}</h2>
            <button onClick={onClose} className="text-white/70 hover:text-white">
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>
        
        <div className="p-6 overflow-y-auto flex-1">
            <p className="text-white/80 whitespace-pre-line">
                {t('privacyContentPlaceholder')}
            </p>
        </div>

        <footer className="p-4 border-t border-white/20">
            <button
                onClick={onClose}
                className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors"
            >
                {t('modalClose')}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;