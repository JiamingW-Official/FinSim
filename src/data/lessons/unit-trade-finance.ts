import type { Unit } from "./types";

export const UNIT_TRADE_FINANCE: Unit = {
 id: "trade-finance",
 title: "International Trade Finance",
 description:
 "Master letters of credit, trade instruments, and cross-border payment mechanics",
 icon: "Globe",
 color: "#0EA5E9",
 lessons: [
 // Lesson 1: Letters of Credit 
 {
 id: "trade-finance-1",
 title: "Letters of Credit",
 description:
 "Documentary LC mechanics, UCP 600 rules, sight vs usance LCs, and the required shipping documents that trigger payment",
 icon: "FileText",
 xpReward: 80,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "What Is a Letter of Credit?",
 content:
 "A **letter of credit (LC)** is a written commitment by a bank (the issuing bank) to pay a seller (the beneficiary) a specified sum, provided the seller presents documents that strictly comply with the LC terms within the validity period.\n\nLCs solve the fundamental trust problem in international trade: a buyer in Brazil and a seller in Germany have never met, operate under different legal systems, and cannot simultaneously exchange goods for cash.\n\n**How an LC works — the four-party structure:**\n1. **Applicant (buyer)**: Requests the LC from their local bank and defines the terms — amount, expiry, required documents\n2. **Issuing bank**: The buyer's bank that issues the LC and takes on the payment obligation\n3. **Beneficiary (seller/exporter)**: Ships goods and presents documents to receive payment\n4. **Advising/confirming bank**: The seller's local bank that transmits (and optionally confirms) the LC\n\n**Irrevocable vs revocable:**\nUnder **UCP 600** (the Uniform Customs and Practice for Documentary Credits, the global rulebook published by the ICC), all LCs are irrevocable by default. Once issued, the LC cannot be amended or cancelled without the agreement of all parties — giving the seller certainty that the bank's payment commitment is firm.\n\n**Confirmed LC:**\nWhen the seller is uncomfortable with the issuing bank's country risk (e.g., the issuing bank is in a politically unstable country), the seller's local bank can **add its confirmation** — creating a second, independent payment undertaking from a bank the seller trusts. The seller then has two banks guaranteeing payment.",
 bullets: [
 "UCP 600: the ICC rulebook governing over 80% of global LC transactions",
 "Irrevocable: cannot be cancelled unilaterally once issued",
 "Confirmed: adds a second bank guarantee from the seller's home country",
 "Strict compliance: banks check documents, not goods — every comma matters",
 ],
 },
 {
 type: "teach",
 title: "Sight vs Usance LCs and Required Documents",
 content:
 "LCs differ on **when payment is made** and **what documents trigger it**.\n\n**Sight LC:**\nPayment is made immediately (within 5 business days) upon presentation of complying documents. Best for sellers who need cash right away. The buyer's account is debited promptly.\n\n**Usance LC (deferred payment / time draft):**\nPayment is made at a future date — typically 30, 60, 90, or 180 days after shipment or after sight. This gives the buyer time to sell the imported goods before paying. A usance LC can be converted into a **banker's acceptance** — a tradeable money-market instrument.\n\n**Standard documents required under a typical LC:**\n- **Bill of Lading (B/L)**: Issued by the shipping company; proves goods were loaded and serves as title to the cargo. A clean B/L (no clauses noting damage) is almost always required.\n- **Commercial Invoice**: Seller's invoice stating quantity, price, and description — must exactly match the LC terms.\n- **Packing List**: Itemizes contents of each package; supports customs clearance.\n- **Certificate of Origin**: Proves where goods were manufactured — critical for customs duty calculation and preferential trade agreements.\n- **Insurance Certificate**: Confirms goods are insured in transit (usually CIF terms).\n- **Inspection Certificate**: Third-party quality check (required for some commodities and buyers).\n\n**The strict compliance doctrine:**\nBanks examine documents on their face. A commercial invoice describing 'Grade A Wheat' when the LC specifies 'Premium Grade Wheat' is a **discrepancy** — the bank may refuse documents and delay payment until the buyer waives the discrepancy.",
 bullets: [
 "Sight LC: pay on document presentation (within ~5 days)",
 "Usance LC: deferred payment (30–180 days), financeable as banker's acceptance",
 "Bill of lading = title to goods; must be 'clean' (no damage clauses)",
 "Strict compliance: all documents must match LC terms exactly — even minor wording",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A German exporter presents shipping documents under a 90-day usance LC. The issuing bank examines the documents and finds the commercial invoice describes goods as 'Grade A Steel Coil' while the LC specifies 'Prime Grade Steel Coil'. Under UCP 600, what is the most likely bank action?",
 options: [
 "Refuse the documents and notify the presenter of the discrepancy within 5 banking days",
 "Pay immediately since the goods are the same",
 "Automatically amend the LC to match the invoice description",
 "Forward the documents to the buyer without flagging the issue",
 ],
 correctIndex: 0,
 explanation:
 "Under UCP 600 Article 16, if a bank determines documents are discrepant it must give a single notice of refusal within 5 banking days. The strict compliance doctrine means even minor wording differences between the invoice and LC constitute a discrepancy. The bank cannot pay without the applicant (buyer) waiving the discrepancy. Banks check documents on their face — they do not consider whether the goods are actually equivalent.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Under UCP 600, a letter of credit can be revoked by the issuing bank at any time before the seller presents documents.",
 correct: false,
 explanation:
 "UCP 600 Article 3 states that a credit is irrevocable even if it does not so state. This is a fundamental change from the old UCP 500, which allowed revocable LCs. Once issued, an LC cannot be amended or cancelled without the agreement of the issuing bank, the confirming bank (if any), and the beneficiary. This irrevocability is what gives exporters the confidence to ship goods against an LC.",
 difficulty: 1,
 },
 {
 type: "quiz-mc",
 question:
 "An exporter in Vietnam is selling electronics to a buyer in Venezuela. The exporter's bank advises that the Venezuelan issuing bank has a poor credit profile and the country faces currency restrictions. What LC structure best protects the Vietnamese exporter?",
 options: [
 "A confirmed irrevocable LC where a first-class bank in Vietnam adds its payment guarantee",
 "A sight LC without confirmation from any other bank",
 "An open account arrangement to avoid bank fees",
 "A usance LC payable 180 days after shipment",
 ],
 correctIndex: 0,
 explanation:
 "A confirmed LC adds the payment undertaking of a reputable bank in the exporter's country (or another strong-credit country). If the issuing bank or its country defaults or imposes currency restrictions, the confirming bank still pays on complying documents. This eliminates both the bank credit risk and the country risk for the Vietnamese exporter. Confirmation is the key tool when dealing with high-risk issuing jurisdictions.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Trade Instruments & SWIFT 
 {
 id: "trade-finance-2",
 title: "Trade Instruments & SWIFT",
 description:
 "Bills of exchange, banker's acceptances, open account terms, consignment, SWIFT MT700/MT103, and correspondent banking networks",
 icon: "Landmark",
 xpReward: 85,
 difficulty: "intermediate",
 steps: [
 {
 type: "teach",
 title: "Bills of Exchange and Banker's Acceptances",
 content:
 "A **bill of exchange** (also called a draft) is a written, unconditional order by one party (the drawer) directing another party (the drawee) to pay a fixed sum on a specified date. Bills of exchange are the foundational payment instrument in international trade.\n\n**Types of drafts:**\n- **Sight draft**: Payable immediately upon presentation — equivalent to a sight LC\n- **Time draft (usance draft)**: Payable at a specified future date — e.g., '90 days after sight'\n\n**Banker's Acceptance (BA):**\nWhen a bank accepts (i.e., stamps and signs) a time draft, it becomes a **banker's acceptance** — an unconditional obligation of the bank to pay the face amount at maturity. The BA can then be sold in the money market at a discount to its face value. This converts the importer's future payment obligation into a liquid, tradeable instrument.\n\nExample: A U.S. importer buys $2 million of goods under a 90-day LC. The exporter draws a $2M time draft on the U.S. bank. The bank accepts it. The exporter can hold it to maturity, or sell it immediately in the BA market at, say, $1.985M — getting cash now at a small discount.\n\n**Documentary Collections:**\nA cheaper alternative to LCs. The exporter's bank (remitting bank) sends documents to the buyer's bank (collecting bank) with instructions:\n- **D/P (Documents against Payment)**: Buyer pays cash to receive documents (and thus the goods)\n- **D/A (Documents against Acceptance)**: Buyer signs a time draft to receive documents; pays at maturity\n\nKey difference from LC: in a documentary collection, no bank commits to pay — the bank is only acting as an agent. If the buyer refuses to pay or accept, the seller's documents are stuck and the goods may be stranded at the port.",
 bullets: [
 "Sight draft: pay now; time draft: pay at a future date",
 "Banker's acceptance: bank-accepted draft; tradeable money-market instrument",
 "D/P collection: documents released only against payment",
 "D/A collection: documents released against buyer's signed time draft",
 ],
 },
 {
 type: "teach",
 title: "Payment Terms Spectrum and SWIFT Messaging",
 content:
 "International trade payment methods range from maximum security for sellers to maximum convenience for buyers. Understanding where each method sits on the risk spectrum is essential.\n\n**Payment terms from most secure (seller) to least secure (seller):**\n1. **Cash in advance / prepayment**: Seller receives full payment before shipping. Zero seller risk; maximum buyer risk.\n2. **Letter of Credit**: Bank guarantees payment on complying documents. Low seller risk if confirmed.\n3. **Documentary Collection (D/P)**: Buyer must pay to get documents; seller retains title until then. Moderate risk — buyer could simply abandon goods.\n4. **Documentary Collection (D/A)**: Buyer gets documents against signed draft; seller relies on buyer's promise. Higher risk.\n5. **Open Account**: Seller ships goods, invoices buyer, waits 30–90 days for payment. No bank involvement. Seller bears full credit risk.\n6. **Consignment**: Seller ships goods; payment is received only when end buyer purchases from importer. Maximum seller risk.\n\n**SWIFT (Society for Worldwide Interbank Financial Telecommunication):**\nSWIFT is the global messaging network banks use to communicate securely. Key MT (Message Type) codes in trade finance:\n- **MT700**: Issue of Documentary Credit — the LC itself is transmitted from issuing bank to advising bank\n- **MT710/MT720**: Advising of LC (with or without confirmation)\n- **MT750**: Advice of discrepancy — bank notifying applicant of document discrepancy\n- **MT103**: Single customer credit transfer — the actual payment wire sent between banks\n- **MT202**: Bank-to-bank payment — used for interbank settlements\n\n**Correspondent banking:**\nMost banks do not have direct relationships globally. They rely on **correspondent banks** — third-party banks with which they maintain nostro/vostro accounts. When a Kenyan bank needs to make a USD payment, it instructs its U.S. correspondent (e.g., Citi or JPMorgan) via MT103. Each intermediary deducts its fee, reducing the amount received.",
 bullets: [
 "Open account: dominant for trusted trading partners (80%+ of global trade volume)",
 "MT700: SWIFT message that transmits the LC from issuing to advising bank",
 "MT103: the payment instruction for cross-border wire transfers",
 "Correspondent banking: chain of banks that route international payments",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A U.S. importer receives $3 million of electronics from a Taiwanese supplier under a 60-day LC. The U.S. bank accepts the time draft drawn by the supplier. What instrument has been created, and what can the supplier do with it?",
 options: [
 "A banker's acceptance — the supplier can sell it in the money market at a discount to receive cash immediately",
 "A sight draft — the supplier must wait 60 days for automatic payment",
 "A documentary collection — the supplier must resubmit documents in 60 days",
 "A performance bond — the supplier can draw on it if the buyer defaults",
 ],
 correctIndex: 0,
 explanation:
 "When a bank stamps 'accepted' on a time draft, it creates a banker's acceptance (BA) — an unconditional bank obligation to pay face value at maturity. BAs are liquid money-market instruments. The Taiwanese supplier can sell the BA immediately in the secondary market at a slight discount (reflecting the 60-day time value of money) and receive cash today rather than waiting. U.S. BA rates are close to Treasury bill rates because the obligor is a creditworthy bank, not the importer.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In a Documents against Acceptance (D/A) documentary collection, the collecting bank guarantees payment to the exporter if the importer fails to honor the accepted draft at maturity.",
 correct: false,
 explanation:
 "In a documentary collection, banks act as agents — they handle documents and collect payment, but they do NOT guarantee payment. This is the fundamental difference from an LC. Under D/A terms, if the importer accepts the draft but later defaults at maturity, the exporter has no recourse against the bank. The exporter would need to pursue the importer directly, potentially through legal action in the importer's jurisdiction. This credit risk is why D/A terms are only appropriate for trusted trading relationships.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Export Finance & Guarantees 
 {
 id: "trade-finance-3",
 title: "Export Finance & Guarantees",
 description:
 "Export credit agencies, forfaiting, factoring, standby LCs, performance bonds, and bid bonds used in cross-border transactions",
 icon: "Shield",
 xpReward: 90,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Export Credit Agencies and Official Support",
 content:
 "**Export Credit Agencies (ECAs)** are government-backed institutions that support domestic exporters by providing financing, guarantees, and insurance for foreign buyers. They step in where private markets are unwilling to provide affordable credit — particularly for large capital goods, infrastructure projects, and sales to high-risk markets.\n\n**Key ECAs worldwide:**\n- **Ex-Im Bank (U.S. Export-Import Bank)**: Provides loans, guarantees, and insurance for U.S. exporters. Mandates of 'last resort' — only supports deals where private financing is unavailable or too expensive.\n- **UK Export Finance (UKEF)**: UK government's ECA; offers buyer credit loans, supplier credit guarantees, and bond insurance.\n- **Euler Hermes (Germany) / Bpifrance (France) / EKN (Sweden)**: European ECAs with similar mandates.\n- **Sinosure / China Ex-Im Bank**: China's ECAs, highly active in financing Belt and Road infrastructure projects globally.\n\n**How ECA financing works:**\n1. A U.S. power company wins a $500M contract to build a gas turbine plant in Indonesia\n2. The Indonesian buyer cannot obtain affordable private bank financing\n3. Ex-Im Bank guarantees an 85% loan from a U.S. commercial bank to the Indonesian buyer\n4. The U.S. commercial bank lends at favorable rates because the U.S. government bears the default risk\n5. The Indonesian buyer pays back the loan over 12 years from the project's cash flows\n\n**OECD Arrangement on export credits (the 'Consensus'):**\nTo prevent subsidy races between countries, OECD governments agreed on minimum interest rates (CIRRs), maximum repayment terms (typically up to 10–15 years for large projects), and maximum government content (generally 85% financing). ECAs from OECD countries are bound by this framework.",
 bullets: [
 "ECAs are government-backed — they take risks private banks won't",
 "Ex-Im Bank: U.S. ECA; supports U.S. exports to foreign buyers",
 "UKEF, Euler Hermes, Bpifrance: major European ECAs",
 "OECD Consensus: prevents subsidy wars between ECA programs",
 ],
 },
 {
 type: "teach",
 title: "Forfaiting, Factoring, SBLC, and Trade Bonds",
 content:
 "**Forfaiting:**\nForfaiting is the non-recourse purchase of medium-to-long-term trade receivables (typically 1–7 years). A forfaiter buys the exporter's receivables — usually in the form of bills of exchange or promissory notes — at a discount, taking on all the credit, country, and transfer risk without recourse to the seller.\n\nKey features:\n- Non-recourse: exporter has no liability if buyer defaults\n- Instruments must be backed by an aval (bank guarantee) from the buyer's bank\n- Typically used for capital goods (machinery, aircraft, infrastructure)\n- Forfaiter can repackage and sell the receivables in the secondary market\n\n**Trade Receivables Factoring:**\nFactoring involves selling short-term trade invoices (30–120 days) to a factor at a discount. Unlike forfaiting, factoring often involves recourse — if the buyer doesn't pay, the seller may have to buy back the invoice. Export factoring includes two factors: the export factor (seller's country) and the import factor (buyer's country) who evaluates buyer creditworthiness.\n\n**Standby Letter of Credit (SBLC):**\nAn SBLC is a contingent payment instrument — it is only drawn upon if the applicant (buyer) fails to perform a contractual obligation. It is essentially a guarantee dressed as an LC.\n- Used as a **payment guarantee** when open account terms are extended\n- Governed by ISP98 (International Standby Practices) or UCP 600\n- Common in U.S. market where bank guarantees are legally restricted\n\n**Performance Bonds and Bid Bonds:**\n- **Bid bond (tender guarantee)**: Ensures a bidder will sign the contract if awarded. Typically 1–3% of contract value. Prevents frivolous bids.\n- **Performance bond**: Issued once contract is signed. Covers contractor default during construction. Typically 5–10% of contract value.\n- **Advance payment guarantee**: Protects buyer who pays a deposit — if seller defaults, deposit is returned.\n- **Retention money guarantee**: Replaces retention withheld during warranty period.",
 bullets: [
 "Forfaiting: non-recourse purchase of medium-term trade receivables with aval",
 "Factoring: sale of short-term invoices, often with recourse to exporter",
 "SBLC: contingent guarantee; drawn only on applicant's non-performance",
 "Bid bond / performance bond: secure construction and procurement contracts",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "A German machinery exporter sells a 10 million production line to a Brazilian buyer on 5-year deferred terms. The exporter wants to receive cash now and eliminate all credit risk. Which structure is most appropriate?",
 options: [
 "Forfaiting: sell the promissory notes (avalised by a Brazilian bank) to a forfaiter on a non-recourse basis",
 "Open account: ship the goods and send an invoice due in 5 years",
 "D/A documentary collection: release documents against the buyer's accepted draft",
 "Export factoring: sell the invoice to a factor with full recourse to the exporter",
 ],
 correctIndex: 0,
 explanation:
 "Forfaiting is purpose-built for medium-to-long-term capital goods exports where the exporter wants to convert deferred payment into immediate cash without retaining any credit risk. The Brazilian buyer's bank avalises (guarantees) the promissory notes, and the forfaiter purchases them at a discount — no recourse to the exporter. Export factoring is typically short-term (under 180 days) and often has recourse; it is not suited for a 5-year transaction. D/A collection gives no bank payment guarantee.",
 difficulty: 3,
 },
 {
 type: "quiz-tf",
 statement:
 "A standby letter of credit (SBLC) functions like a regular documentary LC — the beneficiary is expected to draw on it as the primary payment mechanism in normal course of business.",
 correct: false,
 explanation:
 "An SBLC is a contingent instrument — it is only intended to be drawn upon if the applicant fails to perform an obligation (e.g., fails to pay an invoice, fails to complete a project). In normal circumstances where the applicant performs, the SBLC expires without being drawn. This contrasts with a commercial LC, which is the primary intended payment method and is expected to be drawn upon after shipment. SLBCs are more like guarantees; commercial LCs are active payment vehicles.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "A construction company wins a $200 million infrastructure contract in Saudi Arabia. The Saudi project owner requires security at the bid stage. Which instrument is issued at bid stage, and approximately what percentage of the contract value is typical?",
 options: [
 "A bid bond (tender guarantee) for 1–3% of contract value",
 "A performance bond for 10% of contract value issued before bidding",
 "An advance payment guarantee for 50% of contract value",
 "A standby LC for the full $200 million",
 ],
 correctIndex: 0,
 explanation:
 "A bid bond (tender guarantee) is issued at the bidding stage to protect the project owner if a winning bidder refuses to execute the contract or cannot provide the required performance bond. Bid bonds are typically 1–3% of contract value. Once the contract is awarded and signed, a performance bond (typically 5–10% of contract value) replaces the bid bond to cover the risk of contractor default during execution. These are sequential instruments — bid bond first, then performance bond.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 4: Risk Management in Trade Finance 
 {
 id: "trade-finance-4",
 title: "Trade Finance Risk Management",
 description:
 "Country risk, FX exposure, payment risk matrix, supply chain disruption, sanctions compliance, and trade-based money laundering red flags",
 icon: "AlertTriangle",
 xpReward: 95,
 difficulty: "advanced",
 steps: [
 {
 type: "teach",
 title: "Country Risk and FX Risk in Trade",
 content:
 "International trade introduces risks that purely domestic transactions do not face. Understanding and mitigating these risks is central to trade finance.\n\n**Country risk** encompasses political, economic, and regulatory risks arising from the buyer's country:\n- **Transfer risk**: The buyer's government prevents conversion of local currency to USD (capital controls), blocking payment even if the buyer is willing\n- **Expropriation / confiscation**: Government seizes the goods or business assets\n- **Political violence**: War, revolution, or civil unrest disrupts operations and payments\n- **Sovereign default**: The country cannot service its foreign obligations\n- **Regulatory change**: New import restrictions, tariffs, or embargo that prevent goods from entering\n\n**How to mitigate country risk:**\n- Obtain a **confirmed LC** from a first-class bank outside the risk country\n- Buy **export credit insurance** from an ECA (Ex-Im Bank, UKEF) or private insurer (Atradius, Coface, ICISA members)\n- Require advance payment or early payment terms\n\n**Foreign exchange (FX) risk:**\nMost commodity trade is invoiced in USD; other trade is denominated in the seller's or buyer's currency. FX risk arises when payment will be received in a currency different from the seller's cost base.\n\nExamples:\n- Japanese exporter invoices in USD; receives $1M in 90 days. If JPY strengthens 5% vs USD, the yen value drops from ¥150M to ¥142.5M — a ¥7.5M loss.\n- Brazilian importer buys in USD but earns BRL. A BRL depreciation raises the real cost of imports.\n\n**FX hedging tools for trade:**\n- **Forward contracts**: Lock in an exchange rate for a specific future date — eliminates uncertainty but forgoes favorable moves\n- **FX options**: Buy the right (not obligation) to exchange at a set rate — costs a premium but provides upside\n- **Natural hedging**: Invoice in your own currency to pass FX risk to the counterparty\n- **Currency accounts**: Maintain USD accounts to avoid repeated conversions",
 bullets: [
 "Transfer risk: government blocks currency conversion even if buyer wants to pay",
 "Export credit insurance: covers commercial and political risk on trade receivables",
 "Forward contract: locks FX rate — certainty at the cost of flexibility",
 "Natural hedge: invoicing in home currency shifts FX risk to buyer",
 ],
 },
 {
 type: "teach",
 title: "Sanctions Compliance and Trade-Based Money Laundering",
 content:
 "Sanctions and financial crime compliance have become the most consequential risk area in trade finance, with multi-billion-dollar fines imposed on major banks for violations.\n\n**Sanctions in trade finance:**\nSanctions regimes (OFAC in the U.S., EU, UN, UK OFSI) prohibit transactions with designated countries, entities, and individuals:\n- **Comprehensive country sanctions**: Cuba, Iran, North Korea, Syria, Russia (partial) — no transactions permitted\n- **Sectoral sanctions**: Restrictions on specific industries (Russian energy, financial sector)\n- **SDN list (Specially Designated Nationals)**: Named individuals and entities globally\n\nBanks must screen all LC parties — applicant, beneficiary, shipping company, vessel, port of loading, port of discharge, goods description — against sanctions lists. A single hit anywhere in the transaction can result in rejection.\n\n**Trade-Based Money Laundering (TBML):**\nTBML is the use of trade transactions to move criminal proceeds across borders, disguised as legitimate commerce. The FATF (Financial Action Task Force) identifies it as one of the three main money laundering methods.\n\n**TBML red flags banks must monitor:**\n- **Over/under-invoicing**: Invoice price significantly above or below market price for the commodity — moves value across borders under the guise of trade\n- **Multiple invoicing**: Same shipment invoiced multiple times to multiple buyers\n- **Falsely described goods**: Invoicing generic goods (e.g., 'machine parts') to obscure high-value items\n- **Round-trip transactions**: Goods shipped out and returned with no clear commercial rationale\n- **Mismatched documents**: Quantity on invoice does not match bill of lading or packing list\n- **Third-party payment**: Payment by or to an unrelated third party with no clear commercial link\n- **High-risk corridors**: Transactions involving FATF grey-listed or black-listed jurisdictions\n\n**Bank due diligence requirements:**\nKnow Your Customer (KYC), Enhanced Due Diligence (EDD) for high-risk transactions, transaction monitoring, and commodity price benchmarking are all standard compliance obligations for trade finance banks.",
 bullets: [
 "OFAC SDN list: U.S. sanctions list; a single hit blocks the entire transaction",
 "TBML: criminal proceeds hidden in legitimate trade flows via mispriced invoices",
 "Over-invoicing red flag: invoice price materially above market value for the commodity",
 "Third-party payment: payment by unrelated party is a high-risk TBML indicator",
 ],
 },
 {
 type: "quiz-mc",
 question:
 "Rank the following trade payment methods from MOST secure to LEAST secure from the exporter's perspective: (1) Open Account, (2) Confirmed Irrevocable LC, (3) Cash in Advance, (4) D/P Documentary Collection",
 options: [
 "3 2 4 1",
 "2 3 4 1",
 "3 4 2 1",
 "2 4 3 1",
 ],
 correctIndex: 0,
 explanation:
 "From most to least secure for the exporter: Cash in Advance (3) — full payment before shipping, zero credit risk; Confirmed Irrevocable LC (2) — two bank guarantees, strong protection against both commercial and country risk; D/P Documentary Collection (4) — buyer must pay to obtain documents and thus the goods, seller retains title, but no bank payment commitment; Open Account (1) — seller has shipped goods and has only the buyer's promise to pay, maximum credit exposure. Open account dominates by volume (80%+ of global trade) because it is used between established trusted partners.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "Trade-based money laundering typically involves obvious, easily detectable discrepancies that compliance officers can identify without analyzing commodity market prices.",
 correct: false,
 explanation:
 "TBML is specifically designed to be difficult to detect because it exploits the high volume and complexity of trade documentation. The most common technique — over- or under-invoicing — requires knowledge of fair market prices for the specific commodity to identify. A bank receiving an LC for 'coffee beans at $3.50/kg' cannot flag it as suspicious without knowing the current market price is $1.80/kg. This is why FATF emphasizes the need for commodity price databases, trade pattern analytics, and cross-border data sharing between customs authorities and financial intelligence units.",
 difficulty: 2,
 },
 {
 type: "quiz-mc",
 question:
 "A trade finance banker is reviewing an LC application. The goods are listed as 'general industrial components' shipped from a free-trade zone known for TBML activity to an end-buyer the bank has never dealt with, and the payment beneficiary is a company in a different country with no apparent relationship to the shipper. Which two red flags are most concerning under TBML guidelines?",
 options: [
 "Vague goods description obscuring the commodity + third-party payment with no commercial link",
 "The use of a letter of credit instead of open account + the 90-day usance term",
 "The free-trade zone origin of goods + use of a confirming bank",
 "The large transaction amount + foreign currency denomination",
 ],
 correctIndex: 0,
 explanation:
 "Two of the strongest TBML red flags are: (1) falsely or vaguely described goods — 'general industrial components' could mask anything from electronics to weapons, making commodity price comparison and AML screening impossible; and (2) third-party payment — when payment flows to or from a party with no obvious relationship to the trade, it suggests the transaction may be structured to obscure beneficial ownership. Both are specifically listed in FATF guidance on trade-based money laundering. Confirming banks, usance terms, and large transaction amounts are legitimate trade finance features and not inherently suspicious.",
 difficulty: 3,
 },
 ],
 },
 ],
};
