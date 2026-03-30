import type { Unit } from "./types";

export const UNIT_PERSONAL_FINANCE_MASTERY: Unit = {
  id: "personal-finance-mastery",
  title: "Personal Finance Mastery",
  description:
    "Budgeting, debt strategy, retirement accounts, insurance, and tax-efficient investing",
  icon: "Wallet",
  color: "#f97316",
  lessons: [
    // ─── Lesson 1: Budgeting & Saving ────────────────────────────────────────
    {
      id: "pf-1",
      title: " Budgeting & Saving",
      description:
        "Master the 50/30/20 rule, emergency funds, and paying yourself first",
      icon: "PiggyBank",
      xpReward: 75,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: " The 50/30/20 Rule",
          content:
            "The **50/30/20 rule** is the most popular personal budgeting framework:\n\n**50% Needs**: Rent, groceries, utilities, insurance, minimum debt payments — essentials you can't skip.\n\n**30% Wants**: Dining out, entertainment, subscriptions, hobbies — enjoyable but optional.\n\n**20% Savings & Investing**: Emergency fund, retirement contributions, index funds, extra debt paydown.\n\nOn a $5,000/month take-home: $2,500 for needs, $1,500 for wants, $1,000 for savings. Adjust ratios if you live in a high-cost city.",
          highlight: ["50/30/20", "needs", "wants", "savings"],
          visual: "portfolio-pie",
        },
        {
          type: "teach",
          title: " The Emergency Fund",
          content:
            "An **emergency fund** is 3–6 months of living expenses kept in a **high-yield savings account (HYSA)**. It's your financial shock absorber.\n\nWhy it matters:\n- Job loss, medical bills, or car repairs don't become debt emergencies\n- You can invest without fear — knowing you're covered\n- HYSAs currently pay 4–5% APY (vs. 0.01% at big banks)\n\n**Pay Yourself First**: Automate a savings transfer the day you're paid. Don't rely on willpower to save what's left — there's never anything left.",
          highlight: ["emergency fund", "high-yield savings", "pay yourself first"],
        },
        {
          type: "teach",
          title: " Building the Saving Habit",
          content:
            "**Three pillars of sustainable saving:**\n\n1. **Automation**: Set up automatic transfers on payday. Saving becomes invisible and effortless.\n\n2. **High-Yield Savings**: Park your emergency fund and short-term savings in an HYSA — not a big-bank account paying near zero.\n\n3. **Track spending**: Use an app or spreadsheet to see where money leaks. Most people underestimate dining and subscriptions by 30–40%.\n\nThe goal is not deprivation — it's intentionality. Spend freely on your priorities; cut ruthlessly on everything else.",
          highlight: ["automation", "high-yield savings", "track spending"],
        },
        {
          type: "quiz-mc",
          question:
            "Under the 50/30/20 rule, where does a Netflix subscription belong?",
          options: [
            "Wants (30%) — it's entertainment",
            "Needs (50%) — it's a utility",
            "Savings (20%) — it builds value",
            "None of the categories",
          ],
          correctIndex: 0,
          explanation:
            "A streaming subscription is a 'want' — enjoyable but not essential. You could live without it. Categorizing correctly helps you find easy cuts when budgets are tight.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "You should start investing in stocks before building a 3-month emergency fund.",
          correct: false,
          explanation:
            "No — the emergency fund comes first. Without it, an unexpected expense forces you to sell investments (possibly at a loss) or take on debt. The emergency fund is the foundation of every financial plan.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Priya earns $4,000/month after tax. Her rent is $1,400, groceries $350, utilities $150, car insurance $120, and she has a $200 minimum student loan payment. She spends $900 on dining and shopping.",
          question:
            "Using the 50/30/20 framework, how much should Priya ideally save/invest each month?",
          options: [
            "$800 — 20% of $4,000",
            "$200 — whatever's left over",
            "$400 — 10% is enough",
            "$0 — her expenses exceed income",
          ],
          correctIndex: 0,
          explanation:
            "Her needs total $2,220 (55% — slightly over). The 50/30/20 target for savings is $800/month. She may need to trim wants or negotiate lower expenses to hit that target. The framework is a guide, not a rigid rule.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Debt Management ────────────────────────────────────────────
    {
      id: "pf-2",
      title: " Debt Management",
      description:
        "Good vs bad debt, avalanche vs snowball, credit scores, and refinancing",
      icon: "CreditCard",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: " Good Debt vs Bad Debt",
          content:
            "**Not all debt is equal.** The key test: does this debt generate value greater than its cost?\n\n**Good debt** (usually):\n- Mortgage: home appreciates, builds equity\n- Student loans: increases lifetime earnings\n- Business loan: generates revenue\n\n**Bad debt** (usually):\n- Credit card debt: 15–29% APR on depreciating purchases\n- Payday loans: 300–400% effective APR\n- Buy-now-pay-later on impulse purchases\n\nEven 'good' debt can become bad if the terms are poor or you can't afford payments. Always compare the cost of debt vs. potential return.",
          highlight: ["good debt", "bad debt", "APR"],
        },
        {
          type: "teach",
          title: " Avalanche vs Snowball",
          content:
            "Two battle-tested methods for eliminating debt:\n\n**Avalanche Method** — pay minimums on all debts, then throw every extra dollar at the **highest-interest** debt first. Mathematically optimal — saves the most money in interest.\n\n**Snowball Method** — pay minimums on all debts, then throw extra at the **smallest balance** first regardless of rate. Psychologically powerful — quick wins keep you motivated.\n\nStudies show both work. The avalanche saves more money; the snowball helps people stick to the plan. Pick the method you'll actually follow.",
          highlight: ["avalanche", "snowball"],
        },
        {
          type: "teach",
          title: " Credit Score Factors & Refinancing",
          content:
            "Your **FICO score** (300–850) affects every loan rate you'll ever get:\n\n- **Payment history (35%)**: One missed payment can drop your score 100 pts\n- **Credit utilization (30%)**: Keep balances below 30% of limits\n- **Length of history (15%)**: Don't close old accounts\n- **Credit mix (10%)**: Variety of account types\n- **New inquiries (10%)**: Limit applications\n\n**Refinancing** replaces an existing loan with a new one at a lower rate. If rates have fallen since you took the loan — or your credit improved — refinancing can save thousands. Always calculate the break-even point (closing costs ÷ monthly savings).",
          highlight: ["FICO score", "credit utilization", "refinancing"],
        },
        {
          type: "quiz-mc",
          question:
            "You have: Credit card $2,000 at 24% APR, car loan $6,000 at 6%, student loan $18,000 at 5%. Using the Avalanche method, which do you attack first?",
          options: [
            "Credit card ($2,000 at 24%) — highest interest rate",
            "Student loan ($18,000) — largest balance",
            "Car loan ($6,000) — middle ground",
            "All three equally",
          ],
          correctIndex: 0,
          explanation:
            "The Avalanche targets the highest APR first. Your credit card at 24% costs far more per dollar owed than the others. Eliminating it first minimizes total interest paid.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Closing a credit card you've had for 10 years will improve your credit score.",
          correct: false,
          explanation:
            "Closing an old card hurts your score two ways: it shortens your average credit history (15%) and reduces total available credit, raising your utilization ratio (30%). Keep old accounts open — even if rarely used.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Marcus has a $300,000 mortgage at 7.5% taken in 2023. Rates have dropped to 6.2%. Refinancing would cost $4,800 in closing fees and save $280/month.",
          question: "Should Marcus refinance, and approximately when does it break even?",
          options: [
            "Yes — break-even is ~17 months ($4,800 ÷ $280)",
            "No — closing costs are too high",
            "Yes, but only if he plans to sell within 2 years",
            "No — refinancing always hurts your credit score",
          ],
          correctIndex: 0,
          explanation:
            "$4,800 ÷ $280/month = ~17 months to break even. If Marcus stays in the home longer than 17 months (very likely), refinancing saves money. It's a straightforward decision when break-even is under 2 years.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Retirement Planning ───────────────────────────────────────
    {
      id: "pf-3",
      title: " Retirement Planning",
      description:
        "401k, IRA, Roth vs Traditional, compound growth, and the retirement number",
      icon: "Landmark",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: " 401k, IRA & Roth Explained",
          content:
            "Tax-advantaged retirement accounts are the most powerful wealth-building tools available to ordinary investors:\n\n**401(k)** — employer-sponsored. Contributions are pre-tax (traditional) or post-tax (Roth 401k). Many employers match — that's an instant 50–100% return on contributed dollars.\n\n**Traditional IRA** — deductible contributions lower taxable income now; withdrawals taxed in retirement.\n\n**Roth IRA** — no deduction today, but all growth and withdrawals are **tax-free forever**. Best if you expect higher taxes in retirement.\n\n2025 limits: 401(k) $23,500 | IRA $7,000 (plus $1,000 catch-up if 50+).",
          highlight: ["401(k)", "Traditional IRA", "Roth IRA", "tax-free"],
        },
        {
          type: "teach",
          title: "📐 Compound Growth & the Retirement Number",
          content:
            "**Compound growth** is exponential: returns generate their own returns. Time is your most powerful variable — not the amount invested.\n\n**The 4% Rule** — the classic retirement number formula:\nRetirement Nest Egg = Annual Expenses × 25\n\nIf you need $60,000/year in retirement: $60,000 × 25 = **$1,500,000**\n\nAt 4% annual withdrawal, your portfolio statistically lasts 30+ years. This assumes a diversified stock/bond mix.\n\nThe Rule of 72: divide 72 by your return rate to estimate years to double. At 8%: 72 ÷ 8 = 9 years to double.",
          highlight: ["compound growth", "4% Rule", "retirement number", "Rule of 72"],
        },
        {
          type: "teach",
          title: " Traditional vs Roth: The Decision",
          content:
            "**Choose Traditional (pre-tax) if:**\n- You're in a high tax bracket now (32%+)\n- You expect lower income in retirement\n- You need the deduction to reduce current taxes\n\n**Choose Roth (post-tax) if:**\n- You're in a low or moderate tax bracket now\n- You expect higher income/taxes later\n- You want flexibility (Roth contributions — not earnings — can be withdrawn penalty-free)\n- You're young: decades of tax-free compounding is incredibly powerful\n\nMany advisors recommend **diversifying tax treatment** — contribute to both. Future tax rates are uncertain.",
          highlight: ["Traditional", "Roth", "tax bracket", "tax-free compounding"],
        },
        {
          type: "quiz-mc",
          question:
            "Using the 4% Rule, how large does your retirement portfolio need to be if you want to spend $80,000/year in retirement?",
          options: [
            "$2,000,000 ($80,000 × 25)",
            "$800,000 ($80,000 × 10)",
            "$3,200,000 ($80,000 × 40)",
            "$1,200,000 ($80,000 × 15)",
          ],
          correctIndex: 0,
          explanation:
            "The 4% Rule: multiply annual spending by 25. $80,000 × 25 = $2,000,000. Withdrawing 4% of $2M = $80,000/year. This portfolio has historically survived 30+ year retirements.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A 25-year-old in a 22% tax bracket should generally prefer a Roth IRA over a Traditional IRA.",
          correct: true,
          explanation:
            "At 22% bracket with 40+ years to retirement, paying taxes now (Roth) and getting tax-free growth is typically better than deferring taxes. By retirement, income often rises, pushing you into a higher bracket.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Sofia, 30, earns $75,000/year and her employer matches 401(k) contributions 100% up to 4% of salary. She has no emergency fund yet and carries $5,000 in credit card debt at 22% APR.",
          question:
            "What is Sofia's optimal financial priority order?",
          options: [
            "Emergency fund → 401k to 4% match → pay off credit card → max IRA",
            "Max out 401k first, then emergency fund",
            "Pay off all debt before any retirement saving",
            "Invest in individual stocks first for higher returns",
          ],
          correctIndex: 0,
          explanation:
            "Emergency fund comes first (safety net). Then capture the 100% return from employer match. Then eliminate 22% credit card debt. Then max IRA for tax-free growth. The match beats even 22% debt mathematically.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Insurance & Protection ────────────────────────────────────
    {
      id: "pf-4",
      title: " Insurance & Protection",
      description:
        "Term vs whole life, disability insurance, umbrella policies, and health deductibles",
      icon: "Shield",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: " Why Insurance Matters",
          content:
            "Insurance is **risk transfer** — you pay a small certain cost (premium) to eliminate the risk of a catastrophic uncertain loss.\n\nThe core principle: insure events that would financially ruin you; self-insure small risks.\n\n**Term life insurance**: Pure death benefit for a fixed period (10, 20, 30 years). Cheap and simple. Best for most people with dependents.\n\n**Whole life insurance**: Permanent coverage + savings component. 5–10× more expensive. Primarily useful for estate planning, not protection. Often sold as an investment — it rarely is one.\n\nIf you have dependents who rely on your income, term life is non-negotiable.",
          highlight: ["term life", "whole life", "premium", "dependents"],
        },
        {
          type: "teach",
          title: "💼 Disability & Umbrella Insurance",
          content:
            "**Disability insurance** replaces 60–70% of your income if you can't work due to illness or injury. It's the most overlooked insurance — yet you're 3× more likely to be disabled before 65 than to die.\n\nTwo types:\n- **Short-term disability**: Covers 3–6 months, often through employer\n- **Long-term disability (LTD)**: Covers years or decades. Critical if you don't have substantial savings.\n\n**Umbrella insurance** provides liability coverage beyond your home/auto policy limits. $1M–$5M of coverage for $150–$300/year. Essential once your net worth exceeds $100K — a single lawsuit could wipe out your assets without it.",
          highlight: ["disability insurance", "umbrella insurance", "liability"],
        },
        {
          type: "teach",
          title: "🏥 Health Insurance Deductibles & HSAs",
          content:
            "**Deductible**: Amount you pay out-of-pocket before insurance kicks in. Higher deductible = lower premium.\n\n**Copay**: Fixed fee per visit. **Coinsurance**: You pay a % of costs after hitting your deductible.\n\n**Out-of-pocket maximum**: The most you'll ever pay in a year — after this, insurance covers 100%.\n\n**HSA (Health Savings Account)**: Paired with a high-deductible health plan. Contributions are **triple tax-advantaged** — tax-free in, grows tax-free, withdraws tax-free for medical expenses. In retirement, withdrawals for any purpose are taxed like a Traditional IRA. Often called the 'stealth IRA.'",
          highlight: ["deductible", "out-of-pocket maximum", "HSA", "triple tax-advantaged"],
        },
        {
          type: "quiz-mc",
          question:
            "A 32-year-old with a spouse and two children needs life insurance. Which is typically the better choice?",
          options: [
            "20-year term life — affordable, pure protection while dependents need it",
            "Whole life — permanent and builds cash value",
            "Universal life — flexible premiums",
            "No insurance needed until age 50",
          ],
          correctIndex: 0,
          explanation:
            "Term life covers the period when your family is most financially dependent on you (kids at home, mortgage outstanding). It's 5–10× cheaper than whole life for the same death benefit. Invest the premium difference instead.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Disability insurance is unnecessary because workers' compensation covers income loss.",
          correct: false,
          explanation:
            "Workers' comp only covers on-the-job injuries — a small fraction of disabilities. Most disabilities come from illness, accidents outside work, or mental health conditions. Long-term disability insurance is critical for anyone without substantial savings.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "David, 35, just upgraded to a $500K home. His auto insurance covers $100K liability per accident. He has $200K in investments. A contractor sues him for $350K after an accident on his property.",
          question: "Which insurance product would best protect David's assets?",
          options: [
            "Umbrella policy — provides $1M+ liability coverage above home/auto limits",
            "Better homeowner's insurance — covers all property accidents",
            "Life insurance — protects his estate",
            "Health insurance — covers medical costs from accidents",
          ],
          correctIndex: 0,
          explanation:
            "An umbrella policy kicks in above home/auto limits. Without it, a $350K judgment that exceeds his $100K auto limit exposes $250K of his assets. Umbrella coverage for $1M typically costs $150–300/year — extraordinary value.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Tax-Efficient Investing ───────────────────────────────────
    {
      id: "pf-5",
      title: "📋 Tax-Efficient Investing",
      description:
        "Tax-advantaged accounts, capital gains, tax-loss harvesting, and asset location",
      icon: "Calculator",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " Tax-Advantaged Account Hierarchy",
          content:
            "Maximize accounts in this order to minimize taxes on your investments:\n\n1. **401(k)/403(b) up to employer match** — instant 50–100% return\n2. **HSA** (if eligible) — triple tax-free, best savings vehicle available\n3. **Roth IRA** — tax-free growth forever, $7,000/year limit\n4. **Max out 401(k)** — $23,500/year, massive tax deferral\n5. **Taxable brokerage** — for additional investing with no limits\n\nEvery dollar in a tax-advantaged account compounds tax-free or tax-deferred, which can mean 20–40% more wealth over 30 years versus a taxable account.",
          highlight: ["401(k)", "HSA", "Roth IRA", "taxable brokerage"],
        },
        {
          type: "teach",
          title: " Capital Gains & Tax-Loss Harvesting",
          content:
            "**Capital gains** tax applies when you sell investments for a profit:\n\n- **Short-term** (held < 1 year): Taxed as ordinary income — up to 37%\n- **Long-term** (held ≥ 1 year): 0%, 15%, or 20% depending on income\n\nAlways try to hold investments 12+ months to qualify for lower long-term rates.\n\n**Tax-loss harvesting**: Sell losing positions to realize losses that offset gains and reduce your tax bill. Then immediately buy a similar (not identical) asset to maintain market exposure. Subject to the **wash-sale rule** — you can't buy the same or substantially identical security within 30 days.",
          highlight: ["short-term", "long-term", "tax-loss harvesting", "wash-sale rule"],
        },
        {
          type: "teach",
          title: "🗂️ Asset Location Strategy",
          content:
            "**Asset location** means placing investments in the right account type to minimize taxes:\n\n**In tax-advantaged accounts (401k, IRA)**:\n- Bonds (interest taxed as ordinary income)\n- REITs (high dividends taxed as ordinary income)\n- High-turnover actively managed funds\n\n**In taxable brokerage accounts**:\n- Index funds (low turnover, minimal taxable events)\n- Municipal bonds (already tax-free)\n- Long-term buy-and-hold equities\n\nThis simple strategy can add 0.25–0.75% in after-tax returns annually — equivalent to a significant fee reduction.",
          highlight: ["asset location", "tax-advantaged", "taxable", "index funds"],
        },
        {
          type: "quiz-mc",
          question:
            "You bought 100 shares of an ETF at $50 and sold at $80 after 14 months. Your taxable income is $95,000. What capital gains rate applies?",
          options: [
            "15% long-term rate — held over 12 months",
            "37% short-term rate — gains are large",
            "0% — ETFs are exempt",
            "Ordinary income rate — all stock gains are ordinary income",
          ],
          correctIndex: 0,
          explanation:
            "You held for 14 months, qualifying for long-term capital gains rates. At $95,000 income (single filer), the 15% rate applies. Your gain is $3,000 ($80-$50 × 100), so tax is $450 vs. $1,110 at the 37% short-term rate.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "You can immediately repurchase the exact same ETF after selling it for a tax loss without violating the wash-sale rule.",
          correct: false,
          explanation:
            "The wash-sale rule disallows the loss if you buy the same or 'substantially identical' security within 30 days before or after the sale. You must buy a different but similar fund (e.g., sell Vanguard S&P 500 and buy Fidelity S&P 500) to harvest the loss and maintain exposure.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Investor has $50,000 to invest in both a Roth IRA and a taxable brokerage account. She wants to hold a total bond fund (high income distributions) and a total stock index fund (minimal distributions).",
          question: "Optimal asset location strategy?",
          options: [
            "Bonds in Roth IRA, stocks in taxable brokerage — shelters high-income bonds from tax",
            "Stocks in Roth IRA, bonds in taxable — stocks grow faster, need more shelter",
            "Split both assets equally across both accounts",
            "Put everything in the taxable account for simplicity",
          ],
          correctIndex: 0,
          explanation:
            "Bond interest is taxed as ordinary income (high rate). Placing bonds in the Roth shelters that income entirely. Stock index funds generate minimal taxable events and qualify for lower long-term rates, making them suitable for taxable accounts.",
          difficulty: 3,
        },
      ],
    },
  ],
};
