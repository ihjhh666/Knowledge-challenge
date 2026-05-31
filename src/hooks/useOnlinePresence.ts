import { useEffect } from 'react';
import { storage } from '../lib/storage';
import { updateOnlinePresence } from '../lib/firebase';

export function useOnlinePresence() {
  useEffect(() => {
    const playerId = storage.getPlayerId();
    
    // Initial heartbeat
    updateOnlinePresence(playerId);
    
    // Heartbeat every 10 seconds
    const interval = setInterval(() => {
      updateOnlinePresence(playerId);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
}
