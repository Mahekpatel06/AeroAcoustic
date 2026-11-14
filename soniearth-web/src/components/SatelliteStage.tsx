"use client";

import React, { useState, useEffect } from "react";
import { FrameFeature } from "@/types";
import {
  Scan,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Flame,
  Zap,
} from "lucide-react";

interface SatelliteStageProps {
  currentFeature: FrameFeature | null;
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
  onSelectRegion?: (region: string) => void;
}

// Geographic zoom coordinates (percentage of 960x270 dual-equirectangular NASA hyperwall map)
const REGION_COORDINATES: Record<string, { x: number; y: number; scale: number; title: string; subtitle: string; deltaText: string; deltaType: "increase" | "decrease" }> = {
  India: {
    x: 33,
    y: 42,
    scale: 2.7,
    title: "SOUTH ASIA • INDIA",
    subtitle: "Saubhagya Rural Electrification Initiative",
    deltaText: "+34.2% Radiance Expansion",
    deltaType: "increase",
  },
  Ukraine: {
    x: 23,
    y: 28,
    scale: 3.1,
    title: "EASTERN EUROPE • UKRAINE",
    subtitle: "Conflict-Impacted Power Grid Corridors",
    deltaText: "-42.1% Blackout Decline",
    deltaType: "decrease",
  },
  "Western Europe": {
    x: 19,
    y: 28,
    scale: 2.8,
    title: "WESTERN EUROPE • CONTINENTAL GRID",
    subtitle: "High-Density LED Efficiency Transition",
    deltaText: "Stable Grid / High Efficiency",
    deltaType: "increase",
  },
  "Eastern Mediterranean": {
    x: 23,
    y: 36,
    scale: 2.9,
    title: "EASTERN MEDITERRANEAN & LEVANT",
    subtitle: "Crossroads of Demographic & Grid Variance",
    deltaText: "High Localized Variance",
    deltaType: "decrease",
  },
};

export const SatelliteStage: React.FC<SatelliteStageProps> = ({
  currentFeature,
  currentFrameIndex,
  totalFrames,
  isPlaying,
  onSelectRegion,
}) => {
  const [contrastBoost, setContrastBoost] = useState<boolean>(true);
  const [manualZoom, setManualZoom] = useState<number>(1.0);
  const [manualPan, setManualPan] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  const frameNum = currentFeature?.frameIndex ?? 10;
  const frameImgUrl = `/datasets/night-lights/frames/frame_${String(frameNum).padStart(4, "0")}.png`;
  const phase = currentFeature?.phase;
  const regionFocus = currentFeature?.regionFocus || "global";
  const isRegional = phase === "regional_zoom" && regionFocus !== "global";
  const isChangePhase = phase === "global_change" || phase === "change_transition";

  // Determine active zoom parameters
  const activeRegion = REGION_COORDINATES[regionFocus];
  const targetScale = isManualOverride
    ? manualZoom
    : isRegional && activeRegion
    ? activeRegion.scale
    : 1.0;
  const targetOrigin = isManualOverride
    ? `${manualPan.x}% ${manualPan.y}%`
    : isRegional && activeRegion
    ? `${activeRegion.x}% ${activeRegion.y}%`
    : "50% 50%";

  // Reset zoom override when phase changes
  useEffect(() => {
    setIsManualOverride(false);
  }, [phase, regionFocus]);

  const handleManualZoomIn = () => {
    setIsManualOverride(true);
    setManualZoom((prev) => Math.min(3.5, prev + 0.4));
  };

  const handleManualZoomOut = () => {
    setIsManualOverride(true);
    setManualZoom((prev) => Math.max(1.0, prev - 0.4));
  };

  const handleResetZoom = () => {
    setIsManualOverride(false);
    setManualZoom(1.0);
    setManualPan({ x: 50, y: 50 });
  };

  return (
    <div className="relative flex flex-col bg-slate-900/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl overflow-hidden group">
      {/* 1. STAGE TOP CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
        {/* Left: Telemetry & Frame Counter */}
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
          <span className="font-mono text-sky-400 font-semibold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/40">
            Frame {String(currentFrameIndex + 1).padStart(2, "0")} / {totalFrames}
          </span>
        </div>

        {/* Right: Stage Action Controls (Contrast Boost, Zoom Buttons, Mode Badge) */}
        <div className="flex items-center gap-2">
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

          {/* Phase Badge */}
          {currentFeature?.year && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-700/70 font-mono text-emerald-400 text-xs font-bold shadow-sm">
              Year {currentFeature.year}
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 font-mono text-slate-200 text-xs font-medium">
            {phase === "annual_series"
              ? "Mode A: Annual Evolution"
              : phase === "global_change"
              ? "Mode B: Decadal Change Map"
              : isRegional
              ? `Mode C: ${regionFocus}`
              : "Transition"}
          </span>
        </div>
      </div>

      {/* 2. MAIN SATELLITE CANVAS / PROJECTION (LARGE FORMAT) */}
      <div className="relative w-full h-[360px] sm:h-[420px] md:h-[480px] lg:h-[500px] bg-black rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl flex items-center justify-center">
        {/* Dynamic Satellite Image with Zoom & Pan CSS Transform */}
        <div
          className="relative w-full h-full transition-transform duration-700 ease-out flex items-center justify-center overflow-hidden"
          style={{
            transform: `scale(${targetScale})`,
            transformOrigin: targetOrigin,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameImgUrl}
            alt={`NASA Night Lights Frame ${frameNum}`}
            className={`w-full h-full object-cover select-none pointer-events-none transition-filter duration-300 ${
              contrastBoost
                ? "brightness-125 contrast-140 saturate-150"
                : "brightness-100 contrast-100"
            }`}
          />

          {/* MODE B: DECADAL CHANGE HOTSPOT RETICLES (Glow Pulses over Real Data Points) */}
          {isChangePhase && (
            <>
              {/* Ukraine Conflict Blackout Reticle (Orange) */}
              <div
                className="absolute pointer-events-auto cursor-pointer group/spot"
                style={{ left: "23%", top: "27%" }}
                title="Ukraine: Localized Blackout Corridors (-42%)"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 border-white shadow-[0_0_12px_#f97316]"></span>
                  <div className="absolute left-5 top-0 hidden group-hover/spot:flex flex-col bg-slate-950/95 border border-orange-500/80 px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] font-mono whitespace-nowrap z-30">
                    <span className="text-orange-400 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Ukraine Blackout Corridors
                    </span>
                    <span className="text-slate-300">-42.1% Radiance Decline (Deep Cello)</span>
                  </div>
                </div>
              </div>

              {/* India Electrification Reticle (Purple) */}
              <div
                className="absolute pointer-events-auto cursor-pointer group/spot"
                style={{ left: "33%", top: "41%" }}
                title="India: Rural Electrification Expansion (+34%)"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-purple-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-400 border-2 border-white shadow-[0_0_12px_#c084fc]"></span>
                  <div className="absolute left-5 top-0 hidden group-hover/spot:flex flex-col bg-slate-950/95 border border-purple-500/80 px-2.5 py-1.5 rounded-lg shadow-xl text-[11px] font-mono whitespace-nowrap z-30">
                    <span className="text-purple-300 font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-purple-400" /> India Electrification Boom
                    </span>
                    <span className="text-slate-300">+34.2% Radiance Growth (Chimes)</span>
                  </div>
                </div>
              </div>

              {/* East Asia Expansion Reticle (Purple) */}
              <div
                className="absolute pointer-events-auto cursor-pointer group/spot"
                style={{ left: "40%", top: "33%" }}
                title="East Asia: Megacity Sprawl"
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-purple-500 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-400 border border-white"></span>
                </div>
              </div>
            </>
          )}

          {/* MODE C: REGIONAL TARGET BOUNDING RETICLE (High-Tech Crosshair Focus) */}
          {isRegional && activeRegion && (
            <div
              className="absolute pointer-events-none transition-all duration-700 border-2 rounded-xl shadow-[0_0_25px_rgba(56,189,248,0.4)]"
              style={{
                left: `${activeRegion.x - 6}%`,
                top: `${activeRegion.y - 8}%`,
                width: "12%",
                height: "16%",
                borderColor:
                  activeRegion.deltaType === "increase"
                    ? "rgba(192, 132, 252, 0.85)"
                    : "rgba(249, 115, 22, 0.85)",
              }}
            >
              {/* Corner crosshairs */}
              <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-white"></div>
              <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-white"></div>
              <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-white"></div>
              <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-white"></div>
            </div>
          )}

          {/* Scanning Laser Line during Playback */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_#38bdf8] animate-laser"></div>
            </div>
          )}
        </div>

        {/* 3. MODE B SCIENTIFIC SPECTRAL SCALE HUD (REPLACES TINY NASA COLORBAR) */}
        {isChangePhase && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-md bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Decadal Lighting Intensity Scale (2012 → 2023)
              </span>
              <span className="text-emerald-400 font-semibold">+2.28% Net Global Growth</span>
            </div>

            {/* High-Contrast Gradient Bar */}
            <div className="relative w-full h-3 rounded-full overflow-hidden shadow-inner border border-slate-700">
              <div className="w-full h-full bg-gradient-to-r from-orange-500 via-slate-800 to-purple-500"></div>
            </div>

            {/* Legend Labels */}
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
        {isRegional && activeRegion && (
          <div className="absolute top-4 left-4 max-w-sm bg-slate-950/90 backdrop-blur-md border border-sky-500/60 rounded-2xl p-3.5 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-sky-400 font-bold tracking-wider flex items-center gap-1 uppercase">
                <MapPin className="w-3.5 h-3.5" /> Regional Telemetry Target
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  activeRegion.deltaType === "increase"
                    ? "bg-purple-950/60 text-purple-300 border-purple-700"
                    : "bg-orange-950/60 text-orange-300 border-orange-700"
                }`}
              >
                {activeRegion.deltaText}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">{activeRegion.title}</h3>
            <p className="text-xs text-slate-300 mt-0.5 font-sans leading-tight">
              {activeRegion.subtitle}
            </p>
          </div>
        )}

        {/* 5. MODE C REGIONAL QUICK-SELECTOR BUTTONS */}
        {phase === "regional_zoom" && (
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 z-20">
            {Object.keys(REGION_COORDINATES).map((regName) => {
              const isCurrent = regionFocus === regName;
              return (
                <button
                  key={regName}
                  onClick={() => onSelectRegion?.(regName)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono font-semibold transition-all border ${
                    isCurrent
                      ? "bg-sky-500 text-black border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                      : "bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-slate-800"
                  }`}
                >
                  {regName}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Corner Satellite Sensor Watermark */}
        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-400 border border-slate-800">
          Suomi NPP • VIIRS DNB • NASA SVS #5313
        </div>
      </div>
    </div>
  );
};
