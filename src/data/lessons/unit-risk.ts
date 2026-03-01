import type { Unit } from "./types";
import {
  PRACTICE_POSITION_SIZE,
  PRACTICE_RISK_REWARD,
  PRACTICE_DRAWDOWN,
  PRACTICE_BB_SQUEEZE,
} from "./practice-data";

export const UNIT_RISK: Unit = {
  id: "risk",
  title: "Risk Management",
  description: "Protect your capital and survive the market",
  icon: "Shield",
  color: "#f59e0b",
  lessons: [
    {
      id: "risk-1",
      title: "Position Sizing",
      description: "Calculate exactly how many shares to buy",
      icon: "Calculator",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "The #1 Skill in Trading",
          content:
            "Position sizing determines **how many shares to buy**. It's the difference between a manageable loss and a portfolio-destroying disaster.\n\n**The 1% Rule**: Never risk more than 1% of your total portfolio on a single trade.\n\nPortfolio: $100,000 → Max risk per trade: $1,000\n\nThis means even 10 consecutive losses only cost you 10% — you're still in the game.",
          visual: "risk-pyramid",
          highlight: ["position sizing", "1% rule"],
        },
        {
          type: "teach",
          title: "Calculating Position Size",
          content:
            "**Formula**:\nShares = (Portfolio × Risk %) / (Entry Price - Stop-Loss Price)\n\n**Example**: Portfolio $100K, Risk 1%, Buy at $50, Stop at $47\nShares = ($100,000 × 0.01) / ($50 - $47)\nShares = $1,000 / $3 = **333 shares**\n\nThis way, if your stop-loss triggers, you lose exactly $1,000 (1%).",
        },
        {
          type: "quiz-mc",
          question:
            "Portfolio: $50,000. Risk: 2%. Entry: $100. Stop-Loss: $95. How many shares should you buy?",
          options: ["200 shares", "100 shares", "500 shares", "50 shares"],
          correctIndex: 0,
          explanation:
            "Max risk = $50,000 × 2% = $1,000. Risk per share = $100 - $95 = $5. Shares = $1,000 / $5 = 200 shares.",
        },
        {
          type: "quiz-tf",
          statement:
            "It's okay to risk 20% of your portfolio on a single trade if you're very confident.",
          correct: false,
          explanation:
            "Even the best traders are wrong frequently. Risking 20% means just 5 consecutive losses wipe out your entire portfolio. Stick to 1-2% per trade regardless of conviction.",
        },
        {
          type: "practice",
          instruction:
            "Practice buying a carefully sized position — start small and manage your risk.",
          objective: "Buy shares with proper position sizing",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_POSITION_SIZE.bars,
            initialReveal: PRACTICE_POSITION_SIZE.initialReveal,
            objectives: [{ kind: "buy", minQuantity: 5 }],
            hint: "Select quantity 5 and click Buy. Notice the cost relative to your cash.",
            startingCash: 5000,
          },
        },
      ],
    },
    {
      id: "risk-2",
      title: "Diversification",
      description: "Don't put all your eggs in one basket",
      icon: "Layers",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "Why Diversify?",
          content:
            "**Diversification** means spreading your investments across different assets to reduce risk.\n\nIf you put 100% in one stock and it drops 50%, you lose half your portfolio.\nIf you spread across 10 stocks and one drops 50%, you lose only 5%.\n\nKey areas to diversify across:\n• **Sectors**: Tech, Finance, Healthcare, Energy\n• **Size**: Large-cap, Mid-cap, Small-cap\n• **Geography**: US, International, Emerging markets",
          visual: "portfolio-pie",
          highlight: ["diversification", "sectors", "correlation"],
        },
        {
          type: "teach",
          title: "Correlation Matters",
          content:
            "**Correlation** measures how much two assets move together.\n\n• **Positive correlation**: AAPL and MSFT (both tech) tend to move together\n• **Negative correlation**: Stocks and bonds often move in opposite directions\n• **No correlation**: Gold and tech stocks may move independently\n\nTrue diversification means holding assets with **low correlation**. Owning 10 tech stocks isn't really diversified!",
        },
        {
          type: "quiz-mc",
          question: "Which portfolio is better diversified?",
          options: [
            "AAPL, JPM, JNJ, XOM (Tech, Finance, Healthcare, Energy)",
            "AAPL, MSFT, GOOG, META (all Tech)",
            "NVDA, AMD, INTC, TSM (all Semiconductors)",
            "SPY, QQQ, DIA (all US index ETFs)",
          ],
          correctIndex: 0,
          explanation:
            "Holding stocks across different sectors (Tech, Finance, Healthcare, Energy) provides true diversification. The other options are concentrated in similar areas and would all suffer during sector-specific downturns.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "A trader has 80% of their portfolio in NVDA and TSLA. The AI hype bubble bursts, and both stocks drop 40%.",
          question: "What is the approximate total portfolio loss?",
          options: [
            "~32% (80% × 40%)",
            "~40%",
            "~80%",
            "~16%",
          ],
          correctIndex: 0,
          explanation:
            "The 80% in NVDA and TSLA drops 40%, causing a 32% portfolio loss. The remaining 20% in other assets may be affected less. This is why concentration risk is dangerous.",
        },
        {
          type: "quiz-tf",
          statement: "Owning 20 different tech stocks provides good diversification.",
          correct: false,
          explanation:
            "Holding 20 stocks in the same sector isn't true diversification. If the tech sector declines, all 20 stocks are likely to fall together. Diversification requires spreading across different, uncorrelated sectors and asset classes.",
        },
        {
          type: "practice",
          instruction:
            "Observe how a concentrated position amplifies portfolio swings. Watch the volatility without trading.",
          objective: "Watch the volatility play out over time",
          actionType: "observe",
          challenge: {
            priceData: PRACTICE_BB_SQUEEZE.bars,
            initialReveal: PRACTICE_BB_SQUEEZE.initialReveal,
            objectives: [{ kind: "advance-time", bars: 10 }],
            hint: "Advance bars and notice how large the swings are. Imagine holding 80% of your portfolio in this one stock.",
          },
        },
      ],
    },
    {
      id: "risk-3",
      title: "Risk/Reward Mastery",
      description: "Only take trades that make mathematical sense",
      icon: "Scale",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "Thinking in Probabilities",
          content:
            "Professional trading is about **expected value**, not being right on every trade.\n\n**Expected Value** = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)\n\nA trader who wins 40% of the time can still be profitable:\n• 40 wins × $300 avg = $12,000\n• 60 losses × $100 avg = $6,000\n• Net profit: $6,000\n\nThe key: keeping losses small and letting winners run.",
          visual: "risk-pyramid",
        },
        {
          type: "quiz-mc",
          question:
            "Win rate: 30%. Average win: $500. Average loss: $100. What is the expected value per trade?",
          options: [
            "+$80 profit per trade",
            "-$80 loss per trade",
            "$0 breakeven",
            "+$500 profit per trade",
          ],
          correctIndex: 0,
          explanation:
            "EV = (0.30 × $500) - (0.70 × $100) = $150 - $70 = +$80 per trade. Even with a 30% win rate, this trader profits because wins are 5× larger than losses.",
        },
        {
          type: "teach",
          title: "The Risk/Reward Framework",
          content:
            "Before every trade, define:\n\n1. **Entry price** — where you'll buy\n2. **Stop-loss** — where you'll exit if wrong (your risk)\n3. **Take-profit** — where you'll exit if right (your reward)\n\nOnly take trades where Reward ≥ 2× Risk.\n\nThis framework removes emotion from trading. You know your exact risk before entering.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "Setup: Entry at $100, Stop at $96, Target at $108.\nYour friend says: 'Just buy it, I have a good feeling about this stock!'",
          question: "What should you check before entering?",
          options: [
            "R:R ratio (1:2 here — $4 risk, $8 reward) meets the minimum",
            "Follow your friend's advice since they seem confident",
            "Check if the stock name sounds good",
            "Wait for a full moon",
          ],
          correctIndex: 0,
          explanation:
            "Always calculate R:R before entering. Here it's 1:2 ($4 risk, $8 reward) which meets the minimum. Never trade on 'feelings' — trade on analysis and proper risk management.",
        },
        {
          type: "quiz-tf",
          statement: "A trader can be profitable even if they lose more trades than they win.",
          correct: true,
          explanation:
            "Absolutely! If your winners are significantly larger than your losers, you can be profitable with a win rate below 50%. A trader winning 35% of trades with a 1:3 R:R is solidly profitable.",
        },
        {
          type: "practice",
          instruction:
            "Buy the dip and sell for a profit of at least $20. Practice identifying a good entry and taking profit.",
          objective: "Buy low, sell high for profit",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_RISK_REWARD.bars,
            initialReveal: PRACTICE_RISK_REWARD.initialReveal,
            objectives: [
              { kind: "buy", minQuantity: 5 },
              { kind: "profit-target", minProfit: 20 },
            ],
            startingCash: 5000,
            hint: "Wait for a dip to buy, then sell after the price recovers. Aim for at least $20 profit.",
          },
        },
      ],
    },
    {
      id: "risk-4",
      title: "Drawdowns & Recovery",
      description: "Understand why losses hurt more than gains help",
      icon: "TrendingDown",
      xpReward: 55,
      steps: [
        {
          type: "teach",
          title: "The Drawdown Trap",
          content:
            "A **drawdown** is the decline from your portfolio's peak to its lowest point.\n\nThe brutal math of losses:\n• Lose 10% → need 11% gain to recover\n• Lose 25% → need 33% gain to recover\n• Lose 50% → need **100%** gain to recover\n• Lose 75% → need **300%** gain to recover\n\nThis is why protecting capital is MORE important than making profits. Losses are mathematically harder to recover from.",
          visual: "risk-pyramid",
        },
        {
          type: "quiz-mc",
          question: "If your portfolio drops 50%, how much must it gain to return to the original value?",
          options: ["100%", "50%", "75%", "150%"],
          correctIndex: 0,
          explanation:
            "If $100K drops 50% to $50K, you need $50K in gains to get back to $100K. $50K is 100% of $50K. This asymmetry is why preventing large losses is critical.",
        },
        {
          type: "teach",
          title: "Managing Drawdowns",
          content:
            "**Rules to survive drawdowns:**\n\n1. **Max drawdown limit**: Stop trading if portfolio drops 15-20% from peak. Reassess your strategy.\n2. **Scale down**: If on a losing streak, reduce position sizes by 50%.\n3. **Journal**: Write down why each trade went wrong. Look for patterns.\n4. **Never revenge trade**: Don't try to make back losses with a big, risky trade.\n\nThe best traders focus on surviving to trade another day.",
        },
        {
          type: "quiz-tf",
          statement:
            "After a losing streak, you should increase your position size to recover faster.",
          correct: false,
          explanation:
            "This is 'revenge trading' — one of the most common mistakes. After losses, you should REDUCE position sizes to protect remaining capital. Increasing risk while on tilt leads to catastrophic losses.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "Your portfolio started at $100,000. After a bad week, it's at $82,000. You feel frustrated and spot a 'can't lose' trade.",
          question: "What should you do?",
          options: [
            "Reduce position sizes and review what went wrong before trading more",
            "Go all-in to recover the $18,000 loss quickly",
            "Double your normal position size on the 'sure thing'",
            "Borrow money to increase your buying power",
          ],
          correctIndex: 0,
          explanation:
            "After an 18% drawdown, the smart move is to scale down, review your mistakes, and trade smaller until you regain confidence. 'Sure thing' trades don't exist — this is emotional thinking.",
        },
        {
          type: "practice",
          instruction:
            "Buy shares, then sell before the loss exceeds $50. Practice cutting losses early.",
          objective: "Practice stop-loss discipline",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_DRAWDOWN.bars,
            initialReveal: PRACTICE_DRAWDOWN.initialReveal,
            objectives: [
              { kind: "buy", minQuantity: 5 },
              { kind: "stop-loss", maxLoss: -50 },
            ],
            startingCash: 5000,
            hint: "Buy shares, advance time, and sell quickly if the price drops. Don't let your loss exceed $50.",
          },
        },
      ],
    },
  ],
};
