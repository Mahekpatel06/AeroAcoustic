"""
test_synchronization.py
Tests timeline synchronization, monotonically increasing timestamps,
and data consistency between Python pipeline outputs and public web directory.
"""
import unittest
import json
import os
import sys

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(TESTS_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

class TestSynchronization(unittest.TestCase):
    def test_feature_timestamps(self):
        feat_path = os.path.join(PROJECT_DIR, "data", "features", "night_lights_features.json")
        self.assertTrue(os.path.exists(feat_path), f"Features file missing at {feat_path}")
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
        score_path = os.path.join(PROJECT_DIR, "data", "intermediate", "audio_events.json")
        self.assertTrue(os.path.exists(score_path), f"Score file missing at {score_path}")
        with open(score_path, "r", encoding="utf-8") as f:
            score = json.load(f)

        events = score["events"]
        self.assertGreater(len(events), 0)
        for ev in events:
            self.assertGreaterEqual(ev["timestampSeconds"], 0.0)
            self.assertGreater(ev["durationSeconds"], 0.0)
            self.assertTrue(-1.0 <= ev["pan"] <= 1.0)
            self.assertTrue(0.0 <= ev["velocity"] <= 1.0)
            self.assertIn("frequencyHz", ev)
            self.assertGreater(ev["frequencyHz"], 0.0)

    def test_web_public_data_consistency(self):
        """
        Acceptance Checklist: A web check confirms public/ data matches Python output.
        """
        py_feat = os.path.join(PROJECT_DIR, "data", "features", "night_lights_features.json")
        web_feat = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "night-lights", "features.json")

        self.assertTrue(os.path.exists(py_feat), "Python features missing")
        self.assertTrue(os.path.exists(web_feat), "Web public features missing")

        with open(py_feat, "r", encoding="utf-8") as f1, open(web_feat, "r", encoding="utf-8") as f2:
            d1 = json.load(f1)
            d2 = json.load(f2)

        self.assertEqual(len(d1["frames"]), len(d2["frames"]), "Frame counts must match")
        self.assertEqual(d1["datasetId"], d2["datasetId"])

        # Also check audio_events.json
        py_score = os.path.join(PROJECT_DIR, "data", "intermediate", "audio_events.json")
        web_score = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "night-lights", "audio_events.json")

        self.assertTrue(os.path.exists(py_score), "Python score missing")
        self.assertTrue(os.path.exists(web_score), "Web public score missing")

        with open(py_score, "r", encoding="utf-8") as f1, open(web_score, "r", encoding="utf-8") as f2:
            s1 = json.load(f1)
            s2 = json.load(f2)

        self.assertEqual(len(s1["events"]), len(s2["events"]), "Audio score event counts must match")

if __name__ == "__main__":
    unittest.main()
