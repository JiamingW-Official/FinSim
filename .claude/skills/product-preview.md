# Skill: product-preview
Add product preview visual to landing page. Pattern:
- Mock browser chrome: rounded-lg border border-border bg-card overflow-hidden shadow-lg
- Inside: simplified CSS/SVG representation of trading interface
  - Fake chart area with SVG gradient line
  - Mini sidebar with icon dots
  - Bottom bar: "AAPL $192.15 ▲ +0.23%"
- Fade-in animation: motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
- Below: "No downloads. No sign-up. Start in your browser." text-sm text-muted-foreground
