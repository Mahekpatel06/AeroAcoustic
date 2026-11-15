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
  Waves,
  Wind,
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
  onTogglePlay?: () => void;
  videoRef: React.Ref<HTMLVideoElement>;
  depthMeters?: number;
  onChangeDepth?: (depth: number) => void;
  selectedBasin?: string;
  onSelectBasin?: (basinId: string, basinName: string, pan: number) => void;
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
  onTogglePlay,
  videoRef,
  depthMeters = 0,
  onChangeDepth,
  selectedBasin = "ALL",
  onSelectBasin,
}) => {
  const [viewFormat, setViewFormat] = useState<"2d" | "3d">("2d");
  const [contrastBoost, setContrastBoost] = useState<boolean>(true);
  const [manualZoom, setManualZoom] = useState<number>(1.0);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("contain");
  const [regionalSubView, setRegionalSubView] = useState<"change" | "compare">("change");
  const [videoError, setVideoError] = useState<boolean>(false);

  // Reset video error state on dataset switch
  useEffect(() => {
    setVideoError(false);
  }, [currentDataset]);

  const isLightning = currentDataset === "iss-lightning";
  const isOcean = currentDataset === "ocean-currents";
  const isCO2 = currentDataset === "dyamond-co2";
  const isRegional = currentMode === "regional";
  const isChangePhase = currentMode === "change";
  const isAnnualPhase = currentMode === "annual";

  // Ocean Thermocline & Depth Calculations
  const depthFactor = Math.exp(-depthMeters / 350.0);
  const rawSST = currentFeature?.temperatureCelsius ?? 18.0;
  const thermoclineTemp = Number((rawSST * depthFactor + 2.0).toFixed(1));
  const hydrostaticAtm = 1 + Math.round(depthMeters / 10);

  // High-performance, zero-buffering local mode clips
  const videoSrc = isCO2
    ? "/datasets/dyamond-co2/chunk_dyamond_co2.mp4"
    : isLightning
    ? "/datasets/iss-lightning/chunk_iss_lightning.webm"
    : isOcean
    ? "/datasets/ocean-currents/chunk_ocean_currents.webm"
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
  const maxDuration = isCO2
    ? 39.2
    : isLightning
    ? 216.7
    : isOcean
    ? 66.7
    : (MODE_DURATIONS[currentMode] || 12.0);
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
    <div className="relative flex flex-col bg-[#06121D]/90 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden group">
      {/* 1. STAGE TOP CONTROL BAR */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        {/* Left: Telemetry & Status */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-mono font-bold text-slate-200">
            {isCO2 ? (
              <Wind className="w-4 h-4 text-cyan-400" />
            ) : isOcean ? (
              <Waves className="w-4 h-4 text-teal-400" />
            ) : isLightning ? (
              <Zap className="w-4 h-4 text-amber-400" />
            ) : (
              <Scan className="w-4 h-4 text-cyan-400" />
            )}
            {isCO2
              ? "NASA DYAMOND Global CO2 Stage"
              : isOcean
              ? "NASA ECCO2 Ocean Currents Stage"
              : isLightning
              ? "ISS Optical Lightning Stage"
              : "NASA Satellite Optical Stage"}
          </span>
          <span className="text-cyan-900">|</span>
          <span
            className={`font-mono font-semibold px-2.5 py-0.5 rounded border ${
              isCO2
                ? "text-cyan-300 bg-cyan-950/60 border-cyan-800/40"
                : isOcean
                ? "text-teal-300 bg-teal-950/60 border-teal-800/40"
                : isLightning
                ? "text-amber-300 bg-amber-950/60 border-amber-800/40"
                : "text-cyan-300 bg-cyan-950/60 border-cyan-800/40"
            }`}
          >
            {isCO2
              ? "NASA SVS #5436 • GEOS Model (2020)"
              : isOcean
              ? "NASA SVS #3912 • ECCO2 Model (2005–2007)"
              : isLightning
              ? "NASA SVS #5011 • LIS on ISS (2017–2023)"
              : currentMode === "annual"
              ? "Mode A: Annual Evolution (2012–2023)"
              : currentMode === "change"
              ? "Mode B: Decadal Change Map"
              : `Mode C: Regional Insets (${selectedRegion})`}
          </span>
          {isCO2 && (
            <span className="font-mono text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 hidden md:inline-flex items-center gap-1.5 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
              <span>Model: GEOS-5 3D</span>
              <span className="text-slate-600">•</span>
              <span>Baseline: 414.3 ppm</span>
            </span>
          )}
          {isLightning && (
            <span className="font-mono text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 hidden md:inline-flex items-center gap-1.5 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
              <span>Alt: 408 km</span>
              <span className="text-slate-600">•</span>
              <span>Speed: 7.66 km/s</span>
            </span>
          )}
          {isOcean && (
            <span className="font-mono text-teal-400 text-xs font-bold px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800/40 hidden md:inline-flex items-center gap-1.5">
              <span>Model: ECCO2</span>
              <span className="text-slate-500">•</span>
              <span>SST: 0°C–32°C</span>
            </span>
          )}

          {/* Mode A: Clean Calendar Year */}
          {!isLightning && !isOcean && !isCO2 && currentMode === "annual" && (
            <span className="font-mono text-cyan-400 text-xs font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Year {currentYear}
            </span>
          )}
        </div>

        {/* Right: Stage Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 2D Flat Map vs 3D Interactive Globe Toggle (Enabled for Night Lights, Ocean Currents & DYAMOND CO2) */}
          {!isLightning && (
            <div className="flex items-center bg-black/60 rounded-xl border border-cyan-500/20 p-0.5 text-[11px] font-mono shadow-md">
              <button
                onClick={() => setViewFormat("2d")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                  viewFormat === "2d"
                    ? "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
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
                    ? "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
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
                    ? "bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                    : "bg-black/60 text-slate-400 border-cyan-500/20 hover:text-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Radiance Boost: {contrastBoost ? "ON" : "OFF"}</span>
              </button>

              {/* Interactive Zoom Tools */}
              <div className="flex items-center bg-black/80 rounded-lg border border-cyan-500/20 p-0.5">
                <button
                  onClick={handleManualZoomIn}
                  className="p-1 hover:bg-cyan-950/60 rounded text-slate-300 hover:text-cyan-400"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleManualZoomOut}
                  className="p-1 hover:bg-cyan-950/60 rounded text-slate-300 hover:text-cyan-400"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1 hover:bg-cyan-950/60 rounded text-slate-400 hover:text-cyan-400"
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
      {!isLightning && !isOcean && !isCO2 && isRegional && activeBounds && viewFormat === "2d" && (
        <div className="mb-3 p-3.5 rounded-2xl bg-slate-950/95 border border-sky-500/50 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          {/* Target Metadata Info */}
          <div className="flex flex-col gap-0.5 min-w-[260px]">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Regional Telemetry Target
              </span>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-cyan-950/70 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]"
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
          <div className="flex items-center gap-1.5 bg-[#06080A] p-1 rounded-xl border border-cyan-500/20 shadow-inner">
            <button
              onClick={() => setRegionalSubView("change")}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                regionalSubView === "change"
                  ? "bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold"
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
                  ? "bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] font-bold"
                  : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
              }`}
            >
              <Split className="w-3 h-3" />
              <span>Side-by-Side</span>
            </button>
          </div>
        </div>
      )}

      {/* 2b. Ocean Thermocline Depth Slice Controller (0m -> 200m -> 1000m) */}
      {isOcean && onChangeDepth && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-950/90 border border-teal-800/60 p-3 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-950/80 border border-teal-700/60 text-teal-400">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-teal-300 uppercase tracking-wider">
                  Thermal Depth Slice / Thermocline
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-200">
                  {depthMeters}m Depth
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                {depthMeters >= 800
                  ? "Abyssal Bathypelagic Zone (40 Hz Infrasound • 101 atm • Near-Freezing Abyssal Plain)"
                  : depthMeters >= 200
                  ? "Mesopelagic Thermocline Zone (Steep thermal gradient • 21 atm • Rapid temperature drop)"
                  : "Epipelagic Photic Zone (Sunlit solar heating • 1 atm • Rapid surface streamlines)"}
              </p>
            </div>
          </div>

          {/* Depth Preset Buttons & Slider */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onChangeDepth(0)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  depthMeters === 0
                    ? "bg-teal-500 text-black font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                0m Surface
              </button>
              <button
                onClick={() => onChangeDepth(200)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  depthMeters === 200
                    ? "bg-cyan-500 text-black font-bold shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                200m Thermocline
              </button>
              <button
                onClick={() => onChangeDepth(1000)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all ${
                  depthMeters === 1000
                    ? "bg-indigo-600 text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                1000m Abyssal (40 Hz)
              </button>
            </div>

            <div className="flex items-center gap-2 min-w-[130px] flex-1 sm:flex-initial">
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={depthMeters}
                onChange={(e) => onChangeDepth(Number(e.target.value))}
                className="w-full accent-teal-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN SATELLITE CANVAS - Natural 16:9 Cinema-Fit (Zero Side Space, Zero Cut) */}
      <div className="relative w-full aspect-video bg-[#04070C] rounded-2xl overflow-hidden border border-cyan-500/25 shadow-2xl flex items-center justify-center">
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
              <span className="font-mono text-[11px] font-bold text-white bg-[#06121D]/85 px-3 py-1 rounded-xl border border-cyan-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-xl">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>ISS LIS Orbit</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-300 font-normal">LEO 51.6°</span>
              </span>

              {/* Dynamic Live Strike Readout Pill */}
              {isPlaying && currentFeature?.isStrike && (
                <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/90 px-3 py-1 rounded-xl border border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block"></span>
                  <span>FLASH: {Math.round(currentFeature.strikeEnergyMicroJoules || 450)} µJ</span>
                </span>
              )}
            </div>


          </div>
        ) : viewFormat === "3d" ? (
          /* VIEW A: 3D INTERACTIVE GLOBE (NASA SVS #5475 for Night Lights / #3912 for Ocean / #5436 for CO2) */
          <InteractiveGlobe
            currentDataset={currentDataset}
            currentMode={currentMode}
            currentYear={currentYear}
            currentTime={currentTime}
            currentFeature={currentFeature}
            isPlaying={isPlaying}
            depthMeters={depthMeters}
            selectedBasin={selectedBasin}
            onSelectBasin={onSelectBasin}
          />
        ) : isOcean ? (
          /* VIEW OCEAN: 2D SATELLITE OPTICAL OCEAN FLIGHT DECK */
          <div
            className={`relative max-w-full max-h-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out ${
              fitMode === "contain" ? "w-full aspect-[2/1]" : "w-full h-full"
            }`}
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
              style={{
                filter: isOcean
                  ? `hue-rotate(${(depthMeters / 1000) * 35}deg) brightness(${
                      1 - (depthMeters / 1000) * 0.40
                    }) saturate(${1 - (depthMeters / 1000) * 0.30})`
                  : undefined,
              }}
              className={`w-full h-full ${
                fitMode === "contain" ? "object-contain" : "object-cover"
              } select-none pointer-events-none transition-all duration-300 ${
                contrastBoost
                  ? "brightness-125 contrast-140 saturate-150"
                  : "brightness-100 contrast-100"
              }`}
            />

            {/* Sleek Minimalist Oceanographic Telemetry Pill - 100% Unobstructed Video */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-20 pointer-events-none">
              <span className="font-mono text-[11px] font-bold text-white bg-[#06080A]/85 px-3 py-1 rounded-xl border border-teal-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-xl">
                <Waves className="w-3.5 h-3.5 text-teal-400" />
                <span>ECCO2 Ocean</span>
                <span className="text-slate-600">•</span>
                <span className="text-teal-300">{thermoclineTemp}°C</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-300 font-normal">{currentFeature?.currentVelocityKnots !== undefined ? `${currentFeature.currentVelocityKnots.toFixed(1)} kts` : "1.5 kts"}</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-300 font-normal">{depthMeters}m</span>
              </span>
            </div>

            {/* Thermal Spectrum Legend Bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-1.5 z-20 flex items-center gap-3 text-[10px] font-mono shadow-2xl">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> 0°C Polar Cello
              </span>
              <span className="text-slate-600">───</span>
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span> 15°C Ocean Gyres
              </span>
              <span className="text-slate-600">───</span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> 30°C Equatorial Strings
              </span>
            </div>
          </div>
        ) : isCO2 ? (
          /* VIEW CO2: 2D SATELLITE OPTICAL DYAMOND GLOBAL CO2 FLIGHT DECK */
          <div
            className={`relative max-w-full max-h-full flex items-center justify-center overflow-hidden transition-transform duration-300 ease-out ${
              fitMode === "contain" ? "w-full aspect-[2/1]" : "w-full h-full"
            }`}
            style={{
              transform: isManualOverride ? `scale(${manualZoom})` : "scale(1)",
            }}
          >
            {videoError ? (
              /* Zero-latency high-res frame playback fallback from committed 20-frame repository suite */
              <img
                src={`/datasets/dyamond-co2/frames/frame_${String(
                  1 + (Math.floor(((currentTime % 39.2) / 39.2) * 20) % 20)
                ).padStart(4, "0")}.jpg`}
                alt="DYAMOND CO2 Planetary Fluid Dynamic Visualization"
                className={`w-full h-full ${
                  fitMode === "contain" ? "object-contain" : "object-cover"
                } select-none pointer-events-none transition-all duration-300 ${
                  contrastBoost
                    ? "brightness-110 contrast-125 saturate-125"
                    : "brightness-100 contrast-100"
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/datasets/dyamond-co2/dyamond_co2_globe_2k.jpg";
                }}
              />
            ) : (
              <video
                ref={videoRef}
                key={videoSrc}
                src={videoSrc}
                playsInline
                muted
                loop
                autoPlay={false}
                onError={() => setVideoError(true)}
                onCanPlay={(e) => {
                  if (isPlaying) {
                    (e.target as HTMLVideoElement).play().catch(() => {});
                  }
                }}
                className={`w-full h-full ${
                  fitMode === "contain" ? "object-contain" : "object-cover"
                } select-none pointer-events-none transition-all duration-300 ${
                  contrastBoost
                    ? "brightness-110 contrast-125 saturate-125"
                    : "brightness-100 contrast-100"
                }`}
              />
            )}

            {/* Sleek Minimalist DYAMOND CO2 Telemetry Pill - 100% Unobstructed Video */}
            <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-20 pointer-events-none">
              <span className="font-mono text-[11px] font-bold text-white bg-[#06121D]/85 px-3 py-1 rounded-xl border border-cyan-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-xl">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>DYAMOND CO2</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-300 font-bold">{currentFeature?.co2Ppm ? currentFeature.co2Ppm.toFixed(1) : "415.0"} ppm</span>
                <span className="text-slate-600">•</span>
                <span className="text-amber-300 font-normal">{currentFeature?.dominantSourceRegion || "Global Circulation"}</span>
              </span>

              {/* Real-time Sonic Pitch Level & Frequency Equalizer Waveform */}
              <div className="flex items-center gap-2 bg-[#06121D]/90 backdrop-blur-md px-3 py-1 rounded-xl border border-cyan-500/30 shadow-xl">
                <span className="text-[10px] font-mono font-bold text-slate-400">PITCH:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                    currentFeature?.pitchLevel === "HIGH"
                      ? "bg-rose-950 text-rose-300 border border-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse"
                      : currentFeature?.pitchLevel === "LOW"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                      : "bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                  }`}
                >
                  {currentFeature?.pitchLevel || "MID"} ({currentFeature?.activeNote || "G3"} • {currentFeature?.frequencyHz ? Math.round(currentFeature.frequencyHz) : 196} Hz)
                </span>
                {/* 6-Bar Equalizer dancing in sync with active pitch */}
                <div className="flex items-end gap-0.5 h-3.5 w-10 px-0.5">
                  {[0.4, 0.7, 1.0, 0.6, 0.85, 0.5].map((_, i) => {
                    const isHigh = currentFeature?.pitchLevel === "HIGH";
                    const isLow = currentFeature?.pitchLevel === "LOW";
                    const heightPct = isHigh
                      ? 60 + Math.sin(currentTime * 14 + i * 1.5) * 35
                      : isLow
                      ? 22 + Math.sin(currentTime * 4 + i * 1.5) * 12
                      : 42 + Math.sin(currentTime * 8 + i * 1.5) * 20;
                    return (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-75 ${
                          isHigh ? "bg-rose-400" : isLow ? "bg-cyan-400" : "bg-[#00F2FE]"
                        }`}
                        style={{ height: `${Math.max(18, Math.min(100, heightPct))}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              {isPlaying && currentFeature?.isPlumeBurst && (
                <span className="font-mono text-[11px] font-bold text-rose-300 bg-rose-950/90 px-3 py-1 rounded-xl border border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.4)] flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block"></span>
                  <span>PLUME SURGE: {currentFeature.co2NetFlux ? (currentFeature.co2NetFlux > 0 ? `+${currentFeature.co2NetFlux.toFixed(2)}` : currentFeature.co2NetFlux.toFixed(2)) : "+0.11"} PPM</span>
                </span>
              )}
            </div>

            {/* CO2 Concentration Color Spectrum Legend Bar */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-1.5 z-20 flex items-center gap-3 text-[10px] font-mono shadow-2xl">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> &lt; 405 ppm (Clean Air)
              </span>
              <span className="text-slate-600">───</span>
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span> 410–414 ppm (Baseline)
              </span>
              <span className="text-slate-600">───</span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> &gt; 416 ppm (Plume)
              </span>
            </div>
          </div>
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
                <div className="w-full h-full bg-[#00F2FE] shadow-[0_0_16px_#00F2FE]"></div>
                <div className="absolute -top-1 -left-1.5 w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#00F2FE] opacity-85"></div>
              </div>
            )}

            {/* MODE B: LONGITUDINAL SCANNER (WEST TO EAST OVER 12 SECONDS - NASA CALDWELL 73) */}
            {isPlaying && isChangePhase && (
              <div
                className="absolute top-0 bottom-0 pointer-events-none z-20"
                style={{ left: `${(currentTime / maxDuration) * 100}%`, width: "2.5px" }}
              >
                <div className="w-full h-full bg-gradient-to-b from-cyan-400 via-teal-300 to-[#00F2FE] shadow-[0_0_18px_#00F2FE]"></div>
                <div className="absolute top-2 -left-2 w-5 h-5 rounded-full bg-[#00F2FE] shadow-[0_0_14px_#00F2FE] opacity-90 animate-pulse"></div>
              </div>
            )}

            {/* MODE B: ORANGE SECTOR SCAN DETECT (UKRAINE & LEVANT OUTAGE CORRIDOR) */}
            {isPlaying && isChangePhase && currentTime >= 4.8 && currentTime < 7.4 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#06121D]/95 border border-cyan-500/80 rounded-xl px-3.5 py-1.5 shadow-[0_0_24px_rgba(6,182,212,0.4)] flex items-center gap-2 z-30 animate-pulse">
                <Flame className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono text-xs text-cyan-200 font-bold tracking-tight">
                  SECTOR SCAN: Ukraine & Levant Outage Corridor (-42.1%) • Bowed Cello
                </span>
              </div>
            )}

            {/* MODE B: PURPLE SECTOR SCAN DETECT (SOUTH ASIA ELECTRIFICATION) */}
            {isPlaying && isChangePhase && currentTime >= 7.8 && currentTime <= 11.5 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#06121D]/95 border border-cyan-500/80 rounded-xl px-3.5 py-1.5 shadow-[0_0_24px_rgba(6,182,212,0.4)] flex items-center gap-2 z-30 animate-pulse">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-mono text-xs text-cyan-200 font-bold tracking-tight">
                  SECTOR SCAN: South Asia Rural Electrification (+34.2%) • Chimes
                </span>
              </div>
            )}

            {/* MODE C: DYNAMIC 2012 -> 2023 EVOLUTION BADGE */}
            {isRegional && isPlaying && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-[#06121D]/95 border border-cyan-500/60 rounded-xl px-3.5 py-1.5 shadow-2xl flex items-center gap-2 z-30 animate-fadeIn">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="font-mono text-xs text-cyan-200 font-bold">
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
          <div className="absolute bottom-3 right-3 bg-[#06121D]/85 backdrop-blur-md border border-cyan-500/30 rounded-xl px-3 py-2 shadow-xl z-20 max-w-xs">
            <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Decadal Lighting Intensity Scale
              </span>
              <span className="text-cyan-400 font-semibold">+1.53% Net</span>
            </div>
            <div className="relative w-full h-2 rounded-full overflow-hidden shadow-inner border border-cyan-500/20">
              <div className="w-full h-full bg-gradient-to-r from-slate-700 via-cyan-800 to-[#00F2FE]"></div>
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className="w-2.5 h-2.5 text-slate-400" /> Less Light (Cello)
              </span>
              <span className="text-cyan-300 font-semibold flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-cyan-400" /> More Light (Chimes)
              </span>
            </div>
          </div>
        )}

        {/* MODE C REGIONAL QUICK-SELECTOR BUTTONS (Strictly for Night Lights in 2D Mode C) */}
        {currentDataset === "night-lights" && isRegional && viewFormat === "2d" && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-20">
            {Object.keys(REGION_BOUNDS).map((regName) => {
              const isCurrent = selectedRegion === regName;
              return (
                <button
                  key={regName}
                  onClick={() => onSelectRegion?.(regName)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all border ${
                    isCurrent
                      ? "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)] font-bold"
                      : "bg-[#06121D]/80 text-slate-300 border-cyan-500/20 hover:bg-cyan-950/40 hover:border-cyan-500/40"
                  }`}
                >
                  {regName}
                </button>
              );
            })}
          </div>
        )}

        {/* RIGHT SIDE BOTTOM CORNER: Scientific Dataset Timeline & Verified Simulation Epoch */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-1 pointer-events-none">
          {isCO2 ? (
            <div className="bg-[#06121D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-right font-mono shadow-2xl flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>{currentFeature?.simulationDate || "Jan 20, 2020"}</span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-300 font-semibold">{currentFeature?.simulationTimeUtc || "00:00 UTC"}</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <span>Simulation: <strong className="text-cyan-400">Jan 20 – Mar 01, 2020 (Winter 2020)</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">Day {currentFeature?.simulationDay || 1}/42</span>
              </div>
            </div>
          ) : isOcean ? (
            <div className="bg-[#06121D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-teal-500/40 text-right font-mono shadow-2xl flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>June 2005 – Dec 2007 (Continuous Run)</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                NASA SVS #3912 • ECCO2 Global Ocean Model
              </div>
            </div>
          ) : isLightning ? (
            <div className="bg-[#06121D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-right font-mono shadow-2xl flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>ISS LIS Real-Time Flight Pass</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                NASA SVS #5011 • High-Speed Optical Transient
              </div>
            </div>
          ) : (
            <div className="bg-[#06121D]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/40 text-right font-mono shadow-2xl flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>2012 – 2023 Decadal Epoch</span>
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                NASA SVS #5276 / #5475 • VIIRS Day/Night Band
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. YOUTUBE-STYLE SCIENTIFIC PLAYBACK TIMELINE & INTERACTIVE SCRUBBER */}
      <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex flex-col gap-2">
        {/* YouTube-Style Scrubber Bar with Glowing Knob */}
        <div
          onClick={handleTimelineClick}
          className="relative w-full py-2 cursor-pointer group select-none"
          title="Click or drag to seek along timeline"
        >
          {/* Background rail */}
          <div className="w-full h-1.5 bg-slate-950 group-hover:h-2 rounded-full overflow-hidden border border-cyan-500/30 transition-all">
            {/* Active Elapsed Fill with Electric Cyan Glow */}
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-[#00F2FE] shadow-[0_0_14px_rgba(6,182,212,0.8)] transition-all duration-75"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* YouTube-Style Glowing Scrubber Thumb Knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-cyan-300 border-2 border-slate-950 shadow-[0_0_12px_#00F2FE] group-hover:scale-125 transition-transform pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Timeline Status Display */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
          {/* Left: YouTube-Style Time Elapsed / Duration Badge + Live State Indicator */}
          <div className="flex items-center gap-2">
            {/* Time Elapsed / Duration Badge */}
            <div className="flex items-center gap-1.5 font-bold text-white bg-black/80 px-2.5 py-1 rounded-xl border border-cyan-500/30 shadow-inner text-[11px]">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{formatTime(currentTime)}</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">{formatTime(maxDuration)}</span>
            </div>

            {/* Active Playing / Paused indicator */}
            <span
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                isPlaying
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-pulse"
                  : "bg-black/60 text-slate-400 border-cyan-500/20"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isPlaying ? "bg-cyan-400 animate-ping" : "bg-slate-500"}`} />
              <span>{isPlaying ? "LIVE PLAYING" : "PAUSED"}</span>
            </span>
          </div>

          {/* Right: Dynamic Telemetry & Progress Readout */}
          <div className="flex items-center gap-2">
            {/* In Lightning Mode: Dynamic Optical Strike Indicator */}
            {isLightning ? (
              currentFeature?.isStrike ? (
                <span className="flex items-center gap-1 text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-500/80 px-2.5 py-1 rounded-xl text-[10px] animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                  <Zap className="w-3 h-3 text-cyan-300 fill-cyan-300" />
                  <span>BURST: {currentFeature.strikeEnergyMicroJoules} µJ</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-cyan-400/80 bg-black/60 border border-cyan-500/20 px-2 py-1 rounded-xl text-[10px]">
                  <Zap className="w-3 h-3 text-cyan-400/50" />
                  <span>55 Hz Sub-Bass Orbit</span>
                </span>
              )
            ) : null}

            {/* In CO2 Mode: Dynamic Plume Readout */}
            {isCO2 && currentFeature?.co2Ppm && (
              <span className="flex items-center gap-1 text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-500/80 px-2.5 py-1 rounded-xl text-[10px] shadow-[0_0_8px_rgba(6,182,212,0.2)]">
                <Wind className="w-3 h-3 text-cyan-400" />
                <span>{currentFeature.co2Ppm.toFixed(1)} ppm</span>
              </span>
            )}

            {/* In Mode A: Current Calendar Year Indicator */}
            {!isLightning && !isOcean && !isCO2 && currentMode === "annual" && (
              <span className="flex items-center gap-1 text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-xl text-[10px] shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                <Calendar className="w-3 h-3" />
                <span>Year {currentYear}</span>
                <span className="text-cyan-500/70">({Math.min(12, Math.floor(currentTime) + 1)}/12)</span>
              </span>
            )}

            {/* In Mode C: Target Region Name */}
            {!isLightning && !isOcean && !isCO2 && currentMode === "regional" && (
              <span className="flex items-center gap-1 text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-xl text-[10px]">
                <MapPin className="w-3 h-3" />
                <span>{selectedRegion}</span>
              </span>
            )}

            {/* Progress Percent */}
            <span className="text-[11px] font-bold text-slate-300 bg-black/60 border border-cyan-500/20 px-2.5 py-1 rounded-xl">
              <strong className="text-cyan-300">{progressPercent.toFixed(0)}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
