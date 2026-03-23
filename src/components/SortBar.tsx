import { useState } from "react";
import type { Card } from "@/lib/types";
import { useMemo } from "react";

type SortField = "year" | "set_name" | "parallel" | "status";

const fields: { key: SortField; label: string }[] = [
  { key: "year", label: "Year" },
  { key: "set_name", label: "Set" },
  { key: "parallel", label: "Parallel" },
  { key: "status", label: "Status" },
];

export function useSortedCards(cards: Card[]) {
  const [sortBy, setSortBy] = useState<SortField>("year");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    return [...cards].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "year") {
        cmp = a.year - b.year || (a.card_number ?? "").localeCompare(b.card_number ?? "", undefined, { numeric: true });
      } else {
        cmp = ((a as any)[sortBy] ?? "").localeCompare((b as any)[sortBy] ?? "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [cards, sortBy, sortDir]);

  const toggle = (key: SortField) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("asc"); }
  };

  return { sorted, sortBy, sortDir, toggle };
}

interface SortBarProps {
  sortBy: SortField;
  sortDir: "asc" | "desc";
  onToggle: (key: SortField) => void;
}

export default function SortBar({ sortBy, sortDir, onToggle }: SortBarProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-label">Sort by</span>
      {fields.map((f) => (
        <button
          key={f.key}
          onClick={() => onToggle(f.key)}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors
            ${sortBy === f.key ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
        >
          {f.label} {sortBy === f.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
        </button>
      ))}
    </div>
  );
}
