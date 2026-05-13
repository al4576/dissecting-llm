import React from 'react';
import GlowTrigger from '../components/GlowTrigger';
import DatasetPie from '../components/viz/DatasetPie';
import DatasetScale from '../components/viz/DatasetScale';
import PretrainLoopDiagram from '../components/viz/PretrainLoopDiagram';

export default function Layer2_Dataset({ onDrill }) {
  const containerStyle = {
    display: 'flex',
    width: '100%',
    height: '100%',
    background: 'var(--bg)',
    paddingRight: '0',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'clamp(28px, 4vw, 48px) clamp(20px, 4vw, 56px) 72px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'clamp(36px, 5vw, 52px)',
      }}>
        <header style={{ width: '100%', maxWidth: '680px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '12px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#888', marginBottom: '10px' }}>
            Layer 2
          </h2>
          <h1 style={{ fontSize: 'clamp(22px, 2.4vw, 28px)', fontFamily: 'monospace', color: 'var(--text)', marginBottom: '14px', lineHeight: 1.25 }}>
            Training Data Composition
          </h1>
          <p style={{ fontSize: '12.5px', color: '#777', fontFamily: 'monospace', lineHeight: 1.85, margin: '0 auto' }}>
            <strong style={{ color: '#9aa', fontWeight: 'normal' }}>Weights</strong> in a big model are mostly memories of text — for a
            GPT-3–class setup, Brown et al. (2020) fed on the order of{' '}
            <strong style={{ color: '#9aa' }}>300 billion</strong>
            {' '}
            tokens (pieces of words and punctuation scraped and filtered from the web and books). Newer flagships train on trillions.
            This page shows where that reading list came from (Table 2 in the same paper).
          </p>
        </header>

        <section style={{ width: '100%', maxWidth: '720px', textAlign: 'left' }}>
          <h2 style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: 'var(--glow-color)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}>
            Why pretraining matters
          </h2>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#889', lineHeight: 1.85, marginBottom: '14px' }}>
            <strong style={{ color: '#aab', fontWeight: 'normal' }}>Pretraining</strong> is homework at internet scale: show the model
            sentence after sentence and only ask “what token comes next?” No separate spelling tests — just that{' '}
            <em>next-token</em> guessing game. After enough billion-turns, the network’s knobs (weights) pick up grammar, some facts, and
            the rhythm of human writing, because anything that lowers prediction error gets rewarded by{' '}
            <strong style={{ color: '#aab', fontWeight: 'normal' }}>gradient descent</strong> (automatic nudging of each knob).
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#778', lineHeight: 1.85, margin: 0 }}>
            The pie and bar chart are <strong style={{ color: '#99a', fontWeight: 'normal' }}>which websites and books dominated that reading list</strong>.
            The staircase diagram after them is <strong style={{ color: '#99a', fontWeight: 'normal' }}>how guesses turn into knob tweaks</strong> — the
            training loop (forward + backward), different from the one-pass “just answer the user” run you saw in Layer 1.
          </p>
        </section>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
          gap: 'clamp(40px, 6vw, 72px)',
          alignItems: 'start',
          justifyItems: 'center',
          width: '100%',
          maxWidth: '1080px',
        }}>
          <DatasetPie
            onCommonCrawlRef={() => {}}
          />
          <DatasetScale />
        </div>

        <div style={{
          width: '100%',
          maxWidth: '920px',
          padding: 'clamp(28px, 4vw, 40px) clamp(16px, 3vw, 28px)',
          background: 'linear-gradient(180deg, #080a0c 0%, #0c100f 100%)',
          border: '1px solid #1a2220',
          borderRadius: '2px',
          boxSizing: 'border-box',
        }}>
          <h2 style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#667',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: '8px',
            textAlign: 'center',
          }}>
            From tokens to weight updates
          </h2>
          <PretrainLoopDiagram />
        </div>

        <div style={{
          width: '100%',
          maxWidth: '1080px',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '8px',
        }}>
          <GlowTrigger label="SCRAPED FROM HUMAN WRITING, WITHOUT ASKING →" onDrill={onDrill}>
            <div style={{
              padding: '16px 28px',
              background: '#0d1117',
              border: '1px solid #252b33',
              fontFamily: 'monospace',
              fontSize: '12px',
              maxWidth: '420px',
            }}>
              <div style={{ color: 'var(--glow-color)', fontSize: '20px', fontWeight: 'bold' }}>60%</div>
              <div style={{ color: '#8a9', marginTop: '6px', lineHeight: 1.5 }}>Open-web scrape, quality-filtered — Common Crawl (filtered)</div>
              <div style={{ color: '#555', fontSize: '10px', marginTop: '8px', letterSpacing: '0.04em' }}>410,000,000,000 tokens</div>
            </div>
          </GlowTrigger>
        </div>
      </div>
    </div>
  );
}
