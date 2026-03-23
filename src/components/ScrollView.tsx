import { useNavigate } from "react-router-dom";
import type { Card, Driver } from "@/lib/types";
import ParallelBadge from "@/components/ParallelBadge";
import SortBar, { useSortedCards } from "@/components/SortBar";

interface Props {
  cards: Card[];
  driver: Driver;
}

export default function ScrollView({ cards }: Props) {
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
    <div className="px-5">
      <SortBar sortBy={sortBy} sortDir={sortDir} onToggle={toggle} />
      <div className="grid grid-cols-4 gap-5">
        {sorted.map((card) => (
          <button
            key={card.id}
            onClick={() => navigate(`/card/${card.id}`)}
            className="text-left cursor-pointer group"
          >
            {/* Card image */}
            <div className="relative rounded-lg overflow-hidden bg-secondary" style={{ aspectRatio: "2.5 / 3.5" }}>
              {card.image_front_url ? (
                <img
                  src={card.image_front_url}
                  alt={card.card_name ?? ""}
                  className={`absolute inset-0 w-full h-full object-cover
                    ${card.status === "wishlist" ? "grayscale opacity-50" : ""}`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] text-muted-foreground">No Image</span>
                </div>
              )}
              {card.status === "purchased" && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ backgroundColor: "rgba(180,0,0,0.45)" }}
                >
                  <span className="text-[11px] font-medium tracking-wide text-white">Purchased</span>
                </div>
              )}
              {card.status === "wishlist" && card.image_front_url && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[11px] font-medium tracking-wide text-white">Wishlist</span>
                </div>
              )}
            </div>

            {/* Info block */}
            <div className="h-16 pt-2 flex flex-col overflow-hidden">
              <p className="text-[13px] font-medium text-foreground leading-tight line-clamp-2">
                {card.card_name || card.card_number || "Untitled"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {card.set_name} · {card.card_number}
              </p>
              <div className="mt-auto">
                <ParallelBadge parallel={card.parallel} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
