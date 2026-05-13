import React from 'react';
import GlowTrigger from '../components/GlowTrigger';
import NANDGate from '../components/viz/NANDGate';
import ChipToCircuit from '../components/viz/ChipToCircuit';

export default function Layer4_Transistor({ onDrill }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'var(--bg)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          padding: '40px clamp(20px, 4vw, 48px) 56px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          maxWidth: '1080px',
          margin: '0 auto',
        }}
      >
        <div>
          <h2 style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
            Layer 4
          </h2>
          <h1 style={{ fontSize: '22px', fontFamily: 'monospace', color: 'var(--text)', marginBottom: '10px', marginTop: 0 }}>
            Transistors & NAND Gates
          </h1>
          <p style={{ fontSize: '12px', color: '#778', fontFamily: 'monospace', maxWidth: '640px', lineHeight: 1.85 }}>
            A GPU is not one magic brain — it is a <strong style={{ color: '#9aa' }}>stack of packaging</strong> around a{' '}
            <strong style={{ color: '#9aa' }}>silicon sliver</strong>, crisscrossed by <strong style={{ color: '#9aa' }}>metal wires</strong>, carved into
            bigger <strong style={{ color: '#9aa' }}>logic blocks</strong>, all the way down to <strong style={{ color: '#9aa' }}>gates</strong> that only know on or off.
            Every floating-point multiply you heard about upstairs eventually becomes patterns of those yes/no signals racing through copper.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 0.92fr)',
            gap: 'clamp(20px, 3vw, 32px)',
            alignItems: 'start',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <ChipToCircuit />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
            <NANDGate compact />

            <p
              style={{
                margin: '14px 0 0',
                paddingTop: '14px',
                borderTop: '1px solid var(--border)',
                fontSize: '10px',
                color: '#7a868e',
                fontFamily: 'monospace',
                lineHeight: 1.65,
                textAlign: 'center',
              }}
            >
              One line of math on your screen is billions of <strong style={{ color: '#8a9' }}>transistor switches</strong> flipping in a few
              nanoseconds, then billions more for the next token. Often the slow part is shuffling numbers in and out of memory, not the multiply-adds alone.
            </p>
          </div>
        </div>

        <div>
          <GlowTrigger label="WHAT IS SWITCHING THE GATE? →" onDrill={onDrill}>
            <div
              style={{
                padding: '12px 18px',
                background: '#0d1117',
                border: '1px solid #223038',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#889',
                maxWidth: '420px',
                lineHeight: 1.65,
              }}
            >
              A <span className="accent-soft-pulse" style={{ color: 'var(--glow-color)' }}>gate</span> (in the transistor sense) is opened or closed by an electric field in a thin silicon sandwich — no moving parts, just voltage on a tiny control wire. Billions of those switches are what you paid for.
            </div>
          </GlowTrigger>
        </div>
      </div>
    </div>
  );
}
