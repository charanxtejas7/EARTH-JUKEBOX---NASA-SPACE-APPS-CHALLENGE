// src/components/Wordmark.jsx
// Wordmark: Unbounded 800, small, top-left; unscrambles once on load
import { useState, useEffect } from 'react'
import { scrambleText } from '../lib/scramble.js'

export default function Wordmark() {
  const [text, setText] = useState('EARTH JUKEBOX')

  useEffect(() => {
    return scrambleText('EARTH JUKEBOX', setText, 1200)
  }, [])

  return (
    <div className="wordmark-container">
      <h1 className="wordmark">{text}</h1>
      <span className="wordmark-sub">3D SPACE EDITION</span>
    </div>
  )
}
