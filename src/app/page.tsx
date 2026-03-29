"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Activity,
  Target,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

const FEATURES = [
  {
    icon: BookOpen,
    title: "Trading Academy",
    desc: "650+ bite-sized lessons across stocks, options, crypto, and macro. Master concepts, then practice them live.",
  },
  {
    icon: Activity,
    title: "Market Simulator",
    desc: "Real chart patterns, 20+ indicators, and simulated execution. Build intuition with zero downside.",
  },
  {
    icon: Target,
    title: "Prediction Markets",
    desc: "Bet on Fed decisions, earnings, and sector trends. Sharpen your probability thinking and calibration.",
  },
];

const STATS = [
  { label: "Lessons", value: "650+" },
  { label: "Indicators", value: "20+" },
  { label: "Asset Classes", value: "10" },
  { label: "Cost", value: "Free" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="border-b border-border/20 sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-12">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold tracking-tight text-foreground/80">FinSim</span>
          </div>
          <Link
            href="/home"
            className="flex items-center gap-1.5 rounded-md bg-foreground/5 border border-border/30 px-4 py-1.5 text-xs font-medium text-foreground/80 transition-all duration-150 hover:bg-foreground/10 hover:text-foreground"
          >
            Launch App
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-28 sm:pt-32 pb-16 text-center">
        <motion.p
          className="text-xs text-muted-foreground/60 tracking-wide uppercase mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Free &middot; No sign-up &middot; No real money
        </motion.p>

        <motion.h1
          className="text-3xl sm:text-[2.75rem] font-medium leading-[1.1] tracking-[-0.03em]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Learn to trade
          <br className="hidden sm:block" />
          without risking{" "}
          <span className="text-primary">a dollar</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-5 max-w-sm text-sm text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          Practice with real strategies on a market simulator.
          650+ lessons. Zero consequences.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
        >
          <Link
            href="/home"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary h-10 px-7 text-sm font-medium text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]"
          >
            Start Learning
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center justify-center gap-2 rounded-md h-10 px-5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Browse Lessons
          </Link>
        </motion.div>

        {/* Product Preview */}
        <motion.div
          className="mt-16 mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="rounded-md border border-border/30 bg-card overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-muted/20 border-b border-border/20">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              <div className="ml-3 flex-1 h-5 rounded-md bg-muted/60 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  finsim.app/trade
                </span>
              </div>
            </div>

            {/* App content */}
            <div className="flex">
              {/* Chart area */}
              <div className="flex-1 p-3 sm:p-5">
                {/* Ticker bar */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-tight">AAPL</span>
                    <span className="text-xs text-emerald-400 font-semibold tabular-nums">
                      $192.15
                    </span>
                    <span className="text-[10px] text-emerald-400/70 font-medium">
                      +0.23%
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1 ml-auto">
                    {["1D", "1W", "1M", "3M"].map((t) => (
                      <span
                        key={t}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                          t === "1D"
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground/50"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SVG Candlestick Chart */}
                <svg
                  viewBox="0 0 400 130"
                  className="w-full h-auto"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity="0.15"
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[30, 55, 80, 105].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="400"
                      y2={y}
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                      strokeDasharray="2,4"
                    />
                  ))}
                  {/* Candlesticks */}
                  {[
                    { x: 20, o: 95, c: 88, h: 98, l: 85, bull: true },
                    { x: 36, o: 88, c: 92, h: 94, l: 86, bull: false },
                    { x: 52, o: 90, c: 82, h: 93, l: 80, bull: true },
                    { x: 68, o: 82, c: 78, h: 85, l: 75, bull: true },
                    { x: 84, o: 78, c: 82, h: 84, l: 76, bull: false },
                    { x: 100, o: 82, c: 75, h: 84, l: 72, bull: true },
                    { x: 116, o: 75, c: 70, h: 77, l: 68, bull: true },
                    { x: 132, o: 70, c: 74, h: 76, l: 68, bull: false },
                    { x: 148, o: 72, c: 65, h: 75, l: 62, bull: true },
                    { x: 164, o: 65, c: 68, h: 70, l: 63, bull: false },
                    { x: 180, o: 68, c: 60, h: 70, l: 58, bull: true },
                    { x: 196, o: 60, c: 55, h: 63, l: 52, bull: true },
                    { x: 212, o: 56, c: 62, h: 64, l: 54, bull: false },
                    { x: 228, o: 60, c: 52, h: 63, l: 50, bull: true },
                    { x: 244, o: 52, c: 48, h: 55, l: 46, bull: true },
                    { x: 260, o: 48, c: 52, h: 54, l: 46, bull: false },
                    { x: 276, o: 50, c: 44, h: 53, l: 42, bull: true },
                    { x: 292, o: 44, c: 40, h: 47, l: 38, bull: true },
                    { x: 308, o: 40, c: 45, h: 47, l: 38, bull: false },
                    { x: 324, o: 43, c: 36, h: 46, l: 34, bull: true },
                    { x: 340, o: 36, c: 32, h: 39, l: 30, bull: true },
                    { x: 356, o: 33, c: 38, h: 40, l: 31, bull: false },
                    { x: 372, o: 36, c: 28, h: 38, l: 26, bull: true },
                    { x: 388, o: 28, c: 24, h: 30, l: 22, bull: true },
                  ].map((c, i) => {
                    const top = Math.min(c.o, c.c);
                    const bot = Math.max(c.o, c.c);
                    const color = c.bull
                      ? "hsl(var(--primary))"
                      : "hsl(0 84% 60%)";
                    return (
                      <g key={i}>
                        {/* Wick */}
                        <line
                          x1={c.x}
                          y1={c.h}
                          x2={c.x}
                          y2={c.l}
                          stroke={color}
                          strokeWidth="1"
                        />
                        {/* Body */}
                        <rect
                          x={c.x - 5}
                          y={top}
                          width="10"
                          height={Math.max(bot - top, 1.5)}
                          fill={color}
                          rx="0.5"
                        />
                      </g>
                    );
                  })}
                  {/* Area fill under trend */}
                  <path
                    d="M15,92 L47,86 L79,80 L111,79 L143,68 L175,64 L207,58 L239,51 L271,48 L303,42 L335,35 L367,32 L399,26 L400,130 L0,130 Z"
                    fill="url(#chartGrad)"
                  />
                </svg>

                {/* Time labels */}
                <div className="flex justify-between mt-1.5 px-1">
                  {["9:30", "11:00", "12:30", "14:00", "15:30"].map((t) => (
                    <span
                      key={t}
                      className="text-[9px] text-muted-foreground/40 tabular-nums"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Order entry panel */}
              <div className="hidden sm:flex w-44 border-l border-border p-4 flex-col gap-2.5">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Order Entry
                </div>
                <div className="flex gap-1">
                  <div className="flex-1 rounded-md bg-primary/20 text-primary text-[10px] font-semibold text-center py-1.5">
                    Buy
                  </div>
                  <div className="flex-1 rounded-md bg-muted text-muted-foreground text-[10px] font-medium text-center py-1.5">
                    Sell
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-0.5">
                      Shares
                    </div>
                    <div className="rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px] tabular-nums">
                      100
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-0.5">
                      Type
                    </div>
                    <div className="rounded-md border border-border bg-background px-2.5 py-1.5 text-[10px]">
                      Market
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-0.5">
                      Est. Cost
                    </div>
                    <div className="text-xs font-semibold tabular-nums">
                      $19,215.00
                    </div>
                  </div>
                </div>
                <div className="mt-auto rounded-md bg-primary py-2 text-center text-[10px] font-semibold text-primary-foreground">
                  Place Order
                </div>
              </div>
            </div>

            {/* Bottom status bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/20 border-t border-border text-[10px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-2.5 w-2.5 text-primary" />
                  <span className="tabular-nums">AAPL $192.15</span>
                </span>
                <span className="hidden sm:inline text-emerald-400 tabular-nums">
                  +0.23%
                </span>
              </div>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-2.5 w-2.5 text-muted-foreground/50" />
                <span className="tabular-nums">$100,000.00</span>
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/15">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-center gap-8 sm:gap-12 text-center">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-baseline gap-1.5">
                <span className="text-sm font-medium tabular-nums">
                  {s.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight">
            Everything you need to learn markets
          </h2>
          <p className="mt-2 text-xs text-muted-foreground max-w-sm mx-auto">
            Structured learning meets hands-on practice.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border/20 rounded-md overflow-hidden border border-border/20">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-card p-6 sm:p-7"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={i + 1}
            >
              <f.icon className="h-4 w-4 text-muted-foreground/50 mb-4" />
              <h3 className="text-sm font-medium mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/15">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <motion.h2
            className="text-xl sm:text-2xl font-medium text-center mb-10 tracking-tight"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={0}
          >
            Three steps to market fluency
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Learn",
                desc: "Structured lessons on stocks, options, crypto, and macro — at your own pace.",
              },
              {
                step: "02",
                title: "Practice",
                desc: "Trade on a simulator with real chart patterns and 20+ indicators. Zero consequences.",
              },
              {
                step: "03",
                title: "Review",
                desc: "Track performance, review trades with the AI coach, and sharpen your edge.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                className="text-center sm:text-left"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                custom={i + 1}
              >
                <div className="text-[10px] font-medium text-muted-foreground/40 mb-2 tracking-widest font-mono">
                  {s.step}
                </div>
                <h3 className="text-sm font-medium mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-medium mb-3 tracking-tight">
            Your portfolio is waiting
          </h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 leading-relaxed">
            $100,000 in simulated capital. Zero risk.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:scale-[0.98]"
          >
            Start Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <p className="mt-3 text-[11px] text-muted-foreground/60">
            No account needed. Works in your browser.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/15 py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground/50">FinSim</span>
          <p className="text-[11px] text-muted-foreground/40">
            Educational only &middot; Simulated data &middot; &copy;{" "}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
