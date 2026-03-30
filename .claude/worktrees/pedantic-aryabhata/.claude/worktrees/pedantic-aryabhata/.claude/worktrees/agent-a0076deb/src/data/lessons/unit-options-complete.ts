import type { Unit } from "./types";

export const UNIT_OPTIONS_COMPLETE: Unit = {
  id: "options-complete",
  title: "Options Trading: Complete Course",
  description: "Master options from first principles to real strategies",
  icon: "TrendingUp",
  color: "#8b5cf6",
  lessons: [
    /* ================================================================
       LESSON 1 — Options Fundamentals
       ================================================================ */
    {
      id: "options-complete-1",
      title: "Options Fundamentals",
      description:
        "Calls vs puts, moneyness, intrinsic vs extrinsic value, and why options exist",
      icon: "BookOpen",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "What Is an Option Contract?",
          content:
            "An **option** is a contract between two parties that gives the buyer the **right, but not the obligation**, to buy or sell 100 shares of a stock at a specified price (the **strike price**) before a specified date (the **expiration date**).\n\nThe seller of the option (called the **option writer**) has the obligation to fulfill that contract if the buyer exercises it. In return, the seller receives an upfront payment called the **premium**.\n\nTwo types exist:\n- **Call option**: the right to *buy* shares at the strike price\n- **Put option**: the right to *sell* shares at the strike price\n\nOptions were originally designed as **insurance instruments**. A farmer holding wheat could buy put options to lock in a selling price, protecting against a price collapse before harvest. Today they are used for income generation, speculation, and hedging institutional portfolios worth billions.\n\nKey terminology recap:\n- **Underlying**: the stock the option is written on (e.g., AAPL)\n- **Strike**: the price at which the option can be exercised\n- **Expiry**: the date after which the option ceases to exist\n- **Premium**: the price paid to acquire the option contract\n- **Contract size**: 1 contract = 100 shares",
          highlight: [
            "call option",
            "put option",
            "strike price",
            "expiration date",
            "premium",
            "option writer",
          ],
        },
        {
          type: "teach",
          title: "Calls: The Right to Buy",
          content:
            "A **call option** gives its holder the right to buy 100 shares at the strike price, regardless of where the stock is trading.\n\n**Example:** AAPL is trading at $150. You buy the AAPL $155 call expiring in 30 days for a premium of $2.50 per share ($250 total, since 1 contract = 100 shares).\n\nThree outcomes at expiry:\n1. AAPL rises to $165: You can buy 100 shares at $155 and immediately sell at $165 = $10/share profit. Net profit = $10 - $2.50 premium = **$7.50/share ($750 total)**.\n2. AAPL stays at $150: The option to buy at $155 is worthless — no one pays $155 when the stock costs $150 in the market. You lose your **entire $250 premium**.\n3. AAPL falls to $140: Same result — option expires worthless, $250 loss.\n\nThe call buyer's maximum loss is always the premium paid. The maximum gain is theoretically unlimited as the stock can rise indefinitely.\n\nCall sellers (writers) have the opposite profile: they collect the $250 premium immediately but face potentially unlimited loss if the stock rockets higher.",
          highlight: ["call option", "unlimited upside", "premium loss"],
        },
        {
          type: "teach",
          title: "Puts: The Right to Sell",
          content:
            "A **put option** gives its holder the right to sell 100 shares at the strike price, even if the stock is trading much lower.\n\n**Example:** AAPL is trading at $150. You buy the AAPL $145 put expiring in 30 days for a premium of $2.00 per share ($200 total).\n\nThree outcomes at expiry:\n1. AAPL falls to $130: You can sell 100 shares at $145 (or close the option). Profit = ($145 - $130) - $2.00 premium = **$13/share ($1,300 total)**.\n2. AAPL stays at $150: The right to sell at $145 is worthless — no one pays $145 when the market pays $150. You lose your **$200 premium**.\n3. AAPL rises to $165: Option expires worthless, $200 loss.\n\nPuts are the natural hedge for long stock positions. An investor holding 1,000 shares of AAPL at $150 can buy 10 put contracts at $145 as insurance — if AAPL collapses to $100, the puts pay out substantially, offsetting much of the stock loss. This is called a **protective put**.",
          highlight: ["put option", "protective put", "hedge"],
        },
        {
          type: "teach",
          title: "Moneyness: ITM, ATM, and OTM",
          content:
            "**Moneyness** describes the relationship between an option's strike price and the current stock price. It is one of the most important concepts for understanding options behavior.\n\n**In-the-Money (ITM):**\n- Call: strike < stock price (e.g., AAPL at $150, $140 call)\n- Put: strike > stock price (e.g., AAPL at $150, $160 put)\n- Has intrinsic value; more expensive, moves dollar-for-dollar with stock\n\n**At-the-Money (ATM):**\n- Strike ≈ stock price (e.g., AAPL at $150, $150 call or put)\n- Maximum time value; most sensitive to volatility changes\n- This is where options market makers focus most attention\n\n**Out-of-the-Money (OTM):**\n- Call: strike > stock price (e.g., AAPL at $150, $165 call)\n- Put: strike < stock price (e.g., AAPL at $150, $135 put)\n- No intrinsic value; cheaper, higher percentage return if stock moves sharply, but more likely to expire worthless\n\nProfessional traders often say: *'OTM options are lottery tickets; ITM options are leveraged stock positions; ATM options give the most bang for your volatility dollar.'*",
          highlight: ["in-the-money", "at-the-money", "out-of-the-money", "moneyness"],
        },
        {
          type: "quiz-mc",
          question:
            "AAPL is trading at $175. Which of the following call options is in-the-money (ITM)?",
          options: [
            "$170 call",
            "$175 call",
            "$180 call",
            "$185 call",
          ],
          correctIndex: 0,
          explanation:
            "A call option is in-the-money when the strike price is below the current stock price. The $170 call gives you the right to buy at $170 when the stock is at $175 — that right has $5 of immediate value. The $175 call is at-the-money, while the $180 and $185 calls are out-of-the-money.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Intrinsic Value vs. Extrinsic Value",
          content:
            "Every option premium breaks into two components:\n\n**Intrinsic Value**: The 'real', immediate value of an option if exercised right now.\n- ITM call: Stock Price - Strike Price (e.g., AAPL at $150, $140 call: intrinsic = $10)\n- ITM put: Strike Price - Stock Price (e.g., AAPL at $150, $160 put: intrinsic = $10)\n- OTM and ATM options always have intrinsic value of **zero** — you can never have negative intrinsic value\n\n**Extrinsic Value (Time Value)**: The additional premium above intrinsic value, reflecting:\n- **Time remaining** until expiry (more time = more extrinsic value)\n- **Implied Volatility (IV)** (higher IV = more extrinsic value; the market is pricing in bigger potential moves)\n- **Interest rates** (minor factor)\n\n**Example:** AAPL at $150, the $145 call priced at $8.50.\n- Intrinsic value = $150 - $145 = $5.00\n- Extrinsic value = $8.50 - $5.00 = $3.50\n\nExtrinsic value decays to zero at expiry — this is called **theta decay**. Option sellers want to collect this decay; option buyers must overcome it to profit.",
          highlight: [
            "intrinsic value",
            "extrinsic value",
            "time value",
            "implied volatility",
            "theta decay",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "An out-of-the-money option can have a premium above zero even though it has zero intrinsic value.",
          correct: true,
          explanation:
            "Correct. An OTM option has no intrinsic value — it would be worthless if exercised today. But it has extrinsic (time) value as long as time remains before expiry and there is some chance the stock could move to make it profitable. For example, an AAPL $170 call when AAPL trades at $150 might still cost $0.80 because there is 30 days left and some probability AAPL could reach $170.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "AAPL is at $160. You are analyzing two calls: the $155 call priced at $9.20 and the $165 call priced at $2.10. You want to find the extrinsic value of each.",
          question:
            "What are the intrinsic and extrinsic values of the $155 call?",
          options: [
            "Intrinsic: $5.00, Extrinsic: $4.20",
            "Intrinsic: $9.20, Extrinsic: $0.00",
            "Intrinsic: $0.00, Extrinsic: $9.20",
            "Intrinsic: $4.20, Extrinsic: $5.00",
          ],
          correctIndex: 0,
          explanation:
            "The $155 call is ITM since the stock ($160) is above the strike ($155). Intrinsic value = $160 - $155 = $5.00. Extrinsic value = $9.20 - $5.00 = $4.20. The $165 call is OTM (strike above stock), so its intrinsic value is $0 and its entire $2.10 premium is extrinsic value — pure time/volatility premium that decays to zero at expiry.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 2 — Understanding Premium
       ================================================================ */
    {
      id: "options-complete-2",
      title: "Understanding Premium",
      description:
        "What drives option prices: the bid-ask spread, time value, and when to exercise vs. sell",
      icon: "DollarSign",
      xpReward: 75,
      steps: [
        {
          type: "teach",
          title: "The Bid-Ask Spread in Options",
          content:
            "Unlike stocks where spreads are often $0.01, options can have spreads of $0.10 to $1.00 or more. This makes the **bid-ask spread** a critical cost to understand.\n\n**Bid**: the highest price a buyer is willing to pay (what you receive if you sell)\n**Ask**: the lowest price a seller will accept (what you pay if you buy)\n**Mid-price**: the midpoint between bid and ask\n\n**Example:** AAPL $150 call, bid $3.40, ask $3.60. The spread is $0.20.\n- If you buy at the ask ($3.60) and immediately sell at the bid ($3.40), you lose $0.20 per share = **$20 per contract** instantly.\n\nLiquid options (high volume, tight markets) may have $0.05 spreads. Illiquid options can have $2+ spreads that are nearly impossible to overcome.\n\n**Practical rules:**\n1. Always check the spread before entering — wide spreads destroy returns on small moves\n2. Use **limit orders** at or near the mid-price; avoid market orders in options\n3. Stick to options with daily volume > 500 contracts and open interest > 1,000\n4. ATM options on liquid stocks like AAPL, SPY, MSFT typically have the tightest spreads",
          highlight: ["bid", "ask", "spread", "mid-price", "open interest"],
        },
        {
          type: "teach",
          title: "The Three Forces Driving Premium",
          content:
            "Option premium is not arbitrary — it is driven by three quantifiable forces:\n\n**1. Time to Expiration**\nMore time = more premium. A 90-day option costs more than a 30-day option on the same strike because there is more time for the stock to move in your favor. This extra cost decays away — slowly at first, then accelerating in the final weeks. This is **time decay (theta)**.\n\n**2. Implied Volatility (IV)**\nIV is the market's forecast of future price movement, expressed as an annualized percentage. When IV is high (e.g., 60%), the market expects big swings. Options are priced more expensively because there is more chance the stock makes a big move.\n- AAPL $150 call with IV at 25%: might cost $3.00\n- Same call with IV at 50% (e.g., just before earnings): might cost $6.00\n\nIV is the single most important factor that differentiates options from simply leveraged stock.\n\n**3. Distance from Strike (Moneyness)**\nATM options have the most time value. Deep ITM options are mostly intrinsic value. Deep OTM options are almost entirely extrinsic. As options move from OTM → ATM → ITM, the balance shifts from pure time-value speculation to intrinsic value.",
          highlight: [
            "time decay",
            "implied volatility",
            "theta",
            "moneyness",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "AAPL is at $150. The 30-day $150 call costs $4.00 today. After one week passes (with no stock movement and no IV change), what happens to the premium?",
          options: [
            "It falls below $4.00 due to theta decay",
            "It stays exactly at $4.00",
            "It rises above $4.00 because time premium builds",
            "It falls to zero immediately",
          ],
          correctIndex: 0,
          explanation:
            "Time decay (theta) erodes extrinsic value every day — it never reverses. After one week, the option now has only ~23 days of time value remaining instead of 30. All else equal, the premium will be lower. This is why long option holders work against the clock while option sellers benefit every day that passes without a move.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "How IV Changes Option Prices: A Real Example",
          content:
            "**Implied Volatility (IV)** is what makes options truly unique. It is the market's collective estimate of how much a stock will move, embedded in the price.\n\n**Example — NVDA earnings:**\nNVDA is at $480. Before earnings, IV spikes to 80% (up from 30% normally). The $480 call costs $22 (4.6% of stock price).\n\nAfter earnings, NVDA rises to $490 — a $10 move, which seems positive. But IV crashes from 80% back to 30% (**IV crush**). The $480 call might now trade at only $14 despite being $10 ITM.\n- Intrinsic value: $490 - $480 = $10\n- Extrinsic value: $14 - $10 = $4 (down from $12 pre-earnings)\n\nThe buyer who paid $22 lost $8 per share ($800 per contract) even though the stock moved in their direction. This is **IV crush** — the most common way new options traders get burned.\n\n**Key insight:** When IV is elevated, buying options is expensive. Professional traders often prefer selling options during high-IV periods and buying them during low-IV periods.",
          highlight: ["implied volatility", "IV crush", "earnings", "IV spike"],
        },
        {
          type: "quiz-tf",
          statement:
            "You bought an AAPL call option. It is always better to exercise the option rather than sell it in the market.",
          correct: false,
          explanation:
            "Almost always wrong. When you exercise a call, you receive the intrinsic value only ($150 stock - $145 strike = $5). But if the option has extrinsic value remaining, you lose that by exercising. For example, if the option trades at $6 but intrinsic is $5, selling at $6 gives you $1 more than exercising. Exercise only makes sense when extrinsic value has decayed to near zero (deep ITM near expiry) or when you specifically want to own the shares. The phrase: 'sell, never exercise' is a useful simplification for most option trades.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Break-Even Price",
          content:
            "Every option position has a **break-even price** at expiration — the stock price at which you neither profit nor lose.\n\n**Long call break-even** = Strike + Premium Paid\nExample: Buy AAPL $155 call for $2.50 → Break-even = $155 + $2.50 = **$157.50**\nAAPL must close above $157.50 at expiry to make money.\n\n**Long put break-even** = Strike - Premium Paid\nExample: Buy AAPL $145 put for $2.00 → Break-even = $145 - $2.00 = **$143.00**\nAAPL must close below $143.00 at expiry to make money.\n\nBreak-even is useful, but it applies to the case where you *hold to expiration*. In practice, most traders close positions well before expiry to avoid gamma risk and retain remaining extrinsic value. You can profit on a call even if the stock never reaches the break-even price — if the stock rises and IV stays elevated, the option gains value and you can sell it for more than you paid before expiry.",
          highlight: ["break-even", "hold to expiration", "gamma risk"],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You buy 2 AAPL $160 call contracts (200 shares) for $3.20 per share ($640 total). AAPL rises from $155 to $163. With 15 days left to expiry, the calls are now trading at $5.80.",
          question:
            "What is your profit if you sell to close now, and should you exercise or sell?",
          options: [
            "Profit: $520; sell in the market — exercising forfeits the extrinsic value remaining",
            "Profit: $640; exercise for maximum profit",
            "Profit: $260; always exercise ITM options",
            "Profit: $800; sell only if IV is falling",
          ],
          correctIndex: 0,
          explanation:
            "Selling profit = ($5.80 - $3.20) x 200 = $2.60 x 200 = $520. The option at $5.80 includes intrinsic value ($163 - $160 = $3.00 intrinsic... wait: since you're selling at $5.80 total and intrinsic is $3, extrinsic = $2.80). Exercising gives only intrinsic ($3.00/share x 200 = $600), while selling at $5.80 gives $1,160 gross ($520 profit net of cost). Always sell in the market unless extrinsic value is zero.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 3 — The Greeks Explained Simply
       ================================================================ */
    {
      id: "options-complete-3",
      title: "The Greeks Explained Simply",
      description:
        "Delta as probability proxy, gamma as rate of change, theta as rent, vega as uncertainty",
      icon: "Activity",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "Why 'The Greeks' Matter",
          content:
            "Options traders use a set of risk measures called **The Greeks** to quantify how an option's price changes with various inputs. Each Greek isolates one variable:\n\n| Greek | Measures sensitivity to... |\n|-------|---------------------------|\n| Delta | Stock price movement |\n| Gamma | Rate of change of Delta |\n| Theta | Time passing |\n| Vega | Implied volatility changes |\n| Rho | Interest rate changes |\n\nYou do not need to calculate these from scratch — your broker displays them. But understanding what each one *means* lets you anticipate how your position will behave and make smarter decisions.\n\nThink of the Greeks as the **dashboard of your option position** — they tell you what you are exposed to and how much.",
          highlight: ["delta", "gamma", "theta", "vega", "rho"],
        },
        {
          type: "teach",
          title: "Delta: Your Probability Proxy",
          content:
            "**Delta** is the most important Greek. It measures how much an option's price changes for a $1 move in the stock.\n\n- Calls have positive delta (0 to +1)\n- Puts have negative delta (0 to -1)\n- A delta of 0.50 means the option gains $0.50 for every $1 the stock rises (and loses $0.50 for every $1 fall)\n\n**The Probability Interpretation:**\nDelta approximates the probability that an option expires in-the-money. A delta of 0.30 means roughly 30% chance of expiring ITM.\n- Deep ITM options: delta near 1.0 (acts like owning 100 shares)\n- ATM options: delta ≈ 0.50 (50% chance of expiring ITM)\n- Far OTM options: delta near 0.05–0.10 (lottery ticket)\n\n**Example:** AAPL at $150, you hold the $155 call (delta = 0.35). AAPL jumps $5 to $155.\n- Option gains approximately $5 x 0.35 = **$1.75 per share**.\n\n**100-Delta equivalent:** If you buy 2 call contracts with delta 0.50 each, your position has 2 x 100 x 0.50 = 100 **delta-equivalents** — similar exposure to owning 100 shares of stock.",
          highlight: [
            "delta",
            "probability proxy",
            "delta-equivalents",
            "in-the-money probability",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "AAPL is at $150. You hold a $160 call with a delta of 0.22. If AAPL rises to $153, approximately how much does the option gain in value per share?",
          options: ["$0.66", "$3.00", "$1.50", "$2.20"],
          correctIndex: 0,
          explanation:
            "Option gain ≈ stock move × delta = $3.00 × 0.22 = $0.66 per share ($66 per contract). Delta is approximate — it only holds for small moves. As the stock rises, delta itself changes (that is gamma's job), making this a linear approximation around the current price.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Gamma: The Accelerator",
          content:
            "**Gamma** measures how quickly delta changes as the stock moves. It is the rate of change of delta.\n\n- High gamma means delta changes rapidly with each $1 move\n- Gamma is always positive for option buyers, always negative for option sellers\n- Gamma peaks for ATM options close to expiration — this is why weekly ATM options can see enormous percentage moves on small stock moves\n\n**Example:** AAPL at $150, ATM $150 call has delta = 0.50, gamma = 0.04.\n- AAPL moves to $151: new delta ≈ 0.50 + 0.04 = **0.54**\n- AAPL moves to $152: delta ≈ 0.54 + 0.04 = **0.58**\n- Delta snowballs as the stock rises — this is the convexity (unlimited upside) of long options\n\n**Gamma risk for sellers:** Option sellers have negative gamma. A sudden large stock move causes their short options to gain value rapidly, potentially overwhelming their collected premium. This is why naked short option sellers fear 'gap-up' mornings.\n\n**The 0DTE (zero days to expiry) phenomenon:** On expiration day, ATM gamma is enormous — a small move can swing option value 200–500%. This creates both opportunity and extreme risk.",
          highlight: ["gamma", "convexity", "gamma risk", "0DTE"],
        },
        {
          type: "teach",
          title: "Theta: You Are Paying Rent",
          content:
            "**Theta** measures the daily decay of an option's extrinsic value. If all else stays equal, an option loses value every day simply due to the passage of time.\n\nTheta is expressed as the dollar loss per day per share:\n- An option with theta = -0.05 loses $0.05/share ($5/contract) every calendar day\n- An option with theta = -0.20 loses $0.20/share ($20/contract) per day\n\n**The Theta Decay Curve:**\nTheta is not linear. Extrinsic value decays slowly at first (90 days out), then accelerates dramatically in the final 30 days, and becomes turbocharged in the last 7 days.\n\n**Example:** You buy a 30-day AAPL $155 call for $3.00 with theta = -0.10.\n- After 7 days (no movement): ~$2.30 (lost $0.70)\n- After 14 days (no movement): ~$1.50 (accelerating)\n- After 28 days (no movement): ~$0.20\n\n**Theta is rent you pay to hold an option.** Buyers of options fight theta every day. Sellers collect theta — they are the landlords. This is why the mantra among professional option sellers is: *'time is money, and we own the clock.'*",
          highlight: ["theta", "theta decay", "time decay", "extrinsic value"],
        },
        {
          type: "quiz-tf",
          statement:
            "An option's theta decay accelerates as expiration approaches, meaning the option loses more value per day in its final week than in its first week.",
          correct: true,
          explanation:
            "Correct. Theta decay is non-linear and follows roughly a square-root-of-time relationship. An ATM option with 30 days left loses roughly twice as much per day as the same option with 60 days left. The final 7 days before expiry see the steepest decay. This is why selling options with 7–14 days to expiry is a popular income strategy — you collect accelerating decay — but also why holding long options into the last week is expensive.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Vega: The Volatility Sensitivity",
          content:
            "**Vega** measures how much an option's price changes for every 1% change in Implied Volatility (IV).\n\n- A vega of 0.15 means: for each 1% IV increase, the option gains $0.15 per share ($15 per contract)\n- Vega is always positive for option buyers — rising IV benefits them\n- Vega is always negative for option sellers — rising IV hurts them\n\n**Example:** You hold an AAPL $150 call with vega = 0.18 and IV currently at 25%.\n- If IV rises to 30% (+5%): option gains approximately $0.18 x 5 = **$0.90** per share\n- If IV falls to 20% (-5%): option loses approximately **$0.90** per share\n\n**When does IV spike?**\n- Before earnings announcements\n- During macro events (Fed meetings, CPI data)\n- Market panic / black swan events\n- Merger and acquisition speculation\n\nVega is highest for ATM options with longer expirations. A 90-day ATM option is far more sensitive to IV than a 7-day ATM option.\n\n**Practical use:** If you expect a catalyst (like earnings) to spike IV, buy options before the event. If you expect IV to fall after a catalyst, sell options or use spreads that benefit from IV contraction.",
          highlight: [
            "vega",
            "implied volatility",
            "IV spike",
            "volatility sensitivity",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You hold a TSLA $200 call (vega = 0.25) purchased when IV was 50%. A Fed announcement causes IV to jump from 50% to 65% overnight, while the stock price stays flat at $195.",
          question: "Approximately how much did your call option gain from the IV increase alone?",
          options: [
            "$3.75 per share ($375 per contract)",
            "$0.25 per share ($25 per contract)",
            "$12.50 per share ($1,250 per contract)",
            "Zero — IV changes don't affect OTM options",
          ],
          correctIndex: 0,
          explanation:
            "Vega gain = vega × IV change = 0.25 × 15% = $3.75 per share = $375 per contract. Even though the stock didn't move at all, the option became significantly more expensive because the market is now pricing in larger expected moves. This is 'long vega' exposure — one of the key advantages of buying options before high-volatility events.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 4 — Buying Options
       ================================================================ */
    {
      id: "options-complete-4",
      title: "Buying Options",
      description:
        "Long calls and puts, when to buy, managing winners, and common mistakes",
      icon: "ArrowUpRight",
      xpReward: 80,
      steps: [
        {
          type: "teach",
          title: "The Long Call: Leveraged Bullish Bet",
          content:
            "Buying a call option is the most straightforward way to profit from an expected price increase with **defined risk**.\n\n**Structure:** Pay premium upfront → Right to buy stock at strike → Profit if stock rises above break-even\n\n**Compared to buying stock:**\n- Stock: Buy 100 shares of AAPL at $150 → $15,000 invested, $0 risk cap\n- Long call: Buy 1 AAPL $150 call at $4.00 → $400 invested, max loss $400\n\nIf AAPL rises to $165:\n- Stock profit: $15 × 100 = $1,500 (10% return on $15,000)\n- Call profit: ($165 - $150 - $4.00) × 100 = $1,100 (275% return on $400)\n\nOptions provide **leverage** — a small capital outlay controls a large notional position. But this leverage is a double-edged sword: the stock must move enough (above break-even) within a set timeframe.\n\n**When to buy calls:**\n- You have strong directional conviction the stock will rise significantly\n- A catalyst is coming (earnings beat, FDA approval, product launch)\n- IV is relatively low (you're buying cheap volatility)\n- Your timeframe is well-defined (you don't want to hold through excessive time decay)",
          highlight: [
            "long call",
            "leverage",
            "defined risk",
            "break-even",
            "catalyst",
          ],
        },
        {
          type: "teach",
          title: "The Long Put: Defined-Risk Bearish Position",
          content:
            "Buying a put option profits when the stock falls. It is the professional alternative to short selling a stock, with one critical advantage: **maximum loss is limited to the premium paid**.\n\n**Short selling risks:**\n- Theoretically unlimited loss (stock can rise indefinitely)\n- Requires borrowing shares and paying borrow fees\n- Subject to short squeezes and margin calls\n\n**Long put risks:**\n- Maximum loss: premium paid (e.g., $300 per contract)\n- No borrow requirement\n- No margin call risk\n\n**Example:** META is at $300 and you expect a sell-off after earnings. You buy the $290 put for $3.50 per share ($350 per contract, break-even at $286.50).\n\nOutcomes:\n- META falls to $270: profit = ($290 - $270 - $3.50) × 100 = **$1,650**\n- META stays at $300: put expires worthless, loss = **$350**\n- META rises to $320: put expires worthless, loss = **$350**\n\n**Protective put vs. speculative put:** A protective put is buying a put while you own the stock (insurance). A speculative put is buying a put outright as a directional bet that the stock falls.",
          highlight: [
            "long put",
            "protective put",
            "short selling",
            "defined risk",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You buy 1 MSFT $380 put for $5.00 when MSFT is at $385. What is your maximum possible loss?",
          options: ["$500", "$38,000", "Unlimited", "$37,500"],
          correctIndex: 0,
          explanation:
            "The maximum loss on a long option is always the premium paid, period. You paid $5.00 per share × 100 shares = $500 per contract. If MSFT rockets to $500, your put expires worthless and you lose exactly $500 — no more. This defined maximum loss is the core advantage of buying options over short selling stock.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Strike and Expiry Selection: The Critical Choices",
          content:
            "The two decisions that matter most when buying options:\n\n**Strike Selection:**\n- **ATM (delta 0.45–0.55):** Highest extrinsic value, most theta decay, but responds well to any directional move. Best for shorter timeframes with strong conviction.\n- **Slightly OTM (delta 0.30–0.45):** Lower cost, higher percentage return if the move occurs, more likely to expire worthless. Good for defined catalysts.\n- **ITM (delta 0.65–0.80):** Acts more like stock, less extrinsic value to lose, requires smaller move to profit. Best for position replacements ('stock replacement strategy').\n\n**Expiry Selection:**\n- Rule of thumb: buy at least **2× the time you expect to need**. If you think a move happens in 2 weeks, buy 4-week options.\n- Avoid options expiring within 7 days unless it is a specific same-day event play\n- 30–60 DTE (days-to-expiry) is the sweet spot for most directional trades\n- LEAPS (1-2 year options) are used for long-term stock replacement with minimal theta drag\n\n**The golden rule:** Never let a long option expire worthless without deciding to — always make an active decision to close or roll. An option losing 50% is often better sold than held to zero.",
          highlight: [
            "strike selection",
            "expiry",
            "DTE",
            "LEAPS",
            "stock replacement",
          ],
        },
        {
          type: "teach",
          title: "Managing Winners: The 50% and 21-Day Rules",
          content:
            "Professional options traders have clear rules for managing winners — departing early and letting the market work for you.\n\n**The 50% Rule (for long options):**\nClose the position when it has gained 50% of its cost. If you paid $4.00 for a call and it's now $6.00, close it. Sounds counterintuitive, but:\n- You lock in a 50% gain in real dollars\n- You eliminate the risk of giving back gains if the stock reverses\n- You free up capital for the next trade\n\n**The 21-Day Rule:**\nClose or roll any long option position when it reaches 21 DTE (days to expiry). Inside 21 days, theta decay accelerates dramatically and gamma risk spikes. There is rarely a good reason to hold a long option into the final three weeks unless you are targeting a specific expiry event.\n\n**Realistic expectations:**\n- Buying options has a naturally low win rate (40–50% for typical setups)\n- The key is that winners must be larger than losers\n- A typical professional long-options approach: 45% win rate, average winner 2× average loser = positive expectancy\n\n**Common mistake:** Holding losing options hoping for a recovery. A $400 option that falls to $100 needs a 300% gain to get back to even. Often better to cut losses at -50% and redeploy.",
          highlight: [
            "50% rule",
            "21-day rule",
            "managing winners",
            "theta acceleration",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "To maximize profit, you should always hold a long call option until expiration to give the stock the maximum time to move in your favor.",
          correct: false,
          explanation:
            "False. Holding to expiry is usually suboptimal for long option buyers. As expiry approaches, theta decay accelerates and extrinsic value evaporates — you often lose more to time decay than you gain from any stock movement. Most professionals close long options at 50% gain or when 21 days remain, whichever comes first. This strategy preserves capital and maintains a healthy expectancy over time.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You bought an AAPL $160 call for $4.00 with 45 DTE when AAPL was at $155. After 2 weeks, AAPL has risen to $163 and your call is now worth $6.20. There are 31 DTE remaining.",
          question:
            "Based on professional options management principles, what should you do?",
          options: [
            "Close the position — you've gained 55% and should lock in the profit",
            "Hold to expiry — AAPL could go much higher",
            "Buy more calls to increase your position size",
            "Roll to a higher strike to reduce cost basis",
          ],
          correctIndex: 0,
          explanation:
            "You have a $2.20 gain on a $4.00 investment = 55% profit. The 50% profit-taking rule says to close here. You've captured the bulk of the move, still have 31 DTE (above the 21-day threshold where theta accelerates), and locking in a $220/contract gain is superior to risking a reversal. Greed — hoping AAPL goes to $175 — is the most common reason options traders give back hard-won gains.",
          difficulty: 2,
        },
      ],
    },

    /* ================================================================
       LESSON 5 — Selling Options
       ================================================================ */
    {
      id: "options-complete-5",
      title: "Selling Options",
      description:
        "Covered calls, cash-secured puts, income generation, and assignment risk",
      icon: "TrendingDown",
      xpReward: 85,
      steps: [
        {
          type: "teach",
          title: "Why Sell Options? The Statistical Edge",
          content:
            "Options buyers need the stock to move significantly in their direction within a limited time. That is hard. **Option sellers** have a built-in advantage: they collect premium and profit if the stock does *nothing* — or even moves moderately against them.\n\nStatistical edge of option sellers:\n- Roughly 70–80% of options expire worthless (depending on the study and strike selection)\n- Sellers collect theta every single day — even on weekends\n- Selling captures the **Implied Volatility premium**: IV is typically higher than Realized Volatility, meaning options are priced for bigger moves than actually occur\n\n**But selling has risks:** While buyers risk only their premium, sellers can face large losses when stocks make big unexpected moves. This is why responsible option selling always involves defined risk or adequate collateral.\n\n**Two conservative, beginner-friendly strategies:**\n1. **Covered Call**: Sell a call against shares you already own\n2. **Cash-Secured Put**: Sell a put while holding enough cash to buy the stock if assigned\n\nBoth strategies generate income while keeping risk bounded.",
          highlight: [
            "option sellers",
            "theta",
            "covered call",
            "cash-secured put",
            "assignment",
          ],
        },
        {
          type: "teach",
          title: "The Covered Call: Getting Paid to Own Stock",
          content:
            "A **covered call** involves holding 100 shares of a stock and selling 1 call option against those shares.\n\n**Example:** You own 100 shares of AAPL at $150/share ($15,000 invested). You sell the $155 call (30 DTE) for $2.50 per share, collecting **$250 immediately**.\n\nOutcomes at expiry:\n1. **AAPL stays below $155:** The call expires worthless, you keep the $250 premium. Your shares are untouched. Effective cost basis reduced to $147.50/share.\n2. **AAPL rises above $155 (say $162):** You are **assigned** — forced to sell your 100 shares at $155. You receive $15,500 + $250 premium = $15,750 total. You miss the gain from $155 to $162 ($700), but still made $750 ($500 stock gain + $250 premium).\n3. **AAPL falls to $140:** Your shares are now worth $14,000 (a $1,000 paper loss). The $250 premium partially offsets this — net loss is $750 instead of $1,000.\n\n**The trade-off:** You cap your upside at the strike price in exchange for consistent premium income. Covered calls work best on stocks you are comfortable holding long-term and do not expect to rally sharply.\n\n**Annualized return:** Collecting $250/month on a $15,000 position = 1.67%/month = **~20% annualized** from premium alone.",
          highlight: [
            "covered call",
            "assignment",
            "income generation",
            "cost basis reduction",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You own 100 shares of MSFT at $380 and sell the $390 call for $4.50. MSFT rises to $402 at expiry. What is your total profit or loss on the combined position?",
          options: [
            "+$1,450 ($1,000 stock gain + $450 premium, capped at $390 strike)",
            "+$2,200 ($2,200 stock gain unrealized)",
            "+$450 (only the premium, stock gain is forfeited entirely)",
            "-$4,550 (the option assignment causes a loss)",
          ],
          correctIndex: 0,
          explanation:
            "You bought at $380, are assigned (forced to sell) at $390 = +$1,000 on the stock. Plus the $450 premium collected = **+$1,450 total**. You miss the extra $12 gain from $390 to $402, which costs you $1,200 of forgone profit. This 'capped upside' is the defining trade-off of covered calls — you accept a ceiling on gains in exchange for premium income and slight downside protection.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Cash-Secured Put: Getting Paid to Buy Stock You Want",
          content:
            "A **cash-secured put** involves selling a put option while holding enough cash to purchase the shares if assigned. It is essentially getting paid to agree to buy a stock at a lower price.\n\n**Example:** AAPL is at $150. You would love to own it at $140 (a 6.7% discount). You sell the $140 put (30 DTE) for $2.00 per share, collecting **$200 immediately**. You keep $14,000 in cash as collateral (enough to buy 100 shares at $140).\n\nOutcomes at expiry:\n1. **AAPL stays above $140:** The put expires worthless, you keep the $200 premium. Run it again next month!\n2. **AAPL falls below $140 (say $132):** You are assigned — you buy 100 shares at $140. Net cost basis = $140 - $2 premium = **$138/share**. You now own shares at a better price than if you had simply bought at $150.\n3. **AAPL crashes to $100:** You are still assigned at $140 (a loss of $40/share minus $2 premium = $38 loss). This is the real risk — assignment during a sharp decline.\n\n**The CSP philosophy:** Only sell puts on stocks you genuinely want to own at the strike price. The premium is not free money — it is compensation for the obligation to buy.\n\n**Wheel Strategy**: Covered call → assignment → CSP → assignment → covered call. This cycle can generate consistent monthly income on stocks you are fundamentally bullish on.",
          highlight: [
            "cash-secured put",
            "assignment risk",
            "wheel strategy",
            "income",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "A cash-secured put seller always profits because the stock rarely drops to the strike price.",
          correct: false,
          explanation:
            "False — dangerous thinking. While many puts do expire worthless, assignment is a real risk. If the stock drops well below your strike, you are obligated to buy shares at above-market prices, potentially resulting in large losses that dwarf the premium collected. ONLY sell puts on stocks you genuinely want to own at the strike price, and size positions so that even if assigned, the holding represents an acceptable portfolio allocation.",
          difficulty: 1,
        },
        {
          type: "teach",
          title: "Assignment Risk: What Really Happens",
          content:
            "**Assignment** is when an option seller is required to fulfill their obligation:\n- Call seller assigned: must sell 100 shares at the strike to the call buyer\n- Put seller assigned: must buy 100 shares at the strike from the put buyer\n\n**When does assignment happen?**\n- **American-style options** (most stock options) can be assigned any time — but in practice, assignment almost always occurs at expiry or when an option goes deep ITM with minimal extrinsic value remaining\n- **European-style options** (SPX index options) can only be assigned at expiry\n\n**Early assignment warning signs:**\n- Your short call goes deep ITM (delta > 0.90)\n- The stock is about to pay a **dividend** — call holders often exercise early to capture the dividend\n- Very little extrinsic value remains (< $0.05)\n\n**Managing assignment:**\n- Buy back the option before expiry if you want to avoid assignment ($0.10–$0.05 is cheap insurance)\n- Roll the option to a later date and/or different strike before expiry\n- Let it happen if you are comfortable with the outcome (selling at strike for covered call, or buying at strike for CSP)\n\nRemember: assignment is not inherently bad — it is a planned outcome of your strategy.",
          highlight: [
            "assignment",
            "American-style",
            "early assignment",
            "dividend",
            "rolling",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You sold a NVDA $450 covered call for $8.00 when NVDA was at $440. NVDA is now at $448 with 5 days to expiry. Your broker shows the call is worth $5.20. You are concerned about assignment.",
          question:
            "What is the most sensible action, and what would it cost?",
          options: [
            "Buy to close for $5.20, locking in $2.80/share profit ($280 net gain) while avoiding assignment uncertainty",
            "Do nothing — assignment at $450 is profitable",
            "Sell more calls to hedge",
            "Exercise your long shares to prevent assignment",
          ],
          correctIndex: 0,
          explanation:
            "Buying back for $5.20 costs $520 against $800 collected = $280 profit locked in per contract. With 5 days left, NVDA could spike above $450 on news and trigger assignment, forcing you to sell shares at $450. If you want to keep your shares (maybe expecting further upside), spending $520 to guarantee it makes sense. If you're comfortable being called away at $450, letting it ride is also valid. The key: always make an active, conscious decision rather than hoping for the best.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 6 — Spreads for Beginners
       ================================================================ */
    {
      id: "options-complete-6",
      title: "Spreads for Beginners",
      description:
        "Bull call spreads, bear put spreads, defined risk and reward, max profit and loss",
      icon: "Layers",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "Why Use Spreads?",
          content:
            "A **spread** combines two options on the same underlying to create a position with defined risk AND defined reward. Spreads solve the biggest problem with buying single options: the cost (and rapid decay) of extrinsic value.\n\n**The core idea:** Buy one option, sell another option at a different strike to offset some of the cost. The sold option reduces your cost basis but also caps your maximum profit.\n\n**Key advantages of spreads:**\n1. **Lower cost** — the short leg (sold option) offsets premium paid for the long leg\n2. **Defined maximum loss** — you can never lose more than you paid for the spread\n3. **Reduced theta decay** — you are collecting theta from the short leg, partially offsetting decay on the long leg\n4. **Lower IV sensitivity** — long and short vega partially cancel, reducing IV crush risk\n\n**The trade-off:** You cap your maximum profit at the width of the spread minus premium paid. Spreads are **probability trades**, not lottery tickets.",
          highlight: ["spread", "defined risk", "long leg", "short leg", "capped profit"],
        },
        {
          type: "teach",
          title: "The Bull Call Spread: Bullish with Defined Risk",
          content:
            "A **bull call spread** (also called a **vertical debit spread**) profits when the stock rises moderately. You buy a lower-strike call and sell a higher-strike call on the same expiry.\n\n**Example:** AAPL at $150, expecting a move to $160 over the next month.\n- **Buy** the $150 call for $5.00\n- **Sell** the $160 call for $2.00\n- **Net debit (cost):** $5.00 - $2.00 = **$3.00 per share ($300 per spread)**\n\nCalculations:\n- **Max loss:** $300 (the net debit paid) — occurs if AAPL closes below $150 at expiry\n- **Max profit:** ($160 - $150) - $3.00 = **$7.00 per share ($700 per spread)** — occurs if AAPL closes at or above $160\n- **Break-even:** $150 + $3.00 = **$153 at expiry**\n\n**Risk/Reward:** Risking $300 to make $700 = 2.33:1. Compare to buying the $150 call alone for $500 — the spread costs less and reduces your exposure.\n\n**When to use:** Moderately bullish outlook, IV is average or elevated, you want to reduce cost vs. buying a single call.",
          highlight: [
            "bull call spread",
            "vertical debit spread",
            "net debit",
            "max profit",
            "max loss",
            "break-even",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You create a bull call spread on MSFT: Buy $400 call for $8.00, Sell $415 call for $3.50. MSFT expires at $420. What is your profit per share?",
          options: ["$10.50", "$15.00", "$4.50", "$8.00"],
          correctIndex: 0,
          explanation:
            "Net debit = $8.00 - $3.50 = $4.50. At expiry, spread width = $415 - $400 = $15 (max width). Since MSFT ($420) is above the upper strike ($415), you realize the full max width: $15.00. Profit = $15.00 - $4.50 (cost) = **$10.50 per share ($1,050 per spread)**. The stock exceeded your upper strike, so you capped out at full width — great outcome.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Bear Put Spread: Bearish with Defined Risk",
          content:
            "A **bear put spread** profits when the stock falls moderately. You buy a higher-strike put and sell a lower-strike put on the same expiry.\n\n**Example:** META at $300, expecting a pullback to $280 over the next month.\n- **Buy** the $300 put for $6.00\n- **Sell** the $280 put for $2.50\n- **Net debit:** $6.00 - $2.50 = **$3.50 per share ($350 per spread)**\n\nCalculations:\n- **Max loss:** $350 — occurs if META closes above $300 at expiry (puts worthless)\n- **Max profit:** ($300 - $280) - $3.50 = **$16.50 per share ($1,650 per spread)** — occurs if META closes at or below $280\n- **Break-even:** $300 - $3.50 = **$296.50 at expiry**\n\n**Comparing to a long put alone:**\n- Buying the $300 put alone costs $600\n- Bear put spread costs only $350 — 42% cheaper\n- Trade-off: you cap profit at $280 strike, missing gains if META crashes to $250\n\n**When to use:** Moderately bearish outlook, expecting a specific pullback target, want to reduce cost vs. buying a standalone put.",
          highlight: [
            "bear put spread",
            "vertical debit spread",
            "net debit",
            "max profit",
            "break-even",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "In a bull call spread, your maximum loss is the total width of the spread (e.g., $15 for a 400/415 spread).",
          correct: false,
          explanation:
            "The maximum loss on a bull call spread is the net debit paid, not the spread width. If you buy the $400 call for $8 and sell the $415 call for $3.50, you paid $4.50 net. That $4.50 is your maximum loss — what you paid. The spread width of $15 is the maximum profit potential (before subtracting the cost). Max profit = spread width - net debit = $15 - $4.50 = $10.50.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The Credit Spread: Getting Paid Upfront",
          content:
            "A **credit spread** is the inverse of a debit spread — you collect money upfront instead of paying it. You sell the closer-to-the-money option and buy a further OTM option as a hedge.\n\n**Bull Put Spread** (bullish credit spread):\n- Sell the $145 put for $3.00\n- Buy the $140 put for $1.50 (protection if stock crashes)\n- **Net credit collected: $1.50 per share ($150 per spread)**\n\nOn AAPL at $150, you profit if AAPL stays above $145 at expiry.\n- Max profit: $150 (the credit received) — if both puts expire worthless\n- Max loss: ($145 - $140) - $1.50 = **$3.50 per share ($350 per spread)**\n- Break-even: $145 - $1.50 = **$143.50**\n\n**The math:** You collect $150 to risk $350. Win probability? AAPL needs to stay above $143.50 — a 4.3% cushion from current price. The $145 put has roughly 30% probability of being ITM at expiry, so you win approximately 70% of the time.\n\nCredit spreads are extremely popular income strategies because they require the stock to stay out of a zone (above the short put for bull put spreads, below the short call for bear call spreads).",
          highlight: [
            "credit spread",
            "bull put spread",
            "bear call spread",
            "net credit",
            "income",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "GOOGL is at $170. You create a bull put spread: Sell the $160 put for $3.20, Buy the $150 put for $1.40. You collect a net credit of $1.80 per share ($180 per spread). At expiry, GOOGL closes at $158.",
          question: "What is your profit or loss on this spread at expiry?",
          options: [
            "-$20 per spread (small loss, short put partially ITM)",
            "+$180 (full credit — stock above $150)",
            "-$820 (maximum loss)",
            "+$180 profit on the long put, offset by loss",
          ],
          correctIndex: 0,
          explanation:
            "At expiry with GOOGL at $158: The $160 put is $2 ITM ($160 - $158 = $2 intrinsic). The $150 put expires worthless. The spread is worth $2.00 (the $160 put value minus the worthless $150 put). You collected $1.80 credit, so you must pay $2.00 to close = net loss of **$0.20 per share ($20 per spread)**. Not a disaster — GOOGL pierced your short strike but stayed well above the long put at $150, limiting losses. Max loss would be $8.20 ($10 width - $1.80 credit) if GOOGL had fallen below $150.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 7 — Volatility as an Asset
       ================================================================ */
    {
      id: "options-complete-7",
      title: "Volatility as an Asset",
      description:
        "IV vs HV, selling overpriced volatility, earnings plays, and IV crush",
      icon: "Zap",
      xpReward: 90,
      steps: [
        {
          type: "teach",
          title: "Two Types of Volatility",
          content:
            "**Volatility** is one of the most misunderstood concepts in options trading. There are two fundamentally different types:\n\n**Historical Volatility (HV)** — also called Realized Volatility:\n- Measures how much the stock *actually moved* over a past period\n- Calculated from actual price data: the annualized standard deviation of daily returns\n- Example: AAPL's 30-day HV is 22%, meaning in the past month, AAPL moved an annualized 22%\n- HV is backward-looking — it tells you what happened\n\n**Implied Volatility (IV)**:\n- Extracted from current option prices using an options pricing model (Black-Scholes)\n- Represents the market's *expectation* of future volatility\n- Example: AAPL's 30-day IV is 28%, meaning options are priced as if AAPL will move 28% annualized\n- IV is forward-looking — it tells you what the market expects\n\n**The IV Premium:**\nHistorically, IV runs higher than HV roughly 80% of the time. The difference (IV - HV) is the **volatility risk premium** — the extra cost investors pay for options insurance.\n\nThis premium is the statistical foundation of option selling strategies. If IV consistently overstates future moves, selling options captures this premium over time.",
          highlight: [
            "historical volatility",
            "implied volatility",
            "volatility risk premium",
            "realized volatility",
          ],
        },
        {
          type: "teach",
          title: "IV Rank and IV Percentile",
          content:
            "Raw IV numbers (25%, 45%, 80%) mean little without context. A stock that typically trades at 60% IV is 'calm' at 70%, while a usually-quiet stock at 35% IV might be extremely elevated.\n\n**IV Rank (IVR):**\nCompares current IV to its 52-week range.\nIVR = (Current IV - 52-week Low IV) / (52-week High IV - 52-week Low IV) × 100\n\nExample: AAPL's IV range over 52 weeks: low = 18%, high = 45%. Current IV = 36%.\nIVR = (36 - 18) / (45 - 18) × 100 = 18/27 × 100 = **67** — IV is in the 67th percentile of its 52-week range.\n\n**IV Percentile:**\nThe percentage of days in the past year where IV was below the current level.\nIf IV Percentile = 85, then IV is higher today than on 85% of all days in the past year.\n\n**How to use IVR:**\n- IVR > 50: IV is elevated → consider **selling** strategies (covered calls, CSPs, credit spreads)\n- IVR < 30: IV is low → consider **buying** strategies (debit spreads, long calls/puts)\n- IVR near 0: IV is at its lowest — options are 'on sale', great for buying premium ahead of a catalyst",
          highlight: [
            "IV rank",
            "IV percentile",
            "52-week range",
            "selling strategies",
            "buying strategies",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "TSLA's 52-week IV range is 40%–90%. Current IV is 75%. What is TSLA's IV Rank, and what strategy does it suggest?",
          options: [
            "IVR = 70; consider selling strategies (IV is elevated)",
            "IVR = 75; IV is low, buy options",
            "IVR = 50; IV is neutral, hold cash",
            "IVR = 90; IV is at maximum, avoid options",
          ],
          correctIndex: 0,
          explanation:
            "IVR = (75 - 40) / (90 - 40) × 100 = 35/50 × 100 = **70**. An IVR of 70 means IV is elevated — in the 70th percentile of its annual range. This is a favorable environment for selling strategies: covered calls, cash-secured puts, and credit spreads. You are selling options that are priced expensively relative to history, giving you a statistical edge as mean-reversion tends to bring IV back lower.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Earnings Plays: The Most Dangerous IV Environment",
          content:
            "**Earnings announcements** are the most concentrated IV event in options trading. In the days leading up to a company's quarterly earnings report, IV typically spikes dramatically as the market prices in the uncertainty.\n\n**The Earnings IV Cycle:**\n1. IV rises steadily as earnings approach (sometimes doubling in 2 weeks)\n2. On earnings day, options are priced for a large move (the 'expected move')\n3. **Immediately after earnings**, regardless of outcome, IV collapses back to normal (**IV crush**)\n\n**Expected Move:**\nOptions market's consensus estimate of how much the stock will move on earnings:\nExpected Move = ATM Call + ATM Put (roughly)\nExample: NVDA at $480 with ATM straddle priced at $28 → market expects ±$28 (±5.8%) move\n\n**IV Crush in Action:**\nNVDA announces earnings: stock rises from $480 to $495 (+3.1%). But IV collapses from 75% to 30%.\n- The $480 call that cost $22 pre-earnings is now worth $15 (has $15 intrinsic) — you LOST money despite being right on direction\n- The collapse in extrinsic value overwhelmed the intrinsic gain\n\n**Professional approaches to earnings:**\n1. Sell straddles/strangles to harvest IV crush (defined risk with spreads)\n2. Buy options before IV spikes (very early)\n3. Avoid buying options the week before earnings — you are paying the IV spike premium",
          highlight: [
            "earnings",
            "IV crush",
            "expected move",
            "IV spike",
            "straddle",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "If a stock beats earnings estimates and rises 5%, buying call options before earnings is guaranteed to be profitable.",
          correct: false,
          explanation:
            "Not at all — this is one of the most common and painful options mistakes. If the market expected a ±8% move (priced into the options via elevated IV) and the stock only moved 5%, option buyers lose despite being correct on direction. The IV collapse (crush) after earnings destroys extrinsic value faster than the 5% gain adds intrinsic value. You must be right on both direction AND magnitude relative to the expected move to profit from buying options into earnings.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "The VIX: The Market's Fear Gauge",
          content:
            "The **VIX** (CBOE Volatility Index) measures the 30-day implied volatility of S&P 500 index options. It is widely called the 'market's fear gauge.'\n\n**Interpretation:**\n- VIX < 15: Complacency, low fear, markets calm\n- VIX 15–25: Normal market conditions\n- VIX 25–35: Elevated fear, meaningful uncertainty\n- VIX > 35: High fear/panic (rarely sustained; 2008 financial crisis peaked at 80, 2020 COVID hit 85)\n\n**VIX and S&P 500:**\nVIX and the S&P 500 have a strong negative correlation (-0.75 historically). When stocks fall sharply, put buying spikes, pushing VIX higher. This creates the classic 'fear' reading.\n\n**Trading the VIX regime:**\n- High VIX (>30): Individual stock options are also elevated. Selling premium can be very lucrative but the market is telling you something is wrong. Risk management is critical.\n- Low VIX (<15): Cheap to buy options; good time to buy protection (protective puts) or speculate on catalysts\n\n**The VIX term structure:** Short-dated VIX futures are often cheaper than long-dated ones (contango) in normal markets, and inverted (backwardation) during panic.",
          highlight: [
            "VIX",
            "fear gauge",
            "contango",
            "backwardation",
            "S&P 500",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "You notice the VIX is at 32 (elevated) after a market selloff. AAPL's IV Rank is 88. You are considering two strategies: (A) Buy an AAPL 30-day ATM call for $8.00, or (B) Sell an AAPL 30-day $145/$135 bull put spread for a $3.20 credit.",
          question:
            "Which strategy better suits the current high-IV environment, and why?",
          options: [
            "Strategy B — high IV makes options expensive to buy; selling credit spreads harvests the elevated IV premium",
            "Strategy A — high IV means bigger moves expected, making calls more profitable",
            "Strategy A — you should always buy calls when the VIX is high",
            "Neither — avoid all options when VIX is above 30",
          ],
          correctIndex: 0,
          explanation:
            "With IVR at 88 and VIX at 32, options are priced expensively relative to history. Buying calls at $8.00 means you are paying a high premium that will collapse if IV reverts to normal — even without the stock moving against you. Strategy B (selling a bull put spread) collects this elevated premium, has defined risk ($6.80 max loss on a $10 wide spread), and profits if AAPL stays above $141.80 ($145 - $3.20 credit). High IV environments statistically favor sellers, not buyers.",
          difficulty: 3,
        },
      ],
    },

    /* ================================================================
       LESSON 8 — Building an Options Strategy
       ================================================================ */
    {
      id: "options-complete-8",
      title: "Building an Options Strategy",
      description:
        "Selecting expiry, strike selection, position sizing, and when to close",
      icon: "Target",
      xpReward: 100,
      steps: [
        {
          type: "teach",
          title: "A Framework for Every Options Trade",
          content:
            "Every options trade should answer six questions before you click the order button:\n\n1. **What is my directional bias?** (Bullish / Bearish / Neutral)\n2. **What is my catalyst and timeframe?** (Earnings in 2 weeks, breakout today, long-term trend)\n3. **What is the IV environment?** (IVR high → sell premium; IVR low → buy premium)\n4. **How much am I risking?** (Never more than 1-3% of account on one trade)\n5. **What is my exit plan for winners AND losers?** (Define before entry, not after)\n6. **Which strategy fits this setup?** (Single options vs. spreads vs. selling)\n\nWithout a systematic process, options trading becomes gambling. With it, you build a **positive expectancy system** — one that makes money over many trades even with imperfect individual outcomes.\n\nProfessional traders often say the setup doesn't matter if the management is poor. A mediocre setup managed perfectly beats a great setup managed emotionally.",
          highlight: [
            "directional bias",
            "catalyst",
            "IV environment",
            "position sizing",
            "exit plan",
            "positive expectancy",
          ],
        },
        {
          type: "teach",
          title: "Expiry Selection: The Time Horizon Decision",
          content:
            "Selecting the right expiry is as important as strike selection. Each timeframe has a distinct risk/reward profile:\n\n**0–7 DTE (Same-week options):**\n- Extremely high gamma — small moves create large percentage swings\n- Very high theta decay — premium evaporates quickly\n- For: Experienced traders targeting specific intraday/same-week catalysts\n- Against: Most likely to expire worthless; not for beginners\n\n**7–21 DTE:**\n- High gamma, accelerating theta\n- Best for: Earnings plays (buying just before, selling just after), short-term momentum plays\n- Maximum theta capture for credit spread sellers\n\n**21–45 DTE (The 'sweet spot' for most strategies):**\n- Balanced theta decay and directional exposure\n- Industry standard for premium selling (covered calls, CSPs, credit spreads)\n- Gives directional trades time to develop without excessive time decay\n\n**45–90 DTE:**\n- Lower theta, higher vega sensitivity\n- Best for: Buying options when IV is low and you expect a big move\n- Gives more runway for directional calls/puts\n\n**6–24 months (LEAPS):**\n- Minimal theta relative to premium\n- Used as stock replacement (high delta LEAPS mimic shares at fraction of capital)\n- Best for: Long-term bullish/bearish views with limited capital",
          highlight: ["DTE", "0DTE", "LEAPS", "theta", "sweet spot", "21-45 DTE"],
        },
        {
          type: "teach",
          title: "Strike Selection by Strategy",
          content:
            "The right strike depends on your strategy and risk tolerance:\n\n**For buying single options (directional trades):**\n- Conservative: ITM, delta 0.65–0.75 (acts like stock, less theta risk)\n- Balanced: Slight OTM, delta 0.40–0.50 (good leverage, reasonable cost)\n- Aggressive: OTM, delta 0.20–0.35 (cheaper, needs larger move, higher percentage gain if correct)\n\n**For credit spreads (income/probability plays):**\n- Short strike at delta 0.15–0.30 (70–85% probability of expiring OTM)\n- This balances acceptable premium against reasonable win probability\n- Higher delta shorts (0.35+) collect more premium but have lower success rates\n\n**For covered calls:**\n- Conservative: OTM by 3–5% (less assignment risk, lower premium)\n- Aggressive: ATM or slightly OTM (more premium but frequently called away)\n- Decide: do you want premium income or stock appreciation? You cannot maximize both simultaneously\n\n**For cash-secured puts:**\n- Strike at a level you genuinely want to own the stock\n- OTM puts at 5–10% below market provide a discount on acquisition\n- ATM puts maximize premium but guarantee assignment in any market weakness",
          highlight: [
            "delta",
            "strike selection",
            "credit spreads",
            "covered calls",
            "cash-secured puts",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "You are selling a 30-day bull put spread on AAPL (currently at $165) and want approximately a 75% probability of profit. Which short put strike should you target?",
          options: [
            "~$155 (delta 0.25 → 75% chance of expiring OTM)",
            "~$165 (delta 0.50 → ATM)",
            "~$170 (delta 0.65 → slightly ITM)",
            "~$150 (delta 0.10 → deep OTM)",
          ],
          correctIndex: 0,
          explanation:
            "Delta approximates the probability of expiring in-the-money. A 0.25 delta short put has roughly 25% probability of expiring ITM, meaning approximately 75% probability it expires worthless — your maximum profit scenario. The $155 strike (~10 points OTM, 6% below current price) is a reasonable target. The 0.50 delta (ATM) gives only 50% probability. The deep OTM at 0.10 collects too little premium to justify the trade.",
          difficulty: 2,
        },
        {
          type: "teach",
          title: "Position Sizing for Options",
          content:
            "Options leverage amplifies both gains and losses — which makes position sizing even more critical than for stocks.\n\n**The 1-3% Rule:**\nRisk no more than 1–3% of total account value on any single options position.\n- $50,000 account: max risk per trade = $500–$1,500\n- If buying a call for $4.00 ($400/contract) and you risk the full premium: 1 contract at $400 = 0.8% of $50K ✓\n- Never let 'high conviction' push you above 5% in a single options trade\n\n**Calculating real risk for spreads:**\nMax loss = spread width - credit received\nExample: $10 wide bull put spread, collected $2.50 credit → max loss = $7.50/share ($750/contract)\nFor a $50K account at 2% risk: $1,000 / $750 = 1.33 contracts → buy 1 contract\n\n**The Notional Trap:**\nDo not size by notional value of the underlying. A single $4 call controls $15,000 of AAPL stock. Do NOT think 'I'm only spending $400.' Think 'I am at risk of losing $400 AND this controls $15,000 of AAPL.' The leverage cuts both ways.\n\n**Portfolio theta target:**\nMany professional traders target portfolio theta of 0.1–0.2% of account per day from selling premium.\n$50K account: daily theta target = $50–$100. This generates consistent income without over-concentration.",
          highlight: [
            "position sizing",
            "1-3% rule",
            "max risk",
            "notional",
            "portfolio theta",
          ],
        },
        {
          type: "teach",
          title: "When to Close: The Complete Decision Framework",
          content:
            "**For long options (debit trades):**\n- Take profit at 25–50% gain (captured most of the realistic upside)\n- Cut loss at 50% of premium paid (if your $400 call falls to $200, close it)\n- Always close before 21 DTE to avoid accelerating theta and pin risk\n- Close immediately if your thesis is invalidated (e.g., your bullish call setup breaks key support)\n\n**For short options / credit trades:**\n- Take profit at 50% of max credit (if you collected $200, close at $100 cost = $100 profit)\n- This dramatically improves win rate by not holding to expiry and risking reversals\n- Close or roll when tested: if stock approaches your short strike, don't freeze\n- Roll in space (further OTM same expiry) or in time (same strike, later expiry) to manage positions\n\n**The Two Worst Behaviors:**\n1. **Letting winners become losers**: A 60% gain that becomes a 20% loss through hope\n2. **Holding losers to expiry**: A small manageable loss that becomes a max loss through denial\n\n**The adjustment toolkit:**\n- **Roll out**: same strike, later expiry (buy more time)\n- **Roll up/down**: same expiry, better strike (adjust directional bias)\n- **Add a leg**: convert a single option to a spread to define/reduce risk\n- **Close and re-evaluate**: sometimes the right answer is to exit and look at the chart fresh",
          highlight: [
            "take profit",
            "cut loss",
            "rolling",
            "roll out",
            "adjustment",
            "21 DTE",
          ],
        },
        {
          type: "quiz-tf",
          statement:
            "When your short credit spread approaches max loss, the best action is always to hold it and hope the stock reverses, since options can change value rapidly.",
          correct: false,
          explanation:
            "Hope is not a strategy. When a short credit spread approaches max loss, your choices are: (1) close the spread and accept the loss — preserving capital for future trades, (2) roll the spread to a later expiry or better strikes if the thesis is still intact, or (3) adjust by buying the stock or adding a long option to hedge. 'Hoping it reverses' results in max losses more often than not. The key principle: define your adjustment/exit triggers BEFORE you put on the trade.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You have a $75,000 account. You sell a 35-DTE AAPL bull put spread: sell $155 put for $3.00, buy $145 put for $1.20. Net credit = $1.80/share. AAPL is at $165. After 2 weeks, AAPL is at $163 and the spread can be closed for $0.90 debit.",
          question:
            "What is your profit if you close now, and is this consistent with professional spread management?",
          options: [
            "Profit: $90/spread (50% of credit captured); yes, this is textbook 50% profit-taking",
            "Profit: $180/spread (100% — should wait for full profit)",
            "Loss: $90 (closing early is always suboptimal)",
            "Profit: $90 but the 21-day rule says you must hold",
          ],
          correctIndex: 0,
          explanation:
            "You collected $1.80 credit. Closing at $0.90 debit = $0.90 net profit per share = $90 per contract. That is exactly 50% of max credit — the professional standard for taking profits on short spreads. You have 21 DTE remaining (approaching the 21-day rule threshold), and taking 50% profit removes the risk of a late reversal eating your gains. This is efficient use of capital: lock in $90, free up $1,000 of buying power for the next trade. Waiting for full profit on a credit spread frequently leads to giving back gains.",
          difficulty: 3,
        },
      ],
    },
  ],
};
