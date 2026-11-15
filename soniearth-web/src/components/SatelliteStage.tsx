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
  currentDataset?: string;
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
  currentDataset = "night-lights",
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

  const isLightning = currentDataset === "iss-lightning";
  const isRegional = currentMode === "regional";
  const isChangePhase = currentMode === "change";
  const isAnnualPhase = currentMode === "annual";

  // High-performance, zero-buffering local mode clips
  const videoSrc = isLightning
    ? "/datasets/iss-lightning/chunk_iss_lightning.webm"
    : currentMode === "annual"
    ? "/datasets/night-lights/chunk_mode_a.webm"
    : currentMode === "change"
    ? "/datasets/night-lights/chunk_mode_b.webm"
    : "/datasets/night-lights/chunk_mode_c.webm";

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
  const maxDuration = isLightning ? 216.7 : (MODE_DURATIONS[currentMode] || 12.0);
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
    <div className="relative flex flex-col bg-[#080D12]/90 backdrop-blur-xl border border-emerald-500/25 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden group">
      {/* 1. STAGE TOP CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        {/* Left: Telemetry & Status */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-mono font-bold text-white drop-shadow-[0_0_8px_rgba(0,245,155,0.3)]">
            {isLightning ? <Zap className="w-4 h-4 text-emerald-400" /> : <Scan className="w-4 h-4 text-emerald-400" />}
            {isLightning ? "ISS Optical Lightning Stage" : "NASA Satellite Optical Stage"}
          </span>
          <span className="text-emerald-900">|</span>
          <span
            className="font-mono font-semibold px-2.5 py-0.5 rounded-full border shadow-sm text-emerald-300 bg-emerald-950/70 border-emerald-500/40 shadow-[0_0_10px_rgba(0,245,155,0.2)]"
          >
            {isLightning
              ? "NASA SVS #5011 • LIS on ISS (2017–2023)"
              : currentMode === "annual"
              ? "Mode A: Annual Evolution (2012–2023)"
              : currentMode === "change"
              ? "Mode B: Decadal Change Map"
              : `Mode C: Regional Insets (${selectedRegion})`}
          </span>
          {isLightning && (
            <span className="font-mono text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 hidden md:inline-flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,245,155,0.15)]">
              <span>Alt: 408 km</span>
              <span className="text-slate-600">•</span>
              <span>Speed: 7.66 km/s</span>
            </span>
          )}

          {/* Mode A: Clean Calendar Year */}
          {!isLightning && currentMode === "annual" && (
            <span className="font-mono text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center gap-1 shadow-[0_0_8px_rgba(0,245,155,0.15)]">
              <Calendar className="w-3 h-3" />
              Year {currentYear}
            </span>
          )}
        </div>

        {/* Right: Stage Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 2D Flat Map vs 3D Interactive Globe Toggle (Only for Night Lights) */}
          {!isLightning && (
            <div className="flex items-center bg-black/60 rounded-xl border border-emerald-500/20 p-0.5 text-[11px] font-mono shadow-md">
              <button
                onClick={() => setViewFormat("2d")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  viewFormat === "2d"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,245,155,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Switch to 2D Single-Projection Flat Map"
              >
                <Map className="w-3.5 h-3.5" />
                <span>2D Flat</span>
              </button>
              <button
                onClick={() => setViewFormat("3d")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  viewFormat === "3d"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,245,155,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Switch to NASA SVS #5475 Interactive 3D Globe"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>3D Globe</span>
              </button>
            </div>
          )}

          {/* 2D Specific Controls */}
          {viewFormat === "2d" && (
            <>
              {/* Contrast Boost Toggle */}
              <button
                onClick={() => setContrastBoost(!contrastBoost)}
                title="Toggle High-Contrast Satellite Radiance Boost"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                  contrastBoost
                    ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(0,245,155,0.25)]"
                    : "bg-black/60 text-slate-400 border-emerald-500/20 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Radiance Boost: {contrastBoost ? "ON" : "OFF"}</span>
              </button>

              {/* Interactive Zoom Tools */}
              <div className="flex items-center bg-black/80 rounded-lg border border-emerald-500/20 p-0.5">
                <button
                  onClick={handleManualZoomIn}
                  className="p-1 hover:bg-emerald-950/60 rounded text-slate-300 hover:text-emerald-400"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleManualZoomOut}
                  className="p-1 hover:bg-emerald-950/60 rounded text-slate-300 hover:text-emerald-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 hover:bg-emerald-950/60 rounded text-slate-400 hover:text-emerald-400"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. REGIONAL TELEMETRY BANNER (Only for Night Lights Mode C in 2D) */}
      {!isLightning && isRegional && activeBounds && viewFormat === "2d" && (
        <div className="mb-2 p-2.5 rounded-xl bg-black/60 border border-emerald-500/30 shadow-xl flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          {/* Target Metadata Info */}
          <div className="flex flex-col gap-0.5 min-w-[260px]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Regional Telemetry Target
              </span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(0,245,155,0.2)]"
              >
                {activeBounds.deltaText}
              </span>
            </div>
            <div className="flex flex-wrap items-baseline gap-2 mt-0.5">
              <h3 className="text-sm font-bold text-white tracking-tight">{activeBounds.title}</h3>
              <span className="text-xs text-slate-400 hidden md:inline">• {activeBounds.subtitle}</span>
            </div>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center gap-1.5 bg-[#06080A] p-1 rounded-xl border border-emerald-500/20 shadow-inner">
            <button
              onClick={() => setRegionalSubView("change")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                regionalSubView === "change"
                  ? "bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(0,245,155,0.3)] font-bold"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Decadal Change</span>
            </button>
            <button
              onClick={() => setRegionalSubView("compare")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                regionalSubView === "compare"
                  ? "bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(0,245,155,0.3)] font-bold"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN SATELLITE CANVAS - Option A: Natural 16:9 Edge-to-Edge Cinema Fit (Zero side space, Zero crop) */}
      <div className="relative w-full aspect-video bg-[#06080A] rounded-2xl overflow-hidden border border-emerald-500/25 shadow-2xl flex items-center justify-center">
        {/* IF ISS LIGHTNING: Dedicated NASA Optical Flight Deck Video */}
        {isLightning ? (
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
            style={{
              transform: isManualOverride ? `scale(${manualZoom})` : "scale(1)",
            }}
          >
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
              className={`w-full h-full object-contain select-none pointer-events-none transition-all duration-300 ${
                contrastBoost
                  ? "brightness-125 contrast-140 saturate-150"
                  : "brightness-100 contrast-100"
              }`}
            />

            {/* Sleek Minimalist ISS Telemetry Pill - 100% Unobstructed Video */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
              <span className="font-mono text-[11px] font-bold text-white bg-[#06080A]/85 px-3 py-1 rounded-xl border border-emerald-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-xl">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>ISS LIS Orbit</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-300 font-normal">LEO 51.6°</span>
              </span>

              {/* Dynamic Live Strike Readout Pill */}
              {isPlaying && currentFeature?.isStrike && (
                <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-xl border border-emerald-400/80 shadow-[0_0_15px_rgba(0,245,155,0.4)] flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                  <span>FLASH: {Math.round(currentFeature.strikeEnergyMicroJoules || 450)} µJ</span>
                </span>
              )}
            </div>


          </div>
        ) : viewFormat === "3d" ? (
          /* VIEW A: 3D INTERACTIVE GLOBE (NASA SVS #5475 for Night Lights) */
          <InteractiveGlobe
            currentMode={currentMode}
            currentYear={currentYear}
            isPlaying={isPlaying}
          />
        ) : (
          /* VIEW B: 2D SINGLE-PROJECTION FLAT MAP FOR NIGHT LIGHTS - Natural 16:9 Edge-to-Edge Fit */
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out"
            style={{
              transform: isManualOverride ? `scale(${manualZoom})` : "scale(1)",
            }}
          >
            {/* High-Definition Satellite Frame - 100% Unclipped Zero-Cut Fit */}
            <img
              src={get2DImageSrc()}
              alt={`NASA Satellite Imagery - ${currentMode}`}
              className={`w-full h-full object-contain select-none transition-all duration-200 ${
                contrastBoost
                  ? "brightness-110 contrast-125 saturate-120"
                  : "brightness-100 contrast-100"
              }`}
            />

            {/* Hidden Video ref for timeline synchronization */}
            <video
              ref={videoRef}
              src="/datasets/night-lights/chunk_mode_a.webm"
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
                <div className="w-full h-full bg-[#00F59B] shadow-[0_0_16px_#00F59B]"></div>
                <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-emerald-300 shadow-[0_0_12px_#00F59B] opacity-85"></div>
              </div>
            )}

            {/* MODE B: LONGITUDINAL SCANNER (WEST TO EAST OVER 12 SECONDS - NASA CALDWELL 73) */}
            {isPlaying && isChangePhase && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{ left: `${(currentTime / maxDuration) * 100}%`, width: "2.5px" }}
              >
                <div className="w-full h-full bg-gradient-to-b from-emerald-400 via-teal-300 to-[#00F59B] shadow-[0_0_18px_#00F59B]"></div>
                <div className="absolute top-2 -left-2 w-5 h-5 rounded-full bg-[#00F59B] shadow-[0_0_14px_#00F59B] opacity-90 animate-pulse"></div>
              </div>
            )}

            {/* MODE B: ORANGE SECTOR SCAN DETECT (UKRAINE & LEVANT OUTAGE CORRIDOR) */}
            {isPlaying && isChangePhase && currentTime >= 4.8 && currentTime < 7.4 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#06080A]/95 border border-emerald-500/80 rounded-xl px-3.5 py-1.5 shadow-[0_0_24px_rgba(0,245,155,0.4)] flex items-center gap-2 z-30 animate-pulse">
                <Flame className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-xs text-emerald-200 font-bold tracking-tight">
                  SECTOR SCAN: Ukraine & Levant Outage Corridor (-42.1%) • Bowed Cello
                </span>
              </div>
            )}

            {/* MODE B: PURPLE SECTOR SCAN DETECT (SOUTH ASIA ELECTRIFICATION) */}
            {isPlaying && isChangePhase && currentTime >= 7.8 && currentTime <= 11.5 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#06080A]/95 border border-emerald-500/80 rounded-xl px-3.5 py-1.5 shadow-[0_0_24px_rgba(0,245,155,0.4)] flex items-center gap-2 z-30 animate-pulse">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono text-xs text-emerald-200 font-bold tracking-tight">
                  SECTOR SCAN: South Asia Rural Electrification (+34.2%) • Chimes
                </span>
              </div>
            )}

            {/* MODE C: DYNAMIC 2012 -> 2023 EVOLUTION BADGE */}
            {isRegional && isPlaying && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#06080A]/95 border border-emerald-500/60 rounded-xl px-3.5 py-1.5 shadow-2xl flex items-center gap-2 z-30 animate-fadeIn">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                <span className="font-mono text-xs text-emerald-200 font-bold">
                  {regionalSubView === "compare"
                    ? "Side-by-Side Dual Telemetry Active"
                    : currentTime < 3.5
                    ? "Timeline: 2012 Satellite Baseline (Pre-Expansion)"
                    : currentTime < 7.0
                    ? "Timeline: 2023 Current Grid (Electrification/Outage)"
                    : "Timeline: Decadal Difference (Growth & Blackout Analysis)"}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MODE B SCIENTIFIC SPECTRAL SCALE HUD (Only for Night Lights in 2D) */}
        {!isLightning && isChangePhase && viewFormat === "2d" && (
          <div className="absolute bottom-3 right-3 bg-[#06080A]/85 backdrop-blur-md border border-emerald-500/30 rounded-xl px-3 py-2 shadow-xl z-20 max-w-xs">
            <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Decadal Lighting Intensity Scale
              </span>
              <span className="text-emerald-400 font-semibold">+1.53% Net</span>
            </div>
            <div className="relative w-full h-2 rounded-full overflow-hidden shadow-inner border border-emerald-500/20">
              <div className="w-full h-full bg-gradient-to-r from-slate-700 via-emerald-800 to-[#00F59B]"></div>
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-slate-400" /> Less Light (Cello)
              </span>
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-emerald-400" /> More Light (Chimes)
              </span>
            </div>
          </div>
        )}

        {/* MODE C REGIONAL QUICK-SELECTOR BUTTONS (Only for Night Lights in 2D) */}
        {!isLightning && isRegional && viewFormat === "2d" && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-20">
            {Object.keys(REGION_BOUNDS).map((regName) => {
              const isCurrent = selectedRegion === regName;
              return (
                <button
                  key={regName}
                  onClick={() => onSelectRegion?.(regName)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all border ${
                    isCurrent
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 border-emerald-300 shadow-[0_0_10px_rgba(0,245,155,0.4)] font-bold"
                      : "bg-[#06080A]/80 text-slate-300 border-emerald-500/20 hover:bg-emerald-950/40 hover:border-emerald-500/40"
                  }`}
                >
                  {regName}
                </button>
              );
            })}
          </div>
        )}

        {/* Scientific Watermark */}
        <div
          className={`absolute ${
            isLightning ? "top-3 right-3" : "bottom-3 right-3"
          } bg-[#06080A]/85 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-mono text-slate-400 border border-emerald-500/20 max-w-xs text-right leading-tight z-10 hidden sm:block`}
        >
          {isLightning ? (
            <>
              <span className="text-emerald-300 font-semibold flex items-center justify-end gap-1 mb-0.5">
                <Zap className="w-2.5 h-2.5 text-emerald-400" /> NASA SVS #5011
              </span>
              ISS LIS Transient Lightning Telemetry
            </>
          ) : (
            <>
              <span className="text-slate-300 font-semibold flex items-center justify-end gap-1 mb-0.5">
                <Info className="w-2.5 h-2.5 text-emerald-400" /> NASA SVS #5276 / #5475 / #5634
              </span>
              Decadal High-Definition Telemetry
            </>
          )}
        </div>
      </div>

      {/* 4. SCIENTIFIC PLAYBACK TIMELINE & PROGRESS SCRUBBER BAR */}
      <div className="mt-2.5 pt-2.5 border-t border-emerald-500/20 flex flex-col gap-2">
        {/* Interactive Clickable Scrubber Track with glowing thumb/head */}
        <div
          onClick={handleTimelineClick}
          className="relative w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-emerald-500/30 cursor-pointer group hover:h-3 transition-all"
          title="Click to seek along timeline"
        >
          {/* Active Elapsed Fill with Laser Mint Glow */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-[#00F59B] shadow-[0_0_15px_rgba(0,245,155,0.8)] transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timeline Status Display */}
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
          {/* Left: Elapsed Time */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-bold text-white bg-black/80 px-2 py-0.5 rounded border border-emerald-500/30 shadow-inner">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{formatTime(currentTime)}</span>
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-semibold">{formatTime(maxDuration)}</span>

            {/* In Lightning Mode: Dynamic Optical Strike Indicator */}
            {isLightning ? (
              currentFeature?.isStrike ? (
                <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-500/80 px-2.5 py-0.5 rounded text-[10px] animate-pulse shadow-[0_0_10px_rgba(0,245,155,0.5)]">
                  <Zap className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                  <span>BURST: {currentFeature.strikeEnergyMicroJoules} µJ</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400/80 bg-black/60 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px]">
                  <Zap className="w-3 h-3 text-emerald-400/50" />
                  <span>55 Hz Sub-Bass Orbit</span>
                </span>
              )
            ) : null}

            {/* In Mode A: Current Calendar Year Indicator */}
            {!isLightning && currentMode === "annual" && (
              <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px] shadow-[0_0_8px_rgba(0,245,155,0.15)]">
                <Calendar className="w-3 h-3" />
                <span>Year {currentYear}</span>
                <span className="text-emerald-500/70">({Math.min(12, Math.floor(currentTime) + 1)}/12)</span>
              </span>
            )}

            {/* In Mode C: Target Region Name */}
            {!isLightning && currentMode === "regional" && (
              <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px]">
                <MapPin className="w-3 h-3" />
                <span>{selectedRegion}</span>
              </span>
            )}
          </div>

          {/* Right: Progress Percentage & Status */}
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-slate-400">
              Progress: <strong className="text-emerald-300">{progressPercent.toFixed(0)}%</strong>
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-700"></span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              {isPlaying ? (
                progressPercent >= 99 ? (
                  <span className="text-emerald-300 font-bold">Looping...</span>
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
