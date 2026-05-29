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
}

export const audio = new WebAudioEngine();
