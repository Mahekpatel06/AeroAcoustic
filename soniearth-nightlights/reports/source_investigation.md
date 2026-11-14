# Phase 1: Source Investigation Report — NASA SVS #5313

## 1. NASA Source Overview
* **Catalog Entry:** [NASA Scientific Visualization Studio Entry #5313](https://svs.gsfc.nasa.gov/5313/)
* **Project Name:** Change in Night Lights between 2012 and 2023 — EIC Version
* **Release Date:** 2024
* **Lead Visualizer:** NASA GSFC Scientific Visualization Studio / Earth Information Center (EIC)
* **Underlying Satellite & Instrument:** Suomi National Polar-orbiting Partnership (Suomi NPP) Satellite; Visible Infrared Imaging Radiometer Suite (VIIRS).
* **Underlying Scientific Product:** NASA Black Marble (VNP46A2 / VNP46A4 - Annual Average Nighttime Radiance).

---

## 2. Acquired Asset Details
Instead of downloading the uncompressed 4 GB ProRes file or the 131,072 individual frames (which would consume excessive bandwidth and disk space), we inspected and downloaded the official master H.265 distribution file:
* **Asset Name:** `nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4`
* **Direct URL:** `https://svs.gsfc.nasa.gov/vis/a000000/a005300/a005313/nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4`
* **File Size:** 34,306,797 bytes (32.72 MB)
* **Status:** Acquired and verified locally at `soniearth-nightlights/assets/original/nightlights_svs5313.mp4`.

---

## 3. Empirical Video Inspection (via OpenCV & FFprobe)
* **Native Frame Resolution:** $7680 \times 2160$ pixels (Ultra-wide 32:9 aspect ratio, engineered for the curved Earth Information Center Hyperwall).
* **Frame Rate:** $30.0$ Frames Per Second.
* **Total Frame Count:** $1300$ frames.
* **Exact Duration:** $43.33$ seconds.
* **Codec:** High Efficiency Video Coding (H.265 / HEVC).
* **Color Depth & Decoding:** Standard 8-bit per channel decoded as BGR in OpenCV without decoding artifacts.

---

## 4. Video Phase Breakdown
Empirical frame sampling reveals the exact operational phases within the 43.33s timeline:
1. **Phase A (0.0s – 12.0s / Frames 0 – 360): Annual Evolution Time Series**
   Presents annual composite averages from 2012 through 2023. Each year is displayed sequentially showing the steady global baseline of artificial lighting.
2. **Phase B (12.0s – 15.0s / Frames 361 – 450): Cross-fade Transition**
   The standard golden-white city lights fade into the color-coded difference map.
3. **Phase C (15.0s – 25.0s / Frames 451 – 750): Global Decadal Change Map**
   Full global view showing decadal changes:
   - **Purple Pixels:** Areas of increased night lights (electrification, urban expansion, new infrastructure).
   - **Orange Pixels:** Areas of decreased night lights (conflict, displacement, grid collapse, energy-conservation transitions).
4. **Phase D (25.0s – 43.33s / Frames 751 – 1300): Regional Zoom Sequences**
   Detailed regional trajectories exploring:
   - India (widespread purple electrification).
   - Ukraine (distinctive orange blackout clusters along conflict corridors).
   - Western Europe (subtle shifts, street lighting LED transitions).
   - Eastern Mediterranean (complex socioeconomic and conflict dynamics).

---

## 5. Critical Scientific Distinction
The RGB pixel values in this MP4 file are **rendered cartographic representations**, not raw radiometric data.
* **Raw VIIRS Radiance:** Measured in nanowatts per square centimeter per steradian ($nW \cdot cm^{-2} \cdot sr^{-1}$).
* **Video Rendering:** Applies logarithmic scaling, contrast enhancement, color palettes, and geographic projections.
* **Provenance Guarantee:** SoniEarth explicitly tags all features derived from this video as `"dataOrigin": "visual-estimate"` and documents the exact mathematical transformation to maintain scientific integrity.
