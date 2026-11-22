'use client';

import { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import {
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  Award,
  Check,
  AlertTriangle,
  Zap,
  HelpCircle,
  X
} from 'lucide-react';
import { TRIVIA_QUESTION_BANK, TriviaQuestion } from '@/lib/triviaBank';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface ShuffledQuestion extends TriviaQuestion {
  shuffledOptions: string[];
  shuffledCorrectIndex: number;
}

interface QuestionReview {
  q: ShuffledQuestion;
  userChoice: number;
  isCorrect: boolean;
  pointsEarned: number;
}

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    tag: string;
    ptsPerCorrect: number;
    maxBase: number;
    color: string;
    borderHighlight: string;
    desc: string;
    topics: string[];
  }
> = {
  Easy: {
    label: 'Easy',
    tag: 'Familiar & Relaxed',
    ptsPerCorrect: 50,
    maxBase: 500,
    color: 'text-amber-400',
    borderHighlight: 'hover:border-amber-400/60 focus:border-amber-400',
    desc: 'Ideal for casual listeners. Questions spotlight globally recognized pop hits, world-famous artists, and foundational music facts.',
    topics: ['Global Pop Hits', 'Famous Bands', 'Basic Instruments', 'Recognizable Chart Records'],
  },
  Medium: {
    label: 'Medium',
    tag: 'Balanced Melophile',
    ptsPerCorrect: 100,
    maxBase: 1000,
    color: 'text-accent',
    borderHighlight: 'hover:border-accent/60 focus:border-accent',
    desc: 'A balanced challenge for passionate music fans. Tests album discographies, genre evolution, and identifiable music theory.',
    topics: ['Album Discography', 'Synthesizers & Drum Machines', 'Music History Milestones', 'Key Signatures & Scales'],
  },
  Hard: {
    label: 'Hard',
    tag: 'Acoustic Virtuoso',
    ptsPerCorrect: 150,
    maxBase: 1500,
    color: 'text-[#BBF41D]',
    borderHighlight: 'hover:border-[#BBF41D]/60 focus:border-[#BBF41D]',
    desc: 'For true audiophiles, musicologists, and studio nerds. Covers microtonal systems, modal theory, studio hardware, acoustics, and composition.',
    topics: ['Church Modes & Polymeter', 'Studio Compressors & Mics', 'Acoustic RT60 & Psychoacoustics', 'Complex Chord Substitutions'],
  },
};

export default function MusicTriviaPage() {
  const [gameState, setGameState] = useState<'prep' | 'playing' | 'completed'>('prep');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Medium');
  const [lockedDifficulty, setLockedDifficulty] = useState<Difficulty>('Medium');
  const { user, addCoins } = useAuthStore();

  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [reviews, setReviews] = useState<QuestionReview[]>([]);
  const [personalBest, setPersonalBest] = useState(0);

  // Leave confirmation modal state
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Load personal best per user
  useEffect(() => {
    try {
      const userKey = user?.id || 'guest';
      const saved =
        localStorage.getItem(`cytune-trivia-best-${userKey}`) ||
        localStorage.getItem(`orbittune-trivia-best-${userKey}`);
      if (saved) setPersonalBest(parseInt(saved, 10));
    } catch {
      // ignore
    }
  }, [user]);

  // Shuffle options for a question while mapping the correct index
  const prepareQuestion = (raw: TriviaQuestion): ShuffledQuestion => {
    const originalCorrectOption = raw.options[raw.correctIndex];
    // Copy and shuffle options
    const shuffled = [...raw.options].sort(() => 0.5 - Math.random());
    const newCorrectIndex = shuffled.indexOf(originalCorrectOption);

    return {
      ...raw,
      shuffledOptions: shuffled,
      shuffledCorrectIndex: newCorrectIndex,
    };
  };

  // Start 10-question session with repeat prevention
  const handleStartSession = () => {
    setLockedDifficulty(selectedDifficulty);

    // Retrieve seen questions for this difficulty scoped by user
    let seenIds: string[] = [];
    const userKey = user?.id || 'guest';
    try {
      const stored = localStorage.getItem(`cytune-trivia-seen-${userKey}-${selectedDifficulty}`);
      if (stored) seenIds = JSON.parse(stored);
    } catch {
      seenIds = [];
    }

    // Filter candidate pool by chosen difficulty
    const difficultyPool = TRIVIA_QUESTION_BANK.filter(
      (q) => q.difficulty === selectedDifficulty
    );

    let candidates = difficultyPool.filter((q) => !seenIds.includes(q.id));
    if (candidates.length < 10) {
      // Pool cycled, reset seen
      candidates = [...difficultyPool];
      seenIds = [];
    }

    // Pick 10 random questions
    const shuffled = [...candidates].sort(() => 0.5 - Math.random());
    const picked10 = shuffled.slice(0, 10).map(prepareQuestion);

    // Update seen history
    try {
      const updatedSeen = [...seenIds, ...picked10.map((q) => q.id)].slice(-80);
      localStorage.setItem(
        `cytune-trivia-seen-${userKey}-${selectedDifficulty}`,
        JSON.stringify(updatedSeen)
      );
    } catch {
      // ignore
    }

    setQuestions(picked10);
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setReviews([]);
    setGameState('playing');
  };

  const currentQ = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !currentQ) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.shuffledCorrectIndex;
    const config = DIFFICULTY_CONFIG[lockedDifficulty];

    let points = 0;
    if (isCorrect) {
      const bonus = streak * 15;
      points = config.ptsPerCorrect + bonus;
      const nextScore = score + points;
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
        q: currentQ,
        userChoice: idx,
        isCorrect,
        pointsEarned: points,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < 10) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Complete game
      setGameState('completed');
      if (score > 0) {
        addCoins(score, 'Trivia Reward');
      }
      if (score > personalBest) {
        setPersonalBest(score);
        try {
          const userKey = user?.id || 'guest';
          localStorage.setItem(`cytune-trivia-best-${userKey}`, String(score));
        } catch {
          // ignore
        }
      }
    }
  };

  const confirmExitToPrep = () => {
    setShowExitConfirm(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setGameState('prep');
  };

  const getRankBadge = (finalScore: number, diff: Difficulty) => {
    if (diff === 'Hard') {
      if (finalScore >= 1200) return { title: 'Master of Acoustic Science', color: 'text-[#BBF41D]' };
      if (finalScore >= 800) return { title: 'Audio Architect', color: 'text-accent' };
      return { title: 'Sonic Scholar', color: 'text-amber-400' };
    }
    if (diff === 'Medium') {
      if (finalScore >= 900) return { title: 'Melophile Savant', color: 'text-accent' };
      if (finalScore >= 600) return { title: 'Music Aficionado', color: 'text-[#BBF41D]' };
      return { title: 'Curious Listener', color: 'text-text-secondary' };
    }
    // Easy
    if (finalScore >= 450) return { title: 'Pop Culture Virtuoso', color: 'text-accent' };
    if (finalScore >= 300) return { title: 'Hit-Maker Prodigy', color: 'text-amber-400' };
    return { title: 'Novice Listener', color: 'text-text-secondary' };
  };

  if (!user) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-6 select-none">
        <div className="w-16 h-16 rounded-3xl bg-[#BBF41D]/15 border border-[#BBF41D]/30 text-[#BBF41D] flex items-center justify-center mx-auto shadow-xl shadow-[#BBF41D]/20">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#BBF41D] font-mono">
            Akses Terbatas: Mode Tamu
          </span>
          <h1 className="text-2xl font-bold text-text-primary">Music Trivia</h1>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm mx-auto">
            Mode Tamu hanya untuk mendengarkan lagu. Silakan masuk untuk menguji wawasan musik Anda, meraih rekor skor tertinggi, dan menghasilkan Orbit Coins.
          </p>
        </div>
        <button
          type="button"
          onClick={() => useAuthModalStore.getState().open('Masuk untuk bermain Music Trivia dan kumpulkan Orbit Coins!')}
          className="px-6 py-3 rounded-full bg-[#BBF41D] text-[#101114] hover:bg-[#a6db18] font-bold text-xs shadow-lg shadow-[#BBF41D]/25 transition-all cursor-pointer"
        >
          Masuk Akun Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-28 max-w-4xl mx-auto select-none">
      {/* Leave Session Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-surface/95 border border-border-subtle p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-text-primary">Leave Active Trivia?</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your current session progress, score ({score} pts), and streak will be discarded.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary font-semibold text-xs"
              >
                Resume Trivia
              </button>
              <button
                type="button"
                onClick={confirmExitToPrep}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
              >
                Abandon & Change Difficulty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: PREPARATION & DIFFICULTY SELECTION */}
      {gameState === 'prep' && (
        <div className="space-y-8 animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between">
            <AppLink
              href="/games"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-surface/60"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Mini Games Hub</span>
            </AppLink>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border-subtle text-xs font-mono font-bold text-accent">
              <Trophy className="w-3.5 h-3.5" />
              <span>Personal Best: {personalBest} pts</span>
            </div>
          </div>

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
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-accent/15 text-accent border border-accent/25 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5" />
                  Trivia Mission Briefing
                </span>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BBF41D]/15 text-[#BBF41D] border border-[#BBF41D]/30 font-mono">
                  300 Verified Questions
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
                Music Trivia Challenge
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                Select your knowledge tier before beginning. Difficulty is strictly locked for the entire 10-question session to guarantee accurate scoring and fair leaderboards.
              </p>
            </div>
          </div>

          {/* 3 Prominent Difficulty Selection Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-text-primary px-1">Choose Challenge Difficulty:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(['Easy', 'Medium', 'Hard'] as const).map((diff) => {
                const conf = DIFFICULTY_CONFIG[diff];
                const isSelected = selectedDifficulty === diff;

                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`relative rounded-3xl p-6 text-left transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                      isSelected
                        ? 'bg-surface/95 border-2 border-accent shadow-accent/20 scale-[1.02]'
                        : 'bg-surface/60 border border-border-subtle hover:border-accent/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase font-mono border ${
                            isSelected
                              ? 'bg-accent text-[#101114] border-accent shadow-sm'
                              : 'bg-sidebar border-border-subtle text-text-muted'
                          }`}
                        >
                          {conf.label}
                        </span>

                        <div className="text-right">
                          <span className={`text-xs font-mono font-bold block ${conf.color}`}>
                            +{conf.ptsPerCorrect} pts/Q
                          </span>
                          <span className="text-[10px] text-text-muted font-mono block">
                            Max {conf.maxBase} pts
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-accent font-mono block">
                          {conf.tag}
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {conf.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border-subtle/60 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block">
                          Topics Covered:
                        </span>
                        <ul className="text-[11px] text-text-muted space-y-0.5">
                          {conf.topics.map((top, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-accent/60" />
                              <span>{top}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-5 flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">
                        {isSelected ? '✓ Selected Tier' : 'Select Tier'}
                      </span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Challenge Action */}
          <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-text-primary block">
                Session Parameters: 10 Questions • {DIFFICULTY_CONFIG[selectedDifficulty].label} Tier
              </span>
              <span className="text-[11px] text-text-muted block">
                Once started, difficulty cannot be altered without discarding active progress.
              </span>
            </div>

            <button
              type="button"
              onClick={handleStartSession}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-[#101114] font-bold text-xs flex items-center justify-center gap-2 shadow-xl shadow-[#C9A94D]/30 transition-all active:scale-95 group"
            >
              <span>Start 10-Question Trivia</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: ACTIVE QUESTION GAMEPLAY */}
      {gameState === 'playing' && currentQ && (
        <div className="space-y-6 animate-fade-up">
          {/* Header Bar with LOCKED Difficulty Label */}
          <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-5 sm:p-7 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {/* STATIC LOCKED DIFFICULTY BADGE — NO SWITCHER DURING GAMEPLAY */}
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider font-mono border ${
                      lockedDifficulty === 'Hard'
                        ? 'bg-[#BBF41D]/15 text-[#BBF41D] border-[#BBF41D]/30'
                        : lockedDifficulty === 'Medium'
                        ? 'bg-accent/15 text-accent border-accent/30'
                        : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                    }`}
                  >
                    🔒 {DIFFICULTY_CONFIG[lockedDifficulty].label} Mode (+{DIFFICULTY_CONFIG[lockedDifficulty].ptsPerCorrect} pts/Q)
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowExitConfirm(true)}
                    className="text-[11px] text-text-muted hover:text-red-400 underline font-semibold transition-colors ml-2"
                  >
                    Change Tier
                  </button>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                  Question {currentIdx + 1} of 10
                </h1>
              </div>

              {/* Score / Streak */}
              <div className="flex items-center gap-2.5">
                <div className="px-3.5 py-1.5 rounded-2xl bg-sidebar/90 border border-border-subtle flex items-center gap-1.5 shadow-sm">
                  <Trophy className="w-3.5 h-3.5 text-accent" />
                  <span className="font-mono text-xs font-bold text-text-primary">{score} pts</span>
                </div>
                {streak > 1 && (
                  <div className="px-3.5 py-1.5 rounded-2xl bg-sidebar/90 border border-[#BBF41D]/40 flex items-center gap-1.5 shadow-sm">
                    <Flame className="w-3.5 h-3.5 text-[#BBF41D]" />
                    <span className="font-mono text-xs font-bold text-[#BBF41D]">{streak}x</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-sidebar rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-accent to-[#BBF41D] transition-all duration-300 rounded-full"
                style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-surface/70 border border-border-subtle shadow-2xl space-y-6">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="px-3 py-1 rounded-full bg-sidebar border border-border-subtle text-accent font-semibold text-[10px] uppercase tracking-wider font-mono">
                Category: {currentQ.category}
              </span>
              <span className="font-mono text-[11px] text-text-muted">
                {currentIdx + 1} / 10
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-text-primary leading-snug">
              {currentQ.question}
            </h2>

            {/* 4 Shuffled Choices */}
            <div className="space-y-3">
              {currentQ.shuffledOptions.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentQ.shuffledCorrectIndex;

                let btnStyle =
                  'bg-surface hover:bg-surface-hover border-border-subtle text-text-primary hover:border-accent/40';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500';
                  } else if (isSelected) {
                    btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                  } else {
                    btnStyle = 'bg-surface/40 border-border-subtle/40 text-text-muted opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between active:scale-[0.99] ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-sidebar border border-border-subtle flex items-center justify-center font-mono text-xs text-text-muted shrink-0 font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed">{option}</span>
                    </div>

                    {isAnswered && (
                      <span className="shrink-0 ml-2">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-red-400" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Card */}
            {isAnswered && (
              <div className="p-4 sm:p-5 rounded-2xl bg-sidebar/90 border border-border-subtle space-y-3 animate-fade-up">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider block font-mono">
                      Factual Insight
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 group"
                  >
                    <span>
                      {currentIdx + 1 < 10 ? 'Next Question' : 'Complete Challenge'}
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE 3: COMPLETED RESULTS & ROUND BREAKDOWN */}
      {gameState === 'completed' && (
        <div className="space-y-8 animate-fade-up">
          <div className="p-8 sm:p-12 rounded-3xl bg-surface/70 border border-border-subtle shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto shadow-xl shadow-[#C9A94D]/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className={`text-xs font-bold uppercase tracking-wider font-mono ${getRankBadge(score, lockedDifficulty).color}`}>
                Rank: {getRankBadge(score, lockedDifficulty).title}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary">
                Trivia Challenge Complete!
              </h2>
              <p className="text-xs text-text-secondary">
                You tackled 10 questions on <span className="text-accent font-bold">{lockedDifficulty}</span> difficulty.
              </p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className="p-4 rounded-2xl bg-sidebar/80 border border-border-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-mono">
                  Final Score
                </span>
                <span className="text-2xl font-bold text-accent font-mono mt-1 block">{score}</span>
              </div>
              <div className="p-4 rounded-2xl bg-sidebar/80 border border-border-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-mono">
                  Accuracy
                </span>
                <span className="text-2xl font-bold text-emerald-400 font-mono mt-1 block">
                  {reviews.filter((r) => r.isCorrect).length}/10
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-sidebar/80 border border-border-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block font-mono">
                  Best Streak
                </span>
                <span className="text-2xl font-bold text-[#BBF41D] font-mono mt-1 block">
                  {bestStreak}x
                </span>
              </div>
            </div>

            {/* Orbit Coins Reward Banner */}
            {score > 0 && (
              <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center gap-2.5 text-accent font-bold text-xs font-mono max-w-lg mx-auto shadow-sm">
                <span className="text-base">🪙</span>
                <span>+{score} Orbit Coins berhasil ditambahkan ke saldo akunmu!</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setGameState('prep')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again (Choose Tier)</span>
              </button>
              <AppLink
                href="/games"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-surface border border-border-subtle hover:border-accent/40 text-text-primary font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <span>Back to Games Hub</span>
              </AppLink>
            </div>
          </div>

          {/* Full 10-Question Review */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Award className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-bold text-text-primary">10-Question Review & Explanations</h3>
            </div>

            <div className="space-y-3">
              {reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    rev.isCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/30'
                      : 'bg-red-500/5 border-red-500/30'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-text-muted">
                        Q{idx + 1} · {rev.q.category}
                      </span>
                      {rev.isCorrect ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1 font-mono">
                          <Check className="w-2.5 h-2.5" /> Correct (+{rev.pointsEarned})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 font-mono">
                          Incorrect
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-text-primary">{rev.q.question}</p>
                    <p className="text-xs text-text-secondary leading-relaxed pt-1">
                      <span className="font-bold text-accent">Correct: </span>
                      {rev.q.shuffledOptions[rev.q.shuffledCorrectIndex]}
                      {!rev.isCorrect && (
                        <span className="text-red-400/90 ml-2">
                          (You picked: {rev.q.shuffledOptions[rev.userChoice]})
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-text-muted italic pt-0.5">
                      {rev.q.explanation}
                    </p>
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
