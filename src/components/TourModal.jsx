// src/components/TourModal.jsx
// Interactive Earth Tour: Explore curated global geographic landmarks with location markings,
// with direct 3D Globe vs Flat Map view controls.
import { GEO_TOUR_STOPS } from '../audio/mapping.js'

export default function TourModal({
  currentStopIndex = 0,
  onSelectStop,
  onClose,
  isFlat = false,
  onToggleFlat,
}) {
  const currentStop = GEO_TOUR_STOPS[currentStopIndex] || GEO_TOUR_STOPS[0]

  const handlePrev = () => {
    const nextIdx = (currentStopIndex - 1 + GEO_TOUR_STOPS.length) % GEO_TOUR_STOPS.length
    onSelectStop(nextIdx)
  }

  const handleNext = () => {
    const nextIdx = (currentStopIndex + 1) % GEO_TOUR_STOPS.length
    onSelectStop(nextIdx)
  }

  return (
    <aside className="tour-floating-card" aria-labelledby="tour-heading">
      <div className="tour-card-header">
        <div className="tour-pill-badge">
          EARTH TOUR • {currentStopIndex + 1} OF {GEO_TOUR_STOPS.length}
        </div>
        <button type="button" className="tour-close-btn" onClick={onClose} aria-label="Exit tour">
          ✕
        </button>
      </div>

      <div className="tour-card-body">
        <h3 id="tour-heading" className="tour-stop-title">
          {currentStop.title}
        </h3>
        <div className="tour-coords">
          <span>Lat: {currentStop.lat > 0 ? `${currentStop.lat}°N` : `${Math.abs(currentStop.lat)}°S`}</span>
          <span>•</span>
          <span>Lon: {currentStop.lon > 0 ? `${currentStop.lon}°E` : `${Math.abs(currentStop.lon)}°W`}</span>
        </div>
        <p className="tour-desc">{currentStop.description}</p>
      </div>

      {/* Direct 3D Globe vs Flat Map View Toggle for Tour Mode */}
      <div className="tour-view-mode-bar">
        <span className="view-mode-label">Tour View Mode:</span>
        <div className="view-mode-pills">
          <button
            type="button"
            className={`tour-view-pill ${!isFlat ? 'active' : ''}`}
            onClick={() => onToggleFlat(false)}
            aria-pressed={!isFlat}
          >
            3D Globe
          </button>
          <button
            type="button"
            className={`tour-view-pill ${isFlat ? 'active' : ''}`}
            onClick={() => onToggleFlat(true)}
            aria-pressed={isFlat}
          >
            Flat Map
          </button>
        </div>
      </div>

      <div className="tour-controls">
        <button type="button" className="tour-nav-btn" onClick={handlePrev} aria-label="Previous landmark">
          ← Prev
        </button>
        <span className="tour-index-text">{currentStopIndex + 1} / {GEO_TOUR_STOPS.length}</span>
        <button type="button" className="tour-nav-btn primary" onClick={handleNext} aria-label="Next landmark">
          Next Landmark →
        </button>
      </div>
    </aside>
  )
}
