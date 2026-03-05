"use client";

import { useEffect } from "react";
import { useTimeTravel } from "@/hooks/useTimeTravel";

export function useKeyboardShortcuts() {
  const { isPlaying, play, pause, advance, stepBack } = useTimeTravel();

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
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, play, pause, advance, stepBack]);
}
