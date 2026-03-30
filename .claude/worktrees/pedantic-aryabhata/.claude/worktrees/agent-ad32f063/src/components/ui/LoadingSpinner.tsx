export function LoadingSpinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="#2d9cdb"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <LoadingSpinner size={32} />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-lg border bg-card p-6 flex items-center justify-center h-40">
      <LoadingSpinner size={24} className="text-muted-foreground" />
    </div>
  );
}
