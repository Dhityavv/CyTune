'use client';

import React from 'react';

interface AvatarFrameProps {
  frameId?: string | null;
  size?: number; // width & height in px, e.g. 80, 96, 120
  children: React.ReactNode;
  className?: string;
}

export default function AvatarFrame({
  frameId,
  size = 80,
  children,
  className = '',
}: AvatarFrameProps) {
  const containerStyle = {
    width: size,
    height: size,
  };

  if (!frameId) {
    return (
      <div
        className={`relative rounded-full p-1 bg-surface border border-border-subtle shrink-0 ${className}`}
        style={containerStyle}
      >
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`}
      style={containerStyle}
    >
      {/* 1. Solar Halo Frame */}
      {frameId === 'frame-solar-halo' && (
        <>
          <div
            className="absolute inset-[-6px] rounded-full animate-spin pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, #C9A94D, #FFE699, #8A6F27, #FFE699, #C9A94D)',
              animationDuration: '10s',
              filter: 'blur(2px)',
              opacity: 0.85,
            }}
          />
          <div
            className="absolute inset-[-3px] rounded-full border-2 border-[#C9A94D] pointer-events-none"
            style={{
              boxShadow: '0 0 15px rgba(201, 169, 77, 0.6), inset 0 0 10px rgba(201, 169, 77, 0.4)',
            }}
          />
          {/* Solar flare corona nodes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-[#FFE699] shadow-[0_0_8px_#FFE699]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 rounded-full bg-[#FFE699] shadow-[0_0_8px_#FFE699]" />
        </>
      )}

      {/* 2. Celestial Orbit Frame */}
      {frameId === 'frame-celestial-orbit' && (
        <>
          <div className="absolute inset-[-5px] rounded-full border border-[#E6D59A]/40 pointer-events-none" />
          <div
            className="absolute inset-[-8px] rounded-full border border-dashed border-[#E6D59A]/60 animate-spin pointer-events-none"
            style={{ animationDuration: '14s' }}
          >
            {/* Orbiting Satellite Moon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#E6D59A] shadow-[0_0_10px_#E6D59A] border border-[#101114]" />
            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#C9A94D] shadow-[0_0_6px_#C9A94D]" />
          </div>
        </>
      )}

      {/* 3. Aurora Ring Frame */}
      {frameId === 'frame-aurora-ring' && (
        <>
          <div
            className="absolute inset-[-6px] rounded-full animate-spin pointer-events-none"
            style={{
              background: 'conic-gradient(from 180deg, #2DD4BF, #3B82F6, #14B8A6, #6366F1, #2DD4BF)',
              animationDuration: '6s',
              filter: 'blur(3px)',
              opacity: 0.8,
            }}
          />
          <div
            className="absolute inset-[-2px] rounded-full border-2 border-[#2DD4BF] pointer-events-none"
            style={{ boxShadow: '0 0 12px rgba(45, 212, 191, 0.5)' }}
          />
        </>
      )}

      {/* 4. Liquid Chrome Frame */}
      {frameId === 'frame-liquid-chrome' && (
        <>
          <div
            className="absolute inset-[-5px] rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #64748B 45%, #FFFFFF 55%, #334155 100%)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.5)',
            }}
          />
          <div className="absolute inset-[-1px] rounded-full border border-white/50 pointer-events-none" />
        </>
      )}

      {/* 5. Golden Relic Frame */}
      {frameId === 'frame-golden-relic' && (
        <>
          <div
            className="absolute inset-[-7px] rounded-full border-2 border-[#D4AF37] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, transparent 70%, #78350F 100%)',
              boxShadow: '0 0 14px rgba(212, 175, 55, 0.4)',
            }}
          />
          {/* Baroque Crown Corner Filigree Nodes */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-[#D4AF37] rounded-b-md shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFFBEB]" />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2.5 bg-[#D4AF37] rounded-t-md shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFFBEB]" />
          </div>
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 h-4 w-2.5 bg-[#D4AF37] rounded-r-md shadow-md" />
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 h-4 w-2.5 bg-[#D4AF37] rounded-l-md shadow-md" />
        </>
      )}

      {/* 6. Prism Circuit Frame */}
      {frameId === 'frame-prism-circuit' && (
        <>
          <div
            className="absolute inset-[-5px] rounded-2xl border-2 border-[#BBF41D] pointer-events-none"
            style={{
              boxShadow: '0 0 14px rgba(187, 244, 29, 0.45)',
            }}
          />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#BBF41D] shadow-[0_0_8px_#BBF41D]" />
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#BBF41D] shadow-[0_0_8px_#BBF41D]" />
          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-[#BBF41D]" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#BBF41D]" />
        </>
      )}

      {/* Center Avatar Container */}
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden bg-surface flex items-center justify-center shadow-inner">
        {children}
      </div>
    </div>
  );
}
