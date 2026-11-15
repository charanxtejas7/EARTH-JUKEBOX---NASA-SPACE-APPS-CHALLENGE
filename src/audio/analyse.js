// src/audio/analyse.js
// Computer vision color analysis and deterministic sonification extraction.
// Shrinks the input frame onto a 160x80 canvas to sample columns and full-spectrum color histograms.

const GRID_W = 160
const GRID_H = 80

const scratch = document.createElement('canvas')
scratch.width = GRID_W
scratch.height = GRID_H
const scratchCtx = scratch.getContext('2d', { willReadFrequently: true })

/**
 * Samples a 3px vertical column at progress x01 and averages into `rows` bands.
 */
export function readColumn(mediaEl, x01, rows) {
  if (!mediaEl) return null
  try {
    scratchCtx.drawImage(mediaEl, 0, 0, GRID_W, GRID_H)
    const x = Math.min(GRID_W - 3, Math.max(0, Math.floor(x01 * GRID_W)))
    const strip = scratchCtx.getImageData(x, 0, 3, GRID_H).data
    const bands = []
    const bandH = GRID_H / rows

    for (let b = 0; b < rows; b++) {
      let r = 0, g = 0, bl = 0, n = 0
      for (let y = Math.floor(b * bandH); y < Math.floor((b + 1) * bandH); y++) {
        for (let px = 0; px < 3; px++) {
          const i = (y * 3 + px) * 4
          r += strip[i]
          g += strip[i + 1]
          bl += strip[i + 2]
          n++
        }
      }
      bands.push({ r: r / n, g: g / n, b: bl / n })
    }
    return bands
  } catch (err) {
    console.warn('Could not read frame:', err)
    return null
  }
}

/**
 * Extracts complete full-frame Computer Vision & Spectral Distribution metrics.
 */
export function extractSpectralAndVisionMetrics(mediaEl) {
  if (!mediaEl) return null
  try {
    scratchCtx.drawImage(mediaEl, 0, 0, GRID_W, GRID_H)
    const imgData = scratchCtx.getImageData(0, 0, GRID_W, GRID_H).data
    const totalPixels = GRID_W * GRID_H

    let totalR = 0
    let totalG = 0
    let totalB = 0
    let totalLum = 0

    // Hue buckets: Red (330-30), Yellow/Orange (30-90), Green (90-150), Cyan (150-210), Blue (210-270), Magenta (270-330)
    const hueBuckets = { red: 0, orange: 0, yellow: 0, green: 0, cyan: 0, blue: 0, violet: 0 }

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i]
      const g = imgData[i + 1]
      const b = imgData[i + 2]

      totalR += r
      totalG += g
      totalB += b

      // BT.709 perceived luminance
      const lum = r * 0.2126 + g * 0.7152 + b * 0.0722
      totalLum += lum

      // RGB to Hue
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0
      if (max !== min) {
        const d = max - min
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
        else if (max === g) h = (b - r) / d + 2
        else if (max === b) h = (r - g) / d + 4
        h /= 6
      }
      const hueDeg = h * 360

      if (hueDeg >= 345 || hueDeg < 15) hueBuckets.red++
      else if (hueDeg >= 15 && hueDeg < 45) hueBuckets.orange++
      else if (hueDeg >= 45 && hueDeg < 75) hueBuckets.yellow++
      else if (hueDeg >= 75 && hueDeg < 165) hueBuckets.green++
      else if (hueDeg >= 165 && hueDeg < 195) hueBuckets.cyan++
      else if (hueDeg >= 195 && hueDeg < 270) hueBuckets.blue++
      else hueBuckets.violet++
    }

    const avgR = totalR / totalPixels
    const avgG = totalG / totalPixels
    const avgB = totalB / totalPixels
    const avgLum = totalLum / totalPixels

    const rgbSum = avgR + avgG + avgB || 1
    const spectralDistribution = {
      redPct: Math.round((avgR / rgbSum) * 100),
      greenPct: Math.round((avgG / rgbSum) * 100),
      bluePct: Math.round((avgB / rgbSum) * 100),
      avgR: Math.round(avgR),
      avgG: Math.round(avgG),
      avgB: Math.round(avgB),
      hueBuckets,
      colorTempK: Math.round(3000 + (avgB / (avgR || 1)) * 3500),
    }

    // Acoustic DNA Metrics
    const warmthIndex = ((avgR - avgB) / 255).toFixed(2)
    const spectralCentroidHz = Math.round(400 + (avgLum / 255) * 3200 + avgR * 4)
    const estimatedDbRange = Math.round(18 + (avgLum / 255) * 42)
    const harmonicDensity = ((spectralDistribution.greenPct + spectralDistribution.redPct) / 100).toFixed(2)

    return {
      totalSamplePoints: totalPixels,
      resolution: `${GRID_W}x${GRID_H}`,
      spectralDistribution,
      acousticDna: {
        warmthIndex,
        spectralCentroidHz,
        estimatedDbRange,
        harmonicDensity,
        meanLuminance: (avgLum / 255).toFixed(3),
      },
    }
  } catch (err) {
    console.warn('Error extracting metrics:', err)
    return null
  }
}
