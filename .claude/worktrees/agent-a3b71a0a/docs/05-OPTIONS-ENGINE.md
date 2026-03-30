# 05 — 期权定价引擎 + 策略系统

## Black-Scholes 定价模型

```typescript
// src/services/options/black-scholes.ts

// 标准正态分布 CDF
function normalCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const t = 1 / (1 + p * Math.abs(x) / Math.sqrt(2));
  const y = 1 - ((((a5*t+a4)*t+a3)*t+a2)*t+a1) * t * Math.exp(-x*x/2);
  return 0.5 * (1 + sign * y);
}

// 标准正态分布 PDF
function normalPDF(x: number): number {
  return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
}

export function blackScholes(
  S: number,   // 标的价格 (Spot)
  K: number,   // 行权价 (Strike)
  T: number,   // 到期时间 (年)
  r: number,   // 无风险利率
  sigma: number, // 波动率 (IV)
  type: 'call' | 'put'
): number {
  if (T <= 0) return Math.max(type === 'call' ? S - K : K - S, 0);
  
  const d1 = (Math.log(S/K) + (r + sigma**2/2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  
  if (type === 'call') {
    return S * normalCDF(d1) - K * Math.exp(-r*T) * normalCDF(d2);
  } else {
    return K * Math.exp(-r*T) * normalCDF(-d2) - S * normalCDF(-d1);
  }
}
```

## 完整 Greeks 计算

```typescript
// src/services/options/greeks.ts

export interface Greeks {
  delta: number;   // 价格敏感度 (dV/dS)
  gamma: number;   // Delta 变化率 (d²V/dS²)
  theta: number;   // 时间衰减 (dV/dt) — 每日
  vega: number;    // 波动率敏感度 (dV/dσ) — per 1% IV change
  rho: number;     // 利率敏感度 (dV/dr)
  // 二阶 Greeks
  vanna: number;   // dDelta/dIV = dVega/dS
  charm: number;   // dDelta/dt (Delta 随时间变化)
  vomma: number;   // dVega/dIV (Vega 凸性)
  speed: number;   // dGamma/dS
}

export function calculateGreeks(S: number, K: number, T: number, r: number, sigma: number, type: 'call' | 'put'): Greeks {
  const sqrtT = Math.sqrt(Math.max(T, 0.001));
  const d1 = (Math.log(S/K) + (r + sigma**2/2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  const nd1 = normalPDF(d1);
  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  
  // 一阶 Greeks
  const delta = type === 'call' ? Nd1 : Nd1 - 1;
  const gamma = nd1 / (S * sigma * sqrtT);
  
  const thetaCall = (-(S * nd1 * sigma) / (2 * sqrtT) - r * K * Math.exp(-r*T) * Nd2) / 365;
  const thetaPut = (-(S * nd1 * sigma) / (2 * sqrtT) + r * K * Math.exp(-r*T) * normalCDF(-d2)) / 365;
  const theta = type === 'call' ? thetaCall : thetaPut;
  
  const vega = S * nd1 * sqrtT / 100;
  const rho = type === 'call' 
    ? K * T * Math.exp(-r*T) * Nd2 / 100 
    : -K * T * Math.exp(-r*T) * normalCDF(-d2) / 100;

  // 二阶 Greeks
  const vanna = -nd1 * d2 / sigma;
  const charm = -nd1 * (2*r*T - d2*sigma*sqrtT) / (2*T*sigma*sqrtT);
  const vomma = vega * d1 * d2 / sigma;
  const speed = -gamma / S * (d1 / (sigma * sqrtT) + 1);

  return { delta, gamma, theta, vega, rho, vanna, charm, vomma, speed };
}
```

## 隐含波动率求解 (Newton-Raphson)

```typescript
// src/services/options/iv-solver.ts

export function solveIV(
  marketPrice: number, S: number, K: number, T: number, r: number, type: 'call' | 'put'
): number {
  let sigma = 0.3; // 初始猜测
  
  for (let i = 0; i < 100; i++) {
    const price = blackScholes(S, K, T, r, sigma, type);
    const vega = calculateGreeks(S, K, T, r, sigma, type).vega * 100; // 还原到实际 vega
    
    const diff = price - marketPrice;
    if (Math.abs(diff) < 0.001) break;
    if (vega === 0) break;
    
    sigma -= diff / vega;
    sigma = Math.max(0.01, Math.min(5, sigma)); // 限制范围
  }
  
  return sigma;
}
```

## 二叉树模型 (美式期权)

```typescript
// src/services/options/binomial-tree.ts

export function binomialTree(
  S: number, K: number, T: number, r: number, sigma: number,
  type: 'call' | 'put', steps: number = 100, american: boolean = true
): number {
  const dt = T / steps;
  const u = Math.exp(sigma * Math.sqrt(dt));
  const d = 1 / u;
  const p = (Math.exp(r * dt) - d) / (u - d);
  const disc = Math.exp(-r * dt);
  
  // 构建终端节点
  const prices: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const spotAtNode = S * Math.pow(u, steps - i) * Math.pow(d, i);
    prices[i] = type === 'call' 
      ? Math.max(spotAtNode - K, 0) 
      : Math.max(K - spotAtNode, 0);
  }
  
  // 反向归纳
  for (let step = steps - 1; step >= 0; step--) {
    for (let i = 0; i <= step; i++) {
      const hold = disc * (p * prices[i] + (1 - p) * prices[i + 1]);
      if (american) {
        const spotAtNode = S * Math.pow(u, step - i) * Math.pow(d, i);
        const exercise = type === 'call' 
          ? Math.max(spotAtNode - K, 0) 
          : Math.max(K - spotAtNode, 0);
        prices[i] = Math.max(hold, exercise);
      } else {
        prices[i] = hold;
      }
    }
  }
  
  return prices[0];
}
```

---

## 预设期权策略

| 策略 | 描述 | 最大盈利 | 最大亏损 | 适用场景 |
|------|------|---------|---------|---------|
| **Long Call** | 买入看涨期权 | 无限 | 权利金 | 强烈看涨 |
| **Long Put** | 买入看跌期权 | Strike - Premium | 权利金 | 强烈看跌 |
| **Covered Call** | 持股 + 卖出虚值 Call | Strike + Premium - 成本 | 入场成本 - Premium | 温和看涨 |
| **Protective Put** | 持股 + 买入 Put | 无限 (向上) | 有限 | 对冲下行风险 |
| **Bull Call Spread** | 买低行权Call + 卖高行权Call | 两行权价差 - 净权利金 | 净权利金 | 温和看涨 |
| **Bear Put Spread** | 买高行权Put + 卖低行权Put | 两行权价差 - 净权利金 | 净权利金 | 温和看跌 |
| **Iron Condor** | OTM Bull Put Spread + OTM Bear Call Spread | 净权利金收入 | 宽度 - 净权利金 | 低波动/横盘 |
| **Straddle** | ATM Call + ATM Put | 无限 | 总权利金 | 预期大波动 |
| **Strangle** | OTM Call + OTM Put | 无限 | 总权利金 | 预期大波动 (更便宜) |
| **Butterfly Spread** | 买1低+卖2中+买1高 | 中间行权价差 - 净权利金 | 净权利金 | 精确价格预测 |
| **Calendar Spread** | 卖近月 + 买远月 (同行权价) | Theta 差异 | 净权利金 | 时间价值套利 |
| **Jade Lizard** | Short Put + Short Call Spread | 净权利金 | Put 下方无限 | 看涨+卖波动 |
| **Iron Butterfly** | ATM 版 Iron Condor | 净权利金 | 宽度 - 净权利金 | 精确横盘预测 |

---

## 策略构建器 UI

```typescript
// src/components/options/StrategyBuilder.tsx

interface StrategyLeg {
  type: 'call' | 'put';
  side: 'buy' | 'sell';
  strike: number;
  expiry: string;
  quantity: number;
  price: number;
  greeks: Greeks;
}

interface Strategy {
  name: string;
  legs: StrategyLeg[];
  // 计算属性
  netDebit: number;        // 净支出
  maxProfit: number;       // 最大盈利
  maxLoss: number;         // 最大亏损
  breakevens: number[];    // 盈亏平衡点
  // 总 Greeks
  totalDelta: number;
  totalGamma: number;
  totalTheta: number;
  totalVega: number;
}
```

### Payoff Diagram (盈亏图)

使用 D3.js 或 Recharts 渲染：
- X轴: 标的价格 (当前价格 ± 30%)
- Y轴: 到期盈亏
- 叠加: 当前盈亏曲线 (非到期)
- 标注: 盈亏平衡点、最大盈利/亏损
- 交互: 拖动到期日滑块看时间对盈亏的影响

### IV Surface (波动率曲面)

3D 可视化:
- X轴: 行权价 / Moneyness
- Y轴: 到期时间
- Z轴: 隐含波动率
- 使用 Three.js 或 Plotly 渲染
- 展示 volatility smile / skew
