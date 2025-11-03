import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon, UploadIcon, ChevronRightIcon, EditIcon } from '../Icons';
import ContestDetailsModal from './ContestDetailsModal';
import EditContestModal from './EditContestModal';

interface Contest {
  id: number;
  created_at: string;
  title: string;
  start_date: string;
  end_date: string;
  winner_id: string | null;
  description: string | null;
  prizes: string | null;
  image_url: string | null;
  is_active: boolean;
}

interface ContestsManagerProps {
    onBack: () => void;
}

const ContestsManager: React.FC<ContestsManagerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [editingContest, setEditingContest] = useState<Contest | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrizes, setNewPrizes] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  const fetchContests = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === '42P01') { // undefined_table
        setTableExists(false);
      } else {
        setMessage({ type: 'error', text: `${t('newsError')}: ${error.message}` });
      }
    } else {
      setTableExists(true);
      setContests(data || []);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setNewImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    } else {
        setNewImageFile(null);
        setImagePreview(null);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate || !newEndDate) return;
     if (new Date(newEndDate) <= new Date(newStartDate)) {
        setMessage({ type: 'error', text: t('pollEndDateAfterStart') });
        return;
    }
    setIsUploading(true);
    setMessage(null);

    try {
        let imageUrl: string | null = null;
        if (newImageFile) {
            const filePath = `public/${Date.now()}-${newImageFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from('contests-images')
                .upload(filePath, newImageFile);
            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('contests-images').getPublicUrl(filePath);
            imageUrl = data.publicUrl;
        }

        const { error: insertError } = await supabase.from('contests').insert({
            title: newTitle,
            description: newDescription || null,
            prizes: newPrizes || null,
            image_url: imageUrl,
            start_date: newStartDate,
            end_date: newEndDate,
        });
        if (insertError) throw insertError;
        
        setMessage({ type: 'success', text: t('contestCreatedSuccess') });
        setNewTitle(''); setNewDescription(''); setNewPrizes(''); setNewImageFile(null); setImagePreview(null); setNewStartDate(''); setNewEndDate('');
        fetchContests();
    } catch (err: any) {
        setMessage({ type: 'error', text: `${t('contestCreatedError')}: ${err.message}` });
    } finally {
        setIsUploading(false);
    }
  };
  
  const getContestStatus = (contest: Contest) => {
    const now = new Date();
    const start = new Date(contest.start_date);
    const end = new Date(contest.end_date);

    if (!contest.is_active) {
        return { text: t('contestStatusInactive'), color: 'bg-gray-500' };
    }
    if (contest.winner_id) {
        return { text: t('contestStatusWinnerSelected'), color: 'bg-purple-600' };
    }
    if (end < now) {
        return { text: t('contestStatusExpired'), color: 'bg-red-600' };
    }
    if (start > now) {
        return { text: t('contestStatusScheduled'), color: 'bg-blue-600' };
    }
    return { text: t('contestStatusActive'), color: 'bg-green-600' };
  };

  if (tableExists === false) {
      return (
          <div>
              <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline mb-4">
                  <BackIcon className="w-5 h-5" />
                  {t('backToDashboard')}
              </button>
              <div className="bg-red-500/20 text-red-300 p-4 rounded-lg">
                  <p className="font-bold">Database Error: 'contests' table not found.</p>
                  <p>Please run the SQL script provided in the documentation to set up the contests feature.</p>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline mb-4">
            <BackIcon className="w-5 h-5" />
            {t('backToDashboard')}
        </button>

        {message && (
             <div className={`p-3 rounded-md text-center mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
             </div>
        )}

        {/* Create Contest Section */}
        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('createContest')}</h2>
          <form onSubmit={handleCreateContest} className="space-y-4">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required placeholder={t('contestNameLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2" />
            <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} placeholder={t('contestDescLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2"></textarea>
            <textarea value={newPrizes} onChange={(e) => setNewPrizes(e.target.value)} rows={2} placeholder={t('contestPrizesLabel')} className="w-full bg-marine-blue-darkest/80 rounded-md p-2"></textarea>
            
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollStartDate')}</label>
                    <input type="datetime-local" value={newStartDate} onChange={e => setNewStartDate(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">{t('pollEndDate')}</label>
                    <input type="datetime-local" value={newEndDate} onChange={e => setNewEndDate(e.target.value)} required className="w-full bg-marine-blue-darkest/80 rounded-md p-2"/>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-white/80 mb-1">{t('contestImageLabel')}</label>
                <div className="relative">
                    <input type="file" id="image-upload" accept="image/*" className="absolute w-0 h-0 opacity-0" onChange={handleImageChange} />
                    <label htmlFor="image-upload" className="cursor-pointer w-full flex justify-between items-center bg-marine-blue-darkest/80 rounded-md p-2 text-white/70 hover:bg-marine-blue-darkest">
                        <span>{newImageFile?.name || t('uploadFormFilePlaceholder')}</span>
                        <UploadIcon className="w-5 h-5" />
                    </label>
                </div>
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />}
            </div>

            <button type="submit" disabled={isUploading} className="w-full bg-golden-yellow text-marine-blue font-bold py-3 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50 flex justify-center items-center">
             {isUploading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              {t('createContest')}
            </button>
          </form>
        </div>

        {/* List Contests Section */}
        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('allContests')}</h2>
          {loading ? <p>{t('newsLoading')}</p> : contests.length === 0 ? <p>{t('noContests')}</p> : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {contests.map(contest => {
                const status = getContestStatus(contest);
                return (
                    <div key={contest.id} className="bg-marine-blue-darkest/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <p className="font-bold text-white">{contest.title}</p>
                            <div className="text-xs text-white/70 mt-1">
                                <p>Start: {new Date(contest.start_date).toLocaleString()}</p>
                                <p>End: {new Date(contest.end_date).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto flex flex-row items-center justify-end gap-2">
                            <span className={`font-bold py-1 px-3 rounded-full text-white text-xs w-32 text-center ${status.color}`}>
                                {status.text}
                            </span>
                            <button onClick={() => setEditingContest(contest)} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-full text-sm text-center flex items-center justify-center gap-1">
                                <EditIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => setSelectedContest(contest)} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-full text-sm text-center flex items-center justify-center gap-1">
                                {t('manageContest')} <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                );
              })}
            </div>
          )}
        </div>
        {selectedContest && <ContestDetailsModal contest={selectedContest} onClose={() => setSelectedContest(null)} onUpdate={fetchContests} />}
        {editingContest && <EditContestModal contest={editingContest} onClose={() => setEditingContest(null)} onSuccess={fetchContests} />}
    </div>
  );
};

export default ContestsManager;