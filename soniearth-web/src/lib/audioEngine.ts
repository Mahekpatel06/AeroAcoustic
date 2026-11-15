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
  private isDroneActive = false;
  private isOceanDroneActive = false;

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
  private lightningPanner: Tone.Panner | null = null;
  private oceanPanner: Tone.Panner | null = null;

  // Dedicated Synthesizers
  private padSynthCenter: Tone.PolySynth | null = null;
  private padSynthWest: Tone.PolySynth | null = null;
  private padSynthEast: Tone.PolySynth | null = null;
  private chimeSynth: Tone.PolySynth | null = null;
  private celloSynth: Tone.PolySynth | null = null;
  private pluckSynth: Tone.PolySynth | null = null;
  private glassSynth: Tone.PolySynth | null = null;
  private modalSynth: Tone.PolySynth | null = null;
  private lightningStrikeSynth: Tone.PolySynth | null = null;
  private subDroneSynth: Tone.Synth | null = null;
  private oceanCelloSynth: Tone.MonoSynth | null = null;
  private oceanStringSynth: Tone.PolySynth | null = null;
  private oceanRippleSynth: Tone.PolySynth | null = null;
  private oceanNoiseNode: Tone.Noise | null = null;
  private oceanFilterNode: Tone.AutoFilter | null = null;
  private oceanCelloFilter: Tone.Filter | null = null;
  private oceanStringFilter: Tone.Filter | null = null;
  private oceanDepthMeters: number = 0;
  private oceanDepthDrone: Tone.Synth | null = null;
  private isOceanDepthDroneActive = false;
  private oceanBasinId: string = "ALL";

  public async initialize(): Promise<boolean> {
    try {
      if (Tone.context.state !== "running") {
        await Tone.start();
        await Tone.context.resume();
      }
    } catch (e) {
      // Ignore
    }

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

      // 7. ISS Lightning Dynamic Spatial Panner
      this.lightningPanner = new Tone.Panner(0.0).connect(this.duckGain);

      // 8. ISS Lightning Strike Synth (High-register metallic FM bell chime)
      this.lightningStrikeSynth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3.5,
        modulationIndex: 3.8,
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.005, decay: 0.28, sustain: 0.05, release: 0.35 },
        modulationEnvelope: { attack: 0.005, decay: 0.2, sustain: 0.02, release: 0.3 }
      }).connect(this.lightningPanner);
      this.lightningStrikeSynth.volume.value = -3;

      // 9. 55 Hz Ambient Orbital Drone Synth (Low-frequency space station atmosphere on A1)
      this.subDroneSynth = new Tone.Synth({
        oscillator: { type: "triangle" as const },
        envelope: { attack: 1.2, decay: 0.5, sustain: 1.0, release: 1.5 }
      }).connect(this.centerPanner);
      this.subDroneSynth.volume.value = -14;

      // 10. Ocean Currents Spatial Panner
      this.oceanPanner = new Tone.Panner(0.0).connect(this.duckGain);

      // 11. Ocean Cello Synth (Cold Polar Waters: Velvet Warmth with 2nd/3rd Harmonics for Laptop Speaker Clarity)
      this.oceanCelloFilter = new Tone.Filter(480, "lowpass", -12).connect(this.oceanPanner);
      this.oceanCelloSynth = new Tone.MonoSynth({
        oscillator: { type: "triangle8" as const },
        filter: { Q: 0.8, type: "lowpass" as const, rolloff: -12 },
        envelope: { attack: 0.35, decay: 0.8, sustain: 0.85, release: 2.2 },
        filterEnvelope: { attack: 0.25, decay: 0.7, sustain: 0.75, baseFrequency: 240, octaves: 1.8 }
      }).connect(this.oceanCelloFilter);
      this.oceanCelloSynth.volume.value = -6.0;

      // 12. Ocean String Swell (Warm Waters: Silky Harmonic Pad with Full Mid-Range Presence)
      this.oceanStringFilter = new Tone.Filter(1100, "lowpass", -12).connect(this.oceanPanner);
      this.oceanStringSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" as const },
        envelope: { attack: 0.5, decay: 1.2, sustain: 0.85, release: 2.5 }
      }).connect(this.oceanStringFilter);
      this.oceanStringSynth.volume.value = -7.0;

      // 13. Ocean Ripple Arpeggiator (Liquid Streamline Droplets)
      this.oceanRippleSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.03, decay: 0.3, sustain: 0.1, release: 0.5 }
      }).connect(this.oceanPanner);
      this.oceanRippleSynth.volume.value = -13;

      // 14. Ocean Hydrophone Fluid Wave Swell (Bandpass-filtered Pink Noise for Organic Tidal Surf on Laptop Speakers)
      this.oceanFilterNode = new Tone.AutoFilter({
        frequency: 0.10,
        type: "sine",
        depth: 0.65,
        baseFrequency: 350,
        octaves: 2.2,
        filter: {
          type: "bandpass",
          rolloff: -12,
          Q: 0.8
        }
      }).connect(this.oceanPanner);
      this.oceanFilterNode.start();

      this.oceanNoiseNode = new Tone.Noise("pink").connect(this.oceanFilterNode);
      this.oceanNoiseNode.volume.value = -16;

      // 15. Infrasonic Abyssal Depth Sub-Drone (Reaches 40 Hz at 1000m with Harmonic Overtones)
      this.oceanDepthDrone = new Tone.Synth({
        oscillator: { type: "triangle" as const },
        envelope: { attack: 1.5, decay: 1.0, sustain: 1.0, release: 2.0 }
      }).connect(this.oceanPanner);
      this.oceanDepthDrone.volume.value = -20;

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

  /**
   * Starts the 55 Hz ambient orbital drone (A1) for ISS Lightning mode.
   */
  public startOrbitalDrone() {
    if (!this.isInitialized || this.isMuted || !this.subDroneSynth || this.isDroneActive) return;
    try {
      if (Tone.context.state !== "running") {
        Tone.context.resume();
      }
      this.subDroneSynth.triggerAttack("A1");
      this.isDroneActive = true;
    } catch (e) {
      // Ignore if already active
    }
  }

  /**
   * Stops the ambient orbital drone.
   */
  public stopOrbitalDrone() {
    if (!this.subDroneSynth) return;
    try {
      if (this.isDroneActive) {
        this.subDroneSynth.triggerRelease();
        this.isDroneActive = false;
      }
    } catch (e) {
      this.isDroneActive = false;
    }
  }

  /**
   * Starts the organic ocean hydrophone wave ambience (pink noise tidal swell).
   */
  public startOceanAmbience() {
    if (!this.isInitialized || this.isMuted || !this.oceanNoiseNode || this.isOceanDroneActive) return;
    try {
      if (Tone.context.state !== "running") {
        Tone.context.resume();
      }
      this.oceanNoiseNode.start();
      this.isOceanDroneActive = true;
    } catch (e) {
      // Ignore if already active
    }
  }

  /**
   * Stops the organic ocean hydrophone wave ambience.
   */
  public stopOceanAmbience() {
    if (!this.oceanNoiseNode) return;
    try {
      if (this.isOceanDroneActive) {
        this.oceanNoiseNode.stop();
        this.isOceanDroneActive = false;
      }
    } catch (e) {
      this.isOceanDroneActive = false;
    }
  }

  /**
   * Triggers a lightning strike chime with dynamic spatial stereo panning.
   */
  public triggerLightningStrike(note: string, velocity = 0.85, pan = 0.0) {
    if (!this.isInitialized || this.isMuted || !this.lightningStrikeSynth) return;
    try {
      if (this.lightningPanner) {
        this.lightningPanner.pan.rampTo(Math.max(-1.0, Math.min(1.0, pan)), 0.02);
      }
      this.lightningStrikeSynth.triggerAttackRelease(note, 0.35, undefined, velocity);
    } catch (e) {
      // Ignore transient polyphony warnings
    }
  }

  /**
   * Sets the ocean thermocline depth level (0m to 1000m).
   * Modulates harmonic filter cutoffs while preserving acoustic presence for laptop speakers,
   * and triggers the 40 Hz infrasonic abyssal sub-drone with overtone support at deep levels.
   */
  public setOceanDepth(depthMeters: number) {
    this.oceanDepthMeters = Math.max(0, Math.min(1000, depthMeters));
    const depthRatio = this.oceanDepthMeters / 1000.0;

    // Filter frequency modulation preserving laptop speaker presence
    if (this.oceanStringFilter) {
      const targetCutoff = 1100 * (1 - depthRatio * 0.75) + 260;
      this.oceanStringFilter.frequency.rampTo(targetCutoff, 0.25);
    }
    if (this.oceanCelloFilter) {
      const targetCutoff = 480 * (1 - depthRatio * 0.65) + 160;
      this.oceanCelloFilter.frequency.rampTo(targetCutoff, 0.25);
    }

    // Infrasonic Abyssal Drone (down to 40 Hz at 1000m with psychoacoustic harmonics)
    if (this.oceanDepthDrone) {
      if (this.oceanDepthMeters > 50) {
        // Interpolate pitch down to 40.0 Hz (D1/Eb1)
        const targetHz = Math.round((65.0 - depthRatio * 25.0) * 10) / 10;
        const targetVol = -20 + depthRatio * 10; // Ramps up to -10 dB
        this.oceanDepthDrone.volume.rampTo(targetVol, 0.25);

        if (!this.isOceanDepthDroneActive && Tone.context.state === "running") {
          try {
            this.oceanDepthDrone.triggerAttack(targetHz);
            this.isOceanDepthDroneActive = true;
          } catch (e) {}
        } else if (this.isOceanDepthDroneActive) {
          try {
            this.oceanDepthDrone.setNote(targetHz);
          } catch (e) {}
        }
      } else {
        if (this.isOceanDepthDroneActive) {
          this.oceanDepthDrone.triggerRelease();
          this.isOceanDepthDroneActive = false;
        }
      }
    }
  }

  public getOceanDepth(): number {
    return this.oceanDepthMeters;
  }

  public setOceanBasin(basinId: string, pan = 0.0) {
    this.oceanBasinId = basinId;
    if (this.oceanPanner) {
      this.oceanPanner.pan.rampTo(Math.max(-0.85, Math.min(0.85, pan)), 0.35);
    }
  }

  public getOceanBasin(): string {
    return this.oceanBasinId;
  }

  /**
   * Triggers sea surface currents sonification based on water temperature and velocity.
   * Mastered with warm harmonic saturation for rich clarity on internal laptop speakers
   * and lush sub-bass depth in headphones.
   * Supports thermocline depth layers (0m to 1000m) down to 40 Hz infrasound.
   */
  public triggerOceanCurrent(note: string, sstCelsius: number, pan = 0.0, velocity = 0.70) {
    if (!this.isInitialized || this.isMuted) return;
    try {
      if (this.oceanPanner) {
        this.oceanPanner.pan.rampTo(Math.max(-0.85, Math.min(0.85, pan)), 0.1);
      }

      // Depth-adjusted temperature and pitch (thermocline gradient)
      const depthFactor = Math.exp(-this.oceanDepthMeters / 350.0);
      const effectiveSST = sstCelsius * depthFactor + 2.0;

      let effectiveNote = note;
      if (this.oceanDepthMeters >= 800) {
        effectiveNote = "D2"; // Transposed to D2 (73.4 Hz) with rich harmonics so 40Hz sub-drone anchors infrasound
      } else if (this.oceanDepthMeters >= 450) {
        effectiveNote = "A2"; // 110 Hz Deep sub-bass with audible presence
      } else if (effectiveSST < 10.0) {
        effectiveNote = "D2"; // Polar cold cello
      } else if (effectiveSST < 18.0) {
        effectiveNote = "A2"; // Temperate
      }

      if (effectiveSST < 14.0 || this.oceanDepthMeters > 300) {
        // Cold polar waters or deep bathypelagic layers: rich velvet cello bass
        this.oceanCelloSynth?.triggerAttackRelease(effectiveNote, 2.2, undefined, velocity);
      } else {
        // Warm sunlit surface waters: silky warm harmonic string pad
        this.oceanStringSynth?.triggerAttackRelease(effectiveNote, 2.0, undefined, velocity * 0.9);
      }
    } catch (e) {
      // Ignore transient polyphony warnings
    }
  }

  /**
   * Triggers oceanic fluid ripple arpeggiator accents (soft liquid droplets).
   */
  public triggerOceanRipple(note: string, pan = 0.0, velocity = 0.5) {
    // Surface streamline plucks are silenced in the deep ocean below 200m
    if (!this.isInitialized || this.isMuted || this.oceanDepthMeters > 200 || !this.oceanRippleSynth) return;
    try {
      this.oceanRippleSynth.triggerAttackRelease(note, 0.4, undefined, velocity);
    } catch (e) {}
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
    this.lightningStrikeSynth?.releaseAll();
    this.oceanCelloSynth?.triggerRelease();
    this.oceanStringSynth?.releaseAll();
    this.oceanRippleSynth?.releaseAll();
    this.stopOrbitalDrone();
    this.stopOceanAmbience();
    if (this.isOceanDepthDroneActive && this.oceanDepthDrone) {
      this.oceanDepthDrone.triggerRelease();
      this.isOceanDepthDroneActive = false;
    }
  }
}

export const audioEngine = new SoniEarthAudioEngine();
