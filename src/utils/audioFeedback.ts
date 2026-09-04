/**
 * Web Audio API Sound Synthesizer
 * Zero-dependency, lightweight sound effects for touch screens, scanners, and alerts.
 * Unterstützt stufenlose Lautstärkeregelung und Akustik-Profile (Messehalle vs. Lounge).
 */

export type AudioProfile = 'fair' | 'lounge';

class AudioFeedbackService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = (() => {
    try {
      return localStorage.getItem('interactv_audio_muted') === 'true';
    } catch {
      return false;
    }
  })();

  private volume: number = (() => {
    try {
      const saved = localStorage.getItem('interactv_audio_volume');
      return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.75;
    } catch {
      return 0.75;
    }
  })();

  private profile: AudioProfile = (() => {
    try {
      const saved = localStorage.getItem('interactv_audio_profile') as AudioProfile;
      return saved === 'lounge' ? 'lounge' : 'fair';
    } catch {
      return 'fair';
    }
  })();

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('interactv_audio_muted', String(muted));
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('interactv_audio_volume', String(this.volume));
    } catch {}
  }

  public getVolume(): number {
    return this.volume;
  }

  public setProfile(prof: AudioProfile) {
    this.profile = prof;
    try {
      localStorage.setItem('interactv_audio_profile', prof);
    } catch {}
  }

  public getProfile(): AudioProfile {
    return this.profile;
  }

  private getEffectiveGain(baseGain: number): number {
    const profileMultiplier = this.profile === 'lounge' ? 0.6 : 1.0;
    return baseGain * this.volume * profileMultiplier;
  }

  /**
   * Subtle, crisp UI touch click sound
   */
  public playTouchClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);

      const targetGain = this.getEffectiveGain(0.12);
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio policy errors
    }
  }

  public playActionClick() {
    this.playTouchClick();
  }

  public playTick() {
    this.playTouchClick();
  }

  public playSuccess() {
    this.playSuccessChime();
  }

  /**
   * Bright, high-pitch scan confirmation beep (for QR/NFC/Visitenkarten)
   */
  public playScanBeep() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6
      osc.frequency.setValueAtTime(2637, ctx.currentTime + 0.06); // E7

      const targetGain = this.getEffectiveGain(0.18);
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // Ignore
    }
  }

  /**
   * Ascending 3-note major chord celebration chime (C6 -> E6 -> G6)
   */
  public playSuccessChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const startTime = ctx.currentTime + idx * 0.07;
        const duration = 0.22;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        const targetGain = this.getEffectiveGain(0.15);
        gain.gain.setValueAtTime(targetGain, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Gentle error / warning tone
   */
  public playErrorTone() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);

      const targetGain = this.getEffectiveGain(0.1);
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }

  public playWarningTone() {
    this.playErrorTone();
  }
}

export const audioFeedback = new AudioFeedbackService();
