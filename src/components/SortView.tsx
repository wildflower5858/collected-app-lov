import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { Card, Driver } from "@/lib/types";
import ParallelBadge from "@/components/ParallelBadge";

interface Props {
  cards: Card[];
  driver: Driver;
}

type SortField = "year" | "set_name" | "card_number" | "parallel" | "status";

export default function SortView({ cards }: Props) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortField>("year");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    return [...cards].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "year") {
        cmp = a.year - b.year || (a.card_number ?? "").localeCompare(b.card_number ?? "");
      } else if (sortBy === "card_number") {
        cmp = (a.card_number ?? "").localeCompare(b.card_number ?? "", undefined, { numeric: true });
      } else {
        cmp = ((a as any)[sortBy] ?? "").localeCompare((b as any)[sortBy] ?? "");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [cards, sortBy, sortDir]);

  const fields: { key: SortField; label: string }[] = [
    { key: "year", label: "Year" },
    { key: "set_name", label: "Set" },
    { key: "card_number", label: "Card #" },
    { key: "parallel", label: "Parallel" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="max-w-[720px]">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-label">Sort by</span>
        {fields.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              if (sortBy === f.key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
              else { setSortBy(f.key); setSortDir("asc"); }
            }}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors
              ${sortBy === f.key ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
          >
            {f.label} {sortBy === f.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </button>
        ))}
      </div>
      <div className="flex flex-col">
        {sorted.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(`/card/${card.id}`)}
            className="flex items-center gap-4 py-2.5 px-2 -mx-2 rounded-md hover:bg-card transition-colors text-left"
          >
            <div className="w-[32px] h-[45px] rounded overflow-hidden shrink-0 bg-secondary relative">
              {card.image_front_url ? (
                <img
                  src={card.image_front_url}
                  alt=""
                  className={`w-full h-full object-cover
                    ${card.is_landscape ? "rotate-90 scale-[1.4]" : ""}
                    ${card.status === "wishlist" ? "grayscale opacity-50" : ""}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[7px] text-muted-foreground">–</span>
                </div>
              )}
              {card.status === "purchased" && (
                <div className="absolute inset-0" style={{ backgroundColor: "rgba(180,0,0,0.45)" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-foreground truncate">
                {card.card_name || card.card_number || "Untitled"}
              </div>
              <div className="text-[12px] text-muted-foreground truncate">
                {card.set_name} · {card.card_number}
              </div>
            </div>
            <ParallelBadge parallel={card.parallel} />
          </button>
        ))}
      </div>
    </div>
  );
}
