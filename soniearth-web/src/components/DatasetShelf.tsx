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
      color: "from-emerald-400 to-teal-500",
      activeRing: "border-emerald-400 shadow-[0_0_20px_rgba(0,245,155,0.4)]",
      isAvailable: true,
      badge: "Phase 1 Live",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
    },
    {
      id: "ocean-currents",
      key: "2",
      title: "Sea Surface Currents",
      svs: "NASA SVS #3912",
      years: "2005–2007",
      description: "ECCO2 thermal fluid motion & streamlines mapped to deep cello, warm string swells, and dynamic stereo panning.",
      icon: Waves,
      color: "from-teal-600 to-emerald-700",
      activeRing: "border-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.35)]",
      isAvailable: true,
      badge: "Phase 2 Live",
      badgeColor: "bg-teal-950/80 text-teal-300 border-teal-700/60",
    },
    {
      id: "iss-lightning",
      key: "3",
      title: "ISS Lightning Events",
      svs: "NASA SVS #5011",
      years: "2017–2023",
      description: "Severe optical thunderstorm strikes mapped to high metallic chimes, dynamic stereo pan, and haptic pulses.",
      icon: Zap,
      color: "from-emerald-400 to-teal-500",
      activeRing: "border-emerald-400 shadow-[0_0_20px_rgba(0,245,155,0.4)]",
      isAvailable: true,
      badge: "Phase 2 Live",
      badgeColor: "bg-emerald-950/80 text-emerald-300 border-emerald-500/50",
    },
    {
      id: "dyamond-co2",
      key: "4",
      title: "DYAMOND Global CO2",
      svs: "NASA SVS #5118",
      years: "2020",
      description: "Planetary carbon respiration cycle mapped to ambient harmonic pads.",
      icon: Wind,
      color: "from-emerald-700 to-teal-800",
      activeRing: "border-emerald-500/40",
      isAvailable: false,
      badge: "Coming in Phase 2",
      badgeColor: "bg-black/60 text-slate-500 border-slate-800",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <span>NASA Planetary Playlist Shelf</span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Phase 1 & Phase 2 Datasets Live • Keys [1], [2] & [3] Active
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
                  ? `bg-[#080D12]/95 ${ds.activeRing} ring-2 ring-emerald-400/50 shadow-[0_0_25px_rgba(0,245,155,0.3)] scale-[1.02]`
                  : ds.isAvailable
                  ? "bg-[#080D12]/60 border-emerald-500/20 hover:bg-[#080D12]/90 hover:border-emerald-400/60 hover:scale-[1.01] hover:shadow-[0_0_15px_rgba(0,245,155,0.2)] cursor-pointer"
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
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${ds.badgeColor} flex items-center gap-1`}
                    >
                      {!ds.isAvailable && <Lock className="w-2.5 h-2.5" />}
                      {ds.badge}
                    </span>
                    {ds.isAvailable && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black/80 border border-emerald-500/40 text-emerald-300 font-bold">
                        [{ds.key}]
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-white tracking-tight">
                  {ds.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                  <span className="text-emerald-400 font-bold">{ds.svs}</span>
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
