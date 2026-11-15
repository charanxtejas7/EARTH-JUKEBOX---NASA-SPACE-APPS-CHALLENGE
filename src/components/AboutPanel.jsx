// src/components/AboutPanel.jsx
// Accessible "About this view" panel - displayed on screen, high-contrast, multi-sensory
import ColourBar from './ColourBar.jsx'
import { TRACK_ACOUSTIC_PROFILES } from '../audio/mapping.js'

export default function AboutPanel({ track, isStandIn = false, onClose }) {
  if (!track) return null

  const profile = TRACK_ACOUSTIC_PROFILES[track.id] || {}

  return (
    <aside className="about-modal-panel" aria-labelledby="about-panel-heading">
      <div className="about-modal-header">
        <h3 id="about-panel-heading" className="about-modal-title">
          About this view & Soundscape
        </h3>
        {onClose && (
          <button
            type="button"
            className="about-close-btn"
            onClick={onClose}
            aria-label="Close facts panel"
          >
            ✕
          </button>
        )}
      </div>

      <div className="about-modal-content">
        {/* Core Honest Science Statement */}
        <div className="about-fact-item highlight" style={{ background: 'rgba(255, 184, 0, 0.12)', borderLeft: '3px solid #ffb800', padding: '0.6rem 0.8rem', borderRadius: '4px' }}>
          <span className="fact-label" style={{ color: '#ffc83b', fontWeight: 700 }}>Honest Science Notice:</span>
          <span className="fact-val" style={{ display: 'block', marginTop: '0.25rem', color: '#fff', fontSize: '0.85rem', lineHeight: 1.4 }}>
            The sound is made from the colour and brightness of NASA's rendered pictures, not from NASA's raw measurements.
          </span>
        </div>

        {isStandIn ? (
          <div className="about-fact-item" style={{ background: 'rgba(255, 77, 106, 0.12)', borderLeft: '3px solid #ff4d6a', padding: '0.6rem 0.8rem', borderRadius: '4px' }}>
            <span className="fact-label" style={{ color: '#ff4d6a', fontWeight: 700 }}>Artwork Notice:</span>
            <span className="fact-val" style={{ display: 'block', marginTop: '0.25rem', color: '#fff', fontSize: '0.85rem' }}>
              Preview picture: a generated stand-in, not a NASA image. This is procedural code art shown because preview artwork is enabled or local media is missing. It is not credited to NASA and is not a NASA source.
            </span>
          </div>
        ) : null}

        <h4 className="about-track-name">{track.title}</h4>
        <p className="about-track-desc">{track.plainDescription}</p>

        {/* The Story Behind the Sound & Emotional Impact */}
        {profile.artisticRationale && (
          <div className="about-fact-item story-box">
            <span className="fact-label" style={{ color: 'var(--cyan)' }}>The Story Behind the Sound:</span>
            <p className="story-text" style={{ fontStyle: 'italic', margin: '0.35rem 0 0 0', lineHeight: 1.5, color: '#e0dbf8' }}>
              "{profile.artisticRationale}"
            </p>
          </div>
        )}

        {/* Musical Mapping Ruleset & Acoustic DNA */}
        <div className="about-fact-item">
          <span className="fact-label">Acoustic DNA & Mapping Ruleset:</span>
          <span className="fact-val">
            Root: <strong>{profile.rootNote || 'C3'} ({profile.rootHz || 130.81} Hz)</strong> • Scale: <strong>{profile.scale || 'pentatonic'}</strong> • Timbre: <strong>{profile.timbreName || 'Orbital Harmonics'}</strong> • Waveform: <code>{profile.oscType || 'triangle'}</code>
          </span>
        </div>

        {/* Multi-Sensory Accessible Features */}
        <div className="about-fact-item accessibility-box" style={{ background: 'rgba(127, 240, 255, 0.08)', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(127, 240, 255, 0.2)' }}>
          <span className="fact-label" style={{ color: 'var(--cyan)', fontWeight: 700 }}>Multi-Sensory Accessibility:</span>
          <span className="fact-val" style={{ display: 'block', marginTop: '0.3rem', fontSize: '0.82rem', lineHeight: 1.45 }}>
            • <strong>Interactive Audio Probe</strong>: Tap or click anywhere on the 3D globe or flat map to immediately seek and sonify that geographic location.<br/>
            • <strong>Tactile Feedback</strong>: Automatic micro-vibration pulses on supported mobile devices during high-radiance spectral peaks and landmark arrivals.<br/>
            • <strong>Screen Reader Regions</strong>: Live polite ARIA regions announcing equatorial sweep percentages and brightest latitude regions.<br/>
            • <strong>Keyboard Shortcuts</strong>: <code>Space</code> (play/pause), <code>T</code> (tour), <code>F</code> (flat/globe), <code>D</code> (discover), <code>G</code> (gallery), <code>Esc</code> (close).
          </span>
        </div>

        {track.projection === 'flat' && (
          <div className="about-fact-item highlight">
            <span className="fact-label">Projection note:</span>
            <span className="fact-val">
              This visualization is a regional or perspective view and is displayed as a flat map.
            </span>
          </div>
        )}

        {track.dates && (
          <div className="about-fact-item">
            <span className="fact-label">Dates / Period:</span>
            <span className="fact-val">{track.dates}</span>
          </div>
        )}

        {track.colourMeaning && (
          <div className="about-fact-item">
            <span className="fact-label">Colour Meaning:</span>
            <span className="fact-val">{track.colourMeaning}</span>
          </div>
        )}

        {track.colorbar && (
          <ColourBar colorbar={track.colorbar} title={track.title} />
        )}

        {!isStandIn && (track.dataUsed || track.dataCredit) && (
          <div className="about-fact-item">
            <span className="fact-label">Data / Model Used:</span>
            <span className="fact-val">{track.dataUsed || track.dataCredit}</span>
          </div>
        )}

        {!isStandIn && track.credit && (
          <div className="about-fact-item">
            <span className="fact-label">Exact Credit Line:</span>
            <span className="fact-val">{track.credit}</span>
          </div>
        )}

        {!isStandIn && track.source && (
          <div className="about-fact-item">
            <span className="fact-label">NASA Source:</span>
            <span className="fact-val source-url">{track.source}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
