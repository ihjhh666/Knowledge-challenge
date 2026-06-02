import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, signInWithPopup, getRedirectResult, GoogleAuthProvider, signOut, onAuthStateChanged, User } from '../lib/firebase';
import { storage } from '../lib/storage';

export type AppUser = User | { uid: string; displayName: string | null; photoURL: string | null; isGuest: boolean };

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginAsGuest: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if there is an existing guest session
    const savedName = storage.getPlayerName();
    const guestId = localStorage.getItem('know_player_id');
    const isGuestSession = localStorage.getItem('is_guest_session') === 'true';

    if (!auth) {
      if (savedName && guestId) {
        setUser({ uid: guestId, displayName: savedName, photoURL: null, isGuest: true });
      }
      setLoading(false);
      return;
    }

    if (savedName && guestId && isGuestSession) {
       setUser({ uid: guestId, displayName: savedName, photoURL: null, isGuest: true });
       setLoading(false);
       // Still setup listener but don't overwrite guest until they clear it
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser as AppUser);
        localStorage.removeItem('is_guest_session'); // Clear guest flag
        storage.setPlayerName(currentUser.displayName || 'لاعب جوجل');
        if (currentUser.photoURL) {
          storage.setPlayerAvatar(currentUser.photoURL);
        }
        localStorage.setItem('know_player_id', currentUser.uid);
      } else {
        // If they just logged out of firebase, check if they are explicitly guest
        if (localStorage.getItem('is_guest_session') !== 'true') {
           setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Google login failed API error:', error);
      throw error;
    }
  };

  const loginAsGuest = async (name: string) => {
    const newId = localStorage.getItem('know_player_id') || Math.floor(10000000 + Math.random() * 90000000).toString();
    localStorage.setItem('know_player_id', newId);
    storage.setPlayerName(name);
    localStorage.setItem('know_player_avatar', `https://api.dicebear.com/7.x/bottts/svg?seed=${newId}`);
    localStorage.setItem('is_guest_session', 'true');
    setUser({ uid: newId, displayName: name, photoURL: null, isGuest: true });
  };

  const logout = async () => {
    try {
      if (auth && auth.currentUser) {
        await signOut(auth);
      }
      // Generate a new random local identity properly
      const newId = Math.floor(10000000 + Math.random() * 90000000).toString();
      localStorage.setItem('know_player_id', newId);
      localStorage.removeItem('is_guest_session');
      storage.clearPlayerName();
      localStorage.setItem('know_player_avatar', `https://api.dicebear.com/7.x/bottts/svg?seed=${newId}`);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
