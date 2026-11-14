"""
scheduler.py
Schedules and mixes musical audio events into a continuous stereo master audio track.
Applies gain staging, polyphony limiting, and master limiting to prevent clipping.
Supports all 6 synthesized instruments.
"""
import numpy as np
from scipy.io import wavfile
from sonification.instruments import (
    synthesize_instrument,
    apply_stereo_panning,
    apply_master_limiter,
    SAMPLE_RATE
)

def render_score_to_audio(audio_events, total_duration_sec, sample_rate=SAMPLE_RATE):
    """
    Renders scheduled audio events into a normalized 16-bit PCM stereo WAV buffer.
    """
    total_samples = int(np.ceil(total_duration_sec * sample_rate)) + (sample_rate * 2) # 2s tail for reverb/release
    master_buffer = np.zeros((total_samples, 2), dtype=np.float32)

    for ev in audio_events:
        start_time = ev["timestampSeconds"]
        start_idx = int(start_time * sample_rate)
        duration_sec = ev["durationSeconds"]
        freq_hz = ev["frequencyHz"]
        velocity = ev["velocity"]
        pan = ev.get("pan", 0.0)
        inst = ev.get("instrument", "sine_pad")

        mono_note = synthesize_instrument(inst, freq_hz, duration_sec, velocity=velocity, sr=sample_rate)
        stereo_note = apply_stereo_panning(mono_note, pan)
        end_idx = start_idx + len(stereo_note)

        if end_idx <= total_samples:
            master_buffer[start_idx:end_idx, :] += stereo_note
        elif start_idx < total_samples:
            avail = total_samples - start_idx
            master_buffer[start_idx:total_samples, :] += stereo_note[:avail]

    # Apply master soft limiter at -3dB to prevent any clipping
    limited = apply_master_limiter(master_buffer, threshold_db=-3.0)

    # Convert float32 [-1.0, 1.0] to int16
    clipped_safe = np.clip(limited, -1.0, 1.0)
    int16_audio = (clipped_safe * 32767).astype(np.int16)
    return int16_audio

def export_wav(audio_int16, output_path, sample_rate=SAMPLE_RATE):
    """
    Exports 16-bit PCM stereo audio to disk.
    """
    wavfile.write(output_path, sample_rate, audio_int16)
    print(f"Exported WAV audio: {output_path} ({len(audio_int16)/sample_rate:.2f} seconds)")
