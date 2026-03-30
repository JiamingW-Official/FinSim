"use client";

import { useState } from "react";
import { useProfileStore } from "@/stores/profile-store";
import { cn } from "@/lib/utils";
import { Check, Pencil } from "lucide-react";

// ─── Avatar options ───────────────────────────────────────────────────────────
const AVATAR_EMOJIS = [
  "🐂", "🐻", "🦅", "🦊", "🐺", "🦁", "🐲", "🦄", "🎯", "💎",
  "🔥", "⚡", "🚀", "📈", "🏆", "👑", "🎲", "🃏", "🛡️", "⭐",
];

const AVATAR_COLORS = [
  { hex: "#10b981", label: "Emerald" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#8b5cf6", label: "Violet" },
  { hex: "#f59e0b", label: "Amber" },
  { hex: "#ef4444", label: "Red" },
];

// ─── Strategy style tags ──────────────────────────────────────────────────────
const STRATEGY_STYLES = [
  "Momentum Trader",
  "Swing Trader",
  "Position Trader",
  "Day Trader",
  "Contrarian",
  "Trend Follower",
  "Value Investor",
  "Options Strategist",
  "Quant Trader",
  "Risk Manager",
];

// ─── Inline field wrapper ─────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ProfileEditor() {
  const store = useProfileStore();

  const [name, setName] = useState(store.displayName);
  const [emoji, setEmoji] = useState(store.avatarEmoji);
  const [color, setColor] = useState(store.avatarColor);
  const [bio, setBio] = useState(store.bio);
  const [motto, setMotto] = useState(store.motto);
  const [strategyStyle, setStrategyStyle] = useState(store.strategyStyle);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    store.setDisplayName(name);
    store.setAvatar(emoji, color);
    store.setBio(bio);
    store.setMotto(motto);
    store.setStrategyStyle(strategyStyle);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const isDirty =
    name !== store.displayName ||
    emoji !== store.avatarEmoji ||
    color !== store.avatarColor ||
    bio !== store.bio ||
    motto !== store.motto ||
    strategyStyle !== store.strategyStyle;

  return (
    <div className="space-y-5">
      {/* Preview card */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
          style={{ backgroundColor: `${color}20`, border: `2px solid ${color}40` }}
        >
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black truncate">{name || "Trader"}</p>
          {motto && (
            <p className="text-[10px] italic text-muted-foreground truncate">
              &ldquo;{motto}&rdquo;
            </p>
          )}
          {strategyStyle && (
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
              {strategyStyle}
            </span>
          )}
        </div>
      </div>

      {/* Username */}
      <div>
        <FieldLabel>Display Name</FieldLabel>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 20))}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 pr-10 text-sm outline-none focus:ring-1 focus:ring-primary"
            placeholder="Trader"
          />
          <Pencil className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        </div>
        <p className="mt-0.5 text-right text-[9px] text-muted-foreground">{name.length}/20</p>
      </div>

      {/* Trading motto */}
      <div>
        <FieldLabel>Trading Motto</FieldLabel>
        <input
          type="text"
          value={motto}
          onChange={(e) => setMotto(e.target.value.slice(0, 60))}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary"
          placeholder="e.g. Cut losses fast, let winners run"
        />
        <p className="mt-0.5 text-right text-[9px] text-muted-foreground">{motto.length}/60</p>
      </div>

      {/* Bio */}
      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 140))}
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-primary"
          placeholder="Tell the market about yourself..."
        />
        <p className="mt-0.5 text-right text-[9px] text-muted-foreground">{bio.length}/140</p>
      </div>

      {/* Strategy style */}
      <div>
        <FieldLabel>Preferred Strategy Style</FieldLabel>
        <div className="flex flex-wrap gap-1.5">
          {STRATEGY_STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStrategyStyle(strategyStyle === s ? "" : s)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-all",
                strategyStyle === s
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar emoji */}
      <div>
        <FieldLabel>Avatar</FieldLabel>
        <div className="grid grid-cols-10 gap-1">
          {AVATAR_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg text-base transition-all",
                emoji === e
                  ? "bg-primary/15 ring-2 ring-primary/40 scale-110"
                  : "hover:bg-accent",
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar color */}
      <div>
        <FieldLabel>Avatar Color</FieldLabel>
        <div className="flex gap-3">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColor(c.hex)}
              title={c.label}
              className={cn(
                "h-7 w-7 rounded-full transition-all",
                color === c.hex && "ring-2 ring-white/40 ring-offset-2 ring-offset-background scale-110",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end gap-2 pt-1 border-t border-border">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty && !saved}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all",
            saved
              ? "bg-green-500/15 text-green-400"
              : isDirty
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "cursor-not-allowed bg-muted/20 text-muted-foreground",
          )}
        >
          {saved ? (
            <>
              <Check className="h-3 w-3" />
              Saved
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
