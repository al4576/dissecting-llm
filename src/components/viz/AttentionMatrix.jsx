import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function AttentionMatrix({ tokens, weights, onMaxCell }) {
  const ref = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!weights || weights.length === 0) return;
    const el = ref.current;
    d3.select(el).selectAll('*').remove();

    const n = tokens.length;
    const cellSize = Math.min(40, Math.max(18, Math.floor(360 / n)));
    const labelW = 70;
    const labelH = 70;
    const margin = { top: labelH, left: labelW, bottom: 8, right: 8 };
    const W = n * cellSize + margin.left + margin.right;
    const H = n * cellSize + margin.top + margin.bottom;

    const svg = d3.select(el)
      .append('svg')
      .attr('width', W)
      .attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, 1]);

    // Find max cell
    let maxVal = -1, maxI = 0, maxJ = 0;
    weights.forEach((row, i) => {
      row.forEach((w, j) => {
        if (w > maxVal) { maxVal = w; maxI = i; maxJ = j; }
      });
    });
    onMaxCell && onMaxCell({ i: maxI, j: maxJ });

    // Render cells with row-by-row stagger
    weights.forEach((row, i) => {
      row.forEach((w, j) => {
        const cell = g.append('rect')
          .attr('x', j * cellSize)
          .attr('y', i * cellSize)
          .attr('width', cellSize)
          .attr('height', cellSize)
          .attr('fill', '#0a0a0a')
          .attr('stroke', '#222')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer');

        cell.transition()
          .delay(i * 20 + j * 3)
          .duration(150)
          .attr('fill', color(w));

        cell.on('mouseover', (event) => {
          d3.select(event.currentTarget).attr('stroke', 'var(--glow-color)').attr('stroke-width', 2);
          setTooltip({
            x: event.clientX,
            y: event.clientY,
            text: `'${tokens[i]}' → '${tokens[j]}': ${w.toFixed(3)}`,
          });
        }).on('mousemove', (event) => {
          setTooltip(t => t ? { ...t, x: event.clientX, y: event.clientY } : null);
        }).on('mouseout', (event) => {
          d3.select(event.currentTarget).attr('stroke', '#222').attr('stroke-width', 0.5);
          setTooltip(null);
        });
      });
    });

    // Glow border for max cell
    g.append('rect')
      .attr('x', maxJ * cellSize)
      .attr('y', maxI * cellSize)
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', 'none')
      .attr('stroke', 'var(--glow-color)')
      .attr('stroke-width', 2)
      .style('pointer-events', 'none')
      .style('filter', 'drop-shadow(0 0 2px rgba(0, 200, 170, 0.35))');

    // X-axis labels (rotated 45°)
    tokens.forEach((t, j) => {
      svg.append('text')
        .attr('x', margin.left + j * cellSize + cellSize / 2)
        .attr('y', margin.top - 4)
        .attr('text-anchor', 'start')
        .attr('transform', `rotate(-45, ${margin.left + j * cellSize + cellSize / 2}, ${margin.top - 4})`)
        .attr('fill', '#888')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(t.replace(/^Ġ/, '·').slice(0, 8));
    });

    // Y-axis labels
    tokens.forEach((t, i) => {
      svg.append('text')
        .attr('x', margin.left - 4)
        .attr('y', margin.top + i * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#888')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .text(t.replace(/^Ġ/, '·').slice(0, 8));
    });

  }, [tokens, weights]);

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.1em' }}>
        SELF-ATTENTION WEIGHT MATRIX (1 head, layer 1)
      </div>
      <div ref={ref} style={{ overflowX: 'auto' }} />
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 24,
          background: '#1a1a1a',
          border: '1px solid var(--border)',
          padding: '4px 8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--text)',
          pointerEvents: 'none',
          zIndex: 9000,
          whiteSpace: 'nowrap',
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
