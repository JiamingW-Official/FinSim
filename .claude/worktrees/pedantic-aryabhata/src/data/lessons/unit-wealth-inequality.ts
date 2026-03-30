import type { Unit } from "./types";

export const UNIT_WEALTH_INEQUALITY: Unit = {
 id: "wealth-inequality",
 title: "Wealth Inequality & Economic Mobility",
 description:
 "Examine how wealth and income are distributed across society, the forces driving inequality, intergenerational mobility, policy levers, and investment implications in an unequal world",
 icon: "Scale",
 color: "#8b5cf6",
 lessons: [
 // Lesson 1: Measuring Inequality 
 {
 id: "wi-1",
 title: "Measuring Inequality",
 description:
 "Master the Gini coefficient, Lorenz curve, income vs wealth inequality, top-share trends, and cross-country comparisons",
 icon: "BarChart2",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Lorenz Curve and Gini Coefficient",
 content:
 "Economists use two closely linked tools to summarize how evenly a resource is distributed across a population.\n\n**The Lorenz Curve** plots cumulative population share (x-axis, poorest to richest) against cumulative income or wealth share (y-axis). If every person had identical income, the curve would be the 45° diagonal — the **line of perfect equality**. In reality the curve bows downward: the bottom 50% of households might hold only 3–5% of total wealth.\n\n**The Gini Coefficient** converts the Lorenz curve into a single number:\n\n- Gini = Area between the diagonal and the Lorenz curve ÷ Total area below the diagonal\n- Range: 0 (perfect equality) to 1 (one person holds everything)\n- Common shorthand: multiply by 100 to get the **Gini Index** (0–100)\n\n**Illustrative country comparisons (wealth Gini, circa 2023):**\n- Norway / Denmark: ~65–70 (low inequality by global standards)\n- Germany / France: ~73–78\n- United States: ~85\n- South Africa / Brazil: ~88–90\n\n**Limitations of the Gini:**\n- Two distributions can have identical Ginis but very different shapes\n- Doesn't capture where in the distribution inequality is concentrated\n- Sensitive to household definition and survey coverage\n- Cross-country comparisons are complicated by differing tax/transfer systems",
 highlight: ["Lorenz Curve", "Gini Coefficient", "line of perfect equality", "Gini Index"],
 },
 {
 type: "teach",
 title: "Income vs Wealth Inequality",
 content:
 "Income and wealth are related but distinct concepts — and their inequality profiles differ dramatically.\n\n**Income inequality** measures annual flows: wages, salaries, dividends, rent, capital gains realized. The U.S. income Gini is roughly 0.48.\n\n**Wealth inequality** measures the stock of net assets (financial assets + real estate liabilities). It is always more concentrated than income because:\n- High-earners save more, compounding assets over time\n- Returns on capital (interest, dividends, appreciation) accrue disproportionately to existing wealth holders\n- Inheritance transfers inter-generational advantage\n\n**Top-share data (U.S.):**\n- Top 1% income share: ~21% (2023, up from ~10% in 1975)\n- Top 0.1% income share: ~10%\n- Top 1% wealth share: ~38%\n- Top 10% wealth share: ~70%\n- Bottom 50% wealth share: ~2.5%\n\n**Why these trends matter for investors:**\n- A larger share of national income flowing to capital vs labor raises corporate profit margins\n- Concentrated purchasing power boosts demand for luxury goods and premium brands\n- Growing lower-middle class demand in emerging markets (China, India) creates different consumption trends",
 highlight: ["income inequality", "wealth inequality", "top-share", "capital vs labor"],
 },
 {
 type: "teach",
 title: "Cross-Country Comparison and Relative vs Absolute Poverty",
 content:
 "Inequality comparisons across countries require careful interpretation.\n\n**Relative poverty** is defined as income below a threshold relative to median income (commonly 50% or 60% of median). A person is poor by this measure if they fall far behind their countrymen — even if their absolute living standard is high by global standards.\n\n**Absolute poverty** uses a fixed real threshold — the World Bank's extreme poverty line is $2.15/day (2017 PPP). On this measure, global extreme poverty fell from ~36% of the world population in 1990 to under 9% by 2019 — one of history's greatest reductions in human deprivation.\n\n**Regional inequality landscape:**\n- **Scandinavia** consistently shows the lowest Gini scores; strong unions, universal welfare, compressed pre-tax wages\n- **Continental Europe** (France, Germany): moderate inequality, buffered by robust transfer systems\n- **Anglo-Saxon countries** (US, UK): higher market inequality, partially offset by transfers\n- **Latin America**: historically among the most unequal regions globally; land concentration is a key factor\n- **East Asia** (South Korea, Taiwan): rapid growth reduced inequality through broad-based manufacturing employment\n\n**The Kuznets Curve hypothesis:** As economies industrialize, inequality first rises then falls (inverted-U). Evidence is mixed — many developed countries have seen inequality rise again since the 1980s after a mid-century compression.",
 highlight: ["relative poverty", "absolute poverty", "Kuznets Curve", "PPP"],
 },
 {
 type: "quiz-mc",
 question:
 "A country's Lorenz curve shows that the bottom 40% of households earn 8% of total income, while the top 10% earn 42%. Which statement is most accurate about the Gini coefficient?",
 options: [
 "The Gini is 0 because the richest receive the most income, which is expected",
 "The Gini is close to 1 because almost all income is concentrated in the top decile",
 "The Gini is greater than 0 but likely between 0.35 and 0.60, reflecting meaningful inequality",
 "The Gini cannot be computed without knowing the income of each percentile",
 ],
 correctIndex: 2,
 explanation:
 "When the bottom 40% earn 8% and the top 10% earn 42%, there is substantial but not extreme concentration. This profile is consistent with a Gini coefficient in the 0.35–0.60 range — similar to the US income Gini (~0.48) or Brazil (~0.53). A Gini near 1 would require nearly all income to flow to one person; a Gini of 0 would require the bottom 40% to earn exactly 40%. While full computation needs all percentile data, the given shares already constrain the range.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Wealth inequality in most developed countries is higher than income inequality, as measured by their respective Gini coefficients.",
 correct: true,
 explanation:
 "True. Wealth is always more concentrated than income because it accumulates over time — high earners save and invest, compounding assets across decades and generations. In the US, the income Gini is roughly 0.48 while the wealth Gini is around 0.85. Returns on existing capital (dividends, appreciation) continuously widen the gap between asset holders and those who rely solely on labor income.",
 difficulty: 1,
 },
 ],
 },

 // Lesson 2: Drivers of Inequality 
 {
 id: "wi-2",
 title: "Drivers of Inequality",
 description:
 "Understand skill-biased technological change, superstar economics, Piketty's r > g thesis, globalization, and financialization",
 icon: "TrendingUp",
 xpReward: 90,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Skill-Biased Technological Change and Superstar Economics",
 content:
 "Two powerful forces have widened the wage distribution since the 1980s.\n\n**Skill-Biased Technological Change (SBTC):** Digital technologies complement high-skill workers (engineers, managers, financial analysts) while substituting for routine middle-skill tasks (bookkeeping, assembly, data entry). This **hollows out** the middle of the wage distribution — a pattern called **job polarization** or the 'hour-glass' labor market.\n\n**Evidence:**\n- College wage premium (college vs high-school graduate earnings) rose from ~50% in 1980 to ~80% by 2020 in the US\n- Employment shares in high-skill professional and low-skill service jobs grew; middle-skill clerical and production jobs shrank\n\n**Superstar Economics (Rosen, 1981; Garicano & Rossi-Hansberg, 2006):** Technology allows the best performers to scale their output globally. The top music artist, hedge fund manager, or software platform captures a disproportionate share of total market revenue:\n- A top hedge fund manager manages $50B vs $500M two decades ago — the marginal cost of managing more capital is near zero\n- Streaming means the top 1% of artists receive ~90% of plays\n- Platform network effects create winner-take-most dynamics (Google, Amazon, Meta)\n\nSuperstar economics concentrates compensation at the extreme top — the 0.1%, not just the 1% — and is a key driver of top-end income concentration.",
 highlight: ["SBTC", "job polarization", "superstar economics", "winner-take-most", "skill premium"],
 },
 {
 type: "teach",
 title: "Piketty's r > g: Capital vs Labor Returns",
 content:
 "Thomas Piketty's 2013 book *Capital in the Twenty-First Century* provided a sweeping framework for understanding long-run inequality dynamics.\n\n**The core thesis:** When the return on capital (r) exceeds the economic growth rate (g), wealth naturally concentrates over time. Owners of capital — stocks, bonds, real estate — grow their wealth faster than the overall economy, widening the gap between capital owners and wage earners.\n\n**Historical data (from Piketty's dataset):**\n- r (average pre-tax return on capital): ~4–5% per year over the long run\n- g (economic growth): ~1–2% in mature economies\n- Conclusion: r > g is the 'normal' state in low-growth economies\n\n**Two world wars and the Great Depression compressed the wealth distribution** (capital was destroyed, heavily taxed, inflated away) — creating the mid-20th century 'golden age' of relative equality.\n\n**Policy implication (Piketty's prescription):** A global wealth tax to counteract the mechanical tendency toward oligarchy. Critics argue:\n- Administrative feasibility is extremely challenging\n- Capital taxes can reduce investment and growth\n- r > g doesn't necessarily lead to dynastic concentration if high spenders dissipate wealth\n\nRegardless of policy views, the r > g framework is the dominant conceptual lens for long-run wealth inequality.",
 highlight: ["r > g", "return on capital", "economic growth", "Piketty", "wealth tax"],
 },
 {
 type: "teach",
 title: "Globalization and Financialization",
 content:
 "**Globalization's distributional effects** follow the Stolper-Samuelson logic: trade with labor-abundant countries raised wages in the developing world but depressed wages for low-skill workers in rich countries. The **China shock** (Autor, Dorn & Hanson, 2013) found that US regions more exposed to Chinese import competition saw lasting employment declines and wage suppression — challenging the earlier consensus that trade benefits were broadly shared.\n\n**Financialization** refers to the growing role of financial markets in the overall economy:\n- Finance's share of US corporate profits rose from ~10% in 1950 to ~30% by 2005\n- Financial sector compensation dramatically outpaced other sectors\n- CEO pay shifted from salary to stock options — tying executive compensation to asset prices\n- Share buybacks transfer corporate cash to existing shareholders rather than workers\n\n**The executive pay explosion:**\n- US CEO-to-worker pay ratio: ~20:1 in 1965 ~350:1 in 2020\n- Most of the increase came from equity compensation — CEOs became capital owners, not just highly paid employees\n\n**Combined effect:** Globalization and financialization together compressed wages at the bottom, redirected corporate profits to capital owners, and supercharged compensation at the very top — three distinct channels that all widened inequality simultaneously during 1980–2020.",
 highlight: ["globalization", "financialization", "China shock", "CEO pay", "executive compensation", "buybacks"],
 },
 {
 type: "quiz-mc",
 question:
 "According to Piketty's r > g framework, which scenario would most reduce wealth concentration over time?",
 options: [
 "A sustained increase in the stock market return from 5% to 8% annually",
 "A period of rapid GDP growth at 4–5% per year, narrowing the gap between r and g",
 "A rise in corporate profit margins, boosting returns to capital holders",
 "An increase in immigration that expands the labor supply",
 ],
 correctIndex: 1,
 explanation:
 "Piketty argues wealth concentrates when r > g. Narrowing this gap — through faster economic growth (g rises toward r) — reduces the mechanical tendency for capital to compound faster than the economy. The mid-20th century saw both higher growth and lower returns to capital (partly due to wartime destruction and high taxes), producing the most equal wealth distribution in modern history. Options A and C increase r, widening the gap. Immigration raises labor supply but doesn't directly address the r vs g dynamic.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A technology company develops AI software that automates middle-management reporting tasks previously done by workers earning $60,000–$80,000 per year. The same software allows senior executives to oversee 40% more staff. Revenue per employee rises 25%.",
 question: "Which inequality mechanism does this scenario most directly illustrate?",
 options: [
 "The Kuznets Curve — inequality rises as the economy industrializes",
 "Financialization — corporate profits shift from wages to shareholders",
 "Skill-biased technological change combined with superstar economics — technology replaces middle-skill workers while amplifying leverage for top earners",
 "Piketty's r > g — capital returns outpace economic growth",
 ],
 correctIndex: 2,
 explanation:
 "This scenario has two distinct inequality drivers: SBTC (automation displaces routine middle-skill workers) and superstar economics (executives extend their span of control with near-zero marginal cost, capturing more of the surplus). The hollowing-out of middle-wage jobs while senior roles become more valuable is classic SBTC-driven job polarization. Financialization and r > g are related but focus on capital returns vs wages broadly, not this specific technology-labor substitution mechanism.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Social Mobility 
 {
 id: "wi-3",
 title: "Social Mobility",
 description:
 "Explore intergenerational mobility measures, the Great Gatsby Curve, education ROI, geographic mobility, and inherited wealth dynamics",
 icon: "ArrowUpCircle",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Measuring Intergenerational Mobility",
 content:
 "**Social mobility** measures the degree to which an individual's economic position differs from their parents' — and is distinct from inequality, though the two are closely related.\n\n**Key metrics:**\n\n**Intergenerational Earnings Elasticity (IGE):** Regression coefficient of child's adult earnings on parent's earnings. An IGE of 0 means parental income has no effect (perfect mobility); IGE of 1 means children perfectly replicate parents' rank.\n- US IGE: ~0.45–0.50 (relatively low mobility by developed-country standards)\n- Denmark/Finland: ~0.15–0.20\n- UK: ~0.50; Germany: ~0.45\n\n**Rank-Rank Correlation:** Correlation between child's and parent's income percentile rank. Raj Chetty's research at Opportunity Insights finds the US rank-rank slope is ~0.35.\n\n**Absolute Mobility:** Fraction of children who earn more than their parents at the same age (inflation-adjusted). In the US, this fell from ~90% for children born in 1940 to ~50% for children born in 1980 — a dramatic decline in the expectation of material progress across generations.\n\n**Relative vs Absolute Mobility:** A society can have high relative mobility (ranks shuffle) but falling absolute mobility (everyone earns less in real terms), or vice versa. Both dimensions matter for social cohesion and political legitimacy.",
 highlight: ["intergenerational mobility", "IGE", "rank-rank correlation", "absolute mobility", "Opportunity Insights"],
 },
 {
 type: "teach",
 title: "The Great Gatsby Curve and Geographic Mobility",
 content:
 "**The Great Gatsby Curve** (Miles Corak, 2013) is one of the most striking empirical regularities in inequality research: **countries with higher income inequality also have lower intergenerational mobility**.\n\nOn a scatter plot of Gini coefficient (x-axis) vs IGE (y-axis), the US sits in the high-inequality, low-mobility quadrant alongside the UK and Italy. Scandinavian countries cluster in the low-inequality, high-mobility corner.\n\n**Why does inequality reduce mobility?**\n- Rich families invest more in children's education, health, and social networks\n- High inequality means a larger 'distance' to climb the ladder\n- Residential sorting: wealthy families cluster in high-quality school districts\n- Declining public goods quality reduces pathways for low-income children\n\n**Geographic mobility within the US (Chetty et al.):**\nMobility varies enormously across US commuting zones:\n- High-mobility areas: Salt Lake City, San Jose, Minneapolis — characterized by lower segregation, stronger public schools, two-parent households, social capital\n- Low-mobility areas: Atlanta, Charlotte, Memphis — high residential segregation by income and race, weaker school quality variance\n\n**Geographic immobility** has risen — Americans today move between states at half the rate of the 1980s, partly due to housing costs, occupational licensing barriers, and dual-income household coordination costs.",
 highlight: ["Great Gatsby Curve", "IGE", "geographic mobility", "residential segregation", "social capital"],
 },
 {
 type: "teach",
 title: "Education ROI and Inherited Wealth",
 content:
 "Two of the most powerful mechanisms transmitting economic advantage across generations are human capital and financial capital inheritance.\n\n**Education Return on Investment:**\n- The college earnings premium is real but varies substantially by field and institution quality\n- STEM and professional degrees (engineering, CS, medicine, law) yield IRRs of 15–20%+\n- Lower-demand fields at lower-tier schools sometimes have negative NPV when accounting for debt\n- Rising tuition has shifted the distribution of educational returns — first-generation college students face both higher costs and informational disadvantages\n- **Legacy admissions** at elite universities — admitting children of alumni at ~5–7× the rate of comparable non-legacy applicants — directly transmit advantage\n\n**Inherited Wealth:**\n- Roughly 50–70% of lifetime wealth accumulation in the US includes some inheritance or inter vivos transfer\n- Estates of $10M+ benefit from step-up in cost basis, avoiding capital gains on unrealized appreciation\n- Family offices, trusts, and estate planning tools allow wealthy families to transfer assets across generations at reduced tax incidence\n- Inherited wealth accelerates once received: compound growth on a $1M inheritance at 5% for 30 years = $4.3M; at $10M = $43M\n\n**Policy tensions:**\n- Estate taxes exist in most developed countries but often have large exemptions\n- The US federal estate tax exemption rose to $12.9M per person as of 2023\n- Proponents argue inheritance taxes are the most efficient way to break dynastic concentration without taxing labor or consumption",
 highlight: ["education ROI", "college premium", "inheritance", "estate tax", "legacy admissions", "inter vivos transfer"],
 },
 {
 type: "quiz-tf",
 statement:
 "The Great Gatsby Curve predicts that countries with more unequal income distributions tend to have higher intergenerational mobility, as individuals are more motivated to move up the ladder.",
 correct: false,
 explanation:
 "False — this is the opposite of what the data show. The Great Gatsby Curve, named by economist Alan Krueger, documents that higher inequality is associated with lower intergenerational mobility. When inequality is high, the gap between rungs of the ladder is larger, rich families invest disproportionately in their children, and residential sorting concentrates school quality in high-income areas. Scandinavian countries with compressed inequality have the highest mobility; the US and UK, with high inequality, have relatively low mobility.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "Raj Chetty's research found that absolute intergenerational mobility in the US — the share of children earning more than their parents — fell from approximately 90% for children born in 1940 to 50% for children born in 1980. What is the most accurate interpretation?",
 options: [
 "American children born in 1980 are objectively poorer than their parents were at the same age",
 "Half of children born around 1980 earn less in inflation-adjusted terms than their parents earned at the same age, a dramatic decline from near-universal upward mobility",
 "Income inequality doubled between 1940 and 1980 birth cohorts",
 "The US economy shrank in real terms between the 1960s and the 2000s",
 ],
 correctIndex: 1,
 explanation:
 "Absolute mobility measures what fraction of children exceed their parents' inflation-adjusted income at the same age. The fall from 90% to 50% means roughly half of those born in 1980 earn less (in real terms) than their parents did at a comparable life stage. This doesn't mean the economy shrank — median incomes still rose — but the gains went disproportionately to those already at the top, meaning the 'rising tide' stopped lifting all boats equally. It's a statement about the distribution of growth, not the level of income.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Policy Levers 
 {
 id: "wi-4",
 title: "Policy Levers",
 description:
 "Evaluate progressive taxation, wealth taxes, minimum wage, education access, universal basic income experiments, and the political economy of redistribution",
 icon: "Sliders",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Progressive Taxation and Wealth Taxes",
 content:
 "**Progressive income taxation** — where marginal rates rise with income — is the primary redistributive tool in most developed economies. Key debates:\n\n**Optimal top marginal rate:** Emmanuel Saez and Peter Diamond estimate the revenue-maximizing top rate is ~70% (accounting for tax avoidance elasticity). Behavioral responses (work reduction, avoidance) reduce but don't eliminate the redistributive impact at rates below this.\n\n**Capital gains taxation:** Long-term capital gains are taxed at 20% in the US (vs 37% top ordinary income rate) — an effective subsidy for passive wealth. Proponents argue lower rates reduce the 'lock-in' effect; critics note it disproportionately benefits the wealthy, who hold most capital assets.\n\n**Wealth taxes:** Annual tax on net worth above a threshold (e.g., 1–2% on wealth above $50M).\n- Proponents: directly targets the stock of inequality; harder to avoid than income taxes via wage/equity structuring\n- Critics: valuation challenges for illiquid assets (private businesses, art); capital flight risk; Sweden and France abolished wealth taxes citing revenue underperformance\n- Elizabeth Warren's 2020 proposal: 2% above $50M, 3% above $1B — estimated to raise $2.75T over 10 years\n\n**Estate taxes:** Tax on wealth transfer at death. US rate is 40% above $12.9M exemption (2023). Many loopholes (GRATs, dynasty trusts, step-up basis) significantly reduce effective rates. Denmark and Sweden abolished estate taxes; France maintains one of the world's stricter regimes.",
 highlight: ["progressive taxation", "wealth tax", "capital gains", "estate tax", "optimal top marginal rate"],
 },
 {
 type: "teach",
 title: "Minimum Wage, Labor Policy, and Education Access",
 content:
 "**Minimum wage policy** remains one of the most studied and debated labor market interventions.\n\n**Traditional view (pre-1990s):** Any minimum above the market wage causes unemployment (standard supply-demand). The employment loss outweighs the wage gain for low-wage workers.\n\n**Card & Krueger revolution (1994 Nobel):** Compared fast-food employment in New Jersey (minimum wage raised) and Pennsylvania (unchanged) using natural experiment. Found no employment decline — monopsony power in low-wage labor markets means employers had been paying below competitive wages.\n\n**Current consensus:** Moderate minimum wage increases appear to have small or negligible employment effects; very large increases (e.g., from $7.25 to $15 in low-wage regions) may reduce hours or employment at the margin. Effects are heterogeneous by local labor market conditions.\n\n**Education access as mobility ladder:**\n- Universal pre-K programs show strong long-run ROI (Perry Preschool: 7–12% return per dollar invested in reduced crime, higher earnings)\n- Community college completion rates remain low (~40% within 6 years); wraparound support (childcare, counseling) raises completion significantly\n- Student debt burden ($1.7T in US) disproportionately affects first-generation students who studied at lower-return programs\n\n**Healthcare costs as inequality driver:**\n- Medical bankruptcy accounts for roughly 60% of personal bankruptcies in the US\n- Countries with universal healthcare remove a major source of financial shock that can reset lifetime wealth accumulation to zero",
 highlight: ["minimum wage", "Card & Krueger", "monopsony", "pre-K ROI", "student debt", "healthcare costs"],
 },
 {
 type: "teach",
 title: "Universal Basic Income: Theory and Experiments",
 content:
 "**Universal Basic Income (UBI)** provides unconditional cash payments to all citizens (or all adults) regardless of employment status. It has attracted interest from both progressive (poverty reduction) and libertarian (replace bureaucratic welfare) perspectives.\n\n**Key real-world experiments:**\n\n**Finland (2017–2018):** 2,000 unemployed adults received 560/month unconditionally for 2 years. Results: modest increase in well-being and mental health; small positive effect on employment in the second year. Did not replace existing welfare.\n\n**Stockton SEED (2019–2021):** 125 residents received $500/month. Employment among recipients rose (from 28% to 40%); recipients spent primarily on food, utilities, and clothing; no significant reduction in work effort.\n\n**Criticism and challenges:**\n- **Cost:** A $1,000/month UBI to all 258M US adults = $3.1T/year (comparable to entire federal budget)\n- **Labor supply effects at scale:** Small pilots may not capture general equilibrium effects if broad adoption reduces work incentives\n- **Political economy:** Universal programs have broader support than means-tested programs but are far more expensive\n- **Targeting efficiency:** $1 of UBI reaches rich and poor alike; means-tested programs deliver more value per dollar to lowest-income households\n\n**Negative Income Tax (Milton Friedman):** A targeted variant — payments to those below a threshold, phased out as income rises — preserves work incentives while reducing administrative complexity.",
 highlight: ["UBI", "universal basic income", "Finland experiment", "Stockton SEED", "negative income tax", "means-tested"],
 },
 {
 type: "quiz-mc",
 question:
 "Card and Krueger's 1994 landmark study on minimum wages was methodologically significant because it:",
 options: [
 "Used a general equilibrium model to simulate the effect of minimum wages across the entire economy",
 "Exploited a natural experiment — a minimum wage increase in one state but not a neighboring state — to isolate the causal effect on employment",
 "Surveyed 10,000 workers before and after a federal minimum wage increase to track individual outcomes",
 "Developed the first supply-demand model showing that minimum wages above the market clearing rate reduce employment",
 ],
 correctIndex: 1,
 explanation:
 "Card and Krueger compared New Jersey (which raised its minimum wage) to neighboring Pennsylvania (which did not) — a difference-in-differences natural experiment. By comparing fast-food employment trends in two similar border regions, one affected and one not, they isolated the causal impact of the wage change. They found no employment decline, contradicting the standard competitive market prediction. This methodology — exploiting geographic variation for causal identification — became foundational in modern empirical economics and contributed to their 2021 Nobel Prize.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "A universal basic income of $1,000 per month paid to every US adult would cost approximately $300–400 billion per year.",
 correct: false,
 explanation:
 "False. The US has roughly 258 million adults. $1,000/month × 12 months × 258 million people = approximately $3.1 trillion per year — comparable to the entire federal discretionary and entitlement budget combined. This cost calculation is one of the central challenges in UBI design: universal programs are extremely expensive compared to means-tested alternatives that target lower-income households. Most UBI proposals address this through clawbacks, tax recapture, or replacing existing welfare programs (which reduces net cost but creates transition issues).",
 difficulty: 1,
 },
 ],
 },

 // Lesson 5: Investing in an Unequal World 
 {
 id: "wi-5",
 title: "Investing in an Unequal World",
 description:
 "Understand how wealth concentration shapes consumer spending patterns, and identify investment opportunities in luxury goods, financial services, affordable housing, and consumer staples",
 icon: "DollarSign",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Wealth Concentration and Consumer Spending",
 content:
 "Rising wealth concentration creates **bifurcated consumer markets** — a key structural theme for equity investors.\n\n**The spending curve:** High-income households spend a smaller *fraction* of income but hold a large *share* of total spending power. The top 20% of US households account for roughly 40% of consumer spending.\n\n**Implications for equity markets:**\n\n**Luxury goods outperformance:** Companies serving ultra-high-net-worth consumers have pricing power uncorrelated with economic cycles. LVMH, Hermès, and Brunello Cucinelli have grown revenues and margins through multiple recessions. Hermès Birkin bags appreciate faster than the S&P 500 in some periods.\n- **Investment thesis:** The addressable market for ultra-luxury expands with wealth concentration; aspirational luxury demand from emerging market middle class adds a second growth vector\n\n**K-shaped recoveries:** Post-2008 and post-COVID recoveries were sharply 'K-shaped' — high-income households recovered quickly (asset prices rebounded), while low-income workers faced prolonged unemployment. Companies serving the middle market faced persistent demand headwinds.\n\n**Consumer staples defensiveness:** Low-income households spend a higher proportion of income on food, utilities, and household goods — making consumer staples companies relatively recession-resistant even as middle-market discretionary spending contracts.",
 highlight: ["bifurcated markets", "luxury goods", "K-shaped recovery", "consumer staples", "pricing power"],
 },
 {
 type: "teach",
 title: "Financial Services Growth and Affordable Housing REITs",
 content:
 "**Financial services** benefit structurally from wealth concentration:\n\n**Asset management:** More wealth under management higher AUM fees, more advisory revenue. Global AUM reached $120T+ in 2023. Even a 1% management fee on growing global wealth pools generates compounding revenue.\n\n**Wealth management platforms** (Morgan Stanley Wealth Management, Charles Schwab, Goldman Sachs) have expanded high-net-worth client counts consistently. Private banking (clients >$10M) is the most profitable segment.\n\n**Alternative investment managers** (Blackstone, Apollo, KKR, Carlyle) raise capital from institutional and ultra-HNWI investors in illiquid strategies (private equity, credit, real assets) that command much higher fees than public market funds. These firms have been among the best-performing public equities over the past decade.\n\n**Affordable housing REITs and the housing gap:**\nWealth inequality is deeply connected to housing. The homeownership gap between white and Black households in the US (~30 percentage points) is larger today than in 1960.\n\n**Affordable housing REITs** (e.g., Equity LifeStyle Properties, NexPoint Residential) invest in workforce housing and manufactured housing communities. Investment thesis:\n- Low supply response (zoning constraints) creates persistent undersupply\n- Lower-income renters have fewer alternatives lower vacancy, stable cash flows\n- Government subsidy programs (Section 8, LIHTC) provide partial rent guarantees\n- Social impact alignment with ESG mandates attracts institutional capital\n\n**Risk:** Rent control legislation, regulatory changes, and local political risk are elevated for affordable housing operators.",
 highlight: ["asset management", "AUM", "wealth management", "alternative investment", "affordable housing REIT", "homeownership gap"],
 },
 {
 type: "quiz-mc",
 question:
 "An investor believes rising wealth concentration will persist for the next decade. Which portfolio tilt is MOST directly aligned with this thesis?",
 options: [
 "Overweight discount retailers and fast-casual restaurants that serve cost-conscious consumers",
 "Overweight ultra-luxury goods companies and alternative asset managers, which benefit from expanding high-net-worth spending and AUM growth",
 "Underweight all financials, as interest rates and credit quality are the dominant drivers",
 "Buy index funds — wealth concentration does not create differential sector returns",
 ],
 correctIndex: 1,
 explanation:
 "Rising wealth concentration directly benefits: (1) ultra-luxury goods companies, as the ultra-HNWI segment grows and wealthy consumers are less price-sensitive; and (2) alternative asset managers like Blackstone, Apollo, and KKR, whose revenue is tied to AUM — which grows as wealthy households and institutions increase allocations to private markets. Discount retailers may benefit from a squeezed middle class but don't have the same structural tailwind. Ignoring sector implications of structural trends would be a missed opportunity.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A REIT specializes in workforce housing apartments in sunbelt cities, targeting tenants earning 60–80% of area median income. Occupancy has been 97% for 5 consecutive years. Local governments have discussed, but not enacted, rent stabilization measures.",
 question: "What is the primary RISK factor an investor should monitor most carefully?",
 options: [
 "Rising interest rates increasing the REIT's borrowing costs and cap rate pressure",
 "Rent control or rent stabilization legislation, which could cap revenue growth despite high occupancy",
 "Competition from luxury apartment developers entering the affordable segment",
 "Tenant default risk, since lower-income renters have higher delinquency rates",
 ],
 correctIndex: 1,
 explanation:
 "For affordable and workforce housing REITs, regulatory risk — particularly rent control or stabilization legislation — is the most idiosyncratic risk. High occupancy actually underscores the tight supply and demand dynamics that make the asset class attractive, but it also signals affordability stress that can trigger political intervention. Luxury developers rarely enter the affordable segment due to different cost structures. While interest rate risk affects all REITs, the scenario explicitly highlights the regulatory threat that is most specific to this strategy. Tenant default risk is partially mitigated by Section 8 and LIHTC programs in many affordable housing REITs.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 6: Future Trends 
 {
 id: "wi-6",
 title: "Future Trends",
 description:
 "Analyze AI and labor displacement, platform monopolies, demographic aging, deglobalization, and likely policy responses shaping inequality over the coming decades",
 icon: "Zap",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "AI, Automation, and the Future of Work",
 content:
 "**Artificial intelligence** is widely expected to be the most transformative labor market technology since electrification. Economists debate the distributional consequences.\n\n**The displacement concern (Brynjolfsson & McAfee, 'The Second Machine Age'):**\n- AI and robotics now threaten cognitive tasks, not just physical ones\n- Large Language Models can draft contracts, write code, analyze financial statements, and interpret medical images\n- Up to 47% of US jobs have high automation probability according to Frey & Osborne (2013) — though many economists consider this estimate too high as it ignores task-level substitution vs whole-job automation\n\n**Countervailing forces:**\n- **Baumol's cost disease:** As AI drives down costs in routine tasks, labor-intensive services (care work, therapy, skilled trades, live entertainment) become *relatively* more valuable\n- **Productivity dividend:** If AI doubles labor productivity, society could work fewer hours with the same output — leisure vs income tradeoff\n- **New job creation:** Prior technology waves (PC, internet) destroyed some jobs but created more new categories\n\n**Distributional bias of AI:**\n- AI benefits flow disproportionately to capital owners and to high-skill workers who can leverage AI tools\n- Workers in automatable roles who lack retraining pathways face structural unemployment\n- Geographic concentration: AI-economy gains accrue to a small number of urban hubs (SF, NYC, London, Shenzhen), widening regional inequality\n\n**Key investment implication:** AI is simultaneously a productivity tool (benefiting companies broadly), a job displacer (reducing wage shares for affected workers), and a profit concentrator (winner-take-most platform dynamics).",
 highlight: ["AI displacement", "automation", "Baumol cost disease", "productivity dividend", "structural unemployment"],
 },
 {
 type: "teach",
 title: "Platform Monopolies and Demographic Aging",
 content:
 "**Platform monopolies** represent a novel form of inequality driver: wealth concentration through network effects rather than traditional capital accumulation.\n\n**Winner-take-most dynamics:** Digital platforms exhibit strong network effects (more users more valuable for each user) and near-zero marginal cost of adding users. This produces market structures where 1–2 firms capture 70–90% of market revenue (search, social media, e-commerce).\n\n**Wealth concentration through equity:** The founders and early investors of platform companies accumulate extraordinary wealth through equity appreciation rather than wage income. Zuckerberg, Bezos, and Musk became the world's wealthiest individuals largely through this mechanism — not the traditional capital accumulation that Piketty described.\n\n**Policy response:** Antitrust scrutiny has increased globally; EU Digital Markets Act (2022) designates large platforms as 'gatekeepers' with specific interoperability and non-preferencing obligations.\n\n**Demographic aging and inequality:**\n- Aging populations in developed countries increase the ratio of retirees to workers\n- Elderly households are, on average, wealthier than young households — demographic aging increases measured wealth inequality (more assets concentrated in older cohorts)\n- Pension sustainability concerns grow: declining worker/retiree ratios strain pay-as-you-go systems\n- **Asset price inflation:** Central bank low-rate policies boosted asset prices, benefiting older and wealthier asset holders while disadvantaging young renters and savers\n- **Intergenerational conflict:** Young workers pay taxes supporting elderly benefits while themselves facing precarious employment and unaffordable housing — a new axis of distributional tension",
 highlight: ["platform monopolies", "network effects", "winner-take-most", "demographic aging", "intergenerational conflict", "Digital Markets Act"],
 },
 {
 type: "teach",
 title: "Deglobalization and Policy Responses",
 content:
 "**Deglobalization** — the reversal of the post-1990 global integration trend — is reshaping the inequality outlook.\n\n**Drivers of deglobalization:**\n- COVID-19 supply chain fragility exposed risks of just-in-time global production\n- Geopolitical rivalry (US-China tech decoupling, semiconductor restrictions)\n- Industrial policy renaissance: US CHIPS Act, EU Green Deal, India's Production-Linked Incentive schemes\n- Rising nationalism and protectionist sentiment in democratic politics\n\n**Distributional effects of reshoring:**\n- Near-shoring and onshoring creates manufacturing jobs in developed countries — potentially reversing some SBTC-driven hollowing-out of middle-wage work\n- But automation absorbs much of the reshored production capacity, limiting job creation\n- Input cost inflation from less efficient sourcing flows through to consumer prices — a regressive tax (low-income households spend more of income on goods)\n\n**Emerging policy consensus:**\n- **Carbon pricing** can fund dividend payments to lower-income households (British Columbia's carbon tax dividend model)\n- **Predistribution** (improving pre-tax distribution via competition policy, wage boards, worker ownership) alongside redistribution\n- **Universal healthcare and childcare** as economic mobility enablers\n- **Sovereign wealth funds** pooling capital returns for broad citizen benefit (Norway's Government Pension Fund model)\n\n**Long-run outlook:** Most forecasters expect inequality to remain elevated but potentially stabilize as AI productivity gains are shared — if policy adapts. The historical record suggests technology alone does not determine distributional outcomes; institutions and policy choices are equally decisive.",
 highlight: ["deglobalization", "reshoring", "industrial policy", "carbon dividend", "predistribution", "sovereign wealth fund"],
 },
 {
 type: "quiz-mc",
 question:
 "Which of the following best describes why AI-driven productivity gains may not reduce wealth inequality without policy intervention?",
 options: [
 "AI reduces total economic output, leaving less to distribute",
 "AI benefits primarily accrue to capital owners and high-skill workers who leverage AI tools, while displaced workers lack equivalent retraining pathways",
 "AI raises wages for all workers by increasing average labor productivity across the economy",
 "Baumol's cost disease ensures that all automation gains are captured by service-sector workers",
 ],
 correctIndex: 1,
 explanation:
 "AI benefits are skewed: capital owners (shareholders of AI companies and firms adopting AI) capture margin expansion; high-skill workers who use AI to extend their output capture wage gains; automatable-role workers face displacement or wage pressure. Without redistribution mechanisms (wealth taxes, AI dividends, retraining programs) or labor market institutions (unions, wage floors), productivity gains from AI concentrate among those who already hold capital or scarce high-skill credentials. Baumol's cost disease predicts labor-intensive services become relatively more expensive — not that automation gains flow to service workers.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "Norway's Government Pension Fund model — where oil revenues are invested in a sovereign wealth fund paying dividends to citizens — represents an example of distributing capital returns broadly rather than concentrating them among private owners.",
 correct: true,
 explanation:
 "True. Norway's Government Pension Fund (the 'Oil Fund'), valued at over $1.6T, pools the returns from Norway's natural resource wealth into a state fund managed for the long-term benefit of all citizens. Annual returns fund a portion of the government budget, effectively distributing capital income broadly. This is a practical implementation of the idea that natural resource rents (and potentially AI-driven productivity gains) can be channeled through collective ownership structures to prevent private concentration — a counter-example to the Piketty r > g dynamic playing out in purely private markets.",
 difficulty: 2,
 },
 ],
 },
 ],
};
