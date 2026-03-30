export interface BehavioralBias {
 name: string;
 category: "cognitive" | "emotional" | "social";
 severity: number;
 description: string;
 example: string;
 impact: string;
 mitigationTips: string[];
}

export const BEHAVIORAL_BIASES: BehavioralBias[] = [
 {
 name: "Loss Aversion",
 category: "emotional",
 severity: 5,
 description:
 "The tendency to feel losses roughly twice as strongly as equivalent gains. A $100 loss feels worse than a $100 gain feels good.",
 example:
 "You hold a losing stock for months hoping it will recover, but sell a winning stock after a small gain to lock in the profit.",
 impact:
 "Leads to holding losers too long and selling winners too early. Destroys the positive expectancy of a trading system by cutting winners short and letting losers run.",
 mitigationTips: [
 "Set stop-losses before entering a trade and honor them mechanically",
 "Focus on the quality of your decision process, not the outcome of individual trades",
 "Use position sizing so no single loss feels catastrophic",
 ],
 },
 {
 name: "Confirmation Bias",
 category: "cognitive",
 severity: 5,
 description:
 "Seeking out information that confirms your existing belief while ignoring or dismissing contradictory evidence.",
 example:
 "After buying a stock, you only read bullish analyst reports and dismiss bearish ones as wrong or outdated.",
 impact:
 "Creates false confidence in bad positions. You miss warning signs because you have filtered them out, leading to larger-than-necessary losses.",
 mitigationTips: [
 "Actively seek out the bear case for every long position and vice versa",
 "Keep a trading journal and record reasons why a trade could fail",
 "Assign a devil's advocate role: before every trade, write three reasons it could go wrong",
 ],
 },
 {
 name: "Anchoring Bias",
 category: "cognitive",
 severity: 4,
 description:
 "Over-relying on the first piece of information encountered (the anchor) when making decisions, even when that information is irrelevant.",
 example:
 "A stock that was once $200 now trades at $80. You think it is cheap because you are anchored to the $200 price, ignoring that fundamentals may have deteriorated.",
 impact:
 "Leads to buying falling stocks that continue to fall, setting inappropriate price targets, and failing to adapt to changing market conditions.",
 mitigationTips: [
 "Evaluate each stock based on current fundamentals, not historical prices",
 "Ask yourself: if I had no position and no history, would I buy this stock at this price today?",
 "Use relative valuation metrics rather than absolute price levels",
 ],
 },
 {
 name: "Overconfidence Bias",
 category: "cognitive",
 severity: 5,
 description:
 "Overestimating your own knowledge, abilities, and the precision of your predictions. Most traders believe they are above average.",
 example:
 "After three winning trades in a row, you increase your position size dramatically, convinced you have mastered the market.",
 impact:
 "Leads to excessive trading, taking oversized positions, under-diversification, and ignoring risk management rules. The single biggest account killer.",
 mitigationTips: [
 "Track your actual win rate and compare it to your perceived win rate",
 "Never increase position size after winning streaks; follow your system",
 "Remember that even the best fund managers are wrong 40-45% of the time",
 ],
 },
 {
 name: "Recency Bias",
 category: "cognitive",
 severity: 4,
 description:
 "Giving disproportionate weight to recent events while underweighting historical data and base rates.",
 example:
 "After a week of market declines, you panic-sell everything, forgetting that corrections are normal and markets have always recovered.",
 impact:
 "Causes buying at tops (recent gains make you bullish) and selling at bottoms (recent losses make you bearish). The opposite of what profitable traders do.",
 mitigationTips: [
 "Study market history and know the base rates for drawdowns and recoveries",
 "Make decisions based on your pre-defined trading plan, not recent price action",
 "Zoom out: look at weekly and monthly charts before reacting to daily moves",
 ],
 },
 {
 name: "Herd Mentality",
 category: "social",
 severity: 4,
 description:
 "Following the crowd rather than conducting independent analysis. Feels safe to do what everyone else is doing.",
 example:
 "You buy a meme stock because social media is euphoric about it, without analyzing the company's financials or valuation.",
 impact:
 "Causes buying at inflated prices during manias and panic-selling at lows during crashes. The crowd is often wrong at extremes.",
 mitigationTips: [
 "Develop and follow your own trading system before checking social media",
 "When everyone is euphoric, reduce exposure; when everyone is fearful, look for opportunities",
 "Measure crowd sentiment (put/call ratio, VIX, surveys) as a contrarian indicator",
 ],
 },
 {
 name: "Disposition Effect",
 category: "emotional",
 severity: 5,
 description:
 "The tendency to sell assets that have increased in value while keeping assets that have decreased in value.",
 example:
 "Your portfolio has one stock up 30% and one down 25%. You sell the winner to feel good about the gain, but hold the loser hoping it recovers.",
 impact:
 "Systematically sells winners and holds losers, the exact opposite of trend-following profitability. Tax-inefficient as well, realizing gains while deferring losses.",
 mitigationTips: [
 "Use trailing stops to let winners run instead of arbitrary profit targets",
 "Consider tax-loss harvesting: selling losers is often the better tax move",
 "Judge each position on its forward outlook, not your entry price",
 ],
 },
 {
 name: "Sunk Cost Fallacy",
 category: "cognitive",
 severity: 4,
 description:
 "Continuing to invest in a losing position because of the time, money, or effort already committed, rather than cutting losses.",
 example:
 "You have spent weeks researching a stock and it is down 40%. You buy more because you cannot waste all that research, even though the thesis is broken.",
 impact:
 "Leads to averaging down into losers, increasing position size in losing trades, and refusing to exit bad positions. Turns small losses into account-threatening ones.",
 mitigationTips: [
 "Accept that past costs are irretrievable and irrelevant to future decisions",
 "Ask: knowing what I know now, would I enter this trade today at this price?",
 "Set a maximum loss threshold per trade and enforce it regardless of prior investment",
 ],
 },
 {
 name: "Fear of Missing Out (FOMO)",
 category: "emotional",
 severity: 4,
 description:
 "The anxiety that others are profiting from an opportunity you are missing, leading to impulsive entry at poor prices.",
 example:
 "A stock has rallied 50% in two weeks. You chase it and buy near the top because you cannot stand watching others profit without you.",
 impact:
 "Causes buying extended moves at poor risk/reward, abandoning your trading plan, and overtrading. Often leads to buying the top of a move.",
 mitigationTips: [
 "There will always be another trade; missing one opportunity is not a loss",
 "Only enter trades that meet your pre-defined setup criteria regardless of how far price has moved",
 "Keep a watchlist of missed trades and note how many would have actually been profitable",
 ],
 },
 {
 name: "Gambler's Fallacy",
 category: "cognitive",
 severity: 4,
 description:
 "The belief that past random events affect future probabilities. Thinking that after a streak of losses, a win is 'due,' or after several red days, a green day is more likely.",
 example:
 "After five consecutive losing trades, you double your position size on the sixth trade because you feel a winner is overdue.",
 impact:
 "Leads to irrational position sizing, martingale strategies (doubling down after losses), and a false sense that the market 'owes' you. Random streaks are longer than people expect.",
 mitigationTips: [
 "Each trade is independent; past results do not change future probabilities",
 "Never increase position size to 'make back' previous losses",
 "Study the mathematics of random sequences to calibrate your intuition",
 ],
 },
 {
 name: "Hindsight Bias",
 category: "cognitive",
 severity: 3,
 description:
 "After an event occurs, believing you 'knew it all along.' The tendency to see past events as having been predictable.",
 example:
 "After a stock crashes, you think 'I knew that was going to happen' even though you did not act on any bearish thesis before the crash.",
 impact:
 "Creates an illusion of predictive ability that leads to overconfidence. Prevents honest learning from mistakes because you rewrite history to make yourself look prescient.",
 mitigationTips: [
 "Record your predictions in writing before events occur so you can honestly assess your accuracy",
 "Review your trading journal regularly to see what you actually thought, not what you remember thinking",
 "Accept that the future is genuinely uncertain; being 'right' in hindsight does not mean you had true foresight",
 ],
 },
 {
 name: "Availability Heuristic",
 category: "cognitive",
 severity: 3,
 description:
 "Overweighting information that is easy to recall (vivid, recent, or emotionally charged) while underweighting less memorable but more relevant data.",
 example:
 "After reading about a spectacular short squeeze, you start looking for short squeezes everywhere, overestimating their frequency.",
 impact:
 "Distorts probability estimates. Vivid market crashes make you overly cautious, while dramatic success stories make you overly aggressive.",
 mitigationTips: [
 "Use base rate statistics rather than memorable anecdotes for probability estimates",
 "Keep a data-driven trading journal with objective metrics",
 "When a scenario feels likely, ask yourself whether you can recall a vivid example of it and if that is influencing your estimate",
 ],
 },
 {
 name: "Status Quo Bias",
 category: "cognitive",
 severity: 3,
 description:
 "A preference for the current state of affairs, leading to inaction even when changing would be beneficial. The default option feels safest.",
 example:
 "You hold the same portfolio allocation you set up years ago, even though your goals, income, and risk tolerance have changed significantly.",
 impact:
 "Prevents necessary portfolio rebalancing, delays cutting losing positions, and causes missed opportunities. Inaction is itself a decision with consequences.",
 mitigationTips: [
 "Schedule quarterly portfolio reviews with specific action items",
 "Reframe inaction as an active choice: choosing not to sell is the same as choosing to buy at the current price",
 "Automate rebalancing to remove the friction of making changes",
 ],
 },
 {
 name: "Endowment Effect",
 category: "emotional",
 severity: 3,
 description:
 "Valuing an asset more highly simply because you own it. You demand more to sell something than you would pay to buy it.",
 example:
 "You refuse to sell a stock at $50 even though you would not buy it at $50 if you did not already own it.",
 impact:
 "Prevents rational portfolio rebalancing and causes holding positions past their optimal exit point. Creates an emotional attachment to positions.",
 mitigationTips: [
 "Periodically review each position as if you had zero shares: would you buy it today?",
 "Set review dates to re-evaluate positions objectively",
 "Use systematic rebalancing rules rather than discretionary sell decisions",
 ],
 },
 {
 name: "Mental Accounting",
 category: "cognitive",
 severity: 3,
 description:
 "Treating money differently depending on its source or intended purpose, rather than viewing all money as fungible. Creating artificial mental 'buckets' for different funds.",
 example:
 "You take excessive risks with 'house money' (profits) but are extremely conservative with your 'real money' (deposits), even though both are equally yours.",
 impact:
 "Leads to inconsistent risk management, irrational allocation decisions, and ignoring the true total portfolio risk. A dollar of profit has the same value as a dollar of principal.",
 mitigationTips: [
 "Treat all capital in your account identically regardless of source",
 "View your portfolio as a single entity with a single risk budget",
 "Apply the same position sizing rules to all trades, whether funded by profits or deposits",
 ],
 },
 {
 name: "Narrative Fallacy",
 category: "cognitive",
 severity: 4,
 description:
 "The tendency to create compelling stories around random events, finding patterns and causal relationships where none exist. Humans are wired to prefer stories over statistics.",
 example:
 "A stock drops 5% and financial media immediately attributes it to a specific news item, when in reality it was normal random volatility.",
 impact:
 "Creates false explanations for market moves that lead to poor predictions. Traders build strategies based on stories rather than statistical evidence, leading to overconfidence in unreliable patterns.",
 mitigationTips: [
 "Demand quantitative evidence for any trading thesis, not just a compelling story",
 "Ask: would I believe this explanation if I had not seen the price move first?",
 "Study the base rate of false narratives in financial media to calibrate your skepticism",
 ],
 },
 {
 name: "Survivorship Bias",
 category: "cognitive",
 severity: 4,
 description:
 "Focusing on successful examples while overlooking failures that are no longer visible. The winners are celebrated while the losers disappear from view.",
 example:
 "You study the portfolios of famous billionaire investors and copy their strategies, not realizing that thousands of others used similar approaches and failed. You only see the survivors.",
 impact:
 "Overestimates the probability of success for any given strategy. Fund performance data, startup statistics, and trading strategies all suffer from survivorship bias. Backtest results are often inflated because delisted companies are excluded.",
 mitigationTips: [
 "Always ask: what happened to the ones who tried this and failed?",
 "When evaluating strategies, include delisted and failed companies in backtests",
 "Be skeptical of any strategy promoted primarily through success stories rather than complete data",
 ],
 },
 {
 name: "Home Bias",
 category: "social",
 severity: 3,
 description:
 "The tendency to invest disproportionately in domestic markets while underweighting international investments, even when global diversification would improve risk-adjusted returns.",
 example:
 "As a US investor, 95% of your portfolio is in US stocks, even though US companies represent only about 60% of global market capitalization.",
 impact:
 "Reduces diversification benefits, concentrates risk in a single country's economy, and misses opportunities in faster-growing international markets. Particularly costly during periods when domestic markets underperform.",
 mitigationTips: [
 "Allocate a meaningful portion (20-40%) to international stocks and bonds",
 "Use total-world funds as a starting point for neutral geographic allocation",
 "Review global valuation spreads: invest more where valuations are most attractive",
 ],
 },
 {
 name: "Dunning-Kruger Effect",
 category: "cognitive",
 severity: 5,
 description:
 "Beginners overestimate their competence because they lack the knowledge to recognize what they don't know. As expertise increases, confidence often temporarily drops before rising with genuine skill.",
 example:
 "A new trader has a few lucky wins and concludes that trading is easy, then sizes up aggressively and blows up their account during the first real drawdown.",
 impact:
 "The most dangerous phase for new traders. Overconfidence from early success leads to excessive risk-taking before learning risk management. Responsible for a large percentage of account blow-ups in the first year of trading.",
 mitigationTips: [
 "Paper trade or trade very small size for at least 6 months before committing real capital",
 "Assume that your first year of trading is tuition, not an income source",
 "Seek mentorship from experienced traders who can point out your blind spots",
 ],
 },
 {
 name: "Authority Bias",
 category: "social",
 severity: 3,
 description:
 "Giving excessive weight to the opinions of perceived authorities (famous investors, analysts, financial media personalities) regardless of their actual track record or relevance.",
 example:
 "A famous hedge fund manager mentions a stock in an interview, and you buy it immediately without doing your own analysis, assuming they must know something you don't.",
 impact:
 "Outsources critical thinking to others who may have different time horizons, risk tolerances, and information. Celebrity investors often have positions they are talking their book on.",
 mitigationTips: [
 "Always conduct your own analysis before acting on anyone's recommendation",
 "Track the actual performance of 'expert' predictions over time; most are no better than chance",
 "Consider that famous investors may have different goals, time horizons, and portfolio sizes than you",
 ],
 },
];
