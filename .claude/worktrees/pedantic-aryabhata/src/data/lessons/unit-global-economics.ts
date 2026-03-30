import type { Unit } from "./types";

export const UNIT_GLOBAL_ECONOMICS: Unit = {
 id: "global-economics",
 title: "Global Economics & Development",
 description:
 "Understand globalization, emerging market growth, inequality, international trade theory, and economic development",
 icon: "Globe2",
 color: "#14b8a6",
 lessons: [
 // Lesson 1: International Trade Theory 
 {
 id: "global-economics-1",
 title: "International Trade Theory",
 description:
 "Comparative advantage, factor endowments, new trade theory, trade policy tools, and the WTO dispute settlement system",
 icon: "Ship",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Comparative Advantage: Ricardo's Insight",
 content:
 "**David Ricardo (1817)** proved that trade benefits both parties even when one country is better at producing *everything*.\n\n**The Classic Example**:\n- Portugal can produce wine in 80 hours and cloth in 90 hours\n- England requires 120 hours for wine and 100 hours for cloth\n- Portugal has **absolute advantage** in both goods\n- But Portugal's *relative* advantage is greater in wine (80/120 vs 90/100 = 0.67 vs 0.90)\n- England's relative advantage is in cloth\n\n**Conclusion**: Portugal should specialize in wine, England in cloth. Both nations trade and *both* end up consuming more than if each produced everything domestically. Specialization raises total global output.\n\n**Opportunity Cost is the Key**: Comparative advantage is about what you give up. Portugal gives up less to produce wine (just 0.89 units of cloth per bottle vs England's 1.20). England gives up less to produce cloth (0.83 bottles of wine per yard vs Portugal's 1.13).\n\n**Modern Relevance**: Bangladesh has comparative advantage in garments; South Korea in electronics; Saudi Arabia in oil. Even if the US is more productive than Vietnam at making shoes, it makes economic sense to import shoes and deploy those workers in semiconductors or biotech — where the US's comparative advantage is even larger.",
 highlight: [
 "comparative advantage",
 "absolute advantage",
 "opportunity cost",
 "specialization",
 "Ricardo",
 ],
 },
 {
 type: "teach",
 title: "Heckscher-Ohlin and New Trade Theory",
 content:
 "**Heckscher-Ohlin (H-O) Model** extends Ricardo by explaining *why* comparative advantages arise:\n- Countries export goods that use their **abundant factors** intensively\n- Labor-abundant countries (Bangladesh, Vietnam) export **labor-intensive goods** (textiles, electronics assembly)\n- Capital-abundant countries (Germany, USA) export **capital-intensive goods** (machinery, aircraft)\n- Land-abundant countries (Australia, Canada) export **land-intensive goods** (wheat, minerals)\n\n**Stolper-Samuelson Theorem** (the distributional implication): Trade raises returns to the abundant factor and lowers returns to the scarce factor. In the US, trade with labor-abundant countries raises returns to capital but can reduce wages for low-skilled workers — explaining political opposition to globalization.\n\n**New Trade Theory** (Paul Krugman, Nobel 2008):\n- H-O cannot explain why Germany and France *both* export cars to each other\n- **Economies of scale**: firms become more efficient as they scale up; a larger global market lets them reach efficient scale\n- **First-mover advantage**: the country that industrializes first in a sector can lock in cost advantages that newcomers cannot overcome without subsidies\n- **Intra-industry trade**: rich countries with similar factor endowments trade differentiated varieties of the same goods (Boeing vs Airbus; BMW vs Mercedes)\n- Krugman's insight: government industrial policy can legitimately create comparative advantage through strategic subsidies — justifying infant industry protection in some cases",
 highlight: [
 "Heckscher-Ohlin",
 "factor endowments",
 "labor-intensive",
 "capital-intensive",
 "Stolper-Samuelson",
 "new trade theory",
 "Krugman",
 "economies of scale",
 "first-mover advantage",
 "intra-industry trade",
 ],
 },
 {
 type: "teach",
 title: "Trade Policy Tools and the WTO",
 content:
 "Governments use a toolkit of measures to manage trade flows, each with different effects:\n\n**Tariffs**: Taxes on imports. Raise the domestic price, protect domestic producers, generate government revenue. The US applied 25% tariffs on $250bn of Chinese goods from 2018; economists estimated US consumers bore ~90% of the cost through higher prices.\n\n**Quotas**: Quantity limits on imports. Similar effect to tariffs but no government revenue — the 'quota rent' accrues to whoever holds the import licenses (often foreign exporters).\n\n**Subsidies**: Government payments to domestic producers, lowering their costs and enabling them to underprice foreign competitors. The EU's Common Agricultural Policy and US farm subsidies are major examples — criticized for harming developing-country farmers.\n\n**Antidumping Duties**: Tariffs imposed when foreign firms sell below cost or home-market price to gain market share. The US has hundreds of antidumping orders against Chinese steel, solar panels, and other goods.\n\n**World Trade Organization (WTO)**:\n- 164 member nations; founded 1995 to administer trade rules\n- **Dispute Settlement Mechanism (DSM)**: countries file complaints; panels rule; losing party must comply or face authorized retaliation\n- **Most Favored Nation (MFN)**: WTO members must offer all members the same tariff rates they offer their best trading partner\n- **National Treatment**: imported goods must be treated the same as domestically produced ones once they clear customs",
 highlight: [
 "tariffs",
 "quotas",
 "subsidies",
 "antidumping",
 "WTO",
 "dispute settlement",
 "most favored nation",
 "national treatment",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Country A produces both wheat and steel more efficiently than Country B (absolute advantage in both). According to comparative advantage theory, should Country A still trade with Country B?",
 options: [
 "Yes — if Country A has a relatively larger efficiency advantage in one good, both countries gain from specialization and trade",
 "No — Country A will always lose by trading with a less efficient partner",
 "Only if Country B can match Country A's productivity within 10 years",
 "Yes, but only if Country A receives financial compensation from Country B",
 ],
 correctIndex: 0,
 explanation:
 "Comparative advantage shows that absolute productivity differences are irrelevant to the gains from trade. What matters is opportunity cost. If Country A is 50% more efficient at making steel but only 10% more efficient at wheat, its comparative advantage is in steel. By specializing in steel and importing wheat from Country B, Country A frees up resources that generate more value than the wheat those resources could have produced. Country B, by specializing in what it is relatively least bad at (wheat), also gains. Ricardo's proof of mutual gains from trade holds even with massive productivity gaps.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "According to the Heckscher-Ohlin model, the Stolper-Samuelson theorem predicts that trade with labor-abundant developing countries will unambiguously increase wages for all workers in capital-abundant developed countries.",
 correct: false,
 explanation:
 "False — the Stolper-Samuelson theorem predicts the opposite for scarce factors. In a capital-abundant country like the US, capital is the abundant factor and unskilled labor is relatively scarce. Trade with labor-abundant countries (Vietnam, Bangladesh) raises returns to the abundant factor (capital) but reduces real wages for the scarce factor (unskilled labor). This is why globalization, while raising overall GDP, has distributional consequences that can hurt manufacturing workers in rich countries — a politically significant result that helps explain trade skepticism and protectionist pressures.",
 difficulty: 3,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Brazil files a WTO complaint alleging that US cotton subsidies depress world cotton prices, harming Brazilian cotton farmers who compete without subsidies. The WTO panel rules in Brazil's favor. The US fails to reform its cotton program. Brazil is then authorized by the WTO to impose retaliatory tariffs on US goods.",
 question:
 "Which WTO principle was the US found to have violated, and what mechanism authorized Brazil's retaliation?",
 options: [
 "The Agreement on Subsidies; the Dispute Settlement Mechanism authorized countermeasures after US non-compliance",
 "Most Favored Nation principle; the Appellate Body suspended US voting rights",
 "National Treatment rule; Brazil was authorized to block all US agricultural imports",
 "The Anti-Dumping Agreement; Brazil could apply provisional safeguard measures",
 ],
 correctIndex: 0,
 explanation:
 "The landmark US–Brazil cotton case (DS267) ran from 2002–2014. Brazil successfully argued that US domestic support and export credit guarantees for cotton violated the WTO Agreement on Subsidies and Countervailing Measures and the Agreement on Agriculture. After years of US non-compliance, the Dispute Settlement Body authorized Brazil to impose cross-retaliation — unusually, against US intellectual property and services — worth $830m annually. The US ultimately agreed to pay Brazil $147m and commit to reform to avoid the retaliation. The case demonstrates the DSM's teeth but also its slow enforcement.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 2: Balance of Payments 
 {
 id: "global-economics-2",
 title: "Balance of Payments",
 description:
 "Current account, capital and financial accounts, BOP identity, twin deficit hypothesis, and financing risk",
 icon: "Scale",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Three Accounts of the BOP",
 content:
 "The **Balance of Payments (BOP)** records all economic transactions between a country and the rest of the world over a period. It is divided into three accounts:\n\n**1. Current Account (CA)**:\n- **Goods trade**: Exports minus imports of physical goods (cars, oil, iPhones). The US runs a large goods deficit (~$1 trillion/year)\n- **Services**: Tourism, financial services, education, IP royalties. The US has a services surplus (Hollywood, Wall Street, Silicon Valley IP)\n- **Primary income**: Investment income — dividends, interest, profits earned abroad vs paid to foreigners\n- **Secondary income**: Transfers — foreign aid, remittances (migrants sending money home). Remittances are larger than foreign aid globally\n\n**2. Capital Account**: Capital transfers (debt forgiveness, migrant transfers) — small in most countries\n\n**3. Financial Account (FA)**:\n- **Foreign Direct Investment (FDI)**: Building a factory, acquiring a company — long-term, sticky capital\n- **Portfolio investment**: Buying foreign stocks and bonds — more mobile, more volatile\n- **Reserve assets**: Central bank purchases of foreign currencies (mainly USD) — a key tool for exchange rate management\n- **Other investment**: Bank loans, trade credit\n\n**The BOP Identity**: CA + Capital Account + FA = 0 (by definition, with statistical discrepancy). Every deficit must be financed.",
 highlight: [
 "current account",
 "goods trade",
 "services",
 "primary income",
 "secondary income",
 "financial account",
 "FDI",
 "portfolio investment",
 "reserve assets",
 "BOP identity",
 ],
 },
 {
 type: "teach",
 title: "BOP Identity and the Twin Deficit Hypothesis",
 content:
 "**BOP Must Balance** — not because markets make it balance, but by accounting identity:\n\n*CA deficit = net financial account surplus*\n\nIf the US imports more than it exports (CA deficit), foreigners are accumulating US assets (T-bills, real estate, equities) — they are funding the US deficit by investing their dollars back into the US. China ran massive CA surpluses for decades; it accumulated $3+ trillion in foreign exchange reserves (mostly USD assets).\n\n**Savings-Investment Framework**: The CA balance equals the gap between national saving and investment:\n*CA = (Private Saving - Private Investment) + (Government Revenue - Government Spending)*\n*CA = Private Sector Balance + Government Fiscal Balance*\n\n**Twin Deficit Hypothesis**: If the government runs a fiscal deficit (spends more than it taxes), *holding private saving constant*, the CA deficit widens. The US 1980s experience — Reagan tax cuts fiscal deficit expansion CA deficit widening — is the classic example.\n\nHowever, the relationship is not mechanical: higher fiscal deficits can be offset by rising private saving (Ricardian equivalence) or can attract foreign investment that strengthens the currency and worsens the CA more through the exchange rate channel than the savings channel.",
 highlight: [
 "BOP identity",
 "CA deficit",
 "financial account surplus",
 "savings-investment",
 "twin deficit",
 "fiscal deficit",
 "Ricardian equivalence",
 ],
 },
 {
 type: "teach",
 title: "Sudden Stop Risk and External Financing",
 content:
 "Not all CA deficits are equal — what matters is *how* they are financed.\n\n**FDI-financed deficits** are relatively safe: factories and subsidiaries cannot flee overnight. Even in a crisis, FDI is stable.\n\n**Portfolio-investment-financed deficits** are vulnerable: foreign investors can sell bonds and stocks at any moment. If sentiment turns, capital outflows can be rapid — a **sudden stop**.\n\n**Sudden Stop** (Guillermo Calvo, 1998): A sudden reversal of capital inflows forces the current account to adjust sharply — currency depreciation, rising interest rates, recession. Latin America in 1994–95 (Tequila Crisis), Southeast Asia in 1997–98, and Russia in 1998 all experienced sudden stops.\n\n**External Debt Sustainability**:\n- Foreign currency debt is especially dangerous: if the currency depreciates, the debt burden in local currency terms explodes\n- This **currency mismatch** killed many EM economies in 1997–98 — companies borrowed in USD but earned revenues in Thai baht or Indonesian rupiah\n- **Original sin**: EM countries historically could not borrow internationally in their own currency, forcing them to take on this mismatch\n\n**Reserve Adequacy**: After 1997–98, EM central banks accumulated large FX reserves as self-insurance. The 'Greenspan-Guidotti rule' recommends reserves cover at least 12 months of external debt service.",
 highlight: [
 "sudden stop",
 "FDI",
 "portfolio investment",
 "currency mismatch",
 "original sin",
 "FX reserves",
 "Greenspan-Guidotti",
 "external debt",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A country runs a persistent current account deficit financed primarily by short-term foreign portfolio investment in its government bond market. What is the primary risk this creates?",
 options: [
 "Sudden stop risk — foreign investors can rapidly withdraw capital, forcing a sharp currency depreciation and interest rate spike",
 "Deflation risk — excess foreign capital inflows suppress domestic interest rates too far",
 "Trade surplus risk — the bond inflows will automatically convert into goods exports",
 "Fiscal surplus risk — portfolio inflows reduce the government's need to raise taxes",
 ],
 correctIndex: 0,
 explanation:
 "Short-term portfolio capital is often called 'hot money' — it responds instantly to changes in risk sentiment, interest rate differentials, or exchange rate expectations. A country financing its CA deficit with such flows is vulnerable to sudden stops: if foreign investors lose confidence (perhaps due to a widening deficit, political instability, or a global risk-off episode), they sell domestic bonds and repatriate capital. This causes the exchange rate to depreciate sharply (further spooking remaining investors), forces up domestic interest rates (tightening financial conditions), and can trigger a balance-of-payments crisis. Turkey (2018), Argentina (multiple episodes), and Indonesia (1997) illustrate this dynamic.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Under the BOP accounting identity, a country running a current account surplus must simultaneously be accumulating net foreign assets (running a financial account deficit).",
 correct: true,
 explanation:
 "True — by the BOP identity (CA + Capital Account + Financial Account = 0, ignoring the small capital account), a CA surplus means the country is earning more from abroad than it spends. Those foreign earnings must go somewhere: they accumulate as net foreign assets — foreign currency reserves, FDI abroad, portfolio investments overseas, or loans to foreign entities. This is exactly what China did from the early 2000s to ~2015: its huge CA surpluses were 'recycled' into massive reserve accumulation (largely US Treasury bonds), reflecting the financial account deficit counterpart. Germany's persistent CA surplus is similarly reflected in its capital outflows into European and global assets.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Country X has a current account deficit of 6% of GDP, government fiscal deficit of 4% of GDP, and private saving rate of 18% of GDP. Its CA deficit is financed 70% by short-term portfolio debt inflows and 30% by FDI. The US Federal Reserve unexpectedly raises interest rates 75bps, triggering a global risk-off episode.",
 question:
 "What is the most likely transmission mechanism from the US rate hike to Country X's economy?",
 options: [
 "Portfolio outflows as foreign investors sell bonds to capture higher US yields currency depreciation imported inflation central bank forced to raise rates growth slowdown",
 "FDI inflows surge as cheaper local currency attracts foreign direct investors immediately",
 "Current account improves immediately as currency depreciation boosts exports within 30 days",
 "Twin deficit narrows automatically as higher global rates reduce government borrowing costs",
 ],
 correctIndex: 0,
 explanation:
 "This is the classic EM external vulnerability transmission channel. A US rate hike raises USD returns, making Country X's bonds less attractive at the margin — triggering capital outflows from the 70% portfolio-financed portion. Selling domestic bonds puts downward pressure on the currency. Depreciation raises import prices (especially for energy and food, which are typically USD-denominated), pushing up inflation. The central bank faces a dilemma: raise rates to defend the currency (hurting growth) or allow depreciation (worsening inflation). The J-curve effect means the CA deficit may initially *widen* as import costs rise in local currency before export volumes respond. This pattern played out in Turkey, South Africa, Brazil, and Indonesia after each major Fed tightening cycle.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 3: Emerging Market Economics 
 {
 id: "global-economics-3",
 title: "Emerging Market Economics",
 description:
 "Growth drivers, Washington Consensus, middle income trap, China and India development models, demographic dividends",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Growth Drivers in Emerging Markets",
 content:
 "Emerging markets grow faster than developed economies because they can exploit several structural advantages:\n\n**1. Demographic Dividend**:\n- The **dependency ratio** (non-workers / workers) falls as a country transitions from high to low fertility\n- Fewer children means more household saving; more workers relative to dependents means higher output per capita\n- East Asia's growth miracle (1965–1995) was ~30% attributable to demographics (World Bank estimate)\n- India's demographic dividend peaks around 2030–2040; sub-Saharan Africa's peaks after 2050\n\n**2. Urbanization**:\n- Moving workers from low-productivity subsistence farming to higher-productivity urban manufacturing and services\n- China urbanized from 18% (1978) to 65% (2023) — a structural shift that boosted aggregate productivity\n- 'Lewis turning point': when the surplus rural labor pool is exhausted, wages start rising sharply — China hit this ~2010–2015\n\n**3. Productivity Catch-Up**:\n- Developing countries can adopt technologies already proven in rich countries without paying the R&D cost\n- **Technology transfer** through FDI, imports of capital goods, education abroad\n- **Conditional convergence** (Solow): poor countries grow faster toward their own steady states — but institutions, rule of law, and human capital determine where that steady state is\n\n**4. Capital Deepening**:\n- Low capital-to-labor ratios mean high marginal returns to investment — building roads, power plants, and factories yields huge productivity gains when starting from almost nothing",
 highlight: [
 "demographic dividend",
 "dependency ratio",
 "urbanization",
 "Lewis turning point",
 "productivity catch-up",
 "technology transfer",
 "conditional convergence",
 "capital deepening",
 ],
 },
 {
 type: "teach",
 title: "Washington Consensus and Its Limits",
 content:
 "In the late 1980s, economist John Williamson codified what Washington-based institutions (IMF, World Bank, US Treasury) prescribed for developing countries seeking loans:\n\n**The Washington Consensus (10 Prescriptions)**:\n1. Fiscal discipline — eliminate budget deficits\n2. Redirect public expenditure toward education, health, infrastructure\n3. Tax reform — broaden base, cut marginal rates\n4. Liberalize interest rates (let markets set them)\n5. Competitive exchange rates\n6. Trade liberalization — cut tariffs, remove quotas\n7. FDI liberalization — welcome foreign investment\n8. Privatization of state-owned enterprises\n9. Deregulation — remove barriers to entry and competition\n10. Property rights protection\n\n**The Critique**: Latin America largely followed WC prescriptions in the 1990s with disappointing results — the 'lost decade' of low growth and instability. Problems:\n- **Sequencing matters**: financial liberalization before strong banking regulation caused crises (Mexico 1994, Asia 1997)\n- **Institutions first**: privatization without competition policy handed monopolies to connected elites\n- **One size fits all**: generic prescriptions ignored country-specific structures and political economy\n\n**Post-Washington Consensus**: Dani Rodrik, Joseph Stiglitz, and others argued for **institutional quality**, **industrial policy**, and **heterodox approaches** — noting that South Korea, Taiwan, and China grew spectacularly while violating WC prescriptions (they maintained capital controls, used industrial policy, kept state banks).",
 highlight: [
 "Washington Consensus",
 "fiscal discipline",
 "privatization",
 "trade liberalization",
 "sequencing",
 "institutional quality",
 "industrial policy",
 "post-Washington Consensus",
 ],
 },
 {
 type: "teach",
 title: "Middle Income Trap, China Model, India Story",
 content:
 "**Middle Income Trap**: Countries that reach ~$5,000–$15,000 GDP per capita often stagnate and fail to reach developed-country status. Why?\n- Low-wage manufacturing advantage disappears (wages rose above competitive levels)\n- Cannot yet compete in knowledge-intensive, high-tech industries against established leaders\n- Political economy of reform becomes harder — vested interests resist structural change\n- Examples: Brazil, Mexico, Malaysia, South Africa have been stuck for decades\n- Escapees: South Korea, Taiwan, Singapore successfully transitioned to high-income status through sustained investment in education, R&D, and technology upgrading\n\n**China's Development Model**:\n- **Export-led growth**: cheap manufacturing for global markets, starting with textiles/toys, moving to electronics and machinery\n- **State capitalism**: government directs investment via state-owned banks; 5-year plans prioritize strategic sectors\n- **Infrastructure investment**: massive spending on roads, ports, rail, power — reducing logistics costs and enabling factory clusters\n- **Special Economic Zones**: Shenzhen as laboratory for market reforms without system-wide risk\n- Now facing: property sector crisis, debt overhang, demographic reversal, US technology decoupling\n\n**India's Path**: Services-led growth rather than manufacturing:\n- **IT exports**: Bangalore/Hyderabad software services (~$250bn/year); Infosys, Wipro, TCS as global leaders\n- **Demographic dividend**: 1.4bn people, median age ~28 (vs China's ~38)\n- **Domestic consumption**: large and growing middle class driving retail, fintech, logistics boom\n- Challenges: infrastructure gaps, labor market rigidity, agricultural distress, financial inclusion",
 highlight: [
 "middle income trap",
 "export-led growth",
 "state capitalism",
 "special economic zones",
 "Shenzhen",
 "IT exports",
 "demographic dividend",
 "India",
 "China",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Country starts at $2,000 GDP per capita and grows at 7% per year for 10 years. Approximately where does it end up?",
 options: [
 "~$3,935 per capita (using simple interest)",
 "~$3,200 per capita (7% × 10 years added to base)",
 "~$3,934 per capita — applying the Rule of 72, GDP roughly doubles every 10.3 years at 7%",
 "~$3,934 per capita — compounding: $2,000 × (1.07)^10 $3,934",
 ],
 correctIndex: 3,
 explanation:
 "Compound growth is the correct calculation: $2,000 × (1.07)^10 = $2,000 × 1.967 = $3,934 per capita. The Rule of 72 provides a useful shortcut: divide 72 by the growth rate to get approximate doubling time. At 7%/year, income doubles in approximately 72/7 10.3 years. So after exactly 10 years, the country is just short of doubling — reaching ~$3,934. This is still within the middle-income range ($3,956 is the World Bank's upper-middle-income threshold). To escape the middle-income trap and reach high-income status (~$13,845 per World Bank 2024 threshold), the country would need another ~7–8 years of 7% growth. The power of compounding explains why sustained high-growth periods are so transformative.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Vietnam has grown at ~6–7% per year since the Doi Moi reforms of 1986. It has attracted large FDI inflows in manufacturing (Samsung produces 50% of its global smartphones there). Wages have roughly tripled since 2010. A global electronics firm is now considering whether to continue expanding in Vietnam or shift some production to Bangladesh or Ethiopia.",
 question:
 "What economic concept best explains the firm's decision calculus, and what is this inflection point called in development economics?",
 options: [
 "Vietnam may be approaching the Lewis Turning Point — where surplus rural labor is exhausted and wage pressure accelerates, eroding low-cost manufacturing advantage",
 "Vietnam is experiencing the Washington Consensus effect — liberalization has raised wages and now requires re-regulation",
 "The firm is reacting to the middle income trap — Vietnam's per capita income has already exceeded $15,000",
 "The firm is applying Heckscher-Ohlin theory by moving to countries with higher capital endowments",
 ],
 correctIndex: 0,
 explanation:
 "The Lewis Turning Point, named after Arthur Lewis, occurs when the unlimited supply of cheap rural labor is absorbed into the modern sector and wages begin rising faster. For China this happened around 2010–2015, driving manufacturers toward Vietnam, Bangladesh, and Cambodia. Vietnam tripling wages since 2010 signals it is approaching or passing its own Lewis point. The next tier — Bangladesh (lower wages but infrastructure constraints), Ethiopia (very low wages but nascent industrial base), or even automation — becomes economically rational. This 'flying geese' pattern of industrial migration across Asia has been a key mechanism of regional development.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Global Inequality & Inclusive Growth 
 {
 id: "global-economics-4",
 title: "Global Inequality & Inclusive Growth",
 description:
 "Gini coefficient, Kuznets curve, elephant curve, between- vs within-country inequality, and inclusive growth policies",
 icon: "BarChart2",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Measuring Inequality: Gini and the Lorenz Curve",
 content:
 "**Gini Coefficient** (Corrado Gini, 1912): The most widely used measure of income or wealth inequality.\n\n- **0 = Perfect equality**: every person has the same income\n- **1 = Perfect inequality**: one person has all the income\n- In practice, national Gini coefficients range from ~0.25 (Scandinavia) to ~0.65 (South Africa, pre-redistribution)\n\n**Lorenz Curve**: The Gini is the ratio of the area *between* the Lorenz curve and the 45° equality line to the total area below the 45° line. The further the Lorenz curve bows away from equality, the higher the Gini.\n\n**Global Comparisons (approximate 2023)**:\n- Nordic countries: 0.25–0.30 (high redistribution)\n- Germany/France: 0.30–0.32\n- USA: ~0.39 (higher than most rich countries)\n- China: ~0.47 (rose dramatically with development)\n- Brazil: ~0.52\n- South Africa: ~0.63 (world's most unequal major economy)\n\n**Limitations of the Gini**:\n- Two countries can have identical Gini but very different income distributions (middle class squeeze vs polarized rich/poor)\n- Does not capture consumption (poorer households often smooth consumption better than income suggests)\n- Misses wealth inequality, which is typically far more extreme than income inequality (global wealth Gini ~0.85)\n- Tax and transfer data quality varies greatly across countries",
 highlight: [
 "Gini coefficient",
 "Lorenz curve",
 "income inequality",
 "wealth inequality",
 "redistribution",
 ],
 },
 {
 type: "teach",
 title: "Kuznets Curve and the Elephant Curve",
 content:
 "**Kuznets Inverted-U Hypothesis** (Simon Kuznets, 1955):\n- As countries develop (rising per capita income), inequality first *rises* then *falls*\n- Early industrialization: workers move from uniform-wage subsistence farming to diverse-wage industrial sector inequality rises\n- Later development: spread of education, social safety nets, labor market maturation inequality falls\n- Evidence is mixed: South Korea and Taiwan followed the curve; Latin America largely did not\n- **Environmental Kuznets Curve**: same inverted-U is proposed for pollution — rises with industrialization, falls as countries become rich enough to demand clean air and pay for it\n\n**Branko Milanovic's 'Elephant Curve'** (2016 landmark paper):\n- Tracked real income growth by global income percentile, 1988–2008\n- **Shape resembles an elephant**: The trunk (top 1% — global elite, mostly in rich countries) grew fastest (+60–65%); the hump (global middle class — China, India, other EM) grew +70–80%; but the *dip* at the 75th–90th percentile (lower-middle class in rich countries — US rustbelt workers, European manufacturing workers) grew nearly 0%\n- **Interpretation**: Globalization created enormous wealth for rich-country elites and lifted hundreds of millions in Asia, but squeezed working-class incomes in rich countries — politically explosive\n- This distributional tension explains the rise of populism, Brexit, Trump, and anti-globalization movements in developed economies",
 highlight: [
 "Kuznets curve",
 "inverted-U",
 "elephant curve",
 "Milanovic",
 "global middle class",
 "populism",
 "between-country inequality",
 "within-country inequality",
 ],
 },
 {
 type: "teach",
 title: "Between-Country vs Within-Country Inequality and Policy Responses",
 content:
 "**The Two Dimensions of Global Inequality**:\n\n**Between-country inequality** (convergence/divergence):\n- Has *declined* dramatically since 1990 — China and India's rise lifted ~1.2 billion people out of extreme poverty\n- Average incomes in EM converging toward rich-country levels (conditional convergence in action)\n- The global middle class grew from ~1 billion (1990) to ~4 billion (2020)\n\n**Within-country inequality** (domestic distribution):\n- Has *risen* in most countries, including China, India, USA, UK\n- Drivers: technology (skill-biased technological change rewards education), winner-takes-all markets (platform monopolies), globalization (manufacturing offshoring), declining union power, capital income concentration\n- The top 1% globally owns ~45% of all wealth (Credit Suisse Global Wealth Report)\n\n**Inclusive Growth Policy Toolkit**:\n- **Education**: Primary secondary tertiary expansion; quality matters more than quantity\n- **Healthcare**: Universal health coverage prevents health shocks from destroying household savings\n- **Social protection**: Conditional cash transfers (Brazil's Bolsa Família, Mexico's Oportunidades) reduced poverty 20–30% at relatively low cost\n- **Progressive taxation**: Higher marginal rates on top incomes + capital gains; inheritance taxes; wealth taxes (Piketty's proposal)\n- **Labor market policies**: Minimum wage increases, union rights, anti-monopoly enforcement to raise worker bargaining power\n- **Financial inclusion**: Mobile banking (M-Pesa in Kenya) giving the unbanked access to credit and savings",
 highlight: [
 "between-country inequality",
 "within-country inequality",
 "extreme poverty",
 "skill-biased technological change",
 "conditional cash transfers",
 "Bolsa Família",
 "progressive taxation",
 "financial inclusion",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A country's Gini coefficient falls from 0.50 to 0.40. What does this indicate about the distribution of income?",
 options: [
 "Inequality is falling — income is becoming more equally distributed",
 "Inequality is rising — a Gini moving toward 1.0 represents more equality",
 "The country has entered the middle income trap",
 "The Lorenz curve has moved further from the 45° equality line",
 ],
 correctIndex: 0,
 explanation:
 "The Gini coefficient ranges from 0 (perfect equality) to 1 (perfect inequality). A fall from 0.50 to 0.40 means the Lorenz curve has moved *closer* to the 45° line of perfect equality — incomes are becoming more equally distributed. This is the direction of improvement. Brazil's Gini fell from ~0.60 in 1990 to ~0.52 by 2015, driven by rapid minimum wage growth and the Bolsa Família conditional cash transfer program reaching ~50 million beneficiaries. South Africa's Gini remains the highest of any major economy at ~0.63, reflecting the persistent legacy of apartheid-era wealth concentration and high structural unemployment.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "Milanovic's elephant curve shows that the global working class in rich countries (around the 75th–90th global income percentile) experienced among the highest real income growth rates from 1988 to 2008.",
 correct: false,
 explanation:
 "False — this is precisely the striking finding of Milanovic's elephant curve. The workers in rich countries who sit around the 75th–90th percentile of the *global* income distribution (but lower middle class in local terms — manufacturing workers in the US Midwest, UK Midlands, French industrial cities) experienced near-zero real income growth over the 20-year period. They were squeezed between two groups that did well: the global middle class in emerging markets (whose rise created the hump of the elephant) and the global elite (the elephant's trunk — top 1%). This distributional pattern, where the 'losers' from globalization are clustered in politically pivotal Midwestern and post-industrial regions, is widely cited as a structural driver of the populist political movements of the 2010s.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An international development organization is comparing two countries: Country A reduced its Gini coefficient from 0.55 to 0.45 over 15 years through aggressive income redistribution (cash transfers), but GDP per capita growth averaged only 2%/year. Country B maintained a Gini of 0.52 throughout, but GDP per capita grew at 6%/year, lifting average incomes by 140%.",
 question:
 "From an inclusive growth perspective, which outcome is more favorable for the poor, and what does this reveal about the 'growth vs inequality' tradeoff?",
 options: [
 "Country B's growth likely lifted more people out of poverty in absolute terms — but high inequality means gains were concentrated at the top, potentially leaving the poor better off in both countries for different reasons",
 "Country A is unambiguously better — reducing the Gini always leads to better poverty outcomes regardless of growth",
 "Country B is always better — growth automatically reduces poverty without any redistribution needed",
 "Neither country succeeded — the only valid measure is whether the Gini reached 0.30 or below",
 ],
 correctIndex: 0,
 explanation:
 "This question illustrates the genuine tension in development economics. Absolute poverty reduction depends on *both* growth and distribution. At 6%/year, Country B's average income rose by ~140% — even the bottom quintile likely saw significant gains in absolute terms (lower infant mortality, longer life expectancy, higher consumption). Country A's redistribution was meaningful but 2% average growth produces smaller absolute gains to share. However, if Country B's Gini of 0.52 means the top 10% captured most of the 140% gain, the poor's share may be smaller than it appears. The IMF and World Bank now advocate 'inclusive growth' — both dimensions matter. High inequality can itself reduce long-run growth (via political instability, underinvestment in human capital among the poor, erosion of social trust). The optimal policy combines growth-enabling reforms with redistribution mechanisms.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 5: Climate Economics & Sustainable Development 
 {
 id: "global-economics-5",
 title: "Climate Economics & Sustainable Development",
 description:
 "Carbon pricing mechanisms, Pigouvian taxes, green GDP, SDGs, climate finance, and the efficiency debate between price and quantity instruments",
 icon: "Leaf",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Externalities and Pigouvian Carbon Taxes",
 content:
 "**Externality**: A cost or benefit of an economic activity borne by parties not involved in the transaction. Carbon emissions are the world's largest **negative externality** — emitters do not pay for the climate damages their emissions impose on others.\n\n**Market Failure**: Without a price on carbon, firms and consumers treat the atmosphere as a free dumping ground. The market produces *too much* carbon-intensive output relative to the social optimum.\n\n**Pigouvian Tax** (Arthur Pigou, 1920): Tax the activity equal to the marginal external cost — forcing the polluter to internalize the externality.\n- A $50/tonne carbon tax adds $50 to the cost of releasing one tonne of CO\n- Producers substitute toward cleaner methods; consumers buy less carbon-intensive products; firms invest in low-carbon R&D\n- Revenue can be returned as dividend to citizens ('carbon dividend') or used to cut other distortionary taxes\n\n**Social Cost of Carbon (SCC)**: The estimated monetary damage from one additional tonne of CO emissions. The US government uses ~$190/tonne (Biden-era estimate); early Trump-era estimate was ~$6/tonne — the difference reflects discount rate assumptions about how much weight to give future damages.\n\n**Challenges**:\n- Political resistance: carbon taxes are visible and immediate; climate benefits are diffuse and delayed\n- Competitiveness: industries facing a carbon tax in one country may relocate to countries without one ('carbon leakage')\n- Carbon Border Adjustment Mechanism (CBAM): the EU's solution — impose carbon costs on imports from countries without equivalent carbon pricing",
 highlight: [
 "externality",
 "negative externality",
 "market failure",
 "Pigouvian tax",
 "carbon tax",
 "social cost of carbon",
 "carbon leakage",
 "CBAM",
 ],
 },
 {
 type: "teach",
 title: "Cap-and-Trade, EU ETS, and Green GDP",
 content:
 "**Cap-and-Trade** (Quantity Instrument):\n- Government sets a total **cap** on emissions (e.g., 1,000 tonnes for all firms in a sector)\n- Tradeable permits are issued or auctioned up to the cap\n- Firms that can cut emissions cheaply do so and *sell* surplus permits; firms with high abatement costs *buy* permits\n- **Economic efficiency**: emission reductions happen where they are cheapest across the economy\n- **Certainty on quantity**: the cap guarantees total emissions do not exceed the limit\n\n**EU Emissions Trading System (EU ETS)**:\n- Launched 2005; covers ~40% of EU greenhouse gas emissions (power, heavy industry, aviation)\n- Has survived early price crashes (2008–2012 due to over-allocation) to reach 60–100/tonne by 2023\n- Expanding to shipping (2024), buildings and road transport (2027)\n- Linked to CBAM to prevent carbon leakage\n\n**Price vs Quantity — Weitzman's Uncertainty Theorem** (Martin Weitzman, 1974):\n- Under uncertainty, if the marginal damage curve is *steep* (small over-emission causes large damage), **quantity instruments** (cap-and-trade) are preferred\n- If the marginal abatement cost curve is *steep* (small over-tightening causes large economic cost), **price instruments** (carbon tax) are preferred\n- For climate, the damage function may be highly nonlinear near tipping points — favoring strict quantity limits\n\n**Green GDP**: Adjusts national income accounting for natural capital depletion (forest destruction, fisheries depletion, soil degradation, water extraction). A country that clear-cuts its forests and mines its minerals is not truly growing — it is liquidating its balance sheet. The UN System of Environmental-Economic Accounting (SEEA) provides the framework.",
 highlight: [
 "cap-and-trade",
 "emissions trading",
 "EU ETS",
 "Weitzman",
 "price instrument",
 "quantity instrument",
 "green GDP",
 "natural capital",
 "SEEA",
 ],
 },
 {
 type: "teach",
 title: "SDGs, Climate Finance, and Just Transition",
 content:
 "**Sustainable Development Goals (SDGs)**:\n- 17 goals adopted by all 193 UN member states in 2015; target date 2030\n- Range from No Poverty (Goal 1) and Zero Hunger (Goal 2) to Climate Action (Goal 13), Life Below Water (Goal 14), and Partnerships for the Goals (Goal 17)\n- **Investment implications**: ~$5–7 trillion/year in additional investment needed globally to achieve SDGs (UNCTAD estimate); creates massive opportunities in clean energy, sustainable agriculture, health infrastructure, education\n- ESG investing, green bonds, and impact investing are all partly motivated by SDG alignment\n\n**Climate Finance Architecture**:\n- **Mitigation**: Reducing emissions — renewable energy, energy efficiency, electric vehicles\n- **Adaptation**: Managing unavoidable climate impacts — sea walls, drought-resistant crops, early warning systems\n- **Loss and Damage**: Compensation for irreversible harms already occurring in vulnerable countries (agreed at COP27 Sharm el-Sheikh 2022 — historic breakthrough)\n- **$100bn/year pledge**: Rich countries pledged to mobilize $100bn/year for developing countries by 2020 — consistently fell short\n\n**Just Transition**:\n- Moving to a low-carbon economy will displace coal miners, oil workers, and manufacturing workers in fossil-fuel-dependent communities\n- A 'just transition' provides retraining, economic diversification, and social support for affected workers and regions\n- EU Just Transition Fund: 55bn for coal regions (Poland, Czech Republic, Germany Ruhr)\n- Without just transition support, climate policy generates intense political backlash from workers who see it as an attack on their livelihoods",
 highlight: [
 "SDGs",
 "mitigation",
 "adaptation",
 "loss and damage",
 "climate finance",
 "green bonds",
 "just transition",
 "carbon neutral",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A government must choose between a $50/tonne carbon tax and a 1,000-tonne annual permit cap (cap-and-trade) to reduce emissions. Under uncertainty about the true marginal abatement cost curve, which instrument provides certainty about the emissions outcome?",
 options: [
 "Cap-and-trade — the permit cap guarantees total emissions cannot exceed 1,000 tonnes regardless of the carbon price that emerges",
 "Carbon tax — the $50/tonne price guarantees firms will reduce to exactly 1,000 tonnes",
 "Both provide equal certainty about the quantity of emissions",
 "Neither — only direct regulation (command-and-control) can guarantee emission quantities",
 ],
 correctIndex: 0,
 explanation:
 "This is the fundamental difference between price and quantity instruments. Cap-and-trade sets a firm *quantity* ceiling — if permits are scarce, the market price rises to ration them, but total emissions cannot exceed the cap. The carbon tax sets a *price*, but the quantity outcome depends on how firms respond — if abatement is cheaper than expected, firms cut more; if abatement is more expensive (due to technology setbacks, energy shocks), they cut less than planned and emissions exceed the target. For climate policy, where scientists specify emissions budgets consistent with temperature targets, cap-and-trade offers quantity certainty that a carbon tax cannot. However, Weitzman's analysis shows the tax may be preferable if steep abatement cost curves make hitting a tight quantity cap economically devastating during bad shocks. Most economists favor a 'hybrid' approach: a cap with a price floor and ceiling ('collar').",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A Pigouvian carbon tax set equal to the social cost of carbon would, in theory, result in the economically optimal level of emissions — not zero emissions.",
 correct: true,
 explanation:
 "True — and this is a crucial point often misunderstood. The goal of a Pigouvian tax is not to eliminate the externality but to internalize it optimally. At the optimum, the marginal benefit of the last unit of carbon-intensive activity (e.g., heating a home, flying, producing steel) exactly equals its marginal social cost (climate damage). Some level of emissions is optimal because the economic value of the activity exceeds the damage caused. The tax does not aim for zero emissions but for the quantity where the social net benefit is maximized. Zero emissions would require forgoing enormous economic value for marginal climate benefit at the margin. This is why carbon pricing is compatible with continued use of fossil fuels — it just makes them appropriately expensive, shifting the mix toward cleaner alternatives at the margin rather than banning the activity outright.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A developing country with a coal-dependent economy of 200,000 miners and their families faces pressure at COP negotiations to phase out coal by 2035 to meet global 1.5°C targets. The country argues it bears minimal historical responsibility for climate change and cannot afford renewable alternatives without external financing. Rich countries offer a $2bn transition fund spread over 10 years — the country estimates it needs $15bn.",
 question:
 "Which climate finance principles does this scenario illustrate, and what is the economic term for the underlying incentive problem facing global climate negotiations?",
 options: [
 "Loss and damage, common but differentiated responsibilities, and the global public good / free rider problem in climate commitments",
 "The Washington Consensus applied to climate policy and the Pigouvian tax design problem",
 "The Kuznets environmental curve and the Heckscher-Ohlin endowment theory of emission responsibility",
 "The just transition framework and the Gini coefficient of global carbon inequality",
 ],
 correctIndex: 0,
 explanation:
 "This scenario touches multiple core climate economics principles. **Common But Differentiated Responsibilities (CBDR)** — enshrined in the UNFCCC — recognizes that rich countries caused most historical emissions and have greater capacity to act; developing countries should not bear equal burdens. **Loss and damage** acknowledges that vulnerable countries face costs from climate change they did not cause. The financing gap ($2bn offered vs $15bn needed) reflects the persistent failure of the $100bn/year pledge made at Copenhagen (2009). The underlying game-theory problem is the **global public good / free rider problem**: a stable climate is non-excludable and non-rival — every country benefits from global emission reductions regardless of who pays. Each country has an incentive to free-ride on others' reductions, creating a collective action failure that no individual national government can solve. This is why binding international agreements and credible enforcement mechanisms are essential — and why they are so difficult to achieve.",
 difficulty: 3,
 },
 ],
 },
 ],
};
