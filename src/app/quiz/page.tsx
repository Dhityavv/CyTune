'use client';

import { useState } from 'react';
import { HelpCircle, Trophy, Flame, CheckCircle2, XCircle, RotateCcw, ArrowRight, Music, Sparkles } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Which iconic artist released the critically acclaimed album 'After Hours' featuring the mega-hit 'Blinding Lights'?",
    options: ["Bruno Mars", "The Weeknd", "Drake", "Post Malone"],
    correctIndex: 1,
    explanation: "The Weeknd released 'After Hours' in March 2020, breaking records with 'Blinding Lights'.",
    category: "Pop & R&B",
  },
  {
    id: 2,
    question: "Who is the Indonesian singer-songwriter behind the poignant hit ballad 'Satu Bulan'?",
    options: ["NIKI", "Bernadya", "Mahalini", "Tiara Andini"],
    correctIndex: 1,
    explanation: "Bernadya captured widespread acclaim across Southeast Asia with her emotive album and the song 'Satu Bulan'.",
    category: "Indonesian Hits",
  },
  {
    id: 3,
    question: "Which pioneering synth-pop band released the influential 1980 track 'Enola Gay'?",
    options: ["Depeche Mode", "Orchestral Manoeuvres in the Dark (OMD)", "New Order", "The Human League"],
    correctIndex: 1,
    explanation: "OMD released 'Enola Gay' on their 1980 album 'Organisation', becoming a classic of electronic synth-pop.",
    category: "Synthwave & Classics",
  },
  {
    id: 4,
    question: "Which multi-Grammy winning artist recorded the viral, nostalgic bedroom-pop hit 'lowkey'?",
    options: ["Beabadoobee", "NIKI", "Clairo", "Olivia Rodrigo"],
    correctIndex: 1,
    explanation: "NIKI released 'lowkey' in 2019 under 88rising, cementing her global breakthrough.",
    category: "Indie Pop",
  },
  {
    id: 5,
    question: "What audio frequency standard is historically known as 'Concert Pitch' for tuning the orchestral note A above middle C?",
    options: ["432 Hz", "440 Hz", "528 Hz", "415 Hz"],
    correctIndex: 1,
    explanation: "A440 (440 Hz) is the standard international tuning frequency adopted worldwide since 1939.",
    category: "Audio Acoustics",
  },
];

export default function MusicQuizPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === q.correctIndex;
    if (isCorrect) {
      const nextScore = score + 100 + streak * 20;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);
      if (nextStreak > bestStreak) setBestStreak(nextStreak);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
  };

  return (
    <div className="space-y-8 pb-24 max-w-3xl mx-auto select-none">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-accent uppercase tracking-[0.16em]">
              OrbitTune Interactive
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Music Quiz
            </h1>
            <p className="text-xs text-text-secondary">
              Test your music knowledge across artists, discography, acoustics, and chart history.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-sidebar border border-border-subtle shadow-sm">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-mono text-xs font-bold text-text-primary">{score} pts</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-sidebar border border-border-subtle shadow-sm">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="font-mono text-xs font-bold text-text-primary">{streak} streak</span>
            </div>
          </div>
        </div>
      </div>

      {!quizFinished ? (
        /* Active Question Card */
        <div className="p-6 sm:p-8 rounded-3xl bg-surface/60 border border-border-subtle shadow-xl space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span className="px-2.5 py-0.5 rounded-full bg-surface border border-border-subtle text-accent font-semibold text-[10px] uppercase">
              {q.category}
            </span>
            <span className="font-mono text-[11px]">
              Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-base sm:text-lg font-bold text-text-primary leading-snug">
            {q.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3">
            {q.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === q.correctIndex;

              let btnStyle = 'bg-surface hover:bg-surface-hover border-border-subtle text-text-primary';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                } else {
                  btnStyle = 'bg-surface/40 border-border-subtle/50 text-text-muted';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-sidebar border border-border-subtle flex items-center justify-center font-mono text-xs text-text-muted shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isAnswered && (
                    <span>
                      {isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isSelected ? (
                        <XCircle className="w-4 h-4 text-red-400" />
                      ) : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-sidebar/80 border border-border-subtle space-y-2 animate-in fade-in duration-200">
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="font-bold text-accent mr-1">Trivia Note:</span>
                {q.explanation}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <span>{currentIdx + 1 < QUIZ_QUESTIONS.length ? 'Next Question' : 'View Results'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Quiz Completed Screen */
        <div className="p-8 sm:p-12 rounded-3xl bg-surface/70 border border-border-subtle shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent mx-auto shadow-xl shadow-[#C9A94D]/20">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-text-primary">Quiz Completed!</h2>
            <p className="text-xs text-text-secondary">
              Outstanding listening prowess! Here is your final score breakdown:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            <div className="p-4 rounded-2xl bg-surface border border-border-subtle">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Final Score
              </span>
              <span className="text-2xl font-bold text-accent font-mono mt-1 block">{score}</span>
            </div>
            <div className="p-4 rounded-2xl bg-surface border border-border-subtle">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                Best Streak
              </span>
              <span className="text-2xl font-bold text-amber-500 font-mono mt-1 block">
                {bestStreak}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={restartQuiz}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
