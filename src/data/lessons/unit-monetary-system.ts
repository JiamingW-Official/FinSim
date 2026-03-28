import type { Unit } from "./types";

export const UNIT_MONETARY_SYSTEM: Unit = {
  id: "monetary-system",
  title: "Global Monetary System & Currency Competition",
  description:
    "Explore the architecture of the international monetary order — from Bretton Woods to dollar dominance, de-dollarization pressures, currency wars, CBDCs, and what it all means for investors",
  icon: "Globe",
  color: "#0369a1",
  lessons: [
    // ─── Lesson 1: Bretton Woods to Today ───────────────────────────────────────
    {
      id: "monetary-system-1",
      title: "Bretton Woods to Today",
      description:
        "Gold standard origins, the Bretton Woods system, Nixon's 1971 shock, the petrodollar era, and today's floating exchange rate regime",
      icon: "History",
      xpReward: 80,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Gold Standard and Its Collapse",
          content:
            "For most of the 19th and early 20th centuries, major currencies were directly convertible to gold at fixed rates — the **classical gold standard**.\n\n**How it worked**:\n- Every dollar, pound, or franc was backed by a specific quantity of gold held in reserve.\n- Exchange rates were fixed; trade imbalances were self-correcting via gold flows.\n- Countries running deficits lost gold, contracted their money supply, and deflated — restoring competitiveness automatically.\n\n**Why it broke down**:\n- WWI forced governments to suspend gold convertibility to finance war spending.\n- The interwar attempt to restore gold (1920s) was deflationary and contributed to the Great Depression.\n- Countries competed to devalue their currencies to boost exports — early \"currency wars.\"\n- By 1933, the US under FDR banned private gold ownership and revalued gold from $20.67 to $35/oz.\n\n**Legacy**: The gold standard enforced monetary discipline but lacked flexibility during crises. Its rigidity turned banking panics into prolonged depressions, forcing economies to deflate rather than stimulate.",
          highlight: ["gold standard", "fixed exchange rates", "trade imbalances", "gold flows", "deflation"],
        },
        {
          type: "teach",
          title: "Bretton Woods, Nixon Shock, and the Petrodollar",
          content:
            "**The Bretton Woods System (1944–1971)**:\n- In July 1944, 44 Allied nations met in Bretton Woods, New Hampshire to design the postwar monetary order.\n- Key agreement: All currencies pegged to the **US dollar**, with the dollar alone convertible to gold at **$35/oz** (foreign governments only — not US citizens).\n- The US held ~70% of global gold reserves at the time, making this credible.\n- Created the **IMF** (International Monetary Fund) and **World Bank** as institutional pillars.\n- Result: A dollar-centric system with the benefits of fixed rates but the US bearing the burden of gold convertibility.\n\n**The Triffin Dilemma**: Economist Robert Triffin warned in 1960 that the US would need to run persistent trade deficits to supply dollars to the world — but this would eventually undermine confidence in dollar-gold convertibility.\n\n**Nixon Shock (August 15, 1971)**:\n- By 1971, US gold reserves had halved as allies redeemed dollars for gold. The system was unsustainable.\n- President Nixon unilaterally ended dollar-gold convertibility: \"We are all Keynesians now.\"\n- The world shifted to **floating exchange rates** — currencies now valued by market supply and demand.\n\n**The Petrodollar System**:\n- In 1974, the US and Saudi Arabia struck a deal: OPEC nations price and sell oil exclusively in dollars; the US provides security guarantees.\n- This created structural demand for dollars globally — any country buying oil needs dollars first.\n- Recycled petrodollars flowed back into US Treasury bonds, financing American deficits.",
          highlight: ["Bretton Woods", "Nixon shock", "gold convertibility", "petrodollar", "floating exchange rates", "Triffin Dilemma"],
        },
        {
          type: "quiz-mc",
          question:
            "The Nixon Shock of 1971 refers to which major monetary policy event?",
          options: [
            "The US ending dollar-gold convertibility, transitioning the world to floating exchange rates",
            "The US imposing a 10% tariff on all imports to balance trade deficits",
            "The Fed raising interest rates to 20% to combat inflation",
            "Nixon devaluing the dollar by 50% against the Japanese yen",
          ],
          correctIndex: 0,
          explanation:
            "On August 15, 1971, President Nixon announced the end of dollar-gold convertibility — foreign governments could no longer redeem dollars for gold at $35/oz. This collapsed the Bretton Woods system and ushered in the era of floating exchange rates, where currency values are determined by market forces rather than fixed pegs.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "Under the Bretton Woods system, all major currencies were directly pegged to gold at a fixed rate.",
          correct: false,
          explanation:
            "False. Under Bretton Woods, other currencies were pegged to the US dollar — only the dollar was convertible to gold (at $35/oz, for foreign governments). This made the system dollar-centric rather than a direct multi-currency gold standard. The US dollar served as the world's reserve currency and the anchor of the entire system.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "It is 1968. US trade deficits are growing as European economies recover and compete with American exports. France's President de Gaulle is aggressively exchanging French-held dollars for gold at the Treasury, and US gold reserves are falling rapidly.",
          question: "Which concept best explains why this situation made the Bretton Woods system unsustainable?",
          options: [
            "The Triffin Dilemma — supplying dollars to the world required US deficits that eventually undermined gold convertibility credibility",
            "The Phillips Curve — low US unemployment was causing inflation to erode the dollar's value",
            "Operation Twist — the Fed was distorting the yield curve beyond what gold reserves could support",
            "The Greenspan Put — financial market rescues were depleting US gold reserves",
          ],
          correctIndex: 0,
          explanation:
            "The Triffin Dilemma predicted this exact outcome: the US had to run deficits to provide dollars to a growing global economy, but accumulating deficits caused foreign holders to doubt the US could honor gold convertibility. De Gaulle's gold redemptions were a rational response to this credibility gap. The system collapsed in 1971 when Nixon cut the gold link entirely.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 2: Dollar Dominance ─────────────────────────────────────────────
    {
      id: "monetary-system-2",
      title: "Dollar Dominance",
      description:
        "Reserve currency status and the exorbitant privilege, SWIFT's role, dollar invoice share, and the global dollar debt machine",
      icon: "DollarSign",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "The Exorbitant Privilege",
          content:
            "French Finance Minister Valery Giscard d'Estaing coined the term **\"exorbitant privilege\"** in the 1960s to describe the unique advantages the US gains from issuing the world's reserve currency.\n\n**What reserve currency status means**:\n- The US dollar accounts for approximately **58–60% of global foreign exchange reserves** held by central banks worldwide (down from ~71% in 2000).\n- Other countries hold dollars as their financial safety net — creating permanent, structural demand for US assets.\n\n**The privileges**:\n1. **Cheap borrowing**: The US can borrow at lower interest rates because there is always demand for dollar-denominated assets (US Treasuries). Estimates: 50–100 bps cheaper than comparable economies.\n2. **Seigniorage income**: The US earns income on the dollars circulating globally — printing a $100 bill costs pennies but buys $100 of real goods from abroad.\n3. **Trade invoicing advantage**: The US pays for imports in its own currency. If the dollar weakens, US import prices rise in dollar terms — but the US never faces a currency mismatch.\n4. **Sanctions power**: Because most global transactions clear through the dollar system, the US can exclude countries from international trade by cutting off dollar access.\n5. **Unlimited crisis borrowing**: In a crisis, the US can print dollars. No other country can do this without triggering a currency collapse.",
          highlight: ["exorbitant privilege", "reserve currency", "foreign exchange reserves", "seigniorage", "sanctions power"],
        },
        {
          type: "teach",
          title: "SWIFT, Dollar Invoice Share, and Global Dollar Debt",
          content:
            "**SWIFT (Society for Worldwide Interbank Financial Telecommunication)**:\n- A messaging network used by ~11,000 financial institutions in 200+ countries to transmit payment orders.\n- Not a settlement system itself — it sends the instructions; actual dollar clearing runs through **Fedwire** and the **Clearing House Interbank Payments System (CHIPS)** in New York.\n- The dollar's dominance means ~40% of SWIFT messages are dollar-denominated.\n- **Weaponization**: In 2012, Iran was cut off from SWIFT; in 2022, Russia's major banks were excluded after the Ukraine invasion — demonstrating dollar/SWIFT as a geopolitical weapon.\n\n**Dollar invoice share**:\n- Roughly **40–50% of global trade** is invoiced in US dollars, far exceeding the US share of world trade (~13%).\n- Oil, metals, and most commodities are priced in dollars — creating dollar demand even for trade that doesn't involve the US.\n- Academic research (Gopinath et al.) shows that dollar invoicing means US monetary policy propagates globally — a Fed rate hike tightens financial conditions in countries that never trade with America.\n\n**Global dollar debt**:\n- An estimated **$13+ trillion** in dollar-denominated debt is held outside the United States.\n- Non-US corporations borrow in dollars to access deeper capital markets and lower rates.\n- This creates systemic risk: when the dollar strengthens or the Fed hikes, the real burden of foreign dollar debt rises — triggering EM crises, corporate defaults, and capital outflows.",
          highlight: ["SWIFT", "dollar invoicing", "global dollar debt", "CHIPS", "Fedwire", "dollar weaponization"],
        },
        {
          type: "quiz-mc",
          question:
            "What does 'exorbitant privilege' specifically refer to in the context of the US dollar?",
          options: [
            "The unique economic advantages the US gains from issuing the world's primary reserve currency, including cheaper borrowing and seigniorage",
            "The Fed's exclusive right to set global interest rates at international monetary summits",
            "The privilege of US banks to bypass SWIFT and settle transactions through a private network",
            "The US government's right to audit foreign central bank gold reserves",
          ],
          correctIndex: 0,
          explanation:
            "The exorbitant privilege refers to the structural benefits the US receives from the dollar being the world's reserve currency: cheaper borrowing rates, seigniorage income from globally circulating dollars, the ability to pay for imports in its own currency, and the power to impose financial sanctions. The term was coined by French Finance Minister Giscard d'Estaing as a critique of American monetary dominance.",
          difficulty: 1,
        },
        {
          type: "quiz-tf",
          statement:
            "SWIFT is a settlement system that directly moves dollar funds between banks around the world.",
          correct: false,
          explanation:
            "False. SWIFT is a messaging network — it transmits payment instructions between banks, but does not itself move funds. Actual dollar settlement occurs through Fedwire (for large-value domestic transfers) and CHIPS (the Clearing House Interbank Payments System), both operating in New York. This distinction matters because cutting a bank from SWIFT disrupts its ability to communicate payment orders, not the underlying settlement infrastructure.",
          difficulty: 2,
        },
        {
          type: "quiz-mc",
          question:
            "Why does a Federal Reserve interest rate hike often trigger financial stress in emerging market countries that conduct little trade with the United States?",
          options: [
            "Dollar-denominated EM debt becomes more expensive to service, and capital flows toward higher-yielding US assets, weakening EM currencies",
            "The Fed's rate hikes directly control interest rates in all countries that use SWIFT",
            "EM countries are required by IMF rules to match any Fed rate increase within 30 days",
            "US rate hikes reduce American demand for all goods, causing global deflation",
          ],
          correctIndex: 0,
          explanation:
            "Many EM countries and corporations borrow in US dollars. When the Fed hikes rates and the dollar strengthens, the local-currency cost of servicing dollar debt rises — sometimes triggering defaults or currency crises. Simultaneously, higher US yields pull capital away from EM investments. This transmission of Fed policy to EM economies that don't trade much with the US is a direct consequence of dollar dominance and widespread dollar invoicing.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 3: De-dollarization Trends ─────────────────────────────────────
    {
      id: "monetary-system-3",
      title: "De-dollarization Trends",
      description:
        "BRICS currency discussions, gold reserve accumulation, bilateral trade deals, CIPS as a SWIFT alternative, and the slow decline of the dollar's reserve share",
      icon: "TrendingDown",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "BRICS Currency Ambitions and Gold Accumulation",
          content:
            "**De-dollarization** refers to the gradual reduction of the US dollar's role in global trade, reserves, and financial transactions. It is a decades-long structural trend, not an imminent collapse.\n\n**BRICS currency discussions**:\n- Brazil, Russia, India, China, and South Africa (BRICS) — expanded to include Egypt, Ethiopia, Iran, Saudi Arabia, and the UAE in 2024.\n- Recurring proposals for a **BRICS reserve currency** or settlement unit to reduce dollar dependence.\n- The 2023 Johannesburg summit discussed a common currency but reached no agreement — the member economies are too structurally different, with competing interests and non-convertible currencies.\n- Reality check: A successful reserve currency requires deep liquid bond markets, rule of law, and open capital accounts — features most BRICS members lack.\n\n**Gold reserve accumulation**:\n- Central banks globally bought a record **1,082 tonnes** of gold in 2022 and **1,037 tonnes** in 2023 — led by China, Poland, Singapore, Turkey, and India.\n- **Motivation**: Gold is neutral — it cannot be sanctioned or frozen by the US Treasury. After Russia's $300B in reserves were frozen in 2022, central banks globally reassessed dollar reserve concentration.\n- China's official gold reserves have risen to ~2,260 tonnes (though analysts estimate actual holdings are much higher, with undisclosed purchases routed through state banks).\n- Gold as a share of global reserves has risen from ~11% in 2015 to ~15%+ in 2024.",
          highlight: ["de-dollarization", "BRICS", "gold reserves", "reserve currency", "sanctions", "Russia reserves frozen"],
        },
        {
          type: "teach",
          title: "Bilateral Trade Deals, CIPS, and Dollar Share Decline",
          content:
            "**Bilateral trade deal currency arrangements**:\n- China has signed local currency swap agreements with 40+ central banks, enabling trade settlement in yuan without converting through dollars.\n- Russia-China trade: ~90% now settled in rubles and yuan (up from ~25% in 2021), driven by sanctions cutting Russia off from dollar systems.\n- Saudi Arabia-China energy deals: Ongoing discussions about yuan-denominated oil contracts (\"petroyuan\") — would directly challenge the petrodollar system.\n- India-Russia: Rupee-ruble trade agreements for oil purchases, though settlement friction remains high.\n\n**CIPS (Cross-Border Interbank Payment System)**:\n- China launched CIPS in 2015 as a yuan-denominated alternative to SWIFT/CHIPS for cross-border payments.\n- As of 2024, ~160 direct participants and ~1,300+ indirect participants in 110+ countries.\n- Key limitation: CIPS still processes only yuan transactions and relies partly on SWIFT messages for international routing — it is complementary to, not fully independent of, SWIFT.\n\n**Dollar reserve share decline**:\n- The dollar's share of global FX reserves fell from ~71% (2000) to ~58% (2024) — a 13 percentage point decline over 24 years.\n- The decline has been gradual and broad: gains spread across euro, yuan, Canadian dollar, Australian dollar, and other non-traditional reserve currencies.\n- The yuan's reserve share remains modest at ~2.3% despite China's size — reflecting capital controls and underdeveloped bond markets.",
          highlight: ["CIPS", "yuan", "petroyuan", "bilateral trade", "dollar reserve share", "local currency swap"],
        },
        {
          type: "quiz-tf",
          statement:
            "The US dollar's share of global foreign exchange reserves has remained essentially constant at around 70–71% since 2000.",
          correct: false,
          explanation:
            "False. The dollar's share of global FX reserves has declined from approximately 71% in 2000 to around 58% by 2024 — a 13 percentage point decline. This gradual diversification reflects growing reserve accumulation in euros, yuan, and other currencies. However, the dollar remains by far the dominant reserve currency, and no single alternative has absorbed the decline.",
          difficulty: 1,
        },
        {
          type: "quiz-mc",
          question:
            "Why did China's launch of CIPS (Cross-Border Interbank Payment System) fail to become a full SWIFT replacement for most international transactions?",
          options: [
            "CIPS only processes yuan-denominated transactions and partly relies on SWIFT messaging for international routing",
            "The US Treasury legally prevented foreign banks from joining CIPS under secondary sanctions",
            "CIPS was exclusively designed for intra-BRICS trade and cannot process payments outside member countries",
            "CIPS operates only 4 hours per day due to Chinese banking regulations",
          ],
          correctIndex: 0,
          explanation:
            "CIPS is limited to yuan-denominated transactions and still uses SWIFT for some international message routing — it complements rather than replaces SWIFT. More fundamentally, the yuan represents only ~2.3% of global FX reserves and faces capital controls, making widespread global adoption unlikely. A genuine SWIFT replacement would require an open-capital-account, liquid-market currency — which the yuan currently is not.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "Following the freezing of $300 billion in Russian central bank reserves in 2022, the central banks of India, Saudi Arabia, and Turkey all significantly increased their gold purchases over the next 18 months.",
          question: "What strategic logic best explains this behavior?",
          options: [
            "Gold is a neutral reserve asset that cannot be frozen or sanctioned by any foreign government, reducing geopolitical reserve risk",
            "Gold generates higher yields than US Treasuries, making it the preferred reserve asset for maximizing income",
            "IMF rules require central banks to hold a minimum percentage of reserves in gold following any geopolitical crisis",
            "The countries expected a return to the gold standard and were pre-positioning for that transition",
          ],
          correctIndex: 0,
          explanation:
            "The freezing of Russian reserves demonstrated that dollar-denominated assets (US Treasuries, bank deposits) can be immobilized by US government action. Gold held in a country's own vaults cannot be sanctioned, frozen, or controlled by any foreign authority. This made gold attractive to countries that perceived themselves as potentially adversarial to the US — or simply wanted to reduce single-counterparty risk in their reserve portfolios.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 4: Currency Wars ─────────────────────────────────────────────────
    {
      id: "monetary-system-4",
      title: "Currency Wars",
      description:
        "Competitive devaluation, beggar-thy-neighbor policies, the Plaza Accord (1985), the Swiss franc ceiling removal (2015), and Bank of Japan interventions",
      icon: "Swords",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Competitive Devaluation and Beggar-Thy-Neighbor",
          content:
            "**Currency wars** occur when countries deliberately weaken their currencies to gain trade advantages — at each other's expense.\n\n**Why devalue?**\n- A weaker currency makes a country's exports **cheaper in foreign markets** → export volumes rise.\n- It makes imports **more expensive** → domestic consumers substitute toward local goods.\n- Net effect: A boost to domestic GDP at the expense of trading partners' exports.\n\n**Beggar-thy-neighbor**: The term for policies that improve one country's position by harming others. Used during the 1930s Great Depression when countries competed to devalue, imposing tariffs and triggering retaliatory spirals.\n\n**How governments devalue**:\n1. **Direct intervention**: Central bank sells its own currency in FX markets, buying foreign currency → increases supply of home currency → price falls.\n2. **Interest rate cuts**: Lower rates make a currency less attractive to foreign investors → capital outflows → currency weakens.\n3. **Verbal intervention**: Government officials jawbone the currency down with statements.\n4. **Capital controls**: Limiting outflows to prevent the currency from rising (e.g., China's daily band fixing).\n\n**The collective action problem**: If every country devalues simultaneously, no one gains a trade advantage — but everyone gets higher import inflation and a destabilized global trading system. This is why the 1930s experience drove the creation of the IMF to coordinate exchange rate policies.",
          highlight: ["competitive devaluation", "beggar-thy-neighbor", "currency intervention", "capital controls", "IMF", "1930s"],
        },
        {
          type: "teach",
          title: "Plaza Accord, SNB Ceiling Removal, and BoJ Interventions",
          content:
            "**The Plaza Accord (September 1985)**:\n- The US dollar had appreciated ~50% from 1980–1985 due to high interest rates under Volcker, devastating American manufacturing exports.\n- Finance ministers of the **G5** (US, UK, West Germany, France, Japan) met at the Plaza Hotel in New York.\n- Agreement: Coordinated central bank intervention to **weaken the dollar** through joint FX market selling and interest rate adjustments.\n- Result: The dollar fell ~50% against the yen and Deutsche mark over the next two years.\n- Consequence for Japan: The sharp yen appreciation hurt Japanese exporters, prompting the BoJ to cut rates aggressively — helping inflate the asset bubble that burst in 1990.\n\n**Swiss National Bank (SNB) ceiling removal (January 15, 2015)**:\n- In 2011, safe-haven capital flows (eurozone crisis) drove the Swiss franc to near-parity with the euro.\n- The SNB imposed a **floor** of 1.20 CHF/EUR — committing to unlimited euro purchases to prevent the franc from strengthening.\n- By 2015, with the ECB launching QE and the SNB's FX reserves ballooning to 80%+ of Swiss GDP, the floor became unsustainable.\n- January 15, 2015: The SNB suddenly **removed the floor** with no warning — the franc surged ~20% against the euro in minutes. Several FX brokers went bankrupt. It became known as the \"Frankenshock.\"\n\n**Bank of Japan interventions**:\n- Japan has a history of yen interventions. In 2022, the BoJ spent ~$68 billion defending the yen as it weakened past 150/USD.\n- The BoJ also maintained YCC (Yield Curve Control), keeping 10-year JGB yields capped — preventing rate hikes that would strengthen the yen.",
          highlight: ["Plaza Accord", "G5", "Swiss franc", "SNB", "Frankenshock", "BoJ intervention", "YCC"],
        },
        {
          type: "quiz-mc",
          question:
            "The Plaza Accord of 1985 was a coordinated agreement among G5 nations to achieve which outcome?",
          options: [
            "Weaken the US dollar, which had appreciated ~50% and was damaging American export competitiveness",
            "Strengthen the US dollar to reduce import inflation and protect American consumers",
            "Establish fixed exchange rate bands between major currencies to prevent future currency wars",
            "Create a new reserve currency to reduce dependence on the dollar in global trade",
          ],
          correctIndex: 0,
          explanation:
            "The Plaza Accord was a rare example of coordinated G5 intervention to deliberately weaken the US dollar. By 1985, the dollar had appreciated so sharply under Volcker-era high interest rates that US manufacturing was severely uncompetitive. The accord led to a ~50% decline in the dollar against the yen and Deutsche mark — a dramatic reversal engineered through joint central bank FX selling.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "When the Swiss National Bank removed its 1.20 CHF/EUR floor in January 2015, it had given financial markets several weeks of advance warning to adjust positions.",
          correct: false,
          explanation:
            "False. The SNB removed the floor with absolutely no advance notice on January 15, 2015. The surprise was intentional — had the SNB signaled the move, speculative positioning would have made the defense even more costly. The immediate 20%+ franc appreciation in minutes caused massive losses for FX traders positioned against the franc, bankrupted several retail FX brokers, and became known as the 'Frankenshock.'",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A country is running a large current account surplus and its currency has appreciated 30% in two years. Domestic exporters are lobbying the government, and unemployment in the manufacturing sector is rising. The central bank is considering FX intervention.",
          question: "If the central bank intervenes to weaken its currency and this triggers retaliatory interventions by trading partners, which historical parallel best describes the potential outcome?",
          options: [
            "A beggar-thy-neighbor spiral similar to the 1930s — where competing devaluations leave everyone worse off with higher inflation",
            "A Plaza Accord-style coordination that stabilizes exchange rates at new equilibrium levels",
            "A Bretton Woods-style outcome where one currency emerges as the dominant reserve asset",
            "A Frankenshock — where the sudden policy reversal causes violent currency appreciation",
          ],
          correctIndex: 0,
          explanation:
            "If a country devalues and trading partners retaliate with their own devaluations, the net trade benefit cancels out — but everyone gets higher import inflation and destabilized markets. This is the 1930s beggar-thy-neighbor trap. The Plaza Accord is the opposite case — cooperative rather than competitive. The Frankenshock describes a sudden appreciation, not a devaluation spiral.",
          difficulty: 3,
        },
      ],
    },

    // ─── Lesson 5: CBDCs & Digital Money ────────────────────────────────────────
    {
      id: "monetary-system-5",
      title: "CBDCs & Digital Money",
      description:
        "Digital yuan (e-CNY), FedNow vs a digital dollar, programmable money risks, and financial surveillance concerns",
      icon: "Cpu",
      xpReward: 85,
      difficulty: "intermediate",
      steps: [
        {
          type: "teach",
          title: "What Are CBDCs and Why Do Governments Want Them?",
          content:
            "**Central Bank Digital Currencies (CBDCs)** are digital forms of a country's fiat currency, issued and controlled directly by the central bank — distinct from commercial bank deposits or cryptocurrencies.\n\n**Three types**:\n1. **Retail CBDC**: A digital currency available to the general public — like physical cash, but digital. Citizens hold accounts directly with (or via banks linked to) the central bank.\n2. **Wholesale CBDC**: Restricted to financial institutions for interbank settlement. Less controversial, more technically straightforward.\n3. **Cross-border CBDC**: Multiple central banks using compatible CBDC systems for international settlement — potentially bypassing SWIFT and dollar clearing.\n\n**Why governments pursue CBDCs**:\n- **Financial inclusion**: The unbanked population (~1.4 billion globally) could access financial services without a commercial bank account.\n- **Monetary policy transmission**: Direct digital money transfers to citizens (\"helicopter money\") without the banking system as intermediary.\n- **Anti-money laundering / tax enforcement**: Every transaction is traceable — reduces tax evasion and illicit finance.\n- **Reducing private sector power**: Limit the growth of private digital currencies (Libra/Diem, stablecoins) that could undermine central bank control of money.\n- **Geopolitical competition**: Countries fear being excluded from a future digital monetary order dominated by another nation's CBDC.",
          highlight: ["CBDC", "retail CBDC", "wholesale CBDC", "financial inclusion", "monetary policy transmission", "programmable money"],
        },
        {
          type: "teach",
          title: "Digital Yuan, FedNow, and Surveillance Risks",
          content:
            "**China's Digital Yuan (e-CNY)**:\n- The world's most advanced major-economy CBDC — launched in trials in 2020, expanded to 26 cities and the 2022 Beijing Olympics.\n- Issued by the People's Bank of China (PBoC) and distributed through commercial banks and digital wallets.\n- **Key feature**: Programmable and traceable. The government can set expiration dates on funds (forcing spending), restrict use to certain categories, and monitor all transactions.\n- Strategic geopolitical angle: China is piloting cross-border e-CNY with Hong Kong, UAE, and Thailand (Project mBridge) to enable yuan-denominated settlement outside the dollar/SWIFT system.\n- Adoption challenge: Despite $250B+ in transactions piloted, voluntary adoption has been slow — WeChat Pay and Alipay already work seamlessly.\n\n**FedNow vs. a Digital Dollar**:\n- **FedNow** (launched July 2023): A real-time gross settlement (RTGS) system for instant bank-to-bank payments in the US — not a CBDC. Money still sits at commercial banks.\n- A US **retail CBDC** remains politically contentious. The Fed has said it would not issue one without explicit Congressional authorization.\n- Opposition from US lawmakers across the political spectrum: concerns about financial privacy, government surveillance, and bank disintermediation.\n\n**Programmable money risks and surveillance concerns**:\n- **Financial surveillance**: Every CBDC transaction is traceable by the government — a fundamental departure from cash's anonymity.\n- **Programmability**: Governments could restrict what money can be spent on (e.g., no alcohol, no gambling, only domestic goods).\n- **Expiry dates**: Money programmed to expire if not spent — eliminates savings as a behavior.\n- **Political risk**: In authoritarian contexts, CBDCs could allow instant financial exclusion of dissidents.",
          highlight: ["digital yuan", "e-CNY", "FedNow", "programmable money", "financial surveillance", "Project mBridge", "RTGS"],
        },
        {
          type: "quiz-mc",
          question:
            "A retail CBDC differs from a commercial bank deposit in which fundamental way?",
          options: [
            "A retail CBDC is a direct liability of the central bank, not a commercial bank — it carries no counterparty credit risk",
            "A retail CBDC pays higher interest rates because it is backed by gold reserves",
            "A retail CBDC can only be used for international transactions, not domestic payments",
            "A retail CBDC requires the holder to have a brokerage account to access funds",
          ],
          correctIndex: 0,
          explanation:
            "When you hold money in a commercial bank, the bank owes you that money — it is the bank's liability. If the bank fails, you could lose money above deposit insurance limits. A retail CBDC is directly issued by and owed by the central bank, which cannot go bankrupt in the conventional sense. This makes it the digital equivalent of cash (also a central bank liability), not a bank deposit.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The US Federal Reserve's FedNow system, launched in 2023, is the United States' retail Central Bank Digital Currency (CBDC).",
          correct: false,
          explanation:
            "False. FedNow is an instant payment settlement infrastructure — a real-time gross settlement system that allows banks to transfer funds between each other instantly, 24/7. It is not a CBDC. Money in FedNow transactions still sits in commercial bank accounts, not in digital central bank accounts held by citizens. A US retail CBDC would require Congressional legislation and remains highly politically contentious.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "A government launches a retail CBDC with two features: (1) all transactions are logged on a central government database, and (2) welfare payments are programmed to expire 60 days after issuance if unspent.",
          question: "Which two criticisms are most directly illustrated by these features?",
          options: [
            "Financial surveillance (full transaction visibility) and behavioral coercion (expiry eliminates the ability to save)",
            "Bank disintermediation (removing commercial banks) and inflation risk (forced spending causes prices to rise)",
            "Seigniorage loss (government loses income from currency circulation) and capital flight",
            "Credit risk concentration (central bank holds too much debt) and currency appreciation",
          ],
          correctIndex: 0,
          explanation:
            "Feature 1 — central government transaction logging — eliminates financial privacy. Unlike cash, every purchase is visible to authorities, enabling surveillance of political dissidents, minorities, or anyone the government chooses to monitor. Feature 2 — expiry dates — is a form of programmable coercion: it eliminates the ability to save, forcing immediate spending and potentially distorting economic behavior. Both are leading arguments against retail CBDCs in democratic contexts.",
          difficulty: 2,
        },
      ],
    },

    // ─── Lesson 6: Investor Implications ────────────────────────────────────────
    {
      id: "monetary-system-6",
      title: "Investor Implications",
      description:
        "Currency allocation in portfolios, gold as a reserve currency hedge, crypto as a dollar alternative thesis, and preserving purchasing power globally",
      icon: "BarChart2",
      xpReward: 90,
      difficulty: "advanced",
      steps: [
        {
          type: "teach",
          title: "Currency Risk in Portfolios and Gold as a Hedge",
          content:
            "For investors, the global monetary system creates both risks and opportunities — particularly around currency exposure and the long-term decline in purchasing power of any single fiat currency.\n\n**Currency risk in international portfolios**:\n- When you hold foreign assets (e.g., European stocks), you have implicit exposure to EUR/USD. If the euro weakens 10% against the dollar while European stocks rise 8%, your dollar-denominated return is negative.\n- **Hedging options**: Currency forwards or futures can neutralize FX exposure — but hedging costs (the \"forward premium\" or \"covered interest parity\" differential) can be 1–3% annually for some pairs.\n- **Unhedged vs. hedged**: Long-term, unhedged exposures tend to mean-revert; short-term, FX moves can dominate equity returns.\n- A structurally weakening dollar environment favors unhedged international equity positions — foreign currency appreciation adds to dollar returns.\n\n**Gold as a reserve currency hedge**:\n- Gold has been a store of value across monetary regimes: the gold standard, Bretton Woods, and the floating era.\n- Gold performs best in **real rate repression** (negative real interest rates) — it has no yield, so low real rates reduce its opportunity cost.\n- Key driver: **USD weakness + falling real rates = gold bull market**. This characterized 2001–2011 (+600%) and 2018–2020 (+80%).\n- As a de-dollarization hedge: If the dollar loses reserve share, the assets that replaced it (gold, EUR, CNY, others) should appreciate in dollar terms.\n- Historically, gold has preserved purchasing power across 500+ years better than any fiat currency.",
          highlight: ["currency risk", "hedging", "gold", "real rates", "de-dollarization hedge", "purchasing power", "currency forwards"],
        },
        {
          type: "teach",
          title: "Crypto as a Dollar Alternative and Purchasing Power Preservation",
          content:
            "**The Bitcoin/crypto as dollar alternative thesis**:\n- Bitcoin's fixed supply (21 million cap) positions it as a hedge against fiat money creation — the antithesis of the Fed's ability to print unlimited dollars.\n- Bitcoin advocates argue it is **\"digital gold\"** — scarce, non-sovereign, censorship-resistant, and portable across borders.\n- In countries with high inflation (Argentina, Turkey, Venezuela, Nigeria), local populations have turned to Bitcoin and dollar-pegged stablecoins to preserve purchasing power when local currencies collapse.\n- Critique: Bitcoin's volatility makes it a poor store of value for short-term needs; its correlation to risk assets (especially growth stocks) increased after 2020 institutional adoption.\n\n**Stablecoins and dollar extension**:\n- Paradoxically, crypto has **extended dollar dominance** rather than challenging it — over 90% of stablecoin market cap (USDT, USDC) is dollar-pegged.\n- Stablecoins enable dollar-denominated digital transactions globally, 24/7, without a US bank account — reaching unbanked populations in EM.\n\n**Purchasing power preservation framework**:\n- **Hard assets**: Gold, real estate, commodities, inflation-linked bonds (TIPS) — assets with real-world supply constraints.\n- **Foreign currency diversification**: Holding a basket of non-dollar assets (Swiss franc, Norwegian krone, Singapore dollar) hedges against dollar-specific debasement.\n- **International equities**: Companies with global revenues benefit when the dollar weakens — their foreign earnings translate into more dollars.\n- **Bitcoin as portfolio diversifier**: Low allocation (1–5%) can improve risk-adjusted returns if Bitcoin's uncorrelated-to-stocks periods persist — though this correlation is unstable.\n- **Key principle**: No single asset perfectly preserves purchasing power across all monetary regimes. Diversification across real assets, currencies, and geographies is the most robust approach.",
          highlight: ["Bitcoin", "digital gold", "stablecoins", "dollar dominance", "purchasing power", "TIPS", "hard assets", "portfolio diversification"],
        },
        {
          type: "quiz-mc",
          question:
            "In which interest rate environment does gold historically perform best as an investment?",
          options: [
            "When real interest rates are negative or falling — gold's zero yield has the lowest opportunity cost",
            "When nominal rates are high and rising — gold benefits from currency appreciation",
            "When the yield curve is steeply inverted — gold is a safe haven from bank stress",
            "During periods of deflation — gold preserves nominal value when all asset prices fall",
          ],
          correctIndex: 0,
          explanation:
            "Gold has no yield. When real interest rates (nominal rates minus inflation) are negative or very low, the cost of holding gold relative to bonds or cash is minimal. Conversely, when real rates are high and positive, investors prefer interest-bearing assets. The 2001–2011 gold bull market occurred during low real rates; the 2022 gold underperformance occurred as the Fed raised rates sharply, pushing real rates positive.",
          difficulty: 2,
        },
        {
          type: "quiz-tf",
          statement:
            "The growth of dollar-pegged stablecoins like USDT and USDC represents a challenge to US dollar dominance in global finance.",
          correct: false,
          explanation:
            "False. Dollar-pegged stablecoins actually extend and reinforce dollar dominance. By creating digital dollars accessible globally 24/7 without a US bank account, stablecoins bring dollar-denominated transactions to populations in emerging markets, crypto-native users, and anyone seeking dollar stability outside the traditional banking system. Over 90% of stablecoin market cap is pegged to the US dollar — crypto is currently a dollar-spreading mechanism, not a dollar-replacement mechanism.",
          difficulty: 2,
        },
        {
          type: "quiz-scenario",
          scenario:
            "An investor is concerned about long-term US dollar debasement. She is considering four assets: (A) US Treasury bonds, (B) gold, (C) shares in a large-cap US multinational with 60% of revenues from Europe and Asia, (D) Swiss franc cash deposits.",
          question: "Which combination provides the most diversified hedge against dollar-specific debasement?",
          options: [
            "B + C + D — gold, international-revenue equities, and non-dollar currency deposits each hedge different dimensions of dollar weakness",
            "A + B — long-duration Treasuries rise in price when the Fed cuts rates and the dollar weakens",
            "Only B — gold is the only proven store of value across monetary regimes",
            "Only C — large-cap multinationals always outperform when the dollar weakens",
          ],
          correctIndex: 0,
          explanation:
            "A diversified approach covers multiple dimensions: Gold (B) hedges against real rate repression and monetary debasement with a multi-century track record. The multinational equity (C) benefits as foreign revenues translate into more dollars when USD weakens — real earnings power is maintained. Swiss franc deposits (D) provide direct non-dollar currency exposure to a historically strong, low-inflation currency. US Treasuries (A) are dollar-denominated — they provide no protection against dollar-specific weakness and actually lose real value if the Fed allows inflation to run.",
          difficulty: 3,
        },
      ],
    },
  ],
};
