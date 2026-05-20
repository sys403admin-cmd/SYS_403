'use client';

class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      } catch (e) {
        console.warn("SoundEngine: AudioContext failed to initialize", e);
      }
    }
  }

  playClick() {
    if (typeof window === 'undefined') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch (e) {}
  }

  playStatic() {
    if (typeof window === 'undefined') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    try {
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      
      noise.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start();
    } catch (e) {}
  }

  playHover() {
    if (typeof window === 'undefined') return;
    this.init();
    if (!this.ctx || this.ctx.state === 'suspended') return;
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }
}

export const sounds = new SoundEngine();
