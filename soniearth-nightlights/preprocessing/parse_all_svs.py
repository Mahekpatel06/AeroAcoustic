import urllib.request
import re
import json

def parse_svs(svs_id):
    url = f"https://svs.gsfc.nasa.gov/{svs_id}/"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        html = r.read().decode("utf-8", errors="ignore")

    print(f"\n==================== SVS #{svs_id} ====================")
    # Split by media_group_
    groups = re.split(r'id=[\'"]media_group_(\d+)[\'"]', html)
    # The first element is before any media group
    for i in range(1, len(groups), 2):
        mg_id = groups[i]
        mg_html = groups[i+1]
        
        # Find video source or poster
        video_srcs = re.findall(r'<source\s+src=[\'"]([^\'"]+)[\'"]', mg_html)
        posters = re.findall(r'poster=[\'"]([^\'"]+)[\'"]', mg_html)
        imgs = re.findall(r'<img\s+[^>]*src=[\'"]([^\'"]+)[\'"]', mg_html)
        # Find description / caption
        p_desc = re.findall(r'<p[^>]*class=[\'"][^\'"]*text-white[^\'"]*[\'"][^>]*>(.*?)</p>', mg_html, re.DOTALL)
        
        desc = ""
        if p_desc:
            desc = re.sub(r'\s+', ' ', p_desc[0]).strip()
        
        print(f"\n[Media Group #{mg_id}]")
        if desc:
            print(f"  Description: {desc[:120]}...")
        if video_srcs:
            for v in video_srcs[:2]:
                print(f"  Video: https://svs.gsfc.nasa.gov{v}")
        if posters:
            print(f"  Poster: https://svs.gsfc.nasa.gov{posters[0]}")
        if not video_srcs and imgs:
            for im in imgs[:2]:
                print(f"  Img: https://svs.gsfc.nasa.gov{im}")

if __name__ == "__main__":
    for svs_id in [5276, 5475, 5634]:
        parse_svs(svs_id)
