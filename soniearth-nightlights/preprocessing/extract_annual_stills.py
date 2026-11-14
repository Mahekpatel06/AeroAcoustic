import cv2
import os

video_path = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs", "flat_series_stills.mp4")
out_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "annual_years")
os.makedirs(out_dir, exist_ok=True)

cap = cv2.VideoCapture(video_path)
frame_idx = 0
years = [2012 + i for i in range(12)]

while True:
    ret, frame = cap.read()
    if not ret:
        break
    year = years[frame_idx] if frame_idx < len(years) else 2012 + frame_idx
    out_path = os.path.join(out_dir, f"year_{year}.jpg")
    # Resize to 1920x1080 for web efficiency and fast loading
    h, w = frame.shape[:2]
    resized = cv2.resize(frame, (1920, 1080), interpolation=cv2.INTER_AREA)
    cv2.imwrite(out_path, resized, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    print(f"Extracted Frame {frame_idx} -> Year {year} ({resized.shape[1]}x{resized.shape[0]})")
    frame_idx += 1

cap.release()
print(f"Total extracted: {frame_idx} annual frames.")
