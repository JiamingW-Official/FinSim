# Skill: cross-page-data
Ensure data consistency across ALL pages. Pattern:
- ALL synthetic prices use `simulateTickerPrice(ticker, daySeed)` from a shared utility
- daySeed = Math.floor(Date.now() / 86400000) — same for all pages on same day
- VIX comes from single source: marketPulse computed with daySeed ^ 0xbeefdead seed
- F&G inversely correlated with VIX: baseFG = (1 - vixNorm) * 80 + 10
- Regime derived from VIX+F&G consistently
- Market Terminal, Home, Trade, Options ALL use same price source
- No independent Math.random() or Date.now()/30000 seeds
