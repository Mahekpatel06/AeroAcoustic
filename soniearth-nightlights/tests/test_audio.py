"""
test_audio.py
Unit tests for synthesizer synthesis, stereo panning, and master limiter.
"""
import unittest
import numpy as np
from sonification.instruments import (
    synthesize_sine_pad,
    synthesize_crystalline_chime,
    synthesize_cello_synth,
    apply_stereo_panning,
    apply_master_limiter
)

class TestAudio(unittest.TestCase):
    def test_synthesizer_lengths(self):
        sr = 44100
        dur = 0.5
        sig = synthesize_sine_pad(440.0, dur, sr=sr)
        self.assertEqual(len(sig), int(dur * sr))

        chime = synthesize_crystalline_chime(880.0, dur, sr=sr)
        self.assertEqual(len(chime), int(dur * sr))

        cello = synthesize_cello_synth(130.81, dur, sr=sr)
        self.assertEqual(len(cello), int(dur * sr))

    def test_stereo_panning(self):
        mono = np.ones(100)
        # Hard left
        stereo_left = apply_stereo_panning(mono, -1.0)
        self.assertAlmostEqual(stereo_left[0, 1], 0.0, places=4)
        self.assertGreater(stereo_left[0, 0], 0.9)

        # Hard right
        stereo_right = apply_stereo_panning(mono, 1.0)
        self.assertAlmostEqual(stereo_right[0, 0], 0.0, places=4)
        self.assertGreater(stereo_right[0, 1], 0.9)

    def test_master_limiter(self):
        # Hot signal with peak of 5.0 (would heavily clip standard audio)
        hot_signal = np.full((100, 2), 5.0)
        limited = apply_master_limiter(hot_signal, threshold_db=-3.0)
        peak = np.max(np.abs(limited))
        # -3dB is approx 0.7079
        self.assertLessEqual(peak, 0.71)

if __name__ == "__main__":
    unittest.main()
