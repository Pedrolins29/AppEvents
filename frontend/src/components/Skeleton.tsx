interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[#E2DFD3] ${className}`}
      aria-hidden="true"
    />
  );
}
