# Phase 4 & 5: Processing & Computer Vision Report

## 1. Frame Extraction Architecture
* **Source Media:** `nightlights_svs5313.mp4` (7680x2160, 30 FPS, 1300 frames).
* **Processing Resolution:** Downscaled to $960 \times 270$ (maintaining the ultra-wide 32:9 NASA EIC aspect ratio).
* **Frame Optimization:** Saved as 8-bit RGB PNG files in `assets/extracted_frames/` with deterministic timestamps.
* **Phase-Keyed Sampling:**
  - Annual Series: 12 key annual frames (2012 to 2023).
  - Change Transition: 2 cross-fade frames.
  - Global Decadal Change: 6 full-globe change frames.
  - Regional Zooms: 8 localized frames (India, Ukraine, Western Europe, Eastern Mediterranean).

---

## 2. Global Luminance & Density Extraction
* **Luminance Formula (Rec. 601):**
  $$L = 0.299 \times R + 0.587 \times G + 0.114 \times B$$
  Normalized to $[0.0, 1.0]$.
* **Measured Global Luminance Trend:**
  - 2012 Baseline: $0.0313$
  - 2023 Decadal Average: $0.0326$
  - Indicates steady global expansion of artificial lighting infrastructure.
* **Bright Pixel Density:** Measured as fraction of pixels where $L > 0.08$ (excluding dark ocean basins and unlit hinterlands).

---

## 3. Spatial Grid Analysis (3 x 3)
The globe is divided into 9 geographic cells:
* **Columns (Horizontal Panning):**
  - Col 0 (Americas): Stereo pan $-0.8$ (Left).
  - Col 1 (Europe / Africa): Stereo pan $0.0$ (Center).
  - Col 2 (Asia / Oceania): Stereo pan $+0.8$ (Right).
* **Features per cell:** Mean brightness, standard deviation, median, bright pixel density, and mapped C Major Pentatonic note.

---

## 4. Change Map Color Classification
The Decadal Change phase uses calibrated HSV color segmentation:
* **Purple (Increased Illumination):**
  - HSV bounds: $H \in [125, 165], S \ge 40, V \ge 40$.
  - Measured Global Increase Ratio ($A/T$): $\approx 2.64\%$.
* **Orange (Decreased Illumination):**
  - HSV bounds: $H \in [8, 28], S \ge 70, V \ge 70$.
  - Measured Global Decrease Ratio ($D/T$): $\approx 0.36\%$.
* **Visual Net Change:**
  $$\text{VisualNetChange} = \frac{A - D}{T} = +0.0228$$
  The global expansion of illumination substantially exceeded localized lighting declines.
