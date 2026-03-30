"use client";

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function MiniSparkline({
  data,
  width = 48,
  height = 16,
  className,
}: MiniSparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? "#10b981" : "#ef4444";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
      />
    </svg>
  );
}
