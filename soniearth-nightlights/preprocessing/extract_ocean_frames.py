import cv2
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)

video_path = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "ocean-currents", "chunk_ocean_currents.webm")
output_dir = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "ocean-currents", "frames")
os.makedirs(output_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
duration = total_frames / fps
print(f"Total Frames: {total_frames}, FPS: {fps}, Duration: {duration:.2f}s")

# Extract 20 evenly-spaced frames
step = max(1, total_frames // 20)
saved = 0
for i in range(0, total_frames, step):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i)
    ret, frame = cap.read()
    if ret and saved < 20:
        saved += 1
        out_file = os.path.join(output_dir, f"frame_{saved:04d}.jpg")
        cv2.imwrite(out_file, frame)
        print(f"Saved {out_file} at t={(i/fps):.2f}s")

cap.release()
print(f"Frame extraction complete: {saved} frames saved.")
