/**
 * audioEngine.ts
 * Real-time browser audio synthesis powered by Tone.js & Web Audio API.
 * Features:
 * - User-gesture Autoplay policy compliance
 * - Master Limiter at -3dBFS (zero clipping)
 * - Independent Duck Gain & Mute Gain in series: MUTE ALWAYS WINS
 * - Dedicated spatial panners per voice / channel (zero panning conflicts)
 * - Real-time Tone.js Analyser FFT Spectrum for authentic equalizer visualization
 * - Full multi-mode synthesizer bank:
 *   1. padSynthCenter, padSynthWest, padSynthEast (Warm Sine Baseline & Spatial Grid)
 *   2. chimeSynth (Crystalline Chimes for Purple Illumination Increase, Pan Right)
 *   3. celloSynth (Warm Cello Synth for Orange Illumination Decrease, Pan Left)
 *   4. pluckSynth (Snappy Marimba Pluck for India)
 *   5. glassSynth (Crystal Glass Pad for Western Europe)
 *   6. modalSynth (Modal Synth for Eastern Mediterranean)
 */
import * as Tone from "tone";

class SoniEarthAudioEngine {
  private isInitialized = false;
  private isMuted = false;
  private isDucked = false;

  // Master Gain Stage
  private masterLimiter: Tone.Limiter | null = null;
  private muteGain: Tone.Gain | null = null;
  private duckGain: Tone.Gain | null = null;
  private analyser: Tone.Analyser | null = null;

  // Dedicated Channel Panners (eliminating panning conflicts)
  private westPanner: Tone.Panner | null = null;
  private centerPanner: Tone.Panner | null = null;
  private eastPanner: Tone.Panner | null = null;
  private chimePanner: Tone.Panner | null = null;
  private celloPanner: Tone.Panner | null = null;
  private pluckPanner: Tone.Panner | null = null;
  private glassPanner: Tone.Panner | null = null;
  private modalPanner: Tone.Panner | null = null;

  // Dedicated Synthesizers
  private padSynthCenter: Tone.PolySynth | null = null;
  private padSynthWest: Tone.PolySynth | null = null;
  private padSynthEast: Tone.PolySynth | null = null;
  private chimeSynth: Tone.PolySynth | null = null;
  private celloSynth: Tone.PolySynth | null = null;
  private pluckSynth: Tone.PolySynth | null = null;
  private glassSynth: Tone.PolySynth | null = null;
  private modalSynth: Tone.PolySynth | null = null;

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      await Tone.start();

      // Master Pipeline in series:
      // duckGain -> muteGain -> masterLimiter -> Tone.Destination & analyser
      this.masterLimiter = new Tone.Limiter(-3.0).toDestination();
      this.analyser = new Tone.Analyser("fft", 32);
      this.masterLimiter.connect(this.analyser);

      // Mute Gain (always wins)
      this.muteGain = new Tone.Gain(this.isMuted ? 0.0 : 1.0).connect(this.masterLimiter);

      // Duck Gain (automated for speech)
      this.duckGain = new Tone.Gain(1.0).connect(this.muteGain);

      // Spatial Panners all feed into duckGain
      this.centerPanner = new Tone.Panner(0.0).connect(this.duckGain);
      this.westPanner = new Tone.Panner(-0.75).connect(this.duckGain);
      this.eastPanner = new Tone.Panner(0.75).connect(this.duckGain);
      this.chimePanner = new Tone.Panner(0.75).connect(this.duckGain);
      this.celloPanner = new Tone.Panner(-0.75).connect(this.duckGain);
      this.pluckPanner = new Tone.Panner(0.5).connect(this.duckGain);
      this.glassPanner = new Tone.Panner(-0.4).connect(this.duckGain);
      this.modalPanner = new Tone.Panner(0.15).connect(this.duckGain);

      // 1. Ambient Baseline Pad Synths (Separated across stereo channels)
      const padConfig = {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.08, decay: 0.15, sustain: 0.7, release: 0.3 }
      };
      this.padSynthCenter = new Tone.PolySynth(Tone.Synth, padConfig).connect(this.centerPanner);
      this.padSynthCenter.volume.value = -6;

      this.padSynthWest = new Tone.PolySynth(Tone.Synth, padConfig).connect(this.westPanner);
      this.padSynthWest.volume.value = -6;

      this.padSynthEast = new Tone.PolySynth(Tone.Synth, padConfig).connect(this.eastPanner);
      this.padSynthEast.volume.value = -6;

      // 2. Crystalline Chimes (Bright bell for Purple increase, Panned Right)
      this.chimeSynth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2.76,
        modulationIndex: 2.5,
        envelope: { attack: 0.01, decay: 0.25, sustain: 0.2, release: 0.45 },
        modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 }
      }).connect(this.chimePanner);
      this.chimeSynth.volume.value = -4;

      // 3. Warm Cello Synth (Mellow triangle for Orange decrease, Panned Left)
      this.celloSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" as const },
        envelope: { attack: 0.15, decay: 0.3, sustain: 0.6, release: 0.4 }
      }).connect(this.celloPanner);
      this.celloSynth.volume.value = -5;

      // 4. Snappy Marimba Pluck (Fast attack for India rural electrification)
      this.pluckSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle8" as const },
        envelope: { attack: 0.005, decay: 0.22, sustain: 0.1, release: 0.25 }
      }).connect(this.pluckPanner);
      this.pluckSynth.volume.value = -4;

      // 5. Crystal Glass Pad (Western Europe LED grid)
      this.glassSynth = new Tone.PolySynth(Tone.AMSynth, {
        harmonicity: 3.01,
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.12, decay: 0.35, sustain: 0.75, release: 0.5 }
      }).connect(this.glassPanner);
      this.glassSynth.volume.value = -6;

      // 6. Modal Synth (Eastern Mediterranean modal texture)
      this.modalSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth4" as const },
        envelope: { attack: 0.06, decay: 0.28, sustain: 0.5, release: 0.4 }
      }).connect(this.modalPanner);
      this.modalSynth.volume.value = -7;

      this.isInitialized = true;
      return true;
    } catch (err) {
      console.error("AudioEngine initialization failed:", err);
      return false;
    }
  }

  /**
   * Triggers an instrument note with precise spatial routing.
   * Dedicated channel routing prevents any panning collisions.
   */
  public triggerNote(
    note: string,
    durationSec = 0.5,
    velocity = 0.7,
    pan = 0.0,
    instrument = "sine_pad"
  ) {
    if (!this.isInitialized || this.isMuted) return;

    try {
      if (instrument === "crystalline_chime_bell" && this.chimeSynth) {
        this.chimeSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      } else if (instrument === "warm_cello_synth" && this.celloSynth) {
        this.celloSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      } else if (instrument === "marimba_pluck" && this.pluckSynth) {
        this.pluckSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      } else if (instrument === "glass_pad" && this.glassSynth) {
        this.glassSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      } else if (instrument === "modal_synth" && this.modalSynth) {
        this.modalSynth.triggerAttackRelease(note, durationSec, undefined, velocity);
      } else {
        // Ambient sine pad routed by spatial longitude
        if (pan < -0.3 && this.padSynthWest) {
          this.padSynthWest.triggerAttackRelease(note, durationSec, undefined, velocity);
        } else if (pan > 0.3 && this.padSynthEast) {
          this.padSynthEast.triggerAttackRelease(note, durationSec, undefined, velocity);
        } else if (this.padSynthCenter) {
          this.padSynthCenter.triggerAttackRelease(note, durationSec, undefined, velocity);
        }
      }
    } catch (e) {
      // Ignore transient polyphony warnings
    }
  }

  /**
   * Speech Ducking: Ducks music volume to 35% when speech narrator speaks.
   * Completely decoupled from Mute Gain: Ducking cannot unmute audio when muted!
   */
  public duckAudio(duck: boolean) {
    this.isDucked = duck;
    if (!this.duckGain) return;
    const targetGain = duck ? 0.35 : 1.0;
    this.duckGain.gain.rampTo(targetGain, 0.15);
  }

  /**
   * Mute Toggle: Strictly controls Mute Gain in series.
   * Mute always wins: gain is 0 when muted, regardless of ducking state.
   */
  public toggleMute(explicit?: boolean): boolean {
    this.isMuted = explicit !== undefined ? explicit : !this.isMuted;
    if (this.muteGain) {
      this.muteGain.gain.value = this.isMuted ? 0.0 : 1.0;
    }
    return this.isMuted;
  }

  public getMuteStatus(): boolean {
    return this.isMuted;
  }

  /**
   * Returns real-time FFT frequency bin values from Tone.Analyser (0 to -100 dBFS).
   */
  public getSpectrumData(): Float32Array {
    if (!this.analyser) return new Float32Array(16);
    const val = this.analyser.getValue();
    if (val instanceof Float32Array) {
      return val;
    } else if (Array.isArray(val)) {
      if (val[0] instanceof Float32Array) {
        return val[0];
      }
      return new Float32Array(val as unknown as number[]);
    }
    return new Float32Array(16);
  }

  public stopAll() {
    this.padSynthCenter?.releaseAll();
    this.padSynthWest?.releaseAll();
    this.padSynthEast?.releaseAll();
    this.chimeSynth?.releaseAll();
    this.celloSynth?.releaseAll();
    this.pluckSynth?.releaseAll();
    this.glassSynth?.releaseAll();
    this.modalSynth?.releaseAll();
  }
}

export const audioEngine = new SoniEarthAudioEngine();
