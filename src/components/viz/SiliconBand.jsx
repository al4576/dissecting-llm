import React, { useState } from 'react';

const ELECTRON_COUNT = 6;

export default function SiliconBand() {
  const [conducting, setConducting] = useState(false);

  const W = 320, H = 200;
  const valenceY = 150, conductionY = 50, bandH = 24;
  const bandGapH = valenceY - conductionY - bandH;

  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.1em' }}>
        SILICON BAND DIAGRAM
      </div>
      <svg width={W} height={H} style={{ display: 'block' }}>
        {/* Conduction band */}
        <rect x={20} y={conductionY} width={W - 40} height={bandH} fill="#1a1a3e" stroke="#4466aa" strokeWidth={1.5} />
        <text x={28} y={conductionY + 15} fill="#6688cc" fontSize="10" fontFamily="monospace">Conduction Band</text>

        {/* Valence band */}
        <rect x={20} y={valenceY} width={W - 40} height={bandH} fill="#1a1a2e" stroke="#334466" strokeWidth={1.5} />
        <text x={28} y={valenceY + 15} fill="#446688" fontSize="10" fontFamily="monospace">Valence Band</text>

        {/* Band gap label */}
        <line x1={W - 30} y1={conductionY + bandH} x2={W - 30} y2={valenceY} stroke="#666" strokeWidth={1} strokeDasharray="3,3" />
        <text x={W - 120} y={(conductionY + bandH + valenceY) / 2 + 4} fill="#888" fontSize="9" fontFamily="monospace">Band Gap: ~1.1 eV</text>

        {/* Electrons */}
        {Array.from({ length: ELECTRON_COUNT }, (_, i) => {
          const x = 40 + i * 40;
          const baseY = valenceY + bandH / 2;
          const deltaY = conducting ? -(valenceY - conductionY) : 0;
          return (
            <circle
              key={i}
              cx={x}
              cy={baseY}
              r={6}
              fill={conducting ? '#ffe040' : '#4466aa'}
              stroke={conducting ? '#ffcc00' : '#2244aa'}
              strokeWidth={1.5}
              style={{
                transform: `translateY(${deltaY}px)`,
                transition: 'transform 400ms ease, fill 400ms ease, stroke 400ms ease',
              }}
            />
          );
        })}

        {/* State labels */}
        <text x={20} y={H - 12} fill={conducting ? 'var(--accent)' : '#555'} fontSize="10" fontFamily="monospace">
          {conducting ? '1 (ON) — electrons conducting' : '0 (OFF) — electrons at rest'}
        </text>
      </svg>

      <button
        onClick={() => setConducting(c => !c)}
        style={{
          marginTop: '10px',
          background: 'none',
          border: '1px solid var(--glow-color)',
          color: 'var(--glow-color)',
          fontFamily: 'monospace',
          fontSize: '11px',
          padding: '5px 12px',
          cursor: 'pointer',
          letterSpacing: '0.08em',
        }}
      >
        {conducting ? 'REMOVE GATE VOLTAGE' : 'APPLY GATE VOLTAGE'}
      </button>

      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666', fontFamily: 'monospace' }}>
        This is how a transistor stores a bit
      </div>
    </div>
  );
}
