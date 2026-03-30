import type { Unit } from "./types";

export const UNIT_ALTERNATIVE_ASSETS: Unit = {
  id: "alternative-assets",
  title: "Alternative Investments",
  description:
    "Explore infrastructure, timberland, farmland, art, collectibles, royalties, and other real alternative assets beyond stocks and bonds",
  icon: "Boxes",
  color: "#84cc16",
  lessons: [
    // ─── Lesson 1: Infrastructure Investing ─────────────────────────────────────
    {
      id: "alt-1",
      title: "Infrastructure Investing",
      description:
        "Long-duration inflation-linked assets: airports, toll roads, pipelines, and renewable energy — greenfield versus brownfield risk",
      icon: "Building2",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What Counts as Infrastructure?",
          content:
            "Infrastructure investments encompass the physical systems societies depend on — but not all infrastructure carries the same risk or return profile.\n\n**Economic Infrastructure:**\nAssets that facilitate economic activity and generate fees directly tied to usage or regulated tariffs.\n- **Transport**: Toll roads, airports, seaports, rail networks\n- **Utilities**: Water treatment, electricity transmission and distribution, gas networks\n- **Energy**: Pipelines, LNG terminals, renewable energy (wind, solar, hydro)\n- **Communications**: Cell towers, fiber networks, data infrastructure\n\n**Social Infrastructure:**\nPublicly funded but often privately operated assets serving societal needs.\n- **Healthcare**: Hospitals, medical facilities, aged care facilities\n- **Education**: Schools, universities, student accommodation\n- **Government**: Courthouses, prisons, military housing\n\n**Why the distinction matters:**\nEconomic infrastructure typically generates **usage-based revenues** (cars through a toll booth, barrels through a pipeline) — more volume-sensitive but often commercially owned. Social infrastructure relies on **availability payments** from government — revenue is certain as long as the asset is available, regardless of actual usage. Availability-payment models carry lower demand risk but more counterparty (government) credit risk.",
          highlight: [
            "economic infrastructure",
            "social infrastructure",
            "toll roads",
            "availability payments",
            "pipelines",
            "renewable energy",
          ],
        },
        {
          type: "teach",
          title: "Investment Characteristics: Why Infrastructure?",
          content:
            "Infrastructure assets possess a distinctive set of investment characteristics that make them attractive to long-duration investors like pension funds, insurance companies, and sovereign wealth funds.\n\n**Long-Duration Cash Flows:**\nInfrastructure assets often have 20–99 year concession periods. A toll road concession may run for 40 years, matching well against pension liabilities measured in decades. Duration matters: a slight drop in interest rates increases the present value of long cash flows significantly.\n\n**Inflation Linkage:**\nMany infrastructure contracts explicitly link fees to inflation indices (CPI). A pipeline tariff may escalate at CPI + 0.5% annually. This **built-in inflation protection** is rare in fixed income and highly valued in inflationary environments.\n\n**Monopoly-Like Pricing Power:**\nDo you choose between the only bridge crossing a river or driving 60 miles? Effective monopoly status — natural monopoly characteristics — means pricing power and inelastic demand. Airports face competition from other airports, but within a catchment area they are irreplaceable.\n\n**Stable, Predictable Cash Flows:**\nUsage patterns for essential infrastructure (water, electricity transmission, gas distribution) are stable across economic cycles. Traffic volumes on essential roads drop modestly in recessions. Regulated utilities earn fixed returns set by regulators.\n\n**Low Correlation to Equity Markets:**\nInfrastructure returns — particularly unlisted — show low correlation with public equity. This diversification benefit improves portfolio efficiency on a risk-adjusted basis.",
          highlight: [
            "long-duration",
            "inflation linkage",
            "natural monopoly",
            "pricing power",
            "stable cash flows",
            "low correlation",
            "pension funds",
          ],
        },
        {
          type: "teach",
          title: "Greenfield vs Brownfield Risk",
          content:
            "Not all infrastructure investments carry the same risk. The stage of asset development is the primary risk classifier.\n\n**Brownfield Assets (Operating Infrastructure):**\nAssets already built, operational, and generating revenue. The construction risk is gone.\n- A highway that has operated for 10 years with established traffic patterns\n- A port that handles known cargo volumes under long-term contracts\n- A regulated water utility with existing customer base\n- **Risk profile**: Lower risk, lower expected return (9–12% target IRR in PE funds). Cash yield dominant.\n- **Pricing**: Priced at tight cap rates (4–6%) in competitive markets because buyers accept lower returns for certainty.\n\n**Greenfield Assets (Development-Stage Infrastructure):**\nNew construction projects that do not yet generate revenue. Revenue begins only after completion.\n- A new offshore wind farm under construction\n- A new toll road in an emerging market\n- A solar farm with signed PPAs (power purchase agreements) but not yet built\n- **Risk categories unique to greenfield**:\n  - **Construction risk**: Cost overruns, delays, contractor default\n  - **Ramp-up risk**: Will traffic/usage reach projected levels?\n  - **Technology risk**: Is the technology proven at scale?\n  - **Permitting risk**: Regulatory approvals may be delayed or denied\n- **Risk profile**: Higher risk, higher expected return (15–20%+ target IRR). Equity return dominant.\n\n**Hybrid: Brownfield with Greenfield Component:**\nAn existing airport adding a new terminal — operating revenue from existing terminal, greenfield risk on the expansion.",
          highlight: [
            "greenfield",
            "brownfield",
            "construction risk",
            "ramp-up risk",
            "IRR",
            "PPAs",
            "cap rates",
            "concession",
          ],
        },
        {
          type: "teach",
          title: "Listed vs Unlisted Infrastructure",
          content:
            "Investors can access infrastructure through public markets or private funds — each with meaningful trade-offs.\n\n**Listed Infrastructure (Public Market):**\n- **Infrastructure ETFs**: iShares Global Infrastructure ETF (IGF), Vanguard Utilities ETF, Brookfield Infrastructure Partners (BIP)\n- **Listed infrastructure stocks**: Vinci (toll roads/airports), Transurban (Australian tolls), American Tower (cell towers), NextEra Energy (regulated utilities + wind/solar)\n- **Advantages**: Daily liquidity, lower minimums, transparent pricing, easy diversification\n- **Disadvantages**: Correlates with broad equity markets during sell-offs (loses some diversification benefit). Public companies carry leverage, corporate governance risk, and management company risk beyond the pure infrastructure asset.\n\n**Unlisted (Private) Infrastructure:**\n- **Infrastructure PE funds**: Macquarie Asset Management, Brookfield Asset Management, Blackstone Infrastructure, KKR Infrastructure\n- **Pension fund direct investment**: Large pensions (CPPIB, Ontario Teachers, CalPERS) invest directly — buying airports and pipelines outright\n- **Advantages**: Pure exposure to underlying assets, lower volatility (appraisal-based valuations), longer hold periods align with asset life, potential for value-add active management\n- **Disadvantages**: Illiquid (10-year fund life), high minimums ($10M+), complex fee structures (2% management + 20% carried interest), J-curve effect\n\n**Smoothing bias**: Quarterly appraisal-based valuations of private infrastructure understate true volatility — correlation and volatility look lower than they truly are.",
          highlight: [
            "listed infrastructure",
            "unlisted infrastructure",
            "infrastructure ETF",
            "Macquarie",
            "Brookfield",
            "J-curve",
            "carried interest",
            "smoothing bias",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor is evaluating two infrastructure projects: (A) an airport with 15 years of operating history and stable passenger volumes, and (B) a new offshore wind farm under construction with signed 20-year power purchase agreements but not yet generating power. Which project carries more greenfield risk?",
          options: [
            "Project B — the offshore wind farm carries greenfield risk because it is under construction and has not yet generated revenue",
            "Project A — airports face competition from alternative transport and thus higher demand uncertainty",
            "Both carry equal greenfield risk because both have contracted revenue streams",
            "Project A — operating assets have more regulatory risk than new construction",
          ],
          correctIndex: 0,
          explanation:
            "Project B is a greenfield asset — it is under construction and has not yet generated a single dollar of revenue. Despite having signed PPAs, it still carries construction risk (cost overruns, delays), technology risk, and ramp-up risk. Project A is a classic brownfield asset: 15 years of operating history means construction risk is long gone and traffic patterns are well-established. Greenfield assets command higher target IRRs (15–20%+) to compensate for this construction and ramp-up uncertainty.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Infrastructure assets' inflation linkage comes from explicit contractual escalation clauses in concession agreements, not from general commodity price movements.",
          correct: true,
          explanation:
            "True. The inflation protection in infrastructure is contractual — toll agreements, regulated tariff schedules, and utility rate reviews typically include explicit CPI-linked escalation. For example, a toll road concession may specify 'tariff increases at the greater of 2% or CPI annually.' This is distinct from commodities, where price exposure comes from market prices. The contractual nature makes the inflation hedge much more predictable and direct than commodity market exposure.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Timberland & Farmland ────────────────────────────────────────
    {
      id: "alt-2",
      title: "Timberland & Farmland",
      description:
        "Biological growth as return driver, harvest optionality, Corn Belt vs permanent crops, and water rights as a scarce resource",
      icon: "TreePine",
      xpReward: 75,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Timberland: Biological Growth as a Return Driver",
          content:
            "Timberland investing is fundamentally different from all other asset classes because trees keep growing whether prices are good or not — and that biological growth is itself a source of return.\n\n**The Three Sources of Return in Timberland:**\n\n1. **Biological Growth (Timber Growth)**: Standing timber increases in volume every year as trees grow. Measured in board-feet per acre per year, this growth contributes ~3–5% annual return purely from physical expansion, independent of prices.\n\n2. **Timber Price Appreciation**: As timber commodity prices (lumber prices) rise, the value of standing timber increases proportionally. Lumber prices are linked to housing starts, construction activity, and global wood demand.\n\n3. **Land Appreciation**: The underlying real property appreciates over time, particularly if the land is suitable for higher-value uses (development, conservation easements, carbon credits).\n\n**NCREIF Timberland Index:**\nThe NCREIF Timberland Index — tracking institutional U.S. timberland portfolios — has delivered approximately **12% annualized returns** historically, with low volatility relative to equity markets and near-zero correlation with stocks and bonds.\n\n**Who owns institutional timberland?**\n- Timber REITs: Weyerhaeuser, PotlatchDeltic, Rayonier\n- Timberland Investment Management Organizations (TIMOs): Hancock Natural Resource Group, RMS (Resource Management Service)\n- Pension funds hold directly through TIMOs\n\n**Geographic diversification**: Pacific Northwest (Douglas fir), Southeast U.S. (pine plantations), New Zealand (radiata pine), Brazil (eucalyptus) — different species, growth rates, end markets.",
          highlight: [
            "biological growth",
            "NCREIF Timberland Index",
            "timber growth",
            "board-feet",
            "TIMOs",
            "lumber prices",
            "carbon credits",
          ],
        },
        {
          type: "teach",
          title: "Harvest Optionality: The Biological Store of Value",
          content:
            "The most uniquely powerful feature of timberland investing is **harvest optionality** — the ability to delay harvesting when prices are low and let the trees keep growing.\n\n**How harvest optionality works:**\nIf lumber prices collapse (as they did during the 2008–2009 housing crisis), a timberland owner can simply not harvest. The trees continue to grow, increasing in volume. When prices recover, the owner harvests older, larger trees — which are more valuable per unit volume (larger diameter logs command premium prices for structural lumber and plywood). The tree is literally a biological savings account.\n\n**Contrast with other commodities:**\n- A gold miner must stop mining when prices fall below costs, but existing production is already sold. The gold in the ground doesn't grow.\n- An oil producer faces similar fixed production economics.\n- A corn farmer cannot delay harvest — crops must be harvested or they spoil.\n- Timberland is unique: the 'inventory' is self-storing and self-growing.\n\n**Species selection and rotation periods:**\n- **Loblolly pine** (Southeast U.S.): 25–35 year rotation, fast-growing, lower quality\n- **Douglas fir** (Pacific Northwest): 45–60 year rotation, premium structural lumber\n- **Eucalyptus** (Brazil): 7-year rotation, used for pulp and paper\n\nShorter rotation = more commodity-like (less optionality). Longer rotation = more optionality value, but capital is tied up longer.\n\n**Carbon credit integration:**\nTimberland owners increasingly generate income from voluntary carbon markets by certifying that forests sequester carbon. Additional revenue stream with no harvest required.",
          highlight: [
            "harvest optionality",
            "biological store of value",
            "lumber prices",
            "rotation period",
            "loblolly pine",
            "Douglas fir",
            "carbon credits",
            "voluntary carbon markets",
          ],
        },
        {
          type: "teach",
          title: "Farmland: Corn Belt vs Permanent Crops",
          content:
            "Farmland investing offers inflation protection and stable income, but the type of farmland matters enormously for risk/return.\n\n**Row Crop Farmland (Corn Belt):**\nThe heartland of U.S. farmland investing — Iowa, Illinois, Indiana, Nebraska.\n- **Crops**: Corn and soybeans planted and harvested annually\n- **Revenue model**: Annual crop sales + cash rent from tenant farmers\n- **Cash rent yields**: Typically 3–5% of land value annually\n- **Risk profile**: Moderate. Commodity price exposure (corn/soybean prices), weather risk, but highly liquid for farmland (many buyers, established market)\n- **NCREIF Farmland Index**: ~11% annualized returns historically\n- **Key input**: Land is the scarce resource — Iowa topsoil is some of the richest in the world. 'They're not making more of it.'\n\n**Permanent Crop Farmland:**\nOrchards, vineyards, nut trees — crops that take years to become productive and cannot be easily replanted.\n- **Crops**: Almonds, pistachios, walnuts (California), wine grapes, citrus\n- **Higher yields**: 6–8% cash yields possible but with more complexity\n- **Higher risk**: If a disease kills an almond orchard, replanting takes 3–5 years before productivity is restored\n- **Illiquidity premium**: Fewer buyers, more specialized management required\n- **Water intensity**: Permanent crops in California are highly water-intensive — water rights are critical\n\n**Land value drivers:**\n- Commodity prices and crop yields\n- Water availability and rights\n- Proximity to processing and export infrastructure\n- Soil quality (organic matter, drainage)\n- Technology adoption (precision agriculture, irrigation efficiency)",
          highlight: [
            "row crops",
            "Corn Belt",
            "permanent crops",
            "cash rent",
            "NCREIF Farmland Index",
            "almonds",
            "water rights",
            "precision agriculture",
          ],
        },
        {
          type: "teach",
          title: "Water Rights: The Scarce Resource Component",
          content:
            "In the western United States and many global regions, water rights are becoming as important as the land itself — sometimes more valuable.\n\n**Prior Appropriation Doctrine (Western U.S.):**\n'First in time, first in right.' Water rights were allocated historically to whoever first put water to beneficial use. Senior rights (older) take priority over junior rights in times of shortage.\n- During droughts, junior water rights holders receive no water — senior holders get their full allocation first.\n- Water rights are bought and sold separately from land in many western states.\n\n**Why water rights matter for farmland investors:**\n- **California Central Valley**: One of the world's most productive agricultural regions — but running out of groundwater. Aquifers are depleting faster than recharge rates. Farms without strong surface water rights face existential risk.\n- **Colorado River Compact**: Seven states fight over dwindling flows. Junior rights holders (including major agricultural users) are being cut back.\n- **Water rights as appreciating assets**: In Colorado, Utah, and Arizona, senior water rights have appreciated significantly faster than the underlying land.\n\n**Farmland valuation with water rights:**\n- Irrigated farmland with senior surface water rights commands **30–50% premium** over dryland farming of the same soil quality.\n- Permanent crops without secure water access should be heavily discounted or avoided.\n\n**Emerging water investment strategies:**\n- Water rights funds (Castleton Commodities, Water Asset Management)\n- Investment in water infrastructure (drip irrigation, water recycling)\n- Farmland acquisition specifically targeting water-rich regions (Pacific Northwest, South America)\n\n**ESG consideration**: Large-scale water rights acquisition by investment funds raises ethical and regulatory questions in communities that depend on the same water for municipal use.",
          highlight: [
            "water rights",
            "prior appropriation",
            "senior rights",
            "junior rights",
            "California Central Valley",
            "Colorado River",
            "irrigated farmland",
            "groundwater depletion",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Which characteristic of timberland investing makes it unique compared to other real assets like gold, oil, or row-crop farmland?",
          options: [
            "Harvest optionality — trees continue growing when prices are low, allowing the owner to defer harvest and accumulate more volume without spoilage",
            "Zero correlation with any macroeconomic variable — timberland is entirely immune to economic cycles",
            "The ability to replant different tree species each year to chase the highest commodity price",
            "Regulated returns set by government forestry agencies that guarantee a minimum yield",
          ],
          correctIndex: 0,
          explanation:
            "Harvest optionality is what makes timberland uniquely powerful: when lumber prices are depressed, the owner can simply not harvest. The trees keep growing, increasing in volume and often moving into higher-value larger-diameter categories. This is impossible with gold (it doesn't grow), oil (production is fixed once extracted), or annual crops like corn (which must be harvested or they die). The ability to defer, accumulate biological growth, and harvest when prices are favorable creates a built-in timing option embedded in every timberland investment.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A farmland fund is evaluating two California properties: Property A is an 800-acre almond orchard with 8-year-old trees, senior surface water rights on the Sacramento River, and a current cash yield of 6.2%. Property B is an 800-acre almond orchard of similar quality with only junior groundwater rights in the San Joaquin Valley, where aquifer levels have declined 30% over the past decade, but it is priced 25% cheaper.",
          question:
            "How should the fund think about water rights in comparing these two investments?",
          options: [
            "Property B's 25% discount may not adequately compensate for the existential risk of junior groundwater rights in a depleting aquifer — water security is a must-have for permanent crops",
            "Property B is clearly superior because the 25% price discount directly translates to higher returns and the groundwater issue is a long-term problem that won't affect current income",
            "Water rights are interchangeable across properties — both properties face the same regulatory environment under California water law",
            "Property A's senior rights create regulatory risk because the state may restrict senior rights holders during environmental flow disputes",
          ],
          correctIndex: 0,
          explanation:
            "For permanent crops like almonds, water security is not merely a financial risk factor — it is potentially existential. Almond trees take 3–5 years to reach full production after planting. If junior groundwater rights are restricted or wells run dry during a drought, the crop fails and the orchard may die. The 25% price discount may actually understate the risk given that California's San Joaquin Valley aquifers are depleting at an accelerating rate. Senior surface water rights on a major river offer far more security. A prudent investor would require a much larger discount — or simply avoid Property B entirely.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Art & Collectibles ───────────────────────────────────────────
    {
      id: "alt-3",
      title: "Art & Collectibles",
      description:
        "The $65B art market, return indices, authenticity risk, fractional ownership platforms, and specialist knowledge in collectibles",
      icon: "Palette",
      xpReward: 70,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Global Art Market",
          content:
            "Art is one of the oldest alternative assets — and one of the most misunderstood from an investment perspective.\n\n**Market Size and Structure:**\nThe global art market generates approximately **$65 billion in annual sales** (Art Basel / UBS Art Market Report). The market is highly concentrated:\n- Top 3 auction houses: Christie's, Sotheby's, Phillips — together dominate the high-value public auction market\n- Galleries and dealers account for ~50% of transactions but receive less coverage\n- Private sales (undisclosed prices, billionaire-to-billionaire) are a large and opaque segment\n\n**Market segmentation:**\n- **Ultra-high-end (>$1M)**: Old Masters, Post-War/Contemporary (Basquiat, Koons, Hirst), Blue-chip photography (Gursky, Sherman)\n- **Mid-market ($50K–$1M)**: Emerging contemporary artists, secondary-market prints\n- **Entry-level (<$50K)**: Works on paper, edition prints, emerging artists — most accessible but most speculative\n\n**Key players:**\n- **Christie's**: Owned by Francois-Henri Pinault (Kering). Landmark $400M+ single-collection sales.\n- **Sotheby's**: Owned by Patrick Drahi (telecom billionaire). Evening sales at Rockefeller Center set world records.\n- **Art advisors**: Conduct due diligence, source works, negotiate privately — essential for serious collectors.\n\n**Art as an asset class quirks:**\n- No dividends, no cash flows, negative carry (storage, insurance, restoration)\n- Each work is unique — no standardized pricing\n- Buyer's premium (25% at major auctions) dramatically increases true cost\n- Tax complexity: capital gains treatment varies by jurisdiction",
          highlight: [
            "$65 billion",
            "Christie's",
            "Sotheby's",
            "buyer's premium",
            "ultra-high-end",
            "art advisors",
            "private sales",
          ],
        },
        {
          type: "teach",
          title: "Art Return Indices and Risk",
          content:
            "Measuring art returns is notoriously difficult because each work is unique and trades infrequently. Several index methodologies have been developed.\n\n**Mei Moses Art Index (now Sotheby's Mei Moses):**\nPioneered by economists Jianping Mei and Michael Moses. Methodology: **repeat sales regression** — tracks works that have sold at auction twice, measuring the price change between sales.\n- Historical return: ~7–8% annualized (long run), with very high variance (standard deviation 15–20%)\n- Advantage: Controls for changing quality mix over time\n- Limitation: Survivorship bias (losers leave auction, winners return)\n\n**Artprice100 Index:**\nTracks 100 established blue-chip artists using sales records. Broad-based, less survivor bias in its top-100 universe.\n\n**Key risks in art investment:**\n\n1. **Authenticity risk**: Forgeries are widespread — even major museums have been deceived. Wolfgang Beltracchi forged hundreds of 'Expressionist masterworks' that sold for millions before detection. Due diligence requires scientific testing (carbon dating, paint analysis, X-ray fluorescence) plus provenance research.\n\n2. **Provenance gaps**: Chain of ownership must be traceable and clean. Works looted during World War II are still being restituted. Missing provenance kills resale value.\n\n3. **Liquidity risk**: Unlike stocks, you cannot sell art in minutes. A major work may take 12–24 months to sell through auction — and an unfavorable sale slot or negative media coverage can depress the hammer price.\n\n4. **Market manipulation**: Artists' markets are managed by galleries. If an artist's primary dealer withdraws support, secondary market prices collapse.\n\n5. **Condition risk**: Damage, improper restoration, or environmental degradation destroys value.",
          highlight: [
            "Mei Moses",
            "repeat sales regression",
            "authenticity risk",
            "forgeries",
            "provenance",
            "liquidity risk",
            "survivorship bias",
            "artprice100",
          ],
        },
        {
          type: "teach",
          title: "Fractional Art Ownership and Collectibles",
          content:
            "Technology platforms are democratizing access to art and collectibles, while specialist knowledge remains the key edge in collecting.\n\n**Fractional Art Platforms:**\n\n**Masterworks:**\n- Files SEC offerings for individual paintings (Warhol, Basquiat, Monet)\n- Investors buy shares at ~$20 each; minimum investment ~$500\n- Masterworks holds the physical work, charges 1.5% annual management fee + 20% of profits on sale\n- Exit timeline: 3–10 years (illiquid)\n- **Criticism**: High fee load, limited resale market for shares, selection bias in which works are offered\n\n**Rally (now Collectable):**\n- Similar model expanded to collectibles: vintage cars, trading cards, sports memorabilia, wine\n- Shares trade on internal secondary market (limited liquidity)\n\n**Collectibles as an Asset Class:**\nThe term 'collectibles' covers a vast range of items where specialist knowledge creates alpha:\n\n- **Vintage cars**: Blue-chip Ferraris (1962 250 GTO: $50M+), Porsche 911, pre-war racing cars. Knowledgeable buyers know which configurations command premiums.\n- **Whisky**: Single-malt scotch casks (Macallan, Springbank) and bottles. The Whisky Exchange, Rare Whisky 101 — established liquid markets now exist.\n- **Fine wine**: Bordeaux First Growths, Burgundy Grand Crus, cult Californians. En primeur (futures market), Liv-ex exchange, professional storage essential.\n- **Watches**: Patek Philippe Nautilus, Rolex Daytona — waitlists and grey market premiums. Chrono24 provides price transparency.\n- **Trading cards**: Sports cards (Topps, Panini), Pokemon. PSA grading determines value. High variance, driven by athlete performance and nostalgia.\n\n**Common thread**: All collectibles require deep domain expertise, authentication knowledge, and relationships with trusted dealers. Without the knowledge premium, you are likely overpaying.",
          highlight: [
            "Masterworks",
            "fractional ownership",
            "vintage cars",
            "whisky casks",
            "fine wine",
            "watches",
            "trading cards",
            "PSA grading",
            "Liv-ex",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "Comparing art investment to publicly traded stocks, which statement best describes the liquidity risk difference?",
          options: [
            "Art carries substantially higher liquidity risk — a major work may take 12–24 months to sell, and sale timing and venue significantly affect the realized price, unlike stocks which can be sold in milliseconds",
            "Art and stocks have similar liquidity because both can be sold on established exchanges through Christie's and Sotheby's automated systems",
            "Stocks carry higher liquidity risk because they are subject to circuit breakers and trading halts, while art can be sold privately any time",
            "Art liquidity risk is lower because the buyer's premium guarantees a minimum price floor at auction",
          ],
          correctIndex: 0,
          explanation:
            "Art is profoundly illiquid compared to stocks. A publicly traded stock can be sold in milliseconds at the current market price. A major artwork requires scheduling a consignment slot (typically 3–6 months), waiting for the right auction season (evening sales in May and November in New York are most important), and hoping for active bidding — all with no guarantee of reaching the reserve price. Even a 'failed' auction (bought in below reserve) carries reputational consequences that can depress subsequent sale attempts. The buyer's premium actually increases costs, not provides a floor.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Survivorship bias in art return indices like Mei Moses means historical returns are likely overstated, because works that performed poorly tend to be sold privately or held indefinitely rather than returning to auction.",
          correct: true,
          explanation:
            "True. The repeat-sale methodology requires a work to appear at auction at least twice. Owners who bought at auction and suffered a loss are less likely to re-consign publicly — they may sell privately, donate to museums, or simply hold. Only works that have appreciated meaningfully are consistently reconsigned to major auctions where they'll receive prominent coverage. This selection bias — where poor performers drop out of the index — causes measured returns to overstate the returns an average art buyer would actually experience. Academic estimates suggest survivorship bias inflates measured art returns by 2–4 percentage points annually.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Royalties & Intellectual Property ────────────────────────────
    {
      id: "alt-4",
      title: "Royalties & Intellectual Property",
      description:
        "Music catalogs, pharmaceutical royalties, patent licensing, DCF valuation of royalty streams, and the Hipgnosis model",
      icon: "Music",
      xpReward: 80,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Music Royalties: Master Recordings, Publishing, and Performance",
          content:
            "Music royalties have emerged as a serious institutional asset class — driven by streaming's transformation of music economics.\n\n**The Three Revenue Streams of Music IP:**\n\n**1. Master Recording Rights:**\nOwnership of the original recorded performance. When a song streams on Spotify, the master owner receives approximately 52% of total royalties. Historically owned by record labels (Universal Music Group, Sony Music, Warner Music), but artists increasingly retain masters or reacquire them.\n- Example: Taylor Swift's re-recording campaign ('Taylor's Version') was a response to losing her masters to Scooter Braun's Ithaca Holdings.\n\n**2. Publishing Rights (Composition):**\nOwnership of the underlying composition — the melody and lyrics. The songwriter and publisher split approximately 15% of streaming royalties.\n- Publishing rights generate synchronization ('sync') fees: when a song appears in a film, commercial, or video game, the publisher licenses the composition.\n- **Performing Rights Organizations (PROs)**: ASCAP, BMI, SESAC collect performance royalties when songs play on radio, TV, streaming, in restaurants and clubs.\n\n**3. Performance Royalties:**\nGenerated when a recording is performed or broadcast publicly. Collected by SoundExchange in the U.S. for digital performance.\n\n**Why streaming changed everything:**\n- CD/download revenues were lumpy and declining. Streaming creates **predictable, recurring monthly royalty income** — converting music IP from a declining asset into an annuity-like cash flow.\n- Spotify, Apple Music, Amazon Music, YouTube: global reach means catalog revenue is surprisingly durable (old Beatles songs continue generating income as new listeners discover them).\n- Royalty revenues have become DCF-modelable with reasonable predictability, attracting institutional capital.",
          highlight: [
            "master recordings",
            "publishing rights",
            "synchronization fees",
            "performance royalties",
            "ASCAP",
            "BMI",
            "SoundExchange",
            "streaming",
            "Spotify",
          ],
        },
        {
          type: "teach",
          title: "Pharmaceutical and Patent Royalties",
          content:
            "Not all royalties come from music — pharmaceutical royalties and technology patent licensing are equally compelling investment categories.\n\n**Pharmaceutical Royalty Investing:**\nDrug companies often license their drug candidates to other companies during development. In exchange, the licensor receives royalty payments on future sales — typically 2–12% of net revenues.\n\n**Royalty Pharma (RPRX)** — the dominant publicly traded pharmaceutical royalty fund:\n- Purchases existing royalty streams from universities, research institutions, and biotech companies\n- Portfolio includes royalties on: Imbruvica (blood cancer), Tysabri (multiple sclerosis), Xtandi (prostate cancer), COVID-19 vaccine royalties\n- **Key advantage**: By the time Royalty Pharma acquires a royalty, the drug has already been approved — **no clinical risk**. Revenue depends only on commercial adoption and patent life.\n- **Patent cliff risk**: When the patent expires (typically 20 years from filing, 10–14 years of effective market exclusivity), generics enter and royalty revenues collapse rapidly.\n\n**Royalty cash flow characteristics:**\n- High-margin (no manufacturing, no sales force, no R&D)\n- Predictable (tied to a drug's sales, which are modelable based on patient population, penetration, price)\n- Duration-limited (patent life — typically 7–12 years of peak royalties remaining at acquisition)\n\n**Technology Patent Royalties:**\n- Standard Essential Patents (SEPs): Patents that must be licensed to anyone implementing a standard (e.g., 4G/5G cellular standards). Qualcomm derives much of its income from licensing chip patents.\n- Non-practicing entities (NPEs, sometimes called 'patent trolls'): Companies that acquire patents purely for licensing income, with no manufacturing operations.\n- **Acacia Research**: Listed NPE that acquires and licenses technology patents.",
          highlight: [
            "Royalty Pharma",
            "pharmaceutical royalties",
            "patent cliff",
            "clinical risk",
            "standard essential patents",
            "Qualcomm",
            "synchronization",
            "net revenues",
          ],
        },
        {
          type: "teach",
          title: "Valuing Royalty Streams: DCF and NPS Multiples",
          content:
            "Royalty streams are valued using discounted cash flow analysis — the same framework as a bond, but with more uncertainty around the revenue forecast.\n\n**DCF Framework for Royalty Valuation:**\n\nValue = Σ (Royalty Cash Flow in Year t) / (1 + Discount Rate)^t\n\nFor a music catalog:\n- **Year 1–5**: Forecast near-term streaming growth trends for the artist's catalog\n- **Year 6–20**: Apply decay rate (music catalogs typically decline 3–7% annually after initial period)\n- **Year 20+**: Terminal value (smaller, perpetuity-like residual)\n\n**The discount rate — what drives it:**\n- **Asset-specific risk**: Is this a diversified catalog (thousands of songs) or a single artist?\n- **Revenue concentration**: Does one hit song represent 60% of income? High concentration = higher risk premium.\n- **Macro rate environment**: As interest rates rise, the discount rate for royalty streams rises, compressing valuations.\n- **Platform risk**: What if Spotify fails or streaming economics change?\n\n**NPS (Net Publisher Share) Multiples:**\nThe music industry uses NPS multiples rather than pure DCF — a shorthand valuation metric.\n- **NPS** = the publisher's share of royalty income (after PRO distributions to songwriters)\n- Catalog valuation = NPS × multiple; typical range **15–25× NPS** during the 2018–2022 peak of music M&A\n- Bob Dylan's catalog sold for ~$300M (~25× NPS), suggesting buyers projected minimal decay in Dylan's streaming income\n- Rising interest rates in 2022–2023 compressed multiples to 12–16× as discount rates increased\n\n**Hipgnosis and Blackstone:**\nHipgnosis Songs Fund (listed, SONG LN) and Blackstone's music IP portfolio acquired catalogs aggressively 2018–2022. SONG faced NAV write-downs as rising rates compressed fair values — a real-time case study in duration risk in royalty assets.",
          highlight: [
            "NPS multiples",
            "DCF",
            "discount rate",
            "catalog decay",
            "Hipgnosis",
            "Blackstone",
            "Bob Dylan",
            "duration risk",
            "net publisher share",
          ],
        },
        {
          type: "teach",
          title: "Song Catalog Acquisitions: The Major Players",
          content:
            "The music IP acquisition wave of 2018–2023 transformed the industry — understanding the ecosystem helps evaluate royalty investments.\n\n**Major Catalog Acquirers:**\n\n**Hipgnosis Songs Fund (2018):**\n- Founded by Merck Mercuriadis and backed by Nile Rodgers\n- Listed on London Stock Exchange (SONG LN)\n- Built a $2.2B catalog portfolio including songs by The Weeknd, Blondie, Shakira, Fleetwood Mac\n- Ran into governance and valuation disputes; ultimately acquired by Blackstone in 2024 at a significant discount to peak NAV\n- Lesson: **rising interest rates are lethal to long-duration royalty funds with leverage**\n\n**Primary Wave Entertainment:**\n- Private; acquired Dylan, Bruce Springsteen ($550M), Shakira, Leonard Cohen catalogs\n- Backed by Lyric Capital Group\n\n**Round Hill Music, Kobalt Capital:**\n- Major institutional publishers/royalty funds\n\n**What went wrong for listed music funds:**\n1. Acquired at 20–25× NPS when rates were near zero\n2. Used leverage (borrowing against catalog value)\n3. As rates rose 2022–2023, discount rates increased, NAVs fell, and LTV ratios on debt became problematic\n4. Streaming growth slowed from COVID-era highs\n5. Share prices traded at 30–40% discounts to stated NAV\n\n**Lessons for investors:**\n- Royalty assets are **interest rate sensitive** — treat them as long-duration bonds, not equity\n- Leverage amplifies the duration risk\n- Single-artist concentration creates significant idiosyncratic risk\n- Diversified catalogs (thousands of songs, multiple artists, multiple genres) are far more resilient than concentrated bets",
          highlight: [
            "Hipgnosis",
            "Blackstone",
            "NPS",
            "interest rate sensitive",
            "duration risk",
            "leverage",
            "Bob Dylan",
            "Bruce Springsteen",
            "NAV discount",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "When valuing a music royalty catalog using DCF, what factor most directly determines the discount rate applied to future royalty cash flows?",
          options: [
            "The riskiness of the cash flows — including catalog diversification, artist concentration, platform risk, and the prevailing risk-free interest rate environment",
            "The current Billboard chart position of the artist's most recent single",
            "The number of countries in which the songs have streaming licenses",
            "The age of the catalog — older catalogs automatically receive lower discount rates",
          ],
          correctIndex: 0,
          explanation:
            "The discount rate in a royalty DCF reflects the time value of money plus a risk premium. The risk-free rate (e.g., 10-year Treasury) forms the floor — rising rates directly increase the discount rate and compress valuations, as Hipgnosis investors learned painfully in 2022. On top of the risk-free rate, investors add premiums for: catalog concentration (one artist vs. thousands of songs), platform risk (streaming economics could change), catalog decay risk (will streams decline faster than expected?), and illiquidity. A highly diversified catalog from established legacy artists in multiple genres deserves a lower risk premium than a single emerging artist's catalog.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Pharmaceutical royalty investors who acquire royalties on already-approved drugs are completely protected from any form of risk, since clinical development has already succeeded.",
          correct: false,
          explanation:
            "False. While pharmaceutical royalty investors do eliminate clinical risk (the drug has already received regulatory approval), multiple other risks remain. Patent cliff risk is the most significant: when the patent expires, generic competition typically destroys 80–90% of brand revenues within 12–18 months, ending royalty income. Commercial risk persists if sales fall short of projections due to competition from new drugs or label restrictions. Regulatory risk remains if safety issues emerge post-approval causing label restrictions or market withdrawal. Royalty Pharma's portfolio is diversified across many drugs precisely to manage these remaining risks.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Cryptocurrency as Alternative Asset ──────────────────────────
    {
      id: "alt-5",
      title: "Cryptocurrency as Alternative Asset",
      description:
        "Bitcoin as digital gold, portfolio correlation benefits, sizing frameworks, halving cycles, and Ethereum staking yield",
      icon: "Bitcoin",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Bitcoin as a Gold Alternative: Store of Value Thesis",
          content:
            "Bitcoin's investment case rests primarily on a store-of-value thesis — and understanding the theoretical basis is essential before discussing portfolio allocation.\n\n**The Digital Gold Thesis:**\nGold has served as a store of value for millennia because it possesses specific properties:\n- **Scarcity**: Limited supply, costly to mine\n- **Durability**: Does not corrode or decay\n- **Portability**: Can be moved (though physical gold is heavy)\n- **Divisibility**: Can be subdivided\n- **Verifiability**: Can be tested for authenticity\n\nBitcoin proponents argue it improves on gold across every dimension:\n- **Fixed supply**: 21 million BTC maximum — mathematically enforced, cannot be inflated by any central bank or government\n- **Digital durability**: Software exists as long as the network runs\n- **Perfect portability**: Can be sent globally in minutes with a 12-word seed phrase\n- **Perfect divisibility**: 1 BTC = 100,000,000 satoshis\n- **Transparent verification**: Public blockchain — any node can verify any transaction\n\n**Non-sovereign currency:**\nNeither the US, EU, China, nor any government controls Bitcoin's monetary policy. This is the core feature for investors seeking to diversify away from fiat currency debasement risk. In hyperinflationary environments (Venezuela, Argentina, Turkey), Bitcoin adoption accelerates as citizens seek an exit from collapsing local currencies.\n\n**Institutional adoption milestone:**\nThe approval of Bitcoin spot ETFs in the U.S. in January 2024 (BlackRock iShares Bitcoin Trust — IBIT, Fidelity Wise Origin Bitcoin Fund — FBTC) marked a structural shift: institutional capital can now access Bitcoin within traditional brokerage accounts, dramatically expanding the addressable investor base.",
          highlight: [
            "fixed supply",
            "21 million BTC",
            "non-sovereign",
            "digital gold",
            "store of value",
            "Bitcoin spot ETF",
            "BlackRock IBIT",
            "satoshis",
          ],
        },
        {
          type: "teach",
          title: "Portfolio Theory: Bitcoin Correlation and Allocation",
          content:
            "Modern portfolio theory provides the framework for evaluating Bitcoin as a portfolio addition — focusing on correlation, volatility, and Sharpe ratio impact.\n\n**Bitcoin Correlation to Traditional Assets:**\nHistorically (2012–2020), Bitcoin showed near-zero correlation to:\n- S&P 500: ~0.05–0.15\n- US Bonds: ~0.00–0.10\n- Gold: ~0.05–0.15\n\nHowever, during the 2020–2022 period, correlations increased temporarily:\n- During COVID crash (March 2020): Bitcoin sold off alongside all risk assets\n- 2022 rate-hike cycle: Bitcoin correlated with high-beta tech stocks (~0.60–0.70)\n- Post-2023: Correlations normalized lower again as Bitcoin's maturation and ETF flows stabilized\n\n**Key insight**: Correlation is time-varying and regime-dependent. During liquidity crises, 'flight to safety' selling hits all risk assets including Bitcoin. The diversification benefit materializes most strongly in normal market environments.\n\n**Sharpe Ratio Impact — The Math:**\nFor a 60/40 portfolio:\n- Adding a small allocation to a high-return (but volatile) asset with low correlation can improve Sharpe ratio even though volatility increases\n- The formula for portfolio Sharpe with a new asset depends on: expected return of Bitcoin, Bitcoin's Sharpe ratio, and correlation with the portfolio\n- A 1% Bitcoin allocation rarely moves the needle materially\n- A 5% allocation is the level where measurable Sharpe ratio improvement has been observed in historical backtests — but with significant sensitivity to the entry period chosen\n\n**Volatility reality check:**\nBitcoin's annualized volatility: 70–80% historically (vs ~15% for S&P 500). A 5% allocation contributes about 3.5–4% to portfolio volatility — manageable but not trivial. Maximum drawdowns exceeding 80% (peak-to-trough) have occurred multiple times.",
          highlight: [
            "correlation",
            "Sharpe ratio",
            "60/40 portfolio",
            "volatility",
            "diversification",
            "annualized volatility",
            "maximum drawdown",
            "regime-dependent",
          ],
        },
        {
          type: "teach",
          title: "Sizing Framework: 1–5% Allocation",
          content:
            "Institutional consensus has converged on a 1–5% portfolio allocation for Bitcoin — enough to benefit from potential upside while limiting the impact of extreme drawdowns.\n\n**Why 1–5%?**\n\n**The downside case (Bitcoin goes to zero):**\n- 1% allocation: Portfolio loses 1% — painful but survivable\n- 5% allocation: Portfolio loses 5% — a meaningful but manageable drawdown\n- 10% allocation: Portfolio loses 10% — approaching a career-ending loss for an institutional PM\n\n**The upside case (Bitcoin 10× from entry):**\n- 1% allocation: Portfolio gains 9% from Bitcoin alone\n- 5% allocation: Portfolio gains 45% from Bitcoin alone\n- These asymmetric payoffs justify a position despite extreme volatility\n\n**Institutional guidance:**\n- **Yale Endowment (David Swensen model)**: Endorsed small (1–3%) crypto allocations in alternative buckets\n- **ARK Invest (Cathie Wood)**: Suggested up to 19% allocation in an 'optimal portfolio' — an outlier view\n- **BlackRock Bitcoin ETF commentary (2024)**: 1–2% allocation considered appropriate for most portfolios\n- **Fidelity Digital Assets**: 2–5% for investors with moderate risk tolerance\n\n**Rebalancing discipline is essential:**\nA 5% Bitcoin allocation that 10× becomes a 30%+ position — you must rebalance systematically or the risk profile of your entire portfolio transforms without your explicit intention.\n\n**Tax efficiency considerations:**\n- Bitcoin held in a tax-advantaged account (IRA, 401k via Bitcoin ETF) avoids the complexity of crypto tax reporting\n- Direct Bitcoin ownership requires tracking cost basis for every purchase — important for tax optimization",
          highlight: [
            "1–5% allocation",
            "downside case",
            "upside asymmetry",
            "rebalancing",
            "BlackRock",
            "Fidelity Digital Assets",
            "tax-advantaged",
            "cost basis",
          ],
        },
        {
          type: "teach",
          title: "Bitcoin Halving and Supply Dynamics",
          content:
            "Bitcoin's fixed supply schedule is enforced by the protocol's halving mechanism — one of the most predictable supply-side events in any asset class.\n\n**How Bitcoin Supply Works:**\nNew Bitcoin is created as a reward to miners who process transactions and secure the network. The protocol halves this reward approximately every 210,000 blocks (roughly every 4 years).\n\n**Halving History:**\n- **2009**: Genesis — 50 BTC per block reward\n- **2012 (first halving)**: Reward → 25 BTC/block. Price went from ~$12 to ~$1,000 over the following year\n- **2016 (second halving)**: Reward → 12.5 BTC/block. Price went from ~$650 to ~$20,000 in late 2017\n- **2020 (third halving)**: Reward → 6.25 BTC/block. Price went from ~$9,000 to ~$69,000 in November 2021\n- **2024 (fourth halving)**: Reward → 3.125 BTC/block. Post-halving price trajectory ongoing\n\n**Supply economics post-halving:**\nDaily new Bitcoin issuance drops 50% after each halving. If demand remains constant, the reduction in new supply creates upward price pressure — classic supply-demand mechanics.\n\n**Stock-to-Flow model:**\nThe S2F model (PlanB) compares Bitcoin's existing stock (existing supply) to new annual flow (newly mined). After the 2024 halving, Bitcoin's S2F ratio exceeds gold's — suggesting comparable scarcity.\n\n**Caveats:**\n- Halving cycles are well-known and extensively studied — are they already priced in?\n- Post-2022, institutional flows through ETFs may dominate price more than miner supply dynamics\n- Correlation between halving and subsequent price gains is based on only 4 data points — statistically fragile\n- **Miner economics**: After halvings, less efficient miners become unprofitable and shut down — can create short-term hash rate volatility",
          highlight: [
            "halving",
            "block reward",
            "supply reduction",
            "stock-to-flow",
            "2024 halving",
            "miners",
            "hash rate",
            "210,000 blocks",
          ],
        },
        {
          type: "teach",
          title: "Ethereum: Smart Contract Platform and Staking Yield",
          content:
            "Ethereum differs fundamentally from Bitcoin in its design philosophy and investment thesis — understanding the distinction matters for portfolio construction.\n\n**Bitcoin vs Ethereum:**\n- **Bitcoin**: Single-purpose store of value / payment network. Deliberately simple, unchanging protocol. No programmability.\n- **Ethereum**: Programmable blockchain — a global computing platform. Smart contracts enable DeFi, NFTs, DAOs, and tokenized assets.\n\n**Ethereum's Proof-of-Stake Transition ('The Merge', September 2022):**\nEthereum transitioned from energy-intensive Proof-of-Work mining to Proof-of-Stake. Instead of miners, **validators** stake (lock up) 32 ETH as collateral to participate in block validation.\n\n**Staking Yield:**\n- Validators earn staking rewards: approximately **3–5% annualized** in ETH\n- Investors can stake via liquid staking protocols (Lido Finance: stETH, Rocket Pool: rETH) with any amount of ETH\n- Liquid staking tokens can be used in DeFi while still earning staking rewards\n- **This cash flow-like yield** is distinct from Bitcoin, which generates no passive income\n\n**EIP-1559 — ETH as a Deflationary Asset:**\nSince August 2021, a portion of every transaction fee on Ethereum is 'burned' (permanently destroyed). During high-activity periods, more ETH is burned than created through staking — making ETH supply net deflationary.\n\n**Investment thesis for ETH:**\nIf Ethereum becomes the dominant platform for global tokenized finance, the ETH staking yield represents a claim on the 'economic activity' of the blockchain — analogous to owning shares in a fee-generating infrastructure platform.\n\n**Risk considerations:**\n- **Competition**: Solana, Avalanche, and other Layer-1 blockchains compete for DeFi/application market share\n- **Regulatory risk**: SEC treatment of ETH staking as a security remains legally uncertain in the U.S.\n- **Smart contract risk**: Bugs in DeFi protocols built on Ethereum can cause massive losses (hacks, exploits)",
          highlight: [
            "Ethereum",
            "Proof-of-Stake",
            "staking yield",
            "The Merge",
            "smart contracts",
            "EIP-1559",
            "liquid staking",
            "Lido",
            "deflationary",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A 60/40 portfolio (60% equities, 40% bonds) manager is considering adding a 5% Bitcoin allocation (funded by reducing equities to 55% and bonds to 40%). Assuming Bitcoin's historical annualized return of ~60%, annualized volatility of ~75%, and its typical correlation to the 60/40 portfolio of approximately 0.15 during non-crisis periods, what most likely happens to the portfolio's Sharpe ratio?",
          options: [
            "The Sharpe ratio likely improves modestly — Bitcoin's high return and low correlation contribute sufficient return per unit of risk to more than offset the volatility it adds, given the 5% sizing limits the volatility drag",
            "The Sharpe ratio definitively doubles because Bitcoin's return is 4× the stock market's return",
            "The Sharpe ratio always falls when any volatile asset is added regardless of expected returns or correlation",
            "The Sharpe ratio is unaffected because Bitcoin's volatility and return cancel each other out in portfolio math",
          ],
          correctIndex: 0,
          explanation:
            "In mean-variance portfolio theory, adding an asset improves portfolio Sharpe ratio if and only if its Sharpe ratio exceeds the product of the existing portfolio's Sharpe ratio and the correlation between the new asset and the portfolio. Bitcoin's Sharpe ratio (~0.7–0.9 historically) combined with its low correlation (~0.15) to the 60/40 portfolio meets this condition during non-crisis periods. The 5% sizing is the key constraint — it limits the volatility addition to roughly 3.5–4%, while the return contribution from an asset with high expected return meaningfully boosts the numerator. However, Sharpe improvement is sensitive to the period used for estimates and collapses if correlation rises toward 0.5+.",
          difficulty: 3,
        },
      ],
    },
  ],
};
