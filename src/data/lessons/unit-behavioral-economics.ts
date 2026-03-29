import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_ECONOMICS: Unit = {
  id: "behavioral-economics",
  title: "Behavioral Economics",
  description:
    "Explore the psychology behind financial decisions — from cognitive heuristics and prospect theory to social anomalies and evidence-based debiasing strategies",
  icon: "Brain",
  color: "#7C3AED",
  lessons: [
    // ─── Lesson 1: Heuristics & Biases ───────────────────────────────────────
    {
      id: "be-heuristics-biases",
      title: "Heuristics & Biases",
      description:
        "Kahneman's System 1 vs System 2 thinking, anchoring, availability, overconfidence, hindsight bias, framing, and the hot-hand fallacy in investing",
      icon: "Brain",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "System 1 vs System 2: Two Ways of Thinking",
          content:
            "Nobel laureate **Daniel Kahneman** described two distinct modes of human cognition in his landmark work *Thinking, Fast and Slow*.\n\n**System 1 (Fast thinking):**\n- Operates automatically and quickly with little or no effort\n- Associative, emotional, pattern-matching\n- Uses mental shortcuts called **heuristics**\n- Fires first — often before System 2 is even engaged\n- Examples: recognizing a face, sensing danger, gut feelings about a stock\n\n**System 2 (Slow thinking):**\n- Deliberate, analytical, logical — requires conscious effort\n- Has limited capacity — gets fatigued and is easily overridden by System 1\n- Examples: calculating a discounted cash flow, evaluating a balance sheet\n\n**Why this matters for investors:**\nMost investing errors happen when System 1 hijacks decisions that require System 2. Market volatility, vivid news, and the emotional pain of losses all activate System 1 responses — panic selling, chasing momentum, freezing in uncertainty.\n\n**Heuristics** are mental shortcuts System 1 uses to make fast decisions. They often work well in everyday life but create predictable, systematic **biases** in financial contexts. Key heuristics include: representativeness, availability, and anchoring — each with distinct investment implications.\n\nThe goal of behavioral economics is not to eliminate intuition (System 1 is often useful) but to identify when slow, deliberate analysis is essential.",
          highlight: ["Kahneman", "System 1", "System 2", "heuristics", "biases", "Thinking, Fast and Slow"],
        },
        {
          type: "teach",
          title: "Representativeness & Availability Heuristics",
          content:
            "**Representativeness Heuristic:** We judge probability by resemblance to a prototype, ignoring statistical base rates.\n\n- A company with soaring revenue, a charismatic CEO, and a revolutionary product *looks like* a great investment — so investors pile in, ignoring the base rate that most hyped companies disappoint\n- A stock that rose 60% last year *looks like* a winner — representativeness makes investors extrapolate past returns, ignoring mean reversion\n- The **conjunction fallacy**: people judge a specific scenario as more probable than a general one because it 'fits a story' better. ('Tech stock that beats earnings' feels more likely than 'stock that beats earnings' — even though the specific case cannot be more probable than the general)\n\n**Availability Heuristic:** We judge probability by how easily examples come to mind — not by actual frequency.\n\n- After a dramatic market crash dominates the news, investors overestimate the chance of another crash. The vivid memory makes it feel imminent.\n- Stocks you hear about constantly — from friends, podcasts, financial media — feel safer and more promising than obscure companies, regardless of merit\n- The **hot-hand fallacy** in investing: after a fund manager posts three great years, investors pour in capital assuming the streak will continue — extrapolating a hot hand that may be mostly luck\n\n**Key insight:** Dramatic, recent, emotionally charged events are 'available' in memory — they feel more probable than quiet, statistically common events. This creates systematic overreaction to news and underreaction to boring fundamentals.",
          highlight: ["representativeness heuristic", "availability heuristic", "conjunction fallacy", "base rates", "hot-hand fallacy", "mean reversion"],
        },
        {
          type: "teach",
          title: "Anchoring, Overconfidence, Hindsight Bias & Framing",
          content:
            "**Anchoring Effect:** The first number encountered becomes a reference point that distorts subsequent estimates.\n- Kahneman and Tversky showed that even *arbitrary* numbers (a rigged roulette wheel) influence estimates of completely unrelated facts\n- In investing: the purchase price, 52-week high, or an analyst's price target anchors investor perception. A stock at $75 feels 'cheap' if the anchor is $100 — regardless of intrinsic value\n- Round numbers ($100, $500, $1,000) act as psychological anchors — creating resistance/support levels purely from collective psychology\n\n**Overconfidence Bias:** People systematically overestimate the accuracy of their knowledge and predictions.\n- The classic finding: **93% of U.S. drivers rate themselves as above-average** — a statistical impossibility\n- Investors overestimate the precision of their earnings forecasts, trading more than is rational and underestimating tail risks\n- Overconfidence drives excessive trading (Odean's research showed frequent traders underperform by ~2.6% annually vs. buy-and-hold)\n\n**Hindsight Bias:** After an event occurs, people believe they 'knew it all along' — memory rewrites itself.\n- After the 2008 financial crisis, many investors claimed the warning signs were obvious. In real time, far fewer saw it coming.\n- Hindsight bias prevents learning from mistakes — you can't improve a decision you've convinced yourself was correct all along\n\n**Framing Effects:** How information is presented changes the decision, even when the underlying facts are identical.\n- '90% survival rate' vs '10% mortality rate' — same statistic, different emotional response, different decisions\n- A fund described as 'up 15% in good years' feels better than one described as 'down 5% in bad years' even if both describe identical return distributions",
          highlight: ["anchoring effect", "overconfidence", "hindsight bias", "framing effects", "above-average driver", "Odean"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor bought shares at $120. The stock has fallen to $70 based on deteriorating fundamentals. She says, 'I'll sell when it gets back to $120.' Which bias best describes this?",
          options: [
            "Anchoring bias — the $120 purchase price is an irrelevant reference point distorting her sell decision",
            "Availability bias — the memory of paying $120 is vivid and makes her overestimate a recovery",
            "Representativeness heuristic — the stock resembles past winners that eventually recovered",
            "Hot-hand fallacy — she assumes the stock's prior uptrend will resume",
          ],
          correctIndex: 0,
          explanation:
            "This is textbook anchoring bias. The $120 purchase price has no bearing on the stock's future intrinsic value — the market does not know or care what she paid. Fundamentals have deteriorated, meaning the fair value may be well below $70. A rational investor evaluates the stock from scratch: 'What is this worth going forward?' The anchor prevents this objective assessment and keeps capital tied up in a declining position.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The hot-hand fallacy in investing refers to the tendency to believe that a fund manager or stock that has recently outperformed will continue to do so, even when the performance was largely due to luck.",
          correct: true,
          explanation:
            "Correct. The hot-hand fallacy (a form of the availability and representativeness heuristics) leads investors to chase recent winners. Research consistently shows that past fund performance has limited predictive power for future returns — most outperformance regresses to the mean. Investors who pour money into last year's top fund often suffer below-average returns in subsequent years.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Prospect Theory & Decisions ───────────────────────────────
    {
      id: "be-prospect-theory",
      title: "Prospect Theory & Decisions Under Uncertainty",
      description:
        "Kahneman-Tversky value function, loss aversion, diminishing sensitivity, endowment effect, mental accounting, sunk cost fallacy, and ambiguity aversion",
      icon: "Brain",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Prospect Theory: How We Actually Value Gains and Losses",
          content:
            "**Prospect Theory**, developed by **Daniel Kahneman and Amos Tversky** in 1979, is the cornerstone of behavioral economics. It describes how people actually make decisions under uncertainty — as opposed to how the 'rational agent' of classical economics would.\n\n**The Value Function — three key properties:**\n\n1. **Reference point dependence:** We evaluate outcomes as *gains* or *losses* relative to a reference point (usually the status quo or purchase price), not as absolute wealth levels. A stock at $80 feels like a $20 loss if you paid $100, but a $30 gain if you paid $50 — same price, opposite emotional experience.\n\n2. **Loss aversion:** Losses loom larger than equivalent gains. The pain of losing $1 is approximately **twice as intense** as the pleasure of gaining $1. This is why the displeasure of a -$1,000 loss far exceeds the pleasure of a +$1,000 gain of identical size.\n\n3. **Diminishing sensitivity:** Both pleasure from gains and pain from losses diminish at the margin. The difference between losing $100 and $200 feels much larger than the difference between losing $1,100 and $1,200 — even though both are $100 increments. The value function is concave in the gain domain (risk-averse) and convex in the loss domain (risk-seeking).\n\n**Investment implication:** Loss aversion explains why investors hold losing positions far too long (hoping to avoid realizing a loss) and sell winners too quickly (locking in the pleasure of a gain). This is called the **disposition effect** — one of the most robustly documented phenomena in investment research.",
          highlight: ["Kahneman", "Tversky", "prospect theory", "reference point", "loss aversion", "diminishing sensitivity", "disposition effect"],
        },
        {
          type: "teach",
          title: "Endowment Effect, Status Quo Bias & Mental Accounting",
          content:
            "**Endowment Effect:** Once you own something, you value it more than you would if you didn't own it — ownership increases perceived value.\n\n- Kahneman's classic experiment: people given a coffee mug demanded much more to sell it than others were willing to pay to buy an identical mug. Ownership creates attachment.\n- In investing: investors cling to inherited stocks or positions they've held for years with an inflated sense of their value, even when the objective case for selling is clear.\n\n**Status Quo Bias:** A preference for the current state of affairs — change feels risky even when it's objectively beneficial.\n- Closely related to loss aversion: any deviation from the status quo creates potential 'losses' that loom larger than potential 'gains'\n- Leads to portfolio inertia — investors fail to rebalance, fail to cut losses, fail to update allocations even when circumstances have changed dramatically\n\n**Mental Accounting:** People divide money into separate psychological 'buckets' and apply different rules to each — even though money is fungible.\n- A $500 tax refund is often spent frivolously ('found money'), while $500 from regular income would be saved — same $500, different treatment\n- Investors keep a 'gambling account' in speculative stocks separate from their 'safe retirement account,' taking risks in the gambling account they would never accept overall\n- Dividends are mentally treated as 'income' (safe to spend), while capital appreciation is 'wealth' (keep invested) — an economically irrational distinction\n- **Sunk cost fallacy:** Continuing to invest time, money, or emotion into a losing position because of what has already been spent — even though past costs are irretrievable and irrelevant to future decisions. 'I've already lost $20,000 — I can't sell now.'",
          highlight: ["endowment effect", "status quo bias", "mental accounting", "sunk cost fallacy", "portfolio inertia", "fungible"],
        },
        {
          type: "teach",
          title: "Ambiguity Aversion & Narrow vs Broad Framing",
          content:
            "**Ambiguity Aversion (Ellsberg Paradox):** People prefer known risks over unknown risks — even when the unknown risk is mathematically superior.\n\nEllsberg's classic 1961 experiment: An urn contains 30 red balls and 60 balls that are either black or yellow (ratio unknown). People prefer betting on red (known 30/90 probability) over black (unknown probability) — even though a rational agent would be indifferent, and even though choosing black + yellow dominates choosing red + yellow.\n\n**In investing:**\n- Investors favor domestic stocks over foreign stocks — the home market feels 'known' even when international diversification would reduce risk (home bias)\n- Investors avoid 'complex' instruments like index funds or ETFs in favor of familiar individual stocks, even when the unfamiliar option is clearly superior\n- Startups and emerging markets feel 'too risky' — the ambiguity of unknown distributions repels capital even at compelling prices\n\n**Narrow Framing vs Broad Framing:**\n- **Narrow framing:** Evaluating each investment in isolation, as its own mental account\n- **Broad framing:** Evaluating investments as part of a whole portfolio\n\nNarrow framing amplifies loss aversion: checking a stock's price daily means experiencing frequent small losses that trigger the loss aversion pain response, even in an otherwise healthy portfolio. Broad framing (evaluating portfolio-level returns monthly or quarterly) dramatically reduces this emotional volatility and leads to better long-run decisions.\n\nThaler showed that investors with the same portfolio who checked prices daily vs. annually made dramatically different asset allocation choices — daily checkers chose much more conservative allocations due to myopic loss aversion.",
          highlight: ["ambiguity aversion", "Ellsberg paradox", "home bias", "narrow framing", "broad framing", "myopic loss aversion"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor holds a stock that has fallen 40% from her purchase price. She knows fundamentals have deteriorated, but refuses to sell, saying 'I've already lost so much — I can't sell now.' Which behavioral concept primarily explains her reluctance?",
          options: [
            "Sunk cost fallacy combined with loss aversion — past losses are irrelevant but feel like a reason to hold on",
            "Availability heuristic — the loss is mentally vivid so she overweights the probability of further decline",
            "Narrow framing — she is evaluating this stock in isolation from her broader portfolio",
            "Ambiguity aversion — the outcome of selling feels more uncertain than holding",
          ],
          correctIndex: 0,
          explanation:
            "This is the sunk cost fallacy reinforced by loss aversion. The money already lost is sunk — irretrievable regardless of future action. The rational question is: 'Given where the stock is today, what is the best forward-looking decision?' Loss aversion makes the prospect of 'locking in' the loss psychologically painful, leading investors to hold deteriorating positions far longer than is rational. The disposition effect — holding losers too long and selling winners too soon — is one of the most robustly documented phenomena in investment research.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "According to prospect theory's diminishing sensitivity, the psychological difference between a $100 loss and a $200 loss feels larger than the difference between a $1,100 loss and a $1,200 loss.",
          correct: true,
          explanation:
            "Correct. Diminishing sensitivity means the value function is steepest near the reference point and flattens as gains or losses grow larger. The jump from -$100 to -$200 is felt intensely because we are still close to zero (the reference point). The same $100 increment at -$1,100 to -$1,200 is felt much less acutely because we are already deep in loss territory. This is why adding a small surcharge to an already-expensive item feels negligible, and why the first small loss hurts most.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Social & Market Anomalies ─────────────────────────────────
    {
      id: "be-market-anomalies",
      title: "Social Behavior & Market Anomalies",
      description:
        "Herding, information cascades, calendar effects, momentum, value anomaly, post-earnings drift, IPO underperformance, and limits to arbitrage",
      icon: "Brain",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Herding, Information Cascades & Social Proof",
          content:
            "**Herding behavior** occurs when investors follow the crowd rather than acting on their own independent analysis — even when they privately suspect the crowd may be wrong.\n\n**Why herding happens:**\n- **Social proof**: In uncertain situations, observing others' behavior is informative. If thousands of investors are buying a stock, that 'consensus' feels like evidence of quality.\n- **Reputational safety**: Fund managers face career risk for being wrong when alone, but not for being wrong in company. 'Nobody gets fired for buying IBM' — under-performance is tolerable if everyone else under-performs too.\n- **Information cascades**: When each person's private information is weak but observable actions are informative, rational individuals can cascade into ignoring their own signals. If Alice buys, Bob observes Alice and buys. Carol observes Alice and Bob and buys — even if Carol's private signal said 'sell.' The cascade overwhelms private information.\n\n**Market consequences of herding:**\n- Momentum — stocks that have risen attract more buyers, driving prices further in the same direction\n- Bubbles — collective buying inflates valuations far beyond fundamentals\n- Crashes — collective selling creates self-reinforcing price declines\n- Sector rotation — entire sectors become fashionable or unfashionable as capital herds in and out\n\n**Social proof in practice:** Retail investors in 2021 herded into meme stocks driven by Reddit communities — a pure social proof cascade where the quality of the underlying business was largely irrelevant. Volume and attention became self-reinforcing.",
          highlight: ["herding behavior", "information cascade", "social proof", "reputational safety", "momentum", "meme stocks"],
        },
        {
          type: "teach",
          title: "Market Anomalies: Calendar Effects, Momentum & Value",
          content:
            "If markets were perfectly efficient, no predictable pattern should persist. Yet decades of research document systematic anomalies:\n\n**Calendar Anomalies:**\n- **January Effect**: Small-cap stocks historically outperform in January. Explanation: tax-loss selling in December depresses prices; January brings buying back. Anomaly has weakened as it became widely known.\n- **Monday Effect**: Historically negative average returns on Mondays — possibly because bad news is released on weekends.\n\n**Momentum Anomaly:**\n- Stocks that have outperformed over the past **3–12 months** tend to continue outperforming over the *next* 3–12 months (Jegadeesh and Titman, 1993)\n- Explanation candidates: investor underreaction to good news (slow information diffusion), herding, or positive feedback trading\n- Momentum crashes violently during market reversals — a well-documented tail risk\n\n**Value Anomaly:**\n- Cheap stocks (low P/E, low P/B, high dividend yield) tend to outperform expensive stocks over **long horizons** (Fama and French, 1992)\n- Behavioral explanation: investors extrapolate recent growth too far into the future, overpricing glamour stocks and underpricing boring value stocks\n- Investors are overconfident in the persistence of earnings growth, creating systematic mispricings\n\n**Post-Earnings Announcement Drift (PEAD):**\n- After a positive earnings surprise, stocks continue drifting upward for weeks/months — not immediately repricing fully\n- Classic evidence of investor underreaction — markets absorb earnings surprises slowly rather than instantaneously\n- Suggests information processing is sluggish, contradicting strong-form efficiency",
          highlight: ["January effect", "momentum anomaly", "value anomaly", "PEAD", "post-earnings announcement drift", "Jegadeesh", "Fama", "French"],
        },
        {
          type: "teach",
          title: "IPO Puzzle, Closed-End Funds & Limits to Arbitrage",
          content:
            "**IPO Underperformance Puzzle:**\n- IPOs are famously underpriced on the first day (average 10–20% 'pop') — creating a windfall for initial allocants\n- But over 3–5 year horizons, IPOs systematically underperform comparable seasoned firms (Ritter, 1991)\n- Behavioral explanation: investor optimism and media hype push IPO prices above fair value on day one; reality gradually asserts itself\n\n**Closed-End Fund Discount:**\n- A closed-end fund holds publicly traded assets with a known market value (NAV), yet routinely trades at a **10–20% discount** to NAV\n- If markets were efficient, rational arbitrageurs would buy the fund and short the underlying holdings, capturing the discount risk-free\n- Yet the discount persists — demonstrating **limits to arbitrage**\n\n**Limits to Arbitrage — why mispricings persist:**\nShleifer and Vishny identified three key constraints that prevent rational investors from correcting mispricings:\n\n1. **Noise trader risk**: Irrational investors can push mispricings further before they correct. An arbitrageur who is right but early will lose money before being proven right — a risk that limits position sizes.\n2. **Synchronization risk**: Even if every arbitrageur individually recognizes a mispricing, each needs to know that *others* will also act to correct it. Uncertainty about when others will trade prevents coordinated correction.\n3. **Capital constraints**: Arbitrage strategies require capital. If prices move against an arbitrageur before correcting, margin calls can force liquidation at exactly the wrong moment ('the market can stay irrational longer than you can stay solvent' — attributed to Keynes).\n\n**The efficient market debate:** These anomalies challenge the efficient market hypothesis. Proponents argue anomalies disappear once discovered and transaction costs are accounted for. Critics argue behavioral biases are too persistent and deep-seated to be arbitraged away completely.",
          highlight: ["IPO underperformance", "closed-end fund discount", "limits to arbitrage", "noise trader risk", "synchronization risk", "capital constraints", "Shleifer", "Vishny"],
        },
        {
          type: "quiz-mc",
          question:
            "A closed-end fund holds $100M in publicly traded stocks but trades at a market cap of $85M — a 15% discount to NAV. Why doesn't rational arbitrage immediately eliminate this discount?",
          options: [
            "Limits to arbitrage — noise trader risk, synchronization risk, and capital constraints prevent arbitrageurs from correcting the mispricing",
            "The January effect depresses closed-end fund prices in December before a recovery",
            "Post-earnings announcement drift causes the underlying stocks to gradually reprice upward",
            "Representativeness bias makes investors treat the fund as lower quality than its holdings",
          ],
          correctIndex: 0,
          explanation:
            "The closed-end fund discount is a classic demonstration of limits to arbitrage (Shleifer and Vishny). Even though the arbitrage seems obvious — buy the fund, short the holdings, pocket the 15% — in practice: (1) noise traders may push the discount wider before it closes, causing mark-to-market losses; (2) no single arbitrageur knows when others will act; (3) if a fund manager faces redemptions while the trade moves against them, they're forced to liquidate at a loss. These frictions allow persistent mispricings that perfectly efficient markets cannot accommodate.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An analyst reads that a growth stock has beaten earnings estimates for five consecutive quarters. She reasons: 'This company has a hot hand — management clearly knows what they're doing. The streak will continue.' She upgrades the stock to a strong buy.",
          question: "Which combination of behavioral biases is most evident in the analyst's reasoning?",
          options: [
            "Hot-hand fallacy and representativeness heuristic — extrapolating past success as representative of future performance",
            "Anchoring and framing — the five-quarter streak anchors her expectations upward",
            "Ambiguity aversion and status quo bias — she avoids changing her prior neutral stance",
            "Sunk cost fallacy and loss aversion — past research investment makes her reluctant to downgrade",
          ],
          correctIndex: 0,
          explanation:
            "The analyst is committing the hot-hand fallacy (a form of the availability heuristic — the streak is vivid and memorable) combined with the representativeness heuristic (five consecutive beats looks like a 'winner' template). The base rate reality: earnings surprises have low serial correlation — beating five times does not meaningfully predict the sixth beat. Mean reversion is far more common than perpetual outperformance. A rigorous analyst would ask whether the company's competitive position and future earnings power justify the current valuation, not whether past surprises pattern-match to a winner archetype.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Applied Behavioral Finance ────────────────────────────────
    {
      id: "be-applied",
      title: "Applied Behavioral Finance",
      description:
        "Nudge theory in practice, SAVE MORE TOMORROW, default effects in 401k, robo-advisor guardrails, debiasing strategies, investment policy statements, and dollar-cost averaging",
      icon: "Brain",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Nudge Theory in Practice: Opt-Out Defaults & the 401(k)",
          content:
            "**Nudge theory**, formalized by **Richard Thaler** and **Cass Sunstein** in their 2008 book *Nudge*, proposes that choice architecture — the way options are presented — can predictably influence behavior without restricting freedom or changing incentives.\n\nThe most powerful architectural element is the **default option**: whatever happens if no active choice is made.\n\n**The 401(k) natural experiment:**\nWhen employers switched 401(k) enrollment from **opt-in** (employee must actively sign up) to **opt-out** (enrolled automatically unless employee actively withdraws), participation rates jumped from ~40–60% to over 90% — same plan, same employer match, dramatically different retirement savings outcomes.\n\n**Why defaults are so sticky:**\n- **Status quo bias** — changing requires effort; the default feels like the 'recommended' option\n- **Present bias** — opting out requires immediate action for a future benefit, which people systematically undervalue\n- **Implied endorsement** — the default signals what is normal or expected\n- **Inertia** — most decisions don't get actively revisited\n\n**Default effect breadth:**\nResearch shows defaults influence:\n- Organ donation rates (opt-out countries have 3-4× higher rates)\n- Green energy enrollment\n- Insurance coverage levels\n- Default investment fund selection in retirement plans\n\nThe critical insight for policy and product design: *you cannot avoid creating a default.* The question is only which default to choose — and choosing thoughtfully can dramatically improve outcomes at zero cost.",
          highlight: ["nudge theory", "Thaler", "Sunstein", "default option", "opt-out", "status quo bias", "401(k)", "present bias"],
        },
        {
          type: "teach",
          title: "SAVE MORE TOMORROW & Robo-Advisor Guardrails",
          content:
            "**SAVE MORE TOMORROW (SMarT Program)** — Thaler and Benartzi's landmark 2004 intervention:\n\nThe insight: people want to save more but fail due to present bias (the future feels abstract; sacrifice now feels concrete). The SMarT solution uses behavioral forces against themselves:\n1. Employees commit *in advance* to increasing their 401(k) contribution rate with each future pay raise\n2. Because the increase is tied to a raise, it never feels like a pay cut — loss aversion is neutralized\n3. The commitment is automatic — inertia works *for* saving instead of against it\n4. Opt-out at any time — no coercion\n\nResults: employees who enrolled saw contribution rates rise from 3.5% to 13.6% over 40 months. The program is now used by thousands of U.S. employers.\n\n**Robo-Advisor Behavioral Guardrails:**\nModern robo-advisors (Betterment, Wealthfront, Vanguard Digital Advisor) embed behavioral guardrails:\n- **Automatic rebalancing**: removes the emotional barrier to selling outperformers and buying laggards — counters disposition effect\n- **Tax-loss harvesting**: systematic — removes the psychological pain of actively realizing losses\n- **Framing**: show long-term goals, not daily P&L — reduces myopic loss aversion\n- **Friction on panic selling**: some robo-advisors add confirmation steps or cooling-off periods during market crashes\n- **Nudges toward diversification**: default portfolios are globally diversified — counters home bias and familiarity bias\n- **Goal-based framing**: 'retirement in 25 years' framing keeps investors anchored to long-term outcomes during short-term volatility",
          highlight: ["SAVE MORE TOMORROW", "SMarT", "Benartzi", "present bias", "robo-advisor", "automatic rebalancing", "behavioral guardrails", "myopic loss aversion"],
        },
        {
          type: "teach",
          title: "Debiasing Strategies & the Investment Policy Statement",
          content:
            "No one can fully eliminate cognitive biases — they are hard-wired features of human cognition. But evidence-based **debiasing strategies** can dramatically reduce their impact:\n\n**Pre-commitment devices:**\n- Decide sell rules *before* buying: 'I will sell if the stock falls 15% or if earnings estimates fall below X'\n- Written rules bypass loss aversion at the moment of decision — the commitment was made when emotions were calm\n- Warren Buffett's practice of writing his investment thesis before buying, then referring back to it when tempted to sell\n\n**Checklists:**\nAviators, surgeons, and astronauts use checklists to override System 1 in high-stakes decisions. Investors can use:\n- Valuation checklist: P/E, P/B, EV/EBITDA, DCF — forces systematic analysis before buying on story alone\n- Pre-mortem analysis: 'Imagine this investment has failed in 2 years — what went wrong?' Surfaces risks that optimism bias conceals\n\n**Rules-based investing:**\nSystematic strategies (rebalance quarterly, add to positions on 20% dips, exit on fundamental deterioration) replace case-by-case emotional decisions with pre-committed rules.\n\n**Investment Policy Statement (IPS):**\nA written document specifying investment objectives, risk tolerance, asset allocation targets, rebalancing rules, and prohibited behaviors. Functions as:\n- A commitment device that constrains future emotional decisions\n- A reference point that counters anchoring to recent market prices\n- A tool for overcoming status quo bias by requiring periodic review\n\n**Systematic rebalancing** to overcome the **disposition effect**: rebalancing requires selling winners (uncomfortable) and buying losers (counterintuitive) — the opposite of the disposition effect's emotional pull. Automation removes the emotional friction.\n\n**Dollar-cost averaging (DCA):** Investing a fixed dollar amount at regular intervals regardless of price. DCA is primarily valuable as **behavior management** — it prevents market-timing mistakes driven by fear (avoiding markets at bottoms) and greed (deploying large sums at peaks). It also exploits availability bias constructively: systematic buying continues even when fearful headlines would cause emotional investors to pause.",
          highlight: ["pre-commitment", "checklists", "rules-based investing", "investment policy statement", "systematic rebalancing", "disposition effect", "dollar-cost averaging", "DCA", "pre-mortem"],
        },
        {
          type: "quiz-mc",
          question:
            "A financial advisor designs a 401(k) plan where employees are automatically enrolled at a 6% contribution rate with a default target-date fund, but can change any parameter at any time. This design primarily leverages which behavioral principle?",
          options: [
            "Default effect and status quo bias — most employees will stick with the auto-enrolled settings due to inertia",
            "Framing effect — the 6% rate makes higher contributions feel more normal",
            "SAVE MORE TOMORROW — contributions increase automatically with future raises",
            "Narrow framing — evaluating the 401(k) in isolation from other savings makes 6% feel sufficient",
          ],
          correctIndex: 0,
          explanation:
            "Auto-enrollment with a default contribution rate and fund selection is the classic application of the default effect (Thaler and Sunstein's nudge theory). Status quo bias and inertia mean that most employees who are auto-enrolled will remain enrolled and keep the default settings — dramatically improving savings rates vs. opt-in plans. The freedom to change any parameter at any time means this is a nudge, not a mandate — preserving libertarian choice while using paternalistic defaults to improve outcomes (what Thaler calls 'libertarian paternalism').",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Dollar-cost averaging (DCA) is primarily valuable as a behavior management tool because it removes the need to time the market and prevents fear-driven pauses in investing during downturns.",
          correct: true,
          explanation:
            "Correct. In a purely mathematical sense, lump-sum investing outperforms DCA approximately two-thirds of the time in rising markets (Vanguard research). However, DCA's greatest real-world value is behavioral: it removes the temptation to wait for 'the right moment,' prevents panic-driven cessation of investing during market drops, and systematically deploys capital regardless of short-term sentiment. For most investors, the guaranteed behavior management benefit of DCA outweighs the theoretical cost of not investing a lump sum immediately.",
          difficulty: 2,
        },
      ],
    },
  ],
};
