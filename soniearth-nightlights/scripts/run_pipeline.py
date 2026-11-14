"""
run_pipeline.py
One-click reproducible runner for the complete SoniEarth Night Lights pipeline.
Handles asset verification, feature extraction, score generation, and audio rendering.
"""
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from preprocessing.extract_features import process_features
from preprocessing.generate_manifest import generate_master_manifest
from sonification.generate_audio import generate_all_sonification_modes

def run_full_pipeline():
    print("=" * 65)
    print("  SONIEARTH — NASA SVS #5313 END-TO-END PIPELINE")
    print("=" * 65)

    print("\n[Stage 1/3] Extracting Scientific & Visual Features...")
    feat_collection = process_features()

    print("\n[Stage 2/3] Compiling Master Dataset Manifest...")
    generate_master_manifest()

    print("\n[Stage 3/3] Generating Unified Audio Score & WAV Audio...")
    score_manifest = generate_all_sonification_modes()

    print("\n" + "=" * 65)
    print("  PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
    print(f"  Frames processed: {feat_collection['totalFrames']}")
    print(f"  Audio score events: {score_manifest['eventsCount']}")
    print("=" * 65)
    return 0

if __name__ == "__main__":
    sys.exit(run_full_pipeline())
