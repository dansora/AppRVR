import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon, StoreIcon } from './Icons';
import { useModal } from '../contexts/ModalContext';

interface StoreRedirectModalProps {
  onClose: () => void;
}

const STORE_URL = "https://radio-vocea-romanilor-1.sumupstore.com/";

const StoreRedirectModal: React.FC<StoreRedirectModalProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const { registerModal, unregisterModal } = useModal();

  useEffect(() => {
    registerModal();
    return () => unregisterModal();
  }, [registerModal, unregisterModal]);

  const handleAccept = () => {
    window.open(STORE_URL, '_blank');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-marine-blue-darkest w-full max-w-2xl rounded-lg shadow-xl text-white flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-center p-4 border-b border-white/20 flex-shrink-0 relative">
          <h2 className="text-2xl font-montserrat text-golden-yellow text-center">{t('storeModalTitle')}</h2>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto text-center">
            <div className="flex flex-col items-center mb-4">
                <div className="bg-golden-yellow p-3 rounded-full mb-2">
                    <StoreIcon className="w-8 h-8 text-marine-blue"/>
                </div>
            </div>

            <p className="text-white/80 mb-6">
                {t('storeModalBody')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={onClose}
                    className="flex-1 bg-white/10 text-white font-bold py-3 rounded-full hover:bg-white/20 transition-colors"
                >
                    {t('storeModalCancel')}
                </button>
                <button
                    onClick={handleAccept}
                    className="flex-1 w-full inline-flex items-center justify-center bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 gap-2"
                >
                    <StoreIcon className="w-5 h-5" />
                    {t('storeModalAccept')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoreRedirectModal;