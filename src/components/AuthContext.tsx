import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { storage } from '../lib/storage';

export type AppUser = User;

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  needsUsernamePrompt: boolean;
  logout: () => Promise<void>;
  loginAsGuest: (name: string) => Promise<void>;
  completeProfile: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  needsUsernamePrompt: false,
  logout: async () => {},
  loginAsGuest: async () => {},
  completeProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsUsernamePrompt, setNeedsUsernamePrompt] = useState(false);

  const navigate = useNavigate();

  const syncProfile = async (sessionUser: User) => {
    try {
      console.log('--- تتبع بيانات المستخدم ---');
      console.log('user.id:', sessionUser.id);
      console.log('user.email:', sessionUser.email);
      
      const isGoogleUser = sessionUser.app_metadata?.provider === 'google';
      if (isGoogleUser) {
        console.log('GOOGLE_USER_FOUND');
      }

      console.log('نتيجة البحث في جدول players ...');
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
        
      console.log('Supabase Query Result:', { player, error: error?.message || null });
        
      if (player && player.username) {
        console.log('PLAYER_RECORD_FOUND');
        storage.setPlayerName(player.username);
        storage.setPlayerAvatar(player.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${sessionUser.id}`);
        setNeedsUsernamePrompt(false);
      } else {
        console.log('لم يتم العثور على سجل في جدول players (أو لا يوجد username).');
        
        // Ensure Google users get automatically created using their Google name/profile
        const googleUsername = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0];
        
        if (googleUsername) {
           console.log('جاري إنشاء سجل جديد للاعب...');
           await supabase.from('players').upsert({
              id: sessionUser.id,
              username: googleUsername,
              email: sessionUser.email || null,
              avatar_url: sessionUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${sessionUser.id}`,
              is_online: true,
              last_active_at: new Date().toISOString()
           });
           
           console.log('PLAYER_RECORD_CREATED');
           
           // Update auth metadata to avoid prompting again
           await supabase.auth.updateUser({
             data: { username: googleUsername, account_type: 'registered' }
           });

           storage.setPlayerName(googleUsername);
           storage.setPlayerAvatar(sessionUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${sessionUser.id}`);
           setNeedsUsernamePrompt(false);
        } else {
           // OAuth user without a username! We need to prompt them
           setNeedsUsernamePrompt(true);
        }
      }
    } catch (e: any) {
       console.error("Error syncing profile:", e);
    }
  };

  useEffect(() => {
    const handleSession = (session: Session | null) => {
      if (session) {
        if (window.location.hash.includes('access_token=')) {
          console.log('REDIRECT_TO_GAME');
          // Clean the URL from the OAuth fragment
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          navigate('/', { replace: true });
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        handleSession(session);
        syncProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      setUser(session?.user ?? null);
      if (session?.user) {
        if (event === 'SIGNED_IN') {
           handleSession(session);
        }
        await syncProfile(session.user);
        setLoading(false);
      } else {
        storage.clearPlayerName();
        setNeedsUsernamePrompt(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);
  
  const loginAsGuest = async (name: string) => {}; // No-op now

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      storage.clearPlayerName();
      setUser(null);
      setNeedsUsernamePrompt(false);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const completeProfile = async (username: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('players').upsert({
        id: user.id,
        username: username,
        email: user.email || null,
        avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
        is_online: true,
        last_active_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
      if (error) throw error;

      await supabase.auth.updateUser({
        data: { username, account_type: 'registered' }
      });
      
      storage.setPlayerName(username);
      storage.setPlayerAvatar(user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`);
      setNeedsUsernamePrompt(false);
    } catch (e) {
      console.error("Error completing profile:", e);
      throw e;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, needsUsernamePrompt, logout, loginAsGuest, completeProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
