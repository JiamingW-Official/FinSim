# 08 — 社交传播 + 排行榜

## 病毒传播机制

### 1. 交易成绩卡 (Trade Card)

每笔有趣的交易自动生成可分享的卡片：

```
┌─────────────────────────────────┐
│  α ALPHA DECK                   │
│                                 │
│  🔥 jiaming_trades              │
│  NVDA Long  |  +$2,847 (+18.3%)│
│                                 │
│  [迷你K线图显示入场和出场点]       │
│                                 │
│  Entry: $285.40  │  Exit: $337.6│
│  Hold: 12 days   │  RSI Signal  │
│                                 │
│  LVL 23 ⚡ | Sharpe: 1.84      │
│  🏆 Rank #142 Global            │
│                                 │
│  Can you beat this? →           │
│  alphadeck.gg/challenge/abc123  │
└─────────────────────────────────┘
```

可分享到: Twitter/X, 小红书, Discord, WeChat, Instagram Stories

### 2. 挑战赛链接

用户可以创建挑战链接，朋友点击后进入相同的历史场景：

- "我在 2020 COVID 崩盘中赚了 +45%，你能超过我吗？"
- 链接包含: 起始日期、结束日期、初始资金、用户成绩
- 朋友完成后自动对比结果

### 3. 排行榜系统

#### 全局排行榜维度
| 排行榜 | 排序依据 | 周期 |
|--------|---------|------|
| 总收益 | Total P&L | All-time / Monthly / Weekly |
| 夏普比率 | Risk-adjusted | Monthly |
| 胜率 | Win Rate (min 20 trades) | Monthly |
| 期权大师 | Options P&L | Monthly |
| 连胜王 | Longest streak | All-time |
| 速度赛 | 最快达到 +10% | All-time |
| 风控王 | 最小 Max Drawdown | Monthly |
| XP | 总经验值 | All-time |

#### 联赛系统

```
🥉 Bronze League    — LVL 1-10   (新手保护池)
🥈 Silver League    — LVL 11-20  
🥇 Gold League      — LVL 21-35
💎 Diamond League   — LVL 36-50
👑 Alpha League     — LVL 51+    (顶尖玩家)
```

每周根据表现升降级，营造竞争氛围。

### 4. PvP 对战模式

两种模式:

**同步对战**: 两个玩家在相同的历史时段、相同的股票池里交易。谁在结束时 P&L 更高谁赢。

**异步挑战**: 玩家完成一个场景后，成绩存储。其他玩家可以挑战这个成绩。

```typescript
interface PvPMatch {
  id: string;
  mode: 'sync' | 'async';
  players: string[];
  scenario: {
    tickers: string[];
    startDate: string;
    endDate: string;
    initialCapital: number;
  };
  stakes: {
    xpBet: number;        // 下注的 XP
    badgeReward?: string;  // 特殊徽章
  };
  results: {
    [playerId: string]: {
      finalEquity: number;
      totalPnL: number;
      sharpeRatio: number;
      tradesCount: number;
    };
  };
}
```

### 5. 社区策略市场

用户可以发布和分享策略:
- 策略描述 + 回测结果
- 复制交易 (Copy Trading) — 跟单别人的策略
- 评分 + 评论系统
- "Fork" 别人的策略并修改

---

## 社交传播策略

### Open Graph 图片生成

```typescript
// src/app/api/og/route.tsx — 使用 Vercel OG

import { ImageResponse } from 'next/og';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker');
  const pnl = searchParams.get('pnl');
  const username = searchParams.get('user');
  
  return new ImageResponse(
    // 动态生成带交易数据的 OG 图
    <div style={{ /* 精美卡片设计 */ }}>
      <h1>Alpha Deck</h1>
      <p>{username} earned {pnl}% on {ticker}</p>
      <p>Can you beat this?</p>
    </div>,
    { width: 1200, height: 630 }
  );
}
```

### 用户增长飞轮

```
用户交易 → 生成成绩卡 → 分享到社交媒体
                ↓
        朋友看到 → 点击挑战链接 → 注册
                ↓
        新用户交易 → 生成新成绩卡 → 继续分享
```

### 关键转化钩子

1. **"Can you beat this?"** — 每张交易卡底部的 CTA
2. **"Trading Wrapped"** — 月度/年度交易总结 (类似 Spotify Wrapped)
3. **"Guess the Chart"** — 社交小游戏，猜测下一根 K 线方向
4. **"Live Tournament"** — 限时赛事，直播排行榜变动
