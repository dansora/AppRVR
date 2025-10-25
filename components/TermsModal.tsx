import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon } from './Icons';

interface TermsModalProps {
    mode: 'consent' | 'view';
    onClose?: () => void;
    onAccept?: () => void;
    onDecline?: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ mode, onClose, onAccept, onDecline }) => {
  const { t } = useLanguage();

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={mode === 'view' ? onClose : undefined}
    >
      <div 
        className="bg-marine-blue-darkest w-full max-w-lg rounded-lg shadow-xl text-white flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-2xl font-montserrat text-golden-yellow">{t('termsTitle')}</h2>
            {mode === 'view' && (
                <button onClick={onClose} className="text-white/70 hover:text-white">
                    <CloseIcon className="w-6 h-6" />
                </button>
            )}
        </header>
        
        <div className="p-6 overflow-y-auto flex-1">
            <p className="text-white/80 whitespace-pre-line">
                {t('termsContentPlaceholder')}
            </p>
        </div>

        <footer className="p-4 border-t border-white/20">
            {mode === 'consent' ? (
                <div className="flex gap-4">
                    <button
                        onClick={onDecline}
                        className="flex-1 bg-white/10 text-white font-bold py-3 rounded-full hover:bg-white/20 transition-colors"
                    >
                        {t('termsDecline')}
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex-1 bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors"
                    >
                        {t('termsAccept')}
                    </button>
                </div>
            ) : (
                <button
                    onClick={onClose}
                    className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors"
                >
                    {t('modalClose')}
                </button>
            )}
        </footer>
      </div>
    </div>
  );
};

export default TermsModal;