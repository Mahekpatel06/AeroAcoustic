"""
musical_mapping.py
Translates extracted scientific/visual features into concrete musical note events.
Enforces multi-mode scale vocabularies:
- Mode A (Annual Evolution): C Major Lydian ascending decadal harmonies
- Mode B (Decadal Change): D Dorian & A Minor dual polarity
- Mode C (Regional Zoom): Authentic Regional Scales (India, Ukraine, Western Europe, Mediterranean)
"""
from sonification.scale_quantizer import (
    quantize_to_pentatonic,
    quantize_mode_scale,
    get_chord_for_density,
    PENTATONIC_NOTES,
    DORIAN_NOTES,
    REGIONAL_SCALES
)

FREQ_LOOKUP = {
    "D2": 73.42, "E2": 82.41, "F2": 87.31, "G2": 98.00, "A2": 110.00, "B2": 123.47,
    "C3": 130.81, "C#3": 138.59, "D3": 146.83, "Eb3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "Bb3": 233.08, "B3": 246.94,
    "C4": 261.63, "C#4": 277.18, "D4": 293.66, "Eb4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "Bb4": 466.16, "B4": 493.88,
    "C5": 523.25, "C#5": 554.37, "D5": 587.33, "E5": 659.25, "F#5": 739.99, "G5": 783.99, "A5": 880.00, "B5": 987.77,
    "C6": 1046.50
}

ANNUAL_HARMONY_MAP = {
    2012: ("C3", "G3"), 2013: ("D3", "A3"), 2014: ("E3", "B3"),
    2015: ("G3", "D4"), 2016: ("A3", "E4"), 2017: ("C4", "G4"),
    2018: ("D4", "A4"), 2019: ("E4", "B4"), 2020: ("F#4", "C#5"),
    2021: ("G4", "D5"), 2022: ("A4", "E5"), 2023: ("C5", "G5")
}

def map_feature_to_note(normalized_value):
    """
    Maps normalized value (0.0 - 1.0) to a pentatonic note.
    """
    return quantize_to_pentatonic(normalized_value)

def generate_events_for_frame(frame_feature, event_time_sec, event_duration_sec=0.8):
    """
    Generates a list of AudioNoteEvent dictionaries from a frame feature with mode-specific scales.
    """
    events = []
    phase = frame_feature.get("phase", "annual_series")
    year = frame_feature.get("year", 2012)
    region_focus = frame_feature.get("regionFocus", "global")

    # ==========================================
    # MODE A: ANNUAL EVOLUTION (2012-2023)
    # ==========================================
    if phase == "annual_series":
        root_note, fifth_note = ANNUAL_HARMONY_MAP.get(year, ("C3", "G3"))
        root_freq = FREQ_LOOKUP.get(root_note, 130.81)
        fifth_freq = FREQ_LOOKUP.get(fifth_note, 196.00)

        # Baseline Root & Fifth pad
        events.append({
            "timestampSeconds": round(event_time_sec, 3),
            "note": root_note,
            "frequencyHz": root_freq,
            "velocity": 0.65,
            "durationSeconds": event_duration_sec,
            "pan": 0.0,
            "instrument": "sine_pad",
            "eventType": "annual_root"
        })
        events.append({
            "timestampSeconds": round(event_time_sec + 0.05, 3),
            "note": fifth_note,
            "frequencyHz": fifth_freq,
            "velocity": 0.5,
            "durationSeconds": event_duration_sec * 0.9,
            "pan": 0.0,
            "instrument": "sine_pad",
            "eventType": "annual_fifth"
        })

        # Spatial Grid Notes across columns
        spatial_grid = frame_feature.get("spatialGrid", [])
        for reg in spatial_grid:
            r_note = reg.get("activeNote", "C3")
            r_freq = FREQ_LOOKUP.get(r_note, 130.81)
            pan = reg.get("pan", 0.0)
            events.append({
                "timestampSeconds": round(event_time_sec + 0.12, 3),
                "note": r_note,
                "frequencyHz": r_freq,
                "velocity": 0.5,
                "durationSeconds": event_duration_sec * 0.6,
                "pan": pan,
                "instrument": "sine_pad",
                "eventType": "spatial_arpeggio"
            })

    # ==========================================
    # MODE B: DECADAL CHANGE MAP (D Dorian / A Minor Dual Polarity)
    # ==========================================
    elif phase in ("change_transition", "global_change"):
        # D Dorian baseline root
        events.append({
            "timestampSeconds": round(event_time_sec, 3),
            "note": "D3",
            "frequencyHz": 146.83,
            "velocity": 0.55,
            "durationSeconds": event_duration_sec,
            "pan": 0.0,
            "instrument": "sine_pad",
            "eventType": "dorian_drone"
        })

        change = frame_feature.get("changeClassification", {})
        inc_ratio = change.get("increaseRatio", 0.0)
        dec_ratio = change.get("decreaseRatio", 0.0)

        # Purple increase motif (ascending crystalline chimes on Right)
        if inc_ratio > 0.008:
            events.append({
                "timestampSeconds": round(event_time_sec + 0.12, 3),
                "note": "A4",
                "frequencyHz": 440.00,
                "velocity": 0.85,
                "durationSeconds": 0.4,
                "pan": 0.6,
                "instrument": "crystalline_chime_bell",
                "eventType": "purple_increase"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.24, 3),
                "note": "C5",
                "frequencyHz": 523.25,
                "velocity": 0.9,
                "durationSeconds": 0.45,
                "pan": 0.7,
                "instrument": "crystalline_chime_bell",
                "eventType": "purple_increase"
            })

        # Orange decrease motif (descending warm cello on Left)
        if dec_ratio > 0.001:
            events.append({
                "timestampSeconds": round(event_time_sec + 0.15, 3),
                "note": "E3",
                "frequencyHz": 164.81,
                "velocity": 0.75,
                "durationSeconds": 0.6,
                "pan": -0.6,
                "instrument": "warm_cello_synth",
                "eventType": "orange_decrease"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.30, 3),
                "note": "D3",
                "frequencyHz": 146.83,
                "velocity": 0.8,
                "durationSeconds": 0.7,
                "pan": -0.7,
                "instrument": "warm_cello_synth",
                "eventType": "orange_decrease"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.45, 3),
                "note": "A2",
                "frequencyHz": 110.00,
                "velocity": 0.85,
                "durationSeconds": 0.8,
                "pan": -0.8,
                "instrument": "warm_cello_synth",
                "eventType": "orange_decrease"
            })

    # ==========================================
    # MODE C: REGIONAL ZOOM (Authentic Regional Scales)
    # ==========================================
    else:
        if region_focus == "India":
            # E Mixolydian (Raag Desh) Pluck Arp
            events.append({
                "timestampSeconds": round(event_time_sec + 0.1, 3),
                "note": "E4", "frequencyHz": 329.63, "velocity": 0.9,
                "durationSeconds": 0.3, "pan": 0.4,
                "instrument": "crystalline_chime_bell", "eventType": "regional_motif"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.2, 3),
                "note": "G#4", "frequencyHz": 415.30, "velocity": 0.85,
                "durationSeconds": 0.3, "pan": 0.6,
                "instrument": "crystalline_chime_bell", "eventType": "regional_motif"
            })
        elif region_focus == "Ukraine":
            # A Minor Solemn Cello
            events.append({
                "timestampSeconds": round(event_time_sec + 0.15, 3),
                "note": "E3", "frequencyHz": 164.81, "velocity": 0.8,
                "durationSeconds": 0.65, "pan": -0.5,
                "instrument": "warm_cello_synth", "eventType": "regional_motif"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.35, 3),
                "note": "A2", "frequencyHz": 110.00, "velocity": 0.85,
                "durationSeconds": 0.8, "pan": -0.7,
                "instrument": "warm_cello_synth", "eventType": "regional_motif"
            })
        elif region_focus == "Western Europe":
            # G Lydian Glass Pad
            events.append({
                "timestampSeconds": round(event_time_sec + 0.1, 3),
                "note": "G4", "frequencyHz": 392.00, "velocity": 0.75,
                "durationSeconds": 0.7, "pan": 0.0,
                "instrument": "sine_pad", "eventType": "regional_motif"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.15, 3),
                "note": "F#4", "frequencyHz": 369.99, "velocity": 0.65,
                "durationSeconds": 0.7, "pan": 0.3,
                "instrument": "sine_pad", "eventType": "regional_motif"
            })
        else:
            # Eastern Mediterranean: D Phrygian Dominant
            events.append({
                "timestampSeconds": round(event_time_sec + 0.1, 3),
                "note": "D3", "frequencyHz": 146.83, "velocity": 0.8,
                "durationSeconds": 0.6, "pan": 0.2,
                "instrument": "sine_pad", "eventType": "regional_motif"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.25, 3),
                "note": "Eb3", "frequencyHz": 155.56, "velocity": 0.85,
                "durationSeconds": 0.6, "pan": 0.4,
                "instrument": "sine_pad", "eventType": "regional_motif"
            })

    return events
