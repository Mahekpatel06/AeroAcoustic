"""
test_synchronization.py
Tests timeline synchronization and monotonically increasing timestamps.
"""
import unittest
import json
import os

class TestSynchronization(unittest.TestCase):
    def test_feature_timestamps(self):
        feat_path = "soniearth-nightlights/data/features/night_lights_features.json"
        self.assertTrue(os.path.exists(feat_path))
        with open(feat_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        frames = data["frames"]
        self.assertGreater(len(frames), 0)
        
        prev_t = -1.0
        for f in frames:
            t = f["timestampSeconds"]
            self.assertGreater(t, prev_t, "Timestamps must be monotonically increasing")
            prev_t = t

    def test_audio_events_timestamps(self):
        score_path = "soniearth-nightlights/data/intermediate/audio_events.json"
        self.assertTrue(os.path.exists(score_path))
        with open(score_path, "r", encoding="utf-8") as f:
            score = json.load(f)

        events = score["events"]
        self.assertGreater(len(events), 0)
        for ev in events:
            self.assertGreaterEqual(ev["timestampSeconds"], 0.0)
            self.assertGreater(ev["durationSeconds"], 0.0)
            self.assertTrue(-1.0 <= ev["pan"] <= 1.0)
            self.assertTrue(0.0 <= ev["velocity"] <= 1.0)

if __name__ == "__main__":
    unittest.main()
