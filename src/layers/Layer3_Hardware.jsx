import React from 'react';
import GlowTrigger from '../components/GlowTrigger';
import GPUGrid from '../components/viz/GPUGrid';
import PowerFlow from '../components/viz/PowerFlow';

export default function Layer3_Hardware({ onDrill }) {
  /* Parent is position:absolute; height:100%. This layer must scroll its own content — do not use overflow:hidden + nested flex without minHeight:0. */
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
          padding: '48px clamp(24px, 4vw, 56px) 72px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '1120px' }}>
          <h2 style={{ fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>
            Layer 3
          </h2>
          <h1 style={{ fontSize: '24px', fontFamily: 'monospace', color: 'var(--text)', marginBottom: '14px', marginTop: 0 }}>
            Hardware Infrastructure
          </h1>
          <p style={{ fontSize: '12px', color: '#778', fontFamily: 'monospace', maxWidth: '680px', lineHeight: 1.85, marginBottom: '48px' }}>
            Training something GPT-3-sized means parking a <strong style={{ color: '#9aa' }}>warehouse of GPUs</strong> (think older
            NVIDIA V100s) on one enormous math homework problem for weeks. The drawing uses a <strong style={{ color: '#9aa' }}>newer H100-style chip</strong> so the
            picture is legible, but the lesson is unchanged: <strong style={{ color: '#9aa' }}>massive parallel arithmetic</strong>, which needs{' '}
            <strong style={{ color: '#9aa' }}>serious electricity and cooling</strong> to keep the silicon from cooking itself.
          </p>

          <div
            style={{
              display: 'grid',
              width: '100%',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
              gap: 'clamp(24px, 4vw, 48px)',
              alignItems: 'start',
              justifyItems: 'stretch',
              marginBottom: '64px',
            }}
          >
            <div style={{
              minWidth: 0,
              padding: '4px 8px 12px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            >
              <GPUGrid
                onCenterRef={() => {
                  /* center cell already glowing */
                }}
              />
              <div style={{ marginTop: '22px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <GlowTrigger label="GOING DOWN TO GATES & VOLTAGE →" onDrill={onDrill}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      background: '#0a8f78',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: '#000',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      boxShadow: '0 0 0 1px rgba(0, 200, 170, 0.35)',
                    }}
                  >
                    SM
                  </div>
                </GlowTrigger>
              </div>
            </div>

            <div style={{ minWidth: 0, padding: '4px 0 12px 8px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <PowerFlow />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
