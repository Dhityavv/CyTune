'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Flame,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  Music,
  Disc,
  Loader2,
  Award,
  AlertCircle,
  RefreshCw,
  SkipForward
} from 'lucide-react';
import CoverImage from '@/components/CoverImage';
import { GUESS_TRACKS_CATALOG, GuessTrack } from '@/lib/guessTracks';
import { audioSession, GamePreviewState } from '@/lib/audioSession';
import UniversalProgressBar from '@/components/UniversalProgressBar';

interface RoundReview {
  round: number;
  track: GuessTrack;
  userAnswer: string;
  isCorrect: boolean;
  earnedPoints: number;
}

const PREVIEW_LIMIT_SECONDS = 15;

export default function GuessTheSongPage() {
  const [rounds, setRounds] = useState<GuessTrack[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [reviews, setReviews] = useState<RoundReview[]>([]);
  const [gameFinished, setGameFinished] = useState(false);

  // Audio preview state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Stop audio and pause
  const stopAudio = () => {
    audioSession.stopGamePreview();
    setIsPlayingAudio(false);
    setAudioLoading(false);
    setPlaybackSeconds(0);
  };

  // Play preview from specific URL using centralized audio session (zero overlap guarantee)
  const loadAndPlayAudio = (track: GuessTrack) => {
    setAudioLoading(true);
    setAudioError(null);
    setPlaybackSeconds(0);

    audioSession.startGamePreview(track, (state: GamePreviewState) => {
      setIsPlayingAudio(state.isPlaying);
      setAudioLoading(state.isLoading);
      setAudioError(state.error);
      setPlaybackSeconds(Math.min(PREVIEW_LIMIT_SECONDS, Math.floor(state.currentTime)));
    });
  };

  const togglePlayAudio = () => {
    const curTrack = rounds[currentRoundIdx];
    if (!curTrack) return;

    if (audioSession.getActiveSession() === 'GAME_PREVIEW') {
      audioSession.toggleGamePreview();
    } else {
      loadAndPlayAudio(curTrack);
    }
  };

  const handleReplay = () => {
    const curTrack = rounds[currentRoundIdx];
    if (!curTrack) return;

    if (audioSession.getActiveSession() === 'GAME_PREVIEW') {
      audioSession.replayGamePreview();
    } else {
      loadAndPlayAudio(curTrack);
    }
  };

  const toggleMute = () => {
    const nextMuted = audioSession.toggleMute();
    setIsMuted(nextMuted);
  };

  // Setup round
  const setupRound = (currentTrack: GuessTrack, currentPool: GuessTrack[]) => {
    setSelectedOption(null);
    setIsAnswered(false);
    setPlaybackSeconds(0);
    setAudioError(null);

    // Pick 3 plausible distractors from GUESS_TRACKS_CATALOG
    const otherTracks = GUESS_TRACKS_CATALOG.filter((t) => t.id !== currentTrack.id);
    const shuffledOthers = [...otherTracks].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3).map((t) => `${t.title} — ${t.artist}`);

    const correct = `${currentTrack.title} — ${currentTrack.artist}`;
    const roundOptions = [...distractors, correct].sort(() => 0.5 - Math.random());
    setOptions(roundOptions);

    // Start playing genuine audio preview!
    loadAndPlayAudio(currentTrack);
  };

  // Start new 10-round game with repeat prevention
  const startNewGame = () => {
    stopAudio();

    // Read recently seen IDs from localStorage
    let seenIds: string[] = [];
    try {
      const stored = localStorage.getItem('orbittune-guess-seen');
      if (stored) seenIds = JSON.parse(stored);
    } catch {
      seenIds = [];
    }

    // Filter unseen tracks first
    let eligible = GUESS_TRACKS_CATALOG.filter((t) => !seenIds.includes(t.id));
    if (eligible.length < 10) {
      // Reset seen history if pool exhausted
      eligible = [...GUESS_TRACKS_CATALOG];
      seenIds = [];
    }

    // Shuffle and pick 10 tracks
    const shuffled = [...eligible].sort(() => 0.5 - Math.random());
    const picked10 = shuffled.slice(0, 10);

    // Save newly picked IDs to seen history
    try {
      const newSeen = [...seenIds, ...picked10.map((t) => t.id)].slice(-100);
      localStorage.setItem('orbittune-guess-seen', JSON.stringify(newSeen));
    } catch {
      // ignore
    }

    setRounds(picked10);
    setCurrentRoundIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setReviews([]);
    setGameFinished(false);
    setSelectedOption(null);
    setIsAnswered(false);

    if (picked10.length > 0) {
      setupRound(picked10[0], picked10);
    }
  };

  // Mount effect
  useEffect(() => {
    startNewGame();
    return () => {
      stopAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectOption = (choice: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedOption(choice);

    const currentTrack = rounds[currentRoundIdx];
    const correctString = `${currentTrack.title} — ${currentTrack.artist}`;
    const isCorrect = choice === correctString;

    let roundPoints = 0;
    if (isCorrect) {
      const bonus = streak * 20;
      roundPoints = 100 + bonus;
      const nextScore = score + roundPoints;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      setStreak(0);
    }

    setReviews((prev) => [
      ...prev,
      {
        round: currentRoundIdx + 1,
        track: currentTrack,
        userAnswer: choice,
        isCorrect,
        earnedPoints: roundPoints,
      },
    ]);
  };

  const handleNextRound = () => {
    stopAudio();
    const nextIdx = currentRoundIdx + 1;
    if (nextIdx < 10) {
      setCurrentRoundIdx(nextIdx);
      setupRound(rounds[nextIdx], rounds);
    } else {
      // Game Over
      setGameFinished(true);
      try {
        const currentBest = parseInt(localStorage.getItem('orbittune-guess-song-best') || '0', 10);
        if (score > currentBest) {
          localStorage.setItem('orbittune-guess-song-best', String(score));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSkipBrokenAudio = () => {
    // Replace broken track with an alternative from catalog
    const alternative = GUESS_TRACKS_CATALOG.find(
      (t) => !rounds.some((r) => r.id === t.id)
    );
    if (alternative) {
      const updated = [...rounds];
      updated[currentRoundIdx] = alternative;
      setRounds(updated);
      setupRound(alternative, updated);
    }
  };

  const currentTrack = rounds[currentRoundIdx];
  const correctChoice = currentTrack ? `${currentTrack.title} — ${currentTrack.artist}` : '';

  const getRank = (finalScore: number) => {
    if (finalScore >= 1200) return { title: 'Legendary Maestro', badge: 'bg-[#BBF41D] text-[#101114]' };
    if (finalScore >= 800) return { title: 'Sonic Virtuoso', badge: 'bg-accent text-[#101114]' };
    if (finalScore >= 500) return { title: 'Music Buff', badge: 'bg-teal-500/20 text-teal-300' };
    return { title: 'Curious Listener', badge: 'bg-surface border border-border-subtle text-text-primary' };
  };

  return (
    <div className="space-y-8 pb-28 max-w-4xl mx-auto select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <Link
          href="/games"
          onClick={stopAudio}
          className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-surface/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Games Hub</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border-subtle text-xs font-mono font-bold text-accent shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>{score} pts</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#BBF41D]/15 border border-[#BBF41D]/30 text-xs font-mono font-bold text-[#BBF41D] animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{streak}x Streak</span>
            </div>
          )}
        </div>
      </div>

      {!gameFinished && currentTrack ? (
        <div className="space-y-6">
          {/* Progress Tracker: Exactly 10 Rounds */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-text-primary uppercase tracking-wider text-[11px] font-mono">
                Round {currentRoundIdx + 1} of 10
              </span>
              <span className="text-text-muted font-mono">{Math.round(((currentRoundIdx + 1) / 10) * 100)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-gradient-to-r from-accent to-[#BBF41D] transition-all duration-300 rounded-full"
                style={{ width: `${((currentRoundIdx + 1) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Interactive Audio Turntable Stage */}
          <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-10 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-md">
            {/* Spinning Vinyl Disc (Masks the artwork until answered) */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl flex items-center justify-center bg-black/95 ring-4 ring-border-subtle">
              {isAnswered ? (
                /* Reveal Album Artwork */
                <CoverImage
                  src={currentTrack.artwork || ''}
                  alt={currentTrack.title}
                  size="lg"
                  className="w-full h-full object-cover animate-fade-up"
                />
              ) : (
                /* Masked Vinyl with Grooves */
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-tr from-[#0F1012] via-[#1C1E24] to-[#0F1012] ${
                    isPlayingAudio ? 'animate-[spin_3.5s_linear_infinite]' : ''
                  }`}
                >
                  <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent/60 flex items-center justify-center shadow-inner">
                    <Disc className="w-10 h-10 text-accent animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {/* Audio Error Alert if any */}
            {audioError && (
              <div className="px-4 py-2.5 rounded-2xl bg-red-950/40 border border-red-500/40 flex items-center gap-3 text-red-300 text-xs max-w-md animate-fade-up">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="flex-1 text-left">{audioError}</span>
                <button
                  type="button"
                  onClick={handleSkipBrokenAudio}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 font-bold text-[10px] text-white flex items-center gap-1 shrink-0"
                >
                  <SkipForward className="w-3 h-3" />
                  <span>Skip Track</span>
                </button>
              </div>
            )}

            {/* Genuine Audio Player Controls & Progress Timeline */}
            <div className="w-full max-w-md space-y-3">
              {/* Play / Pause / Replay Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={handleReplay}
                  disabled={audioLoading}
                  className="p-3 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all active:scale-95 disabled:opacity-40"
                  title="Replay from start"
                >
                  <RotateCcw className="w-4 h-4 text-accent" />
                </button>

                {/* Primary Play / Pause Toggle Button */}
                <button
                  type="button"
                  onClick={togglePlayAudio}
                  disabled={audioLoading}
                  className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-[#101114] flex items-center justify-center shadow-xl shadow-[#C9A94D]/30 transition-all active:scale-95 disabled:opacity-50"
                  title={isPlayingAudio ? 'Pause Preview' : 'Play Preview'}
                >
                  {audioLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#101114]" />
                  ) : isPlayingAudio ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-3 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all active:scale-95"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-text-muted hover:text-text-primary" />
                  )}
                </button>
              </div>

              {/* Real Audio Progress Timeline (60FPS Universal Smooth Bar) */}
              <div className="space-y-1 px-4">
                <UniversalProgressBar
                  seekable={false}
                  showTimestamps={true}
                  overrideDuration={PREVIEW_LIMIT_SECONDS}
                  overrideTime={playbackSeconds}
                  heightClass="h-1.5"
                />
                <div className="flex items-center justify-center text-[11px] font-mono text-accent font-semibold pt-0.5">
                  {isPlayingAudio ? '● Audible 15s Preview Stream' : 'Press Play to Listen'}
                </div>
              </div>
            </div>

            {/* Revealed Meta Info after answering */}
            {isAnswered && (
              <div className="animate-fade-up space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
                  Correct Track
                </span>
                <h3 className="text-xl font-bold text-text-primary">{currentTrack.title}</h3>
                <p className="text-xs text-text-secondary">
                  {currentTrack.artist} {currentTrack.album ? `• ${currentTrack.album}` : ''}
                </p>
              </div>
            )}
          </div>

          {/* 4 Multiple Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isOptionCorrect = option === correctChoice;

              let style =
                'bg-surface/80 hover:bg-surface-hover border-border-subtle text-text-primary hover:border-accent/50';

              if (isAnswered) {
                if (isOptionCorrect) {
                  style = 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500';
                } else if (isSelected) {
                  style = 'bg-red-500/15 border-red-500 text-red-300 font-bold';
                } else {
                  style = 'bg-surface/30 border-border-subtle text-text-muted opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between gap-3 shadow-md active:scale-[0.99] ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-sidebar border border-border-subtle flex items-center justify-center font-mono text-xs text-text-muted shrink-0 font-bold">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed truncate">{option}</span>
                  </div>

                  {isAnswered && isOptionCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isAnswered && isSelected && !isOptionCorrect && <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Next Round Action */}
          {isAnswered && (
            <div className="flex justify-end pt-2 animate-fade-up">
              <button
                type="button"
                onClick={handleNextRound}
                className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-[#101114] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95 group"
              >
                <span>{currentRoundIdx === 9 ? 'View Final Results' : 'Next Round'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results Screen */
        <div className="space-y-8 animate-fade-up">
          {/* Score Podium */}
          <div className="p-8 sm:p-10 rounded-3xl bg-surface/80 border border-border-subtle text-center space-y-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="w-16 h-16 rounded-3xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center mx-auto shadow-xl">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 font-mono">
                {getRank(score).title}
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                {score} Points
              </h2>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Session finished! You identified {reviews.filter((r) => r.isCorrect).length} out of 10 songs correctly with a best streak of {bestStreak}x.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startNewGame}
                className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-[#101114] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#C9A94D]/25 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again (New 10 Songs)</span>
              </button>
              <Link
                href="/games"
                className="px-6 py-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary font-semibold text-xs transition-all"
              >
                Mini Games Hub
              </Link>
            </div>
          </div>

          {/* Full 10-Round Review */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Award className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-text-primary">10-Round Performance Review</h3>
            </div>

            <div className="space-y-2">
              {reviews.map((rev) => (
                <div
                  key={rev.round}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    rev.isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-surface border border-border-subtle flex items-center justify-center font-mono text-[11px] font-bold text-text-muted">
                      #{rev.round}
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-text-primary">
                        {rev.track.title} — {rev.track.artist}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Your answer: <span className={rev.isCorrect ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>{rev.userAnswer}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`text-xs font-mono font-bold ${rev.isCorrect ? 'text-emerald-400' : 'text-text-muted'}`}>
                      {rev.isCorrect ? `+${rev.earnedPoints} pts` : '0 pts'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
