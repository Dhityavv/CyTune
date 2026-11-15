'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const MEOWS = ['Meow!', 'Purrr...', 'Mrrrp!', 'Nyaa~', 'Meow meow!'];

function playMeow() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.32);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
    osc.onended = () => ctx.close();
  } catch {
    // ignore
  }
}

export default function CatMascot() {
  const [meow, setMeow] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = () => {
    const msg = MEOWS[Math.floor(Math.random() * MEOWS.length)];
    setMeow(msg);
    playMeow();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMeow(null), 1400);
  };

  return (
    <>
      {meow && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-32 right-4 sm:bottom-36 sm:right-6 z-40 px-3 py-1.5 rounded-2xl bg-surface border border-accent/40 shadow-lg text-[12px] text-text-primary pointer-events-none"
        >
          {meow}
        </motion.div>
      )}

      <motion.button
        drag
        dragMomentum={false}
        whileHover={{ scale: 1.1, rotate: [0, -8, 8, 0] }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        aria-label="Orbit cat"
        className="fixed bottom-12 right-4 sm:bottom-16 sm:right-6 z-30 w-14 h-14 rounded-full bg-surface border border-accent/40 shadow-xl shadow-black/50 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <motion.svg
          viewBox="0 0 64 64"
          className="w-9 h-9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ rotate: [0, -4, 4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M14 26 L10 12 L22 20 Z" fill="#C9A94D" />
          <path d="M50 26 L54 12 L42 20 Z" fill="#C9A94D" />
          <ellipse cx="32" cy="34" rx="18" ry="16" fill="#C9A94D" />
          <ellipse cx="32" cy="38" rx="11" ry="9" fill="#F5E6C8" />
          <circle cx="25" cy="32" r="2.2" fill="#0B0A08" />
          <circle cx="39" cy="32" r="2.2" fill="#0B0A08" />
          <ellipse cx="32" cy="37" rx="1.6" ry="1.2" fill="#0B0A08" />
          <path d="M29 40 Q32 42 35 40" stroke="#0B0A08" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </motion.svg>
      </motion.button>
    </>
  );
}
