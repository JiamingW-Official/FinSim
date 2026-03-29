"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { BookOpen, Activity, Target, ArrowRight } from "lucide-react";

const LandingDemoChart = dynamic(
  () => import("@/components/landing/LandingDemoChart").then((m) => m.LandingDemoChart),
  { ssr: false, loading: () => <div className="h-[340px] rounded-md bg-card border border-border/30 animate-pulse" /> },
);

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

        {/* Product Preview — interactive chart */}
        <motion.div
          className="mt-16 mx-auto max-w-3xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <LandingDemoChart />
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
