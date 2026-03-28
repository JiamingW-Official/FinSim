import type { Unit } from "./types";

export const UNIT_FINANCIAL_HISTORY: Unit = {
  id: "financial-history",
  title: "Financial History",
  description:
    "From tulip mania to 2008 crisis — understand financial history, economic schools of thought, and the future of finance",
  icon: "BookOpen",
  color: "#92400e",
  lessons: [
    // ─── Lesson 1: Origins of Modern Finance ─────────────────────────────────────
    {
      id: "fh-1",
      title: "Origins of Modern Finance",
      description:
        "From the Amsterdam Stock Exchange to the petrodollar — trace the birth of modern financial systems and the first speculative bubbles",
      icon: "BookOpen",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Birth of Financial Markets",
          content:
            "The foundations of modern finance were laid in 17th-century Amsterdam — and almost immediately tested by mankind's first speculative mania.\n\n**Amsterdam Stock Exchange, 1602:**\nThe Dutch East India Company (VOC) issued shares to the public, creating the world's first IPO and the world's first formal stock exchange. Shareholders could trade their stakes on the Amsterdam Beurs — a revolutionary concept. The VOC needed capital for multi-year voyages to Asia; individual investors provided it in exchange for a share of profits. This separated ownership from management and created a tradeable claim on future earnings.\n\n**Tulip Mania, 1636–1637:**\nThe world's first recorded speculative bubble didn't involve stocks — it involved flower bulbs. Tulip prices in the Dutch Republic soared to extraordinary levels:\n- Rare Semper Augustus bulbs traded for **10× an average worker's annual wages**\n- Futures contracts on tulip bulbs were traded before the flowers even bloomed\n- At the peak, a single bulb could buy a canal house in Amsterdam\n- When prices collapsed in February 1637, they fell **99%** in weeks\n\n**What tulip mania teaches us:** Speculative manias follow a pattern — new and scarce asset, easy credit, public participation, narrative of permanent high prices — then collapse when buyers exhaust and sentiment shifts. The pattern repeats throughout history.",
          highlight: [
            "Amsterdam Stock Exchange",
            "Dutch East India Company",
            "first IPO",
            "tulip mania",
            "speculative bubble",
            "futures contracts",
          ],
        },
        {
          type: "teach",
          title: "Central Banking & The Gold Standard",
          content:
            "Modern monetary systems evolved over three centuries — from war financing to fiat money.\n\n**Bank of England, 1694:**\nFounded to help William III finance war against France. The Bank lent £1.2M to the government in exchange for the right to issue banknotes. This established the template for central banking: a privileged institution providing government financing in exchange for currency-issuing authority.\n\n**The Gold Standard:**\nFrom the 1870s through 1914, major economies pegged their currencies to gold at fixed rates. This provided price stability and facilitated international trade — but also meant governments couldn't expand money supply in crises.\n\n**Bretton Woods, 1944:**\nAt the end of WWII, 44 nations met in New Hampshire to design the post-war monetary order:\n- The **US dollar** became the global reserve currency\n- All currencies pegged to the dollar; the dollar pegged to **gold at $35/oz**\n- The US held ~75% of global gold reserves, making this credible\n\n**Nixon Shock, 1971:**\nUS spending on Vietnam and Great Society programs created too many dollars abroad. On August 15, 1971, Nixon suspended dollar-gold convertibility — ending Bretton Woods. All major currencies began **floating freely**. This launched the modern FX market ($7.5T/day today) and the fiat money era.\n\n**Petrodollar system, 1973:**\nAfter the OPEC oil embargo, the US negotiated an arrangement with Saudi Arabia: oil would be priced and settled in dollars worldwide in exchange for security guarantees. This entrenched dollar dominance even without the gold backing.",
          highlight: [
            "Bank of England",
            "gold standard",
            "Bretton Woods",
            "$35/oz",
            "Nixon Shock",
            "fiat money",
            "petrodollar",
          ],
        },
        {
          type: "teach",
          title: "Evolution of Stock Exchanges",
          content:
            "From a buttonwood tree to microwave towers transmitting orders in microseconds — the exchange ecosystem transformed over 230 years.\n\n**NYSE, 1792 — The Buttonwood Agreement:**\n24 brokers signed the Buttonwood Agreement under a buttonwood tree on Wall Street, agreeing to trade securities among themselves and charge fixed commissions. This became the New York Stock Exchange. For nearly 180 years it operated as an open outcry floor, with specialists managing order flow in assigned stocks.\n\n**NASDAQ, 1971 — First Electronic Exchange:**\nThe National Association of Securities Dealers Automated Quotations launched as the world's first electronic stock market. No trading floor — quotes were displayed on computer terminals. Initially seen as a second-tier market, NASDAQ became home to technology companies: Apple, Intel, Microsoft all listed there.\n\n**Key milestones:**\n- **1975**: SEC abolished fixed commissions — competition drove costs down dramatically\n- **1997**: SEC's Order Handling Rules forced dealers to publish best prices\n- **1998**: Alternative Trading Systems (ECNs) allowed — fragmentation began\n- **2007**: NYSE-Euronext merger created first trans-Atlantic exchange\n- **Decimalization (2001)**: Tick sizes reduced from 1/8 dollar to 1 cent — narrowed spreads\n\n**Algorithmic trading:**\nBy 2010, algorithmic trading accounted for **70%+ of US equity volume**. High-frequency traders (HFTs) hold positions for milliseconds, profiting from speed advantages. The May 6, 2010 Flash Crash saw the Dow drop 1,000 points in minutes before recovering — a direct consequence of algorithmic market structure.",
          highlight: [
            "NYSE",
            "Buttonwood Agreement",
            "NASDAQ",
            "electronic exchange",
            "algorithmic trading",
            "70% of volume",
            "Flash Crash",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "When did the Bretton Woods system collapse and what triggered it?",
          options: [
            "1971 — Nixon closed the gold window, ending dollar-gold convertibility and launching the floating rate era",
            "1944 — The Bretton Woods conference itself ended the previous gold standard system",
            "1973 — The OPEC oil embargo destroyed confidence in the dollar and forced floating rates",
            "1985 — The Plaza Accord forced dollar devaluation and ended the fixed-rate system",
          ],
          correctIndex: 0,
          explanation:
            "The Bretton Woods system collapsed in 1971 when President Nixon suspended dollar convertibility to gold on August 15, 1971 — the 'Nixon Shock.' Excess dollars abroad (from Vietnam spending and Great Society programs) had made the $35/oz gold peg unsustainable. This event launched the modern floating exchange rate system and gave birth to the modern foreign exchange market.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "During the Dutch tulip mania of 1636–37, futures contracts on tulip bulbs were traded before the flowers had even bloomed.",
          correct: true,
          explanation:
            "True. One of the remarkable features of tulip mania was the development of forward contracts — agreements to buy bulbs at a future date for a fixed price. These contracts changed hands many times before the bulbs were ever delivered, creating a pure speculative market in promises. When the bubble burst in February 1637, many of these contracts became worthless.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A country maintains a gold standard: its currency is pegged at $35 per ounce of gold. It runs large budget deficits to fund wars and social programs, printing more currency than gold reserves support. Foreign governments begin demanding gold in exchange for their dollar holdings.",
          question:
            "What is the most likely outcome if the government maintains the $35/oz peg despite inadequate gold reserves?",
          options: [
            "A currency crisis — foreign redemption demands drain gold reserves, forcing either devaluation or suspension of convertibility",
            "Deflation — the government must shrink the money supply to match gold, causing economic contraction",
            "Hyperinflation — with too much currency chasing the same gold, prices spiral upward",
            "Nothing changes — the gold peg is credible as long as the government commits to it verbally",
          ],
          correctIndex: 0,
          explanation:
            "This is exactly what happened to the US under Bretton Woods. Excess dollars accumulated abroad; France and others began demanding gold. Faced with depleting gold reserves, Nixon chose suspension over devaluation or deflation. The lesson: fixed exchange rate regimes are only sustainable if the anchor country maintains fiscal discipline consistent with the peg. This same dynamic played out in the 1997 Asian Financial Crisis when baht and ringgit pegs collapsed under speculative pressure.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Great Economic Crises ─────────────────────────────────────────
    {
      id: "fh-2",
      title: "Great Economic Crises",
      description:
        "The Great Depression, stagflation, the Asian Financial Crisis — policy failures and their consequences",
      icon: "BookOpen",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Great Depression: Policy Errors in Action",
          content:
            "The Great Depression was not inevitable — it was transformed from a severe recession into a decade-long catastrophe by policy failures at every level.\n\n**The crash, October 1929:**\nBlack Tuesday (October 29) saw the Dow fall over 25% in two days. But the crash itself did not cause the Depression — what followed did.\n\n**The bank failure cascade:**\n- **9,000 banks failed** between 1930–1933\n- Unlike today, there was no deposit insurance — bank failures wiped out depositors entirely\n- The money supply contracted by **33%** (the Great Contraction, per Friedman & Schwartz)\n\n**Policy mistakes:**\n- **Smoot-Hawley Tariff (1930)**: Raised tariffs on 20,000+ imports. Trading partners retaliated. Global trade collapsed **65%**. A recession became global.\n- **Federal Reserve error**: Instead of expanding money supply to offset bank failures, the Fed *raised* interest rates in 1931 to defend the gold standard — deepening the contraction\n- **Hoover's austerity**: Budget cuts during a collapse reduced aggregate demand further\n\n**FDR's New Deal (1933–1938):**\n- **SEC (1934)**: Securities and Exchange Commission — investor protection\n- **FDIC**: Federal deposit insurance — ended bank runs\n- **Glass-Steagall**: Separated commercial and investment banking\n- **Social Security (1935)**: Safety net for the elderly\n\nThe New Deal reformed the system but did not end the Depression. It was WWII spending — government expenditure reaching 40% of GDP — that finally restored full employment.",
          highlight: [
            "Black Tuesday",
            "9,000 bank failures",
            "Smoot-Hawley",
            "Fed raised rates",
            "SEC",
            "FDIC",
            "Glass-Steagall",
            "New Deal",
          ],
        },
        {
          type: "teach",
          title: "Stagflation: When Economics Textbooks Were Wrong",
          content:
            "The 1970s broke a core assumption of post-war economics: that inflation and unemployment could not rise simultaneously. They did.\n\n**OPEC oil embargo, October 1973:**\nArab OPEC members cut oil exports to nations supporting Israel in the Yom Kippur War. Oil prices **quadrupled** from $3 to $12/barrel in months. Since energy costs feed into virtually every product, this was an inflationary supply shock.\n\n**Stagflation (1973–1982):**\n- Economists used the Phillips Curve — which showed an inverse relationship between inflation and unemployment\n- The 1970s produced **high inflation AND high unemployment simultaneously** — the model failed\n- Inflation peaked at **14.8% in April 1980**\n- Unemployment hit 10.8% in November 1982\n- The Dow returned approximately **0% nominally** over the decade — and lost ~70% in real terms\n- BusinessWeek's 1979 cover: *\"The Death of Equities\"*\n\n**The Volcker cure:**\nPaul Volcker, appointed Fed Chair in 1979, chose radical therapy: raise rates until inflation breaks.\n- Fed Funds Rate peaked at **20% in June 1981**\n- Caused a severe double-dip recession (1980 and 1981–82)\n- But it worked: inflation fell from 14% to 3% by 1983\n- The lesson: **inflation expectations are self-fulfilling** — once entrenched, only credible monetary tightening breaks them\n- This set the stage for the great bull market of the 1980s–90s",
          highlight: [
            "OPEC embargo",
            "stagflation",
            "Phillips Curve",
            "14.8% inflation",
            "Volcker",
            "20% interest rates",
            "inflation expectations",
          ],
        },
        {
          type: "teach",
          title: "Asian Financial Crisis & LTCM (1997–1998)",
          content:
            "The late 1990s delivered two connected crises that foreshadowed 2008: currency pegs that couldn't hold and leverage that couldn't survive.\n\n**Asian Financial Crisis, 1997:**\nSeveral Asian economies had pegged their currencies to the US dollar, attracting foreign capital inflows. But current account deficits and hot money flows made the pegs vulnerable.\n\n- **Thai baht, July 2, 1997**: Speculators (including George Soros's fund) sold baht en masse; Thailand's reserves were exhausted; the peg broke, the baht devalued 40%\n- Contagion spread to **Indonesia** (rupiah -80%), **South Korea** (won -50%), **Malaysia**, **Philippines**\n- The IMF provided bailouts with harsh austerity conditions — raising rates during a collapse (controversial; echoed the 1931 Fed error)\n- Indonesia's GDP contracted 13.6% in 1998; years of poverty alleviation reversed overnight\n\n**Key lesson:** Currency pegs are fragile when capital accounts are open. Fixed exchange rates invite speculative attacks when fundamentals diverge from the peg.\n\n**LTCM Collapse, 1998:**\nLong-Term Capital Management had two Nobel Prize winners (Merton & Scholes of Black-Scholes fame) and $125 billion in assets with **$1.25 trillion in derivatives exposure** — 100× leverage.\n- Strategy: arbitrage tiny pricing differences between bonds\n- Russia's August 1998 default caused correlations to blow up — all positions moved against them at once\n- The Fed orchestrated a **$3.6 billion private bailout** by 14 banks to prevent systemic collapse\n- Lesson: **Genius + leverage + correlated positions = disaster**. Models calibrated on history fail in tail events.",
          highlight: [
            "Thai baht",
            "Asian Financial Crisis",
            "currency peg",
            "contagion",
            "LTCM",
            "100× leverage",
            "tail risk",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What was Paul Volcker's peak federal funds rate and why was it necessary?",
          options: [
            "20% in 1981 — to break entrenched inflation expectations after a decade of stagflation",
            "10% in 1979 — a moderate tightening cycle to gradually reduce inflation over several years",
            "15% in 1983 — to defend the dollar after the Plaza Accord currency negotiations",
            "8% in 1980 — the maximum rate the Fed could legally impose under the Federal Reserve Act",
          ],
          correctIndex: 0,
          explanation:
            "Volcker raised the Fed Funds Rate to 20% in June 1981 — an extreme measure required to break inflation expectations that had become deeply entrenched after a decade of stagflation. The strategy worked but caused severe pain: two recessions, 10.8% unemployment. The key insight is that inflation expectations are self-fulfilling — once people expect 14% inflation, wages and prices rise to match. Only a credible, painful shock can reset expectations. Volcker's success set the template for inflation-fighting central banking.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "During the Great Depression, the Federal Reserve raised interest rates in 1931, which deepened the economic contraction.",
          correct: true,
          explanation:
            "True. This is one of the most studied policy errors in economic history. In 1931, to defend the gold standard and prevent gold outflows, the Fed raised interest rates — precisely the opposite of what was needed during a deflationary collapse. Milton Friedman and Anna Schwartz documented this in 'A Monetary History of the United States.' Ben Bernanke, a Depression scholar who became Fed Chair, famously told Friedman at his 90th birthday: 'We won't do it again.' In 2008, the Fed did the opposite — cutting rates to zero and expanding the balance sheet massively.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An economy is experiencing stagflation: inflation at 12%, unemployment at 8%, and slow GDP growth. The central bank must choose between raising rates to fight inflation (which risks deeper recession) or cutting rates to stimulate growth (which risks entrenching inflation further).",
          question:
            "Based on the Volcker precedent, what is the correct policy response to entrenched stagflation?",
          options: [
            "Raise rates aggressively to break inflation expectations, accepting short-term recession as the cost of long-term stability",
            "Cut rates to stimulate growth first, then address inflation once the economy recovers",
            "Maintain current rates and use wage-price controls to suppress inflation without monetary tightening",
            "Depreciate the currency to boost exports and grow out of stagflation through external demand",
          ],
          correctIndex: 0,
          explanation:
            "The Volcker lesson is clear: when inflation expectations are entrenched, gradualism fails. Wage-price controls (tried by Nixon in 1971) suppress prices temporarily but inflation returns when removed. Currency depreciation worsens inflation by raising import prices. The only durable solution is monetary credibility — raising rates until inflation expectations are broken, even at the cost of recession. The short-term pain of recession is preferable to a decade of stagflation. This is why central banks today prioritize inflation credibility so strongly.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Modern Financial Crises ───────────────────────────────────────
    {
      id: "fh-3",
      title: "Modern Financial Crises",
      description:
        "Dot-com mania, the 2008 global meltdown, and the European debt crisis — lessons in complexity and contagion",
      icon: "BookOpen",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Dot-Com Bust (2000–2002): When Narrative Beats Value",
          content:
            "From 1995 to 2000, the internet genuinely transformed the world — but investor expectations ran so far ahead of reality that the correction destroyed $5 trillion in market value.\n\n**The mania:**\n- NASDAQ rose **400%** in 5 years (1995–2000)\n- Companies with no revenue raised hundreds of millions in IPOs\n- Pets.com: raised $82M in its March 2000 IPO, had a beloved sock puppet mascot — bankrupt 9 months later\n- Webvan (online grocery): raised $375M in IPO, spent $1B building warehouses — bankrupt\n- Price-to-sales ratios for internet companies often **exceeded 100×**\n- For unprofitable companies, P/E ratios were literally infinite\n- The mantra: *\"Get big fast\"* — market share mattered; profits were irrelevant\n\n**Newton's warning, ignored:**\nSir Isaac Newton lost £20,000 in the South Sea Bubble of 1720 — equivalent to millions today. He said: *\"I can calculate the motions of the heavenly bodies, but not the madness of people.\"* Rational investors have always struggled to time speculative peaks.\n\n**The bust:**\n- NASDAQ peaked at **5,048 on March 10, 2000**\n- Fell **78% to 1,114** over 2.5 years\n- Many companies went to zero; Amazon fell 90% but survived\n- It took until **2015** — 15 years — for NASDAQ to surpass its 2000 peak\n\n**Key lesson:** The internet was transformative — but investors vastly overpaid and discounted the time required for technology adoption to generate profits. Narrative investing ends when capital gets scarce.",
          highlight: [
            "dot-com bust",
            "NASDAQ -78%",
            "P/E ratios infinite",
            "Pets.com",
            "Webvan",
            "$5T destroyed",
            "profitability matters",
          ],
        },
        {
          type: "teach",
          title: "The 2008 Global Financial Crisis: System Failure",
          content:
            "The 2008 crisis was the most severe financial shock since the Great Depression — rooted in a toxic combination of flawed incentives, complex instruments, and excessive leverage.\n\n**The subprime pipeline:**\nThe originate-to-distribute model meant mortgage brokers had no incentive to assess loan quality:\n1. Mortgages originated (NINJA loans: No Income, No Job, No Assets — still approved)\n2. Packaged into **MBS** (Mortgage-Backed Securities)\n3. Tranched into **CDOs** (Collateralized Debt Obligations) — AAA-rated by agencies paid by issuers\n4. **CDO-squared**: CDOs backed by tranches of other CDOs — extreme complexity\n5. **AIG** sold billions in Credit Default Swaps (CDS) — insurance on CDOs — without adequate capital\n\n**The unraveling:**\n- Bear Stearns: Two hedge funds collapsed in **March 2008** — first major warning sign\n- Fannie/Freddie nationalized **September 7, 2008**\n- **Lehman Brothers bankruptcy: September 15, 2008** — $639B in assets, largest bankruptcy in history; no government bailout\n- Reserve Primary Fund \"broke the buck\" → $200B+ run on money markets\n- Commercial paper markets froze; banks didn't trust each other\n\n**The response:**\n- **TARP**: $700B fiscal injection into banks\n- Fed balance sheet: $900B → $4.5T via Quantitative Easing\n- Zero Interest Rate Policy (ZIRP) held 2008–2015\n- **Dodd-Frank (2010)**: Stress tests, Volcker Rule, resolution plans\n- Dow fell **54%** peak to trough; $17T in household wealth destroyed",
          highlight: [
            "CDO-squared",
            "AIG",
            "Lehman Brothers",
            "$639B bankruptcy",
            "TARP",
            "QE",
            "Dodd-Frank",
            "54% decline",
          ],
        },
        {
          type: "teach",
          title: "European Debt Crisis (2010–2012): Contagion and \"Whatever It Takes\"",
          content:
            "While the US recovered from 2008 with aggressive monetary policy, Europe descended into a sovereign debt crisis that threatened to break apart the eurozone.\n\n**The PIIGS crisis:**\n- **Portugal, Ireland, Italy, Greece, Spain** (PIIGS) had accumulated unsustainable debt loads\n- The eurozone's fatal flaw: a shared currency without shared fiscal policy or debt mutualization\n- Greece was worst: debt at **180% of GDP**; government had hidden deficits via swaps arranged by Goldman Sachs\n- Investors demanded rising interest rates to hold PIIGS bonds → self-fulfilling solvency concern\n\n**The Greek haircut:**\n- 2012: Private creditors accepted a **50% haircut** (debt restructuring) on Greek bonds\n- The largest sovereign debt restructuring in history at the time\n- IMF/EU/ECB (Troika) provided bailouts in exchange for harsh austerity — cuts to pensions, wages, services\n- Debate raged: Keynesians argued austerity during recession was counterproductive (it was — Greek GDP fell 25%)\n\n**Draghi's \"Whatever It Takes\" speech, July 26, 2012:**\nECB President Mario Draghi gave one of the most consequential speeches in financial history. Six words stabilized a multi-year crisis:\n*\"Within our mandate, the ECB is ready to do whatever it takes to preserve the euro. And believe me, it will be enough.\"*\n- Announced Outright Monetary Transactions (OMT) — ECB would buy unlimited sovereign bonds\n- Bond yields in Italy and Spain collapsed within days\n- No OMT purchases were ever actually needed — the credible threat was sufficient\n- **Lesson:** Central bank communication and credibility can be as powerful as actual intervention",
          highlight: [
            "PIIGS",
            "Greek haircut",
            "50% restructuring",
            "Draghi",
            "whatever it takes",
            "OMT",
            "eurozone",
            "austerity debate",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What was the size of the Lehman Brothers bankruptcy filing in September 2008?",
          options: [
            "$639 billion — the largest bankruptcy in US history at the time",
            "$158 billion — smaller than Bear Stearns but still systemically significant",
            "$1.2 trillion — including off-balance-sheet vehicles and derivatives exposure",
            "$85 billion — approximately the same size as the AIG government rescue package",
          ],
          correctIndex: 0,
          explanation:
            "Lehman Brothers filed for bankruptcy with $639 billion in assets on September 15, 2008 — the largest corporate bankruptcy in US history at the time. The decision not to bail out Lehman (unlike Bear Stearns in March 2008 or AIG days later) sent shockwaves through global markets. Money market funds holding Lehman debt 'broke the buck,' triggering a massive run and freezing commercial paper markets. The Lehman bankruptcy marked the acute phase of the crisis.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A CDO-squared is a CDO whose collateral consists of tranches from other CDOs, creating an additional layer of complexity and obscuring the underlying credit risk.",
          correct: true,
          explanation:
            "True. CDO-squared (CDO²) took the already complex CDO structure and added another layer: instead of pooling mortgages or loans directly, it pooled tranches from other CDOs. This extreme complexity made it nearly impossible for even sophisticated investors to assess the underlying risk. Rating agencies modeled these instruments assuming local housing markets were uncorrelated — they were not. When housing prices fell nationally, default correlations 'went to 1' and CDO² structures experienced catastrophic losses. The opacity of these instruments amplified the 2008 crisis by making it impossible to identify who held what risk.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It's September 2008. Lehman Brothers has just filed for bankruptcy. Money market funds that held Lehman debt are 'breaking the buck' — falling below $1 NAV. Commercial paper markets are freezing because lenders don't trust borrowers' balance sheets. Interbank lending rates (LIBOR) spike 3× overnight.",
          question:
            "What is the systemic risk here and why does it threaten the real economy?",
          options: [
            "Credit market freeze: corporations fund daily operations with commercial paper; if markets freeze, profitable companies can't make payroll or pay suppliers",
            "Stock market crash only: falling equity prices reduce household wealth but don't affect corporate operations or bank lending",
            "Currency risk: dollar strength from capital flight into Treasuries makes US exports uncompetitive",
            "Commodity price collapse: lower growth expectations reduce oil and metals demand, hurting commodity exporters",
          ],
          correctIndex: 0,
          explanation:
            "The systemic danger of 2008 was not stock market losses — it was the freezing of credit markets that fund ordinary economic activity. Commercial paper is short-term debt (2–270 days) used by large companies to fund operations — payroll, inventory, daily expenses. When money markets froze, even profitable companies faced a liquidity crisis with no connection to subprime mortgages. Ford Motor Company had to draw down its entire revolving credit facility as a precaution. The real economy threat was transmission from financial markets to main street through the credit channel — which is why TARP and QE targeted banks specifically.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Economic Schools of Thought ───────────────────────────────────
    {
      id: "fh-4",
      title: "Economic Schools of Thought",
      description:
        "Keynes vs Friedman vs Hayek — understand the competing frameworks that shape policy responses to crises",
      icon: "BookOpen",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Classical vs Keynesian Economics",
          content:
            "The central debate in economics — whether markets self-correct or require government intervention — was transformed by the Great Depression.\n\n**Classical economics (pre-Keynes):**\n- **Say's Law**: Supply creates its own demand — if goods are produced, income is generated to buy them; markets always clear\n- Recessions are temporary; wages and prices will adjust downward until equilibrium is restored\n- Government intervention only distorts natural adjustment\n- Implication: recessions should be waited out, not fought\n\n**Keynesian revolution — The General Theory (1936):**\nJohn Maynard Keynes wrote his masterwork during the Great Depression, explaining why markets could get stuck:\n- **Demand-side failures**: In recessions, businesses don't invest and consumers don't spend — even at low interest rates\n- **Paradox of thrift**: What's rational for individuals (saving more) is catastrophic in aggregate (reduces demand)\n- **Liquidity trap**: At zero interest rates, monetary policy becomes ineffective — people hoard cash, not invest\n- **Keynesian multiplier**: Government spending of $1 generates more than $1 of economic activity (through rounds of re-spending)\n- **Animal spirits**: Investment decisions are driven by confidence and sentiment, not just rational calculation\n\n**The policy implication:**\nWhen the private sector fails to spend, governments must fill the gap through fiscal stimulus (spending and/or tax cuts) — even if it means running deficits. \"In the long run we are all dead.\"\n\nKeynes directly influenced the New Deal, the post-war welfare state, and every recession response since.",
          highlight: [
            "Say's Law",
            "Keynes",
            "liquidity trap",
            "Keynesian multiplier",
            "animal spirits",
            "fiscal stimulus",
            "paradox of thrift",
          ],
        },
        {
          type: "teach",
          title: "Monetarism and Supply-Side Economics",
          content:
            "Two counter-revolutions challenged Keynesian dominance — one focused on money, the other on incentives.\n\n**Monetarism — Milton Friedman:**\nFriedman's challenge to Keynes, developed at the University of Chicago:\n- **Inflation is always and everywhere a monetary phenomenon** — caused by too much money chasing too few goods\n- The Great Depression was caused by the Fed *contracting* the money supply — not by a lack of fiscal stimulus\n- Central banks should follow **rules** (steady money growth) rather than discretionary policy\n- Timing lags make activist fiscal policy destabilizing: stimulus hits when the economy is already recovering\n- **Natural rate of unemployment**: There is a structural unemployment rate below which stimulus only creates inflation\n\nFriedman won the 1976 Nobel Prize. His analysis of the Great Depression became the dominant view (Bernanke's Fed acted accordingly in 2008).\n\n**Supply-side economics — Reagan & Thatcher:**\nThe 1980s policy revolution:\n- **Laffer Curve**: At 0% tax rate, revenue = $0; at 100% rate, revenue = $0; somewhere between is an optimal rate. If rates are above the optimum, cutting taxes can *increase* revenue by stimulating activity\n- Reagan's 1981 tax cuts: top rate from 70% to 28%\n- Thatcher: privatization, union reform, deregulation\n- Argument: high taxes and regulation suppress investment and entrepreneurship; cutting them unlocks growth\n\n**The debate continues:** Supply-side benefits were real (1980s expansion) but inequality widened significantly. \"Trickle-down\" economics remains controversial — growth from tax cuts has rarely paid for itself in full.",
          highlight: [
            "Milton Friedman",
            "monetarism",
            "money supply",
            "Laffer Curve",
            "supply-side",
            "Reagan",
            "Thatcher",
            "natural rate",
          ],
        },
        {
          type: "teach",
          title: "Modern Schools: MMT, Austrian, New Keynesian",
          content:
            "Contemporary economics encompasses sharply divergent schools — each offering different policy prescriptions.\n\n**Modern Monetary Theory (MMT):**\n- A government that issues its own currency **can never run out of money** — it simply creates more\n- The only constraint on spending is inflation — not bond market vigilance or debt sustainability\n- Taxes don't fund spending; they drain money from the economy and control inflation\n- Implications: Deficits are not inherently dangerous for currency-issuing nations (US, Japan, UK — not eurozone members)\n- Critics: Ignores inflationary risks; undermines fiscal discipline; the 2021–22 inflation surge following COVID stimulus is cited as validation of critics\n\n**Austrian School (Hayek):**\n- **Price signals** contain all the information needed to coordinate a complex economy — central planning distorts these signals\n- Boom-bust cycles are caused by **credit expansion** that sends false price signals, encouraging malinvestment\n- Government intervention and central banking amplify cycles rather than smoothing them\n- **Against stimulus**: Recessions liquidate malinvestments and restore healthy capital allocation; stimulus just delays the adjustment\n- Hayek vs Keynes: The great 20th century economics debate (see the viral \"Fear the Boom and Bust\" rap videos)\n\n**New Keynesian synthesis:**\n- Combines Keynesian demand-side insights with rational expectations and microeconomic foundations\n- **Sticky prices and wages**: Adjustment is slow, so demand shocks cause real output changes (not just prices)\n- Supports activist monetary policy (inflation targeting) but more skeptical of fiscal discretion than old Keynesians\n- Dominant framework in most central banks today (Taylor Rule, inflation targeting)",
          highlight: [
            "Modern Monetary Theory",
            "MMT",
            "Austrian school",
            "Hayek",
            "price signals",
            "New Keynesian",
            "inflation targeting",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "What is the \"liquidity trap\" in Keynesian economics and why does it matter for policy?",
          options: [
            "When interest rates hit zero, monetary policy becomes ineffective because people hoard cash — only fiscal policy can stimulate demand",
            "When banks have excess reserves, they are unwilling to lend, trapping liquidity in the financial system",
            "When inflation is too low, real interest rates become positive even at zero nominal rates, reducing investment",
            "When currency appreciates, exports fall and imports rise, trapping capital in the domestic economy",
          ],
          correctIndex: 0,
          explanation:
            "The liquidity trap occurs when interest rates fall to zero (the Zero Lower Bound) and monetary policy loses traction. At zero rates, holding cash vs. holding bonds is equally attractive — people and banks hoard money rather than investing. Cutting rates further is impossible in conventional terms. Keynes used this to argue that fiscal policy (government spending) becomes the only effective stimulus tool when monetary policy is exhausted. Japan experienced this from the 1990s; the US, Europe, and Japan all hit the ZLB after 2008. Quantitative Easing was the unconventional monetary response to try to escape the trap.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Laffer Curve implies that at both a 0% tax rate and a 100% tax rate, government tax revenue would be zero, with an optimal revenue-maximizing rate somewhere between these extremes.",
          correct: true,
          explanation:
            "True. The Laffer Curve, popularized by economist Arthur Laffer (who allegedly drew it on a napkin for Dick Cheney in 1974), makes this mathematically obvious point: at 0% taxation, revenue is zero; at 100% taxation, nobody would work (since all income would be confiscated), so revenue would also approach zero. Therefore, there must be a revenue-maximizing rate between 0% and 100%. The policy debate is entirely about where the current rate sits relative to that optimum. Supply-side advocates claimed 1970s rates of 70%+ were above the optimum; critics disputed this, pointing to the deficit expansion after Reagan's cuts.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An economy is in a severe recession. Unemployment is 12%. Interest rates are already at 0% (the Zero Lower Bound). The central bank has exhausted conventional monetary tools. Inflation is near 0%.",
          question:
            "Which economic school of thought would recommend government deficit spending as the primary policy response?",
          options: [
            "Keynesian — governments must fill private demand shortfalls via fiscal stimulus, especially when monetary policy is at the ZLB",
            "Austrian — the recession is liquidating malinvestments; government should allow adjustment without interference",
            "Monetarist — the central bank should use quantitative easing and money printing to restore growth through the monetary channel",
            "Supply-side — cut marginal tax rates to incentivize investment and labor supply, restoring growth from the supply side",
          ],
          correctIndex: 0,
          explanation:
            "This scenario describes the classic liquidity trap that Keynes analyzed. With interest rates at zero, Keynesians argue that monetary policy cannot stimulate — the 'pushing on a string' problem. The prescription is fiscal expansion: government spending directly increases aggregate demand, with a multiplier effect. This is exactly what the Obama stimulus (ARRA, 2009) attempted. Austrian economists would oppose any stimulus. Monetarists would try unconventional QE. Supply-siders would prefer tax cuts. The Keynesian view dominated post-2008 policy, though the debate about multiplier size and stimulus effectiveness continues.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Future of Finance ─────────────────────────────────────────────
    {
      id: "fh-5",
      title: "Future of Finance",
      description:
        "De-dollarization, CBDCs, decentralized finance, and climate finance — the forces reshaping the global financial system",
      icon: "BookOpen",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "De-Dollarization and Geopolitical Finance",
          content:
            "The US dollar's dominance has been the defining feature of global finance since 1944 — but geopolitical shifts are testing that dominance in ways not seen since Bretton Woods.\n\n**The dollar's exorbitant privilege:**\nFrench Finance Minister Valéry Giscard d'Estaing coined the term in the 1960s. As the global reserve currency:\n- The US can run large current account deficits without a currency crisis\n- Dollar-denominated debt is cheaper for the US government\n- Global demand for dollars means the US effectively exports inflation\n- ~**60% of global foreign exchange reserves** remain in dollars (down from 71% in 2000)\n\n**Sanctions as a catalyst:**\nThe 2022 freezing of ~$300 billion in Russian central bank reserves following the Ukraine invasion accelerated de-dollarization concerns:\n- If the US can freeze a G20 country's reserves, the dollar's \"safe\" status for adversaries is gone\n- China, Russia, India, Brazil (BRICS) accelerating bilateral trade in non-dollar currencies\n- Saudi Arabia exploring yuan-denominated oil sales (undermining petrodollar)\n\n**China's digital yuan (e-CNY):**\n- Central Bank Digital Currency deployed since 2021; 260M+ wallets\n- Allows China to track spending, enable programmable money, and potentially settle cross-border trades without SWIFT\n- Geopolitical tool: sanctions-resistant payment rails for countries that want to reduce dollar dependence\n\n**The counterargument:** The dollar's dominance is self-reinforcing — deep liquid markets, rule of law, no viable alternative. Euro (20%), yen (6%), yuan (2.6%) are far behind. Dollar dominance may erode slowly over decades, not collapse suddenly.",
          highlight: [
            "de-dollarization",
            "exorbitant privilege",
            "60% of reserves",
            "BRICS",
            "Russian reserves frozen",
            "e-CNY",
            "petrodollar",
          ],
        },
        {
          type: "teach",
          title: "CBDCs, DeFi & The Future of Money",
          content:
            "Two parallel movements are challenging traditional banking: government-issued digital currencies and permissionless decentralized finance.\n\n**Central Bank Digital Currencies (CBDCs):**\n- **130+ countries** are exploring or piloting CBDCs (as of 2024) — representing 98% of global GDP\n- China's e-CNY: most advanced large-economy CBDC, 260M wallets, used in major cities\n- Bahamas' Sand Dollar, Jamaica's JAM-DEX: already live\n- US: Federal Reserve studying digital dollar but no deployment decision\n\n**Why CBDCs matter:**\n- **Programmable money**: Governments could set expiry dates on stimulus, restrict purchases, implement negative rates automatically\n- **Financial inclusion**: 1.4B unbanked adults globally could access financial services via mobile phone\n- **Disintermediation**: If CBDCs pay interest, commercial banks lose deposits — restructuring banking\n- **Privacy concern**: CBDCs enable unprecedented government surveillance of transactions\n\n**Decentralized Finance (DeFi):**\n- Smart contracts on Ethereum enable lending, borrowing, trading, derivatives without intermediaries\n- Total Value Locked (TVL) in DeFi peaked at $180B in 2021, fell to ~$50B after crypto winter\n- Key innovation: **composability** — protocols interlock like Lego blocks\n- Key risk: smart contract bugs, oracle manipulation, regulatory uncertainty\n\n**The tension:** CBDCs represent state-controlled digital money; crypto/DeFi represents permissionless alternatives. The outcome of this tension will shape the financial system of the 2030s.",
          highlight: [
            "CBDC",
            "130 countries",
            "programmable money",
            "financial inclusion",
            "DeFi",
            "decentralization",
            "e-CNY",
          ],
        },
        {
          type: "teach",
          title: "Climate Finance and ESG",
          content:
            "Climate change is creating a new layer of financial risk — and a new multi-trillion dollar investment opportunity.\n\n**Paris Agreement financial flows:**\nThe 2015 Paris Agreement included commitments for developed nations to mobilize **$100 billion/year** for developing nations' climate transition — a target not consistently met, driving tensions in global climate negotiations.\n\n**Green bonds and transition finance:**\n- **Green bonds**: Debt instruments where proceeds fund environmental projects\n- Global issuance reached **$500 billion+ in 2023**, growing ~25%/year\n- Corporate, sovereign, and supranational issuers\n- **Transition bonds**: Fund decarbonization of high-emission industries (steel, cement, shipping)\n\n**Stranded asset risk:**\n- If climate policies tighten as scientists recommend, **$1T+ of fossil fuel assets** could become \"stranded\" — uneconomic before expected end of life\n- Coal faces this now; oil and gas face it over longer horizons\n- Investors who hold these assets face write-downs\n- The \"carbon budget\" concept: only so much more CO₂ can be burned within 1.5°C limits\n\n**ESG investing and regulation:**\n- **SEC climate disclosure rules (2024)**: Large public companies must disclose climate-related risks and Scope 1/2 emissions\n- **ISSB (International Sustainability Standards Board)**: Global ESG reporting standards adopted by 20+ jurisdictions\n- ESG investing grew to $35T+ in AUM (2020) before backlash and \"greenwashing\" concerns\n- Key tension: ESG definitions vary widely; returns evidence mixed; politicization (anti-ESG laws in some US states)\n\n**The bottom line for investors:** Climate risk is financial risk. Whether through regulation, physical damage, or consumer preferences — carbon exposure has financial consequences that markets are beginning to price.",
          highlight: [
            "green bonds",
            "$500B issuance",
            "stranded assets",
            "SEC climate disclosure",
            "ISSB",
            "ESG",
            "Paris Agreement",
            "transition finance",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Which country has deployed the largest Central Bank Digital Currency (CBDC) to date?",
          options: [
            "China — the e-CNY (digital yuan) has 260 million wallets and is active in major cities",
            "The United States — the digital dollar has been piloted through the Federal Reserve's FedNow system",
            "Sweden — the e-Krona was the first CBDC tested by a major developed economy",
            "The Bahamas — the Sand Dollar was the first live CBDC globally",
          ],
          correctIndex: 0,
          explanation:
            "China's e-CNY (digital yuan) is by far the largest CBDC deployment globally, with 260 million wallets as of 2024 and active use in dozens of major cities. While the Bahamas' Sand Dollar was indeed the first fully live CBDC (2020), it serves a tiny population. Sweden's e-Krona remains in pilot phase. The US Federal Reserve has not deployed a CBDC — FedNow is an instant payment rail between banks, not a retail CBDC. China's scale reflects both its technological capacity and its strategic interest in developing dollar-alternative payment infrastructure.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The US dollar still represents approximately 60% of global foreign exchange reserves, despite two decades of gradual de-dollarization.",
          correct: true,
          explanation:
            "True. According to IMF COFER data, the US dollar accounted for approximately 58-60% of disclosed global foreign exchange reserves as of 2023-2024 — down from 71% in 2000 but still dominant. The euro is second at ~20%, followed by yen (~6%), pound (~5%), and yuan (~2.6%). Despite significant geopolitical pressure to reduce dollar dependence, no viable alternative reserve currency has emerged. The dollar's dominance reflects the depth of US financial markets, the rule of law, and network effects — all of which are difficult to replicate quickly.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is 2035. Three trends have accelerated: (1) China, Russia, Brazil, and India settle 40% of trade in non-dollar currencies; (2) 50 countries have launched retail CBDCs; (3) DeFi protocols hold $2T in assets. The US dollar's share of global reserves has fallen to 45%.",
          question:
            "Which outcome best describes the likely structure of the global monetary system in this scenario?",
          options: [
            "A multipolar monetary system with the dollar as primus inter pares — still dominant but sharing reserve status with yuan, euro, and digital currencies",
            "A complete dollar collapse — the end of American financial power and default on US sovereign debt",
            "A return to gold standard — with the dollar's instability forcing nations back to commodity-backed currencies",
            "Full de-dollarization — the yuan replaces the dollar as the sole global reserve currency",
          ],
          correctIndex: 0,
          explanation:
            "Historical precedent suggests a gradual transition to multipolarity rather than abrupt replacement. The British pound's decline as a reserve currency took 50+ years (1920s–1970s) despite two world wars, multiple economic crises, and empire collapse. Reserve currency transitions are slow because they require not just an alternative but deep, liquid, accessible markets with credible legal frameworks. In the described scenario, the most likely outcome is a multipolar system — the dollar remaining important but sharing the stage with other currencies and potentially digital alternatives. This is the direction most analysts see as most probable: slow erosion, not sudden collapse.",
          difficulty: 3,
        },
      ],
    },
  ],
};
