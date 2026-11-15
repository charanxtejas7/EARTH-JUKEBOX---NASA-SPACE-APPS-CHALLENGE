# Credits, Data Sources, and AI Disclosure

NASA does not endorse this project. No NASA logos, flags, meatballs, or official agency insignia are used.  
All media conforms to NASA's media usage guidelines: [https://www.nasa.gov/multimedia/guidelines/index.html](https://www.nasa.gov/multimedia/guidelines/index.html).

---

## 1. NASA Visualizations & Data Sources Used

All visualizations and credit lines are sourced directly from [src/data/nasa-assets.json](src/data/nasa-assets.json).

### Earth Information Center (NASA Scientific Visualization Studio)
1. **Night lights, 2012 to 2023** (image) [https://svs.gsfc.nasa.gov/5313/](https://svs.gsfc.nasa.gov/5313/)
   - Tonic: D3 (146.83 Hz) • Scale: Pentatonic • Timbre: Crystalline Night Chimes
   - Visual Credit: NASA's Scientific Visualization Studio
   - Data Credit: NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC.
2. **Sea surface currents and temperature** (video) [https://svs.gsfc.nasa.gov/3912/](https://svs.gsfc.nasa.gov/3912/)
   - Tonic: A2 (110.00 Hz) • Scale: Oceanic • Timbre: Fluid Oceanic Flow
   - Visual Credit: NASA/Goddard Space Flight Center Scientific Visualization Studio
   - Data Credit: Model output from ECCO2 (MIT/JPL).
3. **GEOS aerosols, 19 August 2025** (image) [https://svs.gsfc.nasa.gov/5669/](https://svs.gsfc.nasa.gov/5669/)
   - Tonic: E3 (164.81 Hz) • Scale: Lydian • Timbre: Atmospheric Aerosol Swell
   - Visual Credit: NASA's Global Modeling Assimilation Office (GMAO) and NASA's Scientific Visualization Studio (SVS).
   - Data Credit: GEOS-FP 2Km Replay model.
4. **Air quality model runs** (image) [https://svs.gsfc.nasa.gov/5533/](https://svs.gsfc.nasa.gov/5533/)
   - Tonic: G3 (196.00 Hz) • Scale: Dorian • Timbre: Tropospheric Density Drone
   - Visual Credit: NASA's Scientific Visualization Studio and NASA's Global Modeling and Assimilation Office.
   - Data Credit: NASA's Goddard Earth Observing System Composition Forecasting (GEOS-CF) system.
5. **Perpetual Ocean 2: western boundary currents** (image) [https://svs.gsfc.nasa.gov/5425/](https://svs.gsfc.nasa.gov/5425/)
   - Tonic: D2 (73.42 Hz) • Scale: Minor • Timbre: Deep Sub-Surface Gyre
   - Visual Credit: NASA's Scientific Visualization Studio
   - Data Credit: Model output: Estimating the Circulation and Climate of the Ocean, Phase II (ECCO2).
6. **DYAMOND global carbon dioxide** (image) [https://svs.gsfc.nasa.gov/5196/](https://svs.gsfc.nasa.gov/5196/)
   - Tonic: F3 (174.61 Hz) • Scale: Harmonic Minor • Timbre: Carbon Cycles Polyphony
   - Visual Credit: NASA's Scientific Visualization Studio
   - Data Credit: GEOS model output from the DYAMOND project.
7. **Lightning seen from the ISS, 2017 to 2023** (image) [https://svs.gsfc.nasa.gov/5011/](https://svs.gsfc.nasa.gov/5011/)
   - Tonic: B3 (246.94 Hz) • Scale: Whole Tone • Timbre: Transient Electrical Bursts
   - Visual Credit: NASA's Scientific Visualization Studio
   - Data Credit: Lightning Imaging Sensor (LIS) on the International Space Station.
8. **Atmospheric river in 3D** (image) [https://svs.gsfc.nasa.gov/4960/](https://svs.gsfc.nasa.gov/4960/)
   - Tonic: C3 (130.81 Hz) • Scale: Dorian • Timbre: Vapor Plume Barometrics
   - Visual Credit: NASA's Scientific Visualization Studio
   - Data Credit: NASA Modern-Era Retrospective analysis for Research and Applications, Version 2 (MERRA-2).
9. **GEDI forest height** (video) [https://svs.gsfc.nasa.gov/4950/](https://svs.gsfc.nasa.gov/4950/)
   - Tonic: A3 (220.00 Hz) • Scale: Lydian • Timbre: Canopy Lidar Harmonics
   - Visual Credit: NASA's Scientific Visualization Studio
   - Data Credit: Global Ecosystem Dynamics Investigation (GEDI) lidar aboard the International Space Station.

### Reference Listening Track (Deep Space)
10. **Data sonification: Caldwell 73** (reference video with original NASA audio) [https://svs.gsfc.nasa.gov/13786/](https://svs.gsfc.nasa.gov/13786/)
    - Credit: NASA's Goddard Space Flight Center. Sonification by SYSTEM Sounds (M. Russo, A. Santaguida).

### NASA Worldview & Global Imagery Browse Services (GIBS)
Acknowledgment text per NASA ESDIS guidelines:
> *"We acknowledge the use of imagery from the NASA Worldview application (https://worldview.earthdata.nasa.gov/) and services from NASA's Global Imagery Browse Services (GIBS), part of the NASA Earth Science Data and Information System (ESDIS)."*

11. **Worldview: Terra True Color, 1 June 2024** (image)
    - Layer: `MODIS_Terra_CorrectedReflectance_TrueColor` (2024-06-01)
    - Tonic: C3 (130.81 Hz) • Scale: Pentatonic • Timbre: Terra Solar Reflectance
    - Visual Credit: NASA GIBS and NASA Worldview (ESDIS)
    - Data Credit: NASA Terra / MODIS instrument.
12. **Worldview: Suomi NPP True Color, 22 September 2024** (image)
    - Layer: `VIIRS_SNPP_CorrectedReflectance_TrueColor` (2024-09-22)
    - Tonic: G3 (196.00 Hz) • Scale: Pentatonic • Timbre: Day-Night VIIRS Optic
    - Visual Credit: NASA GIBS and NASA Worldview (ESDIS)
    - Data Credit: Suomi NPP / VIIRS instrument.
13. **Worldview: Land Surface Temperature, 1 June 2024** (image)
    - Layer: `MODIS_Terra_Land_Surface_Temp_Day` (2024-06-01)
    - Tonic: Eb3 (155.56 Hz) • Scale: Minor • Timbre: Thermal Radiance Spectrum
    - Visual Credit: NASA GIBS and NASA Worldview (ESDIS)
    - Data Credit: NASA Terra / MODIS Land Surface Temperature product.
14. **Worldview: AIRS Precipitation, 1 June 2024** (image)
    - Layer: `AIRS_Precipitation_Day` (2024-06-01)
    - Tonic: F2 (87.31 Hz) • Scale: Oceanic • Timbre: Hydrological Rain Drone
    - Visual Credit: NASA GIBS and NASA Worldview (ESDIS)
    - Data Credit: Atmospheric Infrared Sounder (AIRS) aboard NASA's Aqua satellite.

---

## 2. Scientific Scope & Sonification Pipeline

- **Honest Mapping Statement**: Sound is generated live in the client browser from visual attributes (color hue, saturation, and luminance) of rendered frames across 8 horizontal bands, **not from NASA's underlying numerical scientific measurements or raw sensor arrays**.
- **Deterministic 4-Stage Pipeline**:
  1. **Frame Resampling**: $160 \times 80$ uniform sampling grid (12,800 sample points per frame).
  2. **Column Slicing**: 3px vertical column extracted at playhead progress $x \in [0, 1]$ every 100 ms.
  3. **Latitude Band Averaging**: Pixels grouped into 8 vertical latitude bands.
  4. **Deterministic Transfer Functions**:
     - Pitch: $f(y) = f_{\text{root}} \cdot 2^{(\text{ScaleStep}(y)/12)}$
     - Gain: $G(L) = L^{1.5} \cdot 0.22$ (where $L = 0.2126R + 0.7152G + 0.0722B$)
     - Warmth / Filter Cutoff: $F_c(W) = 350 + (W \cdot 3800)\text{ Hz}$
- **Audio Export**: In-browser 16-bit 44.1 kHz stereo linear PCM `.wav` generation via client-side `OfflineAudioContext`, including standard RIFF `LIST/INFO` metadata (`INAM`, `IART`, `ICMT`, `ICRD`, `ISFT`).

---

## 3. AI Assistance Disclosure

Code was written with AI assistance (Claude, Google Antigravity) and reviewed by the team. The concept and sound design are the team's.

For detailed file-by-file disclosure, see [docs/AI_DISCLOSURE.md](docs/AI_DISCLOSURE.md).
