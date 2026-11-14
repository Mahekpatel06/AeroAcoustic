"""
spatial_analysis.py
Performs 3x3 regional analysis on Earth night lights visualization frames.
Maps geographic positions to stereo panning and calculates localized statistics.
"""
import numpy as np
import cv2
from sonification.scale_quantizer import quantize_to_pentatonic

def analyze_spatial_grid(frame_bgr, rows=3, cols=3):
    """
    Divides frame into rows x cols grid and extracts regional features.
    """
    h, w = frame_bgr.shape[:2]
    # Convert BGR to Rec. 601 Luminance
    # L = 0.299*R + 0.587*G + 0.114*B (normalized to 0-1)
    b, g, r = frame_bgr[:, :, 0] / 255.0, frame_bgr[:, :, 1] / 255.0, frame_bgr[:, :, 2] / 255.0
    luma = 0.299 * r + 0.587 * g + 0.114 * b

    grid_features = []
    region_names = [
        ["NW (North America)", "N (North Atlantic)", "NE (Northern Eurasia)"],
        ["W (South America)",  "C (Europe / Africa)", "E (Asia / India)"],
        ["SW (South Pacific)", "S (Southern Ocean)", "SE (Oceania)"]
    ]

    cell_h = h // rows
    cell_w = w // cols

    for r_idx in range(rows):
        for c_idx in range(cols):
            y1 = r_idx * cell_h
            y2 = (r_idx + 1) * cell_h if r_idx < rows - 1 else h
            x1 = c_idx * cell_w
            x2 = (c_idx + 1) * cell_w if c_idx < cols - 1 else w

            cell_luma = luma[y1:y2, x1:x2]
            mean_b = float(np.mean(cell_luma))
            median_b = float(np.median(cell_luma))
            std_b = float(np.std(cell_luma))
            # Bright pixels count threshold > 0.08 (non-ocean/non-empty land)
            bright_density = float(np.mean(cell_luma > 0.08))

            # Pan from -0.8 (col 0) to 0.0 (col 1) to +0.8 (col 2)
            pan = round((c_idx - 1.0) * 0.8, 2)
            reg_id = f"R{r_idx}_{c_idx}"
            reg_name = region_names[r_idx][c_idx]

            # Calibrated terrestrial luminance scaling:
            # Dark ocean/desert floor baseline ~0.008; intensely lit regions ~0.045
            norm_mean = (mean_b - 0.008) / (0.045 - 0.008)
            norm_density = bright_density / 0.25
            calibrated_score = float(np.clip(0.55 * norm_mean + 0.45 * norm_density, 0.0, 1.0))

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
                "calibratedScore": round(calibrated_score, 4)
            })

    return grid_features
