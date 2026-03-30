import Link from "next/link";
import {
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  FlaskConical,
  BookOpen,
  ArrowRight,
  Terminal,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Paper Trading",
    desc: "Execute trades with real historical data across 10 major tickers. Full order management with limit, market, and stop orders.",
  },
  {
    icon: Brain,
    title: "AI Trading Coach",
    desc: "50+ technical signals, pattern recognition, and regime detection. Get trade plans with entry, stop, and target levels.",
  },
  {
    icon: Shield,
    title: "Options Engine",
    desc: "Professional options chain with Greeks, vol smile, term structure, and a strategy builder with 12 preset strategies.",
  },
  {
    icon: TrendingUp,
    title: "Prediction Markets",
    desc: "Bet on real market outcomes from Fed decisions to earnings surprises. Sharpen your probabilistic thinking.",
  },
  {
    icon: FlaskConical,
    title: "Quant Lab",
    desc: "Backtest strategies with custom parameters. Analyze risk metrics, drawdowns, and factor exposures.",
  },
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    desc: "Structured curriculum from candlestick basics to options pricing. Quizzes, flashcards, and hands-on simulators.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Subtle top gradient — blue-teal */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,rgba(45,156,219,0.04),transparent_70%)]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/20">
            <span className="text-xs font-bold text-primary">FS</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">FinSim</span>
        </div>
        <Link
          href="/home"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Launch App
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>

      {/* Hero — asymmetric two-column */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div>
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-3 py-1">
              <Terminal className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] font-medium text-muted-foreground tracking-wide">
                v2.0 — Prediction markets, quant engine, 50+ lessons
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              Learn to trade.
            </h1>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-primary mt-1">
              Risk nothing.
            </h1>

            <p className="mt-6 max-w-md text-base text-muted-foreground leading-relaxed">
              A professional-grade simulator with AI coaching, options analytics,
              and structured lessons. Practice with $100K in virtual capital.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/home"
                className="group flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Trading
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-lg border border-border/40 px-6 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:border-border hover:bg-accent/10"
              >
                See Features
              </a>
            </div>

            {/* Inline stats */}
            <div className="mt-10 flex items-center gap-6 text-sm">
              <div>
                <p className="font-semibold tabular-nums text-foreground">50+</p>
                <p className="text-xs text-muted-foreground">Lessons</p>
              </div>
              <div className="h-8 w-px bg-border/40" />
              <div>
                <p className="font-semibold tabular-nums text-foreground">15</p>
                <p className="text-xs text-muted-foreground">Indicators</p>
              </div>
              <div className="h-8 w-px bg-border/40" />
              <div>
                <p className="font-semibold tabular-nums text-foreground">$100K</p>
                <p className="text-xs text-muted-foreground">Virtual Capital</p>
              </div>
            </div>
          </div>

          {/* Right: app preview mockup */}
          <div className="relative hidden lg:block">
            <div className="rounded-xl border border-border/40 bg-card/80 overflow-hidden shadow-2xl shadow-black/20">
              {/* Title bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/30 bg-sidebar/60">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                <span className="ml-3 text-[10px] text-muted-foreground/50 font-mono">finsim.app/trade</span>
              </div>
              {/* Mock trading UI */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">AAPL</span>
                    <span className="ml-2 text-xs text-muted-foreground">Apple Inc.</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold font-mono tabular-nums">$189.42</span>
                    <span className="ml-2 text-xs text-green-400 font-mono tabular-nums">+1.23%</span>
                  </div>
                </div>
                {/* Mock chart area */}
                <div className="h-32 rounded-lg bg-muted/20 border border-border/20 flex items-end px-3 pb-3 gap-[3px]">
                  {[35, 42, 38, 55, 48, 62, 58, 70, 65, 72, 68, 75, 80, 74, 82, 78, 85, 90, 84, 88, 92, 86, 95, 90, 93].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-primary/40"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* Mock order entry */}
                <div className="flex gap-2">
                  <div className="flex-1 rounded-md bg-green-500/10 border border-green-500/20 py-2 text-center text-xs font-medium text-green-400">
                    Buy
                  </div>
                  <div className="flex-1 rounded-md bg-red-500/10 border border-red-500/20 py-2 text-center text-xs font-medium text-red-400">
                    Sell
                  </div>
                </div>
                {/* Mock indicators */}
                <div className="flex gap-1.5 flex-wrap">
                  {["RSI 62.4", "MACD Bull", "BB Mid"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-muted/40 border border-border/20 px-2 py-0.5 text-[10px] font-mono text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-4 -left-6 rounded-lg border border-border/40 bg-card p-3 shadow-xl shadow-black/20">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-medium">AI Coach</p>
                  <p className="text-[10px] text-muted-foreground">Bullish setup detected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features — asymmetric: 2 large + 4 small */}
      <section
        id="features"
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
      >
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-10">
          Everything you need
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20 rounded-xl overflow-hidden border border-border/40">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`bg-background p-6 ${i < 2 ? "lg:col-span-1" : ""}`}
            >
              <f.icon className="h-5 w-5 text-muted-foreground/70 mb-4" />
              <h3 className="text-sm font-semibold tracking-tight mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why FinSim — horizontal with border-left accent */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-10">
          Why FinSim
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="border-l-2 border-primary/30 pl-5">
            <h3 className="text-sm font-semibold tracking-tight mb-2">Real Market Data</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Simulated from actual historical patterns. Not random noise.
            </p>
          </div>
          <div className="border-l-2 border-primary/30 pl-5">
            <h3 className="text-sm font-semibold tracking-tight mb-2">Professional Tools</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Options chains, quant analytics, and risk models used by real traders.
            </p>
          </div>
          <div className="border-l-2 border-primary/30 pl-5">
            <h3 className="text-sm font-semibold tracking-tight mb-2">Learn by Doing</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Not lectures. Hands-on practice with immediate feedback from an AI coach.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="rounded-xl border border-border/40 bg-card/50 p-6 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">
            Ready to start?
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            No account required. Jump straight into the simulator.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Trading
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 mt-16 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">FinSim</span>
          </div>
          <div>&copy; {new Date().getFullYear()} FinSim. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
