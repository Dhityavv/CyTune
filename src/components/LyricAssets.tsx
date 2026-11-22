'use client';

import React from 'react';

// ============================================================
// CYTUNE KINETIC LYRIC ASSETS & ILLUSTRATED STICKERS
// High-definition SVG stickers with drop-shadows and vibrant fills
// ============================================================

export function MoneyBagAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-money ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_10px_rgba(245,158,11,0.6)]">
        <path
          d="M24 10C21 10 18 12 18 14C12 16 8 22 8 32C8 40 14 44 24 44C34 44 40 40 40 32C40 22 36 16 30 14C30 12 27 10 24 10Z"
          fill="url(#goldBagGrad)"
          stroke="#101114"
          strokeWidth="2.5"
        />
        <path
          d="M17 14C17 14 19 9 24 9C29 9 31 14 31 14"
          fill="#EAB308"
          stroke="#101114"
          strokeWidth="2.5"
        />
        <path d="M18 15H30" stroke="#713F12" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="30" r="7" fill="#10B981" stroke="#064E3B" strokeWidth="1.5" />
        <path
          d="M24 25.5V34.5M26.2 27.5C26.2 26.5 25.2 26 24 26C22.8 26 22 26.6 22 27.5C22 29 26 29 26 30.5C26 31.4 25.2 32 24 32C22.5 32 21.8 31.2 21.8 30.5"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="goldBagGrad" x1="8" y1="10" x2="40" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.4" stopColor="#EAB308" />
            <stop offset="1" stopColor="#CA8A04" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function IceDiamondAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-ice ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_12px_rgba(56,189,248,0.7)]">
        <polygon points="12,18 24,6 36,18 24,42" fill="url(#iceFacet1)" stroke="#0284C7" strokeWidth="2" />
        <polygon points="12,18 24,6 24,42" fill="url(#iceFacet2)" stroke="#0284C7" strokeWidth="1.5" />
        <polygon points="24,6 36,18 24,24" fill="#E0F2FE" opacity="0.9" />
        <polygon points="12,18 24,24 6,24" fill="#BAE6FD" opacity="0.75" />
        <polygon points="36,18 42,24 24,24" fill="#38BDF8" opacity="0.8" />
        <path
          d="M36 8L37.5 12L41.5 13.5L37.5 15L36 19L34.5 15L30.5 13.5L34.5 12Z"
          fill="#FFFFFF"
          className="animate-pulse"
        />
        <defs>
          <linearGradient id="iceFacet1" x1="12" y1="6" x2="36" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.5" stopColor="#67E8F9" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="iceFacet2" x1="12" y1="6" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function FireFlameAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-flame ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_14px_rgba(249,115,22,0.8)]">
        <path
          d="M24 4C24 4 28 10 28 16C33 13 38 18 38 26C38 36 32 44 24 44C16 44 10 36 10 26C10 18 16 11 20 6C20 10 22 13 24 4Z"
          fill="url(#fireOuterGrad)"
          stroke="#7F1D1D"
          strokeWidth="1.5"
        />
        <path
          d="M24 16C24 16 27 20 27 24C30 22 33 26 33 30C33 36 29 40 24 40C19 40 15 36 15 30C15 24 19 19 21 17C21 20 23 21 24 16Z"
          fill="url(#fireMidGrad)"
        />
        <path
          d="M24 26C24 26 26 29 26 31C28 30 29 32 29 34C29 37 27 39 24 39C21 39 19 37 19 34C19 31 22 28 23 27C23 29 23.5 29.5 24 26Z"
          fill="#FEF08A"
        />
        <defs>
          <linearGradient id="fireOuterGrad" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F97316" />
            <stop offset="0.6" stopColor="#EF4444" />
            <stop offset="1" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id="fireMidGrad" x1="15" y1="16" x2="33" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="1" stopColor="#F97316" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

// BIG Starburst Asset (as seen in Image 2: "big 💥")
export function BigBurstAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-big ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_8px_rgba(251,191,36,0.95)]">
        <polygon
          points="16,2 19,9 27,6 23,13 30,16 23,19 27,26 19,23 16,30 13,23 5,26 9,19 2,16 9,13 5,6 13,9"
          fill="url(#bigBurstGrad)"
          stroke="#78350F"
          strokeWidth="1.2"
        />
        <circle cx="16" cy="16" r="4.5" fill="#FEF08A" />
        <defs>
          <linearGradient id="bigBurstGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#F43F5E" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

// ACTION Kinetic Spark Asset (as seen in Image 2: "pull ⚡")
export function ActionSparkAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-pull ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_8px_rgba(163,230,53,0.9)]">
        <path
          d="M16 2L18.8 11.5L28 14L18.8 16.5L16 26L13.2 16.5L4 14L13.2 11.5Z"
          fill="url(#sparkLimeGrad)"
          stroke="#365314"
          strokeWidth="1.2"
        />
        <circle cx="23" cy="7" r="2.5" fill="#FACC15" />
        <defs>
          <linearGradient id="sparkLimeGrad" x1="4" y1="2" x2="28" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BEF264" />
            <stop offset="0.5" stopColor="#A3E635" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

// COSMIC Star Twinkle Asset (for Chill / Ballad / Night songs)
export function CosmicStarAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-star ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_8px_rgba(192,132,252,0.85)]">
        <path
          d="M16 3L18.8 12.2L28 15L18.8 17.8L16 27L13.2 17.8L4 15L13.2 12.2Z"
          fill="url(#cosmicStarGrad)"
          stroke="#4C1D95"
          strokeWidth="1.2"
        />
        <circle cx="16" cy="15" r="3" fill="#FFFFFF" />
        <defs>
          <linearGradient id="cosmicStarGrad" x1="4" y1="3" x2="28" y2="27" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5D0FE" />
            <stop offset="0.5" stopColor="#C084FC" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function SneakerAsset({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_10px_rgba(59,130,246,0.6)]">
        <path
          d="M6 34C6 34 16 34 26 34C34 34 42 33 42 36C42 38 38 39 30 39C18 39 6 38 6 34Z"
          fill="#FFFFFF"
          stroke="#1E293B"
          strokeWidth="2"
        />
        <path
          d="M8 34L10 26C12 24 15 23 18 24L26 27L33 21C35 20 38 21 39 24L41 33L6 34Z"
          fill="url(#sneakerGrad)"
          stroke="#1E293B"
          strokeWidth="2"
        />
        <path
          d="M14 31C18 31 28 29 35 25C30 27 22 28 16 28"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line x1="22" y1="24" x2="25" y2="28" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="22" x2="28" y2="26" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="sneakerGrad" x1="8" y1="20" x2="41" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function NewsPaperAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_10px_rgba(14,165,233,0.5)]">
        <rect x="8" y="10" width="32" height="28" rx="3" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="12" y="14" width="24" height="4" rx="1" fill="#0284C7" />
        <line x1="12" y1="22" x2="24" y2="22" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="26" x2="22" y2="26" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="30" x2="24" y2="30" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
        <rect x="27" y="21" width="9" height="10" rx="1.5" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1" />
      </svg>
    </span>
  );
}

export function LockAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_10px_rgba(244,63,94,0.6)]">
        <path
          d="M16 20V14C16 9.5 19.5 6 24 6C28.5 6 32 9.5 32 14V20"
          stroke="#E2E8F0"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <rect x="12" y="20" width="24" height="20" rx="4" fill="url(#lockGrad)" stroke="#1E293B" strokeWidth="2" />
        <circle cx="24" cy="28" r="2.5" fill="#1E293B" />
        <path d="M24 30.5V34" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <defs>
          <linearGradient id="lockGrad" x1="12" y1="20" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FB7185" />
            <stop offset="1" stopColor="#E11D48" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function HeartPulseAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-beat ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_12px_rgba(244,114,182,0.8)]">
        <path
          d="M24 41C24 41 7 29 7 17C7 11.5 11.5 7 17 7C20.5 7 23 9 24 11C25 9 27.5 7 31 7C36.5 7 41 11.5 41 17C41 29 24 41 24 41Z"
          fill="url(#rubyHeartGrad)"
          stroke="#881337"
          strokeWidth="2"
        />
        <path
          d="M14 14C14 14 15 10 18 10"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <defs>
          <linearGradient id="rubyHeartGrad" x1="7" y1="7" x2="41" y2="41" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F472B6" />
            <stop offset="0.6" stopColor="#E11D48" />
            <stop offset="1" stopColor="#9F1239" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function LightningAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-shake ${className}`}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full drop-shadow-[0_4px_12px_rgba(250,204,21,0.8)]">
        <polygon
          points="26,4 12,24 22,24 18,44 34,20 24,20"
          fill="url(#voltGrad)"
          stroke="#713F12"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="voltGrad" x1="12" y1="4" x2="34" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#FACC15" />
            <stop offset="1" stopColor="#EAB308" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function CrownAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-lyric-big ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]">
        <polygon points="4,24 6,10 12,18 16,8 20,18 26,10 28,24" fill="url(#crownGrad)" stroke="#78350F" strokeWidth="1.2" />
        <rect x="4" y="24" width="24" height="4" rx="1.5" fill="#EAB308" stroke="#78350F" strokeWidth="1" />
        <circle cx="16" cy="8" r="1.5" fill="#FEF08A" />
        <defs>
          <linearGradient id="crownGrad" x1="4" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FDE047" />
            <stop offset="0.6" stopColor="#EAB308" />
            <stop offset="1" stopColor="#CA8A04" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}

export function ClockAsset({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center shrink-0 animate-pulse ${className}`}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_2px_8px_rgba(244,63,94,0.7)]">
        <circle cx="16" cy="16" r="13" stroke="#F43F5E" strokeWidth="2.5" fill="#18181B" />
        <polyline points="16,8 16,16 21,16" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" />
        <circle cx="16" cy="16" r="2" fill="#F43F5E" />
      </svg>
    </span>
  );
}

// Asset Mapper Helper
export function renderLyricAsset(assetType?: string, className?: string): React.ReactNode {
  switch (assetType) {
    case 'money':
      return <MoneyBagAsset className={className} />;
    case 'ice':
      return <IceDiamondAsset className={className} />;
    case 'fire':
      return <FireFlameAsset className={className} />;
    case 'big':
      return <BigBurstAsset className={className} />;
    case 'spark':
      return <ActionSparkAsset className={className} />;
    case 'star':
      return <CosmicStarAsset className={className} />;
    case 'shoe':
      return <SneakerAsset className={className} />;
    case 'news':
      return <NewsPaperAsset className={className} />;
    case 'lock':
      return <LockAsset className={className} />;
    case 'heart':
      return <HeartPulseAsset className={className} />;
    case 'electric':
      return <LightningAsset className={className} />;
    case 'crown':
      return <CrownAsset className={className} />;
    case 'clock':
      return <ClockAsset className={className} />;
    default:
      return null;
  }
}
