import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NewsIcon, PollIcon, ChevronRightIcon, DatabaseIcon, AdvertisingIcon } from '../Icons';

interface AdminDashboardProps {
  setView: (view: 'dashboard' | 'announcements' | 'polls' | 'submissions' | 'advertising') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ setView }) => {
  const { t } = useLanguage();

  const menuItems = [
    {
      key: 'announcements',
      title: t('adminAnnouncementsTitle'),
      description: t('adminAnnouncementsDesc'),
      icon: NewsIcon,
      action: () => setView('announcements'),
      enabled: true,
    },
    {
      key: 'polls',
      title: t('adminPollsTitle'),
      description: t('adminPollsDesc'),
      icon: PollIcon,
      action: () => setView('polls'),
      enabled: true,
    },
    {
      key: 'submissions',
      title: t('adminSubmissionsTitle'),
      description: t('adminSubmissionsDesc'),
      icon: DatabaseIcon,
      action: () => setView('submissions'),
      enabled: true,
    },
    {
      key: 'advertising',
      title: t('adminAdvertisingTitle'),
      description: t('adminAdvertisingDesc'),
      icon: AdvertisingIcon,
      action: () => setView('advertising'),
      enabled: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {menuItems.map(item => (
        <button
          key={item.key}
          onClick={item.action}
          disabled={!item.enabled}
          className={`bg-marine-blue-darker p-6 rounded-lg text-left hover:bg-marine-blue-darkest transition-all duration-300 transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex flex-col`}
        >
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <item.icon className="w-8 h-8 text-golden-yellow mr-4" />
              <h2 className="text-2xl font-montserrat text-white">{item.title}</h2>
            </div>
            <p className="text-white/70">{item.description}</p>
          </div>
          <div className="mt-4 flex justify-end">
            <ChevronRightIcon className="w-8 h-8 text-white/50" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default AdminDashboard;