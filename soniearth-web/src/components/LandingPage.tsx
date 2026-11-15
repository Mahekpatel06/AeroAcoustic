"use client";

import React from "react";
import { Zap, Moon, Globe2, Keyboard, ChevronRight, Satellite, Music2, Ear } from "lucide-react";

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#06080A] text-white flex flex-col overflow-x-hidden">

      {/* NASA Badge */}
      <div className="w-full flex justify-center pt-6">
        <span className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 tracking-wider uppercase shadow-[0_0_15px_rgba(0,245,155,0.2)]">
          🏆 NASA Space Apps Challenge 2024
        </span>
      </div>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-10 pb-12 flex-1">
        {/* Glow behind title */}
        <div className="relative mb-2">
          <div className="absolute inset-0 blur-[90px] bg-emerald-500/20 rounded-full scale-150 pointer-events-none" />
          <h1 className="relative text-6xl sm:text-7xl font-black tracking-tight bg-gradient-to-b from-white via-emerald-100 to-[#00F59B] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(0,245,155,0.4)]">
            SoniEarth
          </h1>
        </div>
        <p className="text-xl sm:text-2xl text-slate-300 font-light mt-1 tracking-wide">
          The Earth Information Jukebox
        </p>
        <p className="text-sm text-slate-400 mt-2 font-mono">
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
              className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full bg-[#080D12]/90 border border-emerald-500/20 text-slate-300"
            >
              {pill.icon} {pill.label}
            </span>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={onEnter}
          className="mt-10 group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 font-bold text-lg shadow-[0_0_40px_rgba(0,245,155,0.4)] hover:shadow-[0_0_60px_rgba(0,245,155,0.6)] hover:scale-105 transition-all duration-300"
        >
          <span>▶ Enter the Jukebox</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <p className="text-[11px] text-slate-500 mt-3 font-mono">or press any key to continue</p>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-10">
        <h2 className="text-center text-xs font-mono text-emerald-400/80 uppercase tracking-widest mb-5">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Globe2,
              step: "01",
              title: "Pick a Dataset",
              desc: "Choose from real NASA satellite datasets — Decadal Night Lights or ISS Lightning Events from space.",
              color: "text-emerald-400",
              bg: "bg-[#080D12]/70 border-emerald-500/25",
            },
            {
              icon: Music2,
              step: "02",
              title: "Press Play",
              desc: "Hit Spacebar or click the Play button. The satellite data instantly transforms into real-time music.",
              color: "text-emerald-400",
              bg: "bg-[#080D12]/70 border-emerald-500/25",
            },
            {
              icon: Ear,
              step: "03",
              title: "Hear & Understand",
              desc: "Every sound explains a real Earth event — storms, blackouts, electrification, orbital lightning.",
              color: "text-emerald-400",
              bg: "bg-[#080D12]/70 border-emerald-500/25",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.step}
                className={`flex flex-col gap-3 p-5 rounded-2xl border ${card.bg} backdrop-blur-xl shadow-lg`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-black/60 border border-emerald-500/30 ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`font-mono text-xs font-bold ${card.color} opacity-80`}>
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
        <div className="bg-[#080D12]/75 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-xl">
          <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Satellite className="w-3.5 h-3.5 text-emerald-400" />
            Datasets Available
          </h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Moon className="w-4 h-4 text-emerald-400" />
                  Decadal Night Lights
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 ml-6">NASA SVS #5313 · 2012–2023</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(0,245,155,0.2)]">LIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  ISS Lightning Events
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 ml-6">NASA SVS #5011 · 2017–2023</div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(0,245,155,0.2)]">LIVE</span>
            </div>
            <div className="flex items-center justify-between opacity-40">
              <div className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                🌊 Sea Surface Currents
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-emerald-500/10 text-slate-500">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between opacity-40">
              <div className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                💨 DYAMOND Global CO2
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-emerald-500/10 text-slate-500">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-[#080D12]/75 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-xl">
          <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
            Keyboard Shortcuts
          </h3>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {[
              { key: "Space", action: "Play / Pause" },
              { key: "1", action: "Night Lights" },
              { key: "3", action: "ISS Lightning" },
              { key: "← →", action: "Seek" },
              { key: "M", action: "Mute / Unmute" },
              { key: "V", action: "Voice Guide" },
            ].map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-black/80 border border-emerald-500/30 text-emerald-300 font-bold min-w-[40px] text-center shadow-inner">
                  {s.key}
                </span>
                <span className="text-slate-400">{s.action}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom enter hint */}
      <div className="text-center pb-6">
        <button
          onClick={onEnter}
          className="text-xs text-slate-500 hover:text-emerald-400 transition-colors font-mono"
        >
          Click anywhere above or press any key to enter →
        </button>
      </div>
    </div>
  );
};
