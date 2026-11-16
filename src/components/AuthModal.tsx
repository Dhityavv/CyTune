'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, signInAsGuest, isConfigured } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess('Signed in successfully!');
          setTimeout(onClose, 800);
        }
      } else {
        const res = await signUpWithEmail(email, password, displayName);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess('Account created successfully!');
          setTimeout(onClose, 1000);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    const res = provider === 'google' ? await signInWithGoogle() : await signInWithGithub();
    if (res.error) {
      setError(res.error);
    }
  };

  const handleQuickGuest = () => {
    signInAsGuest();
    setSuccess('Logged in as Guest!');
    setTimeout(onClose, 600);
  };

  return (
    <div
      className="fixed inset-0 z-[90] overflow-y-auto p-4 sm:p-6 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-up"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md my-auto max-h-[88vh] flex flex-col rounded-2xl bg-sidebar border border-border-subtle shadow-2xl overflow-hidden"
      >
        {/* Pinned Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-border-subtle shrink-0 bg-sidebar/95">
          <div>
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {mode === 'login'
                ? 'Sign in to sync your comments and playlists'
                : 'Join OrbitTune to share comments & join listening rooms'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 pt-4 overflow-y-auto space-y-4">
          {/* Quick One-Click Free Sign-In Option */}
          <button
            type="button"
            onClick={handleQuickGuest}
            className="w-full py-2.5 px-4 rounded-xl bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>Continue as Instant Guest Listener (1-Click)</span>
          </button>

          {/* OAuth Buttons (If configured) */}
          {isConfigured && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary text-xs font-semibold flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.41 7.35 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.59 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('github')}
                className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary text-xs font-semibold flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                Continue with GitHub
              </button>
            </div>
          )}

          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border-subtle" />
            </div>
            <span className="relative bg-sidebar px-3 text-[10px] text-text-muted uppercase tracking-wider">
              or continue with email
            </span>
          </div>

          {/* Email Form (Works instantly with zero configuration!) */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">Display Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-text-secondary mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}

            {success && (
              <p role="status" className="text-xs text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{success}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all disabled:opacity-50 mt-2"
            >
              {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Zero-Friction Secure Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent/80" />
            <span>Local & encrypted auth active • No setup required</span>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="p-4 border-t border-border-subtle text-center text-xs text-text-secondary shrink-0 bg-sidebar/95">
          {mode === 'login' ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className="text-accent hover:underline font-semibold"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="text-accent hover:underline font-semibold"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
