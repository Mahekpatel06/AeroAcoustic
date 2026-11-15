"""
generate_ocean_audio.py
Synthesizes demonstration audio for Dataset #2: Sea Surface Currents (NASA SVS #3912).
Combines:
1. Hydrodynamic fluid wave swell (low-frequency ocean noise filtered by flow velocity)
2. Polar cold-water cello bass resonance (D2-G2)
3. Equatorial warm-water string harmonic swell (E3-E4)
4. Rapid streamline fluid pulses (16th-note arpeggios locked to BPM and flow heading)
Exports to:
- soniearth-nightlights/audio/generated/ocean_currents_ambient.wav
- soniearth-web/public/datasets/ocean-currents/audio/ocean_currents_ambient.wav
"""
import os
import json
import shutil
import numpy as np
from scipy.io import wavfile

SAMPLE_RATE = 44100

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(PROJECT_DIR)

FEATURES_PATH = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "ocean-currents", "features.json")
OUT_AUDIO_DIR_PYTHON = os.path.join(PROJECT_DIR, "audio", "generated")
OUT_AUDIO_DIR_WEB = os.path.join(REPO_ROOT, "soniearth-web", "public", "datasets", "ocean-currents", "audio")

def generate_fluid_swell(total_samples, duration_sec, sr=SAMPLE_RATE):
    """
    Generates realistic hydrophone deep ocean water swell:
    Brownian/pink noise filtered with slow sinusoidal tidal modulation.
    """
    # Generate pink-like noise via cumulative sum of white noise (brownian noise)
    white = np.random.normal(0, 1, total_samples)
    brown = np.cumsum(white)
    brown = brown / np.max(np.abs(brown)) # Normalize

    # Gentle low-frequency band: remove DC offset
    brown = brown - np.mean(brown)

    # Modulate with 0.15 Hz tidal surge (approx 6-7 second wave swells)
    t = np.linspace(0, duration_sec, total_samples, endpoint=False)
    swell_envelope = 0.55 + 0.45 * np.sin(2 * np.pi * 0.14 * t)

    # Sub-bass ocean rumble (40 Hz to 120 Hz)
    sub_drone = 0.35 * np.sin(2 * np.pi * 55.0 * t) + 0.20 * np.sin(2 * np.pi * 82.4 * t)

    fluid_signal = (brown * 0.45 + sub_drone * 0.25) * swell_envelope
    return fluid_signal

def synthesize_note(freq_hz, duration_sec, instrument="cello", sr=SAMPLE_RATE):
    num_samples = int(duration_sec * sr)
    t = np.linspace(0, duration_sec, num_samples, endpoint=False)
    if instrument == "cello":
        # Warm mellow triangle with deep fundamental
        signal = 0.75 * np.sin(2 * np.pi * freq_hz * t) + 0.20 * np.sin(2 * np.pi * 3 * freq_hz * t) / 9.0
        # Slow attack, long release
        attack = int(0.25 * sr)
        release = int(0.40 * sr)
    else:
        # Warm string swell: rich sawtooth harmonics
        signal = (
            0.50 * np.sin(2 * np.pi * freq_hz * t) +
            0.30 * np.sin(2 * np.pi * 2 * freq_hz * t) +
            0.15 * np.sin(2 * np.pi * 3 * freq_hz * t)
        )
        attack = int(0.20 * sr)
        release = int(0.35 * sr)

    env = np.ones(num_samples)
    if attack < num_samples:
        env[:attack] = np.linspace(0, 1, attack)
    if release < num_samples:
        env[-release:] = np.linspace(1, 0, release)
    return signal * env

def build_ocean_soundtrack():
    os.makedirs(OUT_AUDIO_DIR_PYTHON, exist_ok=True)
    os.makedirs(OUT_AUDIO_DIR_WEB, exist_ok=True)

    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(f"Missing features at {FEATURES_PATH}")

    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        meta = json.load(f)

    frames = meta.get("frames", [])
    duration_sec = meta.get("durationSeconds", 66.7)
    total_samples = int(duration_sec * SAMPLE_RATE)

    # Stereo master buffer
    left_channel = np.zeros(total_samples, dtype=np.float32)
    right_channel = np.zeros(total_samples, dtype=np.float32)

    # 1. Base Hydrophone Fluid Swell
    print("Generating hydrophone fluid wave swell...")
    fluid_left = generate_fluid_swell(total_samples, duration_sec)
    fluid_right = generate_fluid_swell(total_samples, duration_sec)
    left_channel += fluid_left * 0.35
    right_channel += fluid_right * 0.35

    # 2. Add sampled temperature and velocity events
    # Sample every 1.2 seconds for musical continuity
    print(f"Synthesizing {len(frames)} frames across {duration_sec}s...")
    last_trigger_t = -2.0
    for frame in frames:
        t_sec = frame["timestampSeconds"]
        if t_sec - last_trigger_t < 1.0:
            continue
        last_trigger_t = t_sec

        sst = frame.get("temperatureCelsius", 18.0)
        freq = frame.get("frequencyHz", 130.8)
        pan = frame.get("strikePan", 0.0) # -0.85 to +0.85
        velocity_kts = frame.get("currentVelocityKnots", 1.5)

        note_dur = min(1.8, 1.0 + (velocity_kts / 5.0) * 0.8)
        inst = "cello" if sst < 14.0 else "strings"

        note_signal = synthesize_note(freq, note_dur, instrument=inst)
        n_samples = len(note_signal)
        start_idx = int(t_sec * SAMPLE_RATE)
        end_idx = min(total_samples, start_idx + n_samples)
        valid_len = end_idx - start_idx

        if valid_len > 0:
            # Constant power pan
            theta = (np.clip(pan, -1.0, 1.0) + 1.0) * (np.pi / 4.0)
            l_gain = float(np.cos(theta)) * 0.40
            r_gain = float(np.sin(theta)) * 0.40
            left_channel[start_idx:end_idx] += note_signal[:valid_len] * l_gain
            right_channel[start_idx:end_idx] += note_signal[:valid_len] * r_gain

    # 3. Soft Limiter (-3 dBFS)
    stereo = np.column_stack((left_channel, right_channel))
    threshold = 10.0 ** (-3.0 / 20.0) # ~0.707
    peak = np.max(np.abs(stereo))
    if peak > threshold:
        stereo = np.tanh(stereo / threshold) * threshold

    int16_audio = (np.clip(stereo, -1.0, 1.0) * 32767).astype(np.int16)

    # Export WAV files
    out_python = os.path.join(OUT_AUDIO_DIR_PYTHON, "ocean_currents_ambient.wav")
    out_web = os.path.join(OUT_AUDIO_DIR_WEB, "ocean_currents_ambient.wav")

    wavfile.write(out_python, SAMPLE_RATE, int16_audio)
    shutil.copy2(out_python, out_web)

    print(f"Successfully generated:")
    print(f" -> {out_python} ({len(int16_audio)/SAMPLE_RATE:.2f}s)")
    print(f" -> {out_web}")

if __name__ == "__main__":
    build_ocean_soundtrack()
