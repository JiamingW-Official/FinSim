"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

const LandingDemoChart = dynamic(
  () => import("@/components/landing/LandingDemoChart").then((m) => m.LandingDemoChart),
  { ssr: false, loading: () => <div className="h-[340px] rounded-xl bg-card border border-border animate-pulse" /> },
);

/* ─── Animated counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Interactive feature card ─── */
function FeatureCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative border border-border rounded-2xl p-8 sm:p-10 cursor-default transition-all duration-300 hover:border-foreground/20 hover:bg-foreground/[0.02]"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: parseInt(num) * 0.12 }}
    >
      {/* Accent line top */}
      <motion.div
        className="absolute top-0 left-8 right-8 h-px bg-foreground/20"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ originX: 0 }}
      />

      <span className="font-mono text-[10px] text-muted-foreground/30 tracking-widest">{num}</span>
      <h3 className="mt-4 font-serif text-2xl sm:text-3xl tracking-tight">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground/50 leading-relaxed max-w-[22rem]">{desc}</p>

      {/* Arrow that slides in on hover */}
      <motion.div
        className="mt-6 flex items-center gap-1.5 text-[11px] text-muted-foreground/30"
        animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.3 }}
        transition={{ duration: 0.2 }}
      >
        <span className="font-medium">Explore</span>
        <ArrowRight className="h-3 w-3" />
      </motion.div>
    </motion.div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between h-14">
          <Link href="/" className="font-serif italic text-lg tracking-tight text-foreground/80">
            Alpha Deck
          </Link>
          <Link
            href="/home"
            className="rounded-full bg-foreground text-background px-5 py-1.5 text-[11px] font-medium tracking-wide transition-all duration-200 hover:bg-foreground/90"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Subtle gradient orb */}
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse,_var(--tw-gradient-stops))] from-emerald-500/[0.04] via-transparent to-transparent blur-3xl" />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative text-center max-w-5xl mx-auto">
          <motion.p
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/30 mb-10 font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            The trading flight simulator
          </motion.p>

          <motion.h1
            className="font-serif text-[clamp(2.5rem,8vw,7rem)] font-light tracking-[-0.02em] leading-[0.95]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Learn to trade
            <br />
            <em className="italic">without</em> risking
            <br />
            <span className="text-muted-foreground/25">a single dollar</span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-10 max-w-lg text-base sm:text-lg text-muted-foreground/40 leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Real charts. Real indicators. Simulated capital.
            <br className="hidden sm:block" />
            Master the market before you enter it.
          </motion.p>

          <motion.div
            className="mt-12 flex items-center justify-center gap-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Link
              href="/home"
              className="group inline-flex items-center gap-2.5 rounded-full bg-foreground text-background px-8 py-3.5 text-sm font-medium transition-all duration-200 hover:bg-foreground/90"
            >
              Start Learning
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/learn"
              className="text-sm text-muted-foreground/40 hover:text-muted-foreground transition-colors duration-200"
            >
              Browse curriculum
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            className="w-px h-10 bg-gradient-to-b from-foreground/20 to-transparent mx-auto"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
        </motion.div>
      </section>

      {/* ─── Live Demo ─── */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 pb-32">
        <motion.div
          className="border border-border rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <LandingDemoChart />
        </motion.div>
      </section>

      {/* ─── Stats marquee ─── */}
      <section className="border-y border-border py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-2 sm:grid-cols-4 gap-10 sm:gap-6">
          {[
            { value: 650, suffix: "+", label: "Lessons" },
            { value: 20, suffix: "+", label: "Indicators" },
            { value: 100, suffix: "k", label: "Starting Capital" },
            { value: 10, suffix: "", label: "Asset Classes" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <span className="font-serif text-5xl sm:text-6xl font-light tracking-tight">
                {s.value === 100 ? "$" : ""}<Counter target={s.value} suffix={s.suffix} />
              </span>
              <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground/30">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features: Interactive Cards ─── */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-32">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/30 font-mono mb-4">What you get</p>
          <h2 className="font-serif text-4xl sm:text-5xl font-light tracking-tight leading-[1.1]">
            Everything you need
            <br />
            <span className="text-muted-foreground/30">to become a better trader.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            num="01"
            title="Structured Learning"
            desc="650+ bite-sized lessons across stocks, options, crypto, and macro. Progress at your own pace with interactive quizzes."
          />
          <FeatureCard
            num="02"
            title="Live Simulator"
            desc="Trade with real historical data, 20+ technical indicators, and an AI coach that reviews every decision you make."
          />
          <FeatureCard
            num="03"
            title="Prediction Markets"
            desc="Bet on Fed decisions, earnings, and macro events. Sharpen your forecasting intuition with zero real risk."
          />
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-32">
          <motion.p
            className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/30 font-mono mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            How it works
          </motion.p>
          <motion.h2
            className="font-serif text-4xl sm:text-5xl font-light tracking-tight mb-20"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Three steps to mastery.
          </motion.h2>

          <div className="space-y-0">
            {[
              {
                num: "01",
                title: "Learn the fundamentals",
                desc: "Start with structured lessons covering stocks, options, crypto, and macroeconomics. Each lesson builds on the last.",
              },
              {
                num: "02",
                title: "Practice on the simulator",
                desc: "Execute trades on real historical data with $100k in simulated capital. No consequences, just learning.",
              },
              {
                num: "03",
                title: "Review and improve",
                desc: "The AI coach analyzes every trade. Track your performance, identify patterns, and sharpen your edge over time.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="group flex items-start gap-8 sm:gap-12 py-10 border-t border-border cursor-default hover:bg-foreground/[0.01] transition-colors duration-300 -mx-6 sm:-mx-10 px-6 sm:px-10"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
              >
                <span className="font-mono text-[11px] text-muted-foreground/20 tracking-widest pt-2 shrink-0 w-8">{step.num}</span>
                <div className="flex-1">
                  <h3 className="font-serif text-2xl sm:text-3xl tracking-tight group-hover:text-foreground transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-muted-foreground/40 leading-relaxed max-w-xl group-hover:text-muted-foreground/60 transition-colors">
                    {step.desc}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/10 group-hover:text-muted-foreground/40 group-hover:translate-x-1 transition-all duration-300 mt-3 shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative py-40 text-center px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,_var(--tw-gradient-stops))] from-emerald-500/[0.03] via-transparent to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <h2 className="font-serif text-4xl sm:text-6xl font-light tracking-tight leading-[1.05]">
            Your edge starts
            <br />
            <em className="italic">here.</em>
          </h2>
          <p className="mt-6 text-sm text-muted-foreground/30">$100k simulated capital. Zero risk. Start now.</p>
          <div className="mt-10">
            <Link
              href="/home"
              className="group inline-flex items-center gap-2.5 rounded-full bg-foreground text-background px-8 py-3.5 text-sm font-medium transition-all duration-200 hover:bg-foreground/90"
            >
              Launch Alpha Deck
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
          <span className="font-serif italic text-sm text-muted-foreground/20">Alpha Deck</span>
          <p className="text-[10px] text-muted-foreground/20 tracking-wide">
            Educational only &middot; Simulated data &middot; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
