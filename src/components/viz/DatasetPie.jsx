import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { GPT3_DATASETS } from '../../logic/datasets';

const COLORS = ['#00ffcc', '#00ccff', '#ff9944', '#ff4488', '#aaff44'];

function formatTokens(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(0) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  return n.toString();
}

export default function DatasetPie({ onCommonCrawlRef }) {
  const ref = useRef(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const el = ref.current;
    d3.select(el).selectAll('*').remove();

    const W = 480, H = 480;
    const R = 118, innerR = 76;
    const cx = W / 2, cy = H / 2;

    const svg = d3.select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('height', H)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('overflow', 'visible')
      .style('max-width', '460px');

    const pie = d3.pie().value(d => d.weight).sort(null);
    const arc = d3.arc().innerRadius(innerR).outerRadius(R);
    const arcHover = d3.arc().innerRadius(innerR).outerRadius(R + 12);

    const arcs = pie(GPT3_DATASETS);

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // Inner label
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -8)
      .attr('fill', '#e0e0e0')
      .attr('font-size', '20px')
      .attr('font-family', 'monospace')
      .text('~300B');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 12)
      .attr('fill', '#888')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .text('tokens total');

    arcs.forEach((d, i) => {
      const isCommonCrawl = d.data.name.includes('Common Crawl');
      const path = g.append('path')
        .datum(d)
        .attr('fill', COLORS[i])
        .attr('stroke', '#0a0a0a')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      // Animate arc tween from 0 → full
      path.transition()
        .delay(i * 120)
        .duration(400)
        .attrTween('d', () => {
          const interp = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
          return t => arc(interp(t));
        });

      path.on('mouseover', () => {
        path.transition().duration(100).attr('d', arcHover(d));
        setSelected(d.data);
      }).on('mouseout', () => {
        path.transition().duration(100).attr('d', arc(d));
        setSelected(null);
      }).on('click', () => setSelected(s => s === d.data ? null : d.data));

      if (isCommonCrawl && onCommonCrawlRef) {
        onCommonCrawlRef(path.node());
      }

      // Segment label
      const mid = (d.startAngle + d.endAngle) / 2;
      const labelR = R + 44;
      const lx = Math.sin(mid) * labelR;
      const ly = -Math.cos(mid) * labelR;

      if (d.data.weight > 0.05) {
        const fontSize = d.data.name.length > 14 ? 8 : 9;
        const lines = d.data.name.length > 12
          ? [d.data.name.replace(/\s*\([^)]*\)\s*/, ''), `${Math.round(d.data.weight * 100)}%`]
          : [`${d.data.name.split(' ')[0]} ${Math.round(d.data.weight * 100)}%`];

        const t = g.append('text')
          .attr('x', lx)
          .attr('y', ly)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', COLORS[i])
          .attr('font-size', `${fontSize}px`)
          .attr('font-family', 'monospace')
          .style('opacity', 0);

        lines.forEach((line, li) => {
          t.append('tspan')
            .attr('x', lx)
            .attr('dy', li === 0 ? (lines.length > 1 ? '-0.55em' : '0') : '1.05em')
            .text(line);
        });

        t.transition().delay(i * 120 + 300).duration(200).style('opacity', 1);
      }
    });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '480px', justifySelf: 'center' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.12em', textAlign: 'center' }}>
        GPT-3 DATASET COMPOSITION
      </div>
      <div ref={ref} />
      {selected && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: 'var(--text)',
        }}>
          <div style={{ color: 'var(--accent)', marginBottom: '4px' }}>{selected.name}</div>
          <div>{formatTokens(selected.tokens)} tokens · {Math.round(selected.weight * 100)}% of training mix</div>
          {selected.description && <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{selected.description}</div>}
        </div>
      )}
    </div>
  );
}
