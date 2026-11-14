import cv2
import numpy as np
import os

video_path = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs", "sos_globe_2012_2024.mp4")
cap = cv2.VideoCapture(video_path)
fps = cap.get(cv2.CAP_PROP_FPS) # 30.0
total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) # 1260

print(f"Total frames: {total}, fps: {fps}, dur: {total/fps:.1f}s")

# Sample every 2 seconds
for sec in range(0, 42, 2):
    f_idx = int(sec * fps)
    cap.set(cv2.CAP_PROP_POS_FRAMES, f_idx)
    ret, frame = cap.read()
    if ret:
        # Check purple/orange pixels vs yellow pixels
        # Purple in BGR: high R and B, low G
        # Orange in BGR: high R, medium G, low B
        # Yellow in BGR: high R and G, low B
        b, g, r = frame[:,:,0], frame[:,:,1], frame[:,:,2]
        mean_b = np.mean(b)
        mean_g = np.mean(g)
        mean_r = np.mean(r)
        print(f"t={sec:02d}s (f={f_idx}): R={mean_r:.1f}, G={mean_g:.1f}, B={mean_b:.1f}")

cap.release()
