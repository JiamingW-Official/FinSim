"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  Activity,
  DollarSign,
  Layers,
  RefreshCw,
  AlertTriangle,
  Target,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Seeded PRNG ────────────────────────────────────────────────────────────────
let s = 940;
const rand = () => {
  s = (s * 1103515245 + 12345) & 0x7fffffff;
  return s / 0x7fffffff;
};
const _vals = Array.from({ length: 3000 }, () => rand());
let _vi = 0;
const sv = () => _vals[_vi++ % _vals.length];

// ── Format helpers ─────────────────────────────────────────────────────────────
function fmtPct(n: number, decimals = 1): string {
  return (n >= 0 ? "+" : "") + n.toFixed(decimals) + "%";
}
const posColor = (v: number) => (v >= 0 ? "text-emerald-400" : "text-red-400");

// ── Vol Surface SVG (term structure + skew) ────────────────────────────────────
function VolSurfaceSVG() {
  const W = 480;
  const H = 200;
  const PAD = { l: 44, r: 16, t: 20, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  // Strikes relative to spot: 80%,85%,90%,95%,100%,105%,110%,115%,120%
  const strikes = [80, 85, 90, 95, 100, 105, 110, 115, 120];
  // Expiries in months
  const expiries = [1, 3, 6, 12];
  const expLabels = ["1M", "3M", "6M", "12M"];
  const colors = ["#f87171", "#fb923c", "#facc15", "#34d399"];

  // Vol skew model: base + leftSkew * (S-K)/K + termEffect
  const computeVol = (strike: number, expMo: number) => {
    const moneyness = (strike - 100) / 100; // negative = OTM put
    const skew = -0.18 * moneyness; // put skew
    const termBase = 0.22 + 0.04 * Math.exp(-expMo / 6); // term structure declines
    return (termBase + skew) * 100;
  };

  const maxVol = 40;
  const minVol = 15;
  const toX = (i: number) => PAD.l + (i / (strikes.length - 1)) * cW;
  const toY = (v: number) =>
    PAD.t + cH - ((v - minVol) / (maxVol - minVol)) * cH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      <defs>
        {expiries.map((_, ei) => (
          <linearGradient
            key={`vsg-${ei}`}
            id={`vsGrad${ei}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={colors[ei]} stopOpacity="0.18" />
            <stop offset="100%" stopColor={colors[ei]} stopOpacity="0.02" />
          </linearGradient>
        ))}
      </defs>
      {/* Grid lines */}
      {[15, 20, 25, 30, 35, 40].map((v) => (
        <line
          key={`vgl-${v}`}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={toY(v)}
          y2={toY(v)}
          stroke="#27272a"
          strokeWidth="1"
        />
      ))}
      {[15, 20, 25, 30, 35, 40].map((v) => (
        <text
          key={`vgy-${v}`}
          x={PAD.l - 4}
          y={toY(v) + 4}
          fill="#71717a"
          fontSize="9"
          textAnchor="end"
        >
          {v}%
        </text>
      ))}
      {/* Curves per expiry */}
      {expiries.map((expMo, ei) => {
        const pts = strikes.map((k, i) => {
          const v = computeVol(k, expMo);
          return `${toX(i)},${toY(v)}`;
        });
        const areaPts = [
          `${toX(0)},${PAD.t + cH}`,
          ...pts,
          `${toX(strikes.length - 1)},${PAD.t + cH}`,
        ];
        return (
          <g key={`vsexp-${ei}`}>
            <polygon
              points={areaPts.join(" ")}
              fill={`url(#vsGrad${ei})`}
            />
            <polyline
              points={pts.join(" ")}
              fill="none"
              stroke={colors[ei]}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <text
              x={toX(0) - 2}
              y={toY(computeVol(80, expMo)) - 4}
              fill={colors[ei]}
              fontSize="8"
              textAnchor="end"
            >
              {expLabels[ei]}
            </text>
          </g>
        );
      })}
      {/* X-axis labels */}
      {strikes.map((k, i) => (
        <text
          key={`vsx-${i}`}
          x={toX(i)}
          y={H - 4}
          fill="#71717a"
          fontSize="9"
          textAnchor="middle"
        >
          {k}%
        </text>
      ))}
      {/* ATM line */}
      <line
        x1={toX(4)}
        x2={toX(4)}
        y1={PAD.t}
        y2={PAD.t + cH}
        stroke="#6366f1"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      <text
        x={toX(4)}
        y={PAD.t - 4}
        fill="#818cf8"
        fontSize="8"
        textAnchor="middle"
      >
        ATM
      </text>
      <text
        x={PAD.l + cW / 2}
        y={H - 4}
        fill="#52525b"
        fontSize="8"
        textAnchor="middle"
      >
        Strike (% of spot)
      </text>
    </svg>
  );
}

// ── ESO Vesting Timeline SVG ───────────────────────────────────────────────────
function EsoVestingSVG() {
  const W = 480;
  const H = 100;
  const PAD = { l: 16, r: 16, t: 24, b: 24 };
  const cW = W - PAD.l - PAD.r;

  const years = [0, 1, 2, 3, 4];
  const vestPct = [0, 0, 25, 50, 75]; // cliff at year 1, then 25%/yr
  // At year 1 cliff, 25% vest
  const events: { year: number; label: string; pct: number; color: string }[] =
    [
      { year: 0, label: "Grant", pct: 0, color: "#6366f1" },
      { year: 1, label: "Cliff 25%", pct: 25, color: "#f59e0b" },
      { year: 2, label: "50%", pct: 50, color: "#34d399" },
      { year: 3, label: "75%", pct: 75, color: "#34d399" },
      { year: 4, label: "100%", pct: 100, color: "#34d399" },
    ];
  void vestPct;

  const toX = (yr: number) => PAD.l + (yr / 4) * cW;
  const cy = H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 100 }}>
      {/* Timeline bar */}
      <line
        x1={toX(0)}
        x2={toX(4)}
        y1={cy}
        y2={cy}
        stroke="#3f3f46"
        strokeWidth="3"
      />
      {/* Vested portion */}
      <line
        x1={toX(1)}
        x2={toX(4)}
        y1={cy}
        y2={cy}
        stroke="#34d399"
        strokeWidth="3"
      />
      {events.map((ev, i) => (
        <g key={`esov-${i}`}>
          <circle cx={toX(ev.year)} cy={cy} r="6" fill={ev.color} />
          <text
            x={toX(ev.year)}
            y={cy - 12}
            fill={ev.color}
            fontSize="8.5"
            textAnchor="middle"
            fontWeight="bold"
          >
            {ev.label}
          </text>
          <text
            x={toX(ev.year)}
            y={cy + 18}
            fill="#71717a"
            fontSize="8"
            textAnchor="middle"
          >
            Yr {ev.year}
          </text>
        </g>
      ))}
      {/* Years labels */}
      {years.map((yr) => (
        <text
          key={`yrl-${yr}`}
          x={toX(yr)}
          y={H - 2}
          fill="#52525b"
          fontSize="7"
          textAnchor="middle"
        >
          Year {yr}
        </text>
      ))}
    </svg>
  );
}

// ── TRS Mechanics SVG ──────────────────────────────────────────────────────────
function TrsMechanicsSVG() {
  return (
    <svg viewBox="0 0 480 170" className="w-full" style={{ height: 170 }}>
      <defs>
        <marker
          id="trsA1"
          markerWidth="6"
          markerHeight="6"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
        </marker>
        <marker
          id="trsA2"
          markerWidth="6"
          markerHeight="6"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
        </marker>
        <marker
          id="trsA3"
          markerWidth="6"
          markerHeight="6"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" />
        </marker>
      </defs>
      {/* TRS Receiver (e.g. hedge fund) */}
      <rect
        x="10"
        y="60"
        width="110"
        height="55"
        rx="8"
        fill="#1e1e2e"
        stroke="#34d399"
        strokeWidth="1.5"
      />
      <text
        x="65"
        y="82"
        fill="#6ee7b7"
        fontSize="9"
        textAnchor="middle"
        fontWeight="bold"
      >
        TRS RECEIVER
      </text>
      <text x="65" y="95" fill="#6ee7b7" fontSize="8" textAnchor="middle">
        (Hedge Fund /
      </text>
      <text x="65" y="106" fill="#6ee7b7" fontSize="8" textAnchor="middle">
        Synthetic Long)
      </text>
      {/* TRS Payer (e.g. prime broker) */}
      <rect
        x="360"
        y="60"
        width="110"
        height="55"
        rx="8"
        fill="#1e1e2e"
        stroke="#6366f1"
        strokeWidth="1.5"
      />
      <text
        x="415"
        y="82"
        fill="#a5b4fc"
        fontSize="9"
        textAnchor="middle"
        fontWeight="bold"
      >
        TRS PAYER
      </text>
      <text x="415" y="95" fill="#a5b4fc" fontSize="8" textAnchor="middle">
        (Prime Broker /
      </text>
      <text x="415" y="106" fill="#a5b4fc" fontSize="8" textAnchor="middle">
        Bank)
      </text>
      {/* Equity leg — upward arrow receiver to center, payer gets funding */}
      <line
        x1="120"
        y1="82"
        x2="354"
        y2="82"
        stroke="#34d399"
        strokeWidth="1.5"
        markerEnd="url(#trsA1)"
      />
      <text x="237" y="76" fill="#6ee7b7" fontSize="8" textAnchor="middle">
        SOFR + Spread (funding cost)
      </text>
      {/* Funding leg — downward */}
      <line
        x1="354"
        y1="98"
        x2="120"
        y2="98"
        stroke="#f87171"
        strokeWidth="1.5"
        markerEnd="url(#trsA2)"
      />
      <text x="237" y="112" fill="#fca5a5" fontSize="8" textAnchor="middle">
        Equity total return (price + dividends)
      </text>
      {/* Stock held by payer */}
      <rect
        x="360"
        y="130"
        width="110"
        height="32"
        rx="6"
        fill="#18181b"
        stroke="#f59e0b"
        strokeWidth="1"
      />
      <text
        x="415"
        y="148"
        fill="#fcd34d"
        fontSize="8"
        textAnchor="middle"
        fontWeight="bold"
      >
        Physical Stock Held
      </text>
      <line
        x1="415"
        y1="115"
        x2="415"
        y2="130"
        stroke="#f59e0b"
        strokeWidth="1"
        strokeDasharray="3,2"
        markerEnd="url(#trsA3)"
      />
      <text x="237" y="158" fill="#71717a" fontSize="8" textAnchor="middle">
        Payer hedges by holding underlying equity; receiver gains synthetic exposure
      </text>
    </svg>
  );
}

// ── VIX Roll Cost SVG (VXX-style contango bleed) ──────────────────────────────
function VixRollSVG() {
  const W = 480;
  const H = 180;
  const PAD = { l: 44, r: 16, t: 20, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  // Simulate VIX spot vs front-month futures (contango) over 24 months
  const months = Array.from({ length: 25 }, (_, i) => i);
  // Spot VIX: mean-reverting around 18
  let spot = 18;
  const spotData = months.map((m) => {
    spot = spot + (18 - spot) * 0.1 + (sv() - 0.5) * 2.5;
    return { m, v: Math.max(10, Math.min(35, spot)) };
  });
  // VXX NAV: erodes due to roll cost in contango (~4-5%/month)
  let nav = 100;
  const navData = months.map((m) => {
    const rollCost = 0.04 + sv() * 0.02; // 4-6% roll cost per month
    nav = nav * (1 - rollCost + (sv() - 0.52) * 0.06);
    return { m, v: Math.max(1, nav) };
  });

  const maxSpot = 40;
  const minSpot = 8;
  const maxNav = 100;
  const minNav = 0;

  const toX = (m: number) => PAD.l + (m / 24) * cW;
  const toYSpot = (v: number) =>
    PAD.t + cH - ((v - minSpot) / (maxSpot - minSpot)) * cH;
  const toYNav = (v: number) =>
    PAD.t + cH - ((v - minNav) / (maxNav - minNav)) * cH;

  const spotPts = spotData.map((d) => `${toX(d.m)},${toYSpot(d.v)}`).join(" ");
  const navPts = navData.map((d) => `${toX(d.m)},${toYNav(d.v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {[10, 18, 25, 35].map((v) => (
        <line
          key={`vixgl-${v}`}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={toYSpot(v)}
          y2={toYSpot(v)}
          stroke="#27272a"
          strokeWidth="1"
        />
      ))}
      {[10, 18, 25, 35].map((v) => (
        <text
          key={`vixgy-${v}`}
          x={PAD.l - 4}
          y={toYSpot(v) + 4}
          fill="#71717a"
          fontSize="9"
          textAnchor="end"
        >
          {v}
        </text>
      ))}
      <polyline
        points={spotPts}
        fill="none"
        stroke="#6366f1"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <polyline
        points={navPts}
        fill="none"
        stroke="#f87171"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeDasharray="5,3"
      />
      {/* Legend */}
      <rect x={PAD.l} y={PAD.t} width="8" height="8" fill="#6366f1" />
      <text x={PAD.l + 11} y={PAD.t + 7} fill="#a5b4fc" fontSize="8">
        VIX Spot
      </text>
      <rect x={PAD.l + 70} y={PAD.t} width="8" height="8" fill="#f87171" />
      <text x={PAD.l + 83} y={PAD.t + 7} fill="#fca5a5" fontSize="8">
        VXX NAV (roll decay)
      </text>
      {/* X labels */}
      {[0, 6, 12, 18, 24].map((m) => (
        <text
          key={`vixX-${m}`}
          x={toX(m)}
          y={H - 4}
          fill="#71717a"
          fontSize="9"
          textAnchor="middle"
        >
          Mo {m}
        </text>
      ))}
      <text
        x={PAD.l + cW / 2}
        y={PAD.t - 5}
        fill="#52525b"
        fontSize="8"
        textAnchor="middle"
      >
        VXX contango roll cost erodes NAV even when VIX is stable
      </text>
    </svg>
  );
}

// ── Convertible Bond Pricing SVG ───────────────────────────────────────────────
function CbPricingSVG() {
  const W = 480;
  const H = 200;
  const PAD = { l: 44, r: 16, t: 24, b: 36 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  // X axis: stock price from 0 to 200, par = 100, conversion ratio = 1
  const stocks = Array.from({ length: 60 }, (_, i) => i * 200 / 59);
  // Conversion ratio = 1, so conversion value = stock price
  const convValue = (s: number) => s; // 1:1
  // Bond floor (investment value): 85 (discounted straight bond)
  const bondFloor = 85;
  // CB price = max(bondFloor, convValue) + optionality
  // Optionality peaks near ATM
  const optionality = (s: number) => {
    const atm = 100;
    const otm = (s - atm) / atm;
    // Call option value: rough Black-Scholes approximation
    return Math.max(0, 18 * Math.exp(-0.5 * ((otm - 0) / 0.5) ** 2));
  };
  const cbPrice = (s: number) =>
    Math.max(bondFloor, convValue(s)) + optionality(s);

  const maxP = 220;
  const minP = 0;
  const toX = (s: number) => PAD.l + (s / 200) * cW;
  const toY = (v: number) =>
    PAD.t + cH - ((v - minP) / (maxP - minP)) * cH;

  const cbPts = stocks.map((s) => `${toX(s)},${toY(cbPrice(s))}`).join(" ");
  const convPts = stocks.map((s) => `${toX(s)},${toY(convValue(s))}`).join(" ");
  const floorPts = `${toX(0)},${toY(bondFloor)} ${toX(200)},${toY(bondFloor)}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 200 }}>
      <defs>
        <linearGradient id="cbGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid */}
      {[0, 50, 100, 150, 200].map((v) => (
        <line
          key={`cbgl-${v}`}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={toY(v)}
          y2={toY(v)}
          stroke="#27272a"
          strokeWidth="1"
        />
      ))}
      {[0, 50, 100, 150, 200].map((v) => (
        <text
          key={`cbgy-${v}`}
          x={PAD.l - 4}
          y={toY(v) + 4}
          fill="#71717a"
          fontSize="9"
          textAnchor="end"
        >
          {v}
        </text>
      ))}
      {/* Bond floor */}
      <polyline
        points={floorPts}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeDasharray="5,3"
      />
      <text x={toX(5)} y={toY(bondFloor) - 4} fill="#fcd34d" fontSize="8">
        Bond Floor ($85)
      </text>
      {/* Conversion value */}
      <polyline
        points={convPts}
        fill="none"
        stroke="#34d399"
        strokeWidth="1.5"
        strokeDasharray="4,3"
      />
      <text x={toX(140)} y={toY(140) - 6} fill="#6ee7b7" fontSize="8">
        Conversion Value
      </text>
      {/* CB price (area fill) */}
      <polygon
        points={[
          `${toX(0)},${toY(minP)}`,
          ...stocks.map((s) => `${toX(s)},${toY(cbPrice(s))}`),
          `${toX(200)},${toY(minP)}`,
        ].join(" ")}
        fill="url(#cbGrad)"
      />
      <polyline
        points={cbPts}
        fill="none"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text x={toX(105)} y={toY(cbPrice(100)) - 6} fill="#c7d2fe" fontSize="8">
        CB Price
      </text>
      {/* ATM line */}
      <line
        x1={toX(100)}
        x2={toX(100)}
        y1={PAD.t}
        y2={PAD.t + cH}
        stroke="#6366f1"
        strokeWidth="1"
        strokeDasharray="4,3"
      />
      <text
        x={toX(100)}
        y={PAD.t - 5}
        fill="#818cf8"
        fontSize="8"
        textAnchor="middle"
      >
        ATM (conv. price)
      </text>
      {/* X labels */}
      {[0, 50, 100, 150, 200].map((v) => (
        <text
          key={`cbx-${v}`}
          x={toX(v)}
          y={H - 4}
          fill="#71717a"
          fontSize="9"
          textAnchor="middle"
        >
          ${v}
        </text>
      ))}
      <text
        x={PAD.l + cW / 2}
        y={H - 4}
        fill="#52525b"
        fontSize="8"
        textAnchor="middle"
      >
        Stock Price
      </text>
    </svg>
  );
}

// ── Volatility Regime Chart (2020-2024) ────────────────────────────────────────
function VolRegimeChartSVG() {
  const W = 480;
  const H = 160;
  const PAD = { l: 44, r: 16, t: 16, b: 32 };
  const cW = W - PAD.l - PAD.r;
  const cH = H - PAD.t - PAD.b;

  // Simulated VIX monthly data 2020-2024
  const data: { label: string; vix: number }[] = [
    { label: "Jan'20", vix: 14 },
    { label: "Feb'20", vix: 17 },
    { label: "Mar'20", vix: 66 },
    { label: "Apr'20", vix: 42 },
    { label: "Jun'20", vix: 28 },
    { label: "Sep'20", vix: 26 },
    { label: "Nov'20", vix: 22 },
    { label: "Jan'21", vix: 22 },
    { label: "Mar'21", vix: 20 },
    { label: "Jun'21", vix: 17 },
    { label: "Sep'21", vix: 21 },
    { label: "Nov'21", vix: 28 },
    { label: "Jan'22", vix: 31 },
    { label: "Mar'22", vix: 26 },
    { label: "Jun'22", vix: 28 },
    { label: "Sep'22", vix: 32 },
    { label: "Dec'22", vix: 22 },
    { label: "Mar'23", vix: 18 },
    { label: "Jun'23", vix: 14 },
    { label: "Sep'23", vix: 17 },
    { label: "Nov'23", vix: 13 },
    { label: "Jan'24", vix: 13 },
    { label: "Apr'24", vix: 16 },
    { label: "Aug'24", vix: 24 },
    { label: "Dec'24", vix: 16 },
  ];

  const maxV = 70;
  const toX = (i: number) => PAD.l + (i / (data.length - 1)) * cW;
  const toY = (v: number) => PAD.t + cH - (v / maxV) * cH;

  const pts = data.map((d, i) => `${toX(i)},${toY(d.vix)}`).join(" ");
  const areaPts = [
    `${toX(0)},${PAD.t + cH}`,
    ...data.map((d, i) => `${toX(i)},${toY(d.vix)}`),
    `${toX(data.length - 1)},${PAD.t + cH}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      <defs>
        <linearGradient id="vixRegGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Regime bands */}
      <rect
        x={PAD.l}
        y={toY(70)}
        width={cW}
        height={toY(30) - toY(70)}
        fill="#f87171"
        fillOpacity="0.07"
      />
      <rect
        x={PAD.l}
        y={toY(30)}
        width={cW}
        height={toY(20) - toY(30)}
        fill="#f59e0b"
        fillOpacity="0.07"
      />
      <rect
        x={PAD.l}
        y={toY(20)}
        width={cW}
        height={toY(0) - toY(20)}
        fill="#34d399"
        fillOpacity="0.07"
      />
      <text
        x={W - PAD.r - 2}
        y={toY(55)}
        fill="#f87171"
        fontSize="7.5"
        textAnchor="end"
      >
        Crisis
      </text>
      <text
        x={W - PAD.r - 2}
        y={toY(25)}
        fill="#f59e0b"
        fontSize="7.5"
        textAnchor="end"
      >
        Elevated
      </text>
      <text
        x={W - PAD.r - 2}
        y={toY(10)}
        fill="#34d399"
        fontSize="7.5"
        textAnchor="end"
      >
        Low
      </text>
      {/* Grid */}
      {[0, 20, 30, 50, 70].map((v) => (
        <line
          key={`vrgl-${v}`}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={toY(v)}
          y2={toY(v)}
          stroke="#27272a"
          strokeWidth="1"
        />
      ))}
      {[0, 20, 30, 50, 70].map((v) => (
        <text
          key={`vrgy-${v}`}
          x={PAD.l - 4}
          y={toY(v) + 4}
          fill="#71717a"
          fontSize="9"
          textAnchor="end"
        >
          {v}
        </text>
      ))}
      <polygon points={areaPts} fill="url(#vixRegGrad)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Key labels */}
      <text
        x={toX(2)}
        y={toY(66) - 6}
        fill="#fca5a5"
        fontSize="7.5"
        textAnchor="middle"
      >
        COVID spike
      </text>
      <text
        x={toX(15)}
        y={toY(31) - 6}
        fill="#fcd34d"
        fontSize="7.5"
        textAnchor="middle"
      >
        2022 rate hike
      </text>
      {/* X ticks */}
      {[0, 4, 8, 12, 16, 20, 24].map((i) => {
        const d = data[Math.min(i, data.length - 1)];
        return (
          <text
            key={`vrx-${i}`}
            x={toX(Math.min(i, data.length - 1))}
            y={H - 4}
            fill="#71717a"
            fontSize="7.5"
            textAnchor="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Collapsible section ────────────────────────────────────────────────────────
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  accent?: string;
}
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  accent = "border-zinc-700",
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("border rounded-lg overflow-hidden", accent)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-800/60 transition-colors"
      >
        <span className="text-sm font-semibold text-zinc-200">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Stat chip ──────────────────────────────────────────────────────────────────
function StatChip({
  label,
  value,
  sub,
  color = "text-zinc-200",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 min-w-[90px]">
      <span className="text-xs text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      <span className={cn("text-sm font-bold", color)}>{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  );
}

// ── Variance Swap Payoff calculator display ───────────────────────────────────
function VarianceSwapDisplay() {
  const strikeVol = 22; // strike vol %
  const realizedVol = 28; // realized vol %
  const notional = 1_000_000;
  const strikeVar = strikeVol ** 2;
  const realizedVar = realizedVol ** 2;
  const varNotional = notional / (2 * strikeVol);
  const pnl = varNotional * (realizedVar - strikeVar);
  const fmtM = (n: number) =>
    (n >= 0 ? "+" : "") + "$" + (Math.abs(n) / 1000).toFixed(0) + "K";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatChip label="Strike Vol" value={strikeVol + "%"} color="text-primary" />
      <StatChip label="Realized Vol" value={realizedVol + "%"} color="text-amber-400" />
      <StatChip
        label="Vega Notional"
        value={"$" + (notional / 1000).toFixed(0) + "K"}
        color="text-zinc-300"
      />
      <StatChip
        label="P&L (long var)"
        value={fmtM(pnl)}
        color={posColor(pnl)}
        sub={`(${fmtPct(((realizedVol - strikeVol) / strikeVol) * 100)} move)`}
      />
    </div>
  );
}

// ── Data tables ────────────────────────────────────────────────────────────────
interface EsoData {
  company: string;
  type: string;
  strike: string;
  vesting: string;
  expiry: string;
  dilution: string;
}
const ESO_EXAMPLES: EsoData[] = [
  { company: "Tech Startup", type: "ISO", strike: "$10.00", vesting: "4yr / 1yr cliff", expiry: "10yr", dilution: "~5%" },
  { company: "Public Corp", type: "NQO", strike: "$145.50", vesting: "3yr ratable", expiry: "7yr", dilution: "~1.2%" },
  { company: "Pre-IPO", type: "ISO", strike: "$0.25", vesting: "4yr / 1yr cliff", expiry: "10yr", dilution: "~8%" },
  { company: "SPAC Target", type: "Warrant", strike: "$11.50", vesting: "Immediate", expiry: "5yr", dilution: "~3%" },
];

interface CbData {
  issuer: string;
  coupon: string;
  maturity: string;
  convPrem: string;
  delta: string;
  rating: string;
}
const CB_EXAMPLES: CbData[] = [
  { issuer: "Tech Co A", coupon: "0.25%", maturity: "5yr", convPrem: "30%", delta: "0.55", rating: "BB+" },
  { issuer: "Growth Co B", coupon: "1.00%", maturity: "7yr", convPrem: "20%", delta: "0.72", rating: "B+" },
  { issuer: "Large Cap C", coupon: "0.00%", maturity: "3yr", convPrem: "40%", delta: "0.35", rating: "BBB" },
  { issuer: "Bank AT1", coupon: "6.50%", maturity: "Perp", convPrem: "N/A", delta: "N/A", rating: "BB" },
];

interface TrsUseCase {
  strategy: string;
  receiver: string;
  motivation: string;
  risk: string;
  color: string;
}
const TRS_USE_CASES: TrsUseCase[] = [
  { strategy: "Synthetic Long", receiver: "Hedge Fund", motivation: "Leverage without owning stock; off B/S", risk: "Counterparty, margin calls", color: "text-emerald-400" },
  { strategy: "Tax Efficiency", receiver: "Asset Manager", motivation: "Avoid local withholding tax on dividends", risk: "ISDA documentation", color: "text-sky-400" },
  { strategy: "Short Exposure", receiver: "Short Seller", motivation: "Borrow economics without locating stock", risk: "Recall risk", color: "text-red-400" },
  { strategy: "Reg Capital", receiver: "Bank", motivation: "Move risk off balance sheet vs RWA", risk: "Basel III treatment", color: "text-amber-400" },
];

// ──────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────────────────────────────────────
export default function EquityDerivativesPage() {
  void fmtPct; // suppress if unused

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-border">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-50">
              Equity Derivatives
            </h1>
            <p className="text-sm text-zinc-500">
              Single-stock options, swaps, volatility products, and convertible bonds
            </p>
          </div>
        </div>
        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { label: "Global Eq. Deriv. OI", value: "$20T+" },
            { label: "S&P 500 30-day IV", value: "~16%" },
            { label: "CB Market Size", value: "$350B+" },
            { label: "VIX Long-run avg", value: "~18" },
          ].map((c) => (
            <Badge
              key={c.label}
              variant="outline"
              className="border-zinc-700 text-zinc-300 text-xs"
            >
              {c.label}: <span className="text-primary ml-1">{c.value}</span>
            </Badge>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="sso">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full mb-6 bg-zinc-900/80 border border-zinc-800">
          <TabsTrigger value="sso" className="text-xs md:text-sm">
            <Target className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Single-Stock Options
          </TabsTrigger>
          <TabsTrigger value="swaps" className="text-xs md:text-sm">
            <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Equity Swaps & TRS
          </TabsTrigger>
          <TabsTrigger value="vol" className="text-xs md:text-sm">
            <Activity className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Volatility Products
          </TabsTrigger>
          <TabsTrigger value="cb" className="text-xs md:text-sm">
            <Shield className="w-3.5 h-3.5 mr-1.5 hidden sm:inline" />
            Convertible Bonds
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: SINGLE-STOCK OPTIONS ──────────────────────────────────── */}
        <TabsContent value="sso" className="data-[state=inactive]:hidden space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Intro grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Single-Stock vs Index Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-zinc-400 space-y-2">
                  <p>
                    Single-stock options carry <span className="text-primary font-semibold">idiosyncratic risk</span> — earnings surprises, M&A, dividend announcements — producing higher and more skewed implied volatility surfaces than index options.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                      { label: "Settlement", sso: "Cash or physical", idx: "Cash only" },
                      { label: "Exercise", sso: "American (early OK)", idx: "European (SPX)" },
                      { label: "Earnings Risk", sso: "High IV jump", idx: "Diversified away" },
                      { label: "Liquidity", sso: "Varies by name", idx: "Deep (SPX, NDX)" },
                    ].map((r) => (
                      <div key={r.label} className="bg-zinc-800/60 rounded p-2">
                        <div className="text-xs text-zinc-500 uppercase mb-1">{r.label}</div>
                        <div className="text-emerald-400 text-[11px]">SSO: {r.sso}</div>
                        <div className="text-sky-400 text-[11px]">IDX: {r.idx}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                    Volatility Surface (Term Structure + Skew)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <VolSurfaceSVG />
                  <p className="text-xs text-zinc-500 mt-1">
                    Put skew (OTM puts expensive) reflects demand for downside protection. Term structure typically inverted during stress.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ESO vesting */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Employee Stock Options (ESO) — Cliff & Ratable Vesting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EsoVestingSVG />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatChip label="Cliff" value="Year 1" sub="25% vests" color="text-amber-400" />
                  <StatChip label="Full vest" value="Year 4" sub="100%" color="text-emerald-400" />
                  <StatChip label="Expiry" value="7–10 yr" sub="post-grant" color="text-primary" />
                  <StatChip label="Tax (ISO)" value="AMT risk" sub="Incentive SO" color="text-sky-400" />
                </div>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {["Company", "Type", "Strike", "Vesting", "Expiry", "Dilution"].map((h) => (
                          <th key={h} className="px-2 py-1.5 text-left text-zinc-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ESO_EXAMPLES.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className="px-2 py-1.5 text-zinc-300">{row.company}</td>
                          <td className="px-2 py-1.5 text-primary">{row.type}</td>
                          <td className="px-2 py-1.5 text-emerald-400">{row.strike}</td>
                          <td className="px-2 py-1.5 text-zinc-400">{row.vesting}</td>
                          <td className="px-2 py-1.5 text-zinc-400">{row.expiry}</td>
                          <td className="px-2 py-1.5 text-amber-400">{row.dilution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Expandable mechanics */}
            <div className="space-y-3">
              <CollapsibleSection
                title="Corporate Actions: Dividend Adjustments & M&A Treatment"
                defaultOpen={true}
                accent="border-emerald-900/50"
              >
                <div className="space-y-2 text-xs text-zinc-400">
                  <p>
                    <span className="text-emerald-400 font-semibold">Ordinary dividends:</span> Listed equity options are NOT automatically adjusted for ordinary dividends. The dividend is priced into put-call parity via the forward price F = S·e^(r-q)T. Traders call this the &quot;dividend drag&quot; on call values.
                  </p>
                  <p>
                    <span className="text-emerald-400 font-semibold">Special dividends:</span> OCC adjusts listed option strikes/multipliers for special dividends {">"}$0.125/share. The strike is reduced by the dividend amount on ex-date.
                  </p>
                  <p>
                    <span className="text-emerald-400 font-semibold">M&A treatment:</span> In cash mergers, listed options are typically cash-settled at intrinsic value. In stock mergers, options convert per the exchange ratio. Volatility typically collapses to merger spread dynamics after announcement.
                  </p>
                  <p>
                    <span className="text-amber-400 font-semibold">Early exercise of American options:</span> Rational when the time value of money on the strike exceeds the remaining optionality. For deep ITM calls with large pending dividends: exercise just before ex-date to capture the dividend the call does not receive.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Warrants vs Listed Options — Dilution Effect"
                accent="border-border"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <p>
                    <span className="text-primary font-semibold">Warrants</span> are issued by the company itself; exercise creates new shares, diluting existing shareholders. Listed exchange-traded options involve no new share issuance — only transfer of existing shares.
                  </p>
                  <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px] mt-2">
                    <div className="text-zinc-300 mb-1">Warrant dilution adjustment:</div>
                    <div className="text-primary">W = (N / N+nW) × C(S*, X, T)</div>
                    <div className="text-zinc-500 mt-1">
                      N = existing shares, nW = warrants, S* = diluted spot, C = Black-Scholes call
                    </div>
                  </div>
                  <p>
                    <span className="text-amber-400 font-semibold">LEAPS</span> (Long-term Equity AnticiPation Securities) are listed options with expirations of 1–3 years. Used as cheap leverage substitutes for long stock positions, capital-efficient covered writes, and long-dated tail hedges.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="OTC vs Listed Equity Options — Equity Linked Notes"
                accent="border-sky-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Listed (CBOE)", features: ["Standardized strikes/expiries", "Exchange clearing (OCC)", "Daily mark-to-market margin", "Deep liquidity for mega-caps"] },
                      { label: "OTC (ISDA)", features: ["Custom terms, any expiry", "Counterparty credit risk", "CSA/collateral negotiated", "Barrier/digital/Asian variants"] },
                    ].map((col) => (
                      <div key={col.label} className="bg-zinc-800/50 rounded p-3">
                        <div className="text-sky-300 font-semibold text-[11px] mb-2">{col.label}</div>
                        {col.features.map((f) => (
                          <div key={f} className="flex items-start gap-1 mb-1">
                            <span className="text-sky-500 mt-0.5">•</span>
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p>
                    <span className="text-emerald-400 font-semibold">Equity Linked Notes (ELNs):</span> Structured notes embedding a short put (reverse convertible) or long call (participation note). Issuer embeds the option premium into the note coupon or principal protection level. Retail investors receive enhanced yield; bank monetizes the embedded short vol.
                  </p>
                </div>
              </CollapsibleSection>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 2: EQUITY SWAPS & TRS ─────────────────────────────────────── */}
        <TabsContent value="swaps" className="data-[state=inactive]:hidden space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* TRS Diagram */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                  Total Return Swap (TRS) Mechanics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <TrsMechanicsSVG />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-zinc-800/60 rounded p-2">
                    <div className="text-emerald-400 font-semibold mb-1">Equity Leg</div>
                    <div className="text-zinc-400">Receiver gets: price appreciation + dividends. Payer hedged by holding stock.</div>
                  </div>
                  <div className="bg-zinc-800/60 rounded p-2">
                    <div className="text-sky-400 font-semibold mb-1">Funding Leg</div>
                    <div className="text-zinc-400">Receiver pays: SOFR + spread (financing cost). Reset quarterly or semi-annually.</div>
                  </div>
                  <div className="bg-zinc-800/60 rounded p-2">
                    <div className="text-amber-400 font-semibold mb-1">Funded vs Unfunded</div>
                    <div className="text-zinc-400">Funded: receiver posts upfront capital. Unfunded: receiver posts only initial margin (more leveraged).</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TRS use cases */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  Equity Swap Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {["Strategy", "Receiver", "Motivation", "Key Risk"].map((h) => (
                          <th key={h} className="px-3 py-1.5 text-left text-zinc-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TRS_USE_CASES.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className={cn("px-3 py-2 font-semibold", row.color)}>{row.strategy}</td>
                          <td className="px-3 py-2 text-zinc-300">{row.receiver}</td>
                          <td className="px-3 py-2 text-zinc-400">{row.motivation}</td>
                          <td className="px-3 py-2 text-red-400/80">{row.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <CollapsibleSection
                title="Archegos Case Study — Synthetic Long via TRS"
                defaultOpen={true}
                accent="border-red-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-900/40 rounded">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p>
                      Archegos Capital (2021) built concentrated positions in media stocks (ViacomCBS, Discovery) entirely via TRS with multiple prime brokers. Because the positions were off-balance-sheet, no public 13-F disclosure was required. When ViacomCBS fell sharply, margin calls triggered a $20B+ forced unwind causing prime broker losses of $10B+.
                    </p>
                  </div>
                  <p>
                    <span className="text-red-300 font-semibold">Lesson:</span> TRS concentration risk is invisible to regulators without prime broker reporting. Post-Archegos, SEC proposed mandatory disclosure of synthetic equity positions above 5% thresholds.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Variance Swap — Payoff & Vega Swap Introduction"
                accent="border-amber-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-3">
                  <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px]">
                    <div className="text-amber-300 mb-1">Variance Swap Payoff (long):</div>
                    <div className="text-zinc-200">P&L = Var Notional × (σ²_realized − σ²_strike)</div>
                    <div className="text-zinc-500 mt-1">Var Notional = Vega Notional / (2 × σ_strike)</div>
                  </div>
                  <VarianceSwapDisplay />
                  <p>
                    <span className="text-amber-400 font-semibold">Vega swap</span> is a linearized variant: payoff = Vega Notional × (σ_realized − σ_strike). Unlike variance swaps, vega swaps do not convexify — they have symmetric P&L in vol space and are easier for clients to size.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Dividend Swap, Equity Repo & Synthetic ETF"
                accent="border-sky-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <p>
                    <span className="text-sky-300 font-semibold">Dividend swap:</span> Receiver pays a fixed dividend level (strike), receives actual declared dividends. Used to hedge dividend uncertainty in long-dated equity structures or speculate on corporate payout policy changes.
                  </p>
                  <p>
                    <span className="text-sky-300 font-semibold">Equity repo:</span> Similar to fixed income repo — holder of stock sells and agrees to repurchase at a fixed date. Provides financing for leveraged long positions; rebate rate reflects stock borrowing cost and dividend pass-through terms.
                  </p>
                  <p>
                    <span className="text-emerald-400 font-semibold">Synthetic ETF construction:</span> Rather than holding all index constituents physically, a synthetic ETF enters an equity swap with a bank counterparty. The bank delivers the index return; the ETF posts a substitute collateral basket. Lower tracking error but introduces counterparty credit risk (UCITS limits to 10% exposure per counterparty).
                  </p>
                </div>
              </CollapsibleSection>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 3: VOLATILITY PRODUCTS ───────────────────────────────────── */}
        <TabsContent value="vol" className="data-[state=inactive]:hidden space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* VIX overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-red-400" />
                    VIX Calculation & Term Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-zinc-400 space-y-2">
                  <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px]">
                    <div className="text-primary mb-1">VIX Formula (model-free):</div>
                    <div className="text-zinc-200">
                      σ² = (2/T) Σ ΔKᵢ/Kᵢ² × e^(rT) × Q(Kᵢ) − (1/T)[F/K₀ − 1]²
                    </div>
                    <div className="text-zinc-500 mt-1">
                      Q(K) = mid-price of OTM option at strike K; T = 30-day interpolation
                    </div>
                  </div>
                  <p>
                    VIX measures the <span className="text-primary font-semibold">expected 30-day annualized volatility</span> of the S&P 500, derived from a strip of OTM SPX options. VVIX measures vol-of-VIX.
                  </p>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[
                      { label: "VIX Spot", value: "~16", color: "text-primary" },
                      { label: "VIX 3M", value: "~18", color: "text-sky-400" },
                      { label: "VIX 6M", value: "~20", color: "text-amber-400" },
                    ].map((c) => (
                      <StatChip key={c.label} label={c.label} value={c.value} color={c.color} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    VXX Roll Cost (Contango Bleed)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <VixRollSVG />
                  <p className="text-xs text-zinc-500 mt-1">
                    In contango (front month futures {">"}  VIX spot), daily rolling from front-month to second-month futures creates a persistent negative carry of 4–8% per month. VXX loses ~75% of its value per year on average in low-vol environments.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Vol regime chart */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-primary" />
                  VIX Regime Chart (2020–2024)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VolRegimeChartSVG />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <CollapsibleSection
                title="Volatility Surface Modeling — SVI / SABR"
                defaultOpen={true}
                accent="border-border"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <p>
                    <span className="text-primary font-semibold">SVI (Stochastic Volatility Inspired):</span> parameterizes total implied variance w(k) = a + b{"{"}ρ(k−m) + √((k−m)²+σ²){"}"}. Guarantees no static arbitrage across strikes for a given expiry. Used widely for single-expiry smile fitting.
                  </p>
                  <p>
                    <span className="text-sky-300 font-semibold">SABR model:</span> stochastic α (vol of vol) and ρ (vol-spot correlation) parameters. Forward SABR popular for interest rate derivatives and swaptions. Equity desks typically use local volatility (Dupire) or SLV (stochastic local vol) hybrid models for path-dependent exotic pricing.
                  </p>
                  <p>
                    <span className="text-amber-400 font-semibold">Realized vs implied vol P&L:</span> Gamma P&L = ½ Γ S² (σ²_realized/σ²_implied − 1) dt. Long gamma profitable when realized vol {">"} implied vol paid; short gamma (vol selling) profitable in low realized vol environments.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Vol Selling Strategies — Short Strangle & Iron Condor"
                accent="border-emerald-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        name: "Short Strangle",
                        desc: "Sell OTM call + OTM put. Profit if stock stays between strikes. Max profit = premium received. Unlimited upside/downside risk.",
                        risk: "Unlimited",
                        color: "text-amber-400",
                      },
                      {
                        name: "Iron Condor",
                        desc: "Short strangle + buy further OTM wings. Defined max loss. Suitable for institutional and retail vol selling.",
                        risk: "Defined (wing width − credit)",
                        color: "text-emerald-400",
                      },
                    ].map((s) => (
                      <div key={s.name} className="bg-zinc-800/60 rounded p-3">
                        <div className={cn("font-semibold mb-1", s.color)}>{s.name}</div>
                        <div className="text-zinc-400 mb-2">{s.desc}</div>
                        <div className="text-red-400 text-xs">Max Loss: {s.risk}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Dispersion Trading & Correlation Swaps"
                accent="border-sky-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <p>
                    <span className="text-sky-300 font-semibold">Dispersion trade:</span> Short index variance swap + long component stock variance swaps (weighted by index weights). Profits when correlation falls (stocks diverge more than the index implies). Index vol trades at a premium to weighted component vol due to &quot;correlation risk premium.&quot;
                  </p>
                  <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px]">
                    <div className="text-sky-300 mb-1">Implied correlation approximation:</div>
                    <div className="text-zinc-200">ρ_implied = (σ²_index − Σwᵢ²σᵢ²) / (2 ΣΣ wᵢwⱼ σᵢσⱼ)</div>
                  </div>
                  <p>
                    <span className="text-primary font-semibold">Correlation swaps</span> pay directly on realized correlation between a basket and its components. More pure exposure than dispersion trades but less liquid; OTC only. Typical strikes: 40–60% for S&P 500 sub-baskets.
                  </p>
                  <p>
                    <span className="text-amber-400 font-semibold">Variance notional conversion:</span> $1M vega notional converts to a variance notional of $1M / (2 × σ_strike). At 20% strike, variance notional = $25,000. At 40% strike, variance notional = $12,500. The convexity of variance swaps means realized vol above strike is increasingly profitable vs vega swaps.
                  </p>
                </div>
              </CollapsibleSection>
            </div>
          </motion.div>
        </TabsContent>

        {/* ── TAB 4: CONVERTIBLE BONDS ─────────────────────────────────────── */}
        <TabsContent value="cb" className="data-[state=inactive]:hidden space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* CB pricing SVG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    CB Anatomy & Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CbPricingSVG />
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    {[
                      { label: "Busted CB", desc: "Stock far OTM; trades near bond floor. Bond-like delta ~0.1.", color: "text-red-400" },
                      { label: "Balanced CB", desc: "ATM region. High gamma, optionality premium maximized. Delta 0.4–0.6.", color: "text-amber-400" },
                      { label: "In-the-Money CB", desc: "Conversion value dominates. Equity-like delta ~0.9+.", color: "text-emerald-400" },
                    ].map((s) => (
                      <div key={s.label} className="bg-zinc-800/50 rounded p-2">
                        <div className={cn("font-semibold mb-1", s.color)}>{s.label}</div>
                        <div className="text-zinc-400">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    CB Market Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <StatChip label="Global CB Mkt" value="$350B+" sub="outstanding" color="text-primary" />
                      <StatChip label="Avg Coupon" value="0.5–2%" sub="vs 4–6% HY" color="text-emerald-400" />
                      <StatChip label="Conv. Premium" value="20–40%" sub="at issuance" color="text-amber-400" />
                      <StatChip label="Typical Maturity" value="5–7 yr" sub="callable after Yr3" color="text-sky-400" />
                    </div>
                    <div className="overflow-auto mt-2">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            {["Issuer", "Coupon", "Mat.", "Conv. Prem.", "Delta", "Rating"].map((h) => (
                              <th key={h} className="px-1.5 py-1 text-left text-zinc-500 font-medium text-xs">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {CB_EXAMPLES.map((row, i) => (
                            <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                              <td className="px-1.5 py-1 text-zinc-300">{row.issuer}</td>
                              <td className="px-1.5 py-1 text-emerald-400">{row.coupon}</td>
                              <td className="px-1.5 py-1 text-zinc-400">{row.maturity}</td>
                              <td className="px-1.5 py-1 text-amber-400">{row.convPrem}</td>
                              <td className="px-1.5 py-1 text-primary">{row.delta}</td>
                              <td className="px-1.5 py-1 text-sky-400">{row.rating}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CB mechanics collapsibles */}
            <div className="space-y-3">
              <CollapsibleSection
                title="Conversion Ratio, Premium & CB Arbitrage"
                defaultOpen={true}
                accent="border-border"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px]">
                      <div className="text-primary mb-1">Conversion Ratio:</div>
                      <div className="text-zinc-200">CR = Face Value / Conversion Price</div>
                      <div className="text-zinc-500 mt-1">e.g. $1,000 / $50 = 20 shares</div>
                    </div>
                    <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px]">
                      <div className="text-emerald-300 mb-1">Conversion Premium:</div>
                      <div className="text-zinc-200">Prem = (Conv. Price − Spot) / Spot</div>
                      <div className="text-zinc-500 mt-1">e.g. ($50 − $40) / $40 = 25%</div>
                    </div>
                    <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px]">
                      <div className="text-amber-300 mb-1">Parity (Conversion Value):</div>
                      <div className="text-zinc-200">Parity = CR × Spot Price</div>
                      <div className="text-zinc-500 mt-1">e.g. 20 × $40 = $800</div>
                    </div>
                  </div>
                  <p>
                    <span className="text-primary font-semibold">CB Arbitrage strategy:</span> Long the CB (bond + embedded call), short the underlying stock delta-equivalent. The arb captures the implied volatility discount of the embedded option vs listed options. Position is long gamma: profits from large moves in either direction. Risk: credit deterioration widens CB spread and collapses the bond floor.
                  </p>
                  <p>
                    <span className="text-sky-300 font-semibold">Convexity of CB:</span> CBs exhibit positive convexity — in equity rallies, delta approaches 1 and price rises dollar-for-dollar with stock; in equity declines, delta approaches 0 and the bond floor limits downside. This asymmetric profile is the core attraction for equity investors seeking downside cushion.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Gamma Trading by CB Hedge Funds"
                accent="border-emerald-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-2">
                  <p>
                    CB hedge funds continuously delta-hedge their long CB portfolios by shorting the underlying stock. As the stock moves, they:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { scenario: "Stock rallies", action: "Delta increases → sell more stock short (delta hedge)", color: "text-red-400" },
                      { scenario: "Stock declines", action: "Delta decreases → buy back stock short (delta hedge)", color: "text-emerald-400" },
                    ].map((s) => (
                      <div key={s.scenario} className="bg-zinc-800/50 rounded p-2">
                        <div className={cn("font-semibold text-[11px] mb-1", s.color)}>{s.scenario}</div>
                        <div className="text-zinc-400">{s.action}</div>
                      </div>
                    ))}
                  </div>
                  <p>
                    The net effect is <span className="text-emerald-400 font-semibold">buy low / sell high</span> systematically — capturing realized gamma. This is profitable when realized vol {">"} implied vol priced into the embedded option. The CB pays for this gamma via a lower coupon (the option premium embedded in the structure).
                  </p>
                  <p className="text-zinc-500">
                    P&L per delta-hedge rebalancing ≈ ½ × Γ × (ΔS)² — the classic &quot;scalped gamma&quot; formula. Larger stock moves and higher gamma (near-ATM CBs) maximize gamma P&L.
                  </p>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                title="Mandatory Convertibles (PRCS/DECS) & CoCo/AT1 Bonds"
                accent="border-amber-900/50"
              >
                <div className="text-xs text-zinc-400 space-y-3">
                  <p>
                    <span className="text-amber-400 font-semibold">Mandatory convertibles</span> (PRCS — Preferred Redeemable Increased Dividend Equity Securities, DECS — Debt Exchangeable for Common Stock) must convert at maturity regardless of stock price. The conversion ratio varies with the stock price at maturity, giving them an equity-like profile from issuance. They offer higher coupons (4–7%) to compensate for mandatory conversion risk.
                  </p>
                  <div className="bg-zinc-800/60 rounded p-3 font-mono text-[11px]">
                    <div className="text-amber-300 mb-1">PRCS conversion schedule:</div>
                    <div className="text-zinc-200">
                      Stock ≤ Lower Strike: receive max shares (full dilution)<br />
                      Between strikes: receive fixed value in shares<br />
                      Stock ≥ Upper Strike: receive min shares (capped upside)
                    </div>
                  </div>
                  <p>
                    <span className="text-red-400 font-semibold">CoCo (Contingent Convertible) / AT1 bonds:</span> Bank capital instruments that absorb losses at a trigger point (e.g. CET1 ratio falls below 5.125%). They either convert into equity or face principal write-down. Additional Tier 1 (AT1) bonds count toward Basel III capital requirements. Credit Suisse write-down of ~$17B CHF AT1s in March 2023 shocked the market — prioritizing equity recovery over AT1 bondholders contrary to typical creditor hierarchy.
                  </p>
                  <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-900/40 rounded">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      <span className="text-amber-300 font-semibold">Bail-in mechanics:</span> AT1 bonds have a statutory bail-in power allowing regulators to write them down or convert them before public funds are used. This makes AT1 yields permanently higher than senior unsecured debt — the &quot;going concern&quot; loss-absorbing premium.
                    </p>
                  </div>
                </div>
              </CollapsibleSection>
            </div>

            {/* Delta across CB spectrum */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  CB Delta Profile Across Moneyness Spectrum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {["Stock/Conv. Price", "Region", "Delta", "Duration", "Credit Sensitivity", "Behavior"].map((h) => (
                          <th key={h} className="px-2 py-1.5 text-left text-zinc-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { ratio: "<60%", region: "Busted", delta: "0.0–0.15", dur: "High (4–7yr)", credit: "Very High", behavior: "Trades as distressed bond", color: "text-red-400" },
                        { ratio: "60–80%", region: "Low Delta", delta: "0.15–0.35", dur: "Moderate", credit: "High", behavior: "Balanced; bond floor relevant", color: "text-amber-400" },
                        { ratio: "80–120%", region: "Balanced", delta: "0.35–0.65", dur: "Low", credit: "Moderate", behavior: "Max gamma; optimal arb zone", color: "text-emerald-400" },
                        { ratio: "120–150%", region: "In-the-Money", delta: "0.65–0.85", dur: "Minimal", credit: "Low", behavior: "Equity proxy + floor protection", color: "text-sky-400" },
                        { ratio: ">150%", region: "Deep ITM", delta: "0.85–1.0", dur: "Near zero", credit: "Negligible", behavior: "Converts/calls; equity-like", color: "text-primary" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                          <td className={cn("px-2 py-1.5 font-semibold", row.color)}>{row.ratio}</td>
                          <td className="px-2 py-1.5 text-zinc-300">{row.region}</td>
                          <td className="px-2 py-1.5 text-primary">{row.delta}</td>
                          <td className="px-2 py-1.5 text-zinc-400">{row.dur}</td>
                          <td className="px-2 py-1.5 text-red-400/80">{row.credit}</td>
                          <td className="px-2 py-1.5 text-zinc-400">{row.behavior}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Footer disclaimer */}
      <div className="mt-8 text-center text-[11px] text-zinc-600">
        Educational simulation only. Equity derivatives involve substantial risk and are not suitable for all investors.
      </div>
    </div>
  );
}
