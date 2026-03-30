# 09 — 数据库设计

## Schema (PostgreSQL + Drizzle ORM)

```typescript
// prisma/schema.prisma 或 src/db/schema.ts (Drizzle)

// ── 用户 ──
users
  id              UUID PRIMARY KEY
  email           VARCHAR UNIQUE NOT NULL
  username        VARCHAR(30) UNIQUE NOT NULL
  display_name    VARCHAR(100)
  avatar_url      TEXT
  level           INT DEFAULT 1
  xp              INT DEFAULT 0
  league          ENUM('bronze','silver','gold','diamond','alpha') DEFAULT 'bronze'
  initial_capital DECIMAL(12,2) DEFAULT 100000
  cash_balance    DECIMAL(12,2) DEFAULT 100000
  created_at      TIMESTAMP DEFAULT NOW()
  last_active     TIMESTAMP

// ── 持仓 ──
positions
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  ticker          VARCHAR(10) NOT NULL
  quantity        INT NOT NULL
  avg_price       DECIMAL(10,2) NOT NULL
  side            ENUM('long','short')
  opened_at       TIMESTAMP
  simulation_date DATE  -- 模拟中的日期

// ── 期权持仓 ──
options_positions
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  ticker          VARCHAR(10)
  strike          DECIMAL(10,2)
  expiry          DATE
  type            ENUM('call','put')
  side            ENUM('long','short')
  quantity        INT
  entry_price     DECIMAL(10,4)
  opened_at       TIMESTAMP

// ── 订单 ──
orders
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  ticker          VARCHAR(10)
  side            ENUM('buy','sell')
  type            ENUM('market','limit','stop','stop_limit','trailing_stop')
  quantity        INT
  price           DECIMAL(10,2)
  stop_price      DECIMAL(10,2)
  status          ENUM('open','filled','partial','cancelled','rejected')
  filled_qty      INT DEFAULT 0
  avg_fill_price  DECIMAL(10,2)
  created_at      TIMESTAMP
  filled_at       TIMESTAMP

// ── 交易历史 ──
trades
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  ticker          VARCHAR(10)
  side            ENUM('buy','sell')
  quantity        INT
  price           DECIMAL(10,2)
  pnl             DECIMAL(12,2)
  commission      DECIMAL(8,2)
  simulation_date DATE
  executed_at     TIMESTAMP

// ── 投资组合快照 (每日) ──
portfolio_snapshots
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  date            DATE
  equity          DECIMAL(12,2)
  cash            DECIMAL(12,2)
  positions_value DECIMAL(12,2)
  daily_pnl       DECIMAL(12,2)
  daily_return    DECIMAL(8,6)
  cumulative_return DECIMAL(8,6)

// ── 成就 ──
user_achievements
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  achievement_id  VARCHAR(50)
  unlocked_at     TIMESTAMP

// ── 任务进度 ──
user_missions
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  mission_id      VARCHAR(50)
  progress        JSONB
  completed       BOOLEAN DEFAULT FALSE
  completed_at    TIMESTAMP

// ── 排行榜 (物化视图 + 缓存) ──
leaderboard_cache
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  period          ENUM('daily','weekly','monthly','all_time')
  metric          ENUM('pnl','sharpe','winrate','xp','streak')
  value           DECIMAL(12,4)
  rank            INT
  updated_at      TIMESTAMP

// ── PvP 对战 ──
pvp_matches
  id              UUID PRIMARY KEY
  mode            ENUM('sync','async')
  scenario        JSONB
  status          ENUM('waiting','active','completed')
  created_by      UUID REFERENCES users(id)
  created_at      TIMESTAMP

pvp_participants
  match_id        UUID REFERENCES pvp_matches(id)
  user_id         UUID REFERENCES users(id)
  final_equity    DECIMAL(12,2)
  final_pnl       DECIMAL(12,2)
  result          ENUM('win','loss','draw')

// ── 策略分享 ──
shared_strategies
  id              UUID PRIMARY KEY
  user_id         UUID REFERENCES users(id)
  name            VARCHAR(100)
  description     TEXT
  strategy_config JSONB
  backtest_results JSONB
  likes           INT DEFAULT 0
  copies          INT DEFAULT 0
  created_at      TIMESTAMP

// ── 市场数据缓存 ──
market_data_cache
  ticker          VARCHAR(10)
  timeframe       VARCHAR(10)
  date            DATE
  data            JSONB  -- OHLCV array
  fetched_at      TIMESTAMP
  PRIMARY KEY (ticker, timeframe, date)
```

### 索引策略
```sql
CREATE INDEX idx_trades_user_date ON trades(user_id, simulation_date);
CREATE INDEX idx_positions_user ON positions(user_id) WHERE quantity > 0;
CREATE INDEX idx_leaderboard ON leaderboard_cache(period, metric, rank);
CREATE INDEX idx_snapshots_user_date ON portfolio_snapshots(user_id, date);
```

---

# 10 — API 设计

## tRPC 路由结构

```typescript
// src/server/routers/index.ts

export const appRouter = router({
  // 市场数据
  market: router({
    getBars: procedure.input(z.object({
      ticker: z.string(),
      timeframe: z.enum(['1m','5m','15m','1h','4h','1D','1W']),
      from: z.string(),
      to: z.string(),
    })).query(async ({ input }) => { /* ... */ }),
    
    getOptionsChain: procedure.input(z.object({
      ticker: z.string(),
      expiry: z.string(),
    })).query(async ({ input }) => { /* ... */ }),
    
    getQuote: procedure.input(z.object({ ticker: z.string() })).query(/* ... */),
    getFundamentals: procedure.input(z.object({ ticker: z.string() })).query(/* ... */),
    getEvents: procedure.input(z.object({ ticker: z.string(), from: z.string(), to: z.string() })).query(/* ... */),
  }),

  // 交易
  trading: router({
    submitOrder: procedure.input(OrderSchema).mutation(/* ... */),
    cancelOrder: procedure.input(z.object({ orderId: z.string() })).mutation(/* ... */),
    getPositions: procedure.query(/* ... */),
    getOrders: procedure.query(/* ... */),
    getTradeHistory: procedure.input(z.object({ limit: z.number().optional() })).query(/* ... */),
  }),

  // 期权
  options: router({
    getChain: procedure.input(z.object({ ticker: z.string(), expiry: z.string() })).query(/* ... */),
    submitOptionsOrder: procedure.input(OptionsOrderSchema).mutation(/* ... */),
    getPositions: procedure.query(/* ... */),
    priceOption: procedure.input(z.object({ S: z.number(), K: z.number(), T: z.number(), r: z.number(), sigma: z.number(), type: z.enum(['call','put']) })).query(/* ... */),
  }),

  // 投资组合
  portfolio: router({
    getSummary: procedure.query(/* ... */),
    getEquityCurve: procedure.query(/* ... */),
    getPerformanceMetrics: procedure.query(/* ... */),
    getSnapshot: procedure.input(z.object({ date: z.string() })).query(/* ... */),
  }),

  // 游戏
  game: router({
    getState: procedure.query(/* ... */),
    getMissions: procedure.query(/* ... */),
    getAchievements: procedure.query(/* ... */),
    claimReward: procedure.input(z.object({ rewardId: z.string() })).mutation(/* ... */),
  }),

  // 社交
  social: router({
    getLeaderboard: procedure.input(z.object({ period: z.string(), metric: z.string(), limit: z.number() })).query(/* ... */),
    getProfile: procedure.input(z.object({ userId: z.string() })).query(/* ... */),
    createChallenge: procedure.input(ChallengeSchema).mutation(/* ... */),
    joinPvP: procedure.input(z.object({ matchId: z.string() })).mutation(/* ... */),
    shareStrategy: procedure.input(StrategySchema).mutation(/* ... */),
  }),

  // AI
  ai: router({
    getTradeAdvice: procedure.input(z.object({ ticker: z.string(), side: z.string(), context: z.any() })).mutation(/* ... */),
    getPostTradeReview: procedure.input(z.object({ tradeId: z.string() })).mutation(/* ... */),
    getMorningBrief: procedure.query(/* ... */),
    askCoach: procedure.input(z.object({ question: z.string(), context: z.any() })).mutation(/* ... */),
  }),

  // 时间旅行
  timeTravel: router({
    createSession: procedure.input(z.object({ ticker: z.string(), startDate: z.string() })).mutation(/* ... */),
    advance: procedure.input(z.object({ sessionId: z.string(), bars: z.number() })).mutation(/* ... */),
    setSpeed: procedure.input(z.object({ sessionId: z.string(), speed: z.number() })).mutation(/* ... */),
  }),
});
```

---

# 11 — 部署

## 推荐架构

```
Vercel (Frontend + API)
  ├── Next.js App (Edge Runtime for API routes)
  ├── Vercel KV (Redis) — 排行榜缓存、Session
  └── Vercel Blob — OG 图片存储

Supabase (Database + Realtime)
  ├── PostgreSQL — 主数据库
  ├── Realtime — PvP 对战实时通信
  └── Auth — 用户认证 (替代 NextAuth)

External APIs
  ├── Polygon.io — 市场数据
  ├── Anthropic Claude — AI 教练
  └── Vercel OG — 社交图片生成
```

## 环境配置

```bash
# 开发
npm run dev          # http://localhost:3000

# 数据库迁移
npx drizzle-kit push

# 构建
npm run build

# 部署 (连接 Vercel)
vercel deploy --prod
```

---

# 12 — 开发路线图

## Phase 1: 核心引擎 (Week 1-2)

**目标: 可以看图、下单、看盈亏**

- [ ] Next.js 15 脚手架 + TypeScript + Tailwind + shadcn/ui
- [ ] 暗色终端主题 (JetBrains Mono, 深色背景, 绿/红色调)
- [ ] TradingView Lightweight Charts 集成
- [ ] Polygon.io / Yahoo Finance 数据获取管道
- [ ] 基础交易引擎 (Market Order buy/sell)
- [ ] 持仓管理 + P&L 计算
- [ ] 时间旅行控制器 (Play/Pause/Speed/Slider)
- [ ] Watchlist 组件 (10只核心股票)
- [ ] Zustand 全局状态

## Phase 2: 分析工具 (Week 3-4)

**目标: 完整的分析工具箱**

- [ ] 技术指标库 (SMA/EMA/RSI/MACD/BB/VWAP/ADX/Stoch)
- [ ] 指标叠加层 UI + 工具栏
- [ ] 子图表面板 (RSI/MACD/Volume 切换)
- [ ] 画线工具 (趋势线/水平线/斐波那契)
- [ ] Limit/Stop/Trailing Stop 订单
- [ ] 交易历史表格 + 导出
- [ ] 基本面数据面板 (PE/Revenue/Earnings)
- [ ] 新闻事件时间线

## Phase 3: 期权交易 (Week 5-6)

**目标: 完整的期权交易体验**

- [ ] Black-Scholes 定价引擎
- [ ] 期权链 UI (Call/Put 对称表格)
- [ ] Greeks 实时展示 + 颜色编码
- [ ] 期权下单面板
- [ ] 策略构建器 (预设 + 自定义)
- [ ] Payoff Diagram (盈亏图)
- [ ] IV Surface 3D 可视化
- [ ] 期权持仓管理

## Phase 4: 游戏化 (Week 7-8)

**目标: 让人上瘾的游戏循环**

- [ ] XP/等级系统
- [ ] 新手教程任务链
- [ ] 每日挑战
- [ ] 场景挑战 (历史事件复现)
- [ ] 成就/徽章系统
- [ ] 解锁系统 (功能随等级开放)
- [ ] 奖励动画 + 音效
- [ ] 用户认证 (Supabase Auth)
- [ ] 数据库持久化

## Phase 5: 社交 + AI (Week 9-10)

**目标: 病毒传播 + 智能辅助**

- [ ] AI 交易教练 (Claude API)
- [ ] 实时交易建议
- [ ] 交易复盘分析
- [ ] 全球排行榜
- [ ] 交易成绩卡 (可分享图片)
- [ ] 挑战赛链接
- [ ] PvP 对战 (异步)
- [ ] 策略分享市场
- [ ] OG 图片生成

## Phase 6: 打磨 + 发布 (Week 11-12)

**目标: 产品级质量**

- [ ] 性能优化 (图表 60fps, LCP < 1.5s)
- [ ] 移动端响应式
- [ ] 回测引擎 + 策略编辑器
- [ ] Trading Wrapped (年度总结)
- [ ] 完善教学内容
- [ ] Bug 修复 + 边缘情况处理
- [ ] Beta 测试
- [ ] Product Hunt 发布
- [ ] 小红书 / Twitter 发布素材制作
