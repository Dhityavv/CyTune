'use client';

import React from 'react';

interface ProfileBackgroundProps {
  backgroundId?: string | null;
  className?: string;
  overlayOpacity?: number; // default 0.85 for readability
}

export default function ProfileBackground({
  backgroundId,
  className = '',
  overlayOpacity = 0.85,
}: ProfileBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-3xl ${className}`}>
      {/* Background Graphic Layers */}
      {!backgroundId && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(201, 169, 77, 0.12) 0%, rgba(16, 17, 20, 0) 70%), #101114',
          }}
        />
      )}

      {/* 1. Deep Space Nebula */}
      {backgroundId === 'bg-space-nebula' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 75% 20%, rgba(201, 169, 77, 0.35) 0%, rgba(30, 27, 75, 0.6) 50%, #060709 100%)',
            }}
          />
          {/* Cosmic stardust points */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              backgroundImage: 'radial-gradient(circle, #FFE699 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
        </div>
      )}

      {/* 2. Luminous Soundwave */}
      {backgroundId === 'bg-soundwave' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.5) 0%, rgba(187, 244, 29, 0.15) 40%, #05070A 100%)',
            }}
          />
          {/* Subtle audio waveform grid lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #BBF41D 0, #BBF41D 1px, transparent 0, transparent 40px)',
            }}
          />
        </div>
      )}

      {/* 3. Midnight Cityscape */}
      {backgroundId === 'bg-midnight-city' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, rgba(2, 6, 23, 0.95) 100%)',
            }}
          />
          {/* Bokeh amber lights */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="absolute bottom-1/3 left-1/3 w-40 h-40 rounded-full bg-sky-500/15 blur-3xl" />
        </div>
      )}

      {/* 4. Cosmic Aurora */}
      {backgroundId === 'bg-cosmic-aurora' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.55) 0%, rgba(30, 27, 75, 0.7) 60%, #060709 100%)',
            }}
          />
          {/* Flowing aurora curtain */}
          <div className="absolute -top-10 left-0 right-0 h-48 bg-gradient-to-b from-teal-400/20 via-transparent to-transparent blur-xl" />
        </div>
      )}

      {/* 5. Dark Liquid Silk */}
      {backgroundId === 'bg-liquid-silk' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 30% 20%, rgba(40, 32, 20, 0.9) 0%, rgba(10, 10, 12, 0.98) 80%)',
            }}
          />
          <div className="absolute -bottom-10 right-0 w-80 h-80 rounded-full bg-[#C9A94D]/10 blur-3xl" />
        </div>
      )}

      {/* 6. Celestial Horizon */}
      {backgroundId === 'bg-celestial-horizon' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.6) 0%, rgba(11, 10, 26, 0.9) 50%, #020204 100%)',
            }}
          />
          {/* Twilight Horizon Glow */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A94D]/40 to-transparent blur-sm" />
        </div>
      )}

      {/* Dark Nocturne Contrast Overlay Mask — guarantees 100% text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0A0B0D] via-[#0A0B0D]/80 to-transparent"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  );
}
