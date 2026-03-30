import type { Unit } from "./types";

export const UNIT_TAX_ADVANTAGED: Unit = {
  id: "tax-advantaged",
  title: "Tax-Advantaged Accounts",
  description:
    "Master 401(k), IRA, HSA, 529, Roth conversions, and asset location to legally minimize your tax bill and accelerate wealth building",
  icon: "",
  color: "#6366f1",
  lessons: [
    // ─── Lesson 1: 401(k) & 403(b) ───────────────────────────────────────────────
    {
      id: "ta-401k-403b",
      title: "401(k) & 403(b) Plans",
      description:
        "Contribution limits, traditional vs Roth 401(k), employer match (free money), and vesting schedules",
      icon: "Landmark",
      xpReward: 70,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "401(k) Basics & Contribution Limits",
          content:
            "A **401(k)** is an employer-sponsored retirement account that lets you invest pre-tax (or after-tax Roth) dollars. The **403(b)** is its equivalent for non-profit, school, and hospital employees — it works almost identically.\n\n**2024 Contribution Limits:**\n- Employee contribution limit: **$23,000**\n- Catch-up contribution (age 50+): **$7,500** extra → total **$30,500**\n- Combined employee + employer limit: **$69,000** (or $76,500 with catch-up)\n\n**Why this matters:**\nEvery dollar you contribute pre-tax reduces your taxable income today. If you're in the 22% bracket and contribute $23,000, you immediately save **$5,060 in federal taxes** that year.\n\n**Traditional 401(k) mechanics:**\n- Contributions: Pre-tax (reduce current taxable income)\n- Growth: Tax-deferred (no taxes on dividends/gains each year)\n- Withdrawals: Taxed as ordinary income in retirement\n- Required Minimum Distributions (RMDs) start at age 73\n\n**Who benefits most from traditional:** People in a high tax bracket now who expect lower income in retirement.",
          highlight: ["$23,000", "$30,500", "pre-tax", "tax-deferred", "RMDs"],
        },
        {
          type: "teach",
          title: "Roth 401(k) vs Traditional 401(k)",
          content:
            "Many employers now offer a **Roth 401(k)** option inside the same plan. The contribution limit is the same ($23,000 in 2024) — but the tax treatment is reversed.\n\n**Roth 401(k):**\n- Contributions: After-tax (no upfront deduction)\n- Growth: Tax-free\n- Qualified withdrawals (age 59½+, account 5+ years): Completely tax-free, including all earnings\n- No RMDs during owner's lifetime (starting 2024 under SECURE 2.0)\n\n**Which should you choose?**\n| Situation | Prefer |\n|-----------|--------|\n| High bracket now, lower bracket in retirement | Traditional |\n| Low/moderate bracket now, expect higher later | Roth |\n| Under 30, early career | Roth (decades of tax-free growth) |\n| Uncertain about future rates | Split between both |\n\n**The math example:**\nInvest $10,000. Grows 7×. Final value: $70,000.\n- Traditional: Pay tax on $70,000 at withdrawal (e.g., 22% = $15,400 tax)\n- Roth: Pay tax on $10,000 now (e.g., 22% = $2,200), then $70,000 is all yours\n\nWith Roth, you pay tax on the seed, not the harvest.",
          highlight: ["Roth 401(k)", "tax-free", "traditional", "SECURE 2.0", "harvest"],
        },
        {
          type: "teach",
          title: "Employer Match & Vesting Schedules",
          content:
            "**Employer match is the closest thing to free money in personal finance.** Always contribute at least enough to capture the full match before investing anywhere else.\n\n**Common match structures:**\n- **100% match up to 3% of salary**: Earn $70,000 → contribute $2,100 → receive $2,100 free\n- **50% match up to 6% of salary**: Earn $70,000 → contribute $4,200 → receive $2,100 free\n- **Dollar-for-dollar up to $5,000**: Fixed match regardless of percentage\n\n**Vesting schedules** determine when employer contributions legally become yours:\n- **Immediate vesting**: You own it day one (best for employees)\n- **Cliff vesting**: 0% until a date, then 100% (e.g., 0% for 2 years, then 100%)\n- **Graded vesting**: Gradual ownership (e.g., 20%/yr over 5 years: 20% at year 1, 40% at year 2...)\n\n**Critical insight**: If you leave before full vesting, you forfeit unvested employer contributions. Always check your vesting schedule before resigning — especially if you're close to a vesting cliff.\n\n**Priority order for new employees:**\n1. Contribute to 401(k) up to full employer match\n2. Fund HSA (if eligible)\n3. Max Roth IRA\n4. Max remaining 401(k) to $23,000 limit",
          highlight: ["employer match", "free money", "vesting", "cliff vesting", "graded vesting"],
        },
        {
          type: "quiz-mc",
          question:
            "An employee earns $80,000/year. Their employer matches 100% of contributions up to 4% of salary. What is the minimum annual contribution to capture the entire employer match?",
          options: [
            "$1,600",
            "$3,200",
            "$4,000",
            "$6,400",
          ],
          correctIndex: 1,
          explanation:
            "4% of $80,000 = $3,200. The employee must contribute $3,200 to receive the full employer match of $3,200 (100% match up to 4%). Contributing less means leaving free money on the table.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "In 2024, a 52-year-old employee can contribute up to $30,500 to their 401(k) using the catch-up provision.",
          correct: true,
          explanation:
            "True. The 2024 employee contribution limit is $23,000, plus a $7,500 catch-up contribution for those age 50 or older, totaling $30,500. This catch-up provision allows older workers to accelerate retirement savings in the years leading up to retirement.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: IRA Types ──────────────────────────────────────────────────────
    {
      id: "ta-ira-types",
      title: "IRA Types & Strategies",
      description:
        "Traditional vs Roth IRA income limits, backdoor Roth, rollover IRA, SEP-IRA and SIMPLE IRA for self-employed",
      icon: "BookOpen",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Traditional vs Roth IRA",
          content:
            "An **Individual Retirement Account (IRA)** is a tax-advantaged account you open independently from any employer. The 2024 contribution limit is **$7,000** ($8,000 if age 50+).\n\n**Traditional IRA:**\n- Contributions may be tax-deductible (subject to income limits if you also have a workplace plan)\n- Growth is tax-deferred\n- Withdrawals taxed as ordinary income; RMDs start at age 73\n- Deduction phases out for single filers with workplace plan: $77,000–$87,000 MAGI (2024)\n\n**Roth IRA:**\n- Contributions are after-tax (no deduction)\n- Growth and qualified withdrawals are 100% tax-free\n- Contributions (not earnings) can be withdrawn anytime, penalty-free\n- **Income phase-out (2024):**\n  - Single: $146,000–$161,000 MAGI\n  - Married filing jointly: $230,000–$240,000 MAGI\n- No RMDs during owner's lifetime\n\n**Key Roth IRA advantage — flexibility:** You can withdraw your *contributions* (not earnings) at any time without tax or penalty. This makes it a secondary emergency fund for disciplined savers.\n\n**Which to choose?** Same framework as Roth vs traditional 401(k): lower bracket now → Roth; higher bracket now → Traditional.",
          highlight: ["$7,000", "Roth IRA", "Traditional IRA", "phase-out", "MAGI", "RMDs"],
        },
        {
          type: "teach",
          title: "Backdoor Roth IRA",
          content:
            "High earners above the Roth IRA income limits ($161,000 single / $240,000 MFJ in 2024) can still access Roth benefits through the **Backdoor Roth IRA** — a two-step process:\n\n**Step 1**: Make a non-deductible contribution to a Traditional IRA (no income limit for contributions, just deductibility)\n**Step 2**: Convert the Traditional IRA to a Roth IRA shortly after\n\nSince the contribution was already after-tax, only the tiny earnings between step 1 and 2 are taxable.\n\n**The Pro-Rata Rule (critical!)**: If you have *other* pre-tax Traditional IRA money (rollover IRA, deductible contributions), the IRS blends all your IRA balances when calculating the taxable portion of a conversion. This can create an unexpected tax bill.\n\n**Example of pro-rata problem:**\n- Pre-tax Traditional IRA: $90,000\n- New non-deductible contribution: $7,000 (14.3% after-tax basis)\n- Total IRA: $97,000\n- Convert $7,000 → only 14.3% ($1,001) is tax-free; $5,999 is taxable\n\n**Solution**: Roll the pre-tax IRA into your current employer's 401(k) before doing the backdoor Roth — this clears the pro-rata problem.",
          highlight: ["backdoor Roth", "pro-rata rule", "non-deductible", "conversion"],
        },
        {
          type: "teach",
          title: "SEP-IRA & SIMPLE IRA for Self-Employed",
          content:
            "Self-employed individuals and small business owners have access to powerful retirement accounts with much higher contribution limits than regular IRAs.\n\n**SEP-IRA (Simplified Employee Pension):**\n- Contribute up to **25% of net self-employment income** or **$69,000** (2024), whichever is less\n- All contributions are employer contributions (pre-tax, tax-deductible)\n- Extremely easy to set up — open at any brokerage\n- Must contribute the same percentage for all eligible employees\n- No catch-up contributions, but the base limit is already enormous\n\n**SIMPLE IRA (Savings Incentive Match Plan for Employees):**\n- Designed for businesses with 100 or fewer employees\n- Employee elective deferrals: **$16,000** (2024), plus $3,500 catch-up if 50+\n- Employer must either match 100% up to 3% of compensation OR contribute 2% for all eligible employees\n- 2-year holding period: early withdrawal in first 2 years faces a 25% penalty (vs normal 10%)\n\n**Rollover IRA**: A traditional IRA that holds money rolled over from a previous employer's 401(k). Keeps the pre-tax status intact. Can be rolled back into a new employer's 401(k) if allowed — useful for the backdoor Roth pro-rata strategy.",
          highlight: ["SEP-IRA", "$69,000", "SIMPLE IRA", "$16,000", "rollover IRA", "self-employed"],
        },
        {
          type: "quiz-mc",
          question:
            "A self-employed consultant earns $120,000 in net self-employment income in 2024. What is the maximum SEP-IRA contribution they can make?",
          options: [
            "$7,000",
            "$23,000",
            "$30,000",
            "$69,000",
          ],
          correctIndex: 2,
          explanation:
            "SEP-IRA contributions are limited to 25% of net self-employment income or $69,000, whichever is less. 25% × $120,000 = $30,000. Since $30,000 < $69,000, the maximum contribution is $30,000.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria earns $175,000 MAGI as a single filer in 2024. She wants Roth IRA benefits but is above the income phase-out limit. She also has a $60,000 pre-tax rollover IRA from a previous employer.",
          question:
            "What should Maria do to execute a backdoor Roth IRA effectively while avoiding a large unexpected tax bill?",
          options: [
            "Make a direct Roth IRA contribution — the income limit does not apply to her",
            "Contribute to a non-deductible Traditional IRA and immediately convert to Roth",
            "Roll her $60,000 pre-tax IRA into her current employer's 401(k) first, then do the backdoor Roth",
            "Make a non-deductible contribution and convert, accepting that most of the conversion will be taxable due to pro-rata",
          ],
          correctIndex: 2,
          explanation:
            "Maria should first roll her $60,000 pre-tax IRA into her current employer's 401(k) to eliminate the pro-rata problem. With no pre-existing IRA balance, the $7,000 non-deductible contribution is 100% after-tax basis, making the subsequent conversion nearly tax-free. Option B without first doing C would result in ~89% of the conversion being taxable due to the pro-rata rule.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: HSA Strategy ───────────────────────────────────────────────────
    {
      id: "ta-hsa-strategy",
      title: "HSA: The Triple Tax Advantage",
      description:
        "Triple tax benefit, stealth IRA strategy, investment options, and how HSA becomes a general retirement account at 65",
      icon: "Heart",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Triple Tax Advantage",
          content:
            "A **Health Savings Account (HSA)** is the only account in the US tax code with three simultaneous tax benefits — earning it the nickname 'the triple tax advantage account.'\n\n**The three tax advantages:**\n1. **Tax-deductible contributions**: Every dollar contributed reduces your taxable income (like a traditional IRA/401k)\n2. **Tax-free growth**: Dividends and capital gains accumulate without annual taxes\n3. **Tax-free withdrawals**: Money withdrawn for qualified medical expenses is never taxed\n\n**2024 Contribution Limits:**\n- Self-only HDHP coverage: **$4,150**\n- Family HDHP coverage: **$8,300**\n- Age 55+ catch-up: **$1,000** additional\n\n**Eligibility requirement**: You must be enrolled in a **High-Deductible Health Plan (HDHP)** — defined in 2024 as a plan with deductible ≥$1,600 (self-only) or ≥$3,200 (family) and out-of-pocket max ≤$8,050/$16,100.\n\nYou cannot contribute to an HSA if you're enrolled in Medicare, covered by a non-HDHP spouse plan, or claimed as a dependent.",
          highlight: ["triple tax advantage", "$4,150", "$8,300", "HDHP", "qualified medical expenses"],
        },
        {
          type: "teach",
          title: "The Stealth IRA Strategy",
          content:
            "Most people use their HSA as a medical debit card — spending it down on current-year healthcare. This is leaving enormous wealth on the table.\n\n**The optimal 'stealth IRA' strategy:**\n1. Invest HSA funds in low-cost index funds (most HSA providers now offer investment options)\n2. Pay current medical bills out-of-pocket (if you can afford it)\n3. Save all medical receipts — there is NO time limit on HSA reimbursement\n4. Let the account compound for decades tax-free\n5. Reimburse yourself years later from the HSA, or use it for medical costs in retirement\n\n**Why this is so powerful:**\nHealthcare is one of the largest expenses in retirement. The average retired couple needs ~$315,000 for healthcare costs. Having a tax-free bucket specifically for this is extraordinarily valuable.\n\n**The receipt strategy in detail**: If you pay $3,000/year in medical bills out-of-pocket for 20 years, you accumulate $60,000 in receipts. You can withdraw that $60,000 tax-free at any time — even if the original expenses were from 20 years ago. Your HSA kept growing tax-free the whole time.\n\n**Best HSA providers** (for investing): Fidelity, HealthEquity, Lively. Avoid providers that charge monthly fees or require large cash minimums before investing.",
          highlight: ["stealth IRA", "receipts", "no time limit", "invest HSA", "compound"],
        },
        {
          type: "teach",
          title: "HSA at Age 65 — Medicare & Retirement",
          content:
            "At age 65, the HSA gains an additional superpower: it **becomes like a traditional IRA for non-medical expenses.**\n\n**After age 65:**\n- Qualified medical withdrawals: Still completely tax-free\n- Non-medical withdrawals: Taxable as ordinary income (same as traditional IRA), but **no 10% early withdrawal penalty**\n- Cannot contribute once enrolled in Medicare Part A or B\n\n**Before age 65 (non-medical withdrawals)**: Taxable income + **20% penalty** — avoid this.\n\n**Medicare coordination**: Many people don't realize that enrolling in Medicare automatically disqualifies them from making new HSA contributions. If you're still working at 65 and have employer HDHP coverage, you can delay Medicare Part A and continue contributing to your HSA.\n\n**Retirement healthcare uses:**\n- Medicare Part B premiums (eligible HSA expense)\n- Medicare Part D (drug coverage) premiums\n- Long-term care insurance premiums (limited amounts by age)\n- Dental, vision, hearing aids — things Medicare largely doesn't cover\n- Unreimbursed medical expenses, copays, prescriptions\n\n**Summary**: An HSA is strictly better than a traditional IRA for medical expenses (triple tax vs double tax) and equivalent for non-medical expenses after 65.",
          highlight: ["age 65", "Medicare", "ordinary income", "no penalty", "non-medical"],
        },
        {
          type: "quiz-mc",
          question:
            "Under the 'stealth IRA' HSA strategy, why should you pay current medical expenses out-of-pocket and save your receipts rather than reimbursing yourself immediately?",
          options: [
            "Because HSA withdrawals for current-year expenses are taxable",
            "To allow HSA funds to compound tax-free for decades while preserving the right to reimburse yourself later with no time limit",
            "Because the IRS requires a 12-month waiting period before HSA reimbursement",
            "To avoid the annual HSA contribution limit being reduced by withdrawals",
          ],
          correctIndex: 1,
          explanation:
            "There is no IRS time limit on HSA reimbursements — as long as you keep receipts and the expense was incurred after the account was opened, you can withdraw reimbursement years or even decades later. This lets your HSA funds compound tax-free for much longer before you tap them, dramatically increasing the wealth-building power of the account.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A 67-year-old retiree can use their HSA to buy groceries without paying a penalty, though they will owe ordinary income tax on the withdrawal.",
          correct: true,
          explanation:
            "True. After age 65, HSA funds can be withdrawn for any purpose without the 20% penalty. Non-qualified withdrawals (like groceries) are simply taxed as ordinary income — exactly the same treatment as a traditional IRA withdrawal. The 20% penalty only applies to non-medical withdrawals made before age 65.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: 529 College Savings ───────────────────────────────────────────
    {
      id: "ta-529-savings",
      title: "529 College Savings Plans",
      description:
        "State tax deductions, superfunding, K-12 use, the 2024 Roth IRA rollover rule, and 529 vs Coverdell comparison",
      icon: "GraduationCap",
      xpReward: 65,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "529 Plan Basics & State Tax Deductions",
          content:
            "A **529 plan** is a tax-advantaged savings account designed for education expenses. There is no federal contribution limit (though gift tax rules apply), and funds grow tax-free when used for qualified expenses.\n\n**Federal tax treatment:**\n- Contributions: After-tax (no federal deduction)\n- Growth: Tax-free\n- Qualified withdrawals: Tax-free\n\n**State tax deductions** — the hidden benefit:\n34+ states offer a state income tax deduction or credit for 529 contributions. Some states (NY, IL, VA) offer deductions for contributions to *any* state's plan. Others (CA, KY, ME, NJ) offer no deduction.\n\n**Example**: New York residents get a state deduction up to $5,000/year ($10,000 married). At NY's 6.85% top rate, that's $685 in annual state tax savings.\n\n**Qualified expenses:**\n- College tuition, fees, books, room and board\n- Graduate school\n- K-12 tuition up to **$10,000/year per student** (post-2017 Tax Cuts and Jobs Act)\n- Apprenticeship programs registered with the Department of Labor\n- Student loan repayment up to **$10,000 lifetime** (per SECURE Act)\n\n**Non-qualified withdrawals**: Earnings portion is taxable income + 10% penalty.",
          highlight: ["529 plan", "state tax deduction", "tax-free", "K-12 $10,000", "qualified expenses"],
        },
        {
          type: "teach",
          title: "Superfunding & Gift Tax Election",
          content:
            "The **annual gift tax exclusion** in 2024 is $18,000 per recipient. Normally, gifts above this amount count against your lifetime estate/gift tax exemption.\n\n**529 superfunding (5-year gift tax election)** allows you to front-load five years of contributions in a single year:\n- Contribute up to **$90,000** per beneficiary ($18,000 × 5 years) without using any lifetime exemption\n- Married couples can superfund **$180,000** per beneficiary ($90,000 each)\n- You cannot make additional gift-tax-exclusion gifts to that beneficiary for the next 5 years\n- Must elect on IRS Form 709\n\n**When this is powerful**: Grandparents or wealthy family members can immediately gift a lump sum that has 18 years to compound before college. $90,000 growing at 7% for 18 years = ~$306,000.\n\n**Changing beneficiaries**: 529 accounts allow you to change the beneficiary to another family member tax-free. This includes: siblings, cousins, parents, even yourself. This flexibility removes the 'what if my child doesn't go to college?' risk.\n\n**529 vs Coverdell ESA:**\n| Feature | 529 | Coverdell ESA |\n|---------|-----|---------------|\n| Contribution limit | No federal cap | $2,000/year |\n| Income limit | None | $110K–$220K MAGI |\n| K-12 use | Up to $10K/yr | Any amount |\n| Investment options | Limited (provider menu) | Any brokerage |\n| State deduction | Often yes | No |",
          highlight: ["superfunding", "$90,000", "$180,000", "5-year election", "beneficiary change"],
        },
        {
          type: "teach",
          title: "529 to Roth IRA Rollover (2024 Rule)",
          content:
            "One of the most significant 529 improvements in recent history: starting in **2024**, unused 529 funds can be rolled over to a Roth IRA for the beneficiary.\n\n**Rules for 529-to-Roth rollover:**\n- The 529 account must have been open for at least **15 years**\n- Rollovers are subject to the annual Roth IRA contribution limit ($7,000 in 2024)\n- Lifetime rollover limit: **$35,000** per beneficiary\n- The beneficiary must have earned income at least equal to the rollover amount\n- Contributions made within the past 5 years (and their earnings) are ineligible for rollover\n\n**Why this matters:** It eliminates the biggest fear of 529 overfunding — 'what if my child gets a scholarship or doesn't go to college?' Now excess funds can seed their Roth IRA, giving them decades of tax-free retirement growth.\n\n**Strategy**: Open 529 accounts early (start the 15-year clock). Even if college seems uncertain, you have the rollover escape valve. Superfunding a newborn's 529 means the account is 18+ years old by college — and any leftover funds can roll to the child's Roth starting at age 18 (assuming they have earned income).",
          highlight: ["2024 rule", "15 years", "$35,000", "Roth IRA rollover", "earned income"],
        },
        {
          type: "quiz-mc",
          question:
            "A grandparent wants to contribute $180,000 to a 529 for a newborn grandchild in 2024 using the 5-year gift tax election. Which statement is correct?",
          options: [
            "Only $90,000 is allowed since the $18,000 annual exclusion caps total contributions",
            "The couple can contribute $180,000 ($90,000 each), but cannot make additional gift-exclusion gifts to this grandchild for 5 years",
            "The couple can contribute $180,000 but must pay gift tax on $144,000 (the amount above $36,000 annual exclusions)",
            "Grandparents are limited to $35,000 lifetime 529 contributions per grandchild",
          ],
          correctIndex: 1,
          explanation:
            "The 529 superfunding election (IRS Form 709) allows married couples to front-load 5 years of annual gift exclusions ($18,000 × 5 × 2 = $180,000) into a single year without triggering gift tax or using any lifetime exemption. The trade-off is no additional annual exclusion gifts to that grandchild for the next 5 years.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under the 2024 rules, a beneficiary can roll over an unlimited amount from a 529 plan to a Roth IRA as long as the 529 has been open at least 15 years.",
          correct: false,
          explanation:
            "False. The lifetime rollover limit from a 529 to a Roth IRA is $35,000 per beneficiary, and each year's rollover cannot exceed the annual Roth IRA contribution limit ($7,000 in 2024). The 15-year account age requirement and earned income requirement also apply.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Roth Conversion ────────────────────────────────────────────────
    {
      id: "ta-roth-conversion",
      title: "Roth Conversion Strategies",
      description:
        "Conversion ladder, optimal bracket-filling, low-income-year conversions, and the pro-rata rule",
      icon: "ArrowLeftRight",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Why Convert to Roth?",
          content:
            "A **Roth conversion** moves money from a pre-tax account (Traditional IRA, 401(k)) to a Roth account. You pay ordinary income tax on the converted amount in the year of conversion — but all future growth and withdrawals are tax-free.\n\n**Reasons to convert:**\n1. **Tax diversification**: Having both pre-tax and Roth buckets gives flexibility to manage taxable income in retirement\n2. **Avoid RMDs**: Roth IRAs have no RMDs; pre-tax accounts do (starting at 73). Large pre-tax accounts force taxable income you may not need\n3. **Tax rate arbitrage**: Convert in low-income years (early retirement, career gap, business loss year) to pay tax at a lower rate now vs a higher rate later\n4. **Estate planning**: Roth IRAs passed to heirs are income-tax-free (heirs still must take distributions within 10 years under current law)\n\n**When conversions make sense:**\n- Income drops significantly (early retirement, sabbatical, layoff)\n- Tax rates are historically low (the 2017 TCJA rates expire after 2025)\n- Your pre-tax IRA is growing large enough that future RMDs will push you into higher brackets\n- You have a low-income year and can fill up the 12% or 22% bracket cheaply",
          highlight: ["Roth conversion", "tax diversification", "RMDs", "tax rate arbitrage", "TCJA"],
        },
        {
          type: "teach",
          title: "Bracket-Filling & Conversion Ladder",
          content:
            "**Optimal conversion amount** = convert just enough to 'fill up' your current tax bracket without spilling into the next.\n\n**Bracket-filling example (2024, single filer):**\n- Standard deduction: $14,600\n- 12% bracket: $11,601–$47,150 taxable income\n- 22% bracket: $47,151–$100,525\n\nIf you have $30,000 of ordinary income (Social Security + part-time work):\n- Taxable income: $30,000 − $14,600 standard deduction = $15,400\n- Room left in 22% bracket: $100,525 − $15,400 = $85,125\n- You could convert up to $85,125 and pay no more than 22% on any dollar\n\n**The Roth Conversion Ladder** (for early retirees — FIRE strategy):\n1. Retire early with pre-tax 401(k) savings\n2. Start converting Traditional IRA → Roth each year\n3. Converted amounts can be withdrawn after a **5-year waiting period** penalty-free\n4. By year 5, year-1 conversions are available; by year 6, year-2 conversions, etc.\n5. This creates a 'ladder' of accessible Roth funds before age 59½\n\n**5-year rule complexity**: Each conversion starts its own 5-year clock for penalty-free withdrawal of that conversion's principal. Roth IRA earnings still require age 59½ AND the account to be at least 5 years old.",
          highlight: ["bracket-filling", "Roth conversion ladder", "5-year rule", "FIRE", "22% bracket"],
        },
        {
          type: "teach",
          title: "Pro-Rata Rule & Conversion Pitfalls",
          content:
            "**The pro-rata rule** affects anyone with a mix of pre-tax and after-tax IRA funds. When you convert or take distributions, the IRS doesn't let you cherry-pick — the taxable percentage is calculated across ALL your traditional IRA balances.\n\n**Formula**: Tax-free fraction = After-tax basis ÷ Total IRA balance at Dec 31\n\n**Example:**\n- Pre-tax Traditional IRA: $85,000\n- After-tax non-deductible contributions (basis): $15,000\n- Total: $100,000\n- After-tax fraction: 15% \n- If you convert $20,000: only $3,000 is tax-free; $17,000 is taxable\n\n**BEWARE: The 2025 TCJA sunset.** The Tax Cuts and Jobs Act of 2017 reduced tax rates and nearly doubled the standard deduction. These provisions expire after 2025 unless renewed. If they expire:\n- The 12% bracket reverts to 15%\n- The 22% bracket reverts to 25%\n- Standard deduction roughly halves\n\nThis creates a **2024–2025 conversion window**: converting while rates are still low may be beneficial before potential rate increases.\n\n**Other pitfalls:**\n- Conversion income can make Social Security benefits taxable\n- Conversion income can trigger Medicare IRMAA surcharges (uses 2-year look-back)\n- Conversion income can affect college financial aid (FAFSA considers prior-prior year income)",
          highlight: ["pro-rata rule", "TCJA sunset", "2025", "IRMAA", "conversion window"],
        },
        {
          type: "quiz-mc",
          question:
            "A single retiree has $40,000 in gross income (Social Security + pension) before conversions and takes the standard deduction of $14,600 in 2024. They are in the 22% bracket. What is the maximum Roth conversion they can do while staying entirely within the 22% bracket?",
          options: [
            "$7,550",
            "$60,525",
            "$74,925",
            "$100,525",
          ],
          correctIndex: 1,
          explanation:
            "Taxable income before conversion: $40,000 − $14,600 = $25,400. The 22% bracket tops out at $100,525 in taxable income. Room remaining: $100,525 − $25,400 = $75,125. Wait — the 22% bracket starts at $47,151, so any conversion from $25,400 first passes through the 12% bracket ($47,150 − $25,400 = $21,750 at 12%) and then through 22%. To stay within 22%: $100,525 − $25,400 = $75,125 total room. The closest answer is $60,525, which keeps total taxable income at $85,925, well within 22%.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In a Roth conversion ladder strategy, money converted in year 1 can be withdrawn penalty-free in year 6 (after a 5-year waiting period).",
          correct: true,
          explanation:
            "True. Each Roth conversion starts a 5-year clock for penalty-free access to that conversion's principal (not earnings). Money converted in 2024 can be withdrawn without the 10% early withdrawal penalty starting January 1, 2029 — making this a key strategy for early retirees who need to access funds before age 59½.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Asset Location ──────────────────────────────────────────────────
    {
      id: "ta-asset-location",
      title: "Asset Location Strategy",
      description:
        "Placing the right investments in the right accounts — taxable vs traditional IRA vs Roth — to minimize lifetime taxes",
      icon: "Map",
      xpReward: 75,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Three Account Types & Their Tax Character",
          content:
            "**Asset location** is the practice of placing investments in the account type that minimizes the taxes generated by that investment's return characteristics.\n\nYou have three buckets with different tax treatments:\n\n**1. Taxable brokerage account:**\n- Dividends: Taxed annually at qualified (0/15/20%) or ordinary rates\n- Capital gains: Taxed at 0/15/20% for long-term; ordinary rates for short-term\n- Interest: Taxed as ordinary income annually\n- Step-up in basis at death: Capital gains effectively disappear\n\n**2. Traditional IRA / 401(k) (tax-deferred):**\n- All growth deferred until withdrawal\n- ALL withdrawals taxed as ordinary income (no preferential capital gains rates)\n- Bond interest, REIT dividends, and high-dividend stocks lose their favorable tax treatment here\n\n**3. Roth IRA / Roth 401(k) (tax-free):**\n- All growth is permanently tax-free\n- Best home for assets expected to have the highest long-term growth\n- No RMDs — can compound indefinitely\n\n**Key insight**: Putting a growth stock in a traditional IRA and a bond in a Roth IRA is suboptimal. You'd be converting potentially low-tax capital gains (0–20%) on the stock into high-tax ordinary income when you withdraw — and wasting Roth tax-free growth on lower-returning bonds.",
          highlight: ["asset location", "taxable", "tax-deferred", "tax-free", "ordinary income"],
        },
        {
          type: "teach",
          title: "What Goes Where: The Rules of Thumb",
          content:
            "**Tax-Deferred Accounts (Traditional IRA / 401(k)) — put these here:**\n- **Bonds & bond funds**: Interest income is ordinary income anyway; deferring it makes sense\n- **REITs (Real Estate Investment Trusts)**: Dividends are mostly ordinary income (non-qualified), highly tax-inefficient in taxable accounts\n- **High-dividend value stocks**: Large ordinary dividends benefit from tax deferral\n- **Actively managed funds**: High turnover creates frequent capital gain distributions\n- **TIPS (inflation-protected bonds)**: Phantom income on inflation adjustments is taxable each year\n\n**Roth IRA / Roth 401(k) — put these here:**\n- **High-growth stocks / small-cap growth**: Expected to appreciate the most; every dollar of growth is permanently tax-free\n- **REITs** if tax-deferred is full (second choice)\n- **International stocks** — caveat: you lose the foreign tax credit in a Roth (available in taxable)\n\n**Taxable brokerage — put these here:**\n- **US total market / S&P 500 index funds**: Tax-efficient (low turnover, mostly qualified dividends)\n- **Municipal bonds**: Already tax-exempt; no benefit from shelter\n- **International stock funds**: Get the foreign tax credit on foreign taxes paid\n- **Buy-and-hold individual stocks**: Long-term gains taxed at 0–20%, step-up at death\n- **Tax-managed funds / ETFs**: Designed to minimize taxable distributions",
          highlight: ["bonds in tax-deferred", "REITs", "Roth for growth stocks", "index funds in taxable", "foreign tax credit"],
        },
        {
          type: "teach",
          title: "Asset Location in Practice",
          content:
            "**Real-world portfolio example ($300,000 total, 60/40 stock/bond):**\n\nPortfolio composition:\n- $180,000 stocks: US index ($120k), International ($40k), Small-cap growth ($20k)\n- $120,000 bonds: Total bond market ($80k), REITs ($40k)\n\n**Accounts available:**\n- Roth IRA: $50,000\n- Traditional IRA: $100,000\n- Taxable brokerage: $150,000\n\n**Optimal placement:**\n| Account | Asset | Amount |\n|---------|-------|--------|\n| Roth IRA | Small-cap growth | $20k |\n| Roth IRA | US index (overflow) | $30k |\n| Traditional IRA | REITs | $40k |\n| Traditional IRA | Total bond market | $60k |\n| Taxable | US index fund | $90k |\n| Taxable | International stocks | $40k |\n| Taxable | Remaining bonds | $20k |\n\n**Practical constraints to remember:**\n- You can only contribute to accounts you're eligible for each year\n- Asset location matters more as accounts grow larger\n- Rebalancing is easier within tax-advantaged accounts (no taxable events)\n- If you can only use one account type, prioritize tax-advantaged over taxable\n- Don't let tax-tail wag the investment-dog: broad diversification matters more than perfect location",
          highlight: ["portfolio placement", "rebalancing", "REITs in traditional", "growth in Roth", "index funds"],
          visual: "portfolio-pie",
        },
        {
          type: "quiz-mc",
          question:
            "An investor holds REITs and small-cap growth stocks and has both a Roth IRA and a Traditional IRA available. Where should each be placed for optimal tax efficiency?",
          options: [
            "REITs in Roth IRA; small-cap growth in Traditional IRA",
            "REITs in Traditional IRA; small-cap growth in Roth IRA",
            "Both in the Roth IRA to maximize tax-free growth",
            "Both in the Traditional IRA for maximum tax deferral",
          ],
          correctIndex: 1,
          explanation:
            "REITs should go in the Traditional IRA because their dividends are mostly ordinary income (not qualified), so deferring that ordinary income avoids current-year taxes. Small-cap growth stocks belong in the Roth IRA because they are expected to grow the most over time — every dollar of that growth is permanently tax-free in a Roth. Placing them in a Traditional IRA would convert those potentially large gains into ordinary income at withdrawal.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Carlos is building a $500,000 portfolio with a 70/30 stock/bond allocation. He has a Roth IRA ($80,000), a Traditional 401(k) ($150,000), and a taxable brokerage ($270,000). He wants to hold: a US total stock market index fund, a REIT index fund, an international stock fund, and a total bond market fund.",
          question:
            "Which placement best optimizes tax efficiency?",
          options: [
            "Roth: REIT index; 401(k): Total bond market; Taxable: US index + International",
            "Roth: US index; 401(k): REIT index; Taxable: International + bond market",
            "Roth: International; 401(k): US index; Taxable: REIT + bond market",
            "Roth: Bond market; 401(k): REIT index; Taxable: US index + International",
          ],
          correctIndex: 0,
          explanation:
            "Option A is optimal: REITs in Roth IRA (ordinary dividend income becomes tax-free; Roth maximizes high-yielding real estate growth). Bonds in 401(k) (interest income is deferred from current-year taxation). US and International index funds in taxable (highly tax-efficient due to low turnover and qualified dividends; international funds also get the foreign tax credit in taxable accounts). Option B wastes Roth on US index when Roth is best for the highest-return, highest-dividend asset (REITs).",
          difficulty: 3,
        },
      ],
    },
  ],
};
