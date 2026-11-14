import urllib.request
import re

for svs_id in [5276, 5475, 5634]:
    url = f"https://svs.gsfc.nasa.gov/{svs_id}/"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')
    media = set(re.findall(r'(/vis/a000000/[^\s"\'<>]+\.(?:mp4|mov|png|jpg|tif|tar))', html))
    print(f"\n=== SVS #{svs_id} ({len(media)} files) ===")
    for m in sorted(media):
        print(m)
