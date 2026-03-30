import type { Unit } from "./types";

export const UNIT_PERSONAL_BUDGETING: Unit = {
 id: "personal-budgeting",
 title: "Personal Budgeting Fundamentals",
 description:
 "Master budgeting methods, cash flow management, emergency funds, debt elimination, savings goals, and net worth tracking",
 icon: "",
 color: "#10b981",
 lessons: [
 // Lesson 1: Budgeting Methods 
 {
 id: "pb-budgeting-methods",
 title: "Budgeting Methods",
 description:
 "50/30/20 rule, zero-based budgeting, envelope method, and pay-yourself-first — pros and cons of each",
 icon: "PieChart",
 xpReward: 60,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "The 50/30/20 Rule",
 content:
 "The **50/30/20 rule** divides your after-tax income into three broad buckets:\n\n**50% Needs**: Rent/mortgage, groceries, utilities, minimum debt payments, health insurance, transportation to work. These are expenses you cannot reasonably eliminate.\n\n**30% Wants**: Dining out, subscriptions, gym membership, hobbies, vacations, new clothes beyond basics. You could cut these if necessary.\n\n**20% Savings & Extra Debt Payments**: Emergency fund, 401(k)/IRA contributions, index fund investments, and any debt payments *above* the required minimum.\n\n**Example on $5,000/month take-home:**\n- Needs ($2,500): Rent $1,400, groceries $350, utilities $120, insurance $380, bus pass $250\n- Wants ($1,500): Dining $400, streaming $60, gym $50, entertainment $990\n- Savings ($1,000): 401(k) $500, emergency fund $300, extra student loan payment $200\n\n**Pros**: Simple to follow, no spreadsheet required, broad enough to accommodate irregular months.\n**Cons**: Doesn't distinguish within categories, may not work in high cost-of-living cities where needs exceed 50%.",
 highlight: ["50/30/20", "needs", "wants", "savings"],
 visual: "portfolio-pie",
 },
 {
 type: "teach",
 title: "Zero-Based Budgeting & Envelope Method",
 content:
 "**Zero-Based Budgeting (ZBB)** assigns every dollar a specific job so that:\nIncome All Assigned Categories = $0\n\nThis does NOT mean spending everything — it means every dollar is *intentionally directed* before the month begins.\n\n**How it works:**\n1. Start with total monthly take-home pay\n2. List every spending category (fixed: rent, car; variable: groceries, dining)\n3. Assign a dollar amount to each category\n4. Any leftover is explicitly assigned to savings or debt\n5. Track actual spending throughout the month and adjust\n\n**Example — $4,200 take-home:**\nRent $1,200 | Groceries $400 | Utilities $110 | Car $280 | Insurance $130 | Dining $180 | Fun $120 | Clothes $80 | Emergency fund $400 | Roth IRA $583 | Extra debt $717 = $4,200 \n\n**Envelope Method**: A cash-based variation — put physical cash into labeled envelopes for each category (groceries, dining, entertainment). When the envelope is empty, spending in that category stops for the month. Modern digital equivalents: separate sub-accounts at an online bank or app-based 'virtual envelopes' in tools like YNAB.\n\n**Pros**: Maximum visibility and control; psychologically prevents overspending when cash is visible.\n**Cons**: Time-intensive; requires monthly setup; cash envelopes impractical for online purchases.",
 highlight: ["zero-based budgeting", "envelope method", "categories", "YNAB"],
 },
 {
 type: "teach",
 title: "Pay Yourself First",
 content:
 "**Pay-Yourself-First (PYF)** is the simplest and most psychologically powerful budgeting strategy:\n\n1. On payday, immediately transfer a fixed amount to savings/investments *before* paying any other bills\n2. Live on whatever remains\n\nNo spreadsheet, no tracking required — the automation does the work.\n\n**Implementation steps:**\n- Set up automatic transfers to trigger the same day as your paycheck deposit\n- Direct 401(k) contributions go in before you even see the money (already 'paying yourself first' for retirement)\n- Set a separate auto-transfer to a high-yield savings account (HYSA) for your emergency fund and other goals\n- Direct excess to a brokerage or Roth IRA for investing\n\n**Why it works**: Human psychology tends to spend available money. By removing savings before discretionary spending decisions are made, you eliminate willpower from the equation.\n\n**Comparison summary:**\n| Method | Best For | Effort |\n|--------|----------|--------|\n| 50/30/20 | Budgeting beginners | Low |\n| Zero-based | Full control seekers | High |\n| Envelope | Overspenders (cash) | Medium |\n| Pay yourself first | Set-and-forget savers | Very Low |",
 highlight: ["pay yourself first", "automation", "savings", "HYSA", "401(k)"],
 },
 {
 type: "quiz-mc",
 question:
 "Under the 50/30/20 rule, which of the following belongs in the 'Needs' category?",
 options: [
 "Monthly Netflix subscription and gym membership",
 "Minimum car insurance payment and rent",
 "Extra 401(k) contributions above the employer match",
 "Annual vacation savings and dining out budget",
 ],
 correctIndex: 1,
 explanation:
 "Car insurance and rent are non-negotiable essential expenses that belong in the 50% Needs bucket. Netflix and gym are Wants (30%), extra 401(k) and vacation savings belong in the 20% Savings & Debt bucket.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "In zero-based budgeting, if your income is $5,000 and your total assigned categories sum to $4,800, your budget is complete.",
 correct: false,
 explanation:
 "False. Zero-based budgeting requires every dollar to be assigned a job. The remaining $200 must be explicitly allocated to a category — savings, debt paydown, or a discretionary fund — so the total equals exactly $5,000. Unassigned dollars tend to disappear without accountability.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Income & Expense Tracking 
 {
 id: "pb-income-expense",
 title: "Income & Expense Tracking",
 description:
 "Fixed vs variable expenses, needs vs wants, personal cash flow statement, and calculating net monthly income",
 icon: "BarChart2",
 xpReward: 65,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Fixed vs Variable Expenses",
 content:
 "Every expense you have falls into one of two categories:\n\n**Fixed Expenses** — the same dollar amount every month:\n- Rent or mortgage payment\n- Car loan payment\n- Student loan minimum payment\n- Insurance premiums (health, auto, renters)\n- Subscription services with set fees\n\nFixed expenses are predictable and easy to budget — you know exactly what they cost.\n\n**Variable Expenses** — amount changes month to month:\n- Groceries ($280 one month, $340 the next)\n- Electricity (higher in summer)\n- Dining and entertainment\n- Gas and transportation\n- Clothing and personal care\n- Medical copays and prescriptions\n\n**Periodic / Irregular Expenses** — occur infrequently but are predictable:\n- Car registration ($200/year set aside $17/month)\n- Annual subscriptions (Amazon Prime $15/month equivalent)\n- Holiday gifts ($600/year $50/month)\n- Car maintenance ($1,200/year $100/month)\n\nThe trick with periodic expenses: **sinking fund** them monthly so they don't blow your budget when they arrive. Divide annual cost by 12 and save that amount every month in a dedicated sub-account.",
 highlight: ["fixed expenses", "variable expenses", "periodic expenses", "sinking fund"],
 },
 {
 type: "teach",
 title: "Needs vs Wants & Personal Cash Flow",
 content:
 "**Distinguishing Needs from Wants:**\nA **need** is something required for basic functioning and safety. A **want** is something that improves quality of life but could be eliminated.\n\n| Expense | Classification | Note |\n|---------|---------------|------|\n| Rent | Need | Basic shelter |\n| Groceries (basic) | Need | Essential nutrition |\n| Dining at restaurants | Want | Food available at home |\n| Health insurance | Need | Catastrophic risk protection |\n| Cable TV | Want | Entertainment |\n| Internet (WFH) | Need (sometimes) | Essential for remote work |\n| New iPhone upgrade | Want | Old phone still works |\n| Car insurance | Need | Legal requirement |\n\nThe line can blur. A gym membership may feel like a need for your mental health — that's okay. The goal is honest classification so you understand where flexibility exists.\n\n**Personal Cash Flow Statement:**\nNet Monthly Cash Flow = Total Monthly Income Total Monthly Expenses\n\n**Income sources to track**: Salary (after tax), freelance/side income, rental income, dividends/interest, government benefits.\n\n**Example:**\nIncome: $5,400\nFixed expenses: $2,100 | Variable expenses: $900 | Periodic (monthly set-aside): $250\nTotal expenses: $3,250\nNet cash flow: **+$2,150** positive = you can save and invest\n\nNegative net cash flow means you are spending more than you earn — debt is accumulating.",
 highlight: ["needs", "wants", "cash flow", "net income", "personal cash flow statement"],
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following is the best way to handle a predictable but infrequent expense, like a $600 annual car registration?",
 options: [
 "Set aside $50/month in a dedicated savings sub-account starting now",
 "Pay it from the emergency fund when it arrives and replenish later",
 "Charge it to a credit card and pay the minimum each month",
 "Ignore it in the monthly budget since it only happens once a year",
 ],
 correctIndex: 0,
 explanation:
 "Periodic expenses like annual registration should be 'sunk' monthly: $600 ÷ 12 = $50/month into a dedicated sub-account. This converts a large irregular bill into a predictable budget line and prevents it from derailing your monthly cash flow. Using the emergency fund for predictable expenses is incorrect — the emergency fund is for genuinely unexpected events.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Maya earns $5,800/month after taxes. Her fixed expenses total $2,400, variable expenses average $950, and periodic expenses amount to $200/month when annualized. She has no other income sources.",
 question:
 "What is Maya's estimated net monthly cash flow?",
 options: [
 "$2,250 — ($5,800 $2,400 $950 $200)",
 "$3,400 — subtracting only fixed expenses",
 "$1,050 — only counting variable and periodic expenses",
 "$200 — because periodic expenses are an extra burden",
 ],
 correctIndex: 0,
 explanation:
 "Net cash flow = Income All Expenses = $5,800 $2,400 $950 $200 = $2,250. This positive figure is available for savings, investing, and extra debt payments. If Maya budgets this $2,250 intentionally, she can build significant wealth over time.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A high income always guarantees a positive net monthly cash flow.",
 correct: false,
 explanation:
 "False. Cash flow depends on the gap between income and expenses — not income alone. Many high earners have negative cash flow due to lifestyle inflation (expensive homes, luxury cars, frequent travel). A person earning $200,000/year but spending $220,000 has negative cash flow, while someone earning $60,000 and spending $45,000 has a healthy positive cash flow. Income without spending discipline does not create wealth.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 3: Emergency Fund 
 {
 id: "pb-emergency-fund",
 title: "Emergency Fund",
 description:
 "3-6 month rule, liquid vs invested, where to keep it, how to build it, and rebuilding after use",
 icon: "Shield",
 xpReward: 60,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Why You Need an Emergency Fund",
 content:
 "An **emergency fund** is a dedicated cash reserve that covers genuine financial emergencies — job loss, medical bills, major car or home repair, unexpected travel for a family crisis.\n\n**What it is NOT for:**\n- Vacation (that's a planned expense — use a sinking fund)\n- Holiday gifts (predictable — budget monthly)\n- Home renovations you planned\n- Upgrading your phone or laptop\n\n**The 3–6 Month Rule:**\nYour emergency fund should hold **3 to 6 months of essential living expenses** — not total expenses, just the bare minimum to survive: rent, groceries, utilities, insurance, and minimum debt payments.\n\nExample: If your essential monthly costs are $2,800, your target emergency fund is $8,400–$16,800.\n\n**How much to keep — calibrate based on your risk:**\n- **3 months**: Stable government or corporate job, dual-income household, no dependents, good health\n- **4–5 months**: Single income, young children, moderate job security\n- **6 months**: Freelancer/self-employed, single-income household, volatile industry (tech layoffs, seasonal work), older dependents, chronic health conditions\n- **6–12 months**: Business owner, commission-based income, niche skills with longer re-employment time\n\nThe emergency fund is **insurance, not investment**. Its purpose is certainty and accessibility, not maximizing returns.",
 highlight: ["emergency fund", "3-6 months", "essential expenses", "liquid"],
 },
 {
 type: "teach",
 title: "Where to Keep Your Emergency Fund",
 content:
 "Your emergency fund must be:\n1. **Liquid** — accessible within 1–3 business days without penalties\n2. **Safe** — not subject to market fluctuations (cannot be down 20% when you need it)\n3. **Earning something** — shouldn't lose to inflation unnecessarily\n\n**Best options:**\n\n**High-Yield Savings Account (HYSA):**\n- FDIC insured up to $250,000\n- 4–5% APY in 2026 (vs. 0.01% at big banks)\n- Transfers take 1–2 business days\n- The gold standard for most people\n\n**Money Market Account (MMA):**\n- Similar to HYSA with slightly different structure\n- Some offer check-writing or debit card access for immediate use\n- FDIC or NCUA insured\n\n**Treasury Bills (T-Bills) — advanced:**\n- 4-week to 26-week government debt, competitive yields\n- Tax-exempt at state/local level\n- Slight illiquidity (must wait for maturity or sell on secondary market)\n- Appropriate only if you have a strong primary buffer already liquid\n\n**What NOT to use:**\n- Regular savings account at a big bank (0.01% APY — you're losing to inflation)\n- Stock market / index funds (could be down 30–40% exactly when you need it most)\n- CDs unless short-term (early withdrawal penalties defeat the purpose)\n- Cash at home (no interest, theft/fire risk beyond small amounts)",
 highlight: ["HYSA", "high-yield savings", "liquid", "FDIC insured", "money market"],
 },
 {
 type: "teach",
 title: "Building & Rebuilding Your Emergency Fund",
 content:
 "**Building from zero:**\n\nStep 1 — Start small: Before anything else, establish a **$1,000 starter emergency fund**. This covers the most common small emergencies (car repair, minor medical bill) and prevents you from going into debt immediately.\n\nStep 2 — Automate: Set an automatic transfer of a fixed amount to your HYSA every payday. Even $100/month builds $1,200/year.\n\nStep 3 — Accelerate: Direct windfalls (tax refund, work bonus, gift money) to the emergency fund until the target is hit.\n\nStep 4 — Maintain: Once fully funded, stop contributing and redirect those dollars to investing.\n\n**Timeline example:**\nGoal: $10,000 | Saving $400/month + $1,200 annual tax refund\n- Month 1–3: $1,200 starter buffer \n- Month 9 + tax refund: $5,000 mid-point\n- Month 22: Full $10,000 goal reached\n\n**Rebuilding after use:**\nIf you tap the emergency fund, replenishment is the immediate priority — ahead of extra investing (though maintain any 401(k) match). Treat rebuilding with the same urgency you used to build it originally. Resist the temptation to keep the emergency fund in a lower state 'temporarily' — emergencies do not wait for convenient timing.",
 highlight: ["starter emergency fund", "automate", "rebuild", "windfalls", "$1,000"],
 },
 {
 type: "quiz-mc",
 question:
 "Which account type is most appropriate for an emergency fund?",
 options: [
 "A high-yield savings account (HYSA) — liquid, FDIC insured, earns 4–5% APY",
 "A stock index fund — higher long-term returns compensate for volatility",
 "A 10-year CD — highest fixed rate available for safe savings",
 "A checking account at your primary bank — instant access to funds",
 ],
 correctIndex: 0,
 explanation:
 "A HYSA combines the three requirements: liquidity (1–2 day transfers), safety (FDIC insured up to $250K), and a competitive yield (4–5% in 2026 vs. 0.01% at traditional banks). Stock index funds fail on safety — they can drop 30–40% precisely when a job loss or emergency strikes. CDs have early withdrawal penalties. Checking accounts typically earn near 0%.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Carlos is a freelance software developer, the sole earner in a household with two young children and a $3,200/month essential expense baseline. He currently has $6,000 in a HYSA. A recruiter tells him the market for his specialty could slow — typical re-employment time for senior developers has stretched to 4–5 months.",
 question:
 "How much should Carlos target for his emergency fund?",
 options: [
 "$16,000–$19,200 — 5 to 6 months of essential expenses given freelance status and dependents",
 "$9,600 — exactly 3 months, the minimum standard",
 "$6,000 — he already has enough based on his current savings",
 "$3,200 — one month is sufficient as a starter fund",
 ],
 correctIndex: 0,
 explanation:
 "Carlos hits multiple factors requiring a larger emergency fund: freelance/self-employed income (irregular), sole earner, two dependents, and a specialty field with longer re-employment timelines. The recommended 5–6 months = $16,000–$19,200. His current $6,000 is only ~1.9 months of coverage — significantly underfunded for his risk profile.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Debt Management 
 {
 id: "pb-debt-management",
 title: "Debt Management",
 description:
 "Snowball vs avalanche methods, debt-to-income ratio, minimum payment trap, and refinancing options",
 icon: "TrendingDown",
 xpReward: 70,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "The Minimum Payment Trap",
 content:
 "**Minimum payments are designed to keep you in debt as long as possible.**\n\nCredit card issuers set minimum payments at 1–2% of your balance (or a small fixed amount like $25). This sounds manageable but is mathematically devastating:\n\n**Example:** $8,000 credit card balance at 24% APR, $200/month minimum payment:\n- Paying only minimums: **7+ years** to pay off, **$7,300+ in interest** (nearly doubling the original debt)\n- Paying $400/month (double the minimum): ~22 months to pay off, ~$2,100 in interest\n- Paying $800/month: ~11 months, ~$1,000 in interest\n\n**The math of high-rate debt:**\nAt 24% APR, your $8,000 accrues $160/month in interest ($8,000 × 24% ÷ 12). If your minimum is $200, only $40/month actually reduces principal. That's why it takes so long.\n\n**The psychological trap:** Minimum payment statements feel manageable — $200 on an $8,000 debt seems proportionate. Credit card companies are required to show you the 'minimum payment warning' on statements (how long payoff takes and total interest cost) — read it.\n\n**Rule:** Always pay more than the minimum. Even $50 extra per month dramatically accelerates payoff and saves thousands in interest.",
 highlight: ["minimum payment", "credit card", "interest", "APR", "principal"],
 },
 {
 type: "teach",
 title: "Debt Avalanche vs Debt Snowball",
 content:
 "Both methods require paying minimums on ALL debts, then directing every extra dollar to one target debt at a time.\n\n**Debt Avalanche — target highest interest rate first:**\n- Mathematically optimal: eliminates the most expensive debt first, minimizing total interest paid\n- Example with $500/month extra: Attack 24% CC first then 18% personal loan then 7% car loan then 4.5% student loan\n- Best for: disciplined people motivated by numbers and total cost\n\n**Debt Snowball — target smallest balance first:**\n- Psychologically motivating: eliminates whole debts quickly, creating momentum and reducing the number of accounts\n- Example: Pay off $800 medical bill first (gone in 2 months!) then $2,500 store card then $6,000 personal loan\n- Pioneered by Dave Ramsey; behavioral research suggests higher completion rates for people who struggle to stay motivated\n- Costs more in total interest but is better than abandoning the plan entirely\n\n**Real numbers comparison (same debts, $300/month extra):**\n- Avalanche: Debt-free in 38 months, $4,200 total interest\n- Snowball: Debt-free in 40 months, $4,900 total interest\n\n**Which to choose:**\n- High discipline, motivated by math Avalanche\n- Need early wins to stay on track Snowball\n- Hybrid: Snowball any balance under $500 first (pay off in 1–2 months), then avalanche the rest\n\nThe best method is whichever one you will actually stick with.",
 highlight: ["debt avalanche", "debt snowball", "interest rate", "balance", "minimum payment"],
 },
 {
 type: "teach",
 title: "Debt-to-Income Ratio & Refinancing",
 content:
 "**Debt-to-Income Ratio (DTI)** = Monthly Debt Payments ÷ Gross Monthly Income × 100\n\nLenders use DTI to assess whether you can handle new debt.\n\n**DTI benchmarks:**\n- **< 28%**: Excellent — qualify for best mortgage rates\n- **28–36%**: Good — most lenders approve favorably\n- **36–43%**: Acceptable — higher rates, stricter scrutiny\n- **43–50%**: Risky — some lenders decline; FHA loans max here\n- **> 50%**: Debt overload — difficulty qualifying; financial stress high\n\n**Example:**\nGross income $5,000/month\nDebt payments: student loan $280 + car $350 + credit card minimums $120 = $750\nDTI = $750 ÷ $5,000 = **15%** excellent\n\n**Refinancing options — when they make sense:**\n\n**Balance Transfer Cards (0% intro APR):** Transfer high-rate CC debt to a new card with 0% for 12–21 months. Pay a 3–5% transfer fee. Only works if you pay off the balance before the promo period ends.\n\n**Personal Loan Consolidation:** Take a personal loan at 10–14% to pay off 24% credit cards. Saves interest and simplifies to one payment — but requires credit score high enough to qualify.\n\n**Student Loan Refinancing:** Private refinance can lower rate but loses federal protections (income-based repayment, forgiveness programs). Only refinance federal loans privately if you have stable income and won't need those protections.\n\n**Refinancing rule:** Only refinance if the new rate is meaningfully lower AND you do not extend the term in a way that increases total interest paid.",
 highlight: ["debt-to-income ratio", "DTI", "refinancing", "balance transfer", "consolidation"],
 },
 {
 type: "quiz-mc",
 question:
 "Alex has three debts: $2,000 store card at 26% APR, $9,000 personal loan at 12% APR, $30,000 student loan at 5% APR. She has $350/month extra after minimums. Using the debt avalanche method, which debt should she target first?",
 options: [
 "$2,000 store card at 26% APR — highest interest rate",
 "$30,000 student loan — largest balance receives the most benefit from extra payments",
 "$9,000 personal loan — middle option balances speed and interest savings",
 "Split $350 equally among all three debts",
 ],
 correctIndex: 0,
 explanation:
 "The debt avalanche targets the highest interest rate first — the 26% store card. Even though it's the smallest balance, 26% is the most expensive debt. The $2,000 balance at $350 extra/month will be gone in roughly 6 months. Then the freed-up payment rolls into the personal loan, then the student loan. Total interest saved over snowball: hundreds to thousands of dollars.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Refinancing student loans from a federal loan program to a private lender is always a smart financial move if it lowers your interest rate.",
 correct: false,
 explanation:
 "False. Federal student loans come with protections that private loans do not: income-driven repayment plans (cap payments at 5–10% of discretionary income), deferment/forbearance during hardship, and potential forgiveness programs (Public Service Loan Forgiveness, IDR forgiveness). Refinancing to a lower private rate trades these protections away permanently. For borrowers in unstable jobs, public service careers, or with large balances, these protections may be worth more than the interest savings.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Savings Goals 
 {
 id: "pb-savings-goals",
 title: "Savings Goals",
 description:
 "SMART financial goals, sinking funds, short/medium/long-term buckets, and automation strategies",
 icon: "Target",
 xpReward: 65,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "SMART Financial Goals",
 content:
 "Vague goals fail. Specific, measurable goals succeed. Use the **SMART framework** for every financial goal:\n\n**S — Specific**: 'Save money' 'Save for a 20% down payment on a $350,000 home'\n**M — Measurable**: '$70,000 needed' — you know exactly when you've arrived\n**A — Achievable**: Realistic given your income and timeline\n**R — Relevant**: Aligns with your values and life priorities\n**T — Time-bound**: 'In 5 years by December 2031'\n\n**Concrete examples:**\n\n| Vague Goal | SMART Version |\n|------------|---------------|\n| 'Save for vacation' | 'Save $3,200 for Italy trip by June 2027 — $133/month for 24 months' |\n| 'Pay off debt' | 'Eliminate $8,500 CC debt by December 2026 at $850/month' |\n| 'Build emergency fund' | 'Save $12,000 (4 months expenses) by March 2027 at $500/month' |\n| 'Save for retirement' | 'Max Roth IRA ($7,000/year) starting January — $583/month auto-invest' |\n\n**The 'Why' behind the goal:** Goals with a clear emotional motivation are far more likely to succeed. A photo of your Italy destination on your fridge, a named sub-account labeled 'Italy 2027' rather than 'savings,' or a vision board works — the specificity keeps the goal present in daily decision-making.",
 highlight: ["SMART goals", "specific", "measurable", "time-bound", "savings"],
 },
 {
 type: "teach",
 title: "Three Time Horizon Buckets",
 content:
 "Organize savings goals into three time horizons so you choose the right account for each:\n\n**Short-Term (0–2 years):**\nGoals: Vacation, holiday gifts, new laptop, car down payment, emergency fund\nWhere: High-yield savings account (HYSA) or money market account\nWhy: Cannot afford any volatility; need the money soon; 4–5% HYSA yield is appropriate\n\n**Medium-Term (2–10 years):**\nGoals: Home down payment, wedding, MBA program, career transition fund\nWhere: HYSA for < 3 years; cautious portfolio (60/40 stocks-bonds) for 5–10 years\nWhy: Some growth beneficial, but a market crash in year 4 when you need the money in year 5 would be damaging. The longer the horizon, the more stock exposure is acceptable.\n\n**Long-Term (10+ years):**\nGoals: Retirement, children's college fund (529), financial independence\nWhere: Tax-advantaged accounts (401k, Roth IRA, 529) invested in stock index funds\nWhy: A 30-year investment horizon can ride through multiple market cycles; stocks have never had a negative 20-year rolling return in US history\n\n**The matching principle:** Match the account type AND investment risk level to the time horizon. Keeping a 25-year retirement fund in a savings account is just as wrong as keeping a 6-month vacation fund in the stock market.",
 highlight: ["short-term", "medium-term", "long-term", "time horizon", "HYSA", "401k", "Roth IRA"],
 },
 {
 type: "teach",
 title: "Sinking Funds & Automation",
 content:
 "**Sinking Funds** are named savings buckets for specific planned expenses, funded monthly by dividing the total cost by the months remaining.\n\n**Example sinking fund setup:**\n| Goal | Total | Timeline | Monthly Save |\n|------|-------|----------|--------------|\n| Car insurance (semi-annual) | $900 | 6 months | $150 |\n| Holiday gifts | $800 | 10 months | $80 |\n| Annual vacation | $3,600 | 12 months | $300 |\n| New laptop | $1,500 | 18 months | $83 |\n| Car maintenance | $1,200/year | Ongoing | $100 |\n\nTotal monthly set-aside: $713 — no holiday credit card debt, no scrambling for car insurance.\n\n**Automation strategy — set it and forget it:**\n1. **Direct deposit split**: Ask HR to split your paycheck between checking and savings automatically\n2. **Named sub-accounts**: Most online banks (Ally, Marcus, SoFi) let you create multiple savings 'buckets' with custom names\n3. **Scheduled transfers**: Set recurring transfers on payday to each named sub-account\n4. **Investment automation**: Set Roth IRA to auto-invest monthly; enable automatic rebalancing\n\n**The 'friction reduction' principle**: Every extra step between your income and saving it creates an opportunity to not do it. Automation removes all friction — money moves before you can spend it, and the decision only needs to be made once.",
 highlight: ["sinking funds", "automation", "sub-accounts", "named savings", "direct deposit"],
 },
 {
 type: "quiz-mc",
 question:
 "You are saving for a $15,000 car down payment that you need in exactly 3 years. Which account is most appropriate?",
 options: [
 "High-yield savings account — safe, liquid, earns 4–5% APY over the 3-year horizon",
 "An S&P 500 index fund — higher expected return maximizes the down payment",
 "A 30-year Treasury bond — guaranteed government return",
 "A checking account — fastest access when needed",
 ],
 correctIndex: 0,
 explanation:
 "At a 3-year horizon, a HYSA is the right choice: safe (FDIC insured), liquid (money available when you need it), and earning a competitive 4–5% APY. An S&P 500 index fund could be down 30–40% in year 3 — right when you need the cash. Bonds with long maturities have interest rate risk. Checking accounts earn near 0%.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Rachel earns $4,500/month. She wants to: (1) take a $2,400 vacation in 12 months, (2) buy a $4,000 laptop in 18 months, (3) save for a home down payment of $60,000 in 5 years. She currently saves nothing for any of these goals.",
 question:
 "What is the total monthly amount Rachel needs to save across all three sinking funds?",
 options: [
 "$1,422/month — ($200 vacation + $222 laptop + $1,000 home down payment)",
 "$800/month — just the vacation and laptop combined",
 "$2,400/month — the full vacation cost this month",
 "$500/month — a round number across all goals",
 ],
 correctIndex: 0,
 explanation:
 "Vacation: $2,400 ÷ 12 = $200/month. Laptop: $4,000 ÷ 18 = $222/month. Home down payment: $60,000 ÷ 60 months = $1,000/month. Total: $1,422/month, which is about 32% of her $4,500 income — ambitious but feasible if her fixed expenses are manageable. If not, she would need to extend the timelines, reduce goal amounts, or increase income.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: Net Worth Tracking 
 {
 id: "pb-net-worth",
 title: "Net Worth Tracking",
 description:
 "Assets vs liabilities, net worth statement, wealth-building milestones, and the wealth stages framework",
 icon: "TrendingUp",
 xpReward: 75,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Net Worth: Assets Minus Liabilities",
 content:
 "**Net Worth = Total Assets Total Liabilities**\n\nThis single number is the most accurate snapshot of your financial position. It can be negative, zero, or positive — and tracking it monthly or quarterly tells you whether your financial plan is working.\n\n**Assets (what you own):**\n- Checking and savings account balances\n- Investment accounts (brokerage, Roth IRA, 401k)\n- Home equity (current market value minus mortgage owed)\n- Vehicle value (market value, not what you paid)\n- Business ownership stake\n- Cash value of life insurance (if whole life)\n- Physical assets with resale value (art, jewelry — at realistic liquidation value)\n\n**Liabilities (what you owe):**\n- Mortgage balance outstanding\n- Student loan balances\n- Auto loan balance\n- Credit card balances (full outstanding balance, not just minimums)\n- Personal loan balances\n- Medical debt\n- Any other loans\n\n**Example Net Worth Statement:**\nAssets: Checking $2,400 + HYSA $14,000 + 401k $38,000 + Roth IRA $22,000 + Home equity $65,000 + Car $12,000 = **$153,400**\nLiabilities: Mortgage $215,000 + Student loans $18,500 + Car loan $8,200 + CC balance $2,300 = **$244,000**\nNet Worth: $153,400 $244,000 = **$90,600**\n\nNegative net worth is common for people in their 20s and 30s who have student loans and mortgages. The direction of change matters more than the current number.",
 highlight: ["net worth", "assets", "liabilities", "net worth statement"],
 },
 {
 type: "teach",
 title: "Wealth Milestones & Tracking Frequency",
 content:
 "**Common net worth milestones** that signal meaningful financial progress:\n\n**Net worth breakeven ($0):** You own more than you owe. For student loan borrowers and recent home buyers, this is a significant psychological milestone.\n\n**One month of expenses saved:** Your very first financial cushion.\n\n**$10,000:** First significant savings achievement for most people.\n\n**$100,000:** Often cited as the hardest milestone — after this, compound growth starts to feel real. At 8% return, your portfolio earns $8,000/year on its own.\n\n**$500,000:** Semi-FIRE (financially independent, not yet retired). Returns are generating $20,000–$40,000/year depending on allocation.\n\n**$1,000,000 — The Millionaire threshold:** At the 4% withdrawal rule, $1M supports $40,000/year of living expenses indefinitely.\n\n**Tracking cadence:**\n- **Monthly**: Too frequent — daily market moves cause emotional noise\n- **Quarterly**: Good for active debt repayment phases — see meaningful progress\n- **Semi-annually or annually**: Appropriate once in the 'wealth accumulation' cruise control phase\n\n**Tools:** A simple spreadsheet beats complex software. List assets, look up current balances, calculate total. Track the date and the number in one column. A chart of your net worth over 5 years is the most motivating financial document you can create.",
 highlight: ["milestones", "$100,000", "$1,000,000", "compound growth", "tracking", "net worth"],
 },
 {
 type: "teach",
 title: "The Wealth Stages Framework",
 content:
 "Personal finance follows a predictable journey. Understanding which stage you are in clarifies your priorities:\n\n**Stage 1 — Stability (Net Worth: Negative to $0)**\nPriority: Stop financial bleeding. Build $1,000 starter emergency fund, pay minimums on all debts, stop adding new debt. Focus: cash flow positive.\n\n**Stage 2 — Foundation ($0 to $25,000)**\nPriority: Fill emergency fund to 3–6 months, capture any employer 401(k) match, pay down high-interest debt (above 7% APR).\n\n**Stage 3 — Momentum ($25,000 to $100,000)**\nPriority: Max Roth IRA, max remaining 401(k) space, continue debt elimination (student loans, car), invest consistently in index funds. Compound growth begins to contribute meaningfully.\n\n**Stage 4 — Acceleration ($100,000 to $500,000)**\nPriority: Portfolio growth is significant — protect it (correct asset allocation, insurance review, estate planning basics). Consider taxable brokerage investing. Investment returns may equal or exceed annual savings contributions.\n\n**Stage 5 — Abundance ($500,000+)**\nPriority: Tax optimization (backdoor Roth, tax-loss harvesting), estate planning (trust, will updates), giving, and defining 'enough.' Financial independence becomes achievable.\n\n**Key insight:** Every stage requires a different primary action. Trying to optimize taxes in Stage 1 is misplaced energy. Ignoring tax efficiency in Stage 4 leaves real money on the table. Know your stage, execute the right priorities.",
 highlight: ["stability", "foundation", "momentum", "acceleration", "abundance", "financial independence"],
 },
 {
 type: "quiz-mc",
 question:
 "Jamie has: $8,000 in savings, $45,000 in a 401(k), $15,000 car (market value), $180,000 mortgage balance, $22,000 student loan balance, and $3,500 credit card balance. What is Jamie's net worth?",
 options: [
 "$137,500 — ($68,000 assets $205,500 liabilities)",
 "$68,000 — total assets before subtracting liabilities",
 "$205,500 — total liabilities only",
 "$0 — assets and liabilities cancel out",
 ],
 correctIndex: 0,
 explanation:
 "Assets: $8,000 savings + $45,000 401(k) + $15,000 car = $68,000. Liabilities: $180,000 mortgage + $22,000 student loans + $3,500 CC = $205,500. Net Worth = $68,000 $205,500 = $137,500. This is a common position for someone in their 20s or 30s with a mortgage and student debt. The key is that net worth should be trending upward each year.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A negative net worth means you are financially irresponsible and should immediately liquidate investments to pay off all debt.",
 correct: false,
 explanation:
 "False. Negative net worth is common and expected for people with mortgages and student loans — two forms of debt that financed appreciating assets (home equity) or earning power (education). The direction of change matters more than the current number. Liquidating a 401(k) to pay off debt usually triggers income taxes plus a 10% early withdrawal penalty, making the situation worse. The correct approach is positive cash flow, a debt elimination strategy, and consistent investing — not panic liquidation.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Priya, age 28, earns $75,000/year and has a net worth of $42,000 (student loans and a car loan, minimal savings). She is deciding between two priorities: (A) contribute 6% to her 401(k) to get the full employer 3% match, or (B) put all discretionary income toward student loans and skip the 401(k) until loans are paid off.",
 question:
 "Which approach best accelerates Priya's net worth growth?",
 options: [
 "Option A — the employer match is an immediate 50% return on her 6%, which no debt paydown can match mathematically",
 "Option B — eliminating negative liabilities is always the first priority before any investing",
 "Split equally between both regardless of match — diversification applies to financial decisions too",
 "Skip both and build the emergency fund first since she has no savings",
 ],
 correctIndex: 0,
 explanation:
 "The employer match is an instant 50–100% return (3% match on 6% contribution = 50% return before any investment gains). No debt paydown — even at 8% interest — produces a comparable guaranteed return. After capturing the full match, Priya should build a $1,000–$2,000 starter emergency fund, then focus extra cash on debt elimination. The match is free money that compounds for decades — skipping it is one of the most costly personal finance mistakes.",
 difficulty: 3,
 },
 ],
 },
 ],
};
