// src/App.jsx - Earth Jukebox (3D Space Edition + Scientific Discovery & Acoustic DNA)
import { useState, useRef, useEffect, useCallback } from 'react'
import SpaceScene from './components/SpaceScene.jsx'
import Wordmark from './components/Wordmark.jsx'
import TrackList from './components/TrackList.jsx'
import NowShowing from './components/NowShowing.jsx'
import Ladder from './components/Ladder.jsx'
import Controls from './components/Controls.jsx'
import AboutPanel from './components/AboutPanel.jsx'
import Sources from './components/Sources.jsx'
import DiscoverModal from './components/DiscoverModal.jsx'
import SoundGalleryModal from './components/SoundGalleryModal.jsx'
import NowPlayingHud from './components/NowPlayingHud.jsx'
import TourModal from './components/TourModal.jsx'
import ExecutiveReviewModal from './components/ExecutiveReviewModal.jsx'

import { generateStandInCanvas } from './lib/standins.js'
import { auditor } from './lib/benchmark.js'
import assetData from './data/nasa-assets.json'
import manifest from './data/manifest.json'
import {
  SCALES,
  defaultConfig,
  bandsToVoices,
  TRACK_ACOUSTIC_PROFILES,
  GEO_TOUR_STOPS,
} from './audio/mapping.js'
import { readColumn, extractSpectralAndVisionMetrics } from './audio/analyse.js'
import { Sonifier } from './audio/engine.js'

// Global high-speed in-memory image cache: pre-warms all NASA artwork so switching is 0ms instantaneous
const imageCache = new Map()
if (typeof window !== 'undefined') {
  Object.entries(manifest).forEach(([id, info]) => {
    if (info.type === 'image' && info.file) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = info.file
      imageCache.set(id, img)
    }
  })

  // Pre-warm video fallback poster frames for 0ms initial render
  const posters = [
    ['perpetual-ocean-2', '/media/perpetual-ocean-2-frame.jpg'],
    ['sea-currents-temperature', '/media/perpetual-ocean-2-frame.jpg'],
    ['gedi-forest-height', '/media/cbar-gedi-forest.jpg'],
  ]
  posters.forEach(([k, src]) => {
    if (!imageCache.has(k)) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      imageCache.set(k, img)
    }
  })
}

const TICK_MS = 100
const REGIONS = [
  'polar north (Band 1)',
  'upper temperate (Band 2)',
  'subtropical north (Band 3)',
  'equatorial north (Band 4)',
  'equatorial south (Band 5)',
  'subtropical south (Band 6)',
  'circumpolar south (Band 7)',
  'polar antarctic (Band 8)',
]

export default function App() {
  const tracks = assetData.tracks

  // Active track state
  const [selectedTrack, setSelectedTrack] = useState(tracks[0])
  const [previewArtwork, setPreviewArtwork] = useState(false)
  const [isFlat, setIsFlat] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true
    }
    return tracks[0]?.projection === 'flat'
  })

  // Playback & Audio State
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [voices, setVoices] = useState([])
  const [announce, setAnnounce] = useState('')

  // Modals & Panels visibility
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const [isSourcesOpen, setIsSourcesOpen] = useState(false)
  const [isDiscoverOpen, setIsDiscoverOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [isTourActive, setIsTourActive] = useState(false)
  const [currentTourIndex, setCurrentTourIndex] = useState(0)
  const [isExecutiveOpen, setIsExecutiveOpen] = useState(false)

  // Computer Vision & Spectral Extraction Metrics
  const [visionMetrics, setVisionMetrics] = useState(null)

  // Persistent Canvas Bridge initialized on frame 0 with initial NASA artwork
  const mediaCanvasRef = useRef(null)
  const hiddenVideoRef = useRef(null)
  if (!mediaCanvasRef.current && typeof document !== 'undefined') {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 512
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#0f1a30'
    ctx.fillRect(0, 0, 1024, 512)

    // Instantly paint default track image if preloaded
    const firstImg = imageCache.get(tracks[0]?.id)
    if (firstImg && firstImg.complete && firstImg.naturalWidth) {
      ctx.drawImage(firstImg, 0, 0, 1024, 512)
    } else if (firstImg) {
      firstImg.onload = () => {
        if (mediaCanvasRef.current) {
          const cCtx = mediaCanvasRef.current.getContext('2d')
          cCtx.drawImage(firstImg, 0, 0, 1024, 512)
          setTextureRev((r) => r + 1)
        }
      }
    }
    mediaCanvasRef.current = c
  }

  // Media Texture Source for 3D Scene and Audio Analysis - starts initialized on Frame 0
  const [textureSource, setTextureSource] = useState(() => mediaCanvasRef.current)
  const [textureRev, setTextureRev] = useState(0)
  const [isStandInActive, setIsStandInActive] = useState(false)

  // Audio Engine Refs
  const mediaRef = useRef(mediaCanvasRef.current)
  const synth = useRef(new Sonifier())
  const startedAt = useRef(0)
  const lastAnnounce = useRef(0)

  // Get current track's acoustic profile
  const acousticProfile = TRACK_ACOUSTIC_PROFILES[selectedTrack?.id] || {
    rootNote: 'C3',
    rootHz: 130.81,
    scale: 'pentatonic',
    oscType: 'triangle',
    resonanceQ: 1.5,
  }

  // Active scale can be overridden by user or default to track profile
  const [scale, setScale] = useState(acousticProfile.scale)

  useEffect(() => {
    setScale(acousticProfile.scale)
  }, [selectedTrack?.id, acousticProfile.scale])

  // Dynamic sweep tempo / speed (1.0 = 14s, 2.0 = 7s, 0.5 = 28s)
  const [sweepSpeed, setSweepSpeed] = useState(1.0)
  const handleToggleSpeed = () => {
    setSweepSpeed((s) => {
      const next = s === 1.0 ? 2.0 : s === 2.0 ? 0.5 : 1.0
      startedAt.current = performance.now() - progress * ((defaultConfig.sweepSeconds || 14) / next) * 1000
      return next
    })
  }

  const config = {
    ...defaultConfig,
    ...acousticProfile,
    scale,
    sweepSeconds: (defaultConfig.sweepSeconds || 14) / sweepSpeed,
  }

  // Track fallback posters for instant, non-blank rendering of video datasets
  const VIDEO_FALLBACK_POSTERS = {
    'sea-currents-temperature': '/media/perpetual-ocean-2-frame.jpg',
    'gedi-forest-height': '/media/cbar-gedi-forest.jpg',
    'reference-caldwell73': null,
  }

  // Update active media (Real NASA file vs Stand-in Canvas) & extract metrics
  useEffect(() => {
    if (!selectedTrack) return

    const trackId = selectedTrack.id
    const hasLocalFile = manifest[trackId] && manifest[trackId].file
    const shouldUseStandIn = previewArtwork || !hasLocalFile

    let seed = 42
    for (let i = 0; i < trackId.length; i++) {
      seed = (seed * 31 + trackId.charCodeAt(i)) % 100000
    }

    const canvas = mediaCanvasRef.current
    const ctx = canvas.getContext('2d')

    const commitCanvasUpdate = (isStandIn = false) => {
      mediaRef.current = canvas
      setTextureSource(canvas)
      setIsStandInActive(isStandIn)
      setTextureRev((r) => r + 1)
      setVisionMetrics(extractSpectralAndVisionMetrics(canvas))
    }

    if (shouldUseStandIn) {
      if (hiddenVideoRef.current) hiddenVideoRef.current.pause()
      const standIn = generateStandInCanvas(selectedTrack.standInKind || 'lights', seed)
      ctx.drawImage(standIn, 0, 0, 1024, 512)
      commitCanvasUpdate(true)
    } else {
      const fileInfo = manifest[trackId]
      const fileUrl = fileInfo?.file
      const isVideo = fileInfo?.type === 'video'

      if (!fileUrl) {
        if (hiddenVideoRef.current) hiddenVideoRef.current.pause()
        const standIn = generateStandInCanvas(selectedTrack.standInKind || 'lights', seed)
        ctx.drawImage(standIn, 0, 0, 1024, 512)
        commitCanvasUpdate(true)
      } else if (isVideo) {
        setIsStandInActive(false)

        // 1. Instantly paint high-res poster frame from pre-warmed cache
        const posterTrack = trackId === 'sea-currents-temperature' ? 'perpetual-ocean-2' : trackId
        const cachedPoster = imageCache.get(posterTrack) || imageCache.get('perpetual-ocean-2')
        if (cachedPoster && cachedPoster.complete && cachedPoster.naturalWidth) {
          ctx.drawImage(cachedPoster, 0, 0, 1024, 512)
        } else {
          const posterUrl = VIDEO_FALLBACK_POSTERS[trackId]
          if (posterUrl) {
            const posterImg = new Image()
            posterImg.crossOrigin = 'anonymous'
            posterImg.onload = () => {
              if (selectedTrack.id === trackId) {
                ctx.drawImage(posterImg, 0, 0, 1024, 512)
                commitCanvasUpdate(false)
              }
            }
            posterImg.src = posterUrl
            if (posterImg.complete && posterImg.naturalWidth) {
              ctx.drawImage(posterImg, 0, 0, 1024, 512)
            }
          } else {
            const standIn = generateStandInCanvas(selectedTrack.standInKind || 'ocean', seed)
            ctx.drawImage(standIn, 0, 0, 1024, 512)
          }
        }

        commitCanvasUpdate(false)

        // 2. Hardware-accelerated video decoding stream via hidden DOM element
        const vid = hiddenVideoRef.current
        if (vid) {
          vid.src = fileUrl
          vid.currentTime = 0

          const updateVideoFrame = () => {
            if (vid && vid.videoWidth > 0 && selectedTrack.id === trackId) {
              ctx.drawImage(vid, 0, 0, 1024, 512)
              setTextureRev((r) => r + 1)
            }
          }

          vid.onloadeddata = () => {
            updateVideoFrame()
            setVisionMetrics(extractSpectralAndVisionMetrics(canvas))
          }
          vid.ontimeupdate = updateVideoFrame

          vid.play().then(() => {
            if (!playing) {
              vid.pause()
            }
          }).catch(() => {})
        }
      } else {
        // Image asset: Instant 0ms synchronous render from in-memory cache
        if (hiddenVideoRef.current) hiddenVideoRef.current.pause()
        setIsStandInActive(false)

        const cached = imageCache.get(trackId)
        if (cached && cached.complete && cached.naturalWidth) {
          ctx.drawImage(cached, 0, 0, 1024, 512)
          commitCanvasUpdate(false)
        } else {
          const img = cached || new Image()
          img.crossOrigin = 'anonymous'
          let imgReady = false

          const onImgReady = () => {
            if (imgReady || selectedTrack.id !== trackId) return
            imgReady = true
            ctx.drawImage(img, 0, 0, 1024, 512)
            commitCanvasUpdate(false)
          }

          img.onload = onImgReady
          img.onerror = () => {
            const standIn = generateStandInCanvas(selectedTrack.standInKind || 'lights', seed)
            ctx.drawImage(standIn, 0, 0, 1024, 512)
            commitCanvasUpdate(true)
          }
          if (!cached) {
            img.src = fileUrl
            imageCache.set(trackId, img)
          }
          if (img.complete && img.naturalWidth) onImgReady()
        }
      }
    }

    // Reconfigure audio engine with this track's distinct timbre and resonance
    if (synth.current) {
      synth.current.reconfigure(acousticProfile)
    }
  }, [selectedTrack, previewArtwork, manifest])

  // Track selection
  const handleSelectTrack = (track) => {
    setPlaying(false)
    setProgress(0)
    setVoices([])
    if (hiddenVideoRef.current) hiddenVideoRef.current.pause()
    setSelectedTrack(track)
    if (track.projection === 'flat') {
      setIsFlat(true)
    }
    setAnnounce(`Switched track to ${track.title}. ${track.plainDescription}`)
  }

  // Mobile browser audio unlock on first user touch/click
  useEffect(() => {
    const handleFirstTouch = () => {
      if (synth.current) {
        synth.current.unlockAudio()
      }
      window.removeEventListener('touchstart', handleFirstTouch)
      window.removeEventListener('pointerdown', handleFirstTouch)
    }
    window.addEventListener('touchstart', handleFirstTouch, { passive: true })
    window.addEventListener('pointerdown', handleFirstTouch, { passive: true })
    return () => {
      window.removeEventListener('touchstart', handleFirstTouch)
      window.removeEventListener('pointerdown', handleFirstTouch)
    }
  }, [])

  // Handle tab visibility change & foreground/background transitions (battery & audio safety)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (synth.current) {
          synth.current.silence()
        }
        if (hiddenVideoRef.current && !hiddenVideoRef.current.paused) {
          hiddenVideoRef.current.pause()
        }
      } else {
        if (playing && synth.current) {
          if (synth.current.ctx && synth.current.ctx.state === 'suspended') {
            synth.current.ctx.resume().catch(() => {})
          }
          startedAt.current = performance.now() - progress * config.sweepSeconds * 1000
          if (hiddenVideoRef.current && hiddenVideoRef.current.paused) {
            hiddenVideoRef.current.play().catch(() => {})
          }
        }
      }
    }

    const handlePageHide = () => {
      if (synth.current) synth.current.silence()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [playing, progress, config.sweepSeconds])

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    synth.current.start(config.rows, acousticProfile)
    setPlaying((p) => {
      const nextPlaying = !p
      const vid = hiddenVideoRef.current
      if (vid) {
        if (nextPlaying) {
          vid.play().catch(() => {})
        } else {
          vid.pause()
        }
      }
      setAnnounce(nextPlaying ? `Playing sonification for ${selectedTrack?.title}.` : 'Paused sonification.')
      return nextPlaying
    })
  }, [config.rows, acousticProfile, selectedTrack?.title])

  // Action trigger handler from Executive Review Briefing
  const handleTriggerExecutiveAction = (action) => {
    if (action === 'discover') {
      setIsDiscoverOpen(true)
    } else if (action === 'gallery') {
      setIsGalleryOpen(true)
    } else if (action === 'scene') {
      setIsFlat(false)
    } else if (action === 'co2') {
      const track = tracks.find((t) => t.id === 'co2-dyamond')
      if (track) handleSelectTrack(track)
      if (!playing) togglePlay()
    } else if (action === 'tour') {
      setIsTourActive(true)
    } else if (action === 'play') {
      togglePlay()
    } else if (action === 'flat') {
      setIsFlat(true)
    } else if (action === 'air') {
      const track = tracks.find((t) => t.id === 'air-quality')
      if (track) handleSelectTrack(track)
      if (!playing) togglePlay()
    }
  }

  // Comprehensive keyboard accessibility shortcuts (Space, T, F, D, G, E, Arrows, Escape)
  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName
      if (tag === 'BUTTON' || tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 't' || e.key === 'T') {
        setIsTourActive((t) => !t)
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFlat((f) => !f)
      } else if (e.key === 'd' || e.key === 'D') {
        setIsDiscoverOpen((d) => !d)
      } else if (e.key === 'g' || e.key === 'G') {
        setIsGalleryOpen((g) => !g)
      } else if (e.key === 'e' || e.key === 'E') {
        setIsExecutiveOpen((ex) => !ex)
      } else if (e.key === 'Escape') {
        setIsDiscoverOpen(false)
        setIsGalleryOpen(false)
        setIsExecutiveOpen(false)
        setIsAboutOpen(false)
        setIsSourcesOpen(false)
      } else if (e.code === 'ArrowRight' && isTourActive) {
        handleSelectTourStop((currentTourIndex + 1) % GEO_TOUR_STOPS.length)
      } else if (e.code === 'ArrowLeft' && isTourActive) {
        handleSelectTourStop((currentTourIndex - 1 + GEO_TOUR_STOPS.length) % GEO_TOUR_STOPS.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, isTourActive, currentTourIndex])

  // 100 ms audio analysis loop
  useEffect(() => {
    if (!playing || !mediaRef.current) return
    const vid = hiddenVideoRef.current
    if (vid && vid.paused) vid.play().catch(() => {})
    startedAt.current = performance.now() - progress * config.sweepSeconds * 1000

    const intervalId = setInterval(() => {
      const elapsed = (performance.now() - startedAt.current) / 1000
      const x01 = (elapsed / config.sweepSeconds) % 1
      setProgress(x01)

      const bands = readColumn(mediaRef.current, x01, config.rows)
      if (!bands) return

      const nextVoices = bandsToVoices(bands, config)
      synth.current.update(nextVoices, x01)
      setVoices(nextVoices)

      // Multi-sensory tactile haptic feedback on supported touch devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
        try {
          const peakGain = Math.max(...nextVoices.map((v) => v.gain || 0))
          if (peakGain > 0.84 && Math.random() < 0.25) {
            navigator.vibrate(12)
          }
        } catch (e) {}
      }

      const now = performance.now()
      if (now - lastAnnounce.current > 1000) {
        lastAnnounce.current = now
        const loudest = nextVoices.reduce(
          (maxIdx, v, i) => (v.gain > nextVoices[maxIdx].gain ? i : maxIdx),
          0
        )
        setAnnounce(
          `${Math.round(x01 * 100)} percent across. Brightest area is in the ${
            REGIONS[loudest] || 'equatorial'
          }.`
        )
      }
    }, TICK_MS)

    return () => {
      clearInterval(intervalId)
      synth.current.silence()
      if (vid) vid.pause()
    }
  }, [playing, scale, selectedTrack, config.sweepSeconds, config.rows, config.rootHz, acousticProfile])

  // Tour stop selection handler with tactile haptic feedback
  const handleSelectTourStop = (index) => {
    setCurrentTourIndex(index)
    const stop = GEO_TOUR_STOPS[index]
    if (!stop) return

    // Find and switch to corresponding track
    const targetTrack = tracks.find((t) => t.id === stop.trackId)
    if (targetTrack && targetTrack.id !== selectedTrack.id) {
      setSelectedTrack(targetTrack)
    }

    // Set playhead progress to landmark longitude
    setProgress(stop.x01)
    setAnnounce(`Arrived at tour landmark: ${stop.title}. Location: latitude ${stop.lat}, longitude ${stop.lon}. ${stop.description}`)

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([18, 40, 18])
      } catch (e) {}
    }
  }

  // Interactive Click-to-Probe / Audio Seek on 3D Globe & Flat Map
  const handleSeek = (newProgress) => {
    const t0 = performance.now()
    setProgress(newProgress)
    startedAt.current = performance.now() - newProgress * config.sweepSeconds * 1000
    setAnnounce(`Probed location at longitude ${Math.round(newProgress * 100)} percent. Sonifying local latitude band profile.`)

    if (mediaRef.current && synth.current) {
      if (!synth.current.voices || !synth.current.voices.length) {
        synth.current.start(config.rows, acousticProfile)
      }
      const bands = readColumn(mediaRef.current, newProgress, config.rows)
      if (bands) {
        const nextVoices = bandsToVoices(bands, config)
        synth.current.update(nextVoices, newProgress)
        setVoices(nextVoices)

        const latency = performance.now() - t0
        auditor.recordClickToSound(latency)

        // If paused, play an instant 320ms auditory probe snapshot then silence
        if (!playing) {
          setTimeout(() => {
            if (!playing && synth.current) {
              synth.current.silence()
              setVoices([])
            }
          }, 320)
        }
      }
    }
  }

  const activeTourStop = isTourActive ? GEO_TOUR_STOPS[currentTourIndex] : null

  return (
    <div className="app-container">
      {/* Three.js 3D Space Scene with Globe, Flat Map & Location Markers */}
      <SpaceScene
        textureSource={textureSource}
        textureRev={textureRev}
        progress={progress}
        playing={playing}
        voices={voices}
        isFlat={isFlat}
        isVideo={manifest[selectedTrack?.id]?.type === 'video'}
        activeTourStop={activeTourStop}
        onToggleFlat={() => setIsFlat((f) => !f)}
        onSeek={handleSeek}
      />

      {/* Hidden DOM Video for High-Performance Hardware-Accelerated Video Frame Decoding */}
      <video
        ref={hiddenVideoRef}
        muted
        playsInline
        loop
        crossOrigin="anonymous"
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 320,
          height: 180,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {/* Main UI Overlay */}
      <main className="ui-overlay">
        {/* Top Header Bar */}
        <header className="top-bar">
          <Wordmark />

          <div className="corner-actions">
            {/* Take a Tour Button */}
            <button
              type="button"
              className={`corner-btn tour-btn ${isTourActive ? 'active' : ''}`}
              onClick={() => setIsTourActive((t) => !t)}
              aria-pressed={isTourActive}
            >
              <span className="tour-icon">📍</span>
              {isTourActive ? 'Exit Tour' : 'Take a Tour'}
            </button>

            {/* Sound Gallery Button */}
            <button
              type="button"
              className="corner-btn"
              onClick={() => setIsGalleryOpen(true)}
            >
              Sound Gallery
            </button>

            {/* Discover NASA Button */}
            <button
              type="button"
              className="corner-btn highlight"
              onClick={() => setIsDiscoverOpen(true)}
            >
              Discover NASA
            </button>

            {/* Stand-in Preview Artwork Toggle */}
            <label className="toggle-switch-label" title="Toggle between real NASA imagery and procedural stand-in art">
              <input
                type="checkbox"
                checked={previewArtwork}
                onChange={(e) => setPreviewArtwork(e.target.checked)}
              />
              <span>Preview artwork</span>
            </label>

            {/* Credits Button */}
            <button
              type="button"
              className="corner-btn"
              onClick={() => setIsSourcesOpen(true)}
            >
              Credits
            </button>
          </div>
        </header>

        {/* Floating Interactive Tour Card (when tour is active) */}
        {isTourActive && (
          <TourModal
            currentStopIndex={currentTourIndex}
            onSelectStop={handleSelectTourStop}
            onClose={() => setIsTourActive(false)}
            isFlat={isFlat}
            onToggleFlat={setIsFlat}
          />
        )}

        {/* Center HUD: Left Tracks List + Right Ladder */}
        <div className="main-hud">
          <TrackList
            tracks={tracks}
            selectedId={selectedTrack?.id}
            onSelectTrack={handleSelectTrack}
          />

          <Ladder voices={voices} rows={config.rows} />
        </div>

        {/* Bottom HUD: Title block on left, Integrated Controls Cluster on right */}
        <footer className="bottom-hud">
          <NowShowing
            track={selectedTrack}
            isStandIn={isStandInActive}
            isAboutOpen={isAboutOpen}
            onToggleAbout={() => setIsAboutOpen((a) => !a)}
          />

          <div className="bottom-controls-cluster">
            {/* Integrated Now Playing & WAV Export HUD */}
            <NowPlayingHud
              track={selectedTrack}
              playing={playing}
              synthRef={synth}
              mediaRef={mediaRef}
              config={config}
              onOpenDiscover={() => setIsDiscoverOpen(true)}
            />

            <div className="console-divider" aria-hidden="true" />

            <Controls
              playing={playing}
              onTogglePlay={togglePlay}
              scale={scale}
              onChangeScale={setScale}
              isFlat={isFlat}
              onToggleFlat={() => setIsFlat((f) => !f)}
              sweepSpeed={sweepSpeed}
              onToggleSpeed={handleToggleSpeed}
              projectionLocked={selectedTrack?.projection === 'flat'}
              disabled={!textureSource}
            />
          </div>
        </footer>
      </main>

      {/* Discover NASA Modal */}
      {isDiscoverOpen && (
        <DiscoverModal
          track={selectedTrack}
          visionMetrics={visionMetrics}
          onClose={() => setIsDiscoverOpen(false)}
        />
      )}

      {/* Sound Gallery Modal */}
      {isGalleryOpen && (
        <SoundGalleryModal
          tracks={tracks}
          selectedTrack={selectedTrack}
          onSelectTrack={(t) => {
            handleSelectTrack(t)
            setIsGalleryOpen(false)
          }}
          onClose={() => setIsGalleryOpen(false)}
          mediaRef={mediaRef}
          config={config}
        />
      )}

      {/* About this View Drawer */}
      {isAboutOpen && (
        <AboutPanel
          track={selectedTrack}
          isStandIn={isStandInActive}
          onClose={() => setIsAboutOpen(false)}
        />
      )}

      {/* Executive Committee Briefing Modal (accessible via 'E' key) */}
      {isExecutiveOpen && (
        <ExecutiveReviewModal
          onClose={() => setIsExecutiveOpen(false)}
          onTriggerAction={handleTriggerExecutiveAction}
        />
      )}

      {/* Sources & AI Disclosure Drawer */}
      {isSourcesOpen && (
        <div className="sources-modal-panel">
          <div className="sources-modal-header">
            <h3 className="sources-modal-title">NASA Open Data, Sources & AI Disclosure</h3>
            <button
              type="button"
              className="about-close-btn"
              onClick={() => setIsSourcesOpen(false)}
              aria-label="Close credits panel"
            >
              ✕
            </button>
          </div>
          <Sources />
        </div>
      )}
    </div>
  )
}
