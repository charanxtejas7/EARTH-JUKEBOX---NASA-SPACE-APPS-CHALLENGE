// src/audio/mapping.js
// Music theory and sonification mapping rules for Earth Jukebox.
// Pure deterministic translation from image frames to audio parameters.

export const SCALES = {
  pentatonic: [0, 2, 4, 7, 9],
  minor: [0, 2, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  oceanic: [0, 2, 5, 7, 10],
}

// Distinct Acoustic DNA Profiles per track (with aliases to prevent ID mismatches)
export const TRACK_ACOUSTIC_PROFILES = {
  'night-lights': {
    rootNote: 'D3',
    rootHz: 146.83,
    scale: 'pentatonic',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 3.2,
    timbreName: 'Crystalline Night Chimes',
    signatureDescription: 'Resonant bell-like clarity with nocturnal sparsity; brightness peaks over global metropolitan clusters.',
    artisticRationale: 'The pentatonic scale and bell-like triangle harmonics evoke human fragility and nocturnal serenity. By translating metropolitan radiance into crystalline chimes, the piece captures how civilization glows against the cosmic darkness.',
    spectralFocus: 'Optical 500-900nm (Night Lumens)',
  },
  'sea-currents-temperature': {
    rootNote: 'A2',
    rootHz: 110.0,
    scale: 'oceanic',
    oscType: 'sine',
    filterType: 'lowpass',
    resonanceQ: 1.2,
    timbreName: 'Fluid Oceanic Flow',
    signatureDescription: 'Deep sinusoidal undulation; warmer ocean waters open lowpass cutoff into lush harmonic chords.',
    artisticRationale: 'A rolling Oceanic scale in A2 (110 Hz) mirrors Earth\'s circulatory system. Warmer equatorial waters open the lowpass filter into lush harmonic swells, conveying the immense heat-storage capacity of our oceans.',
    spectralFocus: 'Thermal SST (0°C to 32°C)',
  },
  'geos-aerosols': {
    rootNote: 'E3',
    rootHz: 164.81,
    scale: 'lydian',
    oscType: 'sawtooth',
    filterType: 'lowpass',
    resonanceQ: 2.5,
    timbreName: 'Atmospheric Aerosol Swell',
    signatureDescription: 'Complex multi-layered texture; sea salt (blue) yields tranquil lows, dust/smoke triggers bright modal sweeps.',
    artisticRationale: 'Lydian modal tension in E3 reflects the dramatic intercontinental transport of Saharan dust and Amazonian wildfire smoke, musically illustrating the fragility and interconnectedness of our shared atmosphere.',
    spectralFocus: 'Aerosol Optical Depth (AOD)',
  },
  'air-quality': {
    rootNote: 'G3',
    rootHz: 196.0,
    scale: 'dorian',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 2.8,
    timbreName: 'Tropospheric Density Drone',
    signatureDescription: 'Reactive bandpass filter tracking urban PM2.5 and trace gas concentrations across North America.',
    artisticRationale: 'Dorian modal intervals reflect both natural beauty and industrial presence. Denser urban smog creates noticeable harmonic friction, turning invisible air pollution into an audible physical reality.',
    spectralFocus: 'Trace Gas & Particulate Matter (PM2.5)',
  },
  'perpetual-ocean-2': {
    rootNote: 'D2',
    rootHz: 73.42,
    scale: 'minor',
    oscType: 'sine',
    filterType: 'lowpass',
    resonanceQ: 1.8,
    timbreName: 'Deep Sub-Surface Gyre',
    signatureDescription: 'Resonant sub-bass foundation modeling the kinetic energy of western boundary currents like the Gulf Stream.',
    artisticRationale: 'Deep sub-bass sine waves in D2 (73.4 Hz) ground the listener in the immense kinetic power of the Gulf Stream and western boundary currents, conveying the silent power of deep ocean convection.',
    spectralFocus: 'Kinetic Energy & Flow Velocity (ECCO2)',
  },
  'co2-dyamond': {
    rootNote: 'F3',
    rootHz: 174.61,
    scale: 'harmonicMinor',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 3.5,
    timbreName: 'Carbon Cycles Polyphony',
    signatureDescription: 'Harmonic minor progression capturing global carbon dioxide plume transport and seasonal biospheric uptake.',
    artisticRationale: 'The somber harmonic minor scale in F3 reflects the solemn accumulation of greenhouse gases in Earth\'s atmosphere, translating unseen chemical trapping into poignant harmonic weight.',
    spectralFocus: 'Atmospheric CO2 Concentration (ppm)',
  },
  'iss-lightning': {
    rootNote: 'B3',
    rootHz: 246.94,
    scale: 'wholeTone',
    oscType: 'sawtooth',
    filterType: 'lowpass',
    resonanceQ: 4.2,
    timbreName: 'Transient Electrical Bursts',
    signatureDescription: 'High-frequency harmonic intervals with sharp envelopes corresponding to tropical convective lightning flashes.',
    artisticRationale: 'Whole-tone intervals in B3 create a sense of weightlessness and sudden discharge, mirroring the nocturnal lightning storms observed by astronauts orbiting aboard the International Space Station.',
    spectralFocus: 'Optical Transient Pulse (LIS 777.4nm)',
  },
  'lightning-iss': {
    rootNote: 'B3',
    rootHz: 246.94,
    scale: 'wholeTone',
    oscType: 'sawtooth',
    filterType: 'lowpass',
    resonanceQ: 4.2,
    timbreName: 'Transient Electrical Bursts',
    signatureDescription: 'High-frequency harmonic intervals with sharp envelopes corresponding to tropical convective lightning flashes.',
    artisticRationale: 'Whole-tone intervals in B3 create a sense of weightlessness and sudden discharge, mirroring the nocturnal lightning storms observed by astronauts orbiting aboard the International Space Station.',
    spectralFocus: 'Optical Transient Pulse (LIS 777.4nm)',
  },
  'atmospheric-river': {
    rootNote: 'C3',
    rootHz: 130.81,
    scale: 'dorian',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 2.0,
    timbreName: 'Vapor Plume Barometrics',
    signatureDescription: 'Sweeping atmospheric resonance tracing the long filamentary corridors of moisture crossing the Pacific.',
    artisticRationale: 'Dorian mode in C3 builds an auditory sense of accumulating moisture, capturing the staggering volume of water vapor coursing thousands of miles through the Pacific sky.',
    spectralFocus: 'Integrated Water Vapor (MERRA-2)',
  },
  'atmos_river': {
    rootNote: 'C3',
    rootHz: 130.81,
    scale: 'dorian',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 2.0,
    timbreName: 'Vapor Plume Barometrics',
    signatureDescription: 'Sweeping atmospheric resonance tracing the long filamentary corridors of moisture crossing the Pacific.',
    artisticRationale: 'Dorian mode in C3 builds an auditory sense of accumulating moisture, capturing the staggering volume of water vapor coursing thousands of miles through the Pacific sky.',
    spectralFocus: 'Integrated Water Vapor (MERRA-2)',
  },
  'gedi-forest-height': {
    rootNote: 'A3',
    rootHz: 220.0,
    scale: 'lydian',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 2.4,
    timbreName: 'Canopy Lidar Harmonics',
    signatureDescription: 'Vertical canopy height translates directly to octave dispersion; dense rainforests trigger luminous highs.',
    artisticRationale: 'Luminous Lydian harmonics in A3 ascend with canopy height, celebrating the towering biomass of Earth\'s ancient rainforests and providing an auditory benchmark of terrestrial carbon storage.',
    spectralFocus: 'Lidar Waveform Profile (GEDI 1064nm)',
  },
  'gedi-forest': {
    rootNote: 'A3',
    rootHz: 220.0,
    scale: 'lydian',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 2.4,
    timbreName: 'Canopy Lidar Harmonics',
    signatureDescription: 'Vertical canopy height translates directly to octave dispersion; dense rainforests trigger luminous highs.',
    artisticRationale: 'Luminous Lydian harmonics in A3 ascend with canopy height, celebrating the towering biomass of Earth\'s ancient rainforests and providing an auditory benchmark of terrestrial carbon storage.',
    spectralFocus: 'Lidar Waveform Profile (GEDI 1064nm)',
  },
  'worldview-terra-truecolor': {
    rootNote: 'C3',
    rootHz: 130.81,
    scale: 'pentatonic',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 1.5,
    timbreName: 'Terra Solar Reflectance',
    signatureDescription: 'Balanced broad-spectrum acoustic space mapping natural surface albedo across continents and oceans.',
    artisticRationale: 'The universal C3 pentatonic scale reflects the natural baseline of planet Earth under sunlight, offering an auditory counterpart to the famous Blue Marble perspective.',
    spectralFocus: 'MODIS Bands 1-4-3 (Red-Green-Blue)',
  },
  'worldview-viirs-snpp-truecolor': {
    rootNote: 'G3',
    rootHz: 196.0,
    scale: 'pentatonic',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 1.6,
    timbreName: 'Day-Night VIIRS Optic',
    signatureDescription: 'Pristine daylight clarity with crisp harmonic overtones highlighting weather fronts and sea ice margins.',
    artisticRationale: 'Crisp G3 pentatonic harmonics provide a bright, balanced auditory journey across day and night hemispheres, reflecting the precision of modern Earth observation satellites.',
    spectralFocus: 'VIIRS Visible & Near-Infrared',
  },
  'worldview-snpp-truecolor': {
    rootNote: 'G3',
    rootHz: 196.0,
    scale: 'pentatonic',
    oscType: 'triangle',
    filterType: 'lowpass',
    resonanceQ: 1.6,
    timbreName: 'Day-Night VIIRS Optic',
    signatureDescription: 'Pristine daylight clarity with crisp harmonic overtones highlighting weather fronts and sea ice margins.',
    artisticRationale: 'Crisp G3 pentatonic harmonics provide a bright, balanced auditory journey across day and night hemispheres, reflecting the precision of modern Earth observation satellites.',
    spectralFocus: 'VIIRS Visible & Near-Infrared',
  },
  'worldview-land-surface-temp': {
    rootNote: 'Eb3',
    rootHz: 155.56,
    scale: 'minor',
    oscType: 'sawtooth',
    filterType: 'lowpass',
    resonanceQ: 3.0,
    timbreName: 'Thermal Radiance Spectrum',
    signatureDescription: 'High thermal dynamics; intense desert heat drives warm harmonic filter cutoffs while polar cryospheres whisper in sub-bass.',
    artisticRationale: 'Minor mode in Eb3 captures the stark contrast between scorching continental deserts and frozen polar ice sheets, aurally dramatizing extreme thermal gradients.',
    spectralFocus: 'Thermal Infrared (11-12 µm)',
  },
  'worldview-airs-precipitation': {
    rootNote: 'F2',
    rootHz: 87.31,
    scale: 'oceanic',
    oscType: 'sine',
    filterType: 'lowpass',
    resonanceQ: 2.2,
    timbreName: 'Hydrological Rain Drone',
    signatureDescription: 'Deep, resonant aqueous drone driven by microwave-sounding rain rates in tropical convective systems.',
    artisticRationale: 'Deep F2 oceanic drone evokes the life-giving weight of monsoons and tropical rainfall systems, grounding the listener in global water cycle dynamics.',
    spectralFocus: 'Microwave Precipitation Sounding (AIRS)',
  },
}

export const defaultConfig = {
  rows: 8,
  sweepSeconds: 14,
  scale: 'pentatonic',
  rootHz: 130.81,
  octaves: 3,
  oscType: 'triangle',
  resonanceQ: 1.5,
}

// Global Earth Location Markers for "Take a Tour" (matching exact track IDs in nasa-assets.json)
export const GEO_TOUR_STOPS = [
  {
    id: 'sahara-dust',
    title: 'Saharan Dust Storm',
    trackId: 'geos-aerosols',
    lat: 21.0,
    lon: -15.0,
    x01: 0.45,
    description: 'Vast plumes of airborne mineral dust blowing west over the Atlantic, rich in pink/orange aerosol timbres.',
  },
  {
    id: 'hurricane-erin',
    title: 'Hurricane Erin Vortex',
    trackId: 'geos-aerosols',
    lat: 28.5,
    lon: -64.0,
    x01: 0.32,
    description: 'Spiral cyclone structure off the American coast with sea salt aerosol resonance in the lower bands.',
  },
  {
    id: 'gulf-stream',
    title: 'Gulf Stream Boundary Current',
    trackId: 'perpetual-ocean-2',
    lat: 36.0,
    lon: -73.0,
    x01: 0.30,
    description: 'High-velocity western boundary current circulating kinetic energy northeastward through sub-surface octaves.',
  },
  {
    id: 'amazon-canopy',
    title: 'Amazon Rainforest Canopy',
    trackId: 'gedi-forest-height',
    lat: -3.5,
    lon: -62.0,
    x01: 0.33,
    description: 'The dense multi-tiered tropical forest canopy reaching up to 45m height, ringing in luminous overtone frequencies.',
  },
  {
    id: 'east-asia-lights',
    title: 'East Asia Megalopolis',
    trackId: 'night-lights',
    lat: 34.0,
    lon: 118.0,
    x01: 0.83,
    description: 'High nocturnal luminous flux across coastal metropolitan hubs, triggering bright chime arpeggios.',
  },
  {
    id: 'pacific-river',
    title: 'Pacific Atmospheric River',
    trackId: 'atmospheric-river',
    lat: 42.0,
    lon: -140.0,
    x01: 0.11,
    description: 'Tropospheric water vapor transport belt delivering heavy moisture to coastal mountain ranges.',
  },
  {
    id: 'congo-lightning',
    title: 'Congo Basin Storm Cluster',
    trackId: 'iss-lightning',
    lat: -1.0,
    lon: 22.0,
    x01: 0.56,
    description: 'The highest annual flash density on Earth, creating sharp impulsive frequency transitions in whole-tone intervals.',
  },
]

const semitoneToHz = (root, semis) => root * Math.pow(2, semis / 12)

function noteFromScale(scaleName, index) {
  const steps = SCALES[scaleName] || SCALES.pentatonic
  const octave = Math.floor(index / steps.length)
  return steps[index % steps.length] + 12 * octave
}

export function bandsToVoices(bands, config = defaultConfig) {
  const scaleName = config.scale || 'pentatonic'
  const steps = SCALES[scaleName] || SCALES.pentatonic
  const totalNotes = steps.length * (config.octaves || 3)

  return bands.map((band, i) => {
    const fromBottom = bands.length - 1 - i
    const noteIndex = Math.round((fromBottom / (bands.length - 1)) * (totalNotes - 1))
    const freq = semitoneToHz(config.rootHz, noteFromScale(scaleName, noteIndex))

    const brightness = (band.r * 0.2126 + band.g * 0.7152 + band.b * 0.0722) / 255
    const gain = Math.pow(brightness, 1.5) * 0.22

    const warmth = Math.min(1, Math.max(0, (band.r - band.b) / 255 * 0.8 + 0.5))

    return { freq, gain, warmth, band, row: i }
  })
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export function hzToNoteName(hz) {
  if (!hz || isNaN(hz)) return '--'
  const midi = Math.round(69 + 12 * Math.log2(hz / 440))
  return NOTE_NAMES[((midi % 12) + 12) % 12] + (Math.floor(midi / 12) - 1)
}
