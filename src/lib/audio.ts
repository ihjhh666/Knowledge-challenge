import { storage } from './storage';

class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private sfxGainNode: GainNode | null = null;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 0.8;

  constructor() {
    this.loadSettings();
  }

  public loadSettings() {
    const s = storage.getSettings();
    this.masterVolume = s.soundEnabled ? s.masterVolume : 0;
    this.sfxVolume = s.sfxEnabled ? s.sfxVolume : 0;
    if (this.ctx && this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume, this.ctx.currentTime);
    }
  }

  private init() {
    if (!this.enabled || this.masterVolume === 0 || this.sfxVolume === 0) return false;
    
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.sfxGainNode = this.ctx.createGain();
        this.sfxGainNode.gain.value = this.sfxVolume * this.masterVolume;
        this.sfxGainNode.connect(this.ctx.destination);
      } catch (e) {
        console.warn("Web Audio API not supported", e);
        return false;
      }
    }
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume, this.ctx.currentTime);
    }
    
    return true;
  }

  public updateVolume(master: number, sfx: number) {
    this.masterVolume = master;
    this.sfxVolume = sfx;
    if (this.ctx && this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume * this.masterVolume, this.ctx.currentTime);
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playToneWithADSR(
    oscType: OscillatorType,
    freq: number,
    attack: number,
    decay: number,
    sustain: number,
    release: number,
    peakVol = 0.1,
    slideFreq?: number,
    pitchBendDuration?: number
  ) {
    if (!this.init() || !this.ctx || !this.sfxGainNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    if (slideFreq && pitchBendDuration) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + pitchBendDuration);
    }

    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peakVol, t + attack);
    gain.gain.linearRampToValueAtTime(peakVol * sustain, t + attack + decay);
    
    const totalDuration = attack + decay + release;
    gain.gain.setValueAtTime(peakVol * sustain, t + attack + decay);
    gain.gain.linearRampToValueAtTime(0, t + totalDuration);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(t);
    osc.stop(t + totalDuration);
  }

  private playNoise(duration: number, bandPassFreq?: number, vol = 0.1) {
    if (!this.init() || !this.ctx || !this.sfxGainNode) return;
    
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    let filter;
    if (bandPassFreq) {
      filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = bandPassFreq;
      filter.Q.value = 1.0;
      noise.connect(filter);
    }
    
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    
    if (filter) {
      filter.connect(gain);
    } else {
      noise.connect(gain);
    }
    gain.connect(this.sfxGainNode);
    
    noise.start(t);
  }

  // --- UI SOUNDS ---
  
  public hover() {
    // Very subtle glass tick
    this.playToneWithADSR('sine', 800, 0.01, 0.02, 0, 0.01, 0.02);
  }

  public click() {
    // Modern soft pop
    this.playToneWithADSR('sine', 600, 0.01, 0.05, 0, 0.05, 0.05, 300, 0.1);
  }
  
  public openModal() {
    // Elegant whoosh/chime up
    this.playToneWithADSR('sine', 440, 0.05, 0.1, 0.2, 0.2, 0.05, 880, 0.2);
  }

  public joinLobby() {
    this.playToneWithADSR('triangle', 523.25, 0.05, 0.1, 0.5, 0.2, 0.05); // C5
    setTimeout(() => this.playToneWithADSR('triangle', 659.25, 0.05, 0.1, 0.5, 0.3, 0.05), 100); // E5
  }

  public startGame() {
    this.playToneWithADSR('square', 220, 0.1, 0.2, 0.1, 0.4, 0.05, 110, 0.4);
    setTimeout(() => {
      this.playToneWithADSR('triangle', 440, 0.1, 0.2, 0.5, 0.5, 0.08);
    }, 200);
  }

  public tick() {
    this.playToneWithADSR('square', 900, 0.01, 0.02, 0, 0.01, 0.01, 100, 0.03);
  }

  // --- QUESTION SECTION ---

  public correct() {
    // Professional success chime (C5, E5, G5, C6) with soft attack
    const r = Math.random();
    if (r < 0.33) {
      this.playToneWithADSR('triangle', 523.25, 0.02, 0.1, 0, 0.1, 0.05);
      setTimeout(() => this.playToneWithADSR('triangle', 659.25, 0.02, 0.1, 0, 0.1, 0.05), 50);
      setTimeout(() => this.playToneWithADSR('triangle', 783.99, 0.02, 0.1, 0.5, 0.3, 0.08), 100);
    } else if (r < 0.66) {
      this.playToneWithADSR('sine', 659.25, 0.02, 0.1, 0, 0.1, 0.05);
      setTimeout(() => this.playToneWithADSR('sine', 880.00, 0.02, 0.1, 0, 0.5, 0.08), 80);
    } else {
      this.playToneWithADSR('sine', 587.33, 0.02, 0.1, 0, 0.2, 0.06);
      setTimeout(() => this.playToneWithADSR('sine', 880.00, 0.02, 0.1, 0.3, 0.4, 0.08), 120);
    }
  }

  public wrong() {
    // Clear but soft, non-annoying muted thump
    this.playToneWithADSR('sawtooth', 150, 0.05, 0.1, 0.2, 0.2, 0.04, 100, 0.2);
    setTimeout(() => {
      this.playToneWithADSR('sawtooth', 130, 0.05, 0.1, 0, 0.2, 0.04, 90, 0.2);
    }, 120);
  }

  public streak(level: number) {
    // Ascending pitch based on streak multiplier
    const root = 440; // A4
    const semitones = Math.min(level, 12);
    const freq = root * Math.pow(1.059463, semitones);
    this.playToneWithADSR('sine', freq, 0.02, 0.1, 0.5, 0.3, 0.06);
    this.playToneWithADSR('triangle', freq * 1.5, 0.05, 0.1, 0.2, 0.4, 0.03); // added harmonic
  }
  
  public newRecord() {
    // Exciting fanfare
    this.playToneWithADSR('square', 523.25, 0.05, 0.1, 0.5, 0.2, 0.05); // C
    setTimeout(() => this.playToneWithADSR('square', 659.25, 0.05, 0.1, 0.5, 0.2, 0.05), 150); // E
    setTimeout(() => this.playToneWithADSR('square', 783.99, 0.05, 0.1, 0.5, 0.2, 0.05), 300); // G
    setTimeout(() => {
      this.playToneWithADSR('square', 1046.50, 0.05, 0.2, 0.8, 0.6, 0.08); // high C
      this.playToneWithADSR('sine', 523.25, 0.05, 0.2, 0.8, 0.6, 0.08); // beef it up
    }, 450);
  }

  public achievement() {
    this.playToneWithADSR('sine', 880, 0.01, 0.1, 0, 0.5, 0.05);
    setTimeout(() => this.playToneWithADSR('triangle', 1108.73, 0.01, 0.1, 0, 0.6, 0.06), 100);
    setTimeout(() => this.playToneWithADSR('sine', 1318.51, 0.02, 0.2, 0.5, 0.8, 0.08), 200);
  }

  public roundEnd() {
    // Mellow resolution
    this.playToneWithADSR('sine', 440, 0.2, 0.2, 0.5, 0.8, 0.05);
    setTimeout(() => this.playToneWithADSR('sine', 349.23, 0.2, 0.2, 0.5, 0.8, 0.05), 200);
    setTimeout(() => this.playToneWithADSR('sine', 261.63, 0.3, 0.2, 0.5, 1.2, 0.08), 400);
  }
  
  public win() {
      this.roundEnd();
  }

  // --- SURVIVAL MODE ---

  public survivalTick(dangerLevel: number) {
    // Tense pulse, speeds up or raises pitch
    const freq = 100 + (dangerLevel * 20);
    this.playToneWithADSR('triangle', freq, 0.01, 0.05, 0, 0.05, 0.03, freq - 20, 0.1);
  }
  
  public survivalDangerPulse() {
      // Very suspenseful heartbeat
      this.playToneWithADSR('sine', 60, 0.1, 0.1, 0, 0.2, 0.1);
      setTimeout(() => this.playToneWithADSR('sine', 65, 0.1, 0.1, 0, 0.3, 0.1), 200);
  }

  // --- FISHING MODE ---

  public waterBubble() {
    const startFreq = 300 + Math.random() * 200;
    this.playToneWithADSR('sine', startFreq, 0.01, 0.05, 0, 0.05, 0.05, startFreq + 300, 0.1);
  }

  public fishCatch() {
    this.playToneWithADSR('triangle', 600, 0.02, 0.1, 0, 0.2, 0.06, 900, 0.2);
    this.waterBubble();
  }
  
  public rareFishCatch() {
      this.achievement();
      for(let i=0; i<3; i++) {
          setTimeout(() => this.waterBubble(), i * 100);
      }
  }

  // --- FOOTBALL (Existing mappings kept but improved) ---
  
  public whistle() {
    this.playNoise(0.4, 2500, 0.05); // air aspect
    this.playToneWithADSR('square', 2500, 0.05, 0.1, 0.8, 0.2, 0.05);
    setTimeout(() => {
        this.playNoise(0.6, 2500, 0.05);
        this.playToneWithADSR('square', 2500, 0.05, 0.2, 0.8, 0.4, 0.05);
    }, 200);
  }

  public kick() {
    // Solid deep thud
    this.playToneWithADSR('triangle', 120, 0.01, 0.1, 0, 0.1, 0.1, 50, 0.1);
    this.playNoise(0.1, 500, 0.05); // shoe impact
  }

  public slide() {
    this.playNoise(0.3, 800, 0.05);
  }

  public postHit() {
    this.playToneWithADSR('sawtooth', 800, 0.01, 0.05, 0, 0.3, 0.05);
    this.playToneWithADSR('sine', 1200, 0.01, 0.1, 0.2, 0.5, 0.05);
  }

  private bgNoise: AudioBufferSourceNode | null = null;
  private bgGain: GainNode | null = null;

  public startCrowd() {
    if (!this.init() || !this.ctx || this.bgNoise) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; 
    
    this.bgNoise = this.ctx.createBufferSource();
    this.bgNoise.buffer = buffer;
    this.bgNoise.loop = true;
    
    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.value = 0.005 * this.sfxVolume * this.masterVolume;

    this.bgNoise.connect(filter);
    filter.connect(this.bgGain);
    if(this.sfxGainNode) this.bgGain.connect(this.sfxGainNode);
    
    this.bgNoise.start();
  }

  public stopCrowd() {
    if (this.bgNoise) {
      try { this.bgNoise.stop(); } catch(e){}
      this.bgNoise.disconnect();
      this.bgNoise = null;
    }
    if (this.bgGain) {
      this.bgGain.disconnect();
      this.bgGain = null;
    }
  }

  public crowdCheer() {
    this.playNoise(2.0, 1500, 0.08);
  }

  // --- KING MODE ---

  public kingCrownPickup() {
    this.achievement();
  }

  public kingCrownSteal() {
    this.playToneWithADSR('sawtooth', 800, 0.05, 0.1, 0, 0.2, 0.08, 1200, 0.25);
  }

  public kingCrownLost() {
    this.playToneWithADSR('triangle', 300, 0.1, 0.2, 0, 0.3, 0.08, 150, 0.3);
  }

  public kingTickScore() {
    this.playToneWithADSR('sine', 1200, 0.02, 0.05, 0, 0.1, 0.03, 1400, 0.1);
  }

  public kingWin() {
    this.newRecord();
  }

  public kingDash() {
    this.playToneWithADSR('sine', 200, 0.05, 0.1, 0, 0.2, 0.05, 50, 0.2);
  }

  public eventStart() {
    this.playToneWithADSR('sine', 440, 0.1, 0.1, 0.5, 0.4, 0.06); 
    setTimeout(() => this.playToneWithADSR('sine', 880, 0.1, 0.2, 0.5, 0.6, 0.08), 150);
  }
}

export const audio = new WebAudioEngine();

