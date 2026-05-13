import React, { useState, useRef, useEffect } from 'react';

const SHARD_DIRECTIONS = [
  { tx: -40, ty: -30, rot: -8 },
  { tx: 40, ty: -20, rot: 6 },
  { tx: -60, ty: 10, rot: 12 },
  { tx: 60, ty: 20, rot: -10 },
  { tx: -20, ty: 50, rot: -15 },
  { tx: 30, ty: 60, rot: 9 },
  { tx: -50, ty: -60, rot: 14 },
  { tx: 50, ty: -50, rot: -7 },
  { tx: 0, ty: 80, rot: 4 },
  { tx: -80, ty: 40, rot: -18 },
];

const sans = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function getClipPath(i, total) {
  const rows = 4;
  const cols = 3;
  const r = Math.floor(i / cols) % rows;
  const c = i % cols;
  const pctW = 100 / cols;
  const pctH = 100 / rows;
  const x1 = c * pctW;
  const y1 = r * pctH;
  const x2 = x1 + pctW;
  const y2 = y1 + pctH;
  return `polygon(${x1}% ${y1}%, ${x2}% ${y1}%, ${x2}% ${y2}%, ${x1}% ${y2}%)`;
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SendArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

function HeroContent({
  input,
  setInput,
  onSubmit,
  onKeyDown,
  inputRef,
  interactive,
  quickFill,
  maxWidth = 'min(720px, 100%)',
}) {
  const pillRow = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth,
    background: '#2f2f2f',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '9999px',
    padding: '6px 8px 6px 14px',
    boxShadow: '0 0 0 1px rgba(0,0,0,0.25) inset',
  };

  const chipBtn = {
    fontFamily: sans,
    fontSize: '13px',
    color: '#e8e8e8',
    background: '#2f2f2f',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '9999px',
    padding: '10px 16px',
    cursor: interactive ? 'pointer' : 'default',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background 150ms, border-color 150ms',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
      }}
    >
      <h1
        style={{
          fontFamily: sans,
          fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
          fontWeight: 400,
          color: '#ececec',
          textAlign: 'center',
          letterSpacing: '-0.02em',
        }}
      >
        Ready when you are.
      </h1>

      <div style={pillRow}>
        <span style={{ color: '#8e8e8e', display: 'flex', flexShrink: 0, opacity: interactive ? 1 : 0.6 }}>
          <PlusIcon />
        </span>
        {interactive ? (
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything"
            rows={1}
            style={{
              flex: 1,
              minHeight: '44px',
              maxHeight: '120px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ececec',
              fontFamily: sans,
              fontSize: '16px',
              lineHeight: 1.4,
              resize: 'none',
              padding: '10px 4px',
            }}
          />
        ) : (
          <div
            style={{
              flex: 1,
              minHeight: '44px',
              color: input ? '#ececec' : '#8e8e8e',
              fontFamily: sans,
              fontSize: '16px',
              padding: '10px 4px',
              lineHeight: 1.4,
              whiteSpace: 'pre-wrap',
            }}
          >
            {input || 'Ask anything'}
          </div>
        )}
        <button
          type="button"
          onClick={interactive ? onSubmit : undefined}
          disabled={!interactive || !input.trim()}
          aria-label="Send"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            flexShrink: 0,
            cursor: interactive && input.trim() ? 'pointer' : 'default',
            background: input.trim() ? '#ececec' : '#525252',
            color: input.trim() ? '#0a0a0a' : '#a3a3a3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 150ms, color 150ms',
          }}
        >
          <SendArrowIcon />
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth }}>
        <button type="button" {...(interactive ? { onClick: () => quickFill('Explain attention in one sentence.') } : {})} style={chipBtn}>
          <span style={{ opacity: 0.85 }}>✎</span> Try a short prompt
        </button>
        <button type="button" {...(interactive ? { onClick: () => quickFill('What happens when I hit enter on a chatbot?') } : {})} style={chipBtn}>
          <span style={{ opacity: 0.85 }}>◇</span> Trace a reply
        </button>
        <button type="button" {...(interactive ? { onClick: () => quickFill('How does software reach silicon?') } : {})} style={chipBtn}>
          <span style={{ opacity: 0.85 }}>◎</span> Down to hardware
        </button>
      </div>
    </div>
  );
}

export default function Layer0_Chat({ onDrill, setUserPrompt }) {
  const [input, setInput] = useState('');
  const [frozen, setFrozen] = useState('');
  const [shattered, setShattered] = useState(false);
  const [shardStyles, setShardStyles] = useState(SHARD_DIRECTIONS.map(() => ({})));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !shattered) {
      inputRef.current.focus();
    }
  }, [shattered]);

  function handleSubmit() {
    if (!input.trim()) return;
    const text = input.trim();
    setUserPrompt(text);
    setFrozen(text);
    setShattered(true);
    const newStyles = SHARD_DIRECTIONS.map((dir) => ({
      transform: `translate(${dir.tx}px, ${dir.ty}px) rotate(${dir.rot}deg)`,
      opacity: 0,
      transition: 'transform 600ms ease-out, opacity 600ms ease-out',
    }));
    setTimeout(() => setShardStyles(newStyles), 10);
    setTimeout(() => onDrill(), 700);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  const quickFill = (text) => setInput(text);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#212121',
        fontFamily: sans,
      }}
    >
      <header
        style={{
          flexShrink: 0,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ fontFamily: sans, fontSize: '15px', fontWeight: 600, color: '#ececec', letterSpacing: '-0.02em' }}>
          LLM Dissect
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            minHeight: 0,
          }}
        >
          {!shattered && (
            <HeroContent
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              inputRef={inputRef}
              interactive
              quickFill={quickFill}
            />
          )}

          {shattered &&
            SHARD_DIRECTIONS.map((dir, i) => {
              const clipPts = getClipPath(i, SHARD_DIRECTIONS.length);
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    clipPath: clipPts,
                    ...shardStyles[i],
                    transformOrigin: 'center center',
                  }}
                >
                  <HeroContent
                    input={frozen}
                    setInput={() => {}}
                    onSubmit={() => {}}
                    onKeyDown={() => {}}
                    inputRef={undefined}
                    interactive={false}
                    quickFill={() => {}}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
