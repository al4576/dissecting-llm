import React from 'react';

export default function GlowTrigger({ children, label, onDrill }) {
  const style = {
    display: 'inline-block',
    cursor: 'pointer',
    borderRadius: '4px',
    position: 'relative',
    boxShadow: '0 0 0 1px rgba(0, 255, 204, 0.22), 0 0 8px rgba(0, 255, 204, 0.08)',
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
      <div style={style} onClick={(e) => onDrill && onDrill(e)}>
        {children}
      </div>
      {label && <span style={labelStyle}>{label}</span>}
    </div>
  );
}
