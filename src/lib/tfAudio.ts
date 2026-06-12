const getAudioContext = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
};

let audioCtx: AudioContext | null = null;
const initAudio = () => {
  if (!audioCtx) audioCtx = getAudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
};

const playTone = (type: OscillatorType, freqs: number[], duration: number, vol = 0.5) => {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freqs[0], ctx.currentTime);
  if (freqs.length > 1) {
    for (let i = 1; i < freqs.length; i++) {
        osc.frequency.exponentialRampToValueAtTime(freqs[i], ctx.currentTime + (duration * i / freqs.length));
    }
  }
  
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start();
  osc.stop(ctx.currentTime + duration);
};

export const tfAudio = {
  correct: () => {
    playTone('square', [600, 800], 0.15, 0.2);
    setTimeout(() => playTone('sine', [1000, 1200], 0.2, 0.3), 100);
  },
  wrong: () => {
    playTone('sawtooth', [150, 80], 0.3, 0.4);
    setTimeout(() => playTone('square', [100, 50], 0.3, 0.4), 150);
  },
  loseHeart: () => {
    playTone('triangle', [300, 100, 50], 0.6, 0.5);
  },
  lastHeart: () => {
    playTone('sawtooth', [400, 200], 0.5, 0.5);
    setTimeout(() => playTone('sawtooth', [300, 100], 0.6, 0.5), 200);
  },
  lose: () => {
    playTone('sawtooth', [200, 150], 0.4, 0.4);
    setTimeout(() => playTone('sawtooth', [150, 100], 0.4, 0.5), 300);
    setTimeout(() => playTone('square', [100, 50], 0.8, 0.6), 600);
  },
  streakGood: () => { // Example: comboGood
    playTone('sine', [400, 600], 0.1, 0.2);
    setTimeout(() => playTone('sine', [600, 800], 0.1, 0.2), 100);
    setTimeout(() => playTone('sine', [1200, 1600], 0.4, 0.3), 200);
  },
  achievement: () => {
    playTone('square', [500, 1000], 0.2, 0.2);
    setTimeout(() => playTone('sine', [800, 1200], 0.2, 0.3), 150);
    setTimeout(() => playTone('triangle', [1000, 2000], 0.6, 0.3), 300);
  },
  newRecord: () => {
    playTone('triangle', [400, 800], 0.2, 0.3);
    setTimeout(() => playTone('triangle', [600, 1200], 0.2, 0.3), 150);
    setTimeout(() => playTone('sine', [1200, 2400], 0.8, 0.4), 300);
  },
  // Adding backwards-compatibility for existing references
  comboGood: () => tfAudio.streakGood(),
  comboExcellent: () => tfAudio.streakGood(),
  comboLegendary: () => tfAudio.streakGood(),
  win: () => tfAudio.newRecord()
};
