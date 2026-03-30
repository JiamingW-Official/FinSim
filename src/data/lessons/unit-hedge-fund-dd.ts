import type { Unit } from "./types";

export const UNIT_HEDGE_FUND_DD: Unit = {
 id: "hedge-fund-dd",
 title: "Hedge Fund Due Diligence",
 description:
 "Master the LP due diligence process — from operational checks and fraud prevention to performance evaluation and terms negotiation for alternative investment manager selection",
 icon: "",
 color: "#7c3aed",
 lessons: [
 // Lesson 1: HF Industry Overview 
 {
 id: "hfdd-1",
 title: "HF Industry Overview",
 description:
 "Global AUM, strategy taxonomy, fee structure evolution, and LP/GP governance",
 icon: "Building2",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The Hedge Fund Universe: $4T and Counting",
 content:
 "The global hedge fund industry manages roughly **$4.3 trillion in AUM** as of 2024, concentrated among a small number of mega-managers.\n\n**Strategy breakdown by AUM:**\n- **Long/Short Equity**: ~30% — fundamental stock-picking, net long or neutral\n- **Global Macro**: ~20% — top-down bets on rates, FX, commodities\n- **Event-Driven**: ~15% — merger arb, distressed, activism\n- **Relative Value (RV)**: ~15% — fixed income arb, convertible arb, stat arb\n- **Quant/Multi-Strat**: ~20% — systematic signals, multi-pod structures\n\n**AUM concentration:**\n- Top 100 managers control >75% of all hedge fund AUM\n- Bridgewater (~$120B), Man Group (~$175B), Renaissance, Millennium, Citadel lead the industry\n- ~9,000 total funds in operation globally\n\n**Investor base (LP side):**\n- Pension funds: ~35% of LP capital\n- Endowments / foundations: ~20%\n- Sovereign wealth funds: ~15%\n- Family offices / HNW: ~20%\n- Fund of funds: ~10%\n\nUnderstanding strategy taxonomy is step one — you cannot evaluate a fund without first knowing what game it's playing.",
 highlight: ["$4.3 trillion", "long/short equity", "global macro", "event-driven", "relative value", "multi-strat"],
 },
 {
 type: "teach",
 title: "Fee Structure Evolution and LP/GP Governance",
 content:
 "The classic **2-and-20** fee model (2% management fee + 20% performance fee) has eroded significantly under LP pressure since 2008.\n\n**Current fee reality:**\n- Average management fee: ~1.4% (down from 2%)\n- Average performance fee: ~17% (down from 20%)\n- Top-tier quant funds (RenTech employee funds, Citadel) retain 30% or more performance fees\n- Emerging managers often price at 1-and-10 to attract seed capital\n\n**Fee modifiers that matter:**\n- **Hurdle rate**: Performance fee only kicks in above a benchmark (e.g., SOFR + 2%, or a hard 6%)\n- **High-water mark (HWM)**: Fee only on new profits above the prior peak NAV — protects LPs from paying twice on recovered losses\n- **Clawback**: Some LPs negotiate return of fees paid on unrealized gains if later losses occur\n\n**LP/GP structure:**\n- **GP (General Partner)**: Fund manager — makes investment decisions, bears unlimited liability in the fund structure\n- **LP (Limited Partner)**: Investor — limited liability, no day-to-day control\n- **Management company**: Separate entity from the fund; employs staff, earns management fees\n- **Fund vehicle**: Offshore (Cayman Islands) for tax-exempt US investors; onshore LP for taxable US investors\n- **LPAC (LP Advisory Committee)**: Oversight body representing major LPs — approves conflicts of interest, side letters",
 highlight: ["2-and-20", "hurdle rate", "high-water mark", "clawback", "LP", "GP", "LPAC"],
 },
 {
 type: "quiz-mc",
 question:
 "A hedge fund charges a 1.5% management fee and 20% performance fee with a 6% hurdle rate and high-water mark. The fund was down 10% last year and is up 18% this year. What performance fee do investors pay this year?",
 options: [
 "Zero — the fund must first recover to its prior high-water mark before earning any performance fee",
 "20% of 18% = 3.6% of AUM",
 "20% of (18% – 6%) = 2.4% of AUM",
 "20% of (18% – 10%) = 1.6% of AUM",
 ],
 correctIndex: 0,
 explanation:
 "The high-water mark means no performance fee is charged until the fund's NAV exceeds its prior peak. After a 10% loss, the fund is at 90% of its prior peak. An 18% gain brings it to about 106.2% — now above the prior peak. However, in standard HWM structures, the fee only applies to the gain above the prior peak (6.2% of NAV in this example), not the full 18%. The key insight: LPs never pay performance fees twice on the same profits.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Global macro is the largest hedge fund strategy by AUM, accounting for over 40% of the industry.",
 correct: false,
 explanation:
 "False. Long/short equity is the largest strategy by AUM at approximately 30%. Global macro is significant (~20%) but ranks second. Multi-strategy and quant funds have grown rapidly and together represent ~20% of AUM. The industry is broadly diversified across strategies.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are the CIO of a $2B university endowment considering your first hedge fund allocation. Your investment committee has approved up to 15% in alternatives. You are evaluating a global macro fund ($800M AUM), a quant multi-strat fund ($12B AUM), and a small long/short equity manager ($200M AUM).",
 question: "Which factor is MOST important when sizing an initial allocation to the small L/S equity manager?",
 options: [
 "Capacity constraint — your allocation should not represent more than 10-15% of the fund's AUM to avoid market impact and maintain manager focus",
 "The fund's absolute AUM is irrelevant — only past performance matters",
 "Smaller funds should always receive the largest allocations for maximum alpha potential",
 "You should avoid small managers entirely because they lack operational infrastructure",
 ],
 correctIndex: 0,
 explanation:
 "A $2B endowment allocating 15% = $300M total alternatives budget. If you put $50M into a $200M fund, you would own 25% of the fund — far too concentrated. Standard LP practice is to keep any single LP's ownership below 10-15% to avoid: tail risk to the fund if you redeem, potential conflicts of interest, and manager distraction. Proper sizing respects the fund's capacity.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Operational Due Diligence 
 {
 id: "hfdd-2",
 title: "Operational Due Diligence",
 description:
 "Prime brokers, fund administrators, auditors, compliance, key-man risk, shadow NAV, and Madoff-era fraud lessons",
 icon: "Shield",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The Operational Infrastructure Stack",
 content:
 "**Operational due diligence (ODD)** examines everything outside the investment strategy — the plumbing that ensures your capital is safe, properly accounted for, and independently verified.\n\n**Key service providers and their roles:**\n\n**Prime Broker (PB):**\n- Provides leverage, securities lending for shorts, custody of assets\n- Major PBs: Goldman Sachs, Morgan Stanley, JPMorgan, Deutsche Bank\n- Risk to LP: prime broker failure (Lehman 2008 froze $40B of hedge fund assets)\n- Best practice: **multi-prime** setup — assets spread across 2+ PBs to reduce concentration\n\n**Fund Administrator:**\n- Independent third party that calculates NAV (net asset value) and maintains investor records\n- Validates positions and prices independently from the manager\n- Major admins: SS&C GlobeOp, State Street, Citco, NAV Consulting\n- Critical: Administrator should have NO ownership connection to the manager\n\n**Auditor:**\n- Annual audit of financial statements by a reputable, independent Big 4 or major regional firm\n- Red flags: tiny, unknown auditing firm; fund auditor also audits the GP's management company\n- Check: auditor tenure, any qualified opinions in past filings\n\n**Legal Counsel:**\n- Fund formation, subscription documents, ongoing compliance\n- Reputable firms: Sidley, Skadden, Seward & Kissel for fund formation",
 highlight: ["prime broker", "fund administrator", "auditor", "multi-prime", "NAV", "independent"],
 },
 {
 type: "teach",
 title: "Key-Man Risk, Shadow NAV, and Fraud Prevention",
 content:
 "**Key-Man Risk:**\n- Many hedge funds are built around one or two star portfolio managers (PMs)\n- If the key person leaves, becomes incapacitated, or dies, the fund's edge may disappear\n- **Key-man clause**: Legal provision in LPA allowing LPs to redeem (often at par) if a designated key person leaves the fund\n- Due diligence questions: Is there succession planning? Is the investment team deep enough to survive without the founder?\n\n**Shadow NAV:**\n- LP independently calculates an estimate of the fund's NAV using reported positions\n- Compares to the administrator-calculated official NAV\n- Discrepancies signal potential pricing issues, illiquid positions, or fraud\n- Institutional LPs at funds >$500M typically perform shadow NAV as standard practice\n\n**Madoff Lessons (the $65B fraud):**\nBernie Madoff ran the largest Ponzi scheme in history for 20+ years. Red flags that were present but ignored:\n- **Custody**: Madoff's firm held its OWN assets — no independent custodian\n- **Auditor**: Friehling & Horowitz — a tiny 3-person firm auditing a multi-billion dollar operation\n- **Administrator**: None — Madoff's own firm calculated NAV\n- **Returns**: Impossibly smooth, low-volatility returns (~10% every year)\n- **Strategy opacity**: Claimed \"split-strike conversion\" but never allowed verification\n- **Lesson**: Separation of duties between manager, custodian, and administrator is NON-NEGOTIABLE",
 highlight: ["key-man clause", "shadow NAV", "Madoff", "Ponzi scheme", "custodian", "separation of duties"],
 },
 {
 type: "quiz-mc",
 question:
 "Which single red flag would most immediately disqualify a hedge fund from further due diligence consideration?",
 options: [
 "The fund's manager also controls custody of assets with no independent third-party administrator",
 "The fund has underperformed its benchmark in the last 12 months",
 "The fund recently replaced its prime broker from Goldman Sachs to Morgan Stanley",
 "The fund's management fee is slightly above the industry average at 1.8%",
 ],
 correctIndex: 0,
 explanation:
 "Self-custody without independent oversight is the hallmark of fraud (see Madoff). The manager controlling both investments AND the safekeeping and valuation of assets eliminates all checks against misappropriation. Underperformance is an investment concern not a fraud concern; changing prime brokers is routine business; fees above average are a negotiation point. Self-custody is a hard stop.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "A key-man clause in a limited partnership agreement (LPA) means the hedge fund manager cannot hire new portfolio managers without LP approval.",
 correct: false,
 explanation:
 "False. A key-man clause is a protective right for LPs — it typically allows LPs to redeem their capital (often at NAV with no lock-up penalty) if a specified key person (e.g., the founder/CIO) leaves, dies, or becomes incapacitated. It does NOT restrict hiring decisions. It is a downside protection mechanism, not a governance veto over personnel.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "During due diligence on a $300M long/short equity fund, you discover: (1) The administrator is a small Cayman-based firm founded by the fund manager's brother-in-law. (2) The auditor is a Big 4 firm. (3) The fund has two prime brokers. (4) The manager is both the CIO and sole named key person with no succession plan.",
 question: "Which finding requires the most urgent remediation before investment?",
 options: [
 "The administrator's conflict of interest — independence is structurally compromised by the family relationship",
 "The lack of succession plan — key-man risk is the highest priority concern",
 "Using two prime brokers — concentration in a single prime broker is preferable for simplicity",
 "The Big 4 auditor — large firms sometimes miss small fund fraud better than specialized firms",
 ],
 correctIndex: 0,
 explanation:
 "A fund administrator with a direct conflict of interest (family relationship to the manager) cannot independently verify NAV, positions, or investor records. This is the structural equivalent of the Madoff problem — the person responsible for independent oversight is not independent. Key-man risk is a real concern but can be managed through insurance and succession planning. The administrator conflict is a potential fraud enabler and must be resolved before investment.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Investment Due Diligence 
 {
 id: "hfdd-3",
 title: "Investment Due Diligence",
 description:
 "Strategy clarity, edge identification, capacity constraints, performance attribution, and style drift detection",
 icon: "Search",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Identifying Genuine Edge",
 content:
 "**Investment due diligence (IDD)** asks the hardest question: Does this manager have a repeatable, sustainable edge — or have they just been lucky?\n\n**Strategy clarity test:**\n- Can the manager articulate the strategy clearly in one paragraph?\n- Is the investment process documented and consistently applied?\n- Are the return drivers explainable, or is the strategy a \"black box\"?\n- Red flag: vague descriptions like \"we find mispriced opportunities\" without specificity\n\n**Edge identification framework:**\n- **Informational edge**: Proprietary data, superior research networks, faster information processing\n- **Analytical edge**: Better models, more rigorous financial analysis than the consensus\n- **Behavioral edge**: Longer time horizon than the market; willingness to hold through volatility\n- **Structural edge**: Access to deals, securities, or structures unavailable to most participants\n\n**Persistence testing:**\n- Split the track record into rolling 3-year periods — does performance remain consistent?\n- Compare manager vs their own stated benchmark (not just SPX)\n- **Information Ratio (IR)** = Alpha / Tracking Error — measures consistency of alpha generation\n- IR > 0.5 is good; IR > 1.0 is exceptional; most managers fail to maintain positive IR over time\n\n**Capacity constraint:**\n- Every strategy has a maximum AUM at which the edge remains exploitable\n- Small-cap stock pickers hit capacity at $1–3B — beyond that, market impact erodes alpha\n- Global macro and fixed income arb can scale to $20B+\n- Ask: What is the manager's stated capacity? Is the current AUM approaching it?",
 highlight: ["informational edge", "analytical edge", "behavioral edge", "information ratio", "capacity constraint"],
 },
 {
 type: "teach",
 title: "Performance Attribution and Style Drift",
 content:
 "**Performance attribution** breaks down returns into their sources to verify the manager is doing what they claim.\n\n**Return decomposition:**\n- **Beta contribution**: Return from market exposure (not skill — any passive index provides this)\n- **Factor exposure**: Return from tilts to size, value, momentum, quality factors\n- **Pure alpha (residual)**: What remains after removing all systematic factors — this is true skill\n- Formula: Return = Beta × Market + Factor Exposures + Alpha + Error\n\n**Brinson attribution (for equity managers):**\n- **Allocation effect**: Did the manager over/underweight the right sectors?\n- **Selection effect**: Within each sector, did stock picks outperform?\n- **Interaction effect**: Combined sector + stock decisions\n\n**Style drift detection — critical warning signs:**\n- A value manager suddenly holding fast-growing tech stocks\n- Gross exposure expanding dramatically (taking more risk without disclosure)\n- Holding periods shortening from months to days (strategy style change)\n- New asset classes appearing in the portfolio without explanation\n- Increasing concentration in top 5 positions beyond stated limits\n\n**Tools for drift detection:**\n- Request full position-level transparency (monthly or quarterly)\n- 13F filings (SEC — for US long equity >$100M AUM): public quarterly disclosure of long positions\n- Factor regression analysis: run returns against Fama-French 5-factor model monthly\n- Portfolio overlap analysis: compare sector/factor exposures quarter-over-quarter",
 highlight: ["beta contribution", "pure alpha", "Brinson attribution", "style drift", "13F", "factor regression"],
 },
 {
 type: "quiz-mc",
 question:
 "A long/short equity fund reports 22% annualized returns over 5 years. After removing their market beta (1.1× SPX), sector tilts, and size/value/momentum factor exposure, the residual alpha is 0.8% per year. What does this tell you?",
 options: [
 "Nearly all returns came from beta and factor exposure, not true stock-picking skill — the manager's 'alpha' is largely systematic",
 "The fund has exceptional stock-picking skill — 0.8% annual alpha is industry-leading",
 "The fund is underpaying for its systematic exposure and should increase beta",
 "Factor exposure is irrelevant — only total returns matter when evaluating managers",
 ],
 correctIndex: 0,
 explanation:
 "0.8% annual alpha after full factor decomposition means almost all of the impressive 22% return came from market beta and tilts to well-known factors (size, value, momentum) — not unique stock selection. This is a critical distinction: an LP could replicate ~95% of these returns with cheap factor ETFs at a fraction of the fee. True alpha should be large enough to justify the 2/20 fee structure, typically requiring 3–5%+ after all factor adjustments.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Style drift is always a negative sign and means the manager should be immediately redeemed.",
 correct: false,
 explanation:
 "False. Style drift requires investigation, not automatic redemption. Sometimes drift reflects an intentional, communicated strategy evolution — for example, a value manager expanding into quality-growth names as the market environment changes. The key questions are: Was the drift disclosed? Is it within the fund's mandate? Did the manager communicate it proactively? Undisclosed or unauthorized drift is a serious red flag; communicated and rationale-supported evolution may be acceptable.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are reviewing a quantitative equity fund's quarterly attribution report. The fund's mandate states it runs a 'sector-neutral, beta-neutral long/short strategy.' In Q3, the fund had a 0.85 beta to the S&P 500, significant tech overweight (15% vs benchmark 0%), and its top 3 positions accounted for 40% of gross exposure.",
 question: "Which finding best constitutes a style drift violation?",
 options: [
 "All three findings collectively suggest the fund drifted from its stated sector-neutral, beta-neutral mandate",
 "Only the tech overweight matters — sector neutrality is the most important mandate constraint",
 "Only the beta of 0.85 matters — beta neutrality is the only binding constraint in quant strategies",
 "Position concentration alone is the style drift — the other factors are within normal ranges",
 ],
 correctIndex: 0,
 explanation:
 "A 'sector-neutral, beta-neutral' mandate means ALL three findings are violations: (1) 0.85 beta violates beta-neutrality; (2) 15% tech overweight violates sector neutrality; (3) 40% in top 3 positions suggests this is no longer a diversified quant portfolio. Each finding alone would require explanation; together they suggest a fundamental departure from the mandate. This warrants immediate direct discussion with the manager and potential redemption if not satisfactorily explained.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Risk Assessment 
 {
 id: "hfdd-4",
 title: "Risk Assessment",
 description:
 "VaR, CVaR, leverage analysis, liquidity mismatch, tail risk, drawdown analysis, and correlation to public markets",
 icon: "AlertTriangle",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Quantifying Risk: VaR, CVaR, and Leverage",
 content:
 "**Value at Risk (VaR):**\n- The maximum expected loss over a time horizon at a given confidence level\n- Example: Daily VaR of $5M at 99% confidence = on 99% of trading days, losses should not exceed $5M\n- Weaknesses: Assumes normal distributions; underestimates tail events; doesn't answer \"how bad can it get?\"\n\n**Conditional VaR (CVaR) / Expected Shortfall:**\n- The **expected loss when VaR is exceeded** — answers the question VaR ignores\n- Example: CVaR at 99% = average loss across the worst 1% of days\n- CVaR is the preferred risk measure for fat-tailed hedge fund strategies\n- Regulators (Basel III) increasingly require CVaR reporting\n\n**Leverage analysis — multiple dimensions:**\n- **Gross leverage**: (Long Market Value + |Short Market Value|) / NAV — total exposure\n- **Net leverage**: (Long – Short) / NAV — directional market exposure\n- **Economic leverage**: Accounts for derivatives notional; an option on $100M stock $100M risk\n- **Debt leverage**: Borrowed capital / NAV (different from gross leverage — focuses on borrowings)\n- Warning levels: Gross leverage >3× requires explanation; >5× warrants detailed stress testing\n\n**LTCM lesson (1998):**\nLong-Term Capital Management had $125B in assets, $1.25T in notional derivatives — **25× leverage** on equity. When Russian debt defaulted and spreads blew out instead of converging, the fund lost $4.6B in 4 months and required a Fed-orchestrated $3.65B bailout. Leverage amplifies losses with equal ferocity as gains.",
 highlight: ["VaR", "CVaR", "expected shortfall", "gross leverage", "net leverage", "LTCM"],
 },
 {
 type: "teach",
 title: "Liquidity Mismatch, Tail Risk, and Drawdown Analysis",
 content:
 "**Liquidity mismatch:**\n- The dangerous gap between **asset liquidity** (how quickly positions can be sold) and **investor liquidity** (how quickly LPs can redeem)\n- Example: A credit fund holds illiquid CLO tranches (3-month to liquidate) but offers quarterly redemptions with 60-day notice — mismatch\n- 2008: Multiple credit and event-driven funds suspended redemptions because they could not sell assets fast enough to meet LP withdrawals\n- **Gate provisions** exist precisely to manage mismatch: cap redemptions at 10–25% of NAV per quarter\n\n**Liquidity bucketing:**\n- Bucket portfolio by days-to-liquidate: <1 day / 1–7 days / 1–4 weeks / >1 month\n- LP redemption terms should be longer than the 80th percentile of portfolio liquidation time\n- Standard: if 80% of assets can be liquidated in 30 days, quarterly redemptions are reasonable\n\n**Drawdown analysis — reading the DNA of risk:**\n- **Maximum drawdown (MDD)**: Peak-to-trough loss over the fund's history\n- **Recovery time**: How long did it take to reach a new high-water mark after the worst drawdown?\n- **Calmar ratio**: Annualized return / Maximum drawdown — higher is better\n- A fund with 15% annualized return and 40% max drawdown (Calmar 0.375) is less attractive than one with 12% returns and 15% drawdown (Calmar 0.8)\n\n**Tail risk / skewness:**\n- Hedge fund returns are often negatively skewed (small gains, occasional large losses)\n- Strategies that \"pick up nickels in front of a steamroller\" (short vol, carry trades) show this pattern\n- Examine **kurtosis** — fat tails indicate more frequent extreme outcomes than a normal distribution",
 highlight: ["liquidity mismatch", "gate provisions", "maximum drawdown", "Calmar ratio", "negative skew", "kurtosis"],
 },
 {
 type: "quiz-mc",
 question:
 "A hedge fund reports a daily VaR of $2M at 95% confidence. What does this mean?",
 options: [
 "On 95% of trading days, the fund will not lose more than $2M — but on 5% of days, losses could exceed $2M by an unknown amount",
 "The fund can never lose more than $2M on any single day",
 "The fund's expected daily profit is $2M with 95% certainty",
 "The fund will lose exactly $2M on 5% of trading days",
 ],
 correctIndex: 0,
 explanation:
 "VaR at 95% confidence means on 95% of days, losses will be less than $2M. On the remaining 5% of days (roughly 12-13 trading days per year), losses will EXCEED $2M — by an unknown and potentially much larger amount. This is VaR's key limitation: it says nothing about the magnitude of losses beyond the threshold. CVaR (expected shortfall) complements VaR by measuring the average loss in those worst 5% scenarios.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "A fund offering monthly redemptions with 30-day notice is always appropriately matched to a portfolio of highly liquid large-cap equities.",
 correct: true,
 explanation:
 "True. Large-cap equities in major markets (SPX, FTSE 100, Nikkei 225) can typically be liquidated within 1–5 days without significant market impact. Monthly redemptions with 30-day notice gives the manager 30+ days to liquidate before cash must be returned — well-matched to the portfolio's liquidity profile. Liquidity mismatch becomes problematic when illiquid assets (private credit, CLOs, distressed) are paired with short redemption windows.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are comparing two hedge funds for a $50M allocation. Fund Alpha: 14% annualized return, 8% annualized volatility, maximum drawdown of 12%, recovery time 6 months. Fund Beta: 19% annualized return, 18% annualized volatility, maximum drawdown of 38%, recovery time 22 months.",
 question: "Using the Calmar ratio, which fund offers better risk-adjusted return and what is each fund's ratio?",
 options: [
 "Fund Alpha: Calmar 1.17 vs Fund Beta: Calmar 0.50 — Fund Alpha wins on risk-adjusted basis",
 "Fund Beta: Calmar 0.50 vs Fund Alpha: Calmar 0.86 — Fund Beta wins on absolute return",
 "Fund Alpha: Calmar 1.17 vs Fund Beta: Calmar 1.05 — similar, prefer Fund Beta for higher returns",
 "Neither — the Calmar ratio is not applicable to hedge funds",
 ],
 correctIndex: 0,
 explanation:
 "Calmar ratio = Annualized Return / Maximum Drawdown. Fund Alpha: 14% / 12% = 1.17. Fund Beta: 19% / 38% = 0.50. Fund Alpha provides significantly better return per unit of maximum drawdown. The 22-month recovery period for Fund Beta also raises serious concerns — an LP allocating to Fund Beta may wait nearly 2 years just to recover from a drawdown before performance fees resume. For most institutional investors, Fund Alpha's profile is superior.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Terms and Negotiation 
 {
 id: "hfdd-5",
 title: "Terms and Negotiation",
 description:
 "Lockups, redemption gates, high-water marks, hurdle rates, MFN clauses, and managed accounts vs commingled funds",
 icon: "FileText",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Liquidity Terms: Lockups, Gates, and Notice Periods",
 content:
 "Hedge fund terms are governed by the **Limited Partnership Agreement (LPA)** and individual **side letters**. Terms vary enormously and are a critical dimension of the due diligence process.\n\n**Lock-up period:**\n- Initial period during which investors cannot redeem capital\n- **Soft lock-up**: Can redeem but pays an early redemption fee (typically 1–3% of redeemed amount)\n- **Hard lock-up**: Redemption completely prohibited during the period\n- Typical duration: 1 year for most funds; 2–3 years for illiquid strategies (distressed, private credit)\n- Rationale: Manager needs stable capital to execute multi-year investment theses\n\n**Redemption notice period:**\n- Advance notice required before redemption: typically 30–90 days\n- Longer for illiquid strategies (90–180 days)\n- Gives manager time to liquidate positions without market impact\n\n**Redemption frequency:**\n- Monthly / Quarterly / Semi-annual / Annual\n- More illiquid strategy longer redemption cycle\n- Mismatch risk: frequent redemptions + illiquid portfolio = disaster (see 2008)\n\n**Gate provisions:**\n- Limits total fund-wide redemptions in any period (e.g., 25% of NAV per quarter)\n- Protects remaining LPs from fire-sale liquidations when many investors redeem simultaneously\n- Gates can be triggered at fund level or individual LP level\n- Controversial: can trap investors during periods of fund distress when they most want to exit",
 highlight: ["soft lock-up", "hard lock-up", "redemption notice", "gate provisions", "LPA"],
 },
 {
 type: "teach",
 title: "Fee Terms, MFN Clauses, and Managed Accounts",
 content:
 "**Most Favored Nation (MFN) clause:**\n- Entitles the LP to receive the most favorable terms offered to ANY other LP in the same fund\n- Typically covers: management fee, performance fee, redemption terms, reporting frequency\n- Example: If the manager gives a seed investor a 1/10 fee deal, an MFN holder can request those same terms\n- Must be explicitly negotiated — not automatically included in standard LPA\n- Particularly valuable for large LPs who may not always be the first or largest investor\n\n**Key fee negotiation leverage points:**\n- **Minimum investment size**: Larger commitments lower fees (breakpoints typically at $25M, $50M, $100M)\n- **Early commitment**: Seed or early investors often receive lifetime fee discounts\n- **Separately managed account (SMA)**: Largest LPs can negotiate individual accounts\n\n**Managed Account (SMA) vs Commingled Fund:**\n\n| Feature | SMA | Commingled Fund |\n|---|---|---|\n| Portfolio transparency | Full daily positions | Monthly/quarterly letter |\n| Customization | Yes — exclude sectors, limits | No |\n| Gate/lock-up risk | None — LP controls custody | Full gate and lock-up apply |\n| Minimum investment | Typically $50M–$500M | $1M–$25M common |\n| Fee negotiability | High | Lower |\n| Operational complexity | Very high | Low |\n\n**Preferred liquidity terms hierarchy:**\n- Institutional LPs typically negotiate: quarterly liquidity 30-day notice no gate (or 10% gate cap)",
 highlight: ["MFN clause", "seed investor", "managed account", "SMA", "commingled fund", "side letter"],
 },
 {
 type: "quiz-mc",
 question:
 "An LP holds an MFN clause in a hedge fund. The fund then offers a new large investor a deal at 1% management fee and 15% performance fee (vs the standard 1.5%/20%). What can the MFN holder do?",
 options: [
 "Request to receive the same 1%/15% terms as the newer investor — the MFN clause entitles them to the most favorable terms in the fund",
 "Nothing — MFN clauses only apply to liquidity terms, not fee terms",
 "Demand a complete refund of fees paid in excess of 1%/15% since inception",
 "Negotiate a new separate deal that is better than 1%/15%",
 ],
 correctIndex: 0,
 explanation:
 "An MFN clause entitles the holder to the most favorable terms offered to ANY other investor in the same fund. When the manager offered 1%/15% to a new investor, all MFN holders can request those same terms. This is why MFN clauses are so valuable — they protect early investors from being disadvantaged relative to newer, larger investors who negotiate better deals. Retroactive refunds are generally not part of MFN provisions; they apply prospectively.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A separately managed account (SMA) structure always results in lower net returns compared to investing in the commingled fund because of higher operational costs.",
 correct: false,
 explanation:
 "False. SMAs typically offer: lower fees (negotiated individually for large allocations), no gate risk (the LP controls their own custody), and full transparency. The additional operational cost of running an SMA is usually offset by the lower management/performance fee negotiated. Furthermore, SMAs eliminate the risk of being trapped by gate provisions during stress periods. For institutional investors committing $50M+, the SMA is often the economically superior structure despite higher operational setup costs.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A pension fund is allocating $75M to a credit hedge fund with a 2-year hard lock-up, 90-day notice, and semi-annual redemptions after the lock-up. The fund's portfolio is 60% in corporate loans (30-day liquidity) and 40% in CLO equity tranches (90-180 day liquidity). The pension fund has annual liquidity needs of approximately 8% of its total assets.",
 question: "What is the primary structural concern with this investment?",
 options: [
 "The 2-year hard lock-up combined with illiquid CLO equity creates a potential mismatch if the pension needs capital during the lock-up period, even though post-lockup terms are reasonable",
 "The 90-day notice period is too short for a credit fund — it should be 180 days",
 "Semi-annual redemptions are too frequent for this asset class and will force fire sales",
 "There is no concern — the 30-day liquidity on corporate loans covers the 90-day notice easily",
 ],
 correctIndex: 0,
 explanation:
 "The 2-year hard lock-up is the primary concern. The pension fund has 8% annual liquidity needs — over 2 years, that could be $12M+ in mandatory disbursements. During the hard lock-up, there is ZERO ability to access this capital, regardless of need. Before committing, the pension must confirm the $75M allocation can be locked away for 2 years without impacting their liquidity plan. Post-lockup, the semi-annual redemptions with 90-day notice are reasonably matched to the portfolio's liquidity profile — corporate loans (30-day) and CLO equity (90-180 day) can largely be liquidated before cash must be returned.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 6: Performance Evaluation 
 {
 id: "hfdd-6",
 title: "Performance Evaluation",
 description:
 "GIPS compliance, Sharpe/Sortino/Calmar ratios, benchmark selection, and distinguishing skill from luck",
 icon: "BarChart2",
 xpReward: 105,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Performance Standards and Risk-Adjusted Metrics",
 content:
 "**GIPS (Global Investment Performance Standards):**\n- Voluntary ethical standards for calculating and presenting investment performance, managed by CFA Institute\n- Require: composite construction (grouping similar portfolios), consistent return calculation methodology, full disclosure of fees, verified track records\n- GIPS-compliant presentations allow apples-to-apples comparison across managers\n- Ask: Is the manager GIPS-compliant? If not, why not? Are returns net of all fees?\n- Red flag: Manager only shows \"representative account\" returns, not composite results\n\n**Core risk-adjusted ratios:**\n\n**Sharpe Ratio** = (Return – Risk-Free Rate) / Volatility\n- Most common; penalizes ALL volatility equally (upside and downside)\n- Limitation: assumes returns are normally distributed; misleading for strategies with skewed returns\n- Benchmark: >1.0 is good; >2.0 is excellent; most hedge funds deliver 0.3–0.8 net of fees\n\n**Sortino Ratio** = (Return – Minimum Acceptable Return) / Downside Deviation\n- Only penalizes downside volatility — upside volatility is not \"bad\"\n- More appropriate for hedge funds with asymmetric return profiles\n- Preferred by practitioners for strategies with positive skew (options selling, structured products)\n\n**Calmar Ratio** = Annualized Return / Maximum Drawdown\n- Intuitive risk measure: how many years of returns does the worst drawdown represent?\n- Calmar of 1.0: one year's return equals the worst drawdown ever experienced\n- Best for comparing strategies with different drawdown profiles",
 highlight: ["GIPS", "Sharpe ratio", "Sortino ratio", "Calmar ratio", "composite", "net of fees"],
 },
 {
 type: "teach",
 title: "Benchmark Selection and Skill vs Luck Attribution",
 content:
 "**Benchmark selection — often the most contentious DD topic:**\n- A manager's choice of benchmark dramatically affects how alpha is measured\n- Appropriate benchmarks vary by strategy:\n - L/S equity manager: HFRI Equity Hedge Index, or a custom beta-adjusted S&P 500\n - Market neutral: LIBOR/SOFR + spread (cash-like, reflecting beta-neutral objective)\n - Global macro: HFRI Macro Index, or a 60/40 portfolio\n - Distressed: HFRI Distressed/Restructuring Index\n- Warning: Managers often choose flattering benchmarks. A long-biased L/S fund using T-bills as benchmark shows 18% alpha; using SPX, the same fund shows 2% alpha.\n\n**Skill vs luck — statistical tools:**\n\n**t-statistic of alpha:**\n- t = Alpha / (Standard Error of Alpha)\n- Need t > 2.0 for statistical significance at 95% confidence\n- Requires roughly 36–60 months of track record to achieve significance\n- A 3-year track record with positive alpha is frequently luck — insufficient sample size\n\n**Luck adjustment (Bootstrap method):**\n- Simulate thousands of random portfolios with the same risk characteristics\n- If the manager's actual Sharpe ratio falls in the top 5% of simulated outcomes, alpha is more likely skill\n- Common in quant funds due diligence\n\n**Survivorship bias:**\n- Industry databases exclude defunct funds — inflates published average returns by ~1.5–2% per year\n- Always verify track record includes full history including any prior funds the manager ran",
 highlight: ["benchmark selection", "HFRI", "t-statistic", "statistical significance", "survivorship bias", "bootstrap"],
 },
 {
 type: "quiz-mc",
 question:
 "A hedge fund manager presents a 4-year track record with 18% annualized returns versus their chosen benchmark (3-month T-bills) of 4%. The fund's standard deviation is 24%. However, the fund's beta to the S&P 500 is 0.9. What is the most appropriate concern?",
 options: [
 "The T-bill benchmark obscures that nearly all returns are explained by S&P 500 beta — the manager should be benchmarked against a beta-adjusted equity index",
 "The track record is too long — 4 years is excessive for evaluating hedge fund managers",
 "24% volatility is too low for a fund with 18% returns — the Sharpe ratio is artificially high",
 "The manager's returns are impressive and the T-bill benchmark is appropriate for all alternative strategies",
 ],
 correctIndex: 0,
 explanation:
 "A fund with 0.9 beta to the S&P 500 is essentially a leveraged long-equity strategy. Using T-bills (4%) as the benchmark makes 14% of the return look like 'alpha,' but using an S&P 500 benchmark adjusted for 0.9 beta (say SPX returned 14%, so 0.9×14% = 12.6% beta contribution), the true alpha is only ~5.4%. The appropriate benchmark for a beta-1 equity strategy is the equity market, not cash. Benchmark choice is one of the most important — and commonly manipulated — aspects of performance presentation.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A hedge fund with a 2-year track record showing a Sharpe ratio of 1.8 has statistically proven skill, and the track record is sufficient for an institutional allocation.",
 correct: false,
 explanation:
 "False. A 2-year (24-month) track record is statistically insufficient to distinguish skill from luck. Achieving statistical significance (t-statistic > 2.0) for alpha typically requires 36–60 months of data. With only 24 months, even a Sharpe of 1.8 could easily be a random outcome. Additionally, 2 years may cover only bull market conditions, providing no evidence of how the manager performs in drawdowns or regime changes. Most institutional investors require a minimum of 3 years, and many prefer 5 years before making a primary allocation.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Fund Gamma reports: 11% annualized net return, 9% annualized volatility, 2% maximum drawdown, Sortino ratio of 2.1, and 3-year track record. The HFRI Equity Hedge Index returned 8% over the same period with 11% volatility. The fund's beta to the S&P 500 is 0.25, and the manager claims the strategy is market-neutral.",
 question: "Which aspect of Fund Gamma's performance presentation warrants the most scrutiny?",
 options: [
 "The 0.25 beta contradicts the 'market-neutral' claim — a neutral strategy should have beta near zero, and this residual beta likely explains some of the return premium over the HFRI benchmark",
 "The 2% maximum drawdown is suspiciously low and likely indicates return smoothing or NAV manipulation",
 "The 3-year track record is adequate — no further scrutiny is needed given the strong risk-adjusted metrics",
 "The Sortino ratio of 2.1 is too high and indicates the fund is taking excessive risk",
 ],
 correctIndex: 0,
 explanation:
 "A beta of 0.25 when claiming 'market-neutral' is a significant inconsistency. If the S&P 500 returned, say, 15% over those 3 years, a 0.25 beta contributes approximately 3.75% of annualized return — explaining much of the 3% outperformance versus the HFRI benchmark. The fund is not truly market-neutral; it has systematic market exposure that should be disclosed. The 2% max drawdown is noteworthy (may reflect a short track record not capturing a full market cycle) but less immediately concerning than the beta-neutrality misrepresentation. The combination of beta misrepresentation and a short track record suggests the alpha claim may not survive rigorous factor decomposition.",
 difficulty: 3,
 },
 ],
 },
 ],
};
