# SoniEarth — Sea Surface Currents (NASA SVS #3912): Complete A-to-Z Execution Blueprint

> **For:** Teammate / Developer onboarding in Antigravity  
> **Project:** SoniEarth — *The Earth Information Jukebox* (NASA International Space Apps Challenge 2026)  
> **Target Dataset:** **NASA SVS #3912** — *Perpetual Ocean (ECCO2 Model: Sea Surface Currents & Temperatures)*  
> **Status:** Phase 2 Implementation Guide (Ready for Execution)

---

## 1. Project Context & Sonification Philosophy

In Phase 1, SoniEarth implemented **Decadal Night Lights (SVS #5313/#5475)** and **ISS Lightning Events (SVS #5011)**. In those datasets, audio was driven by *optical photons (brightness/radiance)* and *transient electrostatic pulses*.

In **Sea Surface Currents**, we transition from optical light to **Thermodynamics & Hydrodynamics**:
The ocean is a massive thermodynamic fluid heat engine. Paani mein roshni nahi, balki **Temperature (SST)** aur **Flow Velocity (Bahaav & Streamlines)** hote hain.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 OCEAN CURRENTS SONIFICATION MAPPING MATRIX                  │
├─────────────────────────┬──────────────────────┬────────────────────────────┤
│ PHYSICAL PROPERTY       │ VISUAL MANIFESTATION │ ACOUSTIC / MUSICAL MAPPING │
├─────────────────────────┼──────────────────────┼────────────────────────────┤
│ Sea Surface Temp (SST)  │ Color: Blue/Cyan     │ Deep Cello Bass (D2 - G2)  │
│ Cold Polar (0°C - 10°C) │ Deep dark waters     │ 24dB LPF Cutoff @ 250 Hz   │
├─────────────────────────┼──────────────────────┼────────────────────────────┤
│ Sea Surface Temp (SST)  │ Color: Green/Yellow  │ Mid-Range Strings (A2 - D3)│
│ Temperate (10°C - 22°C) │ Steady ocean gyres   │ Warm Open 5th Harmonies    │
├─────────────────────────┼──────────────────────┼────────────────────────────┤
│ Sea Surface Temp (SST)  │ Color: Red/Orange    │ High Harmonic Swell (E3-E4)│
│ Equatorial (22°C - 32°C)│ Gulf Stream / Kuroshio│ Reverb + Chorus Texture    │
├─────────────────────────┼──────────────────────┼────────────────────────────┤
│ Current Velocity        │ White Streamlines    │ Dynamic Rhythm: 55-130 BPM │
│ Flow Speed (0 - 2 m/s)  │ Turbulent Eddies     │ 16th-Note Fluid Arpeggio   │
├─────────────────────────┼──────────────────────┼────────────────────────────┤
│ Flow Direction Vector   │ Streamline Heading   │ Spatial Stereo Panning:    │
│ West -> East / E -> W   │ Horizontal Drift     │ -0.85 (Left) to +0.85 (R)  │
└─────────────────────────┴──────────────────────┴────────────────────────────┘
```

---

## 2. NASA SVS #3912 Source Assets & Catalog References

NASA SVS #3912 (*"Perpetual Ocean"*) visualizes global ocean surface currents using the ECCO2 (Estimating the Circulation and Climate of the Ocean, Phase II) model.

* **Primary Catalog Page:** [https://svs.gsfc.nasa.gov/3912/](https://svs.gsfc.nasa.gov/3912/)
* **Media Group #349713:** Flat Equirectangular (Rectangular) Global Projection
* **Media Group #349714:** North Atlantic Ocean & Gulf Stream Focus
* **Media Group #349715:** Western Pacific Ocean & Kuroshio Current Focus
* **Media Group #349716:** Indian Ocean & Agulhas Current Focus
* **Media Group #349717:** Southern Ocean & Antarctic Circumpolar Current Focus
* **Media Group #349718:** Rotating Hyperwall Global Sphere
* **Media Groups #349720 & #349721:** 720p / 1080p High-Definition MP4 Master Downloads

### Target Video File Specifications:
* **Storage Location:** `soniearth-web/public/datasets/ocean-currents/chunk_ocean_currents.webm` (or `.mp4`)
* **Resolution:** 1280x720 (720p) or 1920x1080 (1080p)
* **Projection:** Equirectangular Flat Map Projection (matches SatelliteStage canvas perfectly)
* **Duration:** Typically 60.0 to 120.0 seconds looping video

---

## 3. Directory Layout to Create

Ensure the following folder structure exists in `soniearth-web/public/datasets/ocean-currents/`:

```
soniearth-web/
  └── public/
      └── datasets/
          └── ocean-currents/
              ├── chunk_ocean_currents.webm    <-- NASA SVS #3912 video loop
              ├── features.json                <-- Output of Python extraction script
              └── frames/                      <-- Extracted sequential stills (20 frames)
                  ├── frame_0001.jpg
                  ├── frame_0002.jpg
                  └── ... frame_0020.jpg
```

---

## 4. Step-by-Step Implementation Roadmap

### Phase 1: Create Directories & Download/Extract Assets

1. In PowerShell or Terminal, create the directories:
   ```powershell
   mkdir -p "soniearth-web/public/datasets/ocean-currents/frames"
   ```

2. Download the 720p equirectangular MP4 from NASA SVS #3912 (`https://svs.gsfc.nasa.gov/3912/#media_group_349713`), or place the video file at:
   `soniearth-web/public/datasets/ocean-currents/chunk_ocean_currents.webm`

3. Extract 20 sequential stills for instant scrubbing and visual inspection using Python with OpenCV:
   Save this script as `soniearth-nightlights/preprocessing/extract_ocean_frames.py`:
   ```python
   import cv2
   import os

   video_path = "soniearth-web/public/datasets/ocean-currents/chunk_ocean_currents.webm"
   output_dir = "soniearth-web/public/datasets/ocean-currents/frames"
   os.makedirs(output_dir, exist_ok=True)

   cap = cv2.VideoCapture(video_path)
   total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
   fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
   duration = total_frames / fps
   print(f"Total Frames: {total_frames}, FPS: {fps}, Duration: {duration:.2f}s")

   # Extract 20 evenly-spaced frames
   step = max(1, total_frames // 20)
   saved = 0
   for i in range(0, total_frames, step):
       cap.set(cv2.CAP_PROP_POS_FRAMES, i)
       ret, frame = cap.read()
       if ret and saved < 20:
           saved += 1
           out_file = os.path.join(output_dir, f"frame_{saved:04d}.jpg")
           cv2.imwrite(out_file, frame)
           print(f"Saved {out_file} at t={(i/fps):.2f}s")

   cap.release()
   print("Frame extraction complete.")
   ```

---

### Phase 2: Python Thermal & Flow Feature Extraction

Create `soniearth-nightlights/preprocessing/extract_ocean_features.py`. This script extracts:
1. **Thermal Index ($0.0 \to 1.0$):** Ratios of cold polar blue/cyan vs. temperate green vs. warm equatorial red.
2. **Current Flow Velocity (knots / m/s):** Motion energy of white streamlines.
3. **Flow Direction Vector:** West-to-East ($+X$) vs. East-to-West ($-X$) stereo pan.
4. **Active Note, Frequency, and BPM:** Generated strictly according to the acoustic matrix.

```python
import cv2
import json
import numpy as np
import os
from datetime import datetime

video_path = "soniearth-web/public/datasets/ocean-currents/chunk_ocean_currents.webm"
output_json = "soniearth-web/public/datasets/ocean-currents/features.json"

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
duration = total_frames / fps

# Note mapping based on Temperature (°C)
def get_ocean_harmony(sst_celsius):
    if sst_celsius < 10.0:
        # Polar cold water (D2 - G2)
        notes = [("D2", 73.42), ("F2", 87.31), ("G2", 98.0)]
        idx = int((sst_celsius / 10.0) * len(notes))
        return notes[min(idx, len(notes)-1)]
    elif sst_celsius < 22.0:
        # Temperate waters (A2 - D3)
        notes = [("A2", 110.0), ("C3", 130.81), ("D3", 146.83)]
        idx = int(((sst_celsius - 10.0) / 12.0) * len(notes))
        return notes[min(idx, len(notes)-1)]
    else:
        # Warm equatorial currents (E3 - E4)
        notes = [("E3", 164.81), ("G3", 196.0), ("A3", 220.0), ("C4", 261.63), ("E4", 329.63)]
        idx = int(((sst_celsius - 22.0) / 10.0) * len(notes))
        return notes[min(idx, len(notes)-1)]

# Process video at 10 samples per second
sample_interval = max(1, int(fps / 10))
frames_data = []

prev_gray = None
frame_idx = 0

for f_num in range(0, total_frames, sample_interval):
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_num)
    ret, frame = cap.read()
    if not ret:
        break

    t_sec = round(f_num / fps, 2)
    h, w, _ = frame.shape
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # 1. Thermal Color Analysis (HSV and RGB balance)
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    # Blue/Cyan mask (Polar cold waters): H in [90, 130]
    blue_mask = (hsv[:,:,0] >= 90) & (hsv[:,:,0] <= 130) & (hsv[:,:,1] > 40)
    # Red/Orange mask (Equatorial warm waters): H in [0, 20] or [160, 180]
    red_mask = ((hsv[:,:,0] <= 20) | (hsv[:,:,0] >= 160)) & (hsv[:,:,1] > 50)
    # Green mask (Temperate waters): H in [35, 85]
    green_mask = (hsv[:,:,0] >= 35) & (hsv[:,:,0] <= 85) & (hsv[:,:,1] > 40)

    blue_ratio = float(np.sum(blue_mask)) / (h * w)
    red_ratio = float(np.sum(red_mask)) / (h * w)
    green_ratio = float(np.sum(green_mask)) / (h * w)

    # Thermal Index: 0.0 (Cold Polar) to 1.0 (Hot Equatorial)
    thermal_index = float(np.clip(0.5 + (red_ratio * 1.5) - (blue_ratio * 1.2), 0.05, 0.95))
    sst_celsius = round(0.0 + thermal_index * 32.0, 1)

    # 2. Flow Velocity via Motion/Optical Flow
    if prev_gray is not None:
        flow = cv2.calcOpticalFlowFarneback(prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag, ang = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        mean_speed = float(np.mean(mag))
        # Directional horizontal flow: mean delta X
        flow_dx = float(np.mean(flow[..., 0]))
    else:
        mean_speed = 0.5
        flow_dx = 0.1

    prev_gray = gray

    # Velocity in Knots: 0.5 knots to 5.0 knots
    current_velocity_knots = round(float(np.clip(mean_speed * 1.8, 0.4, 5.2)), 2)

    # Dynamic Tempo BPM: 55 BPM (calm gyres) to 130 BPM (rushing boundary currents)
    tempo_bpm = int(np.clip(55 + (current_velocity_knots / 5.0) * 75, 55, 130))

    # Stereo Pan: West-to-East (+dx) pans Right; East-to-West (-dx) pans Left
    stereo_pan = round(float(np.clip(flow_dx * 0.75, -0.85, 0.85)), 2)

    # Note and frequency from SST
    active_note, active_freq = get_ocean_harmony(sst_celsius)

    # Spatial Ocean Basins
    spatial_grid = [
        {"regionId": "OCEAN_PACIFIC", "name": "Pacific Basin (Kuroshio / Gyres)", "pan": -0.65, "meanTemperature": round(sst_celsius - 1.2, 1)},
        {"regionId": "OCEAN_ATLANTIC", "name": "Atlantic Basin (Gulf Stream Jet)", "pan": 0.0, "meanTemperature": round(sst_celsius + 1.8, 1)},
        {"regionId": "OCEAN_INDIAN", "name": "Indian / Southern Ocean", "pan": 0.65, "meanTemperature": round(sst_celsius - 0.5, 1)},
    ]

    frames_data.append({
        "frameIndex": frame_idx,
        "timestampSeconds": t_sec,
        "thermalIndex": round(thermal_index, 3),
        "temperatureCelsius": sst_celsius,
        "currentVelocityKnots": current_velocity_knots,
        "tempoBpm": tempo_bpm,
        "strikePan": stereo_pan,
        "activeNote": active_note,
        "frequencyHz": active_freq,
        "flowDirection": "west_to_east" if stereo_pan >= 0 else "east_to_west",
        "spatialGrid": spatial_grid
    })
    frame_idx += 1

cap.release()

collection = {
    "datasetId": "nasa-svs-3912",
    "title": "NASA SVS #3912 Perpetual Ocean (ECCO2 Sea Surface Currents)",
    "catalogUrl": "https://svs.gsfc.nasa.gov/3912/",
    "generatedAt": datetime.utcnow().isoformat() + "Z",
    "version": "1.0.0",
    "samplingFps": 10.0,
    "totalFrames": len(frames_data),
    "durationSeconds": round(duration, 2),
    "scientificNotice": "Global sea surface temperature and current velocity derived from ECCO2 fluid model (NASA SVS #3912).",
    "frames": frames_data
}

with open(output_json, "w") as f:
    json.dump(collection, f, indent=2)

print(f"Generated {len(frames_data)} ocean current frames in {output_json}")
```

---

### Phase 3: Tone.js Ocean Synthesizer in `audioEngine.ts`

In `soniearth-web/src/lib/audioEngine.ts`:

1. **Add synth references:**
   ```ts
   private oceanCelloSynth: Tone.MonoSynth | null = null;
   private oceanStringSynth: Tone.PolySynth | null = null;
   private oceanRippleSynth: Tone.PolySynth | null = null;
   private oceanPanner: Tone.Panner | null = null;
   ```

2. **Initialize in `initialize()`:**
   ```ts
   this.oceanPanner = new Tone.Panner(0.0).connect(this.masterGain);

   this.oceanCelloSynth = new Tone.MonoSynth({
     oscillator: { type: "triangle" },
     filter: { Q: 2, type: "lowpass", rolloff: -24 },
     envelope: { attack: 0.8, decay: 0.5, sustain: 0.85, release: 1.8 },
     filterEnvelope: { attack: 0.5, decay: 0.5, sustain: 0.7, baseFrequency: 180, octaves: 2 }
   }).connect(this.oceanPanner);
   this.oceanCelloSynth.volume.value = -4;

   this.oceanStringSynth = new Tone.PolySynth(Tone.Synth, {
     oscillator: { type: "sawtooth" },
     envelope: { attack: 0.6, decay: 0.8, sustain: 0.8, release: 2.0 }
   }).connect(this.oceanPanner);
   this.oceanStringSynth.volume.value = -7;

   this.oceanRippleSynth = new Tone.PolySynth(Tone.Synth, {
     oscillator: { type: "sine" },
     envelope: { attack: 0.02, decay: 0.15, sustain: 0.1, release: 0.3 }
   }).connect(this.oceanPanner);
   this.oceanRippleSynth.volume.value = -9;
   ```

3. **Add trigger method:**
   ```ts
   public triggerOceanCurrent(note: string, sstCelsius: number, pan = 0.0, velocity = 0.8) {
     if (!this.isInitialized || this.isMuted) return;
     try {
       if (this.oceanPanner) {
         this.oceanPanner.pan.rampTo(Math.max(-1.0, Math.min(1.0, pan)), 0.04);
       }
       if (sstCelsius < 14.0) {
         this.oceanCelloSynth?.triggerAttackRelease(note, 1.6, undefined, velocity);
       } else {
         this.oceanStringSynth?.triggerAttackRelease(note, 1.4, undefined, velocity * 0.9);
       }
     } catch (e) {}
   }

   public triggerOceanRipple(note: string, pan = 0.0, velocity = 0.7) {
     if (!this.isInitialized || this.isMuted || !this.oceanRippleSynth) return;
     try {
       this.oceanRippleSynth.triggerAttackRelease(note, 0.2, undefined, velocity);
     } catch (e) {}
   }
   ```

4. **In `stopAll()`:**
   ```ts
   this.oceanCelloSynth?.triggerRelease();
   this.oceanStringSynth?.releaseAll();
   this.oceanRippleSynth?.releaseAll();
   ```

---

### Phase 4: Frontend UI/UX Integration

1. **`DatasetShelf.tsx`:** Change `ocean-currents` card:
   * `isAvailable: true`
   * `badge: "Phase 2 Live"`
   * `badgeColor: "bg-teal-950/80 text-teal-300 border-teal-700/60"`

2. **`page.tsx`:**
   * In `handleSelectDataset`: Support `id === "ocean-currents"` (switch dataset, reset time to 0, play audio).
   * In `clockLoop`: Add `activeDatasetRef.current === "ocean-currents"` to the Hardware Video PTS lock so audio evaluates at `videoRef.current.currentTime` with 0ms drift.
   * In `playModeSound`: Read `featureData.frames`, call `audioEngine.triggerOceanCurrent(note, sst, pan, 0.85)`, and if `bpm > 90`, trigger `audioEngine.triggerOceanRipple("E4", pan + 0.1, 0.65)`.

3. **`SatelliteStage.tsx`:**
   * Video source for ocean: `/datasets/ocean-currents/chunk_ocean_currents.webm`.
   * Add Oceanographic Telemetry Card at top-left:
     `SST: <temp>°C • Velocity: <knots> kts • Tempo: <bpm> BPM • Heading: West-to-East`
   * Add bottom Thermal Spectrum HUD:
     `Cyan (0°C Polar Cello) ─── Green (15°C Gyres) ─── Red (30°C Gulf Stream High Strings)`

4. **`ExplainPanel.tsx`:**
   * Add scientific explanation card for `isOcean`:
     *"Oceanic Thermodynamic Flow: Sea surface temperature of {SST}°C drives {note} ({freq} Hz) on {instrument}. Fluid streamline velocity of {knots} knots drives an energetic {bpm} BPM arpeggio with {pan} stereo drift."*

---

## 5. Verification Checklist (Run Before Submitting)

```powershell
# 1. Type check
cd soniearth-web
npx tsc --noEmit

# 2. Python validation tests
$env:PYTHONPATH="soniearth-nightlights"
python soniearth-nightlights/scripts/validate_all.py
```

---

## 6. Git Commit Template

```bash
git add soniearth-web/public/datasets/ocean-currents/ soniearth-web/src/ soniearth-nightlights/
git commit -m "feat(ocean-currents): implement NASA SVS #3912 thermal & velocity sonification

- Ingest NASA SVS #3912 Perpetual Ocean ECCO2 dataset & extract sequential frames
- Add extract_ocean_features.py for thermal index (0-32°C) and velocity tracking
- Implement Tone.js oceanCelloSynth, oceanStringSynth, and fluid ripple arpeggiator
- Add hardware video PTS lock (0ms drift) and oceanographic flight deck HUD
- Pass all unit tests and TypeScript validation"
```
