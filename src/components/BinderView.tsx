import { useNavigate } from "react-router-dom";
import type { Card, Driver } from "@/lib/types";

interface Props {
  cards: Card[];
  driver: Driver;
}

export default function BinderView({ cards, driver }: Props) {
  const navigate = useNavigate();

  // Group cards by set+year into binder pages of 9
  const grouped: { label: string; cards: Card[] }[] = [];
  const bySet: Record<string, Card[]> = {};

  cards.forEach((card) => {
    const key = `${card.set_name} ${card.year}`;
    if (!bySet[key]) bySet[key] = [];
    bySet[key].push(card);
  });

  Object.entries(bySet).forEach(([label, setCards]) => {
    for (let i = 0; i < setCards.length; i += 9) {
      grouped.push({ label, cards: setCards.slice(i, i + 9) });
    }
  });

  // If no grouping, show all as one page
  if (grouped.length === 0 && cards.length > 0) {
    for (let i = 0; i < cards.length; i += 9) {
      grouped.push({ label: "All Cards", cards: cards.slice(i, i + 9) });
    }
  }

  if (cards.length === 0) {
    return (
      <div className="text-body text-muted-foreground py-12 text-center">
        No cards yet. Add your first card to start building your collection.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {grouped.map((page, pageIdx) => (
        <div key={pageIdx}>
          <div className="text-label mb-3">{page.label}</div>
          <div className="grid grid-cols-3 gap-[2px] bg-border rounded-lg overflow-hidden max-w-[540px]">
            {Array.from({ length: 9 }).map((_, slotIdx) => {
              const card = page.cards[slotIdx];
              if (!card) {
                return (
                  <div
                    key={slotIdx}
                    className="bg-card aspect-[2.5/3.5] relative"
                  />
                );
              }
              return (
                <button
                  key={card.id}
                  onClick={() => navigate(`/card/${card.id}`)}
                  className="bg-card aspect-[2.5/3.5] relative overflow-hidden group cursor-pointer"
                >
                  {card.image_front_url ? (
                    <img
                      src={card.image_front_url}
                      alt={card.card_name ?? ""}
                      className={`absolute inset-0 w-full h-full object-cover
                        ${card.is_landscape ? "rotate-90 scale-[1.4]" : ""}
                        ${card.status === "wishlist" ? "grayscale opacity-50" : ""}`}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] text-muted-foreground">No Image</span>
                    </div>
                  )}
                  {/* Status overlays */}
                  {card.status === "purchased" && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(180,0,0,0.45)" }}>
                      <span className="text-[11px] font-medium tracking-wide" style={{ color: "white" }}>Purchased</span>
                    </div>
                  )}
                  {card.status === "wishlist" && card.image_front_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[11px] font-medium tracking-wide" style={{ color: "white" }}>Wishlist</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out"
                    style={{ backgroundColor: "rgba(20,20,20,0.75)" }}>
                    <div className="px-2 py-1.5">
                      <div className="text-[9px] font-medium" style={{ color: "white" }}>{card.card_name || card.card_number}</div>
                      <div className="text-[8px]" style={{ color: "rgba(255,255,255,0.6)" }}>{card.set_name} · {card.parallel}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
