"use client";

import React, { useState, useEffect, useRef } from "react";
import { FrameFeature } from "@/types";
import { Music, Radio, Waves, Activity } from "lucide-react";
import { audioEngine } from "@/lib/audioEngine";

interface AcousticStageProps {
  currentDataset?: string;
  currentFeature: FrameFeature | null;
  isPlaying: boolean;
  activeNote: string;
  activeFreq: number;
  activeScaleName?: string;
  activeInstrument?: string;
  oceanAudioMode?: "procedural" | "stem";
  onToggleOceanAudioMode?: () => void;
}

export const AcousticStage: React.FC<AcousticStageProps> = ({
  currentDataset = "night-lights",
  currentFeature,
  isPlaying,
  activeNote,
  activeFreq,
  activeScaleName = "C Major Pentatonic",
  activeInstrument = "Ambient Sine Pad",
  oceanAudioMode = "procedural",
  onToggleOceanAudioMode,
}) => {
  const isLightning = currentDataset === "iss-lightning";
  const isOcean = currentDataset === "ocean-currents";
  const lumaPct = Math.round((currentFeature?.globalMeanBrightness ?? 0.023) * 1000) / 10;
  const sstTemp = (currentFeature as any)?.temperatureCelsius ?? 18.0;
  const flowVelocity = (currentFeature as any)?.currentVelocityKnots ?? 1.5;
  const [barHeights, setBarHeights] = useState<number[]>([10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]);
  const animationFrameRef = useRef<number | null>(null);

  // Real-time Tone.js FFT Spectrum Animation
  useEffect(() => {
    const updateSpectrum = () => {
      if (isPlaying) {
        const fftData = audioEngine.getSpectrumData();
        // Downsample 32 FFT bins into 12 visual bars
        const bars: number[] = [];
        const step = Math.max(1, Math.floor(fftData.length / 12));

        for (let i = 0; i < 12; i++) {
          const binVal = fftData[i * step] ?? -100;
          // binVal is in dB (-100 to 0 dBFS)
          // Map -90dB to 0dB -> 8% to 100% height
          const normalized = Math.max(8, Math.min(100, (binVal + 90) * 1.3));
          bars.push(Math.round(normalized));
        }
        setBarHeights(bars);
      } else {
        // Smoothly decay to baseline when paused
        setBarHeights((prev) => prev.map((h) => Math.max(8, h * 0.85)));
      }

      animationFrameRef.current = requestAnimationFrame(updateSpectrum);
    };

    animationFrameRef.current = requestAnimationFrame(updateSpectrum);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative flex flex-col bg-[#080D12]/85 backdrop-blur-xl border border-emerald-500/25 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs gap-2">
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-sky-400" />
          Acoustic Frequency Stage
        </span>
        <div className="flex items-center gap-2">
          {isOcean && onToggleOceanAudioMode && (
            <button
              onClick={onToggleOceanAudioMode}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold border transition-all duration-200 cursor-pointer ${
                oceanAudioMode === "stem"
                  ? "bg-teal-900/60 border-teal-500/60 text-teal-200 shadow-[0_0_8px_rgba(45,212,191,0.3)]"
                  : "bg-slate-800/80 border-slate-700 text-teal-300 hover:border-teal-500/40"
              }`}
              title="Click to toggle between Smooth Synth (procedural sonification) and Master WAV (soundtrack)"
            >
              <Radio className="w-3 h-3 text-teal-400" />
              {oceanAudioMode === "stem" ? "Master WAV" : "Smooth Synth"}
            </button>
          )}
          <span className="font-mono text-[11px] text-yellow-400 font-semibold px-2 py-0.5 rounded bg-yellow-950/40 border border-yellow-800/40 truncate max-w-[210px]">
            {activeScaleName}
          </span>
        </div>
      </div>

      {/* Center Note & Frequency Metrics */}
      <div className="grid grid-cols-2 gap-2.5 my-2">
        {/* Active Note Card */}
        <div className="bg-black/60 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between shadow-inner">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Music className={`w-3 h-3 ${isOcean ? "text-teal-400" : isLightning ? "text-amber-400" : "text-sky-400"}`} />
            Active Note
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tracking-tight ${
              isOcean
                ? "text-teal-300 drop-shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                : isLightning
                ? currentFeature?.isStrike
                  ? "text-yellow-300 drop-shadow-[0_0_12px_#f59e0b] animate-pulse"
                  : "text-amber-400"
                : "text-sky-400"
            }`}>
              {activeNote || (isOcean ? "C3" : isLightning ? "A1" : "C3")}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {activeFreq ? `${activeFreq.toFixed(1)} Hz` : isOcean ? "130.8 Hz" : isLightning ? "55.0 Hz" : "130.8 Hz"}
            </span>
          </div>
          <div className={`text-[11px] font-mono truncate ${isOcean ? "text-teal-300" : isLightning ? "text-amber-300" : "text-emerald-400"}`}>
            {isOcean && oceanAudioMode === "stem" ? "Master WAV Soundtrack (ECCO2 Ambient)" : activeInstrument}
          </div>
        </div>

        {/* Dynamic Metric Gauge: Optical Energy (Lightning), SST (Ocean), or Global Radiance (Night Lights) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Radio className={`w-3 h-3 ${isOcean ? "text-teal-400" : isLightning ? "text-amber-400" : "text-emerald-400"}`} />
            {isOcean ? "Sea Surface Temp (SST)" : isLightning ? "Optical Flash Energy" : "Global Radiance"}
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${isOcean ? "text-teal-300" : isLightning ? "text-amber-400" : "text-emerald-400"}`}>
              {isOcean
                ? `${sstTemp.toFixed(1)}°C`
                : isLightning
                ? `${currentFeature?.strikeEnergyMicroJoules ? currentFeature.strikeEnergyMicroJoules.toFixed(0) : "0"} µJ`
                : `${lumaPct.toFixed(1)}%`}
            </span>
            <span className="text-xs text-slate-400">
              {isOcean ? `${flowVelocity.toFixed(1)} kts • ECCO2` : isLightning ? "LIS CCD" : "Rec. 601"}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-emerald-500/20">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOcean
                  ? "bg-gradient-to-r from-cyan-500 via-teal-400 to-rose-400 shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                  : isLightning
                  ? "bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_8px_#f59e0b]"
                  : "bg-gradient-to-r from-sky-500 to-emerald-400"
              }`}
              style={{
                width: isOcean
                  ? `${Math.min(100, Math.max(5, (sstTemp / 32.0) * 100))}%`
                  : isLightning
                  ? `${Math.min(100, Math.max(5, ((currentFeature?.strikeEnergyMicroJoules || 0) / 1200) * 100))}%`
                  : `${Math.min(100, Math.max(5, lumaPct * 25))}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Real-time Tone.js FFT Spectrum Visualizer */}
      <div className="mt-1 bg-black/60 border border-emerald-500/20 rounded-xl p-3 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono text-emerald-200 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            Live Tone.js Audio Spectrum
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {isPlaying ? (isLightning ? "Live FFT • LIS Chimes" : "Live FFT • Active") : "Idle"}
          </span>
        </div>
        <div className="flex items-end justify-between h-14 gap-1.5 px-2">
          {barHeights.map((h, idx) => (
            <div
              key={idx}
              className="w-full rounded-t-sm transition-all duration-75 bg-gradient-to-t from-emerald-600 via-emerald-400 to-[#00F59B] shadow-[0_0_10px_rgba(0,245,155,0.4)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
