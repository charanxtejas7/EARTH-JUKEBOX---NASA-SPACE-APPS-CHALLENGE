import React from 'react';
import { KeyboardIcon, InfoIcon } from './icons/Icons';

/**
 * AccessibilityPanel Component
 *
 * Dedicated accessibility section adhering to WCAG 2.1 AA / AAA standards:
 * - Minimum 44px tap targets
 * - Screen reader announcements (aria-live="polite")
 * - Keyboard shortcuts navigation guide
 * - Reduced motion support
 */
export default function AccessibilityPanel({
  reducedMotion,
  onToggleReducedMotion,
  ariaAnnouncement,
}) {
  return (
    <section className="panel" aria-labelledby="a11y-heading">
      <div className="panel-header">
        <h2 id="a11y-heading" className="panel-title">
          <KeyboardIcon size={18} />
          Accessibility & Keyboard Controls
        </h2>
      </div>

      <div className="a11y-content">
        <p className="a11y-lead">
          Operable with screen readers, switch devices, and keyboard-only navigation:
        </p>

        <div className="shortcuts-grid">
          <div className="shortcut-card">
            <kbd className="kbd-key">Space</kbd>
            <span className="shortcut-desc">Toggle sonification audio</span>
          </div>
          <div className="shortcut-card">
            <kbd className="kbd-key">← / →</kbd>
            <span className="shortcut-desc">Scrub playhead (Shift for 10% jump)</span>
          </div>
          <div className="shortcut-card">
            <kbd className="kbd-key">Home / End</kbd>
            <span className="shortcut-desc">Jump playhead to start or end</span>
          </div>
          <div className="shortcut-card">
            <kbd className="kbd-key">M</kbd>
            <span className="shortcut-desc">Toggle audio mute</span>
          </div>
        </div>

        {/* Reduced motion toggle with large touch target */}
        <label className="toggle-container" htmlFor="reduced-motion-checkbox">
          <input
            id="reduced-motion-checkbox"
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => onToggleReducedMotion(e.target.checked)}
            className="toggle-checkbox"
          />
          <span className="toggle-label">
            Reduce motion (Disables scanning loop and oscilloscope animations)
          </span>
        </label>
      </div>

      {/* ARIA Live Region for Screen Readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {ariaAnnouncement}
      </div>
    </section>
  );
}
