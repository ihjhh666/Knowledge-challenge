const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    return new AudioContextClass();
};
  
let pCtx: AudioContext | null = null;
const initProverbsAudio = () => {
    if (!pCtx) pCtx = getAudioContext();
    if (pCtx.state === 'suspended') pCtx.resume();
    return pCtx;
};
  
// Plucked string physics synthesis (simulates Oud/Qanun)
const playPluck = (freq: number, duration: number, vol = 0.5, delay = 0) => {
    const ctx = initProverbsAudio();
    const t = ctx.currentTime + delay;
    
    // We use a triangle and sine wave with rapid decay
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    
    osc.type = 'triangle';
    osc2.type = 'sine';
    
    osc.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq, t);
    
    const gain = ctx.createGain();
    
    // Sharp attack, exponential decay for a plucked feel
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(t);
    osc2.start(t);
    osc.stop(t + duration);
    osc2.stop(t + duration);
};
  
export const proverbsAudio = {
    playCorrect: () => {
      // Makam Rast essence (C D E-half-flat F G)
      // Approximating with a joyful pentatonic scale pluck
      playPluck(261.63, 1.0, 0.3, 0);   // C4
      playPluck(329.63, 1.0, 0.3, 0.1); // E4
      playPluck(392.00, 1.2, 0.4, 0.2); // G4
      playPluck(523.25, 1.5, 0.5, 0.35); // C5
    },
    playWrong: () => {
      // Low, slightly dissonant plucks
      playPluck(150, 0.5, 0.6, 0); 
      playPluck(140, 0.6, 0.6, 0.15); 
    },
    playStreak: () => {
      // Ascending majestic arpeggio
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C major pentatonic
      notes.forEach((freq, idx) => {
        playPluck(freq, 1.5, 0.3, idx * 0.1);
      });
      playPluck(1046.50, 2.0, 0.5, notes.length * 0.1 + 0.1); // C6 resonance
    },
    playAchievement: () => {
      playPluck(440, 1.0, 0.3, 0);
      playPluck(554.37, 1.0, 0.3, 0.1);
      playPluck(659.25, 1.0, 0.3, 0.2);
      playPluck(880, 2.0, 0.5, 0.3);
      playPluck(880, 2.0, 0.5, 0.45);
    },
    playRoundComplete: () => {
      const notes = [440, 523.25, 659.25];
      notes.forEach((f, idx) => {
          playPluck(f, 2.0, 0.3, idx * 0.15);
      });
      playPluck(880, 2.5, 0.5, 0.5);
    },
    playNewRecord: () => {
      // A grand finishing flourish
      playPluck(392, 1.0, 0.4, 0);
      playPluck(523.25, 1.0, 0.4, 0.1);
      playPluck(659.25, 1.0, 0.4, 0.2);
       // chord
      playPluck(523.25, 2.0, 0.4, 0.4);
      playPluck(659.25, 2.0, 0.4, 0.4);
      playPluck(1046.50, 2.0, 0.6, 0.4);
    }
};
