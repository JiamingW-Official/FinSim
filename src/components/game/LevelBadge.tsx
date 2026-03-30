"use client";

import { useGameStore } from "@/stores/game-store";
import { Shield } from "lucide-react";

export function LevelBadge() {
 const title = useGameStore((s) => s.title);

 return (
 <div className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5">
 <Shield className="h-3 w-3 text-primary" />
 <span className="text-[11px] font-semibold text-primary">{title}</span>
 </div>
 );
}
