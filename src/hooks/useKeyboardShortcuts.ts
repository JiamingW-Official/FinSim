"use client";

import { useEffect } from "react";
import { useTimeTravel } from "@/hooks/useTimeTravel";
import { useChartStore } from "@/stores/chart-store";

export function useKeyboardShortcuts() {
  const { isPlaying, play, pause, advance, stepBack } = useTimeTravel();
  const { setTimeframe } = useChartStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key) {
        // Playback controls
        case " ":
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
        case "ArrowRight":
          e.preventDefault();
          if (!isPlaying) advance();
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (!isPlaying) stepBack();
          break;

        // Timeframe shortcuts
        case "5":
          e.preventDefault();
          setTimeframe("5m");
          break;
        case "1":
          e.preventDefault();
          setTimeframe("15m");
          break;
        case "h":
        case "H":
          e.preventDefault();
          setTimeframe("1h");
          break;
        case "d":
        case "D":
          e.preventDefault();
          setTimeframe("1d");
          break;
        case "w":
        case "W":
          e.preventDefault();
          setTimeframe("1wk");
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, play, pause, advance, stepBack, setTimeframe]);
}
