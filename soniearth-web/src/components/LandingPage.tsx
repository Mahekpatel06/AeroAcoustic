"use client";

import React from "react";
import { Zap, Moon, Globe2, Keyboard, ChevronRight, Satellite, Music2, Ear, Waves, Wind } from "lucide-react";

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#04070C] text-white flex flex-col overflow-x-hidden">

      {/* NASA Badge */}
      <div className="w-full flex justify-center pt-6">
        <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-300 tracking-wider uppercase shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          🏆 NASA Space Apps Challenge 2024
        </span>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-10 pb-12 flex-1">
        {/* Glow behind title */}
        <div className="relative mb-2">
          <div className="absolute inset-0 blur-[90px] bg-cyan-500/25 rounded-full scale-150 pointer-events-none" />
          <h1 className="relative text-6xl sm:text-7xl font-black tracking-tight bg-gradient-to-b from-white via-cyan-100 to-[#00F2FE] bg-clip-text text-transparent drop-shadow-[0_0_45px_rgba(6,182,212,0.6)]">
            SoniEarth
          </h1>
        </div>
        <p className="text-xl sm:text-2xl text-slate-200 font-light mt-1 tracking-wide">
          The Earth Information Jukebox
        </p>
        <p className="text-sm text-cyan-300/80 mt-2 font-mono">
          Hear the Earth. Understand the Planet.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {[
            { icon: "🛰️", label: "Real NASA Data" },
            { icon: "🎵", label: "Live Sonification" },
            { icon: "♿", label: "Accessible" },
            { icon: "⚡", label: "Real-Time Audio" },
          ].map((pill) => (
            <span
              key={pill.label}
              className="flex items-center gap-1.5 text-xs font-mono px-3.5 py-1.5 rounded-full bg-[#07111B]/90 border border-cyan-500/25 text-slate-300 shadow-sm"
            >
              {pill.icon} {pill.label}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="mt-10 group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-500 text-slate-950 font-bold text-lg shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:shadow-[0_0_60px_rgba(6,182,212,0.85)] hover:scale-105 transition-all duration-300"
        >
          <span>▶ Enter the Jukebox</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[11px] text-slate-500 mt-3 font-mono">or press any key to continue</p>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-center text-xs font-mono text-cyan-400/90 uppercase tracking-widest mb-5">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Globe2,
              step: "01",
              title: "Pick a Dataset",
              desc: "Choose from 4 real NASA satellite datasets — Decadal Night Lights, ECCO2 Oceans, ISS Lightning, or DYAMOND CO2.",
              color: "text-cyan-400",
              bg: "bg-[#06121D]/80 border-cyan-500/25",
            },
            {
              icon: Music2,
              step: "02",
              title: "Press Play",
              desc: "Hit Spacebar or click Play. The satellite frames and telemetry instantly transform into real-time music.",
              color: "text-cyan-400",
              bg: "bg-[#06121D]/80 border-cyan-500/25",
            },
            {
              icon: Ear,
              step: "03",
              title: "Hear & Understand",
              desc: "Each sound explains a real Earth event — ocean thermals, blackouts, lightning surges, and greenhouse fluxes.",
              color: "text-cyan-400",
              bg: "bg-[#06121D]/80 border-cyan-500/25",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.step}
                className={`flex flex-col gap-3 p-5 rounded-2xl border ${card.bg} backdrop-blur-xl shadow-lg hover:border-cyan-500/50 transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-black/60 border border-cyan-500/30 ${card.color} shadow-inner`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-mono text-xs font-bold ${card.color} opacity-90`}>
                    STEP {card.step}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">{card.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Datasets + Shortcuts */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-14 grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Datasets Available */}
        <div className="bg-[#06121D]/85 border border-cyan-500/25 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Satellite className="w-3.5 h-3.5 text-cyan-400" />
            Datasets Available (All 4 Live)
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Moon className="w-4 h-4 text-cyan-400" />
                  Decadal Night Lights
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 ml-6">NASA SVS #5313 · 2012–2023</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]">LIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  ISS Lightning Events
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 ml-6">NASA SVS #5011 · 2017–2023</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]">LIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  Sea Surface Currents
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 ml-6">NASA SVS #3912 · ECCO2 Model</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]">LIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Wind className="w-4 h-4 text-cyan-400" />
                  DYAMOND Global CO2
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 ml-6">NASA SVS #5436 · GEOS 3D Fluid</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]">LIVE</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-[#06121D]/85 border border-cyan-500/25 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
          <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
            Keyboard Shortcuts Quick Guide
          </h3>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {[
              { key: "Space", action: "Play / Pause" },
              { key: "1", action: "Night Lights" },
              { key: "2", action: "Ocean Currents" },
              { key: "3", action: "ISS Lightning" },
              { key: "4", action: "DYAMOND CO2" },
              { key: "← →", action: "Seek" },
              { key: "M", action: "Mute" },
              { key: "V", action: "Voice Guide" },
            ].map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-black/80 border border-cyan-500/40 text-cyan-300 font-bold min-w-[36px] text-center shadow-inner">
                  {s.key}
                </span>
                <span className="text-slate-400 text-[11px]">{s.action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom enter hint */}
      <div className="text-center pb-6">
        <button
          onClick={onEnter}
          className="text-xs text-slate-500 hover:text-cyan-400 transition-colors font-mono"
        >
          Click anywhere above or press any key to enter →
        </button>
      </div>
    </div>
  );
};
