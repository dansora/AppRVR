import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  country: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin' | null;
}

interface ProfileContextType {
  session: Session | null;
  profile: Profile | null;
  loadingProfile: boolean;
  profileError: string | null;
  refetchProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (currentSession: Session | null) => {
    setLoadingProfile(true);
    setProfileError(null);
    setProfile(null);

    if (currentSession?.user) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`id, username, first_name, last_name, city, country, phone_number, avatar_url, role`)
          .eq('id', currentSession.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
          throw error;
        }

        setProfile(data as Profile);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        let specificError = 'An unknown error occurred.';
        if (typeof error === 'object' && error !== null) {
            specificError = (error as any).message || JSON.stringify(error);
        } else if (error) {
            specificError = String(error);
        }
        setProfileError(specificError);
      } finally {
        setLoadingProfile(false);
      }
    } else {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchProfile(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        fetchProfile(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);
  
  const refetchProfile = useCallback(() => {
    fetchProfile(session);
  }, [session, fetchProfile]);

  const value = {
    session,
    profile,
    loadingProfile,
    profileError,
    refetchProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};