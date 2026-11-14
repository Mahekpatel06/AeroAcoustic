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
}

export const AcousticStage: React.FC<AcousticStageProps> = ({
  currentDataset = "night-lights",
  currentFeature,
  isPlaying,
  activeNote,
  activeFreq,
  activeScaleName = "C Major Pentatonic",
  activeInstrument = "Ambient Sine Pad",
}) => {
  const isLightning = currentDataset === "iss-lightning";
  const lumaPct = Math.round((currentFeature?.globalMeanBrightness ?? 0.023) * 1000) / 10;
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
    <div className="relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-sky-400" />
          Acoustic Frequency Stage
        </span>
        <span className="font-mono text-[11px] text-yellow-400 font-semibold px-2 py-0.5 rounded bg-yellow-950/40 border border-yellow-800/40 truncate max-w-[260px]">
          {activeScaleName}
        </span>
      </div>

      {/* Center Note & Frequency Metrics */}
      <div className="grid grid-cols-2 gap-3 my-2">
        {/* Active Note Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Music className={`w-3 h-3 ${isLightning ? "text-amber-400" : "text-sky-400"}`} />
            Active Note
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tracking-tight ${
              isLightning
                ? currentFeature?.isStrike
                  ? "text-yellow-300 drop-shadow-[0_0_12px_#f59e0b] animate-pulse"
                  : "text-amber-400"
                : "text-sky-400"
            }`}>
              {activeNote || (isLightning ? "A1" : "C3")}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {activeFreq ? `${activeFreq.toFixed(1)} Hz` : isLightning ? "55.0 Hz" : "130.8 Hz"}
            </span>
          </div>
          <div className={`text-[11px] font-mono truncate ${isLightning ? "text-amber-300" : "text-emerald-400"}`}>
            {activeInstrument}
          </div>
        </div>

        {/* Dynamic Metric Gauge: Optical Energy (Lightning) or Global Radiance (Night Lights) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Radio className={`w-3 h-3 ${isLightning ? "text-amber-400" : "text-emerald-400"}`} />
            {isLightning ? "Optical Flash Energy" : "Global Radiance"}
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono ${isLightning ? "text-amber-400" : "text-emerald-400"}`}>
              {isLightning
                ? `${currentFeature?.strikeEnergyMicroJoules ? currentFeature.strikeEnergyMicroJoules.toFixed(0) : "0"} µJ`
                : `${lumaPct.toFixed(1)}%`}
            </span>
            <span className="text-xs text-slate-400">
              {isLightning ? "LIS CCD" : "Rec. 601"}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isLightning
                  ? "bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_8px_#f59e0b]"
                  : "bg-gradient-to-r from-sky-500 to-emerald-400"
              }`}
              style={{
                width: isLightning
                  ? `${Math.min(100, Math.max(5, ((currentFeature?.strikeEnergyMicroJoules || 0) / 1200) * 100))}%`
                  : `${Math.min(100, Math.max(5, lumaPct * 25))}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Real-time Tone.js FFT Spectrum Visualizer */}
      <div className="mt-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono text-slate-300 flex items-center gap-1">
            <Activity className={`w-3 h-3 ${isLightning ? "text-amber-400" : "text-emerald-400"}`} />
            Tone.js FFT Spectrum (-3 dBFS Limiter Master)
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {isPlaying ? (isLightning ? "Live FFT • LIS Chimes" : "Live FFT • Stereo") : "Idle"}
          </span>
        </div>
        <div className="flex items-end justify-between h-14 gap-1.5 px-2">
          {barHeights.map((h, idx) => (
            <div
              key={idx}
              className={`w-full rounded-t-sm transition-all duration-75 ${
                isLightning
                  ? "bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                  : "bg-gradient-to-t from-sky-600 via-indigo-500 to-emerald-400 shadow-[0_0_8px_rgba(56,189,248,0.25)]"
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
