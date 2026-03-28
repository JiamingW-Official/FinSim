import type { Unit } from "./types";

export const UNIT_STARTUP_EQUITY: Unit = {
  id: "startup-equity",
  title: "Startup Equity & Early Investing",
  description:
    "Understand startup equity mechanics, cap tables, dilution, angel investing, and how to evaluate early-stage companies",
  icon: "Rocket",
  color: "#f59e0b",
  lessons: [
    // ─── Lesson 1: Cap Table Fundamentals ────────────────────────────────────────
    {
      id: "startup-equity-1",
      title: "📊 Cap Table Fundamentals",
      description:
        "Who owns what — founders, employees, angels, VCs — and how dilution, option pools, and anti-dilution provisions reshape ownership",
      icon: "Table",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🗂️ Reading a Cap Table: Founders, Employees, Angels & VCs",
          content:
            "A **cap table** (capitalisation table) is the definitive record of who owns what percentage of a company. Every equity transaction — founder shares, employee options, investor rounds — lives here.\n\n**Typical stakeholder layers:**\n- **Founders**: Hold common stock issued at incorporation, usually the largest block early on.\n- **Employees / ESOP**: An option pool (typically 10–20% fully diluted) reserved for future hires. Options grant the right to buy shares at a fixed strike price.\n- **Angel investors**: Early individual investors, often taking 5–15% for $250K–$1M in a pre-seed or seed round.\n- **VCs**: Institutional investors who take preferred stock in Series A+ rounds.\n\n**Two ways to express ownership:**\n- **Issued shares**: Shares actually granted or sold to date.\n- **Fully diluted**: All issued shares PLUS all outstanding options, warrants, and convertible instruments as if exercised. Investors always calculate ownership on a fully diluted basis.\n\n**Example cap table after seed round:**\n\n| Stakeholder | Shares | Fully Diluted % |\n|---|---|---|\n| Founder A | 4,000,000 | 40% |\n| Founder B | 4,000,000 | 40% |\n| ESOP | 1,000,000 | 10% |\n| Seed investor | 1,000,000 | 10% |\n| **Total** | **10,000,000** | **100%** |\n\nAlways track fully diluted ownership — options that haven't vested still count toward dilution.",
          highlight: ["cap table", "fully diluted", "ESOP", "option pool", "common stock", "preferred stock"],
        },
        {
          type: "teach",
          title: "💰 Pre-Money vs Post-Money Valuation",
          content:
            "The distinction between pre-money and post-money valuation is one of the most consequential numbers in a startup negotiation.\n\n**Definitions:**\n- **Pre-money valuation**: What the company is worth BEFORE new capital is invested.\n- **Post-money valuation**: Pre-money valuation + new investment amount.\n- **Investor ownership %** = Investment ÷ Post-money valuation\n\n**Worked example:**\n- Investor proposes: $2M investment at $8M pre-money\n- Post-money = $8M + $2M = **$10M**\n- Investor owns = $2M / $10M = **20%**\n- Founders are diluted from 100% to **80%** (before option pool effects)\n\n**Why the distinction matters:**\nIf a founder says 'we are raising at $10M' — do they mean $10M pre or $10M post? At a $2M raise:\n- $10M pre → investor gets 16.7% ($2M / $12M post)\n- $10M post → investor gets 20% ($2M / $10M post)\n\nThat ambiguity can cost founders several percentage points of their company. Always clarify pre vs post in term sheet negotiations.\n\n**Key formula:**\nPrice per share = Pre-money valuation ÷ Fully diluted shares before round",
          highlight: ["pre-money", "post-money", "valuation", "dilution", "price per share"],
        },
        {
          type: "teach",
          title: "🔀 Option Pool Shuffle & Anti-Dilution",
          content:
            "Two mechanics can significantly erode founder ownership beyond the headline dilution number: the option pool shuffle and anti-dilution provisions.\n\n**Option Pool Shuffle:**\nVCs typically require a 10–20% employee option pool as a condition of investment — but demand it be created from the pre-money valuation. This means the pool dilutes founders BEFORE the VC invests, not the VC.\n\nExample:\n- Founders own 100% of 8M shares\n- VC offers $2M at $8M pre-money valuation with a 20% post-money option pool\n- Pre-shuffle: founders own 8M / 10M = **80%** after $2M investment\n- Post-shuffle: a 20% pool must exist post-round from pre-money → the pool comes out of founder shares FIRST, leaving founders with ~**64%**, not 80%\n\nThis is why founders must model the option pool in their pre-money calculation before accepting a term sheet.\n\n**Anti-Dilution Provisions:**\nProtect investors if a future round is priced lower (a 'down round').\n\n- **Broad-based weighted average** (founder-friendly): adjusts the conversion price based on how many shares were sold at the lower price and the total fully diluted share count. Small down rounds barely move the needle.\n- **Full ratchet** (investor-friendly): adjusts investor's conversion price to the lowest price paid — even if only one share was sold at the down-round price. Can be devastating for founders.",
          highlight: ["option pool shuffle", "anti-dilution", "broad-based weighted average", "full ratchet", "down round"],
        },
        {
          type: "quiz-mc",
          question:
            "A startup raises $2M at a $8M pre-money valuation. The VC requires a 10% option pool to be created from pre-money. What is the founder's approximate ownership after the round (assuming founders owned 100% before)?",
          options: [
            "72% — founders lose ~8% to the option pool shuffle and 20% to the new investor",
            "80% — founders only lose the investor's 20% stake",
            "90% — founders keep 90% after the option pool is created",
            "70% — the VC takes 30% in total",
          ],
          correctIndex: 0,
          explanation:
            "Post-money = $10M. The VC owns 20% ($2M / $10M). A 10% post-money option pool comes from pre-money (diluting founders). After both effects: founders ≈ 100% − 20% (VC) − ~8% (pool shuffle) ≈ 72%. The exact figure depends on how the pool is calculated, but the key insight is that the option pool shuffle is borne entirely by founders, not the VC.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Full ratchet anti-dilution is more founder-friendly than broad-based weighted average anti-dilution because it applies a simple, predictable adjustment.",
          correct: false,
          explanation:
            "False. Full ratchet is highly investor-friendly and potentially devastating for founders. It reprices the entire investor stake to the lowest round price — even if only one share sold at a discount. Broad-based weighted average accounts for how many shares sold at the lower price across the full diluted share count, resulting in a much smaller adjustment that is far less punitive in small down rounds.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "TechCo is raising a Series A. The lead VC offers $5M at a $15M pre-money valuation and requires a 15% option pool to be created from pre-money. Before the round, founders own 9M shares (100%). The option pool requires 1.5M new shares. After the pool is created, there are 10.5M shares. The VC invests $5M for new shares priced at $15M / 10.5M = ~$1.43 per share.",
          question: "Approximately how many shares does the VC receive, and what percentage do founders own after the round?",
          options: [
            "VC gets ~3.5M shares; founders own ~60% — diluted by both the option pool and the VC",
            "VC gets ~5M shares; founders own ~50% — the VC always gets 25% in a Series A",
            "VC gets ~2M shares; founders own ~75% — the option pool is not issued yet so it doesn't dilute",
            "VC gets ~3.5M shares; founders own ~80% — only the VC round dilutes founders",
          ],
          correctIndex: 0,
          explanation:
            "Price per share = $15M / 10.5M ≈ $1.43. VC shares = $5M / $1.43 ≈ 3.5M. Total shares = 9M (founders) + 1.5M (pool) + 3.5M (VC) = 14M. Founder % = 9M / 14M ≈ 64%. Founders are diluted to ~64%, not 75%, because the option pool shuffle forces the pool creation to come from the pre-money cap — a key reason founders should push to use a smaller pool or negotiate pool creation from post-money.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Stock Option Mechanics ────────────────────────────────────────
    {
      id: "startup-equity-2",
      title: "⚙️ Stock Option Mechanics",
      description:
        "ISOs vs NSOs, 409A valuations, vesting schedules, exercise windows, and the AMT trap",
      icon: "Settings",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📋 ISOs vs NSOs: Two Flavours of Employee Options",
          content:
            "Startup employees receive stock options — the right to buy shares at a fixed price (the strike price) in the future. Two types exist with very different tax treatments.\n\n**Incentive Stock Options (ISOs):**\n- Available ONLY to employees (not contractors, advisors, or board members)\n- Preferential tax: no ordinary income tax at exercise if certain holding requirements are met\n- Holding rules: hold at least 2 years from grant date AND 1 year from exercise date to qualify for long-term capital gains tax rates\n- Subject to Alternative Minimum Tax (AMT) at exercise — a major pitfall near IPOs\n- Annual ISO limit: only $100K worth (by grant-date fair value) can be treated as ISOs per calendar year; excess becomes NSOs\n\n**Non-Qualified Stock Options (NSOs):**\n- Available to employees, contractors, advisors, board members — anyone\n- At exercise: the spread (fair market value minus strike price) is treated as ordinary income, subject to income tax and payroll taxes\n- No AMT risk\n- More flexible but typically a larger immediate tax bill\n\n**For advisors and contractors:** Always NSOs. For full-time employees: typically ISOs up to the $100K limit.\n\n**409A Valuation:**\nThe IRS requires that ISO strike prices equal the fair market value of common stock at grant date. A **409A valuation** (performed by an independent appraiser) establishes this value. Common stock is typically worth 10–30% of preferred stock price, reflecting liquidation preference and other protections preferred holders enjoy.",
          highlight: ["ISO", "NSO", "409A valuation", "strike price", "ordinary income", "long-term capital gains", "AMT"],
        },
        {
          type: "teach",
          title: "⏳ Vesting Schedules & the Cliff",
          content:
            "Options don't become exercisable all at once — they vest over time to incentivise employees to stay.\n\n**Standard 4-year / 1-year cliff vesting:**\n- **Cliff**: No options vest for the first 12 months. If you leave before the cliff, you get nothing.\n- **Monthly vesting**: After the cliff, 1/48th of the total grant vests each month for the remaining 3 years.\n- Total: 25% vests at month 12, then 2.08% per month thereafter until fully vested at month 48.\n\n**Leaving at 18 months:**\n- You cleared the 1-year cliff: 25% vested at month 12\n- Months 13–18: 6 × 2.08% = 12.5% additional\n- Total vested: 37.5% of grant\n- The remaining 62.5% is forfeited\n\n**Double-trigger acceleration:**\nMany executive grants include 'double-trigger' acceleration — vesting speeds up only if BOTH (1) the company is acquired AND (2) the employee is terminated or demoted. Protects employees from being fired after an acquisition to avoid vesting.\n\n**Single-trigger acceleration:**\nVesting accelerates on acquisition alone — very rare and heavily resisted by acquirers since they want employees to stick around post-deal.\n\n**Reverse vesting for founders:**\nAt incorporation, founders may issue shares with a reverse vesting schedule — shares are subject to company repurchase if a founder leaves early, protecting co-founders from a 'free rider' departing early with full equity.",
          highlight: ["vesting", "cliff", "double-trigger", "single-trigger", "reverse vesting", "4-year", "forfeited"],
        },
        {
          type: "teach",
          title: "🪟 Exercise Windows & the AMT Trap",
          content:
            "Owning vested options means nothing until you exercise them — pay the strike price to receive actual shares. The rules around when and how you can exercise have enormous financial consequences.\n\n**Standard 90-day exercise window:**\nAfter leaving a company, employees typically have 90 days to exercise vested ISOs or they expire worthless. This creates a painful bind: you need cash to buy shares in a private, illiquid company — with no guarantee of a future exit.\n\n**Extended 10-year exercise window (startup-friendly):**\nSome progressive startups offer up to 10 years post-termination to exercise options, giving employees time to wait for liquidity without a cash crunch. ISOs convert to NSOs after 3 months post-departure (IRS rule), but at least the options don't expire.\n\n**The AMT Trap:**\nFor ISOs exercised while still with the company:\n- The IRS Alternative Minimum Tax (AMT) applies to the **spread** at exercise (FMV minus strike) — even though you haven't sold shares and received no cash\n- If a company's valuation is high at exercise but crashes before IPO, an employee can owe hundreds of thousands in AMT taxes on paper gains that evaporated\n- **Historical example**: Many early Netscape and dot-com employees faced this in 2000–2001\n- **Mitigation**: Early exercise (exercise ISOs early at low 409A value), file an 83(b) election within 30 days of exercise to lock in today's low fair market value for AMT purposes",
          highlight: ["exercise window", "AMT", "83(b) election", "early exercise", "90-day window", "spread", "Alternative Minimum Tax"],
        },
        {
          type: "quiz-mc",
          question:
            "An employee was granted 10,000 stock options at a $1.00 strike price. The company is acquired at $10.00 per share. The employee had vested 5,000 options (left at 18 months of a standard 4-year / 1-year cliff grant). What is the employee's gross gain at acquisition?",
          options: [
            "$45,000 — 5,000 vested options × ($10 − $1) spread",
            "$90,000 — all 10,000 options × $9 spread, because acquisition triggers full vesting",
            "$50,000 — 5,000 × $10 acquisition price with no strike deducted",
            "$9,000 — only the cliff shares (25%) vest, giving 2,500 × $9 spread",
          ],
          correctIndex: 0,
          explanation:
            "Only vested options can be exercised. At 18 months (standard 4-year / 1-year cliff): 25% vested at month 12 + 6 months × 2.08% = 37.5% vested = 3,750 options. Wait — the question states 5,000 vested, so we use that directly. Gain = 5,000 × ($10 − $1) = $45,000. Without double-trigger acceleration in the option agreement, unvested options are forfeited or handled per the acquisition terms. Always check your option agreement for change-of-control provisions.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An employee who exercises ISOs immediately receives a large cash windfall and owes income tax on the difference between the exercise price and the stock's fair market value.",
          correct: false,
          explanation:
            "False. Exercising ISOs does NOT create ordinary income tax at exercise (unlike NSOs). However, it may trigger the Alternative Minimum Tax (AMT) on the spread — and since the employee pays real cash to exercise but receives illiquid private shares, there is no immediate windfall. The real tax event for ISOs under the qualified disposition rules occurs when the shares are eventually sold. This is what makes ISOs valuable — and the AMT risk is what makes them dangerous near IPO.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Priya joined a Series A startup and received 12,000 ISOs with a $0.50 strike price. The current 409A valuation is $0.50. Two years later (at month 24), she has vested 50% of her grant. The company's 409A is now $5.00 per share. Priya is considering exercising her vested options now rather than waiting.",
          question: "What is Priya's AMT exposure if she exercises all vested options today, and what document should she file to potentially minimise future tax liability on future appreciation?",
          options: [
            "AMT spread = 6,000 × ($5.00 − $0.50) = $27,000 recognised for AMT; file an 83(b) election is not applicable here — she should consult a tax advisor about AMT planning",
            "AMT spread = $0 because ISOs are completely exempt from all taxes at exercise",
            "AMT spread = 12,000 × $5.00 = $60,000; file a W-9 form within 90 days",
            "AMT spread = 6,000 × $5.00 = $30,000; file a Section 1202 election to eliminate tax",
          ],
          correctIndex: 0,
          explanation:
            "Priya has vested 50% = 6,000 options. The AMT spread = 6,000 × ($5.00 − $0.50) = $27,000. This amount is added to her income for AMT purposes — she may or may not owe additional AMT depending on her overall tax picture. The 83(b) election is used for restricted stock (not options), so it doesn't apply here. For ISO exercises, the key planning tool is exercising early when the 409A is low (minimising AMT exposure) and understanding the AMT credit that can be reclaimed in profitable years.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Preferred Stock & Liquidation ─────────────────────────────────
    {
      id: "startup-equity-3",
      title: "💎 Preferred Stock & Liquidation",
      description:
        "Common vs preferred stock, liquidation waterfall mechanics, participating preferred double-dip, and when preferred converts to common",
      icon: "Layers",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📌 Common vs Preferred Stock",
          content:
            "Not all startup equity is created equal. VCs hold **preferred stock** — a fundamentally different security from the **common stock** held by founders and employees.\n\n**Common stock:**\n- Held by founders, employees, and early friends-and-family investors\n- Voting rights but no economic preferences\n- Last in line in any liquidation event\n- 409A fair market value is a fraction of preferred price (reflecting its junior position)\n\n**Preferred stock:**\n- Held by institutional investors (VCs, angels in priced rounds)\n- Economic preferences: liquidation preference, dividends, anti-dilution protection\n- Can convert to common at any time (usually at a 1:1 ratio)\n- Automatically converts to common at a qualifying IPO\n\n**Why this matters to employees:**\nWhen a company is sold for less than its last post-money valuation, common shareholders may receive little or nothing after preferred preferences are paid out. This is why a company can be 'sold for $50M' but employees with options receive almost nothing — the cap table waterfall pays preferred holders first.\n\n**Dividends:**\nMost VC preferred stock includes cumulative or non-cumulative dividends (typically 6–8% per year). Cumulative dividends accrue and must be paid at exit; non-cumulative dividends are only paid if declared. In practice, startup dividends are rarely paid — they accumulate as a liquidation preference 'kicker.'",
          highlight: ["common stock", "preferred stock", "liquidation preference", "convert", "cumulative dividends", "waterfall"],
        },
        {
          type: "teach",
          title: "💧 Liquidation Waterfall: 1×, 2×, Participating",
          content:
            "The **liquidation waterfall** determines the order and amount each stakeholder receives in a sale, merger, or wind-down.\n\n**1× Non-participating preferred (market standard):**\n- Investor receives 1× their investment back FIRST, then decides: keep the preference or convert to common and participate pro-rata.\n- Best for common if the exit is large relative to investment.\n\n**1× Participating preferred ('double-dip'):**\n- Investor takes 1× back AND THEN participates in the remaining proceeds as if they owned common stock.\n- Investor effectively gets paid twice — hence 'double-dip.'\n- Uncommon in healthy markets; more frequent in down rounds or when VCs have leverage.\n\n**2× Non-participating:**\n- Investor takes 2× their investment back before common shareholders receive anything.\n- Only converts if their pro-rata common ownership exceeds the 2× return.\n\n**Worked example — $50M exit:**\n\nVC invested $10M for 25% of company (1× participating preferred):\n- Step 1: VC takes $10M liquidation preference\n- Remaining: $40M\n- Step 2: VC participates for 25% of $40M = $10M\n- VC total: **$20M** | Common (75%): **$30M**\n\nSame deal with 1× non-participating:\n- Option A: Take $10M preference\n- Option B: Convert to 25% common = 25% × $50M = **$12.5M** ← better\n- VC takes $12.5M | Common: **$37.5M**\n\n1× non-participating returns $7.5M more to founders and employees in this scenario.",
          highlight: ["liquidation waterfall", "participating preferred", "non-participating", "double-dip", "1×", "2×", "preference"],
        },
        {
          type: "teach",
          title: "🔄 Conversion at IPO & Breakeven Analysis",
          content:
            "Preferred stock automatically converts to common at a qualifying IPO — but investors can choose to convert earlier if economics favour it.\n\n**When does preferred convert voluntarily?**\nWhen the investor's pro-rata share of the exit proceeds (as common) exceeds their liquidation preference. The 'conversion threshold' is:\n\nConversion price = Liquidation preference ÷ Ownership %\n\nFor 1× non-participating preferred ($10M invested for 20%):\nConversion threshold = $10M / 0.20 = **$50M** exit\n- Below $50M: take the $10M preference\n- Above $50M: convert to common (20% × exit > $10M)\n\n**Why this hurts employees in mid-size exits:**\nIf a company raises $50M total and sells for $60M:\n- Multiple preference stacks may consume most of the proceeds\n- Common shareholders (founders, employees) receive far less than the headline suggests\n\n**Automatic IPO conversion:**\nPreferred auto-converts at IPO if the offering price exceeds the conversion price (often 3–5× the Series A price). After conversion, all shares are equal — VC preferred disappears and everyone holds common.\n\n**'Pay-to-play' provisions:**\nSome term sheets require existing investors to participate pro-rata in future rounds or lose certain preferences (e.g., preferred converts to common). Protects the company by ensuring loyal investors in difficult times.",
          highlight: ["conversion threshold", "automatic conversion", "IPO conversion", "pay-to-play", "pro-rata", "breakeven"],
        },
        {
          type: "quiz-mc",
          question:
            "A VC invested $10M for 30% of a startup (1× participating preferred). The company is sold for $30M. How much does the VC receive in the waterfall?",
          options: [
            "$16M — $10M preference + 30% of remaining $20M ($6M)",
            "$10M — VC only takes the 1× preference and forfeits pro-rata",
            "$9M — 30% of the $30M exit proceeds",
            "$10M preference + $9M pro-rata = $19M",
          ],
          correctIndex: 0,
          explanation:
            "1× participating preferred: Step 1 — VC takes $10M liquidation preference. Remaining = $20M. Step 2 — VC participates for 30% of $20M = $6M. VC total = $16M. Common shareholders (founders + employees) split $14M. This illustrates the 'double-dip' effect — the participating preferred investor receives $16M on a $10M investment even though common shareholders built the company. In a $30M exit where the VC invested $10M at a $33M post-money, the founders who drove this outcome receive only 70% of $14M ≈ $9.8M.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "VentureCo invested $20M in TechStart for 40% of the company (1× non-participating preferred). TechStart is now considering two acquisition offers: Offer A at $30M and Offer B at $100M.",
          question: "What does VentureCo receive under each offer, and under which offer does VentureCo prefer to convert to common rather than take the preference?",
          options: [
            "Offer A: VentureCo takes $20M preference (40% × $30M = $12M is worse); Offer B: VentureCo converts to common for $40M (better than $20M preference)",
            "Offer A: VentureCo converts to common for $12M; Offer B: VentureCo takes the $20M preference",
            "Both offers: VentureCo always takes the preference because $20M > pro-rata in both cases",
            "Offer A: VentureCo takes $20M; Offer B: VentureCo takes $20M — non-participating means no conversion ever",
          ],
          correctIndex: 0,
          explanation:
            "Offer A ($30M): Pro-rata as common = 40% × $30M = $12M < $20M preference → VentureCo takes the $20M preference. Common receives $10M. Offer B ($100M): Pro-rata as common = 40% × $100M = $40M > $20M preference → VentureCo converts to common and takes $40M. Common receives $60M. The conversion threshold here is $20M / 0.40 = $50M — exits above $50M see VentureCo convert. This shows why 1× non-participating is standard: it only disadvantages common shareholders in small exits, and at large exits everyone benefits from conversion.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Convertible Notes & SAFEs ─────────────────────────────────────
    {
      id: "startup-equity-4",
      title: "📝 Convertible Notes & SAFEs",
      description:
        "Short-term debt, discount rates, valuation caps, SAFE mechanics, and the dilution founders often underestimate",
      icon: "FileText",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🔄 Convertible Notes: Debt That Becomes Equity",
          content:
            "A **convertible note** is a short-term loan that converts into equity at the next priced funding round. It lets early-stage companies raise capital without agreeing on a valuation immediately — often useful when the company is too early to value confidently.\n\n**Key terms:**\n\n- **Principal**: The amount invested (e.g., $500,000).\n- **Interest rate**: Typically 5–8% per year. Accrues on the principal and also converts to equity at the conversion event.\n- **Discount rate**: Note holders convert at a discount to the next round's price — typically 15–25%. Rewards early investors for taking on more risk than Series A investors.\n- **Valuation cap**: A ceiling on the price at which the note converts, regardless of the next round's valuation. Protects early investors if the company's valuation skyrockets.\n- **Maturity date**: If the company hasn't raised a priced round by this date (usually 18–24 months), the note 'matures' — investors can demand repayment or negotiate conversion terms.\n\n**Conversion mechanics:**\nAt the next priced round, note holders convert at whichever gives THEM more shares:\n- Conversion price = Next round price × (1 − discount)\n- OR\n- Conversion price = Cap ÷ Fully diluted shares before round\n\nInvestors always take the lower conversion price (which yields more shares).\n\n**Example:**\n$500K note, 20% discount, $5M cap. Series A priced at $10M post-money with $3M raised at $1.00/share.\n- Discount price: $1.00 × (1 − 0.20) = $0.80/share\n- Cap price: $5M / pre-round fully diluted shares (say 10M) = $0.50/share\n- Note holders convert at $0.50 (lower, more shares): $500K / $0.50 = **1,000,000 shares**",
          highlight: ["convertible note", "discount rate", "valuation cap", "maturity date", "conversion price", "interest rate"],
        },
        {
          type: "teach",
          title: "⚡ SAFEs: Y Combinator's Simpler Instrument",
          content:
            "In 2013, Y Combinator introduced the **SAFE** (Simple Agreement for Future Equity) as a cleaner alternative to convertible notes. It is now the most common instrument for pre-seed and seed financing.\n\n**How SAFEs differ from convertible notes:**\n- **No maturity date**: SAFEs don't expire, eliminating the risk of a maturity event forcing premature repayment.\n- **No interest**: No interest accrues, so the conversion amount is simply the principal.\n- **Not debt**: A SAFE is not a loan — it is a contract right to receive equity at a future priced round. This matters for bankruptcy priority.\n\n**SAFE terms (same as notes):**\n- Valuation cap (optional but common)\n- Discount (optional, less common than caps)\n- MFN (most favoured nation): if later SAFEs have better terms, this SAFE gets updated to match\n\n**Post-money SAFE (YC's current version):**\nYC updated the SAFE in 2018 to be a **post-money SAFE**. The investor's ownership % is calculated based on the post-money valuation of the company at conversion — a key change:\n- Post-money SAFE ownership = SAFE amount ÷ SAFE valuation cap\n- This percentage is then 'locked in' — founders know exactly how much they are giving up at the time of the SAFE\n\n**SAFE dilution: a founder trap:**\nMany founders issue multiple SAFEs across multiple angels without fully modelling the cumulative dilution. A company with five $200K SAFEs all with $5M caps has effectively committed $1M / $5M = **20% dilution** from SAFEs alone — before any priced round. This often surprises founders when the Series A cap table is built.",
          highlight: ["SAFE", "post-money SAFE", "no maturity", "valuation cap", "MFN", "dilution", "Y Combinator"],
        },
        {
          type: "teach",
          title: "📐 Modelling SAFE Conversion",
          content:
            "Understanding how SAFEs and notes dilute the cap table at a priced round is essential for founders to avoid nasty surprises.\n\n**Post-money SAFE conversion worked example:**\n\nStartup facts:\n- Outstanding SAFEs: $500K with $5M post-money cap\n- Series A terms: raising $3M at $12M post-money ($9M pre-money)\n- Pre-round fully diluted shares: 10,000,000\n\n**Step 1 — SAFE converts first (before Series A):**\nSAFE ownership % = $500K / $5M cap = **10%**\nSAFE shares = 10% × total post-round shares (but total post-round shares includes the SAFE itself — circular calculation)\n\nSimplified approach: SAFE converts at cap price\nSAFE conversion price = $5M / 10,000,000 = $0.50/share\nSAFE shares = $500,000 / $0.50 = **1,000,000 new shares**\n\n**Step 2 — Series A invests:**\nNew total before Series A = 11,000,000\nSeries A price = $9M / 11,000,000 = $0.818/share\nSeries A shares = $3M / $0.818 = **3,667,000 new shares**\n\n**Final cap table:**\n\n| Holder | Shares | % |\n|---|---|---|\n| Founders + employees | 10,000,000 | 67.7% |\n| SAFE investor | 1,000,000 | 6.8% |\n| Series A VC | 3,667,000 | 24.8% |\n| **Total** | **14,667,000** | **100%** |\n\nFounders are surprised to find SAFE holders already own 6.8% — hence why modelling SAFEs before signing is critical.",
          highlight: ["SAFE conversion", "cap price", "post-money", "conversion shares", "cap table", "fully diluted"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor puts $500K into a post-money SAFE with a $5M valuation cap. The company later raises a Series A at $15M post-money. How many shares does the SAFE investor receive if there are 10,000,000 pre-round fully diluted shares?",
          options: [
            "1,000,000 shares — SAFE converts at the $5M cap price ($0.50/share), not the $15M Series A price",
            "333,333 shares — SAFE converts at the $15M Series A price ($1.50/share)",
            "500,000 shares — SAFE converts at the midpoint of the cap and the Series A price",
            "750,000 shares — 20% discount applied to the Series A price",
          ],
          correctIndex: 0,
          explanation:
            "The post-money SAFE has a $5M cap. Conversion price = $5M cap / 10,000,000 pre-round shares = $0.50/share. SAFE shares = $500,000 / $0.50 = 1,000,000. The Series A is priced at $15M post-money — far above the $5M cap — so the cap is the binding constraint, giving the early SAFE investor a much better price than Series A investors ($0.50 vs ~$1.50). This is exactly what the cap is designed to do: reward early investors who took on more risk.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A SAFE is legally a form of debt and ranks above common stockholders in bankruptcy proceedings because it represents a promise to deliver equity.",
          correct: false,
          explanation:
            "False. A SAFE is NOT debt — it has no maturity date, no interest, and is not a loan. It is a contractual right to receive equity at a future priced round. In a bankruptcy or wind-down, SAFE holders typically rank below creditors (who hold actual debt) but the exact treatment depends on jurisdiction and the specific SAFE agreement. This debt-vs-equity distinction is one reason why SAFEs were designed as a cleaner instrument than convertible notes for early-stage financing.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Founder Maya has raised three post-money SAFEs from different angels over the past year: $200K at a $4M cap, $300K at a $5M cap, and $500K at a $8M cap. She is now negotiating a Series A at $20M post-money. There are 8,000,000 pre-SAFE fully diluted shares.",
          question: "Approximately what percentage of the company do the three SAFE investors collectively own before any Series A shares are issued?",
          options: [
            "~17.5% combined — $200K/$4M + $300K/$5M + $500K/$8M = 5% + 6% + 6.25%",
            "~5% combined — only the largest SAFE converts, the rest are diluted out",
            "~25% combined — SAFEs always convert at a flat 20% discount regardless of cap",
            "~10% combined — SAFEs convert at the pre-money valuation of the Series A round",
          ],
          correctIndex: 0,
          explanation:
            "Each post-money SAFE ownership % = SAFE amount / SAFE cap. SAFE 1: $200K / $4M = 5.0%. SAFE 2: $300K / $5M = 6.0%. SAFE 3: $500K / $8M = 6.25%. Total SAFE dilution ≈ 17.25%. These percentages are committed regardless of the Series A price (the caps are all well below $20M, so caps are binding). Maya has given away ~17.5% of the company across SAFEs before the Series A even closes — a classic founder modelling error when SAFEs are issued incrementally without tracking cumulative dilution.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Angel Investing Framework ─────────────────────────────────────
    {
      id: "startup-equity-5",
      title: "👼 Angel Investing Framework",
      description:
        "Portfolio construction, deal sourcing, due diligence frameworks, pro-rata rights, and red flags in early-stage evaluation",
      icon: "Star",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "📐 Portfolio Construction: The Power Law Imperative",
          content:
            "Angel investing is not like stock picking. Startup outcomes follow a **power law distribution** — a tiny fraction of investments generate the vast majority of returns. This fundamentally changes how a portfolio must be constructed.\n\n**Why you need 20+ investments:**\nIn a typical angel portfolio, the likely distribution of outcomes is:\n- ~50% of companies return $0 (total loss)\n- ~30% return capital or a modest 1–3×\n- ~15% return 3–10×\n- ~5% return 10–100×+\n\nWith a 10-company portfolio and $50K per deal ($500K total), a typical outcome might be:\n- 5 zeros: −$250K\n- 3 at 2×: +$300K\n- 2 at 10×: +$1M\n- Total: ~$1.05M on $500K → ~2.1× MOIC (modest IRR given time horizon)\n\nWith 25 deals, the odds of hitting at least one 50× increase substantially. Mathematically, fewer than 20 deals means significant probability of missing all the power law winners.\n\n**Minimum check size vs diversification:**\nMost angel rounds are $25K–$250K per investor. To build a 20-deal portfolio:\n- At $25K/deal: minimum $500K committed capital\n- At $100K/deal: minimum $2M committed capital\n\n**Deployment horizon:**\nAngels typically deploy over 2–3 years to avoid over-concentration in one market vintage (e.g., all investments made in 2021 peak valuations).",
          highlight: ["power law", "portfolio construction", "diversification", "MOIC", "check size", "20 investments"],
        },
        {
          type: "teach",
          title: "🔍 Deal Sourcing & Due Diligence Framework",
          content:
            "Access to quality deals is the angel investor's primary competitive advantage. Most of the best deals are never publicly listed.\n\n**Deal sourcing channels:**\n- **AngelList**: Platform for syndicates and direct deals; good for first-time angels to co-invest alongside experienced leads\n- **Syndicates**: Lead angel pulls together a group of LPs for each deal; LPs pay carry (typically 20%) on profits\n- **Accelerators**: Y Combinator, Techstars, Seedcamp Demo Days — high volume, fast decisions required\n- **Founder networks**: The best source — introductions from founders you've backed who know other exceptional founders\n- **University networks**: Strong networks at MIT, Stanford, CMU, Imperial College produce repeat founders\n\n**Due diligence framework (weighted):**\n\n**Team (50%):**\n- Domain expertise — have they worked in this space for 5+ years or experienced the problem firsthand?\n- Execution track record — prior founder experience, or evidence of shipping product and selling\n- Co-founder dynamics — complementary skills (technical + commercial), aligned on vision\n- Ability to recruit — can they attract A-players?\n\n**Market size (30%):**\n- TAM (Total Addressable Market) > $1B — startups need a big market to return a fund\n- Is the market growing or shrinking? What is the tailwind?\n- Can the startup own a defensible niche before expanding?\n\n**Product / Traction (20%):**\n- Evidence of product-market fit: retention, NPS, organic growth, revenue\n- Technical differentiation — is the moat replicable or protectable?\n- Early customer conversations and pain level validation",
          highlight: ["deal sourcing", "AngelList", "syndicates", "due diligence", "TAM", "team", "product-market fit", "traction"],
        },
        {
          type: "teach",
          title: "📋 Rights, Information & Red Flags",
          content:
            "Sophisticated angel investors negotiate certain rights beyond just the equity stake. These protect the investment and maintain access to information.\n\n**Pro-rata rights:**\nThe right (but not the obligation) to invest in future rounds to maintain your ownership percentage. Critical for angels — if a company does well, later rounds are priced much higher. Pro-rata rights let you 'double down' at the earlier cap table before new investors pile in at premium valuations.\n\nExample: You own 2% after seed. Without pro-rata, a massive Series A dilutes you to 1.5%. With pro-rata, you can invest enough to stay at 2%.\n\n**Information rights:**\nSmall investors (under $25K sometimes don't receive formal information rights. Negotiate for:\n- Quarterly financial statements (P&L, cash balance, runway)\n- Annual audited financials (or at minimum reviewed)\n- Material event notification (pivots, key hires/departures, legal issues)\n\n**Red flags in early-stage diligence:**\n\n- **Pivoting too often**: A team that has changed core business model more than once in 18 months signals lack of conviction or market validation\n- **Founder conflict**: Vague or evasive answers about co-founder relationships; equity split disputes; one founder visibly dominant in all conversations\n- **Burn rate without metrics**: Spending $80K/month with no measurable output — no growth metrics, no product milestones, no pipeline\n- **Chasing valuation, not capital**: Founders fixated on headline valuation rather than the capital needed to hit next milestones\n- **Closed-off to feedback**: Founders who cannot take critical questions or investor pushback rarely adapt well to market feedback\n- **Round structure problems**: Uncapped SAFEs, unusual control provisions, missing ESOP, or prior investors with aggressive terms that will scare off future VCs",
          highlight: ["pro-rata rights", "information rights", "red flags", "burn rate", "pivot", "founder conflict", "quarterly financials"],
        },
        {
          type: "quiz-mc",
          question:
            "An angel investor is evaluating two startups. Startup A: 2 ex-Google engineers building an AI scheduling tool, no revenue, $50K MRR pipeline, $1B TAM, seed round at $6M post-money. Startup B: a solo founder (first startup, no domain experience) building a social app for pet owners, 10K downloads in 3 months but 80% Day-7 churn, $500M TAM, seed round at $9M post-money. Which single factor most strongly favours Startup A?",
          options: [
            "The experienced founding team with domain expertise and lower valuation — team quality (50% of diligence) and price both favour A",
            "The higher TAM of $1B vs $500M — bigger market always wins regardless of team",
            "Startup B's 10K downloads prove stronger product-market fit than Startup A's pipeline",
            "Startup B's solo founder means less cap table dilution and more founder motivation",
          ],
          correctIndex: 0,
          explanation:
            "Team quality is 50% of the due diligence framework and is the single most important factor at early stage — before product-market fit can be fully proven. Startup A has two experienced engineers with domain expertise AND a lower valuation ($6M vs $9M). Startup B's 80% Day-7 churn is a severe red flag — high downloads with poor retention signals users are not finding lasting value. A solo non-domain-expert founder with a 'social app' in a smaller market at a higher valuation stacks multiple negatives. Startup A is more investable.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Pro-rata rights are primarily valuable to angels in early rounds because they guarantee the angel a seat on the board of directors in future financing rounds.",
          correct: false,
          explanation:
            "False. Pro-rata rights give an investor the right to maintain their percentage ownership by investing in future rounds — they have nothing to do with board seats. Board seats are negotiated separately (typically reserved for lead investors writing much larger checks). Pro-rata rights are valuable because they let early investors 'double down' on proven winners at lower effective costs than new investors who buy in at the Series B or C premium. Missing pro-rata means an angel's 2% stake gets diluted away even if the company succeeds tremendously.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Angel investor Jordan is evaluating two seed-stage investments. Company X: $250K/month burn, $0 revenue, 2 founders with prior successful exit, enterprise SaaS for legal document automation, $5M TAM, raising $1.5M at $8M post-money. Company Y: $40K/month burn, $8K MRR (3-month streak), 3 founders (no prior exits, but 8 years each in HR software), HR workflow automation, $12B TAM, raising $750K at $6M post-money, 18 months of runway.",
          question: "Which company is more investable from an angel investing framework perspective, and what is the primary concern about the other?",
          options: [
            "Company Y is more investable — larger TAM, experienced domain team, early revenue, lower burn, and longer runway; Company X's primary concern is the $5M TAM which limits fund-return potential",
            "Company X is more investable — prior founder success always dominates; Company Y's 3-founder structure increases conflict risk",
            "Company X is more investable — $250K burn shows ambition and speed; Company Y's $40K burn is too conservative to win market share",
            "Both are equally investable — prior exits and current traction cancel each other out as diligence factors",
          ],
          correctIndex: 0,
          explanation:
            "Company Y scores better across nearly all framework dimensions: TAM ($12B vs $5M — critical for angel returns), team (domain expertise, 8 years in HR software), traction ($8K MRR with 3-month streak), burn ($40K vs $250K — 18 months runway vs Company X's likely 6 months at $250K/month on $1.5M raise), and valuation ($6M vs $8M). Company X's fatal flaw is the $5M TAM — angels need companies that can return their entire portfolio, and a $5M TAM caps the exit value severely regardless of founder pedigree. The prior-exit founders are a plus, but not enough to overcome structural TAM limits.",
          difficulty: 3,
        },
      ],
    },
  ],
};
