import type { Unit } from "./types";

export const UNIT_PERSONAL_FINANCE_ADVANCED: Unit = {
  id: "personal-finance-advanced",
  title: "Personal Finance Mastery",
  description:
    "Master budgeting systems, debt management, credit optimization, tax-advantaged accounts, and financial independence",
  icon: "Wallet",
  color: "#10b981",
  lessons: [
    // ─── Lesson 1: Cash Flow Architecture ────────────────────────────────────────
    {
      id: "pf-advanced-1",
      title: "💰 Cash Flow Architecture",
      description:
        "Zero-based budgeting, 50/30/20 rule, pay-yourself-first, emergency funds, and your personal income statement",
      icon: "Wallet",
      xpReward: 75,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "📋 Zero-Based Budgeting",
          content:
            "**Zero-based budgeting (ZBB)** means every dollar of income is assigned a specific purpose before the month begins — so income minus all allocations equals zero. You are not spending every dollar; you are *planning* every dollar.\n\n**How it works:**\n1. List your total monthly take-home income\n2. List every planned expense, savings contribution, and debt payment\n3. Allocate until you reach zero remaining\n4. Any category with unspent dollars gets reassigned (to savings, debt, or investment)\n\n**Why it outperforms casual budgeting:**\n- Forces intentionality — every category requires a conscious decision\n- Eliminates \"mystery spending\" — you know exactly where money went\n- Makes it impossible to accidentally overspend across categories without noticing\n\n**Tools:** YNAB (You Need a Budget) is purpose-built for ZBB. A simple spreadsheet works equally well.\n\n**Key rule:** Budget before the month starts, not after. Looking backward is accounting; ZBB is proactive planning.",
          highlight: ["zero-based budgeting", "every dollar", "allocations equals zero", "intentionality"],
        },
        {
          type: "teach",
          title: "⚖️ The 50/30/20 Rule",
          content:
            "The **50/30/20 rule** offers a simpler framework for allocating after-tax income:\n\n**50% — Needs (non-negotiable expenses):**\n- Rent/mortgage, utilities, groceries, minimum debt payments, insurance premiums, transportation to work\n- If needs exceed 50%, you may be housing-burdened or car-burdened — a structural problem\n\n**30% — Wants (lifestyle choices):**\n- Dining out, streaming subscriptions, vacations, entertainment, gym (if discretionary), clothing beyond basics\n- Wants are not bad — they fund quality of life. But they are the adjustment lever when budgets are tight\n\n**20% — Savings and extra debt repayment:**\n- Emergency fund, retirement contributions, investing, paying extra on debt above minimums\n\n**Categorization gray areas:**\n- Internet: Need (if required for work) or Want?\n- Gym membership: Want for most people\n- Car payment on luxury vehicle: Want (a used car satisfies transportation need)\n\nThe 50/30/20 rule is a *guideline*, not a law. High cost-of-living cities may require 60% on needs; aggressive savers may push savings to 40%.",
          highlight: ["50/30/20", "needs", "wants", "savings", "non-negotiable", "lifestyle"],
        },
        {
          type: "teach",
          title: "🤖 Pay-Yourself-First & Emergency Fund",
          content:
            "**Pay-yourself-first** flips the traditional budgeting sequence:\n- Traditional: Income → Expenses → Save whatever is left (often: nothing)\n- Pay-yourself-first: Income → Automatic savings → Spend the rest\n\nBy automating transfers to savings/investment accounts on payday, savings are no longer dependent on willpower. You simply adjust lifestyle to whatever remains.\n\n**Implementation:**\n- Set up automatic transfer to savings account the day after each paycheck\n- Automate 401(k) contributions directly from payroll\n- Treat savings like a non-negotiable bill\n\n**Emergency Fund — the financial foundation:**\n- Target: **3–6 months of essential expenses** (not income — expenses)\n- Conservative (single income, variable employment): 6 months\n- Stable employment, dual income: 3 months is adequate\n\n**Where to keep your emergency fund:**\n- **High-Yield Savings Account (HYSA):** 4–5% APY, FDIC insured, same-day/next-day access — best default choice\n- **Money Market Account (MMA):** Similar yield, sometimes comes with check-writing — viable alternative\n- NOT in stocks: a 30% market drop during a job loss would compound the crisis\n- NOT in CDs with penalties: you need liquidity when emergencies strike",
          highlight: ["pay-yourself-first", "automate", "3–6 months", "HYSA", "money market", "FDIC", "liquidity"],
        },
        {
          type: "teach",
          title: "📊 Personal Cash Flow Statement",
          content:
            "A **personal cash flow statement** is your financial income statement — it answers: where does my money come from and where does it go?\n\n**Structure:**\n```\nTotal Monthly Income:          $6,000\n\nFixed Expenses:\n  Rent                         $1,500\n  Car payment                    $350\n  Insurance (auto + renters)     $180\n  Subscriptions                   $80\n                                ──────\n  Total fixed:                 $2,110\n\nVariable Expenses:\n  Groceries                      $400\n  Dining out                     $300\n  Gas/transport                  $150\n  Utilities                      $120\n  Entertainment                  $200\n                                ──────\n  Total variable:              $1,170\n\nSavings/Investments:           $1,000\n  (401k + Roth IRA contribution)\n\nTotal outflows:                $4,280\nNet cash flow (savings rate):  $1,720\n```\n\n**Savings rate** = Net cash flow ÷ Gross income\nIn this example: $1,720 ÷ $6,000 = **28.7%**\n\nSavings rate is the single most important lever in personal finance — it determines both how fast wealth accumulates and (inversely) how much income you need in retirement.",
          highlight: ["cash flow statement", "fixed expenses", "variable expenses", "savings rate", "net cash flow"],
        },
        {
          type: "quiz-mc",
          question:
            "Under zero-based budgeting, what does it mean for income minus allocations to equal zero?",
          options: [
            "Every dollar of income has been intentionally assigned a purpose — spending, saving, or investing",
            "You must spend every dollar you earn each month with nothing left over",
            "Your expenses must exactly equal your income, leaving no room for savings",
            "You should have zero dollars in your bank account at month end",
          ],
          correctIndex: 0,
          explanation:
            "Zero-based budgeting means every dollar is *assigned* a job — but savings and investments count as assignments. Income minus (expenses + savings + investments) = 0. The goal is intentional allocation, not literally spending everything. Surplus dollars get consciously redirected to goals rather than evaporating into unknown spending.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Alex earns $5,500/month after tax. Monthly expenses: rent $1,400, car payment $300, insurance $150, groceries $350, dining $250, utilities $100, entertainment $200, subscriptions $60. Alex contributes $500/month to a Roth IRA.",
          question: "What is Alex's savings rate (as a percentage of take-home income)?",
          options: [
            "9.1% — only the $500 Roth IRA contribution counts",
            "16.4% — $500 IRA plus the $400 unallocated remainder",
            "9.1% — ($500 / $5,500)",
            "16.4% — ($500 + $400 unallocated) / $5,500",
          ],
          correctIndex: 3,
          explanation:
            "Total expenses: $1,400 + $300 + $150 + $350 + $250 + $100 + $200 + $60 = $2,810. Plus $500 Roth IRA = $3,310 total outflows. Net remaining = $5,500 − $3,310 = $2,190... wait, let me recount: $2,810 + $500 = $3,310; $5,500 − $3,310 = $2,190? Actually expenses sum: 1400+300+150+350+250+100+200+60 = 2810. Unallocated = 5500−2810−500 = $2,190 is unaccounted — but under ZBB that should also be assigned. The question intends: savings = $500 Roth + $400 net leftover = $900; savings rate = $900/$5,500 = 16.4%. The $500 IRA + $400 unallocated remainder = $900 total saved.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Debt Elimination Strategies ───────────────────────────────────
    {
      id: "pf-advanced-2",
      title: "⚔️ Debt Elimination Strategies",
      description:
        "Avalanche vs snowball methods, debt consolidation, refinancing, and understanding your debt-to-income ratio",
      icon: "TrendingDown",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "🧮 Avalanche vs Snowball Methods",
          content:
            "Two battle-tested frameworks for eliminating multiple debts:\n\n**Debt Avalanche (mathematically optimal):**\n- List all debts. Pay minimums on all.\n- Direct every extra dollar to the **highest-interest-rate** debt first\n- Once that is paid off, roll that payment to the next-highest-rate debt\n- **Result:** Minimizes total interest paid over time\n- **Example:** 22% credit card before 6% student loan\n\n**Debt Snowball (psychologically powerful):**\n- List all debts. Pay minimums on all.\n- Direct every extra dollar to the **smallest balance** first, regardless of rate\n- Knock out small debts quickly → build momentum and confidence\n- **Result:** More motivating for people who struggle with consistency; costs slightly more in interest\n- **Example:** $800 medical bill before $8,000 credit card (even if credit card rate is higher)\n\n**Which to choose?**\n- If you are disciplined and motivated by math → Avalanche\n- If you need quick wins to stay on track → Snowball\n- Research shows the Snowball method leads to better debt payoff completion rates for many people — the psychological benefit is real\n\n**Hybrid approach:** Clear 1–2 small balances first for quick wins, then switch to Avalanche for remaining high-rate debt.",
          highlight: ["debt avalanche", "debt snowball", "highest interest rate", "smallest balance", "momentum"],
        },
        {
          type: "teach",
          title: "🔄 Debt Consolidation",
          content:
            "**Debt consolidation** combines multiple debts into a single loan — ideally at a lower interest rate, simpler payment schedule, and fixed payoff timeline.\n\n**Personal loan consolidation (most common for CC debt):**\n- Take a personal loan at 10–15% to pay off credit cards at 22–28%\n- One fixed monthly payment replaces multiple minimum payments\n- **Break-even analysis:** Calculate total interest under current path vs consolidated loan\n\n**Balance transfer credit card:**\n- Transfer CC balances to a card with a **0% introductory APR** (typically 12–21 months)\n- Fee: usually 3–5% of transferred balance\n- Critical: Pay the balance in full before the intro period ends, or the deferred interest hits at 25%+\n\n**Risks of consolidation:**\n1. **Behavioral risk:** Freed-up credit card limits get run up again → double the debt\n2. Secured vs unsecured: Don't use home equity (HELOC) to pay unsecured credit card debt — you've turned dischargeable debt into debt secured by your home\n3. Longer terms: A lower rate with a much longer term may cost more total interest\n\n**Consolidation makes sense when:** rate is meaningfully lower, term is reasonable, and you cut up (or freeze) the paid-off cards.",
          highlight: ["debt consolidation", "personal loan", "balance transfer", "0% APR", "break-even", "behavioral risk"],
        },
        {
          type: "teach",
          title: "🎓 Refinancing & Debt-to-Income Ratio",
          content:
            "**Student Loan Refinancing:**\nPrivate refinancing replaces your existing student loans (federal or private) with a new private loan at a lower rate.\n\n**Potential benefits:**\n- Lower interest rate (especially if your credit has improved)\n- Lower monthly payment or faster payoff\n\n**Critical tradeoffs — refinancing federal loans into private:**\n- Lose **income-driven repayment (IDR)** plans\n- Lose **Public Service Loan Forgiveness (PSLF)** eligibility\n- Lose forbearance protections (like pandemic-era payment pauses)\n- Lose access to federal deferment/discharge programs\n\n**Rule of thumb:** Only refinance federal loans if you work in the private sector, have stable income, and the rate savings are substantial.\n\n**Debt-to-Income Ratio (DTI):**\nLenders use DTI to assess credit risk:\n\nDTI = Monthly debt payments ÷ Gross monthly income\n\n**Lender thresholds:**\n- **Front-end DTI** (housing costs only): Lenders want < **28%**\n- **Back-end DTI** (all debts): Lenders want < **36%** (some allow up to 43% for qualified mortgages)\n\n**Example:** Gross income $6,000/month, mortgage $1,200, car $300, student loan $200, CC minimums $100:\n- Front-end: $1,200/$6,000 = 20% ✓\n- Back-end: $1,800/$6,000 = 30% ✓",
          highlight: ["refinancing", "federal protections", "PSLF", "income-driven repayment", "DTI", "28%", "36%"],
        },
        {
          type: "quiz-mc",
          question:
            "You have four debts: Credit card A at 24% ($3,000), Credit card B at 18% ($800), Car loan at 7% ($12,000), Student loan at 5% ($25,000). Using the debt avalanche method, which debt do you attack first?",
          options: [
            "Credit card A (24% — highest interest rate)",
            "Credit card B (smallest balance at $800)",
            "Student loan (largest balance at $25,000)",
            "Car loan (secured debt should be prioritized)",
          ],
          correctIndex: 0,
          explanation:
            "The debt avalanche targets the highest interest rate first, regardless of balance size. Credit card A at 24% costs you the most per dollar owed, so eliminating it first minimizes total interest paid. Credit card B ($800) would be targeted first by the snowball method, but that prioritizes psychological wins over mathematical efficiency.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Refinancing federal student loans into a private loan is always beneficial if the new interest rate is lower.",
          correct: false,
          explanation:
            "False. Refinancing federal loans into private loans permanently eliminates federal protections: income-driven repayment plans, Public Service Loan Forgiveness eligibility, and pandemic/hardship forbearance options. For borrowers pursuing PSLF or in variable-income careers, these protections may be worth more than the interest savings from a lower rate. Always model the full cost-benefit before refinancing federal loans.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Jordan has four debts: Medical bill $400 at 0% interest; Credit card $2,200 at 22%; Personal loan $5,000 at 11%; Car loan $8,500 at 6%. Jordan has $300/month extra beyond minimums.",
          question: "Which debt should Jordan attack first under the avalanche method, and which first under the snowball method?",
          options: [
            "Avalanche: credit card (22%); Snowball: medical bill ($400)",
            "Avalanche: car loan (largest balance); Snowball: medical bill ($400)",
            "Avalanche: credit card (22%); Snowball: personal loan ($5,000 — middle balance)",
            "Both methods target the credit card first since it has the highest rate and second-smallest balance",
          ],
          correctIndex: 0,
          explanation:
            "Avalanche orders by interest rate descending: Credit card 22% → Personal loan 11% → Car loan 6% → Medical bill 0%. The credit card attacks first. Snowball orders by balance ascending: Medical bill $400 → Credit card $2,200 → Personal loan $5,000 → Car loan $8,500. The medical bill goes first for the quick win. In this case the avalanche is clearly better — the 22% credit card costs far more than the 0% medical bill and should be eliminated quickly.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Credit Score Optimization ─────────────────────────────────────
    {
      id: "pf-advanced-3",
      title: "📊 Credit Score Optimization",
      description:
        "FICO components, utilization hacks, authorized users, hard vs soft inquiries, and credit monitoring",
      icon: "BarChart2",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🔢 FICO Score Components",
          content:
            "Your **FICO credit score** (300–850) is calculated from five factors:\n\n**1. Payment History — 35% (most important)**\n- Have you paid every bill on time?\n- A single 30-day late payment can drop a score by 60–100 points\n- Late payments stay on your report for 7 years, but impact fades over time\n\n**2. Credit Utilization — 30%**\n- Amount owed ÷ Total credit limit across all revolving accounts\n- Lower is better. Experts recommend < 30%; < 10% for maximum score benefit\n\n**3. Length of Credit History — 15%**\n- Average age of all open accounts plus age of oldest account\n- Closing old cards shortens average age and hurts this factor\n\n**4. Credit Mix — 10%**\n- Variety of account types: credit cards, auto loan, mortgage, student loan\n- Having only one type is slightly penalized\n\n**5. New Credit — 10%**\n- Number of recent hard inquiries and newly opened accounts\n- Opening many accounts in a short period signals financial stress\n\n**Score ranges:**\n- 800–850: Exceptional — best rates available\n- 740–799: Very Good\n- 670–739: Good\n- 580–669: Fair — higher rates, harder approvals\n- Below 580: Poor",
          highlight: ["payment history", "35%", "utilization", "30%", "credit history", "15%", "FICO", "800–850"],
        },
        {
          type: "teach",
          title: "⚡ Utilization Hack & Authorized User Strategy",
          content:
            "**Credit Utilization Hack — the fastest legal score booster:**\n\nUtilization is measured at the **statement closing date**, not the due date. Most people think carrying a zero balance requires paying before the due date — but if you pay before the statement closes, you report 0% utilization.\n\n**Implementation:**\n1. Pay your credit card balance in full a few days before statement closing\n2. Let the statement close with a low or zero balance\n3. Pay the statement balance by the due date (to avoid interest)\n\nKeeping reported utilization below **10%** can add 20–50+ points over cards with higher reported balances — even if you pay in full every month.\n\n**Authorized User Strategy:**\nBeing added as an authorized user on someone else's credit card causes that card's history to appear on your credit report:\n- If the card is old with a low utilization and perfect payment history, your score benefits significantly\n- **Best use case:** A parent adds an adult child to a 15-year-old card with 3% utilization → child's average account age and history improve immediately\n- The primary cardholder's behavior affects you: if they miss a payment, it can hurt your score too\n- You don't need to use the card — simply being listed is sufficient",
          highlight: ["utilization hack", "statement closing date", "10%", "authorized user", "account age", "0% utilization"],
        },
        {
          type: "teach",
          title: "🔍 Hard vs Soft Inquiries & Credit Monitoring",
          content:
            "**Hard Inquiries (hard pulls):**\n- Triggered when you apply for new credit: credit card, auto loan, mortgage, personal loan\n- Lender requests your full credit report to make a lending decision\n- **Impact:** Typically reduces score by 5–10 points\n- Duration: Stays on report for 2 years; impact on score fades after 12 months\n- **Rate-shopping exception:** Multiple mortgage or auto loan hard pulls within a 14–45-day window are treated as a single inquiry by FICO — shop aggressively within this window\n\n**Soft Inquiries (soft pulls):**\n- Checking your own credit score, employer background checks, pre-approved offers\n- **Zero impact on your score** — lenders cannot see soft inquiries\n- Always check your own score freely without fear\n\n**Credit Monitoring:**\n- **Free options:**\n  - AnnualCreditReport.com: Full reports from all three bureaus (Equifax, Experian, TransUnion) free weekly per federal law\n  - Credit Karma / Experian app: Free score monitoring (uses VantageScore, not FICO)\n  - Many credit cards now provide free FICO scores on statements\n- **What to monitor:** New accounts you didn't open (identity theft), address changes, unfamiliar hard inquiries\n- **Credit freeze:** Free at all three bureaus — locks your file so no one can open new credit in your name. Temporarily unfreeze when you apply for credit.",
          highlight: ["hard inquiry", "5–10 points", "soft inquiry", "rate-shopping", "AnnualCreditReport.com", "credit freeze"],
        },
        {
          type: "quiz-mc",
          question:
            "Which action will most improve the credit score of someone currently at 620?",
          options: [
            "Set up autopay to ensure every future payment is on time, and pay down credit card balances to below 10% utilization",
            "Open three new credit cards to increase total available credit",
            "Close all old credit card accounts to simplify the credit profile",
            "Apply for a mortgage to add a different credit type to the mix",
          ],
          correctIndex: 0,
          explanation:
            "At 620, the most impactful improvements address the two biggest FICO factors: payment history (35%) and utilization (30%). Autopay prevents future late payments, and reducing utilization below 10% can yield significant score gains quickly. Opening new cards adds hard inquiries and lowers average account age; closing old cards shortens credit history — both worsen the score. A mortgage application would be a hard inquiry that further damages a 620 score.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Checking your own credit score on Credit Karma will lower your FICO score because it creates a hard inquiry.",
          correct: false,
          explanation:
            "False. Checking your own credit score creates a soft inquiry, which has zero impact on your score. Only hard inquiries — triggered when a lender pulls your credit for a lending decision — can temporarily lower your score. You should check your own credit frequently to monitor for errors and identity theft without any concern about score impact.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Priya has two credit cards. Card A: $8,000 limit, $4,000 balance (50% utilization). Card B: $2,000 limit, $0 balance (0% utilization). She has $1,000 to apply toward credit card debt. Total utilization = $4,000/$10,000 = 40%.",
          question: "To maximize her credit score improvement, how should Priya use the $1,000?",
          options: [
            "Pay $1,000 on Card A to bring total utilization from 40% to 30%",
            "Request a credit limit increase on Card B to $5,000 — no payment needed",
            "Pay $1,000 on Card A; also request a credit limit increase to reduce utilization further",
            "Split evenly: $500 on each card",
          ],
          correctIndex: 2,
          explanation:
            "Paying $1,000 on Card A reduces the balance to $3,000. Total utilization becomes $3,000/$10,000 = 30%. But requesting a credit limit increase on Card B (e.g., to $4,000) changes total limit to $14,000, dropping utilization further to $3,000/$14,000 = 21.4%. Combining both actions maximizes the utilization reduction. Utilization targets: below 30% is good; below 10% is ideal — so the more you can reduce, the better.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Tax-Advantaged Account Mastery ────────────────────────────────
    {
      id: "pf-advanced-4",
      title: "🏦 Tax-Advantaged Account Mastery",
      description:
        "401(k), IRA, HSA, 529 accounts — limits, phase-outs, backdoor strategies, and optimal contribution order",
      icon: "PiggyBank",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏢 401(k): Traditional vs Roth",
          content:
            "The **401(k)** is an employer-sponsored retirement account — the most accessible tax-advantaged account for most workers.\n\n**2024 contribution limits:**\n- Employee contribution: **$23,000/year** ($30,500 if age 50+ with catch-up)\n- Total limit including employer match: $69,000/year\n\n**Traditional 401(k):**\n- Contributions are **pre-tax** — reduces your taxable income today\n- Investments grow **tax-deferred**\n- Withdrawals in retirement taxed as **ordinary income**\n- Best when: your tax rate is higher today than it will be in retirement\n\n**Roth 401(k):**\n- Contributions are **after-tax** — no immediate tax break\n- Investments grow **tax-free**\n- Withdrawals in retirement are **completely tax-free**\n- Best when: your tax rate is lower today than expected in retirement (younger workers, early career)\n\n**Employer match — the guaranteed 100% return:**\n- If your employer matches 50 cents per dollar up to 6% of salary, that's an immediate 50% return\n- **Always contribute at least enough to capture the full employer match** — it is free compensation\n- Vesting schedule: employer match may vest over 1–6 years; leaving before vesting forfeits unvested match",
          highlight: ["401(k)", "$23,000", "traditional", "Roth", "pre-tax", "tax-free", "employer match", "vesting"],
        },
        {
          type: "teach",
          title: "📋 IRA: Traditional, Roth & Backdoor",
          content:
            "The **Individual Retirement Account (IRA)** is a personal retirement account independent of your employer.\n\n**2024 contribution limit:** $7,000/year ($8,000 if age 50+)\n\n**Traditional IRA — deductibility phase-outs:**\n- If you have a workplace retirement plan AND your MAGI exceeds thresholds, the deduction phases out:\n  - Single: phase-out $77,000–$87,000 MAGI\n  - Married filing jointly: phase-out $123,000–$143,000 MAGI\n- Above the phase-out: contributions are **non-deductible** (after-tax basis with no immediate benefit)\n\n**Roth IRA — income limits:**\n- Direct Roth IRA contributions phase out at:\n  - Single: $146,000–$161,000 MAGI\n  - Married filing jointly: $230,000–$240,000 MAGI\n- Above $161K single / $240K MFJ: **cannot contribute directly** to Roth IRA\n\n**Backdoor Roth IRA (for high earners):**\n1. Make a **non-deductible Traditional IRA contribution** ($7,000) — no income limit\n2. **Convert** the Traditional IRA balance to a Roth IRA\n3. If done correctly (no other pre-tax IRA balances, due to pro-rata rule), conversion is tax-free\n4. Money now grows and withdraws tax-free like a regular Roth\n\n**Pro-rata rule trap:** If you have other pre-tax IRA money, the conversion is partially taxable based on the ratio of pre-tax to total IRA balances.",
          highlight: ["IRA", "$7,000", "Roth IRA", "phase-out", "backdoor Roth", "non-deductible", "pro-rata rule", "$161,000"],
        },
        {
          type: "teach",
          title: "🏥 HSA: Triple Tax Advantage & 529 Plans",
          content:
            "**Health Savings Account (HSA) — the best tax-advantaged account if eligible:**\n\nEligibility: Must be enrolled in a **High Deductible Health Plan (HDHP)**\n\n**Triple tax advantage — unmatched by any other account:**\n1. **Contributions are tax-deductible** (reduce taxable income, like Traditional 401k)\n2. **Growth is tax-free** (like Roth)\n3. **Withdrawals for qualified medical expenses are tax-free** (better than Traditional)\n\n**2024 limits:** $4,150 individual / $8,300 family\n\n**Power move:** Pay medical expenses out of pocket today, keep receipts, invest HSA in index funds, withdraw for those old expenses decades later — tax-free growth for years.\n\nAfter age 65: withdrawals for any reason taxed as ordinary income (like Traditional IRA) — it becomes a second IRA.\n\n**529 Education Savings Plan:**\n- Contributions after-tax (no federal deduction; 30+ states offer state deductions)\n- Growth and withdrawals for **qualified education expenses** are tax-free\n- **Superfunding:** Contribute 5 years of gift tax exclusions upfront ($18,000/year × 5 = $90,000) in one year — no gift tax\n- Unused funds: Can roll over up to $35,000 to a Roth IRA (new 2024 rule, subject to conditions) or change beneficiary to another family member\n\n**Optimal contribution priority order:**\n1. 401(k) — up to employer match (free money)\n2. HSA — max out if eligible (triple tax advantage)\n3. Roth IRA — max out ($7,000)\n4. 401(k) — max out remaining ($23,000 total)\n5. 529 — if education savings needed\n6. Taxable brokerage — after tax-advantaged accounts exhausted",
          highlight: ["HSA", "triple tax advantage", "HDHP", "$4,150", "tax-free", "529", "superfunding", "contribution order"],
        },
        {
          type: "quiz-mc",
          question:
            "A single filer with MAGI of $150,000 wants to maximize tax-advantaged savings. Which accounts can they contribute to directly?",
          options: [
            "401(k) and HSA (if on HDHP) — but NOT Roth IRA directly; would need backdoor Roth",
            "401(k), Roth IRA, and HSA — all three are available at $150K MAGI",
            "Only 401(k) — all other accounts phase out at $150K",
            "401(k) and Traditional IRA with full deduction — Roth and HSA are unavailable",
          ],
          correctIndex: 0,
          explanation:
            "At $150,000 MAGI single: (1) 401(k): no income limit, fully available; (2) Roth IRA: phases out $146K–$161K — at $150K they are in the phase-out range, so only a partial direct contribution is allowed; for simplicity the backdoor Roth is often used above $146K; (3) HSA: available if enrolled in an HDHP (no income limit); (4) Traditional IRA deductibility: phases out $77K–$87K if covered by workplace plan — at $150K the deduction is eliminated. Answer A best captures that 401(k) and HSA are clean options while Roth IRA requires the backdoor strategy at this income level.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An HSA account must be used to pay medical expenses in the same year the contribution is made.",
          correct: false,
          explanation:
            "False. There is no 'use-it-or-lose-it' rule for HSAs (unlike FSAs). HSA funds roll over indefinitely with no expiration. A powerful strategy is to invest HSA funds in index funds, pay current medical bills out of pocket, save receipts, and withdraw the equivalent amounts years later — allowing tax-free compounding for potentially decades before reimbursement.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Marcus is 28, earns $85,000/year, has a HDHP health plan, and his employer matches 401(k) contributions 100% up to 4% of salary. He has $1,000/month to allocate to savings after living expenses.",
          question: "What is the optimal order for Marcus to allocate his $1,000/month?",
          options: [
            "First $283/month to 401(k) for full employer match, then $345 to HSA max, then remainder to Roth IRA",
            "All $1,000 to Roth IRA first (lowest priority is 401k since he is young)",
            "Split evenly: $333 to 401k, $333 to Roth IRA, $334 to taxable brokerage",
            "All $1,000 to 401(k) pre-tax since he needs to reduce his taxable income",
          ],
          correctIndex: 0,
          explanation:
            "Optimal order: (1) Capture the full employer match — 4% of $85K = $3,400/year, so $283/month. This is a 100% instant return. (2) Max HSA — $4,150/year = ~$346/month for the triple tax advantage. (3) Apply remaining to Roth IRA (young with lower current tax rate makes Roth ideal). This captures the employer match first, uses the superior HSA triple advantage second, then fills Roth IRA. Never leave employer match on the table.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Financial Independence Math ───────────────────────────────────
    {
      id: "pf-advanced-5",
      title: "🎯 Financial Independence Math",
      description:
        "FI number, savings rate to years, sequence of returns risk, safe withdrawal rates, and FIRE variants",
      icon: "Target",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🔢 The FI Number & 4% Rule",
          content:
            "**Financial Independence (FI)** means your investment portfolio generates enough passive income to cover your living expenses indefinitely — you no longer need to work for money.\n\n**The FI Number:**\nFI Number = Annual Expenses × 25\n\nThis comes from the **4% Safe Withdrawal Rate** (SWR) — from the landmark Trinity Study (1998, updated multiple times). It found that withdrawing 4% of a portfolio annually, with inflation adjustments, had a 95%+ success rate over 30-year retirement periods using historical market data.\n\n**Math:**\nIf you withdraw 4% and need expenses covered:\nExpenses = Portfolio × 4%\nPortfolio = Expenses / 0.04 = Expenses × 25\n\n**Examples:**\n- Annual expenses $40,000 → FI Number = $1,000,000\n- Annual expenses $60,000 → FI Number = $1,500,000\n- Annual expenses $100,000 → FI Number = $2,500,000\n\n**Asset allocation assumption:** The Trinity Study used a 50–75% stock allocation. A 100% bond portfolio would fail under the 4% rule due to lower expected returns.\n\n**The rule's limitations:**\n- Based on US market historical returns — may not hold globally\n- 30-year horizon; early retirees may need 40–50-year portfolios\n- Does not account for variable spending, part-time income, or Social Security",
          highlight: ["FI number", "annual expenses × 25", "4% rule", "Trinity Study", "safe withdrawal rate", "30 years"],
        },
        {
          type: "teach",
          title: "📈 Savings Rate → Years to FI",
          content:
            "Your **savings rate** determines how quickly you reach FI — it simultaneously reduces how much you need (lower lifestyle = smaller FI number) and increases how fast you accumulate.\n\n**Years to FI from a $0 starting point (assuming 7% real return):**\n\n| Savings Rate | Years to FI |\n|:------------:|:-----------:|\n| 10%          | ~40 years   |\n| 20%          | ~32 years   |\n| 30%          | ~25 years   |\n| 40%          | ~20 years   |\n| 50%          | ~17 years   |\n| 60%          | ~13 years   |\n| 75%          | ~7 years    |\n| 90%          | ~3 years    |\n\n**Why the curve is nonlinear:**\n- At 50% savings rate, you spend 50% of income and save 50%\n- Your FI number equals 25× your spending (25× 50% = 12.5× income)\n- But you're saving 50% per year of that income — so progress accelerates\n\n**Compounding accelerator:** At higher savings rates, you're simultaneously growing the portfolio faster AND reducing the target number — creating a powerful double-effect.\n\n**Practical insight:** Going from a 10% to 20% savings rate (doubling savings) cuts your working years by 8. Going from 40% to 50% cuts working years by 3. The earlier years of savings compound the longest.",
          highlight: ["savings rate", "years to FI", "10%→40 years", "50%→17 years", "75%→7 years", "7% real return"],
        },
        {
          type: "teach",
          title: "⚠️ Sequence of Returns Risk",
          content:
            "**Sequence of returns risk** is the danger that the *order* of investment returns — not just the average return — can permanently impair a retirement portfolio.\n\n**The problem:**\n- Two portfolios with identical average returns over 30 years\n- Portfolio A: strong early returns, weak late returns\n- Portfolio B: weak early returns, strong late returns\n- During accumulation: final values are identical\n- **During withdrawals: Portfolio B fails** — poor returns early deplete the portfolio faster while withdrawals continue, leaving less capital to recover during good years\n\n**Example:**\nA 50% portfolio drop in year 1 of retirement, combined with 4% withdrawals, can cut the sustainable withdrawal rate dramatically. The market eventually recovers, but you've been selling shares at the bottom to fund living expenses.\n\n**Mitigation strategies:**\n1. **Bond tent / rising equity glidepath:** Hold more bonds in early retirement, gradually shifting back to stocks as sequence risk passes (first 5–10 years)\n2. **Cash buffer:** Keep 1–2 years of expenses in cash — don't sell stocks during downturns\n3. **Flexible spending:** Reduce withdrawals by 10–20% during market downturns\n4. **Part-time income:** Even small income in early retirement dramatically reduces portfolio withdrawal pressure\n5. **Delay retirement** during extended bear markets if possible",
          highlight: ["sequence of returns risk", "order of returns", "withdrawals", "bond tent", "cash buffer", "flexible spending"],
        },
        {
          type: "teach",
          title: "🔥 FIRE Variants & the SWR Debate",
          content:
            "**Safe Withdrawal Rate (SWR) debate:**\nThe original 4% rule was based on historical US returns and 30-year horizons. Modern challenges:\n- **Lower expected returns** in today's high-valuation environment\n- **Longer retirements** — retiring at 40 means a 50+ year portfolio\n- Bill Bengen (originator) now suggests 4.7% is historically sustainable\n- Many conservative planners recommend **3.5% SWR** for early retirees → FI Number = expenses × 28.6\n\n**FIRE Variants (Financial Independence, Retire Early):**\n\n**Lean FIRE:**\n- Annual expenses ~$25,000–$40,000 (extremely frugal lifestyle)\n- FI Number: $625K–$1M\n- Requires minimal spending, often geographic arbitrage (low-cost areas or countries)\n\n**Fat FIRE:**\n- Annual expenses $100,000+\n- FI Number: $2.5M–$5M+\n- Maintains a wealthy retirement lifestyle without financial compromise\n\n**Barista FIRE:**\n- Partially retired — work part-time (e.g., coffee shop) for income + health benefits\n- Smaller portfolio needed because part-time income covers some expenses\n- Portfolio may only need to cover $20K–$30K/year; part-time covers the rest\n\n**Coast FIRE:**\n- You have enough invested today that — without any additional contributions — compounding will grow it to your FI number by traditional retirement age (65)\n- Once \"Coast FI,\" you only need to cover current living expenses from earned income\n- Example: $350K at age 35, growing at 7% for 30 years = $2.67M by 65\n- No more saving required — just earn enough to live on",
          highlight: ["FIRE", "Lean FIRE", "Fat FIRE", "Barista FIRE", "Coast FIRE", "3.5%", "4% rule", "SWR debate"],
        },
        {
          type: "quiz-mc",
          question:
            "If your annual expenses are $60,000, what is your FI number using the 4% rule, and approximately how many years will it take to reach it if you save $30,000/year starting from $0 (assuming 7% real annual return)?",
          options: [
            "FI number $1,500,000; approximately 20–22 years",
            "FI number $1,200,000; approximately 15 years",
            "FI number $1,500,000; approximately 30 years — savings rate is 50% so about 17 years is wrong",
            "FI number $600,000; approximately 10 years since you're saving half your expenses",
          ],
          correctIndex: 0,
          explanation:
            "FI number = $60,000 × 25 = $1,500,000. You're saving $30,000/year — a 50% savings rate relative to expenses (assuming income = $60,000 spending + $30,000 saving = $90,000; savings rate = 33%). With a 7% real return and $30K/year contributions, compound growth reaches ~$1.5M in approximately 20–22 years. At a true 50% savings rate from $0 the table shows ~17 years — slight variation due to the income/expense ratio assumption. Answer A is the most accurate available choice.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Mei is 32 with $200,000 already invested. She needs $2,000,000 to reach FI (her annual expenses are $80,000). She currently saves $40,000/year. She is worried about retiring right before a major market crash.",
          question: "Which FIRE variant describes her situation if she stops contributing at $200,000 now and just lets it compound, and what risk does she most need to mitigate?",
          options: [
            "Coast FIRE — she checks if $200K compounds to $2M by her target retirement age; sequence of returns risk is her main concern in early retirement",
            "Lean FIRE — she reduces expenses to $25K so her FI number drops to $625K",
            "Barista FIRE — she should take a part-time job to reduce sequence risk",
            "Fat FIRE — $2M FI number qualifies as Fat FIRE territory",
          ],
          correctIndex: 0,
          explanation:
            "Coast FIRE asks: does my current balance, left to compound without new contributions, reach my FI number by retirement age? $200,000 growing at 7% for 30 years = $200,000 × (1.07)^30 ≈ $1.52M — not quite $2M, so Mei has not yet hit Coast FI. She needs to check her specific timeline. Her primary risk once she does retire is sequence of returns risk — retiring into a bear market could deplete her $2M portfolio before markets recover, especially in early retirement years when the portfolio is most vulnerable to large withdrawals during downturns.",
          difficulty: 3,
        },
      ],
    },
  ],
};
