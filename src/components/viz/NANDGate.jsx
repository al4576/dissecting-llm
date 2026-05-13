import React, { useState } from 'react';

const TRUTH_TABLE = [
  { a: 0, b: 0, out: 1 },
  { a: 0, b: 1, out: 1 },
  { a: 1, b: 0, out: 1 },
  { a: 1, b: 1, out: 0 },
];

const HIGH_COLOR = '#00ffcc';
const LOW_COLOR = '#334455';

/**
 * @param {{ compact?: boolean }} props — compact: smaller schematic + table for tight side columns
 */
export default function NANDGate({ compact = false }) {
  const [active, setActive] = useState(null);

  const row = active !== null ? TRUTH_TABLE[active] : null;
  const inA = row ? row.a : 0;
  const inB = row ? row.b : 0;
  const out = row ? row.out : 1;

  const wireA = inA ? HIGH_COLOR : LOW_COLOR;
  const wireB = inB ? HIGH_COLOR : LOW_COLOR;
  const wireOut = out ? HIGH_COLOR : LOW_COLOR;

  const svgW = compact ? 124 : 180;
  const svgH = compact ? 82 : 120;
  const tableFont = compact ? '10px' : '12px';
  const thPad = compact ? '3px 8px' : '4px 12px';
  const tdPad = compact ? '4px 8px' : '5px 12px';
  const gap = compact ? '14px' : '32px';
  const hintSize = compact ? '8px' : '9px';

  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ flex: compact ? '0 0 auto' : undefined }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.1em' }}>
          NAND GATE
        </div>
        <svg width={svgW} height={svgH} viewBox="0 0 180 120" style={{ display: 'block' }} aria-hidden>
          <line x1="10" y1="40" x2="55" y2="40" stroke={wireA} strokeWidth="2" style={{ transition: 'stroke 150ms' }} />
          <line x1="10" y1="80" x2="55" y2="80" stroke={wireB} strokeWidth="2" style={{ transition: 'stroke 150ms' }} />

          <path
            d="M55,20 L55,100 Q120,100 120,60 Q120,20 55,20 Z"
            fill="#1a1a2e"
            stroke="#446688"
            strokeWidth="2"
            style={{ transition: 'fill 150ms' }}
          />

          <line x1="55" y1="40" x2="80" y2="40" stroke={wireA} strokeWidth="1.5" />
          <line x1="55" y1="80" x2="80" y2="80" stroke={wireB} strokeWidth="1.5" />

          <circle cx="126" cy="60" r="6" fill="#1a1a2e" stroke="#446688" strokeWidth="2" />

          <line x1="132" y1="60" x2="170" y2="60" stroke={wireOut} strokeWidth="2" style={{ transition: 'stroke 150ms' }} />

          <text x="6" y="44" fill="#888" fontSize="10" fontFamily="monospace">A</text>
          <text x="6" y="84" fill="#888" fontSize="10" fontFamily="monospace">B</text>
          <text x="155" y="55" fill="#888" fontSize="10" fontFamily="monospace">Y</text>

          <circle cx="30" cy="40" r="5" fill={wireA} style={{ transition: 'fill 150ms' }} />
          <circle cx="30" cy="80" r="5" fill={wireB} style={{ transition: 'fill 150ms' }} />
          <circle cx="155" cy="60" r="5" fill={wireOut} style={{ transition: 'fill 150ms' }} />
        </svg>
      </div>

      <div style={{ flex: compact ? '1 1 100px' : undefined, minWidth: 0 }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.1em' }}>
          TRUTH TABLE
        </div>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: tableFont }}>
          <thead>
            <tr>
              {['A', 'B', 'OUT'].map((h) => (
                <th key={h} style={{ padding: thPad, color: '#888', borderBottom: '1px solid #333', textAlign: 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRUTH_TABLE.map((r, i) => (
              <tr
                key={i}
                style={{
                  cursor: 'pointer',
                  background: active === i ? '#1a2a2a' : 'transparent',
                  outline: active === i ? '1px solid var(--glow-color)' : 'none',
                }}
                onClick={() => setActive(active === i ? null : i)}
              >
                <td style={{ padding: tdPad, textAlign: 'center', color: r.a ? HIGH_COLOR : LOW_COLOR }}>{r.a}</td>
                <td style={{ padding: tdPad, textAlign: 'center', color: r.b ? HIGH_COLOR : LOW_COLOR }}>{r.b}</td>
                <td style={{ padding: tdPad, textAlign: 'center', color: r.out ? HIGH_COLOR : '#ff4444', fontWeight: 'bold' }}>{r.out}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '6px', fontSize: hintSize, color: '#555', fontFamily: 'monospace' }}>
          click a row to animate wires — <span style={{ color: '#667' }}>NAND</span> means “NOT both”: output is 0 only when A and B are both 1
        </div>
      </div>
    </div>
  );
}
