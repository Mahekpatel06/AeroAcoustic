import cv2
import numpy as np
import os
import shutil

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "soniearth-web", "public", "datasets", "night-lights")
ANNUAL_DIR = os.path.join(PUBLIC_DIR, "annual")
REGIONAL_DIR = os.path.join(PUBLIC_DIR, "regional")

os.makedirs(ANNUAL_DIR, exist_ok=True)
os.makedirs(REGIONAL_DIR, exist_ok=True)

# 1. Extract 12 Annual Stills (2012 to 2023)
flat_series_path = os.path.join(ASSETS_DIR, "flat_series_stills.mp4")
print("1. Processing 12 Annual Stills...")
cap = cv2.VideoCapture(flat_series_path)
years = [2012 + i for i in range(12)]
annual_frames = []

for i in range(12):
    ret, frame = cap.read()
    if not ret:
        break
    year = years[i]
    # Resize to 2560x1440 for ultra-crisp web rendering
    resized = cv2.resize(frame, (2560, 1440), interpolation=cv2.INTER_AREA)
    out_file = os.path.join(ANNUAL_DIR, f"year_{year}.jpg")
    cv2.imwrite(out_file, resized, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    annual_frames.append(resized)
    print(f"   -> Saved year_{year}.jpg ({resized.shape[1]}x{resized.shape[0]})")
cap.release()

# 2. Build 12-second Smooth Video for Mode A (1 second per year, 30 fps = 360 frames total)
print("\n2. Encoding smooth 12-second Mode A video (annual_timeline_12s.mp4)...")
video_out_path = os.path.join(PUBLIC_DIR, "annual_timeline_12s.mp4")
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out_vid = cv2.VideoWriter(video_out_path, fourcc, 30.0, (1920, 1080))

for year_idx in range(12):
    # Resize to 1920x1080 for video
    f_1080 = cv2.resize(annual_frames[year_idx], (1920, 1080), interpolation=cv2.INTER_AREA)
    # Write 30 frames for 1 full second
    for _ in range(30):
        out_vid.write(f_1080)

out_vid.release()
print(f"   -> Created {video_out_path} (12.0s, 360 frames, 30fps)")

# 3. Global Decadal Change Map (Mode B)
print("\n3. Processing Global Change Map...")
global_change_raw = cv2.imread(os.path.join(ASSETS_DIR, "global_change_8k.jpg"))
if global_change_raw is not None:
    # Save optimized 3840x2160 version
    gc_resized = cv2.resize(global_change_raw, (3840, 2160), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(PUBLIC_DIR, "global_change.jpg"), gc_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved global_change.jpg (3840x2160)")

# 4. Copy 2K Equirectangular Map for 3D Globe
sos_2k_src = os.path.join(ASSETS_DIR, "sos_globe_2k.png")
if os.path.exists(sos_2k_src):
    shutil.copyfile(sos_2k_src, os.path.join(PUBLIC_DIR, "sos_globe_2k.png"))
    print("   -> Copied sos_globe_2k.png")

# Copy SOS globe video for 3D globe video texture
sos_video_src = os.path.join(ASSETS_DIR, "sos_globe_2012_2024.mp4")
if os.path.exists(sos_video_src):
    shutil.copyfile(sos_video_src, os.path.join(PUBLIC_DIR, "sos_globe.mp4"))
    print("   -> Copied sos_globe.mp4 (22MB)")

# 5. Process Mode C Regional Assets
print("\n5. Processing Mode C Regional Assets...")

# India
india_raw = cv2.imread(os.path.join(ASSETS_DIR, "india_change.jpg"))
if india_raw is not None:
    ind_res = cv2.resize(india_raw, (2560, 1440), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(REGIONAL_DIR, "india_change.jpg"), ind_res, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved india_change.jpg")

india_2012 = cv2.imread(os.path.join(ASSETS_DIR, "india_2012.jpg"))
india_2023 = cv2.imread(os.path.join(ASSETS_DIR, "india_2023.jpg"))
if india_2012 is not None and india_2023 is not None:
    # Create side-by-side comparison (2012 left, 2023 right)
    h, w = 1080, 960
    i12 = cv2.resize(india_2012, (w, h), interpolation=cv2.INTER_AREA)
    i23 = cv2.resize(india_2023, (w, h), interpolation=cv2.INTER_AREA)
    compare = np.hstack([i12, i23])
    # Add subtle divider line
    compare[:, 958:962] = [200, 200, 200]
    cv2.imwrite(os.path.join(REGIONAL_DIR, "india_compare.jpg"), compare, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved india_compare.jpg")

# Ukraine
ukr_raw = cv2.imread(os.path.join(ASSETS_DIR, "ukraine_change.jpg"))
if ukr_raw is not None:
    ukr_res = cv2.resize(ukr_raw, (2560, 1440), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(REGIONAL_DIR, "ukraine_change.jpg"), ukr_res, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved ukraine_change.jpg")

ukr_2012 = cv2.imread(os.path.join(ASSETS_DIR, "ukraine_2012.jpg"))
ukr_2023 = cv2.imread(os.path.join(ASSETS_DIR, "ukraine_2023.jpg"))
if ukr_2012 is not None and ukr_2023 is not None:
    h, w = 1080, 960
    u12 = cv2.resize(ukr_2012, (w, h), interpolation=cv2.INTER_AREA)
    u23 = cv2.resize(ukr_2023, (w, h), interpolation=cv2.INTER_AREA)
    compare_u = np.hstack([u12, u23])
    compare_u[:, 958:962] = [200, 200, 200]
    cv2.imwrite(os.path.join(REGIONAL_DIR, "ukraine_compare.jpg"), compare_u, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved ukraine_compare.jpg")

# Western Europe (Crop from global change 8K)
# In 7680x4320 equirectangular: Europe is roughly lon -15 to +30, lat +35 to +60
# Y: 90 to -90. Lat 60 is y = (90-60)/180 * 4320 = 720. Lat 35 is y = (90-35)/180 * 4320 = 1320
# X: -180 to +180. Lon -15 is x = (-15+180)/360 * 7680 = 3520. Lon 30 is x = (30+180)/360 * 7680 = 4480
if global_change_raw is not None:
    H, W = global_change_raw.shape[:2]
    # Europe
    y1_eu, y2_eu = int(H * 0.14), int(H * 0.35)
    x1_eu, x2_eu = int(W * 0.44), int(W * 0.58)
    crop_eu = global_change_raw[y1_eu:y2_eu, x1_eu:x2_eu]
    crop_eu_res = cv2.resize(crop_eu, (2560, 1440), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(REGIONAL_DIR, "europe_change.jpg"), crop_eu_res, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved europe_change.jpg")

    # Eastern Mediterranean / Levant
    # Lat 28 to 40, Lon 24 to 45
    y1_med, y2_med = int(H * 0.25), int(H * 0.40)
    x1_med, x2_med = int(W * 0.54), int(W * 0.65)
    crop_med = global_change_raw[y1_med:y2_med, x1_med:x2_med]
    crop_med_res = cv2.resize(crop_med, (2560, 1440), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(REGIONAL_DIR, "mediterranean_change.jpg"), crop_med_res, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved mediterranean_change.jpg")

    # 4-quadrant overview
    top = np.hstack([cv2.resize(ind_res, (960, 540)), cv2.resize(ukr_res, (960, 540))])
    bottom = np.hstack([cv2.resize(crop_eu_res, (960, 540)), cv2.resize(crop_med_res, (960, 540))])
    overview = np.vstack([top, bottom])
    cv2.imwrite(os.path.join(REGIONAL_DIR, "overview_change.jpg"), overview, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("   -> Saved overview_change.jpg")

print("\nAll assets processed and organized successfully!")
