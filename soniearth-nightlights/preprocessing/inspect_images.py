import cv2
import os

base = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs")
for f in os.listdir(base):
    if f.endswith((".jpg", ".png")):
        p = os.path.join(base, f)
        img = cv2.imread(p)
        if img is not None:
            print(f"{f}: {img.shape[1]}x{img.shape[0]}")
