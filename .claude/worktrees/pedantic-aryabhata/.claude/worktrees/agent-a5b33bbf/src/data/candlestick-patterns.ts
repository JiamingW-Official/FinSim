export interface CandlestickPattern {
  name: string;
  japaneseName: string;
  type: "bullish" | "bearish" | "neutral";
  reliability: number;
  description: string;
  psychology: string;
  howToTrade: string;
  confirmation: string;
  svg: string;
}

export const CANDLESTICK_PATTERNS: CandlestickPattern[] = [
  {
    name: "Hammer",
    japaneseName: "Takuri",
    type: "bullish",
    reliability: 4,
    description:
      "A single candle with a small real body at the top and a long lower shadow at least twice the body length. Appears after a downtrend.",
    psychology:
      "Sellers pushed price significantly lower during the session, but buyers stepped in aggressively and drove price back up near the open. This shows that selling pressure is exhausting and buyers are gaining control.",
    howToTrade:
      "Enter long on a break above the hammer's high on the next candle. Place stop-loss below the hammer's low. Target the nearest resistance level or use a 2:1 reward-to-risk ratio.",
    confirmation:
      "A bullish candle closing above the hammer's close on the following session confirms the reversal. Volume higher than average adds conviction.",
    svg: '<rect x="22" y="10" width="6" height="12" fill="#22c55e" stroke="#22c55e"/><line x1="25" y1="22" x2="25" y2="45" stroke="#22c55e" stroke-width="1.5"/><line x1="25" y1="10" x2="25" y2="7" stroke="#22c55e" stroke-width="1.5"/>',
  },
  {
    name: "Inverted Hammer",
    japaneseName: "Tohba",
    type: "bullish",
    reliability: 3,
    description:
      "A single candle with a small real body at the bottom and a long upper shadow at least twice the body length. Appears after a downtrend.",
    psychology:
      "Buyers attempted to push prices higher during the session. Although sellers fought back, the buying pressure signals that bulls are starting to test the bears. The fact that price didn't continue lower is itself a bullish sign.",
    howToTrade:
      "Wait for bullish confirmation on the next candle before entering. Enter long on a break above the inverted hammer's high. Stop-loss below the inverted hammer's low.",
    confirmation:
      "A gap up or strong bullish candle on the next session. Without confirmation, the pattern is unreliable.",
    svg: '<rect x="22" y="33" width="6" height="12" fill="#22c55e" stroke="#22c55e"/><line x1="25" y1="33" x2="25" y2="5" stroke="#22c55e" stroke-width="1.5"/><line x1="25" y1="45" x2="25" y2="47" stroke="#22c55e" stroke-width="1.5"/>',
  },
  {
    name: "Bullish Engulfing",
    japaneseName: "Tsutsumi",
    type: "bullish",
    reliability: 5,
    description:
      "A two-candle pattern where a large bullish candle completely engulfs the prior bearish candle's body. Appears after a downtrend.",
    psychology:
      "After a down day, buyers overwhelm sellers so thoroughly that the entire previous session's range is overtaken. This dramatic shift in momentum indicates the bears have lost control.",
    howToTrade:
      "Enter long at the close of the engulfing candle or on the open of the next session. Stop-loss below the low of the engulfing candle. Target the next significant resistance.",
    confirmation:
      "High volume on the engulfing day and follow-through buying on the next session. The pattern is strongest when it occurs near a support level.",
    svg: '<rect x="12" y="18" width="8" height="14" fill="#ef4444" stroke="#ef4444"/><rect x="28" y="14" width="10" height="22" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Bearish Engulfing",
    japaneseName: "Tsutsumi",
    type: "bearish",
    reliability: 5,
    description:
      "A two-candle pattern where a large bearish candle completely engulfs the prior bullish candle's body. Appears after an uptrend.",
    psychology:
      "After an up day, sellers overwhelm buyers with such force that the previous session's entire gain is erased and exceeded. This signals a potential power shift from bulls to bears.",
    howToTrade:
      "Enter short at the close of the engulfing candle or the next open. Stop-loss above the high of the engulfing candle. Target the nearest support level.",
    confirmation:
      "Heavy volume on the engulfing day and continued selling on the following session. Most powerful near resistance levels.",
    svg: '<rect x="12" y="18" width="8" height="14" fill="#22c55e" stroke="#22c55e"/><rect x="28" y="14" width="10" height="22" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Morning Star",
    japaneseName: "Sansei Ake no Myojyo",
    type: "bullish",
    reliability: 5,
    description:
      "A three-candle pattern: a large bearish candle, a small-bodied candle (star) that gaps down, and a large bullish candle that closes into the first candle's body.",
    psychology:
      "The first candle shows strong selling. The small star shows indecision as selling pressure fades. The third candle's strong buying confirms that bears have been replaced by bulls.",
    howToTrade:
      "Enter long at the close of the third candle or on the next open. Stop-loss below the low of the star candle. Target the recent swing high.",
    confirmation:
      "The third candle should close above the midpoint of the first candle's body. Higher volume on the third candle strengthens the signal.",
    svg: '<rect x="5" y="10" width="8" height="20" fill="#ef4444" stroke="#ef4444"/><rect x="20" y="28" width="6" height="5" fill="#a3a3a3" stroke="#a3a3a3"/><rect x="35" y="8" width="8" height="20" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Evening Star",
    japaneseName: "Sansei Yoi no Myojyo",
    type: "bearish",
    reliability: 5,
    description:
      "A three-candle pattern: a large bullish candle, a small-bodied candle (star) that gaps up, and a large bearish candle that closes into the first candle's body.",
    psychology:
      "Strong buying creates the first candle. The star shows momentum stalling at highs. The third candle's aggressive selling proves the bulls have exhausted themselves.",
    howToTrade:
      "Enter short at the close of the third candle. Stop-loss above the high of the star. Target the recent swing low or the next support level.",
    confirmation:
      "The third candle should close below the midpoint of the first candle. Volume expansion on the third candle adds conviction.",
    svg: '<rect x="5" y="15" width="8" height="20" fill="#22c55e" stroke="#22c55e"/><rect x="20" y="8" width="6" height="5" fill="#a3a3a3" stroke="#a3a3a3"/><rect x="35" y="12" width="8" height="20" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Three White Soldiers",
    japaneseName: "Sanpei",
    type: "bullish",
    reliability: 5,
    description:
      "Three consecutive long bullish candles, each opening within the previous candle's body and closing near its high. Appears after a downtrend or consolidation.",
    psychology:
      "Sustained buying pressure over three sessions demonstrates serious commitment from bulls. Each day's new buyers confirm the previous day's buyers were right, creating a virtuous cycle of confidence.",
    howToTrade:
      "Enter long at the close of the third candle with a stop below the first candle's low. Be cautious if the candles are very long as the move may be extended and due for a pullback.",
    confirmation:
      "Look for above-average volume on all three candles. Diminishing body size on the third candle may signal fading momentum.",
    svg: '<rect x="5" y="30" width="8" height="14" fill="#22c55e" stroke="#22c55e"/><rect x="19" y="22" width="8" height="14" fill="#22c55e" stroke="#22c55e"/><rect x="33" y="14" width="8" height="14" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Three Black Crows",
    japaneseName: "Sanba Garasu",
    type: "bearish",
    reliability: 5,
    description:
      "Three consecutive long bearish candles, each opening within the previous candle's body and closing near its low. Appears after an uptrend.",
    psychology:
      "Relentless selling over three sessions shows bears have seized control. Each session opens with hope from remaining bulls, but sellers dominate throughout the day, crushing confidence.",
    howToTrade:
      "Enter short at the close of the third candle. Stop-loss above the first candle's high. Target the next major support level. Be cautious near major support as a bounce is possible.",
    confirmation:
      "Heavy volume across all three candles confirms institutional selling. The pattern is strongest when occurring at or near resistance.",
    svg: '<rect x="5" y="10" width="8" height="14" fill="#ef4444" stroke="#ef4444"/><rect x="19" y="18" width="8" height="14" fill="#ef4444" stroke="#ef4444"/><rect x="33" y="26" width="8" height="14" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Doji",
    japaneseName: "Doji",
    type: "neutral",
    reliability: 3,
    description:
      "A single candle where the open and close are virtually equal, creating a cross-like appearance. Upper and lower shadows can vary in length.",
    psychology:
      "Perfect equilibrium between buyers and sellers. Neither side managed to gain an advantage during the session. After a strong trend, this indecision can signal that the dominant side is losing conviction.",
    howToTrade:
      "Do not trade the doji in isolation. Wait for the next candle to determine direction. A bullish candle after a doji in a downtrend signals reversal upward, and vice versa.",
    confirmation:
      "Direction of the candle following the doji determines the likely move. Doji at support or resistance levels carry more significance.",
    svg: '<line x1="25" y1="5" x2="25" y2="45" stroke="#a3a3a3" stroke-width="1.5"/><line x1="20" y1="25" x2="30" y2="25" stroke="#a3a3a3" stroke-width="2"/>',
  },
  {
    name: "Dragonfly Doji",
    japaneseName: "Tonbo",
    type: "bullish",
    reliability: 4,
    description:
      "A doji with a long lower shadow and no upper shadow. The open, high, and close are all at or near the session's high.",
    psychology:
      "Sellers drove prices dramatically lower during the session, but buyers recaptured all lost ground by the close. This demonstrates powerful buying support at lower levels.",
    howToTrade:
      "Enter long on a break above the dragonfly doji's high. Stop-loss below the long lower shadow. The longer the lower shadow, the more bullish the implication.",
    confirmation:
      "A bullish candle on the following session confirms the reversal. Most significant at the end of a downtrend or at key support levels.",
    svg: '<line x1="25" y1="12" x2="25" y2="45" stroke="#22c55e" stroke-width="1.5"/><line x1="20" y1="12" x2="30" y2="12" stroke="#22c55e" stroke-width="2"/>',
  },
  {
    name: "Gravestone Doji",
    japaneseName: "Hakaishi",
    type: "bearish",
    reliability: 4,
    description:
      "A doji with a long upper shadow and no lower shadow. The open, low, and close are all at or near the session's low.",
    psychology:
      "Buyers pushed prices sharply higher during the session, but sellers drove price all the way back to the open by the close. This rejection of higher prices signals buyer exhaustion.",
    howToTrade:
      "Enter short on a break below the gravestone doji's low. Stop-loss above the long upper shadow. More significant after an uptrend.",
    confirmation:
      "A bearish candle following the gravestone doji confirms the reversal signal. Strongest at resistance levels.",
    svg: '<line x1="25" y1="5" x2="25" y2="38" stroke="#ef4444" stroke-width="1.5"/><line x1="20" y1="38" x2="30" y2="38" stroke="#ef4444" stroke-width="2"/>',
  },
  {
    name: "Spinning Top",
    japaneseName: "Koma",
    type: "neutral",
    reliability: 2,
    description:
      "A candle with a small real body in the middle and upper and lower shadows of roughly equal length. Color of the body is not significant.",
    psychology:
      "Both bulls and bears were active during the session but neither could establish dominance. The small body shows indecision and potential loss of momentum in the current trend.",
    howToTrade:
      "Not a standalone trading signal. Use it as a warning that the current trend may be losing steam. Wait for the next candle to confirm direction before acting.",
    confirmation:
      "The candle following the spinning top determines the likely direction. Multiple spinning tops in succession indicate a potential consolidation or reversal zone.",
    svg: '<line x1="25" y1="5" x2="25" y2="45" stroke="#a3a3a3" stroke-width="1.5"/><rect x="21" y="20" width="8" height="10" fill="#a3a3a3" stroke="#a3a3a3"/>',
  },
  {
    name: "Bullish Marubozu",
    japaneseName: "Marubozu",
    type: "bullish",
    reliability: 4,
    description:
      "A single long bullish candle with no upper or lower shadows. Price opened at the low and closed at the high of the session.",
    psychology:
      "Buyers controlled the entire session from open to close with no meaningful pushback from sellers. This represents total buyer dominance and extreme bullish conviction.",
    howToTrade:
      "Enter long at the close or on a pullback to the midpoint of the marubozu. Stop-loss below the candle's low. May indicate the start of a strong trend move.",
    confirmation:
      "A follow-through candle in the same direction confirms strength. Very high volume adds conviction. A marubozu breaking through resistance is especially powerful.",
    svg: '<rect x="18" y="8" width="14" height="34" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Bearish Marubozu",
    japaneseName: "Marubozu",
    type: "bearish",
    reliability: 4,
    description:
      "A single long bearish candle with no upper or lower shadows. Price opened at the high and closed at the low of the session.",
    psychology:
      "Sellers controlled the entire session from open to close without any meaningful buyer resistance. This represents total seller dominance and extreme bearish conviction.",
    howToTrade:
      "Enter short at the close or on a bounce to the midpoint. Stop-loss above the candle's high. Often marks the beginning of an accelerated downtrend.",
    confirmation:
      "Continued selling on the next session. High volume validates institutional participation. A marubozu breaking through support is especially bearish.",
    svg: '<rect x="18" y="8" width="14" height="34" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Bullish Harami",
    japaneseName: "Harami",
    type: "bullish",
    reliability: 3,
    description:
      "A two-candle pattern where a small bullish candle's body is contained entirely within the body of the preceding large bearish candle.",
    psychology:
      "After strong selling, the small bullish candle shows that selling momentum has stalled. The range contraction indicates sellers are losing conviction and buyers are beginning to absorb supply.",
    howToTrade:
      "Enter long on a break above the small candle's high. Stop-loss below the low of the large bearish candle. Tighter stop can be placed below the small candle's low.",
    confirmation:
      "A bullish candle closing above the harami pattern on the third day confirms the reversal. The pattern is more reliable at established support levels.",
    svg: '<rect x="10" y="8" width="10" height="30" fill="#ef4444" stroke="#ef4444"/><rect x="30" y="16" width="8" height="10" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Bearish Harami",
    japaneseName: "Harami",
    type: "bearish",
    reliability: 3,
    description:
      "A two-candle pattern where a small bearish candle's body is contained entirely within the body of the preceding large bullish candle.",
    psychology:
      "After strong buying, the small bearish candle shows that upward momentum has stalled. Buyers who drove the first candle are not following through, and early sellers are appearing.",
    howToTrade:
      "Enter short on a break below the small candle's low. Stop-loss above the high of the large bullish candle. Wait for confirmation for higher reliability.",
    confirmation:
      "A bearish candle on the third day closing below the harami's low confirms the reversal. Strongest at resistance levels.",
    svg: '<rect x="10" y="12" width="10" height="30" fill="#22c55e" stroke="#22c55e"/><rect x="30" y="20" width="8" height="10" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Piercing Line",
    japaneseName: "Kirikomi",
    type: "bullish",
    reliability: 4,
    description:
      "A two-candle pattern: a long bearish candle followed by a bullish candle that opens below the prior low but closes above the midpoint of the first candle's body.",
    psychology:
      "After a gap down open that initially looks devastating, buyers step in and drive price significantly higher, reclaiming more than half of the prior day's losses. This dramatic intraday reversal shakes bearish confidence.",
    howToTrade:
      "Enter long at the close of the bullish candle. Stop-loss below the low of the pattern. Target resistance or use a measured move equal to the height of the first candle.",
    confirmation:
      "The bullish candle must close above the 50% level of the first candle. Above-average volume on the second candle adds reliability.",
    svg: '<rect x="10" y="8" width="10" height="24" fill="#ef4444" stroke="#ef4444"/><rect x="30" y="12" width="10" height="28" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Dark Cloud Cover",
    japaneseName: "Kabuse",
    type: "bearish",
    reliability: 4,
    description:
      "A two-candle pattern: a long bullish candle followed by a bearish candle that opens above the prior high but closes below the midpoint of the first candle's body.",
    psychology:
      "After a gap up open that initially excites bulls, sellers overwhelm buyers and push price down past the prior candle's midpoint. This dramatic failure at new highs destroys bullish momentum.",
    howToTrade:
      "Enter short at the close of the bearish candle. Stop-loss above the high of the pattern. Target support or use a measured move.",
    confirmation:
      "The bearish candle must penetrate below the 50% level of the first candle. More penetration means a stronger signal.",
    svg: '<rect x="10" y="16" width="10" height="24" fill="#22c55e" stroke="#22c55e"/><rect x="30" y="10" width="10" height="28" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Rising Three Methods",
    japaneseName: "Uwa Banare Sanpoo Ohdatekomi",
    type: "bullish",
    reliability: 4,
    description:
      "A five-candle continuation pattern: a long bullish candle, three small bearish candles that stay within the first candle's range, and a final long bullish candle that closes above the first.",
    psychology:
      "The initial strong buying pauses for a brief, orderly pullback. The small bearish candles represent normal profit-taking, not a trend reversal. The final strong candle shows that the original buyers remain in control.",
    howToTrade:
      "Enter long at the close of the fifth candle. Stop-loss below the low of the three middle candles. The three small candles should not exceed the range of the first candle.",
    confirmation:
      "Volume should be high on the first and fifth candles and lighter on the three middle candles. This volume pattern confirms the pullback was minor.",
    svg: '<rect x="2" y="15" width="7" height="20" fill="#22c55e" stroke="#22c55e"/><rect x="12" y="18" width="5" height="8" fill="#ef4444" stroke="#ef4444"/><rect x="20" y="20" width="5" height="8" fill="#ef4444" stroke="#ef4444"/><rect x="28" y="19" width="5" height="8" fill="#ef4444" stroke="#ef4444"/><rect x="36" y="10" width="7" height="22" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Falling Three Methods",
    japaneseName: "Shita Banare Sanpoo Ohdatekomi",
    type: "bearish",
    reliability: 4,
    description:
      "A five-candle continuation pattern: a long bearish candle, three small bullish candles that stay within the first candle's range, and a final long bearish candle that closes below the first.",
    psychology:
      "Strong selling pauses for a brief, contained rally. The small bullish candles represent short covering, not a true reversal. The final bearish candle confirms that sellers remain dominant.",
    howToTrade:
      "Enter short at the close of the fifth candle. Stop-loss above the high of the three middle candles. Continuation of the existing downtrend is expected.",
    confirmation:
      "Higher volume on the first and fifth candles relative to the three middle candles confirms the pattern's validity.",
    svg: '<rect x="2" y="10" width="7" height="20" fill="#ef4444" stroke="#ef4444"/><rect x="12" y="18" width="5" height="8" fill="#22c55e" stroke="#22c55e"/><rect x="20" y="16" width="5" height="8" fill="#22c55e" stroke="#22c55e"/><rect x="28" y="17" width="5" height="8" fill="#22c55e" stroke="#22c55e"/><rect x="36" y="14" width="7" height="22" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Tweezer Top",
    japaneseName: "Kenuki Tenjo",
    type: "bearish",
    reliability: 3,
    description:
      "Two or more candles with matching highs at the top of an uptrend. The first candle is bullish and the second is bearish.",
    psychology:
      "Price reaches the same high on consecutive sessions but fails to break through. This matching resistance level shows that sellers are defending that price aggressively, creating a ceiling.",
    howToTrade:
      "Enter short below the low of the second candle. Stop-loss above the matching highs. The pattern marks a short-term resistance level that can serve as a reference point.",
    confirmation:
      "A bearish candle following the tweezer top confirms the resistance. The pattern is most significant at established resistance zones.",
    svg: '<rect x="12" y="10" width="10" height="20" fill="#22c55e" stroke="#22c55e"/><rect x="28" y="10" width="10" height="20" fill="#ef4444" stroke="#ef4444"/>',
  },
  {
    name: "Tweezer Bottom",
    japaneseName: "Kenuki Zoko",
    type: "bullish",
    reliability: 3,
    description:
      "Two or more candles with matching lows at the bottom of a downtrend. The first candle is bearish and the second is bullish.",
    psychology:
      "Price reaches the same low on consecutive sessions but holds. Buyers are defending this level, establishing a floor that sellers cannot break through.",
    howToTrade:
      "Enter long above the high of the second candle. Stop-loss below the matching lows. The pattern establishes a clear support reference.",
    confirmation:
      "A bullish candle following confirms the support. Most reliable at established support levels or round numbers.",
    svg: '<rect x="12" y="18" width="10" height="20" fill="#ef4444" stroke="#ef4444"/><rect x="28" y="18" width="10" height="20" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Abandoned Baby",
    japaneseName: "Sute Go",
    type: "bullish",
    reliability: 5,
    description:
      "A rare three-candle reversal: a bearish candle, a doji that gaps below it, and a bullish candle that gaps above the doji. The doji's shadows do not overlap with adjacent candles.",
    psychology:
      "The gap-down doji shows a climactic final gasp of selling followed by complete indecision. The gap-up bullish candle shows a dramatic and sudden shift to buying dominance. The isolation of the doji emphasizes the reversal.",
    howToTrade:
      "Enter long at the close of the third candle. Stop-loss below the doji's low. This is one of the most reliable reversal patterns when it appears. Very rare but powerful.",
    confirmation:
      "The gaps on both sides of the doji are essential for the pattern. Follow-through buying on subsequent sessions validates the reversal.",
    svg: '<rect x="5" y="8" width="8" height="16" fill="#ef4444" stroke="#ef4444"/><line x1="22" y1="28" x2="22" y2="36" stroke="#a3a3a3" stroke-width="1.5"/><line x1="19" y1="32" x2="25" y2="32" stroke="#a3a3a3" stroke-width="2"/><rect x="35" y="10" width="8" height="16" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Three Inside Up",
    japaneseName: "N/A",
    type: "bullish",
    reliability: 4,
    description:
      "A three-candle pattern: a long bearish candle, a smaller bullish candle that forms inside the first (harami), and a third bullish candle that closes above the first candle's open.",
    psychology:
      "The harami shows selling pressure waning. The third candle's close above the first candle's open confirms that buyers have fully taken control and the prior selling has been negated.",
    howToTrade:
      "Enter long at the close of the third candle. Stop-loss below the low of the pattern. This is a confirmed bullish harami and is more reliable than the two-candle version.",
    confirmation:
      "The third candle must close above the first candle's open (the body top of the bearish candle). Volume increasing on the third candle adds conviction.",
    svg: '<rect x="5" y="8" width="8" height="28" fill="#ef4444" stroke="#ef4444"/><rect x="19" y="16" width="7" height="10" fill="#22c55e" stroke="#22c55e"/><rect x="33" y="6" width="8" height="20" fill="#22c55e" stroke="#22c55e"/>',
  },
  {
    name: "Three Inside Down",
    japaneseName: "N/A",
    type: "bearish",
    reliability: 4,
    description:
      "A three-candle pattern: a long bullish candle, a smaller bearish candle that forms inside the first (harami), and a third bearish candle that closes below the first candle's open.",
    psychology:
      "The bearish harami signals buying exhaustion. The third candle's close below the first candle's open confirms that sellers have overtaken the bulls and the prior rally is over.",
    howToTrade:
      "Enter short at the close of the third candle. Stop-loss above the high of the pattern. More reliable than a standalone bearish harami.",
    confirmation:
      "The third candle must close below the open of the first candle. Increasing volume on the third candle confirms institutional selling interest.",
    svg: '<rect x="5" y="12" width="8" height="28" fill="#22c55e" stroke="#22c55e"/><rect x="19" y="20" width="7" height="10" fill="#ef4444" stroke="#ef4444"/><rect x="33" y="22" width="8" height="20" fill="#ef4444" stroke="#ef4444"/>',
  },
];
