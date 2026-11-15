"use client";

import React from "react";
import { Play, Pause, SkipBack, SkipForward, Clock, Globe, Zap, Waves, Wind, MapPin, Repeat } from "lucide-react";

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
  const isOcean = currentDataset === "ocean-currents";
  const isCO2 = currentDataset === "dyamond-co2";

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-4">
      {/* If Ocean Currents: Show Fluid Dynamics Flight Deck */}
      {isOcean ? (
        <div className="bg-slate-950/80 border border-teal-600/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <Waves className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-teal-300 uppercase tracking-wider">
                  NASA SVS #3912 • ECCO2 Perpetual Ocean
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-950/80 text-teal-300 border border-teal-700/60 animate-pulse">
                  FLUID DYNAMICS LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                Global hydrodynamic circulation simulating sea surface currents, thermal heat transport, and ocean eddies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Model: <strong className="text-teal-400">ECCO2 MITgcm</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Thermal: <strong className="text-teal-400">0°C – 32°C</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Flow: <strong className="text-teal-400">0.5 – 5.2 kts</strong>
            </span>
          </div>
        </div>
      ) : isLightning ? (
        <div className="bg-slate-950/80 border border-amber-600/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/30" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  NASA SVS #5011 • ISS Lightning Overpass
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 animate-pulse shadow-[0_0_8px_rgba(0,245,155,0.3)]">
                  MISSION ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Continuous orbital flight tracking severe optical thunderstorm flashes across continents.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-emerald-500/20 text-slate-300">
              Alt: <strong className="text-emerald-400">408 km</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-emerald-500/20 text-slate-300">
              Velocity: <strong className="text-emerald-400">7.66 km/s</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-emerald-500/20 text-slate-300">
              Sensor: <strong className="text-emerald-400">LIS CCD</strong>
            </span>
          </div>
        </div>
      ) : isCO2 ? (
        <div className="bg-slate-950/80 border border-emerald-600/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Wind className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  NASA SVS #5436 • DYAMOND Global Carbon Circulation
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 animate-pulse">
                  GEOS 3D MODEL LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                High-resolution 3D simulation of atmospheric carbon respiration, urban plumes, and hemispheric transport.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Model: <strong className="text-emerald-400">GEOS-5 3D</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Concentration: <strong className="text-emerald-400">410–417 ppm</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              Duration: <strong className="text-emerald-400">39.2s Loop</strong>
            </span>
          </div>
        </div>
      ) : (
        /* If Night Lights: Sleek Compact Mode Selector Segmented Pill Bar (Unified Laser Mint Theme) */
        <div className="flex items-center gap-1.5 p-1 bg-black/70 rounded-xl border border-emerald-500/20 shadow-inner">
          {/* Mode A */}
          <button
            onClick={() => onSelectMode("annual")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
              currentMode === "annual"
                ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-[#00F59B] text-slate-950 font-bold shadow-[0_0_15px_rgba(0,245,155,0.4)]"
                : "text-slate-300 hover:text-white hover:bg-emerald-950/30"
            }`}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">Mode A: Annual</span>
            <span className={`text-[10px] hidden sm:inline ${currentMode === "annual" ? "text-slate-900 font-bold" : "text-emerald-400/80"}`}>
              00:00–00:12
            </span>
          </button>

          {/* Mode B */}
          <button
            onClick={() => onSelectMode("change")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
              currentMode === "change"
                ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-[#00F59B] text-slate-950 font-bold shadow-[0_0_15px_rgba(0,245,155,0.4)]"
                : "text-slate-300 hover:text-white hover:bg-emerald-950/30"
            }`}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">Mode B: Decadal</span>
            <span className={`text-[10px] hidden sm:inline ${currentMode === "change" ? "text-slate-900 font-bold" : "text-emerald-400/80"}`}>
              00:12–00:23
            </span>
          </button>

          {/* Mode C */}
          <button
            onClick={() => onSelectMode("regional")}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
              currentMode === "regional"
                ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-[#00F59B] text-slate-950 font-bold shadow-[0_0_15px_rgba(0,245,155,0.4)]"
                : "text-slate-300 hover:text-white hover:bg-emerald-950/30"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">Mode C: Regional</span>
            <span className={`text-[10px] hidden sm:inline ${currentMode === "regional" ? "text-slate-900 font-bold" : "text-emerald-400/80"}`}>
              00:23–00:43
            </span>
          </button>
        </div>
      )}

      {/* Primary Transport Controls - Elevated, Prominent & Highly Visible */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-emerald-500/20">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            className="p-2 rounded-xl bg-black/60 border border-emerald-500/25 text-slate-300 hover:text-white hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(0,245,155,0.25)] transition-all cursor-pointer"
            title="Previous Frame / Second (Left Arrow)"
            aria-label="Previous Frame"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Master Play Button with Pulsing Emerald Glow Ring */}
          <button
            onClick={onTogglePlay}
            className={`relative group flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 cursor-pointer ${
              isPlaying
                ? "bg-gradient-to-r from-emerald-400 via-teal-300 to-[#00F59B] text-slate-950 shadow-[0_0_30px_rgba(0,245,155,0.85)] scale-105"
                : "bg-gradient-to-r from-emerald-400 via-teal-300 to-[#00F59B] text-slate-950 shadow-[0_0_20px_rgba(0,245,155,0.5)] hover:shadow-[0_0_35px_rgba(0,245,155,0.9)] hover:scale-105"
            }`}
            title="Play / Pause Sonification (Spacebar)"
            aria-label={isPlaying ? "Pause Playback" : "Start Playback"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
            <span className="absolute -bottom-4 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest pointer-events-none drop-shadow-[0_0_6px_rgba(0,245,155,0.5)]">
              [Space]
            </span>
          </button>

          <button
            onClick={onNext}
            className="p-2 rounded-xl bg-black/60 border border-emerald-500/25 text-slate-300 hover:text-white hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(0,245,155,0.25)] transition-all cursor-pointer"
            title="Next Frame / Second (Right Arrow)"
            aria-label="Next Frame"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls: Loop Mode Lock & Speed */}
        <div className="flex items-center gap-2.5">
          {/* Mode Lock / Full Film Loop Toggle */}
          <button
            onClick={onToggleLoopMode}
            title={
              loopMode
                ? "Mode Lock Active: Stays locked inside selected mode. Click to play continuously."
                : "Full Film Active: Plays continuously 0s to 43s. Click to lock inside current mode."
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all border cursor-pointer ${
              loopMode
                ? "bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(0,245,155,0.3)] font-semibold"
                : "bg-black/50 border-emerald-500/20 text-slate-400 hover:text-slate-200 hover:border-emerald-400/40"
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{loopMode ? "Loop: Mode Locked" : "Play: Full Film"}</span>
            <span className="sm:hidden">{loopMode ? "Locked" : "Full"}</span>
          </button>

          {/* Playback Speed Controls */}
          <div className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-xl border border-emerald-500/20 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono text-xs hidden md:inline text-slate-400">Speed:</span>
            <div className="flex items-center gap-1">
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                    playbackSpeed === s
                      ? "bg-gradient-to-r from-emerald-400 to-[#00F59B] text-slate-950 font-bold shadow-[0_0_8px_rgba(0,245,155,0.4)]"
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
