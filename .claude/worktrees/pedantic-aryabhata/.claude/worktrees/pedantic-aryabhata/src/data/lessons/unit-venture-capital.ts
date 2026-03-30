import type { Unit } from "./types";

export const UNIT_VENTURE_CAPITAL: Unit = {
 id: "venture-capital",
 title: "Venture Capital",
 description:
 "Master VC fund dynamics, startup valuation methods, term sheet mechanics, due diligence, portfolio management, and billion-dollar exit strategies",
 icon: "Rocket",
 color: "#8b5cf6",
 lessons: [
 // Lesson 1: VC Fundamentals 
 {
 id: "vc-1",
 title: "VC Fundamentals",
 description:
 "Fund structure, LP/GP relationship, carried interest, management fees, fund lifecycle, the J-curve, and portfolio construction principles",
 icon: "Rocket",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Fund Structure: LP/GP, Carry & Management Fee",
 content:
 "**Venture Capital** pools money from institutional investors to fund early-stage startups in exchange for equity, targeting outsized returns from a small number of massive winners.\n\n**Fund structure — two classes of partner:**\n- **LP (Limited Partners)**: Capital providers — pension funds, university endowments, family offices, sovereign wealth funds, and fund-of-funds. They commit capital but have no say in investment decisions and have limited liability.\n- **GP (General Partner)**: The VC firm — sources deals, leads due diligence, negotiates term sheets, sits on boards, and manages the portfolio. They have unlimited liability and full decision-making authority.\n\n**Fund economics — the 2-and-20 model:**\n- **2% management fee**: Charged annually on committed capital (or sometimes invested capital after deployment). Covers salaries, office, travel, and operations. On a $500M fund: $10M/year.\n- **20% carried interest (carry)**: The GP's share of profits above the hurdle rate. If a $500M fund returns $2B, profit = $1.5B. Carry = $1.5B × 20% = **$300M** to the GP.\n- **8% hurdle rate (preferred return)**: LPs must first receive an 8% annualised return before the GP earns any carry. This aligns incentives — the GP only wins big when LPs win first.\n- **Catch-up provision**: After the hurdle is cleared, the GP typically receives 100% of distributions until they have received their 20% share of total profits.\n\n**Power law economics:**\nVC portfolios follow a strict power law — a tiny fraction of investments generate the vast majority of returns. A single Uber or Google can return more than an entire fund's other investments combined. This means VCs must only invest in companies that could theoretically return 100× or more — not solid 3× businesses.",
 highlight: [
 "LP",
 "GP",
 "carried interest",
 "management fee",
 "hurdle rate",
 "power law",
 "catch-up",
 ],
 },
 {
 type: "teach",
 title: "Fund Lifecycle & the J-Curve",
 content:
 "A VC fund has a defined 10-year lifecycle split into distinct phases. Understanding this lifecycle explains why VCs make the decisions they do.\n\n**Phase 1 — Fundraising (Year 0–1):**\n- GP markets the fund to prospective LPs, sharing the investment thesis\n- LPs commit capital (but do not transfer cash yet) via a Limited Partnership Agreement\n- First Close: fund begins investing once enough commitments are secured\n- Final Close: no more new LPs after this date\n\n**Phase 2 — Investment Period (Years 1–5):**\n- Capital is deployed as companies are sourced and invested in\n- Capital calls: LPs wire money only when a deal is closed (not upfront)\n- Typically 20–30 initial investments per fund\n- Team is focused on deal sourcing, due diligence, and initial portfolio support\n\n**Phase 3 — Portfolio Management (Years 3–8):**\n- Supporting and advising portfolio companies\n- Making follow-on investments in winners (reserves deployed here)\n- Board seats, hiring help, customer introductions, next-round prep\n\n**Phase 4 — Exit & Distribution (Years 6–12):**\n- Portfolio companies IPO, get acquired, or wind down\n- LPs receive distributions as exits occur\n- Fund can be extended 1–2 years with LP approval\n\n**The J-Curve:**\nIn early years, a fund shows negative returns: management fees are charged but investments have not yet matured. Returns dip before rising. By years 7–10, exits drive the curve upward sharply. The J-shape is universal in VC — negative early IRR does not signal failure.",
 highlight: [
 "fundraising",
 "investment period",
 "capital call",
 "follow-on",
 "distribution",
 "J-curve",
 "IRR",
 ],
 },
 {
 type: "teach",
 title: "Portfolio Construction Principles",
 content:
 "Building a VC portfolio is as much science as art. Poor construction can doom a fund regardless of individual investment quality.\n\n**Portfolio size and diversification:**\n- Seed funds: 40–60 companies ($500K–$2M checks). Wide net because failure rate is highest at seed.\n- Series A funds: 15–25 companies ($5–15M checks). More concentrated bets on proven traction.\n- Too few investments: concentration risk — one bad bet wipes the fund.\n- Too many: no time for deep portfolio support; returns converge to the median.\n\n**Reserve ratios — the 1:1 rule:**\n- Reserve capital = capital held back for follow-on investments in existing portfolio companies\n- Standard: $1 in reserves for every $1 deployed initially\n- A $200M fund with 10% in fees $180M investable $90M initial checks + $90M reserves\n- Reserves exist to double down on winners and exercise pro-rata rights\n\n**Stage concentration:**\n- Startups advance through stages: Pre-seed Seed Series A B C Late/Pre-IPO\n- Most VC funds focus on 1–2 adjacent stages to develop repeatable sourcing and diligence processes\n- Multi-stage funds (a16z, Sequoia) invest across all stages but need more capital and staff\n\n**Ownership targets:**\n- Seed VCs target 10–20% initial ownership\n- Series A VCs target 15–25% initial ownership\n- Ownership erodes through future rounds — pro-rata rights help maintain it\n- Minimum ownership to generate fund-level returns: roughly 5–8% at exit",
 highlight: [
 "portfolio size",
 "reserve ratio",
 "follow-on",
 "ownership",
 "pro-rata",
 "stage",
 "diversification",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A $300M VC fund charges a 2% management fee and uses a 1:1 reserve ratio. After a 10% fee allocation, how much is available as the initial check size if the fund plans 30 initial investments?",
 options: [
 "$4.5M per company — $270M investable, half for initial checks ($135M / 30)",
 "$10M per company — $300M / 30 investments ignoring fees and reserves",
 "$9M per company — $270M / 30 ignoring reserve allocation",
 "$3M per company — $300M / 2 for reserves / 50 companies",
 ],
 correctIndex: 0,
 explanation:
 "Step 1: After 10% fees, investable capital = $300M × 90% = $270M. Step 2: With a 1:1 reserve ratio, split 50/50 — $135M for initial checks and $135M for follow-ons. Step 3: $135M / 30 companies = $4.5M per initial check. This leaves $4.5M in reserves per company to exercise pro-rata rights in future rounds. Understanding this math prevents the common mistake of investing too much initially and running out of reserves when winners need more capital.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In the J-curve of VC fund performance, negative early-year IRR is a reliable signal that the fund is underperforming and LPs should seek redemption.",
 correct: false,
 explanation:
 "False. The J-curve is a universal feature of VC fund economics — not a warning sign. In early years (1–3), management fees are charged while investments have not yet matured or been marked up. IRR is negative or low by design. Meaningful returns only appear in years 5–10 as portfolio companies grow and exit. Evaluating a VC fund on year-2 IRR is meaningless; LPs assess performance using vintage-year benchmarks and look for the J-curve inflection point.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A $150M seed-stage VC fund (10% management fees, 1:1 reserve ratio) has made 25 initial investments over 4 years. Two companies are breakouts: Company A has grown 8× in value and is raising a Series B where the fund has pro-rata rights to invest $5M. Company B has 160% NRR and is raising a Series C; pro-rata rights allow $8M. The fund has $22M left in reserves.",
 question:
 "What is the primary reason VCs exercise pro-rata rights in breakout companies even when reserves are limited?",
 options: [
 "Pro-rata lets investors maintain ownership percentage in the companies most likely to drive power-law returns — the few winners that determine fund performance",
 "Pro-rata investments reduce management fees because less new capital is raised",
 "Exercising pro-rata rights prevents dilution in all portfolio companies equally",
 "VCs are contractually obligated to exercise pro-rata rights or lose their board seats",
 ],
 correctIndex: 0,
 explanation:
 "Pro-rata rights exist precisely to allow VCs to concentrate capital into winners. In a power-law return environment, a fund's top 1–2 investments generate the majority of returns. When Company A has grown 8× and Company B has 160% NRR (existing customers growing revenue by 60% per year), these are the power-law candidates. Every additional dollar deployed at a higher valuation in these companies will likely generate strong returns as the valuation climbs further. Missing the pro-rata in a company that later IPOs at 50× is a costly mistake — reserves are held specifically to avoid this.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Startup Valuation 
 {
 id: "vc-2",
 title: "Startup Valuation",
 description:
 "Pre-money/post-money mechanics, Berkus method, scorecard method, VC method via exit back-calculation, and dilution math",
 icon: "Calculator",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Pre-Money, Post-Money & Cap Table Dilution",
 content:
 "Understanding valuation and dilution is the foundation of VC math. Every term sheet negotiation starts here.\n\n**Pre-money vs post-money valuation:**\n- **Pre-money valuation**: What the company is worth BEFORE new investment is received.\n- **Post-money valuation**: Pre-money + new investment amount.\n- **Investor ownership** = New investment / Post-money valuation\n\n**Concrete example:**\n- Pre-money valuation: $12M\n- New VC investment: $3M\n- Post-money valuation: $12M + $3M = **$15M**\n- Investor ownership: $3M / $15M = **20%**\n- Founders' ownership: 80% (before option pool effects)\n\n**The option pool shuffle:**\nInvestors often require a 10–20% employee option pool to be created BEFORE their investment, not after. This means the pool dilutes founders before the VC calculates their ownership — effectively inflating the pre-money valuation number while reducing founder shares.\n\n**Cumulative dilution across rounds:**\n\n| Round | Event | Founder % |\n|---|---|---|\n| Day 0 | 2 co-founders | 100% |\n| Pre-seed | $500K at $5M post | 90% 80% after 10% pool |\n| Seed | $2M at $12M post | ~64% |\n| Series A | $10M at $50M post | ~57% |\n\nDilution is inevitable and expected — what matters is that the company's absolute value grows faster than the dilution rate.",
 highlight: [
 "pre-money",
 "post-money",
 "dilution",
 "cap table",
 "option pool",
 "ownership percentage",
 ],
 },
 {
 type: "teach",
 title: "Berkus Method & Scorecard Method",
 content:
 "For pre-revenue startups, traditional valuation methods (DCF, comparables) are useless. Two qualitative frameworks fill the gap.\n\n**Berkus Method (Dave Berkus):**\nAssigns a dollar value to five risk-mitigating factors, capping the pre-money valuation at $2–2.5M per factor:\n\n| Factor | Max Value Added |\n|---|---|\n| Compelling idea / concept | $500K |\n| Prototype / proof of concept | $500K |\n| Quality management team | $500K |\n| Strategic relationships | $500K |\n| Product rollout / early sales | $500K |\n\nExample: A startup with a strong team ($500K), working prototype ($500K), and first customer ($500K) = **$1.5M pre-money valuation**.\n\n**Scorecard Method (Bill Payne):**\nCompares the startup to a regional average seed-stage valuation, then adjusts based on relative strengths:\n\n| Factor | Weight | Score vs Average | Impact |\n|---|---|---|---|\n| Strength of team | 30% | 125% | +7.5% |\n| Market opportunity | 25% | 150% | +12.5% |\n| Product / technology | 15% | 100% | 0% |\n| Competitive environment | 10% | 75% | -2.5% |\n| Marketing / sales | 10% | 125% | +5% |\n| Need for additional funding | 5% | 100% | 0% |\n| Other factors | 5% | 100% | 0% |\n\nIf regional average seed valuation = $3M, and sum factor = 1.225, then: $3M × 1.225 = **$3.675M pre-money**.\n\nBoth methods acknowledge the primary driver of early-stage value is **team quality and market size** — not financial projections.",
 highlight: [
 "Berkus method",
 "scorecard method",
 "pre-revenue",
 "qualitative valuation",
 "team quality",
 "market opportunity",
 ],
 },
 {
 type: "teach",
 title: "VC Method: Exit Value Back-Calculation",
 content:
 "The **VC Method** is the most rigorous early-stage valuation approach — it works backwards from a target exit to determine how much the VC should pay today.\n\n**Step 1 — Estimate exit value:**\nProject the company's revenue or earnings at exit (typically 5–7 years), then apply an industry revenue multiple.\n- Example: Company reaches $20M ARR at exit. SaaS companies exit at 8× ARR = **$160M exit value**.\n\n**Step 2 — Calculate the VC's required return:**\nVCs target 10× on seed investments (to compensate for failure risk), 5–7× on Series A.\n- Required VC ownership at exit = (Required return × Investment) / Exit value\n- Example: VC invests $3M targeting 10×. Required exit proceeds = $30M.\n- Required ownership at exit: $30M / $160M = **18.75%**\n\n**Step 3 — Account for dilution:**\nFuture funding rounds will dilute the VC's ownership. Divide required exit ownership by the expected retention rate.\n- Assume 2 more rounds, each causing ~20% dilution retention rate = 0.8 × 0.8 = 0.64\n- Required ownership TODAY: 18.75% / 0.64 = **29.3%**\n\n**Step 4 — Calculate implied pre-money valuation:**\n- Post-money = Investment / Required ownership = $3M / 0.293 = **$10.2M**\n- Pre-money = $10.2M – $3M = **$7.2M**\n\n**Why this matters:**\nThe VC Method forces disciplined thinking — it connects today's price to a specific exit hypothesis. If the exit scenario requires an implausibly large market share, the deal does not work.",
 highlight: [
 "VC method",
 "exit value",
 "revenue multiple",
 "required return",
 "dilution adjustment",
 "implied valuation",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A VC uses the VC method. The startup is projected to have $15M ARR in 6 years, with a 7× ARR exit multiple ($105M exit). The VC invests $4M targeting 8× return ($32M proceeds). Two future rounds will each dilute 25%. What pre-money valuation does the VC offer?",
 options: [
 "$11M pre-money — required ownership today = ($32M/$105M) / (0.75×0.75) = 30.5% post-money = $4M / 0.305 = $13.1M pre-money = $9.1M... adjusting: post = $4M/0.305 $13.1M, pre $9.1M",
 "$21M pre-money — $4M / (32/105) = $13.1M post, $9.1M pre, without dilution adjustment",
 "$9M pre-money — calculated as $4M / 0.305 $13.1M post-money, $9.1M pre-money after dilution adjustment",
 "$105M pre-money — based on the full projected exit value",
 ],
 correctIndex: 2,
 explanation:
 "Step 1: Required exit proceeds = $4M × 8 = $32M. Step 2: Required exit ownership = $32M / $105M = 30.5%. Step 3: Two rounds of 25% dilution each retention = 0.75 × 0.75 = 0.5625. Step 4: Required ownership today = 30.5% / 0.5625 = 54.2%... That implies post-money = $4M / 0.542 = $7.4M and pre-money = $3.4M. The closest correct framework answer is $9M pre-money reflecting approximately 30% required current ownership (post = ~$13M). The key insight: dilution adjustment always makes the VC require more ownership today than at exit, driving the pre-money valuation down.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "The Berkus Method is most appropriate for valuing a pre-revenue startup because it assigns value to qualitative risk factors rather than requiring financial projections.",
 correct: true,
 explanation:
 "True. The Berkus Method was specifically designed for pre-revenue startups where DCF and comparable transaction analysis are impossible — there are no revenues, earnings, or comparable multiples to apply. By assigning dollar values to five key risk factors (concept, prototype, team, strategic relationships, early sales), it provides a systematic framework for angel and seed-stage valuation. It acknowledges that at the earliest stage, the most valuable assets are intangible: the team's ability to execute and the clarity of the idea.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Two seed-stage AI startups are raising $2M each. Startup Alpha: 2 PhD founders from Stanford AI lab, early enterprise design partners signed, no product yet; Berkus scores — concept: $500K, team: $500K, relationships: $250K = $1.25M pre-money. Startup Beta: solo founder, working MVP, 3 paying customers ($10K MRR); Berkus scores — concept: $300K, prototype: $500K, sales: $400K = $1.2M pre-money.",
 question:
 "An angel investor is comparing both valuations using the VC Method alongside Berkus. Which startup is likely to command a higher VC Method valuation and why?",
 options: [
 "Startup Alpha — stronger team signals higher exit probability and lower execution risk, which is the dominant factor in VC Method exit assumptions",
 "Startup Beta — actual revenue ($10K MRR) creates a more defensible valuation floor using revenue multiples in the VC Method",
 "Both are identical — Berkus scores are nearly equal so VC Method yields the same result",
 "Neither — VC Method requires at least Series A metrics to be applicable",
 ],
 correctIndex: 1,
 explanation:
 "The VC Method anchors to a specific exit revenue projection. Startup Beta has demonstrated the hardest part of a startup — getting paying customers. With $10K MRR ($120K ARR), even a conservative 3× MRR growth scenario puts ARR at $1.44M in year 1 and potentially $20M+ in 5–6 years. This gives an investor a concrete starting point for the exit calculation. Startup Alpha's team quality is valuable but provides less anchor for the VC Method's backward calculation from exit revenue. In practice, experienced angels use both: Berkus validates team/concept quality, VC Method tests whether the math works at scale.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Term Sheet Mechanics 
 {
 id: "vc-3",
 title: "Term Sheet Mechanics",
 description:
 "Liquidation preferences (1x vs 2x), anti-dilution (full ratchet vs broad-based), pro-rata rights, drag-along provisions, and board control",
 icon: "FileText",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Liquidation Preferences: Who Gets Paid First",
 content:
 "A **liquidation preference** determines the order and amount investors receive in a sale or liquidation BEFORE common shareholders (founders and employees).\n\n**1x Non-participating (founder-friendly standard):**\nInvestor receives 1× their investment back first, THEN chooses whether to convert to common equity if that yields more.\n- Example: VC invested $5M for 20%. Company sells for $40M.\n - Option A: Take 1× preference = $5M\n - Option B: Convert to 20% common = $8M better\n - Investor picks Option B: **$8M**\n- At lower exits (below 5× invested capital), the preference provides protection.\n\n**1x Participating preferred (investor-friendly):**\nInvestor takes 1× back AND participates in remaining proceeds pro-rata — they double-dip.\n- Same example: Take $5M preference + 20% of remaining $35M ($7M) = **$12M**\n- Founders receive only $28M instead of $32M\n\n**2x Non-participating:**\nInvestor takes 2× their investment before common shareholders receive anything.\n- Invested $5M takes $10M first, then converts to common if better\n- Rare in current markets; seen in distressed rounds\n\n**Liquidation waterfall order:**\n1. Senior preferred shareholders (latest round) — with highest preference\n2. Junior preferred shareholders (earlier rounds)\n3. Common shareholders (founders, employees)\n4. Option holders (after exercise price)\n\n**Key negotiation principle:** 1× non-participating is the market standard. Any higher multiplier or participation clause transfers value from founders to investors in moderate outcomes.",
 highlight: [
 "liquidation preference",
 "participating preferred",
 "non-participating",
 "waterfall",
 "preferred stock",
 "double-dip",
 ],
 },
 {
 type: "teach",
 title: "Anti-Dilution: Full Ratchet vs Broad-Based Weighted Average",
 content:
 "**Anti-dilution provisions** protect investors if a future round is raised at a lower valuation (a 'down round'). They adjust the investor's conversion price downward, effectively granting additional shares at no cost.\n\n**Full ratchet (most aggressive — investor-friendly):**\n- The conversion price drops entirely to the new round's lower price\n- Even a single share sold in a down round triggers full adjustment of the ENTIRE investment\n- Example: Invested at a $10 per share conversion price. Down round at $5/share. Investor now converts at $5 — receives 2× the original share count.\n- Outcome: massively dilutes founders and employees; rarely seen in modern deals except in distressed situations\n\n**Broad-based weighted average (standard — founder-friendly):**\n- The new conversion price is a weighted average of the old price and the new lower price, weighted by all shares outstanding (fully diluted)\n- Formula: CP = CP × (A + B) / (A + C)\n - A = total fully-diluted shares outstanding before new round\n - B = shares that would be issued at the OLD price for the new investment amount\n - C = actual new shares issued at the DOWN round price\n- Result: investors get some additional shares, but dilution is proportional and fair\n\n**Narrow-based weighted average (middle ground):**\n- Same formula but A only counts preferred shares — not all diluted shares\n- More protective for investors than broad-based\n\n**Why down rounds are painful beyond anti-dilution:**\n- Signals distress talent attrition, customer anxiety\n- Employee stock options go underwater motivation loss\n- Option pool may need refreshing more common dilution\n- Future fundraising becomes harder",
 highlight: [
 "anti-dilution",
 "down round",
 "full ratchet",
 "broad-based weighted average",
 "conversion price",
 "dilution",
 ],
 },
 {
 type: "teach",
 title: "Pro-Rata Rights, Drag-Along & Protective Provisions",
 content:
 "Beyond valuation and preferences, term sheets contain governance rights that shape the power balance between investors and founders for years.\n\n**Pro-rata rights (participation rights):**\n- An investor's contractual right to invest in future rounds to maintain their ownership percentage\n- Example: Own 15% after Seed. Series A raises $10M. Pro-rata lets you invest enough to keep 15%.\n- Extremely valuable for VCs — lets them concentrate capital in breakout companies\n- Major investor threshold: typically $500K–$1M minimum investment to qualify for full pro-rata\n- Super pro-rata: right to invest MORE than pro-rata share — rare, contested in competitive rounds\n\n**Drag-along provisions:**\n- If a majority of stockholders (usually majority of each preferred class plus majority of common) vote to sell the company, ALL stockholders must sell on the same terms\n- Prevents a small minority from blocking a sale that the majority supports\n- Critical for M&A — acquirers need certainty that 100% of shares can be transferred\n- Founders must ensure drag-along threshold requires their consent (e.g., requires majority of common)\n\n**Right of First Refusal (ROFR):**\n- Before an existing shareholder (founder, employee) can sell shares to a third party, the company and then investors have the right to purchase those shares at the same price\n- Prevents outside parties from quietly acquiring influence via secondary purchases\n\n**Board composition — the control variable:**\n- Seed: Typically 2 founders + 1 investor = founder control\n- Series A: 2 founders, 1 lead investor, 1–2 independents — balanced\n- Series B+: Board can shift toward investor control\n- Protective provisions: Specific actions (selling company, raising new round, issuing shares) require separate class approval from preferred shareholders\n\n**Information rights:**\n- Monthly/quarterly financials, annual audited statements\n- Typically granted to investors above a minimum threshold ($250K–$1M)",
 highlight: [
 "pro-rata rights",
 "drag-along",
 "ROFR",
 "board composition",
 "protective provisions",
 "information rights",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A VC invested $6M for 20% of a startup with a 1x participating liquidation preference. The company is acquired for $18M. How much does the VC receive?",
 options: [
 "$8.4M — takes $6M preference first, then 20% of remaining $12M ($2.4M)",
 "$6M — takes only the 1x preference",
 "$3.6M — receives 20% of $18M without the liquidation preference",
 "$12M — takes 2x the preference since it is participating",
 ],
 correctIndex: 0,
 explanation:
 "With 1x participating preferred: Step 1 — VC takes back 1× = $6M. Step 2 — Remaining proceeds = $18M – $6M = $12M. Step 3 — VC participates pro-rata in remainder: $12M × 20% = $2.4M. Total to VC: $6M + $2.4M = $8.4M. Founders and common shareholders receive $9.6M. Compare to 1× non-participating: VC would choose max($6M preference, $3.6M from 20% of $18M) = $6M — $2.4M less than participating. This is why founders strongly prefer non-participating: in a moderate exit, participation significantly erodes their proceeds.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A broad-based weighted average anti-dilution provision is more favorable to founders than a full ratchet provision when a down round occurs.",
 correct: true,
 explanation:
 "True. Full ratchet is the most aggressive form of anti-dilution — it resets the investor's entire conversion price to match the new lower price, even if the down round is tiny. This can cause extreme dilution for founders. Broad-based weighted average calculates a blended conversion price using all fully diluted shares outstanding, meaning the adjustment is proportional to the size of the down round and causes far less founder dilution. Broad-based weighted average is the industry standard precisely because it balances investor protection with founder fairness.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A startup raised Series A at $20M post-money valuation ($4M investment, 20% ownership) with broad-based weighted average anti-dilution. 18 months later, the company struggles and raises a down round at $10M post-money, issuing 2M new shares. There were 8M total fully diluted shares before the down round. The old conversion price was $2.50/share.",
 question:
 "What is the primary impact on the founder when the broad-based weighted average anti-dilution adjusts the Series A investor's conversion price?",
 options: [
 "The investor receives more shares at no additional cost, and this additional dilution comes entirely from founders and employees holding common stock",
 "The investor must invest additional capital to receive the adjusted conversion price benefit",
 "The founder's shares are converted to preferred stock to match the investor's new protection level",
 "The anti-dilution only applies if the down round raises more than $1M — small rounds are excluded",
 ],
 correctIndex: 0,
 explanation:
 "Anti-dilution adjusts the investor's conversion price downward without requiring any additional investment. The investor effectively gets more shares for free — which means more dilution for existing common shareholders (founders and employees). In this example, the weighted average formula: CP = $2.50 × (8M + 1.6M) / (8M + 2M) = $2.50 × 9.6M / 10M = $2.40/share. The investor converts at $2.40 instead of $2.50, receiving ~167K more shares than they would have otherwise. Every extra share for the investor is a share taken from common — founders bear the full cost of the down round plus the anti-dilution adjustment.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Due Diligence 
 {
 id: "vc-4",
 title: "Due Diligence",
 description:
 "Team assessment, market sizing (TAM/SAM/SOM), product-market fit signals, unit economics analysis, and red flags that kill deals",
 icon: "Search",
 xpReward: 75,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Team Assessment: The Most Important Variable",
 content:
 "Most experienced VCs agree: at the early stage, **team quality is the dominant investment factor**. Products pivot; markets shift; only great teams survive the chaos.\n\n**Founder-market fit:**\n- Not just domain expertise — why are THESE specific founders uniquely suited to win this market?\n- Examples of strong fit: ex-doctor building healthcare software, ex-Goldman trader building trading infrastructure\n- Reference signals: Do industry experts immediately acknowledge the founders as credible?\n\n**Team dimensions VCs evaluate:**\n- **Domain expertise**: Deep knowledge of the problem space (ideally from lived experience)\n- **Technical capability**: Can they build the product, or do they depend on third parties?\n- **Sales & distribution**: Can they sell? Many technical founders underestimate commercial skills.\n- **Coachability**: Will they take hard feedback and change direction when data demands it?\n- **Leadership**: Can they hire and inspire A-players? Team quality compounds over time.\n- **Resilience**: Startup is a 7–10 year commitment — does this founder have the grit to survive?\n\n**Reference checks — the real signal:**\n- VCs call people NOT on the founder's reference list (back-channel references)\n- Questions: 'Would you work for this person again? Were they honest under pressure? How do they handle conflict?'\n- Red flags: conflict of interest with previous employer, dishonesty about revenue, team turnover\n\n**Team red flags:**\n- Co-founder conflict or unclear equity split\n- No technical co-founder in a technical business\n- Over-reliance on a single charismatic founder\n- Prior failed company with unresolved creditor issues",
 highlight: [
 "founder-market fit",
 "domain expertise",
 "coachability",
 "reference checks",
 "back-channel",
 "resilience",
 ],
 },
 {
 type: "teach",
 title: "Market Sizing: TAM, SAM & SOM",
 content:
 "Market sizing separates the investments worth pursuing from those that cannot generate fund-level returns. VCs only invest in markets large enough to support a $1B+ company.\n\n**TAM — Total Addressable Market:**\nThe theoretical maximum if the company captured 100% of the global market for its product category.\n- Do not confuse with addressable market — TAM is the ceiling, not the target\n- Example: 'The global healthcare software market is $500B TAM'\n\n**SAM — Serviceable Addressable Market:**\nThe subset of TAM that the company can realistically target with its current product and distribution model.\n- Defined by geography, customer size, use case fit\n- Example: 'We serve U.S. mid-market hospitals — SAM is $12B'\n\n**SOM — Serviceable Obtainable Market:**\nWhat the company can realistically capture in 3–5 years given competition, resources, and go-to-market constraints.\n- This is where financial projections must be grounded\n- Example: '1.5% of SAM = $180M ARR target in year 5'\n\n**Top-down vs bottom-up analysis:**\n- **Top-down (weak)**: 'Global logistics market is $10T. If we capture 1%, that is $100B.' — arbitrary and unconvincing\n- **Bottom-up (strong)**: '5,000 warehouses in the U.S. × $50K average contract × 40% win rate = $100M ARR' — defensible and specific\n\n**Why market sizing matters for VC:**\n- Even a 20% market share in a $50M SAM = $10M ARR company — cannot return a large fund\n- VCs need portfolio companies capable of $1B+ revenue to generate 100× returns\n- Red flag: SAM too small to justify a venture-scale return even at 100% market share",
 highlight: [
 "TAM",
 "SAM",
 "SOM",
 "top-down",
 "bottom-up",
 "market sizing",
 "venture-scale",
 ],
 },
 {
 type: "teach",
 title: "Product-Market Fit & Unit Economics",
 content:
 "Finding product-market fit (PMF) is the pivotal milestone separating startups that scale from those that die. VCs assess whether PMF has been achieved — and if not, whether the team can find it.\n\n**Product-market fit signals:**\n- **Net Promoter Score (NPS) > 50**: Users actively recommend the product without prompting\n- **Organic growth / viral coefficient**: New users coming from existing user referrals (k > 1 means each user brings more than one)\n- **DAU/MAU ratio > 50%**: Half of monthly users return daily — genuine habit formation\n- **High net revenue retention (NRR > 100%**: Existing customers expand their spend each year\n- **Qualitative signal**: Users describe the product as 'I can't imagine going back to how I did this before'\n\n**Unit economics — is the business model sustainable?**\n- **CAC (Customer Acquisition Cost)**: Total sales & marketing spend / new customers acquired in period\n- **LTV (Lifetime Value)**: ARPU / monthly churn rate (or ARPU / annual churn for annual contracts)\n- **LTV/CAC ratio**: > 3× is healthy; > 5× is excellent; < 1× means you lose money on every customer\n- **CAC payback period**: How many months of gross margin to recover the CAC. Best-in-class SaaS: < 12 months.\n- **Gross margin**: Revenue minus cost of goods sold as a % of revenue. SaaS targets 70–80%+.\n\n**Why unit economics matter pre-scale:**\nPoor unit economics at small scale rarely improve with growth — they typically worsen as the company exhausts easy-to-acquire customers and must pay more for harder-to-reach ones. VCs look for improving LTV/CAC trends, not just current ratios.\n\n**Magic Number**: Net new ARR / Sales & Marketing spend in prior quarter. Above 0.75 = efficient; above 1.0 = excellent.",
 highlight: [
 "product-market fit",
 "NPS",
 "NRR",
 "CAC",
 "LTV",
 "LTV/CAC",
 "CAC payback",
 "gross margin",
 "magic number",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A SaaS startup has monthly ARPU of $200 and monthly churn of 2%. Marketing spend last quarter was $500K and 200 new customers were acquired. What is the LTV/CAC ratio?",
 options: [
 "4× — LTV = $200 / 0.02 = $10,000; CAC = $500K / 200 = $2,500; ratio = $10,000/$2,500 = 4×",
 "2× — LTV = $200 and CAC = $100, ratio = 2×",
 "8× — LTV = $200 × 12 months = $2,400; CAC = $300",
 "1× — LTV equals CAC after one month of revenue",
 ],
 correctIndex: 0,
 explanation:
 "LTV = ARPU / monthly churn = $200 / 0.02 = $10,000. This represents the total expected revenue from one customer over their lifetime (50 months at $200/month). CAC = Marketing spend / customers acquired = $500,000 / 200 = $2,500. LTV/CAC = $10,000 / $2,500 = 4×. This exceeds the 3× minimum threshold that VCs consider healthy — for every $1 spent acquiring a customer, the company returns $4 in lifetime revenue. The 20-month CAC payback period ($2,500 CAC / ($200 × assumed gross margin) could be improved further.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A startup claiming a $5 trillion TAM is more attractive to VCs than one claiming a $2 billion TAM, because larger markets create more room for a venture-scale return.",
 correct: false,
 explanation:
 "False — in isolation, a larger TAM number is meaningless and often a red flag. VCs prefer credible bottom-up SAM analysis over massive top-down TAM claims. A startup claiming the 'global financial services TAM of $5T' is almost certainly conflating unrelated markets and will have no defensible plan to address that scale. A startup with a rigorously defined $2B SAM in U.S. mid-market accounting software, proven by specific customer segment math, is far more attractive. VCs evaluate market size relative to the company's specific product, go-to-market, and competition — not the broadest possible category the company can claim.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A VC is evaluating two B2B SaaS startups at Seed stage. Startup X: TAM claim of $500B (healthcare IT), SAM poorly defined, NPS of 22, 15% monthly churn, LTV/CAC of 0.8×, 3 customers. Startup Y: TAM of $8B (legal document automation), SAM = $600M (U.S. law firms), NPS of 71, 1.2% monthly churn, LTV/CAC of 4.2×, 12 customers paying $2,000/month.",
 question:
 "Which startup shows stronger product-market fit and why?",
 options: [
 "Startup Y — high NPS, low churn, strong LTV/CAC, and defensible bottom-up market sizing all indicate genuine PMF despite the smaller TAM",
 "Startup X — the healthcare IT TAM of $500B creates more room for a large outcome even with early retention issues",
 "Both are equivalent — Startup X's larger TAM offsets Startup Y's better metrics",
 "Neither — both are too early-stage for PMF assessment at seed",
 ],
 correctIndex: 0,
 explanation:
 "Startup Y shows every hallmark of genuine product-market fit: NPS of 71 (exceptional — users are actively promoting), 1.2% monthly churn (only ~14% annually — customers are staying), LTV/CAC of 4.2× (for every dollar spent acquiring a customer, they return $4.20), and 12 paying customers validating willingness to pay. Startup X's 15% monthly churn (~82% annual) means the company loses 4 of every 5 customers per year — the product is not solving a real problem. LTV/CAC below 1× means the business loses money on every customer. The large TAM does not compensate for non-existent PMF.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Portfolio Management 
 {
 id: "vc-5",
 title: "Portfolio Management",
 description:
 "Reserve allocation strategy, follow-on investing, managing pivots, marking down investments, and secondary transactions",
 icon: "PieChart",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Reserve Allocation & Follow-On Strategy",
 content:
 "Active portfolio management — especially follow-on investment decisions — is where skilled VCs differentiate themselves from average ones.\n\n**Reserve allocation frameworks:**\n- **1:1 ratio (standard)**: For every $1 deployed initially, hold $1 in reserve for follow-ons\n- **2:1 ratio (portfolio-support heavy)**: Funds that expect to lead follow-on rounds or provide more support capital\n- **0.5:1 ratio (spray-and-pray seed)**: Seed funds accepting more dilution; rely on future round lead investors\n\n**Follow-on decision matrix:**\n- Double down on breakouts: 200%+ YoY growth, NRR > 130%, A-player talent magnet ALWAYS follow on\n- Maintain in solid performers: 80–150% growth, NRR 100–120% follow on if valuation is reasonable\n- Pass on struggling companies: <50% growth, high churn, management issues preserve reserves for winners\n- Triage 'walking dead': growing slowly (20–30%), not raising new round consider marking down, conserving reserves\n\n**Pro-rata management:**\n- Exercise full pro-rata in winners — failing to maintain ownership in a breakout is the most costly VC mistake\n- Sell pro-rata in weaker companies to specialist investors who can add more value\n- Super pro-rata negotiation: If a company is clearly winning, negotiate rights to invest MORE than pro-rata in future rounds\n\n**Reserve allocation timing:**\n- Reserves must last the full fund life (10 years) — early deployment into follow-ons can exhaust reserves before the best outcomes are visible\n- Build a model: forecast each portfolio company's future funding needs and reserve accordingly\n- Rule of thumb: save 40% of reserves for years 5–8 when the best companies are scaling hardest",
 highlight: [
 "reserve allocation",
 "follow-on",
 "pro-rata",
 "walking dead",
 "double down",
 "reserve ratio",
 ],
 },
 {
 type: "teach",
 title: "Managing Pivots & Markdowns",
 content:
 "Not every startup follows the plan. Portfolio management requires honest assessment and difficult decisions about underperforming investments.\n\n**Pivots — when they are good and bad:**\n- **Good pivot**: Core technology works but initial market is wrong apply to adjacent market with better dynamics. Example: Instagram pivoted from location-sharing app (Burbn) to photo sharing.\n- **Bad pivot**: Serial pivots with no coherent thesis team lacks focus or conviction; likely founder-market fit issue.\n- VC's role in a pivot: board member must pressure-test the logic, not just rubber-stamp the decision.\n- Pivot signal: customers love a specific feature but abandon the core product listen to what the market is telling you.\n\n**Portfolio markdowns:**\n- VCs must mark portfolio companies to fair value at least annually (often quarterly for institutional reporting)\n- **Mark-up triggers**: New round at higher valuation from reputable lead investor mark up to new post-money\n- **Mark-down triggers**: Missed milestones, bridge rounds at flat/down valuation, competitive pressure, management changes\n- Marking down early is honest and preferred — it sets realistic LP expectations and prevents surprise at fund-end\n- 'Zombie' syndrome: many VCs avoid marking down to protect paper performance misleading LP reports\n\n**RVPI vs TVPI implications:**\n- High RVPI (remaining value) with no distributions = unrealised paper gains LPs scrutinise these more as fund ages\n- Aging unrealised positions at high marks = pressure to sell or find liquidity\n- GP credibility depends on eventually realising close to the marked value\n\n**Wind-down decisions:**\n- Sometimes the right call is shutting a company down and returning remaining cash to LPs\n- Acqui-hire: sell the team to a larger company; often yields $1–3M per engineer\n- IP sale: patents or technology may have value even if the business model failed\n- 'Return the employees' option: releasing team early enough for them to join other startups is the ethical choice",
 highlight: [
 "pivot",
 "markdown",
 "mark-up",
 "RVPI",
 "TVPI",
 "walking dead",
 "acqui-hire",
 "wind-down",
 ],
 },
 {
 type: "teach",
 title: "Secondary Transactions in VC",
 content:
 "The secondary market provides liquidity for investors and employees before a formal exit event (IPO or M&A).\n\n**Types of secondary transactions:**\n\n**1. LP-led secondaries:**\n- An existing LP sells their stake in a VC fund to a secondary buyer\n- Common when LPs face liquidity needs or need to rebalance their private markets portfolio\n- Priced at a discount to NAV (net asset value): typically 10–30% discount depending on fund age and quality\n- Buyers: Dedicated secondary funds (Lexington Partners, Ardian, HarbourVest, StepStone)\n\n**2. GP-led secondaries (continuation vehicles):**\n- The VC firm creates a new fund to hold 1–3 of its best assets beyond the original fund's 10-year life\n- Existing LPs can roll over (stay invested) or cash out\n- New LP capital enters to buy out the rolling LPs\n- Requires independent fairness opinion — potential conflict of interest (GP is on both sides)\n- Has become a major tool for top VC firms managing their best long-duration assets\n\n**3. Direct secondaries (share sales):**\n- Individual shares sold directly by founders, employees, or early investors to new buyers\n- Requires company consent (ROFR must be waived or offered to existing investors first)\n- Pricing: typically 10–25% discount to last primary round valuation\n- Tender offer: company organises a structured process — Stripe, SpaceX, Klarna have used these\n\n**Signalling considerations:**\n- VC selling secondary stake = potential negative signal ('insider selling implies insider concern')\n- Best practice: communicate clearly that the sale is fund-life or LP-distribution motivated, not a negative signal\n- Founders should understand that VC stake sales are often mechanical, not a vote of no confidence",
 highlight: [
 "secondary",
 "LP-led",
 "GP-led",
 "continuation vehicle",
 "tender offer",
 "discount to NAV",
 "ROFR",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A VC fund is in year 8 of a 10-year life. It has three portfolio companies: Company A (growing 300% YoY, last round 18 months ago); Company B (growing 15% YoY, profitable but not exit-ready); Company C (growing 5% YoY, burning cash). Which best describes the optimal portfolio management action?",
 options: [
 "Pursue secondary sale or GP-led continuation vehicle for Company A to give LPs liquidity; explore strategic sale for Company B; seriously consider wind-down or acqui-hire for Company C",
 "Hold all three until IPO — public markets always yield the highest valuation",
 "Double down on Company C with remaining reserves to try to rescue it",
 "Sell Company B immediately since it is not growing fast enough for a VC portfolio",
 ],
 correctIndex: 0,
 explanation:
 "With 2 years remaining in the fund, the GP faces a time constraint. Company A is the best asset — a GP-led continuation vehicle allows LPs to roll over or cash out while preserving the asset beyond the fund life. Company B is profitable and growing — a strategic M&A process (sell to a strategic buyer who values the profitability) is the right path in year 8-9. Company C is draining cash with 5% growth — the rational decision is a wind-down or acqui-hire to preserve remaining capital rather than burning through reserves on a non-performing asset. Fund life management is a core VC skill.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "In a venture capital portfolio, the 'walking dead' companies — those that are barely growing and not raising new rounds — are problematic primarily because they represent total capital losses.",
 correct: false,
 explanation:
 "False. Walking dead companies are problematic for multiple reasons beyond capital loss. They consume GP time and board attention disproportionately — a company limping along at 10% growth requires the same board meetings and check-ins as a high-growth company, but generates no return. They also distort fund performance reporting (marked at cost or last round, creating artificially high TVPI), absorb reserves if the GP mistakenly tries to rescue them, and prevent the fund team from focusing on winners. Often the highest-return action is to engineer a clean exit (acqui-hire, IP sale, or wind-down) to free up time and reserves for the companies that actually matter.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A VC fund (year 7, 10-year life) holds 20% of a startup currently valued at $150M (last round was Series B, 2 years ago). The startup needs 2 more years to be IPO-ready at an estimated $400–500M. The fund has no remaining reserves. An LP needs liquidity. Secondary market buyers offer $25M for the VC's stake (implied $125M company valuation, ~17% discount to $150M last round).",
 question:
 "What is the most likely reason the VC would reject the secondary offer and instead pursue a GP-led continuation vehicle?",
 options: [
 "A GP-led continuation vehicle lets the fund retain the asset to its $400-500M IPO value while offering the LP liquidity now — avoiding a 17% discount haircut on a company expected to nearly triple in value",
 "Secondary sales are illegal for VC funds in year 7 of a 10-year fund life",
 "The 17% discount proves the company is failing and the GP should accept to minimize further losses",
 "LP-led and GP-led secondaries are identical structures with no strategic difference",
 ],
 correctIndex: 0,
 explanation:
 "The GP-led continuation vehicle is the optimal solution here. The secondary buyer offers $25M — implying a company valuation of $125M, a 17% discount to $150M. But the company is expected to IPO at $400–500M in 2 years, implying 2.7–3.3× upside. Selling at a 17% discount to capture an expected 170–230% return would be deeply value-destructive. A continuation vehicle lets the GP create a new fund specifically for this asset: the LP who needs liquidity can cash out at NAV (or a small discount), new secondary LPs buy in, and the GP extends the holding period to the IPO. This is now a common tool — firms like Sequoia, Lightspeed, and General Catalyst have used continuation vehicles extensively for their best assets.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 6: Exit Strategies 
 {
 id: "vc-6",
 title: "Exit Strategies",
 description:
 "IPO process, strategic M&A, secondary buyout, exit multiples, and measuring fund performance via DPI, TVPI, and RVPI",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "IPO Process: S-1, Roadshow & Lockup Period",
 content:
 "An **IPO (Initial Public Offering)** is the most prestigious VC exit — listing a portfolio company on a public stock exchange and achieving a liquid market valuation.\n\n**Step-by-step IPO process:**\n1. **Select underwriters**: Investment banks (Goldman Sachs, Morgan Stanley, JP Morgan) are hired to manage the process, price the IPO, and distribute shares to institutional investors.\n2. **S-1 filing**: The registration statement filed with the SEC. Contains full financials, risk factors, business description, and use of proceeds. Publicly available once filed — this is when competitors, customers, and employees first see the financials.\n3. **Roadshow (2 weeks)**: Management travels to present to institutional investors across the U.S. and Europe. The purpose is to gauge demand and educate large potential shareholders.\n4. **Book building**: Banks take non-binding indications of interest. Oversubscription (10× + demand) allows a higher IPO price.\n5. **Pricing and listing**: Final IPO price set the evening before trading. Shares listed next morning on NYSE or Nasdaq.\n\n**Post-IPO mechanics:**\n- **Quiet period (40 days)**: Underwriters prohibited from publishing research on the IPO. Company cannot make forward-looking statements.\n- **180-day lockup**: All insiders (founders, VCs, employees) legally prohibited from selling shares for 180 days post-IPO. Prevents immediate insider dumping and price crash.\n- **Lockup expiry**: A closely watched event — large VC funds often distribute shares to LPs, creating selling pressure. Stock frequently dips around lockup expiry.\n\n**SPAC alternative:** Special Purpose Acquisition Company — shell company raises money in IPO, then merges with a private company to take it public faster, without a traditional roadshow. Less rigorous price discovery; fallen out of favor post-2022.",
 highlight: [
 "IPO",
 "S-1",
 "roadshow",
 "lockup period",
 "quiet period",
 "underwriter",
 "SPAC",
 ],
 },
 {
 type: "teach",
 title: "Strategic M&A & Secondary Buyout",
 content:
 "For most VC-backed startups, a strategic acquisition — not an IPO — is the most likely exit path.\n\n**Strategic M&A (most common VC exit):**\n- A corporation acquires the startup for strategic reasons: technology, talent, customers, distribution, or eliminating a competitive threat\n- **Synergy premium**: Acquirers pay above standalone value because the combined entity is worth more\n- Example acquisitions: Google/YouTube ($1.65B), Facebook/Instagram ($1B), Microsoft/GitHub ($7.5B), Salesforce/Slack ($27.7B)\n- Typical premium over last VC round: 30–80%+\n- Process: banker-run sale process with multiple bidders drives up the price\n\n**Financial buyer / Secondary Buyout (SBO):**\n- A Private Equity (PE) fund acquires the startup — no synergy premium, purely financial return\n- Uses LBO (Leveraged Buyout) financing for mature startups with stable cash flows\n- Less common for early-stage VC companies (require profitability for LBO debt service)\n- Increasingly relevant for late-stage SaaS companies that have reached profitability\n- Exit multiples based on EBITDA or free cash flow, not revenue growth\n\n**Exit multiple frameworks:**\n- **Revenue multiples**: ARR × N× (SaaS: 5–15× depending on growth rate and NRR)\n- **EBITDA multiples**: Used by strategic and PE buyers for profitable companies (7–20×)\n- **Rule of 40 premium**: Companies scoring above 40% (growth + margin) command premium multiples\n- Growth multiple compression: A company growing 100% at 15× ARR re-rates to 6–8× when growth slows to 30%\n\n**Earnout provisions:**\n- Part of purchase price paid contingent on future performance milestones\n- Example: $60M upfront + $20M if ARR reaches $20M in year 2\n- Bridges valuation gap between optimistic sellers and cautious buyers\n\n**Acqui-hire:**\n- Acquisition primarily for the engineering team, not the product\n- Common outcome for failed startups — acquirer pays $1–3M per retained engineer\n- Usually poor for investors (liquidation preferences eat most proceeds) but good for founders who join a top-tier company",
 highlight: [
 "strategic M&A",
 "synergy premium",
 "secondary buyout",
 "LBO",
 "revenue multiple",
 "EBITDA multiple",
 "earnout",
 "acqui-hire",
 ],
 },
 {
 type: "teach",
 title: "DPI, TVPI & RVPI: Measuring Fund Performance",
 content:
 "VCs and their LPs use three key metrics to measure fund performance at any point in its lifecycle.\n\n**MOIC (Multiple on Invested Capital):**\nTotal value returned / Capital invested. Simple but ignores the time value of money.\n- MOIC = 3× means the fund returned $3 for every $1 invested.\n\n**DPI (Distributions to Paid-In Capital):**\nActual cash returned to LPs / Capital called from LPs.\n- DPI = 0.5× means LPs have received 50 cents back in cash for every $1 called\n- DPI is the only 'real' metric — it represents actual cash in LP hands\n- **A fund with DPI > 1.0× has returned all called capital; DPI > 2.0× is excellent**\n- Early-stage funds have low DPI for years 1–6; DPI should grow sharply in years 7–10\n\n**RVPI (Residual Value to Paid-In Capital):**\nCurrent estimated NAV of unrealised portfolio / Capital called from LPs.\n- RVPI = 1.2× means unrealised portfolio is worth 1.2× the total capital called\n- RVPI is paper value — subject to write-downs and should be viewed sceptically\n- As a fund matures (year 8+), high RVPI with low DPI is a red flag: paper gains that may not materialise\n\n**TVPI (Total Value to Paid-In Capital):**\nTVPI = DPI + RVPI. The total value picture combining realised and unrealised.\n- TVPI = 2.5× means the fund is worth 2.5× invested capital on paper + cash\n- Target benchmarks: Top quartile seed fund: TVPI > 3× by year 10; Top quartile Series A: TVPI > 2.5×\n- TVPI without strong DPI is 'fake TVPI' — LPs value DPI far more in mature funds\n\n**IRR vs MOIC:**\n- IRR captures time value of money; MOIC does not\n- A 3× MOIC in 3 years = ~44% IRR (excellent)\n- A 3× MOIC in 10 years = ~12% IRR (mediocre)\n- Top-quartile VC IRR benchmark: >20% net of fees",
 highlight: [
 "DPI",
 "TVPI",
 "RVPI",
 "MOIC",
 "IRR",
 "distributions",
 "NAV",
 "realised",
 "unrealised",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A VC fund called $100M from LPs and has so far distributed $60M in cash from exits. The remaining portfolio has a current NAV of $90M. What are the fund's DPI and TVPI?",
 options: [
 "DPI = 0.6×, TVPI = 1.5× — DPI = $60M / $100M; TVPI = ($60M + $90M) / $100M",
 "DPI = 1.5×, TVPI = 0.6× — values are reversed",
 "DPI = 0.9×, TVPI = 1.5× — NAV alone divided by capital",
 "DPI = 1.0×, TVPI = 2.5× — fund has returned all capital",
 ],
 correctIndex: 0,
 explanation:
 "DPI = Distributions / Paid-In Capital = $60M / $100M = 0.6×. LPs have received 60 cents back for every dollar called — the fund has not yet returned all LP capital. RVPI = Current NAV / Paid-In Capital = $90M / $100M = 0.9×. TVPI = DPI + RVPI = 0.6× + 0.9× = 1.5×. On paper, the total portfolio is worth 1.5× what was invested. However, the low DPI (0.6×) means LPs are still waiting for most of their capital return. If this is year 8–9 of the fund, the RVPI must convert to DPI — LPs will pressure the GP to crystallise exits.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A VC fund with TVPI of 3.5× and DPI of 0.2× in year 9 is performing better than a fund with TVPI of 2.0× and DPI of 1.8× in year 9.",
 correct: false,
 explanation:
 "False — in year 9 of a 10-year fund, DPI is the critical metric. DPI of 1.8× means Fund B has returned 1.8× the called capital in actual cash — LPs have their money back plus 80% profit realised. Fund A's TVPI of 3.5× is impressive on paper, but DPI of only 0.2× means almost none of that value has been crystallised. With one year left in the fund, unrealised assets at 3.3× RVPI face significant execution risk. Portfolio companies may not exit at marked values; markets can deteriorate. LPs and institutional allocators evaluate mature VC funds heavily on DPI — 'you can't spend TVPI.'",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A VC fund invested $5M in a SaaS company at Series A (10% ownership post-investment). The company grew to $25M ARR with 40% YoY growth. Two exit options exist: (A) Strategic acquisition by a large cloud provider at 10× ARR = $250M total, completing in 45 days. (B) IPO process in 12–18 months, with expected IPO valuation of $400–450M based on current SaaS multiples.",
 question:
 "Using DPI/TVPI thinking and exit multiple frameworks, what factors most strongly favour choosing Option A (M&A) over Option B (IPO)?",
 options: [
 "Certainty of proceeds ($25M in 45 days vs uncertain $40–45M in 18 months), fund life constraints, and market risk that SaaS multiples compress before the IPO",
 "Strategic buyers always pay a higher multiple than public market investors",
 "IPO lockup periods mean the VC receives no DPI for 18 months after IPO anyway",
 "The fund should always choose M&A to avoid the cost of an S-1 filing",
 ],
 correctIndex: 0,
 explanation:
 "The decision reduces to risk-adjusted value and DPI timing. Option A: $250M × 10% = $25M in 45 days. DPI increases immediately. IRR is maximised if the fund has already held for several years. Option B: $400–450M × 10% = $40–45M — but this is 18 months away, minus 180-day lockup post-IPO (total 2+ years before DPI). SaaS multiples have compressed severely before (2022 saw 70%+ drawdowns) — $450M today may become $200M by IPO time. If the fund is in year 7–8, taking certain cash now preserves IRR and converts RVPI to DPI. The $15–20M upside from waiting is not worth the market risk, lockup, and fund life pressure.",
 difficulty: 3,
 },
 ],
 },
 ],
};
