import Ladder from './Ladder.jsx'

// A small reusable "pick a file" button.
function FileButton({ onFile, children, className }) {
  return (
    <label className={className}>
      {children}
      <input type="file" accept="image/*,video/*" onChange={onFile} />
    </label>
  )
}

// Stage.jsx: the picture, the "already heard" veil, the playhead and the ladder.
export default function Stage({ media, mediaRef, progress, playing, voices, rows, onFile, onAttach }) {
  // Case 1: nothing selected at all.
  if (!media) {
    return (
      <div className="stage empty">
        <p className="empty-title">Nothing to hear yet</p>
        <p>Choose a track, or load a NASA image or video from your device.</p>
        <FileButton onFile={onFile} className="file-btn">Choose a file</FileButton>
      </div>
    )
  }

  // Case 2: a NASA track is chosen but its file has not been added yet.
  if (!media.file) {
    return (
      <div className="stage empty">
        <p className="empty-title">{media.title}</p>
        <p>{media.plainDescription}</p>
        <p>
          This track needs its file. Download it from{' '}
          <a href={media.source} target="_blank" rel="noreferrer">the NASA page</a>, then attach it here.
        </p>
        <FileButton onFile={onAttach} className="file-btn">Attach your downloaded file</FileButton>
      </div>
    )
  }

  const heard = playing || progress > 0
  const common = { ref: mediaRef, className: 'frame', 'aria-describedby': 'desc' }

  return (
    <figure className="stage">
      <div className="rig">
        <div className="frame-wrap">
          {media.type === 'video' ? (
            <video {...common} src={media.file} muted loop playsInline autoPlay={playing} crossOrigin="anonymous" />
          ) : (
            <img {...common} src={media.file} alt={media.title} crossOrigin="anonymous" />
          )}
          {/* Everything to the right of the playhead is still unheard, so it is dimmed. */}
          <div className={`veil ${heard ? 'on' : ''}`} style={{ transform: `scaleX(${1 - progress})` }} aria-hidden="true" />
          <div className="playhead" style={{ transform: `translateX(${progress * 100}cqw)` }} aria-hidden="true" />
        </div>
        <Ladder voices={voices} rows={rows} />
      </div>
      <figcaption id="desc">
        <strong>{media.title}.</strong> {media.plainDescription}
        {media.credit && <span> Credit: {media.credit}.</span>}
        {media.source && <span> <a href={media.source} target="_blank" rel="noreferrer">Source</a>.</span>}
      </figcaption>
    </figure>
  )
}
