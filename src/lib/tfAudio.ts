import { audio } from './audio';

export const tfAudio = {
  correct: () => audio.correct(),
  wrong: () => audio.wrong(),
  loseHeart: () => audio.wrong(),
  lastHeart: () => audio.wrong(),
  lose: () => audio.wrong(),
  streakGood: () => audio.streak(3),
  achievement: () => audio.achievement(),
  newRecord: () => audio.newRecord(),
  
  comboGood: () => audio.streak(5),
  comboExcellent: () => audio.streak(10),
  comboLegendary: () => audio.newRecord(),
  win: () => audio.newRecord()
};
