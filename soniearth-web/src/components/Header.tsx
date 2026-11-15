"use client";

import React from "react";
import { Globe2, Volume2, VolumeX, Mic, MicOff, ShieldCheck, Home } from "lucide-react";

interface HeaderProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  voiceEnabled,
  onToggleVoice,
  isMuted,
  onToggleMute,
  onGoHome,
}) => {
  return (
    <header className="w-full bg-[#06080A]/85 backdrop-blur-xl border-b border-emerald-500/25 px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
      {/* Brand Identity / Return to Landing Page */}
      <div className="flex items-center gap-3">
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Welcome Page"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-600 shadow-[0_0_20px_rgba(0,245,155,0.4)] text-slate-950 font-bold group-hover:scale-105 transition-transform">
            <Globe2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-emerald-100 to-[#00F59B] bg-clip-text text-transparent group-hover:drop-shadow-[0_0_12px_rgba(0,245,155,0.6)] transition-all">
                SoniEarth
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-semibold tracking-wider shadow-[0_0_8px_rgba(0,245,155,0.2)]">
                Jukebox
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Hear the Earth. Understand the Planet.
            </p>
          </div>
        </div>

        {/* Dedicated Clear "Back to Home" Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium bg-[#080D12] border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400 hover:text-white hover:shadow-[0_0_15px_rgba(0,245,155,0.3)] transition-all ml-2"
            title="Return to Welcome Landing Screen"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Back to Home</span>
          </button>
        )}
      </div>

      {/* NASA Verification Badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#080D12] border border-emerald-500/20 text-xs text-slate-300 backdrop-blur-md shadow-inner">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="font-mono text-emerald-400 font-medium">NASA EIC SVS #5313</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-300">VIIRS Black Marble</span>
      </div>

      {/* Accessibility & Audio Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            voiceEnabled
              ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(0,245,155,0.3)]"
              : "bg-[#080D12] border-emerald-500/20 text-slate-400 hover:text-slate-200 hover:border-emerald-500/40"
          }`}
          title="Toggle Autonomous Spoken Guidance (Shortcut: V)"
          aria-label={voiceEnabled ? "Voice Guide Enabled" : "Voice Guide Muted"}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
          <span>Voice {voiceEnabled ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={onToggleMute}
          className={`p-1.5 rounded-xl border transition-all ${
            isMuted
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-[#080D12] border-emerald-500/20 text-slate-300 hover:text-white hover:border-emerald-500/40 hover:shadow-[0_0_10px_rgba(0,245,155,0.2)]"
          }`}
          title="Mute/Unmute Audio (Shortcut: M)"
          aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
