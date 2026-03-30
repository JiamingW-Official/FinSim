"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/stores/game-store";

const EMOJI_POOL = [
  "🚀", "⭐", "💎", "🔥", "✨", "💰", "🏆", "📈", "💯", "🎯",
];

interface EmojiParticle {
  id: number;
  emoji: string;
  x: number; // percent
  delay: number;
}

let emojiIdCounter = 0;

export function FloatingEmojis() {
  const xp = useGameStore((s) => s.xp);
  const prevXpRef = useRef(xp);
  const [emojis, setEmojis] = useState<EmojiParticle[]>([]);

  useEffect(() => {
    const delta = xp - prevXpRef.current;
    prevXpRef.current = xp;

    if (delta <= 0) return;

    // Scale count with XP delta
    const count = delta >= 200 ? 7 : delta >= 51 ? 5 : 3;

    const newEmojis: EmojiParticle[] = Array.from({ length: count }, (_, i) => ({
      id: emojiIdCounter++,
      emoji: EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)],
      x: 20 + Math.random() * 60, // 20%–80% of screen width
      delay: i * 0.1,
    }));

    setEmojis((prev) => [...prev, ...newEmojis]);

    // Clean up after animation
    const timer = setTimeout(() => {
      const ids = new Set(newEmojis.map((e) => e.id));
      setEmojis((prev) => prev.filter((e) => !ids.has(e.id)));
    }, 2200);

    return () => clearTimeout(timer);
  }, [xp]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[190] overflow-hidden">
      <AnimatePresence>
        {emojis.map((e) => (
          <motion.div
            key={e.id}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -130, opacity: 0, scale: 1.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: e.delay, ease: "easeOut" }}
            style={{
              position: "absolute",
              bottom: "4rem",
              left: `${e.x}%`,
              fontSize: "1.4rem",
              userSelect: "none",
            }}
          >
            {e.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
