import os
import urllib.request
import sys
import cv2

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)

TARGET_DIR = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "dyamond-co2")
FRAMES_DIR = os.path.join(TARGET_DIR, "frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

ASSETS = [
    # 1. Science On A Sphere Full-Color Equirectangular Composite Video (27.16 MB)
    (
        "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005436/soscomp_1-29-2025a_1024p30.mp4",
        os.path.join(TARGET_DIR, "chunk_dyamond_co2.mp4")
    ),
    # 2. Official Scientific PPM Colorbar Legend (0.05 MB)
    (
        "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005436/dyamondCbar_6-27-2024a.png",
        os.path.join(TARGET_DIR, "dyamond_colorbar.png")
    ),
    # 3. High-Definition Global Baseline Still (0.35 MB)
    (
        "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005436/dyamondPointCloud_1-29-2025a_dyamond_co2_sos_surface_8k.00001_web.png",
        os.path.join(TARGET_DIR, "dyamond_co2_globe_2k.png")
    )
]

def download_file(url, dest_path):
    print(f"Downloading {url} -> {dest_path}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest_path, "wb") as f:
        total_size = int(resp.headers.get("Content-Length", 0))
        downloaded = 0
        chunk_size = 1024 * 256
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            f.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                percent = (downloaded / total_size) * 100
                print(f"\r  Progress: {downloaded / (1024*1024):.2f} MB / {total_size / (1024*1024):.2f} MB ({percent:.1f}%)", end="", flush=True)
        print("\n  Download complete.")

def extract_frames(video_path, output_dir, count=20):
    print(f"\nExtracting {count} sequential frames from {video_path}...")
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    duration = total_frames / fps
    print(f"Video Stats: {total_frames} frames, {fps:.1f} FPS, {duration:.2f}s duration")

    step = max(1, total_frames // count)
    saved = 0
    for i in range(0, total_frames, step):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = cap.read()
        if ret and saved < count:
            saved += 1
            out_file = os.path.join(output_dir, f"frame_{saved:04d}.jpg")
            cv2.imwrite(out_file, frame)
            print(f"  Saved frame {saved:02d}/{count}: {out_file} (t={(i/fps):.2f}s)")
    cap.release()
    print("Frame extraction complete.")

if __name__ == "__main__":
    for url, dest in ASSETS:
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f"File already exists: {dest} ({os.path.getsize(dest)/(1024*1024):.2f} MB)")
        else:
            download_file(url, dest)
            
    video_dest = os.path.join(TARGET_DIR, "chunk_dyamond_co2.mp4")
    if os.path.exists(video_dest):
        extract_frames(video_dest, FRAMES_DIR, count=20)
