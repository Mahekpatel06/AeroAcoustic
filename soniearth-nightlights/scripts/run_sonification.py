"""
run_sonification.py
Runs the sonification engine to synthesize audio from precomputed features.
"""
import sys
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from sonification.generate_audio import generate_all_sonification_modes

if __name__ == "__main__":
    generate_all_sonification_modes()
