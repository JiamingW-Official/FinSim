import type { Unit } from "./types";

export const UNIT_PERSONAL_FINANCE: Unit = {
  id: "personal-finance",
  title: "Personal Finance Masterclass",
  description:
    "Master budgeting, debt management, insurance, retirement planning, and wealth-building strategies",
  icon: "💵",
  color: "#22c55e",
  lessons: [
    // ─── Lesson 1: Budgeting & Cash Flow ────────────────────────────────────────
    {
      id: "pf-budgeting",
      title: "💰 Budgeting & Cash Flow",
      description:
        "The 50/30/20 rule, zero-based budgeting, cash flow analysis, and emergency funds",
      icon: "PieChart",
      xpReward: 60,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "📊 The 50/30/20 Rule",
          content:
            "The **50/30/20 rule**, popularized by Senator Elizabeth Warren, divides your after-tax income into three buckets:\n\n**50% Needs**: Essentials you cannot skip — rent/mortgage, groceries, utilities, insurance premiums, minimum debt payments, transportation to work.\n\n**30% Wants**: Things you enjoy but could live without — dining out, streaming subscriptions, vacations, hobbies, new clothes beyond basics.\n\n**20% Savings & Debt Repayment**: This is your wealth-building bucket — emergency fund contributions, retirement accounts (401k/IRA), index fund investments, and debt payments *above* minimums.\n\nExample on a $5,000/month take-home:\n- Needs: $2,500 (rent $1,400 + groceries $300 + insurance $400 + transport $400)\n- Wants: $1,500 (dining $400 + streaming $100 + gym $50 + entertainment $950)\n- Savings: $1,000 (401k $500 + emergency fund $300 + extra debt $200)",
          highlight: ["50/30/20", "needs", "wants", "savings", "debt repayment"],
          visual: "portfolio-pie",
        },
        {
          type: "teach",
          title: "🎯 Zero-Based Budgeting",
          content:
            "**Zero-based budgeting** assigns every single dollar a specific job so that: Income − All Assigned Expenses = $0.\n\nThis does NOT mean spending everything — it means *planning* where each dollar goes before you spend it.\n\n**How it works:**\n1. Start with total monthly income\n2. List every expense category (fixed + variable)\n3. Allocate amounts to each category\n4. Assign any remaining dollars to savings or debt\n5. Track actual spending vs. plan throughout the month\n\n**Example:**\nIncome: $4,000\nRent: $1,200 | Groceries: $350 | Utilities: $100 | Car: $300 | Insurance: $150 | Dining: $200 | Entertainment: $100 | Subscriptions: $50 | Clothing: $100 | Emergency Fund: $400 | 401k: $500 | IRA: $250 | Extra debt payment: $300\nTotal assigned: $4,000 ✓\n\nZero-based budgeting is more work than 50/30/20 but gives you full visibility and control over every dollar.",
          highlight: ["zero-based budgeting", "income", "expenses", "savings", "debt"],
        },
        {
          type: "teach",
          title: "📈 Cash Flow Statement & Emergency Fund",
          content:
            "**Personal Cash Flow Statement:**\nNet Cash Flow = Total Income − Total Expenses\n\nIncome sources: salary, freelance, rental income, dividends, side hustles.\nExpenses: fixed (rent, loan payments) + variable (groceries, dining) + periodic (annual fees, car registration).\n\nPositive net cash flow = you can save and invest. Negative = you are going into debt.\n\n**Emergency Fund:**\nAn emergency fund holds **3–6 months of essential living expenses** in a **high-yield savings account (HYSA)**.\n\n- 3 months: stable job, dual-income household, no dependents\n- 6 months: freelancer, single income, dependents, volatile industry\n\nWhy a HYSA? As of 2026, HYSAs offer 4–5% APY vs. 0.01% at traditional banks — your emergency fund should at least keep up with inflation.\n\n**Pay Yourself First**: The most powerful habit is to *automate* your savings transfer on payday, before you have a chance to spend it. Treat savings as a non-negotiable bill payable to your future self.",
          highlight: ["cash flow", "emergency fund", "HYSA", "pay yourself first", "automate"],
        },
        {
          type: "quiz-mc",
          question:
            "What does the 50/30/20 rule allocate to savings and debt repayment?",
          options: [
            "20% — for savings, investing, and extra debt payments",
            "30% — for wants including discretionary savings",
            "50% — split evenly between savings and needs",
            "10% — just for retirement contributions",
          ],
          correctIndex: 0,
          explanation:
            "The 20% bucket covers all wealth-building activities: emergency fund, retirement accounts (401k, IRA), investment accounts, and debt payments above minimums. The 50% covers needs and 30% covers wants.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "In zero-based budgeting, if your income is $4,000 and you've assigned $3,800 to expenses, you should spend the remaining $200 on anything you want.",
          correct: false,
          explanation:
            "False. In zero-based budgeting every dollar must be assigned a job before spending. The remaining $200 should be explicitly allocated — to savings, debt paydown, or a specific discretionary category — so that total allocations equal exactly $4,000.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria earns $6,000/month after taxes. Her fixed expenses are $2,800/month. She currently keeps her $8,000 emergency fund in a regular savings account earning 0.01% APY. A high-yield savings account offers 4.5% APY.",
          question:
            "How much additional annual interest would Maria earn by moving her emergency fund to the HYSA?",
          options: [
            "$359.20 more per year — ($8,000 × 4.5%) vs. ($8,000 × 0.01%)",
            "$45.00 more per year — only the interest on the difference",
            "$8,000 more per year — the full principal transfers",
            "$180.00 more per year — half the HYSA rate applies",
          ],
          correctIndex: 0,
          explanation:
            "At 4.5% APY: $8,000 × 0.045 = $360. At 0.01% APY: $8,000 × 0.0001 = $0.80. Difference = ~$359.20/year. This is essentially free money for simply moving accounts — a simple optimization most people overlook.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Debt Management ───────────────────────────────────────────────
    {
      id: "pf-debt",
      title: "🏦 Debt Management",
      description:
        "Debt avalanche vs. snowball, DTI ratio, net worth, and strategies to eliminate debt faster",
      icon: "TrendingUp",
      xpReward: 65,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "📋 Types of Debt",
          content:
            "Not all debt is equal. Understanding the spectrum helps you prioritize:\n\n**Good debt** (leverages appreciating assets or earning power):\n- **Mortgage**: Builds equity in an asset that typically appreciates; interest often tax-deductible\n- **Student loans**: Invests in earning potential; federal loans offer income-based repayment options\n\n**Neutral/caution debt**:\n- **Auto loans**: The asset depreciates immediately (new car loses 20% in year 1); necessary but keep the rate low and term short\n- **Personal loans**: Can be useful if rate < credit card rate; avoid for discretionary spending\n\n**Bad debt** (high cost, no asset):\n- **Credit cards**: Average APR ~24% in 2026; if you carry a balance you are renting money expensively\n- **Payday loans**: 300–400% effective APR; financial emergency territory\n- **Buy-now-pay-later (BNPL)**: Deferred interest traps can be predatory\n\n**Net Worth = Total Assets − Total Liabilities**\nAssets: home equity, investment accounts, savings, car value.\nLiabilities: mortgage balance, student loans, auto loans, credit card balances.\nNet worth growing over time = you are building wealth.",
          highlight: ["mortgage", "student loans", "credit card", "net worth", "assets", "liabilities"],
        },
        {
          type: "teach",
          title: "❄️ Debt Avalanche vs. Debt Snowball",
          content:
            "Both methods require paying minimums on ALL debts, then directing extra cash to one target debt.\n\n**Debt Avalanche** — target highest interest rate first:\n- Mathematically optimal: minimizes total interest paid\n- Example: CC at 24% APR → personal loan at 12% → student loan at 6% → mortgage at 3.5%\n- Saves the most money over time, but early wins are slower if high-rate debt has a large balance\n\n**Debt Snowball** — target smallest balance first (regardless of rate):\n- Psychologically motivating: you eliminate debts quickly, creating momentum\n- Each paid-off account frees up a minimum payment to roll into the next target (the 'snowball')\n- Pioneered by Dave Ramsey; studies show higher completion rates for people who struggle with motivation\n\n**Which to choose?**\n- If you're disciplined and motivated by math → Avalanche\n- If you need quick wins to stay on track → Snowball\n- Hybrid: pick snowball for small balances under $500 (pay off fast), then avalanche the rest\n\n**The real enemy is inaction**. Either method beats paying minimums only, which can keep you in debt for decades.",
          highlight: ["debt avalanche", "debt snowball", "interest rate", "minimum payment", "balance"],
        },
        {
          type: "teach",
          title: "📐 Debt-to-Income Ratio",
          content:
            "**Debt-to-Income Ratio (DTI)** = Monthly Debt Payments ÷ Gross Monthly Income × 100\n\nThis is the primary metric lenders use to evaluate loan applications.\n\n**DTI thresholds:**\n- **< 36%**: Healthy — lenders view you favorably; you qualify for best mortgage rates\n- **36–43%**: Acceptable — most lenders will still approve; rates may be higher\n- **43–50%**: Risky — some lenders decline; FHA loans allow up to 50% in some cases\n- **> 50%**: Danger zone — difficulty qualifying for new credit; repayment stress is high\n\n**Example:**\nGross income: $6,000/month\nDebt payments: mortgage $1,200 + student loan $300 + car $250 + credit card minimum $100 = $1,850\nDTI = $1,850 / $6,000 = **30.8%** ← healthy\n\nTo improve DTI: increase income (denominator) or pay down debt (numerator). Note that paying off a credit card balance *and* closing the account lowers the minimum payment in DTI calculations.",
          highlight: ["debt-to-income ratio", "DTI", "mortgage", "lender", "gross income"],
        },
        {
          type: "quiz-mc",
          question:
            "Which debt repayment method minimizes total interest paid over the life of all debts?",
          options: [
            "Debt avalanche — target highest interest rate first",
            "Debt snowball — target smallest balance first",
            "Debt consolidation — always reduces total interest",
            "Minimum payments only — preserves cash flow for investing",
          ],
          correctIndex: 0,
          explanation:
            "The debt avalanche is mathematically optimal because you eliminate the highest-cost debt first, reducing the principal that accrues the most interest. The snowball method saves less in total interest but can be more effective for people who need psychological wins to stay motivated.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A person with $500,000 in assets and $350,000 in total liabilities has a positive net worth.",
          correct: true,
          explanation:
            "True. Net Worth = Assets − Liabilities = $500,000 − $350,000 = $150,000. Despite having significant debt (perhaps a mortgage), this person has positive net worth. Building net worth over time — not just eliminating debt — is the goal of personal finance.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Alex has three debts: Credit card $3,000 at 22% APR, personal loan $8,000 at 11% APR, student loan $25,000 at 5.5% APR. After minimums, Alex has $400/month extra to put toward debt.",
          question:
            "Using the debt avalanche method, which debt should receive the $400 extra payment first?",
          options: [
            "Credit card ($3,000 at 22% APR) — highest interest rate",
            "Student loan ($25,000 at 5.5% APR) — largest balance",
            "Personal loan ($8,000 at 11% APR) — middle balance and rate",
            "Split evenly across all three debts",
          ],
          correctIndex: 0,
          explanation:
            "Debt avalanche targets the highest interest rate first — the credit card at 22% APR. Even though it's not the largest balance, 22% is the most expensive debt. Once the credit card is paid off (in ~8 months), the $400 plus the freed-up credit card minimum rolls into the personal loan, then the student loan.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Insurance & Protection ───────────────────────────────────────
    {
      id: "pf-insurance",
      title: "🛡️ Insurance & Protection",
      description:
        "Health, life, disability, and property insurance — protecting the wealth you build",
      icon: "ShieldCheck",
      xpReward: 65,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🗂️ Types of Insurance",
          content:
            "Insurance transfers financial risk from you to an insurer in exchange for a premium. The key types:\n\n**Health Insurance**: Covers medical expenses. In the US, typically through employer, ACA marketplace, Medicaid, or Medicare. The most used insurance for most people.\n\n**Life Insurance**: Pays a death benefit to beneficiaries. Two main types:\n- *Term*: Pure protection for a fixed period (10/20/30 years). Cheapest. Best for most people.\n- *Whole/Universal*: Permanent coverage + savings component. 5–10× more expensive. Often mis-sold.\n\n**Disability Insurance**: Replaces income if you can't work due to illness or injury. Short-term (3–6 months) vs. long-term (until 65). Often overlooked but critical.\n\n**Property & Casualty**: Homeowners or renters insurance (property damage, theft, liability) + auto insurance.\n\n**Umbrella Insurance**: Excess liability above home/auto limits. $1M of coverage typically costs $150–300/year. Essential for high net worth individuals.\n\n**The insurance priority order:**\n1. Health (catastrophic risk)\n2. Disability (income protection)\n3. Life (if dependents rely on your income)\n4. Home/Renters + Auto (legal requirements or asset protection)\n5. Umbrella (when net worth exceeds $500K+)",
          highlight: ["health", "life", "disability", "property", "umbrella", "premium"],
        },
        {
          type: "teach",
          title: "⚡ Term vs. Whole Life Insurance",
          content:
            "**Term Life Insurance:**\n- Pure death benefit for a set term (10, 20, or 30 years)\n- Premiums are fixed and low: healthy 35-year-old can get $500,000 of 20-year term for ~$25–35/month\n- No cash value; if you outlive the term, coverage ends\n- **Best for**: anyone with dependents, a mortgage, or income others rely on\n\n**Whole Life Insurance:**\n- Permanent coverage (lasts your lifetime)\n- Premiums 5–10× higher than term (same benefit)\n- Builds 'cash value' that grows slowly (often at 1–2% guaranteed + dividend)\n- Agents earn much higher commissions → frequently mis-sold\n- **Rarely the better choice** for most consumers\n\n**The 'buy term and invest the difference' strategy:**\nIf whole life costs $300/month vs. term at $30/month, invest the $270 difference in an index fund at historical ~10%/year. Over 30 years that $270/month compounds to ~$550,000 — vastly outperforming the cash value of whole life.\n\n**Rule of thumb**: Life insurance need ≈ **10–12× your annual income**. A $100,000/year earner needs $1M–$1.2M in coverage.",
          highlight: ["term", "whole life", "cash value", "death benefit", "premium", "buy term invest difference"],
        },
        {
          type: "teach",
          title: "🏥 Health Insurance Concepts & HSA",
          content:
            "Understanding your health plan's financial mechanics:\n\n**Premium**: Monthly cost regardless of whether you use healthcare.\n**Deductible**: Amount you pay out-of-pocket before insurance starts covering (e.g., $1,500/year).\n**Copay**: Fixed fee for a service (e.g., $30 for a doctor visit after deductible met).\n**Coinsurance**: Your percentage after deductible (e.g., 20% — insurer pays 80%, you pay 20%).\n**Out-of-pocket maximum**: The most you'll pay in a year (e.g., $7,500); insurer covers 100% after this.\n\n**High-Deductible Health Plan (HDHP)**: Lower premiums, higher deductible. Qualifies you for an HSA.\n\n**Health Savings Account (HSA) — Triple Tax Advantage:**\n1. **Contributions are pre-tax** (reduce taxable income)\n2. **Growth is tax-free** (invest in index funds inside the HSA)\n3. **Withdrawals for qualified medical expenses are tax-free**\n\nNo other account has all three benefits. 2026 limits: $4,300 individual / $8,550 family. After age 65, withdrawals for non-medical expenses are taxed like a Traditional IRA (no penalty). This makes the HSA the *best* retirement account available if you can pay current medical costs out-of-pocket.",
          highlight: ["premium", "deductible", "copay", "coinsurance", "out-of-pocket maximum", "HSA", "triple tax"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary advantage of a Health Savings Account (HSA)?",
          options: [
            "Triple tax advantage: pre-tax contributions, tax-free growth, tax-free withdrawal for medical expenses",
            "No deductible required to open the account",
            "The employer must match HSA contributions like a 401(k)",
            "Withdrawals are always tax-free regardless of what they are used for",
          ],
          correctIndex: 0,
          explanation:
            "The HSA offers a unique triple tax benefit: (1) contributions reduce your taxable income now, (2) investments inside the HSA grow tax-free, and (3) qualified medical expense withdrawals are completely tax-free. No other account has all three. After 65, non-medical withdrawals are taxed but penalty-free — making it a powerful retirement account.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Whole life insurance is almost always a better financial choice than term life insurance because it builds cash value.",
          correct: false,
          explanation:
            "False. For most consumers, term life is the better choice. Whole life premiums are 5–10× higher for the same death benefit. The cash value grows slowly (often 1–2%), and the 'buy term and invest the difference' strategy — investing the premium savings in index funds — typically builds far more wealth. Whole life can serve specific estate planning or business succession needs but is frequently mis-sold.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Jordan is 32, healthy, earns $85,000/year, has two young children, and a $300,000 mortgage. An agent offers 20-year term life at $28/month ($500,000 benefit) or whole life at $290/month ($500,000 benefit). Jordan's employer offers an HDHP health plan that qualifies for an HSA.",
          question:
            "Which combination of insurance decisions best protects Jordan's family?",
          options: [
            "Choose term life and max out HSA contributions, investing the $262/month savings",
            "Choose whole life because it builds permanent cash value for the mortgage",
            "Skip life insurance since the mortgage will be paid off in 20 years",
            "Choose whole life and skip HSA since premiums are already high",
          ],
          correctIndex: 0,
          explanation:
            "Term life at $28/month provides the protection Jordan's dependents need. The $262/month difference invested in index funds at 10%/year grows to ~$220,000 over 20 years — far exceeding whole life cash value. Maxing the HSA captures triple tax savings and provides an investment vehicle. Jordan's family is protected AND building wealth efficiently.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Retirement Planning ──────────────────────────────────────────
    {
      id: "pf-retirement",
      title: "🏖️ Retirement Planning",
      description:
        "401(k), Roth IRA, the 4% rule, Social Security, and how compound growth builds your nest egg",
      icon: "GraduationCap",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⏳ Time Value of Money & Compound Growth",
          content:
            "**The most important concept in personal finance: $1 today is worth more than $1 tomorrow** because money invested today grows over time.\n\n**Compound growth formula:** FV = PV × (1 + r)^n\n\nWhere: FV = future value, PV = present value, r = annual return, n = years\n\n**The Rule of 72**: Divide 72 by annual return to find doubling time.\n- At 6% → money doubles every 12 years\n- At 8% → money doubles every 9 years\n- At 10% → money doubles every 7.2 years\n\n**Why starting early is transformative:**\n\n| Age Start | Monthly | Rate | At 65 |\n|-----------|---------|------|-------|\n| 25 | $500 | 8% | ~$1.75M |\n| 35 | $500 | 8% | ~$745K |\n| 45 | $500 | 8% | ~$295K |\n\nStarting at 25 vs. 35 = the same $500/month builds **2.3× more wealth** simply by starting 10 years earlier. The extra decade is doing the heavy lifting — this is why 'pay yourself first' and 'start now' are the most repeated pieces of retirement advice.",
          highlight: ["compound growth", "time value of money", "Rule of 72", "doubling time"],
        },
        {
          type: "teach",
          title: "🏦 Retirement Account Types",
          content:
            "**Tax-deferred (Traditional) accounts — pay tax later:**\n- **401(k) / 403(b)**: Employer-sponsored. 2026 limit: $23,500 (+$7,500 catch-up for age 50+). Pre-tax contributions reduce taxable income now. Always contribute at least enough to capture the full employer match — that's an instant 50–100% return.\n- **Traditional IRA**: Individual account. 2026 limit: $7,000 (+$1,000 catch-up). Deductible if income is below thresholds. Grows tax-deferred; taxed on withdrawal.\n- **SEP-IRA**: For self-employed. Up to 25% of net self-employment income, max ~$70,000 in 2026.\n\n**Tax-free (Roth) accounts — pay tax now, never again:**\n- **Roth 401(k)**: Same limits as Traditional; after-tax contributions; employer match still goes pre-tax.\n- **Roth IRA**: 2026 limit $7,000; income phase-out at $150K single / $236K married. Contributions (not earnings) can be withdrawn anytime penalty-free.\n\n**Roth vs. Traditional rule of thumb:**\n- Roth wins if you expect higher tax rates in retirement (young, lower income now)\n- Traditional wins if you expect lower tax rates in retirement (peak earning years)\n- Contribute to both if unsure — tax diversification\n\n**Order of operations:**\n1. 401k up to employer match (free money)\n2. Max HSA if eligible\n3. Max Roth IRA\n4. Max remaining 401k\n5. Taxable brokerage account",
          highlight: ["401k", "Roth IRA", "Traditional IRA", "SEP-IRA", "employer match", "tax-deferred", "tax-free"],
        },
        {
          type: "teach",
          title: "🎯 The 4% Rule & Social Security",
          content:
            "**The 4% Safe Withdrawal Rule** (Bengen/Trinity Study):\nIn retirement, you can withdraw 4% of your portfolio in year 1, then adjust for inflation each year, and have a very high probability (95%+) of not running out of money over a 30-year retirement.\n\n**Implication**: You need **25× your annual expenses** to retire.\n- Annual expenses $40,000 → need $1,000,000\n- Annual expenses $60,000 → need **$1,500,000**\n- Annual expenses $100,000 → need $2,500,000\n\nFormula: Nest Egg = Annual Expenses × 25 (because 1/25 = 4%)\n\n**Social Security:**\n- **Full Retirement Age (FRA)**: 67 for anyone born after 1960\n- Claim at 62: benefits reduced ~30%\n- Delay to 70: benefits increase **8% per year** after FRA → 24% higher than FRA amount\n- Break-even for delayed claiming: approximately age 80–82\n- Strategy: If healthy with family longevity, delay to 70. If poor health or needs cash, claim earlier.\n\n**Never depend solely on Social Security**: The average 2026 benefit is ~$1,800/month — livable but not comfortable in most US cities.",
          highlight: ["4% rule", "safe withdrawal", "25×", "Social Security", "full retirement age", "delay to 70"],
        },
        {
          type: "quiz-mc",
          question:
            "How much do you need saved to safely withdraw $60,000 per year in retirement using the 4% rule?",
          options: [
            "$1,500,000 — because $60,000 ÷ 0.04 = $1,500,000",
            "$600,000 — ten times annual expenses",
            "$900,000 — fifteen times annual expenses",
            "$2,400,000 — because 4% of $2.4M = $96,000 (buffer included)",
          ],
          correctIndex: 0,
          explanation:
            "The 4% rule states you can withdraw 4% of your portfolio annually. To find the needed portfolio: Annual Withdrawal ÷ Withdrawal Rate = $60,000 ÷ 0.04 = $1,500,000. Equivalently, $60,000 × 25 = $1,500,000. This amount, invested in a diversified portfolio, historically sustains 30+ years of withdrawals.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "You should always claim Social Security at age 62 to maximize the total number of payments you receive.",
          correct: false,
          explanation:
            "False. Claiming at 62 reduces your monthly benefit by ~30% permanently. If you delay from 62 to 70, your monthly benefit can be 76% higher. The break-even point is typically around age 80–82 — if you live past that age (and average life expectancy for a 65-year-old is ~85), delaying produces more lifetime income. The optimal strategy depends on health, other income, and longevity expectations.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "At age 25, Taylor invests $300/month in a Roth IRA earning 8%/year average. Taylor's friend Lee waits until age 35 to start investing $300/month in a Traditional IRA at the same 8% return. Both plan to retire at 65.",
          question:
            "Approximately how much more will Taylor accumulate than Lee by age 65?",
          options: [
            "~$550,000 more — the 10-year head start compounds dramatically over 40 years",
            "~$36,000 more — just the extra contributions (120 months × $300)",
            "~$100,000 more — roughly proportional to extra time",
            "The same — returns equalize over time with reinvestment",
          ],
          correctIndex: 0,
          explanation:
            "Taylor invests for 40 years: $300/month at 8% ≈ $1,006,000. Lee invests for 30 years: $300/month at 8% ≈ $449,000. Taylor accumulates ~$557,000 more — nearly 2.24× Lee's total — despite only contributing $36,000 more ($300 × 120 months). This is the compounding advantage of starting early.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Wealth Building Strategies ───────────────────────────────────
    {
      id: "pf-wealth",
      title: "📈 Wealth Building Strategies",
      description:
        "Index funds, real estate, business ownership, tax efficiency, and estate planning basics",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📊 Index Fund Investing",
          content:
            "**Index funds** track a market index (e.g., S&P 500) by holding all or most of its constituents in proportion to their market capitalization.\n\n**Why index funds beat most active managers:**\n- The S&P 500 has returned ~10% annually over the last century (7% inflation-adjusted)\n- ~90% of actively managed funds underperform their benchmark over 15+ years (SPIVA data)\n- Every 1% in annual fees compounds into a massive drag: $100K at 7% for 30 years = $761K; at 6% = $574K — $187K lost to fees\n\n**Core principles:**\n- **Low cost**: Target expense ratios < 0.10% (Vanguard VTI: 0.03%, Fidelity ZERO funds: 0.00%)\n- **Broad diversification**: Total market or S&P 500 funds own 500–3,000+ companies\n- **Market-cap weighted**: Larger companies have higher weights — Apple, Microsoft, Nvidia dominate\n- **Tax efficiency**: Index funds trade rarely → fewer capital gains distributions\n- **Simplicity**: A three-fund portfolio (US total market + international + bonds) covers the entire investable world\n\n**Dollar-cost averaging (DCA)**: Invest a fixed amount regularly regardless of market conditions. Removes emotional timing decisions and automatically buys more shares when prices are low.",
          highlight: ["index fund", "S&P 500", "expense ratio", "diversification", "dollar-cost averaging", "DCA"],
        },
        {
          type: "teach",
          title: "🏠 Real Estate as a Wealth Builder",
          content:
            "Real estate builds wealth through multiple mechanisms:\n\n**1. Primary Residence Equity:**\nAs you pay down your mortgage, your equity grows. Home prices have historically appreciated ~3–4% annually (roughly inflation). The leverage effect amplifies returns: a $400K home bought with $80K down (20%) that appreciates to $440K produces a $40K gain on an $80K investment = 50% return on equity.\n\n**2. Rental Property:**\n- Monthly cash flow: Rent > PITI (principal, interest, taxes, insurance) + maintenance + vacancy\n- Rule of thumb: 1% rule — monthly rent ≥ 1% of purchase price ($250K property → $2,500/month rent)\n- Tax benefits: mortgage interest deduction, depreciation (27.5-year schedule), expense deductions\n- Management overhead: self-manage or hire property manager (~8–12% of rent)\n\n**3. REITs (Real Estate Investment Trusts):**\n- Publicly traded companies that own income-producing real estate\n- Must distribute 90% of taxable income as dividends\n- Provides real estate exposure without being a landlord\n- Accessible with any investment amount; high liquidity vs. physical property\n\n**Consideration**: Real estate requires significant capital, is illiquid, and involves active management. REITs provide simpler exposure for most investors.",
          highlight: ["equity", "rental property", "REIT", "cash flow", "appreciation", "depreciation", "leverage"],
        },
        {
          type: "teach",
          title: "💼 Business Ownership, Tax Efficiency & Estate Planning",
          content:
            "**Business Ownership — The Wealth Creation Engine:**\nStudies consistently show business ownership is the primary wealth-creation vehicle for self-made millionaires and billionaires. A business can scale beyond your personal hours and eventually be sold for a multiple of earnings. Even a small business generating $100K/year of profit, sold at 3–5× earnings, yields $300K–$500K in liquidity.\n\n**Tax Efficiency — Order of Operations:**\n1. 401k/403b up to match (tax deduction + free money)\n2. HSA max (triple tax advantage)\n3. Roth IRA max (tax-free growth)\n4. Back-door Roth IRA if over income limits\n5. Max remaining 401k pre-tax or Roth\n6. Taxable brokerage (hold index funds for tax efficiency; use tax-loss harvesting)\n\n**Tax-Loss Harvesting**: Selling losing positions to realize losses that offset capital gains or up to $3,000 of ordinary income per year. Reinvest proceeds in similar (not identical) funds to maintain exposure while capturing the tax benefit.\n\n**Estate Planning Basics:**\n- **Will**: Directs asset distribution; avoids intestate laws deciding for you\n- **Beneficiary designations**: Override a will — keep retirement accounts + life insurance updated\n- **Power of Attorney**: Designates who manages your affairs if incapacitated\n- **Revocable Living Trust**: Avoids probate (costly + public); useful when net worth exceeds ~$1M\n- **Review annually**: Life events (marriage, children, divorce) require updates",
          highlight: ["business ownership", "tax-loss harvesting", "will", "beneficiary", "trust", "estate planning", "Roth"],
        },
        {
          type: "quiz-mc",
          question:
            "What do most self-made millionaires have in common according to 'The Millionaire Next Door' by Thomas Stanley?",
          options: [
            "They live below their means and invest consistently over long periods",
            "They earned high incomes from high-status professions like medicine or law",
            "They inherited significant wealth and grew it through real estate",
            "They took concentrated bets on individual stocks and won",
          ],
          correctIndex: 0,
          explanation:
            "Stanley's landmark research found that most millionaires are 'prodigious accumulators of wealth' — they live frugally relative to income, drive modest cars, avoid lifestyle inflation, and invest the gap consistently in index funds or businesses. High income is helpful but not sufficient — frugality and consistent investing are the common denominators.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Beneficiary designations on retirement accounts and life insurance policies override instructions in your will.",
          correct: true,
          explanation:
            "True. Beneficiary designations are legally binding contracts between you and the financial institution or insurer. They supersede your will entirely. This means an ex-spouse listed as beneficiary on a 401k will receive those funds even if your will says otherwise. Reviewing and updating beneficiary designations after life events (marriage, divorce, birth of children) is a critical estate planning action.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Sam earns $120,000/year and receives a 4% 401(k) match from their employer. Sam currently contributes 3% to their 401(k) (leaving 1% of match uncaptured), does not have an HSA, and keeps $50,000 in a taxable savings account earning 4% (fully taxable). Sam is in the 24% federal tax bracket.",
          question:
            "What is Sam's single highest-impact financial optimization?",
          options: [
            "Increase 401(k) to at least 4% to capture the full employer match — an immediate 100% return on that extra 1%",
            "Move the $50,000 to a taxable brokerage and invest in dividend stocks",
            "Open a whole life insurance policy for the tax-deferred cash value",
            "Pay extra principal on any existing mortgage to build equity faster",
          ],
          correctIndex: 0,
          explanation:
            "The full employer match is an immediate 100% return before any investment gains — no other strategy comes close. Sam is leaving $1,200/year on the table ($120,000 × 1%). After capturing the full match, Sam should evaluate opening an HSA (if on an HDHP) and then maximize remaining retirement account space. The taxable savings account optimization comes later in the priority order.",
          difficulty: 3,
        },
      ],
    },
  ],
};
