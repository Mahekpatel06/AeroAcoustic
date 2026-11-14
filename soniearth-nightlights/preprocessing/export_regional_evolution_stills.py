import cv2
import os

ASSETS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "nasa_svs")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "soniearth-web", "public", "datasets", "night-lights")
ANNUAL_DIR = os.path.join(PUBLIC_DIR, "annual")
REGIONAL_DIR = os.path.join(PUBLIC_DIR, "regional")

# 1. India 2012 & 2023
i12 = cv2.imread(os.path.join(ASSETS_DIR, "india_2012.jpg"))
i23 = cv2.imread(os.path.join(ASSETS_DIR, "india_2023.jpg"))
if i12 is not None and i23 is not None:
    cv2.imwrite(os.path.join(REGIONAL_DIR, "india_2012.jpg"), cv2.resize(i12, (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    cv2.imwrite(os.path.join(REGIONAL_DIR, "india_2023.jpg"), cv2.resize(i23, (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("Saved india_2012.jpg and india_2023.jpg")

# 2. Ukraine 2012 & 2023
u12 = cv2.imread(os.path.join(ASSETS_DIR, "ukraine_2012.jpg"))
u23 = cv2.imread(os.path.join(ASSETS_DIR, "ukraine_2023.jpg"))
if u12 is not None and u23 is not None:
    cv2.imwrite(os.path.join(REGIONAL_DIR, "ukraine_2012.jpg"), cv2.resize(u12, (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    cv2.imwrite(os.path.join(REGIONAL_DIR, "ukraine_2023.jpg"), cv2.resize(u23, (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
    print("Saved ukraine_2012.jpg and ukraine_2023.jpg")

# 3. Western Europe & Mediterranean from Annual Maps
map_12 = cv2.imread(os.path.join(ANNUAL_DIR, "year_2012.jpg"))
map_23 = cv2.imread(os.path.join(ANNUAL_DIR, "year_2023.jpg"))
H, W = map_12.shape[:2]

# Europe
y1_eu, y2_eu = int(H * 0.14), int(H * 0.40)
x1_eu, x2_eu = int(W * 0.44), int(W * 0.58)
cv2.imwrite(os.path.join(REGIONAL_DIR, "europe_2012.jpg"), cv2.resize(map_12[y1_eu:y2_eu, x1_eu:x2_eu], (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
cv2.imwrite(os.path.join(REGIONAL_DIR, "europe_2023.jpg"), cv2.resize(map_23[y1_eu:y2_eu, x1_eu:x2_eu], (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
print("Saved europe_2012.jpg and europe_2023.jpg")

# Mediterranean
y1_med, y2_med = int(H * 0.25), int(H * 0.43)
x1_med, x2_med = int(W * 0.54), int(W * 0.65)
cv2.imwrite(os.path.join(REGIONAL_DIR, "mediterranean_2012.jpg"), cv2.resize(map_12[y1_med:y2_med, x1_med:x2_med], (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
cv2.imwrite(os.path.join(REGIONAL_DIR, "mediterranean_2023.jpg"), cv2.resize(map_23[y1_med:y2_med, x1_med:x2_med], (2560, 1440)), [int(cv2.IMWRITE_JPEG_QUALITY), 90])
print("Saved mediterranean_2012.jpg and mediterranean_2023.jpg")

print("All regional 2012 and 2023 individual stills exported successfully!")
