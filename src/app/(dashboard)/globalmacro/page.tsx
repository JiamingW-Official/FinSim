"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  TrendingUp,
  DollarSign,
  BarChart2,
  Calendar,
  Info,
  Zap,
  Activity,
  Layers,
  Target,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Tab 1: Macro Dashboard ────────────────────────────────────────────────────

interface CountryDef {
  name: string;
  code: string;
  flag: string;
  col: number;
  row: number;
  outlook: "bullish" | "bearish" | "neutral";
  gdpGrowth: number;
  inflation: number;
  cbRate: number;
  fxYtd: number;
}

const COUNTRIES: CountryDef[] = [
  { name: "Canada",       code: "CA", flag: "🇨🇦", col: 1, row: 0, outlook: "neutral",  gdpGrowth: 1.4, inflation: 2.8, cbRate: 4.75, fxYtd: -1.8 },
  { name: "USA",          code: "US", flag: "🇺🇸", col: 2, row: 0, outlook: "bullish",  gdpGrowth: 2.9, inflation: 3.2, cbRate: 5.25, fxYtd:  0.0 },
  { name: "Mexico",       code: "MX", flag: "🇲🇽", col: 2, row: 1, outlook: "neutral",  gdpGrowth: 2.1, inflation: 4.5, cbRate: 11.0, fxYtd: -2.3 },
  { name: "Brazil",       code: "BR", flag: "🇧🇷", col: 3, row: 1, outlook: "bullish",  gdpGrowth: 3.1, inflation: 4.7, cbRate: 10.5, fxYtd:  3.2 },
  { name: "UK",           code: "GB", flag: "🇬🇧", col: 4, row: 0, outlook: "neutral",  gdpGrowth: 0.8, inflation: 3.8, cbRate: 5.00, fxYtd:  1.2 },
  { name: "Eurozone",     code: "EU", flag: "🇪🇺", col: 5, row: 0, outlook: "bearish",  gdpGrowth: 0.4, inflation: 2.6, cbRate: 3.50, fxYtd: -0.9 },
  { name: "Sweden",       code: "SE", flag: "🇸🇪", col: 5, row: -1,outlook: "bearish",  gdpGrowth: -0.2,inflation: 2.2, cbRate: 3.25, fxYtd: -1.4 },
  { name: "Norway",       code: "NO", flag: "🇳🇴", col: 5, row: -2,outlook: "neutral",  gdpGrowth: 1.0, inflation: 3.1, cbRate: 4.50, fxYtd:  0.3 },
  { name: "Switzerland",  code: "CH", flag: "🇨🇭", col: 5, row: 1, outlook: "neutral",  gdpGrowth: 1.2, inflation: 1.4, cbRate: 1.50, fxYtd:  2.1 },
  { name: "South Africa", code: "ZA", flag: "🇿🇦", col: 5, row: 3, outlook: "bearish",  gdpGrowth: 0.6, inflation: 5.3, cbRate: 8.25, fxYtd: -4.1 },
  { name: "Turkey",       code: "TR", flag: "🇹🇷", col: 6, row: 1, outlook: "bearish",  gdpGrowth: 2.9, inflation:38.2, cbRate:42.00, fxYtd:-12.1 },
  { name: "Saudi Arabia", code: "SA", flag: "🇸🇦", col: 7, row: 1, outlook: "bullish",  gdpGrowth: 2.6, inflation: 1.9, cbRate: 6.00, fxYtd:  0.0 },
  { name: "Russia",       code: "RU", flag: "🇷🇺", col: 7, row: 0, outlook: "bearish",  gdpGrowth: 2.2, inflation: 7.4, cbRate:16.00, fxYtd: -5.8 },
  { name: "India",        code: "IN", flag: "🇮🇳", col: 8, row: 1, outlook: "bullish",  gdpGrowth: 6.8, inflation: 5.0, cbRate: 6.50, fxYtd: -0.6 },
  { name: "China",        code: "CN", flag: "🇨🇳", col: 9, row: 0, outlook: "bearish",  gdpGrowth: 4.6, inflation: 0.2, cbRate: 3.45, fxYtd: -1.9 },
  { name: "S. Korea",     code: "KR", flag: "🇰🇷", col: 9, row: 1, outlook: "neutral",  gdpGrowth: 2.3, inflation: 2.6, cbRate: 3.50, fxYtd: -3.2 },
  { name: "Japan",        code: "JP", flag: "🇯🇵", col:10, row: 0, outlook: "bullish",  gdpGrowth: 1.2, inflation: 2.8, cbRate: 0.10, fxYtd:  4.2 },
  { name: "Indonesia",    code: "ID", flag: "🇮🇩", col:10, row: 1, outlook: "bullish",  gdpGrowth: 5.1, inflation: 2.9, cbRate: 6.00, fxYtd: -1.5 },
  { name: "Australia",    code: "AU", flag: "🇦🇺", col:11, row: 2, outlook: "neutral",  gdpGrowth: 1.5, inflation: 3.6, cbRate: 4.35, fxYtd: -2.1 },
  { name: "New Zealand",  code: "NZ", flag: "🇳🇿", col:11, row: 3, outlook: "bearish",  gdpGrowth: 0.3, inflation: 3.3, cbRate: 5.50, fxYtd: -3.4 },
];

const OUTLOOK_COLOR: Record<string, string> = {
  bullish: "#22c55e",
  bearish: "#ef4444",
  neutral: "#eab308",
};

const REGIME_INDICATORS = [
  {
    label: "Global Growth Cycle",
    options: ["Recovery", "Expansion", "Peak", "Contraction"],
    current: "Expansion",
    icon: TrendingUp,
    color: "#22c55e",
    description: "Leading PMI data and credit conditions point to sustained expansion, though momentum is moderating in Europe.",
  },
  {
    label: "Inflation Regime",
    options: ["Deflationary", "Low", "Target", "High", "Hyperinflationary"],
    current: "High",
    icon: Activity,
    color: "#f97316",
    description: "Services inflation remains sticky in DM economies. Energy base effects are fading, but wage pressures persist.",
  },
  {
    label: "Dollar Cycle",
    options: ["Bull", "Sideways", "Bear"],
    current: "Sideways",
    icon: DollarSign,
    color: "#eab308",
    description: "DXY consolidating near 104. Divergent growth supports USD but peak-rate narrative caps upside.",
  },
  {
    label: "Risk Appetite",
    options: ["Risk-Off", "Neutral", "Risk-On"],
    current: "Risk-On",
    icon: Zap,
    color: "#6366f1",
    description: "Credit spreads tight, VIX subdued, EM flows positive. AI capex cycle underpins equity risk premium compression.",
  },
];

function WorldHeatmap() {
  const [hovered, setHovered] = useState<CountryDef | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const minCol = Math.min(...COUNTRIES.map((c) => c.col));
  const maxCol = Math.max(...COUNTRIES.map((c) => c.col));
  const minRow = Math.min(...COUNTRIES.map((c) => c.row));
  const maxRow = Math.max(...COUNTRIES.map((c) => c.row));
  const cols = maxCol - minCol + 1;
  const rows = maxRow - minRow + 1;
  const cellW = 62;
  const cellH = 44;
  const gap = 4;
  const svgW = cols * (cellW + gap);
  const svgH = rows * (cellH + gap);

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full"
        style={{ maxHeight: 260 }}
        onMouseLeave={() => setHovered(null)}
      >
        {COUNTRIES.map((c) => {
          const x = (c.col - minCol) * (cellW + gap);
          const y = (c.row - minRow) * (cellH + gap);
          const fill = OUTLOOK_COLOR[c.outlook];
          return (
            <g
              key={c.code}
              onMouseEnter={(e) => {
                setHovered(c);
                const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseMove={(e) => {
                const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={cellW}
                height={cellH}
                rx={5}
                fill={fill}
                fillOpacity={0.25}
                stroke={fill}
                strokeWidth={1.5}
              />
              <text
                x={x + cellW / 2}
                y={y + cellH / 2 - 5}
                textAnchor="middle"
                fontSize={14}
                dominantBaseline="middle"
              >
                {c.flag}
              </text>
              <text
                x={x + cellW / 2}
                y={y + cellH / 2 + 10}
                textAnchor="middle"
                fontSize={8}
                fill={fill}
                dominantBaseline="middle"
                fontWeight="600"
              >
                {c.code}
              </text>
            </g>
          );
        })}
      </svg>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 pointer-events-none bg-card border border-border rounded-lg p-3 shadow-xl text-xs min-w-[180px]"
            style={{
              left: Math.min(tooltipPos.x + 8, svgW > 0 ? 9999 : 0),
              top: tooltipPos.y + 8,
            }}
          >
            <div className="font-bold text-white mb-1.5 text-sm">
              {hovered.flag} {hovered.name}
            </div>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between gap-4">
                <span>GDP Growth</span>
                <span className={hovered.gdpGrowth > 2 ? "text-green-400" : hovered.gdpGrowth < 1 ? "text-red-400" : "text-yellow-400"}>
                  {hovered.gdpGrowth > 0 ? "+" : ""}{hovered.gdpGrowth.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Inflation</span>
                <span className={hovered.inflation > 5 ? "text-red-400" : hovered.inflation < 2 ? "text-primary" : "text-yellow-400"}>
                  {hovered.inflation.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span>CB Rate</span>
                <span className="text-white">{hovered.cbRate.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>FX YTD</span>
                <span className={hovered.fxYtd >= 0 ? "text-green-400" : "text-red-400"}>
                  {hovered.fxYtd >= 0 ? "+" : ""}{hovered.fxYtd.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-border">
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: OUTLOOK_COLOR[hovered.outlook] + "33",
                  color: OUTLOOK_COLOR[hovered.outlook],
                  border: `1px solid ${OUTLOOK_COLOR[hovered.outlook]}55`,
                }}
              >
                {hovered.outlook.toUpperCase()}
              </Badge>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        {(["bullish", "neutral", "bearish"] as const).map((o) => (
          <div key={o} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: OUTLOOK_COLOR[o] + "66", border: `1px solid ${OUTLOOK_COLOR[o]}` }} />
            <span className="capitalize">{o}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RegimeCard({ indicator }: { indicator: typeof REGIME_INDICATORS[0] }) {
  const Icon = indicator.icon;
  const idx = indicator.options.indexOf(indicator.current);
  const pct = ((idx / (indicator.options.length - 1)) * 100);

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4" style={{ color: indicator.color }} />
          <span className="text-sm font-medium text-muted-foreground">{indicator.label}</span>
        </div>
        <div className="flex gap-1 mb-3">
          {indicator.options.map((opt) => (
            <div
              key={opt}
              className={cn(
                "flex-1 text-center py-1 px-1 rounded text-xs font-semibold transition-all",
                opt === indicator.current
                  ? "text-zinc-900"
                  : "bg-muted text-muted-foreground"
              )}
              style={opt === indicator.current ? { backgroundColor: indicator.color } : {}}
            >
              {opt}
            </div>
          ))}
        </div>
        <div className="relative h-1.5 bg-muted rounded-full mb-2">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: indicator.color }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-zinc-900"
            style={{ left: `calc(${pct}% - 6px)`, backgroundColor: indicator.color }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{indicator.description}</p>
      </CardContent>
    </Card>
  );
}

// ── Tab 2: Trade Ideas ────────────────────────────────────────────────────────

interface TradeIdea {
  name: string;
  thesis: string;
  entry: string[];
  conviction: "High" | "Medium" | "Low";
  horizon: "Short" | "Medium" | "Long";
  risk: string;
  potentialPct: number;
  direction: "long" | "short";
}

const TRADE_IDEAS: TradeIdea[] = [
  {
    name: "Long US Value / Short Growth",
    thesis: "Rate normalization pressures long-duration growth multiples. Value stocks with near-term earnings trade at historically wide discount to growth. Fed higher-for-longer environment rewards cash-flow stocks.",
    entry: ["IVE (Long)", "IWF (Short)"],
    conviction: "High",
    horizon: "Medium",
    risk: "AI re-rating of growth names on earnings beats",
    potentialPct: 12,
    direction: "long",
  },
  {
    name: "Long JPY — BoJ Policy Normalization",
    thesis: "Bank of Japan is exiting ultra-loose policy after decades of YCC. Extreme short positioning in JPY creates asymmetric squeeze potential. Real rates turning positive supports yen appreciation.",
    entry: ["FXY (Long JPY ETF)", "Short USD/JPY futures"],
    conviction: "High",
    horizon: "Long",
    risk: "BoJ backpedals on normalization; Japan growth disappoints",
    potentialPct: 18,
    direction: "long",
  },
  {
    name: "Long EM ex-China (Commodity Boom)",
    thesis: "Commodity supercycle benefits EM exporters. US-China decoupling drives supply chain diversification into SE Asia and LatAm. Cheap EM valuations vs DM at multi-decade lows.",
    entry: ["EMXC", "EWZ", "INDA"],
    conviction: "Medium",
    horizon: "Long",
    risk: "USD strength, China hard landing spillover",
    potentialPct: 22,
    direction: "long",
  },
  {
    name: "Long Gold — De-Dollarization",
    thesis: "Central bank gold buying at record pace as EM diversifies away from USD reserves. Real yields peaking reduces opportunity cost of holding gold. Geopolitical risk premium elevated.",
    entry: ["GLD", "PHYS"],
    conviction: "High",
    horizon: "Long",
    risk: "Sharp USD rally on risk-off; crypto as alternative store of value",
    potentialPct: 15,
    direction: "long",
  },
  {
    name: "Long UK Equities — Sterling Recovery",
    thesis: "FTSE 100 trades at 40% discount to S&P 500 on P/E basis. Large energy and financials exposure benefits from higher-for-longer rates. Post-Brexit clarity and improving UK macro support re-rating.",
    entry: ["EWU", "ISF.L"],
    conviction: "Medium",
    horizon: "Medium",
    risk: "UK recession, BoE overtightening, political uncertainty",
    potentialPct: 14,
    direction: "long",
  },
  {
    name: "Short CNY — Property Sector Stress",
    thesis: "China's property crisis continues to weigh on growth. Stimulus measures insufficient to offset structural deflation. PBoC has limited room; capital outflows persist despite controls.",
    entry: ["CYB (Short CNH)", "Long USD/CNH NDF"],
    conviction: "Medium",
    horizon: "Short",
    risk: "Aggressive PBoC intervention; surprise stimulus package",
    potentialPct: 8,
    direction: "short",
  },
  {
    name: "Long Natural Gas — European LNG Demand",
    thesis: "European LNG import terminals running near capacity. Russian pipeline gas permanently curtailed. Cold winter premium plus structural shift creates multi-year demand floor for US LNG exporters.",
    entry: ["UNG", "LNG", "BOIL (2× levered)"],
    conviction: "Medium",
    horizon: "Short",
    risk: "Warm weather, ample storage levels, demand destruction",
    potentialPct: 25,
    direction: "long",
  },
  {
    name: "Long Brazil — Commodity Exporter Value",
    thesis: "Brazil trades at 8× earnings vs global EM average of 13×. Iron ore, soy, and oil exports benefit from China reopening. Improving fiscal trajectory under new finance ministry reduces risk premium.",
    entry: ["EWZ", "BRAZ"],
    conviction: "Medium",
    horizon: "Medium",
    risk: "Chinese growth disappointment, political risk premium, BRL volatility",
    potentialPct: 20,
    direction: "long",
  },
];

const CONVICTION_COLOR: Record<string, string> = {
  High: "#22c55e",
  Medium: "#eab308",
  Low: "#ef4444",
};

const HORIZON_COLOR: Record<string, string> = {
  Short: "#6366f1",
  Medium: "#3b82f6",
  Long: "#06b6d4",
};

function MiniPayoffBar({ potentialPct, direction }: { potentialPct: number; direction: "long" | "short" }) {
  const w = 120;
  const h = 32;
  const midY = h / 2;
  const scale = w / 2 / 30;
  const barW = Math.min(potentialPct * scale, w / 2 - 4);
  const startX = w / 2;
  const isLong = direction === "long";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-[120px]" style={{ height: h }}>
      {/* Center line */}
      <line x1={w / 2} y1={4} x2={w / 2} y2={h - 4} stroke="#52525b" strokeWidth={1} />
      {/* Upside bar */}
      {isLong && (
        <rect x={startX + 2} y={midY - 8} width={barW} height={8} rx={2} fill="#22c55e" fillOpacity={0.8} />
      )}
      {/* Downside for short */}
      {!isLong && (
        <rect x={startX - barW - 2} y={midY} width={barW} height={8} rx={2} fill="#ef4444" fillOpacity={0.8} />
      )}
      {/* Downside risk (always show small) */}
      <rect
        x={isLong ? startX - 18 : startX + 2}
        y={isLong ? midY : midY - 8}
        width={16}
        height={8}
        rx={2}
        fill={isLong ? "#ef4444" : "#22c55e"}
        fillOpacity={0.5}
      />
      <text x={4} y={midY - 2} fontSize={7} fill="#71717a">Risk</text>
      <text x={w - 4} y={midY - 2} fontSize={7} fill="#71717a" textAnchor="end">+{potentialPct}%</text>
    </svg>
  );
}

function TradeIdeaCard({ idea }: { idea: TradeIdea }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="bg-card border-border hover:border-border transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-white">{idea.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge
              className="text-xs px-1.5 py-0"
              style={{ backgroundColor: CONVICTION_COLOR[idea.conviction] + "22", color: CONVICTION_COLOR[idea.conviction], border: `1px solid ${CONVICTION_COLOR[idea.conviction]}44` }}
            >
              {idea.conviction}
            </Badge>
            <Badge
              className="text-xs px-1.5 py-0"
              style={{ backgroundColor: HORIZON_COLOR[idea.horizon] + "22", color: HORIZON_COLOR[idea.horizon], border: `1px solid ${HORIZON_COLOR[idea.horizon]}44` }}
            >
              {idea.horizon}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">{idea.thesis}</p>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-1">
            {idea.entry.map((e) => (
              <span key={e} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded font-mono">{e}</span>
            ))}
          </div>
          <MiniPayoffBar potentialPct={idea.potentialPct} direction={idea.direction} />
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-muted-foreground mt-2 transition-colors"
        >
          <ShieldAlert className="w-3 h-3" />
          Key Risk
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-xs text-amber-400/80 mt-1.5 bg-amber-950/30 rounded p-2 border border-amber-900/40">
                {idea.risk}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ── Tab 3: Central Bank Tracker ───────────────────────────────────────────────

interface CentralBank {
  name: string;
  abbr: string;
  country: string;
  flag: string;
  rate: number;
  lastDecision: "Hike" | "Cut" | "Hold";
  nextMeeting: string;
  marketExpectation: "Hike" | "Cut" | "Hold";
  guidance: string;
  color: string;
  rateHistory: number[]; // 12 quarters, oldest first
}

const CENTRAL_BANKS: CentralBank[] = [
  {
    name: "Federal Reserve", abbr: "Fed", country: "USA", flag: "🇺🇸",
    rate: 5.25, lastDecision: "Hold", nextMeeting: "May 1", marketExpectation: "Cut",
    guidance: "Data dependent; inflation progress insufficient for near-term cuts. 2 cuts projected in 2025 dot plot.",
    color: "#6366f1",
    rateHistory: [0.25, 0.25, 0.75, 1.75, 3.00, 4.25, 5.00, 5.25, 5.25, 5.25, 5.25, 5.25],
  },
  {
    name: "European Central Bank", abbr: "ECB", country: "Eurozone", flag: "🇪🇺",
    rate: 3.50, lastDecision: "Cut", nextMeeting: "Apr 17", marketExpectation: "Cut",
    guidance: "Cutting cycle underway. Wage growth still concerns hawks but inflation trajectory justifies easing.",
    color: "#3b82f6",
    rateHistory: [0.00, 0.00, 0.50, 1.25, 2.00, 2.50, 3.00, 4.00, 4.00, 4.00, 3.75, 3.50],
  },
  {
    name: "Bank of England", abbr: "BoE", country: "UK", flag: "🇬🇧",
    rate: 5.00, lastDecision: "Hold", nextMeeting: "May 8", marketExpectation: "Cut",
    guidance: "Restrictive stance maintained. Services CPI and wage growth above target; gradual easing likely mid-2025.",
    color: "#22c55e",
    rateHistory: [0.10, 0.25, 1.00, 2.25, 3.50, 4.00, 4.50, 5.00, 5.25, 5.25, 5.00, 5.00],
  },
  {
    name: "Bank of Japan", abbr: "BoJ", country: "Japan", flag: "🇯🇵",
    rate: 0.10, lastDecision: "Hike", nextMeeting: "Apr 30", marketExpectation: "Hold",
    guidance: "Normalizing cautiously. Wage-price virtuous cycle needed for further hikes. YCC formally abolished.",
    color: "#f59e0b",
    rateHistory: [-0.10, -0.10, -0.10, -0.10, -0.10, -0.10, -0.10, -0.10, -0.10, 0.00, 0.10, 0.10],
  },
  {
    name: "Swiss National Bank", abbr: "SNB", country: "Switzerland", flag: "🇨🇭",
    rate: 1.50, lastDecision: "Cut", nextMeeting: "Jun 19", marketExpectation: "Cut",
    guidance: "Inflation well below target; front-running other DM central banks with early easing. CHF strength concern.",
    color: "#ef4444",
    rateHistory: [-0.75, -0.75, 0.00, 0.50, 1.00, 1.50, 1.75, 1.75, 1.75, 1.75, 1.50, 1.50],
  },
  {
    name: "Reserve Bank of Australia", abbr: "RBA", country: "Australia", flag: "🇦🇺",
    rate: 4.35, lastDecision: "Hold", nextMeeting: "May 6", marketExpectation: "Cut",
    guidance: "Inflation moderating but above target band. Labor market robust. Easing cycle delayed vs peers.",
    color: "#14b8a6",
    rateHistory: [0.10, 0.10, 0.85, 2.35, 3.10, 3.60, 4.10, 4.35, 4.35, 4.35, 4.35, 4.35],
  },
  {
    name: "Bank of Canada", abbr: "BoC", country: "Canada", flag: "🇨🇦",
    rate: 4.75, lastDecision: "Cut", nextMeeting: "Apr 16", marketExpectation: "Cut",
    guidance: "Cutting cycle begun as inflation returns to target. Housing market slowdown enables easing.",
    color: "#ec4899",
    rateHistory: [0.25, 0.25, 1.00, 2.50, 3.75, 4.25, 4.50, 5.00, 5.00, 5.00, 4.75, 4.75],
  },
  {
    name: "RBNZ", abbr: "RBNZ", country: "New Zealand", flag: "🇳🇿",
    rate: 5.50, lastDecision: "Cut", nextMeeting: "May 28", marketExpectation: "Cut",
    guidance: "Aggressive cutting cycle as economy enters recession. Inflation returning to 1-3% band faster than expected.",
    color: "#8b5cf6",
    rateHistory: [0.25, 0.25, 1.50, 3.00, 4.25, 5.25, 5.50, 5.50, 5.50, 5.50, 5.50, 5.50],
  },
  {
    name: "People's Bank of China", abbr: "PBoC", country: "China", flag: "🇨🇳",
    rate: 3.45, lastDecision: "Cut", nextMeeting: "Apr 20", marketExpectation: "Cut",
    guidance: "Easing to support economy. Property sector stress and deflation risk dominate. Limited FX flexibility.",
    color: "#06b6d4",
    rateHistory: [3.85, 3.70, 3.65, 3.65, 3.65, 3.65, 3.55, 3.45, 3.45, 3.45, 3.45, 3.45],
  },
  {
    name: "Riksbank", abbr: "Riksbank", country: "Sweden", flag: "🇸🇪",
    rate: 3.25, lastDecision: "Cut", nextMeeting: "May 7", marketExpectation: "Cut",
    guidance: "Swedish economy in recession. Cutting aggressively as inflation falls below target. SEK weakness is concern.",
    color: "#f97316",
    rateHistory: [0.00, 0.25, 1.25, 2.50, 2.75, 3.50, 3.75, 4.00, 4.00, 3.75, 3.50, 3.25],
  },
];

const DECISION_COLOR: Record<string, string> = {
  Hike: "#22c55e",
  Cut: "#ef4444",
  Hold: "#eab308",
};

function RateCycleChart() {
  const rng = mulberry32(7777);
  void rng;
  const quarters = ["Q1 '23", "Q2 '23", "Q3 '23", "Q4 '23", "Q1 '24", "Q2 '24", "Q3 '24", "Q4 '24", "Q1 '25", "Q2 '25", "Q3 '25", "Q4 '25"];
  const svgW = 560;
  const svgH = 220;
  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const allRates = CENTRAL_BANKS.flatMap((b) => b.rateHistory);
  const minRate = Math.min(...allRates) - 0.5;
  const maxRate = Math.max(...allRates) + 0.5;

  function rateToY(r: number) {
    return padT + chartH - ((r - minRate) / (maxRate - minRate)) * chartH;
  }
  function idxToX(i: number) {
    return padL + (i / (quarters.length - 1)) * chartW;
  }

  const showBanks = CENTRAL_BANKS.filter((b) =>
    ["Fed", "ECB", "BoE", "BoJ", "RBA", "BoC"].includes(b.abbr)
  );

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: svgH }}>
      {/* Grid */}
      {[-0.5, 0, 1, 2, 3, 4, 5, 6].map((r) => {
        if (r < minRate || r > maxRate) return null;
        const y = rateToY(r);
        return (
          <g key={r}>
            <line x1={padL} y1={y} x2={svgW - padR} y2={y} stroke="#27272a" strokeWidth={1} />
            <text x={padL - 4} y={y} textAnchor="end" fontSize={8} fill="#52525b" dominantBaseline="middle">
              {r}%
            </text>
          </g>
        );
      })}
      {/* X axis labels */}
      {quarters.map((q, i) => (
        <text key={q} x={idxToX(i)} y={svgH - 6} textAnchor="middle" fontSize={7} fill="#52525b">
          {i % 2 === 0 ? q : ""}
        </text>
      ))}
      {/* Lines */}
      {showBanks.map((bank) => {
        const pts = bank.rateHistory.map((r, i) => `${idxToX(i)},${rateToY(r)}`).join(" ");
        return (
          <g key={bank.abbr}>
            <polyline points={pts} fill="none" stroke={bank.color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            {bank.rateHistory.map((r, i) => (
              <circle key={i} cx={idxToX(i)} cy={rateToY(r)} r={2} fill={bank.color} />
            ))}
          </g>
        );
      })}
      {/* Legend */}
      {showBanks.map((bank, bi) => (
        <g key={bank.abbr}>
          <line x1={padL + bi * 82} y1={padT + 4} x2={padL + bi * 82 + 12} y2={padT + 4} stroke={bank.color} strokeWidth={2} />
          <text x={padL + bi * 82 + 14} y={padT + 4} fontSize={8} fill={bank.color} dominantBaseline="middle">{bank.abbr}</text>
        </g>
      ))}
    </svg>
  );
}

function PolicyDivergenceHeatmap() {
  return (
    <div className="grid grid-cols-10 gap-1">
      {CENTRAL_BANKS.map((bank) => (
        <div
          key={bank.abbr}
          className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-muted/60 border border-border"
        >
          <span className="text-lg">{bank.flag}</span>
          <span className="text-xs font-bold text-muted-foreground">{bank.abbr}</span>
          <span className="text-xs text-muted-foreground">{bank.rate}%</span>
          <Badge
            className="text-[11px] px-1 py-0"
            style={{
              backgroundColor: DECISION_COLOR[bank.marketExpectation] + "22",
              color: DECISION_COLOR[bank.marketExpectation],
              border: `1px solid ${DECISION_COLOR[bank.marketExpectation]}44`,
            }}
          >
            {bank.marketExpectation}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ── Tab 4: Macro Indicators ───────────────────────────────────────────────────

interface MacroIndicator {
  name: string;
  value: number;
  unit: string;
  prev: number;
  consensus: number;
  classification: "Leading" | "Coincident" | "Lagging";
  expanding: boolean;
  sparkSeed: number;
}

const MACRO_INDICATORS: MacroIndicator[] = [
  { name: "US ISM Manufacturing PMI",  value: 50.3, unit: "",     prev: 49.8, consensus: 50.0, classification: "Leading",    expanding: true,  sparkSeed: 1001 },
  { name: "US ISM Services PMI",       value: 53.4, unit: "",     prev: 52.6, consensus: 52.9, classification: "Leading",    expanding: true,  sparkSeed: 1002 },
  { name: "US Jobless Claims",         value: 218,  unit: "K",    prev: 225,  consensus: 221,  classification: "Leading",    expanding: true,  sparkSeed: 1003 },
  { name: "Consumer Confidence",       value: 98.7, unit: "",     prev: 97.1, consensus: 96.0, classification: "Leading",    expanding: true,  sparkSeed: 1004 },
  { name: "Retail Sales MoM",          value: 0.8,  unit: "%",    prev: -0.4, consensus: 0.5,  classification: "Coincident", expanding: true,  sparkSeed: 1005 },
  { name: "Industrial Production",     value: 0.3,  unit: "%",    prev: -0.2, consensus: 0.2,  classification: "Coincident", expanding: true,  sparkSeed: 1006 },
  { name: "Housing Starts",            value: 1.36, unit: "M",    prev: 1.29, consensus: 1.32, classification: "Leading",    expanding: true,  sparkSeed: 1007 },
  { name: "Yield Curve 2Y-10Y",        value: -0.32,unit: "%",    prev: -0.44,consensus: -0.35,classification: "Leading",    expanding: false, sparkSeed: 1008 },
  { name: "IG Credit Spread",          value: 94,   unit: "bps",  prev: 98,   consensus: 97,   classification: "Leading",    expanding: true,  sparkSeed: 1009 },
  { name: "Copper / Gold Ratio",       value: 0.241,unit: "",     prev: 0.232,consensus: 0.238,classification: "Leading",    expanding: true,  sparkSeed: 1010 },
  { name: "Baltic Dry Index",          value: 1842, unit: "",     prev: 1620, consensus: 1700, classification: "Leading",    expanding: true,  sparkSeed: 1011 },
  { name: "Global PMI Composite",      value: 52.1, unit: "",     prev: 51.8, consensus: 52.0, classification: "Coincident", expanding: true,  sparkSeed: 1012 },
];

const CLASS_COLOR: Record<string, string> = {
  Leading: "#6366f1",
  Coincident: "#22c55e",
  Lagging: "#f59e0b",
};

function Sparkline({ seed, expanding }: { seed: number; expanding: boolean }) {
  const rng = mulberry32(seed);
  const pts = Array.from({ length: 20 }, () => rng());
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const w = 80;
  const h = 28;
  const coords = pts.map((p, i) => {
    const x = (i / (pts.length - 1)) * w;
    const y = h - 4 - ((p - min) / (max - min + 0.001)) * (h - 8);
    return `${x},${y}`;
  });
  const color = expanding ? "#22c55e" : "#ef4444";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20" style={{ height: h }}>
      <polyline points={coords.join(" ")} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function MacroScorecard({ indicators }: { indicators: MacroIndicator[] }) {
  const expandingCount = indicators.filter((i) => i.expanding).length;
  const pct = Math.round((expandingCount / indicators.length) * 100);
  return (
    <Card className="bg-card border-border mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-white">Macro Expansion Scorecard</div>
          <span className="text-2xl font-bold" style={{ color: pct >= 60 ? "#22c55e" : pct >= 40 ? "#eab308" : "#ef4444" }}>
            {pct}%
          </span>
        </div>
        <Progress value={pct} className="h-2 bg-muted" />
        <p className="text-xs text-muted-foreground mt-2">
          {expandingCount} of {indicators.length} indicators in expansion territory
        </p>
      </CardContent>
    </Card>
  );
}

function IndicatorRow({ ind }: { ind: MacroIndicator }) {
  const surprise = ind.value - ind.consensus;
  const surprisePos = surprise > 0;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-foreground truncate">{ind.name}</span>
          <Badge
            className="text-[11px] px-1 py-0 shrink-0"
            style={{ backgroundColor: CLASS_COLOR[ind.classification] + "22", color: CLASS_COLOR[ind.classification], border: `1px solid ${CLASS_COLOR[ind.classification]}44` }}
          >
            {ind.classification}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Prev: {ind.prev}{ind.unit}</span>
          <span>|</span>
          <span>Cons: {ind.consensus}{ind.unit}</span>
          <span
            className={cn("font-medium", surprisePos ? "text-green-400" : "text-red-400")}
          >
            {surprisePos ? "▲" : "▼"} {Math.abs(surprise).toFixed(2)}{ind.unit}
          </span>
        </div>
      </div>
      <Sparkline seed={ind.sparkSeed} expanding={ind.expanding} />
      <div className="text-right shrink-0 w-16">
        <div className="text-sm font-bold text-white">{ind.value}{ind.unit}</div>
        <div className={cn("text-xs", ind.expanding ? "text-green-400" : "text-red-400")}>
          {ind.expanding ? "Expanding" : "Contracting"}
        </div>
      </div>
    </div>
  );
}

// ── Tab 5: Currency Wars ──────────────────────────────────────────────────────

const CURRENCIES = [
  { code: "USD", name: "US Dollar",     flag: "🇺🇸", rate: 5.25, reer: 112.4 },
  { code: "EUR", name: "Euro",          flag: "🇪🇺", rate: 3.50, reer: 98.2  },
  { code: "GBP", name: "British Pound", flag: "🇬🇧", rate: 5.00, reer: 96.8  },
  { code: "JPY", name: "Japanese Yen",  flag: "🇯🇵", rate: 0.10, reer: 72.3  },
  { code: "CHF", name: "Swiss Franc",   flag: "🇨🇭", rate: 1.50, reer: 121.6 },
  { code: "AUD", name: "Aussie Dollar", flag: "🇦🇺", rate: 4.35, reer: 88.4  },
  { code: "CAD", name: "Cdn Dollar",    flag: "🇨🇦", rate: 4.75, reer: 95.1  },
  { code: "CNY", name: "Renminbi",      flag: "🇨🇳", rate: 3.45, reer: 99.6  },
];

// YTD % changes vs USD (positive = ccy strengthened vs USD)
const FX_YTD: Record<string, Record<string, number>> = {
  USD: { USD: 0,     EUR: -0.9, GBP: 1.2,  JPY: -8.4, CHF: 2.1,  AUD: -2.1, CAD: -1.8, CNY: -1.9 },
  EUR: { USD: 0.9,  EUR: 0,    GBP: 2.1,  JPY: -7.5, CHF: 3.0,  AUD: -1.2, CAD: -0.9, CNY: -1.0 },
  GBP: { USD: -1.2, EUR: -2.1, GBP: 0,    JPY: -9.6, CHF: 0.9,  AUD: -3.3, CAD: -3.0, CNY: -3.1 },
  JPY: { USD: 8.4,  EUR: 7.5,  GBP: 9.6,  JPY: 0,    CHF: 10.5, AUD: 6.3,  CAD: 6.6,  CNY: 6.5  },
  CHF: { USD: -2.1, EUR: -3.0, GBP: -0.9, JPY: -10.5,CHF: 0,    AUD: -4.2, CAD: -3.9, CNY: -4.0 },
  AUD: { USD: 2.1,  EUR: 1.2,  GBP: 3.3,  JPY: -6.3, CHF: 4.2,  AUD: 0,    CAD: 0.3,  CNY: 0.2  },
  CAD: { USD: 1.8,  EUR: 0.9,  GBP: 3.0,  JPY: -6.6, CHF: 3.9,  AUD: -0.3, CAD: 0,    CNY: -0.1 },
  CNY: { USD: 1.9,  EUR: 1.0,  GBP: 3.1,  JPY: -6.5, CHF: 4.0,  AUD: -0.2, CAD: 0.1,  CNY: 0    },
};

// PPP valuation vs USD: positive = overvalued, negative = undervalued
const PPP_VALUATION: Record<string, { ppp: number; spot: number; overUnder: number }> = {
  EUR: { ppp: 1.22, spot: 1.08, overUnder: -11.5 },
  GBP: { ppp: 1.48, spot: 1.27, overUnder: -14.2 },
  JPY: { ppp: 110,  spot: 151,  overUnder: -27.2 },
  CHF: { ppp: 0.82, spot: 0.89, overUnder:  8.5  },
  AUD: { ppp: 0.74, spot: 0.66, overUnder: -10.8 },
  CAD: { ppp: 1.22, spot: 1.36, overUnder: -10.3 },
  CNY: { ppp: 5.8,  spot: 7.24, overUnder: -19.8 },
};

function FxMatrixTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1.5 text-left text-muted-foreground font-medium w-16">Base →</th>
            {CURRENCIES.map((c) => (
              <th key={c.code} className="p-1.5 text-center text-muted-foreground font-semibold">
                {c.flag} {c.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CURRENCIES.map((base) => (
            <tr key={base.code} className="border-t border-border">
              <td className="p-1.5 text-muted-foreground font-semibold">
                {base.flag} {base.code}
              </td>
              {CURRENCIES.map((quote) => {
                const val = FX_YTD[base.code]?.[quote.code] ?? 0;
                const isDiag = base.code === quote.code;
                return (
                  <td
                    key={quote.code}
                    className={cn("p-1.5 text-center font-mono rounded", isDiag ? "text-muted-foreground" : "")}
                    style={
                      isDiag
                        ? { backgroundColor: "#18181b" }
                        : {
                            backgroundColor: val > 0 ? `rgba(34,197,94,${Math.min(Math.abs(val) / 12, 0.35)})` : `rgba(239,68,68,${Math.min(Math.abs(val) / 12, 0.35)})`,
                            color: val > 0 ? "#86efac" : val < 0 ? "#fca5a5" : "#71717a",
                          }
                    }
                  >
                    {isDiag ? "—" : `${val > 0 ? "+" : ""}${val.toFixed(1)}%`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CarryMatrix() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1.5 text-left text-muted-foreground font-medium w-16">Long →</th>
            {CURRENCIES.map((c) => (
              <th key={c.code} className="p-1.5 text-center text-muted-foreground font-semibold">
                {c.flag} {c.code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CURRENCIES.map((base) => (
            <tr key={base.code} className="border-t border-border">
              <td className="p-1.5 text-muted-foreground font-semibold">
                {base.flag} {base.code}
              </td>
              {CURRENCIES.map((quote) => {
                const diff = base.rate - quote.rate;
                const isDiag = base.code === quote.code;
                return (
                  <td
                    key={quote.code}
                    className={cn("p-1.5 text-center font-mono rounded", isDiag ? "text-muted-foreground" : "")}
                    style={
                      isDiag
                        ? { backgroundColor: "#18181b" }
                        : {
                            backgroundColor: diff > 0 ? `rgba(34,197,94,${Math.min(Math.abs(diff) / 6, 0.35)})` : `rgba(239,68,68,${Math.min(Math.abs(diff) / 6, 0.35)})`,
                            color: diff > 0 ? "#86efac" : diff < 0 ? "#fca5a5" : "#71717a",
                          }
                    }
                  >
                    {isDiag ? "—" : `${diff > 0 ? "+" : ""}${diff.toFixed(2)}%`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PppChart() {
  const currencies = Object.entries(PPP_VALUATION).map(([code, d]) => ({ code, ...d }));
  const maxAbs = Math.max(...currencies.map((c) => Math.abs(c.overUnder)));
  const barMaxW = 120;

  return (
    <div className="space-y-2">
      {currencies.map((c) => {
        const ccy = CURRENCIES.find((x) => x.code === c.code)!;
        const barW = (Math.abs(c.overUnder) / maxAbs) * barMaxW;
        const overvalued = c.overUnder > 0;
        return (
          <div key={c.code} className="flex items-center gap-3">
            <div className="w-12 text-xs text-muted-foreground font-semibold text-right">
              {ccy?.flag} {c.code}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex items-center justify-end" style={{ width: barMaxW }}>
                {!overvalued && (
                  <div
                    className="h-4 rounded-l"
                    style={{ width: barW, backgroundColor: "#ef444488" }}
                  />
                )}
              </div>
              <div className="w-1 h-5 bg-zinc-600 rounded-full shrink-0" />
              <div className="flex items-center justify-start" style={{ width: barMaxW }}>
                {overvalued && (
                  <div
                    className="h-4 rounded-r"
                    style={{ width: barW, backgroundColor: "#22c55e88" }}
                  />
                )}
              </div>
            </div>
            <div className={cn("w-14 text-xs font-mono text-right", overvalued ? "text-green-400" : "text-red-400")}>
              {c.overUnder > 0 ? "+" : ""}{c.overUnder.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground w-20">{overvalued ? "Overvalued" : "Undervalued"}</div>
          </div>
        );
      })}
      <div className="flex justify-center mt-2 gap-6 text-xs text-muted-foreground">
        <span className="text-red-400">◀ Undervalued vs USD</span>
        <span className="text-green-400">Overvalued vs USD ▶</span>
      </div>
    </div>
  );
}

function ReerChart() {
  const svgW = 460;
  const svgH = 160;
  const padL = 44;
  const padR = 12;
  const padT = 12;
  const padB = 24;
  const chartW = svgW - padL - padR;
  const chartH = svgH - padT - padB;

  const reers = CURRENCIES.map((c) => c.reer);
  const minR = Math.min(...reers) - 5;
  const maxR = Math.max(...reers) + 5;

  function reerToY(r: number) {
    return padT + chartH - ((r - minR) / (maxR - minR)) * chartH;
  }
  const barW = chartW / CURRENCIES.length - 4;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: svgH }}>
      {/* Baseline 100 */}
      <line
        x1={padL}
        y1={reerToY(100)}
        x2={svgW - padR}
        y2={reerToY(100)}
        stroke="#52525b"
        strokeWidth={1}
        strokeDasharray="3,3"
      />
      <text x={padL - 4} y={reerToY(100)} textAnchor="end" fontSize={8} fill="#52525b" dominantBaseline="middle">100</text>
      {/* Y axis ticks */}
      {[70, 80, 90, 100, 110, 120].map((r) => {
        if (r < minR || r > maxR) return null;
        return (
          <g key={r}>
            <line x1={padL} y1={reerToY(r)} x2={svgW - padR} y2={reerToY(r)} stroke="#18181b" strokeWidth={1} />
            <text x={padL - 4} y={reerToY(r)} textAnchor="end" fontSize={7} fill="#3f3f46" dominantBaseline="middle">{r}</text>
          </g>
        );
      })}
      {/* Bars */}
      {CURRENCIES.map((c, i) => {
        const barX = padL + i * (barW + 4) + 2;
        const y100 = reerToY(100);
        const yVal = reerToY(c.reer);
        const isAbove = c.reer >= 100;
        return (
          <g key={c.code}>
            <rect
              x={barX}
              y={isAbove ? yVal : y100}
              width={barW}
              height={Math.abs(y100 - yVal)}
              fill={isAbove ? "#22c55e" : "#ef4444"}
              fillOpacity={0.7}
              rx={2}
            />
            <text x={barX + barW / 2} y={svgH - padB + 10} textAnchor="middle" fontSize={8} fill="#71717a">{c.flag}</text>
            <text x={barX + barW / 2} y={svgH - padB + 19} textAnchor="middle" fontSize={7} fill="#52525b">{c.code}</text>
          </g>
        );
      })}
      <text x={svgW / 2} y={padT} textAnchor="middle" fontSize={9} fill="#71717a">Real Effective Exchange Rate (REER) — 100 = Long-run Fair Value</text>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function GlobalMacroPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedBank, setExpandedBank] = useState<string | null>(null);
  const [minPotential, setMinPotential] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Global Macro Trading</h1>
            <p className="text-xs text-muted-foreground">Macro regime analysis · Trade ideas · Central banks · Economic indicators · Currency markets</p>
          </div>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border border-border mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dashboard"   className="data-[state=active]:bg-muted text-xs">Macro Dashboard</TabsTrigger>
          <TabsTrigger value="trade-ideas" className="data-[state=active]:bg-muted text-xs">Trade Ideas</TabsTrigger>
          <TabsTrigger value="central-banks" className="data-[state=active]:bg-muted text-xs">Central Banks</TabsTrigger>
          <TabsTrigger value="indicators"  className="data-[state=active]:bg-muted text-xs">Macro Indicators</TabsTrigger>
          <TabsTrigger value="currency"    className="data-[state=active]:bg-muted text-xs">Currency Wars</TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Macro Dashboard ─────────────────────────────────────────── */}
        <TabsContent value="dashboard" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="bg-card border-border mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Global Economic Outlook Heatmap
                </CardTitle>
                <p className="text-xs text-muted-foreground">Hover over a country to see GDP growth, inflation, central bank rate, and FX performance</p>
              </CardHeader>
              <CardContent>
                <WorldHeatmap />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {REGIME_INDICATORS.map((ind) => (
                <RegimeCard key={ind.label} indicator={ind} />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Tab 2: Trade Ideas ─────────────────────────────────────────────── */}
        <TabsContent value="trade-ideas" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Summary bar */}
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              {(["High", "Medium", "Low"] as const).map((c) => {
                const count = TRADE_IDEAS.filter((t) => t.conviction === c).length;
                return (
                  <div key={c} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CONVICTION_COLOR[c] }} />
                    <span className="text-muted-foreground">{c} Conviction:</span>
                    <span className="font-semibold text-white">{count}</span>
                  </div>
                );
              })}
              <span className="text-muted-foreground">|</span>
              {(["Short", "Medium", "Long"] as const).map((h) => {
                const count = TRADE_IDEAS.filter((t) => t.horizon === h).length;
                return (
                  <div key={h} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{h}:</span>
                    <span className="font-semibold text-white">{count}</span>
                  </div>
                );
              })}
            </div>
            {/* P&L Potential filter */}
            <Card className="bg-card border-border mb-4">
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground shrink-0">Min P&L Potential:</span>
                  <Slider
                    value={[minPotential]}
                    onValueChange={([v]) => setMinPotential(v)}
                    min={0}
                    max={25}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono text-indigo-400 w-10 text-right">{minPotential}%+</span>
                </div>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRADE_IDEAS.filter((idea) => idea.potentialPct >= minPotential).map((idea) => (
                <TradeIdeaCard key={idea.name} idea={idea} />
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Tab 3: Central Bank Tracker ───────────────────────────────────── */}
        <TabsContent value="central-banks" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="bg-card border-border mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Central Bank Rate Cycle (Past 3 Years — 6 Major Banks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RateCycleChart />
              </CardContent>
            </Card>

            <Card className="bg-card border-border mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Policy Divergence Heatmap
                </CardTitle>
                <p className="text-xs text-muted-foreground">Market-implied next meeting expectation</p>
              </CardHeader>
              <CardContent>
                <PolicyDivergenceHeatmap />
              </CardContent>
            </Card>

            <div className="space-y-3">
              {CENTRAL_BANKS.map((bank) => (
                <Card key={bank.abbr} className="bg-card border-border">
                  <CardContent className="p-4">
                    <button
                      className="w-full text-left"
                      onClick={() => setExpandedBank(expandedBank === bank.abbr ? null : bank.abbr)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{bank.flag}</span>
                          <div>
                            <div className="font-semibold text-sm text-white">{bank.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Rate: <span className="text-foreground font-mono">{bank.rate.toFixed(2)}%</span>
                              <span className="mx-2 text-zinc-700">|</span>
                              Next: <span className="text-muted-foreground">{bank.nextMeeting}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className="text-xs"
                            style={{ backgroundColor: DECISION_COLOR[bank.lastDecision] + "22", color: DECISION_COLOR[bank.lastDecision], border: `1px solid ${DECISION_COLOR[bank.lastDecision]}44` }}
                          >
                            Last: {bank.lastDecision}
                          </Badge>
                          <Badge
                            className="text-xs"
                            style={{ backgroundColor: DECISION_COLOR[bank.marketExpectation] + "22", color: DECISION_COLOR[bank.marketExpectation], border: `1px solid ${DECISION_COLOR[bank.marketExpectation]}44` }}
                          >
                            Mkt: {bank.marketExpectation}
                          </Badge>
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedBank === bank.abbr && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{bank.guidance}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                Next meeting: <span className="text-muted-foreground font-medium">{bank.nextMeeting} 2025</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Market pricing: <span style={{ color: DECISION_COLOR[bank.marketExpectation] }} className="font-medium">{bank.marketExpectation}</span>
                              </div>
                            </div>
                            {/* Mini rate history sparkline */}
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground mb-1">Rate history (3Y)</div>
                              <svg viewBox="0 0 280 36" className="w-full" style={{ maxHeight: 36 }}>
                                {(() => {
                                  const data = bank.rateHistory;
                                  const minR = Math.min(...data) - 0.1;
                                  const maxR = Math.max(...data) + 0.1;
                                  const pts = data.map((r, i) => {
                                    const x = (i / (data.length - 1)) * 276 + 2;
                                    const y = 34 - ((r - minR) / (maxR - minR + 0.001)) * 28;
                                    return `${x},${y}`;
                                  });
                                  return (
                                    <>
                                      <polyline points={pts.join(" ")} fill="none" stroke={bank.color} strokeWidth={1.5} strokeLinejoin="round" />
                                      {data.map((r, i) => {
                                        const x = (i / (data.length - 1)) * 276 + 2;
                                        const y = 34 - ((r - minR) / (maxR - minR + 0.001)) * 28;
                                        return <circle key={i} cx={x} cy={y} r={2} fill={bank.color} />;
                                      })}
                                    </>
                                  );
                                })()}
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* ── Tab 4: Macro Indicators ───────────────────────────────────────── */}
        <TabsContent value="indicators" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <MacroScorecard indicators={MACRO_INDICATORS} />

            {/* Classification legend */}
            <div className="flex gap-4 mb-4 flex-wrap">
              {(["Leading", "Coincident", "Lagging"] as const).map((cls) => (
                <div key={cls} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CLASS_COLOR[cls] }}
                  />
                  <span className="text-muted-foreground">{cls}</span>
                  <span className="text-muted-foreground">({MACRO_INDICATORS.filter((i) => i.classification === cls).length})</span>
                </div>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                {MACRO_INDICATORS.map((ind) => (
                  <IndicatorRow key={ind.name} ind={ind} />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Tab 5: Currency Wars ──────────────────────────────────────────── */}
        <TabsContent value="currency" className="data-[state=inactive]:hidden">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-400" />
                  FX Performance Matrix — YTD % Change
                </CardTitle>
                <p className="text-xs text-muted-foreground">Row = base currency · Column = quote · Green = base strengthened vs quote</p>
              </CardHeader>
              <CardContent>
                <FxMatrixTable />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Carry Trade Matrix — Interest Rate Differentials
                </CardTitle>
                <p className="text-xs text-muted-foreground">Row = long leg · Column = short leg · Positive = carry income earned</p>
              </CardHeader>
              <CardContent>
                <CarryMatrix />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-400" />
                  PPP Valuation vs USD
                </CardTitle>
                <p className="text-xs text-muted-foreground">Purchasing Power Parity fair value deviation — how over or undervalued each currency is vs the dollar</p>
              </CardHeader>
              <CardContent>
                <PppChart />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-400" />
                  Real Effective Exchange Rate (REER)
                </CardTitle>
                <p className="text-xs text-muted-foreground">Above 100 = currency is strong vs long-run average; below 100 = historically cheap</p>
              </CardHeader>
              <CardContent>
                <ReerChart />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
