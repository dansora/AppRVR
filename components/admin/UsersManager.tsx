import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon, UserIcon, EditIcon, CheckCircleIcon } from '../Icons';

interface UserProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email?: string | null; // Optional as it might not exist on the profile table yet
  role: 'user' | 'admin' | 'correspondent' | 'special-user' | null;
  created_at?: string;
}

interface UsersManagerProps {
    onBack: () => void;
}

const UsersManager: React.FC<UsersManagerProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{message: string, sql?: string} | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setEmailWarning(null);

    // First try to fetch with email
    let { data, error } = await supabase
      .from('profiles')
      .select('id, username, first_name, last_name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
        // Check for missing email column
        if (error.code === '42703') { // undefined_column
            const sql = `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Function to sync email on new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing emails (requires permission or manual run)
UPDATE public.profiles
SET email = au.email
FROM auth.users au
WHERE public.profiles.id = au.id AND public.profiles.email IS NULL;`;
            
            setEmailWarning(sql);
            
            // Retry without email column
            const { data: retryData, error: retryError } = await supabase
                .from('profiles')
                .select('id, username, first_name, last_name, role, created_at')
                .order('created_at', { ascending: false });
            
            if (retryError) {
                setError({ message: `${t('dbErrorUsers')}: ${retryError.message}` });
            } else {
                setUsers(retryData as UserProfile[] || []);
            }
        } else if (error.code === '42501') { // permission denied (RLS)
             const sql = `CREATE POLICY "Allow admins to view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text);`;
             setError({ message: t('dbErrorUsers'), sql });
        } else {
            setError({ message: error.message });
        }
    } else {
        setUsers(data as UserProfile[] || []);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
      setMessage(null);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
          setMessage({ type: 'error', text: `${t('userRoleUpdatedError')}: ${error.message}` });
      } else {
          setMessage({ type: 'success', text: t('userRoleUpdatedSuccess') });
          setEditingUser(null);
          // Optimistic update
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      }
  };

  const getRoleLabel = (role: string | null) => {
      switch(role) {
          case 'admin': return t('roleAdmin');
          case 'correspondent': return t('roleCorrespondent');
          case 'special-user': return t('roleSpecialUser');
          default: return t('roleUser');
      }
  };

  const getRoleColor = (role: string | null) => {
    switch(role) {
        case 'admin': return 'bg-red-600';
        case 'correspondent': return 'bg-purple-600';
        case 'special-user': return 'bg-golden-yellow text-marine-blue-darkest';
        default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline mb-4">
            <BackIcon className="w-5 h-5" />
            {t('backToDashboard')}
        </button>

        {message && (
             <div className={`p-3 rounded-md text-center mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.text}
             </div>
        )}

        {/* Error handling with SQL instructions */}
        {error && (
            <div className="bg-red-500/20 text-red-300 p-4 rounded-lg space-y-2">
                <p className="font-bold">{error.message}</p>
                {error.sql && (
                    <>
                        <p className="text-sm">{t('dbErrorUsersInstruction')}</p>
                        <pre className="bg-marine-blue-darkest p-2 rounded-md text-xs text-white/90 overflow-x-auto">
                            <code>{error.sql}</code>
                        </pre>
                    </>
                )}
            </div>
        )}

        {/* Warning for missing email column */}
        {!error && emailWarning && (
            <div className="bg-blue-900/50 border border-blue-600 p-4 rounded-lg text-sm">
                <p className="font-bold text-blue-300 mb-2">{t('dbEmailMissing')}</p>
                <p className="text-blue-300/90 mb-2">{t('dbEmailInstruction')}</p>
                <pre className="bg-marine-blue-darkest p-2 rounded-md text-xs text-white/90 overflow-x-auto">
                    <code>{emailWarning}</code>
                </pre>
            </div>
        )}

        <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('adminUsersPageTitle')}</h2>
            {loading ? <p>{t('newsLoading')}</p> : users.length === 0 && !error ? <p>No users found.</p> : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {users.map(user => (
                        <div key={user.id} className="bg-marine-blue-darkest/50 p-4 rounded-lg border border-white/10 relative">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-8 h-8 text-white/70" />
                                    <div>
                                        <p className="font-bold text-white truncate max-w-[150px]" title={user.username || 'N/A'}>{user.username || 'N/A'}</p>
                                        <p className="text-xs text-white/50">
                                            {user.first_name} {user.last_name}
                                        </p>
                                    </div>
                                </div>
                                {editingUser !== user.id && (
                                    <button onClick={() => setEditingUser(user.id)} className="p-2 text-white/70 hover:text-white">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            
                            <div className="text-sm text-white/80 mb-3 space-y-1">
                                {user.email && <p className="truncate" title={user.email}>{user.email}</p>}
                                <p className="text-xs text-white/50">{t('joinedOn')} {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                            </div>

                            {editingUser === user.id ? (
                                <div className="mt-2 space-y-2 bg-marine-blue-darker p-2 rounded-md">
                                    <label className="text-xs text-white/70 uppercase">{t('updateRole')}</label>
                                    <select 
                                        defaultValue={user.role || 'user'} 
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        className="w-full bg-marine-blue-darkest text-white p-2 rounded-md text-sm"
                                    >
                                        <option value="user">{t('roleUser')}</option>
                                        <option value="correspondent">{t('roleCorrespondent')}</option>
                                        <option value="special-user">{t('roleSpecialUser')}</option>
                                        <option value="admin">{t('roleAdmin')}</option>
                                    </select>
                                    <button onClick={() => setEditingUser(null)} className="w-full text-xs text-white/50 hover:text-white mt-1 underline">Cancel</button>
                                </div>
                            ) : (
                                <div className="mt-2">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getRoleColor(user.role)}`}>
                                        {getRoleLabel(user.role)}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default UsersManager;