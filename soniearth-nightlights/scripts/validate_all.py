"""
validate_all.py
Runs automated tests and schema verification across all SoniEarth pipeline outputs.
"""
import sys
import os
import unittest

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

def run_all_validations():
    print("=" * 65)
    print("  SONIEARTH PIPELINE VERIFICATION & TEST RUNNER")
    print("=" * 65)

    suite = unittest.defaultTestLoader.discover(
        start_dir=os.path.join(PROJECT_DIR, "tests"),
        pattern="test_*.py"
    )
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    if result.wasSuccessful():
        print("\nAll unit and integration tests passed successfully (0 errors, 0 failures).")
        return 0
    else:
        print(f"\nTests failed: {len(result.failures)} failures, {len(result.errors)} errors.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_validations())
