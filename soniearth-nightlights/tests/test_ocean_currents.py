"""
test_ocean_currents.py
Unit and integration tests for NASA SVS #3912 Perpetual Ocean (Sea Surface Currents).
"""
import unittest
import os
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)
OCEAN_DATA_DIR = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "ocean-currents")

class TestOceanCurrents(unittest.TestCase):
    def setUp(self):
        self.features_path = os.path.join(OCEAN_DATA_DIR, "features.json")
        self.video_path = os.path.join(OCEAN_DATA_DIR, "chunk_ocean_currents.webm")
        self.globe_texture_path = os.path.join(OCEAN_DATA_DIR, "ocean_currents_globe_2k.jpg")

    def test_ocean_assets_exist(self):
        """Verifies that all required media and metadata assets exist on disk."""
        self.assertTrue(os.path.exists(self.features_path), "features.json missing for ocean currents")
        self.assertTrue(os.path.exists(self.video_path), "chunk_ocean_currents.webm video missing")
        self.assertTrue(os.path.exists(self.globe_texture_path), "ocean_currents_globe_2k.jpg texture missing")
        self.assertGreater(os.path.getsize(self.video_path), 5 * 1024 * 1024, "Video file too small")
        self.assertGreater(os.path.getsize(self.globe_texture_path), 100 * 1024, "Texture file too small")

    def test_ocean_metadata_structure(self):
        """Verifies dataset manifest properties for NASA SVS #3912."""
        with open(self.features_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertEqual(data.get("datasetId"), "nasa-svs-3912")
        self.assertEqual(data.get("version"), "1.0.0")
        self.assertGreaterEqual(data.get("totalFrames", 0), 600)
        self.assertGreater(data.get("durationSeconds", 0), 60.0)
        self.assertEqual(data.get("samplingFps"), 10.0)
        self.assertIn("frames", data)
        self.assertEqual(len(data["frames"]), data["totalFrames"])

    def test_ocean_physical_metrics_bounds(self):
        """Verifies that SST, current velocity, tempo BPM, and stereo panning fall within calibrated bounds."""
        with open(self.features_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        frames = data["frames"]
        for f in frames:
            sst = f.get("temperatureCelsius")
            self.assertIsNotNone(sst)
            self.assertGreaterEqual(sst, 0.0, f"SST below freezing at frame {f['frameIndex']}")
            self.assertLessEqual(sst, 35.0, f"SST above realistic limit at frame {f['frameIndex']}")

            vel = f.get("currentVelocityKnots")
            self.assertIsNotNone(vel)
            self.assertGreaterEqual(vel, 0.1, f"Velocity non-positive at frame {f['frameIndex']}")
            self.assertLessEqual(vel, 10.0, f"Velocity unphysically high at frame {f['frameIndex']}")

            bpm = f.get("tempoBpm")
            self.assertIsNotNone(bpm)
            self.assertGreaterEqual(bpm, 55, "BPM below minimum tempo")
            self.assertLessEqual(bpm, 130, "BPM above maximum tempo")

            pan = f.get("strikePan")
            self.assertIsNotNone(pan)
            self.assertGreaterEqual(pan, -0.85, "Pan clipped beyond stereo left")
            self.assertLessEqual(pan, 0.85, "Pan clipped beyond stereo right")

            note = f.get("activeNote")
            freq = f.get("frequencyHz")
            self.assertIsNotNone(note)
            self.assertIsNotNone(freq)
            self.assertGreater(freq, 70.0)
            self.assertLess(freq, 400.0)

    def test_ocean_spatial_basins(self):
        """Verifies that all 3 ocean basins (Pacific, Atlantic, Indian/Southern) are mapped with correct stereo positions."""
        with open(self.features_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        frame = data["frames"][0]
        basins = frame.get("spatialGrid", [])
        self.assertEqual(len(basins), 3, "Must have exactly 3 oceanic basins")
        basin_ids = [b["regionId"] for b in basins]
        self.assertIn("OCEAN_PACIFIC", basin_ids)
        self.assertIn("OCEAN_ATLANTIC", basin_ids)
        self.assertIn("OCEAN_INDIAN", basin_ids)

        for b in basins:
            self.assertIn("pan", b)
            self.assertIn("meanTemperature", b)
            self.assertGreaterEqual(b["meanTemperature"], 0.0)

if __name__ == "__main__":
    unittest.main()
