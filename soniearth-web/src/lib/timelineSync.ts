/**
 * timelineSync.ts
 * Master timecode mapping for NASA SVS #5313 Decadal Night Lights.
 * Video duration: 43.33 seconds (1300 frames @ 30 FPS).
 *
 * Phase Mapping:
 * - Mode A: Annual Evolution (0.00s - 12.00s) -> 12 years (2012-2023), exactly 1.0s per year.
 * - Mode B: Decadal Change Map (12.00s - 23.50s) -> Cross-fade into Purple/Orange change polarity.
 * - Mode C: Regional Insets (23.50s - 43.33s) -> World map with 4 detailed high-resolution insets.
 */

export interface TimeSlice {
  start: number;
  end: number;
  frameIndex: number;
  phase: "annual_series" | "change_transition" | "global_change" | "fade_transition" | "regional_zoom";
  year?: number;
  regionFocus: string;
  label: string;
}

export const TIMELINE_SLICES: TimeSlice[] = [
  // --- MODE A: ANNUAL EVOLUTION (0.00s - 12.00s) ---
  { start: 0.0, end: 1.0, frameIndex: 10, phase: "annual_series", year: 2012, regionFocus: "global", label: "Year 2012" },
  { start: 1.0, end: 2.0, frameIndex: 40, phase: "annual_series", year: 2013, regionFocus: "global", label: "Year 2013" },
  { start: 2.0, end: 3.0, frameIndex: 71, phase: "annual_series", year: 2014, regionFocus: "global", label: "Year 2014" },
  { start: 3.0, end: 4.0, frameIndex: 101, phase: "annual_series", year: 2015, regionFocus: "global", label: "Year 2015" },
  { start: 4.0, end: 5.0, frameIndex: 132, phase: "annual_series", year: 2016, regionFocus: "global", label: "Year 2016" },
  { start: 5.0, end: 6.0, frameIndex: 162, phase: "annual_series", year: 2017, regionFocus: "global", label: "Year 2017" },
  { start: 6.0, end: 7.0, frameIndex: 193, phase: "annual_series", year: 2018, regionFocus: "global", label: "Year 2018" },
  { start: 7.0, end: 8.0, frameIndex: 223, phase: "annual_series", year: 2019, regionFocus: "global", label: "Year 2019" },
  { start: 8.0, end: 9.0, frameIndex: 254, phase: "annual_series", year: 2020, regionFocus: "global", label: "Year 2020" },
  { start: 9.0, end: 10.0, frameIndex: 284, phase: "annual_series", year: 2021, regionFocus: "global", label: "Year 2021" },
  { start: 10.0, end: 11.0, frameIndex: 315, phase: "annual_series", year: 2022, regionFocus: "global", label: "Year 2022" },
  { start: 11.0, end: 12.0, frameIndex: 345, phase: "annual_series", year: 2023, regionFocus: "global", label: "Year 2023" },

  // --- MODE B: DECADAL CHANGE & TRANSITION (12.00s - 23.50s) ---
  { start: 12.0, end: 13.5, frameIndex: 380, phase: "change_transition", year: undefined, regionFocus: "global", label: "Transition Fade" },
  { start: 13.5, end: 15.0, frameIndex: 420, phase: "change_transition", year: undefined, regionFocus: "global", label: "Change Overlay" },
  { start: 15.0, end: 17.0, frameIndex: 480, phase: "global_change", year: 2023, regionFocus: "global", label: "Decadal Change Map" },
  { start: 17.0, end: 19.0, frameIndex: 530, phase: "global_change", year: 2023, regionFocus: "global", label: "Polarity Analysis" },
  { start: 19.0, end: 21.0, frameIndex: 580, phase: "global_change", year: 2023, regionFocus: "global", label: "Decadal Net Shift" },
  { start: 21.0, end: 22.5, frameIndex: 630, phase: "fade_transition", year: undefined, regionFocus: "global", label: "Regional Transition" },
  { start: 22.5, end: 23.5, frameIndex: 680, phase: "fade_transition", year: undefined, regionFocus: "global", label: "Inset Preparation" },

  // --- MODE C: REGIONAL INSETS (23.50s - 43.33s) ---
  { start: 23.5, end: 25.5, frameIndex: 720, phase: "regional_zoom", year: 2023, regionFocus: "Overview (All Insets)", label: "4 Regional Insets" },
  { start: 25.5, end: 28.0, frameIndex: 780, phase: "regional_zoom", year: 2023, regionFocus: "India", label: "South Asia • India" },
  { start: 28.0, end: 30.0, frameIndex: 840, phase: "regional_zoom", year: 2023, regionFocus: "India", label: "India Electrification" },
  { start: 30.0, end: 32.5, frameIndex: 910, phase: "regional_zoom", year: 2023, regionFocus: "Ukraine", label: "Eastern Europe • Ukraine" },
  { start: 32.5, end: 34.5, frameIndex: 970, phase: "regional_zoom", year: 2023, regionFocus: "Ukraine", label: "Ukraine Blackout Corridors" },
  { start: 34.5, end: 36.5, frameIndex: 1040, phase: "regional_zoom", year: 2023, regionFocus: "Western Europe", label: "Western Europe Grid" },
  { start: 36.5, end: 38.5, frameIndex: 1100, phase: "regional_zoom", year: 2023, regionFocus: "Western Europe", label: "Continental LED Shift" },
  { start: 38.5, end: 41.0, frameIndex: 1180, phase: "regional_zoom", year: 2023, regionFocus: "Eastern Mediterranean", label: "Eastern Mediterranean" },
  { start: 41.0, end: 43.33, frameIndex: 1250, phase: "regional_zoom", year: 2023, regionFocus: "Eastern Mediterranean", label: "Levant Dynamics" }
];

export const TOTAL_VIDEO_DURATION = 43.33;

export const MODE_BOUNDARIES = {
  annual: { start: 0.0, end: 12.0, name: "Mode A: Annual Timeline" },
  change: { start: 12.0, end: 23.5, name: "Mode B: Decadal Change" },
  regional: { start: 23.5, end: 43.33, name: "Mode C: Regional Insets" },
};

/**
 * Returns the exact time slice for a given timestamp in seconds.
 */
export function getSliceForTime(timeSec: number): TimeSlice {
  const clamped = Math.max(0, Math.min(TOTAL_VIDEO_DURATION, timeSec));
  const slice = TIMELINE_SLICES.find((s) => clamped >= s.start && clamped < s.end);
  return slice || TIMELINE_SLICES[TIMELINE_SLICES.length - 1];
}

/**
 * Determines which mode matches a timestamp.
 */
export function getModeForTime(timeSec: number): "annual" | "change" | "regional" {
  if (timeSec < 12.0) return "annual";
  if (timeSec < 23.5) return "change";
  return "regional";
}

/**
 * Seek targets for modes and regions.
 */
export const SEEK_TARGETS = {
  annual: 0.0,
  change: 14.5,
  regional: 23.5,
  regions: {
    "Overview (All Insets)": 23.5,
    "India": 25.5,
    "Ukraine": 30.0,
    "Western Europe": 34.5,
    "Eastern Mediterranean": 38.5,
  }
};
