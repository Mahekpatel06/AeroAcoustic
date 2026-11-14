"""
extract_features.py
Processes extracted frames and outputs structured scientific/visual features:
1. Global Luminance (Rec. 601) cropped to the terrestrial map area [15:230]
2. 3x3 Spatial Grid with calibrated stereo pan & notes (all 9 cells)
3. Calibrated Purple/Orange change classification & localized intensities
4. Temporal year-over-year deltas
Outputs to:
- soniearth-nightlights/data/features/night_lights_features.json
- soniearth-web/public/datasets/night-lights/features.json
"""
import os
import json
import cv2
import numpy as np
from datetime import datetime
import shutil

# Resolve base directories robustly
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)

import sys
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from analysis.spatial_analysis import analyze_spatial_grid
from analysis.change_detection import classify_change_map

MANIFEST_PATH = os.path.join(PROJECT_DIR, "data", "intermediate", "extracted_manifest.json")
OUTPUT_FEATURES = os.path.join(PROJECT_DIR, "data", "features", "night_lights_features.json")
WEB_PUBLIC_FEATURES = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "night-lights", "features.json")
FRAMES_DIR = os.path.join(PROJECT_DIR, "assets", "extracted_frames")
WEB_FRAMES_DIR = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "night-lights", "frames")

def process_features():
    # Frame metadata definitions across all 28 extracted key frames
    frame_definitions = [
        # 1. Mode A: Annual Evolution (2012-2023) - 12 frames
        (10, 0.333, "annual_series", 2012, "global"),
        (40, 1.333, "annual_series", 2013, "global"),
        (71, 2.367, "annual_series", 2014, "global"),
        (101, 3.367, "annual_series", 2015, "global"),
        (132, 4.400, "annual_series", 2016, "global"),
        (162, 5.400, "annual_series", 2017, "global"),
        (193, 6.433, "annual_series", 2018, "global"),
        (223, 7.433, "annual_series", 2019, "global"),
        (254, 8.467, "annual_series", 2020, "global"),
        (284, 9.467, "annual_series", 2021, "global"),
        (315, 10.500, "annual_series", 2022, "global"),
        (345, 11.500, "annual_series", 2023, "global"),
        # 2. Transition frames
        (380, 12.667, "change_transition", None, "global"),
        (420, 14.000, "change_transition", None, "global"),
        # 3. Mode B: Global Change Map (Purple Increase / Orange Decrease)
        (480, 16.000, "global_change", 2023, "global"),
        (530, 17.667, "global_change", 2023, "global"),
        (580, 19.333, "global_change", 2023, "global"),
        # 4. Fade transition into Regional insets
        (630, 21.000, "fade_transition", None, "global"),
        (680, 22.667, "fade_transition", None, "global"),
        # 5. Mode C: Regional Insets (World map displaying 4 simultaneous insets)
        (720, 24.000, "regional_zoom", 2023, "Overview (All Insets)"),
        (780, 26.000, "regional_zoom", 2023, "India"),
        (840, 28.000, "regional_zoom", 2023, "India"),
        (910, 30.333, "regional_zoom", 2023, "Ukraine"),
        (970, 32.333, "regional_zoom", 2023, "Ukraine"),
        (1040, 34.667, "regional_zoom", 2023, "Western Europe"),
        (1100, 36.667, "regional_zoom", 2023, "Western Europe"),
        (1180, 39.333, "regional_zoom", 2023, "Eastern Mediterranean"),
        (1250, 41.667, "regional_zoom", 2023, "Eastern Mediterranean")
    ]

    extracted_manifest = []
    extracted_features = []
    prev_luma = None

    print(f"Extracting calibrated features from {len(frame_definitions)} key frames...")

    for (f_idx, timestamp, phase, year, region_focus) in frame_definitions:
        filename = f"frame_{f_idx:04d}.png"
        f_path = os.path.join(FRAMES_DIR, filename)
        if not os.path.exists(f_path):
            f_path = os.path.join(WEB_FRAMES_DIR, filename)

        frame = cv2.imread(f_path)
        if frame is None:
            print(f"Warning: could not read {f_path}")
            continue

        h, w = frame.shape[:2]

        # Crop map vertically to terrestrial map region (excluding letterbox and timeline banner)
        if h >= 200:
            map_luma_crop = frame[15:230, :]
        else:
            map_luma_crop = frame

        b = map_luma_crop[:, :, 0] / 255.0
        g = map_luma_crop[:, :, 1] / 255.0
        r = map_luma_crop[:, :, 2] / 255.0
        luma = 0.299 * r + 0.587 * g + 0.114 * b

        mean_luma = float(np.mean(luma))
        median_luma = float(np.median(luma))
        std_luma = float(np.std(luma))
        bright_density = float(np.mean(luma > 0.08))

        # 2. 3x3 Spatial Grid (all 9 geographic cells)
        spatial_grid = analyze_spatial_grid(frame, rows=3, cols=3)

        # 3. Change Map Classification
        change_data = None
        if phase in ["change_transition", "global_change", "fade_transition", "regional_zoom"]:
            change_data = classify_change_map(frame)

        # 4. Temporal Delta
        delta_luma = 0.0
        if prev_luma is not None and phase == "annual_series":
            delta_luma = round(mean_luma - prev_luma, 5)
        prev_luma = mean_luma

        feat_entry = {
            "frameIndex": f_idx,
            "timestampSeconds": timestamp,
            "phase": phase,
            "year": year,
            "regionFocus": region_focus,
            "globalMeanBrightness": round(mean_luma, 5),
            "globalMedianBrightness": round(median_luma, 5),
            "globalStdDeviation": round(std_luma, 5),
            "brightPixelDensity": round(bright_density, 5),
            "temporalDelta": delta_luma,
            "spatialGrid": spatial_grid,
            "changeClassification": change_data,
            "dataOrigin": "visual-estimate",
            "confidenceScore": 0.95
        }
        extracted_features.append(feat_entry)

        extracted_manifest.append({
            "frameIndex": f_idx,
            "timestampSeconds": timestamp,
            "filename": filename,
            "filepath": f_path.replace("\\", "/"),
            "width": w,
            "height": h,
            "phase": phase,
            "year": year,
            "regionFocus": region_focus
        })

    out_collection = {
        "datasetId": "nasa-svs-5313",
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "version": "1.1.0",
        "samplingFps": 30.0,
        "totalFrames": len(extracted_features),
        "scientificNotice": "Features are visual estimates derived from NASA SVS #5313 cartographic visualization; not calibrated satellite radiance.",
        "frames": extracted_features
    }

    # Save features in soniearth-nightlights
    os.makedirs(os.path.dirname(OUTPUT_FEATURES), exist_ok=True)
    with open(OUTPUT_FEATURES, "w", encoding="utf-8") as f:
        json.dump(out_collection, f, indent=2)
    print(f"Saved features to {OUTPUT_FEATURES}")

    # Sync to web app public directory
    if os.path.exists(os.path.dirname(WEB_PUBLIC_FEATURES)):
        with open(WEB_PUBLIC_FEATURES, "w", encoding="utf-8") as f:
            json.dump(out_collection, f, indent=2)
        print(f"Synced features to web app: {WEB_PUBLIC_FEATURES}")

    # Update manifest
    manifest_doc = {
        "datasetId": "nasa-svs-5313",
        "totalExtracted": len(extracted_manifest),
        "sourceFps": 30.0,
        "frames": extracted_manifest
    }
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest_doc, f, indent=2)
    print(f"Saved manifest to {MANIFEST_PATH}")

    return out_collection

if __name__ == "__main__":
    process_features()
