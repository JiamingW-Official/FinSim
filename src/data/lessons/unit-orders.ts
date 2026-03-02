import type { Unit } from "./types";
import { PRACTICE_MARKET_ORDER, PRACTICE_LIMIT_DIP } from "./practice-data";

export const UNIT_ORDERS: Unit = {
  id: "orders",
  title: "Order Mastery",
  description: "Master every order type like a pro trader",
  icon: "ClipboardList",
  color: "#3b82f6",
  lessons: [
    {
      id: "orders-1",
      title: "Market Orders",
      description: "Execute instantly at the best available price",
      icon: "Zap",
      xpReward: 50,
      steps: [
        {
          type: "teach",
          title: "⚡ What is a Market Order?",
          content:
            "A **Market Order** buys or sells immediately at the current best available price. It prioritizes **speed** over **price**.\n\n**Pros**: Guaranteed execution, instant fill\n**Cons**: You might get a slightly different price than expected (called **slippage**), especially with volatile stocks or large orders.",
          visual: "order-flow",
          highlight: ["market order", "slippage"],
        },
        {
          type: "teach",
          title: "🎯 When to Use Market Orders",
          content:
            "Use market orders when:\n• You need to enter or exit a position **immediately**\n• The stock is highly liquid (high volume, tight spread)\n• The price is moving fast and you don't want to miss it\n\nAvoid market orders when:\n• Trading illiquid stocks (wide spreads)\n• During market open/close (high volatility)\n• Placing very large orders relative to volume",
        },
        {
          type: "quiz-mc",
          question: "What is the main advantage of a market order?",
          options: [
            "Guaranteed execution at the best available price",
            "You always get the exact price you see",
            "It's cheaper than limit orders",
            "It only executes during market hours",
          ],
          correctIndex: 0,
          explanation:
            "Market orders guarantee execution — your order will be filled immediately. However, the exact price may differ slightly from what you see due to slippage.",
        },
        {
          type: "quiz-tf",
          statement: "Market orders always execute at the exact price displayed on the screen.",
          correct: false,
          explanation:
            "Market orders may experience slippage — the actual fill price can differ slightly from the displayed price, especially in fast-moving or illiquid markets.",
        },
        {
          type: "practice",
          instruction: "Execute a market buy order — it fills instantly at the current price.",
          objective: "Buy shares to see how a market order works",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_MARKET_ORDER.bars,
            initialReveal: PRACTICE_MARKET_ORDER.initialReveal,
            objectives: [{ kind: "buy", minQuantity: 5 }],
            hint: "Select quantity 5 or 10 and click Buy.",
            startingCash: 10000,
          },
        },
      ],
    },
    {
      id: "orders-2",
      title: "Limit Orders",
      description: "Set your price and wait for the market to come to you",
      icon: "Target",
      xpReward: 60,
      steps: [
        {
          type: "teach",
          title: "🎚️ What is a Limit Order?",
          content:
            "A **Limit Order** lets you set the maximum price you'll pay (buy) or minimum price you'll accept (sell). Your order only executes at your limit price or better.\n\n**Buy Limit**: \"I want to buy AAPL, but only if the price drops to $170.\"\n**Sell Limit**: \"I'll sell my MSFT shares, but only at $420 or higher.\"",
          visual: "order-flow",
          highlight: ["limit order", "buy limit", "sell limit"],
        },
        {
          type: "teach",
          title: "⚖️ Limit vs Market: The Tradeoff",
          content:
            "**Market Order**: Speed ✓ | Price Control ✗\n**Limit Order**: Speed ✗ | Price Control ✓\n\nWith limit orders, you control the price but risk **non-execution** — if the stock never reaches your limit price, your order stays unfilled.\n\nPro tip: Set buy limits slightly below current price to enter at a discount during dips.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "AAPL is currently trading at $185. You place a buy limit order at $180.",
          question: "When will your order execute?",
          options: [
            "Only if AAPL's price drops to $180 or below",
            "Immediately at $185",
            "At the end of the trading day",
            "Never — you can't set limits below current price",
          ],
          correctIndex: 0,
          explanation:
            "A buy limit order at $180 will only fill when the stock price reaches $180 or lower. If the price never dips that low, the order stays open and unfilled.",
        },
        {
          type: "quiz-mc",
          question: "Why would a trader prefer a limit order over a market order?",
          options: [
            "To control the exact price they pay or receive",
            "To guarantee the order executes immediately",
            "Limit orders are always free of commission",
            "Limit orders always fill faster",
          ],
          correctIndex: 0,
          explanation:
            "Limit orders give you price control. You decide the maximum buy price or minimum sell price. The tradeoff is that execution isn't guaranteed.",
        },
        {
          type: "practice",
          instruction:
            "Buy shares and advance time. Watch the price dip and recover — timing matters!",
          objective: "Buy shares during the price dip for a better entry",
          actionType: "buy",
          challenge: {
            priceData: PRACTICE_LIMIT_DIP.bars,
            initialReveal: PRACTICE_LIMIT_DIP.initialReveal,
            objectives: [
              { kind: "advance-time", bars: 5 },
              { kind: "buy", minQuantity: 1 },
            ],
            hint: "Advance time to watch the price dip, then buy at a lower price.",
            startingCash: 10000,
          },
        },
      ],
    },
    {
      id: "orders-3",
      title: "Stop-Loss Orders",
      description: "Protect yourself from catastrophic losses",
      icon: "Shield",
      xpReward: 65,
      steps: [
        {
          type: "teach",
          title: "🛡️ The Safety Net: Stop-Loss",
          content:
            "A **Stop-Loss** order automatically sells your position when the price drops to a specified level. It's your safety net against large losses.\n\n**Example**: You buy TSLA at $250. You set a stop-loss at $230.\nIf TSLA drops to $230, your shares automatically sell, limiting your loss to $20/share.\n\nWithout a stop-loss, a 50% crash means losing half your investment.",
          visual: "risk-pyramid",
          highlight: ["stop-loss", "risk management"],
        },
        {
          type: "teach",
          title: "📏 Setting Your Stop-Loss Level",
          content:
            "Common approaches:\n\n**Percentage-based**: Set stop at 5-10% below entry price\n**Support-based**: Place stop just below a key support level\n**ATR-based**: Use Average True Range (e.g., 2× ATR below entry)\n\n**Golden Rule**: Never risk more than 1-2% of your total portfolio on a single trade. If your portfolio is $100K, max loss per trade should be $1K-$2K.",
        },
        {
          type: "quiz-mc",
          question:
            "You buy 100 shares at $50 with a portfolio of $100,000. Following the 1% rule, where should your stop-loss be?",
          options: ["$40", "$45", "$49", "$25"],
          correctIndex: 0,
          explanation:
            "1% of $100K = $1,000 max risk. With 100 shares, that's $10/share max loss. So stop-loss = $50 - $10 = $40. If the position size is too large for a reasonable stop, reduce the number of shares.",
        },
        {
          type: "quiz-tf",
          statement: "Professional traders always use stop-loss orders to manage risk.",
          correct: true,
          explanation:
            "Risk management is the #1 priority for professional traders. Stop-losses are a core tool — they take emotions out of the decision to exit a losing trade.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "You set a stop-loss at $95 for a stock you bought at $100. Overnight, bad news causes the stock to open at $85.",
          question: "What happens to your stop-loss?",
          options: [
            "It triggers at $85 (market open price), not $95",
            "It cancels automatically",
            "It sells at exactly $95",
            "Nothing happens until the price touches $95",
          ],
          correctIndex: 0,
          explanation:
            "Stop-losses trigger at the next available price. If the stock gaps below your stop, you'll be filled at the gap-down price ($85), not your stop level ($95). This is called 'gap risk.'",
        },
      ],
    },
    {
      id: "orders-4",
      title: "Take-Profit Orders",
      description: "Lock in gains before the market changes its mind",
      icon: "CircleDollarSign",
      xpReward: 55,
      steps: [
        {
          type: "teach",
          title: "🎯 Securing Your Wins: Take-Profit",
          content:
            "A **Take-Profit** order automatically sells when the price reaches your target level. It locks in gains so you don't have to watch the screen constantly.\n\n**Example**: Buy at $100, set take-profit at $115.\nWhen price hits $115, your shares sell automatically for a 15% gain.\n\nThis prevents the common mistake of being too greedy — watching profits evaporate because you didn't sell.",
        },
        {
          type: "teach",
          title: "⚖️ The Risk/Reward Ratio",
          content:
            "**Risk/Reward Ratio** compares your potential loss to potential gain.\n\nBuy at $100, Stop-Loss at $90, Take-Profit at $130:\n• Risk: $10 | Reward: $30\n• R:R = 1:3 (risking $1 to make $3)\n\n**Rule of thumb**: Only take trades with R:R of at least 1:2. This means even if you're wrong 50% of the time, you still profit overall.",
          visual: "risk-pyramid",
        },
        {
          type: "quiz-mc",
          question:
            "Entry: $200, Stop-Loss: $190, Take-Profit: $230. What is the Risk/Reward ratio?",
          options: ["1:3", "1:2", "3:1", "1:1"],
          correctIndex: 0,
          explanation:
            "Risk = $200 - $190 = $10. Reward = $230 - $200 = $30. Ratio = $10:$30 = 1:3. For every $1 you risk, you stand to gain $3.",
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have two trade setups:\nTrade A: Risk $500 to potentially make $500 (1:1)\nTrade B: Risk $500 to potentially make $1,500 (1:3)",
          question: "Which trade is more favorable from a risk/reward perspective?",
          options: [
            "Trade B — 1:3 ratio means better reward per unit of risk",
            "Trade A — equal risk and reward is balanced",
            "Both are equal",
            "Neither — you should never risk $500",
          ],
          correctIndex: 0,
          explanation:
            "Trade B offers 3× the potential reward for the same risk. With a 1:3 ratio, you only need to be right 25% of the time to break even. Trade A requires 50% accuracy.",
        },
        {
          type: "quiz-tf",
          statement:
            "A Risk/Reward ratio of 1:2 means you need to be right more than 50% of the time to be profitable.",
          correct: false,
          explanation:
            "With 1:2 R:R, your wins are twice your losses. You only need to be right 33% of the time to break even. Being right 40% would make you profitable.",
        },
      ],
    },
  ],
};
