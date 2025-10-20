import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Onboarding: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-marine-blue text-white font-montserrat animate-fade-out">
      <div className="text-6xl font-bold text-golden-yellow animate-pulse">RVR</div>
      <p className="mt-4 text-xl tracking-wider">{t('onboardingSlogan')}</p>
    </div>
  );
};

export default Onboarding;
