import { Unit } from "./types";

export const UNIT_COMPETITIVE_MOATS: Unit = {
 id: "competitive-moats",
 title: "Competitive Moats & Business Quality",
 description:
 "Identify durable competitive advantages that protect long-term profitability",
 icon: "Shield",
 color: "#059669",
 lessons: [
 {
 id: "porters-five-forces",
 title: "Porter's Five Forces",
 description:
 "Analyze industry attractiveness and competitive pressure using Michael Porter's framework",
 icon: "Pentagon",
 xpReward: 60,
 difficulty: "intermediate",
 duration: 8,
 steps: [
 {
 type: "teach",
 title: "The Five Forces Framework",
 content:
 "Michael Porter's Five Forces model identifies the competitive pressures that determine industry profitability. The five forces are: (1) Competitive Rivalry — intensity of competition among existing firms; (2) Threat of New Entrants — how easily new players can enter; (3) Supplier Power — leverage of input providers; (4) Buyer Power — leverage of customers; (5) Threat of Substitutes — risk from alternative products. Industries with all five forces weak are highly attractive; industries with all five strong tend toward low profitability.",
 },
 {
 type: "teach",
 title: "Barriers to Entry & Rivalry",
 content:
 "Barriers to entry protect incumbents: high capital requirements, economies of scale, network effects, regulation, patents, and brand loyalty all deter new entrants. Competitive rivalry is intensified by many competitors of similar size, slow industry growth, high fixed costs (creating price wars), commodity products, and high exit barriers. Tech platforms often enjoy strong barriers via network effects and switching costs. Commodity industries face intense rivalry because products are undifferentiated and price is the only lever.",
 },
 {
 type: "teach",
 title: "Supplier Power, Buyer Power & Substitutes",
 content:
 "Supplier power is high when there are few suppliers, the input is critical, or switching costs are large (e.g., chip manufacturers like TSMC vs. fabless design firms). Buyer power is high when buyers are concentrated, purchase in volume, or can easily switch (e.g., large retailers negotiating with food brands). Substitutes cap pricing power — airlines compete not just with each other but with video conferencing. Pharma companies enjoy low substitute risk for patented drugs, while generic drug makers face intense substitute pressure.",
 },
 {
 type: "teach",
 title: "Applying Five Forces: Tech vs. Commodities vs. Pharma",
 content:
 "Big Tech platforms (Google Search, iOS) show weak forces on nearly every dimension: high entry barriers, captive ecosystems, fragmented buyers, regulated suppliers, and few viable substitutes — explaining persistently high margins. Commodity producers (steel, basic chemicals) face opposite conditions: many rivals, low differentiation, powerful buyers, easy substitution, and cyclical supplier dynamics — driving thin margins. Pharma occupies a middle ground: patents create temporary moats, but patent cliffs, generic entry, and payer negotiation power constrain long-run profitability.",
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following industries would score LOWEST on Porter's Five Forces attractiveness (i.e., most forces are strong)?",
 options: [
 "Enterprise cloud software with high switching costs",
 "Airline industry with high fixed costs and commodity service",
 "Branded pharmaceutical company with active patents",
 "Social media platform with strong network effects",
 ],
 correctIndex: 1,
 explanation:
 "Airlines face intense rivalry, thin differentiation, powerful fuel suppliers, price-sensitive buyers, and substitutes like rail or video calls — making all five forces unfavorable and explaining structurally low industry profitability.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A high threat of substitutes always means a company will have low profit margins.",
 correct: false,
 explanation:
 "A strong moat (e.g., brand loyalty, switching costs, cost advantage) can offset substitute pressure and sustain high margins even in industries where substitutes theoretically exist. The five forces interact — a single force rarely determines profitability alone.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "types-of-economic-moats",
 title: "Types of Economic Moats",
 description:
 "Learn the five sources of durable competitive advantage that Warren Buffett calls 'moats'",
 icon: "Castle",
 xpReward: 65,
 difficulty: "intermediate",
 duration: 9,
 steps: [
 {
 type: "teach",
 title: "What Is an Economic Moat?",
 content:
 "Warren Buffett popularized the term 'economic moat' — a structural competitive advantage that lets a company earn above-average returns on capital for an extended period. Morningstar identifies five moat sources: (1) Network Effects, (2) Cost Advantages, (3) Switching Costs, (4) Intangible Assets, and (5) Efficient Scale. A moat is not the same as current profitability — a company can be temporarily profitable without a moat, and a moated company can face a bad year. The key question is whether the advantage is structural and durable.",
 },
 {
 type: "teach",
 title: "Network Effects",
 content:
 "A network effect exists when a product becomes more valuable as more people use it. Two-sided payment networks like Visa and Mastercard become stickier as more merchants accept them and more cardholders carry them — each side attracts the other. Social platforms like Meta benefit from direct network effects: users stay because their friends are already there. Marketplace platforms like eBay and Airbnb benefit from two-sided network density. Network effects are among the most powerful moats because they self-reinforce — the leader widens its advantage as it grows.",
 },
 {
 type: "teach",
 title: "Cost Advantages & Switching Costs",
 content:
 "Cost advantages stem from scale (spreading fixed costs over more units), superior processes (proprietary manufacturing techniques), or favorable geography/resource access. Walmart's distribution network and Amazon's fulfillment infrastructure are cost-advantage moats. Switching costs exist when changing to a competitor is painful in time, money, data migration, or risk. Enterprise software like Oracle ERP or Salesforce CRM creates high switching costs — ripping out an ERP system can cost tens of millions and years of disruption. Switching-cost moats are evident when customer churn rates are extremely low even as competitors offer lower prices.",
 },
 {
 type: "teach",
 title: "Intangible Assets & Efficient Scale",
 content:
 "Intangible assets include brands (Coca-Cola, Louis Vuitton), patents (pharmaceutical pipelines, semiconductor IP), and regulatory licenses (broadcast licenses, pharmaceutical approvals). A brand moat allows pricing above commodity equivalents — consumers pay a premium for perceived quality or status. Patent moats are time-limited but can be replenished through R&D. Efficient scale applies in markets too small to support more than one or a few competitors profitably (natural monopolies like local utilities, toll roads, or airport slots). A new entrant would destroy industry economics before building sufficient scale to earn returns.",
 },
 {
 type: "quiz-mc",
 question:
 "Salesforce CRM charges premium prices and retains over 90% of customers annually despite competing offerings. Which moat source primarily explains this?",
 options: [
 "Efficient scale — the CRM market is too small for more than one player",
 "Network effects — Salesforce improves as more external users join",
 "Switching costs — migrating CRM data, workflows, and integrations is extremely disruptive",
 "Cost advantages — Salesforce has the lowest cost structure in the industry",
 ],
 correctIndex: 2,
 explanation:
 "Enterprise CRM switching costs are high because customer data, custom workflows, integrations, and trained staff are all tied to the platform. The disruption risk and cost of migration keeps customers locked in even when alternatives are cheaper.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A new ride-sharing app launches in a city with better UX and lower prices than Uber. Despite initial buzz, its market share stagnates at 5% while Uber retains 85%. Six months later, the startup runs out of funding.",
 question: "Which moat source best explains Uber's resilience?",
 options: [
 "Intangible assets — Uber has valuable patents on ride-sharing technology",
 "Efficient scale — only one ride-sharing company can exist in any city",
 "Network effects — denser driver supply means shorter wait times, attracting more riders, which attracts more drivers",
 "Cost advantages — Uber's fixed cost base is far lower than any competitor",
 ],
 correctIndex: 2,
 explanation:
 "Uber's density advantage creates a two-sided network effect: more drivers mean shorter ETAs, attracting more riders, who attract more drivers. A new entrant starts with sparse coverage, creating a self-reinforcing disadvantage that makes entry nearly impossible without massive subsidy.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "roic-analysis",
 title: "ROIC Analysis",
 description:
 "Use return on invested capital to measure value creation and identify durable moats",
 icon: "TrendingUp",
 xpReward: 70,
 difficulty: "advanced",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "The ROIC Formula",
 content:
 "Return on Invested Capital (ROIC) = NOPAT / Invested Capital, where NOPAT = Net Operating Profit After Tax = EBIT × (1 - tax rate). Invested Capital = Total Assets Non-interest-bearing current liabilities (or equivalently: equity + interest-bearing debt excess cash). ROIC measures how efficiently a company converts capital into after-tax operating profit. Unlike ROE, ROIC is not inflated by financial leverage; it captures operational quality irrespective of the balance sheet structure.",
 },
 {
 type: "teach",
 title: "ROIC > WACC: The Value Creation Test",
 content:
 "A company creates economic value only when ROIC exceeds its Weighted Average Cost of Capital (WACC). If ROIC = 20% and WACC = 10%, each dollar of invested capital generates $0.10 of economic profit per year — compounding shareholder value. If ROIC < WACC, growth destroys value: the company earns less than what investors require. This is why high-growth companies with low returns (many early-stage tech firms, capital-heavy cyclical businesses) often disappoint despite revenue expansion. The spread (ROIC WACC) is the single best measure of a moat's financial expression.",
 },
 {
 type: "teach",
 title: "ROIC Decomposition: Margins × Asset Turns",
 content:
 "ROIC can be decomposed into profit margin and capital efficiency: ROIC NOPAT Margin × Invested Capital Turnover. Two very different business models can achieve the same ROIC: luxury goods companies (LVMH) earn high margins on moderate asset turns, while discount retailers (Walmart) earn thin margins on extremely high asset turns. Understanding which lever drives ROIC helps assess sustainability — margin compression is often harder to reverse than asset-turn improvements.",
 },
 {
 type: "teach",
 title: "Sector ROIC Benchmarks",
 content:
 "Median ROIC varies significantly by sector. Approximate industry medians: Software/SaaS: 20–35%; Consumer Staples (branded): 15–25%; Industrials: 10–15%; Healthcare/Pharma: 12–20%; Banking: 8–12% (on equity, not assets); Energy/Commodities: 5–10% (highly cyclical); Utilities: 6–9% (regulated returns). A company with ROIC consistently 5–10 points above its sector median for 10+ years almost certainly has a structural moat. A company falling to sector median over time is likely losing its advantage.",
 },
 {
 type: "quiz-mc",
 question:
 "Company A has NOPAT of $500M and Invested Capital of $2B. Company B has NOPAT of $800M and Invested Capital of $8B. Both have WACC of 10%. Which company is creating more economic value per dollar of capital?",
 options: [
 "Company A — ROIC of 25% exceeds WACC, creating a 15% spread",
 "Company B — higher absolute NOPAT means more value created",
 "Both equally — they have the same WACC",
 "Company B — ROIC of 10% exactly equals WACC, maximizing efficiency",
 ],
 correctIndex: 0,
 explanation:
 "Company A: ROIC = $500M / $2B = 25%, spread = 15%. Company B: ROIC = $800M / $8B = 10%, spread = 0% (earning exactly WACC, zero economic profit). Despite higher absolute profit, Company B creates no incremental shareholder value. Company A creates $300M of economic profit annually ($2B × 15%).",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A company with ROIC consistently below WACC can still create shareholder value by growing revenues rapidly.",
 correct: false,
 explanation:
 "When ROIC < WACC, growth destroys value — each new dollar of capital deployed earns less than the cost of that capital. Revenue growth without sufficient ROIC improvement simply accelerates value destruction. This is a common value-trap pattern in capital-intensive, low-margin industries.",
 difficulty: 3,
 },
 ],
 },
 {
 id: "moat-assessment-practice",
 title: "Moat Assessment in Practice",
 description:
 "Apply a systematic framework to assess moat width, durability, and erosion threats",
 icon: "ClipboardCheck",
 xpReward: 75,
 difficulty: "advanced",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "Moat Width: Wide, Narrow, or None",
 content:
 "Morningstar classifies moats as Wide, Narrow, or None. A Wide moat company is expected to sustain excess returns for 20+ years — typically requiring multiple reinforcing moat sources. A Narrow moat is expected to sustain returns for 10+ years but faces more tangible competitive pressure. No moat companies earn returns that attract competition, eventually reverting to cost-of-capital returns. Width is not about current margins — it is about the probability that current returns persist. A company with 40% ROIC in a rapidly disrupted market may be No Moat despite impressive current metrics.",
 },
 {
 type: "teach",
 title: "Durability vs. Current Profitability",
 content:
 "The critical distinction is between a moat and a cyclical profit peak. A commodity company earning high ROIC during a supply shortage has no moat — returns will collapse when supply normalizes. A branded consumer goods company earning average ROIC during a tough macro year may have a wide moat — the brand endures. Ask: 'Would this company's profitability survive a new well-funded competitor entering?', 'Would margins persist if commodity prices normalized?', 'Is the pricing power structural (brand/switching costs) or circumstantial (supply tightness)?'",
 },
 {
 type: "teach",
 title: "Moat Erosion Threats",
 content:
 "Even wide moats erode. Common threats: (1) Technological disruption — digital disrupted physical retail, streaming disrupted cable; (2) Regulatory change — pharmaceutical price caps, platform antitrust breakups; (3) Competitive intensity — well-capitalized rivals subsidizing customer acquisition; (4) Brand deterioration — quality missteps, ESG controversies; (5) Network fragmentation — niche competitors fragmenting a user base. Nokia had a strong brand moat in mobile phones; the smartphone transition rendered it obsolete within five years. Moat durability assessment requires monitoring these threats continuously.",
 },
 {
 type: "teach",
 title: "The Moat Assessment Checklist",
 content:
 "A practical moat checklist: (1) ROIC vs. WACC: Has ROIC exceeded WACC for 5+ years? (2) Revenue retention: Is net dollar retention >100% (SaaS) or churn <5%? (3) Pricing power: Can the company raise prices without losing material volume? (4) Competitive response: Have competitors tried and failed to replicate the advantage? (5) Customer behavior: Do customers choose this company even without promotions? (6) Reinvestment quality: Does incremental capital earn high returns (not just the base business)? (7) Management awareness: Does management articulate and reinvest to defend the moat explicitly? Affirmative answers to most items suggest a genuine moat.",
 },
 {
 type: "quiz-mc",
 question:
 "A steel company earns ROIC of 22% during a period of severe global supply shortages. An analyst classifies it as a 'Wide Moat' company. What is the most significant flaw in this assessment?",
 options: [
 "Steel companies are too capital-intensive to ever have a moat",
 "ROIC should be measured on revenue, not invested capital",
 "The high ROIC likely reflects a cyclical supply imbalance, not a structural competitive advantage",
 "Wide moat companies must have ROIC above 30% to qualify",
 ],
 correctIndex: 2,
 explanation:
 "Steel is a commodity business — when supply normalizes, pricing power evaporates and ROIC reverts to sector averages. A moat requires structural, persistent advantage not dependent on supply/demand cycles. Confusing cyclical profit peaks with genuine moats is one of the most common errors in competitive analysis.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are analyzing two consumer goods companies. Company X has a ROIC of 28% and has maintained it for 15 years through a portfolio of 12 global consumer brands with >70% household recognition. Company Y has a ROIC of 32% but achieved it over the past 3 years riding a post-pandemic demand surge for home fitness equipment.",
 question:
 "Using the Morningstar moat framework, which company most likely has a Wide Moat and why?",
 options: [
 "Company Y — higher ROIC always indicates a stronger moat",
 "Company X — sustained high ROIC backed by durable intangible assets (brand portfolio) over 15 years",
 "Neither — consumer goods companies cannot have Wide Moat ratings",
 "Both equally — both exceed typical sector ROIC benchmarks",
 ],
 correctIndex: 1,
 explanation:
 "Company X demonstrates Wide Moat characteristics: 15 years of sustained excess returns backed by a multi-brand intangible asset portfolio with proven pricing power and consumer loyalty. Company Y's ROIC reflects a cyclical tailwind — home fitness demand has already normalized post-pandemic, and the ROIC is likely to revert. Duration and source of advantage, not peak magnitude, determine moat width.",
 difficulty: 3,
 },
 ],
 },
 ],
};
