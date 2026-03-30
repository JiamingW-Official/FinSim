"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, LayoutDashboard, ChevronDown, ChevronUp } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  const hasDetails = !!(error?.message || error?.digest);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            An unexpected error occurred. You can try again or return to the dashboard.
          </p>
        </div>

        {hasDetails && (
          <div className="w-full rounded-lg border border-border bg-muted/30">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="font-medium">Technical details</span>
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
            {expanded && (
              <div className="border-t border-border px-4 pb-3 pt-2">
                <pre className="overflow-auto text-left text-xs text-muted-foreground whitespace-pre-wrap break-all">
                  {error.message && (
                    <span className="text-destructive/80">{error.message}</span>
                  )}
                  {error.digest && (
                    <span className="block mt-1 text-muted-foreground/60">
                      Digest: {error.digest}
                    </span>
                  )}
                  {error.stack && (
                    <span className="block mt-2 text-muted-foreground/50">
                      {error.stack}
                    </span>
                  )}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={reset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/home">
              <LayoutDashboard className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
