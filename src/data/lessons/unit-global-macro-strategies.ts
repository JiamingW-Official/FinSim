import type { Unit } from "./types";

export const UNIT_GLOBAL_MACRO_STRATEGIES: Unit = {
  id: "global-macro-strategies",
  title: "Global Macro Strategies",
  description:
    "Master macro trading strategies: rate cycles, FX carry, commodity trends, cross-asset thematic investing",
  icon: "Globe",
  color: "#06b6d4",
  lessons: [
    // ─── Lesson 1: The Macro Framework ──────────────────────────────────────────
    {
      id: "global-macro-strategies-1",
      title: "The Macro Framework",
      description:
        "Business cycle quadrants, asset class rotation, Bridgewater's All-Weather, and leading indicators for macro positioning",
      icon: "LayoutGrid",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The Growth/Inflation Matrix",
          content:
            "Macro traders think in **quadrants** defined by the direction of two variables — growth and inflation — relative to expectations:\n\n**1. Goldilocks (Growth ↑, Inflation ↓)**: The ideal environment. The economy expands without overheating. Equities outperform — especially growth stocks. Bonds do well too (low inflation = stable real yields). Corporate credit spreads tighten. The classic 1990s US expansion exemplified this.\n\n**2. Reflation (Growth ↑, Inflation ↑)**: Economy is recovering and inflation is picking up alongside it. Commodities and real assets thrive. Equities remain strong but value/cyclicals beat growth. TIPS outperform nominal bonds. Short-duration assets preferred over long-duration.\n\n**3. Stagflation (Growth ↓, Inflation ↑)**: The worst quadrant for traditional portfolios — equities fall, bonds fall (inflation erodes them), and the only winners are commodities and TIPS. The 1970s oil shocks created the defining stagflationary episode. Cash and commodity exposure are the only defenses.\n\n**4. Deflation/Recession (Growth ↓, Inflation ↓)**: Growth contracts and inflation falls. Long-duration government bonds are the star performer — yields drop as central banks cut rates and flight-to-safety flows in. Equities fall, commodities fall, and cash preserves capital. High-quality government bonds can rise dramatically — 2008 saw 30-year Treasuries return +25% while equities fell 37%.",
          highlight: [
            "Goldilocks",
            "Reflation",
            "Stagflation",
            "Deflation",
            "growth",
            "inflation",
            "TIPS",
            "quadrant",
          ],
        },
        {
          type: "teach",
          title: "Bridgewater's All-Weather Portfolio",
          content:
            "Ray Dalio and Bridgewater developed **All-Weather** (also called **Risk Parity**) to perform across all four macro quadrants by balancing **risk contributions** rather than dollar allocations.\n\nThe insight: A traditional 60/40 portfolio is not balanced at all — equities are ~3× more volatile than bonds, so 90%+ of portfolio risk comes from equities alone.\n\n**All-Weather Allocations** (approximate):\n- 30% equities — performs in Goldilocks and Reflation\n- 40% long-term bonds — performs in Deflation and low-inflation periods\n- 15% intermediate bonds — stabilizes the core\n- 7.5% gold — performs in stagflation and currency debasement\n- 7.5% commodities — performs in Reflation and Stagflation\n\n**Why it works**: Each quadrant has an asset that does well. By diversifying across quadrants in *risk* terms, the portfolio survives storms that would devastate conventional allocations.\n\n**The catch**: All-Weather uses leverage to equalize risk — bonds need leverage because they have lower volatility than equities. In rising rate environments (like 2022), levered bond positions can become painful, which is why All-Weather lost ~20% in 2022 despite being 'balanced.'",
          highlight: [
            "All-Weather",
            "Risk Parity",
            "Ray Dalio",
            "Bridgewater",
            "risk contributions",
            "60/40",
            "leverage",
          ],
        },
        {
          type: "teach",
          title: "Leading Indicators for Macro Positioning",
          content:
            "Macro traders do not wait for GDP or employment data (lagging). They monitor **leading indicators** that signal regime changes 3–12 months early.\n\n**Yield Curve (2s10s spread)**:\n- Inverted (2-year yield > 10-year): predicts recession with ~12-18 month lag — inverted before every US recession since 1968\n- Steepening: early expansion, or inflation expectations rising\n\n**Credit Spreads (HY vs IG)**:\n- Widening spreads → tighter financial conditions, stress building → bearish signal for risk assets\n- Tight spreads → credit availability is easy → supportive for equities and risk-on\n\n**PMI (Purchasing Managers' Index)**:\n- Above 50 = expansion; Below 50 = contraction\n- The *direction* and rate of change matters more than the level — PMI falling from 58 to 52 is still expansionary but the momentum is deteriorating\n- Manufacturing PMI leads the real economy by ~2 months\n\n**Top-down vs Bottom-up**:\nMacro sets the **tide** — when the tide goes out, even good companies fall. When it comes in, even mediocre ones float. Top-down macro analysis filters which asset classes and sectors to over/underweight. Bottom-up stock picking then selects the best instruments within those favored categories. In a strong Goldilocks regime, bottom-up selection matters more. In a stagflationary crash, macro dictates almost everything.",
          highlight: [
            "yield curve",
            "2s10s",
            "credit spreads",
            "PMI",
            "leading indicators",
            "top-down",
            "bottom-up",
            "inverted",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "The latest economic data shows PMI falling from 54 to 47 (below 50 for the first time in two years). Meanwhile, CPI has risen to 6.8% year-over-year, driven by energy and food prices. The central bank is in a bind — it cannot cut rates to support growth without worsening inflation.",
          question:
            "Which macro quadrant is this economy entering, and which asset classes are most likely to outperform?",
          options: [
            "Stagflation — commodities (oil, gold) and TIPS are likely to outperform; long-duration bonds and equities are likely to underperform",
            "Goldilocks — equities and bonds both outperform as the economy finds a soft landing",
            "Reflation — equities outperform as growth accelerates alongside moderate inflation",
            "Deflation — long-duration bonds are the best bet as the central bank cuts aggressively",
          ],
          correctIndex: 0,
          explanation:
            "PMI below 50 signals contracting growth, while CPI at 6.8% indicates elevated and rising inflation. This is the stagflation quadrant — falling growth combined with rising inflation. The central bank cannot easily cut rates (doing so would worsen inflation) nor tighten too aggressively (doing so would deepen the growth contraction). In this environment, commodities and TIPS (Treasury Inflation-Protected Securities) are the classic outperformers because they benefit from rising inflation even as growth slows. Long-duration bonds lose because inflation erodes their real value. Equities lose because corporate earnings are squeezed by both cost inflation and slowing consumer demand.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "In Bridgewater's All-Weather portfolio, the largest allocation by dollar amount goes to equities, making equities the primary driver of portfolio returns.",
          correct: false,
          explanation:
            "False. In All-Weather, equities receive only about 30% of the dollar allocation — the largest dollar allocation goes to long-term bonds (approximately 40%). More importantly, All-Weather is designed so that each asset class contributes *equally to portfolio risk*, not portfolio dollars. Bonds need a larger nominal allocation precisely because they are less volatile than equities — it takes more bond exposure to match the risk contribution of a smaller equity position. The goal is risk parity across the four macro quadrants, not dollar parity.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Interest Rate Trading ────────────────────────────────────────
    {
      id: "global-macro-strategies-2",
      title: "Interest Rate Trading",
      description:
        "Rate cycle positioning, yield curve trades, duration risk, central bank divergence, and TIPS breakeven strategies",
      icon: "TrendingDown",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Positioning Along the Rate Cycle",
          content:
            "Interest rate cycles follow a predictable sequence that macro traders exploit:\n\n**Early Hike Cycle** (central bank just started hiking):\n- Short-duration bonds and underweight long bonds — rates are rising, so bond prices are falling\n- Hold floating-rate notes (FRNs) and money market instruments — their yields rise with the central bank rate\n- Short the long end of the curve (e.g., short 10-year or 30-year Treasuries)\n- Equities can still perform if the hike reflects strong growth\n\n**Late Hike Cycle** (rates near peak, economy slowing):\n- Start accumulating long-duration bonds — this is the ideal entry point before the eventual cuts\n- Credit spreads widen as financial conditions tighten — reduce high-yield exposure\n- Equities become vulnerable, especially rate-sensitive sectors (utilities, REITs, tech)\n- The classic macro trade: buy 10-year Treasuries when the Fed is still hiking but leading indicators are turning down\n\n**Easing Cycle** (cuts beginning):\n- Long-duration bonds surge — lower rates mean higher bond prices for long-dated instruments\n- Growth and momentum equities outperform\n- Gold can rally (lower real rates reduce opportunity cost of holding gold)\n\n**Key insight**: The market prices *expected* rate changes, not current rates. The best time to buy bonds is before cuts are confirmed, not after — by then, the move has largely happened.",
          highlight: [
            "early hike",
            "late hike",
            "easing cycle",
            "duration",
            "long-duration",
            "floating-rate",
            "rate cycle",
          ],
        },
        {
          type: "teach",
          title: "Yield Curve Trades: Steepeners and Flatteners",
          content:
            "The yield curve is not a monolith — macro traders express nuanced views by trading the *shape* of the curve.\n\n**2s10s Spread**: The difference between the 10-year yield and the 2-year yield. Positive = normal (upward sloping); negative = inverted.\n\n**Steepener Trade** (buy 2-year, sell 10-year, or equivalently short front end, long back end):\n- When to use: Early recovery phase — the Fed has cut short-term rates but growth/inflation expectations for the future are rising, pulling up long-end yields\n- Also triggered by: fiscal expansion (more supply of long bonds), inflation concerns\n- Payoff: Profits when the 10-year yield rises relative to the 2-year yield\n\n**Flattener Trade** (sell 10-year, buy 2-year, or short back end, long front end):\n- When to use: Late cycle — the Fed is hiking aggressively, pushing up short-term rates faster than long-term rates\n- Also triggered by: global demand for long-duration safe assets (e.g., Japanese and European pension buyers flattening the US curve)\n- Payoff: Profits when the spread between 2-year and 10-year narrows\n\n**Duration Math**: Duration measures a bond's price sensitivity to yield changes.\n- **Rule**: 1% change in yield × duration = approximate % price change (inverse relationship)\n- A 10-year Treasury with duration ~8: if yields rise 1%, price falls ~8%\n- A 30-year bond with duration ~18: if yields rise 1%, price falls ~18%\n- This is why macro traders who expect rising rates aggressively short long-duration bonds",
          highlight: [
            "2s10s",
            "steepener",
            "flattener",
            "duration",
            "yield curve",
            "inverted",
            "front end",
            "back end",
          ],
        },
        {
          type: "teach",
          title: "Central Bank Divergence & TIPS Breakeven Trades",
          content:
            "**Central Bank Divergence** is one of the most reliable FX and rate macro trades:\n\nWhen two central banks are in different phases of their cycles, the FX rate between their currencies tends to move sharply.\n\n**Example: Fed hiking, ECB on hold**:\n- US short-term rates rise → US bonds yield more → capital flows into USD-denominated assets\n- Long USD / Short EUR FX trade profits\n- Can express via: FX spot, interest rate futures differential, or long US front-end bonds vs short European equivalents\n\n**Real vs Nominal Rates and TIPS**:\n- **Nominal yield** = Real yield + Inflation expectations (breakeven)\n- **TIPS (Treasury Inflation-Protected Securities)**: Principal adjusts with CPI — protects against inflation surprises\n- **Breakeven inflation** = Nominal Treasury yield − TIPS yield of same maturity\n  - If 10-year nominal yield = 4.2%, 10-year TIPS yield = 1.7% → Breakeven = 2.5% (the market's implied inflation expectation)\n- **Trade**: If you expect inflation to exceed market expectations (e.g., breakeven = 2.5% but you think inflation will be 4%) → buy TIPS (receive actual CPI), sell nominal Treasuries\n- **Trade**: If you expect disinflation (Fed successfully bringing inflation down) → buy nominal Treasuries, sell TIPS\n\nReal yields — not nominal yields — are what drive gold prices and equity valuations. Falling real yields boost both gold and high-multiple growth stocks.",
          highlight: [
            "central bank divergence",
            "TIPS",
            "breakeven inflation",
            "real yield",
            "nominal yield",
            "divergence",
            "ECB",
            "Fed",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "A recession has just been confirmed. The Federal Reserve has cut interest rates by 50 basis points in an emergency move and signals further cuts ahead. The 2-year Treasury yield has dropped sharply to 2.8%, while the 10-year yield remains at 3.9%. The yield curve has just gone from inverted to positively sloped.",
          question:
            "How should a macro trader position the yield curve in response?",
          options: [
            "Put on a steepener trade — buy long-duration 10-year or 30-year bonds, as further rate cuts will drive the long end down less than the front end",
            "Put on a flattener trade — short the 10-year, as recession means long yields will drop faster than short yields",
            "Short all bonds — recession means governments will issue massive debt, pushing all yields up",
            "Buy the 2-year exclusively — the safest bet is the shortest duration when uncertainty is high",
          ],
          correctIndex: 0,
          explanation:
            "When the Fed starts cutting after a recession, the front end of the yield curve (2-year yields) drops sharply as it is most sensitive to the policy rate. The long end (10-year, 30-year) may also fall, but typically less so because: (1) markets price in an eventual recovery and (2) fiscal stimulus in a recession means more long-duration bond supply. This dynamic causes the yield curve to steepen — the spread between 10-year and 2-year widens. The steepener trade (long long-duration, short short-duration) or simply owning long-duration bonds profits as the curve transitions from inverted to steep. In fact, the early stages of a rate-cut cycle are historically one of the best times to own long-duration government bonds.",
          difficulty: 3,
        },
        {
          type: "quiz-mc",
          question:
            "A 20-year government bond has a duration of 15. If interest rates rise by 0.5%, what is the approximate percentage change in the bond's price?",
          options: [
            "Decreases by approximately 7.5%",
            "Increases by approximately 7.5%",
            "Decreases by approximately 0.5%",
            "Increases by approximately 15%",
          ],
          correctIndex: 0,
          explanation:
            "Duration measures price sensitivity: % price change ≈ −Duration × Δyield. With duration = 15 and a yield increase of 0.5% (or 50 basis points): % change ≈ −15 × 0.005 = −0.075 = −7.5%. The price falls approximately 7.5%. Note the inverse relationship — when yields rise, bond prices fall. This is why macro traders who expect rising rates (either through hikes or inflation surprises) sell long-duration bonds aggressively: the price losses are substantial.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: FX Macro Strategies ──────────────────────────────────────────
    {
      id: "global-macro-strategies-3",
      title: "FX Macro Strategies",
      description:
        "FX carry trades, purchasing power parity, current account dynamics, central bank divergence, and EM FX risks",
      icon: "ArrowLeftRight",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "The FX Carry Trade",
          content:
            "The **carry trade** is one of the most popular macro strategies: borrow in a low-interest-rate currency and invest in a high-interest-rate currency, pocketing the interest rate differential.\n\n**Classic Example**: Borrow JPY at 0.1% interest, convert to AUD, invest in Australian government bonds yielding 4.5%. Net carry = 4.4% per year — earned simply for holding the position.\n\n**Why it works**: **Uncovered Interest Rate Parity (UIP)** theoretically says the higher-rate currency should depreciate exactly enough to offset the rate differential. In practice, currencies do NOT move as theory predicts — the high-rate currency often *appreciates* or remains stable, delivering the full carry as pure profit.\n\n**The risk**: Carry trades are vulnerable to sudden 'carry unwinds.' When risk aversion spikes (financial crisis, geopolitical shock), investors rush to close carry trades simultaneously:\n- They sell AUD (buy it back later → AUD weakens)\n- They buy back JPY (to repay loans → JPY strengthens sharply)\n- AUD/JPY can drop 10–15% in days during an unwind\n\n**Indicators of crowded carry**: When too many investors are in the same carry trade, the unwind risk becomes extreme. VIX levels above 25 historically signal danger for carry positions. The 2008 financial crisis unwound years of JPY carry in weeks, with AUD/JPY falling over 40% from peak to trough.",
          highlight: [
            "carry trade",
            "JPY",
            "AUD",
            "interest rate differential",
            "carry unwind",
            "uncovered interest rate parity",
            "UIP",
          ],
        },
        {
          type: "teach",
          title: "Current Account, PPP, and Currency Valuation",
          content:
            "**Current Account Deficit** and its FX implications:\n- The current account measures a country's net trade in goods, services, and transfers\n- A **persistent deficit** means the country imports more than it exports and must finance the gap by attracting foreign capital\n- Over time, persistent deficits tend to weaken the currency — the country needs to devalue to make its exports cheaper and rebalance trade\n- Example: US runs a ~$1 trillion/year current account deficit. The dollar remains supported only because the US offers the reserve asset of choice (Treasuries); most countries cannot sustain this without a weakening currency\n\n**Purchasing Power Parity (PPP)**:\n- The theory that over the long run, exchange rates should equalize the price of a identical basket of goods across countries\n- **The Big Mac Index** (The Economist) applies this: if a Big Mac costs $5.50 in the US and ¥600 in Japan, the 'fair' USD/JPY rate = 600/5.50 = 109\n- When a currency is significantly above PPP, it is **overvalued** → mean reversion trade: short the overvalued currency\n- PPP is a poor short-term timing tool (currencies can stay over/undervalued for years) but provides a fundamental anchor for long-horizon macro trades\n\n**Interest Rate Parity (IRP)**:\n- Forward exchange rates reflect interest rate differentials\n- If USD rates are 2% higher than EUR rates, the USD/EUR forward rate will be priced 2% weaker (dollar expected to depreciate slightly in forward markets)\n- This is **covered** IRP — it holds by arbitrage in forward markets. **Uncovered** IRP (no hedging) often fails in practice, creating the carry opportunity",
          highlight: [
            "current account deficit",
            "purchasing power parity",
            "PPP",
            "overvalued",
            "undervalued",
            "interest rate parity",
            "Big Mac Index",
            "mean reversion",
          ],
        },
        {
          type: "teach",
          title: "EM FX: Additional Risk Layers",
          content:
            "Trading emerging market currencies adds complexity beyond standard developed-market FX analysis:\n\n**Political Risk**: Government instability, sudden policy changes (capital controls, currency pegs removed, debt defaults) can cause catastrophic overnight moves. The Turkish lira lost 30%+ of its value in a single month in 2021 after the president fired the central bank governor for refusing to cut rates.\n\n**Reserve Adequacy**: The ratio of a country's foreign exchange reserves to its imports and short-term debt obligations. A country with thin reserves cannot defend its currency against speculative attacks for long. Low reserves + large current account deficit = vulnerable to a **balance of payments crisis**.\n\n**Dollarization Risk**: Many EM corporates borrow in USD but earn in local currency. When the local currency devalues, the USD debt burden in local terms explodes — triggering corporate defaults and a negative economic spiral. This is the 'original sin' problem in EM finance.\n\n**Contagion**: EM currencies often move together in risk-off episodes. Even a well-run EM economy can see its currency crushed because investors sell all EM exposure indiscriminately when fear rises (e.g., the 2013 'Taper Tantrum' — when the Fed signaled tapering QE, money flooded out of all EM simultaneously).\n\n**Rule of thumb**: An EM country with high inflation and low real interest rates (negative real rates) will almost always see persistent currency depreciation. The currency must depreciate to compensate for the loss of purchasing power.",
          highlight: [
            "political risk",
            "reserve adequacy",
            "dollarization",
            "balance of payments",
            "Taper Tantrum",
            "contagion",
            "capital controls",
            "real interest rates",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Country X has annual inflation of 8% while its central bank sets the policy interest rate at only 2%, resulting in a real interest rate of -6%. The country also runs a current account deficit equal to 5% of GDP and has foreign exchange reserves covering only 2 months of imports.",
          question:
            "Based on macro FX fundamentals, what is the most likely outcome for Country X's currency?",
          options: [
            "Persistent depreciation — negative real rates, current account deficit, and thin reserves all point to sustained currency weakness",
            "Appreciation — high inflation signals a strong economy with robust consumer demand",
            "Stability — the current account deficit is offset by the inflation-driven domestic growth",
            "Short-term depreciation but quick recovery — the central bank can easily raise rates to defend the currency",
          ],
          correctIndex: 0,
          explanation:
            "All three macro indicators point to currency weakness. First, real interest rates of -6% mean investors earn a negative real return by holding Country X's currency-denominated assets — rational investors will move capital to countries offering positive real returns. Second, the current account deficit of 5% of GDP means the country is a net importer of capital; it must attract foreign investment or run down reserves to balance payments. Third, reserves covering only 2 months of imports (the standard warning threshold is 3+ months) mean the central bank has very limited ability to defend the currency through intervention. Together, these factors create strong downward pressure. The central bank would need to dramatically raise rates (accepting a severe recession) to attract capital and defend the currency — and even then, with thin reserves and political will often lacking, a sharp depreciation is the typical outcome.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "According to Uncovered Interest Rate Parity, investing in a currency with higher interest rates will always generate higher total returns than investing in a low-rate currency, after accounting for exchange rate movements.",
          correct: false,
          explanation:
            "False. Uncovered Interest Rate Parity (UIP) theoretically predicts that the higher-yielding currency should depreciate by an amount exactly equal to the interest rate differential, leaving the total return equal across currencies. In this theoretical framework, there is no free lunch from carry trades. In practice, UIP fails empirically — currencies do not depreciate to offset rate differentials as predicted, which is why carry trades generate profits on average. However, UIP is not wrong in the sense that it says higher rates 'always' beats lower rates; rather, carry trades carry substantial crash risk during risk-off episodes when the higher-rate currency can depreciate sharply, wiping out years of accumulated carry in weeks.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Commodity Macro ───────────────────────────────────────────────
    {
      id: "global-macro-strategies-4",
      title: "Commodity Macro",
      description:
        "Supply/demand frameworks, dollar-commodity correlations, oil as an economic indicator, supercycles, and agricultural macro",
      icon: "Zap",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Commodity Supply/Demand Framework",
          content:
            "Commodity markets are driven by physical supply and demand — unlike equities, a commodity has no 'intrinsic value' beyond what someone will pay to use it.\n\n**Supply factors**:\n- **Production cost**: The marginal cost of the most expensive barrel needed to meet demand sets the floor price in the long run. For oil, expensive deepwater and tar sands projects (~$60–80/bbl) set a floor — at prices below that, producers shut in production.\n- **Inventory cycles**: Low inventories → price spikes when demand picks up. High inventories → price suppressed even with strong demand. The CFTC Commitment of Traders report reveals positioning.\n- **Geopolitical disruptions**: OPEC production cuts, conflicts in oil-producing regions, export bans all create supply shocks. The 1973 Arab Oil Embargo and 2022 Russia-Ukraine war are canonical examples.\n- **Capex cycles**: Underinvestment in commodity production during low-price periods creates future supply shortfalls. Commodity companies cut exploration when prices are low, sowing the seeds of the next price spike.\n\n**Demand factors**:\n- Industrial production and manufacturing activity (PMI tracks this)\n- Seasonal patterns: Natural gas demand peaks in winter; agricultural harvest cycles affect grain prices\n- Substitution effects: High oil prices accelerate adoption of electric vehicles; high copper prices incentivize aluminum substitution\n- Emerging market industrialization: The single biggest driver of the 2000s commodity supercycle was Chinese urbanization — hundreds of millions moving from rural agriculture to urban manufacturing, requiring steel, copper, and cement on an unprecedented scale",
          highlight: [
            "marginal cost",
            "inventory cycles",
            "geopolitical disruptions",
            "capex cycles",
            "supply shock",
            "OPEC",
            "demand",
            "production cost",
          ],
        },
        {
          type: "teach",
          title: "The Dollar-Commodity Relationship & Oil as an Indicator",
          content:
            "**Dollar-Commodity Inverse Correlation**:\n\nMost commodities are priced globally in US dollars. This creates a mechanical inverse relationship:\n- **USD strengthens**: Commodities become more expensive in foreign currencies → foreign demand falls → commodity prices drop in USD terms\n- **USD weakens**: Same physical commodity becomes cheaper in foreign currencies → foreign demand rises → commodity prices rise\n\nThis correlation is not perfect (demand shocks can dominate) but the statistical relationship is strong: the correlation between the DXY dollar index and commodity indices is typically −0.5 to −0.7 over medium-term horizons.\n\n**Oil as an Economic Indicator**:\n\nOil is the single commodity most closely linked to the global economy because it underpins virtually all industrial and transportation activity.\n\n- **High oil prices (above ~$100/bbl)**: Signal strong global demand (bullish) but also cause **demand destruction** — consumers and businesses cut back on energy-intensive activity, acting as a tax on economic growth. Major recessions have often been preceded by oil price spikes (1973, 1979, 1990, 2008).\n\n- **Low oil prices (below ~$60/bbl)**: Often reflect supply glut (2014–16) or demand collapse (2020). They reduce input costs broadly — good for consumers and energy-intensive manufacturers — but signal weak global growth or technological disruption (shale boom).\n\n- **Oil and inflation**: A $10/bbl increase in oil prices adds approximately 0.2–0.4% to headline CPI in developed markets, through direct energy costs and transportation/logistics second-round effects.",
          highlight: [
            "dollar-commodity",
            "DXY",
            "demand destruction",
            "inverse correlation",
            "oil prices",
            "supply glut",
            "headline CPI",
          ],
        },
        {
          type: "teach",
          title: "Commodity Supercycles and Agricultural Macro",
          content:
            "**Commodity Supercycles** are decade-long periods of sustained above-trend commodity prices driven by structural shifts in supply and demand.\n\n**Historical supercycles**:\n- **1900s–1910s**: US industrialization and electrification driving copper and coal demand\n- **1970s**: OPEC oil embargo, global stagflation, commodity-as-inflation-hedge demand\n- **2000s–2011**: China's explosive urbanization — 2000–2010, China's steel production quadrupled, copper demand tripled, and iron ore imports grew tenfold\n- **Current (2020s?)**: The green energy transition may be creating a new supercycle in 'transition metals' — lithium (EV batteries), copper (electric wiring, solar panels need 5× more copper per MW than fossil fuels), nickel (battery cathodes), cobalt, and rare earth elements\n\n**Agricultural Macro**:\n- Weather patterns dominate short-term: droughts, floods, early frosts crush yields and spike prices\n- **La Niña** (cooler Pacific Ocean temperatures): tends to reduce rainfall in South America (drought in corn/soybean regions of Brazil and Argentina) and Australia, often bullish for grain prices\n- **El Niño** (warmer Pacific): tends to bring drought to Southeast Asia (bullish for palm oil), reduce wheat yields in Australia, but can improve South American yields\n- Long-term: Population growth (especially in the developing world) drives persistent demand growth. Arable land per capita is declining globally.",
          highlight: [
            "supercycle",
            "China",
            "green energy transition",
            "lithium",
            "copper",
            "La Niña",
            "El Niño",
            "transition metals",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "The US dollar (DXY index) depreciates 10% against a basket of currencies over six months. Simultaneously, global manufacturing PMIs rise from 48 to 55, signaling an acceleration in global industrial activity. Supply of copper has not changed significantly — production has been steady with no major disruptions.",
          question:
            "Based on macro commodity analysis, what is the most likely directional move in copper prices?",
          options: [
            "Copper prices rise significantly — both USD weakness (makes copper cheaper in local currencies, stimulating demand) and stronger global industrial activity directly increase copper demand",
            "Copper prices fall — a weaker dollar reduces US import demand for commodities",
            "Copper prices are unchanged — supply and demand are in balance so macro factors are irrelevant",
            "Copper prices fall — rising PMIs signal overproduction and inventory buildup",
          ],
          correctIndex: 0,
          explanation:
            "Two powerful tailwinds align for copper: First, the inverse dollar-commodity relationship means a 10% weaker dollar makes copper cheaper for buyers using non-USD currencies — this directly stimulates demand from industrial buyers in Europe, Asia, and emerging markets. Second, PMIs rising from 48 (contraction) to 55 (solid expansion) is a strong leading indicator of increased industrial activity — manufacturing expansion drives direct demand for copper in wiring, machinery, and construction. Copper is often called 'Dr. Copper' because its price is seen as a reliable indicator of economic health — it is used pervasively across the economy. When global growth accelerates and the dollar weakens simultaneously, it is one of the most reliably bullish environments for base metals.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Which of the following best describes a commodity supercycle?",
          options: [
            "A decade-long period of sustained above-trend commodity prices driven by a major structural shift in global supply or demand",
            "A seasonal pattern where commodity prices rise in summer and fall in winter each year",
            "A trading strategy that buys commodities when the dollar weakens and sells when it strengthens",
            "A government policy of strategic commodity stockpiling to manage price volatility",
          ],
          correctIndex: 0,
          explanation:
            "A commodity supercycle is a prolonged, multi-year (often decade-long) period of sustained above-trend commodity prices, caused by a major structural shift — typically a surge in demand from an industrializing economy (like China in the 2000s) or a structural supply constraint, combined with the long lead times needed to bring new production online. Because it takes 5–10 years to develop a new mine or oil field, supply cannot respond quickly to demand surges, causing prices to remain elevated for years. Supercycles are distinct from seasonal patterns or short-term price swings.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 5: Thematic & Cross-Asset Macro ──────────────────────────────────
    {
      id: "global-macro-strategies-5",
      title: "Thematic & Cross-Asset Macro",
      description:
        "Regime overlays, risk-on/off dynamics, EM capital flows, demographic mega-trends, and green energy transition investing",
      icon: "Layers",
      xpReward: 95,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Regime Overlays and Risk-On / Risk-Off",
          content:
            "The most powerful macro organizing concept is the **regime**: identify the macro environment, then express it across all asset classes simultaneously.\n\n**Step 1 — Identify the regime** using the 2×2 growth/inflation matrix (Lesson 1) plus financial conditions (credit spreads, volatility).\n\n**Step 2 — Apply the regime overlay across all asset classes**:\n\n| Asset | Risk-On | Risk-Off |\n|-------|---------|----------|\n| Equities | Buy (esp. cyclicals, EM) | Sell / underweight |\n| Government bonds | Sell / short duration | Buy (flight to safety) |\n| High-yield credit | Buy (spreads tighten) | Sell (spreads widen) |\n| USD | Weak (risk-on = USD sells) | Strong (safe haven) |\n| JPY | Weak (carry unwind target) | Strong (repatriation flows) |\n| Gold | Moderate bid | Strong bid |\n| EM FX | Bid (capital inflows) | Crushed (capital outflows) |\n| Oil/Commodities | Strong (demand optimism) | Weak (demand fears) |\n\n**Risk-On** signals: Low VIX, tightening credit spreads, steepening yield curve, rising copper, EM outperformance.\n\n**Risk-Off** signals: VIX spikes, credit spreads widening, USD and JPY strengthening, gold rallying, EM equities falling, yield curve flattening or inverting.\n\nA skilled macro trader uses these correlations to build cross-asset trades that reinforce each other — e.g., in a risk-off regime, simultaneously short EM equities, buy USD/JPY puts (own JPY), own gold, and buy long-duration Treasuries.",
          highlight: [
            "regime overlay",
            "risk-on",
            "risk-off",
            "VIX",
            "credit spreads",
            "cross-asset",
            "safe haven",
            "JPY",
          ],
        },
        {
          type: "teach",
          title: "Capital Flows: EM Inflows and Outflows",
          content:
            "**Capital flows** are the bloodstream of global macro markets — understanding where money is moving determines which markets rise and fall.\n\n**EM (Emerging Market) Capital Flow Drivers**:\n\n1. **US Interest Rates**: When the Fed raises rates, US assets offer higher risk-free returns → capital flows back from EM to the US. EM currencies weaken, EM equities fall, EM bonds sell off. The 2013 'Taper Tantrum' (Fed signaling tapering of QE) and 2022 Fed hiking cycle are textbook examples.\n\n2. **The Dollar**: Strong dollar makes USD-denominated EM debt more expensive to service and repay → EM stress. Weak dollar enables EM governments and corporates to service dollar debt more easily → EM rally.\n\n3. **Commodity Prices**: Many EM countries are commodity exporters (Brazil = soybeans/iron ore, Russia = oil/gas, South Africa = metals). Rising commodity prices improve their current accounts and fiscal balances, attracting capital inflows.\n\n4. **Global Risk Appetite (VIX)**: EM assets are perceived as risky → they receive inflows in risk-on environments and suffer outflows in risk-off episodes, regardless of their domestic fundamentals.\n\n**The EM Virtuous/Vicious Cycle**:\n- Inflows → currency appreciates → lower inflation → central bank can cut rates → growth accelerates → more inflows\n- Outflows → currency depreciates → higher import prices → inflation rises → central bank must hike (or not — but then currency falls further) → growth slows → more outflows\n\nMacro traders monitor the Institute of International Finance (IIF) EM capital flow tracker and EPFR fund flow data as real-time indicators.",
          highlight: [
            "capital flows",
            "EM",
            "Taper Tantrum",
            "Fed",
            "dollar",
            "VIX",
            "virtuous cycle",
            "vicious cycle",
          ],
        },
        {
          type: "teach",
          title: "Demographic Mega-Trends and the Green Transition",
          content:
            "The most patient macro trades are driven by **structural demographics** — slow-moving but enormously powerful forces:\n\n**Japan — Aging Society (Bonds)**:\n- Japan's population is shrinking and aging faster than any other major economy\n- Aging populations save more (funding pension obligations) → persistent demand for bonds → structurally low yields despite massive government debt\n- Japanese pension funds and insurance companies are among the world's largest bond buyers — they structurally anchor global long-end yields\n\n**India — Young Population (Equities)**:\n- India has the world's largest young working-age population — median age ~28 vs Japan's 48\n- Rising incomes, urbanization, and a growing middle class drive decades of consumer spending and corporate earnings growth\n- Macro thesis: long Indian equities, long Indian consumer discretionary, long infrastructure plays\n\n**US Baby Boomers (Healthcare/Income)**:\n- 76 million boomers are retiring, requiring income and healthcare spending\n- Structural tailwind for healthcare companies, dividend-paying stocks, senior living REITs\n- Simultaneously, retiring workers reduce labor supply — structurally inflationary for wages\n\n**Green Energy Transition**:\n- Solar, wind, and EVs require dramatically more copper, lithium, nickel, and cobalt per unit of energy than fossil fuel systems\n- 1 MW of solar capacity requires ~5× more copper than 1 MW of gas power\n- The IEA estimates transition to net-zero requires quadrupling of critical mineral production by 2040\n- Macro trade: long transition metals (lithium, copper, nickel), long renewable energy infrastructure, potentially short thermal coal long-term\n- Counterpoint: short-term, fossil fuels remain dominant and energy security concerns have revived investment in LNG and nuclear",
          highlight: [
            "demographics",
            "Japan",
            "India",
            "aging",
            "green transition",
            "lithium",
            "copper",
            "baby boomers",
            "renewable energy",
          ],
        },
        {
          type: "quiz-scenario",
          scenario:
            "Leading indicators are flashing recession: the yield curve has been inverted for 9 months, PMI has dropped to 44, credit spreads on high-yield bonds have widened by 300 basis points, and the VIX has spiked to 38. The central bank has begun emergency rate cuts. A macro fund manager needs to construct a defensive portfolio across multiple asset classes.",
          question:
            "Which cross-asset portfolio combination best reflects a recession/risk-off macro regime?",
          options: [
            "Long long-duration government bonds + long USD and JPY + long gold + underweight equities (overweight defensive sectors if any equity held) + reduce EM and high-yield exposure",
            "Long commodities and EM equities + short government bonds + overweight cyclical equities like materials and energy",
            "Long high-yield corporate bonds + long EM currencies + long equities broadly (recession is already priced in)",
            "Long tech growth stocks + long commodities + short gold (inflation trade)",
          ],
          correctIndex: 0,
          explanation:
            "A recession/risk-off regime calls for a defensive cross-asset posture. Long-duration government bonds benefit from falling rates as the central bank cuts aggressively — this is the classic flight-to-safety trade. USD and JPY both strengthen in risk-off environments: USD as the global reserve currency and safe haven, JPY because of massive repatriation of Japanese overseas investment. Gold rallies on falling real yields (the central bank is cutting) and uncertainty. Equities should be underweighted, with any equity exposure concentrated in defensive sectors (utilities, staples, healthcare) rather than cyclicals (materials, energy, consumer discretionary). High-yield bonds are among the worst risk-off assets — credit spreads widen dramatically during recessions, causing substantial price losses. EM is similarly hurt by dollar strength, capital outflows, and weak commodity demand.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "Rising US interest rates are generally positive for emerging market currencies because higher US rates signal a strong US economy, which increases demand for EM exports.",
          correct: false,
          explanation:
            "False. Rising US interest rates are generally negative for emerging market currencies, not positive. While a strong US economy does increase demand for global goods (including EM exports), the dominant channel is capital flows: higher US rates make dollar-denominated assets more attractive, causing capital to flow from EM markets back to the US. This creates selling pressure on EM currencies as investors repatriate funds. Additionally, most EM countries have significant USD-denominated debt — higher US rates make this debt more expensive to service and refinance. The 'Taper Tantrum' of 2013 and the 2022 Fed hiking cycle both demonstrated this dynamic clearly, with EM currencies broadly weakening as US rates rose, despite the US economy being robust.",
          difficulty: 2,
        },
      ],
    },
  ],
};
