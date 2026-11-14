# SoniEarth — Dataset 01: Decadal Night Lights (2012–2023)
### NASA Space Apps Challenge 2026 — "The Earth Information Jukebox"

[![Tests: Passing](https://img.shields.io/badge/Tests-16%20Passing-brightgreen.svg)]()
[![Dataset: NASA SVS 5313](https://img.shields.io/badge/NASA%20SVS-5313-blue.svg)]()
[![Audio: C Major Pentatonic](https://img.shields.io/badge/Scale-C%20Major%20Pentatonic-orange.svg)]()

This module provides the complete, reproducible data preprocessing, computer vision feature extraction, normalization, and musical sonification pipeline for NASA's **Decadal Night Lights (2012–2023)** dataset.

---

## 🚀 Quick Start

### 1. Requirements
Ensure Python 3.10+ is installed:
```bash
pip install -r requirements.txt
```

### 2. Run the Complete End-to-End Pipeline
```bash
python scripts/run_pipeline.py
```
This single command automatically:
1. Validates and downloads the official NASA SVS #5313 H.265 distribution video (32.7 MB).
2. Segments the video into the 4 operational phases (`video_phases.json`).
3. Extracts optimized representative frames across all phases.
4. Performs Rec. 601 Luminance, 3x3 Spatial Grid analysis, and calibrated Purple/Orange HSV change classification (`night_lights_features.json`).
5. Generates the master dataset manifest (`dataset_manifest.json`).
6. Synthesizes 3 demonstration WAV audio tracks in `audio/generated/` with the Master Limiter active at -3.0 dBFS.

### 3. Run Automated Tests
```bash
python scripts/validate_all.py
```
Executes all 16 unit and integration tests covering extraction, normalization, mapping, audio synthesis, and synchronization.

---

## 📂 Project Directory Structure

```text
soniearth-nightlights/
├── config/                  # Configuration files (dataset, preprocessing, sonification)
├── assets/
│   ├── original/            # Official NASA SVS #5313 H.265 MP4 video (32.7 MB)
│   └── extracted_frames/    # 28 downscaled (960x270) key frames
├── data/
│   ├── intermediate/        # video_phases.json, audio_events.json
│   ├── features/            # night_lights_features.json (Vision feature stream)
│   └── manifests/           # dataset_manifest.json (Master manifest)
├── preprocessing/           # Video inspection, download, phase identification, frame extraction
├── analysis/                # Spatial 3x3 grid, HSV color classification, temporal deltas
├── sonification/            # Pentatonic quantizer, ADSR synthesis, scheduler, audio generator
├── profiles/                # night_lights.py dataset sonification profile
├── audio/generated/         # Generated demonstration WAV files (Modes A, B, and C)
├── schemas/                 # JSON Schemas for validation
├── typescript/              # TypeScript interfaces (Dataset.ts, NightLightsFeatures.ts, AudioEvents.ts)
├── tests/                   # 16 unit & integration tests
├── reports/                 # 6 comprehensive engineering reports
└── scripts/                 # run_pipeline.py, run_sonification.py, validate_all.py
```

---

## 🎵 3 Sonification Modes Generated

1. **Mode A: Annual Evolution (2012–2023)**: `audio/generated/night_lights_ambient.wav` (12.60s)
   - Baseline ambient drone evolving as global illumination grows from 2012 to 2023.
2. **Mode B: Decadal Change Map**: `audio/generated/night_lights_change.wav` (10.20s)
   - Crystalline bell chime triads for Purple increase regions; mellow cello descending tones for Orange decrease regions.
3. **Mode C: Regional Zoom Exploration**: `audio/generated/night_lights_regional.wav` (11.00s)
   - Stereo panning and localized voicings covering India, Ukraine, Western Europe, and the Mediterranean.

---

## 📄 Provenance & Attribution
* **NASA SVS #5313:** [NASA Scientific Visualization Studio Entry](https://svs.gsfc.nasa.gov/5313/)
* **Satellite / Sensor:** Suomi NPP / VIIRS (Visible Infrared Imaging Radiometer Suite)
* **Science Product:** NASA Black Marble (VNP46A2 / VNP46A4)
* **Scientific Notice:** Rendered video pixel features are cartographic visual estimates, not raw radiometric radiance.
