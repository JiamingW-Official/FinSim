import type { Unit } from "./types";

export const UNIT_FIRE_MOVEMENT: Unit = {
  id: "fire-movement",
  title: "FIRE Movement",
  description:
    "Financial Independence / Retire Early — savings rate math, the 4% rule, investment strategy for early retirees, Coast FIRE, sequence of returns risk, and post-FI life",
  icon: "🔥",
  color: "#f97316",
  lessons: [
    // ─── Lesson 1: FIRE Fundamentals ─────────────────────────────────────────────
    {
      id: "fire-fundamentals",
      title: "FIRE Fundamentals",
      description:
        "The 4% rule, FI number = 25× expenses, savings rate vs years to FI, and the four FIRE flavors: Lean, Fat, Coast, and Barista",
      icon: "Flame",
      xpReward: 70,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "What Is FIRE?",
          content:
            "**FIRE** stands for **Financial Independence, Retire Early**. The goal is to accumulate enough invested assets that your portfolio generates enough income to cover all living expenses indefinitely — making paid work optional.\n\nThe movement gained mainstream traction from the 1992 book *Your Money or Your Life* by Vicki Robin and Joe Dominguez, and was later popularized by the blog *Mr. Money Mustache*.\n\n**Two key milestones:**\n- **Financial Independence (FI)**: Your investment portfolio covers all expenses. You *could* retire, even if you choose to keep working.\n- **Retire Early (RE)**: Actually leaving full-time employment, sometimes decades before traditional retirement age (65).\n\n**Why FIRE matters beyond early retirement:**\nEven if you never plan to retire at 35, understanding FIRE principles forces you to answer a powerful question: *How much do I actually need to never worry about money again?* That clarity changes every financial decision you make.",
          highlight: ["financial independence", "retire early", "FIRE"],
        },
        {
          type: "teach",
          title: "The FI Number and the 4% Rule",
          content:
            "Your **FI Number** is the portfolio size at which you are financially independent. The formula is simple:\n\n**FI Number = Annual Expenses × 25**\n\nThis comes directly from the **4% Rule**, derived from the Trinity Study (1998). Researchers found that a portfolio of 50–75% stocks and 25–50% bonds had a ~96% success rate over 30-year periods when withdrawing 4% of the initial portfolio per year, adjusted for inflation.\n\n**Examples:**\n| Annual Expenses | FI Number (25×) | Monthly Spend |\n|-----------------|-----------------|---------------|\n| $30,000 | $750,000 | $2,500 |\n| $50,000 | $1,250,000 | $4,167 |\n| $80,000 | $2,000,000 | $6,667 |\n| $120,000 | $3,000,000 | $10,000 |\n\n**Caveats for early retirees:**\nThe Trinity Study modeled 30-year retirements. If you retire at 40, you might need 50+ years of portfolio survival. Many FIRE practitioners use a **3.5% or 3.25% withdrawal rate** (28–31× expenses) for extra safety margin in very long retirements.",
          highlight: ["FI number", "4% rule", "25×", "withdrawal rate", "Trinity Study"],
        },
        {
          type: "teach",
          title: "Savings Rate vs Years to FI (The Shockley Curve)",
          content:
            "The most powerful lever in FIRE is your **savings rate** — the percentage of take-home income you invest. The math is startling:\n\n**Years to FI by savings rate (assuming 7% real return, starting from $0):**\n| Savings Rate | Years to FI |\n|--------------|-------------|\n| 10% | ~40 years |\n| 20% | ~32 years |\n| 30% | ~25 years |\n| 40% | ~20 years |\n| 50% | ~17 years |\n| 60% | ~13 years |\n| 70% | ~9 years |\n| 80% | ~6 years |\n\nThis relationship — sharply nonlinear, steepening at high savings rates — is sometimes called the **Shockley Curve** in FIRE communities.\n\n**Why the curve is so steep:** A higher savings rate simultaneously does two things:\n1. Grows your portfolio faster (more invested each year)\n2. Reduces your FI target (lower expenses mean a smaller required portfolio)\n\n**Key insight**: Going from a 20% to 50% savings rate doesn't just double your speed — it cuts 15 years off your timeline.",
          highlight: ["savings rate", "years to FI", "Shockley curve", "7% real return"],
        },
        {
          type: "teach",
          title: "The Four FIRE Flavors",
          content:
            "FIRE is not one-size-fits-all. The community has defined several distinct variants:\n\n**Lean FIRE**: Living on a very frugal budget, typically below $40,000/year. FI number is smaller ($500K–$1M), achievable faster, but leaves little margin for lifestyle upgrades or unexpected expenses.\n\n**Fat FIRE**: Retiring with a large portfolio that supports a generous lifestyle, usually $100,000+/year in spending. Requires $2.5M–$5M+ but provides comfort and flexibility.\n\n**Coast FIRE**: You've invested enough early in life that compound growth alone will carry your portfolio to your FI number by traditional retirement age — so you only need to earn enough to cover *current* expenses, with no additional investing required. This is the most flexible flavor.\n\n**Barista FIRE**: Semi-retirement. You leave your high-stress career but take a part-time or lower-paying job that covers day-to-day expenses (and ideally provides health insurance), letting the portfolio grow untouched. Named after the idea of working at a coffee shop for benefits.\n\n**Which flavor fits you?**\nMost people's FIRE journey evolves: they start with Lean FIRE ambitions, discover Coast FIRE provides relief sooner, and may settle at Barista FIRE before eventually reaching full Fat FIRE.",
          highlight: ["Lean FIRE", "Fat FIRE", "Coast FIRE", "Barista FIRE"],
        },
        {
          type: "quiz-mc",
          question:
            "Alex spends $60,000 per year. Using the standard FIRE formula, what is Alex's FI number?",
          options: [
            "$600,000",
            "$1,000,000",
            "$1,500,000",
            "$2,400,000",
          ],
          correctIndex: 2,
          explanation:
            "FI Number = Annual Expenses × 25 = $60,000 × 25 = $1,500,000. This is derived from the 4% safe withdrawal rate: $1,500,000 × 4% = $60,000/year.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Increasing your savings rate from 50% to 70% reduces your years to FI by roughly the same amount as going from 10% to 30%.",
          correct: false,
          explanation:
            "False. The savings rate vs. years-to-FI relationship is highly nonlinear (the Shockley curve). Moving from 50% to 70% saves far more years than moving from 10% to 30%, because at high savings rates you're simultaneously cutting expenses (reducing your FI target) and investing more each year.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Savings Rate Optimization ─────────────────────────────────────
    {
      id: "fire-savings-rate",
      title: "Savings Rate Optimization",
      description:
        "Frugality vs income growth, high-impact spending cuts, lifestyle inflation avoidance, and the savings rate impact table",
      icon: "TrendingUp",
      xpReward: 70,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Two Levers: Frugality and Income Growth",
          content:
            "Your savings rate has exactly two inputs: **how much you earn** and **how much you spend**. The FIRE community sometimes argues about which lever matters more.\n\n**The frugality argument:**\nSpending cuts take effect immediately and permanently. Cutting $500/month from expenses doesn't just add $500/month to savings — it *also* reduces your FI target by $150,000 (500 × 12 × 25). One spending cut pulls two levers at once.\n\n**The income growth argument:**\nThere is a floor on how low expenses can go, but no ceiling on income. A software engineer earning $200K can reach FIRE in 7–10 years even at a moderate savings rate. Earning more also protects against lifestyle emergencies.\n\n**The optimal strategy: both, in this order:**\n1. First, eliminate obvious waste and high-cost habits that provide little happiness per dollar\n2. Then aggressively grow income through career advancement, side hustles, and negotiation\n3. Bank all income increases rather than upgrading your lifestyle (the key insight)\n\n**The critical rule**: Every dollar of income increase should be directed 100% to savings *before* you adjust your spending habits. Lifestyle inflation is the enemy of FIRE.",
          highlight: ["frugality", "income growth", "lifestyle inflation", "savings rate"],
        },
        {
          type: "teach",
          title: "High-Impact Spending Categories",
          content:
            "Most household budgets are dominated by three categories that offer the biggest savings opportunities:\n\n**1. Housing (typically 25–35% of income)**\n- House hacking: rent out rooms or an ADU to offset mortgage\n- Geographic arbitrage: move to lower cost-of-living area\n- Downsizing to reduce mortgage, utilities, and maintenance\n- Impact: cutting housing costs by $500/month = $6,000/year saved + FI target reduced by $150,000\n\n**2. Transportation (typically 15–20% of income)**\n- Buy used, reliable cars outright (avoid car payments)\n- Drive cars longer (8–15 years vs US average of 6)\n- Reduce to one car as a household\n- Bike/transit for short commutes\n- Impact: eliminating a $600/month car payment = $7,200/year + $180K FI reduction\n\n**3. Food (typically 10–15% of income)**\n- Cook at home vs dining out (restaurant meals cost 3–5× equivalent home-cooked meals)\n- Meal prep and batch cooking\n- Store brands, frozen vegetables, bulk grains\n- Impact: reducing food spending from $1,200 to $600/month = $7,200/year + $180K FI reduction\n\n**Small categories with large psychological drag:**\nSubscriptions, gym memberships, impulse shopping. Audit these annually — not because they are huge, but because they represent mindless spending.",
          highlight: ["housing", "transportation", "food", "geographic arbitrage", "house hacking"],
        },
        {
          type: "teach",
          title: "Lifestyle Inflation: The FIRE Killer",
          content:
            "**Lifestyle inflation** (also called lifestyle creep) is the automatic tendency to increase spending as income rises. It is the primary reason most high earners fail to accumulate wealth.\n\n**The pattern:**\n- Get a raise → buy a nicer car\n- Get a promotion → move to a bigger apartment\n- Earn a bonus → take a luxury vacation\n- Each upgrade feels deserved and proportional — but it permanently raises your FI target\n\n**The math of a raise:**\nYou earn a $20,000 raise. You have a choice:\n- Option A: Spend $15,000, save $5,000 → savings rate increases modestly\n- Option B: Save 100% of the raise → savings rate jumps significantly, FI timeline cuts by years\n\n**Tactical defenses against lifestyle inflation:**\n1. Automate every raise directly to investing before you 'feel' the extra income\n2. Apply the 50% rule: allow yourself to spend half of any raise, invest the other half\n3. Anchor identity to experiences and relationships, not consumption\n4. Delay major lifestyle upgrades by 90 days — most desire fades\n\n**Hedonistic adaptation works in your favor when reversed**: You will adapt to lower spending levels within 3–6 months, and most studies show happiness does not decline at moderate frugality levels.",
          highlight: ["lifestyle inflation", "lifestyle creep", "raise", "automate", "hedonistic adaptation"],
        },
        {
          type: "quiz-mc",
          question:
            "Maria cuts her monthly dining-out budget from $800 to $200, saving $600/month. By how much does this single change reduce her FI number?",
          options: [
            "$7,200",
            "$72,000",
            "$180,000",
            "$600,000",
          ],
          correctIndex: 2,
          explanation:
            "$600/month × 12 months = $7,200/year in reduced expenses. FI Number reduction = $7,200 × 25 = $180,000. This is the dual power of expense cuts: they increase savings AND shrink the target.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Receiving a 15% salary raise automatically improves your timeline to FIRE, regardless of what you do with the extra income.",
          correct: false,
          explanation:
            "False. A raise only accelerates FIRE if you invest the additional income. If you spend the entire raise (lifestyle inflation), your annual expenses increase by the same amount as your income — your savings rate stays flat and your FI target grows, potentially pushing FIRE *further* away.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Investment Strategy for FI ────────────────────────────────────
    {
      id: "fire-investment-strategy",
      title: "Investment Strategy for FI",
      description:
        "Low-cost index funds, asset allocation for early retirees, international diversification, and the bond tent strategy at retirement",
      icon: "BarChart2",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Index Fund Foundation",
          content:
            "The vast majority of successful FIRE practitioners invest primarily in **low-cost, diversified index funds**. The logic is straightforward:\n\n**Why index funds dominate FIRE:**\n- Over 15+ year periods, roughly 90% of actively managed funds underperform their benchmark index after fees\n- Expense ratios matter enormously over decades: a 1% expense ratio vs 0.04% on $1M = $9,600/year difference — compounded over 20 years, that gap costs hundreds of thousands of dollars\n- Simplicity reduces behavioral errors (no need to time the market or pick stocks)\n\n**The core portfolio (JL Collins 'Simple Path to Wealth' approach):**\n- **Accumulation phase**: 100% VTSAX/VTI (US Total Stock Market) or a three-fund portfolio\n- **Distribution phase**: Add bonds to reduce volatility as you approach and enter retirement\n\n**Three-fund portfolio:**\n| Fund | Example | Role |\n|------|---------|------|\n| US Total Stock Market | VTI | Core growth engine |\n| International Developed | VXUS | Geographic diversification |\n| US Bond Market | BND | Stability and rebalancing |\n\n**Tax-advantaged account priority order:**\n1. 401(k) to employer match (free money)\n2. HSA if available (triple tax advantage)\n3. Roth IRA ($7,000/year limit in 2024)\n4. Max remaining 401(k) ($23,000/year in 2024)\n5. Taxable brokerage account",
          highlight: ["index funds", "expense ratio", "three-fund portfolio", "VTI", "VTSAX"],
          visual: "portfolio-pie",
        },
        {
          type: "teach",
          title: "Asset Allocation for Early Retirees",
          content:
            "Traditional retirement advice suggests shifting toward bonds as you age (e.g., 'age in bonds' — hold your age as a bond percentage). **Early retirees need a different framework** because they face 40–60 year time horizons where inflation erodes bond-heavy portfolios.\n\n**Standard FIRE allocation guidance:**\n- During accumulation: 90–100% stocks, 0–10% bonds\n- Near FI (1–3 years out): Begin building a 1–2 year cash/bond buffer\n- At FI: 80–90% stocks, 10–20% bonds is common for early retirees\n- Later in retirement (15–20 years in): Gradually shift to 70/30 as longevity risk decreases\n\n**The case for staying equity-heavy:**\nAt age 40 with a 50-year horizon, equities have historically never failed to outpace inflation over 20-year+ periods. Bonds are genuinely inflation risks for multi-decade retirements.\n\n**International diversification:**\nUS stocks have dominated recent decades, but past 20-year periods saw international stocks outperform. Holding 20–40% international exposure (via VXUS) reduces single-country risk and captures global economic growth.\n\n**Rebalancing:** Annually sell the outperformer and buy the underperformer to maintain your target allocation. This mechanically enforces 'buy low, sell high.'",
          highlight: ["asset allocation", "equity heavy", "international diversification", "rebalancing", "VXUS"],
        },
        {
          type: "teach",
          title: "The Bond Tent Strategy",
          content:
            "The **bond tent** (also called a rising equity glide path) is one of the most important FIRE-specific portfolio strategies, designed to address **sequence of returns risk** — the danger that a severe market crash in your first years of retirement can permanently impair your portfolio.\n\n**How it works:**\n1. In the 3–5 years *before* retiring, gradually increase bond allocation from 10% to 30–40%\n2. This creates the 'tent peak' — maximum bond allocation right at retirement\n3. In the first 5–10 years *after* retiring, slowly reduce bonds back toward 20%, shifting to equities as the sequence-of-returns danger window passes\n\n**Why the tent works:**\n- The peak bond allocation provides a buffer of lower-volatility assets to sell during a crash without locking in equity losses\n- As years pass in retirement, the sequence risk diminishes (you've survived the vulnerable early years)\n- Shifting back to equities in later retirement preserves long-term growth potential and reduces longevity risk\n\n**Visual:**\n```\nBond %  40%         /\\\n        30%        /  \\\n        20%       /    \\_______________\n        10%      /\n                FI-5yr  FI  FI+5yr  FI+10yr\n```\n\n**Caution:** The tent adds complexity. Many successful FIRE practitioners simply maintain a consistent 80/20 or 90/10 allocation and rely on flexible spending and side income instead.",
          highlight: ["bond tent", "rising equity glide path", "sequence of returns", "buffer"],
        },
        {
          type: "quiz-mc",
          question:
            "A FIRE investor has $1.2M at FI and plans a 50-year retirement. Which asset allocation is most appropriate?",
          options: [
            "50% bonds, 50% stocks — matching a standard 60-year-old's allocation",
            "100% cash equivalents to eliminate all volatility",
            "80% stocks, 20% bonds with annual rebalancing",
            "100% bonds to preserve capital",
          ],
          correctIndex: 2,
          explanation:
            "With a 50-year horizon, an equity-heavy allocation (80/20 stocks/bonds) is appropriate. Bonds provide a modest buffer while equities drive growth needed to outpace inflation over decades. A 50% bond allocation appropriate for a 60-year-old creates unacceptable inflation risk for a 40-year early retiree.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The bond tent strategy recommends holding the highest bond allocation in the years immediately surrounding retirement, then gradually reducing bond exposure afterward.",
          correct: true,
          explanation:
            "True. The bond tent peaks at or near retirement when sequence-of-returns risk is greatest. As years pass without a portfolio-destroying crash, the investor gradually shifts back toward equities to preserve long-term purchasing power over a multi-decade retirement.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Coast FIRE ─────────────────────────────────────────────────────
    {
      id: "fire-coast",
      title: "Coast FIRE",
      description:
        "Calculate your Coast FIRE number, determine when to stop contributing, leverage part-time work flexibility, and plan your healthcare bridge",
      icon: "Anchor",
      xpReward: 75,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is Coast FIRE?",
          content:
            "**Coast FIRE** is achieved when your current portfolio, left untouched and allowed to grow at market rates, will reach your full FI number by traditional retirement age — *without any additional contributions*.\n\nAt that point, you only need to earn enough to cover *current living expenses*. You can 'coast' to full retirement without the pressure of accumulating more.\n\n**The Coast FIRE formula:**\n```\nCoast FIRE Number = FI Number / (1 + r)^years\n```\nWhere:\n- FI Number = Annual Expenses × 25\n- r = expected annual real return (commonly 7%)\n- years = years until traditional retirement age (e.g., 65)\n\n**Example — Sarah, age 30:**\n- Annual expenses: $50,000 → FI Number = $1,250,000\n- Years to 65 = 35\n- Coast Number = $1,250,000 / (1.07)^35 = $1,250,000 / 10.68 ≈ **$117,000**\n\nIf Sarah has $117,000 invested at 30, she's Coast FIRE — even if she never invests another dollar, her portfolio grows to $1.25M by 65.\n\n**Why this is powerful:** It redefines the finish line. Instead of needing $1.25M, Sarah just needs $117,000 — achievable years earlier. Once there, career decisions become dramatically more flexible.",
          highlight: ["Coast FIRE", "Coast FIRE number", "traditional retirement age", "no additional contributions"],
        },
        {
          type: "teach",
          title: "When to Stop Contributing and What Changes",
          content:
            "Reaching Coast FIRE doesn't mean stopping work — it means stopping the *need to save beyond covering expenses*.\n\n**Before Coast FIRE:**\n- High-pressure career required to maximize savings rate\n- Every career decision filtered through 'does this maximize income?'\n- Lifestyle constrained to maintain high savings rate\n\n**After Coast FIRE:**\n- Only need income to cover current living expenses (no investment contributions)\n- Can switch to lower-stress, more meaningful, or part-time work\n- Career decisions now filtered through 'does this make me happy?'\n\n**The numbers shift:**\nIf Sarah earns $80,000 and spends $50,000 (saving $30,000/year), after Coast FIRE she only needs $50,000/year in income. She could take a job paying $55,000 without any sacrifice to her retirement timeline.\n\n**Part-time work flexibility:**\nMany Coast FIRE achievers transition to part-time work, consulting, seasonal work, or passion projects. Working 20 hours/week at $25/hour = $26,000/year — enough to cover a frugal lifestyle in a low cost-of-living area, letting the portfolio compound undisturbed.\n\n**Important:** Continue monitoring your portfolio annually. If markets deliver poor returns for an extended period, you may need to resume contributions temporarily to stay on track.",
          highlight: ["Coast FIRE", "part-time work", "income requirement", "passion projects"],
        },
        {
          type: "teach",
          title: "Healthcare: The FIRE Bridge Problem",
          content:
            "For US-based early retirees, **healthcare coverage** is the single most cited practical obstacle to FIRE. Without employer-sponsored insurance, options include:\n\n**1. Marketplace (ACA) plans:**\nThe Affordable Care Act marketplace offers subsidized coverage based on income. Early retirees with low reported income can qualify for significant subsidies — sometimes $0/month premiums for silver plans. Key strategy: manage your taxable income through Roth conversions and capital gain harvesting to stay in subsidy-eligible ranges.\n\n**2. COBRA:**\nAfter leaving employment, you can continue your employer's plan for up to 18 months. This is expensive (you pay the full premium, previously partially paid by your employer) but useful as a short-term bridge.\n\n**3. Health Share Ministries:**\nNon-insurance cost-sharing arrangements. Lower monthly cost but significant limitations and not regulated as insurance.\n\n**4. Part-time work for benefits (Barista FIRE):**\nStarbucks, Costco, and REI famously offer health benefits to part-time employees (~20 hrs/week). Working part-time primarily for healthcare is a viable strategy called Barista FIRE.\n\n**5. Spouse's employer plan:**\nIf one partner still works, maintaining family coverage on their employer plan is often the simplest solution.\n\n**Budget for healthcare in your FI expenses:** In the US, budget $500–$1,500/month per household for healthcare premiums and out-of-pocket costs until Medicare eligibility at 65.",
          highlight: ["healthcare", "ACA", "marketplace", "COBRA", "Barista FIRE", "Medicare"],
        },
        {
          type: "quiz-mc",
          question:
            "Jordan, age 35, has $200,000 invested. Jordan's FI number is $1,500,000 and traditional retirement age is 65. Assuming 7% real returns, what is Jordan's Coast FIRE number?",
          options: [
            "Approximately $58,000",
            "Approximately $197,000",
            "Approximately $750,000",
            "Approximately $1,500,000",
          ],
          correctIndex: 1,
          explanation:
            "Coast FIRE Number = $1,500,000 / (1.07)^30 = $1,500,000 / 7.61 ≈ $197,000. Jordan at 35 has $200,000 — just above the Coast FIRE number — meaning Jordan has technically achieved Coast FIRE and no longer needs to invest additional dollars for traditional retirement. The $1,500,000 and $750,000 options are the full FI number and half of it, respectively.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Once you reach Coast FIRE, you should immediately stop working entirely because your retirement is fully funded.",
          correct: false,
          explanation:
            "False. Coast FIRE means your existing portfolio will grow to your FI number by traditional retirement age WITHOUT additional contributions. You still need to cover current living expenses through income (work). The freedom is that you only need income to pay bills today — no longer needing to save aggressively for retirement.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 5: Sequence of Returns Risk ──────────────────────────────────────
    {
      id: "fire-sequence-returns",
      title: "Sequence of Returns Risk",
      description:
        "Why early retirees are uniquely vulnerable to market crashes, and how to mitigate with cash buffers, flexible spending, part-time income, and the Roth conversion ladder",
      icon: "AlertTriangle",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Why Early Retirement Is Vulnerable to Sequence Risk",
          content:
            "**Sequence of returns risk** is the danger that the *order* of investment returns matters enormously for a retiree — even if average returns are identical.\n\n**Illustrative example (same average return, different outcomes):**\nPortfolio: $1,000,000 | Withdrawal: $50,000/year | Average return: 7%\n\n*Scenario A* — Good early, bad late:\nYears 1–5: +20%/year → Portfolio grows to ~$1.8M before withdrawals erode it. Even when bad years come later, the base is large. **Result: Success — portfolio survives 35 years.**\n\n*Scenario B* — Bad early, good late:\nYears 1–5: -10%/year → Portfolio drops to ~$600K while you're withdrawing $50K/year. Even when 20% gains arrive later, they're applied to a much smaller base. **Result: Failure — portfolio depleted in year 17.**\n\n**Why early retirees are especially vulnerable:**\n- The danger window is the first 10 years of retirement\n- Retirees are *withdrawing* (selling into the crash) when prices are lowest\n- The dollar amounts sold during down markets are permanently gone — they can't recover\n- A 40-year retiree has a much longer exposure to this risk than a 65-year-old with a 25-year horizon\n\n**The core insight**: Total return over your retirement matters less than when good and bad years occur.",
          highlight: ["sequence of returns risk", "withdrawal", "first 10 years", "order of returns"],
        },
        {
          type: "teach",
          title: "Mitigation Strategies: Buffer, Flexibility, Part-Time Income",
          content:
            "Several strategies reduce sequence of returns risk for early retirees:\n\n**1. Cash Buffer (Bucket Strategy)**\nHold 1–2 years of living expenses in cash or short-term bonds outside the equity portfolio. During a market crash, withdraw from this buffer while equities recover, avoiding forced selling at depressed prices.\n- Pro: Simple and psychologically comforting\n- Con: Cash drag reduces overall returns\n\n**2. Flexible Spending (Variable Withdrawal)**\nInstead of a rigid 4% withdrawal, flex spending based on portfolio performance:\n- Good years: withdraw slightly more or rebuild cash buffer\n- Bad years: reduce discretionary spending by 10–20% (cut travel, dining, etc.)\nResearch by Wade Pfau shows flexible spending dramatically improves portfolio survival rates.\n\n**3. Part-Time Income**\nEarning even $10,000–$20,000/year through part-time work, consulting, or a passion project dramatically reduces withdrawal pressure during the critical early years. This is the foundation of Barista FIRE.\n\n**4. Dynamic Withdrawal Rules:**\n- **Guyton-Klinger guardrails**: Reduce withdrawals by 10% if portfolio falls below a threshold; increase if it rises above\n- **Floor-and-ceiling rule**: Never withdraw less than 3% or more than 5% of current portfolio value\n\nCombining even two of these strategies reduces failure rates from ~5% to near zero for most 40–50 year retirement horizons.",
          highlight: ["cash buffer", "bucket strategy", "flexible spending", "part-time income", "Guyton-Klinger"],
        },
        {
          type: "teach",
          title: "The Roth Conversion Ladder",
          content:
            "Most early FIRE savers accumulate significant assets in tax-deferred accounts (Traditional 401(k), Traditional IRA). Accessing these before age 59½ normally incurs a 10% early withdrawal penalty.\n\nThe **Roth Conversion Ladder** is the standard FIRE workaround:\n\n**How it works:**\n1. In retirement (or low-income years), convert Traditional IRA/401(k) funds to a Roth IRA each year\n2. Pay income tax on the converted amount — but at a low effective rate since you have no employment income\n3. After **5 years** from each conversion, those converted dollars (not gains) can be withdrawn penalty-free\n4. By converting in Year 0, Year 1, Year 2, etc., you create a rolling ladder where funds become accessible in Years 5, 6, 7...\n\n**Example ladder:**\nRetire at 40 with $800K in Traditional IRA, $200K in Roth IRA\n- Years 0–4: Live on taxable brokerage + Roth contributions already accessible\n- Year 0: Convert $40K (taxed at ~0–12% with no other income)\n- Year 5: That $40K conversion is now penalty-free\n- Repeat annually — the ladder keeps funding early retirement\n\n**Key advantage**: At zero/low income, the standard deduction ($14,600 single in 2024) plus 10–12% bracket allows ~$50K+ of Roth conversions at very low tax cost.\n\n**Requirement**: You need enough liquid assets (taxable or Roth contributions) to cover the first 5 years before ladder rungs become accessible.",
          highlight: ["Roth conversion ladder", "Traditional IRA", "59½", "5-year rule", "taxable brokerage"],
        },
        {
          type: "quiz-mc",
          question:
            "Two investors both retire with $1M and withdraw $40,000/year. Investor A experiences +20% returns in years 1–3 then -30% in years 4–6. Investor B experiences -30% in years 1–3 then +20% in years 4–6. Who is better off after 6 years?",
          options: [
            "Both are identical — the average return is the same",
            "Investor A has a larger remaining portfolio",
            "Investor B has a larger remaining portfolio",
            "Investor A retires at a loss; Investor B at a gain",
          ],
          correctIndex: 1,
          explanation:
            "Investor A is better off. When losses occur early (Investor B), the investor must sell more shares at depressed prices to meet the same $40,000 withdrawal, permanently reducing the share count. When gains come later, they apply to a smaller base. This is the core mechanism of sequence of returns risk — early losses are disproportionately harmful.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In a Roth conversion ladder, the converted funds can be withdrawn tax-free and penalty-free immediately after conversion.",
          correct: false,
          explanation:
            "False. Roth conversion amounts (principal only, not gains) become penalty-free after a 5-year waiting period from the date of each conversion. This is why early retirees need 5+ years of bridge funding from taxable accounts or existing Roth contributions before the ladder begins paying out.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Post-FI Life ───────────────────────────────────────────────────
    {
      id: "fire-post-fi-life",
      title: "Post-FI Life",
      description:
        "Identity beyond work, purpose and meaning, volunteer and passion projects, managing ongoing healthcare costs, and optimizing Social Security for early retirees",
      icon: "Sunrise",
      xpReward: 65,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "Identity and Purpose Beyond Work",
          content:
            "For many people, the psychological challenge of FIRE is underestimated. After years of career identity, early retirement can feel disorienting.\n\n**Common post-FIRE psychological challenges:**\n- Loss of structured daily routine\n- Feeling unproductive or lacking purpose\n- Social isolation (most friends still work 40+ hours/week)\n- Identity crisis ('what do I do when people ask what I do?')\n- Unexpected boredom — especially if 'not working' was the only defined goal\n\n**What research on retirement satisfaction shows:**\nPeople who retire successfully tend to retire *toward* something, not just away from work. The happiest early retirees report:\n- Active pursuit of meaningful projects (not pure leisure)\n- Ongoing social connection and community\n- Some form of contribution or purpose beyond self\n- Physical health as a cornerstone of daily structure\n\n**Practical frameworks:**\n- The 'Replacement Portfolio': list what work provided (income, structure, social, status, challenge) and explicitly plan how to replace each\n- Give yourself a 1-year 'decompression' period before committing to any structure\n- Experiment with different activities before deciding what FI life looks like",
          highlight: ["identity", "purpose", "post-FIRE", "retirement satisfaction", "replacement portfolio"],
        },
        {
          type: "teach",
          title: "Volunteer Work, Passion Projects, and Semi-Retirement",
          content:
            "Most early retirees do not spend their days on a beach. They redirect the energy previously devoted to careers into activities that are intrinsically rewarding:\n\n**Common pursuits in post-FIRE life:**\n- **Volunteer work**: Habitat for Humanity, local food banks, tutoring, animal shelters. Provides structure, social connection, and contribution.\n- **Creative projects**: Writing, music, art, podcasting. Many people discover creative abilities that were suppressed during career years.\n- **Entrepreneurship**: Low-pressure ventures built around passion rather than income maximization.\n- **Community building**: Starting local FIRE meetups, blogs, or YouTube channels (many FIRE bloggers build small but meaningful audiences).\n- **Travel and learning**: Extended slow travel (spending 2–4 weeks in each location rather than 1-week vacations) costs less than people expect and is deeply enriching.\n- **Physical pursuits**: Competitive sports, hiking trails, cycling, martial arts — activities requiring training time that careers prevented.\n\n**The semi-retirement option:**\nMany people find that working 10–20 hours per week on something they love is the ideal post-FI life — not zero work. This is sometimes called 'one more year syndrome' avoidance: recognize that modest part-time work can fund a rich life while keeping retirement funds growing.",
          highlight: ["volunteer", "passion projects", "creative", "slow travel", "semi-retirement"],
        },
        {
          type: "teach",
          title: "Social Security Optimization for Early Retirees",
          content:
            "Early retirees face a unique challenge with Social Security: their **earnings record will show many years of zero income**, reducing lifetime benefits.\n\n**How Social Security is calculated:**\nYour benefit is based on your 35 highest-earning years. If you retire at 40 with only 18 working years, the remaining 17 years count as **$0** in the calculation, significantly reducing your benefit.\n\n**Optimization strategies:**\n\n1. **Work at least 35 years if possible**: Even part-time income in retirement years adds to your record, replacing zero-year gaps. A year earning $20,000 replaces a $0 year, increasing future benefits.\n\n2. **Delay claiming until 70**: Social Security benefits grow ~8% per year from age 62 to 70. For early retirees with a long life expectancy, delaying to 70 maximizes lifetime benefits. This requires your portfolio to bridge the gap from early retirement to 70.\n\n3. **Spousal benefits**: Married couples can claim spousal benefits (up to 50% of the higher earner's benefit) while deferring their own. Complex optimization strategies can increase lifetime household benefits substantially.\n\n4. **Don't count on it heavily in early FIRE planning**: Social Security is a bonus for early retirees, not the foundation. Plan conservatively assuming you receive 70–75% of your currently projected benefit (given potential future legislative changes).",
          highlight: ["Social Security", "35 highest years", "delay to 70", "spousal benefits", "zero years"],
        },
        {
          type: "quiz-mc",
          question:
            "Someone retires at age 38 and never works again. How does this typically affect their Social Security benefit calculation?",
          options: [
            "No effect — Social Security uses only your peak 10 earning years",
            "Their benefit is reduced because 17+ of their 35 calculation years will be $0",
            "They receive a special early retirement bonus for leaving the workforce early",
            "Their benefit is unaffected as long as they have at least 10 years of work credits",
          ],
          correctIndex: 1,
          explanation:
            "Social Security calculates benefits using your 35 highest-earning years. Retiring at 38 with perhaps 16–18 working years means 17–19 years of $0 earnings will be included in the calculation, significantly reducing the monthly benefit compared to someone who worked 35 full years.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Research consistently shows that early retirees are happiest when they retire *away* from work (focused on escaping a job) rather than having a defined purpose or project to pursue.",
          correct: false,
          explanation:
            "False. Studies of retirement satisfaction consistently find that people who retire *toward* something — meaningful projects, community involvement, creative work, learning, or contribution — report significantly higher life satisfaction than those who retire primarily to escape work without a defined positive purpose.",
          difficulty: 1,
        },
      ],
    },
  ],
};
