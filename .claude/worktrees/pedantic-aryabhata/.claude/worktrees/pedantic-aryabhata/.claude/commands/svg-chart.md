# SVG Chart Patterns

Reference patterns for pure SVG charts used in FinSim pages (no external chart libraries).

**Usage:** `/svg-chart <chart-type>`

## Line Chart
```tsx
const W = 400, H = 160, PAD = 30;
const minV = Math.min(...data), maxV = Math.max(...data);
const px = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
const py = (v: number) => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2);
const d = data.map((v, i) => `${i === 0 ? "M" : "L"} ${px(i)} ${py(v)}`).join(" ");

<svg viewBox={`0 0 ${W} ${H}`} className="w-full">
  {/* Grid lines */}
  {[0.25, 0.5, 0.75].map(t => (
    <line key={t} x1={PAD} x2={W-PAD} y1={PAD + t*(H-PAD*2)} y2={PAD + t*(H-PAD*2)}
      stroke="currentColor" strokeOpacity={0.1} />
  ))}
  {/* Area fill */}
  <path d={`${d} L ${px(data.length-1)} ${H-PAD} L ${px(0)} ${H-PAD} Z`}
    fill="currentColor" fillOpacity={0.1} />
  {/* Line */}
  <path d={d} fill="none" stroke="currentColor" strokeWidth={2} />
</svg>
```

## Bar Chart
```tsx
const W = 400, H = 160, PAD = 30;
const maxV = Math.max(...data.map(Math.abs));
const barW = (W - PAD * 2) / data.length - 2;

<svg viewBox={`0 0 ${W} ${H}`} className="w-full">
  {data.map((v, i) => {
    const bh = (Math.abs(v) / maxV) * (H - PAD * 2);
    const x = PAD + i * ((W - PAD * 2) / data.length) + 1;
    const y = v >= 0 ? H - PAD - bh : H - PAD;
    return (
      <rect key={i} x={x} y={y} width={barW} height={bh}
        fill={v >= 0 ? "#22c55e" : "#ef4444"} rx={2} />
    );
  })}
</svg>
```

## Pie/Donut Chart
```tsx
interface Slice { label: string; value: number; color: string; }
function PieChart({ slices, donut = true }: { slices: Slice[]; donut?: boolean }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  let angle = -Math.PI / 2;
  const CX = 80, CY = 80, R = 65, IR = donut ? 40 : 0;
  return (
    <svg viewBox="0 0 160 160" className="w-32 h-32">
      {slices.map((sl, i) => {
        const sweep = (sl.value / total) * Math.PI * 2;
        const x1 = CX + R * Math.cos(angle), y1 = CY + R * Math.sin(angle);
        angle += sweep;
        const x2 = CX + R * Math.cos(angle), y2 = CY + R * Math.sin(angle);
        const ix1 = CX + IR * Math.cos(angle - sweep), iy1 = CY + IR * Math.sin(angle - sweep);
        const ix2 = CX + IR * Math.cos(angle), iy2 = CY + IR * Math.sin(angle);
        const large = sweep > Math.PI ? 1 : 0;
        const d = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${IR} ${IR} 0 ${large} 0 ${ix1} ${iy1} Z`;
        return <path key={i} d={d} fill={sl.color} stroke="hsl(var(--background))" strokeWidth={1} />;
      })}
    </svg>
  );
}
```

## Heatmap (Correlation Matrix)
```tsx
const N = labels.length;
const CELL = 40;
<svg viewBox={`0 0 ${N*CELL+80} ${N*CELL+80}`} className="w-full">
  {matrix.map((row, i) => row.map((v, j) => {
    const r = v > 0 ? Math.round(v * 255) : 0;
    const b = v < 0 ? Math.round(-v * 255) : 0;
    return (
      <g key={`${i}-${j}`}>
        <rect x={80+j*CELL} y={40+i*CELL} width={CELL} height={CELL}
          fill={`rgb(${r},50,${b})`} opacity={0.8} />
        <text x={80+j*CELL+CELL/2} y={40+i*CELL+CELL/2+4}
          textAnchor="middle" fontSize={10} fill="white">
          {v.toFixed(2)}
        </text>
      </g>
    );
  }))}
</svg>
```

## Gauge (Semi-circle)
```tsx
function Gauge({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
  const pct = (value - min) / (max - min);
  const angle = -180 + pct * 180; // -180 to 0 degrees
  const rad = (angle * Math.PI) / 180;
  const nx = 80 + 55 * Math.cos(rad), ny = 80 + 55 * Math.sin(rad);
  return (
    <svg viewBox="0 0 160 100" className="w-40 h-24">
      <path d="M 25 80 A 55 55 0 0 1 135 80" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={8} />
      <path d="M 25 80 A 55 55 0 0 1 135 80" fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${pct * 173} 173`} />
      <line x1={80} y1={80} x2={nx} y2={ny} stroke="white" strokeWidth={2} />
      <circle cx={80} cy={80} r={4} fill="white" />
    </svg>
  );
}
```
