import type { Unit } from "./types";

export const UNIT_MARKET_HISTORY: Unit = {
  id: "market-history",
  title: "Market History & Financial Crises",
  description:
    "Learn from the crashes, bubbles, and crises that shaped modern finance — from the Great Depression to the COVID crash",
  icon: "📜",
  color: "#92400e",
  lessons: [
    // ─── Lesson 1: The Great Depression & Early Markets ──────────────────────────
    {
      id: "mh-1",
      title: "📜 The Great Depression & Early Markets",
      description:
        "The roaring 20s, the 1929 crash, and the regulatory reforms that built the modern financial system",
      icon: "📜",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🎉 The Roaring 20s & Margin Mania",
          content:
            "The 1920s were a decade of explosive optimism — new industries like radio and automobiles were transforming society, and everyone wanted a piece of the action.\n\n**Widespread margin trading:** Investors could buy stocks with as little as **10% down**, borrowing the remaining 90% from brokers. If a stock rose 10%, you doubled your money. If it fell 10%, you were wiped out.\n\n**The boom era:**\n- Radio Corporation of America (RCA) rose 500%\n- Ford's assembly lines made cars accessible to the middle class\n- New speculative products proliferated — investment trusts (early mutual funds) levered up 3–4×\n- Ordinary workers, barbers, and taxi drivers were buying stocks on margin\n\nThis leverage created a fragile, unstable market where any downturn would cascade into forced selling.",
          highlight: ["margin trading", "leverage", "roaring 20s", "speculative bubble"],
        },
        {
          type: "teach",
          title: "📉 Black Thursday & Black Tuesday (1929)",
          content:
            "The party ended violently in October 1929.\n\n**Black Thursday (October 24, 1929):**\n- Nearly 13 million shares traded — unprecedented volume\n- Prices collapsed in panic selling\n- Leading bankers pooled $250M to prop up the market — it worked briefly\n\n**Black Tuesday (October 29, 1929):**\n- 16 million shares traded as panic overwhelmed any support\n- The Dow Jones fell sharply, erasing years of gains\n- Margin calls forced liquidation across the board — a self-reinforcing spiral\n\n**The total devastation:**\nFrom peak (September 1929) to trough (July 1932), the Dow fell **89%**. A $1,000 investment became $110. It took until **1954** — 25 years — for the Dow to recover its 1929 peak.",
          highlight: ["Black Thursday", "Black Tuesday", "margin calls", "89% decline", "1929 crash"],
        },
        {
          type: "teach",
          title: "🏦 Depression Causes & The New Deal Response",
          content:
            "The crash itself did not cause the Great Depression — policy failures transformed a recession into a decade-long catastrophe.\n\n**What went wrong:**\n- **Credit crunch**: Banks failed (9,000 bank failures 1930–1933), wiping out depositors\n- **Smoot-Hawley Tariff (1930)**: Raised tariffs on 20,000 imports → trading partners retaliated → global trade collapsed 65%\n- **Federal Reserve mistakes**: Instead of expanding money supply, the Fed *raised* interest rates, deepening the contraction\n- **Debt deflation spiral**: Falling prices made debt harder to repay, causing more defaults\n\n**New Deal responses (FDR, 1933–1938):**\n- **SEC created (1934)**: Securities and Exchange Commission to regulate markets and protect investors\n- **Glass-Steagall Act (1933)**: Separated commercial and investment banking\n- **FDIC**: Federal deposit insurance to prevent bank runs\n- **Social Security (1935)**: Safety net for elderly and unemployed\n\n**The ultimate recovery**: It was **WWII spending** — not the New Deal alone — that finally ended the Depression. Government spending soared to 40% of GDP, restoring full employment.",
          highlight: ["SEC", "Glass-Steagall", "FDIC", "Smoot-Hawley", "credit crunch", "New Deal"],
        },
        {
          type: "quiz-mc",
          question:
            "What regulatory body was created after the 1929 crash to protect investors and regulate securities markets?",
          options: [
            "The SEC (Securities and Exchange Commission), established in 1934",
            "The FDIC (Federal Deposit Insurance Corporation), established in 1933",
            "The Federal Reserve, established in 1913",
            "The CFTC (Commodity Futures Trading Commission), established in 1974",
          ],
          correctIndex: 0,
          explanation:
            "The SEC was created by the Securities Exchange Act of 1934 as a direct response to the speculative excesses and fraud exposed by the 1929 crash. It oversees securities markets, enforces disclosure requirements, and protects investors — functions that did not exist before the crash.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "The New Deal spending programs alone were sufficient to end the Great Depression and fully restore US economic output by 1938.",
          correct: false,
          explanation:
            "False. While the New Deal provided relief and reformed the financial system, unemployment remained above 14% in 1940. It was the massive fiscal stimulus of World War II — with government spending rising to ~40% of GDP — that truly ended the Depression and restored full employment.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 2: Post-War Markets & The 1970s ──────────────────────────────────
    {
      id: "mh-2",
      title: "🛢️ Post-War Markets & The 1970s",
      description:
        "Bretton Woods, the Nixon Shock, oil embargoes, and the stagflation decade that defined modern monetary policy",
      icon: "🛢️",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "🌍 Bretton Woods: The Dollar Rules the World",
          content:
            "In 1944, as WWII neared its end, 44 Allied nations met in Bretton Woods, New Hampshire to design the post-war monetary order.\n\n**The Bretton Woods system:**\n- The **US dollar** became the world's reserve currency\n- Every other currency was pegged to the dollar\n- The dollar itself was pegged to **gold at $35 per ounce**\n- Nations could redeem dollars for gold at any time\n\n**Why it worked initially:**\n- The US held ~75% of the world's gold reserves in 1945\n- The US economy was dominant — half of global GDP\n- It provided stability and predictability for international trade\n\n**The problem by the 1960s:**\nUS spending on Vietnam and Great Society programs flooded the world with dollars. Foreign nations began doubting the US could honor gold redemptions. France's Charles de Gaulle famously sent a warship to collect French gold from Fort Knox.",
          highlight: ["Bretton Woods", "reserve currency", "gold standard", "$35/oz", "dollar peg"],
        },
        {
          type: "teach",
          title: "💀 The Nixon Shock (1971) & Floating Rates",
          content:
            "On August 15, 1971, President Nixon appeared on television and announced the end of the gold standard — shocking global markets.\n\n**What Nixon did:**\n- Suspended dollar convertibility to gold — no more gold redemptions\n- Imposed a temporary 10% surcharge on imports\n- Imposed wage and price controls\n\n**Why it mattered for global finance:**\n- The Bretton Woods system collapsed — no more fixed exchange rates\n- All major currencies began **floating freely** against each other\n- Currency values now determined by markets (supply and demand)\n- Created an entirely new market: **foreign exchange (FX)** trading\n- Today FX is the world's largest financial market — $7.5 trillion per day\n\n**The lasting consequence:** Governments could now print money without gold constraints. This enabled larger fiscal deficits but also created the conditions for the inflation crisis that followed in the 1970s.",
          highlight: ["Nixon Shock", "gold standard", "floating exchange rates", "FX market", "1971"],
        },
        {
          type: "teach",
          title: "📈 Oil Embargo, Stagflation & The Volcker Cure",
          content:
            "The 1970s became the decade that broke conventional economic models.\n\n**OPEC oil embargo (October 1973):**\n- Arab OPEC members embargoed oil to nations supporting Israel in the Yom Kippur War\n- Oil prices **quadrupled** from $3 to $12 per barrel in months\n- Gas lines stretched for miles; energy prices fed into every product\n\n**Stagflation (1973–1982):**\n- Economists believed inflation and unemployment couldn't rise simultaneously — the 1970s proved them wrong\n- Inflation hit 14% in 1980; unemployment hit 10%\n- The Dow Jones returned **0% nominally** over the entire decade — and lost **~70% in real (inflation-adjusted) terms**\n- Stocks were so unloved that BusinessWeek ran a 1979 cover: *\"The Death of Equities\"*\n\n**The Volcker shock (1979–1982):**\nPaul Volcker, appointed Fed Chair by Carter, made a radical decision: raise rates until inflation breaks.\n- Fed Funds Rate peaked at **20% in June 1981**\n- Caused a severe double-dip recession; unemployment hit 10.8%\n- It worked: inflation fell from 14% to 3% by 1983\n- Set the stage for the great bull market of the 1980s–90s",
          highlight: ["OPEC", "oil embargo", "stagflation", "Volcker", "20% interest rates", "real returns"],
        },
        {
          type: "quiz-mc",
          question:
            "What is the \"Nixon Shock\" and why did it matter for global finance?",
          options: [
            "Nixon ended USD's gold convertibility in 1971, creating the modern floating exchange rate system",
            "Nixon imposed capital controls in 1971, restricting foreign investment in US assets",
            "Nixon devalued the dollar by 50% in 1971, causing a global currency crisis",
            "Nixon abandoned the Bretton Woods institutions in 1971, dissolving the IMF and World Bank",
          ],
          correctIndex: 0,
          explanation:
            "The Nixon Shock of August 1971 ended the Bretton Woods system by suspending dollar-gold convertibility. This created the modern floating exchange rate regime where currency values are determined by markets. It gave birth to the $7.5 trillion/day foreign exchange market and removed the gold constraint on government money creation.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "During the stagflation era of 1973–1982, the Dow Jones Industrial Average delivered strong nominal returns, but investors lost purchasing power due to high inflation.",
          correct: false,
          explanation:
            "False. The Dow returned approximately 0% even in nominal terms over this period — there were no strong nominal gains to be offset. Combined with inflation averaging ~8%, investors lost roughly 70% of their real purchasing power. It was one of the worst decades for US equities in history.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: Boom and Bust — 1980s to 2000 ─────────────────────────────────
    {
      id: "mh-3",
      title: "💻 Boom and Bust — 1980s to 2000",
      description:
        "Black Monday, the S&L crisis, LTCM's near-collapse, and the dot-com mania that ended in ruin",
      icon: "💻",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "📉 Black Monday 1987: The First Algorithmic Crash",
          content:
            "On October 19, 1987, the Dow Jones fell **22.6% in a single day** — the largest one-day percentage drop in US stock market history.\n\n**What caused it:**\n- **Portfolio insurance**: Institutional investors used computer programs to automatically sell stock futures when prices fell, theoretically capping losses\n- **Program trading feedback loop**: As prices fell, programs triggered more selling → prices fell more → more programs triggered\n- **Overvalued market**: The Dow had risen 250% in 5 years; P/E ratios were stretched\n- **Global contagion**: Markets in Hong Kong fell 45%, London fell 26% that week\n\n**The aftermath:**\n- The Fed under Alan Greenspan injected liquidity and cut rates — markets recovered within 2 years\n- NYSE installed **circuit breakers** — automatic trading halts if markets fall too fast\n- Introduced the concept of the *\"Greenspan put\"* — the idea that the Fed would always bail out markets\n\nThe 1987 crash was a warning about how automated trading can amplify volatility beyond human control.",
          highlight: ["Black Monday", "22.6%", "program trading", "portfolio insurance", "circuit breakers"],
        },
        {
          type: "teach",
          title: "🏦 S&L Crisis & LTCM's Near Miss",
          content:
            "Two crises in the 1980s–90s previewed the systemic fragility that would explode in 2008.\n\n**Savings & Loan (S&L) Crisis (1980s–1990s):**\n- ~1,000 savings & loan thrifts (small banks focused on mortgages) failed\n- Cause: deregulation let thrifts make risky commercial real estate bets; fraud was rampant\n- The **Resolution Trust Corporation** wound down failed institutions\n- Total cost to taxpayers: **$160 billion** — the largest financial bailout in US history at the time\n\n**LTCM Collapse (1998):**\nLong-Term Capital Management was a hedge fund with two Nobel laureates on its team and PhD physicists designing its models.\n- LTCM had **$125 billion in assets** and **$1.25 trillion in derivatives exposure** — 100× leverage\n- Strategy: arbitrage tiny pricing differences between bonds worldwide\n- When Russia defaulted in 1998, correlations blew up — all their positions moved against them simultaneously\n- The Fed orchestrated a **$3.6 billion bailout** by 14 major banks to prevent a global financial cascade\n- Lesson: **models don't capture tail risks** — extreme events happen far more often than normal distributions predict",
          highlight: ["S&L crisis", "LTCM", "leverage", "systemic risk", "tail risk", "bailout"],
        },
        {
          type: "teach",
          title: "🚀 Dot-Com Bubble: Rise and Collapse",
          content:
            "From 1995 to 2000, the internet transformed the economy — and sparked one of the greatest speculative bubbles in history.\n\n**The boom (1995–2000):**\n- Nasdaq rose **400%** in 5 years\n- Companies with no revenue raised hundreds of millions in IPOs\n- Pets.com raised $82M in its March 2000 IPO with a sock puppet mascot — went bankrupt 9 months later\n- Webvan (online grocery) raised $375M in its IPO and spent $1B building infrastructure before collapsing\n- The mantra: *\"Get big fast\"* — market share mattered more than profits\n- Price-to-sales ratios for internet companies often exceeded 100×\n\n**The bust (2000–2002):**\n- Nasdaq peaked at 5,048 on March 10, 2000\n- Over the next 2.5 years it fell **78%** to 1,114\n- Trillions of dollars in market cap evaporated\n- Many companies went to zero; others like Amazon fell 90% but survived\n- The dot-com era established that **the internet would be transformative** — but investors vastly overestimated the speed and discounted profitability entirely",
          highlight: ["dot-com bubble", "Nasdaq +400%", "Pets.com", "Webvan", "78% decline", "internet bubble"],
        },
        {
          type: "quiz-mc",
          question:
            "What caused Black Monday in 1987, when the Dow fell 22.6% in a single day?",
          options: [
            "Program trading and portfolio insurance created a feedback loop that amplified the 22.6% single-day drop",
            "A major bank failure triggered a credit freeze that shut down stock trading globally",
            "The Federal Reserve unexpectedly raised interest rates by 5% overnight",
            "A congressional tax bill eliminating favorable capital gains treatment passed unexpectedly",
          ],
          correctIndex: 0,
          explanation:
            "Black Monday was primarily driven by program trading and portfolio insurance — computer-driven strategies that automatically sold stock futures as prices declined. This created a self-reinforcing feedback loop: falling prices triggered automated selling, which caused further price declines, which triggered more automated selling. It was an early warning about how algorithmic trading can amplify market volatility.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "LTCM had $125B in assets and $1.25T in derivatives exposure (100× leverage). When Russia defaulted in 1998, all their bets moved against them simultaneously. Their models assumed correlations would behave normally during stress — they didn't.",
          question:
            "What is the primary risk management lesson from the LTCM collapse?",
          options: [
            "Models calibrated on normal market conditions fail to capture tail risks — extreme events correlate in ways models don't predict",
            "Hedge funds should never use derivatives because they are inherently too dangerous",
            "Nobel laureates should not manage money because academic theories don't apply in practice",
            "The Fed should have let LTCM fail to teach hedge funds a lesson about leverage",
          ],
          correctIndex: 0,
          explanation:
            "LTCM's models assumed that bond price differences would converge as usual. But during the Russian crisis, every position moved against them at once — correlations 'went to 1.' This is the classic tail risk problem: normal-distribution models dramatically underestimate the probability of extreme events and the correlation structure during crises. Risk models must account for fat tails and crisis correlations.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 4: The 2008 Financial Crisis ─────────────────────────────────────
    {
      id: "mh-4",
      title: "🏠 The 2008 Financial Crisis",
      description:
        "Subprime mortgages, CDOs, Lehman's collapse, and the policy response that reshaped global finance",
      icon: "🏠",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "🏡 The Subprime Mortgage Boom",
          content:
            "The seeds of the 2008 crisis were planted in the US housing market through a combination of loose lending, misaligned incentives, and regulatory blindness.\n\n**The lending machine:**\n- **Low-doc loans**: Borrowers could get mortgages with minimal income verification (\"stated income\" or \"liar loans\")\n- **No-income-no-asset (NINJA) loans**: No documentation required at all\n- **Adjustable-rate mortgages (ARMs)**: Teaser rates of 1–2% for 2 years, then reset to market rates — many borrowers couldn't afford the reset\n- Mortgage brokers earned fees for originating loans they immediately sold — they had no skin in the game\n\n**The housing bubble:**\n- US home prices rose 124% from 1997 to 2006\n- Homeownership rate hit a record 69%\n- The assumption underlying all models: **house prices never fall nationally**\n\nThis assumption was catastrophically wrong.",
          highlight: ["subprime", "NINJA loans", "ARM", "adjustable rate", "housing bubble", "no-doc loans"],
        },
        {
          type: "teach",
          title: "🔗 The Securitization Chain: MBS → CDO → CDO²",
          content:
            "Wall Street transformed risky mortgages into securities that pension funds and banks worldwide were happy to buy — hiding the risk in complex structures.\n\n**The chain:**\n1. **Mortgages** originated by banks and brokers\n2. **MBS (Mortgage-Backed Securities)**: Thousands of mortgages pooled together; investors receive monthly payments\n3. **CDO (Collateralized Debt Obligation)**: Tranches of MBS bundled together. Top tranches rated AAA — in theory, only fail if millions of homeowners default simultaneously\n4. **CDO² (CDO squared)**: Tranches of CDOs bundled again, adding another layer of complexity\n5. **CDS (Credit Default Swaps)**: Insurance-like contracts on CDOs — AIG sold billions worth\n\n**Why ratings agencies failed:**\n- Models assumed local housing markets were independent — they weren't\n- AAA-rated CDOs were full of subprime loans\n- Rating agencies were paid by the issuers — a massive conflict of interest\n\nRisk was obscured and spread globally — European banks, Japanese investors, pension funds all held toxic US mortgage debt.",
          highlight: ["MBS", "CDO", "CDO squared", "CDS", "securitization", "AAA ratings", "AIG"],
        },
        {
          type: "teach",
          title: "💥 Lehman Collapses & The Cascade",
          content:
            "On September 15, 2008, Lehman Brothers filed for bankruptcy — the largest in US history at the time — and the global financial system nearly stopped functioning.\n\n**The cascade:**\n- Money market funds held Lehman debt; the Reserve Primary Fund **\"broke the buck\"** (fell below $1 NAV) — triggering a $200B+ run on money markets\n- Commercial paper markets froze — companies couldn't roll short-term debt\n- Interbank lending seized; banks didn't trust each other's balance sheets\n- The Dow fell **54%** from peak to trough (October 2007 – March 2009)\n- **$17 trillion** in household wealth was destroyed\n\n**The government response:**\n- **TARP**: $700B Troubled Asset Relief Program — capital injections into banks\n- **Fed balance sheet**: Expanded from $900B to $4.5T (5× expansion) via Quantitative Easing (QE)\n- **ZIRP**: Zero Interest Rate Policy held until December 2015\n- **Dodd-Frank (2010)**: New regulations — stress tests, higher capital ratios, Volcker Rule, resolution plans\n- **Moral hazard debate**: Bailouts saved the system but rewarded risk-taking — fueling public anger",
          highlight: ["Lehman Brothers", "bankruptcy", "money market", "TARP", "QE", "Dodd-Frank", "54% decline"],
        },
        {
          type: "quiz-mc",
          question:
            "What does \"CDO\" stand for and what role did it play in the 2008 financial crisis?",
          options: [
            "Collateralized Debt Obligation; bundled mortgages into tranches, obscuring risk and spreading contagion globally",
            "Credit Default Option; a derivative that insured banks against individual loan defaults",
            "Consolidated Debt Offering; a government program to refinance homeowner mortgages",
            "Correlated Default Obligation; a product specifically designed to amplify returns in bull markets",
          ],
          correctIndex: 0,
          explanation:
            "A CDO (Collateralized Debt Obligation) pools debt instruments (like MBS tranches) and creates new tranches with different risk profiles. Rating agencies assigned AAA ratings to top CDO tranches, but the underlying assets were often subprime mortgages. When housing prices fell nationally — something models deemed nearly impossible — the CDO structure amplified losses and spread them to institutions worldwide, including European banks and pension funds.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The Federal Reserve's balance sheet remained roughly stable during the 2008 crisis response because the government used fiscal policy (TARP) rather than monetary policy to stabilize markets.",
          correct: false,
          explanation:
            "False. The Fed's balance sheet expanded dramatically — from approximately $900 billion to over $4.5 trillion, a 5× increase — through Quantitative Easing (QE) programs. TARP was the fiscal response ($700B in Treasury funding), while QE was the monetary response. Both were deployed simultaneously. The Fed also held interest rates near zero (ZIRP) from late 2008 through December 2015.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 5: COVID Crash & Modern Markets ───────────────────────────────────
    {
      id: "mh-5",
      title: "🦠 COVID Crash & Modern Markets",
      description:
        "The fastest crash ever, meme stocks, SPAC mania, rate hike carnage, and the AI bull market",
      icon: "🦠",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "⚡ The COVID Crash: Fastest 30% Drop Ever",
          content:
            "In February–March 2020, a global pandemic triggered the fastest market crash in recorded history.\n\n**The speed was unprecedented:**\n- The S&P 500 fell **34%** in just **33 days** from peak to trough (February 19 – March 23, 2020)\n- For context, the 1929 crash took 2+ years to reach its trough; 2008 took 17 months\n- Circuit breakers triggered multiple times in a single week\n- Oil futures briefly traded at **negative prices** as storage ran out\n\n**The V-shaped recovery:**\n- Massive fiscal stimulus: **$2.2T CARES Act** passed in March 2020\n- Fed cut rates to zero and launched unlimited QE within days\n- The market bottomed March 23 and recovered to new all-time highs by **August 2020** — just 5 months\n- This was the fastest bear market recovery in history\n\n**Who benefited:**\n- Stay-at-home stocks exploded: Zoom +400%, Peloton +440%, Moderna +700%\n- E-commerce accelerated 5 years of adoption in 5 months\n- Wealth inequality widened: asset owners recovered instantly; workers in hospitality/travel suffered for years",
          highlight: ["COVID crash", "33 days", "34% decline", "CARES Act", "V-shaped recovery", "QE"],
        },
        {
          type: "teach",
          title: "🎮 Meme Stocks & The Retail Revolution",
          content:
            "In January 2021, a coordinated Reddit community took on Wall Street hedge funds — and briefly won.\n\n**The GameStop saga:**\n- GameStop (GME) was a dying video game retailer; short interest exceeded **140% of the float** — hedge funds were massively short\n- Reddit's **WallStreetBets** community (4M members at the time) recognized the setup: if they bought en masse, shorts would be squeezed\n- GME surged from $18 to **$483 in January 2021** — a **1,700% gain** in weeks\n- Short sellers including Melvin Capital lost billions; Melvin needed a $2.75B emergency bailout\n- Robinhood controversially **restricted buying** of GME on January 28, citing clearinghouse requirements — igniting public fury\n\n**Broader meme stock phenomenon:**\n- AMC, BlackBerry, Bed Bath & Beyond all surged on Reddit coordination\n- Revealed how short squeezes work and how retail investors can move markets\n- Democratized finance discourse — but also showed retail investors the dangers of buying at the peak of a squeeze\n\n**SPAC boom and bust:**\n- 2020–21: 863 SPACs raised $257B — a blank-check company vehicle for taking companies public\n- By 2022–23: Most SPACs traded **below their $10 trust value**; many acquisitions destroyed shareholder value",
          highlight: ["GameStop", "WallStreetBets", "short squeeze", "meme stocks", "SPAC", "1,700% surge"],
        },
        {
          type: "teach",
          title: "🔺 Rate Hike Carnage & The AI Bull Market",
          content:
            "After years of near-zero rates, the Fed's fastest hiking cycle in 40 years devastated markets — before AI reignited a new bull run.\n\n**2022 rate hike cycle:**\n- Inflation hit **9.1% in June 2022** — the highest since 1981\n- The Fed raised rates from 0.25% to **5.25%** in just 18 months — the fastest pace since Volcker\n- Results:\n  - Nasdaq fell **33%** in 2022\n  - US bonds had their **worst year since 1788** (the bond market is typically a safe haven)\n  - ARK Innovation ETF (high-growth tech) fell **75%** from peak\n  - Crypto: Bitcoin fell from $69,000 to $16,000; FTX collapsed in $8B fraud\n\n**AI bull market (2023–2024):**\n- ChatGPT launched November 2022 → AI became the dominant investment theme\n- **NVIDIA**: +200%+ as demand for AI chips exploded (GPU shortage)\n- The **Magnificent 7** (Apple, Microsoft, Alphabet, Amazon, Meta, Tesla, NVIDIA) drove the majority of S&P 500 returns\n- S&P 500 returned 26% in 2023 and 25% in 2024 despite high interest rates\n- Market concentration reached levels not seen since the 1960s Nifty Fifty era",
          highlight: ["rate hikes", "9.1% inflation", "Nasdaq -33%", "NVIDIA", "Magnificent 7", "AI bull market", "FTX"],
        },
        {
          type: "quiz-mc",
          question:
            "Why did GameStop's stock surge approximately 1,700% in January 2021?",
          options: [
            "Reddit's WallStreetBets coordinated buying to force a short squeeze on hedge funds that were heavily short the stock",
            "GameStop announced a surprise pivot to digital gaming and cryptocurrency that dramatically improved its outlook",
            "A major activist investor revealed a large stake and a turnaround plan for the company",
            "The company reported quarterly earnings that far exceeded analyst expectations",
          ],
          correctIndex: 0,
          explanation:
            "GameStop's surge was driven by a short squeeze orchestrated by Reddit's WallStreetBets community. With short interest exceeding 140% of the float, retail investors realized that coordinated buying would force short sellers to cover their positions — buying shares to close their shorts, pushing prices even higher in a self-reinforcing loop. This is a classic short squeeze, magnified by the unprecedented coordination of retail investors via social media.",
          difficulty: 1,
        },
        {
          type: "quiz-scenario",
          scenario:
            "In 2022, the Federal Reserve raised interest rates from 0.25% to 5.25% in 18 months to combat 9.1% inflation. The Nasdaq fell 33%, long-duration US bonds fell ~18% (their worst year since 1788), and ARK Innovation ETF fell 75% from its peak.",
          question:
            "Why did rising interest rates cause such severe damage to growth stocks and long-duration bonds?",
          options: [
            "Higher rates increase the discount rate used to value future cash flows, making distant earnings worth far less today — punishing high-multiple growth stocks and long-duration bonds",
            "Higher rates directly reduce corporate revenues because consumers borrow less to buy products",
            "The Fed's rate hikes signaled that a recession was imminent, so investors fled all risk assets",
            "Rising rates caused the dollar to strengthen, hurting multinational companies' foreign revenues",
          ],
          correctIndex: 0,
          explanation:
            "Duration risk is the key mechanism. Both long-duration bonds and high-multiple growth stocks derive most of their value from cash flows far in the future. When the discount rate rises, those future cash flows are worth dramatically less in present value terms. A stock with no profits for 10 years is particularly sensitive: at 1% rates, those future earnings are barely discounted; at 5% rates, 10 years of discounting slashes their present value by ~40%. This is why rate-sensitive assets — bonds, growth tech, SPACs, crypto — all collapsed together in 2022.",
          difficulty: 3,
        },
      ],
    },
  ],
};
