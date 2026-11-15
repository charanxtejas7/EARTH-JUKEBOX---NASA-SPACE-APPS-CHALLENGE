import React, { useRef, useEffect, useState } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { WaveformIcon } from './icons/Icons';

/**
 * Live Fluid Oscilloscope & Spectral Analyzer Component
 *
 * Implements Google Stitch-inspired fluid motion graphics:
 * - Multi-layer liquid Bezier wave ribbons in time domain
 * - Reactive fluid particle glow
 * - 32-band reactive spectral bars
 * - Strictly respects reduced motion accessibility
 */
export default function Oscilloscope({ isPlaying, reducedMotion }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [viewMode, setViewMode] = useState('waveform'); // 'waveform' or 'spectrum'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const bufferLength = 128;
    const timeDomainArray = new Uint8Array(bufferLength);
    const frequencyArray = new Uint8Array(bufferLength);

    let phase = 0;

    const draw = () => {
      // Clear canvas with substrate background
      ctx.fillStyle = '#070b12';
      ctx.fillRect(0, 0, width, height);

      // Subtle horizontal centerline
      ctx.strokeStyle = '#141f2e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (isPlaying && !reducedMotion) {
        phase += 0.04;

        if (viewMode === 'waveform') {
          audioEngine.getWaveformData(timeDomainArray);

          // Draw Layer 1: Ambient background fluid wave (cyan/teal translucent ribbon)
          ctx.beginPath();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(20, 184, 166, 0.35)';

          const sliceWidth = width / (bufferLength - 1);
          let prevX = 0;
          let prevY = height / 2;
          ctx.moveTo(0, height / 2);

          for (let i = 0; i < bufferLength; i++) {
            const v = timeDomainArray[i] / 128.0;
            // Add slight harmonic phase offset for fluid depth
            const fluidMod = Math.sin(i * 0.15 + phase) * 4;
            const y = (v * height) / 2 + fluidMod;
            const x = i * sliceWidth;

            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);

            prevX = x;
            prevY = y;
          }
          ctx.lineTo(width, height / 2);
          ctx.stroke();

          // Draw Layer 2: Main crisp fluid wave (cyan with glow)
          ctx.beginPath();
          ctx.lineWidth = 2.2;
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';

          prevX = 0;
          prevY = height / 2;
          ctx.moveTo(0, height / 2);

          for (let i = 0; i < bufferLength; i++) {
            const v = timeDomainArray[i] / 128.0;
            const y = (v * height) / 2;
            const x = i * sliceWidth;

            const midX = (prevX + x) / 2;
            const midY = (prevY + y) / 2;
            ctx.quadraticCurveTo(prevX, prevY, midX, midY);

            prevX = x;
            prevY = y;
          }
          ctx.lineTo(width, height / 2);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        } else {
          // Draw frequency spectrum with fluid rounded bars
          audioEngine.getFrequencyData(frequencyArray);

          const barCount = 32;
          const barWidth = width / barCount - 2;

          for (let i = 0; i < barCount; i++) {
            const rawVal = frequencyArray[i * 2] / 255;
            const barHeight = Math.max(3, rawVal * (height - 10));
            const x = i * (barWidth + 2);
            const y = height - barHeight;

            // Fluid vertical gradient
            const grad = ctx.createLinearGradient(0, height, 0, y);
            grad.addColorStop(0, '#0d9488');
            grad.addColorStop(0.7, '#14b8a6');
            grad.addColorStop(1, '#38bdf8');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
            ctx.fill();
          }
        }
      } else {
        // Resting static horizon
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#1e2d42';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      }

      if (isPlaying && !reducedMotion) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isPlaying, reducedMotion, viewMode]);

  return (
    <div className="oscilloscope-container">
      <div className="oscilloscope-header">
        <div className="oscilloscope-label">
          <WaveformIcon size={14} />
          <span>{viewMode === 'waveform' ? 'Fluid Waveform (Time Domain)' : 'Spectral Equalizer (FFT)'}</span>
        </div>

        {/* View mode toggle button */}
        <div className="oscilloscope-mode-toggle">
          <button
            type="button"
            className={`btn-micro ${viewMode === 'waveform' ? 'active' : ''}`}
            onClick={() => setViewMode('waveform')}
            aria-label="Show fluid time-domain waveform"
          >
            Fluid Wave
          </button>
          <button
            type="button"
            className={`btn-micro ${viewMode === 'spectrum' ? 'active' : ''}`}
            onClick={() => setViewMode('spectrum')}
            aria-label="Show frequency spectrum bars"
          >
            FFT Spectrum
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={340}
        height={68}
        className="oscilloscope-canvas"
        role="img"
        aria-label="Oscilloscope display showing fluid generated audio waveform and spectrum"
      />
    </div>
  );
}
