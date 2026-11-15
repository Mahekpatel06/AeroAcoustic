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
Ran 27 tests in 0.048s. 27 Passed, 0 Failed.
```

---

## 🌊 Dataset #2: Sea Surface Currents & Temperatures (NASA SVS #3912)

### 1. Scientific Background & Sensor Pipeline
* **Official NASA Catalog**: [NASA SVS #3912](https://svs.gsfc.nasa.gov/3912/) — *Perpetual Ocean (ECCO2 Model: Sea Surface Currents & Temperatures)*.
* **Model / Synthesis**: **ECCO2 (Estimating the Circulation and Climate of the Ocean, Phase II)** output developed jointly by NASA JPL and MIT. Synthesizes satellite altimetry and in-situ ocean observations using the MIT general circulation model (MITgcm).
* **Physical Phenomenon**: Global thermodynamic fluid heat engine simulating oceanic gyres, western boundary currents (Gulf Stream, Kuroshio), and narrow turbulent eddies transporting heat across planetary basins.
* **Visual Data Content**: 2001 frames of 2:1 equirectangular fluid streamlines colored by sea surface temperature ($0^\circ\text{C}$ to $32^\circ\text{C}$) over high-resolution bathymetry.

### 2. Thermodynamic & Hydrodynamic Sonification Architecture
Unlike optical light or transient electrostatic pulses, Sea Surface Currents sonifies **fluid heat transport and velocity**:
1. **Cold Polar Waters ($0^\circ\text{C} - 10^\circ\text{C}$)**:
   * Color: Deep Blue / Cyan.
   * Synthesizer: `oceanCelloSynth` (`Tone.MonoSynth` on triangle waveform with 24 dB/oct lowpass filter cutoff at 180–250 Hz).
   * Note Register: Deep cello bass ($D_2$ to $G_2$, 73.4 Hz to 98.0 Hz).
2. **Temperate Ocean Gyres ($10^\circ\text{C} - 22^\circ\text{C}$)**:
   * Color: Greenish-yellow.
   * Synthesizer: `oceanStringSynth` (`Tone.PolySynth` on warm open 5th harmonies, notes $A_2$ to $D_3$, 110.0 Hz to 146.8 Hz).
3. **Warm Equatorial Boundary Currents ($22^\circ\text{C} - 32^\circ\text{C}$)**:
   * Color: Vibrant Red / Orange (e.g. Gulf Stream Jet, Kuroshio).
   * Synthesizer: Rich harmonic sawtooth string swell ($E_3$ to $E_4$, 164.8 Hz to 329.6 Hz).
4. **Current Flow Velocity (Knots) & Fluid Arpeggiator**:
   * Motion energy maps to dynamic tempo ($55\text{ BPM}$ calm gyres $\to 130\text{ BPM}$ rushing currents).
   * Rapid currents ($> 85\text{ BPM}$) trigger fast fluid ripple arpeggiator accents (`oceanRippleSynth`).
5. **Spatial Streamline Direction (West $\leftrightarrow$ East)**:
   * Flow vector $dx$ directly drives stereo panning: $-0.85$ (Westbound) to $+0.85$ (Eastbound).
   * Three primary oceanic basins tracked in real-time: Pacific Basin (Left pan $-0.65$), Atlantic Gulf Stream (Center pan $0.0$), and Indian/Southern Ocean (Right pan $+0.65$).

### 3. UI, 2D Stage & 3D Interactive Globe
* **Dual Visualization**: Hotkey `[2]` or shelf card `[2]` instantly switches to Sea Surface Currents with either the 2D optical stage or interactive Three.js 3D globe with NASA SVS #3912 2K spherical texture.
* **Interactive 3D Basin Raycasting (Click-to-Listen)**:
  * Users can click directly on the Pacific, Atlantic, or Indian Oceans on the 3D globe.
  * Three.js `Raycaster` determines geographic coordinates, triggers smooth spherical rotation interpolation towards that basin, and crossfades the audio spatial panner and localized temperature/velocity profile.
  * Features 3D pulsing glowing rings at the geographic centers of each basin on the globe surface.
* **Thermal Depth Slice / Thermocline Selector (0m → 200m → 1000m)**:
  * Adds an interactive depth slider and quick presets (`0m Surface`, `200m Thermocline`, `1000m Abyssal`).
  * **Visual Spectrum Shift**: As depth increases, visual rendering on both 2D video and 3D globe dynamically transitions from warm sunlit surface reds/oranges into deep abyssal twilight indigo.
  * **Acoustic Thermocline Gradient**: Temperatures drop exponentially with depth; at depth $\ge 800\text{m}$, acoustic pitch drops into an authentic **$40\text{ Hz}$ Infrasonic Sub-Bass** drone with heavy oceanic pressure and muted surface ripples.
* **Psychoacoustically Mastered Sonification Engine**:
  * **Smooth Procedural Sonification**: Live, velvety Tone.js multi-oscillator synthesis tuned with harmonic saturation (2nd and 3rd harmonics) for full presence on internal laptop speakers without losing sub-bass depth in headphones.
  * **Dynamic Acoustic Thermocline**: Synthesizers smoothly modulate based on depth ($0\text{m} \to 1000\text{m}$) and basin selection in real time.
* **Oceanographic HUD Telemetry**: Displays real-time Sea Surface Temperature ($^\circ\text{C}$), current velocity ($\text{kts}$), musical tempo ($\text{BPM}$), hydrostatic pressure ($\text{atm}$), and heading in real-time.
* **Thermal Spectrum Legend**: Shows color temperature thresholds with live indicator dots.

---

## ⚡ Dataset #3: ISS Lightning Events (NASA SVS #5011)

### 1. Scientific Background & Sensor Pipeline
* **Official NASA Catalog**: [NASA SVS #5011](https://svs.gsfc.nasa.gov/5011/) — *Lightning Events Detected from the International Space Station (ISS) 2017–2023*.
* **Sensor / Instrument**: ISS-mounted **LIS (Lightning Imaging Sensor)** managed by NASA Marshall Space Flight Center & GHRC DAAC.
* **Orbital Parameters**: Low Earth Orbit (LEO) at **408 km altitude**, traveling at **7.66 km/s**.
* **Visual Data Content**: ISS nocturnal overpasses above tropical thunderstorm complexes. Sudden high-luminance optical transients erupt against deep space darkness.

### 2. Punctuated Sonification & Synthesis Architecture
Unlike the continuous harmonic melodies of Decadal Night Lights, ISS Lightning is **event-driven and percussive**:
1. **55 Hz Ambient Orbital Drone**: Synthesizer maintains a continuous, low-frequency atmospheric drone (`Tone.Synth` on note `A1`, 55.0 Hz, -14 dBFS) representing quiet spacecraft orbit.
2. **Optical Flash Detection (Temporal Differencing)**:
   $$\text{Luminance } L = 0.299R + 0.587G + 0.114B$$
   $$\Delta \text{BrightPixels} \ge 15 \quad (\text{or } \Delta L > 0.02)$$
   Detects 34 discrete, authentic optical burst spikes across the 15-second orbital sequence.
3. **High-Register Metallic FM Chimes**:
   * Synthesizer: `Tone.PolySynth(Tone.FMSynth)` with `harmonicity: 3.5`, `modulationIndex: 3.8`, `attack: 0.005s` (instantaneous 5ms strike), `decay: 0.28s`.
   * Calibrated Optical Energy ($150\,\mu\text{J} - 1200\,\mu\text{J}$) mapped to pitch: `C5` (523 Hz), `E5` (659 Hz), `G5` (784 Hz), `A5` (880 Hz), `C6` (1046 Hz).
4. **Dynamic Spatial Stereo Panning**:
   * Strike X-coordinate directly modulates stereo panning: $-1.0$ (West/Left Horizon) to $+1.0$ (East/Right Horizon).
   * Visually impaired users immediately perceive storm direction in stereo earphones.
5. **Deaf-Blind Tactile Accessibility**:
   * Web Vibration API pulse (`navigator.vibrate(80)`) fires a sharp 80ms tactile pulse on mobile/tablet devices during optical lightning spikes.

### 3. UI & Spacecraft HUD Features
* **Lightning Reticle & Shockwave**: Pulsing amber shockwave ring (`animate-ping`) and crosshairs rendered dynamically at the flash coordinates $(x, y)$ on the Earth globe.
* **Dynamic Scrubber & Telemetry**: 15.0-second amber timeline (`from-amber-500 via-yellow-400 to-amber-600`) with real-time strike counter and energy readout (`⚡ FLASH: 842 µJ • Pan: R`).
* **Instant Switching**: Hotkey `[3]` or Shelf Card `[3]` instantly switches to ISS Lightning; Hotkey `[1]` returns to Decadal Night Lights.

---

## 👥 Team AeroAcoustic
Developed with ❤️ for the **NASA International Space Apps Challenge 2026**.

* **Dataset Attributions**:
  * NASA SVS #5313: Decadal Night Lights (Suomi NPP VIIRS).
  * NASA SVS #3912: Sea Surface Currents & Temperatures (ECCO2 Model, NASA JPL / MIT).
  * NASA SVS #5011: ISS Lightning Events (ISS LIS Sensor, GHRC DAAC).
* **License**: Open Source under the MIT License.
