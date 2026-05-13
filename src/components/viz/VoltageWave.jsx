import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const W = 480, H = 160;
const MARGIN = { top: 20, right: 20, bottom: 30, left: 50 };
const INNER_W = W - MARGIN.left - MARGIN.right;
const INNER_H = H - MARGIN.top - MARGIN.bottom;
const PERIOD = 1000; // ms
const MAX_POINTS = 200;
const V_HIGH = 1.2;
const V_LOW = 0;
const THRESHOLD = 0.6;

function squareWave(t) {
  return ((t % PERIOD) < PERIOD / 2) ? V_HIGH : V_LOW;
}

function noise() {
  return (Math.random() - 0.5) * 0.08;
}

export default function VoltageWave() {
  const ref = useRef(null);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    d3.select(el).selectAll('*').remove();

    const svg = d3.select(el)
      .append('svg')
      .attr('width', W)
      .attr('height', H);

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const x = d3.scaleLinear().domain([0, MAX_POINTS]).range([0, INNER_W]);
    const y = d3.scaleLinear().domain([-0.1, V_HIGH + 0.2]).range([INNER_H, 0]);

    // Axes
    const xAxis = g.append('g').attr('transform', `translate(0,${INNER_H})`);
    xAxis.call(d3.axisBottom(x).ticks(5).tickFormat(() => ''));
    xAxis.selectAll('line, path').attr('stroke', '#333');

    const yAxis = g.append('g');
    yAxis.call(d3.axisLeft(y).tickValues([0, 0.6, 1.2]).tickFormat(d => `${d}V`));
    yAxis.selectAll('text').attr('fill', '#888').attr('font-size', '9px').attr('font-family', 'monospace');
    yAxis.selectAll('line, path').attr('stroke', '#333');

    // Threshold line
    g.append('line')
      .attr('x1', 0).attr('x2', INNER_W)
      .attr('y1', y(THRESHOLD)).attr('y2', y(THRESHOLD))
      .attr('stroke', '#888').attr('stroke-dasharray', '4,4').attr('stroke-width', 1);

    g.append('text')
      .attr('x', INNER_W + 2).attr('y', y(THRESHOLD) + 3)
      .attr('fill', '#888').attr('font-size', '9px').attr('font-family', 'monospace')
      .text('0.6V');

    // Line generators
    const lineGen = d3.line()
      .x((_, i) => x(i))
      .y(d => y(d.v))
      .defined(d => d !== null);

    const lineGenNoisy = d3.line()
      .x((_, i) => x(i))
      .y(d => y(Math.max(0, Math.min(V_HIGH + 0.1, d.v + d.n))))
      .defined(d => d !== null);

    const path1 = g.append('path').attr('fill', 'none').attr('stroke-width', 1.5);
    const path2 = g.append('path').attr('fill', 'none').attr('stroke', '#445566').attr('stroke-width', 1).attr('stroke-opacity', 0.6);

    // Labels
    svg.append('text')
      .attr('x', MARGIN.left + 4).attr('y', MARGIN.top + INNER_H - 4)
      .attr('fill', '#666').attr('font-size', '8px').attr('font-family', 'monospace')
      .text('HIGH = logic 1 | LOW = logic 0');

    let points = [];

    function frame(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const v = squareWave(elapsed);
      points.push({ v, n: noise() });
      if (points.length > MAX_POINTS) points.shift();

      const color = v >= THRESHOLD ? 'var(--glow-color)' : '#445566';
      path1.attr('d', lineGen(points)).attr('stroke', color);
      path2.attr('d', lineGenNoisy(points));

      frameRef.current = requestAnimationFrame(frame);
    }

    frameRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.1em' }}>
        VOLTAGE WAVEFORM (real-time)
      </div>
      <div ref={ref} style={{ overflowX: 'auto' }} />
      <div style={{ marginTop: '6px', fontSize: '9px', color: '#555', fontFamily: 'monospace' }}>
        bright = signal | dim = signal + thermal noise
      </div>
    </div>
  );
}
