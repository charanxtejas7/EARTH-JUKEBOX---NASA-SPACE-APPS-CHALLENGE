// src/audio/engine.js
// Real-time Web Audio Synthesizer with distinctive acoustic profiles,
// live frequency/time analysis, and in-browser WAV export.
import { bandsToVoices } from './mapping.js'

export class Sonifier {
  constructor() {
    this.ctx = null
    this.voices = []
    this.analyser = null
    this.timeData = null
  }

  // Ensure AudioContext is initialized and active
  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  // Unlock Web Audio for mobile browsers (iOS Safari & Android Chrome)
  unlockAudio() {
    this.ensureContext()
    try {
      const buffer = this.ctx.createBuffer(1, 1, 22050)
      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      source.connect(this.ctx.destination)
      source.start(0)
    } catch (e) {}
  }

  start(rowCount = 8, profile = {}) {
    this.ensureContext()

    // If voices have already been created, resume and reconfigure
    if (this.voices && this.voices.length > 0) {
      this.reconfigure(profile)
      return
    }

    // Master bus & Limiter
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.85

    this.limiter = this.ctx.createDynamicsCompressor()
    this.limiter.threshold.setValueAtTime(-12, this.ctx.currentTime)
    this.limiter.knee.setValueAtTime(8, this.ctx.currentTime)
    this.limiter.ratio.setValueAtTime(12, this.ctx.currentTime)
    this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime)
    this.limiter.release.setValueAtTime(0.15, this.ctx.currentTime)

    // Real-time Analyser node for UI Oscilloscope & Spectral DNA
    this.analyser = this.ctx.createAnalyser()
    this.analyser.fftSize = 256
    this.timeData = new Uint8Array(this.analyser.frequencyBinCount)

    this.master.connect(this.limiter)
    this.limiter.connect(this.analyser)
    this.analyser.connect(this.ctx.destination)

    const oscType = profile.oscType || 'triangle'
    const resonanceQ = profile.resonanceQ || 1.5

    this.voices = []
    for (let i = 0; i < rowCount; i++) {
      const osc = this.ctx.createOscillator()
      osc.type = oscType

      const filter = this.ctx.createBiquadFilter()
      filter.type = profile.filterType || 'lowpass'
      filter.frequency.value = 1200
      filter.Q.value = resonanceQ

      const gain = this.ctx.createGain()
      gain.gain.value = 0

      const pan = typeof this.ctx.createStereoPanner === 'function' ? this.ctx.createStereoPanner() : null

      if (pan) {
        osc.connect(filter).connect(gain).connect(pan).connect(this.master)
      } else {
        osc.connect(filter).connect(gain).connect(this.master)
      }
      osc.start()
      this.voices.push({ osc, filter, gain, pan })
    }
  }

  // Dynamically update voice waveforms and filter Q when changing track profile
  reconfigure(profile = {}) {
    if (!this.ctx || !this.voices.length) return
    const oscType = profile.oscType || 'triangle'
    const resonanceQ = profile.resonanceQ || 1.5
    this.voices.forEach((v) => {
      try {
        v.osc.type = oscType
        v.filter.Q.setTargetAtTime(resonanceQ, this.ctx.currentTime, 0.05)
      } catch (e) {}
    })
  }

  update(voices, x01) {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const glide = 0.08

    voices.forEach((v, i) => {
      const slot = this.voices[i]
      if (!slot) return
      slot.osc.frequency.setTargetAtTime(v.freq, t, glide)
      slot.gain.gain.setTargetAtTime(v.gain, t, glide)

      // Cutoff dynamically responds to warmth and frequency band
      const cutoffHz = 350 + v.warmth * 3800
      slot.filter.frequency.setTargetAtTime(cutoffHz, t, glide)

      // Stereo panning from west to east
      if (slot.pan && slot.pan.pan) {
        slot.pan.pan.setTargetAtTime(x01 * 2 - 1, t, glide)
      }
    })
  }

  getWaveform() {
    if (!this.analyser || !this.timeData) return null
    this.analyser.getByteTimeDomainData(this.timeData)
    return this.timeData
  }

  getFrequencyData() {
    if (!this.analyser) return null
    const freqData = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(freqData)
    return freqData
  }

  silence() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    this.voices.forEach((s) => {
      try {
        s.gain.gain.setTargetAtTime(0, t, 0.05)
      } catch (e) {}
    })
  }
}

/**
 * Offline Audio Renderer & WAV Encoder.
 * Renders an exact 14-second sonification sweep into a stereo 16-bit 44.1kHz WAV Blob.
 */
export async function renderSoundscapeWav(readColumnFn, mediaEl, config, durationSeconds = 14, metadata = {}) {
  const sampleRate = 44100
  const totalSamples = Math.floor(sampleRate * durationSeconds)
  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    2,
    totalSamples,
    sampleRate
  )

  const master = offlineCtx.createGain()
  master.gain.value = 0.85

  const limiter = offlineCtx.createDynamicsCompressor()
  master.connect(limiter).connect(offlineCtx.destination)

  const voices = []
  for (let i = 0; i < config.rows; i++) {
    const osc = offlineCtx.createOscillator()
    osc.type = config.oscType || 'triangle'
    const filter = offlineCtx.createBiquadFilter()
    filter.type = config.filterType || 'lowpass'
    filter.Q.value = config.resonanceQ || 1.5
    const gain = offlineCtx.createGain()
    gain.gain.value = 0
    const pan = typeof offlineCtx.createStereoPanner === 'function' ? offlineCtx.createStereoPanner() : null

    if (pan) {
      osc.connect(filter).connect(gain).connect(pan).connect(master)
    } else {
      osc.connect(filter).connect(gain).connect(master)
    }
    osc.start(0)
    voices.push({ osc, filter, gain, pan })
  }

  // Schedule timeline updates every 100ms
  const steps = Math.floor(durationSeconds * 10)
  for (let s = 0; s < steps; s++) {
    const t = s * 0.1
    const x01 = (t / durationSeconds) % 1
    const bands = readColumnFn(mediaEl, x01, config.rows)
    if (!bands) continue
    const computedVoices = bandsToVoices(bands, config)

    computedVoices.forEach((v, i) => {
      const slot = voices[i]
      if (!slot) return
      slot.osc.frequency.setValueAtTime(v.freq, t)
      slot.gain.gain.setValueAtTime(v.gain, t)
      slot.filter.frequency.setValueAtTime(350 + v.warmth * 3800, t)
      if (slot.pan && slot.pan.pan) {
        slot.pan.pan.setValueAtTime(x01 * 2 - 1, t)
      }
    })
  }

  const renderedBuffer = await offlineCtx.startRendering()
  return audioBufferToWav(renderedBuffer, metadata)
}

/**
 * Encode an AudioBuffer into a 16-bit PCM WAV Blob with standard RIFF LIST/INFO metadata.
 */
export function audioBufferToWav(buffer, metadata = {}) {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // 1 = Linear PCM
  const bitDepth = 16

  const left = buffer.getChannelData(0)
  const right = numChannels > 1 ? buffer.getChannelData(1) : left
  const numSamples = left.length
  const dataSize = numSamples * numChannels * (bitDepth / 8)

  // Construct RIFF LIST/INFO subchunks
  // INAM: Title, IART: Artist/Credit, ICMT: Comment, ICRD: Date, ISFT: Software
  const infoItems = [
    { id: 'INAM', text: metadata.title || 'Earth Jukebox Sonification' },
    { id: 'IART', text: metadata.credit || "NASA's Scientific Visualization Studio" },
    {
      id: 'ICMT',
      text: metadata.comment || 'audio generated by Earth Jukebox code (AI-assisted code, reviewed by the team)',
    },
    { id: 'ICRD', text: metadata.date || new Date().toISOString().slice(0, 10) },
    { id: 'ISFT', text: 'Earth Jukebox' },
  ]

  // Encode subchunks into binary blocks with word alignment
  const encoder = new TextEncoder()
  const encodedSubchunks = []
  let totalListBodySize = 4 // 'INFO' header (4 bytes)

  for (const item of infoItems) {
    const textBytes = encoder.encode(item.text)
    const rawLen = textBytes.length + 1 // include null terminator
    const paddedLen = rawLen % 2 === 0 ? rawLen : rawLen + 1
    encodedSubchunks.push({
      id: item.id,
      textBytes,
      rawLen,
      paddedLen,
    })
    totalListBodySize += 8 + paddedLen // 4 bytes ID + 4 bytes size + padded data
  }

  const listChunkTotalSize = 8 + totalListBodySize // 'LIST' + uint32 size + body
  const headerTotalSize = 44 + listChunkTotalSize
  const wavBuffer = new ArrayBuffer(headerTotalSize + dataSize)
  const view = new DataView(wavBuffer)

  function writeString(offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  // 1. RIFF chunk descriptor
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + listChunkTotalSize + dataSize, true)
  writeString(8, 'WAVE')

  // 2. fmt sub-chunk
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true)
  view.setUint16(32, numChannels * (bitDepth / 8), true)
  view.setUint16(34, bitDepth, true)

  // 3. LIST INFO chunk
  let offset = 36
  writeString(offset, 'LIST')
  view.setUint32(offset + 4, totalListBodySize, true)
  writeString(offset + 8, 'INFO')
  offset += 12

  for (const sub of encodedSubchunks) {
    writeString(offset, sub.id)
    view.setUint32(offset + 4, sub.rawLen, true)
    offset += 8
    for (let i = 0; i < sub.textBytes.length; i++) {
      view.setUint8(offset + i, sub.textBytes[i])
    }
    view.setUint8(offset + sub.textBytes.length, 0)
    if (sub.paddedLen > sub.rawLen) {
      view.setUint8(offset + sub.rawLen, 0)
    }
    offset += sub.paddedLen
  }

  // 4. data sub-chunk
  writeString(offset, 'data')
  view.setUint32(offset + 4, dataSize, true)
  offset += 8

  // 5. Interleave audio samples (16-bit signed PCM)
  for (let i = 0; i < numSamples; i++) {
    const sL = Math.max(-1, Math.min(1, left[i]))
    const sR = Math.max(-1, Math.min(1, right[i]))

    view.setInt16(offset, sL < 0 ? sL * 0x8000 : sL * 0x7fff, true)
    offset += 2
    view.setInt16(offset, sR < 0 ? sR * 0x8000 : sR * 0x7fff, true)
    offset += 2
  }

  return new Blob([wavBuffer], { type: 'audio/wav' })
}

/**
 * Parses and verifies WAV headers and LIST/INFO metadata from an ArrayBuffer.
 */
export function parseWavInfo(arrayBuffer) {
  const view = new DataView(arrayBuffer)
  const decoder = new TextDecoder('utf-8')

  function readString(offset, length) {
    let str = ''
    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(view.getUint8(offset + i))
    }
    return str
  }

  const riff = readString(0, 4)
  const wave = readString(8, 4)
  if (riff !== 'RIFF' || wave !== 'WAVE') {
    throw new Error('Not a valid RIFF WAVE buffer')
  }

  let offset = 12
  const metadata = {}
  let audioFormat = null
  let numChannels = null
  let sampleRate = null
  let bitDepth = null
  let dataSize = null

  while (offset < view.byteLength - 8) {
    const chunkId = readString(offset, 4)
    const chunkSize = view.getUint32(offset + 4, true)
    offset += 8

    if (chunkId === 'fmt ') {
      audioFormat = view.getUint16(offset, true)
      numChannels = view.getUint16(offset + 2, true)
      sampleRate = view.getUint32(offset + 4, true)
      bitDepth = view.getUint16(offset + 14, true)
      offset += chunkSize
    } else if (chunkId === 'LIST') {
      const type = readString(offset, 4)
      if (type === 'INFO') {
        let listOffset = offset + 4
        const listEnd = offset + chunkSize
        while (listOffset < listEnd - 8) {
          const subId = readString(listOffset, 4)
          const subSize = view.getUint32(listOffset + 4, true)
          listOffset += 8
          const subBytes = new Uint8Array(arrayBuffer, listOffset, Math.max(0, subSize - 1))
          metadata[subId] = decoder.decode(subBytes)
          const paddedSize = subSize % 2 === 0 ? subSize : subSize + 1
          listOffset += paddedSize
        }
      }
      offset += chunkSize
    } else if (chunkId === 'data') {
      dataSize = chunkSize
      offset += chunkSize
    } else {
      offset += chunkSize
    }
  }

  return {
    format: audioFormat === 1 ? 'PCM' : audioFormat,
    numChannels,
    sampleRate,
    bitDepth,
    dataSize,
    metadata,
  }
}
