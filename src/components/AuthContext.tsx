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
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', sessionUser.id)
        .single();
        
      if (player && player.username) {
        console.log('USER_AUTHENTICATED: Existing profile found');
        storage.setPlayerName(player.username);
        storage.setPlayerAvatar(player.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${sessionUser.id}`);
        setNeedsUsernamePrompt(false);
      } else {
        console.log('USER_AUTHENTICATED: No profile, checking metadata');
        // Player doesn't exist or doesn't have a username yet
        if (sessionUser.user_metadata?.username) {
           // Has metadata but maybe database record is missing, try to upsert as fallback
           await supabase.from('players').upsert({
              id: sessionUser.id,
              username: sessionUser.user_metadata.username,
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${sessionUser.id}`,
              is_online: true,
              account_type: sessionUser.user_metadata.account_type || 'registered',
              last_active_at: new Date().toISOString()
           });
           storage.setPlayerName(sessionUser.user_metadata.username);
           storage.setPlayerAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${sessionUser.id}`);
           setNeedsUsernamePrompt(false);
        } else {
           // OAuth user without a username! We need to prompt them
           setNeedsUsernamePrompt(true);
        }
      }
    } catch (e: any) {
      if (e?.code === 'PGRST116') {
        // Not found, check metadata
        if (sessionUser.user_metadata?.username) {
           setNeedsUsernamePrompt(false);
        } else {
           console.log('USER_AUTHENTICATED: Needs username prompt');
           setNeedsUsernamePrompt(true);
        }
      } else {
         console.error("Error syncing profile:", e);
      }
    }
  };

  useEffect(() => {
    const handleSession = (session: Session | null) => {
      if (session) {
        console.log('OAUTH_SESSION_FOUND');
        if (window.location.hash.includes('access_token=')) {
          console.log('REDIRECTING_TO_HOME and cleaning URL');
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
        account_type: 'registered',
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
