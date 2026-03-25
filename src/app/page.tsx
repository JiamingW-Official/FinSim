"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BarChart3,
  GraduationCap,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Activity,
  ArrowRight,
  ChevronRight,
  Sparkles,
  BookOpen,
  Trophy,
  Gamepad2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const FEATURES = [
  {
    icon: BarChart3,
    title: "Real Market Data",
    desc: "Trade with actual historical stock data from 10 major tickers. Experience real market conditions risk-free.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Brain,
    title: "AI Trading Coach",
    desc: "Get real-time analysis from AlphaBot — 50+ signals, candlestick patterns, regime detection, and trade plans.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: GraduationCap,
    title: "Learn by Doing",
    desc: "30+ interactive lessons with quizzes, mini-simulators, and flashcards. Master concepts through practice.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Activity,
    title: "15 Technical Indicators",
    desc: "SMA, EMA, RSI, MACD, Bollinger, VWAP, ADX, OBV, CCI, and more — each with educational tooltips.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Shield,
    title: "Options Trading Suite",
    desc: "Full options chain, Greeks, vol smile, strategy builder, payoff diagrams — professional-grade tools.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Target,
    title: "Prediction Markets",
    desc: "Bet on real market outcomes — Fed decisions, earnings, macro trends. Learn probability thinking and calibration.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

const STATS = [
  { value: "35+", label: "Prediction Markets" },
  { value: "50+", label: "Interactive Lessons" },
  { value: "15", label: "Technical Indicators" },
  { value: "$100K", label: "Virtual Capital" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background — single subtle gradient, no grid */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,rgba(16,185,129,0.04),transparent_70%)]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
            <span className="text-sm font-black text-primary">FS</span>
          </div>
          <span className="text-sm font-black tracking-tight">FinSim</span>
        </div>
        <Link
          href="/home"
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Launch App
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card/50 px-3 py-1"
          >
            <span className="text-[11px] font-medium text-muted-foreground">
              Risk-free trading education
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            Your{" "}
            <span className="text-primary">
              Trading Flight Simulator
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Practice trading with real market data. Learn financial concepts through
            interactive lessons. Build intuition with prediction markets. No real money at risk.
          </motion.p>

          <motion.div
            className="mt-8 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Link
              href="/home"
              className="group flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Trading
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/learn"
              className="flex items-center gap-2 rounded-md border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent/50"
            >
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              Learn First
            </Link>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          className="mt-16 grid grid-cols-4 gap-4 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-primary">{s.value}</div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Mock UI preview */}
        <motion.div
          className="relative mt-16 mx-auto max-w-4xl rounded-lg border border-border/50 bg-card/30 p-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="rounded-lg border border-border/30 bg-background overflow-hidden">
            {/* Fake top bar */}
            <div className="flex items-center gap-2 border-b border-border/30 px-4 py-2 bg-card/50">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/50" />
              </div>
              <div className="ml-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                <span className="font-bold text-primary">FS</span>
                <span>AAPL Apple Inc.</span>
                <span className="text-emerald-400">$187.44</span>
              </div>
            </div>
            {/* Fake chart area */}
            <div className="relative h-64 p-4">
              <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 40, 80, 120, 160, 200].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                ))}
                {/* Candlesticks - simplified representation */}
                {Array.from({ length: 40 }, (_, i) => {
                  const x = 20 + i * 19.5;
                  const seed = (i * 7 + 13) % 17;
                  const base = 100 + Math.sin(i * 0.15) * 30 + (seed > 8 ? 10 : -10);
                  const open = base + (seed % 5) * 2;
                  const close = base + ((seed + 3) % 7) * 2 - 4;
                  const high = Math.max(open, close) + (seed % 4) * 3;
                  const low = Math.min(open, close) - (seed % 3) * 3;
                  const isGreen = close < open; // inverted Y
                  return (
                    <g key={i}>
                      <line
                        x1={x} y1={high} x2={x} y2={low}
                        stroke={isGreen ? "#10b981" : "#ef4444"}
                        strokeWidth="1"
                        opacity="0.6"
                      />
                      <rect
                        x={x - 4} y={Math.min(open, close)} width="8" height={Math.max(Math.abs(close - open), 1)}
                        fill={isGreen ? "#10b981" : "#ef4444"}
                        opacity="0.8"
                        rx="0.5"
                      />
                    </g>
                  );
                })}
                {/* Moving average line */}
                <path
                  d={`M ${Array.from({ length: 40 }, (_, i) => {
                    const x = 20 + i * 19.5;
                    const y = 100 + Math.sin(i * 0.15) * 30;
                    return `${x},${y}`;
                  }).join(" L ")}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  opacity="0.5"
                />
              </svg>
              {/* Overlay gradient */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
              {/* AlphaBot badge */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg border border-primary/20 bg-card/80 backdrop-blur-sm px-2.5 py-1.5">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-bold text-primary">AlphaBot: Bullish +72</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-2xl sm:text-3xl font-black">
            Everything you need to{" "}
            <span className="text-primary">learn finance</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            Professional-grade tools wrapped in a gamified experience that makes
            financial literacy engaging and fun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="group rounded-lg border border-border/50 bg-card/30 p-5 transition-colors hover:bg-card/50"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${f.bg} mb-3`}>
                <f.icon className={`h-4.5 w-4.5 ${f.color}`} />
              </div>
              <h3 className="text-sm font-bold mb-1">{f.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-2xl sm:text-3xl font-black">
            How <span className="text-primary">FinSim</span> works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: BookOpen,
              title: "Learn the Basics",
              desc: "Interactive lessons teach you financial concepts — from candlestick patterns to risk management.",
            },
            {
              step: "02",
              icon: TrendingUp,
              title: "Practice Trading",
              desc: "Use $100K in virtual money to trade real stocks. Our AI coach gives you real-time feedback.",
            },
            {
              step: "03",
              icon: Trophy,
              title: "Level Up",
              desc: "Earn XP, unlock achievements, climb leaderboards, and build the confidence to invest for real.",
            },
          ].map((s, i) => (
            <motion.div
              key={s.step}
              className="relative text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className="text-[10px] font-bold text-primary/50 mb-2">
                STEP {s.step}
              </div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-bold mb-1">{s.title}</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <motion.div
          className="rounded-lg border border-border bg-card p-10 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
            Start building financial literacy
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Practice with real market data. No real money required.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-black text-primary">FS</span>
            <span>FinSim — Trading Flight Simulator</span>
          </div>
          <div>Built for financial literacy education</div>
        </div>
      </footer>
    </div>
  );
}
