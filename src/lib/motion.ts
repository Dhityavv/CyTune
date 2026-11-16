import gsap from 'gsap';

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateStaggerIn(
  targets: gsap.TweenTarget,
  options?: gsap.TweenVars
) {
  if (isReducedMotion()) {
    gsap.set(targets, { opacity: 1, y: 0 });
    return;
  }
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 14, ...options?.from },
    {
      opacity: 1,
      y: 0,
      duration: 0.35,
      stagger: 0.04,
      ease: 'power2.out',
      ...options,
    }
  );
}

export function animatePress(target: gsap.TweenTarget) {
  if (isReducedMotion()) return;
  gsap.timeline()
    .to(target, { scale: 0.95, duration: 0.1, ease: 'power1.out' })
    .to(target, { scale: 1, duration: 0.15, ease: 'back.out(2)' });
}
