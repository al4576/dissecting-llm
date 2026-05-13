import React, { useEffect, useState } from 'react';

/**
 * Layer drill transition: dark iris + soft accent (no full-screen white punch).
 * Timings tuned to feel “deep” without a photosensitivity-style flash.
 *
 * prefers-reduced-motion: simple crossfade only (no ring / tunnel motion).
 */

const RING_MAX_SCALE = 20;
const TUNNEL_MAX_SCALE = 34;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function DepthTransition({ fromPoint, onComplete, children }) {
  const reducedMotion = usePrefersReducedMotion();
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [phase, setPhase] = useState('fade-in');
  const [showChildren, setShowChildren] = useState(false);

  const cx = fromPoint?.x ?? window.innerWidth / 2;
  const cy = fromPoint?.y ?? window.innerHeight / 2;

  useEffect(() => {
    if (reducedMotion) {
      const t0 = window.setTimeout(() => setOverlayOpacity(0.9), 20);
      const t1 = setTimeout(() => {
        setShowChildren(true);
        setPhase('fade-out');
        setOverlayOpacity(0);
      }, 280);
      const t2 = setTimeout(() => onComplete(), 620);
      return () => {
        clearTimeout(t0);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    const t0 = requestAnimationFrame(() => setOverlayOpacity(0.88));

    const t1 = setTimeout(() => setPhase('ring-expand'), 200);
    const t2 = setTimeout(() => setPhase('tunnel'), 520);
    const t3 = setTimeout(() => setPhase('solid'), 1000);
    const t4 = setTimeout(() => {
      setShowChildren(true);
      setPhase('fade-out');
      setOverlayOpacity(0);
    }, 1180);
    const t5 = setTimeout(() => onComplete(), 1480);

    return () => {
      cancelAnimationFrame(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete, reducedMotion]);

  if (reducedMotion) {
    const overlayTransition = 'opacity 280ms ease-out';
    return (
      <>
        {showChildren && children}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: '#050708',
            opacity: overlayOpacity,
            transition: overlayTransition,
            pointerEvents: 'none',
          }}
        />
      </>
    );
  }

  const ringSize = 56;

  const ringStyle = {
    position: 'fixed',
    left: cx - ringSize / 2,
    top: cy - ringSize / 2,
    width: ringSize,
    height: ringSize,
    borderRadius: '50%',
    border: '2px solid rgba(0, 255, 204, 0.45)',
    pointerEvents: 'none',
    zIndex: 10001,
    transform:
      phase === 'ring-expand'
        ? `scale(${RING_MAX_SCALE})`
        : phase === 'tunnel' || phase === 'solid' || phase === 'fade-out'
          ? 'scale(0)'
          : 'scale(0)',
    transition:
      phase === 'ring-expand'
        ? 'transform 320ms cubic-bezier(0.4, 0, 0.2, 1)'
        : phase === 'tunnel'
          ? 'transform 260ms cubic-bezier(0.4, 0, 0.2, 1)'
          : 'none',
    opacity: phase === 'solid' || phase === 'fade-out' ? 0 : phase === 'tunnel' ? 0.35 : 0.85,
    boxShadow: '0 0 24px rgba(0, 255, 204, 0.12)',
  };

  const tunnelStyle = {
    position: 'fixed',
    left: cx - 22,
    top: cy - 22,
    width: 44,
    height: 44,
    borderRadius: '50%',
    /* Dark iris with soft accent — avoids full-screen #fff flash */
    background:
      'radial-gradient(circle at 45% 42%, rgba(0, 255, 204, 0.14) 0%, rgba(12, 22, 24, 0.88) 38%, rgba(4, 8, 10, 0.96) 72%, #020405 100%)',
    pointerEvents: 'none',
    zIndex: 10002,
    transform: phase === 'tunnel' ? `scale(${TUNNEL_MAX_SCALE})` : 'scale(0)',
    opacity: phase === 'tunnel' ? 0.48 : 0,
    transition:
      phase === 'tunnel'
        ? 'transform 420ms cubic-bezier(0.33, 0.02, 0.2, 1), opacity 200ms ease-out'
        : 'opacity 140ms ease-out',
  };

  const overlayTransition =
    phase === 'fade-in'
      ? 'opacity 220ms ease-out'
      : phase === 'fade-out'
        ? 'opacity 320ms ease-out'
        : 'none';

  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: '#020305',
    opacity: overlayOpacity,
    transition: overlayTransition,
    pointerEvents: 'none',
  };

  return (
    <>
      {showChildren && children}
      <div style={overlayStyle} />
      <div style={ringStyle} />
      <div style={tunnelStyle} />
    </>
  );
}
