import React, { useState, useEffect, useMemo } from 'react';

const TICK_MS = 780;

function softmaxFixed(z) {
  const m = Math.max(...z);
  const ex = z.map((x) => Math.exp(x - m));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((x) => +(x / s).toFixed(3));
}

// ─── per-step animated demos (fixed numbers) ─────────────────────────────────

function AnimBatch() {
  const rows = [
    { w: 'The', id: 18204 },
    { w: 'cat', id: 4410 },
    { w: 'sat', id: 8922 },
    { w: '·', id: 13 },
  ];
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % 6), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '9px', color: '#556', marginBottom: '8px', fontFamily: 'monospace' }}>
        Toy sentence strip — gold highlights the <em>next-token</em> target the model should predict
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-end' }}>
        {rows.map((r, i) => {
          const lit = f === i % rows.length || f >= 4;
          const target = i < rows.length - 1 ? rows[i + 1].w : '—';
          const isNext = f === i && i < rows.length - 1;
          return (
            <div
              key={i}
              style={{
                padding: '8px 10px',
                border: `1px solid ${isNext ? '#f0c040' : lit ? '#334' : '#222'}`,
                background: isNext ? '#1a1808' : '#060a0e',
                borderRadius: '3px',
                opacity: f < 4 && i > f ? 0.35 : 1,
                transition: 'opacity 200ms, border-color 200ms',
              }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: '13px', color: isNext ? '#f0c040' : '#8aa' }}>{r.w}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#555', marginTop: '4px' }}>id {r.id}</div>
              {i < rows.length - 1 ? (
                <div style={{ fontFamily: 'monospace', fontSize: '8px', color: '#446', marginTop: '4px' }}>
                  predict → <span style={{ color: '#f0c040' }}>{target}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <pre
        style={{
          margin: '12px 0 0',
          padding: '10px 12px',
          background: '#060a0e',
          border: '1px solid #1a2030',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#9aa',
          lineHeight: 1.5,
        }}
      >
        {`x = (${rows.map((r) => r.id).join(', ')})   ← slice of token indices`}
      </pre>
    </div>
  );
}

function AnimForward() {
  const labels = ['·the', 'cat', 'sat', 'UNK'];
  const logits = [1.6, 0.9, -0.2, 0.1];
  const probs = useMemo(() => softmaxFixed(logits), []);
  const [f, setF] = useState(0);
  const n = logits.length;
  const total = n + 2 + n; // logits sweep, pause, probs sweep, pause
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % total), TICK_MS);
    return () => clearInterval(id);
  }, [total]);

  let phase = 'logits';
  let idx = f;
  if (f < n) {
    phase = 'logit';
    idx = f;
  } else if (f === n) {
    phase = 'softmax';
    idx = -1;
  } else if (f < n + 1 + n) {
    phase = 'prob';
    idx = f - (n + 1);
  } else {
    phase = 'done';
    idx = -1;
  }

  const barW = 44;
  const gap = 8;
  const chartW = n * (barW + gap) + 8;

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '9px', color: '#556', marginBottom: '8px', fontFamily: 'monospace' }}>
        One vocabulary slot — <strong>logits</strong> are raw scores; <strong>softmax</strong> turns them into four probabilities that sum to 1 (fixed demo numbers)
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <svg width={chartW} height={92} style={{ display: 'block' }}>
          {logits.map((z, i) => {
            const hot = phase === 'logit' && idx === i;
            const show = phase === 'logit' ? i <= idx : true;
            return (
              <text
                key={`z-${i}`}
                x={8 + i * (barW + gap) + barW / 2}
                y={16}
                textAnchor="middle"
                fill={hot ? '#4488ff' : show ? '#668' : '#333'}
                fontSize="11"
                fontFamily="monospace"
              >
                {show || hot ? z.toFixed(1) : ''}
              </text>
            );
          })}
          {labels.map((lb, i) => (
            <text
              key={`l-${i}`}
              x={8 + i * (barW + gap) + barW / 2}
              y={30}
              textAnchor="middle"
              fill="#445"
              fontSize="8"
              fontFamily="monospace"
            >
              {lb}
            </text>
          ))}
          {probs.map((p, i) => {
            const showP = phase === 'prob' ? i <= idx : phase === 'done';
            const hot = phase === 'prob' && idx === i;
            const h = showP ? Math.max(10, p * 72) : 3;
            const bx = 8 + i * (barW + gap);
            return (
              <g key={`p-${i}`}>
                <rect
                  x={bx}
                  y={84 - h}
                  width={barW}
                  height={h}
                  rx={2}
                  fill="#4488ff"
                  fillOpacity={hot ? 0.55 : showP ? 0.35 : 0.12}
                />
                <text
                  x={bx + barW / 2}
                  y={90}
                  textAnchor="middle"
                  fill={showP ? '#8aa' : '#333'}
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {showP ? p.toFixed(2) : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {phase === 'softmax' ? (
        <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#669', marginTop: '6px' }}>
          softmax: take logits, subtract max for stability, exponentiate, divide so the four outputs behave like percentages that add to 100%
        </div>
      ) : null}
      <pre
        style={{
          margin: '10px 0 0',
          padding: '10px 12px',
          background: '#060a0e',
          border: '1px solid #1a2030',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#9aa',
          lineHeight: 1.45,
        }}
      >
        z = [{logits.map((z) => z.toFixed(1)).join(', ')}]{'  '}
        → p = [{probs.join(', ')}]
      </pre>
    </div>
  );
}

function AnimLoss() {
  const terms = [
    { name: '·the', p: 0.62, truth: 'cat' },
    { name: 'cat', p: 0.41, truth: 'sat' },
    { name: 'sat', p: 0.88, truth: '·' },
  ].map((t) => ({ ...t, nlog: -(Math.log(t.p)) }));
  const mean = +(terms.reduce((s, t) => s + t.nlog, 0) / terms.length).toFixed(3);
  const [f, setF] = useState(0);
  const total = terms.length + 1;
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % total), TICK_MS);
    return () => clearInterval(id);
  }, [total]);

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '9px', color: '#556', marginBottom: '8px', fontFamily: 'monospace' }}>
        Three word positions — <strong>loss</strong> penalizes −log(probability the model gave the true next word) — fixed demo
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '10px', lineHeight: 1.9, color: '#888' }}>
        {terms.map((t, i) => {
          const show = f >= i;
          const hot = f === i;
          return (
            <div key={i} style={{ color: hot ? '#f0c040' : show ? '#aaa' : '#333' }}>
              after &quot;{t.name}&quot; → truth &quot;{t.truth}&quot; · p = {t.p.toFixed(2)} · −log p = {show ? t.nlog.toFixed(3) : '…'}
            </div>
          );
        })}
      </div>
      <pre
        style={{
          margin: '10px 0 0',
          padding: '10px 12px',
          background: '#060a0e',
          border: '1px solid #1a2030',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#f0c040',
          lineHeight: 1.5,
        }}
      >
        {f >= terms.length ? `L = average = ${mean}  (lower is better)` : 'L = (1/3) × sum of terms above …'}
      </pre>
    </div>
  );
}

function AnimBackward() {
  const fake = [
    { name: 'W₁[0,0]', g: 0.042 },
    { name: 'W₁[0,1]', g: -0.019 },
    { name: 'b₂[3]', g: 0.008 },
  ];
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % (fake.length + 2)), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '9px', color: '#556', marginBottom: '8px', fontFamily: 'monospace' }}>
        <strong>Backprop</strong> (backward pass): a few example partial derivatives ∂L/∂weight — toy values
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '10px', lineHeight: 2 }}>
        {fake.map((r, i) => {
          const show = f > i || f >= fake.length + 1;
          const hot = f === i;
          return (
            <div key={i}>
              <span style={{ color: hot ? '#ff9944' : '#555' }}>∂L / ∂{r.name}</span>
              <span style={{ color: '#333' }}> = </span>
              <span style={{ color: show ? '#ccb' : '#333' }}>{show ? r.g.toFixed(3) : '…'}</span>
            </div>
          );
        })}
      </div>
      <pre
        style={{
          margin: '10px 0 0',
          padding: '10px 12px',
          background: '#060a0e',
          border: '1px solid #1a2030',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#9aa',
          lineHeight: 1.5,
        }}
      >
        g bundles millions of such numbers into one vector ∇_θ L (the gradient)
      </pre>
    </div>
  );
}

function AnimOptimizer() {
  const eta = 0.05;
  const theta = [0.4, -0.12, 0.33];
  const g = [0.16, -0.2, 0.04];
  const next = theta.map((t, i) => +(t - eta * g[i]).toFixed(3));
  const [f, setF] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setF((x) => (x + 1) % 5), TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '9px', color: '#556', marginBottom: '8px', fontFamily: 'monospace' }}>
        <strong>SGD</strong> (stochastic gradient descent) toy step with learning rate η = {eta}; production runs usually use Adam on the same gradient idea
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#888', lineHeight: 2 }}>
        <div style={{ opacity: f >= 0 ? 1 : 0.4 }}>
          θ<sub>old</sub> = [{theta.map((t) => t.toFixed(2)).join(', ')}]
        </div>
        <div style={{ color: f >= 1 ? '#ff9944' : '#333' }}>
          g = [{g.map((x) => x.toFixed(2)).join(', ')}]
        </div>
        <div style={{ color: f >= 2 ? '#aac' : '#333' }}>
          η·g = [{g.map((x) => (eta * x).toFixed(3)).join(', ')}]
        </div>
        <div style={{ color: f >= 3 ? '#00ffcc' : '#333' }}>
          θ<sub>new</sub> = θ<sub>old</sub> − ηg = [{next.join(', ')}]
        </div>
      </div>
      <pre
        style={{
          margin: '10px 0 0',
          padding: '10px 12px',
          background: '#060a0e',
          border: '1px solid #1a2030',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#9aa',
          lineHeight: 1.5,
        }}
      >
        {f === 4 ? '→ next minibatch, repeat billions of times' : 'θ ← θ − η · g   (schematic)'}
      </pre>
    </div>
  );
}

function StepAnim({ id }) {
  switch (id) {
    case 'batch':
      return <AnimBatch />;
    case 'forward':
      return <AnimForward />;
    case 'loss':
      return <AnimLoss />;
    case 'backward':
      return <AnimBackward />;
    case 'step':
      return <AnimOptimizer />;
    default:
      return null;
  }
}

/**
 * Vertical “boxed pipeline” for pretraining (not the inference loop in Layer 1).
 * Matches the aesthetic of AttentionDiagram: monospace, dark panels, accent borders.
 */
const STEPS = [
  {
    id: 'batch',
    title: '1 · Minibatch of text',
    color: '#6688aa',
    body: 'A minibatch is just a bite-sized chunk of the training corpus turned into integer token IDs. For every position, the model must guess the very next token — that single guessing game is the only training label.',
  },
  {
    id: 'forward',
    title: '2 · Forward pass (same stack as at test time)',
    color: '#4488ff',
    body: 'The forward pass is the “answer live” direction: embeddings and attention blocks build hidden states, then the output layer scores every word in the dictionary at each position. Those scores become probabilities after softmax.',
  },
  {
    id: 'loss',
    title: '3 · Training loss (next-token cross-entropy)',
    color: '#f0c040',
    body: 'Cross-entropy loss means “take −log(probability the model assigned to the real next token).” Confident correct guesses score almost zero; confident wrong guesses hurt a lot. Average that pain across the batch — that number is what training tries to shrink.',
  },
  {
    id: 'backward',
    title: '4 · Backward pass (automatic differentiation)',
    color: '#ff9944',
    body: 'Backpropagation walks backward through the network asking “which way should each weight wiggle to lower the loss?” It produces gradients — arrows in weight space pointing downhill on the loss surface.',
  },
  {
    id: 'step',
    title: '5 · Parameter update (optimizer)',
    color: '#00ffcc',
    body: 'An optimizer (Adam in real life, plain SGD in cartoons) nudges every weight a tiny step opposite the gradient, grabs a fresh minibatch, and repeats for trillions of tokens. Same story even though production tricks add momentum and adaptive step sizes.',
  },
];

function ArrowDown() {
  return (
    <div
      style={{
        textAlign: 'center',
        color: '#334',
        fontFamily: 'monospace',
        fontSize: '18px',
        lineHeight: 1,
        padding: '4px 0',
      }}
    >
      ↓
    </div>
  );
}

export default function PretrainLoopDiagram() {
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#445',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        Pretraining loop (not the chat-time inference loop) — animated with toy numbers
      </div>

      {STEPS.map((step, i) => (
        <React.Fragment key={step.id}>
          {i > 0 ? <ArrowDown /> : null}
          <div
            style={{
              width: '100%',
              border: `1px solid ${step.color}44`,
              borderLeft: `3px solid ${step.color}`,
              background: '#0a0e12',
              padding: '16px 18px',
              borderRadius: '2px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: step.color,
                letterSpacing: '0.1em',
                marginBottom: '10px',
              }}
            >
              {step.title}
            </div>
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '11.5px',
                color: '#9aa',
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              {step.body}
            </p>
            <StepAnim id={step.id} />
            <pre
              style={{
                margin: '12px 0 0',
                padding: '11px 14px',
                background: '#060a0e',
                border: '1px solid #1a2030',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#7a8a88',
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
              }}
            >
              {step.id === 'batch' && 'sequence x of token IDs · each step predicts the next symbol in the batch'}
              {step.id === 'forward' && 'p_θ(·|context) = softmax(z)   — probabilities must sum to 1'}
              {step.id === 'loss' && 'L(θ) = − (1/T) Σ_t log p_θ(x_{t+1} | x_{≤t})   cross-entropy'}
              {step.id === 'backward' && 'g = ∇_θ L   automatic differentiation through every op'}
              {step.id === 'step' && 'θ ← θ − η·g (SGD sketch) · Adam adds momentum & per-param scaling'}
            </pre>
          </div>
        </React.Fragment>
      ))}

      <div
        style={{
          marginTop: '16px',
          padding: '12px 16px',
          border: '1px dashed #2a3530',
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#556',
          lineHeight: 1.7,
          textAlign: 'center',
          maxWidth: '480px',
        }}
      >
        This loop repeats across the whole pretraining pile (hundreds of billions to trillions of tokens).
        Nothing is labeled “grammar class” or “facts class” — the only teacher signal is{' '}
        <span style={{ color: '#889' }}>the next real token in human text</span>.
        Statistical regularities in that text get squeezed into the weight variables θ.
      </div>
    </div>
  );
}
