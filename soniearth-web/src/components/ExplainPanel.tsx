"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { HelpCircle, Compass } from "lucide-react";

interface ExplainPanelProps {
  currentDataset?: string;
  currentFeature: FrameFeature | null;
  activeNote: string;
  activeScaleName?: string;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  currentDataset = "night-lights",
  currentFeature,
  activeNote,
  activeScaleName = "C Major Lydian / Pentatonic",
}) => {
  const isLightning = currentDataset === "iss-lightning";
  const lumaPct = currentFeature
    ? (currentFeature.globalMeanBrightness * 100).toFixed(2)
    : "2.30";
  const delta = currentFeature?.temporalDelta ?? 0.0;
  const phase = currentFeature?.phase;
  const year = currentFeature?.year;
  const change = currentFeature?.changeClassification;
  const isPurple = (change?.increaseRatio ?? 0) > 0.003;
  const isOrange = (change?.decreaseRatio ?? 0) > 0.001;

  let explanation = "";

  if (isLightning) {
    if (currentFeature?.isStrike) {
      explanation = `Severe Lightning Strike Detected: Rapid optical flash detected by ISS LIS sensor (${currentFeature.strikeEnergyMicroJoules} µJ calibrated optical energy). Triggered sharp metallic FM chime on ${activeNote} (${(currentFeature.frequencyHz || 659.25).toFixed(1)} Hz, 5ms attack). Dynamic spatial stereo panning panned to ${
        currentFeature.strikePan! > 0.1
          ? `Right East Horizon (+${currentFeature.strikePan})`
          : currentFeature.strikePan! < -0.1
          ? `Left West Horizon (${currentFeature.strikePan})`
          : "Orbital Center"
      }. Deaf-blind haptic vibration pulse (80ms) fired simultaneously.`;
    } else {
      explanation = `ISS Orbital Baseline: Low Earth Orbit (408 km altitude, 7.66 km/s orbital velocity). Synthesizer maintains an ambient 55 Hz (A1) sub-bass atmospheric drone representing quiet space station orbit, awaiting rapid optical transient thunderstorm spikes.`;
    }
  } else {
    explanation = `Year ${year || "2012–2023 Baseline"}: Playing data-driven harmonic root ${activeNote} (${activeScaleName}). Planetary radiance of ${lumaPct}% (Rec. 601) and delta of ${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(3)}% drive the pitch and fifth harmony. All 9 spatial grid cells are arpeggiated across the stereo soundscape (Left: Americas, Center: Europe/Africa, Right: Asia/Oceania).`;

    if (phase === "global_change" || phase === "change_transition") {
      if (isPurple && isOrange) {
        explanation = `Decadal Change in ${activeScaleName}: Detected both Purple Expansion (${(change!.increaseRatio * 100).toFixed(2)}%) triggering ascending crystalline chimes on the right channel, and Orange Blackouts (${(change!.decreaseRatio * 100).toFixed(2)}%) triggering deep warm cello tones on the left channel. Sustained drone at ${activeNote} reflects planetary net balance.`;
      } else if (isPurple) {
        explanation = `Decadal Change in ${activeScaleName}: Triggering high crystalline chimes on the right channel because purple pixels (${(change!.increaseRatio * 100).toFixed(2)}%) identify electrification boom and new urban infrastructure.`;
      } else if (isOrange) {
        explanation = `Decadal Change in ${activeScaleName}: Triggering deep cello descending tones on the left channel because orange pixels (${(change!.decreaseRatio * 100).toFixed(2)}%) identify conflict blackout corridors and power grid collapse.`;
      }
    } else if (phase === "regional_zoom") {
      const region = currentFeature?.regionFocus || "India";
      if (region === "India") {
        explanation = `Regional Inset: India. Tuned to E Mixolydian (Raag Desh tradition). Snappy wooden marimba plucks at ${activeNote} reflect massive rural electrification and infrastructure growth (+34.2% radiance growth).`;
      } else if (region === "Ukraine") {
        explanation = `Regional Inset: Ukraine. Tuned to A Natural Minor. Solemn bowed cello tones at ${activeNote} convey localized power grid outages, conflict damage, and darkened corridors (-42.1% decline).`;
      } else if (region === "Western Europe") {
        explanation = `Regional Inset: Western Europe. Tuned to G Lydian. Ambient crystal glass pad chords at ${activeNote} represent a mature, dense interconnected power grid transitioning to energy-efficient LED lighting.`;
      } else if (region === "Eastern Mediterranean") {
        explanation = `Regional Inset: Eastern Mediterranean. Tuned to D Phrygian Dominant (Maqam Hijaz). Evocative modal synth textures at ${activeNote} capture a dynamic geopolitical and demographic crossroads.`;
      } else {
        explanation = `Global overview of 4 regional insets (India, Ukraine, Western Europe, Mediterranean). Tuned to authentic regional scales with localized spatial placement.`;
      }
    }
  }

  const spatialGrid = currentFeature?.spatialGrid || [];

  return (
    <div className="w-full bg-[#080D12]/85 backdrop-blur-xl border border-emerald-500/25 rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex flex-col gap-3 text-xs">
      {/* Top Banner */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-black/60 border border-emerald-500/30 text-emerald-400 mt-0.5 shrink-0 shadow-[0_0_10px_rgba(0,245,155,0.2)]">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] drop-shadow-[0_0_8px_rgba(0,245,155,0.3)]">
              Why am I hearing this? (Scientific Explainability)
            </h4>
            <span className="text-[10px] font-mono text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 shadow-[0_0_8px_rgba(0,245,155,0.2)]">
              {isLightning ? "NASA SVS #5011 • ISS LIS Science" : "Data-Driven Synthesis"}
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">{explanation}</p>
        </div>
      </div>

      {/* ISS Lightning: 3-Horizon Stereo Field Telemetry */}
      {isLightning && spatialGrid.length === 3 && (
        <div className="mt-1 pt-3 border-t border-emerald-500/20">
          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>3-Horizon Stereo Audio Field (West → Center → East)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {spatialGrid.map((cell) => (
              <div
                key={cell.regionId}
                className={`border rounded-xl p-2.5 flex flex-col items-center justify-between text-center font-mono text-[10px] transition-all ${
                  cell.strikeInZone
                    ? "bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(0,245,155,0.4)]"
                    : "bg-black/60 border-emerald-500/20"
                }`}
              >
                <div className={`font-semibold ${cell.strikeInZone ? "text-emerald-300" : "text-slate-300"}`}>
                  {cell.name}
                </div>
                <div className="text-slate-500 text-[9px] my-1">
                  Pan {cell.pan > 0 ? `+${cell.pan}` : cell.pan}
                </div>
                <div
                  className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    cell.strikeInZone
                      ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-[0_0_10px_rgba(0,245,155,0.5)] animate-pulse"
                      : "bg-black/80 border border-emerald-500/20 text-slate-400"
                  }`}
                >
                  {cell.strikeInZone ? "⚡ BURST" : "PASSIVE"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
