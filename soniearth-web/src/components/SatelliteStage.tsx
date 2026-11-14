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
  Film,
  Image as ImageIcon
} from "lucide-react";

interface SatelliteStageProps {
  currentFeature: FrameFeature | null;
  currentTime: number;
  currentMode: "annual" | "change" | "regional";
  selectedRegion: string;
  isPlaying: boolean;
  onSelectRegion?: (region: string) => void;
  videoRef: React.Ref<HTMLVideoElement>;
  useVideo: boolean;
  onToggleVideoMode: () => void;
}

// Calibrated geographic bounding boxes for Mode C regional targets on the dual-equirectangular NASA map
const REGION_BOUNDS: Record<
  string,
  {
    left: number;
    top: number;
    width: number;
    height: number;
    title: string;
    subtitle: string;
    deltaText: string;
    deltaType: "increase" | "decrease";
  }
> = {
  India: {
    left: 63.0,
    top: 32.0,
    width: 11.0,
    height: 25.0,
    title: "SOUTH ASIA • INDIA",
    subtitle: "Saubhagya Rural Electrification Expansion",
    deltaText: "+34.2% Radiance Growth",
    deltaType: "increase",
  },
  Ukraine: {
    left: 49.5,
    top: 20.5,
    width: 9.0,
    height: 18.0,
    title: "EASTERN EUROPE • UKRAINE",
    subtitle: "Conflict-Impacted Power Grid Corridors",
    deltaText: "-42.1% Blackout Decline",
    deltaType: "decrease",
  },
  "Western Europe": {
    left: 41.0,
    top: 19.5,
    width: 10.0,
    height: 20.0,
    title: "WESTERN EUROPE • CONTINENTAL GRID",
    subtitle: "High-Efficiency LED Grid Transition",
    deltaText: "Stable Grid / LED Shift",
    deltaType: "increase",
  },
  "Eastern Mediterranean": {
    left: 49.0,
    top: 31.5,
    width: 8.5,
    height: 18.0,
    title: "EASTERN MEDITERRANEAN & LEVANT",
    subtitle: "Demographic & Infrastructure Variance",
    deltaText: "Localized Dynamic Variance",
    deltaType: "decrease",
  },
  "Overview (All Insets)": {
    left: 38.0,
    top: 16.0,
    width: 38.0,
    height: 44.0,
    title: "GLOBAL MAP • 4 REGIONAL INSETS",
    subtitle: "Simultaneous Display of India, Ukraine, Western Europe, and Levant",
    deltaText: "4-Region Inset Array",
    deltaType: "increase",
  }
};

export const SatelliteStage: React.FC<SatelliteStageProps> = ({
  currentFeature,
  currentTime,
  currentMode,
  selectedRegion,
  isPlaying,
  onSelectRegion,
  videoRef,
  useVideo,
  onToggleVideoMode,
}) => {
  const [contrastBoost, setContrastBoost] = useState<boolean>(true);
  const [manualZoom, setManualZoom] = useState<number>(1.0);
  const [manualPan, setManualPan] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  // Dedicated chunk video file per mode - only this chunk plays and repeats!
  const videoSrc =
    currentMode === "annual"
      ? "/datasets/night-lights/chunk_mode_a.webm"
      : currentMode === "change"
      ? "/datasets/night-lights/chunk_mode_b.webm"
      : "/datasets/night-lights/chunk_mode_c.webm";

  const frameNum = currentFeature?.frameIndex ?? 10;
  const frameImgUrl = `/datasets/night-lights/frames/frame_${String(frameNum).padStart(4, "0")}.png`;
  const isRegional = currentMode === "regional";
  const isChangePhase = currentMode === "change";
  const isAnnualPhase = currentMode === "annual";

  // Active target bounding box for Mode C
  const activeBounds = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS["India"];

  // Manual zoom override handler (never applied automatically so map stays stable)
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

  // Laser scan line position across the map in Mode A (0% to 100% per 1-second year)
  const laserPercent = isAnnualPhase ? (currentTime % 1.0) * 100 : 50;

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
              ? "Chunk A: Annual 2012–2023"
              : currentMode === "change"
              ? "Chunk B: Decadal Change Map"
              : `Chunk C: Regional Insets (${selectedRegion})`}
          </span>
          {currentFeature?.year && (
            <span className="font-mono text-emerald-400 text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
              Year {currentFeature.year}
            </span>
          )}
        </div>

        {/* Right: Stage Action Controls */}
        <div className="flex items-center gap-2">
          {/* Video / Frames Mode Toggle */}
          <button
            onClick={onToggleVideoMode}
            title={useVideo ? "Switch to High-Definition Frame Engine" : "Switch to Mode Video Chunk"}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
              useVideo && !videoError
                ? "bg-sky-950/80 text-sky-300 border-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
            }`}
          >
            {useVideo && !videoError ? (
              <>
                <Film className="w-3.5 h-3.5 text-sky-400" />
                <span>Video Chunk</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>HD Frames</span>
              </>
            )}
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

      {/* 2. MAIN SATELLITE CANVAS / DEDICATED MODE CHUNK PROJECTION */}
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] lg:h-[520px] bg-black rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl flex items-center justify-center">
        {/* Dynamic Satellite Media Container */}
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${targetScale})`,
            transformOrigin: targetOrigin,
          }}
        >
          {/* HTML5 Dedicated Mode Video Chunk (autoPlay disabled: only plays when user clicks play) */}
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            playsInline
            muted
            loop
            autoPlay={false}
            className={`w-full h-full object-cover select-none pointer-events-none transition-filter duration-300 ${
              contrastBoost
                ? "brightness-125 contrast-140 saturate-150"
                : "brightness-100 contrast-100"
            } ${useVideo && !videoError ? "block" : "hidden"}`}
            onError={() => {
              console.warn("Video stream codec unsupported, falling back to synchronized HD frames.");
              setVideoError(true);
            }}
          />

          {/* Synchronized HD Frame Projection (Fallback or User-Selected) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frameImgUrl}
            alt={`NASA Night Lights Frame ${frameNum}`}
            className={`w-full h-full object-cover select-none pointer-events-none transition-filter duration-300 ${
              contrastBoost
                ? "brightness-125 contrast-140 saturate-150"
                : "brightness-100 contrast-100"
            } ${useVideo && !videoError ? "hidden" : "block"}`}
          />

          {/* MODE C: PRECISE, STABLE TARGETING SQUARE FRAME (GLIDES EXACTLY OVER REGION) */}
          {isRegional && selectedRegion !== "Overview (All Insets)" && activeBounds && (
            <div
              className="absolute pointer-events-none transition-all duration-500 ease-out z-20"
              style={{
                left: `${activeBounds.left}%`,
                top: `${activeBounds.top}%`,
                width: `${activeBounds.width}%`,
                height: `${activeBounds.height}%`,
              }}
            >
              {/* Outer Glowing Border */}
              <div
                className={`w-full h-full rounded-lg border-2 ${
                  activeBounds.deltaType === "increase"
                    ? "border-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.6)]"
                    : "border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                }`}
              >
                {/* High-Tech Corner Brackets */}
                <div className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-white"></div>

                {/* Center Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-60">
                  <div className="w-2.5 h-[1px] bg-white"></div>
                  <div className="h-2.5 w-[1px] bg-white"></div>
                </div>

                {/* Region Tag Badge Attached to Target Frame */}
                <div
                  className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-lg border ${
                    activeBounds.deltaType === "increase"
                      ? "bg-purple-950/90 text-purple-200 border-purple-500"
                      : "bg-orange-950/90 text-orange-200 border-orange-500"
                  }`}
                >
                  {selectedRegion}
                </div>
              </div>
            </div>
          )}

          {/* MODE A: HORIZONTAL SCANNING LASER (PHASE-LOCKED TO STEREO PANNING) */}
          {isPlaying && isAnnualPhase && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none transition-all duration-75"
              style={{ left: `${laserPercent}%`, width: "2px" }}
            >
              <div className="w-full h-full bg-cyan-400 shadow-[0_0_16px_#38bdf8]"></div>
              <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] opacity-80"></div>
            </div>
          )}
        </div>

        {/* 3. MODE B SCIENTIFIC SPECTRAL SCALE HUD (NO OVERLAY DOTS) */}
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

        {/* Bottom Corner Scientific Calibration Disclaimer Watermark */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 border border-slate-800 max-w-xs text-right leading-tight z-10 hidden sm:block">
          <span className="text-slate-300 font-semibold flex items-center justify-end gap-1 mb-0.5">
            <Info className="w-2.5 h-2.5 text-sky-400" /> Visual Estimates
          </span>
          NASA SVS #5313 • Dedicated Mode Chunk • Clean Projection
        </div>
      </div>
    </div>
  );
};
