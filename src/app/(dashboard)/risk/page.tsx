"use client";

import { ShieldAlert } from "lucide-react";

export default function RiskPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <ShieldAlert className="h-12 w-12 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-bold">Risk Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Portfolio risk analytics coming soon.
        </p>
      </div>
    </div>
  );
}
