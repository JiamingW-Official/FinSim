import type { Unit } from "./types";

export const UNIT_INTEREST_RATE_RISK: Unit = {
 id: "interest-rate-risk",
 title: "Interest Rate Risk Management",
 description:
 "Master yield curve dynamics, duration hedging, Fed policy, rate derivatives, bank ALM, and credit spread risk",
 icon: "",
 color: "#0ea5e9",
 lessons: [
 // Lesson 1: Yield Curve Basics 
 {
 id: "irr-1",
 title: "Yield Curve Basics",
 description:
 "Curve shapes (normal/flat/inverted), term structure theories, and curve trade strategies",
 icon: "TrendingDown",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Yield Curve Shapes & What They Signal",
 content:
 "The **yield curve** plots yields of bonds with identical credit quality (typically US Treasuries) across different maturities — typically from 3-month T-bills to 30-year bonds.\n\n**Three principal shapes:**\n\n**Normal (upward-sloping):** Short rates < Long rates. Investors demand a **term premium** for lending money longer. Historically, this shape dominates. It signals a healthy economy with expected growth and moderate inflation.\n- Example: 2Y yield = 4.0%, 10Y yield = 4.6%, 30Y yield = 4.9%\n- Spread: 10Y 2Y = +60bps (positive)\n\n**Flat:** Short rates Long rates. Signals investor uncertainty about the economic outlook — the market expects rates to neither rise nor fall significantly. Often a **transition state** between normal and inverted.\n- Example: 2Y = 4.8%, 10Y = 4.9%, 30Y = 5.0%\n\n**Inverted:** Short rates > Long rates. A rare but powerful signal — historically one of the most reliable **recession indicators**. The 2Y/10Y spread turning negative has preceded every US recession since 1955 with a lag of 12–24 months.\n- Example: 2Y = 5.1%, 10Y = 4.7% Spread = 40bps\n- Mechanism: Fed has tightened short rates aggressively; bond market expects eventual rate cuts as growth slows.\n\n**Key spreads to monitor:**\n- **2Y/10Y** — most cited recession signal\n- **3M/10Y** — Fed research shows this is the best near-term predictor\n- **2Y/5Y/10Y butterfly** — curvature of the mid-section",
 highlight: ["yield curve", "normal", "inverted", "flat", "term premium", "recession indicator", "2Y/10Y"],
 },
 {
 type: "teach",
 title: "Term Structure Theories",
 content:
 "Three competing theories explain why yield curves slope the way they do:\n\n**1. Pure Expectations Theory**\nLong-term rates are simply the geometric average of expected future short-term rates — no risk premium exists. If the market expects the Fed to cut rates, long yields should be lower than current short yields (causing inversion).\n\n`(1 + y)¹ = (1 + y)(1 + f,)(1 + f,)...(1 + f,)`\n\nwhere f_n,1 = the 1-year forward rate n years from now.\n\n**Implication:** A steep normal curve implies the market expects rising short rates.\n\n**2. Liquidity Preference Theory (Keynes)**\nInvestors prefer short-term instruments (less price risk, more liquidity). To attract buyers into long maturities, issuers must pay a **liquidity premium** — an extra yield beyond pure rate expectations.\n\n`Long yield = Expected future short rates + Liquidity premium`\n\nThis premium is typically 25–100bps and increases with maturity. Explains why curves are normally upward-sloping even when rates are expected to be flat.\n\n**3. Market Segmentation Theory**\nDifferent investor classes have **preferred habitats** at different maturities:\n- Insurance companies 20–30Y bonds (to match long-duration liabilities)\n- Banks 1–5Y bonds (deposit-funded)\n- Money market funds sub-1Y paper\n\nSupply and demand within each segment independently sets rates. If pension funds have heavy demand for 30Y bonds but limited supply, 30Y yields get compressed regardless of short-rate expectations.\n\n**Modern consensus:** A blend of Expectations + Liquidity Premium theory (Modigliani-Sutch preferred habitat model) best explains observed yield curves.",
 highlight: ["expectations theory", "liquidity preference", "market segmentation", "term premium", "forward rate", "preferred habitat"],
 },
 {
 type: "teach",
 title: "Yield Curve Trades",
 content:
 "Portfolio managers actively trade yield curve moves using **relative value** positions:\n\n**Curve Steepener Trade**\nBet that the yield spread between long and short maturities will widen (long end rises relative to short end).\n- Structure: Short 2Y Treasuries + Long 10Y Treasuries (DV01-neutral)\n- Profits when: Economy strengthens, inflation picks up, or Fed signals rate hikes ahead.\n- Risk: Curve flattens or inverts instead.\n\n**Curve Flattener Trade**\nBet that the spread will narrow (short rates rise relative to long rates, or long rates fall).\n- Structure: Long 2Y Treasuries + Short 10Y Treasuries (DV01-neutral)\n- Profits when: Fed tightens aggressively, or recession fears compress long yields.\n- This was a highly profitable trade in 2022 as the Fed hiked rates 425bps.\n\n**Butterfly Trade**\nBet on the curvature of the curve using three maturity points.\n- **Long butterfly** (bet on humped curve): Long 5Y, short 2Y and 10Y with DV01 balance\n- **Short butterfly**: Short 5Y, long 2Y and 10Y\n\n**DV01-Neutral Construction:**\nAll curve trades must be duration-neutralized:\n`Ratio = DV01_long_leg / DV01_short_leg`\n\nExample: To build a 2s10s steepener:\n- 2Y DV01 = $180/contract, 10Y DV01 = $800/contract\n- Ratio = 800/180 = 4.4 Sell 4.4 2Y contracts per 1 long 10Y contract",
 highlight: ["steepener", "flattener", "butterfly trade", "DV01-neutral", "relative value", "curve trade"],
 },
 {
 type: "quiz-mc",
 question:
 "The 3-month T-bill yields 5.3% and the 10-year Treasury yields 4.6%. Which theory best explains this inverted curve, and what signal does it send?",
 options: [
 "Expectations theory: bond market expects the Fed to cut short rates as growth slows; historically signals recession within 12–24 months",
 "Market segmentation theory: pension funds are buying 10Y bonds, compressing yields regardless of rate expectations",
 "Liquidity preference theory: investors demand higher yields on short bonds because they are less liquid than long bonds",
 "Pure math: inversion is always caused by the coupon rate being higher on short bonds than on long bonds",
 ],
 correctIndex: 0,
 explanation:
 "An inverted 3M/10Y curve — where long-term yields are below short-term yields — is most powerfully explained by the expectations theory: the bond market is pricing in eventual Fed rate cuts as the economy slows (or contracts). Historically, an inverted 3M/10Y spread has been the Fed's own preferred recession indicator, preceding recessions with high reliability. Liquidity preference theory would predict a normal (upward-sloping) curve, not inversion. Market segmentation can cause local distortions but rarely explains broad inversion.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A fixed income manager believes the Federal Reserve is about to begin an aggressive rate-hiking cycle, which will push 2-year yields up sharply while 10-year yields rise less (due to slower expected long-run growth). The 2Y/10Y spread is currently +30bps.",
 question:
 "Which trade best expresses this view, and how should it be structured?",
 options: [
 "Flattener: Long 2Y Treasuries (DV01-sized) + Short 10Y Treasuries — profits as 2Y rises more than 10Y, compressing the spread",
 "Steepener: Short 2Y Treasuries + Long 10Y Treasuries — profits as the spread widens from +30bps to +80bps",
 "Butterfly: Long 5Y, short 2Y and 10Y — profits from curvature changes unrelated to slope",
 "Long the whole curve: buy both 2Y and 10Y Treasuries and hold to maturity",
 ],
 correctIndex: 0,
 explanation:
 "If the Fed hikes aggressively, 2Y yields will rise sharply (short end is most sensitive to Fed funds rate) while 10Y yields rise less (long end anchored by growth and inflation expectations). This compresses or inverts the 2s10s spread. A flattener trade profits: go long 2Y (or short 2Y futures) and short 10Y (or long 10Y futures), DV01-neutralized. The spread narrowing from +30bps toward 0 or negative generates P&L. This was the classic 2022 trade.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Duration Risk 
 {
 id: "irr-2",
 title: "Duration Risk",
 description:
 "DV01, dollar duration, key rate duration, duration matching, and immunization strategies",
 icon: "Scale",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "DV01 & Dollar Duration",
 content:
 "**DV01** (Dollar Value of a Basis Point, also called PVBP — Price Value of a Basis Point) is the most practical measure of interest rate risk for traders and portfolio managers.\n\n**Formula:**\n`DV01 = Market Value × Modified Duration × 0.0001`\n\nDV01 = dollar P&L change for a **1 basis point (0.01%) parallel shift** in yields.\n\n**Example:**\n- Portfolio market value: $50,000,000\n- Weighted average modified duration: 6.2\n- DV01 = $50M × 6.2 × 0.0001 = **$31,000**\n- Every 1bp rise in rates lose $31,000; every 1bp fall gain $31,000\n\n**Dollar Duration:**\nFor large yield moves, Dollar Duration scales DV01 to the full move:\n`Dollar Duration = DV01 × (Δy in bps)`\n\nFor a 100bp rate rise: Dollar Duration loss = $31,000 × 100 = **$3,100,000**\n\n**Practical risk management:**\n- Set **DV01 limits** by desk, portfolio, and firm\n- A fund with $1B AUM might limit DV01 to $500,000 (50bp risk tolerance)\n- **Relative DV01**: express as basis points of return per $100 face, standardizing across bond sizes\n\n**Yield level effect:** DV01 is not constant — as yields fall, duration rises (PV of distant flows increases), so DV01 increases too. This creates convexity risk.",
 highlight: ["DV01", "PVBP", "dollar duration", "basis point", "modified duration", "DV01 limits"],
 },
 {
 type: "teach",
 title: "Key Rate Duration (KRD)",
 content:
 "**Key Rate Duration** (also called partial duration) measures price sensitivity to a yield change at a **specific maturity point** on the curve, holding all other rates constant.\n\nWhy this matters: a parallel shift assumption (all yields move equally) is unrealistic. Real yield curves twist, steepen, flatten, and butterfly. KRD decomposes duration risk by maturity bucket.\n\n**Standard KRD maturities:** 3M, 6M, 1Y, 2Y, 3Y, 5Y, 7Y, 10Y, 20Y, 30Y\n\n**Example — Corporate Bond Portfolio:**\n| Maturity | KRD | Implication |\n|----------|-----|-------------|\n| 2Y | 0.8 | Low sensitivity to 2Y yield moves |\n| 5Y | 2.1 | Moderate 5Y exposure |\n| 10Y | 3.4 | Largest single exposure |\n| 30Y | 1.2 | Modest long-end risk |\n| **Total** | **7.5** | = Effective modified duration |\n\n**Sum of all KRDs = Modified Duration** (the parallel-shift measure)\n\n**Applications:**\n- **Curve risk decomposition**: identify that most risk is in the 10Y sector, not the 2Y sector\n- **Hedge construction**: use specific maturity futures (2Y, 5Y, 10Y contracts) to hedge individual KRDs\n- **Liability matching**: pension funds match KRDs of assets to liabilities at each maturity bucket — far more precise than matching total duration alone\n- **Regulatory**: Basel III requires banks to report KRD-based sensitivity metrics (IRRBB framework)",
 highlight: ["key rate duration", "partial duration", "KRD", "curve twist", "liability matching", "maturity bucket", "IRRBB"],
 },
 {
 type: "teach",
 title: "Duration Matching & Immunization",
 content:
 "**Immunization** is a bond portfolio strategy that protects against interest rate changes by **matching the duration of assets to the duration of liabilities**.\n\n**Classic single-period immunization:**\nA pension fund owes $10M in 8 years. To immunize:\n1. Set portfolio duration = 8 years (match the liability horizon)\n2. Portfolio will be protected against small parallel yield curve shifts\n3. Mechanism: If rates rise, bond prices fall, but reinvestment income increases — these effects offset exactly at the target horizon\n\n**Three conditions for immunization:**\n1. Asset duration = Liability duration\n2. Asset PV Liability PV (sufficient funding)\n3. Portfolio convexity Liability convexity (ensures protection against non-parallel shifts)\n\n**Multi-liability immunization (cash flow matching):**\nFor multiple liability streams (e.g., a defined benefit plan paying annual pensions), use **cash flow matching**: hold bonds whose coupon/principal cash flows exactly replicate liability payments. More conservative than duration matching, requires no rebalancing.\n\n**Contingent Immunization:**\nA hybrid active/passive strategy: actively manage the portfolio until the surplus (asset value PV of liabilities) erodes to a trigger level, then switch to full immunization.\n- Start: Portfolio = $105M, Liability PV = $100M $5M surplus\n- Trigger: If surplus falls to $0, immunize immediately\n- Allows active management as long as cushion exists\n\n**Rebalancing requirement:** Duration drifts over time as rates change and bonds mature. Must rebalance periodically to maintain the duration match.",
 highlight: ["immunization", "duration matching", "cash flow matching", "contingent immunization", "liability", "rebalancing", "pension"],
 },
 {
 type: "quiz-mc",
 question:
 "A bond portfolio has a market value of $25,000,000 and a weighted average modified duration of 8.5. What is the DV01, and how much does the portfolio lose if yields rise 75 basis points?",
 options: [
 "DV01 = $21,250; 75bp loss = $1,593,750",
 "DV01 = $2,125; 75bp loss = $159,375",
 "DV01 = $212,500; 75bp loss = $15,937,500",
 "DV01 = $21,250; 75bp loss = $212,500",
 ],
 correctIndex: 0,
 explanation:
 "DV01 = $25,000,000 × 8.5 × 0.0001 = $21,250. For a 75bp rise in yields: dollar loss = $21,250 × 75 = $1,593,750 (approximately 6.375% of portfolio value). This also equals the duration approximation: ΔP/P D_mod × Δy = 8.5 × 0.0075 = 6.375%. DV01 is simply the rate of dollar change scaled to 1bp; multiplying by the total basis point move gives the full estimated P&L.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Matching the total modified duration of a bond portfolio to its liability duration fully immunizes against any interest rate change, including non-parallel yield curve twists.",
 correct: false,
 explanation:
 "False. Matching total modified duration only immunizes against small, parallel yield curve shifts. Non-parallel moves — steepening, flattening, butterfly twists — can create residual risk even when total duration matches. Key rate duration (KRD) matching at multiple maturity points is required for robust immunization against curve twists. Additionally, the convexity condition (asset convexity liability convexity) must hold for protection against larger yield moves.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Fed Policy & Markets 
 {
 id: "irr-3",
 title: "Fed Policy & Markets",
 description:
 "FOMC dot plot interpretation, fed funds futures pricing, and how markets react to rate changes",
 icon: "Landmark",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "FOMC Mechanics & the Dot Plot",
 content:
 "The **Federal Open Market Committee (FOMC)** sets the federal funds target rate — the overnight rate at which banks lend reserves to each other. This rate anchors the short end of the yield curve and influences all borrowing costs in the economy.\n\n**FOMC Meeting Schedule:**\n- 8 meetings per year (roughly every 6 weeks)\n- Statement + press conference; quarterly: **Summary of Economic Projections (SEP)**\n\n**The Dot Plot (SEP Projection)**\nEach of the 19 FOMC participants (12 voting, 7 non-voting) submits their anonymous projection for where the fed funds rate should be at year-end for the next 3 years and in the long run. The resulting scatter plot — called the **dot plot** — shows the distribution of views.\n\n**How to read the dot plot:**\n- **Median dot**: the market-consensus Fed projection\n- **Dispersion**: wide spread of dots = significant disagreement among Fed officials = higher uncertainty\n- **Hawkish shift**: dots move up vs. previous meeting market sells bonds (yields rise)\n- **Dovish shift**: dots move down market buys bonds (yields fall)\n\n**Terminal rate**: The highest projected rate in the current hiking cycle. When dots cluster around a level for the next 1–2 years, that signals the expected terminal rate.\n\n**Key Fed communication channels:**\n- **Jackson Hole speech** (August): major annual policy signal\n- **Fed Chair press conference**: most market-moving event after meetings\n- **Fed minutes** (released 3 weeks after meeting): granular deliberation details\n- **Fed speeches**: regional presidents often signal upcoming pivots",
 highlight: ["FOMC", "dot plot", "federal funds rate", "SEP", "terminal rate", "hawkish", "dovish", "Jackson Hole"],
 },
 {
 type: "teach",
 title: "Fed Funds Futures: Pricing Rate Expectations",
 content:
 "**Fed funds futures** are exchange-traded contracts (CME) that allow markets to price and hedge the expected fed funds rate at a specific future date.\n\n**Pricing Formula:**\n`Implied Rate = 100 Futures Price`\n\nExample: June fed funds futures trade at 94.75 Implied rate = **5.25%**\n\n**Probability Extraction:**\nWhen the Fed hikes in 25bp increments, the market-implied probability of a hike can be extracted:\n\n`P(hike) = (Futures-implied rate Current rate) / 0.25`\n\nExample:\n- Current rate: 5.25%\n- Next meeting futures imply: 5.37%\n- P(25bp hike) = (5.37 5.25) / 0.25 = **48%**\n\n**SOFR futures** (replacing Eurodollar contracts after LIBOR transition) provide a continuous strip of rate expectations out 5+ years. The **SOFR curve** effectively maps out the entire expected Fed rate path.\n\n**Market reaction asymmetry:**\n- **Hawkish surprise** (rate higher than expected): short end sells off sharply; curve flattens if long end doesn't move as much\n- **Dovish surprise** (rate lower, or pause signaled): short end rallies; curve steepens\n- **In-line decision**: minimal bond market reaction — all information already priced\n\n**Key dates for futures traders:**\n- CPI release (monthly): most market-moving data print; shifts rate hike probabilities\n- NFP (jobs report, first Friday of month): labor market dictates Fed patience\n- Core PCE: the Fed's preferred inflation gauge",
 highlight: ["fed funds futures", "SOFR futures", "implied rate", "probability extraction", "hawkish surprise", "dovish surprise", "CPI", "NFP"],
 },
 {
 type: "quiz-mc",
 question:
 "The January fed funds futures contract is trading at 94.50. The current fed funds rate is 5.25%. What is the implied rate, and what does the contract suggest about Fed policy expectations for January?",
 options: [
 "Implied rate = 5.50%; the market expects one 25bp rate hike by January",
 "Implied rate = 5.50%; the market expects a 50bp rate cut by January",
 "Implied rate = 5.50%; but the price alone cannot tell us if rates will rise or fall",
 "Implied rate = 94.50%; futures contracts don't directly imply a rate level",
 ],
 correctIndex: 0,
 explanation:
 "Implied rate = 100 94.50 = 5.50%. Since the current rate is 5.25%, the futures market is pricing in a 25bp rate hike (5.25% 5.50%) by the January meeting. If rates were expected to stay flat, the futures would trade near 94.75 (100 5.25). The premium in the futures price (94.50 vs. 94.75) reflects the market's expectation of a 25bp hike. You can compute the probability more precisely: (5.50 5.25)/0.25 = 100% — full pricing of one hike.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "The FOMC raises rates 25bps as expected (fed funds: 5.00% 5.25%), but Fed Chair Powell's press conference language shifts from 'ongoing increases will be appropriate' to 'some additional firming may be appropriate' — a more cautious tone. Bond market reaction is immediate.",
 question:
 "What is the likely market reaction and why?",
 options: [
 "2Y yields fall and 10Y yields fall less (curve steepens): dovish language surprise causes rally in rate-sensitive short end even though the hike itself was priced in",
 "Both 2Y and 10Y yields rise sharply: any rate hike is always bearish regardless of accompanying language",
 "No reaction: the 25bp hike was fully priced so the futures market already absorbed all information",
 "Curve flattens: 10Y sells off more because long-duration bonds are more sensitive to language changes",
 ],
 correctIndex: 0,
 explanation:
 "Markets price in not just the current hike but the entire expected path of future hikes. The language shift from 'ongoing increases' to 'some additional firming' is a meaningful dovish signal — it implies the hiking cycle is nearing its end. The 2Y Treasury (most sensitive to near-term rate expectations) rallies sharply as markets reprice fewer future hikes. The 10Y moves less because its yield reflects long-term neutral rate expectations. The result is a bear-flattener reversal — a steepening move — driven by short-end rally despite the hike itself being in-line.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Hedging Rate Risk 
 {
 id: "irr-4",
 title: "Hedging Interest Rate Risk",
 description:
 "Interest rate swaps, Treasury futures, Eurodollar/SOFR futures, swaptions, and caps/floors",
 icon: "Shield",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Interest Rate Swaps",
 content:
 "An **interest rate swap** is an OTC derivative where two counterparties exchange cash flows: one pays a **fixed rate**, the other pays a **floating rate** (typically SOFR), on a notional principal amount.\n\n**Standard plain-vanilla swap:**\n- **Fixed payer** (short the bond market): pays fixed, receives SOFR. Gains if rates rise (floating receipts increase).\n- **Fixed receiver** (long the bond market): receives fixed, pays SOFR. Gains if rates fall (fixed income exceeds floating payments).\n\n**Example:**\n- Notional: $100M, 5-year swap\n- Fixed rate: 4.20%, Floating: 3M SOFR (currently 5.30%)\n- Payments are netted quarterly\n- Current quarterly net: SOFR payer receives (5.30% 4.20%) × $100M × 90/360 = **$275,000** per quarter\n\n**DV01 of a swap:**\n`Swap DV01 Notional × (Fixed leg duration Floating leg duration) × 0.0001`\n\nFor a 5-year swap: floating leg duration 0.25 years (resets quarterly), fixed leg duration 4.5 years.\n`DV01 $100M × (4.5 0.25) × 0.0001 = $42,500`\n\n**Swap spread:** The fixed rate on a par swap minus the equivalent Treasury yield.\n- Positive spread: swap rates > Treasuries (normal; reflects credit/liquidity premium)\n- Negative spread (as seen in USD swaps post-2015): caused by supply/demand imbalances from bank balance sheet constraints\n\n**Key uses:**\n- Corporations: receive fixed to convert floating-rate debt to synthetic fixed\n- Banks: pay fixed to convert long fixed-rate assets (mortgages) to synthetic floating\n- Portfolio managers: quickly adjust duration without trading bonds (unfunded duration overlay)",
 highlight: ["interest rate swap", "fixed payer", "fixed receiver", "SOFR", "notional", "swap spread", "DV01", "duration overlay"],
 },
 {
 type: "teach",
 title: "Treasury Futures & SOFR Futures",
 content:
 "**Treasury futures** are the most liquid interest rate instruments in the world, traded on the CME Group.\n\n**Standard contracts:**\n| Contract | Underlying | DV01/contract |\n|----------|------------|---------------|\n| 2-Year Treasury Note | ~2Y T-Note | ~$40 |\n| 5-Year Treasury Note | ~5Y T-Note | ~$45 |\n| 10-Year Treasury Note | ~10Y T-Note | ~$65 |\n| Ultra 10-Year | 10Y+ T-Note | ~$80 |\n| Treasury Bond | ~20Y T-Bond | ~$130 |\n| Ultra Bond | 25Y+ T-Bond | ~$185 |\n\n**Cheapest-to-Deliver (CTD):**\nEach futures contract has a basket of deliverable Treasury bonds. The seller chooses which bond to deliver — they select the **cheapest-to-deliver** (CTD), the bond that maximizes their profit after adjusting for the conversion factor.\n\n`Invoice Price = Futures Price × Conversion Factor + Accrued Interest`\n\n**Duration hedging with futures:**\n`Number of contracts = Portfolio DV01 / Futures DV01 per contract`\n\nTo hedge $50M portfolio with DV01 = $40,000 using 10Y futures (DV01 = $65):\nContracts = $40,000 / $65 = **615 short contracts**\n\n**SOFR Futures (replaced Eurodollar futures in 2023):**\n- 3-month SOFR futures: price = 100 implied quarterly SOFR rate\n- 1-year strip of 4 contracts maps out the rate path for 1 year\n- Widely used to hedge short-term rate exposure and extract Fed meeting probabilities",
 highlight: ["Treasury futures", "cheapest-to-deliver", "CTD", "conversion factor", "SOFR futures", "DV01", "duration hedge"],
 },
 {
 type: "teach",
 title: "Swaptions, Caps & Floors",
 content:
 "When protection is needed against rates moving beyond a threshold — but the hedge buyer wants to keep upside — **options on rates** are the tool.\n\n**Swaptions:**\nAn option to enter a swap at a predetermined fixed rate (the swaption strike).\n- **Payer swaption**: right to **pay fixed** on a swap — profits if rates rise above the strike. Used to hedge against rising rates on floating-rate liabilities.\n- **Receiver swaption**: right to **receive fixed** — profits if rates fall below the strike. Used to protect floating-rate assets.\n\n**Example (payer swaption):**\nA corporation has $500M floating-rate debt. Buys a 1-year payer swaption (strike = 5.0%, 5-year swap). Cost: 1.5% of notional = $7.5M premium.\n- If rates rise to 6.5%: swaption is exercised, company now pays 5.0% (saves 1.5% × $500M = $7.5M/yr on net)\n- If rates fall to 4.0%: swaption expires worthless; company benefits from lower floating rates\n\n**Caps and Floors:**\nA series of European call (cap) or put (floor) options on a floating rate index.\n- **Cap**: buyer receives max(SOFR Strike, 0) at each reset date. Caps the maximum interest cost on floating-rate debt.\n- **Floor**: buyer receives max(Strike SOFR, 0). Establishes a minimum yield on floating-rate assets.\n- **Collar**: buy a cap + sell a floor. Limits rate between floor and cap. Reduces premium cost vs. cap alone.\n\n**Caplet/Floorlet:** Each individual payment period's option within a cap/floor strip.\n\n**Pricing uses Black's model** (a variant of Black-Scholes adapted for forward rates), requiring the forward rate and implied volatility for each caplet.",
 highlight: ["swaption", "payer swaption", "receiver swaption", "cap", "floor", "collar", "caplet", "Black's model", "implied volatility"],
 },
 {
 type: "quiz-mc",
 question:
 "A pension fund holds $200M of long-duration fixed-rate bonds (modified duration = 14, DV01 = $280,000). The fund manager wants to reduce duration exposure by 50% using 10-year Treasury futures (DV01 per contract = $65). How many contracts must be shorted?",
 options: [
 "2,154 contracts short (DV01 to eliminate = $140,000; $140,000 / $65 2,154)",
 "4,308 contracts short (full DV01 hedge: $280,000 / $65 4,308)",
 "280 contracts short ($280,000 / $1,000 per contract)",
 "65 contracts short (one contract per $1,000 of DV01)",
 ],
 correctIndex: 0,
 explanation:
 "Target: reduce DV01 by 50% eliminate $280,000 × 50% = $140,000 of DV01. Contracts needed = $140,000 / $65 = 2,154 short contracts. A full hedge (zero duration) would require 4,308 contracts, but the fund only wants to halve its exposure. Shorting Treasury futures adds negative DV01 to the portfolio, offsetting the long duration in the bond holdings. The fund retains $140,000 of DV01 (equivalent to $200M × 7.0 modified duration) after the partial hedge.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A corporation with floating-rate debt that wants to eliminate upside rate risk (but keep the benefit if rates fall) should buy a payer swaption rather than entering a fixed-payer swap.",
 correct: true,
 explanation:
 "True. A fixed-payer swap converts all floating-rate debt to synthetic fixed — the corporation benefits if rates fall but loses that benefit (pays fixed regardless). A payer swaption gives the right but not the obligation to pay fixed: the corporation exercises only if rates rise above the swaption strike, retaining the benefit of lower rates if they fall. The trade-off is the upfront premium. This is the classic asymmetric hedging principle: swaps lock in a rate; swaptions (and caps) provide a ceiling while preserving the floor.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Bank Asset-Liability Management 
 {
 id: "irr-5",
 title: "Bank ALM",
 description:
 "Asset-liability management, NII sensitivity, EVE, GAP analysis, and repricing risk",
 icon: "Building2",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "ALM Framework: NII vs. EVE",
 content:
 "**Asset-Liability Management (ALM)** is the discipline of managing a bank's balance sheet to control interest rate risk — specifically the risk that changes in rates erode **net interest income (NII)** or reduce the bank's **economic value**.\n\nBanks are inherently exposed to interest rate risk because:\n- **Liabilities** (deposits, wholesale funding): typically shorter-duration, repricing quickly\n- **Assets** (mortgages, commercial loans, securities): typically longer-duration, repricing slowly\n- This **maturity mismatch** is the core source of interest rate risk\n\n**Two risk perspectives:**\n\n**1. NII Sensitivity (Earnings perspective):**\nMeasures the impact of rate changes on **net interest income over the next 12 months**.\n`NII = Interest Income Interest Expense`\n\n- When rates rise: floating-rate assets reprice up (income ), but deposits also reprice up (expense ). The net effect depends on the relative repricing speeds.\n- Most retail banks have **asset-sensitive** balance sheets: assets reprice faster NII benefits from rising rates.\n- NII is the short-horizon measure: management's primary tool for quarterly earnings guidance.\n\n**2. EVE (Economic Value of Equity):**\nMeasures the **present value of all future cash flows** from assets minus liabilities — the bank's theoretical liquidation value.\n`EVE = PV(Assets) PV(Liabilities)`\n\n- EVE sensitivity = change in EVE for a given rate shock (e.g., +200bp, 200bp)\n- A bank that is asset-sensitive on NII can be **liability-sensitive on EVE** (long-duration assets lose more value than short-duration liabilities gain)\n- **Basel IRRBB standards**: banks must report EVE sensitivity under 6 standard rate shock scenarios (+100, +200, +300, 100, 200bp parallel shocks + steepener/flattener)\n\n**Key tension:** Banks often face a tradeoff — strategies that improve NII sensitivity may worsen EVE sensitivity and vice versa.",
 highlight: ["ALM", "NII sensitivity", "EVE", "asset-sensitive", "liability-sensitive", "maturity mismatch", "IRRBB", "Basel"],
 },
 {
 type: "teach",
 title: "GAP Analysis & Repricing Risk",
 content:
 "**GAP analysis** identifies the difference between rate-sensitive assets (RSA) and rate-sensitive liabilities (RSL) that reprice within a given time bucket.\n\n**Repricing GAP Formula:**\n`GAP = RSA RSL`\n\n**Positive GAP (Asset-sensitive):** More assets than liabilities reprice in the period.\n- Rising rates NII improves (assets earn more, faster)\n- Falling rates NII deteriorates\n\n**Negative GAP (Liability-sensitive):** More liabilities than assets reprice.\n- Rising rates NII deteriorates (pay more on deposits before receiving more on assets)\n- Falling rates NII improves\n\n**Example: Community Bank ($1B assets)**\n| Time Bucket | RSA ($M) | RSL ($M) | GAP ($M) | Cumulative GAP |\n|-------------|----------|----------|----------|----------------|\n| 0–30 days | 120 | 200 | 80 | 80 |\n| 31–90 days | 180 | 150 | +30 | 50 |\n| 91–180 days | 250 | 100 | +150 | +100 |\n| 181–365 days | 200 | 80 | +120 | +220 |\n\n**NII Impact:**\n`ΔNII GAP × Δr × Time period`\n\nFor the 0–30 day bucket with $80M GAP and +100bp rate rise:\n`ΔNII = $80M × 0.01 × (30/360) = $66,667` (annualized: $800,000)\n\n**Limitations of GAP:**\n- Assumes all items in a bucket reprice at bucket midpoint (lumpy)\n- Ignores non-linear repricing (deposit beta — actual rate pass-through is less than 100%)\n- Misses embedded options (prepayments on mortgages, withdrawal options on deposits)\n- Superseded in practice by full simulation models, but still used for regulatory reporting",
 highlight: ["GAP analysis", "repricing risk", "RSA", "RSL", "asset-sensitive", "liability-sensitive", "deposit beta", "NII impact"],
 },
 {
 type: "quiz-mc",
 question:
 "A bank has $500M of rate-sensitive assets and $700M of rate-sensitive liabilities repricing within 90 days. If interest rates rise 50bps, what is the approximate annual NII impact?",
 options: [
 "$1,000,000 (GAP = $200M; annual NII impact = $200M × 0.005 = $1,000,000)",
 "+$1,000,000 (GAP is positive because assets earn more when rates rise)",
 "$3,500,000 (total liabilities × 0.005 = the full cost increase)",
 "Zero — NII is unaffected because both assets and liabilities reprice simultaneously",
 ],
 correctIndex: 0,
 explanation:
 "GAP = RSA RSL = $500M $700M = $200M (liability-sensitive). Annualized NII impact = GAP × Δr = $200M × 0.005 = $1,000,000. The bank has more liabilities repricing than assets, so rising rates hurt NII: interest expense rises faster than interest income. This is the classic community bank problem — heavily funded by rate-sensitive deposits (CDs, money market accounts) with slower-repricing loan assets.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Silicon Valley Bank (SVB) held $91B in long-duration fixed-rate securities (avg duration ~5.6 years) funded primarily by short-duration deposits. When the Fed raised rates 425bps in 2022–2023, SVB's unrealized losses on its securities portfolio reached $15B — exceeding its equity. Depositors withdrew funds, forcing asset sales at losses.",
 question:
 "Which ALM risk metric would have most clearly flagged SVB's vulnerability ahead of the crisis?",
 options: [
 "EVE sensitivity: the large negative EVE impact of +400bp shock would have shown equity was impaired well before the bank run",
 "NII sensitivity: SVB was asset-sensitive (earned more on securities than it paid on deposits), so NII looked healthy",
 "GAP analysis: the 0–30 day GAP was positive, showing short-term resilience",
 "Loan-to-deposit ratio: SVB had low LDR because it held securities instead of loans",
 ],
 correctIndex: 0,
 explanation:
 "SVB's fatal risk was EVE sensitivity: the economic value of its long-duration securities portfolio collapsed as rates rose (duration 5.6 years; DV01 loss on $91B $51M per 1bp = $21.7B on 425bp hike). EVE analysis would have shown that under a +300–400bp shock, the PV of assets fell far more than the PV of short-duration deposits, destroying equity on an economic basis. NII actually looked fine short-term (assets earned more as the Fed hiked). This is the classic NII vs. EVE tension — a bank can appear earnings-healthy while being economically insolvent. IRRBB regulations exist precisely to force disclosure of EVE sensitivity.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 6: Credit Spread Risk 
 {
 id: "irr-6",
 title: "Credit Spread Risk",
 description:
 "OAS, spread duration, credit vs. rate risk separation, and IG vs. HY rate sensitivity",
 icon: "CreditCard",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Option-Adjusted Spread (OAS)",
 content:
 "**Credit spread** is the yield premium a corporate bond pays over a risk-free Treasury of the same maturity — compensation for default risk, liquidity risk, and credit uncertainty.\n\n**Simple Yield Spread:**\n`Credit Spread = Corporate YTM Treasury YTM`\n\nExample: 5-year Apple bond yields 5.10%; 5-year Treasury yields 4.60% Spread = **50bps**\n\n**Problem:** Many bonds contain embedded options (callable corporates, MBS with prepayment). These options distort the simple yield spread — the optionality is baked into the yield but doesn't represent pure credit risk.\n\n**Option-Adjusted Spread (OAS):**\nOAS removes the value of embedded options to isolate the pure credit/liquidity component:\n`OAS = Z-spread Option Value (in bps)`\n\nFor a callable bond:\n- Z-spread (static spread): 120bps\n- Option value: 25bps (call option benefits the issuer)\n- OAS = 120 25 = **95bps**\n\n**Interpreting OAS:**\n- OAS is the spread earned over Treasuries after stripping out optionality — it measures pure compensation for credit and liquidity risk\n- Higher OAS cheaper bond relative to its credit quality (potentially attractive)\n- OAS < historical average expensive (tight spreads)\n- **Negative OAS** can occur in agency MBS (Fannie/Freddie bonds): implies investors pay a premium for the government backstop, accepting less return than Treasuries on a risk-adjusted basis\n\n**Spread measures hierarchy:**\n1. **Nominal spread**: simple yield difference (most basic)\n2. **Z-spread** (zero-volatility spread): parallel shift to entire spot curve that sets PV = price\n3. **OAS**: Z-spread minus option value (most rigorous)",
 highlight: ["OAS", "option-adjusted spread", "Z-spread", "credit spread", "nominal spread", "embedded option", "callable bond", "MBS"],
 },
 {
 type: "teach",
 title: "Spread Duration & Credit vs. Rate Risk Separation",
 content:
 "**Spread Duration** measures a bond's price sensitivity to changes in its credit spread, holding the Treasury curve constant.\n\n`ΔP/P Spread Duration × Δspread`\n\nFor option-free bonds: **Spread Duration Modified Duration**\n\n**Example:**\n- 10-year investment-grade bond, modified duration = 7.5\n- Credit spread widens 50bps (from 100 150bps)\n- Price impact: 7.5 × 0.005 = **3.75%**\n\n**Rate risk vs. Spread risk decomposition:**\nA corporate bond's total yield = Treasury yield + Credit spread\n`Total DV01 = Rate DV01 + Spread DV01`\n\nFor a $10M position in a 10-year IG bond (D_mod = 7.5, spread = 100bps):\n- Rate DV01 $10M × 7.5 × 0.0001 = **$7,500** per 1bp Treasury move\n- Spread DV01 $10M × 7.5 × 0.0001 = **$7,500** per 1bp spread move\n\nThe two risks are uncorrelated — you can hedge one without affecting the other:\n- **Hedge rate risk**: short Treasury futures (removes DV01 from rate moves)\n- **Hedge spread risk**: short CDS protection (removes spread duration)\n- **Credit-rate decorrelation trade**: hedge out Treasury duration, retain spread exposure only\n\n**IG vs. HY Rate Sensitivity:**\n- **Investment-grade (IG, BBB and above)**: high grade bonds trade **yield-based** — more correlated with Treasuries. Spread duration matters, but rate duration dominates. Duration can be 7–12 years.\n- **High-yield (HY, BB and below)**: junk bonds trade more **price/equity-like**. Short duration (3–5 years typical), high spread (300–600bps+). Correlation with equities is higher; Treasury rate changes matter far less than credit spreads and equity market moves.\n\n**Rule of thumb:** When rates rise 100bps, an IG 10Y bond may lose 7–8%. A comparable HY bond may lose only 3–4% from rates but could lose 10–15% if rising rates are accompanied by recession fears (spread widening).",
 highlight: ["spread duration", "rate DV01", "spread DV01", "credit spread", "investment grade", "high yield", "CDS", "credit-rate decorrelation"],
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio manager holds $20M face value of a 7-year BB-rated high yield bond (modified duration = 5.2, current OAS = 450bps). The Treasury curve shifts +75bps AND credit spreads widen 100bps simultaneously (risk-off environment). What is the approximate total price impact?",
 options: [
 "Rate impact: 3.90%; Spread impact: 5.20%; Total: 9.10%",
 "Rate impact: 3.90% only; spread changes are not captured by duration for high yield bonds",
 "Rate impact: 7.50%; Spread impact: 7.50%; Total: 15.00% because duration is 7.5 for all 7-year bonds",
 "Total: 5.20% because only spread duration matters for high-yield bonds",
 ],
 correctIndex: 0,
 explanation:
 "Rate DV01 impact: D_mod × Δr = 5.2 × 0.0075 = 3.90%. Spread duration impact ( mod duration for option-free bonds): 5.2 × 0.010 = 5.20%. Total: 9.10%. This scenario — rising Treasuries plus credit spread widening — is the 'double whammy' in risk-off environments (flight to quality). Treasuries rally (lower yields) while HY bonds sell off as investors flee to safety, widening spreads sharply. HY bonds can lose 10–15%+ in such episodes. Note the modified duration of 5.2, not 7.5 — HY bonds have shorter durations by design.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A portfolio manager can hedge a corporate bond's Treasury rate risk by shorting Treasury futures, and independently hedge its credit spread risk by buying CDS protection — these two hedges can be executed simultaneously without interfering with each other.",
 correct: true,
 explanation:
 "True. The total yield on a corporate bond is decomposed as: Treasury yield + credit spread. These are conceptually orthogonal risks. Shorting Treasury futures hedges the rate component (the bond's sensitivity to moves in the risk-free curve), while buying CDS protection hedges the spread component (sensitivity to credit spread widening). After both hedges, the position is approximately 'flat' to both rate and spread moves. In practice, basis risk exists (the specific bond's spread may not perfectly match CDS reference obligations, and futures CTD dynamics introduce slight imprecision), but the fundamental decomposition is valid and widely used in credit portfolio management.",
 difficulty: 2,
 },
 ],
 },
 ],
};
