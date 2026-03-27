"use client";

import { Rewind } from "lucide-react";

export default function ReplayPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Rewind className="h-12 w-12 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-bold">Market Replay</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Historical market replay mode coming soon.
        </p>
      </div>
    </div>
  );
}
