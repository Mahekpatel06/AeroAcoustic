"""
musical_mapping.py
Translates extracted scientific/visual features into concrete musical note events.
Enforces C Major Pentatonic vocabulary and clean harmonic voicings.
"""
from sonification.scale_quantizer import quantize_to_pentatonic, get_chord_for_density, PENTATONIC_NOTES
from sonification.normalization import min_max_normalize

def map_feature_to_note(mean_brightness):
    """
    Maps normalized mean brightness (0.0 - 1.0) to a pentatonic note.
    """
    return quantize_to_pentatonic(mean_brightness)

def generate_events_for_frame(frame_feature, event_time_sec, event_duration_sec=0.8):
    """
    Generates a list of AudioNoteEvent dictionaries from a frame feature.
    """
    events = []
    phase = frame_feature.get("phase", "annual_series")

    # 1. Global Baseline Drone/Pad Note based on global mean brightness
    global_brightness = frame_feature.get("globalMeanBrightness", 0.1)
    root_note, root_freq = map_feature_to_note(global_brightness)
    density = frame_feature.get("brightPixelDensity", 0.05)
    chord_notes = get_chord_for_density(root_note, density)

    for i, (note, freq) in enumerate(chord_notes):
        events.append({
            "timestampSeconds": round(event_time_sec + (i * 0.05), 3),
            "note": note,
            "frequencyHz": freq,
            "velocity": round(0.5 + (0.3 * global_brightness), 2),
            "durationSeconds": event_duration_sec,
            "pan": 0.0,
            "instrument": "sine_pad",
            "eventType": "density_chord"
        })

    # 2. Spatial Grid Notes (sample 3 active regions: West, Center, East)
    spatial_grid = frame_feature.get("spatialGrid", [])
    for reg in spatial_grid:
        if reg.get("brightPixelDensity", 0) > 0.02:
            r_note, r_freq = map_feature_to_note(reg["meanBrightness"])
            events.append({
                "timestampSeconds": round(event_time_sec + 0.1, 3),
                "note": r_note,
                "frequencyHz": r_freq,
                "velocity": round(0.4 + (0.4 * reg["meanBrightness"]), 2),
                "durationSeconds": event_duration_sec * 0.7,
                "pan": reg["pan"],
                "instrument": "sine_pad",
                "eventType": "arpeggio"
            })

    # 3. Change Motifs if Change Map is active
    change = frame_feature.get("changeClassification")
    if change:
        inc_ratio = change.get("increaseRatio", 0.0)
        dec_ratio = change.get("decreaseRatio", 0.0)

        # Purple increase motif (ascending chime triad)
        if inc_ratio > 0.01:
            events.append({
                "timestampSeconds": round(event_time_sec + 0.15, 3),
                "note": "C4",
                "frequencyHz": 261.63,
                "velocity": round(min(1.0, 0.4 + inc_ratio * 4.0), 2),
                "durationSeconds": 0.5,
                "pan": 0.5,
                "instrument": "crystalline_chime_bell",
                "eventType": "change_motif"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.30, 3),
                "note": "G4",
                "frequencyHz": 392.00,
                "velocity": round(min(1.0, 0.5 + inc_ratio * 4.0), 2),
                "durationSeconds": 0.6,
                "pan": 0.7,
                "instrument": "crystalline_chime_bell",
                "eventType": "change_motif"
            })

        # Orange decrease motif (descending cello tones)
        if dec_ratio > 0.01:
            events.append({
                "timestampSeconds": round(event_time_sec + 0.20, 3),
                "note": "E3",
                "frequencyHz": 164.81,
                "velocity": round(min(1.0, 0.4 + dec_ratio * 4.0), 2),
                "durationSeconds": 0.7,
                "pan": -0.5,
                "instrument": "warm_cello_synth",
                "eventType": "change_motif"
            })
            events.append({
                "timestampSeconds": round(event_time_sec + 0.35, 3),
                "note": "C3",
                "frequencyHz": 130.81,
                "velocity": round(min(1.0, 0.5 + dec_ratio * 4.0), 2),
                "durationSeconds": 0.8,
                "pan": -0.7,
                "instrument": "warm_cello_synth",
                "eventType": "change_motif"
            })

    return events
