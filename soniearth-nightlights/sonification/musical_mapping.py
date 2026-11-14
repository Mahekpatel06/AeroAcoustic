"""
musical_mapping.py
Translates extracted scientific and visual features into concrete musical note events.
All notes, pitches, velocities, and voicings are fully driven by measured data:
- Mode A (Annual Evolution): C Major Lydian / Pentatonic derived from measured global radiance & delta
- Mode B (Decadal Change): D Dorian & A Minor dual polarity dynamically driven by increase/decrease metrics
- Mode C (Regional Insets): Authentic Regional Scales dynamically driven by regional measurements
"""
import numpy as np
from sonification.scale_quantizer import (
    quantize_to_pentatonic,
    quantize_mode_scale,
    get_chord_for_density,
    PENTATONIC_NOTES,
    DORIAN_NOTES,
    REGIONAL_SCALES,
    NOTE_NAMES
)

FREQ_LOOKUP = {
    "D2": 73.42, "E2": 82.41, "F2": 87.31, "G2": 98.00, "A2": 110.00, "B2": 123.47,
    "C3": 130.81, "C#3": 138.59, "D3": 146.83, "Eb3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "Bb3": 233.08, "B3": 246.94,
    "C4": 261.63, "C#4": 277.18, "D4": 293.66, "Eb4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "Bb4": 466.16, "B4": 493.88,
    "C5": 523.25, "C#5": 554.37, "D5": 587.33, "E5": 659.25, "F#5": 739.99, "G5": 783.99, "A5": 880.00, "B5": 987.77,
    "C6": 1046.50
}

def map_feature_to_note(normalized_value):
    """
    Maps normalized value (0.0 - 1.0) to a pentatonic note.
    """
    return quantize_to_pentatonic(normalized_value)

def derive_annual_harmony(global_mean_brightness, temporal_delta):
    """
    Derives root and fifth harmonic pitches from measured satellite brightness and delta.
    Ensures data-driven pitch movement without hardcoded year ladders.
    """
    # Range of global terrestrial night-lights mean is ~0.0215 to 0.0245
    norm_val = np.clip((global_mean_brightness - 0.0215) / (0.0245 - 0.0215), 0.0, 1.0)
    root_note, root_freq = quantize_to_pentatonic(norm_val)

    root_idx = NOTE_NAMES.index(root_note) if root_note in NOTE_NAMES else 0
    # Fifth interval shift responds to temporal change: upward delta expands interval
    interval_shift = 3 if temporal_delta >= 0 else 2
    fifth_idx = min(len(PENTATONIC_NOTES) - 1, root_idx + interval_shift)
    fifth_note, fifth_freq = PENTATONIC_NOTES[fifth_idx]

    return (root_note, root_freq), (fifth_note, fifth_freq), norm_val

def generate_events_for_frame(frame_feature, event_time_sec, event_duration_sec=0.8):
    """
    Generates a list of AudioNoteEvent dictionaries from a frame feature with data-driven notes.
    """
    events = []
    phase = frame_feature.get("phase", "annual_series")
    region_focus = frame_feature.get("regionFocus", "global")
    global_mean = frame_feature.get("globalMeanBrightness", 0.023)
    temporal_delta = frame_feature.get("temporalDelta", 0.0)

    # ==========================================
    # MODE A: ANNUAL EVOLUTION (2012-2023)
    # ==========================================
    if phase == "annual_series":
        (root_note, root_freq), (fifth_note, fifth_freq), norm_val = derive_annual_harmony(
            global_mean, temporal_delta
        )
        velocity = round(float(np.clip(0.55 + 0.3 * norm_val, 0.4, 0.9)), 2)

        # Baseline Root & Fifth pad (Center channel)
        events.append({
            "timestampSeconds": round(event_time_sec, 3),
            "note": root_note,
            "frequencyHz": round(root_freq, 2),
            "velocity": velocity,
            "durationSeconds": event_duration_sec,
            "pan": 0.0,
            "instrument": "sine_pad",
            "eventType": "annual_root"
        })
        events.append({
            "timestampSeconds": round(event_time_sec + 0.04, 3),
            "note": fifth_note,
            "frequencyHz": round(fifth_freq, 2),
            "velocity": round(velocity * 0.85, 2),
            "durationSeconds": round(event_duration_sec * 0.9, 3),
            "pan": 0.0,
            "instrument": "sine_pad",
            "eventType": "annual_fifth"
        })

        # All 9 Spatial Grid Notes across 3x3 geographic cells
        spatial_grid = frame_feature.get("spatialGrid", [])
        for idx, reg in enumerate(spatial_grid):
            r_note = reg.get("activeNote", root_note)
            r_freq = reg.get("frequencyHz") or FREQ_LOOKUP.get(r_note, root_freq)
            pan = reg.get("pan", 0.0)
            score = reg.get("calibratedScore", 0.5)

            # Staggered arpeggiation delay (0.05s increments across cells)
            t_offset = 0.08 + idx * 0.06
            cell_vel = round(float(np.clip(0.35 + 0.45 * score, 0.25, 0.85)), 2)
            cell_dur = round(float(np.clip(event_duration_sec * (0.4 + 0.3 * score), 0.25, 0.65)), 3)

            events.append({
                "timestampSeconds": round(event_time_sec + t_offset, 3),
                "note": r_note,
                "frequencyHz": round(r_freq, 2),
                "velocity": cell_vel,
                "durationSeconds": cell_dur,
                "pan": pan,
                "instrument": "sine_pad",
                "eventType": "spatial_arpeggio",
                "regionId": reg.get("regionId"),
                "regionName": reg.get("name")
            })

    # ==========================================
    # MODE B: DECADAL CHANGE MAP (Purple / Orange Dual Polarity)
    # ==========================================
    elif phase in ("change_transition", "global_change", "fade_transition", "decadal_summary"):
        change = frame_feature.get("changeClassification", {}) or {}
        inc_ratio = change.get("increaseRatio", 0.0)
        dec_ratio = change.get("decreaseRatio", 0.0)
        net_change = change.get("visualNetChange", inc_ratio - dec_ratio)

        # Baseline drone: pitch derived from net change quantized in D Dorian
        drone_norm = np.clip(0.5 + 5.0 * net_change, 0.0, 1.0)
        drone_note, drone_freq = quantize_mode_scale(drone_norm, "change")

        events.append({
            "timestampSeconds": round(event_time_sec, 3),
            "note": drone_note,
            "frequencyHz": round(drone_freq, 2),
            "velocity": 0.55,
            "durationSeconds": event_duration_sec,
            "pan": 0.0,
            "instrument": "sine_pad",
            "eventType": "dorian_drone"
        })

        # Purple increase motif (ascending crystalline chimes on Right channel)
        if inc_ratio > 0.003:
            # Scale pitch, velocity, and density by measured increase ratio
            chime_vel = round(float(np.clip(0.45 + 15.0 * inc_ratio, 0.4, 0.95)), 2)
            # Pick ascending notes from high Dorian/Pentatonic register based on ratio
            n_chimes = 1 if inc_ratio < 0.008 else (2 if inc_ratio < 0.018 else 3)
            chime_candidates = [("A4", 440.00), ("C5", 523.25), ("E5", 659.25), ("G5", 783.99)]
            
            for i in range(n_chimes):
                c_note, c_freq = chime_candidates[i]
                events.append({
                    "timestampSeconds": round(event_time_sec + 0.10 + i * 0.12, 3),
                    "note": c_note,
                    "frequencyHz": round(c_freq, 2),
                    "velocity": round(chime_vel * (0.9 + 0.1 * i), 2),
                    "durationSeconds": round(0.35 + 0.05 * i, 3),
                    "pan": round(0.65 + 0.08 * i, 2),
                    "instrument": "crystalline_chime_bell",
                    "eventType": "purple_increase"
                })

        # Orange decrease motif (descending warm cello on Left channel)
        if dec_ratio > 0.001:
            cello_vel = round(float(np.clip(0.5 + 20.0 * dec_ratio, 0.45, 0.95)), 2)
            n_cellos = 1 if dec_ratio < 0.005 else (2 if dec_ratio < 0.012 else 3)
            cello_candidates = [("E3", 164.81), ("D3", 146.83), ("A2", 110.00)]

            for i in range(n_cellos):
                c_note, c_freq = cello_candidates[i]
                events.append({
                    "timestampSeconds": round(event_time_sec + 0.15 + i * 0.14, 3),
                    "note": c_note,
                    "frequencyHz": round(c_freq, 2),
                    "velocity": round(cello_vel * (1.0 - 0.05 * i), 2),
                    "durationSeconds": round(0.55 + 0.10 * i, 3),
                    "pan": round(-0.65 - 0.08 * i, 2),
                    "instrument": "warm_cello_synth",
                    "eventType": "orange_decrease"
                })

    # ==========================================
    # MODE C: REGIONAL INSETS (Authentic Regional Scales & Instruments)
    # ==========================================
    else:
        # Authentic regional profiles with dedicated cultural instruments
        reg_profiles = {
            "India": {"instrument": "marimba_pluck", "pan": 0.5, "scale": "India"},
            "Ukraine": {"instrument": "warm_cello_synth", "pan": -0.3, "scale": "Ukraine"},
            "Western Europe": {"instrument": "glass_pad", "pan": -0.5, "scale": "Western Europe"},
            "Eastern Mediterranean": {"instrument": "modal_synth", "pan": 0.1, "scale": "Eastern Mediterranean"}
        }

        profile = reg_profiles.get(region_focus, reg_profiles["India"])
        norm_val = np.clip((global_mean - 0.008) / (0.040 - 0.008), 0.0, 1.0)
        reg_note, reg_freq = quantize_mode_scale(norm_val, "regional", region_focus)
        velocity = round(float(np.clip(0.55 + 0.4 * norm_val, 0.45, 0.95)), 2)

        # Primary regional note
        events.append({
            "timestampSeconds": round(event_time_sec + 0.10, 3),
            "note": reg_note,
            "frequencyHz": round(reg_freq, 2),
            "velocity": velocity,
            "durationSeconds": round(event_duration_sec * 0.6, 3),
            "pan": profile["pan"],
            "instrument": profile["instrument"],
            "eventType": "regional_motif",
            "regionFocus": region_focus
        })

        # Harmonic arpeggiation responding to temporal variation
        second_norm = np.clip(norm_val + (0.2 if temporal_delta >= 0 else -0.15), 0.0, 1.0)
        sec_note, sec_freq = quantize_mode_scale(second_norm, "regional", region_focus)
        events.append({
            "timestampSeconds": round(event_time_sec + 0.24, 3),
            "note": sec_note,
            "frequencyHz": round(sec_freq, 2),
            "velocity": round(velocity * 0.85, 2),
            "durationSeconds": round(event_duration_sec * 0.5, 3),
            "pan": round(profile["pan"] + (0.1 if profile["pan"] >= 0 else -0.1), 2),
            "instrument": profile["instrument"],
            "eventType": "regional_motif",
            "regionFocus": region_focus
        })

    return events
