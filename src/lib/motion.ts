import gsap from 'gsap';

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 1. Stagger In entrance (GSAP Demo style)
 */
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
    { opacity: 0, y: 16, scale: 0.98, ...options?.from },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.45,
      stagger: 0.05,
      ease: 'power3.out',
      ...options,
    }
  );
}

/**
 * 2. Magnetic Button effect (GSAP UI component showcase)
 * Pulls the button subtly towards cursor coordinates
 */
export function initMagneticEffect(element: HTMLElement, strength = 0.3) {
  if (isReducedMotion()) return () => {};

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);

    gsap.to(element, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}

/**
 * 3. 3D Tilt Card hover effect (GSAP UI cards)
 */
export function initTiltEffect(element: HTMLElement, maxTilt = 8) {
  if (isReducedMotion()) return () => {};

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(element, {
      rotateY: x * maxTilt,
      rotateX: -y * maxTilt,
      transformPerspective: 1000,
      scale: 1.02,
      duration: 0.35,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}

/**
 * 4. Micro-interaction Button Elastic Bounce
 */
export function animatePress(target: gsap.TweenTarget) {
  if (isReducedMotion()) return;
  gsap.timeline()
    .to(target, { scale: 0.92, duration: 0.1, ease: 'power2.out' })
    .to(target, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
}
