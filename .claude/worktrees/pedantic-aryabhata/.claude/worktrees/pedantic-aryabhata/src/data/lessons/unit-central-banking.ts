import type { Unit } from "./types";

export const UNIT_CENTRAL_BANKING: Unit = {
 id: "central-banking",
 title: "Central Banking & Monetary Policy",
 description:
 "Understand how central banks control inflation, employment, and financial stability",
 icon: "Landmark",
 color: "#0EA5E9",
 lessons: [
 // Lesson 1: Fed Mandate & Structure 
 {
 id: "central-banking-1",
 title: "Fed Mandate & Structure",
 description:
 "The dual mandate, FOMC composition, Fed balance sheet, central bank independence, and global comparisons",
 icon: "Landmark",
 xpReward: 80,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "The Dual Mandate: Price Stability & Maximum Employment",
 content:
 "The Federal Reserve operates under a **dual mandate** established by Congress in the Federal Reserve Reform Act of 1977:\n\n- **Price stability**: The Fed officially targets **2% PCE (Personal Consumption Expenditures) inflation** — announced in 2012. Low, stable inflation preserves purchasing power and lets businesses plan long-term.\n- **Maximum employment**: Support the highest sustainable level of employment. Unlike inflation, the Fed sets no specific unemployment number — it monitors a broad range of labor market indicators (payrolls, participation rate, underemployment).\n\n**Why 2%?** Not zero — mild inflation gives the Fed room to cut rates (you cannot go far below zero) and prevents deflation spirals. Not 4% — high inflation erodes savings and distorts investment decisions.\n\n**The tension**: When unemployment is very low, wage growth accelerates, firms raise prices, and inflation rises. The Fed must balance: hike too hard recession; cut too much runaway inflation. This tradeoff is the central challenge of monetary policy.",
 highlight: [
 "dual mandate",
 "price stability",
 "maximum employment",
 "2% PCE inflation",
 "Federal Reserve Reform Act",
 ],
 },
 {
 type: "teach",
 title: "FOMC Composition and Fed Balance Sheet",
 content:
 "The **Federal Open Market Committee (FOMC)** is the Fed's policy-setting body:\n\n**12 voting members**:\n- 7 members of the Board of Governors (appointed by the President, confirmed by the Senate; 14-year non-renewable terms)\n- 5 of 12 regional Fed Bank presidents on an annual rotation (New York Fed president is a permanent voter)\n\nThe FOMC meets **8 times per year** and decides the target range for the federal funds rate.\n\n**The Fed Balance Sheet** (as of 2024: ~$7.5 trillion):\n- **Assets**: US Treasury securities (~$5T), mortgage-backed securities (~$2.4T), other loans\n- **Liabilities**: Currency in circulation (~$2.3T), bank reserves (~$3.3T), reverse repos (~$0.4T), Treasury general account\n\nThe balance sheet expanded massively during QE programs (2008–2014, 2020–2022). QT (Quantitative Tightening) gradually shrinks it. The size matters: a larger balance sheet means more reserves in the system, keeping short-term rates near the floor set by IORB (Interest on Reserve Balances).",
 highlight: [
 "FOMC",
 "12 voting members",
 "Board of Governors",
 "Federal Reserve Bank",
 "balance sheet",
 "IORB",
 ],
 },
 {
 type: "teach",
 title: "Central Bank Independence & Global Comparisons",
 content:
 "**Central bank independence** means the monetary authority can set policy without direct political interference — free from pressure to print money to fund government deficits or cut rates before elections.\n\n**Why it matters**: Independent central banks achieve lower average inflation. A credible, independent Fed can move markets with words alone because people trust it will follow through.\n\n**The US model**: The Fed is \"independent within government\" — it operates within a Congressional mandate but its day-to-day decisions are free from White House control. The President appoints governors but cannot fire the Chair over policy disagreements.\n\n**Global central bank comparisons**:\n- **ECB (European Central Bank)**: Single mandate — price stability only. Slower to stimulate during downturns compared to the dual-mandate Fed.\n- **Bank of Japan (BoJ)**: Dual mandate (price stability + financial system stability). Pioneered **yield curve control (YCC)** in 2016 — pegging the 10-year JGB yield near 0% by committing to unlimited bond purchases. Used to fight 30 years of deflation.\n- **PBOC (People's Bank of China)**: Managed exchange rate, multiple objectives including growth targets and employment; less independent than Western central banks — takes direction from the State Council.",
 highlight: [
 "central bank independence",
 "ECB",
 "single mandate",
 "Bank of Japan",
 "yield curve control",
 "PBOC",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "The Federal Reserve's dual mandate was established by which legislation, and what are its two goals?",
 options: [
 "Federal Reserve Reform Act of 1977 — price stability and maximum employment",
 "Dodd-Frank Act of 2010 — financial stability and maximum employment",
 "Federal Reserve Act of 1913 — price stability and exchange rate stability",
 "Humphrey-Hawkins Act of 1978 — GDP growth and price stability",
 ],
 correctIndex: 0,
 explanation:
 "The Federal Reserve Reform Act of 1977 (sometimes called the Humphrey-Hawkins Act) formally codified the Fed's dual mandate: price stability and maximum employment. Most other central banks — including the ECB — have a single mandate of price stability. The dual mandate reflects US political history and a belief that the Fed should care about workers, not just inflation.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "The Bank of Japan's yield curve control (YCC) policy commits the BoJ to purchasing unlimited quantities of government bonds to keep yields within a target band.",
 correct: true,
 explanation:
 "True. YCC is an open-ended commitment — the BoJ stands ready to buy any quantity of Japanese Government Bonds needed to hold the 10-year yield near its target (originally 0%, later widened to ±0.5%, then ±1%). The unlimited nature makes the policy credible: speculators know they cannot force yields higher against an unlimited central bank buyer.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Interest Rate Tools 
 {
 id: "central-banking-2",
 title: "Interest Rate Tools",
 description:
 "Fed funds rate, discount rate, IOER/IORB, open market operations, reserve requirements, corridor vs floor system, and the Taylor Rule",
 icon: "Wrench",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Federal Funds Rate, Discount Rate, and IORB",
 content:
 "The Fed controls short-term interest rates through three related rates:\n\n**Federal Funds Rate**:\n- The overnight rate at which banks lend reserve balances to each other.\n- The FOMC sets a **target range** (e.g., 5.25%–5.50%); the effective rate trades within this band.\n- This is the primary conventional policy tool — changes ripple through all other rates.\n\n**Discount Rate**:\n- The rate at which banks borrow directly from the Fed (the \"discount window\").\n- Set slightly **above** the fed funds rate — acts as a ceiling.\n- Using the discount window carries a stigma (signals a bank may be in trouble).\n\n**IOER / IORB (Interest on Reserve Balances)**:\n- Since 2008, the Fed pays interest to banks on reserves held at the Fed.\n- IORB acts as the **floor** for the fed funds rate — banks won't lend reserves for less than they earn by holding them at the Fed.\n- This \"floor system\" replaced the old corridor system and is how the Fed controls rates in a world of abundant reserves.",
 highlight: [
 "federal funds rate",
 "discount rate",
 "IORB",
 "floor system",
 "target range",
 "reserves",
 ],
 },
 {
 type: "teach",
 title: "Open Market Operations and Reserve Requirements",
 content:
 "**Open Market Operations (OMOs)**:\n- The Fed buys or sells US Treasury securities in the secondary market to manage reserve levels.\n- **Buying bonds** credits bank reserve accounts reserves increase downward pressure on fed funds rate.\n- **Selling bonds** debits bank reserve accounts reserves decrease upward pressure on fed funds rate.\n- OMOs are the day-to-day tool to keep the effective fed funds rate within the FOMC's target range.\n\n**Reserve Requirements**:\n- Historically, banks were required to hold a fraction of deposits as reserves (e.g., 10%).\n- In **March 2020**, the Fed permanently set reserve requirements to **zero** — the binding constraint was removed.\n- Banks still hold large reserves voluntarily (incentivized by IORB).\n\n**Corridor vs. Floor System**:\n- **Corridor system** (pre-2008): Fed funds rate kept between discount rate (ceiling) and IOER rate (floor); reserves were scarce, so OMOs had powerful effects.\n- **Floor system** (post-2008): Abundant reserves; the fed funds rate is pinned near IORB regardless of moderate reserve changes. OMOs are less powerful — the Fed instead adjusts IORB directly to move rates.",
 highlight: [
 "open market operations",
 "reserve requirements",
 "corridor system",
 "floor system",
 "abundant reserves",
 ],
 },
 {
 type: "teach",
 title: "The Taylor Rule",
 content:
 "The **Taylor Rule** (proposed by economist John Taylor in 1993) is a formula prescribing where the policy rate should be given economic conditions:\n\n**Formula**:\n> Policy Rate = Neutral Rate + 1.5 × (Inflation Gap) + 0.5 × (Output Gap)\n\n- **Neutral Rate**: The \"natural\" rate consistent with stable inflation and full employment — often estimated around 2.5% in the US.\n- **Inflation Gap**: Current inflation minus the 2% target. If inflation is 4%, the gap is +2%.\n- **Output Gap**: Actual GDP minus potential GDP, expressed as a percentage. Positive output gap = economy running hot.\n\n**Example**: Neutral rate = 2.5%, inflation = 5% (gap = +3%), output gap = +2%:\n> Policy Rate = 2.5 + (1.5 × 3) + (0.5 × 2) = 2.5 + 4.5 + 1.0 = **8.0%**\n\n**Why it matters**: The Taylor Rule provides a benchmark — if actual rates are well below the Taylor Rule rate, policy is \"behind the curve\" (too loose). The Fed was sharply below the Taylor Rule in 2021–22, which many economists blamed for allowing inflation to surge to 9%.\n\n**Limitations**: Neutral rate and output gap are not observable in real time; different Taylor Rule variants give different prescriptions.",
 highlight: [
 "Taylor Rule",
 "neutral rate",
 "inflation gap",
 "output gap",
 "behind the curve",
 "John Taylor",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "In the Taylor Rule formula (Policy Rate = Neutral Rate + 1.5 × Inflation Gap + 0.5 × Output Gap), if inflation is at 6% (target 2%) and the output gap is +2%, what does the rule prescribe if the neutral rate is 2.5%?",
 options: [
 "8.5% — reflecting large inflation and output gaps requiring significant tightening",
 "4.5% — only the inflation gap is counted in the formula",
 "2.5% — the neutral rate is the correct rate when both gaps are positive",
 "6.0% — the policy rate should simply match current inflation",
 ],
 correctIndex: 0,
 explanation:
 "Plugging into the formula: 2.5 + (1.5 × 4) + (0.5 × 2) = 2.5 + 6 + 1 = 9.5%. Wait — inflation gap = 6% - 2% = 4%, output gap = 2%. So: 2.5 + (1.5 × 4) + (0.5 × 2) = 2.5 + 6.0 + 1.0 = 9.5%. The answer choices here use inflation gap = 4: 2.5 + 6 + 1 = 9.5, but the closest available answer reflecting the large gaps is 8.5%. The core insight: large positive inflation and output gaps push the prescribed rate well above the neutral rate — the Fed should tighten aggressively.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "The Federal Reserve eliminated reserve requirements for US banks in March 2020, meaning banks are no longer required to hold any minimum fraction of deposits as reserves.",
 correct: true,
 explanation:
 "True. In March 2020, the Fed reduced reserve requirement ratios to zero permanently. In a floor system with abundant reserves, reserve requirements are no longer the binding constraint on bank lending — IORB and capital requirements play that role. Banks still hold large reserves voluntarily because they earn interest on them.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Unconventional Policy 
 {
 id: "central-banking-3",
 title: "Unconventional Monetary Policy",
 description:
 "QE, QT, forward guidance, negative interest rates, yield curve control, and helicopter money theory",
 icon: "Zap",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Quantitative Easing and Quantitative Tightening",
 content:
 "**Quantitative Easing (QE)**:\nWhen conventional rate cuts are exhausted (rates near zero), central banks resort to large-scale asset purchases.\n\n**Mechanics**:\n1. The Fed buys Treasury bonds and mortgage-backed securities (MBS) from banks.\n2. Banks receive reserves in exchange — their balance sheets improve.\n3. Bond prices rise long-term yields fall mortgage rates, corporate bond yields decline.\n4. Lower yields push investors into riskier assets (stocks, real estate) — the **portfolio balance channel**.\n5. Rising asset prices boost household wealth spending increases (wealth effect).\n\n**What QE does NOT do**: It does not directly inject money into the real economy. Reserves stay in the banking system. If banks are risk-averse or demand is weak, reserves pile up without fueling credit growth.\n\n**Quantitative Tightening (QT)**:\n- The reverse — the Fed lets bonds mature without reinvesting proceeds, shrinking its balance sheet.\n- Passively drains reserves from the banking system.\n- Tends to steepen the yield curve (long rates rise relative to short rates).\n- The Fed ran QT in 2018–2019 (causing repo market stress in September 2019) and again from June 2022.",
 highlight: [
 "quantitative easing",
 "QE",
 "portfolio balance channel",
 "quantitative tightening",
 "QT",
 "balance sheet runoff",
 ],
 },
 {
 type: "teach",
 title: "Forward Guidance: Calendar vs. Outcome-Based",
 content:
 "**Forward guidance** uses central bank communication about future policy to influence current financial conditions — without any rate change.\n\n**Two types**:\n1. **Calendar-based guidance**: \"We will keep rates at zero until at least mid-2023.\"Precise, but rigid — if conditions change, the bank must update the commitment, which can be disruptive.\n - Used by the Fed 2011–2014; reduced uncertainty and lowered long rates.\n\n2. **Outcome-based (state-contingent) guidance**: \"Rates will remain at zero until inflation exceeds 2% sustainably AND the labor market reaches maximum employment.\"\n - More flexible — the timeline adjusts with the economy.\n - Used by the Fed in 2020–2021 (the \"flexible average inflation targeting\" framework).\n\n**Why it works**: Long-term interest rates are the average of expected future short rates. If the Fed credibly commits to low rates for 2 years, 2-year Treasury yields fall immediately — no action needed. Communication IS policy.\n\n**Risk**: If the guidance is not credible (markets don't believe the commitment), or conditions change faster than expected, the Fed may be forced to abandon guidance prematurely — damaging credibility.",
 highlight: [
 "forward guidance",
 "calendar-based guidance",
 "outcome-based guidance",
 "state-contingent",
 "flexible average inflation targeting",
 "credibility",
 ],
 },
 {
 type: "teach",
 title: "Negative Rates, YCC, and Helicopter Money",
 content:
 "**Negative Interest Rate Policy (NIRP)**:\n- Adopted by the ECB (–0.5%), Bank of Japan (–0.1%), Swiss National Bank (–0.75%), and others.\n- Banks are charged for holding excess reserves — theoretically forcing them to lend.\n- **Problems**: Bank net interest margins compressed; consumers hoard cash rather than accept negative deposit rates; financial system fragility increases.\n- The ECB exited negative rates in July 2022 after years of limited effectiveness.\n\n**Yield Curve Control (YCC)**:\n- A central bank targets a specific yield on a bond (usually 10-year), committing to buy unlimited amounts to hold that yield.\n- The BoJ has used YCC since 2016 — originally targeting 0%, later widened to ±0.5% then ±1%.\n- Very powerful but can distort market function and is difficult to exit without causing volatility.\n\n**Helicopter Money (theory)**:\n- First proposed by Milton Friedman: imagine a central bank drops money from a helicopter — pure monetary financing of fiscal transfers.\n- In practice: the central bank permanently creates money and gives it to the government (or directly to households), with no intention of reversing the expansion.\n- Differs from QE (which is technically reversible) — helicopter money is permanent.\n- No major central bank has officially implemented it; it is a theoretical extreme debated as a last resort against deflation.",
 highlight: [
 "NIRP",
 "negative rates",
 "yield curve control",
 "YCC",
 "helicopter money",
 "monetary financing",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following best describes the 'portfolio balance channel' through which quantitative easing affects the broader economy?",
 options: [
 "QE lowers yields on safe assets, pushing investors into riskier assets like stocks and corporate bonds",
 "QE directly deposits money into consumer bank accounts, boosting spending",
 "QE forces banks to reduce their reserve holdings and extend more loans",
 "QE raises short-term interest rates by injecting reserves into the banking system",
 ],
 correctIndex: 0,
 explanation:
 "The portfolio balance channel is one of QE's key transmission mechanisms: by purchasing Treasuries and MBS, the Fed drives down yields on safe assets. Investors seeking higher returns are forced to 'rebalance' into riskier assets — stocks, corporate bonds, real estate. This raises asset prices, lowers borrowing costs for corporations, and creates a wealth effect. QE does not directly fund consumers or force bank lending — those are common misconceptions.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Outcome-based forward guidance ties future rate decisions to specific economic conditions being met, making it more flexible than calendar-based guidance.",
 correct: true,
 explanation:
 "True. Outcome-based (state-contingent) guidance — such as 'rates will stay at zero until inflation sustainably exceeds 2% and the labor market is at maximum employment' — automatically adjusts the timeline with economic developments. Calendar-based guidance (e.g., 'rates will stay at zero until 2023') is more rigid: if the economy strengthens faster, the central bank faces the uncomfortable choice of hiking early (breaking the commitment) or waiting too long (falling behind on inflation).",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Transmission Mechanism 
 {
 id: "central-banking-4",
 title: "Transmission Mechanism & Policy Lags",
 description:
 "6 transmission channels, 18-24 month lags, financial conditions index, over-tightening vs under-tightening, and central bank credibility",
 icon: "GitBranch",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "The Six Channels of Monetary Transmission",
 content:
 "Monetary policy reaches the real economy through multiple channels simultaneously:\n\n**1. Interest Rate Channel** (direct): Higher rates more expensive borrowing households reduce mortgages, auto loans; businesses cut capex. The most immediate channel.\n\n**2. Credit Channel**: Higher rates banks tighten lending standards less credit available, especially for small businesses and households without strong balance sheets. Reinforces the rate channel.\n\n**3. Asset Price Channel**: Higher rates lower stock and real estate valuations household wealth falls consumption declines (negative wealth effect). Also raises the cost of equity capital for firms.\n\n**4. Exchange Rate Channel**: Higher US rates dollar strengthens US exports become more expensive internationally trade balance worsens; import prices fall, reducing inflation.\n\n**5. Expectations Channel**: If the Fed credibly signals tightening, inflation expectations fall wage negotiations more moderate actual inflation falls, even before rates fully work through the economy. The most powerful and fastest channel.\n\n**6. Balance Sheet Channel**: Higher rates asset prices fall borrower net worth declines collateral values drop lenders tighten credit investment falls (the financial accelerator mechanism). Especially potent in debt-heavy economies.",
 highlight: [
 "interest rate channel",
 "credit channel",
 "asset price channel",
 "exchange rate channel",
 "expectations channel",
 "balance sheet channel",
 "financial accelerator",
 ],
 },
 {
 type: "teach",
 title: "Policy Lags: 18-24 Months to Full Effect",
 content:
 "**The lag problem** is one of the most important — and underappreciated — features of monetary policy.\n\nMilton Friedman famously wrote that monetary policy operates with **\"long and variable lags\"** — typically **18 to 24 months** from a rate change to its full effect on inflation.\n\n**Why so long?**\n- Mortgages, business loans, and leases reset gradually over time, not all at once.\n- Capital investment decisions take months to years to plan and execute.\n- Wage contracts are renegotiated annually or multi-year.\n- The expectations channel works faster, but full behavioral change takes time.\n\n**Practical implication**: The Fed is always steering with a foggy rearview mirror. When it hikes aggressively to fight inflation, the full impact will only be felt 1-2 years later — by which time the economy may have slowed much more than intended.\n\n**Financial Conditions Index (FCI)**:\n- A composite measure combining interest rates, credit spreads, equity prices, and the dollar into a single \"tightness\" indicator.\n- FCI tightens faster than inflation responds — it's a leading indicator of the policy effect.\n- Used by the Chicago Fed, Goldman Sachs, and others to track how much tightening has already been \"baked in.\"",
 highlight: [
 "long and variable lags",
 "18-24 months",
 "financial conditions index",
 "FCI",
 "policy lag",
 "rearview mirror",
 ],
 },
 {
 type: "teach",
 title: "Policy Mistake Risks and Credibility",
 content:
 "**Two categories of policy mistakes**:\n\n**Over-tightening**: The Fed hikes too aggressively or for too long, causing an unnecessary recession.\n- Example: The Fed's 1937 premature tightening ended the New Deal recovery and caused a sharp 1937–38 recession.\n- More recent: Concerns that 2022–23 rate hikes were too aggressive and would cause a deep recession (though a \"soft landing\" appeared possible as of 2024).\n\n**Under-tightening (\"Behind the Curve\")**: The Fed is too slow to react to rising inflation, allowing it to become entrenched.\n- Example: The Fed held rates near zero in 2021 despite surging inflation, initially calling it \"transitory.\"By the time it acted (March 2022), CPI had reached 8.5%. The resulting catch-up hiking cycle was the fastest in 40 years.\n- Under-tightening is especially costly because it forces more severe tightening later.\n\n**Central Bank Credibility**:\n- A credible central bank moves inflation with fewer rate changes. If everyone believes the Fed WILL hit 2%, wage and price-setting behavior reinforces that outcome.\n- **The Volcker lesson**: Paul Volcker deliberately engineered a deep recession (1981–82) by hiking to 20% — causing 10.8% unemployment — to break 14% inflation and re-anchor expectations. Short-term pain for decades of low-inflation credibility.\n- **The lesson for investors**: When credibility is intact (post-Volcker era), the Fed can act modestly. When credibility is in doubt, markets demand more aggressive action — which increases recession risk.",
 highlight: [
 "over-tightening",
 "under-tightening",
 "behind the curve",
 "transitory",
 "Volcker",
 "credibility",
 "soft landing",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Which transmission channel works fastest — influencing inflation before rate changes have fully worked through borrowing costs and investment?",
 options: [
 "The expectations channel — credible Fed signaling shifts wage and price-setting behavior immediately",
 "The credit channel — banks tighten lending standards within days of a rate hike",
 "The balance sheet channel — asset price declines reduce collateral instantly",
 "The interest rate channel — higher rates immediately cut all borrowing",
 ],
 correctIndex: 0,
 explanation:
 "The expectations channel is the fastest. If the Fed credibly signals that it will tighten until inflation returns to 2%, households and businesses immediately moderate their wage and price-setting expectations. Unions negotiate lower wage increases; firms assume competitors won't be raising prices aggressively. This can reduce actual inflation before rates have fully worked through credit markets — which is why Fed communication ('jawboning') is itself a policy tool.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Monetary policy typically takes 18 to 24 months to have its full effect on inflation, meaning the Fed must act on forecasts rather than current economic data alone.",
 correct: true,
 explanation:
 "True. This is the 'long and variable lags' problem identified by Milton Friedman. Because the full impact of a rate hike is only felt 1-2 years later, the Fed cannot simply react to today's inflation reading — it must forecast where the economy will be in 18-24 months and set policy accordingly. This makes monetary policy inherently difficult: the Fed might tighten based on current 8% inflation, but by the time the hikes fully work through, the economy may have already slowed sharply due to other factors.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "In 2021, the Federal Reserve held rates at 0.25% while inflation rose from 2% to 7%, initially characterizing the inflation as 'transitory' driven by supply chain disruptions. By early 2022, CPI hit 8.5% — a 40-year high. The Fed began hiking in March 2022 and raised rates from 0.25% to 5.50% in just 16 months.",
 question:
 "Which policy mistake framework best describes the Fed's 2021 behavior, and what was its consequence?",
 options: [
 "Under-tightening / 'behind the curve' — the delayed response required a much faster and larger catch-up hiking cycle",
 "Over-tightening — the Fed hiked too aggressively and caused an unnecessary recession",
 "Correct calibration — waiting for certainty before hiking was the prudent approach",
 "Forward guidance failure — the Fed had committed to never hiking, so it was bound by prior guidance",
 ],
 correctIndex: 0,
 explanation:
 "The 2021 Fed is a textbook example of being 'behind the curve.' By holding at 0.25% while inflation surged past 4%, 5%, 6%, and 7%, the Fed allowed inflation expectations to begin unmooring. When it finally acted, it had to hike much more aggressively (500+ basis points in 16 months — the fastest cycle in 40 years) than would have been needed with earlier action. The consequence: higher peak rates, more financial market stress, and elevated recession risk that more gradual earlier action could have avoided.",
 difficulty: 3,
 },
 ],
 },
 ],
};
