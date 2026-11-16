'use client';

import { useCallback, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

/**
 * DeltaY per wheel notch. A real notch reports 100 in Chrome, and the
 * remainder of partial deltas (trackpads) is carried to the next event.
 */
const WHEEL_STEP_THRESHOLD = 100;
const VOLUME_STEP = 0.02;

/**
 * Mouse-wheel volume control for the player volume sliders.
 *
 * React attaches `wheel` listeners at the root as passive, so
 * `preventDefault()` inside an `onWheel` prop does nothing and the page
 * scrolls too. This binds a native non-passive listener on the element so
 * the wheel is consumed only while the pointer is over the slider.
 *
 * Wheel deltas are accumulated before stepping: one physical notch, or a
 * trackpad gesture, must not jump the volume by more than one step.
 *
 * Returns a callback ref: the slider may mount after the player component
 * (the expanded player only renders when open).
 */
export function useVolumeWheel<T extends HTMLElement = HTMLDivElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((el: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (!el) return;

    let accumulated = 0;

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      event.preventDefault();

      // deltaMode 1 counts lines instead of pixels (Firefox).
      if (accumulated !== 0 && Math.sign(event.deltaY) !== Math.sign(accumulated)) {
        accumulated = 0;
      }
      accumulated += event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY;
      // Bias by half a pixel so a notch that sums to 99.98 still counts.
      const steps = Math.trunc((accumulated + Math.sign(accumulated) * 0.5) / WHEEL_STEP_THRESHOLD);
      if (steps === 0) return;
      accumulated -= steps * WHEEL_STEP_THRESHOLD;

      const { volume, isMuted, setVolume } = usePlayerStore.getState();
      const current = isMuted ? 0 : volume;
      // Scrolling up (negative deltaY) must raise the volume.
      const next = current - steps * VOLUME_STEP;
      setVolume(Math.max(0, Math.min(1, next)));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    cleanupRef.current = () => el.removeEventListener('wheel', handleWheel);
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return ref;
}
