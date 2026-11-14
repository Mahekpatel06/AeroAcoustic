import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cosmos: {
          obsidian: "#020617", // slate-950
          midnight: "#0F172A", // slate-900
          card: "#1E293B",     // slate-800
          border: "#334155",   // slate-700
          cyan: "#38BDF8",     // electric cyan
          emerald: "#10B981",  // telemetry emerald
          focus: "#FACC15",    // high-contrast neon yellow
          purple: "#C084FC",   // night lights increase
          orange: "#FB923C",   // night lights decrease
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
