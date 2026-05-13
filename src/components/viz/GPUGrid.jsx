import React, { useLayoutEffect, useRef } from 'react';
import { H100_SPECS } from '../../logic/hardware';

function LayerCard({ label, sublabel, children, caption }) {
  return (
    <div
      style={{
        padding: '14px 14px 12px',
        background: '#070a0e',
        border: '1px solid #1a2420',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: 0,
      }}
    >
      <div>
        <div
          style={{
            fontSize: '9px',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--glow-color)',
            fontFamily: 'monospace',
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '8px', color: '#5a6a62', fontFamily: 'monospace', marginTop: '4px', lineHeight: 1.45 }}>
            {sublabel}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>{children}</div>
      {caption && (
        <p style={{ margin: 0, fontSize: '9px', color: '#6a756f', fontFamily: 'monospace', lineHeight: 1.6 }}>
          {caption}
        </p>
      )}
    </div>
  );
}

function SvgPackage() {
  return (
    <svg width="220" height="110" viewBox="0 0 220 110" style={{ maxWidth: '100%', height: 'auto' }} aria-hidden>
      <rect x="20" y="18" width="180" height="52" rx="4" fill="#2a3238" stroke="#445056" strokeWidth="1.2" />
      <rect x="28" y="26" width="164" height="36" rx="2" fill="#1a2024" stroke="#303840" strokeWidth="0.8" />
      <text x="110" y="48" textAnchor="middle" fill="#6a7a82" fontSize="10" fontFamily="monospace">
        heat spreader &amp; lid
      </text>
      <rect x="12" y="74" width="196" height="22" rx="2" fill="#0d2818" stroke="#2a5c3e" strokeWidth="1" />
      <g fill="#c9a227" opacity="0.9">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
          <rect key={i} x={22 + i * 15} y="78" width="8" height="6" rx="1" />
        ))}
      </g>
      <text x="110" y="105" textAnchor="middle" fill="#5a7a66" fontSize="8" fontFamily="monospace">
        package pins solder to the board
      </text>
    </svg>
  );
}

function SvgDieOnSubstrate() {
  return (
    <svg width="220" height="110" viewBox="0 0 220 110" style={{ maxWidth: '100%', height: 'auto' }} aria-hidden>
      <rect x="8" y="62" width="204" height="16" rx="2" fill="#142018" stroke="#2a4034" strokeWidth="1" />
      <g stroke="#3a5048" strokeWidth="0.6" opacity="0.85">
        <line x1="20" y1="62" x2="20" y2="78" />
        <line x1="60" y1="62" x2="60" y2="78" />
        <line x1="110" y1="62" x2="110" y2="78" />
        <line x1="160" y1="62" x2="160" y2="78" />
        <line x1="200" y1="62" x2="200" y2="78" />
      </g>
      <rect x="48" y="14" width="124" height="44" rx="3" fill="#0a1210" stroke="rgba(0, 255, 204, 0.55)" strokeWidth="1.4" />
      <g stroke="#2a4540" strokeWidth="0.5" opacity="0.7">
        <line x1="58" y1="22" x2="162" y2="22" />
        <line x1="58" y1="36" x2="162" y2="36" />
        <line x1="58" y1="50" x2="162" y2="50" />
        <line x1="62" y1="18" x2="62" y2="54" />
        <line x1="90" y1="18" x2="90" y2="54" />
        <line x1="130" y1="18" x2="130" y2="54" />
        <line x1="158" y1="18" x2="158" y2="54" />
      </g>
      <text x="110" y="40" textAnchor="middle" fill="var(--glow-color)" fontSize="9" fontFamily="monospace" opacity="0.95">
        silicon die
      </text>
      <text x="110" y="102" textAnchor="middle" fill="#5a6a62" fontSize="8" fontFamily="monospace">
        tiny bumps connect die → substrate (greatly simplified)
      </text>
    </svg>
  );
}

function SvgSmGrid({ onCenterRef }) {
  const cols = 8;
  const rows = 8;
  const cell = 14;
  const gap = 3;
  const W = cols * (cell + gap) - gap;
  const H = rows * (cell + gap) - gap;
  const cr = Math.floor(rows / 2);
  const cc = Math.floor(cols / 2);
  const centerElRef = useRef(null);

  useLayoutEffect(() => {
    if (!onCenterRef || !centerElRef.current) return;
    onCenterRef(centerElRef.current, {
      x: cc * (cell + gap) + cell / 2,
      y: cr * (cell + gap) + cell / 2,
    });
  }, [onCenterRef, cc, cr, cell, gap]);

  return (
    <svg
      width={W + 24}
      height={H + 28}
      viewBox={`-12 -8 ${W + 24} ${H + 28}`}
      style={{ maxWidth: '100%', height: 'auto' }}
      aria-hidden
    >
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const x = c * (cell + gap);
          const y = r * (cell + gap);
          const isCenter = r === cr && c === cc;
          return (
            <rect
              key={`${r}-${c}`}
              ref={isCenter ? centerElRef : undefined}
              x={x}
              y={y}
              width={cell}
              height={cell}
              rx={2}
              fill={isCenter ? 'var(--glow-color)' : '#1c2420'}
              stroke={isCenter ? '#8ff' : '#2a3830'}
              strokeWidth={isCenter ? 1.2 : 0.6}
              opacity={isCenter ? 1 : 0.92}
            />
          );
        })
      )}
      <text x={W / 2} y={H + 16} textAnchor="middle" fill="#6a7a72" fontSize="8" fontFamily="monospace">
        each tile ≈ many cores 
      </text>
    </svg>
  );
}

function DieTrueScale() {
  const w = H100_SPECS.die_width_mm;
  const h = H100_SPECS.die_height_mm;
  const sm = H100_SPECS.sm_region_side_mm;

  return (
    <div
      style={{
        padding: '10px 12px',
        background: 'transparent',
        borderRadius: '3px',
        maxWidth: '100%',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <div>
          <div
            style={{
              width: `${w}mm`,
              height: `${h}mm`,
              minWidth: `${w}mm`,
              minHeight: `${h}mm`,
              boxSizing: 'border-box',
              border: '2px solid rgba(0, 255, 204, 0.8)',
              borderRadius: '3px',
              background: 'rgba(0, 255, 204, 0.07)',
              margin: '0 auto',
            }}
          />
          <div
            style={{
              fontSize: '8px',
              color: '#6a7a72',
              fontFamily: 'monospace',
              marginTop: '8px',
              lineHeight: 1.45,
              maxWidth: '160px',
              textAlign: 'center',
            }}
          >
            GH100 die ~{H100_SPECS.die_area_mm2} mm²
          </div>
        </div>
        <div>
          <div
            style={{
              width: `${sm}mm`,
              height: `${sm}mm`,
              minWidth: `${sm}mm`,
              minHeight: `${sm}mm`,
              background: 'var(--glow-color)',
              borderRadius: '2px',
              opacity: 0.92,
              margin: '0 auto',
            }}
          />
          <div
            style={{
              fontSize: '8px',
              color: '#6a7a72',
              fontFamily: 'monospace',
              marginTop: '8px',
              lineHeight: 1.45,
              maxWidth: '140px',
              textAlign: 'center',
            }}
          >
            ~one SM region (order-of-mag.)
          </div>
        </div>
      </div>
      <p
        style={{
          fontSize: '7px',
          color: '#445049',
          fontFamily: 'monospace',
          marginTop: '12px',
          marginBottom: 0,
          lineHeight: 1.55,
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        CSS <span style={{ color: '#5a6' }}>mm</span> may not match your screen — use as a rough spatial hint only.
      </p>
    </div>
  );
}

/**
 * Static layered SVGs: package → die/substrate → SM grid → approximate physical scale.
 * (No zoom animation; keeps the story readable.)
 */
export default function GPUGrid({ onCenterRef }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '0.08em' }}>
        H100-class chip — stack of layers (simplified sketches)
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '14px',
          alignItems: 'stretch',
        }}
      >
        <LayerCard
          label="1 · Package"
          sublabel="What you see on the board"
          caption="The metal lid is a heat spreader; the gold bumps are pins that carry power and signals into the rest of the computer."
        >
          <SvgPackage />
        </LayerCard>

        <LayerCard
          label="2 · Die & bumps"
          sublabel="The silicon is smaller than the package"
          caption="The dark rectangle is the silicon die — smaller than the package. Metal wiring inside is only sketched, not a real floorplan."
        >
          <SvgDieOnSubstrate />
        </LayerCard>

        <LayerCard
          label="3 · Parallel grid"
          sublabel="Teaching view: 8×8 clusters"
          caption="A CPU runs one main thread really well; a GPU runs huge batches of the same small math side by side — that is why training uses GPUs."
        >
          <SvgSmGrid onCenterRef={onCenterRef} />
        </LayerCard>

        <LayerCard
          label="4 · Rough true scale"
          sublabel="Silicon vs one SM footprint"
          caption="Billions of transistor switches hide in a few square centimeters — distances are tiny, but the watts and heat are very real."
        >
          <DieTrueScale />
        </LayerCard>
      </div>

      <div style={{ marginTop: '18px', fontSize: '10px', color: '#6a756f', fontFamily: 'monospace', lineHeight: 1.65, maxWidth: '520px' }}>
        These are <strong style={{ color: '#8a9' }}>cartoon cross-sections</strong>, not engineering drawings. They only exist to show the order: package →
        interconnect → die → repeating compute blocks.
      </div>
      <div style={{ marginTop: '6px', fontSize: '10px', color: '#666', fontFamily: 'monospace', lineHeight: 1.65, maxWidth: '520px' }}>
        “CUDA cores” and “tensor cores” are marketing nicknames for <strong style={{ color: '#7a8' }}>many parallel multiply-add lanes</strong> plus a smaller set
        tuned for the heavy patterns neural nets use.
      </div>
    </div>
  );
}
