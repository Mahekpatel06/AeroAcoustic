# 🌍 SoniSphere — The Earth Information Jukebox
> **NASA International Space Apps Challenge**  
> *Accessible, Real-Time Multi-Sensory Sonification & Visual Telemetry of NASA Scientific Earth Visualizations*

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0.3-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Three.js-WebGL-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/Tone.js-Web%20Audio-f59e0b?style=for-the-badge" alt="Tone.js" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/NASA%20SVS-Official%20Data-0B3D91?style=for-the-badge&logo=nasa&logoColor=white" alt="NASA SVS" />
  <img src="https://img.shields.io/badge/WCAG-AAA%20Compliant-10B981?style=for-the-badge" alt="WCAG AAA" />
  <img src="https://img.shields.io/badge/Tests-31%20Passing-brightgreen?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
</p>

---

## 📌 Table of Contents
1. [Executive Summary & Vision](#-executive-summary--vision)
2. [Key Innovations](#-key-innovations)
3. [The 4 Planetary Datasets (Tracks)](#-the-4-planetary-datasets-tracks)
   - [Track 01: Decadal Night Lights (NASA SVS #5313)](#-track-01-decadal-night-lights-20122023--nasa-svs-5313)
   - [Track 02: Sea Surface Currents & Temperatures (NASA SVS #3912)](#-track-02-sea-surface-currents--temperatures--nasa-svs-3912)
   - [Track 03: ISS Lightning Events (NASA SVS #5011)](#-track-03-iss-lightning-events-20172023--nasa-svs-5011)
   - [Track 04: DYAMOND Global Carbon Dioxide (NASA SVS #5436)](#-track-04-dyamond-global-carbon-dioxide--nasa-svs-5436)
4. [System Architecture](#-system-architecture)
5. [Audio Engineering & Sound Design](#-audio-engineering--sound-design)
6. [Interactive 3D WebGL Globe & 2D Optical Telemetry](#-interactive-3d-webgl-globe--2d-optical-telemetry)
7. [Accessibility & Universal Design (WCAG AAA)](#-accessibility--universal-design-wcag-aaa)
8. [Scientific Verification & Automated Test Suite (31 Tests)](#-scientific-verification--automated-test-suite-31-tests)
9. [Quick Start & Installation Guide](#-quick-start--installation-guide)
10. [Repository Directory Structure](#-repository-directory-structure)
11. [Scientific Citations & Provenance](#-scientific-citations--provenance)
12. [Team & License](#-team--license)

---

## 🛰️ Executive Summary & Vision

Earth scientific visualizations are among humanity's greatest achievements, yet traditional dashboards remain predominantly visual. Over **2.2 billion people worldwide live with vision impairments**, and even domain specialists frequently suffer from visual cognitive overload when analyzing complex, high-dimensional planetary datasets.

**SoniSphere (The Earth Information Jukebox)** bridges this divide by turning scientific Earth observation data into an **orchestrated multi-sensory experience**. Designed for researchers, educators, and blind or visually impaired (BVI) explorers, SoniSphere pairs:
- **Mathematically rigorous real-time audio sonification** via the Web Audio API and Tone.js.
- **Interactive 3D WebGL spherical rendering** with basin raycasting and thermal depth slicing.
- **Autonomous contextual Web Speech narration** with automated music ducking.
- **Tactile haptic pulses** for deaf-blind multi-sensory sensing.
- **Full WCAG AAA accessibility compliance** with a keyboard-driven tactile interface.

> *"Hear the Earth. Understand the Planet."*

---

## ✨ Key Innovations

* 🎧 **Studio-Grade Synthesizer Bank**: Powered by Tone.js with zero digital clipping. Employs a studio compressor, independent ducking and mute gain nodes, and a Master Limiter locked at **-0.2 dBFS** with full digital headroom.
* 🌐 **Interactive 3D Three.js Globe**: Features dynamic equirectangular texture mapping, atmospheric Rayleigh scattering glow, click-to-listen basin raycasting, and smooth spherical camera interpolation (Slerp).
* 🌊 **Thermodynamic Depth Slicing**: Explore the ocean from surface ($0\,\text{m}$) down to the abyssal plain ($1000\,\text{m}$), experiencing real-time acoustic thermocline shifts down to an authentic **$40\,\text{Hz}$ infrasonic sub-bass drone**.
* ⚡ **Tactile Haptic Sensing**: Integrates the Web Vibration API to pulse physical devices on high-transient orbital lightning discharges ($150\,\mu\text{J} - 1200\,\mu\text{J}$).
* 🎙️ **Autonomous AI Speech Guide with Auto-Ducking**: Voice narrator delivers real-time scientific telemetry at critical phase transitions, automatically ducking synthesizer music by **50% (-6 dB)** with smooth crossfades.
* 🔍 **Scientific Explainability HUD ("Why am I hearing this?")**: Dynamic telemetry engine translates mathematical values (PPM, Sea Surface Temperature, Radiance, Optical Flash Energy) into plain English contextual explanations in real time.
* 🧪 **End-to-End Scientific Reproducibility**: 31 automated unit and integration tests validate the computer vision extraction, Rec. 601 luminance scaling, and audio synthesis pipelines.

---

## 🪐 The 4 Planetary Datasets (Tracks)

SoniSphere features four curated NASA Scientific Visualization Studio (SVS) planetary datasets spanning Earth's atmosphere, oceans, biosphere, and anthroposphere:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       PLANETARY PLAYLIST (SHELF)                             │
├────────────────────┬────────────────────┬────────────────────┬───────────────┤
│ [1] Decadal Lights │ [2] Ocean Currents │ [3] ISS Lightning  │ [4] GEOS CO2  │
│  NASA SVS #5313    │  NASA SVS #3912    │  NASA SVS #5011    │ NASA SVS #5436│
│   2012 — 2023      │   2005 — 2007      │   2017 — 2023      │     2020      │
│  Suomi NPP VIIRS   │  ECCO2 Model / MIT │  ISS LIS Sensor    │ GEOS-5 Fluid  │
└────────────────────┴────────────────────┴────────────────────┴───────────────┘
```

---

### 🌟 Track 01: Decadal Night Lights (2012–2023) — NASA SVS #5313

* **Instrument**: Suomi NPP VIIRS Day/Night Band (DNB) Black Marble Product (`VNP46A2` / `VNP46A4`).
* **Source Reference**: [NASA SVS #5313: Change in Night Lights 2012–2023 (EIC Hyperwall)](https://svs.gsfc.nasa.gov/5313/).
* **Visual Telemetry**: 8K Hyperwall ($7680 \times 2160$), 30 FPS, 1300 frames documenting 11 years of planetary anthropic radiance evolution.

#### Three Operational Sonification Modes:
1. **Mode A — Annual Temporal History (2012–2023)**:
   - **Scale**: C Major Pentatonic ($C_3$ to $G_5$, 130.81 Hz to 783.99 Hz) to ensure harmonious, non-fatiguing acoustic listening.
   - **Mapping**: Rec. 601 luminance determines note pitch and chord voicing density:
     $$L = 0.299R + 0.587G + 0.114B$$
   - **Laser Scanline**: Cyan laser telemetry line sweeps across the globe synchronized to annual timeline ticks.
2. **Mode B — Decadal Change Detection (Purple vs. Orange)**:
   - **Purple Corridors ($H \in [125^\circ, 165^\circ]$)**: Rapid electrification and urbanization trigger sparkling crystal FM chimes ($E_5 - A_5$, stereo panned $+0.75$ Right).
   - **Orange Corridors ($H \in [8^\circ, 28^\circ]$)**: Conflict zones, humanitarian crises, and power blackouts trigger deep, somber cello tones ($D_2 - A_2$, stereo panned $-0.75$ Left).
3. **Mode C — Authentic Regional Profiles**:
   - **India**: E Mixolydian (Raag Desh folk inflection, snappy marimba pluck) reflecting Saubhagya rural electrification ($+34.2\%$).
   - **Ukraine**: A Natural Minor solemn strings reflecting conflict-induced power grid outages ($-42.1\%$).
   - **Western Europe**: G Lydian ambient crystal glass pad depicting continental LED transition.
   - **Eastern Mediterranean / Levant**: D Phrygian Dominant (Maqam Hijaz modal synth) highlighting demographic shifts.

---

### 🌊 Track 02: Sea Surface Currents & Temperatures — NASA SVS #3912

* **Model / Synthesis**: **ECCO2 (Estimating the Circulation and Climate of the Ocean, Phase II)**, developed jointly by NASA JPL and MIT using the MIT general circulation model (MITgcm).
* **Source Reference**: [NASA SVS #3912: Perpetual Ocean](https://svs.gsfc.nasa.gov/3912/).
* **Physical Phenomenon**: Global thermodynamic heat engine capturing western boundary currents (Gulf Stream, Kuroshio), equatorial countercurrents, and turbulent ocean eddies.

#### Thermodynamic & Hydrodynamic Sonification:
* **Cold Polar Waters ($0^\circ\text{C} - 10^\circ\text{C}$)**: Deep triangle-wave cello bass ($D_2 - G_2$, 73.4 Hz – 98.0 Hz) filtered through a steep 24 dB/oct lowpass filter (180 Hz cutoff).
* **Temperate Gyres ($10^\circ\text{C} - 22^\circ\text{C}$)**: Warm PolySynth open-fifth string harmonies ($A_2 - D_3$, 110.0 Hz – 146.8 Hz).
* **Warm Boundary Currents ($22^\circ\text{C} - 32^\circ\text{C}$)**: Harmonic sawtooth string swells ($E_3 - E_4$, 164.8 Hz – 329.6 Hz).
* **Current Flow Velocity $\to$ Dynamic Tempo**: Ocean flow speed (knots) modulates musical tempo from $55\text{ BPM}$ (placid open ocean) up to $130\text{ BPM}$ (surging boundary currents). High speeds trigger rapid fluid ripple arpeggiators.
* **Vector Heading $\to$ Azimuth Panning**: Streamline vector direction ($dx$) drives stereo panners from $-0.85$ (Westbound) to $+0.85$ (Eastbound).
* **Thermocline Depth Slice ($0\,\text{m} \to 200\,\text{m} \to 1000\,\text{m}$)**:
  - At $\ge 800\,\text{m}$ depth, sound drops into an authentic **$40\,\text{Hz}$ Infrasonic Sub-Bass** drone replicating abyssal ocean pressure.
* **3D Basin Raycasting (Click-to-Listen)**:
  - Direct clicks on the Pacific, Atlantic, or Indian basins on the 3D globe trigger smooth camera rotation, localized temperature profiles, and spatial audio pan crossfades.

---

### ⚡ Track 03: ISS Lightning Events (2017–2023) — NASA SVS #5011

* **Instrument**: **Lightning Imaging Sensor (LIS)** mounted on the International Space Station, operated by NASA Marshall Space Flight Center and GHRC DAAC.
* **Source Reference**: [NASA SVS #5011: ISS Lightning Events](https://svs.gsfc.nasa.gov/5011/).
* **Orbital Parameters**: Low Earth Orbit (LEO) at **408 km altitude**, traveling at **7.66 km/s**.

#### Punctuated Event-Driven Sonification:
* **Continuous 55 Hz Orbital Sub-Bass Drone**: Low-frequency sine drone (`A1`, 55.0 Hz, -14 dBFS) represents spacecraft telemetry in orbital night.
* **Optical Flash Detection (Temporal Differencing)**:
  $$\Delta \text{BrightPixels} \ge 15 \quad (\text{or } \Delta L > 0.02)$$
  Extracts 34 discrete, high-energy convective electrical discharge events across the sequence.
* **High-Register Metallic FM Chimes**:
  - Synthesizer: `Tone.PolySynth(Tone.Synth)` with sweet crystalline envelope and gentle lowpass filter.
  - Optical Flash Energy ($150\,\mu\text{J} - 1200\,\mu\text{J}$) maps to musical frequencies: $C_5$ (523 Hz), $E_5$ (659 Hz), $G_5$ (784 Hz), $A_5$ (880 Hz), $C_6$ (1046 Hz).
* **Stereo Spatial Azimuth**: Strike X-coordinate drives stereo panning from $-1.0$ (Western Horizon) to $+1.0$ (Eastern Horizon).
* **Deaf-Blind Tactile Pulse**: Dispatches a synchronized 80ms tactile vibration pulse via `navigator.vibrate(80)` to supported mobile/tablet devices on every optical strike.

---

### 💨 Track 04: DYAMOND Global Carbon Dioxide — NASA SVS #5436

* **Model**: **GEOS (Goddard Earth Observing System) 3D Atmospheric Fluid Circulation Model**, run under the international DYAMOND initiative.
* **Source Reference**: [NASA SVS #5436: DYAMOND Global Carbon Dioxide](https://svs.gsfc.nasa.gov/5436/).
* **Physical Phenomenon**: Atmospheric carbon respiration, biomass burning, and anthropogenic greenhouse plume transport across synoptic weather patterns.

#### Greenhouse Respiration Sonification:
* **Atmospheric Carbon Baseline (400 – 450 PPM)**: Global mean concentration scales the pitch register of an ambient atmospheric pad (`Tone.PolySynth`).
* **Radiative Forcing Tension $\to$ Dynamic Resonance Filter**:
  - Atmospheric carbon flux drives an automated lowpass filter cutoff frequency:
    $$f_{\text{cutoff}} = 220\,\text{Hz} + (\text{TensionScore} \times 1280\,\text{Hz})$$
  - Opens from $220\,\text{Hz}$ (clean pre-industrial baseline) up to $1500\,\text{Hz}$ (severe emission forcing), inducing audible harmonic acoustic tension.
* **Plume Burst Warning Chimes**: Sudden localized carbon flux spikes ($\Delta \text{PPM} > 1.8\,\text{ppm/s}$) fire bright metallic chimes in the upper octave ($C_5 - G_5$).
* **Zonal Longitude Panning**: 3 spatial emission zones (West: Americas; Center: Europe & Africa; East: Asia & Oceania) continuously steer stereo panning based on plume migration.

---

## 🏗️ System Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │      NASA Scientific Visualization Studio     │
                                  │   SVS #5313  •  #3912  •  #5011  •  #5436     │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                  ┌──────────────────────▼───────────────────────┐
                                  │  Python Scientific Preprocessing (Rec. 601)  │
                                  │  • Spectral Luma & HSV Change Extraction     │
                                  │  • Vector Motion & Optical Flash Differencing│
                                  │  • JSON Manifests & Feature Stream Datasets  │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                    TypeScript Scientific Data Pipelines
                                                         │
                     ┌───────────────────────────────────┼───────────────────────────────────┐
                     ▼                                   ▼                                   ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐         ┌─────────────────────────┐
        │   Interactive 3D WebGL  │         │   2D Optical Telemetry  │         │ Autonomous Voice Guide  │
        │      Three.js Globe     │         │      Canvas Stage       │         │    Web Speech Narration │
        │  • Dynamic Textures     │         │  • NASA 4K Direct Stream│         │  • Real-Time Telemetry  │
        │  • Basin Raycasting     │         │  • Laser Scanline (1Hz) │         │  • Auto-Ducking (-6 dB) │
        │  • Thermal Depth Slices │         │  • Lanczos HD Fallback  │         │  • WCAG Screen Readers  │
        └────────────┬────────────┘         └────────────┬────────────┘         └────────────┬────────────┘
                     │                                   │                                   │
                     └───────────────────────────────────┼───────────────────────────────────┘
                                                         │
                                          ┌──────────────▼──────────────┐
                                          │     Tone.js Audio Engine    │
                                          │  • PolySynth Channel Bank   │
                                          │  • Spatial Azimuth Panners  │
                                          │  • Studio Compressor Stage  │
                                          │  • Master Limiter (-0.2 dB) │
                                          └──────────────┬──────────────┘
                                                         │
                                          ┌──────────────▼──────────────┐
                                          │   Multi-Sensory Output HUD  │
                                          │  • Real-Time FFT Equalizer  │
                                          │  • Web Vibration Haptics    │
                                          │  • Scientific Explain Panel │
                                          └─────────────────────────────┘
```

---

## 🎛️ Audio Engineering & Sound Design

### 1. Zero-Clipping Master Signal Chain
To eliminate digital clipping and acoustic fatigue across high-gain headphone amplifiers and laptop speakers, SoniSphere implements an uninterrupted series gain pipeline:

$$\text{Voice Panners} \longrightarrow \text{Duck Gain} \longrightarrow \text{Mute Gain} \longrightarrow \text{Compressor} \longrightarrow \text{Limiter} (-0.2\,\text{dBFS}) \longrightarrow \text{Destination}$$

* **Master Headroom**: Clean studio calibrated output with full speaker presence.
* **Master Compressor**: Threshold $-12.0\,\text{dB}$, Ratio $2.2:1$, Attack $30\,\text{ms}$, Release $250\,\text{ms}$.
* **Master Limiter**: Hard-ceiling clamped at $-0.2\,\text{dBFS}$ to guarantee **0% digital distortion**.
* **Strict Priority**: `Mute Gain` is placed downstream of `Duck Gain` — **MUTE ALWAYS WINS**.

### 2. Autonomous Speech Ducking
When the Web Speech narration engine announces scientific events, it dispatches an automated ducking envelope:
* Music volume ramps smoothly down to **50% (-6.0 dB)** in $300\,\text{ms}$.
* Remains ducked throughout speech synthesis.
* Smoothly restores to 100% volume upon speech completion.

### 3. Dedicated Spatial Panning Bus
Each synthesizer channel possesses its own dedicated `Tone.Panner` node, eliminating coordinate crosstalk:
* **Night Lights Mode B**: Purple chimes $+0.75$ (Right); Orange cellos $-0.75$ (Left).
* **Ocean Currents**: Flow direction modulates panning from $-0.85$ (West) to $+0.85$ (East).
* **ISS Lightning**: Flash X-position on the globe directly sets the stereo pan $[-1.0, +1.0]$.
* **DYAMOND CO2**: Emission centroid across longitudes guides atmospheric stereo panning.

---

## 🌍 Interactive 3D WebGL Globe & 2D Optical Telemetry

### Dual-View Visualization Engine:
Users can fluidly alternate between the **2D Optical Telemetry Stage** and the **Interactive 3D WebGL Globe**:

| Feature | 2D Optical Telemetry Stage | Interactive 3D WebGL Globe |
|---|---|---|
| **Engine** | HTML5 Canvas + Hardware Video Decoder | Three.js WebGL Renderer |
| **Asset Quality** | NASA 4K Direct Stream (`Tv` button) / Local WebM | 2K Spherical Equirectangular Textures |
| **Interactivity** | Laser scanline, 100% contain/cover toggle | Drag to rotate, zoom, auto-rotation toggle |
| **Spatial Features** | Zonal 3x3 HUD bounding boxes | Click-to-listen 3D Raycasting with pulsing markers |
| **Depth Exploration** | — | Interactive Thermocline slider ($0\,\text{m} \to 1000\,\text{m}$) |

---

## ♿ Accessibility & Universal Design (WCAG AAA)

SoniSphere is engineered from the ground up for **WCAG AAA Compliance**, ensuring full accessibility for blind, visually impaired, deaf-blind, and neurodivergent individuals:

### Keyboard Navigation Quick Reference:

| Key | Action | Function & Accessibility Feedback |
|:---:|:---|:---|
| <kbd>Space</kbd> | **Play / Pause** | Toggles multi-modal playback, telemetry timers, and voice narrator |
| <kbd>1</kbd> | **Track 01** | Switches to Decadal Night Lights (NASA SVS #5313) |
| <kbd>2</kbd> | **Track 02** | Switches to Sea Surface Currents (NASA SVS #3912) |
| <kbd>3</kbd> | **Track 03** | Switches to ISS Lightning Events (NASA SVS #5011) |
| <kbd>4</kbd> | **Track 04** | Switches to DYAMOND Global CO2 (NASA SVS #5436) |
| <kbd>V</kbd> | **Toggle Voice** | Enables or disables autonomous Web Speech narration |
| <kbd>M</kbd> | **Mute / Unmute** | Mutes all Tone.js audio synthesizers instantly |
| <kbd>←</kbd> / <kbd>→</kbd> | **Seek 5s** | Step backward or forward through dataset timeline |
| <kbd>Tab</kbd> | **Navigate** | High-contrast `#FACC15` 3px focus ring with ARIA live announcements |

### Tactile & Auditory Accessibility Highlights:
* 📳 **Haptic Feedback**: High-intensity lightning discharges trigger an 80ms physical vibration via the Web Vibration API on mobile and tablet touchscreens.
* 👁️ **High-Contrast Palette**: Built with deep space obsidian (`#04070C`), high-contrast electric cyan (`#00F2FE`), and solar gold (`#FACC15`) exceeding WCAG AAA $7:1$ contrast requirements.
* 🗣️ **Screen Reader Optimizations**: All telemetry cards and HUD metrics feature dynamic `aria-live="polite"` regions and semantic descriptors.

---

## 🧪 Scientific Verification & Automated Test Suite (31 Tests)

All data extraction, computer vision algorithms, and audio synthesis pipelines pass an automated test suite of **31 unit and integration tests**:

```bash
# Execute test suite from repository root
python soniearth-nightlights/scripts/validate_all.py
```

### Test Suite Execution Output:
```text
=================================================================
  SONISPHERE PIPELINE VERIFICATION & TEST RUNNER
=================================================================
test_master_limiter (test_audio.TestAudio) .................... ok
test_stereo_panning (test_audio.TestAudio) .................... ok
test_synthesize_instrument_dispatch (test_audio.TestAudio) .... ok
test_synthesizer_lengths (test_audio.TestAudio) ............... ok
test_co2_assets_exist (test_co2.TestDYAMONDCO2) ............... ok
test_co2_metadata_structure (test_co2.TestDYAMONDCO2) ......... ok
test_co2_physical_metrics_bounds (test_co2.TestDYAMONDCO2) .... ok
test_co2_spatial_grids (test_co2.TestDYAMONDCO2) .............. ok
test_all_nine_cells_labeled_and_panned (test_extraction) ...... ok
test_black_frame (test_extraction.TestExtraction) ............. ok
test_purple_orange_detection (test_extraction.TestExtraction) . ok
test_white_frame (test_extraction.TestExtraction) ............. ok
test_all_nine_grid_cells_played_in_mode_a (test_mapping) ....... ok
test_data_sensitivity_alters_notes (test_mapping.TestMapping) . ok
test_density_chord_voicings (test_mapping.TestMapping) ........ ok
test_mode_a_note_variety_across_decades (test_mapping) ........ ok
test_mode_b_dynamic_motif (test_mapping.TestMapping) .......... ok
test_mode_c_regional_instruments (test_mapping.TestMapping) ... ok
test_pentatonic_bounds (test_mapping.TestMapping) ............. ok
test_clamping (test_normalization.TestNormalization) .......... ok
test_constant_array_safeguard (test_normalization) ............ ok
test_log_compression (test_normalization.TestNormalization) ... ok
test_robust_percentiles (test_normalization.TestNormalization)  ok
test_standard_min_max (test_normalization.TestNormalization) ... ok
test_ocean_assets_exist (test_ocean_currents.TestOceanCurrents) ok
test_ocean_metadata_structure (test_ocean_currents) ........... ok
test_ocean_physical_metrics_bounds (test_ocean_currents) ...... ok
test_ocean_spatial_basins (test_ocean_currents) ............... ok
test_audio_events_timestamps (test_synchronization) ........... ok
test_feature_timestamps (test_synchronization) ................ ok
test_web_public_data_consistency (test_synchronization) ....... ok
-----------------------------------------------------------------
Ran 31 tests in 0.082s

OK (31 passed, 0 failed, 0 errors)
```

---

## 🚀 Quick Start & Installation Guide

You can launch the entire web application locally in **under 2 minutes**:

### 1. Prerequisites
* **Node.js**: v18.x, v20.x, or newer ([Download Node.js](https://nodejs.org/))
* **Python**: v3.10 or newer (for optional data pipeline execution)
* **Git**: Installed and configured

### 2. Clone the Repository
```bash
git clone https://github.com/Mahekpatel06/AeroAcoustic.git
cd AeroAcoustic
```

### 3. Launch the Web Application
```bash
# Navigate to the web application directory
cd soniearth-web

# Install frontend dependencies
npm install

# Start local Next.js development server
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

> [!TIP]
> **Production Build**:
> For maximum rendering and audio performance, compile a production build:
> ```bash
> npm run build
> npm start
> ```

### 4. (Optional) Run the Python Computer Vision Pipeline
To regenerate feature extraction matrices or test data artifacts:
```bash
cd ../soniearth-nightlights
pip install -r requirements.txt
python scripts/run_pipeline.py
```

---

## 📂 Repository Directory Structure

```text
AeroAcoustic/
├── soniearth-web/                      # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css             # Tailwind CSS & Deep Space Cyan theme
│   │   │   ├── layout.tsx              # Root HTML & metadata layout
│   │   │   └── page.tsx                # Master Dashboard & state coordinator
│   │   ├── components/
│   │   │   ├── AccessibilityFooter.tsx # WCAG AAA keyboard & screen reader footer
│   │   │   ├── AcousticStage.tsx       # Live FFT Spectrum Analyser & Equalizer HUD
│   │   │   ├── DatasetShelf.tsx        # 4-Track NASA Planetary Playlist Shelf
│   │   │   ├── ExplainPanel.tsx        # "Why am I hearing this?" Explainability Engine
│   │   │   ├── Header.tsx              # NASA Space Apps branding & quick status
│   │   │   ├── InteractiveGlobe.tsx    # Three.js 3D Globe with Basin Raycasting
│   │   │   ├── LandingPage.tsx         # Immersive interactive introductory portal
│   │   │   ├── MasterController.tsx    # Universal scrubber, transport & volume HUD
│   │   │   └── SatelliteStage.tsx      # 2D Optical Telemetry & Laser Scanline Stage
│   │   ├── lib/
│   │   │   ├── audioEngine.ts          # Tone.js Synthesizer Bank & Master Limiter
│   │   │   ├── speechNarrator.ts       # Web Speech API Guide with Auto-Ducking
│   │   │   └── timelineSync.ts         # High-precision millisecond timeline sync
│   │   └── types/
│   │       └── index.ts                # TypeScript scientific data contracts
│   └── public/
│       └── datasets/                   # Pre-rendered video chunks & JSON manifests
│           ├── dyamond-co2/            # NASA SVS #5436 GEOS CO2 features & video
│           ├── iss-lightning/          # NASA SVS #5011 ISS LIS features & video
│           ├── night-lights/           # NASA SVS #5313 VIIRS features & video
│           └── ocean-currents/         # NASA SVS #3912 ECCO2 ocean features & video
│
├── soniearth-nightlights/              # Python Scientific Preprocessing & Sonification
│   ├── analysis/                       # Computer vision & spatial grid classifiers
│   ├── assets/                         # Extracted representative frames & assets
│   ├── config/                         # Dataset configurations & calibration limits
│   ├── data/                           # Generated manifests & feature JSON files
│   ├── preprocessing/                  # Rec. 601 luminance & phase detection
│   ├── profiles/                       # Sonification profiles & scales
│   ├── scripts/
│   │   ├── generate_hd_chunks.py       # High-definition video chunk generation
│   │   ├── run_pipeline.py             # Master end-to-end preprocessing pipeline
│   │   └── validate_all.py             # 31 Automated verification tests runner
│   ├── sonification/                   # Mathematical scale quantizers & WAV exporters
│   └── tests/                          # 7 test modules covering all 4 datasets
│
├── reports/                            # Technical engineering & scientific guides
│   ├── media_metadata.json             # NASA SVS asset catalog URLs & resolutions
│   └── sea_surface_currents_execution_guide.md # Ocean currents execution guide
├── SEA_SURFACE_CURRENTS_GUIDE.md       # Oceanographic hydrodynamic sonification manual
└── README.md                           # Master Project Documentation
```

---

## 📜 Scientific Citations & Provenance

1. **NASA SVS #5313 — Decadal Night Lights (2012–2023)**:
   - *Citation*: NASA Scientific Visualization Studio. *Change in Night Lights between 2012 and 2023 - EIC Version*. [https://svs.gsfc.nasa.gov/5313/](https://svs.gsfc.nasa.gov/5313/)
   - *Sensor*: Visible Infrared Imaging Radiometer Suite (VIIRS) aboard the Suomi NPP satellite.
   - *Product*: NASA Black Marble (`VNP46A2` / `VNP46A4`).
2. **NASA SVS #3912 — Perpetual Ocean (ECCO2 Model)**:
   - *Citation*: NASA Scientific Visualization Studio / Jet Propulsion Laboratory / MIT. *Perpetual Ocean: Sea Surface Currents & Temperatures*. [https://svs.gsfc.nasa.gov/3912/](https://svs.gsfc.nasa.gov/3912/)
   - *Synthesis*: ECCO2 (Estimating the Circulation and Climate of the Ocean, Phase II) using MITgcm.
3. **NASA SVS #5011 — ISS Lightning Events (2017–2023)**:
   - *Citation*: NASA Marshall Space Flight Center / GHRC DAAC. *Lightning Events Detected from the International Space Station*. [https://svs.gsfc.nasa.gov/5011/](https://svs.gsfc.nasa.gov/5011/)
   - *Sensor*: Lightning Imaging Sensor (LIS) on the International Space Station.
4. **NASA SVS #5436 — DYAMOND Global Carbon Dioxide**:
   - *Citation*: NASA Global Modeling and Assimilation Office (GMAO). *DYAMOND Global Atmospheric Carbon Dioxide Simulation*. [https://svs.gsfc.nasa.gov/5436/](https://svs.gsfc.nasa.gov/5436/)
   - *Model*: Goddard Earth Observing System (GEOS) 3D atmospheric transport model.

---

## 👥 Team & License

* **Developed by**: **Team AeroAcoustic**
* **Challenge**: NASA International Space Apps Challenge — *"The Earth Information Jukebox"*
* **Repository**: [https://github.com/Mahekpatel06/AeroAcoustic](https://github.com/Mahekpatel06/AeroAcoustic)
* **License**: Open Source under the [MIT License](https://opensource.org/licenses/MIT).

---

<p align="center">
  <b>🌍 SoniSphere — Connecting Humanity to the Rhythm of Our Living Planet</b><br>
  <i>Built with ❤️ for NASA Space Apps</i>
</p>
