"""
download_asset.py - Downloads the official NASA SVS #5313 H.265 MP4 asset.
"""
import requests
import os
import sys

URL = "https://svs.gsfc.nasa.gov/vis/a000000/a005300/a005313/nightlights_flat_series_and_change_wZooms_13_EIC_2160p30_h265.mp4"
DEST = "soniearth-nightlights/assets/original/nightlights_svs5313.mp4"

def download_video():
    os.makedirs(os.path.dirname(DEST), exist_ok=True)
    if os.path.exists(DEST) and os.path.getsize(DEST) > 30000000:
        print(f"File already exists: {DEST} ({os.path.getsize(DEST)} bytes)")
        return True

    print(f"Starting download from: {URL}")
    print(f"Saving to: {DEST}")
    try:
        response = requests.get(URL, stream=True, timeout=30)
        response.raise_for_status()
        total_size = int(response.headers.get('content-length', 0))
        downloaded = 0
        chunk_size = 1024 * 1024  # 1 MB

        with open(DEST, 'wb') as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        pct = (downloaded / total_size) * 100
                        print(f"Downloaded {downloaded / 1024 / 1024:.2f} MB / {total_size / 1024 / 1024:.2f} MB ({pct:.1f}%)")

        print("Download complete!")
        return True
    except Exception as e:
        print(f"Download failed: {e}")
        return False

if __name__ == "__main__":
    download_video()
