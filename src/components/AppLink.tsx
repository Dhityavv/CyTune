'use client';

import { forwardRef, HTMLAttributes, KeyboardEvent, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

export interface AppLinkProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'onClick'> {
  href: string;
  onClick?: (event: MouseEvent<HTMLSpanElement>) => void;
}

const AppLink = forwardRef<HTMLSpanElement, AppLinkProps>(function AppLink(
  { href, className = '', onClick, onKeyDown, ...props },
  ref
) {
  const router = useRouter();

  const navigate = (newTab: boolean) => {
    if (newTab) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
  };

  const handleClick = (event: MouseEvent<HTMLSpanElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    navigate(event.metaKey || event.ctrlKey);
  };

  const handleAuxClick = (event: MouseEvent<HTMLSpanElement>) => {
    if (event.button === 1) navigate(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || (event.key !== 'Enter' && event.key !== ' ')) return;

    event.preventDefault();
    navigate(event.metaKey || event.ctrlKey);
  };

  return (
    <span
      ref={ref}
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      onKeyDown={handleKeyDown}
      className={`cursor-pointer ${className}`}
      {...props}
    />
  );
});

export default AppLink;
