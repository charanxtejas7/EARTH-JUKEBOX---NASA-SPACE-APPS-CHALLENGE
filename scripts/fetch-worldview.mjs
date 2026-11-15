// fetch-worldview.mjs
// Downloads verified NASA Worldview / GIBS still images into public/media/
// and registers them in manifest.json and nasa-assets.json.
//
// Rules followed:
// - Allowlist only official NASA Earthdata hosts: wvs.earthdata.nasa.gov and gibs.earthdata.nasa.gov
// - Download at setup time into public/media/ (nothing fetched at runtime)
// - Fixed dates and official catalogue layer IDs only
// - Official NASA ESDIS acknowledgment credit line recorded
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_FILE = path.join(ROOT, 'src/data/nasa-assets.json')
const OUT_DIR = path.join(ROOT, 'public/media')
const MANIFEST_FILE = path.join(OUT_DIR, 'manifest.json')

// Strict allowlist of official NASA hosts
const ALLOWED_HOSTS = new Set([
  'wvs.earthdata.nasa.gov',
  'gibs.earthdata.nasa.gov',
])

function assertNasaHost(urlStr) {
  const u = new URL(urlStr)
  if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname)) {
    throw new Error(`Refusing non-allowed host: ${urlStr}`)
  }
}

// 4 distinct Earth layers from official GIBS catalogue with fixed dates
export const WORLDVIEW_TRACKS = [
  {
    id: 'worldview-terra-truecolor',
    title: 'Worldview: Terra True Color, 1 June 2024',
    layerId: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    date: '2024-06-01',
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2024-06-01T00:00:00Z&BBOX=-90,-180,90,180&CRS=EPSG:4326&LAYERS=MODIS_Terra_CorrectedReflectance_TrueColor&FORMAT=image/jpeg&WIDTH=1024&HEIGHT=512',
    file: 'worldview-terra-2024-06-01.jpg',
    source: 'https://worldview.earthdata.nasa.gov/?v=-180,-90,180,90&l=MODIS_Terra_CorrectedReflectance_TrueColor&t=2024-06-01-T00%3A00%3A00Z',
    plainDescription: 'Global true-color satellite snapshot of layer MODIS_Terra_CorrectedReflectance_TrueColor captured on 2024-06-01 by NASA\'s Terra satellite.',
    credit: 'NASA Global Imagery Browse Services (GIBS) and NASA Worldview, part of NASA\'s Earth Science Data and Information System (ESDIS)',
    dataCredit: 'NASA Terra / MODIS instrument.',
  },
  {
    id: 'worldview-viirs-snpp-truecolor',
    title: 'Worldview: Suomi NPP True Color, 22 September 2024',
    layerId: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    date: '2024-09-22',
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2024-09-22T00:00:00Z&BBOX=-90,-180,90,180&CRS=EPSG:4326&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&FORMAT=image/jpeg&WIDTH=1024&HEIGHT=512',
    file: 'worldview-viirs-snpp-2024-09-22.jpg',
    source: 'https://worldview.earthdata.nasa.gov/?v=-180,-90,180,90&l=VIIRS_SNPP_CorrectedReflectance_TrueColor&t=2024-09-22-T00%3A00%3A00Z',
    plainDescription: 'Global true-color snapshot of layer VIIRS_SNPP_CorrectedReflectance_TrueColor on the 2024 autumnal equinox (2024-09-22) captured by Suomi NPP.',
    credit: 'NASA Global Imagery Browse Services (GIBS) and NASA Worldview, part of NASA\'s Earth Science Data and Information System (ESDIS)',
    dataCredit: 'Suomi NPP / VIIRS instrument.',
  },
  {
    id: 'worldview-land-surface-temp',
    title: 'Worldview: Land Surface Temperature, 1 June 2024',
    layerId: 'MODIS_Terra_Land_Surface_Temp_Day',
    date: '2024-06-01',
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2024-06-01T00:00:00Z&BBOX=-90,-180,90,180&CRS=EPSG:4326&LAYERS=MODIS_Terra_Land_Surface_Temp_Day&FORMAT=image/jpeg&WIDTH=1024&HEIGHT=512',
    file: 'worldview-land-surface-temp-2024-06-01.jpg',
    source: 'https://worldview.earthdata.nasa.gov/?v=-180,-90,180,90&l=MODIS_Terra_Land_Surface_Temp_Day&t=2024-06-01-T00%3A00%3A00Z',
    plainDescription: 'Global daytime thermal emissions snapshot of layer MODIS_Terra_Land_Surface_Temp_Day on 2024-06-01 showing terrestrial heat distribution.',
    credit: 'NASA Global Imagery Browse Services (GIBS) and NASA Worldview, part of NASA\'s Earth Science Data and Information System (ESDIS)',
    dataCredit: 'NASA Terra / MODIS Land Surface Temperature product.',
  },
  {
    id: 'worldview-airs-precipitation',
    title: 'Worldview: AIRS Precipitation, 1 June 2024',
    layerId: 'AIRS_Precipitation_Day',
    date: '2024-06-01',
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&TIME=2024-06-01T00:00:00Z&BBOX=-90,-180,90,180&CRS=EPSG:4326&LAYERS=AIRS_Precipitation_Day&FORMAT=image/jpeg&WIDTH=1024&HEIGHT=512',
    file: 'worldview-airs-precipitation-2024-06-01.jpg',
    source: 'https://worldview.earthdata.nasa.gov/?v=-180,-90,180,90&l=AIRS_Precipitation_Day&t=2024-06-01-T00%3A00%3A00Z',
    plainDescription: 'Global atmospheric precipitation snapshot of layer AIRS_Precipitation_Day on 2024-06-01 showing daily rainfall and storm systems.',
    credit: 'NASA Global Imagery Browse Services (GIBS) and NASA Worldview, part of NASA\'s Earth Science Data and Information System (ESDIS)',
    dataCredit: 'Atmospheric Infrared Sounder (AIRS) aboard NASA\'s Aqua satellite.',
  },
]

async function exists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

async function downloadTrack(track) {
  assertNasaHost(track.url)
  const dest = path.join(OUT_DIR, track.file)
  if (await exists(dest)) {
    console.log(`  skip (already downloaded): ${track.file}`)
    return
  }
  console.log(`  downloading ${track.file} from ${track.layerId} (${track.date})...`)
  const res = await fetch(track.url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${track.url}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
  console.log(`  saved to public/media/${track.file}`)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // Read existing manifest or initialize
  let manifest = {}
  try {
    manifest = JSON.parse(await readFile(MANIFEST_FILE, 'utf8'))
  } catch {}

  // Read existing nasa-assets.json
  const data = JSON.parse(await readFile(DATA_FILE, 'utf8'))

  for (const t of WORLDVIEW_TRACKS) {
    try {
      await downloadTrack(t)

      // Add to manifest
      manifest[t.id] = { file: `/media/${t.file}`, type: 'image' }

      // Update or insert track in nasa-assets.json
      const existingIdx = data.tracks.findIndex((x) => x.id === t.id)
      const trackEntry = {
        id: t.id,
        title: t.title,
        source: t.source,
        layerId: t.layerId,
        date: t.date,
        plainDescription: t.plainDescription,
        credit: t.credit,
        dataCredit: t.dataCredit,
        verified: true,
        assets: [
          {
            url: t.url,
            file: t.file,
            type: 'image',
            primary: true,
            note: '1024x512 JPEG, official NASA GIBS snapshot API',
          },
        ],
      }

      if (existingIdx >= 0) {
        data.tracks[existingIdx] = trackEntry
      } else {
        data.tracks.push(trackEntry)
      }
    } catch (err) {
      console.warn(`  FAILED to download ${t.id}:`, err.message)
    }
  }

  // Persist updated manifest and assets json
  await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2))
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2))

  console.log(`\nWorldview downloads complete. Updated manifest and nasa-assets.json.`)
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
