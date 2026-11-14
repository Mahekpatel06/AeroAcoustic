import cv2
import os

assets = [
    "flat_series_stills.mp4",
    "sos_globe_2012_2024.mp4"
]

base = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs")

for name in assets:
    p = os.path.join(base, name)
    if os.path.exists(p):
        cap = cv2.VideoCapture(p)
        count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        dur = count / fps if fps > 0 else 0
        print(f"[{name}] {w}x{h}, {fps} fps, {count} frames, {dur:.2f}s")
        cap.release()
