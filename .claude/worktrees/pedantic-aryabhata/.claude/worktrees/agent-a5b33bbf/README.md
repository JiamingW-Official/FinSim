# ALPHA DECK — Trading Flight Simulator

> "Bloomberg Terminal meets Flight Simulator" — 一个让普通人用真实历史数据练习投资的沉浸式交易训练平台。

---

## 项目愿景

Alpha Deck 不是一个普通的股票模拟器。它是一个**交易飞行模拟器** — 就像飞行员在 Flight Simulator 里训练一样，交易者在这里用真实的历史数据、真实的价格反应、真实的市场事件来磨练技术。

**核心理念：**
- 🎮 **游戏化交易教育** — XP、等级、任务系统让学习上瘾
- 📊 **专业级工具** — 初学者的 Bloomberg Terminal，TradingView 的可玩版
- 🏆 **社交竞技** — 排行榜、PvP 对战、社区策略分享
- 📈 **100% 真实数据** — 所有价格走势基于历史真实数据，不是随机生成
- 🧠 **AI 教练** — 实时分析你的交易，指出错误，推荐策略

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| Frontend | Next.js 15 (App Router) + TypeScript | SSR、路由、性能 |
| UI | Tailwind CSS + shadcn/ui + Framer Motion | 专业暗色终端美学 |
| 图表引擎 | Lightweight Charts (TradingView) + D3.js | 专业K线图+自定义可视化 |
| 状态管理 | Zustand + React Query | 全局状态 + 服务端缓存 |
| 后端 | Next.js API Routes + tRPC | 类型安全的全栈通信 |
| 数据库 | PostgreSQL (Supabase) + Drizzle ORM | 用户数据、交易记录、排行榜 |
| 实时通信 | Supabase Realtime / Socket.io | 实时排行榜、多人对战 |
| 市场数据 | Polygon.io / Alpha Vantage / Yahoo Finance | 真实历史 OHLCV + 期权数据 |
| 认证 | NextAuth.js / Clerk | 社交登录 |
| AI | Anthropic Claude API | 交易教练、策略分析 |
| 部署 | Vercel + Supabase | 全球 CDN |

---

## 项目结构

```
alpha-deck/
├── README.md                     # 本文件
├── docs/
│   ├── 01-ARCHITECTURE.md        # 系统架构设计
│   ├── 02-DATA-ENGINE.md         # 市场数据引擎
│   ├── 03-CHART-ENGINE.md        # 图表引擎 + 技术分析
│   ├── 04-TRADING-ENGINE.md      # 交易执行引擎
│   ├── 05-OPTIONS-ENGINE.md      # 期权定价 + 策略
│   ├── 06-GAME-MECHANICS.md      # 游戏化系统设计
│   ├── 07-AI-COACH.md            # AI 教练系统
│   ├── 08-SOCIAL-VIRAL.md        # 社交传播 + 排行榜
│   ├── 09-DATABASE-SCHEMA.md     # 数据库设计
│   ├── 10-API-DESIGN.md          # API 接口设计
│   ├── 11-DEPLOYMENT.md          # 部署 + DevOps
│   └── 12-ROADMAP.md             # 开发路线图
├── CLAUDE-CODE-PROMPT.md         # Claude Code Agent 启动 Prompt
├── src/                          # 源代码 (待生成)
├── prisma/                       # 数据库 Schema
└── public/                       # 静态资源
```

---

## 快速开始

详见 `CLAUDE-CODE-PROMPT.md` — 该文件是一个完整的 prompt，可以直接发送给 Claude Code agent 开始构建整个项目。

---

## MVP 阶段划分

### Phase 1: Core Engine (Week 1-2)
- 项目脚手架 (Next.js + TypeScript + Tailwind)
- 历史数据获取管道 (Polygon.io API)
- K线图引擎 (TradingView Lightweight Charts)
- 基本交易执行 (买入/卖出/P&L)

### Phase 2: Analysis Tools (Week 3-4)
- 完整技术分析指标库
- 期权定价引擎 (Black-Scholes)
- 期权链 UI + Greeks 展示
- 订单类型 (Market/Limit/Stop/Trailing Stop)

### Phase 3: Game Layer (Week 5-6)
- XP/等级/任务系统
- 交易挑战 (教学关卡)
- AI 教练集成
- 成就系统 + 徽章

### Phase 4: Social & Viral (Week 7-8)
- 用户认证 + 个人资料
- 全球排行榜
- 策略分享 + 社区
- 社交传播机制 (截图分享、挑战赛)
- 多人 PvP 对战模式

---

## 许可证

Private — All Rights Reserved
