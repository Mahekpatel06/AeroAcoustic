"""
instruments.py
Audio synthesis instruments and DSP effects.
Implements ADSR envelopes, waveform generation, stereo panning, and master limiting.
Includes all 6 instrument sound profiles matching the Web Audio engine:
1. sine_pad (Ambient baseline & annual progression)
2. crystalline_chime_bell (Mode B purple electrification)
3. warm_cello_synth (Mode B orange blackout & Ukraine)
4. marimba_pluck (Mode C India rural electrification)
5. glass_pad (Mode C Western Europe LED grid)
6. modal_synth (Mode C Eastern Mediterranean modal texture)
"""
import numpy as np

SAMPLE_RATE = 44100

def generate_adsr_envelope(total_samples, attack_sec=0.05, decay_sec=0.1, sustain_level=0.7, release_sec=0.2, sr=SAMPLE_RATE):
    """
    Generates an ADSR amplitude envelope.
    """
    a_samples = int(attack_sec * sr)
    d_samples = int(decay_sec * sr)
    r_samples = int(release_sec * sr)
    s_samples = max(0, total_samples - (a_samples + d_samples + r_samples))

    env = []
    # Attack
    if a_samples > 0:
        env.append(np.linspace(0.0, 1.0, a_samples, endpoint=False))
    # Decay
    if d_samples > 0:
        env.append(np.linspace(1.0, sustain_level, d_samples, endpoint=False))
    # Sustain
    if s_samples > 0:
        env.append(np.full(s_samples, sustain_level))
    # Release
    if r_samples > 0:
        env.append(np.linspace(sustain_level, 0.0, r_samples))

    full_env = np.concatenate(env) if env else np.ones(total_samples)
    if len(full_env) < total_samples:
        full_env = np.pad(full_env, (0, total_samples - len(full_env)))
    else:
        full_env = full_env[:total_samples]
    return full_env

def synthesize_sine_pad(freq_hz, duration_sec, velocity=0.7, sr=SAMPLE_RATE):
    """
    Synthesizes a soft, warm ambient pad note using fundamental sine with gentle 2nd harmonic.
    """
    num_samples = int(duration_sec * sr)
    t = np.linspace(0, duration_sec, num_samples, endpoint=False)
    signal = 0.85 * np.sin(2 * np.pi * freq_hz * t) + 0.15 * np.sin(2 * np.pi * 2 * freq_hz * t)
    env = generate_adsr_envelope(num_samples, attack_sec=0.08, decay_sec=0.15, sustain_level=0.7, release_sec=0.3, sr=sr)
    return signal * env * velocity

def synthesize_crystalline_chime(freq_hz, duration_sec, velocity=0.8, sr=SAMPLE_RATE):
    """
    Synthesizes a bright crystalline chime / bell sound for illumination increases (Purple).
    Uses high-frequency chime overtones (e.g. 1.0, 2.76, 5.4).
    """
    num_samples = int(duration_sec * sr)
    t = np.linspace(0, duration_sec, num_samples, endpoint=False)
    signal = (
        0.60 * np.sin(2 * np.pi * freq_hz * t) +
        0.25 * np.sin(2 * np.pi * 2.76 * freq_hz * t) +
        0.15 * np.sin(2 * np.pi * 5.40 * freq_hz * t)
    )
    env = generate_adsr_envelope(num_samples, attack_sec=0.01, decay_sec=0.25, sustain_level=0.2, release_sec=0.5, sr=sr)
    return signal * env * velocity

def synthesize_cello_synth(freq_hz, duration_sec, velocity=0.7, sr=SAMPLE_RATE):
    """
    Synthesizes a mellow, warm cello-like synth for illumination decreases (Orange).
    Uses triangular waveform harmonics for rich mellow warmth.
    """
    num_samples = int(duration_sec * sr)
    t = np.linspace(0, duration_sec, num_samples, endpoint=False)
    signal = (
        0.70 * np.sin(2 * np.pi * freq_hz * t) +
        0.20 * np.sin(2 * np.pi * 3 * freq_hz * t) / 9.0 +
        0.10 * np.sin(2 * np.pi * 5 * freq_hz * t) / 25.0
    )
    env = generate_adsr_envelope(num_samples, attack_sec=0.15, decay_sec=0.3, sustain_level=0.6, release_sec=0.4, sr=sr)
    return signal * env * velocity

def synthesize_marimba_pluck(freq_hz, duration_sec, velocity=0.8, sr=SAMPLE_RATE):
    """
    Synthesizes a snappy marimba pluck for rapid electrification (India).
    Percussive wooden transient with fast exponential decay.
    """
    num_samples = int(duration_sec * sr)
    t = np.linspace(0, duration_sec, num_samples, endpoint=False)
    signal = (
        0.75 * np.sin(2 * np.pi * freq_hz * t) +
        0.25 * np.sin(2 * np.pi * 3.8 * freq_hz * t)
    )
    env = generate_adsr_envelope(num_samples, attack_sec=0.005, decay_sec=0.20, sustain_level=0.1, release_sec=0.2, sr=sr)
    return signal * env * velocity

def synthesize_glass_pad(freq_hz, duration_sec, velocity=0.7, sr=SAMPLE_RATE):
    """
    Synthesizes shimmering ambient crystal glass pad for Western Europe LED grid.
    """
    num_samples = int(duration_sec * sr)
    t = np.linspace(0, duration_sec, num_samples, endpoint=False)
    carrier = np.sin(2 * np.pi * freq_hz * t)
    modulator = 0.5 * (1.0 + np.sin(2 * np.pi * 3.01 * freq_hz * t))
    signal = carrier * modulator
    env = generate_adsr_envelope(num_samples, attack_sec=0.12, decay_sec=0.35, sustain_level=0.75, release_sec=0.4, sr=sr)
    return signal * env * velocity

def synthesize_modal_synth(freq_hz, duration_sec, velocity=0.7, sr=SAMPLE_RATE):
    """
    Synthesizes evocative modal synth texture for Eastern Mediterranean.
    Rich harmonic sawtooth blend.
    """
    num_samples = int(duration_sec * sr)
    t = np.linspace(0, duration_sec, num_samples, endpoint=False)
    signal = (
        0.50 * np.sin(2 * np.pi * freq_hz * t) +
        0.25 * np.sin(2 * np.pi * 2 * freq_hz * t) +
        0.15 * np.sin(2 * np.pi * 3 * freq_hz * t) +
        0.10 * np.sin(2 * np.pi * 4 * freq_hz * t)
    )
    env = generate_adsr_envelope(num_samples, attack_sec=0.06, decay_sec=0.28, sustain_level=0.5, release_sec=0.35, sr=sr)
    return signal * env * velocity

def synthesize_instrument(instrument_name, freq_hz, duration_sec, velocity=0.7, sr=SAMPLE_RATE):
    """
    Dispatch function for all synthesizers.
    """
    if instrument_name == "crystalline_chime_bell":
        return synthesize_crystalline_chime(freq_hz, duration_sec, velocity, sr=sr)
    elif instrument_name == "warm_cello_synth":
        return synthesize_cello_synth(freq_hz, duration_sec, velocity, sr=sr)
    elif instrument_name == "marimba_pluck":
        return synthesize_marimba_pluck(freq_hz, duration_sec, velocity, sr=sr)
    elif instrument_name == "glass_pad":
        return synthesize_glass_pad(freq_hz, duration_sec, velocity, sr=sr)
    elif instrument_name == "modal_synth":
        return synthesize_modal_synth(freq_hz, duration_sec, velocity, sr=sr)
    else:
        return synthesize_sine_pad(freq_hz, duration_sec, velocity, sr=sr)

def apply_stereo_panning(mono_signal, pan):
    """
    Constant-power stereo panning.
    pan: -1.0 (hard left) to +1.0 (hard right)
    """
    pan = np.clip(pan, -1.0, 1.0)
    theta = (pan + 1.0) * (np.pi / 4.0)  # maps [-1, 1] to [0, pi/2]
    left_gain = np.cos(theta)
    right_gain = np.sin(theta)
    return np.column_stack((mono_signal * left_gain, mono_signal * right_gain))

def apply_master_limiter(stereo_audio, threshold_db=-3.0):
    """
    Soft-knee limiter to prevent clipping and distortion while preserving dynamics.
    """
    threshold_linear = 10.0 ** (threshold_db / 20.0)
    peak = np.max(np.abs(stereo_audio))
    if peak > threshold_linear:
        # Soft-knee compression above threshold
        stereo_audio = np.tanh(stereo_audio / threshold_linear) * threshold_linear
    return stereo_audio
