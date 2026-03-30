import type { Unit } from "./types";

export const UNIT_SOVEREIGN_DEBT: Unit = {
 id: "sovereign-debt",
 title: "Sovereign Debt & Government Finance",
 description:
 "Understand government bond markets, debt sustainability, sovereign defaults, fiscal policy, and central bank interactions",
 icon: "Landmark",
 color: "#f43f5e",
 lessons: [
 // Lesson 1: Government Bond Markets 
 {
 id: "sd-1",
 title: "Government Bond Markets",
 description:
 "Treasury auctions, benchmark bonds, TIPS, I-Bonds, and international government securities",
 icon: "Building",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Primary Market: Treasury Auctions",
 content:
 "Governments finance spending by issuing bonds in the **primary market** through auctions, then those bonds trade in the **secondary market** between investors.\n\n**Treasury Auction Process:**\nThe U.S. Treasury holds regular auctions for Bills (4, 8, 13, 26, 52-week), Notes (2, 3, 5, 7, 10-year), and Bonds (20, 30-year).\n\n**Competitive bids:** Large dealers (primary dealers) specify a yield and quantity they are willing to accept. Only bids at or below the stop-out rate (clearing yield) are filled.\n\n**Non-competitive bids:** Retail investors and small institutions submit a quantity without a yield — they accept whatever yield the auction clears at. Non-competitive bids are filled in full before competitive bids.\n\n**Stop-out rate (clearing rate):** The highest yield accepted in the auction. All competitive winners receive the same stop-out rate regardless of the yield they bid (uniform-price / Dutch auction format since 1998).\n\n**Bid-to-cover ratio:** Total bids received ÷ bonds offered. A ratio above 2.0x signals healthy demand; below 2.0x suggests weak appetite.\n- Example: $100B offered, $280B in bids bid-to-cover = 2.8x (strong demand)\n\n**Award tail:** Difference between the highest accepted yield (stop-out) and the when-issued yield. A long tail indicates weak demand — dealers required a yield concession.",
 highlight: ["competitive bids", "non-competitive bids", "stop-out rate", "bid-to-cover ratio", "award tail", "primary market", "secondary market"],
 },
 {
 type: "teach",
 title: "On-the-Run vs Off-the-Run & Benchmark Bonds",
 content:
 "**On-the-run Treasuries** are the most recently issued bonds for each maturity (e.g., the latest 10-year note). They are the market **benchmark** — most actively traded and used for pricing spreads on corporate bonds.\n\n**Off-the-run Treasuries** are older issues of the same maturity that have been superseded. The 10-year benchmark rolls every 6 months when a new 10-year is auctioned.\n\n**Liquidity premium:**\nOn-the-run bonds trade at slightly lower yields (higher prices) than equivalent off-the-run bonds — investors pay a **liquidity premium** for the ease of transacting in the benchmark. This spread is typically 2–5bps but can widen during market stress when liquidity matters most.\n\n**Hedge funds** and relative-value traders exploit this spread: short the expensive on-the-run, long the cheap off-the-run — a classic **convergence trade** (sometimes called Treasury basis trading).\n\n**STRIPS (Separately Traded Registered Interest and Principal Securities):**\nThe Treasury allows dealers to strip coupon bonds into individual zero-coupon components. Each coupon payment and the principal repayment become separate zero-coupon bonds. STRIPS reveal the **zero-coupon yield curve** (spot rates) embedded in coupon bonds and are used to value fixed income instruments more precisely.",
 highlight: ["on-the-run", "off-the-run", "benchmark", "liquidity premium", "convergence trade", "STRIPS", "zero-coupon"],
 },
 {
 type: "teach",
 title: "TIPS, I-Bonds & Inflation-Linked Securities",
 content:
 "**Treasury Inflation-Protected Securities (TIPS)** provide a guaranteed **real** (inflation-adjusted) return. They protect investors from unexpected inflation.\n\n**How TIPS work:**\n- The **principal** is adjusted daily for CPI. If CPI rises 3%, the principal scales up by 3%.\n- Coupons are paid on the **adjusted principal**, so coupon dollar payments also rise with inflation.\n- At maturity, investors receive the greater of the adjusted principal or the original face value (deflation floor).\n- TIPS yield is the **real yield** — a positive real yield means the bond outpaces inflation.\n\n**Break-even inflation rate:**\n`Break-even = Nominal Treasury yield TIPS real yield`\nIf the 10-year Treasury yields 4.5% and the 10-year TIPS yields 2.0%, the break-even is 2.5% — the inflation rate at which TIPS and nominal Treasuries deliver equal returns.\n\n**I-Bonds (Series I Savings Bonds):**\n- Retail product sold directly by the Treasury at TreasuryDirect.gov.\n- Rate resets every 6 months: fixed rate (set at issuance) + inflation adjustment (CPI-U).\n- Annual purchase limit: $10,000 electronic per person.\n- No secondary market — must hold 1 year; 3-month interest penalty if redeemed within 5 years.\n- Popular with retail investors as an inflation hedge with zero credit risk.\n\n**International equivalents:**\n- **Gilts** (UK): conventional and index-linked (linked to RPI)\n- **Bunds** (Germany): Eurozone benchmark; negative yields common in low-rate era\n- **JGBs** (Japan Bank of Japan controls yield via YCC)\n- **OATs** (France): Obligations Assimilables du Trésor",
 highlight: ["TIPS", "real yield", "break-even inflation", "I-Bonds", "Gilts", "Bunds", "JGBs", "OATs", "inflation-linked"],
 },
 {
 type: "quiz-mc",
 question:
 "A U.S. Treasury auction for 10-year notes receives $280B in total bids for $100B offered. The bid-to-cover ratio is 2.8x. What does this indicate?",
 options: [
 "Strong demand — investors competed heavily for the bonds, likely clearing near or below the when-issued yield",
 "Weak demand — a ratio above 2.0x means bids were excessive and the Treasury overpaid in yield",
 "Neutral demand — bid-to-cover is only meaningful for short-term bills, not notes",
 "The auction failed — the Treasury should have issued more bonds to absorb the excess demand",
 ],
 correctIndex: 0,
 explanation:
 "A bid-to-cover ratio of 2.8x means demand was 2.8 times supply — a healthy signal. Strong auctions see less yield concession (short tail), indicating buyers are comfortable with the prevailing yield level. Ratios below 2.0x suggest weak appetite and often result in a long award tail where the stop-out yield is meaningfully above the when-issued market yield.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "On-the-run Treasury bonds typically yield slightly less than off-the-run bonds of similar maturity because investors pay a liquidity premium for the benchmark issue.",
 correct: true,
 explanation:
 "True. On-the-run bonds are the most recently auctioned and most actively traded, giving them superior liquidity. Investors accept lower yields (pay higher prices) for this convenience — the liquidity premium. Off-the-run bonds are economically identical in credit quality but trade less frequently, so they offer slightly higher yields as compensation for lower liquidity.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An investor holds a 10-year TIPS bond with a real yield of 1.5%. The current 10-year nominal Treasury yields 4.0%. Over the next year, actual CPI inflation is 3.5%.",
 question:
 "What is the break-even inflation rate, and did the TIPS outperform the nominal Treasury over the year?",
 options: [
 "Break-even = 2.5%; TIPS outperformed — actual inflation (3.5%) exceeded the break-even (2.5%)",
 "Break-even = 2.5%; nominal Treasury outperformed — the 4.0% yield beats TIPS in all scenarios",
 "Break-even = 5.5%; TIPS underperformed because real yields are always lower than nominal yields",
 "Break-even = 1.5%; TIPS always outperform nominal bonds regardless of inflation",
 ],
 correctIndex: 0,
 explanation:
 "Break-even inflation = 4.0% 1.5% = 2.5%. TIPS deliver the same total return as the nominal Treasury only if actual inflation equals 2.5%. Since actual inflation was 3.5% (above break-even), the TIPS principal was adjusted up by more than priced in — TIPS outperformed the nominal bond on a total return basis.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Fiscal Policy & Deficits 
 {
 id: "sd-2",
 title: "Fiscal Policy & Deficits",
 description:
 "Fiscal multiplier, automatic stabilizers, Ricardian equivalence, debt/GDP dynamics, and sustainability conditions",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Fiscal Policy Tools & Automatic Stabilizers",
 content:
 "**Fiscal policy** is the government's use of **spending (G)** and **taxation (T)** to influence economic activity — the other lever alongside monetary policy.\n\n**Expansionary fiscal policy:** Increase G or cut T boost aggregate demand, higher GDP, higher employment.\n**Contractionary fiscal policy:** Cut G or raise T reduce demand, cool inflation, lower deficits.\n\n**Automatic stabilizers** are built-in fiscal mechanisms that cushion the economy without requiring legislative action:\n\n- **Unemployment insurance:** When the economy slows and job losses rise, UI payments automatically increase, putting money in consumers' pockets and preventing demand from collapsing further.\n- **Progressive income taxes:** When incomes fall in a recession, tax liabilities fall proportionally more than incomes — effective tax rates drop automatically, partially offsetting the income decline.\n- **Corporate taxes and means-tested benefits** also work automatically in the same direction.\n\n**Why automatic stabilizers matter:**\n- They reduce the amplitude of business cycles without the long political lags of discretionary policy.\n- Economists estimate automatic stabilizers offset roughly 20–30% of GDP shocks in the U.S.\n- Countries with stronger social safety nets (Europe) have more powerful automatic stabilizers.\n\n**Discretionary fiscal policy** (stimulus packages, tax cuts) is more powerful but subject to **implementation lag** — policy must be passed, then spending contracted, then finally disbursed — often taking 12–24 months to reach the economy.",
 highlight: ["fiscal policy", "automatic stabilizers", "unemployment insurance", "progressive taxes", "discretionary fiscal policy", "expansionary", "contractionary"],
 },
 {
 type: "teach",
 title: "Fiscal Multiplier & Ricardian Equivalence",
 content:
 "**The Keynesian Fiscal Multiplier** argues that $1 of government spending generates more than $1 of total GDP.\n\n**Mechanism:** The government spends $1 on infrastructure a construction worker earns $1 spends some fraction (marginal propensity to consume, MPC) at local businesses those businesses earn income and spend again chain continues.\n\n`Multiplier = 1 / (1 - MPC)` (simple closed-economy version)\n\nIf MPC = 0.8: Multiplier = 1 / (1 0.8) = **5** (highly simplified)\n\nReal-world estimates are lower (0.5–1.5x) due to:\n- **Crowding out**: Government borrowing raises interest rates, discouraging private investment\n- **Import leakage**: Some spending goes to imported goods\n- **Ricardian equivalence** effect (see below)\n\n**Ricardian Equivalence (Barro-Ricardo):**\nRational, forward-looking households recognize that today's deficit must be repaid via future taxes. They save the entire fiscal stimulus to pre-fund those future tax bills — **consumption is unchanged** and the multiplier = 0.\n\n**Reality:** Full Ricardian equivalence rarely holds — liquidity-constrained households cannot save extra income; many people don't plan perfectly over long horizons. The true multiplier lies between the Keynesian and Ricardian extremes.\n\n**Empirical evidence:** Multipliers tend to be larger:\n- In recessions (when there is economic slack)\n- When monetary policy is at the zero lower bound (can't offset fiscal expansion)\n- For spending on infrastructure vs. tax cuts (spending has higher MPC pathway)",
 highlight: ["fiscal multiplier", "Keynesian", "Ricardian equivalence", "crowding out", "MPC", "import leakage", "zero lower bound"],
 },
 {
 type: "teach",
 title: "Primary Deficit, Debt/GDP & Sustainability",
 content:
 "**Primary deficit vs overall deficit:**\n- **Overall deficit** = Total government spending Total revenues (including interest payments)\n- **Primary deficit** = Overall deficit + Interest payments (i.e., excludes interest costs)\n\nThe **primary balance** is a better measure of fiscal effort — it shows whether the government can cover its non-interest spending from revenues, setting aside inherited debt costs.\n\n**Debt/GDP ratio dynamics:**\nDebt sustainability depends on whether debt is growing faster or slower than the economy.\n\n`Δ(D/Y) (r g) × D/Y primary surplus/Y`\n\nWhere **r** = nominal interest rate on debt, **g** = nominal GDP growth rate, **D/Y** = debt-to-GDP ratio.\n\n**Key insight (Domar condition):** If growth outpaces the interest rate (g > r), the debt ratio stabilizes or shrinks even with a zero primary surplus — economic growth \"grows out\" of the debt.\n\n**Sustainability condition:** Debt/GDP stabilizes when:\n`primary surplus/Y = (r g) × D/Y`\n\n**Example:** A country with D/Y = 80%, r = 4%, g = 3%:\n- Required primary surplus = (4% 3%) × 80% = **0.8% of GDP**\n- Running a 0.8% primary surplus keeps the debt ratio flat.\n\n**Japan paradox:** Debt/GDP > 250% yet stable — because r < g (negative real rates) and domestic investors hold most JGBs, limiting rollover risk.",
 highlight: ["primary deficit", "overall deficit", "debt/GDP", "Domar condition", "r minus g", "sustainability", "primary surplus"],
 },
 {
 type: "quiz-mc",
 question:
 "A country has 100% debt/GDP, nominal GDP growth of 5%, and an average interest rate on its debt of 4%. Ignoring the primary balance, what happens to the debt/GDP ratio?",
 options: [
 "It falls — because growth (5%) exceeds the interest rate (4%), the economy is outgrowing the debt",
 "It rises — a 100% debt ratio always increases because interest compounds on a large base",
 "It stays flat — debt/GDP only changes when the primary balance changes",
 "It falls only if the central bank buys government bonds (QE)",
 ],
 correctIndex: 0,
 explanation:
 "When g > r, the Domar condition works in the government's favor. Δ(D/Y) (r g) × D/Y = (4% 5%) × 100% = 1% per year — the debt ratio falls by roughly 1 percentage point per year even with a balanced primary budget. High growth and low interest rates are the most favorable conditions for debt sustainability.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Ricardian equivalence implies that tax cuts funded by deficit spending have no effect on consumer spending, because rational households save to pay anticipated future taxes.",
 correct: true,
 explanation:
 "True. The Barro-Ricardo equivalence proposition holds that deficit financing is not wealth-creating for households — they recognize they face higher future taxes and save accordingly, leaving permanent income and consumption unchanged. While empirically incomplete (many households are liquidity-constrained), the concept is important for understanding limits on fiscal multipliers.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A government runs a primary deficit of 2% of GDP. Its debt/GDP ratio is 60%, the real interest rate is 3%, and real GDP growth is 2%. The government wants to stabilize its debt/GDP ratio.",
 question:
 "Roughly how much fiscal adjustment (as % of GDP) is needed to stabilize the debt ratio?",
 options: [
 "About 2.6% of GDP — the required primary surplus is 0.6% (from (r-g)×D/Y = 1%×60%), so the adjustment from a 2% primary deficit is 2.6%",
 "About 2.0% of GDP — just close the primary deficit; interest costs are irrelevant to sustainability",
 "About 6.0% of GDP — the full debt ratio must be reduced to zero to achieve stability",
 "No adjustment needed — a 60% debt/GDP ratio is within the EU's Maastricht limit and is automatically sustainable",
 ],
 correctIndex: 0,
 explanation:
 "Debt/GDP stability condition: primary surplus/Y = (r g) × D/Y = (3% 2%) × 60% = 0.6% of GDP. Currently running a 2% primary deficit, the required fiscal adjustment is 0.6% (2.0%) = 2.6% of GDP — a mix of spending cuts and/or tax increases to swing from 2% to +0.6% primary balance.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Debt Sustainability Analysis 
 {
 id: "sd-3",
 title: "Debt Sustainability Analysis",
 description:
 "IMF DSA framework, debt dynamics, debt limits, debt intolerance, and original sin",
 icon: "BarChart3",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "IMF Debt Sustainability Analysis Framework",
 content:
 "The **IMF Debt Sustainability Analysis (DSA)** is the standard toolkit used by sovereign analysts, rating agencies, and policymakers to assess whether a country's debt path is viable.\n\n**Core components of the IMF DSA:**\n\n1. **Baseline debt path:** Projects debt/GDP over 5–10 years under current policies, using forecasts for growth, interest rates, primary balance, and exchange rates.\n\n2. **Stress tests (fan charts):** Simulates alternative scenarios:\n - Growth shock: GDP growth 1–2% lower than baseline\n - Interest rate shock: borrowing costs 200bps higher\n - Exchange rate depreciation: sharp currency weakening (important for FX-denominated debt)\n - Contingent liabilities: banking sector bailouts, SOE losses\n\n3. **Heat maps:** Color-coded (green/yellow/red) indicators for gross financing needs, debt/GDP, and external debt ratios relative to country-specific benchmarks.\n\n4. **Realism tools:** Assesses whether the fiscal adjustment assumed in the baseline is historically achievable.\n\n**Different frameworks for different countries:**\n- **Advanced economies (AE):** Higher debt tolerance; no automatic 'red lines' — market confidence and reserve currency status matter\n- **Market access countries (MAC):** Emerging markets with bond market access; fan charts with specific thresholds (~70% for MAC)\n- **Low income countries (LIC):** Grants/concessional loans dominant; separate LIC DSA with different risk ratings\n\n**Output:** DSA concludes debt is \"sustainable,\" \"sustainable but not with high probability,\" or \"unsustainable\" — the latter triggers debt restructuring discussions.",
 highlight: ["IMF DSA", "baseline debt path", "stress tests", "fan charts", "heat maps", "contingent liabilities", "market access countries"],
 },
 {
 type: "teach",
 title: "Debt Dynamics & The Debt Limit",
 content:
 "**Debt dynamics equation** (revisited with more precision):\n\n`Δ(D/Y) = (r - g) × D/Y pb + SF`\n\n- **(r - g)**: Snowball effect — interest-growth differential\n- **pb**: Primary balance/GDP (positive = surplus)\n- **SF**: Stock-flow adjustment — off-balance-sheet items, asset sales, valuation changes\n\n**Non-linear dynamics at high debt levels:**\nAt low debt levels, higher debt increases marginally. But when debt crosses a **debt limit** threshold, markets lose confidence: yields spike debt service explodes fiscal adjustment becomes infeasible default becomes likely.\n\nThis creates **multiple equilibria**: a country at 90% D/Y could be stable if markets remain calm (low r) or spiral to default if confidence breaks (high r). Self-fulfilling crises are possible.\n\nThe debt limit is **not a fixed number** — it depends on:\n- Fiscal capacity (willingness and ability to run primary surpluses)\n- Credibility of institutions\n- Currency denomination of debt\n- External vs domestic debt composition\n\n**Debt intolerance:**\nEmerging market economies historically face market stress at **lower** debt/GDP ratios than developed markets:\n- EM countries may hit debt limits at 40–60% D/Y\n- DM countries (US, Japan, UK) can sustain 100%+ D/Y due to reserve currency status, deep domestic markets, and institutional credibility\n\nReinhart and Rogoff's research on \"debt intolerance\" argues this reflects EM countries' histories of inflation, default, and weak fiscal institutions — market participants require a larger risk premium at lower debt levels.",
 highlight: ["debt dynamics", "debt limit", "snowball effect", "multiple equilibria", "debt intolerance", "self-fulfilling crisis", "reserve currency"],
 },
 {
 type: "teach",
 title: "Original Sin & EM Debt Markets",
 content:
 "**Original sin** refers to the historical inability of emerging market countries to borrow internationally in their own currency. They had to issue foreign-currency (USD, EUR) debt — creating a dangerous **currency mismatch**.\n\n**The original sin problem:**\n- Government revenues are in local currency; debt service is in USD.\n- A currency depreciation (common during crises) **raises the real debt burden** in local currency terms.\n- Governments face a vicious cycle: crisis currency falls debt burden rises deeper crisis.\n- This amplified the severity of EM crises (Mexico 1994, Asia 1997–98, Russia 1998, Brazil 1999).\n\n**Has original sin been resolved?**\nPartially. Since the 2000s, a \"EM local currency bond market renaissance\" has occurred:\n- **Local-currency bond markets** have deepened significantly in Brazil, Mexico, Indonesia, India, South Africa.\n- Global index inclusion (GBI-EM by JPMorgan) has brought foreign investors into EM local-currency bonds.\n- **Original sin redux**: Some argue new EM original sin is that local currency bond markets are increasingly dominated by foreign investors — still creating vulnerability to sudden capital outflows.\n\n**Debt composition matters for sustainability:**\n- **Domestic vs external**: Domestic debt can be inflated away; external cannot.\n- **Short vs long duration**: Short-term debt creates rollover risk — if markets freeze, refinancing fails.\n- **Fixed vs floating rate**: Floating-rate debt has direct exposure to rising rates.\n- **Concessional vs commercial**: IMF/World Bank loans at below-market rates reduce debt service burden.",
 highlight: ["original sin", "currency mismatch", "local currency bonds", "GBI-EM", "rollover risk", "concessional debt", "external debt"],
 },
 {
 type: "quiz-mc",
 question:
 "A country's debt/GDP is 60%, real interest rate is 2%, and real GDP growth is 1%. What primary surplus (as % of GDP) is needed to stabilize the debt ratio?",
 options: [
 "0.6% of GDP — from (r - g) × D/Y = (2% - 1%) × 60% = 0.6%",
 "1.2% of GDP — primary surplus must equal the full interest rate times the debt ratio",
 "60% of GDP — the entire debt stock must be repaid in one year",
 "No surplus needed — debt/GDP stabilizes automatically when r is positive",
 ],
 correctIndex: 0,
 explanation:
 "Stability condition: primary surplus = (r g) × D/Y = (2% 1%) × 60% = 0.6% of GDP. The 1% differential between real rate and growth means the debt ratio grows by 0.6 percentage points per year without a primary surplus. Running exactly a 0.6% primary surplus offsets this snowball effect and stabilizes debt/GDP at 60%.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Emerging market governments typically face sovereign debt market stress at higher debt/GDP ratios than advanced economies, because EM bond markets are larger and more liquid.",
 correct: false,
 explanation:
 "False. This is the debt intolerance phenomenon identified by Reinhart and Rogoff — EM countries typically face market stress at lower debt/GDP ratios than advanced economies, not higher. EM countries carry histories of default, inflation, and weak fiscal institutions, so investors require risk premiums at lower debt levels. Advanced economies benefit from reserve currency status, deep domestic bond markets, and strong institutional credibility.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A small emerging market has 55% of its debt denominated in USD. Domestic revenues are in local currency. The currency suddenly depreciates 30% against the dollar, while the government has no foreign currency reserves.",
 question:
 "What is the primary risk created by this currency mismatch (the 'original sin' problem)?",
 options: [
 "The real debt burden in local currency terms rises by ~43%, dramatically worsening the debt/GDP ratio and potentially triggering default",
 "The domestic bond market benefits because investors prefer safer local assets during currency crises",
 "Interest rates automatically fall as the central bank must defend the currency, reducing debt service costs",
 "USD-denominated debt is insulated from local economic conditions, so the depreciation has no effect on fiscal sustainability",
 ],
 correctIndex: 0,
 explanation:
 "A 30% depreciation means $1 of USD debt now requires ~1.43 units of local currency to repay (1/0.70 1.43), a 43% increase in local-currency debt burden. For a government with local-currency revenues, this devastates the debt/GDP ratio in local terms. This currency mismatch is the core of 'original sin' — it amplifies crises and has caused numerous EM sovereign defaults when depreciations make foreign-currency debt unserviceable.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Sovereign Default & Restructuring 
 {
 id: "sd-4",
 title: "Sovereign Default & Restructuring",
 description:
 "Default types, rating triggers, Brady bonds, Greece PSI, Argentina holdouts, and debt relief mechanisms",
 icon: "AlertTriangle",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Types of Sovereign Default",
 content:
 "Sovereign default is not always an outright refusal to pay. Governments have multiple tools to reduce the real value of their debt obligations:\n\n**1. Outright default:** Government stops making interest or principal payments. Rare and severe — triggers cross-default clauses across all debt instruments.\n\n**2. Debt restructuring (haircut):** Agreement with creditors to accept new bonds with lower face value, extended maturities, reduced coupons, or some combination. Technically a default event but managed to preserve market access.\n\n**3. Inflation debasement:** Government allows or engineers high inflation. Domestic currency debt is repaid with less valuable currency — creditors receive full nominal payment but purchasing power is eroded. Works only for local-currency debt. Historical examples: Germany 1920s, UK post-WWII.\n\n**4. Financial repression:** Combination of low (artificially capped) interest rates and regulations that force domestic investors (banks, pension funds) to hold government bonds. Real returns are negative, but no formal default occurs. Used extensively post-WWII in the U.S. and Europe to reduce debt/GDP ratios.\n\n**5. Currency debasement:** Devalue or depreciate the exchange rate. Reduces the real foreign value of local-currency debt. Common in EM crises.\n\n**Willingness vs ability to pay:**\n- Most sovereign defaults reflect **willingness** failures more than inability — governments can nearly always extract more resources if politically willing.\n- Creditors assess both fiscal capacity (maximum sustainable primary surplus) and political will (is the government willing to impose austerity?).",
 highlight: ["outright default", "debt restructuring", "haircut", "inflation debasement", "financial repression", "willingness to pay", "cross-default"],
 },
 {
 type: "teach",
 title: "Brady Bonds, Greece PSI & Argentina",
 content:
 "**Brady Bonds (1989):**\nThe 1980s Latin American debt crisis left banks holding massive quantities of defaulted EM sovereign loans. U.S. Treasury Secretary Nicholas Brady proposed a landmark restructuring:\n- Bank loans were exchanged for long-term bonds (Brady bonds) at a discount (30–50% haircut).\n- Bonds were **collateralized** by zero-coupon U.S. Treasuries pledged as principal guarantee.\n- The collateral reduced credit risk and made bonds tradeable — creating a liquid EM bond market.\n- Brady deals covered Argentina, Brazil, Mexico, Nigeria, Philippines, and others.\n- Legacy: Brady bonds were the genesis of the modern EM sovereign bond market.\n\n**Greece 2012 — Largest Sovereign Restructuring in History:**\n- 206 billion of privately held Greek government bonds restructured under **PSI** (Private Sector Involvement).\n- Holders accepted ~53.5% nominal haircut + maturity extension + lower coupons ~74% net present value (NPV) loss.\n- **Collective Action Clauses (CACs)** were retroactively inserted into Greek law bonds — allowed a supermajority vote to bind all holders including holdouts.\n- Official sector (ECB, IMF) was **excluded** from PSI — subordination issue that set a precedent.\n\n**Argentina — Serial Defaulter:**\n- **2001**: $81.8B default — largest sovereign default in history at that time. Collapsed currency board (peso-dollar peg).\n- **2005 & 2010 restructurings**: Most creditors accepted significant haircuts (~70%) and exchanged for GDP-linked warrants.\n- **Holdout creditors (\"Vulture funds\")**: NML Capital (Elliott Management) refused to accept restructuring and sued in U.S. courts. U.S. judge ruled ratable payment (pari passu) — Argentina couldn't pay restructured bonds without paying holdouts 2014 default on restructured bonds.\n- **2020**: 9th default — restructured again amid COVID. Total: 9 sovereign defaults since independence.",
 highlight: ["Brady bonds", "PSI", "collective action clauses", "holdout creditors", "vulture funds", "pari passu", "NPV haircut"],
 },
 {
 type: "teach",
 title: "Sovereign Ratings & Debt Relief Mechanisms",
 content:
 "**Sovereign credit ratings** are assigned by Moody's, S&P, and Fitch. Ratings range from Aaa/AAA (top investment grade) to C/D (default).\n\n**Rating triggers — forced selling cascade:**\n1. Sovereign downgrade crosses **investment grade threshold** (below Baa3/BBB)\n2. Many institutional investors (insurance companies, pension funds, index funds) have mandates requiring investment-grade holdings\n3. Forced selling of downgraded sovereign bonds bond prices fall sharply, yields spike\n4. Higher yields make refinancing more expensive fiscal pressure increases further credit deterioration self-reinforcing spiral\n\n**Watch for cliff-edge risk** when a sovereign is at Baa3/BBB — the line between investment grade and high yield (\"junk\").\n\n**Debt Relief Mechanisms:**\n1. **Paris Club:** G7+ creditor countries coordinate sovereign debt relief for low-income debtors. Established 1956; required IMF program as condition.\n2. **HIPC Initiative (Heavily Indebted Poor Countries):** IMF/World Bank program for poorest nations. Creditors provide debt relief once countries meet policy reforms.\n3. **Common Framework (G20):** Created 2020 to coordinate restructurings involving non-Paris Club creditors (especially China), which has become the largest bilateral creditor to developing nations.\n4. **IMF Stand-By Arrangements:** Crisis lending to prevent default; conditioned on fiscal adjustment program.\n5. **Brady-style exchange:** Market-based restructuring using collateralized bonds to provide haircut while preserving market access.",
 highlight: ["investment grade threshold", "forced selling", "Paris Club", "HIPC", "Common Framework", "cliff-edge risk", "IMF program"],
 },
 {
 type: "quiz-mc",
 question:
 "A heavily indebted country is facing a debt crisis. Which debt relief mechanism typically involves the fewest legal complications with holdout creditors?",
 options: [
 "Paris Club bilateral renegotiation — government-to-government negotiation avoids private creditor holdout risk",
 "Market-based exchange offer — any single holdout creditor can block the entire deal with pari passu clauses",
 "Inflation debasement — but only works for foreign-currency debt",
 "Outright default with no negotiations — cleanest legal outcome as all bonds are equally impaired",
 ],
 correctIndex: 0,
 explanation:
 "Paris Club restructurings involve government-to-government negotiations among creditor countries and are coordinated through diplomatic channels. This avoids the holdout creditor problems common in market-based restructurings, where a single bondholder can purchase bonds at distressed prices and litigate for full payment (as in Argentina). Modern bond restructurings use Collective Action Clauses (CACs) to bind holdouts, but these have their own complexities and don't apply to old bonds without CACs.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Financial repression, where governments cap interest rates and force domestic institutions to hold government bonds, is a form of hidden default because real returns to creditors become negative.",
 correct: true,
 explanation:
 "True. Financial repression is sometimes called a 'soft' or 'hidden' default. By capping rates below inflation and mandating institutional holdings of government bonds (via bank regulations, pension fund requirements, capital controls), governments effectively transfer wealth from savers to the sovereign — repaying debt in depreciated purchasing power terms. Reinhart and Sbrancia documented that financial repression helped reduce U.S. and UK debt/GDP by 3–4% per year in the 1945–1980 period.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A sovereign bond has a Baa3/BBB rating from Moody's/S&P. Moody's announces a one-notch downgrade to Ba1 — below investment grade. The country's bonds are included in major investment-grade bond indices.",
 question:
 "What is the most likely immediate market consequence of the downgrade?",
 options: [
 "Forced selling as institutional investors with IG-only mandates and index funds must exit, causing bond prices to fall sharply and yields to spike",
 "Bond prices rise as high-yield investors, seeing bargain yields, immediately buy the bonds at scale",
 "No significant impact — sovereign credit ratings are lagging indicators that markets have already priced in",
 "The central bank automatically intervenes to buy bonds and cap yields within 24 hours",
 ],
 correctIndex: 0,
 explanation:
 "Crossing the investment-grade threshold triggers 'fallen angel' selling — a well-documented cliff-edge effect. Insurance companies, pension funds, and IG bond ETFs with mandates restricting below-IG holdings must sell. Index-tracking funds must remove the bond from IG indices and add it to HY indices. This supply of forced selling overwhelms demand, causing prices to gap down and yields to spike — often overshooting fair value in the short run. This dynamic makes the IG/HY boundary a critical risk inflection point for sovereign debt.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Central Bank & Fiscal Interactions 
 {
 id: "sd-5",
 title: "Central Bank & Fiscal Interactions",
 description:
 "Seigniorage, fiscal dominance, quantitative easing, yield curve control, and debt monetization",
 icon: "Banknote",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Seigniorage & Fiscal Dominance",
 content:
 "**Seigniorage** is the revenue a government earns from issuing money. When the central bank creates new currency, it acquires real assets (government bonds, foreign exchange) and the cost of production is negligible — the gain is seigniorage.\n\n**Three related concepts:**\n1. **Seigniorage (direct):** Revenue from issuing banknotes — face value minus printing cost. Usually small (~0.5% of GDP in stable economies).\n2. **Inflation tax:** When inflation erodes the real value of money balances, households effectively lose purchasing power to the government. Higher inflation = higher inflation tax.\n3. **Monetization of debt:** Central bank buys government bonds — effectively financing the deficit by creating money.\n\n**Fiscal dominance** occurs when the fiscal needs of the government override monetary policy decisions. Instead of the central bank setting rates to achieve its inflation mandate, it is forced to set rates and/or buy bonds to ensure government solvency or low borrowing costs.\n\n**Symptoms of fiscal dominance:**\n- Political pressure on the central bank to keep rates low despite inflation\n- Central bank mandated to finance deficits directly\n- Government controls central bank appointments aggressively\n- Country examples: Turkey (2021), Argentina (persistent), Venezuela (extreme)\n\n**Historical extreme: Weimar Germany (1921–1923)**\nThe Reichsbank was forced to finance massive war reparations. Monthly inflation peaked at 29,500% in October 1923. The entire stock of Reichsmarks became worthless. This remains the canonical hyperinflation case study.",
 highlight: ["seigniorage", "inflation tax", "monetization", "fiscal dominance", "hyperinflation", "Weimar Germany", "central bank independence"],
 },
 {
 type: "teach",
 title: "Quantitative Easing & Bond Market Mechanics",
 content:
 "**Quantitative Easing (QE)** is the large-scale purchase of assets (primarily government bonds) by the central bank, creating bank reserves in return.\n\n**QE transmission channels:**\n1. **Portfolio balance effect:** As the central bank buys Treasuries, investors selling bonds receive cash and rebalance into riskier assets (corporate bonds, equities), lowering yields across the entire curve.\n2. **Signaling effect:** QE signals that short-term rates will stay low for longer, anchoring long-term rate expectations.\n3. **Wealth effect:** Higher asset prices from QE boost household wealth, supporting consumption.\n4. **Exchange rate:** QE can weaken the domestic currency (more money supply), potentially stimulating exports.\n\n**Does QE = money printing?**\nThe debate is nuanced:\n- **Technically, no:** QE creates bank reserves (a liability of the central bank), not currency in circulation. Banks receive reserves but choose how much to lend.\n- **Practically, yes if fiscal:** If QE finances a government deficit that spends the money directly into the economy, the monetary effect is closer to money printing.\n- **ECB legal constraint:** The ECB's OMT and PSPP programs were challenged on \"monetary financing\" grounds (prohibited by EU treaty). The ECB structures purchases with caps per issuer and buys in secondary markets to avoid direct deficit financing.\n- **Fed legal constraint:** The Fed purchases in secondary markets and is prohibited from primary market lending to the Treasury.\n\n**QE vs. Interest Rate Policy:**\n- QE primarily compresses the **term premium** (extra yield for holding long-duration bonds).\n- Rate cuts primarily affect the **short end** of the yield curve.\n- QE is more effective when short rates are at the zero lower bound (ZLB).",
 highlight: ["quantitative easing", "portfolio balance effect", "bank reserves", "monetary financing", "term premium", "zero lower bound", "ECB", "Fed"],
 },
 {
 type: "teach",
 title: "Yield Curve Control & YCC",
 content:
 "**Yield Curve Control (YCC)** is an extreme form of monetary policy where the central bank targets a specific yield level and buys whatever quantity of bonds is necessary to maintain it — committing to unlimited purchases.\n\n**Bank of Japan YCC (2016–present):**\n- BOJ introduced YCC in September 2016 to target the 10-year JGB yield at \"around 0%.\"The target was later widened to ±0.25%, then ±0.5%, and eventually ±1.0% in 2023 before being formally abolished in March 2024.\n- **Mechanism:** If yields rise above the target, BOJ buys JGBs without limit to cap yields. BOJ now owns >50% of the JGB market — unprecedented in any major economy.\n- **Advantage:** Anchors borrowing costs for the government and mortgage holders.\n- **Disadvantage:** Distorts price discovery, causes yen weakness, and creates a cliff-edge exit problem (markets may test the cap if credibility erodes).\n\n**Australia RBA YCC (2020–2021):**\n- Targeted 3-year government bond yield at 0.1% during COVID. Abandoned in November 2021 when inflation surged.\n- Failure case: markets tested the cap aggressively — RBA bought massive quantities and eventually had to abandon the policy.\n\n**U.S. Historical YCC:**\n- The Federal Reserve pegged Treasury yields below 2.5% from 1942–1951 to finance WWII debt at low cost.\n- The 1951 Treasury-Fed Accord ended YCC, restoring central bank independence.\n\n**YCC exit problem:**\nAny attempt to raise the yield cap or abandon YCC causes immediate large market moves — the \"exit problem\" that makes YCC politically and financially costly to unwind.",
 highlight: ["yield curve control", "YCC", "Bank of Japan", "JGB", "unlimited bond buying", "exit problem", "Treasury-Fed Accord", "price discovery"],
 },
 {
 type: "quiz-mc",
 question:
 "A central bank loses its independence and is required to purchase all government bonds issued, directly financing the fiscal deficit with newly created money. What is the most likely macroeconomic outcome over the medium term?",
 options: [
 "Rising inflation, potentially accelerating into hyperinflation if the fiscal deficit is large and persistent",
 "Lower inflation because the central bank has access to unlimited resources to stabilize prices",
 "Stronger currency because large-scale bond purchases signal confidence in government finances",
 "Deflation because the money created by the central bank reduces the need for private lending",
 ],
 correctIndex: 0,
 explanation:
 "Fiscal dominance — when fiscal needs force the central bank to monetize deficits — is the primary historical driver of high inflation and hyperinflation. Money supply grows faster than real output, eroding purchasing power. In extreme cases (Weimar Germany, Zimbabwe, Venezuela), the feedback loop between fiscal deficits monetization inflation larger nominal deficits more monetization can become self-reinforcing, leading to hyperinflation. Central bank independence is the primary institutional safeguard against this dynamic.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Quantitative easing directly increases the amount of currency in circulation, making it equivalent to traditional money printing that causes immediate consumer price inflation.",
 correct: false,
 explanation:
 "False. QE creates bank reserves held at the central bank — not currency in consumers' pockets. Reserves increase commercial banks' balance sheets but only translate to broad money supply (M2, M3) if banks lend those reserves out. After the 2008 QE programs, much of the created reserves sat as excess reserves at the Fed earning interest (IOER), with limited inflationary effect. The 2020–2021 QE combined with direct fiscal transfers (helicopter money) was more inflationary because it bypassed banks and put money directly into the economy.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "The Bank of Japan has been running Yield Curve Control, capping 10-year JGB yields at 0.5%. Global inflation is rising and the U.S. 10-year yield has risen to 4.5%, creating a large interest rate differential. Speculative traders are shorting JGBs (betting yields will rise above the cap).",
 question:
 "What is the BOJ's dilemma, and what happens if it defends the YCC cap?",
 options: [
 "BOJ must buy unlimited JGBs to defend the cap, expanding its balance sheet massively and weakening the yen, but abandoning YCC would cause yields to spike and sharply increase Japan's debt service costs",
 "BOJ can raise the YCC cap without any market reaction because central bank communications always anchor market expectations perfectly",
 "The yen strengthens automatically when BOJ buys JGBs because domestic bonds become more attractive to foreign investors",
 "BOJ can simply raise interest rates to defend the yen without any impact on the JGB market or fiscal sustainability",
 ],
 correctIndex: 0,
 explanation:
 "This is the classic YCC dilemma: defending the cap requires unlimited JGB purchases, expanding the BOJ's balance sheet further and creating more yen — weakening the currency. A weak yen increases import costs (Japan is an energy importer), fueling domestic inflation. Abandoning YCC, however, would cause yields to spike dramatically — with JGB debt at 250%+ of GDP, each 1pp yield increase dramatically raises debt service costs. The BOJ is caught between defending the yen (raise rates/abandon YCC) and protecting fiscal sustainability (maintain YCC). This was the actual tension that led BOJ to repeatedly widen and eventually abolish YCC in 2024.",
 difficulty: 3,
 },
 ],
 },
 ],
};
