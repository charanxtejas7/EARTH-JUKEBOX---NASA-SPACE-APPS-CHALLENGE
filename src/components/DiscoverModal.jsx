// src/components/DiscoverModal.jsx
// Discover NASA: Spectral Color Distribution, Acoustic DNA Profile,
// Scientific & Spectral Meeting, Root Musical Key/Tonic, and Deterministic Pipeline.
import { useState } from 'react'
import { TRACK_ACOUSTIC_PROFILES } from '../audio/mapping.js'

export default function DiscoverModal({ track, visionMetrics, onClose }) {
  const [activeTab, setActiveTab] = useState('spectral') // 'spectral' | 'dna' | 'pipeline' | 'scientific'

  const profile = TRACK_ACOUSTIC_PROFILES[track?.id] || {
    rootNote: 'C3',
    rootHz: 130.81,
    scale: 'pentatonic',
    oscType: 'triangle',
    timbreName: 'Standard Orbital Harmonics',
    signatureDescription: 'Balanced spectrum mapping across 8 horizontal latitude bands.',
    spectralFocus: 'Visible Spectrum (400-700nm)',
  }

  const spec = visionMetrics?.spectralDistribution || {
    redPct: 33,
    greenPct: 34,
    bluePct: 33,
    colorTempK: 5500,
    avgR: 120,
    avgG: 125,
    avgB: 120,
  }

  const dna = visionMetrics?.acousticDna || {
    warmthIndex: '0.05',
    spectralCentroidHz: 1450,
    estimatedDbRange: 32,
    harmonicDensity: '0.67',
    meanLuminance: '0.450',
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="discover-heading">
      <div className="discover-modal">
        <header className="discover-modal-header">
          <div>
            <span className="discover-pill">DISCOVER NASA DATA & ACOUSTICS</span>
            <h2 id="discover-heading" className="discover-title">
              {track?.title}
            </h2>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="discover-tabs" aria-label="Discovery categories">
          <button
            type="button"
            className={`discover-tab-btn ${activeTab === 'spectral' ? 'active' : ''}`}
            onClick={() => setActiveTab('spectral')}
          >
            Spectral Colour Distribution
          </button>
          <button
            type="button"
            className={`discover-tab-btn ${activeTab === 'dna' ? 'active' : ''}`}
            onClick={() => setActiveTab('dna')}
          >
            Acoustic DNA Profile
          </button>
          <button
            type="button"
            className={`discover-tab-btn ${activeTab === 'scientific' ? 'active' : ''}`}
            onClick={() => setActiveTab('scientific')}
          >
            Scientific & Spectral Correlation
          </button>
          <button
            type="button"
            className={`discover-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            Deterministic Pipeline
          </button>
        </nav>

        <div className="discover-content">
          {/* TAB 1: Spectral Colour Distribution */}
          {activeTab === 'spectral' && (
            <div className="discover-section">
              <h3 className="section-title">Optical Spectral Distribution</h3>
              <p className="section-desc">
                Real-time computer vision extraction analyzing 12,800 pixel samples ($160\times 80$ grid) from the rendered NASA frame.
              </p>

              <div className="spectral-bars-container">
                <div className="spectral-bar-item">
                  <div className="bar-label">
                    <span>Red Channel (Warmth/Thermal)</span>
                    <strong>{spec.redPct}%</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill red" style={{ width: `${spec.redPct}%` }} />
                  </div>
                </div>

                <div className="spectral-bar-item">
                  <div className="bar-label">
                    <span>Green Channel (Biosphere/Sulfates)</span>
                    <strong>{spec.greenPct}%</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill green" style={{ width: `${spec.greenPct}%` }} />
                  </div>
                </div>

                <div className="spectral-bar-item">
                  <div className="bar-label">
                    <span>Blue Channel (Hydrosphere/Sea Salt)</span>
                    <strong>{spec.bluePct}%</strong>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill blue" style={{ width: `${spec.bluePct}%` }} />
                  </div>
                </div>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="card-label">Estimated Color Temp</span>
                  <span className="card-val cyan">{spec.colorTempK} K</span>
                  <span className="card-sub">Optical chromaticity</span>
                </div>
                <div className="metric-card">
                  <span className="card-label">Mean RGB Vector</span>
                  <span className="card-val">({spec.avgR}, {spec.avgG}, {spec.avgB})</span>
                  <span className="card-sub">Normalized sample space</span>
                </div>
                <div className="metric-card">
                  <span className="card-label">Spectral Focus</span>
                  <span className="card-val pink">{profile.spectralFocus}</span>
                  <span className="card-sub">NASA instrument band</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Acoustic DNA Profile */}
          {activeTab === 'dna' && (
            <div className="discover-section">
              <h3 className="section-title">Earth Sound Signature & Acoustic DNA</h3>
              <p className="section-desc">
                Mathematical synthesis parameters that give this specific planetary view its distinct auditory voice.
              </p>

              <div className="dna-highlight-card">
                <div className="dna-badge">{profile.timbreName}</div>
                <h4 className="dna-title">Earth Signature Sound</h4>
                <p className="dna-desc">{profile.signatureDescription}</p>
              </div>

              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="card-label">Musical Key Tonic</span>
                  <span className="card-val pink">{profile.rootNote} ({profile.rootHz} Hz)</span>
                  <span className="card-sub">Root fundamental frequency</span>
                </div>
                <div className="metric-card">
                  <span className="card-label">Modal Scale</span>
                  <span className="card-val cyan">{profile.scale.toUpperCase()}</span>
                  <span className="card-sub">Harmonic interval structure</span>
                </div>
                <div className="metric-card">
                  <span className="card-label">Oscillator Waveform</span>
                  <span className="card-val">{profile.oscType.toUpperCase()}</span>
                  <span className="card-sub">Synthesis timbre architecture</span>
                </div>
                <div className="metric-card">
                  <span className="card-label">Spectral Centroid</span>
                  <span className="card-val cyan">{dna.spectralCentroidHz} Hz</span>
                  <span className="card-sub">Center of audio mass</span>
                </div>
                <div className="metric-card">
                  <span className="card-label">Harmonic Warmth</span>
                  <span className="card-val">{dna.warmthIndex}</span>
                  <span className="card-sub">Filter cutoff bias</span>
                </div>
                <div className="metric-card">
                  <span className="card-label">Dynamic Range</span>
                  <span className="card-val">{dna.estimatedDbRange} dB</span>
                  <span className="card-sub">Acoustic contrast span</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Scientific & Spectral Correlation */}
          {activeTab === 'scientific' && (
            <div className="discover-section">
              <h3 className="section-title">Scientific & Spectral Correlation Table</h3>
              <p className="section-desc">
                How visual and scientific phenomena correlate directly to auditory frequencies in Earth Jukebox:
              </p>

              <div className="correlation-table-wrapper">
                <table className="correlation-table">
                  <thead>
                    <tr>
                      <th>Latitude / Region</th>
                      <th>Visual Data Phenomenon</th>
                      <th>Auditory Voice</th>
                      <th>Frequency Band</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Band 1 (Arctic, 72°N)</td>
                      <td>Polar Ice / Atmospheric Jet Margin</td>
                      <td>Highest Octave Lead</td>
                      <td>880 Hz – 1046 Hz</td>
                    </tr>
                    <tr>
                      <td>Band 2 (Mid-North, 51°N)</td>
                      <td>North Temperate Storm Tracks / Megacities</td>
                      <td>Soprano Voice</td>
                      <td>587 Hz – 784 Hz</td>
                    </tr>
                    <tr>
                      <td>Band 3 (Sub-North, 31°N)</td>
                      <td>Subtropical Deserts / Gulf Stream Warmth</td>
                      <td>Alto Voice</td>
                      <td>440 Hz – 523 Hz</td>
                    </tr>
                    <tr>
                      <td>Band 4 (Equatorial North, 11°N)</td>
                      <td>Intertropical Convergence Zone (ITCZ)</td>
                      <td>Tenor Voice</td>
                      <td>330 Hz – 392 Hz</td>
                    </tr>
                    <tr>
                      <td>Band 5 (Equatorial South, -11°S)</td>
                      <td>Amazon Basin / Tropical Cloud Canopy</td>
                      <td>Baritone Voice</td>
                      <td>220 Hz – 262 Hz</td>
                    </tr>
                    <tr>
                      <td>Band 6 (Sub-South, -31°S)</td>
                      <td>Southern Ocean Current Inflow</td>
                      <td>Bass Fundamental</td>
                      <td>164 Hz – 196 Hz</td>
                    </tr>
                    <tr>
                      <td>Band 7 (Mid-South, -51°S)</td>
                      <td>Circumpolar Roaring Forties</td>
                      <td>Sub-Bass Voice</td>
                      <td>110 Hz – 130 Hz</td>
                    </tr>
                    <tr>
                      <td>Band 8 (Antarctic, -72°S)</td>
                      <td>Continental Ice Sheet & Sea Ice</td>
                      <td>Deep Sub Foundation</td>
                      <td>73 Hz – 98 Hz</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Deterministic Pipeline */}
          {activeTab === 'pipeline' && (
            <div className="discover-section">
              <h3 className="section-title">Deterministic Computer Vision Pipeline</h3>
              <p className="section-desc">
                Zero stochastic hallucinations. Every tone is computed deterministically through a 5-stage browser pipeline:
              </p>

              <div className="pipeline-steps">
                <div className="step-card">
                  <div className="step-num">01</div>
                  <h4>Frame Resampling</h4>
                  <p>Client canvas resamples the NASA frame to a uniform $160 \times 80$ pixel grid ($12,800$ sampling coordinates).</p>
                </div>
                <div className="step-card">
                  <div className="step-num">02</div>
                  <h4>Temporal Column Slicing</h4>
                  <p>At playhead $x \in [0, 1]$, a 3px-wide vertical column is extracted via <code>getImageData()</code> every 100 ms.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">03</div>
                  <h4>Latitude Band Averaging</h4>
                  <p>Column pixels are grouped into 8 vertical latitude bands. Mean RGB and BT.709 perceived luminance are computed.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">04</div>
                  <h4>Deterministic Mapping</h4>
                  <p>Latitude controls pitch ($f \propto y$), luminance controls gain ($G = L^{1.5}\times 0.22$), and warmth controls cutoff ($F_c = 350 + W\cdot 3800$).</p>
                </div>
                <div className="step-card">
                  <div className="step-num">05</div>
                  <h4>Oscillator Synthesis</h4>
                  <p>Web Audio API applies parameters to 8 persistent oscillators with smooth exponential ramping and dynamics compression.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
