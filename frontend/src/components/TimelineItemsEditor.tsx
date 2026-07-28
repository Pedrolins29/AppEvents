"use client";

import { useState } from "react";
import type { TimelineItemRecord } from "@/types/event";

const MAX_ITEMS = 15;

interface TimelineRow extends TimelineItemRecord {
  key: string;
}

interface TimelineItemsEditorProps {
  items: TimelineItemRecord[];
  onChange: (items: TimelineItemRecord[]) => void;
}

function newKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function TimelineItemsEditor({ items, onChange }: TimelineItemsEditorProps) {
  const [rows, setRows] = useState<TimelineRow[]>(() =>
    items.map((item) => ({ ...item, key: newKey() })),
  );

  function emit(next: TimelineRow[]) {
    setRows(next);
    onChange(next.map(({ time, label }) => ({ time, label })));
  }

  function updateRow(key: string, field: "time" | "label", value: string) {
    emit(rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    if (rows.length >= MAX_ITEMS) {
      return;
    }
    emit([...rows, { key: newKey(), time: "", label: "" }]);
  }

  function removeRow(key: string) {
    emit(rows.filter((row) => row.key !== key));
  }

  function moveRow(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return;
    }
    const next = [...rows];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    emit(next);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-[#14211D]">Timeline (optional)</span>
        <span className="text-xs text-[#5B6B67]">{rows.length}/{MAX_ITEMS} moments</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={row.key} className="flex items-center gap-2">
            <input
              type="text"
              value={row.time}
              onChange={(e) => updateRow(row.key, "time", e.target.value)}
              placeholder="12:00"
              className="w-20 border border-[#E2DFD3] px-2 py-1.5 text-sm"
            />
            <input
              type="text"
              value={row.label}
              onChange={(e) => updateRow(row.key, "label", e.target.value)}
              placeholder="Ceremony"
              className="flex-1 border border-[#E2DFD3] px-2 py-1.5 text-sm"
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveRow(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
                className="rounded px-1.5 py-1 text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D] disabled:opacity-30"
              >
                &uarr;
              </button>
              <button
                type="button"
                onClick={() => moveRow(index, 1)}
                disabled={index === rows.length - 1}
                aria-label="Move down"
                className="rounded px-1.5 py-1 text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D] disabled:opacity-30"
              >
                &darr;
              </button>
              <button
                type="button"
                onClick={() => removeRow(row.key)}
                aria-label="Remove"
                className="rounded px-1.5 py-1 text-[#5B6B67] transition-colors duration-150 hover:text-red-600"
              >
                &times;
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        disabled={rows.length >= MAX_ITEMS}
        className="mt-2 text-sm font-medium text-[#0F766E] transition-colors duration-150 hover:text-[#0C5C56] disabled:opacity-40"
      >
        + Add moment
      </button>
    </div>
  );
}
