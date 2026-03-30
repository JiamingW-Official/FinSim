import type { Unit } from "./types";

export const UNIT_BANKING_SYSTEM: Unit = {
 id: "banking-system",
 title: "Banking System & Financial Crises",
 description:
 "Understand commercial banking, fractional reserve system, bank runs, systemic risk, 2008 GFC mechanics, and regulatory responses",
 icon: "Banknote",
 color: "#ef4444",
 lessons: [
 // Lesson 1: Commercial Banking Fundamentals 
 {
 id: "bs-1",
 title: "Commercial Banking Fundamentals",
 description:
 "Bank balance sheets, net interest margin, fractional reserve banking, the money multiplier, and the difference between solvency and liquidity",
 icon: "Banknote",
 xpReward: 75,
 difficulty: "beginner",
 steps: [
 {
 type: "teach",
 title: "The Bank Balance Sheet",
 content:
 "A commercial bank is a financial intermediary that stands between savers and borrowers — and understanding its balance sheet is the foundation of all banking knowledge.\n\n**Assets (what the bank owns):**\n- **Loans**: mortgages, auto loans, credit cards, business loans — the primary earning asset\n- **Securities**: government bonds, MBS — liquid interest-earning assets\n- **Reserves**: cash held at the central bank — earns the policy rate\n- **Other assets**: premises, equipment\n\n**Liabilities (what the bank owes):**\n- **Deposits**: checking accounts, savings accounts, CDs — the primary funding source\n- **Borrowings**: short-term wholesale funding (repo, FHLB advances)\n- **Long-term debt**: bonds issued to investors\n\n**Equity (the buffer):**\nAssets Liabilities = Equity. Equity absorbs losses before depositors are at risk.\n\n**Net Interest Margin (NIM):**\nThe bank earns the loan rate and pays the deposit rate. NIM = (Interest Income Interest Expense) / Average Earning Assets. A typical NIM is **2–4%** for US commercial banks. When the yield curve flattens (short rates rise toward long rates), NIM compresses because deposit costs rise faster than loan yields.\n\n**Key insight:** Deposits are liabilities — the bank owes them back on demand. Loans are assets — the bank cannot easily recall them. This maturity mismatch (short-term liabilities funding long-term assets) is the source of both banking profitability and banking fragility.",
 highlight: [
 "net interest margin",
 "NIM",
 "deposits",
 "loans",
 "maturity mismatch",
 "equity",
 "yield curve",
 ],
 },
 {
 type: "teach",
 title: "Fractional Reserve Banking & The Money Multiplier",
 content:
 "Banks do not hold all deposited money in a vault — they lend most of it out, keeping only a fraction as reserves. This is fractional reserve banking, and it creates money.\n\n**How money is created:**\n1. You deposit $100 at Bank A\n2. Bank A keeps $10 as reserves (10% reserve ratio) and lends $90 to a borrower\n3. The borrower deposits $90 at Bank B\n4. Bank B keeps $9 as reserves and lends $81 to another borrower\n5. This continues — each round creates new deposits\n\n**The money multiplier:**\nMoney Multiplier = 1 / Reserve Ratio\n- At 10% reserve ratio: multiplier = 1 / 0.10 = **10**\n- A $1 injection of reserves can support **$10 of broad money (deposits)**\n- At 20% reserve ratio: multiplier = 5\n\n**Important caveats:**\nThe theoretical multiplier overstates reality. Banks may hold excess reserves (as they did massively post-2008 when the Fed paid interest on reserves). Borrowers may hold cash rather than redeposit. In practice, the multiplier is lower and banks are more 'loans create deposits' than 'deposits create loans.'\n\n**FDIC Insurance — Breaking the bank run incentive:**\nFDIC insures deposits up to **$250,000 per depositor per institution**. Before deposit insurance, rational depositors had reason to run at the first sign of trouble. With insurance, small depositors have no incentive to run — removing the self-fulfilling prophecy. FDIC was created after **9,000 bank failures** in the early 1930s.\n\n**Reserve requirements today:**\nIn March 2020, the Federal Reserve reduced reserve requirements to **0%** — banks are now not required to hold reserves, though they hold them for liquidity management. The money creation mechanism still works through capital constraints and credit demand.",
 highlight: [
 "fractional reserve banking",
 "reserve ratio",
 "money multiplier",
 "1 / reserve ratio",
 "FDIC",
 "$250,000",
 "excess reserves",
 ],
 },
 {
 type: "teach",
 title: "Solvency vs. Liquidity",
 content:
 "The most important distinction in banking is between solvency and liquidity — two separate problems that require different solutions.\n\n**Solvency:**\nA bank is solvent when Assets > Liabilities (positive equity). Insolvency means the bank's assets, at fair value, are worth less than what it owes creditors. An insolvent bank should be closed, resolved, or recapitalized. No amount of emergency lending fixes underlying insolvency.\n\n**Liquidity:**\nA bank is liquid when it can meet current cash obligations — depositor withdrawals, maturing debt, margin calls. A bank can be perfectly solvent (owns good long-term assets) but illiquid (cannot convert them to cash immediately). This is the classic bank run scenario.\n\n**Can a bank be...:**\n- **Solvent but illiquid?** Yes — a bank with $200M of 30-year mortgages and $150M of deposits may be technically solvent but unable to pay sudden mass withdrawals. The Fed's lender-of-last-resort function addresses this.\n- **Liquid but insolvent?** Yes — a bank with strong short-term funding may be able to roll over liabilities for a period while hiding losses. Eventually the losses become undeniable.\n- **The 2008 complication:** Many banks were both insolvent (holding toxic MBS) and illiquid (funding markets seized). Distinguishing between the two was extremely difficult in real time.\n\n**Why the distinction matters:**\nThe policy response differs fundamentally. Liquidity crises call for central bank lending. Solvency crises call for capital injection, debt restructuring, or resolution. Lending to an insolvent institution simply delays and magnifies the eventual loss — it throws good money after bad.",
 highlight: [
 "solvency",
 "liquidity",
 "Assets > Liabilities",
 "lender of last resort",
 "bank run",
 "toxic MBS",
 "capital injection",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A bank has a 10% reserve requirement and $100M in deposits. What is the maximum total amount of loans it can support through the money multiplier?",
 options: [
 "$90M — the bank can only lend what it doesn't need to hold as reserves",
 "$900M — the money multiplier of 10 applied to the initial $90M in lendable funds",
 "$1,000M — the multiplier of 10 applied to the full $100M in deposits",
 "$100M — deposits and loans must always match one-for-one",
 ],
 correctIndex: 1,
 explanation:
 "The bank keeps $10M (10%) as reserves and can lend $90M. That $90M gets re-deposited, creating $81M in new loans, then $72.9M, and so on. The full chain sums to $90M × (1/0.10) = $900M in total loans created from the initial $90M. Alternatively, the total money supply created from $100M of deposits at 10% reserve ratio is $100M × 10 = $1,000M in deposits, supporting $900M in loans. The key is that the multiplier applies to the lending base, not the full deposits.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "FDIC deposit insurance was introduced specifically to prevent self-fulfilling bank runs by eliminating the incentive for small depositors to withdraw funds at the first sign of trouble.",
 correct: true,
 explanation:
 "True. Before deposit insurance, a rational depositor would rush to the bank if they feared others might do so — even if the bank was fundamentally sound. Insurance breaks this coordination problem: since deposits up to $250,000 are guaranteed regardless of bank failure, small depositors have no rational reason to run. This insight comes directly from the Diamond-Dybvig model of bank runs (1983).",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A regional bank holds primarily 30-year fixed-rate mortgages funded by short-term deposits and wholesale borrowings. Interest rates rise sharply, causing deposit outflows as customers move funds to higher-yielding alternatives. The bank's mortgages remain performing — no borrowers are defaulting.",
 question:
 "How should this bank's situation be classified, and what is the appropriate policy response?",
 options: [
 "Insolvent and illiquid — the bank should be immediately closed and liquidated",
 "Solvent but illiquid — the central bank should provide emergency liquidity against the mortgage collateral",
 "Liquid but insolvent — the bank needs equity capital injection to restore solvency",
 "Both solvent and liquid — no action needed as performing mortgages guarantee survival",
 ],
 correctIndex: 1,
 explanation:
 "This is the classic solvency-vs-liquidity scenario. The mortgages are performing (good assets), so the bank may be technically solvent. The problem is liquidity: rising rates triggered deposit outflows and the bank cannot easily convert 30-year mortgages to cash. The appropriate response is central bank lending (lender of last resort) against the mortgage collateral, providing time for orderly asset sales or funding stabilization. This is precisely Bagehot's rule: lend freely at a penalty rate against good collateral.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Bank Runs & Liquidity Crises 
 {
 id: "bs-2",
 title: "Bank Runs & Liquidity Crises",
 description:
 "The Diamond-Dybvig model, deposit insurance as coordination solution, Bagehot's rule, the 2008 money market fund run, and shadow banking",
 icon: "Banknote",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Diamond-Dybvig Model: Why Bank Runs Happen",
 content:
 "In 1983, economists Douglas Diamond and Philip Dybvig published one of the most important papers in finance — a formal model explaining why bank runs are a self-fulfilling prophecy and why they can destroy even fundamentally healthy banks.\n\n**The core insight — multiple equilibria:**\nA bank can exist in two stable states:\n\n**Good equilibrium:** Most depositors believe others will keep their money in the bank. No one panics. The bank operates normally, converts short-term deposits into long-term productive investments, and pays everyone in due course.\n\n**Bad equilibrium (bank run):** Depositors believe others will withdraw. To avoid being last in line, everyone rushes to withdraw simultaneously. The bank cannot liquidate long-term assets quickly enough to pay everyone at face value. It fails — even if the underlying loans are perfectly good.\n\n**The sequential service constraint:**\nBanks pay depositors on a first-come, first-served basis. If you wait, you might get nothing. This 'bank queue' transforms a rumor into a rational crisis — even depositors who trust the bank's fundamentals have reason to withdraw if they fear others won't.\n\n**Cascade mechanism:**\nBank A fails its corporate depositors cannot make payroll they default on loans at Bank B Bank B becomes insolvent depositors at Bank B run Bank C loses correspondent banking lines contagion spreads without any change in underlying economic fundamentals.\n\n**Historical examples:** The US banking panics of 1907, 1930–33 (over 9,000 banks failed), the IndyMac run in 2008 — all show identical mechanics despite different underlying triggers.",
 highlight: [
 "Diamond-Dybvig",
 "self-fulfilling prophecy",
 "multiple equilibria",
 "sequential service constraint",
 "contagion",
 "bank queue",
 ],
 },
 {
 type: "teach",
 title: "Deposit Insurance & Lender of Last Resort",
 content:
 "Two institutions were created specifically to eliminate bank runs — one addresses the solvency guarantee, the other the liquidity guarantee.\n\n**Deposit Insurance — The FDIC Solution:**\nThe FDIC (1933) solved the coordination problem by making the 'run' irrational for small depositors. If your deposits are guaranteed up to $250,000 regardless of bank failure, you gain nothing by being first in line. The rational response is to do nothing — exactly breaking the bank run equilibrium.\n\n**Lender of Last Resort — Bagehot's Rule:**\nWalter Bagehot (1873, Lombard Street) articulated the central bank's role in a crisis:\n> *'Lend freely, at a penalty rate, against good collateral.'*\n\n- **Lend freely**: in unlimited amounts so the market knows liquidity is available\n- **Penalty rate**: above normal rates so healthy banks prefer private markets; only distressed banks use the facility\n- **Good collateral**: only sound assets accepted — prevents lending to insolvent institutions\n\nThe Fed implements this through the **Discount Window** and, in extremis, emergency facilities under Section 13(3) of the Federal Reserve Act.\n\n**2008 Money Market Fund Run — The Shadow Bank Run:**\nOn September 16, 2008 — the day after Lehman Brothers filed for bankruptcy — the Reserve Primary Fund 'broke the buck': its NAV fell below $1.00 per share because it held $785M of Lehman commercial paper now worth pennies.\n\n**Consequences:** Investors panicked and redeemed across all money market funds. Funds were forced to sell commercial paper at fire-sale prices. The commercial paper market — which funds corporate payroll — froze. The Fed had to create the **Money Market Investor Funding Facility** and the **Commercial Paper Funding Facility** to stop the cascade.\n\n**Shadow banking**: non-bank financial intermediaries (money market funds, broker-dealers, hedge funds, SIVs) that perform bank-like maturity transformation without deposit insurance or central bank access — hence susceptible to runs.",
 highlight: [
 "FDIC",
 "Bagehot's rule",
 "lend freely",
 "penalty rate",
 "good collateral",
 "Reserve Primary Fund",
 "broke the buck",
 "shadow banking",
 "commercial paper",
 ],
 },
 {
 type: "teach",
 title: "Shadow Banking: Runs Without Deposit Insurance",
 content:
 "The 2008 crisis revealed that the financial system had grown a massive 'shadow banking' sector that performed maturity transformation without the protections that made commercial banking stable.\n\n**What is shadow banking?**\nAny financial intermediary that borrows short to lend long but lacks:\n- Federal deposit insurance\n- Access to the Fed's discount window\n- Regulatory capital requirements comparable to banks\n\n**Shadow bank entities:**\n- Money market mutual funds (fund themselves with daily redeemable shares)\n- Structured Investment Vehicles (SIVs) — off-balance-sheet bank conduits\n- Securities broker-dealers (funded by overnight repo)\n- Hedge funds (funded by prime brokerage credit)\n- Asset-backed commercial paper conduits\n\n**The repo market — the shadow bank's 'deposit':**\nBanks fund themselves with deposits. Shadow banks often fund themselves with **repurchase agreements (repo)**: a firm sells securities overnight and agrees to buy them back the next day at a slightly higher price. The buyer earns a safe overnight return; the seller gets cash. If the buyer panics and refuses to roll over the repo — that is a bank run in everything but name.\n\n**The 2008 repo run:** At the height of the crisis, haircuts on repo collateral jumped from near-zero to 20–50%, effectively freezing funding for broker-dealers. Lehman was running $200B of overnight repo — when lenders pulled back, the firm could not survive 24 hours.\n\n**Post-crisis reforms:** The Financial Stability Board now monitors shadow banking globally. Many shadow bank activities were brought under regulatory oversight (money market fund reforms, central clearing of derivatives).",
 highlight: [
 "shadow banking",
 "maturity transformation",
 "repo",
 "repurchase agreement",
 "haircuts",
 "money market funds",
 "SIVs",
 "Financial Stability Board",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A solvent bank is experiencing a classic bank run — depositors are withdrawing due to fear, not because of any real problem with the bank's assets. What should the central bank do according to Bagehot's rule?",
 options: [
 "Close the bank immediately to prevent further losses to depositors",
 "Provide unlimited emergency liquidity at a penalty rate against the bank's good collateral",
 "Refuse to help — moral hazard concerns mean the bank must manage its own liquidity",
 "Inject equity capital to restore confidence in the bank's solvency",
 ],
 correctIndex: 1,
 explanation:
 "Bagehot's rule is clear: lend freely, at a penalty rate, against good collateral. For a solvent-but-illiquid bank, emergency central bank lending stops the run by reassuring depositors that the bank can meet withdrawals. The penalty rate discourages moral hazard. The good collateral requirement ensures the central bank isn't lending to an already-insolvent institution. Equity injection would be appropriate for an insolvent bank — but this scenario describes a liquidity problem, not a solvency problem.",
 difficulty: 1,
 },
 {
 type: "quiz-tf",
 statement:
 "The Reserve Primary Fund 'broke the buck' in September 2008 because it held Lehman Brothers commercial paper that became nearly worthless after Lehman's bankruptcy.",
 correct: true,
 explanation:
 "True. On September 16, 2008, the Reserve Primary Fund — one of the oldest money market funds — announced its NAV had fallen to $0.97 per share (below the $1.00 'buck') because it held $785M of Lehman Brothers commercial paper. This triggered a massive run on money market funds industry-wide. The event demonstrated that money market funds, despite appearing as safe as cash, were vulnerable to runs just like bank deposits — without any equivalent deposit insurance protection.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A hedge fund borrows $10 billion overnight via repurchase agreements (repo), using mortgage-backed securities as collateral. During a market stress event, its repo lenders demand higher haircuts — instead of accepting 100 cents on the dollar of MBS collateral, they now require $120 of MBS for every $100 of cash. The hedge fund does not have the extra MBS to post.",
 question:
 "What does this scenario illustrate, and what will likely happen next?",
 options: [
 "A solvency crisis — the MBS are worth less than their face value, causing insolvency",
 "A shadow bank run — funding withdrawal mimics a bank run but without deposit insurance backstop",
 "Normal market functioning — repo haircuts always adjust to reflect collateral quality",
 "A regulatory violation — hedge funds are not permitted to use repo funding",
 ],
 correctIndex: 1,
 explanation:
 "This is a textbook shadow bank run. The hedge fund performs bank-like maturity transformation (borrowing overnight to hold long-dated MBS) but has no deposit insurance and no access to the Fed's discount window. When repo lenders raise haircuts, it is functionally equivalent to depositors withdrawing: the fund cannot roll its overnight funding and must fire-sell assets. Fire sales depress MBS prices, which triggers margin calls at other institutions, spreading the crisis. This mechanism was central to 2008.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: 2008 Global Financial Crisis 
 {
 id: "bs-3",
 title: "2008 Global Financial Crisis",
 description:
 "Subprime mortgages, securitization failures, Lehman's collapse, the panic of 2008, and the policy response",
 icon: "Banknote",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "The Road to Crisis: Subprime & Securitization",
 content:
 "The 2008 Global Financial Crisis had multiple causes that reinforced each other — no single villain, but a system-wide failure of incentives, models, and oversight.\n\n**Subprime mortgages:**\nFrom 2003–2006, lenders extended mortgages to borrowers with weak credit, low income, and little documentation. Characteristics included:\n- **NINJA loans**: No Income, No Job, No Assets\n- **Adjustable-rate mortgages (ARMs)**: low teaser rates that reset sharply higher after 2–3 years\n- **Negative amortization**: payments so low that balances grew over time\n- **No-doc loans**: stated income accepted without verification\n\nLenders didn't care about credit quality because they immediately sold the loans. The 'originate-to-distribute' model destroyed underwriting discipline.\n\n**Securitization — MBS and CDOs:**\nMortgages were pooled and sliced into **Mortgage-Backed Securities (MBS)** with different risk tranches:\n- **Senior tranche (AAA)**: paid first from cash flows; last to absorb losses\n- **Mezzanine tranche (BBB)**: absorbs losses before senior\n- **Equity tranche**: first to absorb losses; highest yield\n\n**Collateralized Debt Obligations (CDOs)** then repackaged the BBB tranches of many MBS into a new structure — and called the senior tranches of *those* AAA. This manufactured AAA ratings from pools of subprime junk.\n\n**Rating agency failure:**\nMoody's, S&P, and Fitch assigned AAA to CDOs based on flawed models that assumed:\n- House prices had never fallen nationally (false after 1930s)\n- Mortgage defaults were uncorrelated across states (false — systematic factors drive national recessions)\n- Historical default data from a benign period would predict behavior in stress\n\n**Leverage:**\nInvestment banks were leveraged **30–40×** — a 3% decline in asset values wiped out equity.",
 highlight: [
 "subprime mortgages",
 "NINJA loans",
 "originate-to-distribute",
 "MBS",
 "CDO",
 "AAA rating",
 "rating agency",
 "leverage",
 "securitization",
 ],
 },
 {
 type: "teach",
 title: "The Cascade: Bear Stearns to Lehman",
 content:
 "The crisis unfolded in stages over 18 months, with each failure weakening confidence in the next institution.\n\n**March 2008 — Bear Stearns:**\nBear Stearns, the fifth-largest US investment bank, had been heavily exposed to subprime MBS through its hedge funds (which failed in June 2007). By March 2008, repo lenders refused to roll over Bear's funding. The Fed and JPMorgan arranged a rescue: JPMorgan acquired Bear at **$2/share** (later raised to $10) with the Fed guaranteeing $30B of Bear's troubled assets. The Fed argued Bear was too systemically important to fail outright.\n\n**July 2008 — Fannie Mae & Freddie Mac:**\nThe government-sponsored enterprises backing over $5 trillion of mortgages were put into **conservatorship** in September 2008. The Treasury injected $187B. This was the largest government bailout in US history at that point.\n\n**September 15, 2008 — Lehman Brothers:**\nLehman, the fourth-largest investment bank, filed for **the largest bankruptcy in US history** — $600 billion in liabilities. Unlike Bear Stearns, no buyer emerged and the Fed determined it lacked legal authority to lend to Lehman (insufficient good collateral). The decision not to save Lehman remains deeply controversial.\n\n**Why Lehman's failure was so catastrophic:**\n- Lehman was counterparty to thousands of derivatives contracts — immediate uncertainty about settlement\n- Money market funds held Lehman paper — triggering the Reserve Primary Fund break-the-buck event\n- Global banks had Lehman exposure — European banks froze overnight lending\n- The **OIS-LIBOR spread** spiked from ~10 basis points to over **350 basis points** — the interbank lending market effectively froze\n\n**September 16, 2008 — AIG:**\nThe day after Lehman, the Fed bailed out insurance giant AIG with $85B, eventually $182B total. AIG had sold **credit default swaps (CDS)** on CDOs without holding capital — it was effectively an unregulated insurance company that would have triggered losses at every major bank if it failed.",
 highlight: [
 "Bear Stearns",
 "Lehman Brothers",
 "$600 billion",
 "largest bankruptcy",
 "OIS-LIBOR spread",
 "350 basis points",
 "AIG",
 "credit default swaps",
 "conservatorship",
 ],
 },
 {
 type: "teach",
 title: "Policy Response & Aftermath",
 content:
 "The policy response to the 2008 crisis was unprecedented in scope and speed — a combination of fiscal, monetary, and regulatory interventions.\n\n**TARP — Troubled Asset Relief Program:**\nCongress authorized $700B in October 2008. Originally intended to purchase toxic MBS, TARP pivoted to direct equity injections into banks. **$250B** was injected into the largest banks. Most money was repaid with profit to taxpayers by 2014. The perception of TARP as a 'bank bailout' created lasting political anger.\n\n**Federal Reserve emergency facilities:**\n- **Commercial Paper Funding Facility (CPFF)**: bought commercial paper directly to unfreeze short-term markets\n- **Term Auction Facility (TAF)**: anonymous lending to banks without the stigma of the discount window\n- **Primary Dealer Credit Facility (PDCF)**: extended Fed lending to investment banks for the first time since 1929\n- **Money Market Investor Funding Facility (MMIFF)**: backstopped money market funds\n- **Quantitative Easing**: Fed purchased $1.75 trillion of MBS and Treasuries to push down long-term rates\n\n**FDIC actions:**\nThe FDIC temporarily raised the deposit insurance limit to $250,000 and guaranteed non-interest-bearing deposits in full — stopping deposit outflows from banks.\n\n**Aftermath:**\n- US GDP contracted **4.3%** peak to trough (worst since 1930s)\n- Unemployment peaked at **10%** in October 2009\n- **8.7 million jobs** lost in the recession\n- Home values fell **30%** nationally, wiping out household wealth\n- Global trade fell **12%** — the sharpest contraction in the post-war era\n- Over **500 US banks** failed between 2008 and 2012\n\n**Historical comparison:** The policy response was faster and more forceful than in 1929–33 — preventing a second Great Depression but resulting in the deepest recession in 80 years.",
 highlight: [
 "TARP",
 "$700B",
 "Commercial Paper Funding Facility",
 "quantitative easing",
 "10% unemployment",
 "4.3% GDP contraction",
 "500 banks failed",
 "FDIC",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Why did AAA-rated CDO tranches ultimately default at high rates despite their top-rated status?",
 options: [
 "Rating agencies were bribed by banks to inflate ratings on securities they knew were worthless",
 "Models assumed house prices only fell locally and that mortgage defaults were uncorrelated — both assumptions failed simultaneously in a national recession",
 "The SEC changed accounting rules mid-crisis, reclassifying previously safe assets as impaired",
 "CDO structures were legally flawed and courts voided the senior tranche protections",
 ],
 correctIndex: 1,
 explanation:
 "The AAA failures stemmed from model errors, not fraud (though there were also fraud cases). CDO rating models relied on historical data from a period of rising house prices, assumed mortgage defaults were largely independent events across regions, and severely underestimated the tail correlation — the tendency for all mortgages to default together in a national recession. When the housing market declined nationally for the first time since the 1930s, the subordinate tranches that were supposed to protect AAA holders were wiped out simultaneously across geographies, destroying the diversification benefit the models assumed.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The OIS-LIBOR spread spiking to over 350 basis points in late 2008 was a sign that banks had stopped trusting each other and were unwilling to lend in the interbank market.",
 correct: true,
 explanation:
 "True. The OIS-LIBOR spread measures the difference between the overnight indexed swap rate (the market's expectation of the risk-free overnight rate over the period) and LIBOR (the rate banks charge each other for unsecured term loans). Under normal conditions, the spread is 10–20 basis points, reflecting minimal credit risk. When the spread spiked to over 350 basis points after Lehman's failure, it meant banks were charging enormous premiums for lending to each other — or simply refusing to lend at all. This effectively froze the funding market that corporate borrowers, money market funds, and banks themselves depended on.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "An investment bank holds $50B in subprime MBS on its balance sheet, funded with $48B of overnight repo and $2B of equity (40:1 leverage). House prices fall 5% nationally — the first national decline since the 1930s. The MBS fall in value to $47B.",
 question:
 "What happens to the bank, and why does this create systemic risk?",
 options: [
 "The bank is slightly stressed but can manage — $47B in assets against $48B liabilities is a manageable gap",
 "The bank is technically insolvent — equity is wiped out and assets don't cover liabilities, causing repo lenders to demand more collateral or withdraw, forcing fire sales",
 "The bank is unaffected — the Fed would immediately provide emergency lending to bridge the small gap",
 "The bank can issue new equity to cover the shortfall — standard market practice resolves this quickly",
 ],
 correctIndex: 1,
 explanation:
 "At 40:1 leverage, a 5% decline in asset value ($50B × 5% = $2.5B loss) exceeds the bank's entire equity cushion ($2B), making it technically insolvent. Now repo lenders — seeing that collateral is worth less than the loans — demand higher haircuts or simply refuse to roll over funding. To repay $48B of overnight repo, the bank must sell MBS immediately. Mass selling drives MBS prices further down, making other leveraged institutions insolvent, triggering their forced sales. This fire-sale spiral and contagion through counterparty credit risk is precisely why high leverage is so dangerous systemically.",
 difficulty: 3,
 },
 ],
 },

 // Lesson 4: Systemic Risk & Too Big to Fail 
 {
 id: "bs-4",
 title: "Systemic Risk & Too Big to Fail",
 description:
 "How financial contagion works, why some banks can't be allowed to fail, the moral hazard problem, SIFIs, and post-crisis reforms",
 icon: "Banknote",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Systemic Risk & Financial Contagion",
 content:
 "Systemic risk is the risk that the failure of one financial institution triggers a cascade of failures throughout the system — even among institutions that had no direct business relationship with the original failure.\n\n**Three channels of contagion:**\n\n**1. Direct exposures:**\nBank A lends to Bank B. Bank B fails. Bank A takes a direct loss. If the loss is large enough, Bank A fails too, transmitting the shock to Bank C which lent to Bank A.\n\n**2. Fire sales:**\nBank A holds similar assets to Banks B and C. Bank A is forced to sell assets at distressed prices. The falling prices are marked to market by Banks B and C, making them appear insolvent even though their assets are sound. Banks B and C then face funding pressure and must also sell, driving prices down further.\n\n**3. Confidence/funding effects:**\nCounterparties lose confidence not because they have direct exposure to the failed bank, but because uncertainty about who is exposed to what causes everyone to hoard liquidity. 'If I don't know who is exposed to Lehman, I'll stop lending to everyone.'\n\n**Interconnectedness metrics:**\nRegulators measure systemic importance via:\n- **Size**: total assets (cross-border activities weighted higher)\n- **Interconnectedness**: interbank exposures, OTC derivatives, securities financing\n- **Substitutability**: can another institution provide the same services?\n- **Complexity**: opacity of legal structure, product lines\n- **Global activity**: cross-jurisdictional presence\n\n**Network topology matters:** A densely connected network distributes shocks widely. A network with a few highly-connected hubs (like major broker-dealers) means hub failure is catastrophic — the topology amplifies rather than absorbs shocks.",
 highlight: [
 "systemic risk",
 "contagion",
 "fire sales",
 "marked to market",
 "interconnectedness",
 "opacity",
 "network topology",
 ],
 },
 {
 type: "teach",
 title: "Too Big to Fail: The Dilemma",
 content:
 "Too Big to Fail (TBTF) is not a policy — it is a problem. It describes the situation where a financial institution is so large or so interconnected that its failure would cause unacceptable damage to the broader economy, effectively forcing a government bailout.\n\n**The TBTF dilemma:**\nGovernments face a lose-lose choice when a systemic bank faces failure:\n- **Allow failure**: systemic contagion, credit market freeze, recession — cost borne by the public\n- **Bail out**: public funds used to rescue private shareholders — moral hazard, political outrage\n\n**Moral hazard:**\nIf creditors know the government will bail out a systemically important bank, they have reduced incentive to demand adequate capital or sound management. The TBTF bank can borrow more cheaply than it should (implicit government guarantee), takes on more risk, and becomes even larger and riskier. The bailout guarantee subsidizes risk-taking.\n\n**Evidence of TBTF subsidy:** Economists estimate TBTF banks receive an implicit funding subsidy of **20–80 basis points** — worth billions annually — because creditors price in the government backstop. This competitive advantage encourages banks to grow toward TBTF status.\n\n**Systemically Important Financial Institutions (SIFIs):**\nPost-2008, the Financial Stability Board designates **Global Systemically Important Banks (G-SIBs)**. The 2024 list includes JPMorgan, Citigroup, HSBC, BNP Paribas, and ~25 others. G-SIBs face:\n- Higher capital requirements (1–3.5% additional CET1 buffer)\n- Enhanced supervision and reporting\n- Mandatory recovery and resolution plans ('living wills')\n- FSOC oversight in the US (Financial Stability Oversight Council)\n\n**The UK PRA approach:** 'Ring-fencing' separates retail banking from investment banking — protecting ordinary depositors from trading losses.",
 highlight: [
 "Too Big to Fail",
 "TBTF",
 "moral hazard",
 "implicit guarantee",
 "G-SIBs",
 "Financial Stability Board",
 "living wills",
 "ring-fencing",
 "FSOC",
 ],
 },
 {
 type: "teach",
 title: "Dodd-Frank & Post-Crisis Reforms",
 content:
 "The Dodd-Frank Wall Street Reform and Consumer Protection Act (2010) was the most sweeping US financial regulation since the 1930s. It aimed to prevent another 2008 by addressing systemic risk, derivatives, consumer protection, and resolution.\n\n**Key Dodd-Frank provisions:**\n\n**Financial Stability Oversight Council (FSOC):**\nA council of 10 regulators (Fed, OCC, FDIC, SEC, CFTC, etc.) with authority to designate non-bank SIFIs for Fed oversight and to identify systemic risks. Created specifically to close the 'regulatory gap' that allowed AIG to operate without adequate oversight.\n\n**Volcker Rule:**\nProhibits banks from proprietary trading (trading for their own account) and from owning hedge funds or private equity funds. Intended to reduce risk-taking within institutions with deposit insurance. Heavily lobbied against — implementation was substantially diluted.\n\n**Orderly Liquidation Authority (OLA):**\nGives the FDIC authority to resolve failing SIFIs in an orderly way — avoiding both chaotic bankruptcy (Lehman) and taxpayer bailout. Shareholders and creditors take losses; management is removed. Sometimes called 'resolution authority.'\n\n**Stress Testing — DFAST and CCAR:**\n- **DFAST** (Dodd-Frank Act Stress Test): annual supervisory stress test by the Fed\n- **CCAR** (Comprehensive Capital Analysis and Review): reviews capital planning and dividend/buyback plans\n- Banks must demonstrate they can absorb losses in severe adverse scenarios while maintaining minimum capital ratios\n- Results are publicly disclosed — market discipline reinforces regulatory discipline\n\n**Basel III — Capital Requirements:**\n- CET1 minimum: **4.5%** of risk-weighted assets\n- Capital Conservation Buffer: additional **2.5%** (must maintain above minimum)\n- Countercyclical Buffer: 0–2.5% set by national regulators in boom times\n- G-SIB surcharge: 1–3.5% additional CET1\n- Leverage Ratio: **3%** minimum (unweighted)\n- LCR and NSFR (covered in Lesson 5)",
 highlight: [
 "Dodd-Frank",
 "FSOC",
 "Volcker Rule",
 "proprietary trading",
 "DFAST",
 "CCAR",
 "stress testing",
 "Basel III",
 "CET1",
 "Orderly Liquidation Authority",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "When a Too Big to Fail bank faces insolvency, why does the government face a genuine dilemma rather than a simple choice between bailout and no-bailout?",
 options: [
 "Because bailout is always the right answer — systemic banks must be saved regardless of cost",
 "Because both options are costly: allowing failure triggers systemic contagion and recession, while bailout creates moral hazard and political backlash while rewarding risk-takers",
 "Because regulators lack authority to bail out private institutions, so the dilemma is purely legal",
 "Because the bank's shareholders must legally consent to any government intervention before it can occur",
 ],
 correctIndex: 1,
 explanation:
 "The TBTF dilemma is real and uncomfortable. Allowing a systemically important bank to fail in disorderly bankruptcy (as with Lehman) can freeze credit markets, trigger fire sales, destroy confidence, and cause severe recession — costs borne by workers and businesses that had nothing to do with the bank's risk-taking. But bailing out the bank uses taxpayer funds to rescue shareholders and creditors who were paid to bear that risk, and signals to future bank managers that reckless risk-taking will be rescued — the moral hazard problem. Both options are genuinely costly, which is why the TBTF problem is considered one of the most difficult in financial regulation.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Dodd-Frank's 'living wills' requirement forces systemically important banks to maintain plans for their own orderly dissolution without requiring government bailout.",
 correct: true,
 explanation:
 "True. The Dodd-Frank Act requires SIFIs to prepare and maintain 'resolution plans' — detailed roadmaps for how the firm could be wound down in an orderly way under bankruptcy without causing systemic disruption and without requiring taxpayer assistance. The Fed and FDIC review these plans and can require structural changes if the plan is deemed not credible. The goal is to make resolution feasible, removing the 'bailout or catastrophe' dilemma. In practice, critics argue the plans are still incomplete for the largest, most complex institutions.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "A government has just rescued a major bank for the third time in 20 years, injecting taxpayer capital because its failure would have triggered a financial crisis. The bank's management had taken large trading risks, funded by cheap debt because creditors knew the government would ultimately back the bank.",
 question:
 "Which concept best explains why the bank continued to take excessive risks despite three government rescues?",
 options: [
 "Adverse selection — only bad managers choose to work at TBTF banks",
 "Moral hazard — the implicit government guarantee eliminated the normal market discipline that would have constrained risk-taking",
 "Regulatory capture — the bank had bribed regulators to ignore its risk-taking",
 "Creative destruction — periodic bank failures are a normal part of capitalism and regulators should not intervene",
 ],
 correctIndex: 1,
 explanation:
 "This is moral hazard. When creditors know the government will rescue a bank, they price in the implicit guarantee — lending to the bank cheaply regardless of its riskiness. This cheap funding subsidizes risk-taking. Management, knowing the downside (failure) will be socialized while the upside (trading profits) is privately retained, has incentive to take more risk than is socially optimal. The TBTF status itself creates a feedback loop: risk-taking cheap funding more risk-taking larger bank even more systemically important even stronger bailout expectation. This is precisely why regulators impose extra capital requirements on G-SIBs — to counteract the TBTF subsidy.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 5: Banking Regulation & Capital 
 {
 id: "bs-5",
 title: "Banking Regulation & Capital",
 description:
 "Basel III capital tiers, risk-weighted assets, leverage ratio, LCR, NSFR, and stress testing explained",
 icon: "Banknote",
 xpReward: 85,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Capital Tiers: CET1, AT1, and Tier 2",
 content:
 "Basel III defines bank capital in tiers based on loss-absorbing quality — the higher the tier, the more reliably it absorbs losses before depositors are affected.\n\n**Tier 1 Capital (going-concern capital):**\nAbsorbs losses while the bank is a going concern — keeps the bank alive.\n\n**CET1 — Common Equity Tier 1 (highest quality):**\n- Ordinary shares / common stock\n- Retained earnings\n- Other comprehensive income (subject to filters)\n- **Required minimum: 4.5% of RWA** under Basel III\n- Most stringent quality — no maturity, fully subordinated, dividends fully discretionary\n\n**AT1 — Additional Tier 1 (contingent capital):**\n- Perpetual subordinated instruments (e.g., contingent convertible bonds / CoCos)\n- Must absorb losses at a trigger (typically 5.125% CET1 ratio) — either converts to equity or is written down\n- The **Credit Suisse AT1 wipeout (March 2023)** shocked markets when $17B of AT1 was written to zero while equity received some value — violating expected creditor hierarchy\n\n**Tier 2 Capital (gone-concern capital):**\n- Subordinated debt with minimum 5-year remaining maturity\n- Loan loss provisions (up to 1.25% of RWA)\n- Absorbs losses primarily in resolution — protects depositors and senior creditors\n\n**Total Capital Requirement:**\n- CET1: min 4.5% of RWA\n- Tier 1 (CET1 + AT1): min 6% of RWA\n- Total Capital (Tier 1 + Tier 2): min 8% of RWA\n- **Capital Conservation Buffer**: additional 2.5% CET1 — restricts dividends/buybacks if breached\n- Effective CET1 minimum for a typical bank: **7% of RWA** (4.5% + 2.5% conservation buffer)",
 highlight: [
 "CET1",
 "AT1",
 "Tier 2",
 "4.5% of RWA",
 "contingent convertible",
 "CoCos",
 "Capital Conservation Buffer",
 "7%",
 "gone-concern",
 "going-concern",
 ],
 },
 {
 type: "teach",
 title: "Risk-Weighted Assets & The Leverage Ratio",
 content:
 "Not all assets carry equal risk — a government bond is safer than a subprime mortgage. Risk-weighted assets (RWA) account for this by applying different weights to different exposures.\n\n**Risk-Weighted Assets (RWA):**\nEach asset is multiplied by a risk weight reflecting its credit, market, and operational risk:\n- **Cash and central bank deposits**: 0% risk weight\n- **OECD government bonds**: 0% (sovereign)\n- **Residential mortgages**: 35% (standardized approach) or model-based (IRB approach)\n- **Corporate loans (investment grade)**: 100%\n- **Retail revolving credit (credit cards)**: 75%\n- **Equity investments**: 100–250%\n\n**Example:** Bank holds $100M mortgages (35% weight) + $100M corporate loans (100% weight) + $50M cash (0% weight).\nRWA = $35M + $100M + $0 = $135M\nAt 8% total capital requirement: $135M × 8% = $10.8M required capital\n\n**The problem with RWA:**\nBanks using internal models (IRB approach) can influence their RWA by adjusting model inputs. Pre-crisis, banks systematically underestimated correlations and tail risk, reducing RWA and required capital. The Basel 'output floor' (finalized in Basel III endgame) addresses this by requiring internal-model RWA to be at least 72.5% of standardized RWA.\n\n**Leverage Ratio — The Unweighted Backstop:**\nTier 1 Capital / Total Exposures (unweighted) **3%** (minimum)\nG-SIBs: 3.5–5% depending on jurisdiction\n\nThe leverage ratio treats a government bond identically to a subprime loan — it is a blunt tool but cannot be gamed by model manipulation. It prevents banks from building enormous balance sheets of 'zero risk weight' assets with minimal capital. Pre-crisis, some European banks operated at **50–60× leverage** on an unweighted basis.",
 highlight: [
 "risk-weighted assets",
 "RWA",
 "risk weight",
 "0%",
 "IRB approach",
 "leverage ratio",
 "3%",
 "output floor",
 "72.5%",
 ],
 },
 {
 type: "teach",
 title: "LCR, NSFR & Stress Testing",
 content:
 "Beyond capital, Basel III introduced two new liquidity standards to ensure banks can survive short-term panics and are structurally funded for the long term.\n\n**Liquidity Coverage Ratio (LCR):**\nHQLAs (High-Quality Liquid Assets) / Net Cash Outflows over 30 days **100%**\n\nHQLAs are assets that can be sold quickly without material price impact in a stress scenario:\n- Level 1: cash, central bank reserves, sovereign debt — 0% haircut\n- Level 2A: GSE-issued MBS, AA+ corporate bonds — 15% haircut\n- Level 2B: lower-quality corporate bonds, equities — 25–50% haircut\n\nNet cash outflows = assumed outflows (deposit runs, credit line draws) minus inflows under stress assumptions. The LCR ensures the bank survives a 30-day market stress scenario even without central bank support.\n\n**Net Stable Funding Ratio (NSFR):**\nAvailable Stable Funding (ASF) / Required Stable Funding (RSF) **100%**\n\nThe NSFR addresses the structural maturity mismatch:\n- Stable funding sources (equity, long-term debt, sticky retail deposits) score higher in ASF\n- Long-term illiquid assets (commercial real estate loans, equity) require more stable funding (higher RSF)\n- Ensures long-term assets are not funded by runnable short-term liabilities\n\n**Stress Testing — DFAST and CCAR:**\nAnnual Fed exercise for banks with $100B+ in assets:\n- **Baseline scenario**: benign economic path\n- **Adverse scenario**: moderate recession\n- **Severely adverse scenario**: severe global recession, unemployment to 10%+, equity markets -50%, commercial real estate -35%\n\nBanks must maintain CET1 4.5% through 9 quarters of stress losses. If they fail, they cannot pay dividends or buy back stock. Public disclosure of results creates market discipline beyond regulatory minimum.",
 highlight: [
 "LCR",
 "Liquidity Coverage Ratio",
 "HQLA",
 "100%",
 "NSFR",
 "Net Stable Funding Ratio",
 "30-day stress",
 "DFAST",
 "CCAR",
 "severely adverse scenario",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A bank holds $500M in CET1 capital against $6,250M in risk-weighted assets (RWA). The regulatory minimum CET1 ratio is 4.5% and the Capital Conservation Buffer is 2.5%. Does the bank have a capital buffer, and can it freely pay dividends?",
 options: [
 "CET1 ratio is 8% — above the 7% combined floor, so the bank has a 1% buffer and can pay dividends freely",
 "CET1 ratio is 8% — below the required 10%, so the bank must restrict capital distributions",
 "CET1 ratio is 4.5% — exactly at the minimum, leaving no buffer and restricting dividends",
 "The bank cannot determine its buffer without knowing its leverage ratio",
 ],
 correctIndex: 0,
 explanation:
 "CET1 ratio = $500M / $6,250M = 8%. The combined CET1 requirement is the minimum (4.5%) plus the Capital Conservation Buffer (2.5%) = 7%. The bank's 8% CET1 exceeds the 7% combined floor by 1 percentage point, giving it a 1% buffer. A bank above the combined buffer floor can freely pay dividends and buy back stock. If it fell into the buffer zone (between 4.5% and 7%), distributions would be restricted depending on where in the buffer the ratio sits. This structure creates incentive to maintain capital well above the bare minimum.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The Net Stable Funding Ratio (NSFR) was designed to address the same structural vulnerability that caused the 2008 crisis — banks funding long-term illiquid assets with short-term runnable liabilities.",
 correct: true,
 explanation:
 "True. The NSFR directly targets the maturity mismatch that amplified the 2008 crisis. Investment banks like Bear Stearns and Lehman Brothers funded portfolios of long-dated MBS and leveraged loans with overnight repo — the shortest-duration funding available. When repo lenders refused to roll over funding, the banks could not liquidate their assets fast enough to repay. The NSFR requires that illiquid long-term assets be matched with stable long-term funding sources, making the funding structure less prone to sudden collapse. The LCR addresses the short-term (30-day) shock; the NSFR addresses the structural (one-year) mismatch.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "During CCAR stress testing, a major bank runs the Fed's severely adverse scenario: 10% unemployment, 50% equity market decline, 35% commercial real estate price drop. The bank's starting CET1 is 11.5%. Stress losses over 9 quarters total $28B against a $320B RWA base, and no capital distributions are assumed.",
 question:
 "Can the bank pass the stress test, and what is the approximate ending CET1 ratio?",
 options: [
 "The bank fails — stress losses always exceed starting capital in severe scenarios",
 "The bank passes — ending CET1 2.75%, above the 4.5% minimum required during stress",
 "The bank passes — ending CET1 2.75%, but this is below the 4.5% minimum, so the bank fails",
 "The bank passes — ending CET1 2.75%, which is checked against a different stress minimum of 2%",
 ],
 correctIndex: 2,
 explanation:
 "Starting CET1 capital = 11.5% × $320B = $36.8B. After $28B in stress losses: $36.8B $28B = $8.8B. Ending CET1 ratio = $8.8B / $320B 2.75%. The stress test requires banks to maintain CET1 4.5% through the severe scenario. At 2.75%, this bank falls below the 4.5% minimum — it fails the stress test. Consequences include restrictions on dividends and buybacks and a requirement to submit a revised capital plan. This illustrates why banks maintain capital well above the 4.5% regulatory floor — the 'management buffer' above minimums is essential to pass stress tests with margin to spare.",
 difficulty: 3,
 },
 ],
 },
 ],
};
