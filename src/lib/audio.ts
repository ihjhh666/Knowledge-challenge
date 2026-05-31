class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  constructor() {
    // Wait for user interaction to initialize AudioContext if needed
    // but we will do it lazily.
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  private playTone(oscType: OscillatorType, freq: number, duration: number, vol = 0.1, slideFreq?: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
    }

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  private playChord(oscType: OscillatorType, freqs: number[], duration: number, vol = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    gain.connect(this.ctx.destination);

    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = oscType;
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    });
  }

  public click() {
    // Soft UI pop
    this.playTone('sine', 600, 0.1, 0.1, 300);
  }

  public hover() {
    // Very soft glass tick
    this.playTone('triangle', 900, 0.05, 0.02, 800);
  }

  public joinLobby() {
    // Friendly UI chime (ascending)
    if (!this.enabled) return;
    this.init();
    setTimeout(() => this.playTone('sine', 523.25, 0.2, 0.1), 0);
    setTimeout(() => this.playTone('sine', 659.25, 0.4, 0.1), 100);
  }

  public startGame() {
    // Deep modern whoosh/bell
    this.playTone('triangle', 220, 0.8, 0.15, 110);
    setTimeout(() => {
      this.playTone('sine', 440, 1.0, 0.1);
    }, 200);
  }

  public tick() {
    // Timer tick - very short click
    this.playTone('square', 1000, 0.03, 0.03, 100);
  }

  public correct() {
    // Bright sparkle / bell
    if (!this.enabled) return;
    this.init();
    setTimeout(() => this.playTone('sine', 523.25, 0.1, 0.1), 0);     // C5
    setTimeout(() => this.playTone('sine', 659.25, 0.1, 0.1), 100);    // E5
    setTimeout(() => this.playTone('sine', 783.99, 0.4, 0.1), 200);    // G5
    setTimeout(() => this.playTone('sine', 1046.50, 0.6, 0.08), 300);  // C6
  }

  public wrong() {
    // Modern soft thud / error buzzer
    if (!this.enabled) return;
    this.init();
    this.playChord('sawtooth', [150, 160], 0.3, 0.1);
    setTimeout(() => {
      this.playChord('sawtooth', [130, 140], 0.4, 0.1);
    }, 150);
  }

  public win() {
    if (!this.enabled) return;
    this.init();
    setTimeout(() => this.playTone('sine', 440, 0.2, 0.1), 0);
    setTimeout(() => this.playTone('sine', 554.37, 0.2, 0.1), 150);
    setTimeout(() => this.playTone('sine', 659.25, 0.2, 0.1), 300);
    setTimeout(() => this.playTone('sine', 880, 0.8, 0.15), 450);
  }

  // Football sounds
  private bgNoise: AudioBufferSourceNode | null = null;
  private bgGain: GainNode | null = null;

  public startCrowd() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.bgNoise) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300; // Low rumble
    
    this.bgNoise = this.ctx.createBufferSource();
    this.bgNoise.buffer = buffer;
    this.bgNoise.loop = true;
    
    this.bgGain = this.ctx.createGain();
    this.bgGain.gain.value = 0.015; // Very soft

    this.bgNoise.connect(filter);
    filter.connect(this.bgGain);
    this.bgGain.connect(this.ctx.destination);
    
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

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
       this.stopCrowd();
    }
  }

  public whistle() {
    if (!this.enabled) return;
    this.init();
    // High pitched short whistle
    this.playTone('square', 2000, 0.2, 0.1, 1800);
    setTimeout(() => this.playTone('square', 2000, 0.4, 0.1, 1800), 200);
  }

  public kick() {
    // Deep thud
    this.playTone('square', 150, 0.15, 0.2, 50);
    this.playTone('triangle', 300, 0.1, 0.1, 100);
  }

  public postHit() {
    // Metal clang
    this.playChord('triangle', [800, 1200, 1600], 0.3, 0.1);
  }

  public slide() {
    // Goal save friction
    this.playTone('sawtooth', 200, 0.3, 0.15, 50);
  }

  public crowdCheer() {
    // White noise approximation for crowd cheer spike
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    
    // Apply lowpass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.15, this.ctx.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.8);
    
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    
    noiseSource.start();
  }
}

export const audio = new WebAudioEngine();
