import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings, FontSize } from '../contexts/SettingsContext';

const SettingsPage: React.FC = () => {
  const { t } = useLanguage();
  const { fontSize, setFontSize } = useSettings();

  const fontOptions: { key: FontSize; labelKey: string }[] = [
    { key: 'small', labelKey: 'settingsFontSizeSmall' },
    { key: 'medium', labelKey: 'settingsFontSizeMedium' },
    { key: 'large', labelKey: 'settingsFontSizeLarge' },
  ];

  return (
    <div className="p-4 text-white font-roboto">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('settingsTitle')}</h1>
      
      <div className="bg-marine-blue-darker p-6 rounded-lg">
        <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('settingsFontSize')}</h2>
        <div className="flex space-x-2 sm:space-x-4">
          {fontOptions.map(option => (
            <button
              key={option.key}
              onClick={() => setFontSize(option.key)}
              className={`flex-1 px-4 py-3 rounded-md font-bold transition-colors ${
                fontSize === option.key
                  ? 'bg-golden-yellow text-marine-blue'
                  : 'bg-marine-blue-darkest/50 text-white hover:brightness-110'
              }`}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;