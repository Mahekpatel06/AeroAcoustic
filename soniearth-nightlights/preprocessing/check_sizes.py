import urllib.request

targets = [
    # SVS 5475 SOS
    "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005475/nightlights_2012-2024_KSC_04_plus2_2048x1024_30p_sos.mp4",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005475/nightlights_2012-2024_KSC_SOS_04_plus2_0900_2k.png",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005475/nightlights_KSC_SOS_stills.00281.png",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005400/a005475/nightlights_KSC_SOS_stills.00793.png",
    
    # SVS 5276 Flat & Changes
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_change_still_8k.00700.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_8k_compare.02012.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_8k_compare.02023.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_india_8k.change.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_india_8k_compare.02012.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_india_8k_compare.02023.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_ukraine_8k.change.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_ukraine_8k_compare.02012.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_flat_series_stills_ukraine_8k_compare.02023.jpg",
    "https://svs.gsfc.nasa.gov/vis/a000000/a005200/a005276/nightlights_change_2012-2023_globe_02.mp4",
    
    # SVS 5634
    "https://svs.gsfc.nasa.gov/vis/a000000/a005600/a005634/nightlights_cumulative_change_1080p60.mp4"
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
