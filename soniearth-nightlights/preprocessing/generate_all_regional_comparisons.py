import cv2
import numpy as np
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "soniearth-web", "public", "datasets", "night-lights")
ANNUAL_DIR = os.path.join(PUBLIC_DIR, "annual")
REGIONAL_DIR = os.path.join(PUBLIC_DIR, "regional")

# 1. Load 2012 and 2023 full annual flat maps
img_2012 = cv2.imread(os.path.join(ANNUAL_DIR, "year_2012.jpg"))
img_2023 = cv2.imread(os.path.join(ANNUAL_DIR, "year_2023.jpg"))

H, W = img_2012.shape[:2] # 1440, 2560

# Function to make a crisp side-by-side comparison with labels and divider
def make_comparison(crop_12, crop_23, label_left="2012", label_right="2023"):
    target_w, target_h = 1280, 1440
    c12 = cv2.resize(crop_12, (target_w, target_h), interpolation=cv2.INTER_AREA)
    c23 = cv2.resize(crop_23, (target_w, target_h), interpolation=cv2.INTER_AREA)
    
    # Add subtle divider line
    combo = np.hstack([c12, c23])
    combo[:, target_w-2:target_w+2] = [220, 220, 220] # White divider line
    
    # Add crisp banner labels
    font = cv2.FONT_HERSHEY_SIMPLEX
    # 2012 Tag
    cv2.rectangle(combo, (30, 30), (220, 80), (15, 23, 42), -1)
    cv2.rectangle(combo, (30, 30), (220, 80), (56, 189, 248), 2)
    cv2.putText(combo, f"YEAR {label_left}", (45, 66), font, 0.9, (255, 255, 255), 2, cv2.LINE_AA)
    
    # 2023 Tag
    cv2.rectangle(combo, (target_w + 30, 30), (target_w + 220, 80), (15, 23, 42), -1)
    cv2.rectangle(combo, (target_w + 30, 30), (target_w + 220, 80), (168, 85, 247), 2)
    cv2.putText(combo, f"YEAR {label_right}", (target_w + 45, 66), font, 0.9, (255, 255, 255), 2, cv2.LINE_AA)
    
    return combo

# 2. Western Europe (Lon -15 to +30, Lat +35 to +60)
# In 2560x1440:
y1_eu, y2_eu = int(H * 0.14), int(H * 0.40)
x1_eu, x2_eu = int(W * 0.44), int(W * 0.58)

eu_12 = img_2012[y1_eu:y2_eu, x1_eu:x2_eu]
eu_23 = img_2023[y1_eu:y2_eu, x1_eu:x2_eu]
eu_compare = make_comparison(eu_12, eu_23)
cv2.imwrite(os.path.join(REGIONAL_DIR, "europe_compare.jpg"), eu_compare, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
print("Saved europe_compare.jpg")

# 3. Eastern Mediterranean / Levant (Lat 28 to 40, Lon 24 to 45)
y1_med, y2_med = int(H * 0.25), int(H * 0.43)
x1_med, x2_med = int(W * 0.54), int(W * 0.65)

med_12 = img_2012[y1_med:y2_med, x1_med:x2_med]
med_23 = img_2023[y1_med:y2_med, x1_med:x2_med]
med_compare = make_comparison(med_12, med_23)
cv2.imwrite(os.path.join(REGIONAL_DIR, "mediterranean_compare.jpg"), med_compare, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
print("Saved mediterranean_compare.jpg")

# 4. Overview (All Insets) comparison
ind_12 = cv2.imread(os.path.join(ASSETS_DIR, "india_2012.jpg"))
ind_23 = cv2.imread(os.path.join(ASSETS_DIR, "india_2023.jpg"))
ukr_12 = cv2.imread(os.path.join(ASSETS_DIR, "ukraine_2012.jpg"))
ukr_23 = cv2.imread(os.path.join(ASSETS_DIR, "ukraine_2023.jpg"))

# Update India & Ukraine comparison with the same styled labels
if ind_12 is not None and ind_23 is not None:
    ind_comp = make_comparison(ind_12, ind_23)
    cv2.imwrite(os.path.join(REGIONAL_DIR, "india_compare.jpg"), ind_comp, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    print("Updated india_compare.jpg with styled labels")

if ukr_12 is not None and ukr_23 is not None:
    ukr_comp = make_comparison(ukr_12, ukr_23)
    cv2.imwrite(os.path.join(REGIONAL_DIR, "ukraine_compare.jpg"), ukr_comp, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
    print("Updated ukraine_compare.jpg with styled labels")

# Overview: full 2012 vs full 2023
overview_comp = make_comparison(img_2012, img_2023)
cv2.imwrite(os.path.join(REGIONAL_DIR, "overview_compare.jpg"), overview_comp, [int(cv2.IMWRITE_JPEG_QUALITY), 92])
print("Saved overview_compare.jpg")

# 5. Create 3D Globe Optimized 2K Texture (2048x1024) for Decadal Change Map
global_change_raw = cv2.imread(os.path.join(PUBLIC_DIR, "global_change.jpg"))
if global_change_raw is not None:
    globe_change_2k = cv2.resize(global_change_raw, (2048, 1024), interpolation=cv2.INTER_AREA)
    cv2.imwrite(os.path.join(PUBLIC_DIR, "globe_change_2k.jpg"), globe_change_2k, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
    print("Saved globe_change_2k.jpg (2048x1024, optimized for WebGL 3D globe)")

print("All regional comparisons and 3D globe textures generated successfully!")
