"use client";

import React, { useState, useEffect } from "react";
import { FrameFeature } from "@/types";
import {
  Scan,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Flame,
  Zap,
  Info,
  Maximize2,
  Minimize2,
  Clock,
  Activity,
  Calendar,
} from "lucide-react";

interface SatelliteStageProps {
  currentFeature: FrameFeature | null;
  currentTime: number;
  currentMode: "annual" | "change" | "regional";
  selectedRegion: string;
  isPlaying: boolean;
  onSelectRegion?: (region: string) => void;
  onSeek?: (timeSec: number) => void;
  videoRef: React.Ref<HTMLVideoElement>;
}

// Regional Telemetry metadata for Mode C
const REGION_BOUNDS: Record<
  string,
  {
    title: string;
    subtitle: string;
    deltaText: string;
    deltaType: "increase" | "decrease";
  }
> = {
  India: {
    title: "SOUTH ASIA • INDIA",
    subtitle: "Saubhagya Rural Electrification Expansion",
    deltaText: "+34.2% Radiance Growth",
    deltaType: "increase",
  },
  Ukraine: {
    title: "EASTERN EUROPE • UKRAINE",
    subtitle: "Conflict-Impacted Power Grid Corridors",
    deltaText: "-42.1% Blackout Decline",
    deltaType: "decrease",
  },
  "Western Europe": {
    title: "WESTERN EUROPE • CONTINENTAL GRID",
    subtitle: "High-Efficiency LED Grid Transition",
    deltaText: "Stable Grid / LED Shift",
    deltaType: "increase",
  },
  "Eastern Mediterranean": {
    title: "EASTERN MEDITERRANEAN & LEVANT",
    subtitle: "Demographic & Infrastructure Variance",
    deltaText: "Localized Dynamic Variance",
    deltaType: "decrease",
  },
  "Overview (All Insets)": {
    title: "GLOBAL MAP • 4 REGIONAL INSETS",
    subtitle: "Simultaneous Display of India, Ukraine, Western Europe, and Levant",
    deltaText: "4-Region Inset Array",
    deltaType: "increase",
  }
};

// Scientific video duration definitions in seconds
const MODE_DURATIONS: Record<string, number> = {
  annual: 12.0,
  change: 11.5,
  regional: 19.8,
};

export const SatelliteStage: React.FC<SatelliteStageProps> = ({
  currentFeature,
  currentTime,
  currentMode,
  selectedRegion,
  isPlaying,
  onSelectRegion,
  onSeek,
  videoRef,
}) => {
  const [contrastBoost, setContrastBoost] = useState<boolean>(true);
  const [manualZoom, setManualZoom] = useState<number>(1.0);
  const [manualPan, setManualPan] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");

  // High-performance, zero-buffering local mode clips
  const videoSrc =
    currentMode === "annual"
      ? "/datasets/night-lights/chunk_mode_a.webm"
      : currentMode === "change"
      ? "/datasets/night-lights/chunk_mode_b.webm"
      : "/datasets/night-lights/chunk_mode_c.webm";

  const isRegional = currentMode === "regional";
  const isChangePhase = currentMode === "change";
  const isAnnualPhase = currentMode === "annual";

  // Active target bounding box for Mode C
  const activeBounds = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS["India"];

  const targetScale = isManualOverride ? manualZoom : 1.0;
  const targetOrigin = isManualOverride ? `${manualPan.x}% ${manualPan.y}%` : "50% 50%";

  useEffect(() => {
    setIsManualOverride(false);
  }, [currentMode, selectedRegion]);

  const handleManualZoomIn = () => {
    setIsManualOverride(true);
    setManualZoom((prev) => Math.min(3.0, prev + 0.3));
  };

  const handleManualZoomOut = () => {
    setIsManualOverride(true);
    setManualZoom((prev) => Math.max(1.0, prev - 0.3));
  };

  const handleResetZoom = () => {
    setIsManualOverride(false);
    setManualZoom(1.0);
    setManualPan({ x: 50, y: 50 });
  };

  // Pure dynamic position: 0% (West) to 100% (East) per 1-second calendar year
  // Zero hardcoded center lingering (: 50 removed completely)
  const laserPercent = (currentTime % 1.0) * 100;

  // Overall Timeline Progress Bar Calculations ("Kitna Chala" & "End Kab Hua")
  const maxDuration = MODE_DURATIONS[currentMode] || 12.0;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / maxDuration) * 100));

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = (sec % 60).toFixed(1);
    const padSecs = Number(secs) < 10 ? `0${secs}` : secs;
    return `0${mins}:${padSecs}s`;
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * maxDuration);
  };

  return (
    <div className="relative flex flex-col bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden group">
      {/* 1. STAGE TOP CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        {/* Left: Telemetry & Status */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPlaying ? "bg-emerald-400" : "bg-slate-500"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isPlaying ? "bg-emerald-500" : "bg-slate-600"
              }`}
            ></span>
          </span>
          <span className="font-semibold text-slate-100 uppercase tracking-wider text-xs flex items-center gap-1.5 font-mono">
            <Scan className="w-4 h-4 text-sky-400" />
            NASA Satellite Optical Stage
          </span>
          <span className="text-slate-600">|</span>
          <span className="font-mono text-sky-400 font-semibold bg-sky-950/60 px-2.5 py-0.5 rounded border border-sky-800/40">
            {currentMode === "annual"
              ? "Mode A: Annual 2012–2023"
              : currentMode === "change"
              ? "Mode B: Decadal Change Map"
              : `Mode C: Regional Insets (${selectedRegion})`}
          </span>
          {currentFeature?.year && currentMode === "annual" && (
            <span className="font-mono text-emerald-400 text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
              Year {currentFeature.year}
            </span>
          )}
        </div>

        {/* Right: Stage Action Controls (Clean, minimal, zero extra debug buttons) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Aspect Fit Mode: Sharp Contain vs Cover */}
          <button
            onClick={() => setFitMode(fitMode === "contain" ? "cover" : "contain")}
            title={fitMode === "contain" ? "Switch to Fill Screen (Cropped)" : "Switch to 100% Sharp (Uncropped)"}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
          >
            {fitMode === "contain" ? <Minimize2 className="w-3.5 h-3.5 text-sky-400" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{fitMode === "contain" ? "100% Sharp (Contain)" : "Fill (Cover)"}</span>
          </button>

          {/* Contrast Boost Toggle */}
          <button
            onClick={() => setContrastBoost(!contrastBoost)}
            title="Toggle High-Contrast Satellite Radiance Boost"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
              contrastBoost
                ? "bg-amber-950/60 text-amber-300 border-amber-700/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Radiance Boost: {contrastBoost ? "ON" : "OFF"}</span>
          </button>

          {/* Interactive Zoom Tools */}
          <div className="flex items-center bg-slate-950/80 rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={handleManualZoomIn}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleManualZoomOut}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-yellow-400"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN SATELLITE CANVAS */}
      <div className="relative w-full h-[320px] sm:h-[380px] md:h-[440px] lg:h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl flex items-center justify-center">
        {/* Aspect-Locked Dynamic Video Stage: Locks laser line and video to the EXACT same map boundaries */}
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out ${
            fitMode === "contain" ? "w-full aspect-[32/9]" : "w-full h-full"
          }`}
          style={{
            transform: `scale(${targetScale})`,
            transformOrigin: targetOrigin,
          }}
        >
          {/* HTML5 Local Chunk Video: Instant 0ms load from disk, 0% buffering */}
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            playsInline
            muted
            loop
            autoPlay={false}
            onCanPlay={(e) => {
              if (isPlaying) {
                (e.target as HTMLVideoElement).play().catch(() => {});
              }
            }}
            className={`w-full h-full ${
              fitMode === "contain" ? "object-contain" : "object-cover"
            } select-none pointer-events-none transition-all duration-300 ${
              contrastBoost
                ? "brightness-125 contrast-140 saturate-150"
                : "brightness-100 contrast-100"
            }`}
          />


          {/* MODE A: HORIZONTAL SCANNING LASER */}
          {/* Strictly active in Mode A, locked within Earth map bounds, zero backward lag */}
          {isPlaying && isAnnualPhase && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-20"
              style={{ left: `${laserPercent}%`, width: "2px" }}
            >
              <div className="w-full h-full bg-cyan-400 shadow-[0_0_16px_#38bdf8]"></div>
              <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] opacity-80"></div>
            </div>
          )}
        </div>

        {/* 3. MODE B SCIENTIFIC SPECTRAL SCALE HUD */}
        {isChangePhase && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-md bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Decadal Lighting Intensity Scale (2012 → 2023)
              </span>
              <span className="text-emerald-400 font-semibold">+2.28% Net Global Growth</span>
            </div>
            <div className="relative w-full h-3 rounded-full overflow-hidden shadow-inner border border-slate-700">
              <div className="w-full h-full bg-gradient-to-r from-orange-500 via-slate-800 to-purple-500"></div>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono">
              <span className="text-orange-400 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3" /> -100% Blackouts (Cello)
              </span>
              <span className="text-slate-400">0% Stable</span>
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" /> +100% Expansion (Chimes)
              </span>
            </div>
          </div>
        )}

        {/* 4. MODE C REGIONAL TELEMETRY MISSION CARD */}
        {isRegional && activeBounds && (
          <div className="absolute top-4 left-4 max-w-sm bg-slate-950/90 backdrop-blur-md border border-sky-500/60 rounded-2xl p-3.5 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-sky-400 font-bold tracking-wider flex items-center gap-1 uppercase">
                <MapPin className="w-3.5 h-3.5" /> Regional Telemetry Target
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  activeBounds.deltaType === "increase"
                    ? "bg-purple-950/60 text-purple-300 border-purple-700"
                    : "bg-orange-950/60 text-orange-300 border-orange-700"
                }`}
              >
                {activeBounds.deltaText}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{activeBounds.title}</h3>
            <p className="text-xs text-slate-300 mt-0.5 font-sans leading-tight">
              {activeBounds.subtitle}
            </p>
          </div>
        )}

        {/* 5. MODE C REGIONAL QUICK-SELECTOR BUTTONS */}
        {isRegional && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 z-20">
            {Object.keys(REGION_BOUNDS).map((regName) => {
              const isCurrent = selectedRegion === regName;
              return (
                <button
                  key={regName}
                  onClick={() => onSelectRegion?.(regName)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-semibold transition-all border ${
                    isCurrent
                      ? "bg-sky-500 text-black border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)] font-bold"
                      : "bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {regName}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Corner Scientific Watermark */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 border border-slate-800 max-w-xs text-right leading-tight z-10 hidden sm:block">
          <span className="text-slate-300 font-semibold flex items-center justify-end gap-1 mb-0.5">
            <Info className="w-2.5 h-2.5 text-sky-400" /> NASA SVS #5313
          </span>
          Decadal High-Definition Telemetry
        </div>
      </div>

      {/* 3. SCIENTIFIC PLAYBACK TIMELINE & PROGRESS SCRUBBER BAR */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
        {/* Scrubber Bar Line ("Kitna Chala" Fill + Interactive Scrub) */}
        <div
          role="slider"
          aria-label="Video Timeline Progress Bar"
          aria-valuemin={0}
          aria-valuemax={maxDuration}
          aria-valuenow={Number(currentTime.toFixed(1))}
          onClick={handleTimelineClick}
          className="relative w-full h-4 cursor-pointer group flex items-center select-none"
          title={`Click to jump anywhere on the ${maxDuration}s timeline`}
        >
          {/* Background Track */}
          <div className="w-full h-1.5 bg-slate-800/90 rounded-full overflow-hidden transition-all duration-150 group-hover:h-2.5">
            {/* Filled Progress Line: Shows how much has played */}
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                currentMode === "annual"
                  ? "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                  : currentMode === "change"
                  ? "bg-gradient-to-r from-orange-500 via-purple-500 to-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.7)]"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Draggable Scrubber Knob (Indicates exact position) */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff] border-2 transition-transform ${
              currentMode === "annual"
                ? "border-sky-400"
                : currentMode === "change"
                ? "border-purple-400"
                : "border-emerald-400"
            } scale-75 group-hover:scale-125`}
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Timeline Status Display: "Kitna Chala" (Current) | "Saal" | "Progress %" | "End Kab Hua" (Total) */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          {/* Left: Elapsed Time ("Kitna chala") */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              <Clock className="w-3 h-3 text-sky-400" />
              <span>{formatTime(currentTime)}</span>
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-semibold">{formatTime(maxDuration)}</span>

            {/* In Mode A: Current Calendar Year Indicator */}
            {currentMode === "annual" && (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">
                <Calendar className="w-3 h-3" />
                <span>Year {2012 + Math.min(11, Math.floor(currentTime))}</span>
                <span className="text-emerald-500/70">({Math.min(12, Math.floor(currentTime) + 1)}/12)</span>
              </span>
            )}

            {/* In Mode C: Target Region Name */}
            {currentMode === "regional" && (
              <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px]">
                <MapPin className="w-3 h-3" />
                <span>{selectedRegion}</span>
              </span>
            )}
          </div>

          {/* Right: Progress Percentage & Status */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-400">
              Progress: <strong className="text-slate-200">{progressPercent.toFixed(0)}%</strong>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              {isPlaying ? (
                progressPercent >= 99 ? (
                  <span className="text-amber-400 font-bold">Looping...</span>
                ) : (
                  <span className="text-emerald-400">Playing</span>
                )
              ) : (
                <span className="text-slate-500">Paused</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
