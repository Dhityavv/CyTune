'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export default function AmbientBackground() {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const ambientColor = usePlayerStore((s) => s.ambientColor);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-canvas">
      {/* Subtle, restrained atmospheric gradient with low saturation */}
      <div
        className={`absolute -top-48 left-1/4 w-[750px] h-[550px] rounded-full blur-[200px] transition-all duration-1000 ${
          isPlaying ? 'opacity-[0.14]' : 'opacity-[0.06]'
        }`}
        style={{
          background: `radial-gradient(circle, ${ambientColor || '#C9A94D'} 0%, transparent 70%)`,
        }}
      />
      <div
        className={`absolute bottom-20 -right-24 w-[600px] h-[500px] rounded-full blur-[200px] transition-all duration-1000 ${
          isPlaying ? 'opacity-[0.10]' : 'opacity-[0.04]'
        }`}
        style={{
          background: 'radial-gradient(circle, var(--surface-hover) 0%, transparent 70%)',
        }}
      />

      {/* Subtle organic texture grain */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.015)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
    </div>
  );
}
