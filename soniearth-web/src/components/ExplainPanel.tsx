"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { HelpCircle, Info } from "lucide-react";

interface ExplainPanelProps {
  currentFeature: FrameFeature | null;
  activeNote: string;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  currentFeature,
  activeNote,
}) => {
  const lumaPct = currentFeature
    ? (currentFeature.globalMeanBrightness * 100).toFixed(1)
    : "3.1";
  const phase = currentFeature?.phase;
  const isPurple = (currentFeature?.changeClassification?.increaseRatio ?? 0) > 0.01;
  const isOrange = (currentFeature?.changeClassification?.decreaseRatio ?? 0) > 0.01;

  let explanation = `Playing ${activeNote} baseline chord because global mean illumination is ${lumaPct}%. Normalized brightness maps monotonically to the C Major Pentatonic scale.`;

  if (phase === "global_change") {
    if (isPurple && isOrange) {
      explanation = `Detected both Purple Expansion (${(currentFeature!.changeClassification!.increaseRatio * 100).toFixed(1)}%) triggering ascending crystalline chimes, and Orange Declines (${(currentFeature!.changeClassification!.decreaseRatio * 100).toFixed(1)}%) triggering mellow cello tones.`;
    } else if (isPurple) {
      explanation = `Triggering bright Crystalline Chimes (Ascending Triad) because purple pixels indicate significant electrification and urban lighting growth.`;
    } else if (isOrange) {
      explanation = `Triggering warm Cello descending interval because orange pixels identify lighting reduction clusters (energy transition, blackouts).`;
    }
  } else if (phase === "regional_zoom") {
    explanation = `Focused on regional zoom over ${currentFeature?.regionFocus}. Local spatial density drives localized stereo pan (${currentFeature?.spatialGrid[1]?.pan ?? 0.0}) and harmonic voicings.`;
  }

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs">
      <div className="p-2 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400 mt-0.5">
        <HelpCircle className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sky-300 uppercase tracking-wider text-[11px]">
            Why am I hearing this? (Scientific Explainability)
          </h4>
          <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">
            Real-time Telemetry
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans">{explanation}</p>
      </div>
    </div>
  );
};
