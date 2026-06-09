import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { storage } from '../lib/storage';

export type AppUser = User;

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginAsGuest: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  loginAsGuest: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.username) {
        storage.setPlayerName(session.user.user_metadata.username);
        storage.setPlayerAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.username) {
        storage.setPlayerName(session.user.user_metadata.username);
        storage.setPlayerAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`);
      } else if (!session?.user) {
        storage.clearPlayerName();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const loginAsGuest = async (name: string) => {}; // No-op now

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      storage.clearPlayerName();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};
