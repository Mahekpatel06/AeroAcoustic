"""
extract_frames.py
Extracts optimized sample frames from NASA SVS #5313 video across all 4 operational phases.
Resizes frames to 960x270 for lightweight storage, fast web serving, and computer vision analysis.
"""
import os
import cv2
import json

VIDEO_PATH = "soniearth-nightlights/assets/original/nightlights_svs5313.mp4"
FRAMES_DIR = "soniearth-nightlights/assets/extracted_frames"
MANIFEST_PATH = "soniearth-nightlights/data/intermediate/extracted_manifest.json"

def extract_optimized_frames():
    os.makedirs(FRAMES_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)

    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        raise IOError(f"Cannot open video: {VIDEO_PATH}")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    # Define target frame indices across all phases:
    # 1. Annual series (2012-2023): 12 frames (approx every 30 frames from frame 10 to 350)
    annual_indices = [int(10 + i * 30.5) for i in range(12)]
    # 2. Transition frames
    trans_indices = [380, 420]
    # 3. Global change map frames (purple/orange)
    change_indices = [480, 530, 580, 630, 680, 720]
    # 4. Regional zooms: India, Ukraine, Europe, Mediterranean
    zoom_indices = [780, 840, 910, 970, 1040, 1100, 1180, 1250]

    all_targets = sorted(list(set(annual_indices + trans_indices + change_indices + zoom_indices)))
    
    extracted = []
    print(f"Extracting {len(all_targets)} key frames from {total_frames} total video frames...")

    for idx in all_targets:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if not ret:
            print(f"Warning: could not read frame {idx}")
            continue

        # Resize from 7680x2160 to 960x270 (preserving 32:9 wide aspect ratio)
        resized = cv2.resize(frame, (960, 270), interpolation=cv2.INTER_AREA)
        filename = f"frame_{idx:04d}.png"
        filepath = os.path.join(FRAMES_DIR, filename)
        cv2.imwrite(filepath, resized)

        timestamp = round(idx / fps, 3)
        
        # Tag phase
        if idx <= 360:
            phase = "annual_series"
            year = 2012 + int(idx / 30.5)
            region_focus = "global"
        elif idx <= 450:
            phase = "change_transition"
            year = None
            region_focus = "global"
        elif idx <= 750:
            phase = "global_change"
            year = 2023
            region_focus = "global"
        else:
            phase = "regional_zoom"
            year = 2023
            if idx < 880:
                region_focus = "India"
            elif idx < 1010:
                region_focus = "Ukraine"
            elif idx < 1140:
                region_focus = "Western Europe"
            else:
                region_focus = "Eastern Mediterranean"

        extracted.append({
            "frameIndex": idx,
            "timestampSeconds": timestamp,
            "filename": filename,
            "filepath": filepath.replace("\\", "/"),
            "width": 960,
            "height": 270,
            "phase": phase,
            "year": year,
            "regionFocus": region_focus
        })

    cap.release()

    manifest = {
        "datasetId": "nasa-svs-5313",
        "totalExtracted": len(extracted),
        "sourceFps": fps,
        "frames": extracted
    }

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"Frame extraction complete! {len(extracted)} frames saved to {FRAMES_DIR}")
    print(f"Manifest written to: {MANIFEST_PATH}")
    return manifest

if __name__ == "__main__":
    extract_optimized_frames()
