export interface EconomicIndicatorGuide {
 name: string;
 frequency: "monthly" | "quarterly" | "weekly";
 source: string;
 whatItMeasures: string;
 whyItMatters: string;
 howToRead: string;
 marketImpact: { stocks: string; bonds: string; forex: string };
 leadingOrLagging: "leading" | "lagging" | "coincident";
 relatedIndicators: string[];
}

export const ECONOMIC_INDICATORS: EconomicIndicatorGuide[] = [
 {
 name: "Gross Domestic Product (GDP)",
 frequency: "quarterly",
 source: "Bureau of Economic Analysis (BEA)",
 whatItMeasures:
 "The total monetary value of all finished goods and services produced within a country's borders in a specific time period. It is the broadest measure of economic activity.",
 whyItMatters:
 "GDP is the single most important indicator of overall economic health. Two consecutive quarters of negative GDP growth officially defines a recession. Corporate earnings are ultimately driven by economic growth.",
 howToRead:
 "Focus on the quarter-over-quarter annualized growth rate. Growth of 2-3% is considered healthy for the US. Below 0% signals contraction. The GDP report has three releases: advance (first estimate), second estimate, and final. Markets react most to the advance report and to surprises versus consensus.",
 marketImpact: {
 stocks: "Stronger-than-expected GDP is generally bullish for stocks as it implies higher corporate earnings. However, very strong GDP may raise fears of Fed tightening.",
 bonds: "Strong GDP is bearish for bonds (yields rise) as it suggests the economy does not need loose monetary policy. Weak GDP is bullish for bonds.",
 forex: "Strong GDP strengthens the domestic currency as it attracts foreign investment and suggests higher rates.",
 },
 leadingOrLagging: "lagging",
 relatedIndicators: ["Industrial Production", "Retail Sales", "PMI", "Consumer Confidence"],
 },
 {
 name: "Consumer Price Index (CPI)",
 frequency: "monthly",
 source: "Bureau of Labor Statistics (BLS)",
 whatItMeasures:
 "The average change over time in the prices paid by urban consumers for a basket of goods and services including food, housing, transportation, medical care, and recreation.",
 whyItMatters:
 "CPI is the most widely watched inflation measure. The Fed targets approximately 2% annual inflation. Persistent inflation above target forces rate hikes, while deflation raises concerns about economic weakness.",
 howToRead:
 "Watch both headline CPI (all items) and core CPI (excludes food and energy). Month-over-month changes of 0.2% or less are considered benign. Year-over-year comparisons are most useful for trend analysis. The 'supercore' (core services ex-housing) is closely watched by the Fed.",
 marketImpact: {
 stocks: "Higher-than-expected CPI is bearish as it implies tighter Fed policy. Lower-than-expected CPI is bullish as it reduces pressure on the Fed to raise rates.",
 bonds: "Hot CPI is bearish for bonds (yields spike). Cool CPI is bullish as it supports the case for rate cuts.",
 forex: "Higher CPI can be dollar-bullish (higher rate expectations) in the short term but dollar-bearish long-term if inflation erodes purchasing power.",
 },
 leadingOrLagging: "lagging",
 relatedIndicators: ["PPI", "PCE", "Fed Funds Rate", "10-Year Yield"],
 },
 {
 name: "Producer Price Index (PPI)",
 frequency: "monthly",
 source: "Bureau of Labor Statistics (BLS)",
 whatItMeasures:
 "The average change over time in the selling prices received by domestic producers for their output. It measures inflation at the wholesale level before it reaches consumers.",
 whyItMatters:
 "PPI is a leading indicator for CPI because wholesale price changes typically flow through to consumer prices with a lag. Rising PPI can signal future CPI increases and margin pressure for companies that cannot pass costs through.",
 howToRead:
 "Focus on core PPI (ex-food and energy) for the trend signal. Compare PPI trends to CPI trends: if PPI is rising faster than CPI, it may signal future margin compression for companies or upcoming consumer price increases.",
 marketImpact: {
 stocks: "Rising PPI can be bearish if companies cannot pass costs through (margin compression). Falling PPI may signal disinflation and easing cost pressures.",
 bonds: "Higher PPI is bearish for bonds as it foreshadows consumer inflation. Lower PPI supports bonds.",
 forex: "Similar to CPI but with a smaller immediate impact. Markets view PPI as a preview of CPI.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["CPI", "PCE", "ISM Prices Paid", "Import Prices"],
 },
 {
 name: "Non-Farm Payrolls (NFP)",
 frequency: "monthly",
 source: "Bureau of Labor Statistics (BLS)",
 whatItMeasures:
 "The total number of paid US workers excluding farm employees, government employees, private household employees, and nonprofit organization employees. Released on the first Friday of each month.",
 whyItMatters:
 "NFP is often called the most important economic release in the world. Employment is a direct measure of economic activity, and the labor market is central to the Fed's dual mandate (maximum employment and price stability).",
 howToRead:
 "The headline number (jobs added) gets the most attention, but also watch the unemployment rate, average hourly earnings (wage inflation), and labor force participation rate. Revisions to prior months are also important. The market reacts to surprises versus consensus, not the absolute number.",
 marketImpact: {
 stocks: "Strong jobs growth is generally bullish but can be bearish if it suggests the Fed will stay hawkish. Weak jobs data can be bullish if it implies rate cuts (bad news is good news).",
 bonds: "Strong NFP is bearish for bonds (higher rate expectations). Weak NFP is bullish for bonds.",
 forex: "Strong NFP strengthens the dollar. Weak NFP weakens it. Average hourly earnings are particularly watched for the dollar.",
 },
 leadingOrLagging: "lagging",
 relatedIndicators: ["Unemployment Rate", "Initial Claims", "JOLTS", "ADP Employment"],
 },
 {
 name: "Unemployment Rate",
 frequency: "monthly",
 source: "Bureau of Labor Statistics (BLS)",
 whatItMeasures:
 "The percentage of the total labor force that is unemployed and actively seeking employment. Part of the monthly Employment Situation report alongside NFP.",
 whyItMatters:
 "The unemployment rate is one half of the Fed's dual mandate. Very low unemployment can drive wage inflation, while rising unemployment signals economic weakness. The Sahm Rule uses unemployment to identify recessions in real time.",
 howToRead:
 "A rate below 4% is generally considered full employment for the US. Watch the direction of change more than the absolute level. A rapid rise of 0.5% from the recent low triggers the Sahm Rule recession indicator. Also check U-6 (broader unemployment including underemployed).",
 marketImpact: {
 stocks: "Lower unemployment is generally bullish but can be bearish if it signals wage pressure. Rising unemployment is bearish for cyclical stocks.",
 bonds: "Rising unemployment is bullish for bonds as it implies economic weakness and potential rate cuts.",
 forex: "Lower unemployment strengthens the currency. Rising unemployment weakens it.",
 },
 leadingOrLagging: "lagging",
 relatedIndicators: ["NFP", "Initial Claims", "JOLTS", "Labor Force Participation"],
 },
 {
 name: "Purchasing Managers' Index (PMI)",
 frequency: "monthly",
 source: "Institute for Supply Management (ISM) / S&P Global",
 whatItMeasures:
 "A survey-based index that measures the prevailing direction of economic trends in manufacturing and services. Based on purchasing managers' views of new orders, production, employment, deliveries, and inventories.",
 whyItMatters:
 "PMI is one of the most timely economic indicators because it is based on surveys completed during the current month. A reading above 50 indicates expansion, below 50 indicates contraction. It leads GDP by several months.",
 howToRead:
 "Watch both Manufacturing PMI and Services PMI separately. The 50 level is the critical threshold. The sub-components (new orders, prices paid, employment) provide forward-looking detail. New orders minus inventories is a particularly good leading indicator.",
 marketImpact: {
 stocks: "PMI above 50 and rising is bullish. PMI below 50 and falling is bearish. The manufacturing vs services divergence can signal sector rotation opportunities.",
 bonds: "Strong PMI is bearish for bonds. Weak PMI is bullish, especially if it signals recession risk.",
 forex: "Strong PMI strengthens the domestic currency. Comparative PMI across countries drives relative currency values.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["Industrial Production", "GDP", "Durable Goods", "ISM Manufacturing"],
 },
 {
 name: "ISM Manufacturing Index",
 frequency: "monthly",
 source: "Institute for Supply Management (ISM)",
 whatItMeasures:
 "A composite index based on surveys of over 300 manufacturing companies measuring production, new orders, inventories, supplier deliveries, and employment.",
 whyItMatters:
 "Though manufacturing is a smaller share of the US economy than services, it is more cyclical and provides earlier signals of economic turning points. The ISM has a strong historical track record of leading recessions and recoveries.",
 howToRead:
 "Above 50 signals expansion; below 50 signals contraction. Readings above 55 indicate robust growth. The new orders sub-index is the most forward-looking. The prices paid sub-index is important for inflation expectations. A sustained decline toward or below 50 often precedes recession.",
 marketImpact: {
 stocks: "A beat to the upside is bullish for industrial and materials stocks. A miss is bearish. The manufacturing ISM is released on the first business day of the month.",
 bonds: "A strong ISM is bearish for bonds. A weak ISM is bullish, particularly if new orders are contracting.",
 forex: "Stronger-than-expected ISM is dollar-positive. Weaker ISM is dollar-negative.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["PMI", "Industrial Production", "Durable Goods", "Factory Orders"],
 },
 {
 name: "Retail Sales",
 frequency: "monthly",
 source: "US Census Bureau",
 whatItMeasures:
 "The total receipts of retail stores, measuring direct consumer spending on durable and non-durable goods. Consumer spending accounts for roughly 70% of US GDP.",
 whyItMatters:
 "Since consumer spending is the largest component of GDP, retail sales directly indicates the health of the consumer economy. Strong retail sales suggest economic resilience, while weakening sales can foreshadow recession.",
 howToRead:
 "Focus on the 'control group' (excludes autos, gasoline, building materials, and food services) as it feeds directly into the GDP calculation. Month-over-month changes are volatile; look at 3-month trends. Adjust for inflation to see real spending growth.",
 marketImpact: {
 stocks: "Strong retail sales are bullish for consumer discretionary stocks. Weak sales are bearish and suggest economic slowing.",
 bonds: "Strong retail data is bearish for bonds. Weak data is bullish as it implies a weaker economy.",
 forex: "Strong retail sales strengthen the dollar as they imply a robust consumer economy.",
 },
 leadingOrLagging: "coincident",
 relatedIndicators: ["Consumer Confidence", "Personal Income", "PCE", "GDP"],
 },
 {
 name: "Housing Starts",
 frequency: "monthly",
 source: "US Census Bureau",
 whatItMeasures:
 "The number of new residential construction projects that have begun during a given period. Includes both single-family and multi-family units.",
 whyItMatters:
 "Housing is one of the most interest-rate-sensitive sectors of the economy. Housing starts are a strong leading indicator because they reflect builder confidence, consumer demand, and the availability of credit. Housing wealth effects influence consumer spending.",
 howToRead:
 "Seasonally adjusted annual rates of 1.4-1.6 million are considered healthy. Watch the trend direction more than the absolute level. Single-family starts are a better economic signal than multi-family. Building permits (also reported) are an even more forward-looking indicator.",
 marketImpact: {
 stocks: "Strong starts are bullish for homebuilders, materials companies, and home improvement retailers. Weak starts are bearish for housing-related sectors.",
 bonds: "Strong housing data is modestly bearish for bonds. Very weak housing can be bullish for bonds if it signals broader economic weakness.",
 forex: "A secondary indicator for forex; impacts are usually small unless part of a broader trend.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["Building Permits", "Existing Home Sales", "New Home Sales", "NAHB Housing Market Index"],
 },
 {
 name: "Building Permits",
 frequency: "monthly",
 source: "US Census Bureau",
 whatItMeasures:
 "The number of permits issued for new housing construction. Since permits precede actual construction by weeks to months, they are one of the most forward-looking housing indicators.",
 whyItMatters:
 "Building permits are a component of the Conference Board's Leading Economic Index. They reflect builder expectations about future demand and are highly sensitive to interest rate changes. Permits lead actual construction activity.",
 howToRead:
 "Rising permits signal confidence in future housing demand. A sharp decline in permits often precedes economic downturns. Compare to housing starts: if permits exceed starts, a construction pipeline is building. If starts exceed permits, the pipeline is being drawn down.",
 marketImpact: {
 stocks: "Rising permits are bullish for homebuilders and building materials stocks. Declining permits are a warning signal.",
 bonds: "A secondary driver for bonds. Very weak permit data as part of a broader weakening trend supports bonds.",
 forex: "Minimal direct forex impact, but contributes to the overall economic picture.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["Housing Starts", "New Home Sales", "Mortgage Applications", "30-Year Mortgage Rate"],
 },
 {
 name: "Industrial Production",
 frequency: "monthly",
 source: "Federal Reserve Board",
 whatItMeasures:
 "The real output of manufacturing, mining, and electric and gas utilities in the US. The closely related Capacity Utilization rate measures how much of the economy's productive capacity is being used.",
 whyItMatters:
 "Industrial production provides a direct measure of real economic output. Capacity utilization above 80% can signal inflation pressure as the economy runs hot. Low utilization indicates slack and potential disinflation.",
 howToRead:
 "Month-over-month changes show momentum. Capacity utilization above 80% historically precedes inflation. Below 75% signals significant economic slack. The manufacturing component is most relevant for equity market analysis.",
 marketImpact: {
 stocks: "Strong industrial production supports industrial and materials stocks. Weak data is bearish for cyclicals.",
 bonds: "Strong data is modestly bearish for bonds. Very high capacity utilization raises inflation concerns.",
 forex: "A secondary indicator; contributes to the overall growth picture that drives currency values.",
 },
 leadingOrLagging: "coincident",
 relatedIndicators: ["ISM Manufacturing", "PMI", "GDP", "Durable Goods"],
 },
 {
 name: "Consumer Confidence Index",
 frequency: "monthly",
 source: "The Conference Board",
 whatItMeasures:
 "A survey-based index measuring how optimistic or pessimistic consumers are regarding their expected financial situation. Measures both current conditions and future expectations.",
 whyItMatters:
 "Consumer confidence drives spending decisions. When consumers feel confident, they spend more freely, driving economic growth. Sharp drops in confidence can precede recessions as consumers pull back spending preemptively.",
 howToRead:
 "The index is benchmarked to 1985 = 100. Readings above 100 indicate optimism relative to that base. The Expectations component (6-month outlook) is a leading indicator, while the Present Situation component is coincident. A drop of 20+ points from a recent peak has historically signaled recession.",
 marketImpact: {
 stocks: "Rising confidence is bullish for consumer discretionary stocks. Falling confidence is bearish.",
 bonds: "Falling confidence is bullish for bonds as it implies weaker future spending and growth.",
 forex: "Higher confidence strengthens the currency as it implies stronger economic activity.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["University of Michigan Consumer Sentiment", "Retail Sales", "PCE", "Personal Income"],
 },
 {
 name: "Durable Goods Orders",
 frequency: "monthly",
 source: "US Census Bureau",
 whatItMeasures:
 "New orders placed with domestic manufacturers for goods expected to last at least three years (machinery, computers, appliances, aircraft). A proxy for business investment spending.",
 whyItMatters:
 "Durable goods orders reflect business confidence and investment plans. Core capital goods orders (excluding defense and aircraft) are the best gauge of business investment. Weakness here often precedes economic slowdowns.",
 howToRead:
 "Focus on core capital goods orders (non-defense excluding aircraft) for the business investment signal. Headline numbers are volatile due to large aircraft orders. Three-month moving averages smooth the noise. Shipments data feeds into GDP calculations.",
 marketImpact: {
 stocks: "Strong orders are bullish for industrials and capital goods companies. Weak orders are bearish and can signal a business spending pullback.",
 bonds: "Strong data is bearish for bonds. Weak data supports bonds, especially if it indicates a capex downturn.",
 forex: "A secondary indicator; strong data modestly supports the dollar.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["ISM New Orders", "Industrial Production", "GDP", "Factory Orders"],
 },
 {
 name: "Trade Balance",
 frequency: "monthly",
 source: "US Census Bureau / Bureau of Economic Analysis",
 whatItMeasures:
 "The difference between a country's exports and imports of goods and services. A trade deficit means imports exceed exports; a surplus means exports exceed imports.",
 whyItMatters:
 "The trade balance directly impacts GDP (net exports are a GDP component). Large trade deficits can weaken the currency over time, while surpluses strengthen it. Trade imbalances can lead to political tensions and tariff policies.",
 howToRead:
 "The US has run a persistent trade deficit for decades. Watch the trend and month-over-month changes rather than the absolute level. A widening deficit can signal strong domestic demand (importing more) or weakening competitiveness. Oil and commodity prices significantly affect the goods balance.",
 marketImpact: {
 stocks: "A wider deficit has limited direct stock market impact but can affect export-heavy companies if it reflects currency strength.",
 bonds: "Persistent deficits increase the need for foreign capital inflows, which can affect Treasury demand and yields.",
 forex: "Widening deficits tend to weaken the domestic currency. Narrowing deficits support it.",
 },
 leadingOrLagging: "lagging",
 relatedIndicators: ["GDP", "Dollar Index", "Import Prices", "Export Prices"],
 },
 {
 name: "Federal Funds Rate",
 frequency: "monthly",
 source: "Federal Reserve (FOMC)",
 whatItMeasures:
 "The target interest rate at which commercial banks lend their excess reserves to each other overnight. It is the primary tool of Federal Reserve monetary policy.",
 whyItMatters:
 "The Fed Funds Rate is the most important price in global finance. It influences all other interest rates, from mortgages to corporate bonds. Rate hikes slow the economy and tighten financial conditions; rate cuts stimulate growth and loosen conditions.",
 howToRead:
 "FOMC meetings occur eight times per year. Watch the dot plot (FOMC members' rate projections), the statement language, and the press conference for forward guidance. The CME FedWatch tool shows market-implied probabilities for future rate decisions. The direction and pace of changes matter more than the absolute level.",
 marketImpact: {
 stocks: "Rate cuts are generally bullish for stocks (lower discount rates, easier financial conditions). Rate hikes are bearish. The market anticipates moves, so surprises matter most.",
 bonds: "Rate hikes push short-term yields higher. Rate cuts push them lower. Long-term yields react to the expected cumulative path of rates.",
 forex: "Higher rates attract foreign capital and strengthen the currency. Lower rates weaken it. Rate differentials between countries drive forex trends.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["10-Year Yield", "CPI", "PCE", "Unemployment Rate", "GDP"],
 },
 {
 name: "10-Year Treasury Yield",
 frequency: "weekly",
 source: "US Department of the Treasury",
 whatItMeasures:
 "The yield on 10-year US government bonds, representing the return investors demand for lending to the US government for a decade. It is the benchmark for long-term interest rates globally.",
 whyItMatters:
 "The 10-year yield is the most important rate in global finance. It sets the benchmark for mortgage rates, corporate borrowing costs, and equity valuations (via the discount rate in DCF models). It reflects market expectations for growth, inflation, and Fed policy.",
 howToRead:
 "The 10-year yield is driven by three factors: expected short-term rates, inflation expectations, and the term premium. Rising yields generally mean higher growth/inflation expectations or less demand for safety. Falling yields signal the opposite. Rapid moves (50+ bps in a month) tend to disrupt equity markets.",
 marketImpact: {
 stocks: "Rising yields are headwinds for growth and tech stocks (higher discount rates). Moderately rising yields can be positive if driven by growth expectations. Falling yields benefit growth stocks but may signal recession fears.",
 bonds: "Rising yields mean falling bond prices. Falling yields mean rising prices. Duration determines sensitivity.",
 forex: "Higher US yields attract foreign capital and strengthen the dollar.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["Fed Funds Rate", "Yield Curve", "CPI", "Mortgage Rates"],
 },
 {
 name: "Yield Curve (2s10s Spread)",
 frequency: "weekly",
 source: "US Department of the Treasury / Federal Reserve",
 whatItMeasures:
 "The difference between long-term (10-year) and short-term (2-year) Treasury yields. A positive spread means longer maturities yield more than shorter ones (normal). An inverted curve means short-term rates exceed long-term rates.",
 whyItMatters:
 "The yield curve is one of the most reliable recession predictors in economics. An inverted yield curve (2-year yield above 10-year) has preceded every US recession since the 1960s. It signals that the market expects the Fed will need to cut rates due to economic weakness.",
 howToRead:
 "A positive and steepening curve is healthy (economy expected to grow). A flattening curve signals caution. An inverted curve is a recession warning, though the timing can be 6-24 months before recession. The un-inversion (return to positive) often occurs just before or during the recession itself.",
 marketImpact: {
 stocks: "Inversion is a long-term warning signal but stocks can rally for months after inversion. Steepening from inversion often coincides with the onset of economic weakness.",
 bonds: "Inversion suggests buying long-duration bonds as the market expects rate cuts. Steepening favors shorter duration.",
 forex: "Curve inversion can weaken the currency if it signals imminent recession. The relationship is complex.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["Fed Funds Rate", "10-Year Yield", "GDP", "Recession Probability"],
 },
 {
 name: "Personal Consumption Expenditures (PCE)",
 frequency: "monthly",
 source: "Bureau of Economic Analysis (BEA)",
 whatItMeasures:
 "A measure of consumer spending and also a price index (PCE Price Index). The PCE Price Index is the Fed's preferred measure of inflation, differing from CPI in methodology and basket composition.",
 whyItMatters:
 "The PCE Price Index is explicitly what the Fed targets at 2%. It captures a broader range of expenditures than CPI and accounts for substitution effects (consumers switching to cheaper alternatives). Core PCE (excluding food and energy) is the most closely watched by the Fed.",
 howToRead:
 "Watch core PCE year-over-year for the Fed's inflation target tracking. Month-over-month core PCE of 0.2% or below is consistent with the 2% annual target. The spending component (real PCE) is the largest component of GDP and shows consumer health.",
 marketImpact: {
 stocks: "Hot PCE is bearish (implies tighter Fed). Cool PCE is bullish (implies potential rate cuts). Real spending growth is independently important for earnings expectations.",
 bonds: "The PCE Price Index is the most direct driver of Fed policy expectations. Hot PCE = yields up. Cool PCE = yields down.",
 forex: "PCE closer to the Fed's target supports dollar stability. Deviations drive rate expectations and currency moves.",
 },
 leadingOrLagging: "lagging",
 relatedIndicators: ["CPI", "Fed Funds Rate", "Retail Sales", "Personal Income"],
 },
 {
 name: "JOLTS (Job Openings and Labor Turnover Survey)",
 frequency: "monthly",
 source: "Bureau of Labor Statistics (BLS)",
 whatItMeasures:
 "The number of job openings, hires, and separations (quits, layoffs, discharges) in the US economy. Provides a comprehensive view of labor market dynamics beyond just employment levels.",
 whyItMatters:
 "JOLTS data reveals the demand side of the labor market. The ratio of job openings to unemployed workers shows how tight the labor market is. The quits rate (people voluntarily leaving jobs) reflects worker confidence. Fed Chair Powell has specifically cited JOLTS as important for policy decisions.",
 howToRead:
 "Watch the job openings number and the openings-to-unemployed ratio. A ratio above 1.0 means there are more jobs than job seekers (tight market). The quits rate above 2.5% indicates strong worker confidence. Falling openings can signal economic cooling before layoffs appear in NFP.",
 marketImpact: {
 stocks: "Falling job openings can be bullish (less wage pressure, potential rate cuts) or bearish (economic weakness). Context matters.",
 bonds: "Declining openings are bullish for bonds as they suggest labor market cooling and potential rate cuts.",
 forex: "Strong JOLTS data supports the dollar. Weakening data can weaken it if it signals economic deceleration.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["NFP", "Unemployment Rate", "Initial Claims", "Average Hourly Earnings"],
 },
 {
 name: "Initial Jobless Claims",
 frequency: "weekly",
 source: "Department of Labor",
 whatItMeasures:
 "The number of new filings for unemployment insurance benefits each week. It is the most timely labor market indicator, released every Thursday for the prior week.",
 whyItMatters:
 "Initial claims are the earliest signal of labor market deterioration. Because data is weekly, it catches turning points faster than monthly indicators. Sustained increases above 300,000 historically signal recession risk. Claims below 200,000 indicate an extremely tight labor market.",
 howToRead:
 "Use the 4-week moving average to smooth volatility from holidays, weather, and seasonal factors. Below 250,000 indicates a healthy labor market. A sustained rise of 50,000+ from the trough is a warning signal. Continuing claims (total ongoing recipients) shows how quickly displaced workers find new jobs.",
 marketImpact: {
 stocks: "Rising claims are bearish for cyclical stocks. Very low claims can be bearish if they signal too-tight labor markets and hawkish Fed.",
 bonds: "Rising claims are bullish for bonds (economic weakness = rate cuts). Falling claims are bearish.",
 forex: "Rising claims weaken the currency. Falling claims strengthen it.",
 },
 leadingOrLagging: "leading",
 relatedIndicators: ["NFP", "Unemployment Rate", "Continuing Claims", "JOLTS"],
 },
];
