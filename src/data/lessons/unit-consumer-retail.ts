import type { Unit } from "./types";

export const UNIT_CONSUMER_RETAIL: Unit = {
  id: "consumer-retail",
  title: "Consumer & Retail Investing",
  description:
    "Master consumer discretionary vs staples, retail valuation, same-store sales, brand economics, and consumer behavior cycles",
  icon: "ShoppingCart",
  color: "#f97316",
  lessons: [
    // ─── Lesson 1: Consumer Staples vs Discretionary ─────────────────────────────
    {
      id: "cr-1",
      title: "🛒 Consumer Staples vs Discretionary",
      description:
        "Inelastic vs elastic demand, economic cycle performance, pricing power, and sector rotation",
      icon: "ShoppingCart",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🧴 Staples: Inelastic Demand & Recession Resilience",
          content:
            "**Consumer staples** are goods people buy regardless of economic conditions — food, beverages, household products, and personal care.\n\n**Key characteristics:**\n- **Inelastic demand**: price increases don't significantly reduce volume; people still buy toothpaste during recessions\n- **Low beta** (0.3–0.7): stock prices move less than the market; defensive positioning\n- **Recession-resistant**: stable revenues even as GDP contracts\n- **High dividend yields**: Coca-Cola, Procter & Gamble, Colgate — steady cash flows support dividends\n\n**Key metrics for staples:**\n- **Volume growth**: units sold (organic, not price-driven)\n- **Price/mix**: how much revenue growth comes from price hikes vs mix shift to premium SKUs\n- **Market share**: gaining or losing shelf space in grocery stores\n- **Distribution breadth**: points of distribution (PODs) — number of stores stocking the product\n\n**Pricing power** is the ultimate staples moat: the ability to raise prices without losing volume. Coca-Cola has raised prices consistently for decades. Private label competition constrains pricing power for commodity-like staples (canned goods vs branded cereals).\n\nExample: P&G raised prices 8% in 2022 during inflation. Volume declined only 1–2% — pricing power held. That 6–7% net revenue gain went straight to operating leverage.",
          highlight: ["inelastic demand", "low beta", "pricing power", "volume growth", "price/mix", "distribution"],
        },
        {
          type: "teach",
          title: "👟 Discretionary: Elastic Demand & Economic Cycles",
          content:
            "**Consumer discretionary** covers goods and services people buy when they have money to spare: clothing, restaurants, autos, travel, entertainment, and luxury goods.\n\n**Key characteristics:**\n- **Elastic demand**: demand drops sharply when consumers feel squeezed; people delay buying a new car or skip vacations\n- **High beta** (1.2–1.8): amplifies market moves; strong cyclical swings\n- **Cyclical performance**: outperforms in economic expansions, underperforms in recessions\n- **Consumer confidence sensitivity**: Conference Board Consumer Confidence Index is a leading indicator for sector performance\n\n**Sector performance by economic cycle:**\n| Phase | Best Sectors | Worst Sectors |\n|---|---|---|\n| Early recession | Staples, Healthcare, Utilities | Discretionary, Financials |\n| Late recession / Recovery | Financials, Industrials | Staples (defensive rotation reverses) |\n| Expansion | Discretionary, Tech, Energy | Staples (lag bull market) |\n| Late cycle | Energy, Materials | Discretionary (rates rise) |\n\n**Case study — COVID and recovery:**\n- March 2020: XLP (staples ETF) fell 18%; XLY (discretionary ETF) fell 35%\n- Recovery through 2021: XLY surged 50%+ as stimulus drove spending on goods (Nike, Amazon); XLP lagged at +20%\n- 2022 inflation shock: staples outperformed again as consumers shifted to value brands",
          highlight: ["elastic demand", "high beta", "consumer confidence", "cyclical", "sector rotation", "XLP", "XLY"],
        },
        {
          type: "teach",
          title: "⚡ Pricing Power: The Ultimate Moat",
          content:
            "**Pricing power** — the ability to raise prices without meaningfully losing volume — is the clearest sign of brand strength and competitive moat in consumer investing.\n\n**How to measure pricing power:**\n1. **Price elasticity of demand**: % change in volume ÷ % change in price. A number between 0 and -1 means inelastic (pricing power). Below -1 is elastic (limited pricing power).\n2. **Gross margin trend**: companies with pricing power see gross margins hold or expand during inflation; commodity businesses see compression\n3. **Private label competition**: when retailer store brands grab share, branded pricing power is eroding\n\n**Coca-Cola (KO) — Staples pricing power:**\n- Iconic brand, global distribution, decades of consumer loyalty\n- Can raise concentrate prices to bottlers; bottlers pass to consumers\n- Beta ~0.55; 60+ consecutive years of dividend increases\n- Revenue is defensive: people drink Coke during recessions\n\n**Nike (NKE) — Discretionary with pricing power:**\n- Premium brand allows above-average ASPs (average selling prices)\n- DTC (direct-to-consumer) shift improves margins and pricing control\n- But still cyclical: in 2022-2023 recession fears, NKE fell 50% from peak as consumers traded down\n- Beta ~1.2 vs KO's 0.55\n\n**The core insight**: pricing power buffers staples companies from both inflation and competition. Discretionary companies can have pricing power (luxury, Nike) but still face volume cyclicality.",
          highlight: ["pricing power", "price elasticity", "gross margin", "private label", "DTC", "ASP", "moat"],
        },
        {
          type: "quiz-mc",
          question:
            "Consumer confidence drops 20 points to a multi-year low. Which sector most likely outperforms over the next 6 months?",
          options: [
            "Consumer staples — inelastic demand for essentials stays stable, defensive rotation drives inflows",
            "Consumer discretionary — lower prices attract bargain hunters to clothing and restaurant stocks",
            "Technology — growth stocks benefit from falling interest rates in a weakening economy",
            "Energy — commodity prices spike as supply constraints dominate over demand weakness",
          ],
          correctIndex: 0,
          explanation:
            "Consumer confidence drops signal reduced discretionary spending — people cut dining out, fashion purchases, and big-ticket items. Investors rotate into staples (food, beverages, household products) which have inelastic demand. Historically, XLP (staples ETF) outperforms XLY (discretionary ETF) by 10–20 percentage points in the 6 months following sharp confidence drops.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A consumer staples company with a beta of 0.55 would be expected to fall 10% if the broader market falls 20%.",
          correct: true,
          explanation:
            "True. Beta measures sensitivity to market moves: expected move ≈ beta × market move. A beta of 0.55 implies an expected decline of 0.55 × 20% = 11%. Staples' low beta reflects their defensive demand profile — consumers keep buying food and household products even as discretionary spending collapses. This is precisely why portfolio managers overweight staples during downturns.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A consumer staples company reported: volume growth +1%, price/mix contribution +6%, total organic revenue growth +7%. Gross margin held flat despite input cost inflation of 4%. A consumer discretionary peer reported: revenue +15% but only from new store openings; same-store sales -4%.",
          question: "Which company shows stronger fundamental business health?",
          options: [
            "The staples company — pricing power absorbed inflation with flat margins; organic volume growth is positive",
            "The discretionary company — 15% revenue growth shows strong top-line momentum",
            "Both are equal — different business models make comparison irrelevant",
            "The discretionary company — same-store sales are temporary and will recover",
          ],
          correctIndex: 0,
          explanation:
            "The staples company demonstrates real pricing power: raised prices 6%, held margins flat vs 4% input cost inflation, and maintained positive volume. This is high-quality organic growth. The discretionary company's 15% revenue is entirely from new units — the underlying business (existing stores) is deteriorating at -4% SSS. New stores add fixed costs; if unit economics are weak, expansion destroys value.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Retail Valuation Framework ────────────────────────────────────
    {
      id: "cr-2",
      title: "🏪 Retail Valuation Framework",
      description:
        "Same-store sales, four-wall EBITDA, inventory turns, ROIC, and store economics payback analysis",
      icon: "BarChart2",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📊 Same-Store Sales: The Quality Test for Retail Growth",
          content:
            "**Same-store sales (SSS)**, also called **comparable store sales** or **comps**, measure revenue growth from stores open for at least 12 months — stripping out the effect of new unit openings.\n\n**Why SSS matters:**\n- New stores add revenue but also add costs (rent, labor, pre-opening). SSS tells you if the existing base is healthy.\n- Negative SSS with total revenue growth = new store growth masking a declining business\n- Sustained positive SSS = true demand growth, traffic and/or ticket improvements\n\n**SSS decomposition:**\nSSS = Traffic growth × Average ticket change\n- Traffic -3%, ticket +5% → SSS ≈ +2% (price-driven, not traffic-driven — less healthy)\n- Traffic +4%, ticket +2% → SSS ≈ +6% (volume-driven growth — strongest signal)\n\n**E-commerce penetration impact:**\nAs online channels grow, physical store productivity (sales per square foot) often declines. Retailers must track **omnichannel SSS** (in-store + online attributed to store trade area) vs pure in-store SSS.\n\nExample: Target's Q1 2023 comps:\n- In-store: +2.4%\n- Digital: +1.4%\n- Blended: +0.7% (mix shift to lower-margin categories offset volume gains)\n\n**Rule of thumb:** Retail stocks trade 1–2 SSS percentage points of deviation from expectations × ~3–5% stock move. A miss from +2% to -1% (3 point miss) = ~9–15% stock decline on earnings day.",
          highlight: ["same-store sales", "comps", "traffic", "average ticket", "omnichannel", "sales per square foot"],
        },
        {
          type: "teach",
          title: "🏢 Four-Wall EBITDA, Inventory Turns & Store Economics",
          content:
            "**Four-wall EBITDA** is the profit generated by an individual store before corporate overhead allocation — the cleanest measure of store-level profitability.\n\nFour-wall EBITDA = Store Revenue – COGS – Store Labor – Store Rent – Direct Store Costs\n(excludes: G&A, marketing, IT, D&A at corporate level)\n\n**Why it matters:**\n- Tells you if individual stores are profitable before corporate drag\n- New store underwriting: if four-wall EBITDA is positive in year 1–2, the unit model works\n- A retailer with negative four-wall EBITDA on average stores is structurally broken\n\n**Payback period** = Initial store capex ÷ Annual four-wall EBITDA\nExample: store buildout costs $500K; four-wall EBITDA = $200K/year\nPayback = 2.5 years — strong unit economics\n\n**Inventory turns** = Annual COGS ÷ Average Inventory\n- Higher turns = less cash tied up, fresher merchandise, lower markdown risk\n- Grocery: 15–25× | Fast fashion (Zara): 12–15× | Apparel specialty: 3–5× | Luxury: 1–2×\n\n**GMROI** (Gross Margin Return on Inventory Investment):\nGMROI = Gross Margin $ ÷ Average Inventory Cost\nExample: $4M gross margin on $1M average inventory = 4.0× GMROI\nBenchmark: GMROI > 3.0× is healthy for most specialty retail\n\n**ROIC** (Return on Invested Capital) is the ultimate retail efficiency metric:\nROIC = NOPAT ÷ Invested Capital\nCapital-light retailers (franchise models) earn 20–40% ROIC; capital-heavy (own stores, distribution centers) earn 8–15%.",
          highlight: ["four-wall EBITDA", "payback period", "inventory turns", "GMROI", "ROIC", "invested capital"],
        },
        {
          type: "teach",
          title: "🌐 E-Commerce Penetration & Physical Store Productivity",
          content:
            "E-commerce has structurally compressed physical store economics — a key valuation risk for traditional retailers.\n\n**Sales per square foot** is the primary productivity metric for physical retail:\n- Apple Stores: ~$5,500/sqft (highest in retail)\n- Lululemon: ~$1,500/sqft\n- Average specialty retail: $300–$500/sqft\n- Struggling department stores: <$150/sqft\n\n**E-commerce cannibalization:**\n- Online channels often serve the same customers as stores; growth in one comes partly at the expense of the other\n- BUT: buy-online-pickup-in-store (BOPIS) drives incremental store traffic; omnichannel shoppers spend 2–3× more than single-channel customers\n\n**The profitability trap:**\nPhysical stores have high fixed costs (rent, labor). As volume shifts online:\n- Fixed cost per transaction rises for stores\n- Online has its own cost structure: fulfillment, shipping, returns (return rates 20–30% vs 5–8% in-store)\n- Neither channel may be profitable at scale — the 'omnichannel paradox'\n\n**Retailer survival framework:**\n1. High ROIC, low square footage per location → resilient (Dollar General)\n2. Strong brand with DTC online margins → resilient (Lululemon, Nike)\n3. Undifferentiated mid-tier with legacy real estate costs → at risk (many department stores)",
          highlight: ["sales per square foot", "BOPIS", "omnichannel", "fulfillment cost", "return rate", "DTC"],
        },
        {
          type: "quiz-mc",
          question:
            "A retailer opens 100 new stores this year, growing total revenue +18%. Same-store sales are -3%. How should an investor interpret this?",
          options: [
            "Revenue growth is low quality — new stores add costs while the existing base deteriorates; expansion may be destroying value",
            "Excellent growth — 18% revenue growth is well above the industry average regardless of SSS",
            "SSS of -3% is acceptable because new store costs temporarily depress existing store metrics",
            "The company should accelerate new store openings to offset the SSS decline",
          ],
          correctIndex: 0,
          explanation:
            "Negative SSS with revenue growth driven purely by new unit openings is a classic retail value trap. Each new store adds fixed costs (rent, labor) — if the underlying unit economics are deteriorating (-3% SSS), new stores may be diluting returns on invested capital. Eventually SSS deterioration catches up. The market will eventually discount earnings as existing store cash flows shrink and the growth story loses credibility.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A retailer increasing inventory turns from 4× to 6× would reduce working capital requirements, freeing up cash.",
          correct: true,
          explanation:
            "True. Inventory turns = COGS ÷ Average Inventory. Higher turns mean less inventory is held at any time. If COGS is $120M: at 4× turns, average inventory = $30M. At 6× turns, average inventory = $20M — freeing $10M of working capital. This cash can fund store openings, buybacks, or dividends without external financing. Faster turns also reduce markdown risk (stale inventory sold at discount) and improve gross margins.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Retailer A: 500 stores, four-wall EBITDA $300K/store, new store capex $600K, ROIC 22%. Retailer B: 200 stores, four-wall EBITDA $150K/store, new store capex $800K, ROIC 9%. Both have the same total EBITDA of $150M.",
          question: "Which retailer deserves a higher EV/EBITDA multiple and why?",
          options: [
            "Retailer A — superior ROIC (22% vs 9%) and faster payback (2 vs 5.3 years) means every growth dollar creates more value",
            "Retailer B — fewer stores means more white space and a larger growth opportunity ahead",
            "Equal multiples — same total EBITDA means the same intrinsic value",
            "Retailer B — lower store count means lower execution risk in expansion",
          ],
          correctIndex: 0,
          explanation:
            "ROIC is the key valuation driver for retail. Retailer A's payback = $600K / $300K = 2 years; ROIC 22% far exceeds the cost of capital (~8–10%). Every new store creates immediate value. Retailer B's payback = 5.3 years with ROIC of 9% — barely above cost of capital; expansion is marginally value-creating at best. Retailer A deserves a 2–3 turn EV/EBITDA premium. High-ROIC compounders like Chipotle and Domino's trade at 30–40× EBITDA vs struggling retailers at 4–6×.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Brand Economics ────────────────────────────────────────────────
    {
      id: "cr-3",
      title: "💎 Brand Economics",
      description:
        "Brand equity, DTC advantages, luxury moats, private label threats, and measuring brand value",
      icon: "Star",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🏷️ Brand Equity: Willingness to Pay Premium",
          content:
            "**Brand equity** is the economic value a brand adds above and beyond the functional product — measured as consumers' willingness to pay a price premium over generic alternatives.\n\n**How brands create value:**\n1. **Price premium**: branded aspirin at $8 vs generic at $3 — 167% premium for identical acetaminophen\n2. **Volume premium**: stronger distribution, shelf placement, repeat purchase rates\n3. **Lower cost of customer acquisition**: high awareness reduces marketing spend per conversion\n4. **Extension potential**: trusted brand enters new categories (Apple → wearables → services)\n\n**Quantifying brand equity:**\n- **Price elasticity advantage**: branded goods have lower price elasticity than generics\n- **Brand value estimates** (Interbrand, Forbes): Coca-Cola brand value ~$35B, Apple ~$500B\n- **Excess return on assets**: brand value = premium P/B ratio × book value\n  Example: company trades at 5× book value when sector avg is 2×. Excess = 3× book ≈ brand + intangibles\n\n**Brand building vs brand harvesting:**\n- **Building**: increase marketing spend, invest in quality, DTC expansion. Short-term margin pressure, long-term equity compounding\n- **Harvesting**: cut marketing, raise prices, extend brand to cheap products. Short-term margin boost, long-term brand erosion\n- Red flag: management that cuts A&P (advertising & promotion) to hit quarterly EPS — they're harvesting brand equity",
          highlight: ["brand equity", "price premium", "willingness to pay", "brand harvesting", "brand building", "A&P"],
        },
        {
          type: "teach",
          title: "🏬 Direct-to-Consumer: Margins, Data & Customer Ownership",
          content:
            "**Direct-to-consumer (DTC)** means selling to end consumers through owned channels (brand.com, brand stores) rather than through wholesale retailers (department stores, third-party e-commerce).\n\n**DTC economics:**\n| Channel | Gross Margin | Customer Data | Pricing Control |\n|---|---|---|---|\n| Wholesale to Retailer | 40–50% | None | Limited |\n| Marketplace (Amazon) | 50–60% | Limited | Moderate |\n| DTC (own website) | 65–75% | Full | Full |\n| Brand retail stores | 60–70% | Partial | Full |\n\n**Why DTC shifts matter:**\n- Every DTC dollar earned generates 15–25% more gross profit than wholesale\n- Customer data: purchase history, browsing behavior, demographics → personalization and retention\n- Nike's DTC shift: wholesale was 70% of revenue in 2012; DTC reached 44% by 2023; gross margins expanded 400+ bps\n\n**DTC measurement:** Analysts track DTC mix (% of total revenue) and DTC gross margin expansion as leading indicators of long-term brand economics improvement.\n\n**Risks:**\n- DTC requires marketing investment to drive traffic to owned channels (CAC: customer acquisition cost)\n- Losing wholesale shelf space can hurt brand awareness for new customers\n- Competition: Nike vs Adidas vs Lululemon all compete for the same DTC consumer wallet",
          highlight: ["DTC", "gross margin", "customer data", "wholesale", "CAC", "customer acquisition cost", "Nike"],
        },
        {
          type: "teach",
          title: "👜 Luxury Brands, NPS & Private Label Threat",
          content:
            "**Luxury brands** (Hermès, LVMH, Chanel) represent the ultimate form of brand moat — they are aspirational, supply-constrained, and nearly immune to economic cycles.\n\n**Luxury economics:**\n- **Veblen goods**: demand increases as price increases (status signaling). Hermès Birkin bags appreciate like assets.\n- **Supply control**: Hermès limits production deliberately; waitlists of 2+ years maintain scarcity premium\n- **LVMH EBITDA margins**: 25–35%, vs 12–15% for mainstream fashion\n- **Recession resilience**: luxury buyers (top 10% of earners) are income-insulated; aspirational buyers (mass-luxury) trade down modestly\n\n**Measuring brand health:**\n- **NPS (Net Promoter Score)**: 'How likely are you to recommend this brand?' Score -100 to +100. Apple ~72, Costco ~79, legacy retailers ~20–30\n- **Share of wallet**: % of category spend going to your brand vs competitors\n- **Customer retention / repeat purchase rate**: subscription-like brands (Costco, Nike membership) track this carefully\n\n**Private label threat:**\n- Retailer private label brands (Kirkland at Costco, Great Value at Walmart) priced 30–40% below national brands\n- In recessions, private label share gains 2–5 percentage points as consumers trade down\n- Brands with true differentiation (taste, performance) maintain share; commodity-like brands (canned goods, paper towels) are most vulnerable\n- Monitoring metric: **private label share** in Nielsen/IRI scanner data",
          highlight: ["luxury", "Veblen goods", "Hermès", "NPS", "share of wallet", "private label", "Kirkland"],
        },
        {
          type: "quiz-mc",
          question:
            "A consumer brand has a book value of $2B but an estimated brand value of $10B. The stock trades at 5× book. What primarily explains the gap between book value and market value?",
          options: [
            "Intangible assets — brand equity, customer relationships, and intellectual property are not fully captured on the balance sheet under GAAP",
            "Over-speculation — the market is mispricing the stock at an irrational premium",
            "Hidden physical assets — real estate and equipment are undervalued at historical cost",
            "Future acquisitions — investors are pricing in M&A activity at a premium",
          ],
          correctIndex: 0,
          explanation:
            "GAAP accounting rules require that internally generated intangible assets (brand value, customer loyalty, proprietary formulas like Coca-Cola's recipe) are NOT capitalized on the balance sheet — they are expensed as incurred. Only acquired intangibles (through M&A) appear as goodwill/intangibles. A consumer brand trading at 5× book largely reflects the market's valuation of off-balance-sheet intangibles: brand equity, distribution networks, customer lifetime value, and franchise strength.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A consumer brand that cuts advertising & promotion (A&P) spending by 20% to beat quarterly EPS estimates is likely creating long-term shareholder value.",
          correct: false,
          explanation:
            "False. Cutting A&P to beat quarterly EPS is classic brand harvesting — a short-term trade at the expense of long-term brand equity. Marketing investment drives brand awareness, consumer trial, and loyalty. Brands that underspend on A&P see market share erosion over 2–4 years (consumers gradually shift to better-marketed competitors). Sophisticated analysts track A&P as a % of sales; a declining ratio is a warning sign even when reported earnings beat.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Footwear brand reports: DTC revenue grew 28% (now 42% of total); wholesale declined 5% (58% of total); overall revenue +8%. Gross margin expanded 180bps to 46.5%. Brand NPS improved from 54 to 61.",
          question: "How should an analyst interpret this earnings report for long-term valuation?",
          options: [
            "Very positive — DTC mix shift is structurally improving margins and customer economics; NPS improvement signals brand health",
            "Concerning — wholesale decline of 5% shows the brand is losing retail partners and distribution reach",
            "Neutral — 8% overall revenue growth is average; the channel mix shift is not economically significant",
            "Negative — DTC growth implies higher marketing spend (CAC) that will compress future margins",
          ],
          correctIndex: 0,
          explanation:
            "DTC mix shift to 42% at 65–75% gross margin vs wholesale at ~45% is a structural margin improvement. The 180bps gross margin expansion validates this thesis. NPS improvement from 54 to 61 is a leading indicator of future market share gain and pricing power. Even though wholesale declined 5%, the economic value of DTC growth more than compensates. This is the Nike playbook — the market should apply a higher forward P/E multiple as DTC mix increases.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Supply Chain & Inventory Management ────────────────────────────
    {
      id: "cr-4",
      title: "📦 Supply Chain & Inventory Management",
      description:
        "SKU rationalization, GMROI, fast vs slow fashion, supply chain disruptions, and sourcing shifts",
      icon: "Package",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🗂️ SKU Rationalization & GMROI Fundamentals",
          content:
            "**SKU rationalization** is the strategic reduction of product assortment complexity — fewer SKUs (Stock Keeping Units) to improve efficiency and profitability.\n\n**Why SKU proliferation hurts margins:**\n- Each SKU requires demand planning, purchasing, warehousing, and store space\n- Long-tail SKUs with low velocity create excess inventory and markdowns\n- Complexity drives supply chain cost: more vendors, more POs, more quality checks\n- Store labor for re-stocking increases with assortment breadth\n\n**SKU rationalization benefits:**\n- Concentrate volume in fewer, higher-velocity SKUs → better vendor pricing\n- Reduce markdowns on slow-moving inventory → gross margin improvement\n- Simplify store operations → lower labor cost per transaction\n- Free up shelf space for better-performing items or private label\n\n**GMROI (Gross Margin Return on Inventory Investment):**\nGMROI = Gross Margin $ ÷ Average Inventory at Cost\n\nExample:\n- SKU A: GM $200K, avg inventory $50K → GMROI 4.0×\n- SKU B: GM $50K, avg inventory $60K → GMROI 0.83× (losing value)\n\nRetailers use GMROI to prune the tail: eliminate SKUs below a threshold (typically 1.5–2.0×) and reallocate shelf space to high performers.\n\n**P&G's SKU rationalization (2014):** Cut from 170 to 65 brands, focusing resources on brands with >$1B in revenue. Operating margins improved 300–400bps over 3 years.",
          highlight: ["SKU rationalization", "GMROI", "markdown", "assortment", "inventory velocity", "tail SKUs"],
        },
        {
          type: "teach",
          title: "⚡ Fast Fashion vs Slow Fashion: The Inventory Turns Tradeoff",
          content:
            "**Fast fashion** and **slow fashion** represent opposite philosophies on product cycle speed and inventory management — with vastly different financial profiles.\n\n**Fast fashion (Zara, H&M, Shein):**\n- New styles arrive in stores every 2–4 weeks\n- Inventory turns: 12–15× per year (some items turn in <3 weeks)\n- Design-to-store in 2 weeks (Zara) vs 6+ months for traditional brands\n- Markdown strategy: designed to sell through at full price; very little end-of-season inventory\n- Gross margins: 55–60%; minimal clearance sales\n- Risk: fast changing trends mean wrong bets can still happen; ethical/sustainability concerns\n\n**Slow fashion / Traditional (Ralph Lauren, luxury brands):**\n- 2 collections/year; design cycle 6–12 months\n- Inventory turns: 2–4× for apparel; 1–2× for luxury\n- Higher gross margins at luxury end (65–75%) but more seasonal inventory\n- Markdown exposure: end-of-season clearance compresses realized margins\n\n**2021–2022 inventory cycle:**\n- COVID supply chain delays → retailers over-ordered to avoid stockouts\n- Demand normalized faster than expected → massive inventory glut by H2 2022\n- Gap, Nike, American Eagle reported inventory +30–50% YoY\n- Resulted in 500–800bps gross margin compression as retailers marked down aggressively\n- Stocks fell 40–60% before inventory cleared in 2023\n\n**Lesson for investors**: Rising inventory days (Days Inventory Outstanding = Inventory / COGS × 365) is an early warning sign of a coming margin compression cycle.",
          highlight: ["fast fashion", "Zara", "inventory turns", "markdown", "inventory glut", "Days Inventory Outstanding"],
        },
        {
          type: "teach",
          title: "🌍 Supply Chain Resilience: Sourcing Shifts & Shrinkage",
          content:
            "**Sourcing geography** determines cost structure, speed-to-market, and geopolitical risk — a critical but underappreciated factor in retail investing.\n\n**The China-to-diversification shift:**\n- Pre-2018: ~80% of US apparel/footwear sourced from China\n- US-China trade war (2018–): tariffs of 15–25% on apparel, footwear, electronics\n- COVID disruptions accelerated diversification: Vietnam, Bangladesh, Mexico, Indonesia\n- Current landscape (2025): China ~35% of US apparel imports; Vietnam ~20%; Bangladesh ~10%\n\n**Reshoring costs:**\n- Near-shoring to Mexico: 15–25% higher unit cost vs China, but 4–6 week lead time vs 12–16 weeks\n- Speed advantage offsets some cost premium for fashion (reduces markdown risk)\n- Vietnam: 5–10% higher than China, similar lead times — current sweet spot\n\n**Shrinkage** (retail theft and internal loss):\n- Industry average: 1.5–2.0% of revenue\n- Post-COVID spike: organized retail crime elevated shrinkage to 2.5–3.0%+ at some retailers\n- Target, Home Depot cited $700M–$1B annual shrinkage losses\n- Shrinkage is a pure gross margin headwind: 1% of revenue at 30% gross margin = 3.3% of gross profit\n- Mitigation: locking up merchandise, exit security, inventory reconciliation systems\n\n**Working capital impact of sourcing:**\n- Longer lead times (China) require higher inventory buffers → more working capital tied up\n- Near-shore sourcing reduces lead time → lower safety stock requirements → less working capital",
          highlight: ["sourcing", "tariffs", "reshoring", "near-shoring", "shrinkage", "lead time", "working capital"],
        },
        {
          type: "quiz-mc",
          question:
            "A retailer increases inventory turns from 4× to 6× while keeping annual COGS at $120M. What happens to average inventory and working capital?",
          options: [
            "Average inventory falls from $30M to $20M, freeing $10M of working capital",
            "Average inventory rises from $30M to $45M, requiring $15M more working capital",
            "Average inventory stays the same; only cash conversion cycle changes",
            "Working capital doubles because faster turns require more frequent purchase orders",
          ],
          correctIndex: 0,
          explanation:
            "Average Inventory = COGS ÷ Inventory Turns. At 4× turns: $120M ÷ 4 = $30M. At 6× turns: $120M ÷ 6 = $20M. The retailer freed $10M of working capital that was previously tied up in inventory sitting in stores and distribution centers. This improvement can fund growth investments, reduce debt, or return cash to shareholders. Higher turns also mean fresher merchandise and lower markdown risk.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "An increase in Days Inventory Outstanding (DIO) of 15 days year-over-year is a bullish signal because it means the retailer is building inventory for expected demand.",
          correct: false,
          explanation:
            "False. Rising DIO is typically a bearish signal, not bullish. DIO = (Inventory / COGS) × 365. An increase of 15 days means inventory is accumulating relative to sales pace — suggesting demand is weaker than anticipated, the buying team over-ordered, or both. This precedes gross margin compression as retailers must mark down excess inventory. The 2022 inventory crisis at Nike, Gap, and Target showed how quickly DIO spikes translate into 500–800bps margin headwinds.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An apparel retailer sources 60% from China and 40% from Vietnam. New tariffs of 20% are imposed on Chinese goods. The retailer's blended COGS is $800M. They can shift 20% of Chinese sourcing to Vietnam within 12 months at a 10% unit cost premium vs China.",
          question: "What is the approximate annual gross margin impact from the tariff, and how much does the Vietnam shift mitigate it?",
          options: [
            "Tariff cost: ~$96M; Vietnam shift saves ~$9.6M — mitigates only ~10%; significant margin pressure remains",
            "Tariff cost: $160M; Vietnam shift saves $80M — over 50% mitigated in year 1",
            "Tariff cost: $0 — retailers pass all tariffs to consumers with no margin impact",
            "Tariff cost: $96M; Vietnam shift saves $48M — 50% mitigated immediately",
          ],
          correctIndex: 0,
          explanation:
            "China sourcing = 60% × $800M = $480M. Tariff cost = 20% × $480M = $96M. Vietnam shift: 20% of China sourcing = $96M shifted. Vietnam premium vs China = 10%, but saves the 20% tariff. Net benefit = (20% – 10%) × $96M = $9.6M — only 10% mitigation. Full tariff impact to gross margin is $86.4M net. This illustrates why supply chain shifts take 3–5 years to fully materialize — significant margin pressure persists in the interim.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Restaurant & Food Service ────────────────────────────────────
    {
      id: "cr-5",
      title: "🍔 Restaurant & Food Service Economics",
      description:
        "Unit economics, franchise models, delivery economics, QSR advantages, and the value vs premiumization cycle",
      icon: "Utensils",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🍕 Restaurant Unit Economics: The Cost Stack",
          content:
            "Restaurant economics are driven by a tightly interconnected cost stack — small changes in any component cascade into meaningful EBITDA swings.\n\n**The restaurant P&L cost stack:**\n| Line Item | % of Revenue | Typical Range |\n|---|---|---|\n| Food & Beverage Cost | 28–32% | Proteins highest; beverages best margin |\n| Labor (incl. benefits) | 28–35% | QSR lower end; casual dining higher |\n| Rent & Occupancy | 6–8% | Off-mall; drive-through sites lower |\n| Other Operating | 5–8% | Utilities, supplies, repairs |\n| **Restaurant-Level EBITDA** | **15–25%** | Before corporate overhead |\n| Corporate G&A | 4–6% | |\n| **Company EBITDA** | **10–18%** | |\n\n**AUV (Average Unit Volume)**: total annual revenue per restaurant location.\n- McDonald's: ~$3.5M AUV\n- Chipotle: ~$2.8M AUV\n- Local casual dining: $1.5–2.5M AUV\n\nHigher AUV spreads fixed costs (rent, management) across more revenue — a key driver of restaurant-level margins.\n\n**Payback period**: initial buildout cost ÷ annual 4-wall EBITDA.\nChipotle example: new restaurant capex ~$1.0M; 4-wall EBITDA ~$450K → payback ~2.2 years\nCasual dining: capex $2.5M; 4-wall EBITDA $300K → payback 8+ years\n\nFaster payback = higher ROIC = higher EV/EBITDA multiple the market will assign.",
          highlight: ["AUV", "four-wall EBITDA", "food cost", "labor cost", "payback period", "ROIC", "cost stack"],
        },
        {
          type: "teach",
          title: "🏢 Franchise Model: Asset-Light Royalty Economics",
          content:
            "The **franchise model** transforms restaurants from capital-intensive operations into capital-light royalty businesses — the reason McDonald's and Domino's trade at premium multiples.\n\n**How franchising works:**\n- Franchisee owns and operates the restaurant; bears all capex, working capital, and operational risk\n- Franchisor collects:\n  - **Royalty**: 4–8% of franchisee gross sales (McDonald's: 4–5%)\n  - **Ad fund contribution**: 4–5% of sales for national marketing\n  - **Initial franchise fee**: $45K–$75K per location\n\n**Economics comparison:**\n| Model | ROIC | Capex/Unit | EBITDA Margin |\n|---|---|---|---|\n| 100% Corporate Owned | 10–15% | $1–2.5M/unit | 12–18% |\n| 100% Franchised | 40–60%+ | Near zero | 40–60% |\n| Hybrid (McDonald's ~95% franchised) | 25–35% | Low | 45–55% |\n\n**Refranchising trend:**\nMany chains have sold corporate stores to franchisees over the past decade (McDonald's, Burger King, Jack in the Box) to:\n1. Receive lump sum cash (sell stores at 7–10× EBITDA)\n2. Convert volatile restaurant P&L to stable royalty streams\n3. Expand asset-light ROIC\n\n**Investor implication**: franchise mix % is a key valuation driver. As a chain refranchises, EBITDA margins expand dramatically even if total revenue declines (net of franchisee revenues). Higher margins → higher multiple → value unlocking.",
          highlight: ["franchise", "royalty", "asset-light", "refranchising", "ROIC", "McDonald's", "Domino's"],
        },
        {
          type: "teach",
          title: "🚗 Delivery Economics, Drive-Through & Consumer Behavior",
          content:
            "Third-party delivery and the drive-through advantage are the two most consequential structural factors in restaurant investing today.\n\n**Third-party delivery economics:**\n- DoorDash, Uber Eats, Grubhub charge **25–30% commission** on order value\n- Restaurant with 15% EBITDA margin on dine-in orders:\n  - Delivery order: $30 ticket\n  - Commission: $7.50–$9.00 (25–30%)\n  - Food cost (30%): $9.00\n  - Labor + overhead allocated (20%): $6.00\n  - Remaining for restaurant: $30 – $7.50 – $9 – $6 = $7.50 = 25% margin on delivery\n  - BUT platform fee comes off first → restaurant effectively subsidizes the convenience\n  - After platform fee, actual restaurant margin: ($30 – $7.50 – $9 – $6) / $30 = 25% (favorable only at high ticket)\n  - At lower ticket: $15 order, $4.50 commission, margin collapses to near zero\n\n**Break-even delivery mix:**\nAt 10% dine-in EBITDA margin and 25% delivery commission, delivery break-even requires:\nFood cost + labor + delivery fee ≤ 100%\nDelivery only break-evens if restaurant-level costs ≤ 70% (i.e., ≤30% EBITDA pre-commission) — very few operators achieve this.\n\n**Drive-through advantage (QSR):**\n- McDonald's, Wendy's, Taco Bell: ~70% of sales through drive-through\n- Drive-through has lower labor per transaction and higher order throughput\n- **Recession resilient**: when consumers trade down from casual dining ($15–25 check) to QSR ($7–10), QSR traffic increases\n- McDonald's SSS typically positive during recessions while casual dining goes negative\n\n**Trading up vs trading down:**\n- Expansion phase: consumers trade up to fast casual (Chipotle, Shake Shack) from QSR\n- Recession/inflation: consumers trade down from casual dining → fast casual → QSR → home cooking",
          highlight: ["third-party delivery", "commission", "drive-through", "QSR", "trading down", "break-even", "delivery mix"],
        },
        {
          type: "quiz-mc",
          question:
            "A fast casual restaurant has a 10% restaurant-level EBITDA margin on dine-in. Third-party delivery charges a 25% commission on delivery orders. At what delivery mix (% of total revenue) does blended EBITDA approach breakeven on the delivery channel?",
          options: [
            "Delivery is margin-dilutive at any mix — unless the restaurant's pre-commission cost structure leaves >25% gross margin, adding delivery reduces blended EBITDA",
            "50% delivery mix — the blended average will be breakeven at 50/50 split",
            "25% delivery mix — equal to the commission rate, so it offsets at that level",
            "Delivery is always accretive because it adds incremental revenue with no fixed cost increase",
          ],
          correctIndex: 0,
          explanation:
            "At a 10% restaurant-level EBITDA margin, costs consume 90% of revenue. Third-party delivery takes 25% off the top, leaving only 75% to cover those same costs — a guaranteed loss on every delivery order. Unless the restaurant's cost structure can drop below 75% of revenue on delivery orders (through higher ticket size, lower labor allocation, or incremental-only food cost), delivery is margin-dilutive at any mix. This is why many restaurants negotiate lower rates, build first-party ordering, or add delivery surcharges.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "During a recession, quick-service restaurant (QSR) chains like McDonald's typically experience negative same-store sales because consumers reduce all dining-out spending.",
          correct: false,
          explanation:
            "False. QSR chains typically see positive or flat SSS during recessions because of the 'trading down' effect. When consumers feel financially squeezed, they don't eliminate dining out — they trade down the price tier. A household that was visiting casual dining ($20–30/person) may switch to Chipotle ($10–15) or McDonald's ($7–10) to maintain the dining-out habit at lower cost. McDonald's actually reported positive SSS during the 2008–2009 recession and 2022 inflation shock as consumers traded down from casual dining peers.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Pizza chain: 3,000 locations (10% corporate, 90% franchised). Royalty rate: 5% of franchisee sales. Average franchisee AUV: $1.2M. Corporate stores average 14% restaurant-level EBITDA margin. Company is considering selling 200 more corporate stores to franchisees at 8× store EBITDA.",
          question: "What is the primary financial benefit of this refranchising transaction?",
          options: [
            "Converts capital-intensive corporate P&L to stable royalty streams, improves ROIC, and generates upfront cash at 8× EBITDA multiples",
            "Increases total system revenue because franchisees will grow their stores faster",
            "Improves food quality by giving franchisees more operational autonomy",
            "Reduces royalty obligations because franchisees negotiate lower rates at scale",
          ],
          correctIndex: 0,
          explanation:
            "Refranchising 200 stores achieves three simultaneous benefits: (1) Upfront cash: 200 stores × ~$1.2M AUV × 14% margin = $33.6M EBITDA × 8× = $269M proceeds; (2) Converts each store's 14% EBITDA to a 5% royalty stream — while the royalty income is lower, it requires zero capital and zero operational risk, radically improving ROIC; (3) Total EBITDA margin expands dramatically because royalty revenues are near 100% margin vs 14% for corporate stores. This is the Domino's / McDonald's playbook that drove stock 10×+ over a decade.",
          difficulty: 3,
        },
      ],
    },
  ],
};
