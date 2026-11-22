'use client';

import { useAuthModalStore } from '@/store/useAuthModalStore';
import AuthModal from '@/components/AuthModal';

export default function GlobalAuthModal() {
  const { isOpen, message, defaultMode, close } = useAuthModalStore();

  return (
    <AuthModal
      isOpen={isOpen}
      onClose={close}
      defaultMode={defaultMode}
      message={message || undefined}
    />
  );
}
