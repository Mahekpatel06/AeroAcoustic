/**
 * audioEngine.ts
 * Real-time browser audio synthesis powered by Tone.js & Web Audio API.
 * SoniSphere Audio Engine — Studio Mastered for Crystal-Clear Planetary Sonification.
 * 
 * Features:
 * - Anti-Clipping Master Bus: Gentle Soft-Knee Compressor + Limiter (-1.0 dBFS) + 11 kHz Anti-Aliasing Filter
 * - Natural Acoustic Envelopes: Smooth crossfades, zero voice-stealing pops, zero harsh distortion
 * - Filtered Pure Timbres: Warm sine, mellow cello lowpass, wooden marimba, celestial bell chimes
 * - Synchronous isReady() checks: Zero async Promise overhead on animation frames
 * - 4 Dedicated Dataset Pipelines: Decadal Night Lights, ECCO2 Ocean Currents, ISS Lightning, DYAMOND CO2
 */
import * as Tone from "tone";

class SoniSphereAudioEngine {
  private isInitialized = false;
  private isMuted = false;
  private isDucked = false;
  private isDroneActive = false;
  private isOceanDroneActive = false;

  // Master Gain Stage
  private masterBusFilter: Tone.Filter | null = null;
  private masterCompressor: Tone.Compressor | null = null;
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

  // Dedicated Synthesizers (Calibrated with gentle acoustic filtering)
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

  // DYAMOND Global CO2 Atmospheric Synthesizers
  private isCO2AtmosphereActive = false;
  private co2Panner: Tone.Panner | null = null;
  private co2FilterNode: Tone.Filter | null = null;
  private co2DroneSynth: Tone.PolySynth | null = null;
  private co2PlumeSynth: Tone.PolySynth | null = null;
  private co2WindNode: Tone.Noise | null = null;
  private co2WindFilter: Tone.AutoFilter | null = null;

  public isReady(): boolean {
    return this.isInitialized && Tone.context.state === "running";
  }

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
      // duckGain -> muteGain -> masterCompressor -> masterBusFilter -> masterLimiter -> Tone.Destination & analyser
      Tone.Destination.volume.value = 0.0; // Full standard master volume for clear laptop speaker output

      // Master 12 kHz gentle lowpass filter eliminates high-frequency digital aliasing/harshness
      this.masterBusFilter = new Tone.Filter(12000, "lowpass", -12).toDestination();

      // Master Limiter strictly prevents any clipping above -0.2 dBFS
      this.masterLimiter = new Tone.Limiter(-0.2).connect(this.masterBusFilter);

      // Soft-knee master compressor for warm analog glue without distortion
      this.masterCompressor = new Tone.Compressor({
        threshold: -12.0,
        ratio: 2.2,
        attack: 0.03,
        release: 0.25,
      }).connect(this.masterLimiter);

      this.analyser = new Tone.Analyser("fft", 32);
      this.masterLimiter.connect(this.analyser);

      // Mute Gain (always wins)
      this.muteGain = new Tone.Gain(this.isMuted ? 0.0 : 1.0).connect(this.masterCompressor);

      // Duck Gain (automated for speech narration)
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

      // 1. Ambient Baseline Pad Synths (Warm, silky sine waves with gentle attack/release)
      const padConfig = {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.25, decay: 0.5, sustain: 0.75, release: 0.9 }
      };
      this.padSynthCenter = new Tone.PolySynth(Tone.Synth, padConfig).connect(this.centerPanner);
      this.padSynthCenter.maxPolyphony = 8;
      this.padSynthCenter.volume.value = -9.5;

      this.padSynthWest = new Tone.PolySynth(Tone.Synth, padConfig).connect(this.westPanner);
      this.padSynthWest.maxPolyphony = 8;
      this.padSynthWest.volume.value = -9.5;

      this.padSynthEast = new Tone.PolySynth(Tone.Synth, padConfig).connect(this.eastPanner);
      this.padSynthEast.maxPolyphony = 8;
      this.padSynthEast.volume.value = -9.5;

      // 2. Crystalline Chimes (Sweet glass bell for Purple electrification increase, filtered at 2800 Hz)
      const chimeFilter = new Tone.Filter(2800, "lowpass", -12).connect(this.chimePanner);
      this.chimeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.025, decay: 0.45, sustain: 0.08, release: 0.75 }
      }).connect(chimeFilter);
      this.chimeSynth.maxPolyphony = 8;
      this.chimeSynth.volume.value = -10.5;

      // 3. Warm Cello Synth (Filtered triangle for Orange decrease, filtered at 680 Hz)
      const celloFilter = new Tone.Filter(680, "lowpass", -12).connect(this.celloPanner);
      this.celloSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" as const },
        envelope: { attack: 0.22, decay: 0.55, sustain: 0.65, release: 0.85 }
      }).connect(celloFilter);
      this.celloSynth.maxPolyphony = 8;
      this.celloSynth.volume.value = -9.5;

      // 4. Snappy Marimba Pluck (Warm wooden tone for India rural electrification, filtered at 1300 Hz)
      const pluckFilter = new Tone.Filter(1300, "lowpass", -12).connect(this.pluckPanner);
      this.pluckSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" as const },
        envelope: { attack: 0.015, decay: 0.35, sustain: 0.05, release: 0.45 }
      }).connect(pluckFilter);
      this.pluckSynth.maxPolyphony = 8;
      this.pluckSynth.volume.value = -8.5;

      // 5. Crystal Glass Pad (Western Europe LED grid - silky sine)
      this.glassSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.28, decay: 0.60, sustain: 0.70, release: 0.95 }
      }).connect(this.glassPanner);
      this.glassSynth.maxPolyphony = 8;
      this.glassSynth.volume.value = -10.5;

      // 6. Modal Synth (Eastern Mediterranean - Warm triangle through 850 Hz filter)
      const modalFilter = new Tone.Filter(850, "lowpass", -12).connect(this.modalPanner);
      this.modalSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" as const },
        envelope: { attack: 0.15, decay: 0.45, sustain: 0.60, release: 0.75 }
      }).connect(modalFilter);
      this.modalSynth.maxPolyphony = 8;
      this.modalSynth.volume.value = -10.0;

      // 7. ISS Lightning Dynamic Spatial Panner
      this.lightningPanner = new Tone.Panner(0.0).connect(this.duckGain);

      // 8. ISS Lightning Strike Synth (Pure celestial chime through 3200 Hz filter - zero clipping)
      const lightningFilter = new Tone.Filter(3200, "lowpass", -12).connect(this.lightningPanner);
      this.lightningStrikeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.015, decay: 0.35, sustain: 0.04, release: 0.60 }
      }).connect(lightningFilter);
      this.lightningStrikeSynth.maxPolyphony = 8;
      this.lightningStrikeSynth.volume.value = -9.0;

      // 9. 55 Hz Ambient Orbital Drone Synth (Pure Sine Wave on A1 - velvety space hum, zero distortion)
      this.subDroneSynth = new Tone.Synth({
        oscillator: { type: "sine" as const },
        envelope: { attack: 1.8, decay: 0.6, sustain: 1.0, release: 2.0 }
      }).connect(this.centerPanner);
      this.subDroneSynth.volume.value = -16.0;

      // 10. Ocean Currents Spatial Panner
      this.oceanPanner = new Tone.Panner(0.0).connect(this.duckGain);

      // 11. Ocean Cello Synth (Velvet Acoustic Bowed Cello for Cold Currents)
      this.oceanCelloFilter = new Tone.Filter(320, "lowpass", -12).connect(this.oceanPanner);
      this.oceanCelloSynth = new Tone.MonoSynth({
        oscillator: { type: "sine" as const },
        filter: { Q: 0.4, type: "lowpass" as const, rolloff: -12 },
        envelope: { attack: 0.75, decay: 1.5, sustain: 0.70, release: 2.5 },
        filterEnvelope: { attack: 0.5, decay: 1.0, sustain: 0.70, baseFrequency: 140, octaves: 0.8 }
      }).connect(this.oceanCelloFilter);
      this.oceanCelloSynth.volume.value = -10.5;

      // 12. Ocean String Swell (Warm Sunlit Waters: Silky, Soft, Ambient Harmonic Pad)
      this.oceanStringFilter = new Tone.Filter(480, "lowpass", -12).connect(this.oceanPanner);
      this.oceanStringSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 1.0, decay: 1.8, sustain: 0.75, release: 2.8 }
      }).connect(this.oceanStringFilter);
      this.oceanStringSynth.maxPolyphony = 8;
      this.oceanStringSynth.volume.value = -11.0;

      // 13. Ocean Ripple Arpeggiator (Subtle Fluid Resonance)
      this.oceanRippleSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.12, decay: 0.38, sustain: 0.08, release: 0.75 }
      }).connect(this.oceanPanner);
      this.oceanRippleSynth.maxPolyphony = 8;
      this.oceanRippleSynth.volume.value = -17.0;

      // 14. Ocean Hydrophone Fluid Wave Swell (Whisper-soft Organic Brown Noise with Gentle 0.06 Hz Tidal Breathing)
      this.oceanFilterNode = new Tone.AutoFilter({
        frequency: 0.06,
        type: "sine",
        depth: 0.50,
        baseFrequency: 200,
        octaves: 1.2,
        filter: {
          type: "lowpass",
          rolloff: -12,
          Q: 0.5
        }
      }).connect(this.oceanPanner);
      this.oceanFilterNode.start();

      this.oceanNoiseNode = new Tone.Noise("brown").connect(this.oceanFilterNode);
      this.oceanNoiseNode.volume.value = -28.0;

      // 15. Infrasonic Abyssal Depth Sub-Drone (Pure Velvet Sine down to 40 Hz at deep levels)
      this.oceanDepthDrone = new Tone.Synth({
        oscillator: { type: "sine" as const },
        envelope: { attack: 2.0, decay: 1.0, sustain: 1.0, release: 2.5 }
      }).connect(this.oceanPanner);
      this.oceanDepthDrone.volume.value = -18.0;

      // 16. DYAMOND Global CO2 Spatial Panner & Dynamics
      this.co2Panner = new Tone.Panner(0.0).connect(this.duckGain);
      this.co2FilterNode = new Tone.Filter(350, "lowpass", -12).connect(this.co2Panner);

      // 17. Atmospheric Greenhouse Baseline Pad Synth (Silky Warm Sine Pad)
      this.co2DroneSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.60, decay: 1.0, sustain: 0.70, release: 1.6 }
      }).connect(this.co2FilterNode);
      this.co2DroneSynth.maxPolyphony = 8;
      this.co2DroneSynth.volume.value = -11.0;

      // 18. Plume Burst Alert Chimes (Sweet Crystal Sine Bells)
      const co2ChimeFilter = new Tone.Filter(2600, "lowpass", -12).connect(this.co2Panner);
      this.co2PlumeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" as const },
        envelope: { attack: 0.025, decay: 0.45, sustain: 0.05, release: 0.65 }
      }).connect(co2ChimeFilter);
      this.co2PlumeSynth.maxPolyphony = 8;
      this.co2PlumeSynth.volume.value = -12.5;

      // 19. Global Circulation Jetstream Wind Sweep (Subtle Pink Noise whisper)
      this.co2WindFilter = new Tone.AutoFilter({
        frequency: 0.04,
        type: "sine",
        depth: 0.35,
        baseFrequency: 160,
        octaves: 1.0,
        filter: {
          type: "bandpass",
          rolloff: -12,
          Q: 0.8
        }
      }).connect(this.co2Panner);
      this.co2WindFilter.start();

      this.co2WindNode = new Tone.Noise("pink").connect(this.co2WindFilter);
      this.co2WindNode.volume.value = -30.0;

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
    velocity = 0.6,
    pan = 0.0,
    instrument = "sine_pad"
  ) {
    if (!this.isInitialized || this.isMuted) return;

    try {
      const safeVelocity = Math.max(0.2, Math.min(0.85, velocity));
      if (instrument === "crystalline_chime_bell" && this.chimeSynth) {
        this.chimeSynth.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
      } else if (instrument === "warm_cello_synth" && this.celloSynth) {
        this.celloSynth.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
      } else if (instrument === "marimba_pluck" && this.pluckSynth) {
        this.pluckSynth.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
      } else if (instrument === "glass_pad" && this.glassSynth) {
        this.glassSynth.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
      } else if (instrument === "modal_synth" && this.modalSynth) {
        this.modalSynth.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
      } else {
        // Ambient sine pad routed by spatial longitude
        if (pan < -0.3 && this.padSynthWest) {
          this.padSynthWest.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
        } else if (pan > 0.3 && this.padSynthEast) {
          this.padSynthEast.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
        } else if (this.padSynthCenter) {
          this.padSynthCenter.triggerAttackRelease(note, durationSec, undefined, safeVelocity);
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
   * Starts the organic ocean hydrophone wave ambience (subtle tidal swell).
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
  public triggerLightningStrike(note: string, velocity = 0.60, pan = 0.0) {
    if (!this.isInitialized || this.isMuted || !this.lightningStrikeSynth) return;
    try {
      if (this.lightningPanner) {
        this.lightningPanner.pan.rampTo(Math.max(-1.0, Math.min(1.0, pan)), 0.03);
      }
      const safeVelocity = Math.max(0.3, Math.min(0.85, velocity));
      this.lightningStrikeSynth.triggerAttackRelease(note, 0.35, undefined, safeVelocity);
    } catch (e) {
      // Ignore transient polyphony warnings
    }
  }

  /**
   * Sets the ocean thermocline depth level (0m to 1000m).
   */
  public setOceanDepth(depthMeters: number) {
    this.oceanDepthMeters = Math.max(0, Math.min(1000, depthMeters));
    const depthRatio = this.oceanDepthMeters / 1000.0;

    // Smooth filter frequency modulation preserving acoustic presence
    if (this.oceanStringFilter) {
      const targetCutoff = 480 * (1 - depthRatio * 0.65) + 160;
      this.oceanStringFilter.frequency.rampTo(targetCutoff, 0.25);
    }
    if (this.oceanCelloFilter) {
      const targetCutoff = 320 * (1 - depthRatio * 0.55) + 130;
      this.oceanCelloFilter.frequency.rampTo(targetCutoff, 0.25);
    }

    // Infrasonic Abyssal Drone (down to 40 Hz at 1000m with soft velvet warmth)
    if (this.oceanDepthDrone) {
      if (this.oceanDepthMeters > 50) {
        const targetHz = Math.round((65.0 - depthRatio * 25.0) * 10) / 10;
        const targetVol = -26 + depthRatio * 8; // Gentle ramp to -18 dB max
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
      this.oceanPanner.pan.rampTo(Math.max(-0.75, Math.min(0.75, pan)), 0.35);
    }
  }

  public getOceanBasin(): string {
    return this.oceanBasinId;
  }

  /**
   * Triggers sea surface currents sonification based on water temperature and velocity.
   */
  public triggerOceanCurrent(note: string, sstCelsius: number, pan = 0.0, velocity = 0.45) {
    if (!this.isInitialized || this.isMuted) return;
    try {
      if (this.oceanPanner) {
        this.oceanPanner.pan.rampTo(Math.max(-0.75, Math.min(0.75, pan)), 0.25);
      }

      // Depth-adjusted temperature and pitch (thermocline gradient)
      const depthFactor = Math.exp(-this.oceanDepthMeters / 350.0);
      const effectiveSST = sstCelsius * depthFactor + 2.0;

      let effectiveNote = note;
      if (this.oceanDepthMeters >= 800) {
        effectiveNote = "D2";
      } else if (this.oceanDepthMeters >= 450) {
        effectiveNote = "A2";
      }

      const safeVel = Math.max(0.25, Math.min(0.80, velocity));
      if (effectiveSST < 16.0 || this.oceanDepthMeters > 300) {
        this.oceanCelloSynth?.triggerAttackRelease(effectiveNote, 2.8, undefined, safeVel);
      } else {
        this.oceanStringSynth?.triggerAttackRelease(effectiveNote, 3.0, undefined, safeVel * 0.88);
      }
    } catch (e) {
      // Ignore transient polyphony warnings
    }
  }

  /**
   * Smoothly modulates continuous hydrodynamic flow parameters in real time.
   */
  public updateOceanCurrentDynamics(velocityKnots: number, sstCelsius: number, pan: number) {
    if (!this.isInitialized || this.isMuted) return;
    try {
      if (this.oceanPanner) {
        this.oceanPanner.pan.rampTo(Math.max(-0.75, Math.min(0.75, pan)), 0.35);
      }
      if (this.oceanNoiseNode) {
        const velNormalized = Math.min(1.0, Math.max(0.0, (velocityKnots - 1.0) / 4.5));
        const targetVol = -38.0 + velNormalized * 4.0;
        this.oceanNoiseNode.volume.rampTo(targetVol, 0.4);
      }
    } catch (e) {}
  }

  /**
   * Triggers oceanic fluid ripple arpeggiator accents.
   */
  public triggerOceanRipple(note: string, pan = 0.0, velocity = 0.4) {
    if (!this.isInitialized || this.isMuted || this.oceanDepthMeters > 200 || !this.oceanRippleSynth) return;
    try {
      this.oceanRippleSynth.triggerAttackRelease(note, 0.4, undefined, Math.min(0.5, velocity));
    } catch (e) {}
  }

  /**
   * Starts ambient planetary atmospheric circulation wind for DYAMOND CO2.
   */
  public startCO2Atmosphere() {
    if (!this.isInitialized || this.isMuted) return;
    try {
      if (this.co2WindNode && this.co2WindNode.state !== "started") {
        this.co2WindNode.start();
        this.co2WindNode.volume.rampTo(-38, 1.5);
      }
      this.isCO2AtmosphereActive = true;
    } catch (e) {}
  }

  /**
   * Stops ambient atmospheric circulation wind for DYAMOND CO2.
   */
  public stopCO2Atmosphere() {
    try {
      if (this.co2WindNode && this.co2WindNode.state === "started") {
        this.co2WindNode.volume.rampTo(-60, 0.5);
        setTimeout(() => {
          try {
            if (this.co2WindNode && !this.isCO2AtmosphereActive) {
              this.co2WindNode.stop();
            }
          } catch (e) {}
        }, 550);
      }
      this.isCO2AtmosphereActive = false;
      this.co2DroneSynth?.releaseAll();
      this.co2PlumeSynth?.releaseAll();
    } catch (e) {}
  }

  /**
   * Continuously tracks and modulates atmospheric spatial panning and filter resonance.
   */
  public updateCO2Dynamics(pan: number, tensionScore: number) {
    if (!this.isInitialized || this.isMuted) return;
    try {
      if (this.co2Panner) {
        this.co2Panner.pan.rampTo(Math.max(-0.85, Math.min(0.85, pan)), 0.25);
      }
      if (this.co2FilterNode) {
        const targetCutoff = 240 + Math.min(1.0, Math.max(0.0, tensionScore)) * 960;
        this.co2FilterNode.frequency.rampTo(targetCutoff, 0.30);
      }
    } catch (e) {}
  }

  /**
   * Triggers DYAMOND Global CO2 greenhouse atmospheric pad sound.
   */
  public triggerCO2Atmosphere(
    note: string,
    ppm: number,
    tensionScore: number,
    pan = 0.0,
    velocity = 0.42
  ) {
    if (!this.isInitialized || this.isMuted) return;
    try {
      if (this.co2Panner) {
        this.co2Panner.pan.rampTo(Math.max(-0.85, Math.min(0.85, pan)), 0.35);
      }
      if (this.co2FilterNode) {
        const targetCutoff = 240 + Math.min(1.0, Math.max(0.0, tensionScore)) * 960;
        this.co2FilterNode.frequency.rampTo(targetCutoff, 0.45);
      }
      const safeVel = Math.max(0.25, Math.min(0.80, velocity));
      this.co2DroneSynth?.triggerAttackRelease(note, 1.8, undefined, safeVel);
    } catch (e) {}
  }

  /**
   * Triggers high-emission plume burst alert chime.
   */
  public triggerCO2PlumeBurst(note: string, pan = 0.0, velocity = 0.50) {
    if (!this.isInitialized || this.isMuted || !this.co2PlumeSynth) return;
    try {
      if (this.co2Panner) {
        this.co2Panner.pan.rampTo(Math.max(-0.85, Math.min(0.85, pan)), 0.15);
      }
      let chimeNote = note;
      if (note.includes("2")) chimeNote = note.replace("2", "4");
      else if (note.includes("3")) chimeNote = note.replace("3", "5");
      else if (note.includes("4")) chimeNote = note.replace("4", "5");
      const safeVel = Math.max(0.25, Math.min(0.80, velocity));
      this.co2PlumeSynth.triggerAttackRelease(chimeNote, 0.45, undefined, safeVel);
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
    this.stopCO2Atmosphere();
    this.co2DroneSynth?.releaseAll();
    this.co2PlumeSynth?.releaseAll();
    if (this.isOceanDepthDroneActive && this.oceanDepthDrone) {
      this.oceanDepthDrone.triggerRelease();
      this.isOceanDepthDroneActive = false;
    }
  }
}

export const audioEngine = new SoniSphereAudioEngine();
