import urllib.request

targets = [
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_2160p3_h265.mp4",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_2012-2023_change_flat_2160p30.mp4",
]

for url in targets:
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            cl = resp.headers.get("Content-Length", "unknown")
            mb = f"{int(cl)/(1024*1024):.2f} MB" if cl.isdigit() else cl
            print(f"OK ({mb}): {url.split('/')[-1]}")
    except Exception as e:
        print(f"ERR ({e}): {url.split('/')[-1]}")
