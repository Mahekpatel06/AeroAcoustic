"""
run_pipeline.py
One-click reproducible runner for the complete SoniEarth Night Lights pipeline.
"""
import sys
import os

# Add project root to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from preprocessing.download_asset import download_video
from preprocessing.identify_phases import identify_and_save_phases
from preprocessing.extract_frames import extract_optimized_frames
from preprocessing.extract_features import process_features
from preprocessing.generate_manifest import generate_master_manifest
from sonification.generate_audio import generate_all_sonification_modes

def run_full_pipeline():
    print("=" * 65)
    print("  SONIEARTH — NASA SVS #5313 END-TO-END PIPELINE")
    print("=" * 65)

    print("\n[Stage 1/6] Verifying / Downloading NASA Master Asset...")
    download_video()

    print("\n[Stage 2/6] Identifying Video Phases & Timelines...")
    identify_and_save_phases()

    print("\n[Stage 3/6] Extracting Optimized Key Frames across Phases...")
    extract_optimized_frames()

    print("\n[Stage 4/6] Extracting Scientific & Visual Features...")
    process_features()

    print("\n[Stage 5/6] Compiling Dataset Manifest...")
    generate_master_manifest()

    print("\n[Stage 6/6] Generating 3 Sonification Audio Demonstrations...")
    audio_results = generate_all_sonification_modes()

    print("\n" + "=" * 65)
    print("  PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
    print(f"  Ambient Audio:  {audio_results['modeA']}")
    print(f"  Change Audio:   {audio_results['modeB']}")
    print(f"  Regional Audio: {audio_results['modeC']}")
    print("=" * 65)

if __name__ == "__main__":
    run_full_pipeline()
