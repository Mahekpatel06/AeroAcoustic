"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Clock, Globe, Zap, MapPin, Repeat } from "lucide-react";

interface MasterControllerProps {
  currentDataset?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentMode: "annual" | "change" | "regional";
  onSelectMode: (mode: "annual" | "change" | "regional") => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  loopMode: boolean;
  onToggleLoopMode: () => void;
}

export const MasterController: React.FC<MasterControllerProps> = ({
  currentDataset = "night-lights",
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentMode,
  onSelectMode,
  playbackSpeed,
  onChangeSpeed,
  loopMode,
  onToggleLoopMode,
}) => {
  const isLightning = currentDataset === "iss-lightning";

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
      {/* If ISS Lightning: Show Clean Spacecraft Mission Flight Deck */}
      {isLightning ? (
        <div className="bg-slate-950/80 border border-amber-600/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-300 uppercase tracking-wider">
                  NASA SVS #5011 • ISS Lightning Overpass
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60 animate-pulse">
                  MISSION ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                Continuous orbital flight tracking severe optical thunderstorm flashes across continents.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Alt: <strong className="text-amber-400">408 km</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Velocity: <strong className="text-amber-400">7.66 km/s</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Sensor: <strong className="text-amber-400">LIS CCD</strong>
            </span>
          </div>
        </div>
      ) : (
        /* If Night Lights: Visibly Differentiated Mode Buttons */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Mode A */}
          <button
            onClick={() => onSelectMode("annual")}
            className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
              currentMode === "annual"
                ? "bg-sky-950/80 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20 ring-1 ring-sky-400/50"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs text-sky-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Mode A: Annual Timeline</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Year-over-year planetary radiance & 9-cell spatial sweep (00:00 - 00:12)
            </p>
          </button>

          {/* Mode B */}
          <button
            onClick={() => onSelectMode("change")}
            className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
              currentMode === "change"
                ? "bg-purple-950/80 border-purple-400 text-purple-200 shadow-md shadow-purple-500/20 ring-1 ring-purple-400/50"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs text-purple-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Mode B: Decadal Change</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              Dual polarity: Chimes (growth) & cello (blackouts) (00:12 - 00:23)
            </p>
          </button>

          {/* Mode C */}
          <button
            onClick={() => onSelectMode("regional")}
            className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
              currentMode === "regional"
                ? "bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/50"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-400">
              <MapPin className="w-3.5 h-3.5" />
              <span>Mode C: Regional Insets</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              4 cultural scales: Marimba (India), Cello (Ukraine), Glass, Modal (00:23 - 00:43)
            </p>
          </button>
        </div>
      )}

      {/* Primary Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Previous Frame / Second (Left Arrow)"
            aria-label="Previous Frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Master Play Button with Spacebar Prompt */}
          <button
            onClick={onTogglePlay}
            className={`relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
              isPlaying
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/30 scale-105"
                : "bg-gradient-to-r from-sky-400 to-cyan-500 text-slate-950 shadow-lg shadow-sky-500/30 hover:scale-105"
            }`}
            title="Play / Pause Sonification (Spacebar)"
            aria-label={isPlaying ? "Pause Playback" : "Start Playback"}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
            <span className="absolute -bottom-5 text-[9px] font-mono text-slate-400 uppercase tracking-widest pointer-events-none">
              [Space]
            </span>
          </button>

          <button
            onClick={onNext}
            className="p-2.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Next Frame / Second (Right Arrow)"
            aria-label="Next Frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls: Loop Mode Lock & Speed */}
        <div className="flex items-center gap-3">
          {/* Mode Lock / Full Film Loop Toggle */}
          <button
            onClick={onToggleLoopMode}
            title={
              loopMode
                ? "Mode Lock Active: Stays locked and loops inside this selected mode. Click to switch to continuous Full Film playback."
                : "Full Film Active: Plays continuously through all modes from 0s to 43s. Click to lock into current mode."
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              loopMode
                ? "bg-sky-950/80 border-sky-500 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>{loopMode ? "Loop: Mode Locked" : "Play: Full Film"}</span>
          </button>

          {/* Playback Speed Controls */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-mono text-xs hidden sm:inline">Speed:</span>
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
      </div>
    </div>
  );
};
