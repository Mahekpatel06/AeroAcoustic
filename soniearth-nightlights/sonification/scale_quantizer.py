"""
scale_quantizer.py
Musical scale quantization for C Major Pentatonic mapping.
Prevents chaotic microtonal frequencies by constraining outputs to harmonic notes.
"""
import numpy as np

# C Major Pentatonic Scale Across Octaves 3 and 4
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

def get_chord_for_density(root_note_name, density):
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
        # Add a fifth or octave note
        second_idx = min(len(PENTATONIC_NOTES) - 1, root_idx + 3)
        return [PENTATONIC_NOTES[root_idx], PENTATONIC_NOTES[second_idx]]
    else:
        # 3-note triad voicing
        second_idx = min(len(PENTATONIC_NOTES) - 1, root_idx + 2)
        third_idx = min(len(PENTATONIC_NOTES) - 1, root_idx + 4)
        return [PENTATONIC_NOTES[root_idx], PENTATONIC_NOTES[second_idx], PENTATONIC_NOTES[third_idx]]
