"""
test_mapping.py
Unit and behavioral tests for data-driven musical mapping, scale quantization, and note diversity.
"""
import unittest
import os
import sys
from collections import Counter

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(TESTS_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from sonification.scale_quantizer import quantize_to_pentatonic, get_chord_for_density, PENTATONIC_NOTES
from sonification.musical_mapping import map_feature_to_note, generate_events_for_frame, derive_annual_harmony

class TestMapping(unittest.TestCase):
    def test_pentatonic_bounds(self):
        note_low, freq_low = quantize_to_pentatonic(0.0)
        self.assertEqual(note_low, "C3")
        self.assertAlmostEqual(freq_low, 130.81)

        note_high, freq_high = quantize_to_pentatonic(1.0)
        self.assertEqual(note_high, "C5")
        self.assertAlmostEqual(freq_high, 523.25)

    def test_density_chord_voicings(self):
        sparse_chord = get_chord_for_density("C3", 0.02)
        self.assertEqual(len(sparse_chord), 1)

        mod_chord = get_chord_for_density("C3", 0.12)
        self.assertEqual(len(mod_chord), 2)

        dense_chord = get_chord_for_density("C3", 0.35)
        self.assertEqual(len(dense_chord), 3)

    def test_data_sensitivity_alters_notes(self):
        """
        Behavior test: Changing input data directly alters resulting notes and frequencies.
        """
        # Feature with low radiance (e.g. baseline or blackout)
        low_feature = {
            "phase": "annual_series",
            "globalMeanBrightness": 0.0216,
            "temporalDelta": -0.001,
            "spatialGrid": [
                {"regionId": "R0_0", "name": "NW", "calibratedScore": 0.1, "activeNote": "C3", "pan": -0.75}
            ]
        }
        # Feature with high radiance (e.g. peak expansion)
        high_feature = {
            "phase": "annual_series",
            "globalMeanBrightness": 0.0244,
            "temporalDelta": +0.002,
            "spatialGrid": [
                {"regionId": "R0_0", "name": "NW", "calibratedScore": 0.9, "activeNote": "C5", "pan": -0.75}
            ]
        }
        events_low = generate_events_for_frame(low_feature, event_time_sec=0.0)
        events_high = generate_events_for_frame(high_feature, event_time_sec=0.0)

        notes_low = [e["note"] for e in events_low]
        notes_high = [e["note"] for e in events_high]
        freqs_low = [e["frequencyHz"] for e in events_low]
        freqs_high = [e["frequencyHz"] for e in events_high]

        self.assertNotEqual(notes_low, notes_high, "Altering input data MUST alter the output notes")
        self.assertNotEqual(freqs_low, freqs_high, "Altering input data MUST alter the frequencies")
        self.assertGreater(freqs_high[0], freqs_low[0], "Higher brightness must produce higher root frequency")

    def test_mode_a_note_variety_across_decades(self):
        """
        Acceptance Checklist: Mode A must have at least 5 distinct notes across the 12 years,
        and no single note exceeds 60% of all events.
        """
        # Simulated 12 annual frames with real measured radiance levels
        annual_brightness_series = [
            (2012, 0.02264, 0.0),
            (2013, 0.02274, 0.00010),
            (2014, 0.02292, 0.00018),
            (2015, 0.02305, 0.00013),
            (2016, 0.02317, 0.00012),
            (2017, 0.02324, 0.00007),
            (2018, 0.02372, 0.00048),
            (2019, 0.02376, 0.00004),
            (2020, 0.02381, 0.00005),
            (2021, 0.02177, -0.00204),
            (2022, 0.02436, 0.00259),
            (2023, 0.02435, -0.00001),
        ]
        all_events = []
        for yr, b, delta in annual_brightness_series:
            frame_feat = {
                "phase": "annual_series",
                "year": yr,
                "globalMeanBrightness": b,
                "temporalDelta": delta,
                "spatialGrid": [
                    {"regionId": f"R{r}_{c}", "name": f"Cell_{r}_{c}", "calibratedScore": (r*3+c)/8.0,
                     "activeNote": PENTATONIC_NOTES[min(len(PENTATONIC_NOTES)-1, r*3+c)][0],
                     "pan": (c-1)*0.75}
                    for r in range(3) for c in range(3)
                ]
            }
            events = generate_events_for_frame(frame_feat, event_time_sec=float(yr - 2012))
            all_events.extend(events)

        notes = [e["note"] for e in all_events]
        counter = Counter(notes)

        # 1. At least 5 distinct notes
        self.assertGreaterEqual(len(counter), 5, f"Expected >= 5 distinct notes, got {len(counter)}: {counter}")

        # 2. No single note > 60% of events
        most_common_note, most_common_count = counter.most_common(1)[0]
        max_ratio = most_common_count / len(all_events)
        self.assertLessEqual(max_ratio, 0.60, f"Most common note {most_common_note} is {max_ratio*100:.1f}%, exceeding 60%")

    def test_all_nine_grid_cells_played_in_mode_a(self):
        """
        Acceptance Checklist: Every grid cell (all 9) is played with correct metadata.
        """
        dummy_feat = {
            "phase": "annual_series",
            "globalMeanBrightness": 0.023,
            "temporalDelta": 0.0,
            "spatialGrid": [
                {"regionId": f"R{r}_{c}", "name": f"Cell_{r}_{c}", "calibratedScore": 0.5,
                 "activeNote": "C4", "pan": (c-1)*0.75}
                for r in range(3) for c in range(3)
            ]
        }
        events = generate_events_for_frame(dummy_feat, event_time_sec=0.0)
        grid_events = [e for e in events if e.get("eventType") == "spatial_arpeggio"]
        self.assertEqual(len(grid_events), 9, "All 9 spatial cells must generate audio events")
        region_ids = [e["regionId"] for e in grid_events]
        expected_ids = [f"R{r}_{c}" for r in range(3) for c in range(3)]
        self.assertEqual(sorted(region_ids), sorted(expected_ids))

    def test_mode_b_dynamic_motif(self):
        sample_feature = {
            "phase": "global_change",
            "globalMeanBrightness": 0.023,
            "temporalDelta": 0.0,
            "changeClassification": {
                "increaseRatio": 0.025,
                "decreaseRatio": 0.015,
                "visualNetChange": 0.010,
                "purpleMeanIntensity": 0.75,
                "orangeMeanIntensity": 0.60
            }
        }
        events = generate_events_for_frame(sample_feature, event_time_sec=1.0)
        instruments = [e["instrument"] for e in events]
        self.assertIn("sine_pad", instruments)
        self.assertIn("crystalline_chime_bell", instruments)
        self.assertIn("warm_cello_synth", instruments)

    def test_mode_c_regional_instruments(self):
        regions_and_insts = [
            ("India", "marimba_pluck"),
            ("Ukraine", "warm_cello_synth"),
            ("Western Europe", "glass_pad"),
            ("Eastern Mediterranean", "modal_synth")
        ]
        for reg, expected_inst in regions_and_insts:
            feat = {
                "phase": "regional_zoom",
                "regionFocus": reg,
                "globalMeanBrightness": 0.025,
                "temporalDelta": 0.001
            }
            events = generate_events_for_frame(feat, event_time_sec=0.0)
            insts = [e["instrument"] for e in events]
            self.assertIn(expected_inst, insts, f"Region {reg} must use instrument {expected_inst}")

if __name__ == "__main__":
    unittest.main()
