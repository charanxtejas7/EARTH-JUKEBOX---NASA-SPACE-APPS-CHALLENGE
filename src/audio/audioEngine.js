/**
 * Web Audio Engine for Earth Jukebox
 * NASA Space Apps 2026 - Challenge 14
 *
 * SCIENTIFIC METHODOLOGY & ACCESSIBILITY NOTICE:
 * All audio generated here is mathematically synthesized in real-time from
 * rendered pixel arrays (luminance, color channel distribution, and horizontal playhead position).
 * It does NOT represent raw NASA physical or scientific sensor telemetry.
 *
 * Free tools only: Standard browser Web Audio API (100% in-browser, 0 external API keys, 0 remote servers).
 */

class EarthAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.analyser = null;
    this.filterNode = null;
    this.pannerNode = null;

    // Synthesis Oscillators
    this.osc1 = null; // Fundamental tone
    this.osc2 = null; // Harmonic overtone
    this.osc3 = null; // Triad 5th or sub-octave

    this.osc1Gain = null;
    this.osc2Gain = null;
    this.osc3Gain = null;

    this.isPlaying = false;
    this.isMuted = false;

    // Sonification Modes: 'harmonic' (Atmospheric Ambient), 'triad' (RGB Chords), 'pulse' (Geological Rhythms)
    this.soundMode = 'harmonic';

    // Hard accessibility safety limit: Master volume cannot exceed 0.5 (50%)
    this.HARD_VOLUME_LIMIT = 0.5;
    this.currentVolume = 0.2; // Safe default volume
  }

  /**
   * Initializes the browser AudioContext upon user gesture.
   */
  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain Node with safety limiter
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);

      // FFT Analyser Node for the live oscilloscope and spectrum visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;

      // Resonant Biquad Filter for acoustic shaping
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(1200, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(2.5, this.ctx.currentTime);

      // Stereo panner for spatial position (left-to-right longitude scanning)
      if (this.ctx.createStereoPanner) {
        this.pannerNode = this.ctx.createStereoPanner();
        this.filterNode.connect(this.pannerNode);
        this.pannerNode.connect(this.masterGain);
      } else {
        this.filterNode.connect(this.masterGain);
      }

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Sets the active sonification mode.
   * @param {'harmonic' | 'triad' | 'pulse'} mode
   */
  setSoundMode(mode) {
    this.soundMode = mode;
    if (this.isPlaying) {
      // Re-configure active oscillators smoothly
      this.configureOscillatorTypes();
    }
  }

  /**
   * Configures oscillator waveforms and gains based on the active sound mode.
   */
  configureOscillatorTypes() {
    if (!this.osc1 || !this.osc2 || !this.osc3) return;
    const now = this.ctx.currentTime;

    if (this.soundMode === 'triad') {
      // Polyphonic RGB Triad chords
      this.osc1.type = 'sine'; // Red -> Root
      this.osc2.type = 'sine'; // Green -> Third
      this.osc3.type = 'sine'; // Blue -> Fifth

      this.osc1Gain.gain.setTargetAtTime(0.4, now, 0.05);
      this.osc2Gain.gain.setTargetAtTime(0.35, now, 0.05);
      this.osc3Gain.gain.setTargetAtTime(0.35, now, 0.05);
    } else if (this.soundMode === 'pulse') {
      // Geological pulse: warm square base with deep sub-bass
      this.osc1.type = 'sawtooth';
      this.osc2.type = 'sine';
      this.osc3.type = 'triangle';

      this.osc1Gain.gain.setTargetAtTime(0.2, now, 0.05);
      this.osc2Gain.gain.setTargetAtTime(0.4, now, 0.05);
      this.osc3Gain.gain.setTargetAtTime(0.3, now, 0.05);
    } else {
      // Default Harmonic Atmospheric
      this.osc1.type = 'sine';
      this.osc2.type = 'triangle';
      this.osc3.type = 'sine';

      this.osc1Gain.gain.setTargetAtTime(0.5, now, 0.05);
      this.osc2Gain.gain.setTargetAtTime(0.25, now, 0.05);
      this.osc3Gain.gain.setTargetAtTime(0.15, now, 0.05);
    }
  }

  /**
   * Starts sustained sonification tones.
   */
  start() {
    this.initContext();
    if (this.isPlaying) return;

    const now = this.ctx.currentTime;

    // Create 3 parallel voice oscillators
    this.osc1 = this.ctx.createOscillator();
    this.osc2 = this.ctx.createOscillator();
    this.osc3 = this.ctx.createOscillator();

    this.osc1Gain = this.ctx.createGain();
    this.osc2Gain = this.ctx.createGain();
    this.osc3Gain = this.ctx.createGain();

    this.configureOscillatorTypes();

    this.osc1.connect(this.osc1Gain);
    this.osc2.connect(this.osc2Gain);
    this.osc3.connect(this.osc3Gain);

    this.osc1Gain.connect(this.filterNode);
    this.osc2Gain.connect(this.filterNode);
    this.osc3Gain.connect(this.filterNode);

    this.osc1.start(now);
    this.osc2.start(now);
    this.osc3.start(now);

    this.isPlaying = true;
  }

  /**
   * Stops the oscillators smoothly with an exponential gain fade to eliminate clicks.
   */
  stop() {
    if (!this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.04);
      setTimeout(() => {
        [this.osc1, this.osc2, this.osc3].forEach((osc) => {
          if (osc) {
            osc.stop();
            osc.disconnect();
          }
        });
        this.osc1 = null;
        this.osc2 = null;
        this.osc3 = null;

        if (this.masterGain && this.ctx) {
          const restoreVol = this.isMuted ? 0 : this.currentVolume;
          this.masterGain.gain.setValueAtTime(restoreVol, this.ctx.currentTime);
        }
        this.isPlaying = false;
      }, 60);
    } catch {
      this.isPlaying = false;
    }
  }

  /**
   * Sets the volume with a strict accessibility hearing protection limit.
   * @param {number} val - Volume between 0.0 and 1.0 (clamped strictly at HARD_VOLUME_LIMIT)
   */
  setVolume(val) {
    const rawVal = parseFloat(val) || 0;
    const clamped = Math.min(Math.max(rawVal, 0), this.HARD_VOLUME_LIMIT);
    this.currentVolume = clamped;

    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02);
    }
    return clamped;
  }

  /**
   * Toggles mute state.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.currentVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
    }
    return this.isMuted;
  }

  /**
   * Provides time-domain waveform data for oscilloscope rendering.
   * @param {Uint8Array} dataArray
   */
  getWaveformData(dataArray) {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteTimeDomainData(dataArray);
    }
  }

  /**
   * Provides frequency-domain spectrum data for equalizer bars.
   * @param {Uint8Array} dataArray
   */
  getFrequencyData(dataArray) {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(dataArray);
    }
  }

  /**
   * Updates audio parameters in real-time based on pixel data from the scanned frame column.
   * NOTE: Sound is derived from RGB & luminosity of rendered canvas pixels.
   */
  updateFromFrameMetrics({ brightness, redRatio = 0.33, greenRatio = 0.33, blueRatio = 0.33, panPosition = 0 }) {
    if (!this.isPlaying || !this.ctx || !this.osc1) return;

    const now = this.ctx.currentTime;

    // Base root frequency calculated from luminance (130 Hz - 520 Hz: C3 to C5 range)
    const baseFreq = 130 + (brightness / 255) * 390;

    if (this.soundMode === 'triad') {
      // RGB Musical Triad Mapping:
      // Red channel modulates Root
      // Green channel modulates Third (Major third * 1.25 or Minor third * 1.2)
      // Blue channel modulates Perfect Fifth (* 1.5)
      const root = baseFreq * (0.8 + redRatio * 0.4);
      const isMajor = greenRatio >= blueRatio;
      const third = root * (isMajor ? 1.2599 : 1.1892);
      const fifth = root * 1.4983;

      this.osc1.frequency.setTargetAtTime(root, now, 0.04);
      this.osc2.frequency.setTargetAtTime(third, now, 0.04);
      this.osc3.frequency.setTargetAtTime(fifth, now, 0.04);

      if (this.filterNode) {
        const filterFreq = 600 + (greenRatio * 1800) + (brightness * 2);
        this.filterNode.frequency.setTargetAtTime(Math.min(filterFreq, 4800), now, 0.05);
      }
    } else if (this.soundMode === 'pulse') {
      // Geological Pulse:
      // Sub-octave frequency + terrain modulated rhythmic resonance
      this.osc1.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.04); // Sub octave
      this.osc2.frequency.setTargetAtTime(baseFreq, now, 0.04);
      this.osc3.frequency.setTargetAtTime(baseFreq * 2.0, now, 0.04);

      if (this.filterNode) {
        // High resonance for geological transitions
        const filterFreq = 300 + (greenRatio * 2200);
        this.filterNode.frequency.setTargetAtTime(Math.min(filterFreq, 3500), now, 0.03);
      }
    } else {
      // Atmospheric Ambient:
      this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.04);
      this.osc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.04);
      this.osc3.frequency.setTargetAtTime(baseFreq * 2.0, now, 0.04);

      if (this.filterNode) {
        const filterFreq = 400 + (greenRatio * 1600) + (brightness * 2.2);
        this.filterNode.frequency.setTargetAtTime(Math.min(filterFreq, 4200), now, 0.05);
      }
    }

    if (this.pannerNode && this.pannerNode.pan) {
      const clampedPan = Math.max(-1, Math.min(1, panPosition));
      this.pannerNode.pan.setTargetAtTime(clampedPan, now, 0.04);
    }
  }
}

export const audioEngine = new EarthAudioEngine();
