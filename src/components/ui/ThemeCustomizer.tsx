"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import {
  useTheme,
  THEME_PRESETS,
  ACCENT_COLORS,
  FONT_SCALES,
  type ThemeId,
  type AccentColor,
  type FontScale,
  type ChartStyle,
  type CardStyle,
  type DensityStyle,
} from "@/hooks/useTheme";

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[11px] font-semibold text-muted-foreground/50 select-none">
      {children}
    </p>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  optionA,
  optionB,
  value,
  onChange,
}: {
  label: string;
  optionA: string;
  optionB: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex rounded-md overflow-hidden border border-border/60 text-xs shrink-0">
        <button
          type="button"
          onClick={() => onChange(optionA)}
          className={cn(
            "px-2.5 py-1 transition-colors duration-150",
            value === optionA
              ? "bg-primary/15 text-primary font-medium"
              : "bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground",
          )}
        >
          {optionA}
        </button>
        <button
          type="button"
          onClick={() => onChange(optionB)}
          className={cn(
            "px-2.5 py-1 border-l border-border/60 transition-colors duration-150",
            value === optionB
              ? "bg-primary/15 text-primary font-medium"
              : "bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground",
          )}
        >
          {optionB}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface ThemeCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export function ThemeCustomizer({ open, onClose }: ThemeCustomizerProps) {
  const { config, updateConfig } = useTheme();

  // Font scale index for slider (0-3 maps to the 4 FONT_SCALES entries)
  const fontScaleIndex = FONT_SCALES.findIndex((f) => f.value === config.fontScale);
  const safeFontScaleIndex = fontScaleIndex === -1 ? 1 : fontScaleIndex;

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: "spring", stiffness: 320, damping: 32, mass: 0.8 }}
            className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l border-border/50 bg-card shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3.5">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Theme</h2>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Customize your workspace
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-accent/50 hover:text-foreground"
                aria-label="Close theme customizer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

              {/* ── Section 1: Color Themes ── */}
              <div>
                <SectionHeader>Color Theme</SectionHeader>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_PRESETS.map((preset) => {
                    const isActive = config.themeId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => updateConfig({ themeId: preset.id as ThemeId })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-lg p-2 transition-colors duration-150",
                          isActive
                            ? "bg-primary/10 ring-1 ring-primary/40"
                            : "hover:bg-accent/40",
                        )}
                      >
                        {/* Swatch circle */}
                        <div
                          className="relative h-12 w-12 rounded-full border border-border/40 shadow-sm flex items-center justify-center"
                          style={{ background: preset.swatchBg }}
                        >
                          {/* Inner accent dot */}
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ background: preset.swatchAccent }}
                          />
                          {/* Active ring */}
                          {isActive && (
                            <span className="absolute -inset-0.5 rounded-full ring-2 ring-primary" />
                          )}
                        </div>
                        {/* Label */}
                        <span
                          className={cn(
                            "text-xs font-medium leading-none",
                            isActive ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {preset.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/40" />

              {/* ── Section 2: Accent Color ── */}
              <div>
                <SectionHeader>Accent Color</SectionHeader>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_COLORS.map(({ color, label }) => {
                    const isActive = config.accent === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateConfig({ accent: color as AccentColor })}
                        title={label}
                        className={cn(
                          "group relative flex items-center justify-center rounded-full transition-transform duration-100 active:scale-95",
                          isActive ? "ring-2 ring-offset-1 ring-offset-card" : "",
                        )}
                        style={{
                          width: 28,
                          height: 28,
                          background: color,
                          outlineColor: isActive ? color : undefined,
                        }}
                        aria-label={label}
                        aria-pressed={isActive}
                      >
                        {isActive && (
                          <Check
                            className="h-3.5 w-3.5 text-white drop-shadow"
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Selected hex */}
                <p className="mt-2 text-xs font-mono text-muted-foreground/50">
                  {config.accent}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/40" />

              {/* ── Section 3: Chart Style ── */}
              <div>
                <SectionHeader>Chart & Card Style</SectionHeader>
                <div className="space-y-2.5">
                  <ToggleRow
                    label="Chart lines"
                    optionA="Clean"
                    optionB="Neon"
                    value={config.chartStyle === "neon" ? "Neon" : "Clean"}
                    onChange={(v) =>
                      updateConfig({ chartStyle: (v.toLowerCase() as ChartStyle) })
                    }
                  />
                  <ToggleRow
                    label="Card corners"
                    optionA="Rounded"
                    optionB="Sharp"
                    value={config.cardStyle === "rounded" ? "Rounded" : "Sharp"}
                    onChange={(v) =>
                      updateConfig({
                        cardStyle: (v.toLowerCase() as CardStyle),
                      })
                    }
                  />
                  <ToggleRow
                    label="Spacing"
                    optionA="Comfortable"
                    optionB="Dense"
                    value={config.density === "comfortable" ? "Comfortable" : "Dense"}
                    onChange={(v) =>
                      updateConfig({
                        density: (v.toLowerCase() as DensityStyle),
                      })
                    }
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/40" />

              {/* ── Section 4: Font Size ── */}
              <div>
                <SectionHeader>Font Size</SectionHeader>

                {/* Labels row */}
                <div className="mb-2 flex justify-between">
                  {FONT_SCALES.map(({ value, label }) => (
                    <span
                      key={value}
                      className={cn(
                        "text-xs transition-colors duration-150",
                        config.fontScale === value
                          ? "text-primary font-semibold"
                          : "text-muted-foreground/50",
                      )}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                {/* Slider */}
                <Slider
                  min={0}
                  max={3}
                  step={1}
                  value={[safeFontScaleIndex]}
                  onValueChange={([idx]) => {
                    const scale = FONT_SCALES[idx ?? 1];
                    if (scale) updateConfig({ fontScale: scale.value as FontScale });
                  }}
                />

                {/* Live preview */}
                <div className="mt-4 rounded-md border border-border/40 bg-background/60 p-3 space-y-1">
                  <p
                    className="font-semibold text-foreground transition-all duration-200"
                    style={{ fontSize: `calc(0.875rem * ${config.fontScale})` }}
                  >
                    Aa — Preview text
                  </p>
                  <p
                    className="text-muted-foreground transition-all duration-200"
                    style={{ fontSize: `calc(0.75rem * ${config.fontScale})` }}
                  >
                    The quick brown fox jumps over the lazy dog.
                  </p>
                  <p
                    className="font-mono text-primary transition-all duration-200"
                    style={{ fontSize: `calc(0.7rem * ${config.fontScale})` }}
                  >
                    +12.4% · $148.62
                  </p>
                </div>
              </div>

              {/* Bottom padding */}
              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border/50 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  updateConfig({
                    themeId: "midnight",
                    accent: "#10b981",
                    chartStyle: "clean",
                    cardStyle: "rounded",
                    density: "comfortable",
                    fontScale: 1.0,
                  });
                }}
                className="w-full rounded-md border border-border/50 bg-background/50 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground"
              >
                Reset to defaults
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Trigger button (exported separately for use in Sidebar) ───────────────────

export function ThemeCustomizerTrigger({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {collapsed ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-10 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-accent/50 hover:text-foreground"
          aria-label="Customize theme"
        >
          <PaletteIcon />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-muted-foreground/50 transition-colors hover:bg-accent/50 hover:text-foreground"
          aria-label="Customize theme"
        >
          <PaletteIcon />
          <span className="text-xs font-medium">Theme</span>
        </button>
      )}

      <ThemeCustomizer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// Simple inline palette SVG so we don't need to import an extra lucide icon
// that may or may not be available — lucide-react does have Palette, but
// we inline it for safety.
function PaletteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.476-1.112-.29-.274-.479-.667-.479-1.075 0-.966.784-1.75 1.75-1.75h2.063C19.42 16.375 22 13.859 22 10.75 22 5.917 17.523 2 12 2z" />
    </svg>
  );
}
