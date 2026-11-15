// src/lib/standins.js
// Procedural stand-in artwork generator (1024x512 canvas, 2:1 equirectangular ratio)
// Strictly labeled: "Preview picture: a generated stand-in, not a NASA image."
// Never presented as NASA data. Used for fallback, offline resilience, and preview mode.

function createPRNG(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return function () {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/**
 * Generates a procedural 1024x512 stand-in canvas.
 * @param {'lights' | 'ocean' | 'aerosol'} kind
 * @param {number} seed
 * @returns {HTMLCanvasElement}
 */
export function generateStandInCanvas(kind = 'lights', seed = 42) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  const rand = createPRNG(seed)

  if (kind === 'lights') {
    // Dark oceanic field with clusters of warm and violet city lights
    ctx.fillStyle = '#050714'
    ctx.fillRect(0, 0, 1024, 512)

    // Continents / clusters
    const numClusters = 18
    const clusters = []
    for (let i = 0; i < numClusters; i++) {
      clusters.push({
        x: 100 + rand() * 824,
        y: 100 + rand() * 312,
        count: Math.floor(60 + rand() * 140),
        spread: 30 + rand() * 60,
      })
    }

    // Draw lights around clusters
    clusters.forEach((c) => {
      for (let j = 0; j < c.count; j++) {
        const angle = rand() * Math.PI * 2
        const dist = Math.pow(rand(), 2) * c.spread
        const x = c.x + Math.cos(angle) * dist
        const y = c.y + Math.sin(angle) * dist
        const r = 1 + rand() * 2.5
        const isWarm = rand() > 0.4
        ctx.fillStyle = isWarm ? (rand() > 0.5 ? '#ffdc73' : '#ff9534') : '#b388ff'
        ctx.globalAlpha = 0.4 + rand() * 0.6
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.globalAlpha = 1.0
  } else if (kind === 'ocean') {
    // Flowing current lines coloured from blue (north/polar) to red/yellow (tropics) down the image
    ctx.fillStyle = '#0a1428'
    ctx.fillRect(0, 0, 1024, 512)

    const numFlows = 220
    ctx.lineWidth = 1.6
    for (let i = 0; i < numFlows; i++) {
      let x = rand() * 1024
      let y = rand() * 512
      // Color depends on latitude (y)
      const latFraction = Math.abs(y - 256) / 256 // 0 at equator, 1 at poles
      if (latFraction > 0.65) {
        ctx.strokeStyle = '#2b7fff' // Cold polar blue
      } else if (latFraction > 0.35) {
        ctx.strokeStyle = '#2bd9a0' // Temperate green
      } else if (latFraction > 0.15) {
        ctx.strokeStyle = '#ffd043' // Subtropical yellow
      } else {
        ctx.strokeStyle = '#ff4a4a' // Tropical warm red
      }
      ctx.globalAlpha = 0.3 + rand() * 0.5

      ctx.beginPath()
      ctx.moveTo(x, y)
      const length = 40 + rand() * 80
      for (let step = 0; step < length; step += 5) {
        const angle = Math.sin(x * 0.015) * 0.8 + Math.cos(y * 0.02) * 0.6
        x += Math.cos(angle) * 5
        y += Math.sin(angle) * 2
        ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1.0
  } else if (kind === 'aerosol') {
    // Translucent blobs in blue (sea salt), pink (dust), orange (smoke), and green (sulfates)
    ctx.fillStyle = '#060a16'
    ctx.fillRect(0, 0, 1024, 512)

    const blobs = [
      { color: 'rgba(56, 140, 255, 0.45)', count: 35 }, // Blue sea salt
      { color: 'rgba(255, 120, 180, 0.45)', count: 28 }, // Pink dust
      { color: 'rgba(255, 130, 45, 0.5)', count: 32 },  // Orange smoke
      { color: 'rgba(60, 220, 110, 0.45)', count: 25 }, // Green sulfate
    ]

    blobs.forEach((group) => {
      ctx.fillStyle = group.color
      for (let i = 0; i < group.count; i++) {
        const x = rand() * 1024
        const y = rand() * 512
        const rad = 25 + rand() * 70
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }

  // Visible stand-in label on generated preview canvas
  ctx.save()
  ctx.font = 'bold 13px sans-serif'
  ctx.fillStyle = 'rgba(255, 92, 176, 0.85)'
  ctx.textAlign = 'right'
  ctx.fillText('Preview picture: a generated stand-in, not a NASA image', 1004, 498)
  ctx.restore()

  return canvas
}

/**
 * Map track ID to stand-in kind
 */
export function getTrackStandInKind(trackId = '') {
  if (trackId.includes('lights')) return 'lights'
  if (trackId.includes('ocean') || trackId.includes('current') || trackId.includes('river')) return 'ocean'
  return 'aerosol'
}
