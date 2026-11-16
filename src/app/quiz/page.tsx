'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LegacyQuizRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/games/trivia');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-[#BBF41D]/20 border border-[#BBF41D]/40 flex items-center justify-center text-[#BBF41D] animate-pulse">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-text-primary">Music Quiz is now Music Trivia</h2>
        <p className="text-xs text-text-muted">Redirecting you to the updated interactive hub...</p>
      </div>
      <Link
        href="/games/trivia"
        className="px-4 py-2 rounded-xl bg-accent text-[#101114] text-xs font-bold flex items-center gap-2"
      >
        <span>Open Music Trivia</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
