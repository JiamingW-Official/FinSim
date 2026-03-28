import type { Unit } from "./types";

export const UNIT_ASSET_ALLOCATION: Unit = {
  id: "asset-allocation-frameworks",
  title: "Asset Allocation Frameworks",
  description:
    "Master the principles and methods that institutional and individual investors use to construct durable, risk-aware portfolios — from strategic long-term policy weights and the Yale Endowment model to risk parity, factor investing, lifecycle glide paths, and building your own Investment Policy Statement",
  icon: "🗂️",
  color: "#0f766e",
  lessons: [
    // ─── Lesson 1: Strategic vs Tactical Asset Allocation ────────────────────────
    {
      id: "asset-allocation-1",
      title: "🗺️ Strategic vs Tactical Asset Allocation",
      description:
        "Understand the difference between long-term policy weights (SAA) and short-term opportunistic tilts (TAA), how rebalancing keeps the portfolio on target, and why discipline matters more than cleverness",
      icon: "Map",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Strategic Asset Allocation — The Policy Portfolio",
          content:
            "**Strategic Asset Allocation (SAA)** is the long-term target mix of asset classes that reflects an investor's goals, risk tolerance, time horizon, and liabilities. It is sometimes called the **policy portfolio** — a benchmark that the investor commits to maintain over full market cycles.\n\n**Why SAA is the most important decision:**\nResearch consistently shows that roughly 90% of a portfolio's return variability over time is explained by its asset class mix, not by security selection or market timing. Getting SAA right matters far more than picking the best individual stocks.\n\n**Typical SAA examples:**\n- **Conservative (60/40)**: 60% bonds, 40% equities — capital preservation focus\n- **Balanced (60/40)**: 60% equities, 40% bonds — the classic institutional default\n- **Growth (80/20)**: 80% equities, 20% bonds — for long time horizons\n- **Aggressive (100/0)**: 100% equities — for investors with 20+ year horizons who can tolerate full drawdowns\n\n**How SAA weights are determined:**\n1. **Liability matching**: Pension funds set SAA so assets mature when liabilities are due\n2. **Return objectives**: What return is needed to meet the investor's goals?\n3. **Risk capacity**: How much drawdown can the investor financially survive?\n4. **Risk tolerance**: How much drawdown can the investor emotionally survive?\n5. **Constraints**: Liquidity needs, regulatory restrictions, tax considerations\n\n**The key principle:** SAA weights should be stable through market cycles. Changing them based on market conditions blurs the line between strategic and tactical — and opens the door to emotional, poorly-timed decisions.",
          highlight: ["strategic asset allocation", "policy portfolio", "risk tolerance", "asset class mix", "return variability"],
        },
        {
          type: "teach",
          title: "Tactical Asset Allocation — Opportunistic Tilts",
          content:
            "**Tactical Asset Allocation (TAA)** involves deliberately deviating from SAA weights in the short term to exploit perceived mispricings, macro opportunities, or risk management needs. TAA is the active overlay on top of the passive SAA foundation.\n\n**How TAA differs from SAA:**\n| Dimension | SAA | TAA |\n|-----------|-----|-----|\n| Time horizon | 5–30 years | Weeks to 2 years |\n| Driver | Goals & risk profile | Market valuation & macro signals |\n| Frequency | Rarely changes | Actively managed |\n| Purpose | Framework | Alpha generation |\n\n**Common TAA signals:**\n- **Valuation**: Overweight equities when CAPE ratios are cheap vs history; underweight when expensive\n- **Momentum**: Tilt toward asset classes with positive 6–12 month price momentum\n- **Macro regime**: Shift toward inflation-protected assets when CPI is accelerating\n- **Credit spreads**: When high-yield spreads are wide (>600bps), it often precedes equity recovery — TAA could increase risk exposure\n\n**TAA bands (typical):**\nMost institutional investors set maximum deviation limits around SAA. For example:\n- SAA equity: 60% → TAA range: 50%–70%\n- SAA bonds: 30% → TAA range: 20%–40%\n\n**The evidence on TAA:**\nAcademic research is mixed. Simple, systematic TAA rules (like trend following) have shown modest long-run benefits. Discretionary TAA — portfolio managers making judgment calls — has a poor aggregate track record after costs. TAA is a double-edged sword: it can add value but also introduces the risk of wrong-way tilts at exactly the wrong time.",
          highlight: ["tactical asset allocation", "TAA", "mispricings", "valuation", "TAA bands", "trend following"],
        },
        {
          type: "teach",
          title: "Rebalancing — Maintaining the Policy Portfolio",
          content:
            "**Rebalancing** is the process of periodically adjusting portfolio weights back to SAA targets after market movements have caused drift. Without rebalancing, a portfolio's actual risk profile silently diverges from the investor's intended profile.\n\n**Why drift happens:**\nIf equities return 20% and bonds return 3% in a year, a 60/40 portfolio drifts to roughly 65/35 — creating higher equity exposure than intended. If a bear market then hits, the investor suffers more drawdown than they signed up for.\n\n**Rebalancing approaches:**\n1. **Calendar rebalancing**: Rebalance at fixed intervals (monthly, quarterly, annually). Simple and predictable. Annual rebalancing has been shown to be nearly as effective as monthly for most portfolios.\n2. **Threshold rebalancing**: Rebalance when any asset class drifts beyond a set band (e.g., ±5% from target). More responsive to actual drift but requires monitoring.\n3. **Hybrid approach**: Calendar check + threshold trigger — the most common institutional practice.\n\n**The hidden benefit of rebalancing — a disciplined contrarian signal:**\nRebalancing forces you to sell what has recently outperformed (expensive) and buy what has recently underperformed (cheap). It is systematic contrarianism — the opposite of return-chasing.\n\n**Rebalancing costs and frictions:**\n- **Transaction costs**: Brokerage commissions and bid-ask spreads\n- **Tax drag**: In taxable accounts, selling winners triggers capital gains\n- **Cash flow optimization**: Use new contributions or dividends to rebalance without selling, minimizing costs\n\n**Threshold guidance:** A common rule is to rebalance when an asset class is more than 5% (absolute) or 25% (relative) away from its target — i.e., a 20% equity target would trigger at 15% or below, or 25% or above.",
          highlight: ["rebalancing", "drift", "calendar rebalancing", "threshold rebalancing", "contrarian", "tax drag"],
        },
        {
          type: "quiz-mc",
          question:
            "A pension fund has a Strategic Asset Allocation of 55% equities and 45% bonds. After a strong equity rally, the portfolio sits at 64% equities and 36% bonds. Which description best characterizes this situation and the appropriate response?",
          options: [
            "Portfolio drift has increased equity risk beyond the policy target; rebalancing requires selling equities and buying bonds to restore the 55/45 target",
            "The portfolio has improved because equities are outperforming; the weights should be left as-is to continue capturing equity momentum",
            "Tactical asset allocation has been successfully applied; no action is needed until equities fall back to 55%",
            "The bonds have underperformed and should be replaced with higher-returning assets to return to target weights",
          ],
          correctIndex: 0,
          explanation:
            "After equity outperformance, the portfolio has drifted from its strategic target to a higher-equity, higher-risk profile. This is classic portfolio drift. Rebalancing — selling equities and buying bonds — restores the intended risk profile. Note that rebalancing is contrarian by nature: you are selling the asset class that recently did well and buying the one that underperformed. This discipline is one of the key value-adds of a structured SAA process.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Tactical Asset Allocation has consistently demonstrated superior risk-adjusted returns versus simply holding a static Strategic Asset Allocation, making it an essential component for all investors.",
          correct: false,
          explanation:
            "The evidence on TAA is mixed at best. Simple, systematic TAA rules (trend following, momentum) have shown modest long-term benefits. Discretionary TAA — active judgment calls by portfolio managers — has a poor aggregate track record after fees and implementation costs. For most individual investors, a disciplined SAA with systematic rebalancing outperforms active TAA attempts. TAA also introduces behavioral risk: market-timing errors that lock in losses and miss recoveries. TAA can add value when applied systematically and with discipline, but it is certainly not essential for all investors.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria manages a $500,000 portfolio with a SAA target of 60% equities ($300k) and 40% bonds ($200k). She uses a ±5% absolute threshold for rebalancing. After a period of equity outperformance, her portfolio is now 68% equities ($340k) and 32% bonds ($160k). Her investment policy also allows TAA tilts of up to ±8% around the SAA target.",
          question: "What should Maria do?",
          options: [
            "Rebalance by selling $40k of equities and buying $40k of bonds to restore the 60/40 SAA target",
            "Apply a TAA tilt and hold the 68/32 position since it is within the ±8% TAA band",
            "Increase equity allocation further to 76% because equities are showing strong momentum",
            "Liquidate the entire portfolio and wait for a market correction before reinvesting",
          ],
          correctIndex: 0,
          explanation:
            "The portfolio has drifted 8 percentage points above the equity SAA target (60% + 5% threshold = 65% — already exceeded). Even though the TAA band allows up to 68% (60% + 8%), the rebalancing threshold was breached first at 65%. The SAA policy portfolio is the primary framework; TAA tilts are intentional active decisions, not passive acceptance of drift. Maria should rebalance to restore the 60/40 target by selling $40k in equities and deploying the proceeds into bonds. She can then separately decide whether to apply an intentional TAA tilt.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: The Yale Endowment Model ──────────────────────────────────────
    {
      id: "asset-allocation-2",
      title: "🎓 The Yale Endowment Model",
      description:
        "Explore David Swensen's revolutionary approach to institutional investing — heavy alternatives allocation, the illiquidity premium, private equity, and why endowments can afford to think differently than retail investors",
      icon: "GraduationCap",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Swensen's Revolution — Rethinking Institutional Portfolios",
          content:
            "In 1985, David Swensen took over Yale's endowment with $1 billion under management. By 2022, the endowment had grown to $42 billion — one of the greatest track records in institutional investing history, averaging roughly 13.7% annualized for four decades.\n\n**The traditional endowment model (pre-Swensen):**\nMost university endowments in the 1980s held primarily domestic stocks and bonds — a simple 60/40 or 70/30 portfolio. This mirrored retail investor thinking and offered limited diversification.\n\n**Swensen's core insight:**\nTraditional stocks and bonds are liquid, transparent, and heavily analyzed — all of which means they are fairly priced. To earn excess returns, investors need to go where others cannot or will not go. For investors with long time horizons (endowments fund universities indefinitely), **illiquidity is a feature, not a bug**.\n\n**The paradigm shift:**\nSwensen argued that institutional investors with long time horizons and no need for near-term liquidity should:\n1. Accept illiquidity in exchange for a return premium\n2. Diversify broadly across asset classes with low correlations\n3. Prioritize real assets that hedge inflation\n4. Seek active management only in markets where information advantages exist (primarily private markets)\n5. Avoid active management in efficient public markets (use index funds instead)\n\n**The revolutionary result:**\nYale's 2023 target allocation: ~39% alternatives (private equity + venture capital), ~23% absolute return, ~14% real assets, ~12% foreign equity, ~7% bonds/cash, ~5% leveraged buyouts — a near-total rejection of the traditional bond-heavy model.",
          highlight: ["David Swensen", "Yale endowment", "illiquidity premium", "alternatives", "long time horizon"],
        },
        {
          type: "teach",
          title: "The Illiquidity Premium — Getting Paid to Wait",
          content:
            "The **illiquidity premium** is the extra return that investors earn for accepting assets they cannot easily sell. It is one of the most reliable and persistent risk premiums in investing.\n\n**Why illiquidity premiums exist:**\n- Many investors — retail individuals, regulated institutions, open-end mutual funds — need to be able to sell their holdings at any time\n- This need for liquidity forces them to pay a premium for liquid assets and accept lower returns\n- Investors who do NOT need daily liquidity can collect that premium by buying illiquid assets\n\n**Estimates of the illiquidity premium:**\n- **Private equity vs public equity**: Historically 2–4% annualized (before manager selection effects)\n- **Private credit vs public high-yield**: 1–2.5% annualized spread\n- **Direct real estate vs REITs**: 1–2% annualized\n- **Venture capital vs public small-cap growth**: Highly variable; 0–5%+ depending on vintage and manager\n\n**The Yale conditions for capturing the illiquidity premium:**\nNot every investor can capture this premium. You need:\n1. **Long time horizon**: Endowments have infinite time horizons; retirement savers have 20–40 year horizons\n2. **Stable capital base**: Yale's endowment is not subject to redemptions; a hedge fund facing investor withdrawals cannot lock up capital\n3. **Manager access**: Top private equity and venture capital funds are oversubscribed — Yale's relationships matter\n4. **Governance**: Strong investment committee oversight to avoid panic liquidations\n\n**The warning:** Illiquid investments do not protect against permanent capital loss — they only protect against forced selling at the wrong time. Yale famously needed to sell liquid assets at distressed prices during 2008–2009 because its illiquid commitments consumed cash.",
          highlight: ["illiquidity premium", "private equity", "venture capital", "stable capital base", "manager access"],
        },
        {
          type: "teach",
          title: "Asset Classes in the Yale Model",
          content:
            "The Yale Endowment Model uses six to eight broad asset class buckets, each serving a distinct role in the portfolio:\n\n**1. Domestic Equity (minimal)**\nYale holds very little US public equity — historically 10–15% and declining. Public markets are highly efficient; active management rarely adds value after costs. Yale uses passive index funds here.\n\n**2. Foreign Equity (developed + emerging)**\nProvides geographic diversification and exposure to different economic cycles. Emerging markets offer higher growth potential with higher volatility.\n\n**3. Private Equity & Venture Capital (~30–40%)**\nThe crown jewel of the Yale model. Early investments in Apple, Google, WhatsApp, and thousands of other companies generate venture capital returns. Buyout funds restructure established businesses. Key advantage: Yale's relationships with top managers (Sequoia, Andreessen Horowitz, KKR) are the competitive moat.\n\n**4. Absolute Return (~20%)**\nHedge fund strategies that target low correlation to equities. Yale focuses on event-driven and long/short equity strategies with genuine alpha potential — not simple beta disguised as alpha. Swensen is famously skeptical of most hedge funds.\n\n**5. Real Assets (~15%)**\nTimberland, oil and gas, farmland, infrastructure. These assets produce income, appreciate with inflation, and have essentially zero correlation to stock markets. Yale's timberland holdings were built over decades.\n\n**6. Fixed Income (minimal)**\nYale holds almost no traditional bonds — they are expensive stores of value with limited diversification benefits when you already hold real assets and absolute return strategies.\n\n**The replication problem:** Individual investors cannot replicate the Yale model. Minimum investment sizes for top private equity funds start at $5 million+. Endowments also benefit from scale, governance, and manager relationships unavailable to retail investors.",
          highlight: ["private equity", "venture capital", "absolute return", "real assets", "timberland", "replication problem"],
        },
        {
          type: "quiz-mc",
          question:
            "Why can the Yale Endowment hold 35–40% of its portfolio in illiquid private equity and venture capital, while a typical retail mutual fund cannot adopt a similar strategy?",
          options: [
            "Yale has a perpetual time horizon with no redemption obligations, while mutual funds must meet daily investor withdrawals",
            "Yale receives preferential tax treatment that makes illiquid investments more attractive than for retail investors",
            "Private equity returns are only available to tax-exempt institutions, making retail access impossible by law",
            "Yale's large asset base means it can always sell private investments to other endowments in a secondary market",
          ],
          correctIndex: 0,
          explanation:
            "The fundamental difference is the liability structure. Yale's endowment has no obligation to provide liquidity to investors — it funds university operations through an annual spending rate (~5%) from its large base, and the remainder stays invested indefinitely. Mutual funds must honor daily redemptions; if investors pull their money, the fund must sell holdings immediately. This structural constraint prevents mutual funds from holding illiquid investments that cannot be sold on short notice. Swensen explicitly built his model around Yale's unique structural advantage of patient, perpetual capital.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "David Swensen recommended that individual retail investors closely replicate the Yale Endowment model by allocating 30–40% to private equity and venture capital funds through available retail investment vehicles.",
          correct: false,
          explanation:
            "Swensen explicitly warned individual investors NOT to replicate the Yale model. In his book 'Unconventional Success,' he argued that retail investors should use low-cost index funds across diversified asset classes — not alternatives. His reasoning: retail investors lack access to top-tier private equity managers (the performance of mediocre PE managers is poor), face high fees in retail alternative products, and have shorter time horizons with real liquidity needs. Swensen believed the Yale model works because of Yale's structural advantages — perpetual capital, elite manager relationships, and sophisticated governance — not because of the asset class labels.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Risk Parity Basics ────────────────────────────────────────────
    {
      id: "asset-allocation-3",
      title: "⚖️ Risk Parity Basics",
      description:
        "Understand how risk parity allocates by volatility contribution rather than capital weight, the mechanics of Bridgewater's All Weather portfolio, and the role of leverage in risk parity strategies",
      icon: "Scale",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Equal Capital vs Equal Risk — The Core Distinction",
          content:
            "Traditional asset allocation distributes **dollars** equally across asset classes. Risk parity distributes **risk** equally. This distinction has profound consequences for portfolio behavior.\n\n**The problem with capital-weighted allocation:**\nConsider a classic 60/40 portfolio:\n- 60% equities, 40% bonds by capital weight\n- Equities are roughly 3–4× more volatile than bonds\n- Result: equities contribute roughly 85–90% of total portfolio RISK despite being only 60% of capital\n- The portfolio is functionally an equity portfolio with a bond hedge, not a balanced portfolio\n\n**In a severe equity bear market (2008, 2020):**\n- The 60% equity allocation can fall 40–50%, erasing 24–30 percentage points of total portfolio value\n- Bonds may rise modestly but cannot offset equity devastation\n- The portfolio is far more concentrated in equity risk than the 60/40 label implies\n\n**The risk parity solution:**\nInstead of allocating 60% capital to equities, allocate such that equities contribute only 25% of risk, bonds contribute 25%, commodities contribute 25%, and other assets contribute 25%.\n\nBecause bonds are much less volatile, achieving equal risk contribution means:\n- Bonds receive more capital weight than equities\n- Equities receive less capital weight than a traditional portfolio\n- The total capital weights often exceed 100% — implying the use of leverage\n\n**Risk Contribution Formula:**\nRisk contribution of asset i = w_i × σ_i × ρ_i,p\nwhere w_i is weight, σ_i is volatility, and ρ_i,p is correlation with the portfolio.\n\nIn a simple two-asset case, equal risk contribution means: w₁σ₁ = w₂σ₂ → weights are inversely proportional to volatility.",
          highlight: ["risk parity", "equal risk contribution", "capital weight", "volatility", "leverage"],
        },
        {
          type: "teach",
          title: "Bridgewater's All Weather Portfolio",
          content:
            "Ray Dalio of Bridgewater Associates developed the **All Weather** framework in 1996 as a portfolio designed to perform across all economic environments. It is the most famous practical implementation of risk parity thinking.\n\n**Dalio's four economic environments:**\nDalio argued that all economic regimes fall into one of four quadrants:\n1. **Growth rising, inflation rising**: Good for commodities and inflation-linked bonds (TIPS)\n2. **Growth rising, inflation falling**: Good for equities and corporate bonds\n3. **Growth falling, inflation rising**: Good for TIPS and commodities; bad for equities\n4. **Growth falling, inflation falling**: Good for nominal government bonds and gold\n\n**The All Weather logic:**\nEach asset class should shine in two of the four environments and struggle in two. Hold roughly equal risk allocations to assets in each quadrant so that portfolio performance is smoother regardless of which environment materializes.\n\n**The simplified All Weather allocation (popularized by Tony Robbins):**\n- 40% long-term US Treasury bonds\n- 30% US equities (S&P 500)\n- 15% intermediate-term US Treasury bonds\n- 7.5% gold\n- 7.5% commodities\n\n**Historical performance:** The simplified All Weather has delivered roughly 7–8% annualized returns with significantly lower drawdowns than a 60/40 portfolio — approximately half the maximum drawdown of equities during major bear markets.\n\n**The leverage question:**\nThe institutional All Weather uses leverage (approximately 1.5–2×) to boost returns while maintaining the risk-balanced structure. The simplified retail version avoids leverage but accepts lower absolute returns in exchange for simplicity and accessibility.\n\n**The 2022 challenge:** The All Weather model was significantly stress-tested in 2022 when both stocks AND bonds fell simultaneously (rising rates hurt bond prices). This correlation breakdown revealed a key assumption: the strategy requires bonds and equities to be negatively correlated — an assumption that can break in inflationary environments.",
          highlight: ["All Weather", "Bridgewater", "Ray Dalio", "four quadrants", "TIPS", "leverage"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor builds a two-asset risk parity portfolio with stocks (annual volatility 20%) and bonds (annual volatility 5%). What approximate capital weights achieve equal risk contribution?",
          options: [
            "20% stocks, 80% bonds",
            "50% stocks, 50% bonds",
            "80% stocks, 20% bonds",
            "60% stocks, 40% bonds",
          ],
          correctIndex: 0,
          explanation:
            "In a simple two-asset risk parity framework, weights are inversely proportional to volatility: w_stocks / w_bonds = σ_bonds / σ_stocks = 5/20 = 1/4. So stocks get 1 part and bonds get 4 parts: 20% stocks, 80% bonds. This ensures that stocks (with 4× the volatility of bonds) contribute equal dollar risk to the portfolio. Note that this is dramatically different from a traditional 60/40 allocation and explains why institutional risk parity strategies often use leverage — with only 20% in equities at unlevered weights, absolute returns would be too low to meet return targets.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Risk parity portfolios are specifically designed to eliminate the need for leverage because allocating more capital to bonds rather than equities inherently reduces total portfolio risk to safe levels.",
          correct: false,
          explanation:
            "Risk parity portfolios often REQUIRE leverage to achieve competitive absolute returns. Because risk parity allocates heavily to low-volatility assets (bonds) and lightly to high-volatility assets (equities), the unlevered portfolio has very low expected returns. Bridgewater's institutional All Weather uses roughly 1.5–2× leverage to scale up the risk-balanced portfolio to return levels comparable to traditional 60/40 portfolios. The leverage is applied evenly to maintain the risk balance — the goal is not to reduce total risk but to create a balanced risk structure that is then levered to the desired return target. Eliminating leverage from risk parity typically produces a portfolio with acceptable volatility but insufficient expected return.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An endowment has a $10 million portfolio currently allocated 70% equities ($7M) and 30% bonds ($3M). Equities have 18% annual volatility; bonds have 6% annual volatility. The investment committee is debating switching to a risk-parity approach. The chief investment officer notes that a strict risk parity unlevered portfolio would allocate approximately 25% equities and 75% bonds, resulting in a projected return of only 4.2% vs the current portfolio's projected 7.5%.",
          question: "What is the most appropriate institutional response to this return shortfall in a risk parity framework?",
          options: [
            "Apply modest leverage (~1.5-1.8x) to scale the risk-balanced portfolio to the desired return target while maintaining the risk balance",
            "Abandon risk parity and return to the 70/30 allocation since the return shortfall makes the strategy unviable",
            "Increase the equity allocation to 50% within the risk parity framework to boost projected returns",
            "Replace bonds with cash to achieve the same risk reduction effect without needing leverage",
          ],
          correctIndex: 0,
          explanation:
            "This is the classic risk parity dilemma, and the institutional solution is leverage. The risk parity framework correctly identifies that the unlevered portfolio has better risk-adjusted returns (Sharpe ratio) than the 70/30 allocation — it is more efficient per unit of risk. But the absolute return is too low. The solution is to lever the efficient risk-balanced portfolio up to the desired return target. At 1.5–1.8× leverage, the risk-parity portfolio can approach the 7.5% return target while maintaining better drawdown characteristics than the concentrated equity portfolio. This is exactly how Bridgewater's institutional strategies operate.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Factor-Based Asset Allocation ─────────────────────────────────
    {
      id: "asset-allocation-4",
      title: "🔬 Factor-Based Asset Allocation",
      description:
        "Move beyond traditional asset classes to allocate across systematic return drivers — value, momentum, quality, low volatility, and carry — and understand how factor diversification differs from asset class diversification",
      icon: "FlaskConical",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What Are Factors and Why Do They Earn Returns?",
          content:
            "**Factor investing** (also called smart beta or systematic investing) identifies persistent, pervasive return drivers that explain why some securities consistently outperform others after controlling for market exposure.\n\n**The original framework — Fama-French (1992):**\nGene Fama and Ken French identified that stock returns are explained by three factors beyond market beta:\n1. **Market (Beta)**: Stocks outperform cash because they bear market risk\n2. **Size**: Small-cap stocks outperform large-cap stocks (on average, long run)\n3. **Value**: Cheap stocks (low price-to-book) outperform expensive stocks\n\n**Subsequent factor discovery:**\n- **Momentum** (Jegadeesh & Titman, 1993): Stocks that performed well in the past 12 months tend to continue outperforming in the next 3–12 months\n- **Quality**: High profitability, low leverage, stable earnings companies outperform (Novy-Marx, 2013)\n- **Low Volatility**: Less volatile stocks earn higher risk-adjusted returns than theory predicts — the so-called low-vol anomaly (Baker et al., 2011)\n- **Carry**: Assets with high current yield (dividend yield, bond yield) outperform low-yield assets\n\n**Why do factors earn returns? Three explanations:**\n1. **Risk compensation**: Factors are systematically risky in ways that matter — value stocks are distressed, small caps are illiquid. Investors earn a premium for bearing these risks.\n2. **Behavioral mispricing**: Systematic investor biases create persistent mispricings. Momentum exists because investors underreact to news; value premiums persist because of extrapolation bias.\n3. **Structural barriers**: Some investors are prohibited from owning certain securities (low credit-rated bonds, illiquid stocks), creating persistent premiums for those willing to hold them.",
          highlight: ["factor investing", "Fama-French", "value factor", "momentum", "quality", "low volatility", "carry"],
        },
        {
          type: "teach",
          title: "Allocating to Factors vs Asset Classes",
          content:
            "Traditional asset allocation divides a portfolio into stocks, bonds, and real assets. Factor-based allocation divides the portfolio into **systematic return drivers** that cut across traditional asset class boundaries.\n\n**Key insight — the same factors exist across asset classes:**\n- **Value** exists in equities (cheap stocks), bonds (high-yield spread), real estate (low price-to-rent), and currencies (purchasing power parity)\n- **Momentum** exists in equities (12-month returns), bonds (trend following), commodities (supply/demand trends), and currencies\n- **Carry** exists in currencies (interest rate differential), bonds (yield curve), and equities (dividend yield)\n\nThis means diversifying across factors is fundamentally different from diversifying across asset classes — and may provide better true diversification.\n\n**Comparison: traditional vs factor allocation:**\n\n*Traditional 60/40:*\n- 60% equities (mostly value, some growth)\n- 40% bonds (mostly carry)\n- Result: high concentration in equity market risk\n\n*Factor-diversified portfolio:*\n- 25% value factor (long cheap/short expensive across equities, bonds, FX)\n- 25% momentum factor (long trending/short mean-reverting assets)\n- 25% quality factor (long high-quality companies)\n- 25% carry factor (long high-yield / short low-yield)\n- Result: low correlation across factors, exposure to multiple return engines\n\n**Factor correlation benefits:**\nValue and momentum are historically negatively correlated — value struggles when growth stocks are in bubble territory while momentum thrives. Combining them smooths returns significantly. Quality tends to be defensive and performs well in drawdowns when value and momentum struggle.",
          highlight: ["factor diversification", "value", "momentum", "quality", "carry", "negative correlation"],
        },
        {
          type: "teach",
          title: "Implementing Factor Allocation — Practical Considerations",
          content:
            "**Factor timing vs static factor allocation:**\nResearch suggests factors themselves cycle through periods of over- and under-performance. Value had a brutal 2010–2020 decade before roaring back in 2021–2022. The temptation is to time factors — rotate into momentum when value is struggling. Evidence on factor timing is mixed; static diversification across factors has proven more reliable for most investors.\n\n**Implementation vehicles:**\n1. **Smart beta ETFs**: Low-cost funds that systematically screen for specific factors (e.g., iShares MSCI Value Factor, Vanguard Momentum ETF). Simple, liquid, transparent — but only capture a single factor, one asset class at a time.\n2. **Multi-factor ETFs**: Single fund capturing multiple factors with diversification benefits (e.g., DFA funds, Dimensional). Better diversification but less transparency.\n3. **Factor risk premia strategies**: Institutional hedge fund strategies capturing factors across all asset classes in long-short form. Maximum diversification but requires sophistication and carries leverage.\n\n**Crowding risk:**\nAs more investors adopt factor strategies, the factors themselves can become overcrowded. When many funds track the same factor signals, a sudden reversal (e.g., momentum crash) causes all factor-following funds to unwind simultaneously — amplifying losses. This is a genuine risk in heavily-adopted factors.\n\n**The factor zoo problem:**\nAcademic researchers have published 400+ claimed factors. Most fail out-of-sample due to data mining, spurious correlations, or over-fitting. The most robustly documented factors are: market, value, momentum, quality, low-volatility, and carry. Investors should maintain a high bar for adding new factors to their portfolio.",
          highlight: ["factor timing", "smart beta ETFs", "multi-factor", "crowding risk", "factor zoo", "out-of-sample"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor wants to diversify her portfolio across multiple systematic return drivers rather than traditional asset classes. She is considering combining value and momentum factors. Which statement about this combination is supported by academic evidence?",
          options: [
            "Value and momentum factors are historically negatively correlated, so combining them smooths returns better than holding either alone",
            "Value and momentum factors are positively correlated, making the combination riskier than either factor in isolation",
            "Momentum factors are only available in equities, making cross-asset factor diversification impossible in practice",
            "Factor diversification only adds value when markets are efficient; in inefficient markets, stock picking dominates",
          ],
          correctIndex: 0,
          explanation:
            "Value and momentum have historically exhibited negative or low correlation — they tend to work at different times. Value stocks are cheap, beaten-down companies; momentum stocks are recent winners. During growth bubbles (late 1990s), momentum thrives while value struggles. During reversals, value rebounds while momentum crashes. This natural complementarity — Asness, Moskowitz, and Pedersen (2013) documented this across asset classes — makes the combination particularly powerful for portfolio construction. The blended value+momentum portfolio historically shows meaningfully higher Sharpe ratios than either factor alone.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Since academic researchers have published hundreds of factors that generate excess returns, investors can improve their portfolios significantly by incorporating as many of these published factors as possible.",
          correct: false,
          explanation:
            "This is the 'factor zoo' problem. The vast majority of the 400+ published factors fail out-of-sample — they were identified by data mining historical data and do not persist going forward. Many exist due to spurious correlations, selection bias in academic publishing (only significant results get published — the 'replication crisis'), or because they are disguised versions of well-known factors. Only a small set — market beta, size, value, momentum, quality, low-volatility, carry — have shown robust, pervasive, and persistent evidence across multiple asset classes, geographies, and time periods. Adding more factors from the zoo increases costs, complexity, and the risk of incorporating spurious signals that reduce rather than improve portfolio performance.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Lifecycle Investing ───────────────────────────────────────────
    {
      id: "asset-allocation-5",
      title: "🔄 Lifecycle Investing",
      description:
        "Understand how asset allocation should evolve over an investor's lifetime — the glide path concept, target-date funds, human capital theory, and why young investors should think differently about risk",
      icon: "RefreshCw",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Glide Path — Shifting Allocation Over Time",
          content:
            "**Lifecycle investing** recognizes that the optimal asset allocation changes as an investor ages. The mechanism for this change is called the **glide path** — a predetermined schedule that gradually shifts the portfolio from growth-oriented to income-oriented as retirement approaches.\n\n**The traditional logic:**\n- **Young investors** have decades ahead to ride out market volatility and can hold high equity allocations (80–100%)\n- **Middle-aged investors** begin reducing equity exposure to protect growing wealth\n- **Near-retirement investors** shift toward bonds and income assets to preserve the capital needed for retirement spending\n- **In-retirement investors** hold primarily income assets with a smaller equity allocation for inflation protection\n\n**The Rule of 100 (and its variants):**\nA classic rule of thumb: equity allocation = (100 − your age). A 30-year-old holds 70% equities; a 60-year-old holds 40% equities.\n\nModern variants adjust for increased longevity:\n- **Rule of 110**: equity = 110 − age (accounts for longer retirements)\n- **Rule of 120**: equity = 120 − age (for aggressive investors comfortable with higher risk)\n\n**Criticism of simple age-based rules:**\nThese rules ignore wealth level, income sources, risk tolerance, and health. A 65-year-old with a pension covering all expenses can afford more equity risk than a 65-year-old entirely dependent on portfolio withdrawals. The rules are starting points for thinking, not precise prescriptions.\n\n**The two types of glide paths:**\n- **To retirement**: Equity allocation hits its lowest point at the retirement date (traditional approach)\n- **Through retirement**: Equity allocation continues declining for 15–20 years after retirement, reaching its floor in the mid-retirement period (increasingly preferred for longevity risk management)",
          highlight: ["glide path", "lifecycle investing", "Rule of 100", "to retirement", "through retirement", "longevity risk"],
        },
        {
          type: "teach",
          title: "Human Capital — Your Biggest Asset Before You Know It",
          content:
            "**Human capital** is the present value of your future earnings — your single largest asset for most of your working life. Incorporating human capital into asset allocation fundamentally changes how much financial risk a young investor can — and should — take.\n\n**Quantifying human capital:**\nA 25-year-old earning $60,000/year, expecting 3% annual raises, has approximately $2.5–3 million in human capital (PV of 40 years of future income). Their financial portfolio might be $25,000 — tiny by comparison.\n\n**The portfolio implication:**\nTotal wealth = financial portfolio + human capital. If 99% of your total wealth is in human capital (which is stable, salary-like, and bond-like for most people), your financial portfolio can be 100% equities without making your total wealth position reckless.\n\n**Bond-like vs equity-like human capital:**\n- **Bond-like human capital**: Stable, salary-based income (teacher, government employee, tenured professor) — safe, predictable, low correlation to stock markets → financial portfolio can be more equity-heavy\n- **Equity-like human capital**: Variable, market-correlated income (investment banker, salesperson on commission, startup founder, stockbroker) — risky, highly correlated to stock markets → financial portfolio should be more bond-heavy to diversify total wealth\n\n**Practical examples:**\n- A teacher should hold mostly equities in their retirement account (her human capital is bond-like)\n- A Wall Street trader should hold more bonds in their retirement account (his bonus is already equity-like and correlated to markets)\n\n**The leverage implication (Lifecycle Investing by Ayres & Nalebuff):**\nIf young investors have massive human capital but limited financial capital, they should logically use leverage on their small financial portfolio to get the equity exposure their total wealth justifies. This controversial academic recommendation has not been widely adopted by mainstream advice.",
          highlight: ["human capital", "future earnings", "bond-like", "equity-like", "total wealth", "leverage"],
        },
        {
          type: "teach",
          title: "Target-Date Funds — Glide Paths Made Easy",
          content:
            "**Target-date funds (TDFs)** are all-in-one mutual funds designed to automatically implement a lifecycle glide path. An investor chooses the fund matching their expected retirement year (e.g., Vanguard Target Retirement 2055), and the fund automatically adjusts its asset allocation over time.\n\n**How target-date funds work:**\n- Fund of funds structure: holds several underlying index funds (US equity, international equity, bonds, TIPS)\n- Allocation adjusts automatically each year along a predetermined glide path\n- Investor needs only one fund and never needs to rebalance manually\n- Annual expense ratios: Vanguard: ~0.08–0.15%; Fidelity Freedom: ~0.12–0.75% (varies by series)\n\n**Typical glide path structure (Vanguard example):**\n- 45+ years to retirement: ~90% equities, 10% bonds\n- 25 years to retirement: ~80% equities, 20% bonds\n- 10 years to retirement: ~65% equities, 35% bonds\n- At retirement: ~50% equities, 50% bonds\n- 10 years post-retirement: ~30% equities, 70% bonds (landing point)\n\n**Key differences between fund families:**\n- **Equity-heavy vs bond-heavy**: Vanguard and BlackRock TDFs hold more equity near retirement than Fidelity Freedom funds. Neither is right or wrong — they reflect different views on longevity risk vs sequence-of-returns risk.\n- **Through vs to retirement**: Most funds now implement through-retirement glide paths.\n- **Active vs passive underlying**: Fidelity Freedom funds use active management; Vanguard uses index funds. This drives significant fee differences.\n\n**The sequence-of-returns risk:**\nLarge market losses in the first 5–10 years of retirement are devastating — they deplete capital just when withdrawals begin, and there is insufficient capital left to benefit from recovery. This is why glide paths reduce equity exposure near and early in retirement.",
          highlight: ["target-date funds", "TDF", "glide path", "sequence-of-returns risk", "expense ratio", "longevity risk"],
        },
        {
          type: "quiz-mc",
          question:
            "James is 30 years old, works as a commission-based stockbroker whose annual income fluctuates significantly with stock market performance. According to human capital theory, how should he structure his retirement portfolio compared to a 30-year-old teacher with a stable government salary?",
          options: [
            "James should hold more bonds in his retirement portfolio to diversify against the equity-like risk already embedded in his income",
            "James should hold more equities because his market exposure means he is more comfortable with stock market risk",
            "Both investors should hold the same allocation since age determines allocation, not occupation",
            "James should hold the same equity allocation as the teacher but add commodities as an additional diversifier",
          ],
          correctIndex: 0,
          explanation:
            "Human capital theory differentiates between bond-like and equity-like human capital. James's income as a commission-based stockbroker is equity-like — it rises in bull markets and falls in bear markets, making it highly correlated with stock markets. His total wealth (financial portfolio + human capital) already has substantial equity-market exposure through his income stream. To diversify his total wealth, his financial portfolio should tilt toward bonds. The teacher, by contrast, has bond-like human capital (stable, government-backed salary uncorrelated with stock markets) and can afford to hold more equities in her financial portfolio to achieve an appropriately diversified total wealth position.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A target-date retirement fund automatically protects investors from sequence-of-returns risk by eliminating all equity exposure at the target retirement date.",
          correct: false,
          explanation:
            "Target-date funds do NOT eliminate equity exposure at retirement — modern TDFs typically hold 40–50% equities at the target date, declining further to 20–30% over the following 15–20 years (a 'through-retirement' glide path). Completely eliminating equities at retirement would create a different risk: longevity risk — the danger that a portfolio generating only bond yields will be depleted by a 25–30 year retirement. TDFs balance sequence-of-returns risk (too much equity early in retirement) against longevity risk (too little equity depletes the portfolio too quickly). The appropriate equity allocation in retirement depends on spending needs, health, other income sources, and bequest goals — no single formula fits everyone.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 6: Building Your Own Asset Allocation ─────────────────────────────
    {
      id: "asset-allocation-6",
      title: "🏗️ Building Your Own Asset Allocation",
      description:
        "Apply frameworks from all prior lessons to construct a personalized asset allocation — investor questionnaire, risk tolerance and capacity, time horizon analysis, and writing a simple Investment Policy Statement",
      icon: "Building2",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Investor Questionnaire — Diagnosing Your Risk Profile",
          content:
            "Before selecting a single asset class weight, a rigorous asset allocation process begins with a thorough self-assessment. Professional advisors use structured questionnaires to distinguish between three related but distinct concepts:\n\n**1. Risk Capacity (Ability to take risk)**\nObjective, financial measure: can you financially survive a significant portfolio drawdown?\n- How much of your income do you need from your portfolio?\n- Do you have an emergency fund outside your investment portfolio?\n- Are there near-term large expenses (home purchase, education, medical)?\n- What is your job stability and income variability?\n\n**2. Risk Tolerance (Willingness to take risk)**\nPsychological, subjective measure: how do you emotionally respond to portfolio declines?\n- If your portfolio dropped 30% in three months, what would you do?\n  - Sell immediately\n  - Sell some\n  - Hold steady\n  - Buy more\n- Have you experienced significant market downturns before? How did you react?\n- Can you ignore daily portfolio fluctuations, or do they affect your sleep and work?\n\n**3. Risk Required (Need to take risk)**\nMathematical measure: what return do you need to meet your goals?\n- Retirement at 65 with $3M target → if you have $100k saved at 35, you need roughly 6.5% annualized → likely requires significant equity exposure\n- Same goal but $800k saved → you only need 4.5% → could use a more conservative allocation\n\n**Key principle:** The binding constraint is the LOWEST of the three:\n- High capacity, low tolerance → tolerance limits the allocation\n- High capacity, high tolerance, low required return → lower return/risk allocation is appropriate (no need for excessive risk)\n- Low capacity, any tolerance → capacity limits the allocation regardless of willingness",
          highlight: ["risk capacity", "risk tolerance", "risk required", "binding constraint", "investor questionnaire"],
        },
        {
          type: "teach",
          title: "Time Horizon — The Most Underappreciated Variable",
          content:
            "**Time horizon** is the period over which you will invest before needing to draw on the portfolio for its intended purpose. It is arguably the most important variable in determining appropriate asset allocation, yet it is frequently misunderstood.\n\n**Why time horizon matters — volatility vs risk:**\nIn finance, short-term price volatility is the primary measure of risk. But for a long-term investor, the risk that truly matters is **failing to meet long-term goals** — a permanent failure to reach the target, not a temporary price decline.\n- A 30% decline in year 1 of a 30-year investment period is temporarily painful but recoverable\n- A 30% decline in year 1 of retirement when you need to withdraw 5% annually is potentially catastrophic\n\n**Matching time horizons to asset classes:**\n| Horizon | Appropriate Equity Allocation | Primary Risk |\n|---------|------------------------------|---------------|\n| < 1 year | 0–10% | Capital preservation |\n| 1–3 years | 10–30% | Volatility over near term |\n| 3–7 years | 30–60% | Balanced growth/stability |\n| 7–15 years | 60–80% | Inflation erosion |\n| 15+ years | 80–100% | Failing to grow |\n\n**The 'time horizon buckets' approach:**\nSophisticated investors divide their portfolio into multiple buckets, each with its own time horizon:\n- **Bucket 1 (0–2 years)**: Living expenses, emergency reserve — cash and short-term bonds\n- **Bucket 2 (2–10 years)**: Medium-term goals — diversified 40/60 to 60/40\n- **Bucket 3 (10+ years)**: Long-term growth — 80–100% equities and alternatives\n\nEach bucket is managed to its specific time horizon, preventing short-term volatility in Bucket 3 from triggering panic decisions about near-term Bucket 1 needs.",
          highlight: ["time horizon", "volatility vs risk", "time horizon buckets", "goal failure", "capital preservation"],
        },
        {
          type: "teach",
          title: "The Investment Policy Statement — Your Roadmap",
          content:
            "An **Investment Policy Statement (IPS)** is a written document that formalizes an investor's objectives, constraints, and asset allocation framework. It serves as the constitution of your investment program — the document you consult when markets are volatile and emotion threatens discipline.\n\n**The six components of a personal IPS:**\n\n**1. Return Objective**\nWhat return do you need to meet your goals? Express as both a nominal return target (e.g., 7% annualized) and a real (after-inflation) return target (e.g., 4.5% real). Be realistic — higher return targets require accepting more risk.\n\n**2. Risk Tolerance**\nWhat is the maximum portfolio drawdown you can tolerate without deviating from your strategy? Express as a percentage (e.g., \"I can tolerate up to −30% in any single calendar year\") and document your planned response (\"I will not sell; I will maintain allocations\").\n\n**3. Time Horizon**\nWhen will you begin drawing from the portfolio? Is this a single date (retirement) or a rolling horizon (ongoing withdrawals)? Are there intermediate milestones (child's college in 10 years)?\n\n**4. Liquidity Requirements**\nWhat portion of the portfolio must remain in liquid, easily sellable assets? This determines the maximum allocation to illiquid alternatives, private equity, or long lock-up vehicles.\n\n**5. Strategic Asset Allocation Target Weights + Rebalancing Rules**\nSpecific target weights for each asset class (e.g., 60% global equities, 30% bonds, 10% real assets) and the rebalancing trigger (calendar-based, threshold-based, or hybrid).\n\n**6. Constraints and Special Considerations**\nTax considerations, ESG restrictions, concentration limits (no single stock > 5%), inheritance plans, required minimum distributions.\n\n**Why write it down?**\nThe purpose is behavioral. When markets fall 25% and every financial media outlet is predicting depression, referring to your written IPS — which you created during a calm period — provides an anchor against emotional decision-making. Advisors use IPS documents precisely because they commit the investor to a strategy before the emotional storm arrives.",
          highlight: ["Investment Policy Statement", "IPS", "return objective", "rebalancing rules", "behavioral anchor", "constraints"],
        },
        {
          type: "quiz-mc",
          question:
            "Priya has $200,000 saved for retirement 25 years away, earns $90,000/year in a stable government job, has a 6-month emergency fund, and estimates she needs $1.5 million at retirement. She recently said: \"I'd panic and sell everything if my portfolio dropped 20%.\" What is the binding constraint on her asset allocation?",
          options: [
            "Risk tolerance — her self-reported emotional response to drawdowns limits her equity allocation despite high capacity and long horizon",
            "Risk capacity — her $200,000 portfolio is insufficient to handle significant losses despite her stable income",
            "Time horizon — 25 years is too short to take equity risk safely given her retirement needs",
            "Return required — she needs a very high return to reach $1.5M, forcing 100% equity regardless of other factors",
          ],
          correctIndex: 0,
          explanation:
            "Priya has high risk capacity: stable government income, 25-year horizon, emergency fund, and reasonable required return (~7% to grow $200k to $1.5M in 25 years). Her binding constraint is risk tolerance — she explicitly said she would panic-sell at −20%. An investor who panic-sells at the worst possible time destroys wealth regardless of how good their fundamental strategy is. The advisor's job is to find an allocation she can stick with through a bear market, even if that means accepting lower expected returns. A 50-60% equity allocation that she holds through downturns is far better than 90% equity that she abandons at the bottom.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Daniel, age 40, is writing his first Investment Policy Statement. He has: $350,000 in a retirement account (25-year horizon), $40,000 in a college savings account for a child entering college in 4 years, $20,000 emergency fund (separate from investments), a stable engineering salary of $130,000, no pension. He can tolerate moderate volatility — he held through the 2020 COVID crash without selling. His required return to meet retirement goals is approximately 6.5% nominal.",
          question: "Which asset allocation framework best fits Daniel's complete picture?",
          options: [
            "Time-horizon buckets: retirement account at 75% equities / 25% bonds (25-year horizon), college account at 20% equities / 80% bonds (4-year horizon)",
            "Single uniform allocation of 60/40 across all accounts to maintain simplicity and consistent risk management",
            "Retirement account at 100% equities and college account at 100% equities since Daniel showed he can handle volatility",
            "Retirement account at 40% equities due to age 40, college account at 60% equities since college is 4 years away",
          ],
          correctIndex: 0,
          explanation:
            "Daniel's situation calls for a time-horizon buckets approach: the two accounts have fundamentally different time horizons requiring different risk profiles. The retirement account (25-year horizon) justifies 75-80% equities — his stable income provides bond-like human capital, he demonstrated real risk tolerance during COVID, and he needs 6.5% return. The college account (4-year horizon) should be conservative at 20-30% equities maximum — a severe market drawdown in the next 4 years could prevent his child from attending college. A uniform 60/40 across both accounts is too aggressive for the college account (equity drawdown risk near a mandatory withdrawal) and potentially too conservative for the retirement account. The age-based Rule of 110 suggesting 40% equities at age 40 fails to account for his 25-year horizon and bond-like human capital.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An Investment Policy Statement is primarily useful for sophisticated institutional investors; individual investors with simple portfolios gain little benefit from writing one because their financial situations are too straightforward to require formal documentation.",
          correct: false,
          explanation:
            "The Investment Policy Statement is arguably MORE valuable for individual investors than institutions — because individual investors are more susceptible to behavioral biases. Institutional investment committees have structured processes, multiple decision-makers, and explicit mandates that provide natural behavioral guardrails. Individual investors facing a −30% portfolio decline are alone with their anxiety and their news feed. The written IPS, created during a calm period after rational deliberation, serves as a commitment device — a reminder of why the strategy was chosen and what the planned response to volatility is. Academic research on 'pre-commitment' devices consistently shows they improve decision quality by separating the choice architecture from the emotional context in which decisions must be executed.",
          difficulty: 1,
        },
      ],
    },
  ],
};
