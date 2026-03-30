# 04 — 交易执行引擎

## 订单类型

### 基础订单
| 类型 | 说明 | 实现 |
|------|------|------|
| Market Order | 以当前价格立即成交 | 使用当前 bar 的 close 价成交 |
| Limit Order | 在指定价格或更优价格成交 | 每根新 bar 检查 high/low 是否触及限价 |
| Stop Order | 达到止损价后转为市价单 | 检查 high/low 是否穿越止损价 |
| Stop-Limit | 达到止损价后转为限价单 | 两阶段触发 |
| Trailing Stop | 跟踪最高点的动态止损 | 持续更新止损位 = max(price) - trail_amount |

### 高级订单
| 类型 | 说明 |
|------|------|
| OCO (One-Cancels-Other) | 止盈 + 止损，一个成交另一个自动取消 |
| Bracket Order | 入场 + 止盈 + 止损，三合一 |
| TWAP | 时间加权分批成交 |
| Iceberg | 大单分拆为小单 |

---

## 订单管理系统 (OMS)

```typescript
// src/services/trading/order-manager.ts

interface Order {
  id: string;
  userId: string;
  ticker: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  quantity: number;
  price?: number;          // limit price
  stopPrice?: number;      // stop trigger price
  trailAmount?: number;    // trailing stop offset
  trailPercent?: number;   // trailing stop %
  status: 'pending' | 'open' | 'partial' | 'filled' | 'cancelled' | 'rejected';
  filledQty: number;
  avgFillPrice: number;
  createdAt: number;
  filledAt?: number;
  timeInForce: 'day' | 'gtc' | 'ioc' | 'fok';
  linkedOrders?: string[]; // OCO / Bracket 关联
}

class OrderManager {
  private orders: Map<string, Order> = new Map();
  private pendingOrders: Order[] = [];

  submitOrder(order: Omit<Order, 'id' | 'status' | 'filledQty' | 'avgFillPrice' | 'createdAt'>): Order {
    // 1. 预检 (资金/持仓/风控)
    this.preTradeCheck(order);
    
    // 2. 创建订单
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      status: 'open',
      filledQty: 0,
      avgFillPrice: 0,
      createdAt: Date.now(),
    };
    
    // 3. 市价单立即执行
    if (order.type === 'market') {
      return this.executeMarketOrder(newOrder);
    }
    
    // 4. 其他类型放入待处理队列
    this.pendingOrders.push(newOrder);
    this.orders.set(newOrder.id, newOrder);
    return newOrder;
  }

  // 每根新 K 线调用 — 检查所有待处理订单
  onNewBar(bar: OHLCVBar): Order[] {
    const filledOrders: Order[] = [];
    
    this.pendingOrders = this.pendingOrders.filter(order => {
      if (order.ticker !== bar.ticker) return true;
      
      const filled = this.checkOrderFill(order, bar);
      if (filled) {
        filledOrders.push(filled);
        // 处理 OCO 关联订单
        if (order.linkedOrders) {
          order.linkedOrders.forEach(id => this.cancelOrder(id));
        }
        return false;
      }
      
      // 更新 trailing stop
      if (order.type === 'trailing_stop') {
        this.updateTrailingStop(order, bar);
      }
      
      return true;
    });
    
    return filledOrders;
  }

  private checkOrderFill(order: Order, bar: OHLCVBar): Order | null {
    switch (order.type) {
      case 'limit':
        if (order.side === 'buy' && bar.low <= order.price!) {
          return this.fillOrder(order, Math.min(order.price!, bar.open));
        }
        if (order.side === 'sell' && bar.high >= order.price!) {
          return this.fillOrder(order, Math.max(order.price!, bar.open));
        }
        break;
      case 'stop':
        if (order.side === 'sell' && bar.low <= order.stopPrice!) {
          return this.fillOrder(order, order.stopPrice!); // 简化：以止损价成交
        }
        if (order.side === 'buy' && bar.high >= order.stopPrice!) {
          return this.fillOrder(order, order.stopPrice!);
        }
        break;
      case 'trailing_stop':
        if (order.side === 'sell' && bar.low <= order.stopPrice!) {
          return this.fillOrder(order, order.stopPrice!);
        }
        break;
    }
    return null;
  }
}
```

---

## 撮合引擎

### 滑点模拟

真实交易不会精确以目标价成交。Alpha Deck 模拟真实滑点：

```typescript
// src/services/trading/matching-engine.ts

class MatchingEngine {
  // 模拟滑点
  calculateSlippage(order: Order, bar: OHLCVBar): number {
    const spreadBps = this.estimateSpread(bar);  // 预估买卖价差 (基点)
    const impactBps = this.marketImpact(order, bar); // 市场冲击
    const totalSlippage = (spreadBps + impactBps) / 10000;
    
    return order.side === 'buy' 
      ? bar.close * (1 + totalSlippage) 
      : bar.close * (1 - totalSlippage);
  }
  
  // 基于成交量和价格估算价差
  private estimateSpread(bar: OHLCVBar): number {
    if (bar.volume > 5000000) return 1;   // 高流动性: 0.01%
    if (bar.volume > 1000000) return 3;   // 中流动性: 0.03%
    if (bar.volume > 100000) return 8;    // 低流动性: 0.08%
    return 15;                             // 极低流动性: 0.15%
  }
  
  // 大单的市场冲击
  private marketImpact(order: Order, bar: OHLCVBar): number {
    const participation = (order.quantity * bar.close) / (bar.volume * bar.close);
    if (participation < 0.001) return 0;   // < 0.1% 无冲击
    if (participation < 0.01) return 2;    // < 1% 轻微冲击
    if (participation < 0.05) return 8;    // < 5% 显著冲击
    return 20;                              // > 5% 严重冲击
  }
}
```

### 手续费模拟

```typescript
interface CommissionStructure {
  stock: {
    perShare: number;      // $0.005/share
    minimum: number;       // $1.00 minimum
    maximum: number;       // $1% of trade value
  };
  options: {
    perContract: number;   // $0.65/contract
    assignment: number;    // $0 for assignment
    exercise: number;      // $0 for exercise
  };
  // SEC fee, TAF fee 等监管费用
  regulatoryFees: {
    secFee: number;        // $8/million (卖出)
    tafFee: number;        // $0.000119/share
  };
}
```

---

## 风控系统

```typescript
// src/services/trading/risk-manager.ts

interface RiskLimits {
  maxPositionSize: number;        // 单一持仓最大占比: 25%
  maxPortfolioLeverage: number;   // 最大杠杆: 1x (无保证金)
  maxDailyLoss: number;           // 日最大亏损: 5%
  maxDrawdown: number;            // 最大回撤限制: 20%
  maxOpenOrders: number;          // 最大挂单数: 50
  maxConcentration: number;       // 单板块集中度: 40%
}

class RiskManager {
  checkPreTrade(order: Order, portfolio: Portfolio): RiskCheckResult {
    const checks = [
      this.checkFunds(order, portfolio),
      this.checkPositionSize(order, portfolio),
      this.checkConcentration(order, portfolio),
      this.checkDailyLoss(portfolio),
      this.checkMaxDrawdown(portfolio),
    ];
    
    const failures = checks.filter(c => !c.passed);
    return {
      allowed: failures.length === 0,
      warnings: checks.filter(c => c.warning).map(c => c.message),
      rejections: failures.map(c => c.message),
    };
  }
}
```

---

## P&L 计算引擎

```typescript
// src/services/trading/pnl-calculator.ts

interface PnLReport {
  // 单笔交易
  realized: number;          // 已实现盈亏
  unrealized: number;        // 未实现盈亏
  totalReturn: number;       // 总收益率
  
  // 投资组合
  portfolioValue: number;    // 投资组合总值
  cashBalance: number;       // 现金余额
  equity: number;            // 净值 (现金 + 持仓)
  
  // 风险指标
  sharpeRatio: number;       // 夏普比率
  sortinoRatio: number;      // 索提诺比率
  maxDrawdown: number;       // 最大回撤
  calmarRatio: number;       // 卡尔马比率
  winRate: number;           // 胜率
  profitFactor: number;      // 盈亏比
  avgWin: number;            // 平均盈利
  avgLoss: number;           // 平均亏损
  expectancy: number;        // 期望值
  
  // 时间序列
  equityCurve: { date: string; value: number }[];
  dailyReturns: number[];
  drawdownSeries: number[];
}

class PnLCalculator {
  // 夏普比率 = (年化收益 - 无风险利率) / 年化标准差
  static sharpeRatio(dailyReturns: number[], riskFreeRate = 0.05): number {
    const avgReturn = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
    const std = Math.sqrt(dailyReturns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / dailyReturns.length);
    const annualizedReturn = avgReturn * 252;
    const annualizedStd = std * Math.sqrt(252);
    return annualizedStd === 0 ? 0 : (annualizedReturn - riskFreeRate) / annualizedStd;
  }
  
  // 最大回撤
  static maxDrawdown(equityCurve: number[]): number {
    let peak = equityCurve[0];
    let maxDD = 0;
    for (const value of equityCurve) {
      if (value > peak) peak = value;
      const dd = (peak - value) / peak;
      if (dd > maxDD) maxDD = dd;
    }
    return maxDD;
  }
}
```

---

## 回测引擎

```typescript
// src/services/trading/backtester.ts

interface BacktestConfig {
  ticker: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  strategy: TradingStrategy;
  commissionModel: CommissionStructure;
  slippageModel: 'none' | 'fixed' | 'volume_based';
}

interface TradingStrategy {
  name: string;
  // 每根 bar 调用，返回交易信号
  onBar(bar: OHLCVBar, indicators: IndicatorValues, portfolio: Portfolio): Signal[];
  // 参数
  params: Record<string, number>;
}

// 预设策略模板
const STRATEGY_TEMPLATES = {
  'SMA_CROSSOVER': {
    name: 'SMA Crossover',
    params: { fastPeriod: 10, slowPeriod: 30 },
    onBar(bar, indicators, portfolio) {
      const smaFast = indicators.sma[this.params.fastPeriod];
      const smaSlow = indicators.sma[this.params.slowPeriod];
      if (smaFast > smaSlow && !portfolio.hasPosition(bar.ticker)) {
        return [{ type: 'buy', quantity: 100 }];
      }
      if (smaFast < smaSlow && portfolio.hasPosition(bar.ticker)) {
        return [{ type: 'sell', quantity: 'all' }];
      }
      return [];
    },
  },
  'RSI_REVERSION': { /* ... */ },
  'BOLLINGER_BREAKOUT': { /* ... */ },
  'MACD_MOMENTUM': { /* ... */ },
};
```
