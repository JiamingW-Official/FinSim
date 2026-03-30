import type { Unit } from "./types";

export const UNIT_MONETARY_POLICY: Unit = {
  id: "monetary-policy",
  title: "Monetary Policy & Central Banking",
  description:
    "Understand how central banks shape the economy through interest rates, money supply, and unconventional tools — and how to trade around policy cycles",
  icon: "",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: Central Bank Mandates ────────────────────────────────────────
    {
      id: "monetary-policy-1",
      title: "Central Bank Mandates",
      description:
        "The Fed's dual mandate, ECB single mandate, Bank of Japan's yield curve control, and inflation targeting frameworks",
      icon: "Landmark",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Federal Reserve's Dual Mandate",
          content:
            "The Federal Reserve — the US central bank — operates under a **dual mandate** established by Congress in the Federal Reserve Reform Act of 1977.\n\nThe two goals:\n- **Price stability**: Keep inflation low and predictable. Since 2012, the Fed has officially targeted **2% PCE inflation** (Personal Consumption Expenditures price index).\n- **Maximum employment**: Support the highest level of employment consistent with stable prices. The Fed does not define a specific unemployment target — it uses a broad set of labor market indicators.\n\n**Why dual?** Most central banks only target inflation. The US dual mandate reflects political history — the Fed was given an employment charge after the Great Depression showed that price stability alone was insufficient.\n\n**Tension between the two**: When unemployment is very low, wage growth accelerates and inflation rises. The Fed must balance — cut rates too aggressively to fight unemployment and inflation surges; hike too hard to fight inflation and unemployment rises.",
          highlight: ["dual mandate", "price stability", "maximum employment", "2% inflation", "PCE"],
        },
        {
          type: "teach",
          title: "ECB Single Mandate and BoJ Yield Curve Control",
          content:
            "Different central banks have different charters — which shapes how they behave.\n\n**European Central Bank (ECB)**:\n- **Single mandate**: Price stability only. The primary objective is keeping euro-area inflation below but close to 2%.\n- Employment is a secondary consideration; the ECB cannot prioritize it over price stability.\n- Consequence: The ECB was slower to stimulate during recessions compared to the Fed.\n\n**Bank of Japan (BoJ)**:\n- Dual mandate (price stability + financial system stability) but dominated by **deflation-fighting**.\n- Introduced **Yield Curve Control (YCC)** in 2016: pins the 10-year Japanese Government Bond (JGB) yield near 0%, then adjusted to ±0.5%, then ±1%.\n- Mechanism: The BoJ buys unlimited bonds to keep yields from rising above the cap.\n- **Why YCC?** Japan has struggled with deflation for 30 years. Low yields encourage borrowing and spending.\n\n**Inflation targeting**: Adopted widely after New Zealand pioneered it in 1990. A central bank announces a specific inflation target and adjusts rates to hit it. Creates accountability and anchors expectations.",
          highlight: ["ECB", "single mandate", "Bank of Japan", "YCC", "yield curve control", "inflation targeting"],
        },
        {
          type: "quiz-mc",
          question:
            "The Federal Reserve's dual mandate requires it to pursue which two objectives?",
          options: [
            "Price stability and maximum employment",
            "Exchange rate stability and fiscal balance",
            "Price stability and financial system stability",
            "Maximum employment and trade balance",
          ],
          correctIndex: 0,
          explanation:
            "The Fed's dual mandate — established by Congress in 1977 — is price stability and maximum employment. The Fed targets 2% PCE inflation and monitors a broad range of labor market indicators. Most other central banks, including the ECB, have a single mandate of price stability only.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Under Yield Curve Control, the Bank of Japan commits to buying unlimited quantities of government bonds to keep yields below a target cap.",
          correct: true,
          explanation:
            "True. YCC is an unlimited commitment — the BoJ stands ready to purchase any quantity of Japanese Government Bonds needed to hold the 10-year yield near its target. This is more powerful than conventional QE because the size is theoretically unlimited, anchoring rates regardless of market pressure.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Inflation in the euro area has risen to 4.2% — well above the ECB's target. Unemployment is also rising in southern Europe and a recession is possible. The ECB faces calls to both fight inflation and support growth.",
          question: "Under its mandate, what must the ECB prioritize?",
          options: [
            "Price stability — the ECB's single mandate requires prioritizing inflation control",
            "Employment — rising unemployment is the more urgent crisis",
            "Both equally — the ECB has the same dual mandate as the Fed",
            "Financial stability — protecting banks comes first",
          ],
          correctIndex: 0,
          explanation:
            "The ECB has a single mandate: price stability. By treaty, keeping inflation close to 2% is the primary objective. Employment and growth are secondary considerations. This is a structural difference from the Fed — the ECB cannot legally prioritize growth over inflation control, which often makes its communication more hawkish.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Monetary Policy Tools ────────────────────────────────────────
    {
      id: "monetary-policy-2",
      title: "Monetary Policy Tools",
      description:
        "Federal funds rate mechanics, open market operations, reserve requirements, the discount window, and forward guidance",
      icon: "Wrench",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Federal Funds Rate: The Master Rate",
          content:
            "The **federal funds rate** is the interest rate at which banks lend reserve balances to each other overnight. It is the Fed's primary conventional policy tool.\n\n**How it works**:\n- The FOMC (Federal Open Market Committee) sets a **target range** (e.g., 5.25%–5.50%).\n- The Fed uses **Interest on Reserve Balances (IORB)** — paying banks interest on reserves held at the Fed — to keep the effective fed funds rate within the target range.\n- When the Fed raises rates, borrowing costs rise across the economy: mortgages, auto loans, corporate bonds, and credit cards all reprice higher.\n\n**Transmission mechanism**:\n1. Fed hikes fed funds rate\n2. Banks raise prime rate and SOFR (Secured Overnight Financing Rate)\n3. Mortgages, business loans, consumer credit become more expensive\n4. Borrowing and spending slow → demand falls → inflation cools\n\n**The lag problem**: Monetary policy operates with \"long and variable lags\" (Milton Friedman's phrase) — rate hikes typically take 12–18 months to fully impact inflation. The Fed is always driving with a foggy rearview mirror.",
          highlight: ["federal funds rate", "FOMC", "IORB", "transmission mechanism", "long and variable lags"],
        },
        {
          type: "teach",
          title: "Open Market Operations, Reserves, and the Discount Window",
          content:
            "Beyond the policy rate, the Fed has several other tools:\n\n**Open Market Operations (OMOs)**:\n- The Fed buys or sells US Treasury securities in the open market to adjust bank reserves.\n- **Buying bonds** → injects reserves → loosens financial conditions.\n- **Selling bonds** → removes reserves → tightens financial conditions.\n- OMOs are how the Fed keeps the fed funds rate within its target range on a day-to-day basis.\n\n**Reserve Requirements**:\n- Banks were historically required to hold a fraction of deposits as reserves.\n- In March 2020, the Fed permanently **reduced reserve requirements to zero** — banks can create loans without a binding reserve constraint. Reserves are now managed through IORB.\n\n**Discount Window**:\n- The Fed acts as **lender of last resort**: banks can borrow directly from the Fed at the **discount rate** (slightly above the fed funds rate).\n- Carries a stigma — using the window signals a bank may be in trouble.\n- During 2023 banking stress (SVB collapse), the Fed created the Bank Term Funding Program (BTFP) to lend at par against underwater bond portfolios.\n\n**Forward Guidance**:\n- Central bank communication about future policy intentions.\n- Example: \"Rates will stay at zero until inflation exceeds 2% for some time.\" This alone moves markets — no rate change needed.",
          highlight: ["open market operations", "reserve requirements", "discount window", "forward guidance", "lender of last resort"],
        },
        {
          type: "quiz-mc",
          question:
            "When the Federal Reserve buys US Treasury securities through open market operations, what is the immediate effect?",
          options: [
            "Bank reserves increase, loosening financial conditions",
            "Bank reserves decrease, tightening financial conditions",
            "The federal funds rate automatically rises",
            "Treasury yields immediately increase",
          ],
          correctIndex: 0,
          explanation:
            "When the Fed buys Treasuries, it credits the selling bank's reserve account at the Fed — injecting reserves into the banking system. More reserves lower the cost of overnight borrowing (federal funds rate) and loosen financial conditions broadly. Selling Treasuries has the opposite effect, draining reserves.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Forward guidance is a monetary policy tool that can move financial markets even without any change to the actual policy interest rate.",
          correct: true,
          explanation:
            "True. Forward guidance shapes market expectations about future rates, which directly affects long-term interest rates today. If the Fed credibly commits to keeping rates at zero for two years, the 2-year Treasury yield will immediately decline — no rate change needed. This makes communication itself a powerful monetary policy instrument.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "The Federal Reserve's 'long and variable lags' concept refers to which challenge?",
          options: [
            "Monetary policy takes 12–18 months to fully affect inflation, making real-time calibration difficult",
            "The FOMC meets only 8 times per year, delaying policy responses",
            "Congress must approve all interest rate decisions, causing political delays",
            "Banks take weeks to pass rate changes through to customers",
          ],
          correctIndex: 0,
          explanation:
            "Milton Friedman's insight was that monetary policy impacts the economy with 'long and variable lags' — typically 12–18 months for a rate change to fully work through to inflation. This means the Fed must act on forecasts, not current data. Over-tightening or over-loosening is common precisely because the full effect is never immediately visible.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Unconventional Policy ────────────────────────────────────────
    {
      id: "monetary-policy-3",
      title: "Unconventional Monetary Policy",
      description:
        "QE mechanics, negative interest rates, yield curve control, Operation Twist, and the BTFP — tools deployed when rates hit zero",
      icon: "Zap",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Quantitative Easing: What It Actually Does",
          content:
            "**Quantitative Easing (QE)** is large-scale asset purchases by a central bank — typically government bonds and mortgage-backed securities — paid for with newly created reserves.\n\n**The mechanics**:\n1. Fed buys $80B/month of Treasuries + $40B of MBS from banks.\n2. Banks receive reserves (credits at the Fed) in exchange.\n3. Term premium on long-term bonds falls — yields decline across the curve.\n4. Lower yields push investors into riskier assets (stocks, corporate bonds, real estate) — the **portfolio balance channel**.\n5. Wealth effect: rising asset prices make households feel richer, boosting spending.\n\n**What QE does NOT do**:\n- It does not directly inject money into the real economy.\n- Banks do not automatically lend out reserves — they are just held at the Fed.\n- If banks are risk-averse (post-2008), reserves pile up without boosting credit.\n\n**Quantitative Tightening (QT)**:\n- The reverse — the Fed lets bonds mature without reinvesting, shrinking its balance sheet.\n- Passively drains reserves; tends to steepen the yield curve.\n- The Fed ran QT in 2018–2019 and again from 2022, causing liquidity stress.",
          highlight: ["quantitative easing", "QE", "portfolio balance channel", "quantitative tightening", "QT", "reserves"],
        },
        {
          type: "teach",
          title: "Negative Rates, Operation Twist, and BTFP",
          content:
            "**Negative Interest Rate Policy (NIRP)**:\n- Adopted by the ECB (–0.5%), Bank of Japan (–0.1%), Swiss National Bank (–0.75%).\n- Banks are charged for holding excess reserves at the central bank — theoretically forcing them to lend.\n- **Problems in practice**: Banks squeezed on net interest margins; consumers hoard cash; financial system fragility.\n- The ECB exited negative rates in July 2022 after years of limited effectiveness.\n\n**Operation Twist**:\n- The Fed sells short-term Treasuries and uses proceeds to buy long-term Treasuries.\n- Result: Short-term yields rise, long-term yields fall — the yield curve flattens.\n- Done in 1961 and again in 2011–2012. Stimulates long-term borrowing (mortgages, corporate bonds) without expanding the balance sheet.\n\n**Bank Term Funding Program (BTFP — 2023)**:\n- Created in March 2023 after Silicon Valley Bank and Signature Bank failed.\n- Allowed banks to pledge underwater Treasuries/MBS as collateral and borrow **at par** (face value, not market value) for up to 1 year.\n- Purpose: Prevent mark-to-market losses from triggering broader bank runs.\n- Showed how unconventional tools evolve with each crisis.",
          highlight: ["NIRP", "negative rates", "Operation Twist", "BTFP", "yield curve control", "balance sheet"],
        },
        {
          type: "quiz-tf",
          statement:
            "Quantitative easing directly puts money into consumers' bank accounts, immediately boosting spending.",
          correct: false,
          explanation:
            "False. QE creates reserves in the banking system — credits in bank accounts held at the Federal Reserve. It does not directly fund consumer spending. The transmission works indirectly: lower yields raise asset prices, creating a wealth effect, and reduce borrowing costs. But if banks don't lend (as post-2008), the real-economy impact is limited.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Operation Twist is best described as which of the following?",
          options: [
            "Selling short-term bonds and buying long-term bonds to flatten the yield curve",
            "Buying all maturities of bonds to expand the Fed's balance sheet",
            "Setting a ceiling on the 10-year yield to control borrowing costs",
            "Purchasing foreign bonds to weaken the dollar",
          ],
          correctIndex: 0,
          explanation:
            "Operation Twist involves selling short-term Treasuries (raising short yields) and using the proceeds to buy long-term Treasuries (lowering long yields). This flattens or twists the yield curve downward at the long end without expanding the overall balance sheet — stimulating long-term borrowing for mortgages and corporate investment.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "The ECB has cut its deposit rate to –0.5%, hoping banks will lend more rather than pay to park reserves. Two years later, bank lending to small businesses has barely increased, and banks are reporting margin compression.",
          question: "Which criticism of negative rate policy does this scenario illustrate?",
          options: [
            "Negative rates damage bank profitability without guaranteeing increased lending, undermining the transmission mechanism",
            "Negative rates are too politically controversial to maintain for long",
            "Banks cannot operate below 0% because of legal constraints",
            "Negative rates cause immediate hyperinflation by creating too much money",
          ],
          correctIndex: 0,
          explanation:
            "This scenario illustrates the core critique of NIRP: it compresses bank net interest margins (banks cannot easily pass negative rates to retail depositors), reducing profitability and capacity to lend. The intended transmission — forcing banks to lend — often doesn't materialize. The ECB's experience showed limited credit growth despite years of negative rates, prompting the policy exit in 2022.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Inflation & Deflation ────────────────────────────────────────
    {
      id: "monetary-policy-4",
      title: "Inflation, Deflation & Expectations",
      description:
        "Quantity theory of money, the Phillips curve and its breakdown, anchored expectations, and Japan's deflation trap",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Quantity Theory of Money and the Phillips Curve",
          content:
            "**Quantity Theory of Money**: MV = PQ\n- **M** = Money supply\n- **V** = Velocity of money (how fast money circulates)\n- **P** = Price level\n- **Q** = Real output\n\nImplication: If M rises faster than Q (and V is stable), prices must rise. This framed monetarist policy — Volcker's Fed targeted money growth to crush 1970s inflation.\n\n**The Phillips Curve**:\n- First described by economist A.W. Phillips (1958): an observed inverse relationship between **unemployment** and **inflation**.\n- Intuition: When unemployment is low, workers have bargaining power → wages rise → firms raise prices → inflation.\n- The simple tradeoff: lower unemployment = higher inflation, and vice versa.\n\n**The breakdown**:\n- In the 1970s, the US had simultaneously high unemployment AND high inflation — **stagflation** — which the classic Phillips curve said was impossible.\n- Milton Friedman and Edmund Phelps had predicted this: the curve only holds in the short run. Long-run, it is vertical at the **NAIRU** (Non-Accelerating Inflation Rate of Unemployment).\n- Post-2009: Ultra-low unemployment (3.5%) without inflation. Post-2021: Inflation surged without unemployment falling first. The curve is now widely seen as unstable.",
          highlight: ["quantity theory of money", "MV=PQ", "Phillips curve", "NAIRU", "stagflation", "velocity"],
        },
        {
          type: "teach",
          title: "Anchored Expectations and Japan's Deflation Trap",
          content:
            "**Inflation expectations** matter as much as current inflation — perhaps more.\n\n**Anchored expectations**: When households and businesses believe inflation will stay near target (2%), wage negotiations and pricing decisions reinforce that outcome. The Fed's credibility anchors expectations.\n- Paul Volcker deliberately engineered a severe recession (1981–82) to break entrenched 1970s inflation expectations. Unemployment hit 10.8%, but inflation fell from 14% to 3%.\n- Once expectations are anchored, mild rate changes can control inflation — the Fed doesn't need to cause a recession every time.\n\n**Unanchored expectations** (the danger): If people expect 5% inflation, they demand 5% wage increases, firms raise prices 5%, and you get 5% inflation. It becomes self-fulfilling.\n\n**Japan's deflation trap**:\n- Japan's 1990s asset bubble collapse led to chronic deflation — falling prices.\n- **Deflation trap mechanics**: Consumers delay purchases expecting lower prices → demand falls → companies cut prices further → companies cut wages → demand falls more.\n- The Japanese \"Lost Decades\" (1990–2020): Nominal GDP barely moved for 30 years despite near-zero rates and multiple rounds of QE.\n- Lesson: Once deflation expectations become entrenched, conventional monetary policy loses traction — you are \"pushing on a string.\"",
          highlight: ["inflation expectations", "anchored expectations", "Volcker", "deflation trap", "Japan", "lost decades", "pushing on a string"],
        },
        {
          type: "quiz-mc",
          question:
            "In the equation MV = PQ, if the money supply (M) doubles while real output (Q) stays constant and velocity (V) is stable, what happens to the price level (P)?",
          options: [
            "The price level doubles",
            "The price level stays the same",
            "The price level falls by half",
            "The price level rises by velocity squared",
          ],
          correctIndex: 0,
          explanation:
            "If MV = PQ and M doubles while V and Q are constant, then P must double to maintain the equation's balance. This is the core monetarist insight: money growth in excess of real output growth leads to inflation. It underpinned Volcker's focus on controlling money supply in the early 1980s.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Phillips curve reliably holds in the long run — policymakers can permanently lower unemployment by accepting higher inflation.",
          correct: false,
          explanation:
            "False. The long-run Phillips curve is vertical at the NAIRU. Friedman and Phelps showed that any short-run tradeoff disappears once inflation expectations adjust. Attempts to keep unemployment permanently below NAIRU by tolerating higher inflation ultimately produce only higher inflation without lower unemployment — as the 1970s stagflation demonstrated.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A country has been in deflation for three years. The central bank cuts rates to zero and launches QE, but prices continue to fall, and consumers keep delaying major purchases. Business investment is near zero despite near-zero borrowing costs.",
          question: "Which concept best describes this situation?",
          options: [
            "A deflation trap — entrenched expectations make conventional monetary policy ineffective",
            "Hyperinflation — too much money printing has destabilized prices",
            "The quantity theory breaking down due to high velocity",
            "Stagflation — simultaneous high unemployment and high inflation",
          ],
          correctIndex: 0,
          explanation:
            "This is a deflation trap, closely mirroring Japan's Lost Decades. When deflation expectations are entrenched, consumers and businesses rationally delay spending (why buy today if it's cheaper tomorrow?). Zero interest rates cannot stimulate demand because real rates remain positive in a deflationary environment. Keynes called this a 'liquidity trap' — monetary policy loses traction and fiscal stimulus becomes essential.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Fed Communication ────────────────────────────────────────────
    {
      id: "monetary-policy-5",
      title: "Fed Communication & Credibility",
      description:
        "FOMC meetings, the dot plot, Beige Book, press conferences, Fed credibility, the Volcker shock versus the Greenspan put",
      icon: "MessageSquare",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "FOMC Meetings, Dot Plot, and Beige Book",
          content:
            "The **Federal Open Market Committee (FOMC)** consists of 12 voting members: 7 Board of Governors (appointed by President) + 5 regional Fed bank presidents on rotation. It meets **8 times per year**.\n\n**Key Fed communications**:\n- **FOMC Statement**: Released at each meeting — announces the policy rate decision with language describing the economic outlook. Markets parse every word.\n- **Summary of Economic Projections (SEP)**: Released quarterly (4 times/year). Includes Fed officials' forecasts for GDP, unemployment, inflation, and — most closely watched — the **dot plot**.\n- **The Dot Plot**: An anonymized scatter chart showing each FOMC member's forecast for where rates should be at year-end for the next 3 years and long-run. Markets price rate paths based on median dots.\n- **Press Conference**: The Fed Chair holds a press conference after each meeting (since 2019). Q&A with reporters can move markets more than the written statement.\n- **Beige Book**: Published 8 times/year, 2 weeks before each FOMC meeting. Qualitative economic summaries from each of the 12 regional Fed districts — used as an anecdotal gauge of economic conditions.\n- **Meeting Minutes**: Released 3 weeks after each FOMC meeting — more detail on the internal debate; can shift market expectations.",
          highlight: ["FOMC", "dot plot", "Beige Book", "Summary of Economic Projections", "press conference", "meeting minutes"],
        },
        {
          type: "teach",
          title: "Volcker Shock vs. the Greenspan Put",
          content:
            "Two contrasting Fed eras illustrate the credibility spectrum:\n\n**Paul Volcker (1979–1987) — Establishing Credibility**:\n- Took over as Fed Chair with inflation at 14% and no one believing the Fed would seriously fight it.\n- Raised rates to **20% in 1981** — the \"Volcker shock.\" Deliberately caused back-to-back recessions.\n- Unemployment peaked at 10.8%. His approval rating was devastated.\n- Result: Inflation fell from 14% to 3%. Credibility restored. Inflation expectations re-anchored at low levels.\n- The lesson: Short-term pain to establish credibility pays off for decades.\n\n**Alan Greenspan (1987–2006) — The Greenspan Put**:\n- Repeatedly cut rates aggressively whenever financial markets stumbled: 1987 crash, 1998 LTCM, 2001 tech bust.\n- Markets came to believe the Fed would always rescue them — the **\"Greenspan put\"** (like an options put protecting against losses).\n- Result: Moral hazard built up; investors took excessive risk knowing the Fed would bail them out.\n- Contributed to the housing bubble that ultimately caused the 2008 financial crisis.\n- **The lesson**: Too much accommodation breeds risk-taking that eventually destabilizes the system.\n\n**Fed credibility**: A credible central bank moves inflation with fewer rate changes because expectations are well-anchored. An incredible one must act more aggressively to get the same result.",
          highlight: ["Volcker shock", "Greenspan put", "credibility", "moral hazard", "20% rates", "expectations"],
        },
        {
          type: "quiz-mc",
          question:
            "The 'dot plot' released in the Fed's Summary of Economic Projections shows what?",
          options: [
            "Each FOMC member's anonymous forecast for appropriate interest rates over the next 3 years",
            "The current level of overnight repo rates in the federal funds market",
            "The Fed's balance sheet breakdown by asset class",
            "Regional economic data from each of the 12 Federal Reserve districts",
          ],
          correctIndex: 0,
          explanation:
            "The dot plot is an anonymized scatter chart where each dot represents one FOMC member's rate forecast for year-end of the current year, next 2 years, and the long run. The median of the dots shows the central tendency of FOMC expectations. Markets use it to price rate paths — a shift in the median dot can significantly move Treasury yields.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The 'Greenspan put' refers to Paul Volcker's policy of aggressively hiking rates to protect against inflation.",
          correct: false,
          explanation:
            "False. The 'Greenspan put' describes Alan Greenspan's practice of cutting rates aggressively whenever financial markets declined sharply — creating an implicit backstop for investors, like a put option. Volcker did the opposite: he hiked rates to 20% to crush inflation, accepting severe economic pain. These two eras represent opposite ends of the Fed credibility spectrum.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "The Fed has been fighting elevated inflation for 18 months with rate hikes. Long-run inflation expectations in the bond market (5-year/5-year forward breakeven) have remained anchored near 2.3%. This is in contrast to the 1970s when long-run expectations rose to 7%+ amid persistent inflation.",
          question: "What does the stability of long-run inflation expectations indicate about current Fed credibility?",
          options: [
            "The Fed's anti-inflation credibility is intact — markets believe inflation will eventually return to target",
            "Markets expect the Fed to give up on its 2% target and accept permanently higher inflation",
            "Bond markets are pricing in deflation despite elevated current inflation",
            "Long-run breakevens are irrelevant because the bond market is inefficient",
          ],
          correctIndex: 0,
          explanation:
            "Anchored long-run inflation expectations are the clearest signal of Fed credibility. When 5Y5Y forward breakevens stay near 2% despite elevated current inflation, it means bond markets believe the Fed will succeed in bringing inflation back to target. This contrasts with the 1970s when expectations became unmoored. Anchored expectations make the Fed's job easier — it needs fewer rate hikes to achieve the same disinflationary effect.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 6: Investment Implications ──────────────────────────────────────
    {
      id: "monetary-policy-6",
      title: "Investment Implications of Rate Cycles",
      description:
        "Asset returns across rate cycles, dollar impact on emerging markets, yield curve trading strategies, and positioning for policy shifts",
      icon: "DollarSign",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Asset Returns Across the Rate Cycle",
          content:
            "Interest rate cycles drive predictable patterns across asset classes. Understanding the cycle is foundational for macro investing.\n\n**Rate hike cycle (tightening)**:\n- **Bonds**: Prices fall as yields rise. Duration risk — longer-maturity bonds fall more. Short-duration bonds outperform.\n- **Stocks**: Initial tolerance (hikes = strong economy), but multiples compress as discount rates rise. Growth stocks (long-duration equities) hurt most — cash flows far in future are discounted more heavily.\n- **Real estate / REITs**: Hurt by higher mortgage rates and rising discount rates. Cap rates expand.\n- **USD**: Typically strengthens — higher US rates attract foreign capital seeking yield.\n- **Gold**: Tends to underperform — opportunity cost of holding non-yielding gold rises.\n\n**Rate cut cycle (easing)**:\n- **Bonds**: Prices rise. Duration is rewarded — go longer.\n- **Growth stocks**: Multiples expand as discount rates fall. Tech/biotech outperform.\n- **Real estate / REITs**: Benefit from lower mortgage rates and expanding valuations.\n- **Gold**: Performs well — lower real rates reduce the opportunity cost of holding gold.\n- **EM equities/debt**: Rally as USD weakens and capital flows to higher-yielding EM assets.\n\n**Timing note**: Markets typically price in rate changes **6–12 months in advance** — buy the anticipation, not necessarily the announcement.",
          highlight: ["rate hike cycle", "duration risk", "rate cut cycle", "discount rate", "growth stocks", "USD"],
        },
        {
          type: "teach",
          title: "Dollar Impact on EM, Yield Curve Trades, and Policy Positioning",
          content:
            "**The Dollar and Emerging Markets**:\n- Many EM countries borrow in USD. When the Fed hikes and USD strengthens:\n  - EM debt servicing costs rise in local currency terms.\n  - Capital outflows accelerate as US rates offer competitive yields.\n  - EM central banks are forced to hike defensively to defend their currencies.\n- **Trifecta of doom for EM**: Rising USD + Rising US rates + Risk-off sentiment = EM crisis (e.g., 2013 Taper Tantrum, 2018 EM selloff, 2022 Pakistan/Sri Lanka).\n\n**Yield Curve Trades**:\n- **Bull steepener**: Long 30Y bonds, short 2Y — wins when the Fed cuts and long rates fall more than short rates.\n- **Bear flattener**: Short 10Y, long 2Y — wins when the Fed hikes aggressively (short rates rise faster).\n- **Curve inversion trade**: Short 2Y / long 10Y positioning ahead of expected pivots — the inversion was extreme in 2022–23, offering a mean-reversion opportunity.\n\n**Positioning for policy shifts**:\n- **Pivot anticipation**: When the Fed signals a pause or cut, rotate from short-duration to long-duration bonds; add gold; reduce USD exposure.\n- **Peak rate indicator**: Inverted yield curve + slowing CPI + rising unemployment = approaching pivot.\n- **Key risk**: Premature pivot pricing — markets have repeatedly priced in cuts that didn't materialize (2022–23 saw this cycle multiple times).",
          highlight: ["EM", "dollar", "taper tantrum", "bull steepener", "bear flattener", "pivot", "yield curve trades"],
        },
        {
          type: "quiz-mc",
          question:
            "When the Federal Reserve begins a rate-cutting cycle, which asset class historically benefits most from the declining discount rate?",
          options: [
            "Long-duration growth stocks — their distant cash flows become more valuable as discount rates fall",
            "Short-duration value stocks — lower rates compress their multiples",
            "Short-term Treasury bills — they directly benefit from rate cuts",
            "Commodity producers — lower rates always cause commodity inflation",
          ],
          correctIndex: 0,
          explanation:
            "Long-duration growth stocks (think: high-growth tech with earnings far in the future) benefit most from rate cuts because their valuations depend heavily on discounting distant cash flows. Lower discount rates make those future cash flows worth more today, expanding P/E multiples. This is why growth stocks outperformed dramatically in the zero-rate era (2009–2021) and underperformed when rates rose sharply in 2022.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Emerging market economies typically benefit when the US Federal Reserve aggressively raises interest rates, as higher US rates signal a strong global economy.",
          correct: false,
          explanation:
            "False. Fed rate hikes generally hurt emerging markets through three channels: (1) a stronger USD increases EM debt-servicing costs on USD-denominated debt, (2) capital flows out of EM toward higher-yielding US assets, and (3) EM central banks must defensively raise their own rates to prevent currency collapse, even if their domestic economies don't warrant tightening. The 2013 Taper Tantrum and 2022 EM selloffs illustrate this dynamic.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "The Fed has hiked rates from 0.25% to 5.50% over 18 months. The yield curve is deeply inverted (2Y yield = 5.3%, 10Y yield = 4.2%). CPI is falling from 9% toward 3.5%. Unemployment is rising from 3.5% toward 4.2%. The Fed just signaled a 'higher for longer' stance.",
          question: "Based on the rate cycle framework, what positioning is most appropriate for an investor anticipating the next policy shift?",
          options: [
            "Begin rotating into long-duration bonds and gold; reduce USD exposure — leading indicators suggest the pivot is approaching",
            "Add more short-duration bonds and USD cash — 'higher for longer' means rates will never fall",
            "Buy EM equities immediately — the Fed pivot is already fully priced into markets",
            "Sell all bonds and move entirely to equities — the strong economy will keep rates high forever",
          ],
          correctIndex: 0,
          explanation:
            "The data pattern — inverted yield curve, falling CPI, rising unemployment — historically precedes Fed pivots by 3–9 months. While the Fed is signaling 'higher for longer,' the leading indicators suggest easing is approaching. The optimal positioning is to begin building long-duration bond exposure (which rallies most on rate cuts) and gold (lower real rates), while reducing USD overweight. The risk is timing — the market may have priced this in, and 'higher for longer' rhetoric can persist longer than expected.",
          difficulty: 3,
        },
      ],
    },
  ],
};
