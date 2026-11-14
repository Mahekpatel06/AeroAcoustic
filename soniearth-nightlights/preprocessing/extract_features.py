"""
extract_features.py
Processes extracted frames and outputs structured scientific/visual features:
1. Global Luminance (Rec. 601)
2. 3x3 Spatial Grid with stereo pan & notes
3. Calibrated Purple/Orange change classification
4. Temporal year-over-year deltas
Outputs to: soniearth-nightlights/data/features/night_lights_features.json
"""
import os
import json
import cv2
import numpy as np
from datetime import datetime
from analysis.spatial_analysis import analyze_spatial_grid
from analysis.change_detection import classify_change_map

MANIFEST_PATH = "soniearth-nightlights/data/intermediate/extracted_manifest.json"
OUTPUT_FEATURES = "soniearth-nightlights/data/features/night_lights_features.json"

def process_features():
    if not os.path.exists(MANIFEST_PATH):
        raise FileNotFoundError(f"Missing {MANIFEST_PATH}")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    frames_meta = manifest.get("frames", [])
    extracted_features = []

    prev_luma = None

    print(f"Extracting features from {len(frames_meta)} frames...")

    for f_info in frames_meta:
        f_path = f_info["filepath"]
        frame = cv2.imread(f_path)
        if frame is None:
            print(f"Warning: could not read {f_path}")
            continue

        h, w = frame.shape[:2]
        
        # 1. Global Rec. 601 Luminance
        # L = 0.299R + 0.587G + 0.114B
        b = frame[:, :, 0] / 255.0
        g = frame[:, :, 1] / 255.0
        r = frame[:, :, 2] / 255.0
        luma = 0.299 * r + 0.587 * g + 0.114 * b

        mean_luma = float(np.mean(luma))
        median_luma = float(np.median(luma))
        std_luma = float(np.std(luma))
        bright_density = float(np.mean(luma > 0.08))

        # 2. 3x3 Spatial Grid
        spatial_grid = analyze_spatial_grid(frame, rows=3, cols=3)

        # 3. Change Map Classification (only for change map and regional zoom phases)
        change_data = None
        if f_info["phase"] in ["change_transition", "global_change", "regional_zoom"]:
            change_data = classify_change_map(frame)

        # 4. Temporal Delta
        delta_luma = 0.0
        if prev_luma is not None:
            delta_luma = round(mean_luma - prev_luma, 4)
        prev_luma = mean_luma

        feat_entry = {
            "frameIndex": f_info["frameIndex"],
            "timestampSeconds": f_info["timestampSeconds"],
            "phase": f_info["phase"],
            "year": f_info.get("year"),
            "regionFocus": f_info.get("regionFocus", "global"),
            "globalMeanBrightness": round(mean_luma, 4),
            "globalMedianBrightness": round(median_luma, 4),
            "globalStdDeviation": round(std_luma, 4),
            "brightPixelDensity": round(bright_density, 4),
            "temporalDelta": delta_luma,
            "spatialGrid": spatial_grid,
            "changeClassification": change_data,
            "dataOrigin": "visual-estimate",
            "confidenceScore": 0.95
        }
        extracted_features.append(feat_entry)

    out_collection = {
        "datasetId": "nasa-svs-5313",
        "generatedAt": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "samplingFps": manifest.get("sourceFps", 30.0),
        "totalFrames": len(extracted_features),
        "scientificNotice": "Features are visual estimates derived from NASA SVS #5313 cartographic visualization; not calibrated satellite radiance.",
        "frames": extracted_features
    }

    os.makedirs(os.path.dirname(OUTPUT_FEATURES), exist_ok=True)
    with open(OUTPUT_FEATURES, "w", encoding="utf-8") as f:
        json.dump(out_collection, f, indent=2)

    print(f"Successfully processed features for {len(extracted_features)} frames.")
    print(f"Features saved to: {OUTPUT_FEATURES}")
    return out_collection

if __name__ == "__main__":
    process_features()
