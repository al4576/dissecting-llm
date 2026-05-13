import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { SCALE_FACTS, SCALE_CHART_FOOTNOTE } from '../../logic/datasets';

const NOVEL_TOKENS = 100_000;
const WIKI_TOKENS = 5e9;

function formatTokens(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(0) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(0) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n.toString();
}

function formatMult(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e5) return `${Math.round(n / 1000)}K`;
  if (n >= 1e4) return `${(n / 1000).toFixed(1)}K`;
  return `${Math.round(n)}`;
}

/**
 * Two linear panels (no log axis):
 * (A) novel + Wikipedia on a raw-token axis up to ~1.1× Wikipedia.
 * (B) frontier pretrains on a raw-token axis; Wikipedia multiple only beside each bar.
 */
export default function DatasetScale() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    d3.select(el).selectAll('*').remove();

    const novelFact = SCALE_FACTS.find((d) => d.label.includes('novel'));
    const wikiFact = SCALE_FACTS.find((d) => d.label.includes('Wikipedia'));
    const pretrainFacts = SCALE_FACTS.filter(
      (d) => d !== novelFact && d !== wikiFact,
    );

    const W = 720;
    const rowH = 44;
    const margin = { left: 300, right: 128, top: 8, bottom: 52 };
    const innerW = W - margin.left - margin.right;
    const sectionGap = 36;
    const sectionTitleH = 20;

    const panelARows = [novelFact, wikiFact].filter(Boolean);
    const panelAHeight = sectionTitleH + panelARows.length * rowH;
    const panelBRows = pretrainFacts;
    const panelBHeight = sectionTitleH + panelBRows.length * rowH;

    const H = margin.top + panelAHeight + sectionGap + panelBHeight + margin.bottom;

    const svg = d3
      .select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('height', H)
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('max-width', '780px')
      .style('overflow', 'visible');

    const roleBar = { gpt3: 'var(--glow-color)', estimate: '#cc8844', published: '#55aa88', ref: '#446688' };
    const roleLabel = { gpt3: 'var(--accent)', estimate: '#ddb080', published: '#7ec8a3', ref: '#888' };

    const panelAMax = WIKI_TOKENS * 1.1;
    const scaleA = d3.scaleLinear().domain([0, panelAMax]).range([0, innerW]).nice();

    const panelBMax = Math.max(...pretrainFacts.map((d) => d.tokens), 1) * 1.06;
    const scaleB = d3.scaleLinear().domain([0, panelBMax]).range([0, innerW]).nice();

    function drawPanel(gRoot, y0, title, rows, scale, valueMode) {
      gRoot
        .append('text')
        .attr('x', 0)
        .attr('y', y0 + 12)
        .attr('fill', '#6a7a72')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('letter-spacing', '0.08em')
        .text(title);

      rows.forEach((d, i) => {
        const role = d.role || 'ref';
        const barColor = roleBar[role] || roleBar.ref;
        const labelColor = roleLabel[role] || roleLabel.ref;
        const y = y0 + sectionTitleH + i * rowH + rowH / 2;
        const barH = 16;

        let barW;
        let valueText;
        let subText = null;

        if (valueMode === 'tokens') {
          const raw = scale(d.tokens) - scale(0);
          barW = Math.max(4, raw);
          valueText = formatTokens(d.tokens);
          if (d.tokens <= NOVEL_TOKENS * 2 && raw < 8) {
            subText = 'bar floored — true width would be invisible at Wikipedia zoom';
          }
        } else if (valueMode === 'pretrainTokens') {
          const raw = scale(d.tokens) - scale(0);
          barW = Math.max(4, raw);
          valueText = formatTokens(d.tokens);
          const mult = d.tokens / WIKI_TOKENS;
          subText = `${formatMult(mult)}× one English Wikipedia snapshot (~${formatTokens(WIKI_TOKENS)} tokens)`;
        }

        gRoot
          .append('text')
          .attr('x', -8)
          .attr('y', y)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .attr('fill', labelColor)
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .text(d.label);

        const bar = gRoot
          .append('rect')
          .attr('x', 0)
          .attr('y', y - barH / 2)
          .attr('height', barH)
          .attr('width', 0)
          .attr('fill', barColor)
          .attr('rx', 2);

        bar.transition()
          .delay(i * 80)
          .duration(500)
          .attr('width', barW);

        gRoot
          .append('text')
          .attr('x', barW + 6)
          .attr('y', y)
          .attr('dominant-baseline', 'middle')
          .attr('fill', role === 'gpt3' ? 'var(--accent)' : role === 'published' ? '#7ec8a3' : role === 'estimate' ? '#cc9966' : '#888')
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .style('opacity', 0)
          .text(valueText)
          .transition()
          .delay(i * 80 + 400)
          .duration(150)
          .style('opacity', 1);

        if (subText) {
          gRoot
            .append('text')
            .attr('x', barW + 6)
            .attr('y', y + 12)
            .attr('fill', '#454d48')
            .attr('font-size', '8px')
            .attr('font-family', 'monospace')
            .style('opacity', 0)
            .text(subText)
            .transition()
            .delay(i * 80 + 450)
            .duration(150)
            .style('opacity', 1);
        }
      });

      const axisY = y0 + sectionTitleH + rows.length * rowH + 10;
      const axisG = gRoot.append('g').attr('transform', `translate(0,${axisY})`);

      axisG.call(
        d3
          .axisBottom(scale)
          .ticks(6)
          .tickFormat((v) => formatTokens(v))
          .tickSizeOuter(0),
      );

      axisG.selectAll('text')
        .attr('fill', '#666')
        .attr('font-size', '9px')
        .attr('font-family', 'monospace')
        .attr('transform', 'rotate(-32)')
        .style('text-anchor', 'end')
        .attr('dx', '-0.35em')
        .attr('dy', '0.45em');

      axisG.select('.domain').attr('stroke', '#333');
      axisG.selectAll('.tick line').attr('stroke', '#333');
    }

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    drawPanel(
      g,
      0,
      'LINEAR ZOOM A — RAW TOKENS (0 TO ~1 WIKIPEDIA SNAPSHOT)',
      panelARows,
      scaleA,
      'tokens',
    );

    drawPanel(
      g,
      panelAHeight + sectionGap,
      'LINEAR ZOOM B — RAW TRAINING TOKENS (AXIS = TOKENS; × WIKI BESIDE EACH BAR)',
      panelBRows,
      scaleB,
      'pretrainTokens',
    );
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '800px', justifySelf: 'center', overflow: 'visible' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.12em', textAlign: 'center' }}>
        SCALE — TWO LINEAR VIEWS (NOT LOG)
      </div>
      <div ref={ref} style={{ width: '100%' }} />
      <p style={{
        marginTop: '14px',
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#555',
        lineHeight: 1.65,
        maxWidth: '640px',
      }}
      >
        {SCALE_CHART_FOOTNOTE}
      </p>
    </div>
  );
}
