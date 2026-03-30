# 06 — 游戏化系统设计

## 核心设计哲学

> "让人上瘾学交易，而不是上瘾赌博。"

Alpha Deck 的游戏化不是把交易变成赌场，而是用游戏机制**奖励正确的交易行为**：风控、纪律、分析、学习。

---

## XP & 等级系统

### XP 获取来源

| 行为 | XP | 说明 |
|------|-----|------|
| 完成一笔盈利交易 | +50 | 基础奖励 |
| 使用止损且止损被触发 (损失 < 3%) | +30 | 奖励风控纪律 |
| 连续 5 笔盈利交易 | +200 (Bonus) | 连胜奖励 |
| 使用技术指标分析后交易 | +15 | 鼓励分析 |
| 每日登录并完成一笔交易 | +25 | 活跃度 |
| 完成教学任务 | +100~600 | 任务难度决定 |
| Sharpe Ratio 维持 > 1.0 一周 | +300 | 奖励稳定性 |
| 回测一个策略 | +50 | 鼓励回测 |
| 分享策略到社区 | +40 | 社交传播 |
| 赢得 PvP 对战 | +150~500 | 竞技奖励 |

### XP 惩罚 (减少，不会为负)

| 行为 | XP | 说明 |
|------|-----|------|
| 不设止损亏损 > 10% | -30 | 惩罚不风控 |
| 单日超过 20 笔交易 | -20 | 惩罚过度交易 |
| 追涨杀跌 (高买低卖连续 3 次) | -15 | 惩罚情绪交易 |

### 等级体系

```
LVL 1-5:    新手交易员 (Rookie Trader)      — 基础功能解锁
LVL 6-10:   初级分析师 (Junior Analyst)      — 技术指标全解锁
LVL 11-20:  市场观察者 (Market Watcher)      — 期权交易解锁
LVL 21-30:  策略师 (Strategist)              — 回测引擎解锁
LVL 31-40:  风险管理师 (Risk Manager)        — 高级期权策略解锁
LVL 41-50:  组合经理 (Portfolio Manager)     — AI 教练解锁
LVL 51-70:  高级交易员 (Senior Trader)       — PvP 锦标赛解锁
LVL 71-90:  交易大师 (Trading Master)        — 导师系统解锁
LVL 91-99:  传奇 (Legend)                    — 定制头衔
LVL 100:    Alpha (Alpha)                    — 全局排行榜永久展示
```

每级所需 XP = `500 + (level - 1) * 100`，逐级递增

---

## 任务 / 挑战系统

### 新手教程任务链 (必做)

```
Mission 1: "First Steps" — 买入你的第一只股票
Mission 2: "Paper Profit" — 在一笔交易中盈利 $100
Mission 3: "Stop the Bleeding" — 设置并执行一次止损
Mission 4: "Chart Reader" — 在图表上添加 SMA-20 指标
Mission 5: "Signal Spotter" — 用 RSI < 30 信号成功入场
Mission 6: "Options 101" — 买入你的第一个 Call 期权
Mission 7: "Risk Manager" — 将单笔亏损控制在 2% 以内
```

### 每日挑战 (随机)

```typescript
const DAILY_CHALLENGES = [
  { name: "Day Trader", desc: "在一天内完成 3 笔盈利交易", xp: 150 },
  { name: "Contrarian", desc: "在 RSI < 25 时买入并最终盈利", xp: 200 },
  { name: "Scalper", desc: "在 5 根 K 线内完成一笔 +1% 交易", xp: 180 },
  { name: "Patience", desc: "持有一只股票不动 10 天", xp: 100 },
  { name: "Sector Rotator", desc: "同时持有 3 个不同板块的股票", xp: 120 },
  { name: "Dividend Collector", desc: "持有股票到除息日获得分红", xp: 130 },
  { name: "News Trader", desc: "在重大新闻后 3 根 K 线内交易并盈利", xp: 250 },
  { name: "Greeks Balancer", desc: "构建一个 Delta-Neutral 期权组合", xp: 300 },
];
```

### 场景挑战 (Scenario Missions)

复刻历史上的著名交易场景，让用户身临其境：

| 场景 | 时间 | 描述 | 难度 |
|------|------|------|------|
| **2008 金融危机** | 2008.09 - 2009.03 | 在雷曼倒闭后保护你的投资组合 | ⭐⭐⭐⭐⭐ |
| **COVID 崩盘** | 2020.02 - 2020.05 | 抄底时机：在 V 型反转中获利 | ⭐⭐⭐⭐ |
| **GME 轧空** | 2021.01 | 管理极端波动下的仓位 | ⭐⭐⭐⭐⭐ |
| **2022 加息周期** | 2022.01 - 2022.12 | 在 Fed 加息中保护科技股组合 | ⭐⭐⭐⭐ |
| **NVDA AI 牛市** | 2023.01 - 2024.06 | 抓住 AI 浪潮的最大回报 | ⭐⭐⭐ |
| **2024 选举交易** | 2024.10 - 2024.12 | 在选举不确定性中导航 | ⭐⭐⭐⭐ |
| **Earnings Roulette** | 随机 | 预测并交易 FAANG 财报 | ⭐⭐⭐ |
| **Flash Crash** | 2010.05.06 | 在闪崩中存活并获利 | ⭐⭐⭐⭐⭐ |

---

## 成就 / 徽章系统

### 交易成就
- 🗡️ **First Blood** — 第一笔盈利交易
- 💎 **Diamond Hands** — 持有一只赢家 30+ 天
- 🔥 **Hot Streak** — 连续 10 笔盈利
- 🎯 **Sniper** — 在 1% 范围内精确抄底/逃顶
- 🛡️ **Iron Defense** — 连续 20 笔交易最大亏损 < 2%
- 🦅 **Eagle Eye** — 提前 3 天识别趋势反转

### 分析成就
- 📊 **Chart Junkie** — 使用超过 10 种不同指标
- Ω **Greeks God** — 期权 Greeks 总收益 > $5000
- 🔬 **Researcher** — 回测超过 20 种策略
- 🧮 **Quant** — 构建自定义策略且 Sharpe > 2.0

### 社交成就
- 🏆 **Top 10** — 进入全球排行榜前 10
- 👨‍🏫 **Mentor** — 分享的策略被 100+ 人使用
- ⚔️ **Gladiator** — 赢得 10 场 PvP 对战
- 🌟 **Influencer** — 交易分享被 1000+ 人查看

---

## 解锁系统

功能不是一开始全给，而是随等级逐步解锁：

```
LVL 1:  Market orders, 5 stocks, basic chart
LVL 3:  Limit orders, 10 stocks, SMA indicator
LVL 5:  All order types, all stocks, all trend indicators
LVL 8:  Full indicator library, drawing tools
LVL 10: Options (Long Call/Put only)
LVL 15: All options strategies, strategy builder
LVL 20: Backtest engine, custom strategies
LVL 25: AI Coach, payoff diagrams
LVL 30: PvP challenges, leaderboard
LVL 40: Multi-leg options, IV surface
LVL 50: Tournament mode, mentorship
```

这个机制的好处：
1. 防止新手被复杂功能淹没
2. 每升级都有"新玩具"的兴奋感
3. 强制用户掌握基础后才能用高级功能
4. 提供长期的进步感和目标
