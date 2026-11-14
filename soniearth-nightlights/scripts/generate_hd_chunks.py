"""
generate_hd_chunks.py
Extracts crystal-clear 1920x540 Full HD WebM clips from the original 8K NASA SVS #5313 video.
Directly replaces the 270p (960x270) clips in soniearth-web/public/datasets/night-lights/

Frame splits:
- Mode A (Annual History): Frames 0 to 360 (12.00s @ 30 FPS)
- Mode B (Decadal Change): Frames 360 to 705 (11.50s @ 30 FPS)
- Mode C (Regional Insets): Frames 705 to 1300 (19.83s @ 30 FPS)
"""
import cv2
import os
import sys
import time

SRC_VIDEO = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets",
    "original",
    "nightlights_svs5313.mp4"
)
DEST_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "soniearth-web",
    "public",
    "datasets",
    "night-lights"
)

TARGET_RES = (1920, 540)
FPS = 30.0

MODES = [
    {
        "name": "chunk_mode_a.webm",
        "start_frame": 0,
        "end_frame": 360,
        "desc": "Mode A: Annual Evolution (2012-2023)"
    },
    {
        "name": "chunk_mode_b.webm",
        "start_frame": 360,
        "end_frame": 705,
        "desc": "Mode B: Decadal Change Map (Purple/Orange)"
    },
    {
        "name": "chunk_mode_c.webm",
        "start_frame": 705,
        "end_frame": 1300,
        "desc": "Mode C: Regional Insets (India, Ukraine, Europe, Levant)"
    }
]

def render_hd_chunks():
    if not os.path.exists(SRC_VIDEO):
        print(f"Error: Source video not found at {SRC_VIDEO}")
        sys.exit(1)

    os.makedirs(DEST_DIR, exist_ok=True)
    fourcc = cv2.VideoWriter_fourcc(*'VP80')

    print("==================================================")
    print("  SONIEARTH HD CHUNK GENERATOR (1920x540 VP8)")
    print("==================================================")
    print(f"Source: {SRC_VIDEO}")
    print(f"Destination: {DEST_DIR}")

    total_start = time.time()

    for mode in MODES:
        t0 = time.time()
        out_path = os.path.join(DEST_DIR, mode["name"])
        expected_frames = mode["end_frame"] - mode["start_frame"]

        print(f"\nRendering {mode['desc']}...")
        print(f"Frames {mode['start_frame']} -> {mode['end_frame']} ({expected_frames} frames @ {FPS} FPS)")

        cap = cv2.VideoCapture(SRC_VIDEO)
        cap.set(cv2.CAP_PROP_POS_FRAMES, mode["start_frame"])

        out = cv2.VideoWriter(out_path, fourcc, FPS, TARGET_RES)
        if not out.isOpened():
            print(f"Failed to open VideoWriter for {out_path}")
            cap.release()
            continue

        written = 0
        for f_idx in range(mode["start_frame"], mode["end_frame"]):
            ret, frame = cap.read()
            if not ret:
                print(f"Premature end of stream at frame {f_idx}")
                break
            
            # High-quality area interpolation for razor-sharp downscaling from 7680x2160
            resized = cv2.resize(frame, TARGET_RES, interpolation=cv2.INTER_AREA)
            out.write(resized)
            written += 1

        cap.release()
        out.release()

        dur = time.time() - t0
        file_sz = os.path.getsize(out_path) / (1024 * 1024)
        print(f"Done: {mode['name']} ({written} frames in {dur:.1f}s, {file_sz:.2f} MB)")

    total_dur = time.time() - total_start
    print(f"\nAll HD chunks generated successfully in {total_dur:.1f}s!")

if __name__ == "__main__":
    render_hd_chunks()
