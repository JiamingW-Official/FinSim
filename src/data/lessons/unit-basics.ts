import type { Unit } from "./types";
import {
 PRACTICE_BASIC,
 PRACTICE_CANDLES,
 PRACTICE_VOLUME,
 PRACTICE_SUPPORT_RESISTANCE,
 PRACTICE_UPTREND,
 PRACTICE_UP_DOWN,
} from "./practice-data";

export const UNIT_BASICS: Unit = {
 id: "basics",
 title: "Trading Basics",
 description: "Learn the fundamentals of the stock market",
 icon: "GraduationCap",
 color: "#10b981",
 lessons: [
 {
 id: "basics-1",
 title: "What is a Stock?",
 description: "Understand ownership, shares, and why stocks move",
 icon: "Building2",
 xpReward: 50,
 steps: [
 {
 type: "teach",
 title: "Owning a Piece of the Pie",
 content:
 "A **stock** represents partial ownership in a company. When you buy shares of Apple (AAPL), you literally own a tiny fraction of the company — like owning one slice of a very expensive pizza.\n\nCompanies sell shares to raise money for growth. In return, shareholders benefit when the company's value increases. If Apple doubles in value, your shares do too.",
 visual: "portfolio-pie",
 highlight: ["stock", "shares", "ownership"],
 },
 {
 type: "teach",
 title: "Why Do Prices Move?",
 content:
 "Stock prices change based on **supply and demand** — just like an auction. If more people want to buy a stock, the price rises. If more people want to sell, the price falls.\n\nThink of concert tickets: when a massive tour is announced, demand spikes and prices skyrocket. Stocks behave the same way when demand outpaces supply.\n\nKey demand drivers: company earnings, news, economic conditions, and investor sentiment.",
 },
 {
 type: "quiz-tf",
 statement: "Buying a stock means you own a small part of the company.",
 correct: true,
 explanation:
 "Exactly right! Each share represents fractional ownership. If a company has 1 million shares and you own 100, you own 0.01% of the entire company — including a claim on its future profits.",
 },
 {
 type: "quiz-mc",
 question: "What primarily drives stock price changes?",
 options: [
 "Supply and demand from buyers and sellers",
 "The CEO's personal decisions alone",
 "The number of company employees",
 "The company's office location",
 ],
 correctIndex: 0,
 explanation:
 "Stock prices are a real-time auction driven by supply and demand. When more people want to buy than sell, prices rise. Company earnings, news, and sentiment all influence which way that balance tips.",
 },
 {
 type: "teach",
 title: "Key Terms Every Trader Knows",
 content:
 "**Ticker Symbol**: A short code for a stock (AAPL = Apple, TSLA = Tesla, MSFT = Microsoft).\n\n**Market Cap**: Total value of all shares outstanding. A $3 trillion market cap means investors collectively value the company at $3 trillion.\n\n**P/E Ratio**: Price divided by earnings per share. It tells you how much investors pay for each $1 of profit — a gauge of how 'expensive' a stock is relative to what it earns.",
 highlight: ["ticker", "market cap", "P/E ratio"],
 },
 {
 type: "practice",
 instruction: "Advance the chart forward to watch prices unfold in real time.",
 objective: "Step through the price bars using the controls below",
 actionType: "navigate",
 challenge: {
 priceData: PRACTICE_BASIC.bars,
 initialReveal: PRACTICE_BASIC.initialReveal,
 objectives: [{ kind: "advance-time", bars: 5 }],
 hint: "Use the step-forward button or press Play to advance bars.",
 },
 },
 ],
 },
 {
 id: "basics-2",
 title: "Reading Candlesticks",
 description: "Decode the visual language of price charts",
 icon: "CandlestickChart",
 xpReward: 60,
 steps: [
 {
 type: "teach",
 title: "Anatomy of a Candlestick",
 content:
 "Each candlestick packs 4 data points into one visual snapshot:\n\n• **Open**: The price when the period started\n• **Close**: The price when the period ended\n• **High**: The highest price reached (tip of upper wick)\n• **Low**: The lowest price reached (tip of lower wick)\n\nThe **body** (thick rectangle) shows the open-to-close range. The **wicks** (thin lines) show how far price stretched beyond that range.",
 visual: "candlestick",
 highlight: ["open", "close", "high", "low", "body", "wick"],
 },
 {
 type: "teach",
 title: "Green vs Red — The Color Code",
 content:
 "**Green candle**: Close > Open — price went UP. Bottom of the body is the open, top is the close.\n\n**Red candle**: Close < Open — price went DOWN. Top of the body is the open, bottom is the close.\n\nBody size reveals conviction:\n\n• **Long body** = strong directional move (one side dominated)\n• **Short body** = indecision (neither buyers nor sellers won)\n• **Long wick** = that price level was tested and rejected hard",
 },
 {
 type: "quiz-mc",
 question: "In a green candlestick, where is the opening price located?",
 options: [
 "Bottom of the body",
 "Top of the body",
 "Top of the upper wick",
 "Bottom of the lower wick",
 ],
 correctIndex: 0,
 explanation:
 "In a green (bullish) candle, price moved up — so the open is at the bottom and the close is at the top of the body. Green = close higher than open. Simple rule, powerful insight.",
 },
 {
 type: "quiz-tf",
 statement:
 "A candlestick with a very long upper wick and small body suggests the price was rejected at higher levels.",
 correct: true,
 explanation:
 "A long upper wick tells the story: buyers pushed the price up, but sellers stepped in hard and drove it back down. That 'rejection' at higher prices signals the bulls couldn't hold their gains.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "You see a candlestick with a tiny body near the bottom and a very long upper wick. The candle is red.",
 question: "What does this pattern most likely suggest?",
 options: [
 "Strong buying pressure initially, but sellers overwhelmed buyers by the close",
 "The stock is about to do a stock split",
 "Trading volume was very low during this period",
 "The market closed early that day",
 ],
 correctIndex: 0,
 explanation:
 "This is the classic 'Shooting Star' — a well-known bearish reversal pattern. Buyers tried hard to push price up (long wick), but sellers crushed the rally and closed near the open. It signals potential weakness ahead.",
 },
 {
 type: "practice",
 instruction:
 "Watch the candlestick chart unfold. Notice how green and red candles form with each advancing bar.",
 objective:
 "Advance time to see candlesticks appear — green means price went up, red means down",
 actionType: "observe",
 challenge: {
 priceData: PRACTICE_CANDLES.bars,
 initialReveal: PRACTICE_CANDLES.initialReveal,
 objectives: [{ kind: "advance-time", bars: 8 }],
 hint: "Watch how the body color changes based on whether the close is higher or lower than the open.",
 },
 },
 ],
 },
 {
 id: "basics-3",
 title: "Price & Volume",
 description: "Learn how trading volume confirms price moves",
 icon: "BarChart3",
 xpReward: 50,
 steps: [
 {
 type: "teach",
 title: "What is Volume?",
 content:
 "**Volume** is the total number of shares traded during a period. The bars at the bottom of the chart are your volume indicator — taller bars mean more shares changed hands.\n\nVolume reveals the **conviction** behind any price move:\n\n• High volume + price up = real buying conviction (bulls in control)\n• High volume + price down = real selling conviction (bears in control)\n• Low volume + price move = weak participation — the move may fade quickly",
 visual: "indicator-chart",
 highlight: ["volume", "conviction"],
 },
 {
 type: "quiz-mc",
 question: "A stock price jumps 5% on very low volume. What does this suggest?",
 options: [
 "The move may lack conviction and could easily reverse",
 "The stock will definitely keep going up",
 "Volume has no relationship with price moves",
 "The stock will be halted for volatility",
 ],
 correctIndex: 0,
 explanation:
 "Low volume means few participants drove the move. Without broad participation, the price is fragile. Think of it as 10 people cheering vs. 10,000 — one crowd is far more convincing than the other.",
 },
 {
 type: "quiz-tf",
 statement: "High trading volume always means the stock price is going up.",
 correct: false,
 explanation:
 "High volume simply means lots of trading activity — it can accompany moves in either direction! Strong volume on a down day signals aggressive selling. The direction of the candle tells you who's winning.",
 },
 {
 type: "teach",
 title: "Volume Patterns to Watch For",
 content:
 "**Breakout volume**: When price clears resistance on unusually high volume, the breakout is more likely to hold. Low-volume breakouts frequently fail and reverse.\n\n**Climax volume**: An extreme volume spike after a prolonged trend often signals exhaustion — the last wave of buyers (or sellers) is piling in emotionally. Reversal risk is high.\n\n**Average volume** varies widely: Apple (AAPL) trades ~60M shares/day, while a small-cap might trade 200K.",
 },
 {
 type: "practice",
 instruction:
 "Advance the chart and watch the volume bars at the bottom while observing price movement.",
 objective: "Advance bars and notice how volume relates to each price move",
 actionType: "observe",
 challenge: {
 priceData: PRACTICE_VOLUME.bars,
 initialReveal: PRACTICE_VOLUME.initialReveal,
 objectives: [{ kind: "advance-time", bars: 8 }],
 hint: "Look for tall volume bars — do they coincide with the larger price candles?",
 },
 },
 ],
 },
 {
 id: "basics-sr",
 title: "Support & Resistance",
 description: "Identify key price levels where markets reverse",
 icon: "Minus",
 xpReward: 60,
 steps: [
 {
 type: "teach",
 title: "Price Has Memory",
 content:
 "**Support** is a price level where buying pressure tends to stop a decline — like a floor beneath the stock.\n\n**Resistance** is a price level where selling pressure tends to stop an advance — like a ceiling the stock can't break through.\n\nThese levels form because traders remember the past. If a stock bounced off $100 three times, thousands of traders will buy again near $100, making it a self-fulfilling prophecy. The market has memory.",
 visual: "candlestick",
 highlight: ["support", "resistance", "price level"],
 },
 {
 type: "teach",
 title: "Why S/R Levels Form Where They Do",
 content:
 "Support and resistance cluster around predictable zones:\n\n• **Round numbers**: $50, $100, $200, $500 — psychological anchors where humans naturally cluster orders\n• **Prior highs and lows**: Previous turning points act like magnets for future price action\n• **High-volume areas**: Where millions of shares traded hands create lasting memory in the market\n\n**Role reversal** is powerful: when a support level breaks, it often becomes resistance — and vice versa. Old floors become new ceilings.",
 highlight: ["round numbers", "role reversal", "breakout"],
 },
 {
 type: "quiz-tf",
 statement: "Support acts like a floor that prevents prices from falling further.",
 correct: true,
 explanation:
 "Exactly. Support is where demand (buyers) steps in with enough force to halt a decline. Traders place buy orders near these levels, creating the 'floor' effect. The more times a level holds, the more significant it becomes.",
 },
 {
 type: "quiz-mc",
 question: "What typically happens when a key support level breaks?",
 options: [
 "It often flips and becomes a new resistance level (role reversal)",
 "It immediately becomes even stronger support",
 "Support levels are random — nothing predictable happens",
 "The stock always recovers to the old support within a day",
 ],
 correctIndex: 0,
 explanation:
 "Role reversal is real and widely used. Traders who bought at the old support are now underwater. When price recovers to their break-even, they sell — turning the old support into new resistance. It's human psychology at scale.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "A stock has bounced off the $98 level three times in the past month. It's now at $99 and keeps failing to break above $104 (tested twice).",
 question: "What behavior does this setup most likely lead to?",
 options: [
 "The stock ranges between $98 support and $104 resistance until one side breaks",
 "The stock will break above $104 on the very next attempt",
 "Support and resistance levels don't apply to this stock",
 "The stock will crash below $90 soon",
 ],
 correctIndex: 0,
 explanation:
 "A well-defined range with tested support ($98 × 3) and resistance ($104 × 2) creates a tradeable range. Traders play bounces at support and fades at resistance until a breakout occurs with volume conviction. Patience is the edge.",
 },
 {
 type: "practice",
 instruction:
 "Advance the chart and observe how price bounces between the same levels repeatedly.",
 objective: "Watch price interact with support and resistance",
 actionType: "observe",
 challenge: {
 priceData: PRACTICE_SUPPORT_RESISTANCE.bars,
 initialReveal: PRACTICE_SUPPORT_RESISTANCE.initialReveal,
 objectives: [{ kind: "advance-time", bars: 10 }],
 hint: "Notice how price approaches the same price zones again and again — that's S/R in action.",
 },
 },
 ],
 },
 {
 id: "basics-4",
 title: "Your First Trade",
 description: "Place your very first buy and sell orders",
 icon: "Zap",
 xpReward: 75,
 steps: [
 {
 type: "teach",
 title: "How Trading Actually Works",
 content:
 "In the simulator, you start with **$100,000** in virtual cash. Think of it as a flight simulator for traders — real market mechanics, zero real risk.\n\nTo place a trade:\n\n• Select a stock from the Watchlist\n• Choose your order type (Market or Limit)\n• Enter your quantity (number of shares)\n• Hit Buy or Sell\n\nA **Market order** executes immediately at the current price. A **Limit order** only executes at your specified price or better — more control, but no guarantee of execution.",
 visual: "order-flow",
 },
 {
 type: "teach",
 title: "Going Long: Betting on Growth",
 content:
 "When you **buy** (go long), you profit when price goes UP.\n\n**Example**: Buy 10 shares at $150 = $1,500 invested\n\n• Price rises to $160 profit = 10 × $10 = **+$100** \n• Price falls to $140 loss = 10 × $10 = **$100** \n\nYour **P&L** (Profit & Loss) updates live in the Positions tab as new bars appear. Watch it move — this is how it feels to have real skin in the game.",
 },
 {
 type: "quiz-mc",
 question: "You buy 50 shares at $100. The price rises to $105. What is your profit?",
 options: ["$250", "$500", "$200", "$5"],
 correctIndex: 0,
 explanation:
 "Profit = Quantity × (Current Price Buy Price) = 50 × ($105 $100) = 50 × $5 = $250. Always calculate both the dollar P&L and the percentage return — they tell different parts of the story.",
 },
 {
 type: "practice",
 instruction:
 "Try placing a buy order — select a quantity and click Buy. Watch your position appear instantly.",
 objective: "Place a buy order for at least 1 share",
 actionType: "buy",
 challenge: {
 priceData: PRACTICE_UPTREND.bars,
 initialReveal: PRACTICE_UPTREND.initialReveal,
 objectives: [{ kind: "buy", minQuantity: 1 }],
 hint: "Select a quantity (try 5 or 10 shares) and click the Buy button.",
 startingCash: 10000,
 },
 },
 {
 type: "teach",
 title: "Selling: Closing Your Position",
 content:
 "To take profit or cut a loss, **sell** your shares from the Positions tab.\n\nYou can also **sell short**: borrow shares, sell them, then buy back at a (hopefully) lower price. Shorting lets you profit when prices fall — the same game, just in reverse.\n\nThe hardest lesson in trading: **cut losers fast, let winners run.** Most beginners do the opposite — they hold losers hoping they'll recover, and sell winners too early out of fear. Discipline beats intelligence here.",
 },
 {
 type: "practice",
 instruction:
 "Complete a full trade cycle: buy shares, advance the chart, then sell to close the position.",
 objective: "Complete a full buy-then-sell cycle",
 actionType: "buy",
 challenge: {
 priceData: PRACTICE_UP_DOWN.bars,
 initialReveal: PRACTICE_UP_DOWN.initialReveal,
 objectives: [
 { kind: "buy", minQuantity: 1 },
 { kind: "sell", minQuantity: 1 },
 ],
 hint: "Buy first, advance a few bars to see price change, then sell from the Positions tab.",
 startingCash: 10000,
 },
 },
 ],
 },
 {
 id: "basics-5",
 title: "Understanding P&L",
 description: "Calculate profits, losses, and returns like a pro",
 icon: "Calculator",
 xpReward: 55,
 steps: [
 {
 type: "teach",
 title: "Calculating Profit & Loss",
 content:
 "**P&L** (Profit and Loss) is your trading scorecard. The formula:\n\n**P&L = Quantity × (Sell Price Buy Price)**\n\n**Return %** = (P&L ÷ Cost Basis) × 100\n\nWhere Cost Basis = Quantity × Buy Price\n\nExample: Buy 20 shares at $50 cost = $1,000. Sell at $55 P&L = 20 × $5 = **$100 (+10%).**",
 },
 {
 type: "quiz-mc",
 question:
 "You bought 20 shares at $50 and sold at $55. What is your return percentage?",
 options: ["10%", "5%", "$100", "20%"],
 correctIndex: 0,
 explanation:
 "P&L = 20 × ($55 $50) = $100. Cost Basis = 20 × $50 = $1,000. Return = ($100 ÷ $1,000) × 100 = 10%. Always think in percentages — they let you compare any trade on equal terms regardless of size.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "You bought 100 shares of NVDA at $800. The price has dropped to $750. You're feeling nervous.",
 question: "What is your current unrealized loss?",
 options: ["-$5,000", "-$50", "-$500", "-$7,500"],
 correctIndex: 0,
 explanation:
 "Unrealized Loss = 100 × ($750 $800) = $5,000. It's 'unrealized' because you haven't sold yet — the loss only locks in when you close the position. Many great trades dip negative before turning profitable. Patience and a plan matter.",
 },
 {
 type: "quiz-tf",
 statement:
 "An unrealized loss becomes a realized loss only when you sell the position.",
 correct: true,
 explanation:
 "Correct! Unrealized P&L is your 'paper' gain or loss — it fluctuates with every price tick. The moment you sell, it becomes 'realized' and is permanent. This distinction matters enormously for both psychology and tax purposes.",
 },
 {
 type: "teach",
 title: "The P&L Concepts That Matter Most",
 content:
 "**Unrealized P&L**: Paper gain or loss on open positions. Fluctuates every bar — don't let it control your emotions.\n\n**Realized P&L**: Permanent gain or loss from closed trades. This is your actual track record.\n\n**Average Cost**: When you buy at multiple prices (averaging in), avg cost = total spent ÷ total shares.\n\nThe hardest truth in trading: the market doesn't care about your entry price. A small, controlled loss taken early always beats holding a loser and hoping it recovers.",
 },
 ],
 },
 ],
};
