import type { Unit } from "./types";

export const UNIT_CORPORATE_GOVERNANCE: Unit = {
  id: "corporate-governance",
  title: "Corporate Governance",
  description:
    "Understand board structure, shareholder rights, executive compensation, activist investing, and proxy battles",
  icon: "Building2",
  color: "#3b82f6",
  lessons: [
    // ─── Lesson 1: Board of Directors & Oversight ────────────────────────────────
    {
      id: "cg-1",
      title: "🏛️ Board of Directors & Oversight",
      description:
        "Learn how boards are composed, what committees do, and how director elections shape accountability",
      icon: "Users",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🧩 Board Composition: Independent vs Inside Directors",
          content:
            "The **board of directors** is elected by shareholders to oversee management on their behalf. Board quality is a primary determinant of governance strength.\n\n**Independent directors** have no material relationship with the company — no employment, no significant consulting fees, no family ties to management. Independence is defined by stock exchange rules (NYSE/Nasdaq) and further tightened by committee-specific requirements.\n\n**Inside directors** include the CEO, CFO, or other executives who sit on the board. They bring operational knowledge but face obvious conflicts — they are evaluating the performance of themselves and peers.\n\n**Best practice standards:**\n- Majority of board seats should be independent\n- Lead Independent Director role when CEO also chairs the board\n- Independent directors meet in executive sessions (without management) regularly\n\n**Director quality factors analysts assess:**\n- **Overboarding**: a director sitting on 5+ boards likely cannot devote adequate time\n- **Relevant expertise**: does the board have finance, technology, industry, and risk experts?\n- **Tenure**: very long-tenured directors (15+ years) may lose independence over time\n\nProxy advisory firms ISS and Glass Lewis track these metrics and adjust vote recommendations accordingly.",
          highlight: ["independent directors", "inside directors", "executive sessions", "overboarding", "ISS", "Glass Lewis"],
        },
        {
          type: "teach",
          title: "📋 Board Committees: Audit, Compensation & Nominating",
          content:
            "Boards delegate detailed oversight to three standing committees, each composed entirely of independent directors.\n\n**Audit Committee:**\n- Oversees financial reporting, internal controls, and external auditor relationship\n- Must include at least one 'audit committee financial expert' per SEC rules\n- Reviews earnings releases before publication and monitors legal/compliance risks\n- Failure here (e.g., Enron's audit committee) can enable massive fraud\n\n**Compensation Committee:**\n- Sets pay for the CEO and senior executives\n- Engages an independent compensation consultant (though conflicts exist when the same firm advises management)\n- Designs incentive plans: metrics, performance periods, vesting schedules\n- Increasing scrutiny on pay-for-performance alignment\n\n**Nominating/Governance Committee:**\n- Identifies and evaluates director candidates\n- Recommends board composition changes\n- Oversees governance policies (code of conduct, related-party transactions, board evaluation process)\n\n**Key principle:** Committee independence is critical because management has a direct financial interest in all three areas — financial reporting, their own pay, and who evaluates them.",
          highlight: ["audit committee", "compensation committee", "nominating committee", "audit committee financial expert", "pay-for-performance"],
        },
        {
          type: "teach",
          title: "⚖️ CEO Duality, Director Elections & Classified Boards",
          content:
            "**CEO Duality** — when the CEO also serves as board chair — is one of the most debated governance topics.\n\n*Arguments for separation:*\n- Separating roles creates genuine oversight — the chair can hold the CEO accountable\n- Independent chair signals board independence to investors\n- Major institutional investors (BlackRock, Vanguard) often vote against combined roles\n\n*Arguments for duality:*\n- Unified leadership reduces communication overhead and speeds decisions\n- Common in founder-led companies where the CEO has superior strategic knowledge\n\n**Director Election Standards:**\n- **Majority voting**: a director must receive more 'FOR' votes than 'WITHHOLD' votes to be elected. Failure to achieve majority = meaningful accountability mechanism\n- **Plurality voting**: director elected with most votes even if majority withholds — a director running unopposed with 1 FOR vote wins. Still common in contested elections\n\n**Classified (Staggered) Boards:**\n- Directors divided into 3 classes, each serving 3-year terms — only 1/3 up for election annually\n- Makes hostile takeovers and activist campaigns much harder (must win 2 elections over 2 years to gain majority)\n- Strongly opposed by institutional investors as entrenching management\n- Many companies have **declassified** boards following shareholder pressure\n\n**Say-on-Pay:**\nShareholders vote (advisory, not binding) on executive compensation at least every 3 years (most companies annually). A failed say-on-pay vote (<50% support) is a public embarrassment and triggers engagement.\n\n*Remember:* These governance mechanisms interact — a classified board with plurality voting creates very weak accountability.",
          highlight: ["CEO duality", "majority voting", "plurality voting", "classified board", "staggered board", "say-on-pay", "declassified"],
        },
        {
          type: "quiz-mc",
          question:
            "A company has 12 directors on a 3-year staggered (classified) board. How many directors are up for election each year?",
          options: [
            "4 — one-third of the board is elected each year under a classified structure",
            "12 — all directors are re-elected annually",
            "6 — half the board rotates every 18 months",
            "3 — only committee chairs stand for re-election annually",
          ],
          correctIndex: 0,
          explanation:
            "A classified (staggered) board divides directors into 3 equal classes. With 12 directors, each class has 4 directors, and only 1 class stands for election each year. This means a dissident shareholder cannot replace a majority of the board in a single annual meeting — they must win two consecutive elections over two years to gain control, which is the primary anti-takeover effect of a classified board.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A say-on-pay vote is legally binding — if shareholders vote against executive pay, the company must reduce compensation immediately.",
          correct: false,
          explanation:
            "False. Say-on-pay votes under Dodd-Frank Section 951 are advisory only — they do not legally require the company to change compensation. However, they carry significant practical weight: a failed vote (below 50% support) is a public signal of shareholder dissatisfaction that triggers mandatory engagement with major shareholders, attracts proxy advisor downgrades, and increases the risk of individual directors losing re-election. In practice, most boards respond to failed votes by modifying pay packages.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A large industrial company has its CEO serving as board chair, all three committees chaired by directors who have served over 18 years, and a classified board requiring 80% supermajority approval to declassify. ISS flags the company in its annual governance report.",
          question: "Which combination of governance weaknesses is ISS most likely citing?",
          options: [
            "CEO duality, long-tenured director independence concerns, and entrenchment through classified board + supermajority provision",
            "Excessive director compensation, too many independent directors, and lack of a lead independent director only",
            "Overboarding of committee chairs, insufficient audit expertise, and too-frequent say-on-pay votes",
            "Missing compensation consultant, no annual board evaluation, and failure to disclose sustainability metrics",
          ],
          correctIndex: 0,
          explanation:
            "ISS would flag all three structural entrenchment issues: (1) CEO duality concentrates power without independent oversight; (2) directors with 18+ years of service are considered non-independent by many governance frameworks due to the relationships formed over time; (3) a classified board plus a supermajority declassification requirement creates a double lock against shareholder efforts to reform governance. These are classic red flags in ISS's QualityScore methodology.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Shareholder Rights ────────────────────────────────────────────
    {
      id: "cg-2",
      title: "🗳️ Shareholder Rights",
      description:
        "Explore voting structures, proxy mechanics, shareholder proposals, and anti-takeover defenses",
      icon: "Vote",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🗂️ Voting Rights: One Share One Vote vs Dual Class",
          content:
            "**Voting rights** determine who controls a company's direction, even if they don't own the majority of economic value.\n\n**One Share, One Vote (OSOV):**\nThe default standard — each common share carries one vote. Economic ownership aligns with governance control. Preferred by institutional investors.\n\n**Dual-Class Share Structures:**\nFounders retain super-voting shares (often 10:1 or 20:1 votes per share) while selling lower-vote shares to the public.\n\n*Examples:*\n- **Alphabet (GOOGL)**: Class A (1 vote), Class B (10 votes, held by founders), Class C (0 votes)\n- **Meta**: Class A (1 vote), Class B (10 votes) — Zuckerberg controls >50% of voting power with ~13% economic ownership\n- **Berkshire Hathaway**: Class A (1 vote, ~$500K), Class B (1/10,000 vote, ~$330) — designed to let small investors participate without diluting Buffett's control\n\n**Governance implications:**\n- Founders can pursue long-term vision without quarterly shareholder pressure\n- BUT shareholders have no recourse if founder-CEO makes poor decisions\n- S&P 500 now excludes companies with multi-class structures from index additions (post-2017)\n\n**Sunset clauses:** increasingly required by institutional investors — dual-class shares automatically convert to OSOV after a fixed period (e.g., 7 years) or triggering event (founder leaves). Snap's IPO with **zero votes** for public shareholders represented an extreme that drew intense backlash.",
          highlight: ["dual class", "super-voting shares", "one share one vote", "sunset clause", "Alphabet", "Meta", "Berkshire"],
        },
        {
          type: "teach",
          title: "📬 Proxy Voting & Shareholder Proposals",
          content:
            "**Proxy voting** allows shareholders who cannot attend the annual meeting to vote by submitting a proxy card — effectively a voting instruction to an intermediary.\n\n**Institutional proxy process:**\n- Large asset managers (BlackRock, Vanguard, State Street) vote millions of shares annually\n- Many delegate vote analysis to proxy advisors ISS and Glass Lewis, whose recommendations carry enormous influence\n- 'Vote withholding' campaigns can signal board accountability failures\n\n**Shareholder Proposals — SEC Rule 14a-8:**\nQualifying shareholders can submit proposals to be included in the company's proxy statement if they:\n- Own at least $2,000 of stock (or 1% of shares) for at least 1 year\n- Submit the proposal at least 120 days before the proxy is mailed\n- Comply with content rules (proposal must be a proper governance/policy matter, not operational)\n\nCommon proposal types:\n- **Governance**: declassify the board, adopt majority voting, reduce supermajority thresholds\n- **Environmental/Social**: climate risk disclosure, pay equity reporting, political contribution disclosure\n- **Executive pay**: adopt clawback policy, link pay to ESG metrics\n\n**Advance Notice Bylaws:**\nCompanies can require shareholders to provide notice of director nominations 60–120 days before the annual meeting. These bylaws protect against surprise nominations but can be weaponized to make it procedurally impossible for activists to nominate directors.",
          highlight: ["proxy voting", "Rule 14a-8", "shareholder proposals", "proxy advisory", "advance notice bylaws", "ISS", "Glass Lewis"],
        },
        {
          type: "teach",
          title: "🛡️ Poison Pills & Anti-Takeover Defenses",
          content:
            "**Rights Plans (Poison Pills)** are the most powerful anti-takeover defense. When a hostile bidder crosses a trigger threshold (typically 15–20% ownership), all other shareholders receive the right to buy new shares at a steep discount — massively diluting the acquirer's stake.\n\n**How a flip-in poison pill works:**\n1. Board adopts a rights plan (no shareholder vote required)\n2. Rights are issued to all shareholders (except the triggering holder)\n3. If acquirer crosses the threshold (e.g., 15%), each right allows purchase of $100 worth of shares for $50\n4. Acquirer's stake dilutes from 15% toward ~8%–10% — making acquisition economically impossible\n\n**Key terms:**\n- **Trigger**: ownership percentage that activates rights (15–20% typical)\n- **Flip-in provision**: rights exercisable by all shareholders except acquirer\n- **Flip-over provision**: rights exercisable in target shares if merger occurs\n- **Sunset provision**: pill expires after 1–3 years unless renewed by shareholders\n\n**Institutional investor view:**\nMost large investors oppose indefinite pills. A pill adopted with a 1-year sunset and put to shareholder vote is considered 'shareholder-friendly.' Indefinite pills without shareholder ratification earn ISS negative recommendations.\n\n**Supermajority requirements:**\nRequiring 80% shareholder approval to amend bylaws, remove directors, or approve mergers gives incumbents strong veto power. Critics argue this entrenchment prevents shareholders from correcting governance failures.",
          highlight: ["poison pill", "rights plan", "flip-in provision", "trigger threshold", "dilution", "sunset provision", "supermajority"],
        },
        {
          type: "quiz-mc",
          question:
            "A company adopts a shareholder rights plan (poison pill) with a 15% trigger threshold. What does this provision prevent?",
          options: [
            "Any shareholder from accumulating more than 15% of shares without triggering massive dilution of their position",
            "The company from issuing new shares without a shareholder vote",
            "Directors from accepting compensation above 15% of their base salary as equity",
            "Hostile bidders from submitting proposals at the annual meeting",
          ],
          correctIndex: 0,
          explanation:
            "A poison pill with a 15% trigger means that once any single shareholder (other than approved parties) crosses 15% ownership, all other shareholders receive rights to purchase new shares at a discount, severely diluting the accumulating shareholder's economic and voting stake. This makes it prohibitively expensive to build a controlling position without board approval. The pill does not prevent someone from owning up to 14.9% — it just makes crossing the threshold extremely costly.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under SEC Rule 14a-8, any shareholder owning at least one share can submit a proposal to be included in the company's proxy statement.",
          correct: false,
          explanation:
            "False. Rule 14a-8 requires a minimum ownership threshold: the shareholder must own at least $2,000 worth of the company's securities (or 1% of shares) and must have held those securities continuously for at least one year before the proposal submission deadline. These requirements filter out proposals from very small shareholders while still allowing institutional and engaged retail investors to use the mechanism. The submission must also meet various procedural requirements including being submitted at least 120 days before the proxy mailing date.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "TechCorp went public five years ago with a dual-class structure: founders hold Class B shares with 10 votes each, comprising 12% of shares but 55% of voting power. A major institutional shareholder proposes converting all shares to one-share-one-vote. The founders oppose the measure.",
          question: "What is the likely outcome of this proposal, and why?",
          options: [
            "The proposal will fail — founders' 55% voting control means they can block any conversion regardless of other shareholders' wishes",
            "The proposal will pass — SEC regulations require all public companies to adopt OSOV within 5 years of IPO",
            "The proposal will pass — institutional shareholders always win when they form a coalition",
            "The proposal is invalid — shareholders cannot propose changes to share class structures under Rule 14a-8",
          ],
          correctIndex: 0,
          explanation:
            "With founders holding 55% of voting power, they can block any shareholder vote requiring a simple majority. Even if 100% of non-founder shareholders vote for OSOV conversion, the founders' votes alone defeat the measure. This is the core governance tension with dual-class structures — economic minorities can have governance majorities. The only path to conversion would be a voluntary decision by founders, a sunset clause in the charter (if one exists), or index exclusion pressure affecting valuation.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Executive Compensation ───────────────────────────────────────
    {
      id: "cg-3",
      title: "💰 Executive Compensation",
      description:
        "Decode pay structures, clawbacks, golden parachutes, and the pay-for-performance debate",
      icon: "DollarSign",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📦 Pay Components: Base, Bonus, LTI",
          content:
            "Executive compensation is designed (in theory) to align leadership incentives with shareholder value creation. Modern pay packages have four major components.\n\n**1. Base Salary:**\nFixed cash — typically a modest fraction of total pay for large-company CEOs. Benchmarked against peer groups.\n\n**2. Annual Cash Bonus:**\nTied to one-year financial or operational metrics (e.g., EPS, revenue growth, EBITDA, free cash flow). Typically structured with threshold/target/maximum payout levels.\n\n**3. Long-Term Incentives (LTI) — the largest component:**\n- **Restricted Stock Units (RSUs)**: shares vest over time (typically 3–4 years). Retains executives and aligns with stock price performance.\n- **Stock Options**: right to buy shares at a fixed price. Valuable only if stock rises — provides upside leverage but criticized for encouraging excessive risk-taking.\n- **Performance Share Units (PSUs)**: shares that vest based on achieving multi-year performance targets (TSR, EPS growth, ROIC). Most aligned with shareholder value.\n\n**4. Benefits & Perquisites:**\nPension plans (often supplemental/SERP for executives), deferred compensation, aircraft use, security, financial planning.\n\n**Pay mix evolution:**\nPre-2000: heavy options, light PSUs. Post-Enron and post-2008: shift toward PSUs and performance-conditioned LTI. Modern best practice: 50–60% of LTI in PSUs.",
          highlight: ["base salary", "annual bonus", "RSU", "stock options", "PSU", "performance share units", "long-term incentives"],
        },
        {
          type: "teach",
          title: "📊 Pay-for-Performance, CEO Pay Ratio & Clawbacks",
          content:
            "**Pay-for-Performance (P4P):**\nThe core question: does the CEO get paid more when the stock performs better, and less when it underperforms?\n\n- **Target Pay vs Realizable Pay**: target pay is what the board intended; realizable pay accounts for actual stock performance. If stock declines 30% but CEO earns only 5% less, P4P alignment is weak.\n- Analysts compare CEO compensation growth to TSR and peer comparisons.\n\n**CEO Pay Ratio (Dodd-Frank Section 953(b)):**\nPublic companies must disclose the ratio of CEO pay to **median employee** pay annually.\n- Median US S&P 500 ratio: approximately 350:1\n- High ratios attract proxy advisor scrutiny and sometimes shareholder votes\n- Critiques: median employee varies by industry, geography, and outsourcing decisions\n\n**Clawback Provisions:**\nAllow companies (or require, under regulations) to recover previously paid compensation if:\n- **Sarbanes-Oxley (SOX) 2002**: CEO/CFO must repay bonuses if financial results are restated due to misconduct\n- **Dodd-Frank 2010 / SEC Rule 10D-1 (2022)**: all executive officers must repay incentive pay based on erroneously reported financials — no misconduct required, purely mechanical\n- **Expanded clawbacks**: best-practice companies also include clawbacks for reputational harm, compliance failures, or risk-taking violations\n\n**Golden Parachutes:**\nChange-of-control provisions paying executives large lump sums upon acquisition. ISS opposes excessive parachutes (>3× base + bonus), excise tax gross-ups, and single-trigger provisions (triggered by deal alone, not termination).",
          highlight: ["pay-for-performance", "realizable pay", "CEO pay ratio", "Dodd-Frank", "clawback", "golden parachute", "SOX"],
        },
        {
          type: "teach",
          title: "🏛️ Compensation Committee Independence",
          content:
            "The compensation committee is responsible for one of the most significant governance functions — setting CEO pay without executive input.\n\n**Independence requirements:**\n- All members must be independent directors under exchange listing rules\n- Additional SEC rules under Dodd-Frank require assessment of whether committee members have relationships that could affect judgment\n\n**The compensation consultant problem:**\nCommittees hire independent consultants to benchmark pay. However:\n- The same consulting firm may also provide benefits consulting, HR services, or actuarial work to the company (generating much larger fees)\n- This creates a potential conflict — consultants may not challenge management's preferred pay levels\n- SEC now requires disclosure of whether the company's consultant is independent and any potential conflicts\n\n**Common pay abuses institutional investors flag:**\n- **Repricing options** after stock decline (rewarding failure)\n- **Changing performance metrics mid-cycle** when targets look unachievable\n- **Excessive peer benchmarking** — every company wants to be 'above median' → ratchets pay upward industry-wide (the Lake Wobegon effect)\n- **Short performance periods** — one-year metrics are easier to manipulate than three-year metrics\n\n**Best practice:** 3-year PSU performance periods, multiple metrics (financial + TSR vs peers), mandatory holding requirements after vesting, and robust clawback policies.",
          highlight: ["compensation committee", "independent consultant", "peer benchmarking", "Lake Wobegon effect", "repricing", "PSU performance period"],
        },
        {
          type: "quiz-mc",
          question:
            "A CEO receives 500,000 RSUs vesting equally over 4 years (125,000 per year). The stock is currently $20/share. What is the primary governance purpose of this vesting schedule?",
          options: [
            "Retention incentive — the CEO forfeits unvested shares if they leave, creating a financial cost to voluntary departure",
            "Tax minimization — spreading vesting over 4 years reduces the CEO's annual taxable income",
            "Dilution management — issuing shares gradually minimizes shareholder dilution in any single year",
            "Performance alignment — RSUs only vest if stock price exceeds $20 at each anniversary",
          ],
          correctIndex: 0,
          explanation:
            "The primary purpose of multi-year RSU vesting is retention — the CEO must remain employed to receive unvested tranches. Leaving before full vesting means forfeiting significant compensation (e.g., leaving after year 1 forfeits 375,000 RSUs worth $7.5M at $20/share). Unlike PSUs, standard RSUs vest solely based on tenure, not performance. While stock price appreciation does benefit the CEO (alignment), the vesting schedule's primary governance function is to reduce executive turnover risk, not to condition pay on performance.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under the SEC's Dodd-Frank clawback rule (Rule 10D-1), a company can only recover executive compensation if the executive engaged in fraud or misconduct that caused the financial restatement.",
          correct: false,
          explanation:
            "False. The SEC's Rule 10D-1 (effective 2023) implements a no-fault clawback standard — companies must recover incentive-based compensation from current or former executive officers whenever financial statements are restated, regardless of whether the executive engaged in any misconduct. The previous SOX clawback (Section 304) did require misconduct by the CEO or CFO, but the broader Dodd-Frank rule covers all executive officers and applies purely mechanically: if the restatement would have resulted in lower incentive pay, the excess must be recovered.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "RetailCo's compensation committee awarded the CEO a $5M cash bonus in 2024 based on hitting EBITDA targets. In early 2025, the company restates financials because of an accounting error (not fraud), revealing 2024 EBITDA was overstated. Under correct financials, the CEO would have earned only a $2M bonus.",
          question: "What happens under the SEC's Dodd-Frank clawback rule?",
          options: [
            "The company must recover $3M from the CEO — the difference between what was paid and what would have been paid under restated financials",
            "No recovery is required because the CEO did not commit fraud",
            "The board may choose to recover compensation at its discretion, but is not required to",
            "Recovery is limited to 50% of the excess payment under de minimis exceptions",
          ],
          correctIndex: 0,
          explanation:
            "Rule 10D-1's no-fault mechanism requires recovery of the full excess incentive compensation. The company must recover $3M ($5M paid – $2M earned under restated financials). The absence of fraud is irrelevant — the rule is triggered solely by the restatement. Listed companies must have a compliant clawback policy and apply it as written. Failure to enforce clawback policies can result in loss of stock exchange listing and SEC enforcement action.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Activist Investing ────────────────────────────────────────────
    {
      id: "cg-4",
      title: "⚔️ Activist Investing",
      description:
        "Understand how activist investors acquire stakes, run proxy contests, and force strategic change",
      icon: "Target",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🎯 Activist Strategies & 13D Filing",
          content:
            "**Activist investors** acquire meaningful stakes in companies they believe are undervalued due to poor strategy, inefficient operations, or weak governance, then push for changes to unlock that value.\n\n**Common activist demands:**\n- **Board seats**: gaining direct representation to influence strategy from inside\n- **Strategic alternatives**: sell the company, spin off divisions, pursue buybacks\n- **Cost cutting**: reduce overhead, shed underperforming segments, optimize capital allocation\n- **CEO replacement**: when activists conclude management is the core problem\n\n**The 13D Filing — market impact:**\nSection 13(d) of the Securities Exchange Act requires any person who acquires more than **5% of a public company's shares with activist intent** to file a Schedule 13D within 10 days.\n\n*Key details:*\n- Must disclose purpose (activist intent vs passive investment)\n- Must disclose identity of all group members\n- 10-day window creates a legal accumulation period (activists buy aggressively before filing)\n- Stock typically jumps 5–10% upon 13D filing as market prices in activism premium\n- Passive investors (no intent to influence) file the shorter 13G form\n\n**Notable case studies:**\n- **Peltz vs P&G (2017)**: Trian Fund sought one board seat; P&G spent $100M fighting it; Peltz ultimately won by 42,000 votes out of 2.6B cast\n- **Third Point vs Sony**: Dan Loeb pushed for entertainment division spin-off, eventually withdrawn after partial concessions\n- **ValueAct vs Microsoft**: quiet constructive engagement led to strategic shifts; Ballmer departed, Nadella's cloud pivot accelerated",
          highlight: ["13D filing", "5% threshold", "activist premium", "board seats", "strategic alternatives", "Trian", "Third Point", "ValueAct"],
        },
        {
          type: "teach",
          title: "🐺 Proxy Contests, Wolf Packs & Settlement Dynamics",
          content:
            "**Proxy Contest:**\nWhen an activist cannot achieve goals through private negotiation, they launch a **proxy fight** — soliciting shareholder votes to elect their own director nominees.\n\n*Short-slate contest:* nominating 1–3 directors rather than seeking full board control. Lower cost, less threatening to other shareholders, higher success rate.\n\n*Full board replacement:* rare, signals deep dysfunction. Requires winning multiple seats in one election.\n\n**Proxy fight economics:**\n- Running a contested election costs $10M–$50M+ for large-cap targets\n- Companies spend even more on defense (hiring investment banks, PR firms, proxy solicitors)\n- Both sides engage proxy advisory firms (ISS, Glass Lewis) — getting their recommendation is often decisive\n\n**Wolf Pack Strategy:**\nMultiple funds coordinate economic interest in a target while each staying below the 5% 13D disclosure threshold. By maintaining individual stakes of 4.9%, they collectively own 20%+ without triggering disclosure.\n\n*Regulatory concern:* SEC has attempted to narrow the 10-day filing window and capture 'groups' under securities law, but enforcement remains difficult.\n\n**Settlement Dynamics:**\nMost proxy contests settle before the annual meeting:\n- Company offers activist 1–3 board seats in exchange for withdrawal of the proxy fight and a standstill agreement (activist agrees not to acquire more shares or launch further campaigns for a period)\n- Standstill periods: typically 1–3 years\n- Settlements avoid costly proxy fights but activists must deliver on change promises or face shareholder and market criticism",
          highlight: ["proxy contest", "short-slate", "wolf pack", "13D threshold", "standstill agreement", "proxy advisory", "settlement"],
        },
        {
          type: "quiz-mc",
          question:
            "An activist fund acquires 6% of a company's stock and files a Schedule 13D disclosing an intent to seek board representation. What are the company's primary defensive options?",
          options: [
            "Adopt a poison pill to prevent further accumulation, engage in private dialogue to offer a board seat, and launch a shareholder outreach campaign to build support",
            "Immediately buy back the 6% stake from the activist at a premium to remove the threat",
            "File an SEC complaint to invalidate the 13D and force the activist to divest",
            "Issue new shares to dilute the activist's position without adopting a formal rights plan",
          ],
          correctIndex: 0,
          explanation:
            "Companies facing activist investors have a toolkit: (1) a poison pill can prevent the activist from crossing a higher threshold (e.g., 15%) without triggering dilution, buying time; (2) private engagement may lead to a settlement — offering 1 board seat often resolves the campaign without a costly proxy fight; (3) shareholder outreach educates investors on management's strategy and builds support against activist nominees. Buying back the activist's stake at a premium ('greenmail') is now rare and widely criticized. Issuing shares without a rights plan may not have board authorization and could trigger litigation.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "A Schedule 13D must be filed within 10 days of crossing the 5% ownership threshold, which means activists can continue buying shares during that 10-day window without disclosure.",
          correct: true,
          explanation:
            "True. Under current SEC rules, a 13D filer has 10 calendar days after crossing the 5% threshold to make the public filing. During this window, activists can — and do — continue accumulating shares, often building from 5% to 8–10%+ before the market learns of the position. This 'front-running window' is a deliberate strategy to maximize the stake at pre-disclosure prices. The SEC has proposed shortening this window to 5 days and requiring earlier disclosure of derivative positions, but as of 2024 the 10-day window remains in place with some amendments.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Activist fund Apex Capital discloses a 7.5% stake in MidCorp via Schedule 13D, demanding 2 board seats and a strategic review. MidCorp's board rejects the demand. Apex announces a proxy contest nominating 4 directors for the upcoming annual meeting. ISS reviews both slates.",
          question: "What factors will ISS most heavily weigh when deciding whether to recommend Apex's nominees?",
          options: [
            "MidCorp's historical TSR vs peers, the qualifications of Apex's nominees vs incumbents, and whether the board has been responsive to prior shareholder concerns",
            "Apex's fund performance history and whether it has previously won proxy contests at other companies",
            "MidCorp's current stock price vs its 52-week high and its debt-to-equity ratio",
            "The size of Apex's stake and how long it has been held",
          ],
          correctIndex: 0,
          explanation:
            "ISS evaluates proxy contests primarily on: (1) the company's TSR performance relative to peers over 1, 3, and 5 years — prolonged underperformance strengthens the activist's case; (2) nominee quality — are the activist's nominees more qualified or experienced than the incumbents they would replace?; (3) board responsiveness — has management engaged shareholders and addressed legitimate concerns, or stonewalled them? ISS also considers whether the activist's stated strategy is credible. A company with strong relative TSR and a well-qualified incumbent slate is more likely to receive ISS support against the activist.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: Governance Ratings & Best Practices ───────────────────────────
    {
      id: "cg-5",
      title: "📊 Governance Ratings & Best Practices",
      description:
        "Understand ISS/Glass Lewis scoring, ESG governance factors, and the governance premium in valuations",
      icon: "Award",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🏆 ISS & Glass Lewis: Proxy Advisory Power",
          content:
            "**Institutional Shareholder Services (ISS)** and **Glass Lewis** are the two dominant proxy advisory firms, together influencing votes on trillions of dollars of equity annually.\n\n**ISS QualityScore:**\nISS rates companies on a 1–10 scale (1 = best governance, 10 = worst) across four pillars:\n1. **Board structure**: independence, diversity, committee composition\n2. **Compensation**: pay-for-performance alignment, problematic pay practices\n3. **Shareholder rights**: anti-takeover devices, voting structure, poison pills\n4. **Audit**: auditor tenure, fees, financial reporting quality\n\nTier 1 (scores 1–3) = strong governance; Tier 4 (scores 8–10) = significant concerns.\n\n**Institutional vote impact:**\n- Passive managers (BlackRock, Vanguard, State Street — 'the Big Three') control 20%+ of S&P 500 votes\n- Many smaller institutions follow ISS/Glass Lewis recommendations by default\n- An ISS 'WITHHOLD' recommendation on a director typically costs 15–25% of that director's votes\n- A failed say-on-pay (ISS against + <50% support) triggers mandatory shareholder engagement\n\n**Glass Lewis differences:**\n- Generally more conservative on director independence than ISS\n- Different peer group methodology for pay benchmarking\n- Strong focus on audit quality and risk oversight\n\n**Criticism of proxy advisors:**\n- Potential conflicts (ISS provides consulting to companies it rates)\n- One-size-fits-all policies may not fit diverse business models\n- SEC now requires proxy advisors to disclose conflicts and allow company review before publication",
          highlight: ["ISS QualityScore", "Glass Lewis", "proxy advisory", "withhold recommendation", "Big Three", "say-on-pay", "tier 1", "tier 4"],
        },
        {
          type: "teach",
          title: "🌍 ESG Governance & Dual-Class Sunset Clauses",
          content:
            "**ESG Governance Dimension:**\nGovernance ('G') is the original ESG pillar — investors have analyzed it since the 1990s. Modern ESG governance expands to include:\n\n**Board diversity:**\n- Gender diversity: California law requires women on public company boards; Nasdaq requires disclosure of gender and racial diversity or explanation\n- Ethnic/racial diversity: increasing institutional investor requirements (BlackRock's 'Vote No' campaigns against non-diverse boards)\n- Skills matrix disclosure: mapping directors' expertise to strategic needs\n\n**Sustainability oversight:**\n- Does the board have a dedicated sustainability committee or assigned director?\n- Are ESG metrics tied to executive compensation (common in energy/materials companies)?\n- Climate risk disclosure: TCFD framework, SEC climate disclosure rules\n\n**Dual-Class Recapitalization — sunset mechanics:**\nWhen founders add super-voting shares (or go public with dual-class):\n- **Time-based sunset**: Class B converts to Class A automatically after 7–10 years\n- **Ownership-based sunset**: if founders' combined stake falls below a threshold (e.g., 15%), supervoting rights lapse\n- **Event-based sunset**: death or permanent disability of the founder\n\nWithout sunset clauses, dual-class structures become permanent even after founders leave management. Lyft, Zoom, and Palantir all adopted sunset provisions; Snap notably did not.\n\n**Cross-listing governance arbitrage:**\nSome companies list in jurisdictions with weaker shareholder protection (certain Asian exchanges, Cayman Islands) to avoid governance requirements. Investors typically apply a **governance discount** to such companies.",
          highlight: ["board diversity", "sustainability oversight", "TCFD", "dual-class sunset", "governance discount", "cross-listing arbitrage"],
        },
        {
          type: "teach",
          title: "📈 The Governance Premium: Does Good Governance Pay?",
          content:
            "Academic research has repeatedly shown a **governance premium** — companies with stronger governance structures deliver superior risk-adjusted returns over time.\n\n**Key research findings:**\n- **Gompers, Ishii & Metrick (2003)**: a portfolio of companies with strong shareholder rights outperformed those with weak rights by 8.5% per year over 1990–1999\n- **Bebchuk, Cohen & Ferrell (2009)**: an Entrenchment Index (6 provisions: staggered board, supermajority requirements, etc.) negatively predicts returns — more entrenched firms underperform\n- **ISS QualityScore data**: Tier 1 companies (best governance) show lower cost of capital and higher valuation multiples vs Tier 4\n\n**Mechanisms of the governance premium:**\n1. **Lower cost of capital**: investors demand less risk premium when governance is strong (better oversight reduces tail risks)\n2. **Better capital allocation**: independent boards are more likely to reject value-destroying acquisitions or empire-building\n3. **Reduced agency costs**: strong governance limits management self-dealing, perquisites, and entrenchment\n4. **M&A outcomes**: well-governed acquirers show better post-acquisition returns\n\n**Important caveats:**\n- Correlation vs causation — well-run companies may adopt good governance and also perform well for unrelated reasons\n- Governance matters more in some industries (financial services, capital-intensive) than others (capital-light tech)\n- Point-in-time governance ratings may not capture dynamic governance quality\n\n**Russell 1000 governance by sector:** Financial and energy companies tend to have weaker governance scores on average; healthcare and tech vary widely based on founder control structures.",
          highlight: ["governance premium", "entrenchment index", "cost of capital", "agency costs", "Gompers Ishii Metrick", "QualityScore"],
        },
        {
          type: "quiz-mc",
          question:
            "A company receives an ISS QualityScore of 1 (Tier 1) vs a peer that receives a score of 9 (Tier 4). What does this indicate about the two companies?",
          options: [
            "The Tier 1 company has strong governance across board structure, compensation, shareholder rights, and audit quality, while the Tier 4 company has significant governance concerns in one or more of these areas",
            "The Tier 1 company has the highest stock price among its peers, while the Tier 4 company has underperformed its sector index",
            "The Tier 1 company is more profitable and has higher revenue growth than the Tier 4 company",
            "The Tier 1 company has never faced an activist campaign, while the Tier 4 company has been targeted multiple times",
          ],
          correctIndex: 0,
          explanation:
            "ISS QualityScore is purely a governance quality measure, not a financial performance metric. A score of 1 (best) indicates strong governance across ISS's four pillars: board structure (independence, diversity, committee quality), compensation (pay-for-performance alignment, absence of problematic practices), shareholder rights (limited anti-takeover defenses, fair voting structures), and audit (auditor independence, quality of financial reporting). A score of 9–10 flags serious concerns in one or more pillars. QualityScore does not directly measure stock performance, profitability, or activist history, though poor governance often correlates with worse outcomes over time.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Academic research consistently shows that companies with stronger shareholder rights and fewer anti-takeover provisions generate higher long-term returns, though the causal direction of this relationship remains debated.",
          correct: true,
          explanation:
            "True. Multiple academic studies — including the landmark Gompers, Ishii & Metrick (2003) paper using a 'G-Index' of governance provisions, and Bebchuk, Cohen & Ferrell's Entrenchment Index research — document a positive relationship between shareholder rights and stock returns. However, researchers debate causation: does good governance cause better performance, or do well-managed companies simply adopt better governance practices? Despite this debate, the empirical evidence is strong enough that institutional investors systematically incorporate governance quality into valuation frameworks and ownership decisions.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "GlobalTech Corp. went public 12 years ago with a dual-class structure (founders hold 10:1 voting shares). The founders now own 8% of economic shares but 47% of votes. There is no sunset clause in the charter. The company's TSR has lagged its sector index by 4% annually for the past 5 years. ISS issues a 'WITHHOLD' recommendation on all three directors up for re-election this year.",
          question: "Which combination of governance factors is most likely driving the ISS withhold recommendation?",
          options: [
            "Persistent TSR underperformance, permanent dual-class entrenchment without a sunset clause, and likely poor ISS QualityScore on shareholder rights pillar",
            "The company's failure to disclose CEO pay ratio and inadequate board diversity disclosures only",
            "The dual-class structure alone — ISS always withholds on companies with dual-class shares regardless of performance",
            "ISS concerns that the 8% economic ownership is too low for founders to have sufficient skin in the game",
          ],
          correctIndex: 0,
          explanation:
            "ISS 'WITHHOLD' recommendations are typically driven by a combination of factors: (1) persistent TSR underperformance (5 years of 4% annual lag vs peers is a significant red flag that ISS will note explicitly); (2) a dual-class structure with no sunset clause after 12 years — founders' 47% voting control with only 8% economic stake represents extreme governance entrenchment, and the absence of any path to OSOV conversion fails ISS's shareholder rights standards; (3) these together likely put the company in Tier 4 on shareholder rights. ISS does not apply a blanket withhold on all dual-class companies — context, performance, and responsiveness matter.",
          difficulty: 3,
        },
      ],
    },
  ],
};
