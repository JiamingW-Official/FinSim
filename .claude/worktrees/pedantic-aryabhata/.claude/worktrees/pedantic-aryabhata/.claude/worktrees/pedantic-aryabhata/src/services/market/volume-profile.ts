export interface VolumeLevel {
  priceLevel: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  percentOfTotal: number;
}

export interface VolumeProfile {
  levels: VolumeLevel[];
  poc: number;
  valueAreaHigh: number;
  valueAreaLow: number;
  totalVolume: number;
}

export function calculateVolumeProfile(
  bars: {
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[],
  numLevels: number = 30,
): VolumeProfile {
  if (bars.length === 0) {
    return {
      levels: [],
      poc: 0,
      valueAreaHigh: 0,
      valueAreaLow: 0,
      totalVolume: 0,
    };
  }

  // Find the overall price range
  let globalHigh = -Infinity;
  let globalLow = Infinity;
  for (const bar of bars) {
    if (bar.high > globalHigh) globalHigh = bar.high;
    if (bar.low < globalLow) globalLow = bar.low;
  }

  const priceRange = globalHigh - globalLow;
  if (priceRange === 0) {
    const totalVol = bars.reduce((s, b) => s + b.volume, 0);
    return {
      levels: [
        {
          priceLevel: globalHigh,
          volume: totalVol,
          buyVolume: totalVol * 0.5,
          sellVolume: totalVol * 0.5,
          percentOfTotal: 100,
        },
      ],
      poc: globalHigh,
      valueAreaHigh: globalHigh,
      valueAreaLow: globalHigh,
      totalVolume: totalVol,
    };
  }

  const levelSize = priceRange / numLevels;

  // Initialize levels
  const levelMap: {
    priceLevel: number;
    volume: number;
    buyVolume: number;
    sellVolume: number;
  }[] = [];

  for (let i = 0; i < numLevels; i++) {
    levelMap.push({
      priceLevel:
        Math.round((globalLow + levelSize * (i + 0.5)) * 100) / 100,
      volume: 0,
      buyVolume: 0,
      sellVolume: 0,
    });
  }

  // Distribute each bar's volume across price levels it spans
  let totalVolume = 0;

  for (const bar of bars) {
    const barRange = bar.high - bar.low;
    if (barRange === 0) {
      // Single price bar — assign all volume to the matching level
      const idx = Math.min(
        Math.floor((bar.close - globalLow) / levelSize),
        numLevels - 1,
      );
      const isBuy = bar.close >= bar.open;
      levelMap[idx].volume += bar.volume;
      if (isBuy) {
        levelMap[idx].buyVolume += bar.volume;
      } else {
        levelMap[idx].sellVolume += bar.volume;
      }
      totalVolume += bar.volume;
      continue;
    }

    // Determine which levels this bar's range overlaps
    const startLevel = Math.max(
      0,
      Math.floor((bar.low - globalLow) / levelSize),
    );
    const endLevel = Math.min(
      numLevels - 1,
      Math.floor((bar.high - globalLow) / levelSize),
    );

    const numOverlappingLevels = endLevel - startLevel + 1;
    const volumePerLevel = bar.volume / numOverlappingLevels;
    const isBuy = bar.close >= bar.open;

    for (let i = startLevel; i <= endLevel; i++) {
      levelMap[i].volume += volumePerLevel;
      if (isBuy) {
        levelMap[i].buyVolume += volumePerLevel;
      } else {
        levelMap[i].sellVolume += volumePerLevel;
      }
    }

    totalVolume += bar.volume;
  }

  // Build final levels with percentOfTotal
  const levels: VolumeLevel[] = levelMap.map((l) => ({
    priceLevel: l.priceLevel,
    volume: Math.round(l.volume),
    buyVolume: Math.round(l.buyVolume),
    sellVolume: Math.round(l.sellVolume),
    percentOfTotal: totalVolume > 0 ? (l.volume / totalVolume) * 100 : 0,
  }));

  // Find POC — price level with the most volume
  let pocIndex = 0;
  let maxVolume = 0;
  for (let i = 0; i < levels.length; i++) {
    if (levels[i].volume > maxVolume) {
      maxVolume = levels[i].volume;
      pocIndex = i;
    }
  }

  const poc = levels[pocIndex].priceLevel;

  // Calculate Value Area (70% of total volume centered on POC)
  const valueAreaTarget = totalVolume * 0.7;
  let valueAreaVolume = levels[pocIndex].volume;
  let vaLowIdx = pocIndex;
  let vaHighIdx = pocIndex;

  while (valueAreaVolume < valueAreaTarget) {
    const canGoUp = vaHighIdx < levels.length - 1;
    const canGoDown = vaLowIdx > 0;

    if (!canGoUp && !canGoDown) break;

    const upVolume = canGoUp ? levels[vaHighIdx + 1].volume : -1;
    const downVolume = canGoDown ? levels[vaLowIdx - 1].volume : -1;

    if (upVolume >= downVolume) {
      vaHighIdx++;
      valueAreaVolume += levels[vaHighIdx].volume;
    } else {
      vaLowIdx--;
      valueAreaVolume += levels[vaLowIdx].volume;
    }
  }

  return {
    levels,
    poc,
    valueAreaHigh: levels[vaHighIdx].priceLevel,
    valueAreaLow: levels[vaLowIdx].priceLevel,
    totalVolume: Math.round(totalVolume),
  };
}
