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
  Globe2,
  Map,
  Eye,
  Split,
} from "lucide-react";
import { InteractiveGlobe } from "./InteractiveGlobe";

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
    hasComparison: boolean;
  }
> = {
  India: {
    title: "SOUTH ASIA • INDIA",
    subtitle: "Saubhagya Rural Electrification Expansion (2012 → 2023)",
    deltaText: "+34.2% Radiance Growth",
    deltaType: "increase",
    hasComparison: true,
  },
  Ukraine: {
    title: "EASTERN EUROPE • UKRAINE",
    subtitle: "Conflict-Impacted Power Grid Corridors & Blackouts",
    deltaText: "-42.1% Blackout Decline",
    deltaType: "decrease",
    hasComparison: true,
  },
  "Western Europe": {
    title: "WESTERN EUROPE • CONTINENTAL GRID",
    subtitle: "High-Efficiency LED Grid Transition & Stable Luminance",
    deltaText: "Stable Grid / LED Shift",
    deltaType: "increase",
    hasComparison: true,
  },
  "Eastern Mediterranean": {
    title: "EASTERN MEDITERRANEAN & LEVANT",
    subtitle: "Demographic & Infrastructure Variance (Syria, Lebanon, Israel)",
    deltaText: "Localized Dynamic Variance",
    deltaType: "decrease",
    hasComparison: true,
  },
  "Overview (All Insets)": {
    title: "GLOBAL 4-REGIONAL COMPARATIVE INSET ARRAY",
    subtitle: "Simultaneous Multi-Region Telemetry (India, Ukraine, Europe, Levant)",
    deltaText: "4-Region Inset Array",
    deltaType: "increase",
    hasComparison: true,
  },
};

// Mode duration definitions in seconds
const MODE_DURATIONS: Record<string, number> = {
  annual: 12.0,
  change: 12.0,
  regional: 10.0,
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
  const [viewFormat, setViewFormat] = useState<"2d" | "3d">("2d");
  const [contrastBoost, setContrastBoost] = useState<boolean>(true);
  const [manualZoom, setManualZoom] = useState<number>(1.0);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [regionalSubView, setRegionalSubView] = useState<"change" | "compare">("change");

  const isRegional = currentMode === "regional";
  const isChangePhase = currentMode === "change";
  const isAnnualPhase = currentMode === "annual";

  // Mode A Current Calendar Year (2012 to 2023)
  const currentYear = 2012 + Math.min(11, Math.max(0, Math.floor(currentTime)));

  // Target image path for 2D mode - Dynamic Evolution & Side-by-Side Comparison for ALL regions
  const get2DImageSrc = () => {
    if (isAnnualPhase) {
      return `/datasets/night-lights/annual/year_${currentYear}.jpg`;
    }
    if (isChangePhase) {
      return `/datasets/night-lights/global_change.jpg`;
    }

    // Regional mode: Side-by-side view
    if (regionalSubView === "compare") {
      if (selectedRegion === "India") return "/datasets/night-lights/regional/india_compare.jpg";
      if (selectedRegion === "Ukraine") return "/datasets/night-lights/regional/ukraine_compare.jpg";
      if (selectedRegion === "Western Europe") return "/datasets/night-lights/regional/europe_compare.jpg";
      if (selectedRegion === "Eastern Mediterranean") return "/datasets/night-lights/regional/mediterranean_compare.jpg";
      return "/datasets/night-lights/regional/overview_compare.jpg";
    }

    // Dynamic Evolution when playing in "change" layer:
    // 0 to 3.5s: 2012 baseline -> 3.5 to 7.0s: 2023 state -> 7.0 to 10s: decadal difference
    const phaseKey = isPlaying
      ? (currentTime < 3.5 ? "2012" : currentTime < 7.0 ? "2023" : "change")
      : "change";

    if (selectedRegion === "India") {
      return phaseKey === "2012"
        ? "/datasets/night-lights/regional/india_2012.jpg"
        : phaseKey === "2023"
        ? "/datasets/night-lights/regional/india_2023.jpg"
        : "/datasets/night-lights/regional/india_change.jpg";
    }
    if (selectedRegion === "Ukraine") {
      return phaseKey === "2012"
        ? "/datasets/night-lights/regional/ukraine_2012.jpg"
        : phaseKey === "2023"
        ? "/datasets/night-lights/regional/ukraine_2023.jpg"
        : "/datasets/night-lights/regional/ukraine_change.jpg";
    }
    if (selectedRegion === "Western Europe") {
      return phaseKey === "2012"
        ? "/datasets/night-lights/regional/europe_2012.jpg"
        : phaseKey === "2023"
        ? "/datasets/night-lights/regional/europe_2023.jpg"
        : "/datasets/night-lights/regional/europe_change.jpg";
    }
    if (selectedRegion === "Eastern Mediterranean") {
      return phaseKey === "2012"
        ? "/datasets/night-lights/regional/mediterranean_2012.jpg"
        : phaseKey === "2023"
        ? "/datasets/night-lights/regional/mediterranean_2023.jpg"
        : "/datasets/night-lights/regional/mediterranean_change.jpg";
    }
    return "/datasets/night-lights/regional/overview_change.jpg";
  };

  const activeBounds = REGION_BOUNDS[selectedRegion] || REGION_BOUNDS["India"];
  const maxDuration = MODE_DURATIONS[currentMode] || 12.0;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / maxDuration) * 100));

  // Reset zoom & regional sub-view when mode or region changes
  useEffect(() => {
    setIsManualOverride(false);
    setManualZoom(1.0);
    setRegionalSubView("change");
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
  };

  // Mode A Scanning Laser (Sweeps 0% to 100% across the map every 1 second)
  const laserPercent = (currentTime % 1.0) * 100;

  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}.${ms}s`;
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
              ? "Mode A: Annual Evolution (2012–2023)"
              : currentMode === "change"
              ? "Mode B: Decadal Change Map"
              : `Mode C: Regional Insets (${selectedRegion})`}
          </span>

          {/* Mode A: Clean Calendar Year */}
          {currentMode === "annual" && (
            <span className="font-mono text-emerald-400 text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Year {currentYear}
            </span>
          )}
        </div>

        {/* Right: Stage Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 2D Flat Map vs 3D Interactive Globe Toggle */}
          <div className="flex items-center bg-slate-950/90 rounded-lg border border-slate-700/80 p-0.5 text-[11px] font-mono shadow-md">
            <button
              onClick={() => setViewFormat("2d")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewFormat === "2d"
                  ? "bg-sky-500 text-black font-bold shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to 2D Single-Projection Flat Map"
            >
              <Map className="w-3.5 h-3.5" />
              <span>2D Flat</span>
            </button>
            <button
              onClick={() => setViewFormat("3d")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                viewFormat === "3d"
                  ? "bg-purple-600 text-white font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Switch to NASA SVS #5475 Interactive 3D Globe"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>3D Globe</span>
            </button>
          </div>

          {/* 2D Specific Controls */}
          {viewFormat === "2d" && (
            <>
              {/* Aspect Fit Mode: Sharp Contain vs Cover */}
              <button
                onClick={() => setFitMode(fitMode === "contain" ? "cover" : "contain")}
                title={fitMode === "contain" ? "Switch to Fill Screen" : "Switch to 100% Sharp (Contain)"}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
              >
                {fitMode === "contain" ? (
                  <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>{fitMode === "contain" ? "100% Sharp" : "Fill (Cover)"}</span>
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
            </>
          )}
        </div>
      </div>

      {/* 2. REGIONAL TELEMETRY BANNER (DOCKED ABOVE CANVAS - 100% UNOBSTRUCTED MAP) */}
      {/* Moved completely out of the map canvas so no portion of the map is hidden! */}
      {isRegional && activeBounds && viewFormat === "2d" && (
        <div className="mb-3 p-3.5 rounded-2xl bg-slate-950/95 border border-sky-500/50 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          {/* Target Metadata Info */}
          <div className="flex flex-col gap-0.5 min-w-[280px]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Regional Telemetry Target
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                  activeBounds.deltaType === "increase"
                    ? "bg-purple-950/70 text-purple-300 border-purple-600"
                    : "bg-orange-950/70 text-orange-300 border-orange-600"
                }`}
              >
                {activeBounds.deltaText}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{activeBounds.title}</h3>
              <span className="text-xs text-slate-300 hidden md:inline">• {activeBounds.subtitle}</span>
            </div>
          </div>

          {/* Layer Selector: Decadal Change vs 2012 vs 2023 Side-by-Side (Active for ALL 4 Regions + Overview!) */}
          <div className="flex items-center gap-1.5 bg-slate-900/95 p-1 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-[11px] font-mono text-slate-400 px-1.5 hidden sm:inline font-semibold">View Layer:</span>
            <button
              onClick={() => setRegionalSubView("change")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all border ${
                regionalSubView === "change"
                  ? "bg-purple-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)] font-bold"
                  : "bg-slate-950/60 text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Decadal Change (Purple/Orange)</span>
            </button>
            <button
              onClick={() => setRegionalSubView("compare")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all border ${
                regionalSubView === "compare"
                  ? "bg-sky-500 text-black border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.5)] font-bold"
                  : "bg-slate-950/60 text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Split className="w-3 h-3" />
              <span>2012 vs 2023 Side-by-Side</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN SATELLITE CANVAS - 100% UNOBSTRUCTED */}
      <div className="relative w-full h-[340px] sm:h-[400px] md:h-[460px] lg:h-[500px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl flex items-center justify-center">
        {/* VIEW A: 3D INTERACTIVE GLOBE (NASA SVS #5475) */}
        {viewFormat === "3d" ? (
          <InteractiveGlobe
            currentMode={currentMode}
            currentYear={currentYear}
            isPlaying={isPlaying}
          />
        ) : (
          /* VIEW B: 2D HIGH-DEFINITION SINGLE-PROJECTION FLAT MAP */
          <div
            className={`relative max-w-full max-h-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out ${
              fitMode === "contain" ? "w-full aspect-[16/9]" : "w-full h-full"
            }`}
            style={{
              transform: isManualOverride ? `scale(${manualZoom})` : "scale(1)",
            }}
          >
            {/* High-Definition Satellite Frame */}
            <img
              src={get2DImageSrc()}
              alt={`NASA Satellite Imagery - ${currentMode}`}
              className={`w-full h-full ${
                fitMode === "contain" ? "object-contain" : "object-cover"
              } select-none transition-all duration-200 ${
                contrastBoost
                  ? "brightness-110 contrast-125 saturate-120"
                  : "brightness-100 contrast-100"
              }`}
            />

            {/* Hidden Video ref for timeline synchronization */}
            <video
              ref={videoRef}
              src="/datasets/night-lights/annual_timeline_12s.mp4"
              playsInline
              muted
              loop
              className="hidden"
            />

            {/* MODE A: HORIZONTAL SCANNING LASER SWEEP (1 SECOND PER YEAR) */}
            {isPlaying && isAnnualPhase && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{ left: `${laserPercent}%`, width: "2px" }}
              >
                <div className="w-full h-full bg-cyan-400 shadow-[0_0_16px_#38bdf8]"></div>
                <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#38bdf8] opacity-80"></div>
              </div>
            )}

            {/* MODE B: LONGITUDINAL SCANNER (WEST TO EAST OVER 12 SECONDS - NASA CALDWELL 73) */}
            {isPlaying && isChangePhase && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{ left: `${(currentTime / maxDuration) * 100}%`, width: "2.5px" }}
              >
                <div className="w-full h-full bg-gradient-to-b from-purple-400 via-sky-300 to-orange-400 shadow-[0_0_18px_#a855f7]"></div>
                <div className="absolute top-2 -left-2 w-5 h-5 rounded-full bg-purple-400 shadow-[0_0_14px_#c084fc] opacity-90 animate-pulse"></div>
              </div>
            )}

            {/* MODE B: ORANGE SECTOR SCAN DETECT (UKRAINE & LEVANT OUTAGE CORRIDOR) */}
            {isPlaying && isChangePhase && currentTime >= 4.8 && currentTime < 7.4 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-orange-950/95 border border-orange-500/80 rounded-xl px-3.5 py-1.5 shadow-[0_0_24px_rgba(249,115,22,0.5)] flex items-center gap-2 z-30 animate-pulse">
                <Flame className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="font-mono text-xs text-orange-200 font-bold tracking-tight">
                  SECTOR SCAN: Ukraine & Levant Outage Corridor (-42.1%) • Bowed Cello
                </span>
              </div>
            )}

            {/* MODE B: PURPLE SECTOR SCAN DETECT (SOUTH ASIA ELECTRIFICATION) */}
            {isPlaying && isChangePhase && currentTime >= 7.8 && currentTime <= 11.5 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-purple-950/95 border border-purple-500/80 rounded-xl px-3.5 py-1.5 shadow-[0_0_24px_rgba(168,85,247,0.5)] flex items-center gap-2 z-30 animate-pulse">
                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-mono text-xs text-purple-200 font-bold tracking-tight">
                  SECTOR SCAN: South Asia Rural Electrification (+34.2%) • Chimes
                </span>
              </div>
            )}

            {/* MODE C: DYNAMIC 2012 -> 2023 EVOLUTION BADGE */}
            {isRegional && isPlaying && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-sky-500/60 rounded-xl px-3.5 py-1.5 shadow-2xl flex items-center gap-2 z-30 animate-fadeIn">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="font-mono text-xs text-slate-200 font-bold">
                  {regionalSubView === "compare"
                    ? "Side-by-Side Dual Telemetry Active"
                    : currentTime < 3.5
                    ? "Timeline: 2012 Satellite Baseline (Pre-Expansion)"
                    : currentTime < 7.0
                    ? "Timeline: 2023 Current Grid (Electrification/Outage)"
                    : "Timeline: Decadal Difference (Purple: Growth, Orange: Drop)"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MODE B SCIENTIFIC SPECTRAL SCALE HUD */}
        {isChangePhase && viewFormat === "2d" && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-md bg-slate-950/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-1.5 text-[11px] font-mono">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Decadal Lighting Intensity Scale (2012 → 2023)
              </span>
              <span className="text-emerald-400 font-semibold">+1.53% Net Growth</span>
            </div>
            <div className="relative w-full h-3 rounded-full overflow-hidden shadow-inner border border-slate-700">
              <div className="w-full h-full bg-gradient-to-r from-orange-500 via-slate-800 to-purple-500"></div>
            </div>
            <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono">
              <span className="text-orange-400 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3" /> Orange: Less Light (-100% Cello)
              </span>
              <span className="text-purple-400 font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" /> Purple: More Light (+100% Chimes)
              </span>
            </div>
          </div>
        )}

        {/* MODE C REGIONAL QUICK-SELECTOR BUTTONS (Bottom Left Inside Canvas) */}
        {isRegional && viewFormat === "2d" && (
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
                      : "bg-slate-950/85 text-slate-300 border-slate-700 hover:bg-slate-800"
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
            <Info className="w-2.5 h-2.5 text-sky-400" /> NASA SVS #5276 / #5475 / #5634
          </span>
          Decadal High-Definition Telemetry
        </div>
      </div>

      {/* 4. SCIENTIFIC PLAYBACK TIMELINE & PROGRESS SCRUBBER BAR */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-col gap-2">
        {/* Interactive Clickable Scrubber Track */}
        <div
          onClick={handleTimelineClick}
          className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 cursor-pointer group"
          title="Click to seek along timeline"
        >
          {/* Active Elapsed Fill with Mode-Specific Glow */}
          <div
            className={`h-full transition-all duration-75 ${
              currentMode === "annual"
                ? "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                : currentMode === "change"
                ? "bg-gradient-to-r from-orange-500 via-purple-500 to-purple-400 shadow-[0_0_12px_rgba(192,132,252,0.7)]"
                : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timeline Status Display */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          {/* Left: Elapsed Time */}
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
                <span>Year {currentYear}</span>
                <span className="text-emerald-500/70">
                  ({currentYear - 2012 + 1}/12)
                </span>
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
