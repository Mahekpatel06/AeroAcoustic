"""
inspect_video.py - Inspects NASA SVS #5313 and media assets.
"""
import requests
import re
import json
import os
import sys

URL = "https://svs.gsfc.nasa.gov/5313/"

def fetch_and_inspect():
    print(f"Fetching {URL}...")
    try:
        response = requests.get(URL, timeout=15)
        response.raise_for_status()
    except Exception as e:
        print(f"Error fetching URL: {e}")
        return None

    html = response.text
    title_match = re.search(r'<title>(.*?)</title>', html, re.I | re.S)
    title = title_match.group(1).strip() if title_match else "NASA SVS 5313"

    # Extract all media links
    media_links = re.findall(r'href=["\']([^"\']+\.(?:mp4|mov|webm|png|jpg|tif|m4v))["\']', html, re.I)
    
    unique_links = sorted(list(set(media_links)))
    
    mp4_links = [l for l in unique_links if l.lower().endswith('.mp4')]
    mov_links = [l for l in unique_links if l.lower().endswith('.mov')]
    image_links = [l for l in unique_links if l.lower().endswith(('.png', '.jpg', '.tif'))]

    # Normalize relative URLs
    def normalize(u):
        if u.startswith('/'):
            return "https://svs.gsfc.nasa.gov" + u
        elif not u.startswith('http'):
            return "https://svs.gsfc.nasa.gov/5313/" + u
        return u

    result = {
        "dataset_id": "NASA SVS 5313",
        "title": title,
        "source_url": URL,
        "total_media_links": len(unique_links),
        "mp4_assets": [normalize(u) for u in mp4_links],
        "mov_assets": [normalize(u) for u in mov_links],
        "sample_images": [normalize(u) for u in image_links[:10]]
    }

    # Save to reports/media_metadata.json
    os.makedirs("reports", exist_ok=True)
    with open("reports/media_metadata.json", "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"Successfully inspected SVS #5313. Found {len(mp4_links)} MP4 assets, {len(mov_links)} MOV assets.")
    for mp4 in result["mp4_assets"]:
        print(f"  MP4: {mp4}")

    return result

if __name__ == "__main__":
    fetch_and_inspect()
