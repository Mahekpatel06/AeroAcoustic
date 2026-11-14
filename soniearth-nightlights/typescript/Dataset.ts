/**
 * Dataset.ts
 * TypeScript integration contracts for SoniEarth datasets.
 */

export interface DatasetSource {
  organization: string;
  facility: string;
  studio: string;
  catalogId: string;
  url: string;
  citation: string;
  underlyingInstrument: string;
  underlyingProduct: string;
}

export interface DatasetTimeRange {
  startYear: number;
  endYear: number;
  durationYears: number;
}

export interface DatasetManifest {
  id: string;
  title: string;
  description: string;
  source: DatasetSource;
  timeRange: DatasetTimeRange;
  featuresPath: string;
  mappingProfile: string;
  phases: {
    annualSeries: string;
    changeTransition: string;
    globalChange: string;
    regionalZooms: string[];
  };
  scientificNotice: string;
}
