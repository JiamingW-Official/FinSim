import type { Unit } from "./types";

export const UNIT_MARKET_BUBBLES: Unit = {
  id: "market-bubbles",
  title: "Market Bubbles, Manias & Crashes",
  description:
    "Understand the anatomy of speculative bubbles — from dot-com mania to crypto cycles — and learn how to identify, navigate, and profit from boom/bust dynamics",
  icon: "💥",
  color: "#7c2d12",
  lessons: [
    // ─── Lesson 1: Bubble Anatomy ─────────────────────────────────────────────────
    {
      id: "mb-1",
      title: "💥 Bubble Anatomy: The Kindleberger-Minsky Model",
      description:
        "Every great bubble follows the same five-stage arc — learn to recognize displacement, euphoria, and the inevitable crash",
      icon: "💥",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Is a Speculative Bubble?",
          content:
            "A speculative bubble occurs when asset prices rise far above their intrinsic value, driven by self-reinforcing expectations that prices will continue to rise indefinitely.\n\n**The core mechanics:**\n- Prices rise → more buyers enter → prices rise further\n- Narrative replaces valuation: \"this time is different\"\n- Credit expands to fund purchases, amplifying gains on the way up — and losses on the way down\n- Eventually, reality intrudes and the price collapses back toward fundamental value\n\n**Why bubbles matter:**\nBubbles are not rare curiosities. The Dutch Tulip Mania (1637), the South Sea Bubble (1720), the Great Depression's prelude (1929), dot-com (2000), US housing (2006), and crypto (2021) all followed recognizable patterns. Understanding the pattern gives you an enormous edge over participants caught in the emotion of the moment.\n\n**The Minsky Hypothesis:**\nHyman Minsky, an economist largely ignored during his lifetime, argued that financial stability itself breeds instability. Prolonged stability encourages risk-taking; risk-taking breeds fragility; fragility produces crisis. His insight was validated spectacularly in 2008.",
          highlight: ["speculative bubble", "intrinsic value", "credit expansion", "Minsky", "narrative"],
        },
        {
          type: "teach",
          title: "The Five Stages: Kindleberger-Minsky Model",
          content:
            "Charles Kindleberger synthesized Minsky's work into a five-stage model in his 1978 classic \"Manias, Panics, and Crashes.\" Every major bubble fits this template.\n\n**Stage 1 — Displacement:**\nA genuine external shock changes the economic landscape: a new technology, a policy shift, a war's end. The internet (1990s), housing deregulation (early 2000s), and crypto's blockchain innovation were all genuine displacements. Early adopters profit legitimately.\n\n**Stage 2 — Credit Expansion:**\nEasy money and credit fuel the boom. Banks loosen lending standards. New financial instruments emerge. The Fed keeps rates low. Margin debt grows. More capital chases the opportunity than underlying economics justify.\n\n**Stage 3 — Euphoria:**\nPrices are detached from fundamentals. \"New paradigm\" thinking dominates. Traditional valuation metrics are dismissed. Overtrading, new entrants, and media frenzy characterize this phase. Everyone has a story about their neighbor making a fortune.\n\n**Stage 4 — Insider Profit-Taking:**\nSophisticated early investors quietly exit. Insiders sell shares. IPOs flood the market (companies rush to capture peak valuations). New buyers are less sophisticated. Price appreciation slows even as sentiment remains bullish.\n\n**Stage 5 — Panic:**\nA trigger event — often minor — causes prices to reverse. Margin calls force selling. Lenders cut credit lines. Each price drop triggers more forced selling. The bubble deflates, often overshooting to the downside.",
          highlight: ["displacement", "credit expansion", "euphoria", "insider profit-taking", "panic", "Kindleberger"],
        },
        {
          type: "teach",
          title: "Credit's Amplifying Role",
          content:
            "Credit is the oxygen that turns a fire into a firestorm. Understanding leverage dynamics explains why bubbles inflate so fast — and collapse even faster.\n\n**Leverage on the way up:**\n- An investor with $100K borrows $400K to buy $500K of assets (5× leverage)\n- Asset rises 20% → portfolio worth $600K → equity doubles from $100K to $200K\n- Leverage amplified a 20% asset gain into a 100% equity gain\n- This success attracts more leveraged buyers, pushing prices higher\n\n**Leverage on the way down:**\n- Asset falls 20% → portfolio worth $400K → equity wiped out ($100K loan still owed on $400K assets)\n- Margin call: broker demands more collateral or forces sale\n- Forced selling pushes prices lower → more margin calls → more forced selling\n- This is the \"Minsky Moment\" — the point where the system goes from self-reinforcing up to self-reinforcing down\n\n**Historical leverage in major bubbles:**\n- 1929: Stocks bought on 10% margin (90% borrowed)\n- 2006: Houses purchased with 0% down, ARMs teaser rates\n- 2021: Crypto traders using 100× leverage on DeFi platforms\n- In each case, the same leverage that amplified gains on the way up became the destruction mechanism",
          highlight: ["leverage", "margin call", "Minsky Moment", "forced selling", "credit contraction"],
        },
        {
          type: "quiz-mc",
          question:
            "According to the Kindleberger-Minsky model, what is 'displacement' and why is it important?",
          options: [
            "A genuine external shock that creates a real opportunity, giving the initial phase of a bubble legitimate economic justification",
            "The moment when asset prices are displaced far above their intrinsic value, signaling the bubble's peak",
            "The process by which capital is displaced from safe assets into speculative ones by investor greed",
            "A regulatory action that displaces excessive leverage from the financial system after a crash",
          ],
          correctIndex: 0,
          explanation:
            "Displacement is Stage 1: a real external shock — a new technology, a policy change, a war's end — that creates a genuine economic opportunity. This is important because it gives the bubble its initial legitimacy. The internet really did transform commerce; crypto's blockchain really was novel. It is this kernel of truth that draws in legitimate investors first, before speculative excess takes over in later stages.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The 'Minsky Moment' refers to the peak of euphoria when investor sentiment is at its most bullish — the point of maximum optimism in a bubble cycle.",
          correct: false,
          explanation:
            "False. The Minsky Moment is the inflection point where the self-reinforcing upward cycle reverses into a self-reinforcing downward spiral — when the first forced selling triggers margin calls, which force more selling, which triggers more margin calls. It is the tipping point of collapse, not the peak of optimism. The peak of sentiment typically occurs slightly before the Minsky Moment, during Stage 3 (Euphoria) or early Stage 4 (Insider Profit-Taking).",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Dot-Com Bubble ─────────────────────────────────────────────────
    {
      id: "mb-2",
      title: " The Dot-Com Bubble (1995–2002)",
      description:
        "Price-to-eyeballs valuation, IPO frenzy, NASDAQ -78% — the internet mania that redefined speculative excess",
      icon: "",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Displacement: The Internet Changes Everything",
          content:
            "The dot-com bubble began with a genuine, world-altering insight: the internet would transform commerce, communication, and information. The displacement was real.\n\n**The legitimate revolution (1993–1997):**\n- Netscape's IPO (August 1995) was the catalyst — the browser company had no profits but raised $2.9B on its first day of trading\n- Amazon launched as an online bookstore in 1994; eBay launched in 1995\n- Email adoption surged from 9M to 100M+ users between 1995 and 2000\n- Congress passed the Telecommunications Act (1996), deregulating telecom and fueling infrastructure investment\n\n**Credit expansion:**\n- The Fed kept rates relatively low through the late 1990s\n- Venture capital poured into any company with a .com domain\n- IPO lockup periods were often waived; insiders could sell immediately\n- Investment banks competed to take companies public as fast as possible, earning massive fees regardless of company quality\n\n**The narrative:**\n\"The internet will eliminate friction from every business. Physical stores, banks, and newspapers will be obsolete within 5 years. The companies building this infrastructure deserve premium valuations.\" Parts of this were correct — the timeline was simply off by 20 years.",
          highlight: ["Netscape IPO", "internet displacement", "VC funding", "dot-com", "telecom deregulation"],
        },
        {
          type: "teach",
          title: "Valuation Absurdities: Price-to-Eyeballs",
          content:
            "As the bubble inflated, traditional valuation frameworks were explicitly abandoned. New metrics emerged that justified any price.\n\n**Invented valuation metrics:**\n- **Price-to-eyeballs**: Valuing companies by website traffic, not revenue\n- **Price-to-clicks**: What each unique visitor was \"worth\"\n- **First-mover advantage**: The belief that the first company in a market would own it permanently\n- **Get big fast**: Intentional losses to gain market share before a competitor\n\n**Specific absurdities:**\n- **Pets.com**: Raised $82.5M in its February 2000 IPO. Had $619K in revenue in Q3 1999 but $11.8M in costs (selling $1 of dog food for 40 cents). Went bankrupt 9 months after IPO.\n- **Webvan**: Raised $375M in IPO; spent $1B building automated grocery warehouses. Filed for bankruptcy in July 2001 — one of the largest dot-com failures.\n- **theGlobe.com**: IPO in November 1998 rose 606% on its first day — a record at the time. Revenue was minimal.\n- **eToys**: Valued at $8B at peak — more than Toys 'R' Us, which had $11B in actual revenue.\n\n**The Nasdaq 400% surge:**\nFrom January 1995 to March 2000, the Nasdaq Composite rose from ~750 to a peak of **5,048** — a 573% gain. P/E ratios for index constituents exceeded 200×.",
          highlight: ["price-to-eyeballs", "Pets.com", "Webvan", "Nasdaq 5048", "573% gain", "P/E 200x"],
        },
        {
          type: "teach",
          title: "The Crash: Nasdaq -78% and Survivors vs. Casualties",
          content:
            "The bubble peaked on March 10, 2000. Over the next 2.5 years, the Nasdaq lost 78% of its value — erasing trillions in market capitalization.\n\n**The trigger:**\nNo single event ended the bubble. A series of factors coincided:\n- The Fed had raised rates six times from June 1999 to May 2000\n- Institutional investors began reducing exposure to unprofitable companies\n- A series of high-profile dot-com failures damaged sentiment\n\n**The casualties:**\n- ~5,000 internet companies funded 1995–2001; the majority went to zero\n- $5 trillion in market capitalization evaporated from March 2000 to October 2002\n- The Nasdaq did not recover its March 2000 peak until **March 2015** — 15 years later\n- Telecom companies wrote off $2 trillion in debt; Nortel Networks, WorldCom, and Global Crossing went bankrupt\n\n**The survivors — and the lesson:**\n- Amazon fell from $107 to **$7** (a 93% decline) — but the business model was fundamentally sound\n- eBay fell 70% but remained profitable\n- Google launched its IPO in 2004 — after the crash\n- The internet's transformative power was real; the valuations assigned to it were not\n- The lesson: **correct thesis, wrong price, wrong timeline** is still a losing trade",
          highlight: ["Nasdaq -78%", "March 2000 peak", "5 trillion lost", "Amazon -93%", "correct thesis wrong price"],
        },
        {
          type: "quiz-mc",
          question:
            "Pets.com became a symbol of dot-com excess. What was the fundamental economic problem with its business model?",
          options: [
            "It was selling products below cost — spending roughly $2.26 in operating costs for every $1 of revenue, burning through capital with no path to profitability",
            "It had excessive management salaries that consumed all revenue, despite strong gross margins on pet supplies",
            "Its website was unreliable, causing it to lose market share to competitors with better technology",
            "Regulatory authorities blocked its expansion into major metropolitan markets, limiting growth",
          ],
          correctIndex: 0,
          explanation:
            "Pets.com's core problem was unit economics: it sold pet supplies at prices below cost to gain market share — the 'get big fast' strategy. With $619K in revenue but $11.8M in costs in a single quarter, it was destroying capital with no viable path to profitability. Even at massive scale, shipping heavy bags of dog food with free or discounted delivery was structurally unprofitable. The 'price-to-eyeballs' metric used to value it ignored this fundamental problem.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "In March 2000, Amazon's stock was at $107. By October 2001, it had fallen to $5.97 — a 94% decline. At the same time, Amazon's actual revenue was growing 44% year-over-year. The company was unprofitable but had significant cash on its balance sheet.",
          question:
            "What does Amazon's dot-com crash experience illustrate about bubble dynamics and asset valuation?",
          options: [
            "Even fundamentally sound businesses with real growth can become severely mispriced in both directions — grossly overvalued at bubble peaks and trading below intrinsic value at crash lows",
            "Amazon's survival was primarily due to its technology advantage, which competitors couldn't replicate even during the crash",
            "Unprofitable companies should always be avoided during bear markets, regardless of revenue growth",
            "The stock market accurately valued Amazon throughout the period; the 94% decline reflected genuine business deterioration",
          ],
          correctIndex: 0,
          explanation:
            "Amazon's trajectory illustrates the full cycle of mispricing. At $107, investors were paying for decades of future profits that hadn't materialized yet — extreme overvaluation. At $5.97, with revenue growing 44%, the market was pricing in bankruptcy despite strong fundamentals. Both extremes were wrong. This is the key lesson of bubbles: prices overshoot in both directions. The most durable businesses fall furthest from peak but recover most strongly — making post-crash buying in fundamentally sound survivors potentially the most profitable strategy.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 3: Housing Bubble & 2008 ──────────────────────────────────────────
    {
      id: "mb-3",
      title: " The Housing Bubble & 2008 Financial Crisis",
      description:
        "NINJA loans, CDO-squared, rating agency capture, and the Lehman-AIG cascade that nearly destroyed the global financial system",
      icon: "",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Subprime Origination: Misaligned Incentives",
          content:
            "The 2008 crisis was not caused by one bad actor — it was the product of a system with perverse incentives at every level, where no single participant faced the consequences of their decisions.\n\n**The originate-to-distribute model:**\nTraditionally, banks kept mortgages on their own books — giving them a direct incentive to ensure borrowers could repay. The new model changed everything:\n1. Mortgage broker originates loan → earns fee → sells loan to bank\n2. Bank bundles loans into securities → earns fee → sells to investors\n3. Investors worldwide hold the risk\n\nIn this chain, neither the broker nor the bank holds the loan they created. Their incentive is volume, not quality.\n\n**Lending standards collapse:**\n- **NINJA loans**: No Income, No Job, No Assets — mortgages approved with no verification\n- **Stated income loans**: Borrowers self-reported income; brokers sometimes inflated figures (\"liar loans\")\n- **ARM teaser rates**: 1–2% for 2 years, then reset to 7–8%; borrowers approved on teaser rate\n- **Cash-out refis**: Homeowners treated houses as ATMs — borrowing against rising equity\n\n**The assumption that failed everything:**\nEvery model, every rating, every CDO structure was built on one premise: **US home prices do not fall nationally**. In historical data since WWII, this had been true. When prices fell 32% nationally from 2006 to 2012, every model was wrong simultaneously.",
          highlight: ["NINJA loans", "originate-to-distribute", "stated income", "ARM reset", "perverse incentives"],
        },
        {
          type: "teach",
          title: "The Securitization Machine: MBS → CDO → CDO²",
          content:
            "Wall Street's financial engineering transformed toxic loans into securities that carried AAA ratings — the highest possible creditworthiness designation.\n\n**Step 1 — Mortgage-Backed Securities (MBS):**\nThousands of mortgages pooled together. Investors receive monthly principal and interest payments. Risk depends on how many borrowers default.\n\n**Step 2 — CDO (Collateralized Debt Obligation):**\nMBS tranches are bundled again. A CDO creates three tranches:\n- **Senior (AAA)**: Gets paid first; must survive 20%+ default rates to take losses\n- **Mezzanine (BBB)**: Gets paid second; smaller cushion\n- **Equity (unrated)**: Takes first losses; highest yield\n\n**Step 3 — CDO-squared (CDO²):**\nMezzanine tranches of CDOs are bundled into a new CDO — adding another layer of opacity. A CDO² investor is exposed to thousands of underlying mortgages through two layers of pooling, making it nearly impossible to assess true risk.\n\n**Rating agency failure:**\n- Moody's, S&P, and Fitch assigned AAA ratings to CDO senior tranches\n- Their models assumed regional independence — California defaults wouldn't correlate with Florida defaults\n- **The conflict**: Rating agencies were paid by the issuers — investment banks could shop for ratings\n- After the crisis: 83% of AAA-rated mortgage CDOs issued in 2006 were eventually downgraded to junk\n\n**AIG's role:**\nAIG sold $500 billion in Credit Default Swaps (CDS) — insurance on CDOs — without holding reserves. When CDOs failed, AIG couldn't pay. The US government had to bail out AIG for $182 billion to prevent a chain reaction.",
          highlight: ["MBS", "CDO", "CDO-squared", "AAA rating", "rating agency conflict", "CDS", "AIG bailout"],
        },
        {
          type: "teach",
          title: "The Cascade: Bear Stearns → Lehman → AIG",
          content:
            "The housing bubble's deflation produced a cascade of institutional failures that froze the global financial system.\n\n**Bear Stearns (March 2008):**\nTwo Bear Stearns hedge funds collapsed in June 2007 — the first public warning. In March 2008, a confidence crisis caused a bank run on Bear Stearns itself. The Fed orchestrated an emergency sale to JPMorgan for $2/share (later raised to $10) — down from $172/share a year earlier.\n\n**Fannie Mae & Freddie Mac (September 7, 2008):**\nThe GSEs (government-sponsored enterprises) holding $5.4 trillion in mortgages were placed into federal conservatorship. The US government effectively nationalized the US mortgage market.\n\n**Lehman Brothers (September 15, 2008):**\nLehman filed for bankruptcy — $639 billion in assets, the largest bankruptcy in US history. Unlike Bear Stearns, the government chose not to rescue Lehman (a decision still debated). The result:\n- Money market funds held Lehman commercial paper; the Reserve Primary Fund \"broke the buck\" (NAV fell below $1), triggering a $300B+ run\n- Commercial paper markets froze — corporations couldn't roll short-term debt\n- The \"TED spread\" (a measure of banking stress) spiked from 0.4% to 4.6% overnight\n\n**AIG (September 16, 2008):**\nThe day after Lehman, AIG's CDS obligations triggered margin calls it couldn't meet. A $182B government rescue prevented AIG's failure, which would have sent losses to Goldman Sachs, Deutsche Bank, and others simultaneously.",
          highlight: ["Bear Stearns", "Lehman Brothers", "AIG", "money market run", "broke the buck", "$639B bankruptcy"],
        },
        {
          type: "quiz-mc",
          question:
            "Why did rating agencies assign AAA ratings to mortgage CDO tranches that were ultimately full of subprime loans?",
          options: [
            "Their models assumed regional housing markets were independent — that national home prices couldn't fall simultaneously — and they were paid by the issuers they rated",
            "Regulators required AAA ratings before institutional investors could purchase the securities, creating pressure to comply",
            "The mathematical pooling of mortgages genuinely eliminated default risk at the senior tranche level under any economic scenario",
            "The agencies were colluding with banks to commit securities fraud, which was later prosecuted successfully",
          ],
          correctIndex: 0,
          explanation:
            "Two factors explain the rating failures. First, the models: agencies assumed that regional housing defaults were largely independent — if California had problems, Florida wouldn't. This meant pooling created diversification. But when national home prices fell 32%, defaults were highly correlated everywhere, invalidating the models. Second, the incentive: agencies were paid by the investment banks issuing the securities. Banks could get multiple opinions and use the most favorable. After the crisis, 83% of 2006-vintage AAA mortgage CDOs were eventually downgraded to junk.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The decision to let Lehman Brothers fail was universally praised by economists as the correct policy choice, since it prevented 'moral hazard' and taught leveraged institutions a necessary lesson about risk.",
          correct: false,
          explanation:
            "False. The Lehman decision remains intensely debated. Critics argue it was a catastrophic policy error that transformed a serious crisis into a near-collapse of the global financial system. The 'moral hazard' lesson came at the cost of a money market run, a commercial paper freeze, and a financial panic that destroyed trillions in wealth and caused years of economic pain for ordinary people who had nothing to do with Wall Street's risk-taking. Fed Chair Bernanke later expressed regret about the outcome, though Treasury Secretary Paulson argued there was no legal authority to save Lehman.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: Crypto Cycles ──────────────────────────────────────────────────
    {
      id: "mb-4",
      title: "₿ Crypto Bubble Cycles",
      description:
        "ICO mania, the 2017 and 2021 bull runs, LUNA's death spiral, FTX's collapse, and on-chain bubble metrics",
      icon: "₿",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The 2017 Cycle: ICO Mania",
          content:
            "Bitcoin's first mainstream bubble produced one of the most concentrated episodes of speculative excess in modern financial history.\n\n**Bitcoin's 2017 ascent:**\n- Bitcoin began 2017 at ~$1,000 and reached a peak of ~$19,783 in December 2017 — a 1,878% gain in 12 months\n- Ethereum rose from $8 in January 2017 to ~$1,400 in January 2018 — a 17,400% gain\n\n**ICO (Initial Coin Offering) mania:**\n- Projects could raise millions in minutes by issuing tokens on Ethereum's blockchain\n- In 2017, ICOs raised $5.6 billion total\n- Many projects: a white paper PDF, a website, and a token — no working product\n- Tezos raised $232M; Filecoin raised $257M; both with no usable product at issuance\n- Ponzinomics: new ICO tokens often used to buy earlier tokens in a circular scheme\n\n**The bust:**\n- Bitcoin fell from $19,783 (December 2017) to $3,122 (December 2018) — an 84% decline\n- Ethereum fell from $1,400 to $83 — a 94% decline\n- ~80% of 2017 ICOs were deemed failures or outright scams by 2019\n- The SEC declared many ICOs were unregistered securities offerings and began enforcement action",
          highlight: ["ICO", "Bitcoin 2017", "Ethereum 1400", "84% decline", "SEC enforcement", "white paper fraud"],
        },
        {
          type: "teach",
          title: "The 2021 Cycle: DeFi, NFTs, and LUNA's Death Spiral",
          content:
            "The 2021 bull market was larger, more complex, and involved new financial primitives — each with its own bubble dynamic.\n\n**2021 highs:**\n- Bitcoin peaked at ~$69,000 in November 2021\n- Total crypto market cap reached $3 trillion\n- Ethereum enabled an explosion of DeFi (Decentralized Finance) protocols and NFTs (Non-Fungible Tokens)\n- NFTs peaked with Bored Ape Yacht Club NFTs selling for $400,000+ each\n\n**LUNA/UST — algorithmic stablecoin failure (May 2022):**\nTerra's UST was a \"stablecoin\" pegged to $1, backed not by dollars but by a circular mechanism:\n- UST could always be redeemed for $1 of LUNA\n- LUNA's value was in turn supported by demand for UST\n- This is the definition of an endogenous money loop — the peg only works while confidence holds\n\nIn May 2022, a large UST holder began redeeming. UST lost its peg. Panic selling of UST → minting more LUNA → LUNA price collapses → further loss of confidence. In 5 days, $40 billion in LUNA market cap was destroyed. UST fell from $1 to $0.0001.\n\n**FTX collapse (November 2022):**\nSam Bankman-Fried's FTX exchange commingled customer funds with its trading arm (Alameda Research). CoinDesk reported on Alameda's FTX token-heavy balance sheet; a bank run ensued. $8 billion in customer funds were missing. SBF was convicted of fraud in November 2023.",
          highlight: ["LUNA death spiral", "FTX fraud", "UST depeg", "NFT mania", "algorithmic stablecoin", "$3T peak"],
        },
        {
          type: "teach",
          title: "On-Chain Bubble Metrics: MVRV and NUPL",
          content:
            "Unlike traditional markets, crypto's public blockchain allows investors to measure market-wide profitability — creating unique on-chain indicators of bubble conditions.\n\n**MVRV Ratio (Market Value to Realized Value):**\n- **Market Value**: Current price × total supply = total market cap\n- **Realized Value**: Each coin valued at the price it last moved on-chain (approximate average cost basis)\n- **MVRV Ratio** = Market Value / Realized Value\n- MVRV > 3.5: historically indicates extreme overvaluation (bubble territory)\n- MVRV < 1: historically indicates undervaluation (coins trading below cost basis = capitulation)\n- Bitcoin's MVRV hit 7.1 in December 2017 peak; 3.9 in November 2021 peak\n\n**NUPL (Net Unrealized Profit/Loss):**\n- Measures the aggregate paper profit/loss of all Bitcoin holders\n- NUPL > 0.75: Euphoria zone — nearly all holders are in profit by large margins (historically precedes tops)\n- NUPL < 0: Capitulation zone — the average holder is underwater (historically near bottoms)\n\n**Cycle timing patterns:**\n- Bitcoin halvings (approximately every 4 years) reduce new supply issuance by 50%\n- Historically, bull markets peak 12–18 months after a halving\n- But past performance does not guarantee future results — each cycle attracted more institutional participants, which changes the dynamics",
          highlight: ["MVRV", "NUPL", "realized value", "on-chain metrics", "Bitcoin halving", "euphoria zone"],
        },
        {
          type: "quiz-mc",
          question:
            "What made the LUNA/UST collapse a 'death spiral' rather than an ordinary market crash?",
          options: [
            "The algorithmic peg created a reflexive loop where UST losing its peg triggered LUNA selling which destroyed the mechanism backing UST, accelerating further depegging",
            "Regulators froze LUNA trading accounts, preventing holders from selling and creating a one-sided market",
            "The collapse was caused by a hack that drained the Treasury's Bitcoin reserves that were meant to defend the $1 peg",
            "FTX's simultaneous collapse created a liquidity crisis that spread to LUNA holders who needed emergency capital",
          ],
          correctIndex: 0,
          explanation:
            "LUNA/UST was an endogenous money loop: UST's $1 peg was maintained by allowing redemption for $1 of LUNA at any time, and LUNA's value depended on demand for UST. When a large holder redeemed UST → LUNA supply increased → LUNA price fell → each UST redemption bought less confidence → more redemptions → more LUNA minting → more price collapse → complete peg failure. The mechanism that was supposed to maintain stability became the mechanism of destruction. This is exactly the Minsky dynamic applied to a crypto algorithmic stablecoin.",
          difficulty: 3,
        },
        {
          type: "quiz-tf",
          statement:
            "An MVRV ratio below 1.0 indicates that Bitcoin's market cap is below the aggregate cost basis of all holders, which has historically been associated with market tops and excessive optimism.",
          correct: false,
          explanation:
            "False. An MVRV below 1.0 means Bitcoin's current price is below the average price at which coins last moved on-chain — in other words, the average holder is underwater. This is associated with capitulation and historically near market bottoms, not tops. Market tops are associated with MVRV above 3.5–7.0, when nearly all holders are in large unrealized profits and the euphoria/NUPL metrics are at extremes. Low MVRV = pain and potential opportunity; high MVRV = euphoria and potential danger.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: Bubble Identification ──────────────────────────────────────────
    {
      id: "mb-5",
      title: "🔍 How to Identify a Bubble",
      description:
        "Shiller P/E, Tobin's Q, margin debt, sentiment surveys, and narrative analysis — a practical bubble-detection checklist",
      icon: "🔍",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "Valuation Metrics: Shiller P/E and Tobin's Q",
          content:
            "While no single metric reliably predicts bubble peaks, valuation measures can tell you how far prices are from historical norms.\n\n**Shiller P/E (CAPE — Cyclically Adjusted Price-to-Earnings):**\nDeveloped by Robert Shiller (Nobel laureate, 2013), CAPE divides the S&P 500 price by the average of the last **10 years** of inflation-adjusted earnings.\n- Why 10 years? It smooths out business cycle noise — a single year's earnings can spike or crash\n- **Long-run average**: ~17×\n- **Warning zone**: Above 30× (exceeded before the 1929 crash, 2000 dot-com peak, and 2021–present)\n- **January 2000 peak**: 44×\n- **December 2021**: 40×\n- **Limitation**: CAPE can stay elevated for years in low-rate environments; it is a tool for context, not timing\n\n**Tobin's Q Ratio:**\nDeveloped by James Tobin (Nobel laureate, 1981). Compares total market value of companies to the replacement cost of their physical assets.\n- Q = Market Cap of All US Stocks / Net Worth at Replacement Cost\n- **Q = 1**: Market values corporations at exactly the cost to rebuild them (theoretical equilibrium)\n- **Q > 2**: Extreme overvaluation — it would be cheaper to build new competitors than buy existing ones\n- Q peaked at 1.97 in 2000; 1.82 in 2021\n- Limitation: Q underweights intangible assets (brands, software, data) — biased upward in modern economy",
          highlight: ["Shiller P/E", "CAPE", "Tobin's Q", "cyclically adjusted", "replacement cost", "overvaluation"],
        },
        {
          type: "teach",
          title: "Sentiment and Leverage Indicators",
          content:
            "Valuations tell you whether prices are high; sentiment and leverage indicators tell you whether participants are positioned for a fall.\n\n**Sentiment indicators:**\n- **AAII Bull-Bear Spread**: American Association of Individual Investors weekly survey. Bull readings above 60% have historically preceded corrections. Bearish readings below 20% have often coincided with bottoms.\n- **Put/Call Ratio**: Measures options market hedging. Low put/call (< 0.6) indicates excessive complacency — few investors are buying downside protection.\n- **VIX (Fear Index)**: Below 12 = extreme complacency; above 40 = extreme fear\n- **Magazine cover indicator**: When Time or Newsweek feature a bull market story, the top is often near (BusinessWeek's \"The Death of Equities\" in 1979 preceded one of the greatest bull markets)\n\n**Leverage statistics:**\n- **NYSE Margin Debt**: Tracks total borrowing to buy stocks. When margin debt peaks and begins declining while prices remain high, it often precedes corrections.\n- **Debt-to-GDP**: Total non-financial debt as % of GDP — sustained readings above 250% have preceded every major deleveraging crisis since WWII\n- **Equity issuance surge**: IPO volume explodes near market peaks as insiders rush to sell at peak valuations\n- **SPACs and blank-check vehicles**: Surge of low-quality vehicles indicates supply overwhelming demand — a sign of late-cycle excess",
          highlight: ["AAII sentiment", "put/call ratio", "VIX", "margin debt", "IPO surge", "magazine cover indicator"],
        },
        {
          type: "teach",
          title: "Narrative Analysis and the Bubble Checklist",
          content:
            "Numbers tell part of the story — but narrative analysis identifies the \"this time is different\" thinking that characterizes every bubble.\n\n**Bubble narrative patterns:**\n- A new technology or paradigm is used to justify abandoning old valuation metrics\n- Traditional measures of risk (debt, P/E, cash flow) are reframed as irrelevant\n- Stories of overnight wealth proliferate in popular media\n- \"Fear of missing out\" (FOMO) explicitly drives buying decisions\n- Critics of the rally are dismissed as dinosaurs who \"don't understand the new economy\"\n\n**The Bubble Identification Checklist:**\n1. Is CAPE or Tobin's Q more than 1.5 standard deviations above its long-run average? (+1 point)\n2. Is margin debt or total leverage at multi-decade highs? (+1 point)\n3. Is IPO/SPAC issuance at a record pace? (+1 point)\n4. Are sentiment surveys showing extreme bullishness (AAII bulls > 60%)? (+1 point)\n5. Is the rally driven by a \"new paradigm\" narrative that dismisses traditional valuation? (+1 point)\n6. Are assets with no cash flow (meme stocks, speculative tokens, narrative coins) outperforming? (+1 point)\n7. Are ordinary individuals discussing investments socially who previously showed no interest? (+1 point)\n\n**Scoring:** 4+ points = elevated bubble risk. 6–7 points = extreme bubble risk.\n\n**Important caveat:** Bubbles can score 6/7 for years. This checklist identifies risk, not the timing of collapse. Markets can remain irrational longer than you can remain solvent.",
          highlight: ["bubble checklist", "this time is different", "FOMO", "narrative analysis", "overvaluation checklist"],
        },
        {
          type: "quiz-mc",
          question:
            "The Shiller P/E (CAPE ratio) divides current S&P 500 prices by 10-year average inflation-adjusted earnings rather than current-year earnings. Why use 10 years of earnings?",
          options: [
            "To smooth out business cycle volatility — a single year's earnings can be distorted by recessions or booms, making current-year P/E misleading as a valuation measure",
            "Because investors value stocks based on their next 10 years of expected earnings, making the 10-year average the best proxy for intrinsic value",
            "Tax law requires companies to amortize earnings over 10 years, making the 10-year average the most accurate accounting measure of profitability",
            "The SEC mandates 10-year earnings averages for all valuation reports to prevent market manipulation",
          ],
          correctIndex: 0,
          explanation:
            "CAPE uses 10-year average earnings to eliminate business cycle noise. In a recession year, current earnings might be depressed, making the market look expensive when it isn't. In a boom year, current earnings are high, making the market look cheap when valuations are stretched. By averaging across a full business cycle (~10 years), Shiller's CAPE gives a more stable picture of how expensive the market is relative to normalized earning power. This is why CAPE remains elevated through recessions — the denominator doesn't plunge just because one year's earnings fell.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "A high CAPE ratio of 35× or above reliably predicts that a stock market crash will occur within the next 12 months.",
          correct: false,
          explanation:
            "False. CAPE is a valuation measure, not a timing tool. The US CAPE ratio exceeded 30× in the mid-1990s and stayed elevated until the 2000 crash — meaning investors who sold when CAPE first hit 30× in 1996 missed 4 more years of large gains. Similarly, CAPE has been above 30× for much of 2017–present. High CAPE predicts poor long-run returns (10–20 year horizon) with reasonable accuracy, but is a terrible short-term timing indicator. As Keynes famously observed: 'Markets can remain irrational longer than you can remain solvent.'",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Surviving Bubbles ──────────────────────────────────────────────
    {
      id: "mb-6",
      title: " Surviving and Profiting from Bubbles",
      description:
        "When to reduce exposure, keeping perspective across multi-year manias, and capturing opportunities in the aftermath",
      icon: "",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Reducing Exposure: The Art of Partial Exits",
          content:
            "The hardest part of navigating a bubble is not identifying one — it is knowing what to do about it. The difficulty: bubbles can persist for years, and selling too early means watching others get rich.\n\n**Why timing the top is nearly impossible:**\n- Bubbles feed on their own momentum; the higher they go, the more compelling the narrative\n- Short-sellers face unlimited losses if wrong — many bubble shorts were wiped out\n- Keynes was supposedly ruined three times trying to time crashes before eventually going long\n\n**The partial exit framework:**\nRather than trying to call the top, use systematic rebalancing:\n- **Trim on strength**: If an asset exceeds its target allocation by 50%, sell down to target. Example: crypto grows from 5% to 10% of portfolio → sell half back to 5%.\n- **Quality rotation**: Replace speculative positions (high P/E, no earnings, narrative-driven) with quality (cash flow positive, reasonable valuation) as bubble metrics rise\n- **Reduce leverage**: Pay down margin in late-stage bubble environments; leverage amplifies downside\n- **Stagger exits over time**: Sell 20% of a position every quarter rather than going all-in/all-out\n\n**The real goal:**\nYou don't need to sell at the top. Selling at 80% of the peak and buying back at 120% of the bottom dramatically outperforms buy-and-hold through a -70% drawdown. You don't need to be perfect — just directionally correct.",
          highlight: ["partial exit", "rebalancing", "trim on strength", "reduce leverage", "quality rotation"],
        },
        {
          type: "teach",
          title: "Keeping Perspective: Bubbles Can Last Years",
          content:
            "Confirmation bias and the fear of missing out are the investor's greatest enemies during a bubble. Historical data reveals how long manias can persist before collapsing.\n\n**Timeline of major bubble durations:**\n- **1920s stock mania**: From first overvaluation signals (1925) to peak (September 1929) — 4 years\n- **Dot-com bubble**: Nasdaq first hit extreme valuations in 1997 — peak was March 2000 — 3 years\n- **Japanese real estate**: Tokyo land prices tripled from 1985 to 1991 — 6 years of excess\n- **US housing**: Subprime lending accelerated in 2003; prices peaked in 2006 — 3 years of mania\n- **Crypto 2017**: Bitcoin exceeded 2013 ATH in May 2017; peaked in December — 7 months\n- **Crypto 2021**: Bitcoin exceeded 2017 ATH in November 2020; peaked in November 2021 — 12 months\n\n**The cost of being early:**\nIf you sold Nasdaq stocks in 1997 at \"crazy\" valuations, you missed a 150% gain over the next 3 years. Trying to short Japanese real estate in 1987 meant 4 more years of losses.\n\n**Psychological tools for perspective:**\n- Keep a \"bubble journal\": record valuations, sentiment readings, and your reasoning periodically\n- Distinguish between \"the thesis is correct\" and \"now is the right time\"\n- Compare with historical precedents: am I at 1927 (early) or 1929 (late)?\n- Ensure your financial life can survive if the bubble continues for 3 more years — don't make existential bets",
          highlight: ["bubble duration", "mania timeline", "cost of being early", "bubble journal", "perspective"],
        },
        {
          type: "teach",
          title: "Opportunity in the Aftermath: Historical Recovery Timelines",
          content:
            "The aftermath of a bubble is historically one of the greatest investment opportunities — for those who survived with capital intact.\n\n**Recovery timelines after major crashes:**\n| Crash | Decline | Recovery to prior peak | Notes |\n|-------|---------|------------------------|-------|\n| 1929 Dow | -89% | 25 years (1954) | Depression + WWII |\n| Japan Nikkei 1989 | -82% | Still not recovered (35 years) | Structural deflation |\n| Nasdaq 2000 | -78% | 15 years (2015) | But FAANG exploded |\n| S&P 500 2009 | -57% | 4 years (2013) | Strong policy response |\n| Bitcoin 2017 | -84% | 3 years (Dec 2020) | New ATH 3 years later |\n| Bitcoin 2022 | -77% | ~2 years (late 2024) | Institutional adoption |\n\n**Key insights from recoveries:**\n- **Quality matters most**: Amazon recovered from -93% because the business was genuinely excellent. Pets.com never recovered because the business was fundamentally flawed.\n- **Policy response shapes recovery speed**: The 2009 S&P recovery (4 years) was far faster than 1929 (25 years) because of aggressive Fed and fiscal response\n- **Generational opportunities**: Buying Amazon at $7 (2001), Apple at $3 (2003 adjusted), or Bitcoin at $3,200 (December 2018) required conviction during maximum pessimism\n- **Averaging in**: Dollar-cost averaging over the 12 months after a -50%+ crash has historically produced exceptional 5–10 year returns\n\n**The post-bubble playbook:**\n1. Identify survivors with genuine competitive advantages\n2. Wait for capitulation (VIX spike, NUPL < 0, extreme pessimism in surveys)\n3. Build positions gradually over 6–12 months\n4. Hold through the slow recovery phase (2–5 years)",
          highlight: ["recovery timeline", "quality survivors", "dollar-cost averaging", "capitulation", "post-bubble opportunity"],
        },
        {
          type: "quiz-mc",
          question:
            "An investor identifies a likely stock market bubble in 2024 based on CAPE of 34, extreme AAII bullishness, and IPO surge. What is the most risk-managed response?",
          options: [
            "Gradually reduce allocation to speculative high-multiple positions and rebalance toward quality — without exiting equities entirely, since bubbles can persist for years",
            "Immediately liquidate all equity holdings and hold cash, since waiting for confirmation means leaving the exit too late",
            "Increase exposure to capture the final euphoric phase of the bubble, planning to sell the day the Nasdaq hits a new all-time high",
            "Short the most overvalued stocks heavily, since bubble identification gives a high-probability short signal",
          ],
          correctIndex: 0,
          explanation:
            "The partial reduction and quality rotation approach is most risk-managed because: (1) Bubbles can persist 3–5 years after first appearing overvalued — early full exit means missing substantial gains. (2) Shorting is extremely dangerous in bubble environments — your account can blow up before the thesis plays out. (3) Staying fully invested through a -70% crash is catastrophically painful. The optimal strategy is gradual de-risking: trim speculative positions, reduce leverage, rotate to quality, and hold some dry powder — accepting lower gains if the bubble continues in exchange for limited downside if it collapses.",
          difficulty: 3,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is October 2002. The Nasdaq has fallen 78% from its March 2000 peak. Amazon stock trades at $5.97 — down 94% from its 1999 high. The company has $1.1B in cash, growing revenues, and is 18 months away from its first profitable quarter. Most investors believe the internet sector is permanently impaired. AAII bearish sentiment is at 60%.",
          question:
            "From a post-bubble opportunity framework, what does this scenario represent?",
          options: [
            "A potential generational buying opportunity — capitulation signals, cash cushion, genuine business growth, and extreme pessimism historically combine at multi-year lows in quality survivors",
            "A value trap — Amazon's lack of profitability and the ongoing bear market sentiment confirm it should be avoided until earnings materialize",
            "An efficient market — the stock price fully reflects Amazon's fundamentals, and recovery to prior highs is unlikely given structural internet sector damage",
            "A speculative bet — buying Amazon at this point would require guessing which dot-com survivors would succeed, making it no better than a coin flip",
          ],
          correctIndex: 0,
          explanation:
            "This scenario describes the classic post-bubble capitulation opportunity. All the markers align: extreme pessimism (60% bears), a survivor with genuine competitive advantages (Amazon's logistics network, growing revenues, significant cash runway), and a price reflecting maximum fear rather than fundamentals. Amazon reached $100+ within 5 years and $3,000+ within 20 years. The post-bubble playbook identifies these moments: high-quality businesses at distressed prices during maximum pessimism, with patient capital and a multi-year time horizon. This is not a guaranteed win — but historically, systematically buying quality survivors at post-crash extremes has been one of the most effective long-term strategies.",
          difficulty: 3,
        },
      ],
    },
  ],
};
