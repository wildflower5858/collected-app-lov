import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

export function PokemonBinderView({ cards }: { cards: any[] }) {
  const [page, setPage] = useState(0);
  const slotsPerSpread = 18;
  const totalSpreads = Math.max(1, Math.ceil(cards.length / slotsPerSpread));
  const start = page * slotsPerSpread;
  const leftCards = cards.slice(start, start + 9);
  const rightCards = cards.slice(start + 9, start + 18);
  const renderSlot = (card: any, idx: number) => {
    if (!card) return <div key={`empty-${idx}`} className="aspect-[2.5/3.5] rounded-lg bg-secondary" />;
    return (
      <div key={card.id} className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative">
        {card.image_front ? (
          <img src={card.image_front} alt={card.name ?? ""} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <span className="text-[11px] text-muted-foreground">No Image</span>
          </div>
        )}
      </div>
    );
  };
  return (
    <div>
      <div className="flex gap-6">
        <div className="flex-1 bg-card rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => renderSlot(leftCards[i], i))}
          </div>
        </div>
        <div className="flex-1 bg-card rounded-lg p-4">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => renderSlot(rightCards[i], i + 9))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"><ChevronLeftIcon size={18} /></button>
        <span className="text-[12px] text-muted-foreground">{page + 1} / {totalSpreads}</span>
        <button onClick={() => setPage((p) => Math.min(totalSpreads - 1, p + 1))} disabled={page >= totalSpreads - 1} className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"><ChevronRightIcon size={18} /></button>
      </div>
    </div>
  );
}

export function PokemonGridView({ cards }: { cards: any[] }) {
  return (
    <div className="grid grid-cols-4 gap-5 px-5">
      {cards.map((card) => (
        <div key={card.id} className="flex flex-col">
          <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative bg-secondary">
            {card.image_front ? (
              <img src={card.image_front} alt={card.name ?? ""} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-[13px] font-medium text-foreground truncate">{card.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">{card.card_number}</div>
        </div>
      ))}
    </div>
  );
}
