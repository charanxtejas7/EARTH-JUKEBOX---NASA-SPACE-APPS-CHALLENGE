// src/components/TrackList.jsx
// Huge outlined typography, hover cyan fill, selected solid ink with 14px nudge
export default function TrackList({ tracks = [], selectedId, onSelectTrack }) {
  return (
    <nav className="track-list-nav" aria-label="Earth visualizations">
      <ul className="track-list">
        {tracks.map((t) => {
          const isSelected = t.id === selectedId
          return (
            <li key={t.id} className="track-list-item">
              <button
                type="button"
                className={`track-btn ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => onSelectTrack(t)}
              >
                <span className="track-title-text">{t.title}</span>
                {t.isStandIn && <span className="track-badge">stand-in</span>}
                {t.projection === 'flat' && <span className="track-badge flat">flat</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
