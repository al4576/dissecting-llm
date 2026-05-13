import React, { useState, useEffect } from 'react';

// ─── helpers ─────────────────────────────────────────────────────────────────

function hashStr(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
function seededRng(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function embedToy(token, d = 4) {
  const r = seededRng(hashStr('emb:' + token));
  return Array.from({ length: d }, () => +(r() * 2 - 1).toFixed(3));
}
function matVecToy(label, vec) {
  const d = vec.length;
  const r = seededRng(hashStr('wmat:' + label));
  const M = Array.from({ length: d }, () => Array.from({ length: d }, () => r() * 0.4 - 0.2));
  return M.map(row => +row.reduce((s, w, j) => s + w * vec[j], 0).toFixed(3));
}
function dot4(a, b) { return +(a.reduce((s, x, i) => s + x * b[i], 0)).toFixed(3); }
function softmax(arr) {
  const mx = Math.max(...arr);
  const exps = arr.map(x => Math.exp(x - mx));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => +(e / sum).toFixed(3));
}
function fmt(n) { return n >= 0 ? `+${n.toFixed(3)}` : n.toFixed(3); }

/** Pause between steps in detail-panel math animations (ms). */
const VIS_STEP_MS = 860;

// ─── step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 'embed',
    label: 'Embedding Lookup',
    sublines: ['token ID → one row', 'of the embedding table'],
    sublabelTitle: 'The symbol W_E means “embedding weights”: one long vector per vocabulary entry. Your token’s integer picks which vector to copy — like a dictionary from ID to coordinates.',
    color: '#6688aa',
    plain: 'Each token is an integer ID. That ID selects one row from a gigantic table of vectors the model learned during training (often written W_E). That row is the token’s position in “meaning space” — many dimensions, not just two.',
    formula: [
      { seg: 'eᵢ', color: '#6688aa' },
      { seg: ' = ', color: '#555' },
      { seg: 'W_E', color: '#888' },
      { seg: '[token_id]', color: '#aaa' },
    ],
    note: 'W_E has one row per vocabulary entry — about 50,000 rows. Each row is looked up by integer index; no computation occurs.',
    getExample: (toks) => {
      if (!toks[0]) return null;
      const e = embedToy(toks[0]);
      return { label: `"${toks[0]}" → vector (first 4 dims)`, values: e, color: '#6688aa' };
    },
  },
  {
    id: 'project',
    label: 'Linear Projection',
    sublines: ['Q, K, V: three learned', 'views of the same embedding'],
    sublabelTitle: 'W_Q, W_K, W_V are three learned matrices. Each turns the same embedding into a different vector: “search request” (Q), “searchable label” (K), and “payload to mix in” (V).',
    color: '#4488ff',
    plain: 'From the same embedding, three learned matrices each produce a different vector. Query: what am I looking for? Key: what do I advertise to match against? Value: what do I add if you listen to me?',
    formula: [
      { seg: 'Q', color: '#4488ff' },
      { seg: ' = E · W_Q   ', color: '#555' },
      { seg: 'K', color: '#ff9944' },
      { seg: ' = E · W_K   ', color: '#555' },
      { seg: 'V', color: '#44cc88' },
      { seg: ' = E · W_V', color: '#555' },
    ],
    note: 'All three projections happen in parallel. W_Q, W_K, W_V are d×d matrices — each learned to specialise what Q, K, V "mean" in that layer.',
    getExample: (toks) => {
      if (!toks[0]) return null;
      const e = embedToy(toks[0]);
      const q = matVecToy('Wq', e);
      const k = matVecToy('Wk', e);
      return { label: `"${toks[0]}" Q vs K (first 4 dims)`, q, k };
    },
  },
  {
    id: 'scores',
    label: 'Q · Kᵀ',
    sublines: ['dot each Q with each K', 'raw match scores'],
    sublabelTitle: 'Notation S[i,j] = Qᵢ · Kⱼ: one score per token pair — multiply matching entries from Q and K, then add.',
    color: '#f0c040',
    plain: 'For every pair of tokens, compare one token’s Query to the other’s Key one score at a time. High score means “these two are a strong match for this layer’s purpose.”',
    formula: [
      { seg: 'S[i,j]', color: '#f0c040' },
      { seg: ' = ', color: '#555' },
      { seg: 'Qᵢ', color: '#4488ff' },
      { seg: ' · ', color: '#555' },
      { seg: 'Kⱼ', color: '#ff9944' },
      { seg: ' = Σₖ Q[i,k] × K[j,k]', color: '#888' },
    ],
    note: 'The dot product measures geometric alignment: two parallel vectors score high, perpendicular vectors score near zero, anti-parallel score negative.',
    getExample: (toks) => {
      if (!toks[0] || !toks[1]) return null;
      const e0 = embedToy(toks[0]), e1 = embedToy(toks[1]);
      const q0 = matVecToy('Wq', e0), k1 = matVecToy('Wk', e1);
      const score = dot4(q0, k1);
      return { label: `Q["${toks[0]}"] · K["${toks[1]}"]`, score, q: q0, k: k1 };
    },
  },
  {
    id: 'scale',
    label: 'Scale  ÷ √dₖ',
    sublines: ['shrink big dot-products', 'so softmax can learn'],
    sublabelTitle: 'dₖ is how long each key vector is. Dividing by √dₖ stops dot products from ballooning when vectors have many dimensions — otherwise softmax would saturate and learning slows.',
    color: '#ff9944',
    plain: 'Divide scores by √dₖ (key width). If we skipped this, long vectors would produce huge dot products and softmax would slam to nearly 0% / 100% with almost no gradient left to learn from.',
    formula: [
      { seg: 'S̃[i,j]', color: '#ff9944' },
      { seg: ' = ', color: '#555' },
      { seg: 'S[i,j]', color: '#f0c040' },
      { seg: ' / ', color: '#555' },
      { seg: '√dₖ', color: '#ff9944' },
    ],
    note: 'For dₖ=64 (one head of GPT-2): divide by 8. For dₖ=128 (GPT-3 head): divide by ~11.3. Keeps scores in a range where softmax gradients stay non-trivial.',
    getExample: (toks) => {
      if (!toks[0] || !toks[1]) return null;
      const e0 = embedToy(toks[0]), e1 = embedToy(toks[1]);
      const q0 = matVecToy('Wq', e0), k1 = matVecToy('Wk', e1);
      const raw = dot4(q0, k1);
      const d = 4;
      const scaled = +(raw / Math.sqrt(d)).toFixed(4);
      return { label: `dₖ=4 → √4 = 2.00`, raw, scaled };
    },
  },
  {
    id: 'softmax',
    label: 'Softmax',
    sublines: ['scores → weights ≥ 0', 'each row sums to 1'],
    sublabelTitle: 'Each row becomes a set of positive percentages that add to 100%. Bigger scores get bigger slices; tiny scores become nearly zero.',
    color: '#00ffcc',
    plain: 'Softmax on each row turns raw scores into mixing weights: all positive and summing to 1. Think “how much of each token should I blend in?”',
    formula: [
      { seg: 'A[i,j]', color: '#00ffcc' },
      { seg: ' = ', color: '#555' },
      { seg: 'exp(S̃[i,j])', color: '#aaa' },
      { seg: ' / ', color: '#555' },
      { seg: 'Σⱼ exp(S̃[i,j])', color: '#888' },
    ],
    note: 'Softmax is monotone — the ranking of scores is preserved. But it is not linear: the gap between rank-1 and rank-2 gets amplified. This is what makes attention "sharp" when temperature is low.',
    getExample: (toks) => {
      if (!toks[0] || !toks.slice(1).length) return null;
      const displayToks = toks.slice(0, 4);
      const e0 = embedToy(toks[0]);
      const q0 = matVecToy('Wq', e0);
      const rawScores = displayToks.map(t => {
        const k = matVecToy('Wk', embedToy(t));
        return +(dot4(q0, k) / Math.sqrt(4)).toFixed(3);
      });
      const weights = softmax(rawScores);
      return { label: `row 0 ("${toks[0]}")`, rawScores, weights, toks: displayToks };
    },
  },
  {
    id: 'aggregate',
    label: 'A · V',
    sublines: ['weighted mix of', 'value vectors V'],
    sublabelTitle: 'Multiply each value vector by its weight and add — that weighted blend is the updated representation for this token.',
    color: '#44cc88',
    plain: 'Combine all Value vectors using those weights: tokens you paid attention to contribute more. The result is a new vector that mixes in context from the rest of the sequence.',
    formula: [
      { seg: 'Out[i]', color: '#44cc88' },
      { seg: ' = ', color: '#555' },
      { seg: 'Σⱼ ', color: '#888' },
      { seg: 'A[i,j]', color: '#00ffcc' },
      { seg: ' × ', color: '#555' },
      { seg: 'V[j]', color: '#44cc88' },
    ],
    note: 'The output has the same shape as the input embeddings (n × d). It is then fed to a feedforward network, followed by layer norm — then repeated L times (e.g. 96 times in GPT-3).',
    getExample: (toks) => {
      if (!toks[0] || !toks.slice(1).length) return null;
      const displayToks = toks.slice(0, 3);
      const e0 = embedToy(toks[0]);
      const q0 = matVecToy('Wq', e0);
      const rawScores = displayToks.map(t => +(dot4(q0, matVecToy('Wk', embedToy(t))) / Math.sqrt(4)).toFixed(3));
      const weights = softmax(rawScores);
      const vecs = displayToks.map(t => matVecToy('Wv', embedToy(t)));
      const out = vecs[0].map((_, d) => +(weights.reduce((s, w, j) => s + w * vecs[j][d], 0)).toFixed(3));
      return { weights, vecs, out, toks: displayToks };
    },
  },
];

// ─── SVG diagram ──────────────────────────────────────────────────────────────

// Single main column of operation boxes (no separate V bypass track).
const BOX_W = 176;
const BOX_H = 44;
const BOX_RX = 5;
const PAD_X = 14;
const CX = PAD_X + BOX_W / 2;
const MAIN_RIGHT = PAD_X + BOX_W;

const TOP_PAD = 22;

const BOX_POSITIONS = {
  embed:     { x: PAD_X, y: TOP_PAD + 0 },
  project:   { x: PAD_X, y: TOP_PAD + 92 },
  scores:    { x: PAD_X, y: TOP_PAD + 212 },
  scale:     { x: PAD_X, y: TOP_PAD + 296 },
  softmax:   { x: PAD_X, y: TOP_PAD + 380 },
  aggregate: { x: PAD_X, y: TOP_PAD + 476 },
};

const SVG_W = MAIN_RIGHT + 28;
const SVG_H = TOP_PAD + 476 + BOX_H + 56;

function DiagramSVG({ active, onSelect, tokens }) {
  const isActive = id => active === id;

  return (
    <svg width={SVG_W} height={SVG_H} style={{ display: 'block', flexShrink: 0 }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 Z" fill="#444" />
        </marker>
      </defs>
      {/* Vertical arrows between main column boxes */}
      {[
        ['embed', 'project'],
        ['project', 'scores'],
        ['scores', 'scale'],
        ['scale', 'softmax'],
        ['softmax', 'aggregate'],
      ].map(([a, b]) => {
        const ay = BOX_POSITIONS[a].y + BOX_H;
        const by = BOX_POSITIONS[b].y;
        const col = isActive(a) || isActive(b) ? '#555' : '#2a2a2a';
        return <line key={`${a}-${b}`} x1={CX} y1={ay + 2} x2={CX} y2={by - 4}
          stroke={col} strokeWidth={1.5} markerEnd="url(#arrow)" />;
      })}

      {/* Output arrow */}
      <line x1={CX} y1={BOX_POSITIONS.aggregate.y + BOX_H + 2} x2={CX} y2={SVG_H - 16}
        stroke="#2a2a2a" strokeWidth={1.5} markerEnd="url(#arrow)" />
      <text x={CX} y={SVG_H - 4} textAnchor="middle" fill="#555" fontSize="10" fontFamily="monospace">
        output (new token representations)
      </text>

      {/* Q/K labels above scores */}
      <text x={CX - 20} y={BOX_POSITIONS.scores.y - 8} fill="#4488ff" fontSize="9" fontFamily="monospace" textAnchor="middle">Q</text>
      <text x={CX + 20} y={BOX_POSITIONS.scores.y - 8} fill="#ff9944" fontSize="9" fontFamily="monospace" textAnchor="middle">K</text>

      {/* Operation boxes */}
      {STEPS.map(step => {
        const pos = BOX_POSITIONS[step.id];
        if (!pos) return null;
        const bw = BOX_W;
        const bx = pos.x;
        const sel = isActive(step.id);
        const subFill = sel ? step.color + 'bb' : '#556';
        const lines = step.sublines;

        return (
          <g key={step.id} style={{ cursor: 'pointer' }} onClick={() => onSelect(sel ? null : step.id)}>
            {/* Glow effect when selected */}
            {sel && (
              <rect x={bx - 2} y={pos.y - 2} width={bw + 4} height={BOX_H + 4} rx={BOX_RX + 1}
                fill="none" stroke={step.color} strokeWidth={1.5} strokeOpacity={0.45}
                style={{ filter: `drop-shadow(0 0 2px ${step.color}55)` }} />
            )}
            <rect x={bx} y={pos.y} width={bw} height={BOX_H} rx={BOX_RX}
              fill={sel ? step.color + '18' : '#0d1117'}
              stroke={sel ? step.color : '#2a2a2a'}
              strokeWidth={sel ? 1.5 : 1}
              style={{ transition: 'fill 120ms, stroke 120ms' }}
            />
            <text x={bx + bw / 2} y={pos.y + 13} textAnchor="middle"
              fill={sel ? step.color : '#bbb'} fontSize="11" fontFamily="monospace"
              fontWeight={sel ? 'bold' : 'normal'}
              style={{ transition: 'fill 120ms', userSelect: 'none' }}>
              {step.label}
            </text>
            <text
              x={bx + bw / 2}
              y={pos.y + (lines.length > 1 ? 24 : 30)}
              textAnchor="middle"
              fill={subFill}
              fontSize="7.5"
              fontFamily="monospace"
              style={{ userSelect: 'none' }}
            >
              {step.sublabelTitle ? <title>{step.sublabelTitle}</title> : null}
              {lines.map((line, i) => (
                <tspan key={i} x={bx + bw / 2} dy={i === 0 ? 0 : 11}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Token preview at top */}
      {tokens.slice(0, 3).map((tok, i) => (
        <text key={i} x={CX - 38 + i * 40} y={TOP_PAD - 6} textAnchor="middle"
          fill="#4a5a6a" fontSize="9" fontFamily="monospace">
          "{tok.replace(/^Ġ/, '·')}"
        </text>
      ))}
    </svg>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function FormulaLine({ parts }) {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: 2, letterSpacing: '0.04em' }}>
      {parts.map((p, i) => (
        <span key={i} style={{ color: p.color }}>{p.seg}</span>
      ))}
    </div>
  );
}

function MiniBarH({ values, colors, labels, height = 16, maxW = 232 }) {
  const labelCol = 26;
  const barStart = 32;
  const valueReserve = 58;
  const barCap = Math.max(20, maxW - barStart - valueReserve);
  const max = Math.max(...values.map(Math.abs), 0.001);
  return (
    <svg width={maxW} height={values.length * (height + 4)} style={{ display: 'block', margin: '4px 0' }}>
      {values.map((v, i) => {
        const barW = Math.abs(v) / max * barCap;
        const col = Array.isArray(colors) ? colors[i] : colors;
        const rowY = i * (height + 4);
        return (
          <g key={i}>
            <text x={4} y={rowY + height * 0.8} fill="#555" fontSize="9" fontFamily="monospace">
              {labels?.[i] ?? `d${i}`}
            </text>
            <rect x={barStart} y={rowY} width={Math.max(2, barW)} height={height}
              rx={2} fill={v < 0 ? col + '77' : col} />
            <text x={maxW - 2} y={rowY + height * 0.8}
              textAnchor="end" fill="#666" fontSize="9" fontFamily="monospace">
              {v >= 0 ? '+' : ''}{v.toFixed(3)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Tiny looping animation: one row of W × e — highlights matching entries; side column shows each multiply + running sum. */
function ToyMatVecAnim() {
  const W = [
    [0.2, -0.15, 0.35],
    [0.25, 0.3, -0.1],
    [-0.2, 0.4, 0.15],
  ];
  const eCol = [0.7, 0.45, -0.25];
  const out = W.map((row) => row.reduce((s, x, j) => s + x * eCol[j], 0));

  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 12), VIS_STEP_MS);
    return () => clearInterval(id);
  }, []);

  const row = Math.floor(frame / 4);
  const sub = frame % 4;
  const cw = 44;
  const ch = 26;
  const ox = 6;
  const oy = 22;

  const partialForRow = (r, upToJ) => {
    let s = 0;
    for (let j = 0; j <= upToJ && j < 3; j++) s += W[r][j] * eCol[j];
    return s;
  };

  let caption = '';
  if (sub < 3) {
    const prod = W[row][sub] * eCol[sub];
    caption = `Row ${row + 1}: (${W[row][sub].toFixed(2)} × ${eCol[sub].toFixed(2)}) = ${prod.toFixed(3)}  →  partial sum ${partialForRow(row, sub).toFixed(3)}`;
  } else {
    caption = `Row ${row + 1} complete: W[${row},:] × e = ${out[row].toFixed(3)} (sum of the three products on the right)`;
  }

  const sideX = 318;
  const sideW = 132;

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '9px', color: '#456', fontFamily: 'monospace', marginBottom: '6px', lineHeight: 1.5 }}>
        Matrix × vector (toy 3×3): one output row of Q is <strong style={{ color: '#668' }}>one row of W_Q multiplied by your embedding</strong> — same operation repeats for every row.
      </div>
      <svg width={sideX + sideW + 8} height={148} style={{ display: 'block' }}>
        <text x={ox} y={14} fill="#556" fontSize="9" fontFamily="monospace">W (one weight block)</text>
        <text x={186} y={14} fill="#556" fontSize="9" fontFamily="monospace">e</text>
        <text x={268} y={14} fill="#556" fontSize="9" fontFamily="monospace">W × e</text>
        <text x={sideX} y={14} fill="#556" fontSize="8" fontFamily="monospace">adds to row sum →</text>
        {W.map((r, i) =>
          r.map((val, j) => {
            const hi = i === row && (sub < 3 ? j === sub : sub === 3);
            const fill = hi ? 'rgba(68,136,255,0.22)' : '#0d1218';
            const stroke = hi ? '#4488aa' : '#253038';
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={ox + j * cw}
                  y={oy + i * ch}
                  width={cw - 4}
                  height={ch - 4}
                  rx={3}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={hi ? 1.5 : 1}
                />
                <text
                  x={ox + j * cw + (cw - 4) / 2}
                  y={oy + i * ch + 13}
                  textAnchor="middle"
                  fill={hi ? '#aac' : '#667'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {val.toFixed(2)}
                </text>
              </g>
            );
          }),
        )}
        {eCol.map((v, i) => {
          const hiCol = sub < 3 && i === sub;
          const hiAllE = sub === 3;
          const hi = hiCol || hiAllE;
          const fill = hi ? 'rgba(0, 200, 170, 0.18)' : '#0d1218';
          const stroke = hi ? '#3a9e8a' : '#253038';
          return (
            <g key={`e-${i}`}>
              <rect x={180} y={oy + i * ch} width={cw - 4} height={ch - 4} rx={3} fill={fill} stroke={stroke} strokeWidth={hi ? 1.5 : 1} />
              <text x={180 + (cw - 4) / 2} y={oy + i * ch + 13} textAnchor="middle" fill={hi ? '#9cb' : '#667'} fontSize="9" fontFamily="monospace">
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
        <text x={158} y={oy + 1.5 * ch} fill="#445" fontSize="16" fontFamily="monospace">×</text>
        <text x={246} y={oy + 1.5 * ch} fill="#445" fontSize="16" fontFamily="monospace">=</text>
        {out.map((val, i) => {
          const hiRow = i === row && sub === 3;
          const activeBuilding = i === row && sub < 3;
          const fill = hiRow ? 'rgba(68,136,255,0.22)' : activeBuilding ? 'rgba(68,136,255,0.1)' : '#0d1218';
          const stroke = hiRow ? '#4488aa' : activeBuilding ? '#4488aa55' : '#253038';
          const display = i !== row ? val.toFixed(3) : sub === 3 ? val.toFixed(3) : partialForRow(row, sub).toFixed(3);
          const outCellW = 50;
          return (
            <g key={`o-${i}`}>
              <rect x={256} y={oy + i * ch} width={outCellW} height={ch - 4} rx={3} fill={fill} stroke={stroke} strokeWidth={hiRow ? 1.5 : 1} />
              <text x={256 + outCellW / 2} y={oy + i * ch + 13} textAnchor="middle" fill={hiRow ? '#cce' : '#778'} fontSize="9" fontFamily="monospace">
                {display}
              </text>
            </g>
          );
        })}
        {/* Side: each multiply + running total for the active matrix row */}
        <g>
          {[0, 1, 2].map((j) => {
            const p = W[row][j] * eCol[j];
            const run = partialForRow(row, j);
            const active = sub < 3 && j === sub;
            const done = sub > j || sub === 3;
            return (
              <text
                key={`s-${j}`}
                x={sideX}
                y={oy + row * ch + 10 + j * 11}
                fill={active ? '#aab' : done ? '#778' : '#383838'}
                fontSize="8"
                fontFamily="monospace"
              >
                {`${W[row][j].toFixed(2)}×${eCol[j].toFixed(2)}=${p.toFixed(3)} → ${run.toFixed(3)}`}
              </text>
            );
          })}
          <text x={sideX} y={oy + row * ch + 46} fill={sub === 3 ? '#889' : '#333'} fontSize="8" fontFamily="monospace" fontWeight={sub === 3 ? 'bold' : 'normal'}>
            {sub === 3 ? `row ${row + 1} Σ = ${out[row].toFixed(3)}` : '…'}
          </text>
        </g>
      </svg>
      <div style={{ fontSize: '9px', color: '#778', fontFamily: 'monospace', lineHeight: 1.5, maxWidth: '460px' }}>{caption}</div>
    </div>
  );
}

/** Table scan → one row copied into e (lookup, not multiply). */
function ToyEmbeddingLookupAnim({ values }) {
  const nRow = 5;
  const targetRow = 2;
  const fake = [
    [-0.12, 0.44, -0.08, 0.21],
    [0.33, -0.19, 0.52, -0.41],
    null,
    [0.09, -0.27, 0.18, 0.06],
    [-0.31, 0.11, -0.22, 0.39],
  ];
  const rowVals = (r) => (r === targetRow ? values : fake[r]);

  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % nRow), VIS_STEP_MS);
    return () => clearInterval(id);
  }, []);

  const sel = f;
  const cw = 44;
  const ch = 22;
  const ox = 4;
  const oy = 20;

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '9px', color: '#456', fontFamily: 'monospace', marginBottom: '6px', lineHeight: 1.5 }}>
        Lookup only: the token ID picks <strong style={{ color: '#668' }}>one row</strong> of the embedding matrix W_E. Those numbers become vector e — no multiply-add yet.
      </div>
      <svg width={300} height={130} style={{ display: 'block' }}>
        <text x={ox} y={12} fill="#556" fontSize="9" fontFamily="monospace">W_E (rows × dims)</text>
        <text x={210} y={12} fill="#556" fontSize="9" fontFamily="monospace">e</text>
        {Array.from({ length: nRow }, (_, r) =>
          [0, 1, 2, 3].map((c) => {
            const v = rowVals(r)[c];
            const hi = r === sel;
            return (
              <g key={`${r}-${c}`}>
                <rect
                  x={ox + c * cw}
                  y={oy + r * ch}
                  width={cw - 5}
                  height={ch - 4}
                  rx={2}
                  fill={hi ? 'rgba(102,136,170,0.35)' : '#0d1218'}
                  stroke={hi ? '#6688aa' : '#253038'}
                  strokeWidth={hi ? 1.5 : 1}
                />
                <text
                  x={ox + c * cw + (cw - 5) / 2}
                  y={oy + r * ch + 10}
                  textAnchor="middle"
                  fill={hi ? '#ccd' : '#667'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {typeof v === 'number' ? v.toFixed(2) : '—'}
                </text>
              </g>
            );
          }),
        )}
        {[0, 1, 2, 3].map((c) => {
          const v = values[c];
          const pulse = sel === targetRow;
          return (
            <g key={`o-${c}`}>
              <rect
                x={200}
                y={oy + c * ch}
                width={cw - 5}
                height={ch - 4}
                rx={2}
                fill={pulse ? 'rgba(0,255,204,0.2)' : '#0d1218'}
                stroke={pulse ? '#3a9e8a' : '#253038'}
                strokeWidth={pulse ? 1.5 : 1}
              />
              <text x={200 + (cw - 5) / 2} y={oy + c * ch + 10} textAnchor="middle" fill={pulse ? '#9ed' : '#667'} fontSize="9" fontFamily="monospace">
                {v.toFixed(2)}
              </text>
            </g>
          );
        })}
        <text x={182} y={oy + 2 * ch} fill="#445" fontSize="14" fontFamily="monospace">→</text>
      </svg>
      <div style={{ fontSize: '9px', color: '#778', fontFamily: 'monospace', maxWidth: '290px', lineHeight: 1.5 }}>
        {sel === targetRow
          ? 'Highlighted row matches your token — those four values are copied into e (first dimensions).'
          : `Row ${sel + 1} of ${nRow}: imagine the model reading index ${sel}; your token uses row ${targetRow + 1}.`}
      </div>
    </div>
  );
}

/** Q · K one coordinate at a time → sum. Q/K headers sit above the number columns so they never overlap digits. */
function ToyDotProductAnim({ q, k, score }) {
  const products = q.map((qi, i) => qi * k[i]);
  const n = q.length;
  const total = n + 2;
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % total), VIS_STEP_MS);
    return () => clearInterval(id);
  }, [total]);

  let caption = '';
  if (f < n) {
    caption = `Slot ${f + 1}: Q[${f}] × K[${f}] = (${q[f].toFixed(3)}) (${k[f].toFixed(3)}) = ${products[f].toFixed(3)}`;
  } else if (f === n) {
    caption = 'All four products — add them for the raw match score.';
  } else {
    caption = `Dot product Q · K = ${score.toFixed(3)}`;
  }

  const rh = 22;
  const y0 = 36;
  const xQ = 8;
  const xMul = 68;
  const xK = 82;
  const xEq = 144;
  const xProd = 162;
  const colQ = xQ + 22;
  const colK = xK + 22;

  const showFinalSum = f === n + 1;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '9px', color: '#456', fontFamily: 'monospace', marginBottom: '6px', lineHeight: 1.5 }}>
        Dot product: <strong style={{ color: '#668' }}>multiply same-index entries (×)</strong>, then add every product.
      </div>
      <svg width={248} height={y0 + n * rh + 40} style={{ display: 'block' }}>
        <text x={colQ} y={14} fill="#4488aa" fontSize="9" fontFamily="monospace" textAnchor="middle">Q</text>
        <text x={colK} y={14} fill="#cc8844" fontSize="9" fontFamily="monospace" textAnchor="middle">K</text>
        {q.map((qv, i) => {
          const hi = f === i || f >= n;
          const rowY = y0 + i * rh;
          return (
            <g key={i}>
              <text x={xQ} y={rowY} fill={hi ? '#aad' : '#556'} fontSize="11" fontFamily="monospace" textAnchor="start">
                {qv.toFixed(3)}
              </text>
              <text x={xMul} y={rowY} fill="#667" fontSize="12" fontFamily="monospace" textAnchor="middle">
                ×
              </text>
              <text x={xK} y={rowY} fill={hi ? '#feb' : '#556'} fontSize="11" fontFamily="monospace" textAnchor="start">
                {k[i].toFixed(3)}
              </text>
              <text x={xEq} y={rowY} fill="#555" fontSize="11" fontFamily="monospace" textAnchor="start">
                =
              </text>
              <text x={xProd} y={rowY} fill={f > i || f >= n ? '#f0c040' : '#333'} fontSize="10" fontFamily="monospace" textAnchor="start" opacity={f > i || f >= n ? 1 : 0.25}>
                {products[i].toFixed(3)}
              </text>
            </g>
          );
        })}
        <text x={xQ} y={y0 + n * rh + 8} fill={showFinalSum ? '#889' : '#333'} fontSize="12" fontFamily="monospace">
          Σ =
        </text>
        <text x={xProd} y={y0 + n * rh + 8} fill={showFinalSum ? '#f0c040' : 'transparent'} fontSize="12" fontFamily="monospace" fontWeight={showFinalSum ? 'bold' : 'normal'}>
          {showFinalSum ? score.toFixed(3) : ' '}
        </text>
      </svg>
      <div style={{ fontSize: '9px', color: '#778', fontFamily: 'monospace', maxWidth: '260px', lineHeight: 1.5 }}>{caption}</div>
    </div>
  );
}

/** Scaling: static — no stepping animation. */
function ToyScaleAnim({ raw, scaled, sqrtD }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '9px', color: '#456', fontFamily: 'monospace', marginBottom: '8px', lineHeight: 1.5 }}>
        Scaling: <strong style={{ color: '#668' }}>divide</strong> each raw score by √dₖ (key vector length in this toy setup: dₖ = 4).
      </div>
      <svg width={260} height={72} style={{ display: 'block' }}>
        <text x={8} y={28} fill="#f0c040" fontSize="13" fontFamily="monospace">
          {raw.toFixed(3)}
        </text>
        <text x={72} y={28} fill="#555" fontSize="16" fontFamily="monospace">
          ÷
        </text>
        <text x={92} y={28} fill="#ff9944" fontSize="13" fontFamily="monospace">
          {sqrtD.toFixed(2)}
        </text>
        <text x={142} y={28} fill="#444" fontSize="16" fontFamily="monospace">
          =
        </text>
        <text x={162} y={28} fill="#ff9944" fontSize="13" fontFamily="monospace" fontWeight="bold">
          {scaled}
        </text>
      </svg>
      <div style={{ fontSize: '9px', color: '#778', fontFamily: 'monospace', maxWidth: '270px', lineHeight: 1.55 }}>
        Raw dot product before scaling: {raw.toFixed(3)}. Divide by √dₖ = {sqrtD.toFixed(2)} so long vectors don’t blow up the score.
        {' '}
        Result: {raw.toFixed(3)} ÷ {sqrtD.toFixed(2)} = {scaled}.
      </div>
    </div>
  );
}

/** Softmax weights — static. exp(x) is the exponential function (Euler’s e≈2.718… raised to x); here x is each score minus the row max for numerical stability. */
function ToySoftmaxAnim({ rawScores, weights }) {
  const mx = Math.max(...rawScores);
  const exps = rawScores.map((s) => Math.exp(s - mx));
  const sumExp = exps.reduce((a, b) => a + b, 0);
  const n = rawScores.length;

  const barW = 34;
  const gap = 8;
  const chartW = Math.max(280, 16 + n * (barW + gap)) || 280;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '9px', color: '#556', fontFamily: 'monospace', marginBottom: '8px', lineHeight: 1.55, maxWidth: '320px' }}>
        <strong style={{ color: '#778' }}>exp</strong>
        {' '}
        means “e to that power” (same button on a scientific calculator). Softmax applies
        {' '}
        <strong style={{ color: '#778' }}>exp(score − max)</strong>
        {' '}
        to every entry in the row so all values become positive, then divides by their sum Z so the row becomes percentages.
      </div>
      <div style={{ fontSize: '9px', color: '#456', fontFamily: 'monospace', marginBottom: '8px', lineHeight: 1.5 }}>
        Softmax: subtract max, take <strong style={{ color: '#668' }}>exp</strong> of each shifted score, <strong style={{ color: '#668' }}>add</strong> for Z, then <strong style={{ color: '#668' }}>divide</strong> each exp by Z.
      </div>
      <svg width={chartW} height={124} style={{ display: 'block' }}>
        {rawScores.map((s, i) => (
          <text
            key={`rs-${i}`}
            x={8 + i * (barW + gap)}
            y={16}
            fill="#888"
            fontSize="10"
            fontFamily="monospace"
          >
            {s}
          </text>
        ))}
        {exps.map((e, i) => (
          <text
            key={`ex-${i}`}
            x={8 + i * (barW + gap)}
            y={32}
            fill="#667"
            fontSize="9"
            fontFamily="monospace"
          >
            {`exp=${e.toFixed(2)}`}
          </text>
        ))}
        <text x={8} y={50} fill="#99a" fontSize="10" fontFamily="monospace">
          Z =
          {' '}
          {sumExp.toFixed(3)}
        </text>
        {weights.map((w, i) => {
          const h = Math.min(52, Math.max(8, w * 90));
          const bx = 8 + i * (barW + gap);
          return (
            <g key={`br-${i}`}>
              <rect
                x={bx}
                y={110 - h}
                width={barW}
                height={h}
                rx={2}
                fill="#00aa88"
                fillOpacity={0.38}
                stroke="#2a6a5a"
                strokeWidth={1}
              />
              <text x={bx + barW / 2} y={118} textAnchor="middle" fill="#8aa" fontSize="8" fontFamily="monospace">
                {w.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: '9px', color: '#778', fontFamily: 'monospace', maxWidth: '300px', lineHeight: 1.55 }}>
        Each weight = exp(score−max) ÷ Z. They are always positive and sum to 1.0 so they behave like a pie chart of attention.
      </div>
    </div>
  );
}

/** α₁V₁ + α₂V₂ + … one term at a time (first two dimensions). */
function ToyWeightedSumAnim({ weights, vecs, out, toks }) {
  const n = weights.length;
  const dims = Math.min(2, vecs[0]?.length ?? 0);
  const total = n + 2;
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % total), VIS_STEP_MS);
    return () => clearInterval(id);
  }, [total]);

  const accUpTo = (dim, jMax) => weights.slice(0, jMax + 1).reduce((s, w, j) => s + w * vecs[j][dim], 0);

  const jActive = f < n ? f : n - 1;
  const acc0 = accUpTo(0, jActive);
  const acc1 = accUpTo(1, jActive);

  let caption = '';
  if (f < n) {
    caption = `Add term ${f + 1}: ${weights[f].toFixed(2)} × V["${toks[f].replace(/^Ġ/, '·')}"] — running sum (${acc0.toFixed(2)}, ${acc1.toFixed(2)}) in dims 0–1`;
  } else if (f === n) {
    caption = 'All terms stacked; full vectors have d dimensions (here only two shown).';
  } else {
    caption = `Done: output starts as [${out.slice(0, dims).map((v) => v.toFixed(3)).join(', ')} …]`;
  }

  const lh = 18;
  const baseY = 20;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '9px', color: '#456', fontFamily: 'monospace', marginBottom: '6px', lineHeight: 1.5 }}>
        Weighted sum: multiply each value row by its weight, then add coordinate-wise.
      </div>
      <svg width={290} height={baseY + n * lh + 36} style={{ display: 'block' }}>
        {weights.map((w, j) => {
          const hi = f === j;
          const past = f > j || f >= n;
          return (
            <g key={j}>
              <text x={4} y={baseY + j * lh} fill={hi ? '#5ab0a0' : past ? '#667' : '#444'} fontSize="11" fontFamily="monospace">
                {w.toFixed(2)}
              </text>
              <text x={48} y={baseY + j * lh} fill="#555" fontSize="11" fontFamily="monospace">
                ×
              </text>
              <text x={58} y={baseY + j * lh} fill={hi || past ? '#44cc88' : '#3a3a3a'} fontSize="10" fontFamily="monospace">
                [{vecs[j][0].toFixed(2)}, {vecs[j][1].toFixed(2)}]
              </text>
            </g>
          );
        })}
        <text x={4} y={baseY + n * lh + 4} fill={f >= n - 1 ? '#99a' : '#444'} fontSize="10" fontFamily="monospace">
          Σ → ({acc0.toFixed(3)}, {acc1.toFixed(3)})
        </text>
        <text x={4} y={baseY + n * lh + 22} fill={f === total - 1 ? '#44cc88' : '#455'} fontSize="11" fontFamily="monospace" fontWeight={f === total - 1 ? 'bold' : 'normal'}>
          out = [{out.slice(0, dims).map((v) => v.toFixed(3)).join(', ')}, …]
        </text>
      </svg>
      <div style={{ fontSize: '9px', color: '#778', fontFamily: 'monospace', maxWidth: '290px', lineHeight: 1.55 }}>{caption}</div>
    </div>
  );
}

function ExamplePanel({ step, tokens }) {
  const ex = step.getExample(tokens);
  if (!ex) return <div style={{ fontSize: '10px', color: '#444', fontFamily: 'monospace' }}>add tokens above to see live values</div>;

  if (step.id === 'embed') {
    return (
      <div>
        <ToyEmbeddingLookupAnim values={ex.values} />
        <div style={{ fontSize: '10px', color: '#555', marginBottom: '6px', fontFamily: 'monospace' }}>{ex.label}</div>
        <MiniBarH values={ex.values} colors={ex.color} labels={['d₀','d₁','d₂','d₃']} />
        <div style={{ fontSize: '9px', color: '#444', fontFamily: 'monospace', marginTop: '4px' }}>
          (showing first 4 of {'{d}'} dimensions)
        </div>
      </div>
    );
  }

  if (step.id === 'project') {
    return (
      <div>
        <ToyMatVecAnim />
        <div style={{ fontSize: '10px', color: '#555', marginBottom: '4px', fontFamily: 'monospace' }}>{ex.label}</div>
        <div style={{ fontSize: '9px', color: '#4488ff', marginBottom: '2px', fontFamily: 'monospace' }}>Q</div>
        <MiniBarH values={ex.q} colors="#4488ff" labels={['d₀','d₁','d₂','d₃']} maxW={248} />
        <div style={{ fontSize: '9px', color: '#ff9944', marginTop: '4px', marginBottom: '2px', fontFamily: 'monospace' }}>K</div>
        <MiniBarH values={ex.k} colors="#ff9944" labels={['d₀','d₁','d₂','d₃']} maxW={248} />
      </div>
    );
  }

  if (step.id === 'scores') {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', lineHeight: 1.9 }}>
        <ToyDotProductAnim q={ex.q} k={ex.k} score={ex.score} />
        <div style={{ marginBottom: '6px' }}>{ex.label}:</div>
        {ex.q.map((qi, i) => (
          <div key={i} style={{ color: i % 2 === 0 ? '#666' : '#555' }}>
            ({fmt(qi)} × {fmt(ex.k[i])}) = {fmt(qi * ex.k[i])}
          </div>
        ))}
        <div style={{ color: '#f0c040', marginTop: '6px', borderTop: '1px solid #222', paddingTop: '6px' }}>
          sum = {ex.score}
        </div>
      </div>
    );
  }

  if (step.id === 'scale') {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888', lineHeight: 2 }}>
        <ToyScaleAnim raw={ex.raw} scaled={ex.scaled} sqrtD={2} />
        <div>{ex.label}</div>
        <div>raw score: <span style={{ color: '#f0c040' }}>{ex.raw}</span></div>
        <div>
          scaled: <span style={{ color: '#f0c040' }}>{ex.raw}</span>
          <span style={{ color: '#555' }}> / </span>
          <span style={{ color: '#ff9944' }}>2.000</span>
          <span style={{ color: '#555' }}> = </span>
          <span style={{ color: '#ff9944' }}>{ex.scaled}</span>
        </div>
      </div>
    );
  }

  if (step.id === 'softmax') {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', lineHeight: 1.8 }}>
        <ToySoftmaxAnim rawScores={ex.rawScores} weights={ex.weights} />
        <div style={{ marginBottom: '4px' }}>{ex.label} — raw scores → weights:</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
          {ex.rawScores.map((s, i) => (
            <span key={i} style={{ color: '#f0c040' }}>{s}</span>
          ))}
          <span style={{ color: '#444' }}>→ softmax →</span>
          {ex.weights.map((w, i) => (
            <span key={i} style={{ color: '#66bbaa' }}>{w}</span>
          ))}
        </div>
        <div style={{ fontSize: '9px', color: '#555' }}>
          for tokens: {ex.toks.map(t => `"${t.replace(/^Ġ/,'·')}"`).join(', ')}
        </div>
        <div style={{ fontSize: '9px', color: '#555', marginTop: '4px' }}>
          sum of weights: {ex.weights.reduce((a, b) => a + b, 0).toFixed(3)} (≈ 1.0 ✓)
        </div>
      </div>
    );
  }

  if (step.id === 'aggregate') {
    return (
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', lineHeight: 1.8 }}>
        <ToyWeightedSumAnim weights={ex.weights} vecs={ex.vecs} out={ex.out} toks={ex.toks} />
        <div style={{ marginBottom: '6px' }}>weighted sum for token 0:</div>
        {ex.weights.map((w, j) => (
          <div key={j}>
            <span style={{ color: '#66bbaa' }}>{w}</span>
            <span style={{ color: '#555' }}> × V["</span>
            <span style={{ color: '#44cc88' }}>{ex.toks[j].replace(/^Ġ/,'·')}</span>
            <span style={{ color: '#555' }}>"] = [</span>
            <span style={{ color: '#44cc8899' }}>{ex.vecs[j].map(v => fmt(v)).join(', ')}</span>
            <span style={{ color: '#555' }}>]</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #222', paddingTop: '6px', marginTop: '6px' }}>
          <span style={{ color: '#555' }}>output[0] = [</span>
          <span style={{ color: '#44cc88' }}>{ex.out.map(v => fmt(v)).join(', ')}</span>
          <span style={{ color: '#555' }}>]</span>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AttentionDiagram({ tokens }) {
  const [activeId, setActiveId] = useState(null);
  const activeStep = STEPS.find(s => s.id === activeId);
  const displayTokens = tokens?.length >= 2 ? tokens.slice(0, 4) : ['The', 'model', 'works'];

  return (
    <div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'center', width: '100%' }}>
        <DiagramSVG active={activeId} onSelect={setActiveId} tokens={displayTokens} />

        {/* Detail panel */}
        {activeStep ? (
          <div style={{
            flex: '1 1 260px',
            minWidth: 0,
            background: '#0a0e12',
            border: `1px solid ${activeStep.color}44`,
            borderLeft: `3px solid ${activeStep.color}`,
            padding: '16px 18px',
          }}>
            {/* Step name */}
            <div style={{
              fontFamily: 'monospace', fontSize: '10px', color: activeStep.color,
              letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px',
            }}>
              {activeStep.label}
            </div>

            {/* Plain English */}
            <p style={{
              fontFamily: 'monospace', fontSize: '11.5px', color: '#99a', lineHeight: 1.75,
              marginBottom: '14px',
            }}>
              {activeStep.plain}
            </p>

            {/* Formula block */}
            <div style={{
              background: '#060a0e', border: '1px solid #1a2030',
              padding: '10px 14px', marginBottom: '12px',
            }}>
              <FormulaLine parts={activeStep.formula} />
            </div>

            {/* Example with real values */}
            <div style={{ marginBottom: '12px' }}>
              <ExamplePanel step={activeStep} tokens={displayTokens} />
            </div>

            {/* Note */}
            <div style={{
              fontFamily: 'monospace', fontSize: '10px', color: '#556',
              lineHeight: 1.6, borderTop: '1px solid #161616', paddingTop: '10px',
            }}>
              {activeStep.note}
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => setActiveId(null)}
                style={{
                  background: 'none', border: '1px solid #222', color: '#555',
                  fontFamily: 'monospace', fontSize: '10px', padding: '4px 10px', cursor: 'pointer',
                }}
              >
                close ✕
              </button>
            </div>
          </div>
        ) : (
          <div style={{
            flex: '0 1 220px',
            minWidth: '200px',
            fontFamily: 'monospace', fontSize: '11px', color: '#3a4a3a',
            lineHeight: 2, paddingTop: '36px',
            alignSelf: 'flex-start',
          }}>
            <div style={{ marginBottom: '10px', color: '#4a5a4a' }}>← each box is a step</div>
            <div style={{ marginBottom: '6px' }}>click to see:</div>
            <div style={{ color: '#4488ff' }}>  · plain English</div>
            <div style={{ color: '#f0c040' }}>  · the formula</div>
            <div style={{ color: '#44cc88' }}>  · your tokens&apos; values</div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
