"use client";

import React from "react";
import { Moon, Waves, Zap, Wind } from "lucide-react";

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
      svs: "SVS #5313",
      years: "2012–2023",
      description: "Urban expansion & electrification mapped to pentatonic bells.",
      icon: Moon,
      color: "from-sky-500 to-indigo-600",
      activeRing: "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]",
    },
    {
      id: "ocean-currents",
      key: "2",
      title: "Sea Surface Currents",
      svs: "SVS #5283",
      years: "2011–2012",
      description: "Thermal fluid motion mapped to warm cello & stereo pan.",
      icon: Waves,
      color: "from-teal-500 to-emerald-600",
      activeRing: "border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]",
    },
    {
      id: "iss-lightning",
      key: "3",
      title: "ISS Lightning Events",
      svs: "SVS #5078",
      years: "2017–2023",
      description: "Optical lightning strikes mapped to sudden glockenspiel chimes.",
      icon: Zap,
      color: "from-amber-400 to-orange-500",
      activeRing: "border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
    },
    {
      id: "dyamond-co2",
      key: "4",
      title: "DYAMOND Global CO2",
      svs: "SVS #5118",
      years: "2020",
      description: "Planetary carbon respiration mapped to atmospheric synth pads.",
      icon: Wind,
      color: "from-purple-500 to-pink-600",
      activeRing: "border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.3)]",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>NASA Planetary Playlist Shelf</span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] font-mono text-slate-400 font-normal">
            Press keys [1] - [4] to switch
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
              onClick={() => onSelectDataset(ds.id)}
              className={`relative text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? `bg-slate-900 ${ds.activeRing} ring-2 ring-yellow-400/50`
                  : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${ds.color} text-white shadow-md`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-bold">
                    Key [{ds.key}]
                  </span>
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
