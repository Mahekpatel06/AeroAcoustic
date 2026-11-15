"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { LandingPage } from "@/components/LandingPage";
import { SatelliteStage } from "@/components/SatelliteStage";
import { AcousticStage } from "@/components/AcousticStage";
import { MasterController } from "@/components/MasterController";
import { DatasetShelf } from "@/components/DatasetShelf";
import { ExplainPanel } from "@/components/ExplainPanel";
import { AccessibilityFooter } from "@/components/AccessibilityFooter";
import { FrameFeature, DatasetFeatureCollection } from "@/types";
import { audioEngine } from "@/lib/audioEngine";
import { speechNarrator } from "@/lib/speechNarrator";

// --- C Major Pentatonic Scale Across Octaves 3, 4, 5 ---
const PENTATONIC_SCALE = [
  { note: "C3", freq: 130.81 },
  { note: "D3", freq: 146.83 },
  { note: "E3", freq: 164.81 },
  { note: "G3", freq: 196.00 },
  { note: "A3", freq: 220.00 },
  { note: "C4", freq: 261.63 },
  { note: "D4", freq: 293.66 },
  { note: "E4", freq: 329.63 },
  { note: "G4", freq: 392.00 },
  { note: "A4", freq: 440.00 },
  { note: "C5", freq: 523.25 },
];

// --- Mode C: Authentic Regional Profiles ---
const REGIONAL_PROFILES: Record<string, { scaleName: string; instrumentName: string; defaultNote: string; freq: number; pan: number; frameIndex: number }> = {
  India: {
    scaleName: "E Mixolydian (Raag Desh - Rural Electrification)",
    instrumentName: "Snappy Marimba Pluck",
    defaultNote: "E4",
    freq: 329.63,
    pan: 0.5,
    frameIndex: 780,
  },
  Ukraine: {
    scaleName: "A Natural Minor (Blackout Corridors)",
    instrumentName: "Solemn Bowed Cello",
    defaultNote: "A2",
    freq: 110.0,
    pan: -0.3,
    frameIndex: 910,
  },
  "Western Europe": {
    scaleName: "G Lydian (Continental LED Grid)",
    instrumentName: "Ambient Glass Pad",
    defaultNote: "G4",
    freq: 392.0,
    pan: -0.5,
    frameIndex: 1040,
  },
  "Eastern Mediterranean": {
    scaleName: "D Phrygian Dominant (Maqam Hijaz)",
    instrumentName: "Evocative Modal Synth",
    defaultNote: "D3",
    freq: 146.83,
    pan: 0.15,
    frameIndex: 1180,
  },
  "Overview (All Insets)": {
    scaleName: "Poly-Regional Composite Scale",
    instrumentName: "Spatial Multi-Instrument Array",
    defaultNote: "C4",
    freq: 261.63,
    pan: 0.0,
    frameIndex: 720,
  }
};

const FREQ_MAP: Record<string, number> = {
  D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, "C#3": 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, "F#3": 185.0, G3: 196.0, "G#3": 207.65, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, "C#4": 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, "F#4": 369.99, G4: 392.0, "G#4": 415.3, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, "C#5": 554.37, D5: 587.33, E5: 659.25, "F#5": 739.99, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51,
};

// Mode durations in seconds
const MODE_DURATIONS = {
  annual: 12.0,
  change: 12.0,
  regional: 10.0,
};

/**
 * Derives root note and fifth harmony directly from measured global radiance & delta.
 * Calibrated precisely to the 11-year satellite radiance expansion.
 */
function deriveAnnualHarmony(meanBrightness: number, delta: number) {
  const norm = Math.max(0.0, Math.min(1.0, (meanBrightness - 0.0522) / (0.0531 - 0.0522)));
  const rootIdx = Math.round(norm * (PENTATONIC_SCALE.length - 1));
  const root = PENTATONIC_SCALE[rootIdx] || PENTATONIC_SCALE[0];
  const intervalShift = delta >= 0 ? 3 : 2;
  const fifthIdx = Math.min(PENTATONIC_SCALE.length - 1, rootIdx + intervalShift);
  const fifth = PENTATONIC_SCALE[fifthIdx] || PENTATONIC_SCALE[3];
  return { root, fifth, norm };
}

export default function Home() {
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [featureData, setFeatureData] = useState<DatasetFeatureCollection | null>(null);
  const [currentMode, setCurrentMode] = useState<"annual" | "change" | "regional">("annual");
  const [currentTime, setCurrentTime] = useState<number>(0.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("India");
  const [activeDataset, setActiveDataset] = useState<string>("night-lights");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false); // Start voice off by default
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeNote, setActiveNote] = useState<string>("A3");
  const [activeFreq, setActiveFreq] = useState<number>(220.0);
  const [activeScaleName, setActiveScaleName] = useState<string>("C Major Lydian / Pentatonic");
  const [activeInstrument, setActiveInstrument] = useState<string>("Ambient Sine Pad (Annual Series)");
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>(
    "SoniEarth initialized. Press Space to play."
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const playbackSpeedRef = useRef<number>(1.0);
  const currentTimeRef = useRef<number>(0.0);
  const currentModeRef = useRef<"annual" | "change" | "regional">("annual");
  const lastTimeRef = useRef<number | null>(null);

  // Audio trigger tracking refs to prevent re-trigger chatter
  const lastEvaluatedSecondRef = useRef<number>(-1);
  const lastChimeTriggerRef = useRef<number>(-1);
  const lastCelloTriggerRef = useRef<number>(-1);
  const lastDroneTriggerRef = useRef<number>(-1);
  const lastRegionalTriggerRef = useRef<number>(-1);
  const lastStrikeTimestampRef = useRef<number>(0);

  const activeDatasetRef = useRef<string>("night-lights");

  // Sync refs with state
  isPlayingRef.current = isPlaying;
  playbackSpeedRef.current = playbackSpeed;
  currentTimeRef.current = currentTime;
  currentModeRef.current = currentMode;
  activeDatasetRef.current = activeDataset;

  // 1. Load Feature Data on Mount or Dataset Switch
  useEffect(() => {
    const jsonUrl =
      activeDataset === "iss-lightning"
        ? "/datasets/iss-lightning/features.json"
        : "/datasets/night-lights/features.json";

    fetch(jsonUrl)
      .then((res) => res.json())
      .then((data: DatasetFeatureCollection) => {
        setFeatureData(data);
        if (activeDataset === "iss-lightning") {
          setActiveNote("A1");
          setActiveFreq(55.0);
          setActiveScaleName("A1 Sub-Bass (55Hz) + High FM Chimes");
          setActiveInstrument("FM Glockenspiel & 55Hz Orbital Drone");
        } else {
          setActiveNote("A3");
          setActiveFreq(220.0);
          setActiveScaleName("C Major Lydian / Pentatonic");
          setActiveInstrument("Ambient Sine Pad (Annual Series)");
        }
      })
      .catch((err) => console.error("Failed to load dataset features:", err));
  }, [activeDataset]);

  // Filter frames strictly belonging to the currently selected mode
  const modeFrames = useMemo(() => {
    if (!featureData?.frames) return [];
    if (activeDataset === "iss-lightning") {
      return featureData.frames;
    }
    if (currentMode === "annual") {
      return featureData.frames.filter((f) => f.phase === "annual_series");
    } else if (currentMode === "change") {
      return featureData.frames.filter(
        (f) => f.phase === "global_change" || f.phase === "change_transition"
      );
    } else {
      return featureData.frames.filter((f) => f.phase === "regional_zoom");
    }
  }, [featureData, currentMode, activeDataset]);

  // Current active frame feature derived strictly from active mode and time
  const currentFeature: FrameFeature | null = useMemo(() => {
    if (!featureData?.frames || featureData.frames.length === 0) return null;

    if (activeDataset === "iss-lightning") {
      const lightningDuration = featureData.durationSeconds || 216.7;
      const idx = Math.min(
        featureData.frames.length - 1,
        Math.floor((currentTime / lightningDuration) * featureData.frames.length)
      );
      return featureData.frames[idx] || featureData.frames[0];
    }

    if (modeFrames.length === 0) return featureData.frames[0] || null;

    if (currentMode === "annual") {
      const yearIdx = Math.min(modeFrames.length - 1, Math.floor(currentTime));
      return modeFrames[yearIdx] || modeFrames[0];
    } else if (currentMode === "change") {
      const frameIdx = Math.min(
        modeFrames.length - 1,
        Math.floor((currentTime / MODE_DURATIONS.change) * modeFrames.length)
      );
      return modeFrames[frameIdx] || modeFrames[0];
    } else {
      const regionalMatch = modeFrames.find((f) => f.regionFocus === selectedRegion);
      return regionalMatch || modeFrames[0];
    }
  }, [activeDataset, featureData, modeFrames, currentMode, currentTime, selectedRegion]);

  // 2. Play Sound for Current Mode with Dedicated Sonification (Strictly when isPlaying is true)
  const playModeSound = useCallback(
    async (timeSec: number, forceInstant = false) => {
      // Never trigger sound if playback is stopped
      if (!isPlayingRef.current && !forceInstant) return;
      await audioEngine.initialize();

      // ==========================================
      // ISS LIGHTNING SONIFICATION PIPELINE
      // ==========================================
      if (activeDatasetRef.current === "iss-lightning") {
        if (!featureData?.frames || featureData.frames.length === 0) return;

        const lightningDuration = featureData.durationSeconds || 216.7;
        const frameIdx = Math.min(
          featureData.frames.length - 1,
          Math.floor((timeSec / lightningDuration) * featureData.frames.length)
        );
        const feat = featureData.frames[frameIdx];

        if (feat && feat.isStrike) {
          const nowMs = Date.now();
          if (nowMs - lastStrikeTimestampRef.current >= 180 || forceInstant) {
            lastStrikeTimestampRef.current = nowMs;

            const strikeNote = feat.activeNote || "E5";
            const strikeFreq = feat.frequencyHz || 659.25;
            const strikePan = feat.strikePan || 0.0;
            const strikeEnergy = feat.strikeEnergyMicroJoules || 450;

            setActiveNote(strikeNote);
            setActiveFreq(strikeFreq);
            setActiveInstrument(`FM Lightning Chime (${strikeEnergy} µJ)`);

            // Dynamically scale strike velocity based on calibrated optical flash energy (0.65 to 1.0)
            const normEnergy = Math.min(1.0, Math.max(0.0, (strikeEnergy - 180) / 1320));
            const strikeVelocity = 0.65 + 0.35 * normEnergy;

            // Trigger FM metallic chime attack with spatial stereo panning
            audioEngine.triggerLightningStrike(strikeNote, strikeVelocity, strikePan);

            // Deaf-Blind Accessibility: Web Vibration API 80ms pulse
            if (typeof navigator !== "undefined" && navigator.vibrate) {
              try {
                navigator.vibrate(80);
              } catch (e) {
                // Ignore mobile restrictions
              }
            }
          }
        }
        return;
      }

      const mode = currentModeRef.current;

      // ==========================================
      // MODE A: ANNUAL EVOLUTION (2012–2023)
      // ==========================================
      if (mode === "annual") {
        const yearIdx = Math.floor(timeSec) % 12;
        if (forceInstant || yearIdx !== lastEvaluatedSecondRef.current) {
          lastEvaluatedSecondRef.current = yearIdx;

          const feat = modeFrames[yearIdx] || modeFrames[0];
          if (!feat) return;

          const { root, fifth, norm } = deriveAnnualHarmony(
            feat.globalMeanBrightness,
            feat.temporalDelta
          );

          setActiveNote(root.note);
          setActiveFreq(root.freq);
          setActiveScaleName(`C Major Lydian / Pentatonic (Luma ${(feat.globalMeanBrightness * 100).toFixed(2)}%)`);
          setActiveInstrument("Sine Pad + 3-Zone Longitudinal Sweep");

          const velocity = Math.min(0.9, Math.max(0.5, 0.6 + 0.3 * norm));

          // Sustained root and fifth harmonic chord
          audioEngine.triggerNote(root.note, 0.9, velocity, 0.0, "sine_pad");
          setTimeout(() => {
            audioEngine.triggerNote(fifth.note, 0.8, velocity * 0.85, 0.0, "sine_pad");
          }, 60);

          // Spatial Stereo Accents locked to laser sweep:
          setTimeout(() => {
            const westCell = feat.spatialGrid?.find((c) => c.pan < -0.3);
            const westNote = westCell?.activeNote || root.note;
            audioEngine.triggerNote(westNote, 0.45, velocity * 0.75, -0.75, "sine_pad");
          }, 150);

          setTimeout(() => {
            const centerCell = feat.spatialGrid?.find((c) => Math.abs(c.pan) < 0.2);
            const centerNote = centerCell?.activeNote || fifth.note;
            audioEngine.triggerNote(centerNote, 0.45, velocity * 0.75, 0.0, "sine_pad");
          }, 450);

          setTimeout(() => {
            const eastCell = feat.spatialGrid?.find((c) => c.pan > 0.3);
            const eastNote = eastCell?.activeNote || root.note;
            audioEngine.triggerNote(eastNote, 0.45, velocity * 0.75, 0.75, "sine_pad");
          }, 750);
        }
      }

      // ==========================================
      // MODE B: DECADAL CHANGE MAP (Purple & Orange Polarity - Caldwell 73 Spatial Scan)
      // ==========================================
      else if (mode === "change") {
        setActiveScaleName("D Dorian & A Minor (Decadal Polarity)");
        setActiveInstrument("Longitudinal Scanner: Cello (Orange) & Chimes (Purple)");

        // 1. D Dorian Ground Drone (Planetary Baseline every 2.4s)
        const droneSlot = Math.floor(timeSec / 2.4);
        if (forceInstant || droneSlot !== lastDroneTriggerRef.current) {
          lastDroneTriggerRef.current = droneSlot;
          audioEngine.triggerNote("D3", 1.8, 0.55, 0.0, "sine_pad");
          setActiveNote("D3");
          setActiveFreq(FREQ_MAP["D3"]);
        }

        // 2. West Channel Sweep (Americas & Atlantic: t = 1.0s to 3.8s)
        if (timeSec >= 1.2 && timeSec < 3.8) {
          const westSlot = Math.floor(timeSec / 1.2);
          if (forceInstant || westSlot !== lastRegionalTriggerRef.current) {
            lastRegionalTriggerRef.current = westSlot;
            audioEngine.triggerNote("G3", 0.6, 0.65, -0.65, "glass_pad");
            setActiveNote("G3");
            setActiveFreq(FREQ_MAP["G3"]);
          }
        }

        // 3. Center Channel Sweep (Orange Blackout Corridors: Ukraine, Syria, Levant: t = 4.8s to 7.4s)
        // Passes longitude 20E to 45E directly over the war blackout corridors
        if (timeSec >= 4.8 && timeSec < 7.4) {
          const celloSlot = Math.floor(timeSec / 1.1);
          if (forceInstant || celloSlot !== lastCelloTriggerRef.current) {
            lastCelloTriggerRef.current = celloSlot;
            audioEngine.triggerNote("A2", 0.9, 0.9, -0.3, "warm_cello_synth");
            setTimeout(() => {
              audioEngine.triggerNote("E3", 0.8, 0.85, -0.2, "warm_cello_synth");
            }, 180);
            setActiveNote("A2");
            setActiveFreq(FREQ_MAP["A2"]);
          }
        }

        // 4. East Channel Sweep (Purple Electrification Corridors: South Asia, India, East Asia: t = 7.8s to 11.5s)
        // Passes longitude 70E to 125E directly over India's rural electrification & East Asian expansion
        if (timeSec >= 7.8 && timeSec <= 11.5) {
          const chimeSlot = Math.floor(timeSec / 0.85);
          if (forceInstant || chimeSlot !== lastChimeTriggerRef.current) {
            lastChimeTriggerRef.current = chimeSlot;
            audioEngine.triggerNote("A4", 0.45, 0.9, 0.65, "crystalline_chime_bell");
            setTimeout(() => {
              audioEngine.triggerNote("C5", 0.4, 0.95, 0.75, "crystalline_chime_bell");
            }, 140);
            setActiveNote("C5");
            setActiveFreq(FREQ_MAP["C5"]);
          }
        }
      }

      // ==========================================
      // MODE C: REGIONAL INSETS (Cultural Scales & Physical Instruments)
      // ==========================================
      else {
        const profile = REGIONAL_PROFILES[selectedRegion] || REGIONAL_PROFILES["India"];

        setActiveNote(profile.defaultNote);
        setActiveFreq(profile.freq);
        setActiveScaleName(profile.scaleName);
        setActiveInstrument(profile.instrumentName);

        const regionSlot = Math.floor(timeSec / 1.8);
        if (forceInstant || regionSlot !== lastRegionalTriggerRef.current) {
          lastRegionalTriggerRef.current = regionSlot;

          if (selectedRegion === "India") {
            audioEngine.triggerNote("E4", 0.4, 0.85, profile.pan, "marimba_pluck");
            setTimeout(() => {
              audioEngine.triggerNote("B4", 0.45, 0.9, profile.pan + 0.1, "marimba_pluck");
            }, 160);
          } else if (selectedRegion === "Ukraine") {
            audioEngine.triggerNote("E3", 0.75, 0.8, profile.pan, "warm_cello_synth");
            setTimeout(() => {
              audioEngine.triggerNote("A2", 0.9, 0.85, profile.pan - 0.1, "warm_cello_synth");
            }, 220);
          } else if (selectedRegion === "Western Europe") {
            audioEngine.triggerNote("G4", 0.9, 0.75, profile.pan, "glass_pad");
            setTimeout(() => {
              audioEngine.triggerNote("D4", 0.85, 0.7, profile.pan - 0.1, "glass_pad");
            }, 200);
          } else if (selectedRegion === "Eastern Mediterranean") {
            audioEngine.triggerNote("D3", 0.7, 0.8, profile.pan, "modal_synth");
            setTimeout(() => {
              audioEngine.triggerNote("F#3", 0.75, 0.85, profile.pan + 0.1, "modal_synth");
            }, 180);
          } else {
            audioEngine.triggerNote("C4", 0.8, 0.75, 0.0, "sine_pad");
          }
        }
      }
    },
    [modeFrames, selectedRegion]
  );

  // 3. Central Animation & Repeat Loop (Driven by High-Precision Master Frame Clock)
  useEffect(() => {
    let animId: number;

    const clockLoop = (timestamp: number) => {
      if (isPlayingRef.current) {
        if (lastTimeRef.current === null) {
          lastTimeRef.current = timestamp;
        }
        const deltaSec = (timestamp - lastTimeRef.current) / 1000;
        lastTimeRef.current = timestamp;

        // Cap deltaSec between 0.0s and 0.1s to avoid huge time jumps when switching tabs
        const safeDelta = Math.min(0.1, Math.max(0.0, deltaSec));
        const maxDuration =
          activeDatasetRef.current === "iss-lightning"
            ? (featureData?.durationSeconds || 216.7)
            : MODE_DURATIONS[currentModeRef.current];

        // MASTER CLOCK: For ISS Lightning, lock directly to hardware video presentation timestamp (PTS)
        // For Night Lights modes, increment smoothly at 60 FPS (zero video buffering freeze)
        let nextTime: number;

        if (
          activeDatasetRef.current === "iss-lightning" &&
          videoRef.current &&
          !videoRef.current.paused &&
          !videoRef.current.seeking &&
          videoRef.current.readyState >= 2
        ) {
          // Absolute hardware video presentation timestamp lock (0ms drift audio-visual parallelism)
          nextTime = videoRef.current.currentTime;
        } else {
          nextTime = currentTimeRef.current + safeDelta * playbackSpeedRef.current;

          // Soft Video Synchronization with 100% local WebM chunks
          if (videoRef.current && !videoRef.current.seeking) {
            const currentVidTime = videoRef.current.currentTime;
            if (Math.abs(currentVidTime - nextTime) > 0.35) {
              videoRef.current.currentTime = nextTime;
            }
          }
        }

        // Loop strictly within this mode chunk on repeat!
        if (nextTime >= maxDuration) {
          nextTime = 0.0;
          if (videoRef.current) {
            videoRef.current.currentTime = 0.0;
            if (isPlayingRef.current) {
              videoRef.current.play().catch(() => {});
            }
          }
        }

        currentTimeRef.current = nextTime;
        setCurrentTime(nextTime);

        // Drive real-time sonification
        playModeSound(nextTime);
      } else {
        lastTimeRef.current = null;
      }

      animId = requestAnimationFrame(clockLoop);
    };

    animId = requestAnimationFrame(clockLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [playModeSound]);

  // 4. Toggle Playback (Spacebar or Play Button)
  const handleTogglePlay = async () => {
    await audioEngine.initialize();
    const willPlay = !isPlaying;
    setIsPlaying(willPlay);
    isPlayingRef.current = willPlay;

    if (willPlay) {
      if (videoRef.current) {
        videoRef.current.playbackRate = playbackSpeed;
        videoRef.current.play().catch(() => {});
      }
      if (activeDatasetRef.current === "iss-lightning") {
        audioEngine.startOrbitalDrone();
      }
      playModeSound(currentTimeRef.current, true);
      const modeTitles = {
        annual: "Mode A: Annual Evolution (2012 to 2023)",
        change: "Mode B: Decadal Change Map",
        regional: `Mode C: Regional Insets (${selectedRegion})`,
      };
      const title =
        activeDatasetRef.current === "iss-lightning"
          ? "ISS Lightning Events (NASA SVS #5011)"
          : modeTitles[currentMode];
      if (voiceEnabled) {
        speechNarrator.speak(`Playing ${title} on repeat.`);
      }
      setAriaAnnouncement(`Playing ${title} on repeat.`);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      audioEngine.stopAll();
      if (voiceEnabled) {
        speechNarrator.speak("Playback paused.");
      }
      setAriaAnnouncement("Playback paused.");
    }
  };

  // 5. Explicit Mode Switching (Never auto-starts sound if paused!)
  const handleSelectMode = (mode: "annual" | "change" | "regional") => {
    setCurrentMode(mode);
    currentModeRef.current = mode;
    setCurrentTime(0.0);
    currentTimeRef.current = 0.0;

    // Reset trigger trackers
    lastEvaluatedSecondRef.current = -1;
    lastChimeTriggerRef.current = -1;
    lastCelloTriggerRef.current = -1;
    lastDroneTriggerRef.current = -1;
    lastRegionalTriggerRef.current = -1;

    if (videoRef.current) {
      videoRef.current.currentTime = 0.0;
      if (isPlayingRef.current) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }

    // Only play sound if actively playing!
    if (isPlayingRef.current) {
      playModeSound(0.0, true);
    } else {
      audioEngine.stopAll();
    }

    const modeDescriptions = {
      annual: "Mode A: Annual Evolution timeline on repeat (2012 to 2023).",
      change: "Mode B: Decadal Change Map on repeat with chimes and cello.",
      regional: "Mode C: Regional Insets on repeat with cultural scales.",
    };
    if (voiceEnabled) {
      speechNarrator.speak(`Switched to ${modeDescriptions[mode]}`);
    }
    setAriaAnnouncement(`Switched to ${modeDescriptions[mode]}`);
  };

  // 6. Regional Selection (Mode C) - Decoupled from annual timeline
  const handleSelectRegion = (regName: string) => {
    setSelectedRegion(regName);
    setCurrentMode("regional");
    currentModeRef.current = "regional";
    setCurrentTime(0.0);
    currentTimeRef.current = 0.0;

    // Reset regional triggers
    lastRegionalTriggerRef.current = -1;

    if (videoRef.current) {
      videoRef.current.currentTime = 0.0;
      if (isPlayingRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }

    if (isPlayingRef.current) {
      playModeSound(0.0, true);
    }
    if (voiceEnabled) {
      speechNarrator.speak(`Targeting ${regName}.`);
    }
  };

  // 7. Prev / Next Step (Steps through current mode)
  const handlePrev = () => {
    const maxDur =
      activeDatasetRef.current === "iss-lightning" ? (featureData?.durationSeconds || 216.7) : MODE_DURATIONS[currentMode];
    let nextT = currentTimeRef.current - 1.0;
    if (nextT < 0) nextT = maxDur - 1.0;
    setCurrentTime(nextT);
    currentTimeRef.current = nextT;
    if (videoRef.current) videoRef.current.currentTime = nextT;
    if (isPlayingRef.current) {
      playModeSound(nextT, true);
    }
  };

  const handleNext = () => {
    const maxDur =
      activeDatasetRef.current === "iss-lightning" ? (featureData?.durationSeconds || 216.7) : MODE_DURATIONS[currentMode];
    let nextT = (currentTimeRef.current + 1.0) % maxDur;
    setCurrentTime(nextT);
    currentTimeRef.current = nextT;
    if (videoRef.current) videoRef.current.currentTime = nextT;
    if (isPlayingRef.current) {
      playModeSound(nextT, true);
    }
  };

  // 7b. Interactive Seek Handler for Timeline Progress Scrubber
  const handleSeek = (targetSec: number) => {
    const maxDur =
      activeDatasetRef.current === "iss-lightning" ? (featureData?.durationSeconds || 216.7) : MODE_DURATIONS[currentMode];
    const clamped = Math.max(0, Math.min(maxDur, targetSec));
    setCurrentTime(clamped);
    currentTimeRef.current = clamped;
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
    if (isPlayingRef.current) {
      playModeSound(clamped, true);
    }
  };

  // 8. Speed Selection
  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    playbackSpeedRef.current = speed;
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // 9. Dataset Switching
  const handleSelectDataset = (id: string) => {
    if (id === activeDataset) return;
    audioEngine.stopAll();

    if (id === "night-lights") {
      audioEngine.stopOrbitalDrone();
      setActiveDataset(id);
      activeDatasetRef.current = id;
      setCurrentTime(0.0);
      currentTimeRef.current = 0.0;
      lastEvaluatedSecondRef.current = -1;
      if (videoRef.current) videoRef.current.currentTime = 0.0;
      if (voiceEnabled) speechNarrator.speak("Decadal Night Lights active.");
      setAriaAnnouncement("Decadal Night Lights active (NASA SVS #5313). Press Space to play.");
    } else if (id === "iss-lightning") {
      setActiveDataset(id);
      activeDatasetRef.current = id;
      setCurrentTime(0.0);
      currentTimeRef.current = 0.0;
      lastEvaluatedSecondRef.current = -1;
      if (videoRef.current) videoRef.current.currentTime = 0.0;
      if (isPlayingRef.current) {
        audioEngine.startOrbitalDrone();
      }
      if (voiceEnabled) speechNarrator.speak("ISS Lightning Events active.");
      setAriaAnnouncement("ISS Lightning Events active (NASA SVS #5011). Press Space to play.");
    } else {
      const titles: Record<string, string> = {
        "ocean-currents": "Sea Surface Currents",
        "dyamond-co2": "DYAMOND Global CO2",
      };
      const title = titles[id] || id;
      if (voiceEnabled) speechNarrator.speak(`${title} is scheduled for Phase 2.`);
      setAriaAnnouncement(`${title} is scheduled for Phase 2.`);
    }
  };

  // 10. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === "1") {
        handleSelectDataset("night-lights");
      } else if (e.key === "2") {
        handleSelectDataset("ocean-currents");
      } else if (e.key === "3") {
        handleSelectDataset("iss-lightning");
      } else if (e.key === "4") {
        handleSelectDataset("dyamond-co2");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key.toLowerCase() === "v") {
        const status = speechNarrator.toggle();
        setVoiceEnabled(status);
        setAriaAnnouncement(status ? "Voice narration enabled" : "Voice narration muted");
      } else if (e.key.toLowerCase() === "m") {
        const muted = audioEngine.toggleMute();
        setIsMuted(muted);
        setAriaAnnouncement(muted ? "Audio muted" : "Audio unmuted");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-slate-100">
      {!hasEntered ? (
        <LandingPage onEnter={() => setHasEntered(true)} />
      ) : (
        <>
      {/* 1. Header */}
      <Header
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(speechNarrator.toggle())}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(audioEngine.toggleMute())}
        onGoHome={() => setHasEntered(false)}
      />

      {/* Main Workspace - Ultra-Responsive Viewport Optimized Layout */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-2.5 sm:p-3 md:p-4 flex flex-col gap-3 sm:gap-4">
        {/* Top Split: Left 70% (Cinematic Video Stage + Attached Controller), Right 30% (Acoustic Stage + Explain Panel) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-start">
          {/* Left Column: 70% Width (col-span-8 in 12-col grid) */}
          <div className="lg:col-span-8 flex flex-col gap-2.5 sm:gap-3">
            <SatelliteStage
              currentDataset={activeDataset}
              currentFeature={currentFeature}
              currentTime={currentTime}
              currentMode={currentMode}
              selectedRegion={selectedRegion}
              isPlaying={isPlaying}
              onSelectRegion={handleSelectRegion}
              onSeek={handleSeek}
              videoRef={videoRef}
            />

            {/* Seamless Attached Master Controller directly beneath the video */}
            <MasterController
              currentDataset={activeDataset}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onPrev={handlePrev}
              onNext={handleNext}
              currentMode={currentMode}
              onSelectMode={handleSelectMode}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={handleChangeSpeed}
              loopMode={true}
              onToggleLoopMode={() => {}}
            />
          </div>

          {/* Right Column: 30% Width (col-span-4) - Stacked Acoustic Telemetry + Explainability */}
          <div className="lg:col-span-4 flex flex-col gap-2.5 sm:gap-3">
            <AcousticStage
              currentDataset={activeDataset}
              currentFeature={currentFeature}
              isPlaying={isPlaying}
              activeNote={activeNote}
              activeFreq={activeFreq}
              activeScaleName={activeScaleName}
              activeInstrument={activeInstrument}
            />

            <ExplainPanel
              currentDataset={activeDataset}
              currentFeature={currentFeature}
              activeNote={activeNote}
              activeScaleName={activeScaleName}
            />
          </div>
        </section>

        {/* Bottom Shelf: Dataset Playlist Shelf (Full Width) */}
        <section className="pt-1">
          <DatasetShelf
            selectedDataset={activeDataset}
            onSelectDataset={handleSelectDataset}
          />
        </section>
      </main>

      {/* 6. Sticky Accessibility Footer */}
      <AccessibilityFooter ariaAnnouncement={ariaAnnouncement} />
        </>
      )}
    </div>
  );
}
