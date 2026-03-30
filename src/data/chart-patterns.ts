export interface ChartPattern {
 name: string;
 type: "continuation" | "reversal";
 direction: "bullish" | "bearish" | "both";
 description: string;
 psychology: string;
 howToIdentify: string[];
 tradeSetup: { entry: string; stopLoss: string; target: string };
 reliability: number;
 timeframe: string;
}

export const CHART_PATTERNS: ChartPattern[] = [
 {
 name: "Head and Shoulders",
 type: "reversal",
 direction: "bearish",
 description:
 "A topping pattern consisting of three peaks where the middle peak (head) is the highest and the two outer peaks (shoulders) are roughly equal. A neckline connects the lows between the peaks.",
 psychology:
 "The left shoulder represents a normal rally and pullback. The head shows buyers making one final push to new highs but failing to hold. The right shoulder demonstrates buyers can no longer reach the head's high, signaling exhaustion. The neckline break confirms sellers have taken over.",
 howToIdentify: [
 "Identify an uptrend with a clear left shoulder peak followed by a pullback.",
 "The head must make a higher high than the left shoulder.",
 "The right shoulder should peak at roughly the same level as the left shoulder.",
 "Draw a neckline connecting the two troughs between the peaks.",
 "Volume typically decreases from left shoulder to head to right shoulder.",
 "The pattern is confirmed when price breaks below the neckline with volume.",
 ],
 tradeSetup: {
 entry:
 "Enter short on a close below the neckline, or on a retest of the neckline from below after the initial break.",
 stopLoss:
 "Place stop above the right shoulder. A tighter stop just above the neckline increases risk of stop-out on retest.",
 target:
 "Measure the vertical distance from the head to the neckline and project downward from the neckline break point.",
 },
 reliability: 5,
 timeframe: "Daily and weekly charts provide the most reliable signals. Also effective on 4-hour charts.",
 },
 {
 name: "Inverse Head and Shoulders",
 type: "reversal",
 direction: "bullish",
 description:
 "A bottoming pattern with three troughs where the middle trough (head) is the lowest and the two outer troughs (shoulders) are roughly equal. The neckline connects the highs between the troughs.",
 psychology:
 "The left shoulder shows a normal decline and bounce. The head represents sellers making a final capitulation push. The right shoulder reveals that sellers cannot push price back to the head's low, signaling their exhaustion. The neckline break confirms buyers have seized control.",
 howToIdentify: [
 "Identify a downtrend with a clear left shoulder trough followed by a bounce.",
 "The head must make a lower low than the left shoulder.",
 "The right shoulder should trough at roughly the same level as the left shoulder.",
 "Draw a neckline connecting the two peaks between the troughs.",
 "Volume often increases on the right shoulder and neckline break.",
 "Confirmation occurs when price breaks above the neckline with strong volume.",
 ],
 tradeSetup: {
 entry:
 "Enter long on a close above the neckline, or on a pullback to the neckline after the initial breakout.",
 stopLoss:
 "Place stop below the right shoulder. A tighter stop just below the neckline is an option for aggressive traders.",
 target:
 "Measure the distance from the head to the neckline and project upward from the breakout point.",
 },
 reliability: 5,
 timeframe: "Most reliable on daily and weekly charts. Works on 4-hour for swing trades.",
 },
 {
 name: "Double Top",
 type: "reversal",
 direction: "bearish",
 description:
 "Two consecutive peaks at approximately the same price level with a moderate trough between them. The pattern resembles the letter M.",
 psychology:
 "The first peak represents a normal test of resistance. The pullback shows profit-taking. The second peak shows buyers trying again but failing to break through, demonstrating that sellers are firmly defending that price level.",
 howToIdentify: [
 "Identify two peaks at approximately the same level after an uptrend.",
 "The trough between peaks should represent a meaningful pullback (at least 10%).",
 "The two peaks should be separated by at least several weeks.",
 "Volume is typically lighter on the second peak than the first.",
 "The pattern completes when price breaks below the trough between the peaks.",
 ],
 tradeSetup: {
 entry: "Enter short on a break below the support level (the trough between the two peaks).",
 stopLoss: "Place stop above the higher of the two peaks.",
 target: "Measure the height of the pattern (peak to trough) and project downward from the breakdown point.",
 },
 reliability: 4,
 timeframe: "Daily and weekly charts. The longer the time between peaks, the more significant the pattern.",
 },
 {
 name: "Double Bottom",
 type: "reversal",
 direction: "bullish",
 description:
 "Two consecutive troughs at approximately the same price level with a moderate peak between them. The pattern resembles the letter W.",
 psychology:
 "The first trough finds buyers at a support level. The bounce shows demand. The second trough tests the same support and holds, proving that buyers are consistently willing to step in at that price.",
 howToIdentify: [
 "Identify two troughs at approximately the same level after a downtrend.",
 "The peak between troughs should be a meaningful bounce.",
 "The second trough may test slightly lower (a 'spring') before reversing.",
 "Volume typically increases on the second trough and the breakout.",
 "Confirmation occurs when price breaks above the peak between the two troughs.",
 ],
 tradeSetup: {
 entry: "Enter long on a break above the resistance level (the peak between the two troughs).",
 stopLoss: "Place stop below the lower of the two troughs.",
 target: "Measure the height of the pattern and project upward from the breakout point.",
 },
 reliability: 4,
 timeframe: "Daily and weekly charts. More significant when troughs are separated by several weeks or more.",
 },
 {
 name: "Triple Top",
 type: "reversal",
 direction: "bearish",
 description:
 "Three consecutive peaks at approximately the same price level, showing that resistance is extremely strong. Rarer and more reliable than a double top.",
 psychology:
 "Each failed attempt to break resistance demoralizes buyers further. By the third failure, most bulls have given up and the supply at resistance has proven overwhelming. The resulting breakdown can be sharp.",
 howToIdentify: [
 "Identify three peaks at roughly the same level, each separated by pullbacks.",
 "The support level connecting the troughs between peaks forms a neckline.",
 "Volume tends to decline on each successive peak.",
 "The pattern is confirmed when price breaks below the neckline support.",
 "Look for increasing volume on the breakdown.",
 ],
 tradeSetup: {
 entry: "Enter short on a break below the neckline support connecting the troughs.",
 stopLoss: "Place stop above the highest of the three peaks.",
 target: "Measure from the peaks to the neckline and project downward from the break point.",
 },
 reliability: 5,
 timeframe: "Weekly charts are ideal. Daily charts work for intermediate-term patterns.",
 },
 {
 name: "Triple Bottom",
 type: "reversal",
 direction: "bullish",
 description:
 "Three consecutive troughs at approximately the same price level, demonstrating that support is extremely strong. Rarer and more reliable than a double bottom.",
 psychology:
 "Three tests of support prove that buyers are consistently defending this price level with conviction. Sellers exhaust themselves over the repeated attempts, and the subsequent breakout often has significant momentum.",
 howToIdentify: [
 "Identify three troughs at roughly the same level, each followed by bounces.",
 "The peaks between troughs form a resistance neckline.",
 "Volume may increase on the third trough and the breakout.",
 "Confirmation occurs on a break above the neckline resistance.",
 "The pattern takes longer to form, making it more reliable.",
 ],
 tradeSetup: {
 entry: "Enter long on a break above the neckline resistance connecting the peaks.",
 stopLoss: "Place stop below the lowest of the three troughs.",
 target: "Measure from the troughs to the neckline and project upward from the breakout.",
 },
 reliability: 5,
 timeframe: "Weekly charts. Takes months to form, providing strong long-term signals.",
 },
 {
 name: "Cup and Handle",
 type: "continuation",
 direction: "bullish",
 description:
 "A rounded 'U' shaped base (the cup) followed by a small downward drift or consolidation (the handle). The pattern resembles a tea cup viewed from the side.",
 psychology:
 "The cup forms as early sellers are gradually replaced by value buyers, creating a smooth rounded bottom. The handle represents a final shakeout of weak hands before the breakout. Institutions often accumulate during the cup.",
 howToIdentify: [
 "The cup should have a rounded, 'U' shape (not a sharp 'V').",
 "The cup depth should ideally be 12-35% of the prior advance.",
 "The handle should drift downward and retrace no more than half the cup.",
 "The handle should form in the upper third of the cup.",
 "Volume should be light during the handle and expand on the breakout.",
 "The pattern typically takes 7 weeks to 65 weeks to form.",
 ],
 tradeSetup: {
 entry: "Enter long on a break above the handle's resistance with strong volume. Buy point is the handle high plus a small buffer.",
 stopLoss: "Place stop below the low of the handle, or 5-8% below the entry point.",
 target: "Measure the depth of the cup and add it to the breakout point. Many successful patterns lead to gains of 20-30% or more.",
 },
 reliability: 5,
 timeframe: "Weekly charts for the best signals. The cup should be at least 7 weeks long.",
 },
 {
 name: "Ascending Triangle",
 type: "continuation",
 direction: "bullish",
 description:
 "A pattern with a flat upper resistance line and rising lower trendline of higher lows. Price compresses into the apex as buyers become increasingly aggressive.",
 psychology:
 "Sellers defend a fixed price level, but buyers are willing to pay more each time price pulls back. The rising lows show increasing demand. Eventually, the relentless buying pressure overwhelms the fixed supply at resistance.",
 howToIdentify: [
 "Identify a horizontal resistance level tested at least twice.",
 "Connect the rising lows to form an ascending trendline (at least two higher lows).",
 "Price should bounce between the trendline and resistance, compressing.",
 "Volume typically contracts as the pattern develops.",
 "A breakout above resistance on expanding volume completes the pattern.",
 ],
 tradeSetup: {
 entry: "Enter long on a break above the flat resistance line with increased volume.",
 stopLoss: "Place stop below the most recent higher low or below the ascending trendline.",
 target: "Measure the height of the triangle at its widest point and project upward from the breakout.",
 },
 reliability: 4,
 timeframe: "Works well on daily and 4-hour charts. Pattern should develop over several weeks.",
 },
 {
 name: "Descending Triangle",
 type: "continuation",
 direction: "bearish",
 description:
 "A pattern with a flat lower support line and descending upper trendline of lower highs. Price compresses toward the apex as sellers become increasingly aggressive.",
 psychology:
 "Buyers defend a fixed support level, but sellers accept lower prices with each bounce. The lower highs show increasing supply pressure. Eventually, the steady selling overwhelms the fixed demand at support.",
 howToIdentify: [
 "Identify a horizontal support level tested at least twice.",
 "Connect the declining highs to form a descending trendline (at least two lower highs).",
 "Price oscillates between the trendline and support with decreasing range.",
 "Volume typically diminishes as the pattern forms.",
 "A breakdown below support on volume completes the pattern.",
 ],
 tradeSetup: {
 entry: "Enter short on a break below the flat support line with increased volume.",
 stopLoss: "Place stop above the most recent lower high or above the descending trendline.",
 target: "Measure the height of the triangle at its widest point and project downward from the breakdown.",
 },
 reliability: 4,
 timeframe: "Daily and 4-hour charts. Pattern typically develops over 3-6 weeks.",
 },
 {
 name: "Symmetrical Triangle",
 type: "continuation",
 direction: "both",
 description:
 "A pattern with converging trendlines of lower highs and higher lows, forming a symmetrical coil. Price can break in either direction but tends to continue the prior trend.",
 psychology:
 "Both buyers and sellers are becoming more tentative, with each side accepting less favorable prices. Volatility compresses as indecision grows. The breakout represents a resolution of this tension, often with significant momentum.",
 howToIdentify: [
 "Draw a descending trendline connecting at least two lower highs.",
 "Draw an ascending trendline connecting at least two higher lows.",
 "The lines should converge roughly symmetrically.",
 "Volume should decrease as the pattern develops.",
 "The breakout typically occurs between 50-75% of the way to the apex.",
 "Direction of breakout often continues the prior trend.",
 ],
 tradeSetup: {
 entry: "Enter in the direction of the breakout when price closes outside the triangle with expanding volume.",
 stopLoss: "Place stop on the opposite side of the triangle from the breakout direction.",
 target: "Measure the widest part of the triangle and project from the breakout point.",
 },
 reliability: 3,
 timeframe: "Daily charts. Works on all timeframes but daily provides the best reliability.",
 },
 {
 name: "Bull Flag",
 type: "continuation",
 direction: "bullish",
 description:
 "A sharp, strong price rally (the flagpole) followed by a short, orderly pullback that angles slightly downward within parallel lines (the flag).",
 psychology:
 "After a powerful advance, short-term traders take profits causing a minor, controlled pullback. The orderly nature of the flag shows there is no panic selling. Once the flag completes, buyers push through to continue the trend.",
 howToIdentify: [
 "Identify a strong, near-vertical price advance (the flagpole) on high volume.",
 "The pullback should form a downward-sloping channel (the flag).",
 "The flag should retrace no more than 30-50% of the flagpole.",
 "The flag should last 1-4 weeks, much shorter than the flagpole's advance.",
 "Volume should diminish during the flag formation.",
 "The breakout occurs above the upper flag trendline on increasing volume.",
 ],
 tradeSetup: {
 entry: "Enter long on a break above the upper channel line of the flag with volume expansion.",
 stopLoss: "Place stop below the low of the flag.",
 target: "Measure the length of the flagpole and project upward from the flag breakout point.",
 },
 reliability: 4,
 timeframe: "Daily and 4-hour charts. The flag should develop over 1-4 weeks.",
 },
 {
 name: "Bear Flag",
 type: "continuation",
 direction: "bearish",
 description:
 "A sharp price decline (the flagpole) followed by a short, orderly bounce that angles slightly upward within parallel lines (the flag).",
 psychology:
 "After a steep sell-off, short sellers cover and bargain hunters buy, causing a minor, controlled bounce. The orderly flag shows there is no real buying conviction. Once the flag completes, sellers resume control.",
 howToIdentify: [
 "Identify a sharp price decline (the flagpole) on high volume.",
 "The bounce should form an upward-sloping channel (the flag).",
 "The flag should retrace no more than 30-50% of the flagpole.",
 "Volume decreases during the flag formation.",
 "The breakdown occurs below the lower flag trendline on expanding volume.",
 ],
 tradeSetup: {
 entry: "Enter short on a break below the lower channel line of the flag.",
 stopLoss: "Place stop above the high of the flag.",
 target: "Measure the flagpole length and project downward from the breakdown point.",
 },
 reliability: 4,
 timeframe: "Daily and 4-hour charts. Flag should form in 1-3 weeks.",
 },
 {
 name: "Pennant",
 type: "continuation",
 direction: "both",
 description:
 "Similar to a flag but the consolidation forms a small symmetrical triangle rather than a channel. Appears after a strong move (the pole) and represents a brief pause before continuation.",
 psychology:
 "After a powerful move, the market pauses to digest gains or losses. The converging trendlines show volatility compressing rapidly. This tight consolidation typically resolves in the direction of the pole as the dominant force reasserts itself.",
 howToIdentify: [
 "Identify a strong directional move (the pole) on high volume.",
 "The consolidation forms converging trendlines (small symmetrical triangle).",
 "The pennant should be significantly smaller than the pole.",
 "Volume contracts sharply during the pennant formation.",
 "Duration is typically 1-3 weeks.",
 "Breakout occurs in the direction of the pole on expanding volume.",
 ],
 tradeSetup: {
 entry: "Enter in the direction of the pole on a breakout from the pennant with strong volume.",
 stopLoss: "Place stop on the opposite side of the pennant from the breakout.",
 target: "Measure the pole and project from the breakout point of the pennant.",
 },
 reliability: 4,
 timeframe: "Daily and 4-hour charts. The pennant should form quickly, within 1-3 weeks.",
 },
 {
 name: "Rising Wedge",
 type: "reversal",
 direction: "bearish",
 description:
 "Two upward-sloping converging trendlines where the support line rises more steeply than the resistance line. Despite higher highs, the narrowing range signals weakening momentum.",
 psychology:
 "Each rally reaches a new high, giving the illusion of bullishness, but gains are diminishing. Buyers are running out of steam while sellers gradually become more aggressive. Deceptive because it appears bullish on the surface.",
 howToIdentify: [
 "Draw two upward-sloping trendlines that converge.",
 "Price should make at least two higher highs and two higher lows.",
 "The upper trendline should have a less steep angle than the lower.",
 "Volume should diminish as the wedge develops.",
 "The breakdown typically occurs through the lower trendline.",
 "Can appear as a reversal in uptrends or a continuation in downtrends.",
 ],
 tradeSetup: {
 entry: "Enter short on a break below the lower trendline with increasing volume.",
 stopLoss: "Place stop above the most recent high within the wedge.",
 target: "Target the base of the wedge (where the pattern started). Moves can extend beyond this.",
 },
 reliability: 4,
 timeframe: "Daily charts. Can take weeks to months to develop. Longer wedges carry more significance.",
 },
 {
 name: "Rounding Bottom",
 type: "reversal",
 direction: "bullish",
 description:
 "A long-term pattern resembling a bowl or saucer. Price gradually transitions from a downtrend to a flat base to an uptrend, forming a smooth curved bottom.",
 psychology:
 "Selling pressure gradually fades as pessimism exhausts itself. A period of disinterest and low volume follows at the base. Slowly, smart money accumulates and buying interest returns, creating the right side of the bowl.",
 howToIdentify: [
 "Price forms a gradual curve downward, flattens, then curves upward.",
 "The pattern is symmetrical or nearly so around the lowest point.",
 "Volume is typically heaviest at the start, lightest at the base, and builds on the right side.",
 "The pattern can take months to over a year to complete.",
 "A neckline can be drawn across the starting level of the pattern.",
 "Breakout above the neckline on volume confirms the pattern.",
 ],
 tradeSetup: {
 entry: "Enter long on a break above the neckline (the left rim of the bowl). Alternatively, enter earlier as the right side forms with a wider stop.",
 stopLoss: "Place stop below the most recent swing low on the right side of the bowl.",
 target: "Measure the depth of the bowl and project upward from the neckline. Often leads to major sustained uptrends.",
 },
 reliability: 4,
 timeframe: "Weekly and monthly charts. This is a long-term pattern requiring patience. Not suitable for short-term trading.",
 },
];
