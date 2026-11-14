"""
test_audio.py
Unit tests for synthesizer synthesis, stereo panning, master limiter, and all instruments.
"""
import unittest
import numpy as np
import os
import sys

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(TESTS_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from sonification.instruments import (
    synthesize_sine_pad,
    synthesize_crystalline_chime,
    synthesize_cello_synth,
    synthesize_marimba_pluck,
    synthesize_glass_pad,
    synthesize_modal_synth,
    synthesize_instrument,
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

        marimba = synthesize_marimba_pluck(329.63, dur, sr=sr)
        self.assertEqual(len(marimba), int(dur * sr))

        glass = synthesize_glass_pad(196.00, dur, sr=sr)
        self.assertEqual(len(glass), int(dur * sr))

        modal = synthesize_modal_synth(146.83, dur, sr=sr)
        self.assertEqual(len(modal), int(dur * sr))

    def test_synthesize_instrument_dispatch(self):
        sr = 44100
        dur = 0.4
        for inst in ["sine_pad", "crystalline_chime_bell", "warm_cello_synth", "marimba_pluck", "glass_pad", "modal_synth"]:
            sound = synthesize_instrument(inst, 220.0, dur, velocity=0.8, sr=sr)
            self.assertEqual(len(sound), int(dur * sr))
            self.assertTrue(np.max(np.abs(sound)) > 0.0)

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

        # Center
        stereo_center = apply_stereo_panning(mono, 0.0)
        self.assertAlmostEqual(stereo_center[0, 0], stereo_center[0, 1], places=4)

    def test_master_limiter(self):
        hot_signal = np.full((100, 2), 5.0)
        limited = apply_master_limiter(hot_signal, threshold_db=-3.0)
        peak = np.max(np.abs(limited))
        # -3dB is approx 0.7079
        self.assertLessEqual(peak, 0.71)

if __name__ == "__main__":
    unittest.main()
