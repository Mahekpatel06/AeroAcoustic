"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, FastForward, Clock } from "lucide-react";

interface MasterControllerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentMode: "annual" | "change" | "regional";
  onSelectMode: (mode: "annual" | "change" | "regional") => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const MasterController: React.FC<MasterControllerProps> = ({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentMode,
  onSelectMode,
  playbackSpeed,
  onChangeSpeed,
}) => {
  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Mode Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
        <button
          onClick={() => onSelectMode("annual")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === "annual"
              ? "bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Mode A: Annual Timeline
        </button>
        <button
          onClick={() => onSelectMode("change")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === "change"
              ? "bg-purple-500 text-white font-semibold shadow-md shadow-purple-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Mode B: Change Map
        </button>
        <button
          onClick={() => onSelectMode("regional")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            currentMode === "regional"
              ? "bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Mode C: Regional Zooms
        </button>
      </div>

      {/* Primary Transport Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPrev}
          className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="Previous Frame (Left Arrow)"
          aria-label="Previous Frame"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Master Play Button with Glowing Ring */}
        <button
          onClick={onTogglePlay}
          className={`relative group flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${
            isPlaying
              ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/30 scale-105"
              : "bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 shadow-lg shadow-sky-500/30 hover:scale-105"
          }`}
          title="Play / Pause Sonification (Spacebar)"
          aria-label={isPlaying ? "Pause Playback" : "Start Playback"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
          <span className="absolute -bottom-6 text-[10px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
            [Space]
          </span>
        </button>

        <button
          onClick={onNext}
          className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          title="Next Frame (Right Arrow)"
          aria-label="Next Frame"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed & Reverb Presets */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Clock className="w-3.5 h-3.5 text-sky-400" />
        <span className="font-mono">Speed:</span>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-xs">
          {[0.5, 1.0, 1.5, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded transition-colors ${
                playbackSpeed === s
                  ? "bg-sky-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
