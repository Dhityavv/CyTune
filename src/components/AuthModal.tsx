'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useClerk } from '@clerk/nextjs';
import gsap from 'gsap';
import { useModalFocus } from '@/hooks/useModalFocus';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot-password';
  message?: string;
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
  message,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const {
    signInWithEmail,
    signUpWithEmail,
    sendPasswordResetEmail,
    verifyResetOtpAndSetPassword,
  } = useAuthStore();

  const { openSignIn } = useClerk();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
      setError('');
      setSuccess('');
    }
  }, [isOpen, defaultMode]);

  // GSAP animation on open
  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: 'power2.out' }
      );
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.92, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  useModalFocus(isOpen && mounted, modalRef, handleClose, closeButtonRef);

  if (!isOpen || !mounted) return null;

  const handleOAuthSignIn = (strategy?: string) => {
    handleClose();
    try {
      openSignIn({
        fallbackRedirectUrl: '/',
        signUpFallbackRedirectUrl: '/',
      });
    } catch {
      router.push('/sign-in');
    }
  };

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
          setTimeout(handleClose, 800);
        }
      } else if (mode === 'register') {
        const res = await signUpWithEmail(email, password, displayName);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess('Account created successfully!');
          setTimeout(handleClose, 1000);
        }
      } else if (mode === 'forgot-password') {
        const res = await sendPasswordResetEmail(email);
        if (!res.success) {
          setError(res.error || 'Failed to send reset code');
        } else {
          setSuccess('Reset code sent! Check your email inbox.');
          setTimeout(() => {
            setMode('reset-password');
            setSuccess('');
          }, 1500);
        }
      } else if (mode === 'reset-password') {
        if (!otpCode.trim() || !newPassword) {
          setError('Please provide both verification code and new password.');
          return;
        }
        const res = await verifyResetOtpAndSetPassword(email, otpCode, newPassword);
        if (!res.success) {
          setError(res.error || 'Invalid or expired verification code');
        } else {
          setSuccess('Password updated successfully! You can now sign in.');
          setTimeout(() => {
            setMode('login');
            setPassword('');
            setSuccess('');
          }, 1800);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] p-4 bg-black/80 backdrop-blur-md flex items-center justify-center overflow-y-auto"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md my-auto max-h-[92vh] flex flex-col rounded-3xl bg-sidebar border border-border-subtle shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80" />

        {/* Pinned Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-border-subtle shrink-0 bg-sidebar/95">
          <div className="flex items-center gap-3">
            {mode !== 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                aria-label="Back to sign in"
                className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 id="auth-modal-title" className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                {mode === 'login' && 'Welcome to CyTune'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot-password' && 'Reset Password'}
                {mode === 'reset-password' && 'Enter Verification Code'}
              </h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {mode === 'login' && 'Sign in to access your library, rooms, minigames & custom cosmetics'}
                {mode === 'register' && 'Join CyTune for sync rooms & Hi-Fi streaming'}
                {mode === 'forgot-password' && 'We will send a password reset code to your email'}
                {mode === 'reset-password' && 'Enter the OTP code received via email & new password'}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Guest Lock Message Banner if provided */}
        {message && (
          <div className="px-5 sm:px-6 pt-3 pb-1">
            <div className="p-3 rounded-2xl bg-accent/10 border border-accent/30 text-accent text-xs flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 pt-4 overflow-y-auto space-y-4">
          {/* Clerk Social Logins (Google, GitHub, Discord) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-text-muted">Masuk Cepat via Akun Resmi:</p>
              <div className="grid grid-cols-3 gap-2">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('oauth_google')}
                  className="py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm hover:border-accent/40"
                  aria-label="Sign in with Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.41 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.59 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                    />
                  </svg>
                  <span className="truncate">Google</span>
                </button>

                {/* GitHub Button */}
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('oauth_github')}
                  className="py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm hover:border-accent/40"
                  aria-label="Sign in with GitHub"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="truncate">GitHub</span>
                </button>

                {/* Discord Button */}
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('oauth_discord')}
                  className="py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm hover:border-accent/40"
                  aria-label="Sign in with Discord"
                >
                  <svg className="w-4 h-4 shrink-0 fill-[#5865F2]" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  <span className="truncate">Discord</span>
                </button>
              </div>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border-subtle" />
                </div>
                <span className="relative bg-sidebar px-3 text-[10px] text-text-muted uppercase tracking-wider">
                  atau gunakan email
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Nama Tampilan
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
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
                  placeholder="anda@email.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            {(mode === 'login' || mode === 'register') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-text-secondary">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setError('');
                        setSuccess('');
                      }}
                      className="text-[10px] text-accent hover:underline font-medium cursor-pointer"
                    >
                      Lupa password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            {mode === 'reset-password' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Kode OTP Verifikasi
                  </label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Masukkan 6 digit kode"
                    className="w-full px-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent font-mono tracking-widest text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-green-400" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                'Memproses...'
              ) : (
                <>
                  {mode === 'login' && 'Masuk Akun'}
                  {mode === 'register' && 'Daftar Akun'}
                  {mode === 'forgot-password' && 'Kirim Kode Reset'}
                  {mode === 'reset-password' && 'Simpan Password Baru'}
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-[11px] text-text-muted">
            {mode === 'login' ? (
              <p>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-accent hover:underline font-semibold cursor-pointer"
                >
                  Daftar sekarang
                </button>
              </p>
            ) : mode === 'register' ? (
              <p>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-accent hover:underline font-semibold cursor-pointer"
                >
                  Masuk di sini
                </button>
              </p>
            ) : null}
          </div>

          <div className="pt-2 border-t border-border-subtle flex items-center justify-center gap-1.5 text-[10px] text-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>Clerk OAuth & Enkripsi Brankas Kriptografi Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
