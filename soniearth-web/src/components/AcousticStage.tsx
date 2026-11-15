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
    <div className="relative flex flex-col bg-[#080D12]/85 backdrop-blur-xl border border-emerald-500/25 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(0,245,155,0.3)]">
          <Waves className="w-3.5 h-3.5 text-emerald-400" />
          Acoustic Frequency Stage
        </span>
        <span className="font-mono text-[11px] text-emerald-300 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 truncate max-w-[260px] shadow-[0_0_8px_rgba(0,245,155,0.15)]">
          {activeScaleName}
        </span>
      </div>

      {/* Center Note & Frequency Metrics */}
      <div className="grid grid-cols-2 gap-2.5 my-2">
        {/* Active Note Card */}
        <div className="bg-black/60 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between shadow-inner">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Music className="w-3 h-3 text-emerald-400" />
            Active Note
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-white drop-shadow-[0_0_12px_rgba(0,245,155,0.5)]">
              {activeNote || (isLightning ? "A1" : "C3")}
            </span>
            <span className="text-xs font-mono text-emerald-400/80">
              {activeFreq ? `${activeFreq.toFixed(1)} Hz` : isLightning ? "55.0 Hz" : "130.8 Hz"}
            </span>
          </div>
          <div className="text-[11px] font-mono truncate text-emerald-300">
            {activeInstrument}
          </div>
        </div>

        {/* Dynamic Metric Gauge: Optical Energy (Lightning) or Global Radiance (Night Lights) */}
        <div className="bg-black/60 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-between shadow-inner">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400" />
            {isLightning ? "Optical Flash Energy" : "Global Radiance"}
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(0,245,155,0.4)]">
              {isLightning
                ? `${currentFeature?.strikeEnergyMicroJoules ? currentFeature.strikeEnergyMicroJoules.toFixed(0) : "0"} µJ`
                : `${lumaPct.toFixed(1)}%`}
            </span>
            <span className="text-xs text-slate-500">
              {isLightning ? "LIS CCD" : "Rec. 601"}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-emerald-500/20">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-600 via-emerald-400 to-[#00F59B] shadow-[0_0_8px_rgba(0,245,155,0.6)]"
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
