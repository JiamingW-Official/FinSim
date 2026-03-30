"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2,
  Flame,
  Gem,
  Leaf,
  Activity,
  Zap,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 53;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};

// Pre-generate stable data values upfront
const _vals = Array.from({ length: 2000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmt(n: number, d = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function fmtPct(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}
function fmtLarge(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

// ── Color helpers ──────────────────────────────────────────────────────────────
const pos = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");

// ── DATA ───────────────────────────────────────────────────────────────────────

interface Commodity {
  name: string;
  ticker: string;
  sector: "Energy" | "Metals" | "Agriculture" | "Softs";
  price: number;
  unit: string;
  change: number;
  ytd: number;
  high52: number;
  low52: number;
  vol: number;
}

const COMMODITIES: Commodity[] = [
  // Energy
  { name: "WTI Crude Oil", ticker: "CL", sector: "Energy", price: 78.42, unit: "$/bbl", change: 1.23, ytd: 4.8, high52: 95.3, low52: 63.7, vol: 28.4 },
  { name: "Brent Crude", ticker: "BZ", sector: "Energy", price: 82.17, unit: "$/bbl", change: 0.98, ytd: 3.9, high52: 97.1, low52: 67.2, vol: 27.1 },
  { name: "Natural Gas", ticker: "NG", sector: "Energy", price: 2.84, unit: "$/MMBtu", change: -3.21, ytd: -18.3, high52: 4.92, low52: 1.94, vol: 56.7 },
  { name: "RBOB Gasoline", ticker: "RB", sector: "Energy", price: 2.31, unit: "$/gal", change: 1.87, ytd: 7.2, high52: 3.05, low52: 1.82, vol: 30.2 },
  { name: "Heating Oil", ticker: "HO", sector: "Energy", price: 2.67, unit: "$/gal", change: 0.43, ytd: 2.1, high52: 3.41, low52: 2.12, vol: 29.8 },
  { name: "Coal", ticker: "MTF", sector: "Energy", price: 127.4, unit: "$/mt", change: -1.12, ytd: -8.6, high52: 189.2, low52: 115.3, vol: 35.1 },
  // Metals
  { name: "Gold", ticker: "GC", sector: "Metals", price: 2318.5, unit: "$/oz", change: 0.34, ytd: 11.2, high52: 2431.8, low52: 1825.3, vol: 14.3 },
  { name: "Silver", ticker: "SI", sector: "Metals", price: 27.84, unit: "$/oz", change: 1.42, ytd: 8.7, high52: 32.51, low52: 20.14, vol: 28.6 },
  { name: "Copper", ticker: "HG", sector: "Metals", price: 4.21, unit: "$/lb", change: 2.14, ytd: 14.3, high52: 4.63, low52: 3.52, vol: 22.4 },
  { name: "Platinum", ticker: "PL", sector: "Metals", price: 958.3, unit: "$/oz", change: -0.87, ytd: -3.2, high52: 1124.7, low52: 843.2, vol: 18.9 },
  { name: "Palladium", ticker: "PA", sector: "Metals", price: 987.4, unit: "$/oz", change: -1.43, ytd: -21.4, high52: 1412.3, low52: 872.1, vol: 33.7 },
  { name: "Aluminum", ticker: "ALI", sector: "Metals", price: 2312.5, unit: "$/mt", change: 0.72, ytd: 5.8, high52: 2580.0, low52: 2042.3, vol: 19.2 },
  // Agriculture
  { name: "Corn", ticker: "ZC", sector: "Agriculture", price: 437.5, unit: "c/bu", change: -0.54, ytd: -6.8, high52: 518.25, low52: 403.5, vol: 22.1 },
  { name: "Wheat", ticker: "ZW", sector: "Agriculture", price: 548.25, unit: "c/bu", change: 1.23, ytd: -3.4, high52: 672.5, low52: 482.75, vol: 27.3 },
  { name: "Soybeans", ticker: "ZS", sector: "Agriculture", price: 1172.5, unit: "c/bu", change: -0.89, ytd: -8.1, high52: 1418.0, low52: 1071.5, vol: 20.8 },
  { name: "Soybean Oil", ticker: "ZL", sector: "Agriculture", price: 44.82, unit: "c/lb", change: -1.24, ytd: -11.3, high52: 59.73, low52: 41.31, vol: 26.4 },
  { name: "Live Cattle", ticker: "LE", sector: "Agriculture", price: 187.325, unit: "c/lb", change: 0.33, ytd: 9.7, high52: 194.75, low52: 162.35, vol: 12.8 },
  { name: "Lean Hogs", ticker: "HE", sector: "Agriculture", price: 91.45, unit: "c/lb", change: -1.87, ytd: 3.2, high52: 108.35, low52: 72.15, vol: 24.6 },
  // Softs
  { name: "Coffee (Arabica)", ticker: "KC", sector: "Softs", price: 187.35, unit: "c/lb", change: 2.41, ytd: 22.4, high52: 213.8, low52: 148.2, vol: 31.4 },
  { name: "Sugar #11", ticker: "SB", sector: "Softs", price: 19.84, unit: "c/lb", change: -0.98, ytd: -7.3, high52: 28.37, low52: 17.92, vol: 29.7 },
  { name: "Cocoa", ticker: "CC", sector: "Softs", price: 8432.0, unit: "$/mt", change: -2.14, ytd: 68.2, high52: 10980.0, low52: 2972.0, vol: 57.3 },
  { name: "Cotton", ticker: "CT", sector: "Softs", price: 74.83, unit: "c/lb", change: 0.67, ytd: -5.1, high52: 95.21, low52: 68.42, vol: 23.8 },
  { name: "Orange Juice", ticker: "OJ", sector: "Softs", price: 382.15, unit: "c/lb", change: -3.12, ytd: 12.7, high52: 437.9, low52: 248.6, vol: 38.2 },
  { name: "Lumber", ticker: "LBS", sector: "Softs", price: 524.3, unit: "$/MBF", change: 1.83, ytd: 14.8, high52: 612.4, low52: 374.8, vol: 42.1 },
];

// ── Mini sparkline generator ───────────────────────────────────────────────────
function genSparkline(seed: number, n = 30, trend = 0): number[] {
  let localS = seed;
  const localRand = () => {
    localS = (localS * 1103515245 + 12345) & 0x7fffffff;
    return localS / 0x7fffffff;
  };
  const pts: number[] = [100];
  for (let i = 1; i < n; i++) {
    pts.push(pts[i - 1] * (1 + (localRand() - 0.48 + trend * 0.01) * 0.03));
  }
  return pts;
}

function SparkLine({ data, positive, w = 80, h = 30 }: { data: number[]; positive: boolean; w?: number; h?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={positive ? "#34d399" : "#f87171"} strokeWidth="1.5" />
    </svg>
  );
}

// ── SECTOR PERFORMANCE BARS ────────────────────────────────────────────────────
function SectorBar({ label, ytd, color }: { label: string; ytd: number; color: string }) {
  const pct = Math.min(Math.abs(ytd), 30);
  const barWidth = (pct / 30) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={ytd >= 0 ? "text-emerald-400" : "text-red-400"}>{fmtPct(ytd)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

// ── CPI vs Commodity Index SVG ─────────────────────────────────────────────────
function CpiCommodityChart() {
  const months = 36;
  const cpiData: number[] = [100];
  const commData: number[] = [100];
  for (let i = 1; i < months; i++) {
    cpiData.push(cpiData[i - 1] * (1 + (sv() * 0.004 + 0.002)));
    commData.push(commData[i - 1] * (1 + (sv() - 0.47) * 0.08));
  }
  const W = 500; const H = 150;
  const minV = Math.min(...cpiData, ...commData) * 0.95;
  const maxV = Math.max(...cpiData, ...commData) * 1.05;
  const toY = (v: number) => H - ((v - minV) / (maxV - minV)) * H;
  const toX = (i: number) => (i / (months - 1)) * W;
  const cpiPts = cpiData.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const commPts = commData.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
      <polyline points={cpiPts} fill="none" stroke="#f59e0b" strokeWidth="2" />
      <polyline points={commPts} fill="none" stroke="#60a5fa" strokeWidth="2" />
      <text x="4" y="12" fill="#f59e0b" fontSize="10">CPI Index</text>
      <text x="4" y="26" fill="#60a5fa" fontSize="10">Commodity Index</text>
    </svg>
  );
}

// ── Tab 1: Dashboard ───────────────────────────────────────────────────────────
function DashboardTab() {
  const [sector, setSector] = useState<string>("All");
  const sectors = ["All", "Energy", "Metals", "Agriculture", "Softs"];
  const filtered = sector === "All" ? COMMODITIES : COMMODITIES.filter((c) => c.sector === sector);

  const sectorYtd: Record<string, number> = {};
  sectors.slice(1).forEach((sec) => {
    const items = COMMODITIES.filter((c) => c.sector === sec);
    sectorYtd[sec] = items.reduce((acc, c) => acc + c.ytd, 0) / items.length;
  });

  const sectorColors: Record<string, string> = {
    Energy: "bg-orange-500",
    Metals: "bg-yellow-500",
    Agriculture: "bg-emerald-500",
    Softs: "bg-pink-500",
  };

  const supercyclePhases = [
    { name: "Bust", pct: 20, active: false },
    { name: "Recovery", pct: 30, active: false },
    { name: "Boom", pct: 30, active: true },
    { name: "Peak", pct: 20, active: false },
  ];

  return (
    <div className="space-y-4">
      {/* Animated Ticker Strip */}
      <div className="overflow-hidden border border-border rounded-lg bg-card/60">
        <motion.div
          className="flex gap-3 py-2 px-4 whitespace-nowrap"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...COMMODITIES, ...COMMODITIES].map((c, i) => (
            <span key={i} className="text-sm font-mono">
              <span className="text-muted-foreground">{c.ticker}</span>{" "}
              <span className="text-foreground">{c.price.toFixed(2)}</span>{" "}
              <span className={c.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                {fmtPct(c.change)}
              </span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Sector Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sector YTD Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(sectorYtd).map(([sec, ytd]) => (
              <SectorBar key={sec} label={sec} ytd={ytd} color={sectorColors[sec]} />
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CPI vs Commodity Index (36M)</CardTitle>
          </CardHeader>
          <CardContent>
            <CpiCommodityChart />
            <p className="text-xs text-muted-foreground mt-2">
              Commodities tend to lead CPI by 3–6 months. Current correlation: 0.74
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supercycle Indicator */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Commodity Supercycle Indicator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-3">
            {supercyclePhases.map((p) => (
              <div
                key={p.name}
                className={cn(
                  "flex-1 text-center py-2 rounded text-xs text-muted-foreground font-semibold transition-colors",
                  p.active
                    ? "bg-amber-500/30 border border-amber-500 text-amber-300"
                    : "bg-muted text-muted-foreground"
                )}
                style={{ flexBasis: `${p.pct}%` }}
              >
                {p.name}
                {p.active && <div className="text-amber-400 text-xs">NOW</div>}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Analysis suggests early-Boom phase driven by energy transition demand, China re-opening, and supply underinvestment
            from 2015–2020. Historically, commodity supercycles last 15–20 years (1900–1920, 1960–1980, 1999–2016).
          </p>
        </CardContent>
      </Card>

      {/* Commodity Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">24 Commodities</CardTitle>
            <div className="flex gap-1 flex-wrap">
              {sectors.map((sec) => (
                <Button
                  key={sec}
                  size="sm"
                  variant={sector === sec ? "default" : "outline"}
                  onClick={() => setSector(sec)}
                  className="text-xs text-muted-foreground h-7 px-2"
                >
                  {sec}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs">
                <th className="text-left py-2 pr-4">Commodity</th>
                <th className="text-right pr-4">Price</th>
                <th className="text-right pr-4">Daily</th>
                <th className="text-right pr-4">YTD</th>
                <th className="text-right pr-4">52W H/L</th>
                <th className="text-right pr-4">Vol</th>
                <th className="text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const spark = genSparkline(i * 97 + 31, 20, c.ytd > 0 ? 1 : -1);
                return (
                  <motion.tr
                    key={c.ticker}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2 pr-4">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs">{c.ticker}</span>
                      </div>
                    </td>
                    <td className="text-right pr-4 text-foreground font-mono">
                      {c.price.toFixed(2)}
                      <div className="text-xs text-muted-foreground">{c.unit}</div>
                    </td>
                    <td className={`text-right pr-4 font-mono ${pos(c.change)}`}>{fmtPct(c.change)}</td>
                    <td className={`text-right pr-4 font-mono ${pos(c.ytd)}`}>{fmtPct(c.ytd)}</td>
                    <td className="text-right pr-4 text-muted-foreground text-xs">
                      <div>{fmt(c.high52)}</div>
                      <div>{fmt(c.low52)}</div>
                    </td>
                    <td className="text-right pr-4 text-muted-foreground text-xs">{c.vol.toFixed(1)}%</td>
                    <td className="text-right">
                      <SparkLine data={spark} positive={c.ytd >= 0} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ── BRENT-WTI SPREAD CHART ─────────────────────────────────────────────────────
function BrentWTIChart() {
  const months = 24;
  const spread: number[] = [];
  let cur = 3.2;
  for (let i = 0; i < months; i++) {
    cur += (sv() - 0.5) * 1.2;
    cur = Math.max(0.5, Math.min(8, cur));
    spread.push(cur);
  }
  const W = 500; const H = 100;
  const min = Math.min(...spread) * 0.8;
  const max = Math.max(...spread) * 1.1;
  const toY = (v: number) => H - ((v - min) / (max - min)) * H;
  const toX = (i: number) => (i / (months - 1)) * W;
  const pts = spread.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const areaPath =
    `M${toX(0)},${H} ` +
    spread.map((v, i) => `L${toX(i)},${toY(v)}`).join(" ") +
    ` L${W},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
      <path d={areaPath} fill="rgba(251,191,36,0.1)" />
      <polyline points={pts} fill="none" stroke="#fbbf24" strokeWidth="2" />
    </svg>
  );
}

// ── NAT GAS SEASONAL ───────────────────────────────────────────────────────────
function NatGasSeasonalChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pattern = [4.2, 3.8, 3.1, 2.6, 2.4, 2.7, 3.1, 3.4, 3.0, 2.9, 3.6, 4.5];
  const current: (number | null)[] = [4.1, 3.6, 2.9, 2.7, 2.5, 2.6, 2.8, null, null, null, null, null];
  const W = 500; const H = 120;
  const min = 2.0; const max = 5.0;
  const toY = (v: number) => H - ((v - min) / (max - min)) * H;
  const toX = (i: number) => (i / 11) * W;
  const patPts = pattern.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const curValid = current
    .map((v, i) => ({ v, i }))
    .filter((x): x is { v: number; i: number } => x.v !== null);
  const curPts = curValid.map(({ v, i }) => `${toX(i)},${toY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      <polyline points={patPts} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,3" />
      {curPts && <polyline points={curPts} fill="none" stroke="#22c55e" strokeWidth="2.5" />}
      {months.map((m, i) => (
        <text key={m} x={toX(i)} y={H - 2} fontSize="8" fill="#6b7280" textAnchor="middle">
          {m}
        </text>
      ))}
      <text x="8" y="14" fontSize="9" fill="#94a3b8">5-yr avg</text>
      <text x="8" y="26" fontSize="9" fill="#22c55e">2026</text>
    </svg>
  );
}

// ── OPEC TRACKER ───────────────────────────────────────────────────────────────
const OPEC_MEMBERS = [
  { name: "Saudi Arabia", quota: 9000, actual: 8700 },
  { name: "Iraq", quota: 4220, actual: 4310 },
  { name: "UAE", quota: 3219, actual: 3110 },
  { name: "Kuwait", quota: 2489, actual: 2480 },
  { name: "Iran", quota: 3200, actual: 3380 },
  { name: "Venezuela", quota: 700, actual: 830 },
  { name: "Libya", quota: 1200, actual: 1180 },
  { name: "Algeria", quota: 910, actual: 905 },
  { name: "Nigeria", quota: 1380, actual: 1245 },
  { name: "Gabon", quota: 215, actual: 208 },
  { name: "Congo", quota: 260, actual: 248 },
  { name: "Equat. Guinea", quota: 127, actual: 120 },
  { name: "Russia", quota: 9000, actual: 9120 },
];

function OPECTracker() {
  return (
    <div className="space-y-2">
      {OPEC_MEMBERS.map((m) => {
        const compliance = ((m.actual / m.quota) * 100 - 100).toFixed(1);
        const over = m.actual > m.quota;
        return (
          <div key={m.name} className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="text-muted-foreground w-28 shrink-0">{m.name}</span>
            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full ${over ? "bg-red-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min((m.actual / m.quota) * 100, 110)}%` }}
              />
            </div>
            <span className={`w-16 text-right font-mono ${over ? "text-red-400" : "text-emerald-400"}`}>
              {fmtLarge(m.actual)}k
            </span>
            <span className={`w-14 text-right ${over ? "text-red-400" : "text-emerald-400"}`}>
              {over ? "+" : ""}{compliance}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── ENERGY TRANSITION CHART ────────────────────────────────────────────────────
function EnergyTransitionChart() {
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const iea = [102.3, 101.8, 101.0, 100.1, 98.9, 97.2, 95.4];
  const opec = [102.3, 103.1, 104.2, 105.4, 106.3, 107.1, 108.0];
  const W = 400; const H = 120;
  const min = 94; const max = 110;
  const toY = (v: number) => H - ((v - min) / (max - min)) * H;
  const toX = (i: number) => (i / (years.length - 1)) * W;
  const ieaPts = iea.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const opecPts = opec.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      <polyline points={ieaPts} fill="none" stroke="#34d399" strokeWidth="2" />
      <polyline points={opecPts} fill="none" stroke="#f87171" strokeWidth="2" />
      {years.map((y, i) => (
        <text key={y} x={toX(i)} y={H - 2} fontSize="9" fill="#6b7280" textAnchor="middle">
          {y}
        </text>
      ))}
      <text x="4" y="14" fontSize="9" fill="#34d399">IEA (demand decline)</text>
      <text x="4" y="26" fontSize="9" fill="#f87171">OPEC (demand growth)</text>
    </svg>
  );
}

// ── Tab 2: Energy Complex ──────────────────────────────────────────────────────
function EnergyTab() {
  const wtiStrip = [78.42, 77.85, 77.21, 76.54, 76.03, 75.82, 75.41, 75.09, 74.87, 74.63, 74.38, 74.12];
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const crackSpread = ((2.31 * 42 * 2 + 2.67 * 42) / 3 - 78.42).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* WTI Spot + Strip */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">WTI Crude — 12-Month Futures Strip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-2xl font-semibold text-foreground">$78.42</span>
              <span className="text-emerald-400 text-sm mb-1">+$0.95 (+1.23%)</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {wtiStrip.map((price, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className="w-8 rounded-t"
                    style={{
                      height: `${((price - 73) / 7) * 60 + 10}px`,
                      background: i === 0 ? "#f59e0b" : `rgba(251,191,36,${0.7 - i * 0.05})`,
                    }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">{months[i]}</span>
                  <span className="text-xs text-muted-foreground font-mono">{price.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Contango structure — deferred contracts at slight discount indicate adequate supply</p>
          </CardContent>
        </Card>

        {/* Crack Spread Calculator */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">3-2-1 Crack Spread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground mb-2">3 bbl crude → 2 bbl gasoline + 1 bbl heating oil</div>
            {[
              { label: "Gasoline", val: (2.31 * 42).toFixed(2), color: "text-emerald-400" },
              { label: "Heating Oil", val: (2.67 * 42).toFixed(2), color: "text-primary" },
              { label: "WTI Crude", val: "78.42", color: "text-amber-400" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-mono ${row.color}`}>${row.val}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Crack Spread</span>
                <span className="text-emerald-400 font-mono">${crackSpread}/bbl</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Refiner margin — above $15 is healthy</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Brent-WTI Spread */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Brent–WTI Spread (24M)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-medium text-foreground">${(82.17 - 78.42).toFixed(2)}</span>
              <span className="text-muted-foreground text-sm">Brent premium</span>
            </div>
            <BrentWTIChart />
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
              {[
                { label: "Historic avg", val: "$3.50" },
                { label: "Peak (2012)", val: "$26.40" },
                { label: "Drivers", val: "Logistics, quality" },
                { label: "Signal", val: "Supply tightness" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-muted-foreground">{item.val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nat Gas Seasonal */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Natural Gas — Henry Hub Seasonal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg font-medium text-foreground">$2.84</span>
              <span className="text-red-400 text-sm">−3.21% today</span>
            </div>
            <NatGasSeasonalChart />
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <div>
                <span className="text-muted-foreground">Storage vs 5yr avg</span>
                <div className="text-emerald-400 font-mono">+12.3% above</div>
              </div>
              <div>
                <span className="text-muted-foreground">Heating Degree Days</span>
                <div className="text-muted-foreground font-mono">2,840 YTD</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OPEC Tracker */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">OPEC+ Production Tracker (kbpd)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <OPECTracker />
            <div className="space-y-3">
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground space-y-2">
                <div className="text-muted-foreground font-semibold">OPEC+ Compliance Score</div>
                <Progress value={84} className="h-2" />
                <div className="text-muted-foreground">84% compliance. 3 members over-producing (Iraq, Nigeria, Venezuela)</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {[
                  { label: "Group quota (kbpd)", val: "36,920" },
                  { label: "Group actual (kbpd)", val: "37,635" },
                  { label: "Over-production", val: "+715 kbpd" },
                  { label: "Next meeting", val: "Jun 2026" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-foreground font-mono">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Transition */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Oil Demand Forecast: IEA vs OPEC Divergence</CardTitle>
        </CardHeader>
        <CardContent>
          <EnergyTransitionChart />
          <p className="text-xs text-muted-foreground mt-2">
            IEA projects peak demand by 2028 driven by EV adoption. OPEC projects continued growth via emerging markets.
            Divergence of ~12.6M bpd by 2030 reflects the energy transition debate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── GOLD REAL RATE CHART ───────────────────────────────────────────────────────
function GoldRealRateChart() {
  const pts = 36;
  const realRates: number[] = [];
  const goldPx: number[] = [];
  let rr = -1.2; let gp = 1800;
  for (let i = 0; i < pts; i++) {
    rr += (sv() - 0.5) * 0.4;
    rr = Math.max(-3, Math.min(3, rr));
    gp = gp * (1 - rr * 0.015 + (sv() - 0.5) * 0.02);
    realRates.push(rr);
    goldPx.push(gp);
  }
  const W = 500; const H = 120;
  const gMin = Math.min(...goldPx) * 0.95;
  const gMax = Math.max(...goldPx) * 1.05;
  const rMin = Math.min(...realRates) - 0.5;
  const rMax = Math.max(...realRates) + 0.5;
  const toX = (i: number) => (i / (pts - 1)) * W;
  const toGY = (v: number) => H - ((v - gMin) / (gMax - gMin)) * H;
  const toRY = (v: number) => H - ((v - rMin) / (rMax - rMin)) * H;
  const goldPts = goldPx.map((v, i) => `${toX(i)},${toGY(v)}`).join(" ");
  const ratePts = realRates.map((v, i) => `${toX(i)},${toRY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32">
      <polyline points={goldPts} fill="none" stroke="#fbbf24" strokeWidth="2" />
      <polyline points={ratePts} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="4,2" />
      <text x="4" y="12" fill="#fbbf24" fontSize="9">Gold Price</text>
      <text x="4" y="24" fill="#60a5fa" fontSize="9">Real Rate (inverted correlation)</text>
    </svg>
  );
}

// ── Tab 3: Metals ──────────────────────────────────────────────────────────────
function MetalsTab() {
  const gsRatio = (2318.5 / 27.84).toFixed(1);

  const criticalMinerals = [
    { name: "Lithium", use: "EV Batteries", supply: "Chile/Aus/Argentina", risk: "High", chg: 42.3 },
    { name: "Cobalt", use: "Battery cathodes", supply: "DRC (70%)", risk: "Very High", chg: -18.4 },
    { name: "Nickel", use: "EV/Stainless", supply: "Indonesia/Philippines", risk: "Medium", chg: -23.1 },
    { name: "Manganese", use: "Battery/Steel", supply: "South Africa", risk: "Low", chg: 8.7 },
  ];

  const lmeStocks = [
    { metal: "Copper", stock: 92340, chg: -3420 },
    { metal: "Aluminum", stock: 487250, chg: 12400 },
    { metal: "Nickel", stock: 71820, chg: -1840 },
    { metal: "Zinc", stock: 184320, chg: 3210 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Gold */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gold — Real Rate Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-medium text-foreground">$2,318.50</span>
              <span className="text-emerald-400 text-sm">+0.34%</span>
            </div>
            <GoldRealRateChart />
            <div className="grid grid-cols-2 gap-3 mt-3">
              {[
                { label: "GLD ETF flows (1M)", val: "+$2.4B", color: "text-emerald-400" },
                { label: "IAU ETF flows (1M)", val: "+$1.8B", color: "text-emerald-400" },
                { label: "Central bank buying", val: "387t (2025)", color: "text-amber-400" },
                { label: "Real yield (10yr TIPS)", val: "2.18%", color: "text-primary" },
              ].map((item) => (
                <div key={item.label} className="text-xs text-muted-foreground">
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className={`font-mono ${item.color}`}>{item.val}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Silver / G:S Ratio */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Silver — Gold:Silver Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-medium text-foreground">$27.84</span>
              <span className="text-emerald-400 text-sm">+1.42%</span>
            </div>
            <div className="flex items-center gap-3 mb-3 p-3 bg-muted/50 rounded-lg">
              <div className="text-center flex-1">
                <div className="text-lg font-medium text-amber-400">{gsRatio}</div>
                <div className="text-xs text-muted-foreground">Current G:S Ratio</div>
              </div>
              <div className="text-muted-foreground text-2xl">/</div>
              <div className="text-center flex-1">
                <div className="text-lg font-medium text-muted-foreground">70:1</div>
                <div className="text-xs text-muted-foreground">Historic Average</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Ratio at {gsRatio} vs historic avg 70:1 — silver appears undervalued vs gold
            </p>
            <div className="space-y-2">
              {[
                { label: "Solar panel demand (2026E)", val: "200Moz", pct: 28 },
                { label: "EV/electronics demand", val: "112Moz", pct: 16 },
                { label: "Investment demand", val: "243Moz", pct: 34 },
                { label: "Jewelry/Silverware", val: "163Moz", pct: 23 },
              ].map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.val}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-muted-foreground/60 rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Copper / LME stocks */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Copper — LME Warehouse Stocks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-medium text-foreground">$4.21/lb</span>
              <span className="text-emerald-400 text-sm">+2.14%</span>
            </div>
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left pb-1">Metal</th>
                  <th className="text-right pb-1">LME Stock (mt)</th>
                  <th className="text-right pb-1">Change</th>
                </tr>
              </thead>
              <tbody>
                {lmeStocks.map((row) => (
                  <tr key={row.metal} className="border-b border-border">
                    <td className="py-1.5 text-muted-foreground">{row.metal}</td>
                    <td className="text-right text-muted-foreground font-mono">{fmtLarge(row.stock)}</td>
                    <td className={`text-right font-mono ${row.chg >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {row.chg >= 0 ? "+" : ""}{fmtLarge(row.chg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-xs text-muted-foreground">
              China PMI correlation: 0.81 (6-month lead). Current China Mfg PMI: 51.4 → bullish copper
            </div>
          </CardContent>
        </Card>

        {/* Critical Minerals */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Minerals — Energy Transition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalMinerals.map((m) => (
              <div key={m.name} className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="w-20 shrink-0">
                  <div className="text-foreground font-medium">{m.name}</div>
                  <div className="text-muted-foreground">{m.use}</div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs">{m.supply}</div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 text-xs text-muted-foreground",
                    m.risk === "Very High" && "border-red-500 text-red-400",
                    m.risk === "High" && "border-orange-500 text-orange-400",
                    m.risk === "Medium" && "border-amber-500 text-amber-400",
                    m.risk === "Low" && "border-emerald-500 text-emerald-400"
                  )}
                >
                  {m.risk}
                </Badge>
                <span className={`w-12 text-right font-mono ${pos(m.chg)}`}>{fmtPct(m.chg)}</span>
              </div>
            ))}
            <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
              GDX (Gold Miners ETF) vs Gold beta: 1.8x — amplified exposure with operational leverage risk
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── GRAIN HEATMAP ──────────────────────────────────────────────────────────────
function GrainHeatmap() {
  const crops = ["Corn", "Wheat", "Soybeans"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const cornReturns = [1.2, -0.8, -1.4, 2.3, 3.1, -0.3, -2.1, -1.8, -0.4, 1.9, 0.7, 0.3];
  const wheatReturns = [0.4, 1.2, 2.8, -0.6, -2.4, -3.1, 0.8, 1.4, 2.1, -0.3, 0.9, 1.3];
  const soyReturns = [-0.3, -0.8, 1.3, 2.7, 3.4, -1.2, -2.8, -0.9, 1.8, 2.4, 0.6, -1.1];
  const allReturns = [cornReturns, wheatReturns, soyReturns];
  const colorForRet = (v: number) => {
    if (v > 2) return "bg-emerald-500/80";
    if (v > 0.5) return "bg-emerald-500/40";
    if (v > -0.5) return "bg-muted";
    if (v > -2) return "bg-red-500/40";
    return "bg-red-500/80";
  };

  return (
    <div className="overflow-x-auto">
      <table className="text-xs text-muted-foreground w-full">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left pr-2 py-1 w-20">Crop</th>
            {months.map((m) => (
              <th key={m} className="w-10 text-center py-1">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {crops.map((crop, ci) => (
            <tr key={crop}>
              <td className="text-muted-foreground pr-2 py-1 font-medium">{crop}</td>
              {allReturns[ci].map((v, mi) => (
                <td key={mi} className="py-1">
                  <div
                    className={cn("w-9 h-7 rounded flex items-center justify-center text-xs text-muted-foreground font-mono", colorForRet(v))}
                    title={`${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                  >
                    {v > 0 ? "+" : ""}{v.toFixed(1)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── WASDE TABLE ────────────────────────────────────────────────────────────────
const WASDE_DATA = [
  { crop: "Corn", supply: 2420, demand: 2305, stocks: 1847, stocksToUse: "14.2%", chgYoY: "+3.2%" },
  { crop: "Wheat", supply: 1032, demand: 998, stocks: 284, stocksToUse: "28.5%", chgYoY: "-1.8%" },
  { crop: "Soybeans", supply: 423, demand: 407, stocks: 338, stocksToUse: "9.8%", chgYoY: "-2.1%" },
];

// ── Tab 4: Agriculture ─────────────────────────────────────────────────────────
function AgricultureTab() {
  const faoIndex = [100, 104.2, 108.7, 112.3, 119.8, 127.4, 121.8, 115.3, 109.7, 105.2, 101.8, 98.4, 102.1, 107.3, 113.8, 121.2, 118.4, 114.7, 111.3, 108.9, 105.6, 103.1, 106.4, 110.2];
  const W = 500; const H = 100;
  const faoMin = 95; const faoMax = 130;
  const toFaoY = (v: number) => H - ((v - faoMin) / (faoMax - faoMin)) * H;
  const toFaoX = (i: number) => (i / (faoIndex.length - 1)) * W;
  const faoPts = faoIndex.map((v, i) => `${toFaoX(i)},${toFaoY(v)}`).join(" ");

  return (
    <div className="space-y-4">
      {/* Grain Heatmap */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Grain Seasonal Returns Heatmap (avg monthly %)</CardTitle>
        </CardHeader>
        <CardContent>
          <GrainHeatmap />
          <p className="text-xs text-muted-foreground mt-2">
            Green = historically positive months. Key patterns: Corn rallies in spring planting (Apr–May), wheat sells off Jun–Jul harvest.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Weather Risk */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weather Risk — La Nina / El Nino</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-muted/10 text-primary border-primary">La Nina (Active)</Badge>
              <span className="text-xs text-muted-foreground">ONI Index: −1.4</span>
            </div>
            {[
              { region: "US Midwest", crop: "Corn/Soy", impact: "Drier conditions", risk: "Moderate" },
              { region: "Brazil/Argentina", crop: "Soybeans", impact: "Below avg rainfall", risk: "High" },
              { region: "SE Asia", crop: "Palm Oil/Rice", impact: "Drought risk", risk: "High" },
              { region: "Australia", crop: "Wheat", impact: "Above avg rainfall", risk: "Low" },
              { region: "West Africa", crop: "Cocoa", impact: "Dry Harmattan", risk: "Very High" },
            ].map((row) => (
              <div key={row.region} className="flex items-center gap-3 text-xs text-muted-foreground border-b border-border pb-2">
                <div className="w-28 text-muted-foreground">{row.region}</div>
                <div className="text-muted-foreground flex-1">{row.crop}</div>
                <div className="text-muted-foreground">{row.impact}</div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0",
                    row.risk === "Very High" && "border-red-500 text-red-400",
                    row.risk === "High" && "border-orange-500 text-orange-400",
                    row.risk === "Moderate" && "border-amber-500 text-amber-400",
                    row.risk === "Low" && "border-emerald-500 text-emerald-400"
                  )}
                >
                  {row.risk}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Crop Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Crop Progress Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { crop: "Corn Planting", current: 62, priorYr: 58, avg5yr: 60 },
              { crop: "Corn Emerged", current: 42, priorYr: 38, avg5yr: 40 },
              { crop: "Soy Planting", current: 38, priorYr: 35, avg5yr: 37 },
              { crop: "Winter Wheat", current: 78, priorYr: 74, avg5yr: 76 },
              { crop: "Spring Wheat", current: 29, priorYr: 25, avg5yr: 28 },
            ].map((row) => (
              <div key={row.crop} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-muted-foreground">{row.crop}</span>
                  <span className="text-muted-foreground">Avg {row.avg5yr}% | Prior {row.priorYr}%</span>
                </div>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-emerald-500/30 rounded-full"
                    style={{ width: `${row.avg5yr}%` }}
                  />
                  <div
                    className="absolute h-full bg-emerald-500 rounded-full opacity-90"
                    style={{ width: `${row.current}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-foreground font-mono">
                    {row.current}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* WASDE */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">USDA WASDE Report — Supply/Demand Balance (MMT)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-2 pr-4">Crop</th>
                <th className="text-right pr-4">Supply</th>
                <th className="text-right pr-4">Demand</th>
                <th className="text-right pr-4">End Stocks</th>
                <th className="text-right pr-4">Stks/Use</th>
                <th className="text-right">YoY</th>
              </tr>
            </thead>
            <tbody>
              {WASDE_DATA.map((row) => (
                <tr key={row.crop} className="border-b border-border">
                  <td className="py-2 pr-4 text-foreground font-medium">{row.crop}</td>
                  <td className="text-right pr-4 font-mono text-muted-foreground">{row.supply}</td>
                  <td className="text-right pr-4 font-mono text-muted-foreground">{row.demand}</td>
                  <td className="text-right pr-4 font-mono text-muted-foreground">{row.stocks}</td>
                  <td className="text-right pr-4 font-mono text-amber-400">{row.stocksToUse}</td>
                  <td className={`text-right font-mono ${row.chgYoY.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>
                    {row.chgYoY}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* FAO Food Price Index */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">FAO Food Price Index (2002–2004 = 100)</CardTitle>
        </CardHeader>
        <CardContent>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
            <line x1="0" y1={toFaoY(120)} x2={W} y2={toFaoY(120)} stroke="#6b7280" strokeWidth="1" strokeDasharray="3,2" />
            <polyline points={faoPts} fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x={W - 80} y={toFaoY(120) - 4} fontSize="9" fill="#6b7280">Danger zone</text>
          </svg>
          <div className="grid grid-cols-3 gap-3 mt-3 text-xs text-muted-foreground">
            {[
              { label: "Current Index", val: "110.2", color: "text-amber-400" },
              { label: "2022 Peak (War)", val: "159.7", color: "text-red-400" },
              { label: "Implication", val: "Elevated vs history", color: "text-muted-foreground" },
            ].map((item) => (
              <div key={item.label}>
                <div className="text-muted-foreground">{item.label}</div>
                <div className={`font-mono ${item.color}`}>{item.val}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── FUTURES CURVE CHART ────────────────────────────────────────────────────────
function FuturesCurveChart({
  name,
  prices,
  months,
  contango,
}: {
  name: string;
  prices: number[];
  months: string[];
  contango: boolean;
}) {
  const W = 240; const H = 80;
  const min = Math.min(...prices) * 0.98;
  const max = Math.max(...prices) * 1.02;
  const toY = (v: number) => H - ((v - min) / (max - min)) * H;
  const toX = (i: number) => (i / (prices.length - 1)) * W;
  const pts = prices.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
  const priceDiffPct = ((prices[prices.length - 1] / prices[0] - 1) * 100).toFixed(2);

  return (
    <div className="p-3 bg-muted/40 rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <Badge
          variant="outline"
          className={contango ? "border-red-500 text-red-400 text-xs" : "border-emerald-500 text-emerald-400 text-xs"}
        >
          {contango ? "Contango" : "Backwardation"}
        </Badge>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 60 }}>
        <polyline points={pts} fill="none" stroke={contango ? "#f87171" : "#34d399"} strokeWidth="2" />
        {prices.map((v, i) => (
          <circle key={i} cx={toX(i)} cy={toY(v)} r="3" fill={contango ? "#f87171" : "#34d399"} />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        {months.map((m) => <span key={m}>{m}</span>)}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span className="text-muted-foreground">F1: {prices[0].toFixed(2)}</span>
        <span className="text-muted-foreground">F{prices.length}: {prices[prices.length - 1].toFixed(2)}</span>
        <span className={contango ? "text-red-400" : "text-emerald-400"}>
          {parseFloat(priceDiffPct) >= 0 ? "+" : ""}{priceDiffPct}%
        </span>
      </div>
    </div>
  );
}

// ── Tab 5: Futures Curve ───────────────────────────────────────────────────────
function FuturesCurveTab() {
  const curves: Array<{
    name: string;
    prices: number[];
    months: string[];
    contango: boolean;
  }> = [
    {
      name: "WTI Crude",
      prices: [78.42, 77.85, 77.21, 76.54, 76.03, 75.82, 75.12],
      months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      contango: false,
    },
    {
      name: "Natural Gas",
      prices: [2.84, 2.91, 3.02, 3.18, 3.41, 3.68, 4.12],
      months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      contango: true,
    },
    {
      name: "Gold",
      prices: [2318.5, 2324.8, 2331.2, 2337.9, 2344.7, 2351.2, 2358.1],
      months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      contango: true,
    },
    {
      name: "Corn",
      prices: [437.5, 441.2, 439.8, 438.5, 443.2, 447.8, 451.3],
      months: ["May", "Jul", "Sep", "Dec", "Mar", "May", "Jul"],
      contango: true,
    },
    {
      name: "Soybeans",
      prices: [1172.5, 1165.8, 1158.3, 1153.4, 1149.7, 1148.2, 1147.1],
      months: ["May", "Jul", "Aug", "Sep", "Nov", "Jan", "Mar"],
      contango: false,
    },
    {
      name: "Copper",
      prices: [4.21, 4.19, 4.17, 4.14, 4.12, 4.10, 4.08],
      months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      contango: false,
    },
    {
      name: "Silver",
      prices: [27.84, 27.92, 28.01, 28.09, 28.18, 28.27, 28.36],
      months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      contango: true,
    },
    {
      name: "Wheat",
      prices: [548.25, 546.0, 543.5, 552.3, 558.7, 562.4, 555.8],
      months: ["May", "Jul", "Sep", "Dec", "Mar", "May", "Jul"],
      contango: false,
    },
  ];

  const rollSchedule = [
    { commodity: "WTI Crude", exchange: "NYMEX", rollDay: "3rd biz day before 25th" },
    { commodity: "Natural Gas", exchange: "NYMEX", rollDay: "3rd biz day before 1st" },
    { commodity: "Gold", exchange: "COMEX", rollDay: "1st biz day of delivery month" },
    { commodity: "Corn", exchange: "CBOT", rollDay: "First notice day − 5 days" },
    { commodity: "Soybeans", exchange: "CBOT", rollDay: "First notice day − 5 days" },
    { commodity: "Coffee", exchange: "ICE", rollDay: "~10 biz days before expiry" },
    { commodity: "Cocoa", exchange: "ICE", rollDay: "~10 biz days before expiry" },
    { commodity: "Sugar #11", exchange: "ICE", rollDay: "~10 biz days before expiry" },
  ];

  const indexWeights = [
    { commodity: "Energy", gsci: 63.2, bloomberg: 30.4 },
    { commodity: "Agriculture", gsci: 12.1, bloomberg: 22.8 },
    { commodity: "Metals", gsci: 7.4, bloomberg: 19.2 },
    { commodity: "Livestock", gsci: 6.8, bloomberg: 5.1 },
    { commodity: "Precious Metals", gsci: 10.5, bloomberg: 22.5 },
  ];

  return (
    <div className="space-y-4">
      {/* Contango/Backwardation explainer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400">Backwardation — Bullish Signal</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>Spot price &gt; Futures price. Indicates near-term scarcity or supply tightness.</p>
            <p><span className="text-emerald-400 font-medium">Roll yield: Positive</span> — rolling to cheaper deferred contracts generates return</p>
            <p>Examples: WTI during OPEC cuts, Soybeans during drought, Copper during China demand surge</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Contango — Carry Cost</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>Futures price &gt; Spot price. Reflects storage costs, financing, and convenience yield.</p>
            <p><span className="text-red-400 font-medium">Roll yield: Negative</span> — rolling to more expensive contracts erodes return</p>
            <p>Examples: Natural Gas in summer, Gold (reflect rate cost), Corn in good supply years</p>
          </CardContent>
        </Card>
      </div>

      {/* Curves grid */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Forward Curves — Front Month vs Deferred</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {curves.map((c) => (
              <FuturesCurveChart key={c.name} {...c} />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Index Comparison */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GSCI vs Bloomberg Commodity Weighting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {indexWeights.map((row) => (
                <div key={row.commodity} className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{row.commodity}</span>
                    <span className="text-muted-foreground">GSCI {row.gsci}% / BCOM {row.bloomberg}%</span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div className="flex-1 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-amber-500/60" style={{ width: `${row.gsci}%` }} />
                    </div>
                    <div className="flex-1 bg-muted rounded overflow-hidden">
                      <div className="h-full bg-primary/60" style={{ width: `${row.bloomberg}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500/60 rounded-sm inline-block" />GSCI (production-weighted)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary/60 rounded-sm inline-block" />BCOM (more diversified)
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Roll Schedule */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Front-Month Contract Roll Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-xs text-muted-foreground">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left pb-1">Commodity</th>
                  <th className="text-left pb-1">Exchange</th>
                  <th className="text-left pb-1">Roll Rule</th>
                </tr>
              </thead>
              <tbody>
                {rollSchedule.map((row) => (
                  <tr key={row.commodity} className="border-b border-border">
                    <td className="py-1.5 text-muted-foreground font-medium">{row.commodity}</td>
                    <td className="text-muted-foreground">{row.exchange}</td>
                    <td className="text-muted-foreground">{row.rollDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Spread */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Calendar Spread — Natural Gas Winter/Summer Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-xs mb-1">Long Jan 2027</div>
              <div className="text-xl font-medium text-foreground">$4.12</div>
              <div className="text-xs text-muted-foreground mt-1">Winter peak demand</div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-muted-foreground text-xs mb-1">Short Jul 2026</div>
              <div className="text-xl font-medium text-foreground">$3.18</div>
              <div className="text-xs text-muted-foreground mt-1">Summer injection season</div>
            </div>
            <div className="p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg">
              <div className="text-muted-foreground text-xs mb-1">Calendar Spread</div>
              <div className="text-xl font-medium text-emerald-400">+$0.94</div>
              <div className="text-xs text-muted-foreground mt-1">Seasonal premium (avg: $0.65)</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Buy Jan/Sell Jul captures seasonal heating demand premium. Risk: mild winter, elevated storage builds.
            Historical win rate: 62% since 2000.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab 6: Trade Ideas ─────────────────────────────────────────────────────────

interface TradeIdea {
  id: number;
  ticker: string;
  name: string;
  direction: "Long" | "Short";
  entry: number;
  target: number;
  stop: number;
  catalyst: string;
  thesis: string;
  timeframe: string;
  conviction: "High" | "Medium" | "Low";
  rr: number;
  implementation: string;
}

const TRADE_IDEAS: TradeIdea[] = [
  {
    id: 1,
    ticker: "GC",
    name: "Gold",
    direction: "Long",
    entry: 2318,
    target: 2520,
    stop: 2220,
    catalyst: "Fed pivot + central bank demand",
    thesis: "Real rates declining as Fed cuts; record central bank buying (>1000t/yr). Breakout above 2300 confirms new bull leg.",
    timeframe: "3–6 months",
    conviction: "High",
    rr: 2.06,
    implementation: "GLD ETF, GC futures, or gold miner basket (GDX)",
  },
  {
    id: 2,
    ticker: "HG",
    name: "Copper",
    direction: "Long",
    entry: 4.21,
    target: 4.85,
    stop: 3.95,
    catalyst: "China PMI recovery + green energy demand",
    thesis: "Structural supply deficit by 2026–2028 per Wood Mackenzie. China manufacturing PMI trending above 51. Energy transition creates 6–8Mt incremental demand.",
    timeframe: "6–12 months",
    conviction: "High",
    rr: 2.46,
    implementation: "HG futures, COPX ETF, or Freeport-McMoRan (FCX)",
  },
  {
    id: 3,
    ticker: "NG",
    name: "Natural Gas",
    direction: "Long",
    entry: 2.84,
    target: 3.80,
    stop: 2.45,
    catalyst: "LNG export ramp + winter storage draw",
    thesis: "US LNG export capacity +40% by end-2026. Storage currently above 5yr avg but will normalize. Seasonal setup for Q3–Q4 strength.",
    timeframe: "2–4 months",
    conviction: "Medium",
    rr: 2.46,
    implementation: "UNG ETF (decay risk), NG futures roll, or LNG producer stocks",
  },
  {
    id: 4,
    ticker: "ZC",
    name: "Corn",
    direction: "Long",
    entry: 437.5,
    target: 490.0,
    stop: 415.0,
    catalyst: "La Nina dryness + ethanol demand",
    thesis: "La Nina reduces South American crop expectations. US planting pace slightly behind avg. Ethanol margins improving. Stocks-to-use tightening.",
    timeframe: "3–5 months",
    conviction: "Medium",
    rr: 2.33,
    implementation: "ZC futures (CBOT), CORN ETF, or agricultural ETF (DBA)",
  },
  {
    id: 5,
    ticker: "CC",
    name: "Cocoa",
    direction: "Short",
    entry: 8432,
    target: 6200,
    stop: 9800,
    catalyst: "West Africa harvest recovery",
    thesis: "Prices up 68% YTD after historic drought. Forward-looking crop surveys show Harmattan wind easing. Demand destruction at current prices. Extreme backwardation unwinding.",
    timeframe: "2–4 months",
    conviction: "Medium",
    rr: 1.63,
    implementation: "CC futures (ICE), cocoa options (buy puts), or grind demand hedge",
  },
  {
    id: 6,
    ticker: "SI",
    name: "Silver",
    direction: "Long",
    entry: 27.84,
    target: 34.00,
    stop: 25.50,
    catalyst: "Solar demand acceleration + gold breakout",
    thesis: "Solar installations +38% YoY driving industrial demand. Gold at all-time highs historically pulls silver higher. G:S ratio at 83:1 vs 70:1 avg = catch-up potential.",
    timeframe: "3–9 months",
    conviction: "High",
    rr: 2.63,
    implementation: "SLV/PSLV ETF, SI futures, or silver miner basket",
  },
];

function TradeIdeaCard({ idea }: { idea: TradeIdea }) {
  const [open, setOpen] = useState(false);
  const riskPct = (Math.abs((idea.entry - idea.stop) / idea.entry) * 100).toFixed(1);
  const rewardPct = (Math.abs((idea.target - idea.entry) / idea.entry) * 100).toFixed(1);
  const isLong = idea.direction === "Long";

  return (
    <motion.div
      className="border border-border rounded-md bg-card overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Badge className={isLong ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}>
              {idea.direction}
            </Badge>
            <div>
              <div className="text-foreground font-medium">{idea.name}</div>
              <div className="text-muted-foreground text-xs">{idea.ticker} · {idea.timeframe}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "text-xs text-muted-foreground",
                idea.conviction === "High" && "border-emerald-500 text-emerald-400",
                idea.conviction === "Medium" && "border-amber-500 text-amber-400",
                idea.conviction === "Low" && "border-muted-foreground text-muted-foreground"
              )}
            >
              {idea.conviction}
            </Badge>
            <div className="text-right">
              <div className="text-amber-400 font-medium">{idea.rr.toFixed(2)}:1</div>
              <div className="text-muted-foreground text-xs">R:R</div>
            </div>
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="text-center">
            <div className="text-muted-foreground">Entry</div>
            <div className="text-foreground font-mono">{idea.entry.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Target</div>
            <div className="text-emerald-400 font-mono">{idea.target.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground">Stop</div>
            <div className="text-red-400 font-mono">{idea.stop.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-2">
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            <div className="bg-red-500/60" style={{ width: `${parseFloat(riskPct) * 4}%` }} />
            <div className="bg-muted flex-1" />
            <div className="bg-emerald-500/60" style={{ width: `${parseFloat(rewardPct) * 4}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-0.5">
            <span>Risk: {riskPct}%</span>
            <span>Reward: +{rewardPct}%</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border px-4 py-3 space-y-2"
          >
            <div className="text-xs text-muted-foreground leading-relaxed">{idea.thesis}</div>
            <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
              <span className="text-muted-foreground">Catalyst:</span>
              <span className="text-muted-foreground">{idea.catalyst}</span>
            </div>
            <div className="flex gap-2 flex-wrap text-xs text-muted-foreground">
              <span className="text-muted-foreground">Implementation:</span>
              <span className="text-muted-foreground">{idea.implementation}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PositionSizingTable() {
  const commodities = [
    { name: "Gold", vol: 14.3, posSize: 8.4 },
    { name: "Copper", vol: 22.4, posSize: 5.4 },
    { name: "WTI Crude", vol: 28.4, posSize: 4.2 },
    { name: "Natural Gas", vol: 56.7, posSize: 2.1 },
    { name: "Corn", vol: 22.1, posSize: 5.4 },
    { name: "Cocoa", vol: 57.3, posSize: 2.1 },
  ];

  return (
    <table className="w-full text-xs text-muted-foreground">
      <thead>
        <tr className="text-muted-foreground border-b border-border">
          <th className="text-left pb-2">Commodity</th>
          <th className="text-right pb-2">Ann. Vol</th>
          <th className="text-right pb-2">Vol-Adj Size</th>
          <th className="text-right pb-2">Risk ($10K acct)</th>
        </tr>
      </thead>
      <tbody>
        {commodities.map((row) => (
          <tr key={row.name} className="border-b border-border">
            <td className="py-2 text-muted-foreground">{row.name}</td>
            <td className="text-right text-muted-foreground font-mono">{row.vol.toFixed(1)}%</td>
            <td className="text-right font-mono">
              <div className="flex items-center justify-end gap-1">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${row.posSize * 8}%` }} />
                </div>
                <span className="text-primary">{row.posSize.toFixed(1)}%</span>
              </div>
            </td>
            <td className="text-right text-muted-foreground font-mono">${(row.posSize * 100).toFixed(0)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SeasonalTradeChart() {
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const avgNGPct = [12.4, -8.3, 3.2, 18.7];
  const hitRate = [58, 45, 52, 71];
  const W = 300; const H = 100;
  const cMax = 25; const cMin = -15;
  const barW = 55;
  const toBarY = (v: number) => H - ((v - cMin) / (cMax - cMin)) * H;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-28">
      <line x1="0" y1={toBarY(0)} x2={W} y2={toBarY(0)} stroke="#6b7280" strokeWidth="1" />
      {avgNGPct.map((v, i) => {
        const x = i * 75 + 12;
        const y0 = toBarY(0);
        const y1 = toBarY(v);
        return (
          <g key={i}>
            <rect
              x={x}
              y={Math.min(y0, y1)}
              width={barW}
              height={Math.abs(y0 - y1)}
              fill={v >= 0 ? "rgba(52,211,153,0.6)" : "rgba(248,113,113,0.6)"}
              rx="2"
            />
            <text x={x + barW / 2} y={H - 2} fontSize="9" fill="#6b7280" textAnchor="middle">{quarters[i]}</text>
            <text x={x + barW / 2} y={v >= 0 ? y1 - 3 : y1 + 10} fontSize="9" fill={v >= 0 ? "#34d399" : "#f87171"} textAnchor="middle">
              {v > 0 ? "+" : ""}{v.toFixed(1)}%
            </text>
            <text x={x + barW / 2} y={y0 + 12} fontSize="8" fill="#9ca3af" textAnchor="middle">{hitRate[i]}%</text>
          </g>
        );
      })}
    </svg>
  );
}

function ETFvsChart() {
  const rows = [
    { method: "Commodity ETF (e.g. GLD)", pros: "Easy, no roll cost, liquid", cons: "Tracks spot only, mgmt fee", cost: "0.40%/yr", leverage: "1x" },
    { method: "Futures Contract", pros: "Leverage, roll yield access", cons: "Roll costs, margin required", cost: "Roll ~0.5–3%/yr", leverage: "5–20x" },
    { method: "Mining/Producer Stock", pros: "Operating leverage 1.5–3x", cons: "Company-specific risk", cost: "Commission only", leverage: "1.5–3x" },
    { method: "Futures ETF (e.g. USO)", pros: "No margin, accessible", cons: "Negative roll in contango", cost: "0.73%/yr + roll", leverage: "1x" },
    { method: "Options on ETF", pros: "Defined risk, asymmetric", cons: "Time decay (theta)", cost: "Option premium", leverage: "5–20x implicit" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs text-muted-foreground">
        <thead>
          <tr className="text-muted-foreground border-b border-border">
            <th className="text-left pb-2">Method</th>
            <th className="text-left pb-2">Pros</th>
            <th className="text-left pb-2">Cons</th>
            <th className="text-right pb-2">Cost</th>
            <th className="text-right pb-2">Leverage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.method} className="border-b border-border">
              <td className="py-2 text-muted-foreground font-medium pr-3 w-40">{row.method}</td>
              <td className="text-emerald-400 pr-3">{row.pros}</td>
              <td className="text-red-400 pr-3">{row.cons}</td>
              <td className="text-right text-muted-foreground font-mono">{row.cost}</td>
              <td className="text-right text-amber-400 font-mono">{row.leverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CommodityBetaChart() {
  const regimes = [
    { regime: "Bull Market", cornBeta: -0.12, goldBeta: -0.08, oilBeta: 0.31, copperBeta: 0.58 },
    { regime: "Bear Market", cornBeta: 0.18, goldBeta: -0.42, oilBeta: -0.21, copperBeta: -0.38 },
    { regime: "High Inflation", cornBeta: 0.52, goldBeta: 0.44, oilBeta: 0.71, copperBeta: 0.38 },
    { regime: "Recession", cornBeta: -0.08, goldBeta: 0.28, oilBeta: -0.52, copperBeta: -0.61 },
    { regime: "Risk-Off", cornBeta: 0.04, goldBeta: 0.38, oilBeta: -0.28, copperBeta: -0.44 },
  ];
  const commodities = ["Corn", "Gold", "Oil", "Copper"];
  const betas = (row: typeof regimes[0]) => [row.cornBeta, row.goldBeta, row.oilBeta, row.copperBeta];
  const colors = ["#f59e0b", "#fbbf24", "#60a5fa", "#f97316"];

  return (
    <div className="space-y-2">
      <div className="flex gap-4 text-xs text-muted-foreground mb-2">
        {commodities.map((c, i) => (
          <span key={c} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: colors[i] }} />
            {c}
          </span>
        ))}
      </div>
      {regimes.map((row) => (
        <div key={row.regime} className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-muted-foreground w-28 shrink-0">{row.regime}</span>
          {betas(row).map((b, i) => (
            <div key={i} className="relative w-16 h-4 bg-muted rounded">
              <div
                className="absolute top-0 h-full rounded"
                style={{
                  background: colors[i],
                  left: b >= 0 ? "50%" : `${50 + b * 50}%`,
                  width: `${Math.abs(b) * 50}%`,
                  opacity: 0.7,
                }}
              />
              <span
                className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-mono"
                style={{ color: colors[i] }}
              >
                {b.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function TradeIdeasTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Trade Ideas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {TRADE_IDEAS.map((idea) => (
            <TradeIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Seasonal trade */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Natural Gas — Historical Quarterly Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <SeasonalTradeChart />
            <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-muted-foreground">
              {[
                { label: "Best quarter", val: "Q4 (avg +18.7%)" },
                { label: "Q4 hit rate", val: "71% since 2000" },
                { label: "Worst quarter", val: "Q2 (avg −8.3%)" },
                { label: "Q2 hit rate", val: "45% since 2000" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="text-muted-foreground">{item.val}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Position Sizing */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Volatility-Adjusted Position Sizing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Target 1% portfolio risk per trade. Position size = (1% x Portfolio) / (Volatility x Entry Price).
              Higher volatility = smaller position.
            </p>
            <PositionSizingTable />
          </CardContent>
        </Card>
      </div>

      {/* ETF vs Futures vs Stock */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Implementation: ETF vs Futures vs Producer Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <ETFvsChart />
        </CardContent>
      </Card>

      {/* Commodity Beta */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Commodity Beta vs S&P 500 by Market Regime</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Commodities often have low or negative equity beta, providing diversification. Gold excels in risk-off/recession.
            Oil and Copper are pro-cyclical. Grains are neutral to mildly inflation-driven.
          </p>
          <CommodityBetaChart />
        </CardContent>
      </Card>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function CommoditiesPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "energy", label: "Energy", icon: Flame },
    { id: "metals", label: "Metals", icon: Gem },
    { id: "agriculture", label: "Agriculture", icon: Leaf },
    { id: "curves", label: "Futures Curves", icon: Activity },
    { id: "ideas", label: "Trade Ideas", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-4">
      {/* HERO Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4 border-l-4 border-l-primary rounded-md bg-card p-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Commodities Markets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Energy · Metals · Agriculture · Softs — 24 markets, futures curves, and trade ideas
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="border-emerald-500 text-emerald-400 text-xs">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block mr-1 animate-pulse" />
            Markets Open
          </Badge>
          <Badge variant="outline" className="border-border text-muted-foreground text-xs">
            Mar 28, 2026
          </Badge>
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs">
            Supercycle: Boom Phase
          </Badge>
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
        {[
          { label: "WTI Crude", val: "$78.42", chg: "+1.23%", up: true },
          { label: "Gold", val: "$2,318", chg: "+0.34%", up: true },
          { label: "Copper", val: "$4.21/lb", chg: "+2.14%", up: true },
          { label: "Nat Gas", val: "$2.84", chg: "-3.21%", up: false },
          { label: "Corn", val: "437.5c", chg: "-0.54%", up: false },
          { label: "Coffee", val: "187.4c", chg: "+2.41%", up: true },
          { label: "Cocoa", val: "$8,432", chg: "-2.14%", up: false },
          { label: "Silver", val: "$27.84", chg: "+1.42%", up: true },
        ].map((item) => (
          <div key={item.label} className="bg-card border border-border rounded-lg p-2 text-center">
            <div className="text-muted-foreground text-xs">{item.label}</div>
            <div className="text-foreground font-medium text-sm">{item.val}</div>
            <div className={`text-xs font-mono ${item.up ? "text-emerald-400" : "text-red-400"}`}>{item.chg}</div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-muted data-[state=active]:text-foreground"
              >{tab.label}</TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="dashboard" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DashboardTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="energy" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="energy"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <EnergyTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="metals" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="metals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <MetalsTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="agriculture" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="agriculture"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AgricultureTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="curves" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="curves"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FuturesCurveTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="ideas" className="data-[state=inactive]:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key="ideas"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TradeIdeasTab />
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
