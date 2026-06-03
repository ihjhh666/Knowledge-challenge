import React, { useEffect, useState } from 'react';
import { PlayerProfileModal } from './PlayerProfileModal';

export function GlobalProfileModal() {
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpen = (e: any) => {
       if (e.detail) {
          setProfileId(e.detail);
       }
    };
    window.addEventListener('open_player_profile', handleOpen);
    return () => window.removeEventListener('open_player_profile', handleOpen);
  }, []);

  if (!profileId) return null;

  return <PlayerProfileModal targetPlayerId={profileId} onClose={() => setProfileId(null)} />;
}
