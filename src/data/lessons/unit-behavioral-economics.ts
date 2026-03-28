import type { Unit } from "./types";

export const UNIT_BEHAVIORAL_ECONOMICS: Unit = {
  id: "behavioral-economics",
  title: "Behavioral Economics",
  description:
    "Apply behavioral insights to financial decisions — nudge theory, mental accounting, overconfidence, herding, time preference, and debiasing",
  icon: "Lightbulb",
  color: "#f59e0b",
  lessons: [
    // ─── Lesson 1: Nudge Theory & Choice Architecture ────────────────────────
    {
      id: "be-1",
      title: "Nudge Theory & Choice Architecture",
      description:
        "Default options power, opt-in vs opt-out, present bias, and commitment devices that shape financial behavior",
      icon: "Lightbulb",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Choice Architecture: How Defaults Shape Decisions",
          content:
            "**Nudge Theory**, developed by economists **Richard Thaler** and **Cass Sunstein**, holds that the way choices are presented — the *choice architecture* — has an enormous influence on the decisions people make, even when the underlying options are identical.\n\nThe most powerful architectural element is the **default option**: whatever happens if a person takes no active action.\n\n**Why defaults are so sticky:**\n- **Status quo bias** — people have a strong preference for the current state of affairs; changing requires effort and feels risky\n- **Implied endorsement** — people infer that the default is the recommended or normal choice\n- **Present bias** — opting out requires immediate effort for a future benefit, which people systematically undervalue\n- **Inertia** — cognitive load means many decisions never get actively revisited\n\n**The 401(k) natural experiment:**\nWhen firms switched 401(k) enrollment from **opt-in** (employee must actively join) to **opt-out** (enrolled automatically unless employee actively withdraws), participation rates jumped from roughly **40–60% to over 90%** — with no change in the plan's features or employer match. The same employees, the same incentives, but dramatically different retirement savings outcomes purely from reframing the default.\n\nFor financial behavior, defaults influence:\n- Savings rates and contribution amounts\n- Asset allocation (default investment fund choices)\n- Automatic bill payment and overdraft protection enrollment\n- Insurance coverage levels",
          highlight: ["Thaler", "Sunstein", "default option", "choice architecture", "status quo bias", "opt-out", "401(k)"],
        },
        {
          type: "teach",
          title: "Opt-In vs Opt-Out: The Power of Framing",
          content:
            "The difference between **opt-in** (active enrollment required) and **opt-out** (automatic enrollment unless declined) is among the most studied phenomena in applied behavioral economics.\n\n**Organ donation studies (Johnson & Goldstein, 2003):**\nCountries with opt-out organ donation policies have consent rates near **95–99%**. Countries with opt-in policies average **15–30%** consent. Same people, same values, different default — radically different outcomes.\n\n**Financial applications:**\n\n**Save More Tomorrow (SMarT) program (Thaler & Benartzi):**\nEmployees pre-commit to increasing their savings rate with each future raise. Because the commitment is about *future* behavior, present bias is bypassed. Savings rates in SMarT pilot programs tripled over four years without requiring employees to sacrifice current income.\n\n**Automatic escalation:** Many 401(k) plans now auto-escalate contribution rates by 1% per year. Employees could opt out but rarely do. The result: significantly higher retirement balances with no active effort from participants.\n\n**Credit card minimums:** Setting a higher minimum payment default (or showing payoff timelines) reduces debt accumulation — people anchor to and pay closer to the displayed amount.\n\n**Key insight:** Presenting the same choice as \"opt out of saving\" rather than \"opt into saving\" changes the psychological weight. The first feels like *keeping* something; the second feels like *giving something up*. Loss aversion amplifies default stickiness.",
          highlight: ["opt-in", "opt-out", "Save More Tomorrow", "SMarT", "auto-escalate", "loss aversion", "present bias"],
        },
        {
          type: "teach",
          title: "Commitment Devices: Binding Your Future Self",
          content:
            "A **commitment device** is a mechanism by which people voluntarily restrict their future choices to overcome predictable self-control failures. They work because people recognize their future self will face the same present bias and temptations — and pre-emptively neutralize them.\n\n**Classic financial commitment devices:**\n\n**Illiquid savings accounts:** Christmas Club accounts, certificates of deposit with early withdrawal penalties, and 401(k) early withdrawal penalties are all commitment devices. The penalty does not just reduce withdrawals mechanically — it re-frames the choice. Withdrawing feels like paying a fine, activating loss aversion.\n\n**Automatic investment plans:** Setting up automatic monthly transfers to investment accounts removes the need for willpower. The money is gone before the present-biased mind can redirect it to consumption.\n\n**Ulysses contracts in finance:** Named after Odysseus tying himself to the mast, some investors set irrevocable instructions with brokers — e.g., do not accept sell orders below a specified price — to prevent panic selling.\n\n**Goal-labeled accounts:** Behavioral research (Soman & Cheema) shows people spend less from accounts explicitly labeled with a goal (\"College Fund\", \"Emergency Reserve\") versus a generic savings account, even with identical funds and access.\n\n**The underlying mechanism:** Commitment devices exploit the fact that preferences are **time-inconsistent**. We prefer patient choices in the abstract (future) but impatient choices in the moment (present). A commitment device binds the future impatient self to the present patient self's preferences.",
          highlight: ["commitment device", "time-inconsistent", "Ulysses contract", "illiquid savings", "goal-labeled accounts", "automatic investment"],
        },
        {
          type: "quiz-mc",
          question:
            "A company switches its 401(k) from opt-in to opt-out enrollment with no changes to plan features or employer match. Participation jumps from 55% to 92%. What behavioral phenomenon most directly explains this result?",
          options: [
            "Default effect and status quo bias — people inertly accept whatever option requires no active decision",
            "Loss aversion — employees fear losing employer match more under opt-out",
            "Anchoring — the 92% figure anchors employee expectations upward",
            "Herding — employees follow colleagues who enrolled",
          ],
          correctIndex: 0,
          explanation:
            "The dramatic participation increase is explained by the default effect combined with status quo bias and inertia. Under opt-out, enrollment is the default — accepting it requires no action. Under opt-in, enrollment requires active effort, which most people postpone indefinitely due to present bias and cognitive load. The plan itself did not change; only the framing of what happens if the employee does nothing changed. This is one of the most replicated findings in applied behavioral economics.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Commitment devices are only useful for people with diagnosed impulse control problems; financially disciplined individuals have no use for them.",
          correct: false,
          explanation:
            "Commitment devices are valuable for virtually everyone because present bias is a universal human tendency, not a pathology limited to impulsive individuals. Behavioral economists, including Thaler and Benartzi who designed SMarT, use automatic investment plans themselves. The key insight is that even disciplined people face different preferences in the abstract (future) versus in the moment (present). Commitment devices like automatic transfers, illiquid accounts, or pre-committed escalation lock in the calm, forward-looking preference before present-biased impulses can override it.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A fintech startup is designing a new savings app. Option A: users see an empty savings account and a button labeled 'Start Saving.' Option B: users are enrolled in a 10% income savings plan at signup and see a button labeled 'Reduce or Stop Saving.' Both apps have identical fee structures and interest rates.",
          question: "Based on nudge theory, which app design will likely produce higher average savings rates, and why?",
          options: [
            "Option B — the opt-out default, combined with status quo bias and loss aversion (opting out feels like losing savings), will retain most users at the 10% rate",
            "Option A — users who actively choose to save will be more committed and save more over time",
            "Both will produce identical results — sophisticated fintech users are immune to framing effects",
            "Option A — the 'Start Saving' button is more motivating than a reduction/stop option",
          ],
          correctIndex: 0,
          explanation:
            "Option B leverages the default effect (opt-out), status quo bias (inertia keeps users at 10%), and loss aversion (reducing savings feels like losing money already committed). Decades of empirical evidence from 401(k) research confirm that opt-out defaults with automatic enrollment produce dramatically higher participation and savings rates. Option A requires active initiation, which most users will defer indefinitely due to present bias — the plan seems like a good idea for the future but not urgent to set up today.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Mental Accounting ──────────────────────────────────────────
    {
      id: "be-2",
      title: "Mental Accounting",
      description:
        "House money effect, sunk cost fallacy, budget categories, windfall spending, and the pain of paying",
      icon: "Calculator",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Mental Accounts: How We Categorize Money",
          content:
            "**Mental accounting** (Thaler, 1985) is the set of cognitive operations people use to organize, evaluate, and track financial activities. Rather than treating money as perfectly fungible — as standard economics assumes — people mentally segregate wealth into separate 'accounts' with different rules for spending and risk-taking.\n\n**Key mental account categories people maintain:**\n- **Income accounts:** salary, bonus, freelance income, dividends\n- **Asset accounts:** home equity, retirement funds, brokerage account\n- **Budget accounts:** food, entertainment, clothing, vacation\n- **Windfall accounts:** gifts, gambling winnings, tax refunds\n\n**Why this violates rational economics:**\nA dollar saved by skipping lunch is financially identical to a dollar received as a tax refund. Yet people spend them very differently. Tax refund dollars are often treated as 'extra' money and spent on luxuries. The same amount saved through frugality would typically go toward necessities or debt reduction.\n\n**Practical consequences:**\n- People maintain low-yield savings accounts earning 1% while carrying 20% credit card debt — in different mental accounts, so they 'don't mix'\n- Investors treat dividends differently from capital gains — dividends feel like 'income' and are consumed; equivalent capital gains feel like 'wealth' and are reinvested\n- Casino visitors spend winnings differently from the money they brought — winnings go into a 'house money' mental account with more permissive spending rules",
          highlight: ["mental accounting", "fungible", "Thaler", "windfall accounts", "budget accounts"],
        },
        {
          type: "teach",
          title: "House Money Effect & Sunk Cost Fallacy",
          content:
            "**The House Money Effect:**\nWhen people win money (especially through gambling or investing), they treat the winnings as belonging to a separate, lower-stakes mental account — 'the house's money' — and become far more willing to risk it.\n\nIn markets:\n- Investors who are up significantly on a position take larger, riskier bets with unrealized profits than they would with an equivalent amount of their own cash\n- Day traders who have a good morning become more aggressive in the afternoon, treating accumulated gains as a 'cushion'\n- IPO allocations received at low prices are often speculated with aggressively because they feel like 'found' money\n\nThe house money effect is irrational — a $1,000 unrealized gain represents real wealth identical in value to $1,000 of original capital. Treating it differently imposes real costs.\n\n**The Sunk Cost Fallacy:**\nSunk costs are past expenditures that cannot be recovered regardless of current decisions. **Rational economics says ignore them entirely** — only future costs and benefits should determine current choices.\n\nYet people systematically let sunk costs influence decisions:\n- Continuing to hold a stock because you've already lost 40% on it ('I can't sell until I break even')\n- Finishing a bad meal at a restaurant because you already paid\n- Staying in an underperforming mutual fund because 'I've had it for 15 years'\n\n**Why it persists:** Abandoning a past investment requires admitting the original decision was wrong. Mental accounting ties the sunk cost to identity — cutting the loss means 'losing,' which activates loss aversion in the current reference frame.",
          highlight: ["house money effect", "sunk cost fallacy", "sunk costs", "unrealized profits", "break even", "loss aversion"],
        },
        {
          type: "teach",
          title: "Windfall Spending & Pain of Paying",
          content:
            "**Windfall Spending:**\nPeople spend unexpected income (windfalls) at a much higher marginal propensity to consume than equivalent earned income. Tax refunds, bonuses, inheritance, gambling winnings, and investment gains are disproportionately consumed rather than saved.\n\nResearch by Shefrin & Thaler found consumption propensities vary dramatically by account:\n- Current income: ~70–80% consumed\n- Windfall/asset income: ~20–30% consumed\n- Future income: ~10% consumed\n\nYet a dollar from a tax refund is no different from a dollar earned. The mental account it falls into determines how it is treated.\n\n**Pain of Paying:**\nPhysical and psychological friction in payment reduces consumption. Paying cash hurts more than swiping a card (you can see and feel cash leaving). Paying by credit card (deferred payment) hurts least of all.\n\nImplications:\n- Credit cards increase spending (studies show 12–18% more spending vs. cash for identical items)\n- All-inclusive resorts, subscriptions, and pre-paid plans reduce pain of paying and increase consumption\n- Digital wallets and tap-to-pay further anesthetize the payment, increasing purchase frequency\n\n**Investment application:** The pain of paying also applies to fees. Annual percentage fees (1.5% AUM) cause less behavioral pain than equivalent dollar fees ($1,500 on a $100,000 account) — which is why the industry standardized on percentages rather than dollar billing.",
          highlight: ["windfall spending", "pain of paying", "cash vs. credit card", "marginal propensity to consume", "Shefrin", "fees"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor bought stock at $80. It fell to $50 and has since recovered to $65. She refuses to sell at a $15 loss even though she would never buy the stock today at $65. Which mental accounting bias best explains her behavior?",
          options: [
            "Sunk cost fallacy — the $80 purchase price is treated as a reference point; selling at $65 means 'admitting' a loss",
            "House money effect — the partial recovery from $50 to $65 feels like a windfall gain",
            "Windfall spending — she is treating the recovery as bonus income",
            "Pain of paying — realizing the loss feels like an out-of-pocket expense",
          ],
          correctIndex: 0,
          explanation:
            "The sunk cost fallacy explains why she anchors to the $80 purchase price and frames the current $65 price as a loss requiring recovery before selling. The original $80 is a sunk cost — it is gone regardless of when she sells. The rational question is: 'At $65, is this the best investment for that capital going forward?' If not, she should sell. But mental accounting ties the investment to its cost basis, making selling feel like losing rather than redeploying capital. This is reinforced by loss aversion and the disposition effect.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The house money effect means that investors are correctly less averse to risk when using unrealized gains, because those gains represent excess returns above their required rate.",
          correct: false,
          explanation:
            "The house money effect is an irrational bias, not a rational adjustment. Unrealized gains represent real wealth with real opportunity cost. Treating $10,000 of unrealized gains as 'play money' that can be risked more freely ignores the fact that those gains could be realized and deployed productively or preserved as capital. Taking more risk with 'house money' purely because of its mental accounting category leads to systematic over-trading and unnecessary losses. Rational risk tolerance should be based on overall financial position and goals, not the source of specific funds.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Overconfidence & Calibration ───────────────────────────────
    {
      id: "be-3",
      title: "Overconfidence & Calibration",
      description:
        "Knowledge illusion, illusion of control, above-average effect, trading frequency, and calibrated uncertainty",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Three Faces of Overconfidence",
          content:
            "**Overconfidence** is arguably the most pervasive and damaging bias in financial decision-making. It manifests in three distinct but related forms:\n\n**1. Overprecision (Miscalibration):**\nPeople's confidence intervals are too narrow — they are more certain than they should be. In calibration studies where participants set 90% confidence intervals for general knowledge questions, those intervals contain the true answer only **40–50%** of the time. People who think they are 90% sure are actually right barely half the time.\n\nIn finance: investors give price targets with narrow ranges, traders underestimate downside scenarios, analysts provide earnings forecasts with excess precision.\n\n**2. Overplacement (Above-Average Effect):**\nThe famous finding: when asked 'Are you an above-average driver?', roughly **85–93% of drivers say yes** — a statistical impossibility. Only 50% can be above average.\n\nIn finance: individual investors consistently rate themselves as above-average stock pickers, above-average at assessing risk, and better than professional fund managers. This leads to insufficient diversification and excessive reliance on personal judgment.\n\n**3. Overestimation:**\nPeople overestimate their absolute ability, knowledge, and control over outcomes. They believe they know more about a company or industry than they do, and overestimate the precision of their analytical models.\n\nAll three forms combine to make investors feel justified in taking large concentrated positions, trading frequently, and dismissing contrary evidence.",
          highlight: ["overprecision", "miscalibration", "overplacement", "above-average effect", "overestimation", "calibration"],
        },
        {
          type: "teach",
          title: "Illusion of Control & Knowledge Illusion",
          content:
            "**Illusion of Control (Langer, 1975):**\nPeople believe they can influence purely random outcomes through skill or effort. In experiments, people preferred lottery tickets they personally chose over randomly assigned ones — and demanded higher prices to part with self-chosen tickets — even though winning probability was identical.\n\nIn financial markets:\n- Active traders believe frequent trading reflects skill, when evidence shows it primarily destroys returns through commissions and taxes\n- Investors who follow a company's daily news believe they have an informational edge on outcomes that are largely random\n- Options traders who devise complex strategies believe they can predict short-term price movements that are essentially unpredictable\n\n**Knowledge Illusion (Rozenblit & Keil, 2002):**\nPeople overestimate the depth of their understanding of complex systems. When asked to *explain* how a bicycle or zipper works — not just describe it — most people discover they understand far less than they believed.\n\nIn finance: investors who can describe what a company does (social media, semiconductor fabrication, pharmaceutical distribution) often believe they understand the stock when they actually lack critical information about competitive dynamics, regulatory risks, cost structure, and supply chains.\n\n**The Dunning-Kruger effect** is related: incompetent individuals lack the metacognitive ability to recognize their incompetence, so they systematically overrate themselves. Experts with genuine knowledge are often more aware of what they do not know and express appropriate humility.\n\n**Antidote:** Actively seek out what you do *not* know about an investment — the bear case, the things that could go wrong, your information blind spots.",
          highlight: ["illusion of control", "Langer", "knowledge illusion", "Dunning-Kruger", "active trading", "bear case"],
        },
        {
          type: "teach",
          title: "Trading Frequency & Overconfidence Costs",
          content:
            "The most direct empirical link between overconfidence and financial outcomes comes from studies of individual investor trading behavior.\n\n**Barber & Odean (2000) — 'Trading Is Hazardous to Your Wealth':**\nAnalysis of 66,465 household brokerage accounts (1991–1996):\n- Average household turned over **75% of portfolio annually**\n- The most active 20% of traders turned over **~250% annually**\n- **Net returns:** Average household underperformed market by **1.1%/year**\n- The most active traders underperformed by **5.5%/year** after transaction costs\n- Households that traded least actually slightly outperformed the market\n\n**Why overconfidence drives excessive trading:**\nOverconfident investors believe their assessments of individual stocks are more accurate than prices reflect. They therefore believe more trades will be profitable. Each trade generates transaction costs, tax events, and market impact — but the conviction in the trade's correctness outweighs these in the investor's mind.\n\n**Gender differences:** A follow-up study (Barber & Odean, 2001) found men trade **45% more frequently** than women and underperform women by **0.94%/year** net of costs — consistent with higher male overconfidence scores in psychometric testing.\n\n**The holding period paradox:** Buffett's average holding period is measured in years to decades. The evidence shows that reduced trading frequency is one of the strongest predictors of better investment returns for individual investors.",
          highlight: ["Barber", "Odean", "trading frequency", "transaction costs", "turnover", "holding period", "overconfidence costs"],
        },
        {
          type: "quiz-mc",
          question:
            "A calibration study asks investors to provide 90% confidence intervals for stock price estimates one year ahead. The study finds intervals contain the actual price only 45% of the time. This demonstrates which form of overconfidence?",
          options: [
            "Overprecision (miscalibration) — confidence intervals are too narrow relative to actual uncertainty",
            "Overplacement — investors believe they are better forecasters than their peers",
            "Overestimation — investors believe absolute returns will be higher than they are",
            "Illusion of control — investors believe they can influence stock price movements",
          ],
          correctIndex: 0,
          explanation:
            "Overprecision (also called miscalibration) specifically refers to intervals that are too narrow — people are more certain than they should be. A well-calibrated 90% confidence interval should contain the true value 90% of the time; hitting only 45% means the uncertainty bounds are approximately half as wide as they should be. This is distinct from overplacement (above-average beliefs about relative skill) or overestimation (absolute ability overrating). Miscalibration is particularly dangerous in financial modeling where overly narrow scenario ranges cause tail risk to be systematically underweighted.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An experienced equity analyst covers 15 tech stocks and publishes detailed 12-month price targets with conviction ratings. Over three years, her track record shows she outperforms the relevant index before costs. However, after accounting for transaction costs from frequent rebalancing based on her calls, net performance is below the index. She attributes underperformance entirely to market irrationality.",
          question: "Which overconfidence-related biases are most evident, and what should she consider changing?",
          options: [
            "Illusion of control and overprecision — she overestimates the precision of price targets and believes frequent rebalancing adds value; reducing trading frequency would likely improve net returns",
            "Overplacement — she thinks she is better than the index, but she is not; she should stop publishing price targets",
            "Knowledge illusion only — she does not understand the companies deeply enough",
            "Dunning-Kruger effect — the more trades she makes, the less she learns",
          ],
          correctIndex: 0,
          explanation:
            "The analyst shows illusion of control (belief that frequent rebalancing based on price targets adds net value) and overprecision (narrow price targets imply more certainty than the actual error range warrants). Her gross alpha before costs suggests genuine skill — the problem is not lack of knowledge but over-trading driven by overconfidence in short-term price precision. Barber & Odean's research consistently shows transaction costs erode most individual investors' alpha. Extending holding periods, raising the bar for conviction before trading, and accepting that short-term prices are highly uncertain would likely improve net returns.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Herding & Social Influence ────────────────────────────────
    {
      id: "be-4",
      title: "Herding & Social Influence",
      description:
        "Information cascades, peer comparison effects, social trading platforms, and wisdom vs. madness of crowds",
      icon: "Users",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Information Cascades: When Private Information Stops",
          content:
            "**Herding** occurs when individuals follow the actions of others rather than relying on their own private information or analysis. It is rational — and therefore particularly hard to overcome — because others' choices provide genuine information signals.\n\n**Information cascade theory (Bikhchandani, Hirshleifer & Welch, 1992):**\nImagine an urn that contains mostly red or mostly blue balls. Sequential decision-makers pull a ball privately, then publicly choose 'red' or 'blue'.\n\n- Person 1 draws red → chooses Red\n- Person 2 draws red → chooses Red\n- Person 3 draws blue → should choose Blue if relying only on private signal, but knows two people chose Red → the public record outweighs one contrary signal → also chooses Red\n- Person 4, 5, 6... all ignore their private balls and follow the cascade\n\n**The result:** The cascade is fragile (based on two initial signals) but can become arbitrarily long and systematically wrong. A small amount of early noise propagates through the entire chain.\n\n**Financial cascades:**\n- Sell-offs accelerate not because each seller has new negative information but because each seller observes others selling and concludes they must know something\n- Fund manager herding: managers buy the same stocks partly because being wrong in a crowd is less career-damaging than being wrong alone — **'It is better to fail conventionally than to succeed unconventionally'** (Keynes)\n- IPO bookbuilding: oversubscription at the high end triggers more demand as investors assume sophisticated peers have positive signals",
          highlight: ["information cascade", "herding", "Bikhchandani", "Hirshleifer", "Welch", "sell-off acceleration", "career risk"],
        },
        {
          type: "teach",
          title: "Peer Comparison & Social Trading Platforms",
          content:
            "**Peer comparison effects** in finance create a powerful feedback loop: people modify their investment behavior based on what they believe their peers are doing or achieving.\n\n**Keeping up with the Joneses — in portfolio returns:**\nResearch by Hong, Kubik & Stein (2004) found that households in social networks where neighbors own more stock are significantly more likely to invest in the market themselves — and the effect is stronger among neighbors who interact frequently (church, civic groups). Social transmission of financial behavior is empirically measurable.\n\n**Social trading platforms:**\nPlatforms like eToro and CopyTrader explicitly operationalize social influence — users can see what 'popular investors' hold and automatically mirror their trades. This creates a new information cascade mechanism:\n- Popular investors gain followers due to recent good performance (often luck)\n- Followers amplify returns by also entering the same positions\n- Popular investors, now managing large follower capital, face liquidity constraints that hurt performance\n- When performance reverses, mass unfollowing triggers simultaneous selling\n\n**Reddit and retail herding:**\nThe GameStop (GME) episode of January 2021 demonstrated how social platforms enable coordinated herding at scale. WallStreetBets participants provided each other with the social proof needed to maintain positions against institutional short sellers — a crowd dynamic with measurable short-squeeze mechanics.\n\n**The risks of social herding:**\n- Crowded trades unwind violently when the signal reverses\n- Past performance of 'popular investors' has low predictive value going forward\n- Social amplification creates momentum that overshoots fundamental value in both directions",
          highlight: ["peer comparison", "social trading", "eToro", "CopyTrader", "WallStreetBets", "GameStop", "crowded trades", "herding amplification"],
        },
        {
          type: "teach",
          title: "Wisdom of Crowds vs. Madness of Crowds",
          content:
            "**Wisdom of Crowds (Galton, 1907 / Surowiecki, 2004):**\nWhen a large group independently estimates an unknown quantity, the aggregate is often more accurate than any individual expert. Francis Galton found that the median estimate of a county fair crowd for the weight of an ox was within 1% of the actual weight. Markets are claimed to aggregate private information through this mechanism.\n\n**Conditions required for wise crowds:**\n1. **Diversity of opinion** — each person holds independent private information\n2. **Independence** — individual judgments are not influenced by others\n3. **Decentralization** — information comes from varied sources, not a central authority\n4. **Aggregation mechanism** — a way to combine judgments (e.g., price, poll)\n\n**Madness of Crowds (Mackay, 1841):**\nWhen these conditions break down — especially independence — crowds can become systematically wrong. Historical examples: Dutch Tulip Mania (1637), South Sea Bubble (1720), dot-com bubble (1999–2000), US housing bubble (2003–2006).\n\n**What breaks the wisdom mechanism in markets:**\n- Media narratives create correlated beliefs (diversity collapses)\n- Social media amplifies peer observation (independence collapses)\n- Zero-interest environments force capital into similar asset classes (herding driven by incentives)\n- Leverage amplifies momentum beyond fundamental value\n\n**Implications for investors:** When you observe that 'everyone' is excited about an asset class, it is a warning sign rather than a buy signal. Crowd-driven price appreciation that outpaces fundamentals eventually reverses — often abruptly when the herding equilibrium shifts.",
          highlight: ["wisdom of crowds", "Galton", "Surowiecki", "independence", "diversity", "Tulip Mania", "dot-com bubble", "correlated beliefs"],
        },
        {
          type: "quiz-mc",
          question:
            "In a sequential decision experiment, the first three participants all choose 'Buy' a stock based on their private signals. The fourth participant's private signal says 'Sell,' but she observes the prior three Buy decisions and chooses to Buy anyway. This is an example of:",
          options: [
            "An information cascade — the weight of public Buy signals exceeds her private Sell signal, making Buy the rational Bayesian choice",
            "Herding bias — she is irrationally following the crowd despite her superior private information",
            "Overconfidence — she overestimates the quality of others' private signals",
            "Disposition effect — she does not want to be wrong relative to the three prior buyers",
          ],
          correctIndex: 0,
          explanation:
            "This is a textbook information cascade. The participant is actually being *rationally* Bayesian: three independent Buy signals outweigh her one Sell signal in expected value terms. The problem is that from Person 3 onward, people may also be ignoring their private signals and cascading — so the cascade may be built on only two genuine signals, not three. The fourth participant cannot distinguish genuine signals from cascading behavior. Cascades are particularly dangerous because they are rational at the individual level yet systematically irrational at the aggregate level.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Market prices always aggregate information efficiently because they reflect the collective wisdom of crowds, making it impossible for systematic price distortions to persist.",
          correct: false,
          explanation:
            "Markets can fail to aggregate information efficiently when the conditions for crowd wisdom break down. Specifically, if participants' beliefs are correlated (due to shared media narratives, herding, or common factor exposures), if leverage creates non-linear dynamics, or if short-selling constraints prevent negative information from being incorporated into prices, systematic mispricing can persist. Historical bubbles (dot-com, US housing) lasted years despite being identifiable ex-ante by many analysts. The EMH is an approximation that holds reasonably well in liquid markets over long periods but fails during periods of high correlated sentiment.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Time Preference & Hyperbolic Discounting ──────────────────
    {
      id: "be-5",
      title: "Time Preference & Hyperbolic Discounting",
      description:
        "Present bias in saving, hyperbolic vs exponential discounting, and precommitment strategies",
      icon: "Clock",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Exponential vs. Hyperbolic Discounting",
          content:
            "Standard economic theory assumes people discount future values using **exponential discounting**: each additional period in the future reduces a reward's present value by a constant fraction. If your discount rate is 5%, waiting one year reduces value by 5%, waiting two years reduces it by another 5% of the remainder, and so on.\n\nExponential discounting has a key property: **time consistency**. If you prefer $100 today over $110 tomorrow, you should also prefer $100 in 30 days over $110 in 31 days. The relative preference between the two options does not change as both are pushed into the future.\n\n**The empirical reality — Hyperbolic Discounting:**\nActual human preferences are **hyperbolic**, not exponential. The discount rate is much higher for the near future and much lower for the distant future. Mathematically, value decays roughly as 1/(1 + kD) where D is delay and k is a constant — a hyperbola rather than an exponential.\n\n**The preference reversal experiment:**\n- Most people prefer **$100 today** over **$110 tomorrow** (high near-term discount rate)\n- But the same people prefer **$110 in 31 days** over **$100 in 30 days** (low discount rate when both options are in the distant future)\n\nThis is logically inconsistent — the 30-day-delayed choice will feel exactly like the immediate choice when 30 days have passed. People's preferences *reverse* as time horizons collapse from distant to immediate. This **time inconsistency** is the root of most self-control problems in personal finance.",
          highlight: ["exponential discounting", "hyperbolic discounting", "time consistency", "time inconsistency", "preference reversal", "present bias"],
        },
        {
          type: "teach",
          title: "Present Bias: How It Destroys Savings",
          content:
            "**Present bias** is the tendency to give disproportionately higher weight to immediate payoffs relative to near-future payoffs — even when the delay is just a matter of days or hours.\n\nFormal model: Beta-Delta discounting (Laibson, 1997) adds a present-bias parameter (beta < 1) to standard exponential discounting:\n- Utility from immediate reward: 1 × reward\n- Utility from reward next period: β × δ × reward (where β < 1 introduces the bias)\n- Utility from reward N periods later: β × δ^N × reward\n\nIf β = 0.7 and δ = 0.97, a $100 reward tomorrow is worth only $0.7 × $0.97 × $100 = $67.90 to the person today. The same reward 2 periods away is worth $0.7 × $0.97² × $100 = $65.87. The bulk of the discounting occurs at the immediate-vs-future boundary.\n\n**Manifestations in personal finance:**\n- Retirement saving procrastination: contributing to a 401(k) means less money now (immediate pain) for income decades away (barely discounted once in the future). People intend to 'start next month' indefinitely\n- Debt accumulation: spending on credit means pleasure now (immediate) and payments later (future). Hyperbolic discounters systematically underestimate how much future debt will hurt\n- Exercise, dieting, and health insurance: all involve immediate costs for distant benefits — hyperbolic discounters systematically under-invest\n- Emergency fund neglect: building a buffer takes immediate saving for a contingency that feels remote",
          highlight: ["present bias", "beta-delta discounting", "Laibson", "retirement saving procrastination", "debt accumulation", "401(k)"],
        },
        {
          type: "teach",
          title: "Precommitment Strategies Against Present Bias",
          content:
            "Because people with present bias are often **sophisticated** (they know they have the bias), they can design mechanisms to protect their future selves from their present-biased impulses.\n\n**Precommitment strategies that work:**\n\n**1. SMarT (Save More Tomorrow):**\nThaler & Benartzi's program lets employees pre-commit today to increasing savings rate with each future raise. The key: the sacrifice happens to future income, not current income — bypassing present bias entirely. Pilot results showed savings rates tripling over 4 years.\n\n**2. Employer auto-escalation:**\nMany plans now automatically increase contribution rate by 1% annually. The present-biased employee who would never voluntarily increase contributions today accepts the escalation because opting out requires action.\n\n**3. Temporal landmarks:**\nResearch shows people are more likely to initiate savings changes at temporal 'fresh start' points: New Year, birthdays, beginning of a new month. Using these natural commitment moments exploits the psychological salience of new beginnings.\n\n**4. Illiquid instruments:**\nLocking savings into CDs, pension annuities, or retirement accounts with early withdrawal penalties prevents present-biased impulse withdrawals. The cost of early access needs to exceed the perceived benefit of immediate access to be effective.\n\n**5. Implementation intentions:**\nPsychological research shows that forming specific plans ('I will transfer $500 to savings on the 1st of each month by setting up a standing order today') dramatically increases follow-through compared to general intentions ('I will save more').",
          highlight: ["precommitment", "SMarT", "auto-escalation", "temporal landmarks", "implementation intentions", "illiquid instruments", "Thaler", "Benartzi"],
        },
        {
          type: "quiz-mc",
          question:
            "Maya prefers $500 today over $600 in one month. But she also prefers $600 in 13 months over $500 in 12 months. Which discounting model best explains this pattern, and what does it imply?",
          options: [
            "Hyperbolic discounting — Maya has a high immediate discount rate but a low future discount rate; her preferences will reverse when 12 months have passed, creating time inconsistency",
            "Exponential discounting with a high rate — Maya consistently prefers money sooner across all time horizons",
            "Loss aversion — Maya is more sensitive to losses than gains, making certainty more valuable",
            "Overconfidence — Maya believes she will have better uses for money in 12 months",
          ],
          correctIndex: 0,
          explanation:
            "Maya's pattern is the classic hyperbolic discounting preference reversal. She discounts heavily over the immediate horizon (declines +$100 for waiting one month) but lightly over a distant horizon (accepts +$100 for waiting one month when that month is in the future). Exponential discounting cannot explain this reversal — under exponential discounting, if she prefers $500 now over $600 in a month, she must also prefer $500 in 12 months over $600 in 13 months. The fact that she does not shows time-inconsistent preferences driven by present bias.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "James is 28 and knows he should be saving 15% of income for retirement but has been saving only 4% for three years. He says 'I'll increase it when I get my next raise.' His employer offers a Save More Tomorrow enrollment form where he can pre-commit to dedicating 50% of his next three raises to increasing his 401(k) contributions.",
          question: "Based on hyperbolic discounting theory, why is the SMarT commitment likely to work when James's stated intention ('save more when I get a raise') has repeatedly failed?",
          options: [
            "SMarT eliminates the immediate sacrifice: future raise increases are not felt as current consumption reduction, so present bias does not activate at commitment time — the decision is made when future pain is discounted away",
            "SMarT works because it creates social pressure — colleagues will know if James backs out",
            "SMarT works only for exponential discounters; James's hyperbolic preferences will cause him to opt out before the raise arrives",
            "SMarT works because it automatically maximizes James's 401(k) contribution to the IRS limit",
          ],
          correctIndex: 0,
          explanation:
            "SMarT is a brilliantly designed precommitment because it eliminates the primary obstacle: the immediate sacrifice. When James enrolls today, the pain of reduced consumption is entirely in the future (starting with the next raise). Present-biased individuals give future pain very little weight, making commitment easy. When the raise arrives, the increase has already been pre-committed — opting out now requires active effort, which inertia makes unlikely. This contrasts with his repeated intention to increase current contributions, which requires immediate sacrifice and is therefore blocked by present bias every time the decision moment arrives.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 6: Debiasing Techniques ──────────────────────────────────────
    {
      id: "be-6",
      title: "Debiasing Techniques",
      description:
        "Pre-mortem analysis, reference class forecasting, decision checklists, adversarial collaboration, and accountability structures",
      icon: "CheckSquare",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Pre-Mortem Analysis: Prospective Hindsight",
          content:
            "**Pre-mortem analysis** (Klein, 1998 / Kahneman popularization) is a structured decision technique that counteracts overconfidence and confirmation bias before a decision is made.\n\n**The technique:**\nBefore committing to a major financial decision, assume the investment has already failed catastrophically — it is now two years in the future and the outcome was as bad as it could possibly be. Your task is to write a detailed explanation of *why* it failed.\n\n**Why it works:**\n- Activates **prospective hindsight** — imagining an event as having already occurred makes it easier to identify plausible causal paths than asking 'what could go wrong?' in abstract terms\n- Forces articulation of the bear case, counteracting confirmation bias that naturally suppresses negative scenarios\n- Surfaces minority concerns: in a team setting, members who doubted the decision feel more comfortable sharing concerns when everyone is collectively 'diagnosing failure' rather than defending a chosen course\n- Produces the **pre-mortem document** — a checklist of specific risk factors to monitor\n\n**Application to investment decisions:**\n- Before buying a stock: 'It is January 2027. This position lost 60%. Write exactly what happened.'\n- Before a major portfolio allocation shift: 'The strategy underperformed by 8% per year. What went wrong?'\n- Before following a concentrated position: 'The company failed. What were the early warning signs?'\n\nResearch by Klein and Mitchell found pre-mortems increased identification of potential problems by **30%** relative to standard risk review processes.",
          highlight: ["pre-mortem", "Klein", "prospective hindsight", "confirmation bias", "bear case", "risk factors"],
        },
        {
          type: "teach",
          title: "Reference Class Forecasting & Calibration Techniques",
          content:
            "**Reference class forecasting** (Kahneman & Lovallo; operationalized by Flyvbjerg) addresses the **planning fallacy** — the systematic tendency to underestimate time, cost, and risk while overestimating benefits, driven by focusing on the specific project ('inside view') rather than comparable historical cases ('outside view').\n\n**The method:**\n1. **Identify the reference class** — what category of project/investment is this? (e.g., 'small-cap biotech pre-revenue drug development,' 'retail business expansion into new geography,' 'emerging market equity fund launch')\n2. **Retrieve the base rate** — what is the historical distribution of outcomes for that class? (e.g., '85% of phase 2 oncology trials fail to reach FDA approval')\n3. **Adjust for specifics** — only then adjust from the base rate for features that genuinely distinguish this case\n\n**Why inside-view forecasting fails:**\nInvestors construct detailed DCF models and scenario analyses for their specific investment thesis — the inside view. But each assumption carries its own optimism bias, and errors compound. The outside view asks: 'Of all the times someone with a thesis like this has invested in a company like this, what actually happened?'\n\n**Calibration training:**\nResearchers have shown that with practice, people can improve the accuracy of their probability assessments:\n- Keep a **decision journal** — record probability estimates and check calibration retrospectively\n- Practice **superforecasting** (Tetlock) — explicit training in decomposing questions, tracking accuracy, and updating on evidence\n- Use **confidence interval drills** — regularly make 90% confidence interval estimates on verifiable facts and track coverage rates",
          highlight: ["reference class forecasting", "planning fallacy", "inside view", "outside view", "Kahneman", "Flyvbjerg", "superforecasting", "Tetlock", "decision journal"],
        },
        {
          type: "teach",
          title: "Decision Checklists & Adversarial Collaboration",
          content:
            "**Decision Checklists:**\nBorrowed from aviation and surgery, decision checklists in investing force engagement with known bias traps before each decision is executed.\n\nAn investment checklist addresses:\n- **Confirmation bias check:** Have I actively sought the strongest version of the bear case? Who is on the other side of this trade?\n- **Overconfidence check:** What is my base rate for this type of investment? Am I in the best 10% of people who could analyze this?\n- **Anchoring check:** Would my position size or price target change if I had encountered this opportunity at a different price level?\n- **Narrative fallacy check:** Am I buying a compelling story, or are there verifiable, quantitative signals supporting the thesis?\n- **Exit criteria:** Under what specific, pre-defined conditions will I sell? (Both stop-loss and take-profit criteria)\n\nAmos Tversky is reported to have said the question is not 'what is the right decision?' but 'what is the right process for making decisions?'\n\n**Adversarial Collaboration:**\nKahneman's technique for overcoming confirmation bias involves structuring a formal dialogue between the proponent of a thesis and the strongest possible opposing view.\n\nIn investment contexts:\n- **Investment committee devil's advocate role:** Assign someone explicitly to argue the bear case\n- **Red team analysis:** Hire or designate an independent team to attempt to disprove the investment thesis\n- **Pre-commitment to disagreement:** Before sharing a thesis, ask a colleague to independently analyze the same security and commit their view — preventing social convergence\n\n**Accountability partners:** Making investment decisions and their rationale public to a trusted, knowledgeable person improves decision quality by activating self-image concerns around reasoning quality — not just outcomes.",
          highlight: ["decision checklist", "adversarial collaboration", "confirmation bias", "devil's advocate", "red team", "accountability partner", "Tversky", "exit criteria"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor is analyzing a pharmaceutical company developing a cancer drug currently in Phase 3 trials. Her DCF model projects a 70% probability of FDA approval and an NPV of $8 billion. What does reference class forecasting suggest she should do first?",
          options: [
            "Identify the historical FDA approval rate for oncology drugs entering Phase 3 trials — research shows only about 50–60% reach approval — and use that as the prior probability before adjusting for company-specific factors",
            "Build a more detailed financial model to refine the 70% estimate using additional company disclosures",
            "Survey oncologists for their expert estimates of the approval probability",
            "Apply a 20% haircut to the NPV to account for general uncertainty",
          ],
          correctIndex: 0,
          explanation:
            "Reference class forecasting requires starting with the outside view — the base rate for comparable cases — before considering inside-view specifics. Phase 3 oncology drugs historically have FDA approval rates of roughly 50–60%, well below the investor's 70% estimate (which almost certainly reflects inside-view optimism about this specific company's data). The correct process: (1) anchor to the historical base rate for Phase 3 oncology approvals, (2) then adjust up or down for specific features of this trial (e.g., breakthrough therapy designation, endpoint strength, safety profile). Starting from a 70% assumption without checking the reference class is the classic planning fallacy.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A fund's investment committee of 5 analysts always reaches consensus quickly and rarely debates. The fund has delivered below-benchmark returns for 3 consecutive years. The CIO suspects groupthink and confirmation bias. She is considering implementing structural changes: (A) rotating devil's advocate roles, (B) requiring written pre-mortem analyses before each major position, and (C) bringing in an external adversarial analyst quarterly to review the top 5 holdings.",
          question: "Which combination of debiasing techniques will most effectively address groupthink and confirmation bias, and why?",
          options: [
            "All three — each addresses a different layer: devil's advocate counters in-meeting convergence, pre-mortems surface pre-commitment bear cases, and external review brings truly independent information uncorrupted by the group's shared mental model",
            "Only the devil's advocate role is effective — the other techniques add process friction without improving decisions",
            "Only the external adversarial analyst — internal techniques are ineffective because they still involve the same biased team members",
            "Pre-mortem analysis alone — it is the most evidence-based debiasing technique and adding the others creates decision fatigue",
          ],
          correctIndex: 0,
          explanation:
            "All three techniques target different failure modes and are complementary. The devil's advocate role addresses in-meeting conformity pressure — someone has explicit license to disagree. Pre-mortem analyses address the overconfidence and confirmation bias that develop before the committee meeting, when the thesis is being built. External review provides an outside view uncorrupted by the team's shared priors, relationship dynamics, and career incentives. Research on debiasing interventions consistently shows that layered, multi-mechanism approaches outperform single techniques because biases operate through multiple pathways simultaneously.",
          difficulty: 3,
        },
      ],
    },
  ],
};
