import type { Unit } from "./types";

export const UNIT_GLOBAL_TRADE: Unit = {
 id: "global-trade",
 title: "Global Trade & Supply Chain Finance",
 description:
 "Explore international trade theory, policy, global value chains, balance of payments, trade finance instruments, and the investment implications of deglobalization",
 icon: "Globe",
 color: "#0ea5e9",
 lessons: [
 // Lesson 1: Trade Theory 
 {
 id: "gt-1",
 title: "Trade Theory & Comparative Advantage",
 description:
 "Understand Ricardo's comparative advantage, Heckscher-Ohlin factor endowments, new trade theory economies of scale, and the gravity model",
 icon: "BookOpen",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Ricardo's Comparative Advantage",
 content:
 "**Comparative advantage** is the cornerstone of trade theory, articulated by David Ricardo in 1817. A country has a comparative advantage in a good if it can produce it at a lower **opportunity cost** than its trading partner — even if the partner is absolutely more efficient at everything.\n\n**Classic example — England vs Portugal:**\n- England: 100 hours for cloth, 120 hours for wine\n- Portugal: 90 hours for cloth, 80 hours for wine\n\nPortugal is absolutely better at both. But the opportunity cost of cloth in Portugal is 80/90 = 0.89 units of wine vs 120/100 = 1.2 units for England. Portugal specializes in wine; England specializes in cloth. **Both gain from trade.**\n\n**Key insights:**\n- Trade benefits both parties even when one is less productive overall\n- Specialization raises global output beyond what autarky (no trade) could achieve\n- The gains come from reallocation of resources to highest relative efficiency\n\n**Limitations:**\n- Assumes full employment (resources instantly redeploy)\n- Ignores adjustment costs for displaced workers\n- Static model — doesn't capture learning-by-doing or infant industry dynamics",
 highlight: ["comparative advantage", "opportunity cost", "specialization", "autarky"],
 },
 {
 type: "teach",
 title: "Heckscher-Ohlin & Factor Endowments",
 content:
 "The **Heckscher-Ohlin (H-O) model** extends Ricardo by explaining *why* countries have comparative advantages: they differ in factor endowments.\n\n**Core proposition:** Countries export goods that intensively use their abundant factors and import goods that intensively use their scarce factors.\n\n**Examples:**\n- Labor-abundant countries (Bangladesh, Vietnam) export labor-intensive goods (textiles, assembly)\n- Capital-abundant countries (USA, Germany) export capital-intensive goods (machinery, aircraft)\n- Land-abundant countries (Australia, Brazil) export land-intensive goods (grain, beef)\n\n**The Leontief Paradox:** In 1953 Wassily Leontief found that U.S. exports were more labor-intensive than imports — contradicting H-O. This sparked decades of research into human capital, technology gaps, and product differentiation.\n\n**Stolper-Samuelson theorem (key policy implication):** Trade harms the owners of the scarce factor. Opening a labor-scarce country to trade from labor-abundant countries reduces real wages for domestic workers — the theoretical basis for why globalization creates winners and losers within nations.",
 highlight: ["Heckscher-Ohlin", "factor endowments", "Leontief Paradox", "Stolper-Samuelson"],
 },
 {
 type: "teach",
 title: "New Trade Theory & the Gravity Model",
 content:
 "**New Trade Theory** (Paul Krugman, 1979 Nobel) explains trade patterns that H-O cannot:\n\n**Economies of scale** drive specialization independently of factor endowments. Countries specialize in differentiated products to achieve scale; consumers value variety; intra-industry trade (Germany and Japan both export and import cars) dominates modern trade flows.\n\n**Key mechanisms:**\n- **Increasing returns:** Unit costs fall as output rises — first mover advantage matters\n- **Economies of agglomeration:** Clusters (Silicon Valley, Detroit) create self-reinforcing specialization\n- **Love of variety:** Consumers value diversity; large markets support more product variants\n\n**The Gravity Model** — the workhorse empirical model of trade:\n\nTrade(i,j) = A × (GDP_i × GDP_j) / Distance(i,j)^n\n\n- Larger economies trade more with each other (mass)\n- Closer economies trade more (distance raises transport and information costs)\n- Empirically, a 1% rise in distance cuts trade by ~1%\n- Common language, colonial history, and currency unions all act as gravity multipliers\n- The gravity model explains ~80% of observed bilateral trade flows",
 highlight: ["new trade theory", "economies of scale", "gravity model", "intra-industry trade", "agglomeration"],
 },
 {
 type: "quiz-mc",
 question:
 "Country A can produce 1 unit of steel using 4 labor hours, and 1 unit of wheat using 2 labor hours. Country B can produce 1 unit of steel using 6 labor hours, and 1 unit of wheat using 4 labor hours. Which country has a comparative advantage in steel?",
 options: [
 "Country A — its opportunity cost of steel (2 wheat) is lower than Country B's opportunity cost of steel (1.5 wheat)",
 "Country B — it has an absolute disadvantage in everything, so it must specialize in steel",
 "Country A — its opportunity cost of steel (2 wheat) is higher than Country B's (1.5 wheat), meaning B is relatively better at steel",
 "Neither — both countries should produce both goods and not specialize",
 ],
 correctIndex: 2,
 explanation:
 "Comparative advantage is about opportunity costs. Country A's opportunity cost of 1 unit of steel = 4/2 = 2 units of wheat forgone. Country B's opportunity cost of 1 unit of steel = 6/4 = 1.5 units of wheat forgone. Country B gives up fewer units of wheat per unit of steel, so Country B has the comparative advantage in steel. Country A should specialize in wheat (its opportunity cost is 0.5 steel vs B's 0.67 steel).",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "According to the Stolper-Samuelson theorem, free trade unambiguously benefits all workers in every trading country.",
 correct: false,
 explanation:
 "False. Stolper-Samuelson shows that while trade increases aggregate welfare, it redistributes income within countries. Owners of the scarce factor (e.g., low-skilled workers in capital-abundant developed nations) lose in real terms as wages are pushed toward global levels. This is a key reason why globalization faces political backlash even when it increases overall GDP — the gains and losses are unequally distributed.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A researcher finds that bilateral trade between Germany and France is 8× higher than between Germany and Brazil, despite Brazil having a larger GDP than France. The distance from Germany to France is ~1,000 km; distance to Brazil is ~9,500 km.",
 question: "Which factor of the gravity model most directly explains this observation?",
 options: [
 "Distance — the gravity model predicts trade falls with distance; ~9.5× greater distance roughly accounts for the trade gap after controlling for GDP",
 "Factor endowments — Germany and France both have high capital endowments, so H-O predicts they should trade more",
 "Comparative advantage — Germany has comparative advantage in goods France needs, but not goods Brazil needs",
 "Economies of scale — German and French firms achieve scale only within Europe",
 ],
 correctIndex: 0,
 explanation:
 "The gravity model predicts Trade GDP / Distance^n. With an elasticity of ~1 for distance, 9.5× greater distance alone would reduce trade by roughly 9.5×. Additional factors like common currency (EUR), EU single market, shared language proximity, and lower transaction costs further amplify EU-internal trade. Brazil's larger GDP is partially offset by distance. The gravity model's distance coefficient is one of the most robust findings in international economics.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Trade Policy 
 {
 id: "gt-2",
 title: "Trade Policy: Tariffs, Quotas & Trade Wars",
 description:
 "Analyze tariff types, quotas, subsidies, anti-dumping measures, WTO dispute resolution, and the economics of trade wars",
 icon: "Shield",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Tariffs: Specific vs Ad Valorem",
 content:
 "A **tariff** is a tax levied on imported goods. Tariffs are the most common trade policy tool and have two main forms:\n\n**Specific tariff:** A fixed dollar amount per unit regardless of price.\n- Example: $50 per imported car, regardless of whether the car costs $10,000 or $80,000\n- Effect: Raises price by the same absolute amount for all quality tiers\n- Disadvantage: Inflation erodes its protective effect over time\n\n**Ad valorem tariff:** A percentage of the goods' value.\n- Example: 25% tariff on Chinese steel imports\n- Effect: Raises price proportionally — more expensive goods attract higher absolute tariffs\n- Most common in modern trade policy\n\n**Compound tariff:** A combination (e.g., $2/unit + 5%)\n\n**Economic effects of tariffs:**\n- Domestic producers gain (higher prices, increased production)\n- Domestic consumers lose (pay higher prices, reduced quantity)\n- Government collects tariff revenue\n- Net welfare loss: **Deadweight loss** = efficiency triangle of transactions that no longer occur\n- Optimal tariff theory: A large country can actually improve its terms of trade via tariffs — but risks retaliation\n\n**Terms-of-trade effect:** If a country is large enough to affect world prices, its tariff forces foreign exporters to lower their prices — shifting the burden partially onto the exporter. Small countries capture no such benefit.",
 highlight: ["specific tariff", "ad valorem tariff", "deadweight loss", "terms-of-trade effect"],
 },
 {
 type: "teach",
 title: "Quotas, Subsidies & Anti-Dumping",
 content:
 "**Import quotas** restrict the volume of imports directly, unlike tariffs which restrict via price.\n\n**Quota rent:** Under a quota, the scarcity premium (equivalent to tariff revenue) goes to quota license holders — domestic importers, foreign exporters, or the government (if licenses auctioned). This is a key difference from tariffs where government retains revenue.\n\n**Tariff-Rate Quotas (TRQs):** Hybrid instrument — low tariff for within-quota imports, high tariff for above-quota imports. Common in agriculture (EU sugar, US beef).\n\n**Export subsidies:** Government payments to domestic producers to lower export prices.\n- Distorts trade by giving exporters an artificial cost advantage\n- Banned for manufactured goods under WTO; restricted for agriculture\n- EU Common Agricultural Policy historically cost ~$50B/year in export subsidies\n\n**Dumping:** Exporting goods below cost or below domestic price.\n- **Predatory dumping:** Below cost to drive out foreign competitors, then raise prices\n- **Persistent dumping:** Chronic below-market pricing to maintain market share\n\n**Anti-dumping duties (ADD):** WTO permits countervailing duties if dumping causes material injury to domestic industry.\n- Process: domestic industry files petition investigation provisional/final duties\n- Critics: often used as disguised protectionism; process is vulnerable to political pressure\n- US, EU, India are the most active ADD users",
 highlight: ["import quota", "quota rent", "tariff-rate quota", "dumping", "anti-dumping duties"],
 },
 {
 type: "teach",
 title: "WTO Dispute Resolution & Trade Wars",
 content:
 "The **World Trade Organization (WTO)** provides the multilateral framework for trade rules and dispute settlement, covering 164 member countries and ~98% of world trade.\n\n**WTO dispute settlement process:**\n1. **Consultations** (60 days) — parties negotiate bilaterally\n2. **Panel establishment** — 3-person panel reviews the case (~1 year)\n3. **Appellate Body review** — further appeal (~3 months)\n4. **Implementation or retaliation** — losing party must comply or face authorized countermeasures\n\n**The Appellate Body crisis:** Since 2019, the U.S. blocked appointments to the Appellate Body (citing 'judicial overreach'), effectively paralyzing the appeals process. This leaves the WTO dispute system with no final arbiter.\n\n**Trade war dynamics — US-China 2018–2020:**\n- U.S. imposed 25% tariffs on $250B of Chinese goods (citing Section 301 IP violations)\n- China retaliated with tariffs on $110B of U.S. goods (targeting soy, pork, cars)\n- Phase One deal (Jan 2020): China pledged $200B in additional U.S. purchases; tariffs partially reduced\n\n**Economic research findings:**\n- Most of the tariff burden fell on U.S. importers/consumers, not Chinese exporters\n- U.S. agricultural exports to China fell sharply; market share shifted to Brazil\n- Trade diversion: U.S. imports shifted to Vietnam, Mexico — not reshored to U.S.\n- Estimated U.S. welfare loss: $51B/year (Fed NY, 2019)",
 highlight: ["WTO", "dispute settlement", "Appellate Body", "trade war", "Section 301", "trade diversion"],
 },
 {
 type: "quiz-mc",
 question:
 "A government imposes an import quota instead of an equivalent tariff that would achieve the same reduction in imports. What is the key economic difference?",
 options: [
 "Under a quota, the scarcity rent goes to quota license holders rather than the government (unless licenses are auctioned), whereas a tariff generates direct government revenue",
 "A quota always reduces imports more than a tariff set at the same rate",
 "Tariffs create deadweight loss while quotas do not",
 "Quotas are always illegal under WTO rules while tariffs are permitted",
 ],
 correctIndex: 0,
 explanation:
 "The critical difference is who captures the scarcity premium. A tariff channels the revenue to the government. A quota creates scarcity that allows license holders (domestic importers or foreign exporters, depending on how licenses are allocated) to earn quota rents — the difference between world price and domestic price. If the government auctions quota licenses, the outcomes become more equivalent to a tariff. Both instruments create deadweight loss, and both are permitted under WTO (quotas more restrictively).",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Economic research on the 2018–2020 US-China trade war found that Chinese exporters bore most of the cost of U.S. tariffs through lower prices.",
 correct: false,
 explanation:
 "False. Studies by the Federal Reserve Bank of New York, NBER, and IMF consistently found that U.S. importers and consumers bore the majority of the tariff burden. Chinese export prices to the U.S. fell only modestly; U.S. import prices rose nearly dollar-for-dollar with the tariff rate. This contradicts the popular political narrative that tariffs are 'paid by China.' The optimal tariff effect requires market power that U.S. buyers largely lacked in commodity goods where alternative suppliers existed.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Global Value Chains 
 {
 id: "gt-3",
 title: "Global Value Chains: Offshoring & Reshoring",
 description:
 "Understand offshoring, nearshoring, reshoring trends, supply chain fragility from COVID, JIT vs just-in-case, and the China+1 strategy",
 icon: "Network",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Offshoring, Nearshoring & Reshoring",
 content:
 "**Global Value Chains (GVCs)** describe the full range of activities — design, production, marketing, distribution — that firms carry out across multiple countries to bring a product to market.\n\n**Offshoring:** Relocating production or services to lower-cost countries.\n- Cost drivers: labor arbitrage, tax optimization, regulatory arbitrage\n- Example: Apple designs in California, manufactures in China/Vietnam/India\n- At peak (2000s), ~70% of an iPhone's components came from non-U.S. suppliers\n\n**Nearshoring:** Moving production to geographically close countries.\n- Mexico nearshoring boom post-2020: proximity to U.S., USMCA benefits, shorter logistics\n- Eastern Europe nearshoring for EU manufacturers (Poland, Czech Republic, Romania)\n- Advantages: lower transport costs, similar time zones, faster response\n\n**Reshoring (onshoring):** Bringing production back to the home country.\n- Drivers: rising foreign wages, automation reducing labor cost advantage, geopolitical risk, pandemic lessons, government incentives (CHIPS Act, IRA)\n- Reality check: True reshoring is slow and expensive; automation makes some reshoring viable\n- Many 'reshoring' announcements are actually nearshoring or friend-shoring\n\n**Friend-shoring:** Sourcing from allied or politically aligned nations to reduce geopolitical risk.\n- Term popularized by U.S. Treasury Secretary Yellen (2022)\n- Semiconductors: TSMC fab in Arizona; Samsung in Texas",
 highlight: ["global value chains", "offshoring", "nearshoring", "reshoring", "friend-shoring"],
 },
 {
 type: "teach",
 title: "Supply Chain Fragility: COVID Lessons",
 content:
 "The COVID-19 pandemic exposed the systemic fragility of hyper-optimized global supply chains with devastating clarity.\n\n**Key failure modes revealed:**\n\n**Single-source concentration risk:**\n- 80% of global active pharmaceutical ingredients (APIs) produced in China/India\n- When Wuhan lockdowns began, global API inventories had weeks of supply\n- Result: Drug shortages in Europe and U.S. despite stable domestic demand\n\n**Semiconductor shortage (2020–2023):**\n- Auto manufacturers using JIT had zero chip inventory when demand surged\n- Chip lead times stretched to 52+ weeks (vs normal 8–16 weeks)\n- ~$210B in lost auto production globally (AlixPartners estimate)\n- Root cause: JIT works in stable conditions; fails catastrophically under demand shocks\n\n**Container shipping disruption:**\n- Empty containers stranded in wrong ports; shipping rates rose 10× (Freightos Baltic Index)\n- Evergreen ship blocking Suez Canal (March 2021): 12% of global trade paused for 6 days\n- 5–7% of global container fleet stuck in port congestion at peak (2021)\n\n**Lessons implemented:**\n1. **Dual/multi-sourcing:** Qualify backup suppliers even at higher cost\n2. **Strategic inventory buffers** for critical inputs (semiconductors, APIs, rare earths)\n3. **Supply chain mapping:** Know tier-2 and tier-3 suppliers\n4. **Geographic diversification:** Reduce single-country concentration\n5. **Digital visibility:** Real-time tracking of supply chain nodes",
 highlight: ["supply chain fragility", "single-source risk", "semiconductor shortage", "JIT failure", "multi-sourcing"],
 },
 {
 type: "teach",
 title: "Just-in-Time vs Just-in-Case & China+1",
 content:
 "**Just-in-Time (JIT)** inventory: Developed by Toyota in the 1970s. Minimize inventory; receive inputs only when needed for production.\n- **Benefits:** Eliminates holding costs (warehouse, spoilage, capital tied up); forces quality improvement\n- **Critical weakness:** Zero buffer against supply disruption\n\n**Just-in-Case (JIC)** inventory: Hold strategic safety stock for critical components.\n- Higher carrying costs (~20–30% of inventory value annually: storage + insurance + obsolescence + capital)\n- Provides resilience buffer — weeks or months of production continuity\n- Optimal for high-criticality, low-substitutability inputs (semiconductors, rare earths, APIs)\n\n**The JIT-to-JIC transition:**\n- Pre-2020: JIT was near-universal best practice\n- Post-2020: Major companies (GM, Ford, Toyota, TSMC) announced JIC policies for critical components\n- **Net effect:** Global inventory buffers increased; working capital requirements rose; supply chain costs up ~5–15%\n\n**China+1 strategy:** Maintain China operations but add a second country as backup/diversification.\n- **Vietnam:** Electronics assembly (Samsung, Intel, Foxconn); 17% of Vietnam's GDP is electronics exports\n- **India:** Apple shifted ~14% of iPhone production by 2024; pharmaceuticals; IT services\n- **Mexico:** Autos, aerospace, electronics nearshoring to U.S. (USMCA benefits)\n- **Indonesia/Thailand/Malaysia:** Semiconductors, EVs, chemical supply chains\n\n**Key trade-off:** China+1 raises costs 10–30% but dramatically reduces geopolitical concentration risk.",
 highlight: ["just-in-time", "just-in-case", "safety stock", "China+1", "Vietnam", "supply chain diversification"],
 },
 {
 type: "quiz-mc",
 question:
 "A pharmaceutical company sources 85% of its active pharmaceutical ingredients from a single Chinese province. Which supply chain risk mitigation strategy most directly addresses this vulnerability?",
 options: [
 "Dual-sourcing from qualified suppliers in at least two geographically separate countries, even at a cost premium",
 "Implementing just-in-time inventory to reduce holding costs and improve cash flow",
 "Using financial derivatives to hedge against supply chain disruption costs",
 "Renegotiating the existing contract with the Chinese supplier to include force majeure penalties",
 ],
 correctIndex: 0,
 explanation:
 "The core vulnerability is geographic concentration — 85% from one province. JIT would make this worse (no buffer). Financial hedging can offset revenue loss but not production continuity. Contract penalties don't solve the physical inability to supply during a lockdown or natural disaster. Dual/multi-sourcing from geographically separate suppliers is the direct structural fix. Most pharmaceutical companies now target no more than 60% single-source concentration for critical APIs, with qualified backup suppliers in different regions.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The China+1 strategy typically achieves the same production costs as a pure China strategy, with the additional country primarily serving as a risk management buffer.",
 correct: false,
 explanation:
 "False. China+1 generally raises costs by 10–30% due to higher labor costs in alternative locations, smaller scale (losing some agglomeration and supplier ecosystem benefits), higher logistics and coordination costs, and transition/qualification costs. Vietnam, India, and Mexico all have lower per-unit labor costs than coastal China now, but China's manufacturing ecosystem depth (supplier density, skilled workforce, infrastructure) takes decades to replicate. Companies accept the cost premium as an insurance premium against geopolitical and concentration risk.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Balance of Payments 
 {
 id: "gt-4",
 title: "Balance of Payments & Reserve Currencies",
 description:
 "Master current account vs capital account, twin deficits, reserve currency dynamics, and the Triffin dilemma",
 icon: "Scale",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Current Account vs Capital Account",
 content:
 "The **Balance of Payments (BoP)** records all economic transactions between a country's residents and the rest of the world over a period. It always sums to zero — every transaction has two sides.\n\n**Current Account (CA):** Transactions involving goods, services, income, and transfers.\n- **Trade balance:** Exports minus imports of goods (merchandise trade)\n- **Services balance:** Tourism, financial services, IP royalties, consulting\n- **Primary income:** Investment income (dividends, interest) received minus paid\n- **Secondary income:** Transfers — remittances, foreign aid\n\nCA surplus = country earns more from foreigners than it pays out (net lender to the world)\nCA deficit = country spends more abroad than it earns (net borrower from the world)\n\n**Capital & Financial Account:** Records cross-border ownership changes.\n- **Direct investment (FDI):** Building factories, acquiring companies\n- **Portfolio investment:** Buying foreign stocks, bonds\n- **Other investment:** Bank loans, trade credit\n- **Reserve assets:** Official central bank foreign currency holdings\n\n**The accounting identity:** CA + Capital Account = 0\n- A CA deficit must be financed by capital inflows (foreigners buying domestic assets)\n- A CA surplus means the country accumulates foreign assets\n\n**Example — U.S. 2023:**\n- CA deficit: -$905B (goods deficit -$1.06T, services surplus +$271B)\n- Financed by: Foreign buying of U.S. Treasuries, equities, and FDI inflows",
 highlight: ["balance of payments", "current account", "capital account", "trade balance", "FDI"],
 },
 {
 type: "teach",
 title: "Twin Deficits & Macroeconomic Identities",
 content:
 "The **twin deficits hypothesis** posits that a government's fiscal deficit and a nation's current account deficit tend to move together.\n\n**National income accounting identity:**\nCA = (S_private - I) + (T - G)\n\nWhere:\n- S_private = private savings\n- I = private investment\n- T - G = government budget balance (surplus or deficit)\n\n**If government deficit (T - G < 0) widens:**\n1. Government borrows more (issues bonds)\n2. Upward pressure on interest rates\n3. Attracts foreign capital inflows appreciates currency\n4. Makes exports more expensive, imports cheaper CA worsens\n\n**Historical evidence:**\n- U.S. 1980s: Reagan tax cuts + defense spending budget deficit surged; CA deficit followed\n- U.S. 2020s: COVID fiscal stimulus fiscal deficit peaked at -15% of GDP; CA deficit widened to ~-4% of GDP\n\n**Critique of twin deficits:** Not deterministic.\n- If fiscal deficit is used for productive investment can attract FDI not CA-worsening\n- Private savings behavior can offset government dissaving\n- Japan runs large fiscal deficits but maintains CA surpluses (high private savings absorb government debt domestically)\n\n**The savings-investment gap perspective:** CA deficit = Investment > Savings. The U.S. CA deficit persists partly because the U.S. is the world's most attractive investment destination — excess global capital flows in, financing domestic investment above savings.",
 highlight: ["twin deficits", "fiscal deficit", "national savings identity", "savings-investment gap"],
 },
 {
 type: "teach",
 title: "Reserve Currency Dynamics & the Triffin Dilemma",
 content:
 "A **reserve currency** is a currency held in significant quantities by foreign central banks as part of their foreign exchange reserves and used in international transactions.\n\n**Current composition of global reserves (IMF COFER, 2024 approx.):**\n- USD: ~58% of allocated reserves\n- EUR: ~20%\n- JPY: ~6%\n- GBP: ~5%\n- CNY (renminbi): ~2.3%\n- Other: ~9%\n\n**Benefits of issuing the reserve currency:**\n- **Exorbitant privilege** (term coined by French Finance Minister Valéry Giscard d'Estaing, 1965): The U.S. can borrow at lower rates since foreigners must hold dollars\n- Seigniorage: Printing currency that foreigners hold is essentially an interest-free loan to the U.S.\n- Geopolitical leverage: Dollar-denominated financial system gives U.S. sanction power (SWIFT exclusion)\n\n**The Triffin Dilemma (Robert Triffin, 1960):**\nThe reserve currency issuer faces an inherent contradiction:\n1. To supply enough reserve currency for global trade growth, the issuer must run persistent CA **deficits** (supplying dollars to the world)\n2. But persistent CA deficits eventually erode **confidence** in the currency's value\n3. This is structurally unstable — the dilemma that caused the collapse of Bretton Woods in 1971\n\n**Modern manifestation:** The U.S. must run CA deficits to supply world dollar liquidity — but those deficits accumulate as foreign debt and weaken long-run dollar credibility. A solution (SDRs, digital reserve currency) has been proposed but not implemented.",
 highlight: ["reserve currency", "exorbitant privilege", "Triffin dilemma", "Bretton Woods", "seigniorage", "SWIFT"],
 },
 {
 type: "quiz-mc",
 question:
 "Country X has a large current account surplus. According to balance of payments accounting, what must simultaneously be true?",
 options: [
 "Country X must have a capital account deficit of equal size — it is accumulating net foreign assets (lending to the world)",
 "Country X must have high inflation, since its goods are priced out of global markets",
 "Country X's government must be running a fiscal surplus of equal size to the current account surplus",
 "Country X must be importing more capital goods than it exports, which automatically balances the accounts",
 ],
 correctIndex: 0,
 explanation:
 "The BoP identity requires CA + Financial Account = 0 (ignoring statistical discrepancy). A CA surplus means the country earns more from foreigners than it spends — it must therefore be accumulating net foreign assets (lending to the world) via capital outflows, which shows as a financial account deficit. China's massive CA surpluses in the 2000s were mirrored by accumulation of foreign exchange reserves (primarily U.S. Treasuries) — China lending to the world. The fiscal position can be entirely separate (Japan has fiscal deficits and CA surpluses).",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "The Triffin dilemma implies that any country issuing the global reserve currency will inevitably experience a current account surplus as the world demands its currency.",
 correct: false,
 explanation:
 "False — it is the opposite. The reserve currency issuer must run current account deficits to supply the world with its currency. The rest of the world accumulates dollars (or pounds under the gold standard) by running surpluses against the U.S., which means the U.S. necessarily runs deficits. Triffin's insight was that this creates an inherent contradiction: the deficits needed to supply reserve currency gradually undermine confidence in that currency's value, threatening the entire system. This tension destroyed Bretton Woods and remains unresolved today.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Trade Finance 
 {
 id: "gt-5",
 title: "Trade Finance: Letters of Credit & Export Tools",
 description:
 "Master letters of credit, documentary collections, export credit agencies, EXIM bank, and trade credit insurance",
 icon: "FileText",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Letter of Credit: How It Works",
 content:
 "A **Letter of Credit (LC)** is the most widely used trade finance instrument globally (~$2.8 trillion annually). It is a bank guarantee that payment will be made to an exporter upon presentation of specified documents proving shipment.\n\n**The four parties:**\n1. **Applicant (buyer/importer):** Requests the LC from their bank; provides collateral or credit line\n2. **Issuing bank:** Buyer's bank; issues the LC and bears the payment obligation\n3. **Beneficiary (seller/exporter):** The party who will receive payment\n4. **Advising/confirming bank:** Seller's bank; advises or confirms the LC\n\n**Standard LC flow:**\n1. Buyer and seller agree on terms; buyer applies for LC at their bank\n2. Issuing bank sends LC to advising bank in seller's country\n3. Seller ships goods; collects required documents (Bill of Lading, commercial invoice, packing list, certificate of origin, inspection certificate)\n4. Seller presents documents to advising bank within the LC's validity period\n5. Bank checks documents comply with LC terms (zero tolerance — strict compliance rule)\n6. If compliant: payment made; documents forwarded to issuing bank\n7. Issuing bank debits buyer's account; releases documents to buyer to claim goods\n\n**Types of LCs:**\n- **Revocable:** Can be changed by buyer — rarely used (seller has no protection)\n- **Irrevocable:** Cannot be changed without all parties' consent — the standard\n- **Confirmed:** Advising bank adds its own payment guarantee — used for high-risk countries\n- **Standby LC:** Used as a performance guarantee, not as primary payment mechanism",
 highlight: ["letter of credit", "issuing bank", "beneficiary", "bill of lading", "strict compliance", "confirmed LC"],
 },
 {
 type: "teach",
 title: "Documentary Collections & Open Account Trade",
 content:
 "**Documentary Collection (DC)** is a less secure but cheaper alternative to LCs. The exporter's bank collects payment on behalf of the exporter by sending documents to the importer's bank.\n\n**Two main types:**\n\n**Documents Against Payment (D/P) — Sight Collection:**\n- Bank releases shipping documents to importer only upon immediate payment\n- Exporter retains control of goods (via Bill of Lading) until paid\n- Risk: Importer may refuse to pay, leaving exporter with goods stranded abroad\n\n**Documents Against Acceptance (D/A) — Term Collection:**\n- Bank releases documents in exchange for importer's **acceptance** of a time draft (promise to pay in 30/60/90/180 days)\n- Once accepted, this draft becomes a **trade acceptance** — a negotiable instrument\n- Higher risk for exporter: importer has goods before payment; exporter relies on importer's creditworthiness\n\n**Open Account Trade:**\n- Goods shipped and delivered before payment due (30/60/90 days net)\n- ~80% of global trade now conducted on open account (only established relationships)\n- Maximum risk for exporter; maximum convenience for importer\n- Exporters often use **trade credit insurance** to protect open account receivables\n\n**Selecting the right instrument:**\n| Instrument | Exporter Risk | Cost | Typical Use |\n|---|---|---|---|\n| LC (Confirmed) | Lowest | Highest (1–3% of value) | New relationships, emerging markets |\n| LC (Unconfirmed) | Low | Moderate | Established banks, lower-risk markets |\n| Documentary Collection | Medium | Low | Semi-established relationships |\n| Open Account | Highest | Lowest | Long-established, trusted buyers |",
 highlight: ["documentary collection", "documents against payment", "documents against acceptance", "open account", "trade acceptance"],
 },
 {
 type: "teach",
 title: "Export Credit Agencies & Trade Insurance",
 content:
 "**Export Credit Agencies (ECAs)** are government-backed institutions that support domestic exporters by providing financing, guarantees, and insurance for international transactions that the private market will not fully cover.\n\n**Major ECAs:**\n- **US EXIM Bank** (Export-Import Bank of the United States) — provides loans, guarantees, insurance for U.S. exporters\n- **UK Export Finance (UKEF)** — oldest ECA in the world (1919)\n- **Germany's Euler Hermes / KfW IPEX-Bank**\n- **China's Sinosure / China EXIM Bank** — largest by volume; key instrument of Belt and Road Initiative financing\n- **OECD Arrangement:** Governs maximum subsidized rates among developed-nation ECAs to prevent subsidy wars\n\n**ECA product types:**\n1. **Export credit guarantees/insurance:** Covers commercial (buyer default) and political risk (war, expropriation, currency inconvertibility)\n2. **Buyer credit:** Long-term loan to foreign buyer to purchase domestic goods\n3. **Supplier credit:** Financing to domestic exporter to bridge the credit gap\n\n**Trade credit insurance:**\n- Private market (Euler Hermes, Atradius, Coface control ~85% of the private market)\n- Insures accounts receivable against buyer insolvency or protracted default (typically 90+ days)\n- Premium: 0.1–0.5% of insured turnover depending on portfolio quality\n- Common trigger for bank lending: banks lend against insured receivables at tighter spreads\n\n**Belt and Road Initiative (BRI):** China's ECA-funded infrastructure push across ~140 countries. Critics cite debt trap diplomacy; proponents cite infrastructure gap filling. Sri Lanka's Hambantota Port debt-to-equity swap highlighted the risks for borrowing nations.",
 highlight: ["export credit agency", "EXIM Bank", "trade credit insurance", "buyer credit", "political risk", "Belt and Road"],
 },
 {
 type: "quiz-mc",
 question:
 "An exporter in Germany ships industrial equipment to a new buyer in Nigeria under a Documentary Collection — Documents Against Acceptance (D/A) arrangement. What is the exporter's key risk?",
 options: [
 "The Nigerian importer receives the goods upon acceptance of the time draft but may default before the payment date, leaving the exporter with an unsecured claim against a foreign company",
 "The German bank may refuse to release documents regardless of the importer's credit quality",
 "The exporter loses title to the goods permanently upon shipment under a D/A arrangement",
 "The importer can demand a price reduction after acceptance because the D/A gives them leverage",
 ],
 correctIndex: 0,
 explanation:
 "Under D/A, the importer gets possession of the goods by signing a time draft (promise to pay). Unlike D/P where payment precedes document release, D/A gives the buyer the goods before cash changes hands. The exporter is now an unsecured creditor of the Nigerian company — if the importer defaults, the exporter faces expensive cross-border legal action with uncertain recovery. This is why D/A is only appropriate for established relationships with creditworthy buyers, or where trade credit insurance is in place to cover the default risk.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A confirmed Letter of Credit provides the exporter with an additional payment guarantee from their own bank, protecting them even if the issuing bank or the buyer's country faces financial difficulties.",
 correct: true,
 explanation:
 "True. Under a confirmed LC, the advising bank (in the exporter's country) adds its own irrevocable undertaking to pay. This means the exporter has two independent payment obligations: the issuing bank (buyer's bank) and the confirming bank (their own bank). If the issuing bank fails (banking crisis in buyer's country) or the country imposes payment transfer restrictions (political risk), the confirming bank still pays. Confirmation is expensive (typically 0.5–2% additional per annum) but critical for exports to countries with weak banking systems or political instability.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 6: Investment Implications 
 {
 id: "gt-6",
 title: "Investment Implications of Trade Dynamics",
 description:
 "Analyze how trade deficits/surpluses affect markets, tariff impacts on sectors, currency devaluation strategies, and deglobalization investment themes",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Trade Deficits/Surpluses & Market Effects",
 content:
 "The **trade balance** signals deep structural forces that affect equity valuations, bond markets, and currencies.\n\n**Current Account Deficit (CAD) implications:**\n- Requires financing via capital account inflows foreign demand for domestic assets (equities, bonds, real estate)\n- Can support asset prices if inflows are portfolio investment (foreign buying of U.S. equities keeps P/E multiples elevated)\n- Risk: If inflows slow or reverse currency depreciation + asset price pressure\n- **'Exorbitant privilege' premium** in U.S. assets: foreigners accept lower yields on U.S. Treasuries as price of holding the reserve currency\n\n**Current Account Surplus (CAS) implications:**\n- Country is net saver/creditor to the world\n- Government/central bank often accumulates foreign reserves (buys foreign assets)\n- Domestic currency tends to appreciate over time (demand for exports)\n- **Recycled surpluses:** China's massive FX reserves (~$3.2T) were recycled into U.S. Treasuries suppressed U.S. long-term rates by ~50–100bps (Bernanke's 'global savings glut')\n\n**Equity market implications:**\n- Export-heavy economies (Germany, Japan, South Korea, Taiwan) benefit when global demand is strong\n- Import-heavy, consumption-driven economies (U.S., UK, Australia) benefit from cheap imports lower costs and inflation higher real incomes\n- Trade war/tariff uncertainty elevated equity risk premium P/E compression in affected sectors",
 highlight: ["current account deficit", "capital inflows", "exorbitant privilege", "global savings glut", "P/E premium"],
 },
 {
 type: "teach",
 title: "Tariff Impact on Sectors & Currency Devaluation",
 content:
 "**Tariff transmission across sectors:**\n\n**Directly protected sectors** (import-competing industries):\n- Steel, aluminum: U.S. Section 232 tariffs (25%/10%) benefit domestic steel producers (Nucor, US Steel) at consumers' expense\n- Auto: 25% tariff proposals protects Detroit assembly but raises prices for consumers and harms parts supply chains deeply integrated with Mexico/Canada\n\n**Downstream hurt sectors** (industries using tariffed inputs as raw materials):\n- Auto manufacturers pay more for steel\n- Construction pays more for lumber/aluminum\n- Electronics manufacturers pay more for components\n- These sectors see margin compression unless they can pass costs to end consumers\n\n**Currency devaluation as competitive tool:**\n- A country may intentionally weaken its currency to make exports cheaper and imports more expensive\n- **Beggar-thy-neighbor policy:** Competitive devaluations by multiple countries cancel out and destabilize the global monetary system\n- China's managed renminbi: Long accused by U.S. of artificially undervaluing CNY; Treasury formally labeled China a 'currency manipulator' in Aug 2019 (reversed Jan 2020)\n- **J-curve effect:** After devaluation, trade balance initially worsens (import bills rise in local currency) before improving (exports become more competitive) — typically 6–18 months\n\n**Investment playbook for tariff environments:**\n- Long domestic-oriented companies with minimal import exposure\n- Short export-dependent companies selling to the tariff-imposing country\n- Long logistics/customs/compliance companies (complexity creates demand)\n- Watch for trade diversion beneficiaries (Vietnam ETFs, Mexico nearshoring plays)",
 highlight: ["Section 232", "downstream sectors", "currency devaluation", "beggar-thy-neighbor", "J-curve effect", "trade diversion"],
 },
 {
 type: "teach",
 title: "Deglobalization Trends & Investment Themes",
 content:
 "After decades of deepening integration, several forces are fragmenting global trade — a structural shift with major investment implications.\n\n**Deglobalization drivers:**\n1. **Geopolitical rivalry:** U.S.-China tech decoupling (semiconductors, AI, telecom infrastructure)\n2. **Supply chain resilience:** COVID-driven shift from efficiency to redundancy\n3. **Industrial policy nationalism:** CHIPS Act ($52B U.S. semiconductor subsidies), EU Green Deal industrial subsidies, India's PLI schemes\n4. **Energy transition:** Countries want domestic clean energy supply chains (solar panels, EV batteries, wind turbines)\n5. **Sanctions and export controls:** Expansion of entity lists, FDPR (Foreign Direct Product Rule) extraterritorial controls\n\n**Evidence of fragmentation:**\n- World trade/GDP ratio peaked ~2008; has flatlined or declined since\n- FDI flows increasingly concentrated within 'friendly' blocks\n- Technology supply chains bifurcating: TSMC building in U.S., Japan, Europe; Huawei excluded from 5G networks globally\n\n**Investment implications of deglobalization:**\n\n**Winners:**\n- Domestic manufacturers in re-industrializing economies\n- Infrastructure builders (factories, ports, power grids for reshoring)\n- Defense/security companies (geopolitical risk premium)\n- Diversified supply chain software/analytics (Resilinc, Coupa, FourKites)\n\n**Losers:**\n- Hyper-globalized logistics intermediaries dependent on high cross-border volume\n- Companies with concentrated supply chains in geopolitically exposed regions\n- Emerging market exporters dependent on developed-world FDI and market access\n\n**Portfolio implication:** Consider holding exposure to reshoring beneficiaries (industrial REITs, domestic manufacturers, capex-heavy industrials) as a structural deglobalization hedge.",
 highlight: ["deglobalization", "industrial policy", "CHIPS Act", "tech decoupling", "reshoring beneficiaries", "fragmentation"],
 },
 {
 type: "quiz-mc",
 question:
 "The U.S. government imposes a 25% tariff on imported washing machines. Which of the following describes the most likely full chain of effects?",
 options: [
 "Domestic washing machine producers gain margin; consumers pay higher prices; downstream service businesses (repairers) face mixed effects; foreign producers lose U.S. market share; trade partners may retaliate on other U.S. exports",
 "Domestic producers gain margin; consumers pay the same price since tariffs are paid by foreign exporters; no retaliation risk since WTO allows unilateral tariffs",
 "The tariff lowers domestic prices by reducing import competition and forcing foreign firms to lower their prices to maintain volume",
 "The tariff creates no deadweight loss since domestic production expands to exactly replace imports",
 ],
 correctIndex: 0,
 explanation:
 "The 2018 U.S. washing machine tariff (studied extensively by economists) showed: Whirlpool's stock surged initially; U.S. consumer prices for washing machines rose ~12%; LG and Samsung built U.S. factories to avoid tariffs (jobs created, but at high cost per job: ~$815,000/job per University of Chicago research); South Korea and EU filed WTO complaints. Tariff burden fell mostly on U.S. buyers. This is the standard general equilibrium result: producers gain, consumers lose more, government gets revenue, net welfare loss exists.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A portfolio manager is constructing a position to benefit from accelerating deglobalization and U.S.-China tech decoupling. She is considering four investments: (A) a Vietnamese electronics manufacturer, (B) a U.S. industrial REIT focused on nearshore manufacturing facilities in the U.S. Southwest, (C) a Chinese consumer electronics exporter heavily dependent on U.S. distribution, and (D) a U.S. semiconductor equipment maker whose largest customer is TSMC's new Arizona fab.",
 question: "Which combination of investments best positions the portfolio for a deglobalization/reshoring scenario?",
 options: [
 "Long A, B, and D; short or avoid C — benefits from supply chain shifts away from China to Vietnam and U.S., plus infrastructure build-out and U.S.-allied semiconductor capex",
 "Long C and short A — Chinese companies will benefit as deglobalization raises their domestic market share and Vietnam is too small to absorb global supply chains",
 "Long B and short D — industrial real estate benefits from reshoring but semiconductor equipment spending will fall as companies reduce capex in a fragmented world",
 "Avoid all four and buy gold — deglobalization is purely deflationary and no equities benefit from it",
 ],
 correctIndex: 0,
 explanation:
 "In a deglobalization/reshoring scenario: Vietnam (A) benefits from China+1 supply chain diversification — already hosting Samsung, Intel, and Foxconn facilities. U.S. industrial REITs (B) benefit from new domestic manufacturing facilities, warehouses, and distribution centers for reshored production. Semiconductor equipment makers with TSMC Arizona exposure (D) benefit from CHIPS Act-funded fab construction. Chinese consumer electronics exporters (C) face growing tariffs, market access restrictions, and U.S. consumer brand scrutiny. This is the canonical deglobalization portfolio overlay.",
 difficulty: 3,
 },
 ],
 },
 ],
};
