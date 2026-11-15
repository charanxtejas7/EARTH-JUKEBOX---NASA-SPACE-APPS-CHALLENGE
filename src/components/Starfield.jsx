import { useEffect, useRef } from 'react'

/**
 * Starfield - A fixed background canvas of slowly drifting stars.
 *
 * Rules followed:
 * - 100% original code (no image files, no stock art, no AI art).
 * - Fixed full-viewport <canvas> behind content (aria-hidden, pointer-events: none).
 * - 3 depth layers of stars scaled to the screen area.
 * - Crisp points only: no blurred gradients or glow blobs.
 * - Colors drawn from our existing CSS variables (--ink, --ice, --muted).
 * - devicePixelRatio aware and resize-safe.
 * - prefers-reduced-motion: renders a single static frame without animation.
 * - Pauses rendering when document.hidden (tab in background).
 * - Capped at ~30 frames per second to keep CPU and battery use low.
 * - Cleans up event listeners and animation frames on unmount.
 */
export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = null
    let lastTime = 0
    const FPS_INTERVAL = 1000 / 30 // Target ~30 fps

    // Check if the user prefers reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = motionQuery.matches

    // Read palette colors from our CSS root variables
    const styles = getComputedStyle(document.documentElement)
    const colorInk = styles.getPropertyValue('--ink').trim() || '#e6edf3'
    const colorIce = styles.getPropertyValue('--ice').trim() || '#9fd8e6'
    const colorMuted = styles.getPropertyValue('--muted').trim() || '#8aa0b4'

    // 3 distinct depth layers:
    // Layer 0: distant, tiny, slowest, faintest
    // Layer 1: mid-distance, medium speed, cool ice tint
    // Layer 2: foreground, crisp point, slightly faster
    const LAYERS = [
      { speed: 0.08, size: 1.0, color: colorMuted },
      { speed: 0.16, size: 1.25, color: colorIce },
      { speed: 0.28, size: 1.5, color: colorInk },
    ]

    let width = 0
    let height = 0
    let stars = []

    // Populate stars scaled to the screen area (approx 1 star per 3500 square pixels)
    function createStars() {
      const area = width * height
      const targetCount = Math.max(120, Math.min(600, Math.floor(area / 3500)))
      stars = []

      for (let i = 0; i < targetCount; i++) {
        // Distribute stars across the 3 layers (more distant stars, fewer foreground stars)
        const layerIndex = i % 6 === 0 ? 2 : i % 3 === 0 ? 1 : 0
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          layer: layerIndex,
        })
      }
    }

    // Set canvas dimensions with devicePixelRatio awareness
    function resize() {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      createStars()
    }

    // Draw one frame of stars: crisp points only, no gradients
    function draw() {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        const def = LAYERS[star.layer]

        ctx.fillStyle = def.color
        // Align to crisp pixel coordinates
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), def.size, def.size)
      }
    }

    // Update star positions for slow, continuous horizontal drift
    function update() {
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i]
        const def = LAYERS[star.layer]

        // Drift slowly from right to left (Earth looks like it sweeps left to right)
        star.x -= def.speed
        if (star.x < 0) {
          star.x = width
          star.y = Math.random() * height
        }
      }
    }

    // Animation loop capped at ~30 FPS
    function loop(now) {
      if (document.hidden) {
        // Pause work when tab is in background; check again next frame
        animId = requestAnimationFrame(loop)
        return
      }

      const elapsed = now - lastTime
      if (elapsed >= FPS_INTERVAL) {
        lastTime = now - (elapsed % FPS_INTERVAL)
        update()
        draw()
      }

      animId = requestAnimationFrame(loop)
    }

    // Initialize dimensions and draw
    resize()
    draw()

    // Start loop only if user has not requested reduced motion
    if (!reducedMotion) {
      animId = requestAnimationFrame(loop)
    }

    // Handle viewport resize
    function onResize() {
      resize()
      draw()
    }
    window.addEventListener('resize', onResize)

    // Handle tab visibility changes (pauses rendering when hidden)
    function onVisibilityChange() {
      if (!document.hidden && !reducedMotion && !animId) {
        lastTime = performance.now()
        animId = requestAnimationFrame(loop)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // Handle changes to reduced motion preference
    function onMotionChange(e) {
      reducedMotion = e.matches
      if (reducedMotion) {
        if (animId) {
          cancelAnimationFrame(animId)
          animId = null
        }
        draw()
      } else if (!animId) {
        lastTime = performance.now()
        animId = requestAnimationFrame(loop)
      }
    }
    motionQuery.addEventListener('change', onMotionChange)

    // Cleanup when component unmounts
    return () => {
      if (animId) cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      motionQuery.removeEventListener('change', onMotionChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      aria-hidden="true"
    />
  )
}

