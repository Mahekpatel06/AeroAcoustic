import os
import urllib.request
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)

TARGET_DIR = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "ocean-currents")
FRAMES_DIR = os.path.join(TARGET_DIR, "frames")
os.makedirs(FRAMES_DIR, exist_ok=True)

ASSETS = [
    (
        "https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/ecco2_sst_flow.webmhd.webm",
        os.path.join(TARGET_DIR, "chunk_ocean_currents.webm")
    ),
    (
        "https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/flat_global_ecco2_2028x1024.25000.jpg",
        os.path.join(TARGET_DIR, "ocean_currents_globe_2k.jpg")
    ),
    (
        "https://svs.gsfc.nasa.gov/vis/a000000/a003900/a003912/sst_ecco2_cbar.png",
        os.path.join(TARGET_DIR, "sst_colorbar.png")
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
                print(f"\r  Downloaded: {downloaded / (1024*1024):.2f} MB / {total_size / (1024*1024):.2f} MB ({percent:.1f}%)", end="", flush=True)
        print("\n  Done.")

if __name__ == "__main__":
    for url, dest in ASSETS:
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f"File already exists: {dest} ({os.path.getsize(dest)/(1024*1024):.2f} MB)")
        else:
            download_file(url, dest)
