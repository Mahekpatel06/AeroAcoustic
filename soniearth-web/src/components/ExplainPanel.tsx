"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { HelpCircle } from "lucide-react";

interface ExplainPanelProps {
  currentFeature: FrameFeature | null;
  activeNote: string;
  activeScaleName?: string;
}

export const ExplainPanel: React.FC<ExplainPanelProps> = ({
  currentFeature,
  activeNote,
  activeScaleName = "C Major Lydian",
}) => {
  const lumaPct = currentFeature
    ? (currentFeature.globalMeanBrightness * 100).toFixed(1)
    : "3.1";
  const phase = currentFeature?.phase;
  const year = currentFeature?.year;
  const isPurple = (currentFeature?.changeClassification?.increaseRatio ?? 0) > 0.01;
  const isOrange = (currentFeature?.changeClassification?.decreaseRatio ?? 0) > 0.01;

  let explanation = `Year ${year || "2012–2023"}: Playing harmonic chord rooted at ${activeNote} (${activeScaleName}). Planetary illumination of ${lumaPct}% is mapped across 3 spatial channels: West (Americas), Center (Europe/Africa), and East (Asia/Oceania).`;

  if (phase === "global_change") {
    if (isPurple && isOrange) {
      explanation = `Decadal Change in ${activeScaleName}: Detected both Purple Expansion (${(currentFeature!.changeClassification!.increaseRatio * 100).toFixed(1)}%) triggering ascending crystalline chimes on the right channel, and Orange Declines (${(currentFeature!.changeClassification!.decreaseRatio * 100).toFixed(1)}%) triggering deep melancholic cello tones on the left channel.`;
    } else if (isPurple) {
      explanation = `Decadal Change in ${activeScaleName}: Triggering high crystalline chimes (F Lydian / A Minor) because purple pixels indicate significant electrification and new urban infrastructure.`;
    } else if (isOrange) {
      explanation = `Decadal Change in ${activeScaleName}: Triggering deep cello descending interval (D Minor / Phrygian) because orange pixels identify blackout corridors and energy reduction.`;
    }
  } else if (phase === "regional_zoom") {
    const region = currentFeature?.regionFocus || "Global";
    if (region === "India") {
      explanation = `Regional Zoom: India. Tuned to E Mixolydian (Raag Desh tradition). Snappy marimba plucks and ascending arpeggios reflect massive rural electrification and infrastructure growth.`;
    } else if (region === "Ukraine") {
      explanation = `Regional Zoom: Ukraine. Tuned to A Natural Minor. Sparse, deep bowed cello descending notes convey grid blackouts and darkened corridors.`;
    } else if (region === "Western Europe") {
      explanation = `Regional Zoom: Western Europe. Tuned to G Lydian. Ambient crystal glass pad chords represent a dense, highly stable interconnected power grid transitioning to energy-efficient LED lighting.`;
    } else if (region === "Eastern Mediterranean") {
      explanation = `Regional Zoom: Eastern Mediterranean. Tuned to D Phrygian Dominant (Maqam Hijaz). Evocative modal textures reflect a dynamic crossroads of geopolitical and demographic shifts.`;
    } else {
      explanation = `Focused on regional zoom over ${region}. Tuned to ${activeScaleName} with localized stereo panning and regional instrument timbres.`;
    }
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
