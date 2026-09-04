// Web Audio API procedural sound engine for Penta creature

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx?.currentTime || 0, 0.1);
    } else if (!muted && this.ambientGain && this.isAmbientPlaying) {
      this.ambientGain.gain.setTargetAtTime(0.04, this.ctx?.currentTime || 0, 0.5);
    }
  }

  /** Granular gating: lets the FX panel silence specific families only. */
  public allowImpactSound = true;
  public allowFoodSound = true;
  public allowVoiceSound = true;

  public setChannels(channels: {
    master: boolean;
    impact: boolean;
    food: boolean;
    voice: boolean;
  }) {
    this.isMuted = !channels.master;
    this.allowImpactSound = channels.master && channels.impact;
    this.allowFoodSound = channels.master && channels.food;
    this.allowVoiceSound = channels.master && channels.voice;
  }

  // Soft elastic jump/bounce thud
  public playBounce(pitchMultiplier = 1) {
    if (this.isMuted || !this.allowImpactSound) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(70 * pitchMultiplier, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Cute chirp when clicked or poked
  public playChirp(emotion: 'happy' | 'surprised' | 'curious' | 'annoyed' = 'happy') {
    if (this.isMuted || !this.allowVoiceSound) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = emotion === 'annoyed' ? 'sawtooth' : 'sine';

    if (emotion === 'happy') {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.16);
    } else if (emotion === 'surprised') {
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.12);
    } else if (emotion === 'curious') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(550, now + 0.06);
      osc.frequency.linearRampToValueAtTime(750, now + 0.14);
    } else {
      // annoyed / poked
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);
    }

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // Soft blink micro-sound
  public playBlink() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Food munch sound
  public playMunch() {
    if (this.isMuted || !this.allowFoodSound) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(700 + i * 150, now + i * 0.05);
      osc.frequency.exponentialRampToValueAtTime(400, now + i * 0.05 + 0.04);

      gain.gain.setValueAtTime(0.1, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.05);
    }
  }

  // Laser target lock sound
  public playLaserLock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.08);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Pre-burst energy overload whine & stutter
  public playBurstCharge() {
    if (this.isMuted || !this.allowImpactSound) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.38);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(3500, now + 0.38);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Cinematic crystalline shatter explosion: sub-bass boom + glass shimmer
  public playBurstShatter() {
    if (this.isMuted || !this.allowImpactSound) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub bass punch
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(130, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.52);

    // Crystalline glass chimes
    [1600, 2400, 3200, 4800].forEach((freq, i) => {
      const chimeOsc = this.ctx!.createOscillator();
      const chimeGain = this.ctx!.createGain();
      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(freq + Math.random() * 200, now + i * 0.03);
      chimeOsc.frequency.exponentialRampToValueAtTime(freq * 0.4, now + i * 0.03 + 0.3);
      chimeGain.gain.setValueAtTime(0.1 / (i + 1), now + i * 0.03);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.35);
      chimeOsc.connect(chimeGain);
      chimeGain.connect(this.ctx!.destination);
      chimeOsc.start(now + i * 0.03);
      chimeOsc.stop(now + i * 0.03 + 0.38);
    });
  }

  // Quantum suction & reassembly chord sweep
  public playReassembleSweep() {
    if (this.isMuted || !this.allowImpactSound) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(4000, now + 0.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.55);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.66);
  }

  // Final respawn pop & harmonic chime
  public playRespawnPop() {
    if (this.isMuted || !this.allowImpactSound) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [520, 650, 780, 1040].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.24);
    });
  }

  // Tickle giggle sound
  public playGiggle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [600, 750, 900, 750, 950];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0.08, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.04);
    });
  }

  // Toggle ambient relaxation soundscape
  public toggleAmbient(enable: boolean) {
    this.initCtx();
    if (!this.ctx) return;

    if (enable && !this.isAmbientPlaying) {
      this.isAmbientPlaying = true;
      const now = this.ctx.currentTime;
      
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      this.ambientOsc.type = 'sine';
      this.ambientOsc.frequency.setValueAtTime(110, now); // A2 drone

      this.ambientGain.gain.setValueAtTime(0, now);
      this.ambientGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.03, now + 2);

      // Low pass filter to make it warm
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);

      this.ambientOsc.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start(now);
    } else if (!enable && this.ambientOsc && this.ambientGain) {
      this.isAmbientPlaying = false;
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 1);
      setTimeout(() => {
        this.ambientOsc?.stop();
        this.ambientOsc?.disconnect();
        this.ambientOsc = null;
        this.ambientGain = null;
      }, 1000);
    }
  }
}

export const soundFx = new SoundEngine();
