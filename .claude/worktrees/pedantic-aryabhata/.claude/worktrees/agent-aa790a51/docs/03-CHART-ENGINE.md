# 03 — 图表引擎 + 技术分析工具

## 图表引擎选型

使用 **TradingView Lightweight Charts** 作为核心渲染引擎：
- 开源 (Apache 2.0)，由 TradingView 官方维护
- WebGL 加速，轻量级 (~45KB gzipped)
- 支持 K线图、折线图、面积图、柱状图
- 内置十字光标、缩放、拖拽
- 强大的自定义 API

```bash
npm install lightweight-charts
```

---

## 图表组件架构

```typescript
// src/components/chart/CandlestickChart.tsx

import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts';

interface ChartProps {
  data: OHLCVBar[];
  indicators: IndicatorConfig[];
  height?: number;
  onCrosshairMove?: (param: MouseEventParams) => void;
  onBarClick?: (bar: OHLCVBar) => void;
}

// 图表管理器 — 统一管理主图 + 多个子图
class ChartManager {
  private mainChart: IChartApi;
  private candleSeries: ISeriesApi<'Candlestick'>;
  private overlayIndicators: Map<string, ISeriesApi<any>>;
  private subCharts: Map<string, { chart: IChartApi; series: ISeriesApi<any>[] }>;

  // 配置主题
  private theme = {
    background: '#0a0e17',
    textColor: '#6b7280',
    gridColor: '#1a2235',
    upColor: '#10b981',
    downColor: '#ef4444',
    crosshairColor: '#374151',
    volumeUpColor: 'rgba(16, 185, 129, 0.3)',
    volumeDownColor: 'rgba(239, 68, 68, 0.3)',
  };
}
```

---

## 完整技术指标库

### 一、趋势指标 (Trend)

| 指标 | 缩写 | 参数 | 用途 |
|------|------|------|------|
| Simple Moving Average | SMA | 期间 (5/10/20/50/100/200) | 趋势方向、支撑阻力 |
| Exponential Moving Average | EMA | 期间 (9/12/21/55) | 更灵敏的趋势跟踪 |
| Weighted Moving Average | WMA | 期间 | 加权趋势 |
| Double EMA | DEMA | 期间 | 减少延迟 |
| MACD | MACD | 12/26/9 | 趋势动量转换 |
| ADX | ADX | 14 | 趋势强度 (不是方向) |
| Parabolic SAR | PSAR | 0.02/0.2 | 趋势反转点 |
| Ichimoku Cloud | ICHI | 9/26/52 | 综合趋势系统 |
| SuperTrend | ST | 10/3 | 趋势跟踪止损 |

### 二、振荡指标 (Oscillators)

| 指标 | 缩写 | 参数 | 用途 |
|------|------|------|------|
| Relative Strength Index | RSI | 14 | 超买超卖 (70/30) |
| Stochastic | STOCH | 14/3/3 | K/D 线交叉 |
| CCI | CCI | 20 | 价格偏离度 |
| Williams %R | WILLR | 14 | 超买超卖 |
| ROC | ROC | 12 | 变动速率 |
| MFI | MFI | 14 | 资金流量指标 |

### 三、波动率指标 (Volatility)

| 指标 | 缩写 | 参数 | 用途 |
|------|------|------|------|
| Bollinger Bands | BB | 20/2 | 波动通道 |
| ATR | ATR | 14 | 平均真实范围 |
| Keltner Channel | KC | 20/2 | ATR 通道 |
| Donchian Channel | DC | 20 | 高低点通道 |
| Historical Volatility | HV | 20 | 历史波动率 |

### 四、成交量指标 (Volume)

| 指标 | 缩写 | 参数 | 用途 |
|------|------|------|------|
| VWAP | VWAP | 日内 | 大资金成本线 |
| On-Balance Volume | OBV | — | 量价背离 |
| A/D Line | ADL | — | 积聚/派发 |
| Volume Profile | VP | — | 成交量分布 |
| RVOL | RVOL | 20 | 相对成交量 |

---

## 指标计算引擎 (TypeScript)

```typescript
// src/services/indicators/index.ts

export class IndicatorEngine {
  
  // ── 移动平均 ──
  
  static SMA(data: number[], period: number): (number | null)[] {
    return data.map((_, i) => {
      if (i < period - 1) return null;
      const slice = data.slice(i - period + 1, i + 1);
      return slice.reduce((s, v) => s + v, 0) / period;
    });
  }

  static EMA(data: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const result = [data[0]];
    for (let i = 1; i < data.length; i++) {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
    return result;
  }

  static DEMA(data: number[], period: number): number[] {
    const ema1 = this.EMA(data, period);
    const ema2 = this.EMA(ema1, period);
    return ema1.map((v, i) => 2 * v - ema2[i]);
  }

  // ── MACD ──
  
  static MACD(closes: number[], fast = 12, slow = 26, signal = 9) {
    const emaFast = this.EMA(closes, fast);
    const emaSlow = this.EMA(closes, slow);
    const macdLine = emaFast.map((v, i) => v - emaSlow[i]);
    const signalLine = this.EMA(macdLine, signal);
    const histogram = macdLine.map((v, i) => v - signalLine[i]);
    return { macd: macdLine, signal: signalLine, histogram };
  }

  // ── RSI ──
  
  static RSI(closes: number[], period = 14): (number | null)[] {
    const result: (number | null)[] = new Array(closes.length).fill(null);
    let gainSum = 0, lossSum = 0;
    
    for (let i = 1; i <= period; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gainSum += diff; else lossSum -= diff;
    }
    
    let avgGain = gainSum / period;
    let avgLoss = lossSum / period;
    result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    
    for (let i = period + 1; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
      result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
    return result;
  }

  // ── Stochastic ──
  
  static Stochastic(highs: number[], lows: number[], closes: number[], kPeriod = 14, dPeriod = 3) {
    const kLine: (number | null)[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (i < kPeriod - 1) { kLine.push(null); continue; }
      const highSlice = highs.slice(i - kPeriod + 1, i + 1);
      const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
      const hh = Math.max(...highSlice);
      const ll = Math.min(...lowSlice);
      kLine.push(hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
    }
    const dLine = this.SMA(kLine.map(v => v ?? 0), dPeriod);
    return { k: kLine, d: dLine };
  }

  // ── Bollinger Bands ──
  
  static BollingerBands(closes: number[], period = 20, mult = 2) {
    const sma = this.SMA(closes, period);
    return closes.map((_, i) => {
      if (sma[i] === null) return { upper: null, middle: null, lower: null };
      const slice = closes.slice(i - period + 1, i + 1);
      const std = Math.sqrt(slice.reduce((s, v) => s + (v - sma[i]!) ** 2, 0) / period);
      return { upper: sma[i]! + mult * std, middle: sma[i], lower: sma[i]! - mult * std };
    });
  }

  // ── ATR ──
  
  static ATR(highs: number[], lows: number[], closes: number[], period = 14): (number | null)[] {
    const tr: number[] = [highs[0] - lows[0]];
    for (let i = 1; i < closes.length; i++) {
      tr.push(Math.max(
        highs[i] - lows[i],
        Math.abs(highs[i] - closes[i - 1]),
        Math.abs(lows[i] - closes[i - 1])
      ));
    }
    return this.SMA(tr, period);
  }

  // ── ADX ──
  
  static ADX(highs: number[], lows: number[], closes: number[], period = 14) {
    // +DM, -DM, TR 计算
    const plusDM: number[] = [0];
    const minusDM: number[] = [0];
    const tr: number[] = [highs[0] - lows[0]];
    
    for (let i = 1; i < closes.length; i++) {
      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];
      plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
      minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
      tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
    }
    
    const smoothTR = this.EMA(tr, period);
    const smoothPDM = this.EMA(plusDM, period);
    const smoothMDM = this.EMA(minusDM, period);
    
    const plusDI = smoothPDM.map((v, i) => smoothTR[i] === 0 ? 0 : (v / smoothTR[i]) * 100);
    const minusDI = smoothMDM.map((v, i) => smoothTR[i] === 0 ? 0 : (v / smoothTR[i]) * 100);
    const dx = plusDI.map((v, i) => {
      const sum = v + minusDI[i];
      return sum === 0 ? 0 : (Math.abs(v - minusDI[i]) / sum) * 100;
    });
    const adx = this.EMA(dx, period);
    
    return { adx, plusDI, minusDI };
  }

  // ── VWAP ──
  
  static VWAP(highs: number[], lows: number[], closes: number[], volumes: number[]): number[] {
    let cumVol = 0, cumTPV = 0;
    return closes.map((_, i) => {
      const tp = (highs[i] + lows[i] + closes[i]) / 3;
      cumVol += volumes[i];
      cumTPV += tp * volumes[i];
      return cumVol > 0 ? cumTPV / cumVol : tp;
    });
  }

  // ── Ichimoku Cloud ──
  
  static Ichimoku(highs: number[], lows: number[], closes: number[], tenkan = 9, kijun = 26, senkou = 52) {
    const midpoint = (h: number[], l: number[], period: number, i: number) => {
      if (i < period - 1) return null;
      const hSlice = h.slice(i - period + 1, i + 1);
      const lSlice = l.slice(i - period + 1, i + 1);
      return (Math.max(...hSlice) + Math.min(...lSlice)) / 2;
    };
    
    const tenkanSen = closes.map((_, i) => midpoint(highs, lows, tenkan, i));
    const kijunSen = closes.map((_, i) => midpoint(highs, lows, kijun, i));
    const senkouA = tenkanSen.map((v, i) => v !== null && kijunSen[i] !== null ? (v + kijunSen[i]!) / 2 : null);
    const senkouB = closes.map((_, i) => midpoint(highs, lows, senkou, i));
    const chikou = closes.map((_, i) => i + kijun < closes.length ? closes[i + kijun] : null);
    
    return { tenkanSen, kijunSen, senkouA, senkouB, chikou };
  }

  // ── Parabolic SAR ──
  
  static ParabolicSAR(highs: number[], lows: number[], af0 = 0.02, afMax = 0.2) {
    const sar: number[] = [lows[0]];
    let isLong = true;
    let af = af0;
    let ep = highs[0];
    
    for (let i = 1; i < highs.length; i++) {
      let newSar = sar[i - 1] + af * (ep - sar[i - 1]);
      
      if (isLong) {
        newSar = Math.min(newSar, lows[i - 1], i > 1 ? lows[i - 2] : lows[i - 1]);
        if (newSar > lows[i]) {
          isLong = false; newSar = ep; af = af0; ep = lows[i];
        } else {
          if (highs[i] > ep) { ep = highs[i]; af = Math.min(af + af0, afMax); }
        }
      } else {
        newSar = Math.max(newSar, highs[i - 1], i > 1 ? highs[i - 2] : highs[i - 1]);
        if (newSar < highs[i]) {
          isLong = true; newSar = ep; af = af0; ep = highs[i];
        } else {
          if (lows[i] < ep) { ep = lows[i]; af = Math.min(af + af0, afMax); }
        }
      }
      sar.push(newSar);
    }
    return sar;
  }
}
```

---

## 画线工具系统

| 工具 | 功能 |
|------|------|
| 趋势线 | 两点画线，自动延伸 |
| 水平线 | 标记支撑/阻力位 |
| 斐波那契回撤 | 自动计算 23.6%, 38.2%, 50%, 61.8%, 78.6% |
| 斐波那契扩展 | 目标价位预测 |
| 矩形选区 | 标记价格/时间区间 |
| 通道线 | 平行通道 |
| 文本标注 | 在图表上添加笔记 |
| 测量工具 | 价格变动 + 百分比 + 天数 |

---

## 图表布局系统

支持多种预设布局，用户也可自定义：

```
┌──────────────────────────────┐   ┌──────────┬──────────┐
│                              │   │          │          │
│        单图表布局             │   │   NVDA   │  AAPL    │
│        (默认)                │   │          │          │
│                              │   ├──────────┼──────────┤
└──────────────────────────────┘   │   SPY    │  TSLA    │
                                   │          │          │
                                   └──────────┴──────────┘
                                        4格对比布局
```
