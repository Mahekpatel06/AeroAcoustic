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
      color: "from-sky-500 to-indigo-600",
      activeRing: "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]",
      isAvailable: true,
      badge: "Phase 1 Live",
      badgeColor: "bg-emerald-950/80 text-emerald-400 border-emerald-700/60",
    },
    {
      id: "ocean-currents",
      key: "2",
      title: "Sea Surface Currents",
      svs: "NASA SVS #5283",
      years: "2011–2012",
      description: "Thermal fluid motion mapped to warm cello and dynamic stereo panning.",
      icon: Waves,
      color: "from-teal-600 to-emerald-700",
      activeRing: "border-teal-400",
      isAvailable: false,
      badge: "Coming in Phase 2",
      badgeColor: "bg-slate-900 text-slate-400 border-slate-700/60",
    },
    {
      id: "iss-lightning",
      key: "3",
      title: "ISS Lightning Events",
      svs: "NASA SVS #5011",
      years: "2017–2023",
      description: "Severe optical thunderstorm strikes mapped to high metallic chimes, dynamic stereo pan, and haptic pulses.",
      icon: Zap,
      color: "from-amber-500 to-yellow-600",
      activeRing: "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]",
      isAvailable: true,
      badge: "Phase 2 Live",
      badgeColor: "bg-amber-950/80 text-amber-300 border-amber-600/60",
    },
    {
      id: "dyamond-co2",
      key: "4",
      title: "DYAMOND Global CO2",
      svs: "NASA SVS #5118",
      years: "2020",
      description: "Planetary carbon respiration cycle mapped to ambient harmonic pads.",
      icon: Wind,
      color: "from-purple-600 to-pink-700",
      activeRing: "border-purple-400",
      isAvailable: false,
      badge: "Coming in Phase 2",
      badgeColor: "bg-slate-900 text-slate-400 border-slate-700/60",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>NASA Planetary Playlist Shelf</span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Phase 1 & Phase 2 Datasets Live • Keys [1] & [3] Active
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
              className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? `bg-slate-900 ${ds.activeRing} ring-2 ring-sky-400/50`
                  : ds.isAvailable
                  ? "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 cursor-pointer"
                  : "bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${ds.color} text-white shadow-md ${
                      !ds.isAvailable ? "grayscale opacity-70" : ""
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${ds.badgeColor} flex items-center gap-1`}
                    >
                      {!ds.isAvailable && <Lock className="w-2.5 h-2.5" />}
                      {ds.badge}
                    </span>
                    {ds.isAvailable && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-sky-400 font-bold">
                        Key [{ds.key}]
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 tracking-tight">
                  {ds.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                  <span className="text-sky-400">{ds.svs}</span>
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
