import React, { useId } from 'react';

/** Light-switch metaphor: closed circuit → glow. */
export function DiagramSwitchBulb() {
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'monospace' }}>
        1 · LIKE A LIGHT SWITCH
      </div>
      <svg width="100%" height="120" viewBox="0 0 280 120" style={{ display: 'block', maxWidth: '320px' }} aria-hidden>
        <rect x="8" y="28" width="38" height="50" rx="4" fill="#121820" stroke="#2a4048" strokeWidth="1" />
        <text x="27" y="58" textAnchor="middle" fill="#6a8" fontSize="8" fontFamily="monospace">
          +
        </text>
        <line x1="46" y1="42" x2="88" y2="42" stroke="var(--glow-color)" strokeWidth="1.5" strokeOpacity={0.85} />
        <line x1="88" y1="42" x2="88" y2="58" stroke="var(--glow-color)" strokeWidth="1.5" strokeOpacity={0.85} />
        <line x1="88" y1="58" x2="118" y2="58" stroke="var(--glow-color)" strokeWidth="1.5" strokeOpacity={0.85} />
        <path d="M 118 48 L 132 58 L 118 68 Z" fill="#1a2820" stroke="#3d6" strokeWidth="1" />
        <line x1="132" y1="58" x2="168" y2="58" stroke="var(--glow-color)" strokeWidth="1.5" strokeOpacity={0.85} />
        <circle cx="188" cy="58" r="22" fill="#1a2218" stroke="var(--glow-color)" strokeWidth="1.5" opacity={0.9} />
        <circle cx="188" cy="58" r="12" fill="var(--glow-color)" opacity={0.35} />
        <text x="188" y="100" textAnchor="middle" fill="#667" fontSize="8" fontFamily="monospace">
          electricity ON → bulb idea
        </text>
      </svg>
      <figcaption style={{ fontSize: '10px', color: '#7a868e', fontFamily: 'monospace', lineHeight: 1.5, marginTop: '8px', maxWidth: '300px' }}>
        <strong>Transistor</strong> is the fancy word; in plain English it is a switch that either lets a trickle of electricity through or blocks it. No gears — just “open” and “closed.”
      </figcaption>
    </figure>
  );
}

/** Many tiny on/off cells — “billions of decisions.” */
export function DiagramTinySwitches() {
  const cols = 8;
  const rows = 3;
  const cell = 12;
  const gap = 4;
  const W = 16 + cols * (cell + gap);
  const H = 36 + rows * (cell + gap);
  const on = [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0];
  let k = 0;
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'monospace' }}>
        2 · BILLIONS OF SPECKS
      </div>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', maxWidth: '320px' }} aria-hidden>
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const x = 12 + c * (cell + gap);
            const y = 12 + r * (cell + gap);
            const lit = on[k++ % on.length];
            return (
              <rect
                key={`${r}-${c}`}
                x={x}
                y={y}
                width={cell}
                height={cell}
                rx="2"
                fill={lit ? 'rgba(0,255,204,0.2)' : '#12181c'}
                stroke={lit ? 'var(--glow-color)' : '#2a3038'}
                strokeWidth={lit ? 1 : 0.6}
                opacity={lit ? 1 : 0.85}
              />
            );
          })
        )}
        <text x={W / 2} y={H - 4} textAnchor="middle" fill="#556" fontSize="7" fontFamily="monospace">
          bright = on · dim = off
        </text>
      </svg>
      <figcaption style={{ fontSize: '10px', color: '#7a868e', fontFamily: 'monospace', lineHeight: 1.5, marginTop: '8px', maxWidth: '300px' }}>
        A <strong>chip</strong> is a giant city of those switches. Together they do not “think” — they flip incredibly fast so the math from the layers above can run.
      </figcaption>
    </figure>
  );
}

/** Words flowing into blocks → answer (no math). */
export function DiagramQuestionToAnswer() {
  const mid = useId().replace(/:/g, '');
  return (
    <figure style={{ margin: 0 }}>
      <div style={{ fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '8px', fontFamily: 'monospace' }}>
        3 · YOUR QUESTION, IN TINY STEPS
      </div>
      <svg width="100%" height="100" viewBox="0 0 300 100" style={{ display: 'block', maxWidth: '340px' }} aria-hidden>
        <defs>
          <marker id={`phys-arr-${mid}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--glow-color)" fillOpacity="0.7" />
          </marker>
        </defs>
        <rect x="10" y="30" width="72" height="36" rx="4" fill="#101820" stroke="#2a4850" strokeWidth="1" />
        <text x="46" y="52" textAnchor="middle" fill="#8a9" fontSize="8" fontFamily="monospace">
          your words
        </text>
        <path
          d="M 82 48 H 102"
          stroke="var(--glow-color)"
          strokeWidth="1.2"
          strokeOpacity={0.6}
          markerEnd={`url(#phys-arr-${mid})`}
        />
        <rect x="102" y="22" width="96" height="52" rx="4" fill="#0c1014" stroke="var(--glow-color)" strokeWidth="0.8" strokeOpacity={0.5} />
        <text x="150" y="48" textAnchor="middle" fill="#6a7a72" fontSize="7" fontFamily="monospace">
          zillions of
        </text>
        <text x="150" y="62" textAnchor="middle" fill="#6a7a72" fontSize="7" fontFamily="monospace">
          on/off steps
        </text>
        <path d="M 198 48 H 218" stroke="var(--glow-color)" strokeWidth="1.2" strokeOpacity={0.6} />
        <rect x="218" y="30" width="72" height="36" rx="4" fill="#101820" stroke="#2a4850" strokeWidth="1" />
        <text x="254" y="52" textAnchor="middle" fill="#8a9" fontSize="8" fontFamily="monospace">
          one reply
        </text>
      </svg>
      <figcaption style={{ fontSize: '10px', color: '#7a868e', fontFamily: 'monospace', lineHeight: 1.5, marginTop: '8px', maxWidth: '300px' }}>
        A <strong>chat model</strong> feels like one brain; physically it is an absurd number of boring yes/no moves in metal, choreographed by software.
      </figcaption>
    </figure>
  );
}
