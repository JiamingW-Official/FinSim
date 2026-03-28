import type { Unit } from "./types";

export const UNIT_BUYBACKS_DIVIDENDS: Unit = {
  id: "buybacks-dividends",
  title: "Buybacks & Dividends: Capital Returns",
  description:
    "Understand how companies reward shareholders through buybacks and dividends — from free cash flow generation and signaling theory to the tax debate, total shareholder yield, and spotting unsustainable payout programs",
  icon: "💰",
  color: "#0f766e",
  lessons: [
    // ─── Lesson 1: Why Companies Return Capital ──────────────────────────────────
    {
      id: "buybacks-dividends-1",
      title: "💸 Why Companies Return Capital",
      description:
        "Free cash flow generation, the hierarchy of capital allocation choices, lack of better investment opportunities, and signaling theory",
      icon: "BookOpen",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The Capital Allocation Hierarchy",
          content:
            "Every dollar a business earns must be deployed somewhere. A CEO's most important job is **capital allocation** — deciding where each dollar of free cash flow goes. The hierarchy of choices, from most to least value-creating, typically looks like this:\n\n**1. Reinvest in the core business (highest priority)**\n- Internal projects, R&D, capacity expansion, technology upgrades\n- Returns above the cost of capital create shareholder value\n- The best use of cash when high-ROIC opportunities exist\n\n**2. Strategic acquisitions**\n- Buy businesses that complement the core franchise\n- History shows most acquisitions destroy value due to overpayment and integration failure\n- Only worthwhile when price is disciplined and synergies are real\n\n**3. Return capital to shareholders**\n- When the business generates more cash than it can profitably deploy internally, it should return the surplus\n- Two main methods: dividends and share buybacks\n- The right choice when reinvestment would earn below the cost of capital\n\n**4. Hoard cash (lowest priority)**\n- Holding excess cash on the balance sheet destroys value over time\n- Cash earns minimal returns while equity investors expect more\n- Acceptable for a short period ahead of known large expenditures\n\n**The key insight:** Returning capital is NOT a sign of weakness — it is a sign of financial discipline. A company that returns capital rather than making low-return acquisitions is treating shareholders honestly.",
          highlight: ["capital allocation", "free cash flow", "cost of capital", "ROIC", "reinvest"],
        },
        {
          type: "teach",
          title: "Free Cash Flow: The Source of Returns",
          content:
            "Capital return programs are only sustainable when funded by genuine **free cash flow (FCF)** — the cash left over after maintaining and growing the business.\n\n**Free Cash Flow formula:**\n```\nFCF = Operating Cash Flow − Capital Expenditures\n```\n\n**Why FCF matters more than earnings:**\n- Net income can be inflated by accounting choices (depreciation timing, accruals)\n- FCF is harder to manipulate — cash is cash\n- Dividends and buybacks must ultimately be funded by FCF, not accounting profits\n\n**FCF yield: the investor's lens:**\n- **FCF Yield** = FCF per share / Stock price\n- A 5% FCF yield means the company generates $5 of cash for every $100 of stock price\n- If management returns 80% of FCF to shareholders, the shareholder yield is roughly 4%\n\n**The FCF conversion ratio:**\n- **FCF Conversion** = FCF / Net Income\n- Good businesses: 80–120% (cash earnings exceed or match accounting earnings)\n- Capital-intensive businesses: 40–60% (significant capex consumes reported earnings)\n- Businesses with rising working capital needs often have poor FCF conversion even with solid net income\n\n**Red flag:** Companies that consistently pay dividends or run buybacks while generating negative FCF are returning borrowed money — a path to financial distress. Always check: is the payout funded by cash flow from operations, or by debt?",
          highlight: ["free cash flow", "FCF yield", "operating cash flow", "capital expenditures", "FCF conversion"],
        },
        {
          type: "teach",
          title: "Signaling Theory: What Capital Returns Communicate",
          content:
            "Capital return announcements convey powerful information because management has far more knowledge about the business than outside investors. This is the foundation of **signaling theory**.\n\n**Dividend initiation as a signal:**\n- Announcing a first-ever regular dividend signals that management is confident in the durability of earnings\n- Regular dividends create a commitment — cutting them later is very painful and signals distress\n- Companies rarely initiate dividends unless they believe the payout is sustainable for many years\n\n**Buyback announcements:**\n- A repurchase program signals management believes the stock is undervalued\n- Insiders know more about future earnings prospects than anyone else\n- When management buys back stock aggressively at a given price, it is effectively saying \"we believe shares are worth more than this\"\n- Caution: announced buybacks don't always get executed — some are pure signaling with no follow-through\n\n**Dividend increases as confidence boosters:**\n- Raising the dividend year after year signals consistently improving earnings power\n- Companies that have raised dividends for 25+ consecutive years (Dividend Aristocrats) signal exceptional business stability\n\n**Negative signals:**\n- Cutting or eliminating a dividend is one of the most bearish signals a company can send\n- It typically triggers a sharp stock decline because it signals deteriorating cash flow\n- The market treats it as management admitting the business is doing worse than communicated\n\n**The asymmetry:** Good news from capital returns (initiation, increase) produces modest stock gains. Bad news (cuts, suspensions) produces large stock drops. This asymmetry reflects the commitment value embedded in dividend payments.",
          highlight: ["signaling theory", "dividend initiation", "buyback announcement", "undervalued", "dividend cut"],
        },
        {
          type: "quiz-mc",
          question:
            "A company earns $500M in net income but spends $300M on capital expenditures and generates $350M in operating cash flow. What is its free cash flow, and what does this reveal about its capital return capacity?",
          options: [
            "$50M FCF — limited capacity; any payout above $50M per year requires debt or asset sales",
            "$200M FCF — it can return more than net income suggests due to depreciation adjustments",
            "$500M FCF — net income equals cash flow in this case",
            "$350M FCF — always use operating cash flow as the measure of free cash flow",
          ],
          correctIndex: 0,
          explanation:
            "FCF = Operating Cash Flow ($350M) − Capital Expenditures ($300M) = $50M. The company earns $500M in net income but capex consumes $300M of real cash, leaving only $50M available for dividends or buybacks without taking on debt. Net income overstates cash generation here because depreciation is a non-cash charge that reduces net income but not cash flow, while capex is the actual cash cost of maintaining and growing assets. FCF conversion is just 10% ($50M / $500M), a major warning sign.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company returning capital through dividends or buybacks is signaling that its business lacks profitable growth opportunities, which should be viewed negatively by investors.",
          correct: false,
          explanation:
            "This is a common misconception. Returning capital is a sign of financial discipline, not weakness. If a company cannot deploy cash at returns above its cost of capital, returning that cash to shareholders IS the value-maximizing decision. Forcing low-return reinvestment just to appear growth-focused destroys shareholder value. Many of the world's best businesses (Apple, Microsoft, Visa) return enormous capital while continuing to grow — because they generate far more cash than they need for operations. The question is whether reinvestment opportunities are genuinely attractive, not whether returning capital is inherently bad.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "RetailCo announces a $500M share repurchase program. You check the financials: RetailCo generated $400M in FCF last year, has $200M in cash on the balance sheet, and $2B in long-term debt at 7% interest. Management says the buyback will be funded 'through a combination of cash on hand and new borrowings.'",
          question: "How should you interpret this buyback announcement?",
          options: [
            "Cautiously — borrowing at 7% to buy back stock only makes sense if the stock is meaningfully undervalued; the debt burden adds financial risk",
            "Very positively — any buyback signals management confidence and always creates value",
            "Very negatively — buybacks funded by any debt source are always value-destructive and should be condemned",
            "Neutrally — the funding source doesn't matter, only the total size of the repurchase program",
          ],
          correctIndex: 0,
          explanation:
            "The funding source matters enormously. Borrowing at 7% to repurchase stock only makes mathematical sense if the stock's earnings yield (FCF/price) exceeds the after-tax cost of debt, AND management has high conviction the stock is undervalued. Here, taking on more debt at 7% with already $2B outstanding adds financial fragility. If earnings disappoint, the company has both a debt service burden and a depleted balance sheet. A buyback funded by genuine excess FCF is far healthier than one funded by leverage. This isn't automatically bad — some leveraged buybacks are excellent capital allocation — but it requires more scrutiny.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Stock Buybacks Deep Dive ──────────────────────────────────────
    {
      id: "buybacks-dividends-2",
      title: "🔄 Stock Buybacks Deep Dive",
      description:
        "Open market repurchases vs tender offers, EPS accretion mechanics, buyback yield, and what actually drives shareholder value",
      icon: "TrendingUp",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Open Market Repurchases vs Tender Offers",
          content:
            "Companies buy back their own stock through two primary mechanisms, each with very different implications for speed, price, and signaling strength.\n\n**Open Market Repurchase (OMR) — the most common:**\n- Company authorizes a buyback program (e.g., \"up to $2B over 3 years\")\n- Buys shares gradually through a broker on the open market\n- Subject to SEC Rule 10b-18 volume and timing limits (can't buy more than 25% of average daily volume)\n- Flexible — management can accelerate or pause based on price and conditions\n- **Weakness**: Many authorized programs are never fully executed; the announcement is partly for signaling purposes\n- **Strength**: Allows price-sensitive buying — buy more when cheap, less when expensive\n\n**Tender Offer — faster and stronger signal:**\n- Company offers to buy a fixed number of shares from all shareholders at a specified premium price (typically 10–20% above market)\n- Shareholders decide whether to \"tender\" their shares within a set window (20–40 days)\n- If oversubscribed, shares are bought pro-rata\n- **Strength**: Much stronger signal — management must commit to a specific price, quantity, and timeline; cannot easily back out\n- **Weakness**: Less price-sensitive; company pays a fixed premium regardless of where the stock moves\n- Typically used when management wants to retire large amounts of stock quickly\n\n**Accelerated Share Repurchase (ASR):**\n- Company pays a bank upfront, bank delivers shares immediately (borrowed from institutional lenders)\n- Bank then buys shares in the open market over time to close its position\n- Combines speed of tender offer with gradual market execution\n- Common when companies want immediate EPS impact",
          highlight: ["open market repurchase", "tender offer", "SEC Rule 10b-18", "accelerated share repurchase", "signaling"],
        },
        {
          type: "teach",
          title: "EPS Accretion: The Math of Buybacks",
          content:
            "The most immediate financial impact of a buyback is **EPS accretion** — as the share count falls, each remaining share represents a larger piece of the same earnings pie.\n\n**The EPS accretion formula:**\n```\nNew EPS = Net Income / (Old Shares − Repurchased Shares)\n```\n\n**Example:**\n- Net income: $1,000M\n- Shares outstanding: 500M → EPS = $2.00\n- Company buys back 50M shares (10% of float) at $25/share\n- New shares outstanding: 450M → New EPS = $1,000M / 450M = **$2.22**\n- EPS grew 11% without earnings growing at all\n\n**The accretion/dilution test:**\nA buyback is **accretive** when:\n```\nEarnings Yield (E/P) > After-Tax Cost of Debt used to fund it\n```\n- If the stock has a 6% earnings yield (P/E of 16.7×) and debt costs 4% after tax, the buyback is accretive\n- The company \"earns\" 6% on the repurchased shares but only pays 4% on the debt — creating a spread\n\n**When buybacks destroy value:**\n- Buying overvalued stock reduces value per share even as EPS rises\n- EPS is a per-share metric — the total value of the company hasn't changed, just the share count\n- A company that pays $50 for a share worth $30 destroys $20 per share regardless of EPS effects\n\n**Buffett's test for sensible buybacks:**\n\"Repurchases make sense only if: (a) the company has ample funds for all business needs, and (b) the stock is selling below its intrinsic value.\" Condition (b) is where most buyback programs fail under scrutiny.",
          highlight: ["EPS accretion", "earnings yield", "share count", "intrinsic value", "after-tax cost of debt"],
        },
        {
          type: "teach",
          title: "Buyback Yield vs Dividend Yield",
          content:
            "Investors often fixate on dividend yield while ignoring buyback yield — yet both represent real cash being returned to shareholders.\n\n**Dividend yield:**\n- **Formula**: Annual Dividends Per Share / Stock Price\n- Visible and certain — shareholders receive cash in their accounts\n- Taxable in the year received (for most investors)\n- Management commits to a recurring payment; cutting it is costly\n\n**Buyback yield:**\n- **Formula**: Total Annual Buyback Spend / Market Capitalization\n- Less visible — shareholders don't receive cash directly\n- The return comes through share price appreciation (fewer shares, same value) or EPS growth\n- Flexible — management can pause or adjust without formal announcement\n- Potentially more tax-efficient for long-term investors (deferred capital gains)\n\n**Total Shareholder Yield (TSY):**\n```\nTSY = Dividend Yield + Buyback Yield + Net Debt Paydown Yield\n```\nExample: Apple FY2023\n- Dividend yield: ~0.5%\n- Buyback yield: ~3.5% ($90B+ in repurchases on ~$2.7T market cap at the time)\n- TSY ≈ 4.0% — far higher than the dividend alone would suggest\n\n**Why TSY matters:**\n- Focusing only on dividend yield misses companies like Apple that return massive capital through buybacks\n- TSY gives a truer picture of what shareholders are receiving\n- A company with a 5% TSY (split 1% dividend + 4% buyback) is returning more than one with a 3% dividend yield alone\n\n**The comparison:** A utility stock with a 4% dividend yield and 0% buybacks vs a tech company with 0.5% dividend and 4% buyback yield both return roughly the same amount — but the tax and flexibility profiles differ significantly.",
          highlight: ["buyback yield", "dividend yield", "total shareholder yield", "TSY", "market capitalization"],
        },
        {
          type: "quiz-mc",
          question:
            "TechCo has 200M shares outstanding, net income of $800M, and a stock price of $40. It repurchases 20M shares at $40. What happens to EPS?",
          options: [
            "EPS rises from $4.00 to $4.44 — a 11% accretion from the 10% share count reduction",
            "EPS stays at $4.00 — net income is unchanged so EPS cannot change",
            "EPS falls to $3.60 — cash spent on buybacks reduces available earnings",
            "EPS rises to $5.00 — the buyback doubles EPS by removing half the shares",
          ],
          correctIndex: 0,
          explanation:
            "Before buyback: EPS = $800M / 200M = $4.00. After buying back 20M shares: EPS = $800M / 180M = $4.44. A 10% reduction in share count creates approximately 11.1% EPS accretion (1/0.9 = 1.111). Net income is unchanged — $800M — but it is now divided among 180M shares instead of 200M. This is why management can 'grow EPS' without growing underlying earnings. Note that if $40 is above intrinsic value, this accretion is financially misleading — more value was destroyed buying expensive shares than was created through the per-share arithmetic.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company with a 0.3% dividend yield and a 4.2% buyback yield is returning less capital to shareholders than a company with a 3.0% dividend yield and no buybacks.",
          correct: false,
          explanation:
            "The total shareholder yield is what matters. Company A has a total yield of 4.5% (0.3% + 4.2%), while Company B has just 3.0%. Company A returns 50% more capital despite appearing to be a poor dividend payer. Apple is a classic real-world example: its dividend yield often appears modest at ~0.5%, but when you add its massive share repurchase program, total shareholder yield has regularly been 4–5%. Focusing only on dividends leads investors to systematically undervalue companies that use buybacks as their primary return mechanism.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: Dividend Investing ────────────────────────────────────────────
    {
      id: "buybacks-dividends-3",
      title: "📈 Dividend Investing",
      description:
        "Dividend discount model, payout ratio analysis, dividend growth investing, Aristocrats vs high-yield stocks",
      icon: "BarChart2",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Dividend Discount Model (DDM)",
          content:
            "The **Dividend Discount Model** is the theoretical foundation of equity valuation — it states that a stock's intrinsic value equals the present value of all future dividends.\n\n**Gordon Growth Model (simplest DDM form):**\n```\nIntrinsic Value = D1 / (r − g)\n```\nWhere:\n- **D1** = Next year's expected dividend\n- **r** = Required rate of return (cost of equity)\n- **g** = Expected perpetual dividend growth rate\n\n**Example:**\n- Next dividend: $2.00\n- Required return: 9%\n- Growth rate: 5%\n- Value = $2.00 / (0.09 − 0.05) = $2.00 / 0.04 = **$50.00**\n\n**Key sensitivities:**\n- Small changes in assumptions produce large valuation swings\n- If g rises from 5% to 6%: Value = $2.00 / 0.03 = $66.67 (+33%)\n- If r rises from 9% to 10%: Value = $2.00 / 0.05 = $40.00 (−20%)\n- This explains why high-growth, high-quality dividend stocks are very sensitive to interest rate changes\n\n**Multi-stage DDM:**\nMore realistic for companies with distinct growth phases:\n- Stage 1 (Years 1–5): High growth dividends, discounted individually\n- Stage 2 (Years 6+): Stable terminal growth, valued using Gordon model\n- Sum the present values of both stages\n\n**DDM limitations:**\n- Not useful for non-dividend-paying stocks (growth companies, most tech)\n- Extremely sensitive to the terminal growth assumption\n- Works best for mature, stable businesses with predictable dividend policies (utilities, consumer staples, REITs)",
          highlight: ["dividend discount model", "Gordon Growth Model", "required rate of return", "growth rate", "present value"],
        },
        {
          type: "teach",
          title: "Payout Ratio: Safety and Sustainability",
          content:
            "The **payout ratio** measures what fraction of earnings (or FCF) is being paid out as dividends. It is the most critical metric for assessing dividend sustainability.\n\n**Earnings-based payout ratio:**\n```\nPayout Ratio = Dividends Per Share / Earnings Per Share\n```\n\n**FCF-based payout ratio (more reliable):**\n```\nFCF Payout Ratio = Total Dividends Paid / Free Cash Flow\n```\n\n**Interpretation guide:**\n- **< 30%**: Very conservative — large room to grow dividend; signal of either early-stage payer or very high-growth company\n- **30–60%**: The sweet spot for most mature companies — sustainable with room for growth\n- **60–80%**: Acceptable for stable utilities and REITs; less margin for earnings shortfalls\n- **> 80%**: High risk — one bad year could force a cut; common in telecom and some energy stocks\n- **> 100%**: Paying out more than earnings — borrowing to pay dividends, unsustainable\n\n**The FCF vs EPS distinction:**\nAlways check FCF payout ratio alongside EPS payout ratio:\n- A company can have 50% EPS payout ratio but 90% FCF payout ratio if it has high non-cash earnings or rising capex\n- Utilities often have earnings payout ratios above 80% but the dividends are supported by stable regulated FCF\n\n**Dividend growth sustainability:**\nA sustainable dividend growth rate is bounded by:\n```\nMax Sustainable Dividend Growth = ROE × (1 − Payout Ratio)\n```\nA company with 15% ROE and 60% payout ratio can sustainably grow dividends at ~6% — any more requires either expanding the payout ratio (riskier) or taking on debt.",
          highlight: ["payout ratio", "FCF payout ratio", "sustainability", "dividend cut", "dividend growth"],
        },
        {
          type: "teach",
          title: "Dividend Growth vs High Yield: Two Strategies",
          content:
            "Dividend investors typically follow one of two very different strategies — or a blend — depending on their goals and timeline.\n\n**Dividend Growth Investing:**\n- Focus on companies with modest current yields (1–3%) but consistent annual dividend increases\n- Target companies with 10–25+ year histories of consecutive dividend increases\n- **Dividend Aristocrats**: S&P 500 members with 25+ consecutive years of dividend increases (e.g., Johnson & Johnson, Procter & Gamble, Coca-Cola, Realty Income)\n- **Dividend Kings**: 50+ consecutive years of increases\n\nThe power of compounding: A stock bought at a 2% yield that grows its dividend 10% annually will be yielding 5.2% on your original cost in 10 years, and 13.4% in 20 years — even if the stock price never moves.\n\n**High Yield Investing:**\n- Focus on current income: REITs, MLPs, utilities, BDCs, high-yield bond funds often yield 4–8%+\n- Trade-off: less dividend growth, more volatility, more business risk\n- Appropriate for retirees who need current income rather than future growth\n\n**The yield trap:**\n- Very high yields (8%+) often signal market skepticism about sustainability\n- When a stock yields 8% while the sector averages 3%, the market is pricing in a likely cut\n- A stock that cuts its dividend and falls 40% leaves an income investor in much worse shape than a low-yield dividend grower that compounds steadily\n\n**Key metric for dividend growth investors:**\nDividend growth rate + starting yield = approximate total return expectation (the \"yield plus growth\" model). A 2% yield + 8% growth = expected ~10% total return, which has historically matched or beaten the broader market over long periods.",
          highlight: ["Dividend Aristocrats", "Dividend Kings", "high yield", "yield trap", "yield plus growth"],
        },
        {
          type: "quiz-mc",
          question:
            "UtilityCo pays $2.40 per share in annual dividends, has EPS of $3.00, and free cash flow of $2.50 per share. What is the risk profile of this dividend?",
          options: [
            "Moderate risk — the EPS payout ratio is 80% (manageable for a utility) but the FCF payout ratio is 96%, leaving almost no buffer",
            "Very safe — the dividend is only 80% of EPS so there is ample room for growth",
            "Very risky — any dividend above 50% of EPS should be considered unsustainable",
            "No risk — utilities always protect dividends regardless of financial metrics",
          ],
          correctIndex: 0,
          explanation:
            "EPS payout ratio = $2.40 / $3.00 = 80%. FCF payout ratio = $2.40 / $2.50 = 96%. While 80% EPS payout is common for regulated utilities (they have predictable, regulated cash flows), a 96% FCF payout ratio is a serious concern. Any unexpected capital expenditure requirement, regulatory change, or earnings shortfall would leave almost no cushion. The FCF payout ratio is more telling because it reflects actual cash available after maintaining the business. This dividend is technically sustainable today but leaves almost no room for error or growth.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You're comparing two dividend stocks. Stock A: 1.8% yield, 12 consecutive years of dividend increases averaging 9% per year, 45% payout ratio, 18% ROE. Stock B: 7.2% yield, 2 years of flat dividends after cutting from 9% two years ago, 88% FCF payout ratio, declining revenue.",
          question: "Which stock better fits a 20-year retirement income goal and why?",
          options: [
            "Stock A — despite lower current yield, its yield-on-cost will exceed Stock B's in ~16 years and the trajectory is far more sustainable",
            "Stock B — the current 7.2% yield is objectively more valuable to income investors than 1.8%",
            "Stock B — high current income is always preferable when planning for retirement income needs",
            "Stock A — only because utilities with high payout ratios should always be avoided",
          ],
          correctIndex: 0,
          explanation:
            "For a 20-year horizon, Stock A is clearly superior. At 9% annual dividend growth, Stock A's yield on your original cost doubles approximately every 8 years. In 16 years, the yield on cost would be about 1.8% × (1.09)^16 ≈ 7.2% — matching Stock B's current yield, but with a much higher price appreciation component. Stock B shows every red flag: a recent cut, 88% FCF payout leaving no room for growth, and declining revenue suggesting the 7.2% yield may itself not be sustainable. High current yields from distressed companies frequently lead to dividend cuts and capital losses that devastate long-term income plans.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Buybacks vs Dividends: The Debate ─────────────────────────────
    {
      id: "buybacks-dividends-4",
      title: "⚖️ Buybacks vs Dividends: The Debate",
      description:
        "Tax efficiency, flexibility tradeoffs, management incentives, buyback criticism, and the shareholder value debate",
      icon: "Scale",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Tax Efficiency: Why Buybacks Often Win",
          content:
            "All else equal, buybacks are more tax-efficient than dividends for most investors — a structural advantage that explains why they have grown dramatically as a capital return mechanism.\n\n**The dividend tax problem:**\n- Dividends are taxed in the year received, regardless of whether you wanted or needed the cash\n- In the US, qualified dividends are taxed at 0/15/20% (for individuals) plus 3.8% Net Investment Income Tax for high earners — potentially 23.8%\n- Non-qualified dividends (held < 61 days, most foreign dividends) are taxed as ordinary income — up to 37%\n- You pay tax even if you immediately reinvest the dividend — an effective drag on compounding\n\n**The buyback tax advantage:**\n- You are not forced to realize gains — the decision to sell is yours\n- Tax on capital gains from stock price appreciation is deferred until you sell\n- Long-term capital gains (held > 1 year) are taxed at preferential rates (0/15/20%)\n- For buy-and-hold investors, deferring taxes for decades is enormously valuable — it is essentially an interest-free loan from the government on the deferred tax\n\n**The Miller-Modigliani theorem in practice:**\nTheoretically, in a world with no taxes, dividends and buybacks are equivalent (both reduce the firm's value by the distributed amount). In the real world with taxes, buybacks dominate for most investors.\n\n**Exception cases where dividends are preferred:**\n- Tax-exempt investors (pension funds, endowments, IRAs) — no tax disadvantage\n- Investors who need current income (retirees)\n- Investors in low/zero tax jurisdictions\n- Some institutional mandates require dividend-paying stocks",
          highlight: ["tax efficiency", "qualified dividends", "capital gains deferral", "Miller-Modigliani", "tax-exempt"],
        },
        {
          type: "teach",
          title: "Flexibility and Commitment: The Structural Difference",
          content:
            "Dividends and buybacks differ fundamentally in their **commitment level** — and this distinction affects how companies manage through business cycles.\n\n**Dividends: high commitment, low flexibility**\n- Once initiated, the market expects dividends to continue indefinitely\n- Cutting a dividend signals distress — typically causes a 20–40% stock price drop\n- Companies smooth dividends — increasing them gradually, being very reluctant to cut\n- This smoothing is valuable to income investors: predictable, stable cash flows\n- But it forces companies to maintain payouts even during cyclical downturns, sometimes at the cost of balance sheet health\n\n**Buybacks: low commitment, high flexibility**\n- Announced repurchase programs are discretionary — companies can pause, slow, or abandon them\n- No market penalty for not executing an authorized buyback; many programs are never fully completed\n- Allows management to be opportunistic: buy more when the stock is cheap, less when it's expensive\n- Cyclical companies (airlines, automakers) heavily favor buybacks over dividends for this reason\n\n**The cyclical industry dilemma:**\nA mining company or semiconductor maker with volatile earnings faces a cruel choice with dividends:\n- Set dividend low enough for the worst case → appears stingy in good times\n- Set dividend for average earnings → must cut in downturns, triggering stock drops\n- Buybacks solve this: return capital generously in boom times, pause in busts\n\n**Management incentives — the dark side:**\nSome critics argue buyback flexibility gets abused:\n- Management buys back stock at peak valuations (market highs) rather than when cheap\n- Studies show buyback activity peaks near market tops (companies follow the herd, buying high)\n- If executed options and RSU grants are substantial, buybacks primarily offset dilution rather than reducing share count",
          highlight: ["commitment", "flexibility", "dividend cut", "cyclical", "discretionary", "dilution offset"],
        },
        {
          type: "teach",
          title: "Buyback Criticism: The Policy Debate",
          content:
            "Stock buybacks have become one of the most politically and economically contested practices in corporate finance. Understanding the debate makes you a better-informed investor.\n\n**The mainstream criticism:**\n\n1. **Short-termism**: Companies sacrifice R&D, capex, and employee investment to hit EPS targets through buybacks. Academic studies have found mixed evidence — some show reduced investment, others show no effect.\n\n2. **Management self-enrichment**: Executives with large equity compensation (options, RSUs) benefit when EPS rises from buybacks — their compensation is tied to per-share metrics. Critics call this a conflict of interest.\n\n3. **Buying high, not low**: Aggregate US corporate buybacks peak at market highs and collapse at market bottoms — exactly the opposite of value-maximizing behavior. Companies bought back the most stock in 2007 and 2018 (near peaks), far less in 2009 and 2020 (at troughs).\n\n4. **Borrowed buybacks**: Companies that take on debt to buy back stock at expensive valuations increase financial fragility without genuine value creation.\n\n**The counterarguments:**\n\n1. Returning excess cash is the correct economic choice when investment opportunities are scarce\n2. Executives have the same information problem everyone else has — timing markets is hard\n3. Leverage used for buybacks is often disciplined (investment-grade companies)\n4. The alternative (forced investment in low-return projects) is worse for the economy\n\n**The 1% excise tax (US, 2023):**\nThe Inflation Reduction Act introduced a 1% federal excise tax on corporate share repurchases — a political compromise that makes buybacks marginally less attractive without eliminating them.",
          highlight: ["short-termism", "management self-enrichment", "buying high", "borrowed buybacks", "excise tax"],
        },
        {
          type: "quiz-tf",
          statement:
            "For a long-term investor who does not need current income, stock buybacks are generally more tax-efficient than dividends because capital gains can be deferred until the investor chooses to sell.",
          correct: true,
          explanation:
            "This is correct. Dividends force a taxable event each year — the investor pays tax on the dividend whether or not they wanted or needed the cash, creating a drag on compounding. With buybacks, the benefit comes through price appreciation (more value per share, same number of shares), and the investor controls when to realize that gain. Deferring capital gains for 10, 20, or 30 years is enormously valuable — the deferred tax is essentially an interest-free loan from the government. For tax-exempt investors (pension funds, IRAs) the distinction disappears, but for taxable accounts the buyback advantage is real and significant.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "An airline company is evaluating its capital return policy. The stock is highly cyclical — earnings can vary from -$2 to +$8 per share across the business cycle. Which approach best fits this situation and why?",
          options: [
            "A modest base dividend (covered even in bad years) plus discretionary buybacks in strong years — balancing commitment with flexibility",
            "A generous dividend set at peak earnings to maximize income investor appeal during good times",
            "An aggressive fixed dividend equal to average earnings across the cycle — manageable on average",
            "No capital return program — all airlines should retain all capital due to industry cyclicality",
          ],
          correctIndex: 0,
          explanation:
            "Cyclical companies face a dangerous trap with generous fixed dividends — they must cut them in downturns, triggering stock collapses. The optimal structure: a small base dividend covered even at trough earnings (say $0.50/share — easy to maintain even at -$2 EPS from cash reserves) plus discretionary buybacks when earnings are strong. This maintains income investor appeal without creating an unsustainable commitment. Delta, Southwest, and other airlines have used exactly this approach. A dividend set at peak earnings ($8/share) would be catastrophically cut in the next downturn. A dividend at average cycle earnings (~$3) still gets cut in bad years. Flexibility is more valuable than generosity in deeply cyclical industries.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Analyzing Capital Return Programs ─────────────────────────────
    {
      id: "buybacks-dividends-5",
      title: "🔍 Analyzing Capital Return Programs",
      description:
        "Total shareholder yield framework, FCF yield analysis, sustainability checklist, and red flags in payout programs",
      icon: "Search",
      xpReward: 100,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Total Shareholder Yield: The Complete Picture",
          content:
            "**Total Shareholder Yield (TSY)** is the most comprehensive measure of capital being returned to investors. It corrects for the bias toward dividend-paying stocks that dividend yield alone creates.\n\n**Full TSY formula:**\n```\nTSY = Dividend Yield + Net Buyback Yield + Net Debt Paydown Yield\n```\n\nBreaking it down:\n- **Dividend yield**: Annual dividends / Market cap\n- **Net buyback yield**: (Gross buybacks − Stock issuance) / Market cap\n- **Net debt paydown**: Net debt reduction / Market cap (optional, but included in some frameworks)\n\n**Why \"net\" buyback yield matters:**\nMany companies buy back stock with one hand while issuing stock through options and RSU grants with the other. Gross buybacks overstate the true return:\n- Company buys back $2B of stock (gross buyback yield = 2%)\n- Meanwhile issues $1B in new shares for employee compensation\n- Net buyback yield = ($2B − $1B) / market cap = 1%\n- Only the net reduces share count; the gross figure is misleading\n\n**TSY as a value signal:**\n- Studies show that high TSY portfolios have historically outperformed low TSY portfolios\n- A company with 7% TSY at a reasonable valuation is returning significant value regardless of how that return is split between dividends and buybacks\n- TSY becomes most useful when comparing across sectors where income vs growth preferences differ\n\n**TSY framework in practice:**\nWhen evaluating any capital return program, always calculate: Gross buybacks last 12 months / shares issued last 12 months = net buyback activity. Then: total dividends + net buybacks = actual cash returned.",
          highlight: ["total shareholder yield", "TSY", "net buyback yield", "stock issuance", "dilution"],
        },
        {
          type: "teach",
          title: "FCF Yield: The Affordability Test",
          content:
            "Before a capital return program can be deemed attractive, you must verify the company can actually afford it. **FCF yield** is the affordability benchmark.\n\n**FCF Yield formula:**\n```\nFCF Yield = Free Cash Flow Per Share / Stock Price\n= Total FCF / Market Capitalization\n```\n\n**Interpreting FCF yield:**\n- **> 7%**: Potentially very cheap — substantial cash generation relative to price\n- **4–7%**: Reasonable — typical for quality large-caps in normal markets\n- **2–4%**: Fair to full — less margin for error\n- **< 2%**: Expensive — limited FCF relative to valuation (common in high-growth tech)\n\n**The payout coverage ratio:**\n```\nPayout Coverage = FCF / Total Capital Returned (dividends + buybacks)\n```\n- **> 1.5×**: Comfortable — returns well covered with FCF to spare for debt paydown\n- **1.0–1.5×**: Adequate — returns are covered but tight\n- **< 1.0×**: Red flag — returning more than FCF generated; funding gap from debt or asset sales\n\n**Maintenance vs growth capex:**\nFCF as typically reported (operating cash flow minus total capex) may overstate the true available cash if the company has significant growth capex:\n- **Maintenance capex**: Required to keep the business running at current levels\n- **Growth capex**: Optional investment to expand capacity\n- A more conservative FCF strips out only maintenance capex; the remainder is truly discretionary\n- Some companies blur these categories — always read the capex footnotes\n\n**The levered FCF test:**\nIf FCF is calculated before interest payments (unlevered FCF), add back interest to get true cash available. High-debt companies may have strong EBITDA but thin levered FCF after debt service.",
          highlight: ["FCF yield", "payout coverage ratio", "maintenance capex", "growth capex", "levered FCF"],
        },
        {
          type: "teach",
          title: "Red Flags in Capital Return Programs",
          content:
            "Experienced analysts look for specific warning signs that suggest a capital return program is unsustainable or misleading.\n\n**Red flag #1: FCF payout > 100%**\nThe company is returning more cash than it generates. Short-term this can come from cash reserves or asset sales, but it is not maintainable. Check the balance sheet for declining cash or rising debt alongside the payout.\n\n**Red flag #2: Rising debt funding returns**\nIf long-term debt grows year over year while buybacks and dividends also increase, management is essentially borrowing to return capital. This can make sense briefly if the business is very stable and interest rates are low, but it amplifies risk dramatically.\n\n**Red flag #3: Declining revenue + high payout**\nA shrinking business returning capital aggressively may simply be milking itself. The capital return program looks attractive today but future years will see both a smaller company and likely a cut payout. Print media companies in the 2000s–2010s exhibited this pattern.\n\n**Red flag #4: Buybacks at all-time-high prices**\nIf a company only accelerates buybacks when the stock is near historical highs (never in downturns), management is buying high — the opposite of value creation. Look at whether the buyback program is consistent across market cycles.\n\n**Red flag #5: Gross vs net buybacks**\nCompare gross buybacks to share-based compensation. If the company buys back $1B but issues $900M in new shares, the net reduction is minimal. This is common in tech companies where the buyback program primarily offsets employee dilution.\n\n**Red flag #6: One-time special dividends masking weak recurring returns**\nA company that pays a large special dividend after an asset sale may appear to have a high yield but has actually depleted its asset base. Sustainable returns come from ongoing operations, not one-time events.",
          highlight: ["FCF payout > 100%", "rising debt", "declining revenue", "buybacks at highs", "gross vs net", "special dividend"],
        },
        {
          type: "quiz-mc",
          question:
            "MediaCo has the following profile: Revenue declining 8% per year, net income $400M, dividends paid $250M, buybacks $300M (gross), stock-based comp $280M, FCF $380M. What is the most concerning finding?",
          options: [
            "Gross buybacks of $300M are almost entirely offset by $280M in stock issuance — net buyback impact is only $20M, yet total capital returned ($550M) exceeds FCF ($380M)",
            "The dividend payout ratio of 62.5% is too high for a media company",
            "Revenue decline alone disqualifies MediaCo from any shareholder return program",
            "Stock-based compensation of $280M is a positive sign of employee alignment with shareholders",
          ],
          correctIndex: 0,
          explanation:
            "Two critical issues compound here. First, the net buyback is nearly zero: $300M gross minus $280M stock issuance = only $20M net share reduction — yet management presents the $300M as a shareholder return. Second, total apparent returns ($250M dividends + $300M buybacks = $550M) exceed FCF of $380M by $170M — meaning MediaCo is drawing down cash reserves or adding debt to fund the gap. Combine this with 8% annual revenue decline, and you have the classic 'milking a shrinking business' red flag. The dividend is the sustainable portion (~66% of FCF). The buyback is largely an employee compensation offset dressed up as shareholder return.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A company that consistently repurchases shares every quarter regardless of the stock price is maximizing shareholder value through its buyback program.",
          correct: false,
          explanation:
            "Mechanical, price-indifferent buybacks are not optimal capital allocation. Buybacks create value only when the stock is purchased below intrinsic value. If management buys shares at $80 when the intrinsic value is $60, they are destroying $20 per share regardless of the consistent execution. Ideally, management should increase repurchases when the stock is cheap (high margin of safety) and slow or pause when it is expensive. Research shows most corporate buyback programs do the opposite — accelerating near market highs when the board feels confident and pausing during downturns when the stock is cheapest. Value-maximizing buyback programs are price-sensitive, not automatic.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing SteadyCo: $5.00 FCF per share, stock price $62, pays $1.80 annual dividend (3 consecutive years of 6% increases), buys back $1.50/share equivalent annually, issues $0.30/share in stock compensation. Debt is flat year-over-year.",
          question: "Calculate the key metrics and assess the program's sustainability.",
          options: [
            "FCF yield 8.1%, FCF payout coverage 1.6×, net buyback yield 1.9%, total shareholder yield ~4.8% — well-covered program with room to grow",
            "FCF yield 8.1%, but the program is unsustainable because total returns ($3.30) exceed FCF ($5.00) leaving insufficient reinvestment",
            "FCF yield 8.1% is too low to justify any capital return program",
            "Cannot assess sustainability without knowing the P/E ratio and sector comparable yields",
          ],
          correctIndex: 0,
          explanation:
            "Let's calculate: FCF yield = $5.00 / $62 = 8.1% (attractive). Net buybacks = $1.50 − $0.30 = $1.20/share. Total capital returned = $1.80 (dividend) + $1.20 (net buyback) = $3.00/share. FCF payout coverage = $5.00 / $3.00 = 1.67× — well covered, leaving $2.00/share of FCF for reinvestment, debt reduction, or future program growth. Dividend yield = $1.80 / $62 = 2.9%. Net buyback yield = $1.20 / $62 = 1.9%. Total shareholder yield ≈ 4.8%. This is a well-structured program: growing dividend (3 years of 6% increases), modest net buybacks, strong coverage. Nothing alarming. The 1.67× coverage ratio gives management flexibility to maintain returns even if FCF dips 33%.",
          difficulty: 3,
        },
      ],
    },
  ],
};
