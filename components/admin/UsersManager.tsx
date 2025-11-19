
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';
import { BackIcon, UserIcon, EditIcon, CheckCircleIcon, DatabaseIcon, CloseIcon } from '../Icons';

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
  const [showSqlHelp, setShowSqlHelp] = useState(false);

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
        // We use select() to ensure we get data back. If RLS blocks it, data might be empty or null.
        const { data, error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)
            .select();

        if (error) throw error;

        // Check for Silent RLS Failure
        if (!data || data.length === 0) {
             throw new Error("RLS_BLOCK");
        }

        setMessage({ type: 'success', text: t('userRoleUpdatedSuccess') });
        setEditingUser(null);
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));

      } catch (err: any) {
          console.error("Update Role Error:", err);
          
          const sql = `-- POLICY: Allow admins to update any profile
-- 1. Drop existing policy if it conflicts (optional, be careful)
DROP POLICY IF EXISTS "Allow admins to update all profiles" ON public.profiles;

-- 2. Create the UPDATE policy
CREATE POLICY "Allow admins to update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text
);`;

          if (err.message === "RLS_BLOCK" || err.code === '42501' || err.message.includes('violates row-level security')) {
            setUpdateError({
                title: "Permission Denied (Update)",
                message: "The database blocked this update. This usually means the 'UPDATE' policy is missing for admins.",
                sql: sql
            });
            // Force show the help section
            setShowSqlHelp(true);
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
        <div className="flex justify-between items-center">
            <button onClick={onBack} className="flex items-center gap-2 text-golden-yellow hover:underline">
                <BackIcon className="w-5 h-5" />
                {t('backToDashboard')}
            </button>
            <button 
                onClick={() => setShowSqlHelp(!showSqlHelp)} 
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
                <DatabaseIcon className="w-4 h-4" />
                {showSqlHelp ? "Hide SQL Helpers" : "Show SQL Helpers"}
            </button>
        </div>

        {showSqlHelp && (
            <div className="bg-marine-blue-darkest border border-blue-500 p-4 rounded-lg relative animate-fade-in">
                 <button onClick={() => setShowSqlHelp(false)} className="absolute top-2 right-2 text-white/50 hover:text-white"><CloseIcon className="w-5 h-5"/></button>
                 <h3 className="text-lg font-bold text-blue-300 mb-4">Database Setup Scripts</h3>
                 
                 <div className="space-y-6">
                    <div>
                        <p className="text-sm text-white/80 mb-2 font-bold">1. Fix Permissions (Allow Admins to Update Roles)</p>
                        <pre className="bg-black/50 p-3 rounded text-xs text-green-300 overflow-x-auto font-mono select-all">
{`-- Run this to allow admins to change user roles
CREATE POLICY "Allow admins to update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text
);`}
                        </pre>
                    </div>

                    <div>
                         <p className="text-sm text-white/80 mb-2 font-bold">2. Fix Permissions (Allow Admins to View Users)</p>
                         <pre className="bg-black/50 p-3 rounded text-xs text-green-300 overflow-x-auto font-mono select-all">
{`CREATE POLICY "Allow admins to view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'::text);`}
                        </pre>
                    </div>
                 </div>
            </div>
        )}

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
                        <pre className="bg-marine-blue-darkest p-4 rounded-md text-xs text-green-300 overflow-x-auto font-mono border border-white/10 select-all">
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
                        <pre className="bg-black/30 p-4 rounded-md text-xs text-green-300 overflow-x-auto font-mono border border-white/10 select-all">
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
