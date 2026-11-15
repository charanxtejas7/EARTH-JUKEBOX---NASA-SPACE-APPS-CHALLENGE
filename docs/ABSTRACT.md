# Earth Jukebox — Project Abstract

> **Challenge 14**: "Earth Jukebox" — NASA Space Apps Challenge 2026  
> **Audited Version**: 15 November 2026

---

## 1. Short Abstract (148 words)

Earth Jukebox is an open-access web application that translates pre-rendered visual frames from NASA's Earth Information Center (EIC) and NASA Worldview into live musical soundscapes. Built upon the philosophy that *"the picture is a score,"* it bridges accessibility gaps for blind and low-vision audiences by translating visual space data into sound. The sound is made from the colour and brightness of NASA's rendered pictures, not from NASA's raw measurements.

Operating 100% client-side with zero external runtime network requests, the engine samples rendered RGB frames across eight latitude bands. Perceived luminance ($L = 0.2126R + 0.7152G + 0.0722B$) drives oscillator gain, while color warmth modulates lowpass filter cutoffs. Features include 3D globe to flat map morphing, an interactive raycasted audio probe, a 7-landmark global climate tour, and browser-native 16-bit 44.1 kHz stereo WAV export with embedded RIFF LIST/INFO metadata.

---

## 2. Structured Technical Abstract (Full Version)

### Background & Scientific Problem
NASA's Earth Information Center and Worldview applications produce extraordinary visualizations documenting Earth's atmosphere, oceans, and biosphere. However, presenting planetary science exclusively through visual media excludes blind and low-vision communities and restricts exploration to a single sensory dimension. Earth Jukebox establishes a deterministic auditory translation bridge that allows diverse audiences to explore Earth science through multi-sensory sound.

### Core Scientific Honesty Statement
> **The sound is made from the colour and brightness of NASA's rendered pictures, not from NASA's raw measurements.**

### Technical Architecture & Mapping Ruleset
Earth Jukebox executes a client-side deterministic sonification engine using React 18, Three.js WebGL shaders, and the Web Audio API with zero logins, zero API keys, and zero server dependencies:

1. **Canvas Pixel Column Sampling**: Incoming visual frames are mapped onto an in-memory 2D canvas bridge at a uniform $160 \times 80$ resolution ($12,800$ sampling coordinates). An equatorial playhead sweeps across longitudes every 100 ms, extracting a 3px vertical strip segmented into 8 vertical latitude bands.
2. **Deterministic Mathematical Formulas (Verbatim from Code)**:
   - **Perceived Luminance**:
     ```javascript
     const brightness = (band.r * 0.2126 + band.g * 0.7152 + band.b * 0.0722) / 255;
     ```
   - **Voice Gain**:
     ```javascript
     const gain = Math.pow(brightness, 1.5) * 0.22;
     ```
   - **Chromatic Warmth**:
     ```javascript
     const warmth = Math.min(1, Math.max(0, ((band.r - band.b) / 255) * 0.8 + 0.5));
     ```
   - **Biquad Lowpass Cutoff**:
     ```javascript
     const cutoffHz = 350 + v.warmth * 3800; // 350 Hz to 4150 Hz
     ```
   - **Stereo Panning**:
     ```javascript
     slot.pan.pan.setTargetAtTime(x01 * 2 - 1, t, glide); // -1.0 (West) to +1.0 (East)
     ```
3. **Acoustic Profiles & Scales**: Maps visual data across 13 distinct acoustic DNA profiles (featuring specific root notes from D2 to B3, triangle/sine/sawtooth waveforms, and custom filter Q resonance) and 7 musical scales (`pentatonic`, `minor`, `lydian`, `dorian`, `wholeTone`, `harmonicMinor`, `oceanic`).
4. **Accessible Interaction**:
   - *Interactive Raycast Audio Probe*: Pointer down on 3D Globe or 2D Flat Map calculates UV coordinates via `THREE.Raycaster` and immediately triggers local latitude band sonification.
   - *Guided Tour*: Features 7 curated climate landmark stops with latitude/longitude coordinates and scientific explanations.
   - *Tactile Haptics*: Emits micro-vibration pulses on supported touch devices (feature-detected via `'vibrate' in navigator`).
   - *Offline WAV Export*: Renders deterministic 16-bit 44.1 kHz stereo linear PCM WAV files containing standard RIFF `LIST/INFO` metadata chunks (`INAM` title, `IART` NASA visual credit, `ICMT` AI-assisted review disclosure, and `ICRD` date).

### Measured Empirical Results (from `docs/EVIDENCE.md`)
- **Total Dist Size**: 21.82 MB (Media: 21.04 MB; Total JS Gzip: 193.75 KB; CSS Gzip: 5.60 KB; HTML Gzip: 0.60 KB).
- **External Network Requests**: `0` (Zero external HTTP/HTTPS requests at runtime; fonts and Three.js are fully self-hosted offline).
- **Click-to-Sound Latency**: Pure audio calculation mean is **0.0270 ms** (p95: 0.1885 ms); full browser canvas extraction and Web Audio scheduling mean is **~1.25 ms** (p95: ~2.40 ms).
- **Frame Rate (over 300 frames)**: 3D Globe mean **16.62 ms** (60.2 fps), Flat Map mean **16.51 ms** (60.6 fps), with **0 drops below 55 fps (0.0%)**.
- **WCAG Contrast Ratios**: Primary text achieves **14.96 : 1**, soft text **9.35 : 1**, cyan links **13.01 : 1**, and UI accents **6.10 : 1** (exceeding WCAG AA and AAA thresholds).

---

## 3. Limitations

1. **Rendered Imagery vs. Raw Telemetry**: The application analyzes rendered RGB pixel data (colors and brightness) from pre-rendered SVS and Worldview image/video products. It does not ingest raw sensor telemetry arrays (e.g., raw HDF5/NetCDF files).
2. **Projection Constraints**: 3D Globe rendering is applied to global equirectangular maps. Regional or perspective models (`air-quality` and `perpetual-ocean-2`) are locked to Flat Map mode to avoid spherical distortion.
3. **Artistic Sonification**: Audio mappings are data-driven musical translations conceived by the team to create an engaging public listening experience, not physical acoustic recordings from orbit.
4. **Haptics Compatibility**: Tactile feedback relies on the HTML5 Vibration API (`navigator.vibrate`), which is supported on modern Android browsers but unsupported on iOS Safari.
