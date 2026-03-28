import type { Unit } from "./types";

export const UNIT_CAPITAL_MARKETS_HISTORY: Unit = {
  id: "capital-markets-history",
  title: "History of Capital Markets",
  description:
    "From the Dutch East India Company's first IPO to high-frequency trading — trace 400 years of financial innovation, crashes, and the institutions that shaped modern markets",
  icon: "🏛️",
  color: "#8B5CF6",
  lessons: [
    // ─── Lesson 1: The Birth of Capital Markets ───────────────────────────────────
    {
      id: "cmh-1",
      title: "🏛️ The Birth of Capital Markets",
      description:
        "How the Dutch invented the joint-stock company, the first IPO, and the world's first stock exchange in 17th-century Amsterdam",
      icon: "🏛️",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "The Problem of Financing Long Voyages",
          content:
            "Before capital markets existed, funding large ventures required either royal patronage or wealthy individual merchants willing to risk their entire fortune on a single expedition.\n\n**The challenge of maritime trade:**\nA voyage from Europe to Asia in the early 1600s took 2–3 years and carried enormous risks — storms, pirates, spoiled cargo, and hostile ports. A single merchant who financed a ship could be ruined if it sank.\n\n**Early solutions — and their limits:**\n- **Commenda contracts**: A merchant could take a silent partner who contributed capital; profits were shared on return\n- **Family partnerships**: Extended merchant families pooled resources across generations\n- **Royal charters**: Kings granted monopolies to favored merchants in exchange for a share of profits\n\nAll of these approaches had one critical constraint: **capital was locked up** for the duration of the voyage. Investors could not exit early. And the amount of capital that could be raised was limited to what a small circle of wealthy individuals would commit.\n\nTo fund the truly enormous enterprises of global trade — fleets of dozens of ships, colonial infrastructure, military protection — the world needed a new invention.",
          highlight: ["commenda contracts", "capital locked up", "royal charters", "maritime trade"],
        },
        {
          type: "teach",
          title: "The Dutch East India Company (VOC) — The First IPO, 1602",
          content:
            "In 1602, the Dutch Republic created something that had never existed before: a company whose ownership was divided into tradeable shares open to any investor.\n\n**The Vereenigde Oost-Indische Compagnie (VOC):**\n- Founded by charter from the States-General of the Dutch Republic\n- Given a 21-year monopoly on all Dutch trade east of the Cape of Good Hope\n- Authorized to wage war, negotiate treaties, and establish colonies\n\n**The first public offering:**\nThe VOC raised **6.5 million guilders** from thousands of investors across Amsterdam, Middelburg, and other Dutch cities. This was not a loan — investors received **shares of ownership** (participaties). Anyone could invest, from wealthy merchants to artisans.\n\n**Why this was revolutionary:**\n- **Limited liability**: If the VOC failed, investors lost only their investment — not their personal assets\n- **Perpetual existence**: Unlike partnerships that dissolved when a partner died, the company continued indefinitely\n- **Transferable ownership**: Shares could be sold to other investors — creating the need for a marketplace\n\nThe VOC became the most valuable company in history at its peak, worth an estimated $8 trillion in today's dollars, with fleets, armies, and territorial control across Asia.",
          highlight: ["VOC", "1602", "first IPO", "6.5 million guilders", "limited liability", "transferable shares"],
        },
        {
          type: "teach",
          title: "The Amsterdam Stock Exchange — The World's First",
          content:
            "With tradeable VOC shares in circulation, merchants needed a place to buy and sell them. Amsterdam naturally became that place.\n\n**The Amsterdam Bourse (Amsterdamsche Wisselbank):**\n- The Amsterdam Exchange Bank was founded in 1609; the stock exchange operated in the Beurs building from 1611\n- Traders met twice daily to buy and sell VOC shares and government bonds\n- Created the first recognizable secondary market — investors could exit positions without waiting for the company to return profits\n\n**Financial innovations born in Amsterdam:**\n- **Short selling**: Traders sold shares they didn't own, hoping to buy them back cheaper — the practice was controversial from the start\n- **Options and futures**: By the 1630s, traders were writing contracts to buy/sell shares at a fixed price on a future date\n- **Margin trading**: Brokers extended credit so traders could buy more shares than they could afford outright\n- **Price discovery**: The daily auction process aggregated information from thousands of traders into a single price\n\n**The first speculative bubble:**\nIn 1636–37, tulip bulbs — not stocks — became the subject of a famous frenzy. At its peak, a single Semper Augustus tulip bulb sold for 5,500 guilders — more than a skilled craftsman earned in a decade. When the market collapsed in February 1637, it became history's most famous cautionary tale about speculative excess.",
          highlight: ["Amsterdam Bourse", "1609", "short selling", "options", "futures", "margin trading", "tulip mania"],
        },
        {
          type: "quiz-mc",
          question:
            "What made the VOC's 1602 share offering historically significant compared to earlier methods of financing ventures?",
          options: [
            "It offered tradeable ownership shares with limited liability to a broad public, creating the first liquid secondary market",
            "It was the first company to pay regular dividends, giving investors a predictable income stream",
            "It was the first company to use government bonds to finance its operations rather than equity",
            "It was the first company chartered by a monarch, giving it legal protection unavailable to private firms",
          ],
          correctIndex: 0,
          explanation:
            "The VOC introduced the combination of limited liability, perpetual corporate existence, and transferable ownership shares available to any investor — not just wealthy partners. This meant risk was distributed across thousands of investors, capital could be raised at a scale never before seen, and investors could exit by selling to others rather than waiting years for returns. These features define the modern stock market.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The Amsterdam Stock Exchange of the early 1600s was limited to trading VOC shares and did not develop sophisticated instruments like options or futures until the 19th century.",
          correct: false,
          explanation:
            "False. By the 1630s, Amsterdam traders had already developed options (the right to buy/sell shares at a set price) and futures contracts. The exchange was also the birthplace of short selling and margin trading. These instruments emerged organically from the needs of traders seeking to hedge risk and speculate on price movements — remarkably quickly after the first shares began trading in 1602.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: London, New York, and the Rise of Modern Exchanges ─────────────
    {
      id: "cmh-2",
      title: "🎩 London, New York & Exchange Foundations",
      description:
        "The London Stock Exchange's 1801 founding, the NYSE's Buttonwood Agreement of 1792, and how rival exchanges shaped global capitalism",
      icon: "🎩",
      xpReward: 80,
      difficulty: "beginner",
      steps: [
        {
          type: "teach",
          title: "London's Coffee Houses and the Birth of the LSE",
          content:
            "In late 17th-century London, financial markets developed not in formal buildings but in the coffee houses of Exchange Alley.\n\n**Jonathan's Coffee House:**\n- From the 1690s, brokers and jobbers gathered at Jonathan's Coffee House in Change Alley to trade shares\n- The coffeehouse published stock and commodity prices — an early form of market data\n- The 1720 **South Sea Bubble** — when shares of the South Sea Company rose 800% before collapsing — demonstrated both the power and danger of speculation\n- After the crash, the British government passed the **Bubble Act (1720)**, restricting the formation of joint-stock companies for over a century\n\n**The London Stock Exchange (1801):**\n- After decades of informal trading, brokers formalized their organization\n- A new building opened at Capel Court in 1801, with the name \"The Stock Exchange\" formally adopted\n- Members paid annual fees and operated under a written rule book\n- The LSE became the center of global capital markets throughout the 19th century, financing railways, canals, and Britain's colonial empire\n\n**The LSE's 19th century dominance:**\nBritain's position as the world's leading industrial and colonial power meant London was where capital flowed. By 1900, the LSE listed securities from every continent — railway bonds from Argentina, mining shares from South Africa, government debt from India and Egypt.",
          highlight: ["Jonathan's Coffee House", "South Sea Bubble", "Bubble Act 1720", "London Stock Exchange 1801", "Capel Court"],
        },
        {
          type: "teach",
          title: "The Buttonwood Agreement and the NYSE (1792)",
          content:
            "Across the Atlantic, New York's financial market began under a buttonwood tree — or so the legend goes.\n\n**Revolutionary War debt and early US securities:**\nAfter independence, the US government issued bonds to pay Revolutionary War debts. Secretary of the Treasury Alexander Hamilton created a national bank and standardized federal debt — giving traders something to buy and sell.\n\n**The Buttonwood Agreement (May 17, 1792):**\n- 24 stockbrokers and merchants signed an agreement under a buttonwood tree at 68 Wall Street\n- They agreed to trade securities only among themselves and to charge a minimum commission of 0.25%\n- This gentlemen's agreement was the founding document of what became the New York Stock Exchange\n\n**Growth of the NYSE in the 19th century:**\n- The Erie Canal (1817–25) required massive bond issuance — Wall Street helped finance it\n- **Railroad mania** of the 1840s–60s: Railway companies raised enormous sums on the NYSE; by 1860, railroad stocks were the dominant asset class\n- **Civil War bonds**: The Union sold $2.6 billion in government bonds, and Jay Cooke syndicated them to ordinary Americans — pioneering mass retail investing\n- In 1863, the exchange officially adopted the name \"New York Stock Exchange\"\n- The NYSE's formal trading floor, fixed commissions, and listing requirements gave investors confidence — key to attracting capital",
          highlight: ["Buttonwood Agreement", "1792", "NYSE", "Alexander Hamilton", "railroad mania", "Jay Cooke", "Wall Street"],
        },
        {
          type: "teach",
          title: "The Ticker Tape Revolution and Early Market Data",
          content:
            "The speed of information has always determined who wins and loses in financial markets. The telegraph transformed everything.\n\n**Before the ticker (pre-1867):**\n- Stock prices were communicated by messenger boys running between brokers\n- Investors outside New York learned prices hours or days late\n- Regional exchanges in Philadelphia and Boston had persistent price discrepancies\n\n**The Stock Ticker (1867):**\n- Edward Calahan invented the stock ticker — a machine that printed abbreviated stock symbols and prices on a paper tape\n- Thomas Edison improved the design in 1869, creating the Universal Stock Printer\n- Within years, ticker machines were installed in brokerage offices across the country\n- For the first time, investors in Chicago could trade on nearly the same information as traders in New York\n\n**The impact on markets:**\n- **Arbitrage narrowed**: Price differences between cities collapsed as information equalized\n- **Speculation increased**: Real-time prices enabled more active trading\n- **Bucket shops emerged**: Storefront operations where ordinary people bet on stock price movements without owning shares — a form of proto-CFD trading that regulators eventually shut down\n\n**J.P. Morgan and the era of the \"Money Trust\":**\nBy 1900, a small group of financiers — J.P. Morgan, John D. Rockefeller, Andrew Carnegie — controlled enormous flows of capital. Morgan personally organized the **Panic of 1907** bailout, coordinating private banks to stem a financial crisis before any government institution existed to do so. This episode led directly to the creation of the **Federal Reserve in 1913**.",
          highlight: ["stock ticker", "1867", "Edward Calahan", "Thomas Edison", "arbitrage", "J.P. Morgan", "Panic of 1907", "Federal Reserve 1913"],
        },
        {
          type: "quiz-mc",
          question:
            "What was the Buttonwood Agreement of 1792, and why is it historically significant?",
          options: [
            "A pact among 24 brokers to trade only among themselves with fixed commissions — the founding document of the NYSE",
            "A law passed by Congress establishing the rules and regulatory structure for US securities markets",
            "An agreement between the US Treasury and private banks to finance Revolutionary War debt through bond auctions",
            "A treaty between New York and Philadelphia exchanges to prevent competition and protect broker profits",
          ],
          correctIndex: 0,
          explanation:
            "The Buttonwood Agreement was a voluntary accord among 24 New York brokers and merchants, signed on May 17, 1792, to trade securities exclusively among themselves and maintain a minimum commission. This self-regulatory agreement became the organizational basis of the New York Stock Exchange, which formally adopted that name in 1863. It established the principle of a members-only exchange with standardized rules — a model that spread globally.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The London Stock Exchange was formally established before the New York Stock Exchange, with the LSE's founding in 1801 coming nine years after the Buttonwood Agreement of 1792.",
          correct: true,
          explanation:
            "True. The Buttonwood Agreement that founded the precursor to the NYSE was signed in 1792, and the London Stock Exchange formally opened its Capel Court building in 1801 — nine years later. However, the informal London coffee house market at Jonathan's had been operating since the 1690s, nearly a century before New York's market began. Both evolved from informal gatherings into formal institutions with written rules and physical trading floors.",
          difficulty: 1,
        },
      ],
    },

    // ─── Lesson 3: The Great Depression, SEC Formation & Post-WWII Growth ─────────
    {
      id: "cmh-3",
      title: "📋 Regulation, Reform & Postwar Boom",
      description:
        "The 1929 crash and margin mania that led to the SEC, Glass-Steagall, and the great postwar bull market that built the American middle class",
      icon: "📋",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The 1929 Crash — Markets Without Rules",
          content:
            "The US stock market of the 1920s operated with almost no federal oversight. The consequences were catastrophic.\n\n**The unregulated 1920s market:**\n- **Margin trading without limits**: Investors could buy stocks with 10% down (90% borrowed). Any 10% price decline wiped you out\n- **Pools and manipulation**: Syndicates of wealthy investors would quietly accumulate a stock, then publicly promote it. Uninformed buyers would pile in; insiders would sell at the peak, leaving latecomers with losses\n- **No disclosure requirements**: Companies could issue stock with minimal financial disclosure. Audited statements were voluntary\n- **Investment trusts**: Leveraged funds of funds — some levered 3–4× — spread the speculative mania to ordinary savers\n\n**The crash of 1929:**\n- Black Thursday (October 24) and Black Tuesday (October 29) saw panic selling of historic proportions\n- From September 1929 to July 1932, the Dow Jones fell **89%**\n- 9,000 banks failed between 1930–1933, wiping out depositors' life savings\n- Unemployment reached **24.9%** by 1933\n\nThe catastrophe exposed what happens when capital markets operate without transparency, investor protection, or systemic safeguards.",
          highlight: ["1929 crash", "margin trading", "pool manipulation", "no disclosure", "89% decline", "9,000 bank failures"],
        },
        {
          type: "teach",
          title: "FDR's New Deal: The SEC and Modern Market Regulation",
          content:
            "The legislative response to the 1929 crash created the regulatory architecture that still governs US capital markets today.\n\n**The Securities Act of 1933 (\"Truth in Securities\" Act):**\n- Required companies to register with the government before selling securities to the public\n- Mandated disclosure of material financial information in a prospectus\n- Imposed civil and criminal liability for fraud in securities offerings\n- Principle: investors should have **full and fair disclosure** to make informed decisions\n\n**The Securities Exchange Act of 1934:**\n- Created the **Securities and Exchange Commission (SEC)** with broad authority to regulate exchanges, brokers, and issuers\n- Required ongoing disclosure (annual reports, quarterly reports) from public companies\n- Prohibited **market manipulation** — the pools and pump-and-dump schemes of the 1920s\n- Regulated short selling and margin requirements\n- Joseph Kennedy (JFK's father) was appointed as the first SEC chairman — a former stock speculator who understood the tricks\n\n**Glass-Steagall Act (1933):**\n- Separated commercial banking (deposits and loans) from investment banking (securities underwriting)\n- Created the FDIC — federal deposit insurance, ending bank runs by guaranteeing deposits up to a limit\n- Lasted until its repeal by Gramm-Leach-Bliley in 1999 — many blamed that repeal for contributing to the 2008 crisis\n\n**The lasting impact:**\nThe 1933–34 Acts transformed American capital markets from a casino for insiders into a system with rules, transparency, and accountability — enabling the long post-war boom.",
          highlight: ["Securities Act 1933", "Securities Exchange Act 1934", "SEC", "Glass-Steagall", "FDIC", "disclosure requirements", "Joseph Kennedy"],
        },
        {
          type: "teach",
          title: "The Great Postwar Bull Market (1945–1972)",
          content:
            "Following WWII, the US economy and capital markets entered one of the greatest growth periods in history.\n\n**The foundations of postwar prosperity:**\n- **GI Bill (1944)**: Millions of veterans received education benefits and home loans, building the middle class\n- **Pent-up demand**: 15 years of Depression and war had suppressed consumption; Americans were ready to spend\n- **Baby boom**: 76 million babies born 1946–1964 created decades of consumer demand\n- **Marshall Plan**: US financed European reconstruction, creating export markets and cementing dollar dominance\n\n**Capital markets expansion:**\n- The Dow Jones rose from 150 in 1942 to over 1,000 by the late 1960s — a 6× increase\n- **Mutual funds democratized investing**: The Investment Company Act of 1940 regulated mutual funds; by the 1960s, millions of Americans owned fund shares\n- **The \"Nifty Fifty\" (late 1960s–early 70s)**: 50 large-cap growth stocks — IBM, Xerox, Coca-Cola, McDonald's — traded at extreme valuations (P/Es of 40–90×), seen as \"one-decision stocks\" to buy and hold forever\n\n**The Nifty Fifty bubble burst (1973–74):**\n- The Arab oil embargo and Watergate scandal triggered a brutal bear market\n- The S&P 500 fell **48%** from January 1973 to October 1974\n- Nifty Fifty stocks fell far more — Polaroid fell 91%, Avon fell 86%\n- Lesson: even great companies can be terrible investments at the wrong price",
          highlight: ["GI Bill", "postwar boom", "mutual funds", "Nifty Fifty", "P/E of 40–90", "1973–74 bear market", "48% decline"],
        },
        {
          type: "quiz-mc",
          question:
            "What was the primary purpose of the Securities Act of 1933, passed in the wake of the 1929 market crash?",
          options: [
            "To require companies to provide full financial disclosure before selling securities to the public, ending the information asymmetry that enabled 1920s fraud",
            "To establish the Federal Reserve's authority to regulate interest rates and control the money supply",
            "To create the Securities and Exchange Commission as an independent regulator of US financial markets",
            "To ban margin trading entirely, preventing the leveraged speculation that caused the 1929 crash",
          ],
          correctIndex: 0,
          explanation:
            "The Securities Act of 1933 was a disclosure law — its core principle was that investors deserve full and fair information before investing. It required registration and a prospectus with material financial data for new securities offerings, and imposed liability for fraudulent statements. The SEC was actually created by the separate Securities Exchange Act of 1934. Margin trading was regulated but not banned.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "Glass-Steagall's separation of commercial and investment banking, enacted in 1933, remained in force until it was repealed in 1999 — and many analysts blamed its repeal for contributing to the conditions that led to the 2008 financial crisis.",
          correct: true,
          explanation:
            "True. The Glass-Steagall Act of 1933 separated commercial banks (which take deposits) from investment banks (which underwrite securities) for 66 years. The Gramm-Leach-Bliley Act of 1999 repealed this separation, allowing financial conglomerates to combine both activities. Critics argue this allowed banks to take on excessive risk with insured deposits, contributing to the mortgage securitization excesses of the 2000s. The debate over whether to restore Glass-Steagall continues today.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: The Electronic Trading Revolution & the Modern Era ─────────────
    {
      id: "cmh-4",
      title: "⚡ The Electronic Trading Revolution",
      description:
        "How computers transformed markets from shouting pits to microsecond algorithms — and what the 2008 crisis taught us about modern financial fragility",
      icon: "⚡",
      xpReward: 90,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "From Open Outcry to Electronic Markets (1970s–2000s)",
          content:
            "For most of capital market history, trading was a physical, human activity. Computers changed everything.\n\n**Open outcry in its prime:**\n- Trading floors were chaotic arenas where hundreds of traders in colored jackets used hand signals and shouted orders\n- The NYSE specialist system: a designated market maker for each stock who was obligated to buy and sell to maintain an orderly market\n- Transactions were recorded on paper tickets, then punched into computers by clerks\n- Settlement took **5 business days** (T+5) — eventually reduced to T+2 today\n\n**The computerization milestones:**\n- **NASDAQ (1971)**: The world's first electronic stock market. No trading floor — dealers quoted prices on computer screens. Originally home to smaller, technology companies\n- **NYSE DOT system (1976)**: Direct Order Turnaround — small orders routed electronically to specialists\n- **Black Monday 1987**: When markets crashed 22.6%, paper-based systems were overwhelmed; orders took hours to execute. This accelerated electronic adoption\n- **Decimalization (2001)**: US stocks began trading in cents instead of fractions (eighths, sixteenths), dramatically narrowing bid-ask spreads and hurting traditional market makers\n- **Reg NMS (2005)**: SEC regulation requiring best-price execution across all exchanges, accelerating fragmentation into multiple competing electronic venues\n\n**The disappearing trading floor:**\nBy 2010, over 70% of NYSE volume was electronic. The iconic trading floor became largely ceremonial. The last major US floor-based commodity pit, the CME Group's Eurodollar options, closed in 2021.",
          highlight: ["NASDAQ 1971", "open outcry", "NYSE specialist", "decimalization 2001", "Reg NMS", "electronic trading", "Black Monday 1987"],
        },
        {
          type: "teach",
          title: "Algorithmic and High-Frequency Trading",
          content:
            "The shift to electronic markets opened the door to a new form of market participant: computers that trade in microseconds.\n\n**Algorithmic trading (early 2000s):**\n- Algorithms replaced human judgment for executing large orders — slicing a 1-million-share order into thousands of small pieces to minimize market impact\n- **VWAP** (Volume-Weighted Average Price) algorithms became standard: execute trades proportionally to volume throughout the day\n- Program trading (buying/selling baskets of stocks) enabled index arbitrage — keeping index ETF prices aligned with underlying holdings\n\n**High-Frequency Trading (HFT) — born ~2005:**\n- HFT firms co-located servers in exchange data centers, reducing latency to microseconds (millionths of a second)\n- Strategies: market making (posting bids and offers, earning tiny spreads millions of times per day), statistical arbitrage, latency arbitrage\n- By 2010, HFT accounted for an estimated **50–60% of all US equity volume**\n- HFT firms collectively earn small, consistent profits but contribute to tighter bid-ask spreads for retail investors\n\n**Controversies:**\n- **Flash Crash (May 6, 2010)**: The Dow Jones fell nearly **1,000 points in minutes** and partially recovered — caused by algorithmic feedback loops and HFT firms withdrawing liquidity\n- Michael Lewis's *Flash Boys* (2014) argued HFT firms had an unfair structural advantage, sparking public debate\n- SEC and CFTC investigations led to new circuit breakers and market safeguards\n\n**The arms race:**\nFirms invested hundreds of millions in microwave towers and transatlantic fiber cables to shave microseconds off trade execution — an escalating technological competition for marginal speed advantages.",
          highlight: ["algorithmic trading", "HFT", "co-location", "Flash Crash 2010", "VWAP", "50–60% of volume", "Michael Lewis"],
        },
        {
          type: "teach",
          title: "2008: Lessons for Modern Capital Markets",
          content:
            "The 2008 global financial crisis was the most severe market dislocation since 1929. Its lessons shaped modern market structure.\n\n**What went wrong (capital markets perspective):**\n- **Securitization opacity**: Mortgage-backed securities (MBS) and CDOs were so complex that even sophisticated buyers didn't understand what they owned\n- **OTC derivatives**: $600 trillion in notional over-the-counter derivatives — credit default swaps, interest rate swaps — traded with no central clearing or exchange reporting. No one knew total exposures\n- **Repo market fragility**: Banks financed long-term assets with overnight repo funding. When confidence evaporated, lenders refused to roll overnight loans, creating instant liquidity crises\n- **Rating agency failures**: AAA ratings assigned to securities that proved nearly worthless, misled pension funds and foreign investors\n\n**Post-2008 reforms to capital markets:**\n- **Dodd-Frank Act (2010)**: Required most OTC derivatives to be centrally cleared and reported to trade repositories — bringing transparency to a previously dark market\n- **Volcker Rule**: Prohibited proprietary trading by deposit-taking banks, attempting to prevent bank capital from funding speculative bets\n- **Stress tests**: Annual Federal Reserve tests require major banks to prove they can survive severe hypothetical scenarios\n- **Systemic risk designation**: Large institutions deemed \"too big to fail\" — SIFIs (Systemically Important Financial Institutions) — face enhanced oversight\n\n**The enduring lesson:**\nCapital markets are self-reinforcing systems. In good times, leverage and optimism amplify gains. In crises, the same mechanisms amplify losses. Every major regulatory reform in history — 1933, 1934, 1940, 2010 — was born from a crisis that exposed gaps in the previous framework.",
          highlight: ["2008 crisis", "securitization", "OTC derivatives", "repo market", "Dodd-Frank 2010", "Volcker Rule", "stress tests", "SIFI"],
        },
        {
          type: "quiz-mc",
          question:
            "NASDAQ, founded in 1971, represented a fundamental departure from traditional stock exchanges like the NYSE. What made it different?",
          options: [
            "It was the world's first fully electronic market with no physical trading floor, where dealers quoted prices on computer screens",
            "It was the first exchange to offer options and futures alongside equities, creating an integrated derivatives market",
            "It was the first exchange to allow retail investors to trade directly without going through a broker",
            "It was the first exchange to operate 24 hours a day, allowing trading across global time zones",
          ],
          correctIndex: 0,
          explanation:
            "NASDAQ (National Association of Securities Dealers Automated Quotations) launched in 1971 as the world's first electronic stock market. Unlike NYSE's physical floor with specialist market makers, NASDAQ operated entirely through a computer network where registered dealers posted competitive bid and ask prices. This made it the natural home for technology companies, eventually listing Microsoft, Apple, Intel, and Amazon. Its electronic model became the template for modern global exchanges.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The 2010 Flash Crash, in which the Dow Jones fell nearly 1,000 points in minutes before recovering, demonstrated that algorithmic trading had eliminated market volatility by providing continuous liquidity.",
          correct: false,
          explanation:
            "False. The Flash Crash of May 6, 2010 demonstrated the opposite: algorithmic systems — particularly HFT firms — rapidly withdrew liquidity during the chaos, amplifying the price dislocations rather than dampening them. A large algorithmic sell order triggered feedback loops among automated systems. Some stocks briefly traded at absurd prices — a few large-cap stocks touched one cent while others hit $100,000. The event led to new circuit breakers and market safeguards designed to slow automated feedback loops during extreme volatility.",
          difficulty: 2,
        },
      ],
    },
  ],
};
