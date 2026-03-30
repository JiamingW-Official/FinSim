"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  SVG icon primitives                                                */
/* ------------------------------------------------------------------ */

function IconChart() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

function IconBook() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconCards() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="6" width="16" height="12" rx="2" ry="2" />
      <path d="M6 2h12a2 2 0 0 1 2 2v12" />
    </svg>
  );
}

function IconTrophy() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Action config                                                       */
/* ------------------------------------------------------------------ */

interface ActionConfig {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  borderColor: string;
  iconColor: string;
  bgColor: string;
}

const ACTIONS: ActionConfig[] = [
  {
    href: "/trade",
    title: "Trade Now",
    description: "Open positions with real market data",
    icon: <IconChart />,
    borderColor: "border-l-blue-500",
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/8",
  },
  {
    href: "/learn",
    title: "Today's Lesson",
    description: "Continue your learning path",
    icon: <IconBook />,
    borderColor: "border-l-green-500",
    iconColor: "text-green-400",
    bgColor: "bg-green-500/8",
  },
  {
    href: "/options",
    title: "Options Chain",
    description: "Explore calls, puts, and strategies",
    icon: <IconLayers />,
    borderColor: "border-l-purple-500",
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/8",
  },
  {
    href: "/learn?tab=flashcards",
    title: "Flashcard Review",
    description: "Test your knowledge with cards",
    icon: <IconCards />,
    borderColor: "border-l-amber-500",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/8",
  },
  {
    href: "/challenges",
    title: "Challenge",
    description: "Compete in daily trading challenges",
    icon: <IconTrophy />,
    borderColor: "border-l-red-500",
    iconColor: "text-red-400",
    bgColor: "bg-red-500/8",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function QuickActions() {
  return (
    <div>
      <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Quick Actions
      </h2>
      {/* Horizontal scroll container */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              "group flex shrink-0 flex-col gap-2 rounded-lg border border-border/40 border-l-2 bg-card p-3 transition-colors hover:border-border/70 hover:bg-accent/20",
              action.borderColor,
            )}
            style={{ width: 140, minWidth: 140 }}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                action.bgColor,
                action.iconColor,
              )}
            >
              {action.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold leading-snug">
                {action.title}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-muted-foreground">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
