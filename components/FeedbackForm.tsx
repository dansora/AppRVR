import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSettings, FontSize } from '../contexts/SettingsContext';
import ContactModal from './ContactModal';
import { MailIcon, DonateIcon, FacebookIcon, WhatsAppIcon, YouTubeIcon, LinkedInIcon, ChevronRightIcon } from './Icons';
import TermsModal from './TermsModal';
import DonationModal from './DonationModal';
import { supabase } from '../services/supabaseClient';
import Announcements from './Announcements';

interface SettingsPageProps {
    onReviewTerms: () => void;
    isLoggedIn: boolean;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onReviewTerms, isLoggedIn }) => {
  const { t } = useLanguage();
  const { fontSize, setFontSize } = useSettings();
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isDonationModalOpen, setDonationModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fontOptions: { key: FontSize; labelKey: string }[] = [
    { key: 'small', labelKey: 'settingsFontSizeSmall' },
    { key: 'medium', labelKey: 'settingsFontSizeMedium' },
    { key: 'large', labelKey: 'settingsFontSizeLarge' },
  ];
  
  const socialLinks = [
    { href: "https://www.facebook.com/groups/1331920294319593", icon: FacebookIcon },
    { href: "https://chat.whatsapp.com/DZzIOARyfbwIq3LUPAiP1G?mode=wwc", icon: WhatsAppIcon },
    { href: "https://www.youtube.com/@radiovocearomanilor8992", icon: YouTubeIcon },
    { href: "https://www.linkedin.com/", icon: LinkedInIcon },
  ];
  
  const handleReviewTerms = () => {
    const consent = localStorage.getItem('rvr-terms-consent');
    if (consent === 'declined') {
        onReviewTerms();
    } else {
        setIsTermsModalOpen(true);
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError(null);
    if (window.confirm(t('deleteAccountConfirmation'))) {
        setIsDeleting(true);
        try {
            // Call the secure Supabase Edge Function to delete the user.
            const { error } = await supabase.functions.invoke('delete-user');

            if (error) {
                throw error;
            }

            // If the function succeeds, the user is deleted on the backend.
            // Now, sign out the user from the current session on the client-side.
            await supabase.auth.signOut();
            
            // Reload the app to reflect the signed-out state.
            window.location.reload();

        } catch (error: any) {
            console.error("Error deleting account:", error);
            setDeleteError(t('deleteAccountError'));
        } finally {
            setIsDeleting(false);
        }
    }
  };

  return (
    <>
      <div className="p-4 text-white font-roboto pb-20">
        <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{t('settingsTitle')}</h1>
        
        {!isLoggedIn && (
            <div className="mb-6">
                <Announcements />
            </div>
        )}

        <div className="space-y-6">
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

            <div className="bg-marine-blue-darker p-6 rounded-lg">
                <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('settingsContactSupport')}</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={() => setContactModalOpen(true)}
                        className="w-full sm:w-auto flex-1 bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                        <MailIcon className="w-5 h-5" />
                        {t('homeContact')}
                    </button>
                    <button 
                        onClick={() => setDonationModalOpen(true)}
                        className="w-full sm:w-auto flex-1 bg-golden-yellow text-marine-blue font-bold py-3 px-8 rounded-full hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center gap-2"
                    >
                        <DonateIcon className="w-5 h-5" />
                        {t('homeDonateButton')}
                    </button>
                </div>
            </div>

            <div className="bg-marine-blue-darker p-6 rounded-lg">
                <h2 className="text-xl font-montserrat text-golden-yellow text-center mb-4">{t('homeFollowUs')}</h2>
                <div className="flex justify-center items-center space-x-6">
                    {socialLinks.map(({ href, icon: Icon }) => (
                        <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white hover:scale-110 transition-transform">
                            <Icon className="w-8 h-8"/>
                        </a>
                    ))}
                </div>
            </div>

            <div className="bg-marine-blue-darker p-6 rounded-lg">
                <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('settingsLegal')}</h2>
                <div className="space-y-3">
                    <button onClick={handleReviewTerms} className="w-full flex justify-between items-center p-3 bg-marine-blue-darkest/50 rounded-md hover:bg-marine-blue-darkest transition-colors">
                        <span className="text-white font-medium">{t('settingsTerms')}</span>
                        <ChevronRightIcon className="w-6 h-6 text-white/50" />
                    </button>
                    <a href="https://radiovocearomanilor.com/wp/radio-vocea-romanilor-politica-confidentialitate/?preview_id=5002&preview_nonce=a26aa8effc&preview=true" target="_blank" rel="noopener noreferrer" className="w-full flex justify-between items-center p-3 bg-marine-blue-darkest/50 rounded-md hover:bg-marine-blue-darkest transition-colors">
                        <span className="text-white font-medium">{t('settingsPrivacy')}</span>
                        <ChevronRightIcon className="w-6 h-6 text-white/50" />
                    </a>
                </div>
            </div>

            {isLoggedIn && (
                <div className="bg-marine-blue-darker p-6 rounded-lg">
                    <h2 className="text-xl font-montserrat mb-4 text-red-400">{t('accountManagement')}</h2>
                    <p className="text-white/80 mb-4">{t('deleteAccountWarning')}</p>
                    {deleteError && <p className="text-red-400 mb-4">{deleteError}</p>}
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-full hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isDeleting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        {t('deleteAccountButton')}
                    </button>
                </div>
            )}

        </div>
      </div>
      {isContactModalOpen && <ContactModal onClose={() => setContactModalOpen(false)} />}
      {isTermsModalOpen && <TermsModal mode="view" onClose={() => setIsTermsModalOpen(false)} />}
      {isDonationModalOpen && <DonationModal onClose={() => setDonationModalOpen(false)} />}
    </>
  );
};

export default SettingsPage;