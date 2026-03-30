import type { Unit } from "./types";

export const UNIT_WEALTH_MANAGEMENT: Unit = {
  id: "wealth-management",
  title: "Wealth Management",
  description:
    "Master HNW financial planning, alternatives, estate planning, family offices, and international wealth strategies",
  icon: "Briefcase",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: High Net Worth Financial Planning ─────────────────────────────
    {
      id: "wm-hnw-planning",
      title: "High Net Worth Financial Planning",
      description:
        "Wealth tiers, comprehensive financial plans, investment policy statements, and tax-efficient strategies for HNW individuals",
      icon: "BarChart2",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "HNW Wealth Tiers & Their Unique Needs",
          content:
            "Wealth management is not one-size-fits-all. Advisors segment clients into tiers based on investable assets, because each tier faces distinct challenges:\n\n**Mass Affluent ($500K–$1M)**: Primary needs are efficient retirement planning, tax optimization, and basic estate planning. Standard financial advisors and robo-advisors suffice.\n\n**High Net Worth — HNW ($1M–$10M)**: Tax complexity increases significantly. Alternative investments become accessible. Estate planning moves beyond a simple will to trusts. Private banking relationships begin. Charitable giving strategies emerge.\n\n**Very High Net Worth — VHNW ($10M–$30M)**: Multi-generational wealth transfer becomes a priority. Business succession planning. Access to private equity, hedge funds, and direct investments. Sophisticated trust structures (GRATs, IDGTs). Dedicated wealth management teams.\n\n**Ultra High Net Worth — UHNW ($30M+)**: Family office territory. Philanthropy strategy and foundations. International structures and cross-border planning. Art, collectibles, and passion investments. Family governance and legacy planning become as important as investment returns.\n\nEach tier up adds layers of complexity — not just more zeros on a spreadsheet.",
          highlight: ["mass affluent", "HNW", "VHNW", "UHNW", "family office", "estate planning", "alternative investments"],
        },
        {
          type: "teach",
          title: "The Comprehensive Financial Plan",
          content:
            "A true HNW financial plan is far more than a portfolio allocation. It integrates every dimension of financial life:\n\n**Personal Balance Sheet**: List all assets (investment accounts, real estate, business interests, retirement accounts, cash, collectibles) and all liabilities (mortgages, margin loans, business debt). Net worth = assets minus liabilities. Updated annually.\n\n**Cash Flow Statement**: Total income from all sources (salary, dividends, rental, business distributions) minus total expenses. Savings rate = net savings / gross income. HNW advisors target 20–30%+ savings rates.\n\n**Investment Policy Statement (IPS)**: A written document defining investment objectives, return targets, risk tolerance, time horizon, liquidity needs, tax situation, and constraints. The IPS prevents emotional decision-making during market volatility — it is the constitution for the portfolio.\n\n**Risk Capacity vs. Risk Tolerance**: Risk *capacity* is what you can objectively afford to lose (financial ability). Risk *tolerance* is your psychological comfort with volatility. True risk profile is the lower of the two.\n\n**Insurance Audit**: Review all coverage annually — life, disability, umbrella, property, liability. Gaps can destroy decades of wealth accumulation.\n\n**Estate Plan Review**: Will, trust documents, beneficiary designations, power of attorney, healthcare directives — updated after every major life event.",
          highlight: ["balance sheet", "cash flow", "IPS", "investment policy statement", "risk capacity", "risk tolerance", "insurance audit"],
        },
        {
          type: "teach",
          title: "Tax-Efficient Investing for HNW Clients",
          content:
            "At HNW levels, tax drag on a portfolio can cost millions over a lifetime. Key strategies:\n\n**Asset Location** (not asset allocation): Place each investment in the account type that minimizes its tax cost.\n- *Taxable accounts*: Hold tax-efficient assets — broad market index funds (low turnover, qualified dividends, long-term capital gains), municipal bonds, tax-managed funds\n- *Tax-deferred (401k/IRA)*: Hold tax-inefficient assets — REITs (high ordinary income distributions), high-yield bonds, actively traded funds\n- *Tax-free (Roth)*: Hold highest-growth assets — small-cap stocks, growth equities — since all gains are permanently tax-free\n\n**Tax-Loss Harvesting at Scale**: Realize capital losses to offset gains. At HNW levels, systematic harvesting across a large taxable portfolio can save tens of thousands per year.\n\n**Direct Indexing**: Instead of buying an S&P 500 ETF, own all 500 stocks individually. This creates thousands of individual lots, enabling far more tax-loss harvesting opportunities than a single ETF. Accessible with $250K+ in taxable accounts.\n\n**Charitable Giving Strategies**:\n- *Donor Advised Fund (DAF)*: Contribute appreciated securities, get immediate deduction, distribute to charities over time\n- *Charitable Remainder Trust (CRT)*: Donate assets, receive income stream, remainder goes to charity\n- *Charitable Lead Trust (CLT)*: Charity receives income first, remainder passes to heirs — reduces estate",
          highlight: ["asset location", "tax-loss harvesting", "direct indexing", "DAF", "donor advised fund", "CRT", "CLT", "Roth", "tax-deferred"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary tax advantage of direct indexing over owning an S&P 500 ETF for a high net worth investor?",
          options: [
            "Ability to harvest losses at the individual stock level, generating far more tax-loss harvesting opportunities than a single ETF",
            "Lower expense ratios than any ETF available in the market",
            "Automatic rebalancing without triggering any capital gains taxes",
            "Access to pre-IPO shares of companies before they enter the index",
          ],
          correctIndex: 0,
          explanation:
            "Direct indexing owns each underlying stock as a separate lot. When individual stocks decline (which happens constantly even in bull markets), you can harvest those specific losses. An ETF is a single security — you can only harvest a loss if the entire ETF is down. Over time, this produces significantly more tax alpha than ETF investing, especially in large taxable portfolios.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An Investment Policy Statement (IPS) is most valuable during periods of market volatility because it provides pre-committed rules that prevent emotional deviations from the long-term strategy.",
          correct: true,
          explanation:
            "True. The IPS is essentially a written contract an investor makes with themselves in calm conditions. When markets crash or surge, the IPS specifies what actions to take (or not take), the rebalancing triggers, and the return targets — preventing panic selling or euphoric buying. Its value is highest precisely when emotions run highest.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A HNW client has $3M in total assets: $800K in a 401(k), $400K in a Roth IRA, and $1.8M in a taxable brokerage account. They hold REITs (high ordinary income), municipal bonds (tax-exempt income), and a total stock market index fund.",
          question:
            "Which asset location arrangement is most tax-efficient?",
          options: [
            "REITs in the 401(k), municipal bonds in the taxable account, index fund split across Roth and taxable",
            "REITs in the taxable account, municipal bonds in the 401(k), index fund in the Roth",
            "All three assets split equally across all three account types",
            "Municipal bonds in the Roth IRA, REITs in the taxable account, index fund in the 401(k)",
          ],
          correctIndex: 0,
          explanation:
            "REITs belong in tax-deferred accounts (like the 401k) because their high ordinary income distributions are sheltered from current taxes. Municipal bonds are already tax-exempt, so they are wasted in a tax-advantaged account — they belong in the taxable account. The index fund (tax-efficient, low turnover) is fine in a taxable account or the Roth, with highest-growth assets ideally in the Roth for permanent tax-free compounding.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Alternative Investments for Wealth ────────────────────────────
    {
      id: "wm-alternatives",
      title: "Alternative Investments for Wealth",
      description:
        "Private equity, private credit, hedge funds, real assets, and collectibles — the building blocks of HNW portfolios",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Alternatives in HNW Portfolios",
          content:
            "The traditional 60/40 portfolio (stocks/bonds) was designed for retail investors. HNW and institutional investors have long allocated heavily to alternative assets, seeking higher returns, diversification, and access to the illiquidity premium.\n\n**The Yale Endowment Model**: David Swensen pioneered the institutional approach at Yale, allocating approximately 40% to alternatives (private equity, venture capital, hedge funds, real assets, natural resources). Yale's endowment returned ~10%/year over 20 years vs. ~6–7% for a 60/40 portfolio.\n\n**Major Alternative Categories:**\n- **Private Equity / Venture Capital**: Ownership stakes in private companies. Illiquid (7–12 year fund life). Historically 3–5% annual premium over public equities.\n- **Private Credit**: Direct loans to companies, bypassing banks. Floating rate, senior secured. Yields of 8–15%+ depending on risk.\n- **Hedge Funds**: Liquid alternatives using long/short, global macro, arbitrage, quant strategies. Aims for uncorrelated returns.\n- **Real Assets**: Timberland, farmland, infrastructure (toll roads, airports, pipelines). Inflation-linked cash flows.\n- **Collectibles**: Art, wine, classic cars, rare whisky, sports memorabilia — passion investments with real return potential.\n\n**Liquidity Premium**: Investors accept illiquidity in exchange for higher expected returns. Alternatives typically lock up capital for years — only suitable for investors with adequate liquid reserves.",
          highlight: ["alternatives", "Yale endowment", "private equity", "private credit", "hedge funds", "real assets", "liquidity premium"],
        },
        {
          type: "teach",
          title: "Private Credit — The Shadow Banking Opportunity",
          content:
            "Private credit has exploded from a niche asset class into a $1.5+ trillion market, filling the void left by banks after the 2008 financial crisis and Dodd-Frank regulations constrained traditional bank lending.\n\n**Key Segments:**\n- **Direct Lending**: First-lien, senior secured loans to middle-market companies. Floating rate (typically SOFR + 5–7%). Yields of 8–12% in current markets. The largest and most conservative segment.\n- **Mezzanine / Junior Debt**: Subordinated debt with equity features (warrants, PIK interest). Higher risk, 12–16% target returns. Fills the gap between senior debt and equity.\n- **Distressed Debt**: Buying bonds or loans of companies in financial distress at 30–60 cents on the dollar. High risk, high reward. Requires deep credit analysis and legal expertise.\n- **NAV Lending**: Loans backed by a private equity fund's net asset value. Used by GPs to provide liquidity without selling assets.\n\n**Why Private Credit Grew:**\n- Post-2008 bank regulation reduced bank lending appetite\n- Companies valued speed and certainty over cheapest possible rate\n- Dodd-Frank capital requirements made bank loans less profitable\n\n**Key Risks:**\n- **Illiquidity**: No public market; you cannot sell easily\n- **Credit cycle exposure**: Defaults spike in recessions\n- **Covenant-lite trend**: Borrower protections have weakened since 2015, increasing lender risk\n- Floating rates protect lenders against rising rates (vs. fixed-rate bonds)",
          highlight: ["private credit", "direct lending", "mezzanine", "distressed debt", "floating rate", "covenant-lite", "Dodd-Frank"],
        },
        {
          type: "teach",
          title: "Collectibles & Passion Investments",
          content:
            "For VHNW and UHNW individuals, collectibles serve dual purposes: enjoyment and portfolio diversification. They are uncorrelated to financial markets and have shown real historical returns.\n\n**Art**: The Mei Moses Art Index tracked auction results and showed average annual returns of ~5–9% for blue-chip art over long periods — comparable to bonds, with lower correlation to stocks. Contemporary art and NFT-era digital art carry far higher volatility.\n\n**Fine Wine**: The Liv-ex Fine Wine 1000 index tracks the 1,000 most-traded wines. Bordeaux first growths (Petrus, Mouton Rothschild) have historically returned 8–12% annually in good decades. Storage and provenance are critical.\n\n**Classic Cars**: Vintage Ferraris, Porsches, and Aston Martins in concours condition have outperformed the S&P 500 in several decades. The HAGI Top Index tracks classic car performance.\n\n**Rare Whisky**: The Rare Whisky 101 Apex 1000 index showed dramatic returns 2014–2022, with some single casks appreciating 500%+.\n\n**Key Risks for All Collectibles:**\n- **Authenticity and Provenance**: Forgeries are common in art; misattribution destroys value. Always require expert authentication and provenance documentation.\n- **Insurance**: Specialized fine art/collectibles insurance required; standard homeowners is insufficient\n- **Storage**: Climate-controlled storage for wine, humidity control for art; costs 0.5–1% of value/year\n- **Estate Valuation**: Illiquid assets are hard to value at death; require specialized appraisers for estate tax purposes\n- **Liquidity**: Auction houses charge 15–25% buyer's premiums; selling takes months",
          highlight: ["collectibles", "Mei Moses", "Liv-ex", "fine wine", "classic cars", "provenance", "authenticity", "insurance"],
        },
        {
          type: "quiz-mc",
          question:
            "The Yale Endowment Model, pioneered by David Swensen, is notable for allocating approximately what percentage of the portfolio to alternative investments?",
          options: [
            "~40% to alternatives including private equity, venture capital, hedge funds, and real assets",
            "~10% to alternatives as a minor diversifier alongside a 60/40 core",
            "~80% to alternatives, eliminating traditional stocks and bonds entirely",
            "~25% to alternatives, split equally between real estate and commodities",
          ],
          correctIndex: 0,
          explanation:
            "David Swensen's Yale Endowment pioneered the 'endowment model' with roughly 40% in alternatives — private equity, venture capital, hedge funds, real assets, and natural resources. This approach, combined with deep manager due diligence, generated ~10%/year over two decades, significantly outperforming traditional 60/40 portfolios. It became the template for institutional investing globally.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Private credit's floating rate structure is an advantage over fixed-rate bonds in a rising interest rate environment because loan yields automatically increase with benchmark rates.",
          correct: true,
          explanation:
            "True. Most private credit loans are priced at a floating rate — typically a benchmark rate (SOFR) plus a fixed spread. As benchmark rates rise, the interest payments on the loan increase automatically, protecting lenders' real returns. Fixed-rate bonds, by contrast, lose market value when rates rise because their coupon is locked in at the original rate. This is why private credit attracted massive inflows during the 2022–2024 rate-hiking cycle.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A UHNW investor has a $20M liquid portfolio. Their advisor proposes increasing alternatives from 10% to 30% by adding private equity (illiquid, 10-year lockup), private credit (quarterly liquidity), and a classic car collection. The investor has $2M in annual living expenses and no other liquid assets.",
          question:
            "What is the primary risk concern the investor must address before committing to the proposed allocation?",
          options: [
            "Liquidity risk — $6M locked in illiquid alternatives leaves only $14M liquid to cover $2M/year expenses and unexpected needs",
            "Currency risk — alternative investments are often denominated in foreign currencies",
            "Tax risk — alternative investments always generate ordinary income rather than capital gains",
            "Concentration risk — owning too few individual stocks within private equity funds",
          ],
          correctIndex: 0,
          explanation:
            "Before committing capital to illiquid alternatives, investors must ensure adequate liquidity. With $20M total and $6M in alternatives (30%), only $14M remains liquid — 7 years of living expenses, which seems comfortable. However, if $8M of the $14M is in private equity with capital calls coming over 3–5 years, actual accessible liquidity could be much lower. The liquidity timeline must be stress-tested before committing.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Estate Planning Mastery ──────────────────────────────────────
    {
      id: "wm-estate-planning",
      title: "Estate Planning Mastery",
      description:
        "Trusts, gift/estate tax strategies, GRATs, IDGTs, and business succession planning for HNW families",
      icon: "FileText",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Estate Planning Tools & Document Hierarchy",
          content:
            "Estate planning creates a legal framework to transfer wealth to the next generation efficiently and according to your wishes.\n\n**Will (Last Will and Testament)**: The foundational document directing asset distribution at death. Requires **probate** — a public, court-supervised process that can take 6–18 months and cost 2–5% of the estate. Wills are public record after death.\n\n**Revocable Living Trust**: A trust you control during your lifetime. Assets held in the trust **avoid probate** — they transfer immediately and privately. No estate tax benefit (assets remain in your taxable estate), but the probate bypass alone saves significant time, cost, and privacy.\n\n**Irrevocable Trust**: Once created, you give up control permanently. Assets are removed from your taxable estate, providing estate tax benefits. Many varieties exist (GRAT, IDGT, SLAT, DAPT).\n\n**Pour-Over Will**: Accompanies a revocable trust. Directs any assets not already titled in the trust to 'pour over' into it at death — a safety net for forgotten or new assets.\n\n**Durable Power of Attorney**: Designates someone to manage financial affairs if you become incapacitated.\n\n**Healthcare Directive (Living Will + Healthcare Proxy)**: Specifies medical treatment preferences and designates a healthcare decision-maker if you cannot speak for yourself.\n\n**Critical rule**: Beneficiary designations (retirement accounts, life insurance, TOD accounts) supersede your will entirely. Keep them current.",
          highlight: ["will", "probate", "revocable living trust", "irrevocable trust", "pour-over will", "power of attorney", "healthcare directive", "beneficiary designations"],
        },
        {
          type: "teach",
          title: "Tax-Efficient Estate Transfer Strategies",
          content:
            "The federal gift and estate tax applies to large transfers of wealth. Understanding the rules unlocks powerful planning strategies.\n\n**Unified Credit (2024)**: $13.61M per person ($27.22M per married couple). Estates below this pass to heirs estate-tax-free. **Warning**: The TCJA doubled the exemption, and it is scheduled to sunset (roughly halve) in 2026 — a major planning window closing.\n\n**Annual Gift Tax Exclusion**: $18,000 per recipient per year (2024) — you can give any number of people $18K/year without touching the lifetime exemption. A couple can give $36K/year per recipient.\n\n**529 Superfunding**: Front-load 5 years of annual exclusions into a 529 education savings account at once — $90K individual or $180K couple per beneficiary — removing a large sum from the estate immediately.\n\n**Grantor Retained Annuity Trust (GRAT)**: Transfer assets to a trust, receive an annuity back, and any appreciation above the IRS hurdle rate (7520 rate) passes to heirs completely estate and gift tax-free. Best when asset growth will significantly exceed the hurdle rate.\n\n**Intentionally Defective Grantor Trust (IDGT)**: An irrevocable trust that is outside your estate for estate tax purposes, but you still pay income taxes on trust earnings — effectively transferring additional wealth to heirs tax-free (the income tax payment is itself a gift not subject to gift tax).\n\n**Dynasty Trusts**: Multi-generational trusts in states without rule-against-perpetuities (Nevada, South Dakota, Delaware) that can compound wealth for 100+ years outside the estate tax system.",
          highlight: ["unified credit", "annual exclusion", "529 superfunding", "GRAT", "IDGT", "dynasty trust", "estate tax", "2026 sunset"],
        },
        {
          type: "teach",
          title: "Business Succession Planning",
          content:
            "For business owners, the business is often 70–90% of net worth. Succession planning ensures it transfers efficiently.\n\n**Buy-Sell Agreements**: A legally binding contract among business co-owners specifying what happens if an owner dies, becomes disabled, or wants to exit.\n- *Cross-purchase*: Remaining owners personally buy the departing owner's share\n- *Entity purchase (stock redemption)*: The business itself buys back the shares\n- *Wait-and-see*: Flexible hybrid determined at the triggering event\n- Almost always funded with **life insurance** on each owner so cash is available at death\n\n**Valuation Discounts**:\n- *Minority Interest Discount*: A minority stake (less than 50%) is worth less per-share than a controlling interest because the minority owner can't unilaterally make decisions. Typical discount: 15–35%.\n- *Lack of Marketability Discount (LOMD)*: Private company shares have no ready market, reducing fair market value. Combined with minority discount, total discounts of 30–40% are defensible.\n- These discounts allow more shares to pass to heirs within gift/estate tax limits.\n\n**ESOP (Employee Stock Ownership Plan)**:\n- Creates a trust that acquires company stock for employees\n- Owner can sell to the ESOP and **defer capital gains** (Section 1042 rollover into qualified replacement property)\n- Provides liquidity while keeping the company independent and rewarding employees\n\n**Family Limited Partnership (FLP)**:\n- General partners (parents) contribute business/investment assets; limited partners (children) receive interests over time via gifting\n- LP interests qualify for minority and marketability discounts — transferring more value within exemption limits",
          highlight: ["buy-sell agreement", "cross-purchase", "entity purchase", "valuation discounts", "minority interest", "ESOP", "family limited partnership", "FLP"],
        },
        {
          type: "quiz-mc",
          question:
            "How does a Grantor Retained Annuity Trust (GRAT) transfer wealth to heirs estate and gift tax-free?",
          options: [
            "The grantor transfers assets to the trust, receives an annuity back, and any appreciation above the IRS hurdle rate passes to heirs tax-free",
            "The GRAT converts ordinary income into long-term capital gains rates for all beneficiaries",
            "Assets in a GRAT receive a stepped-up cost basis at the grantor's death, eliminating embedded gains",
            "The grantor pays no income tax on trust earnings, leaving more capital to compound for heirs",
          ],
          correctIndex: 0,
          explanation:
            "A GRAT works by transferring appreciating assets to an irrevocable trust. The grantor receives an annuity stream back (sized so the gift value equals the IRS 7520 hurdle rate). If the assets grow faster than the hurdle rate, that excess appreciation passes to heirs free of estate and gift tax. GRATs are most effective for assets expected to appreciate significantly — pre-IPO shares, private equity stakes, or any high-growth holding.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "When a person inherits appreciated assets, they receive a stepped-up cost basis equal to the fair market value at the date of the original owner's death, which eliminates the embedded capital gains tax on any appreciation during the original owner's lifetime.",
          correct: true,
          explanation:
            "True. The step-up in basis is one of the most powerful estate planning provisions in the US tax code. If a parent bought stock at $10 that grew to $100 at death, the heir's cost basis 'steps up' to $100. If the heir immediately sells, there is zero capital gain to tax. This eliminates potentially decades of accumulated unrealized gains. Estate planning strategies often revolve around which assets to hold until death (getting the step-up) vs. which to give during life.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A widow with a $15M estate wants to pass assets to her two adult children. Her estate includes a $3M family business (she is sole owner), $8M in marketable securities with $4M of embedded gains, and $4M in real estate. She is in good health at age 68 and the estate tax exemption is $13.61M.",
          question:
            "Which estate planning strategy most efficiently reduces her taxable estate while preserving family wealth?",
          options: [
            "Establish a GRAT with the $3M business interest and begin annual gifting of $36K to each child, leveraging valuation discounts on business interests via an FLP structure",
            "Give the entire estate to her children immediately and pay the resulting gift tax now to lock in current rates",
            "Convert all assets to cash and hold in a revocable living trust to avoid probate",
            "Purchase a whole life insurance policy equal to the estate tax liability and name children as beneficiaries",
          ],
          correctIndex: 0,
          explanation:
            "Her estate exceeds the exemption by ~$1.4M, triggering estate tax. The optimal strategy is multi-pronged: (1) A GRAT with the business interest — if it grows, appreciation escapes estate tax; (2) An FLP to create minority/marketability discounts on business interests, allowing more to pass within exemption limits; (3) Annual gifting ($36K/year per child) systematically reduces the estate over time. A revocable trust avoids probate but provides no tax benefit, and converting to cash destroys the step-up opportunity on the real estate and securities.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Family Office & Governance ───────────────────────────────────
    {
      id: "wm-family-office",
      title: "Family Office & Governance",
      description:
        "Single and multi-family office structures, family governance frameworks, and philanthropy strategy",
      icon: "Users",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Single vs. Multi-Family Office Structures",
          content:
            "A family office is a private organization managing the comprehensive financial, legal, and lifestyle affairs of a wealthy family. They range from lean investment-focused entities to full-service institutions with dozens of staff.\n\n**Single Family Office (SFO)**:\n- Dedicated exclusively to one family\n- Minimum AUM to justify costs: typically **$100M–$250M+**\n- Annual operating cost: **$1M–$3M+** (staff, technology, compliance, legal)\n- Services: Investment management, tax planning and filing, legal coordination, philanthropic administration, concierge and travel, family education, bill pay, insurance, estate planning execution\n- Complete privacy, fully customized strategy, long-term institutional memory\n- Often staffed with former investment bank, private equity, and legal professionals\n\n**Multi-Family Office (MFO)**:\n- Serves multiple wealthy families, sharing the infrastructure cost\n- Accessible at lower AUM — typically **$10M–$50M+** minimum\n- Annual cost shared across families makes it far more economical\n- Services are similar to SFO but less fully customized\n- May have conflicts of interest between families or across proprietary products\n- Many private banks (Goldman, JPMorgan, BofA Private Bank) operate as de facto MFOs\n\n**When to Consider a Family Office:**\n- Liquidity event (business sale, IPO) creating sudden large wealth\n- Complexity exceeds what one financial advisor can manage\n- Desire for investment access (co-investments, direct deals) unavailable through retail channels\n- Multi-generational family requiring coordinated planning across tax, estate, and investment",
          highlight: ["single family office", "SFO", "multi-family office", "MFO", "AUM", "liquidity event", "co-investments"],
        },
        {
          type: "teach",
          title: "Family Governance — Structuring Multi-Generational Wealth",
          content:
            "70% of family wealth is gone by the second generation; 90% by the third. This 'shirtsleeves to shirtsleeves in three generations' phenomenon is driven not by poor investments but by poor governance, communication, and preparation.\n\n**Family Constitution**: A written document articulating the family's mission, values, and shared vision. Covers how the family makes decisions, what the money is for, and what responsibilities accompany wealth. The governing document of the family unit.\n\n**Family Council**: A representative governance body for families with multiple branches. Makes collective investment, distribution, and governance decisions. Typically meets quarterly. May include non-family independent advisors.\n\n**Family Assembly**: Annual gathering of all family members — parents, children, grandchildren, spouses. Builds connection, shares information about the family's wealth and philosophy, and provides a forum for the next generation.\n\n**Next-Generation Education**: Teaching heirs about money management, investing, governance, and their responsibilities before they inherit. Includes financial literacy programs, exposure to the family office operations, and early participation in governance (non-voting initially).\n\n**Family Bank**: An internal lending facility that makes loans to family members for education, business ventures, or home purchases at favorable rates. Teaches financial responsibility while keeping capital within the family.\n\n**Conflict Resolution Framework**: Pre-agreed processes for mediating disagreements among family members — family mediators, independent board members, or pre-specified arbitration. Conflict is inevitable; the framework determines whether it destroys or strengthens the family.",
          highlight: ["family constitution", "family council", "family assembly", "next-gen education", "family bank", "conflict resolution", "shirtsleeves to shirtsleeves"],
        },
        {
          type: "teach",
          title: "Philanthropy & Family Legacy",
          content:
            "For UHNW families, philanthropy is not just generosity — it is a strategic component of wealth management, estate planning, and family identity.\n\n**Private Family Foundation**:\n- A tax-exempt 501(c)(3) controlled by the family\n- Requires a **5% minimum annual distribution** of assets to qualified charities\n- Significant administrative burden: IRS filings, investment policy, grant-making decisions, prohibition on self-dealing\n- Maximum charitable deduction: 30% of AGI for appreciated assets contributed\n- Provides family employment opportunities and a lasting legacy\n- Minimum practical size: $5M+ to justify overhead\n\n**Donor Advised Fund (DAF)**:\n- Simplest charitable vehicle — contribute assets, take immediate deduction, recommend grants to charities over time\n- No minimum distributions, no administrative overhead\n- Accessible at $5,000+ minimums through Fidelity Charitable, Schwab Charitable, or community foundations\n- Can invest contributions for growth before granting\n\n**Charitable Remainder Trust (CRT)**: Donate appreciated assets, avoid capital gains, receive an income stream (fixed annuity or percentage of assets), remainder goes to charity at death. Combines income, tax efficiency, and charitable giving.\n\n**Impact Investing**: Aligning the investment portfolio with the family's values — ESG integration, mission-related investments, program-related investments in nonprofits. The family office investment committee incorporates social/environmental objectives alongside financial returns.\n\n**Generational Wealth Studies**: Research consistently finds that lack of communication and heir preparation — not market performance — explains generational wealth loss. Families that discuss money openly and involve the next generation early sustain wealth far longer.",
          highlight: ["family foundation", "5% distribution", "donor advised fund", "DAF", "charitable remainder trust", "impact investing", "generational wealth"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the IRS-required minimum annual distribution percentage from a private family foundation's assets?",
          options: [
            "5% of investment assets annually must be distributed to qualified charitable organizations",
            "10% of annual investment income must be distributed to public charities",
            "25% of new contributions must be granted out within the first year",
            "There is no minimum distribution requirement — foundations may accumulate assets indefinitely",
          ],
          correctIndex: 0,
          explanation:
            "Private foundations must distribute at least 5% of their net investment assets annually for charitable purposes. This is enforced by the IRS as an excise tax on undistributed income. The 5% rule ensures foundations actively deploy assets for charitable purposes rather than merely accumulating them. This administrative requirement — combined with self-dealing rules, investment restrictions, and annual reporting — makes foundations more complex and costly to operate than donor advised funds.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A multi-family office (MFO) is accessible at lower asset levels than a single family office (SFO) because multiple families share the cost of investment infrastructure, compliance, technology, and professional staff.",
          correct: true,
          explanation:
            "True. A single family office requires $100M–$250M+ in assets just to justify its $1M–$3M annual operating cost. A multi-family office spreads those costs across dozens of client families, making the service model economically viable for families with $10M–$50M. The trade-off is less complete customization and potential conflicts of interest between client families, compared to the fully dedicated and private SFO model.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A family sold their business for $80M and suddenly has substantial wealth. They have four adult children from two marriages, aged 22–38. Some children are financially responsible; others have struggled with spending. The patriarch wants to support all children while preserving wealth for grandchildren.",
          question:
            "Which family office and governance approach best addresses this situation?",
          options: [
            "Establish an MFO relationship, create a family constitution defining values and distribution rules, implement a next-gen education program, and use a spendthrift trust for children who have struggled financially",
            "Divide the $80M equally among all four children immediately and let each manage their own share",
            "Invest everything in a foundation to avoid all estate tax and distribute income to children as charitable salaries",
            "Set up a single family office immediately — at $80M, the SFO is cost-effective and fully customized",
          ],
          correctIndex: 0,
          explanation:
            "An MFO is more appropriate than an SFO at $80M (SFO costs $1–3M/year, consuming 1.25–3.75% of assets annually — too high). A family constitution and governance structure address the multi-branch complexity. A next-gen education program prepares younger children. Spendthrift trusts — where a trustee controls distributions rather than the beneficiary — protect children who have struggled with money from their own financial decisions while still providing for their needs.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: International Wealth Planning ─────────────────────────────────
    {
      id: "wm-international",
      title: "International Wealth Planning",
      description:
        "Global tax obligations, FATCA/FBAR, offshore structures, residency planning, and citizenship strategies for internationally mobile HNW individuals",
      icon: "Globe",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Global Tax Obligations for US Citizens",
          content:
            "The United States is one of only two countries in the world (with Eritrea) that taxes its citizens on **worldwide income regardless of where they live**. This citizenship-based taxation has sweeping implications for internationally mobile HNW individuals.\n\n**Key Reporting Obligations:**\n\n**FATCA (Foreign Account Tax Compliance Act, 2010)**: Requires foreign financial institutions (banks, brokerages, funds) to report accounts held by US persons to the IRS or face 30% withholding on US-source payments. From the US person's side, FATCA requires filing **Form 8938** disclosing foreign financial assets exceeding $50K (single) / $100K (married).\n\n**FBAR (FinCEN Form 114)**: Separately, any US person with foreign bank accounts exceeding **$10,000 in aggregate at any point during the year** must file an FBAR. Penalties for willful failure: greater of $100,000 or 50% of account balance per violation. Non-willful: $10,000 per violation.\n\n**Foreign Tax Credit**: To mitigate double taxation, the US allows a credit against US tax for taxes paid to foreign governments. For most countries with comparable tax rates, this eliminates most double taxation — but the compliance cost remains.\n\n**Foreign Earned Income Exclusion (FEIE)**: US citizens living abroad can exclude up to ~$126,500 (2024) of foreign earned income from US taxes — but this does not apply to investment income, which remains fully taxable.",
          highlight: ["citizenship-based taxation", "FATCA", "FBAR", "Form 8938", "foreign tax credit", "FEIE", "worldwide income"],
        },
        {
          type: "teach",
          title: "International Structures — Opportunities and Pitfalls",
          content:
            "Wealthy US persons sometimes use international structures to manage assets globally. However, US anti-avoidance rules are among the most sophisticated in the world.\n\n**Offshore Trusts**: Trusts established in jurisdictions with favorable trust law (Cook Islands, Cayman Islands, Liechtenstein, Jersey). For non-US persons, these can provide privacy and tax efficiency. For US grantors, the grantor trust rules typically result in the US grantor still paying US income tax on the trust's earnings. Asset protection from US creditors (not from the IRS) is the primary benefit.\n\n**Foreign LLCs and Corporations**: US persons owning foreign corporations face complex anti-deferral regimes:\n- **CFC (Controlled Foreign Corporation)** rules: If a US person owns >50% of a foreign corporation, certain income (Subpart F income — passive income, related-party sales) is taxed currently in the US even if not distributed.\n- **GILTI (Global Intangible Low-Taxed Income)**: Taxes the earnings of CFCs that exceed a routine 10% return on tangible assets.\n\n**PFIC (Passive Foreign Investment Company)**: Foreign mutual funds and ETFs are typically classified as PFICs under US tax law. Punitive tax treatment: all gains taxed as ordinary income at the highest rate, plus an interest charge. US persons should generally avoid non-US investment funds.\n\n**Substance Requirements**: Tax authorities globally require economic substance — actual operations, employees, and decision-making — in any jurisdiction claiming tax residency. Shell entities with no substance are increasingly challenged.",
          highlight: ["offshore trust", "Cook Islands", "Cayman Islands", "CFC", "GILTI", "Subpart F", "PFIC", "substance requirements"],
        },
        {
          type: "teach",
          title: "Residency, Citizenship, and Exit Planning",
          content:
            "For the most internationally mobile UHNW individuals, changing tax residency or even citizenship is a legitimate planning tool — but it carries significant consequences and costs.\n\n**Golden Visa / Residency by Investment Programs:**\n- **Portugal**: €500K real estate or €350K renovation investment; path to citizenship in 5 years; Schengen access\n- **Greece**: €250K real estate; no residency requirement; Schengen access\n- **UAE (Dubai)**: No income tax, capital gains tax, or estate tax; 10-year Golden Visa for $540K+ real estate investment or significant business activity\n- **Singapore**: High bar — requires significant business investment or net worth; global financial hub; territorial tax system\n\n**US Exit Tax (Section 877A)**: Americans who renounce citizenship or long-term green card holders who abandon status face a **mark-to-market exit tax** — all assets are deemed sold at fair market value on the day before expatriation. Net unrealized gains exceeding $866,000 (2024) are taxed. This is a significant one-time cost.\n\n**Puerto Rico — Act 60**: US citizens who relocate to Puerto Rico and become *bona fide residents* (183+ days/year) pay **0% US capital gains tax** on appreciation accrued after moving. Because Puerto Rico is a US territory, there is no expatriation required — you remain a US citizen. Individuals must sever ties to prior state of residence.\n\n**Monaco**: No income tax, no capital gains tax, no estate tax. Residency requires proving financial self-sufficiency and renting/buying property. Not useful for US citizens (who remain subject to US tax regardless of residence).\n\n**Political Risk Diversification**: Beyond tax optimization, having residency in multiple countries provides optionality against political instability, capital controls, or dramatic policy changes in any single country.",
          highlight: ["golden visa", "residency by investment", "UAE", "Portugal", "exit tax", "Section 877A", "Puerto Rico Act 60", "Monaco", "political risk"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary purpose of FATCA (Foreign Account Tax Compliance Act)?",
          options: [
            "To require foreign financial institutions to report accounts held by US persons to the IRS, preventing tax evasion through offshore accounts",
            "To allow US citizens living abroad to exclude foreign income from US taxation",
            "To impose a mark-to-market exit tax when Americans renounce their citizenship",
            "To create a tax credit for US citizens who pay taxes in foreign countries",
          ],
          correctIndex: 0,
          explanation:
            "FATCA, enacted in 2010 following offshore tax evasion scandals (notably UBS), requires foreign financial institutions worldwide to identify US account holders and report their account information directly to the IRS. Non-compliant institutions face a 30% withholding penalty on US-source payments. FATCA effectively ended the era of US persons hiding assets in anonymous offshore accounts — the IRS can now see foreign account balances reported by banks in over 110 countries.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A US citizen living and working in Germany for 10 years, paying full German income taxes, is still required to file US tax returns and potentially pay US income taxes on their worldwide income.",
          correct: true,
          explanation:
            "True. The US imposes citizenship-based taxation — one of only two countries in the world to do so. A US citizen living in Germany owes both German taxes (as a German resident) and US taxes (as a US citizen) on their worldwide income. The foreign tax credit prevents literal double payment in most cases, but the compliance obligation — filing US returns, FBARs, Form 8938, potentially Form 5471 for business interests — remains fully applicable regardless of residence. Many long-term US expats find the compliance burden so significant they consider renouncing citizenship.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A US tech entrepreneur has just sold her startup for $50M. She is single, 40 years old, and holds $45M in newly liquid cash and $5M in a brokerage account with $3M of embedded capital gains. Her CPA mentions Puerto Rico Act 60 and Dubai as potential tax planning options. She has no family ties requiring her to stay in a specific city.",
          question:
            "What is the most accurate assessment of these two options for her US tax planning?",
          options: [
            "Puerto Rico Act 60 allows 0% capital gains tax on future appreciation (as a US citizen remaining in the US territory) but requires 183+ days of genuine bona fide residency; Dubai has no income or capital gains tax but does not eliminate her US tax obligations since she remains a US citizen",
            "Both Puerto Rico and Dubai offer identical tax benefits for US citizens — complete exemption from all US federal taxes",
            "Dubai is the better option because renouncing citizenship eliminates the exit tax on her embedded gains",
            "Puerto Rico Act 60 applies retroactively to the $45M she just received, eliminating all federal capital gains taxes on the business sale",
          ],
          correctIndex: 0,
          explanation:
            "Puerto Rico Act 60 is a genuine US tax planning strategy — capital gains accruing after establishing bona fide Puerto Rico residency (183+ days/year, breaking prior state ties) are taxed at 0% for PR residents, and because PR is a US territory, no expatriation is required. However, it does NOT apply retroactively to the gains on the business sale already realized. Dubai offers no income or capital gains tax locally, but a US citizen living in Dubai still owes US tax on worldwide income — Dubai residency does not help a US citizen unless they renounce citizenship (which triggers the exit tax). The entrepreneur should consult a tax attorney immediately about Puerto Rico Act 60 for *future* appreciation on her $45M.",
          difficulty: 3,
        },
      ],
    },
  ],
};
