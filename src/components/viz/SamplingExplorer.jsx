import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  pedagogicalDistribution,
  sampleFrom,
  displayTok,
} from '../../logic/pedagogicalSampling';

export default function SamplingExplorer({ userPromptTokens, userPromptText }) {
  const [temperature, setTemperature] = useState(1.0);
  const [generated, setGenerated] = useState([]);
  const [lastSampled, setLastSampled] = useState(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(480);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      if (w > 100) setWidth(Math.min(w, 580));
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setGenerated([]);
    setLastSampled(null);
  }, [userPromptTokens, userPromptText]);

  const contextTokens = useMemo(
    () => [
      ...(userPromptTokens || []),
      ...generated.map((g) => (g.startsWith('Ġ') ? g : `Ġ${g}`)),
    ],
    [userPromptTokens, generated],
  );

  const dist = useMemo(
    () => pedagogicalDistribution(userPromptText || '', contextTokens, temperature, 15),
    [userPromptText, contextTokens, temperature],
  );

  const LABEL_W = 58;
  const PROB_W = 50;
  const barAreaW = Math.max(100, width - LABEL_W - PROB_W - 16);
  const maxProb = dist[0]?.prob ?? 1;

  const entropy = -dist.reduce((s, { prob }) => s + (prob > 0 ? prob * Math.log2(prob) : 0), 0);

  const barColor = d3.scaleSequential()
    .domain([0, maxProb])
    .interpolator(d3.interpolateRgb('#132420', '#00ffcc'));

  const promptLen = userPromptTokens?.length ?? 0;

  function handleSample() {
    const token = sampleFrom(dist);
    setLastSampled(token);
    setGenerated((g) => [...g, token]);
  }

  function handleReset() {
    setGenerated([]);
    setLastSampled(null);
  }

  return (
    <div ref={containerRef}>
      {/* ── Context strip ───────────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '9px', color: '#445', fontFamily: 'monospace',
          letterSpacing: '0.1em', marginBottom: '8px',
        }}
        >
          YOUR QUERY (tokenized) — the words the toy model can see before guessing the next piece
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center',
          padding: '10px 12px',
          background: '#080c0f',
          border: '1px solid #1a2030',
          borderLeft: '3px solid #4488ff',
        }}
        >
          {contextTokens.map((tok, i) => {
            const isOriginal = i < promptLen;
            const isNew = !isOriginal;
            const isJustSampled = isNew && stripDisplay(tok) === lastSampled && i === contextTokens.length - 1;
            return (
              <span
                key={`${i}-${tok}`}
                style={{
                  fontFamily: 'monospace', fontSize: '12px', padding: '2px 7px',
                  border: `1px solid ${isJustSampled ? 'var(--glow-color)' : isNew ? '#446644' : '#2a2a2a'}`,
                  background: isJustSampled ? '#001a10' : isNew ? '#0a1a0a' : '#0d0d0d',
                  color: isJustSampled ? 'var(--glow-color)' : isNew ? '#44cc88' : '#778',
                  borderRadius: '2px',
                  transition: 'all 150ms',
                }}
              >
                {displayTok(tok)}
              </span>
            );
          })}
          <span style={{
            fontFamily: 'monospace', fontSize: '13px', color: '#445',
            borderLeft: '2px solid #445', paddingLeft: '4px',
          }}
          >
            ▌
          </span>
        </div>
        <div style={{ fontSize: '9px', color: '#334', fontFamily: 'monospace', marginTop: '5px' }}>
          <span style={{ color: '#4488ff44' }}>█</span>
          {' '}
          original prompt
{' '}
          ·
          {' '}
          <span style={{ color: '#44cc8866' }}>█</span>
          {' '}
          sampled tokens
          {generated.length > 0 && (
            <span style={{ color: '#556' }}>
              {' '}
              (
              {generated.length}
              {' '}
              sampled)
            </span>
          )}
        </div>
      </div>

      {/* ── Temperature slider ──────────────────────────────────────── */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          fontFamily: 'monospace', fontSize: '11px',
          marginBottom: '6px',
        }}
        >
          <span style={{ color: '#556', minWidth: '14px' }}>T</span>
          <span style={{ color: '#556' }}>=</span>
          <span style={{
            fontSize: '18px', fontWeight: 'bold', minWidth: '44px',
            color: temperature < 0.5 ? '#ff9944' : temperature > 1.5 ? '#44aaff' : 'var(--glow-color)',
            transition: 'color 150ms',
          }}
          >
            {temperature.toFixed(2)}
          </span>
          <input
            type="range"
            min={0.10}
            max={2.00}
            step={0.05}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--glow-color)', cursor: 'pointer', height: '3px' }}
          />
        </div>

        <div style={{
          fontFamily: 'monospace', fontSize: '10px',
          display: 'flex', gap: '16px', color: '#445',
        }}
        >
          <span style={{
            color: temperature < 0.5 ? '#ff9944' : '#3a4040',
            transition: 'color 200ms',
          }}
          >
            ← T→0: always picks top token
          </span>
          <span style={{ color: '#3a4040' }}>T=1: sample faithfully</span>
          <span style={{
            color: temperature > 1.5 ? '#44aaff' : '#3a4040',
            transition: 'color 200ms',
          }}
          >
            T→2: chaos →
          </span>
        </div>

        <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#3a4040', marginTop: '4px' }}>
          entropy (how “spread out” the guesses are):
          {' '}
          <span style={{ color: '#667' }}>{dist.length ? entropy.toFixed(2) : '—'}</span>
          {' '}
          bits
          <span style={{ color: '#2a3030', marginLeft: '12px' }}>
            (over top-
            {dist.length}
            {' '}
            shown: max
            {' '}
            {dist.length ? Math.log2(dist.length).toFixed(2) : '—'}
            {' '}
            bits)
          </span>
        </div>
      </div>

      {/* ── Bar chart ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '9px', color: '#445', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' }}>
          NEXT-WORD GUESSES — toy scores turned into percentages (top 15)
        </div>
        <svg width={width} height={Math.max(8, dist.length * 26 + 8)} style={{ display: 'block', overflow: 'visible' }}>
          {dist.map(({ token, prob }, i) => {
            const y = i * 26 + 2;
            const bw = barAreaW * (prob / maxProb);
            const isTop = i === 0;
            const isJustSampled = token === lastSampled;

            return (
              <g key={`${token}-${i}`}>
                <text
                  x={LABEL_W - 5}
                  y={y + 15}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill={isJustSampled ? 'var(--glow-color)' : isTop ? '#aaa' : '#556'}
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {token}
                </text>
                <rect
                  x={LABEL_W}
                  y={y}
                  width={Math.max(2, bw)}
                  height={22}
                  rx={2}
                  fill={isJustSampled ? 'var(--glow-color)' : barColor(prob)}
                  style={{ transition: 'width 180ms ease, fill 180ms ease' }}
                />
                {isJustSampled && (
                  <text
                    x={LABEL_W + 3}
                    y={y + 14}
                    dominantBaseline="middle"
                    fill="#000"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    sampled ✓
                  </text>
                )}
                <text
                  x={LABEL_W + Math.max(2, bw) + 5}
                  y={y + 14}
                  dominantBaseline="middle"
                  fill={isTop ? '#778' : '#445'}
                  fontSize="10"
                  fontFamily="monospace"
                  style={{ transition: 'x 180ms ease' }}
                >
                  {(prob * 100).toFixed(1)}
                  %
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Formula ─────────────────────────────────────────────────── */}
      <div style={{
        padding: '10px 14px', background: '#080c0f',
        border: '1px solid #1a2030', fontFamily: 'monospace',
        fontSize: '12px', lineHeight: 2, marginBottom: '12px',
      }}
      >
        <span style={{ color: '#00ffcc' }}>P</span>
        <span style={{ color: '#445' }}>(next token | </span>
        <span style={{ color: '#4488ff' }}>your query</span>
        <span style={{ color: '#445' }}>) ∝ softmax(scores / </span>
        <span style={{
          color: temperature < 0.5 ? '#ff9944' : temperature > 1.5 ? '#44aaff' : '#00ffcc',
          transition: 'color 200ms',
        }}
        >
          T=
          {temperature.toFixed(2)}
        </span>
        <span style={{ color: '#445' }}>)</span>
        <span style={{ color: '#2a3030', marginLeft: '12px', fontSize: '10px' }}>
          [scores = hand-written rules you can read; a real net uses learned logits]
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleSample}
          style={{
            background: 'none', border: '1px solid var(--glow-color)', color: 'var(--glow-color)',
            fontFamily: 'monospace', fontSize: '11px', padding: '7px 16px', cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          ▶ sample next token
        </button>
        {generated.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'none', border: '1px solid #2a2a2a', color: '#556',
              fontFamily: 'monospace', fontSize: '11px', padding: '7px 14px', cursor: 'pointer',
            }}
          >
            ↺ clear generated
          </button>
        )}
      </div>
    </div>
  );
}

function stripDisplay(t) {
  return (t || '').replace(/^Ġ/, '').trim().toLowerCase();
}
