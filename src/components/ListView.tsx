import { useNavigate } from "react-router-dom";
import type { Card, Driver } from "@/lib/types";
import ParallelBadge from "@/components/ParallelBadge";
import SortBar, { useSortedCards } from "@/components/SortBar";

interface Props {
  cards: Card[];
  driver: Driver;
}

export default function ListView({ cards }: Props) {
  const navigate = useNavigate();
  const { sorted, sortBy, sortDir, toggle } = useSortedCards(cards);

  if (cards.length === 0) {
    return (
      <div className="text-body text-muted-foreground py-12 text-center">
        No cards yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <SortBar sortBy={sortBy} sortDir={sortDir} onToggle={toggle} />
      {sorted.map((card) => (
        <button
          key={card.id}
          onClick={() => navigate(`/card/${card.id}`)}
          className="flex items-center gap-4 py-3.5 px-4 hover:bg-card transition-colors text-left w-full border-b"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <div className="w-[56px] h-[78px] rounded-md overflow-hidden shrink-0 bg-secondary relative">
            {card.image_front_url ? (
              <img
                src={card.image_front_url}
                alt=""
                className={`w-full h-full object-cover
                  ${card.status === "wishlist" ? "grayscale opacity-50" : ""}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[9px] text-muted-foreground">–</span>
              </div>
            )}
            {card.status === "purchased" && (
              <div className="absolute inset-0" style={{ backgroundColor: "rgba(180,0,0,0.45)" }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-foreground truncate">
              {card.card_name || card.card_number || "Untitled"}
            </div>
            <div className="text-[12px] text-muted-foreground truncate">
              {card.set_name} · {card.card_number}
            </div>
          </div>
          <ParallelBadge parallel={card.parallel} size="lg" />
        </button>
      ))}
    </div>
  );
}
