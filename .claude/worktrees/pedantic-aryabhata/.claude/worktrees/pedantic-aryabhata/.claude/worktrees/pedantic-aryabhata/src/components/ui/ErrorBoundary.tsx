"use client";

import React from "react";
import { AlertTriangle, RefreshCw, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    const label = this.props.name ?? "Unknown";
    console.error(`[ErrorBoundary:${label}]`, error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleCopyError = async () => {
    const { error } = this.state;
    if (!error) return;
    const text = `${error.name}: ${error.message}\n${error.stack ?? ""}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard not available — silently ignore
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const isDev = process.env.NODE_ENV === "development";
    const { error } = this.state;
    const label = this.props.name ? ` in ${this.props.name}` : "";

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-destructive/50 bg-card p-4 text-sm">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="font-medium">Something went wrong{label}</span>
        </div>

        {isDev && error && (
          <pre className="overflow-auto rounded border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
            {error.message}
          </pre>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            Try Again
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={this.handleCopyError}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <ClipboardCopy className="h-3 w-3" />
            Report Issue
          </Button>
        </div>
      </div>
    );
  }
}
