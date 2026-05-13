import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

// Manual Sankey-style layout. Custom HTML tooltip — native <title> is often suppressed in embedded Chromium.

/** Site electricity split (percent of metered site load), rounded from midrange U.S. facility surveys — not one measured hall. */
const NODES = [
  {
    id: 0,
    label: 'All site\nelectricity (100%)',
    x: 0,
    y: 1,
    hover:
      'Utility meter for the whole campus: everything the data center draws before you split it between IT gear, cooling, and overhead. Width in the diagram = 100% of that total.',
  },
  {
    id: 1,
    label: 'Inside\nthe fence',
    x: 1,
    y: 1,
    hover:
      'Racks, power distribution, chillers, pumps — same total as the left box, just drawn as the point where the site divides load among subsystems.',
  },
  {
    id: 2,
    label: 'Cooling & fans\n(~34%)',
    x: 2,
    y: 0,
    hover:
      'HVAC, pumps, fans, often evaporative cooling — DOE / LBNL data-center workstreams often cite roughly a third of site electricity for thermal management in typical U.S. halls; hyperscale cloud sites with PUE ≈1.1 push this much lower (IEA).',
  },
  {
    id: 3,
    label: 'IT compute\n(~48%)',
    x: 2,
    y: 1,
    hover:
      'Servers, accelerators, and the immediate power they draw for matrix math — the largest single bucket in many published U.S. site audits (Shehabi et al. / LBNL lineage; rounded here).',
  },
  {
    id: 4,
    label: 'Power, net +\nother (~18%)',
    x: 2,
    y: 2,
    hover:
      'UPS conversion losses, switchgear, storage spin-up, networking fabric, controls, lighting — bundled in surveys as “non-IT infrastructure” alongside a slice of ancillary IT loads; share varies widely by facility age.',
  },
];

const FLOWS = [
  {
    from: 0,
    to: 1,
    value: 100,
    color: '#00ccff',
    hover: '100% of metered site electricity — the three outgoing pipes are the same total, split by end use.',
  },
  {
    from: 1,
    to: 2,
    value: 34,
    color: '#ff4444',
    hover: '~34% of site load for cooling & air movement — midrange U.S. training/colo style; modern hyperscale can be far lower.',
  },
  {
    from: 1,
    to: 3,
    value: 48,
    color: '#4488ff',
    hover: '~48% of site load directly feeding IT compute — rounded aggregate from public LBNL / DOE data-center energy literature.',
  },
  {
    from: 1,
    to: 4,
    value: 18,
    color: '#888888',
    hover: '~18% for electrical distribution, networking, storage, and misc. building loads — composite bucket from the same literature rounding.',
  },
];

export default function PowerFlow() {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  const showTip = useCallback((text, event) => {
    setTip({ text, x: event.clientX, y: event.clientY });
  }, []);

  const moveTip = useCallback((event) => {
    setTip((t) => (t ? { ...t, x: event.clientX, y: event.clientY } : null));
  }, []);

  const hideTip = useCallback(() => {
    setTip(null);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    d3.select(el).selectAll('*').remove();

    const W = 540;
    const H = 300;
    const colX = [36, 206, 376];
    const rowY = [62, 146, 230];
    const nodeW = 118;
    const nodeH = 46;
    const lineGap = 11;
    const labelFontPx = 8;

    const svg = d3.select(el).append('svg').attr('width', W).attr('height', H);

    const gFlowVis = svg.append('g').attr('class', 'pf-flow-visible');
    const gNodeVis = svg.append('g').attr('class', 'pf-node-visible');
    const gFlowHit = svg.append('g').attr('class', 'pf-flow-hit');
    const gNodeHit = svg.append('g').attr('class', 'pf-node-hit');

    FLOWS.forEach((flow, i) => {
      const fromNode = NODES[flow.from];
      const toNode = NODES[flow.to];
      const x1 = colX[fromNode.x] + nodeW;
      const y1 = rowY[fromNode.y] + nodeH / 2;
      const x2 = colX[toNode.x];
      const y2 = rowY[toNode.y] + nodeH / 2;
      const thickness = Math.max(2, flow.value * 0.4);
      const dPath = `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;

      const pathVisible = gFlowVis
        .append('path')
        .attr('d', dPath)
        .attr('fill', 'none')
        .attr('stroke', flow.color)
        .attr('stroke-width', thickness)
        .attr('stroke-opacity', 0.6)
        .style('pointer-events', 'none');

      const len = pathVisible.node().getTotalLength();
      pathVisible
        .attr('stroke-dasharray', len)
        .attr('stroke-dashoffset', len)
        .transition()
        .delay(i * 150 + 200)
        .duration(500)
        .attr('stroke-dashoffset', 0);
    });

    NODES.forEach((node) => {
      const x = colX[node.x];
      const y = rowY[node.y];

      const g = gNodeVis.append('g');
      g.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', nodeW)
        .attr('height', nodeH)
        .attr('rx', 4)
        .attr('fill', '#1a1a2e')
        .attr('stroke', '#334')
        .attr('stroke-width', 1);

      const lines = node.label.split('\n');
      const midY = y + nodeH / 2;
      const firstLineY = midY - ((lines.length - 1) * lineGap) / 2;
      lines.forEach((line, li) => {
        g.append('text')
          .attr('x', x + nodeW / 2)
          .attr('y', firstLineY + li * lineGap)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#ccc')
          .attr('font-size', `${labelFontPx}px`)
          .attr('font-family', 'monospace')
          .style('pointer-events', 'none')
          .text(line);
      });
    });

    FLOWS.forEach((flow) => {
      const fromNode = NODES[flow.from];
      const toNode = NODES[flow.to];
      const x1 = colX[fromNode.x] + nodeW;
      const y1 = rowY[fromNode.y] + nodeH / 2;
      const x2 = colX[toNode.x];
      const y2 = rowY[toNode.y] + nodeH / 2;
      const thickness = Math.max(2, flow.value * 0.4);
      const hitW = Math.max(20, thickness + 16);
      const dPath = `M${x1},${y1} C${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2},${y2}`;

      gFlowHit
        .append('path')
        .attr('d', dPath)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,0.02)')
        .attr('stroke-width', hitW)
        .attr('pointer-events', 'stroke')
        .style('cursor', 'help')
        .on('mouseenter', (e) => showTip(flow.hover, e))
        .on('mousemove', moveTip)
        .on('mouseleave', hideTip);
    });

    NODES.forEach((node) => {
      const x = colX[node.x];
      const y = rowY[node.y];

      gNodeHit
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', nodeW)
        .attr('height', nodeH)
        .attr('rx', 4)
        .attr('fill', 'rgba(255,255,255,0.01)')
        .attr('pointer-events', 'all')
        .style('cursor', 'help')
        .on('mouseenter', (e) => showTip(node.hover, e))
        .on('mousemove', moveTip)
        .on('mouseleave', hideTip);
    });

    return () => {
      d3.select(el).selectAll('*').remove();
      setTip(null);
    };
  }, [showTip, moveTip, hideTip]);

  const tipLeft = tip ? Math.max(8, Math.min(tip.x + 12, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 292)) : 0;
  const tipTop = tip ? Math.max(8, tip.y + 12) : 0;

  return (
    <div style={{ maxWidth: '560px', position: 'relative' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.1em' }}>
        WHERE SITE ELECTRICITY GOES (APPROX. % — U.S. MIDRANGE DC LITERATURE)
      </div>
      <div ref={ref} style={{ overflowX: 'auto', padding: '8px 4px 4px' }} />
      <p style={{ fontSize: '9px', color: '#455', fontFamily: 'monospace', marginTop: '8px', marginBottom: 0, lineHeight: 1.55 }}>
        Hover any box or pipe for sources and caveats. Flow widths = % of site electricity (rounded; hyperscale sites differ).
      </p>

      {tip && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: tipLeft,
            top: tipTop,
            zIndex: 20000,
            maxWidth: 280,
            padding: '10px 12px',
            background: '#0c1218',
            border: '1px solid #2a3d48',
            borderRadius: 4,
            color: '#b8c4cc',
            fontSize: '11px',
            fontFamily: 'monospace',
            lineHeight: 1.55,
            pointerEvents: 'none',
            boxShadow: '0 10px 28px rgba(0,0,0,0.55)',
          }}
        >
          {tip.text}
        </div>
      )}
    </div>
  );
}
