"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { SatelliteStage } from "@/components/SatelliteStage";
import { AcousticStage } from "@/components/AcousticStage";
import { MasterController } from "@/components/MasterController";
import { DatasetShelf } from "@/components/DatasetShelf";
import { ExplainPanel } from "@/components/ExplainPanel";
import { AccessibilityFooter } from "@/components/AccessibilityFooter";
import { FrameFeature, DatasetFeatureCollection } from "@/types";
import { audioEngine } from "@/lib/audioEngine";
import { speechNarrator } from "@/lib/speechNarrator";

// --- 1. Mode A: Annual Evolution (2012–2023) Harmonic Progression in C Lydian ---
const ANNUAL_HARMONIES: Record<number, { root: string; fifth: string; scaleName: string }> = {
  2012: { root: "C3", fifth: "G3", scaleName: "C Major Lydian (2012 Baseline)" },
  2013: { root: "D3", fifth: "A3", scaleName: "C Major Lydian (2013 Expansion)" },
  2014: { root: "E3", fifth: "B3", scaleName: "C Major Lydian (2014 Expansion)" },
  2015: { root: "G3", fifth: "D4", scaleName: "C Major Lydian (2015 Expansion)" },
  2016: { root: "A3", fifth: "E4", scaleName: "C Major Lydian (2016 Mid-Decade)" },
  2017: { root: "C4", fifth: "G4", scaleName: "C Major Lydian (2017 Expansion)" },
  2018: { root: "D4", fifth: "A4", scaleName: "C Major Lydian (2018 Expansion)" },
  2019: { root: "E4", fifth: "B4", scaleName: "C Major Lydian (2019 Pre-Pandemic)" },
  2020: { root: "F#4", fifth: "C#5", scaleName: "C Lydian Shift (2020 Global Transition)" },
  2021: { root: "G4", fifth: "D5", scaleName: "C Major Lydian (2021 Recovery)" },
  2022: { root: "A4", fifth: "E5", scaleName: "C Major Lydian (2022 Electrification)" },
  2023: { root: "C5", fifth: "G5", scaleName: "C Major Lydian (2023 Peak Radiance)" },
};

// --- 2. Mode C: Regional Zoom Exploration Profiles ---
const REGIONAL_PROFILES: Record<string, { scaleName: string; instrumentName: string; root: string }> = {
  India: {
    scaleName: "E Mixolydian (Raag Desh - Electrification)",
    instrumentName: "Snappy Marimba Pluck",
    root: "E4",
  },
  Ukraine: {
    scaleName: "A Natural Minor (Blackout Corridors)",
    instrumentName: "Solemn Bowed Cello",
    root: "A2",
  },
  "Western Europe": {
    scaleName: "G Lydian (Continental LED Grid)",
    instrumentName: "Ambient Glass Pad",
    root: "G4",
  },
  "Eastern Mediterranean": {
    scaleName: "D Phrygian Dominant (Maqam Hijaz)",
    instrumentName: "Evocative Modal Synth",
    root: "D3",
  },
};

// --- Note to Frequency Mapping ---
const FREQ_MAP: Record<string, number> = {
  D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, "C#3": 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, "F#3": 185.0, G3: 196.0, "G#3": 207.65, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, "C#4": 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, "F#4": 369.99, G4: 392.0, "G#4": 415.3, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, "C#5": 554.37, D5: 587.33, E5: 659.25, "F#5": 739.99, G5: 783.99, A5: 880.0, B5: 987.77,
  C6: 1046.5,
};

export default function Home() {
  const [featureData, setFeatureData] = useState<DatasetFeatureCollection | null>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<"annual" | "change" | "regional">("annual");
  const [activeDataset, setActiveDataset] = useState<string>("night-lights");
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeNote, setActiveNote] = useState<string>("C3");
  const [activeFreq, setActiveFreq] = useState<number>(130.81);
  const [activeScaleName, setActiveScaleName] = useState<string>("C Major Lydian (2012 Baseline)");
  const [activeInstrument, setActiveInstrument] = useState<string>("Ambient Sine Pad (Annual Series)");
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>(
    "SoniEarth initialized. Press Space to play."
  );

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load Feature Data on Mount
  useEffect(() => {
    fetch("/datasets/night-lights/features.json")
      .then((res) => res.json())
      .then((data: DatasetFeatureCollection) => {
        setFeatureData(data);
      })
      .catch((err) => console.error("Failed to load dataset features:", err));
  }, []);

  // Filter frames according to active mode
  const getFilteredFrames = useCallback(() => {
    if (!featureData?.frames) return [];
    if (currentMode === "annual") {
      return featureData.frames.filter((f) => f.phase === "annual_series");
    } else if (currentMode === "change") {
      return featureData.frames.filter(
        (f) => f.phase === "change_transition" || f.phase === "global_change"
      );
    } else {
      return featureData.frames.filter((f) => f.phase === "regional_zoom");
    }
  }, [featureData, currentMode]);

  const activeFrames = getFilteredFrames();
  const currentFeature: FrameFeature | null =
    activeFrames[currentFrameIndex] || featureData?.frames[0] || null;

  // 2. Play Sound for Current Frame with Multi-Scale & Mode Logic
  const playFrameSound = useCallback(
    async (feat: FrameFeature) => {
      await audioEngine.initialize();

      // ==========================================
      // MODE A: ANNUAL EVOLUTION (2012–2023)
      // ==========================================
      if (currentMode === "annual") {
        const yr = feat.year || 2012;
        const harmony = ANNUAL_HARMONIES[yr] || ANNUAL_HARMONIES[2012];

        setActiveNote(harmony.root);
        setActiveFreq(FREQ_MAP[harmony.root] || 130.81);
        setActiveScaleName(harmony.scaleName);
        setActiveInstrument("Ambient Sine Pad + Spatial Arp");

        // Baseline global root & fifth (Center)
        audioEngine.triggerNote(harmony.root, 0.75, 0.65, 0.0, "sine_pad");
        audioEngine.triggerNote(harmony.fifth, 0.6, 0.45, 0.0, "sine_pad");

        // Spatial Grid Arpeggiations across stereo channels
        if (feat.spatialGrid && feat.spatialGrid.length >= 3) {
          // West (Americas: Pan -0.8)
          const westNote = feat.spatialGrid[0]?.activeNote || harmony.root;
          setTimeout(() => {
            audioEngine.triggerNote(westNote, 0.45, 0.5, -0.8, "sine_pad");
          }, 60);

          // Center (Europe/Africa: Pan 0.0)
          const centerNote = feat.spatialGrid[1]?.activeNote || harmony.fifth;
          setTimeout(() => {
            audioEngine.triggerNote(centerNote, 0.45, 0.5, 0.0, "sine_pad");
          }, 120);

          // East (Asia/Oceania: Pan +0.8)
          const eastNote = feat.spatialGrid[2]?.activeNote || harmony.root;
          setTimeout(() => {
            audioEngine.triggerNote(eastNote, 0.45, 0.55, 0.8, "sine_pad");
          }, 180);
        }
      }

      // ==========================================
      // MODE B: DECADAL CHANGE MAP (D Dorian / A Minor Dual Polarity)
      // ==========================================
      else if (currentMode === "change") {
        setActiveNote("D3");
        setActiveFreq(FREQ_MAP["D3"]);
        setActiveScaleName("D Dorian / A Minor (Decadal Polarity)");
        setActiveInstrument("Dual Polarity: Crystalline Chimes & Cello");

        // D Dorian low sustained baseline
        audioEngine.triggerNote("D3", 0.7, 0.55, 0.0, "sine_pad");

        // Purple Electrification Motif (Ascending Crystalline Chimes panned Right)
        if (feat.changeClassification && feat.changeClassification.increaseRatio > 0.008) {
          audioEngine.triggerNote("A4", 0.35, 0.85, 0.6, "crystalline_chime_bell");
          setTimeout(() => {
            audioEngine.triggerNote("C5", 0.4, 0.9, 0.7, "crystalline_chime_bell");
          }, 120);
          setTimeout(() => {
            audioEngine.triggerNote("E5", 0.45, 0.95, 0.8, "crystalline_chime_bell");
          }, 240);
        }

        // Orange Blackout / Reduction Motif (Descending Warm Cello panned Left)
        if (feat.changeClassification && feat.changeClassification.decreaseRatio > 0.001) {
          audioEngine.triggerNote("E3", 0.6, 0.75, -0.6, "warm_cello_synth");
          setTimeout(() => {
            audioEngine.triggerNote("D3", 0.7, 0.8, -0.7, "warm_cello_synth");
          }, 150);
          setTimeout(() => {
            audioEngine.triggerNote("A2", 0.8, 0.85, -0.8, "warm_cello_synth");
          }, 300);
        }
      }

      // ==========================================
      // MODE C: REGIONAL ZOOM EXPLORATION (Authentic Regional Scales)
      // ==========================================
      else {
        const region = feat.regionFocus || "India";
        const profile = REGIONAL_PROFILES[region] || REGIONAL_PROFILES["India"];

        setActiveNote(profile.root);
        setActiveFreq(FREQ_MAP[profile.root] || 220.0);
        setActiveScaleName(profile.scaleName);
        setActiveInstrument(profile.instrumentName);

        if (region === "India") {
          // India: E Mixolydian (Raag Desh) fast plucks representing electrification boom
          audioEngine.triggerNote("E4", 0.3, 0.9, 0.4, "marimba_pluck");
          setTimeout(() => {
            audioEngine.triggerNote("G#4", 0.3, 0.85, 0.6, "marimba_pluck");
          }, 100);
          setTimeout(() => {
            audioEngine.triggerNote("B4", 0.35, 0.9, 0.7, "marimba_pluck");
          }, 200);
        } else if (region === "Ukraine") {
          // Ukraine: A Natural Minor solemn descending cello
          audioEngine.triggerNote("E3", 0.65, 0.8, -0.5, "warm_cello_synth");
          setTimeout(() => {
            audioEngine.triggerNote("C3", 0.75, 0.85, -0.6, "warm_cello_synth");
          }, 180);
          setTimeout(() => {
            audioEngine.triggerNote("A2", 0.85, 0.9, -0.7, "warm_cello_synth");
          }, 360);
        } else if (region === "Western Europe") {
          // Western Europe: G Lydian ambient glass pad chord
          audioEngine.triggerNote("G4", 0.8, 0.7, 0.0, "glass_pad");
          audioEngine.triggerNote("D4", 0.8, 0.6, -0.3, "glass_pad");
          audioEngine.triggerNote("F#4", 0.8, 0.65, 0.3, "glass_pad");
        } else {
          // Eastern Mediterranean: D Phrygian Dominant (Maqam Hijaz) modal texture
          audioEngine.triggerNote("D3", 0.6, 0.8, 0.2, "modal_synth");
          setTimeout(() => {
            audioEngine.triggerNote("Eb3", 0.6, 0.85, 0.4, "modal_synth");
          }, 130);
          setTimeout(() => {
            audioEngine.triggerNote("F#3", 0.7, 0.85, 0.3, "modal_synth");
          }, 260);
        }
      }
    },
    [currentMode]
  );

  // 3. Playback Loop
  useEffect(() => {
    if (isPlaying && activeFrames.length > 0) {
      const stepDuration = 800 / playbackSpeed;

      playbackTimerRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => {
          const nextIdx = (prev + 1) % activeFrames.length;
          const nextFeat = activeFrames[nextIdx];
          if (nextFeat) {
            playFrameSound(nextFeat);
            if (nextFeat.year) {
              setAriaAnnouncement(`Year ${nextFeat.year}. Playing ${activeScaleName}.`);
            } else if (nextFeat.regionFocus !== "global") {
              setAriaAnnouncement(`Zoom: ${nextFeat.regionFocus}. Tuned to ${activeScaleName}.`);
            }
          }
          return nextIdx;
        });
      }, stepDuration);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      audioEngine.stopAll();
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, activeFrames, playbackSpeed, playFrameSound, activeScaleName]);

  // 4. Toggle Playback
  const handleTogglePlay = async () => {
    await audioEngine.initialize();
    const willPlay = !isPlaying;
    setIsPlaying(willPlay);
    if (willPlay && currentFeature) {
      playFrameSound(currentFeature);
      speechNarrator.speak("Playback started. Experiencing NASA Decadal Night Lights.");
      setAriaAnnouncement("Playback started.");
    } else {
      speechNarrator.speak("Playback paused.");
      setAriaAnnouncement("Playback paused.");
    }
  };

  // 5. Mode Switching
  const handleSelectMode = (mode: "annual" | "change" | "regional") => {
    setCurrentMode(mode);
    setCurrentFrameIndex(0);
    const modeNames = {
      annual: "Mode A: Annual Evolution (2012 to 2023) in C Major Lydian",
      change: "Mode B: Decadal Change Map in D Dorian & A Minor",
      regional: "Mode C: Regional Zoom Exploration with Authentic Regional Scales",
    };
    speechNarrator.speak(`Switched to ${modeNames[mode]}`);
    setAriaAnnouncement(`Switched to ${modeNames[mode]}`);
  };

  // 6. Dataset Switching
  const handleSelectDataset = (id: string) => {
    setActiveDataset(id);
    const dsNames: Record<string, string> = {
      "night-lights": "Decadal Night Lights",
      "ocean-currents": "Sea Surface Currents",
      "iss-lightning": "ISS Lightning Events",
      "dyamond-co2": "DYAMOND Global Carbon Dioxide",
    };
    const title = dsNames[id] || id;
    speechNarrator.speak(`Selected ${title}.`);
    setAriaAnnouncement(`Selected ${title}.`);
  };

  // 7. Keyboard Navigation (Accessibility Requirement)
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
        setCurrentFrameIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentFrameIndex((prev) => (prev + 1) % activeFrames.length);
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
    <div className="flex flex-col min-h-screen bg-cosmos-obsidian text-slate-100">
      {/* 1. Header */}
      <Header
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(speechNarrator.toggle())}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(audioEngine.toggleMute())}
      />

      {/* Main Single-Page Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
        {/* 2. Main Stage Split View (Satellite on Left, Acoustic Frequency on Right) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SatelliteStage
            currentFeature={currentFeature}
            currentFrameIndex={currentFrameIndex}
            totalFrames={activeFrames.length}
            isPlaying={isPlaying}
          />
          <AcousticStage
            currentFeature={currentFeature}
            isPlaying={isPlaying}
            activeNote={activeNote}
            activeFreq={activeFreq}
            activeScaleName={activeScaleName}
            activeInstrument={activeInstrument}
          />
        </section>

        {/* 3. Master Playback Deck */}
        <section>
          <MasterController
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onPrev={() => setCurrentFrameIndex((prev) => Math.max(0, prev - 1))}
            onNext={() => setCurrentFrameIndex((prev) => (prev + 1) % activeFrames.length)}
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={(s) => setPlaybackSpeed(s)}
          />
        </section>

        {/* 4. "Why am I hearing this?" Explainability Panel */}
        <section>
          <ExplainPanel
            currentFeature={currentFeature}
            activeNote={activeNote}
            activeScaleName={activeScaleName}
          />
        </section>

        {/* 5. Dataset Playlist Shelf */}
        <section className="pt-2">
          <DatasetShelf
            selectedDataset={activeDataset}
            onSelectDataset={handleSelectDataset}
          />
        </section>
      </main>

      {/* 6. Sticky Accessibility Footer */}
      <AccessibilityFooter ariaAnnouncement={ariaAnnouncement} />
    </div>
  );
}
