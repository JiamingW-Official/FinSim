import type { Unit } from "./types";

export const UNIT_DRAWDOWN_RECOVERY: Unit = {
  id: "drawdown-recovery",
  title: "Drawdowns & Portfolio Recovery",
  description:
    "Master the psychology and mathematics of market declines — from measuring peak-to-trough losses and understanding recovery math, to surviving famous bear markets, staying invested through volatility, and building a portfolio resilient enough to weather any storm",
  icon: "",
  color: "#dc2626",
  lessons: [
    // ─── Lesson 1: Understanding Drawdowns ───────────────────────────────────────
    {
      id: "drawdown-recovery-1",
      title: " Understanding Drawdowns",
      description:
        "Peak-to-trough decline, maximum drawdown, drawdown duration, and the underwater period — the vocabulary every serious investor must know",
      icon: "TrendingDown",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "What Is a Drawdown?",
          content:
            "A **drawdown** measures the decline from a portfolio's highest point (peak) to its lowest subsequent point (trough) before a new high is reached. It is the most honest measure of downside pain an investor actually experiences — not the abstract volatility captured by standard deviation.\n\n**Key drawdown terms:**\n- **Peak**: The highest value your portfolio (or an index) has reached\n- **Trough**: The lowest value reached after the peak, before recovery\n- **Drawdown %**: `(Trough Value − Peak Value) / Peak Value × 100`\n- **Maximum Drawdown (MDD)**: The largest peak-to-trough decline over a defined period — the worst-case loss a long-term investor would have faced\n\n**A simple example:**\nYour portfolio grows from $10,000 to $18,000 (the peak). It then falls to $12,600 (the trough).\n- Drawdown = ($12,600 − $18,000) / $18,000 = −30%\n- You lost 30% from peak, even though your portfolio is still up 26% from your original investment\n\n**Why drawdown matters more than volatility:**\nVolatility treats upside and downside swings equally. Drawdown captures only the actual capital destruction an investor experiences. A fund with low volatility but one catastrophic 60% drawdown is far more dangerous than a fund with moderate volatility but a maximum 20% drawdown.",
          highlight: ["drawdown", "peak", "trough", "maximum drawdown", "capital destruction"],
        },
        {
          type: "teach",
          title: "Drawdown Duration and the Underwater Period",
          content:
            "Beyond the magnitude of a drawdown, **duration** is equally important. How long does it take to recover? How long are you psychologically underwater, watching others make money while you wait to break even?\n\n**Drawdown duration has three phases:**\n1. **Decline phase**: The time from the peak to the trough — how quickly losses accumulate\n2. **Recovery phase**: The time from the trough back to the previous peak — how long until you break even\n3. **Underwater period**: The total time from peak to new peak — the full duration of pain (decline + recovery)\n\n**Historical S&P 500 underwater periods:**\n| Drawdown | Peak | Recovery | Underwater Period |\n|---|---|---|---|\n| −49% | Mar 2000 | Oct 2006 | 6.5 years |\n| −57% | Oct 2007 | Mar 2013 | 5.4 years |\n| −34% | Feb 2020 | Aug 2020 | 6 months |\n| −25% | Jan 2022 | Jan 2024 | 2 years |\n\n**The psychological toll of duration:**\nMany investors can tolerate a sharp 30% drop. Far fewer can endure being underwater for 5+ years while watching money market funds earn 5%. Duration is what breaks investment discipline and causes investors to capitulate at the worst moment — right before recovery.\n\n**Professional insight:** When evaluating any investment, always ask: \"What is the maximum drawdown AND how long was the recovery?\" A strategy that loses 20% but recovers in 3 months is fundamentally different from one that loses 20% and takes 4 years to recover.",
          highlight: ["duration", "underwater period", "decline phase", "recovery phase", "capitulate"],
        },
        {
          type: "teach",
          title: "Measuring Maximum Drawdown",
          content:
            "**Maximum Drawdown (MDD)** is the single most important risk metric for long-term investors. It answers: \"If I had invested at the worst possible time, what is the most I could have lost before recovering?\"\n\n**How MDD is calculated:**\nFor each point in time, you look back at the highest price ever reached before that point, then compute the percentage decline from that prior peak. The MDD is the worst such percentage across the entire history.\n\n**MDD benchmarks for major asset classes:**\n- U.S. Treasury Bonds: ~−15% to −20% (yes, bonds also drawdown)\n- Global Diversified 60/40 Portfolio: ~−35% to −45%\n- S&P 500: ~−57% (2007–2009)\n- Small-Cap Value: ~−70% (2000–2009 lost decade)\n- Single Stocks: Frequently −70% to −100%\n- Bitcoin: ~−84% multiple times\n\n**MDD vs. average return — the real tradeoff:**\nA strategy boasting 15% annual returns with an 80% MDD is not the same as one returning 12% with a 25% MDD. Very few investors can realistically hold through an 80% drawdown — most will sell, permanently locking in the loss and missing the recovery.\n\n**Calmar Ratio** — one risk-adjusted metric that uses MDD:\n`Calmar Ratio = Annualized Return / Absolute Maximum Drawdown`\nA Calmar of 1.0 means the strategy returned 1% for every 1% of maximum drawdown risk. Higher is better. Hedge funds often target Calmar ratios above 0.5.",
          highlight: ["maximum drawdown", "MDD", "worst possible time", "Calmar Ratio", "risk-adjusted"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor's portfolio reached a peak of $50,000 and then fell to a trough of $35,000. What is the drawdown percentage?",
          options: [
            "−30%",
            "−43%",
            "−15%",
            "−25%",
          ],
          correctIndex: 0,
          explanation:
            "Drawdown = (Trough − Peak) / Peak × 100 = ($35,000 − $50,000) / $50,000 × 100 = −$15,000 / $50,000 × 100 = −30%. The portfolio lost 30% from its peak value. Note that the investor needs a 42.9% gain from the trough to get back to the $50,000 peak — far more than the 30% they lost, which illustrates the asymmetry of losses.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The 'underwater period' of a drawdown refers only to the time it takes for a portfolio to decline from its peak to its trough.",
          correct: false,
          explanation:
            "The underwater period is the total time from the peak to when the portfolio reaches a new peak — encompassing both the decline phase AND the full recovery phase. If a portfolio peaks in October 2007, bottoms in March 2009, and doesn't reach a new all-time high until March 2013, the underwater period is approximately 5.4 years. This full duration of being below your previous peak is what tests investor psychology most severely.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: The Math of Recovery ──────────────────────────────────────────
    {
      id: "drawdown-recovery-2",
      title: " The Math of Recovery",
      description:
        "Why a 50% loss requires a 100% gain to break even, how compounding works against you during drawdowns, and a data-driven recovery time table",
      icon: "Calculator",
      xpReward: 90,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The Asymmetry of Losses",
          content:
            "The most important — and most underappreciated — mathematical fact in investing: **losses and gains are not symmetric**. Losing 50% requires a 100% gain just to break even. This asymmetry is the core reason drawdown management matters far more than chasing maximum returns.\n\n**The recovery math table:**\n| Loss Suffered | Gain Required to Recover |\n|---|---|\n| −10% | +11.1% |\n| −20% | +25.0% |\n| −30% | +42.9% |\n| −40% | +66.7% |\n| −50% | +100.0% |\n| −60% | +150.0% |\n| −70% | +233.3% |\n| −80% | +400.0% |\n| −90% | +900.0% |\n\n**Why the math is so brutal:**\nIf you start with $100,000 and lose 50%, you have $50,000. To get back to $100,000 from $50,000 requires doubling — a 100% gain. But the market rarely produces 100% gains. The S&P 500 averages roughly 10% per year. At that rate, recovering from a 50% loss takes approximately 7 years.\n\n**The formula:**\nRequired Recovery Gain = 1/(1 − Loss%) − 1\n- Example for −50%: 1/(1 − 0.50) − 1 = 1/0.50 − 1 = 2 − 1 = 100%\n- Example for −80%: 1/(1 − 0.80) − 1 = 1/0.20 − 1 = 5 − 1 = 400%",
          highlight: ["asymmetry", "recovery gain", "break even", "100% gain", "loss management"],
        },
        {
          type: "teach",
          title: "Time to Recovery — The Real Cost of Drawdowns",
          content:
            "Given the asymmetry of losses, how long does recovery actually take? Assuming the market delivers its historical ~10% average annual return, here is the expected recovery timeline:\n\n**Expected years to recover at 10% annual returns:**\n| Drawdown | Gain Needed | Years to Recover |\n|---|---|---|\n| −10% | +11.1% | ~1.1 years |\n| −20% | +25.0% | ~2.3 years |\n| −30% | +43.0% | ~3.6 years |\n| −40% | +66.7% | ~5.3 years |\n| −50% | +100.0% | ~7.3 years |\n| −60% | +150.0% | ~9.6 years |\n| −70% | +234.0% | ~12.6 years |\n\n**The compounding headwind:**\nThe formula for years to recover is: `Years = ln(1 + Required Gain) / ln(1 + Annual Return)`\n- For a 50% loss needing a 100% gain at 10%/year: ln(2) / ln(1.10) = 0.693 / 0.0953 ≈ 7.3 years\n\n**What this means practically:**\nAn investor who is 55 years old and suffers a 50% portfolio drawdown may not recover before retirement at 65 — if markets perform at historical averages. This is why drawdown management becomes increasingly critical as investors age or approach financial goals.\n\n**The opportunity cost angle:**\nThose 7.3 recovery years are not just neutral — you are also missing out on compounding from a higher base. An investor who avoided the drawdown entirely would be far ahead, because they compounded 10% on a larger base throughout the recovery period.",
          highlight: ["time to recovery", "compounding headwind", "opportunity cost", "retirement risk", "ln formula"],
        },
        {
          type: "teach",
          title: "Why Avoiding Large Drawdowns Beats Chasing High Returns",
          content:
            "Counter-intuitively, a strategy with a lower average return but smaller drawdowns often produces better long-term wealth than a high-return, high-drawdown strategy. Compounding is brutally sensitive to large losses.\n\n**A tale of two portfolios over 20 years:**\n\n**Portfolio A (aggressive, volatile):**\n- Average annual return: 15%\n- But includes one catastrophic −60% drawdown year\n- Actual 20-year CAGR after the devastating year: ~9.1%\n\n**Portfolio B (disciplined, drawdown-managed):**\n- Average annual return: 11%\n- Maximum drawdown: −25%\n- Actual 20-year CAGR: ~10.4%\n\nPortfolio B wins — not because it earned more in good years, but because it lost far less in the bad year.\n\n**The math behind this:**\nOne year of −60% is equivalent to erasing 9.5 years of 10% gains. You would need 9.5 consecutive years of 10% growth just to undo a single catastrophic year.\n\n**Warren Buffett's two rules of investing:**\n1. Never lose money\n2. Never forget Rule #1\n\nThis is not a platitude — it is a precise mathematical statement about the asymmetric destruction caused by large losses. Buffett's 60-year CAGR of ~20% is partly the result of never suffering a truly catastrophic drawdown, even through multiple major market crises.",
          highlight: ["drawdown management", "CAGR", "compounding", "Buffett", "catastrophic loss"],
        },
        {
          type: "quiz-mc",
          question:
            "A portfolio suffers a 40% drawdown. Assuming 10% average annual returns from the trough, approximately how many years will it take to recover to the previous peak?",
          options: [
            "Approximately 5.3 years",
            "Approximately 4.0 years",
            "Approximately 2.5 years",
            "Approximately 8.7 years",
          ],
          correctIndex: 0,
          explanation:
            "A 40% loss requires a 66.7% gain to recover (1/0.60 − 1 = 66.7%). Using the formula Years = ln(1.667) / ln(1.10) = 0.511 / 0.0953 ≈ 5.36 years. This illustrates why even a 'moderate' drawdown of 40% can mean more than five years of recovery time at typical market returns. The asymmetry of losses makes drawdown prevention far more valuable than it might initially appear.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A portfolio that loses 30% one year and gains 30% the following year has fully recovered to its original value.",
          correct: false,
          explanation:
            "This is a common misconception. If you start with $100,000 and lose 30%, you have $70,000. A 30% gain on $70,000 produces only $91,000 — still $9,000 below the original $100,000. You need a 42.9% gain to recover from a 30% loss, not 30%. This is the core asymmetry of losses: the percentage gain required to recover always exceeds the percentage lost. After any drawdown, your base has shrunk, so the same percentage gain produces smaller dollar recovery.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Famous Bear Markets ───────────────────────────────────────────
    {
      id: "drawdown-recovery-3",
      title: "Bear Famous Bear Markets",
      description:
        "The dot-com crash, 2008 financial crisis, COVID-19 collapse, and 2022 rate shock — what caused each and what ultimately drove recovery",
      icon: "History",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Dot-Com Crash (2000–2002): Valuation Unmoored from Reality",
          content:
            "The technology bubble of the late 1990s produced one of the most extreme valuation manias in market history — and one of the most punishing bear markets for investors who held concentrated tech positions.\n\n**The numbers:**\n- S&P 500 peak: March 2000 at 1,527\n- S&P 500 trough: October 2002 at 777\n- Total S&P 500 drawdown: **−49%**\n- NASDAQ 100 drawdown: **−83%** — many tech stocks fell 90–100%\n- Underwater period for S&P 500: 6.5 years (new high in October 2006)\n\n**What caused the crash:**\n- Companies with no revenue, no earnings, and no realistic path to profit trading at astronomical multiples\n- \"Eyeballs\" and \"page views\" replaced earnings as valuation metrics\n- IPOs soared 100%+ on their first day — a signal of rampant speculation, not business value\n- The Federal Reserve raised rates in 1999–2000, tightening the liquidity that had fueled speculation\n\n**What drove recovery:**\n- Ruthless elimination of unprofitable business models\n- Genuine technology adoption finally catching up to 1990s hype (broadband, e-commerce)\n- Survivors like Amazon and Microsoft rebuilt on real earnings power\n- Fed rate cuts (2001) and fiscal stimulus post-9/11 provided macro support\n\n**Lesson for investors:** Valuation always matters — eventually. During manias, fundamentals feel irrelevant. But when rates rise or sentiment shifts, companies without earnings have nothing to anchor their price. The survivors of the dot-com crash — Amazon, Alphabet, Apple — were those with real competitive advantages.",
          highlight: ["dot-com", "NASDAQ 83%", "valuation mania", "no earnings", "rate hikes triggered"],
        },
        {
          type: "teach",
          title: "The 2008 Financial Crisis: Leverage and Systemic Fragility",
          content:
            "The 2008 Global Financial Crisis (GFC) was the worst financial market disruption since the Great Depression, caused not by irrational optimism about technology but by excessive leverage embedded throughout the global financial system.\n\n**The numbers:**\n- S&P 500 peak: October 2007 at 1,565\n- S&P 500 trough: March 2009 at 677\n- Total drawdown: **−57%**\n- Financial sector stocks: many fell −90% to −100%\n- Underwater period: 5.4 years (new high in March 2013)\n- U.S. unemployment peaked at 10% in October 2009\n\n**What caused the crash:**\n- Mortgage-backed securities masked the credit risk of millions of subprime loans\n- Wall Street banks leveraged 30:1 or more — a 3.3% decline in assets wiped out all equity\n- Rating agencies gave AAA ratings to toxic mortgage securities\n- When house prices stopped rising, the entire pyramid of leveraged bets collapsed\n- Lehman Brothers failed September 15, 2008 — triggering global credit freeze\n\n**What drove recovery:**\n- Unprecedented Fed intervention: rates cut to near-zero, Quantitative Easing I/II/III\n- U.S. Treasury TARP program: $700 billion to recapitalize banks\n- Federal government backstop of Fannie Mae, Freddie Mac, AIG\n- Corporate earnings rebounded sharply from deeply depressed 2009 levels\n- Investors who bought at the March 2009 trough earned 400%+ by 2020\n\n**Lesson:** Systemic crises powered by leverage can be more severe and longer-lasting than valuation bubbles. The policy response — fiscal and monetary — ultimately determined the recovery timeline.",
          highlight: ["2008 GFC", "57% drawdown", "leverage 30:1", "Lehman", "QE", "TARP"],
        },
        {
          type: "teach",
          title: "COVID-19 (2020) and the Rate Shock (2022): Two Very Different Bears",
          content:
            "Modern markets have produced two distinctly different bear markets worth comparing: the COVID crash of 2020 (fast and sharp, rapid recovery) and the 2022 rate shock (grinding and prolonged).\n\n**COVID-19 Crash (2020):**\n- S&P 500 peak: February 19, 2020 at 3,386\n- S&P 500 trough: March 23, 2020 at 2,237 — just 33 days later!\n- Total drawdown: **−34%** in only 33 days — the fastest bear market in history\n- Recovery: New all-time high by August 18, 2020 — only 6 months\n- Cause: Global economic shutdown, extreme uncertainty about pandemic duration\n- Recovery driver: Unprecedented fiscal stimulus ($6T+ globally), Fed emergency rate cuts to zero, vaccine news, resilience of digital economy\n\n**2022 Rate Shock:**\n- S&P 500 peak: January 3, 2022 at 4,797\n- S&P 500 trough: October 12, 2022 at 3,578\n- Total drawdown: **−25%** (NASDAQ: −38%, many growth stocks −60% to −80%)\n- Cause: Fed raised rates from 0.25% to 5.50% in 18 months — fastest hiking cycle in 40 years\n- Recovery: New highs in January 2024 — approximately 2 years\n- Recovery driver: Inflation declining faster than expected, AI-driven earnings enthusiasm (NVIDIA, Microsoft), resilient consumer spending\n\n**The comparison:** Speed of recovery is not determined by drawdown magnitude. COVID's −34% recovered in 6 months because stimulus was massive and targeted. The 2022 −25% took 2 years because the fundamental driver (interest rate repricing) resolved slowly.",
          highlight: ["COVID crash", "33 days", "fastest bear market", "2022 rate shock", "Fed hiking cycle", "stimulus"],
        },
        {
          type: "quiz-mc",
          question:
            "During the 2008 Financial Crisis, the S&P 500 fell approximately 57% from peak to trough. Which factor was MOST responsible for eventually driving recovery?",
          options: [
            "Unprecedented monetary and fiscal stimulus combined with rebounding corporate earnings",
            "Technology companies replacing financial firms as market leaders",
            "Housing prices returning to their pre-crisis peaks by 2011",
            "A natural business cycle expansion that required no policy intervention",
          ],
          correctIndex: 0,
          explanation:
            "The 2008 recovery was driven by a combination of the Federal Reserve cutting rates to near-zero and implementing three rounds of Quantitative Easing, the U.S. Treasury's TARP program recapitalizing banks with $700 billion, and corporate earnings rebounding sharply from the deeply depressed 2009 trough. Housing prices did not return to 2006 peaks until 2012–2016 depending on the market. The recovery required significant active policy intervention — it was not a natural business cycle recovery.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The COVID-19 bear market of 2020 took longer to recover from than the 2008 Financial Crisis bear market because the drawdown was caused by an external shock rather than a financial system failure.",
          correct: false,
          explanation:
            "The opposite is true. The COVID crash (-34%) recovered in just 6 months — one of the fastest recoveries in market history — aided by massive fiscal and monetary stimulus. The 2008 GFC (-57%) took 5.4 years to recover because the damage was embedded in the financial system's balance sheets. The cause of a drawdown matters enormously: pandemic shocks can be met with stimulus, while balance sheet crises require years of deleveraging regardless of policy intervention.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Staying Invested Through Drawdowns ────────────────────────────
    {
      id: "drawdown-recovery-4",
      title: " Staying Invested Through Drawdowns",
      description:
        "The behavior gap, the devastating cost of missing the market's best days, and how dollar-cost averaging turns volatility into an advantage",
      icon: "Brain",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Behavior Gap — Why Investors Underperform Their Own Funds",
          content:
            "The single largest destroyer of investor wealth is not market crashes, fees, or taxes — it is investor behavior. Researchers consistently find a massive gap between the returns funds deliver and the returns investors actually receive.\n\n**The behavior gap in numbers:**\n- Over the 20 years ending 2023, the S&P 500 returned approximately 9.7% per year\n- The average equity fund investor earned approximately 6.3% per year over the same period\n- The 3.4% annual gap compounds into an enormous wealth difference over decades\n- On a $100,000 investment over 20 years: 9.7% → $639,000 vs. 6.3% → $337,000 — a $302,000 difference!\n\n**Why the gap exists:**\n1. **Panic selling during drawdowns**: Investors sell after large losses lock in declines, then miss the recovery\n2. **Performance chasing**: Investors pour money into funds after they've had great years — buying high\n3. **Market timing failures**: Investors attempt to exit before crashes and re-enter after recovery — consistently wrong\n4. **Overconfidence**: After a bull market, investors take on more risk than they can emotionally handle\n\n**DALBAR research findings:**\nDALBAR's annual Quantitative Analysis of Investor Behavior has consistently found that the average investor holds mutual funds for less than 4 years — and the average holding period has actually been declining. The typical investor buys near peaks (when FOMO is strong) and sells near troughs (when fear is overwhelming) — the exact opposite of optimal behavior.\n\n**The most powerful investing question:** Before investing in anything, ask: \"Can I hold this through a 40–50% drawdown without selling?\" If the honest answer is no, either reduce your position size or choose a less volatile strategy.",
          highlight: ["behavior gap", "3.4% annual gap", "panic selling", "performance chasing", "DALBAR"],
        },
        {
          type: "teach",
          title: "The Cost of Missing the 10 Best Days",
          content:
            "One of the most striking statistics in finance: missing just a handful of the market's best trading days over a decade destroys most of the long-term return. This is because the market's biggest gains are often concentrated in a few days — frequently occurring during or right after the worst drawdown periods.\n\n**The 10 best days study (S&P 500, 2003–2022):**\n- Fully invested: **+9.8% annualized** → $100,000 grew to $636,000\n- Missed 10 best days: **+5.6% annualized** → $100,000 grew to $299,000\n- Missed 20 best days: **+2.4% annualized** → $100,000 grew to $163,000\n- Missed 30 best days: **−0.4% annualized** → $100,000 shrank to $92,000\n- Missed 40 best days: **−3.0% annualized** → $100,000 shrank to $66,000\n\n**The cruel irony:**\n7 of the 10 best days in the 2003–2022 period occurred within 2 weeks of the 10 worst days. Investors who sold during panic (worst days) also missed the immediate bounce-back (best days). You cannot time your exit around bad days without also missing the best days.\n\n**Specific examples:**\n- March 24, 2020 (S&P 500 +9.4%): Many panic-sold March 20–23; this single day's recovery was larger than most annual gains\n- October 13, 2008 (+11.6%): Occurred during the heart of the financial crisis, when fear was at maximum\n- March 23, 2009 (+7.1%): The exact trough day — investors who sold \"to stop the pain\" missed the beginning of a 400%+ bull market\n\n**The solution is deceptively simple:** Stay invested. The cure for drawdown anxiety is not market timing — it is position sizing that allows you to endure the worst without capitulating.",
          highlight: ["10 best days", "missing best days", "9.8% vs 5.6%", "concurrent with worst days", "position sizing"],
        },
        {
          type: "teach",
          title: "Dollar-Cost Averaging: Turning Drawdowns into Opportunity",
          content:
            "**Dollar-cost averaging (DCA)** is the practice of investing a fixed dollar amount at regular intervals regardless of market conditions. During drawdowns, DCA automatically purchases more shares at lower prices — mechanically converting market volatility from an enemy into an ally.\n\n**How DCA works during a drawdown:**\nSuppose you invest $1,000 per month:\n\n| Month | Price | Shares Bought | Cumulative Shares | Total Invested |\n|---|---|---|---|---|\n| 1 (peak) | $100 | 10.0 | 10.0 | $1,000 |\n| 2 (−20%) | $80 | 12.5 | 22.5 | $2,000 |\n| 3 (−30%) | $70 | 14.3 | 36.8 | $3,000 |\n| 4 (−40%) | $60 | 16.7 | 53.5 | $4,000 |\n| 5 (recovery) | $90 | 11.1 | 64.6 | $5,000 |\n\nAfter month 5, your 64.6 shares at $90 = $5,814 on $5,000 invested = **+16.3% gain**, despite the market still being 10% below Month 1!\n\n**Why DCA works psychologically:**\n- Removes the impossible task of timing the market\n- Eliminates regret — you're buying at every level, so you can't feel like you should have waited\n- Transforms bear markets from threats into buying opportunities\n- Aligns perfectly with how most people actually have money: paycheck by paycheck\n\n**DCA limitations:**\n- In a steadily rising market, DCA underperforms lump-sum investing (you delay putting capital to work)\n- Research shows lump-sum investing beats DCA roughly 2/3 of the time in the U.S. market\n- DCA is optimal when you don't have a lump sum, or when volatility is expected to be high",
          highlight: ["dollar-cost averaging", "DCA", "fixed amount", "more shares at lower prices", "lump-sum comparison"],
        },
        {
          type: "quiz-mc",
          question:
            "According to the '10 best days' research, an investor who missed the 10 best trading days over a 20-year period would earn approximately what annualized return compared to a fully invested investor's 9.8%?",
          options: [
            "Approximately 5.6% per year",
            "Approximately 8.9% per year",
            "Approximately 7.2% per year",
            "Approximately 3.1% per year",
          ],
          correctIndex: 0,
          explanation:
            "Missing just 10 best days out of roughly 5,000 trading days (0.2% of days!) reduces the annualized return from 9.8% to approximately 5.6% — nearly cutting the return in half. On $100,000 over 20 years, this difference amounts to $337,000 in lost wealth. The critical insight is that these best days often occur during or immediately after the worst drawdown periods, meaning investors who sell during panic typically miss these crucial recovery days.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Dollar-cost averaging always produces better returns than lump-sum investing because it protects against buying at the market peak.",
          correct: false,
          explanation:
            "Research shows that lump-sum investing beats dollar-cost averaging approximately 2/3 of the time in historically rising markets. This is because markets trend upward over time — the sooner you invest, the longer your capital compounds. DCA does outperform lump-sum in about 1/3 of cases, typically when markets are falling or highly volatile after the initial investment date. DCA's primary advantages are psychological (reduces regret and anxiety) and practical (suits investors who receive income gradually), not mathematical superiority over lump-sum.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Building Drawdown Resilience ───────────────────────────────────
    {
      id: "drawdown-recovery-5",
      title: " Building Drawdown Resilience",
      description:
        "Diversification math, rebalancing as a disciplined buying strategy, the role of cash reserves, and the psychological tools to endure inevitable market storms",
      icon: "Shield",
      xpReward: 110,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Diversification: The Only Free Lunch in Finance",
          content:
            "Nobel laureate Harry Markowitz called diversification \"the only free lunch in finance\" — the ability to reduce risk without sacrificing expected return. But diversification only works when assets are not perfectly correlated.\n\n**How diversification reduces drawdowns:**\n- When assets are uncorrelated (correlation = 0), combining them reduces portfolio volatility without reducing expected return\n- When assets are negatively correlated, they move in opposite directions — one's gain offsets the other's loss\n\n**Historical correlation during drawdowns (S&P 500 down years):**\n| Asset | Avg Correlation to Stocks | Behavior in 2008 Crisis |\n|---|---|---|\n| U.S. Bonds (10yr) | −0.25 | +25.9% gain |\n| Gold | +0.08 | +5.8% gain |\n| Real Estate (REITs) | +0.65 | −37.7% loss |\n| Commodities | +0.15 | −46.5% loss |\n| International Stocks | +0.87 | −45.1% loss |\n\n**The correlation trap:**\nDuring severe market stress (2008, March 2020), correlations between risky assets spike toward 1.0 — everything falls together when panic strikes. Only assets with fundamental economic independence (Treasuries, short-term bonds, cash) reliably zig when equities zag.\n\n**Practical diversification for drawdown protection:**\n- 60% stocks / 40% bonds historically cuts maximum drawdown from −57% (100% stocks) to ~−35%\n- Adding 5–10% gold further smooths volatility without much return sacrifice\n- International diversification helps over decades but fails in acute crises\n- True diversification is across asset classes, not just owning 500 different stocks",
          highlight: ["diversification", "free lunch", "correlation", "Treasuries", "60/40", "correlation spike"],
        },
        {
          type: "teach",
          title: "Rebalancing: Discipline That Buys Low Automatically",
          content:
            "**Rebalancing** is the practice of periodically resetting your portfolio back to its target allocation. Done consistently, it mechanically forces you to buy more of whatever has fallen and sell some of whatever has risen — implementing \"buy low, sell high\" without requiring emotional courage in the moment.\n\n**How rebalancing works during a drawdown:**\nTarget: 60% stocks / 40% bonds\n\nBefore bear market: $100,000 → $60,000 stocks + $40,000 bonds\nAfter −40% stock drawdown: $36,000 stocks (42.4%) + $40,000 bonds (57.6%) = $76,000 total\nRebalancing action: Sell $13,000 bonds, buy $13,000 stocks\nResult: $49,000 stocks (60%) + $27,000 bonds (40%) = $76,000\n\nYou just bought stocks after they fell 40% — at lower prices — without requiring any emotional heroism.\n\n**Rebalancing return premium:**\nResearch by Vanguard found that annual rebalancing added approximately 0.4–0.5% per year in risk-adjusted returns over a no-rebalancing portfolio over 30-year periods, primarily by forcing systematic \"buy low, sell high\" behavior.\n\n**Rebalancing strategies:**\n1. **Calendar rebalancing**: Rebalance quarterly or annually regardless of drift\n2. **Threshold rebalancing**: Rebalance only when any allocation drifts more than 5% from target\n3. **Opportunistic rebalancing**: Use new contributions to buy underweight assets (avoids selling and tax events)\n\n**Tax consideration:** In taxable accounts, rebalancing by selling generates capital gains taxes. Use new contributions or tax-advantaged accounts (401k, IRA) for rebalancing when possible.",
          highlight: ["rebalancing", "buy low sell high", "threshold rebalancing", "0.4–0.5% premium", "tax consideration"],
        },
        {
          type: "teach",
          title: "Cash Reserves and the Psychological Toolkit",
          content:
            "Even the best-diversified, properly rebalanced portfolio will test your psychological limits during severe drawdowns. Practical cash management and mental frameworks are the final layer of drawdown resilience.\n\n**The role of cash in a portfolio:**\n\n**1. Emergency Fund (non-investment cash):**\n- 3–6 months of living expenses in high-yield savings — never invested\n- Purpose: Prevents forced selling during market crashes (job loss + portfolio crash simultaneously)\n- A family without an emergency fund may be forced to sell stocks at −40% to pay bills\n\n**2. Dry Powder (investment cash):**\n- 5–15% of portfolio held in cash or short-term bonds for opportunistic deployment\n- Purpose: Allows buying into severe drawdowns without selling other assets\n- Psychological benefit: Having cash to deploy turns bear markets from threats into opportunities\n\n**Psychological toolkit for surviving drawdowns:**\n\n**Reframe the narrative:** \"My stocks are 30% off\" is emotionally equivalent to \"they're having a 30% sale.\" Reframing from loss to opportunity is not denial — it's accurate for long-term investors.\n\n**Automate everything:** Pre-committing to automatic investment plans removes the emotional decision in the moment of fear. You can't panic-sell what you've committed to hold.\n\n**Consume less financial media:** CNBC and financial Twitter are optimized for engagement, not your financial health. Bear market media coverage maximizes fear. Checking your portfolio daily during drawdowns correlates with worse outcomes.\n\n**Write your investment policy statement in advance:** Document your strategy, your target allocation, your rebalancing rules, and your expected maximum drawdown before the crash happens. Refer to it when emotions peak.",
          highlight: ["emergency fund", "dry powder", "reframe narrative", "automate", "investment policy statement", "media consumption"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor has a 60% stocks / 40% bonds target allocation with $200,000. After a 35% stock market decline, stocks are now worth $78,000 and bonds are unchanged at $80,000. What action does disciplined rebalancing require?",
          options: [
            "Sell approximately $14,600 of bonds and buy $14,600 of stocks to restore 60/40",
            "Sell all remaining stocks and move to 100% bonds to prevent further losses",
            "Hold the current allocation — no action needed until stocks fully recover",
            "Reduce the stock allocation to 45% to reflect the new market reality",
          ],
          correctIndex: 0,
          explanation:
            "Total portfolio = $78,000 + $80,000 = $158,000. Target 60% stocks = $94,800; current stocks = $78,000 → underweight by $16,800. Target 40% bonds = $63,200; current bonds = $80,000 → overweight by $16,800. Rebalancing requires selling approximately $16,800 of bonds and buying $16,800 of stocks. This forces systematic buying of stocks after a 35% decline — exactly what fear makes emotionally difficult but discipline makes automatic. The exact calculation may vary slightly based on how you round, but selling bonds to buy stocks is unambiguously correct.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "During severe market downturns, correlations between different types of risky assets (stocks, real estate, commodities) typically converge toward 1.0, meaning diversification across risky assets provides less protection than expected precisely when it is needed most.",
          correct: true,
          explanation:
            "This is a well-documented phenomenon in financial markets called 'correlation breakdown' or 'crisis correlation.' During the 2008 GFC, assets that normally had low correlations to stocks — REITs, international equities, commodities — all fell sharply together as forced selling, margin calls, and risk-off panic swept across all asset classes simultaneously. Only assets with genuine economic independence from the credit and equity cycle — primarily government bonds, cash, and sometimes gold — maintained low or negative correlation. This is why truly resilient portfolios include assets like Treasuries, not just diversified equity exposure.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Research by firms including Vanguard suggests that systematic annual portfolio rebalancing adds approximately how much in risk-adjusted returns per year compared to never rebalancing?",
          options: [
            "Approximately 0.4–0.5% per year over long periods",
            "Approximately 2.0–3.0% per year — compounding into massive gains",
            "Essentially zero — rebalancing is purely a risk management tool with no return benefit",
            "Approximately −0.5% per year due to transaction costs and taxes",
          ],
          correctIndex: 0,
          explanation:
            "Vanguard's research found that disciplined annual rebalancing added approximately 0.4–0.5% in annualized risk-adjusted return over no-rebalancing portfolios across 30-year historical periods. While this sounds modest, 0.4% compounded over 30 years on a $500,000 portfolio adds approximately $130,000 in additional wealth. The benefit comes from systematically buying low and selling high during market cycles — the mechanical enforcement of good behavior that most investors struggle to achieve voluntarily during bear markets.",
          difficulty: 3,
        },
      ],
    },
  ],
};
