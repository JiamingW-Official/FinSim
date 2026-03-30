"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
  type UIEvent,
} from "react";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  /** Extra items to render above and below the visible window (default: 10). */
  overscan?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * VirtualList — renders only the items currently visible in the scroll
 * container plus an overscan buffer above and below the viewport.  For lists
 * with a uniform, known item height this avoids mounting hundreds of DOM nodes.
 *
 * Usage:
 *   <VirtualList
 *     items={users}
 *     itemHeight={48}
 *     renderItem={(user, i) => <UserRow key={user.id} user={user} />}
 *     className="h-96 overflow-y-auto"
 *   />
 */
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 10,
  className = "",
  style,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop((e.currentTarget as HTMLDivElement).scrollTop);
  }, []);

  const { startIndex, endIndex, offsetTop } = useMemo(() => {
    const viewportHeight = containerRef.current?.clientHeight ?? 400;
    const rawStart = Math.floor(scrollTop / itemHeight);
    const start = Math.max(0, rawStart - overscan);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const end = Math.min(items.length - 1, rawStart + visibleCount + overscan);
    return {
      startIndex: start,
      endIndex: end,
      offsetTop: start * itemHeight,
    };
  }, [scrollTop, itemHeight, items.length, overscan]);

  const totalHeight = items.length * itemHeight;
  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ overflowY: "auto", ...style }}
      onScroll={handleScroll}
    >
      {/* Spacer to maintain correct scroll height */}
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ position: "absolute", top: offsetTop, left: 0, right: 0 }}>
          {visibleItems.map((item, i) =>
            renderItem(item, startIndex + i),
          )}
        </div>
      </div>
    </div>
  );
}
