'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface AudioVisualizerProps {
  className?: string;
  barCount?: number;
}

export default function AudioVisualizer({ className = '', barCount = 42 }: AudioVisualizerProps) {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle high DPI
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || 320;
    const displayHeight = rect.height || 40;

    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);
    ctx.scale(dpr, dpr);

    if (reducedMotion) {
      // Draw static subtle balanced bar graph
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.fillStyle = '#C9A94D';
      const slotWidth = displayWidth / barCount;
      const barWidth = Math.max(2, slotWidth - 2.5);
      const centerY = displayHeight / 2;

      for (let i = 0; i < barCount; i++) {
        const norm = i / barCount;
        const bell = Math.sin(norm * Math.PI); // Smooth arc curve
        const barHeight = Math.max(3, bell * (displayHeight * 0.5));
        const x = i * slotWidth + (slotWidth - barWidth) / 2;
        const y = centerY - barHeight / 2;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 999);
        ctx.fill();
      }
      return;
    }

    // Dynamic state for organic fluid physics
    const barHeights = new Float32Array(barCount).fill(4);
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const centerY = displayHeight / 2;
      const slotWidth = displayWidth / barCount;
      const barWidth = Math.max(2, slotWidth - 2.5);

      // Create Nocturne Champagne Gold gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, displayHeight);
      gradient.addColorStop(0, '#E8E4D9');
      gradient.addColorStop(0.35, '#DDC473');
      gradient.addColorStop(0.65, '#C9A94D');
      gradient.addColorStop(1, '#8A6D27');

      ctx.fillStyle = gradient;

      const timeSec = now * 0.003;
      const active = isPlayingRef.current;

      for (let i = 0; i < barCount; i++) {
        const norm = i / barCount;

        // Symmetric bell envelope so edges naturally taper smoothly
        const bell = Math.sin(norm * Math.PI);

        // Harmonic organic wave superposition
        const wave1 = Math.sin(timeSec * 2.2 + norm * 8.0);
        const wave2 = Math.cos(timeSec * 3.7 - norm * 12.0);
        const wave3 = Math.sin(timeSec * 5.1 + norm * 20.0);
        const flutter = Math.sin(timeSec * 9.0 + i * 1.5) * 0.25;

        // Combined normalized signal
        let signal = (wave1 * 0.45 + wave2 * 0.35 + wave3 * 0.2 + flutter + 1) / 2;
        signal = Math.max(0, Math.min(1, signal));

        // When playing, bar responds dynamically; when paused, rests smoothly
        const targetHeight = active
          ? Math.max(4, signal * (displayHeight * 0.88) * (0.35 + bell * 0.65))
          : Math.max(3, 3 + bell * 4 * Math.sin(timeSec * 0.8 + norm * 3));

        // Smooth spring interpolation (lerp) towards target height
        const lerpSpeed = active ? 14 : 6;
        barHeights[i] += (targetHeight - barHeights[i]) * Math.min(1, dt * lerpSpeed);

        const currentH = barHeights[i];
        const x = i * slotWidth + (slotWidth - barWidth) / 2;
        const y = centerY - currentH / 2;

        // Vertically centered pill bar with full rounded caps
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, currentH, 999);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [barCount]);

  return (
    <div className={`w-full h-10 flex items-center justify-center overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-md opacity-90 transition-opacity duration-300"
      />
    </div>
  );
}
