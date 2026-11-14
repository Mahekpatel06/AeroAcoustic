import urllib.request
import re
import json

def inspect_next_data(svs_id):
    url = f"https://svs.gsfc.nasa.gov/{svs_id}/"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return

    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.+?)</script>', html)
    if match:
        data = json.loads(match.group(1))
        page_props = data.get("props", {}).get("pageProps", {})
        print(f"=== SVS #{svs_id} ===")
        print("PageProps keys:", list(page_props.keys()))
        vis = page_props.get("visualization") or page_props.get("entry") or page_props
        if isinstance(vis, dict):
            print("Title:", vis.get("title"))
            media_groups = vis.get("media_groups") or vis.get("mediaGroups") or []
            print("Media groups count:", len(media_groups))
            for mg in media_groups:
                print(f"  Group ID: {mg.get('id')}, Name: {mg.get('name') or mg.get('title')}")
                for asset in mg.get("assets", mg.get("media", []))[:3]:
                    print(f"     Asset: {asset.get('name') or asset.get('title')}, URL: {asset.get('url') or asset.get('download_url')}")
    else:
        print(f"No __NEXT_DATA__ found for SVS #{svs_id}")

if __name__ == "__main__":
    for svs_id in [5276, 5475, 5634]:
        inspect_next_data(svs_id)
