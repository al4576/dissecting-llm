import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { tokenTypeOf } from '../../logic/tokenizer';

const TOKEN_COLORS = {
  'number': '#f0c040',
  'punctuation': '#ff7070',
  'word-start': '#00ccff',
  'subword': '#aaaaff',
};

// Deterministic "token ID" from token string (simulates vocab lookup)
function tokenId(token) {
  let h = 5381;
  for (let i = 0; i < token.length; i++) {
    h = ((h << 5) + h) ^ token.charCodeAt(i);
    h = h >>> 0;
  }
  return h % 50257;
}

export default function TokenStream({ tokens }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!tokens || tokens.length === 0) return;
    const el = ref.current;
    d3.select(el).selectAll('*').remove();

    const boxH = 44;
    const idH = 16;
    const margin = { top: 16, left: 8, bottom: 8 };
    const gap = 6;

    const widths = tokens.map(t => Math.max(40, t.length * 9 + 16));
    const totalW = widths.reduce((a, b) => a + b + gap, 0) + margin.left;

    const svg = d3.select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('height', boxH + idH + margin.top + margin.bottom)
      .style('overflow-x', 'auto');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    let x = 0;
    tokens.forEach((token, i) => {
      const w = widths[i];
      const color = TOKEN_COLORS[tokenTypeOf(token)] || '#aaa';
      const id = tokenId(token);

      const cell = g.append('g')
        .attr('transform', `translate(${x},0)`)
        .style('opacity', 0);

      cell.append('rect')
        .attr('width', w)
        .attr('height', boxH)
        .attr('rx', 3)
        .attr('fill', '#1a1a2e')
        .attr('stroke', color)
        .attr('stroke-width', 1.5);

      cell.append('text')
        .attr('x', w / 2)
        .attr('y', boxH / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .attr('font-size', '12px')
        .attr('font-family', 'monospace')
        .text(token.replace(/^Ġ/, '·'));

      cell.append('text')
        .attr('x', w / 2)
        .attr('y', boxH + idH - 2)
        .attr('text-anchor', 'middle')
        .attr('fill', '#555')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(id);

      cell.transition()
        .delay(i * 60)
        .duration(200)
        .style('opacity', 1);

      x += w + gap;
    });
  }, [tokens]);

  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.1em' }}>
        TOKEN STREAM — {tokens?.length ?? 0} tokens
      </div>
      <div ref={ref} style={{ overflowX: 'auto', paddingBottom: '4px' }} />
    </div>
  );
}
