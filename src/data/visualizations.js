// visualizations.js
// Builds the track list from nasa-assets.json, the one place that holds NASA file links and credits.
// Files appear in the app after you run:  npm run fetch:nasa
// (that downloads from svs.gsfc.nasa.gov only and writes public/media/manifest.json).
import data from './nasa-assets.json'

export const visualizations = data.tracks.map((t) => ({ ...t, file: null, type: null }))
export const referenceSources = data.references
