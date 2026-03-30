# 02 — 市场数据引擎

## 核心原则

**一切数据必须真实。** Alpha Deck 的灵魂在于用真实的历史市场数据来训练。价格、成交量、期权链、公司财报 — 全部来自真实市场，不做任何修改。

---

## 数据源优先级

| 数据类型 | 首选 | 备选 | 说明 |
|---------|------|------|------|
| 股票 OHLCV | Polygon.io | Yahoo Finance (yfinance) | 精确到分钟级 |
| 期权链 | Polygon.io Options | CBOE DataShop | 真实 Greeks + IV |
| 公司基本面 | Financial Modeling Prep | Alpha Vantage | 财报、比率、估值 |
| 经济数据 | FRED API | Trading Economics | CPI、利率、GDP |
| 新闻/事件 | Polygon.io News | Finnhub | 时间标注的事件 |
| 市场情绪 | Fear & Greed Index | AAII Sentiment | 社交情绪指标 |

---

## 数据模型

### OHLCV Bar

```typescript
interface OHLCVBar {
  timestamp: number;       // Unix 毫秒
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;           // 成交量加权平均价
  trades?: number;         // 成交笔数
  ticker: string;
  timeframe: Timeframe;
}

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W' | '1M';
```

### Stock Fundamentals

```typescript
interface StockFundamentals {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  epsTrailing: number;
  epsFwd: number;
  revenueGrowthYoY: number;
  profitMargin: number;
  debtToEquity: number;
  dividendYield: number;
  beta: number;
  avgVolume30d: number;
  shortInterest: number;
  insiderOwnership: number;
  institutionalOwnership: number;
  earningsDate: string;
  exDividendDate: string;
}
```

### Options Contract

```typescript
interface OptionsContract {
  ticker: string;
  expiration: string;      // YYYY-MM-DD
  strike: number;
  type: 'call' | 'put';
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  inTheMoney: boolean;
}
```

### Market Event

```typescript
interface MarketEvent {
  timestamp: number;
  type: 'earnings' | 'fed_decision' | 'economic_data' | 'news' | 'ipo' | 'split' | 'dividend';
  headline: string;
  body: string;
  tickers: string[];       // 受影响的股票
  impact: 'high' | 'medium' | 'low';
  sentiment: number;       // -1 to 1
  actual?: string;         // 实际数据
  expected?: string;       // 预期数据
  previous?: string;       // 前值
}
```

---

## 数据获取管道

### Polygon.io 集成

```typescript
// src/services/market-data/polygon.ts

import { restClient } from '@polygon.io/client-js';

const client = restClient(process.env.POLYGON_API_KEY);

// 获取历史日线数据
export async function getHistoricalBars(
  ticker: string,
  from: string,    // YYYY-MM-DD
  to: string,
  timeframe: string = '1/day'
): Promise<OHLCVBar[]> {
  const [multiplier, timespan] = timeframe.split('/');
  
  const response = await client.stocks.aggregates(
    ticker, 
    Number(multiplier), 
    timespan as any,
    from, 
    to,
    { adjusted: true, sort: 'asc', limit: 50000 }
  );
  
  return response.results.map(bar => ({
    timestamp: bar.t,
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
    vwap: bar.vw,
    trades: bar.n,
    ticker,
    timeframe: `${multiplier}${timespan[0].toUpperCase()}` as Timeframe,
  }));
}

// 获取期权链
export async function getOptionsChain(
  ticker: string,
  expirationDate: string
): Promise<OptionsContract[]> {
  const response = await client.options.snapshotOptionChain(ticker, {
    expiration_date: expirationDate,
  });
  
  return response.results.map(opt => ({
    ticker: opt.details.ticker,
    expiration: opt.details.expiration_date,
    strike: opt.details.strike_price,
    type: opt.details.contract_type as 'call' | 'put',
    bid: opt.last_quote?.bid || 0,
    ask: opt.last_quote?.ask || 0,
    last: opt.day?.close || 0,
    volume: opt.day?.volume || 0,
    openInterest: opt.open_interest || 0,
    impliedVolatility: opt.implied_volatility || 0,
    delta: opt.greeks?.delta || 0,
    gamma: opt.greeks?.gamma || 0,
    theta: opt.greeks?.theta || 0,
    vega: opt.greeks?.vega || 0,
    rho: opt.greeks?.rho || 0,
    inTheMoney: opt.details.contract_type === 'call' 
      ? opt.details.strike_price < opt.underlying_asset.price
      : opt.details.strike_price > opt.underlying_asset.price,
  }));
}
```

### Yahoo Finance 备用方案 (免费)

```typescript
// src/services/market-data/yahoo.ts
// 用 yahoo-finance2 npm 包作为备用数据源

import yahooFinance from 'yahoo-finance2';

export async function getHistoricalData(ticker: string, period1: string, period2: string) {
  const result = await yahooFinance.historical(ticker, {
    period1,
    period2,
    interval: '1d',
  });
  
  return result.map(bar => ({
    timestamp: bar.date.getTime(),
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
    volume: bar.volume,
    ticker,
    timeframe: '1D' as Timeframe,
  }));
}
```

---

## 缓存策略

### 三层缓存架构

```
Layer 1: React Query 内存缓存 (热数据)
  ↓ miss
Layer 2: IndexedDB 本地存储 (温数据)  
  ↓ miss
Layer 3: PostgreSQL + API 调用 (冷数据)
```

### 缓存管理器

```typescript
// src/services/market-data/cache.ts

class MarketDataCache {
  private memoryCache = new Map<string, { data: OHLCVBar[], expires: number }>();
  
  private getCacheKey(ticker: string, timeframe: string, from: string, to: string): string {
    return `${ticker}:${timeframe}:${from}:${to}`;
  }
  
  async get(ticker: string, timeframe: string, from: string, to: string): Promise<OHLCVBar[] | null> {
    const key = this.getCacheKey(ticker, timeframe, from, to);
    
    // L1: 内存
    const memHit = this.memoryCache.get(key);
    if (memHit && memHit.expires > Date.now()) return memHit.data;
    
    // L2: IndexedDB
    const idbHit = await this.getFromIndexedDB(key);
    if (idbHit) {
      this.memoryCache.set(key, { data: idbHit, expires: Date.now() + 300000 });
      return idbHit;
    }
    
    return null; // L3: 需要 API 调用
  }
  
  async set(ticker: string, timeframe: string, from: string, to: string, data: OHLCVBar[]) {
    const key = this.getCacheKey(ticker, timeframe, from, to);
    
    // 写入 L1
    this.memoryCache.set(key, { data, expires: Date.now() + 300000 }); // 5 分钟
    
    // 写入 L2
    await this.saveToIndexedDB(key, data);
  }
}
```

---

## 预加载的股票列表

### 核心训练股票 (Phase 1 — 50只)

**科技巨头**: AAPL, MSFT, GOOG, AMZN, META, NVDA, TSLA, AMD, INTC, CRM
**金融**: JPM, BAC, GS, MS, V, MA, BRK.B, C, WFC, AXP
**医疗**: UNH, JNJ, PFE, ABBV, MRK, LLY, TMO, ABT, BMY, AMGN
**消费**: WMT, COST, HD, NKE, SBUX, MCD, PG, KO, PEP, DIS
**ETF/指数**: SPY, QQQ, IWM, DIA, XLF, XLK, XLE, GLD, TLT, VIX

### 每只股票预加载:
- 5 年日线数据
- 1 年期权链 (月度到期)
- 基本面数据快照
- 关键事件/新闻时间戳

---

## 时间旅行引擎

Alpha Deck 的核心机制是**时间旅行** — 用户可以回到历史上任何一个交易日，从那一天开始"重新交易"。

```typescript
// src/services/market-data/time-travel.ts

interface TimeTravelSession {
  id: string;
  userId: string;
  ticker: string;
  startDate: string;        // 起始日期
  currentDate: string;       // 当前模拟日期
  endDate: string;           // 终止日期
  speed: number;             // 1x, 2x, 5x, 10x
  isPlaying: boolean;
  revealedBars: number;      // 已揭示的 K 线数量
}

class TimeTravelEngine {
  private session: TimeTravelSession;
  private allData: OHLCVBar[];
  private events: MarketEvent[];
  
  // 获取到当前时间点为止的可见数据
  getVisibleData(): OHLCVBar[] {
    return this.allData.slice(0, this.session.revealedBars);
  }
  
  // 获取当前时间点之前的事件
  getVisibleEvents(): MarketEvent[] {
    const currentTimestamp = this.allData[this.session.revealedBars - 1]?.timestamp;
    return this.events.filter(e => e.timestamp <= currentTimestamp);
  }
  
  // 前进一根 K 线
  advance(): { bar: OHLCVBar, events: MarketEvent[] } {
    this.session.revealedBars++;
    const newBar = this.allData[this.session.revealedBars - 1];
    const newEvents = this.events.filter(
      e => e.timestamp > this.allData[this.session.revealedBars - 2]?.timestamp 
        && e.timestamp <= newBar.timestamp
    );
    return { bar: newBar, events: newEvents };
  }
  
  // 自动播放
  play(speed: number = 1) {
    this.session.speed = speed;
    this.session.isPlaying = true;
  }
  
  pause() {
    this.session.isPlaying = false;
  }
}
```

---

## 数据质量保证

### 数据清洗规则
1. **拆分/合并调整**: 所有价格都经过 adjusted close 处理
2. **异常值过滤**: 日涨跌幅 > 50% 的标记为异常 (除了已知事件)
3. **缺失数据填充**: 非交易日 (节假日) 使用前一日收盘价
4. **时区统一**: 全部转换为 US/Eastern
5. **成交量验证**: 零成交量的 bar 标记但不删除

### 数据验证检查清单
- [ ] OHLC 关系: Low ≤ Open,Close ≤ High
- [ ] 时间连续性: 没有重复或跳跃的 bar
- [ ] 成交量合理性: 与 30 日均量偏差 < 10x
- [ ] 价格连续性: 与前一日收盘价偏差 < 20% (排除已知事件)
