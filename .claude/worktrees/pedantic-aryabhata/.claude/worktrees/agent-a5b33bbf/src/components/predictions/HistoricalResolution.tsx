"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  BarChart3,
  Target,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ResolvedMarket {
  id: string;
  question: string;
  category: string;
  outcome: "yes" | "no";
  finalProbability: number; // YES probability just before resolution (0–100)
  yesHoldersPnlPct: number; // net % gain for YES holders
  noHoldersPnlPct: number;  // net % gain for NO holders
  resolvedDate: string;
  volume: number;
}

// ── Seeded PRNG ───────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Generate 20 resolved markets ─────────────────────────────────────────────

function buildResolvedMarkets(): ResolvedMarket[] {
  const rng = mulberry32(20260101);
  const rand = () => rng();
  const randInt = (lo: number, hi: number) => Math.floor(rand() * (hi - lo + 1)) + lo;

  const templates: {
    question: string;
    category: string;
    finalProb: number;
    outcome: "yes" | "no";
    date: string;
    volume: number;
  }[] = [
    {
      question: "Fed holds rates unchanged at December 2025 FOMC?",
      category: "Macro",
      finalProb: 78,
      outcome: "yes",
      date: "2025-12-18",
      volume: 2_100_000,
    },
    {
      question: "US CPI above 3.0% YoY for November 2025?",
      category: "Macro",
      finalProb: 62,
      outcome: "no",
      date: "2025-12-10",
      volume: 980_000,
    },
    {
      question: "NVIDIA beats Q4 2025 EPS estimate?",
      category: "Earnings",
      finalProb: 81,
      outcome: "yes",
      date: "2026-02-26",
      volume: 4_300_000,
    },
    {
      question: "Bitcoin above $90,000 on December 31, 2025?",
      category: "Crypto",
      finalProb: 54,
      outcome: "yes",
      date: "2025-12-31",
      volume: 6_800_000,
    },
    {
      question: "Tesla misses Q4 2025 delivery estimates?",
      category: "Earnings",
      finalProb: 47,
      outcome: "yes",
      date: "2026-01-03",
      volume: 3_100_000,
    },
    {
      question: "US unemployment stays below 4.5% through Q4 2025?",
      category: "Macro",
      finalProb: 88,
      outcome: "yes",
      date: "2026-01-10",
      volume: 740_000,
    },
    {
      question: "S&P 500 ends 2025 above 5,500?",
      category: "Equities",
      finalProb: 71,
      outcome: "yes",
      date: "2025-12-31",
      volume: 5_200_000,
    },
    {
      question: "Apple beats Q1 2026 revenue estimate of $120B?",
      category: "Earnings",
      finalProb: 58,
      outcome: "no",
      date: "2026-02-01",
      volume: 2_900_000,
    },
    {
      question: "WTI crude above $80/barrel on Jan 31, 2026?",
      category: "Commodities",
      finalProb: 41,
      outcome: "no",
      date: "2026-01-31",
      volume: 1_450_000,
    },
    {
      question: "G20 leaders agree on carbon tariff framework in 2025?",
      category: "Politics",
      finalProb: 19,
      outcome: "no",
      date: "2025-12-01",
      volume: 430_000,
    },
    {
      question: "Fed cuts rates at January 2026 FOMC meeting?",
      category: "Macro",
      finalProb: 26,
      outcome: "no",
      date: "2026-01-29",
      volume: 3_600_000,
    },
    {
      question: "META daily active users exceed 3.5B in Q4 2025?",
      category: "Earnings",
      finalProb: 69,
      outcome: "yes",
      date: "2026-02-05",
      volume: 2_200_000,
    },
    {
      question: "Ethereum above $3,500 on February 28, 2026?",
      category: "Crypto",
      finalProb: 38,
      outcome: "no",
      date: "2026-02-28",
      volume: 3_900_000,
    },
    {
      question: "Gold stays above $2,500/oz through January 2026?",
      category: "Commodities",
      finalProb: 82,
      outcome: "yes",
      date: "2026-01-31",
      volume: 1_100_000,
    },
    {
      question: "US housing starts above 1.4M annualized in Q4 2025?",
      category: "Macro",
      finalProb: 44,
      outcome: "no",
      date: "2026-01-17",
      volume: 320_000,
    },
    {
      question: "Microsoft Azure revenue grows >25% YoY in Q2 FY2026?",
      category: "Earnings",
      finalProb: 73,
      outcome: "yes",
      date: "2026-01-30",
      volume: 1_800_000,
    },
    {
      question: "OPEC+ extends production cuts through Q2 2026?",
      category: "Commodities",
      finalProb: 61,
      outcome: "yes",
      date: "2025-12-05",
      volume: 880_000,
    },
    {
      question: "US Senate passes AI regulation bill in Q1 2026?",
      category: "Politics",
      finalProb: 14,
      outcome: "no",
      date: "2026-03-31",
      volume: 560_000,
    },
    {
      question: "Amazon beats Q4 2025 EPS estimate?",
      category: "Earnings",
      finalProb: 77,
      outcome: "yes",
      date: "2026-02-06",
      volume: 3_300_000,
    },
    {
      question: "VIX stays below 25 through February 2026?",
      category: "Equities",
      finalProb: 55,
      outcome: "no",
      date: "2026-02-28",
      volume: 2_700_000,
    },
  ];

  return templates.map((t) => {
    // YES holders: if outcome=yes they payout at $1/share; if no, lose stake
    // P&L as percent: (payout - cost) / cost * 100
    // Cost = finalProb cents per share; payout = 100 cents if win
    const yesCostCents = t.finalProb;
    const noCostCents = 100 - t.finalProb;
    const yesWon = t.outcome === "yes";
    const yesPnlPct = yesWon
      ? Math.round(((100 - yesCostCents) / yesCostCents) * 100)
      : -100;
    const noPnlPct = !yesWon
      ? Math.round(((100 - noCostCents) / noCostCents) * 100)
      : -100;

    return {
      id: t.question.toLowerCase().replace(/\W+/g, "-").slice(0, 30),
      question: t.question,
      category: t.category,
      outcome: t.outcome,
      finalProbability: t.finalProb,
      yesHoldersPnlPct: yesPnlPct,
      noHoldersPnlPct: noPnlPct,
      resolvedDate: t.date,
      volume: t.volume,
    };
  });
}

const RESOLVED_MARKETS = buildResolvedMarkets();

// ── Calibration data ──────────────────────────────────────────────────────────

interface CalibrationBucket {
  label: string;
  center: number;
  total: number;
  correct: number;
  accuracy: number | null;
}

function computeCalibration(markets: ResolvedMarket[]): CalibrationBucket[] {
  const buckets: { label: string; center: number; min: number; max: number }[] = [
    { label: "0–20%", center: 10, min: 0, max: 20 },
    { label: "20–40%", center: 30, min: 20, max: 40 },
    { label: "40–60%", center: 50, min: 40, max: 60 },
    { label: "60–80%", center: 70, min: 60, max: 80 },
    { label: "80–100%", center: 90, min: 80, max: 100 },
  ];

  return buckets.map((b) => {
    const inBucket = markets.filter(
      (m) => m.finalProbability >= b.min && m.finalProbability < b.max,
    );
    const correct = inBucket.filter((m) => m.outcome === "yes").length;
    const accuracy = inBucket.length > 0 ? Math.round((correct / inBucket.length) * 100) : null;
    return {
      label: b.label,
      center: b.center,
      total: inBucket.length,
      correct,
      accuracy,
    };
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v}`;
}

function pnlColor(pct: number): string {
  return pct >= 0 ? "text-green-400" : "text-red-400";
}

// ── Sub-components ────────────────────────────────────────────────────────────

type SortKey = "date" | "prob" | "volume";

export function HistoricalResolution() {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [showCalibration, setShowCalibration] = useState(true);

  const sorted = useMemo(() => {
    const list = [...RESOLVED_MARKETS];
    if (sortKey === "date") list.sort((a, b) => b.resolvedDate.localeCompare(a.resolvedDate));
    if (sortKey === "prob") list.sort((a, b) => b.finalProbability - a.finalProbability);
    if (sortKey === "volume") list.sort((a, b) => b.volume - a.volume);
    return list;
  }, [sortKey]);

  const calibration = useMemo(() => computeCalibration(RESOLVED_MARKETS), []);

  const summary = useMemo(() => {
    const yesOutcomes = RESOLVED_MARKETS.filter((m) => m.outcome === "yes").length;
    const avgProb = Math.round(
      RESOLVED_MARKETS.reduce((s, m) => s + m.finalProbability, 0) / RESOLVED_MARKETS.length,
    );
    return { yesOutcomes, total: RESOLVED_MARKETS.length, avgProb };
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Historical Resolutions</h2>
          <p className="text-[11px] text-muted-foreground">
            {summary.total} resolved markets — final probability before resolution shown
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(["date", "prob", "volume"] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setSortKey(k)}
              className={cn(
                "rounded px-2 py-1 text-[10px] font-medium capitalize transition-colors",
                sortKey === k
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {k === "prob" ? "Probability" : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total Resolved", value: String(summary.total) },
          {
            label: "YES Outcomes",
            value: `${summary.yesOutcomes}/${summary.total}`,
          },
          {
            label: "Avg Final Prob",
            value: `${summary.avgProb}%`,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card px-3 py-2"
          >
            <div className="text-[9px] text-muted-foreground">{label}</div>
            <div className="font-mono tabular-nums text-sm font-semibold text-foreground">
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Calibration section */}
      <div className="rounded-lg border border-border bg-card">
        <button
          onClick={() => setShowCalibration((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Calibration Analysis
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">
              {showCalibration ? "Collapse" : "Expand"}
            </span>
          </div>
        </button>

        {showCalibration && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <p className="mb-3 text-[10px] text-muted-foreground">
              A well-calibrated market shows that events predicted at 70% probability resolved YES
              roughly 70% of the time. Deviation indicates over- or under-confidence.
            </p>
            <div className="space-y-3">
              {calibration.map((b) => (
                <div key={b.label} className="flex items-center gap-3">
                  <div className="w-16 shrink-0 text-[10px] text-muted-foreground font-mono">
                    {b.label}
                  </div>
                  <div className="flex-1">
                    {b.accuracy !== null ? (
                      <>
                        <div className="mb-0.5 flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">
                            {b.correct}/{b.total} YES
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-foreground">
                            {b.accuracy}% actual
                          </span>
                        </div>
                        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                          {/* Expected */}
                          <div
                            className="absolute inset-y-0 left-0 w-0.5 bg-muted-foreground/40"
                            style={{ left: `${b.center}%` }}
                          />
                          {/* Actual */}
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              Math.abs(b.accuracy - b.center) <= 10
                                ? "bg-green-500/60"
                                : Math.abs(b.accuracy - b.center) <= 20
                                  ? "bg-amber-500/60"
                                  : "bg-red-500/60",
                            )}
                            style={{ width: `${b.accuracy}%` }}
                          />
                        </div>
                        <div className="mt-0.5 flex items-center justify-between text-[9px] text-muted-foreground">
                          <span>Expected ~{b.center}%</span>
                          {Math.abs(b.accuracy - b.center) > 15 && (
                            <span className="text-amber-400">
                              {b.accuracy > b.center ? "Over-predicted" : "Under-predicted"}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-[10px] italic text-muted-foreground/50">
                        No markets in this range
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resolved markets table */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-[11px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Market Question
              </th>
              <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">
                Category
              </th>
              <th className="px-3 py-2.5 text-center font-medium text-muted-foreground">
                Outcome
              </th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                Final Prob
              </th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                YES P&L
              </th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                NO P&L
              </th>
              <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr
                key={m.id}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-muted/10"
              >
                <td className="max-w-[220px] px-3 py-2 text-foreground">
                  <span className="line-clamp-2 leading-snug">{m.question}</span>
                  <div className="mt-0.5 text-[9px] text-muted-foreground">
                    Resolved {m.resolvedDate}
                  </div>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{m.category}</td>
                <td className="px-3 py-2 text-center">
                  {m.outcome === "yes" ? (
                    <span className="inline-flex items-center gap-0.5 rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-green-400">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                      YES
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-red-400">
                      <XCircle className="h-2.5 w-2.5" />
                      NO
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-14 overflow-hidden rounded-full bg-muted/40 h-1">
                      <div
                        className="h-full rounded-full bg-primary/50"
                        style={{ width: `${m.finalProbability}%` }}
                      />
                    </div>
                    <span className="font-mono tabular-nums font-semibold text-foreground">
                      {m.finalProbability}%
                    </span>
                  </div>
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular-nums font-semibold", pnlColor(m.yesHoldersPnlPct))}>
                  {m.yesHoldersPnlPct >= 0 ? "+" : ""}
                  {m.yesHoldersPnlPct}%
                </td>
                <td className={cn("px-3 py-2 text-right font-mono tabular-nums font-semibold", pnlColor(m.noHoldersPnlPct))}>
                  {m.noHoldersPnlPct >= 0 ? "+" : ""}
                  {m.noHoldersPnlPct}%
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">
                  <span className="flex items-center justify-end gap-0.5">
                    <BarChart3 className="h-3 w-3" />
                    {formatVolume(m.volume)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        P&L percentages reflect returns for holders at final pre-resolution prices. Data is simulated for educational purposes.
      </p>
    </div>
  );
}
