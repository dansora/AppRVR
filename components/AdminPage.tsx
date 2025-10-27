import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import AdminDashboard from './admin/AdminDashboard';
import AnnouncementsManager from './admin/AnnouncementsManager';
import PollsManager from './admin/PollsManager';

const AdminPage: React.FC = () => {
  const { t } = useLanguage();
  const [view, setView] = useState<'dashboard' | 'announcements' | 'polls'>('dashboard');

  const getTitle = () => {
    switch (view) {
      case 'announcements':
        return t('adminAnnouncementsPageTitle');
      case 'polls':
        return t('adminPollsDashboardTitle');
      case 'dashboard':
      default:
        return t('adminPanelTitle');
    }
  };

  const renderView = () => {
    switch (view) {
      case 'announcements':
        return <AnnouncementsManager onBack={() => setView('dashboard')} />;
      case 'polls':
        return <PollsManager onBack={() => setView('dashboard')} />;
      case 'dashboard':
      default:
        return <AdminDashboard setView={setView} />;
    }
  };

  return (
    <div className="p-4 text-white font-roboto pb-20 max-w-6xl mx-auto">
      <h1 className="text-3xl font-montserrat text-golden-yellow mb-6">{getTitle()}</h1>
      {renderView()}
    </div>
  );
};

export default AdminPage;