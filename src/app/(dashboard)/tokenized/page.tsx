"use client";

import { Coins } from "lucide-react";

export default function TokenizedPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Coins className="h-12 w-12 text-muted-foreground" />
      <div>
        <h1 className="text-xl font-bold">Real-World Assets (RWA)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tokenized real-world asset trading coming soon.
        </p>
      </div>
    </div>
  );
}
