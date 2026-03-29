# Skill: data-label
Add clear "Simulated" labels to all synthetic data displays. Rules:
- Any price data not from a real API: add small "(Simulated)" or "Sim" badge
- Dark pool flow: label as "Simulated Institutional Flow"
- Unusual activity: label as "Simulated Activity"
- Options chain data: label as "Simulated Chain"
- Prediction markets: label as "Practice Markets"
- Portfolio value: already fine (it's a game)
- Use a consistent badge: `<span className="text-[10px] text-muted-foreground/60 ml-1">Simulated</span>`
Find all synthetic data displays, add labels. Report additions.
