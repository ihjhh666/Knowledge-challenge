import { useEffect } from 'react';
import { storage } from '../lib/storage';
import { updateOnlinePresence, removeOnlinePresence, updateUserProfile } from '../lib/firebase';
import { supabaseService } from '../services/supabaseService';

export function useOnlinePresence() {
  useEffect(() => {
    console.log('[Supabase_Presence] ONLINE_INIT_STARTED');
    const playerId = storage.getPlayerId();
    const playerName = storage.getPlayerName() || `لاعب مجهول`;
    
    const syncProfile = async () => {
        console.log('[Supabase_Presence] ONLINE_SESSION_STARTED');
        // Initial heartbeat
        updateOnlinePresence(playerId);
        supabaseService.setPlayerOnline(playerId, playerName);
        
        // Also sync profile info to ensure they are searchable
        const avatar = storage.getPlayerAvatar();
        await updateUserProfile(playerId, { 
            username: playerName,
            avatarUrl: avatar,
            playerId: playerId 
        });
    };
    
    syncProfile();
    
    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      updateOnlinePresence(playerId);
      supabaseService.setPlayerOnline(playerId, storage.getPlayerName() || `لاعب مجهول`);
    }, 30000);
    
    const handleUnload = () => {
      removeOnlinePresence(playerId);
      supabaseService.setPlayerOffline(playerId);
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
