export interface RegionFeature {
  regionId: string;
  name: string;
  col: number;
  row: number;
  pan: number;
  meanBrightness: number;
  medianBrightness: number;
  stdDeviation: number;
  brightPixelDensity: number;
  activeNote: string;
}

export interface ChangeClassification {
  increaseRatio: number;
  decreaseRatio: number;
  neutralRatio: number;
  visualNetChange: number;
  purplePixelCount: number;
  orangePixelCount: number;
  validPixelCount: number;
  confidenceScore: number;
}

export interface FrameFeature {
  frameIndex: number;
  timestampSeconds: number;
  phase: "annual_series" | "change_transition" | "global_change" | "regional_zoom";
  year?: number;
  regionFocus: string;
  globalMeanBrightness: number;
  globalMedianBrightness: number;
  globalStdDeviation: number;
  brightPixelDensity: number;
  temporalDelta: number;
  spatialGrid: RegionFeature[];
  changeClassification?: ChangeClassification;
  dataOrigin: string;
  confidenceScore: number;
}

export interface DatasetFeatureCollection {
  datasetId: string;
  generatedAt: string;
  version: string;
  samplingFps: number;
  totalFrames: number;
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
}

export interface AudioScore {
  datasetId: string;
  totalDurationSeconds: number;
  tempoBpm: number;
  scaleName: string;
  notesVocabulary: string[];
  eventsCount: number;
  events: AudioNoteEvent[];
}
