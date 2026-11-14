import os
import urllib.request
import sys

DOWNLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

ASSETS = {
    # 1. SVS 5475: Equirectangular SOS Video for 3D Globe & Flat map (22 MB)
    "sos_globe_2012_2024.mp4": "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005475/nightlights_2012-2024_KSC_04_plus2_2048x1024_30p_sos.mp4",
    # 2. SVS 5475: 2K Equirectangular Still (1.1 MB)
    "sos_globe_2k.png": "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005475/nightlights_2012-2024_KSC_SOS_04_plus2_0900_2k.png",
    # 3. SVS 5276: Global Flat Change 8K Still (2.5 MB)
    "global_change_8k.jpg": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_change_still_8k.00700.jpg",
    # 4. SVS 5276: Flat Series Stills 2012-2023 (1.6 MB)
    "flat_series_stills.mp4": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_2160p3_h265.mp4",
    # 5. SVS 5276: India Stills & Change
    "india_2012.jpg": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_india_8k_compare.02012.jpg",
    "india_2023.jpg": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_india_8k_compare.02023.jpg",
    "india_change.jpg": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_india_8k.change.jpg",
    # 6. SVS 5276: Ukraine Stills & Change
    "ukraine_2012.jpg": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_ukraine_8k_compare.02012.jpg",
    "ukraine_2023.jpg": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_ukraine_8k_compare.02023.jpg",
    "ukraine_change.jpg": "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_ukraine_8k.change.jpg",
    # 7. SVS 5634: Cumulative Change (16.3 MB)
    "svs_5634_cumulative_change.mp4": "https://svs.gsfc.nasa.gov/vis/a000000/a005600/a005634/nightlights_cumulative_change_1080p60.mp4"
}

def download_file(name, url):
    dest = os.path.join(DOWNLOAD_DIR, name)
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        print(f"Already downloaded: {name} ({os.path.getsize(dest)} bytes)")
        return dest
    print(f"Downloading {name} from {url}...")
    headers = {"User-Agent": "Mozilla/5.0"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=60) as resp, open(dest, "wb") as f:
        total = int(resp.headers.get("Content-Length", 0))
        downloaded = 0
        while True:
            chunk = resp.read(65536)
            if not chunk:
                break
            f.write(chunk)
            downloaded += len(chunk)
            if total > 0:
                percent = (downloaded / total) * 100
                sys.stdout.write(f"\r  {downloaded}/{total} bytes ({percent:.1f}%)")
                sys.stdout.flush()
    print(f"\nDone: {name} -> {dest}")
    return dest

if __name__ == "__main__":
    for name, url in ASSETS.items():
        try:
            download_file(name, url)
        except Exception as e:
            print(f"Error downloading {name}: {e}")
