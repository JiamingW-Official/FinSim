import type { Unit } from "./types";

export const UNIT_SECURITIES_LAW: Unit = {
  id: "securities-law",
  title: "Securities Law & Investor Protection",
  description:
    "Master the legal framework protecting investors — from the 1933 Act to insider trading rules, fiduciary duties, market manipulation prohibitions, and SIPC insurance",
  icon: "Scale",
  color: "#7c3aed",
  lessons: [
    // ─── Lesson 1: Securities Act of 1933 ──────────────────────────────────────
    {
      id: "seclaw-1",
      title: "Securities Act of 1933",
      description:
        "Registration requirements for new securities, prospectus rules, exemptions under Reg D/A/CF, and the accredited investor definition",
      icon: "FileText",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Truth in Securities Law",
          content:
            "The Securities Act of 1933 was enacted after the 1929 stock market crash to restore investor confidence. Its core philosophy: **full disclosure before you sell.**\n\n**Primary Market Focus**\nThe 1933 Act governs the *issuance* of new securities — IPOs, follow-on offerings, and debt issuances. It does not regulate secondary market trading (that is the 1934 Act).\n\n**Registration Statement**\nBefore selling securities to the public, an issuer must file a registration statement with the SEC containing:\n- **Part I — Prospectus:** Delivered to investors. Must disclose the business, financial statements, risk factors, management backgrounds, and use of proceeds.\n- **Part II — Supplemental Information:** Filed with the SEC but not required to be delivered to investors.\n\nThe SEC reviews the statement for completeness, not investment merit. A 20-day waiting period (the 'quiet period') follows filing, after which the issuer may close sales.\n\n**Strict Liability Under Section 11**\nIf the registration statement contains a material misstatement or omission, investors can sue the issuer, directors, underwriters, and accountants — without proving the defendant knew of the falsehood. This strict liability rule makes disclosure lawyers and auditors extremely careful.\n\n**Antifraud: Section 17(a)**\nAlso prohibits fraud in the *sale* of securities, covering misrepresentations and schemes to defraud in any securities offering.",
          highlight: [
            "Securities Act of 1933",
            "registration statement",
            "prospectus",
            "Section 11",
            "Section 17(a)",
            "primary market",
          ],
        },
        {
          type: "teach",
          title: "Exemptions: Reg D, Reg A+, and Reg CF",
          content:
            "Most capital raises are exempt from full SEC registration. The major exemptions:\n\n**Regulation D — Private Placements**\n- **Rule 504:** Raise up to $10M in any 12-month period; no limit on investor type in most states.\n- **Rule 506(b):** Raise unlimited capital from up to 35 non-accredited but sophisticated investors and unlimited accredited investors; *no general solicitation*.\n- **Rule 506(c):** Raise unlimited capital; *general solicitation allowed*; but ALL purchasers must be verified accredited investors.\n- Issuers file a simple Form D notice with the SEC within 15 days of first sale.\n\n**Regulation A+ — Mini-IPO**\n- **Tier 1:** Up to $20M/year; state securities law still applies.\n- **Tier 2:** Up to $75M/year; preempts state law; audited financials required; ongoing reporting obligations.\n- Open to non-accredited retail investors — effectively a lighter-touch public offering.\n\n**Regulation CF — Equity Crowdfunding**\n- Created by the JOBS Act (2012), effective 2016.\n- Raise up to $5M per year from any investors (including retail) via an SEC-registered funding portal or broker-dealer.\n- Individual investment limits based on income and net worth.\n\n**Accredited Investor Definition (Rule 501)**\n- Natural person: Net worth > $1M (excluding primary residence) OR income > $200K ($300K joint) for 2+ years with expectation of same.\n- Also: licensed professionals (Series 7/65/82), knowledgeable employees of private funds, and certain entities with $5M+ in assets.",
          highlight: [
            "Reg D",
            "Rule 506(b)",
            "Rule 506(c)",
            "Reg A+",
            "Reg CF",
            "accredited investor",
            "JOBS Act",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A startup wants to raise $50M from 500 retail (non-accredited) investors via its website with broad advertising. Which exemption framework is most appropriate?",
          options: [
            "Reg D Rule 506(c) — allows general solicitation and unlimited raises",
            "Reg A+ Tier 2 — up to $75M/year, open to non-accredited investors, preempts state law",
            "Reg CF — designed for crowdfunding from retail investors via registered portals",
            "Reg D Rule 506(b) — allows up to 35 non-accredited investors without general solicitation",
          ],
          correctIndex: 1,
          explanation:
            "Reg A+ Tier 2 is designed for this scenario: raises up to $75M per year from retail investors (no accredited-only restriction), with the ability to broadly market the offering. Reg CF caps at $5M and requires a registered portal. Reg D 506(c) requires all purchasers to be verified accredited investors. Reg D 506(b) prohibits general solicitation and allows only 35 non-accredited investors.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under Section 11 of the Securities Act of 1933, an investor suing over a material misstatement in a registration statement must prove that the defendant intended to deceive them.",
          correct: false,
          explanation:
            "False. Section 11 imposes near-strict liability — the plaintiff does not need to prove intent (scienter). They need only show the registration statement contained a material misstatement or omission and that they suffered a loss. The burden shifts to defendants, who must prove due diligence, no loss causation, or that the investor knew of the misstatement. This is a much lower bar for plaintiffs than typical fraud claims.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Acme Corp is a private company raising $3M in equity. The founder wants to email 600 of her LinkedIn contacts (mostly retail professionals, mix of accredited and non-accredited) with an investment pitch deck.",
          question:
            "Which statement best describes the compliance risk of this approach under Reg D?",
          options: [
            "No risk — private companies can always solicit investments from personal contacts without registration",
            "Under 506(b), general solicitation to 600 contacts would disqualify the exemption; she should qualify investors first or use 506(c) with accredited-only buyers",
            "Under 506(c), she can solicit freely as long as she verifies accredited status before accepting money, with no limit on non-accredited investors",
            "She must file a full registration statement since the offer involves more than 500 investors",
          ],
          correctIndex: 1,
          explanation:
            "Rule 506(b) prohibits general solicitation — emailing 600 contacts would likely constitute general solicitation and destroy the 506(b) exemption. If she wants to use Reg D, she could either: (a) use 506(b) but only reach out to investors with whom she has a substantive pre-existing relationship, limiting non-accredited investors to 35; or (b) switch to 506(c), which allows general solicitation but requires all purchasers to be verified accredited investors. The 500-investor threshold relates to the Exchange Act reporting trigger, not registration.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Securities Exchange Act of 1934 ─────────────────────────────
    {
      id: "seclaw-2",
      title: "Securities Exchange Act of 1934",
      description:
        "SEC creation, ongoing reporting obligations (10-K/10-Q/8-K), insider trading prohibition under Rule 10b-5, and proxy rules",
      icon: "Building",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Exchange Act: Ongoing Market Regulation",
          content:
            "While the 1933 Act governs new issuances, the Securities Exchange Act of 1934 governs the *secondary market* — the ongoing trading of already-issued securities. Its most consequential creation was the **Securities and Exchange Commission (SEC)**.\n\n**The SEC's Core Mandate**\n- Protect investors\n- Maintain fair, orderly, and efficient markets\n- Facilitate capital formation\n\nThe SEC has five presidentially-appointed commissioners, employs ~4,500 staff, and operates four main divisions: Corporation Finance, Trading and Markets, Investment Management, and Enforcement.\n\n**Periodic Reporting Requirements**\nPublic companies (generally those with >$10M in assets and >2,000 shareholders, or that conducted a public offering) must file:\n\n| Form | Frequency | Content |\n|---|---|---|\n| **10-K** | Annual | Audited financials, MD&A, risk factors, business overview, corporate governance |\n| **10-Q** | Quarterly | Unaudited financials, management discussion, material changes |\n| **8-K** | Material event (within 4 business days) | M&A, CEO change, earnings restatement, bankruptcy, major contracts |\n| **DEF 14A** | Annual proxy | Shareholder meeting agenda, executive compensation, board nominees |\n| **Form 4** | Within 2 business days of insider transaction | Insider trades (officers, directors, >10% shareholders) |\n\n**Section 12 Registration**\nExchange Act Section 12 requires companies to register their securities if they exceed the threshold, triggering all reporting obligations.",
          highlight: [
            "Securities Exchange Act 1934",
            "SEC",
            "10-K",
            "10-Q",
            "8-K",
            "Form 4",
            "secondary market",
          ],
        },
        {
          type: "teach",
          title: "Rule 10b-5: The Cornerstone Anti-Fraud Provision",
          content:
            "**Section 10(b) and Rule 10b-5** are the broadest anti-fraud tools in US securities law, drafted in 1942 in just a few minutes by SEC attorney Milton Freeman. Their brevity belies their enormous reach.\n\n**Rule 10b-5 text (summarized):**\nIt is unlawful for any person, directly or indirectly, to:\n1. Employ any device, scheme, or artifice to defraud\n2. Make any untrue statement of a material fact or omit a material fact necessary to make statements not misleading\n3. Engage in any act, practice, or course of business which operates as a fraud\n\n...in connection with the *purchase or sale* of any security.\n\n**Elements of a Private 10b-5 Claim (after *Basic v. Levinson*, 1988):**\n1. **Material misrepresentation or omission** — would a reasonable investor consider it important?\n2. **Scienter** — defendant acted with intent to deceive or reckless disregard for truth\n3. **Connection** — in connection with purchase or sale of securities\n4. **Reliance** — fraud-on-the-market theory permits presumption of reliance in efficient markets\n5. **Economic loss** — plaintiff actually suffered a loss\n6. **Loss causation** — the misrepresentation caused the loss\n\n**Key Application — Insider Trading:**\nRule 10b-5 is the primary statutory hook for insider trading prosecutions. Trading on material non-public information (MNPI) while owing a duty of trust is the central violation.",
          highlight: [
            "Rule 10b-5",
            "Section 10(b)",
            "material misrepresentation",
            "scienter",
            "MNPI",
            "fraud-on-the-market",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A CEO publicly states 'we expect record revenues this quarter' while privately knowing the company will miss estimates by 30%. An investor buys shares based on the statement and loses money. Under Rule 10b-5, which element is most clearly met?",
          options: [
            "Loss causation only — the investor must separately prove the CEO intended to defraud",
            "Material misrepresentation with scienter — the CEO knowingly made a false forward-looking statement with knowledge of the true results",
            "Scienter but not materiality — guidance statements are always protected as puffery",
            "None — forward-looking statements are categorically protected under the PSLRA safe harbor",
          ],
          correctIndex: 1,
          explanation:
            "Both materiality and scienter are clearly met. Revenue guidance is highly material to investors' decisions. The CEO's knowledge of the true expected results means the false statement was made with scienter (knowing the statement was false). The PSLRA safe harbor for forward-looking statements does apply to some optimistic projections, but it does not protect statements made with actual knowledge of their falsity — which is the case here.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A company must file an 8-K within four business days of a CEO resignation, even if the CEO agreed to stay on as a consultant.",
          correct: true,
          explanation:
            "True. The departure of a principal executive officer (CEO, CFO, COO, etc.) is a specified triggering event under Item 5.02 of Form 8-K, requiring disclosure within four business days. The fact that the executive remains in a lesser or advisory role does not eliminate the reporting obligation, since the resignation from the principal officer role itself is material information that investors need promptly.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "GreenTech Inc. is publicly traded. Its CFO learns that the company's patent application was rejected — material negative news not yet public. Before the news is announced, the CFO's brother (who received no direct tip) independently reads industry chatter online and sells his GreenTech shares at a profit.",
          question:
            "Which person, if any, has violated Rule 10b-5?",
          options: [
            "The CFO's brother — trading ahead of negative news always violates securities law",
            "The CFO — for failing to promptly disclose the patent rejection to the public",
            "Neither — the brother traded independently and the CFO made no trade",
            "Both the CFO and brother — insider trading is presumed whenever a family member trades before material news",
          ],
          correctIndex: 2,
          explanation:
            "Neither has violated Rule 10b-5 on these facts. The CFO made no trade and gave no tip to the brother. The brother traded independently based on public information (online industry chatter), not on MNPI received from the CFO. The CFO has no standalone duty to immediately disclose under 10b-5 — the company has disclosure obligations under Reg FD and periodic reporting, but absent a trade or tip, no 10b-5 violation occurred. If the CFO had tipped the brother, both could be liable under the tipper-tippee theory.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Insider Trading ──────────────────────────────────────────────
    {
      id: "seclaw-3",
      title: "Insider Trading",
      description:
        "Material non-public information, classical and misappropriation theories, tipper/tippee liability, and landmark cases",
      icon: "EyeOff",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "What Is Insider Trading?",
          content:
            "Insider trading involves buying or selling securities based on **material non-public information (MNPI)** in breach of a duty of trust or confidence. It is illegal because it undermines market fairness and investor confidence.\n\n**Material Information**\nInformation is material if there is a *substantial likelihood* that a reasonable investor would consider it important in making an investment decision, or if it would significantly alter the 'total mix' of available information (*Basic v. Levinson*, 1988).\n\nExamples of material information:\n- Unannounced earnings surprises\n- Pending mergers or acquisitions\n- FDA drug approval/rejection\n- Major contract wins or losses\n- CEO resignation or death\n- Securities fraud investigations\n\n**Non-Public Information**\nInformation not yet disseminated to the investing public through proper channels. Trading must wait until the information is *effectively public* — not just filed, but accessible and absorbed by the market (the 'market absorption' doctrine).\n\n**Two Major Theories of Liability:**\n\n1. **Classical Theory** (*Chiarella v. United States*, 1980): Corporate insiders — officers, directors, and employees — owe a fiduciary duty to shareholders and must either disclose MNPI before trading or abstain from trading.\n\n2. **Misappropriation Theory** (*United States v. O'Hagan*, 1997): A person who misappropriates MNPI from their employer or another person to whom they owe a duty of trust (e.g., a lawyer misusing a client's M&A plans) violates 10b-5 even if they are not a corporate insider of the company whose stock is traded.",
          highlight: [
            "MNPI",
            "material information",
            "classical theory",
            "misappropriation theory",
            "Chiarella",
            "O'Hagan",
          ],
        },
        {
          type: "teach",
          title: "Tipper-Tippee Liability and Famous Cases",
          content:
            "**Tipper-Tippee Liability**\nLiability extends beyond the original insider. Under *Dirks v. SEC* (1983) and *United States v. Newman* (2d Cir. 2014):\n\n- **Tipper liability:** An insider who tips MNPI to another person is liable if they received a *personal benefit* (cash, gifts, reputational benefit, or even a friendship benefit in a close relationship).\n- **Tippee liability:** The tippee is liable if they knew or should have known that the tipper breached a duty for personal benefit and the tippee received MNPI.\n- The benefit requirement was broadened in *Salman v. United States* (2016) — gifting inside information to a close family member IS sufficient personal benefit.\n\n**Raj Rajaratnam & Galleon Group (2009–2011)**\nOne of the largest hedge fund insider trading cases in history. Galleon Group founder Raj Rajaratnam built an extensive network of corporate insiders (at Goldman Sachs, McKinsey, Intel, and others) who fed him MNPI. The FBI used wiretaps for the first time in an insider trading investigation. Rajaratnam was convicted on 14 counts of fraud and conspiracy, sentenced to 11 years in prison and fined $92M. The case showed that hedge funds were systematically mining corporate contacts for material tips.\n\n**Martha Stewart (2004)**\nStewart was CEO of Martha Stewart Living Omnimedia. She sold ImClone shares one day before the FDA rejected ImClone's cancer drug application — based on a tip from her broker (who received the information from ImClone's CEO). Notably, Stewart was not convicted of insider trading itself; instead she was convicted of **obstruction of justice and making false statements** to federal investigators when she lied about the reason for her sale. She served five months in prison. The case illustrates that the cover-up often carries greater legal risk than the underlying conduct.",
          highlight: [
            "tipper-tippee",
            "personal benefit",
            "Dirks",
            "Salman",
            "Rajaratnam",
            "Martha Stewart",
            "misappropriation",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investment banker working on an undisclosed acquisition tips her college roommate (who is not in finance) about the deal. The roommate buys stock in the target company and profits. Under tipper-tippee doctrine, when is the roommate (tippee) liable?",
          options: [
            "Never — the roommate is not a corporate insider and owes no duty to shareholders",
            "Only if the roommate paid the banker for the tip",
            "If the roommate knew or should have known the banker was breaching a duty of trust for personal benefit, and the banker received such a benefit",
            "Only if the roommate is a registered securities professional subject to FINRA rules",
          ],
          correctIndex: 2,
          explanation:
            "Under Dirks and subsequent cases, tippee liability requires: (1) the tipper breached a duty for personal benefit, and (2) the tippee knew or should have known this. The personal benefit need not be money — gifting information to a close friend can satisfy the benefit requirement after Salman v. United States (2016). The roommate's lack of professional status is irrelevant; securities law applies to all persons trading on MNPI received through a breach of duty.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Martha Stewart was convicted of insider trading in the ImClone case.",
          correct: false,
          explanation:
            "False. Martha Stewart was NOT convicted of insider trading. She was convicted of obstruction of justice, making false statements, and conspiracy for lying to federal investigators about her reasons for selling ImClone shares. The insider trading charge was not pursued at trial partly because of legal complexity around the tipper's status. The case is a powerful reminder that lying to investigators about potentially illegal conduct often results in greater criminal exposure than the underlying conduct itself.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A pharmaceutical company's general counsel learns from outside litigation counsel that the DOJ is about to file a major fraud indictment against the company — MNPI not yet public. The general counsel calls her broker and asks him to sell all her company shares. The broker, who does not know why she is selling, executes the trade.",
          question:
            "Which insider trading theory most directly applies to the general counsel's liability?",
          options: [
            "Classical theory — she is a corporate insider trading on MNPI about her own company",
            "Misappropriation theory — she misappropriated information from outside litigation counsel",
            "Tipper-tippee theory — she tipped the broker who executed the trade",
            "No theory applies — litigation-related information is privileged and exempt from insider trading rules",
          ],
          correctIndex: 0,
          explanation:
            "The classical theory applies most directly. As general counsel, she is a corporate insider (officer/employee) of the company. She received MNPI about her own company (the DOJ indictment) and traded on it. The fact that the information came through outside counsel rather than internally does not change her status as a corporate insider. Misappropriation would be relevant if she were an outsider (e.g., the outside lawyer herself) who misused information obtained in a professional capacity for another party. Attorney-client privilege does not create an exemption from insider trading rules.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Investment Advisers Act ─────────────────────────────────────
    {
      id: "seclaw-4",
      title: "Investment Advisers Act",
      description:
        "Fiduciary duty, RIA registration thresholds, Form ADV, suitability vs fiduciary standard, and broker-dealer vs RIA distinctions",
      icon: "UserCheck",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Investment Advisers Act of 1940",
          content:
            "The Investment Advisers Act of 1940 regulates persons who, for compensation, provide advice about securities as a regular part of their business. It established the registration and oversight framework for professional investment advisers.\n\n**Who Must Register?**\n- **SEC registration:** Required if managing $110M or more in assets under management (AUM). Advisers with $100M–$110M may register with the SEC or their state.\n- **State registration:** Required if managing under $100M. Each state has its own adviser registration rules.\n- **Exemptions:** Certain advisers are exempt, including advisers to private funds with fewer than 15 clients (before Dodd-Frank narrowed this), venture capital fund advisers, and some family offices.\n\n**Registered Investment Adviser (RIA)**\nAn RIA is an individual or firm registered under the Advisers Act. RIAs:\n- Must disclose all material conflicts of interest\n- Cannot charge performance fees to non-qualified clients (generally)\n- Are subject to SEC examination\n- Must maintain books and records per SEC rules\n- Are prohibited from fraudulent, deceptive, or manipulative practices\n\n**Form ADV — The Disclosure Document**\nRIAs must file Form ADV with the SEC. It has two parts:\n- **Part 1:** Structured information about the firm — size, ownership, disciplinary history, business practices. Public via IAPD database.\n- **Part 2 (Brochure):** Plain-English narrative describing strategies, fees, conflicts, and key personnel. Must be delivered to clients at or before the start of the advisory relationship and updated annually.",
          highlight: [
            "Investment Advisers Act 1940",
            "RIA",
            "AUM threshold",
            "Form ADV",
            "fiduciary",
            "SEC registration",
          ],
        },
        {
          type: "teach",
          title: "Fiduciary Standard vs. Suitability Standard",
          content:
            "**The Fiduciary Standard (RIAs)**\nRegistered investment advisers are subject to the highest duty in financial services: the **fiduciary duty**. This comes from *SEC v. Capital Gains Research Bureau* (1963), which held that equity demands advisers act in clients' best interests.\n\nThe fiduciary duty has two components:\n- **Duty of Loyalty:** Act in the client's best interest at all times. Disclose all material conflicts of interest. Avoid conflicts where possible; manage and disclose those that cannot be avoided.\n- **Duty of Care:** Provide advice based on a reasonable understanding of the client's investment profile — goals, time horizon, risk tolerance, tax situation, and financial circumstances. Recommendations must be suitable AND in the client's best interest.\n\n**The Suitability Standard (Traditional Broker-Dealers)**\nTraditional broker-dealers under FINRA rules were subject to the lower suitability standard — a recommendation is permissible as long as it is *suitable* for the client, even if a better or cheaper alternative exists.\n\n**Regulation Best Interest (Reg BI, 2020)**\nThe SEC adopted Reg BI in 2020, requiring broker-dealers to act in retail customers' best interest at the time of a recommendation. It elevates brokers above pure suitability but stops short of the full fiduciary duty:\n- Brokers must consider costs and not place their financial interest ahead of the customer's\n- But brokers may still recommend higher-cost products if they are 'in the best interest' of the customer\n- Unlike RIAs, brokers are not subject to ongoing fiduciary obligations between transactions\n\n**Practical Distinction:**\nAn RIA recommending a mutual fund must choose the share class that is best for the client. A broker under Reg BI must not recommend a higher-fee share class purely for their own compensation benefit — but has more discretion than a full fiduciary.",
          highlight: [
            "fiduciary duty",
            "duty of loyalty",
            "duty of care",
            "suitability standard",
            "Reg BI",
            "broker-dealer",
            "best interest",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An RIA recommends a client invest in a mutual fund that pays the RIA a 1% annual distribution fee ('12b-1 fee'). The client could achieve the same strategy with a lower-cost ETF at 0.05% expense ratio. Under the fiduciary standard, what must the RIA do?",
          options: [
            "Nothing — any suitable recommendation is permissible under the Advisers Act",
            "At minimum, disclose the conflict created by the 12b-1 fee; ideally recommend the lower-cost ETF if it better serves the client's interests",
            "Refund the 12b-1 fee to the client automatically — performance fees to non-qualified clients are prohibited",
            "Register as a broker-dealer to legally receive distribution fees",
          ],
          correctIndex: 1,
          explanation:
            "Under the fiduciary duty of loyalty, the RIA must disclose the material conflict of interest created by the 12b-1 fee it will receive. Under the duty of care, the RIA must provide advice in the client's best interest — recommending the higher-cost fund primarily because of the adviser's own fee would violate this duty. Disclosure alone may not be enough if a cheaper, equivalent alternative exists; the SEC has signaled that advisers must justify recommending higher-cost products when cheaper alternatives are available. Refunding fees automatically is not required; the prohibition on performance fees relates to incentive fees, not distribution fees.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under Regulation Best Interest, broker-dealers are now held to the same ongoing fiduciary standard as registered investment advisers.",
          correct: false,
          explanation:
            "False. Reg BI raised the standard for broker-dealers above mere suitability but did not create a full fiduciary standard equivalent to that governing RIAs. Key differences remain: (1) The fiduciary duty under the Advisers Act is ongoing, while Reg BI applies at the time of a specific recommendation; (2) RIAs must continually monitor client portfolios and act in their interest; broker-dealers generally do not have ongoing management duties between transactions; (3) The Advisers Act imposes broader conflicts disclosure requirements. The SEC intentionally chose not to apply the Advisers Act fiduciary standard to broker-dealers.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A client asks her financial adviser (who is dually registered as both an RIA and a broker-dealer) to recommend a retirement portfolio. The adviser recommends actively managed funds that pay him higher commissions rather than lower-cost index funds that would achieve similar returns.",
          question:
            "In the adviser's capacity as an RIA, which duty has most clearly been violated?",
          options: [
            "Duty of Loyalty — placing personal financial interest above the client's best interest is a classic conflict of interest violation",
            "Duty of Care only — the products may be suitable, so loyalty is not implicated",
            "No duty — dual registrants can apply the lower suitability standard to any transaction they choose",
            "Duty of disclosure only — as long as the adviser discloses the commissions, no violation occurs",
          ],
          correctIndex: 0,
          explanation:
            "The Duty of Loyalty is most clearly violated. By recommending products that benefit the adviser financially at the expense of the client's returns, the adviser is placing personal interests above the client's. Disclosure of the conflict is necessary but not sufficient — the adviser as RIA must take steps to eliminate or manage the conflict such that the recommendation is truly in the client's best interest. A dually registered adviser must apply the RIA fiduciary standard when acting in that capacity, even if they could apply a lower standard as a broker for certain transactions.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Market Manipulation ─────────────────────────────────────────
    {
      id: "seclaw-5",
      title: "Market Manipulation",
      description:
        "Pump and dump schemes, spoofing, wash trading, front-running, Reg NMS, and circuit breaker protections",
      icon: "TrendingUp",
      xpReward: 85,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Classic Manipulation Schemes",
          content:
            "Market manipulation involves actions intended to artificially affect the price or trading volume of a security to deceive other market participants. It violates Section 9 of the Exchange Act (for listed securities) and Rule 10b-5.\n\n**Pump and Dump**\nThe oldest manipulation scheme:\n1. Accumulate shares of a thinly-traded, low-float stock at low prices\n2. Artificially inflate the price through false or misleading promotional statements (the 'pump') — spam emails, social media hype, paid promotional newsletters\n3. Sell your shares at the inflated price to unsuspecting investors (the 'dump')\n4. Share price collapses; late buyers suffer losses\n\nThe SEC has brought hundreds of pump-and-dump cases. Modern variations include coordinated social media campaigns and crypto token manipulation.\n\n**Wash Trading**\nSelf-dealing trades that create the illusion of market activity without genuine change of ownership:\n- Buy and sell the same security to yourself (or between accounts you control)\n- Creates false volume and price signals, misleading other traders about market interest\n- Common manipulation technique in cryptocurrency markets where surveillance is limited\n- Violates Exchange Act Section 9(a)(1) and CFTC rules for futures\n\n**Spoofing**\nA high-frequency trading manipulation technique:\n1. Place a large 'spoof' order on one side of the order book (e.g., large buy order)\n2. This creates a false impression of demand, moving prices\n3. Quickly execute real orders on the other side (sell at the artificially elevated price)\n4. Cancel the spoof order before it fills\n\nSpoofing became explicitly illegal under Dodd-Frank (2010). Navinder Sarao was convicted for spoofing related to the 2010 Flash Crash, fined $38M.",
          highlight: [
            "pump and dump",
            "wash trading",
            "spoofing",
            "Section 9",
            "Dodd-Frank",
            "market manipulation",
          ],
        },
        {
          type: "teach",
          title: "Front-Running, Reg NMS, and Circuit Breakers",
          content:
            "**Front-Running**\nFront-running occurs when a broker or market participant trades in advance of a client's large pending order, knowing the order will move the market:\n- A broker receives a client order to buy 1M shares of Stock X\n- Before executing the client's order, the broker buys Stock X for their own account\n- The client's large order pushes the price up; the broker sells at a profit\n- Front-running is a breach of fiduciary duty and violates Exchange Act anti-manipulation and fraud provisions\n- In the context of high-frequency trading, 'latency arbitrage' raises similar concerns but is in a legal grey area\n\n**Regulation NMS (National Market System, 2005)**\nAdopted by the SEC to modernize equity market structure and improve trade execution:\n- **Order Protection Rule (Rule 611):** Brokers must route orders to the exchange quoting the best price (the NBBO — National Best Bid and Offer). Prevents 'trade-throughs' (executing at a worse price than the best available).\n- **Access Rule (Rule 610):** Limits access fees to $0.003/share to ensure competitive pricing\n- **Sub-Penny Rule (Rule 612):** Minimum pricing increment of $0.01 to prevent manipulation through tiny price improvements\n- Reg NMS created the fragmented multi-exchange market structure seen today, with trading across NYSE, Nasdaq, BATS, and dozens of dark pools\n\n**Circuit Breakers**\nExchange-wide and individual-stock circuit breakers halt trading to prevent panic-driven crashes:\n- **Market-wide:** S&P 500 down 7% → 15-min halt; down 13% → 15-min halt; down 20% → halt for rest of day\n- **Single-stock:** Limit Up-Limit Down (LULD) bands prevent trades >5–10% from recent price; triggered after the 2010 Flash Crash\n- Circuit breakers provide a 'cooling off' period, allowing market participants to assess information before trading resumes",
          highlight: [
            "front-running",
            "Reg NMS",
            "NBBO",
            "circuit breakers",
            "LULD",
            "Order Protection Rule",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "A trader places a series of large sell orders in a stock, causing the price to drop. Once the price falls, she rapidly cancels all the sell orders and buys the stock cheaply. She repeats this pattern multiple times. Which manipulation technique is this?",
          options: [
            "Wash trading — she is creating false volume by trading with herself",
            "Spoofing — she places orders she intends to cancel to manipulate price before taking the opposite position",
            "Front-running — she is trading ahead of client orders",
            "Pump and dump — she is artificially inflating price before selling",
          ],
          correctIndex: 1,
          explanation:
            "This is a textbook description of spoofing. The trader places large orders (spoof orders) with no intention to execute them — their purpose is to create artificial price pressure. Once the price moves in her favor, she cancels the spoof orders and executes real trades at the manipulated price. Spoofing was explicitly criminalized in the Commodity Exchange Act by Dodd-Frank and applies to securities markets under Exchange Act anti-manipulation provisions. Navinder Sarao used this technique to contribute to the 2010 Flash Crash.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Under Regulation NMS, a broker-dealer is required to route a client's market order to the exchange quoting the best national price, even if that exchange charges higher access fees.",
          correct: true,
          explanation:
            "True, generally. The Order Protection Rule (Rule 611) requires brokers to route orders at or better than the National Best Bid and Offer (NBBO), which is the best price across all exchanges. This protects clients from trade-throughs. However, Reg NMS also includes the Access Rule (Rule 610), which caps access fees at $0.003/share to prevent exchanges from charging excessive fees as a workaround to the routing obligations. Together, these rules ensure clients get the best available price across the fragmented market structure.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A portfolio manager at a hedge fund receives a $500M buy order from a pension fund client to purchase shares of a mid-cap stock. Before routing the pension fund's order, the portfolio manager buys 2M shares of the same stock for the hedge fund's proprietary account, knowing the pension's large order will push the price up.",
          question:
            "This conduct most clearly constitutes which violation?",
          options: [
            "Spoofing — placing orders intended to be cancelled to move market prices",
            "Front-running — trading ahead of a client's known pending order for personal gain",
            "Pump and dump — artificially inflating price through promotional activity",
            "Wash trading — executing trades that create false volume without genuine ownership change",
          ],
          correctIndex: 1,
          explanation:
            "This is front-running. The portfolio manager has advance knowledge of a large pending client order and uses that information to trade the firm's proprietary account before executing the client's order — profiting from the predictable price impact of the client trade. This breaches the fiduciary duty owed to the pension fund client, violates Exchange Act anti-fraud and anti-manipulation provisions, and may constitute wire fraud. It differs from spoofing (which involves fake orders to move price), wash trading (self-dealing trades), and pump-and-dump (false promotional statements to inflate price).",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Investor Protection ─────────────────────────────────────────
    {
      id: "seclaw-6",
      title: "Investor Protection",
      description:
        "SIPC insurance, FDIC vs SIPC distinctions, FINRA arbitration, class action suits, whistleblower program, and FINRA BrokerCheck",
      icon: "Shield",
      xpReward: 75,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "SIPC and FDIC: What Protects Your Accounts",
          content:
            "**SIPC — Securities Investor Protection Corporation**\nSIPC is a non-profit corporation created by the Securities Investor Protection Act of 1970. It protects customers of SIPC-member broker-dealers if the firm fails.\n\n**What SIPC Covers:**\n- Up to **$500,000 per customer per brokerage** (combined limit)\n- Within that, up to **$250,000 in cash** held in the brokerage account\n- Protects missing securities and cash when a broker-dealer is liquidated\n\n**Critical Limitation — SIPC Does NOT Cover:**\n- Investment losses from market fluctuations (most common investor misconception)\n- Losses from fraud (e.g., if a broker steals your money through Ponzi scheme)\n- Commodity futures contracts\n- Currency\n- Investment contracts not registered as securities\n\nBernie Madoff's victims could not rely on SIPC for market losses — SIPC restored the *net equity* of accounts (what customers put in minus what they took out), not the fictitious profits shown on statements.\n\n**FDIC — Federal Deposit Insurance Corporation**\nFDIC insures bank deposits, not securities:\n- Covers up to **$250,000 per depositor per bank, per account category** (checking, savings, CDs, money market deposit accounts)\n- Does NOT cover mutual funds, stocks, bonds, or annuities sold through banks — even if purchased at a bank branch\n\n**Key Distinction:** Money in a bank account = FDIC protected. Money in a brokerage account invested in securities = SIPC protected (against broker failure, not market losses). Cash in a brokerage account = SIPC protected up to $250K.",
          highlight: [
            "SIPC",
            "FDIC",
            "$500,000 limit",
            "$250,000 cash",
            "broker-dealer liquidation",
            "market losses not covered",
          ],
        },
        {
          type: "teach",
          title: "FINRA Arbitration, Class Actions, and Whistleblowers",
          content:
            "**FINRA Arbitration**\nThe Financial Industry Regulatory Authority (FINRA) is a self-regulatory organization (SRO) that oversees broker-dealers. Most brokerage account agreements contain a **mandatory arbitration clause** requiring disputes to be resolved through FINRA arbitration rather than court.\n\nFINRA arbitration process:\n- Three-panel arbitration for claims > $100K; single arbitrator for smaller claims\n- Faster and less expensive than court litigation\n- Awards are generally **final and binding** with limited appeal rights\n- Criticized for industry-friendly arbitrator pools; FINRA has reformed selection rules\n- Investors can check if a broker has prior arbitration awards against them via BrokerCheck\n\n**Class Action Lawsuits**\nWhen many investors are harmed by the same conduct (e.g., corporate fraud in SEC filings), plaintiffs can sue as a class:\n- **Private Securities Litigation Reform Act (PSLRA, 1995):** Heightened pleading standards for securities fraud class actions — plaintiffs must plead specific facts of fraud and loss causation at the outset, reducing frivolous suits\n- **Securities Litigation Uniform Standards Act (SLUSA, 1998):** Most securities class actions must be filed in federal court under federal law\n- Lead plaintiff appointed by the court; typically the investor with the largest loss\n- Settlements distributed to class members; attorney fees can be 25–30% of recovery\n\n**SEC Whistleblower Program (Dodd-Frank, 2010)**\nA powerful tool for uncovering fraud:\n- Whistleblowers who voluntarily provide original information leading to an SEC enforcement action with sanctions over $1M may receive **10–30% of the total sanctions collected**\n- Strong anti-retaliation protections\n- Anonymous submissions allowed (through an attorney)\n- Since inception, the SEC has awarded over $1.5 billion to more than 300 whistleblowers\n\n**FINRA BrokerCheck**\nA free online tool (brokercheck.finra.org) that lets investors research broker-dealers and registered representatives:\n- Employment history, licenses, and registrations\n- Regulatory actions, criminal disclosures, and civil judgments\n- Customer dispute history (arbitration awards and settlements)",
          highlight: [
            "FINRA arbitration",
            "mandatory arbitration",
            "class action",
            "PSLRA",
            "whistleblower program",
            "BrokerCheck",
          ],
        },
        {
          type: "quiz-mc",
          question:
            "An investor holds a $600,000 brokerage account at a SIPC-member firm — $400,000 in stocks and $200,000 in cash. The brokerage firm fails. How much does SIPC cover?",
          options: [
            "$600,000 — SIPC covers the full account value",
            "$500,000 — $400,000 in stocks plus $100,000 of the cash (cash coverage limited to $250,000, but total cap is $500,000)",
            "$250,000 — only the cash portion qualifies for protection",
            "$500,000 — $250,000 in stocks and $250,000 in cash (equal split)",
          ],
          correctIndex: 1,
          explanation:
            "SIPC covers up to $500,000 per customer at a SIPC-member firm, with a $250,000 sublimit specifically for cash. In this scenario: the $400,000 in stocks is fully covered (under the $500,000 total limit); for the $200,000 in cash, the entire amount is within the $250,000 cash sublimit. Total coverage = $400,000 + $200,000 = $600,000, but capped at the $500,000 overall limit. So SIPC covers $500,000 ($400K stocks + $100K of the cash), and the remaining $100K of cash is not covered. The investor has an unsecured claim against the bankrupt estate for the remaining $100,000.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "SIPC insurance protects investors against losses caused by a significant drop in the value of their stock holdings due to a market crash.",
          correct: false,
          explanation:
            "False. SIPC does NOT protect against investment losses from market movements. SIPC only protects customers when a SIPC-member broker-dealer fails and customer assets are missing or inaccessible (e.g., due to broker insolvency or theft). It restores the securities and cash that should be in the account — not the value those assets had at any particular time. If a stock you own declines 50% in a market crash, SIPC provides no protection whatsoever. This is the most common misconception about SIPC coverage.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A retail investor suspects her broker churned her account (excessive trading to generate commissions), causing $85,000 in unnecessary losses. Her brokerage account agreement contains a mandatory FINRA arbitration clause. She wants to recover her losses.",
          question:
            "What is the most appropriate and likely required dispute resolution mechanism?",
          options: [
            "File a lawsuit in federal court under the Securities Exchange Act — federal courts have exclusive jurisdiction over securities fraud claims",
            "File a FINRA arbitration claim — mandatory arbitration clauses are enforceable and FINRA is the proper forum for broker-customer disputes",
            "File a complaint with the SEC — the SEC will pursue her individual claim and recover her losses",
            "File a class action — churning claims always must be pursued as class actions under PSLRA",
          ],
          correctIndex: 1,
          explanation:
            "The brokerage agreement's mandatory arbitration clause requires the dispute to be resolved through FINRA arbitration, not court. For claims under $100,000, a single FINRA arbitrator would hear the case. FINRA arbitration is specifically designed for broker-customer disputes including churning, unsuitable recommendations, and unauthorized trading. The SEC investigates regulatory violations but does not pursue individual investor recovery claims — investors must pursue their own civil remedies. Class actions are possible for widespread misconduct but are not required for individual churning claims.",
          difficulty: 2,
        },
      ],
    },
  ],
};
