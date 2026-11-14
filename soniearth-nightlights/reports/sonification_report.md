# Phase 7 & 10: Sonification Algorithm Specification Report

## 1. Musical Scale & Harmonic Language
To guarantee that the sonification sounds pleasant, harmonic, and musical (rather than harsh random beeps), SoniEarth constrains all pitch generation to the **C Major Pentatonic Scale**:

| Scale Note | Frequency ($Hz$) | Scale Degree | Pitch Class |
|---|---|---|---|
| **C3** | 130.81 | 1 (Root) | Low Bass |
| **D3** | 146.83 | 2 | Low Tenor |
| **E3** | 164.81 | 3 | Tenor |
| **G3** | 196.00 | 5 | Mid |
| **A3** | 220.00 | 6 | Mid |
| **C4** | 261.63 | 1 (Octave) | Alto / Middle C |
| **D4** | 293.66 | 2 | Alto |
| **E4** | 329.63 | 3 | Soprano |
| **G4** | 392.00 | 5 | High Soprano |
| **A4** | 440.00 | 6 (Concert A) | High |
| **C5** | 523.25 | 1 (Double Octave) | Peak Shimmer |

---

## 2. Mathematical Mapping Formulations

### Mapping 1: Normalized Brightness to Pitch
$$\text{Index} = \text{round}\left(L_{\text{norm}} \times (N - 1)\right)$$
Where $N = 11$ (total scale notes), and $L_{\text{norm}} \in [0.0, 1.0]$.
* Low illumination ($L < 0.1$) $\to$ C3, D3.
* Moderate illumination ($L \approx 0.4$) $\to$ G3, A3.
* High illumination ($L > 0.8$) $\to$ G4, A4, C5.

### Mapping 2: Bright Pixel Density to Chord Voicing
* $\text{Density} < 0.08$: Single fundamental note ($\text{Root}$).
* $0.08 \le \text{Density} < 0.20$: Two-note harmonic interval ($\text{Root} + \text{Fifth/Octave}$).
* $\text{Density} \ge 0.20$: Full three-note harmonious triad ($\text{Root} + \text{Third} + \text{Fifth}$).

### Mapping 3: Horizontal Geographic Position to Stereo Panning
$$\text{Pan} = 2 \times \frac{x}{W} - 1 \in [-1.0, +1.0]$$
Constant-power panning law:
$$\text{Left Gain} = \cos\left(\frac{(\text{Pan} + 1)\pi}{4}\right), \quad \text{Right Gain} = \sin\left(\frac{(\text{Pan} + 1)\pi}{4}\right)$$

### Mapping 4: Change Motifs (Purple Increase vs. Orange Decrease)
* **Purple (Increased Illumination):**
  - **Instrument:** `crystalline_chime_bell` (bright overtones at 1.0x, 2.76x, 5.40x).
  - **Melodic Contour:** Ascending major triad ($C4 \to G4$).
  - **Stereo Placement:** Right stereo field ($+0.5$ to $+0.7$).
* **Orange (Decreased Illumination):**
  - **Instrument:** `warm_cello_synth` (warm low-pass triangular timbre).
  - **Melodic Contour:** Descending fifth interval ($E3 \to C3$).
  - **Stereo Placement:** Left stereo field ($-0.5$ to $-0.7$).

---

## 3. Caldwell 73 Benchmark Comparison
* **Inspiration:** NASA's Caldwell 73 sonification demonstrated spatial scanning and frequency-from-height concepts in astronomy.
* **SoniEarth Originality:**
  - SoniEarth implements an original Earth-climate mapping designed for decadal geospatial trends.
  - SoniEarth features dedicated dual-timbre change motifs (crystalline bells for urban growth vs. mellow cello for blackouts/conservation).
  - Designed for interactive, client-side browser synthesis via Tone.js rather than static pre-rendered video soundtracks.
