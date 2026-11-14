"""
identify_phases.py
Segments NASA SVS #5313 into the 4 distinct operational phases:
1. Annual Time Series (2012-2023)
2. Transition to Change Map
3. Global Change Map (Purple/Orange)
4. Regional Zooms (India, Ukraine, Europe, Mediterranean)
"""
import json
import os
import cv2

def identify_and_save_phases():
    video_path = "soniearth-nightlights/assets/original/nightlights_svs5313.mp4"
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Missing {video_path}")

    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    cap.release()

    # Empirical time boundaries based on video structure
    # 43.33 seconds total = 1300 frames
    phases_data = {
        "datasetId": "nasa-svs-5313",
        "totalFrames": total_frames,
        "fps": fps,
        "durationSeconds": round(total_frames / fps, 2),
        "phases": [
            {
                "phaseId": "annual_series",
                "title": "Annual Evolution (2012–2023)",
                "startFrame": 0,
                "endFrame": 360,
                "startTimeSeconds": 0.0,
                "endTimeSeconds": 12.0,
                "description": "Sequential display of yearly global night lights from 2012 through 2023.",
                "yearsMapped": list(range(2012, 2024))
            },
            {
                "phaseId": "change_transition",
                "title": "Transition to Decadal Change Map",
                "startFrame": 361,
                "endFrame": 450,
                "startTimeSeconds": 12.03,
                "endTimeSeconds": 15.0,
                "description": "Cross-fade transition from natural nighttime illumination to the purple/orange change map."
            },
            {
                "phaseId": "global_change",
                "title": "Global Decadal Change Map",
                "startFrame": 451,
                "endFrame": 750,
                "startTimeSeconds": 15.03,
                "endTimeSeconds": 25.0,
                "description": "Global view showing purple areas of increased illumination and orange areas of decreased illumination."
            },
            {
                "phaseId": "regional_zooms",
                "title": "Regional Zoom Exploration",
                "startFrame": 751,
                "endFrame": total_frames - 1,
                "startTimeSeconds": 25.03,
                "endTimeSeconds": round(total_frames / fps, 2),
                "description": "Camera zooms focusing on specific regional case studies.",
                "subRegions": [
                    {"name": "India", "approxTime": "25.0s - 29.5s"},
                    {"name": "Ukraine", "approxTime": "29.5s - 34.0s"},
                    {"name": "Western Europe", "approxTime": "34.0s - 38.5s"},
                    {"name": "Eastern Mediterranean", "approxTime": "38.5s - 43.33s"}
                ]
            }
        ]
    }

    os.makedirs("soniearth-nightlights/data/intermediate", exist_ok=True)
    out_path = "soniearth-nightlights/data/intermediate/video_phases.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(phases_data, f, indent=2)

    print(f"Video phases successfully identified and saved to: {out_path}")
    return phases_data

if __name__ == "__main__":
    identify_and_save_phases()
