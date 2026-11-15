"use client";

import React from "react";
import { Keyboard, Accessibility } from "lucide-react";

interface AccessibilityFooterProps {
  ariaAnnouncement: string;
}

export const AccessibilityFooter: React.FC<AccessibilityFooterProps> = ({
  ariaAnnouncement,
}) => {
  return (
    <footer className="w-full bg-[#04080F]/90 backdrop-blur-xl border-t border-cyan-500/20 px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 sticky bottom-0 z-50 shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
      {/* Hidden ARIA Live Region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        aria-atomic="true"
      >
        {ariaAnnouncement}
      </div>

      {/* Visual Status Indicator */}
      <div className="flex items-center gap-2">
        <Accessibility className="w-4 h-4 text-cyan-400" />
        <span className="font-mono text-slate-300 text-[11px]">
          WCAG AAA Compliant:
        </span>
        <span className="text-cyan-400 font-mono text-[11px] truncate max-w-xs md:max-w-md drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
          {ariaAnnouncement || "System Ready. Press Space to play sonification."}
        </span>
      </div>

      {/* Keyboard Shortcuts Legend */}
      <div className="flex items-center gap-2 text-[11px] font-mono">
        <Keyboard className="w-3.5 h-3.5 text-cyan-400 hidden sm:block" />
        <span className="hidden sm:inline text-slate-500">Shortcuts:</span>
        <span className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">
          [Space] Play
        </span>
        <span className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">
          [1-4] Dataset
        </span>
        <span className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">
          [← / →] Seek
        </span>
        <span className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">
          [V] Voice
        </span>
        <span className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 text-cyan-300">
          [M] Mute
        </span>
      </div>
    </footer>
  );
};
