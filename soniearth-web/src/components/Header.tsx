"use client";

import React from "react";
import { Globe2, Volume2, VolumeX, Mic, MicOff, ShieldCheck } from "lucide-react";

interface HeaderProps {
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  voiceEnabled,
  onToggleVoice,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20 text-white">
          <Globe2 className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-sky-400 via-indigo-200 to-teal-300 bg-clip-text text-transparent">
              SoniEarth
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-800/60 text-sky-400 font-semibold tracking-wider">
              Jukebox
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Hear the Earth. Understand the Planet.
          </p>
        </div>
      </div>

      {/* NASA Verification Badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span className="font-mono text-emerald-400 font-medium">NASA EIC SVS #5313</span>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">VIIRS Black Marble</span>
      </div>

      {/* Accessibility & Audio Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            voiceEnabled
              ? "bg-sky-500/10 border-sky-500/40 text-sky-300 hover:bg-sky-500/20"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
          title="Toggle Autonomous Spoken Guidance (Shortcut: V)"
          aria-label={voiceEnabled ? "Voice Guide Enabled" : "Voice Guide Muted"}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5 text-sky-400" /> : <MicOff className="w-3.5 h-3.5" />}
          <span>Voice {voiceEnabled ? "ON" : "OFF"}</span>
        </button>

        <button
          onClick={onToggleMute}
          className={`p-2 rounded-lg border transition-colors ${
            isMuted
              ? "bg-red-500/10 border-red-500/40 text-red-400"
              : "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
          }`}
          title="Mute/Unmute Audio (Shortcut: M)"
          aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
        </button>
      </div>
    </header>
  );
};
