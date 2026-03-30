# 01 — 系统架构设计

## 总体架构

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js)                          │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ │
│  │  Chart   │ │  Trading │ │  Options │ │  Game  │ │  Social  │ │
│  │  Engine  │ │  Panel   │ │  Chain   │ │  Layer │ │  Layer   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘ └────┬─────┘ │
│       │            │            │            │           │       │
│  ┌────┴────────────┴────────────┴────────────┴───────────┴────┐  │
│  │                  Zustand Global Store                       │  │
│  │  (portfolio, positions, orders, gameState, preferences)     │  │
│  └────────────────────────┬───────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │ tRPC / React Query
┌───────────────────────────┼──────────────────────────────────────┐
│                     API LAYER (Next.js API Routes)               │
│  ┌─────────────┐ ┌───────┴──────┐ ┌────────────┐ ┌────────────┐│
│  │ Market Data │ │   Trading    │ │   Options   │ │    Game    ││
│  │   Service   │ │   Service    │ │   Service   │ │   Service  ││
│  └──────┬──────┘ └──────┬───────┘ └──────┬─────┘ └──────┬─────┘│
└─────────┼───────────────┼────────────────┼──────────────┼───────┘
          │               │                │              │
┌─────────┼───────────────┼────────────────┼──────────────┼───────┐
│         ▼               ▼                ▼              ▼       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ ┌───────────┐  │
│  │ Polygon.io │  │ PostgreSQL │  │  BS Engine │ │  Claude   │  │
│  │ Yahoo Fin  │  │ (Supabase) │  │  (Pricing) │ │    API    │  │
│  └────────────┘  └────────────┘  └────────────┘ └───────────┘  │
│                     DATA LAYER                                   │
└──────────────────────────────────────────────────────────────────┘
```

## 核心模块职责

### 1. Market Data Service (`/src/services/market-data/`)
- 从 Polygon.io / Yahoo Finance 拉取历史 OHLCV 数据
- 本地缓存 + 增量更新策略
- 数据标准化管道 (统一格式、时区处理、拆分/合并调整)
- 支持多时间周期: 1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M

### 2. Chart Engine (`/src/components/chart/`)
- 基于 TradingView Lightweight Charts 的高性能 K 线图
- 自定义指标叠加层 (通过 D3.js)
- 交互系统: 十字光标、缩放、拖拽、测量工具
- 多图表布局支持

### 3. Trading Engine (`/src/services/trading/`)
- 订单管理系统 (OMS)
- 订单匹配引擎 (使用历史数据模拟真实成交)
- 风控系统 (保证金、最大仓位、风险限额)
- P&L 实时计算

### 4. Options Engine (`/src/services/options/`)
- Black-Scholes + 二叉树定价模型
- Greeks 实时计算
- 隐含波动率曲面
- 策略构建器 (预设 + 自定义)

### 5. Game Engine (`/src/services/game/`)
- XP/等级系统
- 任务/挑战管理器
- 成就解锁引擎
- 奖励分配系统

### 6. Social Engine (`/src/services/social/`)
- 排行榜 (实时 + 历史)
- 策略分享 + 克隆
- PvP 对战匹配
- 社交传播 (Open Graph 截图生成)

---

## 文件夹结构 (详细)

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局 (暗色主题、字体)
│   ├── page.tsx                  # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard 布局 (侧边栏+顶栏)
│   │   ├── trade/page.tsx        # 主交易界面
│   │   ├── options/page.tsx      # 期权交易界面
│   │   ├── portfolio/page.tsx    # 投资组合分析
│   │   ├── backtest/page.tsx     # 回测引擎
│   │   ├── missions/page.tsx     # 任务中心
│   │   ├── leaderboard/page.tsx  # 排行榜
│   │   ├── learn/page.tsx        # 教学中心
│   │   └── settings/page.tsx     # 设置
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts  # tRPC 路由
│   │   ├── market-data/route.ts  # 市场数据 API
│   │   ├── og/route.tsx          # OG 图片生成
│   │   └── webhook/route.ts      # Webhook 处理
│   └── pvp/
│       └── [room]/page.tsx       # PvP 对战房间
│
├── components/
│   ├── chart/
│   │   ├── CandlestickChart.tsx  # 核心 K 线图组件
│   │   ├── IndicatorOverlay.tsx  # 指标叠加层
│   │   ├── ChartToolbar.tsx      # 图表工具栏
│   │   ├── DrawingTools.tsx      # 画线工具
│   │   ├── TimeframeSelector.tsx # 时间周期选择
│   │   └── MiniChart.tsx         # 迷你图 (Watchlist 用)
│   ├── trading/
│   │   ├── OrderEntry.tsx        # 下单面板
│   │   ├── OrderBook.tsx         # 订单簿展示
│   │   ├── PositionsTable.tsx    # 持仓表
│   │   ├── TradeHistory.tsx      # 交易历史
│   │   └── QuickTrade.tsx        # 一键交易
│   ├── options/
│   │   ├── OptionsChain.tsx      # 期权链
│   │   ├── StrategyBuilder.tsx   # 策略构建器
│   │   ├── PayoffDiagram.tsx     # 盈亏图
│   │   ├── GreeksPanel.tsx       # Greeks 展示
│   │   └── IVSurface.tsx         # IV 曲面 3D
│   ├── game/
│   │   ├── XPBar.tsx             # 经验条
│   │   ├── LevelBadge.tsx        # 等级徽章
│   │   ├── MissionCard.tsx       # 任务卡片
│   │   ├── AchievementPopup.tsx  # 成就弹窗
│   │   ├── DailyChallenge.tsx    # 每日挑战
│   │   └── RewardAnimation.tsx   # 奖励动画
│   ├── social/
│   │   ├── Leaderboard.tsx       # 排行榜
│   │   ├── TraderProfile.tsx     # 交易者资料
│   │   ├── StrategyShare.tsx     # 策略分享卡
│   │   ├── PvPLobby.tsx          # 对战大厅
│   │   └── ShareCard.tsx         # 社交分享卡片
│   ├── ai/
│   │   ├── AICoach.tsx           # AI 教练面板
│   │   ├── TradeReview.tsx       # 交易复盘
│   │   └── MarketBrief.tsx       # 市场简报
│   ├── layout/
│   │   ├── TopBar.tsx            # 顶部导航
│   │   ├── Sidebar.tsx           # 侧边栏
│   │   ├── Watchlist.tsx         # 自选列表
│   │   └── StatusBar.tsx         # 底部状态栏
│   └── ui/                       # shadcn/ui 组件
│
├── services/
│   ├── market-data/
│   │   ├── polygon.ts            # Polygon.io API 客户端
│   │   ├── yahoo.ts              # Yahoo Finance 备用
│   │   ├── cache.ts              # 数据缓存层
│   │   ├── normalizer.ts         # 数据标准化
│   │   └── types.ts              # 数据类型定义
│   ├── trading/
│   │   ├── order-manager.ts      # 订单管理
│   │   ├── matching-engine.ts    # 撮合引擎
│   │   ├── risk-manager.ts       # 风控管理
│   │   ├── pnl-calculator.ts     # 盈亏计算
│   │   └── types.ts
│   ├── options/
│   │   ├── black-scholes.ts      # BS 定价
│   │   ├── binomial-tree.ts      # 二叉树模型
│   │   ├── greeks.ts             # Greeks 计算
│   │   ├── iv-solver.ts          # 隐含波动率求解
│   │   ├── strategy-builder.ts   # 策略构建
│   │   └── types.ts
│   ├── indicators/
│   │   ├── moving-averages.ts    # SMA, EMA, WMA, DEMA
│   │   ├── oscillators.ts        # RSI, Stochastic, CCI
│   │   ├── trend.ts              # MACD, ADX, Parabolic SAR
│   │   ├── volatility.ts         # BB, ATR, Keltner
│   │   ├── volume.ts             # VWAP, OBV, A/D Line
│   │   └── index.ts              # 统一导出
│   ├── game/
│   │   ├── xp-engine.ts          # XP 计算引擎
│   │   ├── level-system.ts       # 等级系统
│   │   ├── mission-manager.ts    # 任务管理
│   │   ├── achievement-engine.ts # 成就引擎
│   │   └── types.ts
│   ├── ai/
│   │   ├── coach.ts              # AI 教练核心
│   │   ├── prompts.ts            # 系统 prompts
│   │   ├── trade-analyzer.ts     # 交易分析
│   │   └── market-narrator.ts    # 市场解说
│   └── social/
│       ├── leaderboard.ts        # 排行榜服务
│       ├── pvp-engine.ts         # PvP 引擎
│       ├── share-generator.ts    # 分享图生成
│       └── types.ts
│
├── stores/
│   ├── trading-store.ts          # 交易相关状态
│   ├── chart-store.ts            # 图表相关状态
│   ├── game-store.ts             # 游戏相关状态
│   └── user-store.ts             # 用户相关状态
│
├── hooks/
│   ├── useMarketData.ts          # 市场数据 Hook
│   ├── useTrade.ts               # 交易 Hook
│   ├── useOptions.ts             # 期权 Hook
│   ├── useIndicators.ts          # 指标计算 Hook
│   ├── useGameState.ts           # 游戏状态 Hook
│   └── useTimeTravel.ts          # 时间旅行控制 Hook
│
├── lib/
│   ├── db.ts                     # 数据库连接
│   ├── auth.ts                   # 认证配置
│   ├── trpc.ts                   # tRPC 配置
│   └── utils.ts                  # 工具函数
│
└── types/
    ├── market.ts                 # 市场数据类型
    ├── trading.ts                # 交易类型
    ├── options.ts                # 期权类型
    ├── game.ts                   # 游戏类型
    └── social.ts                 # 社交类型
```

---

## 关键设计决策

### 1. 为什么选择 Next.js 而不是纯 React?
- SSR 提升首屏加载速度 (SEO 也需要，为了病毒传播)
- API Routes 可以直接处理后端逻辑
- App Router 的并行路由适合复杂布局
- Vercel 部署零配置

### 2. 为什么用 Zustand 而不是 Redux?
- 交易应用需要极低延迟的状态更新
- Zustand 没有 Provider 包裹，性能更好
- 代码量少 80%，适合快速迭代
- 支持中间件 (persist, devtools, immer)

### 3. 数据获取策略
- **热数据** (当前显示的股票): React Query + 内存缓存
- **温数据** (最近访问): IndexedDB 本地存储
- **冷数据** (历史回测): 按需从 API 加载 + 流式传输

### 4. 性能目标
- 图表渲染: < 16ms per frame (60fps)
- 订单执行: < 50ms 反馈
- 页面加载: < 1.5s LCP
- 数据刷新: < 200ms

---

## 环境变量

```env
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
POLYGON_API_KEY=...
ALPHA_VANTAGE_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```
