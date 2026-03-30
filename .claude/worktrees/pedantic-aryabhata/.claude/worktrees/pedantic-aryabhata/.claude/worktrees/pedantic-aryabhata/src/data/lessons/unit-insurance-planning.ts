import type { Unit } from "./types";

export const UNIT_INSURANCE_PLANNING: Unit = {
  id: "insurance-planning",
  title: "Insurance & Retirement Income Planning",
  description:
    "Master life insurance, disability coverage, property protection, annuities, and Social Security strategy for a secure retirement",
  icon: "",
  color: "#0369a1",
  lessons: [
    // ─── Lesson 1: Life Insurance Deep Dive ─────────────────────────────────────
    {
      id: "insurance-1",
      title: " Life Insurance Deep Dive",
      description:
        "Term, whole, universal, and variable life — plus the DIME method for calculating your coverage need",
      icon: "Shield",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📋 Term vs Whole Life Insurance",
          content:
            "**Term Life Insurance** provides a pure death benefit for a defined period — 10, 20, or 30 years — with level premiums throughout the term. If you outlive the policy, it expires with **no cash value** returned. It's the most affordable way to buy maximum coverage.\n\n**Whole Life Insurance** is permanent — it stays in force for your entire life as long as premiums are paid. Premiums are level and higher than term, but the policy builds **cash value** over time (like a tax-deferred savings account within the policy). Mutual insurers may also pay **dividends** that increase cash value or reduce premiums.\n\n**Key comparison:**\n- Term: $500,000 policy, 20-year term → ~$25/month (age 35, healthy male)\n- Whole life: Same $500,000 → ~$400/month — but builds cash value\n\nTerm is often recommended for most people: buy term, invest the difference.",
          highlight: ["term life", "whole life", "cash value", "death benefit", "dividends"],
        },
        {
          type: "teach",
          title: " Universal Life & Variable Life",
          content:
            "**Universal Life (UL)** offers **flexible premiums** and an **adjustable death benefit**, giving policyholders more control than whole life. Cash value earns interest at **current market rates** (subject to a minimum floor). You can skip premiums if cash value is sufficient, or pay extra to build value faster.\n\n**Variable Life** takes flexibility further — cash value is invested in **sub-accounts** (similar to mutual funds), meaning it's subject to **market risk**. Returns can be higher than whole or universal life, but you can also lose cash value. The death benefit may fluctuate with sub-account performance.\n\n**Summary of the four types:**\n- Term: Pure protection, no cash value, expires\n- Whole: Permanent, level premium, guaranteed cash value\n- Universal: Permanent, flexible premiums, adjustable benefit\n- Variable: Permanent, market-linked cash value, highest risk/reward",
          highlight: ["universal life", "variable life", "flexible premiums", "sub-accounts", "market risk"],
        },
        {
          type: "teach",
          title: "🔢 How Much Coverage? The DIME Method",
          content:
            "The **DIME method** gives a systematic framework for calculating life insurance needs:\n\n**D — Debt:** All outstanding debts except the mortgage (credit cards, car loans, student loans)\n\n**I — Income:** Your annual income × 10 years. This replaces lost earnings for your dependents.\n\n**M — Mortgage:** The full remaining balance on your home loan\n\n**E — Education:** Estimated college costs for each child (roughly $150,000–$300,000 per child)\n\n**Example:**\n- Debt: $30,000\n- Income: $80,000 × 10 = $800,000\n- Mortgage: $250,000\n- Education: 2 kids × $200,000 = $400,000\n- **Total DIME need: $1,480,000**\n\n**Second-to-die (survivorship) policy:** Pays only after BOTH spouses have died. Used in estate planning to provide liquidity for estate taxes — premium is lower because the insurer waits for the second death.",
          highlight: ["DIME", "debt", "income replacement", "mortgage", "education", "second-to-die"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the DIME method for calculating life insurance needs?",
          options: [
            "Debt + Income (10×) + Mortgage + Education expenses",
            "Dividends + Interest + Mortgage + Equity",
            "Death benefit + Income + Monthly expenses + Emergency fund",
            "Debt + Investment portfolio + Mortgage + Expenses",
          ],
          correctIndex: 0,
          explanation:
            "DIME stands for Debt + Income (multiplied by 10 years) + Mortgage + Education costs. This framework ensures your policy covers outstanding debts, replaces lost income for a decade, pays off the home, and funds your children's education.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A whole life insurance policy returns no cash value when the policyholder outlives the policy term.",
          correct: false,
          explanation:
            "False — that description applies to TERM life insurance, which expires with no cash value. Whole life is a permanent policy that builds cash value throughout the insured's life and never expires as long as premiums are paid.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria is 34 years old, earns $90,000/year, has $40,000 in credit card and auto debt, owes $320,000 on her mortgage, and has two children whose college costs she estimates at $180,000 each.",
          question: "Using the DIME method, how much life insurance does Maria need?",
          options: [
            "$1,260,000 — Debt $40K + Income $900K + Mortgage $320K + Education $360K – wait, that sums differently",
            "$1,620,000 — Debt $40K + Income $900K + Mortgage $320K + Education $360K",
            "$900,000 — income replacement only",
            "$1,260,000 — Debt $40K + Income $900K + Mortgage $320K (no education counted)",
          ],
          correctIndex: 1,
          explanation:
            "DIME = Debt ($40K) + Income ($90K × 10 = $900K) + Mortgage ($320K) + Education (2 × $180K = $360K) = $1,620,000. All four components must be included to ensure full family financial protection.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Disability & Long-Term Care ───────────────────────────────────
    {
      id: "insurance-2",
      title: "♿ Disability & Long-Term Care",
      description:
        "Short-term vs long-term disability, own-occupation definitions, elimination periods, and LTC coverage",
      icon: "HeartHandshake",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📅 Short-Term vs Long-Term Disability",
          content:
            "**Short-Term Disability (STD)** replaces **60–70% of income** for a short period — typically **90 to 180 days**. Most commonly employer-provided as a group benefit. It bridges the gap immediately after you become disabled.\n\n**Long-Term Disability (LTD)** kicks in after the short-term period and can continue until you reach **retirement age**. It also typically replaces about **60% of income**. Financial planners consider LTD the **most important insurance for working adults** — a 35-year-old has a 1-in-4 chance of a long-term disability before age 65.\n\n**Why disability > life insurance for most working-age adults?**\n- You lose income but keep living expenses\n- Medical bills may add extra costs\n- You still need to fund retirement\n- Your employer-sponsored LTD benefits may be taxable if premiums are employer-paid",
          highlight: ["short-term disability", "long-term disability", "income replacement", "60%", "retirement age"],
        },
        {
          type: "teach",
          title: " Own-Occupation vs Any-Occupation",
          content:
            "The **definition of disability** in your policy determines when benefits are paid:\n\n**Own-Occupation (Own-Occ):**\nYou receive benefits if you cannot perform the duties of YOUR specific occupation. A surgeon who loses fine motor control collects benefits even if they can work a desk job. This is the gold standard — and most expensive definition.\n\n**Any-Occupation (Any-Occ):**\nYou only receive benefits if you cannot perform ANY gainful employment for which you are reasonably suited by education, training, or experience. Much harder to qualify — the surgeon above would likely NOT collect benefits since they could teach or consult.\n\n**Modified own-occ:** A hybrid — pays full benefits if you can't do your job and choose not to work, but offsets if you work in a different occupation.\n\n**Elimination period:** The **waiting period** before benefits begin — typically **90 days** (most common). Think of it like a deductible in time. A longer elimination period (180 days) reduces premiums significantly.",
          highlight: ["own-occupation", "any-occupation", "elimination period", "definition of disability", "90 days"],
        },
        {
          type: "teach",
          title: "🏥 Long-Term Care Insurance",
          content:
            "**Long-Term Care (LTC) insurance** covers services that health insurance and Medicare do NOT: nursing home care, assisted living facilities, and home health aides.\n\n**The cost problem:**\n- Average nursing home (private room): **~$80,000–$100,000/year**\n- Assisted living facility: ~$50,000/year\n- Home health aide (full-time): ~$60,000/year\n- Average LTC need: 2–3 years, but 20% of people need 5+ years\n\n**LTC policy features:**\n- **Benefit period:** How long the policy pays (2, 3, 5 years, or unlimited)\n- **Daily/monthly benefit:** How much the policy pays per day (e.g., $200/day)\n- **Elimination period:** Typically 90 days before benefits begin\n- **Inflation protection:** 3–5% compound inflation rider is critical given rising care costs\n\n**Hybrid policies:** Life insurance or annuities with LTC riders — if you never need care, the benefit goes to heirs.",
          highlight: ["long-term care", "nursing home", "assisted living", "home health aide", "$80,000", "benefit period"],
        },
        {
          type: "quiz-mc",
          question:
            "Why is 'own-occupation' disability insurance better than 'any-occupation' for most professionals?",
          options: [
            "It pays benefits as long as you can't perform your specific job, not just any job",
            "It has no elimination period, so benefits start immediately",
            "It covers 100% of income rather than 60%",
            "It is always provided free through employers",
          ],
          correctIndex: 0,
          explanation:
            "Own-occupation pays benefits if you cannot perform YOUR specific occupation — even if you could theoretically work in another field. Any-occupation only pays if you cannot do ANY job you are reasonably suited for, making it much harder to qualify for benefits.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Medicare covers unlimited nursing home stays for seniors who need long-term care.",
          correct: false,
          explanation:
            "False. Medicare only covers skilled nursing facility care for a limited time (up to 100 days after a qualifying hospital stay), and with significant co-pays after day 20. Long-term custodial care (help with daily activities) is NOT covered by Medicare — that is what long-term care insurance is designed for.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Dr. Chen is a cardiologist earning $350,000/year. He suffers a hand tremor that prevents him from performing surgery but he could still work as a medical consultant earning $120,000/year. He has an any-occupation LTD policy with a 90-day elimination period.",
          question: "Will Dr. Chen receive LTD disability benefits?",
          options: [
            "No — under any-occupation, he can still perform work he is reasonably suited for",
            "Yes — he cannot perform his specific job as a surgeon",
            "Yes — but only 50% of benefits since he can earn some income",
            "No — his elimination period has not yet passed",
          ],
          correctIndex: 0,
          explanation:
            "Under any-occupation definition, Dr. Chen likely does NOT qualify because he can still perform consulting work he is reasonably suited for by his education and training. This is exactly why own-occupation coverage is critical for high-income professionals — an any-occ policy would deny benefits despite a devastating career disruption.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Property & Liability Insurance ────────────────────────────────
    {
      id: "insurance-3",
      title: " Property & Liability Insurance",
      description:
        "Homeowners, auto, umbrella policies, professional liability, and the coinsurance clause",
      icon: "Home",
      xpReward: 75,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "🏡 Homeowners Insurance Coverage",
          content:
            "A standard homeowners policy (HO-3) covers four main areas:\n\n**1. Dwelling coverage:** The structure of your home — rebuilding cost after fire, wind, hail, etc.\n\n**2. Personal property:** Furniture, electronics, clothing inside the home (typically 50–70% of dwelling coverage). Valuable items like jewelry need scheduled endorsements.\n\n**3. Liability:** If someone is injured on your property and sues you. Standard is $100,000–$300,000.\n\n**4. Additional Living Expenses (ALE):** Pays for hotel and meals while your home is being rebuilt.\n\n**What's NOT covered:**\n- **Flood damage** → requires separate NFIP flood policy\n- **Earthquake damage** → requires separate earthquake policy\n- Maintenance issues, mold from neglect, normal wear\n\n**Replacement cost vs actual cash value (ACV):**\nReplacement cost pays to rebuild/replace new. ACV pays replacement minus depreciation — always choose replacement cost coverage.",
          highlight: ["dwelling", "personal property", "liability", "ALE", "flood", "earthquake", "replacement cost"],
        },
        {
          type: "teach",
          title: "🚗 Auto Insurance Coverage Types",
          content:
            "Auto policies are built from multiple coverage components:\n\n**Liability (required in most states):**\n- Bodily injury: Pays for injuries to others you cause\n- Property damage: Pays for damage to others' property\n- Common limits: 100/300/100 = $100K per person, $300K per accident, $100K property\n\n**Collision:** Pays to repair/replace YOUR car after an accident regardless of fault\n\n**Comprehensive:** Pays for non-collision events — theft, vandalism, hail, flood, hitting a deer\n\n**Uninsured/Underinsured Motorist (UM/UIM):** Protects you if the at-fault driver has no insurance or insufficient coverage\n\n**PIP (Personal Injury Protection):** No-fault medical coverage for you and passengers regardless of who caused the accident. Required in no-fault states.\n\n**Cost levers:** Higher deductibles ($500–$1,000) reduce premiums. Drop collision/comprehensive on older cars worth less than 10× the annual premium.",
          highlight: ["liability", "collision", "comprehensive", "uninsured motorist", "PIP", "deductible"],
        },
        {
          type: "teach",
          title: "☂️ Umbrella & Professional Liability",
          content:
            "**Umbrella Insurance** provides excess liability coverage on top of your home and auto policies.\n\n- Coverage: $1 million or more per occurrence\n- Cost: Just **$150–$300/year** for $1M — one of the best value insurance buys\n- Kicks in after home ($300K) or auto ($300K) liability limits are exhausted\n- Also covers personal liability not covered by home/auto (e.g., libel, slander)\n- Essential for anyone with significant assets or elevated risk (rental properties, teenage drivers, public visibility)\n\n**Professional Liability (Errors & Omissions / E&O):**\nCovers professionals for negligent acts, errors, or omissions in their professional services. Key for doctors (malpractice), lawyers, accountants, financial advisors, consultants. Standard general liability does NOT cover professional services.\n\n**Coinsurance clause in homeowners:**\nYou must insure your home to at least **80% of replacement cost**. If underinsured, claims are paid proportionally:\nClaim payment = (Insurance carried / Required 80%) × Loss\nExample: Home worth $500K, you insure $300K, fire causes $100K loss:\nPayment = ($300K / $400K) × $100K = **$75,000** (you absorb $25K penalty)",
          highlight: ["umbrella", "$1 million", "$150–$300", "professional liability", "E&O", "coinsurance", "80%"],
        },
        {
          type: "quiz-mc",
          question:
            "What does an umbrella insurance policy provide?",
          options: [
            "Additional liability coverage beyond your home and auto policy limits",
            "Coverage for flood and earthquake damage not in standard homeowners policies",
            "A single policy that replaces both home and auto insurance",
            "Replacement cost coverage for all personal property",
          ],
          correctIndex: 0,
          explanation:
            "An umbrella policy provides extra liability coverage — typically $1M or more — that activates after your homeowners or auto liability limits are exhausted. At $150–$300/year for $1M of coverage, it offers exceptional value, especially for anyone with significant assets to protect.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A standard homeowners insurance policy covers flood damage caused by heavy rainfall.",
          correct: false,
          explanation:
            "False. Standard homeowners policies (HO-3) specifically exclude flood damage. Flood insurance must be purchased separately through the National Flood Insurance Program (NFIP) or a private insurer. Earthquake damage is similarly excluded and requires a separate policy.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "James owns a home with a replacement cost of $600,000. To save on premiums, he insures it for only $360,000. A kitchen fire causes $90,000 in damage.",
          question: "How much will James's insurer pay under the coinsurance clause?",
          options: [
            "$67,500 — because he is underinsured (360K / 480K × 90K)",
            "$90,000 — full replacement cost coverage",
            "$54,000 — 60% of the loss since he only has 60% of value insured",
            "$0 — coinsurance violation voids the claim entirely",
          ],
          correctIndex: 0,
          explanation:
            "Required insurance = 80% × $600K = $480K. Coinsurance ratio = $360K / $480K = 0.75. Claim payment = 0.75 × $90K = $67,500. James absorbs $22,500 out of pocket as a penalty for underinsuring. Always insure to at least 80% of replacement cost.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Annuities ─────────────────────────────────────────────────────
    {
      id: "insurance-4",
      title: " Annuities",
      description:
        "Immediate, deferred, fixed, variable, and fixed indexed annuities — turning savings into guaranteed income",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: " What Is an Annuity?",
          content:
            "An **annuity** is a contract between you and an insurance company. You pay a **lump sum** (or series of payments), and in return the insurer promises to pay you an **income stream** — either immediately or at a future date.\n\n**Key concept — longevity risk:** The risk of outliving your money. An annuity transfers this risk to the insurance company. If you live to 105, the insurer keeps paying.\n\n**Immediate Annuity:**\n- You hand over a lump sum and **income starts right away** (within one month)\n- Popular with new retirees who want guaranteed income from day one\n- Example: Pay $300,000 at age 65 → receive ~$1,500–$1,800/month for life\n\n**Deferred Annuity:**\n- Has an **accumulation phase** (money grows tax-deferred) before converting to income\n- You annuitize later — either at a chosen date or a trigger event (retirement)\n- Tax-deferred growth: no 1099 until withdrawals begin",
          highlight: ["annuity", "longevity risk", "immediate annuity", "deferred annuity", "tax-deferred", "lump sum"],
        },
        {
          type: "teach",
          title: " Fixed, Variable & Fixed Indexed Annuities",
          content:
            "**Fixed Annuity:**\n- Earns a **guaranteed interest rate** set by the insurer (e.g., 4.5% for 5 years)\n- No market risk — principal is protected\n- Similar to a CD but inside an insurance wrapper with tax deferral\n- Surrender charges apply if you withdraw early\n\n**Variable Annuity:**\n- Cash value invested in **sub-accounts** (mutual fund-like investments)\n- **Market risk present** — value rises and falls with markets\n- Higher growth potential, but you can lose value\n- Often come with riders (guaranteed minimum income, death benefit) at extra cost\n- Higher fees than other annuity types (1.5–3% annually)\n\n**Fixed Indexed Annuity (FIA):**\n- Returns are **linked to a stock index** (e.g., S&P 500) but with a **floor of 0%** (you never lose principal)\n- Growth is **capped** at a maximum rate (typically 5–10% per year)\n- Example: S&P 500 gains 18% → you earn 8% (cap). S&P 500 falls 20% → you earn 0% (floor)\n- Best of both worlds for risk-averse accumulators: upside participation, downside protection",
          highlight: ["fixed annuity", "variable annuity", "fixed indexed annuity", "sub-accounts", "floor", "cap", "0%"],
        },
        {
          type: "teach",
          title: " Annuity Considerations & Riders",
          content:
            "**Key riders to know:**\n- **Guaranteed Minimum Withdrawal Benefit (GMWB):** Guarantees you can withdraw a set % (e.g., 5%) of a benefit base annually for life, even if the account runs to zero\n- **Guaranteed Minimum Income Benefit (GMIB):** Guarantees minimum annuitization value after waiting period\n- **Death benefit rider:** Returns at least your premium to heirs if you die before fully withdrawing\n\n**Tax treatment:**\n- Growth inside an annuity is **tax-deferred** until withdrawal\n- Withdrawals: gains come out first and are taxed as **ordinary income** (not capital gains rate)\n- 10% penalty for withdrawals before age 59½ (same as IRAs)\n- Annuities inside an IRA: already tax-deferred, so the annuity wrapper adds little tax benefit\n\n**When annuities make sense:**\n- You've maxed out 401(k)/IRA and want more tax deferral\n- You want guaranteed lifetime income and have no pension\n- You're a conservative investor near or in retirement",
          highlight: ["GMWB", "GMIB", "death benefit", "ordinary income", "59½", "tax-deferred"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the key benefit of an immediate annuity for retirees?",
          options: [
            "Provides guaranteed income you cannot outlive, solving longevity risk",
            "Allows tax-free withdrawals after age 59½",
            "Invests in the stock market for maximum growth potential",
            "Eliminates all investment fees during retirement",
          ],
          correctIndex: 0,
          explanation:
            "An immediate annuity solves longevity risk — the risk of outliving your savings. Once you annuitize, the insurer is obligated to keep paying regardless of how long you live. This provides certainty that no investment portfolio can match, at the cost of liquidity.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A fixed indexed annuity can result in a negative return if the linked stock index declines significantly.",
          correct: false,
          explanation:
            "False. A fixed indexed annuity has a built-in floor of 0% — meaning the worst outcome in any index period is earning nothing, not losing money. The trade-off is that gains are capped (typically 5–10% annually). This structure protects principal while allowing some upside participation.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Sarah, age 65, has $500,000 in savings and is choosing between investing in a balanced portfolio (expected 6% return, but variable) versus purchasing an immediate annuity (paying $2,200/month for life). She is worried about living a very long time.",
          question: "What is the primary risk that the annuity solves that the portfolio cannot?",
          options: [
            "Longevity risk — the annuity guarantees income no matter how long she lives",
            "Inflation risk — annuities always adjust for CPI increases",
            "Market risk — annuities earn guaranteed 6% returns",
            "Tax risk — annuity income is completely tax-free",
          ],
          correctIndex: 0,
          explanation:
            "The annuity eliminates longevity risk — the risk of outliving her $500,000. A portfolio, even well-managed, can be depleted by a long life, market downturns, or high withdrawal rates. The annuity guarantees $2,200/month for life regardless of markets or how long Sarah lives. Note: annuities don't automatically inflation-adjust (that's a separate rider), and income is taxable as ordinary income.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Social Security & Medicare ────────────────────────────────────
    {
      id: "insurance-5",
      title: " Social Security & Medicare",
      description:
        "Claiming strategies, spousal benefits, break-even analysis, Medicare parts, and Medigap supplements",
      icon: "Building",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📅 Social Security Eligibility & Claiming Ages",
          content:
            "**Eligibility:** You need **40 credits** (roughly 10 years of work) to qualify for Social Security retirement benefits. In 2024, one credit = $1,730 in earnings; you can earn a maximum of 4 credits per year.\n\n**Full Retirement Age (FRA):** For those born **1960 or later**, FRA is **age 67**.\n\n**Claiming choices:**\n- **Age 62 (earliest):** Benefit is permanently reduced by **30%** from the FRA amount\n- **Age 67 (FRA):** Receive your full calculated benefit\n- **Age 70 (maximum):** Benefit increases by **8% per year** beyond FRA → +24% total for 67-to-70 delay\n\n**Delayed Retirement Credits:** Each year you delay from FRA to 70 adds 8% to your benefit permanently. After 70, there is no further increase — no benefit to delaying beyond 70.\n\n**Break-even analysis (claiming at 70 vs 62):**\nThe higher monthly benefit from waiting to 70 compensates for years of uncollected checks. The break-even point is typically around **age 81**. If you expect to live past 81, delay is mathematically advantageous.",
          highlight: ["40 credits", "full retirement age", "age 67", "age 62", "age 70", "8% per year", "break-even"],
        },
        {
          type: "teach",
          title: "👫 Spousal, Survivor & Divorced Spouse Benefits",
          content:
            "**Spousal benefits:** A spouse who earned less (or not at all) can receive **up to 50% of the higher-earning spouse's FRA benefit**. The spousal benefit is not increased by delay beyond FRA — so a non-working spouse should generally claim at FRA.\n\n**Rules:**\n- Spousal benefit only available if the higher earner has filed for their own benefit\n- Spouse's own earned benefit vs spousal benefit: SSA pays the higher amount\n\n**Survivor benefits:** If a spouse dies, the survivor can receive **up to 100%** of the deceased's benefit (including any delayed credits). This is why the higher earner delaying to 70 is especially valuable — it maximizes the survivor benefit for a potentially longer-lived spouse.\n\n**Divorced spouse benefits:**\n- Marriage must have lasted at least **10 years**\n- You must be unmarried\n- You can claim on your ex-spouse's record without affecting their benefit\n\n**Optimal strategy for couples:**\nLower earner claims early (62–FRA) for some income. Higher earner delays to 70 to maximize both their own benefit and the survivor benefit.",
          highlight: ["spousal benefit", "50%", "survivor benefit", "100%", "10 years", "delay to 70"],
        },
        {
          type: "teach",
          title: "🏥 Medicare: Parts A, B, D & Medigap",
          content:
            "**Medicare Part A (Hospital Insurance):**\n- Covers inpatient hospital stays, skilled nursing, hospice\n- **Free** if you or your spouse paid Medicare taxes for 10+ years\n- $1,632 deductible per benefit period (2024)\n\n**Medicare Part B (Medical Insurance):**\n- Covers doctor visits, outpatient care, preventive services\n- Standard premium: **~$174/month** in 2024 (higher for higher incomes — IRMAA)\n- 80/20 coinsurance after deductible — Medicare pays 80%, you pay 20%\n\n**Medicare Part D (Prescription Drugs):**\n- Optional prescription drug coverage through private insurers\n- Plans vary widely — choose based on your specific medications\n- Late enrollment penalty if you skip Part D and enroll later\n\n**Medicare Advantage (Part C):**\n- Alternative all-in-one plans from private insurers; often include dental and vision\n- Network restrictions apply (HMO/PPO structures)\n\n**Medigap (Medicare Supplement):**\n- Private insurance that fills Medicare's gaps — deductibles, copays, 20% coinsurance\n- Most popular plan (Plan G) covers nearly everything not covered by original Medicare\n- Typically $100–$250/month premium but eliminates most out-of-pocket exposure",
          highlight: ["Part A", "Part B", "$174/month", "Part D", "Medicare Advantage", "Medigap", "20%"],
        },
        {
          type: "quiz-mc",
          question:
            "At what age do Social Security benefits stop increasing if you delay claiming?",
          options: [
            "Age 70 — no benefit to delaying beyond age 70",
            "Age 72 — same as required minimum distributions",
            "Age 67 — benefits are fixed at full retirement age",
            "Age 75 — delayed credits continue through age 75",
          ],
          correctIndex: 0,
          explanation:
            "Social Security delayed retirement credits stop accruing at age 70. Delaying from FRA (67) to 70 adds 8% per year for a total 24% increase. There is no financial benefit to delaying beyond 70 — you simply forgo monthly checks without any increase in the eventual benefit.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "A non-working spouse should delay claiming Social Security until age 70 to maximize their spousal benefit.",
          correct: false,
          explanation:
            "False. The spousal benefit (up to 50% of the higher earner's FRA benefit) does NOT increase by delaying beyond FRA. The delayed retirement credits only apply to your own earned benefit. A non-working spouse should generally claim at FRA — delaying to 70 provides no additional spousal benefit.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Robert (age 62) and Linda (age 60) are planning retirement. Robert's FRA benefit is $2,800/month; Linda's is $800/month. They expect Robert to live to 85 and Linda to 92. Robert is considering claiming at 62 ($1,960/month) vs waiting to 70 ($3,472/month).",
          question: "Which strategy best maximizes lifetime household income?",
          options: [
            "Robert waits to 70; Linda claims her own benefit at FRA — maximizes Robert's delayed credits and Linda's survivor benefit",
            "Both claim at 62 to maximize total years of income",
            "Robert claims at 62; Linda claims spousal benefit at 62",
            "Both wait to 70 to maximize total household benefits",
          ],
          correctIndex: 0,
          explanation:
            "Robert waiting to 70 ($3,472/month) is optimal for two reasons: (1) It maximizes lifetime benefits since he lives to 85, past the age-81 break-even. (2) It maximizes Linda's survivor benefit — she inherits 100% of Robert's benefit ($3,472) after he dies, and she lives to 92. The higher earner delaying to 70 is the most valuable strategy for couples, especially when there is a significant life expectancy gap.",
          difficulty: 3,
        },
      ],
    },
  ],
};
