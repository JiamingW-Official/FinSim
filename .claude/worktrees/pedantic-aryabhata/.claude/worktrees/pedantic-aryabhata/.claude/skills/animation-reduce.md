# Skill: animation-reduce
Reduce gratuitous animations for professional feel. Rules:
- KEEP: page transitions (AnimatePresence in layout), tab content transitions, tooltip/popover enter
- REMOVE: staggered list item animations (variants with staggerChildren)
- REMOVE: spring animations on static content (type: "spring" on non-interactive elements)
- REMOVE: scale animations on cards/sections (whileHover scale)
- REMOVE: rotation animations on icons
- SIMPLIFY: reduce motion.div to regular div where animation adds no value
- KEEP: meaningful state transitions (loading→loaded, collapsed→expanded)
- Max transition duration: 200ms for UI, 300ms for panels
Find framer-motion overuse, simplify. Report removals.
