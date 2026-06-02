import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from '../lib/firebase';
import { storage } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync the firebase user name/avatar with local storage so remainder of app functions without huge rewrites
        storage.setPlayerName(currentUser.displayName || 'لاعب جوجل');
        if (currentUser.photoURL) {
          storage.setPlayerAvatar(currentUser.photoURL);
        }
        // Save the UID as the player ID to persist stats correctly using the same ID across devices
        localStorage.setItem('know_player_id', currentUser.uid);
      } else {
        // We do not clear storage here so the app doesn't crash on components expecting a player ID
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
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      // Generate a new random local identity properly
      const newId = Math.floor(10000000 + Math.random() * 90000000).toString();
      localStorage.setItem('know_player_id', newId);
      storage.clearPlayerName();
      localStorage.setItem('know_player_avatar', `https://api.dicebear.com/7.x/bottts/svg?seed=${newId}`);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
