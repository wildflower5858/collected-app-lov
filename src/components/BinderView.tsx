import { useNavigate } from "react-router-dom";
import type { Card, Person } from "@/lib/types";

interface Props {
  cards: Card[];
  person: Person;
}

export default function BinderView({ cards, person }: Props) {
  const navigate = useNavigate();

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

  const pillStyle: React.CSSProperties = {
    backgroundColor: "rgba(10,10,10,0.6)",
    color: "white",
    fontSize: "9px",
    padding: "2px 4px",
    borderRadius: "3px",
    lineHeight: 1,
  };

  return (
    <div className="flex flex-col gap-10 mx-6">
      {grouped.map((page, pageIdx) => (
        <div key={pageIdx}>
          <div className="text-label mb-3">{page.label}</div>
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, slotIdx) => {
              const card = page.cards[slotIdx];
              if (!card) {
                return (
                  <div
                    key={slotIdx}
                    className="bg-card aspect-[2.5/3.5] rounded-lg overflow-hidden"
                  />
                );
              }
              return (
                <button
                  key={card.id}
                  onClick={() => navigate(`/card/${card.id}`)}
                  className="bg-card aspect-[2.5/3.5] rounded-lg overflow-hidden relative cursor-pointer"
                >
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
                  <span className="absolute top-1.5 left-1.5 font-medium" style={pillStyle}>
                    {card.parallel}
                  </span>
                  <span className="absolute top-1.5 right-1.5 font-medium" style={pillStyle}>
                    {card.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
