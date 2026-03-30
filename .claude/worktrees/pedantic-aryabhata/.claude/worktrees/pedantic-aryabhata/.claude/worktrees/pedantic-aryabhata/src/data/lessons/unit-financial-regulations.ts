import type { Unit } from "./types";

export const UNIT_FINANCIAL_REGULATIONS: Unit = {
  id: "financial-regulations",
  title: "Financial Regulations",
  description:
    "Navigate securities law, market regulation, compliance frameworks, and the post-2008 regulatory landscape",
  icon: "Scale",
  color: "#ef4444",
  lessons: [
    // ─── Lesson 1: Securities Law Fundamentals ───────────────────────────────────
    {
      id: "finreg-1",
      title: "Securities Law Fundamentals",
      description:
        "Core US securities acts, the Howey Test for defining securities, and key registration exemptions",
      icon: "FileText",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Foundation Acts: 1933 & 1934",
          content:
            "Two landmark laws passed in the wake of the 1929 crash form the backbone of US securities regulation.\n\n**Securities Act of 1933 — 'The Truth in Securities Law'**\nThis act governs the *primary market* — the issuance of new securities. Key requirements:\n- **Registration:** Companies must register securities with the SEC before offering them to the public. An IPO triggers this requirement.\n- **Prospectus:** A detailed disclosure document must be provided to investors describing the business, financials, risk factors, and use of proceeds.\n- **Goal:** Ensure investors have material information before buying newly issued securities.\n- **Liability:** Section 11 imposes civil liability on issuers for material misstatements or omissions in a registration statement.\n\n**Securities Exchange Act of 1934 — 'The Ongoing Disclosure Act'**\nThis act governs the *secondary market* — trading of existing securities. Key provisions:\n- **Created the SEC:** The Securities and Exchange Commission was established as the primary regulator.\n- **Periodic Reporting:** Public companies must file:\n  - **10-K** — annual report (audited financials, business overview, risk factors)\n  - **10-Q** — quarterly report (unaudited financials, material developments)\n  - **8-K** — current report filed within 4 business days of a material event (M&A, CEO change, restatement)\n- **Proxy rules:** Regulation of shareholder voting and proxy solicitation.\n- **Tender offers:** Rules governing how acquirers must treat shareholders in buyout offers.\n- **Anti-fraud:** Section 10(b) and Rule 10b-5 — the broadest anti-fraud provision in securities law, used to prosecute insider trading.",
          highlight: ["Securities Act 1933", "Securities Exchange Act 1934", "10-K", "10-Q", "8-K", "SEC", "prospectus"],
        },
        {
          type: "teach",
          title: "Investment Advisers Act 1940 & Fiduciary Duty",
          content:
            "The Investment Advisers Act of 1940 regulates investment advisers — professionals who provide advice about securities for compensation.\n\n**Who is a Registered Investment Adviser (RIA)?**\n- Any person or firm that advises others on investing in securities and receives compensation must register with the SEC (if managing >$110M) or their state regulator.\n- Dual registration: A firm may be both an RIA (Advisers Act) and a broker-dealer (Exchange Act).\n\n**The Fiduciary Duty:**\nRIAs are subject to a **fiduciary standard** — the highest duty in financial services:\n- **Duty of Loyalty:** Act in the client's best interest; avoid conflicts of interest or disclose and manage them.\n- **Duty of Care:** Provide advice based on reasonable inquiry into the client's financial situation, needs, and goals.\n- Contrast with brokers' traditional *suitability* standard: was the product merely suitable for the client? The fiduciary standard is significantly higher.\n\n**Form ADV:**\nRIAs must file Form ADV with the SEC — a public document disclosing:\n- Investment strategies and methods\n- Fee structure\n- Conflicts of interest\n- Disciplinary history\n- Key personnel\n\nClients must receive Part 2 of Form ADV (the 'brochure') before or during engagement.",
          highlight: ["fiduciary duty", "RIA", "Investment Advisers Act 1940", "Form ADV", "duty of loyalty", "duty of care"],
        },
        {
          type: "teach",
          title: "The Howey Test & Registration Exemptions",
          content:
            "**The Howey Test — Defining a 'Security'**\nIn *SEC v. W.J. Howey Co.* (1946), the Supreme Court established a four-part test to determine if something is an 'investment contract' (a type of security):\n1. **Investment of money** — the investor commits capital\n2. **Common enterprise** — the investor's fortunes are tied to others (horizontal or vertical commonality)\n3. **Expectation of profit** — the investor expects financial returns\n4. **From the efforts of others** — returns depend primarily on the promoter or third party, not the investor's own labor\n\nAll four prongs must be satisfied. Modern applications: cryptocurrency tokens (SEC enforcement), NFTs, limited partnership interests.\n\n**Winery membership example:** If members pay to join and share in the profits of wine sales based on the winery operator's efforts, all four Howey prongs are met — it is a security.\n\n**Key Registration Exemptions:**\n\n| Exemption | Who | Cap | Accredited Only? |\n|---|---|---|---|\n| **Reg D 506(b)** | Private placements | Unlimited | Up to 35 non-accredited |\n| **Reg D 506(c)** | General solicitation allowed | Unlimited | Yes |\n| **Reg A+** | Mini-IPO | $75M/year | No — public offering |\n| **Reg CF** | Crowdfunding | $5M/year | No — retail investors |\n\nAccredited investor = $1M net worth (ex-home) or $200K/$300K income for 2+ years.",
          highlight: ["Howey Test", "investment contract", "Reg D", "Reg A+", "Reg CF", "accredited investor"],
        },
        {
          type: "quiz-mc",
          question:
            "A winery sells 'memberships' where members pay $50,000 upfront, the winery operator cultivates the grapes and produces wine, and members receive a share of annual wine sale revenues. Under the Howey Test, is this membership a security?",
          options: [
            "Yes — all four prongs are met: investment of money, common enterprise, expectation of profit, and profits derive from the operator's efforts",
            "No — it is a membership product, not a financial instrument, so securities laws do not apply",
            "No — the investor receives wine, a physical commodity, not financial returns, so it fails the profit prong",
            "Only if the winery is a publicly traded company — private offerings are categorically exempt",
          ],
          correctIndex: 0,
          explanation:
            "All four Howey prongs are satisfied: (1) members invest $50,000; (2) there is a common enterprise as all members share in the overall wine revenues; (3) members expect a profit (share of revenues); and (4) the profit depends entirely on the operator's skill in cultivating and selling wine. The physical nature of wine does not negate the financial return. This analysis follows directly from the Howey Test framework established by the Supreme Court.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under Regulation D Rule 506(c), a company may generally solicit and advertise its private offering to the public, provided it only sells to verified accredited investors.",
          correct: true,
          explanation:
            "True. Reg D 506(c), added by the JOBS Act of 2012, lifted the prohibition on general solicitation for private placements. Companies may advertise their offerings broadly. However, they must take reasonable steps to verify that all purchasers are accredited investors — simply self-certification is generally insufficient. This contrasts with 506(b), which prohibits general solicitation but allows up to 35 sophisticated non-accredited investors.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A technology startup plans to raise $2M from 200 retail investors (non-accredited) via an online platform. Investors will receive equity shares. The company wants to use a registration exemption rather than a full SEC registration.",
          question: "Which exemption best fits this situation?",
          options: [
            "Regulation CF (crowdfunding) — designed for raises up to $5M from retail investors via registered funding portals",
            "Regulation D 506(b) — allows unlimited retail investors in private placements",
            "Regulation A+ Tier 1 — best for very small raises from non-accredited investors via simple filing",
            "Section 4(a)(2) private placement exemption — no filing required for any size offering",
          ],
          correctIndex: 0,
          explanation:
            "Reg CF is the correct answer. It was created precisely for equity crowdfunding from retail (non-accredited) investors via SEC-registered funding portals, with an annual cap of $5M. Reg D 506(b) allows only up to 35 non-accredited investors and prohibits general solicitation. Section 4(a)(2) is a case-by-case exemption not suited for broad retail solicitation. Reg A+ allows public retail offerings but has more complex filing requirements and is typically used for larger raises.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Market Regulation & Trading Rules ────────────────────────────
    {
      id: "finreg-2",
      title: "Market Regulation & Trading Rules",
      description:
        "Reg NMS, short selling rules, insider trading law, Reg FD, and circuit breakers",
      icon: "BarChart2",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Regulation NMS — The National Market System",
          content:
            "Regulation NMS (National Market System), adopted by the SEC in 2005, modernized how US equity markets operate across multiple competing exchanges.\n\n**Three core rules:**\n\n**1. Order Protection Rule (Rule 611) — 'Trade-Through Rule'**\nBrokers must execute orders at the best available price across all protected markets. You cannot 'trade through' a better quote at another exchange.\n- If NYSE shows $50.00 bid and NASDAQ shows $50.02 offer, a sell order must be routed to NASDAQ's $50.02 bid — it cannot execute at $49.99 on a regional exchange.\n- Protected quotes: top-of-book bids/offers from any registered national exchange.\n\n**2. Access Rule (Rule 610)**\nMarket centers must provide fair access to quotations at reasonable fees. Cap on access fees: $0.003 per share. Prevents exchanges from locking out competitors.\n\n**3. Sub-Penny Rule (Rule 612)**\nBrokers may not accept or rank orders priced in increments of less than $0.01 for stocks above $1.00. Prevents sub-penny quote stuffing.\n\n**Best Execution:**\nReg NMS reinforces the duty of best execution — brokers must use reasonable diligence to execute orders at the most favorable terms. FINRA Rule 5310 enforces this duty, requiring brokers to:\n- Consider price, speed of execution, likelihood of execution, and order size\n- Conduct regular reviews of execution quality\n- Document best-execution analysis",
          highlight: ["Reg NMS", "order protection rule", "best execution", "trade-through", "access rule"],
        },
        {
          type: "teach",
          title: "Regulation SHO & Insider Trading Law",
          content:
            "**Regulation SHO — Short Selling Rules**\nAdopted in 2005, Reg SHO governs short sales to prevent abusive 'naked' short selling.\n\n**Locate Requirement (Rule 203(b)(1)):**\nBefore executing a short sale, the broker must have reasonable grounds to believe the security can be *borrowed* and delivered. The broker must 'locate' shares with a stock lender.\n- Exception: Market makers engaged in bona fide market making\n\n**Close-Out Requirement (Rule 204):**\nIf a short sale results in a *fail to deliver* by settlement date (T+2), the broker must close out the position by purchasing shares in the open market. Penalties for persistent fails.\n\n**Threshold Securities List:**\nStocks with persistent fails to deliver are placed on the Threshold Securities List — subject to mandatory close-out within 13 consecutive settlement days.\n\n**Insider Trading — MNPI**\nInsider trading violates SEC Rule 10b-5 when a person trades on *material non-public information* (MNPI).\n- **Material:** Would a reasonable investor consider the information important? Pending earnings, M&A deals, FDA approvals are classic examples.\n- **Non-public:** Not yet disseminated to the general public.\n- **Tipper/Tippee liability (Dirks v. SEC):** The original insider (tipper) who breaches a duty for personal benefit is liable; so is the tippee who knows the information was improperly disclosed.\n- Penalties: Up to 20 years imprisonment, disgorgement of profits, civil fines up to 3× the profit gained.",
          highlight: ["Regulation SHO", "locate requirement", "fail to deliver", "MNPI", "tipper", "tippee", "Rule 10b-5"],
        },
        {
          type: "teach",
          title: "Regulation FD & Circuit Breakers",
          content:
            "**Regulation FD — Fair Disclosure**\nAdopted in 2000 after widespread selective disclosure scandals, Reg FD requires companies to disclose material information to *all investors simultaneously*.\n\n**Core rule:** When an issuer intentionally discloses material non-public information to certain individuals (analysts, institutional investors), it must simultaneously make that information public via press release or Form 8-K filing.\n\n**Unintentional disclosure:** If accidental, the issuer must make public disclosure *promptly* — within 24 hours or before the next trading session, whichever is sooner.\n\n**Effect:** Analyst phone calls, investor conferences, and earnings pre-briefings must be either public (webcast) or carefully scripted to avoid new material disclosures.\n\n**Circuit Breakers — Preventing Market Crashes**\n\n**Market-Wide Circuit Breakers (MWCB):**\nTriggered when the S&P 500 falls from the prior day's close:\n- **Level 1: -7%** → 15-minute trading halt\n- **Level 2: -13%** → 15-minute trading halt\n- **Level 3: -20%** → Market closes for the rest of the trading day\nLevel 1 and 2 halts only trigger before 3:25 PM ET.\n\n**LULD (Limit Up-Limit Down) Bands:**\nIndividual stock circuit breakers. Trading in a stock is paused if the price moves more than a set percentage outside a reference price over a 5-minute period:\n- 5% bands for S&P 500 and Russell 1000 stocks (10% for other NMS stocks)\n- Broader bands during opening (9:30–9:45 AM) and closing (3:35–4:00 PM)",
          highlight: ["Regulation FD", "fair disclosure", "circuit breaker", "LULD", "Level 1", "Level 2", "Level 3"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "During a private dinner with a major institutional investor, a public company's CEO mentions that next quarter's revenue will be significantly higher than analyst consensus estimates — information that has not yet been disclosed publicly.",
          question:
            "What must the CEO/company do after this conversation, and what law is at issue?",
          options: [
            "Immediately issue a press release or Form 8-K disclosing the revenue guidance to the general public — this is required by Regulation FD",
            "Nothing — private conversations with institutional investors are expressly exempt from disclosure obligations",
            "File an amended 10-Q within 15 days of the conversation to reflect the new guidance",
            "Notify FINRA of the discussion within 2 business days, but no public disclosure is required",
          ],
          correctIndex: 0,
          explanation:
            "This is a clear Regulation FD violation scenario. Once material non-public information (the positive revenue guidance) is selectively disclosed to an institutional investor, Regulation FD requires the issuer to simultaneously (or promptly, if unintentional) disclose the same information publicly — typically via a press release or Form 8-K. Failing to do so exposes the company and the CEO to SEC enforcement action. Private conversations with institutional investors are not exempt from Reg FD.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Under Regulation SHO, a short seller's broker cannot locate shares to borrow before executing the short sale. What must the broker do?",
          options: [
            "Decline to execute the short sale — the locate requirement must be satisfied before any short sale can be executed",
            "Execute the short sale and attempt to borrow shares before the settlement date (T+2)",
            "Execute the short sale and pay a locate fee to the exchange to legitimize the transaction",
            "Execute the short sale only if the stock is not on the Threshold Securities List",
          ],
          correctIndex: 0,
          explanation:
            "Under Reg SHO Rule 203(b)(1), the broker-dealer must have a reasonable belief that the security can be borrowed and delivered before executing the short sale. Without a locate, the short sale cannot proceed. This rule prevents naked short selling — selling short without the ability to deliver the shares. Market makers in their capacity as bona fide market makers have a limited exception, but ordinary short selling requires a completed locate first.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A market-wide circuit breaker Level 3 (triggered at a -20% decline in the S&P 500) causes only a 15-minute trading halt, after which trading resumes for the remainder of the session.",
          correct: false,
          explanation:
            "False. A Level 3 circuit breaker triggered by a -20% decline in the S&P 500 closes the market for the *entire remainder of the trading day* — not merely a 15-minute halt. Only Level 1 (-7%) and Level 2 (-13%) result in 15-minute halts (and only if triggered before 3:25 PM ET). Level 3 is the most severe and closes all trading through the end of the session.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Post-2008 Regulatory Reform ──────────────────────────────────
    {
      id: "finreg-3",
      title: "Post-2008 Regulatory Reform",
      description:
        "Dodd-Frank, the Volcker Rule, Basel III capital requirements, SIFI designation, and living wills",
      icon: "Shield",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Dodd-Frank Wall Street Reform Act 2010",
          content:
            "The Dodd-Frank Wall Street Reform and Consumer Protection Act of 2010 was the most sweeping financial regulatory overhaul since the New Deal. Passed in response to the 2008 financial crisis, it addressed systemic risk, derivatives, consumer protection, and too-big-to-fail.\n\n**Five pillars of Dodd-Frank:**\n\n**1. Financial Stability Oversight Council (FSOC)**\nA council of regulators chaired by the Treasury Secretary that monitors systemic risk across the financial system and designates SIFIs (see Lesson 3 below).\n\n**2. Volcker Rule (Section 619)**\nProhibits banks from proprietary trading and limits ownership of hedge funds and private equity funds.\n\n**3. Derivatives Reform (Title VII)**\nOTC derivatives must be cleared through central counterparties (CCPs) and reported to trade repositories. Standardized swaps must be traded on swap execution facilities (SEFs).\n\n**4. Resolution Authority (Title II)**\nGives the FDIC 'orderly liquidation authority' to wind down a failing SIFI without taxpayer bailouts. Eliminates the 'too big to fail' expectation.\n\n**5. Consumer Financial Protection Bureau (CFPB)**\nA new independent agency tasked with supervising consumer financial products: mortgages, credit cards, student loans, payday loans. Has rulemaking, supervision, and enforcement powers.",
          highlight: ["Dodd-Frank", "FSOC", "Volcker Rule", "derivatives clearing", "CFPB", "orderly liquidation authority"],
        },
        {
          type: "teach",
          title: "The Volcker Rule & Basel III",
          content:
            "**The Volcker Rule — Separating Banking from Speculation**\nNamed after former Fed Chairman Paul Volcker, this rule prohibits bank holding companies (and their affiliates) from:\n- **Proprietary trading:** Trading securities, derivatives, or commodities for the bank's own account (not on behalf of clients)\n- **Covered fund ownership:** Owning, sponsoring, or having certain relationships with hedge funds or private equity funds\n\n**Permitted activities:**\n- Market making (facilitating client transactions)\n- Underwriting (distributing new securities)\n- Hedging (offsetting identified risks)\n- Trading in US government securities, agency debt, and municipal bonds\n\n**Primary purpose:** Prevent banks that benefit from federal deposit insurance and Fed lending from taking speculative risks that could threaten depositors and require bailouts.\n\n**Basel III — International Capital Standards**\nBasel III (finalized 2017, fully phased in by 2028) sets minimum capital and liquidity requirements for internationally active banks:\n- **CET1 ratio (Common Equity Tier 1):** At least 4.5% of risk-weighted assets. With the capital conservation buffer: effectively 7% minimum.\n- **Tier 1 Capital:** CET1 + Additional Tier 1 (AT1) = at least 6% of RWA\n- **Total Capital:** At least 8% of RWA\n- **Leverage Ratio:** At least 3% of total exposure (non-risk-weighted)\n- **LCR (Liquidity Coverage Ratio):** Hold enough high-quality liquid assets (HQLA) to survive a 30-day stress scenario\n- **NSFR (Net Stable Funding Ratio):** Available stable funding ≥ required stable funding over a 1-year horizon",
          highlight: ["Volcker Rule", "proprietary trading", "covered fund", "Basel III", "CET1", "LCR", "NSFR", "leverage ratio"],
        },
        {
          type: "teach",
          title: "SIFIs & Living Wills",
          content:
            "**Systemically Important Financial Institutions (SIFIs)**\nDodd-Frank created a framework for identifying and enhancing oversight of institutions whose failure could threaten the broader financial system.\n\n**Two categories:**\n1. **Bank SIFIs (G-SIBs — Global Systemically Important Banks):** Designated by the Financial Stability Board globally; in the US by FSOC. US G-SIBs include JPMorgan Chase, Bank of America, Citigroup, Wells Fargo, Goldman Sachs, Morgan Stanley. These banks face surcharges on their CET1 requirement (1–3.5% additional).\n2. **Non-bank SIFIs:** FSOC can designate non-bank financial companies (insurers, asset managers) whose failure would pose systemic risk. AIG and GE Capital were designated post-crisis.\n\n**Enhanced Prudential Standards for SIFIs:**\n- Higher capital requirements (SIFI surcharges)\n- Annual stress tests by the Federal Reserve (DFAST — Dodd-Frank Act Stress Test, and CCAR — Comprehensive Capital Analysis and Review)\n- Mandatory recovery and resolution planning\n\n**Living Wills (Resolution Plans)**\nUnder Dodd-Frank Section 165(d), large bank holding companies must file annual resolution plans — colloquially called 'living wills' — with the Fed and FDIC:\n- Detailed roadmap for an *orderly wind-down* in the event of material financial distress without government support\n- Must identify critical operations, key entities, interconnections, and resolution strategies\n- Regulators can demand revisions if the plan is deemed not credible; repeated deficiencies can trigger restrictions on activities or capital distributions",
          highlight: ["SIFI", "G-SIB", "living will", "resolution plan", "stress test", "CCAR", "DFAST"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the Volcker Rule's primary purpose in the context of the 2008 financial crisis?",
          options: [
            "To prevent banks backed by federal deposit insurance from taking proprietary speculative risks that could expose taxpayers to losses and require government bailouts",
            "To prohibit investment banks from underwriting new securities offerings for clients, separating advisory from capital markets activities",
            "To require all banks to hold a minimum of 7% CET1 capital against risk-weighted assets at all times",
            "To force banks to clear all derivatives through central counterparties, reducing bilateral counterparty risk",
          ],
          correctIndex: 0,
          explanation:
            "The Volcker Rule's primary purpose is to separate commercial banking (deposit-taking, insured by the FDIC) from proprietary speculative trading. Banks benefit from federal safety nets — deposit insurance, access to the Fed discount window — and allowing them to gamble with depositors' money in prop trading creates a 'heads I win, tails the taxpayer loses' dynamic. The Volcker Rule addresses this moral hazard. Capital requirements (CET1) and derivatives clearing are separate Dodd-Frank provisions under Basel III and Title VII respectively.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under Basel III, a bank's Liquidity Coverage Ratio (LCR) requires it to hold enough high-quality liquid assets to cover projected net cash outflows over a 1-year stress period.",
          correct: false,
          explanation:
            "False. The LCR covers a **30-day** stress period, not 1 year. The LCR requires banks to hold sufficient High-Quality Liquid Assets (HQLA — primarily cash, central bank reserves, and government bonds) to meet projected net cash outflows over a 30-day stress scenario. The **Net Stable Funding Ratio (NSFR)**, the complementary liquidity metric, takes the longer-term 1-year view by requiring available stable funding to exceed required stable funding over a 1-year horizon.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A large bank holding company files its annual resolution plan with the Fed and FDIC. Regulators determine that the plan relies on unrealistic assumptions about asset sale timelines and lacks a credible strategy for winding down its derivatives book without systemic spillover.",
          question: "What authority do regulators have in response to an inadequate resolution plan?",
          options: [
            "Regulators can demand revisions to the plan; repeated deficiencies can lead to restrictions on the bank's activities, growth, or capital distributions",
            "Regulators must immediately place the bank into FDIC receivership to protect the financial system",
            "Regulators can only issue a public warning — they have no enforcement authority over the content of resolution plans",
            "Regulators must approve the plan as-is once filed, but may require corrections in next year's annual submission",
          ],
          correctIndex: 0,
          explanation:
            "Under Dodd-Frank Section 165(d), if the Fed and FDIC jointly determine a resolution plan is not credible or would not facilitate an orderly resolution, they can require the bank to submit a revised plan within 90 days. If the bank fails to remedy the deficiencies, regulators may impose more stringent capital, leverage, or liquidity requirements, or restrict the firm's activities and acquisitions. This escalating enforcement mechanism is designed to ensure banks genuinely prepare for failure rather than submit pro forma plans.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: MiFID II & Global Regulation ─────────────────────────────────
    {
      id: "finreg-4",
      title: "MiFID II & Global Regulation",
      description:
        "EU financial regulation, research unbundling, EMIR, GDPR in finance, and the SEC vs CFTC divide",
      icon: "Globe",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "MiFID II — Markets in Financial Instruments Directive",
          content:
            "MiFID II (effective January 2018) is the European Union's comprehensive framework for financial markets. It replaced the original MiFID (2007) with significantly expanded scope and requirements.\n\n**Best Execution:**\nFirms must take 'all sufficient steps' to obtain the best possible result for clients, considering price, costs, speed, likelihood of execution, and other factors. Firms must publish annual execution quality reports comparing their venues.\n\n**Research Unbundling (MiFID II Article 13):**\nThis is one of MiFID II's most impactful provisions globally. Before MiFID II, asset managers routinely paid for investment research (broker research reports, analyst access) by directing trading commissions to the producing broker — a practice called 'soft dollars' or commission-sharing.\n\nMiFID II requires asset managers to:\n- **Pay for research separately** from execution commissions — either from the manager's own P&L (internal budget) or from a client Research Payment Account (RPA) with explicit client consent\n- Establish a research budget and price each piece of research explicitly\n\n**Effect:** Research budgets fell sharply industry-wide (estimated 30–40% decline in European research spending). Many smaller brokers shut their research operations. The change created pressure globally, including on US managers operating in European markets.\n\n**Transaction Reporting:**\nFirms must report all trades in MiFID II instruments to national regulators on T+1, including LEI (Legal Entity Identifier) for all counterparties.",
          highlight: ["MiFID II", "best execution", "research unbundling", "soft dollars", "RPA", "transaction reporting", "LEI"],
        },
        {
          type: "teach",
          title: "EMIR, GDPR & Basel III International Coordination",
          content:
            "**EMIR — European Market Infrastructure Regulation**\nEMIR (effective 2012, amended by EMIR Refit 2019) is the EU's response to OTC derivatives risks exposed in 2008:\n- **Clearing obligation:** Standardized OTC derivatives (IRS, CDS) must be cleared through EU-authorized CCPs (Central Counterparties like LCH, Eurex Clearing)\n- **Reporting obligation:** All derivative transactions must be reported to an EU Trade Repository within one business day\n- **Risk mitigation techniques:** Non-cleared derivatives require daily margining, portfolio reconciliation, and dispute resolution procedures\n\n**GDPR — General Data Protection Regulation**\nWhile not financial-sector-specific, GDPR has major implications for financial firms handling EU resident data:\n- Banks and asset managers must have a legal basis for processing customer data (consent, contract, legitimate interest)\n- **Data retention limits:** KYC records can be retained under AML requirements (5–10 years), which can conflict with GDPR data minimization principles\n- **Right to erasure:** Customers can request deletion of personal data — but AML/regulatory retention obligations override this\n- Non-compliance penalties: up to €20M or 4% of global annual turnover, whichever is higher\n\n**Why Global Standards Matter:**\nBasel III is an international framework developed by the Basel Committee on Banking Supervision (BCBS), a committee of central banks. Global coordination prevents regulatory arbitrage — banks shifting activities to jurisdictions with weaker rules. Post-2008, the G20 committed to implementing Basel III, creating a level playing field for internationally active banks.",
          highlight: ["EMIR", "clearing obligation", "CCP", "GDPR", "data retention", "Basel Committee", "regulatory arbitrage"],
        },
        {
          type: "teach",
          title: "SEC vs CFTC — US Regulatory Turf",
          content:
            "The US has two primary federal market regulators with distinct jurisdictions that sometimes overlap — leading to coordination challenges and jurisdictional disputes.\n\n**Securities and Exchange Commission (SEC)**\n- Jurisdiction: Securities — stocks, bonds, ETFs, mutual funds, options on securities, security-based swaps (single-name CDS, narrow-based index CDS)\n- Key laws: Securities Act 1933, Securities Exchange Act 1934, Investment Advisers Act 1940, Investment Company Act 1940\n- Oversees: Stock exchanges (NYSE, NASDAQ), broker-dealers, investment advisers, investment companies, public company reporting\n\n**Commodity Futures Trading Commission (CFTC)**\n- Jurisdiction: Commodity futures and derivatives — futures contracts on any underlying commodity (including financial commodities: interest rates, FX, equity indices), options on futures, swaps (rate swaps, FX swaps, broad-based index CDS)\n- Key laws: Commodity Exchange Act (CEA), amended by Dodd-Frank Title VII\n- Oversees: Futures exchanges (CME, ICE), futures commission merchants (FCMs), swap dealers, major swap participants\n\n**The Gray Zone:**\n- Equity index futures (S&P 500 futures) → CFTC\n- Options on individual stocks → SEC\n- Security futures (single-stock futures) → jointly regulated by SEC and CFTC\n- Bitcoin/ETH spot: currently considered commodities (CFTC jurisdiction) — though the SEC has argued certain crypto tokens are securities\n- FX spot: neither; primarily regulated by the Fed and OCC for banks\n\n**Coordination:** The agencies signed a memorandum of understanding and coordinate on joint rulemaking (e.g., security-based swap rules), but turf battles are common, particularly over cryptocurrency jurisdiction.",
          highlight: ["SEC", "CFTC", "security-based swap", "commodity futures", "Commodity Exchange Act", "jurisdiction"],
        },
        {
          type: "quiz-mc",
          question:
            "Under MiFID II, can a fund manager pay for sell-side research reports by directing client trading commissions to the broker that produced the research?",
          options: [
            "No — MiFID II requires research costs to be paid separately from execution commissions, either from the manager's own budget or a client Research Payment Account",
            "Yes — directing commission flow to pay for research (soft dollars) is fully permitted under MiFID II as long as the manager discloses the arrangement in its annual report",
            "Yes — but only if the research is produced by a broker with a best execution agreement in place",
            "No — MiFID II prohibits fund managers from purchasing any third-party research, requiring all analysis to be conducted in-house",
          ],
          correctIndex: 0,
          explanation:
            "MiFID II's research unbundling provisions explicitly prohibit the traditional soft-dollar model where execution commissions implicitly pay for research. Fund managers must now either absorb research costs through their own P&L or set up a Research Payment Account (RPA) funded separately from client commissions with transparent pricing. The goal is to remove conflicts of interest where managers directed excess trading to brokers in exchange for research, generating unnecessary transaction costs for clients.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The CFTC regulates options on individual stocks traded on US exchanges, while the SEC regulates S&P 500 futures contracts traded on the CME.",
          correct: false,
          explanation:
            "False — the jurisdictions are reversed. Options on individual stocks (equity options) are SEC-regulated securities derivatives. S&P 500 futures contracts are commodity futures regulated by the CFTC. The dividing line is generally: listed equity options → SEC; futures on indices/commodities/rates/FX → CFTC. Single-stock futures are the notable exception — they fall under joint SEC/CFTC jurisdiction.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A European asset manager acquires personal data from EU retail investors for KYC/AML onboarding purposes. After 7 years, the investors request that their data be deleted under GDPR's right to erasure.",
          question: "How should the asset manager respond?",
          options: [
            "Decline the erasure request for data subject to AML/regulatory retention obligations — regulatory requirements override GDPR's right to erasure",
            "Immediately delete all personal data upon request — GDPR's right to erasure has no exceptions in financial services",
            "Delete the data but retain a log noting that the data existed, which satisfies both GDPR and AML requirements",
            "Escalate to the national data protection authority and await their ruling before taking any action",
          ],
          correctIndex: 0,
          explanation:
            "GDPR's right to erasure (Article 17) explicitly excludes data that must be retained to comply with a legal obligation. EU AML directives (the 5th and 6th AMLD) require financial institutions to retain KYC and transaction records for at least 5 years (and up to 10 years in some jurisdictions) after the end of a business relationship. This legal retention obligation overrides the GDPR erasure right. The manager should inform the investor that the data is being retained pursuant to regulatory requirements and specify the retention period.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Compliance & Risk Management ─────────────────────────────────
    {
      id: "finreg-5",
      title: "Compliance & Risk Management",
      description:
        "Three lines of defense, AML/KYC, FINRA rules, whistleblower protections, and landmark regulatory penalties",
      icon: "ShieldCheck",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Three Lines of Defense Model",
          content:
            "The 'Three Lines of Defense' (3LoD) model is the industry-standard framework for organizing risk management and compliance within financial institutions. It defines how responsibility for managing risk is distributed across the organization.\n\n**First Line — Business Units (Own the Risk)**\nFront-office staff, traders, sales teams, loan officers — the employees who take on risk as part of generating revenue. They:\n- Identify and manage risks inherent in their daily activities\n- Implement and adhere to policies and controls\n- Escalate issues to the second line\n- 'Own' the risks they generate\n\n**Second Line — Risk Management & Compliance (Oversee the Risk)**\nIndependent of the first line but embedded in the company:\n- **Risk Management:** Sets risk appetite, monitors exposures, models risks (credit, market, operational), establishes limits\n- **Compliance:** Monitors adherence to laws, regulations, and internal policies; provides guidance and training; advises on regulatory change\n- Second-line functions report to CRO (Chief Risk Officer) and CCO (Chief Compliance Officer), who have direct access to the Board\n\n**Third Line — Internal Audit (Challenge Everything)**\nFully independent of both business and risk/compliance:\n- Provides objective assurance to the Board Audit Committee\n- Tests the effectiveness of first and second-line controls\n- Reviews whether policies are actually followed, not just written\n- Reports significant issues directly to the Audit Committee, bypassing management if necessary\n\n**External Audit & Regulators** are sometimes called a 'fourth line' — but the IIA (Institute of Internal Auditors) model ends at three.",
          highlight: ["three lines of defense", "first line", "second line", "third line", "internal audit", "compliance", "CRO", "CCO"],
        },
        {
          type: "teach",
          title: "AML/KYC Requirements",
          content:
            "Anti-Money Laundering (AML) and Know Your Customer (KYC) requirements form one of the most resource-intensive compliance obligations for financial institutions.\n\n**Bank Secrecy Act (BSA) — The Foundation**\nThe BSA (1970) requires US financial institutions to assist the government in detecting and preventing money laundering and financial crimes. Key obligations:\n- **Customer Identification Program (CIP):** Verify the identity of every customer — individuals require name, DOB, address, and SSN/passport. Legal entities require beneficial ownership information.\n- **Beneficial Ownership Rule (FinCEN 2018):** Banks must identify natural persons owning 25%+ of a legal entity customer and the individual who controls the entity.\n- **Suspicious Activity Reports (SARs):** File a SAR within 30 days when a transaction of $5,000+ involves suspected money laundering, terrorist financing, or fraud. SARs are filed with FinCEN and are highly confidential ('tipping off' a customer that a SAR was filed is a criminal offense).\n- **Currency Transaction Reports (CTRs):** Automatically file a CTR for any cash transaction over $10,000.\n\n**AML Program Requirements:**\nEvery bank must maintain a written AML program with four core elements:\n1. Internal controls and policies\n2. Designation of a BSA/AML Compliance Officer\n3. Ongoing employee training\n4. Independent testing (internal audit)\n\n**FATF — International Standard Setting:**\nThe Financial Action Task Force (FATF) sets global AML/CFT (countering the financing of terrorism) standards. Countries on the FATF 'grey list' face enhanced scrutiny.",
          highlight: ["AML", "KYC", "Bank Secrecy Act", "SAR", "CTR", "beneficial ownership", "FinCEN", "FATF"],
        },
        {
          type: "teach",
          title: "FINRA Rules, Whistleblowers & Landmark Penalties",
          content:
            "**FINRA Rules — Broker-Dealer Obligations**\n\n**Rule 2111 — Suitability:**\nBrokers must have a reasonable basis to believe a recommended transaction or strategy is suitable for the customer based on the customer's investment profile (risk tolerance, financial situation, investment objectives, time horizon, liquidity needs).\n\n**Regulation Best Interest (Reg BI — SEC, 2020):**\nElevated standard for broker-dealers making recommendations to retail customers. Brokers must:\n- Act in the retail customer's *best interest* at the time of the recommendation\n- Not place the firm's financial or other interests ahead of the customer's\n- Disclose material conflicts of interest\n- Establish policies to identify and mitigate conflicts\nReg BI is stricter than suitability but falls short of the full fiduciary standard applied to RIAs.\n\n**SEC Whistleblower Program (Dodd-Frank Section 922):**\nTo incentivize reporting of securities violations:\n- Whistleblowers who provide original information leading to SEC enforcement actions with sanctions >$1M receive **10–30% of the monetary sanctions collected**\n- Strong anti-retaliation protections — employers cannot fire, demote, or harass whistleblowers\n- Anonymous submissions are permitted through an attorney\n- Since inception (2011), the SEC has awarded over $1.9 billion to whistleblowers\n\n**Landmark Penalties:**\n- **Wells Fargo (2020): $3B** — unauthorized account openings (2+ million fake accounts), cross-selling fraud, and CFPB consent order\n- **Goldman Sachs 1MDB (2020): $5B** — bribery and money laundering related to Malaysian sovereign wealth fund fraud\n- **JPMorgan Spoofing (2020): $920M** — precious metals and Treasury market spoofing (placing and canceling orders to manipulate prices) by traders over 8+ years",
          highlight: ["FINRA Rule 2111", "Reg BI", "best interest", "whistleblower", "SEC whistleblower", "spoofing", "Wells Fargo", "Goldman Sachs"],
        },
        {
          type: "quiz-mc",
          question:
            "A broker recommends a high-fee mutual fund to a retail client. A nearly identical, better-performing fund with significantly lower fees is available but would generate less commission for the broker. The broker proceeds with the recommendation solely because of the higher compensation. Which rule does this most directly violate?",
          options: [
            "Regulation Best Interest (Reg BI) — which requires brokers to act in the retail customer's best interest and not place the firm's financial interests ahead of the customer's",
            "FINRA Rule 2111 (Suitability) — the recommendation fails the suitability test because the customer cannot afford the fees",
            "Regulation FD — the broker failed to disclose the existence of the lower-fee alternative to the public simultaneously",
            "The Investment Advisers Act 1940 — broker-dealers are subject to the same fiduciary duty as RIAs under this act",
          ],
          correctIndex: 0,
          explanation:
            "This scenario is the paradigmatic Reg BI violation. Reg BI (effective June 2020) explicitly requires that when making a recommendation to a retail customer, a broker must act in that customer's best interest and cannot place the firm's financial interests ahead of the customer's. Recommending a higher-fee product over a superior lower-fee alternative primarily to earn more commission directly violates this standard. Reg BI applies to broker-dealers; the Investment Advisers Act applies to RIAs. The suitability standard (Rule 2111) does not specifically address fee comparison between equivalent products.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A bank employee who files a Suspicious Activity Report (SAR) with FinCEN may notify the customer that a SAR was filed to maintain transparency and good customer relations.",
          correct: false,
          explanation:
            "False. 'Tipping off' — informing a customer, suspect, or any person involved in the suspicious transaction that a SAR has been filed — is a federal crime under the Bank Secrecy Act (31 U.S.C. § 5318(g)(2)). SAR filings are strictly confidential. The prohibition exists because alerting a suspect could allow them to move funds, destroy evidence, or evade law enforcement. Bank employees are prohibited from acknowledging the existence of a SAR even in response to a subpoena, unless specifically authorized.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An analyst at an investment bank discovers evidence that her firm has been systematically front-running large institutional client orders — executing proprietary trades in the same direction as client orders before executing those client orders. She has documented the conduct with emails and trading records.",
          question: "What is the analyst's best course of action to maximize both legal protection and potential financial reward?",
          options: [
            "Report the conduct to the SEC Whistleblower Office — she is entitled to 10–30% of sanctions if her original information leads to a successful enforcement action exceeding $1M, with anti-retaliation protections",
            "Report internally to her firm's compliance department only — whistleblower protections and awards only apply to internal reporting programs, not SEC reporting",
            "Report to FINRA's whistleblower program — FINRA administers the securities industry whistleblower program and pays higher awards than the SEC",
            "Consult a lawyer but take no action — whistleblower laws only protect employees who report through official HR channels before going to the SEC",
          ],
          correctIndex: 0,
          explanation:
            "The SEC Whistleblower Program (Dodd-Frank Section 922) is the correct path. It provides the strongest combination of financial incentives (10–30% of sanctions over $1M) and legal protections (anti-retaliation provisions, right to anonymous submission through an attorney). Front-running client orders is a serious securities fraud violation — the SEC enforcement action could easily exceed $1M, triggering the award. Internal compliance reporting may alert the firm but does not by itself trigger SEC protections or financial awards. FINRA has its own whistleblower program but it is the SEC program that applies to this type of securities fraud.",
          difficulty: 3,
        },
      ],
    },
  ],
};
