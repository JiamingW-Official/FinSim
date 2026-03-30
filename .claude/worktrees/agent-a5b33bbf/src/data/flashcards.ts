import { GLOSSARY } from "./glossary";
import { INDICATOR_EXPLANATIONS } from "./indicator-explanations";

export interface FlashcardItem {
  id: string;
  category: string;
  front: string;
  back: string;
  hint?: string;
}

// Build flashcards from glossary entries
const glossaryCards: FlashcardItem[] = GLOSSARY.map((entry) => ({
  id: `glossary-${entry.term.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
  category: entry.category,
  front: entry.term,
  back: entry.definition,
  hint: entry.example,
}));

// Build flashcards from indicator explanations
const indicatorCards: FlashcardItem[] = Object.entries(INDICATOR_EXPLANATIONS).map(
  ([key, info]) => ({
    id: `indicator-${key}`,
    category: "indicators",
    front: `${info.name}\nHow do you read this indicator?`,
    back: `${info.howToRead}\n\n📈 Bull: ${info.bullSignal}\n📉 Bear: ${info.bearSignal}`,
    hint: info.bestFor,
  }),
);

// Options Greeks flashcards
const greeksCards: FlashcardItem[] = [
  {
    id: "greeks-delta",
    category: "options-greeks",
    front: "Delta\nWhat does it measure and what is the range?",
    back: "Rate of change of option price per $1 move in the underlying. Calls: 0 to +1, Puts: -1 to 0. ATM options have ~0.50 delta. Also approximates probability of expiring ITM. Formula: δC/δS. A delta of 0.70 means the option gains $0.70 for each $1 rise in the stock.",
    hint: "Think of delta as the option's 'speed' relative to the stock",
  },
  {
    id: "greeks-gamma",
    category: "options-greeks",
    front: "Gamma\nWhy is it called the 'accelerator' Greek?",
    back: "Rate of change of delta per $1 move in the underlying. Highest for ATM options near expiration. Formula: δΔ/δS. If an option has delta 0.50 and gamma 0.05, after a $1 rise, delta becomes 0.55. Long options have positive gamma; short options have negative gamma.",
    hint: "Gamma is highest for near-expiry ATM options — most dangerous for sellers",
  },
  {
    id: "greeks-theta",
    category: "options-greeks",
    front: "Theta\nWhat does a theta of -0.05 mean?",
    back: "Time decay — the option loses $0.05 in value each day, all else equal. Theta is negative for long options (you lose time value as a buyer) and positive for short options (sellers benefit from decay). Theta accelerates as expiration approaches, especially in the final 30 days.",
    hint: "Theta favors sellers; the option's 'daily rent' you pay as a buyer",
  },
  {
    id: "greeks-vega",
    category: "options-greeks",
    front: "Vega\nHow does it affect option pricing?",
    back: "Sensitivity of option price to a 1% change in implied volatility (IV). Both calls and puts have positive vega — higher IV = higher option prices. A vega of 0.10 means the option gains $0.10 for each 1% rise in IV. Vega is highest for ATM options with more time to expiry.",
    hint: "Long options benefit from rising volatility (long vega); sellers are short vega",
  },
  {
    id: "greeks-rho",
    category: "options-greeks",
    front: "Rho\nWhen does it matter most?",
    back: "Sensitivity of option price to a 1% change in the risk-free interest rate. Calls have positive rho; puts have negative rho. Rho matters most for long-dated options (LEAPs). Formula: δC/δr. With rates near zero its effect is minimal; in rising-rate environments it becomes relevant for deep ITM calls.",
    hint: "Usually the least important Greek for short-dated trades",
  },
  {
    id: "greeks-vanna",
    category: "options-greeks",
    front: "Vanna\nWhat second-order relationship does it capture?",
    back: "The rate of change of delta with respect to implied volatility (also = rate of change of vega with respect to the spot price). Vanna = δΔ/δIV = δVega/δS. Positive for calls, negative for puts. Important for vol-surface hedging: when IV spikes on a sell-off, vanna causes delta to shift — a key driver of dealer hedging flows.",
    hint: "Second-order cross-Greek between delta and vega",
  },
  {
    id: "greeks-charm",
    category: "options-greeks",
    front: "Charm (Delta Decay)\nWhy do market makers monitor it?",
    back: "The rate of change of delta over time (δΔ/δt). Measures how your delta hedge changes each day without any price movement. Near expiry, ATM options have significant charm — the delta of an ATM call decays toward 0.5 or drifts rapidly. Market makers must rebalance delta hedges daily due to charm.",
    hint: "Charm = how delta changes from passage of time alone",
  },
  {
    id: "greeks-iv-rank",
    category: "options-greeks",
    front: "IV Rank\nHow do traders use it to decide strategy?",
    back: "IV Rank = (Current IV − 52-week low IV) / (52-week high IV − 52-week low IV) × 100. IVR > 50 = elevated IV → favor premium selling strategies (short straddles, iron condors). IVR < 30 = low IV → favor long premium strategies (debit spreads, long straddles). Different from IV Percentile.",
    hint: "High IVR → sell premium; Low IVR → buy premium",
  },
  {
    id: "greeks-parity",
    category: "options-greeks",
    front: "Put-Call Parity\nWhat arbitrage does it prevent?",
    back: "C - P = S - K·e^(-rT). A call minus a put with same strike/expiry equals the forward price of the stock minus the PV of the strike. Any violation creates a risk-free arbitrage. Rearranging: P = C - S + K·e^(-rT). This is the foundation of options pricing and ensures no free lunch between calls and puts.",
    hint: "Allows synthetic replication: synthetic long = long call + short put",
  },
  {
    id: "greeks-vol-smile",
    category: "options-greeks",
    front: "Volatility Smile / Skew\nWhy does it exist?",
    back: "The pattern where OTM puts trade at higher IV than ATM options (for equities this is a skew, not a symmetric smile). Exists because of demand for downside protection and crash risk premium — investors pay more for insurance. For FX, true smiles exist due to symmetric crash risk. Traders watch skew to gauge fear in the market.",
    hint: "Equity vol skew: OTM puts expensive → investors fear crashes",
  },
];

// Risk Management flashcards
const riskMgmtCards: FlashcardItem[] = [
  {
    id: "risk-kelly",
    category: "risk-mgmt",
    front: "Kelly Criterion\nWhat is the formula and why use half-Kelly?",
    back: "Full Kelly: f* = (p·b − q) / b, where p = win probability, q = 1−p, b = avg win / avg loss. Maximizes long-run geometric growth. Half-Kelly (f*/2) is used in practice because: (1) parameters are estimates; (2) full Kelly causes extreme volatility; (3) psychologically tolerable drawdowns. Even small errors in p or b can cause ruin with full Kelly.",
    hint: "Kelly = optimal fraction of bankroll to risk per trade",
  },
  {
    id: "risk-position-sizing",
    category: "risk-mgmt",
    front: "Fixed Percentage Risk\nHow do you size a position using the 1% rule?",
    back: "Risk only 1% of total account per trade. Position size = (Account × Risk%) / (Entry − Stop Loss). Example: $50,000 account, 1% risk = $500 max loss. If stop is $2 below entry, you buy 250 shares. This ensures no single loss is catastrophic. Most professional traders risk 0.5–2% per trade.",
    hint: "Never risk more than you can afford to lose on one trade",
  },
  {
    id: "risk-ruin",
    category: "risk-mgmt",
    front: "Risk of Ruin\nHow does win rate and risk size affect survival?",
    back: "Probability of losing your entire account. Even a strategy with positive expectancy can go broke with over-sizing. Formula approximation: R = ((1-edge)/(1+edge))^(bankroll/bet). With 55% win rate and 1% risk, ruin probability ≈ 0%. With 55% win rate and 10% risk, it rises dramatically. The #1 rule: survive long enough for edge to play out.",
    hint: "Reduce bet size to reduce ruin risk exponentially",
  },
  {
    id: "risk-max-dd",
    category: "risk-mgmt",
    front: "Maximum Drawdown\nHow does it relate to required recovery?",
    back: "Largest peak-to-trough decline in portfolio value. Recovery math is asymmetric: -10% needs +11.1% to recover; -25% needs +33%; -50% needs +100%; -75% needs +300%. This is why capital preservation matters more than chasing returns. Calmar Ratio = Annualized Return / Max Drawdown (higher is better).",
    hint: "Loss of 50% requires 100% gain to recover — brutal math",
  },
  {
    id: "risk-var",
    category: "risk-mgmt",
    front: "Value at Risk (VaR)\nWhat are its three key limitations?",
    back: "VaR answers: 'With X% confidence, we won't lose more than $Y in Z days.' Limitations: (1) Ignores tail severity — says nothing about losses beyond VaR threshold (CVaR fixes this); (2) Assumes normal distribution — real returns are fat-tailed; (3) Historical VaR uses backward-looking data that may not reflect future crises. Basel III now requires CVaR (Expected Shortfall) for banks.",
    hint: "VaR tells you the threshold, not what happens when you cross it",
  },
  {
    id: "risk-cvar",
    category: "risk-mgmt",
    front: "CVaR / Expected Shortfall\nWhy do regulators prefer it over VaR?",
    back: "CVaR = average loss in the worst (1-confidence)% of scenarios. If 99% VaR = $1M, CVaR answers: 'In the worst 1% of days, average loss = $X?' Always ≥ VaR. Coherent risk measure (VaR is not). Captures tail severity. Basel III's FRTB framework replaced 99% VaR with 97.5% ES (CVaR). Better for portfolios with fat tails or illiquid positions.",
    hint: "CVaR = 'given disaster, how bad is it on average?'",
  },
  {
    id: "risk-sharpe",
    category: "risk-mgmt",
    front: "Sharpe Ratio\nWhat does 'risk-adjusted return' really mean?",
    back: "Sharpe = (Rp − Rf) / σp. Measures excess return earned per unit of total risk. Above 1.0 = good; above 2.0 = excellent; above 3.0 = exceptional (rare). Annualize daily Sharpe: multiply by √252. Limitation: penalizes upside and downside volatility equally. A fund making large gains sporadically looks bad on Sharpe — use Sortino instead.",
    hint: "Sharpe: earn more per unit of volatility taken",
  },
  {
    id: "risk-sortino",
    category: "risk-mgmt",
    front: "Sortino Ratio\nWhen should you use it instead of Sharpe?",
    back: "Sortino = (Rp − MAR) / σd, where σd = downside deviation (only negative returns count). Better for strategies with positive skew or asymmetric returns (e.g., trend-following, options selling). A strategy that makes large irregular gains but has low downside volatility will have a much better Sortino than Sharpe. Use Sortino when you only care about downside risk.",
    hint: "Sortino ignores upside volatility — only bad volatility matters",
  },
  {
    id: "risk-correlation",
    category: "risk-mgmt",
    front: "Correlation in Portfolio Risk\nWhy does diversification fail in crises?",
    back: "In normal markets, correlations between assets reduce portfolio volatility: σp² = w1²σ1² + w2²σ2² + 2w1w2ρσ1σ2. But during market stress (2008, COVID), correlations spike toward 1.0 — everything sells off together. 'The only free lunch in finance' (diversification) disappears exactly when you need it. Solution: include true safe havens (gold, Treasuries, volatility products).",
    hint: "Correlation = 1 in crashes; diversification breaks down exactly when needed",
  },
  {
    id: "risk-2pct-rule",
    category: "risk-mgmt",
    front: "The 2% Risk Rule\nHow does it protect traders from ruin?",
    back: "Never risk more than 2% of total trading capital on any single trade. With 25 simultaneous positions at 2% each, you'd need ALL to hit stop simultaneously to lose 50%. Statistically impossible for uncorrelated positions. After 10 consecutive losses at 2% risk: account is at ~82% of original value — recoverable. The same with 10% risk: account drops to ~35%.",
    hint: "Small risk per trade = many more chances for the strategy to prove itself",
  },
];

// Technical Patterns flashcards
const technicalPatternsCards: FlashcardItem[] = [
  {
    id: "pattern-head-shoulders",
    category: "tech-patterns",
    front: "Head & Shoulders\nHow do you identify and trade this pattern?",
    back: "Bearish reversal pattern: left shoulder (peak), head (higher peak), right shoulder (lower peak), with a 'neckline' connecting the two troughs. Confirmation: price breaks below the neckline on volume. Target: project the head-to-neckline distance downward from the breakout. Inverse H&S is the bullish equivalent. Failure rate increases if volume doesn't expand on the breakout.",
    hint: "Most reliable reversal pattern in technical analysis",
  },
  {
    id: "pattern-cup-handle",
    category: "tech-patterns",
    front: "Cup & Handle\nWhat does William O'Neil's research show about it?",
    back: "Bullish continuation pattern: a rounded U-shaped cup (7–65 weeks) followed by a smaller downward drift (handle, 1–2 weeks). Buy on breakout above the handle's resistance with expanding volume. Target: add the cup depth to the breakout point. O'Neil found it in many of the biggest stock winners (CANSLIM stocks) before their major runs. Best in strong uptrends.",
    hint: "Popularized by William O'Neil — look for tight, high-handle consolidations",
  },
  {
    id: "pattern-double-top",
    category: "tech-patterns",
    front: "Double Top\nWhat distinguishes it from a regular pullback?",
    back: "Bearish reversal: two peaks at roughly the same price level, with a trough in between (the 'valley'). Confirmed when price closes below the valley support on volume. Target: project the valley-to-peaks distance downward. The second peak should ideally be on lower volume than the first. The stronger the resistance zone holding, the more reliable the pattern. Mirror: Double Bottom is bullish.",
    hint: "Pattern fails if price closes above the second peak — don't fight the tape",
  },
  {
    id: "pattern-double-bottom",
    category: "tech-patterns",
    front: "Double Bottom\nHow do you distinguish a true reversal from a bear trap?",
    back: "Bullish reversal: two troughs at approximately the same price, separated by a rally. Confirmation requires a close above the intermediate high ('neckline') with above-average volume. The second bottom can be slightly lower (W-pattern). Divergence in RSI or MACD at the second bottom strengthens the signal. Failed double bottoms are common — always wait for confirmation.",
    hint: "Wait for the neckline breakout with volume — don't buy the second trough anticipation",
  },
  {
    id: "pattern-ascending-triangle",
    category: "tech-patterns",
    front: "Ascending Triangle\nWhy is it considered a bullish continuation pattern?",
    back: "Horizontal resistance (flat top) + rising trendline support (higher lows). Bulls repeatedly test the same resistance while sellers get weaker (higher lows). Breakout: close above horizontal resistance on volume — typically explosive. Target: add triangle height to the breakout point. Can appear as a reversal at market bottoms. Failure (break below rising support) turns it bearish.",
    hint: "Rising lows = buyers getting more aggressive; flat top = imminent breakout",
  },
  {
    id: "pattern-descending-triangle",
    category: "tech-patterns",
    front: "Descending Triangle\nWhat market psychology creates this pattern?",
    back: "Horizontal support (flat bottom) + declining resistance (lower highs). Bears repeatedly test the same support while buyers get weaker (lower highs). Breakdown: close below horizontal support often leads to sharp decline. Target: subtract triangle height from the breakdown point. Opposite of ascending triangle. In a strong downtrend it's a powerful continuation signal.",
    hint: "Lower highs = sellers getting more aggressive; flat bottom = danger zone",
  },
  {
    id: "pattern-symmetrical-triangle",
    category: "tech-patterns",
    front: "Symmetrical Triangle\nHow do you determine the direction of breakout?",
    back: "Converging trendlines: series of lower highs AND higher lows. Represents indecision and compression of volatility. Breakout can occur in either direction — generally in the direction of the prior trend (continuation). Volume contracts during formation, expands on breakout. False breakouts are common; wait for a daily close outside. Measured target = base of triangle projected from breakout.",
    hint: "Breakout direction usually aligns with the prior trend",
  },
  {
    id: "pattern-bull-flag",
    category: "tech-patterns",
    front: "Bull Flag\nWhat are the two key phases?",
    back: "Two parts: (1) Flagpole — sharp, nearly vertical price advance on heavy volume; (2) Flag — orderly, parallel downward or sideways consolidation on declining volume (looks like a flag on a pole). Buy on breakout above the flag's upper channel. Target = flagpole length added to breakout point. Best when consolidation is tight (under 15%) and short (1–3 weeks). Bear flag is the mirror image.",
    hint: "Volume dries up in the flag — lack of sellers confirms bullish sentiment",
  },
  {
    id: "pattern-wedge",
    category: "tech-patterns",
    front: "Rising Wedge vs Falling Wedge\nWhich is bullish?",
    back: "Rising Wedge: both support and resistance lines slope upward but converge — BEARISH. Price rises with decreasing momentum; often breaks down sharply. Falling Wedge: both lines slope downward and converge — BULLISH. Price falls but sellers losing steam; breakout is upward. Key tell: volume contracts during the wedge, then expands on the breakout in the expected direction. Common reversal signal at trend extremes.",
    hint: "Rising wedge = bearish trap; falling wedge = bullish reversal",
  },
  {
    id: "pattern-vwap",
    category: "tech-patterns",
    front: "VWAP\nHow do institutional traders use it as support/resistance?",
    back: "Volume-Weighted Average Price = Σ(Price × Volume) / ΣVolume. Resets daily. Institutions benchmark execution to VWAP — buying below it is considered 'good.' If price is above VWAP, institutions may let it drift down before adding. If price breaks below and reclaims VWAP — strong signal. Used heavily for intraday S/R levels. Extended VWAP bands (+1/-1 standard deviation) act as dynamic Bollinger-like levels.",
    hint: "Large funds try to execute near VWAP — creates magnetic price behavior",
  },
];

// Macro Economics flashcards
const macroCards: FlashcardItem[] = [
  {
    id: "macro-fed-funds",
    category: "macro",
    front: "Federal Funds Rate\nHow does it ripple through the entire economy?",
    back: "The overnight rate banks charge each other for lending reserves. Set by the FOMC (8 meetings per year). Mechanism: Fed Funds Rate → Prime Rate → mortgage/auto/credit card rates → cost of capital for businesses → investment, hiring, consumer spending → inflation and employment. Raising rates slows economy to fight inflation; cutting rates stimulates growth. Affects all asset classes.",
    hint: "The Fed Funds Rate is the price of money — everything else is priced off it",
  },
  {
    id: "macro-qe",
    category: "macro",
    front: "Quantitative Easing (QE)\nHow does it differ from traditional monetary policy?",
    back: "When short-term rates hit zero (zero lower bound), the Fed buys longer-dated Treasuries and MBS directly — expanding its balance sheet. Pushes long-term rates down, forces investors into riskier assets (portfolio rebalancing channel), weakens the dollar (export boost), creates a wealth effect. QE does not print physical money — it creates bank reserves. Reverse (QT = Quantitative Tightening) shrinks the balance sheet.",
    hint: "QE = unconventional policy when interest rates can't go lower",
  },
  {
    id: "macro-yield-curve",
    category: "macro",
    front: "Yield Curve Inversion\nWhy has it predicted every US recession since 1970?",
    back: "Normal yield curve: long-term rates > short-term rates (compensates for time risk). Inverted (2-year > 10-year): bond market says near-term growth is better than long-term — signals recession fear. Mechanism: short rates rise (Fed tightening) faster than long rates (growth expectations falling). The 2/10 spread is most watched. Average lag from inversion to recession: 12–18 months. Not a perfect predictor but historically reliable.",
    hint: "Inverted 2s/10s = bond market predicting a recession 12-18 months ahead",
  },
  {
    id: "macro-cpi",
    category: "macro",
    front: "CPI vs PCE\nWhy does the Fed prefer PCE for inflation targeting?",
    back: "CPI (Consumer Price Index): fixed basket of ~211 categories, weights unchanged frequently, measured by BLS. PCE (Personal Consumption Expenditures): adjusts for substitution (consumers switch to cheaper goods), broader coverage, includes healthcare spending. Fed's 2% target is PCE. PCE is typically 0.2–0.5% lower than CPI. Core CPI (ex-food/energy) is the most market-moving monthly data release.",
    hint: "Fed targets PCE; markets react most to Core CPI month-over-month change",
  },
  {
    id: "macro-inflation-types",
    category: "macro",
    front: "Demand-Pull vs Cost-Push Inflation\nHow do policy responses differ?",
    back: "Demand-Pull: too much money chasing too few goods (economy overheating). Fix: raise rates to cool demand. Cost-Push: supply disruptions drive prices up (oil shocks, supply chain). Rate hikes make this worse — they can't fix supply problems. Stagflation (high inflation + low growth) is the hardest scenario: Fed faces dilemma of fighting inflation or preventing recession. 1970s stagflation was cost-push driven.",
    hint: "Demand-pull → raise rates. Cost-push → rate hikes may cause stagflation.",
  },
  {
    id: "macro-dot-plot",
    category: "macro",
    front: "Fed Dot Plot\nWhat information does it convey to markets?",
    back: "Released quarterly by the FOMC, the dot plot shows each of the 18 Fed officials' anonymous projections for the fed funds rate at year-end for the next 3 years plus longer-run. Markets focus on the median dot. When dots shift hawkishly (higher expected rates), it strengthens the dollar and pressures equities and bonds. The dot plot often diverges significantly from actual outcomes — economists call it the 'most important useless forecast.'",
    hint: "Dot plot shifts move markets — watch for median dot moving vs prior meeting",
  },
  {
    id: "macro-recession-indicators",
    category: "macro",
    front: "Sahm Rule\nHow does it define the start of a recession in real time?",
    back: "Sahm Rule: when the 3-month average unemployment rate rises 0.50 percentage points above its 12-month low, a recession has begun. Created by economist Claudia Sahm for triggering automatic fiscal stimulus. Advantage: uses real-time data (no waiting for GDP revisions). Historical accuracy: triggered at the start of every US recession since 1970. The 'Sahm number' tracks monthly alongside the yield curve.",
    hint: "Sahm Rule gives a real-time recession signal using unemployment data",
  },
  {
    id: "macro-m2",
    category: "macro",
    front: "M2 Money Supply\nWhy did its collapse in 2022–23 signal disinflation?",
    back: "M2 = cash + checking + savings + money market funds + small time deposits. When M2 grows faster than GDP, excess money eventually bids up prices (Quantity Theory: MV = PQ). M2 surged 40% in 2020–21 (COVID stimulus), fueling inflation. M2 then contracted in 2022–23 — the first YoY decline since 1948. Leading indicator of slowing inflation 12–18 months ahead. Monetarist economists track M2 growth closely.",
    hint: "M2 growth leads inflation by roughly 12-18 months",
  },
  {
    id: "macro-pmi",
    category: "macro",
    front: "PMI (Purchasing Managers Index)\nWhat does the 50 threshold mean?",
    back: "PMI surveys purchasing managers on business conditions: new orders, employment, production, supplier deliveries, inventories. Above 50 = expansion; below 50 = contraction. Two variants: Manufacturing PMI (more cyclical) and Services PMI (larger share of GDP). ISM PMI (US) and S&P Global PMI released monthly. Leading economic indicator — PMI often turns before GDP because managers see order books early.",
    hint: "PMI above 50 = expansion, below 50 = contraction; leading indicator for GDP",
  },
  {
    id: "macro-carry-trade",
    category: "macro",
    front: "Carry Trade\nWhy can an unwind cause market-wide volatility?",
    back: "Borrow in low-interest currency (historically JPY at ~0%), invest in high-yield currency or asset. Profit = interest rate differential minus currency move. Carry trades work until they don't: when the funding currency strengthens or target assets fall, traders must unwind simultaneously — causing a rush to cover, amplifying moves (the 'carry unwind'). August 2024 JPY unwind caused S&P 500 to drop 3% in a day.",
    hint: "Carry trades are like picking up nickels in front of a steamroller",
  },
];

// Crypto / DeFi flashcards
const cryptoCards: FlashcardItem[] = [
  {
    id: "crypto-defi",
    category: "crypto",
    front: "DeFi (Decentralized Finance)\nWhat problems does it solve compared to traditional finance?",
    back: "Financial services (lending, trading, yield) built on public blockchains using smart contracts — no banks or intermediaries. Benefits: permissionless (anyone globally), transparent (code is public), composable ('money legos' — protocols stack on each other), non-custodial (you hold your keys). Risks: smart contract bugs, oracle manipulation, liquidation cascades, regulatory uncertainty. Total Value Locked (TVL) is the key metric.",
    hint: "DeFi = financial services powered by code, not institutions",
  },
  {
    id: "crypto-amm",
    category: "crypto",
    front: "AMM (Automated Market Maker)\nHow does the constant-product formula work?",
    back: "AMMs replace order books with liquidity pools governed by a formula. Uniswap v2 uses x·y = k (constant product). If ETH pool has 100 ETH and 300,000 USDC, k = 30,000,000. To buy 1 ETH: new y must satisfy 99·y_new = 30,000,000 → y_new = 303,030, so you pay ~3,030 USDC. Price impact grows with trade size. The 'price' at any moment = y/x (ratio of reserves).",
    hint: "x × y = k: the formula powering Uniswap, Curve, and most DEXs",
  },
  {
    id: "crypto-liquidity-pool",
    category: "crypto",
    front: "Liquidity Pool\nWhat do LPs earn and what risks do they take?",
    back: "LPs deposit equal value of two tokens into a pool and receive LP tokens representing their share. They earn trading fees (0.05–1% per swap) proportional to their pool share. Risks: (1) Impermanent loss when prices diverge; (2) Smart contract exploit risk; (3) Pool going illiquid. Total return = fees earned − impermanent loss. Fee-rich pools (like stablecoin pools) have minimal IL. High-volatility pools can result in net losses.",
    hint: "LP tokens = proof of deposit; fees earned 24/7 from every swap",
  },
  {
    id: "crypto-impermanent-loss",
    category: "crypto",
    front: "Impermanent Loss\nIf ETH doubles in price, what is the loss vs just holding?",
    back: "IL is the loss LPs experience compared to simply holding the tokens. Formula: IL = 2·√r/(1+r) − 1, where r = price ratio change. If ETH doubles (r=2): IL = 2·√2/3 − 1 ≈ −5.7%. So LP has 5.7% less value than if they'd just held. IL 'becomes permanent' when you withdraw. It's called impermanent because if price reverts, it disappears. Concentrated liquidity (Uniswap v3) amplifies both fees and IL.",
    hint: "Price divergence = IL; price reversion = IL disappears",
  },
  {
    id: "crypto-staking",
    category: "crypto",
    front: "Staking\nHow does Proof of Stake differ from Proof of Work?",
    back: "Staking: locking cryptocurrency to validate transactions and secure a PoS blockchain. Validators are chosen proportional to stake (vs PoW where miners compete with compute). Rewards: 3–20% APY depending on network. Risks: slashing (validators lose stake for misbehavior), lockup periods, price risk during lockup. ETH staking requires 32 ETH (or liquid staking via Lido). PoS uses ~99.95% less energy than PoW.",
    hint: "Staking = earn yield by securing the network instead of mining",
  },
  {
    id: "crypto-yield-farming",
    category: "crypto",
    front: "Yield Farming\nHow does it generate returns and what are the risks?",
    back: "Deploying crypto assets across DeFi protocols to maximize returns: provide liquidity → earn fees + governance tokens → stake LP tokens for more rewards. APYs of 10–1000%+ exist but are often unsustainable (token inflation). Key risks: smart contract exploits, rug pulls (team abandons project), token hyperinflation, gas fees eating profits, liquidation risk in leveraged strategies. 'The higher the APY, the faster it goes to zero.'",
    hint: "High APY = high risk; always check token emissions schedule",
  },
  {
    id: "crypto-gas",
    category: "crypto",
    front: "Gas Fees\nHow does Ethereum's EIP-1559 change fee structure?",
    back: "Gas = computational effort for Ethereum transactions, priced in gwei (1 gwei = 10^-9 ETH). EIP-1559 (August 2021): split into Base Fee (burned, reduces ETH supply — deflationary) + Priority Tip (goes to validator). Base fee auto-adjusts to target 50% block fullness. Users can set max fee. During congestion, base fee spikes exponentially. L2 chains (Arbitrum, Optimism) reduce gas by ~100x via rollup technology.",
    hint: "EIP-1559 burns base fee → ETH is deflationary when gas is high",
  },
  {
    id: "crypto-oracle",
    category: "crypto",
    front: "Oracle Problem\nWhy is it a critical vulnerability in DeFi?",
    back: "Blockchains can't access off-chain data natively. Oracles bridge on-chain and off-chain data (prices, weather, sports results). If an oracle is manipulated, it can compromise every protocol using it. Flash loan attacks exploit thin DEX liquidity to manipulate spot prices used as oracles — then drain lending protocols in one transaction. Chainlink uses decentralized oracle networks; Uniswap v3 uses TWAPs as more manipulation-resistant alternatives.",
    hint: "Oracle = blockchain's window to the real world; a single point of failure",
  },
  {
    id: "crypto-on-chain",
    category: "crypto",
    front: "On-Chain Analysis\nWhat metrics do traders track to gauge market health?",
    back: "Key on-chain metrics: (1) NUPL (Net Unrealized Profit/Loss) — market-wide unrealized gain/loss; negative = capitulation, extreme positive = peak. (2) Exchange inflows — large BTC moving to exchanges signals selling intent. (3) Long-term holder supply — rising means conviction. (4) SOPR (Spent Output Profit Ratio) — <1 means sellers taking losses. (5) Funding rates — positive = longs paying shorts (overheated); negative = shorts dominant. Glassnode is the primary data source.",
    hint: "On-chain data reveals what holders are actually DOING vs just the price",
  },
  {
    id: "crypto-tokenomics",
    category: "crypto",
    front: "Tokenomics\nWhat makes a token economically sustainable?",
    back: "Token design determines long-term value: (1) Supply — fixed (Bitcoin: 21M) vs inflationary (most alt-L1s); (2) Distribution — VC allocations, team vesting schedules; (3) Utility — governance, fee payment, staking, gas; (4) Value accrual — does protocol revenue buy back/burn tokens? (5) Vesting — large cliff unlocks can crash price. Red flags: high fully diluted valuation vs market cap, large team/VC allocation, no real utility, emissions as the only yield.",
    hint: "Token = equity only if it captures value from the protocol's success",
  },
];

// Quant & advanced concept flashcards
const quantCards: FlashcardItem[] = [
  {
    id: "quant-sharpe",
    category: "quant",
    front: "Sharpe Ratio\nWhat does it measure?",
    back: "Risk-adjusted return. Formula: (Portfolio Return - Risk-Free Rate) / Portfolio Volatility. Higher is better. Above 1.0 is good, above 2.0 is excellent. Named after Nobel laureate William Sharpe.",
    hint: "Measures return per unit of risk",
  },
  {
    id: "quant-sortino",
    category: "quant",
    front: "Sortino Ratio\nHow does it differ from Sharpe?",
    back: "Like Sharpe but only penalizes downside volatility, not upside. Uses downside deviation instead of total standard deviation. Better for strategies with positive skew where upside volatility is desirable.",
  },
  {
    id: "quant-var",
    category: "quant",
    front: "Value at Risk (VaR)\nWhat does 95% VaR of $5,000 mean?",
    back: "There is a 95% probability that your portfolio will not lose more than $5,000 in one day (or specified period). The remaining 5% of the time, losses could exceed this. Parametric VaR assumes normal distribution: VaR = μ - 1.645σ.",
  },
  {
    id: "quant-kelly",
    category: "quant",
    front: "Kelly Criterion\nHow do you calculate optimal bet size?",
    back: "f* = (p*b - q) / b where p = win probability, q = 1-p, b = payoff ratio (avg win / avg loss). Tells you the fraction of bankroll to risk per trade for maximum geometric growth. Most practitioners use half-Kelly for safety.",
  },
  {
    id: "quant-max-dd",
    category: "quant",
    front: "Maximum Drawdown\nWhy is it important?",
    back: "The largest peak-to-trough decline in portfolio value. A 50% drawdown requires a 100% gain to recover. It measures worst-case scenario risk and is often more psychologically important than volatility.",
  },
  {
    id: "quant-beta",
    category: "quant",
    front: "Beta\nWhat does a beta of 1.5 mean?",
    back: "The stock moves 1.5x the market. If S&P 500 rises 10%, the stock is expected to rise 15%. Beta = Cov(stock, market) / Var(market). Beta < 1 = defensive, Beta > 1 = aggressive, Beta < 0 = inverse relationship.",
  },
  {
    id: "quant-alpha",
    category: "quant",
    front: "Jensen's Alpha\nWhat does positive alpha indicate?",
    back: "Excess return above what CAPM predicts for the given risk level. Alpha = Rp - [Rf + β(Rm - Rf)]. Positive alpha means outperformance; the holy grail of active management. Most funds have negative alpha after fees.",
  },
  {
    id: "quant-efficient-frontier",
    category: "quant",
    front: "Efficient Frontier\nWhat is it?",
    back: "The set of portfolios offering the highest expected return for each level of risk. Developed by Harry Markowitz (1952 Nobel Prize). Portfolios below the frontier are suboptimal — you can get more return for the same risk by diversifying.",
  },
  {
    id: "quant-monte-carlo",
    category: "quant",
    front: "Monte Carlo Simulation\nHow is it used in finance?",
    back: "Run thousands of random simulations using historical return/volatility parameters to estimate probability distributions of future outcomes. Uses geometric Brownian motion: S(t+dt) = S(t) * exp((μ-σ²/2)dt + σ√dt·Z). Shows range of possible outcomes, not just a single forecast.",
  },
  {
    id: "quant-profit-factor",
    category: "quant",
    front: "Profit Factor\nWhat does a profit factor of 2.0 mean?",
    back: "Gross profits are 2x gross losses. Formula: Total Winning $ / Total Losing $. Above 1.0 is profitable, above 1.5 is good, above 2.0 is excellent. Unlike win rate, it accounts for the SIZE of wins vs losses.",
  },
  {
    id: "prediction-brier",
    category: "predictions",
    front: "Brier Score\nWhat does it measure?",
    back: "Calibration quality of probabilistic predictions. Formula: mean of (forecast - outcome)² across all predictions. Range 0-1, lower is better. A score of 0 = perfect calibration, 0.25 = random guessing on binary events. Named after Glenn Brier (1950).",
  },
  {
    id: "prediction-calibration",
    category: "predictions",
    front: "Prediction Calibration\nWhat does it mean to be well-calibrated?",
    back: "When you say 70% probability, the event should happen about 70% of the time. Most people are overconfident — their 90% predictions come true only 70% of the time. Tracking your Brier Score helps improve calibration over time.",
  },
  {
    id: "prediction-base-rate",
    category: "predictions",
    front: "Base Rate\nWhy is it important for predictions?",
    back: "The historical frequency of an event occurring. Before making a prediction, always ask 'how often does this type of event happen?' Example: S&P 500 is positive ~73% of years. Ignoring base rates is one of the most common forecasting errors.",
  },
  {
    id: "quant-cvar",
    category: "quant",
    front: "Conditional VaR (CVaR / Expected Shortfall)\nHow does it differ from VaR?",
    back: "CVaR measures the expected loss GIVEN that you've exceeded VaR. If 95% VaR is $5K, CVaR answers: 'In the worst 5% of cases, what's the AVERAGE loss?' Always larger than VaR. Better tail risk measure because VaR ignores the severity of tail losses.",
  },
  {
    id: "quant-skewness",
    category: "quant",
    front: "Return Skewness\nWhat does negative skew mean for a portfolio?",
    back: "Negative skew means the left tail is fatter — large losses are more frequent than large gains. Most equity portfolios have negative skew. Options strategies can create positive skew. Excess kurtosis > 0 means fatter tails than normal distribution (leptokurtic).",
  },
  {
    id: "quant-information-ratio",
    category: "quant",
    front: "Information Ratio\nHow does it measure skill?",
    back: "Active return divided by tracking error: IR = (Rp - Rb) / σ(Rp - Rb). Measures consistency of outperformance vs a benchmark. IR > 0.5 is good, > 1.0 is exceptional. Unlike Sharpe, it specifically measures alpha-generation skill relative to a benchmark.",
  },
];

export const FLASHCARDS: FlashcardItem[] = [
  ...glossaryCards,
  ...indicatorCards,
  ...quantCards,
  ...greeksCards,
  ...riskMgmtCards,
  ...technicalPatternsCards,
  ...macroCards,
  ...cryptoCards,
];

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  basics: { label: "Basics", color: "text-blue-400" },
  orders: { label: "Orders", color: "text-green-400" },
  indicators: { label: "Indicators", color: "text-amber-400" },
  risk: { label: "Risk", color: "text-rose-400" },
  fundamental: { label: "Fundamental", color: "text-purple-400" },
  "personal-finance": { label: "Personal Finance", color: "text-yellow-400" },
  quant: { label: "Quantitative", color: "text-cyan-400" },
  predictions: { label: "Predictions", color: "text-orange-400" },
  "options-greeks": { label: "Options Greeks", color: "text-violet-400" },
  "risk-mgmt": { label: "Risk Management", color: "text-red-400" },
  "tech-patterns": { label: "Chart Patterns", color: "text-teal-400" },
  macro: { label: "Macro Economics", color: "text-sky-400" },
  crypto: { label: "Crypto / DeFi", color: "text-orange-400" },
};
