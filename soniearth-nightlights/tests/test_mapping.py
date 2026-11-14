"""
test_mapping.py
Unit tests for musical mapping and pentatonic scale quantization.
"""
import unittest
from sonification.scale_quantizer import quantize_to_pentatonic, get_chord_for_density, PENTATONIC_NOTES
from sonification.musical_mapping import map_feature_to_note, generate_events_for_frame

class TestMapping(unittest.TestCase):
    def test_pentatonic_bounds(self):
        note_low, freq_low = quantize_to_pentatonic(0.0)
        self.assertEqual(note_low, "C3")
        self.assertAlmostEqual(freq_low, 130.81)

        note_high, freq_high = quantize_to_pentatonic(1.0)
        self.assertEqual(note_high, "C5")
        self.assertAlmostEqual(freq_high, 523.25)

    def test_density_chord_voicings(self):
        # Sparse density
        sparse_chord = get_chord_for_density("C3", 0.02)
        self.assertEqual(len(sparse_chord), 1)

        # Moderate density
        mod_chord = get_chord_for_density("C3", 0.12)
        self.assertEqual(len(mod_chord), 2)

        # Dense density
        dense_chord = get_chord_for_density("C3", 0.35)
        self.assertEqual(len(dense_chord), 3)

    def test_event_generation_change_motif(self):
        sample_feature = {
            "phase": "global_change",
            "globalMeanBrightness": 0.45,
            "brightPixelDensity": 0.15,
            "spatialGrid": [
                {"regionId": "R0_0", "meanBrightness": 0.3, "brightPixelDensity": 0.05, "pan": -0.8}
            ],
            "changeClassification": {
                "increaseRatio": 0.05,
                "decreaseRatio": 0.02
            }
        }
        events = generate_events_for_frame(sample_feature, event_time_sec=1.0)
        instruments = [e["instrument"] for e in events]
        self.assertIn("sine_pad", instruments)
        self.assertIn("crystalline_chime_bell", instruments)
        self.assertIn("warm_cello_synth", instruments)

if __name__ == "__main__":
    unittest.main()
