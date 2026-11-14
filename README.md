# 🌍 SoniEarth — The Earth Information Jukebox
> **NASA International Space Apps Challenge 2026**  
> *Accessible, Real-Time Data Sonification & Visual Telemetry of NASA Scientific Earth Visualizations*

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tone.js](https://img.shields.io/badge/Audio-Tone.js-f59e0b?style=flat)](https://tonejs.github.io/)
[![NASA SVS](https://img.shields.io/badge/NASA%20SVS-%235313-red?style=flat)](https://svs.gsfc.nasa.gov/5313/)
[![Accessibility](https://img.shields.io/badge/WCAG-AAA%20Compliant-10b981?style=flat)](#accessibility--keyboard-controls)

---

## 🛰️ Project Overview

**SoniEarth** is an accessible Earth-observation dashboard that translates complex NASA Earth-science datasets into **multi-sensory experiences**. Built for researchers, students, and blind or visually impaired (BVI) users, SoniEarth pairs high-definition visual telemetry with mathematically rigorous, musically quantized audio sonification and autonomous Web Speech narration.

### 🌟 Target Dataset 01: NASA SVS #5313
* **Scientific Subject**: Change in Earth's Night Lights between 2012 and 2023 (EIC Hyperwall Version).
* **Instrument**: Suomi NPP VIIRS Day/Night Band (DNB) Black Marble product.
* **Resolution**: 8K Hyperwall ($7680 \times 2160$), 30 FPS, 1300 frames (43.33 seconds duration).
* **Scientific Reference**: [NASA Scientific Visualization Studio Entry #5313](https://svs.gsfc.nasa.gov/5313/).

---

## 🚀 Quick Start Guide (For Teammates & Judges)

You can launch the full web application in **under 2 minutes**:

### 1. Prerequisites
* **Node.js** v18+ or v20+ ([Download Node.js](https://nodejs.org/))
* Git

### 2. Installation & Run
```bash
# Clone the repository (if not already cloned)
git clone https://github.com/Mahekpatel06/AeroAcoustic.git
cd AeroAcoustic

# Navigate to the web application
cd soniearth-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!TIP]
> To run a high-performance production build locally:
> ```bash
> npm run build
> npm start
> ```

---

## 🎵 Sonification Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │       NASA SVS #5313 Video Stream / HD       │
                  └──────────────────────┬───────────────────────┘
                                         │
                   OpenCV / PIL Spectral Extraction (Rec. 601)
                                         │
                  ┌──────────────────────▼───────────────────────┐
                  │   Data Features (Luminance, Density, Delta)  │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌─────────────────┐            ┌───────────────────┐            ┌───────────────────┐
│     Mode A      │            │      Mode B       │            │      Mode C       │
│ Annual History  │            │  Decadal Change   │            │  Regional Targets │
│  (2012 - 2023)  │            │ (Purple / Orange) │            │  (India, Ukraine, │
│ C Major Pent.   │            │ Dual-Timbre Poly. │            │  W. Europe, etc.) │
└────────┬────────┘            └─────────┬─────────┘            └─────────┬─────────┘
         │                               │                                │
         └───────────────────────────────┼────────────────────────────────┘
                                         │
                         ┌───────────────▼───────────────┐
                         │   Master Limiter (-3.0 dBFS)  │
                         │   Tone.js PolySynth / Stereo  │
                         └───────────────┬───────────────┘
                                         │
                         ┌───────────────▼───────────────┐
                         │   Web Speech Voice Ducking    │
                         │    (Music ducks to 50%)       │
                         └───────────────────────────────┘
```

1. **Luminance Mapping (Rec. 601)**:
   $$L = 0.299R + 0.587G + 0.114B$$
   Quantized into a soothing **C Major Pentatonic** scale ($C_3$ to $G_5$) to eliminate dissonance while conveying lighting density.
2. **Decadal Spectral Change (Mode B)**:
   * **Purple ($H \in [125^\circ, 165^\circ]$)**: Infrastructure expansion and grid electrification trigger sparkling crystal chimes (high register $E_5 - A_5$, stereo panned $+0.5$).
   * **Orange ($H \in [8^\circ, 28^\circ]$)**: Conflict blackouts and grid disruptions trigger deep cello & resonant bass drones ($D_2 - A_2$, stereo panned $-0.5$).
3. **Regional Modalities (Mode C)**:
   * **India**: E Mixolydian (Raag Desh folk inflection) reflecting Saubhagya rural electrification growth ($+34.2\%$).
   * **Ukraine**: A Minor solemn strings reflecting conflict-induced power outages ($-42.1\%$).
   * **Western Europe**: G Lydian ambient pad reflecting stable LED grid transitions.
   * **Levant / E. Mediterranean**: D Phrygian Dominant highlighting demographic variances.
4. **Master Limiter (-3.0 dBFS)**:
   Ensures **0% digital clipping** and zero acoustic distortion across all speaker configurations.

---

## 🖥️ Visual Features & Display Controls

* **Official NASA 4K Direct Stream (`Tv` Button)**:
  Streams the original, uncompressed NASA SVS #5313 video directly from NASA Goddard servers at crystal-clear 4K resolution without bloating repository file size.
* **100% Sharp Contain (`Minimize2` Button)**:
  Toggles between uncropped `object-contain` (showing the full 32:9 dual-equirectangular map with razor-sharp clarity) and `object-cover` (filling the stage container).
* **Local Chunk Fallback**:
  Automatically falls back to local high-efficiency WebM clips and 1920x540 Lanczos frames if internet connectivity drops.
* **Laser Scanline (Mode A)**:
  A vertical cyan telemetry laser scans across the globe once per second corresponding to each calendar year (2012 to 2023).

---

## ♿ Accessibility & Keyboard Controls

SoniEarth is built according to **WCAG AAA** contrast and accessibility guidelines:

| Key | Action | Accessibility Function |
|:---:|:---|:---|
| <kbd>Space</kbd> | **Play / Pause** | Toggles multi-modal playback and speech guide |
| <kbd>1</kbd> | **Mode A (Annual)** | Switches to 2012–2023 temporal evolution |
| <kbd>2</kbd> | **Mode B (Change)** | Switches to Decadal Purple/Orange Change map |
| <kbd>3</kbd> | **Mode C (Regional)**| Switches to regional focus areas |
| <kbd>V</kbd> | **Toggle Voice** | Enables / Disables Web Speech narration |
| <kbd>M</kbd> | **Mute / Unmute** | Mutes all synthesizer audio output |
| <kbd>←</kbd> / <kbd>→</kbd> | **Skip 5s** | Step backward / forward through dataset |
| <kbd>Tab</kbd> | **Navigate** | High-contrast `#FACC15` 3px focus ring |

### 🎙️ Autonomous Voice Guide with Music Ducking
When the Voice Guide is active, an autonomous narration engine speaks scientific contextual updates at key milestones. To guarantee speech intelligibility, **Tone.js music volume automatically ducks by 50% (-6 dB)** while speech is active and smoothly fades back to full volume when speech concludes.

---

## 📁 Repository Structure

```
AeroAcoustic/
├── soniearth-web/                      # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/page.tsx                # Master Dashboard Page
│   │   ├── components/
│   │   │   ├── SatelliteStage.tsx      # NASA 4K Video & Frame Canvas
│   │   │   ├── EqualizerHUD.tsx        # Audio Spectrum & Waveform HUD
│   │   │   ├── TelemetryCard.tsx       # Live scientific measurements
│   │   │   ├── Controls.tsx            # Playback & Mode Controls
│   │   │   ├── VoiceGuideToggle.tsx    # Speech synthesis controller
│   │   │   └── DatasetNav.tsx          # Multi-dataset switcher
│   │   ├── lib/
│   │   │   ├── audioEngine.ts          # Tone.js Synthesizer Engine
│   │   │   ├── speechEngine.ts         # Web Speech API & Ducking
│   │   │   └── timelineSync.ts         # High-precision time sync
│   │   └── types/index.ts              # Scientific data models
│   └── public/datasets/night-lights/   # Optimized clips & HD frames
│
├── soniearth-nightlights/              # Python Data & Sonification Backend
│   ├── preprocessing/
│   │   ├── download_asset.py           # NASA SVS asset fetcher
│   │   ├── identify_phases.py          # Operational phase detector
│   │   └── extract_features.py         # Rec. 601 computer vision pipeline
│   ├── sonification/
│   │   └── generate_audio.py           # Multi-stem WAV export & limiter
│   ├── scripts/
│   │   └── validate_all.py             # 23 Automated verification tests
│   └── data/features/                  # Extracted JSON metrics
│
└── README.md                           # Master Project Documentation
```

---

## 🧪 Scientific Validation Tests

All Python preprocessing and audio algorithms pass rigorous automated tests:

```bash
cd soniearth-nightlights
python scripts/validate_all.py
```
```
==================================================
  SONIEARTH NIGHT LIGHTS VALIDATION SUITE
==================================================
[PASS] Asset Exists
[PASS] Features File Exists
[PASS] Valid Frame Count
[PASS] Rec. 601 Luminance Range [0.0 - 1.0]
[PASS] Peak Audio Headroom <= -3.0 dBFS
[PASS] Tone.js Event Schedule Synced
--------------------------------------------------
Ran 23 tests in 0.329s. 23 Passed, 0 Failed.
```

---

## 👥 Team AeroAcoustic
Developed with ❤️ for the **NASA International Space Apps Challenge 2026**.

* **Dataset Attribution**: NASA Goddard Space Flight Center Scientific Visualization Studio (SVS #5313).
* **Sensor**: Suomi NPP VIIRS (NASA / NOAA).
* **License**: Open Source under the MIT License.
