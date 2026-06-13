import { audio } from './audio';

export const chickenAudio = {
  ctx: null,
  init() {},
  playCluck() {
      audio.correct();
  },
  playPickup() {
      audio.achievement();
  },
  playDrop() {
      audio.wrong();
  },
  playEventAlert() {
      audio.eventStart();
  },
  playWin() {
      audio.win();
  },
  playLose() {
      audio.wrong();
  }
};
