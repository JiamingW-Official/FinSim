import { Unit } from "./types";

export const UNIT_BOND_MATH: Unit = {
 id: "bond-math",
 title: "Bond Math Fundamentals",
 description:
 "Master yield-to-maturity, duration, convexity, and how bond prices move with rates",
 icon: "Hash",
 color: "#F59E0B",
 lessons: [
 // Lesson 1: Price & Yield 
 {
 id: "bond-math-price-yield",
 title: "Price & Yield",
 description:
 "Understand how bond prices are calculated as the present value of cashflows and why price and yield move in opposite directions",
 icon: "TrendingDown",
 xpReward: 60,
 difficulty: "intermediate",
 duration: 8,
 steps: [
 {
 type: "teach",
 title: "The Bond Price Formula",
 content:
 "A bond's price equals the present value of all its future cashflows. For a bond paying coupon C every period, with face value F, yield per period y, and n periods remaining:\n\n• Price = Σ [C / (1+y)^t] + F / (1+y)^n\n\nA 10-year bond paying $50/year (5% coupon) with face value $1,000 and yield 5% prices at exactly $1,000 — par. If yields rise to 6%, each future $50 coupon is discounted more heavily, so the price falls below $1,000.",
 highlight: ["present value", "coupon", "face value", "yield"],
 },
 {
 type: "teach",
 title: "Par, Discount, and Premium Bonds",
 content:
 "Three pricing relationships follow directly from the PV formula:\n\n• Par bond: coupon rate = yield Price = $1,000\n• Discount bond: coupon rate < yield Price < $1,000\n• Premium bond: coupon rate > yield Price > $1,000\n\nExample: a 4% coupon bond when yields are 5% trades at a discount (~$922). Investors accept below-par price so their total return (coupons + capital gain at maturity) equals the market yield of 5%.",
 highlight: ["par", "discount", "premium", "coupon rate"],
 },
 {
 type: "quiz-tf",
 statement:
 "If market yields rise after a bond is issued, the bond's price will increase above par.",
 correct: false,
 explanation:
 "False. Price and yield move inversely. When yields rise, future cashflows are discounted at a higher rate, reducing the present value (price). The bond trades at a discount to par.",
 difficulty: 1,
 },
 {
 type: "teach",
 title: "Clean Price vs Dirty Price",
 content:
 "Bond prices are quoted in two ways:\n\n• Clean price (flat price): the quoted market price, excluding accrued interest\n• Dirty price (full price): the actual amount paid = Clean price + Accrued interest\n\nAccrued interest compensates the seller for the coupon days elapsed since the last payment. If you buy mid-period, you owe the seller their share of the upcoming coupon. Exchanges quote clean prices to make comparisons easier across different settlement dates.",
 highlight: ["clean price", "dirty price", "accrued interest"],
 },
 {
 type: "quiz-mc",
 question:
 "A bond's last coupon was paid 90 days ago; the next coupon of $30 is due in 90 days. Using the 30/360 day count, how much accrued interest does a buyer owe the seller?",
 options: [
 "$15 — half the coupon, since 90/180 days have elapsed",
 "$30 — the full coupon belongs to the seller",
 "$0 — accrued interest is only charged on zero-coupon bonds",
 "$10 — one-third of the coupon based on a 270-day period",
 ],
 correctIndex: 0,
 explanation:
 "Under 30/360, each month = 30 days and each semi-annual period = 180 days. With 90 days elapsed out of 180, the accrued fraction is 90/180 = 0.5, so accrued interest = 0.5 × $30 = $15.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Day Count Conventions",
 content:
 "How you count days matters for accrued interest:\n\n• 30/360 (corporate/municipal bonds): every month has 30 days, every year 360 days. Simple arithmetic, ignores real calendar.\n• Actual/Actual (US Treasuries, most government bonds): uses the true number of calendar days. More accurate but requires knowing exact dates.\n• Actual/360 (money markets, many floating-rate notes): actual days divided by 360-day year.\n\nThe convention affects the accrued interest calculation and therefore the dirty price you actually pay.",
 highlight: ["30/360", "actual/actual", "day count"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "You are comparing two bonds: Bond A uses 30/360 convention and Bond B uses Actual/Actual. You buy both on February 15 (30 days after their last January 16 coupon dates). Both pay $25 semi-annual coupons.",
 question:
 "For the Actual/Actual bond, which date count correctly measures the accrued days?",
 options: [
 "Actual calendar days from January 16 to February 15 = 30 days",
 "Always 30 days regardless of convention since one month elapsed",
 "180 days since the full semi-annual period is assumed",
 "29 days because the day of purchase is excluded",
 ],
 correctIndex: 0,
 explanation:
 "Actual/Actual uses real calendar days. From January 16 to February 15 is 30 actual days. Under 30/360, the answer would also be 30 days here, but they differ when months have 28, 29, or 31 days.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 2: Yield Measures 
 {
 id: "bond-math-yield-measures",
 title: "Yield Measures",
 description:
 "Compare current yield, YTM, yield-to-call, yield-to-worst, spread measures, and floating rate notes",
 icon: "BarChart2",
 xpReward: 65,
 difficulty: "intermediate",
 duration: 9,
 steps: [
 {
 type: "teach",
 title: "Current Yield vs Yield-to-Maturity",
 content:
 "Two common yield measures paint very different pictures:\n\n• Current Yield = Annual coupon / Current price. Quick and dirty — a $50 coupon on a $950 bond gives CY = 5.26%. Ignores the gain/loss at maturity.\n\n• Yield-to-Maturity (YTM) = the single discount rate that makes PV of all cashflows equal the current price. It captures coupons AND the capital gain/loss at maturity, assuming you hold to maturity and reinvest coupons at the same YTM.\n\nFor discount bonds: YTM > Current Yield > Coupon Rate\nFor premium bonds: Coupon Rate > Current Yield > YTM",
 highlight: ["current yield", "yield-to-maturity", "YTM", "discount rate"],
 },
 {
 type: "quiz-tf",
 statement:
 "A bond's yield-to-maturity will always be higher than its current yield if the bond is trading at a discount to par.",
 correct: true,
 explanation:
 "True. For a discount bond, the investor also earns a capital gain (buying below $1,000, receiving $1,000 at maturity). YTM captures both the coupon income and this price appreciation, making it higher than current yield, which only reflects coupon/price.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Yield-to-Call and Yield-to-Worst",
 content:
 "Callable bonds give the issuer the right to redeem early. Two additional measures:\n\n• Yield-to-Call (YTC): YTM calculation but using the call date as maturity and call price as final payment. Usually the first call date is used.\n\n• Yield-to-Worst (YTW): the lowest yield across all possible call/put dates and maturity. It answers 'what is the worst-case yield I can expect?' — the standard benchmark for callable bond analysis.\n\nExample: if a bond's YTM = 6% but YTC = 4.5%, the issuer is likely to call it in a low-rate environment. YTW = 4.5%.",
 highlight: ["callable", "yield-to-call", "yield-to-worst", "call date"],
 },
 {
 type: "quiz-mc",
 question:
 "A callable bond has a YTM of 5.8% and a yield-to-first-call of 4.2%. What is the yield-to-worst, and which does an investor use to assess worst-case return?",
 options: [
 "YTW = 4.2%; the investor uses YTW as the conservative minimum return estimate",
 "YTW = 5.8%; YTM is always the worst case for callable bonds",
 "YTW = 5.0%; it is the average of YTM and YTC",
 "YTW = 4.2%; but investors prefer YTM for callable bonds because it is more accurate",
 ],
 correctIndex: 0,
 explanation:
 "Yield-to-worst is the minimum of all possible yields (YTM, YTC for each call date, YTP if putable). Here YTC of 4.2% < YTM of 5.8%, so YTW = 4.2%. Conservative investors always reference YTW for callable bonds.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Spread Measures: G-Spread, Z-Spread, OAS",
 content:
 "Spread measures capture the extra yield a corporate bond pays over risk-free rates:\n\n• G-Spread (Government spread): YTM of corporate bond minus YTM of a comparable-maturity government bond. Simple but ignores the shape of the curve.\n\n• Z-Spread (Zero-volatility spread): constant spread added to each point on the spot rate curve such that discounted cashflows equal the bond price. More precise than G-spread.\n\n• OAS (Option-Adjusted Spread): Z-spread minus the spread attributable to embedded options (calls, puts). Isolates credit/liquidity risk for callable bonds. OAS < Z-spread for callable bonds (option has value to issuer).",
 highlight: ["G-spread", "Z-spread", "OAS", "option-adjusted spread"],
 },
 {
 type: "teach",
 title: "Floating Rate Notes and Yield Curve Shapes",
 content:
 "Floating Rate Notes (FRNs) pay variable coupons reset periodically (e.g., SOFR + 150 bps). Discount Margin (DM) is the spread over the reference rate consistent with the FRN's current price — analogous to YTM for fixed bonds.\n\nYield curve shapes and their implications:\n• Normal (upward sloping): long rates > short rates markets expect growth/inflation, economy is healthy\n• Inverted: short rates > long rates recession signal, Fed has tightened aggressively\n• Flat: all maturities similar transitional phase, uncertain outlook\n• Humped: medium-term rates highest temporary tightening expectations at the belly",
 highlight: ["floating rate note", "discount margin", "yield curve", "inverted"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "The 2-year US Treasury yields 5.2% and the 10-year yields 4.6%. The 2s10s spread is -60 basis points.",
 question: "What does this yield curve shape most reliably signal historically?",
 options: [
 "An inverted yield curve, historically associated with elevated recession risk within 12–18 months",
 "A normal upward-sloping curve indicating strong economic expansion ahead",
 "A flat curve suggesting the Fed has perfectly balanced growth and inflation",
 "A humped curve indicating short-term rate cuts are imminent",
 ],
 correctIndex: 0,
 explanation:
 "When short-term rates exceed long-term rates (2s10s negative), the curve is inverted. This is one of the most reliable historical recession predictors, typically leading downturns by 6–18 months as it signals the Fed has tightened enough to slow future growth.",
 difficulty: 2,
 },
 ],
 },

 // Lesson 3: Duration 
 {
 id: "bond-math-duration",
 title: "Duration",
 description:
 "Calculate Macaulay duration and modified duration, understand DV01, and apply duration to portfolio immunization",
 icon: "Clock",
 xpReward: 70,
 difficulty: "advanced",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "Macaulay Duration: Weighted Average Time",
 content:
 "Macaulay Duration is the weighted average time to receive a bond's cashflows, where the weight of each cashflow is its PV share of total price:\n\nMacD = Σ [t × PV(CFt) / Price]\n\nFor a 3-year, 10% annual coupon bond priced at par with YTM = 10%:\n• PV(CF1) = 100/1.10 = $90.91 weight = 8.26%\n• PV(CF2) = 100/1.21 = $82.64 weight = 7.51%\n• PV(CF3) = 1100/1.331 = $826.45 weight = 75.13% (coupon + principal)\n• MaCD 1×0.0826 + 2×0.0751 + 3×0.7513 2.74 years\n\nA zero-coupon bond's Macaulay duration always equals its maturity — one single cashflow at the end.",
 highlight: ["Macaulay duration", "weighted average", "zero-coupon", "present value"],
 },
 {
 type: "quiz-tf",
 statement:
 "A 5-year zero-coupon bond always has a Macaulay duration greater than a 5-year coupon bond with the same maturity.",
 correct: true,
 explanation:
 "True. The zero-coupon bond pays everything at year 5, so its Macaulay duration equals exactly 5 years. The coupon bond pays interim cashflows (years 1–4), pulling the weighted average time earlier than year 5. Thus MaCD(zero) > MaCD(coupon) for equal maturities.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Modified Duration and Price Sensitivity",
 content:
 "Modified Duration converts Macaulay Duration into a price sensitivity measure:\n\nModD = MaCD / (1 + y/m)\n\nwhere y = YTM, m = coupon periods per year.\n\nThe practical interpretation: a 1% (100 bps) change in yield causes approximately ModD% change in price:\n\n%ΔPrice ModD × Δy\n\nExample: ModD = 7.5, yield rises 50 bps (Δy = +0.005):\n%ΔPrice 7.5 × 0.005 = 3.75%\n\nThe negative sign reflects the inverse price/yield relationship. Higher duration = greater interest rate sensitivity.",
 highlight: ["modified duration", "price sensitivity", "basis points", "delta yield"],
 },
 {
 type: "teach",
 title: "DV01 / PVBP: Dollar Value of a Basis Point",
 content:
 "DV01 (Dollar Value of 01) or PVBP (Price Value of a Basis Point) measures the dollar change in bond price for a 1 basis point (0.01%) move in yield:\n\nDV01 = ModD × Price × 0.0001\n\nFor a $1,000,000 position in a bond with ModD = 8 and clean price = 105% of par:\n• Position value = $1,050,000\n• DV01 = 8 × $1,050,000 × 0.0001 = $840\n\nMeaning: yields rising 1 bp costs this portfolio $840. Traders use DV01 to hedge: to offset a DV01 of $840, they short Treasuries with equivalent DV01.",
 highlight: ["DV01", "PVBP", "basis point", "hedge"],
 },
 {
 type: "quiz-mc",
 question:
 "A portfolio manager holds $5,000,000 face value of bonds. The bonds have a modified duration of 6.0 and are priced at 98 (98% of par). What is the approximate DV01 of this position?",
 options: [
 "$2,940 — DV01 = 6.0 × ($5,000,000 × 0.98) × 0.0001",
 "$3,000 — DV01 = 6.0 × $5,000,000 × 0.0001",
 "$294 — DV01 = 6.0 × ($5,000,000 × 0.98) × 0.00001",
 "$29,400 — DV01 uses full face value before applying modified duration",
 ],
 correctIndex: 0,
 explanation:
 "DV01 uses the actual market value, not face value. Market value = $5,000,000 × 0.98 = $4,900,000. DV01 = 6.0 × $4,900,000 × 0.0001 = $2,940. This is the dollar loss per 1 bp rise in yield.",
 difficulty: 3,
 },
 {
 type: "teach",
 title: "Portfolio Duration and Immunization",
 content:
 "Portfolio duration is the market-value-weighted average of individual bond durations:\n\nDport = Σ (wi × Di)\n\nwhere wi = market value weight.\n\nImmunization strategy protects a portfolio from interest rate risk by matching the portfolio's duration to the investment horizon. If duration = horizon, price risk and reinvestment risk offset each other:\n\n• Rates rise portfolio price falls but coupons reinvest at higher rates\n• Rates fall portfolio price rises but coupons reinvest at lower rates\n\nClassic application: a pension fund with liabilities due in 10 years holds a bond portfolio with duration = 10 years, 'immunizing' against parallel yield curve shifts.",
 highlight: ["portfolio duration", "immunization", "reinvestment risk", "horizon"],
 },
 ],
 },

 // Lesson 4: Convexity 
 {
 id: "bond-math-convexity",
 title: "Convexity",
 description:
 "Discover why convexity gives bonds a price advantage, how callable bonds show negative convexity, and how to apply the full price change formula",
 icon: "TrendingUp",
 xpReward: 75,
 difficulty: "advanced",
 duration: 10,
 steps: [
 {
 type: "teach",
 title: "Why Convexity Is Always Positive for Plain Bonds",
 content:
 "Duration gives a linear approximation of price change. But the true price/yield relationship is curved (convex). Convexity measures the curvature:\n\n• When yields fall: actual price rises MORE than duration predicts\n• When yields rise: actual price falls LESS than duration predicts\n\nThis asymmetry is always favorable for long bond holders — convexity is positive. The higher the convexity, the greater the price 'cushion' on the downside and 'bonus' on the upside. Investors prize convexity and are willing to accept lower yield for it.",
 highlight: ["convexity", "curvature", "positive convexity", "asymmetry"],
 },
 {
 type: "quiz-tf",
 statement:
 "For a standard non-callable bond, convexity causes the actual price increase when yields fall to be larger than what modified duration alone would predict.",
 correct: true,
 explanation:
 "True. Positive convexity means the price-yield curve is bowed toward the investor. Duration is the tangent line; convexity captures the beneficial deviation from that line. Price rises faster than the linear (duration-only) approximation as yields fall.",
 difficulty: 2,
 },
 {
 type: "teach",
 title: "Negative Convexity: Callable Bonds and MBS",
 content:
 "Callable bonds and mortgage-backed securities (MBS) exhibit negative convexity in certain yield environments:\n\n• Callable bonds: when rates fall sharply, the issuer calls the bond. The investor's upside is capped at the call price — price 'compresses' rather than rising freely. The price/yield curve bends the wrong way above the call price.\n\n• MBS/prepayment: when rates fall, homeowners refinance, prepaying their mortgages. Cash returns to investors who must reinvest at lower rates. Duration shortens precisely when you want it to be long.\n\nNegative convexity = you lose on both ends: prices don't rise as much when rates fall, and you still suffer when rates rise.",
 highlight: ["negative convexity", "callable", "MBS", "prepayment", "option-adjusted"],
 },
 {
 type: "quiz-mc",
 question:
 "Two bonds have the same duration of 8 years. Bond A is a plain-vanilla Treasury; Bond B is a callable corporate bond near its call price. Interest rates fall by 150 basis points. Which bond benefits more from the rate move?",
 options: [
 "Bond A (Treasury) benefits more because it has positive convexity and no call cap on price appreciation",
 "Bond B benefits more because corporate bonds always outperform Treasuries when rates fall",
 "Both bonds benefit equally since they share the same duration",
 "Bond B benefits more because the call feature provides extra income to offset price capping",
 ],
 correctIndex: 0,
 explanation:
 "Bond A's price will rise more. With positive convexity, the Treasury's actual price gain exceeds the duration-implied estimate. Bond B's callable structure caps price appreciation near the call price (negative convexity), so the issuer's option limits the investor's upside.",
 difficulty: 3,
 },
 {
 type: "teach",
 title: "Full Price Change Formula: Duration + Convexity",
 content:
 "The complete approximation for bond price change combines both duration and convexity terms:\n\n%ΔPrice ModD × Δy + ½ × Convexity × (Δy)²\n\nExample: ModD = 8, Convexity = 80, yields drop 100 bps (Δy = 0.01):\n• Duration term: 8 × (0.01) = +8.00%\n• Convexity term: ½ × 80 × (0.01)² = +0.40%\n• Total +8.40%\n\nThe convexity bonus is small for small yield moves but grows quadratically for large moves. This is why convexity matters most in volatile rate environments.",
 highlight: ["full price change", "convexity term", "duration term", "quadratic"],
 },
 {
 type: "teach",
 title: "Barbell vs Bullet Convexity Trade",
 content:
 "Portfolio managers exploit convexity differences through structure:\n\n• Bullet portfolio: concentrated in one maturity (e.g., all 10-year bonds). Moderate convexity for the duration level.\n\n• Barbell portfolio: split between short maturities (2-year) and long maturities (30-year), blended to match the bullet's duration. Higher convexity than bullet for the same duration.\n\nThe barbell outperforms the bullet in volatile rate environments (yield curve twists or large parallel shifts) because of higher convexity. The bullet outperforms in a stable, carry-dominated environment where you simply earn yield without rate moves. This is the classic barbell vs bullet trade-off.",
 highlight: ["barbell", "bullet", "convexity trade", "yield curve twist"],
 },
 {
 type: "quiz-scenario",
 scenario:
 "A fixed income manager runs two portfolios, both with duration = 7.5 years. Portfolio A (Bullet) holds all 7-year bonds with convexity = 60. Portfolio B (Barbell) holds 50% in 2-year bonds and 50% in 30-year bonds, achieving convexity = 120.",
 question:
 "In a high-volatility rate environment with frequent large yield swings of ±200 bps, which portfolio is expected to outperform, and why?",
 options: [
 "Portfolio B (Barbell) outperforms because higher convexity generates greater price gains during yield drops and smaller losses during yield rises compared to the bullet",
 "Portfolio A (Bullet) outperforms because concentrating duration in one maturity reduces tracking error and transaction costs",
 "Both perform identically since they share the same duration of 7.5 years",
 "Portfolio A outperforms because bullet portfolios are less sensitive to yield curve reshaping than barbells",
 ],
 correctIndex: 0,
 explanation:
 "Higher convexity (120 vs 60) is especially valuable when yields move significantly in either direction. The barbell earns more price gain on rallies and suffers smaller losses on selloffs, net-net outperforming the bullet in volatile regimes. In a stable low-volatility environment, the bullet might win on carry if the yield curve is normally shaped.",
 difficulty: 3,
 },
 ],
 },
 ],
};
