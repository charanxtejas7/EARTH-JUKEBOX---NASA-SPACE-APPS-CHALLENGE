// src/components/Controls.jsx
// Round Play/Pause button with magnetic cursor pull & pulse ring, Flat/Globe toggle, Scale select
import { useRef, useEffect } from 'react'
import { SCALES } from '../audio/mapping.js'

export default function Controls({
  playing = false,
  onTogglePlay,
  scale,
  onChangeScale,
  isFlat = false,
  onToggleFlat,
  sweepSpeed = 1.0,
  onToggleSpeed = () => {},
  projectionLocked = false,
  disabled = false,
}) {
  const playBtnRef = useRef(null)

  // Magnetic cursor pull within 130px (up to 25% drift)
  useEffect(() => {
    const btn = playBtnRef.current
    if (!btn) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    function handleMouseMove(e) {
      if (!btn) return
      const rect = btn.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY)

      if (dist < 130) {
        const factor = (1 - dist / 130) * 0.25
        const offsetX = (e.clientX - centerX) * factor
        const offsetY = (e.clientY - centerY) * factor
        btn.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${playing ? 0.96 : 1.05})`
      } else {
        btn.style.transform = 'translate(0px, 0px) scale(1)'
      }
    }

    function handleMouseLeave() {
      if (btn) btn.style.transform = 'translate(0px, 0px) scale(1)'
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [playing])

  return (
    <div className="hud-controls" aria-label="Playback and view controls">
      <div className="hud-controls-left">
        {/* Musical Scale Selector */}
        <div className="control-group-inline">
          <label htmlFor="scale-select" className="control-label-inline">
            Scale
          </label>
          <select
            id="scale-select"
            className="pill-select"
            value={scale}
            onChange={(e) => onChangeScale(e.target.value)}
          >
            {Object.keys(SCALES).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Flat Map / Globe Toggle */}
        <button
          type="button"
          className={`pill-btn ${isFlat ? 'active' : ''} ${projectionLocked ? 'locked' : ''}`}
          onClick={projectionLocked ? undefined : onToggleFlat}
          disabled={projectionLocked}
          aria-pressed={isFlat}
          title={
            projectionLocked
              ? 'This visualization is a regional or perspective view and is displayed as flat map only to prevent spherical distortion.'
              : 'Toggle 3D Globe and Flat Map'
          }
        >
          <span className="pill-dot" />
          {projectionLocked ? 'Flat map (regional)' : isFlat ? 'Flat map' : '3D Globe'}
        </button>

        {/* Dynamic Sweep Tempo / Speed Control */}
        <button
          type="button"
          className="pill-btn tempo-btn"
          onClick={onToggleSpeed}
          title="Toggle sweep tempo: 1x (14s), 2x (7s), or 0.5x (28s)"
          aria-label={`Playback tempo ${sweepSpeed}x`}
        >
          <span>⏱️</span>
          {sweepSpeed}x
        </button>
      </div>

      {/* Round Play/Pause Button */}
      <button
        ref={playBtnRef}
        type="button"
        className={`play-circle-btn ${playing ? 'playing' : ''}`}
        onClick={onTogglePlay}
        disabled={disabled}
        aria-label={playing ? 'Pause sonification' : 'Play sonification'}
      >
        <span className="play-pulse-ring" aria-hidden="true" />
        <span className="play-btn-text">{playing ? 'PAUSE' : 'PLAY'}</span>
      </button>
    </div>
  )
}
