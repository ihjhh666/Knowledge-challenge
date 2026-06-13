import { audio } from './audio';

export const fishingAudio = {
  toggleMute: () => {
    // Rely on global settings, but if local toggle is needed:
    return false;
  },
  
  isMuted: () => false,

  playCatch: (type: 'normal' | 'medium' | 'rare' | 'legendary') => {
    if (type === 'normal') {
      audio.fishCatch();
    } else if (type === 'medium') {
      audio.fishCatch();
    } else if (type === 'rare') {
      audio.rareFishCatch();
    } else {
      audio.rareFishCatch();
    }
  },

  playGameOver: () => {
    audio.wrong();
  },

  playWin: () => {
    audio.win();
  },
  
  playInit: () => {
    // Managed centrally
  }
};
