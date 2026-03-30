import type { Unit } from "./types";

export const UNIT_TAX_PLANNING: Unit = {
  id: "tax-planning",
  title: "Tax Planning & Optimization",
  description:
    "Master capital gains, tax-loss harvesting, Roth conversions, business tax strategies, and international tax planning",
  icon: "Receipt",
  color: "#10b981",
  lessons: [
    // ─── Lesson 1: Capital Gains Optimization ────────────────────────────────────
    {
      id: "tax-planning-1",
      title: " Capital Gains Optimization",
      description:
        "Short-term vs long-term rates, NIIT, wash sale rule, lot selection, tax-gain harvesting, and opportunity zones",
      icon: "TrendingUp",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⏱️ Short-Term vs Long-Term Capital Gains",
          content:
            "**Capital gains** are profits from selling appreciated assets. The tax rate depends critically on how long you held the asset.\n\n**Short-Term Capital Gains (STCG):**\n- Assets held **≤ 1 year** before selling\n- Taxed as **ordinary income** — same rate as your salary (10%, 12%, 22%, 24%, 32%, 35%, or 37%)\n- No preferential treatment\n\n**Long-Term Capital Gains (LTCG):**\n- Assets held **> 1 year** before selling\n- Preferential rates: **0%, 15%, or 20%** depending on taxable income\n\n**2024 LTCG rate thresholds (single filers):**\n| Rate | Taxable Income |\n|------|----------------|\n| 0%   | ≤ $47,025      |\n| 15%  | $47,026–$518,900 |\n| 20%  | > $518,900     |\n\n**For married filing jointly:** 0% threshold is $94,050; 15% up to $583,750.\n\n**Holding period strategy:** The difference between holding 11 months and 13 months on a $50,000 gain can mean the difference between paying $11,000 in tax (22% ordinary rate) and $7,500 (15% LTCG rate) — a $3,500 savings for waiting 2 months.",
          highlight: [
            "short-term",
            "long-term",
            "hold >1 year",
            "0%, 15%, or 20%",
            "ordinary income",
            "preferential rates",
          ],
        },
        {
          type: "teach",
          title: " Net Investment Income Tax (NIIT)",
          content:
            "The **Net Investment Income Tax (NIIT)** is an additional 3.8% Medicare surtax on investment income for higher-income taxpayers — layered on top of regular capital gains rates.\n\n**Who owes NIIT:**\n- Single filers: Modified AGI exceeds **$200,000**\n- Married filing jointly: Modified AGI exceeds **$250,000**\n- Married filing separately: $125,000\n\n**What counts as net investment income:**\n- Capital gains (short and long-term)\n- Dividends and interest\n- Rental income (unless material participation)\n- Passive business income\n\n**What is excluded:**\n- Wages, self-employment income\n- Active business income\n- Tax-exempt interest (municipal bonds)\n- Distributions from qualified retirement plans (401k, IRA)\n\n**NIIT is applied to the lesser of:**\n1. Your net investment income, OR\n2. The amount your MAGI exceeds the threshold\n\n**Effective top rate on LTCG:** 20% + 3.8% NIIT = **23.8%** for high earners. For STCG: 37% + 3.8% = **40.8%**.\n\n**Planning:** Municipal bond interest avoids NIIT entirely — useful for investors above the MAGI threshold.",
          highlight: [
            "NIIT",
            "3.8%",
            "$200,000",
            "$250,000",
            "investment income",
            "municipal bonds",
            "23.8%",
          ],
        },
        {
          type: "teach",
          title: "🚫 Wash Sale Rule",
          content:
            "The **wash sale rule** (IRC §1091) disallows a capital loss deduction if you buy a **substantially identical** security within 30 days before or after the sale at a loss.\n\n**The 61-day window:** 30 days before the loss sale + the day of sale + 30 days after = 61-day window total.\n\n**What counts as substantially identical:**\n- The exact same stock or security\n- Options or warrants on the same stock\n- Convertible bonds in the same company\n\n**What is NOT substantially identical (safe to buy):**\n- A competitor in the same sector (sold Ford, bought GM)\n- An ETF holding a sector broadly (sold Apple, bought a tech ETF)\n- A different S&P 500 ETF (sold IVV, bought VOO — technically could trigger wash sale; use caution)\n\n**What happens when wash sale is triggered:**\n- The disallowed loss is added to the cost basis of the new shares\n- Loss is not permanently lost — it defers until the replacement shares are sold\n- Holding period of original shares carries over\n\n**Wash sale in IRA trap:** Selling a stock at a loss in a taxable account and buying the same stock within 30 days in an **IRA** triggers a wash sale — and in this case the loss is **permanently lost** (cannot adjust IRA cost basis).",
          highlight: [
            "wash sale",
            "substantially identical",
            "30 days",
            "61-day window",
            "disallowed loss",
            "IRA trap",
            "cost basis",
          ],
        },
        {
          type: "teach",
          title: " Specific Lot Selection & Tax-Gain Harvesting",
          content:
            "**Specific lot identification** lets you choose exactly which shares you are selling when you have purchased the same stock at different times and prices.\n\n**Default IRS methods:**\n- **FIFO (First In, First Out):** Oldest shares sold first — often creates larger gains on appreciated positions\n- **Specific identification:** You designate which lots to sell — requires confirmation from broker at time of sale\n\n**Tax-minimizing lot strategies:**\n- **Sell highest-cost lots first:** Minimizes current capital gain\n- **Sell short-term loss lots before long-term:** Harvests short-term losses that offset ordinary income\n- **Sell long-term gain lots:** Even if gains are realized, LTCG rates are lower than STCG\n\n**Tax-Gain Harvesting — the reverse strategy:**\nIn years when your taxable income is low enough to qualify for the **0% LTCG rate**, intentionally realize capital gains at no federal tax cost.\n\n- Reset cost basis higher (reduces future taxable gains)\n- Example: Married couple, $80,000 taxable income — qualifies for 0% LTCG rate up to $94,050. Can realize up to $14,050 in LTCG completely tax-free.\n\n**Opportunity Zones:**\n- Invest capital gains in a **Qualified Opportunity Zone (QOZ) fund** within 180 days of sale\n- **Defer** gain recognition until 2026 (or fund sale, whichever is earlier)\n- **Exclude** up to 10% of deferred gain if held 5 years; 15% if 7 years\n- **Exclude 100%** of appreciation on QOZ investment itself if held 10+ years",
          highlight: [
            "specific lot identification",
            "FIFO",
            "highest-cost lots",
            "tax-gain harvesting",
            "0% LTCG",
            "Opportunity Zone",
            "QOZ",
            "defer",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A married couple filing jointly has $80,000 in taxable income (after deductions). They sell stock they have held for 18 months with a $10,000 long-term capital gain. The 0% LTCG threshold for married filing jointly is $94,050.",
          question: "What federal capital gains tax rate applies to this $10,000 gain?",
          options: [
            "0% — their total income including the gain ($90,000) remains below the $94,050 threshold",
            "15% — the standard rate for most middle-income filers",
            "22% — ordinary income rate applies since they are middle class",
            "3.8% NIIT applies because the gain pushes them over $200,000",
          ],
          correctIndex: 0,
          explanation:
            "The couple's taxable income before the gain is $80,000. Adding the $10,000 LTCG brings their total to $90,000 — still below the $94,050 threshold for the 0% LTCG rate for married filers. The entire $10,000 gain is taxed at 0% federal. They also do not owe NIIT, as that only applies above $250,000 MAGI for joint filers. This is a textbook tax-gain harvesting opportunity.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "If you sell shares of Apple at a loss and purchase an S&P 500 ETF (like SPY) the next day, the wash sale rule is definitively triggered because Apple is a large component of the S&P 500.",
          correct: false,
          explanation:
            "False. A broad market ETF like SPY is generally not considered 'substantially identical' to a single stock like Apple, even if Apple is a top holding. The wash sale rule targets the same security or nearly identical instruments. Selling Apple and buying SPY is a common tax-loss harvesting technique. However, selling SPY and immediately buying a nearly identical S&P 500 ETF (like IVV or VOO) is a grayer area that some advisors avoid out of caution.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Tax-Loss Harvesting ───────────────────────────────────────────
    {
      id: "tax-planning-2",
      title: "🌾 Tax-Loss Harvesting",
      description:
        "Mechanics of TLH, the $3,000 ordinary income offset, automated harvesting, wash sale traps, and international TLH",
      icon: "Scissors",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: " Mechanics of Tax-Loss Harvesting",
          content:
            "**Tax-loss harvesting (TLH)** is the deliberate sale of investments at a loss to generate a tax deduction, while maintaining market exposure by immediately buying a similar (but not identical) replacement.\n\n**Step-by-step process:**\n1. Identify positions with unrealized losses\n2. Sell the losing position — realize the capital loss\n3. Immediately buy a similar asset to maintain your investment exposure\n4. The realized loss offsets capital gains on your tax return\n\n**How losses offset taxes:**\n- Capital losses first offset capital gains of the same type (short vs long)\n- Short-term losses first offset short-term gains; long-term losses offset long-term gains\n- Net losses can then offset gains of the other type\n- Any remaining net loss offsets **ordinary income** up to $3,000/year\n- Additional losses carry forward to future tax years indefinitely\n\n**Example:**\n- Sold Stock A for a $12,000 long-term gain\n- Sold Stock B for an $8,000 long-term loss\n- Net LTCG = $4,000 — taxed at 15% = $600 owed (vs $1,800 without harvesting)\n- Tax savings: $1,200 in the year of harvest\n\n**The replacement rule:** You must buy something *similar but not identical* to avoid the wash sale rule. Sold a total stock market ETF? Buy a different total market ETF from another provider.",
          highlight: [
            "tax-loss harvesting",
            "$3,000",
            "offset",
            "capital gains",
            "carry forward",
            "replacement",
            "wash sale",
          ],
        },
        {
          type: "teach",
          title: " Annual Savings & After-Tax Return Improvement",
          content:
            "**The $3,000 ordinary income offset:**\nIf capital losses exceed capital gains in a year, up to **$3,000 of net losses** can be deducted against ordinary income (wages, salaries, business income).\n\n- In the 22% bracket: $3,000 deduction saves **$660** in federal taxes\n- In the 32% bracket: $3,000 deduction saves **$960** in federal taxes\n- Excess losses carry forward to future years with no expiration\n\n**Carry-forward example:**\n- Year 1: $15,000 net capital loss\n- Year 1: Use $3,000 against ordinary income → $12,000 carried forward\n- Year 2: $5,000 capital gain → $12,000 carryforward wipes it out, $7,000 remains\n- Year 2: Use $3,000 against ordinary income → $4,000 carried forward\n\n**After-tax return improvement from TLH:**\nSystematic annual tax-loss harvesting improves after-tax returns by an estimated **0.5% to 1.5% annually**, depending on portfolio volatility and tax situation.\n\n**Why volatility matters:** More volatile assets create more harvesting opportunities. In a flat market with no losses, TLH adds nothing. In a volatile market with frequent dips, systematic TLH captures losses throughout the year.\n\n**Robo-advisor advantage:** Platforms like Betterment and Wealthfront harvest losses *daily* by monitoring every position — a scale and speed advantage vs manual quarterly reviews.",
          highlight: [
            "$3,000",
            "ordinary income",
            "carry forward",
            "0.5% to 1.5%",
            "after-tax return",
            "robo-advisor",
            "daily harvesting",
          ],
        },
        {
          type: "teach",
          title: " Automated TLH & Wash Sale Traps",
          content:
            "**Automated Tax-Loss Harvesting (Robo-Advisors):**\nRobo-advisors like Betterment, Wealthfront, and Schwab Intelligent Portfolios scan portfolios daily for harvesting opportunities.\n\n**How automated TLH works:**\n- System detects when a position falls below its cost basis by a threshold (e.g., 2–5%)\n- Automatically sells the losing position\n- Simultaneously buys a pre-selected similar replacement ETF\n- Tracks holding periods to qualify losses as long-term when possible\n\n**Scale advantage:** A human investor might harvest losses quarterly. A robo-advisor captures intraday and daily dips throughout the year — especially valuable in volatile markets.\n\n**Critical wash sale traps to avoid:**\n\n1. **Cross-account wash sales:** Sold VTI at a loss in taxable account → bought VTI in your IRA within 30 days = wash sale. The IRA purchase is the new purchase.\n\n2. **Automatic dividend reinvestment:** If your taxable account auto-reinvests dividends from the same fund you just sold at a loss within the 30-day window → wash sale triggered on the reinvested shares.\n\n3. **Spouse's accounts count:** If you sell at a loss and your spouse buys substantially identical securities — that is a wash sale.\n\n4. **IRA wash sale is permanent loss:** Normal wash sales defer the loss to the replacement shares. IRA wash sales permanently destroy the loss — you cannot adjust IRA cost basis.",
          highlight: [
            "automated TLH",
            "robo-advisor",
            "daily scanning",
            "cross-account",
            "IRA wash sale",
            "permanent loss",
            "dividend reinvestment",
          ],
        },
        {
          type: "teach",
          title: " International Tax-Loss Harvesting",
          content:
            "**International TLH** applies the same loss-harvesting logic to foreign and emerging market holdings — often with richer harvesting opportunities due to higher volatility.\n\n**Why international markets offer more TLH opportunities:**\n- Emerging markets (EM) experience larger and more frequent drawdowns\n- Currency fluctuations add a second source of losses\n- Divergent economic cycles from US markets mean foreign funds may be down when US markets are up\n\n**Common international TLH pairs:**\n| Sold (at a loss)         | Replacement (similar, not identical) |\n|--------------------------|---------------------------------------|\n| VWO (Vanguard EM ETF)    | IEMG (iShares Core EM ETF)           |\n| EFA (iShares EAFE)       | VEA (Vanguard Developed Markets)     |\n| IEFA (iShares Core EAFE) | SCHF (Schwab International Equity)   |\n\n**Foreign Tax Credit interaction:**\nForeign dividends often have taxes withheld by the foreign government. The Foreign Tax Credit (FTC) reduces your US tax liability by the amount of foreign taxes paid. TLH harvesting does not affect your ability to claim FTCs.\n\n**Year-end EM selloffs:** Emerging market funds often sell off in Q4 during risk-off environments. This creates systematic opportunities to harvest EM losses and rotate into equivalent EM exposure through a different fund.",
          highlight: [
            "international TLH",
            "emerging markets",
            "currency fluctuations",
            "VWO",
            "IEMG",
            "Foreign Tax Credit",
            "Q4 selloffs",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor realizes a $15,000 capital loss in a year with no other capital gains. How much can offset ordinary income this year, and what happens to the remainder?",
          options: [
            "$3,000 offsets ordinary income; $12,000 carries forward to future years",
            "$15,000 all offsets ordinary income in the current year",
            "$3,000 offsets ordinary income; $12,000 is permanently lost",
            "None of it can offset ordinary income — capital losses only offset capital gains",
          ],
          correctIndex: 0,
          explanation:
            "The IRS allows up to $3,000 of net capital losses to offset ordinary income per year. The remaining $12,000 carries forward indefinitely. In future years, the carryforward first offsets capital gains, and any remaining balance can again offset up to $3,000 of ordinary income per year. Capital loss carryforwards never expire under current law.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Maria sold VXUS (Total International Stock ETF) at a $5,000 loss in her taxable account on December 5. She wants to maintain international stock exposure. Her IRA also holds VXUS.",
          question: "Which action would trigger a wash sale and permanently destroy the tax loss?",
          options: [
            "Buying IXUS (iShares Core MSCI Total International ETF) in the taxable account on December 6",
            "Buying VXUS in her IRA on December 10",
            "Waiting 31 days and then buying VXUS again in the taxable account",
            "Buying VEA (Vanguard Developed Markets) in the taxable account on December 6",
          ],
          correctIndex: 1,
          explanation:
            "Buying VXUS in the IRA within 30 days triggers a wash sale. Critically, because the replacement purchase is in an IRA, the disallowed loss is permanently lost — you cannot adjust the IRA's cost basis. Cross-account wash sales (taxable → IRA) are a common and costly mistake. The other options are safe: IXUS and VEA are not substantially identical to VXUS, and waiting 31 days clears the wash sale window.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Roth Conversion Strategies ────────────────────────────────────
    {
      id: "tax-planning-3",
      title: " Roth Conversion Strategies",
      description:
        "Traditional vs Roth, conversion mechanics, bracket bumping, pro-rata rule, and backdoor Roth IRA",
      icon: "RefreshCw",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⚖️ Traditional vs Roth: Tax Now or Later",
          content:
            "The fundamental choice in tax-advantaged retirement accounts is **when** you pay taxes:\n\n**Traditional IRA / 401(k) — Tax Deferred:**\n- Contributions may be tax-deductible (reduces taxable income today)\n- Money grows tax-deferred (no annual taxes on dividends, interest, gains)\n- Withdrawals in retirement taxed as ordinary income\n- Required Minimum Distributions (RMDs) begin at age 73\n- **Best when:** You are in a high tax bracket now and expect lower rates in retirement\n\n**Roth IRA / Roth 401(k) — Tax Free:**\n- Contributions made with after-tax dollars (no deduction)\n- Money grows completely tax-free\n- Qualified withdrawals in retirement are tax-free\n- No RMDs during the owner's lifetime\n- **Best when:** You are in a low tax bracket now and expect higher rates in retirement\n\n**Key insight: Tax diversification**\nHaving both traditional and Roth accounts gives you flexibility to manage taxable income in retirement — withdraw from traditional when in a low bracket, from Roth when in a high bracket. This is the dominant strategy for most investors.\n\n**The break-even question:** Roth wins if your retirement tax rate > your current tax rate. Traditional wins if your current rate > your retirement rate. When uncertain, diversify across both.",
          highlight: [
            "traditional",
            "Roth",
            "tax-deferred",
            "tax-free",
            "RMD",
            "tax diversification",
            "ordinary income",
          ],
        },
        {
          type: "teach",
          title: "🔁 Roth Conversion: Mechanics & Optimal Windows",
          content:
            "A **Roth conversion** moves money from a traditional IRA (or other pre-tax account) to a Roth IRA. You pay ordinary income tax on the converted amount in the year of conversion — permanently eliminating future taxes on that balance.\n\n**Why convert?**\n- Future withdrawals from Roth are tax-free (including all investment growth)\n- Eliminates RMDs — no forced withdrawals at 73\n- Reduces taxable estate (Roth assets pass to heirs income-tax-free)\n- Locks in today's tax rates if you expect rates to rise\n\n**Optimal conversion windows:**\n\n1. **Early retirement before Social Security / RMDs:** Often a low-income \"sweet spot\" — no wages, SS not yet started, RMDs not yet required. Convert large amounts at low rates.\n\n2. **Low-income years:** Job loss, sabbatical, business startup loss, large deductions — any year with temporarily depressed income is an opportunity.\n\n3. **Market downturns:** Converting when account values are depressed means you pay tax on a smaller amount while getting tax-free growth on the recovery.\n\n**Roth conversion is permanent:** Once converted, it cannot be reversed (the recharacterization option was eliminated by the Tax Cuts and Jobs Act of 2017).\n\n**Tax payment:** Ideally pay the conversion tax from non-IRA funds. Using IRA funds to pay the tax wastes the compounding benefit and may trigger a 10% early withdrawal penalty if under 59½.",
          highlight: [
            "Roth conversion",
            "ordinary income tax",
            "optimal windows",
            "RMDs",
            "low-income years",
            "market downturn",
            "pay tax from outside",
          ],
        },
        {
          type: "teach",
          title: "📐 Bracket Bumping & Pro-Rata Rule",
          content:
            "**Bracket Bumping Strategy:**\nConvert just enough to fill up your current tax bracket without spilling into the next bracket.\n\n**Example:** Married couple, $60,000 ordinary income. The 22% bracket tops at $94,300 (2024). They have $200,000 in a traditional IRA.\n- Room to convert: $94,300 − $60,000 = **$34,300** at 22%\n- Convert $34,300, pay $7,546 in tax (22%)\n- The $34,300 now grows tax-free forever\n- Repeat annually until the traditional IRA is converted or brackets change\n\n**Pro-Rata Rule — the Backdoor Roth complication:**\nIf you have any **pre-tax IRA balance** (traditional, SEP, or SIMPLE IRA), the IRS requires you to calculate conversion taxes using a blended ratio:\n\nTaxable % = Pre-tax IRA balance ÷ Total IRA balance\n\n**Example:** You have $90,000 in a pre-tax traditional IRA and contribute $7,000 in a non-deductible (after-tax) IRA. Total IRA = $97,000.\n- Pre-tax ratio = $90,000 / $97,000 = 92.8%\n- If you convert the $7,000 non-deductible contribution: 92.8% × $7,000 = $6,494 is **taxable**\n- You cannot isolate just the after-tax dollars\n\n**Pro-rata workaround:** Roll pre-tax IRA balance into a 401(k) (if your plan accepts rollovers). This zeroes out the pre-tax IRA balance, making backdoor Roth clean.",
          highlight: [
            "bracket bumping",
            "fill up bracket",
            "pro-rata rule",
            "pre-tax IRA",
            "blended ratio",
            "backdoor Roth",
            "rollover to 401(k)",
          ],
        },
        {
          type: "teach",
          title: "🚪 Backdoor Roth IRA",
          content:
            "The **Backdoor Roth IRA** is a legal strategy for high earners who exceed the Roth IRA income limits to make indirect Roth contributions.\n\n**2024 Roth IRA income limits:**\n- Single: Phase-out begins at $146,000, ineligible above $161,000\n- Married filing jointly: Phase-out $230,000–$240,000\n\n**Backdoor Roth process:**\n1. Make a **non-deductible contribution** to a traditional IRA ($7,000 for 2024; $8,000 if 50+)\n2. Wait a short period (days to weeks) — do NOT invest the funds\n3. **Convert** the traditional IRA balance to Roth IRA\n4. File IRS **Form 8606** to document the non-deductible basis\n\n**Tax result:** If done cleanly (no other pre-tax IRA balances), the conversion is tax-free because the contribution was already after-tax.\n\n**Step transaction doctrine risk:** The IRS could theoretically challenge the backdoor Roth as a \"step transaction\" circumventing the income limits. In practice, this strategy has been widely used for 15+ years and Congress has declined to eliminate it, implicitly endorsing it.\n\n**Mega Backdoor Roth (for 401k plans that allow it):**\n- After-tax contributions up to the 401(k) annual limit ($69,000 in 2024)\n- In-plan Roth conversion or in-service withdrawal to Roth IRA\n- Can move up to ~$46,000/year more into Roth (beyond regular contributions)\n- Requires plan to allow after-tax contributions and in-service distributions",
          highlight: [
            "backdoor Roth",
            "non-deductible contribution",
            "Form 8606",
            "income limits",
            "$161,000",
            "mega backdoor Roth",
            "step transaction",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor converts $50,000 from a traditional IRA to a Roth IRA. Their marginal federal income tax rate is 22%. They pay the conversion tax from money in a separate taxable savings account. What is the approximate federal tax cost of this conversion?",
          options: [
            "$11,000 — 22% of $50,000, paid from outside funds",
            "$5,500 — only half the conversion is taxable",
            "$0 — Roth conversions are always tax-free",
            "$11,000 plus a 10% penalty since early withdrawals are penalized",
          ],
          correctIndex: 0,
          explanation:
            "The full $50,000 converted from a pre-tax traditional IRA is taxable as ordinary income at the 22% marginal rate: 22% × $50,000 = $11,000. Since the tax is paid from a separate savings account (not from the IRA), no 10% early withdrawal penalty applies — the penalty only applies to distributions from the IRA itself before age 59½. Paying the tax bill from outside funds is the preferred approach because it preserves the full $50,000 growing tax-free inside the Roth.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The pro-rata rule only applies to backdoor Roth conversions, not to regular Roth conversions of a traditional IRA.",
          correct: false,
          explanation:
            "False. The pro-rata rule applies to ALL Roth conversions whenever an individual has both pre-tax and after-tax (non-deductible) dollars in IRAs. The IRS treats all IRA balances as one pool — you cannot selectively convert only the after-tax portion. The rule is particularly visible in the backdoor Roth context, but it applies universally to any situation with mixed pre-tax and after-tax IRA funds.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Business Tax Strategies ───────────────────────────────────────
    {
      id: "tax-planning-4",
      title: "🏢 Business Tax Strategies",
      description:
        "Entity selection, QBI deduction, Solo 401(k), depreciation rules, home office, and the Augusta Rule",
      icon: "Building2",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " Entity Selection: Tax Implications",
          content:
            "Your business entity structure has profound tax consequences:\n\n**Sole Proprietorship:**\n- All net profit subject to **self-employment tax** (15.3% on first $168,600; 2.9% above)\n- Income and SE tax reported on Schedule C / Schedule SE\n- No liability protection\n- Simplest — no separate filing required\n\n**S-Corporation:**\n- **Payroll tax savings strategy:** Owner must take a \"reasonable salary\" (subject to FICA/payroll taxes)\n- Remaining profit passes through as a distribution — **not subject to payroll taxes**\n- Example: Business earns $180,000. Reasonable salary $80,000 (15.3% SE tax = $12,240). $100,000 distribution: no payroll tax → saves ~$15,300\n- Requires payroll setup, quarterly filings, and more administration\n- Best for businesses earning $60,000+ net profit\n\n**C-Corporation:**\n- 21% flat corporate tax rate (TCJA 2017)\n- Subject to double taxation: corporate tax on profits + individual tax on dividends\n- Can deduct broad benefits (health insurance, retirement plans) at corporate level\n- Useful for businesses retaining earnings for reinvestment rather than distributing\n\n**LLC:**\n- Default: taxed as sole prop (single-member) or partnership (multi-member)\n- Can elect S-corp or C-corp taxation\n- Provides liability protection with pass-through taxation flexibility",
          highlight: [
            "S-corporation",
            "reasonable salary",
            "payroll tax savings",
            "distribution",
            "C-corp",
            "21% flat rate",
            "double taxation",
            "pass-through",
          ],
        },
        {
          type: "teach",
          title: "✂️ QBI Deduction & Solo 401(k)",
          content:
            "**Section 199A Qualified Business Income (QBI) Deduction:**\nPass-through business owners (sole props, partnerships, S-corps, LLCs) may deduct up to **20% of qualified business income** from federal taxable income.\n\n**Basic calculation:** QBI deduction = 20% × (lesser of QBI or taxable income)\n\n**Income phase-in limits (2024):**\n- Below $191,950 (single) / $383,900 (joint): Full 20% deduction available\n- Above thresholds: W-2 wage limitations apply; Specified Service Trades (doctors, lawyers, consultants) may be excluded\n- Above $241,950 / $483,900: SST businesses receive zero QBI deduction\n\n**Impact:** A business owner with $150,000 QBI deducts $30,000, saving ~$6,600 in tax at the 22% bracket.\n\n---\n\n**Solo 401(k) — Retirement Supercharger for Self-Employed:**\nThe most powerful retirement vehicle for self-employed individuals with no full-time employees.\n\n**Dual contribution capacity:**\n1. **Employee contribution:** Up to $23,000 ($30,500 if 50+) — same as a regular 401(k)\n2. **Employer contribution:** Up to 25% of **net self-employment income** (after deducting half of SE tax)\n3. **Combined limit:** $69,000 total for 2024 ($76,500 if 50+)\n\n**Example:** Freelancer earns $120,000 net SE income.\n- Employee: $23,000\n- Employer: 25% × (~$113,000 adjusted) = $28,250\n- Total contribution: ~$51,250 → massive tax deduction",
          highlight: [
            "QBI deduction",
            "Section 199A",
            "20%",
            "pass-through",
            "Solo 401(k)",
            "employee contribution",
            "employer contribution",
            "$69,000",
          ],
        },
        {
          type: "teach",
          title: " Depreciation: Section 179 & Bonus Depreciation",
          content:
            "**Depreciation** allows businesses to deduct the cost of business assets over time. Two accelerated methods let you deduct the full cost in the year of purchase:\n\n**Section 179 Expensing:**\n- Immediately deduct the full cost of qualifying business property\n- **2024 limit:** Up to **$1,160,000** in property expensed in one year\n- Phase-out begins when total property placed in service exceeds $2,890,000\n- Cannot create a net business loss (limited to taxable income from active business)\n- Covers: equipment, machinery, software, vehicles (subject to luxury auto limits), office furniture\n\n**Bonus Depreciation (Additional First-Year Depreciation):**\n- Deduct a percentage of new AND used qualifying property in the year placed in service\n- **Phase-out schedule:** 100% (2022) → 80% (2023) → **60% (2024)** → 40% (2025) → 20% (2026) → 0% (2027+)\n- Unlike Section 179, bonus depreciation **can** create a net operating loss (NOL) — which can be carried forward\n- Applies to 5/7/15-year MACRS property\n\n**Luxury Auto Limits:** Passenger vehicles have annual depreciation caps (~$12,200 first year for standard vehicles). Heavy SUVs (>6,000 lb GVWR) are not subject to these caps and can use Section 179 up to $28,900.\n\n**Planning tip:** Combine Section 179 with bonus depreciation. Use Section 179 first to absorb income to zero, then use bonus depreciation (which can go negative).",
          highlight: [
            "Section 179",
            "$1,160,000",
            "bonus depreciation",
            "60% in 2024",
            "phase-out",
            "net operating loss",
            "heavy SUV",
          ],
        },
        {
          type: "teach",
          title: " Home Office & Augusta Rule",
          content:
            "**Home Office Deduction:**\nIf you use part of your home **regularly and exclusively** for business, you may deduct home office expenses.\n\n**Two methods:**\n\n1. **Simplified method:** $5 per square foot, up to 300 sq ft = maximum **$1,500** deduction\n   - Easy calculation, no depreciation recapture on sale\n\n2. **Regular method (actual expenses):**\n   - Calculate the percentage of home used for business (office sq ft ÷ total home sq ft)\n   - Apply that percentage to: rent/mortgage interest, utilities, insurance, repairs\n   - Can deduct depreciation on the business-use portion of the home\n   - More paperwork; depreciation recapture tax on sale (25% on depreciated amount)\n\n**W-2 employees:** Cannot deduct home office expenses under current law (TCJA suspended this through 2025).\n\n---\n\n**The Augusta Rule (IRC §280A(g)):**\nYou can rent your home to your **own business** for up to **14 days per year** completely tax-free to you personally — the income does not appear on your return.\n\n**How it works:**\n- Your S-corp or LLC pays rent for legitimate business use of your home (board meetings, strategy sessions, client entertainment)\n- The business deducts the rent as an ordinary business expense\n- You receive the rental income tax-free (under the 14-day personal use exception)\n\n**Documentation required:** Written rental agreement, market-rate rent (use comparable venues), minutes documenting the meetings, calendar evidence. Aggressive use without documentation invites audit.",
          highlight: [
            "home office",
            "regular and exclusive",
            "simplified method",
            "$5 per square foot",
            "Augusta Rule",
            "14 days",
            "tax-free",
            "IRC §280A",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "An S-corp owner's business earns $120,000 in profit. The owner decides to take a $60,000 reasonable salary (subject to payroll taxes) and $60,000 as a pass-through distribution (not subject to payroll taxes). Combined employee + employer payroll tax rate is approximately 15.3%.",
          question: "Compared to taking the full $120,000 as salary (sole proprietor style), how much in payroll taxes does the S-corp structure save?",
          options: [
            "Approximately $9,180 — payroll taxes saved on the $60,000 distribution",
            "Approximately $18,360 — full payroll taxes saved on all $120,000",
            "$0 — the IRS requires all S-corp income to be treated as salary",
            "Approximately $4,590 — payroll taxes are halved for S-corp owners",
          ],
          correctIndex: 0,
          explanation:
            "As a sole proprietor, all $120,000 would face 15.3% SE tax = $18,360. As an S-corp with a $60,000 salary: payroll tax = $60,000 × 15.3% = $9,180. The $60,000 distribution escapes payroll taxes entirely. Savings = $18,360 − $9,180 = $9,180. This is the core payroll tax benefit of the S-corp structure — though it must be weighed against S-corp administrative costs (payroll service, state fees, additional accounting).",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Augusta Rule allows a business owner to rent their home to their own S-corporation for unlimited days each year, with rental income received tax-free.",
          correct: false,
          explanation:
            "False. The Augusta Rule (IRC §280A(g)) limits the tax-free rental exclusion to a maximum of 14 days per year. If the home is rented for 15 or more days (even to one's own business), the rental income becomes taxable. The 14-day limit is a hard cap. The strategy is legitimate for up to 14 days of documented business use — board meetings, corporate retreats, client events — but requires careful documentation to withstand IRS scrutiny.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 5: International Tax Planning ────────────────────────────────────
    {
      id: "tax-planning-5",
      title: " International Tax Planning",
      description:
        "Foreign Tax Credit, FBAR, FATCA, PFIC rules, Puerto Rico Act 60, and CFC anti-deferral regulations",
      icon: "Globe",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: " Foreign Tax Credit & Double Taxation",
          content:
            "The US taxes its citizens and residents on **worldwide income** — income earned in any country, from any source. Without relief, US persons with foreign income would pay taxes twice.\n\n**Foreign Tax Credit (FTC):**\nThe FTC eliminates or reduces double taxation by crediting foreign taxes paid against your US tax liability.\n\n**How it works:**\n- Paid $3,000 in foreign income taxes on dividends from a foreign ETF\n- Your US tax on the same income would be $4,000\n- FTC reduces US tax: $4,000 − $3,000 = $1,000 net US tax owed\n- If FTC exceeds US tax liability, the excess can carry back 1 year or forward 10 years\n\n**Foreign Tax Credit vs. Foreign Tax Deduction:**\n- FTC: Dollar-for-dollar reduction in US tax owed (preferred)\n- Deduction: Reduces taxable income (less valuable)\n- You elect which to use — FTC is almost always superior\n\n**Passive basket vs general basket:**\nFTC is calculated separately for different income \"baskets.\" Investment income (dividends, interest) goes into the **passive basket** — excess credits in one basket cannot offset taxes in another.\n\n**ETF investors:** International ETFs and mutual funds pass through foreign taxes on Form 1099-DIV. Investors can claim FTC for their share of taxes paid by the fund without filing Form 1116 if the amount is under $300 ($600 MFJ) — simplified de minimis exception.",
          highlight: [
            "Foreign Tax Credit",
            "worldwide income",
            "double taxation",
            "dollar-for-dollar",
            "passive basket",
            "Form 1099-DIV",
            "carryforward",
          ],
        },
        {
          type: "teach",
          title: "📋 FBAR & FATCA Reporting",
          content:
            "The US imposes strict foreign account reporting requirements with severe penalties for non-compliance.\n\n**FBAR — Foreign Bank Account Report (FinCEN Form 114):**\n- Required when US person has foreign financial accounts with aggregate value **exceeding $10,000** at any point during the calendar year\n- Filed electronically with FinCEN (not IRS) — due April 15, with automatic extension to October 15\n- **Penalties:** Non-willful: up to $10,000 per violation. Willful: greater of $100,000 or 50% of account balance per violation. Criminal charges possible.\n- Accounts covered: bank accounts, brokerage accounts, mutual funds, foreign retirement accounts\n\n**Form 8938 — FATCA (Foreign Account Tax Compliance Act):**\n- Filed with your federal income tax return (Form 1040)\n- Higher reporting thresholds than FBAR:\n  - Single in US: >$50,000 year-end / >$75,000 at any point\n  - MFJ in US: >$100,000 / >$150,000\n  - Living abroad: 4× the US thresholds\n- Covers: foreign financial accounts AND foreign financial assets (foreign stocks held directly, foreign partnerships, etc.)\n- **Penalties:** $10,000 failure to file; $50,000 for continued failure; 40% understatement penalty\n\n**Key difference:** FBAR covers more accounts (lower threshold, separate filing). FATCA covers more asset types at higher thresholds. If you trigger FATCA, you almost certainly trigger FBAR too — file both.",
          highlight: [
            "FBAR",
            "FinCEN 114",
            "$10,000",
            "Form 8938",
            "FATCA",
            "$50,000",
            "penalties",
            "willful",
          ],
        },
        {
          type: "teach",
          title: "☠️ PFIC: The Foreign Mutual Fund Trap",
          content:
            "**Passive Foreign Investment Company (PFIC)** is one of the most punishing tax regimes in the US tax code — designed to prevent US taxpayers from deferring US tax by investing in foreign funds.\n\n**What is a PFIC:**\nA foreign corporation where 75%+ of gross income is passive, or 50%+ of assets produce passive income. This captures virtually every foreign mutual fund, ETF, and many foreign holding companies.\n\n**The PFIC tax trap:**\nGains from PFIC investments are subject to the **excess distribution rules**:\n1. Gain is spread ratably over the holding period\n2. Gain allocated to prior years is taxed at the **highest marginal rate for that year** (currently 37%)\n3. An **interest charge** is added on top — compounding daily from the date the income was allocated\n4. No LTCG rates. No preferential treatment.\n\n**Example:** You bought a non-US ETF 10 years ago for $10,000 and sold it for $60,000. Under PFIC rules, the $50,000 gain may be taxed at 37% + interest — potentially owing more than half the gain in taxes.\n\n**How to avoid the PFIC trap:**\n- Invest in US-domiciled ETFs that hold international stocks (like VEA, VWO, IEMG) — they are NOT PFICs\n- Avoid buying foreign-domiciled funds directly (common mistake for US expats)\n- **QEF election or mark-to-market election** can mitigate PFIC consequences if already trapped",
          highlight: [
            "PFIC",
            "passive foreign investment company",
            "excess distribution",
            "37% rate",
            "interest charge",
            "foreign mutual fund",
            "avoid PFIC",
            "US-domiciled ETFs",
          ],
        },
        {
          type: "teach",
          title: "🌴 Puerto Rico Act 60 & CFC Rules",
          content:
            "**Puerto Rico Act 60 (formerly Acts 20/22):**\nPuerto Rico is a US territory — Puerto Rico residents are US persons but pay **Puerto Rican taxes, not federal income taxes** on Puerto Rico-sourced income.\n\n**Act 60 benefits for qualifying new residents:**\n- **Export Services:** 4% corporate tax on qualifying export services business income\n- **Individual Investors:** 0% Puerto Rico tax on capital gains and dividends accruing after establishing residency\n\n**Residency requirements:**\n- Spend 183+ days per year in Puerto Rico\n- Closer connection to PR than to mainland US\n- No significant connection to any US state\n- Required annual charitable contribution of $10,000 to PR nonprofits; application and annual fees\n\n**Important caveat:** US capital gains accrued *before* moving to PR are still taxable to the IRS. Only **new** capital gains after establishing bona fide residency qualify for 0% treatment.\n\n---\n\n**Controlled Foreign Corporation (CFC) — Anti-Deferral:**\nIf US shareholders own more than 50% of a foreign corporation, it becomes a CFC.\n\n**Subpart F income:** Certain passive and mobile income (dividends, interest, royalties, sales income) earned by the CFC is taxed to US shareholders **currently** — even if not distributed. This eliminates the tax deferral benefit of parking money offshore.\n\n**GILTI (Global Intangible Low-Taxed Income):** Post-TCJA regime — US shareholders of CFCs must include a minimum amount of foreign earnings annually, regardless of distribution.",
          highlight: [
            "Puerto Rico Act 60",
            "4% corporate tax",
            "0% capital gains",
            "183 days",
            "bona fide residency",
            "CFC",
            "Subpart F",
            "GILTI",
            "anti-deferral",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A US citizen has $50,000 in a Swiss bank account that reached $12,000 at its peak during the year. What must they file, and by when?",
          options: [
            "FinCEN Form 114 (FBAR) by April 15 (auto-extended to October 15) — the account exceeded $10,000",
            "Form 8938 (FATCA) only — the $50,000 current balance exceeds the FATCA threshold",
            "Nothing — Swiss bank accounts are excluded from US reporting requirements",
            "Both FinCEN Form 114 and Form 8938, since the account may trigger both thresholds",
          ],
          correctIndex: 0,
          explanation:
            "The FBAR (FinCEN Form 114) is triggered when any US person has foreign financial accounts with aggregate value exceeding $10,000 at any time during the year. With a peak balance of $12,000, the FBAR filing requirement is triggered. The current $50,000 balance may also trigger Form 8938 (FATCA) if it meets the year-end threshold ($50,000 for single filers in the US) — but the question asks specifically what 'must' they file based on the information given. The FBAR is definitively required. In practice, both forms should likely be filed.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A US citizen can avoid US federal income tax on capital gains by simply moving to Puerto Rico, since Puerto Rico residents are exempt from federal income taxes.",
          correct: false,
          explanation:
            "False. Puerto Rico's Act 60 only exempts capital gains that accrue after establishing bona fide Puerto Rico residency. Capital gains on assets purchased before moving — and gains accrued while living in the US — remain fully taxable by the federal government. Additionally, merely 'moving' to Puerto Rico is insufficient; you must establish bona fide residency (183+ days, closer connections to PR, no significant US state connection). Tax authorities scrutinize PR residency claims closely, and backdating or sham residency is fraud.",
          difficulty: 2,
        },
      ],
    },
  ],
};
