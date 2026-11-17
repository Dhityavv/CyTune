'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import gsap from 'gsap';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register' | 'forgot-password';
}

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
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

  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordResetEmail,
    verifyResetOtpAndSetPassword,
    isConfigured,
  } = useAuthStore();

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

  if (!isOpen || !mounted) return null;

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
          setSuccess('Reset code sent! Check your email inbox and spam folder.');
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

  const handleGoogleSignIn = async () => {
    setError('');
    const res = await signInWithGoogle();
    if (res.error) {
      setError(res.error);
    }
  };

  const modalNode = (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[9999] p-4 bg-black/80 backdrop-blur-md flex items-center justify-center overflow-y-auto"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
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
              <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'register' && 'Create Account'}
                {mode === 'forgot-password' && 'Reset Password'}
                {mode === 'reset-password' && 'Enter Verification Code'}
              </h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {mode === 'login' && 'Sign in to access your library, rooms & custom profile'}
                {mode === 'register' && 'Join OrbitTune for sync rooms & Hi-Fi streaming'}
                {mode === 'forgot-password' && 'We will send a password reset code to your email'}
                {mode === 'reset-password' && 'Enter the OTP code received via email & new password'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-subtle transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 sm:p-6 pt-4 overflow-y-auto space-y-4">
          {/* Google OAuth (only for login & register) */}
          {(mode === 'login' || mode === 'register') && isConfigured && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-primary text-xs font-semibold flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span>Continue with Google</span>
              </button>

              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border-subtle" />
                </div>
                <span className="relative bg-sidebar px-3 text-[10px] text-text-muted uppercase tracking-wider">
                  or with email
                </span>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-medium text-text-secondary mb-1">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
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
                  placeholder="you@example.com"
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
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}

            {mode === 'reset-password' && (
              <>
                <div>
                  <label className="block text-[11px] font-medium text-text-secondary mb-1">
                    Kode Verifikasi OTP (dari Email)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={12}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs font-mono tracking-widest focus:outline-none focus:border-accent"
                    />
                  </div>
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
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </>
            )}

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
              className="w-full py-3 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all disabled:opacity-50 mt-2 active:scale-95 cursor-pointer"
            >
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In'
                : mode === 'register'
                ? 'Create Account'
                : mode === 'forgot-password'
                ? 'Kirim Kode Reset Password'
                : 'Simpan Password Baru'}
            </button>
          </form>

          {/* Secure badge */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-text-muted pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent/80" />
            <span>Encrypted authentication • Supabase Auth</span>
          </div>
        </div>

        {/* Pinned Footer */}
        <div className="p-4 border-t border-border-subtle text-center text-xs text-text-secondary shrink-0 bg-sidebar/95">
          {mode === 'login' && (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                  setSuccess('');
                }}
                className="text-accent hover:underline font-semibold cursor-pointer"
              >
                Sign up
              </button>
            </p>
          )}

          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="text-accent hover:underline font-semibold cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}

          {(mode === 'forgot-password' || mode === 'reset-password') && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccess('');
              }}
              className="text-accent hover:underline font-semibold cursor-pointer"
            >
              Kembali ke Login
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
