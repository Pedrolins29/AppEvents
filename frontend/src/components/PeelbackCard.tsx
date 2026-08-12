"use client";

import { ReactNode } from "react";

interface PeelbackCardProps {
  children: ReactNode;
  className?: string;
  enabled?: boolean;
}

export function PeelbackCard({ children, className = "", enabled = true }: PeelbackCardProps) {
  return (
    <div className={enabled ? `peelback ${className}` : className}>
      {children}
    </div>
  );
}
