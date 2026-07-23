"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
  accentColor: string;
  textColor: string;
}

function getRemaining(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  const clamped = Math.max(diff, 0);
  return {
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  };
}

export function Countdown({ targetDate, accentColor, textColor }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units: Array<[string, number]> = [
    ["Days", remaining.days],
    ["Hours", remaining.hours],
    ["Min", remaining.minutes],
    ["Sec", remaining.seconds],
  ];

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {units.map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-2xl font-semibold tabular-nums sm:text-4xl" style={{ color: accentColor }}>
            {value.toString().padStart(2, "0")}
          </span>
          <span
            className="mt-1 text-[10px] uppercase tracking-[0.2em] sm:text-xs"
            style={{ color: textColor }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
