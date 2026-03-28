"use client";

import { useEffect, useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ThemeId =
  | "midnight"
  | "obsidian"
  | "forest"
  | "crimson"
  | "violet"
  | "slate-pro";

export type AccentColor =
  | "#3b82f6"
  | "#10b981"
  | "#f59e0b"
  | "#ef4444"
  | "#8b5cf6"
  | "#06b6d4"
  | "#ec4899"
  | "#f97316";

export type FontScale = 0.875 | 1.0 | 1.125 | 1.25;

export type ChartStyle = "neon" | "clean";
export type CardStyle = "rounded" | "sharp";
export type DensityStyle = "dense" | "comfortable";

export interface ThemeConfig {
  themeId: ThemeId;
  accent: AccentColor;
  chartStyle: ChartStyle;
  cardStyle: CardStyle;
  density: DensityStyle;
  fontScale: FontScale;
}

// ── Theme presets ─────────────────────────────────────────────────────────────

export interface ThemePreset {
  id: ThemeId;
  label: string;
  vars: {
    "--background": string;
    "--foreground": string;
    "--card": string;
    "--card-foreground": string;
    "--popover": string;
    "--popover-foreground": string;
    "--secondary": string;
    "--secondary-foreground": string;
    "--muted": string;
    "--muted-foreground": string;
    "--accent": string;
    "--accent-foreground": string;
    "--border": string;
    "--input": string;
    "--sidebar": string;
    "--sidebar-foreground": string;
    "--sidebar-accent": string;
    "--sidebar-accent-foreground": string;
    "--sidebar-border": string;
  };
  /** Background color shown on swatch circle */
  swatchBg: string;
  /** Accent color shown as inner dot on swatch */
  swatchAccent: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "midnight",
    label: "Midnight",
    swatchBg: "#0a0e17",
    swatchAccent: "#10b981",
    vars: {
      "--background": "#0a0e17",
      "--foreground": "#e2e8f0",
      "--card": "#0f1420",
      "--card-foreground": "#e2e8f0",
      "--popover": "#0f1420",
      "--popover-foreground": "#e2e8f0",
      "--secondary": "#1a2235",
      "--secondary-foreground": "#e2e8f0",
      "--muted": "#1a2235",
      "--muted-foreground": "#6b7280",
      "--accent": "#1a2235",
      "--accent-foreground": "#e2e8f0",
      "--border": "#1e293b",
      "--input": "#1e293b",
      "--sidebar": "#080b12",
      "--sidebar-foreground": "#e2e8f0",
      "--sidebar-accent": "#1a2235",
      "--sidebar-accent-foreground": "#e2e8f0",
      "--sidebar-border": "#1e293b",
    },
  },
  {
    id: "obsidian",
    label: "Obsidian",
    swatchBg: "#000000",
    swatchAccent: "#3b82f6",
    vars: {
      "--background": "#000000",
      "--foreground": "#f1f5f9",
      "--card": "#0a0a0a",
      "--card-foreground": "#f1f5f9",
      "--popover": "#0a0a0a",
      "--popover-foreground": "#f1f5f9",
      "--secondary": "#111111",
      "--secondary-foreground": "#f1f5f9",
      "--muted": "#111111",
      "--muted-foreground": "#6b7280",
      "--accent": "#111111",
      "--accent-foreground": "#f1f5f9",
      "--border": "#1a1a1a",
      "--input": "#1a1a1a",
      "--sidebar": "#050505",
      "--sidebar-foreground": "#f1f5f9",
      "--sidebar-accent": "#111111",
      "--sidebar-accent-foreground": "#f1f5f9",
      "--sidebar-border": "#1a1a1a",
    },
  },
  {
    id: "forest",
    label: "Forest",
    swatchBg: "#0a1410",
    swatchAccent: "#10b981",
    vars: {
      "--background": "#0a1410",
      "--foreground": "#d1fae5",
      "--card": "#0d1a14",
      "--card-foreground": "#d1fae5",
      "--popover": "#0d1a14",
      "--popover-foreground": "#d1fae5",
      "--secondary": "#142b20",
      "--secondary-foreground": "#d1fae5",
      "--muted": "#142b20",
      "--muted-foreground": "#6b8f7a",
      "--accent": "#142b20",
      "--accent-foreground": "#d1fae5",
      "--border": "#1a3828",
      "--input": "#1a3828",
      "--sidebar": "#070f0b",
      "--sidebar-foreground": "#d1fae5",
      "--sidebar-accent": "#142b20",
      "--sidebar-accent-foreground": "#d1fae5",
      "--sidebar-border": "#1a3828",
    },
  },
  {
    id: "crimson",
    label: "Crimson",
    swatchBg: "#130a0a",
    swatchAccent: "#ef4444",
    vars: {
      "--background": "#130a0a",
      "--foreground": "#fde8e8",
      "--card": "#1a0d0d",
      "--card-foreground": "#fde8e8",
      "--popover": "#1a0d0d",
      "--popover-foreground": "#fde8e8",
      "--secondary": "#2a1212",
      "--secondary-foreground": "#fde8e8",
      "--muted": "#2a1212",
      "--muted-foreground": "#8f6b6b",
      "--accent": "#2a1212",
      "--accent-foreground": "#fde8e8",
      "--border": "#3b1818",
      "--input": "#3b1818",
      "--sidebar": "#0d0606",
      "--sidebar-foreground": "#fde8e8",
      "--sidebar-accent": "#2a1212",
      "--sidebar-accent-foreground": "#fde8e8",
      "--sidebar-border": "#3b1818",
    },
  },
  {
    id: "violet",
    label: "Violet",
    swatchBg: "#0e0a18",
    swatchAccent: "#8b5cf6",
    vars: {
      "--background": "#0e0a18",
      "--foreground": "#ede9fe",
      "--card": "#130e20",
      "--card-foreground": "#ede9fe",
      "--popover": "#130e20",
      "--popover-foreground": "#ede9fe",
      "--secondary": "#1e1535",
      "--secondary-foreground": "#ede9fe",
      "--muted": "#1e1535",
      "--muted-foreground": "#7b6f99",
      "--accent": "#1e1535",
      "--accent-foreground": "#ede9fe",
      "--border": "#2a1e4a",
      "--input": "#2a1e4a",
      "--sidebar": "#080610",
      "--sidebar-foreground": "#ede9fe",
      "--sidebar-accent": "#1e1535",
      "--sidebar-accent-foreground": "#ede9fe",
      "--sidebar-border": "#2a1e4a",
    },
  },
  {
    id: "slate-pro",
    label: "Slate Pro",
    swatchBg: "#0f1117",
    swatchAccent: "#6366f1",
    vars: {
      "--background": "#0f1117",
      "--foreground": "#e2e8f0",
      "--card": "#161b27",
      "--card-foreground": "#e2e8f0",
      "--popover": "#161b27",
      "--popover-foreground": "#e2e8f0",
      "--secondary": "#1e2535",
      "--secondary-foreground": "#e2e8f0",
      "--muted": "#1e2535",
      "--muted-foreground": "#64748b",
      "--accent": "#1e2535",
      "--accent-foreground": "#e2e8f0",
      "--border": "#252e42",
      "--input": "#252e42",
      "--sidebar": "#0a0d14",
      "--sidebar-foreground": "#e2e8f0",
      "--sidebar-accent": "#1e2535",
      "--sidebar-accent-foreground": "#e2e8f0",
      "--sidebar-border": "#252e42",
    },
  },
];

// ── Accent options ────────────────────────────────────────────────────────────

export const ACCENT_COLORS: { color: AccentColor; label: string }[] = [
  { color: "#3b82f6", label: "Blue" },
  { color: "#10b981", label: "Green" },
  { color: "#f59e0b", label: "Amber" },
  { color: "#ef4444", label: "Red" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#06b6d4", label: "Cyan" },
  { color: "#ec4899", label: "Pink" },
  { color: "#f97316", label: "Orange" },
];

// ── Font scale options ────────────────────────────────────────────────────────

export const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: 0.875, label: "Small" },
  { value: 1.0, label: "Medium" },
  { value: 1.125, label: "Large" },
  { value: 1.25, label: "XL" },
];

// ── Default config ────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: ThemeConfig = {
  themeId: "midnight",
  accent: "#10b981",
  chartStyle: "clean",
  cardStyle: "rounded",
  density: "comfortable",
  fontScale: 1.0,
};

const STORAGE_KEY = "finsim-theme-v1";

// ── Apply helpers ─────────────────────────────────────────────────────────────

function applyTheme(config: ThemeConfig): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const preset = THEME_PRESETS.find((p) => p.id === config.themeId);

  // Apply theme color vars
  if (preset) {
    for (const [key, value] of Object.entries(preset.vars)) {
      root.style.setProperty(key, value);
    }
    // Sync sidebar ring and primary with accent
    root.style.setProperty("--sidebar-ring", config.accent);
    root.style.setProperty("--sidebar-primary", config.accent);
    root.style.setProperty("--sidebar-primary-foreground", preset.vars["--background"]);
  }

  // Apply accent
  root.style.setProperty("--primary", config.accent);
  root.style.setProperty("--ring", config.accent);
  root.style.setProperty("--chart-1", config.accent);

  // Apply radius
  root.style.setProperty("--radius", config.cardStyle === "rounded" ? "0.5rem" : "0rem");

  // Apply font scale
  root.style.setProperty("--font-scale", String(config.fontScale));

  // Apply density to body
  document.body.setAttribute("data-density", config.density);

  // Apply chart style
  if (config.chartStyle === "neon") {
    document.body.setAttribute("data-chart-style", "neon");
  } else {
    document.body.removeAttribute("data-chart-style");
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useTheme() {
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_CONFIG);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ThemeConfig>;
        const merged: ThemeConfig = { ...DEFAULT_CONFIG, ...parsed };
        setConfig(merged);
        applyTheme(merged);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const updateConfig = useCallback((patch: Partial<ThemeConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return { config, updateConfig };
}
