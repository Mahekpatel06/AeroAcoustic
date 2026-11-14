# Phase 11: Frontend Integration Guide (Next.js & Tone.js)

This guide documents how the future Next.js frontend will consume the SoniEarth Night Lights pipeline outputs.

---

## 1. Asset Contracts
All required data files are located in `soniearth-nightlights/`:
1. **Dataset Manifest:** `data/manifests/dataset_manifest.json`
2. **Feature Stream:** `data/features/night_lights_features.json`
3. **Tone.js Audio Score:** `data/intermediate/audio_events.json`
4. **TypeScript Definitions:**
   - `typescript/Dataset.ts`
   - `typescript/NightLightsFeatures.ts`
   - `typescript/AudioEvents.ts`

---

## 2. Browser Audio Playback with Tone.js

### Step 1: User Gesture Initialization (Autoplay Compliance)
```typescript
import * as Tone from 'tone';

async function initSoniEarthAudio() {
  // Browsers require a user gesture before starting Web Audio
  await Tone.start();
  console.log("AudioContext activated!");
}
```

### Step 2: Tone.js Instrument Synthesis Setup
```typescript
// 1. Ambient Pad Synthesizer
const ambientSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'sine' },
  envelope: { attack: 0.08, decay: 0.15, sustain: 0.7, release: 0.3 }
}).toDestination();

// 2. Crystalline Chimes (Purple Increase Motif)
const chimeSynth = new Tone.PolySynth(Tone.FMSynth, {
  harmonicity: 2.76,
  modulationIndex: 3.0,
  envelope: { attack: 0.01, decay: 0.25, sustain: 0.2, release: 0.5 }
}).toDestination();

// 3. Warm Cello Synth (Orange Decrease Motif)
const celloSynth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.15, decay: 0.3, sustain: 0.6, release: 0.4 }
}).toDestination();

// 4. Master Limiter to prevent clipping
const limiter = new Tone.Limiter(-3.0).toDestination();
ambientSynth.connect(limiter);
chimeSynth.connect(limiter);
celloSynth.connect(limiter);
```

### Step 3: Scheduling Events via Tone.Transport
```typescript
import audioScore from '../data/intermediate/audio_events.json';

function schedulePlayback() {
  Tone.Transport.cancel();
  Tone.Transport.bpm.value = audioScore.tempoBpm;

  audioScore.events.forEach((event) => {
    Tone.Transport.schedule((time) => {
      if (event.instrument === 'crystalline_chime_bell') {
        chimeSynth.triggerAttackRelease(event.note, event.durationSeconds, time, event.velocity);
      } else if (event.instrument === 'warm_cello_synth') {
        celloSynth.triggerAttackRelease(event.note, event.durationSeconds, time, event.velocity);
      } else {
        ambientSynth.triggerAttackRelease(event.note, event.durationSeconds, time, event.velocity);
      }
    }, event.timestampSeconds);
  });

  Tone.Transport.start();
}
```

---

## 3. "Why am I hearing this?" Explainability Panel
In your React component, bind to the currently playing frame feature:
```tsx
function ExplainPanel({ currentFeature }: { currentFeature: NightLightsFrameFeature }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
      <h4 className="text-sky-400 font-semibold mb-2">Why am I hearing this?</h4>
      <p className="text-sm text-slate-300">
        Playing <span className="text-yellow-400 font-mono">{currentFeature.spatialGrid[1].activeNote}</span> note.
        Global Mean Illumination is <span className="font-mono">{(currentFeature.globalMeanBrightness * 100).toFixed(1)}%</span>.
        {currentFeature.changeClassification && (
          <span className="block mt-1 text-xs text-purple-300">
            Detected Purple Increase ({ (currentFeature.changeClassification.increaseRatio * 100).toFixed(1) }%) 
            triggering crystalline chimes.
          </span>
        )}
      </p>
    </div>
  );
}
```
