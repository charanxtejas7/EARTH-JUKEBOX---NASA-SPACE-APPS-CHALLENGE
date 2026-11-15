# Earth Jukebox

> **NASA Space Apps Challenge 2026 — Challenge 14 ("Earth Jukebox")**  
> An open-access, multi-sensory web application that translates NASA Earth Information Center (EIC) and Worldview visual frames into live, deterministic musical soundscapes.

---

## 1. What It Is

Earth Jukebox sonifies NASA visual data. Built on the core principle that *"the picture is a musical score"*, the application translates global satellite imagery and climate model visualizations into real-time auditory experiences using the browser's Web Audio API and 3D WebGL geometry.

### Core Scientific & Technical Truth
> **The sound is made from the colour and brightness of NASA's rendered pictures, not from NASA's raw measurements.**

The application resamples pre-rendered RGB visualization frames (JPG, PNG, WebM) from NASA's Scientific Visualization Studio (SVS) and NASA Worldview across eight latitude bands. Perceived luminance controls voice gain, color warmth modulates lowpass biquad filter cutoffs, and longitude drives stereo panning.

---

## 2. Quick Start (Running Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- `npm`

### Installation & Development
```bash
# 1. Clone the repository
git clone https://github.com/your-username/earth-jukebox.git
cd earth-jukebox

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 3. How to Fetch Official NASA Media

All media files are pre-downloaded ahead of time into `public/media/` so the application makes **zero runtime external network calls** and functions completely offline (airplane mode).

To inspect or refresh media directly from official NASA hosts:

```bash
# Download verified SVS media listed in src/data/nasa-assets.json
npm run fetch:nasa

# Download verified NASA Worldview / GIBS satellite frames
npm run fetch:worldview

# List candidate media links from an official SVS page
npm run list:nasa -- air-quality
```

*Security & Origin Rule*: The download scripts only accept official NASA hosts (`svs.gsfc.nasa.gov`, `wvs.earthdata.nasa.gov`, and `gibs.earthdata.nasa.gov`). All other URLs are strictly rejected.

---

## 4. How to Build & Test Offline

```bash
# Build production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

### Verification Checks
- **Zero Runtime Requests**: The application self-hosts all fonts (`public/fonts/`) and Three.js locally.
- **WAV Export**: Generates deterministic 16-bit 44.1 kHz stereo linear PCM WAV files embedded with standard RIFF `LIST/INFO` metadata (source title, exact NASA credit, AI disclosure, and creation date).
- **Reduced Motion**: Respects `prefers-reduced-motion` by disabling globe auto-spin, disabling magnetic cursor pull, snapping 3D/2D morphs instantly, and defaulting to Flat Map mode.

---

## 5. Limitations

1. **Color & Brightness Based**: The audio synthesis translates RGB pixel values (perceived BT.709 luminance and red-to-blue warmth) of rendered visual frames. It does not ingest raw binary satellite sensor telemetry (such as raw NetCDF arrays or HDF5 files).
2. **Projection Support**: Full-world global visualizations are mapped onto both the 3D Globe and 2D Equirectangular map. Regional perspective models (such as `air-quality` and `perpetual-ocean-2`) are locked to Flat Map mode to prevent spherical distortion.
3. **Artistic & Data-Driven Mapping**: The audio mappings (musical scales, root frequencies, oscillator waveforms, and resonance Q factors) are conceived by the human team to tell evocative auditory climate stories while remaining strictly deterministic.
4. **Haptics**: Tactile haptic feedback via `navigator.vibrate` is supported only on compatible touch devices (e.g. Chrome on Android); it is unsupported on iOS Safari.

---

## 6. Public Deployment Instructions

The project is built as a pure static web application. It requires zero backend servers, zero database connections, and zero API keys.

### Deploying to Netlify
1. Connect your GitHub repository to [Netlify](https://www.netlify.com/).
2. Set **Build command**: `npm run build`
3. Set **Publish directory**: `dist`
4. Deploy site.

### Deploying to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com/).
2. Select **Framework Preset**: `Vite`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Deploy.

### Deploying to GitHub Pages
1. In `vite.config.js`, ensure `base: './'` or your repository path.
2. Build the project: `npm run build`
3. Push the contents of `dist/` to your `gh-pages` branch, or configure GitHub Actions to deploy from `dist`.

> **IMPORTANT**: In accordance with NASA Space Apps Challenge regulations, all public project links, demo videos, and repositories must be completely open and accessible **without requiring any login, account creation, or password**.

---

## 7. Disclosures & Legal Attributions

- **Non-Endorsement**: NASA does not endorse this project. Earth Jukebox is not a NASA product, and does not use NASA logos, meatballs, flags, or official agency insignia.
- **NASA Media Guidelines**: NASA media reproduction guidelines apply to all NASA imagery and video:  
  [https://www.nasa.gov/multimedia/guidelines/index.html](https://www.nasa.gov/multimedia/guidelines/index.html)
- **AI Assistance**: Code was written with AI assistance (Claude, Google Antigravity) and reviewed by the team. The concept and sound design are the team's.
