// fetch-nasa.mjs
// Downloads the NASA files listed in src/data/nasa-assets.json into public/media/,
// and writes public/media/manifest.json so the app can find them.
//
//   npm run fetch:nasa                  download every verified asset
//   npm run list:nasa -- air-quality    list candidate file links on that track's SVS page
//
// Safety: only https://svs.gsfc.nasa.gov/ URLs are accepted. Nothing else is fetched.
// Check each page's credit and usage line, and NASA's reproduction guidelines, before you publish.
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA = path.join(ROOT, 'src/data/nasa-assets.json')
const OUT = path.join(ROOT, 'public/media')

function assertNasa(url) {
  const u = new URL(url)
  if (u.protocol !== 'https:' || u.hostname !== 'svs.gsfc.nasa.gov') {
    throw new Error(`Refusing non-NASA URL: ${url}`)
  }
}

async function exists(p) { try { await stat(p); return true } catch { return false } }

async function download(asset) {
  assertNasa(asset.url)
  const dest = path.join(OUT, asset.file)
  if (await exists(dest)) { console.log(`  skip (already there): ${asset.file}`); return }
  console.log(`  downloading ${asset.file} (${asset.note || 'size unknown'})`)
  const res = await fetch(asset.url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${asset.url}`)
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest))
}

async function listLinks(id) {
  const data = JSON.parse(await readFile(DATA, 'utf8'))
  const item = [...data.tracks, ...data.references].find((x) => x.id === id)
  if (!item) throw new Error(`No track with id "${id}"`)
  assertNasa(item.source)
  const html = await (await fetch(item.source)).text()
  const found = new Set()
  for (const m of html.matchAll(/href="([^"]*\/vis\/[^"]+\.(?:mp4|webm|m4v|mov|jpg|jpeg|png|tif|wav|mp3|srt))"/gi)) {
    found.add(new URL(m[1], item.source).href)
  }
  console.log(`Candidate files on ${item.source}:`)
  ;[...found].forEach((u) => console.log('  ' + u))
  console.log('\nPick one small, browser-friendly file (.jpg/.png/.webm/.mp4), add it to that track\'s "assets"')
  console.log('in src/data/nasa-assets.json (url, file, type, primary), set "verified": true, then run npm run fetch:nasa.')
}

async function main() {
  if (process.argv.includes('--list')) {
    const id = process.argv[process.argv.indexOf('--list') + 1]
    return listLinks(id)
  }
  await mkdir(OUT, { recursive: true })
  const data = JSON.parse(await readFile(DATA, 'utf8'))
  const manifest = {}
  for (const item of [...data.tracks, ...data.references]) {
    if (!item.assets?.length) continue
    console.log(item.title)
    for (const a of item.assets) {
      try { await download(a) } catch (e) { console.warn('  FAILED:', e.message); continue }
      if (a.primary) manifest[item.id] = { file: `/media/${a.file}`, type: a.type }
    }
  }
  await writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\nDone. ${Object.keys(manifest).length} items ready. Now run: npm run dev`)
}

main().catch((e) => { console.error(e.message); process.exit(1) })
