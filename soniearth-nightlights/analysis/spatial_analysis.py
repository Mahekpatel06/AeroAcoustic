"""
spatial_analysis.py
Performs 3x3 regional analysis on Earth night lights visualization frames.
Maps geographic positions to stereo panning and calculates localized statistics.
Crops the terrestrial map region to avoid video player metadata/banners.
Uses dataset-wide robust percentile and log-luminance scaling to prevent saturation.
"""
import numpy as np
import cv2
from sonification.scale_quantizer import quantize_to_pentatonic

# Calibrated dataset-wide percentiles (5th and 95th percentiles of terrestrial grid cells)
P_LOW = 0.0052
P_HIGH = 0.0557

def analyze_spatial_grid(frame_bgr, rows=3, cols=3):
    """
    Divides the terrestrial map portion of the frame into rows x cols grid and extracts regional features.
    """
    h, w = frame_bgr.shape[:2]

    # Convert BGR to Rec. 601 Luminance (0.0 to 1.0)
    b, g, r = frame_bgr[:, :, 0] / 255.0, frame_bgr[:, :, 1] / 255.0, frame_bgr[:, :, 2] / 255.0
    luma = 0.299 * r + 0.587 * g + 0.114 * b

    # If the frame is from the 960x270 video, crop out the top letterbox (y < 15) and bottom banner (y > 230)
    if h >= 200:
        y_start = int(h * (15.0 / 270.0))
        y_end = int(h * (230.0 / 270.0))
    else:
        y_start = 0
        y_end = h

    map_luma = luma[y_start:y_end, :]
    map_h, map_w = map_luma.shape[:2]

    grid_features = []
    region_names = [
        ["NW (North America)", "N (Europe & North Atlantic)", "NE (Northern Asia & Siberia)"],
        ["W (Central & South America)",  "C (Africa & Middle East)", "E (South & East Asia / India)"],
        ["SW (South Pacific)", "S (Southern Oceans & Antarctica)", "SE (Australia & Oceania)"]
    ]

    cell_h = map_h // rows
    cell_w = map_w // cols

    for r_idx in range(rows):
        for c_idx in range(cols):
            y1 = r_idx * cell_h
            y2 = (r_idx + 1) * cell_h if r_idx < rows - 1 else map_h
            x1 = c_idx * cell_w
            x2 = (c_idx + 1) * cell_w if c_idx < cols - 1 else map_w

            cell = map_luma[y1:y2, x1:x2]
            mean_b = float(np.mean(cell))
            median_b = float(np.median(cell))
            std_b = float(np.std(cell))
            bright_density = float(np.mean(cell > 0.08))

            # Pan from -0.75 (col 0: West) to 0.0 (col 1: Center) to +0.75 (col 2: East)
            pan = round((c_idx - 1.0) * 0.75, 2)
            reg_id = f"R{r_idx}_{c_idx}"
            reg_name = region_names[r_idx][c_idx]

            # Scaling with robust percentiles and log compression
            if mean_b <= 0.0:
                calibrated_score = 0.0
            elif mean_b >= 0.99:
                calibrated_score = 1.0
            else:
                norm = np.clip((mean_b - P_LOW) / (P_HIGH - P_LOW), 0.0, 1.0)
                calibrated_score = float(np.log1p(9.0 * norm) / np.log(10.0))

            note, freq = quantize_to_pentatonic(calibrated_score)

            grid_features.append({
                "regionId": reg_id,
                "name": reg_name,
                "col": c_idx,
                "row": r_idx,
                "pan": pan,
                "meanBrightness": round(mean_b, 4),
                "medianBrightness": round(median_b, 4),
                "stdDeviation": round(std_b, 4),
                "brightPixelDensity": round(bright_density, 4),
                "activeNote": note,
                "frequencyHz": round(freq, 2),
                "calibratedScore": round(calibrated_score, 4)
            })

    return grid_features
