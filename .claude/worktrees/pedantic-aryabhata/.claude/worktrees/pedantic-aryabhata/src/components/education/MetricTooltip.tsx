"use client";

import {
 Tooltip,
 TooltipTrigger,
 TooltipContent,
} from "@/components/ui/tooltip";

interface RangeBlock {
 label: string;
 color: "green" | "amber" | "red";
 condition: string;
}

interface MetricEducation {
 definition: string;
 tradingImplication: string;
 ranges: RangeBlock[];
}

const METRIC_EDUCATION: Record<string, MetricEducation> = {
 peRatio: {
 definition:
 "Price-to-Earnings: how much investors pay per $1 of earnings. A P/E of 25 means you're paying $25 for each $1 of annual profit.",
 tradingImplication:
 "High P/E = growth expectations baked in. Any earnings miss sends the stock down hard. Low P/E = cheap, but may signal stagnation or hidden risk.",
 ranges: [
 { label: "Cheap", color: "green", condition: "< 15×" },
 { label: "Fair", color: "amber", condition: "15–30×" },
 { label: "Expensive", color: "red", condition: "> 30×" },
 ],
 },
 forwardPE: {
 definition:
 "Forward P/E uses next 12 months' estimated earnings. Lower than trailing P/E means analysts expect earnings to grow — the stock is getting cheaper relative to future profits.",
 tradingImplication:
 "If Forward P/E < trailing P/E, the company is expected to grow into its valuation. Large gap between the two = high growth expectations; any miss crushes the stock.",
 ranges: [
 { label: "Cheap", color: "green", condition: "< 18×" },
 { label: "Fair", color: "amber", condition: "18–28×" },
 { label: "Pricey", color: "red", condition: "> 28×" },
 ],
 },
 pbRatio: {
 definition:
 "Price-to-Book: share price divided by book value per share (assets minus liabilities). Measures how much premium investors pay over the company's net asset value.",
 tradingImplication:
 "P/B below 1 = stock trades below asset value (classic value signal). High P/B (>10) is fine for asset-light software firms but concerning for capital-intensive industries.",
 ranges: [
 { label: "Value", color: "green", condition: "< 3×" },
 { label: "Normal", color: "amber", condition: "3–10×" },
 { label: "Premium", color: "red", condition: "> 10×" },
 ],
 },
 psRatio: {
 definition:
 "Price-to-Sales: market cap divided by annual revenue. Useful for early-stage companies without earnings. Shows how much investors pay per dollar of revenue.",
 tradingImplication:
 "P/S > 10 is expensive — requires very high revenue growth to justify. SaaS companies with strong retention can sustain high P/S, but cyclical companies with high P/S are risky.",
 ranges: [
 { label: "Cheap", color: "green", condition: "< 4×" },
 { label: "Fair", color: "amber", condition: "4–10×" },
 { label: "Rich", color: "red", condition: "> 10×" },
 ],
 },
 evEbitda: {
 definition:
 "Enterprise Value divided by EBITDA. Compares companies across different capital structures — unlike P/E, it ignores financing and accounting differences between companies.",
 tradingImplication:
 "The 'takeover multiple' — private equity uses EV/EBITDA to value acquisitions. Below 10× is generally considered cheap; above 25× requires strong growth justification.",
 ranges: [
 { label: "Cheap", color: "green", condition: "< 12×" },
 { label: "Fair", color: "amber", condition: "12–25×" },
 { label: "Expensive", color: "red", condition: "> 25×" },
 ],
 },
 grossMargin: {
 definition:
 "Revenue minus cost of goods, as a percentage of revenue. Shows how much the company keeps before paying operating expenses like salaries, rent, and R&D.",
 tradingImplication:
 "High gross margin (>50%) = pricing power and defensibility. Margin compression is a major red flag — even a 2% gross margin decline can signal competitive pressure and sends stocks down 15%+.",
 ranges: [
 { label: "Low", color: "red", condition: "< 20%" },
 { label: "Moderate", color: "amber", condition: "20–50%" },
 { label: "High", color: "green", condition: "> 50%" },
 ],
 },
 operatingMargin: {
 definition:
 "Operating income divided by revenue. Measures efficiency of core business operations — after paying all operating expenses but before interest and taxes.",
 tradingImplication:
 "Rising operating margin over time = management becoming more efficient. Declining margin in a growing company signals scale problems. Tech companies should see margins expand as they scale.",
 ranges: [
 { label: "Thin", color: "red", condition: "< 10%" },
 { label: "Healthy", color: "amber", condition: "10–25%" },
 { label: "Strong", color: "green", condition: "> 25%" },
 ],
 },
 netMargin: {
 definition:
 "Net income divided by revenue. The ultimate bottom line — percentage of every revenue dollar that becomes profit after all expenses, interest, and taxes.",
 tradingImplication:
 "Net margin is the hardest metric to manipulate. Companies with high, stable net margins have real competitive advantages. Watch for divergence: rising revenue + falling net margin = efficiency problem.",
 ranges: [
 { label: "Marginal", color: "red", condition: "< 8%" },
 { label: "Good", color: "amber", condition: "8–20%" },
 { label: "Excellent", color: "green", condition: "> 20%" },
 ],
 },
 roe: {
 definition:
 "Return on Equity: net income divided by shareholders' equity. Shows how effectively management converts investor capital into profit. One of Warren Buffett's favorite metrics.",
 tradingImplication:
 "High ROE (>20%) consistently over years = management creating real value. But beware: companies can inflate ROE by taking on massive debt. Always check alongside D/E ratio.",
 ranges: [
 { label: "Weak", color: "red", condition: "< 10%" },
 { label: "Good", color: "amber", condition: "10–20%" },
 { label: "Excellent", color: "green", condition: "> 20%" },
 ],
 },
 debtToEquity: {
 definition:
 "Total debt divided by shareholders' equity. Measures how leveraged the company is — how much it relies on borrowed money vs. equity financing.",
 tradingImplication:
 "High D/E amplifies returns in good times but accelerates losses in downturns. For cyclical industries, debt is especially dangerous. Tech companies with D/E > 2 warrant scrutiny.",
 ranges: [
 { label: "Conservative", color: "green", condition: "< 0.5" },
 { label: "Moderate", color: "amber", condition: "0.5–2.0" },
 { label: "Leveraged", color: "red", condition: "> 2.0" },
 ],
 },
 currentRatio: {
 definition:
 "Current assets divided by current liabilities. Measures the company's ability to pay short-term obligations. A ratio below 1 means liabilities exceed short-term assets — potential liquidity risk.",
 tradingImplication:
 "Companies with current ratio < 1.0 may struggle to meet short-term obligations. But too high (>3) can mean inefficient capital use. Sweet spot: 1.5–2.5 for most businesses.",
 ranges: [
 { label: "Risk", color: "red", condition: "< 1.0" },
 { label: "Healthy", color: "green", condition: "1.0–2.5" },
 { label: "Excess Cash", color: "amber", condition: "> 2.5" },
 ],
 },
 revenueGrowthYoY: {
 definition:
 "Year-over-year revenue growth expressed as a percentage. One of the most closely watched growth metrics — the top line tells you whether the business is expanding its real footprint.",
 tradingImplication:
 "Consistent revenue growth above 15% commands premium valuations. Decelerating growth (even if still positive) can cause significant de-rating — the rate of change matters as much as the level.",
 ranges: [
 { label: "Declining", color: "red", condition: "< 0%" },
 { label: "Modest", color: "amber", condition: "0–15%" },
 { label: "Strong", color: "green", condition: "> 15%" },
 ],
 },
 epsGrowthYoY: {
 definition:
 "Year-over-year earnings per share growth. Drives stock price appreciation long-term. EPS growing faster than revenue = improving margins and efficiency.",
 tradingImplication:
 "EPS growth is what moves stocks over time — price ultimately follows earnings. Companies with >20% EPS growth typically deserve premium P/E. Negative EPS growth is a serious red flag.",
 ranges: [
 { label: "Declining", color: "red", condition: "< 0%" },
 { label: "Moderate", color: "amber", condition: "0–20%" },
 { label: "High Growth", color: "green", condition: "> 20%" },
 ],
 },
 dividendYield: {
 definition:
 "Annual dividend payment as a percentage of the stock price. A 3% yield means you earn $3 in dividends for every $100 invested, regardless of stock price movement.",
 tradingImplication:
 "High yield (>5%) can be a value trap — check payout ratio. Dividends provide income while you wait for appreciation. Growing dividends over time signals financial confidence from management.",
 ranges: [
 { label: "None/Low", color: "amber", condition: "0–1%" },
 { label: "Moderate", color: "green", condition: "1–4%" },
 { label: "High Yield", color: "red", condition: "> 4%" },
 ],
 },
 beta: {
 definition:
 "Measures a stock's volatility relative to the overall market. Beta of 1 = moves in line with market. Beta 1.5 = 50% more volatile than the market.",
 tradingImplication:
 "High beta stocks amplify market moves — great in bull markets, devastating in crashes. Lower beta stocks provide stability but lag in strong rallies. Position sizing should account for beta.",
 ranges: [
 { label: "Stable", color: "green", condition: "< 0.8" },
 { label: "Normal", color: "amber", condition: "0.8–1.5" },
 { label: "High Vol", color: "red", condition: "> 1.5" },
 ],
 },
 shortFloat: {
 definition:
 "The percentage of float shares currently sold short. High short interest means many traders are betting against the stock — this can create fuel for short squeezes if positive news arrives.",
 tradingImplication:
 "Short float > 15% is meaningful; > 25% is extreme. A heavily shorted stock that beats earnings can surge 20–50%+ as shorts scramble to cover. But high short interest may also reflect genuine fundamental concern.",
 ranges: [
 { label: "Normal", color: "green", condition: "< 5%" },
 { label: "Elevated", color: "amber", condition: "5–15%" },
 { label: "High Short", color: "red", condition: "> 15%" },
 ],
 },
 earningsSurprisePct: {
 definition:
 "The difference between actual reported EPS and Wall Street analyst consensus. Positive = beat estimates; negative = missed. The magnitude often determines the post-earnings stock move.",
 tradingImplication:
 "Even a small earnings beat often isn't enough — guidance and forward expectations matter more. A 5% beat with weak guidance can still drop the stock. Always watch what management says on the call.",
 ranges: [
 { label: "Miss", color: "red", condition: "< 0%" },
 { label: "In-Line", color: "amber", condition: "0–3%" },
 { label: "Beat", color: "green", condition: "> 3%" },
 ],
 },
};

const rangeColorClasses = {
 green: "bg-emerald-500/15 text-emerald-400",
 amber: "bg-amber-500/15 text-amber-400",
 red: "bg-red-500/15 text-red-400",
};

interface MetricTooltipProps {
 metric: string;
 children: React.ReactNode;
}

export function MetricTooltip({ metric, children }: MetricTooltipProps) {
 const edu = METRIC_EDUCATION[metric];
 if (!edu) return <span>{children}</span>;

 return (
 <Tooltip>
 <TooltipTrigger asChild>
 <span className="cursor-help border-b border-dotted border-muted-foreground/50 transition-colors hover:border-primary hover:text-primary">
 {children}
 </span>
 </TooltipTrigger>
 <TooltipContent
 side="top"
 sideOffset={4}
 className="max-w-72 space-y-2 bg-card border border-border p-3"
 >
 <p className="text-[11px] text-foreground/80 leading-relaxed">
 {edu.definition}
 </p>
 <p className="text-xs leading-relaxed">
 <span className="font-semibold text-primary/90">Trading implication: </span>
 <span className="text-muted-foreground">{edu.tradingImplication}</span>
 </p>
 <div className="flex gap-1.5">
 {edu.ranges.map((r, i) => (
 <div
 key={i}
 className={`flex-1 rounded px-1 py-0.5 text-center text-[11px] font-semibold ${rangeColorClasses[r.color]}`}
 >
 <div>{r.label}</div>
 <div className="font-normal opacity-70">{r.condition}</div>
 </div>
 ))}
 </div>
 </TooltipContent>
 </Tooltip>
 );
}
