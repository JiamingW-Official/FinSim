"use client";

import { useRef, useState, useCallback } from "react";
import { useTradingStore } from "@/stores/trading-store";
import { useLearnStore } from "@/stores/learn-store";
import { useGameStore } from "@/stores/game-store";
import { ResetConfirmDialog } from "@/components/settings/ResetConfirmDialog";
import {
  exportAllData,
  exportTradeHistory,
  downloadFile,
  estimateDataSize,
  formatBytes,
} from "@/services/data/export-service";
import { importData } from "@/services/data/import-service";
import { Button } from "@/components/ui/button";
import { Database, Download, Upload, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type ExportStatus = "idle" | "exporting" | "done" | "error";
type ImportStatus = "idle" | "importing" | "done" | "error";

interface StatusMessage {
  type: "success" | "error";
  text: string;
}

const LAST_EXPORT_KEY = "finsim-last-export-date";

function getLastExportDate(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_EXPORT_KEY);
}

function recordExportDate(): void {
  localStorage.setItem(LAST_EXPORT_KEY, new Date().toISOString());
}

export function DataManager() {
  const tradeHistory = useTradingStore((s) => s.tradeHistory);
  const resetPortfolio = useTradingStore((s) => s.resetPortfolio);
  const completedLessons = useLearnStore((s) => s.completedLessons);
  const resetLearnProgress = useLearnStore((s) => s.resetLearnProgress);
  const resetGame = useGameStore((s) => s.resetGame);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [exportStatus, setExportStatus] = useState<ExportStatus>("idle");
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [showResetAll, setShowResetAll] = useState(false);
  const [lastExportDate] = useState<string | null>(() => getLastExportDate());

  const dataSize = typeof window !== "undefined" ? estimateDataSize() : 0;

  const handleExportCSV = useCallback(async () => {
    setExportStatus("exporting");
    setStatusMessage(null);
    try {
      // Yield to the browser so the loading indicator renders
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const csv = exportTradeHistory(tradeHistory);
      const date = new Date().toISOString().slice(0, 10);
      downloadFile(csv, `finsim-trades-${date}.csv`, "text/csv;charset=utf-8;");
      recordExportDate();
      setExportStatus("done");
      setStatusMessage({ type: "success", text: "Trade history downloaded as CSV." });
    } catch {
      setExportStatus("error");
      setStatusMessage({ type: "error", text: "Export failed. Please try again." });
    }
  }, [tradeHistory]);

  const handleExportJSON = useCallback(async () => {
    setExportStatus("exporting");
    setStatusMessage(null);
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      const json = exportAllData();
      const date = new Date().toISOString().slice(0, 10);
      downloadFile(json, `finsim-backup-${date}.json`, "application/json");
      recordExportDate();
      setExportStatus("done");
      setStatusMessage({ type: "success", text: "Full backup downloaded as JSON." });
    } catch {
      setExportStatus("error");
      setStatusMessage({ type: "error", text: "Export failed. Please try again." });
    }
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset the input so the same file can be re-selected if needed
      e.target.value = "";

      setImportStatus("importing");
      setStatusMessage(null);

      try {
        const text = await file.text();
        const result = importData(text);
        if (result.success) {
          setImportStatus("done");
          setStatusMessage({
            type: "success",
            text: "Data imported successfully. Reload the page to apply changes.",
          });
        } else {
          setImportStatus("error");
          setStatusMessage({
            type: "error",
            text: result.error ?? "Import failed.",
          });
        }
      } catch {
        setImportStatus("error");
        setStatusMessage({ type: "error", text: "Could not read the selected file." });
      }
    },
    [],
  );

  const handleResetAll = useCallback(() => {
    resetGame();
    resetPortfolio();
    resetLearnProgress();
    setShowResetAll(false);
    setStatusMessage({ type: "success", text: "All progress has been reset." });
  }, [resetGame, resetPortfolio, resetLearnProgress]);

  const isExporting = exportStatus === "exporting";
  const isImporting = importStatus === "importing";

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center gap-2 text-sm font-black">
        <Database className="h-4 w-4 text-indigo-400" />
        Data and Privacy
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{tradeHistory.length}</span> trade records
        </span>
        <span>
          <span className="font-semibold text-foreground">{completedLessons.length}</span> lessons completed
        </span>
        <span>
          Storage used:{" "}
          <span className="font-semibold text-foreground">{formatBytes(dataSize)}</span>
        </span>
        {lastExportDate && (
          <span>
            Last export:{" "}
            <span className="font-semibold text-foreground">
              {new Date(lastExportDate).toLocaleDateString()}
            </span>
          </span>
        )}
      </div>

      {/* Export buttons */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Export</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleExportCSV}
            disabled={isExporting || isImporting}
          >
            {isExporting ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3 w-3" />
            )}
            Export Trade History (CSV)
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleExportJSON}
            disabled={isExporting || isImporting}
          >
            {isExporting ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Download className="mr-1.5 h-3 w-3" />
            )}
            Export All Data (JSON)
          </Button>
        </div>
      </div>

      {/* Import */}
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Import</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Import data file"
        />
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleImportClick}
          disabled={isExporting || isImporting}
        >
          {isImporting ? (
            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3 w-3" />
          )}
          Import Data
        </Button>
        <p className="text-[10px] text-muted-foreground">
          Accepts .json files exported from FinSim. Current progress will be overwritten.
        </p>
      </div>

      {/* Status message */}
      {statusMessage && (
        <div
          className={
            "flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] leading-snug " +
            (statusMessage.type === "success"
              ? "border-green-500/20 bg-green-500/10 text-green-400"
              : "border-destructive/20 bg-destructive/10 text-destructive")
          }
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Divider */}
      <div className="divider-glow" />

      {/* Reset all */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Reset All Progress</div>
          <div className="text-[10px] text-muted-foreground">
            Clears XP, achievements, portfolio, and lesson history
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs"
          onClick={() => setShowResetAll(true)}
        >
          <Trash2 className="mr-1.5 h-3 w-3" />
          Reset All
        </Button>
      </div>

      <ResetConfirmDialog
        open={showResetAll}
        onConfirm={handleResetAll}
        onCancel={() => setShowResetAll(false)}
        title="Reset All Progress"
        description="This will permanently erase your XP, level, achievements, all trades, and lesson completions. This action cannot be undone. Consider exporting a backup first."
        confirmLabel="Reset Everything"
      />
    </div>
  );
}
