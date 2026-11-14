"""
test_extraction.py
Tests computer vision color classification and spatial grid extraction on synthetic test frames.
"""
import unittest
import numpy as np
import cv2
from analysis.spatial_analysis import analyze_spatial_grid
from analysis.change_detection import classify_change_map

class TestExtraction(unittest.TestCase):
    def test_black_frame(self):
        # 100x100 completely black frame
        frame = np.zeros((100, 100, 3), dtype=np.uint8)
        grid = analyze_spatial_grid(frame, rows=3, cols=3)
        self.assertEqual(len(grid), 9)
        for cell in grid:
            self.assertEqual(cell["meanBrightness"], 0.0)
            self.assertEqual(cell["activeNote"], "C3")

    def test_white_frame(self):
        # 100x100 completely white frame
        frame = np.full((100, 100, 3), 255, dtype=np.uint8)
        grid = analyze_spatial_grid(frame, rows=3, cols=3)
        for cell in grid:
            self.assertAlmostEqual(cell["meanBrightness"], 1.0, places=2)
            self.assertEqual(cell["activeNote"], "C5")

    def test_purple_orange_detection(self):
        frame = np.zeros((100, 100, 3), dtype=np.uint8)
        # Add purple rectangle (BGR ~ 180, 20, 160)
        frame[10:30, 10:30] = [180, 20, 160]
        # Add orange rectangle (BGR ~ 20, 140, 240)
        frame[50:70, 50:70] = [20, 140, 240]

        res = classify_change_map(frame)
        self.assertGreater(res["purplePixelCount"], 350)
        self.assertGreater(res["orangePixelCount"], 350)
        self.assertGreater(res["increaseRatio"], 0.0)
        self.assertGreater(res["decreaseRatio"], 0.0)

if __name__ == "__main__":
    unittest.main()
