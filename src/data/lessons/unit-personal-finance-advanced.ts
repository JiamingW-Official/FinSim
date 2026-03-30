import { Unit } from "./types";

export const UNIT_PERSONAL_FINANCE_ADVANCED: Unit = {
 id: "personal-finance-advanced",
 title: "Personal Finance Advanced",
 description:
 "Master tax-advantaged accounts, insurance strategies, estate planning, and advanced wealth-building techniques used by high-net-worth individuals.",
 icon: "Wallet",
 color: "#059669",
 lessons: [
 {
 id: "pfa-tax-advantaged-accounts",
 title: "Tax-Advantaged Accounts",
 description:
 "Deep dive into 401(k), Roth IRA, HSA, 529, and mega backdoor Roth strategies for maximizing tax efficiency across your financial life.",
 icon: "PiggyBank",
 xpReward: 90,
 difficulty: "advanced",
 duration: 18,
 steps: [
 {
 type: "teach",
 title: "401(k) vs Roth 401(k): Pre-Tax vs Post-Tax",
 content:
 "Traditional 401(k): contributions reduce taxable income today (pre-tax), but withdrawals in retirement are taxed as ordinary income. Required Minimum Distributions (RMDs) begin at age 73.\n\nRoth 401(k): contributions are made with after-tax dollars — no upfront deduction — but qualified withdrawals in retirement are 100% tax-free. Starting in 2024, SECURE 2.0 eliminated RMDs on Roth 401(k)s during the owner's lifetime.\n\nRule of thumb: choose Traditional when your current tax rate is higher than your expected retirement rate; choose Roth when the reverse is true or when you want tax diversification.",
 },
 {
 type: "teach",
 title: "IRA Contribution Limits & Income Phaseouts",
 content:
 "2024 IRA contribution limit: $7,000/year ($8,000 if age 50+).\n\nRoth IRA income phaseout (2024): single filers phase out between $146,000–$161,000 MAGI; married filing jointly $230,000–$240,000. Above the ceiling, direct Roth IRA contributions are prohibited.\n\nTraditional IRA deductibility phaseout applies when you or your spouse have a workplace retirement plan. High earners can still contribute to a non-deductible Traditional IRA — setting up the backdoor Roth strategy.\n\nKey insight: always verify current-year IRS limits, as they adjust annually for inflation.",
 },
 {
 type: "teach",
 title: "Backdoor Roth & Mega Backdoor Roth",
 content:
 "Backdoor Roth IRA: high earners contribute to a non-deductible Traditional IRA, then immediately convert to Roth (no tax owed if no pre-tax IRA balance exists). Watch the 'pro-rata rule' — if you hold other Traditional IRA funds, the conversion is partially taxable.\n\nMega Backdoor Roth: certain 401(k) plans allow after-tax contributions above the employee deferral limit (2024 total 401(k) limit: $69,000). These after-tax contributions can then be converted to Roth via an in-service withdrawal or rolled over to a Roth IRA at separation. This can add up to ~$43,500 of additional Roth space annually — a massive wealth-building lever for high earners.\n\nRequires plan support for after-tax contributions AND in-service distributions.",
 },
 {
 type: "teach",
 title: "HSA Triple Tax Advantage & 529 Plans",
 content:
 "HSA (Health Savings Account): requires enrollment in a High-Deductible Health Plan (HDHP). Contributions are pre-tax, growth is tax-free, and withdrawals for qualified medical expenses are tax-free — a triple tax advantage unmatched by any other account.\n\nAfter age 65, HSA funds can be withdrawn for any purpose (taxed as ordinary income, like a Traditional IRA) — making the HSA a stealth retirement account.\n\n529 College Savings Plan: contributions grow tax-free; withdrawals for qualified education expenses are tax-free. Many states offer deductions for in-state plan contributions. 'Superfunding' allows 5 years of gift tax annual exclusion contributions at once ($90,000 per beneficiary in 2024). SECURE 2.0: unused 529 funds can now be rolled to a Roth IRA (up to $35,000 lifetime, subject to 15-year holding rule).",
 },
 {
 type: "quiz-mc",
 question:
 "Which account type offers a 'triple tax advantage' — pre-tax contributions, tax-free growth, AND tax-free qualified withdrawals?",
 options: [
 "Traditional 401(k)",
 "Health Savings Account (HSA)",
 "529 College Savings Plan",
 "Roth IRA",
 ],
 correctIndex: 1,
 explanation:
 "The HSA is the only account with all three tax benefits simultaneously: contributions reduce taxable income, growth is tax-deferred, and withdrawals for qualified medical expenses are tax-free. The Roth IRA has no deduction on contributions, and the Traditional 401(k) taxes withdrawals.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "SECURE 2.0 (2024) eliminated Required Minimum Distributions (RMDs) for Roth 401(k) accounts during the owner's lifetime.",
 correct: true,
 explanation:
 "Correct. Before SECURE 2.0, Roth 401(k)s were subject to RMDs just like Traditional 401(k)s. The law change now aligns Roth 401(k)s with Roth IRAs, which have never had lifetime RMDs. This makes Roth 401(k)s significantly more attractive for estate planning.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Priya earns $250,000/year and wants to maximize Roth savings. Her employer's 401(k) plan allows after-tax contributions and in-service withdrawals. She has already maxed her $23,000 employee Roth 401(k) deferral.",
 question:
 "What strategy allows Priya to contribute the most additional after-tax money to a Roth account?",
 options: [
 "Contribute directly to a Roth IRA (she is under the income limit)",
 "Use the mega backdoor Roth via after-tax 401(k) contributions + in-service Roth conversion",
 "Open a taxable brokerage account and invest in municipal bonds",
 "Contribute to a traditional IRA and leave it non-deductible",
 ],
 correctIndex: 1,
 explanation:
 "Priya's income ($250,000) exceeds the Roth IRA phaseout ceiling, so direct Roth IRA contributions are prohibited. The mega backdoor Roth allows her to contribute up to ~$46,000 in after-tax 401(k) dollars (total 401(k) limit minus her $23,000 deferral) and convert to Roth — far more than any other option.",
 difficulty: 3,
 },
 ],
 },
 {
 id: "pfa-insurance-risk-management",
 title: "Insurance & Risk Management",
 description:
 "Learn when to use term vs whole life, how to value your human capital, and how umbrella and disability policies protect your wealth.",
 icon: "Shield",
 xpReward: 85,
 difficulty: "advanced",
 duration: 16,
 steps: [
 {
 type: "teach",
 title: "Life Insurance: Term vs Whole vs Universal",
 content:
 "Term life insurance: pure death benefit for a fixed period (10/20/30 years). Low cost — the right choice for most people during their working years when dependents and debt exist. No cash value.\n\nWhole life insurance: permanent coverage with a guaranteed cash value component growing at a fixed rate. Premiums are 5–15x higher than equivalent term. Appropriate for high-net-worth individuals needing permanent estate liquidity or a tax-advantaged cash accumulation vehicle.\n\nUniversal life (UL): flexible premiums and death benefit, with a cash value component tied to declared interest rates or (for VUL) investment subaccounts. More complex; policy can lapse if underfunded.\n\nThe 'buy term and invest the difference' approach outperforms whole life for most middle-class households.",
 },
 {
 type: "teach",
 title: "Human Capital & Disability Insurance",
 content:
 "Human capital is the present value of your future earnings — for a 30-year-old earning $100,000/year, it may exceed $2 million. Insurance replaces this capital if you die or become unable to work.\n\nDisability insurance is often more important than life insurance: you're 3x more likely to be disabled than to die during your working years.\n\n'Own-occupation' definition: you qualify for benefits if you cannot perform the specific duties of your own job — crucial for physicians, surgeons, and specialists. 'Any-occupation' definition is far more restrictive — benefits only if you cannot do any job at all.\n\nTarget coverage: 60–70% of gross income. Group coverage through employers often converts to any-occupation after 2 years.",
 },
 {
 type: "teach",
 title: "Umbrella Liability, Long-Term Care & Self-Insurance",
 content:
 "Umbrella liability policy: provides $1M–$5M of additional liability coverage above your auto and homeowners policies. Cost is remarkably cheap — typically $200–$300/year for $1M of coverage. Essential for anyone with significant assets or income at risk from lawsuits.\n\nTriggered by: auto accidents where you are at fault, injuries on your property, libel/slander claims, rental property incidents.\n\nLong-term care insurance: covers nursing home, assisted living, or in-home care costs (median nursing home cost: $100,000+/year). Key features: elimination period (90-day is standard before benefits begin), inflation rider (3–5% compound is important), and benefit period (3–5 years covers most needs). Hybrid life/LTC products provide a death benefit if LTC is never needed.\n\nSelf-insurance threshold: once net worth exceeds $2–3M, some individuals self-insure for certain risks rather than paying premiums — treating the portfolio itself as the backstop.",
 },
 {
 type: "quiz-mc",
 question:
 "A surgeon wants disability insurance that pays benefits if she cannot perform surgery, even if she could work as a general practitioner. Which policy definition does she need?",
 options: [
 "Any-occupation definition",
 "Own-occupation definition",
 "Modified own-occupation definition",
 "Residual disability definition",
 ],
 correctIndex: 1,
 explanation:
 "Own-occupation definition is essential for specialized professionals. It pays benefits when you cannot perform the specific duties of your current occupation — even if you can work in another capacity. Any-occupation would deny her benefits because she could technically work as a doctor in a non-surgical role.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "An umbrella liability policy typically provides $1M+ of additional liability coverage for approximately $200–$300 per year, making it one of the highest-value insurance products available.",
 correct: true,
 explanation:
 "Correct. Umbrella policies are widely considered to be extremely cost-effective. For $200–$300/year, they extend your liability protection by millions of dollars above auto and homeowners limits. Anyone with significant assets — a home, savings, or high income — should strongly consider one.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Marcus is 35 with two young children, a mortgage, and $200,000 in savings. He needs life insurance. A term policy (20-year, $1M) costs $600/year. A whole life policy with similar death benefit costs $9,000/year.",
 question:
 "What is the primary financial argument for Marcus choosing term life insurance?",
 options: [
 "Whole life insurance never builds cash value",
 "Term premiums are lower, freeing $8,400/year to invest, which likely outgrows whole life cash value",
 "Term policies pay out more at death than whole life",
 "Whole life policies expire before his children are grown",
 ],
 correctIndex: 1,
 explanation:
 "The 'buy term and invest the difference' argument: by saving $8,400/year ($9,000 - $600) and investing it at market returns over 20 years, Marcus would likely accumulate significantly more than the cash value inside the whole life policy. Whole life is appropriate for specific estate planning needs, not general income replacement.",
 difficulty: 2,
 },
 ],
 },
 {
 id: "pfa-estate-planning",
 title: "Estate Planning Essentials",
 description:
 "Navigate wills, trusts, beneficiary designations, gift tax strategies, and advanced techniques for multigenerational wealth transfer.",
 icon: "FileText",
 xpReward: 85,
 difficulty: "advanced",
 duration: 17,
 steps: [
 {
 type: "teach",
 title: "Wills, Trusts & Probate Avoidance",
 content:
 "A will directs asset distribution at death but must go through probate — a public, potentially lengthy court process that can take months and cost 3–8% of the estate.\n\nA revocable living trust holds assets during your lifetime (you retain control), then distributes them at death without probate. Assets must be 'funded' into the trust during your lifetime or they fall back into your estate and probate.\n\nKey trust advantages: privacy (trusts are not public record), speed (assets distributed in days vs months), and multi-state property (avoids ancillary probate in each state where you own real estate).\n\nA 'pour-over will' captures any assets not funded into the trust at death, directing them in.",
 },
 {
 type: "teach",
 title: "Beneficiary Designations & Powers of Attorney",
 content:
 "Beneficiary designations on retirement accounts (401k, IRA), life insurance, and POD/TOD bank accounts transfer assets OUTSIDE of probate — and they supersede your will entirely. A forgotten ex-spouse listed as beneficiary will receive the assets even if your will says otherwise.\n\nReview beneficiaries after every major life event: marriage, divorce, birth, death.\n\nPowers of Attorney:\n- Financial POA: authorizes someone to manage financial affairs if incapacitated\n- Healthcare POA / Healthcare Proxy: authorizes medical decisions\n- Durable POA: remains valid even after incapacity (non-durable POA terminates at incapacity)\n\nWithout a POA, family members may need to petition the court for guardianship — a costly and public process.",
 },
 {
 type: "teach",
 title: "Estate & Gift Tax Strategies",
 content:
 "2024 federal estate tax exemption: $13.61 million per person ($27.22M for married couples with portability election). Estates below this threshold owe no federal estate tax. The exemption is scheduled to sunset to ~$7M in 2026 without Congressional action.\n\nGift tax annual exclusion: $18,000 per recipient in 2024. You can gift this amount to any number of people per year without affecting your lifetime exemption.\n\n529 superfunding: gift 5 years' worth of annual exclusion ($90,000) to a 529 at once, removing it from your estate immediately.\n\nAdvanced techniques:\n- GRAT (Grantor Retained Annuity Trust): transfer asset appreciation to heirs with minimal gift tax\n- IDGT (Intentionally Defective Grantor Trust): sell assets to trust; grantor pays trust's income taxes (additional tax-free gift)\n- Step-up in cost basis: assets held until death receive a new cost basis at fair market value, eliminating embedded capital gains",
 },
 {
 type: "teach",
 title: "Charitable Strategies & Dynasty Trusts",
 content:
 "Donor-Advised Fund (DAF): contribute appreciated assets (stock, real estate) to the DAF, take an immediate charitable deduction, then recommend grants to charities over time. Eliminates capital gains on the donated assets.\n\nQualified Charitable Distribution (QCD): IRA owners 70.5+ can donate up to $105,000/year (2024) directly from an IRA to charity. Counts toward RMD, excluded from gross income — more tax-efficient than deducting a cash donation.\n\nCharitable Remainder Trust (CRT): transfer assets to a trust that pays you income for life; remainder passes to charity. Deduction + income stream + capital gains deferral.\n\nDynasty Trust: designed to last for multiple generations (or in perpetuity in some states), allowing wealth to compound sheltered from estate taxes at each generation. Requires careful state law selection (no rule-against-perpetuities states preferred).",
 },
 {
 type: "quiz-mc",
 question:
 "Which document takes legal precedence over a will for distributing an IRA account at death?",
 options: [
 "The will",
 "The living trust",
 "The beneficiary designation on file with the IRA custodian",
 "The durable power of attorney",
 ],
 correctIndex: 2,
 explanation:
 "Beneficiary designations on retirement accounts, life insurance, and transfer-on-death accounts pass assets directly to named beneficiaries outside of probate — and they supersede the will entirely. This is why reviewing and updating beneficiary designations after every major life event is critical.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "The federal estate tax exemption for 2024 is approximately $13.6 million per person, meaning most Americans will not owe federal estate tax.",
 correct: true,
 explanation:
 "Correct. At $13.61 million per person ($27.22M for married couples using portability), the vast majority of American estates fall below the exemption threshold. However, this exemption is scheduled to sunset to roughly half that amount in 2026 if Congress does not act, making planning relevant for high-net-worth individuals.",
 difficulty: 1,
 },
 {
 type: "quiz-scenario",
 scenario:
 "Elena, age 72, holds $500,000 in a Traditional IRA and is charitably inclined. She wants to donate $20,000 to her university this year and minimize her tax bill. Her RMD for the year is $18,000.",
 question:
 "Which strategy is most tax-efficient for Elena's charitable gift?",
 options: [
 "Take the RMD, donate from checking account, and claim an itemized deduction",
 "Use a Qualified Charitable Distribution (QCD) directly from her IRA to the university",
 "Contribute to a Roth IRA and then donate",
 "Sell IRA assets, pay tax, then donate the proceeds",
 ],
 correctIndex: 1,
 explanation:
 "A QCD transfers money directly from the IRA to the charity tax-free, counts toward her $18,000 RMD, and is excluded from her gross income entirely — no deduction needed. This is more efficient than taking taxable IRA distributions and then donating, especially since fewer taxpayers itemize deductions after the higher standard deduction.",
 difficulty: 3,
 },
 ],
 },
 {
 id: "pfa-advanced-wealth-building",
 title: "Advanced Wealth Building",
 description:
 "Master mortgage payoff decisions, tax-loss harvesting, asset location, direct indexing, NUA, I-bonds, and DAF bunching strategies.",
 icon: "TrendingUp",
 xpReward: 75,
 difficulty: "advanced",
 duration: 20,
 steps: [
 {
 type: "teach",
 title: "Mortgage Payoff vs Invest & Real Estate Leverage",
 content:
 "The core question: is your mortgage's after-tax cost higher or lower than the expected after-tax return on investments?\n\nAfter-tax mortgage cost = mortgage rate x (1 - marginal tax rate), but only if you itemize deductions. At a 7% rate with a 24% marginal rate: after-tax cost is approximately 5.3%. If your investment portfolio is expected to return 7–8% long-term, the math favors investing.\n\nHowever, paying off the mortgage provides a guaranteed return equal to the rate — no market risk. Behavioral factors matter: some people sleep better debt-free.\n\nRule of thumb: pay off mortgage early if (a) it's a high rate, (b) you're near retirement and want lower fixed expenses, or (c) you've already maxed all tax-advantaged accounts.\n\nReal estate leverage — BRRRR strategy: Buy, Rehab, Rent, Refinance, Repeat. Uses borrowed capital to acquire rental properties, recycle equity via cash-out refinance, and scale a portfolio with limited out-of-pocket capital.",
 },
 {
 type: "teach",
 title: "Tax-Loss Harvesting & Direct Indexing",
 content:
 "Tax-loss harvesting (TLH): sell a security at a loss to realize a capital loss, then immediately buy a similar (but not 'substantially identical') security to maintain market exposure. The realized loss offsets capital gains or up to $3,000 of ordinary income per year. Excess losses carry forward indefinitely.\n\nWash-sale rule: you cannot repurchase the same or substantially identical security within 30 days before or after the sale (60-day window total) or the loss is disallowed. Solution: buy a similar ETF in the interim (e.g., sell Vanguard S&P 500 ETF, buy iShares S&P 500 ETF).\n\nDirect indexing: instead of buying an ETF, you own the individual stocks in an index (typically via separately managed accounts, minimum ~$100K). This enables customized TLH at the individual stock level — harvesting losses within the index even when the overall index is up — generating significantly more tax alpha.",
 },
 {
 type: "teach",
 title: "Asset Location Optimization & NUA",
 content:
 "Asset location asks: which account type is the most tax-efficient home for each asset class?\n\nOptimal framework:\n- Tax-deferred accounts (Traditional IRA/401k): hold bonds, REITs, and high-dividend stocks — assets generating ordinary income taxed at high rates\n- Roth accounts: hold highest expected-return assets (small-cap growth, international equities) — gains grow permanently tax-free\n- Taxable brokerage: hold tax-efficient assets (broad index ETFs with low turnover, buy-and-hold positions eligible for long-term capital gains rates, municipal bonds for high earners)\n\nNet Unrealized Appreciation (NUA): if you hold highly appreciated employer stock in your 401(k), you may be able to take an in-kind lump sum distribution, pay ordinary income tax only on the cost basis, and then pay only long-term capital gains rates on the appreciation — potentially a significant tax saving vs rolling to an IRA.",
 },
 {
 type: "teach",
 title: "I-Bonds, EE Bonds, HELOC & DAF Bunching",
 content:
 "I-Bonds: U.S. Treasury savings bonds with a composite rate = fixed rate + inflation adjustment (CPI-based). Principal is guaranteed; inflation-adjusted returns are exempt from state/local tax. Purchase limit: $10,000/person/year electronically. Must hold at least 1 year; penalty = 3 months' interest if redeemed before 5 years. Excellent for emergency funds or conservative savings when inflation is high.\n\nEE Bonds: guaranteed to double in 20 years (3.5% effective annual return if held to maturity). Federal tax-deferred; can be tax-free if used for education.\n\nHELOC as emergency fund alternative: rather than keeping 6 months of expenses in low-yield savings, some high-income earners establish a Home Equity Line of Credit as a backstop, keeping less cash on hand and investing the difference. Carries risk if home values fall or credit is revoked.\n\nDAF charitable bunching: instead of donating $10,000/year, 'bunch' 5 years of donations ($50,000) into one year to a Donor-Advised Fund, taking a large itemized deduction that year while distributing grants to charities each subsequent year.",
 },
 {
 type: "quiz-mc",
 question:
 "An investor sells an S&P 500 index fund at a loss for tax-loss harvesting purposes. To avoid the wash-sale rule while maintaining market exposure, which is the best immediate replacement purchase?",
 options: [
 "Repurchase the same S&P 500 fund after 30 days",
 "Buy a different S&P 500 ETF from another fund family immediately",
 "Buy a Treasury bond ETF",
 "Hold cash for 31 days",
 ],
 correctIndex: 1,
 explanation:
 "The wash-sale rule disallows the loss if you repurchase the same or 'substantially identical' security within 30 days. Buying a different fund tracking the same index (e.g., iShares vs Vanguard S&P 500) is generally considered acceptable since they are different securities, allowing you to maintain market exposure while capturing the tax loss.",
 difficulty: 2,
 },
 {
 type: "quiz-tf",
 statement:
 "In an optimally located portfolio, Roth accounts should hold the assets expected to have the highest long-term return, because all growth inside a Roth is permanently tax-free.",
 correct: true,
 explanation:
 "Correct. Asset location strategy places highest expected-return assets (e.g., small-cap equities, international stocks) in Roth accounts where they grow tax-free forever. Bond interest — taxed as ordinary income — is better sheltered in tax-deferred accounts. Low-turnover index funds can be held tax-efficiently in taxable brokerage accounts.",
 difficulty: 2,
 },
 {
 type: "quiz-scenario",
 scenario:
 "David holds $300,000 of his employer's stock inside his 401(k), with a cost basis of $50,000 (the stock was purchased at much lower prices). He is retiring and considering his options.",
 question:
 "What is the potential advantage of the Net Unrealized Appreciation (NUA) strategy?",
 options: [
 "Roll the employer stock to a Traditional IRA to defer all taxes indefinitely",
 "Take an in-kind distribution — pay ordinary income tax only on the $50,000 basis, then pay long-term capital gains rates on the $250,000 appreciation",
 "Sell the stock inside the 401(k) and roll cash to a Roth IRA",
 "Leave the stock in the 401(k) to avoid all taxes until RMDs",
 ],
 correctIndex: 1,
 explanation:
 "The NUA strategy allows David to take an in-kind lump-sum distribution of the employer stock. He pays ordinary income tax on only the $50,000 cost basis immediately, and then long-term capital gains rates (0/15/20%) on the $250,000 of NUA when he sells — potentially far less than if he rolled to an IRA and paid ordinary income tax on the full $300,000 upon withdrawal.",
 difficulty: 3,
 },
 ],
 },
 ],
};
