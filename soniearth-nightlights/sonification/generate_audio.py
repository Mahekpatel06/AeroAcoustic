"""
generate_audio.py
Synthesizes demonstration audio for all 3 Sonification Modes:
Mode A: Annual Evolution (2012–2023) -> audio/generated/night_lights_ambient.wav
Mode B: Global Change (Purple / Orange) -> audio/generated/night_lights_change.wav
Mode C: Regional Exploration -> audio/generated/night_lights_regional.wav
Also exports the Tone.js-ready AudioScore JSON in data/intermediate/audio_events.json
"""
import os
import json
from sonification.musical_mapping import generate_events_for_frame
from sonification.scheduler import render_score_to_audio, export_wav
from sonification.scale_quantizer import NOTE_NAMES

FEATURES_PATH = "soniearth-nightlights/data/features/night_lights_features.json"
AUDIO_DIR = "soniearth-nightlights/audio/generated"
SCORE_OUT_PATH = "soniearth-nightlights/data/intermediate/audio_events.json"

def generate_all_sonification_modes():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(f"Missing {FEATURES_PATH}")

    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_frames = data.get("frames", [])

    # Filter frames for each mode
    annual_frames = [f for f in all_frames if f["phase"] == "annual_series"]
    change_frames = [f for f in all_frames if f["phase"] in ["change_transition", "global_change"]]
    regional_frames = [f for f in all_frames if f["phase"] == "regional_zoom"]

    all_score_events = []

    # -------------------------------------------------------------
    # MODE A: Annual Evolution (2012–2023)
    # -------------------------------------------------------------
    print("\n--- Generating Mode A: Annual Evolution (2012–2023) ---")
    events_a = []
    t_cursor = 0.0
    step_duration = 0.8  # Each annual step is 0.8s

    for f in annual_frames:
        frame_events = generate_events_for_frame(f, event_time_sec=t_cursor, event_duration_sec=0.7)
        events_a.extend(frame_events)
        all_score_events.extend(frame_events)
        t_cursor += step_duration

    audio_a = render_score_to_audio(events_a, total_duration_sec=t_cursor + 1.0)
    out_a = os.path.join(AUDIO_DIR, "night_lights_ambient.wav")
    export_wav(audio_a, out_a)

    # -------------------------------------------------------------
    # MODE B: Global Change Map (Purple Increase & Orange Decrease)
    # -------------------------------------------------------------
    print("\n--- Generating Mode B: Global Change Map ---")
    events_b = []
    t_cursor = 0.0
    step_duration = 0.9

    for f in change_frames:
        frame_events = generate_events_for_frame(f, event_time_sec=t_cursor, event_duration_sec=0.8)
        events_b.extend(frame_events)
        all_score_events.extend(frame_events)
        t_cursor += step_duration

    audio_b = render_score_to_audio(events_b, total_duration_sec=t_cursor + 1.0)
    out_b = os.path.join(AUDIO_DIR, "night_lights_change.wav")
    export_wav(audio_b, out_b)

    # -------------------------------------------------------------
    # MODE C: Regional Zoom Exploration (India, Ukraine, Europe, Med)
    # -------------------------------------------------------------
    print("\n--- Generating Mode C: Regional Zoom Exploration ---")
    events_c = []
    t_cursor = 0.0
    step_duration = 1.0

    for f in regional_frames:
        frame_events = generate_events_for_frame(f, event_time_sec=t_cursor, event_duration_sec=0.9)
        events_c.extend(frame_events)
        all_score_events.extend(frame_events)
        t_cursor += step_duration

    audio_c = render_score_to_audio(events_c, total_duration_sec=t_cursor + 1.0)
    out_c = os.path.join(AUDIO_DIR, "night_lights_regional.wav")
    export_wav(audio_c, out_c)

    # -------------------------------------------------------------
    # Export unified Tone.js-ready AudioScore JSON
    # -------------------------------------------------------------
    score_manifest = {
        "datasetId": "nasa-svs-5313",
        "totalDurationSeconds": round(t_cursor, 2),
        "tempoBpm": 80,
        "scaleName": "C Major Pentatonic",
        "notesVocabulary": NOTE_NAMES,
        "eventsCount": len(all_score_events),
        "events": all_score_events
    }

    os.makedirs(os.path.dirname(SCORE_OUT_PATH), exist_ok=True)
    with open(SCORE_OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(score_manifest, f, indent=2)

    print(f"\nUnified Tone.js audio score exported with {len(all_score_events)} note events: {SCORE_OUT_PATH}")

    return {
        "modeA": out_a,
        "modeB": out_b,
        "modeC": out_c,
        "score": SCORE_OUT_PATH
    }

if __name__ == "__main__":
    generate_all_sonification_modes()
