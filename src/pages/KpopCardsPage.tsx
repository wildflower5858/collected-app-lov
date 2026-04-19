import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Grid3X3, LayoutGrid, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";

type ViewMode = "binder" | "grid";

export default function KpopCardsPage() {
  const { binderId } = useParams<{ binderId: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("binder");

  const { data: binder } = useQuery({
    queryKey: ["kpop-binder", binderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("binders")
        .select("*, groups(name)")
        .eq("id", binderId!)
        .single();
      return data;
    },
  });

  const { data: cards } = useQuery({
    queryKey: ["kpop-cards", binderId],
    queryFn: async () => {
      const { data } = await supabase
        .from("kpop_cards")
        .select("*")
        .eq("binder_id", binderId!)
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-body text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} />
          {binder?.groups?.name ?? "K-Pop"}
        </button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-page-title text-foreground">{binder?.name ?? ""}</h1>
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
          <KpopBinderView cards={cards ?? []} />
        ) : (
          <KpopGridView cards={cards ?? []} />
        )}
      </div>
    </div>
  );
}

function KpopBinderView({ cards }: { cards: any[] }) {
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
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronLeftIcon size={18} />
        </button>
        <span className="text-[12px] text-muted-foreground">
          {page + 1} / {totalSpreads}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalSpreads - 1, p + 1))}
          disabled={page >= totalSpreads - 1}
          className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors"
        >
          <ChevronRightIcon size={18} />
        </button>
      </div>
    </div>
  );
}

function KpopGridView({ cards }: { cards: any[] }) {
  return (
    <div className="grid grid-cols-4 gap-5 px-5">
      {cards.map((card) => (
        <div key={card.id} className="flex flex-col">
          <div className="aspect-[2.5/3.5] rounded-lg overflow-hidden relative bg-secondary">
            {card.image_front ? (
              <img
                src={card.image_front}
                alt={card.name ?? ""}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          <div className="mt-2 text-[13px] font-medium text-foreground truncate">
            {card.name}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {card.type}
          </div>
        </div>
      ))}
    </div>
  );
}