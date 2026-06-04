import { useEffect } from 'react';
import { storage } from '../lib/storage';
import { updateOnlinePresence, removeOnlinePresence, updateUserProfile } from '../lib/firebase';

export function useOnlinePresence() {
  useEffect(() => {
    const playerId = storage.getPlayerId();
    
    const syncProfile = async () => {
        // Initial heartbeat
        updateOnlinePresence(playerId);
        
        // Also sync profile info to ensure they are searchable
        const name = storage.getPlayerName();
        const avatar = storage.getPlayerAvatar();
        await updateUserProfile(playerId, { 
            username: name || `لاعب مجهول`,
            avatarUrl: avatar,
            playerId: playerId 
        });
    };
    
    syncProfile();
    
    // Heartbeat every 10 seconds
    const interval = setInterval(() => {
      updateOnlinePresence(playerId);
    }, 10000);
    
    const handleUnload = () => {
      removeOnlinePresence(playerId);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      // Also remove presence when component unmounts
      removeOnlinePresence(playerId);
    };
  }, []);
}
