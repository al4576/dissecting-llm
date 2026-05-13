import React, { useEffect, useRef, useState, useMemo } from 'react';
import { computeAttention } from '../../logic/attention';

const TOKEN_H = 32;
const TOKEN_GAP = 6;
const ARC_AREA_H = 140;

function tokenColor(token) {
  if (/^\d/.test(token)) return '#f0c040';
  if (/^[^a-zA-ZĠ\u0100-\uFFFF]/.test(token)) return '#ff7070';
  if (token.startsWith('Ġ') || token.startsWith(' ')) return '#00ccff';
  return '#aaaaff';
}

function displayToken(t) {
  return t.replace(/^Ġ/, ' ·').replace(/^ /, ' ·');
}

export default function AttentionExplorer({ tokens: rawTokens }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(520);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [hoverCell, setHoverCell] = useState(null);

  // Limit to 14 tokens for readability
  const tokens = useMemo(() => (rawTokens || []).slice(0, 14), [rawTokens]);

  // Real attention computation
  const { weights } = useMemo(() => {
    if (tokens.length === 0) return { weights: [] };
    return computeAttention(tokens);
  }, [tokens]);

  // Show arcs immediately: first token selected when sentence changes
  useEffect(() => {
    setSelectedIdx(tokens.length > 0 ? 0 : null);
    setHoverCell(null);
  }, [tokens]);

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 100) setWidth(Math.min(w, 680));
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (tokens.length === 0) {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#555', padding: '16px' }}>
        Type something in the tokenizer column to the left — its tokens will fill this attention map.
      </div>
    );
  }

  // Token box dimensions
  const boxW = Math.max(36, Math.min(62, (width - TOKEN_GAP * (tokens.length - 1)) / tokens.length));
  const totalW = tokens.length * boxW + (tokens.length - 1) * TOKEN_GAP;
  const svgW = Math.max(width, totalW + 16);
  const svgH = ARC_AREA_H + TOKEN_H + 40;

  // Center token boxes
  const offsetX = (svgW - totalW) / 2;
  const tokenCx = i => offsetX + i * (boxW + TOKEN_GAP) + boxW / 2;
  const tokenY = ARC_AREA_H;

  // Build arc path for pair (from → to)
  function arcPath(fi, ti) {
    const x1 = tokenCx(fi), x2 = tokenCx(ti);
    const y = tokenY + TOKEN_H / 2;
    const span = Math.abs(ti - fi);
    const cpY = y - 30 - span * 14;
    const mx = (x1 + x2) / 2;
    return `M${x1},${y} C${x1},${cpY} ${x2},${cpY} ${x2},${y}`;
  }

  const active = selectedIdx !== null ? selectedIdx : null;
  const activeWeights = active !== null ? weights[active] : null;

  return (
    <div ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        fontSize: '10px', color: '#556', fontFamily: 'monospace',
        letterSpacing: '0.08em', marginBottom: '12px', textAlign: 'center', maxWidth: '520px', lineHeight: 1.65,
      }}>
        ARC VIEW — your sentence as a row of tokens; the curves show <span style={{ color: '#889' }}>attention weights</span> (how much the selected token borrows from each neighbor). Same numbers as one row of the softmax in a real transformer.
      </div>
      <svg
        width={svgW}
        height={svgH}
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Arcs */}
        {active !== null && tokens.map((_, j) => {
          if (j === active) return null;
          const w = activeWeights ? activeWeights[j] : 0;
          if (w < 0.008) return null;

          const color = tokenColor(tokens[j]);
          const strokeW = 1 + w * 8;
          const opacity = 0.15 + w * 0.85;

          return (
            <path
              key={`arc-${j}`}
              d={arcPath(active, j)}
              fill="none"
              stroke={color}
              strokeWidth={strokeW}
              strokeOpacity={opacity}
              style={{ transition: 'stroke-opacity 200ms, stroke-width 200ms' }}
              onMouseEnter={() => setHoverCell({ from: active, to: j, w })}
              onMouseLeave={() => setHoverCell(null)}
            />
          );
        })}

        {/* Self-loop for active token */}
        {active !== null && activeWeights && (
          <path
            d={`M${tokenCx(active) - 8},${tokenY + TOKEN_H / 2}
                C${tokenCx(active) - 8},${tokenY + TOKEN_H / 2 - 28}
                 ${tokenCx(active) + 8},${tokenY + TOKEN_H / 2 - 28}
                 ${tokenCx(active) + 8},${tokenY + TOKEN_H / 2}`}
            fill="none"
            stroke={tokenColor(tokens[active])}
            strokeWidth={1 + activeWeights[active] * 6}
            strokeOpacity={0.2 + activeWeights[active] * 0.6}
          />
        )}

        {/* Token boxes */}
        {tokens.map((token, i) => {
          const cx = tokenCx(i);
          const x = cx - boxW / 2;
          const y = tokenY;
          const color = tokenColor(token);
          const isActive = active === i;
          const weight = activeWeights ? activeWeights[i] : null;
          const isAttendedTo = active !== null && i !== active && weight > 0.05;

          return (
            <g key={i} style={{ cursor: 'pointer' }} onClick={() => setSelectedIdx(active === i ? null : i)}>
              <rect
                x={x} y={y}
                width={boxW} height={TOKEN_H}
                rx={3}
                fill={isActive ? color + '22' : isAttendedTo ? color + '11' : '#111820'}
                stroke={isActive ? color : isAttendedTo ? color + '88' : '#2a2a3a'}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: 'fill 150ms, stroke 150ms' }}
              />
              <text
                x={cx} y={y + TOKEN_H / 2 + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill={isActive ? color : isAttendedTo ? color : '#888'}
                fontSize={Math.min(11, boxW * 0.18)}
                fontFamily="monospace"
                style={{ userSelect: 'none', transition: 'fill 150ms' }}
              >
                {displayToken(token).slice(0, Math.floor(boxW / 7))}
              </text>
              {/* Attention weight label */}
              {activeWeights && i !== active && weight > 0.04 && (
                <text
                  x={cx} y={y + TOKEN_H + 14}
                  textAnchor="middle"
                  fill={color}
                  fontSize="9"
                  fontFamily="monospace"
                  fillOpacity={0.7}
                >
                  {weight.toFixed(2)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoverCell && (
        <div style={{
          marginTop: '6px', fontFamily: 'monospace', fontSize: '11px', color: '#888',
          height: '18px',
        }}>
          <span style={{ color: tokenColor(tokens[hoverCell.from]) }}>
            "{displayToken(tokens[hoverCell.from])}"
          </span>
          {' attends to '}
          <span style={{ color: tokenColor(tokens[hoverCell.to]) }}>
            "{displayToken(tokens[hoverCell.to])}"
          </span>
          {' with weight '}
          <span style={{ color: '#e0e0e0' }}>{hoverCell.w.toFixed(4)}</span>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        marginTop: hoverCell ? '4px' : '10px',
        fontFamily: 'monospace', fontSize: '10px', color: '#555',
      }}>
        {active === null
          ? 'Click a token — that picks the “question asker”; arcs show which other words it listens to.'
          : `Focused token: "${displayToken(tokens[active])}" — thicker arc ⟺ stronger attention weight (click another word to compare)`
        }
      </div>

      {/* Top attended tokens for active */}
      {active !== null && activeWeights && (
        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[...activeWeights.map((w, i) => ({ w, i })).sort((a, b) => b.w - a.w).slice(0, 4)]
            .map(({ w, i: j }) => {
              const color = tokenColor(tokens[j]);
              return (
                <div key={j} style={{
                  fontFamily: 'monospace', fontSize: '10px', padding: '3px 8px',
                  border: `1px solid ${color}44`, background: color + '11',
                }}>
                  <span style={{ color }}>{displayToken(tokens[j])}</span>
                  <span style={{ color: '#555', marginLeft: '6px' }}>{(w * 100).toFixed(1)}%</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
