"use client";

import { useEffect } from "react";
import { useTimeTravel } from "@/hooks/useTimeTravel";

export function useKeyboardShortcuts() {
  const { isPlaying, play, pause, advance, changeSpeed, speed } =
    useTimeTravel();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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
        case "1":
          changeSpeed(1);
          break;
        case "2":
          changeSpeed(2);
          break;
        case "3":
          changeSpeed(5);
          break;
        case "4":
          changeSpeed(10);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isPlaying, play, pause, advance, changeSpeed, speed]);
}
