import { Unit } from "./types";

export const UNIT_CREDIT_ANALYSIS_ADVANCED: Unit = {
  id: "credit-analysis-advanced",
  title: "Advanced Credit Analysis",
  description:
    "Master distressed debt, credit cycles, CDS, and covenant analysis for sophisticated credit investing",
  icon: "AlertTriangle",
  color: "#F59E0B",
  lessons: [
    {
      id: "distressed-debt-investing",
      title: "Distressed Debt Investing",
      description:
        "Understand how investors profit from financially troubled companies through debt restructuring",
      icon: "AlertTriangle",
      xpReward: 120,
      difficulty: "advanced",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "What Is Distressed Debt?",
          content:
            "Distressed debt refers to bonds or loans of companies experiencing financial difficulty. The market convention defines distressed as bonds trading below 80 cents on the dollar (a significant price discount) or yielding more than 1,000 basis points (10%) above comparable Treasury securities. At these levels, the market is pricing in a meaningful probability of default or restructuring. Distressed debt sits at the intersection of credit investing and event-driven strategies — investors buy obligations they believe will recover more value than the current price implies.",
          highlight: [
            "Below 80 cents on the dollar",
            "Yields > 1,000 bps over Treasuries",
            "Bankruptcy or restructuring risk",
          ],
        },
        {
          type: "teach",
          title: "Why Companies Become Distressed",
          content:
            "Distress arises from three root causes. Operational problems: declining revenues, margin compression, losing competitive position, technological disruption, or failed acquisitions. Liquidity problems: inability to service near-term debt maturities even with viable long-term business, tight covenant headroom, or frozen capital markets. Structural problems: too much leverage from an LBO or acquisition that cannot be serviced at any reasonable earnings level. Understanding the root cause is critical — operational distress may require a more fundamental restructuring, while liquidity distress may need only a debt exchange or maturity extension.",
          highlight: [
            "Operational: declining competitive position",
            "Liquidity: near-term maturity wall",
            "Structural: over-leveraged balance sheet",
          ],
        },
        {
          type: "teach",
          title: "Types of Distressed Investors",
          content:
            "Different investors approach distressed situations with different goals. Loan-to-own (or lend-to-own) funds intentionally purchase debt with the goal of converting it to equity ownership through a restructuring — they seek to run the business post-bankruptcy. Trading-oriented distressed funds buy bonds expecting price recovery without taking control; they sell when the price rebounds after a restructuring announcement. Vulture funds focus on litigation and aggressive claims. The critical concept is the fulcrum security: the debt tranche where enterprise value is exhausted. Holders of the fulcrum security receive equity in the reorganized company — making it the most valuable position to own.",
          highlight: [
            "Loan-to-own: debt → equity conversion",
            "Trading: buy cheap, sell on recovery",
            "Fulcrum security gets equity in reorg",
          ],
        },
        {
          type: "teach",
          title: "Bankruptcy Process: Chapter 11",
          content:
            "U.S. Chapter 11 bankruptcy is a reorganization (not liquidation) allowing companies to restructure while continuing operations. Key mechanics: automatic stay immediately halts all creditor collection actions. DIP (debtor-in-possession) financing provides new liquidity with super-priority over existing debt. Pre-packaged bankruptcies have a plan negotiated before filing — faster (60–90 days) and cheaper. Traditional Chapter 11 can take 1–3 years. The plan of reorganization distributes value to claimants in absolute priority order: secured → senior unsecured → subordinated → equity. A cramdown allows a plan to be confirmed over dissenting creditor classes if it is 'fair and equitable.'",
          highlight: [
            "Automatic stay stops creditor actions",
            "DIP financing: super-priority new money",
            "Absolute priority: secured first",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A company's enterprise value is estimated at $400M. It has $300M in secured loans, $200M in senior unsecured bonds, and $100M in subordinated notes. Which tranche is the fulcrum security?",
          options: [
            "Secured loans — they are fully covered by the $400M enterprise value",
            "Senior unsecured bonds — enterprise value runs out in this tranche",
            "Subordinated notes — they receive equity in all restructurings",
            "Equity — shareholders always retain some value in Chapter 11",
          ],
          correctIndex: 1,
          explanation:
            "The $400M enterprise value fully covers the $300M secured loans (leaving $100M). It then partially covers the $200M senior unsecured bonds — value runs out inside this tranche, making senior unsecured the fulcrum security. Fulcrum holders receive equity in the reorganized company. The subordinated notes and equity receive nothing.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In a Chapter 11 bankruptcy, the automatic stay prevents secured creditors from immediately seizing their collateral.",
          correct: true,
          explanation:
            "Correct. The automatic stay halts virtually all creditor actions upon bankruptcy filing — including secured creditors attempting to foreclose on collateral. Secured creditors must petition the bankruptcy court for 'relief from the automatic stay' to pursue their collateral, which is typically only granted when the collateral is not needed for reorganization.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Recovery Rates by Seniority",
          content:
            "Historical recovery rates vary significantly by debt seniority. Based on Moody's long-run data: senior secured loans recover approximately 80% of face value. Senior unsecured bonds recover approximately 45%. Subordinated/junior debt recovers approximately 25%. Senior secured notes fall between loans and unsecured bonds at roughly 60–65%. These averages mask wide dispersion — asset-heavy industries (steel, real estate) see higher recoveries while asset-light businesses (airlines, retail) often see lower. The variance around these means is large: individual recoveries range from near zero to par. Recovery analysis drives distressed debt valuation alongside probability of default.",
          highlight: [
            "Senior secured loans: ~80% recovery",
            "Senior unsecured bonds: ~45% recovery",
            "Subordinated debt: ~25% recovery",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing a distressed retailer with $500M enterprise value. The capital structure has: $200M first-lien term loan (secured), $350M senior unsecured notes, and $150M subordinated PIK notes. The company files for Chapter 11.",
          question:
            "Based on absolute priority and typical restructuring outcomes, what is the most likely outcome for the subordinated PIK noteholders?",
          options: [
            "They receive par plus accrued interest as a priority claim",
            "They receive approximately 25 cents on the dollar per historical averages",
            "They receive nothing as enterprise value is exhausted before reaching them",
            "They receive equity in the reorganized company as the fulcrum security",
          ],
          correctIndex: 2,
          explanation:
            "Enterprise value of $500M fully covers the $200M first-lien loan (leaving $300M) but only partially covers the $350M senior unsecured notes ($300M/$350M = ~86 cents on dollar). The senior unsecured notes are the fulcrum security and will receive equity. The subordinated PIK notes receive nothing — absolute priority means they are not paid until all senior claims are satisfied in full, which cannot happen here.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "credit-cycles",
      title: "Credit Cycle Analysis",
      description:
        "Learn to identify where we are in the credit cycle and how to position across different phases",
      icon: "TrendingDown",
      xpReward: 110,
      difficulty: "advanced",
      duration: 13,
      steps: [
        {
          type: "teach",
          title: "The Four Phases of the Credit Cycle",
          content:
            "Credit markets move through a well-documented four-phase cycle driven by lending standards, risk appetite, and defaults. Expansion: spreads tighten, lending standards loosen, issuance surges, defaults fall. Peak: covenant protections erode to minimum, leverage multiples reach historical highs, investors accept lowest spreads relative to risk, credit quality of new issuance deteriorates. Contraction: a trigger event (rate shock, recession, fraud) causes spreads to widen rapidly, refinancing becomes difficult, the weakest borrowers default. Trough: spreads reach maximum, distressed opportunities abound, investors begin to see value, defaults peak and begin declining. Each phase creates different optimal strategies.",
          highlight: [
            "Expansion: tight spreads, loose covenants",
            "Peak: lowest credit quality of new issuance",
            "Trough: max spreads, best entry for credit",
          ],
        },
        {
          type: "teach",
          title: "Leading Indicators of Cycle Turning Points",
          content:
            "Sophisticated credit investors monitor leading indicators to identify cycle transitions. Covenant-lite issuance: when >80% of leveraged loans lack maintenance covenants, late-cycle behavior is entrenched. Spread compression: when BB-rated spreads trade inside historical averages, risk is mispriced. Leverage multiples: when average LBO leverage exceeds 7× EBITDA, lenders are taking excessive risk. Rating drift: when the ratio of rating downgrades to upgrades turns negative (more downgrades), cycle is turning. CCC issuance surge: desperate companies accessing capital at high yields signals stress. Each indicator alone is insufficient — convergence of multiple signals provides conviction.",
          highlight: [
            ">80% covenant-lite = late cycle",
            "Average LBO leverage >7× EBITDA = risk",
            "Downgrade-to-upgrade ratio turns negative",
          ],
        },
        {
          type: "teach",
          title: "Default Rate Cycles: Historical Evidence",
          content:
            "Moody's trailing 12-month speculative-grade default rates reveal a clear cyclical pattern spanning four decades. The 1990–1991 recession pushed default rates to ~10%. The 2001–2002 dotcom bust reached ~11% with telecom defaults dominating. The 2008–2009 financial crisis produced the highest modern default rate near ~14% as structured credit unwound. The 2020 COVID shock spiked to ~8% briefly before massive central bank intervention suppressed it. Between each crisis, default rates fall to 1–2%, creating complacency. The average default rate across the full cycle is approximately 4–5% — investors who only price in the trough rate systematically underestimate credit risk.",
          highlight: [
            "2009 peak: ~14% default rate",
            "Trough: 1–2% creates complacency",
            "Full-cycle average: ~4–5%",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Rating agencies tend to lead the market in downgrading issuers before credit spreads widen, making them useful predictive tools for credit investors.",
          correct: false,
          explanation:
            "False. Rating agencies are widely criticized for being procyclical and lagging the market. Credit spreads typically widen months before rating agencies act on downgrades. During the 2008 crisis, AAA-rated CDO tranches were downgraded to junk in a matter of weeks after spreads had already blown out. Investors relying solely on ratings miss the early warning signs visible in spread behavior and fundamental analysis.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Positioning Across the Credit Cycle",
          content:
            "Optimal credit strategy rotates with the cycle. Early expansion: go long high yield and investment grade — spreads will tighten as the economy recovers; add duration as rates fall from trough. Mid-cycle: maintain duration exposure, start selectively reducing exposure to CCC-rated credits as tight spreads no longer compensate for default risk. Late cycle / peak: rotate from high yield into investment grade or short-duration floating-rate instruments; begin building cash for distressed opportunities. Contraction / trough: deploy capital into distressed debt and fallen angels — companies recently downgraded from IG to HY often trade at excessively wide spreads as forced sellers (insurance companies, IG-mandated funds) must exit.",
          highlight: [
            "Early: long HY, add duration",
            "Late: rotate to IG, build cash",
            "Trough: buy fallen angels and distressed",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 'fallen angel' in credit markets refers to:",
          options: [
            "A high-yield bond that has been upgraded to investment grade, generating price appreciation",
            "An investment-grade bond recently downgraded to high yield, often creating forced selling",
            "A sovereign bond that has defaulted on its interest payments",
            "A convertible bond whose equity conversion option has expired worthless",
          ],
          correctIndex: 1,
          explanation:
            "Fallen angels are investment-grade bonds recently downgraded to high yield (below BBB-/Baa3). When this happens, insurance companies, pension funds, and IG-mandated bond funds must sell — often indiscriminately and quickly — creating artificial price dislocation. Fallen angels frequently trade 5–15 points below where their fundamental credit quality warrants, creating attractive entry points for unconstrained credit investors who can own HY.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "The Federal Reserve has raised rates 500 basis points over 18 months. Covenant-lite loans represent 85% of new issuance. Average LBO leverage is 7.2× EBITDA. HY spreads have recently started widening from 300 bps to 450 bps. Rating agency downgrade-to-upgrade ratios have turned negative.",
          question:
            "Based on these leading indicators, what phase of the credit cycle are you likely in, and what is the appropriate positioning?",
          options: [
            "Early expansion — aggressively add CCC exposure to maximize yield pickup",
            "Mid-cycle — maintain current HY allocation and increase duration",
            "Late cycle / early contraction — reduce HY exposure, build cash for distressed opportunities",
            "Trough — deploy all available capital immediately into distressed debt",
          ],
          correctIndex: 2,
          explanation:
            "Multiple late-cycle indicators are converging: maximum covenant erosion (85% cov-lite), extreme leverage multiples (7.2×), spread widening from tight levels, and negative rating drift. This combination strongly suggests late cycle / early contraction. The right move is to reduce high yield exposure, avoid new CCC issuance, and build a cash reserve to deploy into distressed opportunities when spreads reach maximum and defaults peak — which typically occurs 12–24 months after these warning signs.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "cds-mechanics",
      title: "CDS Mechanics & Uses",
      description:
        "Understand credit default swaps as tools for hedging, speculation, and credit risk transfer",
      icon: "Shield",
      xpReward: 115,
      difficulty: "advanced",
      duration: 14,
      steps: [
        {
          type: "teach",
          title: "CDS as Credit Insurance",
          content:
            "A credit default swap (CDS) is a bilateral contract that transfers credit risk from the protection buyer to the protection seller. The protection buyer pays a periodic premium (the CDS spread, quoted in basis points per year) and receives a payment if a credit event occurs. Credit events include: bankruptcy, failure to pay principal or interest, and restructuring of debt terms. If a credit event occurs, settlement can be physical (buyer delivers the defaulted bond and receives par) or cash (buyer receives par minus recovery rate). CDS effectively separates credit risk from interest rate risk and funding, allowing targeted credit exposure without holding the underlying bond.",
          highlight: [
            "Buyer pays spread, receives par on default",
            "Credit events: bankruptcy, failure to pay, restructuring",
            "Physical or cash settlement",
          ],
        },
        {
          type: "teach",
          title: "CDS Spread vs. Bond Spread: The Basis",
          content:
            "In theory, the CDS spread should equal the bond's credit spread above the risk-free rate (Z-spread). In practice, a basis often exists: basis = CDS spread minus bond spread. A positive basis means CDS protection is more expensive than implied by the bond — common during risk-off periods when demand for protection surges. A negative basis means bonds are cheap relative to CDS — a 'negative basis trade' involves buying the bond and buying CDS protection, locking in the spread difference nearly risk-free. The 2005–2007 era saw widespread negative basis trades funded through structured vehicles until the funding markets froze, demonstrating that 'arbitrage' has limits when liquidity dries up.",
          highlight: [
            "Basis = CDS spread minus bond spread",
            "Positive basis: protection demand exceeds supply",
            "Negative basis: bond cheaper than CDS implies",
          ],
        },
        {
          type: "teach",
          title: "CDS Indices and Portfolio Applications",
          content:
            "Single-name CDS reference one company. Index CDS cover baskets: CDX IG (125 investment-grade U.S. companies), CDX HY (100 high-yield companies), and EMBI (emerging market sovereign credits). Index CDS provide efficient, liquid macro hedges — a portfolio manager holding $500M in investment-grade corporates can buy $500M of CDX IG protection to neutralize credit risk during volatile periods. The 'big bang protocol' (2009) standardized CDS globally: fixed coupons of 100 bps for IG and 500 bps for HY, with upfront points paid to compensate for any difference from the running spread. Standardization dramatically improved liquidity and price transparency.",
          highlight: [
            "CDX IG: 125 investment-grade names",
            "CDX HY: 100 high-yield names",
            "Standard coupons: 100 bps IG / 500 bps HY",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "Buying CDS protection without owning the underlying bond (a 'naked' CDS position) is economically equivalent to short-selling the issuer's bonds.",
          correct: true,
          explanation:
            "Correct. Naked CDS — buying protection on a reference entity without holding the bond — is economically a short position on the issuer's creditworthiness. If credit quality deteriorates, spreads widen and the protection is worth more. This was highly controversial after 2008: AIG had sold massive naked CDS protection on mortgage securities without sufficient capital, creating systemic risk when those credits deteriorated. The EU banned naked sovereign CDS in 2012, though the ban's effectiveness is debated.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "CDS Curve and Term Structure",
          content:
            "Like interest rates, CDS have a term structure: the CDS curve plots spreads for 1-year, 2-year, 3-year, 5-year (most liquid), 7-year, and 10-year contracts. A normal CDS curve is upward sloping — longer-dated protection costs more because default probability compounds over time. An inverted CDS curve (near-term spreads wider than long-term) signals acute near-term stress: the market believes near-term default risk is elevated, with survivorship improving the picture for those who believe the company will make it through the immediate crisis. Steep curves indicate market confidence in near-term survival but uncertainty about the longer term. Traders use curve positions (long 5-year protection, short 1-year) to express views on timing of default.",
          highlight: [
            "5-year CDS: most liquid benchmark",
            "Inverted curve: acute near-term distress",
            "Upward slope: normal credit environment",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A hedge fund manager owns a $50M position in a BBB-rated corporate bond. Concerned about near-term credit deterioration but wanting to maintain the interest rate exposure, the fund should:",
          options: [
            "Sell the bond in the open market and buy equivalent-duration Treasuries",
            "Buy $50M of single-name CDS protection on the issuer, neutralizing credit risk while keeping the bond",
            "Sell CDS protection to earn additional spread income and amplify credit exposure",
            "Buy a put option on the issuer's equity as a proxy hedge for credit risk",
          ],
          correctIndex: 1,
          explanation:
            "Buying CDS protection on the same issuer in the same notional amount creates a near-perfect credit hedge while keeping the bond. The fund retains the interest rate duration (useful if rates fall) but transfers the credit risk to the CDS protection seller. If the issuer defaults, the CDS pays par while the bond delivers the (depreciated) bond — netting to approximately par recovery. This is more capital-efficient than selling the bond and avoids transaction costs and potential market impact of liquidating a large position.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A company's 1-year CDS spread is trading at 850 basis points while its 5-year CDS spread is 320 basis points — a sharply inverted curve. The company has a $500M bond maturity due in 8 months.",
          question:
            "What does the inverted CDS curve most likely signal about market expectations?",
          options: [
            "The company is a strong long-term credit but faces a short-term liquidity crunch around the maturity",
            "Rating agencies are about to upgrade the company, tightening near-term spreads",
            "Long-term debt is more risky than short-term debt because of compounding default probability",
            "The CDS market is pricing in a merger that will eliminate all credit risk within five years",
          ],
          correctIndex: 0,
          explanation:
            "The inverted curve — near-term spreads far wider than long-term — classically signals a liquidity crunch around a specific maturity event. The market believes there is elevated near-term probability of default if the $500M bond cannot be refinanced or repaid, but if the company survives that event (perhaps through a refinancing or asset sale), long-term credit risk is manageable. This is a common pattern for companies with a 'maturity wall' — concentrated near-term maturities that threaten liquidity.",
          difficulty: 3,
        },
      ],
    },
    {
      id: "covenants-lbo-credit",
      title: "Covenants & LBO Credit Impact",
      description:
        "Analyze covenant protections, LBO leverage dynamics, and modern creditor-on-creditor conflicts",
      icon: "FileText",
      xpReward: 125,
      difficulty: "advanced",
      duration: 15,
      steps: [
        {
          type: "teach",
          title: "Maintenance vs. Incurrence Covenants",
          content:
            "Loan covenants come in two fundamental varieties. Maintenance covenants are tested every quarter regardless of borrower actions — common tests include: maximum leverage ratio (total debt / EBITDA), minimum interest coverage ratio (EBITDA / interest expense), and minimum net worth. If violated, the borrower must cure or the lender can accelerate the loan. Incurrence covenants are only tested when the borrower wants to take a specific action (incur more debt, make an acquisition, pay a dividend) — they 'spring' only upon that trigger. High-yield bonds use incurrence-only covenants. Leveraged loans historically used maintenance covenants, but the rise of 'covenant-lite' (cov-lite) loans since 2012 has replaced most maintenance tests with incurrence-only structures, dramatically reducing lender early warning and negotiating leverage.",
          highlight: [
            "Maintenance: tested quarterly, regardless of action",
            "Incurrence: only tested when borrower acts",
            "Cov-lite: loans with only incurrence covenants",
          ],
        },
        {
          type: "teach",
          title: "LBO Capital Structure and Leverage Dynamics",
          content:
            "A leveraged buyout finances a company acquisition with significant debt — typically 5–7× EBITDA total leverage, with equity representing 30–40% of the purchase price. The high leverage creates a thin equity cushion and amplifies both upside and downside. Key credit metrics: debt service coverage ratio (EBITDA / (principal + interest)) must exceed 1.0× to service debt; typically lenders require 1.2–1.5× headroom. Interest coverage ratio (EBITDA / interest expense) minimum of 2.0× is typical. Under stress scenarios — a 20% EBITDA decline — many LBO borrowers breached covenants in 2008-2009 and again in 2020. Stress testing the base case by -20% and -35% EBITDA reveals at what point covenants trigger and when the company cannot service debt from operations.",
          highlight: [
            "LBO leverage: 5–7× EBITDA typical",
            "Equity cushion: 30–40% of purchase price",
            "Stress test: -20% and -35% EBITDA scenarios",
          ],
        },
        {
          type: "teach",
          title: "Covenant Evolution: The Cov-Lite Shift",
          content:
            "Pre-2008, virtually all leveraged loans contained quarterly maintenance covenant tests giving lenders early warning and negotiating leverage. Post-2009, the pendulum swung dramatically. By 2012, cov-lite loans emerged as CLOs and institutional investors competed for yield. By 2018–2022, over 85% of new U.S. leveraged loan issuance was cov-lite. Lenders effectively gave up early warning in exchange for deal flow. The practical impact: companies can deteriorate substantially before technically defaulting — no maintenance covenant is breached, so there is no trigger forcing the company to the negotiating table early. By the time default occurs, EBITDA may have declined 40–60%, leaving far less enterprise value for recovery versus earlier-cycle interventions.",
          highlight: [
            ">85% of leveraged loans were cov-lite by 2020",
            "No early warning → worse recoveries",
            "Lenders gave up negotiating leverage",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A maintenance covenant tested quarterly gives lenders more protection than an incurrence covenant because lenders can intervene when financial metrics first deteriorate, before a crisis develops.",
          correct: true,
          explanation:
            "Correct. This is the key distinction between covenant types. A maintenance leverage covenant tested quarterly means that if the borrower's debt-to-EBITDA exceeds, say, 6.5×, lenders immediately have a technical default giving them negotiating leverage to demand equity cures, management changes, or asset sales. With incurrence-only covenants (cov-lite), the borrower can continue deteriorating freely without triggering lender rights — only actual payment default (missing an interest payment) gives lenders leverage, by which point the situation is often far worse.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Trap Door Maneuvers: J.Crew and Chewy",
          content:
            "Loose covenant documentation enabled creative 'trap door' transactions where borrowers move valuable assets beyond the reach of existing lenders. The J.Crew transaction (2016–2017) exploited a loophole allowing intellectual property to be transferred to an unrestricted subsidiary, then used as collateral for new financing — leaving existing lenders with a hollowed-out restricted group. The Chewy / PetSmart transaction (2018) involved transferring equity stakes in Chewy (worth billions) out of the PetSmart restricted group, stripping value from term loan lenders. These maneuvers spawned 'J.Crew blockers' in subsequent loan documentation — provisions explicitly prohibiting IP transfers to unrestricted subsidiaries. They also catalyzed the creditor-on-creditor violence era.",
          highlight: [
            "J.Crew: IP moved to unrestricted subsidiary",
            "Chewy/PetSmart: equity stripped from restricted group",
            "J.Crew blockers now standard in new docs",
          ],
        },
        {
          type: "teach",
          title: "Creditor-on-Creditor Violence",
          content:
            "As PE sponsors became more sophisticated at exploiting documentation gaps, some creditors began cutting side deals with borrowers that harmed other creditors — a phenomenon dubbed 'creditor-on-creditor violence.' Envision Healthcare (2022): a group of lenders provided new money secured by collateral previously available to all term loan lenders, subordinating non-participating creditors. Serta Simmons (2020): the borrower worked with a majority of term loan lenders to exchange their debt at par for new super-priority debt, leaving minority lenders holding subordinated paper worth far less — the 'uptier exchange.' These transactions exposed fundamental flaws in syndicated loan documentation and triggered waves of litigation. Lenders now negotiate 'sacred right' protections and anti-priming provisions to prevent being crammed down by their fellow creditors.",
          highlight: [
            "Uptier exchange: majority exchanges into super-priority",
            "Minority lenders left with subordinated claims",
            "Sacred rights: anti-priming protections",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "In an 'uptier exchange' transaction like Serta Simmons, what happens to minority term loan lenders who do not participate in the exchange?",
          options: [
            "They receive par repayment immediately from the proceeds of the new super-priority debt",
            "Their loans become senior secured as the remaining lenders move to a new facility above them",
            "They are effectively subordinated — their original pari passu loans are now junior to the new super-priority debt held by the participating majority",
            "They automatically receive enhanced covenant protections as compensation for the dilution",
          ],
          correctIndex: 2,
          explanation:
            "In an uptier exchange, the participating majority of lenders exchange their existing pari passu loans for new super-priority debt ranking above the old loans. Non-participating minority lenders are left holding their original loans, which are now contractually subordinated to the new super-priority paper they did not receive. Their position has been permanently impaired — the same company now has senior claims ahead of them that did not exist before, reducing their recovery in any subsequent default.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are a credit analyst evaluating a leveraged loan for a software company acquired in an LBO at 7.5× EBITDA. Current EBITDA is $100M. Total debt is $680M. The loan documentation is cov-lite with an $80M 'restricted payment basket' allowing dividends to the PE sponsor and no J.Crew blocker on intellectual property transfers.",
          question:
            "Which combination of features most increases lender risk in this transaction?",
          options: [
            "The 7.5× initial leverage and the cov-lite structure only — the restricted payment basket is standard",
            "The cov-lite structure, the absence of a J.Crew blocker, and the $80M dividend basket — together these remove early warning, allow IP stripping, and allow capital extraction before stress",
            "Only the absence of a J.Crew blocker — all other features are consistent with market standard",
            "The 7.5× leverage alone — documentation quality is irrelevant to ultimate recovery rates",
          ],
          correctIndex: 1,
          explanation:
            "All three features compound each other to create elevated lender risk. Cov-lite removes the quarterly early warning mechanism — lenders cannot intervene until actual payment default, by which time EBITDA may have collapsed. No J.Crew blocker means the PE sponsor can transfer the IP (likely the most valuable asset in a software company) to an unrestricted subsidiary and use it as collateral for new financing that primes existing lenders. The $80M dividend basket allows capital extraction before any financial deterioration is detected. Together, they represent a documentation package that maximizes sponsor flexibility at lenders' expense.",
          difficulty: 3,
        },
      ],
    },
  ],
};
