import type { Unit } from "./types";

export const UNIT_VALUE_INVESTING: Unit = {
  id: "value-investing",
  title: "Value Investing: Philosophy & Practice",
  description:
    "Master the intellectual foundations of value investing — from Graham's margin of safety and Mr. Market to Buffett's moat concept, intrinsic value methods, contrarian opportunities, and the traps that ensnare undisciplined value hunters",
  icon: "📊",
  color: "#1d4ed8",
  lessons: [
    // ─── Lesson 1: Graham's Framework ────────────────────────────────────────────
    {
      id: "value-investing-1",
      title: "Graham's Framework",
      description:
        "Margin of safety, the Mr. Market allegory, net-net stocks, the Graham Number formula, and the distinction between defensive and enterprising investors",
      icon: "BookOpen",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Margin of Safety — The Central Concept",
          content:
            "Benjamin Graham, the father of value investing, built his entire philosophy around one idea: **margin of safety**. Buying a security at a price substantially below its estimated intrinsic value provides a cushion against errors in analysis, unforeseen business deterioration, or simple bad luck.\n\n**Why margin of safety matters:**\n- Intrinsic value is always an estimate — markets are complex and forecasts are imperfect\n- Paying a large discount compensates for those inevitable estimation errors\n- A 40% margin of safety means the stock must fall 40% below intrinsic value before you lose capital\n\n**Practical application:**\n- If you estimate a company is worth $100 per share, a 30% margin of safety means you buy at $70 or below\n- A 40% margin means you buy only at $60 or below\n- The larger the margin, the lower your downside risk but the rarer the opportunity\n\n**The dual purpose of margin of safety:**\n1. **Protection from loss**: If your intrinsic value estimate is wrong by 20%, you still haven't paid more than the business is worth\n2. **Source of return**: The gap between price and value closes over time as markets recognize the true worth\n\n**Graham's own words:** \"The margin of safety is always dependent on the price paid. It will be large at some price, small at some higher price, nonexistent at some still higher price.\" This insight explains why the same business can be a great investment at one price and a terrible one at another.",
          highlight: ["margin of safety", "intrinsic value", "discount", "estimation error"],
        },
        {
          type: "teach",
          title: "Mr. Market — The Allegorical Business Partner",
          content:
            "Graham introduced the **Mr. Market allegory** to illustrate the proper relationship between an investor and stock price fluctuations. It remains the most useful mental model in all of investing.\n\n**The allegory:**\nImagine you own a share of a private business with a partner named Mr. Market. Every day, Mr. Market knocks on your door and offers to buy your share or sell you his share at a specific price. Sometimes Mr. Market is euphoric and quotes a very high price. Other times he is despondent and quotes a very low price. You are free to accept his offer — or ignore him entirely.\n\n**The key insight:**\n- Mr. Market's daily prices reflect his emotional state, not the underlying business value\n- When Mr. Market is pessimistic, he offers you bargains — this is your opportunity to buy\n- When Mr. Market is manic, he offers you inflated prices — this is your opportunity to sell\n- Mr. Market is your servant, not your advisor. Never let his mood dictate your actions\n\n**Why most investors fail:**\nMost market participants treat Mr. Market as an authority figure. When he is optimistic, they buy because \"prices are going up.\" When he is pessimistic, they sell because \"the market knows something.\" Graham argued this is exactly backwards — Mr. Market's mood swings are opportunities, not guidance.\n\n**The temperament required:**\n- Intellectual independence: willingness to hold views contrary to the crowd\n- Emotional stability: indifference to short-term price movements\n- Patience: the ability to wait months or years for value to be recognized\n\nBuffett later said that the Mr. Market concept, \"once it gets into your head, it never leaves.\"",
          highlight: ["Mr. Market", "emotional state", "bargains", "servant not advisor", "temperament"],
        },
        {
          type: "teach",
          title: "Net-Net Stocks and the Graham Number",
          content:
            "Graham developed specific quantitative tools to identify undervalued securities without relying on subjective business quality judgments.\n\n**Net-Net Working Capital (NNWC):**\nGraham's most conservative valuation method compares stock price to net current assets alone — ignoring fixed assets entirely:\n- **Formula**: (Current Assets − Total Liabilities) / Shares Outstanding\n- If a stock trades below its NNWC, you are essentially buying the current assets at a discount and getting fixed assets (factories, equipment, brands) for free\n- Graham sought stocks trading at 2/3 or less of NNWC — a staggering discount\n- **Rationale**: Even in bankruptcy liquidation, current assets (cash, receivables, inventory) typically return most of their stated value\n- These \"net-net\" stocks were common during the Great Depression; today they are rare in developed markets but occasionally appear in small-cap and international markets\n\n**The Graham Number:**\nFor companies with positive earnings, Graham proposed a simple formula combining book value and earnings power:\n- **Formula**: √(22.5 × Earnings Per Share × Book Value Per Share)\n- The 22.5 factor derives from Graham's rule that a stock should not trade above 15× earnings AND 1.5× book value simultaneously (15 × 1.5 = 22.5)\n- A stock trading below its Graham Number has a mathematical margin of safety\n- **Example**: EPS = $4.00, Book Value = $30.00 → Graham Number = √(22.5 × 4 × 30) = √2,700 = $51.96\n\n**Limitations of these formulas:**\n- Net-net criteria essentially ignores business quality and future earnings power\n- Graham Numbers work best for stable, asset-heavy businesses; they misvalue growth companies\n- Graham himself acknowledged these were starting points for analysis, not final answers",
          highlight: ["net-net", "NNWC", "Graham Number", "current assets", "book value"],
        },
        {
          type: "teach",
          title: "Defensive vs Enterprising Investor",
          content:
            "Graham divided investors into two categories based on their time, interest, and temperament — and prescribed very different strategies for each.\n\n**The Defensive Investor:**\nSomeone who prioritizes avoiding serious mistakes over maximizing returns, and is unwilling to devote substantial effort to portfolio management.\n\nGraham's defensive criteria for stock selection:\n1. Adequate size — avoid small, financially vulnerable companies\n2. Strong financial condition — current ratio above 2:1 for industrials\n3. Earnings stability — no deficit in any of the past 10 years\n4. Dividend record — uninterrupted payments for 20+ years\n5. Earnings growth — at least 1/3 increase in per-share earnings over 10 years\n6. Moderate P/E ratio — no more than 15× average earnings of past 3 years\n7. Moderate price-to-book — price-to-book × P/E should not exceed 22.5\n\nThe defensive investor follows these rules mechanically, diversifies widely, and rebalances — never straying from the formula for exciting opportunities.\n\n**The Enterprising Investor:**\nSomeone willing to devote significant time and energy to security analysis in pursuit of superior results.\n\nEnterprising strategies Graham endorsed:\n- **Bargain issues**: Stocks selling below net current asset value\n- **Special situations**: Arbitrage in mergers, liquidations, corporate restructurings\n- **Growth at reasonable price**: Quality growth companies acquired during temporary adversity\n\n**Graham's sobering warning:** The enterprising investor who does the extra work should expect meaningfully better results than the defensive investor — but most \"active\" investors who consider themselves enterprising actually achieve worse results than the mechanical defensive approach, because they take on the costs and risks of activity without the discipline.",
          highlight: ["defensive investor", "enterprising investor", "dividend record", "earnings stability", "special situations"],
        },
        {
          type: "quiz-mc",
          question:
            "A stock's intrinsic value is estimated at $80 per share. An investor applying a 35% margin of safety would only purchase the stock at or below what price?",
          options: [
            "$52 per share",
            "$45 per share",
            "$28 per share",
            "$65 per share",
          ],
          correctIndex: 0,
          explanation:
            "A 35% margin of safety means buying at 65% of intrinsic value (100% - 35% = 65%). $80 × 0.65 = $52.00. This cushion protects the investor if the intrinsic value estimate turns out to be somewhat too optimistic — even if the true value is only $65, the investor paid $52 and still has a profit. The margin of safety principle is the core of Graham's investment philosophy.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "According to Graham's Mr. Market allegory, an investor should monitor Mr. Market's daily quotes closely and adjust their portfolio based on what the market seems to be signaling about business conditions.",
          correct: false,
          explanation:
            "This is the opposite of Graham's teaching. Mr. Market's daily prices reflect his emotional state — euphoria or despair — not business fundamentals. Graham argued the investor should treat Mr. Market as a servant, not an advisor. You should only accept Mr. Market's offers when they are clearly advantageous (buying when he is irrationally pessimistic, selling when he is irrationally optimistic). Letting Mr. Market's moods guide your decisions is how most investors destroy wealth.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 2: Buffett's Evolution ───────────────────────────────────────────
    {
      id: "value-investing-2",
      title: "Buffett's Evolution",
      description:
        "From Graham-style cigar butts to quality businesses: how Buffett evolved his approach through See's Candies, Coca-Cola, and the moat concept",
      icon: "TrendingUp",
      xpReward: 95,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Cigar Butt Investing — The Graham Phase",
          content:
            "Warren Buffett began his career as a pure Graham disciple, practicing what he later called **cigar butt investing**. The metaphor is intentional and self-deprecating.\n\n**The cigar butt analogy:**\nA discarded cigar on the street may have one puff left in it. It costs nothing to pick up, so even one free puff is pure profit. Similarly, a deeply distressed business trading below its liquidation value might have one last profitable burst before permanently declining.\n\n**How Buffett practiced cigar butt investing (1950s–1960s):**\n- Bought tiny, obscure companies at enormous discounts to net asset value\n- Often acquired enough shares to influence liquidation or asset sales\n- Made no effort to understand or improve the business quality\n- Expected no long-term ownership — just one \"puff\" of value extraction\n\n**Early results:** Buffett Partnership generated roughly 29% annualized returns (1957–1969) — extraordinary performance, largely from cigar butt and arbitrage opportunities.\n\n**The fatal flaw of cigar butt investing:**\nThese are one-time transactions. Once the discount closes, you must find a new discounted asset. Scale becomes impossible — when managing $10 billion, you cannot profitably buy $5 million liquidation candidates. Additionally, mediocre businesses require constant attention, working capital reinvestment, and generate no compounding.\n\n**Buffett's own assessment:** \"It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price.\" This single sentence represents his entire intellectual evolution away from Graham.",
          highlight: ["cigar butt", "liquidation value", "net asset value", "arbitrage", "one-time transaction"],
        },
        {
          type: "teach",
          title: "The See's Candies Lesson",
          content:
            "In 1972, Berkshire Hathaway purchased **See's Candies** for $25 million — a transaction that permanently changed how Buffett thought about business quality and capital allocation.\n\n**The See's Candies economics:**\nAt acquisition, See's had:\n- $8 million in tangible assets (ovens, retail stores, inventory)\n- $4 million in pre-tax earnings\n- A loyal, deeply ingrained customer base in California\n- Strong pricing power — customers associated See's with gift-giving and tradition\n\nBerkshire paid $25 million for a business with $8 million in tangible assets — a huge premium by Graham standards. But the intangible asset was the brand: people would pay more for See's chocolate and feel guilty giving a cheaper alternative.\n\n**What happened over time:**\nBy 2011, See's had earned over $1.65 billion cumulatively from a $25 million investment — requiring virtually no additional capital. The company's tangible assets remained modest; all growth came from pricing power, not capital investment.\n\n**The three lessons from See's:**\n1. **Capital-light compounding**: A truly excellent business can grow earnings without proportional increases in capital employed — every dollar of retained earnings generates more than a dollar of future value\n2. **Pricing power**: The ability to raise prices without losing customers is the purest expression of business quality and customer loyalty\n3. **Intangible assets are real**: Brand value, customer habits, and cultural positioning are economic assets even if they don't appear on the balance sheet\n\n**Why Graham's framework missed this:** Graham's quantitative methods screened on assets and earnings but could not easily quantify the durability and compounding potential of an excellent franchise.",
          highlight: ["See's Candies", "pricing power", "capital-light", "intangible assets", "compounding"],
        },
        {
          type: "teach",
          title: "The Coca-Cola Investment — Quality at Scale",
          content:
            "Buffett's 1988–1989 purchase of Coca-Cola ($1.3 billion invested, ~$10.9 billion market cap at the time) became the canonical example of buying a world-class brand during temporary adversity.\n\n**Why Buffett bought Coke in 1988:**\n- The stock had been depressed following the 1985 \"New Coke\" debacle and general market concerns\n- Roberto Goizueta had just become CEO and was beginning a shareholder-focused capital allocation transformation\n- Buffett analyzed the economics: Coke had the single most recognized brand in the world, with growing international penetration\n- Per-capita soft drink consumption was rising globally, especially in developing markets\n- The business required minimal capital reinvestment to grow — syrup and marketing, not factories\n\n**The investment thesis:**\n- In 1988, Coke traded at roughly 15× earnings — not cheap by Graham standards\n- But Buffett was paying for future earning power, not current assets\n- He estimated Coke's \"owner earnings\" (a concept he developed) and projected 10–15 years of compounding\n- The moat — universal brand recognition, distribution infrastructure, and consumer habit — was essentially unassailable\n\n**The result:**\nBy 1998, Berkshire's $1.3 billion Coke stake was worth ~$13 billion — a 10× return in a decade. Buffett has never sold a single share.\n\n**The key shift in Buffett's thinking:**\nGraham bought things below their current value. Buffett learned to buy businesses whose future value would far exceed their current price — but only when that business had an identifiable, durable competitive advantage.",
          highlight: ["Coca-Cola", "owner earnings", "brand moat", "international growth", "temporary adversity"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the primary reason cigar butt investing becomes ineffective at large scale?",
          options: [
            "Deep discount opportunities are small in size and cannot absorb very large capital allocations",
            "Regulatory agencies prohibit buying distressed companies below book value",
            "Cigar butt stocks are only found in foreign markets, making research expensive",
            "Net-net stocks have poor accounting quality, making valuation unreliable",
          ],
          correctIndex: 0,
          explanation:
            "The core limitation of cigar butt investing at scale is the size of the opportunity set. Deep discount, net-net liquidation candidates are typically tiny, illiquid companies. A fund managing $10 billion cannot move the needle by buying a $5 million net-net stock — the position is too small to matter. This is why Buffett evolved toward buying world-class businesses: a great brand like Coca-Cola can absorb $1+ billion of capital and still compound attractively for decades.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Company A trades at $40 with $50 in tangible book value per share and $2 in earnings — a classic Graham net-net candidate. Company B trades at $60 with only $10 in tangible book value but $5 in earnings and a dominant consumer brand that allows consistent 8–10% annual price increases.",
          question:
            "Applying Buffett's evolved philosophy (not Graham's original criteria), which investment is likely superior and why?",
          options: [
            "Company B — its pricing power and return on equity suggest a durable economic moat that will compound capital well above its tangible asset base",
            "Company A — it trades below tangible book value, providing a larger margin of safety by Graham's original criteria",
            "Company A — higher tangible assets mean lower financial risk in a downturn",
            "Neither — both have P/E ratios too high for disciplined value investing",
          ],
          correctIndex: 0,
          explanation:
            "Company B exemplifies Buffett's evolved approach: 8–10% annual pricing power with only $10 in tangible assets means the business generates extraordinary returns on capital (50% return on equity: $5 EPS / $10 book). Each dollar of earnings retained creates outsized future value. Company A's discount to book looks safe but the low ROE (4% on tangible book) suggests a mediocre business that will erode its asset base over time. Buffett's insight: it's better to pay a fair price for a wonderful business than a bargain price for a mediocre one.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Moat Analysis ──────────────────────────────────────────────────
    {
      id: "value-investing-3",
      title: "Moat Analysis",
      description:
        "Identify and evaluate the five sources of durable competitive advantage: cost advantage, network effects, intangible assets, switching costs, and efficient scale",
      icon: "Shield",
      xpReward: 100,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Five Sources of Economic Moat",
          content:
            "Buffett borrowed the \"economic moat\" metaphor from medieval castles: a wide moat prevents competitors from attacking a profitable business. Morningstar's Pat Dorsey systematized five distinct moat sources that value investors analyze.\n\n**1. Cost Advantage**\nThe ability to produce goods or deliver services at structurally lower costs than competitors — enabling either higher margins at the same price, or lower prices that undercut rivals while still being profitable.\n- Sources: economies of scale, superior processes, unique resource access, lower-cost geographies\n- Examples: Walmart (scale), Southwest Airlines historically (operational efficiency), GEICO (direct sales model)\n- Test: Can competitors match the cost structure by spending capital, or is it structurally impossible?\n\n**2. Network Effects**\nWhen a product or service becomes more valuable as more people use it, creating a self-reinforcing cycle that advantages the incumbent.\n- Direct network effects: Each user adds value to all other users (Visa, Mastercard, exchanges)\n- Indirect network effects: More users on one side attract more users on another side (app stores, marketplaces)\n- Examples: Visa/Mastercard (merchants need them because consumers use them and vice versa), MSCI indices, Bloomberg Terminal\n- Key insight: Network effects are the strongest moat — the leader often captures essentially all the value\n\n**3. Intangible Assets**\nBrands, patents, regulatory licenses, and proprietary data that competitors cannot easily replicate.\n- Brand moat: Customers pay premium prices based on trust, identity, or habit (LVMH, Hermès, Coca-Cola)\n- Patent moat: Legally protected innovation (pharmaceuticals, semiconductor IP)\n- Regulatory license: Government-limited competition (utility franchises, airport slots, banking charters)\n- Data advantage: Proprietary datasets that improve with use (credit bureaus, Verisk Analytics)\n\n**4. Switching Costs**\nFriction that makes it expensive, risky, or time-consuming for customers to switch to a competitor.\n- Financial costs: cancellation fees, migration expenses\n- Learning costs: retraining employees, rebuilding muscle memory\n- Integration costs: ERP systems, CRM databases, accounting software deeply embedded in operations\n- Examples: Oracle database, Salesforce CRM, SAP ERP — enormous switching costs despite high prices\n\n**5. Efficient Scale**\nA market of limited size that is naturally served by one or a very small number of players; new entrants would face immediate price pressure that destroys returns.\n- Examples: A pipeline serving a specific industrial cluster, a regional airport, a specialized medical device for a rare disease\n- The market is profitable for the incumbent but not large enough to attract competition that would still earn adequate returns",
          highlight: ["cost advantage", "network effects", "intangible assets", "switching costs", "efficient scale"],
        },
        {
          type: "teach",
          title: "Moat Durability and Width",
          content:
            "Not all moats are equal. The goal is identifying businesses where the competitive advantage will persist for decades, not years.\n\n**Wide moat indicators:**\n- Return on invested capital (ROIC) consistently above 15% for 10+ years\n- Market share stability or growth despite industry price competition\n- Pricing power: ability to raise prices annually without losing customers\n- Low customer churn / high renewal rates\n- Competitors struggle to gain market share even when they invest heavily\n\n**Narrow moat indicators:**\n- ROIC above cost of capital but only modestly (8–12%) and potentially declining\n- Some differentiation but easily replicated with sufficient capital investment\n- Market share fluctuates — the business defends position but doesn't expand it\n\n**No moat (commodity businesses):**\n- ROIC at or below cost of capital over full business cycles\n- Pricing set by the market; the company is a price-taker\n- Success depends on commodity prices, not business execution\n- Airlines, commodity chemicals, generic pharmaceuticals, bulk shipping\n\n**Assessing moat duration:**\nMorningstar uses a 10-year horizon for narrow moats and 20-year horizon for wide moats. Ask:\n- Will this advantage exist in a world with AI-driven competition?\n- Can a well-funded competitor replicate it in 5 years if they spent $5 billion?\n- Are customers becoming more or less dependent on this product over time?\n\n**The reinvestment test:**\nThe ultimate moat test is whether the business can reinvest earnings at high rates of return. A wide moat combined with large reinvestment opportunities is the holy grail of value investing — exemplified by Berkshire's portfolio construction philosophy.",
          highlight: ["ROIC", "wide moat", "narrow moat", "commodity", "reinvestment rate"],
        },
        {
          type: "teach",
          title: "Moat Erosion — The Silent Threat",
          content:
            "Moats can be destroyed. Recognizing erosion early is critical because the market typically does not price in moat decay until it is already severe.\n\n**Common causes of moat erosion:**\n\n**Technological disruption:**\n- A new technology makes the existing moat irrelevant\n- Kodak had an extraordinary brand and distribution moat — digital photography circumvented it entirely\n- Blockbuster had scale and network effects in physical video rental — streaming made location irrelevant\n- Test: Does the moat defend against the new technology, or does the new technology render the existing advantage obsolete?\n\n**Regulatory change:**\n- Government action can instantly destroy a regulatory moat\n- A pharmaceutical patent expires, and generics flood the market within months\n- A utility's monopoly franchise is opened to competition\n- Always assess: what happens to this business if current regulation changes?\n\n**Customer preference shift:**\n- Brand moats erode when consumer tastes change faster than the brand can adapt\n- Newspapers, department stores, and TV networks all had genuine brand moats that mass digital shift eroded\n- A brand built on nostalgia alone (without product superiority) is especially vulnerable\n\n**Management capital misallocation:**\n- A business with a strong moat can destroy it by reinvesting earnings in poor acquisitions\n- Moat erosion from within: management empire-building, dilutive acquisitions, over-leverage\n\n**The moat erosion checklist:**\n1. Is industry profitability declining? (Structural compression)\n2. Are new entrants gaining share despite existing scale advantages?\n3. Is the company's pricing power weakening (unable to pass through cost increases)?\n4. Are customer renewal rates or satisfaction scores declining?\n5. Is the management team making large acquisitions at premium prices (possible sign of desperation)?",
          highlight: ["moat erosion", "technological disruption", "regulatory change", "brand decay", "capital misallocation"],
        },
        {
          type: "quiz-mc",
          question:
            "A payment network used by 900 million cardholders and 50 million merchants has a moat primarily from which source?",
          options: [
            "Network effects — the network becomes more valuable to each participant as total participation grows",
            "Cost advantage — the network processes transactions at lower cost than competitors",
            "Efficient scale — the payment market is too small to support more than one viable network",
            "Switching costs — merchants and consumers face high technical costs to switch networks",
          ],
          correctIndex: 0,
          explanation:
            "A payment network with 900 million cardholders and 50 million merchants has a classic network effects moat. Merchants accept the card because 900 million consumers use it; consumers carry the card because 50 million merchants accept it. This mutual reinforcement is extraordinarily difficult to break — even a well-funded competitor cannot easily replicate it because the network itself is the product. While switching costs exist (technical integration), the primary economic moat is the direct and indirect network effect binding participants together.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company with a 30% return on invested capital (ROIC) that has declined from 45% over the past five years has a strengthening economic moat.",
          correct: false,
          explanation:
            "Declining ROIC is a key warning sign of moat erosion, not moat strengthening. ROIC measures how efficiently a company converts invested capital into profits — a sustained decline from 45% to 30% suggests competitive pressure is reducing the profitability advantages the company once enjoyed. A strengthening moat would show stable or rising ROIC as the competitive advantage becomes more entrenched. This is why Buffett emphasizes monitoring ROIC trends rather than just the current level.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Intrinsic Value ────────────────────────────────────────────────
    {
      id: "value-investing-4",
      title: "Intrinsic Value",
      description:
        "DCF fundamentals, owner earnings, normalized earnings, sum-of-parts valuation, and private market value — the core toolkit for estimating what a business is actually worth",
      icon: "Calculator",
      xpReward: 110,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Discounted Cash Flow — The Theoretical Foundation",
          content:
            "**Intrinsic value** is defined by Buffett as \"the discounted value of the cash that can be taken out of a business during its remaining life.\" Discounted Cash Flow (DCF) is the formal framework implementing this definition.\n\n**The core DCF logic:**\nA dollar received today is worth more than a dollar received in the future, because the dollar today can be invested to earn returns. To compare future cash flows to today's dollar, we \"discount\" them back using a required rate of return.\n\n**DCF formula:**\n- Intrinsic Value = CF₁/(1+r)¹ + CF₂/(1+r)² + ... + CFₙ/(1+r)ⁿ + Terminal Value/(1+r)ⁿ\n- Where CF = cash flow in each period, r = discount rate, n = forecast period\n\n**Choosing the discount rate:**\n- Conservative value investors often use 10–12% as the required return (roughly long-run equity market return)\n- Higher for riskier businesses; lower for highly predictable, low-risk franchises\n- Using the risk-free rate (government bond yield) plus a risk premium is theoretically correct but introduces its own estimation problems\n\n**DCF's strengths and weaknesses:**\nStrengths: forces explicit assumptions about future cash flows; theoretically rigorous; captures the time value of money.\n\nWeaknesses: small changes in growth rate or discount rate produce enormous changes in output; \"garbage in, garbage out\" — a confident-looking DCF with poor assumptions is worse than a rough estimate. Buffett noted: \"It is better to be approximately right than precisely wrong.\"\n\n**The range of values approach:**\nRather than building one precise DCF, experienced investors build multiple scenarios (bear / base / bull) and assess whether the current price offers an attractive return even under conservative assumptions.",
          highlight: ["DCF", "discount rate", "terminal value", "time value of money", "range of values"],
        },
        {
          type: "teach",
          title: "Owner Earnings — Buffett's Refinement",
          content:
            "Buffett introduced **owner earnings** as a more economically accurate measure of business cash generation than reported net income or even GAAP operating cash flow.\n\n**Owner Earnings Formula:**\n- Owner Earnings = Net Income + Depreciation & Amortization − Maintenance Capital Expenditure ± Changes in Working Capital\n\n**Why owner earnings vs. reported earnings:**\n- Depreciation is a real economic cost (assets genuinely wear out and must be replaced) but GAAP accounting often under- or over-states this\n- \"Maintenance capex\" is the capital spending required just to maintain the current earning power of the business — distinct from growth capex that expands the business\n- Reported earnings can be inflated by overstating asset lives (reducing depreciation) or understating working capital needs\n\n**Identifying maintenance vs. growth capex:**\nThis is the hardest part. Approaches:\n1. Management guidance on capex allocation (treat skeptically)\n2. Industry peer analysis — compare capex/revenue ratios across peers\n3. Normalized analysis: in a year with no growth, total capex approximately equals maintenance capex\n4. \"Can the business maintain its competitive position without this spending?\" — if no, it's maintenance\n\n**Why this matters for valuation:**\n- A business with $100M in reported earnings but $70M in maintenance capex has real owner earnings of ~$30M\n- Another business with $100M in reported earnings but only $10M in maintenance capex has real owner earnings of ~$90M\n- Paying the same multiple for both would drastically overpay for the capital-intensive business\n\n**Capital-light businesses** (software, consumer brands, financial services at scale) typically have owner earnings substantially above reported earnings. **Capital-intensive businesses** (airlines, steel, autos) often have owner earnings well below reported earnings.",
          highlight: ["owner earnings", "maintenance capex", "growth capex", "depreciation", "capital-intensive"],
        },
        {
          type: "teach",
          title: "Normalized Earnings, Sum-of-Parts, and Private Market Value",
          content:
            "Beyond DCF and owner earnings, value investors use several complementary valuation approaches that triangulate intrinsic value from different angles.\n\n**Normalized Earnings:**\nActual earnings in any single year can be distorted by one-time items, economic cycles, litigation charges, or restructuring costs. Normalized earnings strip out these distortions to reveal underlying earning power.\n\nApproach:\n- Average earnings over 5–10 full economic cycle years\n- Adjust for one-time items (asset sales, lawsuit settlements, write-offs)\n- Identify \"under-earning\" caused by temporary industry conditions vs. structural deterioration\n- Apply a normalized P/E multiple to arrive at intrinsic value\n\nExample: A cyclical steel company earned $0.50/share in a recession year but normalized earnings (averaged across the cycle) are $3.00/share. Applying 8× to $3.00 gives $24 — very different from applying 8× to the depressed $0.50 reported EPS.\n\n**Sum-of-Parts (SOTP) Valuation:**\nConglomerate businesses with multiple distinct divisions are often best valued by summing separate valuations for each division.\n- Value each segment using appropriate comparable transactions or trading multiples\n- Add corporate overhead as a negative value (capitalized at a multiple)\n- Compare SOTP to current market cap — if SOTP is substantially higher, the market is applying a \"conglomerate discount\"\n- Catalysts that unlock SOTP value: spinoffs, divestitures, activist investor campaigns\n\n**Private Market Value (PMV):**\nWhat would a rational, fully-informed private buyer pay to acquire the entire business?\n- Uses acquisition multiples from comparable private transactions\n- Often higher than public market values due to control premium, strategic synergies, and tax structuring\n- Mario Gabelli popularized this approach: if PMV substantially exceeds market price, patient investors can wait for the gap to close via buyout, privatization, or activist pressure\n\n**Triangulation principle:** When DCF, normalized P/E, SOTP, and PMV all point to a similar value range, confidence in the intrinsic value estimate is substantially higher.",
          highlight: ["normalized earnings", "sum-of-parts", "private market value", "conglomerate discount", "triangulation"],
        },
        {
          type: "quiz-mc",
          question:
            "A manufacturing company reports net income of $50M, depreciation of $20M, and total capital expenditures of $35M. Management says $25M of that capex is maintenance and $10M is for new capacity expansion. What are the approximate owner earnings?",
          options: [
            "$45M — net income + D&A minus maintenance capex ($50M + $20M − $25M)",
            "$35M — net income minus total capex ($50M − $35M + $20M)",
            "$50M — net income since depreciation and capex roughly offset each other",
            "$70M — net income plus total depreciation ($50M + $20M)",
          ],
          correctIndex: 0,
          explanation:
            "Owner earnings = Net Income + Depreciation − Maintenance Capex = $50M + $20M − $25M = $45M. The $10M of growth capex is excluded because it represents investment in new capacity, not the cost of maintaining existing earning power. Notice that this company's owner earnings ($45M) are close to reported net income ($50M) — the depreciation and maintenance capex largely offset each other. For a more capital-intensive business, maintenance capex could greatly exceed depreciation, making owner earnings significantly below reported earnings.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Contrarian Investing ──────────────────────────────────────────
    {
      id: "value-investing-5",
      title: "Contrarian Investing",
      description:
        "Capitalize on market fear, spin-off opportunities, post-bankruptcy equities, and institutionally neglected situations where prices diverge dramatically from value",
      icon: "Zap",
      xpReward: 105,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Buying Fear — The Psychology of Contrarian Opportunity",
          content:
            "Contrarian investing is the systematic practice of leaning against market sentiment — buying when others are panicking and avoiding (or selling) when others are euphoric. It is psychologically one of the most difficult disciplines in investing.\n\n**Why contrarian opportunities arise:**\n- Fear causes indiscriminate selling: a sector scandal leads investors to sell all companies in that sector, including those uninvolved in the problem\n- Narrative dominates: a company's stock price is driven by the prevailing story, even when the underlying business economics are unchanged\n- Forced sellers: mutual fund redemptions, margin calls, index rebalancing, and institutional guidelines create selling unrelated to fundamentals\n- The news is always worst at the bottom: maximum pessimism coincides with maximum opportunity\n\n**Historical examples of contrarian opportunity:**\n- 2008–2009: Bank stocks trading below tangible book value; quality financial companies were being sold alongside toxic mortgage lenders\n- 2020: March COVID crash — quality businesses fell 30–50% based on fear, not permanent business impairment\n- Post-9/11: Airline and travel stocks obliterated; the sector was fundamentally altered but quality businesses ultimately recovered\n\n**The contrarian checklist:**\n1. Is the business experiencing a permanent impairment or a temporary adversity?\n2. Is the decline business-specific or sector-wide? (Sector panic creates the best bargains)\n3. What is the base rate of recovery for this type of adversity?\n4. Is the balance sheet strong enough to survive the adverse period?\n5. At current prices, what return is achievable if the business simply returns to pre-crisis earnings?\n\n**The temperament requirement:**\nContrarian investing requires the ability to act when the data feels most scary. The investor who buys when headlines are alarming and peers are selling is buying when emotional feedback is most negative — a genuinely unnatural act.",
          highlight: ["contrarian", "forced sellers", "sector panic", "temporary adversity", "permanent impairment"],
        },
        {
          type: "teach",
          title: "Spin-Offs and Post-Bankruptcy Equities",
          content:
            "Two of the most reliably mis-priced security categories are **spin-offs** and **post-bankruptcy equities** — both create structural selling pressure that creates opportunity for prepared investors.\n\n**Spin-Off Opportunities:**\nWhen a company separates a division into an independent publicly traded entity, several structural forces create underpricing:\n\n1. **Institutional dumping**: Index funds, sector ETFs, and funds with market cap minimums receive shares in the spin-off but are prohibited or unwilling to hold them → forced selling at any price\n2. **Employee incentives reset**: Post-spin management often receives new equity compensation, aligning their interests with new shareholders from day one\n3. **Small size relative to parent**: A $500M spin-off from a $10B parent is too small for large institutions, creating an underfollowed niche\n4. **Hidden quality**: The parent may have \"housed\" a high-quality division inside a conglomerate at below-market valuations — separation unlocks this\n\nJoel Greenblatt documented that spin-offs outperform the S&P 500 by ~10% annually in the first 3 years post-separation (based on 1965–1988 data).\n\n**Post-Bankruptcy Equities:**\nCompanies that have just emerged from Chapter 11 bankruptcy are systematically undervalued for structural reasons:\n\n1. **Stigma selling**: Many investors refuse to hold a company that \"went bankrupt\" regardless of its current financial health\n2. **Institutional restrictions**: Many funds prohibit holding companies that were in bankruptcy within the past 5 years\n3. **Balance sheet reset**: Bankruptcy eliminates the prior equity holders' debt — the reorganized company often emerges with zero debt and a fully restructured cost base\n4. **Management incentives**: New management teams with fresh equity grants are highly motivated\n5. **Overlooked research**: Sell-side analysts drop coverage during bankruptcy; the reorganized company may trade for months with no analyst coverage\n\nMartin Whitman and other distressed debt specialists have documented that reorganized equities frequently outperform in the first 1–3 years post-emergence.",
          highlight: ["spin-off", "post-bankruptcy", "forced selling", "institutional restrictions", "management incentives"],
        },
        {
          type: "teach",
          title: "Neglected Stocks and Institutional Neglect",
          content:
            "**Institutional neglect** refers to situations where large professional money managers cannot or will not own a security — creating an opportunity for individual investors and smaller funds who face fewer constraints.\n\n**Why institutional neglect creates opportunity:**\n- Institutions have minimum market cap requirements (typically $1–5 billion for large funds)\n- Companies too small to move the needle for a $10B fund get no institutional attention\n- Small-cap and micro-cap stocks below $300M market cap are largely ignored by Wall Street research\n- The result: pricing inefficiencies persist because the sophisticated capital that would normally eliminate them is structurally excluded\n\n**Categories of neglected stocks:**\n\n**1. Small and Micro-Cap:**\n- Below $300M market cap — below the radar for most institutions\n- Academic research consistently shows a small-cap premium over the long run\n- Requires patience: small-caps can remain undervalued for years\n\n**2. No Analyst Coverage:**\n- Companies with zero sell-side analyst coverage are priced entirely by retail investors and small funds\n- Many excellent businesses are simply unknown because they don't pay for Wall Street attention\n\n**3. Geographic Neglect:**\n- A quality business in a country or region that is politically unpopular gets sold regardless of company fundamentals\n- Deep value investors have historically found exceptional opportunities in markets experiencing temporary political stress\n\n**4. Industry Stigma:**\n- Certain industries (tobacco, gaming, firearms) face institutional avoidance due to ESG policies\n- This creates structural undervaluation for businesses with excellent economics that ESG-constrained funds won't touch\n\n**The neglect premium:**\nThe behavioral and structural basis for neglected stock outperformance is well-documented. The mechanism: as small companies grow into institutions' minimum size requirements, more buyers emerge and the valuation discount compresses — generating alpha for early investors.",
          highlight: ["institutional neglect", "small-cap", "micro-cap", "no analyst coverage", "industry stigma"],
        },
        {
          type: "quiz-mc",
          question:
            "A large consumer goods conglomerate spins off its specialty chemicals division as an independent company. In the first two weeks after the spin-off, the chemicals stock falls 15% despite no negative business news. What is the most likely structural explanation?",
          options: [
            "Index funds and large-cap institutions that received shares automatically are selling because the spinoff is too small or outside their mandate",
            "The chemicals division had hidden losses that are now visible as a standalone company",
            "Post-spin management sold their personal shares, signaling poor confidence in the business",
            "The parent company is engaging in predatory pricing to recapture the division's customers",
          ],
          correctIndex: 0,
          explanation:
            "Spin-off selling in the first weeks post-separation is almost always structural, not fundamental. Large index funds, sector ETFs, and institutional mandates that received shares in the spin-off often cannot hold them (wrong sector, too small, below market cap minimums) and dump them at any price. This creates a temporary technical selling overhang unrelated to business quality. Joel Greenblatt documented that this structural selling creates some of the most reliable mispricings in public equity markets — the informed contrarian step in while institutions are forced out.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Value Traps ────────────────────────────────────────────────────
    {
      id: "value-investing-6",
      title: "Value Traps",
      description:
        "Identify stocks that appear cheap but deserve to be — the falling knife, mean reversion failures, disruption risk, and the crucial distinction between value and quality",
      icon: "AlertTriangle",
      xpReward: 115,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Falling Knife — When Cheap Gets Cheaper",
          content:
            "The most common and painful value trap is the **falling knife**: a stock that looks cheap on historical metrics but whose underlying business is deteriorating faster than the declining price can reflect.\n\n**Why falling knives occur:**\n- The stock was expensive (e.g., 30× earnings at its peak) and declines to 15× earnings\n- It looks cheap relative to history — the P/E has halved\n- But earnings continue to decline, so in 12 months the forward P/E is back at 30× on lower earnings\n- The investor buys on apparent cheapness and watches the stock continue falling as earnings collapse\n\n**The key diagnostic question:**\nIs the earnings decline cyclical (temporary, will mean-revert) or structural (permanent, will not recover)?\n\n**Cyclical decline:**\n- Earnings fall because the economy slows or commodity prices drop\n- Underlying business model and competitive position are intact\n- History shows earnings recover when the cycle turns\n- Classic value opportunity: buy during cyclical trough at below-normal earnings\n\n**Structural decline:**\n- Earnings fall because the business model is being disrupted or is losing competitive position\n- Lower earnings are not the trough — they are the beginning of a long decline\n- The low P/E multiple may actually be fair given the deteriorating earnings trajectory\n- Classic value trap: newspaper companies trading at \"cheap\" P/Es throughout the 2000s while advertising dollars migrated to digital\n\n**Warning signs of falling knives:**\n- Market share is declining not just because of macro factors, but because customers are actively leaving for competitors\n- The revenue decline is accelerating, not stabilizing\n- Management is using non-GAAP adjustments to hide deteriorating economics\n- Capex is being cut aggressively (harvesting the business rather than investing)\n- Insider selling during the price decline",
          highlight: ["falling knife", "structural decline", "cyclical decline", "earnings deterioration", "mean reversion"],
        },
        {
          type: "teach",
          title: "Mean Reversion Failure and Disruption Risk",
          content:
            "Value investing's foundation is the belief that depressed earnings and prices will eventually mean-revert to normal. This assumption fails in two systematic ways.\n\n**Mean Reversion Failure:**\nMean reversion assumes there is a \"normal\" level that earnings will return to. But for some businesses, the depressed level becomes the new normal — or worse, the beginning of permanent structural decline.\n\nCases where mean reversion fails:\n- **Secular revenue decline**: The addressable market is shrinking (print media, physical retail, land-line telecommunications)\n- **Pricing power destruction**: Competitors have permanently changed the pricing dynamic (generic drug entry, Amazon entering a market)\n- **Customer behavior shift**: A generational change in consumer preferences that does not reverse (DVD rental, department store shopping)\n- **Technology substitution**: The product itself is being replaced by something functionally superior at lower cost\n\n**The disruption risk framework:**\nBefore assuming mean reversion, ask:\n1. Is there a new technology or business model that offers customers a better value proposition?\n2. Is the disruption improving in a predictable trajectory (cost curves, adoption rates) that suggests the incumbent will continue losing share?\n3. Does management have the cultural and operational capacity to respond effectively?\n4. Even if management responds, would the response destroy margins (e.g., transitioning from high-margin physical to low-margin digital)?\n\n**The innovator's dilemma trap:**\nIncumbents often appear cheap precisely because they face a credible disruptive threat. The low P/E reflects the market's assessment of structural headwinds. Buying a disrupted incumbent because it \"looks cheap\" is betting against technological progress.\n\n**The newspapers example:**\nNewspaper companies traded at 8–12× earnings in 2003–2005, appearing cheap by historical standards. But advertising dollars were already migrating to digital. Earnings declined 30–50% over the next decade. Investors who bought \"cheap\" newspapers locked in compounding losses.",
          highlight: ["mean reversion", "secular decline", "disruption risk", "innovator's dilemma", "structural headwinds"],
        },
        {
          type: "teach",
          title: "Value vs Quality — The Crucial Distinction",
          content:
            "The most sophisticated form of value trap is confusing statistical cheapness with true investment value. A stock can be \"cheap\" by every quantitative metric and still be a poor investment.\n\n**Statistical cheapness vs. investment value:**\n\nStatistically cheap (but potentially value traps):\n- Low P/E relative to history or peers\n- Trades below book value\n- Low EV/EBITDA multiple\n- High dividend yield\n\nThese metrics capture the current snapshot but say nothing about the trajectory of value over time.\n\n**The quality dimension:**\nA high-quality business compounds intrinsic value continuously — even while the investor waits for the discount to close, the business is creating additional value. A low-quality business erodes intrinsic value — by the time the discount closes, the business is worth less than when you bought it.\n\n**The test of time:**\n- Imagine buying the business and holding for 10 years with no ability to sell\n- Would you be happy with the business you owned at year 10?\n- Would the earnings power be higher, lower, or roughly the same?\n- Has the competitive position strengthened or weakened?\n\n**Quality markers to require in value investments:**\n1. Positive free cash flow in all but the most severe economic environments\n2. Return on equity consistently above 12–15% without excessive leverage\n3. Stable or growing market share over the past decade\n4. Management with a track record of rational capital allocation (buybacks at low prices, acquisitions at reasonable prices)\n5. The business could survive and eventually recover from a 30% revenue decline\n\n**Graham's evolved view:**\nGraham himself acknowledged in later editions of \"The Intelligent Investor\" that paying more for quality had merit — his early, purely quantitative approach was suitable for smaller portfolios but the relationship between price and quality was more nuanced than his formulas suggested.\n\n**Buffett's synthesis:** \"Time is the friend of the wonderful business, the enemy of the mediocre.\" A wonderful business bought at a fair price will outperform a mediocre business bought at a deep discount over any long time horizon.",
          highlight: ["statistical cheapness", "quality", "compounding intrinsic value", "return on equity", "capital allocation"],
        },
        {
          type: "quiz-mc",
          question:
            "A retailer is trading at 6× earnings — well below its 10-year average of 14× earnings. The company has closed 200 of its 800 locations over the past 3 years, revenue has declined 8% annually, and e-commerce competitors have captured 40% of its addressable market. What is the most appropriate conclusion?",
          options: [
            "This is likely a value trap — the low P/E reflects rational pricing of a business in structural secular decline",
            "This is a contrarian opportunity — the market is overreacting to temporary retail headwinds",
            "The stock is a buy because its P/E has declined to less than half its historical average",
            "Management should be replaced but the underlying business is sound at current valuations",
          ],
          correctIndex: 0,
          explanation:
            "The combination of accelerating store closures, persistent revenue decline, and 40% market share already captured by e-commerce competitors suggests structural secular decline, not cyclical adversity. In this case, the low P/E multiple is not irrational pessimism but accurate pricing of a deteriorating earnings trajectory. If revenue continues declining 8% annually and the company maintains a 6% net margin, earnings will approximately halve in 9 years. A stock trading at 6× today's earnings but 12× earnings 9 years from now has not actually gotten cheaper — it has gotten appropriately priced for a business that has lost half its earning power. This is the essence of a value trap.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "You are analyzing two stocks: Stock A is a software company trading at 22× free cash flow with 20% annual revenue growth, expanding margins, and high customer switching costs. Stock B is a legacy hardware company trading at 8× earnings with flat revenue, declining market share, and facing software-based competition that eliminates the need for its physical products.",
          question:
            "Applying the value vs quality framework, which situation best represents a value trap?",
          options: [
            "Stock B — the low P/E multiples reflects genuine structural headwinds; the business is unlikely to maintain current earnings",
            "Stock A — the high P/E multiple leaves no margin of safety and guarantees a value trap",
            "Both — neither stock meets Graham's quantitative criteria for safe value investing",
            "Neither — both stocks should be evaluated purely on whether they trade below Graham Number",
          ],
          correctIndex: 0,
          explanation:
            "Stock B is the textbook value trap: the low 8× P/E looks statistically cheap, but the combination of flat revenue, declining market share, and technology substitution (software replacing hardware) suggests earnings will decline significantly. The multiple will expand over time relative to lower future earnings, ultimately revealing that \"8×\" was not actually cheap. Stock A's 22× FCF multiple may be fair or even cheap if 20% growth and expanding margins continue — high-quality businesses often deserve premium multiples. The quality framework demands asking: what will these businesses be worth in 10 years? Software with switching costs compounds value; declining hardware harvests it.",
          difficulty: 3,
        },
      ],
    },
  ],
};
