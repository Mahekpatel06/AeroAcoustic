# Phase 8: Audio Synthesis Evaluation Report

## 1. Technical Audio Metrics

All 3 demonstration audio modes were rendered at $44.1\text{ kHz}$ / 16-bit PCM Stereo with the Master Limiter enabled at $-3.0\text{ dBFS}$:

| Mode | Output File | Duration | Peak Level (dBFS) | RMS Level | Distortion / Clipping |
|---|---|---|---|---|---|
| **Mode A: Annual Evolution (2012–2023)** | `night_lights_ambient.wav` | $12.60\text{ s}$ | $-3.01\text{ dBFS}$ ($0.707$) | $0.348$ | **Zero Clipping (Safe)** |
| **Mode B: Decadal Change Map** | `night_lights_change.wav` | $10.20\text{ s}$ | $-3.01\text{ dBFS}$ ($0.707$) | $0.332$ | **Zero Clipping (Safe)** |
| **Mode C: Regional Zoom Exploration** | `night_lights_regional.wav` | $11.00\text{ s}$ | $-3.00\text{ dBFS}$ ($0.708$) | $0.346$ | **Zero Clipping (Safe)** |

---

## 2. Dynamic Scheduling & Polyphony Management
* **Update Frequency:** $2 - 4\text{ events per second}$ (avoiding the catastrophic 60 FPS clicking bug identified in our architecture review).
* **ADSR Envelopes:**
  - Ambient Pad: Attack $0.08\text{ s}$, Decay $0.15\text{ s}$, Sustain $0.70$, Release $0.30\text{ s}$ (smooth transitions, zero clicks).
  - Chime Bell: Attack $0.01\text{ s}$, Decay $0.25\text{ s}$, Sustain $0.20$, Release $0.50\text{ s}$ (crisp percussive clarity).
  - Cello Synth: Attack $0.15\text{ s}$, Decay $0.30\text{ s}$, Sustain $0.60$, Release $0.40\text{ s}$ (warm, bowed string response).
* **Unified Tone.js Score:** 347 scheduled note events exported in `data/intermediate/audio_events.json`.
