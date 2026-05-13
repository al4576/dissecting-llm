import React from 'react';
import { DiagramSwitchBulb, DiagramTinySwitches, DiagramQuestionToAnswer } from '../components/viz/PhysicsSimpleDiagrams';

export default function Layer5_Physics({ onReturnToSurface }) {
  const p = {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#899',
    lineHeight: 1.85,
    maxWidth: '640px',
  };

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px clamp(20px, 4vw, 40px) 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          maxWidth: '920px',
          margin: '0 auto',
        }}
      >
        <div>
          <h2 style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>
            Layer 5 — Bottom
          </h2>
          <h1 style={{ fontSize: '22px', fontFamily: 'monospace', color: 'var(--text)', marginBottom: '12px', marginTop: 0 }}>
            Physics (the simple version)
          </h1>
          <p style={{ ...p, marginTop: 0 }}>
            Imagine a wall full of light switches. Each switch can only be <strong style={{ color: 'var(--glow-color)' }}>up</strong> or{' '}
            <strong style={{ color: '#8a9' }}>down</strong>. There is no “almost up.” A computer chip is like that, except the switches are
            so small you need a microscope to even start to see them, and there are billions or trillions of them packed together.
          </p>
          <p style={p}>
            When people say “zeros and ones,” they mean “this wire is getting a little push of electricity” (a one) or “this wire is not getting
            that push” (a zero). The little gates you saw on the previous page are just fancy ways of connecting those on/off wires so that
            the right lights turn on at the right time. <strong style={{ color: '#aab' }}>Heat</strong> is what happens when those switches
            flip back and forth billions of times; <strong style={{ color: '#aab' }}>cooling</strong> is the building trying not to melt the
            sandwich of silicon and metal.
          </p>
          <p style={p}>
            You do <em>not</em> need band diagrams or fancy graphs to get the gist: it’s <strong style={{ color: '#aab' }}>electricity</strong>{' '}
            moving or not moving through <strong style={{ color: '#aab' }}>tiny paths</strong>, over and over, stupidly fast. The “smart”
            part is how we arranged the paths—not magic sand.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: 'clamp(20px, 3vw, 28px)',
            alignItems: 'start',
            padding: '20px 18px',
            background: '#080a0c',
            border: '1px solid #1a2228',
            borderRadius: '4px',
          }}
        >
          <DiagramSwitchBulb />
          <DiagramTinySwitches />
          <DiagramQuestionToAnswer />
        </div>

        <div
          style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            color: '#888',
            lineHeight: 2.05,
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
            maxWidth: '600px',
          }}
        >
          <div style={{ color: '#bbb', marginBottom: '10px' }}>The intelligence you spoke to is still:</div>
          <div>— those on/off switches, not a tiny person in the box</div>
          <div>— in pieces of silicon etched and doped so the paths work</div>
          <div>— built in factories with process names like “4 nm” (meaning: absurdly small features)</div>
          <div>— kept cool with huge amounts of water and power at data-center scale</div>
          <div>— trained on staggering piles of text so the math tends to sound human</div>
          <div>— tuned for a long time before you ever typed a prompt</div>
          <div>— running in buildings that draw neighborhood-scale electricity</div>
          <div>— all so you could ask it something.</div>
        </div>

        <p style={{ ...p, fontSize: '11px', color: '#666', margin: 0, paddingTop: '4px' }}>
          If you want equations later: the same stuff obeys Ohm’s law (<em>V = IR</em>) and deep quantum rules...
        </p>

        <div style={{ paddingTop: '8px', paddingBottom: '32px' }}>
          <button
            type="button"
            onClick={onReturnToSurface}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontFamily: 'monospace',
              fontSize: '11px',
              padding: '8px 16px',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'border-color 150ms, color 150ms',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--glow-color)';
              e.target.style.color = 'var(--glow-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.color = 'var(--text-muted)';
            }}
          >
            ↑ Return to surface
          </button>
        </div>
      </div>
    </div>
  );
}
