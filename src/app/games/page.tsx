'use client';

import AppLink from '@/components/AppLink';
import { Gamepad2, Headphones, HelpCircle, Trophy, Sparkles, ArrowRight, Music, Flame, Award, Lock, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';

export default function MiniGamesHubPage() {
  const [guessBestScore, setGuessBestScore] = useState<number>(0);
  const [triviaBestScore, setTriviaBestScore] = useState<number>(0);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    try {
      if (!user) {
        setGuessBestScore(0);
        setTriviaBestScore(0);
        return;
      }
      const savedGuess = localStorage.getItem(`cytune-guess-song-best-${user.id}`) || localStorage.getItem(`orbittune-guess-song-best-${user.id}`);
      if (savedGuess) setGuessBestScore(parseInt(savedGuess, 10));
      const savedTrivia = localStorage.getItem(`cytune-trivia-best-${user.id}`) || localStorage.getItem(`orbittune-trivia-best-${user.id}`);
      if (savedTrivia) setTriviaBestScore(parseInt(savedTrivia, 10));
    } catch {
      // ignore
    }
  }, [user]);

  return (
    <div className="space-y-10 pb-24 max-w-5xl mx-auto select-none">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A94D 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #BBF41D 0%, transparent 70%)' }}
        />

        <div className="space-y-3 z-10 relative max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-accent/15 text-accent border border-accent/25 flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5" />
              Interactive Music Lounge
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BBF41D]/15 text-[#BBF41D] border border-[#BBF41D]/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Earn Cosmetics
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            Mini Games
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Take a break from listening and challenge your music knowledge. Guess tracks from audio previews or test your discography trivia to earn high scores and profile bragging rights.
          </p>
        </div>
      </div>

      {/* Guest Mode Restriction Banner */}
      {!user && (
        <div className="p-5 sm:p-6 rounded-3xl bg-accent/10 border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Mode Tamu: Mini Games Terkunci</h3>
              <p className="text-xs text-text-secondary mt-0.5 max-w-lg">
                Mode tamu dikhususkan untuk memutar musik. Masuk dengan akun Google, GitHub, Discord, atau Email Anda untuk bermain, meraih skor, dan menukarkan koin dengan item kosmetik!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => useAuthModalStore.getState().open('Masuk untuk membuka mini games dan menyimpan rekor skor Anda!')}
            className="px-6 py-2.5 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all shrink-0 cursor-pointer"
          >
            Masuk Akun Sekarang
          </button>
        </div>
      )}

      {/* 2 Interactive Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game 1: Guess the Song */}
        <div className="group relative rounded-3xl bg-gradient-to-b from-surface via-surface/90 to-surface-hover/70 border border-border-subtle hover:border-accent/60 p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
          {/* Ambient Corner Flare */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all pointer-events-none" />

          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-accent text-[#101114] flex items-center justify-center shadow-lg shadow-[#C9A94D]/30 group-hover:scale-105 transition-transform">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border-subtle text-accent flex items-center gap-1.5 font-mono">
                <Flame className="w-3 h-3 text-[#BBF41D]" />
                10 Rounds
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Audio Identification
                </span>
                <span className="text-text-muted">·</span>
                <span className="text-[10px] font-bold text-accent font-mono">Real Previews</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary group-hover:text-accent transition-colors">
                Guess the Song
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed mt-2">
                Listen to a short 15-second music preview and identify the correct song and artist from 4 choices before time runs out.
              </p>
            </div>

            {/* Score & Difficulty Metric */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-sidebar/80 border border-border-subtle">
                <span className="text-[10px] text-text-muted block font-medium">Difficulty</span>
                <span className="text-xs font-bold text-text-primary mt-0.5 block">Adaptive Audio</span>
              </div>
              <div className="p-3 rounded-2xl bg-sidebar/80 border border-border-subtle">
                <span className="text-[10px] text-text-muted block font-medium">Personal Best</span>
                <span className="text-xs font-bold text-accent font-mono mt-0.5 block">
                  {user && guessBestScore > 0 ? `${guessBestScore} pts` : user ? 'No score yet' : 'Login to view'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            {user ? (
              <AppLink
                href="/games/guess-the-song"
                className="w-full py-3.5 px-5 rounded-2xl bg-accent hover:bg-accent-hover text-[#101114] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#C9A94D]/25 active:scale-95 transition-all group/btn"
              >
                <span>Play Guess the Song</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </AppLink>
            ) : (
              <button
                type="button"
                onClick={() => useAuthModalStore.getState().open('Masuk untuk bermain Guess the Song!')}
                className="w-full py-3.5 px-5 rounded-2xl bg-accent/30 hover:bg-accent text-[#101114] font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Masuk untuk Bermain</span>
              </button>
            )}
          </div>
        </div>

        {/* Game 2: Music Trivia */}
        <div className="group relative rounded-3xl bg-gradient-to-b from-surface via-surface/90 to-surface-hover/70 border border-border-subtle hover:border-[#BBF41D]/50 p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
          {/* Ambient Corner Flare */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#BBF41D]/10 rounded-full blur-2xl group-hover:bg-[#BBF41D]/20 transition-all pointer-events-none" />

          <div className="space-y-5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#BBF41D] text-[#101114] flex items-center justify-center shadow-lg shadow-[#BBF41D]/30 group-hover:scale-105 transition-transform">
                <Trophy className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border-subtle text-[#BBF41D] flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3 h-3 text-accent" />
                Knowledge Challenge
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Trivia & History
                </span>
                <span className="text-text-muted">·</span>
                <span className="text-[10px] font-bold text-[#BBF41D] font-mono">Multiple Choice</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary group-hover:text-[#BBF41D] transition-colors">
                Music Trivia
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed mt-2">
                Test your knowledge of world artists, iconic albums, discography, acoustics, genres, and groundbreaking music history.
              </p>
            </div>

            {/* Score & Difficulty Metric */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-sidebar/80 border border-border-subtle">
                <span className="text-[10px] text-text-muted block font-medium">Categories</span>
                <span className="text-xs font-bold text-text-primary mt-0.5 block">6 Music Disciplines</span>
              </div>
              <div className="p-3 rounded-2xl bg-sidebar/80 border border-border-subtle">
                <span className="text-[10px] text-text-muted block font-medium">Personal Best</span>
                <span className="text-xs font-bold text-[#BBF41D] font-mono mt-0.5 block">
                  {user && triviaBestScore > 0 ? `${triviaBestScore} pts` : user ? 'No score yet' : 'Login to view'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 relative z-10">
            {user ? (
              <AppLink
                href="/games/trivia"
                className="w-full py-3.5 px-5 rounded-2xl bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle hover:border-[#BBF41D]/50 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all group/btn"
              >
                <span>Play Music Trivia</span>
                <ArrowRight className="w-4 h-4 text-[#BBF41D] group-hover/btn:translate-x-1 transition-transform" />
              </AppLink>
            ) : (
              <button
                type="button"
                onClick={() => useAuthModalStore.getState().open('Masuk untuk bermain Music Trivia!')}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#BBF41D]/25 hover:bg-[#BBF41D] text-[#101114] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Masuk untuk Bermain</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
