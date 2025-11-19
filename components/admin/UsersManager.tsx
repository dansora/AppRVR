
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon, UserIcon, EditIcon, CheckCircleIcon } from '../Icons';

interface UserProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email?: string | null; 
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
  const [fetchError, setFetchError] = useState<{message: string, sql?: string, title?: string} | null>(null);
  const [updateError, setUpdateError] = useState<{message: string, sql?: string, title?: string} | null>(null);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
        let { data, error } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name, email, role, created_at')
        .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        setUsers(data as UserProfile[] || []);
    } catch (err: any) {
        console.error("Fetch Users Error:", err);

        if (err.code === '42703') {
            const fixSql = `-- Add missing columns and backfill data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles
SET 
  created_at = auth.users.created_at,
  email = auth.users.email
FROM auth.users
WHERE public.profiles.id = auth.users.id;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, created_at, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.email, 
    new.created_at,
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`;

            setFetchError({ 
                title: "Database Update Required",
                message: "Missing columns in 'profiles' table.",
                sql: fixSql 
            });
        } 
        else if (err.code === '42501') {
             const sql = `CREATE POLICY "Allow admins to view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text);`;
             setFetchError({ 
                 title: "Permission Denied (Select)", 
                 message: "Admins cannot view the user list.",
                 sql: sql 
            });
        } 
        else {
            setFetchError({ message: err.message || "An unexpected error occurred." });
        }
    } finally {
        setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
      setMessage(null);
      setUpdateError(null);
      
      try {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;

        setMessage({ type: 'success', text: t('userRoleUpdatedSuccess') });
        setEditingUser(null);
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));

      } catch (err: any) {
          console.error("Update Role Error:", err);
          if (err.code === '42501' || err.message.includes('violates row-level security')) {
             const sql = `CREATE POLICY "Allow admins to update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text)
WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text);`;
            
            setUpdateError({
                title: "Permission Denied (Update)",
                message: "You don't have permission to update user roles. Please run this SQL:",
                sql: sql
            });
            setMessage({ type: 'error', text: t('userRoleUpdatedError') });
          } else {
            setMessage({ type: 'error', text: `${t('userRoleUpdatedError')}: ${err.message}` });
          }
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
             <div className={`p-3 rounded-md text-center mb-4 flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {message.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                {message.text}
             </div>
        )}

        {/* Fetch Error Handling */}
        {fetchError && (
            <div className="bg-marine-blue-darker border-l-4 border-golden-yellow p-6 rounded-lg space-y-4 shadow-lg mb-6">
                <h3 className="text-xl font-bold text-golden-yellow">{fetchError.title || "Error"}</h3>
                <p className="text-white/90">{fetchError.message}</p>
                {fetchError.sql && (
                    <div className="relative">
                        <pre className="bg-marine-blue-darkest p-4 rounded-md text-xs text-green-300 overflow-x-auto font-mono border border-white/10">
                            <code>{fetchError.sql}</code>
                        </pre>
                        <p className="text-xs text-white/50 mt-2">Run this in Supabase SQL Editor.</p>
                    </div>
                )}
            </div>
        )}

        {/* Update Error Handling */}
        {updateError && (
            <div className="bg-red-900/50 border-l-4 border-red-500 p-6 rounded-lg space-y-4 shadow-lg mb-6">
                <h3 className="text-xl font-bold text-red-300">{updateError.title || "Update Error"}</h3>
                <p className="text-white/90">{updateError.message}</p>
                {updateError.sql && (
                    <div className="relative">
                        <pre className="bg-black/30 p-4 rounded-md text-xs text-green-300 overflow-x-auto font-mono border border-white/10">
                            <code>{updateError.sql}</code>
                        </pre>
                        <p className="text-xs text-white/50 mt-2">Run this in Supabase SQL Editor.</p>
                    </div>
                )}
            </div>
        )}

        {!fetchError && (
            <div className="bg-marine-blue-darker p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-montserrat mb-4 text-golden-yellow">{t('adminUsersPageTitle')}</h2>
                {loading ? <p>{t('newsLoading')}</p> : users.length === 0 ? <p>No users found.</p> : (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {users.map(user => (
                            <div key={user.id} className="bg-marine-blue-darkest/50 p-4 rounded-lg border border-white/10 relative flex flex-col h-full">
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
                                
                                <div className="text-sm text-white/80 mb-3 space-y-1 flex-grow">
                                    {user.email && <p className="truncate" title={user.email}>{user.email}</p>}
                                    <p className="text-xs text-white/50">{t('joinedOn')} {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                                </div>

                                {editingUser === user.id ? (
                                    <div className="mt-auto space-y-2 bg-marine-blue-darker p-2 rounded-md animate-fade-in">
                                        <label className="text-xs text-white/70 uppercase">{t('updateRole')}</label>
                                        <select 
                                            defaultValue={user.role || 'user'} 
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            className="w-full bg-marine-blue-darkest text-white p-2 rounded-md text-sm focus:ring-1 focus:ring-golden-yellow outline-none border border-white/20"
                                        >
                                            <option value="user">{t('roleUser')}</option>
                                            <option value="correspondent">{t('roleCorrespondent')}</option>
                                            <option value="special-user">{t('roleSpecialUser')}</option>
                                            <option value="admin">{t('roleAdmin')}</option>
                                        </select>
                                        <button onClick={() => { setEditingUser(null); setUpdateError(null); }} className="w-full text-xs text-white/50 hover:text-white mt-1 underline">Cancel</button>
                                    </div>
                                ) : (
                                    <div className="mt-auto pt-2 border-t border-white/10">
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
        )}
    </div>
  );
};

export default UsersManager;
