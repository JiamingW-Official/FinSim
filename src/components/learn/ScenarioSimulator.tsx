"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Play,
  RotateCcw,
  ChevronRight,
  Zap,
  DollarSign,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface ScenarioEvent {
  day: number;
  label: string;
  description: string;
  marketChange: number; // percent change
}

interface Scenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  startingPortfolio: number;
  durationDays: number;
  events: ScenarioEvent[];
  lesson: string;
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "2008-crisis",
    name: "2008 Financial Crisis",
    icon: "🏦",
    description: "Experience the worst financial crisis since the Great Depression. Banks fail, markets crash 57%.",
    startingPortfolio: 100000,
    durationDays: 365,
    events: [
      { day: 1, label: "Bear Stearns collapses", description: "First major bank fails. Markets drop as panic begins.", marketChange: -5 },
      { day: 60, label: "Fannie Mae & Freddie Mac seized", description: "Government takes over mortgage giants.", marketChange: -8 },
      { day: 90, label: "Lehman Brothers bankruptcy", description: "The 4th largest investment bank files for bankruptcy. Global panic.", marketChange: -15 },
      { day: 120, label: "AIG bailout", description: "Government injects $85 billion to prevent AIG collapse.", marketChange: -10 },
      { day: 150, label: "TARP bailout passed", description: "Congress approves $700 billion bank rescue. Markets briefly rally.", marketChange: 8 },
      { day: 200, label: "Auto industry crisis", description: "GM and Chrysler face bankruptcy. More layoffs.", marketChange: -7 },
      { day: 250, label: "Market bottom (March 2009)", description: "S&P 500 hits 666. Peak fear. Best time to buy.", marketChange: -5 },
      { day: 300, label: "Recovery begins", description: "Markets start climbing. Those who stayed invested begin recovering.", marketChange: 12 },
      { day: 365, label: "Recovery continues", description: "Markets up 40% from bottom. Patient investors rewarded.", marketChange: 15 },
    ],
    lesson: "The S&P 500 dropped 57% but recovered fully within 4 years. Investors who panic-sold locked in losses. Those who held — or better, kept investing — made extraordinary returns. Time in the market beats timing the market.",
    color: "text-red-400",
  },
  {
    id: "covid-crash",
    name: "COVID-19 Crash & Recovery",
    icon: "🦠",
    description: "The fastest 30% crash in history, followed by the fastest recovery. 33 days down, 5 months to recover.",
    startingPortfolio: 100000,
    durationDays: 180,
    events: [
      { day: 1, label: "COVID hits the US", description: "First cases reported. Markets begin to wobble.", marketChange: -3 },
      { day: 10, label: "WHO declares pandemic", description: "Global lockdowns begin. Travel stocks collapse.", marketChange: -12 },
      { day: 20, label: "Circuit breakers triggered", description: "Markets drop so fast that trading is halted 4 times in 2 weeks.", marketChange: -10 },
      { day: 33, label: "Market bottom", description: "S&P 500 down 34% from peak. Maximum fear. VIX hits 82.", marketChange: -8 },
      { day: 45, label: "Fed goes all-in", description: "Unlimited QE, rate cuts to 0%, stimulus checks. Markets start recovering.", marketChange: 10 },
      { day: 90, label: "Tech leads recovery", description: "Stay-at-home stocks (AMZN, ZOOM, NFLX) surge. Nasdaq hits new highs.", marketChange: 15 },
      { day: 120, label: "Vaccine hopes", description: "Pfizer announces promising Phase 3 results. Markets rally hard.", marketChange: 8 },
      { day: 180, label: "Full recovery", description: "S&P 500 surpasses pre-COVID highs. Complete recovery in ~5 months.", marketChange: 10 },
    ],
    lesson: "The COVID crash was terrifying — 34% in 33 days. But the recovery was just as dramatic: 5 months to new highs. Those who panic-sold in March missed one of the greatest rallies in history. This proves that staying invested through volatility is crucial.",
    color: "text-amber-400",
  },
  {
    id: "dot-com",
    name: "Dot-Com Bubble Burst",
    icon: "💻",
    description: "Tech stocks crash 78% as the internet bubble pops. NASDAQ takes 15 years to recover.",
    startingPortfolio: 100000,
    durationDays: 365,
    events: [
      { day: 1, label: "Peak euphoria", description: "Everyone is buying tech stocks. Pets.com is worth billions. Your neighbor quit his job to day trade.", marketChange: 5 },
      { day: 30, label: "First cracks appear", description: "Some dot-coms start missing earnings. Skepticism grows.", marketChange: -8 },
      { day: 90, label: "Sell-off accelerates", description: "NASDAQ falls 25% from peak. Growth stocks hammered.", marketChange: -15 },
      { day: 150, label: "Dot-com bankruptcies", description: "Pets.com, Webvan, eToys shut down. Billions in value evaporated.", marketChange: -12 },
      { day: 210, label: "9/11 attacks", description: "Markets closed for a week. Further decline on reopening.", marketChange: -10 },
      { day: 280, label: "Enron/WorldCom scandals", description: "Corporate fraud erodes remaining trust in markets.", marketChange: -8 },
      { day: 365, label: "Bear market continues", description: "NASDAQ down 78% from peak. Tech stocks decimated.", marketChange: -5 },
    ],
    lesson: "Concentration risk is deadly. Investors who put everything in tech lost 78%. But the S&P 500 (diversified) only dropped 49%, and a balanced portfolio with bonds fell just 15-20%. Diversification is your best defense against bubbles. Also: profitable companies with real revenue survived and thrived.",
    color: "text-primary",
  },
];

function simulatePortfolio(scenario: Scenario, dayProgress: number): { day: number; value: number }[] {
  const points: { day: number; value: number }[] = [{ day: 0, value: scenario.startingPortfolio }];
  let currentValue = scenario.startingPortfolio;
  const maxDay = Math.min(dayProgress, scenario.durationDays);

  for (const event of scenario.events) {
    if (event.day > maxDay) break;
    // Interpolate between events with some noise
    const prevDay = points[points.length - 1].day;
    const steps = Math.max(1, Math.floor((event.day - prevDay) / 5));
    const changePerStep = event.marketChange / steps;

    for (let i = 1; i <= steps; i++) {
      const d = prevDay + Math.floor(((event.day - prevDay) * i) / steps);
      if (d > maxDay) break;
      const noise = (Math.sin(d * 0.3) * 0.3 + Math.cos(d * 0.7) * 0.2);
      currentValue = currentValue * (1 + (changePerStep + noise) / 100);
      points.push({ day: d, value: currentValue });
    }
  }

  return points;
}

export function ScenarioSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [dayProgress, setDayProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLesson, setShowLesson] = useState(false);

  const portfolioData = useMemo(() => {
    if (!selectedScenario) return [];
    return simulatePortfolio(selectedScenario, dayProgress);
  }, [selectedScenario, dayProgress]);

  const currentValue = portfolioData.length > 0 ? portfolioData[portfolioData.length - 1].value : 100000;
  const pnl = selectedScenario ? currentValue - selectedScenario.startingPortfolio : 0;
  const pnlPct = selectedScenario ? (pnl / selectedScenario.startingPortfolio) * 100 : 0;

  // Current event
  const currentEvent = useMemo(() => {
    if (!selectedScenario) return null;
    const pastEvents = selectedScenario.events.filter((e) => e.day <= dayProgress);
    return pastEvents.length > 0 ? pastEvents[pastEvents.length - 1] : null;
  }, [selectedScenario, dayProgress]);

  // Auto-play
  const handlePlay = () => {
    if (!selectedScenario) return;
    setIsPlaying(true);
    setShowLesson(false);
    let current = dayProgress;
    const interval = setInterval(() => {
      current += 3;
      if (current >= selectedScenario.durationDays) {
        current = selectedScenario.durationDays;
        clearInterval(interval);
        setIsPlaying(false);
        setShowLesson(true);
      }
      setDayProgress(current);
    }, 50);
  };

  const handleReset = () => {
    setDayProgress(0);
    setIsPlaying(false);
    setShowLesson(false);
  };

  const handleSelectScenario = (s: Scenario) => {
    setSelectedScenario(s);
    setDayProgress(0);
    setIsPlaying(false);
    setShowLesson(false);
  };

  // SVG chart
  const chartWidth = 600;
  const chartHeight = 180;
  const pathD = useMemo(() => {
    if (portfolioData.length < 2) return "";
    const maxDay = selectedScenario?.durationDays ?? 365;
    const values = portfolioData.map((p) => p.value);
    const minVal = Math.min(...values) * 0.95;
    const maxVal = Math.max(...values) * 1.05;
    const range = maxVal - minVal || 1;

    return portfolioData
      .map((p, i) => {
        const x = (p.day / maxDay) * chartWidth;
        const y = chartHeight - ((p.value - minVal) / range) * chartHeight;
        return `${i === 0 ? "M" : "L"} ${x},${y}`;
      })
      .join(" ");
  }, [portfolioData, selectedScenario]);

  if (!selectedScenario) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold">Historical Scenario Simulator</h3>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Experience famous market events. See how your portfolio would react and learn why staying invested matters.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {SCENARIOS.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => handleSelectScenario(s)}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4 text-left transition-all hover:border-primary/30 hover:bg-card"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="text-2xl">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{s.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{s.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{selectedScenario.icon}</span>
          <h3 className="text-sm font-bold">{selectedScenario.name}</h3>
        </div>
        <button
          onClick={() => setSelectedScenario(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Change Scenario
        </button>
      </div>

      {/* Portfolio value */}
      <div className="flex items-center gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Portfolio Value</div>
          <div className="text-lg font-bold tabular-nums">{formatCurrency(currentValue)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">P&L</div>
          <div className={cn("text-sm font-bold tabular-nums", pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
            {pnl >= 0 ? "+" : ""}{formatCurrency(pnl)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
          </div>
        </div>
        <div className="text-xs text-muted-foreground ml-auto tabular-nums">
          Day {dayProgress} / {selectedScenario.durationDays}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border/50 bg-card/30 p-3">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-32" preserveAspectRatio="none">
          {/* Grid */}
          {[0, 45, 90, 135, 180].map((y) => (
            <line key={y} x1="0" y1={y} x2={chartWidth} y2={y} stroke="rgba(255,255,255,0.03)" />
          ))}
          {/* Zero line (starting value) */}
          <line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="rgba(255,255,255,0.06)" strokeDasharray="4" />
          {/* Portfolio line */}
          {pathD && (
            <path d={pathD} fill="none" stroke={pnl >= 0 ? "#10b981" : "#ef4444"} strokeWidth="2" />
          )}
          {/* Event markers */}
          {selectedScenario.events
            .filter((e) => e.day <= dayProgress)
            .map((e) => {
              const x = (e.day / selectedScenario.durationDays) * chartWidth;
              return (
                <circle
                  key={e.day}
                  cx={x}
                  cy={chartHeight / 2}
                  r="3"
                  fill={e.marketChange >= 0 ? "#10b981" : "#ef4444"}
                  opacity="0.5"
                />
              );
            })}
        </svg>
      </div>

      {/* Current event */}
      <AnimatePresence mode="wait">
        {currentEvent && (
          <motion.div
            key={currentEvent.day}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border border-border/50 bg-card/50 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              {currentEvent.marketChange >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className="text-[11px] font-bold">{currentEvent.label}</span>
              <span className={cn(
                "text-xs font-bold tabular-nums",
                currentEvent.marketChange >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {currentEvent.marketChange >= 0 ? "+" : ""}{currentEvent.marketChange}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{currentEvent.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          disabled={isPlaying || dayProgress >= selectedScenario.durationDays}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-3 w-3" />
          {dayProgress === 0 ? "Start Simulation" : "Continue"}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] font-bold transition-all hover:bg-card"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
        {/* Slider */}
        <input
          type="range"
          min={0}
          max={selectedScenario.durationDays}
          value={dayProgress}
          onChange={(e) => {
            setDayProgress(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="flex-1 h-1 accent-primary"
        />
      </div>

      {/* Lesson reveal */}
      <AnimatePresence>
        {showLesson && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary">Key Lesson</span>
              </div>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                {selectedScenario.lesson}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
