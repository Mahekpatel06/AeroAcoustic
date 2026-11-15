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
    <header className="w-full bg-[#04080F]/90 backdrop-blur-xl border-b border-cyan-500/25 px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
      {/* Brand Identity / Return to Landing Page */}
      <div className="flex items-center gap-3">
        <div 
          onClick={onGoHome}
          className="flex items-center gap-2.5 cursor-pointer group"
          title="Return to Welcome Page"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-teal-400 to-cyan-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] text-slate-950 font-bold group-hover:scale-105 transition-transform">
            <Globe2 className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-[#00F2FE] bg-clip-text text-transparent group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all">
                SoniEarth
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-semibold tracking-wider shadow-[0_0_8px_rgba(6,182,212,0.3)]">
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
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-medium bg-[#06121D] border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all ml-2"
            title="Return to Welcome Landing Screen"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span>Back to Home</span>
          </button>
        )}
      </div>

      {/* NASA Verification Badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#06121D] border border-cyan-500/20 text-xs text-slate-300 backdrop-blur-md shadow-inner">
        <ShieldCheck className="w-4 h-4 text-cyan-400" />
        <span className="font-mono text-cyan-400 font-medium">NASA SVS Data Core</span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-300">Live Multi-Modal Sonification</span>
      </div>

      {/* Accessibility & Audio Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
            voiceEnabled
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "bg-[#06121D] border-cyan-500/20 text-slate-400 hover:text-slate-200 hover:border-cyan-500/40"
          }`}
          title="Toggle Autonomous Spoken Guidance (Shortcut: V)"
          aria-label={voiceEnabled ? "Voice Guide Enabled" : "Voice Guide Muted"}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-cyan-400" /> : <MicOff className="w-3.5 h-3.5" />}
          <span>Voice {voiceEnabled ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={onToggleMute}
          className={`p-1.5 rounded-xl border transition-all ${
            isMuted
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-[#06121D] border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-500/40 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          }`}
          title="Toggle Mute (Shortcut: M)"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
