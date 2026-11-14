"""
generate_audio.py
Synthesizes demonstration audio for all 3 Sonification Modes:
- Mode A: Annual Evolution (2012–2023) -> audio/generated/night_lights_ambient.wav
- Mode B: Global Change (Purple / Orange) -> audio/generated/night_lights_change.wav
- Mode C: Regional Insets -> audio/generated/night_lights_regional.wav
Also exports the Tone.js-ready AudioScore JSON in:
- soniearth-nightlights/data/intermediate/audio_events.json
- soniearth-web/public/datasets/night-lights/audio_events.json
"""
import os
import json
import shutil
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)

if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from sonification.musical_mapping import generate_events_for_frame
from sonification.scheduler import render_score_to_audio, export_wav
from sonification.scale_quantizer import NOTE_NAMES

FEATURES_PATH = os.path.join(PROJECT_DIR, "data", "features", "night_lights_features.json")
AUDIO_DIR = os.path.join(PROJECT_DIR, "audio", "generated")
SCORE_OUT_PATH = os.path.join(PROJECT_DIR, "data", "intermediate", "audio_events.json")

WEB_PUBLIC_DIR = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "night-lights")
WEB_SCORE_OUT = os.path.join(WEB_PUBLIC_DIR, "audio_events.json")
WEB_AUDIO_DIR = os.path.join(WEB_PUBLIC_DIR, "audio")

def safe_copy(src, dst):
    try:
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(src, "rb") as fsrc, open(dst, "wb") as fdst:
            fdst.write(fsrc.read())
    except Exception as e:
        print(f"Note on copying {src} -> {dst}: {e}")

def generate_all_sonification_modes():
    os.makedirs(AUDIO_DIR, exist_ok=True)
    os.makedirs(WEB_AUDIO_DIR, exist_ok=True)

    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(f"Missing {FEATURES_PATH}")

    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    all_frames = data.get("frames", [])

    annual_frames = [f for f in all_frames if f["phase"] == "annual_series"]
    change_frames = [f for f in all_frames if f["phase"] in ["change_transition", "global_change", "fade_transition"]]
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
        for ev in frame_events:
            ev["frameIndex"] = f["frameIndex"]
            ev["year"] = f.get("year")
            ev["mode"] = "annual"
        events_a.extend(frame_events)
        all_score_events.extend(frame_events)
        t_cursor += step_duration

    audio_a = render_score_to_audio(events_a, total_duration_sec=t_cursor + 1.0)
    out_a = os.path.join(AUDIO_DIR, "night_lights_ambient.wav")
    export_wav(audio_a, out_a)
    safe_copy(out_a, os.path.join(WEB_AUDIO_DIR, "night_lights_ambient.wav"))

    # -------------------------------------------------------------
    # MODE B: Global Change Map (Purple Increase & Orange Decrease)
    # -------------------------------------------------------------
    print("\n--- Generating Mode B: Global Change Map ---")
    events_b = []
    t_cursor = 0.0
    step_duration = 0.9

    for f in change_frames:
        frame_events = generate_events_for_frame(f, event_time_sec=t_cursor, event_duration_sec=0.8)
        for ev in frame_events:
            ev["frameIndex"] = f["frameIndex"]
            ev["year"] = f.get("year")
            ev["mode"] = "change"
        events_b.extend(frame_events)
        all_score_events.extend(frame_events)
        t_cursor += step_duration

    audio_b = render_score_to_audio(events_b, total_duration_sec=t_cursor + 1.0)
    out_b = os.path.join(AUDIO_DIR, "night_lights_change.wav")
    export_wav(audio_b, out_b)
    safe_copy(out_b, os.path.join(WEB_AUDIO_DIR, "night_lights_change.wav"))

    # -------------------------------------------------------------
    # MODE C: Regional Insets (India, Ukraine, Western Europe, Med)
    # -------------------------------------------------------------
    print("\n--- Generating Mode C: Regional Insets ---")
    events_c = []
    t_cursor = 0.0
    step_duration = 1.0

    for f in regional_frames:
        frame_events = generate_events_for_frame(f, event_time_sec=t_cursor, event_duration_sec=0.9)
        for ev in frame_events:
            ev["frameIndex"] = f["frameIndex"]
            ev["year"] = f.get("year")
            ev["regionFocus"] = f.get("regionFocus")
            ev["mode"] = "regional"
        events_c.extend(frame_events)
        all_score_events.extend(frame_events)
        t_cursor += step_duration

    audio_c = render_score_to_audio(events_c, total_duration_sec=t_cursor + 1.0)
    out_c = os.path.join(AUDIO_DIR, "night_lights_regional.wav")
    export_wav(audio_c, out_c)
    safe_copy(out_c, os.path.join(WEB_AUDIO_DIR, "night_lights_regional.wav"))

    # -------------------------------------------------------------
    # Export unified Tone.js-ready AudioScore JSON
    # -------------------------------------------------------------
    score_manifest = {
        "datasetId": "nasa-svs-5313",
        "version": "1.1.0",
        "totalDurationSeconds": round(t_cursor, 2),
        "tempoBpm": 80,
        "scaleName": "C Major Pentatonic & Mode-Specific",
        "notesVocabulary": NOTE_NAMES,
        "eventsCount": len(all_score_events),
        "events": all_score_events
    }

    os.makedirs(os.path.dirname(SCORE_OUT_PATH), exist_ok=True)
    with open(SCORE_OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(score_manifest, f, indent=2)
    print(f"Exported unified audio score JSON: {SCORE_OUT_PATH} ({len(all_score_events)} events)")

    # Sync score to web public directory
    safe_copy(SCORE_OUT_PATH, WEB_SCORE_OUT)
    print(f"Synced unified score to web app: {WEB_SCORE_OUT}")

    return score_manifest

if __name__ == "__main__":
    generate_all_sonification_modes()
