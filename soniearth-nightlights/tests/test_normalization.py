"""
test_normalization.py
Unit tests for data normalization, log scaling, and robust percentile functions.
"""
import unittest
import numpy as np
import os
import sys

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(TESTS_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from sonification.normalization import min_max_normalize, log_luminance_scale, robust_percentile_scale

class TestNormalization(unittest.TestCase):
    def test_standard_min_max(self):
        arr = np.array([10.0, 20.0, 30.0])
        norm = min_max_normalize(arr, 10.0, 30.0)
        self.assertAlmostEqual(norm[0], 0.0)
        self.assertAlmostEqual(norm[1], 0.5)
        self.assertAlmostEqual(norm[2], 1.0)

    def test_constant_array_safeguard(self):
        arr = np.array([5.0, 5.0, 5.0])
        norm = min_max_normalize(arr, 5.0, 5.0)
        self.assertTrue(np.all(norm == 0.5))

    def test_clamping(self):
        arr = np.array([-10.0, 50.0])
        norm = min_max_normalize(arr, 0.0, 20.0, clamp=True)
        self.assertEqual(norm[0], 0.0)
        self.assertEqual(norm[1], 1.0)

    def test_log_compression(self):
        # 0 maps to 0
        self.assertAlmostEqual(log_luminance_scale(0.0), 0.0)
        # 1 maps to 1: log10(1 + 9 * 1) = log10(10) = 1.0
        self.assertAlmostEqual(log_luminance_scale(1.0), 1.0)
        # 0.1 maps to log10(1 + 0.9) = log10(1.9) approx 0.2787
        self.assertGreater(log_luminance_scale(0.1), 0.1)

    def test_robust_percentiles(self):
        # Outliers at extremities
        arr = np.array([-100.0, 1.0, 2.0, 3.0, 4.0, 500.0])
        norm = robust_percentile_scale(arr, p_low=10.0, p_high=90.0)
        self.assertEqual(norm[0], 0.0)
        self.assertEqual(norm[-1], 1.0)

if __name__ == "__main__":
    unittest.main()
