"""
scale_quantizer.py
Musical scale quantization and multi-mode harmonic engines.
Prevents chaotic microtonal frequencies by constraining outputs to harmonic, mode-specific scales.
Supports:
- Mode A (Annual Evolution): C Major Lydian / Pentatonic (Progressive Planetary Light)
- Mode B (Decadal Change): D Dorian / A Minor Dual Scales (Polarity of Increase vs Decrease)
- Mode C (Regional Zoom): Authentic Regional Scales (India, Ukraine, Western Europe, Mediterranean)
"""
import numpy as np

# 1. Mode A: C Major Pentatonic & Lydian Scale Across Octaves 3, 4, 5
PENTATONIC_NOTES = [
    ("C3", 130.81),
    ("D3", 146.83),
    ("E3", 164.81),
    ("G3", 196.00),
    ("A3", 220.00),
    ("C4", 261.63),
    ("D4", 293.66),
    ("E4", 329.63),
    ("G4", 392.00),
    ("A4", 440.00),
    ("C5", 523.25)
]

# 2. Mode B: D Dorian / A Minor Dual Polarity Scales
DORIAN_NOTES = [
    ("D2", 73.42),
    ("F2", 87.31),
    ("A2", 110.00),
    ("C3", 130.81),
    ("D3", 146.83),
    ("F3", 174.61),
    ("G3", 196.00),
    ("A3", 220.00),
    ("C4", 261.63),
    ("D4", 293.66),
    ("F4", 349.23),
    ("A4", 440.00)
]

# 3. Mode C: Regional Scales
REGIONAL_SCALES = {
    # India: E Mixolydian / Raag Desh Pentatonic (Joyful electrification)
    "India": [
        ("E3", 164.81),
        ("G#3", 207.65),
        ("A3", 220.00),
        ("B3", 246.94),
        ("D4", 293.66),
        ("E4", 329.63),
        ("G#4", 415.30),
        ("B4", 493.88)
    ],
    # Ukraine: A Natural Minor (Solemn blackout corridors)
    "Ukraine": [
        ("A2", 110.00),
        ("C3", 130.81),
        ("D3", 146.83),
        ("E3", 164.81),
        ("F3", 174.61),
        ("A3", 220.00),
        ("C4", 261.63),
        ("E4", 329.63)
    ],
    # Western Europe: G Lydian (Luminous continental LED power grid)
    "Western Europe": [
        ("G3", 196.00),
        ("A3", 220.00),
        ("B3", 246.94),
        ("C#4", 277.18),
        ("D4", 293.66),
        ("E4", 329.63),
        ("F#4", 369.99),
        ("G4", 392.00)
    ],
    # Eastern Mediterranean: D Phrygian Dominant / Maqam Hijaz (Exotic crossroads)
    "Eastern Mediterranean": [
        ("D3", 146.83),
        ("Eb3", 155.56),
        ("F#3", 185.00),
        ("G3", 196.00),
        ("A3", 220.00),
        ("Bb3", 233.08),
        ("D4", 293.66),
        ("Eb4", 311.13)
    ]
}

NOTE_NAMES = [n[0] for n in PENTATONIC_NOTES]
FREQUENCIES_HZ = [n[1] for n in PENTATONIC_NOTES]

def quantize_to_pentatonic(normalized_value):
    """
    Quantizes a normalized value in [0.0, 1.0] to a specific Pentatonic Note.
    Formula: index = round(normalized_value * (N - 1))
    Returns (note_name, frequency_hz)
    """
    clamped = max(0.0, min(1.0, float(normalized_value)))
    idx = int(round(clamped * (len(PENTATONIC_NOTES) - 1)))
    return PENTATONIC_NOTES[idx]

def quantize_mode_scale(normalized_value, mode="annual", region_focus="global"):
    """
    Quantizes normalized value using the mode-specific or regional scale.
    """
    clamped = max(0.0, min(1.0, float(normalized_value)))
    
    if mode == "change":
        scale = DORIAN_NOTES
    elif mode == "regional" and region_focus in REGIONAL_SCALES:
        scale = REGIONAL_SCALES[region_focus]
    else:
        scale = PENTATONIC_NOTES
        
    idx = int(round(clamped * (len(scale) - 1)))
    return scale[idx]

def get_chord_for_density(root_note_name, density, scale_type="pentatonic"):
    """
    Generates controlled harmonious voicings based on density:
    - Sparse (< 0.08): 1 note (root)
    - Moderate (0.08 - 0.20): 2 notes (root + fifth or octave)
    - Dense (> 0.20): 3 notes (root + major third + fifth)
    """
    try:
        root_idx = NOTE_NAMES.index(root_note_name)
    except ValueError:
        root_idx = 0

    if density < 0.08:
        return [PENTATONIC_NOTES[root_idx]]
    elif density < 0.20:
        second_idx = min(len(PENTATONIC_NOTES) - 1, root_idx + 3)
        return [PENTATONIC_NOTES[root_idx], PENTATONIC_NOTES[second_idx]]
    else:
        second_idx = min(len(PENTATONIC_NOTES) - 1, root_idx + 2)
        third_idx = min(len(PENTATONIC_NOTES) - 1, root_idx + 4)
        return [PENTATONIC_NOTES[root_idx], PENTATONIC_NOTES[second_idx], PENTATONIC_NOTES[third_idx]]
