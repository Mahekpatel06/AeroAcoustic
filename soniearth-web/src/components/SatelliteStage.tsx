"use client";

import React from "react";
import { FrameFeature } from "@/types";
import { Scan, Eye, Activity } from "lucide-react";

interface SatelliteStageProps {
  currentFeature: FrameFeature | null;
  currentFrameIndex: number;
  totalFrames: number;
  isPlaying: boolean;
}

export const SatelliteStage: React.FC<SatelliteStageProps> = ({
  currentFeature,
  currentFrameIndex,
  totalFrames,
  isPlaying,
}) => {
  const frameNum = currentFeature?.frameIndex ?? 10;
  const frameImgUrl = `/datasets/night-lights/frames/frame_${String(frameNum).padStart(4, "0")}.png`;

  return (
    <div className="relative flex flex-col bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden group">
      {/* Stage Header Info */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPlaying ? "bg-emerald-400" : "bg-slate-500"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPlaying ? "bg-emerald-500" : "bg-slate-600"
              }`}
            ></span>
          </span>
          <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Scan className="w-3.5 h-3.5 text-sky-400" />
            Satellite Stage
          </span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-sky-400 font-medium">
            Frame {String(currentFrameIndex + 1).padStart(2, "0")} / {totalFrames}
          </span>
        </div>

        {/* Phase Badge */}
        <div className="flex items-center gap-2">
          {currentFeature?.year && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 font-mono text-emerald-400 text-[11px] font-semibold">
              Year {currentFeature.year}
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
            {currentFeature?.phase === "annual_series"
              ? "Annual Timeline"
              : currentFeature?.phase === "global_change"
              ? "Change Map"
              : currentFeature?.regionFocus !== "global"
              ? `Zoom: ${currentFeature?.regionFocus}`
              : "Transition"}
          </span>
        </div>
      </div>

      {/* Frame Visual Display with Laser Sweep */}
      <div className="relative aspect-[32/12] w-full bg-black rounded-xl overflow-hidden border border-slate-800/80 shadow-inner flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={frameImgUrl}
          alt={`NASA Night Lights Frame ${frameNum}`}
          className="w-full h-full object-cover transition-opacity duration-150"
        />

        {/* Animated Scanning Laser Line */}
        {isPlaying && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-laser"></div>
          </div>
        )}

        {/* Spatial Grid Overlay (3x3 Visual Guides) */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-cyan-500/20">
          <div className="border-r border-b border-cyan-500/30"></div>
          <div className="border-r border-b border-cyan-500/30"></div>
          <div className="border-b border-cyan-500/30"></div>
          <div className="border-r border-b border-cyan-500/30"></div>
          <div className="border-r border-b border-cyan-500/30"></div>
          <div className="border-b border-cyan-500/30"></div>
          <div className="border-r border-cyan-500/30"></div>
          <div className="border-r border-cyan-500/30"></div>
          <div></div>
        </div>

        {/* Bottom Corner Telemetry Watermark */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-800">
          Suomi NPP • VIIRS DNB • EIC Dual-4K Source
        </div>
      </div>
    </div>
  );
};
