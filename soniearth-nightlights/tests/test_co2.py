"""
test_co2.py
Unit and integration tests for NASA SVS #5436 DYAMOND Global Carbon Dioxide (GEOS 3D Fluid Model).
"""
import unittest
import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)
CO2_DATA_DIR = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "dyamond-co2")

class TestDYAMONDCO2(unittest.TestCase):
    def setUp(self):
        self.features_path = os.path.join(CO2_DATA_DIR, "features.json")
        self.video_path = os.path.join(CO2_DATA_DIR, "chunk_dyamond_co2.mp4")
        self.colorbar_path = os.path.join(CO2_DATA_DIR, "dyamond_colorbar.png")

    def test_co2_assets_exist(self):
        """Verifies that all required media and metadata assets exist on disk."""
        self.assertTrue(os.path.exists(self.features_path), "features.json missing for DYAMOND CO2")
        self.assertTrue(os.path.exists(self.video_path), "chunk_dyamond_co2.mp4 video missing")
        self.assertTrue(os.path.exists(self.colorbar_path), "dyamond_colorbar.png missing")
        self.assertGreater(os.path.getsize(self.video_path), 5 * 1024 * 1024, "Video file too small")
        self.assertGreater(os.path.getsize(self.colorbar_path), 10 * 1024, "Colorbar file too small")

    def test_co2_metadata_structure(self):
        """Verifies dataset manifest properties for NASA SVS #5436."""
        with open(self.features_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertEqual(data.get("datasetId"), "nasa-svs-5436")
        self.assertTrue(data.get("version", "").startswith("1."))
        self.assertGreaterEqual(data.get("totalFrames", 0), 390)
        self.assertGreater(data.get("durationSeconds", 0), 38.0)
        self.assertEqual(data.get("samplingFps"), 10.0)
        self.assertIn("frames", data)
        self.assertEqual(len(data["frames"]), data["totalFrames"])
        self.assertGreater(data.get("meanPpm", 0), 405.0)
        self.assertIn("simulationPeriod", data)
        self.assertIn("2020", data["simulationPeriod"])

    def test_co2_physical_metrics_bounds(self):
        """Verifies that PPM, carbon flux, tension, and spatial panning fall within calibrated bounds."""
        with open(self.features_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        frames = data["frames"]
        burst_count = 0
        notes_found = set()

        pitch_levels = set()
        for f in frames:
            ppm = f.get("co2Ppm")
            self.assertIsNotNone(ppm)
            self.assertGreaterEqual(ppm, 400.0, f"PPM below pre-industrial baseline at frame {f['frameIndex']}")
            self.assertLessEqual(ppm, 450.0, f"PPM above upper bounds at frame {f['frameIndex']}")

            tension = f.get("harmonicTensionScore")
            self.assertIsNotNone(tension)
            self.assertGreaterEqual(tension, 0.0)
            self.assertLessEqual(tension, 1.0)

            pan = f.get("strikePan")
            self.assertIsNotNone(pan)
            self.assertGreaterEqual(pan, -1.0)
            self.assertLessEqual(pan, 1.0)

            centroid = f.get("plumeCentroid")
            self.assertIsNotNone(centroid)
            self.assertEqual(len(centroid), 2)
            self.assertGreaterEqual(centroid[0], 0.0)
            self.assertLessEqual(centroid[0], 1.0)

            if f.get("isPlumeBurst"):
                burst_count += 1

            if f.get("activeNote"):
                notes_found.add(f["activeNote"])

            if f.get("pitchLevel"):
                pitch_levels.add(f["pitchLevel"])
            self.assertIn("2020", f.get("simulationDate", ""))

        self.assertGreaterEqual(burst_count, 10, "Plume burst detector should detect localized emission surges")
        self.assertGreaterEqual(len(notes_found), 3, "Musical mapping should produce at least 3 distinct notes")
        self.assertIn("LOW", pitch_levels)
        self.assertIn("MID", pitch_levels)
        self.assertIn("HIGH", pitch_levels)

    def test_co2_spatial_grids(self):
        """Verifies that all 3 spatial emission zones (West, Center, East) are populated."""
        with open(self.features_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        sample = data["frames"][0]["spatialGrid"]
        self.assertEqual(len(sample), 3)
        region_ids = [z["regionId"] for z in sample]
        self.assertIn("CO2_WEST", region_ids)
        self.assertIn("CO2_CENTER", region_ids)
        self.assertIn("CO2_EAST", region_ids)

if __name__ == "__main__":
    unittest.main()
