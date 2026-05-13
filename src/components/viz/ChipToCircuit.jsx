import React from 'react';

const ACCENT = '#00ffcc';
const WIRE = '#4a6a88';

function LayerCard({ label, caption, children }) {
  return (
    <div
      style={{
        padding: '14px 12px 12px',
        background: '#070a0e',
        border: '1px solid #1a2420',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: 0,
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontSize: '9px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: ACCENT,
          fontFamily: 'monospace',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{children}</div>
      <p style={{ margin: 0, fontSize: '10px', color: '#7a8a84', fontFamily: 'monospace', lineHeight: 1.45 }}>{caption}</p>
    </div>
  );
}

function SvgPackage() {
  return (
    <svg width="100%" height="auto" viewBox="0 0 200 108" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '320px', display: 'block' }} aria-hidden>
      <rect x="32" y="12" width="136" height="56" rx="3" fill="#121820" stroke="#2a3a48" strokeWidth="1.2" />
      <rect x="40" y="20" width="120" height="40" rx="2" fill="#0d1018" stroke="#223038" strokeWidth="0.8" />
      <text x="100" y="46" textAnchor="middle" fill="#667" fontSize="9" fontFamily="monospace">
        die under lid
      </text>
      <rect x="12" y="72" width="176" height="18" rx="2" fill="#0a1810" stroke="#1a3028" strokeWidth="0.9" />
      <g fill="#4a5560">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <rect key={i} x={20 + i * 18} y="76" width="7" height="10" rx="1" />
        ))}
      </g>
    </svg>
  );
}

function SvgMetalDie() {
  return (
    <svg width="100%" height="auto" viewBox="0 0 200 108" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '320px', display: 'block' }} aria-hidden>
      <rect x="32" y="10" width="136" height="58" rx="3" fill="#121820" stroke="#2a3a48" strokeWidth="1" />
      <rect x="44" y="18" width="112" height="44" rx="2" fill="#0a1418" stroke={ACCENT} strokeOpacity={0.3} strokeWidth="0.9" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="50" y1={24 + i * 8} x2="150" y2={24 + i * 8} stroke={WIRE} strokeWidth="0.9" strokeOpacity={0.75} />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`v${i}`} x1={50 + i * 20} y1="22" x2={50 + i * 20} y2="58" stroke={WIRE} strokeWidth="0.6" strokeOpacity={0.35} />
      ))}
      <text x="100" y="8" textAnchor="middle" fill={ACCENT} fontSize="7" fontFamily="monospace" opacity={0.85}>
        metal wires
      </text>
    </svg>
  );
}

function SvgBlocks() {
  const blocks = [
    { x: 38, y: 18, w: 44, h: 28, lab: 'math' },
    { x: 86, y: 18, w: 40, h: 28, lab: 'SRAM' },
    { x: 130, y: 18, w: 36, h: 28, lab: 'ctrl' },
    { x: 38, y: 50, w: 86, h: 30, lab: 'tensor' },
    { x: 128, y: 50, w: 38, h: 30, lab: 'I/O' },
  ];
  return (
    <svg width="100%" height="auto" viewBox="0 0 200 108" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '320px', display: 'block' }} aria-hidden>
      <rect x="32" y="10" width="136" height="78" rx="3" fill="#121820" stroke="#2a3a48" strokeWidth="1" />
      <rect x="36" y="14" width="128" height="70" rx="2" fill="#0c1018" stroke="#283038" strokeWidth="0.7" />
      {blocks.map((b) => (
        <g key={b.lab}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="2" fill="#151c24" stroke="#334455" strokeWidth="0.7" />
          <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 3} textAnchor="middle" fill="#667" fontSize="7" fontFamily="monospace">
            {b.lab}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SvgMockLogicCircuit() {
  const wire = '#4a7a72';
  const hi = 'var(--glow-color)';
  return (
    <svg width="100%" height="auto" viewBox="0 0 260 108" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', maxWidth: '320px', display: 'block' }} aria-hidden>
      <text x="8" y="30" fill="#6a7a72" fontSize="8" fontFamily="monospace">
        A
      </text>
      <text x="8" y="78" fill="#6a7a72" fontSize="8" fontFamily="monospace">
        B
      </text>
      <path d="M 18 26 H 42 M 18 74 H 46" stroke={wire} strokeWidth="1.2" fill="none" />
      <rect x="42" y="14" width="36" height="28" rx="3" fill="#101820" stroke={hi} strokeWidth="0.9" strokeOpacity={0.65} />
      <text x="60" y="32" textAnchor="middle" fill="#8aa" fontSize="8" fontFamily="monospace">
        NOT
      </text>
      <path d="M 78 28 H 88 V 46 H 96" stroke={wire} strokeWidth="1.2" fill="none" />
      <path d="M 18 74 H 88 V 66 H 96" stroke={wire} strokeWidth="1.2" fill="none" />
      <rect x="96" y="38" width="44" height="34" rx="3" fill="#101820" stroke={hi} strokeWidth="0.9" strokeOpacity={0.65} />
      <text x="118" y="58" textAnchor="middle" fill="#8aa" fontSize="8" fontFamily="monospace">
        AND
      </text>
      <path d="M 140 55 H 152" stroke={wire} strokeWidth="1.2" fill="none" />
      <rect x="152" y="38" width="40" height="34" rx="3" fill="#101820" stroke={hi} strokeWidth="0.9" strokeOpacity={0.65} />
      <text x="172" y="58" textAnchor="middle" fill="#8aa" fontSize="8" fontFamily="monospace">
        OR
      </text>
      <path d="M 192 55 H 212" stroke={wire} strokeWidth="1.2" fill="none" />
      <text x="218" y="58" fill={hi} fontSize="8" fontFamily="monospace">
        OUT
      </text>
      <text x="130" y="100" textAnchor="middle" fill="#556" fontSize="7" fontFamily="monospace">
        cartoon wiring — real chips are vastly denser
      </text>
    </svg>
  );
}

/** Static stack of sketches: package → metal → blocks → gates (no autoplay animation). */
export default function ChipToCircuit() {
  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.1em' }}>
        FROM CHIP PACKAGE TO LOGIC GATES
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(2, auto)',
          gap: '12px',
          width: '100%',
        }}
      >
        <LayerCard
          label="1 · Package"
          caption="Plastic/metal shell: the lid plus pins that plug the silicon into the motherboard."
        >
          <SvgPackage />
        </LayerCard>
        <LayerCard
          label="2 · Silicon + metal"
          caption="Metal layers on the wafer: think of them as tiny copper streets carrying 0/1 as voltage."
        >
          <SvgMetalDie />
        </LayerCard>
        <LayerCard
          label="3 · Logic blocks"
          caption="Floorplan blocks (memory, math, control) — a cartoon map, not a real mask layout."
        >
          <SvgBlocks />
        </LayerCard>
        <LayerCard
          label="4 · Gates"
          caption="Toy logic: NOT / AND / OR gates. Real chips chain enormous networks built from the same idea."
        >
          <SvgMockLogicCircuit />
        </LayerCard>
      </div>
    </div>
  );
}
