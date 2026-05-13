import React, { useState, useCallback, useEffect, useRef } from 'react';
import DepthTransition from './components/DepthTransition';
import Layer0_Chat from './layers/Layer0_Chat';
import Layer1_Attention from './layers/Layer1_Attention';
import Layer2_Dataset from './layers/Layer2_Dataset';
import Layer3_Hardware from './layers/Layer3_Hardware';
import Layer4_Transistor from './layers/Layer4_Transistor';
import Layer5_Physics from './layers/Layer5_Physics';

const LAYERS = [
  Layer0_Chat,
  Layer1_Attention,
  Layer2_Dataset,
  Layer3_Hardware,
  Layer4_Transistor,
  Layer5_Physics,
];

const LAYER_LABELS = ['Chat', 'Attention', 'Data', 'Hardware', 'Gates', 'Physics'];

const navBtnBase = {
  fontFamily: 'monospace',
  fontSize: '9px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  borderRadius: '4px',
  border: '1px solid #333',
  background: '#14181c',
  color: '#888',
  cursor: 'pointer',
  padding: '6px 10px',
  transition: 'color 150ms ease, border-color 150ms ease, background 150ms ease',
};

/** Forward: only next layer or any already-visited layer; backward: any visible index. */
function canNavigateTo(index, currentLayer, maxReached) {
  if (index === currentLayer || index < 0 || index >= LAYERS.length) return false;
  if (index <= maxReached) return true;
  return index === currentLayer + 1;
}

export default function App() {
  const [currentLayer, setCurrentLayer] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [clickPoint, setClickPoint] = useState(null);
  const [targetLayer, setTargetLayer] = useState(null);
  const [userPrompt, setUserPrompt] = useState('');
  /** Deepest layer index the user has ever reached (chips 0..max are shown). */
  const [maxReached, setMaxReached] = useState(0);
  /** Layer index that just became active (deepest step forward) — triggers one pop-in on its chip. */
  const [justEntered, setJustEntered] = useState(null);
  const prevLayerRef = useRef(0);

  useEffect(() => {
    setMaxReached((m) => Math.max(m, currentLayer));
  }, [currentLayer]);

  useEffect(() => {
    if (currentLayer > prevLayerRef.current) {
      setJustEntered(currentLayer);
      const t = window.setTimeout(() => setJustEntered(null), 450);
      prevLayerRef.current = currentLayer;
      return () => window.clearTimeout(t);
    }
    prevLayerRef.current = currentLayer;
    return undefined;
  }, [currentLayer]);

  const startTransitionTo = useCallback((index, e) => {
    if (transitioning || !canNavigateTo(index, currentLayer, maxReached)) return;
    const point = e && 'clientX' in e
      ? { x: e.clientX, y: e.clientY }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setClickPoint(point);
    setTargetLayer(index);
    setTransitioning(true);
  }, [transitioning, currentLayer, maxReached]);

  const handleDrill = useCallback((e) => {
    startTransitionTo(currentLayer + 1, e);
  }, [startTransitionTo, currentLayer, maxReached]);

  const handleTransitionComplete = useCallback(() => {
    setCurrentLayer(targetLayer);
    setTransitioning(false);
    setClickPoint(null);
    setTargetLayer(null);
  }, [targetLayer]);

  const handleReturnToSurface = useCallback(() => {
    startTransitionTo(0);
  }, [startTransitionTo, currentLayer, maxReached]);

  const handleGoBack = useCallback((e) => {
    startTransitionTo(currentLayer - 1, e);
  }, [startTransitionTo, currentLayer, maxReached]);

  const CurrentLayer = LAYERS[currentLayer];

  const layerProps = { onDrill: handleDrill };
  if (currentLayer === 0) layerProps.setUserPrompt = setUserPrompt;
  if (currentLayer === 1) layerProps.userPrompt = userPrompt;
  if (currentLayer === 5) layerProps.onReturnToSurface = handleReturnToSurface;

  const NextLayer = transitioning ? LAYERS[targetLayer] : null;
  const nextLayerProps = {};
  if (targetLayer === 1) nextLayerProps.userPrompt = userPrompt;
  if (targetLayer === 5) nextLayerProps.onReturnToSurface = handleReturnToSurface;
  if (targetLayer === 0) nextLayerProps.setUserPrompt = setUserPrompt;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
        <CurrentLayer {...layerProps} />
      </div>

      {transitioning && (
        <DepthTransition
          fromPoint={clickPoint}
          onComplete={handleTransitionComplete}
        >
          {NextLayer && (
            <div style={{ width: '100%', height: '100%', position: 'fixed', inset: 0, zIndex: 9998 }}>
              <NextLayer {...nextLayerProps} onDrill={handleDrill} />
            </div>
          )}
        </DepthTransition>
      )}

      {maxReached > 0 && (
      <nav
        aria-label="Layer navigation"
        style={{
          position: 'fixed',
          bottom: '12px',
          left: '12px',
          right: '12px',
          zIndex: 1001,
          maxWidth: '760px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 12px',
          background: 'rgba(6, 8, 10, 0.94)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid #1e2620',
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.55)',
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          disabled={transitioning || currentLayer === 0}
          onClick={handleGoBack}
          style={{
            ...navBtnBase,
            opacity: currentLayer === 0 ? 0.4 : 1,
            cursor: transitioning || currentLayer === 0 ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
          title="Previous layer"
        >
          ← Back
        </button>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '6px',
            flex: '1 1 180px',
          }}
        >
          {LAYER_LABELS.map((label, i) => {
            if (i > maxReached) return null;
            const active = i === currentLayer;
            const enter = i === justEntered;
            return (
              <button
                key={label}
                type="button"
                disabled={transitioning || active}
                aria-current={active ? 'page' : undefined}
                title={`Layer ${i} — ${label}`}
                onClick={(e) => startTransitionTo(i, e)}
                className={enter ? 'nav-chip-enter' : undefined}
                style={{
                  ...navBtnBase,
                  borderColor: active ? 'var(--glow-color)' : '#333',
                  color: active ? 'var(--glow-color)' : '#888',
                  background: active ? 'rgba(0, 255, 200, 0.08)' : '#14181c',
                  cursor: transitioning || active ? 'default' : 'pointer',
                  opacity: transitioning && !active ? 0.55 : 1,
                }}
              >
                <span
                  className={active ? 'accent-soft-pulse' : undefined}
                  style={{ color: 'inherit' }}
                >
                  {i} · {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}
