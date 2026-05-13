import React, { useState } from 'react';

export default function PhilosophyFrame({ thinker, title, body }) {
  const [collapsed, setCollapsed] = useState(false);

  const panelStyle = {
    position: 'fixed',
    right: 0,
    top: 0,
    bottom: 0,
    width: collapsed ? '40px' : '280px',
    background: 'var(--surface)',
    borderLeft: '1px solid var(--border)',
    zIndex: 1000,
    transition: 'width 200ms ease',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const toggleStyle = {
    background: 'none',
    border: 'none',
    color: 'var(--glow-color)',
    cursor: 'pointer',
    fontSize: '10px',
    letterSpacing: '0.1em',
    padding: '12px 8px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    writingMode: collapsed ? 'vertical-rl' : 'horizontal-tb',
    alignSelf: collapsed ? 'center' : 'flex-end',
    flexShrink: 0,
  };

  const contentStyle = {
    padding: '16px',
    opacity: collapsed ? 0 : 1,
    transition: 'opacity 150ms ease',
    overflowY: 'auto',
    flex: 1,
    pointerEvents: collapsed ? 'none' : 'auto',
  };

  const thinkerStyle = {
    fontSize: '10px',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--glow-color)',
    marginBottom: '6px',
  };

  const titleStyle = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'var(--text)',
    marginBottom: '10px',
    lineHeight: 1.4,
  };

  const bodyStyle = {
    fontSize: '11px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  };

  return (
    <div style={panelStyle}>
      <button className="accent-soft-pulse" style={toggleStyle} onClick={() => setCollapsed(c => !c)}>
        {collapsed ? 'THEORY' : 'THEORY ↑'}
      </button>
      <div style={contentStyle}>
        {thinker && <div className="accent-soft-pulse" style={thinkerStyle}>{thinker}</div>}
        {title && <div style={titleStyle}>{title}</div>}
        {body && <div style={bodyStyle}>{body}</div>}
      </div>
    </div>
  );
}
