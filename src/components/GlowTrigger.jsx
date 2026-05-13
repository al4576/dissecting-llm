import React from 'react';

export default function GlowTrigger({ children, label, onDrill }) {
  const style = {
    display: 'inline-block',
    cursor: 'pointer',
    borderRadius: '4px',
    position: 'relative',
  };

  const labelStyle = {
    display: 'block',
    marginTop: '8px',
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--glow-color)',
    textAlign: 'center',
    userSelect: 'none',
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="glow-trigger-pulse" style={style} onClick={(e) => onDrill && onDrill(e)}>
        {children}
      </div>
      {label && <span className="accent-soft-pulse" style={labelStyle}>{label}</span>}
    </div>
  );
}
