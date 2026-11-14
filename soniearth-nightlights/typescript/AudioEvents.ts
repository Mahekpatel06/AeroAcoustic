/**
 * AudioEvents.ts
 * Tone.js / Web Audio API scheduling event contracts.
 */

export interface AudioNoteEvent {
  timestampSeconds: number;
  note: string;         // e.g. "C3", "E4", "A4"
  frequencyHz: number;  // e.g. 261.63
  velocity: number;     // 0.0 to 1.0
  durationSeconds: number;
  pan: number;          // -1.0 to 1.0
  instrument: string;   // e.g. "sine_pad", "crystalline_chime_bell", "warm_cello_synth"
  eventType: "drone" | "arpeggio" | "change_motif" | "density_chord";
  channelId?: string;
}

export interface AudioScore {
  datasetId: string;
  totalDurationSeconds: number;
  tempoBpm: number;
  scaleName: string;
  notesVocabulary: string[];
  events: AudioNoteEvent[];
}
