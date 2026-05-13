import React, { useEffect, useRef, useState } from 'react';

// Pre-computed 2D positions approximating a UMAP projection of word2vec embeddings.
// Coordinates are in [-1, 1]. Semantic clusters are spatially grouped.
const WORDS = [
  // Royalty — upper center-left
  { word: 'king',     x: -0.46, y:  0.72, cat: 'royalty' },
  { word: 'queen',    x: -0.26, y:  0.80, cat: 'royalty' },
  { word: 'prince',   x: -0.40, y:  0.60, cat: 'royalty' },
  { word: 'princess', x: -0.22, y:  0.68, cat: 'royalty' },
  { word: 'throne',   x: -0.34, y:  0.76, cat: 'royalty' },

  // People — center-left
  { word: 'man',      x: -0.30, y:  0.46, cat: 'person' },
  { word: 'woman',    x: -0.10, y:  0.50, cat: 'person' },
  { word: 'boy',      x: -0.34, y:  0.34, cat: 'person' },
  { word: 'girl',     x: -0.14, y:  0.36, cat: 'person' },
  { word: 'father',   x: -0.50, y:  0.42, cat: 'person' },
  { word: 'mother',   x: -0.28, y:  0.56, cat: 'person' },
  { word: 'child',    x: -0.22, y:  0.28, cat: 'person' },

  // Animals — right
  { word: 'cat',      x:  0.62, y: -0.30, cat: 'animal' },
  { word: 'dog',      x:  0.70, y: -0.15, cat: 'animal' },
  { word: 'fish',     x:  0.80, y: -0.42, cat: 'animal' },
  { word: 'bird',     x:  0.55, y: -0.48, cat: 'animal' },
  { word: 'lion',     x:  0.65, y: -0.05, cat: 'animal' },
  { word: 'horse',    x:  0.72, y:  0.06, cat: 'animal' },
  { word: 'wolf',     x:  0.60, y:  0.12, cat: 'animal' },
  { word: 'bear',     x:  0.76, y: -0.26, cat: 'animal' },

  // Nature — upper right
  { word: 'river',    x:  0.40, y:  0.66, cat: 'nature' },
  { word: 'mountain', x:  0.55, y:  0.74, cat: 'nature' },
  { word: 'ocean',    x:  0.48, y:  0.58, cat: 'nature' },
  { word: 'forest',   x:  0.64, y:  0.62, cat: 'nature' },
  { word: 'sun',      x:  0.30, y:  0.80, cat: 'nature' },
  { word: 'moon',     x:  0.20, y:  0.76, cat: 'nature' },
  { word: 'star',     x:  0.10, y:  0.82, cat: 'nature' },
  { word: 'cloud',    x:  0.24, y:  0.68, cat: 'nature' },

  // Tech / ML — lower left
  { word: 'computer', x: -0.68, y: -0.52, cat: 'tech' },
  { word: 'data',     x: -0.72, y: -0.36, cat: 'tech' },
  { word: 'code',     x: -0.60, y: -0.44, cat: 'tech' },
  { word: 'network',  x: -0.54, y: -0.56, cat: 'tech' },
  { word: 'model',    x: -0.62, y: -0.28, cat: 'tech' },
  { word: 'token',    x: -0.76, y: -0.20, cat: 'tech' },
  { word: 'vector',   x: -0.80, y: -0.40, cat: 'tech' },
  { word: 'matrix',   x: -0.82, y: -0.50, cat: 'tech' },
  { word: 'weight',   x: -0.74, y: -0.60, cat: 'tech' },

  // Emotions — center
  { word: 'happy',    x: -0.06, y:  0.12, cat: 'emotion' },
  { word: 'sad',      x: -0.18, y:  0.06, cat: 'emotion' },
  { word: 'angry',    x: -0.24, y: -0.06, cat: 'emotion' },
  { word: 'fear',     x: -0.16, y: -0.10, cat: 'emotion' },
  { word: 'love',     x:  0.06, y:  0.18, cat: 'emotion' },
  { word: 'hate',     x: -0.10, y: -0.04, cat: 'emotion' },
  { word: 'joy',      x:  0.04, y:  0.10, cat: 'emotion' },
  { word: 'grief',    x: -0.12, y:  0.14, cat: 'emotion' },

  // Actions — lower center
  { word: 'run',      x:  0.10, y: -0.52, cat: 'action' },
  { word: 'walk',     x:  0.04, y: -0.40, cat: 'action' },
  { word: 'jump',     x:  0.18, y: -0.46, cat: 'action' },
  { word: 'fly',      x:  0.24, y: -0.58, cat: 'action' },
  { word: 'swim',     x:  0.30, y: -0.44, cat: 'action' },
  { word: 'eat',      x: -0.02, y: -0.44, cat: 'action' },
  { word: 'sleep',    x: -0.06, y: -0.56, cat: 'action' },
  { word: 'think',    x: -0.20, y: -0.24, cat: 'action' },
  { word: 'speak',    x: -0.10, y: -0.30, cat: 'action' },

  // Abstract — lower left of center
  { word: 'time',     x: -0.34, y: -0.20, cat: 'abstract' },
  { word: 'space',    x: -0.28, y: -0.32, cat: 'abstract' },
  { word: 'power',    x: -0.40, y: -0.12, cat: 'abstract' },
  { word: 'truth',    x: -0.44, y: -0.26, cat: 'abstract' },
  { word: 'mind',     x: -0.36, y:  0.02, cat: 'abstract' },
  { word: 'life',     x: -0.20, y:  0.22, cat: 'abstract' },
  { word: 'death',    x: -0.28, y:  0.18, cat: 'abstract' },
  { word: 'freedom',  x: -0.46, y: -0.04, cat: 'abstract' },

  // Places / capitals — upper left
  { word: 'Paris',    x: -0.72, y:  0.46, cat: 'place' },
  { word: 'France',   x: -0.80, y:  0.54, cat: 'place' },
  { word: 'London',   x: -0.64, y:  0.56, cat: 'place' },
  { word: 'England',  x: -0.70, y:  0.62, cat: 'place' },
  { word: 'Berlin',   x: -0.60, y:  0.48, cat: 'place' },
  { word: 'Germany',  x: -0.66, y:  0.42, cat: 'place' },
  { word: 'Rome',     x: -0.56, y:  0.36, cat: 'place' },
  { word: 'Italy',    x: -0.62, y:  0.30, cat: 'place' },
];

const CAT_COLORS = {
  royalty:  '#f0c040',
  person:   '#ffa040',
  animal:   '#44ff88',
  nature:   '#44ddff',
  tech:     '#aa88ff',
  emotion:  '#ff6688',
  action:   '#ff9966',
  abstract: '#88aacc',
  place:    '#ffdd66',
};

const CAT_LABELS = {
  royalty: 'royalty', person: 'people', animal: 'animals',
  nature: 'nature', tech: 'tech/ML', emotion: 'emotions',
  action: 'actions', abstract: 'abstract', place: 'places',
};

function nearest(targetX, targetY, exclude = [], k = 5) {
  return WORDS
    .filter(w => !exclude.includes(w.word))
    .map(w => ({ ...w, d: Math.sqrt((w.x - targetX) ** 2 + (w.y - targetY) ** 2) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
}

// The classic analogy: king - man + woman ≈ queen
const ANALOGY = {
  a: 'king', b: 'man', c: 'woman', result: 'queen',
  steps: [
    { label: 'king',          color: '#f0c040' },
    { label: '− man',         color: '#ff6688' },
    { label: '+ woman',       color: '#44ccff' },
    { label: '≈ queen',       color: '#00ffcc' },
  ],
};

export default function EmbeddingSpace() {
  const [selected, setSelected] = useState(null);
  const [neighbors, setNeighbors] = useState([]);
  const [analogyStep, setAnalogyStep] = useState(-1); // -1 = idle, 0-3 = step
  const [dimensions, setDimensions] = useState({ w: 520, h: 380 });
  const containerRef = useRef(null);

  const MARGIN = { t: 16, r: 16, b: 16, l: 16 };

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      if (w > 100) setDimensions({ w: Math.min(w, 600), h: Math.min(w * 0.72, 420) });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dimensions;
  const xScale = d => (d + 1) / 2 * (w - MARGIN.l - MARGIN.r) + MARGIN.l;
  const yScale = d => (1 - (d + 1) / 2) * (h - MARGIN.t - MARGIN.b) + MARGIN.t;

  const get = word => WORDS.find(w => w.word === word);

  function handleWordClick(word) {
    if (selected === word) {
      setSelected(null);
      setNeighbors([]);
    } else {
      setSelected(word);
      const w = get(word);
      setNeighbors(nearest(w.x, w.y, [word], 5).map(n => n.word));
    }
    setAnalogyStep(-1);
  }

  function runAnalogy() {
    setSelected(null);
    setNeighbors([]);
    setAnalogyStep(0);
    const steps = [0, 750, 1600, 2600];
    steps.forEach((delay, i) => setTimeout(() => setAnalogyStep(i), delay));
  }

  function resetAnalogy() {
    setAnalogyStep(-1);
  }

  const highlightedWords = new Set(
    analogyStep >= 0
      ? [ANALOGY.a, ANALOGY.b, ANALOGY.c, ...(analogyStep >= 3 ? [ANALOGY.result] : [])].slice(0, analogyStep + 2)
      : selected ? [selected, ...neighbors] : []
  );

  return (
    <div>
      <div ref={containerRef} style={{ position: 'relative' }}>
        <svg
          width={w} height={h}
          style={{ display: 'block', background: '#080c10', borderRadius: '2px' }}
        >
          <defs>
            <marker id="emb-arrow-minus" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#ff6688" />
            </marker>
            <marker id="emb-arrow-plus" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="#44ccff" />
            </marker>
            <marker id="emb-arrow-near" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#00ffcc" fillOpacity="0.9" />
            </marker>
          </defs>
          {/* Neighbor lines */}
          {selected && neighbors.map(nw => {
            const s = get(selected), n = get(nw);
            if (!s || !n) return null;
            return (
              <line key={nw}
                x1={xScale(s.x)} y1={yScale(s.y)}
                x2={xScale(n.x)} y2={yScale(n.y)}
                stroke='var(--glow-color)' strokeWidth={1} strokeOpacity={0.35}
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Analogy: vector walk king → (king−man) → (king−man+woman), then nearest neighbor */}
          {analogyStep >= 0 && (() => {
            const a = get(ANALOGY.a);
            const b = get(ANALOGY.b);
            const c = get(ANALOGY.c);
            if (!a || !b || !c) return null;
            const mid = { x: a.x - b.x, y: a.y - b.y };
            const res = { x: mid.x + c.x, y: mid.y + c.y };
            const q = get(ANALOGY.result);

            const ax = xScale(a.x);
            const ay = yScale(a.y);
            const mdx = xScale(mid.x);
            const mdy = yScale(mid.y);
            const rx = xScale(res.x);
            const ry = yScale(res.y);

            const labelStyle = {
              fill: '#aab',
              fontSize: '10',
              fontFamily: 'monospace',
              stroke: '#080c10',
              strokeWidth: '4',
              paintOrder: 'stroke fill',
            };

            const midLabX = (ax + mdx) / 2;
            const midLabY = (ay + mdy) / 2 - 8;
            const plusLabX = (mdx + rx) / 2;
            const plusLabY = (mdy + ry) / 2 - 8;

            return (
              <g style={{ pointerEvents: 'none' }}>
                {analogyStep >= 1 && (
                  <g>
                    <line
                      x1={ax}
                      y1={ay}
                      x2={mdx}
                      y2={mdy}
                      stroke="#ff6688"
                      strokeWidth={2}
                      strokeOpacity={0.85}
                      markerEnd="url(#emb-arrow-minus)"
                    />
                    <text x={midLabX} y={midLabY} textAnchor="middle" {...labelStyle}>
                      − man
                    </text>
                  </g>
                )}
                {analogyStep >= 2 && (
                  <g>
                    <circle cx={mdx} cy={mdy} r={5} fill="#ff6688" fillOpacity={0.85} stroke="#221018" strokeWidth={1} />
                    <text x={mdx + 8} y={mdy + 3} fill="#ffccdd" fontSize="9" fontFamily="monospace">
                      king − man
                    </text>
                    <line
                      x1={mdx}
                      y1={mdy}
                      x2={rx}
                      y2={ry}
                      stroke="#44ccff"
                      strokeWidth={2}
                      strokeOpacity={0.88}
                      markerEnd="url(#emb-arrow-plus)"
                    />
                    <text x={plusLabX} y={plusLabY} textAnchor="middle" {...labelStyle}>
                      + woman
                    </text>
                  </g>
                )}
                {analogyStep >= 3 && q && (
                  <g>
                    <line
                      x1={rx}
                      y1={ry}
                      x2={xScale(q.x)}
                      y2={yScale(q.y)}
                      stroke="var(--glow-color)"
                      strokeWidth={1.6}
                      strokeOpacity={0.55}
                      strokeDasharray="4,4"
                      markerEnd="url(#emb-arrow-near)"
                    />
                    <circle
                      cx={rx}
                      cy={ry}
                      r={7}
                      fill="var(--glow-color)"
                      fillOpacity={0.22}
                      stroke="var(--glow-color)"
                      strokeWidth={1.5}
                    />
                    <text x={rx + 9} y={ry + 4} fill="var(--glow-color)" fontSize="10" fontFamily="monospace">
                      result
                    </text>
                  </g>
                )}
              </g>
            );
          })()}

          {/* Words */}
          {WORDS.map(({ word, x, y, cat }) => {
            const px = xScale(x), py = yScale(y);
            const color = CAT_COLORS[cat] || '#888';
            const isHighlighted = highlightedWords.has(word);
            const isDimmed = highlightedWords.size > 0 && !isHighlighted;
            const isSelected = selected === word;
            const isAnalogy = [ANALOGY.a, ANALOGY.b, ANALOGY.c, ANALOGY.result].includes(word) && analogyStep >= 0;
            const r = isSelected ? 6 : isAnalogy ? 5 : 4;

            return (
              <g key={word} style={{ cursor: 'pointer' }} onClick={() => handleWordClick(word)}>
                <circle
                  cx={px} cy={py} r={r}
                  fill={color}
                  fillOpacity={isDimmed ? 0.12 : isHighlighted || isAnalogy ? 0.9 : 0.55}
                  stroke={isSelected || isAnalogy ? color : 'none'}
                  strokeWidth={1.5}
                  style={{ transition: 'fill-opacity 200ms, r 150ms' }}
                />
                {(isHighlighted || isAnalogy || isSelected) && (
                  <text
                    x={px + 7} y={py + 4}
                    fill={color}
                    fontSize="10"
                    fontFamily="monospace"
                    fillOpacity={isDimmed ? 0.15 : 0.95}
                  >
                    {word}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover overlay — show label on all dots via title trick */}
        <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
          width={w} height={h}>
          {WORDS.map(({ word, x, y, cat }) => (
            <title key={word}>{word}</title>
          ))}
        </svg>
      </div>

      {/* Controls */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={analogyStep < 0 ? runAnalogy : resetAnalogy}
          style={{
            background: 'none',
            border: `1px solid ${analogyStep >= 0 ? 'var(--glow-color)' : '#444'}`,
            color: analogyStep >= 0 ? 'var(--glow-color)' : '#888',
            fontFamily: 'monospace',
            fontSize: '11px',
            padding: '5px 12px',
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >
          {analogyStep < 0 ? '▶ animate: king − man + woman = ?' : '↺ reset analogy'}
        </button>
        <span style={{ fontSize: '10px', color: '#555', fontFamily: 'monospace' }}>
          or click any dot to see which words sit closest in embedding space
        </span>
      </div>

      {/* Analogy step labels */}
      {analogyStep >= 0 && (
        <div style={{
          marginTop: '10px', display: 'flex', gap: '8px', fontFamily: 'monospace',
          fontSize: '13px', alignItems: 'center', flexWrap: 'wrap',
        }}>
          {ANALOGY.steps.slice(0, analogyStep + 1).map((s, i) => (
            <span key={i} style={{ color: s.color, transition: 'opacity 300ms' }}>
              {s.label}
            </span>
          ))}
          {analogyStep >= 3 && (
            <span style={{ color: '#555', fontSize: '10px' }}>
              — nearest word to the computed point is <span style={{ color: 'var(--glow-color)' }}>queen</span>
            </span>
          )}
        </div>
      )}

      {/* Selected word info */}
      {selected && analogyStep < 0 && (
        <div style={{ marginTop: '10px', fontFamily: 'monospace', fontSize: '11px', color: '#888' }}>
          <span style={{ color: CAT_COLORS[get(selected)?.cat] }}>{selected}</span>
          {' '}nearest neighbors: {neighbors.map((n, i) => (
            <span key={n}>
              <span style={{ color: CAT_COLORS[get(n)?.cat] || '#aaa' }}>{n}</span>
              {i < neighbors.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}

      {/* Category legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '14px' }}>
        {Object.entries(CAT_COLORS).map(([cat, color]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
            <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#666' }}>{CAT_LABELS[cat]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
