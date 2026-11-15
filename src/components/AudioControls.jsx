import React from 'react';
import Oscilloscope from './Oscilloscope';
import {
  PlayIcon,
  PauseIcon,
  VolumeIcon,
  VolumeMuteIcon,
  SlidersIcon,
  ShieldAlertIcon,
} from './icons/Icons';

/**
 * AudioControls Component
 *
 * Provides accessible sound playback controls, volume slider with
 * strict auditory protection limits, mute toggle, synthesis mode selector,
 * and real-time sonification telemetry metrics.
 *
 * Adheres to ui-ux-pro-max: min 44px touch targets, zero layout shifts, vector icons.
 */
export default function AudioControls({
  isPlaying,
  onTogglePlay,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  scanSpeed,
  onScanSpeedChange,
  scanMode,
  onScanModeChange,
  soundMode,
  onSoundModeChange,
  metrics,
  reducedMotion,
}) {
  return (
    <div className="panel" aria-labelledby="controls-heading">
      <div className="panel-header">
        <h2 id="controls-heading" className="panel-title">
          <SlidersIcon size={18} />
          Sonification Deck
        </h2>
        <span
          className="brand-badge"
          style={{
            background: isPlaying ? 'rgba(20, 184, 166, 0.15)' : 'rgba(100, 116, 139, 0.15)',
            borderColor: isPlaying ? 'rgba(20, 184, 166, 0.35)' : 'rgba(100, 116, 139, 0.25)',
            color: isPlaying ? 'var(--accent-teal)' : 'var(--text-muted)',
          }}
        >
          {isPlaying ? 'SYNTH ACTIVE' : 'MUTED'}
        </span>
      </div>

      {/* Main Play / Pause & Mute Actions (44px touch target) */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          className={`btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
          onClick={onTogglePlay}
          aria-pressed={isPlaying}
          style={{ flex: 1, minHeight: '46px' }}
        >
          {isPlaying ? (
            <>
              <PauseIcon size={18} />
              <span>Pause Sonification</span>
            </>
          ) : (
            <>
              <PlayIcon size={18} />
              <span>Start Sonification</span>
            </>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-secondary ${isMuted ? 'active-mute' : ''}`}
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          style={{ minWidth: '46px', minHeight: '46px', padding: '0 0.85rem' }}
        >
          {isMuted ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
        </button>
      </div>

      {/* Live Audio Oscilloscope & FFT Spectrum */}
      <Oscilloscope isPlaying={isPlaying} reducedMotion={reducedMotion} />

      {/* Synthesis Sound Mode Selector */}
      <div className="control-group">
        <label className="control-label">Synthesis Voice Profile</label>
        <div className="sound-mode-bar" role="radiogroup" aria-label="Synthesis Voice Profile">
          <button
            type="button"
            role="radio"
            aria-checked={soundMode === 'harmonic'}
            className={`mode-btn ${soundMode === 'harmonic' ? 'active' : ''}`}
            onClick={() => onSoundModeChange('harmonic')}
          >
            Atmospheric Ambient
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={soundMode === 'triad'}
            className={`mode-btn ${soundMode === 'triad' ? 'active' : ''}`}
            onClick={() => onSoundModeChange('triad')}
          >
            RGB Triad Chords
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={soundMode === 'pulse'}
            className={`mode-btn ${soundMode === 'pulse' ? 'active' : ''}`}
            onClick={() => onSoundModeChange('pulse')}
          >
            Geological Pulse
          </button>
        </div>
      </div>

      {/* Volume Slider with Safety Limiter */}
      <div className="control-group">
        <div className="control-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <VolumeIcon size={16} />
            Master Volume (Safety Clamped)
          </span>
          <span className="control-val">{Math.round((volume / 0.5) * 100)}%</span>
        </div>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          aria-valuemin={0}
          aria-valuemax={0.5}
          aria-valuenow={volume}
          aria-valuetext={`${Math.round((volume / 0.5) * 100)}% of safety limit`}
          style={{ width: '100%', minHeight: '28px' }}
        />
        <div className="safety-limiter-badge">
          <ShieldAlertIcon size={13} />
          <span>Output gain hard-capped at 50% to prevent acoustic fatigue.</span>
        </div>
      </div>

      {/* Scan Speed & Scan Pattern Mode */}
      <div className="control-group">
        <div className="control-label">
          <span>Scan Rate & Trajectory</span>
          <span className="control-val">{scanSpeed.toFixed(1)}×</span>
        </div>
        <input
          id="speed-slider"
          type="range"
          min="0.2"
          max="3.0"
          step="0.1"
          value={scanSpeed}
          onChange={(e) => onScanSpeedChange(parseFloat(e.target.value))}
          aria-valuemin={0.2}
          aria-valuemax={3.0}
          aria-valuenow={scanSpeed}
          aria-valuetext={`${scanSpeed} times rate`}
          style={{ width: '100%', minHeight: '28px' }}
        />

        <div className="scan-pattern-row">
          <button
            type="button"
            className={`btn-subtle ${scanMode === 'loop' ? 'active' : ''}`}
            onClick={() => onScanModeChange('loop')}
          >
            Continuous Loop (W → E)
          </button>
          <button
            type="button"
            className={`btn-subtle ${scanMode === 'pingpong' ? 'active' : ''}`}
            onClick={() => onScanModeChange('pingpong')}
          >
            Ping-Pong (Bidirectional)
          </button>
        </div>
      </div>

      {/* Real-time Rendered Frame Metrics Readout */}
      <div className="readout-card" aria-label="Real-time frame audio analysis">
        <div className="readout-title">
          <span>Pixel-to-Acoustic Telemetry</span>
          <span className={`live-dot ${isPlaying ? 'pulsing' : ''}`} aria-hidden="true" />
        </div>
        <div className="readout-grid">
          <div className="readout-item">
            <span className="readout-key">Frequency</span>
            <span className="readout-value">{metrics.freq || 130} Hz</span>
          </div>
          <div className="readout-item">
            <span className="readout-key">Luminance</span>
            <span className="readout-value">{metrics.brightness || 0} / 255</span>
          </div>
          <div className="readout-item">
            <span className="readout-key">Ocean (Blue)</span>
            <span className="readout-value">{metrics.oceanRatio || 0}%</span>
          </div>
          <div className="readout-item">
            <span className="readout-key">Land (Green)</span>
            <span className="readout-value">{metrics.landRatio || 0}%</span>
          </div>
          <div className="readout-item">
            <span className="readout-key">Stereo Pan</span>
            <span className="readout-value">{metrics.panPosition || '0.00'}</span>
          </div>
          <div className="readout-item">
            <span className="readout-key">Active Voice</span>
            <span className="readout-value" style={{ textTransform: 'capitalize' }}>
              {soundMode}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
