"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Swords,
} from "lucide-react";

const NAV_SUGGESTIONS = [
  { href: "/home", label: "Home", icon: LayoutDashboard, description: "Dashboard overview" },
  { href: "/trade", label: "Trade", icon: TrendingUp, description: "Paper trading simulator" },
  { href: "/learn", label: "Learn", icon: BookOpen, description: "Lessons & flashcards" },
  { href: "/arena", label: "Arena", icon: Swords, description: "Competitive challenges" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-2xl font-semibold tabular-nums text-muted-foreground/20 select-none">
            404
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="w-full">
          <p className="mb-3 text-xs font-medium text-muted-foreground/60">
            Where would you like to go?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {NAV_SUGGESTIONS.map(({ href, label, icon: Icon, description }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors duration-150 hover:bg-muted/20 hover:border-border/60"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
                <span className="text-xs text-muted-foreground">{description}</span>
              </Link>
            ))}
          </div>
        </div>

        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href="/home">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
