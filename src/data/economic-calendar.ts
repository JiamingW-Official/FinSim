export interface EconomicEvent {
 id: string;
 date: string; // "2024-07-10"
 time: string; // "08:30 ET"
 event: string; // "CPI (YoY)"
 category:
 | "inflation"
 | "employment"
 | "gdp"
 | "fed"
 | "housing"
 | "manufacturing"
 | "consumer";
 importance: 1 | 2 | 3; // 1=low, 3=high
 previous: string; // "3.3%"
 forecast: string; // "3.1%"
 actual?: string; // filled after release
 impact: string; // explains market impact
 educationalNote: string; // teaches what this indicator means
}

export const ECONOMIC_CALENDAR: EconomicEvent[] = [
 // ─── June 2024 ──────────────────────────────────────────────
 {
 id: "fomc-jun-2024",
 date: "2024-06-12",
 time: "14:00 ET",
 event: "FOMC Interest Rate Decision",
 category: "fed",
 importance: 3,
 previous: "5.50%",
 forecast: "5.50%",
 actual: "5.50%",
 impact:
 "Rates held as expected. Dot plot shifted to one cut in 2024 from three projected in March. Hawkish hold pressures growth stocks.",
 educationalNote:
 "The FOMC meets eight times per year to set the federal funds rate. The rate decision itself matters, but the dot plot (each official's rate forecast) and Powell's press conference often move markets more than the decision itself.",
 },
 {
 id: "cpi-jun-2024",
 date: "2024-06-12",
 time: "08:30 ET",
 event: "CPI (YoY)",
 category: "inflation",
 importance: 3,
 previous: "3.4%",
 forecast: "3.4%",
 actual: "3.3%",
 impact:
 "Cooler-than-expected CPI boosted stocks and bonds. Lower inflation raises odds of near-term rate cuts.",
 educationalNote:
 "CPI measures the average change in prices paid by urban consumers for a basket of goods and services. Core CPI (excluding volatile food and energy) is watched more closely by the Fed because it better reflects underlying inflation trends.",
 },
 {
 id: "ppi-jun-2024",
 date: "2024-06-13",
 time: "08:30 ET",
 event: "PPI (MoM)",
 category: "inflation",
 importance: 2,
 previous: "0.5%",
 forecast: "0.1%",
 actual: "-0.2%",
 impact:
 "Negative PPI reading confirmed disinflationary trend at the producer level, supporting the case for rate cuts.",
 educationalNote:
 "PPI measures wholesale prices that producers receive for their goods. It leads CPI by 1-3 months because producer cost changes eventually flow through to consumer prices. A falling PPI is an early signal that consumer inflation may ease.",
 },
 {
 id: "retail-sales-jun-2024",
 date: "2024-06-18",
 time: "08:30 ET",
 event: "Retail Sales (MoM)",
 category: "consumer",
 importance: 2,
 previous: "0.0%",
 forecast: "0.3%",
 actual: "0.1%",
 impact:
 "Soft retail sales suggest the consumer is weakening, which is dovish for rate expectations but bearish for consumer discretionary stocks.",
 educationalNote:
 "Retail Sales measures total receipts of retail stores. Consumer spending drives ~70% of US GDP, making this one of the most important economic indicators. Ex-autos and ex-gas readings strip out volatile components for a cleaner signal.",
 },
 {
 id: "housing-starts-jun-2024",
 date: "2024-06-20",
 time: "08:30 ET",
 event: "Housing Starts",
 category: "housing",
 importance: 2,
 previous: "1.36M",
 forecast: "1.38M",
 actual: "1.28M",
 impact:
 "Housing starts fell sharply, reflecting the impact of elevated mortgage rates on new construction activity.",
 educationalNote:
 "Housing Starts count the number of new residential construction projects begun in a month. Housing is a leading economic indicator because it's highly sensitive to interest rates and drives spending on materials, appliances, and furnishings.",
 },
 {
 id: "jobless-claims-jun-20-2024",
 date: "2024-06-20",
 time: "08:30 ET",
 event: "Initial Jobless Claims",
 category: "employment",
 importance: 2,
 previous: "242K",
 forecast: "235K",
 actual: "238K",
 impact:
 "Claims roughly in line with expectations, showing a labor market that is gradually cooling but not cracking.",
 educationalNote:
 "Initial Jobless Claims measures the number of people filing for unemployment benefits for the first time each week. It is the most timely labor market indicator because it is reported weekly with only a 5-day lag. Rising claims signal a weakening job market.",
 },
 {
 id: "pce-jun-2024",
 date: "2024-06-28",
 time: "08:30 ET",
 event: "Core PCE Price Index (YoY)",
 category: "inflation",
 importance: 3,
 previous: "2.8%",
 forecast: "2.6%",
 actual: "2.6%",
 impact:
 "Core PCE at 2.6% marked the lowest reading in over two years, bolstering September rate cut expectations.",
 educationalNote:
 "Core PCE (Personal Consumption Expenditures) is the Fed's preferred inflation measure. Unlike CPI, PCE accounts for substitution effects (when consumers switch to cheaper alternatives) and uses different weightings. The Fed's 2% target is based on PCE, not CPI.",
 },

 // ─── July 2024 ──────────────────────────────────────────────
 {
 id: "ism-mfg-jul-2024",
 date: "2024-07-01",
 time: "10:00 ET",
 event: "ISM Manufacturing PMI",
 category: "manufacturing",
 importance: 3,
 previous: "48.7",
 forecast: "49.1",
 actual: "48.5",
 impact:
 "Manufacturing remains in contraction territory (below 50). Weak orders component signals continued industrial slowdown.",
 educationalNote:
 "ISM Manufacturing PMI surveys purchasing managers at 300+ companies. A reading above 50 indicates expansion; below 50 signals contraction. The new orders sub-index is the most forward-looking component and often leads the headline number by 1-2 months.",
 },
 {
 id: "jolts-jul-2024",
 date: "2024-07-02",
 time: "10:00 ET",
 event: "JOLTS Job Openings",
 category: "employment",
 importance: 2,
 previous: "8.06M",
 forecast: "7.95M",
 actual: "8.14M",
 impact:
 "Job openings slightly above expectations, suggesting labor demand remains resilient despite higher rates.",
 educationalNote:
 "JOLTS (Job Openings and Labor Turnover Survey) measures unfilled positions. The ratio of openings to unemployed workers indicates labor market tightness. The Fed watches the quit rate closely because workers quit more when they're confident about finding new jobs.",
 },
 {
 id: "nfp-jul-2024",
 date: "2024-07-05",
 time: "08:30 ET",
 event: "Non-Farm Payrolls",
 category: "employment",
 importance: 3,
 previous: "272K",
 forecast: "190K",
 actual: "206K",
 impact:
 "Solid job creation with upward revision to prior month. Unemployment rate ticked up to 4.1%, the highest since November 2021.",
 educationalNote:
 "Non-Farm Payrolls (NFP) is the most market-moving economic release. It counts the number of jobs added or lost in the US economy, excluding farm workers. Traders watch three numbers: headline jobs, unemployment rate, and average hourly earnings (for wage inflation signals).",
 },
 {
 id: "cpi-jul-2024",
 date: "2024-07-11",
 time: "08:30 ET",
 event: "CPI (YoY)",
 category: "inflation",
 importance: 3,
 previous: "3.3%",
 forecast: "3.1%",
 impact:
 "If CPI comes in at or below forecast, it would confirm the disinflationary trend and cement September rate cut expectations.",
 educationalNote:
 "Markets react to CPI relative to expectations, not the absolute level. A 3.1% print when 3.3% was expected is bullish for stocks, while a 3.1% print when 2.9% was expected would be bearish. This is why consensus forecasts matter so much.",
 },
 {
 id: "core-cpi-jul-2024",
 date: "2024-07-11",
 time: "08:30 ET",
 event: "Core CPI (MoM)",
 category: "inflation",
 importance: 3,
 previous: "0.2%",
 forecast: "0.2%",
 impact:
 "Monthly core CPI at 0.2% (annualizes to ~2.4%) would be consistent with a path back to the Fed's 2% target.",
 educationalNote:
 "Month-over-month Core CPI is critical because it strips out seasonal effects. The Fed needs 3-6 consecutive months of 0.2% or lower MoM readings to be confident inflation is returning to target. One bad month resets the clock.",
 },
 {
 id: "ppi-jul-2024",
 date: "2024-07-12",
 time: "08:30 ET",
 event: "PPI (YoY)",
 category: "inflation",
 importance: 2,
 previous: "2.2%",
 forecast: "2.3%",
 impact:
 "PPI trending near 2% confirms that upstream price pressures are well contained, supporting the disinflation narrative.",
 educationalNote:
 "Year-over-year PPI near 2% is consistent with the Fed's inflation target since producer price changes take time to flow through to consumers. The PPI-CPI spread can signal future consumer inflation trends.",
 },
 {
 id: "michigan-jul-2024",
 date: "2024-07-12",
 time: "10:00 ET",
 event: "Michigan Consumer Sentiment (Prelim)",
 category: "consumer",
 importance: 2,
 previous: "68.2",
 forecast: "67.5",
 impact:
 "Consumer sentiment has been stuck below pre-pandemic levels despite strong employment, largely due to persistent high prices and housing costs.",
 educationalNote:
 "The University of Michigan Consumer Sentiment Index surveys 500 households monthly. The inflation expectations component (1-year and 5-10 year) is closely watched by the Fed. Rising inflation expectations can become self-fulfilling as consumers rush purchases.",
 },
 {
 id: "retail-sales-jul-2024",
 date: "2024-07-16",
 time: "08:30 ET",
 event: "Retail Sales (MoM)",
 category: "consumer",
 importance: 2,
 previous: "0.1%",
 forecast: "0.0%",
 impact:
 "Flat retail sales would suggest the consumer is treading water — not collapsing but not expanding either.",
 educationalNote:
 "Retail Sales are reported in nominal terms (not inflation-adjusted). To get real spending growth, subtract inflation. A nominal 0.3% gain with 0.3% inflation means zero real growth. This distinction is critical for understanding true consumer demand.",
 },
 {
 id: "housing-starts-jul-2024",
 date: "2024-07-17",
 time: "08:30 ET",
 event: "Housing Starts",
 category: "housing",
 importance: 2,
 previous: "1.28M",
 forecast: "1.30M",
 impact:
 "Housing starts remain depressed as mortgage rates near 7% deter new construction projects despite strong underlying demand.",
 educationalNote:
 "The housing market is a classic interest-rate-sensitive sector. Every 1% increase in mortgage rates reduces home affordability by roughly 10%. Building permits (released alongside starts) are an even more forward-looking indicator since permits precede starts by weeks.",
 },
 {
 id: "jobless-claims-jul-18-2024",
 date: "2024-07-18",
 time: "08:30 ET",
 event: "Initial Jobless Claims",
 category: "employment",
 importance: 2,
 previous: "238K",
 forecast: "230K",
 impact:
 "Claims hovering in the 230-240K range indicate a labor market that is normalizing from overheated conditions but not deteriorating.",
 educationalNote:
 "The 4-week moving average of claims is more reliable than any single week's reading because claims data is noisy and affected by holidays, weather, and seasonal patterns. A sustained move above 250K would signal meaningful labor market weakening.",
 },
 {
 id: "existing-home-sales-jul-2024",
 date: "2024-07-23",
 time: "10:00 ET",
 event: "Existing Home Sales",
 category: "housing",
 importance: 2,
 previous: "4.11M",
 forecast: "3.99M",
 impact:
 "Existing home sales near 30-year lows due to rate lock effect — homeowners with 3% mortgages refuse to sell and buy at 7%.",
 educationalNote:
 "Existing home sales are a lagging indicator but reveal the depth of the housing lock-in effect. When rates are high, transaction volume collapses but prices stay supported because supply is also constrained. This dynamic is unique to the current cycle.",
 },
 {
 id: "gdp-q2-advance-jul-2024",
 date: "2024-07-25",
 time: "08:30 ET",
 event: "GDP (Q2 Advance Estimate)",
 category: "gdp",
 importance: 3,
 previous: "1.4%",
 forecast: "2.0%",
 impact:
 "GDP rebound from Q1 weakness would confirm the economy remains resilient, reducing recession fears but potentially delaying aggressive rate cuts.",
 educationalNote:
 "GDP has three estimates: advance (1 month after quarter), second (2 months), and third/final (3 months). The advance estimate moves markets most because it's first, but it can be revised significantly. Q2 GDP is reported in late July as an annualized quarter-over-quarter rate.",
 },
 {
 id: "pce-jul-2024",
 date: "2024-07-26",
 time: "08:30 ET",
 event: "Core PCE Price Index (YoY)",
 category: "inflation",
 importance: 3,
 previous: "2.6%",
 forecast: "2.5%",
 impact:
 "Core PCE at 2.5% would be the lowest since March 2021 and strongly supports a September rate cut. This is the last major inflation print before the July FOMC.",
 educationalNote:
 "The Fed's 2% inflation target is based on the PCE deflator, not CPI. PCE tends to run about 0.3% below CPI because it uses different weights and accounts for consumer substitution. So 2.5% PCE is roughly equivalent to 2.8% CPI.",
 },
 {
 id: "fomc-jul-2024",
 date: "2024-07-31",
 time: "14:00 ET",
 event: "FOMC Interest Rate Decision",
 category: "fed",
 importance: 3,
 previous: "5.50%",
 forecast: "5.50%",
 impact:
 "The July meeting is expected to be a hold, but the statement language will be scrutinized for hints about a September cut. Any change to 'gaining greater confidence' would be dovish.",
 educationalNote:
 "FOMC statements are written in extremely precise language. Single word changes carry enormous weight. The shift from 'lack of further progress' to 'modest further progress' on inflation can move billions in markets. Traders parse every word for policy signals.",
 },

 // ─── August 2024 ────────────────────────────────────────────
 {
 id: "nfp-aug-2024",
 date: "2024-08-02",
 time: "08:30 ET",
 event: "Non-Farm Payrolls",
 category: "employment",
 importance: 3,
 previous: "206K",
 forecast: "175K",
 impact:
 "The August NFP print is the most important jobs report of the summer — it will determine whether the September rate cut is 25bp or 50bp.",
 educationalNote:
 "The NFP report is released on the first Friday of each month at 8:30 AM ET. Markets are most volatile in the 15 minutes after release. The household survey (which calculates the unemployment rate) and the establishment survey (which counts payrolls) can send conflicting signals.",
 },
 {
 id: "ism-services-aug-2024",
 date: "2024-08-05",
 time: "10:00 ET",
 event: "ISM Services PMI",
 category: "manufacturing",
 importance: 2,
 previous: "48.8",
 forecast: "51.0",
 impact:
 "Services PMI is critical because 80% of the US economy is services-based. A reading above 50 would ease recession fears.",
 educationalNote:
 "Unlike manufacturing (20% of GDP), services represent the bulk of the US economy. The ISM Services PMI captures activity in healthcare, finance, retail, and tech. The prices paid sub-index is an important inflation signal since services inflation has been stickier than goods inflation.",
 },
 {
 id: "cpi-aug-2024",
 date: "2024-08-14",
 time: "08:30 ET",
 event: "CPI (YoY)",
 category: "inflation",
 importance: 3,
 previous: "3.0%",
 forecast: "2.9%",
 impact:
 "If CPI drops below 3% for the first time since March 2021, it would be a major psychological milestone confirming disinflation progress.",
 educationalNote:
 "The CPI basket includes housing (36%), food (14%), energy (7%), medical (7%), and other categories. Housing inflation (shelter CPI) has been the stickiest component and lags actual rent changes by 12-18 months due to the way the BLS measures it.",
 },
 {
 id: "retail-sales-aug-2024",
 date: "2024-08-15",
 time: "08:30 ET",
 event: "Retail Sales (MoM)",
 category: "consumer",
 importance: 2,
 previous: "0.0%",
 forecast: "0.3%",
 impact:
 "Back-to-school spending could provide a seasonal lift. Strong retail sales would support the soft landing narrative.",
 educationalNote:
 "Retail sales data has strong seasonal patterns. January sees post-holiday weakness, while August benefits from back-to-school spending. The Census Bureau uses seasonal adjustment to account for these patterns, but surprise deviations from seasonal norms still move markets.",
 },
 {
 id: "jackson-hole-aug-2024",
 date: "2024-08-22",
 time: "10:00 ET",
 event: "Jackson Hole Symposium (Powell Speech)",
 category: "fed",
 importance: 3,
 previous: "N/A",
 forecast: "N/A",
 impact:
 "Powell's Jackson Hole speech historically serves as a policy preview for the fall. Markets expect dovish guidance toward September cut.",
 educationalNote:
 "The Kansas City Fed's annual Jackson Hole Economic Symposium brings together central bankers, economists, and policymakers. The Fed Chair's keynote speech has been used to signal major policy shifts. In 2022, Powell's hawkish speech there triggered a sharp selloff.",
 },
 {
 id: "pce-aug-2024",
 date: "2024-08-30",
 time: "08:30 ET",
 event: "Core PCE Price Index (YoY)",
 category: "inflation",
 importance: 3,
 previous: "2.6%",
 forecast: "2.6%",
 impact:
 "The final PCE reading before the September FOMC will be decisive for rate cut sizing. Any upside surprise could reduce cut expectations.",
 educationalNote:
 "PCE is released with a month lag (July data in August). Because CPI is released first, traders use CPI components to estimate PCE before its official release. The correlation between CPI and PCE gives experienced analysts an edge in predicting this number.",
 },

 // ─── September 2024 ─────────────────────────────────────────
 {
 id: "nfp-sep-2024",
 date: "2024-09-06",
 time: "08:30 ET",
 event: "Non-Farm Payrolls",
 category: "employment",
 importance: 3,
 previous: "114K",
 forecast: "160K",
 impact:
 "The last NFP before the September FOMC. A weak print could push the Fed toward a 50bp cut; a strong print cements 25bp.",
 educationalNote:
 "The market reaction to NFP depends on the broader economic context. In a strong economy, a weak jobs number is bearish (signals slowdown). In a rate-cutting cycle, a weak number can be bullish (signals more cuts). This 'good news is bad news' dynamic confuses many new traders.",
 },
 {
 id: "cpi-sep-2024",
 date: "2024-09-11",
 time: "08:30 ET",
 event: "CPI (YoY)",
 category: "inflation",
 importance: 3,
 previous: "2.9%",
 forecast: "2.5%",
 impact:
 "CPI below 2.5% would mark major progress toward the Fed's target and remove any remaining obstacles to a September rate cut.",
 educationalNote:
 "Base effects play a huge role in year-over-year CPI readings. If prices spiked a year ago, the YoY comparison becomes easier (lower) even if current monthly inflation is unchanged. Sophisticated traders forecast CPI using base effects combined with monthly momentum.",
 },
 {
 id: "fomc-sep-2024",
 date: "2024-09-18",
 time: "14:00 ET",
 event: "FOMC Interest Rate Decision",
 category: "fed",
 importance: 3,
 previous: "5.50%",
 forecast: "5.25%",
 impact:
 "Markets are pricing a rate cut with near certainty. The key question is 25bp vs 50bp, and whether the dot plot signals 2-3 additional cuts in 2024.",
 educationalNote:
 "The first rate cut in a cycle is the most significant because it marks the policy pivot. Historically, the first cut after a tightening cycle has been followed by 5-7 more cuts over the next 12-18 months. However, insurance cuts (1 or 2 then done) also happen and lead to different market outcomes.",
 },
 {
 id: "conf-board-sep-2024",
 date: "2024-09-24",
 time: "10:00 ET",
 event: "Consumer Confidence Index",
 category: "consumer",
 importance: 2,
 previous: "100.3",
 forecast: "103.5",
 impact:
 "Consumer confidence has been supported by a strong labor market but weighed down by high prices. A reading above 100 is generally positive.",
 educationalNote:
 "The Conference Board Consumer Confidence Index surveys 5,000 households monthly. It has two components: the Present Situation Index (how consumers feel now) and the Expectations Index (how they feel about the future). The Expectations Index is a leading indicator of consumer spending.",
 },
 {
 id: "gdp-q2-final-sep-2024",
 date: "2024-09-26",
 time: "08:30 ET",
 event: "GDP (Q2 Final Estimate)",
 category: "gdp",
 importance: 2,
 previous: "3.0%",
 forecast: "3.0%",
 impact:
 "The final GDP revision is typically less market-moving than the advance estimate but can surprise if major revisions occur.",
 educationalNote:
 "GDP is revised twice after the advance estimate. Major revisions happen when the BEA receives complete source data (tax records, census data). Historically, the average revision from advance to final is 1.3 percentage points, which is enormous and shows how uncertain initial estimates are.",
 },
 {
 id: "pce-sep-2024",
 date: "2024-09-27",
 time: "08:30 ET",
 event: "Core PCE Price Index (YoY)",
 category: "inflation",
 importance: 3,
 previous: "2.6%",
 forecast: "2.7%",
 impact:
 "This reading covers August data and will be the first PCE after the September rate cut decision, setting the tone for the November FOMC.",
 educationalNote:
 "After the first rate cut, markets shift focus to the pace of future cuts. PCE data becomes the scorecard: declining inflation validates the cut and supports further easing, while rising inflation creates doubt about the cutting cycle's sustainability.",
 },
];

export const ECONOMIC_CATEGORY_LABELS: Record<
 EconomicEvent["category"],
 string
> = {
 inflation: "Inflation",
 employment: "Employment",
 gdp: "GDP",
 fed: "Federal Reserve",
 housing: "Housing",
 manufacturing: "Manufacturing",
 consumer: "Consumer",
};

export const ECONOMIC_CATEGORY_COLORS: Record<
 EconomicEvent["category"],
 string
> = {
 inflation: "text-destructive bg-destructive/10",
 employment: "text-primary bg-primary/10",
 gdp: "text-primary bg-primary/10",
 fed: "text-primary bg-primary/10",
 housing: "text-amber-400 bg-amber-400/10",
 manufacturing: "text-muted-foreground bg-muted/30",
 consumer: "text-pink-400 bg-pink-400/10",
};

export const IMPORTANCE_LABELS: Record<1 | 2 | 3, string> = {
 1: "Low",
 2: "Medium",
 3: "High",
};
