// src/lib/scramble.js
// Text scramble effect for track titles and wordmark
// Honors prefers-reduced-motion: returns final text immediately

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!#?@%'

/**
 * Animate text scrambling into the target string.
 * @param {string} targetText
 * @param {(current: string) => void} onUpdate
 * @param {number} durationMs
 * @param {() => void} onComplete
 */
export function scrambleText(targetText, onUpdate, durationMs = 700, onComplete = () => {}) {
  // Check reduced motion
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReduced || durationMs <= 0) {
    onUpdate(targetText)
    onComplete()
    return () => {}
  }

  const length = targetText.length
  const startTime = performance.now()
  let frameId

  function tick(now) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / durationMs, 1)

    // How many characters have settled
    const settledCount = Math.floor(progress * length)

    let result = ''
    for (let i = 0; i < length; i++) {
      if (i < settledCount) {
        result += targetText[i]
      } else if (targetText[i] === ' ' || targetText[i] === '\n') {
        result += targetText[i]
      } else {
        result += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
    }

    onUpdate(result)

    if (progress < 1) {
      frameId = requestAnimationFrame(tick)
    } else {
      onUpdate(targetText)
      onComplete()
    }
  }

  frameId = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frameId)
}
