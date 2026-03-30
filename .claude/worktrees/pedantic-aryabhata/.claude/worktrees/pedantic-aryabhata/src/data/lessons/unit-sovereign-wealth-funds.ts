import { Unit } from "./types";

export const UNIT_SOVEREIGN_WEALTH_FUNDS: Unit = {
 id: "sovereign-wealth-funds",
 title: "Sovereign Wealth Funds",
 description:
 "Explore how governments manage vast pools of national wealth — from oil-funded stabilization reserves to intergenerational savings vehicles — and how these funds shape global capital markets.",
 icon: "Globe",
 color: "#0EA5E9",
 lessons: [
 {
 id: "swf-types-structure",
 title: "SWF Types & Structure",
 description:
 "Learn the taxonomy of sovereign wealth funds, their governance models, and the world's largest players.",
 icon: "Landmark",
 xpReward: 75,
 difficulty: "intermediate",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "What Is a Sovereign Wealth Fund?",
 content:
 "A sovereign wealth fund (SWF) is a state-owned investment fund that manages a country's surplus wealth for long-term objectives. Unlike central bank reserves — which must remain liquid for monetary operations — SWFs pursue higher returns across diverse asset classes. Assets under management across all SWFs exceeded $10 trillion by the mid-2020s, making them among the most influential institutional investors on the planet.",
 highlight: ["state-owned investment fund", "surplus wealth", "$10 trillion"],
 },
 {
 type: "teach",
 title: "Commodity vs. Non-Commodity SWFs",
 content:
 "SWFs are divided by their funding source:\n\n• Commodity SWFs — funded by resource export revenues (oil, gas, minerals). Examples: Norway's GPFG, Abu Dhabi's ADIA, Kuwait Investment Authority, Saudi Arabia's PIF, Russia's National Wealth Fund. Their assets fluctuate with commodity cycles.\n\n• Non-Commodity SWFs — funded by fiscal surpluses, central bank reserve transfers, or privatization proceeds. Examples: Singapore's GIC and Temasek, China's CIC, South Korea's KIC. More insulated from commodity price swings.",
 highlight: ["commodity SWFs", "non-commodity SWFs", "GPFG", "ADIA", "GIC", "CIC"],
 },
 {
 type: "teach",
 title: "The World's Largest SWFs",
 content:
 "Rankings shift with markets, but the largest SWFs by AUM include:\n\n1. Norway GPFG — ~$1.7 trillion (largest single fund globally)\n2. China Investment Corporation (CIC) — ~$1.3 trillion\n3. Abu Dhabi Investment Authority (ADIA) — ~$990 billion\n4. Kuwait Investment Authority (KIA) — ~$800 billion\n5. GIC (Singapore) — ~$770 billion\n6. Temasek (Singapore) — ~$300 billion (also operates as a holding company)\n7. Saudi PIF — growing rapidly toward $1 trillion under Vision 2030\n\nReserve investment corporations (e.g., SAFE Investment Company, China) differ from development-oriented SWFs (e.g., Mubadala, UAE).",
 highlight: ["Norway GPFG", "$1.7 trillion", "CIC", "ADIA", "GIC", "Temasek", "PIF"],
 },
 {
 type: "quiz-mc",
 question:
 "What primarily distinguishes a commodity SWF from a non-commodity SWF?",
 options: [
 "Commodity SWFs only invest in natural resource companies",
 "Commodity SWFs are funded by resource export revenues, while non-commodity SWFs rely on fiscal surpluses or reserve transfers",
 "Non-commodity SWFs are always smaller than commodity SWFs",
 "Commodity SWFs are prohibited from investing in equities",
 ],
 correctIndex: 1,
 explanation:
 "The key distinction is the funding source: commodity SWFs accumulate wealth from resource revenues (oil, gas) and are exposed to commodity price cycles, while non-commodity SWFs draw on trade surpluses, privatization proceeds, or central bank transfers.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "The Santiago Principles (IFSWF) are a set of voluntary governance and transparency guidelines that sovereign wealth funds can adopt.",
 correct: true,
 explanation:
 "The Santiago Principles, established in 2008 through the International Forum of Sovereign Wealth Funds (IFSWF), provide 24 voluntary best-practice guidelines covering legal frameworks, institutional structures, investment policies, and risk management. They were designed to reassure recipient countries that SWF investments are commercially motivated, not politically driven.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "swf-investment-mandates",
 title: "Investment Mandates",
 description:
 "Understand the different purposes SWFs serve — from stabilization buffers to intergenerational savings — and how mandates shape portfolio construction.",
 icon: "Target",
 xpReward: 80,
 difficulty: "intermediate",
 duration: 12,
 steps: [
 {
 type: "teach",
 title: "Three Core Mandate Types",
 content:
 "SWFs broadly fall into three mandate categories:\n\n• Stabilization funds — absorb commodity revenue volatility and provide fiscal buffers during downturns. Often held in liquid assets. Example: Chile's ESSF, Russia's National Wealth Fund.\n\n• Savings / intergenerational funds — convert finite resource wealth into diversified financial wealth for future generations. Example: Norway's GPFG, Kuwait Investment Authority.\n\n• Reserve investment corporations — maximize return on excess foreign reserves above central bank liquidity needs. Example: GIC (Singapore), SAFE Investment Company (China).",
 highlight: ["stabilization funds", "savings funds", "reserve investment corporations"],
 },
 {
 type: "teach",
 title: "Norway's GPFG — The Gold Standard",
 content:
 "Norway's Government Pension Fund Global (GPFG) is the most studied SWF. Its mandate is to invest Norway's oil revenues for future generations. Key features:\n\n• Benchmark allocation: ~70% equities, ~27% fixed income, ~3% real estate (unlisted)\n• Owns ~1.5% of all listed global equities — a universal owner\n• Strict fiscal rule: only the expected real return (~3% annually) may be spent\n• Managed by Norges Bank Investment Management (NBIM)\n• Fully transparent: publishes all holdings annually\n• Active engagement on ESG rather than divestment-first approach\n\nThe GPFG's spending rule prevents Dutch Disease — the erosion of competitiveness caused by flooding the domestic economy with resource revenues.",
 highlight: ["GPFG", "70% equities", "fiscal rule", "3% return", "NBIM", "Dutch Disease"],
 },
 {
 type: "teach",
 title: "Active vs. Passive & Political Interference Risk",
 content:
 "SWFs debate how much active management to use:\n\n• Passive (index) approach: lower costs, avoids stock-picking risk, better for very large funds where alpha is harder to generate at scale (GPFG is mostly passive in equities).\n\n• Active approach: tilts to factors (value, quality), alternatives, and private markets to capture illiquidity premia.\n\nPolitical interference risk is real: some SWFs face pressure to invest domestically or in politically favored sectors, undermining returns. Home bias — over-allocating to domestic assets — reduces diversification benefits. Clear legal firewalls between the fund and the finance ministry mitigate this risk.",
 highlight: ["passive approach", "active approach", "political interference", "home bias"],
 },
 {
 type: "quiz-mc",
 question:
 "Norway's GPFG 'fiscal rule' limits annual government spending from the fund to approximately what level?",
 options: [
 "10% of fund assets per year",
 "The expected real return of ~3% per year",
 "Whatever is needed to balance the national budget",
 "A fixed NOK amount set by parliament each year",
 ],
 correctIndex: 1,
 explanation:
 "The Norwegian fiscal rule limits annual transfers to the expected real return on the GPFG, historically set at 4% and revised to ~3% to reflect updated return expectations. This prevents Norway from spending down capital and ensures the fund supports future generations.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "SWFs have a disadvantage versus pension funds because they must match assets to short-term liabilities, limiting their ability to hold illiquid investments.",
 correct: false,
 explanation:
 "This is the opposite of reality. Most SWFs have no explicit short-term liabilities (unlike pension funds paying current retirees or insurance companies paying claims). This long-horizon, liability-free structure is actually a significant competitive advantage — it allows SWFs to hold illiquid assets like infrastructure, private equity, and real estate and earn illiquidity premiums that shorter-horizon investors cannot.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "swf-asset-allocation",
 title: "SWF Asset Allocation",
 description:
 "Trace how SWF portfolios evolved from government bonds to diversified global allocations including alternatives, and explore key implementation choices.",
 icon: "PieChart",
 xpReward: 85,
 difficulty: "advanced",
 duration: 13,
 steps: [
 {
 type: "teach",
 title: "Historical Shift: Bonds to Equities",
 content:
 "Early SWFs (pre-1990s) invested almost exclusively in highly rated government bonds — safe, liquid, and politically uncontroversial. This was conservative but left returns on the table.\n\nFrom the 1990s onward, most major SWFs made a decisive shift:\n• GPFG moved from 100% bonds to 60% then 70% equities across the late 1990s–2010s\n• ADIA and GIC broadly diversified into global equities\n• Returns improved materially — equities historically deliver ~5–7% real returns vs ~1–2% for bonds\n\nThe shift was driven by longer investment horizons and recognition that short-term volatility is tolerable when there are no near-term liability outflows.",
 highlight: ["bonds to equities", "GPFG", "~5–7% real returns", "longer investment horizons"],
 },
 {
 type: "teach",
 title: "Growth of Alternatives: PE, Infra, Real Estate",
 content:
 "Modern SWFs significantly allocate to alternatives:\n\n• Private equity: target 10–20% for many large SWFs (ADIA, CIC, Temasek). Illiquidity premium of ~3% over public equities historically.\n• Infrastructure: airports, toll roads, utilities, pipelines — steady cash flows, inflation linkage. Popular among GIC, ADIA, Mubadala, Canadian peers.\n• Real estate: direct property and REITs. GPFG, GIC, and ADIA hold large global real estate portfolios.\n\nTwo implementation approaches exist:\n• Fund of funds: invest via PE/infra funds (lower control, higher fees, J-curve drag)\n• Co-investment / direct: invest alongside GPs in specific deals (lower fees, higher control, requires in-house expertise)",
 highlight: ["private equity", "infrastructure", "real estate", "co-investment", "illiquidity premium"],
 },
 {
 type: "teach",
 title: "Currency Hedging & Commodity Correlation",
 content:
 "Currency and correlation management are critical for SWFs:\n\n• Most SWFs hold foreign assets measured in their home currency. Currency depreciation of the home currency (e.g., NOK for Norway) actually inflates foreign asset values in local terms — so some SWFs deliberately leave foreign exposure unhedged.\n\n• Commodity SWFs face a natural correlation challenge: oil prices and the value of oil-dependent economies move together. A falling oil price reduces government revenues just as it may also weaken risk assets in the portfolio. This makes deep diversification into uncorrelated assets (developed-market equities, infrastructure) especially important.\n\n• Asset-liability management (ALM): stabilization fund SWFs must ensure sufficient liquidity to cover potential fiscal drawdowns during commodity downturns, constraining their ability to hold illiquid alternatives.",
 highlight: ["currency hedging", "commodity correlation", "asset-liability management", "liquidity"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "An oil-rich country's SWF holds 60% in global equities, 20% in private equity, 10% in infrastructure, and 10% in government bonds. Oil prices crash 50%, causing a severe domestic recession. The government requests an emergency transfer from the SWF.",
 question:
 "Which part of the SWF portfolio structure is most problematic in this situation, and why?",
 options: [
 "The 60% equity allocation, because stock markets also fall during recessions",
 "The 20% private equity allocation, because it is illiquid and cannot be easily sold to meet the government's emergency transfer",
 "The 10% government bond allocation, because bonds have too low returns to support a transfer",
 "The 10% infrastructure allocation, because infrastructure assets lose value during recessions",
 ],
 correctIndex: 1,
 explanation:
 "Private equity is highly illiquid — positions cannot be easily sold at fair value on short notice. When a government urgently needs capital during a crisis, the SWF may be forced to sell at steep discounts or simply be unable to liquidate PE holdings quickly. This is precisely why stabilization-mandate SWFs keep liquidity buffers and limit illiquid allocations, whereas long-horizon savings funds can absorb more illiquidity.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Co-investment programs allow SWFs to invest directly alongside private equity GPs in specific deals, typically at lower fees than investing through a commingled fund.",
 correct: true,
 explanation:
 "Co-investments let SWFs deploy capital in specific transactions alongside a PE general partner, often with reduced or no management fees and no carried interest on the co-investment tranche. This improves net returns relative to traditional fund-of-funds structures. The tradeoff is the need for in-house investment professionals who can evaluate deals quickly and on tight timelines.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "swf-geopolitics-protectionism",
 title: "Geopolitics & Protectionism",
 description:
 "Examine how political scrutiny, national security reviews, and deglobalization trends are reshaping where and how SWFs can invest.",
 icon: "Shield",
 xpReward: 90,
 difficulty: "advanced",
 duration: 14,
 steps: [
 {
 type: "teach",
 title: "CFIUS and National Security Screening",
 content:
 "The Committee on Foreign Investment in the United States (CFIUS) reviews foreign acquisitions of US businesses for national security risks. SWF investments are subject to CFIUS scrutiny when they involve:\n• Control or significant influence over US companies\n• Access to critical technology, infrastructure, or sensitive personal data\n• Proximity to US military facilities (TID US business definition)\n\nThe Foreign Investment Risk Review Modernization Act (FIRRMA, 2018) significantly expanded CFIUS jurisdiction to include non-controlling investments in certain sensitive sectors. Similar screening regimes exist in the EU (FDI Screening Regulation), UK (National Security and Investment Act 2021), Australia (FIRB), and Canada (ICA).\n\nSWFs with high transparency scores and no government control stakes (like GPFG) face lower political resistance than strategically directed funds.",
 highlight: ["CFIUS", "FIRRMA", "national security", "FDI screening", "transparency"],
 },
 {
 type: "teach",
 title: "Political Backlash: Historic Cases",
 content:
 "Several high-profile cases shaped today's SWF regulation landscape:\n\n• Dubai Ports World (2006): UAE's DP World acquired P&O's US port operations. Congressional backlash over Arab ownership of US port infrastructure forced DP World to divest US assets, even though CFIUS had cleared the deal.\n\n• CNOOC / Unocal (2005): China's CNOOC withdrew its $18.5 billion bid for Unocal after intense Congressional opposition over energy security concerns — the deal never reached CFIUS.\n\n• Huawei / various SWF-adjacent investments: Broader anxieties over Chinese technology and infrastructure investment have led many Western countries to block or unwind Chinese-connected deals.\n\nThese cases established that political risk — separate from formal regulatory rejection — is a real constraint on SWF deal-making.",
 highlight: ["Dubai Ports World", "CNOOC/Unocal", "political risk", "Congressional opposition"],
 },
 {
 type: "teach",
 title: "Soft Power, Belt & Road, and Deglobalization",
 content:
 "SWFs are sometimes deployed as instruments of foreign policy:\n\n• China's CIC and the Silk Road Fund invest in Belt and Road Initiative infrastructure, blending commercial returns with strategic connectivity objectives.\n• Gulf SWFs (PIF, Mubadala, QIA) use investments in Western sports teams, entertainment, and technology to build diplomatic relationships and improve country image (sportswashing critique).\n• Russia's RDIF directed investments toward countries friendly to Russia's geopolitical agenda.\n\nDeglobalization trends — rising tariffs, reshoring, technology decoupling — reduce the investable universe for SWFs in recipient countries and raise scrutiny of cross-border capital flows. Reciprocity demands are emerging: some Western legislators argue that countries like China should open their own markets to Western investment before their SWFs receive unfettered access.\n\nThe Santiago Principles' voluntary transparency commitments are SWFs' primary tool for reassuring host countries of commercial intent.",
 highlight: ["Belt and Road", "soft power", "deglobalization", "reciprocity", "Santiago Principles"],
 },
 {
 type: "quiz-mc",
 question:
 "Why did Dubai Ports World's acquisition of US port operations become controversial in 2006, even though CFIUS had reviewed the transaction?",
 options: [
 "CFIUS found undisclosed national security violations and reversed its approval",
 "The acquisition violated WTO rules on foreign investment",
 "Congressional and public opposition to Arab ownership of US port infrastructure forced DP World to divest US assets despite CFIUS clearance",
 "Dubai Ports World lacked the capital to complete the transaction",
 ],
 correctIndex: 2,
 explanation:
 "CFIUS cleared the deal, but intense Congressional pressure — driven by fears about Arab ownership of US port infrastructure just years after 9/11 — forced Dubai Ports World to voluntarily divest the US operations. The episode demonstrated that formal regulatory approval does not guarantee political acceptance, and it significantly influenced the expansion of CFIUS authority under FIRRMA.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A Gulf SWF wants to acquire a 25% stake in a US semiconductor equipment company that supplies critical lithography tools. The SWF has signed up to the Santiago Principles and publishes annual reports. The target company has no direct US government contracts.",
 question:
 "Under FIRRMA's expanded CFIUS framework, what is the most likely outcome?",
 options: [
 "CFIUS will automatically approve the deal because the SWF follows the Santiago Principles",
 "The deal will likely receive enhanced CFIUS scrutiny because semiconductor equipment is a critical technology sector, regardless of the SWF's transparency commitments",
 "CFIUS only reviews deals above $1 billion, so a 25% stake is likely exempt",
 "Because the company has no government contracts, CFIUS has no jurisdiction",
 ],
 correctIndex: 1,
 explanation:
 "FIRRMA explicitly expanded CFIUS jurisdiction to cover non-controlling investments (including minority stakes) in TID US businesses — companies involved in critical technologies, critical infrastructure, or sensitive personal data. Semiconductor equipment is squarely a critical technology. Santiago Principles compliance and transparency are positive factors but do not override national security review. CFIUS will scrutinize the deal regardless of deal size or government contract status.",
 difficulty: 3,
 },
 ],
 },
 ],
};
