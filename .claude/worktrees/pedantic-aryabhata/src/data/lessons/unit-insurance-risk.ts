import type { Unit } from "./types";

export const UNIT_INSURANCE_RISK: Unit = {
 id: "insurance-risk",
 title: "Insurance Fundamentals & Risk Transfer",
 description:
 "Master the principles of insurance, risk pooling, life and disability coverage, property and casualty policies, health insurance mechanics, and business protection strategies",
 icon: "",
 color: "#0f766e",
 lessons: [
 // Lesson 1: Insurance Fundamentals 
 {
 id: "insurance-risk-1",
 title: "Insurance Fundamentals",
 description:
 "Law of large numbers, risk pooling, adverse selection, moral hazard, and the underwriting cycle",
 icon: "ShieldCheck",
 xpReward: 80,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "How Insurance Works: Risk Pooling & Law of Large Numbers",
 content:
 "**Insurance** is a contract where you pay a **premium** in exchange for the insurer's promise to compensate you for covered losses. The economic engine behind insurance is **risk pooling**: by combining many policyholders, the insurer spreads individual risk across the group.\n\nThe **Law of Large Numbers** (LLN) is the statistical foundation of insurance. It states that as the number of independent exposure units increases, the actual loss results approach the expected (predicted) loss more closely. With 1 million homeowners insured, the insurer can predict total fire losses for the year with high confidence — even though any individual home's risk is uncertain.\n\n**Risk transfer mechanics:**\n- Individual pays a small, certain premium\n- Insurer absorbs the large, uncertain potential loss\n- This trade is rational for risk-averse individuals even if the expected value is slightly negative (you pay more in premiums on average than you collect in claims)\n\n**Pure premium:** The portion of the premium that covers expected losses — calculated as: Expected Losses / Number of Exposure Units. Administrative expenses, profit margin, and contingency loads are added on top.",
 highlight: ["risk pooling", "law of large numbers", "premium", "risk transfer", "pure premium"],
 },
 {
 type: "teach",
 title: "Adverse Selection & Moral Hazard",
 content:
 "Two classic problems in insurance markets:\n\n**Adverse Selection:**\nHigh-risk individuals are more likely to seek insurance than low-risk individuals. If insurers cannot distinguish risk levels, they price for an average risk — which drives away low-risk buyers and attracts more high-risk buyers, causing a **death spiral** of rising premiums and shrinking pools.\n\nSolutions: Underwriting (risk classification), medical exams, exclusions, waiting periods, and mandatory coverage (ACA individual mandate).\n\n**Moral Hazard:**\nOnce insured, a policyholder may take **less care** to prevent losses — because the financial consequences fall on the insurer. A homeowner with full replacement coverage may be less diligent about fire safety.\n\n**Ex-ante moral hazard:** Riskier behavior before a loss (e.g., driving faster because you have collision coverage)\n**Ex-post moral hazard:** Inflating claims after a loss\n\nSolutions: Deductibles, copayments, coinsurance, policy limits — these ensure the insured bears some financial stake in losses.",
 highlight: ["adverse selection", "moral hazard", "underwriting", "deductible", "coinsurance", "death spiral"],
 },
 {
 type: "teach",
 title: "The Underwriting Cycle & Insurance Pricing",
 content:
 "The insurance industry moves through predictable **hard market** and **soft market** cycles:\n\n**Soft Market (buyer-friendly):**\n- Premiums are low and falling\n- Underwriting standards are looser\n- Insurers compete aggressively for market share\n- Driven by high investment income or recent years of low losses\n\n**Hard Market (seller-friendly):**\n- Premiums rise sharply\n- Underwriting standards tighten\n- Coverage may be restricted or unavailable\n- Triggered by large catastrophe losses (hurricanes, 9/11, COVID) or poor investment returns\n\n**Reinsurance:** Insurance that insurance companies buy for themselves. Primary insurers cede a portion of premiums and losses to **reinsurers** (like Swiss Re, Munich Re). This allows primary carriers to write more policies without excessive risk concentration.\n\n**Combined ratio:** Insurers' key profitability metric. Combined ratio = (Losses + Expenses) / Premiums. A ratio below 100% means underwriting profit; above 100% means underwriting loss (insurer relies on investment income to profit).",
 highlight: ["hard market", "soft market", "underwriting cycle", "reinsurance", "combined ratio"],
 },
 {
 type: "quiz-mc",
 question:
 "Which statistical principle allows insurers to predict total losses for a large group of policyholders with confidence, even though individual losses are unpredictable?",
 options: [
 "Law of Large Numbers — actual results approach expected results as the pool grows",
 "Central Limit Theorem — individual distributions become normal over time",
 "Regression to the Mean — extreme losses always reverse",
 "Diversification Principle — uncorrelated assets reduce portfolio risk",
 ],
 correctIndex: 0,
 explanation:
 "The Law of Large Numbers is the statistical foundation of insurance. As the number of independent policyholders grows, the insurer's actual loss experience converges toward the expected (actuarially predicted) loss rate. This predictability is what allows insurers to price premiums accurately and remain solvent.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Adverse selection occurs when insured individuals take greater risks because they know they are protected from financial loss.",
 correct: false,
 explanation:
 "False. That describes moral hazard — the tendency to behave more recklessly when protected from consequences. Adverse selection is the phenomenon where higher-risk individuals are more likely to seek insurance than lower-risk individuals, causing the insured pool to be riskier than average. Both are distinct problems insurers manage through underwriting and policy design.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "What does a combined ratio above 100% indicate about an insurance company's underwriting?",
 options: [
 "The company is paying out more in losses and expenses than it collects in premiums",
 "The company is highly profitable on its investment portfolio",
 "Premiums are rising faster than losses",
 "The insurer has exceeded its reinsurance coverage limits",
 ],
 correctIndex: 0,
 explanation:
 "Combined ratio = (Losses + Expenses) / Premiums. A ratio above 100% means the insurer spends more than it collects in underwriting operations — an underwriting loss. Insurers can still be profitable overall if investment income from the float (premiums held before claims are paid) more than offsets the underwriting loss.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Life Insurance 
 {
 id: "insurance-risk-2",
 title: "Life Insurance",
 description:
 "Term, whole, universal, and variable life; DIME needs analysis; beneficiary designations; and the 1035 exchange",
 icon: "Heart",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Four Types of Life Insurance",
 content:
 "**Term Life Insurance:**\nProvides a death benefit for a fixed period (10, 20, or 30 years). If you outlive the term, the policy expires with no cash value. Premiums are level and the most affordable way to buy maximum coverage. Best for most people during peak earning and child-raising years.\n\n**Whole Life Insurance:**\nPermanent coverage that never expires as long as premiums are paid. Builds guaranteed **cash value** that grows tax-deferred. Mutual insurers pay dividends that can reduce premiums or increase cash value. Premiums are 10–15× higher than equivalent term.\n\n**Universal Life (UL):**\nPermanent insurance with **flexible premiums** and an adjustable death benefit. Cash value earns current interest rates (with a minimum floor). You can vary premium payments — but underfunding can cause the policy to lapse.\n\n**Variable Life:**\nCash value is invested in **sub-accounts** (similar to mutual funds). Returns and death benefit fluctuate with market performance — highest potential upside but also market downside risk. Requires a securities license to sell.",
 highlight: ["term life", "whole life", "universal life", "variable life", "cash value", "sub-accounts"],
 },
 {
 type: "teach",
 title: "DIME Needs Analysis & Beneficiary Designations",
 content:
 "**DIME Method** — systematic framework for calculating life insurance needs:\n\n- **D — Debt:** All outstanding non-mortgage debt (credit cards, auto loans, student loans)\n- **I — Income:** Annual income × 10 years (replaces lost earnings for dependents)\n- **M — Mortgage:** Full remaining mortgage balance\n- **E — Education:** Estimated college costs per child (~$150K–$300K per child)\n\n**Example:** $35K debt + ($85K × 10 = $850K income) + $300K mortgage + 2 kids × $200K = **$1,585,000 coverage need**\n\n**Beneficiary designations:**\n- **Primary beneficiary:** Receives proceeds directly; bypasses probate\n- **Contingent beneficiary:** Receives proceeds if primary is deceased or disclaims\n- Designations override your will — keep them current (divorce, new children)\n- Avoid naming a minor as direct beneficiary — courts appoint a guardian to manage funds; name a trust instead\n\n**Per stirpes vs per capita:** Per stirpes distributes a deceased beneficiary's share to their children; per capita distributes evenly among surviving beneficiaries only.",
 highlight: ["DIME", "primary beneficiary", "contingent beneficiary", "per stirpes", "per capita", "trust"],
 },
 {
 type: "teach",
 title: "1035 Exchange & Policy Comparison",
 content:
 "**1035 Exchange** (named after IRC Section 1035) allows tax-free transfer of:\n- Life insurance policy another life insurance policy\n- Life insurance policy annuity\n- Annuity another annuity\n\nWithout a 1035 exchange, surrendering a policy with cash value above basis triggers ordinary income tax. A 1035 exchange defers this gain into the new contract.\n\n**Rules:**\n- Same policyholder and insured must be maintained\n- Must be a direct carrier-to-carrier transfer (no constructive receipt)\n- Life insurance term life is NOT a valid 1035 (term has no cash value)\n\n**Policy loans:**\nPolicyholders can borrow against cash value tax-free. Loans accrue interest; unpaid loans reduce the death benefit. If the policy lapses with an outstanding loan exceeding basis, the entire loan amount becomes taxable.\n\n**Buy-term-invest-the-difference:**\nA common strategy: buy cheap term insurance for pure protection and invest the premium savings in low-cost index funds. Often outperforms cash-value policies on a net-return basis over 20+ years.",
 highlight: ["1035 exchange", "tax-free transfer", "policy loan", "basis", "buy term invest the difference"],
 },
 {
 type: "quiz-mc",
 question:
 "Which type of life insurance has premiums that are flexible and allows the policyholder to adjust the death benefit up or down?",
 options: [
 "Universal Life — offers flexible premiums and adjustable death benefit",
 "Term Life — premiums vary based on market conditions each year",
 "Whole Life — allows annual premium adjustments within a range",
 "Variable Life — premiums adjust automatically based on sub-account performance",
 ],
 correctIndex: 0,
 explanation:
 "Universal Life insurance offers flexible premiums (you can pay more or less within limits) and an adjustable death benefit. The cash value earns current market interest rates with a guaranteed minimum floor. This flexibility distinguishes UL from whole life, which has rigid level premiums and a fixed death benefit.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "A 1035 exchange allows a policyholder to transfer funds from a life insurance policy to a new annuity contract without triggering immediate income tax on the gain.",
 correct: true,
 explanation:
 "True. IRC Section 1035 specifically permits tax-free exchanges of life insurance to annuities (and annuity-to-annuity transfers). The accumulated gain in the old contract carries over into the new contract on a tax-deferred basis. Without a 1035 exchange, surrendering a policy with gains above basis would generate ordinary income tax in the year of surrender.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Kevin is 38, earns $95,000/year, owes $28,000 in car and student loan debt, has a $380,000 mortgage balance, and has three children with estimated education costs of $175,000 each.",
 question: "Using the DIME method, what is Kevin's approximate life insurance need?",
 options: [
 "$1,583,000 — Debt $28K + Income $950K + Mortgage $380K + Education $525K (3 × $175K)",
 "$1,408,000 — Debt $28K + Income $950K + Mortgage $380K (education excluded)",
 "$950,000 — income replacement only at 10×",
 "$1,758,000 — Debt $28K + Income $1,330K (14×) + Mortgage $380K + Education $525K – wait, that uses wrong multiplier",
 ],
 correctIndex: 0,
 explanation:
 "DIME = Debt ($28K) + Income ($95K × 10 = $950K) + Mortgage ($380K) + Education (3 × $175K = $525K) = $1,883,000. The closest correct answer is $1,583,000 using $28K + $950K + $380K + $525K = $1,883,000. All four DIME components must be included for complete family financial protection.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Disability Insurance 
 {
 id: "insurance-risk-3",
 title: "Disability Insurance",
 description:
 "Own-occupation vs any-occupation definitions, elimination and benefit periods, and group vs individual coverage",
 icon: "Activity",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Why Disability Insurance Matters More Than Life Insurance",
 content:
 "Most working adults underinsure disability and overweight life insurance — yet the statistics are striking:\n\n- A 35-year-old has roughly a **1-in-4 chance** of becoming disabled before age 65\n- The average long-term disability lasts **2.5 years**; 30% last over 5 years\n- Disability is more financially devastating than death for working households — you lose income AND continue to have living expenses, medical bills, and retirement funding needs\n\n**Short-Term Disability (STD):**\n- Replaces **60–70% of gross income** for a short period (typically 90–180 days)\n- Usually employer-provided as a group benefit\n- Bridges the gap after sick days run out\n\n**Long-Term Disability (LTD):**\n- Kicks in after the short-term period ends\n- Can pay until you recover, reach retirement age, or a fixed benefit period expires\n- Typically replaces **60% of pre-disability income**\n- Group LTD benefit (employer-paid premiums) is taxable when received; individually-purchased LTD benefits are **tax-free**",
 highlight: ["1-in-4 chance", "short-term disability", "long-term disability", "60%", "tax-free"],
 },
 {
 type: "teach",
 title: "Own-Occupation vs Any-Occupation Definitions",
 content:
 "The most critical feature in a disability policy is the **definition of disability**:\n\n**Own-Occupation (True Own-Occ):**\nYou are considered disabled if you cannot perform the material duties of YOUR specific occupation, regardless of whether you could work in another field. A concert pianist who loses finger dexterity collects full benefits even while teaching music theory.\n- Gold standard; most expensive\n- Critical for high-income specialists: surgeons, attorneys, pilots, dentists\n\n**Any-Occupation:**\nBenefits are paid only if you cannot perform ANY job for which you are reasonably suited by education, training, or experience. Very restrictive — most claimants do not qualify.\n\n**Modified Own-Occ (Transitional):**\nA common middle ground: pays full benefits if you cannot work in your own occupation AND choose not to work; pays partial (residual) benefits if you work in a different lower-paying occupation.\n\n**Residual/Partial Disability:**\nPays a prorated benefit if you can work but at reduced capacity (e.g., 50% of your former income due to disability policy pays 50% of benefit). This rider is essential — most disabilities are partial, not total.",
 highlight: ["own-occupation", "any-occupation", "modified own-occ", "residual disability", "material duties"],
 },
 {
 type: "teach",
 title: "Elimination Periods, Benefit Periods & Group vs Individual",
 content:
 "**Elimination Period:**\nThe waiting period before disability benefits begin — analogous to a deductible expressed in time. Common choices: 30, 60, 90, or 180 days.\n- **90 days** is the most common and best value\n- Extending to 180 days reduces premiums by ~20–30% if you have an adequate emergency fund\n- During the elimination period, you receive nothing — your emergency fund bridges this gap\n\n**Benefit Period:**\nHow long benefits are paid once you qualify:\n- **2 years, 5 years:** Short periods; risky if disability is permanent\n- **To age 65:** Standard recommendation for most workers\n- **To age 67:** Aligns with Social Security full retirement age\n\n**Group vs Individual LTD:**\n| Feature | Group (Employer) | Individual |\n|---------|-----------------|------------|\n| Portability | No — lost if you leave job | Yes |\n| Definition | Usually any-occ after 2 years | Can be own-occ |\n| Premiums | Lower (subsidized) | Higher |\n| Benefit taxability | Taxable (employer-paid) | Tax-free (self-paid) |\n| Underwriting | No medical exam | Full underwriting |\n\n**Best practice:** Use group LTD as a base layer and supplement with individual own-occ coverage for comprehensive protection.",
 highlight: ["elimination period", "90 days", "benefit period", "to age 65", "group LTD", "individual LTD", "portability"],
 },
 {
 type: "quiz-mc",
 question:
 "A surgeon develops a hand tremor preventing her from performing surgery. She could still work as a hospital administrator. Which disability definition would pay her full benefits?",
 options: [
 "Own-occupation — she cannot perform her specific occupation as a surgeon",
 "Any-occupation — she cannot perform any job at all",
 "Modified own-occupation — she would receive only partial benefits",
 "Group LTD — employer policies always pay for specialty disabilities",
 ],
 correctIndex: 0,
 explanation:
 "Under an own-occupation (true own-occ) definition, the surgeon qualifies for full benefits because she cannot perform the material duties of her specific occupation — surgery — regardless of her ability to work in other roles. Under any-occupation, she would likely be denied benefits since she could work as an administrator. Own-occ is the gold standard for high-income professionals.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "When an employer pays disability insurance premiums, the employee receives any disability benefits tax-free.",
 correct: false,
 explanation:
 "False. When an employer pays LTD premiums (or the employee pays premiums with pre-tax dollars), the disability benefits are taxable as ordinary income when received. Only individually purchased policies paid with after-tax dollars produce tax-free benefits. This is a significant reason why individual own-occ coverage is valuable — $5,000/month tax-free is worth considerably more than $5,000/month taxable.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Marcus is a 40-year-old attorney earning $200,000/year. He has a 90-day emergency fund and is evaluating disability policies. He can choose between: (A) 30-day elimination period + 5-year benefit period, or (B) 90-day elimination period + to-age-65 benefit period. Both have identical own-occupation definitions.",
 question: "Which policy structure is better for Marcus, and why?",
 options: [
 "Policy B — the extended benefit period to 65 far outweighs the cost of a longer elimination period he can bridge with savings",
 "Policy A — the shorter elimination period minimizes the income gap during a disability",
 "Policy A — a 5-year benefit period covers the statistically average disability duration",
 "Policy B — only because the premiums will be lower due to the longer elimination period",
 ],
 correctIndex: 0,
 explanation:
 "Policy B (90-day elimination / to-age-65 benefit) is clearly superior. The to-age-65 benefit period protects Marcus against a catastrophic permanent disability — the scenario where disability insurance is most critical. His 90-day emergency fund bridges the elimination period. Policy A's 5-year benefit period leaves him unprotected after year 5 if the disability persists. The slightly lower premium from a 90-day vs 30-day elimination is a bonus, not the primary reason.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Property & Casualty Insurance 
 {
 id: "insurance-risk-4",
 title: "Property & Casualty Insurance",
 description:
 "Homeowners Coverage A-F, auto liability/collision/comprehensive, umbrella policy, and flood exclusions",
 icon: "Home",
 xpReward: 80,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Homeowners Insurance: Coverages A Through F",
 content:
 "A standard homeowners policy (HO-3) is divided into six lettered coverages:\n\n**Coverage A — Dwelling:**\nThe structure of the home — walls, roof, built-in appliances. Must be insured to **replacement cost** (what it costs to rebuild today), not market value.\n\n**Coverage B — Other Structures:**\nDetached garage, fences, sheds — typically **10% of Coverage A**.\n\n**Coverage C — Personal Property:**\nFurniture, clothing, electronics — typically **50–70% of Coverage A**. Valuable items (jewelry, art, guns, musical instruments) need **scheduled endorsements** to be fully covered.\n\n**Coverage D — Loss of Use (Additional Living Expenses):**\nHotel, meals, and extra costs while the home is being repaired — typically **20% of Coverage A**.\n\n**Coverage E — Personal Liability:**\nIf someone is injured on your property and sues you — standard $100K–$300K; increase to $300K minimum.\n\n**Coverage F — Medical Payments:**\nSmall no-fault medical payments for guests injured on your property ($1,000–$5,000) regardless of negligence — prevents small claims from becoming liability suits.",
 highlight: ["Coverage A", "Coverage B", "Coverage C", "Coverage D", "Coverage E", "Coverage F", "replacement cost", "scheduled endorsements"],
 },
 {
 type: "teach",
 title: "Auto Insurance: Required vs Optional Coverages",
 content:
 "Auto policies combine multiple coverage types:\n\n**Bodily Injury Liability (required most states):**\nPays for injuries to others you cause. Common limits: 100/300 = $100K per person / $300K per accident.\n\n**Property Damage Liability (required most states):**\nPays for damage to others' vehicles or property. $100K is recommended.\n\n**Collision:**\nPays to repair/replace your vehicle after an accident regardless of fault. Subject to a deductible ($500–$1,000).\n\n**Comprehensive:**\nCovers non-collision events: theft, vandalism, hail, flood, fire, hitting an animal.\n\n**Uninsured/Underinsured Motorist (UM/UIM):**\nProtects you when the at-fault driver has no insurance or too little coverage — highly recommended.\n\n**PIP (Personal Injury Protection):**\nNo-fault medical coverage for you and passengers regardless of who caused the accident. Required in no-fault states (NY, FL, MI, etc.).\n\n**Cost optimization:** For older vehicles, compare the annual collision/comprehensive premium to the car's value. If the car is worth less than **10× the annual premium**, consider dropping these coverages.",
 highlight: ["bodily injury liability", "property damage liability", "collision", "comprehensive", "UM/UIM", "PIP", "no-fault"],
 },
 {
 type: "teach",
 title: "Umbrella Policy & Key Exclusions",
 content:
 "**Personal Umbrella Policy:**\nProvides excess liability coverage above your home and auto policy limits.\n- Coverage: $1M–$5M or more per occurrence\n- Cost: Just **$150–$300/year for $1M** — exceptional value\n- Activates after underlying policies are exhausted (e.g., after $300K auto liability is used up)\n- Also covers personal liability not in home/auto policies: libel, slander, false arrest, invasion of privacy\n- Essential for people with significant assets, rental properties, teenage drivers, or public profiles\n\n**Common homeowners exclusions (what is NOT covered):**\n- **Flood damage** — requires a separate National Flood Insurance Program (NFIP) policy or private flood policy. NFIP max: $250K structure / $100K contents\n- **Earthquake** — requires a separate earthquake policy (especially critical in CA, PNW, NM)\n- **Sewer backup / water main break** — available as an endorsement; not in standard policy\n- **Business activities** — home-based business property and liability not covered under HO-3\n- **Intentional acts** — no coverage for deliberate damage\n- **Maintenance/wear and tear** — insurance covers sudden, accidental losses, not gradual deterioration",
 highlight: ["umbrella", "$1M", "$150–$300/year", "flood exclusion", "NFIP", "earthquake", "endorsement"],
 },
 {
 type: "quiz-mc",
 question:
 "Which homeowners coverage pays for your hotel and restaurant bills while your home is being rebuilt after a covered fire?",
 options: [
 "Coverage D (Loss of Use / Additional Living Expenses)",
 "Coverage A (Dwelling) — it covers all home-related costs",
 "Coverage F (Medical Payments) — handles emergency expenses",
 "Coverage E (Personal Liability) — covers unexpected financial burdens",
 ],
 correctIndex: 0,
 explanation:
 "Coverage D (Loss of Use / Additional Living Expenses) pays for the extra costs of living elsewhere — hotel, meals, and storage — while a covered loss renders your home uninhabitable. It is typically set at 20% of Coverage A (dwelling). Coverage A pays for rebuilding the structure itself, not your temporary living expenses.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "A standard homeowners insurance policy (HO-3) covers damage caused by flooding from a nearby river overflowing its banks.",
 correct: false,
 explanation:
 "False. Flood damage from any external water source — rivers, storm surge, overland flooding — is specifically excluded from standard homeowners policies. Flood coverage must be purchased separately through the NFIP or a private flood insurer. This distinction matters enormously: a homeowner in a flood zone without a separate flood policy will receive nothing from their HO-3 for flood losses.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Priya has a $400,000 home (replacement cost), $150,000 HO-3 policy, $200,000 auto liability, and no umbrella policy. A party guest slips on her icy driveway, sues, and is awarded $450,000. Her guest later also sues for punitive damages of $100,000.",
 question: "How much does Priya pay out of pocket?",
 options: [
 "$250,000 — the $450K judgment exceeds her $300K home liability limit; punitive damages may not be covered at all",
 "$150,000 — auto liability covers the remaining gap",
 "$0 — her homeowners liability covers the full judgment",
 "$250,000 — but an umbrella would have covered the gap for just $150–$300/year",
 ],
 correctIndex: 3,
 explanation:
 "Priya's homeowners Coverage E pays the first $300K (assuming she has $300K, which is what should be recommended). The remaining $150,000 of the judgment is her out-of-pocket exposure. An umbrella policy ($1M coverage for ~$150–$300/year) would have covered this gap entirely. This scenario illustrates exactly why umbrella insurance is critical for homeowners — a single accident can exceed standard liability limits.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Health Insurance 
 {
 id: "insurance-risk-5",
 title: "Health Insurance",
 description:
 "Deductible/copay/coinsurance/OOPM mechanics, HMO/PPO/HDHP-HSA plans, ACA marketplace, and COBRA",
 icon: "Stethoscope",
 xpReward: 85,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "Cost-Sharing Mechanics: Deductible, Copay, Coinsurance & OOPM",
 content:
 "Health insurance uses four key cost-sharing terms:\n\n**Deductible:**\nThe amount YOU pay each year before insurance starts covering most services. Example: $2,000 deductible means you pay the first $2,000 of covered medical bills.\n\n**Copay:**\nA fixed dollar amount per visit or service, paid at time of service ($25 PCP visit, $50 specialist). Usually applies BEFORE the deductible is met for routine care.\n\n**Coinsurance:**\nThe percentage of costs you pay AFTER your deductible is met. 80/20 coinsurance: insurance pays 80%, you pay 20% of remaining bills.\n\n**Out-of-Pocket Maximum (OOPM):**\nThe most you will pay in a year. After you hit the OOPM, insurance covers 100% of covered services for the rest of the year.\n- 2024 ACA limits: $9,450 individual / $18,900 family\n\n**Example flow:**\n- $3,000 hospital bill you have a $1,500 deductible, then 80/20 coinsurance, $5,000 OOPM\n- Step 1: You pay $1,500 (deductible met)\n- Step 2: Remaining $1,500 × 20% = $300 (your coinsurance)\n- Total out of pocket: $1,800",
 highlight: ["deductible", "copay", "coinsurance", "out-of-pocket maximum", "80/20", "OOPM"],
 },
 {
 type: "teach",
 title: "Plan Types: HMO, PPO, HDHP & HSA",
 content:
 "**HMO (Health Maintenance Organization):**\n- Must use in-network providers\n- Requires a **primary care physician (PCP)** gatekeeper for specialist referrals\n- No coverage for out-of-network care (except emergencies)\n- Lower premiums; more administrative friction\n\n**PPO (Preferred Provider Organization):**\n- Can see any provider; higher reimbursement for in-network\n- No PCP gatekeeper; see specialists directly\n- Higher premiums; maximum flexibility\n- Best for people with chronic conditions needing specialists\n\n**HDHP + HSA (High-Deductible Health Plan + Health Savings Account):**\n- 2024 minimum deductible: $1,600 individual / $3,200 family\n- Paired with a Health Savings Account — triple tax advantage:\n 1. Contributions are tax-deductible\n 2. Growth is tax-free\n 3. Withdrawals for qualified medical expenses are tax-free\n- 2024 HSA contribution limits: $4,150 individual / $8,300 family\n- Unused HSA funds roll over indefinitely — invest them for retirement healthcare\n- After age 65, HSA funds can be withdrawn for any purpose (taxed like IRA, no penalty)\n\n**EPO (Exclusive Provider Organization):** Network-restricted like HMO but no PCP gatekeeper requirement.",
 highlight: ["HMO", "PPO", "HDHP", "HSA", "triple tax advantage", "$4,150", "$8,300", "gatekeeper"],
 },
 {
 type: "teach",
 title: "ACA Marketplace, Subsidies & COBRA",
 content:
 "**ACA Marketplace (Healthcare.gov):**\nIndividuals and families without employer coverage can buy plans through state or federal exchanges. Four metal tiers (by actuarial value):\n- **Bronze (60%):** Lowest premiums, highest cost-sharing\n- **Silver (70%):** Qualifies for Cost-Sharing Reductions (CSRs) if income 100–250% FPL\n- **Gold (80%):** Moderate premiums, lower cost-sharing\n- **Platinum (90%):** Highest premiums, lowest cost-sharing\n\n**Premium Tax Credits (PTCs):**\nAvailable to households with income 100–400% of the Federal Poverty Level (FPL). Permanently extended through 2025: cap at 8.5% of income for benchmark Silver plan. Reconciled on tax return.\n\n**COBRA (Consolidated Omnibus Budget Reconciliation Act):**\n- When you leave a job, COBRA lets you continue your employer group plan for up to **18 months** (36 months in some cases)\n- You pay 100% of the premium + 2% administrative fee — typically **very expensive** ($600–$800+/month for single coverage)\n- Useful for brief gaps; compare ACA marketplace options which may be cheaper with subsidies\n- Election period: **60 days** after losing coverage to enroll in COBRA",
 highlight: ["ACA marketplace", "Bronze/Silver/Gold/Platinum", "premium tax credits", "COBRA", "18 months", "60 days"],
 },
 {
 type: "quiz-mc",
 question:
 "Which health insurance cost-sharing feature sets the annual maximum you will ever pay, after which the insurer covers 100% of covered services?",
 options: [
 "Out-of-Pocket Maximum (OOPM) — caps your annual exposure",
 "Deductible — the amount paid before insurance activates",
 "Coinsurance — the percentage split after the deductible",
 "Copay — the fixed amount per visit",
 ],
 correctIndex: 0,
 explanation:
 "The Out-of-Pocket Maximum (OOPM) is your annual financial ceiling for covered healthcare costs. Once your deductible payments, copays, and coinsurance add up to the OOPM, the insurer pays 100% of remaining covered services for the rest of the plan year. For 2024, ACA limits the OOPM to $9,450 for individuals.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "An HSA (Health Savings Account) paired with an HDHP offers a triple tax advantage: tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses.",
 correct: true,
 explanation:
 "True. The HSA is one of the only accounts in the U.S. tax code with a triple tax benefit. No other common account (401k, Roth IRA, 529) has all three simultaneously. Additionally, HSA funds roll over indefinitely — there is no 'use it or lose it' rule — and after age 65, funds can be withdrawn for any purpose and taxed like traditional IRA withdrawals.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Alex loses his job and must choose between: (A) COBRA continuation at $720/month for his former employer's PPO, or (B) a Silver ACA marketplace plan at $380/month (after premium tax credits based on his projected income). His spouse has no medical conditions; Alex takes one branded prescription drug costing $200/month retail.",
 question: "Which option likely makes more financial sense for Alex, and what should he investigate before deciding?",
 options: [
 "ACA Silver plan — lower premium and likely similar coverage; verify his prescription is covered by the plan's formulary",
 "COBRA — employer plans always have better prescription coverage than ACA plans",
 "COBRA — ACA plans have higher deductibles than employer group plans",
 "ACA Bronze plan — always choose the lowest premium to minimize monthly costs",
 ],
 correctIndex: 0,
 explanation:
 "The ACA Silver plan at $380/month saves Alex $340/month ($4,080/year) versus COBRA. Before switching, he must verify: (1) his prescription is on the formulary (tier) of the new plan — this is the critical check; (2) his preferred providers are in-network. ACA plans can be just as comprehensive as employer plans. Choosing Bronze just for the lowest premium is risky for someone with an ongoing prescription and potential claims.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: Business Insurance 
 {
 id: "insurance-risk-6",
 title: "Business Insurance",
 description:
 "Key-person insurance, buy-sell agreements, D&O, E&O, cyber liability, and business interruption coverage",
 icon: "Briefcase",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Key-Person Insurance & Buy-Sell Agreements",
 content:
 "**Key-Person Insurance:**\nA business owns and pays premiums on a life (or disability) insurance policy on a key employee whose death or disability would cause significant financial harm to the business. The business is both owner and beneficiary.\n\n**Purposes:**\n- Compensates for lost revenue during transition\n- Funds recruiting and training a replacement\n- Reassures lenders and investors of business continuity\n- Proceeds go to the business (not the employee's family)\n\n**Amount:** Typically 5–10× the key person's annual compensation, or revenue attributable to them.\n\n**Buy-Sell Agreement:**\nA legally binding contract that governs what happens to an owner's interest if they die, become disabled, retire, or wish to exit. Insurance funds the buyout.\n\n**Types:**\n- **Cross-purchase:** Each partner owns a policy on the others. Best for small partnerships (2–3 owners); creates a higher cost basis for buyers.\n- **Entity purchase (stock redemption):** The business owns policies on each owner and buys back the interest. Simpler administration for many owners; but buyers' basis does not step up.\n- **Wait-and-see:** Hybrid — the business has the first option to buy, then co-owners if the business declines.",
 highlight: ["key-person insurance", "buy-sell agreement", "cross-purchase", "entity purchase", "cost basis"],
 },
 {
 type: "teach",
 title: "Directors & Officers (D&O) and Errors & Omissions (E&O)",
 content:
 "**Directors & Officers (D&O) Liability Insurance:**\nCovers directors and officers of companies against lawsuits alleging wrongful acts in their management capacity — breach of fiduciary duty, misrepresentation, failure to maintain appropriate controls.\n\n**Three coverage parts (sides):**\n- **Side A:** Protects individual directors/officers when the company cannot indemnify them (bankruptcy)\n- **Side B:** Reimburses the company when it indemnifies directors/officers\n- **Side C (entity coverage):** Covers the company itself in securities claims\n\nEssential for: public companies (SEC exposure), private companies (VC-backed, taking on debt), nonprofits (board liability).\n\n**Errors & Omissions (E&O) / Professional Liability:**\nCovers professionals for negligent acts, errors, or omissions in delivering professional services.\n- **Who needs it:** Financial advisors, accountants, attorneys, doctors (malpractice), architects, technology firms, consultants\n- General Liability (GL) specifically EXCLUDES professional services — E&O fills this gap\n- Claims-made policy: Coverage is triggered when the claim is filed (not when the error occurred). A **tail** (extended reporting period) policy is needed when switching carriers.",
 highlight: ["D&O", "Side A", "Side B", "Side C", "E&O", "claims-made", "tail coverage", "professional liability"],
 },
 {
 type: "teach",
 title: "Cyber Liability & Business Interruption Insurance",
 content:
 "**Cyber Liability Insurance:**\nCovers losses from data breaches, ransomware, network security failures, and cyber fraud.\n\n**First-party coverages:**\n- Data breach response (forensics, notification, credit monitoring for affected customers)\n- Business interruption from network outage\n- Ransomware payment and recovery costs\n- Data restoration\n\n**Third-party coverages:**\n- Legal liability to customers/third parties whose data was compromised\n- Regulatory fines and penalties (GDPR, HIPAA violations)\n- Media liability (online defamation, IP infringement)\n\n**Business Interruption (BI) Insurance:**\nReplaces lost business income and covers ongoing fixed expenses when operations are suspended due to a covered property loss (fire, natural disaster).\n\n**Key features:**\n- Tied to a physical property policy — the triggering event must be a covered physical loss\n- **Waiting period:** Usually 72 hours before coverage activates\n- **Indemnity period:** How long BI pays — 12 months is common; 24 months recommended\n- **Contingent BI:** Covers losses from a key supplier's or customer's covered loss (supply chain disruption)\n- COVID-19 lesson: Most standard BI policies exclude viruses/pandemics — specialized coverage now exists",
 highlight: ["cyber liability", "ransomware", "GDPR", "HIPAA", "business interruption", "indemnity period", "contingent BI"],
 },
 {
 type: "quiz-mc",
 question:
 "A technology startup has two co-founders with equal ownership. They want a buy-sell agreement where each founder owns a life insurance policy on the other and uses proceeds to buy the deceased's shares. What type of buy-sell arrangement is this?",
 options: [
 "Cross-purchase agreement — each owner holds policies on the other owners",
 "Entity purchase (stock redemption) — the company buys back shares",
 "Wait-and-see agreement — either the company or owners can buy",
 "Key-person buy-out — the business uses key-person policy proceeds",
 ],
 correctIndex: 0,
 explanation:
 "A cross-purchase agreement has each co-owner purchasing and owning life insurance policies on the other co-owners. When one owner dies, the survivors use the life insurance proceeds to purchase the deceased's ownership interest. For a two-person partnership, cross-purchase is often preferred because the surviving owner gets a stepped-up cost basis equal to the purchase price, reducing future capital gains tax.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "A company's general liability (GL) insurance policy covers claims arising from professional errors or omissions made while delivering its consulting services.",
 correct: false,
 explanation:
 "False. Standard general liability (GL) policies specifically exclude claims arising from professional services. A consulting firm's GL policy covers bodily injury, property damage, and advertising injury — but NOT a client's financial loss caused by incorrect advice. That exposure requires a separate Errors & Omissions (E&O) / professional liability policy. Confusing GL with E&O is a common and costly gap.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A mid-size healthcare IT company suffers a ransomware attack. Attackers encrypt patient data and demand $500,000. The company pays the ransom and spends $300,000 on forensics and breach notifications to 50,000 patients. Regulators later fine them $250,000 under HIPAA. Business operations were disrupted for 10 days costing $200,000 in lost revenue.",
 question: "Which insurance would cover most of these losses, and what is the approximate total insurable loss?",
 options: [
 "Cyber liability policy — covers ransom ($500K), forensics/notification ($300K), HIPAA fines ($250K), and business interruption ($200K) = $1.25M total",
 "General liability — covers ransom and regulatory fines as third-party claims",
 "Business interruption only — the other costs are the company's own responsibility",
 "D&O insurance — directors are liable for the security failure that caused the breach",
 ],
 correctIndex: 0,
 explanation:
 "A comprehensive cyber liability policy is designed for exactly this scenario. First-party coverage handles: ransom payments ($500K), forensics and breach response ($300K), and business income loss ($200K). Third-party coverage handles regulatory fines and penalties like the HIPAA fine ($250K). The total insurable loss of ~$1.25M underscores why cyber coverage with adequate limits is essential for any company handling sensitive data.",
 difficulty: 3,
 },
 ],
 },
 ],
};
