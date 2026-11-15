// src/lib/benchmark.js
// Automated benchmark and telemetry harness for Earth Jukebox
// Measures real frame times (300 frames) and click-to-sound latency (10 cycles).

export class PerformanceAuditor {
  constructor() {
    this.frameSamples = { globe: [], flat: [] }
    this.clickToSoundSamples = []
    this.isAuditingFrames = false
    this.currentMode = 'globe'
    this.onComplete = null
  }

  recordClickToSound(elapsedMs) {
    if (this.clickToSoundSamples.length < 10) {
      this.clickToSoundSamples.push(elapsedMs)
    }
  }

  getClickToSoundStats() {
    if (!this.clickToSoundSamples.length) return null
    const sorted = [...this.clickToSoundSamples].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    const mean = sum / sorted.length
    const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]
    return {
      count: sorted.length,
      samples: sorted,
      meanMs: Number(mean.toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
      minMs: Number(sorted[0].toFixed(2)),
      maxMs: Number(sorted[sorted.length - 1].toFixed(2)),
    }
  }

  startFrameAudit(mode = 'globe', sampleCount = 300, onDone = null) {
    this.currentMode = mode
    this.frameSamples[mode] = []
    this.isAuditingFrames = true
    this.onComplete = onDone

    let lastTime = performance.now()
    let count = 0

    const frameStep = (now) => {
      if (!this.isAuditingFrames) return
      const delta = now - lastTime
      lastTime = now

      // Skip the very first frame warmup delta
      if (count > 0) {
        this.frameSamples[mode].push(delta)
      }
      count++

      if (this.frameSamples[mode].length < sampleCount) {
        requestAnimationFrame(frameStep)
      } else {
        this.isAuditingFrames = false
        if (this.onComplete) this.onComplete(this.getFrameStats(mode))
      }
    }

    requestAnimationFrame(frameStep)
  }

  getFrameStats(mode) {
    const samples = this.frameSamples[mode] || []
    if (!samples.length) return null
    const sorted = [...samples].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    const mean = sum / sorted.length
    const dropsBelow55fps = samples.filter((d) => d > 18.18).length

    return {
      mode,
      sampleCount: samples.length,
      meanFrameTimeMs: Number(mean.toFixed(2)),
      fpsEquivalent: Number((1000 / mean).toFixed(1)),
      dropsBelow55fps,
      dropPercentage: Number(((dropsBelow55fps / samples.length) * 100).toFixed(1)),
      p95Ms: Number(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))].toFixed(2)),
    }
  }
}

export const auditor = new PerformanceAuditor()
if (typeof window !== 'undefined') {
  window.__EARTH_JUKEBOX_AUDITOR__ = auditor
}
