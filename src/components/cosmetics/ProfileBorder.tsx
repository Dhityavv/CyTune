'use client';

import React from 'react';

interface ProfileBorderProps {
  borderId?: string | null;
  children: React.ReactNode;
  className?: string;
}

export default function ProfileBorder({
  borderId,
  children,
  className = '',
}: ProfileBorderProps) {
  if (!borderId) {
    return (
      <div
        className={`relative rounded-3xl border border-border-subtle bg-surface/80 p-6 sm:p-8 backdrop-blur-md shadow-xl ${className}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl p-[2px] transition-all duration-300 ${className}`}>
      {/* 1. Animated Gold Edge */}
      {borderId === 'border-animated-gold' && (
        <>
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-90 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #C9A94D 0%, #FFE699 25%, #8A6F27 50%, #FFE699 75%, #C9A94D 100%)',
              boxShadow: '0 0 25px rgba(201, 169, 77, 0.25)',
            }}
          />
        </>
      )}

      {/* 2. Subtle Neon Edge */}
      {borderId === 'border-subtle-neon' && (
        <>
          <div
            className="absolute inset-0 rounded-3xl border border-[#BBF41D] pointer-events-none"
            style={{
              boxShadow: '0 0 15px rgba(187, 244, 29, 0.3), inset 0 0 15px rgba(187, 244, 29, 0.1)',
            }}
          />
          {/* Neon Corner Nodes */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-[#BBF41D] rounded-tl-3xl shadow-[0_0_8px_#BBF41D]" />
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#BBF41D] rounded-tr-3xl shadow-[0_0_8px_#BBF41D]" />
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-[#BBF41D] rounded-bl-3xl shadow-[0_0_8px_#BBF41D]" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#BBF41D] rounded-br-3xl shadow-[0_0_8px_#BBF41D]" />
        </>
      )}

      {/* 3. Aurora Border */}
      {borderId === 'border-aurora' && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 40%, #6366F1 75%, #0D9488 100%)',
            boxShadow: '0 0 25px rgba(45, 212, 191, 0.25)',
          }}
        />
      )}

      {/* 4. Metallic Frame */}
      {borderId === 'border-metallic' && (
        <>
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none border border-[#64748B]/60"
            style={{
              background: 'linear-gradient(135deg, #475569 0%, #1E293B 50%, #334155 100%)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            }}
          />
          {/* Metallic Corner Studs */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#94A3B8] border border-[#334155]" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#94A3B8] border border-[#334155]" />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#94A3B8] border border-[#334155]" />
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#94A3B8] border border-[#334155]" />
        </>
      )}

      {/* 5. Dark Crystal */}
      {borderId === 'border-dark-crystal' && (
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #7E22CE 0%, #3B0764 35%, #1E1B4B 70%, #A855F7 100%)',
            boxShadow: '0 0 20px rgba(126, 34, 206, 0.3)',
          }}
        />
      )}

      {/* Inner Card Content */}
      <div className="relative rounded-[22px] bg-surface/90 border border-border-subtle/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl z-10">
        {children}
      </div>
    </div>
  );
}
