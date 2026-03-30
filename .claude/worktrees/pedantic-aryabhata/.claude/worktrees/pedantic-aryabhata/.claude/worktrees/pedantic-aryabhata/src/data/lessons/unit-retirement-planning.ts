import type { Unit } from "./types";

export const UNIT_RETIREMENT_PLANNING: Unit = {
  id: "retirement-planning",
  title: "Retirement Planning",
  description:
    "Master Social Security optimization, Medicare, retirement accounts, RMDs, healthcare costs, and sustainable withdrawal strategies",
  icon: "Sunset",
  color: "#f59e0b",
  lessons: [
    // ─── Lesson 1: Social Security Optimization ──────────────────────────────────
    {
      id: "retirement-1",
      title: " Social Security Optimization",
      description:
        "FRA, claiming strategies, delayed credits, spousal benefits, survivor benefits, and the windfall elimination provision",
      icon: "Building2",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📅 Full Retirement Age & Claiming Windows",
          content:
            "**Full Retirement Age (FRA)** is the age at which you receive your full calculated Social Security benefit, called the **Primary Insurance Amount (PIA)**.\n\nFor anyone born **1960 or later**, FRA is **age 67**.\n\n**Claiming windows:**\n- **Age 62 (earliest):** Benefit is permanently reduced by **30%** below your FRA amount. The reduction is 6.67% per year for the first 3 years before FRA (ages 64–67) and 5% per year for earlier years (ages 62–64).\n- **Age 67 (FRA):** Receive your full PIA — no reduction, no increase.\n- **Age 70 (maximum):** Delayed retirement credits add **8% per year** beyond FRA. Delaying from 67 to 70 yields a **+24% permanent increase** over your FRA benefit.\n\n**No benefit to delaying past 70:** Credits stop accruing at 70. Anyone who waits beyond 70 simply forgoes monthly checks with no additional gain.\n\n**Example:**\n- FRA benefit: $2,000/month at 67\n- Claim at 62: $1,400/month (−30%)\n- Claim at 70: $2,480/month (+24%)",
          highlight: ["full retirement age", "age 67", "age 62", "age 70", "8% per year", "30%", "Primary Insurance Amount"],
        },
        {
          type: "teach",
          title: "⚖️ Break-Even Analysis",
          content:
            "**Break-even analysis** determines at what age the lifetime benefits from a delay strategy surpass those of an early claim.\n\n**Example — FRA benefit $2,000/month:**\n- Claim at 62: $1,400/month. By age 80, cumulative income = $1,400 × 216 months = **$302,400**\n- Claim at 67: $2,000/month. By age 80, cumulative income = $2,000 × 156 months = **$312,000**\n- **Break-even: approximately age 80**\n\n**Claim at 62 vs. 70 break-even:** Around age 82–83.\n\n**Key insight:** If you expect to live **past age 80–83**, delaying Social Security is mathematically advantageous. If your health suggests a shorter life expectancy, early claiming may maximize total lifetime income.\n\n**Other factors that favor delay:**\n- Strong family history of longevity\n- Non-investment income available (pension, part-time work) to bridge the gap\n- Goal of maximizing survivor benefits for a spouse\n- Lower current tax bracket (fewer required minimum distributions early in retirement)",
          highlight: ["break-even", "age 80", "cumulative income", "delay", "longevity", "survivor benefits"],
        },
        {
          type: "teach",
          title: "👫 Spousal, Survivor & Special Provisions",
          content:
            "**Spousal benefits:** A non-working or lower-earning spouse can receive **up to 50% of the higher earner's FRA benefit**. The spousal benefit does NOT increase by delaying past FRA — a non-working spouse should claim at FRA.\n\n**Survivor benefits:** When a spouse dies, the surviving spouse can receive **up to 100%** of the deceased's benefit (including any delayed credits). This is why the higher earner delaying to 70 is powerful — the survivor inherits the maximized amount.\n\n**Divorced spouse benefits:** If the marriage lasted **10+ years** and you are currently unmarried, you can claim on your ex-spouse's record without affecting their benefit.\n\n**Windfall Elimination Provision (WEP):** Reduces Social Security benefits for workers who also receive a pension from employment that was NOT covered by Social Security (e.g., some state/local government jobs). WEP can reduce your benefit by up to 50% of the non-covered pension amount.\n\n**Government Pension Offset (GPO):** Reduces spousal/survivor benefits for those receiving a government pension from non-covered employment — by two-thirds of the pension amount. Some spouses may receive $0 in Social Security spousal benefits as a result.",
          highlight: ["spousal benefit", "50%", "survivor benefit", "100%", "10 years", "WEP", "windfall elimination", "GPO"],
        },
        {
          type: "quiz-mc",
          question:
            "A person's FRA benefit is $2,000/month. They delay claiming until age 70. What is their monthly benefit?",
          options: [
            "$2,480/month — 24% increase for 3 years of delayed credits at 8%/year",
            "$2,240/month — 12% increase for delaying 1.5 years",
            "$2,000/month — delayed credits only apply past age 70",
            "$2,600/month — 30% increase mirrors the early-claim penalty",
          ],
          correctIndex: 0,
          explanation:
            "Delaying from FRA (67) to 70 earns 8% per year in delayed retirement credits for 3 years: 3 × 8% = 24%. $2,000 × 1.24 = $2,480/month. This increase is permanent and also becomes the baseline for any survivor benefit a spouse may receive.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A non-working spouse should delay claiming their Social Security spousal benefit until age 70 to earn delayed retirement credits.",
          correct: false,
          explanation:
            "False. Delayed retirement credits only apply to your OWN earned Social Security benefit. The spousal benefit (up to 50% of the higher earner's FRA amount) does NOT increase by delaying past FRA. A non-working or lower-earning spouse should generally claim the spousal benefit at their own FRA — waiting longer gains nothing.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Helen and Tom are both 62. Tom's FRA benefit is $3,000/month; Helen's is $700/month. They expect Tom to live to age 84 and Helen to age 91. Tom is deciding between claiming at 62 ($2,100/month) or delaying to 70 ($3,720/month).",
          question: "Which strategy best maximizes their household lifetime Social Security income?",
          options: [
            "Tom delays to 70; Helen claims her own benefit at FRA — maximizes survivor income since Helen outlives Tom",
            "Both claim at 62 to start receiving checks as early as possible",
            "Tom claims at FRA; Helen claims spousal benefit at 62",
            "Both delay to 70 to maximize total benefits",
          ],
          correctIndex: 0,
          explanation:
            "Tom delaying to 70 ($3,720/month) is optimal for two reasons: (1) Tom lives to 84 — past the break-even age — so the higher monthly benefit wins on its own. (2) After Tom dies, Helen inherits 100% of Tom's benefit ($3,720/month) for the rest of her life (to age 91). Tom's delay dramatically improves Helen's 7+ years of survivor benefits. This is the classic 'delay the higher earner' strategy for couples.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Medicare & Healthcare in Retirement ───────────────────────────
    {
      id: "retirement-2",
      title: "🏥 Medicare & Healthcare in Retirement",
      description:
        "Medicare parts A/B/C/D, IRMAA surcharges, Medigap supplements, Medicare Advantage tradeoffs, and long-term care costs",
      icon: "HeartPulse",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🔵 Medicare Parts A, B, C & D",
          content:
            "Medicare is the federal health insurance program for Americans age **65+** (and some disabled individuals under 65).\n\n**Part A — Hospital Insurance:**\n- Covers inpatient hospital stays, skilled nursing facility care, hospice, and some home health\n- **Free** for most people (if you or spouse paid Medicare taxes for 10+ years)\n- $1,632 deductible per benefit period (2024)\n\n**Part B — Medical Insurance:**\n- Covers doctor visits, outpatient care, preventive services, durable medical equipment\n- Standard premium: **~$174.70/month** (2024) — higher for higher incomes (see IRMAA)\n- 80/20 coinsurance after annual deductible: Medicare pays 80%, you pay 20% with no out-of-pocket cap\n\n**Part C — Medicare Advantage:**\n- Private insurer plans that bundle Parts A + B (often including Part D)\n- Often lower premiums than Original Medicare + Medigap combined\n- Trade-off: **network restrictions** (HMO/PPO), prior authorizations, may limit specialist access\n\n**Part D — Prescription Drugs:**\n- Optional coverage through private insurers (stand-alone or bundled with Advantage)\n- Late enrollment penalty: 1% per month delay if you skip Part D without creditable coverage",
          highlight: ["Part A", "Part B", "$174.70/month", "Part C", "Medicare Advantage", "Part D", "80/20", "late enrollment penalty"],
        },
        {
          type: "teach",
          title: " IRMAA & Medigap (Supplemental) Insurance",
          content:
            "**IRMAA (Income-Related Monthly Adjustment Amount):**\nHigh-income retirees pay a surcharge on top of standard Part B (and Part D) premiums. IRMAA is based on your **MAGI from 2 years prior**.\n\n**2024 Part B IRMAA tiers (individual MAGI):**\n- ≤$103,000: $174.70/month (standard)\n- $103,001–$129,000: $244.60/month\n- $129,001–$161,000: $349.40/month\n- $161,001–$193,000: $454.20/month\n- $193,001–$500,000: $559.00/month\n- >$500,000: $594.00/month\n\nNote: **Two-year lookback** means 2024 premiums are based on 2022 income. A large Roth conversion or capital gain in a prior year can trigger IRMAA.\n\n**Medigap (Medicare Supplement Insurance):**\n- Private insurance that covers the **gaps** in Original Medicare: deductibles, copays, the 20% coinsurance\n- Most popular plan — **Plan G** — covers virtually all out-of-pocket costs except the Part B deductible\n- Typical premium: $100–$250/month depending on age and location\n- Cannot be used with Medicare Advantage — you choose one or the other\n- Guaranteed issue only during Medigap open enrollment (first 6 months after Part B enrollment)",
          highlight: ["IRMAA", "MAGI", "two-year lookback", "Medigap", "Plan G", "20% coinsurance", "guaranteed issue"],
        },
        {
          type: "teach",
          title: " Long-Term Care & Retirement Healthcare Costs",
          content:
            "**The $315,000 problem:**\nFidelity estimates the average 65-year-old couple will need **$315,000** (2023) in retirement to cover healthcare costs — NOT including long-term care. This covers premiums, deductibles, copays, and out-of-pocket expenses throughout retirement.\n\n**Long-term care (LTC) costs:**\n- Average nursing home (private room): **~$100,000+/year**\n- Assisted living facility: ~$54,000/year\n- Home health aide (full-time): ~$61,000/year\n- Average LTC need: 2–3 years, but 20% of people need 5+ years\n\n**Medicare does NOT cover custodial care** (help with activities of daily living). It only covers skilled nursing for up to 100 days after a qualifying hospital stay.\n\n**LTC funding options:**\n1. **LTC insurance:** Purchased ideally in your 50s (premiums increase sharply with age). Benefit period, daily benefit, and inflation protection are key riders.\n2. **Hybrid life/annuity with LTC rider:** Death benefit if care is never needed; accelerates benefit if care is required.\n3. **Self-insure:** Keep significant liquid assets — viable for high-net-worth individuals.\n4. **Medicaid planning:** Spend down assets to qualify for Medicaid (state-funded LTC) — requires careful legal planning 5 years in advance (look-back period).",
          highlight: ["$315,000", "long-term care", "$100,000", "custodial care", "100 days", "LTC insurance", "hybrid", "Medicaid"],
        },
        {
          type: "quiz-mc",
          question:
            "A retiree had a MAGI of $200,000 in 2022. Will they pay extra for Medicare Part B in 2024?",
          options: [
            "Yes — IRMAA surcharges apply because $200K exceeds the $103,000 threshold; they will pay ~$559/month",
            "No — IRMAA only applies to active workers, not retirees",
            "No — the $200K income was in 2022, so 2024 premiums use 2023 income only",
            "Yes — but only if their 2024 income also exceeds the threshold",
          ],
          correctIndex: 0,
          explanation:
            "IRMAA uses a two-year lookback: 2024 Medicare Part B premiums are determined by 2022 MAGI. With $200,000 MAGI in 2022 (individual), the retiree falls in the $193,001–$500,000 IRMAA tier, paying approximately $559/month instead of the standard $174.70/month. Large Roth conversions, capital gains, or RMDs in prior years can unexpectedly trigger IRMAA.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Medicare Part A covers unlimited nursing home stays for seniors who need ongoing personal care assistance.",
          correct: false,
          explanation:
            "False. Medicare Part A covers skilled nursing facility care for up to 100 days only after a qualifying 3-day inpatient hospital stay — and with significant daily copays after day 20. Medicare does NOT cover custodial care (bathing, dressing, eating) which is what most long-term care residents need. That is why long-term care insurance or significant personal savings are essential retirement planning tools.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Barbara is turning 65 and wants to enroll in Original Medicare. She plans to add supplemental coverage to eliminate most out-of-pocket costs. Her financial advisor mentions Plan G and Medicare Advantage as two options.",
          question: "What is the key trade-off between Medigap Plan G (with Original Medicare) and Medicare Advantage?",
          options: [
            "Plan G with Original Medicare offers nationwide coverage with nearly no out-of-pocket costs but higher premiums; Advantage has lower premiums but restricts you to a provider network",
            "Medicare Advantage covers more services than Original Medicare in all cases",
            "Plan G is only available to people under 70 and cannot be purchased after initial enrollment",
            "Medicare Advantage and Medigap can be combined for maximum coverage at no extra cost",
          ],
          correctIndex: 0,
          explanation:
            "Medigap Plan G paired with Original Medicare provides the broadest access (any doctor accepting Medicare nationwide) with minimal out-of-pocket costs beyond the Part B deductible, but premiums run $100–$250/month. Medicare Advantage typically has lower premiums and often bundles dental/vision, but uses HMO/PPO networks, may require referrals, and can restrict access to specialists — a critical consideration for those with chronic conditions or who travel frequently.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Required Minimum Distributions (RMDs) ────────────────────────
    {
      id: "retirement-3",
      title: " Required Minimum Distributions",
      description:
        "RMD age rules, calculation method, penalties, inherited IRA 10-year rule, QCDs, and Roth conversion planning",
      icon: "Calculator",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📋 RMD Basics: Age, Calculation & Accounts",
          content:
            "**Required Minimum Distributions (RMDs)** are mandatory annual withdrawals the IRS requires from tax-deferred retirement accounts once you reach a certain age.\n\n**Current RMD age:** **73** (under SECURE Act 2.0, enacted 2022). The age will rise to **75 by 2033** for those born 1960 or later.\n\n**Accounts subject to RMDs:**\n- Traditional IRA, SEP-IRA, SIMPLE IRA\n- 401(k), 403(b), 457(b) — from former employers\n- Note: **Roth IRAs are NOT subject to RMDs** during the owner's lifetime — a key advantage\n- Roth 401(k): RMDs required until 2024 rule change eliminated them (SECURE 2.0)\n\n**RMD calculation:**\n$$\\text{RMD} = \\frac{\\text{Account Balance (Dec 31 prior year)}}{\\text{Life Expectancy Factor (IRS Uniform Lifetime Table)}}$$\n\n**Example:** Account balance of $500,000, age 73 → life expectancy factor = **26.5**\n$$\\text{RMD} = \\frac{\\$500,000}{26.5} = \\$18,868$$\n\n**First RMD:** Must be taken by April 1 of the year after you turn 73. Taking two RMDs in one year (April 1 + December 31) can create a large taxable income spike.",
          highlight: ["RMD age 73", "age 75 by 2033", "Uniform Lifetime Table", "Roth IRA", "life expectancy factor", "April 1"],
        },
        {
          type: "teach",
          title: " RMD Penalties, Inherited IRAs & the 10-Year Rule",
          content:
            "**Missing RMD penalty:**\n- SECURE Act 2.0 reduced the excise tax from **50%** to **25%** of the amount not withdrawn\n- Corrected within 2 years: penalty further reduced to **10%**\n- Example: RMD of $20,000 missed → $5,000 penalty (25%) if not corrected in time\n\n**Inherited IRA rules (non-spouse beneficiaries):**\n- **10-year rule:** Under SECURE Act (2019), non-spouse beneficiaries must **empty the inherited IRA within 10 years** of the original owner's death\n- Annual RMDs required if the original owner had already begun RMDs\n- This compresses distributions into 10 years, potentially creating significant tax bills\n\n**Eligible designated beneficiaries** (exempt from 10-year rule): spouse, minor children (until majority), disabled individuals, chronically ill, beneficiaries within 10 years of age of the decedent\n\n**Spouse exception:** Surviving spouse can roll the inherited IRA into their own IRA and delay RMDs to their own RMD start age — or treat it as an inherited IRA and take distributions based on their own life expectancy.",
          highlight: ["25% penalty", "50% old penalty", "10-year rule", "inherited IRA", "non-spouse", "SECURE Act", "eligible designated beneficiary"],
        },
        {
          type: "teach",
          title: " QCDs & Roth Conversion Strategies",
          content:
            "**Qualified Charitable Distributions (QCDs):**\n- Allows IRA owners age **70½ or older** to transfer up to **$105,000/year** (2024, indexed for inflation) directly from an IRA to a qualified charity\n- QCD counts toward the RMD but is **excluded from taxable income** — unlike a regular distribution followed by a donation\n- Especially valuable for those who don't itemize deductions (can't deduct charitable gifts)\n- Strategy: Use QCD for the charitable portion of RMDs; take remaining RMD as taxable distribution\n\n**Roth conversion strategy before RMD age:**\nConverting traditional IRA funds to a Roth IRA before age 73 **reduces future RMD balances**, lowering mandatory taxable income in later years.\n\n**Optimal conversion window:** Ages 59½ to 73 — after earning income drops (retirement) but before RMDs begin. Fill up lower tax brackets each year.\n\n**RMD aggregation rules:**\n- Multiple traditional IRAs: Calculate each separately, but can withdraw total from any one IRA\n- Multiple 401(k)s: Must calculate and withdraw from each plan separately (unlike IRAs)\n- RMDs cannot be rolled over to another IRA — they must be taken in cash or in-kind",
          highlight: ["QCD", "$105,000", "70½", "excluded from income", "Roth conversion", "59½ to 73", "aggregation", "cannot be rolled over"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor is 73 years old with a $500,000 traditional IRA. The IRS Uniform Lifetime Table life expectancy factor for age 73 is 26.5. What is their RMD for this year?",
          options: [
            "$18,868 — calculated as $500,000 ÷ 26.5",
            "$25,000 — flat 5% of account balance",
            "$13,699 — calculated as $500,000 ÷ 36.5",
            "$10,000 — the IRS minimum for all accounts under $1M",
          ],
          correctIndex: 0,
          explanation:
            "RMD = Account Balance ÷ Life Expectancy Factor = $500,000 ÷ 26.5 = $18,868. The IRS Uniform Lifetime Table provides life expectancy factors for each age. The factor decreases as you age, meaning the required withdrawal percentage increases over time. Missing this RMD would result in a 25% excise tax ($4,717) on the undistributed amount.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Roth IRAs are subject to Required Minimum Distributions during the owner's lifetime.",
          correct: false,
          explanation:
            "False. Roth IRAs are NOT subject to RMDs during the original owner's lifetime — this is one of their most powerful tax planning advantages. SECURE Act 2.0 also eliminated RMDs from Roth 401(k)s starting in 2024. The freedom from RMDs allows Roth accounts to compound tax-free indefinitely, and they can be left to heirs (though inherited Roth IRAs are subject to the 10-year rule for non-spouse beneficiaries).",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Margaret, age 75, has a $600,000 traditional IRA and wants to satisfy her RMD while supporting her favorite charity. Her RMD for the year is $24,000. She is in the 22% tax bracket and does not itemize deductions.",
          question: "What is the tax benefit if Margaret uses a $24,000 QCD to satisfy her RMD instead of taking the distribution and donating it separately?",
          options: [
            "She saves $5,280 in taxes — $24,000 × 22%, because the QCD is excluded from taxable income while a regular distribution + donation would not reduce income without itemizing",
            "No tax benefit — QCDs and regular distributions are taxed identically",
            "She saves taxes only if her donation exceeds the standard deduction",
            "She saves $5,280 but also incurs a 10% QCD administrative penalty",
          ],
          correctIndex: 0,
          explanation:
            "With a QCD, the $24,000 goes directly to charity and is completely excluded from Margaret's gross income, saving 22% × $24,000 = $5,280 in federal taxes. If she took the distribution normally and then donated it, the $24,000 would be ordinary income — and since she doesn't itemize, the charitable deduction would not reduce her taxes at all. The QCD is one of the most effective tax strategies available to charitable retirees with RMDs.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Sustainable Withdrawal Strategies ─────────────────────────────
    {
      id: "retirement-4",
      title: "💼 Sustainable Withdrawal Strategies",
      description:
        "4% rule, sequence-of-returns risk, bucket strategy, dynamic withdrawals, guardrails, and annuity solutions",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📐 The 4% Rule (Trinity Study)",
          content:
            "The **4% rule** originated from the 1994 Trinity Study, which analyzed historical portfolio survival rates over 30-year retirement periods.\n\n**Key finding:** A **60% stock / 40% bond** portfolio could sustain **4% annual withdrawals** (inflation-adjusted) with a ~95% success rate over 30 years across all historical periods since 1926.\n\n**How it works:**\n- $1,000,000 portfolio × 4% = **$40,000/year** in year 1\n- Adjust for inflation each subsequent year (e.g., $40,800 in year 2 if 2% inflation)\n- Portfolio continues to grow; withdrawals remain fixed in real terms\n\n**Limitations and caveats:**\n- Based on US historical returns — future returns may be lower\n- 30-year window: A 60-year-old retiring today may need 35+ years of income\n- Doesn't account for variable spending (healthcare costs spike late in retirement)\n- 5% withdrawal rate has historically worked ~80% of the time — not the 95% of 4%\n\n**The 4% rule is a starting point**, not a guaranteed outcome. Many financial planners now recommend **3.3%–3.5%** for longer retirements or conservative portfolios.",
          highlight: ["4% rule", "Trinity Study", "60/40", "30 years", "inflation-adjusted", "95% success", "3.3%–3.5%"],
        },
        {
          type: "teach",
          title: " Sequence of Returns Risk",
          content:
            "**Sequence of returns risk** is the danger that a portfolio experiences large negative returns **early in retirement**, permanently impairing the portfolio's ability to fund the full retirement.\n\n**Why early losses are uniquely damaging:**\nWhen you withdraw money during a downturn, you sell shares at low prices — those shares cannot participate in the recovery. This \"lock in\" of losses amplifies the depletion effect.\n\n**Illustration — same average return, different sequence:**\n- Portfolio A: Returns +20%, +20%, −30% → Final value higher\n- Portfolio B (retiree): Returns −30%, +20%, +20% → Final value much lower after withdrawals\nSame average return, but the sequence in Portfolio B devastates a retiree making withdrawals in the down year.\n\n**Mitigation strategies:**\n1. **Cash buffer:** Keep 1–2 years of expenses in cash — avoids selling equities in down years\n2. **Bucket strategy:** Allocate by time horizon (see next slide)\n3. **Flexible spending:** Cut discretionary spending 10–15% in down markets\n4. **Part-time work / income floor:** Reduce portfolio dependence in early retirement years\n5. **Annuity income floor:** Guaranteed income reduces the need to sell equities at depressed prices",
          highlight: ["sequence of returns", "early losses", "withdrawals during downturn", "cash buffer", "flexible spending", "income floor"],
        },
        {
          type: "teach",
          title: "🪣 Bucket Strategy, Guardrails & Annuities",
          content:
            "**Bucket Strategy:**\nDivide your retirement portfolio into three buckets based on time horizon:\n\n- **Bucket 1 (Short-term, 0–2 years):** Cash and money market funds. Covers current living expenses without needing to sell investments. Insulates against sequence risk.\n- **Bucket 2 (Medium-term, 3–10 years):** Bonds, CDs, dividend stocks. Refills Bucket 1 as needed. Lower volatility.\n- **Bucket 3 (Long-term, 10+ years):** Diversified equities for growth. Not touched for at least a decade.\n\n**Guardrails Strategy (Kitces/Guyton-Klinger):**\nSet dynamic spending bounds:\n- **Upper guardrail:** 5.5% withdrawal rate → cut spending by 10%\n- **Lower guardrail:** 4.0% withdrawal rate → increase spending by 10%\nThis prevents both overspending and excessive underspending.\n\n**Annuity as income floor:**\nConverting a portion of savings to a **Single Premium Immediate Annuity (SPIA)** creates guaranteed lifetime income alongside Social Security. Example: $300,000 → ~$1,600/month for life (age 65). Remaining portfolio can be invested more aggressively since the income floor is secured.",
          highlight: ["bucket strategy", "Bucket 1", "Bucket 2", "Bucket 3", "guardrails", "5.5%", "4.0%", "SPIA", "income floor"],
        },
        {
          type: "quiz-mc",
          question:
            "A retiree has a $1,000,000 portfolio and spends $50,000/year. Their withdrawal rate is 5%. Based on the Trinity Study, is this sustainable?",
          options: [
            "Uncertain — a 5% withdrawal rate has an ~80% success rate over 30 years, lower than the 95% at 4%",
            "Yes — 5% has been proven sustainable indefinitely at any time in history",
            "No — any withdrawal above 4% always fails within 20 years",
            "Yes — as long as the portfolio earns more than 5%, withdrawals are sustainable",
          ],
          correctIndex: 0,
          explanation:
            "A 5% withdrawal rate from a 60/40 portfolio has historically succeeded about 80% of the time over 30 years — meaningfully lower than the ~95% success rate of 4%. The 20% failure risk means that in roughly 1 out of 5 historical periods, the portfolio would have run out of money. This is acceptable for some retirees but represents significant risk for those with longer time horizons or lower spending flexibility.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "In the bucket strategy, Bucket 3 (long-term equity) should be liquidated first when the market declines to replenish Bucket 1 cash needs.",
          correct: false,
          explanation:
            "False — this is the exact opposite of the bucket strategy's purpose. When markets decline, you should draw from Bucket 1 (cash) and Bucket 2 (bonds/stable assets) and leave Bucket 3 (equities) untouched to recover. Selling equities during a downturn is precisely the sequence-of-returns risk that the bucket strategy is designed to prevent. Bucket 3 is only harvested after markets recover or during normal conditions.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Carlos, age 67, has $1.2M in a 60/40 portfolio and Social Security of $2,000/month ($24,000/year). He needs $72,000/year for total living expenses. He's considering two strategies: (A) Withdraw $48,000/year (4%) from portfolio + SS, or (B) Purchase a $400,000 SPIA for $2,200/month lifetime income and withdraw from the remaining $800,000.",
          question: "What key advantage does Strategy B provide that Strategy A does not?",
          options: [
            "Strategy B creates a higher guaranteed income floor that reduces sequence-of-returns risk on the remaining portfolio",
            "Strategy B always generates more total lifetime income regardless of lifespan",
            "Strategy B eliminates all portfolio withdrawal needs, so Carlos never needs to sell equities",
            "Strategy B has lower taxes because annuity income is tax-exempt",
          ],
          correctIndex: 0,
          explanation:
            "Strategy B's key advantage is a stronger income floor: $2,000 (SS) + $2,200 (SPIA) = $4,200/month guaranteed, covering nearly all of Carlos's $6,000/month need. The remaining $800,000 portfolio only needs to cover ~$1,800/month shortfall — and can be invested more aggressively. This dramatically reduces sequence-of-returns risk since Carlos rarely needs to liquidate equities in a down market. The trade-off is loss of liquidity on the $400K (annuities are irrevocable). Annuity income is partially taxable (exclusion ratio applies), not tax-exempt.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Estate Planning in Retirement ─────────────────────────────────
    {
      id: "retirement-5",
      title: " Estate Planning in Retirement",
      description:
        "Federal estate tax, step-up in basis, charitable strategies, beneficiary designations, trusts, and digital assets",
      icon: "ScrollText",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " Federal Estate Tax & Portability",
          content:
            "**Federal estate tax** is levied on the taxable estate (assets minus deductions) of a deceased person.\n\n**2024 federal exemption:** **$13.61 million per individual** — indexed for inflation. Only estates exceeding this amount owe federal estate tax, at a top rate of **40%**.\n\n**Portability:** A surviving spouse can use the deceased spouse's unused exemption (DSUE). A couple effectively has a combined exemption of **$27.22 million** if portability is elected on a timely filed estate tax return (Form 706, within 9 months of death).\n\n**Sunset provision:** The current high exemption is set to revert to approximately **$7 million per person** after December 31, 2025 (unless Congress acts). This creates a planning window for high-net-worth individuals.\n\n**State estate taxes:** 12+ states have their own estate taxes with **lower exemptions** (e.g., Massachusetts: $2M, Oregon: $1M). Residents of these states may owe state estate tax even if well below the federal threshold.\n\n**Annual gift tax exclusion:** $18,000/person/year (2024) — gift this amount to any number of people without using your lifetime exemption.",
          highlight: ["$13.61 million", "40%", "portability", "DSUE", "$27.22 million", "sunset 2025", "$7 million", "annual gift $18,000"],
        },
        {
          type: "teach",
          title: " Step-Up in Basis & Charitable Strategies",
          content:
            "**Step-up in basis:**\nWhen you inherit an asset, its **cost basis is reset to the fair market value on the date of the decedent's death**. This eliminates all embedded capital gains accrued during the decedent's lifetime.\n\n**Example:**\n- Parent bought stock for $10,000 in 1985; it's worth $500,000 at death\n- Heir inherits the stock with a **new basis of $500,000**\n- Heir sells for $510,000 → owes capital gains tax only on $10,000 gain\n- Without step-up: $490,000 gain × 20% LTCG rate = $98,000 in taxes avoided\n\n**Highly appreciated assets should generally be held until death** rather than gifted during life (gifts carry the donor's basis).\n\n**Charitable giving strategies:**\n- **QCDs:** Direct IRA transfers to charity (already covered in Lesson 3)\n- **Charitable Remainder Trust (CRT):** You transfer appreciated assets to the trust; the trust pays you income for life, and the remainder goes to charity. You get a partial charitable deduction upfront.\n- **Donor-Advised Fund (DAF):** Contribute appreciated assets, get an immediate deduction, distribute to charities over time. Simple and flexible.\n- **Charitable Lead Trust (CLT):** Charity receives income first; remainder passes to heirs with reduced gift/estate tax.",
          highlight: ["step-up in basis", "date of death", "appreciated assets", "QCD", "Charitable Remainder Trust", "Donor-Advised Fund", "DAF", "CLT"],
        },
        {
          type: "teach",
          title: "📋 Beneficiary Designations, Trusts & Digital Estate",
          content:
            "**Beneficiary designations supersede your will:**\nRetirement accounts (IRA, 401k), life insurance policies, and TOD/POD bank accounts transfer directly to named beneficiaries regardless of what your will says. Review and update after major life events (marriage, divorce, death of beneficiary).\n\n**Common mistake:** Ex-spouse named as beneficiary on a 401(k) — they will receive the assets even if the will leaves everything to new spouse. Courts generally cannot override beneficiary designations.\n\n**Trust basics:**\n- **Revocable Living Trust (RLT):** You maintain control during life; assets transfer at death **without probate**. Not asset-protection against creditors (you still own the assets).\n- **Irrevocable Trust:** You give up control and ownership. Provides asset protection, removes assets from taxable estate, but cannot be changed.\n- **Special Needs Trust:** Provides for a disabled beneficiary without disqualifying them from government benefits.\n\n**Digital estate planning:**\n- Cryptocurrency held in self-custody (hardware wallets): **no access without private keys** — include wallet access instructions in estate plan or with a trusted custodian\n- Online accounts (brokerage, email, social media): maintain an inventory with login credentials in a secure, accessible location\n- Some states have digital estate laws; designate a digital executor in your will",
          highlight: ["beneficiary designations", "supersede will", "revocable living trust", "probate", "irrevocable trust", "asset protection", "digital estate", "private keys", "cryptocurrency"],
        },
        {
          type: "quiz-mc",
          question:
            "A married couple has a combined estate of $25 million in 2024. The first spouse dies and portability is properly elected. How much of the estate is subject to federal estate tax?",
          options: [
            "$0 — the combined $27.22M portability exemption covers the entire $25M estate",
            "$11.39M — only the second spouse's $13.61M exemption applies",
            "$25M — portability requires both spouses to die in the same year",
            "$4.28M — only assets above $20.72M are taxable after a $4.28M deduction",
          ],
          correctIndex: 0,
          explanation:
            "With portability properly elected on the first spouse's estate tax return, the surviving spouse inherits the deceased spouse's unused exemption amount (DSUE). Combined exemption = $13.61M (first spouse) + $13.61M (surviving spouse) = $27.22M. Since the $25M estate is below $27.22M, no federal estate tax is owed. Portability requires a timely filed Form 706 even if no estate tax is due — this is a critical step many executors overlook.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A revocable living trust protects your assets from creditors during your lifetime because the trust legally owns the assets, not you.",
          correct: false,
          explanation:
            "False. A revocable living trust does NOT provide asset protection from creditors during the grantor's lifetime. Because you retain control and can revoke the trust at any time, the IRS and courts still treat the assets as yours — creditors can reach them. The primary benefit of a revocable living trust is avoiding probate and providing for seamless management if you become incapacitated. For asset protection, you need an irrevocable trust, which requires permanently giving up control and ownership.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Patricia purchased 1,000 shares of stock for $5,000 in 1990. The shares are now worth $200,000. She is considering two options: (A) Gift the shares to her son David now, or (B) Leave the shares to David through her estate when she dies.",
          question: "Which option is more tax-efficient for David, and why?",
          options: [
            "Option B — inheriting the shares gives David a step-up in basis to $200,000, eliminating $195,000 of capital gains",
            "Option A — gifts are always tax-free for the recipient under the annual exclusion",
            "Option A — gifting now avoids the estate tax entirely on those shares",
            "Both options are tax-equivalent — capital gains must be paid eventually regardless",
          ],
          correctIndex: 0,
          explanation:
            "Option B (inheriting through the estate) is far more tax-efficient for David. If Patricia gifts the shares now (Option A), David receives her original $5,000 basis — when he sells for $200,000, he owes capital gains tax on $195,000 (potentially $39,000 at the 20% LTCG rate). If he inherits the shares at Patricia's death, his basis is stepped up to $200,000 — if he sells immediately, no capital gains tax is owed. Highly appreciated assets should generally be held until death. The exception: if Patricia's estate will exceed the estate tax exemption, gifting may make sense to reduce the taxable estate.",
          difficulty: 3,
        },
      ],
    },
  ],
};
