import type { Unit } from "./types";

export const UNIT_MARKET_PSYCHOLOGY: Unit = {
  id: "market-psychology",
  title: "Market Psychology",
  description:
    "Deep dive into cognitive biases, behavioral traps, sentiment indicators, herd dynamics, and the process-driven mindset of elite traders",
  icon: "Brain",
  color: "#e11d48",
  lessons: [
    // ─── Lesson 1: Cognitive Biases in Trading ────────────────────────────────
    {
      id: "mp-1",
      title: "Cognitive Biases in Trading",
      description:
        "Anchoring, availability heuristic, representativeness, framing effects, and overconfidence — the biases that drain trading accounts",
      icon: "Brain",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Anchoring: The First Number Wins",
          content:
            "**Anchoring** is the tendency to rely disproportionately on the first piece of information encountered when making decisions. In trading, the 'anchor' is almost always the price at which you bought a stock — and it silently distorts every subsequent decision.\n\n**How anchoring appears in the market:**\n- A trader buys stock at $100. It rises to $150, then retreats to $120. Because they are anchored to $150 (the high), $120 feels cheap — even though the fundamentals may justify $90.\n- Analysts anchor to last year's price target, making incremental adjustments rather than fresh-start valuations.\n- IPO investors anchor to the offering price: they refuse to buy once it trades above IPO price, calling it 'too expensive.'\n\n**The 52-week high anchor:**\nResearch shows stocks near their 52-week high face selling pressure from investors anchored to that level — they sell into perceived 'resistance' created purely by psychological anchoring, not fundamental analysis.\n\n**Breaking the anchor:**\n- Perform zero-based analysis: ask 'Would I buy this stock at today's price if I had no prior position?'\n- Write down your investment thesis *before* looking at price history.\n- Use multiple valuation methods (DCF, comps, historical multiples) to triangulate — never rely on a single anchor price.",
          highlight: ["anchoring", "52-week high", "zero-based analysis", "IPO price"],
        },
        {
          type: "teach",
          title: "Availability, Representativeness & Framing",
          content:
            "Three more biases that quietly reshape trading decisions:\n\n**Availability Heuristic:**\nWe judge the probability of events by how easily examples come to mind. After a high-profile crash (2008, 2020 COVID), investors overestimate the probability of another crash for years — keeping them under-allocated to equities long after the rational evidence has shifted. Conversely, after a prolonged bull run, crashes feel unimaginable.\n\n**Representativeness Heuristic:**\nWe assess probabilities by how closely an event resembles a familiar pattern — ignoring base rates. A trader sees a 'cup-and-handle' formation and immediately expects a breakout, ignoring that most apparent patterns fail. Or: a company reports three stellar quarters and investors project this growth indefinitely, despite regression to the mean being overwhelmingly likely.\n\n**Framing Effect:**\nThe way information is presented changes decisions, even when the underlying data is identical:\n- '70% survival rate' vs '30% mortality rate' — same fact, wildly different emotional reactions.\n- A portfolio down 20% feels devastating; reframed as 'still up 60% from five years ago,' behavior changes completely.\n- 'A gain of $500 from a $1,000 investment' vs '50% return' — the percentage frame may prompt profit-taking; the dollar frame may seem trivial.\n\n**Countermeasure:** Always seek the base rate. Ask yourself: 'How often does this pattern actually succeed, historically?' Reframe every situation in at least two different ways before deciding.",
          highlight: [
            "availability heuristic",
            "representativeness heuristic",
            "framing effect",
            "base rate",
            "regression to the mean",
          ],
        },
        {
          type: "teach",
          title: "Overconfidence: The Most Expensive Bias",
          content:
            "**Overconfidence** is arguably the costliest cognitive bias in trading. It takes three related forms:\n\n**Overprecision:** We are more certain our estimates are correct than the evidence warrants. Traders who 'know' a stock will hit $200 by year-end are expressing a confidence that far exceeds what any analysis can support. Studies show investors' prediction intervals are far too narrow — actual outcomes fall outside stated confidence ranges 40–50% of the time, not the 10–20% they expect.\n\n**Overplacement:** We believe we are better than average. 70–80% of fund managers believe they are in the top quartile. Impossible arithmetic — but a very real psychological phenomenon. This leads to excessive risk-taking because the trader believes their edge is greater than it is.\n\n**Overestimation:** We overestimate the quality and precision of our information. Hearing an analyst's target price feels like insight; it is mostly noise. Detailed company research can actually *increase* overconfidence without improving returns.\n\n**The trading cost of overconfidence:**\n- Excessive trading frequency — overconfident traders churn their portfolios, generating transaction costs and tax drag that erode returns.\n- Insufficient diversification — concentration in 'sure things.'\n- Ignoring stop losses — certain the position will recover.\n\n**Calibration:** Keep a prediction log. Rate your confidence (60%, 75%, 90%) before trades and check outcomes. Calibrated confidence is the foundation of sustainable edge.",
          highlight: [
            "overconfidence",
            "overprecision",
            "overplacement",
            "overestimation",
            "calibration",
            "prediction log",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A stock you bought at $80 has rallied to $120, then pulled back to $100. You feel reluctant to sell even though your analysis now suggests fair value is $90. Which bias is most directly responsible?",
          options: [
            "Anchoring — your $80 cost basis and $120 peak are acting as reference points distorting your sell decision",
            "Overconfidence — you believe the stock will recover to $120 again",
            "Availability heuristic — recent memories of the $120 price are too vivid",
            "Framing effect — you are thinking in percentage terms rather than dollars",
          ],
          correctIndex: 0,
          explanation:
            "Anchoring is the primary bias here. Your $80 cost basis (the original anchor) makes $100 feel like a big gain, while the $120 recent high creates a secondary anchor making $100 feel cheap. Both anchors bias you against selling even when independent analysis says fair value is $90. A zero-based question — 'Would I buy this today at $100 knowing fair value is $90?' — cuts through the anchoring.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "After reading an in-depth 40-page research report on a biotech company, a trader is 90% confident the FDA will approve the drug in question. The base rate for FDA approval of drugs at this stage is approximately 50%. Without the report, the trader was 55% confident.",
          question:
            "What does this illustrate, and what is the rational approach?",
          options: [
            "Overconfidence and representativeness — the detailed report inflated confidence well beyond what the base rate supports; the rational anchor is near 50% with modest adjustment for specific information",
            "Availability heuristic — recent drug approval news made the trader overweight positive outcomes",
            "Framing effect — the research report framed the data positively, shifting the estimate",
            "Anchoring — the 55% prior is acting as an anchor that was rationally adjusted upward",
          ],
          correctIndex: 0,
          explanation:
            "This is overconfidence combined with representativeness. More detail in research typically increases confidence more than it improves accuracy. The rational Bayesian approach: start with the 50% base rate and update modestly based on the specific evidence in the report. Jumping from 55% to 90% is a red flag for overconfidence. The research may provide 5–10 percentage points of genuine edge above the base rate — not 40.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Prospect Theory & Loss Aversion ────────────────────────────
    {
      id: "mp-2",
      title: "Prospect Theory & Loss Aversion",
      description:
        "Kahneman-Tversky value functions, probability weighting, the disposition effect, and how loss aversion kills returns",
      icon: "TrendingDown",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The S-Curve Value Function",
          content:
            "In 1979, **Daniel Kahneman** and **Amos Tversky** published Prospect Theory — one of the most important papers in the history of economics and a direct challenge to classical rational-agent models.\n\nThe key insight: people evaluate outcomes relative to a **reference point** (usually the status quo), not in terms of absolute wealth. The function mapping outcomes to psychological value has a characteristic **S-shape**:\n\n**Gains domain (concave curve):**\n- Each additional dollar gained adds less value than the previous one.\n- Going from $0 to $100 feels better than going from $100 to $200.\n- Diminishing marginal sensitivity to gains.\n\n**Losses domain (convex curve):**\n- Each additional dollar lost hurts more than — wait, actually *less* — but the loss domain is *steeper* than the gain domain.\n- The critical asymmetry: **a $100 loss creates roughly 2.25× the psychological pain of the pleasure generated by a $100 gain.**\n- This ratio is the **loss aversion coefficient (λ ≈ 2.25)**.\n\n**Why it matters for trading:**\n- Traders are willing to accept a worse expected outcome just to avoid the certainty of a loss.\n- They exit winners too early (booking certain gains) and hold losers too long (gambling on recovery rather than accepting the certain loss).\n\nKahneman won the **Nobel Prize in Economics in 2002** for this work.",
          highlight: [
            "Kahneman",
            "Tversky",
            "Prospect Theory",
            "reference point",
            "S-shape",
            "loss aversion coefficient",
          ],
        },
        {
          type: "teach",
          title: "Probability Weighting: We Distort Odds Too",
          content:
            "Beyond the asymmetric value function, Prospect Theory identifies a second major distortion: **probability weighting**. People do not evaluate probabilities linearly.\n\n**How we actually weight probabilities:**\n- **Low probabilities are overweighted:** A 1% chance feels more significant than 1% of certainty. This drives lottery ticket purchases and far out-of-the-money option buying (paying too much for tiny-probability events).\n- **High probabilities are underweighted:** A 95% chance of success feels less reassuring than certainty. Investors buy insurance even when actuarially unfair.\n- **The extremes:** 0% and 100% are processed accurately; it's the middle range (5–95%) where distortion is highest.\n\n**Trading implications of probability weighting:**\n- **Overpaying for lottery tickets:** Retail traders are chronically overweight in deep out-of-the-money options, speculative small caps, and meme stocks — all 'lottery' payoffs.\n- **Under-risking on high-probability setups:** A 70% win-rate strategy still feels 'uncertain' because 70% is underweighted relative to its true value.\n- **Misvaluing tail risk:** Overweighting the probability of catastrophic crashes leads to excessive hedging costs; underweighting persistent tail risk leads to no hedging at all.\n\n**The calibration fix:** When evaluating a trade, write down the *explicit probability* you assign to each outcome before execution. Track whether your assigned probabilities match actual outcomes over time.",
          highlight: [
            "probability weighting",
            "overweighted",
            "underweighted",
            "lottery tickets",
            "tail risk",
            "calibration",
          ],
        },
        {
          type: "teach",
          title: "The Disposition Effect: Selling Winners, Holding Losers",
          content:
            "**The Disposition Effect** (Shefrin & Statman, 1985): the empirical observation that investors systematically sell winning positions too early and hold losing positions too long.\n\nThis is Prospect Theory in action:\n- When a position is profitable, you are in the **gain domain** — risk-averse — preferring the certainty of booking the gain over gambling on further upside.\n- When a position is losing, you are in the **loss domain** — risk-seeking — preferring to gamble on recovery rather than accept the certain loss.\n\n**The empirical evidence is stark:**\n- Analysis of 10,000+ retail brokerage accounts: investors were **1.5× more likely to sell a winner than a loser** on any given day.\n- Mutual fund managers — despite professional training — show the same pattern.\n- The stocks that were *held* (losers) subsequently *underperformed*; the stocks that were *sold* (winners) subsequently *outperformed*. The bias has real, measurable return costs.\n\n**The tax dimension:**\n- Selling winners early triggers capital gains taxes — especially short-term rates at ordinary income.\n- Holding losers forgoes tax-loss harvesting — booking losses to offset gains elsewhere.\n- The disposition effect is simultaneously behaviorally irrational and tax-inefficient.\n\n**The fix:** Pre-commit to exit rules *before* entry — when thinking is uncontaminated by current gains or losses. Use trailing stops on winners; hard stops on losers. Write down the specific conditions under which you will exit, then obey them.",
          highlight: [
            "disposition effect",
            "sell winners",
            "hold losers",
            "tax-loss harvesting",
            "trailing stops",
            "pre-commit",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "According to Prospect Theory's probability weighting function, a trader should rationally pay more for a deep out-of-the-money call option than its actuarially fair price because low-probability events feel more significant than their true probability.",
          correct: false,
          explanation:
            "Probability weighting *describes* a behavioral tendency — it does not make it rational or correct. The observation that people overweight low probabilities explains *why* OTM options are frequently overpriced (buyers pay more than fair value), but it is a bias to overcome, not a strategy to follow. Rational traders should actually *sell* overpriced low-probability options (e.g., be net option sellers) to exploit this systematic overweighting by the market.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Investor A holds Stock X (up 40%) and Stock Y (down 30%). On a given day, the market is flat. Which action does the disposition effect most strongly predict?",
          options: [
            "Sell Stock X (the winner) and hold Stock Y (the loser)",
            "Sell Stock Y (the loser) and hold Stock X (the winner) — cut losses rationally",
            "Hold both stocks — the disposition effect predicts inaction",
            "Buy more Stock Y — loss domain risk-seeking leads to doubling down",
          ],
          correctIndex: 0,
          explanation:
            "The disposition effect predicts selling the winner and holding the loser. Stock X (up 40%) places the investor in the gain domain — risk-averse — preferring to lock in the certain gain. Stock Y (down 30%) places the investor in the loss domain — risk-seeking — preferring to gamble on recovery rather than realize the certain loss. This is exactly the reverse of rational tax-aware investing, where you would harvest the loss and let the winner run.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Herd Behavior & Social Proof ────────────────────────────────
    {
      id: "mp-3",
      title: "Herd Behavior & Social Proof",
      description:
        "Information cascades, momentum dynamics, bubble anatomy, and the contrarian edge — understanding when the crowd is right and when it is catastrophically wrong",
      icon: "Users",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Information Cascades: When Ignoring Your Own Data is Rational",
          content:
            "**Information cascades** explain how rational individuals, each acting on their own private information, can collectively produce irrational market outcomes. The mechanism is subtle and important.\n\n**The cascade model:**\nImagine 10 traders each have a private signal about whether a stock should be bought or sold. Trader 1 has a 'buy' signal, buys. Trader 2 has a 'sell' signal but observes Trader 1 buying, infers Trader 1 had a buy signal, and rationally concludes there is now 1 buy signal vs. 1 sell signal — a tie. On a tie, she buys (or flips a coin). Now Trader 3 observes two buyers and ignores his own signal, inferring the prior buyers both had buy signals. The cascade has begun.\n\n**Key insight:** Each subsequent trader is rationally *ignoring their own private information* because the observed actions of previous traders seem more informative. But the entire cascade is built on a very thin information base — possibly just Trader 1's single signal.\n\n**Why cascades are fragile and violent:**\n- A single strong contrary signal can shatter the cascade, causing a violent reversal.\n- The more investors have herded, the larger the reversal when it comes.\n- This is the microstructure behind many flash crashes and rapid trend reversals.\n\n**Market implication:** When everyone appears to be buying for the same reason, that reason is already fully priced in — and the information base may be far thinner than consensus suggests.",
          highlight: [
            "information cascade",
            "private information",
            "rational herding",
            "flash crash",
            "consensus",
          ],
        },
        {
          type: "teach",
          title: "Bubble Anatomy: The Five Stages",
          content:
            "Every speculative bubble in history — from Dutch Tulipmania (1637) to the dot-com bubble (2000) to crypto in 2021 — follows a remarkably consistent pattern described by economist **Hyman Minsky**:\n\n**Stage 1 — Displacement:**\nA genuine innovation or event changes the economic outlook. Examples: the internet in the mid-1990s, institutional adoption of Bitcoin, the railroad boom of the 1840s. Early adopters profit substantially and correctly.\n\n**Stage 2 — Boom:**\nCredit expands. Media coverage increases. New investors enter, attracted by the early movers' returns. Prices rise, validating the thesis and attracting still more capital.\n\n**Stage 3 — Euphoria:**\nValuation metrics become irrelevant — new valuation frameworks are invented to justify prices. 'This time is different' is the defining phrase. Everyone is 'in.' Fraud increases as promoters exploit the environment.\n\n**Stage 4 — Distress:**\nInsiders and early adopters begin selling. Prices plateau. Credit tightens. Some high-profile failures emerge. Denial is widespread.\n\n**Stage 5 — Revulsion:**\nCascading selling. Margin calls amplify the decline. Investors refuse to own the asset at any price. The bubble bursts.\n\n**The trader's takeaway:** Identify which stage you are in. Stages 1-2 offer legitimate opportunity. Stage 3 is where fortunes are lost. Stage 4-5 offer short opportunities. The crowd is *correct* early in a bubble and catastrophically wrong at the peak.",
          highlight: [
            "Minsky",
            "displacement",
            "boom",
            "euphoria",
            "distress",
            "revulsion",
            "this time is different",
          ],
        },
        {
          type: "teach",
          title: "Contrarian Investing: Using the Crowd Against Itself",
          content:
            "**Contrarian investing** is not about reflexively doing the opposite of the crowd — it is about identifying when consensus positioning has become so extreme that the asymmetric risk/reward has flipped.\n\n**When the crowd is right (trend-following is correct):**\n- Early in a move, when information is still diffusing through the market.\n- When fundamentals clearly support the direction.\n- During information cascades that are based on genuinely new data.\n\n**When the crowd is wrong (contrarian opportunity):**\n- When sentiment surveys reach extremes (>70% bulls or bears).\n- When short interest is near multi-year highs on a high-quality company.\n- When the narrative is unanimous and 'obvious' — by then it is priced in.\n- When volume and open interest in options become one-sided.\n\n**Classic contrarian signals:**\n- Magazine covers declaring the death or invincibility of an asset class.\n- Record equity fund inflows at market peaks; record outflows at troughs.\n- Taxi drivers and barbers giving stock tips (Minsky Stage 3 indicator).\n\n**The timing problem:**\nThe crowd can be wrong for far longer than a contrarian can remain solvent. The classic Keynes quote: *'Markets can remain irrational longer than you can remain solvent.'* Contrarian positions need a catalyst — not just extreme sentiment, but a specific reason the trend will reverse.",
          highlight: [
            "contrarian investing",
            "sentiment extremes",
            "short interest",
            "magazine cover",
            "Keynes",
            "catalyst",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In a classic information cascade, Trader 5 observes four consecutive buyers before her. She has a private 'sell' signal. What does economic theory predict she will do?",
          options: [
            "She will buy — rationally ignoring her private sell signal because the observed buying by four traders is more informative than her single signal",
            "She will sell — private information always dominates public signals in rational models",
            "She will do nothing — uncertainty paralyzes decision-making",
            "She will buy and hedge with a put option to balance the conflicting signals",
          ],
          correctIndex: 0,
          explanation:
            "Information cascade theory predicts she will buy despite her sell signal. If she assumes each prior buyer acted on a private buy signal, then the public information from observing four buyers outweighs her single private sell signal. This is individually rational but collectively irrational — it means the market price now reflects far less information than it appears to, since all five trades were ultimately driven by the first trader's single signal.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A contrarian investor should always take the opposite position of whatever the majority of investors are doing, regardless of fundamentals or trend strength.",
          correct: false,
          explanation:
            "Contrarianism is not reflexive opposition — that would be just as irrational as herding. Effective contrarian investing requires two conditions: (1) sentiment or positioning that is at an extreme (not just a majority, but a historically unusual extreme), AND (2) a catalyst that could cause the consensus view to reverse. Acting against a trend just because many people agree with it — when fundamentals and momentum both support it — is a fast way to lose money. Early in a bubble, the crowd is correct.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 4: Sentiment Indicators ──────────────────────────────────────
    {
      id: "mp-4",
      title: "Sentiment Indicators",
      description:
        "Fear & Greed Index, put/call ratio, short interest, fund flows, and surveys — quantifying market psychology to find contrarian edges",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Fear & Greed Index and VIX",
          content:
            "Sentiment indicators attempt to measure the emotional temperature of the market — quantifying the fear/greed spectrum that drives short-term price action.\n\n**CNN Fear & Greed Index:**\nComposites seven sub-indicators into a 0–100 score:\n1. Stock Price Momentum (S&P 500 vs. 125-day moving average)\n2. Stock Price Strength (new 52-week highs vs. lows)\n3. Stock Price Breadth (advancing vs. declining volume)\n4. Put and Call Options ratio\n5. Junk Bond Demand (spread between investment grade and junk)\n6. Market Volatility (VIX)\n7. Safe Haven Demand (return differential: stocks vs. bonds)\n\n**VIX — the 'Fear Index':**\nThe CBOE Volatility Index measures the implied volatility of 30-day S&P 500 options. VIX is *mean-reverting*:\n- VIX < 15: complacency, low fear — historically associated with modest forward returns and elevated crash risk.\n- VIX 15–25: normal range.\n- VIX > 30: elevated fear — historically a *buying opportunity* as markets have overshot to the downside.\n- VIX > 40 (rare): extreme fear — legendary buying opportunities (March 2020, October 2008, March 2009).\n\n**Contrarian use:** Fear & Greed < 20 (Extreme Fear) = accumulation zone. > 80 (Extreme Greed) = caution, reduce risk.",
          highlight: [
            "Fear & Greed Index",
            "VIX",
            "mean-reverting",
            "Extreme Fear",
            "Extreme Greed",
            "implied volatility",
          ],
        },
        {
          type: "teach",
          title: "Put/Call Ratio, Short Interest & Fund Flows",
          content:
            "Three market-derived sentiment signals with strong contrarian properties:\n\n**Put/Call Ratio:**\nDivides the number of put options traded by the number of call options traded. Puts = bearish bets; calls = bullish bets.\n- **Elevated P/C (>1.0–1.2):** Heavy put buying = excessive bearishness → contrarian bullish signal.\n- **Depressed P/C (<0.5–0.6):** Heavy call buying = excessive bullishness → contrarian bearish signal.\n- The CBOE equity-only P/C ratio is most useful; index options are heavily used for hedging and distort the reading.\n- A 10-day moving average of P/C smooths noise and identifies durable sentiment shifts.\n\n**Short Interest:**\nThe number of shares sold short as a percentage of float:\n- High short interest (>10–15% of float) = crowded bearish bet = **short squeeze potential**.\n- When heavily-shorted stocks receive positive news, short sellers must buy to cover → explosive upside (GameStop 2021).\n- Contrarian indicator: high short interest on a quality company with improving fundamentals is a strong setup.\n\n**Fund Flows:**\nAggregate net inflows or outflows from equity mutual funds and ETFs:\n- Record inflows during bull markets = late-stage sentiment (retail capitulation to buying).\n- Record outflows during bear markets = late-stage fear (retail capitulation to selling).\n- ICI weekly flow data and EPFR global flows are primary sources.\n- Classic pattern: retail investors are net buyers near tops and net sellers near bottoms.",
          highlight: [
            "put/call ratio",
            "short interest",
            "short squeeze",
            "fund flows",
            "retail capitulation",
          ],
        },
        {
          type: "teach",
          title: "Sentiment Surveys and the AAII Indicator",
          content:
            "**Survey-based sentiment** captures what investors *say* they think — which often diverges sharply from what they *do* and predicts the opposite of what they expect.\n\n**AAII Investor Sentiment Survey:**\nThe American Association of Individual Investors publishes weekly data on the percentage of respondents who are Bullish, Neutral, or Bearish about the stock market over the next 6 months.\n- Historical average: ~38% Bullish, ~31% Bearish.\n- Extreme Bullish (>55%): markets tend to underperform over the next 6 months.\n- Extreme Bearish (>50%): markets tend to *outperform* — 'the wall of worry' is being climbed.\n\n**Investor Intelligence Advisory Sentiment:**\nSurveys investment newsletter writers:\n- Bulls/Bears ratio above 3.0 (three bulls for every bear) is a classic caution signal.\n- Below 1.0 (more bears than bulls) is historically a buying opportunity.\n\n**The Survey Paradox:**\nWhy do surveys work as contrarian indicators? Because surveys measure *current* sentiment — which is largely retrospective. After a rally, people feel bullish. After a decline, bearish. By the time a consensus view is clear enough to appear in a survey, the price move driving that sentiment has already happened.\n\n**Combined signals:** The strongest setups occur when multiple independent sentiment indicators — VIX, P/C ratio, fund flows, and surveys — all point in the same extreme direction simultaneously.",
          highlight: [
            "AAII",
            "Investor Intelligence",
            "Extreme Bullish",
            "Extreme Bearish",
            "wall of worry",
            "combined signals",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "The CBOE Equity Put/Call Ratio spikes to 1.35 — a level seen only 5% of the time historically. All other things equal, how should a contrarian interpret this?",
          options: [
            "Bullish — extreme put buying signals excessive bearishness, which is typically a mean-reverting contrary indicator predicting near-term market gains",
            "Bearish — put buyers are likely well-informed institutional hedgers anticipating a major decline",
            "Neutral — the ratio only becomes meaningful above 2.0",
            "Bearish — high put demand drives down option prices, making hedging cheap and reducing the floor under stocks",
          ],
          correctIndex: 0,
          explanation:
            "A spike in the put/call ratio to historically extreme levels signals excessive bearishness — more investors are buying downside protection than at nearly any other time. Contrarian theory, supported by historical data, suggests this level of bearish positioning tends to precede market recoveries rather than declines. Most participants have already positioned for a downturn, reducing additional selling pressure. This is especially useful when combined with other fear indicators like an elevated VIX.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Record inflows into equity mutual funds and ETFs are a bullish signal because they indicate strong investor conviction and broad participation in the market rally.",
          correct: false,
          explanation:
            "Record fund inflows are historically a *bearish* contrarian signal, not a bullish one. They indicate that retail investors — who typically lag institutional investors in the sentiment cycle — have finally capitulated to buying after watching prices rise. By the time inflows reach record levels, most of the rally has already occurred, smart money is often distributing, and the marginal buyer base is exhausted. Similarly, record outflows near market bottoms are paradoxically bullish — the forced sellers have already sold.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 5: Behavioral Traps & How to Avoid Them ──────────────────────
    {
      id: "mp-5",
      title: "Behavioral Traps & How to Avoid Them",
      description:
        "FOMO, revenge trading, confirmation bias, mental accounting, and sunk cost — the psychological traps that sabotage even technically sound strategies",
      icon: "AlertTriangle",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "FOMO and Revenge Trading",
          content:
            "**FOMO (Fear Of Missing Out):**\nFOMO is the emotional drive to enter a position because of anxiety about being left behind — not because of sound analysis. It is one of the most common and costly trading mistakes.\n\nFOMO typically strikes after a big move has already occurred:\n- Stock runs 40% in a week; you missed it; it gaps up again; you buy the gap — and become the exit liquidity for those who rode the move.\n- A crypto token 10×s; Reddit and Twitter are full of stories; you FOMO in at peak euphoria.\n\n**FOMO checklist (ask these before chasing):**\n1. Was this trade on my watchlist before the move?\n2. Is my entry supported by a clear stop level?\n3. What is my risk/reward from *this price*, not from the bottom?\n4. Am I buying because of analysis or because I feel left out?\n\n**Revenge Trading:**\nAfter a loss — especially a painful or unexpected one — the emotional system demands a quick recovery. This leads to impulsive, oversized trades taken with poor analysis in an attempt to 'get back' the lost money from 'the market.'\n\nRevenge trading is loss aversion in action: the pain of the loss creates urgency to erase it, overriding the deliberate processes that govern good trading.\n\n**The rule:** After a loss exceeding a threshold you define in advance (e.g., 2× your normal daily loss limit), stop trading for the day. No exceptions. The market will be there tomorrow; your capital may not be.",
          highlight: [
            "FOMO",
            "exit liquidity",
            "revenge trading",
            "loss aversion",
            "daily loss limit",
          ],
        },
        {
          type: "teach",
          title: "Confirmation Bias and Mental Accounting",
          content:
            "**Confirmation Bias:**\nWe seek out, favor, and remember information that confirms our existing beliefs — while discounting or ignoring contradictory evidence.\n\nIn trading, this is particularly destructive because:\n- Once you have entered a position, your objectivity about that position is compromised.\n- You read bullish articles about the stock you own; bearish articles feel like attacks to defend against.\n- You remember the analyst upgrades; forget the downgrades.\n- You interpret ambiguous news as supporting your thesis.\n\n**Countermeasures:**\n- Actively seek the *best* bear case for any position you hold. Assign it a fair probability.\n- Find a 'Red Team' — someone whose job is to argue the opposite of your thesis.\n- Ask: 'What would have to be true for me to be wrong?'\n- Set a price level at which you will *re-evaluate* the thesis from scratch, not just defend it.\n\n**Mental Accounting:**\n(Richard Thaler, Nobel 2017) We treat money differently depending on its psychological 'bucket' — even though money is fungible.\n\n- 'House money' effect: profits from the market feel like free money, leading to excessive risk-taking with gains.\n- Treating a tax refund as a windfall to spend freely rather than as regular income.\n- Keeping a losing stock rather than selling and realizing the loss, because the loss only feels 'real' when booked.\n\n**Practical fix:** A dollar is a dollar regardless of its source or current status. Evaluate every position as if you were deciding whether to buy it fresh today.",
          highlight: [
            "confirmation bias",
            "Red Team",
            "mental accounting",
            "Thaler",
            "house money effect",
            "fungible",
          ],
        },
        {
          type: "teach",
          title: "Sunk Cost Fallacy and Escalation of Commitment",
          content:
            "**Sunk Cost Fallacy:**\nThe sunk cost fallacy is the tendency to continue an endeavor because of previously invested resources — money, time, emotion — even when continuing is no longer rational.\n\nIn trading, the classic manifestation:\n- 'I can't sell now, I'm down 30% — I need to at least get back to breakeven first.'\n- 'I've spent three months researching this company. If I sell at a loss, that research was wasted.'\n- 'I already added at $90 and $80. My average cost is $85 — I just need it to hit $85 to break even.'\n\n**Why it is irrational:** The money already lost is gone regardless of your future decisions. The only relevant question is: *given today's price and current information, is this the best use of this capital?* The past cost should have zero weight in that decision.\n\n**Escalation of Commitment:**\nSunk cost thinking often leads to doubling down — adding to losing positions to lower the average cost and make breakeven more achievable. This converts a manageable loss into a portfolio-destroying position.\n\n**A stark reframe:** For any position you hold, ask: 'If I had no prior position and this was cash in my account, would I *choose* to buy this stock at today's price?' If the answer is no — sell. The sunk cost is sunk. Your future returns are not.",
          highlight: [
            "sunk cost fallacy",
            "escalation of commitment",
            "doubling down",
            "breakeven trap",
            "fungible capital",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader bought 500 shares of a biotech at $60. It fell to $40 after a failed trial. She has done fresh analysis and honestly believes the stock is worth $35 at best. However, she tells herself: 'I've already lost $10,000 on this position. I can't sell now — I'll just hold until it gets back to $60 to break even.'",
          question: "Which biases are driving this decision, and what is the rational action?",
          options: [
            "Sunk cost fallacy + anchoring on cost basis; rational action is to sell immediately — the $10,000 loss is already gone and holding a stock worth $35 risks further losses",
            "Disposition effect only; rational action is to hold because recovery is statistically likely",
            "Overconfidence; the trader's valuation of $35 is likely wrong since she has a negative view of her own holding",
            "Framing effect; she should reframe the position in percentage terms to reduce anchoring",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook sunk cost fallacy combined with anchoring on the cost basis of $60. The $10,000 loss is already incurred regardless of what she does next. If her best honest estimate of fair value is $35 and the stock is at $40, she is holding a position with negative expected return — a position she would never enter fresh. Every day she holds, she is risking further losses for the psychological benefit of avoiding a 'confirmed' loss. The rational action is to sell, harvest the tax loss, and deploy capital where it can earn a positive return.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "After a profitable week, a trader takes outsized risk with 'house money' profits, reasoning that even if he loses those gains he will only be back to where he started. Which bias is this?",
          options: [
            "Mental accounting — treating gains as a separate, less valuable 'bucket' of money that warrants more risk",
            "Overconfidence — recent success makes him feel his edge is greater than it is",
            "Sunk cost fallacy — he feels compelled to continue trading to justify the effort spent",
            "Anchoring — his reference point has shifted to the start-of-week balance",
          ],
          correctIndex: 0,
          explanation:
            "This is the 'house money effect' — a specific form of mental accounting identified by Richard Thaler. When gains are placed in a separate psychological account from original capital, they are perceived as less 'real' and are treated with less risk discipline. Rationally, a dollar of profit is identical to a dollar of original capital in every way that matters for future returns. The house money framing destroys the discipline that generated the profits in the first place.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 6: Process Over Outcome ──────────────────────────────────────
    {
      id: "mp-6",
      title: "Process Over Outcome",
      description:
        "Trading journals, pre-trade checklists, post-mortem analysis, and the systematic vs. discretionary framework — building a repeatable edge",
      icon: "ClipboardList",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Resulting: Why Good Outcomes Don't Mean Good Decisions",
          content:
            "**Resulting** (a term from poker, popularized by Annie Duke) is the cognitive error of evaluating the quality of a decision by its outcome — rather than by the quality of the reasoning at the time the decision was made.\n\n**Why this is a trap:**\n- A bad decision can produce a good outcome (lucky).\n- A good decision can produce a bad outcome (unlucky).\n- If you judge process by result, you will reinforce bad processes that happened to work and abandon good processes that happened to fail.\n\n**Trading examples:**\n- You bought a penny stock on a tip, it doubled: 'I'm a genius.' (Bad process, good outcome → reinforcing bad behavior)\n- You followed your system, honored your stop, took a 1.5% loss: 'My system is broken.' (Good process, bad outcome → abandoning good behavior)\n- You held a loser without a stop and it recovered: 'Not using stops was right.' (Bad process, survivorship bias in your sample)\n\n**The professional standard:**\nProfessional traders, quantitative funds, and world-class poker players evaluate decisions on process, not outcome. The question after every trade is not 'Did I make money?' but 'Did I execute the process correctly?'\n\n**Implication:** You need a written process — so you can evaluate it consistently, improve it based on evidence, and separate luck from skill.",
          highlight: [
            "resulting",
            "Annie Duke",
            "process vs. outcome",
            "reinforcing bad behavior",
            "survivorship bias",
          ],
        },
        {
          type: "teach",
          title: "The Trading Journal and Pre-Trade Checklist",
          content:
            "**The Trading Journal** is the single most powerful tool for improving trading performance over time. Without it, you cannot distinguish a repeatable edge from a streak of luck.\n\n**What to record for every trade:**\n1. **Thesis:** Why am I entering this trade? What is the specific catalyst or setup?\n2. **Time frame:** Is this a swing trade, position trade, or intraday?\n3. **Entry price and entry rationale** — why here, not higher or lower?\n4. **Stop loss:** At what price has my thesis been invalidated?\n5. **Price target(s):** T1 (conservative) and T2 (full target).\n6. **Position size** and percentage of portfolio.\n7. **Risk/Reward ratio** at entry.\n8. **Market conditions:** trending, ranging, news-heavy?\n9. **Emotional state:** calm, anxious, FOMO, revenge?\n10. **Outcome and post-trade notes:** what worked, what did not, was the process followed?\n\n**Pre-Trade Checklist:**\nBefore every execution, a five-second mental checklist:\n- Is this setup on my pre-defined watchlist?\n- Do I have a stop level?\n- Is position size within my risk rules?\n- Am I entering because of analysis or emotion?\n- If a mentor reviewed this trade, would it be defensible?\n\nThe checklist functions like a pilot's pre-flight check — it catches errors at the moment they are cheapest to correct.",
          highlight: [
            "trading journal",
            "entry thesis",
            "stop loss",
            "risk/reward ratio",
            "pre-trade checklist",
            "position size",
          ],
        },
        {
          type: "teach",
          title: "Post-Mortem Analysis and Systematic vs. Discretionary Trading",
          content:
            "**Post-Mortem Analysis:**\nWeekly or monthly review of all completed trades to identify patterns in both wins and losses.\n\n**Key post-mortem questions:**\n- Did I follow my rules? If not, why not, and was the deviation profitable or harmful on average?\n- What is the win rate, average win, average loss, and expectancy of my trades?\n- Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss). Positive expectancy = positive edge.\n- Are there specific setup types that consistently outperform? That consistently fail?\n- Is there a time of day, sector, or market condition where my performance is materially different?\n\n**Systematic vs. Discretionary Trading:**\n- **Systematic:** Rules are fully specified in advance; the trader executes the signal regardless of current opinion. Removes bias in real time; requires extensive backtesting and forward testing to validate.\n- **Discretionary:** The trader applies judgment, context, and pattern recognition in real time. Higher ceiling for experienced practitioners; far more exposed to behavioral biases.\n- **Hybrid:** Most professionals combine both — a systematic framework for entry/exit with discretionary filters for market regime.\n\n**The bias audit:**\nUse your journal to identify which specific biases affect your trading most. Common findings:\n- 'I exit winning trades 2× faster than losing trades' → disposition effect.\n- 'My best trades come from setups I have been watching for 3+ days, not same-day entries' → FOMO chasing.\n- 'I lose more on Mondays and after a losing Friday' → revenge trading pattern.\n\nKnowledge of your specific bias profile is worth more than any indicator.",
          highlight: [
            "post-mortem",
            "expectancy",
            "systematic trading",
            "discretionary trading",
            "bias audit",
            "win rate",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A trader who consistently follows a sound process but experiences a losing month has likely made poor decisions and should revise their strategy.",
          correct: false,
          explanation:
            "This is the 'resulting' error — evaluating process quality by a short-term outcome. A one-month losing period is well within normal variance for any positive-expectancy strategy. The correct evaluation criterion is whether the rules were followed correctly, not whether the outcomes were favorable. Most professional trading strategies experience 3–6 month drawdown periods even when the edge is intact. Revising strategy after a losing month due to outcome alone is a form of 'resulting' that leads to constant, counterproductive tinkering.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "A trader calculates that over her last 200 trades, she wins 45% of the time with an average win of $800 and loses 55% of the time with an average loss of $400. What is her expectancy per trade, and what does it imply?",
          options: [
            "Expectancy = +$140; positive edge — she should continue and scale the strategy",
            "Expectancy = -$140; losing strategy despite winning less than half the time",
            "Expectancy = $0; the win rate and loss rate are balanced by the size difference",
            "Cannot be determined — expectancy requires more than 1,000 trades for statistical validity",
          ],
          correctIndex: 0,
          explanation:
            "Expectancy = (0.45 × $800) − (0.55 × $400) = $360 − $220 = +$140 per trade. This is a positive-expectancy strategy despite a below-50% win rate. The key insight: win rate alone is meaningless without also knowing the average win and average loss. A 35% win rate with 3:1 average win/loss is far more profitable than a 60% win rate with 1:2 win/loss. Many consistently profitable strategies (trend-following, breakout trading) win fewer than half their trades but make it back through large average winners.",
          difficulty: 2,
        },
      ],
    },
  ],
};
