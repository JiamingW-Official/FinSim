import type { Unit } from "./types";

export const UNIT_CORPORATE_GOVERNANCE: Unit = {
 id: "corporate-governance",
 title: "Corporate Governance",
 description:
 "Understand how board structure and shareholder rights protect and create investment value",
 icon: "Building2",
 color: "#6366F1",
 lessons: [
 // Lesson 1: Board Structure 
 {
 id: "cg-1",
 title: "Board Structure & Independence",
 description:
 "Learn how boards are composed, what committees do, and how structural choices affect accountability",
 icon: "Users",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Independent Directors & Board Committees",
 content:
 "The **board of directors** is elected by shareholders to oversee management on their behalf. Board quality is one of the primary determinants of long-run governance strength.\n\n**Independent directors** have no material relationship with the company — no current employment, no significant consulting fees, no family ties to management. NYSE and Nasdaq rules require a majority of board seats to be independent.\n\n**Inside directors** include the CEO and other executives who sit on the board. They bring operational depth but face conflicts — they are effectively reviewing their own performance.\n\nBoards delegate detailed oversight to three standing committees, each composed entirely of independent directors:\n\n**Audit Committee** — oversees financial reporting, internal controls, and the external auditor relationship. Must include at least one 'audit committee financial expert' per SEC rules. Failure here (e.g., Enron) can enable massive fraud.\n\n**Compensation Committee** — sets CEO and senior executive pay, designs incentive metrics, vesting schedules, and reviews pay-for-performance alignment.\n\n**Nominating/Governance Committee** — identifies director candidates, recommends board composition changes, and oversees governance policies including related-party transaction rules.",
 highlight: [
 "independent directors",
 "inside directors",
 "audit committee",
 "compensation committee",
 "nominating committee",
 "pay-for-performance",
 ],
 },
 {
 type: "teach",
 title: "Dual-Class Shares, Staggered Boards & Entrenchment Risk",
 content:
 "Two structural choices have an outsized impact on whether shareholders can hold boards accountable.\n\n**Classified (Staggered) Boards:**\nDirectors are divided into three classes, each serving three-year terms — only one-third stand for election annually. This means a dissident shareholder who wins a proxy fight still cannot replace a majority of directors for two full years. Staggered boards are strongly opposed by institutional investors as a management entrenchment tool. Many companies have **declassified** their boards following shareholder pressure.\n\n**Dual-Class Share Structures:**\nFounders retain super-voting shares (often 10:1 or 20:1 votes per share) while selling lower-vote shares to the public. Examples include Alphabet (Class A = 1 vote, Class B = 10 votes held by founders) and Meta, where Zuckerberg controls over 50% of voting power with roughly 13% economic ownership.\n\n*Trade-off:* founders can pursue long-term strategy without quarterly-earnings pressure, but shareholders have no recourse if the founder-CEO makes poor decisions.\n\n**Sunset clauses** are increasingly required by institutional investors — dual-class shares automatically convert to one-share-one-vote after a fixed period (e.g., 7 years) or a triggering event such as the founder's departure. The S&P 500 stopped adding new multi-class companies after 2017.\n\n**CEO Duality** — when the CEO also chairs the board — is a related concern. Major asset managers (BlackRock, Vanguard) routinely vote against combined roles because there is no independent check on the CEO's authority.",
 highlight: [
 "staggered board",
 "classified board",
 "dual class",
 "super-voting shares",
 "sunset clause",
 "CEO duality",
 "declassified",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A company has 12 directors organized in a 3-year classified (staggered) board. An activist investor wins a proxy fight at the annual meeting. How quickly can the activist replace a majority of the board?",
 options: [
 "It takes at least two annual meetings — winning one election only replaces 4 of 12 directors",
 "Immediately — winning a proxy fight gives the activist the right to replace all directors",
 "After one annual meeting — replacing 4 directors gives a relative majority",
 "After six months — the board must hold a special election following a proxy contest",
 ],
 correctIndex: 0,
 explanation:
 "With a 3-class staggered board, only 4 directors (one class) stand for election each year. Winning one annual meeting replaces 4 of 12 directors — not a majority. The activist must win a second consecutive annual election to replace another class, finally reaching 8 of 12 directors after two years. This delay is precisely why classified boards are considered a powerful entrenchment mechanism.",
 },
 {
 type: "quiz-tf",
 statement:
 "Dual-class share structures always harm long-run shareholder value because founders retain permanent control regardless of their performance.",
 correct: false,
 explanation:
 "False. The evidence is mixed. Dual-class structures can protect founders from short-term activist pressure and enable patient, long-horizon capital allocation — Alphabet and Berkshire Hathaway are cited examples. However, value can be destroyed when a controlling founder makes poor decisions and shareholders have no recourse. Most governance experts favor sunset clauses that convert dual-class shares to one-share-one-vote after a fixed term, balancing founder autonomy with eventual accountability.",
 },
 {
 type: "quiz-mc",
 question:
 "Which board committee is required by SEC rules to include at least one 'audit committee financial expert'?",
 options: [
 "The Audit Committee",
 "The Compensation Committee",
 "The Nominating/Governance Committee",
 "The Risk Committee",
 ],
 correctIndex: 0,
 explanation:
 "SEC rules implemented after Sarbanes-Oxley (2002) require listed companies to disclose whether the Audit Committee includes at least one member who qualifies as an 'audit committee financial expert' — someone with direct accounting/financial reporting experience. The Audit Committee's role in overseeing the external auditor and internal controls is the most technically demanding board function, making financial expertise a specific regulatory requirement.",
 },
 ],
 },

 // Lesson 2: Shareholder Rights 
 {
 id: "cg-2",
 title: "Shareholder Rights & Proxy Voting",
 description:
 "Explore proxy mechanics, shareholder proposals, activist campaigns, and anti-takeover defenses",
 icon: "Vote",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Proxy Voting & Shareholder Proposals",
 content:
 "**Proxy voting** allows shareholders who cannot attend the annual meeting to vote by submitting instructions to an intermediary. The mechanics carry enormous practical weight.\n\n**Institutional proxy process:**\nLarge asset managers (BlackRock, Vanguard, State Street) collectively own 20–25% of the S&P 500 and vote millions of shares annually. Many delegate vote analysis to proxy advisory firms — principally **ISS** (Institutional Shareholder Services) and **Glass Lewis** — whose recommendations can swing a contested vote by 15–25 percentage points.\n\n**Shareholder Proposals — SEC Rule 14a-8:**\nQualifying shareholders can force a vote on governance, environmental, or social matters by submitting a proposal for inclusion in the company's proxy statement. Requirements:\n- Own at least $2,000 of stock for at least one year\n- Submit the proposal at least 120 days before the proxy is mailed\n- Proposal must address proper governance or policy matters (not micromanage operations)\n\nCommon winning proposal topics include: declassifying the board, eliminating supermajority vote requirements, adopting majority voting for directors, and requiring independent board chairs.\n\n**Say-on-Pay:**\nUnder Dodd-Frank, public companies must hold advisory shareholder votes on executive compensation at least every three years (most hold annual votes). A failed vote below 50% support is a public embarrassment that triggers mandatory engagement with large shareholders and ISS scrutiny of individual directors.",
 highlight: [
 "proxy voting",
 "ISS",
 "Glass Lewis",
 "Rule 14a-8",
 "shareholder proposals",
 "say-on-pay",
 "proxy advisory",
 ],
 },
 {
 type: "teach",
 title: "Poison Pills, Golden Parachutes & Activist Investors",
 content:
 "**Rights Plans (Poison Pills)** are the most powerful anti-takeover defense. When a hostile bidder crosses a trigger threshold (typically 15–20% ownership), all other shareholders receive rights to buy new shares at a steep discount — massively diluting the acquirer's stake and making acquisition economically impossible without board approval.\n\nMost institutional investors oppose indefinite pills. A pill adopted with a 1-year sunset and put to shareholder vote is considered minimally acceptable; an indefinite pill adopted without shareholder ratification earns immediate ISS negative recommendations.\n\n**Golden Parachutes** are accelerated severance packages (cash, stock, benefits) payable to executives if they lose their jobs following a change of control. Critics argue they reward executives for being acquired rather than creating long-run value. Dodd-Frank requires a separate say-on-golden-parachute vote during M&A transactions.\n\n**Activist Investors** are hedge funds or other investors who accumulate a stake (often 5–15%) and publicly push for changes — strategic, operational, or governance. Prominent activists include Elliott Management, Carl Icahn, and ValueAct. Tactics include:\n- Public letter campaigns and 13D filings\n- Proxy contests to elect dissident directors\n- Demanding spin-offs, buybacks, or CEO changes\n\nResearch consistently shows that well-targeted activist campaigns produce short-run stock gains of 5–10% at announcement, though long-run outcomes are mixed.",
 highlight: [
 "poison pill",
 "rights plan",
 "trigger threshold",
 "golden parachute",
 "activist investor",
 "proxy contest",
 "13D filing",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "An activist hedge fund files a Schedule 13D disclosing a 9.5% stake in a retailer and demands two board seats. Which defensive measure would most effectively prevent the activist from winning the seats at the next annual meeting?",
 options: [
 "A classified board requiring the activist to win two consecutive annual elections to gain a majority",
 "A poison pill triggered at 10% ownership, which dilutes the activist's existing 9.5% stake",
 "Advance notice bylaws requiring director nominations 90 days before the annual meeting",
 "A supermajority requirement of 80% approval for all bylaw amendments",
 ],
 correctIndex: 0,
 explanation:
 "A classified (staggered) board is the most effective defense because it limits how many seats the activist can contest in one year. Even if the activist wins every seat up for election, they cannot achieve board majority until two annual meetings have passed. A poison pill triggers above 10%, so the activist at 9.5% is below the threshold. Advance notice bylaws create procedural hurdles but cannot prevent a vote once nomination requirements are met. A supermajority threshold for bylaw amendments is a separate defense that doesn't directly affect director elections.",
 },
 {
 type: "quiz-tf",
 statement:
 "A say-on-pay vote is legally binding — if shareholders vote against executive compensation, the board is legally required to reduce pay immediately.",
 correct: false,
 explanation:
 "False. Say-on-pay votes under Dodd-Frank Section 951 are advisory only — a negative vote does not legally compel any change to compensation. However, the practical consequences are significant: a failed vote below 50% triggers mandatory engagement with large shareholders, draws ISS downgrades for individual committee members, and increases the risk of directors losing re-election. In practice, most boards respond to failed say-on-pay votes by modifying future pay packages within one to two years.",
 },
 ],
 },

 // Lesson 3: Executive Compensation 
 {
 id: "cg-3",
 title: "Executive Compensation Design",
 description:
 "Understand pay-for-performance alignment, stock options vs RSUs, clawbacks, and CEO pay ratio controversies",
 icon: "DollarSign",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Pay-for-Performance: Options, RSUs & Incentive Structure",
 content:
 "Well-designed executive pay should align CEO interests with long-run shareholder wealth creation. In practice, the structure of incentives matters as much as the dollar amount.\n\n**Annual Cash Bonus:**\nTypically tied to a mix of revenue, EPS, and operating margin targets for the fiscal year. Risk: encourages short-term focus and can be gamed by choosing easy-to-hit metrics.\n\n**Stock Options:**\nGrant the right to buy shares at the grant-date price (strike price) for a fixed period (typically 10 years). Options only pay off if the stock rises above the strike — creating upside alignment. However:\n- They provide asymmetric incentives: executives benefit from upside but bear no downside risk beyond the option becoming worthless\n- They can incentivize excessive risk-taking (more volatility increases option value)\n- Backdating scandals (2000s) revealed widespread manipulation of grant dates\n\n**Restricted Stock Units (RSUs):**\nGrants of actual shares that vest over time (typically 3–4 years) based on a schedule or performance condition. Unlike options, RSUs retain value even if the stock falls modestly from grant date — better alignment for retention, less incentive to swing for the fences.\n\n**Performance Share Units (PSUs):**\nRSUs with a performance multiplier — the number of shares delivered depends on hitting multi-year goals (e.g., relative TSR vs. peers, 3-year EPS CAGR). Considered best practice because they tie equity delivery to measurable outperformance over a sustained period.",
 highlight: [
 "pay-for-performance",
 "stock options",
 "RSUs",
 "performance share units",
 "PSUs",
 "restricted stock units",
 "vesting",
 "backdating",
 ],
 },
 {
 type: "teach",
 title: "Clawback Provisions, CEO Pay Ratio & Peer Benchmarking Problems",
 content:
 "**Clawback Provisions** allow companies (or are required by the SEC) to recover previously paid compensation if it was based on misstated financials or the executive engaged in misconduct.\n\n*Pre-2022 clawback (Sarbanes-Oxley):* Applied only to CEO and CFO, only upon an accounting restatement caused by misconduct.\n\n*Dodd-Frank / SEC Rule 10D-1 (effective 2023):* Requires listed companies to adopt policies recovering incentive compensation from any current or former executive officer if the company issues a financial restatement — regardless of fault. This is a significant tightening: executives can have pay clawed back even if they had no personal involvement in the error.\n\n**CEO Pay Ratio:**\nSince 2018 (Dodd-Frank), public companies must disclose the ratio of CEO total compensation to median employee compensation. The average S&P 500 CEO pay ratio is approximately 300:1. Critics argue high ratios damage employee morale and signal excessive extraction; supporters argue it reflects global talent markets and CEO impact.\n\n**Peer Benchmarking Problems:**\nCompensation committees hire consultants to benchmark CEO pay against a peer group. Three structural problems:\n1. **Lake Wobegon effect**: every board wants to pay above the 50th percentile, mechanically ratcheting pay upward across the group\n2. **Peer group selection bias**: consultants and management often select peer groups with larger, higher-paying companies to justify above-market pay\n3. **Consultant conflicts**: the same firm that advises the compensation committee often sells other services to management, creating incentives to approve generous packages",
 highlight: [
 "clawback",
 "Dodd-Frank",
 "CEO pay ratio",
 "peer benchmarking",
 "Lake Wobegon effect",
 "compensation consultant",
 "restatement",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A company grants its CEO 200,000 stock options at a $50 strike price when shares trade at $50. Two years later shares trade at $42. What is the value of the CEO's options, and how does this compare to an RSU grant?",
 options: [
 "The options are worthless (underwater); RSUs granted at $50 would be worth $42 each — showing that RSUs retain more retention value",
 "The options are worth $8 each (intrinsic value = strike minus market price); RSUs would also be worthless",
 "The options are worth $50 each because the CEO retains the right to purchase at the original price; RSUs would be worth zero",
 "Both options and RSUs are worthless when the stock falls below the grant-date price",
 ],
 correctIndex: 0,
 explanation:
 "Stock options are 'underwater' when the market price falls below the strike price ($42 < $50 strike). Their intrinsic value is zero — the CEO would not exercise the right to buy at $50 when market price is $42. RSUs, however, are grants of actual shares: 200,000 RSUs granted at $50 are now worth $42 × 200,000 = $8.4 million, not zero. This illustrates why RSUs are considered better retention instruments — they retain value even in a down market — while options provide stronger upside alignment but zero downside retention when stocks fall.",
 },
 {
 type: "quiz-tf",
 statement:
 "The SEC's 2023 clawback rule under Dodd-Frank only requires pay recovery if the executive personally caused the financial restatement.",
 correct: false,
 explanation:
 "False. The SEC's final Rule 10D-1 (effective 2023) is a no-fault standard — companies must recover erroneously awarded incentive compensation from current and former executive officers whenever a financial restatement occurs, regardless of whether any individual executive was responsible for the error. This is a significant expansion from the Sarbanes-Oxley clawback, which required evidence of misconduct by the CEO or CFO. The no-fault standard ensures incentive pay is grounded in accurate results, not just innocent of fraud.",
 },
 {
 type: "quiz-mc",
 question:
 "A compensation consultant recommends benchmarking the CEO's pay against a peer group of 20 companies. Management suggests replacing 5 companies in the peer group with larger competitors. What governance concern does this raise?",
 options: [
 "Peer group selection bias — choosing larger, higher-paying peers inflates the benchmark and ratchets CEO pay upward without reflecting the company's actual competitive market",
 "The peer group is too small — SEC rules require at least 50 peer companies for a statistically valid benchmark",
 "Including direct competitors creates antitrust concerns about exchanging compensation information",
 "Peer benchmarking is not permitted under Dodd-Frank for companies with more than $1 billion in revenue",
 ],
 correctIndex: 0,
 explanation:
 "Peer group selection bias is a well-documented governance problem. When management advocates for substituting larger, higher-paying companies into the benchmark, the median pay level of the peer group rises — allowing the compensation committee to justify above-market CEO pay as merely 'matching the peer median.' Combined with every peer company doing the same, this creates the 'Lake Wobegon effect': every CEO is paid above the 50th percentile of a continuously inflating benchmark, mechanically ratcheting up pay across the entire market.",
 },
 ],
 },

 // Lesson 4: Governance & Investment Returns 
 {
 id: "cg-4",
 title: "Governance & Investment Returns",
 description:
 "Examine G-scores, governance failures, activist value creation, and how governance quality is priced by the market",
 icon: "TrendingUp",
 xpReward: 100,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "G-Scores, ISS QualityScore & Governance Ratings",
 content:
 "Investors increasingly use quantitative governance scores to screen investments and engage with companies.\n\n**ISS QualityScore (formerly CGQ):**\nISS's flagship governance rating system scores companies across four pillars — Board Structure, Compensation, Shareholder Rights, and Audit/Risk Oversight — generating a 1–10 decile score. A score of 1 indicates highest governance risk (bottom decile); 10 indicates lowest risk. The score is used by institutional investors to:\n- Identify red-flag companies before voting season\n- Guide vote recommendations for directors and pay packages\n- Inform engagement priorities for stewardship teams\n\n**MSCI ESG Governance Pillar:**\nThe 'G' in ESG ratings evaluates board composition, ownership structure, accounting practices, and business ethics. MSCI's governance score feeds into the overall ESG rating used by ESG funds and index providers.\n\n**Academic evidence on governance and returns:**\nGompers, Ishii & Metrick (2003) constructed the **G-index** from 24 governance provisions (entrenchment measures). A portfolio of firms with the fewest anti-shareholder provisions outperformed firms with the most by approximately 8.5% per year in the 1990s. More recent studies show weaker but still positive effects, suggesting governance premiums are partly priced-in as institutional investor focus has grown.\n\nThe key implication: governance quality is a systematic risk factor — companies with weak governance face higher discount rates (cost of equity) reflecting the risk of management expropriation of shareholder value.",
 highlight: [
 "ISS QualityScore",
 "G-index",
 "governance pillar",
 "ESG",
 "Gompers Ishii Metrick",
 "cost of equity",
 "entrenchment",
 ],
 },
 {
 type: "teach",
 title: "Governance Failures: Enron & Wirecard",
 content:
 "Studying governance failures reveals exactly which oversight mechanisms broke down and how investors were harmed.\n\n**Enron (2001):**\nOnce America's seventh-largest company, Enron collapsed in weeks when its use of special-purpose entities (SPEs) to hide $1 billion in debt was exposed. Governance failures:\n- **Board**: directors waived the company's code of ethics — twice — to allow CFO Andrew Fastow to personally profit from the SPEs\n- **Audit Committee**: approved complex off-balance-sheet structures without adequate scrutiny\n- **Auditor (Arthur Andersen)**: earned consulting fees from Enron — a massive conflict of interest that compromised audit independence\n- **Outcome**: $74 billion in shareholder value destroyed, 20,000 jobs lost, Arthur Andersen dissolved, Sarbanes-Oxley Act passed\n\n**Wirecard (2020):**\nGermany's largest fintech and DAX-30 member collapsed after auditor EY discovered that 1.9 billion in cash supposedly held in trust accounts in the Philippines did not exist.\n- **Board**: supervisory board failed to question implausibly high margins in a low-margin payments processing business\n- **Auditor (EY)**: signed off on financial statements for 10 years without independently verifying the trust account balances\n- **Regulator (BaFin)**: investigated short-sellers publishing fraud allegations rather than the company itself — a fundamental governance failure\n- **Outcome**: DAX-30 member filed for insolvency within weeks; 12 billion in market value erased\n\n**Common pattern**: both cases featured captured boards, conflicted auditors, complex financial structures, and regulators who failed to act on warning signs.",
 highlight: [
 "Enron",
 "Wirecard",
 "special-purpose entities",
 "Arthur Andersen",
 "EY",
 "audit independence",
 "Sarbanes-Oxley",
 "BaFin",
 ],
 },
 {
 type: "teach",
 title: "Activist Campaigns & Value Creation",
 content:
 "Shareholder activism is one of the most debated mechanisms for improving governance and generating investment returns.\n\n**How activists create value:**\n1. **Operational improvement**: cost reduction, margin improvement, asset divestitures\n2. **Strategic restructuring**: spin-offs, break-ups of conglomerates trading at a 'sum-of-the-parts' discount\n3. **Capital allocation**: demanding buybacks, dividend increases, or leverage reduction\n4. **Governance reform**: replacing underperforming directors, splitting CEO/chair roles, adopting majority voting\n\n**Short-run returns:**\nEvent studies consistently find announcement returns of 5–10% when a 13D activist filing is disclosed — the market prices in the expected value of governance improvement immediately.\n\n**Long-run returns:**\nMore contested. Studies by Brav, Jiang, Partnoy & Thomas (2008) found positive long-run returns of ~7% over five years. Critics argue some campaigns focus on short-term extraction (buybacks, leverage) at the expense of long-term R&D and employee investment.\n\n**Notable examples:**\n- **Nelson Peltz at Procter & Gamble (2017)**: pushed for organizational restructuring; Peltz won a board seat by 43,000 votes out of ~2 billion cast — one of the narrowest proxy fights ever. PG's stock outperformed peers over the following three years.\n- **Elliott Management at AT&T (2019)**: pushed for asset sales and operational efficiency; AT&T eventually spun off WarnerMedia and sold DirecTV.\n\n**The ESG governance pillar**: institutional investors increasingly consider governance quality as a filter before investing. A company with a weak governance structure — classified board, dual-class shares, misaligned pay — faces a higher cost of equity as investors demand compensation for governance risk.",
 highlight: [
 "activist campaign",
 "13D filing",
 "sum-of-the-parts",
 "proxy fight",
 "Nelson Peltz",
 "Elliott Management",
 "cost of equity",
 "ESG governance pillar",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "The Gompers, Ishii & Metrick (2003) G-index study found that companies with fewer anti-shareholder governance provisions generated higher returns. Which is the most accurate interpretation of this finding for a modern investor?",
 options: [
 "Governance quality was a significant return driver in the 1990s, but part of the premium may now be priced-in as institutional focus on governance has grown substantially",
 "Investors should always prefer companies with the fewest governance protections because entrenchment always destroys value",
 "The G-index is the most reliable predictor of future stock returns, superior to valuation multiples and earnings growth",
 "The study proved that ESG investing consistently generates alpha across all market cycles",
 ],
 correctIndex: 0,
 explanation:
 "The G-index study found a striking ~8.5% annual outperformance in the 1990s for good-governance firms. However, academic follow-up studies have found the effect weakening in later periods — consistent with the hypothesis that as governance became better understood and actively monitored by institutional investors, it became partially priced-in to equity valuations. The practical implication is that governance quality remains a relevant risk factor and helps avoid blow-ups (Enron, Wirecard), but should be used as a screen alongside valuation and fundamentals rather than treated as a standalone alpha source.",
 },
 {
 type: "quiz-tf",
 statement:
 "Wirecard's collapse was unusual because its auditor (EY) had flagged concerns about the missing 1.9 billion trust accounts in multiple prior years before the final fraud disclosure.",
 correct: false,
 explanation:
 "False. EY signed off on Wirecard's financial statements for approximately 10 consecutive years without independently verifying that the 1.9 billion in trust account balances at third-party custodians in the Philippines actually existed. This was a fundamental audit failure — independent confirmation of cash balances at third parties is one of the most basic audit procedures. The eventual discovery came only after Wirecard itself admitted it could not locate the funds and EY refused to sign the 2019 annual report. The case is a stark illustration of how auditor independence failures — EY earned significant fees from Wirecard — can allow frauds to persist for years.",
 },
 ],
 },
 ],
};
