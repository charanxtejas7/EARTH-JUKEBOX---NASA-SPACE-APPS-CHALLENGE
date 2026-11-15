// src/components/Ladder.jsx
// Pitch ladder on the right edge: eight rows with Note name, Frequency in Hz, and level bar in Cyan
import { hzToNoteName } from '../audio/mapping.js'

export default function Ladder({ voices = [], rows = 8 }) {
  const list = voices.length ? voices : Array.from({ length: rows }, () => null)

  return (
    <aside className="hud-ladder" aria-hidden="true">
      <div className="ladder-header">PITCH LADDER</div>
      <ol className="ladder-list">
        {list.map((v, i) => {
          const level = v ? Math.min(1, (v.gain || 0) / 0.18) : 0
          const note = v ? hzToNoteName(v.freq) : `Band ${8 - i}`
          const freqText = v ? `${Math.round(v.freq)} Hz` : '---'

          return (
            <li key={i} className="ladder-row">
              <span className="ladder-note">{note}</span>
              <span className="ladder-freq">{freqText}</span>
              <div className="ladder-meter-track">
                <div
                  className="ladder-meter-fill"
                  style={{ transform: `scaleX(${level})` }}
                />
              </div>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
