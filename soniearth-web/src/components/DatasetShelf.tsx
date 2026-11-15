"use client";

import React from "react";
import { Moon, Waves, Zap, Wind, Lock } from "lucide-react";

interface DatasetShelfProps {
  selectedDataset: string;
  onSelectDataset: (id: string) => void;
}

export const DatasetShelf: React.FC<DatasetShelfProps> = ({
  selectedDataset,
  onSelectDataset,
}) => {
  const datasets = [
    {
      id: "night-lights",
      key: "1",
      title: "Decadal Night Lights",
      svs: "NASA SVS #5313",
      years: "2012–2023",
      description: "Planetary illumination, electrification, and blackout corridors mapped to data-driven harmonies.",
      icon: Moon,
      color: "from-cyan-400 to-teal-500",
      activeRing: "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
      isAvailable: true,
    },
    {
      id: "ocean-currents",
      key: "2",
      title: "Sea Surface Currents",
      svs: "NASA SVS #3912",
      years: "2005–2007",
      description: "ECCO2 thermal fluid motion & streamlines mapped to deep cello, warm string swells, and dynamic stereo panning.",
      icon: Waves,
      color: "from-cyan-400 to-teal-500",
      activeRing: "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
      isAvailable: true,
    },
    {
      id: "iss-lightning",
      key: "3",
      title: "ISS Lightning Events",
      svs: "NASA SVS #5011",
      years: "2017–2023",
      description: "Severe optical thunderstorm strikes mapped to high metallic chimes, dynamic stereo pan, and haptic pulses.",
      icon: Zap,
      color: "from-cyan-400 to-teal-500",
      activeRing: "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
      isAvailable: true,
    },
    {
      id: "dyamond-co2",
      key: "4",
      title: "DYAMOND Global CO2",
      svs: "NASA SVS #5436",
      years: "2020",
      description: "Atmospheric carbon respiration & plume transport mapped to harmonic pads and emission chimes.",
      icon: Wind,
      color: "from-cyan-400 to-teal-500",
      activeRing: "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]",
      isAvailable: true,
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <span>NASA Planetary Playlist Shelf</span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            All 4 Datasets Live • Keys [1], [2], [3] & [4] Active
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {datasets.map((ds) => {
          const Icon = ds.icon;
          const isActive = selectedDataset === ds.id;

          return (
            <button
              key={ds.id}
              disabled={!ds.isAvailable}
              onClick={() => {
                if (ds.isAvailable) {
                  onSelectDataset(ds.id);
                }
              }}
              className={`relative text-left p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between backdrop-blur-md ${
                isActive
                  ? `bg-[#06121D]/95 ${ds.activeRing} ring-2 ring-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.02]`
                  : ds.isAvailable
                  ? "bg-[#06121D]/60 border-cyan-500/20 hover:bg-[#06121D]/90 hover:border-cyan-400/60 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] cursor-pointer"
                  : "bg-black/30 border-slate-900/60 opacity-30 cursor-not-allowed"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${ds.color} text-slate-950 shadow-md ${
                      !ds.isAvailable ? "grayscale opacity-50" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-950 font-bold" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!ds.isAvailable ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-slate-900 text-slate-400 border-slate-700 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    ) : (
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]">
                        [{ds.key}]
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white tracking-tight">
                  {ds.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                  <span className="text-cyan-400 font-bold">{ds.svs}</span>
                  <span>•</span>
                  <span>{ds.years}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                {ds.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
