import React, { useState, useCallback, useEffect } from 'react';
import GlowTrigger from '../components/GlowTrigger';
import TokenizerExplorer from '../components/viz/TokenizerExplorer';
import EmbeddingSpace from '../components/viz/EmbeddingSpace';
import AttentionExplorer from '../components/viz/AttentionExplorer';
import AttentionDiagram from '../components/viz/AttentionDiagram';
import SamplingExplorer from '../components/viz/SamplingExplorer';

// ─── layout primitives ────────────────────────────────────────────────────────

function SectionHeader({ number, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
      <span
        className="accent-soft-pulse"
        style={{
          fontFamily: 'monospace', fontSize: '11px', color: 'var(--glow-color)',
          letterSpacing: '0.14em', flexShrink: 0,
        }}
      >
        {String(number).padStart(2, '0')}
      </span>
      <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
      <h2 style={{
        fontFamily: 'monospace', fontSize: '16px', color: '#c8c8c8',
        letterSpacing: '0.08em', textTransform: 'uppercase', flexShrink: 0,
      }}>
        {title}
      </h2>
      <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
    </div>
  );
}

function Body({ children, style }) {
  return (
    <p style={{
      fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--body-secondary)',
      lineHeight: 1.85, marginBottom: '16px', maxWidth: '520px',
      ...style,
    }}>
      {children}
    </p>
  );
}

// Inline emphasis
const W = ({ c }) => <span style={{ color: c || '#bbb' }}>{c ? undefined : null}</span>;
function Hi({ children }) { return <span style={{ color: '#c8c8c8' }}>{children}</span>; }
function Ac({ children, ...rest }) {
  return (
    <span className="accent-soft-pulse" style={{ color: 'var(--glow-color)' }} {...rest}>
      {children}
    </span>
  );
}
function Bl({ children }) { return <span style={{ color: '#4488ff' }}>{children}</span>; }
function Or({ children }) { return <span style={{ color: '#ff9944' }}>{children}</span>; }
function Gr({ children }) { return <span style={{ color: '#44cc88' }}>{children}</span>; }

function TwoCol({ text, viz }) {
  return (
    <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', marginBottom: '12px' }}>
      <div style={{ flex: '1 1 260px', minWidth: 0 }}>{text}</div>
      <div style={{ flex: '2 1 360px', minWidth: 0 }}>{viz}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: '1px', background: '#111', margin: '52px 0' }} />;
}

// ─── main layer ───────────────────────────────────────────────────────────────

export default function Layer1_Attention({ onDrill, userPrompt }) {
  const [tokens, setTokens] = useState([]);
  const [samplingPromptText, setSamplingPromptText] = useState(userPrompt || '');
  const handleTokensChange = useCallback((t) => setTokens(t), []);

  useEffect(() => {
    if (userPrompt != null && userPrompt !== '') setSamplingPromptText(userPrompt);
  }, [userPrompt]);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', background: 'var(--bg)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '44px 44px 80px' }}>
        {/* ── Page header ── */}
        <div style={{ marginBottom: '52px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.92 }}>
            Layer 1 — Algorithms
          </div>
          <h1 style={{ fontFamily: 'monospace', fontSize: '24px', color: '#e0e0e0', marginBottom: '0', lineHeight: 1.2, maxWidth: '720px' }}>
            How language models work
          </h1>
          <p style={{ fontFamily: 'monospace', fontSize: '12.5px', color: 'var(--body-secondary)', maxWidth: '540px', lineHeight: 1.8, marginTop: '14px' }}>
            Four stops on the assembly line — <strong style={{ color: 'var(--text-muted)' }}>tokenization</strong> (text → numbers),{' '}
            <strong style={{ color: 'var(--text-muted)' }}>embeddings</strong> (numbers → little meaning lists),{' '}
            <strong style={{ color: 'var(--text-muted)' }}>attention</strong> (words peek at each other),{' '}
            <strong style={{ color: 'var(--text-muted)' }}>sampling</strong> (pick the next word). The prompt you typed in Layer 0 is what flows through below.
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 01 — TOKENIZATION                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <SectionHeader number={1} title="Tokenization" />
        <TwoCol
          text={
            <>
              <Body>
                A language model never sees letters the way you do — it only sees <Hi>integers</Hi> (whole-number IDs).
                <Ac>Tokenization</Ac> is the step that turns your typed text into a short list of <Ac>tokens</Ac>: numbered
                fragments picked from a fixed menu of about 50,000 pieces.
              </Body>
              <Body>
                GPT-2’s menu was built with <Hi>Byte-Pair Encoding (BPE)</Hi>: start from raw bytes, again and again merge the
                most common pair of neighbors into a new chunk, stop when the menu is full. After that, any string — code, emoji,
                weird Unicode — can be encoded and decoded without losing information.
              </Body>
              <div style={{
                background: '#080c0f', border: '1px solid #1a2030',
                borderLeft: '3px solid var(--glow-color)',
                padding: '12px 16px', fontFamily: 'monospace',
                fontSize: '12px', marginBottom: '16px', lineHeight: 2,
              }}>
                <span style={{ color: 'var(--text-muted)' }}>text</span>
                <span style={{ color: '#6a7580' }}> → bytes → BPE merges → </span>
                <Ac>[t₁, t₂, … tₙ]</Ac>
                <div style={{ fontSize: '10px', color: '#6a7580', marginTop: '2px' }}>
                  each tᵢ ∈ [0, 50256] — an index into the embedding matrix
                </div>
              </div>
              <Body>
                Common words like <Hi>"the"</Hi> get a single token.
                Rarer words like <Hi>"tokenization"</Hi> become subwords.
                A leading <Ac>·</Ac> marks a space-prefixed token.
                The number below each box is the token's integer ID.
              </Body>
            </>
          }
          viz={
            <TokenizerExplorer
              userPrompt={userPrompt}
              onTokensChange={handleTokensChange}
              onPromptTextChange={setSamplingPromptText}
            />
          }
        />

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 02 — EMBEDDINGS                                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <SectionHeader number={2} title="Embeddings" />
        <TwoCol
          text={
            <>
              <Body>
                Next, each integer ID is turned into a <Hi>dense vector</Hi> — a long list of decimals (often hundreds to thousands
                of them). Concretely, the model just <em>copies one row</em> out of a giant table it learned during training; that table is
                usually written <Ac title="W_E is the embedding matrix: about 50k rows (one per vocabulary piece). Your token ID picks which row to copy into a vector — no extra multiplication, just a lookup.">W_E</Ac>{' '}
                (“embedding matrix”). No fancy multiply yet — it’s a lookup.
              </Body>
              <Body>
                During training, words that show up in similar situations get nudged toward nearby spots in that high-dimensional space.
                Nobody hand-labels that <Hi>“king”</Hi> and <Hi>“queen”</Hi> belong together — the geometry falls out of predicting
                the next token on billions of sentences.
              </Body>
              <div style={{
                background: '#080c0f', border: '1px solid #1a2030',
                borderLeft: '3px solid var(--glow-color)',
                padding: '12px 16px', fontFamily: 'monospace',
                fontSize: '12px', marginBottom: '16px', lineHeight: 2,
              }}>
                <Ac>eᵢ</Ac>
                <span style={{ color: '#6a7580' }}> = </span>
                <span
                  style={{ color: 'var(--text-muted)', cursor: 'help', borderBottom: '1px dotted #456' }}
                  title="W_E = embedding matrix: one row per vocabulary entry, filled in during training. Pick row tᵢ for token i."
                >
                  W_E
                </span>
                <span style={{ color: 'var(--text-muted)' }}>[tᵢ]</span>
                <span style={{ color: '#6a7580' }}>   ∈ ℝ</span>
                <span style={{ color: 'var(--text-muted)' }}>ᵈ</span>
                <div style={{ fontSize: '10px', color: '#6a7580', marginTop: '2px' }}>
                  integer index → row lookup — no multiplication
                </div>
              </div>
              <Body>
                The scatter plot is a <Hi>2D projection</Hi> (a camera angle) on ~70 real words so your eyes can see clusters.
                Famous party trick on these vectors: <Ac>king − man + woman ≈ queen</Ac> — add and subtract the lists and the answer
                lands near the right word. Press the button to replay the animation.
              </Body>
            </>
          }
          viz={<EmbeddingSpace />}
        />

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 03 — ATTENTION                                                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <SectionHeader number={3} title="Self-Attention" />

        <Body style={{ maxWidth: '640px' }}>
          Plain embeddings have no memory of neighbors — the vector for <Hi>“bank”</Hi> looks the same for a river bank and a money
          bank until context is mixed in. <Ac>Self-attention</Ac> is the mixer: each word asks every other word “how relevant are you
          to me right now?” and folds those answers back into updated vectors.
        </Body>

        <div
          id="attention-arcs"
          style={{
            scrollMarginTop: '24px',
            width: '100%',
            maxWidth: '760px',
            margin: '0 auto 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <AttentionExplorer tokens={tokens} />
        </div>

        <div style={{
          fontFamily: 'monospace', fontSize: '11px', color: 'var(--body-secondary)',
          margin: '16px auto 0', borderLeft: '2px solid var(--glow-color)',
          lineHeight: 1.85,
          background: '#080c08',
          border: '1px solid #162016',
          padding: '12px 14px',
          maxWidth: '640px',
        }}>
          Tokens sit in a row. <Hi>Arcs</Hi> are attention weights: where the highlighted token is “looking.” Thicker means “I care more
          about that word right now.” One token starts selected so the picture isn’t empty — click others to compare who looks where.
        </div>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* 04 — SAMPLING                                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <SectionHeader number={4} title="Sampling" />
        <TwoCol
          text={
            <>
              <Body>
                The panel on the right is a <Hi>toy “brain”</Hi> for teaching: it never calls a real neural net. Hand-made rules assign
                a <Ac>score</Ac> to each possible next word using <Ac>priors</Ac>, <Ac>overlap with your text</Ac>, and a few
                <Ac>stub continuation hints</Ac> — the same <em>idea</em> as what a giant model learns, but written where you can read it.
              </Body>
              <Body>
                In production, the last layers emit <Hi>logits</Hi> (raw favor scores for every word in the dictionary), then{' '}
                <Ac>softmax</Ac> squashes them into probabilities (optionally after dividing by temperature). Here the visible{' '}
                <Hi>scores</Hi> stand in for logits so you can still rehearse the softmax and sampling knobs.
              </Body>
              <Body>
                <Hi>Temperature T</Hi> is a dial on “how decisive vs. how random.” Divide scores by T before softmax: small T makes one
                winner almost certain; big T spreads probability so rarer words can win sometimes — same math as a real model, just with
                toy scores.
              </Body>
              <div style={{
                background: '#080c0f', border: '1px solid #1a2030',
                borderLeft: '3px solid var(--glow-color)',
                padding: '12px 16px', fontFamily: 'monospace',
                fontSize: '12px', marginBottom: '16px', lineHeight: 2,
              }}>
                <Ac>P</Ac>
                <span style={{ color: '#6a7580' }}>(next | </span>
                <Bl>context</Bl>
                <span style={{ color: '#6a7580' }}>) ≈ softmax(scores / </span>
                <Or>T</Or>
                <span style={{ color: '#6a7580' }}>)</span>
                <div style={{ fontSize: '10px', color: '#6a7580', marginTop: '2px' }}>
                  here, “scores” are the visible rules; in a real LM they are logits
                </div>
              </div>
              <Body>
                The running line on the right is <Bl>your tokenized prompt plus any tokens you sample</Bl>. Each click on{' '}
                <Ac>sample</Ac> rolls the dice from the softmax bar chart and appends the winner — identical flow to real text
                generation, except the odds come from the transparent rules instead of learned logits.
              </Body>
            </>
          }
          viz={(
            <SamplingExplorer
              userPromptTokens={tokens}
              userPromptText={samplingPromptText}
            />
          )}
        />

        <Divider />

        <div
          id="attention-pipeline"
          style={{
            scrollMarginTop: '24px',
            width: '100%',
            maxWidth: '960px',
            margin: '0 auto 0',
          }}
        >
          <p style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'var(--body-secondary)',
            lineHeight: 1.85,
            textAlign: 'center',
            marginBottom: '20px',
            maxWidth: '560px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <strong style={{ color: 'var(--text-muted)' }}>Going deeper (optional):</strong>{' '}
            the same six-step attention math as a vertical cartoon. Click a box for the formulas
            and tiny worked numbers built from your tokenizer output.
          </p>
          <AttentionDiagram tokens={tokens} />
        </div>

        <Divider />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* GlowTrigger → Layer 2                                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px' }}>
          <GlowTrigger label="WHERE DID THAT TEXT COME FROM? →" onDrill={onDrill}>
            <div style={{
              padding: '14px 20px',
              background: '#080c0f',
              border: '1px solid #1a2030',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              maxWidth: '440px',
              lineHeight: 1.65,
            }}
            >
              Next: the training pile — where the internet text came from.
            </div>
          </GlowTrigger>
        </div>
      </div>
    </div>
  );
}
