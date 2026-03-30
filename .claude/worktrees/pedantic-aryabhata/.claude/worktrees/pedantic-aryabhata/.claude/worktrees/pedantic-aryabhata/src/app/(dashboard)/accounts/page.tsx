"use client";

import { useState, useMemo } from "react";
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RotateCcw,
  Download,
  Settings2,
  Trophy,
  Target,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Mulberry32 seeded PRNG ────────────────────────────────────────────────────

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type AccountType =
  | "taxable"
  | "roth_ira"
  | "traditional_ira"
  | "paper";

type MarginType = "reg_t" | "portfolio" | "cash" | "none";

interface AccountPosition {
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  assetClass: "growth" | "dividend" | "bond" | "etf" | "crypto";
}

interface AccountSettings {
  commissionRate: number; // $ per trade, 0 = free
  optionCommission: number; // $ per contract
  marginType: MarginType;
  maxPositionSizePct: number; // % of account
  maxDailyLoss: number; // $
  annualReturnGoal: number; // %
  autoResetDaily: boolean;
}

interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  startingBalance: number;
  dayPnl: number;
  totalPnl: number;
  totalPnlPct: number;
  buyingPower: number;
  positions: AccountPosition[];
  settings: AccountSettings;
  taxEfficiency: number; // 0-100
}

interface Transfer {
  id: string;
  date: string;
  fromId: string;
  toId: string;
  amount: number;
  note: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  AccountType,
  { label: string; color: string; bg: string; description: string }
> = {
  taxable: {
    label: "Taxable Brokerage",
    color: "text-primary",
    bg: "bg-primary/10 text-primary",
    description: "Standard margin account, capital gains taxed",
  },
  roth_ira: {
    label: "Roth IRA",
    color: "text-emerald-400",
    bg: "bg-emerald-500/5 text-emerald-400",
    description: "Tax-free growth, qualified withdrawals tax-free",
  },
  traditional_ira: {
    label: "Traditional IRA",
    color: "text-amber-400",
    bg: "bg-amber-500/10 text-amber-400",
    description: "Tax-deferred growth, taxed on withdrawal",
  },
  paper: {
    label: "Paper Trading",
    color: "text-primary",
    bg: "bg-primary/10 text-primary",
    description: "Simulated account, no real money, reset anytime",
  },
};

const TICKERS = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JNJ", "VTI", "BTC"];
const ASSET_CLASSES: AccountPosition["assetClass"][] = [
  "growth", "growth", "growth", "growth", "growth", "growth", "growth", "dividend", "etf", "crypto"
];
const ASSET_LOCATION_ADVICE: Record<AccountPosition["assetClass"], AccountType> = {
  growth: "roth_ira",
  dividend: "traditional_ira",
  bond: "traditional_ira",
  etf: "taxable",
  crypto: "taxable",
};

// ── Synthetic data generation ─────────────────────────────────────────────────

function generatePositions(
  rng: () => number,
  count: number,
  basePrice: number
): AccountPosition[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = Math.floor(rng() * TICKERS.length);
    const avgCost = basePrice * (0.5 + rng() * 1.5);
    const drift = rng() * 0.4 - 0.1;
    return {
      ticker: TICKERS[idx],
      shares: Math.floor(rng() * 50 + 5),
      avgCost,
      currentPrice: avgCost * (1 + drift),
      assetClass: ASSET_CLASSES[idx],
    };
  });
}

function buildDefaultAccounts(): Account[] {
  const rng = mulberry32(3030);

  const defaults: Array<{
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    marginType: MarginType;
    taxEfficiency: number;
    posCount: number;
  }> = [
    {
      id: "acc_main",
      name: "Main Brokerage",
      type: "taxable",
      balance: 50000,
      marginType: "reg_t",
      taxEfficiency: 52,
      posCount: 5,
    },
    {
      id: "acc_roth",
      name: "Roth IRA",
      type: "roth_ira",
      balance: 25000,
      marginType: "cash",
      taxEfficiency: 100,
      posCount: 3,
    },
    {
      id: "acc_trad",
      name: "Traditional IRA",
      type: "traditional_ira",
      balance: 35000,
      marginType: "cash",
      taxEfficiency: 75,
      posCount: 4,
    },
    {
      id: "acc_paper",
      name: "Paper Trading",
      type: "paper",
      balance: 100000,
      marginType: "none",
      taxEfficiency: 0,
      posCount: 6,
    },
  ];

  return defaults.map((d) => {
    const positions = generatePositions(rng, d.posCount, d.balance / 10);
    const positionValue = positions.reduce(
      (sum, p) => sum + p.shares * p.currentPrice,
      0
    );
    const startingBalance = d.balance * (0.85 + rng() * 0.2);
    const totalPnl = d.balance + positionValue - d.balance - startingBalance + startingBalance * (rng() * 0.3 - 0.05);
    const dayPnl = d.balance * (rng() * 0.04 - 0.015);

    return {
      id: d.id,
      name: d.name,
      type: d.type,
      balance: d.balance,
      startingBalance,
      dayPnl,
      totalPnl,
      totalPnlPct: (totalPnl / startingBalance) * 100,
      buyingPower: d.type === "paper" ? 999999 : d.balance * (d.marginType === "reg_t" ? 2 : 1),
      positions,
      taxEfficiency: d.taxEfficiency,
      settings: {
        commissionRate: d.type === "paper" ? 0 : 0,
        optionCommission: d.type === "paper" ? 0 : 0.65,
        marginType: d.marginType,
        maxPositionSizePct: 20,
        maxDailyLoss: d.balance * 0.03,
        annualReturnGoal: 15,
        autoResetDaily: false,
      },
    };
  });
}

function buildTransferHistory(accounts: Account[]): Transfer[] {
  const rng = mulberry32(4040);
  const dates = [
    "2026-03-20", "2026-03-15", "2026-03-10", "2026-03-05",
    "2026-02-28", "2026-02-20", "2026-02-14", "2026-02-07",
    "2026-01-31", "2026-01-15",
  ];
  return dates.map((date, i) => {
    const fromIdx = Math.floor(rng() * accounts.length);
    let toIdx = Math.floor(rng() * accounts.length);
    if (toIdx === fromIdx) toIdx = (toIdx + 1) % accounts.length;
    const amount = Math.round((rng() * 4500 + 500) * 100) / 100;
    return {
      id: `txn_${i}`,
      date,
      fromId: accounts[fromIdx].id,
      toId: accounts[toIdx].id,
      amount,
      note: i % 3 === 0 ? "Rebalancing" : i % 3 === 1 ? "Contribution" : "Withdrawal",
    };
  });
}

// ── Formatters ────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
}

function fmtPct(n: number, decimals = 2): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

function pnlColor(n: number): string {
  return n >= 0 ? "text-emerald-400" : "text-red-400";
}

function pnlBg(n: number): string {
  return n >= 0 ? "bg-emerald-500/5 text-emerald-400" : "bg-red-500/5 text-red-400";
}

// ── Pure SVG Charts ───────────────────────────────────────────────────────────

function BarChart({
  accounts,
}: {
  accounts: Account[];
}) {
  const maxVal = Math.max(...accounts.map((a) => a.balance));
  const W = 480;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 32, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW = (chartW / accounts.length) * 0.55;
  const gap = chartW / accounts.length;

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7"];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ maxHeight: 180 }}
    >
      {/* Y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + chartH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={PAD.left + chartW}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              fill="rgba(255,255,255,0.35)"
              fontSize={9}
              textAnchor="end"
            >
              {fmtCompact(maxVal * t)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {accounts.map((acc, i) => {
        const x = PAD.left + gap * i + (gap - barW) / 2;
        const barH = chartH * (acc.balance / maxVal);
        const y = PAD.top + chartH - barH;
        return (
          <g key={acc.id}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill={colors[i % colors.length]}
              opacity={0.85}
              rx={3}
            />
            <text
              x={x + barW / 2}
              y={H - 8}
              fill="rgba(255,255,255,0.5)"
              fontSize={9}
              textAnchor="middle"
            >
              {acc.name.split(" ")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({
  positions,
  size = 80,
}: {
  positions: AccountPosition[];
  size?: number;
}) {
  const CLASS_COLORS: Record<AccountPosition["assetClass"], string> = {
    growth: "#3b82f6",
    dividend: "#10b981",
    bond: "#f59e0b",
    etf: "#6366f1",
    crypto: "#ec4899",
  };

  const totals: Record<string, number> = {};
  positions.forEach((p) => {
    const v = p.shares * p.currentPrice;
    totals[p.assetClass] = (totals[p.assetClass] || 0) + v;
  });
  const entries = Object.entries(totals);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const ir = r * 0.6;

  let angle = -Math.PI / 2;
  const slices = entries.map(([cls, val]) => {
    const frac = val / total;
    const sweep = frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const ix1 = cx + ir * Math.cos(angle);
    const iy1 = cy + ir * Math.sin(angle);
    const ix2 = cx + ir * Math.cos(angle - sweep);
    const iy2 = cy + ir * Math.sin(angle - sweep);
    const large = sweep > Math.PI ? 1 : 0;
    return {
      cls,
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`,
      color: CLASS_COLORS[cls as AccountPosition["assetClass"]] || "#888",
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s) => (
        <path key={s.cls} d={s.d} fill={s.color} opacity={0.85} />
      ))}
      <circle cx={cx} cy={cy} r={ir - 1} fill="rgba(0,0,0,0.4)" />
    </svg>
  );
}

// ── Account Card ──────────────────────────────────────────────────────────────

function AccountCard({ account }: { account: Account }) {
  const meta = TYPE_META[account.type];
  const bpFraction =
    account.type === "paper"
      ? 1
      : Math.min(account.buyingPower / (account.balance * 2), 1);

  return (
    <Card className="p-5 bg-card/60 border-border space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground">
              {account.name}
            </span>
            <Badge className={cn("text-xs text-muted-foreground py-0 px-1.5", meta.bg)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">{meta.description}</p>
        </div>
        <Wallet className={cn("h-5 w-5 shrink-0 mt-0.5", meta.color)} />
      </div>

      {/* Balance */}
      <div>
        <p className="text-xs text-muted-foreground mb-0.5">
          Balance
        </p>
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {fmtCompact(account.balance)}
        </p>
      </div>

      {/* P&L row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Day P&L</p>
          <p className={cn("text-sm font-semibold tabular-nums", pnlColor(account.dayPnl))}>
            {account.dayPnl >= 0 ? "+" : ""}{fmt(account.dayPnl)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Total P&L</p>
          <p className={cn("text-sm font-semibold tabular-nums", pnlColor(account.totalPnl))}>
            {fmtPct(account.totalPnlPct)}
          </p>
        </div>
      </div>

      {/* Buying power bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <p className="text-xs text-muted-foreground">Buying Power</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {account.type === "paper" ? "Unlimited" : fmtCompact(account.buyingPower)}
          </p>
        </div>
        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${bpFraction * 100}%` }}
          />
        </div>
      </div>

      {/* Tax efficiency */}
      {account.type !== "paper" && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-muted-foreground">Tax Efficiency</p>
            <p className="text-xs text-muted-foreground">{account.taxEfficiency}%</p>
          </div>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                account.taxEfficiency >= 80
                  ? "bg-emerald-500"
                  : account.taxEfficiency >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
              style={{ width: `${account.taxEfficiency}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Add Account Modal ─────────────────────────────────────────────────────────

function AddAccountModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (account: Account) => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("taxable");
  const [balance, setBalance] = useState("10000");

  function handleSubmit() {
    if (!name.trim()) return;
    const bal = parseFloat(balance) || 10000;
    const rng = mulberry32(Date.now() & 0xffffffff);
    const newAcc: Account = {
      id: `acc_${Date.now()}`,
      name: name.trim(),
      type,
      balance: bal,
      startingBalance: bal,
      dayPnl: 0,
      totalPnl: 0,
      totalPnlPct: 0,
      buyingPower: type === "paper" ? 999999 : bal,
      positions: [],
      taxEfficiency:
        type === "roth_ira" ? 100 : type === "traditional_ira" ? 75 : type === "paper" ? 0 : 55,
      settings: {
        commissionRate: 0,
        optionCommission: 0.65,
        marginType: type === "taxable" ? "reg_t" : "cash",
        maxPositionSizePct: 20,
        maxDailyLoss: bal * 0.03,
        annualReturnGoal: 15,
        autoResetDaily: false,
      },
    };
    onAdd(newAcc);
    setName("");
    setType("taxable");
    setBalance("10000");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Account Name
            </label>
            <input
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="e.g. My Roth IRA"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TYPE_META) as AccountType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-xs text-muted-foreground font-medium transition-colors text-left",
                    type === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-border"
                  )}
                >
                  {TYPE_META[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Starting Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <input
                className="w-full rounded-md border border-border bg-background pl-7 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                type="number"
                min={0}
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!name.trim()}>
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────

function AccountSettingsRow({
  account,
  onUpdate,
  onReset,
}: {
  account: Account;
  onUpdate: (id: string, settings: AccountSettings) => void;
  onReset: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const s = account.settings;

  function update(patch: Partial<AccountSettings>) {
    onUpdate(account.id, { ...s, ...patch });
  }

  return (
    <Card className="bg-card/60 border-border">
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <Wallet className={cn("h-3.5 w-3.5", TYPE_META[account.type].color)} />
          <div>
            <p className="text-xs font-medium text-foreground">{account.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {TYPE_META[account.type].label} &middot; {fmt(account.balance)}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
          {/* Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">
                Commission / Trade
              </label>
              <div className="flex gap-1">
                {[0, 4.95, 6.95].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => update({ commissionRate: rate })}
                    className={cn(
                      "flex-1 rounded text-[11px] py-1 font-medium border transition-colors",
                      s.commissionRate === rate
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-border"
                    )}
                  >
                    {rate === 0 ? "Free" : `$${rate}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">
                Options / Contract
              </label>
              <div className="flex gap-1">
                {[0, 0.65, 1].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => update({ optionCommission: rate })}
                    className={cn(
                      "flex-1 rounded text-[11px] py-1 font-medium border transition-colors",
                      s.optionCommission === rate
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-border"
                    )}
                  >
                    {rate === 0 ? "Free" : `$${rate}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Margin type */}
          <div>
            <label className="text-[11px] text-muted-foreground mb-1 block">
              Margin Type
            </label>
            <div className="flex gap-1">
              {(["reg_t", "portfolio", "cash", "none"] as MarginType[]).map((mt) => (
                <button
                  key={mt}
                  onClick={() => update({ marginType: mt })}
                  disabled={account.type === "roth_ira" || account.type === "traditional_ira" || account.type === "paper"}
                  className={cn(
                    "flex-1 rounded text-[11px] py-1 font-medium border transition-colors",
                    s.marginType === mt
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-border",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  {mt === "reg_t" ? "Reg-T" : mt === "portfolio" ? "Port." : mt.charAt(0).toUpperCase() + mt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Risk limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">
                Max Position Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={s.maxPositionSizePct}
                  onChange={(e) =>
                    update({ maxPositionSizePct: parseInt(e.target.value) })
                  }
                  className="flex-1 accent-primary"
                />
                <span className="text-[11px] text-muted-foreground w-8 text-right">
                  {s.maxPositionSizePct}%
                </span>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">
                Max Daily Loss
              </label>
              <input
                className="w-full rounded border border-border bg-background px-2 py-1 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                type="number"
                value={s.maxDailyLoss}
                onChange={(e) =>
                  update({ maxDailyLoss: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Annual return goal */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[11px] text-muted-foreground">
                Annual Return Goal
              </label>
              <span className="text-[11px] text-muted-foreground">{s.annualReturnGoal}%</span>
            </div>
            <div className="relative h-1.5 bg-muted/40 rounded-full">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  width: `${Math.min((account.totalPnlPct / s.annualReturnGoal) * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-0.5">
              <span className="text-xs text-muted-foreground">
                {fmtPct(account.totalPnlPct)} actual
              </span>
              <span className="text-xs text-muted-foreground">
                Goal: {s.annualReturnGoal}%
              </span>
            </div>
          </div>

          {/* Paper trading controls */}
          {account.type === "paper" && (
            <div className="border border-border rounded-md p-3 space-y-2">
              <p className="text-[11px] font-medium text-foreground">
                Paper Trading Controls
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Auto-reset daily
                </span>
                <button
                  onClick={() => update({ autoResetDaily: !s.autoResetDaily })}
                  className={cn(
                    "relative h-4 w-7 rounded-full transition-colors",
                    s.autoResetDaily ? "bg-primary" : "bg-muted/60"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                      s.autoResetDaily ? "translate-x-3.5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
              {confirmReset ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1 h-7 text-xs text-muted-foreground"
                    onClick={() => {
                      onReset(account.id);
                      setConfirmReset(false);
                    }}
                  >
                    Confirm Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs text-muted-foreground"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs text-muted-foreground gap-1.5"
                  onClick={() => setConfirmReset(true)}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to $100K
                </Button>
              )}
            </div>
          )}

          {/* Export */}
          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs text-muted-foreground gap-1.5"
            onClick={() => {
              const rows = [
                ["Account", account.name],
                ["Type", TYPE_META[account.type].label],
                ["Balance", account.balance.toString()],
                ["Day P&L", account.dayPnl.toString()],
                ["Total P&L %", account.totalPnlPct.toFixed(2)],
                ["Tax Efficiency", account.taxEfficiency.toString()],
              ];
              const csv = rows.map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${account.name.replace(/\s+/g, "_")}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="h-3 w-3" />
            Export Account CSV
          </Button>
        </div>
      )}
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>(() => buildDefaultAccounts());
  const [transfers, setTransfers] = useState<Transfer[]>(() =>
    buildTransferHistory(buildDefaultAccounts())
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  // ── Aggregate stats ──────────────────────────────────────────────────────
  const aggregate = useMemo(() => {
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const totalDayPnl = accounts.reduce((s, a) => s + a.dayPnl, 0);
    const totalPnl = accounts.reduce((s, a) => s + a.totalPnl, 0);
    const bestReturn = accounts.reduce((best, a) =>
      a.totalPnlPct > best.totalPnlPct ? a : best
    );
    const worstReturn = accounts.reduce((worst, a) =>
      a.totalPnlPct < worst.totalPnlPct ? a : worst
    );
    return { totalBalance, totalDayPnl, totalPnl, bestReturn, worstReturn };
  }, [accounts]);

  // ── Comparison stats (seeded) ────────────────────────────────────────────
  const compStats = useMemo(() => {
    const rng = mulberry32(5050);
    return accounts.map((acc) => ({
      id: acc.id,
      returnPct: acc.totalPnlPct,
      sharpe: parseFloat((rng() * 2.5 + 0.2).toFixed(2)),
      volatility: parseFloat((rng() * 15 + 5).toFixed(2)),
      winRate: parseFloat((rng() * 40 + 40).toFixed(1)),
      numTrades: Math.floor(rng() * 80 + 10),
      maxDrawdown: -parseFloat((rng() * 12 + 2).toFixed(2)),
    }));
  }, [accounts]);

  const bestByReturn = accounts.reduce((b, a) => (a.totalPnlPct > b.totalPnlPct ? a : b));
  const bestByDrawdown = (() => {
    const idx = compStats.reduce(
      (bi, s, i) => (s.maxDrawdown > compStats[bi].maxDrawdown ? i : bi),
      0
    );
    return accounts[idx];
  })();
  const bestBySharpe = (() => {
    const idx = compStats.reduce(
      (bi, s, i) => (s.sharpe > compStats[bi].sharpe ? i : bi),
      0
    );
    return accounts[idx];
  })();

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleAddAccount(acc: Account) {
    setAccounts((prev) => [...prev, acc]);
  }

  function handleUpdateSettings(id: string, settings: AccountSettings) {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, settings } : a))
    );
  }

  function handleResetPaper(id: string) {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              balance: 100000,
              startingBalance: 100000,
              dayPnl: 0,
              totalPnl: 0,
              totalPnlPct: 0,
              buyingPower: 999999,
              positions: [],
            }
          : a
      )
    );
  }

  function handleTransfer() {
    const amt = parseFloat(transferAmount);
    if (!transferFrom || !transferTo || !amt || transferFrom === transferTo) return;
    const from = accounts.find((a) => a.id === transferFrom);
    if (!from || from.balance < amt) return;

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === transferFrom) return { ...a, balance: a.balance - amt };
        if (a.id === transferTo) return { ...a, balance: a.balance + amt };
        return a;
      })
    );

    const now = new Date().toISOString().split("T")[0];
    setTransfers((prev) => [
      {
        id: `txn_${Date.now()}`,
        date: now,
        fromId: transferFrom,
        toId: transferTo,
        amount: amt,
        note: "Manual transfer",
      },
      ...prev.slice(0, 9),
    ]);
    setTransferAmount("");
  }

  // ── Optimal allocation suggestions ──────────────────────────────────────
  const allPositions = useMemo(
    () => accounts.flatMap((a) => a.positions.map((p) => ({ ...p, accountId: a.id, accountName: a.name }))),
    [accounts]
  );

  const suggestions = useMemo(() => {
    return allPositions.map((p) => {
      const idealType = ASSET_LOCATION_ADVICE[p.assetClass];
      const currentAcc = accounts.find((a) => a.id === p.accountId)!;
      const isOptimal = currentAcc.type === idealType;
      const idealAcc = accounts.find((a) => a.type === idealType);
      return { ...p, idealType, isOptimal, idealAccName: idealAcc?.name ?? idealType };
    });
  }, [allPositions, accounts]);

  const taxSavings = useMemo(() => {
    const suboptimal = suggestions.filter((s) => !s.isOptimal).length;
    return suboptimal * 847; // synthetic per-position savings
  }, [suggestions]);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground/50" />
              Accounts
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage multiple trading accounts, compare performance, and optimize tax allocation
            </p>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Account
          </Button>
        </div>
      </div>

      {/* HERO — Aggregate Portfolio */}
      <div className="shrink-0 mx-6 mt-4 rounded-md border border-border bg-card border-l-4 border-l-primary p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Portfolio</p>
            <p className="text-lg font-medium tabular-nums text-foreground">
              {fmtCompact(aggregate.totalBalance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Day P&L</p>
            <p className={cn("text-lg font-medium tabular-nums", pnlColor(aggregate.totalDayPnl))}>
              {aggregate.totalDayPnl >= 0 ? "+" : ""}{fmt(aggregate.totalDayPnl)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Best Account</p>
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-foreground">
                {aggregate.bestReturn.name}
              </span>
              <Badge className={cn("text-xs text-muted-foreground py-0 px-1", pnlBg(aggregate.bestReturn.totalPnlPct))}>
                {fmtPct(aggregate.bestReturn.totalPnlPct)}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Worst Account</p>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-foreground">
                {aggregate.worstReturn.name}
              </span>
              <Badge className={cn("text-xs text-muted-foreground py-0 px-1", pnlBg(aggregate.worstReturn.totalPnlPct))}>
                {fmtPct(aggregate.worstReturn.totalPnlPct)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-6 pt-3">
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="text-xs text-muted-foreground px-3">Overview</TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs text-muted-foreground px-3">Comparison</TabsTrigger>
            <TabsTrigger value="transfer" className="text-xs text-muted-foreground px-3">Transfer & Allocation</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs text-muted-foreground px-3">Settings</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Tab 1: Overview ──────────────────────────────────────────────── */}
        <TabsContent value="overview" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} />
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 2: Comparison ────────────────────────────────────────────── */}
        <TabsContent value="comparison" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
          <div className="space-y-4">
            {/* Bar chart */}
            <Card className="p-5 bg-card/60 border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">Account Values</h3>
              <BarChart accounts={accounts} />
            </Card>

            {/* Best-by badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Highest Return", account: bestByReturn, icon: TrendingUp, color: "text-emerald-400" },
                { label: "Lowest Drawdown", account: bestByDrawdown, icon: CheckCircle2, color: "text-primary" },
                { label: "Best Sharpe", account: bestBySharpe, icon: Target, color: "text-amber-400" },
              ].map(({ label, account, icon: Icon, color }) => (
                <Card key={label} className="p-4 bg-card/60 border-border flex items-center gap-3">
                  <Icon className={cn("h-5 w-5 shrink-0", color)} />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{account.name}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Stats table */}
            <Card className="p-5 bg-card/60 border-border">
              <h3 className="text-sm font-medium text-foreground mb-3">Performance Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Account</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Return %</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Sharpe</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Volatility</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Win Rate</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Trades</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Max DD</th>
                      <th className="text-right py-2 pl-3 text-muted-foreground font-medium">Tax Eff.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map((acc, i) => {
                      const s = compStats[i];
                      return (
                        <tr key={acc.id} className="border-b border-border last:border-0">
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <Wallet className={cn("h-3 w-3", TYPE_META[acc.type].color)} />
                              <span className="font-medium text-foreground">{acc.name}</span>
                            </div>
                          </td>
                          <td className={cn("py-2 px-3 text-right tabular-nums font-medium", pnlColor(s.returnPct))}>
                            {fmtPct(s.returnPct)}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.sharpe}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.volatility}%</td>
                          <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.winRate}%</td>
                          <td className="py-2 px-3 text-right tabular-nums text-foreground">{s.numTrades}</td>
                          <td className={cn("py-2 px-3 text-right tabular-nums font-medium", pnlColor(s.maxDrawdown))}>
                            {s.maxDrawdown.toFixed(1)}%
                          </td>
                          <td className="py-2 pl-3 text-right">
                            <span
                              className={cn(
                                "text-xs text-muted-foreground font-medium px-1.5 py-0.5 rounded",
                                acc.taxEfficiency >= 80
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : acc.taxEfficiency >= 50
                                  ? "bg-amber-500/15 text-amber-400"
                                  : "bg-muted/40 text-muted-foreground"
                              )}
                            >
                              {acc.type === "paper" ? "N/A" : `${acc.taxEfficiency}%`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Asset allocation donuts */}
            <Card className="p-5 bg-card/60 border-border">
              <h3 className="text-sm font-medium text-foreground mb-4">Asset Allocation by Account</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="flex flex-col items-center gap-2">
                    <DonutChart positions={acc.positions} size={80} />
                    <p className="text-[11px] text-muted-foreground text-center">{acc.name}</p>
                    {/* Legend */}
                    <div className="space-y-0.5 w-full">
                      {["growth", "dividend", "etf", "crypto"].map((cls) => {
                        const totalV = acc.positions
                          .filter((p) => p.assetClass === cls)
                          .reduce((s, p) => s + p.shares * p.currentPrice, 0);
                        if (totalV === 0) return null;
                        const totalAll = acc.positions.reduce((s, p) => s + p.shares * p.currentPrice, 0);
                        const COLOR: Record<string, string> = {
                          growth: "bg-primary",
                          dividend: "bg-emerald-400",
                          bond: "bg-amber-400",
                          etf: "bg-indigo-400",
                          crypto: "bg-pink-400",
                        };
                        return (
                          <div key={cls} className="flex items-center gap-1">
                            <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", COLOR[cls])} />
                            <span className="text-xs text-muted-foreground capitalize flex-1">{cls}</span>
                            <span className="text-xs text-muted-foreground">
                              {((totalV / totalAll) * 100).toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 3: Transfer & Allocation ─────────────────────────────────── */}
        <TabsContent value="transfer" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Transfer form */}
            <div className="space-y-4">
              <Card className="p-5 bg-card/60 border-border">
                <h3 className="text-sm font-medium text-foreground mb-4">Transfer Funds</h3>
                <div className="space-y-3">
                  {/* From */}
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">From</label>
                    <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value)}
                    >
                      <option value="">Select source account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({fmtCompact(a.balance)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* To */}
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">To</label>
                    <select
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                    >
                      <option value="">Select destination account</option>
                      {accounts
                        .filter((a) => a.id !== transferFrom)
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({fmtCompact(a.balance)})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        $
                      </span>
                      <input
                        className="w-full rounded-md border border-border bg-background pl-7 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        type="number"
                        min={0}
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                      />
                    </div>
                    {transferFrom && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Available: {fmtCompact(accounts.find((a) => a.id === transferFrom)?.balance ?? 0)}
                      </p>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleTransfer}
                    disabled={
                      !transferFrom ||
                      !transferTo ||
                      !transferAmount ||
                      parseFloat(transferAmount) <= 0
                    }
                  >
                    Transfer Funds
                  </Button>
                </div>
              </Card>

              {/* Transfer history */}
              <Card className="p-5 bg-card/60 border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Transfer History</h3>
                <div className="space-y-2">
                  {transfers.map((t) => {
                    const from = accounts.find((a) => a.id === t.fromId)?.name ?? t.fromId;
                    const to = accounts.find((a) => a.id === t.toId)?.name ?? t.toId;
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-xs text-foreground">
                            {from} <ArrowRight className="h-2.5 w-2.5 inline" /> {to}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.date} &middot; {t.note}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-foreground tabular-nums">
                          {fmt(t.amount)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Allocation advice */}
            <div className="space-y-4">
              {/* Tax savings callout */}
              <Card className="p-5 bg-card/60 border-border">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/5 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Estimated Tax Savings</p>
                    <p className="text-lg font-medium text-emerald-400 tabular-nums">
                      {fmtCompact(taxSavings)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      By moving assets to optimal account types you could save approximately{" "}
                      <span className="text-foreground font-medium">{fmtCompact(taxSavings)}</span>{" "}
                      annually in taxes.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Optimal allocation rules */}
              <Card className="p-5 bg-card/60 border-border space-y-3">
                <h3 className="text-sm font-medium text-foreground">Asset Location Guide</h3>
                {[
                  {
                    asset: "Growth Stocks",
                    target: "Roth IRA",
                    reason: "Tax-free compounding on high-growth assets maximizes wealth",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/5",
                  },
                  {
                    asset: "Dividend Stocks",
                    target: "Traditional IRA",
                    reason: "Defer taxes on dividend income until retirement",
                    color: "text-amber-400",
                    bg: "bg-amber-500/10",
                  },
                  {
                    asset: "Trading Strategies",
                    target: "Taxable",
                    reason: "Harvest tax losses to offset short-term gains",
                    color: "text-primary",
                    bg: "bg-primary/10",
                  },
                  {
                    asset: "ETFs / Index Funds",
                    target: "Taxable",
                    reason: "Low turnover, tax-efficient by nature",
                    color: "text-indigo-400",
                    bg: "bg-indigo-500/10",
                  },
                ].map((rule) => (
                  <div key={rule.asset} className="flex gap-3 items-start">
                    <span className={cn("text-xs text-muted-foreground font-medium px-2 py-1 rounded shrink-0", rule.bg, rule.color)}>
                      {rule.target}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{rule.asset}</p>
                      <p className="text-[11px] text-muted-foreground">{rule.reason}</p>
                    </div>
                  </div>
                ))}
              </Card>

              {/* Position suggestions */}
              <Card className="p-5 bg-card/60 border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Position Suggestions</h3>
                <div className="space-y-2">
                  {suggestions.slice(0, 8).map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {s.isOptimal ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs text-foreground font-medium">{s.ticker}</p>
                          <p className="text-xs text-muted-foreground">
                            in {s.accountName}
                          </p>
                        </div>
                      </div>
                      {!s.isOptimal && (
                        <div className="text-right">
                          <p className="text-xs text-amber-400">Move to</p>
                          <p className="text-xs font-medium text-foreground">{s.idealAccName}</p>
                        </div>
                      )}
                      {s.isOptimal && (
                        <Badge className="text-xs py-0 bg-emerald-500/5 text-emerald-400">Optimal</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab 4: Settings ──────────────────────────────────────────────── */}
        <TabsContent value="settings" className="flex-1 overflow-y-auto px-6 py-4 data-[state=inactive]:hidden">
          <div className="space-y-3 max-w-2xl">
            {accounts.map((acc) => (
              <AccountSettingsRow
                key={acc.id}
                account={acc}
                onUpdate={handleUpdateSettings}
                onReset={handleResetPaper}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Account Modal */}
      <AddAccountModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddAccount}
      />
    </div>
  );
}
