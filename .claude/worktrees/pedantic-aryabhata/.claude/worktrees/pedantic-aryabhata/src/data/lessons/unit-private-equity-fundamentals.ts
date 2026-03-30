import { Unit } from "./types";

export const UNIT_PRIVATE_EQUITY_FUNDAMENTALS: Unit = {
 id: "private-equity-fundamentals",
 title: "Private Equity Fundamentals",
 description:
 "Master PE fund structure, LBO mechanics, return measurement, and deal sourcing with hands-on value creation frameworks",
 icon: "Building2",
 color: "#1D4ED8",
 lessons: [
 // Lesson 1: PE Fund Structure 
 {
 id: "private-equity-fundamentals-1",
 title: "PE Fund Structure",
 description:
 "LP/GP roles, management fees, carried interest, hurdle rates, fund lifecycle, co-investment rights, and waterfall distributions",
 icon: "Building2",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "LP/GP Structure & Economics",
 content:
 "Private equity funds are organized as **limited partnerships** with two classes of partners:\n\n**Limited Partners (LPs)** — the capital providers:\n- Pension funds, sovereign wealth funds, endowments, insurance companies, family offices, and high-net-worth individuals\n- Commit capital to the fund but take no active management role\n- Liability is limited to the amount invested\n- Examples: CalPERS ($500B+ AUM), the Yale Endowment, Abu Dhabi Investment Authority\n\n**General Partner (GP)** — the fund manager:\n- The PE firm itself (e.g., Blackstone, KKR, Carlyle, Apollo)\n- Makes all investment decisions, manages portfolio companies, handles exits\n- Typically contributes **1–3% of fund size** as a GP commitment (skin in the game)\n- Earns two revenue streams:\n\n**Management fee**: Typically **2% per year on committed capital** during the investment period, then steps down to 2% on invested (net) capital during the harvest period. A $1B fund generates $20M/year in management fees — enough to cover salaries and overhead.\n\n**Carried interest (carry)**: **20% of profits above the hurdle rate**. This is the GP's primary economic incentive and wealth-creation mechanism. On a $1B fund returning $2B, the carry pool is 20% × $1B profit = **$200M** split among the GP's investment professionals.",
 highlight: [
 "limited partners",
 "general partner",
 "management fee",
 "carried interest",
 "GP commitment",
 "hurdle rate",
 ],
 },
 {
 type: "teach",
 title: "Hurdle Rate, Catch-Up & Waterfall Distributions",
 content:
 "The distribution waterfall determines how fund proceeds are split between LPs and the GP:\n\n**Preferred return / hurdle rate**: LPs must receive a **minimum return (typically 8% per year)** before the GP receives any carry. This protects LPs from paying performance fees on mediocre returns.\n\n**Catch-up provision**: After LPs receive their preferred return, the GP receives 100% of additional distributions (the 'catch-up') until the GP has received 20% of total profits to date. Then the standard 80/20 split applies.\n\n**Example with $100M fund, 8% hurdle, 20% carry**:\n1. Return of capital: LPs get $100M back first\n2. Preferred return: LPs get 8%/year on invested capital (~$8M/year)\n3. GP catch-up: GP receives 100% until GP has earned 20% of total profits\n4. Residual split: 80% to LPs, 20% to GP\n\n**European waterfall** (deal-by-deal with clawback):\n- Also called the 'whole fund' or 'European' model\n- GP only receives carry after LPs have received all capital back plus preferred return on the **entire fund**\n- More LP-friendly; standard in Europe and increasingly in the US\n\n**American waterfall** (deal-by-deal):\n- GP receives carry on each profitable deal as it exits, even if later deals lose money\n- GP must return excess carry if aggregate fund returns fall below the hurdle (clawback provision)\n- More GP-friendly; creates cash flow mismatches\n\n**Most Favored Nation (MFN) clause**: Large LPs negotiate that if any other LP receives better fee terms, they automatically receive the same terms.",
 highlight: [
 "preferred return",
 "hurdle rate",
 "catch-up provision",
 "European waterfall",
 "American waterfall",
 "clawback",
 "MFN clause",
 ],
 },
 {
 type: "teach",
 title: "Fund Lifecycle, Co-Investment & LPAC",
 content:
 "**PE fund lifecycle — typically 10 years**:\n\n**Fundraising (Year 0–1)**: GP markets the fund to LPs, collects capital commitments. LPs commit but do not wire cash immediately — they issue a legal pledge to fund capital calls.\n\n**Investment period (Years 1–5)**: GP identifies, underwrites, and acquires portfolio companies. LPs respond to **capital calls** (draw-downs) as investments are made. Typically 15–25 portfolio companies.\n\n**Holding/value creation (Years 3–7)**: GP works with management teams to improve operations, grow revenues, and enhance margins. The 100-day plan is executed post-acquisition.\n\n**Harvest/exit period (Years 5–10)**: GP exits investments via IPO, strategic sale, or secondary buyout. Proceeds are distributed to LPs. Fund term can be extended by 1–2 years with LP consent.\n\n**Co-investment rights**:\n- Large LPs often negotiate the right to invest directly alongside the fund in specific deals\n- **Benefits**: Lower or zero fees on co-invested capital (fee-free carry-free)\n- **Risks**: Adverse selection — GPs may offer co-invest on larger or harder-to-fill deals\n- Co-investments have historically outperformed fund-level returns on a net basis\n\n**LPAC (Limited Partner Advisory Committee)**:\n- Composed of 5–10 large LPs who represent all investors\n- Reviews and approves conflicts of interest, fee waivers, valuation disputes, and fund extensions\n- Does NOT make investment decisions — that remains solely with the GP\n\n**Fund-of-funds**: An investment vehicle that invests in multiple PE funds rather than directly in companies. Adds a second layer of fees (typically 1% management + 10% carry on top of underlying fund fees) but provides diversification and access for smaller investors.",
 highlight: [
 "capital calls",
 "investment period",
 "harvest period",
 "co-investment rights",
 "LPAC",
 "fund-of-funds",
 "advisory committee",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A PE fund has committed capital of $500M with a 2% annual management fee and 20% carried interest above an 8% hurdle rate. The fund returns $950M in total proceeds after 5 years. Approximately how much does the GP earn in total carry?",
 options: [
 "$50M — 20% of profits above the hurdle after returning capital and preferred return",
 "$90M — 20% of all gains above the initial $500M committed capital",
 "$190M — 20% of total fund proceeds",
 "$30M — 20% applied only to the excess above the 8% annual return",
 ],
 correctIndex: 0,
 explanation:
 "The waterfall calculation: (1) Return capital: LPs receive $500M back. Remaining: $450M. (2) Preferred return at 8%/yr for 5 years on $500M $200M (simplified). Remaining after preferred return: $450M $200M = $250M. (3) GP catch-up to 20% of total profits: Total profits = $450M. GP's 20% share = $90M. LPs already received $200M in preferred return. GP catch-up: 100% of next distributions until GP has $90M. After catch-up, remaining distributions split 80/20. In practice the exact amount depends on the waterfall timing, but carry is only earned on profits *above* the hurdle return — not all gains above committed capital.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Under a European (whole-fund) waterfall structure, the GP can receive carried interest on profitable exits even if the overall fund has not yet returned all LP capital plus the preferred return.",
 correct: false,
 explanation:
 "False. Under a European (whole-fund) waterfall, the GP only begins receiving carried interest after LPs have received back ALL committed capital plus the preferred return (hurdle) on the ENTIRE fund — not just on individual deals. This is the LP-friendly structure because even if some deals are profitable, the GP cannot collect carry until the fund as a whole clears the hurdle. The American (deal-by-deal) waterfall, by contrast, allows the GP to collect carry on each profitable exit, potentially before the overall fund returns are above the hurdle — creating misaligned incentives and requiring clawback provisions.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: LBO Mechanics 
 {
 id: "private-equity-fundamentals-2",
 title: "LBO Mechanics",
 description:
 "Capital structure, value creation triangle, EBITDA bridge, leverage metrics, PIK debt, and sponsor economics",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "LBO Capital Structure & Value Creation Triangle",
 content:
 "A **Leveraged Buyout (LBO)** is the acquisition of a company using a significant amount of borrowed money, with the acquired company's assets and cash flows used as collateral.\n\n**Typical LBO capital structure**:\n- **Senior secured debt**: 40–50% of total capital (bank loans, Term Loan A/B)\n- **Subordinated/mezzanine debt**: 15–20% (high-yield bonds, mezzanine)\n- **Equity (sponsor)**: 35–40% of total capital\n- **Total leverage**: 5–6× EBITDA at entry (debt/EBITDA)\n\n**The LBO value creation triangle** — three levers of equity return:\n\n**1. Multiple expansion**:\n- Buying at a low EBITDA multiple and exiting at a higher one\n- Example: Buy at 7× EBITDA, sell at 10× EBITDA — pure multiple expansion adds 43% to enterprise value\n- Depends on market conditions, sector re-rating, and improved business quality\n\n**2. EBITDA/earnings growth**:\n- Growing the underlying business — revenue growth, margin expansion, cost cuts\n- The most sustainable and controllable value creation lever\n- A company with $100M EBITDA growing to $150M EBITDA at the same multiple adds $350M in enterprise value at 7×\n\n**3. Debt paydown**:\n- Free cash flow pays down debt, increasing equity value dollar-for-dollar\n- At 60% debt / 40% equity entry, each $1 of debt repaid becomes $1 of equity value\n- Leverage amplifies both gains and losses — this is the core risk of LBOs",
 highlight: [
 "LBO",
 "capital structure",
 "multiple expansion",
 "EBITDA growth",
 "debt paydown",
 "value creation triangle",
 "leverage",
 ],
 },
 {
 type: "teach",
 title: "EBITDA Bridge, Leverage Metrics & Free Cash Flow",
 content:
 "**EBITDA-to-equity bridge calculation**:\nThe equity return in an LBO is driven by the change in enterprise value (entry to exit) minus the net debt repaid:\n\n**Exit equity value** = (Exit EBITDA × Exit multiple) Remaining debt\n**Entry equity invested** = (Entry EBITDA × Entry multiple) Initial debt\n\n**Example**:\n- Entry: $100M EBITDA × 8× = $800M enterprise value; $480M debt (60%), $320M equity\n- 5-year hold: EBITDA grows to $140M, debt reduced from $480M to $280M\n- Exit: $140M × 9× = $1,260M enterprise value; remaining debt $280M\n- Exit equity = $1,260M $280M = **$980M**\n- MOIC = $980M / $320M = **3.1×** | IRR **25%**\n\n**Leverage metrics — what lenders care about**:\n- **Total Debt / EBITDA**: Primary leverage metric; 5–6× at entry is typical; must de-lever below 4× within 3–4 years\n- **Interest coverage (EBITDA / Interest expense)**: Must be 2.0× to service debt comfortably\n- **Free Cash Flow conversion**: Critical — how much of EBITDA converts to cash for debt paydown?\n - FCF conversion = (EBITDA capex working capital cash taxes) / EBITDA\n - 60–80% FCF conversion is typical in attractive LBO candidates\n\n**EBITDA add-backs controversy**:\n- PE sponsors often present 'Adjusted EBITDA' with numerous add-backs (one-time costs, restructuring, stock-based comp)\n- The gap between reported and adjusted EBITDA has grown significantly — averages 20–30% in recent LBOs\n- Lenders and rating agencies increasingly scrutinize add-backs; aggressive add-backs can mask deteriorating businesses",
 highlight: [
 "EBITDA bridge",
 "MOIC",
 "IRR",
 "FCF conversion",
 "leverage ratio",
 "interest coverage",
 "EBITDA add-backs",
 ],
 },
 {
 type: "teach",
 title: "PIK Debt, Management Rollover & 100-Day Plan",
 content:
 "**PIK (Payment-in-Kind) debt**:\n- PIK interest is not paid in cash — it accretes to the principal balance instead\n- Example: $100M PIK note at 12% after year 1, balance grows to $112M; no cash outflow\n- **Why used**: Conserves cash for operations and debt paydown at the senior level; allows higher leverage\n- **Risk**: Compound interest means the balance grows exponentially; if the business struggles, PIK debt can balloon\n- PIK debt is typically subordinated (paid last); used in stressed situations or aggressive LBO structures\n- **PIK toggle**: Allows the issuer to choose each period whether to pay cash or PIK — provides flexibility\n\n**Cash pay debt vs PIK**:\n- Cash pay: Regular coupon payments; lender receives current income\n- PIK: No current income; lender is betting on the exit value; higher stated interest rate to compensate for deferred payment risk\n\n**Management rollover**:\n- Existing management team is incentivized to roll a portion of their sale proceeds back into equity of the new company (typically 5–10% of equity)\n- Aligns management with sponsor — they only get rich if the LBO succeeds\n- Rollover equity is often structured as a **sweet equity** or **management option pool** with higher upside leverage\n- Rollover managers are locked up for the holding period; creates retention incentive\n\n**100-day plan**:\n- Within 100 days of closing, the PE sponsor and management execute a rapid operational improvement plan\n- Typical initiatives: IT integration, procurement renegotiation, headcount optimization, pricing analysis, revenue growth initiatives, financial reporting systems\n- Sets the operational agenda and signals to management and employees the priorities of the new ownership\n- PE operating partners — senior former executives on the GP's staff — often lead 100-day execution",
 highlight: [
 "PIK debt",
 "payment-in-kind",
 "PIK toggle",
 "management rollover",
 "sweet equity",
 "100-day plan",
 "operating partners",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A PE firm acquires a company at 7× EBITDA with $70M EBITDA, using 60% debt and 40% equity. After 5 years, EBITDA grows to $100M, debt is reduced by $150M from $294M to $144M, and the company exits at 8× EBITDA. What is the approximate MOIC on the equity investment?",
 options: [
 "Approximately 3.3× MOIC — exit equity of $656M divided by initial equity of $196M",
 "Approximately 2.0× MOIC — the 8×/7× multiple expansion alone",
 "Approximately 1.7× MOIC — only the debt paydown is counted",
 "Approximately 4.5× MOIC — the full enterprise value gain divided by equity",
 ],
 correctIndex: 0,
 explanation:
 "Entry: $70M EBITDA × 7× = $490M enterprise value. Debt = 60% × $490M = $294M. Equity = 40% × $490M = $196M. Exit: $100M EBITDA × 8× = $800M enterprise value. Remaining debt = $294M $150M = $144M. Exit equity = $800M $144M = $656M. MOIC = $656M / $196M 3.35×. This illustrates the LBO value creation triangle at work: EBITDA growth ($70M $100M adds $100M×8 = $800M exit EV vs $490M entry), multiple expansion (7× to 8×), AND debt paydown ($150M reduction) all contribute to the ~3.3× equity return.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "PIK (Payment-in-Kind) debt is more favorable for a PE-backed company's near-term cash flow than cash-pay debt because PIK interest does not require current cash outflows, though the principal balance grows over time.",
 correct: true,
 explanation:
 "True. PIK debt defers cash interest payments by accreting the interest to the principal balance rather than requiring cash payments each period. This preserves cash flow for operations, working capital, or senior debt paydown — which can be critical in highly leveraged LBOs. However, PIK debt is not free: the compounding nature means the total amount owed grows rapidly. A $100M PIK note at 12% becomes $176M after 5 years with no cash outflow, but at exit the full accreted balance must be repaid. PIK is therefore best suited for businesses with strong exit value confidence but temporarily constrained cash flows.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: PE Returns & Benchmarking 
 {
 id: "private-equity-fundamentals-3",
 title: "PE Returns & Benchmarking",
 description:
 "IRR vs MOIC, PME benchmarking, DPI/RVPI/TVPI metrics, vintage year effects, data biases, and quartile performance",
 icon: "BarChart2",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "IRR vs MOIC — Two Lenses on Return",
 content:
 "PE funds report returns using two primary metrics, each capturing different aspects of performance:\n\n**IRR (Internal Rate of Return)**:\n- The annualized return that makes the NPV of all cash flows equal to zero\n- Accounts for the **timing** of cash flows — an IRR of 25% means early distributions are worth more\n- **Horizon IRR**: IRR calculated through today (using NAV as terminal value) rather than at fund close\n- **Why IRR can be misleading**: A fund that returns 3× in year 1 shows a spectacular IRR; the same 3× in year 10 shows a much lower IRR. IRR rewards speed but doesn't tell you the absolute dollar profit.\n- IRRs are also highly sensitive to the J-curve — early capital calls with no distributions produce deeply negative initial IRRs\n\n**MOIC (Money-on-Invested-Capital)**:\n- Also called the investment multiple, equity multiple, or total value multiple\n- MOIC = Total distributions + Remaining NAV / Total capital invested\n- A 2.5× MOIC means you got $2.50 back for every $1.00 invested\n- **Why MOIC can be misleading**: A 2.5× MOIC over 10 years is far less impressive than a 2.5× MOIC over 3 years — MOIC ignores time\n\n**Using both together**:\n- Strong PE managers target **2.0–3.0× MOIC with 20–30% gross IRR** over a 4–6 year hold\n- The **Rule of Thumb**: 2× in 3 years 26% IRR; 2× in 5 years 15% IRR; 2× in 7 years 10% IRR\n- A deal showing 3× MOIC but only 10% IRR likely had a long hold or slow value creation; not necessarily superior to a 1.8× MOIC at 25% IRR",
 highlight: [
 "IRR",
 "MOIC",
 "horizon IRR",
 "J-curve",
 "money-on-invested-capital",
 "equity multiple",
 ],
 },
 {
 type: "teach",
 title: "DPI, RVPI, TVPI & PME Benchmarking",
 content:
 "**Three metrics that together describe fund return status**:\n\n**DPI (Distributions to Paid-In)**:\n- Cash actually returned to LPs / Capital called from LPs\n- DPI > 1.0× means LPs have gotten their money back; DPI > 2.0× means 2× cash returned\n- The only 'real' money — everything else is paper until distributions occur\n- A fund with DPI of 0.8× and TVPI of 2.5× has significant unrealized value but has not yet returned principal\n\n**RVPI (Residual Value to Paid-In)**:\n- Current NAV of remaining portfolio / Capital called\n- Represents the unrealized portion of the return — paper gains that must still be realized\n- High RVPI late in a fund's life is a concern — exits may not achieve modeled valuations\n\n**TVPI (Total Value to Paid-In)**:\n- TVPI = DPI + RVPI\n- The all-in return multiple including both realized and unrealized\n- What most LPs track most closely; should be cross-referenced with DPI to assess how much is realized\n\n**PME (Public Market Equivalent)**:\n- The proper way to benchmark PE returns against public markets\n- PME simulates investing each capital call into the S&P 500 and liquidating on each distribution date\n- **KS-PME > 1.0**: PE outperformed public markets on a like-for-like cash-flow basis\n- **Direct Alpha**: The IRR spread between the PE fund's actual cash flows and a public index benchmark\n- Critical insight: A PE fund with 15% IRR may underperform the S&P 500 in a roaring bull market — PME shows this honestly\n- Cambridge Associates and Burgiss are the two primary PE data providers; their benchmarks differ due to database composition",
 highlight: [
 "DPI",
 "RVPI",
 "TVPI",
 "PME",
 "public market equivalent",
 "direct alpha",
 "Cambridge Associates",
 ],
 },
 {
 type: "teach",
 title: "Vintage Year Effects, Data Biases & GP Selection",
 content:
 "**Vintage year effect**:\n- The year a PE fund was formed dramatically affects returns, independent of GP skill\n- **2009 and 2010 vintage funds** are among the best ever — buying at post-crisis lows, exiting into a decade-long bull market\n- **2006–2007 vintage funds** are among the worst — buying at peak valuations just before the financial crisis\n- Vintage year diversification (investing in PE funds every year) is critical for LPs to smooth the cycle\n\n**PE return data problems — three biases to know**:\n\n**1. Survivorship bias**: Failed funds and managers disappear from databases; only surviving (typically better-performing) funds are included in benchmarks — overstates average returns\n\n**2. Selection bias**: The best GPs are oversubscribed and can choose their LPs; smaller LPs without relationships get access only to mediocre funds — reported LP returns may not reflect what average investors achieve\n\n**3. Smoothing**: PE valuations are marked quarterly by the GP; they don't reflect daily market fluctuations artificially low volatility understates risk and overstates Sharpe ratio\n\n**GP selection — the critical variable**:\n- PE return dispersion between top and bottom quartile is massive\n- **Top quartile**: ~15% net IRR\n- **Median**: ~10% net IRR\n- **Bottom quartile**: ~5% net IRR\n- This 10-percentage-point spread between top and bottom quartile dwarfs dispersion in public equity managers (typically 1–3%)\n- GP selection skill is THE primary determinant of PE investor success\n- **Performance persistence**: Top-quartile PE managers show moderate persistence — a 2006 top-quartile fund has a ~40–50% chance of the 2010 fund also being top quartile (versus 25% random chance)",
 highlight: [
 "vintage year",
 "survivorship bias",
 "selection bias",
 "smoothing",
 "GP selection",
 "quartile performance",
 "performance persistence",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A PE fund (2010 vintage) reports a TVPI of 2.4× but a DPI of only 0.6×. An LP evaluating this fund in 2018 should be most concerned about which of the following?",
 options: [
 "The majority of reported value (1.8× RVPI) remains unrealized — paper gains that may not be achieved at exit",
 "The fund's IRR is too low because total returns of 2.4× over 8 years implies only ~11% annualized",
 "The 2010 vintage year is historically poor, suggesting the GP benefited from cheap entry prices unfairly",
 "The DPI of 0.6× means the fund has destroyed capital, as LPs have received back less than invested",
 ],
 correctIndex: 0,
 explanation:
 "TVPI = DPI + RVPI, so RVPI = 2.4× 0.6× = 1.8×. This means only 0.6× (25%) of the total reported value has been distributed as cash to LPs; the remaining 1.8× is unrealized NAV sitting in portfolio companies. The concern is that GP-marked valuations may not be achievable when companies are actually sold. Late in a fund's life, a large RVPI relative to DPI signals execution risk on exits. Option B's IRR calculation is not a concern per se — 2010 vintage 11% IRR is solid. Option C is wrong — 2010 vintage funds are among the best (bought at post-crisis lows). Option D is wrong — DPI < 1× doesn't mean capital destruction; it simply means capital hasn't been fully returned yet.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Private equity return data is generally considered more reliable and unbiased than public equity return data because PE funds are audited annually and report to institutional investors who demand accuracy.",
 correct: false,
 explanation:
 "False. PE return data suffers from several significant biases that make it less reliable than public equity data. First, survivorship bias: underperforming funds and managers that shut down disappear from databases, overstating average returns. Second, selection bias: the best-performing managers are oversubscribed and choose their LPs, so average investor returns lag reported benchmarks. Third, smoothing: GPs mark portfolio company valuations quarterly using subjective models (DCF, comparable multiples) rather than daily market prices, artificially suppressing reported volatility and overstating risk-adjusted returns. Annual audits verify accounting accuracy, not the appropriateness of the valuation methodology — a GP can legitimately hold a company at 12× EBITDA when comparable public companies trade at 8×.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Deal Sourcing & Value Creation 
 {
 id: "private-equity-fundamentals-4",
 title: "Deal Sourcing & Value Creation",
 description:
 "Sourcing channels, operational levers, ESG in PE, exit routes, and CEO turnover dynamics",
 icon: "Search",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Deal Sourcing Channels & Management Meetings",
 content:
 "Finding the right deal at the right price is the most critical determinant of PE returns — you can't create value from an overpriced entry.\n\n**Deal sourcing channels**:\n\n**1. Banker-intermediated (auction processes)**:\n- Investment banks run structured sale processes with multiple bidders\n- **Pros**: Complete information, competitive bids, clear timeline\n- **Cons**: Highly competitive highest prices; 'winner's curse' risk where the most optimistic bidder wins\n- Typically 150–300 bps higher purchase price vs proprietary deals\n\n**2. Proprietary sourcing**:\n- PE firms approach companies directly, often years before a sale is being considered\n- **CEO network**: Senior partners cultivate C-suite relationships over years\n- **Sector specialization**: Deep industry knowledge identifies attractive companies early\n- **Add-on sourcing**: Existing portfolio companies acquire smaller competitors — pre-identified targets\n- Proprietary deals typically achieve 1–2× turns lower entry multiple vs auction processes\n\n**3. Carve-outs**:\n- Acquiring a division or business unit from a large corporation\n- Often operationally complex (IT separation, shared services unwinding) but priced at a discount\n- Large corporations often under-manage non-core divisions — significant value creation opportunity\n\n**4. Take-privates**:\n- Acquiring a publicly-listed company and delisting it\n- Can capture a premium over market price while still acquiring at a discount to intrinsic value if the stock is depressed\n\n**Management meeting red flags**:\n- Revenue/EBITDA forecasts that show hockey-stick growth without clear drivers\n- High management turnover in the 2–3 years before the sale\n- Customer concentration (top customer > 20% of revenue)\n- Founder selling 100% — why is the founder exiting completely?\n- Working capital anomalies (receivables growing faster than revenue)\n- Excessive EBITDA add-backs without clear justification",
 highlight: [
 "banker-intermediated",
 "proprietary sourcing",
 "carve-out",
 "take-private",
 "management meeting",
 "add-on",
 "winner's curse",
 ],
 },
 {
 type: "teach",
 title: "Operational Value Creation Levers",
 content:
 "**The four primary PE value creation levers**:\n\n**1. Revenue growth**:\n- Pricing optimization (price elasticity analysis, value-based pricing)\n- Geographic expansion (enter new markets, international rollout)\n- Product/service extensions (adjacent offerings to existing customers)\n- Sales force effectiveness (sales process redesign, CRM implementation, quota-based incentives)\n- M&A / bolt-on acquisitions to add revenue scale\n\n**2. Margin expansion**:\n- Procurement optimization (consolidate vendor base, leverage scale for better pricing)\n- Operational efficiency (lean manufacturing, process automation, shared services centralization)\n- Headcount rationalization (eliminate redundant roles post-acquisition)\n- Pricing: even a 1% price increase falls directly to EBITDA with no incremental cost\n\n**3. Multiple arbitrage**:\n- Systematically acquiring smaller companies ('bolt-ons') at lower multiples (5–7×) and benefiting from the larger platform's higher multiple (9–12×) at exit\n- Example: Platform company valued at 10× EBITDA acquires a $10M EBITDA add-on at 6× ($60M). At exit, the combined EBITDA of $10M is valued at 10× = $100M immediate $40M value creation\n\n**4. PE Operating Partners**:\n- Former CEOs, COOs, or functional executives embedded at the GP level\n- Work directly with portfolio company management on transformation initiatives\n- Provide credibility with management teams and operational expertise that pure financial engineers lack\n- Increasingly standard at large PE firms; a key competitive differentiator\n\n**Technology transformation in PE**:\n- ERP implementations (Salesforce, SAP/Oracle) to modernize back-office\n- E-commerce buildouts for traditional businesses\n- Digital marketing capability building\n- Data analytics for pricing, inventory, and customer retention\n- Cybersecurity upgrades (required by insurance and increasingly by buyers at exit)",
 highlight: [
 "revenue growth",
 "margin expansion",
 "multiple arbitrage",
 "bolt-on acquisitions",
 "operating partners",
 "pricing optimization",
 "technology transformation",
 ],
 },
 {
 type: "teach",
 title: "ESG in PE, Exit Routes & CEO Turnover",
 content:
 "**ESG value creation in private equity**:\n- ESG is increasingly a value creation driver, not just a compliance checkbox, as public market buyers and strategic acquirers apply ESG-linked valuation multiples\n- **Carbon footprint reduction**: Energy efficiency investments often have 2–3 year payback periods and reduce operating costs while improving exit multiple with ESG-focused buyers\n- **Supply chain ESG audit**: Identifying and eliminating supply chain risks (child labor, environmental violations) that could cause reputational damage or regulatory action\n- **ESRS (European Sustainability Reporting Standards)**: EU portfolio companies now face mandatory ESG disclosures — PE firms must help portcos comply\n- Impact PE funds target measurable social/environmental outcomes alongside financial returns\n\n**PE exit routes**:\n\n**1. Strategic sale (M&A)**: Sold to a larger company (corporate acquirer) in the same or adjacent industry\n- Typically achieves the highest price due to synergies (cost + revenue)\n- Fastest to close; certain cash consideration\n\n**2. Secondary buyout (SBO)**: Sold to another PE fund\n- Increasingly common as the PE industry has grown\n- Can be criticized as 'passing the parcel' — the same company sold between PE firms\n- Often used when strategic buyers are unavailable or IPO market is closed\n\n**3. IPO**: Listing on a public stock exchange\n- Typically achieves highest valuation in strong bull markets\n- PE firm typically retains a stake for 6–18 months post-IPO (lock-up period)\n- More complex, slower, and subject to market conditions\n\n**CEO turnover dynamics**:\n- Research consistently shows that PE-backed companies replace the CEO in **70%+ of cases within the first 2 years** of PE ownership\n- Reasons: PE firms have high performance expectations, different skill sets needed for PE-owned vs founder/family-owned environments, and new ownership often brings a new strategic direction\n- Replacement CEOs are often recruited from the PE firm's network of former executives\n- Remaining CEOs are given clear milestones tied to equity value creation",
 highlight: [
 "ESG value creation",
 "strategic sale",
 "secondary buyout",
 "IPO",
 "CEO turnover",
 "exit routes",
 "lock-up period",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A PE firm's platform company has $50M EBITDA and is valued at 10× ($500M enterprise value). The firm acquires a bolt-on company for $42M (at 6× its $7M EBITDA). Assuming the bolt-on EBITDA fully integrates and the combined platform is still valued at 10× EBITDA, what is the immediate enterprise value created by multiple arbitrage?",
 options: [
 "$28M — the $70M added to enterprise value from the bolt-on's EBITDA at 10× minus the $42M acquisition cost",
 "$8M — the difference between the 10× platform multiple and the 6× acquisition multiple on the bolt-on's EBITDA",
 "$70M — the full 10× value of the bolt-on's EBITDA after integration",
 "$42M — equal to the acquisition price because value is preserved, not created",
 ],
 correctIndex: 0,
 explanation:
 "Multiple arbitrage mechanics: The bolt-on has $7M EBITDA. PE firm buys it at 6× = $42M. After integration, the combined platform is valued at 10× EBITDA. The $7M of bolt-on EBITDA is now worth 10× × $7M = $70M at the platform's exit multiple. Value created = $70M (exit value of bolt-on EBITDA) $42M (purchase price) = $28M. This is the essence of roll-up / consolidation strategies: systematically buying smaller companies at below-platform multiples and 'rerating' them at the larger platform's superior multiple. The value creation is essentially arbitraging the valuation gap between small and large companies in the same sector.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A PE firm is evaluating two acquisition targets. Target A is a banker-run auction with a well-prepared information memorandum, 8 competing bidders, and a proposed price of 11× EBITDA. Target B is a proprietary outreach opportunity — a founder-owned business that has never run a sale process, with a proposed price of 7.5× EBITDA. Both companies have similar EBITDA, growth profiles, and market positions. The PE firm's historical exit multiple is 9×.",
 question:
 "Which target has a structurally superior return profile and why?",
 options: [
 "Target B — the 7.5× entry vs a 9× historical exit creates a 1.5× turn of multiple expansion at entry, while Target A at 11× would require the PE firm to exit at above-market multiples just to break even",
 "Target A — the banker process provides better due diligence information and competitive tension validates the valuation",
 "Target A — having 8 bidders confirms the company's quality and reduces the risk of buying a value trap",
 "Target B — only because it is cheaper; lower price always means better returns regardless of quality",
 ],
 correctIndex: 0,
 explanation:
 "Return math is stark: Target A at 11× entry vs Target B at 7.5× entry creates a massive structural headwind/tailwind. If the PE firm's historical exit is 9×, Target A buyer needs to achieve above-entry multiples (11× higher) to generate any multiple expansion — effectively betting on a rising market or significant business improvement. Target B at 7.5× entry vs 9× exit delivers 1.5 turns of automatic multiple expansion even with no market improvement. This illustrates the cardinal PE principle: entry price is the single most controllable determinant of return. Proprietary deal sourcing that bypasses competitive auctions is therefore a core competitive advantage. Option D is a half-truth — lower price doesn't mean better returns if quality is lower, but here both targets are described as similar quality.",
 difficulty: 2,
 },
 ],
 },
 ],
};
