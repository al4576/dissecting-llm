import React, { useState, useEffect, useCallback } from 'react';
import { tokenize, tokenTypeOf } from '../../logic/tokenizer';

const TYPE_META = {
  'word-start':  { color: '#00ccff', label: 'word start',   desc: 'starts a new English word — shown with a leading · because the real token begins with Ġ (a space byte)' },
  'subword':     { color: '#aaaaff', label: 'subword',      desc: 'middle/end chunk of a longer word the tokenizer split apart' },
  'number':      { color: '#f0c040', label: 'number',       desc: 'a run of digits kept together as one token' },
  'punctuation': { color: '#ff7070', label: 'punctuation',  desc: 'symbols like commas or brackets, usually their own token' },
};

// Deterministic token ID (mimics vocab lookup)
function tokenId(token) {
  let h = 5381;
  for (let i = 0; i < token.length; i++) {
    h = ((h << 5) + h) ^ token.charCodeAt(i);
    h = h >>> 0;
  }
  return h % 50257;
}

function displayToken(token) {
  return token.replace(/^Ġ/, ' ·');
}

export default function TokenizerExplorer({ userPrompt, onTokensChange, onPromptTextChange }) {
  const [text, setText] = useState(userPrompt || 'The model predicts the next word.');
  const [tokens, setTokens] = useState([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (userPrompt) setText(userPrompt);
  }, [userPrompt]);

  useEffect(() => {
    const toks = tokenize(text || 'The model predicts the next word.');
    setTokens(toks);
    onTokensChange && onTokensChange(toks);
  }, [text, onTokensChange]);

  useEffect(() => {
    onPromptTextChange && onPromptTextChange(text);
  }, [text, onPromptTextChange]);

  const charRatio = text.length > 0 ? (text.length / tokens.length).toFixed(1) : '—';

  return (
    <div>
      {/* Input */}
      <div style={{ marginBottom: '16px' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
          style={{
            width: '100%',
            background: '#0d1117',
            border: '1px solid #2a2a2a',
            borderLeft: '3px solid var(--glow-color)',
            color: '#e0e0e0',
            fontFamily: 'monospace',
            fontSize: '14px',
            padding: '10px 14px',
            resize: 'vertical',
            outline: 'none',
            lineHeight: 1.5,
          }}
          placeholder="Type anything…"
        />
        <div style={{ marginTop: '6px', fontSize: '10px', color: '#555', fontFamily: 'monospace', display: 'flex', gap: '20px' }}>
          <span><span style={{ color: '#888' }}>{tokens.length}</span> tokens</span>
          <span><span style={{ color: '#888' }}>{text.length}</span> chars</span>
          <span><span style={{ color: '#888' }}>{charRatio}</span> chars / token</span>
        </div>
      </div>

      {/* Token row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '12px',
        background: '#0d1117',
        border: '1px solid #1a1a1a',
        minHeight: '60px',
      }}>
        {tokens.map((token, i) => {
          const type = tokenTypeOf(token);
          const meta = TYPE_META[type] || TYPE_META['subword'];
          const isHovered = hovered === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'default',
              }}
            >
              <div style={{
                padding: '4px 8px',
                background: isHovered ? '#1a2a2a' : '#111820',
                border: `1px solid ${isHovered ? meta.color : meta.color + '55'}`,
                borderRadius: '3px',
                color: meta.color,
                fontFamily: 'monospace',
                fontSize: '13px',
                whiteSpace: 'pre',
                transition: 'border-color 100ms, background 100ms',
              }}>
                {displayToken(token)}
              </div>
              <div style={{ fontSize: '8px', color: '#444', marginTop: '2px', fontFamily: 'monospace' }}>
                {tokenId(token)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Hover tooltip */}
      <div style={{
        marginTop: '8px',
        height: '32px',
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#888',
        transition: 'opacity 100ms',
        opacity: hovered !== null ? 1 : 0,
      }}>
        {hovered !== null && (() => {
          const tok = tokens[hovered];
          const type = tokenTypeOf(tok);
          const meta = TYPE_META[type] || TYPE_META['subword'];
          return (
            <span>
              <span style={{ color: meta.color }}>"{displayToken(tok)}"</span>
              {' '}→ token ID <span style={{ color: '#ccc' }}>{tokenId(tok)}</span>
              {' '}<span style={{ color: '#555' }}>({meta.label}: {meta.desc})</span>
            </span>
          );
        })()}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
        {Object.entries(TYPE_META).map(([type, meta]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontFamily: 'monospace' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '2px',
              background: meta.color + '33', border: `1px solid ${meta.color}`,
            }} />
            <span style={{ color: '#666' }}>{meta.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
