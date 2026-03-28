import type { Unit } from "./types";

export const UNIT_FINANCIAL_INDEPENDENCE: Unit = {
  id: "financial-independence",
  title: "Financial Independence: The FIRE Framework",
  description:
    "Master the mathematics and strategies behind Financial Independence, Retire Early — from the 4% rule and savings rate optimization to sequence of returns risk and geographic arbitrage",
  icon: "🔥",
  color: "#f97316",
  lessons: [
    // ─── Lesson 1: The 4% Rule & Safe Withdrawal ─────────────────────────────
    {
      id: "financial-independence-1",
      title: "🏦 The 4% Rule & Safe Withdrawal",
      description:
        "The Trinity Study, how the 4% rule was derived, sequence of returns risk, and dynamic withdrawal strategies for a multi-decade retirement",
      icon: "BookOpen",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Trinity Study — Where the 4% Rule Comes From",
          content:
            "The **4% rule** is the foundation of FIRE planning. It originated from the 1998 **Trinity Study**, a landmark paper by three professors at Trinity University that analyzed historical portfolio survival rates across decades of retirement.\n\n**The methodology:**\n- Researchers simulated retirements starting every year from 1926 to 1995\n- They tested various asset allocations (100% stocks to 100% bonds)\n- They measured how often a portfolio survived 30 years of withdrawals at different rates\n- Result: A 4% initial withdrawal rate, adjusted annually for inflation, survived 95%+ of all historical 30-year periods with a 75% stocks / 25% bonds allocation\n\n**What the 4% rule actually says:**\n- In Year 1, withdraw 4% of your portfolio value\n- Each subsequent year, increase the dollar amount by inflation (typically 2–3%)\n- Example: $1,000,000 portfolio → $40,000 Year 1 withdrawal → $41,200 if 3% inflation in Year 2\n\n**Critical nuances often missed:**\n1. The study tested **30-year** retirements — FIRE retirees may need 50–60 years\n2. The \"95% success\" means 5% of historical scenarios resulted in portfolio depletion\n3. Success rates assume strict adherence — no flexibility allowed in the original model\n4. The study used **historical** US market returns, which may not predict future returns\n\n**Updated research (2021):** Morningstar analysis suggested 3.3% may be more appropriate for 30-year retirements given lower expected future returns. For 40–50 year FIRE retirements, many planners use 3.0–3.5%.",
          highlight: ["4% rule", "Trinity Study", "safe withdrawal rate", "portfolio survival", "inflation-adjusted"],
        },
        {
          type: "teach",
          title: "Sequence of Returns Risk — The Hidden Danger",
          content:
            "**Sequence of returns risk** is arguably the most dangerous threat to a retirement portfolio — and it has nothing to do with average returns.\n\n**The concept:**\nTwo portfolios with identical average annual returns can have completely different outcomes if the order of good and bad years differs.\n\n**Illustration with $1M portfolio, 4% withdrawal ($40K/year):**\n\nPortfolio A: Bad years early\n- Year 1: −30% → portfolio drops to $660K, then withdraw $40K = $620K remaining\n- Year 2: −10% → $558K, withdraw $41.2K = $516.8K remaining\n- Years 3–10: +15% annually\n- Result at year 10: ~$780K — still depleted vs original\n\nPortfolio B: Good years early\n- Years 1–8: +15% annually\n- Year 9: −30% \n- Year 10: −10%\n- Result at year 10: ~$1.2M — still growing\n\nSame average return, vastly different outcomes. **The early years of retirement are the most critical.**\n\n**Why this happens:**\n- When you are withdrawing money, losses early on reduce the principal that would otherwise compound\n- A 50% loss requires a 100% gain to break even — but you are withdrawing during the recovery\n- There is no time to \"wait out\" a crash when you need annual income\n\n**Risk mitigation strategies:**\n1. **Cash buffer**: Hold 1–2 years of expenses in cash — avoid selling stocks in a crash\n2. **Glide path**: Gradually increase bond allocation as you approach retirement (reduce equity risk)\n3. **Dynamic withdrawal**: Reduce spending by 10–15% during down years — preserves portfolio dramatically\n4. **Part-time income**: Even $10,000/year of side income reduces required withdrawals meaningfully",
          highlight: ["sequence of returns risk", "cash buffer", "glide path", "dynamic withdrawal", "early years"],
        },
        {
          type: "teach",
          title: "Dynamic Withdrawal Strategies",
          content:
            "Rather than rigidly withdrawing a fixed inflation-adjusted dollar amount, **dynamic withdrawal strategies** adjust spending based on portfolio performance — dramatically improving survival rates.\n\n**The Guardrails Strategy (David Blanchett):**\n- Set an upper guardrail: if spending rate drops below 3.5%, increase withdrawals by 10%\n- Set a lower guardrail: if spending rate rises above 5%, cut withdrawals by 10%\n- This flexibility alone improves 30-year survival from 90% to 99%+ at 4.5% initial withdrawal\n\n**The Floor-and-Upside Strategy:**\n- Floor: cover essential expenses ($30K/year) with guaranteed income (Social Security, bonds, annuities)\n- Upside: cover discretionary spending ($10–20K/year) from equity portfolio\n- When markets crash, cut discretionary spending — essentials remain covered\n\n**The 95% Rule (Vanguard):**\n- Never spend more than 150% of your initial withdrawal rate\n- Never spend less than 50% of your initial withdrawal rate\n- Within those bands, adjust based on portfolio value each year\n\n**Practical FIRE application:**\nA FIRE retiree with $1.5M and $60K desired spending:\n- Base rate: 4% = $60,000 (aligned)\n- Guardrail trigger: if portfolio drops to $1.0M, spending drops to $54,000\n- Recovery trigger: if portfolio rises to $2.0M, spending increases to $66,000\n- This approach allows higher initial withdrawal rates while maintaining safety\n\n**Key insight:** The rigid 4% rule is a conservative model designed for worst-case analysis. Real retirees naturally adapt their spending — which is why most historical retirees ended with far more than they started with.",
          highlight: ["guardrails strategy", "floor-and-upside", "dynamic withdrawal", "flexibility", "spending adaptation"],
        },
        {
          type: "quiz-mc",
          question:
            "The Trinity Study found that a 4% withdrawal rate had a ~95% success rate over 30 years. If you plan to retire at age 35 and live to 90, what is the primary concern with applying the standard 4% rule?",
          options: [
            "The Trinity Study tested 30-year periods, but a 55-year retirement has significantly higher failure risk at 4%",
            "The 4% rule only applies to bond portfolios, not stock-heavy allocations",
            "The Trinity Study was conducted before inflation existed, making its findings outdated",
            "4% withdrawals are only safe if you have at least $5 million invested",
          ],
          correctIndex: 0,
          explanation:
            "The Trinity Study modeled 30-year retirements. Early retirees planning for 50–60 years face substantially higher failure rates at the same 4% rate. Research suggests 3.0–3.5% may be more appropriate for very long retirement horizons. The extra 20–30 years means more time for a bad sequence of returns to deplete the portfolio before it can recover.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Sequence of returns risk means that a retiree who experiences strong market returns in the first decade of retirement and poor returns in the second decade will have worse outcomes than one who experiences the reverse order, even if average annual returns are identical.",
          correct: false,
          explanation:
            "This is reversed. A retiree who experiences POOR returns early (when the portfolio is largest and withdrawals are highest relative to the depleted balance) faces the most danger. Good returns early allow the portfolio to compound before bad years hit. This is why sequence of returns risk primarily threatens early retirement years — the first 5–10 years are the most critical window.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: How Much Do You Need to Retire? ───────────────────────────
    {
      id: "financial-independence-2",
      title: "💰 How Much Do You Need to Retire?",
      description:
        "The 25x rule explained, calculating your FI number from annual spending, and how small changes in lifestyle dramatically change the target",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The 25x Rule — Your FI Number",
          content:
            "The most fundamental calculation in FIRE is determining your **FI number** — the portfolio size at which you can safely retire. This comes directly from the 4% rule.\n\n**The math is elegant:**\n- If you can safely withdraw 4% per year, then you need 1/0.04 = **25× your annual expenses**\n- Annual spending × 25 = Your FI Number\n\n**Examples:**\n| Annual Spending | FI Number | Monthly Spending |\n|----------------|-----------|------------------|\n| $30,000 | $750,000 | $2,500 |\n| $40,000 | $1,000,000 | $3,333 |\n| $60,000 | $1,500,000 | $5,000 |\n| $80,000 | $2,000,000 | $6,667 |\n| $100,000 | $2,500,000 | $8,333 |\n\n**If using a 3.5% rate (for extra safety):** Multiply annual spending by 28.6×\n- $60,000 × 28.6 = $1,714,000 target\n\n**The critical input — spending, not income:**\nYour FI number is based on **what you spend**, not what you earn. A household earning $200K but spending $180K needs $4.5M. A household earning $80K but spending $40K needs only $1M.\n\n**Pre-retirement vs post-retirement spending:**\nMany expenses change after retirement:\n- Commuting costs disappear\n- Work wardrobe eliminated\n- Payroll taxes no longer apply (FICA: 7.65%)\n- Mortgage may be paid off\n- Health insurance may increase (before Medicare at 65)\n- Travel and leisure may increase\n\nEstimate your actual retirement spending honestly — this number drives everything else in your plan.",
          highlight: ["FI number", "25x rule", "annual spending", "safe withdrawal rate", "portfolio target"],
        },
        {
          type: "teach",
          title: "The Leverage of Spending Reduction",
          content:
            "One of the most powerful — and underappreciated — insights in FIRE is that **reducing spending has a double benefit**: it reduces your FI number AND increases your savings rate simultaneously.\n\n**The compounding effect of frugality:**\nAssume $100,000 income, currently spending $70,000 and saving $30,000.\n\nScenario A: Cut spending by $10,000/year (to $60,000)\n- New savings: $40,000/year (33% increase in savings rate)\n- New FI number: $60,000 × 25 = $1,500,000 (down from $1,750,000)\n- **Double benefit**: save more AND need less\n\n**The most expensive purchases have massive FI implications:**\n\nHousing: Upgrading from a $300K home to a $500K home\n- Extra mortgage cost: ~$800/month = $9,600/year\n- FI number increase: $9,600 × 25 = $240,000 more needed\n- Time to retirement: potentially 3–5 years longer\n\nCars: Buying a $50K car instead of a $25K car\n- Extra cost (depreciation + insurance + financing): ~$5,000/year\n- FI number increase: $5,000 × 25 = $125,000 more needed\n\n**Geographic cost differences:**\n- Living in San Francisco ($8,000/month) vs Austin ($4,000/month)\n- Annual difference: $48,000\n- FI number difference: $48,000 × 25 = $1,200,000\n- A FIRE retiree willing to live in a lower cost city could retire with $1.2M less!\n\n**The psychological reframe:**\nEvery $1 saved is not just $1 in the bank — it is $25 less that you need to accumulate. Frugality is a multiplier, not just a sacrifice.",
          highlight: ["spending reduction", "double benefit", "FI number", "housing cost", "geographic arbitrage"],
        },
        {
          type: "quiz-mc",
          question:
            "A 32-year-old plans to retire when their investment portfolio can sustain their lifestyle indefinitely. They currently spend $55,000 per year but expect retirement spending to be $45,000 per year (no commuting, paid-off home). Using the 4% rule, what is their FI number?",
          options: [
            "$1,125,000",
            "$1,375,000",
            "$1,250,000",
            "$1,100,000",
          ],
          correctIndex: 0,
          explanation:
            "The FI number is based on retirement spending, not current spending. $45,000 × 25 = $1,125,000. Using current spending of $55,000 would give $1,375,000 — a $250,000 overestimate that would delay retirement unnecessarily. Accurately forecasting post-retirement expenses is crucial: lower costs from eliminated commuting, mortgage payoff, and payroll taxes often meaningfully reduce the required portfolio size.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Alex earns $120,000/year and spends $90,000/year, saving $30,000 annually. Alex is considering two paths: Path A — maintain current spending ($90K/year) and save $30K/year. Path B — cut spending to $60K/year and save $60K/year. Alex's current portfolio is $200,000 and returns 7% annually.",
          question:
            "Which outcome correctly describes the impact of Path B vs Path A on Alex's financial independence journey?",
          options: [
            "Path B reduces the FI number by $750,000 AND increases annual savings by $30,000, compressing the timeline by roughly 7–9 years",
            "Path B only changes the savings rate, not the FI number, since income is unchanged",
            "Path B is marginally better — the FI number decreases by $30,000 and savings increase slightly",
            "Path A and Path B reach FI at the same time since total lifetime earnings are identical",
          ],
          correctIndex: 0,
          explanation:
            "Path B creates a dual benefit: the FI number drops from $90,000 × 25 = $2,250,000 to $60,000 × 25 = $1,500,000 (a $750,000 reduction), AND annual savings double from $30,000 to $60,000. With a smaller target and higher contributions, compounding accelerates dramatically. At 7% returns, Path A takes roughly 25+ years to reach $2.25M, while Path B reaches $1.5M in approximately 16–17 years — saving roughly 8–9 years of working life.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "If you reduce your annual spending by $1,000, your required FI number decreases by $1,000.",
          correct: false,
          explanation:
            "Reducing annual spending by $1,000 reduces your FI number by $25,000 — not $1,000. Since you need 25× annual spending, every dollar of annual spending reduction eliminates $25 from your target portfolio. This is why even modest lifestyle adjustments have enormous impact on retirement timelines: $200/month less in spending = $2,400/year = $60,000 less needed in your portfolio.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Savings Rate is Everything ────────────────────────────────
    {
      id: "financial-independence-3",
      title: "📈 Savings Rate is Everything",
      description:
        "How your savings rate — not your income — determines when you reach financial independence, with the famous FIRE timeline table",
      icon: "BarChart2",
      xpReward: 85,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The Savings Rate Table — Time to Financial Independence",
          content:
            "The most eye-opening insight in the FIRE movement comes from analyzing how **savings rate** (not income) determines time to financial independence. This assumes 7% real returns on investments.\n\n**Years to Financial Independence by Savings Rate:**\n\n| Savings Rate | Years to FI |\n|-------------|-------------|\n| 5% | 66 years |\n| 10% | 51 years |\n| 20% | 37 years |\n| 30% | 28 years |\n| 40% | 22 years |\n| 50% | 17 years |\n| 60% | 12.5 years |\n| 70% | 8.5 years |\n| 80% | 5.5 years |\n| 90% | 3 years |\n\n**The math behind this table:**\n- If you save X% of income, you spend (100−X)%\n- Your FI number = spending × 25\n- Time to FI = time to accumulate that amount at 7% real returns\n\n**The extraordinary implication:**\nSomeone saving 50% of a $70,000 income reaches FI in the same time as someone saving 50% of a $200,000 income — **17 years either way**. The specific income is irrelevant; it is the ratio that determines the timeline.\n\n**Why income alone cannot save you:**\n- A doctor earning $300K but spending $280K has a 6.7% savings rate → 57 years to FI\n- A teacher earning $60K but spending $30K has a 50% savings rate → 17 years to FI\n- The teacher reaches financial independence decades before the doctor\n\nThis is why FIRE is fundamentally about the **gap between income and expenses**, not about earning more.",
          highlight: ["savings rate", "time to FI", "7% real returns", "income vs spending gap", "ratio determines timeline"],
        },
        {
          type: "teach",
          title: "Savings Rate Optimization Strategies",
          content:
            "Increasing your savings rate is the single highest-leverage activity in financial planning. The most effective strategies target your three largest expense categories: housing, transportation, and food.\n\n**Housing (typically 25–35% of spending):**\n- House hacking: buy a duplex or triplex, rent the other units, eliminate your housing cost entirely\n- Roommates: adding one roommate in a 2-bedroom can cut housing costs 40–50%\n- Geographic arbitrage: move to a lower cost-of-living city (detailed in Lesson 6)\n- Downsize: trading a 2,400 sq ft home for 1,400 sq ft often saves $800–$1,500/month\n\n**Transportation (typically 15–20% of spending):**\n- One less car in a two-car household: saves $8,000–$12,000/year (insurance, depreciation, fuel, maintenance)\n- Buy reliable used cars at 3–5 years old: avoid first-year depreciation (new cars lose 20% in year 1)\n- Cycling or e-biking for commutes under 5 miles: near-zero marginal cost\n\n**Food (typically 10–15% of spending):**\n- Meal prepping: cooking at home for the week on Sunday, avoiding $12–18 daily lunch costs\n- Eliminating food delivery apps (average markup: 30–50% + tips + fees)\n- Strategic grocery shopping: store-brand essentials, discount stores for staples\n\n**The \"Big Three\" vs small wins:**\nMost financial advice focuses on cutting small expenses (lattes, streaming subscriptions). But research by MIT economist David Laibson shows the big three — housing, transportation, food — account for 70%+ of spending. Optimizing these has 10–50× more impact than eliminating small luxuries.",
          highlight: ["house hacking", "transportation", "savings rate optimization", "big three expenses", "high leverage"],
        },
        {
          type: "teach",
          title: "The Income Side — Earning More Accelerates Everything",
          content:
            "While savings rate is the primary driver of FIRE timelines, income increases that are **saved (not spent)** can dramatically compress the timeline.\n\n**The Career Capital Strategy:**\nEvery $10,000 increase in annual income, if entirely saved:\n- Increases annual savings by $10,000\n- Decreases time to FI by 1–3 years (depending on your current rate)\n- The effect compounds: higher income in your 30s gives money more time to compound\n\n**Side income in FIRE planning:**\nEven modest side income has an outsized effect due to the 25× multiplier:\n- $5,000/year side income reduces required portfolio by $125,000 ($5K × 25)\n- $15,000/year freelancing reduces required portfolio by $375,000\n- A part-time job covering $20K/year of expenses essentially eliminates $500,000 from your FI number\n\n**The Barista FIRE concept:**\nWork a part-time or low-stress job that covers basic expenses while your portfolio continues to grow. Example:\n- Portfolio: $800,000 (not yet fully FI)\n- Part-time income: $20,000/year\n- Annual expenses: $45,000\n- Portfolio only needs to cover $25,000 → withdrawal rate is 3.1%\n- This is highly sustainable, and the portfolio continues growing\n\n**Income vs savings rate comparison:**\nDoubling income with constant lifestyle → doubles savings rate → cuts years to FI roughly in half.\nDoubling savings rate without income increase (by cutting spending) → same result.\nThe math treats both strategies equivalently — the gap between income and expenses is all that matters.",
          highlight: ["income increase", "side income", "Barista FIRE", "25x multiplier", "career capital"],
        },
        {
          type: "quiz-mc",
          question:
            "Two people both earn $80,000/year and start investing at age 25 with $0. Person A saves 20% ($16,000/year). Person B saves 50% ($40,000/year). Assuming 7% real annual returns, approximately how many years earlier does Person B reach financial independence than Person A?",
          options: [
            "Approximately 14–15 years earlier",
            "Approximately 5–6 years earlier",
            "Approximately 3–4 years earlier",
            "They reach FI at the same time since income is identical",
          ],
          correctIndex: 0,
          explanation:
            "At a 20% savings rate, the FI timeline is approximately 37 years. At a 50% savings rate, it is approximately 17 years. That is a difference of roughly 20 years — making Person B financially independent at age 42 vs Person A at age 62. Person B also has a lower FI number ($40,000 × 25 = $1,000,000 vs $64,000 × 25 = $1,600,000) which further accelerates the timeline.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A high-income professional earning $500,000 per year will always reach financial independence faster than someone earning $80,000 per year, regardless of their respective spending habits.",
          correct: false,
          explanation:
            "Income alone does not determine time to FI — the savings rate does. A $500K earner spending $480K/year has a 4% savings rate and will need ~66 years to reach FI. An $80K earner spending $40K/year has a 50% savings rate and will reach FI in ~17 years. Many high earners maintain expensive lifestyles (luxury housing, cars, private schools) that keep their savings rates very low, extending their required working years despite high incomes.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 4: The FIRE Math ──────────────────────────────────────────────
    {
      id: "financial-independence-4",
      title: "🧮 The FIRE Math",
      description:
        "Compound interest mechanics, tax-advantaged account stacking, realistic return assumptions, and how the numbers really work over decades",
      icon: "Calculator",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Compound Interest — The Engine of FIRE",
          content:
            "Albert Einstein reportedly called compound interest the eighth wonder of the world. Whether or not he said it, the mathematics are genuinely astounding — and they are the entire mechanism behind FIRE.\n\n**The compound interest formula:**\nFuture Value = Present Value × (1 + r)^n\n- r = annual return rate\n- n = number of years\n\n**Growth of $10,000 at 7% real returns:**\n- After 10 years: $19,672\n- After 20 years: $38,697\n- After 30 years: $76,123\n- After 40 years: $149,745\n\nNotice the pattern: the money more than doubles every 10 years. **The Rule of 72**: divide 72 by your interest rate to find doubling time. At 7%, money doubles every 72/7 ≈ 10.3 years.\n\n**The power of starting early:**\n- Invest $10,000 at age 25 → worth $149,745 at age 65 (40 years at 7%)\n- Invest $10,000 at age 35 → worth $76,123 at age 65 (30 years at 7%)\n- The 10-year head start is worth an additional $73,622 from a single $10,000 investment\n\n**Continuous contributions amplify this further:**\nInvesting $1,000/month starting at age 25 at 7% real returns:\n- Age 35: $175,000 accumulated\n- Age 45: $525,000 accumulated\n- Age 55: $1,219,000 accumulated\n- Age 65: $2,632,000 accumulated\nTotal contributed: $480,000. Total growth: $2,152,000 — compound growth is 4.5× the contributions.\n\n**Real vs nominal returns:**\nFIRE planning uses **real returns** (after inflation). If markets return 10% nominally and inflation is 3%, your real return is ~7%. Planning with real returns means your FI number and withdrawal amounts are expressed in today's dollars, simplifying the math.",
          highlight: ["compound interest", "Rule of 72", "real returns", "starting early", "doubling time"],
        },
        {
          type: "teach",
          title: "Tax-Advantaged Account Stacking",
          content:
            "Tax-advantaged accounts are the most powerful legal tools for accelerating wealth accumulation. For US FIRE investors, the optimal **account stacking order** is critical.\n\n**The optimal investment order:**\n1. **401(k) / 403(b) up to employer match** — this is a 50–100% instant return on investment; never leave free money\n2. **HSA (Health Savings Account)** — triple tax advantage (pre-tax contribution, tax-free growth, tax-free withdrawal for medical); 2024 limit: $4,150 individual / $8,300 family\n3. **Roth IRA** — post-tax contribution, all growth is tax-free forever; 2024 limit: $7,000; income limits apply\n4. **Max 401(k)/403(b)** — full $23,000 (2024) contribution; traditional 401(k) reduces taxable income today\n5. **Taxable brokerage account** — no contribution limits; flexible but taxed\n\n**Tax savings at a 22% marginal rate:**\nMaxing a traditional 401(k) at $23,000 saves: $23,000 × 22% = $5,060 in taxes per year\nOver 20 years, this tax savings alone compounds to ~$210,000 at 7%\n\n**The Roth Conversion Ladder — the FIRE secret weapon:**\nEarly retirees often have low income after leaving work. This creates an opportunity:\n1. Convert traditional IRA/401(k) funds to Roth IRA each year (pay tax at low rates)\n2. After 5 years from each conversion, withdraw that amount tax- and penalty-free\n3. Maintain a 5-year rolling ladder of conversions\n\nThis allows access to retirement funds before age 59½ without the 10% early withdrawal penalty — a crucial tool for early retirees.\n\n**Asset location optimization:**\n- Tax-inefficient assets (REITs, bonds, actively managed funds): hold in tax-advantaged accounts\n- Tax-efficient assets (index funds, growth stocks): hold in taxable accounts",
          highlight: ["401k", "HSA", "Roth IRA", "Roth conversion ladder", "account stacking", "tax-free growth"],
        },
        {
          type: "teach",
          title: "Realistic Return Assumptions",
          content:
            "One of the biggest planning mistakes in FIRE is using unrealistic return assumptions. Here is what historical data actually shows:\n\n**US Stock Market Historical Returns:**\n- S&P 500 nominal average (1926–2023): ~10.5% per year\n- S&P 500 real (after ~3% inflation): ~7% per year\n- But: volatility is enormous — individual years range from −50% to +50%\n\n**International diversification:**\n- International developed markets (MSCI EAFE): ~8% nominal historically\n- Emerging markets: ~10% nominal but with higher volatility and political risk\n- Adding international can reduce volatility without sacrificing much return\n\n**Bond returns:**\n- US 10-year Treasury historical real return: ~1.5–2% per year\n- Current (2024) 10-year yield: ~4.5% nominal\n- Bonds provide ballast and sequence-of-returns protection, but at a cost to growth\n\n**Conservative vs optimistic planning:**\n| Scenario | Return Assumption | $500K at 30 years |\n|----------|------------------|-------------------|\n| Conservative | 5% real | $2.16M |\n| Base case | 7% real | $3.81M |\n| Optimistic | 9% real | $6.63M |\n\n**FIRE planning best practices:**\n- Use 5–6% real returns for conservative planning\n- Use 7% as a base case (historical average)\n- Never plan on more than 8% real returns\n- Run scenarios at multiple return rates — if the plan only works at 9%, it is not a robust plan\n- Monte Carlo simulation (available in many tools) tests thousands of return sequences, providing probability distributions rather than single-point estimates",
          highlight: ["real returns", "7% assumption", "Monte Carlo", "historical returns", "conservative planning"],
        },
        {
          type: "quiz-mc",
          question:
            "A FIRE investor has $250,000 in a traditional 401(k), $150,000 in a Roth IRA, and $100,000 in a taxable brokerage account. They retire at age 40 and need $40,000/year. What is the PRIMARY benefit of executing a Roth conversion ladder?",
          options: [
            "It allows penalty-free access to pre-tax retirement funds before age 59½ by converting to Roth and waiting 5 years per conversion",
            "It permanently eliminates all taxes on the converted amount since Roth accounts are always tax-free",
            "It allows the investor to withdraw from the traditional 401(k) immediately after retirement with no taxes or penalties",
            "It converts the portfolio to bonds, reducing sequence of returns risk during early retirement",
          ],
          correctIndex: 0,
          explanation:
            "The Roth conversion ladder exploits the 5-year rule: each Roth conversion becomes penalty-free after 5 years. An early retiree converts traditional 401(k) funds to Roth IRA each year (paying income tax at low rates since they have no employment income), then accesses those converted funds 5 years later. This sidesteps the 10% early withdrawal penalty that normally applies to retirement accounts accessed before age 59½, while potentially paying minimal taxes during low-income retirement years.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Using a 10% annual return assumption (matching the S&P 500 nominal historical average) is appropriate for FIRE planning because it represents what the market has actually delivered over 100 years.",
          correct: false,
          explanation:
            "FIRE planning should use real (inflation-adjusted) returns, not nominal returns. The S&P 500 nominal ~10.5% includes ~3% inflation, leaving ~7% real purchasing power growth. Planning with nominal returns while spending inflation-adjusted dollars leads to significant overestimates of future wealth. Additionally, conservative FIRE plans often use 5–6% real returns to account for potentially lower future returns and sequence-of-returns risk. Planning at 10% nominal would be dangerously optimistic.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Sequence of Returns Risk ──────────────────────────────────
    {
      id: "financial-independence-5",
      title: "⚠️ Sequence of Returns Risk",
      description:
        "Why early retirement is uniquely dangerous, glide path strategies, cash buffer mechanics, and how to build a retirement portfolio that survives bad market timing",
      icon: "AlertTriangle",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Why Retirement Timing Matters More Than Lifetime Returns",
          content:
            "**Sequence of returns risk** is the phenomenon where the same average return, experienced in different orders, produces radically different retirement outcomes. It is the most dangerous risk facing early retirees.\n\n**A concrete comparison — both portfolios average 7% over 10 years:**\n\nRetiree A: Market crashes in years 1–3\n- Starting: $1,000,000, withdrawing $40,000/year\n- Year 1: −30% → $700,000 − $40,000 = $660,000\n- Year 2: −15% → $561,000 − $41,200 = $519,800\n- Year 3: −10% → $467,820 − $42,436 = $425,384\n- Years 4–10: strong positive returns +20%, +15%, +12%...\n- End of Year 10: ~$680,000 (down 32% from start after 10 years of withdrawals)\n\nRetiree B: Same returns but in reverse order (good years first)\n- Starting: $1,000,000, withdrawing $40,000/year\n- Years 1–7: strong positive returns\n- Portfolio grows to ~$1.8M before the crash hits\n- Years 8–10: same crashes as Retiree A\n- End of Year 10: ~$1,450,000 (up 45% from start)\n\n**Same average return. Completely different outcome.**\n\nThe reason: when you withdraw money from a declining portfolio, you are selling shares at low prices. Those shares are gone — they cannot participate in the recovery. Retiree A was forced to sell at bottom prices to fund living expenses.\n\n**The accumulation phase vs distribution phase:**\nDuring accumulation (working years), sequence of returns helps you — market drops let you buy more shares cheaply. During distribution (retirement), the math reverses entirely. This asymmetry is fundamental to retirement planning.",
          highlight: ["sequence of returns", "distribution phase", "withdrawal during crash", "accumulation vs distribution", "retire timing"],
        },
        {
          type: "teach",
          title: "The Glide Path Strategy",
          content:
            "A **glide path** is a planned, gradual shift in asset allocation from aggressive (high equity) to conservative (higher bonds/cash) as you approach and enter retirement. It is specifically designed to reduce sequence of returns risk.\n\n**Target-date fund logic:**\nCommercial target-date funds automatically shift allocation over time:\n- Age 30: 90% stocks / 10% bonds\n- Age 45: 80% stocks / 20% bonds\n- Age 55: 70% stocks / 30% bonds\n- Age 65: 50% stocks / 50% bonds (retirement date)\n- Age 75: 30% stocks / 70% bonds\n\n**The FIRE-specific challenge:**\nFIRE retirees at age 40 face 50+ year retirements. A traditional conservative glide path that reaches 50% bonds at retirement date would be too conservative for a 50-year horizon — you still need significant equity growth.\n\n**Modified glide path for FIRE:**\n- Ages 25–35 (accumulation): 90–100% stocks\n- Ages 35–40 (pre-retirement): 80–90% stocks\n- Ages 40–45 (early retirement — highest risk): 70–80% stocks, 10% bonds, 10% cash\n- Ages 45–55 (middle retirement): 70–75% stocks, 20–25% bonds\n- Ages 55–70 (later retirement): 60–65% stocks, 30–35% bonds\n- Ages 70+ (end of life): 50–60% stocks, 30–40% bonds\n\nNote: FIRE retirees maintain higher equity allocations throughout because of longer time horizons. The goal is to survive the first 5–10 years (highest sequence risk) while preserving long-term growth.\n\n**Rising equity glide path (academic research):**\nRecent research (Wade Pfau, Michael Kitces) suggests actually REDUCING equity allocation before retirement and then INCREASING it during the first 10 years of retirement. This counter-intuitive approach reduces the impact of a crash occurring exactly at retirement.",
          highlight: ["glide path", "asset allocation", "target-date fund", "equity vs bonds", "FIRE modification"],
        },
        {
          type: "teach",
          title: "Cash Buffer and Bucket Strategies",
          content:
            "The most practical defense against sequence of returns risk is maintaining a **cash buffer** — a separate reserve that funds living expenses during market downturns, eliminating the need to sell equities at low prices.\n\n**The Two-Year Cash Buffer:**\nHold 2 years of expenses in cash or short-term bonds (not invested in stocks):\n- Portfolio: $1,000,000 in index funds\n- Cash buffer: $80,000 (2 × $40,000 annual expenses) in high-yield savings account\n- Effective investment: $920,000\n\nWhen the market drops 30%:\n- DO NOT sell stocks\n- Fund living expenses from the $80,000 cash buffer\n- Wait for market recovery (historically 12–24 months for a 30% drop)\n- Replenish cash buffer when portfolio recovers\n\n**The Three-Bucket Strategy (Harold Evensky):**\n- **Bucket 1 (Now)**: 1–2 years in cash/money market — immediate spending\n- **Bucket 2 (Soon)**: 3–10 years in bonds/balanced funds — medium-term income, refills Bucket 1\n- **Bucket 3 (Later)**: 11+ years in 100% equities — long-term growth, refills Bucket 2 every few years\n\nThis structure provides psychological safety (you can see several years of income secured in buckets 1 and 2) while keeping the majority of the portfolio in equities for long-term growth.\n\n**Cash buffer quantification:**\nFEDA research suggests 12 months of cash reduces failure rates from 4% to 0.9% for 30-year retirements at 4% withdrawal. For early retirees, 18–24 months is recommended given longer horizons and potentially greater sequence risk.\n\n**The cost of the buffer:**\nCash earns less than equities — but high-yield savings accounts now pay 4–5% (2024), narrowing the opportunity cost dramatically from the near-zero rates of 2010–2021.",
          highlight: ["cash buffer", "bucket strategy", "two-year buffer", "market downturns", "opportunity cost"],
        },
        {
          type: "quiz-mc",
          question:
            "A FIRE retiree with a $1,200,000 portfolio withdraws $48,000/year (4% rate). The market drops 35% in their first year of retirement. If they follow a strict cash buffer strategy with 2 years of expenses reserved, what is their correct response?",
          options: [
            "Draw from the cash buffer for living expenses and wait for the market recovery before replenishing it",
            "Immediately rebalance by selling bonds and moving to 100% stocks to benefit from low prices",
            "Reduce withdrawals to $30,000 and invest the difference in stocks at the depressed prices",
            "Sell 4% of the remaining equity portfolio to maintain the systematic withdrawal plan",
          ],
          correctIndex: 0,
          explanation:
            "The entire purpose of the cash buffer is to avoid selling equities during market downturns. With 2 years of expenses ($96,000) in cash, the retiree should fund living expenses from the buffer and leave the equity portfolio untouched to recover. Once the market recovers (typically 12–24 months for a 35% drop), the buffer is replenished. This prevents the permanent damage of selling low — the exact mechanism that kills retirement portfolios in bad sequences.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A FIRE retiree who earns $15,000 per year from a part-time consulting job has effectively eliminated sequence of returns risk because they can supplement income during market downturns.",
          correct: false,
          explanation:
            "Part-time income significantly reduces (but does not eliminate) sequence of returns risk. If annual expenses are $50,000 and consulting income is $15,000, the portfolio still needs to cover $35,000/year — still susceptible to bad sequences. However, $15,000/year income reduces the required withdrawal from $50,000 to $35,000, effectively reducing the required portfolio from $1,250,000 to $875,000 and dramatically improving sustainability. Partial income is highly valuable but not a complete solution.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 6: Geographic Arbitrage & FIRE ────────────────────────────────
    {
      id: "financial-independence-6",
      title: "🌍 Geographic Arbitrage & FIRE",
      description:
        "How geoarbitrage reduces your FI number by hundreds of thousands, country cost comparisons, residency options, and practical planning for international FIRE",
      icon: "Globe",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What is Geographic Arbitrage?",
          content:
            "**Geographic arbitrage** (geoarbitrage) is the strategy of earning income or holding wealth in a high-cost currency/country while living in a lower-cost country. For FIRE practitioners, it means spending your portfolio's withdrawals where dollars go much further.\n\n**The fundamental math:**\nA $40,000/year lifestyle in San Francisco costs ~$20,000 in Medellín, Colombia or $18,000 in Chiang Mai, Thailand.\n\n- San Francisco FI number: $40,000 × 25 = $1,000,000\n- Medellín FI number: $20,000 × 25 = $500,000\n- **Savings: $500,000 in required portfolio** — retiring potentially 5–8 years earlier\n\n**Annual spending comparisons for a comfortable single-person lifestyle:**\n\n| Location | Annual Cost | FI Number |\n|----------|------------|----------|\n| San Francisco, USA | $55,000–$70,000 | $1.375M–$1.75M |\n| New York City, USA | $50,000–$65,000 | $1.25M–$1.625M |\n| Austin, Texas | $38,000–$48,000 | $950K–$1.2M |\n| Lisbon, Portugal | $22,000–$30,000 | $550K–$750K |\n| Barcelona, Spain | $24,000–$32,000 | $600K–$800K |\n| Chiang Mai, Thailand | $12,000–$18,000 | $300K–$450K |\n| Medellín, Colombia | $14,000–$20,000 | $350K–$500K |\n| Tbilisi, Georgia | $10,000–$16,000 | $250K–$400K |\n\n**What you get for the money:**\nIn Chiang Mai at $15,000/year, a single person can afford:\n- Modern 1–2 bedroom apartment in a good neighborhood: $400–$600/month\n- Restaurant meals (quality Thai food): $2–$5\n- Private health insurance: $100–$200/month (high quality)\n- Unlimited fresh fruit, vegetables, and local cuisine\n- Gym membership: $20–$40/month\n- Reliable high-speed internet: $20–$30/month",
          highlight: ["geographic arbitrage", "geoarbitrage", "cost of living", "FI number reduction", "international FIRE"],
        },
        {
          type: "teach",
          title: "Residency Options and Visa Strategies",
          content:
            "The legal infrastructure for long-term international living has expanded dramatically in the past decade. Many countries now actively compete for FIRE retirees and remote workers.\n\n**Passive Income / Retirement Visas:**\n\n**Portugal D7 Passive Income Visa:**\n- Requirement: ~€760/month passive income (~$820)\n- Benefits: 2-year renewable visa, path to permanent residency and citizenship in 5 years\n- Tax treaty: Non-Habitual Resident (NHR) program offered 10 years of 0–10% tax on foreign income (being phased out, check current status)\n- Cost of living: €1,500–€2,000/month in Lisbon\n\n**Spain Non-Lucrative Visa:**\n- Requirement: €27,115/year income (~$29,000) for individual\n- Benefits: 1-year renewable, path to residency\n- Notable: Spanish is widely spoken, excellent healthcare, rich culture\n\n**Thailand Long-Term Resident (LTR) Visa:**\n- Requirement: $80,000/year passive income OR $250,000 in savings\n- Benefits: 10-year visa, 17% flat income tax rate on Thai-source income\n- Widely popular in FIRE community: affordable, excellent food, high-quality healthcare\n\n**Mexico Temporary Residency:**\n- Requirement: ~$2,800/month income\n- Very accessible from the US (time zone, proximity, culture)\n- No-fly-zones: popular areas like Mexico City, Oaxaca, Puerto Escondido\n\n**Tax considerations:**\n- US citizens are taxed on worldwide income regardless of residency (unlike most countries)\n- Foreign Earned Income Exclusion (FEIE): excludes up to $120,000 (2023) of earned income if living abroad\n- Investment income, dividends, and capital gains are NOT covered by FEIE — US taxes still apply\n- Some countries have territorial tax systems — only taxing local income",
          highlight: ["Portugal D7", "digital nomad visa", "Non-Habitual Resident", "residency options", "tax considerations"],
        },
        {
          type: "teach",
          title: "Practical Geoarbitrage Planning",
          content:
            "Successful geoarbitrage requires more than just finding a cheap country. Here is a systematic approach to planning and executing international FIRE.\n\n**Step 1: Define your lifestyle requirements**\n- Climate preferences (tropical, Mediterranean, four seasons?)\n- Healthcare needs (critical if older or with conditions)\n- Language comfort (English widely spoken? Language learning required?)\n- Social connections (expat community? Local integration?)\n- Activities (beach, mountains, cities, outdoor sports?)\n\n**Step 2: Research candidates (3–6 months)**\n- Use Numbeo.com for cost of living comparisons\n- Read expat forums (Expatistan, reddit r/expats, country-specific subs)\n- Join Facebook groups for your target countries\n- Research healthcare quality and cost (international health insurance: $100–$400/month)\n\n**Step 3: Test before committing (slow travel)**\nDo NOT immediately sell your US home and move permanently. Instead:\n- Spend 1–3 months in each candidate country\n- Rent furnished apartments (Airbnb, furnished finder)\n- Experience different seasons\n- Evaluate healthcare access, local culture, logistics\n- Talk to long-term expats about the reality vs expectation gap\n\n**Step 4: Optimize your financial structure**\n- Schwab or Fidelity international checking accounts (no foreign ATM fees)\n- Wise (formerly TransferWise) for international money transfers\n- Maintain US credit cards for large purchases and travel benefits\n- Keep US address (mail forwarding service) for tax and banking purposes\n\n**The geo-flexibility option:**\nMany FIRE practitioners spend 6 months in a low-cost country and 6 months in the US/Europe. This hybrid approach provides:\n- Lifestyle flexibility (see family, maintain US connections)\n- Average cost reduction of 30–40%\n- No need to fully commit to permanent relocation",
          highlight: ["lifestyle requirements", "slow travel", "test before committing", "expat community", "geo-flexibility"],
        },
        {
          type: "quiz-mc",
          question:
            "A US-based FIRE investor is considering relocating to Portugal. Their current US annual spending is $60,000 (FI number: $1,500,000). In Lisbon, they can maintain the same lifestyle for $25,000/year. What is the combined impact on their FI number AND how much sooner could they retire if they currently save $30,000/year with a $400,000 portfolio?",
          options: [
            "FI number drops by $875,000 to $625,000; with $30K/year savings and 7% returns they are already past their new FI number and could retire immediately",
            "FI number drops by $875,000 to $625,000 but they still need 5 more years to reach the target",
            "FI number only drops by $100,000 since international living has many hidden costs that offset the savings",
            "FI number is unchanged since US taxes apply to worldwide income regardless of residence",
          ],
          correctIndex: 0,
          explanation:
            "The FI number drops from $1,500,000 ($60,000 × 25) to $625,000 ($25,000 × 25) — a reduction of $875,000. With a current portfolio of $400,000, the investor only needs $225,000 more to reach their new $625,000 target. At $30,000/year savings plus 7% portfolio growth on $400,000 ($28,000/year), they accumulate roughly $58,000/year net — reaching $625,000 in under 4 additional years. Compared to the original plan (needing $1.1M more at $58K/year = ~13 years), geoarbitrage compresses the timeline by nearly a decade.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "US citizens who relocate abroad and earn no income in the United States can legally avoid paying US federal taxes on their investment portfolio dividends and capital gains by establishing foreign residency.",
          correct: false,
          explanation:
            "The United States taxes citizens on worldwide income regardless of where they live — one of only two countries in the world (with Eritrea) that does this. US citizens living abroad must still file US tax returns and pay US taxes on dividends, interest, and capital gains from their investment portfolios. The Foreign Earned Income Exclusion (FEIE) only applies to earned income (wages, freelance), not passive investment income. To legally eliminate US tax obligations, a citizen must formally renounce US citizenship — an irreversible and complex process.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Marcus is 38 years old with a $750,000 portfolio and $35,000/year in annual expenses. He lives in the US. His portfolio grows at 7% annually and he saves an additional $25,000/year. He is considering moving to Southeast Asia where his lifestyle would cost $16,000/year.",
          question:
            "Which analysis best describes the financial impact of Marcus's geoarbitrage move?",
          options: [
            "His FI number drops from $875,000 to $400,000. Since his $750,000 portfolio already exceeds $400,000, Marcus has already reached FI and could retire immediately in Southeast Asia",
            "His FI number drops from $875,000 to $400,000, but he needs to wait 3 more years to account for tax implications and transition costs",
            "The move has minimal financial impact since $750,000 is close to his US FI number of $875,000 anyway",
            "His FI number only changes if he formally renounces US citizenship and gives up Social Security benefits",
          ],
          correctIndex: 0,
          explanation:
            "Marcus's FI number based on US spending is $35,000 × 25 = $875,000. His FI number based on Southeast Asia spending is $16,000 × 25 = $400,000. His current portfolio of $750,000 already exceeds $400,000 by $350,000 — meaning he is already financially independent if he is willing to live in Southeast Asia. The 4% safe withdrawal from $750,000 provides $30,000/year — well above his $16,000 annual need in Southeast Asia, with a very safe 2.1% withdrawal rate. He could retire today, roughly 2–3 years before he could in the US.",
          difficulty: 2,
        },
      ],
    },
  ],
};
