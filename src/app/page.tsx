"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Activity, Target, ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const FEATURES = [
  {
    icon: BookOpen,
    title: "Trading Academy",
    desc: "650+ bite-sized lessons across stocks, options, crypto, and more. Learn concepts, practice on the simulator, then review your trades.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Activity,
    title: "Market Simulator",
    desc: "Trade with real chart patterns and 20+ technical indicators. Build intuition through hands-on practice with simulated execution — no real money at stake.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Target,
    title: "Prediction Markets",
    desc: "Bet on macro outcomes — Fed decisions, earnings, sector trends. Sharpen your probability thinking and calibration skills.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
              <span className="text-xs font-black text-primary">FS</span>
            </div>
            <span className="text-sm font-bold tracking-tight">FinSim</span>
          </div>
          <Link
            href="/home"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Launch App
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-10 text-center">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-[3.5rem] font-semibold leading-[1.1] tracking-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          Learn to Trade{" "}
          <br className="hidden sm:block" />
          Without Risking{" "}
          <span className="text-primary">a Dollar</span>
        </motion.h1>

        <motion.p
          className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Practice trading, build financial intuition, and develop market sense
          — all in a risk-free simulation.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-7 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Learning Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.p
          className="mt-4 text-[11px] text-muted-foreground tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
        >
          100% free&nbsp;&nbsp;•&nbsp;&nbsp;No real money&nbsp;&nbsp;•&nbsp;&nbsp;No sign-up required
        </motion.p>

        {/* Product Preview */}
        <motion.div
          className="mt-8 mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-muted/50 border-b border-border">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              <div className="ml-3 flex-1 h-5 rounded bg-muted/80 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/60">finsim.app/trade</span>
              </div>
            </div>

            {/* App content */}
            <div className="flex">
              {/* Chart area */}
              <div className="flex-1 p-3 sm:p-4">
                {/* Ticker bar */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold">AAPL</span>
                  <span className="text-xs text-emerald-400 font-medium">$192.15</span>
                  <span className="text-[10px] text-emerald-400/80">+0.23%</span>
                </div>
                {/* SVG Chart */}
                <svg viewBox="0 0 400 120" className="w-full h-auto" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="400" y2="30" stroke="hsl(var(--border))" strokeWidth="0.5" />
                  <line x1="0" y1="60" x2="400" y2="60" stroke="hsl(var(--border))" strokeWidth="0.5" />
                  <line x1="0" y1="90" x2="400" y2="90" stroke="hsl(var(--border))" strokeWidth="0.5" />
                  {/* Area fill */}
                  <path
                    d="M0,85 C30,80 60,75 90,70 C120,65 140,60 170,50 C200,40 220,55 250,45 C280,35 310,30 340,25 C360,22 380,20 400,18 L400,120 L0,120 Z"
                    fill="url(#chartGrad)"
                  />
                  {/* Line */}
                  <path
                    d="M0,85 C30,80 60,75 90,70 C120,65 140,60 170,50 C200,40 220,55 250,45 C280,35 310,30 340,25 C360,22 380,20 400,18"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />
                </svg>
                {/* Time labels */}
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground/50">9:30</span>
                  <span className="text-[9px] text-muted-foreground/50">11:00</span>
                  <span className="text-[9px] text-muted-foreground/50">12:30</span>
                  <span className="text-[9px] text-muted-foreground/50">14:00</span>
                  <span className="text-[9px] text-muted-foreground/50">15:30</span>
                </div>
              </div>

              {/* Order entry panel — hidden on very small screens */}
              <div className="hidden sm:flex w-40 border-l border-border p-3 flex-col gap-2">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Order Entry</div>
                <div className="flex gap-1">
                  <div className="flex-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold text-center py-1">Buy</div>
                  <div className="flex-1 rounded bg-muted text-muted-foreground text-[10px] font-medium text-center py-1">Sell</div>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-0.5">Shares</div>
                    <div className="rounded border border-border bg-background px-2 py-1 text-[10px]">100</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground mb-0.5">Type</div>
                    <div className="rounded border border-border bg-background px-2 py-1 text-[10px]">Market</div>
                  </div>
                </div>
                <div className="mt-auto rounded bg-primary py-1.5 text-center text-[10px] font-semibold text-primary-foreground">
                  Place Order
                </div>
              </div>
            </div>

            {/* Bottom status bar */}
            <div className="flex items-center justify-between px-4 py-1.5 bg-muted/30 border-t border-border text-[10px] text-muted-foreground">
              <span>AAPL $192.15 <span className="text-emerald-400">+0.23%</span></span>
              <span>Portfolio: $100,000.00</span>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No downloads. No sign-up. Start in your browser.
          </p>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <motion.h2
          className="text-xl sm:text-2xl font-semibold text-center mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          custom={0}
        >
          Built for students, by students
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-lg border border-border bg-card p-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${f.bg} mb-4`}>
                <f.icon className={`h-4.5 w-4.5 ${f.color}`} />
              </div>
              <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <motion.div
          className="rounded-lg border border-border bg-card p-10 text-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-3">
            Ready to start learning?
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-7">
            650+ lessons, 10 asset classes, 20+ indicators — all free, forever.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Learning Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-primary">FS</span>
            <span className="text-xs text-muted-foreground">FinSim</span>
          </div>
          <p className="text-[11px] text-muted-foreground text-center sm:text-right">
            <span>For educational purposes only. Not financial advice.</span>
            <br />
            <span>All market data is simulated.</span>
            <br />
            <span>&copy; {new Date().getFullYear()} FinSim</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
