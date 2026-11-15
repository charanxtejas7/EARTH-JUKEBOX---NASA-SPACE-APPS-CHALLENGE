import React, { useRef, useEffect } from 'react';

/**
 * FluidMotionCanvas Component
 *
 * Implements Google Stitch-inspired fluid motion graphics:
 * - Fluid atmospheric streamlines floating dynamically across the planetary horizon
 * - Reacts to sonification telemetry (frequency & luminance)
 * - Renders with smooth cubic Bezier fluid physics in real-time
 * - Fully accessible: strictly respects reduced-motion
 */
export default function FluidMotionCanvas({
  isPlaying,
  reducedMotion,
  metrics,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = 110);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 800;
      height = canvas.height = 110;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes for fluid stream
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.3 + Math.random() * 0.8,
      size: 1.2 + Math.random() * 2.2,
      opacity: 0.15 + Math.random() * 0.45,
    }));

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const freqRatio = metrics?.freq ? (metrics.freq - 130) / 390 : 0.2;
      const baseAmp = isPlaying ? 16 + freqRatio * 22 : 8;

      step += isPlaying ? 0.025 : 0.008;

      // Draw 3 layered fluid harmonic ribbons (Google Stitch signature fluid stream)
      const ribbons = [
        {
          color: 'rgba(20, 184, 166, 0.22)',
          speed: 1.0,
          wavelength: 0.007,
          amp: baseAmp,
          yOffset: height * 0.48,
        },
        {
          color: 'rgba(56, 189, 248, 0.30)',
          speed: 1.3,
          wavelength: 0.009,
          amp: baseAmp * 0.8,
          yOffset: height * 0.52,
        },
        {
          color: 'rgba(245, 158, 11, 0.16)',
          speed: 0.7,
          wavelength: 0.005,
          amp: baseAmp * 0.6,
          yOffset: height * 0.58,
        },
      ];

      ribbons.forEach((ribbon) => {
        ctx.beginPath();
        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = 1.8;

        for (let x = 0; x <= width; x += 12) {
          const y =
            ribbon.yOffset +
            Math.sin(x * ribbon.wavelength + step * ribbon.speed) * ribbon.amp +
            Math.cos(x * 0.003 - step * 0.5) * 5;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Draw floating fluid particles
      if (!reducedMotion) {
        particles.forEach((p) => {
          p.x += p.speed * (isPlaying ? 1.5 : 0.6);
          if (p.x > width) p.x = 0;

          // Undulate y slightly along with the fluid wave
          const waveY =
            p.y + Math.sin(p.x * 0.01 + step) * (isPlaying ? 8 : 3);

          ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, waveY, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (!reducedMotion) {
        animRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [isPlaying, reducedMotion, metrics]);

  return (
    <div className="fluid-motion-wrapper" aria-hidden="true">
      <canvas ref={canvasRef} className="fluid-motion-canvas" />
    </div>
  );
}

