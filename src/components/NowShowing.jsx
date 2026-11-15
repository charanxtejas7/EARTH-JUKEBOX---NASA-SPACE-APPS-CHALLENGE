// src/components/NowShowing.jsx
// Huge display title with text scramble effect, stand-in notice, and honest-science disclaimer
import { useState, useEffect } from 'react'
import { scrambleText } from '../lib/scramble.js'

export default function NowShowing({
  track,
  isStandIn = false,
  onToggleAbout,
  isAboutOpen = false,
}) {
  const [displayTitle, setDisplayTitle] = useState(track?.title || '')

  useEffect(() => {
    if (!track?.title) return
    return scrambleText(track.title, setDisplayTitle, 700)
  }, [track?.id, track?.title])

  return (
    <div className="now-showing-block">
      <h2 className="now-showing-title">{displayTitle}</h2>

      {isStandIn ? (
        <p className="notice stand-in-notice" role="status">
          Preview picture: a generated stand-in, not a NASA image
        </p>
      ) : null}

      <p className="notice honest-science-notice">
        The sound is made from the colour and brightness of NASA's rendered pictures, not from NASA's raw measurements.
      </p>

      {track && (
        <button
          type="button"
          className="about-toggle-btn"
          aria-expanded={isAboutOpen}
          onClick={onToggleAbout}
        >
          {isAboutOpen ? 'Hide facts & credit' : 'About this view & credit'}
        </button>
      )}
    </div>
  )
}
