export interface TaxTopic {
 title: string;
 category: "income" | "deductions" | "strategies" | "reporting";
 explanation: string;
 keyRules: string[];
 examples: { scenario: string; taxImpact: string }[];
 commonMistakes: string[];
}

export const TAX_GUIDE: TaxTopic[] = [
 {
 title: "Short-Term vs Long-Term Capital Gains",
 category: "income",
 explanation:
 "The US tax code distinguishes between short-term and long-term capital gains based on the holding period. Assets held for one year or less are taxed at short-term rates (equal to your ordinary income tax rate, up to 37%). Assets held for more than one year qualify for preferential long-term capital gains rates (0%, 15%, or 20% depending on income). This distinction creates a powerful incentive to hold winning positions for at least one year and one day before selling.",
 keyRules: [
 "Holding period starts the day after purchase and includes the day of sale.",
 "Short-term gains taxed at ordinary income rates: 10%, 12%, 22%, 24%, 32%, 35%, or 37%.",
 "Long-term gains taxed at 0% (income up to ~$47K single), 15% (up to ~$518K), or 20% (above ~$518K).",
 "Net Investment Income Tax (NIIT) of 3.8% applies to high earners above $200K single / $250K married.",
 "Short-term and long-term gains/losses are netted separately before being combined.",
 ],
 examples: [
 {
 scenario: "You buy 100 shares at $50 and sell 8 months later at $75, earning $2,500 profit.",
 taxImpact:
 "The $2,500 is a short-term gain taxed at your ordinary income rate. At the 32% bracket, you owe $800 in taxes on the gain.",
 },
 {
 scenario: "Same trade, but you hold for 13 months before selling at $75.",
 taxImpact:
 "The $2,500 is now a long-term gain taxed at 15%. You owe $375, saving $425 compared to selling early.",
 },
 ],
 commonMistakes: [
 "Selling a winning position one day before it qualifies for long-term treatment, losing the tax advantage.",
 "Not tracking the exact purchase date (trade date, not settlement date, determines holding period).",
 "Ignoring the 3.8% NIIT that applies on top of capital gains rates for high earners.",
 ],
 },
 {
 title: "Wash Sale Rule",
 category: "reporting",
 explanation:
 "The wash sale rule prevents taxpayers from claiming a tax loss on a security if they purchase a 'substantially identical' security within 30 days before or after the sale. The 61-day window (30 days before + sale day + 30 days after) applies. The disallowed loss is added to the cost basis of the replacement shares, deferring (not eliminating) the tax benefit. This rule applies across all accounts you own, including IRAs.",
 keyRules: [
 "Applies to purchases of substantially identical securities 30 days before OR after the loss sale.",
 "The total window is 61 days centered on the sale date.",
 "Disallowed losses are added to the cost basis of the replacement shares.",
 "Applies across all your accounts, including spouse's accounts and IRAs.",
 "The rule applies to stocks, bonds, options, and mutual funds.",
 "Buying a call option or selling a put on the same stock within the window can trigger a wash sale.",
 ],
 examples: [
 {
 scenario: "You sell 100 shares of XYZ at a $3,000 loss on December 15. On January 2 (18 days later), you buy 100 shares of XYZ.",
 taxImpact:
 "The $3,000 loss is disallowed. Your cost basis on the new shares increases by $3,000. The loss is deferred until you sell the new shares.",
 },
 {
 scenario: "You sell XYZ at a loss and immediately buy an ETF that tracks the same index as XYZ.",
 taxImpact:
 "If the ETF is not 'substantially identical' (different fund, different index), the wash sale rule does not apply and your loss is deductible. Consult a tax professional for specific situations.",
 },
 ],
 commonMistakes: [
 "Triggering a wash sale by having automatic dividend reinvestment (DRIP) buy shares within the 30-day window.",
 "Forgetting that the rule applies across ALL accounts, including your IRA (where the loss may be permanently lost).",
 "Not realizing that buying options on the same stock can trigger the wash sale rule.",
 ],
 },
 {
 title: "Tax-Loss Harvesting",
 category: "strategies",
 explanation:
 "Tax-loss harvesting is the practice of selling losing investments to realize losses that offset capital gains, reducing your tax bill. Up to $3,000 of net capital losses per year can be deducted against ordinary income. Excess losses carry forward indefinitely. The strategy involves selling a losing position, waiting at least 31 days (to avoid wash sale rules), and optionally repurchasing the same security or immediately purchasing a similar (but not substantially identical) investment to maintain market exposure.",
 keyRules: [
 "Capital losses first offset capital gains of the same type (short-term offsets short-term first).",
 "Remaining net losses offset gains of the other type.",
 "Up to $3,000 of net capital losses can deduct against ordinary income per year ($1,500 if married filing separately).",
 "Unused losses carry forward to future tax years indefinitely.",
 "Must avoid wash sale violations when repurchasing similar securities.",
 ],
 examples: [
 {
 scenario: "You have $10,000 in short-term gains and a stock position with $8,000 in unrealized losses.",
 taxImpact:
 "Selling the loser creates $8,000 in losses that offset $8,000 of your short-term gains. You save $8,000 times your marginal tax rate. At 32%, that is $2,560 in tax savings.",
 },
 {
 scenario: "You have no capital gains but have $15,000 in realized losses this year.",
 taxImpact:
 "You deduct $3,000 against ordinary income this year. The remaining $12,000 carries forward. You can deduct $3,000 per year for the next 4 years.",
 },
 ],
 commonMistakes: [
 "Harvesting losses in December but triggering wash sales with January purchases.",
 "Selling a losing position and buying back something too similar (substantially identical), invalidating the loss.",
 "Not considering the total tax picture: harvesting losses may not be beneficial if you expect to be in a lower tax bracket in the future.",
 ],
 },
 {
 title: "Qualified Dividends",
 category: "income",
 explanation:
 "Qualified dividends receive the same preferential tax rates as long-term capital gains (0%, 15%, or 20%), rather than being taxed as ordinary income. To qualify, dividends must be paid by a US corporation or qualified foreign corporation, and you must meet the holding period requirement: you must have held the stock for more than 60 days during the 121-day period beginning 60 days before the ex-dividend date.",
 keyRules: [
 "Must hold the stock for more than 60 days during the 121-day window around the ex-dividend date.",
 "Must be paid by a US company or a qualified foreign corporation.",
 "REITs, MLPs, and money market funds generally do not pay qualified dividends.",
 "Your broker reports qualified vs. ordinary dividends on Form 1099-DIV.",
 "The NIIT of 3.8% may apply to dividend income for high earners.",
 ],
 examples: [
 {
 scenario: "You receive $5,000 in qualified dividends and are in the 22% tax bracket.",
 taxImpact:
 "The dividends are taxed at the 15% long-term capital gains rate, not your 22% ordinary rate. You save $350 compared to ordinary dividend taxation.",
 },
 {
 scenario: "You buy a stock 30 days before the ex-dividend date and sell 35 days after.",
 taxImpact:
 "You held for 65 days during the 121-day window (more than 60), so the dividend qualifies for preferential rates.",
 },
 ],
 commonMistakes: [
 "Buying a stock just before the ex-dividend date and selling soon after, not meeting the 60-day holding requirement.",
 "Assuming all dividends are qualified. REIT dividends are typically ordinary income taxed at your marginal rate.",
 "Not accounting for the 3.8% NIIT that applies on top of qualified dividend rates for high earners.",
 ],
 },
 {
 title: "Section 1256 Contracts",
 category: "income",
 explanation:
 "Section 1256 contracts include regulated futures, broad-based index options (SPX, NDX, RUT), and certain foreign currency contracts. They receive favorable tax treatment under the 60/40 rule: regardless of actual holding period, 60% of gains are treated as long-term and 40% as short-term. This creates a blended maximum rate of approximately 26.8% (vs. 37% for all short-term). Additionally, Section 1256 contracts are marked-to-market at year-end, meaning unrealized gains and losses are reported as if sold on December 31.",
 keyRules: [
 "60% of gains taxed as long-term capital gains, 40% as short-term, regardless of holding period.",
 "Mark-to-market: unrealized gains/losses reported at year-end.",
 "Losses can be carried back 3 years to offset prior Section 1256 gains.",
 "Applies to: regulated futures, broad-based index options (SPX, NDX), and forex contracts under Section 988 election.",
 "Does NOT apply to: individual stock options, narrow-based index options, or equity options.",
 ],
 examples: [
 {
 scenario: "You day-trade SPX options for the year and net $50,000 in gains.",
 taxImpact:
 "$30,000 (60%) is taxed at the long-term rate of 15-20%. $20,000 (40%) is taxed at your ordinary rate. At the 37% bracket, the blended rate is about 26.8% instead of 37%, saving roughly $5,100.",
 },
 {
 scenario: "You have $20,000 in Section 1256 losses this year but had $30,000 in Section 1256 gains last year.",
 taxImpact:
 "You can carry back the $20,000 loss to amend last year's return and get a refund on taxes paid on those gains.",
 },
 ],
 commonMistakes: [
 "Assuming individual stock options (like AAPL calls) qualify for Section 1256 treatment. They do not.",
 "Not realizing that year-end mark-to-market may create a tax liability on unrealized gains.",
 "Forgetting the 3-year carryback provision, which is unique to Section 1256 and can generate refunds.",
 ],
 },
 {
 title: "Mark-to-Market Election (Section 475)",
 category: "strategies",
 explanation:
 "Active traders who qualify as having 'trader tax status' can make a Section 475(f) mark-to-market election. This converts all trading gains and losses to ordinary income/loss (no capital gain treatment), eliminates the wash sale rule, removes the $3,000 capital loss limitation, and allows net trading losses to fully offset other ordinary income. The election must be filed by the due date of the prior year's tax return (or within 75 days of the start of the new tax year for new entities).",
 keyRules: [
 "Must qualify for trader tax status (frequent trading, seeking to profit from daily market movements, substantial time commitment).",
 "Election must be made prospectively by the due date (typically April 15 for individuals, but special rules apply).",
 "All positions are marked-to-market at year-end and treated as ordinary gains/losses.",
 "The wash sale rule no longer applies to mark-to-market traders.",
 "Net trading losses fully deductible against other income (no $3,000 limit).",
 "Cannot use long-term capital gains rates. All gains are ordinary income.",
 ],
 examples: [
 {
 scenario: "A day trader has $80,000 in gains and $120,000 in losses for the year, with no MTM election.",
 taxImpact:
 "Without the election, the $40,000 net capital loss is limited to a $3,000 deduction against ordinary income. The excess $37,000 carries forward. With the election, the full $40,000 loss offsets ordinary income in the current year.",
 },
 {
 scenario: "A trader makes the MTM election and has $200,000 in net trading gains.",
 taxImpact:
 "All $200,000 is taxed as ordinary income at up to 37%, plus applicable state taxes. There is no 15-20% long-term capital gains rate benefit. The election is a double-edged sword.",
 },
 ],
 commonMistakes: [
 "Missing the filing deadline. The election cannot be made retroactively.",
 "Making the election when you do not genuinely qualify for trader tax status.",
 "Not realizing that the election converts ALL trading gains to ordinary income, giving up the preferential long-term rate on winners.",
 ],
 },
 {
 title: "IRA Trading",
 category: "strategies",
 explanation:
 "Trading within Traditional and Roth IRAs offers significant tax advantages. In a Traditional IRA, gains are tax-deferred until withdrawal. In a Roth IRA, gains are completely tax-free if qualified withdrawal rules are met. However, losses within an IRA cannot be deducted against other income, wash sales involving IRA purchases can permanently disallow losses in taxable accounts, and early withdrawals face penalties.",
 keyRules: [
 "Traditional IRA: gains are tax-deferred. Withdrawals are taxed as ordinary income.",
 "Roth IRA: gains are tax-free if the account is at least 5 years old and you are 59.5 or older.",
 "Losses in an IRA cannot be deducted on your tax return.",
 "Wash sales involving IRA purchases can permanently destroy deductions (the loss is disallowed and the IRA basis adjustment is effectively worthless).",
 "Most IRAs allow stocks, options, ETFs, and bonds. Futures and crypto may require a self-directed IRA.",
 "Margin trading is not allowed in IRAs (no borrowed funds), but cash-secured puts and covered calls are permitted.",
 ],
 examples: [
 {
 scenario: "You buy and sell stocks actively in your Roth IRA, generating $30,000 in short-term gains.",
 taxImpact:
 "No tax is owed on the gains, either now or at withdrawal (assuming qualified). This is why high-turnover, short-term strategies are best placed in Roth IRAs.",
 },
 {
 scenario: "You sell a stock at a $5,000 loss in your taxable account and buy it back in your IRA within 30 days.",
 taxImpact:
 "The $5,000 loss is disallowed under the wash sale rule. Because the repurchase was in an IRA, the basis adjustment cannot help you, and the loss is effectively permanent.",
 },
 ],
 commonMistakes: [
 "Triggering wash sales between taxable and IRA accounts, permanently destroying tax deductions.",
 "Placing tax-efficient investments (qualified dividends, long-term holdings) in IRAs where the tax benefit is redundant.",
 "Making early withdrawals from Traditional IRAs, incurring both income tax and a 10% penalty.",
 ],
 },
 {
 title: "Estimated Tax Payments",
 category: "reporting",
 explanation:
 "If you expect to owe $1,000 or more in taxes that are not covered by withholding (common for active traders with significant capital gains), you must make quarterly estimated tax payments. Failure to pay estimated taxes results in an underpayment penalty calculated as interest on the shortfall. Estimated payments are due April 15, June 15, September 15, and January 15 of the following year.",
 keyRules: [
 "Required if you expect to owe $1,000+ in tax not covered by withholding.",
 "Safe harbor: pay 100% of prior year's tax liability (110% if AGI > $150K) to avoid penalties.",
 "Quarterly due dates: April 15, June 15, September 15, January 15.",
 "Use Form 1040-ES for federal estimated payments.",
 "Many states also require separate estimated tax payments.",
 "The annualized income installment method allows lower payments in quarters with lower income.",
 ],
 examples: [
 {
 scenario: "You realize $50,000 in trading gains in Q1 but have no employer withholding.",
 taxImpact:
 "You should make an estimated payment by April 15 covering at least the taxes on those gains. At the 24% bracket plus state taxes, that could be $15,000+ for a single quarter.",
 },
 {
 scenario: "Your prior year total tax was $30,000. You pay $7,500 per quarter in estimated taxes.",
 taxImpact:
 "You meet the 100% safe harbor (110% if AGI > $150K). Even if you owe more at year-end, you avoid underpayment penalties.",
 },
 ],
 commonMistakes: [
 "Not making estimated payments and getting hit with underpayment penalties in April.",
 "Forgetting that big Q4 trading gains still require a January 15 estimated payment.",
 "Not knowing about the safe harbor rules and overpaying estimated taxes unnecessarily.",
 ],
 },
 {
 title: "Cost Basis Methods (FIFO, LIFO, Specific ID)",
 category: "reporting",
 explanation:
 "When you sell shares of a security purchased at different times and prices, you must choose which shares you are selling for tax purposes. The method you choose can significantly affect your tax bill. FIFO (First In, First Out) is the default and sells the oldest shares first. LIFO (Last In, First Out) sells the newest shares first. Specific Identification lets you choose exactly which lot to sell, giving maximum tax flexibility.",
 keyRules: [
 "FIFO is the default method if you do not specify otherwise.",
 "Specific Identification requires notifying your broker which shares to sell at the time of the trade.",
 "Average cost method is available only for mutual fund shares.",
 "Once you use average cost for a mutual fund, you must continue using it for that fund.",
 "Your broker must report cost basis to the IRS on Form 1099-B for covered securities.",
 "You can use different methods for different securities, but be consistent within each holding.",
 ],
 examples: [
 {
 scenario: "You bought 100 shares at $50 in January and 100 shares at $80 in June. The stock is now $90 and you want to sell 100 shares.",
 taxImpact:
 "FIFO: sells the $50 shares, realizing $40/share gain ($4,000 total). LIFO: sells the $80 shares, realizing $10/share gain ($1,000 total). Specific ID: you choose which lot, giving control over the gain amount.",
 },
 {
 scenario: "You want to harvest a loss from shares bought at $100, but you also own shares bought at $50 in the same stock.",
 taxImpact:
 "Using Specific Identification, you can sell only the $100 shares at a loss while keeping the profitable $50 shares. Under FIFO, the $50 shares would be sold first, realizing a gain instead.",
 },
 ],
 commonMistakes: [
 "Using FIFO by default and realizing unnecessary large gains when Specific ID would minimize taxes.",
 "Not informing your broker to use Specific Identification before executing the sale.",
 "Forgetting that average cost is only for mutual funds, not individual stocks or ETFs.",
 ],
 },
 {
 title: "Foreign Tax Credit",
 category: "deductions",
 explanation:
 "When you earn dividends or capital gains from international investments, foreign governments may withhold taxes. To avoid double taxation (paying foreign tax AND US tax on the same income), you can either claim a foreign tax credit on Form 1116 (dollar-for-dollar reduction in US tax) or deduct the foreign taxes as an itemized deduction on Schedule A. The credit is almost always more valuable than the deduction.",
 keyRules: [
 "The foreign tax credit directly reduces your US tax liability (more valuable than a deduction).",
 "If total foreign taxes paid are $300 or less ($600 married filing jointly), you can claim the credit without filing Form 1116.",
 "The credit is limited to the US tax you would owe on the foreign-source income.",
 "Excess credits can be carried back 1 year or forward 10 years.",
 "Common sources: international stock dividends, international mutual fund distributions.",
 "Treaty rates may reduce the foreign withholding, and excess withholding may not be fully creditable.",
 ],
 examples: [
 {
 scenario: "You receive $10,000 in dividends from international stocks, with $1,500 withheld by foreign governments.",
 taxImpact:
 "You report the full $10,000 as income on your US return but claim a $1,500 foreign tax credit. If your US tax on that income would have been $2,200, your net US tax is reduced to $700.",
 },
 {
 scenario: "You hold an international ETF that reports $200 in foreign taxes paid on your 1099-DIV.",
 taxImpact:
 "Since it is under the $300 simplified threshold, you can claim the credit directly on Form 1040 without the complex Form 1116.",
 },
 ],
 commonMistakes: [
 "Taking the deduction instead of the credit, which is almost always less valuable.",
 "Not realizing that holding international investments in IRAs forfeits the foreign tax credit (you cannot claim credits on tax-deferred income).",
 "Ignoring the carryforward provision when foreign taxes exceed the credit limitation in a given year.",
 ],
 },
 {
 title: "Crypto Taxation",
 category: "reporting",
 explanation:
 "The IRS treats cryptocurrency as property (not currency), meaning every disposal event is a taxable transaction. This includes selling crypto for fiat, trading one crypto for another, spending crypto on goods or services, and receiving crypto as income. The same short-term vs. long-term capital gains rules apply based on holding period. Record keeping is notoriously difficult due to the high transaction volume and multiple wallets/exchanges involved.",
 keyRules: [
 "Crypto is property for tax purposes; every sale, trade, or use is a taxable event.",
 "Trading one crypto for another (e.g., BTC to ETH) is a taxable event requiring gain/loss calculation.",
 "Mining, staking, and airdrops are taxable as ordinary income at the fair market value when received.",
 "Short-term (<= 1 year) and long-term (> 1 year) rates apply.",
 "The wash sale rule technically does not apply to crypto (as of current IRS guidance), but proposed legislation may change this.",
 "Starting in 2025/2026, exchanges are required to report transactions to the IRS via Form 1099-DA.",
 ],
 examples: [
 {
 scenario: "You buy 1 BTC at $30,000 and trade it for ETH when BTC is worth $50,000, held for 8 months.",
 taxImpact:
 "You realize a $20,000 short-term capital gain on the BTC-to-ETH trade, taxed at ordinary income rates. Your ETH cost basis is $50,000.",
 },
 {
 scenario: "You earn 0.5 ETH from staking when ETH is worth $3,000 each.",
 taxImpact:
 "You report $1,500 as ordinary income at the time of receipt. Your cost basis in the 0.5 ETH is $1,500. Any future gain or loss is calculated from this basis.",
 },
 ],
 commonMistakes: [
 "Not reporting crypto-to-crypto trades as taxable events.",
 "Losing track of cost basis across multiple wallets and exchanges.",
 "Assuming that the wash sale rule does not apply; proposed legislation may retroactively change this.",
 ],
 },
 {
 title: "Options Tax Treatment",
 category: "income",
 explanation:
 "Options have unique and sometimes complex tax rules. The tax treatment depends on whether you are the buyer or writer, whether the option is exercised or expires worthless, and the type of option (equity vs. index). For buyers, the premium paid becomes part of the stock's cost basis if exercised, or a capital loss if the option expires worthless. For writers, the premium received is not taxed until the option expires, is closed, or is exercised.",
 keyRules: [
 "Buyer: option premium is added to stock cost basis if exercised, or deducted as capital loss if it expires worthless.",
 "Writer: premium received is short-term capital gain if option expires worthless or is closed.",
 "If a written call is exercised, the premium is added to the sale price of the stock.",
 "If a written put is exercised, the premium reduces the cost basis of the stock acquired.",
 "Broad-based index options (SPX, NDX) qualify for Section 1256 treatment (60/40 rule).",
 "Holding period for the option is separate from the holding period for the underlying stock.",
 ],
 examples: [
 {
 scenario: "You buy a call option for $500 and exercise it to buy 100 shares at $50 (strike price).",
 taxImpact:
 "Your cost basis in the stock is $5,500 ($5,000 strike + $500 premium). The holding period for the stock starts on the exercise date.",
 },
 {
 scenario: "You write (sell) a put option for $300 premium that expires worthless.",
 taxImpact:
 "The $300 premium is a short-term capital gain in the year the option expires, regardless of when the premium was received.",
 },
 ],
 commonMistakes: [
 "Forgetting to include option premiums in cost basis calculations when options are exercised.",
 "Not realizing that the stock holding period starts fresh upon exercise (it does not include the option holding period).",
 "Assuming equity options get Section 1256 treatment. Only broad-based index options qualify.",
 ],
 },
 {
 title: "Day Trader Tax Status",
 category: "strategies",
 explanation:
 "The IRS does not have a clear-cut definition of 'trader' vs. 'investor,' but traders who trade frequently, substantially, and continuously as a business may qualify for trader tax status (TTS). TTS allows deducting trading-related business expenses on Schedule C, the option to make the Section 475 mark-to-market election, and the deduction of home office expenses. The criteria are based on facts and circumstances, not a specific trade count.",
 keyRules: [
 "No bright-line rule: the IRS uses facts and circumstances to determine TTS.",
 "Key factors: frequency of trades, holding periods, time spent, percentage of income from trading, strategy (short-term profit from daily fluctuations).",
 "TTS allows Schedule C deductions for: data feeds, software, education, home office, equipment.",
 "Must trade 'substantially, regularly, and continuously' throughout the year.",
 "Holding period of trades should be relatively short (days to weeks, not months).",
 "Capital gain income by itself does not constitute self-employment income for Social Security and Medicare tax purposes.",
 ],
 examples: [
 {
 scenario: "You make 1,200 trades per year, spend 30+ hours per week researching and trading, and your primary income is from trading.",
 taxImpact:
 "You likely qualify for TTS. You can deduct trading software ($3,000/year), data feeds ($2,400/year), home office ($5,000/year), and other business expenses on Schedule C, saving thousands in taxes.",
 },
 {
 scenario: "You make 50 trades per year while working a full-time job, holding positions for 3-12 months.",
 taxImpact:
 "You likely do not qualify for TTS. You are classified as an investor. Trading expenses are not deductible under the 2017 Tax Cuts and Jobs Act (TCJA) for investors.",
 },
 ],
 commonMistakes: [
 "Claiming TTS without meeting the frequency, holding period, and time commitment requirements.",
 "Not keeping detailed records of trading activity, hours spent, and business expenses.",
 "Assuming that profitable trading automatically qualifies you as a trader for tax purposes.",
 ],
 },
 {
 title: "Charitable Giving of Appreciated Stock",
 category: "strategies",
 explanation:
 "Donating appreciated stocks held for more than one year to a qualified charity is one of the most tax-efficient giving strategies available. You receive a charitable deduction for the full fair market value of the stock and avoid paying capital gains tax on the appreciation. This effectively lets you donate more to charity while reducing your tax bill compared to selling the stock and donating cash.",
 keyRules: [
 "Stock must be held for more than one year (long-term) to deduct the full fair market value.",
 "If held one year or less, the deduction is limited to your cost basis.",
 "You avoid ALL capital gains tax on the appreciation.",
 "Deduction limited to 30% of adjusted gross income (AGI) for appreciated property, with a 5-year carryforward for excess.",
 "The charity must be a qualified 501(c)(3) organization.",
 "Donor-Advised Funds (DAFs) are an excellent vehicle for donating appreciated stock.",
 ],
 examples: [
 {
 scenario: "You own stock with a $10,000 cost basis, now worth $50,000. You want to donate $50,000 to charity.",
 taxImpact:
 "Donating the stock: you get a $50,000 deduction and pay zero capital gains tax on the $40,000 gain. Selling first and donating cash: you pay up to $9,520 in taxes (20% + 3.8% NIIT on $40,000) and only donate $40,480.",
 },
 {
 scenario: "You want to rebalance your portfolio and have highly appreciated stocks.",
 taxImpact:
 "Donate the appreciated shares and use the cash you would have donated to buy new shares at the current market price, resetting your cost basis. You reduce taxes, support your charity, and rebalance simultaneously.",
 },
 ],
 commonMistakes: [
 "Donating stocks held less than one year, which limits the deduction to cost basis rather than market value.",
 "Donating losing stocks instead of selling them (sell losers to harvest the tax loss, donate the cash instead).",
 "Not using a Donor-Advised Fund to simplify the process and bundle multiple years of giving.",
 ],
 },
 {
 title: "Estate Planning for Investment Accounts",
 category: "strategies",
 explanation:
 "Investment accounts receive special treatment at death. The most important concept is the 'step-up in basis,' where inherited assets receive a new cost basis equal to the fair market value on the date of death. This effectively eliminates all unrealized capital gains accumulated during the original owner's lifetime. Understanding this has major implications for whether to sell appreciated assets during your lifetime or hold them as part of your estate plan.",
 keyRules: [
 "At death, the cost basis of inherited assets 'steps up' to the fair market value on the date of death.",
 "All unrealized capital gains during the decedent's lifetime are permanently eliminated.",
 "This applies to stocks, bonds, real estate, and most other capital assets.",
 "Does NOT apply to tax-deferred accounts (Traditional IRAs, 401ks) where distributions are ordinary income.",
 "Roth IRA accounts can be inherited with tax-free growth maintained (subject to required distributions).",
 "The federal estate tax exemption is approximately $13.6 million per person (2024). Most estates owe no federal estate tax.",
 ],
 examples: [
 {
 scenario: "Your parent bought stock for $10,000 decades ago, now worth $500,000. They pass away and you inherit the shares.",
 taxImpact:
 "Your cost basis is $500,000 (the stepped-up value). If you sell immediately, you owe zero capital gains tax. The $490,000 of appreciation during your parent's lifetime is never taxed.",
 },
 {
 scenario: "You have $2 million in highly appreciated stock and a $1 million Traditional IRA.",
 taxImpact:
 "Estate planning consideration: spend down the IRA during retirement (taxed as ordinary income regardless) and hold the appreciated stock to pass to heirs with a stepped-up basis, permanently eliminating the capital gains tax.",
 },
 ],
 commonMistakes: [
 "Selling highly appreciated stocks late in life instead of holding them for the step-up in basis benefit.",
 "Not understanding that IRAs do NOT receive a step-up in basis and are fully taxable to heirs.",
 "Failing to consider state estate taxes, which may apply at lower thresholds than the federal exemption.",
 ],
 },
];
