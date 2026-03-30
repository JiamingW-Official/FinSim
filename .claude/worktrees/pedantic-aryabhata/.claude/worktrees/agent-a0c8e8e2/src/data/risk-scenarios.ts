export interface RiskEvent {
  date: string;
  description: string;
}

export interface RiskScenario {
  name: string;
  year: string;
  duration: string;
  trigger: string;
  spDrawdown: number;
  vixPeak: number;
  recoveryMonths: number;
  severity: "moderate" | "severe" | "extreme";
  summary: string;
  timeline: RiskEvent[];
  lessons: string[];
  recoveryTime: string;
}

export const RISK_SCENARIOS: RiskScenario[] = [
  {
    name: "1929 Wall Street Crash",
    year: "1929",
    duration: "Approximately 3 years to the bottom (July 1932)",
    trigger:
      "Speculative mania fueled by excessive margin lending (up to 90% leverage), overvaluation of stocks, and a tightening Federal Reserve.",
    spDrawdown: -86,
    vixPeak: 0,
    recoveryMonths: 300,
    severity: "extreme",
    summary:
      "The worst stock market crash in US history. Speculative excess and margin lending created a bubble that, when it burst, led to the Great Depression and wiped out 86% of market value over three years.",
    timeline: [
      { date: "Sep 1929", description: "Dow Jones Industrial Average reaches its all-time high of 381.17." },
      { date: "Oct 24", description: "Black Thursday: panic selling begins with nearly 13 million shares traded." },
      { date: "Oct 28", description: "Black Monday: Dow drops 12.8% in one session." },
      { date: "Oct 29", description: "Black Tuesday: Dow falls another 11.7%. Over 16 million shares traded." },
      { date: "Nov 1929", description: "Dow reaches an interim low of 198.60, down 48% from the peak." },
      { date: "Apr 1930", description: "Markets rally back to 294, creating a false recovery that traps buyers." },
      { date: "Jul 1932", description: "Dow bottoms at 41.22, an 89% decline from the 1929 peak." },
    ],
    lessons: [
      "Excessive leverage amplifies losses catastrophically; margin calls create forced selling cascades.",
      "False recoveries (dead cat bounces) can be large and convincing before the ultimate bottom.",
      "Speculative manias eventually end, and the correction is proportional to the excess.",
      "Government and central bank responses matter enormously. Inaction worsened the Depression.",
      "Diversification and cash reserves are essential for surviving prolonged bear markets.",
    ],
    recoveryTime: "25 years. The Dow did not surpass its 1929 high until November 1954.",
  },
  {
    name: "Black Monday",
    year: "1987",
    duration: "Single day crash with a 2-month drawdown period",
    trigger:
      "Combination of rising interest rates, trade deficit concerns, overvaluation, and portfolio insurance (automated selling using futures).",
    spDrawdown: -33.5,
    vixPeak: 150,
    recoveryMonths: 24,
    severity: "extreme",
    summary:
      "The largest single-day percentage drop in stock market history. The Dow fell 22.6% in one session, driven by automated portfolio insurance strategies that amplified selling in a cascading feedback loop.",
    timeline: [
      { date: "Aug 1987", description: "Dow peaks at 2722.42, up 44% year-to-date." },
      { date: "Oct 14", description: "Dow drops 3.8% as trade deficit data disappoints." },
      { date: "Oct 16", description: "Dow falls 4.6%. Triple witching expiration amplifies selling." },
      { date: "Oct 19", description: "Black Monday: Dow plunges 22.6% in a single session." },
      { date: "Oct 20", description: "Fed Chairman Greenspan announces the Fed stands ready to provide liquidity." },
      { date: "Oct 20", description: "Dow rallies 5.9% as the Fed intervenes. NYSE specialists step in to make markets." },
      { date: "Dec 1987", description: "Dow reaches its lowest closing point of the period at 1766.74." },
    ],
    lessons: [
      "Automated trading strategies can amplify and accelerate crashes through feedback loops.",
      "Circuit breakers were subsequently introduced to halt cascading sell-offs.",
      "Central bank intervention (the Fed providing liquidity) can stabilize markets rapidly.",
      "A single-day crash does not necessarily mean a prolonged bear market; quick recovery is possible.",
      "Diversification across asset classes provides protection when equity markets fail simultaneously.",
    ],
    recoveryTime: "Approximately 2 years. The Dow recovered its pre-crash high by September 1989.",
  },
  {
    name: "Asian Financial Crisis",
    year: "1997",
    duration: "Approximately 18 months",
    trigger:
      "Collapse of the Thai baht after Thailand abandoned its dollar peg, triggering capital flight from Asian economies with pegged currencies and excessive foreign-denominated debt.",
    spDrawdown: -19.3,
    vixPeak: 38,
    recoveryMonths: 8,
    severity: "moderate",
    summary:
      "A currency crisis that started in Thailand and spread across East Asia, causing severe economic downturns. Exposed vulnerabilities in emerging market economies reliant on foreign capital and fixed exchange rates.",
    timeline: [
      { date: "Jul 1997", description: "Thailand floats the baht, which immediately falls 15-20% against the dollar." },
      { date: "Aug 1997", description: "Crisis spreads to Indonesia, South Korea, and the Philippines as currencies collapse." },
      { date: "Oct 17", description: "Taiwan devalues its currency, spreading fears to Hong Kong." },
      { date: "Oct 27", description: "Dow drops 554 points (7.2%), triggering trading halts under new circuit breaker rules." },
      { date: "Nov 1997", description: "South Korea seeks a $57 billion IMF bailout, the largest at the time." },
      { date: "Jan 1998", description: "Indonesia's rupiah loses 80% of its value; political crisis follows." },
      { date: "Mid-1998", description: "Crisis subsides as IMF programs stabilize currencies and reforms take hold." },
    ],
    lessons: [
      "Currency pegs can create false stability; when they break, the adjustment is violent.",
      "Foreign-denominated debt is a hidden risk that amplifies currency crises.",
      "Contagion can spread rapidly across interconnected emerging markets.",
      "Moral hazard and crony capitalism undermine financial system resilience.",
      "International coordination (IMF) is critical but comes with political and economic costs.",
    ],
    recoveryTime: "US markets recovered within months. Most Asian indices took 3-5 years.",
  },
  {
    name: "Dot-Com Bubble",
    year: "2000",
    duration: "Approximately 2.5 years to the bottom (October 2002)",
    trigger:
      "Speculative mania in internet and technology stocks with extreme valuations disconnected from fundamentals. Many companies had no earnings, no revenue, and unsustainable business models.",
    spDrawdown: -49,
    vixPeak: 45,
    recoveryMonths: 84,
    severity: "extreme",
    summary:
      "The bursting of the internet stock bubble destroyed trillions in market value. The NASDAQ fell 78% from peak to trough, and many dot-com companies went bankrupt, taking investors' savings with them.",
    timeline: [
      { date: "Mar 2000", description: "NASDAQ peaks at 5048.62, having tripled in the prior 18 months." },
      { date: "Apr 2000", description: "NASDAQ drops 9.7% in one week, the first significant crack." },
      { date: "Dec 2000", description: "Many dot-com companies run out of cash. Layoffs accelerate across tech." },
      { date: "Mar 2001", description: "US officially enters recession. NASDAQ already down over 60% from peak." },
      { date: "Sep 2001", description: "Terrorist attacks close markets for 4 trading days and accelerate the downturn." },
      { date: "Jul 2002", description: "WorldCom accounting fraud destroys investor confidence. Largest bankruptcy at the time." },
      { date: "Oct 2002", description: "NASDAQ bottoms at 1114.11, down 78% from peak. S&P 500 bottoms down 49%." },
    ],
    lessons: [
      "Valuation matters eventually. Companies without earnings cannot sustain unlimited appreciation.",
      "A compelling narrative does not substitute for fundamental analysis and cash flow.",
      "Sector concentration is extremely dangerous; diversification across sectors is essential.",
      "Bear markets can last years and destroy 50-80% of value in speculative sectors.",
      "The best companies survive and eventually recover, but most speculative names go to zero.",
    ],
    recoveryTime: "S&P 500 took about 7 years (October 2007). NASDAQ took 15 years (April 2015).",
  },
  {
    name: "Global Financial Crisis",
    year: "2008",
    duration: "Approximately 18 months from peak to trough",
    trigger:
      "Collapse of the US housing bubble, subprime mortgage crisis, failure of major financial institutions, and a global credit freeze from excessive leverage and complex derivatives.",
    spDrawdown: -57,
    vixPeak: 80,
    recoveryMonths: 48,
    severity: "extreme",
    summary:
      "The worst financial crisis since 1929, triggered by the collapse of the housing market and subprime lending. Lehman Brothers' bankruptcy caused a global credit freeze that threatened the entire financial system.",
    timeline: [
      { date: "Oct 2007", description: "S&P 500 peaks at 1565. Housing prices have already begun declining." },
      { date: "Mar 2008", description: "Bear Stearns collapses and is acquired by JPMorgan in a Fed-brokered deal." },
      { date: "Sep 7", description: "Fannie Mae and Freddie Mac placed into conservatorship by the US government." },
      { date: "Sep 15", description: "Lehman Brothers files for bankruptcy. Global panic begins." },
      { date: "Sep 16", description: "AIG receives $85 billion government bailout to prevent systemic collapse." },
      { date: "Oct 3", description: "Congress passes the $700 billion TARP program." },
      { date: "Mar 2009", description: "S&P 500 bottoms at 676.53, down 57% from the peak." },
    ],
    lessons: [
      "Systemic risk can be hidden by complex derivatives and off-balance-sheet entities.",
      "Excessive leverage in the banking system creates fragility that can cascade into full crisis.",
      "Government intervention (TARP, QE) can prevent complete systemic collapse.",
      "Counterparty risk is real: even AA-rated institutions can fail.",
      "Buying during peak fear (March 2009) was one of the best investment opportunities of a generation.",
    ],
    recoveryTime: "Approximately 4 years for the S&P 500 to reach its pre-crisis high (March 2013).",
  },
  {
    name: "Flash Crash",
    year: "2010",
    duration: "Approximately 36 minutes for the crash; same-session recovery",
    trigger:
      "A large E-mini S&P 500 futures sell order executed via an automated algorithm interacted with high-frequency trading systems, creating a cascading liquidity vacuum.",
    spDrawdown: -9.2,
    vixPeak: 40,
    recoveryMonths: 0,
    severity: "moderate",
    summary:
      "The market plunged nearly 1000 points in minutes due to algorithmic trading interactions. Liquidity evaporated as market makers withdrew, and some stocks briefly traded at absurd prices before recovering.",
    timeline: [
      { date: "2:32 PM", description: "Waddell & Reed initiates a $4.1 billion E-mini sell order via algorithm." },
      { date: "2:41 PM", description: "HFT firms rapidly buy and resell contracts, amplifying selling pressure." },
      { date: "2:45 PM", description: "Dow drops nearly 1000 points in minutes. Accenture briefly trades at $0.01." },
      { date: "2:45 PM", description: "Liquidity evaporates as market makers withdraw. Stub quotes get executed." },
      { date: "3:00 PM", description: "CME triggers a 5-second trading halt on E-mini futures." },
      { date: "3:08 PM", description: "Markets recover most of the decline." },
      { date: "Post-close", description: "Over 20,000 trades across 300+ securities are cancelled as erroneous." },
    ],
    lessons: [
      "Algorithmic trading can withdraw liquidity instantly in a crisis, amplifying volatility.",
      "Market microstructure fragility means prices can temporarily disconnect from fundamentals.",
      "Stop-loss and market orders can execute at absurd prices during flash events.",
      "Use limit orders instead of market orders to protect against flash crash scenarios.",
      "Regulatory responses included single-stock circuit breakers and limit up-limit down rules.",
    ],
    recoveryTime: "Same day. Markets recovered most losses within 36 minutes.",
  },
  {
    name: "European Debt Crisis",
    year: "2011",
    duration: "Approximately 5 months of acute market stress",
    trigger:
      "Escalating fears of sovereign debt defaults in Greece, Italy, Spain, and Portugal threatening the eurozone's existence, compounded by the US debt ceiling standoff and S&P's downgrade of US debt.",
    spDrawdown: -21.6,
    vixPeak: 48,
    recoveryMonths: 6,
    severity: "severe",
    summary:
      "A sovereign debt crisis in Europe threatened the survival of the eurozone. Combined with the unprecedented downgrade of US government debt, it caused a sharp global sell-off and widespread uncertainty.",
    timeline: [
      { date: "Jul 2011", description: "Italian and Spanish bond yields spike above 6%, raising contagion fears." },
      { date: "Jul 21", description: "Eurozone leaders agree to a second Greek bailout, but markets remain skeptical." },
      { date: "Aug 2", description: "US raises the debt ceiling at the last minute after months of brinkmanship." },
      { date: "Aug 5", description: "S&P downgrades US debt from AAA to AA+ for the first time in history." },
      { date: "Aug 8", description: "S&P 500 drops 6.7%, the worst day since the 2008 crisis." },
      { date: "Sep 2011", description: "Greece teeters on the brink of euro exit. Bank stocks plummet worldwide." },
      { date: "Oct 4", description: "S&P 500 reaches intraday low, down 21.6% from the April high." },
    ],
    lessons: [
      "Sovereign debt crises can threaten entire currency unions and have global repercussions.",
      "Political dysfunction amplifies financial market stress.",
      "Credit rating downgrades can have outsized psychological impact.",
      "European bank interconnectedness meant sovereign risk quickly became banking system risk.",
      "Central bank intervention (ECB's commitment) ultimately calmed markets.",
    ],
    recoveryTime: "Approximately 6 months for the S&P 500 to fully recover (early 2012).",
  },
  {
    name: "China Stock Market Crash",
    year: "2015",
    duration: "Approximately 3 months of acute decline",
    trigger:
      "The Chinese stock market bubble burst after a speculative rally fueled by margin lending to retail investors. Government attempts to prop up the market failed and eroded confidence.",
    spDrawdown: -12.4,
    vixPeak: 53,
    recoveryMonths: 5,
    severity: "moderate",
    summary:
      "A retail-driven margin bubble in Chinese stocks collapsed spectacularly. Government intervention including banning short selling and suspending IPOs failed to stop the rout, which spread to global markets.",
    timeline: [
      { date: "Jun 2015", description: "Shanghai Composite peaks at 5178 after more than doubling in 12 months." },
      { date: "Jun-Jul", description: "Chinese stocks drop 30% in three weeks. Margin calls accelerate selling." },
      { date: "Jul 2015", description: "Government suspends IPOs, buys stocks directly, and bans short selling." },
      { date: "Aug 11", description: "People's Bank of China unexpectedly devalues the yuan, shocking global markets." },
      { date: "Aug 24", description: "Global markets crash. Dow drops over 1000 points at the open. VIX spikes to 53." },
      { date: "Aug 25", description: "Apple CEO contacts media to reassure about China sales. Markets stabilize." },
      { date: "Sep 2015", description: "Fed delays rate hike citing global uncertainty. Gradual stabilization begins." },
    ],
    lessons: [
      "Government intervention in markets can backfire and increase panic when measures appear desperate.",
      "Retail-driven margin bubbles are extremely fragile and collapse rapidly.",
      "Currency devaluations can have cascading effects on global asset markets.",
      "China's financial system opacity creates uncertainty that amplifies global risk-off moves.",
      "The interconnectedness of global markets means a crisis in one major economy affects all others.",
    ],
    recoveryTime: "S&P 500 recovered in about 5 months. Shanghai never returned to 2015 highs.",
  },
  {
    name: "Volmageddon",
    year: "2018",
    duration: "Acute phase lasted 2 weeks; broader correction took 10 months",
    trigger:
      "A sudden spike in volatility caused inverse VIX products (XIV, SVXY) to implode. Years of low volatility had created a crowded short-volatility trade that unwound violently.",
    spDrawdown: -20.2,
    vixPeak: 50,
    recoveryMonths: 14,
    severity: "severe",
    summary:
      "The implosion of inverse volatility products revealed the fragility of crowded trades. The XIV ETN lost 96% of its value in hours, and the broader market suffered a 20% correction over the course of the year.",
    timeline: [
      { date: "Jan 2018", description: "S&P 500 peaks at 2872.87 with VIX averaging a historically low 11." },
      { date: "Feb 2", description: "Strong jobs report raises inflation fears. S&P drops 2.1%." },
      { date: "Feb 5", description: "VIX doubles intraday from 17 to 50. XIV inverse VIX ETN loses 96% in hours." },
      { date: "Feb 5", description: "S&P 500 drops 4.1%. Credit Suisse announces it will terminate XIV." },
      { date: "Feb 6", description: "Markets whipsaw with a 4.6% range. Volatility remains elevated." },
      { date: "Feb 9", description: "S&P reaches correction low, down 11.8% from January high." },
      { date: "Dec 24", description: "S&P hits 2351, down 20.2% from peak amid Fed tightening fears. The actual bottom." },
    ],
    lessons: [
      "Crowded trades create systemic risk that is invisible until it materializes.",
      "Inverse and leveraged products can suffer complete loss in extreme scenarios.",
      "Low volatility breeds complacency; extended calm periods are often followed by violent resets.",
      "Products you don't fully understand can behave in unexpected ways during stress.",
      "The VIX is mean-reverting but can spike far beyond what historical ranges suggest.",
    ],
    recoveryTime: "The February spike recovered in 2 months. The 2018 correction bottom recovered by April 2019.",
  },
  {
    name: "COVID-19 Crash",
    year: "2020",
    duration: "Approximately 33 calendar days from peak to trough",
    trigger:
      "Global pandemic caused worldwide lockdowns, halting economic activity. Oil price war between Saudi Arabia and Russia added fuel. Fastest bear market in history.",
    spDrawdown: -34,
    vixPeak: 82,
    recoveryMonths: 5,
    severity: "extreme",
    summary:
      "The fastest bear market in history, with the S&P 500 falling 34% in just 33 days. Unprecedented monetary and fiscal stimulus produced an equally rapid V-shaped recovery.",
    timeline: [
      { date: "Feb 19", description: "S&P 500 peaks at 3386.15 as COVID-19 concerns are largely dismissed." },
      { date: "Feb 24", description: "S&P drops 3.4% as cases surge in Italy and South Korea." },
      { date: "Mar 9", description: "S&P drops 7.6%, triggering the first circuit breaker halt in over a decade." },
      { date: "Mar 12", description: "S&P drops 9.5%, the worst day since 1987. Circuit breaker triggered again." },
      { date: "Mar 16", description: "S&P drops 12%. VIX closes at 82.69. Third circuit breaker in a week." },
      { date: "Mar 23", description: "S&P bottoms at 2237.40. The Fed announces unlimited QE." },
      { date: "Mar 26", description: "CARES Act ($2.2 trillion stimulus) signed into law. Markets rally sharply." },
    ],
    lessons: [
      "Black swan events can cause faster and deeper crashes than anyone expects.",
      "Unprecedented monetary and fiscal stimulus can create V-shaped recoveries.",
      "Having cash available during a crash is the most valuable asset for long-term wealth creation.",
      "Circuit breakers prevented cascading panic but did not prevent the overall decline.",
      "Market timing is nearly impossible: the bottom occurred when the news was still getting worse.",
    ],
    recoveryTime: "Approximately 5 months. S&P reached a new all-time high by August 18, 2020.",
  },
  {
    name: "2022 Bear Market",
    year: "2022",
    duration: "Approximately 10 months from peak to trough",
    trigger:
      "Aggressive Federal Reserve rate hikes to combat 40-year-high inflation. The Fed raised rates from 0% to over 4% in less than a year, compressing valuations.",
    spDrawdown: -25.4,
    vixPeak: 36,
    recoveryMonths: 24,
    severity: "severe",
    summary:
      "The first major rate-hike-driven bear market in decades. Rising inflation forced the Fed into the most aggressive tightening cycle since the early 1980s, crushing growth stock valuations and breaking the traditional 60/40 portfolio.",
    timeline: [
      { date: "Jan 2022", description: "S&P 500 peaks at 4796.56. Inflation readings begin accelerating." },
      { date: "Mar 16", description: "Fed raises rates for the first time since 2018." },
      { date: "Jun 13", description: "S&P enters official bear market territory (-20%). CPI prints 9.1%." },
      { date: "Jun 15", description: "Fed delivers a 75 basis point hike, the largest since 1994." },
      { date: "Sep 2022", description: "UK pension crisis (gilts crash) raises fears of global contagion." },
      { date: "Oct 13", description: "S&P reaches intraday low of 3491.58, down 25.4% from peak." },
      { date: "Oct 13", description: "Market reverses dramatically intraday, closing higher. Marks the ultimate bottom." },
    ],
    lessons: [
      "Interest rates are the most powerful force in asset pricing.",
      "Inflation erodes real returns and forces central banks into growth-hostile policy.",
      "Growth stocks suffer most when discount rates rise (long-duration assets).",
      "Bonds and stocks can decline simultaneously, breaking the traditional 60/40 hedge.",
      "Bear markets caused by rate hikes can resolve faster once the market prices in peak rates.",
    ],
    recoveryTime: "The S&P 500 surpassed its January 2022 high by January 2024, about 2 years.",
  },
  {
    name: "SVB Banking Crisis",
    year: "2023",
    duration: "Acute phase lasted approximately 2 weeks",
    trigger:
      "Silicon Valley Bank failed after a depositor run caused by unrealized losses in its bond portfolio due to rising interest rates. Contagion fears spread to other regional banks.",
    spDrawdown: -7.8,
    vixPeak: 31,
    recoveryMonths: 3,
    severity: "moderate",
    summary:
      "The second-largest bank failure in US history triggered fears of a broader banking crisis. Digital-age bank runs proved to be orders of magnitude faster than historical precedents, with $42 billion withdrawn in a single day.",
    timeline: [
      { date: "Mar 8", description: "SVB announces $1.8B loss on bond sales and a need to raise $2.25 billion." },
      { date: "Mar 9", description: "SVB stock drops 60%. Depositors withdraw $42 billion in a single day." },
      { date: "Mar 10", description: "FDIC seizes Silicon Valley Bank, the second-largest US bank failure." },
      { date: "Mar 12", description: "Signature Bank closed. Government guarantees all deposits at both banks." },
      { date: "Mar 12", description: "Fed launches the Bank Term Funding Program to provide liquidity to banks." },
      { date: "Mar 13", description: "Markets stabilize as the government backstop calms depositor fears." },
      { date: "May 1", description: "First Republic Bank fails and is seized, sold to JPMorgan Chase." },
    ],
    lessons: [
      "Rising interest rates create hidden unrealized losses in bond portfolios.",
      "Bank runs can happen at digital speed via mobile banking.",
      "Concentrated depositor bases create correlation risk.",
      "Government intervention remains the primary tool against bank contagion.",
      "Interest rate risk management is essential even for conservative assets like government bonds.",
    ],
    recoveryTime: "S&P 500 recovered pre-SVB levels within about 3 months. Regional banks took much longer.",
  },
];
