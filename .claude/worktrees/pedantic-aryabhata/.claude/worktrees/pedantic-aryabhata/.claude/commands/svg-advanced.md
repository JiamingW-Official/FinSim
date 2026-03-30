# Advanced SVG Chart Patterns

More complex SVG visualizations for FinSim pages.

**Usage:** `/svg-advanced` — use when building pages that need complex charts.

## Multi-Line Chart with Legend
```tsx
interface Series { label: string; data: number[]; color: string; }

function MultiLineChart({ series, height = 180 }: { series: Series[]; height?: number }) {
  const W = 500, H = height, PAD = { t: 10, r: 10, b: 30, l: 40 };
  const allVals = series.flatMap(s => s.data);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const n = series[0]?.data.length ?? 0;
  const px = (i: number) => PAD.l + (i / (n - 1)) * (W - PAD.l - PAD.r);
  const py = (v: number) => H - PAD.b - ((v - minV) / (maxV - minV || 1)) * (H - PAD.t - PAD.b);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y-axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={PAD.t + t * (H - PAD.t - PAD.b)} y2={PAD.t + t * (H - PAD.t - PAD.b)}
            stroke="currentColor" strokeOpacity={0.1} strokeDasharray="4 4" />
          <text x={PAD.l - 4} y={PAD.t + t * (H - PAD.t - PAD.b) + 4}
            textAnchor="end" fontSize={9} fill="currentColor" fillOpacity={0.5}>
            {(maxV - t * (maxV - minV)).toFixed(1)}
          </text>
        </g>
      ))}
      {/* Series lines */}
      {series.map(s => {
        const d = s.data.map((v, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(v)}`).join(" ");
        return <path key={s.label} d={d} fill="none" stroke={s.color} strokeWidth={2} />;
      })}
      {/* Legend */}
      {series.map((s, i) => (
        <g key={s.label} transform={`translate(${PAD.l + i * 100}, ${H - 10})`}>
          <line x1={0} x2={12} y1={0} y2={0} stroke={s.color} strokeWidth={2} />
          <text x={16} y={4} fontSize={9} fill="currentColor" fillOpacity={0.7}>{s.label}</text>
        </g>
      ))}
    </svg>
  );
}
```

## Candlestick Chart (Mini)
```tsx
function MiniCandles({ candles }: { candles: { o: number; h: number; l: number; c: number }[] }) {
  const W = 300, H = 100, PAD = 10;
  const prices = candles.flatMap(c => [c.h, c.l]);
  const min = Math.min(...prices), max = Math.max(...prices);
  const py = (v: number) => PAD + ((max - v) / (max - min)) * (H - PAD * 2);
  const cw = (W - PAD * 2) / candles.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {candles.map((c, i) => {
        const x = PAD + i * cw + cw * 0.1;
        const bw = cw * 0.8;
        const isUp = c.c >= c.o;
        const color = isUp ? "#22c55e" : "#ef4444";
        return (
          <g key={i}>
            <line x1={x + bw / 2} x2={x + bw / 2} y1={py(c.h)} y2={py(c.l)} stroke={color} strokeWidth={1} />
            <rect x={x} y={Math.min(py(c.o), py(c.c))} width={bw}
              height={Math.abs(py(c.o) - py(c.c)) || 1} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}
```

## Waterfall / Cascade Chart
```tsx
function Waterfall({ items }: { items: { label: string; value: number; isTotal?: boolean }[] }) {
  const W = 500, H = 200, PAD = { t: 10, r: 10, b: 40, l: 60 };
  let running = 0;
  const bars = items.map(item => {
    const start = item.isTotal ? 0 : running;
    running = item.isTotal ? item.value : running + item.value;
    return { ...item, start, end: item.isTotal ? item.value : running };
  });
  const allVals = bars.flatMap(b => [b.start, b.end]);
  const min = Math.min(0, ...allVals), max = Math.max(...allVals);
  const scaleY = (v: number) => H - PAD.b - ((v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const bw = (W - PAD.l - PAD.r) / bars.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1={PAD.l} x2={W - PAD.r} y1={scaleY(0)} y2={scaleY(0)} stroke="currentColor" strokeOpacity={0.3} />
      {bars.map((b, i) => {
        const x = PAD.l + i * ((W - PAD.l - PAD.r) / bars.length) + 2;
        const color = b.isTotal ? "#6366f1" : b.value >= 0 ? "#22c55e" : "#ef4444";
        return (
          <g key={b.label}>
            <rect x={x} y={Math.min(scaleY(b.start), scaleY(b.end))} width={bw}
              height={Math.abs(scaleY(b.start) - scaleY(b.end)) || 1} fill={color} rx={2} fillOpacity={0.8} />
            <text x={x + bw / 2} y={H - PAD.b + 14} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.7}>
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

## Treemap
```tsx
function Treemap({ items }: { items: { label: string; value: number; change: number }[] }) {
  const W = 500, H = 300;
  const total = items.reduce((s, i) => s + i.value, 0);
  // Simple squarified layout (row-based approximation)
  let x = 0;
  const rects = items.map(item => {
    const w = (item.value / total) * W;
    const rect = { x, y: 0, w, h: H, ...item };
    x += w;
    return rect;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded overflow-hidden">
      {rects.map((r, i) => {
        const color = r.change > 0 ? `rgba(34,197,94,${Math.min(0.8, 0.2 + r.change / 10)})` :
          `rgba(239,68,68,${Math.min(0.8, 0.2 + Math.abs(r.change) / 10)})`;
        return (
          <g key={i}>
            <rect x={r.x + 1} y={1} width={r.w - 2} height={r.h - 2} fill={color} rx={3} />
            {r.w > 40 && (
              <text x={r.x + r.w / 2} y={H / 2} textAnchor="middle" fontSize={Math.min(14, r.w / 5)}
                fill="white" fontWeight="bold">{r.label}</text>
            )}
            {r.w > 40 && (
              <text x={r.x + r.w / 2} y={H / 2 + 16} textAnchor="middle" fontSize={10} fill="white" fillOpacity={0.8}>
                {r.change > 0 ? "+" : ""}{r.change.toFixed(1)}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
```

## Radar/Spider Chart
```tsx
function RadarChart({ axes, values, maxVal = 100 }: { axes: string[]; values: number[]; maxVal?: number }) {
  const CX = 100, CY = 100, R = 80, N = axes.length;
  const angle = (i: number) => (i / N) * Math.PI * 2 - Math.PI / 2;
  const pt = (i: number, r: number) => ({
    x: CX + r * Math.cos(angle(i)),
    y: CY + r * Math.sin(angle(i)),
  });
  const polyPoints = values.map((v, i) => {
    const p = pt(i, (v / maxVal) * R);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(t => (
        <polygon key={t} points={Array.from({ length: N }, (_, i) => {
          const p = pt(i, t * R); return `${p.x},${p.y}`;
        }).join(" ")} fill="none" stroke="currentColor" strokeOpacity={0.15} />
      ))}
      {/* Spokes */}
      {axes.map((_, i) => {
        const p = pt(i, R);
        return <line key={i} x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="currentColor" strokeOpacity={0.2} />;
      })}
      {/* Data polygon */}
      <polygon points={polyPoints} fill="#6366f1" fillOpacity={0.3} stroke="#6366f1" strokeWidth={2} />
      {/* Labels */}
      {axes.map((label, i) => {
        const p = pt(i, R + 14);
        return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="currentColor" fillOpacity={0.8}>{label}</text>;
      })}
    </svg>
  );
}
```
