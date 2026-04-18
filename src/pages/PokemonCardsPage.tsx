import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Grid3X3, LayoutGrid, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

type ViewMode = "binder" | "grid";

export default function PokemonCardsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("binder");

  const { data: cards } = useQuery({
    queryKey: ["pokemon-cards"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pokemon_cards")
        .select("*")
        .order("sort_order");
      return data ?? [];
    },
  });

  const viewButtons = [
    { mode: "binder" as ViewMode, icon: Grid3X3, label: "Binder" },
    { mode: "grid" as ViewMode, icon: LayoutGrid, label: "Grid" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-12 py-5 border-b border-border">
        <img src="/logo.svg" alt="collected" className="h-7" />
        <div className="flex-1 mx-8">
          <input
            type="text"
            placeholder="Search..."
            className="w-full max-w-md bg-secondary rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-foreground/30"
          />
        </div>
        <div className="w-[34px]" />
      </header>

      <div className="px-12 py-6">
        <button
          onClick={() => navigate("/pokemon/shelf")}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          Pokémon
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-page-title text-foreground">Pokémon</h1>
            <p className="text-body text-muted-foreground mt-1">
              {cards?.length ?? 0} card{cards?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center bg-secondary rounded-md p-0.5">
            {viewButtons.map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors
                  ${viewMode === mode ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {(cards ?? []).length === 0 ? (
          <div className="text-body text-muted-foreground py-12 text-center">
            No cards yet.
          </div>
        ) : viewMode === "binder" ? (
          <PokemonBinderView cards={cards ?? []} />
        ) : (
          <PokemonGridView cards={cards ?? []} />
        )}
      </div>
    </div>
  );
}

function PokemonBinderView({ cards }: { cards: any[] }) {
  const [page, setPage] = useState(0);
  const slotsPerSpread = 18;
  const totalSpreads = Math.max(1, Math.ceil(cards.length / slotsPerSpread));
  const start = page * slotsPerSpread;
  const leftCards = cards.slice(start, start + 9);
  const rightCards = cards.slice(start + 9, start + 18);

  const renderSlot = (card: any | undefined, idx: number) => {
    if (!card) {
      return (
        <div
          key={`empty-${idx}`}
          className="aspect-[2.5/3.5] rounded-lg bg-secondary"
        />
      );
    }
    return (
      <div
        key={card.id}
        className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative"
      >
        {card.image_front ? (
          <img
            src={card.image_front}
            alt={card.name ?? ""}
            className="absolute inset-0 w-full h-full object-cover"
          />
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
            {Arr
