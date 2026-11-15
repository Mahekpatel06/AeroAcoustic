"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { HelpCircle, Compass } from "lucide-react";

interface ExplainPanelProps {
  currentDataset?: string;
  currentFeature: FrameFeature | null;
  activeNote?: string;
  activeScaleName?: string;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  currentDataset = "night-lights",
  currentFeature,
  activeNote = "C4",
}) => {
  const isLightning = currentDataset === "iss-lightning";
  const isOcean = currentDataset === "ocean-currents";
  const isCO2 = currentDataset === "dyamond-co2";
  const lumaPct = currentFeature?.globalMeanBrightness !== undefined
    ? (currentFeature.globalMeanBrightness * 100).toFixed(2)
    : "2.30";
  const delta = currentFeature?.temporalDelta ?? 0.0;
  const phase = currentFeature?.phase;
  const year = currentFeature?.year;
  const change = currentFeature?.changeClassification;
  const isPurple = (change?.increaseRatio ?? 0) > 0.003;
  const isOrange = (change?.decreaseRatio ?? 0) > 0.001;

  let explanation = "";

  if (isCO2) {
    const ppm = currentFeature?.co2Ppm ?? 414.3;
    const flux = currentFeature?.co2NetFlux ?? 0.0;
    const tension = currentFeature?.harmonicTensionScore ?? 0.5;
    const region = currentFeature?.dominantSourceRegion || "European Grid & African Biomass";
    const pan = currentFeature?.strikePan ?? 0.0;

    explanation = `NASA SVS #5436 DYAMOND Global Carbon Dioxide (GEOS 3D Fluid Model): Atmospheric greenhouse concentration is measured at ${ppm.toFixed(1)} ppm with carbon flux rate of ${flux > 0 ? `+${flux.toFixed(2)}` : flux.toFixed(2)} ppm/s. Greenhouse infrared radiative forcing tension is at ${Math.round(tension * 100)}%, opening the low-pass resonant audio filter. Tonal harmonic pad is sounding on ${activeNote}. Main emission plume is focused in ${region}, steering stereo panning to ${pan > 0 ? `Right (+${pan.toFixed(2)})` : pan < 0 ? `Left (${pan.toFixed(2)})` : "Center"}.${currentFeature?.isPlumeBurst ? " Rapid localized carbon flux surge detected! High metallic warning chime triggered." : ""}`;
  } else if (isOcean) {
    const sst = (currentFeature as any)?.temperatureCelsius ?? 18.0;
    const vel = (currentFeature as any)?.currentVelocityKnots ?? 1.5;
    const bpm = (currentFeature as any)?.tempoBpm ?? 80;
    const pan = currentFeature?.strikePan ?? 0.0;
    const flowDir = (currentFeature as any)?.flowDirection === "west_to_east" ? "West-to-East (+Right)" : "East-to-West (-Left)";

    explanation = `NASA SVS #3912 Perpetual Ocean (ECCO2 Model): Global ocean surface thermal fluid simulation. Current measured Sea Surface Temperature is ${sst.toFixed(1)}°C with current flow velocity of ${vel.toFixed(1)} knots. ${
      sst < 14.0
        ? `Cold polar waters trigger deep resonant cello bass (${activeNote}, 24dB LPF) with measured slow rhythmic gyres (${bpm} BPM).`
        : `Warm equatorial boundary currents (Gulf Stream / Kuroshio) trigger harmonic string swells (${activeNote}) with accelerated fluid arpeggiation (${bpm} BPM).`
    } Flow heading is directed ${flowDir}, driving stereo panning (pan: ${pan > 0 ? `+${pan.toFixed(2)}` : pan.toFixed(2)}).`;
  } else if (isLightning) {
    if (currentFeature?.isStrike) {
      const strikeEnergy = (currentFeature.strikeEnergyMicroJoules ?? 450).toFixed(0);
      const strikePan = currentFeature.strikePan ?? 0;
      explanation = `NASA SVS #5011 ISS LIS: High-transient optical electrical flash detected! Optical flash energy measured at ${strikeEnergy} µJ triggers a high metallic FM chime note (${activeNote}) with stereo azimuth pan at ${strikePan > 0 ? `+${strikePan.toFixed(2)} Right` : `${strikePan.toFixed(2)} Left`}. Tactile haptic pulse triggered for accessible tactile sensing.`;
    } else {
      explanation = `NASA SVS #5011 ISS LIS: International Space Station cruising in night orbit at 408 km altitude (7.66 km/s). Optical transient detector is scanning for convective electrical discharges. Ambient 55 Hz orbital sub-bass drone is sounding.`;
    }
  } else if (phase === "annual_series") {
    explanation = `Year ${year || 2012}: Global mean radiance is ${lumaPct}% of sensor dynamic range. High urban concentration triggers C-Pentatonic chord clusters. Note ${activeNote} corresponds to primary zonal radiance density.`;
  } else if (phase === "global_change" || phase === "change_transition") {
    if (isPurple && isOrange) {
      explanation = "Decadal Change Analysis: High polarity detected. Simultaneous infrastructure growth (purple corridors in East/South Asia) and severe blackout variance (orange corridors in Eastern Europe/Levant) create an expanded dynamic audio contrast.";
    } else if (isPurple) {
      explanation = "Electrification Surge: Significant radiance increases (>0.003 ratio) detected across developing urban corridors. High-frequency chime harmonics emphasize widespread infrastructure electrification.";
    } else if (isOrange) {
      explanation = "Severe Dimming / Blackout: Conflict zones, humanitarian crises, and demographic displacement produce sharp radiance drops, translated into low, somber sub-bass drones.";
    } else {
      explanation = "Global Decadal Baseline: Longitudinal scanning active. Sensor sweeps from West to East across the planetary surface.";
    }
  } else {
    explanation = `Regional Zoom Mode: Focused high-resolution spatial examination. Localized radiance variance (${delta > 0 ? "+" : ""}${(delta * 100).toFixed(1)}% delta) modulates synthesizer harmonics.`;
  }

  const spatialGrid = currentFeature?.spatialGrid || [];

  return (
    <div className="w-full bg-[#06121D]/90 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col gap-3 text-xs">
      {/* Top Banner */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-black/60 border border-cyan-500/30 text-cyan-400 mt-0.5 shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.25)]">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
              Why am I hearing this? (Scientific Explainability)
            </h4>
            <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.25)]">
              {isCO2 ? "NASA SVS #5436 • GEOS-5 Carbon Dynamics" : isOcean ? "NASA SVS #3912 • ECCO2 Hydrodynamics" : isLightning ? "NASA SVS #5011 • ISS LIS Science" : "Data-Driven Synthesis"}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">{explanation}</p>
        </div>
      </div>

      {/* ISS Lightning: 3-Horizon Stereo Field Telemetry */}
      {isLightning && spatialGrid.length === 3 && (
        <div className="mt-1 pt-3 border-t border-cyan-500/20">
          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>3-Horizon Stereo Audio Field (West → Center → East)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {spatialGrid.map((cell) => (
              <div
                key={cell.regionId}
                className={`border rounded-xl p-2.5 flex flex-col items-center justify-between text-center font-mono text-[10px] transition-all ${
                  cell.strikeInZone
                    ? "bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    : "bg-black/60 border-cyan-500/20"
                }`}
              >
                <div className={`font-semibold ${cell.strikeInZone ? "text-cyan-300" : "text-slate-300"}`}>
                  {cell.name}
                </div>
                <div className="text-slate-500 text-[9px] my-1">
                  Pan {cell.pan > 0 ? `+${cell.pan}` : cell.pan}
                </div>
                <div
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    cell.strikeInZone
                      ? "bg-gradient-to-r from-cyan-400 to-[#00F2FE] text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse"
                      : "bg-black/80 border border-cyan-500/20 text-slate-400"
                  }`}
                >
                  {cell.strikeInZone ? "⚡ BURST" : "PASSIVE"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ocean Currents: 3-Basin Oceanic Telemetry */}
      {isOcean && spatialGrid.length === 3 && (
        <div className="mt-1 pt-3 border-t border-cyan-500/20">
          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ocean Basins & Thermal Telemetry (West Pacific → Atlantic Gulf Stream → Indian/Southern Ocean)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {spatialGrid.map((basin) => (
              <div
                key={basin.regionId}
                className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between gap-2 font-mono shadow-md hover:border-cyan-500/60 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-cyan-300 text-[11px] leading-tight">
                    {basin.name}
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 font-bold text-xs shadow-sm">
                    {basin.meanTemperature !== undefined ? `${basin.meanTemperature}°C` : "18.0°C"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[9px] text-slate-400">
                  <span>
                    Stereo Pan: <strong className="text-slate-200">{basin.pan > 0 ? `+${basin.pan}` : basin.pan}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DYAMOND Global CO2: 3-Zone Continental Emission Telemetry */}
      {isCO2 && spatialGrid.length === 3 && (
        <div className="mt-1 pt-3 border-t border-cyan-500/20">
          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Planetary Emission Grid (Western Americas → Central EMEA → East Asia)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {spatialGrid.map((zone) => {
              const shortTitle =
                zone.regionId === "CO2_WEST"
                  ? "Western Americas"
                  : zone.regionId === "CO2_CENTER"
                  ? "Central EMEA"
                  : "East Asia & Pacific";
              const subTitle =
                zone.regionId === "CO2_WEST"
                  ? "Pacific / Atlantic"
                  : zone.regionId === "CO2_CENTER"
                  ? "Europe & Africa"
                  : "Western Pacific";

              return (
                <div
                  key={zone.regionId}
                  className="bg-black/60 border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between gap-2 font-mono shadow-md hover:border-cyan-500/60 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-cyan-300 text-[11px] leading-tight">
                        {shortTitle}
                      </div>
                      <div className="text-slate-400 text-[9px] mt-0.5 leading-tight">
                        {subTitle}
                      </div>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-500/60 text-cyan-300 font-bold text-xs shadow-sm">
                      {zone.ppm !== undefined ? `${zone.ppm.toFixed(1)} ppm` : "414.0 ppm"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[9px] text-slate-400">
                    <span>
                      Pan: <strong className="text-slate-200">{zone.pan > 0 ? `+${zone.pan}` : zone.pan}</strong>
                    </span>
                    <span>
                      Note: <strong className="text-cyan-400 font-bold">{zone.activeNote || "G3"}</strong>
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                        zone.pitchLevel === "HIGH"
                          ? "bg-rose-950/80 text-rose-300 border border-rose-700/60 animate-pulse"
                          : zone.pitchLevel === "LOW"
                          ? "bg-cyan-950/80 text-cyan-300 border border-cyan-700/60"
                          : "bg-cyan-950/80 text-cyan-300 border border-cyan-700/60"
                      }`}
                    >
                      {zone.pitchLevel || "MID"} PITCH
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
