import { useEffect } from 'react';
import { storage } from '../lib/storage';
import { updateOnlinePresence, removeOnlinePresence, updateUserProfile, searchUserById } from '../lib/firebase';
import { supabaseService } from '../services/supabaseService';

export function useOnlinePresence() {
  useEffect(() => {
    console.log('[Supabase_Presence] ONLINE_INIT_STARTED');
    const playerId = storage.getPlayerId();
    
    const syncProfile = async () => {
        try {
           const dbUser = await searchUserById(playerId);
           let finalName = storage.getPlayerName() || '';
           
           // If local name is missing or "Unknown", try to recover from DB
           if (!finalName || finalName === 'لاعب مجهول') {
               if (dbUser && dbUser.playerName && dbUser.playerName !== 'لاعب مجهول') {
                   finalName = dbUser.playerName;
                   storage.setPlayerName(finalName);
               } else if (dbUser && dbUser.username && dbUser.username !== 'لاعب مجهول') {
                   finalName = dbUser.username;
                   storage.setPlayerName(finalName);
               }
           }
           
           if (!finalName) finalName = 'لاعب مجهول';

           console.log('[Supabase_Presence] ONLINE_SESSION_STARTED', { finalName });
           // Initial heartbeat
           supabaseService.setPlayerOnline(playerId, finalName);
           
           const avatar = storage.getPlayerAvatar();
           
           // Only update DB name if it's a real name
           if (finalName !== 'لاعب مجهول') {
               await updateUserProfile(playerId, { 
                   username: finalName,
                   playerName: finalName,
                   avatarUrl: avatar,
                   playerId: playerId 
               });
           } else {
               await updateUserProfile(playerId, { avatarUrl: avatar, playerId: playerId });
           }
        } catch (err) {
            console.error("Error syncing profile", err);
        }
    };
    
    syncProfile();
    
    // Heartbeat every 30 seconds
    const interval = setInterval(() => {
      supabaseService.setPlayerOnline(playerId, storage.getPlayerName() || `لاعب مجهول`);
    }, 30000);
    
    const handleUnload = () => {
      supabaseService.setPlayerOffline(playerId);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      // Also remove presence when component unmounts
      supabaseService.setPlayerOffline(playerId);
    };
  }, []);
}
