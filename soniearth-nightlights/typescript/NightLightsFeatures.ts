/**
 * NightLightsFeatures.ts
 * Detailed feature schema for the Decadal Night Lights dataset (NASA SVS #5313).
 */

export interface RegionFeature {
  regionId: string;
  name: string;
  pan: number; // -1.0 (Left) to +1.0 (Right)
  meanBrightness: number;
  brightPixelDensity: number;
  medianBrightness: number;
  stdDeviation: number;
  activeNote: string;
}

export interface ChangeClassification {
  increaseRatio: number; // Fraction of valid area classified as increased illumination (purple)
  decreaseRatio: number; // Fraction of valid area classified as decreased illumination (orange)
  neutralRatio: number;  // Fraction of unchanged or dark area
  visualNetChange: number; // increaseRatio - decreaseRatio
  confidenceScore: number;
}

export interface NightLightsFrameFeature {
  frameIndex: number;
  timestampSeconds: number;
  phase: "annual_series" | "change_transition" | "global_change" | "regional_zoom";
  year?: number;
  regionFocus?: "global" | "India" | "Ukraine" | "Western Europe" | "Eastern Mediterranean";
  globalMeanBrightness: number;
  globalMedianBrightness: number;
  globalStdDeviation: number;
  brightPixelDensity: number;
  spatialGrid: RegionFeature[];
  changeClassification?: ChangeClassification;
  temporalDelta?: number;
  dataOrigin: "scientific" | "visual-estimate";
}

export interface NightLightsFeatureCollection {
  datasetId: string;
  generatedAt: string;
  version: string;
  samplingFps: number;
  totalFrames: number;
  frames: NightLightsFrameFeature[];
}
