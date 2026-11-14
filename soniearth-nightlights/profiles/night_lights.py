"""
night_lights.py
Dedicated dataset sonification profile for Decadal Night Lights (NASA SVS #5313).
Configures feature mappings, instruments, thresholds, and musical motifs.
"""

PROFILE = {
    "datasetId": "nasa-svs-5313",
    "name": "Decadal Night Lights (2012–2023)",
    "scale": "C Major Pentatonic",
    "rootNote": "C3",
    "tempoBpm": 80,
    "eventsPerSecond": 3,
    "instruments": {
        "globalDrone": "sine_pad",
        "regionalArpeggio": "sine_pad",
        "increaseMotif": "crystalline_chime_bell",
        "decreaseMotif": "warm_cello_synth"
    },
    "mappings": {
        "meanBrightnessToPitch": {
            "formula": "note = Pentatonic[round(norm_val * 10)]",
            "range": ["C3", "C5"]
        },
        "densityToChord": {
            "sparse": {"threshold": 0.08, "voices": 1},
            "moderate": {"threshold": 0.20, "voices": 2},
            "dense": {"threshold": 1.0, "voices": 3}
        },
        "spatialGridToPan": {
            "west": -0.8,
            "center": 0.0,
            "east": 0.8
        },
        "changeMotifs": {
            "purple": {"color": "increased_illumination", "motif": "ascending_triad", "instrument": "crystalline_chime_bell"},
            "orange": {"color": "decreased_illumination", "motif": "descending_fifth", "instrument": "warm_cello_synth"}
        }
    }
}
