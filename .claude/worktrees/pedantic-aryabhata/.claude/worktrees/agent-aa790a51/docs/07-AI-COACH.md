# 07 — AI 教练系统

## 概述

AI 教练是 Alpha Deck 的核心差异化功能。使用 Claude API 作为后端，为每个用户提供个性化的、实时的交易指导。

---

## AI 教练模式

### 1. 实时交易分析 (Trade Advisor)

用户下单前，AI 分析当前市场状况并给出建议：

```typescript
// src/services/ai/coach.ts

const TRADE_ADVISOR_PROMPT = `
你是 Alpha Deck 的 AI 交易教练。用户正在考虑一笔交易。

当前市场数据:
- 股票: {ticker} ({name})
- 当前价格: ${price}
- 今日变动: {dayChange}%
- 技术指标: RSI={rsi}, MACD={macd_signal}, SMA20={sma20_position}, BB={bb_position}
- 成交量: {volume} (相对30日均量: {rvol}x)
- 近期事件: {recent_events}

用户意图: {side} {quantity} 股 @ ${price}
用户持仓: {current_positions}
用户资金: ${cash}

请提供:
1. 简短评估 (2-3句) — 这笔交易的风险/机会
2. 技术面信号 — 当前指标支持还是反对这个方向?
3. 建议止损位和止盈位
4. 风险评分 (1-10)
5. 一句话教学提示

保持简洁、专业、直接。不要过度乐观也不要过度悲观。`;
```

### 2. 交易复盘 (Post-Trade Review)

交易完成后，AI 分析交易质量：

```typescript
const POST_TRADE_PROMPT = `
分析这笔已完成的交易:
- 买入: {entry_date} @ ${entry_price} (指标: RSI={entry_rsi}, MACD={entry_macd})
- 卖出: {exit_date} @ ${exit_price} (指标: RSI={exit_rsi}, MACD={exit_macd})
- 盈亏: {pnl} ({pnl_pct}%)
- 持有天数: {days_held}
- 期间最高价: ${max_price} (距离入场 {max_from_entry}%)
- 期间最低价: ${min_price} (距离入场 {min_from_entry}%)

评分维度:
1. 入场时机 (A-F): 技术面是否支持入场?
2. 出场时机 (A-F): 是否过早/过晚出场?
3. 风控执行 (A-F): 止损设置是否合理?
4. 仓位管理 (A-F): 仓位大小是否合适?
5. 改进建议: 下次遇到类似情况应该怎么做?`;
```

### 3. 每日市场简报 (Morning Brief)

```typescript
const MORNING_BRIEF_PROMPT = `
生成今日市场简报:
- 主要指数: SPY={spy}, QQQ={qqq}, IWM={iwm}
- 用户关注的股票: {watchlist_summary}
- 今日重要事件: {events}
- 用户持仓概况: {portfolio_summary}

格式:
🌅 早间简报 | {date}
📊 市场概况: (1段)
👁️ 关注要点: (3个bullet)
⚠️ 风险提示: (1个)
💡 今日建议: (1个)`;
```

### 4. 策略建议 (Strategy Advisor)

```typescript
const STRATEGY_ADVISOR_PROMPT = `
基于用户的交易历史和偏好，推荐适合的策略:

用户资料:
- 等级: LVL {level}
- 交易风格: {style} (基于历史推断)
- 平均持有天数: {avg_hold}
- 胜率: {win_rate}%
- 偏好板块: {sectors}
- 风险偏好: {risk_profile}
- 最近 5 笔交易: {recent_trades}

推荐 2-3 个策略，每个包含:
1. 策略名称和简述
2. 为什么适合这个用户
3. 具体的入场/出场规则
4. 风险管理建议
5. 回测预期表现`;
```

---

## 教学内容系统

### 内置课程模块

```
📚 Module 1: 市场基础
   ├── 1.1 股票是什么
   ├── 1.2 如何阅读 K 线图
   ├── 1.3 支撑与阻力
   └── 1.4 成交量的意义

📚 Module 2: 技术分析
   ├── 2.1 移动平均线 (SMA/EMA)
   ├── 2.2 RSI — 超买超卖
   ├── 2.3 MACD — 动量信号
   ├── 2.4 布林带 — 波动通道
   ├── 2.5 斐波那契回撤
   └── 2.6 综合运用: 多指标确认

📚 Module 3: 基本面分析
   ├── 3.1 PE Ratio 与估值
   ├── 3.2 财报阅读 101
   ├── 3.3 现金流分析
   └── 3.4 板块轮动

📚 Module 4: 风险管理
   ├── 4.1 仓位管理 (Kelly Criterion)
   ├── 4.2 止损策略
   ├── 4.3 分散投资
   └── 4.4 最大回撤控制

📚 Module 5: 期权入门
   ├── 5.1 Call 和 Put 是什么
   ├── 5.2 内在价值 vs 时间价值
   ├── 5.3 理解 Greeks
   ├── 5.4 基础策略: Covered Call
   └── 5.5 基础策略: Protective Put

📚 Module 6: 期权进阶
   ├── 6.1 价差策略 (Spreads)
   ├── 6.2 Iron Condor
   ├── 6.3 Straddle & Strangle
   ├── 6.4 波动率交易
   └── 6.5 期权滚动 (Rolling)

📚 Module 7: 投资组合理论
   ├── 7.1 现代投资组合理论 (MPT)
   ├── 7.2 有效前沿
   ├── 7.3 夏普比率优化
   └── 7.4 因子投资
```

### 交互式教学

每个课程模块包含:
1. **概念讲解** — 简洁的文字 + 图表
2. **实战演示** — AI 在实际图表上标注教学点
3. **练习题** — 在真实数据上完成特定操作
4. **小测验** — 验证理解

---

## AI 调用架构

```typescript
// src/services/ai/claude-client.ts

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function getAIResponse(prompt: string, context: MarketContext): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: formatPrompt(prompt, context) }],
  });
  
  return message.content[0].type === 'text' ? message.content[0].text : '';
}

const SYSTEM_PROMPT = `你是 Alpha Deck 的 AI 交易教练。你的目标是教会用户成为更好的交易者。

核心原则:
1. 永远不给"买/卖"的直接建议，而是教他们如何分析
2. 强调风险管理胜过盈利
3. 用简洁专业的语言
4. 在批评时保持建设性
5. 用具体数据支持每个观点
6. 鼓励用户形成自己的交易纪律`;
```
