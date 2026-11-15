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
          obsidian: "#06080A", // deep obsidian space black
          midnight: "#080D12", // dark translucent cockpit glass
          card: "#0D141C",     // titanium cockpit panel card
          border: "rgba(0, 245, 155, 0.25)", // titanium hairline mint border
          mint: "#00F59B",     // laser emerald mint
          emerald: "#10B981",  // telemetry emerald
          focus: "#00F59B",    // accessible focus ring
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
