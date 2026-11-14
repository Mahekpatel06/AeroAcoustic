"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { Music, Radio, Waves, Sparkles } from "lucide-react";

interface AcousticStageProps {
  currentFeature: FrameFeature | null;
  isPlaying: boolean;
  activeNote: string;
  activeFreq: number;
}

export const AcousticStage: React.FC<AcousticStageProps> = ({
  currentFeature,
  isPlaying,
  activeNote,
  activeFreq,
}) => {
  const lumaPct = Math.round((currentFeature?.globalMeanBrightness ?? 0.03) * 1000) / 10;
  const isPurpleActive = (currentFeature?.changeClassification?.increaseRatio ?? 0) > 0.01;
  const isOrangeActive = (currentFeature?.changeClassification?.decreaseRatio ?? 0) > 0.01;

  // Active instrument based on phase and color classification
  const activeInstrument = isPurpleActive
    ? "Crystalline Chimes (Increase)"
    : isOrangeActive
    ? "Warm Cello Synth (Decrease)"
    : "Ambient Sine Pad (Baseline)";

  return (
    <div className="relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <Waves className="w-3.5 h-3.5 text-sky-400" />
          Acoustic Frequency Stage
        </span>
        <span className="font-mono text-[11px] text-yellow-400 font-semibold px-2 py-0.5 rounded bg-yellow-950/40 border border-yellow-800/40">
          Scale: C Major Pentatonic
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

      {/* Animated Equalizer Bars (Tone.js Bouncing Frequency Spectrum) */}
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
              : 10;
            return (
              <div
                key={idx}
                className="flex-1 bg-slate-800 rounded-t-sm overflow-hidden flex flex-col justify-end"
              >
                <div
                  className={`w-full transition-all duration-150 rounded-t-sm ${
                    isPurpleActive
                      ? "bg-gradient-to-t from-purple-500 to-sky-300"
                      : isOrangeActive
                      ? "bg-gradient-to-t from-orange-500 to-yellow-300"
                      : "bg-gradient-to-t from-sky-500 via-cyan-400 to-emerald-300"
                  }`}
                  style={{ height: `${dynamicHeight}%` }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
