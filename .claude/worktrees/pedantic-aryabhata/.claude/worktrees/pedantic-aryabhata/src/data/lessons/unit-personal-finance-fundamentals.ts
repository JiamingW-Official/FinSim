import type { Unit } from "./types";

export const UNIT_PERSONAL_FINANCE_FUNDAMENTALS: Unit = {
 id: "personal-finance-fundamentals",
 title: "Personal Finance Fundamentals",
 description:
 "Emergency funds, debt payoff, retirement accounts, tax efficiency, and insurance",
 icon: "Wallet",
 color: "#10b981",
 lessons: [
 // Lesson 1: Emergency Fund and Budgeting 
 {
 id: "pff-emergency-fund",
 title: "Emergency Fund & the 50/30/20 Rule",
 description:
 "Build your financial safety net and master the classic budgeting framework",
 icon: "ShieldCheck",
 xpReward: 60,
 steps: [
 {
 type: "teach",
 title: "Why You Need an Emergency Fund First",
 content:
 "Before investing a single dollar, you need an **emergency fund** — cash set aside specifically for unexpected expenses: job loss, medical bills, car repairs.\n\nWithout one, any financial shock forces you to sell investments (possibly at a loss) or run up high-interest credit card debt. An emergency fund is the foundation everything else stands on.\n\n**Rule of thumb**: Keep 3–6 months of essential living expenses in a liquid, FDIC-insured account.\n\nIf your monthly essentials are $3,000 (rent, food, utilities, insurance), you need **$9,000–$18,000** in your emergency fund.",
 highlight: ["emergency fund", "3–6 months", "FDIC-insured"],
 },
 {
 type: "teach",
 title: "Where to Keep Your Emergency Fund",
 content:
 "Your emergency fund must be:\n1. **Liquid** — accessible within 1–2 business days\n2. **Safe** — not subject to market swings\n3. **Earning something** — beating plain checking accounts\n\n**High-Yield Savings Accounts (HYSAs)** are the ideal vehicle. In 2024–2025, top HYSAs at online banks (Marcus, SoFi, Ally) pay 4–5% APY vs. 0.01% at big brick-and-mortar banks.\n\nOn a $12,000 emergency fund, that difference is **$480–$600/year of free interest**. Never keep emergency cash in a regular checking account.",
 highlight: ["high-yield savings", "HYSA", "APY", "liquid"],
 },
 {
 type: "teach",
 title: "The 50/30/20 Rule — Your Budget Blueprint",
 content:
 "Once your emergency fund is established, use the **50/30/20 rule** to allocate every paycheck:\n\n**50% Needs**: Rent/mortgage, utilities, groceries, minimum debt payments, insurance premiums — non-negotiables.\n\n**30% Wants**: Dining out, streaming subscriptions, travel, hobbies — enjoyable but cuttable.\n\n**20% Savings & Debt Payoff**: Emergency fund (until full), retirement contributions, extra debt payments, brokerage investing.\n\nExample on a $5,000/month take-home: $2,500 needs · $1,500 wants · $1,000 savings.",
 highlight: ["50/30/20", "needs", "wants", "savings"],
 visual: "portfolio-pie",
 },
 {
 type: "quiz-mc",
 question:
 "Sarah earns $4,000/month after tax. Her monthly essentials cost $1,800. How large should her emergency fund target be?",
 options: [
 "$5,400–$10,800 (3–6× her essential expenses)",
 "$12,000–$24,000 (3–6× her gross income)",
 "$4,000 (one month of take-home pay)",
 "$1,000 (a starter emergency fund is enough)",
 ],
 correctIndex: 0,
 explanation:
 "The emergency fund is sized to 3–6 months of essential expenses, not total income. Sarah's essentials are $1,800/month, so her target is $5,400–$10,800. Sizing to income over-saves; sizing to $1,000 is dangerously thin.",
 },
 {
 type: "quiz-tf",
 statement:
 "It is better to invest in index funds immediately than to build an emergency fund first.",
 correct: false,
 explanation:
 "Without an emergency fund, any unexpected expense forces you to sell investments — potentially at a loss and in a panic. Build 3–6 months of expenses in a HYSA first, then invest. The emergency fund is insurance, not a missed opportunity.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "Marcus has $800/month left over after essentials. He has zero emergency savings, $4,000 in a 401(k), and no high-interest debt. He wants to grow his wealth.",
 question: "What is the best use of his $800/month right now?",
 options: [
 "Direct most of it to a HYSA until he has 3 months of expenses saved",
 "Put it all into a low-cost S&P 500 index fund immediately",
 "Split evenly between index funds and a savings account from day one",
 "Pay off his mortgage faster since debt is always bad",
 ],
 correctIndex: 0,
 explanation:
 "With no emergency fund, his first priority is building one. Once he has 3 months of expenses in a HYSA, he can redirect the $800 to investments. Investing before having an emergency fund creates forced-selling risk.",
 },
 {
 type: "teach",
 title: "Automate Everything",
 content:
 "The secret to sticking to the 50/30/20 rule: **automate on payday**.\n\n1. Set up auto-transfer to HYSA the day your paycheck hits (emergency fund or savings goal)\n2. Set up 401(k) contribution at your employer\n3. Set up auto-pay for credit card minimums\n\nWhat's left in checking is guilt-free spending money. This eliminates the willpower problem — you never see the money that was destined for savings.\n\nPeople who automate savings save **3× more** than those who rely on transferring 'what's left over.'",
 highlight: ["automate", "auto-transfer", "payday"],
 },
 ],
 },

 // Lesson 2: Debt Management 
 {
 id: "pff-debt-management",
 title: "Debt Management: Avalanche, Snowball & Credit",
 description:
 "Eliminate debt strategically and optimize your credit card use",
 icon: "CreditCard",
 xpReward: 60,
 steps: [
 {
 type: "teach",
 title: "Good Debt vs Bad Debt",
 content:
 "Not all debt is equal. The key question: **Does this debt cost more than it earns?**\n\n**Good debt** (typically low interest, builds assets or earning power):\n- Mortgage at 7% on appreciating property\n- Student loan at 4–6% that genuinely raised your income\n- Business loan funding positive cash flow\n\n**Bad debt** (high interest, finances depreciating goods):\n- Credit card balance at 20–27% APR\n- Payday loan at 300%+ effective APR\n- Auto loan on a luxury vehicle you can't afford\n\nIf your debt's interest rate is higher than what you'd earn investing (~7–10%), paying it off is the better 'investment.'",
 highlight: ["good debt", "bad debt", "APR", "interest rate"],
 },
 {
 type: "teach",
 title: "The Avalanche Method — Mathematically Optimal",
 content:
 "The **avalanche method** attacks debt by interest rate, highest first:\n\n1. Pay minimums on ALL debts every month\n2. Direct every extra dollar to the debt with the **highest APR**\n3. When it's paid off, roll that payment to the next-highest APR debt\n\n**Example — $500/month extra**:\n- Credit card: $5,000 @ 24% attack this first\n- Car loan: $8,000 @ 7% pay minimum only\n- Student loan: $20,000 @ 5% pay minimum only\n\nAvalanche saves the most interest dollars over time. On $33,000 of debt, it can save $2,000+ vs. the snowball method.",
 highlight: ["avalanche", "highest APR", "roll that payment"],
 },
 {
 type: "teach",
 title: "The Snowball Method — Psychologically Powerful",
 content:
 "The **snowball method** targets the smallest balance first:\n\n1. Pay minimums on ALL debts\n2. Direct extra money to the **smallest balance**, regardless of rate\n3. When paid off, roll that freed-up payment to the next-smallest balance\n\n**Same example — $500/month extra**:\n- Car loan: $8,000 @ 7% attack first (smallest)\n- Credit card: $5,000 @ 24% pay minimum (wait, this is actually smaller, so attack first)\n- Student loan: $20,000 @ 5% pay minimum only\n\n**Which to choose?** Avalanche if you're mathematically disciplined. Snowball if you need quick wins to stay motivated. Both work — starting is what matters.",
 highlight: ["snowball", "smallest balance", "quick wins", "momentum"],
 },
 {
 type: "quiz-mc",
 question:
 "You have three debts: $2,000 @ 19% APR, $8,000 @ 6% APR, $15,000 @ 4% APR. Using the avalanche method, which do you attack first?",
 options: [
 "$2,000 @ 19% — highest interest rate",
 "$15,000 @ 4% — largest balance",
 "$8,000 @ 6% — middle balance",
 "$2,000 @ 19% — smallest balance (happens to also be highest rate)",
 ],
 correctIndex: 0,
 explanation:
 "Avalanche always targets the highest interest rate: 19% here. Paying this $2,000 off fast saves the most in interest charges. Note that in this case the highest-rate debt is also the smallest balance, so both methods agree!",
 },
 {
 type: "quiz-tf",
 statement:
 "The snowball method always saves more money in total interest than the avalanche method.",
 correct: false,
 explanation:
 "The avalanche method saves more total interest because it eliminates high-rate debt fastest. The snowball method's advantage is psychological — quick wins keep people motivated. For pure math, avalanche wins; for behavior, snowball sometimes wins by keeping people on track.",
 },
 {
 type: "teach",
 title: "Credit Card Optimization",
 content:
 "Used correctly, credit cards are **powerful tools**, not traps:\n\n**The golden rule**: Pay the full statement balance every month. Carrying a balance at 20%+ APR wipes out any rewards.\n\n**Optimization tactics**:\n- Use a cash-back card (2% flat-rate) or a travel card for bonus categories (3–5% on dining/groceries)\n- Keep utilization below 30% of your credit limit (boosts credit score)\n- Never miss a payment — one late payment can drop your score 50–100 points and trigger penalty APR\n- Use auto-pay for the full statement balance\n\nA 2% cash-back card used for all spending at $3,000/month = **$720/year back** — essentially a discount on everything you buy.",
 highlight: ["full statement balance", "utilization", "auto-pay", "cash-back"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "Priya has $600 extra each month. She has: $3,500 credit card @ 22% APR, $6,000 student loan @ 4.5% APR, no emergency fund yet, and gets a 4% 401(k) employer match she is NOT currently taking.",
 question: "What is her highest-priority financial move?",
 options: [
 "Contribute enough to 401(k) to get the full employer match first",
 "Attack the credit card balance with all $600/month",
 "Build a 3-month emergency fund before anything else",
 "Pay off the student loan since it's a larger balance",
 ],
 correctIndex: 0,
 explanation:
 "The employer match is an immediate 100% return — no debt has an interest rate that high. After securing the match (step 2 of the financial priority ladder), she should build a starter emergency fund ($1,000–$2,000) then aggressively attack the 22% credit card.",
 },
 ],
 },

 // Lesson 3: Retirement Accounts 
 {
 id: "pff-retirement-accounts",
 title: "Retirement Accounts: 401(k), IRA & Roth",
 description:
 "Maximize employer match, contribution limits, and decades of compound growth",
 icon: "Building",
 xpReward: 70,
 steps: [
 {
 type: "teach",
 title: "Tax-Advantaged Accounts Are a Superpower",
 content:
 "The government literally subsidizes retirement savings through **tax-advantaged accounts**. Two main flavors:\n\n**Traditional (Pre-tax)**: Contributions reduce your taxable income today. Growth is tax-deferred. Withdrawals in retirement are taxed as ordinary income.\n\n**Roth (Post-tax)**: Contributions use after-tax money. Growth is completely tax-free. Qualified withdrawals in retirement are 100% tax-free.\n\nFor someone in the 22% tax bracket putting $7,000 into a Traditional IRA, they save $1,540 on this year's tax bill. In a Roth IRA, that $7,000 could grow to $75,000+ over 30 years — all tax-free.",
 highlight: ["pre-tax", "post-tax", "tax-deferred", "tax-free", "Roth"],
 },
 {
 type: "teach",
 title: "401(k): Your Employer's Plan",
 content:
 "A **401(k)** is offered by employers. Key facts for 2025:\n\n- **Contribution limit**: $23,500/year (+ $7,500 catch-up if age 50+)\n- **Employer match**: Many employers match 50–100% of your contributions up to 3–6% of salary — **always capture the full match first**\n- **Investment options**: Usually 10–30 mutual funds; choose low-fee index funds\n- **Vesting schedule**: You own your contributions immediately, but employer match may vest over 2–4 years\n\n**Example**: Salary $80,000. Employer matches 100% up to 4%. Contribute 4% ($3,200) employer adds $3,200. That's an **immediate 100% return** before any market growth. Missing the match is like refusing a raise.",
 highlight: ["401(k)", "employer match", "vesting", "contribution limit"],
 },
 {
 type: "teach",
 title: "IRA vs Roth IRA: Which Is Right for You?",
 content:
 "Both IRAs share a **$7,000/year limit** (2025, $8,000 if 50+). You choose the tax treatment:\n\n**Traditional IRA** Best when: you're in a high tax bracket now and expect lower taxes in retirement.\n\n**Roth IRA** Best when: you're in a low/medium bracket now and expect higher income later.\n\n**Roth IRA income limits (2025)**:\n- Single: phase-out $150,000–$165,000 MAGI\n- Married filing jointly: phase-out $236,000–$246,000 MAGI\n\n**General rule for 20s–30s earners**: Roth IRA wins. You pay tax now at a lower rate, and 30–40 years of tax-free compounding is enormous. A $7,000 Roth contribution at age 25, earning 8%/year, becomes **~$102,000 at age 65** — all tax-free.",
 highlight: ["Roth IRA", "Traditional IRA", "income limits", "MAGI"],
 },
 {
 type: "quiz-mc",
 question:
 "Which account type is generally best for a 27-year-old earning $65,000/year who expects to earn more later in their career?",
 options: [
 "Roth IRA — pay taxes now at a lower rate, enjoy tax-free growth",
 "Traditional IRA — defer taxes until retirement",
 "Taxable brokerage — no contribution limits",
 "It doesn't matter; all accounts grow the same way",
 ],
 correctIndex: 0,
 explanation:
 "At 27 earning $65,000, she's likely in the 22% bracket now and will probably be in a higher bracket at peak earnings/retirement. Paying taxes on Roth contributions today and getting 30+ years of tax-free growth is the mathematically superior choice in this scenario.",
 },
 {
 type: "quiz-tf",
 statement:
 "You should max out your Roth IRA before contributing to a 401(k) that offers an employer match.",
 correct: false,
 explanation:
 "The employer match always comes first. A 100% match is an instant return no investment can beat. Priority order: (1) 401(k) up to full match, (2) max Roth IRA ($7,000), (3) max rest of 401(k) ($23,500 limit), (4) taxable brokerage.",
 },
 {
 type: "teach",
 title: "Contribution Limits & The Priority Ladder",
 content:
 "**2025 Contribution Limits**:\n- 401(k): $23,500/year ($31,000 if 50+)\n- IRA / Roth IRA: $7,000/year ($8,000 if 50+)\n- HSA (health savings account): $4,300 single / $8,550 family — triple tax advantage!\n\n**Optimal priority ladder**:\n1. 401(k) contributions up to employer match\n2. Pay off high-interest debt (>7% APR)\n3. Max Roth IRA ($7,000/year)\n4. Max HSA if eligible (triple tax advantage)\n5. Max remaining 401(k) space\n6. Taxable brokerage account\n\nFollow this sequence and you'll capture every tax break available before exposing money to taxes in a regular brokerage.",
 highlight: ["priority ladder", "HSA", "triple tax advantage", "brokerage"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "David, 30, earns $90,000/year. His employer matches 50% of 401(k) contributions up to 6% of salary. He's currently contributing 0% to his 401(k) and has $4,000 in a Roth IRA he funded years ago.",
 question: "What is his optimal first step?",
 options: [
 "Contribute 6% to his 401(k) to capture the full $2,700 employer match",
 "Max out his Roth IRA ($7,000) for the year first",
 "Increase his 401(k) to 10% to save more on taxes",
 "Open a taxable brokerage account for more flexibility",
 ],
 correctIndex: 0,
 explanation:
 "His employer gives $0.50 per dollar up to 6% ($5,400 contribution $2,700 match). That's a 50% immediate return — no other investment competes. He must capture this before anything else. After matching contributions are set, he can max the Roth IRA next.",
 },
 ],
 },

 // Lesson 4: Tax-Efficient Investing 
 {
 id: "pff-tax-efficient",
 title: "Tax-Efficient Investing",
 description:
 "Tax-loss harvesting, asset location, and keeping more of what you earn",
 icon: "Receipt",
 xpReward: 70,
 steps: [
 {
 type: "teach",
 title: "Why Tax Efficiency Matters",
 content:
 "Two portfolios with identical pre-tax returns can produce very different after-tax wealth depending on how they're managed.\n\n**Capital gains taxes**:\n- **Short-term** (held < 1 year): Taxed as ordinary income — up to 37%\n- **Long-term** (held 1 year): Taxed at 0%, 15%, or 20% depending on income\n\n**Example**: You sell a stock with $10,000 profit after 10 months owe $2,200 in taxes (22% bracket). Wait 2 more months (12 months total) owe $1,500 (15% long-term rate). Patience saved $700.\n\nEvery dollar lost to avoidable taxes is a dollar not compounding for decades.",
 highlight: [
 "short-term",
 "long-term",
 "capital gains",
 "tax efficiency",
 ],
 },
 {
 type: "teach",
 title: "Tax-Loss Harvesting",
 content:
 "**Tax-loss harvesting (TLH)** means selling investments at a loss to offset capital gains elsewhere — reducing your tax bill without changing your market exposure.\n\n**How it works**:\n1. You hold Fund A (down $5,000) and Stock B (up $8,000)\n2. You sell Fund A, locking in the $5,000 loss\n3. Immediately buy a similar (but not identical) fund to stay invested\n4. The $5,000 loss offsets $5,000 of your $8,000 gain\n5. You only owe taxes on net gain of $3,000 instead of $8,000\n\n**Wash-sale rule**: You cannot repurchase the same security within 30 days of the sale — the IRS will disallow the loss. Buy a similar ETF instead (e.g., swap VTI for ITOT).",
 highlight: [
 "tax-loss harvesting",
 "wash-sale rule",
 "offset",
 "capital gains",
 ],
 },
 {
 type: "teach",
 title: "Asset Location Strategy",
 content:
 "**Asset location** = placing the right investments in the right account type to minimize taxes.\n\n**Tax-inefficient assets** (generate lots of taxable income) Put in tax-advantaged accounts (401k, IRA):\n- Bonds (interest taxed as ordinary income)\n- REITs (high dividend payouts)\n- Actively managed funds (frequent capital gains distributions)\n\n**Tax-efficient assets** Fine in taxable brokerage accounts:\n- Index funds (low turnover, minimal distributions)\n- ETFs (in-kind redemptions avoid capital gains)\n- Individual stocks you hold long-term\n\nProper asset location can add 0.2–0.5%/year in after-tax returns — without changing your allocations at all.",
 highlight: [
 "asset location",
 "tax-advantaged",
 "taxable brokerage",
 "bonds",
 "index funds",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "You want to minimize taxes while holding bonds and S&P 500 index funds. Where should bonds go?",
 options: [
 "In the 401(k) — bonds are tax-inefficient (interest taxed as ordinary income)",
 "In the taxable brokerage — bonds are safe, they belong outside retirement accounts",
 "Bonds and index funds should always be in the same account for simplicity",
 "In a Roth IRA so withdrawals are tax-free — but index funds go in the 401(k)",
 ],
 correctIndex: 0,
 explanation:
 "Bond interest is taxed as ordinary income (up to 37%). Shielding bonds inside a 401(k) or IRA defers that tax. Index funds are tax-efficient (low dividends, no capital gains distributions), so they're fine in a taxable account where you only pay tax when you choose to sell.",
 },
 {
 type: "quiz-tf",
 statement:
 "Under the wash-sale rule, you can immediately buy back the exact same ETF you just sold for a tax loss.",
 correct: false,
 explanation:
 "The wash-sale rule (IRS 30-day rule) disallows the tax loss if you buy 'substantially identical' securities within 30 days before or after the sale. You must buy a different-but-similar fund (e.g., sell VTI, buy ITOT or SCHB) to maintain market exposure while booking the tax loss.",
 },
 {
 type: "quiz-mc",
 question:
 "You sold stock at a $12,000 long-term capital gain and another stock at a $7,000 loss this year. What is your net taxable capital gain?",
 options: [
 "$5,000",
 "$12,000",
 "$19,000",
 "$7,000",
 ],
 correctIndex: 0,
 explanation:
 "Capital losses offset capital gains dollar-for-dollar: $12,000 gain $7,000 loss = $5,000 net taxable gain. You only owe long-term capital gains tax on $5,000, not $12,000. If losses exceed gains, up to $3,000 of excess losses can offset ordinary income per year, with the rest carried forward.",
 },
 {
 type: "teach",
 title: "Advanced Tax-Efficient Moves",
 content:
 "**Tax-advantaged accounts** are the foundation, but there are more tactics:\n\n**Health Savings Account (HSA)**: Triple tax advantage — deductible contributions, tax-free growth, tax-free medical withdrawals. After 65, withdraw for anything (taxed like a Traditional IRA). Max it if you're on a high-deductible health plan.\n\n**Charitable giving**: Donate appreciated stock directly instead of cash. You deduct the full market value AND avoid capital gains tax. Better for you, same for the charity.\n\n**Long-term holding**: Simply holding index funds for years avoids generating taxable events. 'Never sell' is the most tax-efficient strategy for taxable accounts.\n\n**Qualified dividends**: Hold dividend-paying stocks for 60+ days to qualify for the lower 0–20% rate vs. up to 37% for ordinary dividends.",
 highlight: [
 "HSA",
 "triple tax advantage",
 "appreciated stock",
 "qualified dividends",
 "long-term holding",
 ],
 },
 ],
 },

 // Lesson 5: Insurance Basics 
 {
 id: "pff-insurance",
 title: "Insurance: Protecting Your Portfolio",
 description:
 "Term vs whole life, umbrella coverage, and using insurance correctly",
 icon: "Shield",
 xpReward: 60,
 steps: [
 {
 type: "teach",
 title: "Insurance Is Risk Transfer",
 content:
 "Insurance lets you **transfer catastrophic financial risk** to an insurer in exchange for a known, manageable premium. It is not an investment — it's protection.\n\nCore principle: **Only insure risks you cannot afford to self-insure.**\n\n- Can you afford to replace a $400 phone out of pocket? Skip phone insurance (negative expected value)\n- Can you afford a $500,000 medical bill from a serious accident? Health + disability insurance is essential\n- Can you afford to replace your income for your family if you die unexpectedly? Life insurance is essential\n\nOver-insuring wastes money; under-insuring is catastrophic.",
 highlight: [
 "risk transfer",
 "premium",
 "self-insure",
 "catastrophic risk",
 ],
 },
 {
 type: "teach",
 title: "Term vs Whole Life Insurance",
 content:
 "**Term life insurance**: Pure death benefit for a fixed period (10, 20, 30 years).\n- Low cost: A healthy 30-year-old can get $1M coverage for **$25–$40/month** (20-year term)\n- No cash value, no investment component\n- Best for: Replacing income if you die while dependents rely on you\n\n**Whole life insurance**: Permanent coverage with a cash-value component that grows slowly.\n- Cost: 5–15× more than equivalent term coverage\n- Cash value grows at ~1–3% — far below index fund returns\n- Sold as an 'investment' — this framing is almost always misleading\n\n**Financial expert consensus**: Buy term, invest the difference. A 30-year-old buying whole life pays ~$300/month vs. $30 for term. Investing the $270 difference in an index fund at 8% for 30 years = **$370,000**.",
 highlight: ["term life", "whole life", "buy term invest the difference"],
 },
 {
 type: "quiz-mc",
 question:
 "A 32-year-old with two young children and a $400,000 mortgage wants life insurance. What should they buy?",
 options: [
 "20-year term policy for $750,000 — covers mortgage + income replacement until kids are independent",
 "Whole life policy — builds cash value they can borrow against",
 "A small $100,000 whole life policy — permanent coverage for funeral costs",
 "No life insurance — they have savings and the mortgage has insurance",
 ],
 correctIndex: 0,
 explanation:
 "Term life is the right tool: affordable, large coverage during the years when family dependence is highest. By the time the 20-year term expires, the mortgage will be much smaller, kids will be independent, and assets should be substantial. Whole life's cash-value 'benefit' doesn't justify the 5–10× higher cost.",
 },
 {
 type: "teach",
 title: "Disability Insurance: The Overlooked Essential",
 content:
 "You are **3× more likely to become disabled than to die** during your working years. Yet most people buy life insurance and skip disability.\n\n**Short-term disability (STD)**: Employer-provided; typically 60–80% of salary for 3–6 months.\n\n**Long-term disability (LTD)**: Your most critical coverage. Replaces 60% of income if you can't work for months or years. Look for:\n- **Own-occupation** definition (can't do YOUR job, not just any job)\n- Non-cancelable policy\n- Benefits to age 65\n\nA 35-year-old earning $80,000/year has **$2.4M of future income** at stake before retirement. Protecting that earning power for $100–$200/month is essential.",
 highlight: [
 "disability insurance",
 "own-occupation",
 "LTD",
 "earning power",
 ],
 },
 {
 type: "teach",
 title: "Umbrella Coverage: The $1M Policy Most People Skip",
 content:
 "An **umbrella policy** provides $1M+ of additional liability coverage above your existing auto and home/renters insurance — typically for **$150–$300/year**.\n\nIt activates when a liability claim exceeds your underlying policy limits:\n- Car accident where you're at fault and the injured party sues for $800,000 (your auto covers $300K umbrella covers the remaining $500K)\n- Someone injures themselves on your property and sues beyond your homeowners limit\n- Social media defamation lawsuit\n\n**Who needs it**: Anyone with meaningful assets (investments, home equity, savings) that could be seized in a judgment — which increasingly includes people in their 30s and 40s.\n\nAt $150–$300/year for $1M of coverage, umbrella insurance has one of the best cost-to-protection ratios of any insurance product.",
 highlight: [
 "umbrella policy",
 "liability",
 "judgment",
 "$1M coverage",
 ],
 },
 {
 type: "quiz-tf",
 statement:
 "Whole life insurance is a better investment than index funds because it provides both coverage and cash value growth.",
 correct: false,
 explanation:
 "Whole life cash value typically grows at 1–3% annually — far below the historical ~10% return of S&P 500 index funds. The enormous premium difference (~$270/month) invested in index funds compounds to hundreds of thousands of dollars more. 'Buy term, invest the difference' is the standard financial planning advice for the vast majority of people.",
 },
 {
 type: "quiz-scenario",
 scenario:
 "Elena, 38, has $250,000 in investments, a $300,000 home, two kids, and a spouse who doesn't work. Her employer provides basic life insurance (1× salary = $70,000) and short-term disability. She has no umbrella policy.",
 question: "Which gap in her coverage is most urgent to address?",
 options: [
 "Add a 20-year term life policy for $700,000–$1M to properly replace her income",
 "Buy a whole life policy to build tax-deferred cash value",
 "Purchase extended phone and electronics warranty coverage",
 "Her current employer life insurance of $70,000 is sufficient",
 ],
 correctIndex: 0,
 explanation:
 "Her employer's $70,000 policy is a fraction of her income replacement need (typically 10–12× annual income). With a non-working spouse and two kids, she needs $700,000–$1M+ of term coverage. The 20-year term covers until kids are grown. Whole life would cost 5–10× more for the same coverage.",
 },
 ],
 },
 ],
};
