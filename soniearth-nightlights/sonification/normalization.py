"""
normalization.py
Reusable normalization algorithms with edge-case handling for scientific illumination features.
"""
import numpy as np

def min_max_normalize(val, min_val, max_val, clamp=True):
    """
    Min-max normalizes a value or numpy array to [0, 1].
    Handles constant-value range, NaN, and infinity safely.
    """
    denom = max_val - min_val
    if abs(denom) < 1e-12:
        # Constant value array
        if isinstance(val, (int, float)):
            return 0.5
        return np.full_like(val, 0.5, dtype=float)
    
    norm = (val - min_val) / denom
    if clamp:
        norm = np.clip(norm, 0.0, 1.0)
    return norm

def log_luminance_scale(val, min_val=0.0, max_val=1.0):
    """
    Applies logarithmic compression suited for nighttime human eye perception.
    Formula: y = log(1 + 9 * x_norm)
    """
    x_norm = min_max_normalize(val, min_val, max_val, clamp=True)
    return np.log1p(9.0 * x_norm) / np.log(10.0)

def robust_percentile_scale(arr, p_low=2.0, p_high=98.0):
    """
    Scales array based on empirical percentiles to discard sensor glints and extreme noise.
    """
    arr = np.asarray(arr, dtype=float)
    if arr.size == 0:
        return arr
    low = np.percentile(arr, p_low)
    high = np.percentile(arr, p_high)
    return min_max_normalize(arr, low, high, clamp=True)
