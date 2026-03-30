import { Unit } from "./types";

export const UNIT_REAL_ESTATE_ADVANCED: Unit = {
 id: "real-estate-advanced",
 title: "Advanced Real Estate Strategies",
 description:
 "Master commercial real estate, REITs, and sophisticated property investment strategies",
 icon: "Building2",
 color: "#10B981",
 lessons: [
 {
 id: "cre-fundamentals",
 title: "Commercial Real Estate Fundamentals",
 description:
 "Understand property types, key metrics, and lease structures that drive CRE investing",
 icon: "Building2",
 xpReward: 75,
 difficulty: "intermediate",
 duration: 12,
 steps: [
 {
 type: "teach",
 title: "Commercial Property Types",
 content:
 "Commercial real estate spans six major sectors:\n\n• **Office** — CBD towers and suburban campuses; vacancy-sensitive to employment trends\n• **Retail** — From neighborhood strips to regional malls; challenged by e-commerce\n• **Industrial** — Warehouses, distribution centers, and last-mile facilities; boom from logistics\n• **Multifamily** — Apartment complexes of 5+ units; driven by rental demand and demographics\n• **Hotel** — Hospitality assets with high operating leverage and RevPAR as the key metric\n• **Data Centers** — Digital infrastructure powering cloud computing; fastest-growing sector\n\nEach sector has distinct demand drivers, lease terms, and risk profiles. Industrial and data centers have dominated returns in recent years due to e-commerce and AI infrastructure build-out.",
 highlight: ["Office", "Industrial", "Data Centers", "Multifamily"],
 },
 {
 type: "teach",
 title: "NOI, Cap Rate, and the Value Equation",
 content:
 "**Net Operating Income (NOI)** is the cornerstone of CRE valuation:\n\nNOI = Gross Revenue Operating Expenses (excluding debt service)\n\nThe **capitalization rate** (cap rate) links NOI to property value:\n\n> Cap Rate = NOI ÷ Property Value\n\nRearranging gives the fundamental **value equation**:\n\n> Value = NOI ÷ Cap Rate\n\n**Example:** A warehouse generating $500,000 NOI in a market where industrial cap rates are 5% is worth $10,000,000.\n\nCap rates move inversely with value — when rates compress (fall), values rise; when rates expand (rise), values fall. Cap rate cycles are heavily influenced by interest rates and investor risk appetite.",
 highlight: ["NOI", "Cap Rate", "Value = NOI ÷ Cap Rate"],
 },
 {
 type: "quiz-mc",
 question:
 "A retail strip center generates $300,000 in gross rent. Operating expenses total $90,000. The prevailing market cap rate is 4.2%. What is the property's estimated value?",
 options: [
 "$3,500,000",
 "$5,000,000",
 "$4,500,000",
 "$2,100,000",
 ],
 correctIndex: 1,
 explanation:
 "NOI = Gross Rent Operating Expenses = $300,000 $90,000 = $210,000. Value = NOI ÷ Cap Rate = $210,000 ÷ 0.042 = $5,000,000. This illustrates how a low (compressed) cap rate translates modest NOI into a high property value — a dynamic common in hot markets where investors accept lower initial yields in exchange for expected appreciation.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "DSCR, LTV, and Debt Metrics",
 content:
 "Lenders evaluate CRE loans using two primary ratios:\n\n**Debt Service Coverage Ratio (DSCR)**\n> DSCR = NOI ÷ Annual Debt Service\n\nA DSCR of 1.0× means the property just covers its mortgage. Most lenders require 1.25×–1.35×. A DSCR below 1.0× signals the borrower must inject personal cash to cover payments.\n\n**Loan-to-Value (LTV)**\n> LTV = Loan Amount ÷ Property Value\n\nTypical CRE lenders cap LTV at 65–75%. Lower LTV = more borrower equity = lower lender risk.\n\n**Operating Expense Ratio (OER)**\n> OER = Operating Expenses ÷ Gross Revenue\n\nA rising OER erodes NOI. Well-managed assets typically run 35–45% OER.",
 highlight: ["DSCR", "LTV", "Operating Expense Ratio"],
 },
 {
 type: "quiz-tf",
 statement:
 "A triple-net (NNN) lease is advantageous for investors because the tenant pays property taxes, insurance, and maintenance, creating a more predictable, bond-like income stream for the landlord.",
 correct: true,
 explanation:
 "Correct. In a NNN lease, three major expense categories — property taxes, building insurance, and maintenance — pass through to the tenant. This dramatically reduces landlord operating burden and expense volatility, making NNN properties attractive to income-focused investors who want stable, passive cash flow similar to a bond.",
 difficulty: 1,
 },
 ],
 },
 {
 id: "reits-structure-analysis",
 title: "REITs Structure & Analysis",
 description:
 "Learn how REITs work, how to value them, and which sectors are driving returns",
 icon: "TrendingUp",
 xpReward: 80,
 difficulty: "intermediate",
 duration: 13,
 steps: [
 {
 type: "teach",
 title: "REIT Qualification Rules",
 content:
 "Real Estate Investment Trusts (REITs) are companies that own income-producing real estate and must meet strict IRS requirements:\n\n• **90% distribution rule** — Must distribute at least 90% of taxable income as dividends\n• **75% asset test** — At least 75% of total assets must be real estate, cash, or government securities\n• **75% income test** — At least 75% of gross income must come from real estate sources\n• **100 shareholders** — Must have at least 100 shareholders after the first year\n\nIn exchange for meeting these rules, REITs pay no corporate-level income tax, eliminating double taxation. This makes them highly attractive dividend vehicles for income investors.\n\n**REIT Types:**\n- **Equity REITs** — Own and operate properties (majority of REITs)\n- **Mortgage REITs (mREITs)** — Invest in mortgages and MBS; higher yield, higher rate sensitivity\n- **Hybrid REITs** — Combine both equity and mortgage strategies",
 highlight: ["90% distribution", "75% real estate assets", "Equity REITs", "Mortgage REITs"],
 },
 {
 type: "teach",
 title: "FFO, AFFO, and REIT Valuation",
 content:
 "Standard net income is misleading for REITs because real estate depreciation is a non-cash charge that artificially reduces earnings. Instead, analysts use:\n\n**Funds From Operations (FFO)**\n> FFO = Net Income + Depreciation Gains on Property Sales\n\n**Adjusted FFO (AFFO)** — More conservative:\n> AFFO = FFO Recurring Capex Straight-line Rent Adjustments\n\nAFFO better reflects sustainable dividend-paying capacity.\n\n**Valuation Metrics:**\n- **Price/FFO** replaces P/E for REITs; typical range 12–25×\n- **NAV (Net Asset Value)** — Sum of property values minus debt; REITs trade at premiums or discounts to NAV\n- **NAV premium** signals investor optimism about growth; **NAV discount** may indicate distress or rising rates\n\nDuring rising rate environments, cap rates expand, compressing NAV and pressuring REIT prices.",
 highlight: ["FFO", "AFFO", "Price/FFO", "NAV discount/premium"],
 },
 {
 type: "quiz-mc",
 question:
 "A REIT reports net income of $50M, depreciation of $30M, and gains on property sales of $8M. What is its FFO?",
 options: [
 "$72M",
 "$88M",
 "$50M",
 "$80M",
 ],
 correctIndex: 0,
 explanation:
 "FFO = Net Income + Depreciation Gains on Property Sales = $50M + $30M $8M = $72M. Depreciation is added back because it is a non-cash accounting charge that understates a REIT's true operating performance. Gains on sales are removed because they are non-recurring.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Sector-Specific REITs and Rate Risk",
 content:
 "Modern REITs have evolved well beyond traditional property types:\n\n• **Digital Infrastructure REITs** (e.g., data centers, cell towers) — Benefiting from AI and 5G buildout; long-term leases with escalators\n• **Healthcare REITs** — Senior housing, medical offices, hospitals; aging demographics tailwind\n• **Industrial REITs** — Logistics and last-mile warehouses; e-commerce structural demand\n• **Office REITs** — Secular headwind from hybrid work; selective urban markets outperform\n\n**Rising Rate Impact on REITs:**\n1. Higher interest rates raise cap rates property values fall NAV declines\n2. REIT debt refinancing costs rise, compressing AFFO\n3. Higher risk-free rate makes dividend yield less attractive relative to bonds\n4. However, REITs with pricing power (industrial, residential) can raise rents to offset cost increases\n\nLong-duration, fixed-rent leases (like some retail and office) are most exposed to rate hikes.",
 highlight: ["Digital Infrastructure", "cap rate expansion", "rising rate impact"],
 },
 {
 type: "quiz-tf",
 statement:
 "Mortgage REITs (mREITs) are generally less sensitive to interest rate changes than equity REITs because they focus on fixed-rate mortgage assets.",
 correct: false,
 explanation:
 "False. Mortgage REITs are typically MORE sensitive to interest rate changes than equity REITs. mREITs borrow short-term at lower rates to invest in longer-duration mortgage assets. When rates rise, their borrowing costs increase faster than the yield on existing fixed-rate mortgages, squeezing net interest margins and dividends. Equity REITs have some ability to raise rents over time to offset rate pressure.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "value-add-development",
 title: "Value-Add & Development Strategies",
 description:
 "Explore real estate private equity, IRR waterfalls, 1031 exchanges, and development risk",
 icon: "Hammer",
 xpReward: 90,
 difficulty: "advanced",
 duration: 14,
 steps: [
 {
 type: "teach",
 title: "Value-Add Strategy Framework",
 content:
 "**Value-add investing** targets underperforming assets where active management can unlock higher returns:\n\n**The Four-Phase Cycle:**\n1. **Acquire** — Buy below market, typically from distressed owners or neglected assets\n2. **Renovate** — Capital improvements: unit upgrades, common area refresh, systems replacement\n3. **Lease-Up** — Re-tenant at market rents; reduce vacancy from 30% to 5–8%\n4. **Exit** — Sell at a compressed cap rate (higher value) after stabilization\n\n**Risk Spectrum by Strategy:**\n\n| Strategy | Risk | Target Return (IRR) |\n|---|---|---|\n| Core | Low | 6–8% |\n| Core-Plus | Low-Medium | 8–10% |\n| Value-Add | Medium-High | 12–15% |\n| Opportunistic | High | 15–20%+ |\n\n**Ground-up development** carries the highest risk: entitlement delays, construction cost overruns, lease-up uncertainty, and interest rate exposure during the build period.",
 highlight: ["value-add", "Core", "Core-Plus", "Opportunistic", "ground-up development"],
 },
 {
 type: "teach",
 title: "IRR Waterfall Structure",
 content:
 "Real estate private equity funds use **waterfall distributions** to split profits between investors (LPs) and the fund manager (GP):\n\n**Typical Waterfall Tiers:**\n\n1. **Return of Capital** — LPs receive 100% of distributions until their investment is fully returned\n2. **Preferred Return (Hurdle Rate)** — LPs receive a cumulative preferred return, typically 6–8% per year, before the GP participates\n3. **GP Catch-Up** — GP receives 80–100% of distributions until it has \"caught up\" to its carried interest percentage\n4. **Carried Interest Split** — Remaining profits split, typically 80% LP / 20% GP\n\n**Example:** On a $10M fund with an 8% preferred return and 20% carry:\n- LPs get their $10M back first\n- Then LPs get 8% annual return ($800K/yr)\n- Then GP catches up to 20%\n- Then remaining profits split 80/20\n\nThe GP's **carried interest** (20% of profits) is the primary incentive alignment mechanism in real estate PE.",
 highlight: ["Preferred Return", "GP Catch-Up", "Carried Interest", "waterfall"],
 },
 {
 type: "quiz-mc",
 question:
 "In a real estate PE waterfall with an 8% preferred return and 20% GP carry, LPs have invested $5M and the fund generates $8M in total proceeds. After returning capital, the preferred return pool is $400K. Which statement is correct?",
 options: [
 "The GP receives $400K immediately after capital return",
 "LPs receive the full $400K preferred return before the GP participates in profits",
 "The GP and LPs split the $400K preferred return 50/50",
 "The preferred return is waived if the fund generates more than 15% IRR",
 ],
 correctIndex: 1,
 explanation:
 "In a standard waterfall, after capital is returned, LPs receive 100% of distributions until their preferred return (hurdle rate) is fully paid. Only after the preferred return is satisfied does the GP participate through the catch-up provision and then the carried interest split. This structure protects LPs' minimum return before the GP earns performance fees.",
 difficulty: 3,
 },
 {
 type: "teach",
 title: "1031 Exchange and DST Structures",
 content:
 "**1031 Exchange** (IRC Section 1031) allows real estate investors to defer capital gains taxes by rolling proceeds into a 'like-kind' replacement property:\n\n**Critical Timelines:**\n- **45-day identification window** — Must identify replacement property within 45 days of selling\n- **180-day closing window** — Must close on replacement property within 180 days of sale\n\n**Rules:**\n- Replacement property must be of equal or greater value\n- All equity must be reinvested (any cash received is \"boot\" and is taxable)\n- Cannot use for personal residences (investment/business property only)\n\n**Delaware Statutory Trust (DST):**\nA DST is a fractional ownership structure used as a 1031 replacement property. Investors exchange into a professionally managed portfolio of institutional properties. Benefits:\n- Solves the 45-day identification challenge\n- Access to institutional-quality assets at lower minimums\n- Passive management (no landlord duties)\n- Drawback: illiquid, fixed 5–10 year hold period",
 highlight: ["1031 Exchange", "45-day", "180-day", "Delaware Statutory Trust", "DST"],
 },
 {
 type: "quiz-tf",
 statement:
 "In a 1031 exchange, an investor who sells a property for $2M (original cost $1M) and receives $500K in cash at closing while reinvesting $1.5M can defer taxes on the entire $1M gain.",
 correct: false,
 explanation:
 "False. The $500K received in cash is called 'boot' and is immediately taxable. The investor can only defer the gain attributable to the $1.5M reinvested. To defer the entire $1M gain, all proceeds must be reinvested into a like-kind replacement property of equal or greater value with no boot received.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "international-real-estate",
 title: "International Real Estate Investing",
 description:
 "Navigate global real estate markets, currency risk, cross-border structures, and PERE funds",
 icon: "Globe",
 xpReward: 85,
 difficulty: "advanced",
 duration: 13,
 steps: [
 {
 type: "teach",
 title: "The Global Real Estate Market",
 content:
 "Real estate is the **world's largest asset class** at approximately **$326 trillion** in total value — larger than global equities and bonds combined. Key facts:\n\n• Residential real estate accounts for ~$230T (70% of the total)\n• Commercial real estate represents ~$96T\n• The US, China, and EU together hold over 60% of global real estate value\n\n**Global Gateway Cities** — Tier-1 markets with deep liquidity, strong rule of law, and international demand: New York, London, Tokyo, Singapore, Sydney, Paris, Hong Kong\n\n**Secondary Markets** — Smaller cities with higher yields but lower liquidity: Manchester, Melbourne, Warsaw, Ho Chi Minh City\n\nInstitutional capital increasingly targets secondary markets in emerging economies for yield premium, but faces higher execution risk, less transparent pricing, and weaker tenant demand.",
 highlight: ["$326 trillion", "largest asset class", "Gateway Cities", "Secondary Markets"],
 },
 {
 type: "teach",
 title: "Foreign Ownership Restrictions and Currency Risk",
 content:
 "**Foreign Ownership Restrictions** vary significantly by country:\n\n• **Restricted/Prohibited:** Thailand (foreigners cannot own land directly), Switzerland (permit required for non-residents), New Zealand (foreign investment ban on existing homes), China (foreigners limited to one residential unit)\n• **Open markets:** USA, UK, Germany, Australia, Canada (with reporting requirements)\n• **Partial restrictions:** Singapore (Additional Buyer's Stamp Duty of 60% for foreign buyers)\n\n**Currency Risk** is a major consideration for cross-border investment:\n- Property income in local currency must be converted to investor's home currency\n- A 10% property gain can be wiped out by a 10% adverse currency move\n\n**Hedging Strategies:**\n- **Forward contracts** — Lock in exchange rate for future conversion\n- **Currency overlay funds** — Specialist managers hedge FX exposure\n- **Natural hedge** — Finance property with local currency debt (liabilities match asset currency)\n- **Currency-agnostic markets** — Some markets (e.g., Dubai) price and transact in USD",
 highlight: ["Foreign Ownership", "Currency Risk", "Natural hedge", "Forward contracts"],
 },
 {
 type: "quiz-mc",
 question:
 "An Australian investor buys a London office building for £10M. Over three years, the property appreciates 15% in GBP terms. However, the GBP/AUD exchange rate moves from 1.85 to 1.60 over the same period. What is the approximate return in AUD terms?",
 options: [
 "Approximately +15% (currency moves are irrelevant for long-term property)",
 "Approximately 1.6% (currency depreciation nearly eliminates the GBP gain)",
 "Approximately +32% (currency moves amplify the return)",
 "Approximately +8% (the gain is split equally between GBP and AUD)",
 ],
 correctIndex: 1,
 explanation:
 "Initial value: £10M × 1.85 = A$18.5M. Exit value in GBP: £11.5M (15% gain). Exit value in AUD: £11.5M × 1.60 = A$18.4M. Return = (18.4 18.5) / 18.5 0.5%, approximately flat or slightly negative. The 15% GBP property gain is almost entirely erased by the GBP depreciation against AUD. This illustrates the critical importance of currency risk management in international real estate.",
 difficulty: 3,
 },
 {
 type: "teach",
 title: "Cross-Border Costs and PERE Fund Structures",
 content:
 "**Cross-Border Transaction Costs** can total 5–15% of purchase price:\n\n• **Stamp duty / transfer tax** — UK: 5–17% (residential, tiered); Singapore: up to 64% for foreigners; Germany: 3.5–6.5%\n• **Agent/broker fees** — Typically 1–3% each side\n• **Legal and notary fees** — 0.5–2%\n• **Withholding taxes** — On rental income repatriated from many countries\n\n**Private Equity Real Estate (PERE) Fund Structures:**\n\nMost global institutional RE capital flows through **closed-end commingled funds**:\n- Typical fund life: 10 years (3–4 year investment period, 5–7 year harvest)\n- Capital called as investments are made; distributions returned as assets sold\n- Blind pool structure: investors commit before specific assets are identified\n- **GRESB (Global Real Estate Sustainability Benchmark)** — ESG scoring system for institutional RE funds; increasingly required by pension fund LPs\n\nTop PERE managers: Blackstone, Brookfield, Starwood, KKR Real Estate.",
 highlight: ["Stamp duty", "closed-end fund", "10-year fund life", "GRESB"],
 },
 {
 type: "quiz-tf",
 statement:
 "GRESB (Global Real Estate Sustainability Benchmark) is a voluntary ESG assessment framework for real estate funds, but institutional investors such as pension funds increasingly require GRESB participation as a condition for allocating capital to PERE funds.",
 correct: true,
 explanation:
 "Correct. GRESB scores real estate funds and companies on environmental, social, and governance (ESG) dimensions including energy efficiency, carbon emissions, water use, and tenant engagement. While participation is technically voluntary, the largest institutional LPs — including Dutch pension funds (APG, PGGM), Canadian pensions, and sovereign wealth funds — now routinely screen PERE managers on GRESB scores and may decline to invest in funds that do not participate or score poorly.",
 difficulty: 2,
 },
 ],
 },
 ],
};
