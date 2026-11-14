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
      return featureData.frames.filter((f) => f.phase === "change_transition" || f.phase === "global_change");
    } else {
      return featureData.frames.filter((f) => f.phase === "regional_zoom");
    }
  }, [featureData, currentMode]);

  const activeFrames = getFilteredFrames();
  const currentFeature: FrameFeature | null =
    activeFrames[currentFrameIndex] || featureData?.frames[0] || null;

  // 2. Play Sound for Current Frame
  const playFrameSound = useCallback(
    async (feat: FrameFeature) => {
      await audioEngine.initialize();

      // Determine root note from global luminance
      const rootNote = feat.spatialGrid[1]?.activeNote || "C3";
      setActiveNote(rootNote);

      const freqMap: Record<string, number> = {
        C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
        C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00, C5: 523.25
      };
      setActiveFreq(freqMap[rootNote] || 261.63);

      // Trigger baseline pad note
      audioEngine.triggerNote(rootNote, 0.7, 0.6 + feat.globalMeanBrightness * 0.3, 0.0, "sine_pad");

      // Trigger spatial notes (West and East)
      if (feat.spatialGrid[0]) {
        audioEngine.triggerNote(feat.spatialGrid[0].activeNote, 0.5, 0.4, -0.7, "sine_pad");
      }
      if (feat.spatialGrid[2]) {
        audioEngine.triggerNote(feat.spatialGrid[2].activeNote, 0.5, 0.4, 0.7, "sine_pad");
      }

      // Check for Purple Increase / Orange Decrease change motifs
      if (feat.changeClassification) {
        if (feat.changeClassification.increaseRatio > 0.01) {
          audioEngine.triggerNote("C4", 0.4, 0.8, 0.6, "crystalline_chime_bell");
          setTimeout(() => {
            audioEngine.triggerNote("G4", 0.5, 0.9, 0.7, "crystalline_chime_bell");
          }, 150);
        }
        if (feat.changeClassification.decreaseRatio > 0.01) {
          audioEngine.triggerNote("E3", 0.6, 0.7, -0.6, "warm_cello_synth");
          setTimeout(() => {
            audioEngine.triggerNote("C3", 0.7, 0.8, -0.7, "warm_cello_synth");
          }, 180);
        }
      }
    },
    []
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
              setAriaAnnouncement(`Year ${nextFeat.year}. Playing ${nextFeat.spatialGrid[1]?.activeNote || "note"}.`);
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
  }, [isPlaying, activeFrames, playbackSpeed, playFrameSound]);

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
      annual: "Mode A: Annual Evolution 2012 to 2023",
      change: "Mode B: Decadal Change Map",
      regional: "Mode C: Regional Zoom Exploration",
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
      // Don't intercept if user is typing in an input
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
