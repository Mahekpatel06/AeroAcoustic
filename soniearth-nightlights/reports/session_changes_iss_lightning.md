# SoniEarth — Session Change Report: NASA ISS Lightning Events (NASA SVS #5011)

**Project:** SoniEarth — *The Earth Information Jukebox*  
**Challenge:** NASA International Space Apps Challenge 2026  
**Session Scope:** Last 2 Chat Cycles (NASA Lightning Events Audio-Visual Synchronization & UI Polish)  
**Target Dataset:** **NASA SVS #5011** — *Lightning Events Detected from the International Space Station (ISS LIS Sensor)*  
**Commit Reference:** `8dee56a` (`fix(lightning): sync ISS LIS audio-visual telemetry`)  
**Date:** November 15, 2026  

---

## 1. Executive Summary

During the last two conversation turns, we completed an end-to-end scientific and audio-visual audit of the **NASA SVS #5011 Lightning Events** integration. Two major issues were identified and resolved:

1. **Watermark / Date Dial UI Collision:** The bottom-right telemetry watermark was sitting directly on top of the video's embedded circular "10 Day Roving Window" calendar dial (March, June, December seasonal calendar and roving date dial), obscuring the active date.
2. **Audio-Visual Parallelism & Monotone Saturation:** The audio evaluation loop previously had up to 350 ms of clock drift relative to the browser's video decoder, and 99.6% of strike events in `features.json` were clipped to a flat `1250.0 µJ` / monotone `E6` chime note.
3. **Map Reticle Cleanup:** An experimental artificial sensing reticle overlay on the video canvas was removed per user request to maintain an authentic, unobstructed view of NASA's optical satellite telemetry.

All 23 unit/integration tests and TypeScript type checks pass with zero errors.

---

## 2. Issues Diagnosed & Solutions Implemented

### Issue 1: Watermark Obscuring Video Date Indicator
* **Symptom:** In `SatelliteStage.tsx`, the dataset watermark badge (`⚡ NASA SVS #5011 ISS LIS Transient Lightning Telemetry`) was statically positioned at `absolute bottom-3 right-3`. In NASA's SVS #5011 video, the bottom-right corner hosts the circular "10 Day Roving Window" calendar indicator (March / June / Dec). The badge blocked the dates completely.
* **Resolution:** Repositioned the watermark dynamically to `top-4 right-4` when `isLightning` is active. The top-right corner represents empty outer space in the orbital video, leaving the bottom-right seasonal dial 100% visible and readable.

### Issue 2: Audio-Visual Clock Drift (Out-of-Phase Chimes)
* **Symptom:** In `page.tsx`, the playback loop (`clockLoop`) used a standalone `requestAnimationFrame` delta accumulator (`currentTimeRef.current + safeDelta * speed`), while the video element ran on its own hardware decoding clock. Video synchronization only kicked in when drift exceeded 350 ms. Because optical lightning strikes in SVS #5011 are brief transients (100–200 ms), the chimes would trigger noticeably before or after the flash appeared on screen.
* **Resolution:** Implemented a **Hardware Video Presentation Timestamp (PTS) Lock**. When `activeDataset === "iss-lightning"`, the master clock now reads `nextTime = videoRef.current.currentTime` directly at 60 FPS. Every frame feature lookup and audio trigger occurs at the exact millisecond the frame is rendered.

### Issue 3: Strike Energy & Pitch Saturation in `features.json`
* **Symptom:** Data inspection revealed:
  * Notes: `Counter({'E6': 832, 'C6': 3})`
  * Energy: `mean = 1249.0 µJ` (99.6% pegged at ceiling `1250.0 µJ`)
  Every flash sounded like the exact same high-pitched monotone ping (`E6` at 1318.5 Hz) regardless of strike size.
* **Resolution:** Recalibrated optical energy in `features.json` across the full physical range ($180\text{--}1500\,\mu\text{J}$) based on composite pixel intensity (`brightPixelCount * 0.4 + yellowPixelCount * 0.6`). Mapped energies to a 7-tone pentatonic chime scale:
  * $180\text{--}350\,\mu\text{J}$: **`C5`** (523.25 Hz) — Distant / intra-cloud flashes (31 strikes)
  * $350\text{--}550\,\mu\text{J}$: **`D5`** (587.33 Hz) — Moderate flashes (77 strikes)
  * $550\text{--}750\,\mu\text{J}$: **`E5`** (659.25 Hz) — Mid-range convective strikes (132 strikes)
  * $750\text{--}950\,\mu\text{J}$: **`G5`** (783.99 Hz) — Active thunderstorm cells (186 strikes)
  * $950\text{--}1150\,\mu\text{J}$: **`A5`** (880.00 Hz) — Heavy convective cores (226 strikes)
  * $1150\text{--}1350\,\mu\text{J}$: **`C6`** (1046.50 Hz) — Severe lightning discharges (162 strikes)
  * $>1350\,\mu\text{J}$: **`D6`** (1174.66 Hz) / **`E6`** (1318.51 Hz) — Superbolt discharges (21 strikes)
* **Velocity Scaling:** Audio engine attack velocity is now dynamically scaled ($0.65\text{--}1.0$) based on calibrated energy.

### Issue 4: Narrow Stereo Panning
* **Symptom:** Previous stereo panning was compressed to $[-0.32, +0.57]$ because screen coordinates were normalized against the full video canvas rather than the rotating Earth sphere.
* **Resolution:** Recalibrated panning using the globe's physical boundaries ($X \in [0.33, 0.79]$ with nadir center at $X=0.56$):
  $$\text{pan} = \text{clamp}\left(\frac{X - 0.56}{0.23} \times 0.85, -0.85, 0.85\right)$$
  * West Horizon (Americas/Pacific): Panned hard left (down to $-0.82$)
  * Nadir Track (Central transit): Centered ($0.0$)
  * East Horizon (Asia/Oceania): Panned hard right (up to $+0.84$)
  * Updated `spatialGrid` zones (`ISS_WEST`, `ISS_CENTER`, `ISS_EAST`) to light up `⚡ BURST` accurately in `ExplainPanel.tsx`.

### Issue 5: Removal of Artificial Reticle Sensing Dot
* **Symptom:** An artificial pulsing circle and white dot reticle was initially rendered on the video canvas over the strike centroid. The user noted it was distracting and inaccurate relative to the natural imagery.
* **Resolution:** Removed the sensing dot overlay entirely from `SatelliteStage.tsx`. The raw satellite video remains pristine. Strike telemetry is cleanly communicated via audio (FM chime with stereo pan) and the dynamic ISS telemetry card readout.

---

## 3. File-by-File Changes Summary

### 1. `soniearth-web/src/components/SatelliteStage.tsx`
* **Watermark Relocation:**
  ```tsx
  <div
    className={`absolute ${
      isLightning ? "top-4 right-4" : "bottom-3 right-3"
    } bg-slate-950/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[9px] font-mono text-slate-400 border border-slate-800 max-w-xs text-right leading-tight z-10 hidden sm:block`}
  >
  ```
* **Dynamic ISS Spacecraft Mission Telemetry Card:**
  Added live strike status readout on the flight deck HUD:
  * When `currentFeature?.isStrike`: Pulsing amber beacon with optical energy in $\mu\text{J}$, active note, and pan value.
  * When quiet: Displays `Sensor Status: SCANNING` and `Atmospheric Drone: 55 Hz (A1)`.
* **Reticle Removal:** Deleted the pulsing overlay on the canvas.

### 2. `soniearth-web/src/app/page.tsx`
* **Hardware Video PTS Lock in `clockLoop`:**
  ```ts
  if (
    activeDatasetRef.current === "iss-lightning" &&
    videoRef.current &&
    !videoRef.current.paused &&
    !videoRef.current.seeking &&
    videoRef.current.readyState >= 2
  ) {
    nextTime = videoRef.current.currentTime;
  } else {
    nextTime = currentTimeRef.current + safeDelta * playbackSpeedRef.current;
    // ...
  }
  ```
* **Dynamic Velocity Calculation in `playModeSound`:**
  ```ts
  const normEnergy = Math.min(1.0, Math.max(0.0, (strikeEnergy - 180) / 1320));
  const strikeVelocity = 0.65 + 0.35 * normEnergy;
  audioEngine.triggerLightningStrike(strikeNote, strikeVelocity, strikePan);
  ```
* **Frequency Map Extensions:** Added missing high-register notes:
  ```ts
  C6: 1046.5, D6: 1174.66, E6: 1318.51
  ```

### 3. `soniearth-web/public/datasets/iss-lightning/features.json`
* Recalibrated all 835 strike frames:
  * Continuous energy values ($180\text{--}1500\,\mu\text{J}$)
  * Harmonic notes across 7 pentatonic steps
  * True stereo panning ($-0.82 \leftrightarrow +0.84$)
  * Corrected zone assignment for `spatialGrid` (405 West, 389 Center, 41 East)

---

## 4. Verification & Validation Metrics

| Check | Tool / Script | Status | Result |
|---|---|---|---|
| TypeScript Compilation | `npx tsc --noEmit` | **PASS** | 0 errors |
| Audio Unit Tests | `soniearth-nightlights/tests/test_audio.py` | **PASS** | 4/4 passing |
| Feature Extraction Tests | `soniearth-nightlights/tests/test_extraction.py` | **PASS** | 4/4 passing |
| Musical Mapping Tests | `soniearth-nightlights/tests/test_mapping.py` | **PASS** | 7/7 passing |
| Normalization Tests | `soniearth-nightlights/tests/test_normalization.py` | **PASS** | 5/5 passing |
| Sync & Web Data Consistency | `soniearth-nightlights/tests/test_synchronization.py` | **PASS** | 3/3 passing |
| **Total Test Suite** | `python scripts/validate_all.py` | **PASS** | **23/23 passing** |

---

## 5. Git Commit Reference

```bash
commit 8dee56a93f90cc99304fb293839653c0532adf2f
Author: Mahekpatel06 <mahekpatel271@gmail.com>
Date:   Sun Nov 15 08:34:50 2026 +0530

    fix(lightning): sync ISS LIS audio-visual telemetry

 soniearth-web/public/datasets/iss-lightning/features.json | 8342 ++++++++--------
 soniearth-web/src/app/page.tsx                          |   45 +-
 soniearth-web/src/components/SatelliteStage.tsx         |   33 +-
 soniearth-web/tsconfig.tsbuildinfo                      |    2 +-
 4 files changed, 4236 insertions(+), 4186 deletions(-)
```
