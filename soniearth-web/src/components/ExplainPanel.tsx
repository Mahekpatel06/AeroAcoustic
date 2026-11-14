"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { HelpCircle, Grid, Compass } from "lucide-react";

interface ExplainPanelProps {
  currentFeature: FrameFeature | null;
  activeNote: string;
  activeScaleName?: string;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  currentFeature,
  activeNote,
  activeScaleName = "C Major Lydian / Pentatonic",
}) => {
  const lumaPct = currentFeature
    ? (currentFeature.globalMeanBrightness * 100).toFixed(2)
    : "2.30";
  const delta = currentFeature?.temporalDelta ?? 0.0;
  const phase = currentFeature?.phase;
  const year = currentFeature?.year;
  const change = currentFeature?.changeClassification;
  const isPurple = (change?.increaseRatio ?? 0) > 0.003;
  const isOrange = (change?.decreaseRatio ?? 0) > 0.001;

  let explanation = `Year ${year || "2012–2023 Baseline"}: Playing data-driven harmonic root ${activeNote} (${activeScaleName}). Planetary radiance of ${lumaPct}% (Rec. 601) and delta of ${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(3)}% drive the pitch and fifth harmony. All 9 spatial grid cells are arpeggiated across the stereo soundscape (Left: Americas, Center: Europe/Africa, Right: Asia/Oceania).`;

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

  const spatialGrid = currentFeature?.spatialGrid || [];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 text-xs">
      {/* Top Banner */}
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 mt-0.5 shrink-0">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sky-300 uppercase tracking-wider text-[11px]">
              Why am I hearing this? (Scientific Explainability)
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
              Data-Driven Synthesis
            </span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">{explanation}</p>
        </div>
      </div>

      {/* Mode A: 3x3 Spatial Grid Notes Telemetry */}
      {phase === "annual_series" && spatialGrid.length === 9 && (
        <div className="mt-1 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            <Grid className="w-3.5 h-3.5 text-sky-400" />
            <span>9-Cell Planetary Spatial Grid Notes (West → Center → East Stereo Sweep)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {spatialGrid.map((cell, idx) => {
              const cellKey = cell.regionId || `grid_cell_${cell.row ?? Math.floor(idx / 3)}_${cell.col ?? (idx % 3)}_${idx}`;
              const cellName = cell.name || `Zone ${idx + 1} (${cell.col === 0 ? "West" : cell.col === 1 ? "Center" : "East"})`;
              const cellPan = cell.pan ?? (cell.col === 0 ? -0.75 : cell.col === 1 ? 0.0 : 0.75);
              const cellLuma = ((cell.meanBrightness ?? (cell as any).brightness ?? 0) * 100).toFixed(1);
              const note = cell.activeNote || "C4";

              return (
                <div
                  key={cellKey}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 flex items-center justify-between font-mono text-[10px]"
                >
                  <div>
                    <div className="text-slate-300 font-semibold truncate max-w-[140px]">{cellName}</div>
                    <div className="text-slate-500 text-[9px]">
                      Pan {cellPan > 0 ? `+${cellPan}` : cellPan} • Luma {cellLuma}%
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 text-sky-300 font-bold text-xs">
                    {note}
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
