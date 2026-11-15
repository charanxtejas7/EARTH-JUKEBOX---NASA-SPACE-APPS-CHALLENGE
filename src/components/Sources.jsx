import assetData from '../data/nasa-assets.json'

// Sources.jsx: sources, credits, open data citations, and honest AI disclosure.
export default function Sources() {
  const tracks = assetData.tracks || []
  const references = assetData.references || []

  return (
    <section className="sources" aria-labelledby="sources-h">
      <h2 id="sources-h">Data Sources, Credits & Disclosures</h2>

      {/* Honest Science Statement */}
      <div style={{ background: 'rgba(255, 184, 0, 0.1)', borderLeft: '3px solid #ffb800', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#ffc83b' }}>
          Honest Science Notice:
        </p>
        <p style={{ margin: '0.35rem 0 0 0', color: '#fff', fontSize: '0.9rem', lineHeight: 1.4 }}>
          The sound is made from the colour and brightness of NASA's rendered pictures, not from NASA's raw measurements.
        </p>
      </div>

      <p>
        Visualizations in Earth Jukebox are produced by NASA's Scientific Visualization Studio (SVS)
        and NASA Worldview / Global Imagery Browse Services (GIBS), part of NASA's Earth Science Data and
        Information System (ESDIS).
      </p>

      <p>
        <strong>NASA does not endorse this project.</strong> Earth Jukebox is not a NASA product, and does not use
        NASA logos, meatballs, flags, or official agency insignia.
      </p>

      <p>
        NASA media reproduction guidelines apply to all NASA imagery and video:
        <br />
        <a
          href="https://www.nasa.gov/multimedia/guidelines/index.html"
          target="_blank"
          rel="noreferrer"
          style={{ wordBreak: 'break-all', color: 'var(--cyan)' }}
        >
          https://www.nasa.gov/multimedia/guidelines/index.html
        </a>
      </p>

      <h3 style={{ marginTop: '1.5rem', color: 'var(--cyan)' }}>NASA Visualizations & Exact Credit Lines</h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--soft)' }}>
        Generated directly from <code>src/data/nasa-assets.json</code>. Each track lists its exact source page and credit line:
      </p>

      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
        {tracks.map((t) => (
          <li key={t.id} style={{ marginBottom: '0.85rem', lineHeight: 1.45 }}>
            <strong>
              <a href={t.source} target="_blank" rel="noreferrer" style={{ color: '#fff', textDecoration: 'underline' }}>
                {t.title}
              </a>
            </strong>
            <br />
            {t.credit && <span style={{ color: '#c4b5fd' }}>Credit: {t.credit}</span>}
            {t.dataCredit && (
              <span style={{ display: 'block', fontSize: '0.82rem', color: 'var(--soft)' }}>
                Data / Model: {t.dataCredit}
              </span>
            )}
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', wordBreak: 'break-all' }}>
              Source: {t.source}
            </span>
          </li>
        ))}
      </ul>

      {references.length > 0 && (
        <>
          <h3 style={{ marginTop: '1.5rem', color: 'var(--cyan)' }}>Reference Materials</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            {references.map((r) => (
              <li key={r.id} style={{ marginBottom: '0.75rem', lineHeight: 1.4 }}>
                <strong>
                  <a href={r.source} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>
                    {r.title}
                  </a>
                </strong>
                {r.credit && <span style={{ color: '#c4b5fd' }}> — {r.credit}</span>}
                {r.note && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: 'var(--soft)' }}>{r.note}</p>}
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 style={{ marginTop: '1.5rem', color: 'var(--cyan)' }}>AI Assistance Disclosure</h3>
      <p style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
        Code was written with AI assistance (Claude, Google Antigravity) and reviewed by the team. The concept and sound design are the team's.
      </p>

      <p style={{ fontSize: '0.85rem', color: 'var(--soft)', marginTop: '0.75rem' }}>
        <strong>Audio Synthesis Disclosure:</strong> Audio is synthesized purely in real-time inside your browser using the Web Audio API based on the colors and brightness sampled from the imagery. No pre-recorded environmental recordings are used for Earth tracks.
      </p>
    </section>
  )
}
