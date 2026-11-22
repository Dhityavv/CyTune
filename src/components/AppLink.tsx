'use client';

import React, { forwardRef } from 'react';
import { useRouter } from 'next/navigation';

export interface AppLinkProps extends React.HTMLAttributes<HTMLDivElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  'aria-label'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
}

/**
 * AppLink: Clean SPA navigation component.
 * Prevents native browser URL preview overlays in the bottom corner
 * while maintaining 100% full keyboard accessibility and screen-reader semantics.
 */
const AppLink = forwardRef<HTMLDivElement, AppLinkProps>(function AppLink(
  { href, children, className = '', onClick, ...props },
  ref
) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(href, '_blank');
      return;
    }
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
      router.push(href);
    }
  };

  return (
    <div
      ref={ref}
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

export default AppLink;
