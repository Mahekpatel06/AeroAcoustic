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
  const isOcean = currentDataset === "ocean-currents";
  const isCO2 = currentDataset === "dyamond-co2";
  const lumaPct = Math.round((currentFeature?.globalMeanBrightness ?? 0.023) * 1000) / 10;
  const sstTemp = (currentFeature as any)?.temperatureCelsius ?? 18.0;
  const flowVelocity = (currentFeature as any)?.currentVelocityKnots ?? 1.5;
  const co2Ppm = currentFeature?.co2Ppm ?? 415.0;
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
    <div className="relative flex flex-col bg-[#06121D]/90 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs gap-2">
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          Acoustic Frequency Stage
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-cyan-300 font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 truncate max-w-[210px] shadow-[0_0_8px_rgba(6,182,212,0.25)]">
            {activeScaleName}
          </span>
        </div>
      </div>

      {/* Center Note & Frequency Metrics */}
      <div className="grid grid-cols-2 gap-2.5 my-2">
        {/* Active Note Card */}
        <div className="bg-black/60 border border-cyan-500/25 rounded-xl p-3 flex flex-col justify-between shadow-inner">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Music className="w-3 h-3 text-cyan-400" />
            Active Note
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              {activeNote || (isOcean ? "C3" : isLightning ? "A1" : isCO2 ? "G3" : "C3")}
            </span>
            <span className="text-xs font-mono text-cyan-400/80">
              {activeFreq ? `${activeFreq.toFixed(1)} Hz` : "196.0 Hz"}
            </span>
          </div>
          <div className="text-[11px] font-mono truncate text-cyan-300">
            {activeInstrument}
          </div>
        </div>

        {/* Dynamic Metric Gauge: Optical Energy (Lightning), SST (Ocean), CO2 (PPM) or Radiance (Night Lights) */}
        <div className="bg-black/60 border border-cyan-500/25 rounded-xl p-3 flex flex-col justify-between shadow-inner">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-cyan-400" />
            {isCO2 ? "Atmospheric CO2" : isOcean ? "Sea Surface Temp" : isLightning ? "Optical Energy" : "Global Radiance"}
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-cyan-300">
              {isCO2
                ? `${co2Ppm.toFixed(1)}`
                : isOcean
                ? `${sstTemp.toFixed(1)}°C`
                : isLightning
                ? `${currentFeature?.strikeEnergyMicroJoules ? currentFeature.strikeEnergyMicroJoules.toFixed(0) : "0"} µJ`
                : `${lumaPct.toFixed(1)}%`}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {isCO2 ? "ppm · GEOS" : isOcean ? `${flowVelocity.toFixed(1)} kts` : isLightning ? "LIS CCD" : "Rec. 601"}
            </span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-cyan-500/20">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-cyan-500 to-[#00F2FE] shadow-[0_0_8px_rgba(6,182,212,0.5)]"
              style={{
                width: isCO2
                  ? `${Math.min(100, Math.max(5, ((co2Ppm - 408) / 14) * 100))}%`
                  : isOcean
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
      <div className="mt-1 bg-black/60 border border-cyan-500/20 rounded-xl p-3 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono text-cyan-200 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            Live Tone.js Audio Spectrum
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {isPlaying ? "Live FFT · Active Synthesizer" : "Idle"}
          </span>
        </div>
        <div className="flex items-end justify-between h-14 gap-1.5 px-2">
          {barHeights.map((h, idx) => (
            <div
              key={idx}
              className="w-full rounded-t-sm transition-all duration-75 bg-gradient-to-t from-cyan-600 via-cyan-400 to-[#00F2FE] shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
