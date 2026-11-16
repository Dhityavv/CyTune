import type { KeyboardEvent } from 'react';

/**
 * Keyboard props for elements that are clickable but not real buttons
 * (cards, rows, lyric lines). The handler only fires when the element
 * itself is focused, so nested buttons keep their own Enter/Space.
 */
export function clickable(onActivate: () => void) {
  return {
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.target !== e.currentTarget) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate();
      }
    },
  };
}
