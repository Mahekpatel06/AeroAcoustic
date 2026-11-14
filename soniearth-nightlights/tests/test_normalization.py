"""
test_normalization.py
Unit tests for scientific feature normalization.
"""
import unittest
import numpy as np
from sonification.normalization import min_max_normalize, log_luminance_scale, robust_percentile_scale

class TestNormalization(unittest.TestCase):
    def test_standard_min_max(self):
        val = min_max_normalize(5.0, 0.0, 10.0)
        self.assertAlmostEqual(val, 0.5)

    def test_clamping(self):
        val_high = min_max_normalize(15.0, 0.0, 10.0, clamp=True)
        self.assertEqual(val_high, 1.0)
        val_low = min_max_normalize(-5.0, 0.0, 10.0, clamp=True)
        self.assertEqual(val_low, 0.0)

    def test_constant_array_safeguard(self):
        val = min_max_normalize(5.0, 5.0, 5.0)
        self.assertEqual(val, 0.5)

    def test_log_compression(self):
        val_zero = log_luminance_scale(0.0)
        self.assertAlmostEqual(val_zero, 0.0)
        val_one = log_luminance_scale(1.0)
        self.assertAlmostEqual(val_one, 1.0)

    def test_robust_percentiles(self):
        arr = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 100]) # 100 is outlier
        res = robust_percentile_scale(arr)
        self.assertTrue(np.all(res >= 0.0) and np.all(res <= 1.0))

if __name__ == "__main__":
    unittest.main()
