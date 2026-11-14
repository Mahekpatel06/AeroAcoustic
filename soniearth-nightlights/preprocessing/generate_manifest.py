"""
generate_manifest.py
Compiles the master dataset manifest connecting metadata, asset paths, and feature files.
Outputs:
- soniearth-nightlights/data/manifests/dataset_manifest.json
- soniearth-web/public/datasets/night-lights/manifest.json
"""
import json
import os
import shutil

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)

CONFIG_PATH = os.path.join(PROJECT_DIR, "config", "dataset_config.json")
MANIFEST_PATH = os.path.join(PROJECT_DIR, "data", "manifests", "dataset_manifest.json")
WEB_MANIFEST_PATH = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "night-lights", "manifest.json")

def generate_master_manifest():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        cfg = json.load(f)

    manifest = {
        "id": cfg["dataset_id"],
        "title": cfg["title"],
        "description": cfg["description"],
        "source": {
            "organization": cfg["source"]["organization"],
            "facility": cfg["source"]["facility"],
            "studio": cfg["source"]["studio"],
            "catalogId": cfg["source"]["catalog_id"],
            "url": cfg["source"]["url"],
            "citation": cfg["source"]["citation"],
            "underlyingInstrument": cfg["source"]["underlying_instrument"],
            "underlyingProduct": cfg["source"]["underlying_product"]
        },
        "timeRange": {
            "startYear": cfg["temporal_coverage"]["start_year"],
            "endYear": cfg["temporal_coverage"]["end_year"],
            "durationYears": cfg["temporal_coverage"]["duration_years"]
        },
        "featuresPath": "data/features/night_lights_features.json",
        "audioEventsPath": "data/intermediate/audio_events.json",
        "mappingProfile": "profiles/night_lights.py",
        "audioOutputs": {
            "ambientAnnual": "audio/generated/night_lights_ambient.wav",
            "globalChange": "audio/generated/night_lights_change.wav",
            "regionalZooms": "audio/generated/night_lights_regional.wav"
        },
        "phases": {
            "annualSeries": cfg["phases"]["annual_series"],
            "changeTransition": cfg["phases"]["change_transition"],
            "globalChange": cfg["phases"]["global_change"],
            "regionalZooms": cfg["phases"]["regional_zooms"]
        },
        "scientificNotice": cfg["scientific_notice"]
    }

    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"Master dataset manifest generated at: {MANIFEST_PATH}")

    if os.path.exists(os.path.dirname(WEB_MANIFEST_PATH)):
        with open(WEB_MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
        print(f"Synced manifest to web app: {WEB_MANIFEST_PATH}")

    return manifest

if __name__ == "__main__":
    generate_master_manifest()
