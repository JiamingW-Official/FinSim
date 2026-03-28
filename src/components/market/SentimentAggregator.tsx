"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface DailyFGPoint {
  day: number; // day index 0..29
  value: number;
}

interface PutCallData {
  total: number;
  equityOnly: number;
  index: number;
  ma5: number;
}

interface BreadthData {
  adLine: number[]; // 30 days
  aboveMa50: number; // % of S&P 500 above 50-day MA
  aboveMa200: number; // % of S&P 500 above 200-day MA
  highs52w: number;
  lows52w: number;
  mcclellan: number; // McClellan Oscillator
}

interface VixTermData {
  vix9d: number;
  vix: number;
  vix3m: number;
  vix6m: number;
  spikes: { date: string; value: number }[];
}

// ─── Data Generators ─────────────────────────────────────────────────────────

function generateFGHistory(seed: number): DailyFGPoint[] {
  const rand = seededRandom(seed);
  const points: DailyFGPoint[] = [];
  let v = 40 + rand() * 20;
  for (let i = 0; i < 30; i++) {
    v = Math.max(5, Math.min(95, v + (rand() - 0.48) * 8));
    points.push({ day: i, value: Math.round(v) });
  }
  return points;
}

function generatePutCallData(seed: number): PutCallData {
  const rand = seededRandom(seed);
  const total = 0.65 + rand() * 0.7; // 0.65 – 1.35
  const equityOnly = 0.55 + rand() * 0.5;
  const index = 0.90 + rand() * 0.8;
  const vals = [total, 0.65 + rand() * 0.7, 0.65 + rand() * 0.7, 0.65 + rand() * 0.7, 0.65 + rand() * 0.7];
  const ma5 = vals.reduce((s, v) => s + v, 0) / vals.length;
  return { total, equityOnly, index, ma5 };
}

function generateBreadthData(seed: number): BreadthData {
  const rand = seededRandom(seed);
  const adLine: number[] = [];
  let adVal = 1000 + rand() * 2000;
  for (let i = 0; i < 30; i++) {
    adVal += (rand() - 0.47) * 120;
    adLine.push(Math.round(adVal));
  }
  const aboveMa50 = Math.round(30 + rand() * 50);
  const aboveMa200 = Math.round(35 + rand() * 45);
  const highs52w = Math.round(20 + rand() * 120);
  const lows52w = Math.round(10 + rand() * 80);
  const mcclellan = Math.round(-80 + rand() * 160);
  return { adLine, aboveMa50, aboveMa200, highs52w, lows52w, mcclellan };
}

function generateVixTermData(seed: number): VixTermData {
  const rand = seededRandom(seed);
  const vix9d = 12 + rand() * 18;
  const vix = 14 + rand() * 16;
  const vix3m = 15 + rand() * 14;
  const vix6m = 16 + rand() * 12;
  const spikes: { date: string; value: number }[] = [];
  const spikeSeeds = [seed + 100, seed + 200, seed + 300, seed + 400, seed + 500];
  const dates = ["2025-08-05", "2025-10-18", "2025-12-03", "2026-01-14", "2026-02-28"];
  for (let i = 0; i < 5; i++) {
    const r = seededRandom(spikeSeeds[i]);
    spikes.push({ date: dates[i], value: Math.round(30 + r() * 25) });
  }
  spikes.sort((a, b) => b.value - a.value);
  return { vix9d, vix, vix3m, vix6m, spikes };
}

// ─── Helper functions ─────────────────────────────────────────────────────────

function getFGLevel(v: number): { label: string; color: string; bg: string } {
  if (v <= 20) return { label: "Extreme Fear", color: "text-red-500", bg: "bg-red-500/10" };
  if (v <= 40) return { label: "Fear", color: "text-orange-500", bg: "bg-orange-500/10" };
  if (v <= 60) return { label: "Neutral", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (v <= 80) return { label: "Greed", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  return { label: "Extreme Greed", color: "text-green-500", bg: "bg-green-500/10" };
}

function getPCSignal(pcr: number): { label: string; color: string; type: "fear" | "greed" | "neutral" } {
  if (pcr > 1.2) return { label: "Extreme Fear — contrarian buy signal", color: "text-red-500", type: "fear" };
  if (pcr > 1.0) return { label: "Elevated hedging demand", color: "text-orange-500", type: "fear" };
  if (pcr < 0.7) return { label: "Extreme Greed — caution advised", color: "text-green-500", type: "greed" };
  if (pcr < 0.85) return { label: "Bullish positioning", color: "text-emerald-500", type: "greed" };
  return { label: "Balanced positioning", color: "text-yellow-500", type: "neutral" };
}

function getMarketTemperature(indicators: boolean[]): { label: string; desc: string; color: string } {
  // indicators[i] = true means "bullish/greed", false means "fearful/bearish"
  const bullCount = indicators.filter(Boolean).length;
  const total = indicators.length;
  const pct = Math.round((bullCount / total) * 100);

  if (pct <= 15) return { label: "Icy", desc: `${100 - pct}% of indicators show fear`, color: "text-blue-400" };
  if (pct <= 35) return { label: "Cool", desc: `${100 - pct}% of indicators lean bearish`, color: "text-cyan-400" };
  if (pct <= 65) return { label: "Warm", desc: `${pct}% of indicators balanced`, color: "text-yellow-500" };
  if (pct <= 85) return { label: "Hot", desc: `${pct}% of indicators lean bullish`, color: "text-orange-500" };
  return { label: "Overheated", desc: `${pct}% of indicators show greed`, color: "text-red-500" };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// 1. Enhanced Fear & Greed Gauge

function FearGreedGauge({ value, history }: { value: number; history: DailyFGPoint[] }) {
  const { label, color, bg } = getFGLevel(value);

  // Semicircle gauge SVG
  const cx = 100;
  const cy = 100;
  const r = 78;
  const needleAngle = Math.PI - (value / 100) * Math.PI;
  const needleX = cx + r * 0.82 * Math.cos(needleAngle);
  const needleY = cy - r * 0.82 * Math.sin(needleAngle);

  const segments = [
    { start: 180, end: 144, color: "#ef4444", label: "Extreme Fear" },
    { start: 144, end: 108, color: "#f97316", label: "Fear" },
    { start: 108, end: 72, color: "#eab308", label: "Neutral" },
    { start: 72, end: 36, color: "#22c55e", label: "Greed" },
    { start: 36, end: 0, color: "#16a34a", label: "Extreme Greed" },
  ];

  // 30-day history line chart
  const histMin = Math.min(...history.map((p) => p.value));
  const histMax = Math.max(...history.map((p) => p.value));
  const histRange = histMax - histMin || 1;
  const chartW = 280;
  const chartH = 60;
  const histPoints = history.map((p, i) => {
    const x = (i / (history.length - 1)) * chartW;
    const y = chartH - ((p.value - histMin) / histRange) * chartH;
    return `${x},${y}`;
  });

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Fear &amp; Greed Index</h3>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", bg, color)}>
          {label}
        </span>
      </div>

      {/* Gauge */}
      <svg viewBox="0 0 200 115" className="w-full max-w-[300px] mx-auto">
        {segments.map((seg, i) => {
          const startRad = (seg.start * Math.PI) / 180;
          const endRad = (seg.end * Math.PI) / 180;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy - r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy - r * Math.sin(endRad);
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={seg.color}
              strokeWidth={14}
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}
        {/* Zone labels */}
        <text x="12" y="108" fontSize="7" fill="#6b7280">Extreme</text>
        <text x="12" y="116" fontSize="7" fill="#6b7280">Fear</text>
        <text x="158" y="108" fontSize="7" fill="#6b7280">Extreme</text>
        <text x="158" y="116" fontSize="7" fill="#6b7280">Greed</text>
        <text x="88" y="10" fontSize="7" fill="#6b7280">Neutral</text>
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke="#f8fafc"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={5} fill="#f8fafc" />
        {/* Value */}
        <text x={cx} y={cy - 22} textAnchor="middle" fontSize="26" fontFamily="monospace" fill="#f8fafc" fontWeight="700">
          {value}
        </text>
        {/* Scale */}
        <text x="8" y="100" fontSize="8" fill="#6b7280">0</text>
        <text x="96" y="14" fontSize="8" fill="#6b7280">50</text>
        <text x="184" y="100" fontSize="8" fill="#6b7280">100</text>
      </svg>

      {/* Sub-indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { name: "VIX Level", hint: "Low VIX = complacency" },
          { name: "Put/Call Ratio", hint: "High = fear hedging" },
          { name: "Market Breadth", hint: "A/D line direction" },
          { name: "Safe Haven Demand", hint: "Bond vs equity flow" },
          { name: "Junk Bond Demand", hint: "Credit spread proxy" },
        ].map((item) => (
          <div key={item.name} className="bg-muted/40 rounded p-2">
            <p className="font-medium text-[11px]">{item.name}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.hint}</p>
          </div>
        ))}
      </div>

      {/* 30-day history chart */}
      <div className="pt-3 border-t space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">30-Day History</p>
        <svg viewBox={`0 0 ${chartW} ${chartH + 10}`} className="w-full h-16">
          {/* Zones */}
          <rect x="0" y="0" width={chartW} height={((histMax - 20) / histRange) * chartH} fill="rgba(239,68,68,0.04)" />
          <rect x="0" y={chartH - ((60 - histMin) / histRange) * chartH} width={chartW} height={((60 - histMin) / histRange) * chartH} fill="rgba(34,197,94,0.04)" />
          {/* Midline */}
          <line
            x1="0" y1={chartH - ((50 - histMin) / histRange) * chartH}
            x2={chartW} y2={chartH - ((50 - histMin) / histRange) * chartH}
            stroke="rgba(107,114,128,0.3)" strokeDasharray="3 3" strokeWidth={0.8}
          />
          {/* Line */}
          <polyline
            points={histPoints.join(" ")}
            fill="none"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
          {/* Current dot */}
          <circle
            cx={(history.length - 1) / (history.length - 1) * chartW}
            cy={chartH - ((history[history.length - 1].value - histMin) / histRange) * chartH}
            r={3}
            fill="#6366f1"
          />
        </svg>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>30 days ago</span>
          <span>Today: {value}</span>
        </div>
      </div>
    </div>
  );
}

// 2. Put/Call Ratio Dashboard

function PutCallDashboard({ data }: { data: PutCallData }) {
  const ratios = [
    { label: "Total Market P/C", value: data.total, desc: "All equity + index options" },
    { label: "Equity-Only P/C", value: data.equityOnly, desc: "Single-stock options only" },
    { label: "Index P/C", value: data.index, desc: "SPX, NDX, RUT options" },
    { label: "5-Day MA", value: data.ma5, desc: "Smoothed signal" },
  ];

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold">Put/Call Ratio Dashboard</h3>

      <div className="grid grid-cols-2 gap-3">
        {ratios.map((r) => {
          const sig = getPCSignal(r.value);
          const barPct = Math.min(((r.value - 0.5) / 1.0) * 100, 100);
          const barColor =
            r.value > 1.2 ? "bg-red-500" : r.value > 1.0 ? "bg-orange-400" : r.value < 0.7 ? "bg-green-500" : "bg-yellow-500";

          return (
            <div key={r.label} className="bg-muted/40 rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-1">
                <div>
                  <p className="text-[11px] font-medium">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                </div>
                <span className="font-mono tabular-nums text-sm font-bold shrink-0">
                  {r.value.toFixed(2)}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", barColor)} style={{ width: `${barPct}%` }} />
              </div>
              <p className={cn("text-[10px] leading-tight", sig.color)}>{sig.label}</p>
            </div>
          );
        })}
      </div>

      {/* Threshold legend */}
      <div className="rounded-lg bg-muted/30 p-3 space-y-1.5 text-xs">
        <p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wide">Signal Guide</p>
        <div className="grid grid-cols-1 gap-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-muted-foreground">P/C &gt; 1.2 — Extreme fear, contrarian buy signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
            <span className="text-muted-foreground">P/C 0.85–1.2 — Neutral zone, no strong signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-muted-foreground">P/C &lt; 0.7 — Extreme greed, exercise caution</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Market Breadth Panel

function MarketBreadthSection({ data }: { data: BreadthData }) {
  const adMin = Math.min(...data.adLine);
  const adMax = Math.max(...data.adLine);
  const adRange = adMax - adMin || 1;
  const chartW = 300;
  const chartH = 64;

  const adPoints = data.adLine.map((v, i) => {
    const x = (i / (data.adLine.length - 1)) * chartW;
    const y = chartH - ((v - adMin) / adRange) * chartH;
    return `${x},${y}`;
  });

  const adTrend = data.adLine[data.adLine.length - 1] > data.adLine[0] ? "Rising" : "Falling";
  const adColor = adTrend === "Rising" ? "text-emerald-500" : "text-red-500";
  const adStroke = adTrend === "Rising" ? "#22c55e" : "#ef4444";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="text-sm font-semibold">Market Breadth</h3>

      {/* A/D Line Chart */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">NYSE Advance/Decline Line (30-day)</span>
          <span className={cn("font-medium", adColor)}>{adTrend}</span>
        </div>
        <svg viewBox={`0 0 ${chartW} ${chartH + 4}`} className="w-full h-16">
          {/* Zero/midline */}
          <line x1="0" y1={chartH / 2} x2={chartW} y2={chartH / 2}
            stroke="rgba(107,114,128,0.25)" strokeDasharray="3 3" strokeWidth={0.8} />
          {/* Fill area */}
          <polygon
            points={`0,${chartH} ${adPoints.join(" ")} ${chartW},${chartH}`}
            fill={adTrend === "Rising" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"}
          />
          <polyline
            points={adPoints.join(" ")}
            fill="none"
            stroke={adStroke}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>30 days ago</span>
          <span>Current: {data.adLine[data.adLine.length - 1].toLocaleString()}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Above 50-day MA", value: data.aboveMa50, suffix: "% of S&P 500", threshold: 50 },
          { label: "Above 200-day MA", value: data.aboveMa200, suffix: "% of S&P 500", threshold: 50 },
        ].map((item) => {
          const isHealthy = item.value > item.threshold;
          return (
            <div key={item.label} className="bg-muted/40 rounded-lg p-3 space-y-1.5">
              <p className="text-[11px] font-medium">{item.label}</p>
              <p className={cn("font-mono tabular-nums text-xl font-bold", isHealthy ? "text-emerald-500" : "text-red-400")}>
                {item.value}%
              </p>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", isHealthy ? "bg-emerald-500" : "bg-red-500")}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{item.suffix}</p>
            </div>
          );
        })}
      </div>

      {/* New Highs vs Lows */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">New 52-Week Highs vs Lows</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono tabular-nums font-semibold text-emerald-500 w-12 text-right">
            {data.highs52w}
          </span>
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden flex">
            <div
              className="h-full bg-emerald-500/70 rounded-l-full"
              style={{ width: `${(data.highs52w / (data.highs52w + data.lows52w)) * 100}%` }}
            />
            <div className="h-full bg-red-500/70 flex-1 rounded-r-full" />
          </div>
          <span className="font-mono tabular-nums font-semibold text-red-400 w-12">
            {data.lows52w}
          </span>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>New Highs</span>
          <span>New Lows</span>
        </div>
      </div>

      {/* McClellan Oscillator */}
      <div className="rounded-lg bg-muted/40 p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">McClellan Oscillator</span>
          <span className={cn("font-mono tabular-nums font-bold", data.mcclellan > 0 ? "text-emerald-500" : "text-red-400")}>
            {data.mcclellan > 0 ? "+" : ""}{data.mcclellan}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden relative">
          <div
            className={cn("absolute top-0 h-full w-1 rounded-full", data.mcclellan > 0 ? "bg-emerald-500" : "bg-red-500")}
            style={{ left: `${Math.min(Math.max(50 + (data.mcclellan / 160) * 50, 2), 98)}%` }}
          />
          <div className="absolute top-0 left-1/2 w-px h-full bg-muted-foreground/30" />
        </div>
        <p className="text-[10px] text-muted-foreground">
          {data.mcclellan > 60
            ? "Overbought — breadth surge may reverse"
            : data.mcclellan > 0
              ? "Positive — breadth is expanding"
              : data.mcclellan > -60
                ? "Negative — breadth is contracting"
                : "Oversold — potential breadth reversal"}
        </p>
      </div>
    </div>
  );
}

// 4. VIX Term Structure

function VixTermStructure({ data }: { data: VixTermData }) {
  const bars = [
    { label: "VIX9D", value: data.vix9d },
    { label: "VIX", value: data.vix },
    { label: "VIX3M", value: data.vix3m },
    { label: "VIX6M", value: data.vix6m },
  ];
  const maxVal = Math.max(...bars.map((b) => b.value));
  const isBackwardation = data.vix9d > data.vix || data.vix > data.vix3m;
  const structureLabel = isBackwardation ? "Backwardation" : "Contango";
  const structureColor = isBackwardation ? "text-red-500 bg-red-500/10" : "text-emerald-500 bg-emerald-500/10";

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">VIX Term Structure</h3>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", structureColor)}>
          {structureLabel}
        </span>
      </div>

      {/* Bar chart */}
      <div className="space-y-2">
        {bars.map((b) => {
          const barWidth = (b.value / maxVal) * 100;
          const barColor = b.value < 15 ? "bg-emerald-500" : b.value < 20 ? "bg-yellow-500" : b.value < 30 ? "bg-orange-500" : "bg-red-500";
          return (
            <div key={b.label} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-medium w-14 shrink-0">{b.label}</span>
                <div className="flex-1 h-5 bg-muted rounded overflow-hidden mx-2">
                  <div className={cn("h-full rounded", barColor)} style={{ width: `${barWidth}%` }} />
                </div>
                <span className="font-mono tabular-nums font-semibold w-10 text-right">
                  {b.value.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Structure explanation */}
      <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
        <p className="font-medium">
          {isBackwardation
            ? "Backwardation: Near-term fear exceeds long-term. Typically signals acute market stress."
            : "Contango: Long-term uncertainty priced higher. Normal market conditions."}
        </p>
        <p className="text-muted-foreground text-[11px]">
          VIX9D = 9-day implied vol · VIX = 30-day · VIX3M = 93-day · VIX6M = 180-day
        </p>
      </div>

      {/* Spike history */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Recent Spikes above 30</p>
        <div className="space-y-1">
          {data.spikes.map((spike, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono">{spike.date}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${Math.min((spike.value / 60) * 100, 100)}%` }}
                  />
                </div>
                <span className="font-mono tabular-nums font-semibold text-red-400 w-8 text-right">
                  {spike.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Sentiment Summary Card

function SentimentSummaryCard({
  fgValue,
  pcr,
  breadth,
  vixData,
}: {
  fgValue: number;
  pcr: number;
  breadth: BreadthData;
  vixData: VixTermData;
}) {
  // Each indicator: true = bullish/greed signal, false = fear signal
  const indicators: { name: string; bullish: boolean; detail: string }[] = [
    {
      name: "Fear & Greed",
      bullish: fgValue > 50,
      detail: `${fgValue}/100 — ${getFGLevel(fgValue).label}`,
    },
    {
      name: "Put/Call Ratio",
      bullish: pcr < 0.85,
      detail: `${pcr.toFixed(2)} — ${pcr > 1.2 ? "Extreme hedging" : pcr < 0.7 ? "Extreme bullish bets" : "Moderate"}`,
    },
    {
      name: "Above 50-day MA",
      bullish: breadth.aboveMa50 > 50,
      detail: `${breadth.aboveMa50}% of S&P 500 above 50-MA`,
    },
    {
      name: "Above 200-day MA",
      bullish: breadth.aboveMa200 > 50,
      detail: `${breadth.aboveMa200}% of S&P 500 above 200-MA`,
    },
    {
      name: "Highs vs Lows",
      bullish: breadth.highs52w > breadth.lows52w,
      detail: `${breadth.highs52w} highs vs ${breadth.lows52w} lows`,
    },
    {
      name: "McClellan Osc.",
      bullish: breadth.mcclellan > 0,
      detail: `${breadth.mcclellan > 0 ? "+" : ""}${breadth.mcclellan} — ${breadth.mcclellan > 0 ? "Expanding breadth" : "Contracting breadth"}`,
    },
    {
      name: "VIX Term Structure",
      bullish: !( vixData.vix9d > vixData.vix || vixData.vix > vixData.vix3m ),
      detail: `${vixData.vix9d > vixData.vix || vixData.vix > vixData.vix3m ? "Backwardation — stress signal" : "Contango — normal"}`,
    },
    {
      name: "VIX Level",
      bullish: vixData.vix < 20,
      detail: `VIX at ${vixData.vix.toFixed(1)} — ${vixData.vix < 15 ? "Low fear" : vixData.vix < 20 ? "Moderate" : "Elevated fear"}`,
    },
  ];

  const temp = getMarketTemperature(indicators.map((i) => i.bullish));
  const bullCount = indicators.filter((i) => i.bullish).length;
  const bearCount = indicators.length - bullCount;

  const tempColors: Record<string, string> = {
    Icy: "from-blue-900/30 to-blue-800/10 border-blue-500/20",
    Cool: "from-cyan-900/30 to-cyan-800/10 border-cyan-500/20",
    Warm: "from-yellow-900/30 to-yellow-800/10 border-yellow-500/20",
    Hot: "from-orange-900/30 to-orange-800/10 border-orange-500/20",
    Overheated: "from-red-900/30 to-red-800/10 border-red-500/20",
  };

  const thermometerWidth = (bullCount / indicators.length) * 100;

  return (
    <div className={cn(
      "rounded-lg border bg-gradient-to-br p-4 space-y-4",
      tempColors[temp.label] ?? "from-muted/30 to-muted/10 border-border",
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Market Temperature</h3>
        <span className={cn("text-lg font-bold tracking-tight", temp.color)}>
          {temp.label}
        </span>
      </div>

      {/* Thermometer bar */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-blue-400 font-medium w-8 text-right shrink-0">Icy</span>
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden flex">
            {["bg-blue-400", "bg-cyan-400", "bg-yellow-400", "bg-orange-400", "bg-red-400"].map((c, i) => (
              <div key={i} className={cn("h-full flex-1", c, "opacity-30")} />
            ))}
            <div
              className="absolute inset-y-0 left-0 h-3 rounded-full transition-all"
              style={{ background: "linear-gradient(to right, #60a5fa, #fb923c)", width: `${thermometerWidth}%` }}
            />
          </div>
          <span className="text-red-400 font-medium w-14 shrink-0">Overheated</span>
        </div>
        <p className="text-xs text-muted-foreground text-center">{temp.desc}</p>
      </div>

      {/* Contrarian signal */}
      <div className="rounded-lg bg-muted/40 p-3 space-y-1">
        <p className="text-xs font-medium">Contrarian Signal</p>
        <p className="text-xs text-muted-foreground">
          {bearCount >= 6
            ? `${Math.round((bearCount / indicators.length) * 100)}% of indicators show fear — historically a contrarian buy zone`
            : bullCount >= 6
              ? `${Math.round((bullCount / indicators.length) * 100)}% of indicators show greed — historically a caution zone`
              : `Market is split ${bullCount} bullish / ${bearCount} bearish — no strong contrarian signal`}
        </p>
      </div>

      {/* Indicator breakdown */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Indicator Breakdown</p>
        <div className="space-y-1">
          {indicators.map((ind) => (
            <div key={ind.name} className="flex items-start gap-2 text-xs">
              <div className={cn(
                "mt-0.5 w-1.5 h-1.5 rounded-full shrink-0",
                ind.bullish ? "bg-emerald-500" : "bg-red-500",
              )} />
              <div className="min-w-0">
                <span className="font-medium">{ind.name}</span>
                <span className="text-muted-foreground ml-1.5 text-[11px]">{ind.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SentimentAggregator() {
  const dayBucket = Math.floor(Date.now() / 86400000);

  const fgHistory = useMemo(() => generateFGHistory(3001 + dayBucket), [dayBucket]);
  const fgValue = fgHistory[fgHistory.length - 1].value;

  const pcData = useMemo(() => generatePutCallData(4001 + dayBucket), [dayBucket]);
  const breadthData = useMemo(() => generateBreadthData(5001 + dayBucket), [dayBucket]);
  const vixTermData = useMemo(() => generateVixTermData(6001 + dayBucket), [dayBucket]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold">Sentiment Aggregator</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Composite market sentiment from Fear &amp; Greed, breadth, volatility, and options flow
        </p>
      </div>

      {/* Top row: Summary + F&G Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SentimentSummaryCard
          fgValue={fgValue}
          pcr={pcData.total}
          breadth={breadthData}
          vixData={vixTermData}
        />
        <FearGreedGauge value={fgValue} history={fgHistory} />
      </div>

      {/* Second row: Put/Call + Breadth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PutCallDashboard data={pcData} />
        <MarketBreadthSection data={breadthData} />
      </div>

      {/* Third row: VIX Term Structure */}
      <VixTermStructure data={vixTermData} />
    </div>
  );
}
