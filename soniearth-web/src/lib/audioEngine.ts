/**
 * audioEngine.ts
 * Real-time browser audio synthesis powered by Tone.js & Web Audio API.
 * Features:
 * - User-gesture Autoplay policy compliance
 * - Master Limiter at -3dBFS (zero clipping)
 * - 90/10 Speech Ducking gain automation
 * - Spatial Panning
 */
import * as Tone from "tone";

class SoniEarthAudioEngine {
  private isInitialized = false;
  private isMuted = false;
  private masterGain: Tone.Gain | null = null;
  private masterLimiter: Tone.Limiter | null = null;
  private padSynth: Tone.PolySynth | null = null;
  private chimeSynth: Tone.PolySynth | null = null;
  private celloSynth: Tone.PolySynth | null = null;
  private panner: Tone.Panner | null = null;

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      await Tone.start();

      // Master output pipeline: Gain (for ducking) -> Limiter (-3dB) -> Destination
      this.masterLimiter = new Tone.Limiter(-3.0).toDestination();
      this.masterGain = new Tone.Gain(1.0).connect(this.masterLimiter);

      // Stereo panner connected to master gain
      this.panner = new Tone.Panner(0.0).connect(this.masterGain);

      // 1. Ambient Baseline Pad Synth (Warm sine pad)
      this.padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" },
        envelope: { attack: 0.08, decay: 0.15, sustain: 0.7, release: 0.3 }
      }).connect(this.panner);
      this.padSynth.volume.value = -6;

      // 2. Crystalline Chimes (Bright bell for Purple illumination increase)
      this.chimeSynth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2.76,
        modulationIndex: 2.5,
        envelope: { attack: 0.01, decay: 0.25, sustain: 0.2, release: 0.45 },
        modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 }
      }).connect(this.panner);
      this.chimeSynth.volume.value = -4;

      // 3. Warm Cello Synth (Mellow triangle for Orange illumination decrease)
      this.celloSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.15, decay: 0.3, sustain: 0.6, release: 0.4 }
      }).connect(this.panner);
      this.celloSynth.volume.value = -5;

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error("AudioEngine initialization failed:", err);
      return false;
    }
  }

  public triggerNote(
    note: string,
    durationSec = 0.5,
    velocity = 0.7,
    pan = 0.0,
    instrument = "sine_pad"
  ) {
    if (!this.isInitialized || this.isMuted) return;

    if (this.panner) {
      this.panner.pan.rampTo(Math.max(-1.0, Math.min(1.0, pan)), 0.05);
    }

    try {
      if (instrument === "crystalline_chime_bell" && this.chimeSynth) {
        this.chimeSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      } else if (instrument === "warm_cello_synth" && this.celloSynth) {
        this.celloSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      } else if (this.padSynth) {
        this.padSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      }
    } catch (e) {
      // Ignore transient polyphony allocation warnings
    }
  }

  /**
   * 90/10 Speech Ducking: Ducks music volume to 50% when speech narrator speaks.
   */
  public duckAudio(duck: boolean) {
    if (!this.masterGain) return;
    const targetGain = duck ? 0.4 : 1.0;
    this.masterGain.gain.rampTo(targetGain, 0.15);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
    }
    return this.isMuted;
  }

  public stopAll() {
    this.padSynth?.releaseAll();
    this.chimeSynth?.releaseAll();
    this.celloSynth?.releaseAll();
  }
}

export const audioEngine = new SoniEarthAudioEngine();
