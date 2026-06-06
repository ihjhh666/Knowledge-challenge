export const chickenAudio = {
  ctx: null as AudioContext | null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },
  playTone(freq: number, type: OscillatorType, duration: number, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },
  playCluck() {
    this.init();
    // A squawky sine/triangle combo
    this.playTone(300, 'triangle', 0.1, 0.3);
    setTimeout(() => this.playTone(400, 'sine', 0.1, 0.3), 50);
  },
  playPickup() {
    this.init();
    this.playTone(600, 'sine', 0.1, 0.4);
    setTimeout(() => this.playTone(800, 'sine', 0.1, 0.4), 80);
  },
  playDrop() {
    this.init();
    this.playTone(400, 'square', 0.1, 0.2);
    setTimeout(() => this.playTone(300, 'square', 0.1, 0.2), 100);
  },
  playEventAlert() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(t + 0.5);
  },
  playWin() {
    this.init();
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.3, 0.5), i * 150);
    });
  },
  playLose() {
    this.init();
    [400, 350, 300, 200].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.4, 0.4), i * 200);
    });
  }
};
