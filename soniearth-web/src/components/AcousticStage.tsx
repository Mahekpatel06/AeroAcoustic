"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { Music, Radio, Waves, Sparkles } from "lucide-react";

interface AcousticStageProps {
  currentFeature: FrameFeature | null;
  isPlaying: boolean;
  activeNote: string;
  activeFreq: number;
  activeScaleName?: string;
  activeInstrument?: string;
}

export const AcousticStage: React.FC<AcousticStageProps> = ({
  currentFeature,
  isPlaying,
  activeNote,
  activeFreq,
  activeScaleName = "C Major Pentatonic",
  activeInstrument = "Ambient Sine Pad",
}) => {
  const lumaPct = Math.round((currentFeature?.globalMeanBrightness ?? 0.03) * 1000) / 10;

  return (
    <div className="relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden justify-between">
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
            <Music className="w-3 h-3 text-sky-400" />
            Active Note
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-sky-400 tracking-tight">
              {activeNote || "C3"}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {activeFreq ? `${activeFreq.toFixed(1)} Hz` : "130.8 Hz"}
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 truncate">
            {activeInstrument}
          </div>
        </div>

        {/* Global Luminance Gauge */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400" />
            Global Luminance
          </div>
          <div className="my-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {lumaPct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">Rec. 601</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, lumaPct * 20)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Animated Equalizer Bars (Tone.js Limiter Spectrum) */}
      <div className="mt-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            Tone.js Limiter Spectrum (-3 dBFS Master)
          </span>
          <span className="text-[10px] font-mono text-slate-500">44.1 kHz • Stereo</span>
        </div>
        <div className="flex items-end justify-between h-14 gap-1.5 px-2">
          {[
            35, 60, 45, 80, 50, 95, 70, 85, 40, 65, 55, 75
          ].map((baseHeight, idx) => {
            const dynamicHeight = isPlaying
              ? Math.max(15, (baseHeight + ((idx * 7) % 30)) * (0.6 + Math.random() * 0.4))
              : 8;
            return (
              <div
                key={idx}
                className="w-full bg-gradient-to-t from-sky-500 via-indigo-500 to-cyan-400 rounded-t-sm transition-all duration-100 shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                style={{ height: `${dynamicHeight}%` }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
