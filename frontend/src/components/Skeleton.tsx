interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[#E2DFD3] dark:bg-[#2A3532] ${className}`}
      aria-hidden="true"
    />
  );
}
