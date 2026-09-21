/**
 * Audio Engine for 50 Millionaire
 * Utilizes exclusively user-provided audio assets:
 *   - /audio/wheel-spin.mp3
 *   - /audio/lose.mp3
 *   - /audio/win.mp3
 *
 * Handles preloading, loop management, graceful fallback for autoplay restrictions,
 * and user sound toggle preference (persisted in localStorage).
 */

class AudioManager {
  private wheelAudio: HTMLAudioElement | null = null;
  private loseAudio: HTMLAudioElement | null = null;
  private winAudio: HTMLAudioElement | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private bgmInterval: any = null;
  private isBgmPlaying: boolean = false;
  private isMuted: boolean = false;
  private initialized: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute =
        localStorage.getItem('fifty_millionaire_muted') ||
        localStorage.getItem('the_gauntlet_muted') ||
        localStorage.getItem('fifty_challenge_muted');
      this.isMuted = savedMute === 'true';
    }
  }

  public init() {
    if (typeof window === 'undefined' || this.initialized) return;

    try {
      this.wheelAudio = new Audio('/audio/wheel-spin.mp3');
      this.wheelAudio.loop = true;
      this.wheelAudio.preload = 'auto';

      this.loseAudio = new Audio('/audio/lose.mp3');
      this.loseAudio.loop = false;
      this.loseAudio.preload = 'auto';

      this.winAudio = new Audio('/audio/win.mp3');
      this.winAudio.loop = false;
      this.winAudio.preload = 'auto';

      this.initialized = true;
    } catch (err) {
      console.warn('Audio preloading failed silently:', err);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fifty_millionaire_muted', String(muted));
      localStorage.setItem('the_gauntlet_muted', String(muted));
    }
    if (muted) {
      this.stopAll();
      this.stopBGM();
    } else {
      this.startBGM();
    }
    this.listeners.forEach((cb) => cb(muted));
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public subscribe(cb: (muted: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public startBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    if (typeof window === 'undefined') return;

    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio('/audio/bgm.mp3');
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.35;
      }
      const p = this.bgmAudio.play();
      if (p !== undefined) {
        p.then(() => {
          this.isBgmPlaying = true;
        }).catch(() => {
          this.startSynthBGM();
        });
        return;
      }
    } catch {
      this.startSynthBGM();
    }
  }

  private startSynthBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      this.bgmGain = this.audioCtx.createGain();
      this.bgmGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      this.bgmGain.connect(this.audioCtx.destination);

      this.isBgmPlaying = true;

      const bassNotes = [73.4, 73.4, 87.3, 73.4, 116.5, 110.0, 73.4, 98.0];
      let step = 0;

      this.bgmInterval = setInterval(() => {
        if (!this.audioCtx || !this.bgmGain || this.isMuted || !this.isBgmPlaying) return;
        const now = this.audioCtx.currentTime;

        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassNotes[step % bassNotes.length], now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, now);
        filter.Q.setValueAtTime(4, now);

        oscGain.gain.setValueAtTime(0.12, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.4);

        if (step % 2 === 0) {
          const clickOsc = this.audioCtx.createOscillator();
          const clickGain = this.audioCtx.createGain();
          clickOsc.type = 'sine';
          clickOsc.frequency.setValueAtTime(140, now);
          clickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.06);
          clickGain.gain.setValueAtTime(0.2, now);
          clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

          clickOsc.connect(clickGain);
          clickGain.connect(this.bgmGain);
          clickOsc.start(now);
          clickOsc.stop(now + 0.09);
        }

        step++;
      }, 350);
    } catch (e) {
      console.warn('Synth BGM error:', e);
    }
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      } catch (e) {}
    }
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.bgmGain && this.audioCtx) {
      try {
        this.bgmGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      } catch (e) {}
    }
  }

  public playWheelSpin() {
    if (this.isMuted) return;
    this.init();
    if (!this.wheelAudio) return;

    try {
      this.wheelAudio.currentTime = 0;
      const playPromise = this.wheelAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Wheel spin audio playback prevented or deferred:', err.message);
        });
      }
    } catch (err) {
      console.warn('Error playing wheel sound:', err);
    }
  }

  public stopWheelSpin() {
    if (!this.wheelAudio) return;
    try {
      this.wheelAudio.pause();
      this.wheelAudio.currentTime = 0;
    } catch (err) {
      // safe fallback
    }
  }

  public playLose() {
    if (this.isMuted) return;
    this.init();
    this.stopWheelSpin();
    if (!this.loseAudio) return;

    try {
      this.loseAudio.currentTime = 0;
      const playPromise = this.loseAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Lose sound playback blocked:', err.message);
        });
      }
    } catch (err) {
      console.warn('Error playing lose sound:', err);
    }
  }

  public playWin() {
    if (this.isMuted) return;
    this.init();
    this.stopWheelSpin();
    if (!this.winAudio) return;

    try {
      this.winAudio.currentTime = 0;
      const playPromise = this.winAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Win sound playback blocked:', err.message);
        });
      }
    } catch (err) {
      console.warn('Error playing win sound:', err);
    }
  }

  public stopAll() {
    this.stopWheelSpin();
    if (this.loseAudio) {
      try {
        this.loseAudio.pause();
        this.loseAudio.currentTime = 0;
      } catch (e) {}
    }
    if (this.winAudio) {
      try {
        this.winAudio.pause();
        this.winAudio.currentTime = 0;
      } catch (e) {}
    }
  }
}

export const audio = new AudioManager();
