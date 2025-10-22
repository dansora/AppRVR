import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CloseIcon, DonateIcon } from './Icons';

interface DonationModalProps {
  onClose: () => void;
}

const DONATION_URL = "https://radio-vocea-romanilor-1.sumupstore.com/category/donatii-1";

const DonationModal: React.FC<DonationModalProps> = ({ onClose }) => {
  const { t } = useLanguage();

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-marine-blue-darkest w-full max-w-lg rounded-lg shadow-xl relative text-white p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-4">
            <div className="bg-golden-yellow p-3 rounded-full mb-2">
                <DonateIcon className="w-8 h-8 text-marine-blue"/>
            </div>
            <h2 className="text-2xl font-montserrat text-golden-yellow">{t('donationModalTitle')}</h2>
        </div>

        <p className="text-white/80 whitespace-pre-line mb-6">
            {t('donationModalBody')}
        </p>

        <a
          href={DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 gap-2"
        >
          <DonateIcon className="w-5 h-5" />
          {t('homeDonateButton')}
        </a>
      </div>
    </div>
  );
};

export default DonationModal;
