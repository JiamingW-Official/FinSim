import { Unit } from "./types";

export const UNIT_STARTUP_ECONOMICS: Unit = {
 id: "startup-economics",
 title: "Startup Economics & Venture Capital",
 description:
 "Master unit economics, burn rate, and how VCs evaluate investment opportunities",
 icon: "Rocket",
 color: "#F97316",
 lessons: [
 {
 id: "startup-unit-economics",
 title: "Unit Economics",
 description:
 "Understand CAC, LTV, and the metrics that define startup health",
 icon: "Calculator",
 xpReward: 75,
 difficulty: "intermediate",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "What Are Unit Economics?",
 content:
 "Unit economics measures the revenue and cost associated with a single customer or unit. The two core metrics are:\n\n• **CAC (Customer Acquisition Cost)** — total sales & marketing spend divided by new customers acquired in the same period\n• **LTV (Lifetime Value)** — average revenue per customer × gross margin × average customer lifetime\n\nThese two numbers answer the fundamental question: does acquiring a customer make economic sense?",
 highlight: ["CAC", "LTV", "gross margin"],
 },
 {
 type: "teach",
 title: "The 3:1 LTV/CAC Benchmark",
 content:
 "Investors use the LTV/CAC ratio to gauge sustainability:\n\n• **Below 1:1** — you are literally losing money on every customer\n• **1:1 to 3:1** — marginal; growth is consuming too much capital\n• **3:1** — the widely cited minimum for a healthy SaaS or consumer startup\n• **Above 5:1** — potentially under-investing in growth (leaving money on the table)\n\nPaired with the **payback period** (months to recoup CAC from gross profit), investors typically want payback under 12–18 months.",
 highlight: ["LTV/CAC ratio", "payback period"],
 },
 {
 type: "quiz-mc",
 question:
 "A startup spends $250,000 on marketing in Q1 and acquires 1,000 new customers. Each customer pays $50/month with a 70% gross margin and stays for 24 months on average. What is the LTV/CAC ratio?",
 options: [
 "1.68",
 "3.36",
 "2.40",
 "4.20",
 ],
 correctIndex: 1,
 explanation:
 "CAC = $250,000 / 1,000 = $250. LTV = $50 × 0.70 × 24 = $840. LTV/CAC = $840 / $250 = 3.36. This is right at the widely cited 3:1 minimum benchmark, meaning the company is just at the threshold of unit-economic sustainability.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Gross Margin's Impact on LTV",
 content:
 "Gross margin is often overlooked but it is embedded in LTV. A $100/month product with 30% gross margin has half the LTV of a $100/month product at 60% margin.\n\n**Industry benchmarks:**\n• SaaS: 70–85% gross margin (scalable, high LTV)\n• Marketplace: 15–30% gross margin (take rate on GMV)\n• E-commerce: 30–50% gross margin\n• Hardware: 20–40% gross margin\n\nHigh gross margin businesses can sustain higher CAC and still hit 3:1 — which is why software businesses command premium valuations.",
 highlight: ["gross margin", "SaaS", "marketplace"],
 },
 {
 type: "quiz-tf",
 statement:
 "Negative churn (also called expansion revenue) occurs when revenue from existing customers grows faster than revenue lost from churned customers, effectively increasing average LTV.",
 correct: true,
 explanation:
 "Negative net revenue churn means existing customers expand (upsells, seat additions, usage growth) at a rate that exceeds cancellations. This makes LTV calculations more favorable — and is a major reason investors pay premium multiples for companies like Snowflake or Datadog that exhibit this property.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Cohort Analysis",
 content:
 "Cohort analysis groups customers by acquisition date and tracks their behavior over time. It reveals:\n\n• **Retention curves** — does revenue stabilize (healthy) or decay to zero (broken product)?\n• **LTV evolution** — are newer cohorts performing better or worse than older ones?\n• **Payback curve** — visually shows when each cohort crosses CAC recovery\n\nA flattening retention curve above 0% is the single most important signal of product-market fit. Investors call this the 'smile curve' when it levels off around months 6–12.",
 highlight: ["cohort analysis", "retention curve", "product-market fit"],
 },
 ],
 },
 {
 id: "startup-burn-runway",
 title: "Burn Rate & Runway",
 description:
 "Calculate runway, understand default alive vs dead, and master the Rule of 40",
 icon: "Flame",
 xpReward: 75,
 difficulty: "intermediate",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "Gross Burn vs Net Burn",
 content:
 "**Gross burn** = total monthly cash outflows (payroll, infrastructure, rent, marketing, etc.)\n\n**Net burn** = gross burn minus monthly revenue received\n\nMost investors mean net burn when they ask 'what's your burn rate?' Runway is always calculated using **net burn**:\n\n> Runway (months) = Cash on hand ÷ Net burn/month\n\nA startup with $3M cash burning $150K net per month has 20 months of runway. This is the clock ticking on every fundraising decision.",
 highlight: ["gross burn", "net burn", "runway"],
 },
 {
 type: "quiz-mc",
 question:
 "A startup has $2.4M in the bank. Monthly gross burn is $300K and monthly revenue is $100K. How many months of runway does the company have?",
 options: [
 "8 months",
 "12 months",
 "20 months",
 "5 months",
 ],
 correctIndex: 1,
 explanation:
 "Net burn = $300K gross burn - $100K revenue = $200K/month. Runway = $2,400,000 / $200,000 = 12 months exactly. Note: using gross burn ($300K) would incorrectly give 8 months — a common mistake founders make when presenting runway to investors.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Default Alive vs Default Dead",
 content:
 "Paul Graham's framework asks: **if you stop hiring and hold costs flat, will revenue grow to profitability before cash runs out?**\n\n• **Default alive** — current revenue growth trajectory reaches breakeven before runway ends\n• **Default dead** — you will run out of money unless you raise more capital or cut costs dramatically\n\nMost early-stage startups are default dead — and that is fine, as long as founders know it. The danger is when founders act as if they are default alive (over-hiring, over-spending) when the math says otherwise.",
 highlight: ["default alive", "default dead", "breakeven"],
 },
 {
 type: "teach",
 title: "The Rule of 40",
 content:
 "The Rule of 40 is a health benchmark for SaaS companies:\n\n> **Revenue growth rate (%) + Profit margin (%) 40**\n\nExamples:\n• 80% growth + (-40%) margin = 40 — acceptable at early stage\n• 30% growth + 15% margin = 45 — healthy, profitable growth\n• 10% growth + 10% margin = 20 — declining business, underperforming\n\nAt high growth rates companies get credit for investing in growth. As growth slows, investors expect margins to improve. Violating Rule of 40 while also burning heavily is a major red flag in the current market.",
 highlight: ["Rule of 40", "growth rate", "profit margin"],
 },
 {
 type: "quiz-tf",
 statement:
 "A down-round (raising capital at a lower valuation than the previous round) automatically triggers anti-dilution protections for earlier preferred shareholders, which typically increases the dilution experienced by founders and common stockholders.",
 correct: true,
 explanation:
 "Anti-dilution clauses (broad-based weighted average or full ratchet) protect preferred investors in a down-round by adjusting their conversion price downward — effectively giving them more shares. Full ratchet is harsher (resets to new price entirely) while broad-based weighted average is more common and founder-friendly. Both outcomes push extra dilution onto founders and employees.",
 difficulty: 3,
 },
 {
 type: "teach",
 title: "Optimal Hiring & Bridge Financing",
 content:
 "**Hiring pace** should be tied to revenue milestones, not funding events. A common mistake is hiring aggressively post-raise then needing to lay off 6–12 months later when growth disappoints.\n\n**Bridge financing** is a small interim round (often convertible notes) between formal priced rounds. Used to extend runway by 6–9 months to hit a milestone that justifies the next valuation. Bridges can signal:\n• Positive: strategic gap-fill with strong lead committed\n• Negative: inability to raise a full round (bridge to nowhere)\n\nFounders should raise bridges only when a clear catalyst (big customer, product launch, key hire) is 2–3 months away.",
 highlight: ["bridge financing", "convertible notes", "milestones"],
 },
 ],
 },
 {
 id: "startup-funding-stages",
 title: "Funding Stages",
 description:
 "Navigate pre-seed through IPO, understand dilution, cap tables, and term sheet terms",
 icon: "TrendingUp",
 xpReward: 80,
 difficulty: "intermediate",
 duration: 12,
 steps: [
 {
 type: "teach",
 title: "The Funding Ladder",
 content:
 "Each funding stage has typical check sizes and expected traction:\n\n• **Pre-seed** ($100K–$1M): idea + founding team; angels, accelerators (Y Combinator, Techstars)\n• **Seed** ($1M–$4M): early product, some users; seed-focused funds (Precursor, Hustle Fund)\n• **Series A** ($5M–$20M): product-market fit signals, $500K–$2M ARR; institutional VCs\n• **Series B** ($20M–$50M): proven growth engine, $5M–$15M ARR; large VC firms\n• **Series C+** ($50M–$200M+): scaling unit economics, path to profitability; growth equity\n• **IPO/Late stage**: $100M+ ARR, institutional-grade reporting; hedge funds, crossover investors",
 highlight: ["pre-seed", "seed", "Series A", "Series B", "IPO"],
 },
 {
 type: "quiz-mc",
 question:
 "A startup at Series A typically needs to demonstrate which of the following to institutional VCs?",
 options: [
 "A working prototype and a founding team slide deck",
 "Evidence of product-market fit and early repeatable revenue growth",
 "Profitability and positive free cash flow for two consecutive quarters",
 "A signed term sheet from a strategic acquirer",
 ],
 correctIndex: 1,
 explanation:
 "Series A investors are looking for product-market fit signals: low churn, growing revenue (often $500K–$2M ARR for SaaS), and a repeatable go-to-market motion. Profitability is not expected — in fact, many Series A companies are burning heavily to acquire customers. A prototype alone is a pre-seed story.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Dilution and Cap Table Evolution",
 content:
 "Each funding round dilutes existing shareholders. Typical dilution per round:\n\n• **Pre-seed**: 5–15% diluted (small check, low dilution)\n• **Seed**: 15–20%\n• **Series A**: 20–25%\n• **Series B**: 15–20%\n• **Series C+**: 10–15% (higher valuations, smaller dilution %)\n\nBy IPO, founders often own 15–30% depending on how many rounds they raised. The **cap table** (capitalization table) tracks every shareholder's ownership percentage, option pool, and liquidation stack. A messy cap table can block later rounds.",
 highlight: ["dilution", "cap table", "option pool"],
 },
 {
 type: "teach",
 title: "Key Term Sheet Terms",
 content:
 "Beyond valuation, these term sheet provisions matter most:\n\n• **Liquidation preference** — investors get their money back (1× non-participating preferred is standard) before common shareholders in an exit\n• **Participating preferred** — investors get preference AND share in remaining proceeds; founder-unfriendly\n• **Anti-dilution** — broad-based weighted average (standard) or full ratchet (aggressive) protection in down-rounds\n• **Pro-rata rights** — investor right to maintain ownership % in future rounds by participating\n• **Board seats** — who controls the company; Series A typically gives investors one board seat\n• **Information rights** — monthly/quarterly financial reporting requirements",
 highlight: [
 "liquidation preference",
 "participating preferred",
 "anti-dilution",
 "pro-rata",
 ],
 },
 {
 type: "quiz-tf",
 statement:
 "A 1× non-participating liquidation preference means that in a $50M acquisition, preferred investors who invested $10M would receive exactly $10M before common shareholders receive anything, and then common shareholders split the remaining $40M.",
 correct: true,
 explanation:
 "Correct. With 1× non-participating preferred, the investor gets their invested amount back first (1× preference = $10M), then converts to common to participate in the remainder — but since it is non-participating, they choose the better of: (a) take the $10M preference, or (b) convert to common and share the full $50M pro-rata. In most cases at reasonable exit multiples they will convert. Non-participating is the most founder-friendly structure.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A founder owns 60% of their startup after a seed round. They are negotiating a Series A term sheet with a VC offering $8M at a $32M pre-money valuation (20% dilution). The VC insists on 2× participating preferred liquidation preference.",
 question:
 "Which aspect of this term sheet should concern the founder most?",
 options: [
 "The $32M pre-money valuation is too low for a Series A",
 "The 20% dilution is above typical Series A range",
 "The 2× participating preferred means investors get double their money back AND share in remaining proceeds",
 "The $8M check size is insufficient for a Series A",
 ],
 correctIndex: 2,
 explanation:
 "The 2× participating preferred is the most toxic term. It means the VC gets 2× their $8M ($16M) off the top in any exit, then ALSO participates pro-rata in remaining proceeds alongside common. This can devastate founder returns in moderate exits — e.g., in a $40M exit the VC takes $16M off the top, then splits the remaining $24M pro-rata (getting another ~20%), leaving founders with far less than expected. Standard terms are 1× non-participating preferred.",
 difficulty: 3,
 },
 ],
 },
 {
 id: "startup-vc-evaluation",
 title: "VC Evaluation",
 description:
 "Understand how VCs pick investments, the power law, SAFE notes, and fund returns",
 icon: "Search",
 xpReward: 80,
 difficulty: "advanced",
 duration: 12,
 steps: [
 {
 type: "teach",
 title: "What VCs Actually Look For",
 content:
 "Venture capitalists filter thousands of pitches using a consistent mental model:\n\n• **Market size** — TAM (total addressable market), SAM (serviceable addressable market), SOM (serviceable obtainable market). VCs want TAM $1B+\n• **Team quality** — domain expertise, prior founder experience, technical depth, cofounder dynamics\n• **Product differentiation** — defensible moat (network effects, data advantages, switching costs, patents)\n• **Traction metrics** — MoM growth rate, retention, NPS, revenue quality (ARR vs one-time)\n• **Timing** — is this the right moment? (technology maturity, regulatory tailwinds, behavioral shifts)",
 highlight: ["TAM", "SAM", "SOM", "network effects", "traction"],
 },
 {
 type: "teach",
 title: "Power Law and Portfolio Strategy",
 content:
 "VC returns follow a power law: a tiny fraction of investments return the entire fund.\n\n• The typical VC fund expects ~60% of investments to fail (return <1×)\n• ~30% return modest multiples (1–3×)\n• ~10% return 5–10×\n• **1–2 investments** must return 10–100×+ to make the fund viable\n\nThis is why VCs only invest in companies they believe could be worth **$1B+ at exit** — even if the probability is low. A 5% chance at a $2B outcome is worth more than a 90% chance at a $20M outcome for a $100M fund.\n\n**Implication**: VCs are not looking for good companies — they are looking for potentially legendary ones.",
 highlight: ["power law", "fund-returner", "portfolio strategy"],
 },
 {
 type: "quiz-mc",
 question:
 "A VC fund has $100M under management and owns 10% of a startup that exits for $500M. Which statement best describes this investment's impact on the fund?",
 options: [
 "The fund returned 0.5× on this investment — a modest win",
 "The fund received $50M, returning 0.5× of the entire fund from one investment",
 "The fund received $50M but this single investment cannot return the entire fund",
 "The VC fund loses money because $500M exits are below the typical venture target",
 ],
 correctIndex: 1,
 explanation:
 "10% of $500M = $50M returned to the fund. On a $100M fund, this is a 0.5× fund-returner from a single investment. To return the full fund 3× ($300M), a VC needs this company to exit at $3B, or needs multiple such wins. This illustrates why VCs push for large exits — a $500M exit returning 0.5× is celebrated but not transformative for fund math.",
 difficulty: 3,
 },
 {
 type: "teach",
 title: "SAFE vs Priced Round",
 content:
 "Early-stage startups often raise using **SAFEs** (Simple Agreement for Future Equity) rather than priced rounds:\n\n**SAFE (Y Combinator standard)**:\n• No interest, no maturity date, no immediate equity issuance\n• Converts to equity at the next priced round (with a discount or valuation cap)\n• Fast and cheap to execute — minimal legal fees\n• Common at pre-seed and seed stages\n\n**Priced round** (Series A+):\n• Shares issued immediately at a set price\n• Full legal process: term sheet, due diligence, closing\n• Establishes a formal valuation; triggers board rights and information rights\n• Takes 6–12 weeks and $50–150K in legal fees",
 highlight: ["SAFE", "priced round", "valuation cap", "discount"],
 },
 {
 type: "quiz-tf",
 statement:
 "The J-curve in VC fund returns refers to the pattern where a fund shows negative returns in its early years (as fees are charged and investments are written down before exits) before eventually rising to positive returns in later years as winners are realized.",
 correct: true,
 explanation:
 "The J-curve is a fundamental feature of private market fund returns. In years 1–4, management fees reduce NAV and early markdowns pull returns negative. As portfolio companies mature and exits occur in years 5–10, DPI (Distributed to Paid-In capital, i.e., actual cash returned) rises. TVPI (Total Value to Paid-In) includes unrealized value and is typically more optimistic early on. Investors in illiquid funds must understand this pattern — paper losses in year 2 are normal and expected.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Exit Paths and DPI vs TVPI",
 content:
 "VCs exit investments through three primary paths:\n\n• **M&A (Acquisition)** — most common; strategic buyer pays a premium for technology, customers, or talent. ~90% of VC exits are M&A\n• **IPO** — public offering; creates liquidity but comes with a lockup period (180 days typically)\n• **Secondary sale** — selling shares to another investor before an exit; provides liquidity without a full exit event\n\n**Return metrics:**\n• **DPI (Distributed to Paid-In)** — actual cash returned ÷ capital invested; the 'real money' metric. LPs care most about this\n• **TVPI (Total Value to Paid-In)** — (distributions + unrealized value) ÷ capital invested; shows total performance including paper gains\n• **MOIC (Multiple on Invested Capital)** — simpler: exit value ÷ invested capital\n• **IRR (Internal Rate of Return)** — time-weighted return; punishes slow-returning funds",
 highlight: ["M&A", "IPO", "DPI", "TVPI", "IRR"],
 },
 ],
 },
 ],
};
