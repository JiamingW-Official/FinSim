import type { Unit } from "./types";

export const UNIT_HEDGE_FUNDS: Unit = {
  id: "hedge-funds",
  title: "Hedge Fund Strategies",
  description:
    "Master long/short equity, global macro, event-driven, and quant strategies used by the world's top hedge funds",
  icon: "🎯",
  color: "#dc2626",
  lessons: [
    // ─── Lesson 1: Hedge Fund Basics ─────────────────────────────────────────────
    {
      id: "hf-1",
      title: "🎯 Hedge Fund Basics",
      description:
        "Pooled investment vehicles, accredited investors, 2/20 fee structures, and long/short equity fundamentals",
      icon: "Building2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🏛️ What Is a Hedge Fund?",
          content:
            "A **hedge fund** is a pooled investment vehicle for sophisticated investors, operating with far fewer restrictions than mutual funds.\n\n**Who can invest?**\nOnly **accredited investors** — individuals with >$1M net worth (excluding primary residence) OR >$200K annual income ($300K joint). Institutional investors (endowments, pensions) also qualify.\n\n**Fee structure — the famous \"2/20\":**\n- **Management fee**: 2% of AUM per year (covers operating costs)\n- **Performance fee**: 20% of profits above a hurdle rate (typically 8%)\n- Example: $1B fund, 15% return → $20M management fee + $14M performance fee (20% of $70M above hurdle)\n\n**Liquidity restrictions:**\n- **Lock-up periods**: Investors cannot redeem for 1–2 years after investing\n- **Gates**: Fund can limit redemptions to 10–25% of NAV per quarter during stress\n- **Notice periods**: Typically 30–90 days required before redemption\n\n**AUM concentration**: The top 10 hedge funds manage 50%+ of the ~$5T industry AUM. Bridgewater, Man Group, Renaissance, AQR, and Citadel dominate.",
          highlight: ["accredited investors", "2/20", "lock-up periods", "gates", "AUM"],
        },
        {
          type: "teach",
          title: "📋 Regulatory Framework",
          content:
            "Hedge funds operate under a patchwork of regulations that give them flexibility while requiring transparency to regulators.\n\n**Dodd-Frank Act (2010):**\nPost-financial-crisis US law requiring hedge funds with >$150M AUM to register with the SEC as Investment Advisers.\n\n**Form PF (Private Fund):**\nLarge advisers (>$1.5B) must file quarterly reports disclosing strategy, leverage, counterparties, and liquidity risk to the Financial Stability Oversight Council (FSOC).\n\n**AIFMD (EU):**\nAlternative Investment Fund Managers Directive — EU equivalent requiring authorization, disclosure, and remuneration caps for funds marketing to EU investors.\n\n**Long/Short Equity — the most common strategy:**\n- **Buy** undervalued stocks (long) + **Short** overvalued stocks\n- Can be **market-neutral** (equal long/short) or carry net long/short exposure\n- Most hedge funds run 40–80% net long exposure\n\n**Gross vs Net Exposure:**\n- **Gross exposure** = |longs| + |shorts| → total leverage\n- **Net exposure** = longs − shorts → directional market bet\n- A 150% gross / 50% net fund: 100% long + 50% short positions",
          highlight: ["Dodd-Frank", "Form PF", "AIFMD", "long/short equity", "gross exposure", "net exposure"],
        },
        {
          type: "quiz-mc",
          question:
            "A hedge fund has 150% gross exposure and 50% net exposure. What does its portfolio look like?",
          options: [
            "100% long + 50% short positions",
            "150% long + 0% short positions",
            "75% long + 75% short positions",
            "50% long + 100% short positions",
          ],
          correctIndex: 0,
          explanation:
            "Gross = |longs| + |shorts| = 150%, Net = longs – shorts = 50%. Solving: longs = 100%, shorts = 50%. The fund holds 100% long and 50% short, giving 150% gross and +50% net (moderately long-biased).",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A hedge fund's 20% performance fee applies to all profits, regardless of any hurdle rate.",
          correct: false,
          explanation:
            "False. Performance fees typically apply only to profits above a hurdle rate (commonly 8%). If the fund returns 15%, the 20% performance fee applies only to the 7% above the hurdle — not the full 15%. High-water marks also prevent fees on recovering prior losses.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A $500M hedge fund returns 25% in a year. The fund charges a 2% management fee and 20% performance fee with an 8% hurdle rate. Assume the high-water mark is at the prior year's NAV (no recovery needed).",
          question: "What are the total fees paid by investors?",
          options: [
            "$10M management fee + $17M performance fee = $27M total",
            "$10M management fee + $25M performance fee = $35M total",
            "$12.5M management fee + $17M performance fee = $29.5M total",
            "$10M management fee + $20M performance fee = $30M total",
          ],
          correctIndex: 0,
          explanation:
            "Management fee = 2% × $500M = $10M. Performance fee applies to returns above 8% hurdle: 25% – 8% = 17% excess return on $500M = $85M in excess profit. Performance fee = 20% × $85M = $17M. Total fees = $27M.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Long/Short Equity & Market Neutral ─────────────────────────────
    {
      id: "hf-2",
      title: "📈 Long/Short Equity & Market Neutral",
      description:
        "Fundamental and statistical L/S, market-neutral construction, 130/30 funds, and sector rotation",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🔍 Fundamental vs Statistical Long/Short",
          content:
            "**Long/Short Equity** is the most prevalent hedge fund strategy, but the implementation varies widely.\n\n**Fundamental L/S:**\n- Analysts do deep company research — financial modeling, management meetings, supply chain checks\n- Hold periods: months to years\n- Conviction-weighted portfolios: 10–50 positions\n- Example: Long AAPL (undervalued vs growth), short a competitor with deteriorating margins\n- Famous practitioners: Tiger Global, Viking Global, Coatue\n\n**Statistical L/S (Quant L/S):**\n- Uses mathematical models to find mean-reverting pairs or factor anomalies\n- Hold periods: days to weeks\n- Hundreds to thousands of positions, each small\n- Pairs trading: long Coke, short Pepsi when spread diverges from historical norm\n- Signal sources: price momentum, earnings revisions, short interest changes\n\n**Key metrics for both:**\n- **Alpha**: return attributable to stock selection (not market exposure)\n- **Beta**: sensitivity to the overall market\n- **Sharpe ratio**: risk-adjusted return = (Return – Risk-free rate) / Volatility",
          highlight: ["fundamental L/S", "statistical L/S", "pairs trading", "alpha", "beta", "Sharpe ratio"],
        },
        {
          type: "teach",
          title: "⚖️ Market Neutral, 130/30 & Sector Rotation",
          content:
            "**Market Neutral:**\n- Portfolio constructed so beta ≈ 0 — pure alpha, no market exposure\n- Dollar-neutral: equal $ longs and shorts\n- Beta-neutral: more common — adjusts for different betas (e.g., short more of a high-beta stock)\n- Returns driven entirely by stock selection skill\n- Typically lower volatility, lower returns than directional funds\n\n**130/30 Fund:**\n- 130% long, 30% short — a compromise structure\n- Allows amplified long exposure while using short proceeds to fund extra longs\n- Available to retail investors (registered funds)\n- Net exposure = 100% (still fully invested in the market)\n- Benefits: enhances return from shorting while maintaining full market participation\n\n**Sector Rotation L/S:**\n- Long the sector with the best fundamental outlook\n- Short the sector with the worst outlook\n- Example: Long energy (supply deficit), short consumer discretionary (rising rates)\n- Timing driven by economic cycle analysis (expansion → late cycle → recession → recovery)\n- Removes single-stock risk, retains sector thesis",
          highlight: ["market neutral", "beta-neutral", "130/30", "sector rotation", "dollar-neutral"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the main goal of a 'market neutral' hedge fund?",
          options: [
            "Generate returns independent of market direction — pure alpha, no beta",
            "Maximize gross returns by using maximum leverage",
            "Track the S&P 500 with lower fees than index funds",
            "Hedge currency risk in international portfolios",
          ],
          correctIndex: 0,
          explanation:
            "Market neutral funds construct portfolios with beta ≈ 0, meaning their returns are uncorrelated with overall market movements. They aim to generate pure alpha from stock selection — buying the best stocks and shorting the worst — regardless of whether the market goes up or down.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A 130/30 fund has a net market exposure of 160% because it holds 130% longs and 30% shorts.",
          correct: false,
          explanation:
            "False. Net exposure = longs – shorts = 130% – 30% = 100%. A 130/30 fund is fully invested in the market (100% net long), just like a traditional long-only fund. The gross exposure is 160%, but the net directional bet is 100%.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A market-neutral fund holds $50M long in Stock A (beta 1.2) and needs to hedge away all market risk using Stock B (beta 0.8). How much should it short of Stock B to achieve beta-neutral positioning?",
          question: "What dollar amount of Stock B should be shorted?",
          options: [
            "$75M — because $50M × 1.2 / 0.8 = $75M short needed",
            "$50M — equal dollar amounts for dollar-neutral",
            "$60M — using 1.2× leverage on the short side",
            "$40M — because Stock B has lower beta so needs less",
          ],
          correctIndex: 0,
          explanation:
            "Beta-neutral requires: long beta exposure = short beta exposure. Long exposure = $50M × 1.2 = $60M of beta. To offset with Stock B (beta 0.8): $60M / 0.8 = $75M short in Stock B. Beta-neutral ≠ dollar-neutral when betas differ.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Global Macro & CTA ────────────────────────────────────────────
    {
      id: "hf-3",
      title: "🌍 Global Macro & CTA",
      description:
        "Top-down macro bets on currencies, rates, and commodities — plus trend-following CTA strategies",
      icon: "Globe",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🌐 Global Macro: Top-Down Bets on the World",
          content:
            "**Global Macro** funds make large directional bets on macroeconomic trends using derivatives, currencies, interest rates, equities, and commodities.\n\n**Investment process:**\n- Analyze GDP growth, inflation, central bank policy, geopolitics, and capital flows\n- Express views through futures, options, FX forwards, and interest rate swaps\n- Typically use high leverage (5–10× or more) on liquid instruments\n\n**Famous macro trades:**\n- **Soros / Druckenmiller 1992**: Shorted the British pound (GBP) — the UK couldn't maintain its ERM peg given low growth and high rates. Made ~$1B in a day when UK was forced to devalue. \"Breaking the Bank of England.\"\n- **Michael Burry 2005–2008**: Bought CDS (credit default swaps) on mortgage-backed securities — betting the US housing market would collapse. Documented in *The Big Short*. Fund made 489% while markets crashed.\n\n**Risk Parity Macro (Bridgewater All Weather):**\n- Equal risk contribution across asset classes (stocks, bonds, commodities, gold)\n- Designed to perform in any economic environment\n- AUM: ~$150B — largest hedge fund by AUM",
          highlight: ["global macro", "GBP short", "CDS", "risk parity", "Bridgewater"],
        },
        {
          type: "teach",
          title: "📈 CTA / Trend Following & Carry Trade",
          content:
            "**CTA (Commodity Trading Advisors)** are systematic traders that follow rules-based strategies across all asset classes.\n\n**Trend Following:**\n- Most common CTA strategy — go long assets in uptrends, short in downtrends\n- Assets: futures on equities, bonds, currencies, commodities\n- Typical signals: 50-day vs 200-day moving average crossovers, momentum indicators\n- Works best in persistent trending markets; struggles in choppy/mean-reverting markets\n- Famous CTAs: Man AHL, Winton, Campbell & Company\n\n**Why trend following diversifies:**\n- Low correlation to stocks and bonds long-term\n- Tends to perform well in crisis periods when trends persist (2008, 2022)\n- Acts as a \"crisis alpha\" hedge in diversified portfolios\n\n**Carry Trade in Macro:**\n- **Long** high-yield currencies (e.g., AUD, BRL) that pay high interest rates\n- **Short** low-yield currencies (e.g., JPY, CHF) that pay near-zero rates\n- Profit = interest rate differential (the \"carry\")\n- Risk: **carry trade unwind** — sudden reversal when risk-off sentiment spikes\n- 2008: Yen carry unwind caused massive JPY appreciation as investors unwound positions",
          highlight: ["CTA", "trend following", "carry trade", "crisis alpha", "carry unwind"],
        },
        {
          type: "quiz-mc",
          question:
            "What is 'trend following' in the context of CTA hedge funds?",
          options: [
            "Systematic strategy that goes long assets in uptrends and short assets in downtrends",
            "Following insider trading signals from corporate executives",
            "Buying stocks that trend on social media platforms",
            "Replicating the portfolio of the most successful hedge fund managers",
          ],
          correctIndex: 0,
          explanation:
            "Trend following is a rules-based systematic strategy. CTAs buy (go long) futures on assets that are trending up and sell (go short) assets trending down, across equities, bonds, currencies, and commodities. Signals are typically based on price momentum indicators like moving average crossovers.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The carry trade always generates profit because you simply collect the interest rate differential between currencies.",
          correct: false,
          explanation:
            "False. The carry trade earns the interest rate differential during calm markets, but faces severe risk during 'risk-off' periods when investors unwind positions simultaneously. In 2008, the JPY carry trade reversed violently — the yen appreciated 30%+ against the Australian dollar in weeks, wiping out years of carry profits.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A global macro fund believes the US Federal Reserve will raise rates much faster than the European Central Bank. They want to express this view using currency and bond markets.",
          question: "Which trade best expresses this macro thesis?",
          options: [
            "Long USD / short EUR in FX, and short US Treasuries / long German Bunds in rates",
            "Long EUR / short USD in FX, and long US Treasuries / short German Bunds",
            "Long both USD and EUR against emerging market currencies",
            "Short USD and buy gold as an inflation hedge",
          ],
          correctIndex: 0,
          explanation:
            "Faster US rate hikes → USD strengthens (capital flows to higher-yield USD assets) → Long USD / Short EUR. Higher US rates also mean lower bond prices → Short US Treasuries. German Bunds rally if ECB stays accommodative → Long Bunds. Both legs reinforce the same macro thesis: US tightening faster than Europe.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Event-Driven & Special Situations ──────────────────────────────
    {
      id: "hf-4",
      title: "⚡ Event-Driven & Special Situations",
      description:
        "Merger arbitrage, distressed debt, activist investing, and SPAC arbitrage",
      icon: "Zap",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🤝 Merger Arbitrage",
          content:
            "**Merger arbitrage** (risk arb) captures the spread between a deal announcement price and the current trading price of the target.\n\n**How it works:**\n- After M&A announcement, target stock usually trades *below* the offer price\n- The gap = deal risk premium (compensation for deal-break risk)\n- Arb funds go **long the target** (and often **short the acquirer** in stock deals)\n\n**Deal math example:**\n- Target stock: $100 pre-announcement\n- Acquirer announces $110 cash bid\n- Target now trades at $106\n- Potential gain: $110 – $106 = **$4 (3.8%)** if deal closes in ~3 months\n- Annualized return: ~15% (if no complications)\n- Risk: Deal breaks → target falls back toward $90 → **$16 loss**\n\n**Key risks:**\n- Regulatory rejection (DOJ/FTC antitrust)\n- Financing failure (acquirer can't raise debt)\n- Material Adverse Change (MAC) clause invocations\n- Shareholder vote failure\n\n**Gross spread** = Offer Price – Current Price\n**Net spread** = adjusts for dividends, time value, and deal probability",
          highlight: ["merger arbitrage", "deal spread", "deal break", "antitrust", "MAC clause"],
        },
        {
          type: "teach",
          title: "💸 Distressed Debt & Activist Investing",
          content:
            "**Distressed debt investing:**\n- Buy bonds of bankrupt or near-bankrupt companies at steep discounts (10–50 cents on the dollar)\n- Thesis: market over-discounts bankruptcy risk; recovery value is higher than implied by price\n- Requires deep legal expertise in restructuring, Chapter 11 bankruptcy, and creditor rights\n- Outcome: company restructures, bonds convert to equity, investors profit if recovery > purchase price\n- Famous practitioners: Oaktree Capital (Howard Marks), Baupost, Elliott Management\n\n**Example:**\nBuy $100M face-value bonds at 30 cents = $30M invested\nAfter restructuring: recover 55 cents = $55M → 83% gain\n\n**Activist investing:**\n- Buy a large stake (5–15%) in an undervalued public company\n- File **13D** with SEC (disclosure required above 5%)\n- Publicly demand changes: replace CEO, sell non-core assets, return cash, or sell the company\n- Famous activists: Carl Icahn, Elliott Management, Bill Ackman (Pershing Square)\n\n**SPAC arbitrage:**\n- Buy SPACs at or slightly below trust value ($10/unit)\n- Earn risk-free return equal to T-bill rate while waiting for merger announcement\n- Capture upside if a strong deal is announced\n- Can redeem at trust value if deal is unattractive — limited downside",
          highlight: ["distressed debt", "Chapter 11", "activist investing", "13D", "SPAC arbitrage"],
        },
        {
          type: "quiz-mc",
          question:
            "In merger arbitrage, what happens to the trade if the deal breaks?",
          options: [
            "Significant loss — target stock falls back toward its pre-announcement price",
            "Small gain — the spread widens but closes quickly",
            "No impact — merger arb is hedged against deal failure",
            "Large gain — deal-break creates buying opportunity",
          ],
          correctIndex: 0,
          explanation:
            "If a deal breaks, the target company stock typically falls sharply back toward (or below) its pre-announcement price, as the M&A premium disappears. In the example where the target was at $100 pre-deal and the arb fund bought at $106, a deal break could result in a fall to $90 — a $16 loss versus a potential $4 gain. This asymmetric risk is why arb funds analyze deal probability carefully.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Activist hedge funds typically buy small stakes of under 1% in target companies to avoid triggering SEC disclosure requirements.",
          correct: false,
          explanation:
            "False. Activist funds typically build meaningful stakes of 5–15% to gain influence over management. Once they cross 5%, they must file a **Schedule 13D** with the SEC within 10 days, publicly disclosing their stake and intentions. This disclosure itself often moves the stock price and forces management to respond.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Company A (trading at $80) is acquired by Company B for $100 in cash. After the announcement, Company A's stock trades at $95. A merger arb fund buys $10M worth of Company A stock at $95. The deal is expected to close in 4 months. There is a 15% probability the deal breaks, in which case Company A falls back to $80.",
          question: "What is the expected value of this trade?",
          options: [
            "Positive: 85% chance of $526K gain vs 15% chance of $1.58M loss = net +$210K expected",
            "Negative: deal-break risk exceeds the spread earned",
            "Break-even: the probabilities exactly offset the spread",
            "Highly positive: $526K certain gain with minimal deal risk",
          ],
          correctIndex: 0,
          explanation:
            "Gain if deal closes: $10M × ($100–$95)/$95 = $526K (85% probability → $447K expected). Loss if deal breaks: $10M × ($80–$95)/$95 = –$1.58M (15% probability → –$237K expected). Net expected value = $447K – $237K = +$210K. Positive but modest — reflects the asymmetric risk of merger arb.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Quant & Multi-Strategy ────────────────────────────────────────
    {
      id: "hf-5",
      title: "🤖 Quant & Multi-Strategy",
      description:
        "HFT, statistical arbitrage, Renaissance Technologies model, risk management, and alternative risk premia",
      icon: "Cpu",
      xpReward: 105,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "⚡ High-Frequency Trading & Statistical Arbitrage",
          content:
            "**High-Frequency Trading (HFT):**\n- Executes millions of trades per day at microsecond speed\n- Strategies: market making (earning bid-ask spread), latency arbitrage (exploiting price differences across exchanges), momentum ignition\n- Co-location: servers placed in exchange data centers to minimize latency\n- Firms: Virtu Financial, Citadel Securities, Jane Street\n- Revenue: capturing tiny edges millions of times — not about prediction, about speed and consistency\n\n**Statistical Arbitrage (StatArb):**\n- Exploits mean-reverting price relationships between related securities\n- **Pairs trading**: long Stock A, short Stock B when their price spread diverges beyond historical norms → profit when spread reverts\n- **Factor-neutral portfolios**: remove exposure to market, size, value, momentum factors — trade pure idiosyncratic alpha\n- **ETF arbitrage**: when an ETF price deviates from its NAV, authorized participants create/redeem shares to close the gap\n- Hold periods: minutes to days\n- Large universe of positions, each small — diversification is key\n\n**Sharpe ratio benchmarks:**\n- Long-only equity: Sharpe ~0.5\n- Quality hedge fund: Sharpe ~1.0\n- Elite quant fund: Sharpe ~2.0+\n- Renaissance Medallion (closed to outsiders): reportedly Sharpe ~3.0+",
          highlight: ["HFT", "market making", "statistical arbitrage", "pairs trading", "Sharpe ratio"],
        },
        {
          type: "teach",
          title: "🏗️ Multi-Strategy & Risk Management",
          content:
            "**Multi-Strategy funds** run dozens of uncorrelated strategies simultaneously — the **Renaissance Technologies model**.\n\n**Why multi-strat works:**\n- Diversification across strategies reduces volatility without reducing expected return\n- Drawdown in one strategy offset by gains in others\n- Portfolio-level Sharpe ratio can exceed any individual strategy's Sharpe\n- Examples: Citadel, Millennium, Point72, DE Shaw\n\n**Renaissance Technologies (Medallion Fund):**\n- Runs 100s of short-term quantitative strategies\n- ~66% annual return (before fees) from 1988–2018\n- Closed to outside investors since 1993 — fund only for employees\n- Uses pattern recognition, signal processing, and machine learning on vast historical datasets\n\n**Quant fund risk management:**\n- **Daily VaR limits**: maximum loss per day at 99% confidence (e.g., $50M VaR limit)\n- **Drawdown-based deleveraging**: if fund draws down 5%, reduce leverage by 25%; at 10%, reduce by 50%\n- **Strategy correlation monitoring**: if strategies become correlated (crowded trades), reduce exposure\n- **Gross exposure limits**: cap total notional to prevent excessive leverage\n\n**Alternative Risk Premia (ARP):**\nSystematic, rules-based strategies capturing known factor premiums:\n- **Momentum**: buy recent winners, short recent losers\n- **Carry**: buy high-yield assets, short low-yield\n- **Quality**: long profitable, low-leverage companies\n- **Low volatility**: long low-beta stocks (counter-intuitive outperformance)",
          highlight: ["multi-strategy", "Renaissance Technologies", "VaR", "drawdown deleveraging", "alternative risk premia"],
        },
        {
          type: "quiz-mc",
          question:
            "What is 'statistical arbitrage' in quant hedge funds?",
          options: [
            "Trading pairs or groups of securities to exploit mean-reverting price relationships",
            "Using statistical models to predict Federal Reserve interest rate decisions",
            "Arbitraging differences between stock prices and analyst price targets",
            "Buying undervalued stocks identified by statistical screening of fundamentals",
          ],
          correctIndex: 0,
          explanation:
            "Statistical arbitrage exploits mean-reverting price relationships between related securities. In pairs trading (the simplest form), when two historically correlated stocks diverge in price, the fund buys the laggard and shorts the leader, betting the spread will revert to its historical norm. Factor-neutral portfolios extend this to hundreds of securities simultaneously.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Multi-strategy hedge funds like Citadel and Millennium aim to have high correlation between their individual strategies to maximize returns during bull markets.",
          correct: false,
          explanation:
            "False. Multi-strategy funds actively seek LOW correlation between their strategies. The power of multi-strat is diversification — when strategies are uncorrelated, the portfolio Sharpe ratio improves dramatically. High inter-strategy correlation would defeat the purpose, concentrating risk rather than spreading it across independent alpha sources.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A quant fund runs three strategies: Strategy A (Sharpe 1.2, annual vol 8%), Strategy B (Sharpe 0.9, annual vol 12%), and Strategy C (Sharpe 1.5, annual vol 6%). All three strategies have zero correlation with each other. Each strategy is allocated equal capital.",
          question: "What best describes the portfolio-level risk profile compared to the individual strategies?",
          options: [
            "Portfolio Sharpe will be higher than any individual strategy — uncorrelated diversification reduces vol more than it reduces returns",
            "Portfolio Sharpe will equal the average of the three strategies (1.2)",
            "Portfolio Sharpe will be lower — combining strategies always increases risk",
            "Portfolio vol will be the average of the three strategy vols (8.7%)",
          ],
          correctIndex: 0,
          explanation:
            "With zero correlation, combining strategies dramatically reduces portfolio volatility (vols add in quadrature: √(8²+12²+6²)/3 ≈ 5.5% vs 8.7% simple average), while expected returns average. This increases the portfolio Sharpe ratio above any individual strategy — the core reason multi-strategy funds are so capital-efficient. This is the quantitative proof of diversification as 'the only free lunch in investing'.",
          difficulty: 3,
        },
      ],
    },
  ],
};
