import React, { useRef, useEffect, useState, useCallback } from 'react';
import { audioEngine } from '../audio/audioEngine';
import { UploadIcon } from './icons/Icons';

/**
 * FrameCanvas Component
 *
 * Renders planetary frame layers and performs real-time column pixel sampling
 * along the playhead to drive the Web Audio synthesizer.
 *
 * Integrates Google Stitch fluid motion graphics:
 * - Fluid interactive ripple propagation on click/scrub
 * - Fluid trailing particle glow on the scanning playhead
 *
 * SCIENTIFIC DISCLOSURE:
 * Sound is mathematically mapped from rendered canvas pixels (luminance & RGB channels),
 * NOT from raw NASA scientific sensor data.
 */
export default function FrameCanvas({
  isPlaying,
  scanSpeed,
  scanMode = 'loop', // 'loop' or 'pingpong'
  onMetricsUpdate,
  reducedMotion,
  announceAria,
}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Selected layer preset
  const [activePreset, setActivePreset] = useState('trueColor');
  const [customImage, setCustomImage] = useState(null);
  const [playheadX, setPlayheadX] = useState(0);
  const [scanDirection, setScanDirection] = useState(1); // 1 = forward, -1 = reverse

  // Interactive hover inspection state
  const [hoverPixel, setHoverPixel] = useState(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  // Fluid ripple effects array (Google Stitch fluid interaction)
  const ripplesRef = useRef([]);

  const [metrics, setMetrics] = useState({
    freq: 130,
    brightness: 0,
    oceanRatio: 0,
    landRatio: 0,
    panPosition: '0.00',
  });

  // Canvas render dimensions
  const WIDTH = 640;
  const HEIGHT = 360;

  /**
   * Draws procedural Earth layers for testing and sonification.
   * [VERIFY]: Presets represent procedural visual proxies, replaceable by team's verified frame sequences.
   */
  const drawLayer = useCallback(
    (ctx) => {
      if (customImage) {
        ctx.drawImage(customImage, 0, 0, WIDTH, HEIGHT);
        return;
      }

      if (activePreset === 'trueColor') {
        // True Color Composite (Ocean, Continents, Clouds, Ice Caps)
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        oceanGrad.addColorStop(0, '#0c274c');
        oceanGrad.addColorStop(0.5, '#13465b');
        oceanGrad.addColorStop(1, '#0e203c');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // West continent
        ctx.fillStyle = '#26734d';
        ctx.beginPath();
        ctx.ellipse(WIDTH * 0.27, HEIGHT * 0.45, 95, 115, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // East continent
        ctx.fillStyle = '#328457';
        ctx.beginPath();
        ctx.ellipse(WIDTH * 0.64, HEIGHT * 0.42, 135, 95, -0.1, 0, Math.PI * 2);
        ctx.fill();

        // Desert band
        ctx.fillStyle = '#c0984a';
        ctx.beginPath();
        ctx.ellipse(WIDTH * 0.67, HEIGHT * 0.48, 65, 28, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Polar ice
        ctx.fillStyle = '#e5ecf6';
        ctx.fillRect(0, 0, WIDTH, 35);
        ctx.fillRect(0, HEIGHT - 28, WIDTH, 28);

        // Atmospheric clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.beginPath();
        ctx.ellipse(WIDTH * 0.38, HEIGHT * 0.32, 160, 24, -0.15, 0, Math.PI * 2);
        ctx.ellipse(WIDTH * 0.74, HEIGHT * 0.62, 130, 20, 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else if (activePreset === 'vegetation') {
        // High-contrast Chlorophyll / Vegetation index proxy [VERIFY]
        ctx.fillStyle = '#0a1a24';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(WIDTH * 0.27, HEIGHT * 0.45, 105, 125, 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.ellipse(WIDTH * 0.64, HEIGHT * 0.42, 145, 105, -0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#047857';
        ctx.beginPath();
        ctx.arc(WIDTH * 0.82, HEIGHT * 0.7, 45, 0, Math.PI * 2);
        ctx.fill();
      } else if (activePreset === 'nocturnal') {
        // Nocturnal City Glow proxy [VERIFY]
        ctx.fillStyle = '#030712';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const citySpots = [
          { x: 0.25, y: 0.38, r: 20 },
          { x: 0.28, y: 0.48, r: 26 },
          { x: 0.62, y: 0.35, r: 32 },
          { x: 0.68, y: 0.42, r: 28 },
          { x: 0.76, y: 0.52, r: 24 },
        ];

        citySpots.forEach((spot) => {
          const radial = ctx.createRadialGradient(
            WIDTH * spot.x,
            HEIGHT * spot.y,
            2,
            WIDTH * spot.x,
            HEIGHT * spot.y,
            spot.r
          );
          radial.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
          radial.addColorStop(0.4, 'rgba(245, 158, 11, 0.55)');
          radial.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = radial;
          ctx.beginPath();
          ctx.arc(WIDTH * spot.x, HEIGHT * spot.y, spot.r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (activePreset === 'thermal') {
        // Thermal Infrared Surface Temperature proxy [VERIFY]
        const thermalGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
        thermalGrad.addColorStop(0, '#311042');
        thermalGrad.addColorStop(0.35, '#72195a');
        thermalGrad.addColorStop(0.7, '#d34336');
        thermalGrad.addColorStop(1, '#f9b641');
        ctx.fillStyle = thermalGrad;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.fillStyle = '#fee08b';
        ctx.beginPath();
        ctx.ellipse(WIDTH * 0.5, HEIGHT * 0.5, 180, 80, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw fluid ripples on the canvas
      if (!reducedMotion && ripplesRef.current.length > 0) {
        ctx.save();
        for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
          const r = ripplesRef.current[i];
          r.radius += 2.2;
          r.alpha *= 0.94;

          ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
          ctx.stroke();

          if (r.alpha < 0.02 || r.radius > 160) {
            ripplesRef.current.splice(i, 1);
          }
        }
        ctx.restore();
      }
    },
    [activePreset, customImage, reducedMotion, WIDTH, HEIGHT]
  );

  // Trigger a fluid ripple at (x, y)
  const addFluidRipple = (x, y) => {
    if (reducedMotion) return;
    ripplesRef.current.push({
      x,
      y,
      radius: 4,
      alpha: 0.8,
    });
  };

  // Redraw whenever preset or custom image changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    drawLayer(ctx);
  }, [drawLayer]);

  /**
   * Samples a vertical strip along the playhead and updates the audio engine.
   */
  const sampleColumn = useCallback(
    (currentX) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const xPos = Math.floor(Math.max(0, Math.min(WIDTH - 1, currentX)));
      const imgData = ctx.getImageData(xPos, 0, 1, HEIGHT);
      const data = imgData.data;

      let totalBrightness = 0;
      let totalRed = 0;
      let totalGreen = 0;
      let totalBlue = 0;
      const pixelCount = HEIGHT;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        totalBrightness += lum;
        totalRed += r;
        totalGreen += g;
        totalBlue += b;
      }

      const avgBrightness = Math.round(totalBrightness / pixelCount);
      const redRatio = totalRed / (pixelCount * 255);
      const greenRatio = totalGreen / (pixelCount * 255);
      const blueRatio = totalBlue / (pixelCount * 255);
      const pan = (xPos / WIDTH) * 2 - 1;

      const calculatedFreq = Math.round(130 + (avgBrightness / 255) * 390);

      const newMetrics = {
        freq: calculatedFreq,
        brightness: avgBrightness,
        redRatio,
        greenRatio,
        blueRatio,
        oceanRatio: Math.round(blueRatio * 100),
        landRatio: Math.round(greenRatio * 100),
        panPosition: pan.toFixed(2),
      };

      setMetrics(newMetrics);
      if (onMetricsUpdate) {
        onMetricsUpdate(newMetrics);
      }

      // Update Web Audio synthesizer in real-time
      audioEngine.updateFromFrameMetrics({
        brightness: avgBrightness,
        redRatio,
        greenRatio,
        blueRatio,
        panPosition: pan,
      });
    },
    [WIDTH, HEIGHT, onMetricsUpdate]
  );

  // Playhead scanning animation loop
  useEffect(() => {
    if (!isPlaying || reducedMotion || isDraggingPlayhead) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        drawLayer(ctx);
      }

      setPlayheadX((prevX) => {
        const step = scanSpeed * delta * 75;
        let nextX = prevX;

        if (scanMode === 'pingpong') {
          nextX = prevX + step * scanDirection;
          if (nextX >= WIDTH - 1) {
            nextX = WIDTH - 1;
            setScanDirection(-1);
          } else if (nextX <= 0) {
            nextX = 0;
            setScanDirection(1);
          }
        } else {
          // Standard continuous loop
          nextX = (prevX + step) % WIDTH;
        }

        sampleColumn(nextX);
        return nextX;
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, scanSpeed, scanMode, scanDirection, reducedMotion, isDraggingPlayhead, WIDTH, drawLayer, sampleColumn]);

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      setCustomImage(img);
      setActivePreset('custom');
      URL.revokeObjectURL(objectUrl);
      if (announceAria) {
        announceAria(`Custom Earth frame loaded: ${file.name}. Ready for sonification.`);
      }
    };

    img.src = objectUrl;
  };

  // Canvas mouse click/drag to scrub playhead + trigger fluid ripple
  const handleCanvasMouseDown = (e) => {
    setIsDraggingPlayhead(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      const scaleY = HEIGHT / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      addFluidRipple(x, y);
    }
    updatePlayheadFromPointer(e);
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      const ctx = canvas.getContext('2d');
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      setHoverPixel({
        x,
        y,
        r: pixel[0],
        g: pixel[1],
        b: pixel[2],
        lum: Math.round(0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2]),
      });
    }

    if (isDraggingPlayhead) {
      updatePlayheadFromPointer(e);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingPlayhead(false);
  };

  const handleCanvasMouseLeave = () => {
    setHoverPixel(null);
    setIsDraggingPlayhead(false);
  };

  const updatePlayheadFromPointer = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const clientX = e.clientX - rect.left;
    const targetX = Math.max(0, Math.min(WIDTH - 1, clientX * scaleX));

    setPlayheadX(targetX);
    sampleColumn(targetX);
  };

  // Keyboard navigation for scrubbing playhead
  const handleKeyDown = (e) => {
    let nextX = playheadX;
    const step = e.shiftKey ? 40 : 12;

    if (e.key === 'ArrowRight') {
      nextX = Math.min(WIDTH - 1, playheadX + step);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      nextX = Math.max(0, playheadX - step);
      e.preventDefault();
    } else if (e.key === 'Home') {
      nextX = 0;
      e.preventDefault();
    } else if (e.key === 'End') {
      nextX = WIDTH - 1;
      e.preventDefault();
    }

    if (nextX !== playheadX) {
      setPlayheadX(nextX);
      sampleColumn(nextX);
      if (announceAria) {
        announceAria(
          `Scrubbed to ${Math.round((nextX / WIDTH) * 100)}% longitude. Mapped frequency: ${metrics.freq} Hz.`
        );
      }
    }
  };

  const playheadPercent = (playheadX / WIDTH) * 100;

  return (
    <div className="canvas-card">
      {/* Preset selector bar */}
      <div className="layer-selector-bar" role="tablist" aria-label="Earth Layer Presets">
        <button
          type="button"
          role="tab"
          aria-selected={activePreset === 'trueColor'}
          className={`tab-btn ${activePreset === 'trueColor' ? 'active' : ''}`}
          onClick={() => {
            setCustomImage(null);
            setActivePreset('trueColor');
          }}
        >
          True Color
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePreset === 'vegetation'}
          className={`tab-btn ${activePreset === 'vegetation' ? 'active' : ''}`}
          onClick={() => {
            setCustomImage(null);
            setActivePreset('vegetation');
          }}
        >
          Vegetation [VERIFY]
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePreset === 'nocturnal'}
          className={`tab-btn ${activePreset === 'nocturnal' ? 'active' : ''}`}
          onClick={() => {
            setCustomImage(null);
            setActivePreset('nocturnal');
          }}
        >
          Nocturnal Glow [VERIFY]
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activePreset === 'thermal'}
          className={`tab-btn ${activePreset === 'thermal' ? 'active' : ''}`}
          onClick={() => {
            setCustomImage(null);
            setActivePreset('thermal');
          }}
        >
          Thermal IR [VERIFY]
        </button>

        <label className={`tab-btn tab-upload ${activePreset === 'custom' ? 'active' : ''}`}>
          <UploadIcon size={14} />
          <span>Upload Frame</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            aria-label="Upload custom image frame from disk"
          />
        </label>
      </div>

      {/* Canvas Viewport */}
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="viewport-canvas"
          role="img"
          aria-label="Earth rendered frame canvas. Left to right scanning translates pixel color and brightness into sound. Click or drag to scrub."
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseLeave}
        />

        {/* Scanning Playhead Line with Fluid Particle Glow */}
        <div
          className="scan-line"
          style={{
            left: `${playheadPercent}%`,
            transition: reducedMotion ? 'none' : undefined,
          }}
          aria-hidden="true"
        >
          <div className="scan-line-head" />
        </div>

        {/* Hover Inspector Crosshair Tag */}
        {hoverPixel && (
          <div
            className="pixel-inspector-badge"
            style={{
              left: `${(hoverPixel.x / WIDTH) * 100}%`,
              top: `${(hoverPixel.y / HEIGHT) * 100}%`,
            }}
            aria-hidden="true"
          >
            RGB: {hoverPixel.r},{hoverPixel.g},{hoverPixel.b} · Lum: {hoverPixel.lum}
          </div>
        )}

        {/* Telemetry Status Bar */}
        <div className="canvas-meta-bar">
          <span>Resolution: {WIDTH}×{HEIGHT} px</span>
          <span>Longitude: {playheadPercent.toFixed(1)}%</span>
          <span>Mapped: {metrics.freq} Hz</span>
          <span style={{ color: 'var(--accent-teal)' }}>
            [Click or Drag to Scrub]
          </span>
        </div>
      </div>
    </div>
  );
}
