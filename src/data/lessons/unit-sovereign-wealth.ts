import type { Unit } from "./types";

export const UNIT_SOVEREIGN_WEALTH: Unit = {
 id: "sovereign-wealth-funds",
 title: "Sovereign Wealth Funds: How Nations Invest",
 description:
 "Explore how governments manage massive investment pools to secure national prosperity — from Norway's ethical oil fund to Abu Dhabi's diversified empire, and the geopolitical stakes of state-controlled capital",
 icon: "",
 color: "#0f766e",
 lessons: [
 // Lesson 1: What is a Sovereign Wealth Fund? 
 {
 id: "sovereign-wealth-1",
 title: "What is a Sovereign Wealth Fund?",
 description:
 "Definition, the three main types of SWFs, and the world's biggest examples — Norway, Abu Dhabi, and Singapore",
 icon: "BookOpen",
 xpReward: 80,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Sovereign Wealth Funds — Nations as Investors",
 content:
 "A **sovereign wealth fund (SWF)** is a state-owned investment vehicle funded by government revenues — typically from natural resources, trade surpluses, or foreign currency reserves — and invested in global financial assets to generate long-term returns.\n\n**Why do countries create SWFs?**\n- Natural resource wealth is finite and its prices are volatile — a fund converts depleting assets into lasting financial ones\n- Trade surplus nations (like China, Singapore) recycle export earnings rather than letting reserves sit idle\n- Governments want to build a buffer against economic shocks and fund future obligations (pensions, infrastructure)\n\n**Scale:** SWFs collectively manage over **$11 trillion** in assets globally — larger than the entire hedge fund industry. The largest single fund, Norway's GPFG, alone held over $1.6 trillion at its peak.\n\n**Key distinction from central bank reserves:**\n- Central bank reserves are held for liquidity and monetary policy purposes — mostly safe short-term instruments\n- SWFs have a long investment horizon and actively seek higher returns through equities, real estate, and alternatives\n- SWFs can accept illiquidity because they have no near-term payment obligations",
 highlight: ["sovereign wealth fund", "natural resources", "trade surplus", "long-term returns", "liquidity"],
 },
 {
 type: "teach",
 title: "Three Types of Sovereign Wealth Funds",
 content:
 "Not all SWFs have the same purpose. Economists classify them into three broad types based on their mandate:\n\n**1. Stabilization Funds**\n- Purpose: cushion the government budget against commodity price volatility\n- Funded when oil/gas/mining revenues exceed budget needs; drawn down when they fall short\n- Typical horizon: 1–5 years (relatively liquid investments)\n- Example: **Russia's National Wealth Fund**, Chile's Economic and Social Stabilization Fund\n- Logic: A country dependent on oil revenue for 40% of its budget would face brutal spending cuts every time oil falls — a stabilization fund smooths this out\n\n**2. Savings / Intergenerational Funds**\n- Purpose: convert today's depletable natural wealth into permanent financial wealth for future generations\n- Withdrawals are limited or prohibited — only the investment returns (or a fixed percentage) can be spent\n- Typical horizon: 30+ years (can hold illiquid assets)\n- Example: **Norway's Government Pension Fund Global (GPFG)**, Kuwait Investment Authority\n- Logic: Oil will run out in 50–100 years; the fund ensures Norwegians in 2150 benefit from today's petroleum discoveries\n\n**3. Development / Strategic Funds**\n- Purpose: invest in domestic infrastructure, industries, or strategic foreign assets to accelerate economic development\n- Less focused on financial returns — may accept lower yields for economic or political goals\n- Example: **Mubadala (Abu Dhabi)**, Temasek (Singapore), China Investment Corporation\n- Logic: Singapore used Temasek to build world-class airlines, banks, and telecoms that the private sector alone could not have created",
 highlight: ["stabilization fund", "savings fund", "development fund", "intergenerational", "Temasek"],
 },
 {
 type: "teach",
 title: "The Big Three: Norway, Abu Dhabi, Singapore",
 content:
 "Three SWFs dominate global attention because of their scale, sophistication, and influence:\n\n**Norway — Government Pension Fund Global (GPFG)**\n- Size: ~$1.6 trillion (the world's largest SWF)\n- Founded: 1990, first transfer 1996\n- Source: North Sea oil and gas revenues\n- Mandate: pure savings — preserve oil wealth for future generations\n- Portfolio: ~70% equities, ~28% fixed income, ~2% real estate and renewable infrastructure\n- Owns on average ~1.5% of every listed company on Earth\n- Governed by strict ethical guidelines with controversial country and company exclusions\n\n**Abu Dhabi Investment Authority (ADIA)**\n- Size: estimated $700 billion–$900 billion (exact size not disclosed)\n- Founded: 1976 — one of the oldest SWFs\n- Source: Abu Dhabi's vast oil reserves\n- Mandate: diversify Abu Dhabi's wealth away from oil dependency\n- Portfolio: global equities, fixed income, real estate, private equity, infrastructure, hedge funds\n- Known for hiring top Wall Street and City of London talent\n\n**Singapore GIC (and Temasek)**\n- GIC size: estimated $690 billion+; Temasek: ~$300 billion\n- GIC founded: 1981 by Lee Kuan Yew to manage Singapore's foreign reserves\n- Temasek founded: 1974 as a holding company for government-linked companies\n- Both have earned reputations for professional management, transparency, and disciplined governance\n- Key difference: Temasek focuses on Asia and development; GIC invests purely for returns globally",
 highlight: ["GPFG", "ADIA", "GIC", "Temasek", "North Sea", "Lee Kuan Yew"],
 },
 {
 type: "quiz-mc",
 question:
 "A country earns large oil revenues and wants to ensure future generations benefit from today's resource wealth, even after the oil runs out. Which type of sovereign wealth fund best fits this goal?",
 options: [
 "Savings / intergenerational fund",
 "Stabilization fund",
 "Development fund",
 "Central bank reserve account",
 ],
 correctIndex: 0,
 explanation:
 "A savings or intergenerational fund is specifically designed to convert depletable natural resource wealth into a permanent financial endowment for future generations. Norway's GPFG is the archetypal example — oil revenues are deposited, invested globally, and only a conservative spending percentage is withdrawn annually. Stabilization funds are for short-term budget smoothing, while development funds target economic growth objectives rather than intergenerational preservation.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Sovereign wealth funds and central bank foreign exchange reserves serve the same purpose and are managed using the same investment strategies.",
 correct: false,
 explanation:
 "They serve very different purposes. Central bank reserves are held primarily for monetary policy purposes — maintaining currency stability, providing liquidity in crises — and are invested conservatively in short-term, highly liquid instruments like US Treasuries. SWFs have long investment horizons and actively seek higher returns through equities, real estate, private equity, and alternatives. A central bank cannot afford to have its reserves tied up in illiquid 10-year infrastructure projects; an SWF can.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 2: How SWFs Invest 
 {
 id: "sovereign-wealth-2",
 title: "How SWFs Invest",
 description:
 "Asset allocation across equities, alternatives, real estate, and infrastructure — and how the long-term horizon creates advantages no ordinary investor can replicate",
 icon: "TrendingUp",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Asset Allocation — The SWF Portfolio",
 content:
 "SWFs allocate across a much broader opportunity set than most investors — their scale, perpetual horizon, and lack of short-term redemption pressure allows them to access illiquid, long-duration assets that generate return premiums.\n\n**Typical asset allocation (illustrative — varies by fund):**\n\n| Asset Class | Typical Range | Why Held |\n|-------------|--------------|----------|\n| Public Equities | 45–70% | Long-term growth, liquidity, dividends |\n| Fixed Income | 15–30% | Stability, liability matching |\n| Real Estate | 5–15% | Inflation hedge, income, diversification |\n| Private Equity | 5–15% | Illiquidity premium, operational control |\n| Infrastructure | 3–10% | Long-duration cash flows match perpetual mandate |\n| Hedge Funds | 0–10% | Diversification, absolute return |\n| Commodities | 0–5% | Inflation hedge (ironically, some oil funds hold oil futures) |\n\n**Scale advantages:**\n- Direct co-investments alongside private equity sponsors — avoiding fund fees\n- Ability to invest directly in unlisted companies (secondary markets, pre-IPO)\n- Negotiating power for bespoke deals that retail investors cannot access\n- Some SWFs co-invest with each other — GPFG, GIC, and ADIA have jointly bid on infrastructure assets",
 highlight: ["asset allocation", "illiquidity premium", "infrastructure", "private equity", "co-investments"],
 },
 {
 type: "teach",
 title: "The Long-Term Horizon Advantage",
 content:
 "The most powerful competitive advantage SWFs possess is time. Unlike pension funds (which face quarterly redemptions), endowments (which fund annual university budgets), or hedge funds (with annual performance fees and redemption gates), most SWFs have **truly perpetual investment horizons**.\n\n**What this unlocks:**\n\n**1. Illiquidity premium**\nAn investor who can lock up capital for 10 years in a private infrastructure asset earns an illiquidity premium — typically 1–3% above equivalent public market returns annually. Over decades, this compounds enormously.\n\n**2. Countercyclical investing**\nDuring market crises — 2008–09, COVID-2020 — SWFs can deploy capital aggressively while others are forced sellers. Singapore's Temasek and GIC famously invested heavily in distressed financial stocks during 2008. Some worked out (JPMorgan); others were painful (Citigroup, UBS), but the strategy was structurally sound.\n\n**3. Tolerating short-term volatility**\nA pension fund with monthly payments can't hold a 50% drawdown in equities without selling. A SWF with no near-term obligations can simply wait for recovery — and statistically, equities always recover given sufficient time.\n\n**4. Patient capital in private markets**\nPrivate equity and infrastructure projects require 5–15 year holding periods. SWFs can commit to these without worrying about fund maturity or investor redemptions.\n\n**The catch:** Governments sometimes raid SWFs for political purposes — Nigeria, Venezuela, and Malaysia's 1MDB scandal show that governance determines whether the long-term mandate is protected or undermined.",
 highlight: ["perpetual horizon", "illiquidity premium", "countercyclical", "patient capital", "governance"],
 },
 {
 type: "teach",
 title: "Real Estate and Infrastructure — SWF Specialties",
 content:
 "Two asset classes where SWFs have become dominant global buyers: real estate and infrastructure.\n\n**Real Estate**\nSWFs own some of the most iconic properties in the world:\n- Norway's GPFG owns stakes in the Rockefeller Center (New York), Regent Street (London), and Champs-Élysées properties (Paris)\n- Qatar Investment Authority owns The Shard skyscraper in London and Harrods department store\n- GIC owns major hotel and logistics portfolios globally\n\nWhy real estate? Stable income from long-term leases, inflation linkage (rents often escalate with CPI), diversification from equities, and tangible asset backing.\n\n**Infrastructure**\nAirports, toll roads, ports, water utilities, renewable energy farms — these are the backbone assets of modern economies:\n- Long-duration concession agreements (25–99 years) match the perpetual SWF mandate perfectly\n- Cash flows are relatively predictable and inflation-linked\n- High barriers to entry create near-monopoly economics\n- Governments often prefer selling infrastructure to SWFs (vs. private equity) because SWFs are long-term owners, not short-term flippers\n\n**Notable infrastructure investments:**\n- Canadian and Australian pension funds (quasi-SWFs) own large stakes in airports, ports, and energy networks globally\n- Abu Dhabi's Mubadala has invested in semiconductor manufacturing (GlobalFoundries), clean energy, and technology infrastructure\n- China Investment Corporation (CIC) has taken stakes in European and African ports and roads — raising significant geopolitical concerns",
 highlight: ["real estate", "infrastructure", "concession agreements", "inflation-linked", "long-duration"],
 },
 {
 type: "quiz-mc",
 question:
 "An SWF invests in a private toll road project that will generate steady revenues for 40 years but requires locking up capital for the full period. What is the primary return advantage this investment offers over equivalent public-market bonds?",
 options: [
 "Illiquidity premium — extra return for accepting that capital cannot be easily withdrawn",
 "Leverage premium — toll roads use more debt than bonds",
 "Currency premium — infrastructure is always denominated in foreign currency",
 "Tax premium — infrastructure investments are always tax-exempt",
 ],
 correctIndex: 0,
 explanation:
 "The illiquidity premium is the additional return investors earn for committing capital to assets that cannot be easily sold. Investors who need liquidity (hedge fund investors, retail savers) demand higher yields on illiquid instruments to compensate for the inability to exit quickly. SWFs, with their perpetual mandate and no short-term payment obligations, can accept this illiquidity and harvest the premium — typically 1–3% annually above liquid equivalents. This compounds significantly over a 40-year holding period.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Because sovereign wealth funds have perpetual investment horizons, they always outperform standard pension funds and endowments over the long run.",
 correct: false,
 explanation:
 "A long-term horizon is a structural advantage, but it does not guarantee outperformance. Several factors can negate the advantage: poor governance and political interference (Venezuela's PDVSA, Malaysia's 1MDB), excessive risk-taking, poor manager selection, and high costs. Also, many SWFs have made high-profile losses — Singapore's GIC and Temasek invested billions in Citigroup and UBS during the 2008 crisis and suffered significant paper losses before partial recovery. The horizon advantage only works if fund governance protects the mandate from political interference and if capital is deployed with discipline.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Norway's Oil Fund Model 
 {
 id: "sovereign-wealth-3",
 title: "Norway's Oil Fund Model",
 description:
 "The world's largest SWF — its spending rule, ethical exclusions, and voting policies that set the global standard for responsible long-term investing",
 icon: "Globe",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "How Norway Built the World's Largest Fund",
 content:
 "Norway discovered oil in the North Sea in 1969. Instead of spending the windfall immediately — a trap many resource-rich nations fall into — Norwegian politicians made a decision that would make their country one of the wealthiest per capita in the world.\n\n**The structural rules:**\n\n**1. The Petroleum Revenue Fund (1990)**\nNorway established the fund in 1990, made the first transfer in 1996. The government deposits all net oil revenues into the fund — not just surpluses.\n\n**2. The Fiscal Rule (2001)**\nThe government can only spend an amount equivalent to the **expected real return of the fund** — originally set at 4%, later revised to **3% annually** as long-term returns moderated. This is crucial: Norway spends returns, not principal. The oil wealth is theoretically preserved forever.\n\n**3. Managed by Norges Bank Investment Management (NBIM)**\nThe central bank's investment arm manages the fund with full transparency — publishing annual reports, voting records, and portfolio holdings.\n\n**4. No domestic investment**\nThe fund cannot invest in Norwegian assets — this prevents it from distorting the domestic economy and forces diversification globally.\n\n**Result by 2024:**\n- Over 9,000 companies across 70+ countries\n- ~1.5% ownership of every publicly listed company on Earth\n- Fund value often exceeds Norway's entire annual GDP\n- Every Norwegian citizen effectively owns ~$300,000 of the fund",
 highlight: ["petroleum revenue", "fiscal rule", "3% spending rule", "NBIM", "Norges Bank"],
 },
 {
 type: "teach",
 title: "Ethical Guidelines and Country Exclusions",
 content:
 "Norway's fund operates under a formal **ethical framework** — arguably the most rigorous of any institutional investor in the world.\n\n**The Council on Ethics**\nAn independent council reviews companies and recommends exclusions or observations (monitoring) to the Ministry of Finance. The criteria:\n\n**Product-based exclusions (automatic):**\n- Tobacco producers\n- Coal companies (companies deriving >30% revenues from thermal coal)\n- Nuclear weapons manufacturers\n- Cluster munitions and anti-personnel mines producers\n\n**Conduct-based exclusions (discretionary):**\n- Serious violations of human rights\n- Severe environmental damage\n- Corruption and financial crime\n- Serious violations of individual rights in armed conflict\n\n**Notable exclusions:**\nThe fund has excluded hundreds of companies including major defense contractors, mining companies for environmental violations, and corporations found complicit in human rights abuses in repressive regimes.\n\n**Country-level application:**\nNorway does not formally exclude countries entirely but applies heightened due diligence to holdings in autocratic regimes. This creates tension — some of the world's fastest-growing markets (China, Saudi Arabia) are also scrutinized most intensely.\n\n**The debate:**\nCritics argue that exclusions reduce diversification and returns without meaningfully changing corporate behavior (excluded companies simply find other buyers). Proponents argue the fund's scale — owning 1.5% of the global market — makes its decisions signals that shift corporate norms worldwide.",
 highlight: ["Council on Ethics", "exclusions", "thermal coal", "human rights", "cluster munitions"],
 },
 {
 type: "teach",
 title: "Voting Policies and Shareholder Activism",
 content:
 "Because Norway's fund owns roughly 1.5% of every major global company, its voting decisions in annual general meetings (AGMs) carry significant weight.\n\n**NBIM's voting approach:**\nThe fund votes at all AGMs where it holds shares — tens of thousands of votes per year. Its voting guidelines cover:\n\n**Corporate governance:**\n- Supports independent board directors (no CEO serving as board chairman)\n- Votes against excessive executive compensation packages\n- Supports shareholder rights to call extraordinary meetings\n- Opposes dual-class share structures that give founders outsized voting power\n\n**Climate and environment:**\n- Expects companies to disclose climate risks aligned with the TCFD framework\n- Votes against directors at companies deemed insufficiently responsive to climate risk\n- Has divested from companies with high stranded-asset exposure to fossil fuels\n\n**The 'active ownership' paradox:**\nNorway's fund is philosophically a passive investor — it tracks a broad benchmark and does not take concentrated activist positions. Yet its sheer scale makes its governance votes enormously influential. This is sometimes called **\"passive scale activism\"** — the unintended power that comes from owning a slice of everything.\n\n**ESG as fiduciary duty:**\nNBIM argues that climate risk, governance failures, and social controversies are financial risks — not just ethical ones. Addressing them protects long-term returns, which is the fund's legal obligation. This framing helped normalize ESG in institutional investing globally.",
 highlight: ["AGM voting", "executive compensation", "dual-class shares", "TCFD", "passive scale activism"],
 },
 {
 type: "quiz-mc",
 question:
 "Norway's Government Pension Fund Global follows a '3% fiscal rule.' What does this mean in practice?",
 options: [
 "The government may only spend an amount equal to approximately 3% of the fund's value annually",
 "The fund must maintain a 3% cash allocation at all times",
 "The fund must invest at least 3% in Norwegian domestic assets",
 "Portfolio managers are paid a 3% performance fee on annual gains",
 ],
 correctIndex: 0,
 explanation:
 "The fiscal rule limits annual government withdrawals to approximately 3% of the fund's value — originally set at 4% (revised lower as expected returns moderated). The idea is to spend only the expected real return, preserving the principal indefinitely for future generations. This is what makes the fund an intergenerational savings vehicle rather than a spending account. In good years, the actual withdrawal can be less than 3%; in recessions it may briefly exceed 3% as automatic stabilizers kick in, but the long-run average should stay near 3%.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Norway's Government Pension Fund Global excludes companies from its portfolio purely for ethical reasons unrelated to financial performance — accepting lower returns as a deliberate trade-off.",
 correct: false,
 explanation:
 "NBIM explicitly frames its ethical guidelines and exclusions as financially motivated, not purely ethical. Environmental damage, human rights violations, governance failures, and corruption are treated as financial risk factors that threaten long-term returns. The fund argues that companies engaging in these practices are riskier investments, and excluding them protects the fund's long-term performance. This framing — ESG as fiduciary duty rather than values sacrifice — is how Norway's model influenced institutional investing globally. In practice, it also happens to align with ethical positions, but the fund's legal mandate requires it to maximize risk-adjusted returns for future generations.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: SWFs & Geopolitics 
 {
 id: "sovereign-wealth-4",
 title: "SWFs & Geopolitics",
 description:
 "Strategic stakes in global companies, transparency concerns, CFIUS national security reviews, and how SWF investments have become tools of geopolitical influence",
 icon: "Globe",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Strategic Stakes — When Investment Meets Diplomacy",
 content:
 "Not all SWF investments are purely financial. Some funds — particularly those from Gulf states and China — use investments as tools of economic diplomacy, technology acquisition, or prestige signaling.\n\n**Gulf state strategic investments:**\n- Qatar Investment Authority owns Harrods, The Shard, Paris Saint-Germain football club, and a 3% stake in Credit Suisse (pre-collapse)\n- Abu Dhabi's Mubadala invested in GlobalFoundries (semiconductors), Waymo (autonomous vehicles), and major tech funds\n- Saudi Arabia's Public Investment Fund (PIF) has invested $45 billion in SoftBank Vision Fund, taken stakes in Uber, electric vehicle companies, and is funding Saudi Aramco's diversification\n- Logic: these investments signal sophistication, build relationships with Western governments, and diversify away from oil\n\n**Chinese strategic investing:**\n- China Investment Corporation (CIC) has invested in European and African infrastructure, energy, and financial services\n- State-backed funds have acquired technology companies in Germany, Israel, and the US — raising concerns about technology transfer\n- Belt and Road Initiative involves state capital flows that blur the line between SWF and government loans\n\n**The dual use problem:**\nA financial stake in a semiconductor company, a port operator, or an AI startup can provide the owning government with commercial intelligence, supply chain influence, or leverage in future negotiations — benefits that have nothing to do with financial returns.",
 highlight: ["Qatar Investment Authority", "Public Investment Fund", "CIC", "technology transfer", "Belt and Road"],
 },
 {
 type: "teach",
 title: "Transparency, Governance, and the Santiago Principles",
 content:
 "As SWF assets grew into the trillions, Western governments and academic researchers raised concerns about opacity and potential conflicts of interest.\n\n**The transparency problem:**\n- Most SWFs do not disclose their full portfolio holdings\n- ADIA does not publish audited accounts — its size is estimated, not confirmed\n- Some funds operate through intermediary structures that obscure ultimate beneficial ownership\n- Questions arise: Is the fund investing for financial returns or political influence? Who controls investment decisions?\n\n**The Santiago Principles (2008)**\nFollowing the 2007–08 financial crisis, the International Monetary Fund convened a working group of SWF nations. The result: 24 voluntary principles governing:\n- Governance structure (separation of fund from government budget)\n- Transparency (periodic disclosure of assets, performance, and strategy)\n- Investment policy (that decisions be commercially motivated, not political)\n- Accountability (external audits and oversight mechanisms)\n\n**Adoption is uneven:**\n- Norway's GPFG and Singapore's GIC/Temasek are routinely ranked highest for transparency\n- Gulf funds have improved disclosure but remain less open than Nordic models\n- China's CIC adopted the Santiago Principles but remains relatively opaque\n\n**The Linaburg-Maduell Transparency Index** (published by the SWF Institute) ranks funds on a 1–10 scale — Norway scores 10, ADIA scores 6, and some funds score 1–2.",
 highlight: ["Santiago Principles", "transparency", "Linaburg-Maduell", "ADIA", "beneficial ownership"],
 },
 {
 type: "teach",
 title: "CFIUS and National Security Reviews",
 content:
 "The United States has formal mechanisms to scrutinize foreign investments — including SWF investments — that may threaten national security.\n\n**CFIUS — Committee on Foreign Investment in the United States**\n- An interagency committee chaired by the Treasury Secretary\n- Reviews foreign acquisitions of US businesses for national security implications\n- Can recommend the President block or impose conditions on transactions\n- Strengthened significantly by the **FIRRMA Act (2018)** — expanded to cover minority stakes in sensitive technology, infrastructure, and data companies\n\n**Types of deals triggering CFIUS review:**\n- Acquisitions of US semiconductor companies, AI firms, or defense suppliers by any foreign government-linked entity\n- Investments in critical infrastructure: power grids, water systems, telecoms\n- Deals involving sensitive personal data (healthcare, financial records)\n- Even passive stakes in companies near sensitive US military installations\n\n**High-profile SWF-related reviews:**\n- Multiple Gulf SWF investments in US technology companies have undergone CFIUS review with conditions attached\n- Several Chinese state-linked investments in US tech have been blocked entirely\n- The UAE's investment in 5G infrastructure faced scrutiny given Huawei ties\n\n**Reciprocal tensions:**\n- The US, EU, and Australia have all tightened foreign investment screening\n- This creates friction — SWFs provide capital that many Western governments want, but also raise legitimate concerns about control of critical assets\n- The challenge is distinguishing commercially motivated SWF investment from state-directed strategic acquisition",
 highlight: ["CFIUS", "FIRRMA", "national security", "critical infrastructure", "foreign investment screening"],
 },
 {
 type: "quiz-mc",
 question:
 "A US technology startup developing advanced AI chips receives an investment offer from a Gulf state sovereign wealth fund. Which US government body would most likely review this transaction for national security concerns?",
 options: [
 "CFIUS — Committee on Foreign Investment in the United States",
 "The Federal Reserve Board",
 "The SEC — Securities and Exchange Commission",
 "The Department of Commerce's Bureau of Industry and Security",
 ],
 correctIndex: 0,
 explanation:
 "CFIUS is specifically empowered to review foreign investments in US businesses for national security implications. Advanced semiconductor and AI technology is explicitly covered under the expanded FIRRMA Act (2018), which broadened CFIUS authority to include minority stakes in sensitive technology companies — not just outright acquisitions. The SEC regulates securities markets (disclosure, fraud) but has no national security mandate. The Fed regulates banks. BIS controls export licenses but doesn't review inbound foreign investment.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The Santiago Principles are legally binding international laws that all countries with sovereign wealth funds must comply with, enforced by the International Monetary Fund.",
 correct: false,
 explanation:
 "The Santiago Principles are voluntary guidelines, not binding law. They were developed in 2008 through a working group of SWF nations convened by the IMF, but the IMF has no enforcement power over how countries invest their sovereign wealth. Compliance is self-reported and uneven — Norway and Singapore score highly, while many funds adopt the principles nominally without full implementation. The Linaburg-Maduell Transparency Index independently ranks funds, but it too is just a rating system, not a legal obligation. This voluntary structure is a frequent criticism — there is no penalty for opacity.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Lessons for Individual Investors 
 {
 id: "sovereign-wealth-5",
 title: "Lessons for Individual Investors",
 description:
 "What ordinary investors can learn from how the world's best-run sovereign wealth funds think about long-term investing, diversification, costs, and staying invested through volatility",
 icon: "Lightbulb",
 xpReward: 85,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Think in Decades, Not Quarters",
 content:
 "The single most transferable insight from SWF investing is the power of a genuinely long-term orientation — one that almost no retail investor actually applies.\n\n**How SWFs define 'long-term':**\n- Norway's GPFG has an explicit mandate to preserve wealth for future Norwegians — potentially 100+ years\n- In their 2023 annual report, NBIM described their equity investments in terms of structural economic shifts over 20–30 year periods\n- They don't react to quarterly earnings misses; they evaluate whether a company's business model will be viable in 2040\n\n**The compounding math:**\n- $10,000 invested at 7% annually becomes $76,000 in 30 years\n- The same $10,000 earning 7% but with an investor withdrawing and reinvesting every 2 years (triggering taxes and fees) might net $45,000 — a 40% penalty just from activity\n- Norwegian fund managers call this the **'time in market'** effect — the investor's greatest edge is simply staying invested through the inevitable bad years\n\n**What this means for you:**\n- Define your investment horizon explicitly before you invest\n- If you have 20+ years before retirement, you can tolerate equity-like volatility — price drops are temporary for diversified portfolios\n- Avoid the psychological trap of checking portfolio values daily — it makes short-term volatility feel like permanent loss\n- Ask the SWF question: 'Would I still want to own this in 20 years?' before selling in a downturn",
 highlight: ["long-term orientation", "compounding", "time in market", "investment horizon", "volatility"],
 },
 {
 type: "teach",
 title: "True Diversification — Across Assets, Geographies, and Time",
 content:
 "Norway's GPFG holds 9,000+ companies across 70+ countries. Most individual investors hold 10–20 stocks, predominantly in their home country. The evidence strongly supports the SWF approach.\n\n**Geographic diversification (the home bias problem):**\nStudies consistently show investors overweight their home country — often by 300–500%. A US investor with 80% in US stocks is taking a concentrated bet that the US outperforms globally — a bet that has paid off recently but may not indefinitely.\n- SWFs invest globally by mandate — the home bias is structurally eliminated\n- Individual investors can replicate this with global index funds at minimal cost\n\n**Asset class diversification:**\nNorway's 70/28/2 split (equity/bonds/real assets) isn't arbitrary:\n- Equities drive long-term growth (equity risk premium of ~4–5% historically)\n- Bonds reduce portfolio volatility and provide dry powder during equity crashes\n- Real assets (real estate, infrastructure) hedge against inflation\n\n**Time diversification (dollar-cost averaging):**\nSWFs receive regular inflows — Norway deposits oil revenues monthly. This forces them to invest at all market levels, averaging out peak and trough timing.\n- Individual investors can replicate with automatic monthly contributions to index funds\n- This eliminates the behavioral trap of waiting for 'the right time to invest' (which never arrives)\n\n**The key takeaway:** True diversification doesn't just mean holding many stocks — it means holding uncorrelated asset classes, spread across geographies, acquired over time.",
 highlight: ["home bias", "geographic diversification", "asset class diversification", "dollar-cost averaging", "correlation"],
 },
 {
 type: "teach",
 title: "Low Costs, Staying Invested, and Behavioral Discipline",
 content:
 "The final cluster of SWF lessons for individual investors concerns the mundane but critically important topics of costs, discipline, and behavior.\n\n**Costs matter enormously:**\nNorway's GPFG has one of the lowest cost ratios in the world — around 0.05% annually (5 basis points). Why? Because at $1.6 trillion, even 1 additional basis point is $160 million per year.\n- A retail investor paying 1% in annual fund fees loses roughly 25% of their final wealth over 30 years compared to paying 0.05%\n- Most active mutual funds charge 0.5–1.5% annually and underperform their benchmark after fees — a double penalty\n- Index funds and ETFs replicating the GPFG's global equity exposure are available for 0.03–0.10% annually\n\n**Staying invested through crashes:**\nSWFs by mandate cannot panic-sell during crashes. Individual investors can — and usually do, at exactly the wrong time:\n- During 2008, global equities fell ~50%. Investors who sold and moved to cash locked in those losses\n- Those who stayed invested recovered fully within 4 years; those who waited 'until it felt safe to reinvest' often re-entered near market peaks\n- Norway's fund fell 23% in 2008 — on paper. NBIM reported it as an opportunity, not a catastrophe, and rebalanced into equities at the low\n\n**Behavioral rules to adopt from SWFs:**\n1. Set an Investment Policy Statement — written rules for what you hold and when you rebalance\n2. Automate contributions — removes timing decisions\n3. Rebalance annually — forces buying low and selling high mechanically\n4. Evaluate managers over 5+ year periods — not quarters\n5. Never confuse volatility with permanent loss in a diversified portfolio",
 highlight: ["low costs", "index funds", "panic selling", "rebalancing", "Investment Policy Statement"],
 },
 {
 type: "quiz-mc",
 question:
 "An investor holds 85% of their portfolio in domestic stocks and is considering diversifying globally. What investing bias best describes their current portfolio construction?",
 options: [
 "Home bias — overweighting the domestic market relative to its global share",
 "Recency bias — overweighting recent top-performing assets",
 "Loss aversion — avoiding investments with any drawdown history",
 "Anchoring bias — fixating on a stock's previous high price",
 ],
 correctIndex: 0,
 explanation:
 "Home bias is the well-documented tendency for investors to overweight their home country's stocks relative to its actual share of global market capitalization. The US represents ~60% of global market cap, yet many US investors hold 80–90% domestic exposure. Norway's GPFG is prohibited from investing in Norwegian assets — structurally eliminating this bias. Individual investors can reduce home bias by adding low-cost international index funds, gaining exposure to the 40% of global equity value outside their home market.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "According to the lesson on Norway's fund, individual investors should check their portfolio value frequently to ensure they can react quickly if markets begin to fall.",
 correct: false,
 explanation:
 "The lesson argues the opposite — checking portfolio values daily makes short-term volatility feel like permanent loss, triggering emotional reactions (panic selling) that damage long-term returns. Norway's NBIM deliberately does not react to short-term price movements. Individual investors are better served by setting clear rules, automating contributions, and reviewing their portfolio quarterly or annually — not daily. The investor's greatest behavioral advantage is simply staying invested through bad years, which daily monitoring actively undermines by making every temporary decline feel like an emergency.",
 difficulty: 1,
 },
 ],
 },
 ],
};
