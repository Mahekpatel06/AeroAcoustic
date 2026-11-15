export interface RegionFeature {
  regionId: string;
  name: string;
  col?: number;
  row?: number;
  pan: number;
  meanBrightness?: number;
  medianBrightness?: number;
  stdDeviation?: number;
  brightPixelDensity?: number;
  activeNote?: string;
  frequencyHz?: number;
  calibratedScore?: number;
  strikeInZone?: boolean;
  meanTemperature?: number;
}

export interface ChangeClassification {
  increaseRatio: number;
  decreaseRatio: number;
  neutralRatio: number;
  visualNetChange: number;
  purplePixelCount: number;
  orangePixelCount: number;
  purpleMeanIntensity?: number;
  orangeMeanIntensity?: number;
  validPixelCount: number;
  confidenceScore: number;
}

export interface FrameFeature {
  frameIndex: number;
  timestampSeconds: number;
  phase?: "annual_series" | "change_transition" | "global_change" | "fade_transition" | "regional_zoom" | "decadal_summary";
  year?: number | null;
  regionFocus?: string;
  globalMeanBrightness?: number;
  globalMedianBrightness?: number;
  globalStdDeviation?: number;
  brightPixelDensity?: number;
  temporalDelta?: number;
  spatialGrid?: RegionFeature[];
  changeClassification?: ChangeClassification | null;
  dataOrigin?: string;
  confidenceScore?: number;
  // ISS Lightning Transient Fields
  isStrike?: boolean;
  strikeEnergyMicroJoules?: number;
  strikePan?: number;
  strikeCoord?: [number, number];
  activeNote?: string;
  frequencyHz?: number;
  hapticTrigger?: boolean;
  // NASA SVS #3912 Ocean Currents Fields
  thermalIndex?: number;
  temperatureCelsius?: number;
  currentVelocityKnots?: number;
  tempoBpm?: number;
  flowDirection?: "west_to_east" | "east_to_west";
}

export interface DatasetFeatureCollection {
  datasetId: string;
  title?: string;
  catalogUrl?: string;
  generatedAt: string;
  version: string;
  samplingFps: number;
  totalFrames: number;
  durationSeconds?: number;
  totalStrikesDetected?: number;
  orbitalAltitudeKm?: number;
  orbitalVelocityKmS?: number;
  instrument?: string;
  scientificNotice: string;
  frames: FrameFeature[];
}

export interface AudioNoteEvent {
  timestampSeconds: number;
  note: string;
  frequencyHz: number;
  velocity: number;
  durationSeconds: number;
  pan: number;
  instrument: string;
  eventType: string;
  frameIndex?: number;
  year?: number | null;
  mode?: string;
  regionFocus?: string;
  regionId?: string;
  regionName?: string;
}

export interface AudioScore {
  datasetId: string;
  version?: string;
  totalDurationSeconds: number;
  tempoBpm: number;
  scaleName: string;
  notesVocabulary: string[];
  eventsCount: number;
  events: AudioNoteEvent[];
}

export type OceanBasinId = "ALL" | "OCEAN_PACIFIC" | "OCEAN_ATLANTIC" | "OCEAN_INDIAN";

export interface OceanBasinInfo {
  id: OceanBasinId;
  name: string;
  pan: number;
  targetRotationY: number;
  targetRotationX: number;
  centerLon: number;
  centerLat: number;
  description: string;
}
